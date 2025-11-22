import { API_BASE_URL, LOCAL_STORAGE_KEY, OFFLINE_STORAGE_KEY, COLORS_LIST } from '../constants';
import { VoteCounts, ColorId, UserState } from '../types';

// --- SERVICE METHODS ---

/**
 * Gets the user's local state (if they already voted)
 */
export const getUserState = (): UserState => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return { hasVoted: false, assignedColorId: null, timestamp: null };
};

/**
 * Saves user state to local storage
 */
const saveUserState = (colorId: ColorId) => {
  const newState: UserState = {
    hasVoted: true,
    assignedColorId: colorId,
    timestamp: Date.now(),
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
  return newState;
};

/**
 * Resets user state (allows voting again)
 */
export const resetUserState = (): UserState => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  return { hasVoted: false, assignedColorId: null, timestamp: null };
};

// --- OFFLINE / FALLBACK LOGIC ---

const getOfflineCounts = (): VoteCounts => {
  const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with zeros
  const initial: VoteCounts = {};
  COLORS_LIST.forEach(c => initial[c.id] = 0);
  return initial;
};

const saveOfflineCounts = (counts: VoteCounts) => {
  localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(counts));
};

const offlineAssignColor = async (): Promise<ColorId> => {
  console.log("Using offline local logic for color assignment.");
  
  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 500));

  const counts = getOfflineCounts();
  
  // Balance Logic (Same as server)
  let min = Infinity;
  const keys = Object.keys(counts);
  keys.forEach(key => {
    const val = counts[key] || 0;
    if (val < min) min = val;
  });

  const candidates = keys.filter(key => (counts[key] || 0) === min);
  
  // Fallback if somehow empty (shouldn't happen)
  if (candidates.length === 0) {
      const randomId = COLORS_LIST[Math.floor(Math.random() * COLORS_LIST.length)].id;
      counts[randomId] = (counts[randomId] || 0) + 1;
      saveOfflineCounts(counts);
      saveUserState(randomId);
      return randomId;
  }

  const selectedId = candidates[Math.floor(Math.random() * candidates.length)] as ColorId;

  // Update offline counts
  counts[selectedId] = (counts[selectedId] || 0) + 1;
  saveOfflineCounts(counts);

  saveUserState(selectedId);
  return selectedId;
};

// --- MAIN METHODS ---

/**
 * Subscribe to real-time vote updates using Server-Sent Events (SSE)
 * Falls back to polling localStorage if server is down.
 */
export const subscribeToVotes = (callback: (counts: VoteCounts) => void): () => void => {
  let eventSource: EventSource | null = null;
  let offlineInterval: any = null;

  // Helper to start offline polling
  const startOfflinePolling = () => {
    if (offlineInterval) return; // Already polling
    
    // Send immediate initial data
    callback(getOfflineCounts());
    
    // Poll localStorage every 2 seconds (supports multi-tab in offline mode)
    offlineInterval = setInterval(() => {
      callback(getOfflineCounts());
    }, 2000);
  };

  try {
    // Try to connect to server
    eventSource = new EventSource(`${API_BASE_URL}/api/events`);

    eventSource.onopen = () => {
       // Connection successful
       if (offlineInterval) {
         clearInterval(offlineInterval);
         offlineInterval = null;
       }
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        // Silent fail on parse error
      }
    };

    eventSource.onerror = (error) => {
      // Standard behavior: if server is down, switch to offline
      // Don't console.error too loudly to avoid scaring the user
      if (eventSource && eventSource.readyState === EventSource.CLOSED) {
         // Closed
      } else {
         // Error state
         if (eventSource) eventSource.close();
      }
      startOfflinePolling();
    };

  } catch (e) {
    startOfflinePolling();
  }

  // Return cleanup function
  return () => {
    if (eventSource) eventSource.close();
    if (offlineInterval) clearInterval(offlineInterval);
  };
};

/**
 * Request the server to assign a balanced color
 */
export const assignColor = async (): Promise<ColorId> => {
  try {
    // Attempt to fetch from server with a short timeout
    // If server doesn't respond quickly, we assume offline/down
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout

    const response = await fetch(`${API_BASE_URL}/api/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Server responded with error (e.g. 500), switch to offline
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.assignedColor) {
      throw new Error("Server did not return an assigned color");
    }

    saveUserState(data.assignedColor);
    return data.assignedColor;
  } catch (error) {
    // This catch block handles network errors, timeouts, and CORS failures
    // We quietly fallback to offline logic
    console.warn("Server unreachable or failed, using offline logic."); 
    return offlineAssignColor();
  }
};