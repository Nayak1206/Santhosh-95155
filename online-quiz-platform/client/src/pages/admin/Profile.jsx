import React, { useState } from 'react';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Input, Badge } from '../../components/common/UI';
import { User, Mail, Shield, Calendar, Edit2, Camera, ShieldCheck, Mail as MailIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const profileImageUrl = user?.profile_photo 
    ? `${axiosInstance.defaults.baseURL.replace('/api', '')}${user.profile_photo}` 
    : null;

  return (
    <Layout title="Administrator Profile">
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-32">
          {/* Banner */}
          <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-900 rounded-[2.5rem] shadow-lg"></div>
          
          {/* Profile Header Card */}
          <Card className="absolute left-1/2 -translate-x-1/2 -bottom-24 w-[90%] md:w-[80%] p-8 border-none shadow-2xl flex flex-col md:flex-row items-center gap-8 rounded-[2rem] bg-white">
            <div className="w-32 h-32 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-800 font-black text-5xl shadow-xl border-4 border-white -mt-20 md:mt-0 overflow-hidden shrink-0">
               {profileImageUrl ? (
                 <img src={profileImageUrl} alt="Admin" className="w-full h-full object-cover" />
               ) : (
                 user?.name?.[0]
               )}
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">{user?.name}</h2>
              <p className="text-slate-400 font-medium mb-4">{user?.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                 <Badge variant="slate" className="bg-slate-900 text-white border-none py-1 px-4 text-[10px] tracking-[0.2em] font-black uppercase">
                    {user?.role} Access
                 </Badge>
                 <Badge variant="blue" className="py-1 px-4 text-[10px] tracking-[0.2em] font-black uppercase flex items-center gap-1">
                    <ShieldCheck size={12} /> Systems Verified
                 </Badge>
              </div>
            </div>

            <Button onClick={() => navigate('/admin/settings')} variant="primary" className="rounded-2xl px-6 gap-2 bg-slate-900 hover:bg-black text-white">
               <Edit2 size={16} /> Edit Credentials
            </Button>
          </Card>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
          <Card className="border-none shadow-sm p-10 bg-white rounded-3xl">
             <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                <User className="text-slate-400" size={20} />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Principal Overview</h3>
             </div>
             
             <div className="grid grid-cols-1 gap-10">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Display Name</label>
                  <p className="text-lg font-extrabold text-slate-700">{user?.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Institutional Email</label>
                  <p className="text-lg font-extrabold text-slate-700">{user?.email}</p>
                </div>
             </div>
          </Card>

          <Card className="border-none shadow-sm p-10 bg-white rounded-3xl">
             <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                <Shield className="text-slate-400" size={20} />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">System Information</h3>
             </div>
             
             <div className="space-y-8">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-600">Established</span>
                   </div>
                   <span className="text-xs font-black text-slate-800">
                     {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'N/A'}
                   </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <MailIcon size={18} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-600">Verification</span>
                   </div>
                   <Badge variant="blue" className="text-[10px] font-black">ACTIVE</Badge>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
