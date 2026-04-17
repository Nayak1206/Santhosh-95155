import React from 'react';

const MCQQuestion = ({ question, value, onChange }) => {
  const options = question.options ? JSON.parse(question.options) : [];
  const labels = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-slate-800 leading-relaxed">
          {question.question_text}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {options.map((option, idx) => (
          <label 
            key={idx}
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
              value === labels[idx] 
              ? 'bg-blue-50 border-blue-500 shadow-md ring-4 ring-blue-50' 
              : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
            }`}
          >
            <input 
              type="radio" 
              name={`q-${question.id}`}
              value={labels[idx]}
              checked={value === labels[idx]}
              onChange={() => onChange(labels[idx])}
              className="hidden"
            />
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm ${
              value === labels[idx] ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {labels[idx]}
            </div>
            <span className={`text-lg font-medium ${value === labels[idx] ? 'text-blue-800' : 'text-slate-700'}`}>
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default MCQQuestion;
