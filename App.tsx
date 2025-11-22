import React from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import VoteScreen from './components/VoteScreen';
import DashboardScreen from './components/DashboardScreen';
import { USE_SIMULATION_MODE } from './constants';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
        {/* Header / Navigation */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
                R
              </div>
              <span className="font-bold text-lg tracking-tight hidden sm:block">RubNong Sorter</span>
            </div>
            
            <nav className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                Get Color
              </NavLink>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => 
                  `px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                Dashboard
              </NavLink>
            </nav>
          </div>
        </header>

        {/* Simulation Mode Warning Banner */}
        {USE_SIMULATION_MODE && (
          <div className="bg-yellow-50 border-b border-yellow-100 p-2 text-center text-xs text-yellow-700">
            <strong>Demo Mode:</strong> Using local simulation. Edit <code>constants.ts</code> to enable Firebase.
          </div>
        )}

        {/* Main Content */}
        <main className="flex-grow relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="relative z-10 h-full">
              <Routes>
                <Route path="/" element={<VoteScreen />} />
                <Route path="/dashboard" element={<DashboardScreen />} />
              </Routes>
            </div>
        </main>

        <footer className="bg-white border-t border-gray-100 py-6 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} RubNong Activity Team.</p>
        </footer>
      </div>
    </HashRouter>
  );
}

export default App;
