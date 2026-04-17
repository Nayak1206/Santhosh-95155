import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { getExams } from '../../api/examApi';
import { startAttempt } from '../../api/attemptApi';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ArrowRight, BookOpen, AlertCircle, Calendar } from 'lucide-react';
import { Button, Badge, Card, Spinner } from '../../components/common/UI';

const AvailableExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await getExams();
        setExams(res.data);
      } catch (error) {
        toast.error('Failed to fetch exams');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleStartExam = async (id) => {
    try {
      const res = await startAttempt(id);
      toast.success('Exam started! Good luck.');
      navigate(`/exam/${res.data.attemptId}/attempt`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start exam');
    }
  };

  return (
    <Layout title="Available Examinations">
      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(() => {
            const filteredExams = exams.filter(exam => !exam.end_time || new Date(exam.end_time) >= new Date());
            
            if (filteredExams.length === 0) {
              return (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">No Examinations Available</h3>
                  <p className="text-slate-500 mt-2">Check back later for new examinations released by your administrator.</p>
                </div>
              );
            }

            return filteredExams.map(exam => {
              const hasStarted = !exam.start_time || new Date(exam.start_time) <= new Date();
              
              return (
                <Card key={exam.id} className="group relative overflow-hidden flex flex-col h-full border-none shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-4">
                    {exam.attempt_status === 'in_progress' ? (
                      <Badge variant="yellow">In Progress</Badge>
                    ) : !hasStarted ? (
                      <Badge variant="blue">Upcoming</Badge>
                    ) : (
                      <Badge variant="green">Active</Badge>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all ${
                      !hasStarted 
                        ? 'bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-100' 
                        : 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-green-100'
                    }`}>
                      <BookOpen size={28} className={!hasStarted ? 'text-slate-200' : 'text-white'} />
                    </div>

                    <h3 className={`text-xl font-bold mb-3 transition-colors ${!hasStarted ? 'text-slate-400' : 'text-slate-800 group-hover:text-green-600'}`}>
                      {exam.title}
                    </h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-3">
                      {exam.description || 'Test your proficiency in this subject with our comprehensive examination.'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                          <Clock size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Duration</span>
                        </div>
                        <p className="text-sm font-bold text-slate-700">{exam.duration_minutes} Mins</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                          <CheckCircle size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Pass Mark</span>
                        </div>
                        <p className="text-sm font-bold text-slate-700">{exam.passing_score}%</p>
                      </div>
                    </div>

                    {(exam.start_time || exam.end_time) && (
                      <div className="mb-6 space-y-2">
                        {exam.start_time && (
                          <div className={`flex items-center gap-2 text-[11px] font-medium ${!hasStarted ? 'text-blue-600' : 'text-slate-500'}`}>
                            <Calendar size={12} className={!hasStarted ? 'text-blue-500' : 'text-slate-400'} />
                            <span>Starts: {new Date(exam.start_time).toLocaleString()}</span>
                          </div>
                        )}
                        {exam.end_time && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                            <Calendar size={12} className="text-red-400" />
                            <span>Ends: {new Date(exam.end_time).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={() => handleStartExam(exam.id)}
                    disabled={!hasStarted}
                    className={`w-full py-3 group-hover:shadow-lg transition-all ${
                      exam.attempt_status === 'in_progress' 
                        ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' 
                        : !hasStarted 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' 
                          : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {exam.attempt_status === 'in_progress' ? 'Resume Assessment' : !hasStarted ? 'Locked' : 'Begin Assessment'}
                    {hasStarted && <ArrowRight size={18} className="ml-2 transform group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </Card>
              );
            });
          })()}
        </div>
      )}
    </Layout>
  );
};

export default AvailableExams;
