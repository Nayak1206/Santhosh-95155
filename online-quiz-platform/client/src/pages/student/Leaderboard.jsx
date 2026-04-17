import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { getExams } from '../../api/examApi';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Award, Trophy, Medal, Search, Filter } from 'lucide-react';
import { Card, Spinner, Badge, Button } from '../../components/common/UI';

const Leaderboard = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const [examsRes, attemptsRes] = await Promise.all([
          getExams({ type: 'all' }),
          axiosInstance.get('/attempts/mine')
        ]);
        
        setExams(examsRes.data);
        
        if (examsRes.data.length > 0) {
          // Default to the last attempted exam if exists
          const lastAttempt = attemptsRes.data?.[0];
          if (lastAttempt && examsRes.data.some(e => e.id === lastAttempt.exam_id)) {
            setSelectedExamId(lastAttempt.exam_id);
          } else {
            setSelectedExamId(examsRes.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch exams');
      }
    };
    fetchExams();
  }, []);

  useEffect(() => {
    if (!selectedExamId) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/leaderboard/${selectedExamId}`);
        setLeaderboard(res.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [selectedExamId]);

  return (
    <Layout title="Leaderboard">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Hall of Fame</h2>
            <p className="text-slate-500 font-medium">Top performers across all examinations.</p>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
             <Filter size={18} className="text-slate-400 ml-3" />
             <select 
               value={selectedExamId}
               onChange={(e) => setSelectedExamId(e.target.value)}
               className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 min-w-[200px] cursor-pointer"
             >
               {exams.map(exam => (
                 <option key={exam.id} value={exam.id}>{exam.title}</option>
               ))}
             </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" color="green" />
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="space-y-6">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pb-8">
              {/* 2nd Place */}
              {leaderboard[1] && (
                <div className="order-2 md:order-1 flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-full bg-slate-200 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                       <span className="text-2xl font-black text-slate-400">{leaderboard[1].student_name[0]}</span>
                    </div>
                    <div className="absolute -bottom-2 right-0 w-8 h-8 rounded-full bg-slate-400 border-4 border-white flex items-center justify-center shadow-lg">
                       <Medal size={14} className="text-white" />
                    </div>
                  </div>
                  <p className="font-black text-slate-700">{leaderboard[1].student_name}</p>
                  <p className="text-sm font-bold text-slate-400 mb-4">{leaderboard[1].score}/{leaderboard[1].total_marks}</p>
                  <div className="w-full bg-white h-24 rounded-t-3xl border-x border-t border-slate-100 shadow-sm flex flex-col items-center justify-center">
                     <span className="text-4xl font-black text-slate-200">#2</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {leaderboard[0] && (
                <div className="order-1 md:order-2 flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="w-28 h-28 rounded-full bg-green-500 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden ring-4 ring-green-100">
                       <span className="text-4xl font-black text-white">{leaderboard[0].student_name[0]}</span>
                    </div>
                    <Award className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500 drop-shadow-lg" size={40} fill="currentColor" />
                    <div className="absolute -bottom-2 right-2 w-10 h-10 rounded-full bg-yellow-400 border-4 border-white flex items-center justify-center shadow-lg">
                       <Trophy size={18} className="text-white" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-slate-800">{leaderboard[0].student_name}</p>
                  <p className="text-sm font-bold text-green-600 mb-6">{leaderboard[0].score}/{leaderboard[0].total_marks}</p>
                  <div className="w-full bg-green-500 h-32 rounded-t-3xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-full bg-white/10 blur-xl"></div>
                     <span className="text-5xl font-black text-white relative z-10">#1</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {leaderboard[2] && (
                <div className="order-3 flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-full bg-orange-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                       <span className="text-2xl font-black text-orange-400">{leaderboard[2].student_name[0]}</span>
                    </div>
                    <div className="absolute -bottom-2 right-0 w-8 h-8 rounded-full bg-orange-400 border-4 border-white flex items-center justify-center shadow-lg">
                       <Medal size={14} className="text-white" />
                    </div>
                  </div>
                  <p className="font-black text-slate-700">{leaderboard[2].student_name}</p>
                  <p className="text-sm font-bold text-slate-400 mb-4">{leaderboard[2].score}/{leaderboard[2].total_marks}</p>
                  <div className="w-full bg-white h-20 rounded-t-3xl border-x border-t border-slate-100 shadow-sm flex flex-col items-center justify-center">
                     <span className="text-3xl font-black text-slate-100">#3</span>
                  </div>
                </div>
              )}
            </div>

            {/* List Table */}
            <Card className="border-none shadow-sm overflow-hidden p-0">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rank</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Score</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Time Taken</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Percentile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboard.map((entry) => (
                    <tr key={entry.id} className={`group hover:bg-slate-50/50 transition-colors ${entry.student_id === user.id ? 'bg-green-50/30' : ''}`}>
                      <td className="px-8 py-5">
                         <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                           entry.rank_position <= 3 ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400'
                         }`}>
                           {entry.rank_position}
                         </span>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400">
                             {entry.student_name[0]}
                           </div>
                           <div>
                             <p className="font-bold text-slate-800 text-sm">
                               {entry.student_name}
                               {entry.student_id === user.id && <Badge className="ml-2 bg-green-500 text-white border-none py-0.5 px-2 text-[8px]">YOU</Badge>}
                             </p>
                           </div>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-center font-black text-slate-800 text-sm">
                        {entry.score} <span className="text-slate-300 font-medium">/ {entry.total_marks}</span>
                      </td>
                      <td className="px-8 py-5 text-center font-bold text-slate-500 text-xs">
                        {Math.floor(entry.time_taken_seconds / 60)}m {entry.time_taken_seconds % 60}s
                      </td>
                      <td className="px-8 py-5 text-right">
                         <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[10px]">
                           {entry.percentile}th Percentile
                         </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
             <Trophy size={48} className="text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold">No results available for this examination yet.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Leaderboard;
