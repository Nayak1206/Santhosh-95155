import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Send, AlertTriangle } from 'lucide-react';

import TimerDisplay from '../../components/exam/TimerDisplay';
import QuestionPalette from '../../components/exam/QuestionPalette';
import MCQQuestion from '../../components/exam/MCQQuestion';
import ShortAnswerQuestion from '../../components/exam/ShortAnswerQuestion';
import CodingQuestion from '../../components/exam/CodingQuestion';
import { Button, Spinner, Card } from '../../components/common/UI';
import useAutoSave from '../../hooks/useAutoSave';
import { useCamera } from '../../hooks/useCamera';

const ExamAttempt = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { startCamera, stopCamera, cameraActive } = useCamera();

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await startCamera();
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        // Error already logged by hook, just provide UI feedback
        toast.error("Proctoring required: Please enable your camera.", { icon: '📷' });
      }
    };
    init();

    // Browser close/refresh safety
    const handleExit = () => stopCamera();
    window.addEventListener('beforeunload', handleExit);
    
    return () => {
      window.removeEventListener('beforeunload', handleExit);
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of { question_id, student_answer }
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    const initExam = async () => {
      try {
        const statusRes = await axiosInstance.get(`/attempts/${attemptId}/status`);
        const { timeRemainingSeconds, savedAnswers } = statusRes.data;

        if (timeRemainingSeconds <= 0) {
          toast.error('This attempt has already expired.');
          navigate('/dashboard');
          return;
        }

        setTimeRemaining(timeRemainingSeconds);
        setAnswers(savedAnswers || []);

        // Fetch full exam details including questions
        const attemptDetailRes = await axiosInstance.get(`/attempts/${attemptId}/result`);
        const { attempt, questions: qList } = attemptDetailRes.data;
        
        // Note: we use result endpoint to get question list even if not submitted
        // Our controller allows this if it's the student's own attempt
        setExam({ title: attempt.title });
        setQuestions(qList);
      } catch (error) {
        toast.error('Failed to load exam data');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    initExam();
  }, [attemptId, navigate]);

  const currentQuestion = questions[currentIdx];
  const currentAnswer = answers.find(a => a.question_id === currentQuestion?.id)?.student_answer || '';

  // Trigger auto-save whenever currentAnswer changes
  useAutoSave(attemptId, currentQuestion?.id, currentAnswer);

  const handleAnswerChange = (val) => {
    setAnswers(prev => {
      const idx = prev.findIndex(a => a.question_id === currentQuestion.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], student_answer: val };
        return updated;
      } else {
        return [...prev, { question_id: currentQuestion.id, student_answer: val }];
      }
    });
  };

  const handleSubmit = async (isAuto = false) => {
    if (!isAuto && !window.confirm('Are you sure you want to submit your exam?')) return;
    
    // Stop camera proctoring as soon as submission starts
    stopCamera();

    // Show a loading toast especially for coding evaluations which can take time
    const toastId = isAuto 
      ? toast.loading('Time is up! Submitting your exam automatically...') 
      : toast.loading('Submitting your exam... Please wait.');

    try {
      // 1. Ensure current answer is saved before submitting
      if (currentQuestion?.id) {
        await axiosInstance.post('/answers/save', {
          attemptId,
          questionId: currentQuestion.id,
          answer: currentAnswer
        });
      }

      // 2. Final submission call
      const response = await axiosInstance.post(`/attempts/${attemptId}/submit`);
      
      if (response.data.success) {
        toast.success('Exam submitted successfully!', { id: toastId });
        // Use a slight delay to ensure the user sees the success message before redirection
        setTimeout(() => {
          navigate(`/exam/${attemptId}/result`);
        }, 500);
      } else {
        throw new Error(response.data.error || 'Submission call did not return success status');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Submission failed. Please try again.';
      toast.error(errorMsg, { id: toastId });
    }
  };

  const handleTimeUp = () => {
    handleSubmit(true);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Spinner size="lg" />
      <p className="text-slate-500 font-medium animate-pulse">Safely loading secure exam environment...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center font-bold">Q</div>
          <h1 className="text-xl font-bold text-slate-800">{exam?.title}</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-slate-400">
            <span className="text-xs font-bold uppercase tracking-widest">Question</span>
            <span className="text-lg font-bold text-slate-700">{currentIdx + 1} / {questions.length}</span>
          </div>
          <TimerDisplay initialSeconds={timeRemaining} onTimeUp={handleTimeUp} />
          <Button onClick={() => handleSubmit(false)} className="bg-slate-800 hover:bg-slate-900 shadow-none">
            <Send size={18} />
            Submit Exam
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card className="min-h-[500px] flex flex-col">
            <div className="flex-1">
              {currentQuestion?.question_type === 'mcq' && (
                <MCQQuestion 
                  question={currentQuestion} 
                  value={currentAnswer} 
                  onChange={handleAnswerChange} 
                />
              )}
              {currentQuestion?.question_type === 'short_answer' && (
                <ShortAnswerQuestion 
                  question={currentQuestion} 
                  value={currentAnswer} 
                  onChange={handleAnswerChange} 
                />
              )}
              {currentQuestion?.question_type === 'coding' && (
                <CodingQuestion 
                  question={currentQuestion} 
                  value={currentAnswer} 
                  onChange={handleAnswerChange} 
                />
              )}
            </div>

            <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-50">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentIdx(p => p - 1)} 
                disabled={currentIdx === 0}
              >
                <ChevronLeft size={20} /> Previous
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => handleAnswerChange('')}
                  className="text-slate-400 border-slate-100"
                >
                  Clear Selection
                </Button>
                {currentIdx < questions.length - 1 ? (
                  <Button onClick={() => setCurrentIdx(p => p + 1)} className="px-8">
                    Next <ChevronRight size={20} />
                  </Button>
                ) : (
                  <Button onClick={() => handleSubmit(false)} className="px-8 !bg-blue-600">
                    Finish Exam
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <p className="text-sm text-blue-700 font-medium">
              Your answers are being saved automatically. Do not close this tab or refresh the page unnecessarily.
            </p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <QuestionPalette 
            questions={questions} 
            currentIdx={currentIdx} 
            answers={answers} 
            onSelect={setCurrentIdx} 
          />
        </div>
      </div>

      {/* Camera Preview Widget */}
      <div 
        className={`fixed bottom-6 right-6 w-48 h-36 rounded-2xl overflow-hidden shadow-2xl border-4 border-white z-[9999] transition-all duration-500 ${cameraActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
        style={{ boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
      >
        {cameraActive && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-md rounded-full z-10">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
          </div>
        )}
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline
          className="w-full h-full object-cover bg-slate-200"
        />
        {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
            <AlertTriangle size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamAttempt;
