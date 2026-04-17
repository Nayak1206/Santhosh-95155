import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Layout from '../../components/common/Layout';
import { Button, Badge, Card, Spinner } from '../../components/common/UI';
import { CheckCircle, XCircle, Trophy, Clock, ChevronDown, ChevronUp, ArrowLeft, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DetailedResult = () => {
  const { attemptId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axiosInstance.get(`/attempts/${attemptId}/result`);
        setData(res.data);
      } catch (error) {
        toast.error('Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Spinner size="lg" />
      <p className="mt-4 text-slate-500 font-medium tracking-widest text-xs uppercase">Fetching student answer sheet...</p>
    </div>
  );

  if (!data) return (
    <Layout title="Result Not Found">
      <div className="text-center py-20">
        <XCircle size={64} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Answer sheet reference invalid</h2>
        <Link to="/admin/exams" className="text-blue-600 font-bold hover:underline mt-4 inline-block tracking-tight text-sm">Return to Management</Link>
      </div>
    </Layout>
  );

  const { attempt, questions } = data;
  const percentage = Math.round((attempt.score / attempt.total_marks) * 100);
  const isPassed = percentage >= (attempt.passing_score || 50);

  const getOptionText = (optionsJson, label) => {
    if (!optionsJson) return label;
    try {
      const options = JSON.parse(optionsJson);
      const idx = label.charCodeAt(0) - 65;
      return options[idx] || label;
    } catch {
      return label;
    }
  };

  return (
    <Layout title="Detailed Performance Review">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase hover:text-slate-600 transition-colors">
               <ArrowLeft size={16} /> Back to Submissions
            </button>
            <Button variant="outline" onClick={() => window.print()} className="h-10 px-6 rounded-xl border-slate-200">
               <Printer size={18} /> Print Record
            </Button>
        </div>

        {/* Summary Header */}
        <Card className="p-10 border-none shadow-sm relative overflow-hidden bg-white rounded-[2.5rem]">
           <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32"></div>
           
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1 flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl mb-4 shadow-xl">
                    {attempt.student_name?.[0]}
                 </div>
                 <h2 className="text-lg font-extrabold text-slate-800 leading-tight mb-1">{attempt.student_name}</h2>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{attempt.student_email}</p>
              </div>

              <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col justify-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 mb-1">Raw Score</span>
                    <p className="text-2xl font-black text-slate-800">{attempt.score} <span className="text-xs text-slate-300">/ {attempt.total_marks}</span></p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col justify-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 mb-1">Percentage</span>
                    <p className={`text-2xl font-black ${isPassed ? 'text-green-600' : 'text-red-600'}`}>{percentage}%</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col justify-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 mb-1">Efficiency</span>
                    <p className="text-2xl font-black text-slate-800 uppercase text-sm">
                       {Math.floor(attempt.time_taken_seconds / 60)}m {attempt.time_taken_seconds % 60}s
                    </p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center">
                    <Badge variant={isPassed ? 'green' : 'red'} className="py-2 px-6 rounded-full text-[10px] tracking-widest font-black uppercase">
                       {isPassed ? 'Accredited' : 'Dismissed'}
                    </Badge>
                 </div>
              </div>
           </div>
        </Card>

        {/* Evaluation Details */}
        <div className="space-y-6 pt-4">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Question Execution Map</h3>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span className="text-[10px] font-black uppercase text-slate-400">Correct: {questions.filter(q => q.is_correct).length}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <span className="text-[10px] font-black uppercase text-slate-400">Incorrect: {questions.filter(q => !q.is_correct).length}</span>
                 </div>
              </div>
           </div>

           {questions.map((q, idx) => (
             <Card key={q.id} className="group border-none shadow-sm overflow-hidden transition-all bg-white rounded-[2rem]">
               <div 
                 className="flex items-center gap-6 cursor-pointer p-8 hover:bg-slate-50 transition-colors"
                 onClick={() => toggleExpand(q.id)}
               >
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border-2 ${
                   q.is_correct ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
                 }`}>
                   {idx + 1}
                 </div>
                 
                 <div className="flex-1">
                   <h4 className="font-extrabold text-slate-800 leading-snug mb-1">{q.question_text}</h4>
                   <div className="flex items-center gap-4">
                     <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${q.is_correct ? 'text-green-500' : 'text-red-500'}`}>
                       {q.is_correct ? 'Fully Accurate' : 'Inaccurate Response'}
                     </span>
                     <span className="text-[10px] font-bold text-slate-300 border-l border-slate-100 pl-4 uppercase tracking-widest">
                       Awarded: {q.marks_awarded} Points
                     </span>
                   </div>
                 </div>

                 <div className="w-10 h-10 border border-slate-100 rounded-xl flex items-center justify-center text-slate-200 group-hover:text-slate-400 transition-colors">
                   {expanded[q.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                 </div>
               </div>

               {expanded[q.id] && (
                 <div className="px-8 pb-8 space-y-6 animate-in slide-in-from-top-4 duration-500">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                     <div className="p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Submitted Value</span>
                       <p className={`font-bold text-sm ${q.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                         {q.question_type === 'mcq' ? getOptionText(q.options, q.student_answer) : (q.student_answer || '<Empty>')}
                       </p>
                     </div>
                     <div className="p-6 bg-green-50/30 rounded-[1.5rem] border border-green-100 flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-green-400 mb-3">Target Standard</span>
                       <p className="font-bold text-sm text-green-700">
                         {q.question_type === 'mcq' ? getOptionText(q.options, q.correct_answer) : q.correct_answer}
                       </p>
                     </div>
                   </div>

                   {q.explanation && (
                     <div className="p-6 bg-blue-50/30 rounded-[1.5rem] border border-blue-100/50">
                       <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2 flex items-center gap-2">
                          <Trophy size={14} /> Official Explanation
                       </p>
                       <p className="text-sm font-medium text-blue-800 leading-relaxed italic">
                         {q.explanation}
                       </p>
                     </div>
                   )}
                 </div>
               )}
             </Card>
           ))}
        </div>
      </div>
    </Layout>
  );
};

export default DetailedResult;
