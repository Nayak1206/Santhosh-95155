import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { Button, Input, Card } from '../../components/common/UI';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({ email, password });
      toast.success('Welcome back!');
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-200/40 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <Card className="max-w-md w-full p-10 relative z-10 border-none shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-2xl mb-6 shadow-lg shadow-green-200 transform hover:rotate-12 transition-transform">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Login to QuizFlow</h1>
          <p className="text-slate-500 mt-2">Enter your credentials to access the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="admin@quizplatform.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
              <Mail className="absolute left-3 bottom-3 text-slate-400" size={18} />
            </div>

            <div className="relative">
              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
              <Lock className="absolute left-3 bottom-3 text-slate-400" size={18} />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <a href="#" className="text-sm font-medium text-green-600 hover:text-green-700">Forgot password?</a>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-lg font-bold shadow-lg shadow-green-100"
          >
            {loading ? 'Logging in...' : 'Sign In'}
            {!loading && <ArrowRight size={20} />}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-600 font-bold hover:text-green-700 transition-colors">
              Create one for free
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
