import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Layout from '../../components/common/Layout';
import { Button, Badge, Card, Spinner } from '../../components/common/UI';
import { CheckCircle, XCircle, Trophy, Clock, ChevronDown, ChevronUp, Download, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ExamResult = () => {
  const normalize = (val) => val?.toString().trim().toLowerCase() || '';
  const { attemptId } = useParams();
  const [data, setData] = useState(null);
  const [rankData, setRankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axiosInstance.get(`/attempts/${attemptId}/result`);
        setData(res.data);
        
        // Fetch rank
        try {
          const rankRes = await axiosInstance.get(`/leaderboard/${res.data.attempt.exam_id}/my-rank`);
          setRankData(rankRes.data);
        } catch (e) {
          console.log('Rank not available yet');
        }
      } catch (error) {
        toast.error('Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Spinner size="lg" />
      <p className="mt-4 text-slate-500 font-medium">Calculating your final score...</p>
    </div>
  );

  if (!data) return (
    <Layout title="Result Not Found">
      <div className="text-center py-20">
        <XCircle size={64} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">We couldn't find this result</h2>
        <Link to="/history" className="text-green-600 font-bold hover:underline mt-4 inline-block">View your history</Link>
      </div>
    </Layout>
  );

  const { attempt, questions } = data;
  const percentage = Math.round((attempt.score / (attempt.total_marks || 1)) * 100);
  const isPassed = percentage >= attempt.passing_score;

  return (
    <Layout title="Examination Result">
      <div className="max-w-4xl mx-auto space-y-10 print:m-0 print:p-0">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            .sidebar, .navbar, .no-print { display: none !important; }
            .print-only { display: block !important; }
            body { background: white !important; }
            .card { border: 1px solid #e2e8f0 !important; box-shadow: none !important; }
            .layout-main { margin-left: 0 !important; padding: 0 !important; }
          }
        `}} />

        {/* Header Hero Section */}
        <Card className={`relative overflow-hidden border-none shadow-xl ${isPassed ? 'bg-gradient-to-br from-green-500 to-green-700' : 'bg-gradient-to-br from-red-500 to-red-700'} text-white`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center py-6 px-10">
            {rankData && (
              <Badge className="mb-4 bg-white/20 text-white border-none py-1.5 px-4 font-black">
                RANK #{rankData.rank_position} • {rankData.percentile}th PERCENTILE
              </Badge>
            )}
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-white/30 transform hover:scale-110 transition-transform">
              {isPassed ? <CheckCircle size={56} className="text-white" /> : <XCircle size={56} className="text-white" />}
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">
               {isPassed ? 'Victory Scored!' : 'Challenge Unfinished'}
            </h1>
            <p className="text-white/80 font-medium uppercase tracking-[0.2em] text-[10px] pb-8">
              {data.attempt.student_name} • {data.attempt.title}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full pt-8 border-t border-white/20">
              <div>
                <p className="text-3xl font-black">{attempt.score}/{attempt.total_marks}</p>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Score</p>
              </div>
              <div>
                <p className="text-3xl font-black">{percentage}%</p>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Grade</p>
              </div>
              <div>
                <p className="text-3xl font-black">{Math.floor(attempt.time_taken_seconds / 60)}m</p>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Time</p>
              </div>
              <div>
                <Badge className={`${isPassed ? 'bg-white text-green-600' : 'bg-white text-red-600'} border-none px-4 py-1.5 font-black text-sm rounded-lg`}>
                   {isPassed ? 'PASSED' : 'FAILED'}
                </Badge>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Status</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center no-print">
          <Button onClick={handlePrint} variant="outline" className="bg-white px-6">
            <Download size={18} /> Print Result Certificate
          </Button>
          <Button variant="outline" className="bg-white px-6">
            <Share2 size={18} /> Share Result
          </Button>
          <Link to="/exams">
            <Button className="px-10 py-3 shadow-lg shadow-green-200">
              Attempt Other Exams
            </Button>
          </Link>
        </div>

        {/* Question Review Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Detailed Review</h2>
            <div className="flex gap-3">
              <Badge variant="green">{questions.filter(q => q.is_correct).length} Correct</Badge>
              <Badge variant="red">{questions.filter(q => !q.is_correct).length} Incorrect</Badge>
            </div>
          </div>

          {questions.map((q, idx) => (
            <Card key={q.id} className={`group border-none shadow-md overflow-hidden transition-all ${expanded[q.id] ? 'ring-2' : ''} ${q.is_correct ? 'ring-green-100' : 'ring-red-100'}`}>
              <div 
                className="flex items-center gap-6 cursor-pointer p-6 hover:bg-slate-50 transition-colors"
                onClick={() => toggleExpand(q.id)}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${
                  q.is_correct ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {idx + 1}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 line-clamp-1">{q.question_text}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${q.is_correct ? 'text-green-500' : 'text-red-500'}`}>
                      {q.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 border-l border-slate-100 pl-4">
                      {q.marks_awarded} / {q.max_marks} Points
                    </span>
                  </div>
                </div>

                <div className="w-10 h-10 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-slate-500 transition-colors">
                  {expanded[q.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expanded[q.id] && (
                <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    {q.question_type === 'mcq' && q.options ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {JSON.parse(q.options).map((opt, i) => {
                          const label = String.fromCharCode(65 + i);
                          
                          const isCorrectOption = normalize(label) === normalize(q.correct_answer) || normalize(opt) === normalize(q.correct_answer);
                          const isSelectedOption = normalize(label) === normalize(q.student_answer) || normalize(opt) === normalize(q.student_answer);
                          const isIncorrect = !q.is_correct;

                          let cardStyle = "bg-white border-slate-100 text-slate-600";
                          if (isCorrectOption) {
                            cardStyle = "bg-green-50 border-green-200 text-green-700 ring-1 ring-green-100";
                          } else if (isSelectedOption && isIncorrect) {
                            cardStyle = "bg-red-50 border-red-200 text-red-700 ring-1 ring-red-100";
                          }
                          
                          return (
                            <div key={i} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${cardStyle}`}>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isCorrectOption ? 'bg-green-600 text-white' : 
                                (isSelectedOption && isIncorrect) ? 'bg-red-600 text-white' : 
                                'bg-slate-100 text-slate-500'
                              }`}>
                                {label}
                              </div>
                              <span className="font-medium text-sm flex-1">{opt}</span>
                              {isCorrectOption && <CheckCircle size={16} className="text-green-500" />}
                              {(isSelectedOption && isIncorrect) && <XCircle size={16} className="text-red-500" />}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Your Answer</span>
                          <p className={`font-bold ${q.is_correct ? 'text-green-600' : (q.student_answer ? 'text-red-600' : 'text-slate-400')}`}>
                            {q.student_answer ? q.student_answer : 'Not Attempted'}
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-green-400 mb-2">Correct Answer</span>
                          <p className="font-bold text-green-700">
                            {q.correct_answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {q.explanation && (
                    <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="text-blue-500" size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Explanation</span>
                      </div>
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

export default ExamResult;
