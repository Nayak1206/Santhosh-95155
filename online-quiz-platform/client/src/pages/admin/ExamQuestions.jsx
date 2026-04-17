import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { getQuestions, addQuestion, deleteQuestion } from '../../api/questionApi';
import { importQuestions, getExamById, togglePublish } from '../../api/examApi';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Edit2, FileUp, FileText, ChevronRight, Settings2, Code, MessageSquare, Target, HelpCircle, XCircle, CheckCircle, Calendar, Clock } from 'lucide-react';
import { Button, Badge, Card, Spinner, Modal, Input } from '../../components/common/UI';
import { format } from 'date-fns';

const ExamQuestions = () => {
  const { id: examId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [publishModal, setPublishModal] = useState(false);
  const [file, setFile] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'mcq',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    marks: 1,
    language: 'javascript',
    starter_code: '',
    test_cases: [] // Array of {input, expectedOutput}
  });

  const fetchQuestions = async () => {
    try {
      const [qRes, eRes] = await Promise.all([
        getQuestions(examId),
        getExamById(examId)
      ]);
      setQuestions(qRes.data);
      setExam(eRes.data);
    } catch (error) {
      toast.error('Failed to load data bank');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [examId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Pre-process MCQ options
      const payload = { ...formData };
      if (formData.question_type === 'mcq') {
        payload.options = formData.options;
      }
      
      await addQuestion(examId, payload);
      toast.success('Question added successfully');
      setShowModal(false);
      resetForm();
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to add question');
    }
  };

  const resetForm = () => {
    setFormData({
      question_text: '',
      question_type: 'mcq',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: '',
      marks: 1,
      language: 'javascript',
      starter_code: '',
      test_cases: []
    });
  };

  const handleDelete = async (qid) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteQuestion(qid);
      toast.success('Question removed');
      fetchQuestions();
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  const handlePublish = async () => {
    try {
      await togglePublish(examId);
      toast.success(exam.is_published ? 'Exam hidden from students' : 'Exam published successfully!');
      setPublishModal(false);
      fetchQuestions(); // Refresh state
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await importQuestions(examId, fd);
      setImportSummary(res.data.summary);
      toast.success(res.data.message);
      fetchQuestions();
    } catch (error) {
      toast.error('Import failed. Please check your Excel format.');
    }
  };

  return (
    <Layout title="Exam Question Banks">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-50">
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-2xl">
            {[
              { id: 'all', label: 'All Bank', icon: Target },
              { id: 'mcq', label: 'MCQs', icon: HelpCircle },
              { id: 'coding', label: 'Coding', icon: Code },
              { id: 'short_answer', label: 'Short Qs', icon: MessageSquare }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <Button onClick={() => setImportModal(true)} variant="outline" className="h-11 px-6 rounded-2xl flex-1 md:flex-none border-slate-100 hover:bg-slate-50">
               <FileUp size={18} /> Batch Import
             </Button>
             <Button onClick={() => setShowModal(true)} className="h-11 px-8 rounded-2xl bg-slate-900 !text-white shadow-xl shadow-slate-200 font-black uppercase text-[10px] tracking-widest flex-1 md:flex-none hover:bg-black transition-all">
               <Plus size={20} /> Create New
             </Button>
          </div>
        </div>

        {questions.length > 0 && (
           <div className="flex justify-end">
              <Button 
                 onClick={() => setPublishModal(true)} 
                 variant={exam?.is_published ? "ghost" : "primary"} 
                 className={`h-10 px-6 rounded-2xl flex items-center gap-2 font-black uppercase text-[9px] tracking-[0.2em] border-none ${!exam?.is_published ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-slate-100 text-slate-500'}`}
              >
                 {exam?.is_published ? <CheckCircle size={16} className="text-green-500" /> : <Calendar size={16} />}
                 {exam?.is_published ? 'Active & Published' : 'Launch Assessment'}
              </Button>
           </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {(() => {
              const filteredQuestions = activeTab === 'all' 
                ? questions 
                : questions.filter(q => q.question_type === activeTab);

              if (filteredQuestions.length === 0) {
                return (
                  <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No {activeTab === 'all' ? '' : activeTab.replace('_', ' ')} Questions Found</h3>
                    <p className="text-slate-500 mt-2 max-w-xs mx-auto">This category is currently empty in your question bank.</p>
                    <Button onClick={() => {
                        setFormData({...formData, question_type: activeTab === 'all' ? 'mcq' : activeTab});
                        setShowModal(true);
                    }} variant="outline" className="mt-8 mx-auto px-8">
                       Add New {activeTab === 'all' ? 'Question' : activeTab.replace('_', ' ')}
                    </Button>
                  </div>
                );
              }

              return filteredQuestions.map((q, idx) => (
                <Card key={q.id} className="relative group border-none shadow-sm hover:shadow-md transition-all p-8">
                  <div className="flex gap-6">
                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center font-black text-sm border border-slate-100 shrink-0">
                      {idx + 1}
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <Badge variant={q.question_type === 'coding' ? 'blue' : q.question_type === 'mcq' ? 'green' : 'yellow'} className="uppercase">
                            {q.question_type.replace('_', ' ')}
                          </Badge>
                          <Badge variant="slate" className="bg-slate-50 text-slate-400 border-none font-bold">
                            {q.marks} Points
                          </Badge>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 leading-tight">
                          {q.question_text}
                        </h3>

                        {q.question_type === 'mcq' && q.options && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            {JSON.parse(q.options).map((opt, i) => (
                              <div key={i} className={`p-4 rounded-2xl border flex items-center gap-4 ${
                                q.correct_answer === String.fromCharCode(65 + i) 
                                ? 'bg-green-50 border-green-200 text-green-700' 
                                : 'bg-white border-slate-100 text-slate-600'
                              }`}>
                                <span className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center font-bold text-xs">
                                  {String.fromCharCode(65 + i)}
                                </span>
                                <span className="font-medium text-sm">{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.explanation && (
                          <div className="flex gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                            <HelpCircle size={18} className="text-blue-500 shrink-0 mt-1" />
                            <p className="text-sm text-blue-800 font-medium italic">{q.explanation}</p>
                          </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                       <Button 
                        onClick={() => handleDelete(q.id)} 
                        variant="ghost" 
                        className="w-10 h-10 p-0 hover:bg-red-50 hover:text-red-500 rounded-xl"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ));
            })()}
          </div>
        )}

        <Modal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
          title="Author New Question"
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Discard</Button>
              <Button onClick={handleSubmit}>Save to Bank</Button>
            </>
          }
        >
          <form className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                     <Settings2 size={16} /> Question Format
                   </label>
                   <select 
                     className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-400 outline-none transition-all"
                     value={formData.question_type}
                     onChange={(e) => setFormData({...formData, question_type: e.target.value})}
                   >
                     <option value="mcq">Multiple Choice</option>
                     <option value="short_answer">Short Answer</option>
                     <option value="coding">Coding Challenge</option>
                   </select>
                </div>
                <Input 
                  label="Weightage (Marks)" 
                  type="number" 
                  value={formData.marks}
                  onChange={(e) => setFormData({...formData, marks: parseInt(e.target.value)})}
                />
             </div>

             <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MessageSquare size={16} /> Content
                </label>
                <textarea 
                  required
                  placeholder="Type your question here..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 outline-none h-32"
                  value={formData.question_text}
                  onChange={(e) => setFormData({...formData, question_text: e.target.value})}
                />
             </div>

             {formData.question_type === 'mcq' && (
               <div className="space-y-4 pt-2">
                  <p className="text-sm font-bold text-slate-700">Options & Correct Answer</p>
                  <div className="grid grid-cols-1 gap-3">
                    {formData.options.map((opt, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 shrink-0">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <input 
                          type="text"
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-400 outline-none"
                          value={opt}
                          onChange={(e) => {
                             const newOpts = [...formData.options];
                             newOpts[i] = e.target.value;
                             setFormData({...formData, options: newOpts});
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <select 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 mt-2 focus:ring-2 focus:ring-blue-400 outline-none bg-blue-50/30 text-blue-700 font-bold"
                    value={formData.correct_answer}
                    onChange={(e) => setFormData({...formData, correct_answer: e.target.value})}
                  >
                    <option value="">Select Correct Label</option>
                    <option value="A">Label A</option>
                    <option value="B">Label B</option>
                    <option value="C">Label C</option>
                    <option value="D">Label D</option>
                  </select>
               </div>
             )}

             {formData.question_type !== 'mcq' && (
               <Input 
                 label={formData.question_type === 'coding' ? 'Expected Output' : 'Correct Answer'}
                 required
                 placeholder="Enter the strictly expected response..."
                 value={formData.correct_answer}
                 onChange={(e) => setFormData({...formData, correct_answer: e.target.value})}
               />
             )}

             {formData.question_type === 'coding' && (
               <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-slate-700">Starter Code</label>
                    <textarea 
                      placeholder="// Function stub or boilerplate..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 outline-none h-32 font-mono text-sm"
                      value={formData.starter_code}
                      onChange={(e) => setFormData({...formData, starter_code: e.target.value})}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <p className="text-sm font-bold text-slate-700">Test Cases (Auto-Grading)</p>
                       <Button 
                         type="button"
                         variant="outline" 
                         className="h-8 px-3 text-[10px] font-black uppercase tracking-widest gap-2"
                         onClick={() => setFormData({
                           ...formData, 
                           test_cases: [...formData.test_cases, { input: '', expectedOutput: '' }]
                         })}
                       >
                         <Plus size={14} /> Add Test Case
                       </Button>
                    </div>
                    <div className="space-y-3">
                      {formData.test_cases.map((tc, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group/tc">
                           <Button 
                             type="button"
                             variant="ghost" 
                             className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-white border border-slate-100 rounded-full text-red-500 opacity-0 group-hover/tc:opacity-100 transition-opacity flex items-center justify-center"
                             onClick={() => {
                               const newTC = [...formData.test_cases];
                               newTC.splice(i, 1);
                               setFormData({...formData, test_cases: newTC});
                             }}
                           >
                             <Trash2 size={12} />
                           </Button>
                           <textarea 
                             placeholder="Input (e.g. 5, 10)"
                             className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-green-400 outline-none h-16"
                             value={tc.input}
                             onChange={(e) => {
                               const newTC = [...formData.test_cases];
                               newTC[i].input = e.target.value;
                               setFormData({...formData, test_cases: newTC});
                             }}
                           />
                           <textarea 
                             placeholder="Expected Output (e.g. 15)"
                             className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-green-400 outline-none h-16"
                             value={tc.expectedOutput}
                             onChange={(e) => {
                               const newTC = [...formData.test_cases];
                               newTC[i].expectedOutput = e.target.value;
                               setFormData({...formData, test_cases: newTC});
                             }}
                           />
                        </div>
                      ))}
                      {formData.test_cases.length === 0 && (
                        <div className="py-4 text-center border border-dashed border-slate-200 rounded-2xl">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No test cases defined</p>
                        </div>
                      )}
                    </div>
                  </div>
               </div>
             )}

             <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Target size={16} /> Solution Explanation
                </label>
                <textarea 
                  placeholder="Explain the logic behind the correct answer..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 outline-none h-24"
                  value={formData.explanation}
                  onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                />
             </div>
          </form>
        </Modal>

        <Modal
          isOpen={importModal}
          onClose={() => {
            setImportModal(false);
            setImportSummary(null);
            setFile(null);
          }}
          title="Batch Question Import"
          footer={
            <>
              {!importSummary ? (
                <>
                  <Button variant="ghost" onClick={() => setImportModal(false)}>Cancel</Button>
                  <Button onClick={handleImport} disabled={!file}>Initiate Import</Button>
                </>
              ) : (
                <Button onClick={() => {
                   setImportModal(false);
                   setImportSummary(null);
                   setFile(null);
                }}>Finish</Button>
              )}
            </>
          }
        >
          <div className="space-y-6">
            {!importSummary ? (
              <>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                   <p className="text-xs text-blue-700 font-medium font-bold uppercase tracking-widest mb-1">Standardized Format Only</p>
                   <p className="text-xs text-blue-600">Please use the official Excel template to ensure all question mappings are processed correctly.</p>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                   <input 
                     type="file" 
                     className="absolute inset-0 opacity-0 cursor-pointer" 
                     onChange={(e) => setFile(e.target.files[0])}
                     accept=".xlsx"
                   />
                   <FileUp size={48} className="mx-auto text-green-500 mb-4" />
                   <p className="font-bold text-slate-700">
                     {file ? file.name : 'Drop your .xlsx file here'}
                   </p>
                   <p className="text-xs text-slate-400 mt-1">Accepts .xlsx format up to 10MB</p>
                </div>
              </>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                 <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl text-center">
                       <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total</p>
                       <p className="text-2xl font-black text-slate-700">{importSummary.total}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-2xl text-center">
                       <p className="text-[10px] font-black uppercase text-green-400 mb-1">Succeeded</p>
                       <p className="text-2xl font-black text-green-600">{importSummary.valid}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-2xl text-center">
                       <p className="text-[10px] font-black uppercase text-red-400 mb-1">Failed</p>
                       <p className="text-2xl font-black text-red-600">{importSummary.failed}</p>
                    </div>
                 </div>

                 {importSummary.errors.length > 0 && (
                   <div className="space-y-3">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <XCircle size={14} className="text-red-500" /> Error Logs (Row Level)
                      </p>
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {importSummary.errors.map((err, i) => (
                          <div key={i} className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex items-start gap-3">
                             <span className="text-[10px] font-black text-red-600 bg-red-100 w-12 py-0.5 rounded-md text-center shrink-0">ROW {err.row}</span>
                             <p className="text-[10px] font-bold text-red-700 leading-tight">{err.error}</p>
                          </div>
                        ))}
                      </div>
                   </div>
                 )}
                 
                 {importSummary.failed === 0 && (
                   <div className="p-10 text-center">
                      <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                         <CheckCircle size={32} />
                      </div>
                      <h4 className="font-bold text-slate-800">Perfect Import!</h4>
                      <p className="text-xs text-slate-400 mt-1">All questions were validated and imported successfully.</p>
                   </div>
                 )}
              </div>
            )}
          </div>
        </Modal>
        <Modal
          isOpen={publishModal}
          onClose={() => setPublishModal(false)}
          title="Finalize & Schedule Launch"
          footer={
            <>
              <Button variant="ghost" onClick={() => setPublishModal(false)}>Back to Bank</Button>
              <Button onClick={handlePublish} className={exam?.is_published ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-900 hover:bg-black'}>
                {exam?.is_published ? 'Unpublish Now' : 'Go Live & Launch'}
              </Button>
            </>
          }
        >
          <div className="space-y-6">
             <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 italic text-slate-500 text-sm">
                Once published, this exam will become visible to all eligible students at the scheduled start time. You will no longer be able to modify the question set.
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                         <Calendar size={20} />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Launch Schedule</span>
                   </div>
                   <span className="text-xs font-black text-slate-400">
                      {exam?.start_time ? format(new Date(exam.start_time), 'MMM dd, HH:mm') : 'Not Set'}
                   </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                         <Clock size={20} />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Time Limit</span>
                   </div>
                   <span className="text-xs font-black text-slate-400">{exam?.duration_minutes} Minutes</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                         <FileText size={20} />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Question Density</span>
                   </div>
                   <span className="text-xs font-black text-slate-400">{questions.length} Items</span>
                </div>
             </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default ExamQuestions;
