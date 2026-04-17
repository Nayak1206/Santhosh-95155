import React from 'react';
import { Button } from '../common/UI';

const QuestionPalette = ({ questions, currentIdx, answers, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm sticky top-24">
      <h3 className="font-bold text-slate-800 mb-4">Question Palette</h3>
      <div className="grid grid-cols-5 gap-3">
        {questions.map((q, idx) => {
          const isAnswered = answers.some(a => a.question_id === q.id && a.student_answer?.trim());
          const isCurrent = currentIdx === idx;
          
          return (
            <button
              key={q.id}
              onClick={() => onSelect(idx)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                isCurrent 
                ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                : isAnswered 
                ? 'bg-green-500 text-white' 
                : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
      
      <div className="mt-8 space-y-3 pt-6 border-t border-slate-50">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
          <div className="w-4 h-4 rounded bg-blue-600"></div>
          <span>Current</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
          <div className="w-4 h-4 rounded bg-slate-100 border border-slate-200"></div>
          <span>Not Visited</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionPalette;
