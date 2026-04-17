import React from 'react';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, ShieldCheck, Calendar, BookOpen, Trophy } from 'lucide-react';
import { Card, Badge } from '../../components/common/UI';
import axiosInstance from '../../api/axiosInstance';

const Profile = () => {
  const { user } = useAuth();

  const profileImageUrl = user?.profile_photo 
    ? `${axiosInstance.defaults.baseURL.replace('/api', '')}${user.profile_photo}` 
    : null;

  return (
    <Layout title="My Profile">
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-32">
          {/* Banner */}
          <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 rounded-[2.5rem] shadow-lg"></div>
          
          {/* Profile Header Card */}
          <Card className="absolute left-1/2 -translate-x-1/2 -bottom-24 w-[90%] md:w-[80%] p-8 border-none shadow-2xl flex flex-col md:flex-row items-center gap-8 rounded-[2rem]">
            <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center text-green-600 font-black text-5xl shadow-xl border-4 border-white -mt-16 md:mt-0 overflow-hidden shrink-0">
               {profileImageUrl ? (
                 <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 user?.name?.[0]
               )}
            </div>
            
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">{user?.name}</h2>
              <p className="text-slate-400 font-medium mb-4">{user?.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                 <Badge variant="green" className="py-1 px-4 text-[10px] tracking-[0.2em] font-black uppercase">
                    {user?.role} Level
                 </Badge>
                 <Badge variant="blue" className="py-1 px-4 text-[10px] tracking-[0.2em] font-black uppercase flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified Member
                 </Badge>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
          <div className="md:col-span-2 space-y-8">
            <Card className="border-none shadow-sm p-10">
               <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                  <User className="text-green-500" size={20} />
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Identity Details</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Full Name</label>
                    <p className="text-lg font-bold text-slate-700">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Email Address</label>
                    <p className="text-lg font-bold text-slate-700">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Member Since</label>
                    <p className="text-lg font-bold text-slate-700 flex items-center gap-2">
                       <Calendar size={18} className="text-slate-300" /> Apr 2026
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Account Role</label>
                    <p className="text-lg font-bold text-slate-700 capitalize">{user?.role}</p>
                  </div>
               </div>
            </Card>
          </div>

          <div className="md:col-span-1 space-y-8">
             <Card className="border-none shadow-sm p-8 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-6 text-slate-400">
                   <Trophy size={18} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Achievements</span>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-500">
                         <BookOpen size={20} />
                      </div>
                      <div>
                         <p className="text-xs font-black text-slate-800">Quick Learner</p>
                         <p className="text-[10px] text-slate-400 font-bold">Passed 5+ Exams</p>
                      </div>
                   </div>
                </div>
             </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
