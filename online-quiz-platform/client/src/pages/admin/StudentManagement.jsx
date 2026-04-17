import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { getAllStudents, exportStudents } from '../../api/studentApi';
import { toast } from 'react-hot-toast';
import { Users, FileDown, Search, Mail, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Badge, Card, Spinner } from '../../components/common/UI';
import { format } from 'date-fns';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = async () => {
    try {
      const res = await getAllStudents();
      setStudents(res.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleExport = async () => {
    try {
      const res = await exportStudents();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Student Directory">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-green-400 outline-none shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleExport} variant="outline" className="h-12 px-6 rounded-2xl shadow-sm">
            <FileDown size={18} /> Export CSV
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="group hover:shadow-xl transition-all duration-300 border-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -mr-10 -mt-10 group-hover:bg-green-50 transition-colors"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-green-100 group-hover:text-green-600 transition-all font-black text-2xl shadow-sm border-2 border-white">
                      {student.name[0]}
                    </div>
                    <div className="flex-1 overflow-hidden pt-1">
                      <h3 className="font-extrabold text-slate-800 text-lg leading-tight truncate">{student.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                        <Mail size={12} className="shrink-0" /> {student.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Exams Taken</p>
                       <p className="text-xl font-black text-slate-700">{student.exams_taken || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                       <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Status</p>
                       <p className="text-[10px] font-extrabold text-blue-600 uppercase">Active Student</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Enrollment</span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {format(new Date(student.created_at), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <Link to={`/admin/students/${student.id}`}>
                      <Button variant="ghost" className="h-8 px-3 text-[10px] font-black uppercase tracking-widest gap-1 hover:bg-slate-100 rounded-lg">
                        History <ChevronRight size={14} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}

            {filteredStudents.length === 0 && (
              <div className="col-span-full py-24 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                <Users size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-800">No Students Found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentManagement;
