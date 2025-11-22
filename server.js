const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'db.json');

// Enable CORS manually to avoid 'cors' package dependency
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.json());

// Initialize Database if it doesn't exist
const initializeDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      red: 0,
      blue: 0,
      green: 0,
      yellow: 0,
      purple: 0,
      orange: 0
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    console.log('Created new db.json');
  }
};

initializeDb();

// --- Helper Functions ---

const readDb = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading DB:", err);
    return {};
  }
};

const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing DB:", err);
  }
};

// --- Real-time Logic (SSE) ---

let clients = [];

const broadcastUpdates = (data) => {
  clients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};

// Endpoint for clients to listen for updates
app.get('/api/events', (req, res) => {
  // SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Ensure headers are sent immediately

  // Send current state immediately
  const currentData = readDb();
  res.write(`data: ${JSON.stringify(currentData)}\n\n`);

  // Add client to list
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };
  clients.push(newClient);

  // Remove client on close
  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

// --- Voting Logic ---

app.get('/api/votes', (req, res) => {
  res.json(readDb());
});

app.post('/api/vote', (req, res) => {
  const currentCounts = readDb();
  const colorKeys = Object.keys(currentCounts);

  // 1. Find minimum count
  let minCount = Infinity;
  colorKeys.forEach(key => {
    if (currentCounts[key] < minCount) {
      minCount = currentCounts[key];
    }
  });

  // 2. Find candidates (colors with the minimum count)
  const candidates = colorKeys.filter(key => currentCounts[key] === minCount);

  // 3. Randomly select one candidate
  const selectedColor = candidates[Math.floor(Math.random() * candidates.length)];

  // 4. Update DB
  if (currentCounts[selectedColor] !== undefined) {
     currentCounts[selectedColor] += 1;
  }
  writeDb(currentCounts);

  // 5. Broadcast update
  broadcastUpdates(currentCounts);

  // 6. Respond to user
  res.json({ assignedColor: selectedColor });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/vote`);
  console.log(`Real-time stream: http://localhost:${PORT}/api/events`);
});