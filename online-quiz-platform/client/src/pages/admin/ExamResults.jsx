import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { getExamSubmissions, grantRetake } from '../../api/adminApi';
import { toast } from 'react-hot-toast';
import { ClipboardCheck, RotateCcw, User, Mail, Calendar, CheckCircle, XCircle, FileSearch, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { Button, Badge, Card, Spinner } from '../../components/common/UI';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axiosInstance from '../../api/axiosInstance';

const ExamResults = () => {
  const { id: examId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [subRes, statsRes] = await Promise.all([
        getExamSubmissions(examId),
        axiosInstance.get(`/exams/${examId}/stats`)
      ]);
      setSubmissions(subRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Failed to load analytical data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [examId]);

  const handleGrantRetake = async (studentId) => {
    try {
      await grantRetake(examId, studentId);
      toast.success('Retake permission granted');
      fetchData();
    } catch (error) {
      toast.error('Failed to grant retake');
    }
  };

  return (
    <Layout title="Platform Analytics & Submissions">
      <div className="space-y-10 pb-20">
        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Quick Insights Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="bg-white p-6 rounded-[2rem] border-none shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                     <TrendingUp size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Avg. Score</p>
                     <h4 className="text-xl font-black text-slate-800">{stats?.average_percentage || 0}%</h4>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-[2rem] border-none shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
                     <CheckCircle size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Passing Rate</p>
                     <h4 className="text-xl font-black text-slate-800">
                        {stats?.score_distribution ? 
                          Math.round((((stats.score_distribution[3]?.count || 0) + (stats.score_distribution[4]?.count || 0)) / (stats.total_submissions || 1)) * 100) 
                          : 0}%
                     </h4>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-[2rem] border-none shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
                     <ClipboardCheck size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Submissions</p>
                     <h4 className="text-xl font-black text-slate-800">{stats?.total_submissions || 0}</h4>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-[2rem] border-none shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                     <Clock size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Toughest Q</p>
                     <h4 className="text-sm font-black text-slate-800 truncate max-w-[120px]">
                        {stats?.question_accuracy?.[0]?.question_text || 'Ready'}
                     </h4>
                  </div>
               </div>
            </div>

            {/* Analytics Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Score Distribution Chart */}
               <Card className="lg:col-span-2 p-8 border-none shadow-sm bg-white rounded-[2rem] overflow-hidden relative group">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Merit Distribution</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Class percentage spread</p>
                     </div>
                     <TrendingUp className="text-blue-500" size={24} />
                  </div>
                  
                  <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.score_distribution || []}>
                           <XAxis 
                             dataKey="range" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                           />
                           <YAxis hide />
                           <Tooltip 
                             cursor={{fill: '#f8fafc'}}
                             contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                           />
                           <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                               {(stats?.score_distribution || []).map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={index > 2 ? '#22c55e' : '#64748b'} />
                               ))}
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </Card>

               {/* Hardest Questions */}
               <Card className="p-8 border-none shadow-sm bg-white rounded-[2rem] relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-black text-slate-800 tracking-tight">Toughest Challenges</h3>
                     <AlertTriangle className="text-red-500" size={20} />
                  </div>
                  
                  <div className="space-y-4">
                     {stats?.question_accuracy?.slice(0, 3).map((q, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                           <p className="text-xs font-bold text-slate-800 line-clamp-2 mb-2 leading-relaxed">{q.question_text}</p>
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-red-500 bg-red-50 px-2 py-0.5 rounded">Low Accuracy</span>
                              <span className="text-[10px] font-black text-slate-400">{Math.round((q.correct_count/q.attempts)*100)}% Success</span>
                           </div>
                        </div>
                     ))}
                     {(!stats?.question_accuracy || stats.question_accuracy.length === 0) && (
                       <p className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">No detailed logs</p>
                     )}
                  </div>
               </Card>
            </div>

            {/* Submissions Table Section */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-4">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Raw Submissions</h3>
                  <Badge variant="slate" className="font-black text-[10px] tracking-widest">{submissions.length} Total Logs</Badge>
               </div>

               <Card className="overflow-hidden p-0 border-none shadow-sm bg-white rounded-[2rem] overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50/50 border-b border-slate-100">
                     <tr>
                       <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Identity</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Proficiency</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Submission Date</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {submissions.map((sub) => {
                       const perc = (sub.score / sub.total_marks) * 100;
                       return (
                         <tr key={sub.id} className="hover:bg-slate-50/30 transition-colors group">
                           <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-lg border-2 border-white shadow-sm group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                 {sub.student_name ? sub.student_name[0] : '?'}
                               </div>
                               <div>
                                 <p className="font-black text-slate-800 text-sm leading-tight">{sub.student_name || 'Anonymous Student'}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sub.student_email || 'No email provided'}</p>
                               </div>
                             </div>
                           </td>
                           <td className="px-8 py-6">
                             <div className="flex flex-col items-center gap-1.5">
                                <span className="font-black text-slate-800 text-lg leading-none">{sub.score} <span className="text-[10px] text-slate-300">/ {sub.total_marks}</span></span>
                                <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                                   <div 
                                     className={`h-full rounded-full ${perc >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                                     style={{ width: `${perc}%` }}
                                   ></div>
                                </div>
                             </div>
                           </td>
                           <td className="px-8 py-6">
                             <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">
                               {sub.submitted_at ? format(new Date(sub.submitted_at), 'MMM dd, HH:mm') : 'N/A'}
                             </p>
                           </td>
                           <td className="px-8 py-6">
                             {sub.has_retake > 0 ? (
                               <Badge variant="blue" className="rounded-lg text-[9px] font-black uppercase tracking-widest">Retake Granted</Badge>
                             ) : (
                               <Badge variant={perc >= 50 ? 'green' : 'red'} className="rounded-lg text-[9px] font-black uppercase tracking-widest">
                                 {perc >= 50 ? 'Accredited' : 'Dismissed'}
                               </Badge>
                             )}
                           </td>
                           <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                               <Link to={`/admin/exams/results/${sub.id}`}>
                                 <Button variant="outline" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-100 hover:bg-blue-50">
                                   <FileSearch size={14} /> Review
                                 </Button>
                               </Link>
                               <Button 
                                 onClick={() => handleGrantRetake(sub.student_id)}
                                 variant={sub.has_retake > 0 ? 'slate' : 'ghost'} 
                                 className="h-10 w-10 p-0 rounded-xl hover:bg-slate-50 transition-all text-slate-400"
                                 disabled={sub.has_retake > 0}
                                 title="Grant Retake"
                               >
                                 <RotateCcw size={16} />
                               </Button>
                             </div>
                           </td>
                         </tr>
                       );
                     })}
                     {submissions.length === 0 && (
                       <tr>
                         <td colSpan="5" className="px-8 py-24 text-center">
                           <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                             <ClipboardCheck size={40} />
                           </div>
                           <h4 className="text-xl font-black text-slate-800 tracking-tight">No Submissions Detected</h4>
                           <p className="text-slate-400 font-medium text-sm mt-1 max-w-xs mx-auto">Information will appear here once students complete their evaluations.</p>
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ExamResults;
