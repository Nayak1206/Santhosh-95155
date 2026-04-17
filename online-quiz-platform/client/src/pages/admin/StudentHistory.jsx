import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { Button, Badge, Card, Spinner } from '../../components/common/UI';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  History, 
  Search, 
  Trophy, 
  BarChart, 
  Calendar, 
  Mail, 
  User, 
  ExternalLink,
  Award,
  Clock
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';

const StudentHistory = () => {
  const { id: studentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await axiosInstance.get(`/students/${studentId}`);
        setData(res.data);
      } catch (error) {
        toast.error('Failed to load student history');
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [studentId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-slate-500 font-bold tracking-widest text-[10px] uppercase">Retrieving Academic Records...</p>
      </div>
    </div>
  );

  if (!data) return (
    <Layout title="Records Error">
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Student Not Found</h2>
        <Link to="/admin/students" className="mt-4 inline-block text-blue-600 font-bold text-sm">Return to Directory</Link>
      </div>
    </Layout>
  );

  const { profile, history } = data;
  const filteredHistory = history.filter(h => h.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const stats = {
    totalExams: history.length,
    passed: history.filter(h => (h.score / h.total_marks) * 100 >= 50).length,
    avgScore: history.length > 0 
      ? Math.round(history.reduce((acc, curr) => acc + (curr.score / curr.total_marks) * 100, 0) / history.length) 
      : 0
  };

  return (
    <Layout title="Student Academic History">
      <div className="space-y-10 pb-20">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link to="/admin/students" className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">
              <ArrowLeft size={16} /> All Students
            </Link>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl shadow-slate-200">
                {profile.name[0]}
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">{profile.name}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                    <Mail size={14} /> {profile.email}
                  </div>
                  <Badge variant="blue" className="text-[10px] font-black uppercase px-3 py-1 bg-blue-50 text-blue-600 border-none">
                    Joined {format(new Date(profile.created_at), 'MMM yyyy')}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-white px-6 py-4 rounded-[1.5rem] shadow-sm flex items-center gap-4 border-none">
              <div className="w-10 h-10 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
                <Trophy size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Pass Rate</p>
                <p className="text-lg font-black text-slate-800 leading-none">{stats.totalExams > 0 ? Math.round((stats.passed/stats.totalExams)*100) : 0}%</p>
              </div>
            </div>
            <div className="bg-white px-6 py-4 rounded-[1.5rem] shadow-sm flex items-center gap-4 border-none">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                <BarChart size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Avg Score</p>
                <p className="text-lg font-black text-slate-800 leading-none">{stats.avgScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Content Area */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border-none">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Search history by examination title..." 
                className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-slate-800 font-bold text-sm focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-300 antialiased"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="slate" className="font-black text-[10px] tracking-widest py-2 px-4">{history.length} EVALUATIONS FOUND</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredHistory.map((attempt) => {
              const perc = (attempt.score / attempt.total_marks) * 100;
              const isPassed = perc >= 50;

              return (
                <Card key={attempt.id} className="group hover:bg-slate-50/50 transition-all duration-300 border-none shadow-sm flex flex-col md:flex-row md:items-center gap-8 p-8 bg-white rounded-[2.5rem] relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full transition-opacity duration-500 ${isPassed ? 'bg-green-50/50 opacity-0 group-hover:opacity-100' : 'bg-red-50/50 opacity-0 group-hover:opacity-100'}`}></div>
                  
                  <div className={`w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center font-black text-lg border-2 shadow-inner relative z-10 ${
                    isPassed ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
                  }`}>
                    <span className="text-2xl leading-none">{Math.round(perc)}%</span>
                    <span className="text-[8px] uppercase tracking-widest mt-1 opacity-60">Success</span>
                  </div>

                  <div className="flex-1 relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                       <h3 className="text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors">{attempt.title}</h3>
                       {perc >= 90 && <Award className="text-amber-400" size={20} />}
                    </div>
                    <div className="flex flex-wrap gap-6 items-center text-xs font-bold text-slate-400">
                      <div className="flex items-center gap-2 uppercase tracking-widest">
                        <Calendar size={14} /> 
                        {format(new Date(attempt.submitted_at || attempt.started_at), 'MMMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-2 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">
                        <Award size={14} className="text-slate-300" /> 
                        Score: {attempt.score} / {attempt.total_marks}
                      </div>
                      <div className="flex items-center gap-2 uppercase tracking-widest">
                        <Clock size={14} /> 
                        {Math.floor(attempt.time_taken_seconds / 60)}m {attempt.time_taken_seconds % 60}s
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-4 items-center md:items-end relative z-10">
                    <Badge variant={isPassed ? 'green' : 'red'} className="rounded-xl px-4 py-1.5 text-[9px] font-black tracking-widest uppercase">
                       {isPassed ? 'Accredited' : 'Resubmit Needed'}
                    </Badge>
                    <Link to={`/admin/exams/results/${attempt.id}`}>
                      <Button variant="outline" className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border-slate-100 hover:border-slate-200 hover:shadow-sm">
                        <ExternalLink size={16} /> Detailed Review
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}

            {filteredHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] shadow-sm border border-slate-50">
                 <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-8 border border-white">
                    <History size={48} />
                 </div>
                 <h4 className="text-2xl font-black text-slate-800 tracking-tight">Search Result Empty</h4>
                 <p className="text-slate-400 font-bold text-sm mt-2 max-w-xs text-center leading-relaxed">No examinations matched your query for this student's history.</p>
                 <Button onClick={() => setSearchTerm('')} variant="ghost" className="mt-8 text-blue-500 font-black text-[10px] uppercase tracking-widest">Clear search filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentHistory;
