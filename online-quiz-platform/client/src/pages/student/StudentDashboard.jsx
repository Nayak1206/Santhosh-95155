import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { getExams } from '../../api/examApi';
import { getMyAttempts } from '../../api/attemptApi';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Trophy, Clock, ChevronRight, Rocket, Target, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Badge, Spinner, Button } from '../../components/common/UI';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeExams, setActiveExams] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashData = async () => {
      try {
        const [examsRes, attemptsRes] = await Promise.all([getExams(), getMyAttempts()]);
        const allExams = examsRes.data || [];
        
        const active = [];
        const upcoming = [];

        allExams.forEach(exam => {
          const start = new Date(exam.start_time);
          const end = new Date(exam.end_time);
          const currentTime = new Date();

          if (currentTime >= start && currentTime <= end) {
            active.push(exam);
          } else if (currentTime < start) {
            upcoming.push(exam);
          }
        });
        
        setActiveExams(active);
        setUpcomingExams(upcoming);
        setAttempts(attemptsRes.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashData();
  }, [now.getHours()]); // Refetch minimally or on explicit triggers

  const avgScore = attempts.length 
    ? Math.round(attempts.reduce((acc, curr) => acc + (curr.total_marks > 0 ? (curr.score / curr.total_marks * 100) : 0), 0) / attempts.length) 
    : 0;

  const stats = [
    { label: 'Completed', value: attempts.length, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Skill Grade', value: `${avgScore}%`, icon: Trophy, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Live Exams', value: activeExams.length, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Upcoming', value: upcomingExams.length, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <Layout title={`Dashboard`}>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                 <Badge className="bg-white/20 text-white border-none py-1 px-3">Student Portal</Badge>
                 <span className="text-white/60 text-sm font-medium italic">Welcome back, {user?.name?.split(' ')[0] || 'Student'}!</span>
              </div>
              <h2 className="text-4xl font-black mb-4 tracking-tight">Master your skills. <br/> Conquer every challenge.</h2>
              <p className="text-white/80 max-w-md font-medium leading-relaxed mb-8">
                Your examination center is ready. Check available assessments and review your performance analytics.
              </p>
              <Link to="/exams">
                <Button variant="outline" className="bg-white border-none !text-green-600 hover:bg-emerald-50 !rounded-2xl px-10 h-14 font-black shadow-2xl flex items-center gap-4 active:scale-95 transition-all group">
                   <Rocket size={24} className="text-green-500 group-hover:animate-bounce" />
                   <span className="text-green-600 text-lg">
                     {activeExams.length > 0 ? `Take One of ${activeExams.length} Active Exams` : 'No Active Exams Available'}
                   </span>
                   <ChevronRight size={20} className="text-green-300 group-hover:translate-x-1 transition-transform ml-auto" />
                </Button>
              </Link>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((s) => (
            <Card key={s.label} className="border-none shadow-sm flex items-center gap-6 p-6 group hover:shadow-md transition-all">
              <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <s.icon size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{s.label}</p>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{s.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick List: Exams */}
          <Card className="border-none shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold text-slate-800">Available Exams</h3>
               <Link to="/exams" className="text-green-600 text-xs font-bold hover:underline">View Repository</Link>
            </div>
            
            <div className="space-y-4 flex-1">
              {activeExams.slice(0, 3).map(exam => (
                <div key={exam.id} className="p-5 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-green-500 shadow-sm transition-colors">
                        <BookOpen size={20} />
                     </div>
                     <div>
                        <h4 className="font-bold text-slate-700 text-sm group-hover:text-slate-900 transition-colors">{exam.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Clock size={12} /> {exam.duration_minutes} Mins
                           </span>
                        </div>
                     </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-200 group-hover:text-green-500 translate-x-0 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
              {activeExams.length === 0 && (
                <div className="text-center py-10 italic text-slate-400 text-sm">No new exams released yet.</div>
              )}
            </div>
          </Card>

          {/* Quick List: Recent Results */}
          <Card className="border-none shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold text-slate-800">Recent Performance</h3>
               <Link to="/history" className="text-blue-600 text-xs font-bold hover:underline">Full History</Link>
            </div>

            <div className="space-y-6 flex-1">
              {attempts.slice(0, 3).map(attempt => {
                const perc = Math.round(attempt.score / (attempt.total_marks || 1) * 100);
                return (
                  <div key={attempt.id} className="flex items-center gap-5 group">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border-2 ${
                      perc >= 50 ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
                    }`}>
                      {perc}%
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-700 text-sm">{attempt.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {new Date(attempt.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <Link to={`/exam/${attempt.id}/result`}>
                      <ChevronRight size={18} className="text-slate-300 hover:text-blue-500 transition-colors" />
                    </Link>
                  </div>
                );
              })}
              {attempts.length === 0 && (
                <div className="text-center py-10 italic text-slate-400 text-sm">You haven't attempted any exams yet.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
