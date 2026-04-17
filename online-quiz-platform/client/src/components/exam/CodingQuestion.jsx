import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle2, Terminal } from 'lucide-react';
import { Button, Badge, Spinner } from '../common/UI';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';

const CodingQuestion = ({ question, value, onChange }) => {
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [selectedLang, setSelectedLang] = useState(question.language || 'javascript');

  const boilerplates = {
    javascript: '// Node.js Environment\n\nconsole.log("Welcome Student...");\n',
    python: '# Python 3 Environment\n\nprint("Welcome Student...")\n',
    java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your code here\n        System.out.println("Welcome Student...");\n    }\n}'
  };

  const handleRun = async () => {
    setRunning(true);
    setTestResults(null);
    try {
      const res = await axiosInstance.post('/code/run', {
        language: selectedLang,
        code: value || question.starter_code || boilerplates[selectedLang] || '',
        input: ''
      });
      setOutput(res.data);
    } catch (error) {
      toast.error('Failed to run code');
    } finally {
      setRunning(false);
    }
  };

  const handleTest = async () => {
    setRunning(true);
    setOutput(null);
    try {
      const testCases = question.test_cases ? JSON.parse(question.test_cases) : [];
      const res = await axiosInstance.post('/code/test', {
        language: selectedLang,
        code: value || question.starter_code || boilerplates[selectedLang] || '',
        testCases
      });
      setTestResults(res.data);
    } catch (error) {
      toast.error('Failed to run tests');
    } finally {
      setRunning(false);
    }
  };

  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    // Only reset value if it's currently empty or just a boilerplate
    if (!value || Object.values(boilerplates).some(b => b.trim() === value.trim())) {
      onChange(boilerplates[lang]);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'javascript', label: 'JavaScript' },
              { id: 'python', label: 'Python 3' },
              { id: 'java', label: 'Java' }
            ].map(lang => (
              <button
                key={lang.id}
                onClick={() => handleLangChange(lang.id)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${
                  selectedLang === lang.id 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-500'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-100 px-3 py-1 rounded-lg">CODING CHALLENGE</span>
        </div>
        <h3 className="text-xl font-bold text-slate-800 leading-relaxed mt-2">
          {question.question_text}
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm border-t-4 border-t-blue-500 bg-[#1e1e1e]">
            <Editor
              height="400px"
              language={selectedLang === 'python' ? 'python' : selectedLang}
              theme="vs-dark"
              value={value || question.starter_code || boilerplates[selectedLang] || ''}
              onChange={(val) => onChange(val)}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16 }
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleRun} disabled={running} variant="secondary" className="px-6 h-12 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-100">
              {running ? <Spinner size="sm" /> : <Play size={18} />}
              Run Code
            </Button>
            <Button onClick={handleTest} disabled={running} className="px-8 h-12 rounded-2xl bg-green-500 hover:bg-green-600 font-black text-xs uppercase tracking-widest shadow-xl shadow-green-100">
              {running ? <Spinner size="sm" /> : <CheckCircle2 size={18} />}
              Execute Tests
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 rounded-[2rem] p-8 h-[400px] border border-slate-800 shadow-2xl flex flex-col">
            <div className="flex items-center gap-2 text-slate-500 mb-6 pb-4 border-b border-slate-800/50">
              <Terminal size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Output Console</span>
            </div>
            
            <div className="flex-1 overflow-y-auto font-mono text-sm custom-scrollbar">
              {output && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {output.error ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                       <p className="text-red-400 whitespace-pre-wrap leading-relaxed">{output.error}</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-500/5 rounded-2xl border border-green-500/10">
                       <p className="text-green-400 whitespace-pre-wrap leading-relaxed">{output.output || '> Program finished with no output'}</p>
                    </div>
                  )}
                  {output.executionTime && (
                    <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest mt-4">
                      Execution time: {output.executionTime}ms
                    </p>
                  )}
                </div>
              )}

              {testResults && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {testResults.map((res, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${res.passed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Case {idx + 1}</span>
                        {res.passed ? 
                          <Badge variant="green" className="!bg-green-500/20 !text-green-400 border-none px-2 py-0 text-[9px]">Passed</Badge> : 
                          <Badge variant="red" className="!bg-red-500/20 !text-red-400 border-none px-2 py-0 text-[9px]">Failed</Badge>
                        }
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] text-slate-400">Input: <span className="text-slate-200">{res.input || 'None'}</span></p>
                        {!res.passed && (
                          <div className="mt-2 pt-2 border-t border-red-500/10">
                            <p className="text-[11px] text-red-300">Expected: {res.expected}</p>
                            <p className="text-[11px] text-red-400">Actual: {res.actual || '(null)'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!output && !testResults && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                   <Terminal size={40} className="mb-4 text-slate-600" />
                   <p className="text-xs font-bold text-slate-600 uppercase tracking-widest font-mono">Ready for execution</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingQuestion;
