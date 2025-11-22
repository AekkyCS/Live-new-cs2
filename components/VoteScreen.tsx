import React, { useState, useEffect } from 'react';
import { TEAM_COLORS } from '../constants';
import { assignColor, getUserState, resetUserState } from '../services/voteService';
import { UserState, ColorId } from '../types';

const VoteScreen: React.FC = () => {
  const [userState, setUserState] = useState<UserState>({ hasVoted: false, assignedColorId: null, timestamp: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const current = getUserState();
    setUserState(current);
    if (current.hasVoted) {
      setShowResult(true);
    }
  }, []);

  const handleRandomize = async () => {
    if (isLoading || userState.hasVoted) return;

    setIsLoading(true);
    setError(null);

    try {
      const colorId = await assignColor();
      
      if (!colorId) throw new Error("No color returned");

      setUserState({
        hasVoted: true,
        assignedColorId: colorId,
        timestamp: Date.now()
      });
      setShowResult(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPerson = () => {
    // Reset state for the next person in line
    const newState = resetUserState();
    setUserState(newState);
    setShowResult(false);
  };

  const renderResult = () => {
    if (!userState.assignedColorId) return null;
    const color = TEAM_COLORS[userState.assignedColorId];

    return (
      <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 w-full max-w-md mx-auto">
        <h2 className="text-2xl font-light text-gray-500 mb-6">You belong to</h2>
        
        <div 
          className="relative w-64 h-64 rounded-full flex items-center justify-center shadow-2xl mb-10 transition-transform hover:scale-105"
          style={{ backgroundColor: color.hex }}
        >
           <div className="absolute inset-0 rounded-full border-8 border-white opacity-20 animate-pulse"></div>
           <span className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md text-center px-4 leading-tight">
             {color.name}
           </span>
        </div>

        {/* Big Next Button for Continuous Flow */}
        <button 
          onClick={handleNextPerson}
          className="w-full max-w-xs bg-white border-2 border-gray-100 text-gray-800 hover:border-primary hover:text-primary hover:shadow-xl active:scale-95 font-bold text-xl py-4 px-8 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-3 group"
        >
          <span>Next Person</span>
          <span className="text-base font-normal text-gray-400 group-hover:text-primary/70">(คนถัดไป)</span>
          <span className="text-2xl group-hover:translate-x-1 transition-transform">➡️</span>
        </button>
      </div>
    );
  };

  const renderButton = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="mb-10 text-center space-y-3">
         <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary py-2 tracking-tight">
            Color Sorter
         </h1>
         <p className="text-gray-400 text-xl">Freshman Orientation</p>
      </div>

      <button
        onClick={handleRandomize}
        disabled={isLoading}
        className={`
          group relative w-56 h-56 md:w-64 md:h-64 rounded-full bg-white border-[12px] border-gray-50 shadow-2xl
          flex flex-col items-center justify-center
          transition-all duration-300
          ${isLoading ? 'scale-95 opacity-80 cursor-not-allowed' : 'hover:scale-105 hover:border-secondary/20 hover:shadow-primary/20 active:scale-95 cursor-pointer'}
        `}
      >
        {isLoading ? (
           <div className="flex flex-col items-center gap-3">
             <div className="w-16 h-16 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
             <span className="text-sm font-medium text-gray-400 animate-pulse">Sorting...</span>
           </div>
        ) : (
          <>
            <span className="text-6xl mb-3 group-hover:scale-110 transition-transform duration-300">🎲</span>
            <span className="text-2xl font-bold text-gray-700 group-hover:text-secondary tracking-wide">START</span>
            <span className="text-sm text-gray-400 font-normal mt-1">(กดเพื่อสุ่มสี)</span>
          </>
        )}
      </button>

      {error && (
        <p className="mt-8 text-red-500 bg-red-50 px-6 py-3 rounded-xl animate-bounce border border-red-100 shadow-sm">
          {error}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6 w-full">
      {showResult ? renderResult() : renderButton()}
    </div>
  );
};

export default VoteScreen;