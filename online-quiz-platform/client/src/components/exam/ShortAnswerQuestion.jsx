import React from 'react';
import { Input } from '../common/UI';

const ShortAnswerQuestion = ({ question, value, onChange }) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-slate-800 leading-relaxed">
          {question.question_text}
        </h3>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Your Answer</p>
        <Input 
          placeholder="Type your response here..."
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="text-lg font-medium h-14 border-2 focus:ring-4"
        />
        <p className="mt-4 text-xs text-slate-400 italic">
          Tip: Ensure your answer is concise and matches the expected format.
        </p>
      </div>
    </div>
  );
};

export default ShortAnswerQuestion;
