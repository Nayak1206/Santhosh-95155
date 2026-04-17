import React, { useState, useRef, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Lock, Mail, ShieldCheck, Key, Camera, Image as ImageIcon, X, Check, RefreshCw, Trash2, Smartphone } from 'lucide-react';
import { Card, Button, Input, Badge, Modal, Spinner } from '../../components/common/UI';
import axiosInstance from '../../api/axiosInstance';

const Settings = () => {
  const { user, setUser } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  
  // Photo States
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    
    setLoading(true);
    try {
      await axiosInstance.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // Gallery Logic
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadPhoto(file);
    }
    setShowPhotoOptions(false);
  };

  // Camera Logic
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      toast.error('Unable to access camera. Please check permissions.');
      setShowCameraModal(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (showCameraModal) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [showCameraModal]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
    }
  };

  const retryPhoto = () => {
    setCapturedImage(null);
  };

  const uploadCapturedPhoto = async () => {
    if (!capturedImage) return;
    
    // Convert dataUrl to blob
    const response = await fetch(capturedImage);
    const blob = await response.blob();
    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
    
    await uploadPhoto(file);
    setShowCameraModal(false);
    setCapturedImage(null);
  };

  const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);

    setUploading(true);
    try {
      const res = await axiosInstance.put('/auth/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newPhoto = res.data.profile_photo;
      setUser(prev => ({ ...prev, profile_photo: newPhoto }));
      toast.success('Profile photo updated successfully');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const profileImageUrl = user?.profile_photo 
    ? `${axiosInstance.defaults.baseURL.replace('/api', '')}${user.profile_photo}` 
    : null;

  return (
    <Layout title="Account Settings">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center p-10 border-none shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-green-400 to-green-600"></div>
            <div className="relative pt-4">
              <div className="relative inline-block">
                <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center text-green-600 font-black text-4xl shadow-xl border-4 border-white mb-6 transform group-hover:rotate-3 transition-transform overflow-hidden">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.[0]
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                      <Spinner size="sm" />
                    </div>
                  )}
                </div>
                
                <div className="absolute bottom-6 right-0">
                  <button 
                    onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                    className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all border-4 border-white"
                  >
                    <Camera size={18} />
                  </button>

                  {/* Photo Options Menu */}
                  {showPhotoOptions && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-20 animate-in fade-in zoom-in duration-200">
                      <button 
                        onClick={() => {
                          setShowCameraModal(true);
                          setShowPhotoOptions(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-slate-700 text-sm font-bold"
                      >
                         <Camera size={16} className="text-slate-400" /> Take Photo
                      </button>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-slate-700 text-sm font-bold border-t border-slate-50"
                      >
                         <ImageIcon size={16} className="text-slate-400" /> Choose from Gallery
                      </button>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileSelect} 
                />
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{user?.name}</h2>
              <p className="text-slate-400 text-sm font-medium mb-6">{user?.email}</p>
              <Badge variant="green" className="py-1 px-4 text-[10px] tracking-[0.2em] font-black uppercase">
                {user?.role} Level
              </Badge>
            </div>
          </Card>

          <Card className="p-6 border-none shadow-sm space-y-4">
             <div className="flex items-center gap-3 text-slate-400 mb-2">
                <ShieldCheck size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Security</span>
             </div>
             <Button 
               variant="outline" 
               className="w-full justify-start py-4 border-slate-100 hover:bg-slate-50 font-bold text-slate-700"
               onClick={() => setShowPasswordModal(true)}
             >
                <Key size={18} className="text-slate-400" />
                Security Credentials
             </Button>
          </Card>
        </div>

        {/* Right: Detailed Settings */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm p-10">
            <h3 className="text-xl font-black text-slate-800 mb-8 border-b border-slate-50 pb-6 flex items-center gap-3">
               <User className="text-green-500" size={24} />
               Personal Information
            </h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input 
                  label="Display Name" 
                  value={user?.name} 
                  disabled 
                  className="bg-slate-50/50 cursor-not-allowed border-slate-100"
                />
                <Input 
                  label="Registered Email" 
                  value={user?.email} 
                  disabled 
                  className="bg-slate-50/50 cursor-not-allowed border-slate-100"
                />
              </div>
              
              <div className="pt-4 border-t border-slate-50 flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                    <Mail size={20} />
                 </div>
                 <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                   To update your primary profile information or linked email address, please contact your systems administrator.
                 </p>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Update Security Passphrase"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowPasswordModal(false)}>Discard</Button>
            <Button onClick={handlePasswordChange} disabled={loading}>
               {loading ? <Spinner size="sm" /> : 'Confirm Change'}
            </Button>
          </>
        }
      >
        <form className="space-y-6" onSubmit={handlePasswordChange}>
           <Input 
             label="Current Password" 
             type="password" 
             required
             value={passwordData.currentPassword}
             onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
           />
           <div className="h-px bg-slate-50 my-2"></div>
           <Input 
             label="New Password" 
             type="password" 
             required
             value={passwordData.newPassword}
             onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
           />
           <Input 
             label="Confirm New Password" 
             type="password" 
             required
             value={passwordData.confirmPassword}
             onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
           />
        </form>
      </Modal>

      {/* Camera Capture Modal */}
      <Modal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        title="Capture Profile Photo"
        size="lg"
      >
        <div className="flex flex-col items-center">
          <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-inner border-4 border-slate-100">
            {!capturedImage ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover mirror-mode"
              />
            ) : (
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-full object-cover"
              />
            )}
            
            <div className="absolute bottom-6 left-0 w-full flex justify-center gap-4">
              {!capturedImage ? (
                <button 
                  onClick={capturePhoto}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all text-slate-800"
                >
                  <div className="w-12 h-12 border-4 border-slate-800 rounded-full" />
                </button>
              ) : (
                <>
                  <button 
                    onClick={retryPhoto}
                    className="px-6 py-2 bg-slate-800/80 backdrop-blur-md text-white rounded-xl flex items-center gap-2 hover:bg-slate-900 transition-all font-bold"
                  >
                    <RefreshCw size={18} /> Retake
                  </button>
                  <button 
                    onClick={uploadCapturedPhoto}
                    disabled={uploading}
                    className="px-8 py-2 bg-green-500 text-white rounded-xl flex items-center gap-2 hover:bg-green-600 transition-all font-bold shadow-lg shadow-green-200"
                  >
                    {uploading ? <Spinner size="sm" /> : <><Check size={18} /> Use Photo</>}
                  </button>
                </>
              )}
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <p className="mt-6 text-sm text-slate-400 font-medium">
            Position yourself in the center and click the shutter button to capture.
          </p>
        </div>
      </Modal>
      
      <style>{`
        .mirror-mode {
          transform: scaleX(-1);
        }
      `}</style>
    </Layout>
  );
};

export default Settings;
