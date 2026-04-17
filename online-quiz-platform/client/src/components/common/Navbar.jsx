import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';
import axiosInstance from '../../api/axiosInstance';
import { 
  Bell, 
  Search, 
  User, 
  LogOut, 
  Settings, 
  ExternalLink, 
  ShieldCheck, 
  BookOpen, 
  ChevronRight, 
  History, 
  PlayCircle 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getExams } from '../../api/examApi';
import { getMyAttempts } from '../../api/attemptApi';

const Navbar = ({ title = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;
        if (user.role === 'admin') {
          const res = await getExams();
          setExams(res.data);
        } else {
          const [eRes, aRes] = await Promise.all([getExams(), getMyAttempts()]);
          setExams(eRes.data);
          setAttempts(aRes.data);
          fetchNotifications();
        }
      } catch (err) {
        console.error('Failed to navbar data:', err);
      }
    };
    fetchData();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };


  const handleResultClick = (item) => {
    setSearchQuery('');
    navigate(item.link);
  };

  const searchResults = searchQuery ? [
    ...exams.map(e => ({ 
      id: e.id, 
      title: e.title, 
      type: 'available', 
      link: user?.role === 'admin' ? `/admin/exams/${e.id}/questions` : '/exams' 
    })),
    ...attempts.map(a => ({ 
      id: a.id, 
      title: a.title, 
      type: 'history', 
      link: `/exam/${a.id}/result` 
    }))
  ].filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5) : [];

  return (
    <div className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <h1 className="text-2xl font-black text-slate-800 tracking-tight ml-4">{title}</h1>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative hidden md:block group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search examinations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-50 border-2 border-transparent rounded-2xl pl-10 pr-4 py-2.5 w-72 focus:bg-white focus:border-green-100 focus:ring-4 focus:ring-green-500/5 transition-all outline-none text-sm font-medium"
          />
          
          {/* Search Results Dropdown */}
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
              <div className="px-6 py-2 border-b border-slate-50">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search Results</span>
              </div>
              {searchResults.map((item, idx) => (
                <button 
                  key={`${item.type}-${item.id}-${idx}`}
                  onClick={() => handleResultClick(item)}
                  className="w-full px-6 py-4 hover:bg-slate-50 flex items-center justify-between group transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${item.type === 'available' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'} rounded-xl flex items-center justify-center`}>
                      {item.type === 'available' ? <PlayCircle size={16} /> : <History size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {item.type === 'available' ? 'Click to start or resume assessment' : 'View past results & history'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-green-500 transition-all group-hover:translate-x-1" />
                </button>
              ))}
              <Link 
                to={user?.role === 'admin' ? "/admin/exams" : "/exams"} 
                onClick={() => setSearchQuery('')} 
                className="block px-6 py-3 bg-slate-50 text-center text-xs font-bold text-slate-500 hover:text-green-600 transition-colors"
              >
                View all examinations
              </Link>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2.5 rounded-2xl transition-all relative ${showNotifications ? 'bg-green-50 text-green-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[8px] font-black text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 py-2">
              <div className="px-6 py-3 border-b border-slate-50 flex items-center justify-between">
                <span className="font-black text-xs uppercase tracking-widest text-slate-400">Activity Bench</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                )}
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    className={`px-6 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer border-b border-slate-50 last:border-0 ${!n.is_read ? 'bg-green-50/20' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {!n.is_read && <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
                      <p className={`font-bold text-slate-800 text-sm ${!n.is_read ? 'text-green-700' : ''}`}>{n.title}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                    <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase">
                      {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="px-6 py-10 text-center text-slate-400 text-sm italic">
                    All caught up! No recent alerts.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 pl-6 border-l border-slate-100 group focus:outline-none"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-800 group-hover:text-green-600 transition-colors">{user?.name}</p>
              <div className="flex items-center justify-end gap-1.5">
                <ShieldCheck size={10} className="text-green-500" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter capitalize">{user?.role}</p>
              </div>
            </div>
            <div className="w-11 h-11 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg shadow-green-100 border-2 border-white flex items-center justify-center text-white font-black text-lg transform group-hover:scale-105 transition-all overflow-hidden">
              {user?.profile_photo ? (
                <img 
                  src={`${axiosInstance.defaults.baseURL.replace('/api', '')}${user.profile_photo}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.[0]
              )}
            </div>
          </button>

          {showProfile && (
            <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 px-2 py-2">
              <div className="bg-slate-50/50 p-6 flex flex-col items-center border-b border-slate-100 rounded-2xl mx-1 mb-2">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-600 font-black text-2xl border border-slate-100 mb-3 overflow-hidden">
                  {user?.profile_photo ? (
                    <img 
                      src={`${axiosInstance.defaults.baseURL.replace('/api', '')}${user.profile_photo}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.[0]
                  )}
                </div>
                <p className="font-black text-slate-800 tracking-tight text-center line-clamp-1">{user?.name}</p>
                <p className="text-xs text-slate-400 font-medium text-center truncate w-full">{user?.email}</p>
              </div>
              <div className="space-y-1">
                <Link 
                  to={user?.role === 'admin' ? "/admin/profile" : "/profile"} 
                  onClick={() => setShowProfile(false)} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors text-sm font-bold"
                >
                  <User size={18} className="text-slate-400" /> My Profile
                </Link>
                <Link 
                  to={user?.role === 'admin' ? "/admin/settings" : "/settings"} 
                  onClick={() => setShowProfile(false)} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors text-sm font-bold"
                >
                  <Settings size={18} className="text-slate-400" /> Account Settings
                </Link>
                <div className="h-px bg-slate-50 mx-4 my-2"></div>
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold"
                >
                  <LogOut size={18} /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
