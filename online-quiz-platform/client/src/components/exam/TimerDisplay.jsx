import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

const TimerDisplay = ({ initialSeconds, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (initialSeconds !== null && initialSeconds !== undefined) {
      setTimeLeft(initialSeconds);
    }
  }, [initialSeconds]);

  useEffect(() => {
    // Only run the timer logic if timeLeft is a positive number
    if (timeLeft === null || timeLeft === undefined) return;
    
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = timeLeft < 300; // < 5 minutes

  return (
    <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-md transition-all duration-300 ${
      isWarning ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-white text-slate-700'
    }`}>
      <Clock size={20} className={isWarning ? 'animate-bounce' : ''} />
      <span className="text-xl font-mono font-bold">
        {formatTime(timeLeft)}
      </span>
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Remaining</span>
    </div>
  );
};

export default TimerDisplay;
