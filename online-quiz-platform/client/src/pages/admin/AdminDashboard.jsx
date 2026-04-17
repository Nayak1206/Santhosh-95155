import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import axiosInstance from '../../api/axiosInstance';
import { Users, BookOpen, ClipboardCheck, Clock, TrendingUp, ChevronRight, PlusCircle, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, Badge, Spinner, Button } from '../../components/common/UI';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ exams: 0, students: 0, submissions: 0, active: 0 });
  const [activityData, setActivityData] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes, upcomingRes, recentRes] = await Promise.all([
          axiosInstance.get('/admin/stats'),
          axiosInstance.get('/admin/activity'),
          axiosInstance.get('/admin/upcoming-exams'),
          axiosInstance.get('/admin/recent-submissions')
        ]);
        setStats(statsRes.data);
        setActivityData(activityRes.data);
        setUpcomingExams(upcomingRes.data || []);
        setRecentSubmissions(recentRes.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard Overview">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Examinations" 
            value={stats.exams} 
            icon={<BookOpen className="text-blue-600" size={24} />}
            color="bg-blue-50"
          />
          <StatCard 
            title="Registered Students" 
            value={stats.students} 
            icon={<Users className="text-purple-600" size={24} />}
            color="bg-purple-50"
          />
          <StatCard 
            title="Total Submissions" 
            value={stats.submissions} 
            icon={<ClipboardCheck className="text-green-600" size={24} />}
            color="bg-green-50"
          />
          <StatCard 
            title="Active Sessions" 
            value={stats.active} 
            icon={<Clock className="text-orange-600" size={24} />}
            color="bg-orange-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <Card className="lg:col-span-2 p-8 shadow-sm border-none bg-white rounded-3xl overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Submission Activity</h3>
                <p className="text-sm text-slate-400 font-medium tracking-tight">Daily student performance trends</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full font-black text-[10px] uppercase tracking-widest">
                <TrendingUp size={14} /> Last 7 Days
              </div>
            </div>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                    dy={10} 
                  />
                  <YAxis 
                    hide 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                    itemStyle={{ color: '#1e293b', fontWeight: 900, fontSize: '14px' }}
                    labelStyle={{ color: '#64748b', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Upcoming Exams Section - Calendar Style */}
          <Card className="p-8 shadow-sm border-none bg-white rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[3rem] -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Exam Calendar</h3>
                <Calendar className="text-blue-500" size={20} />
              </div>
              
              <div className="space-y-6">
                {upcomingExams.length > 0 ? (
                  upcomingExams.map((exam) => {
                    const date = new Date(exam.start_time);
                    return (
                      <div key={exam.id} className="flex gap-4 group/item">
                        <div className="flex flex-col items-center justify-center shrink-0 w-12 h-14 bg-slate-50 rounded-2xl border border-slate-100 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all">
                          <span className="text-[10px] font-black uppercase leading-none mb-1 opacity-60">
                            {format(date, 'MMM')}
                          </span>
                          <span className="text-xl font-black leading-none uppercase">
                            {format(date, 'dd')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <p className="font-extrabold text-slate-800 text-sm truncate group-hover/item:text-blue-600 transition-colors uppercase tracking-tight">{exam.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold flex items-center gap-2 mt-1 uppercase tracking-widest">
                            <Clock size={12} /> {format(date, 'HH:mm')} • {exam.duration_minutes}m
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center text-slate-400">
                    <p className="text-[10px] font-black uppercase tracking-widest">No scheduled events</p>
                  </div>
                )}
                
                <Link to="/admin/exams" className="block w-full pt-4">
                  <Button variant="outline" className="w-full rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] py-5 border-slate-100 hover:bg-slate-50 transition-all shadow-sm">
                    <PlusCircle size={14} /> Schedule New
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Submissions Table */}
        <Card className="p-0 shadow-sm border-none bg-white rounded-3xl overflow-hidden border border-slate-50">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Live Submissions</h3>
              <p className="text-sm text-slate-400 font-medium">Monitoring platform activity in real-time</p>
            </div>
            <Link to="/admin/exams">
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 gap-2 px-6">
                Full Records <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Principal Student</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Examination Subject</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Efficiency</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Verdict</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Time Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentSubmissions.map((sub) => {
                  const percentage = (sub.score / sub.total_marks) * 100;
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-sm border-2 border-white shadow-sm group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                            {sub.student_name ? sub.student_name[0] : '?'}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-800 block text-sm leading-tight">{sub.student_name}</span>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID: {sub.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-bold text-slate-600 text-sm">{sub.exam_title}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-black text-slate-800 text-sm">{percentage.toFixed(0)}%</span>
                          <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                             <div 
                               className={`h-full rounded-full transition-all duration-1000 ${percentage >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                               style={{ width: `${percentage}%` }}
                             ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <Badge variant={percentage >= 50 ? 'green' : 'red'} className="rounded-lg py-1 px-3 text-[9px] font-black uppercase tracking-[0.15em]">
                          {percentage >= 50 ? 'Accredited' : 'Dismissed'}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <p className="text-sm font-black text-slate-800">{format(new Date(sub.submitted_at), 'HH:mm')}</p>
                        <p className="text-[10px] font-extrabold text-slate-300 uppercase">{format(new Date(sub.submitted_at), 'MMM dd')}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <Card className="p-8 shadow-sm border-none bg-white rounded-3xl relative overflow-hidden group hover:shadow-xl hover:shadow-slate-100 transition-all">
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} rounded-bl-full opacity-50 -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
    <div className="relative z-10">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{title}</p>
      <h2 className="text-4xl font-black text-slate-800 tracking-tight">{value}</h2>
    </div>
  </Card>
);

export default AdminDashboard;
