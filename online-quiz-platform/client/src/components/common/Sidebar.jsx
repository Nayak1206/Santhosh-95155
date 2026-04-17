import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut, 
  Trophy,
  ClipboardList,
  Medal
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/exams', label: 'Exams', icon: BookOpen },
    { to: '/admin/students', label: 'Students', icon: Users },
  ];

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/exams', label: 'Available Exams', icon: ClipboardList },
    { to: '/history', label: 'My History', icon: Trophy },
    { to: '/leaderboard', label: 'Leaderboard', icon: Medal },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="w-64 bg-white h-screen border-r border-slate-100 flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-xl">
            Q
          </div>
          <span className="text-xl font-bold text-slate-800">QuizFlow</span>
        </div>

        <nav className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                  ? 'bg-green-50 text-primary font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <link.icon size={20} />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-semibold overflow-hidden border-2 border-white shadow-sm transition-all group-hover:scale-105">
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
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
