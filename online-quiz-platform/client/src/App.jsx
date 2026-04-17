import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import ExamManagement from './pages/admin/ExamManagement';
import ExamQuestions from './pages/admin/ExamQuestions';
import ExamResults from './pages/admin/ExamResults';
import AdminDetailedResult from './pages/admin/DetailedResult';
import AdminProfile from './pages/admin/Profile';
import Settings from './pages/admin/Settings';
import StudentManagement from './pages/admin/StudentManagement';
import StudentHistory from './pages/admin/StudentHistory';
import StudentDashboard from './pages/student/StudentDashboard';
import AvailableExams from './pages/student/AvailableExams';
import ExamAttempt from './pages/student/ExamAttempt';
import ExamResult from './pages/student/ExamResult';
import AttemptHistory from './pages/student/AttemptHistory';
import StudentProfile from './pages/student/Profile';
import StudentSettings from './pages/student/Settings';
import Leaderboard from './pages/student/Leaderboard';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' 
    ? <Navigate to="/admin/dashboard" replace /> 
    : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute><AvailableExams /></ProtectedRoute>} />
          <Route path="/exam/:attemptId/attempt" element={<ProtectedRoute><ExamAttempt /></ProtectedRoute>} />
          <Route path="/exam/:attemptId/result" element={<ProtectedRoute><ExamResult /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><AttemptHistory /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><StudentSettings /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/exams" element={<AdminRoute><ExamManagement /></AdminRoute>} />
          <Route path="/admin/exams/:id/questions" element={<AdminRoute><ExamQuestions /></AdminRoute>} />
          <Route path="/admin/exams/:id/results" element={<AdminRoute><ExamResults /></AdminRoute>} />
          <Route path="/admin/exams/results/:attemptId" element={<AdminRoute><AdminDetailedResult /></AdminRoute>} />
          <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><Settings /></AdminRoute>} />
          <Route path="/admin/students" element={<AdminRoute><StudentManagement /></AdminRoute>} />
          <Route path="/admin/students/:id" element={<AdminRoute><StudentHistory /></AdminRoute>} />

          {/* Fallback */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;
