import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { getExams, createExam, deleteExam, togglePublish } from '../../api/examApi';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Eye, FileUp, FileDown, MoreHorizontal, HelpCircle, BookOpen, ClipboardCheck, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Badge, Card, Spinner, Modal, Input } from '../../components/common/UI';
import axiosInstance from '../../api/axiosInstance';
import { useSearch } from '../../context/SearchContext';

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: 30,
    passing_score: 50,
    start_time: '',
    end_time: ''
  });

  const { searchQuery } = useSearch();

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  useEffect(() => {
    fetchExams();
  }, []);

  // Helper to format ISO date string to datetime-local input format (YYYY-MM-DDTHH:MM)
  const formatForInput = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
      return localISOTime;
    } catch (e) {
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure times are stored as ISO strings for consistent server comparison
      const payload = {
        ...formData,
        start_time: formData.start_time ? new Date(formData.start_time).toISOString() : null,
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null
      };

      if (editId) {
        await axiosInstance.put(`/exams/${editId}`, payload);
        toast.success('Exam updated successfully');
      } else {
        const res = await createExam(payload);
        toast.success('Exam created successfully');
        navigate(`/admin/exams/${res.data.id}/questions`);
      }
      setShowModal(false);
      setEditId(null);
      resetForm();
      fetchExams();
    } catch (error) {
      toast.error(editId ? 'Failed to update exam' : 'Failed to create exam');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration_minutes: 30,
      passing_score: 50,
      start_time: '',
      end_time: ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
      await deleteExam(id);
      toast.success('Exam deleted');
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await togglePublish(id);
      toast.success('Status updated');
      fetchExams();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const downloadTemplate = async () => {
    try {
      const res = await axiosInstance.get('/exams/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'exam_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download template');
    }
  };

  return (
    <Layout title="Exam Management">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Button onClick={downloadTemplate} variant="outline" className="h-11">
              <FileDown size={18} /> Template
            </Button>
          </div>
          <Button onClick={() => setShowModal(true)} className="h-11 shadow-lg shadow-green-200 px-6">
            <Plus size={20} /> New Examination
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <Card className="overflow-hidden p-0 border-none shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Exam Details</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Settings</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-800 text-lg group-hover:text-green-600 transition-colors leading-tight">{exam.title}</div>
                      <div className="text-xs text-slate-400 mt-1 max-w-xs truncate">{exam.description || 'No description provided.'}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                          <HelpCircle size={14} className="text-slate-300" /> {exam.duration_minutes} Minutes
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">Passing Grade: {exam.passing_score}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge variant={exam.is_published ? 'green' : 'slate'}>
                        {exam.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link to={`/admin/exams/${exam.id}/results`}>
                          <Button variant="outline" className="h-10 px-3 rounded-xl border-slate-100 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all" title="View Results">
                            <ClipboardCheck size={18} />
                          </Button>
                        </Link>
                        <Link to={`/admin/exams/${exam.id}/questions`}>
                          <Button variant="outline" className="h-10 px-3 rounded-xl border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all" title="Manage Questions">
                            <BookOpen size={18} />
                          </Button>
                        </Link>

                        <Button 
                          onClick={() => {
                             setFormData({
                                title: exam.title,
                                description: exam.description || '',
                                duration_minutes: exam.duration_minutes,
                                passing_score: exam.passing_score,
                                start_time: formatForInput(exam.start_time),
                                end_time: formatForInput(exam.end_time)
                             });
                            setEditId(exam.id);
                            setShowModal(true);
                          }}
                          disabled={exam.is_published}
                          variant="outline" 
                          className="h-10 w-10 p-0 rounded-xl border-slate-100 hover:bg-slate-50 disabled:opacity-30"
                          title="Edit Exam"
                        >
                          <Edit2 size={18} />
                        </Button>
                        
                        <Button 
                          onClick={() => handleTogglePublish(exam.id)}
                          variant={exam.is_published ? 'primary' : 'outline'}
                          className={`h-10 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                            exam.is_published ? 'border-none shadow-lg shadow-green-100' : 'border-slate-200'
                          }`}
                          title={exam.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {exam.is_published ? (
                            <>
                              <CheckCircle size={16} />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <Eye size={16} />
                              <span>Publish</span>
                            </>
                          )}
                        </Button>

                        <Button 
                          onClick={() => handleDelete(exam.id)}
                          disabled={exam.is_published}
                          variant="ghost" 
                          className="h-10 w-10 p-0 rounded-xl hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                          title="Delete Exam"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {exams.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <BookOpen size={32} />
                      </div>
                      <p className="text-slate-400 font-medium">No examinations created yet.</p>
                      <Button onClick={() => setShowModal(true)} variant="outline" className="mt-4 mx-auto">Create Your First Exam</Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        )}

        <Modal 
          isOpen={showModal} 
          onClose={() => {
            setShowModal(false);
            setEditId(null);
            resetForm();
          }} 
          title={editId ? "Edit Examination" : "Create New Examination"}
          footer={
            <>
              <Button variant="ghost" onClick={() => {
                setShowModal(false);
                setEditId(null);
                resetForm();
              }}>Cancel</Button>
              <Button onClick={handleSubmit}>{editId ? 'Update Exam' : 'Create Exam'}</Button>
            </>
          }
        >
          <form className="space-y-6">
            <Input 
              label="Exam Title" 
              required 
              placeholder="e.g. Advanced JavaScript Assessment"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea 
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all h-24 pt-2"
                placeholder="Briefly describe the purpose of this exam..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Duration (mins)" 
                type="number"
                required
                value={formData.duration_minutes}
                onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
              />
               <Input 
                label="Passing Grade (%)" 
                type="number"
                required
                value={formData.passing_score}
                onChange={(e) => setFormData({...formData, passing_score: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Available From" 
                type="datetime-local"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
              />
              <Input 
                label="Available Until" 
                type="datetime-local"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
              />
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default ExamManagement;
