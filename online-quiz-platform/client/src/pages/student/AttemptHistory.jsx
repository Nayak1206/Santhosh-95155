import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { getMyAttempts } from '../../api/attemptApi';
import { Link } from 'react-router-dom';
import { Eye, Calendar, Trophy, BarChart2, Search } from 'lucide-react';
import { Button, Badge, Card, Spinner, Input } from '../../components/common/UI';
import { toast } from 'react-hot-toast';

const AttemptHistory = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, passed, failed

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await getMyAttempts();
        setAttempts(res.data);
      } catch (error) {
        toast.error('Failed to fetch attempts');
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  const filteredAttempts = attempts.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
    const percentage = Math.round((a.score / (a.total_marks || 1)) * 100);
    const passed = percentage >= (a.passing_score || 50);
    
    if (filterStatus === 'passed') return matchesSearch && passed;
    if (filterStatus === 'failed') return matchesSearch && !passed;
    return matchesSearch;
  });

  return (
    <Layout title="Examination History">
      <div className="space-y-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search by exam name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            <button 
              onClick={() => setFilterStatus('all')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${filterStatus === 'all' ? 'bg-slate-800 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
            >
              ALL
            </button>
            <button 
              onClick={() => setFilterStatus('passed')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${filterStatus === 'passed' ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'text-slate-400 hover:text-green-600'}`}
            >
              PASSED
            </button>
            <button 
              onClick={() => setFilterStatus('failed')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${filterStatus === 'failed' ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'text-slate-400 hover:text-red-600'}`}
            >
              FAILED
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredAttempts.map(attempt => {
              const percentage = Math.round((attempt.score / (attempt.total_marks || 1)) * 100);
              const isPassed = percentage >= (attempt.passing_score || 50);

              return (
                <Card key={attempt.id} className="group hover:shadow-lg transition-all border-none shadow-sm flex flex-col md:flex-row md:items-center gap-6 p-6">
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold text-lg shadow-inner ${
                    isPassed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    <span className="text-xl">{percentage}%</span>
                    <span className="text-[9px] uppercase tracking-tighter opacity-70">Score</span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-green-600 transition-colors">
                      {attempt.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 items-center text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(attempt.submitted_at || attempt.started_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                      </div>
                      <div className="flex items-center gap-1.5 border-l border-slate-100 pl-4">
                        <BarChart2 size={14} className="text-slate-400" />
                        {attempt.score} / {attempt.total_marks} Points
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-3 items-center md:items-end">
                    <Badge variant={isPassed ? 'green' : 'red'}>
                      {isPassed ? 'PASSED' : 'FAILED'}
                    </Badge>
                    <Link to={`/exam/${attempt.id}/result`}>
                      <Button variant="outline" className="text-xs py-2 px-4 h-9">
                        <Eye size={14} /> Full Review
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}

            {filteredAttempts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No results matched your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AttemptHistory;
