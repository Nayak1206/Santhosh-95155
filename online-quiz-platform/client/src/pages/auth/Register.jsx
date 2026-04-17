import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button, Input, Card } from '../../components/common/UI';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      toast.success('Registration successful! Welcome.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-200/40 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <Card className="max-w-md w-full p-10 relative z-10 border-none shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-2xl mb-6 shadow-lg shadow-green-200 transform hover:-rotate-12 transition-transform">
            <User size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Join QuizFlow</h1>
          <p className="text-slate-500 mt-2">Create your student account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Input
              label="Full Name"
              name="name"
              required
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="pl-10"
            />
            <User className="absolute left-3 bottom-3 text-slate-400" size={18} />
          </div>

          <div className="relative">
            <Input
              label="Email Address"
              name="email"
              type="email"
              required
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              className="pl-10"
            />
            <Mail className="absolute left-3 bottom-3 text-slate-400" size={18} />
          </div>

          <div className="relative">
            <Input
              label="Password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="pl-10"
            />
            <Lock className="absolute left-3 bottom-3 text-slate-400" size={18} />
          </div>

          <div className="relative">
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="pl-10"
            />
            <Lock className="absolute left-3 bottom-3 text-slate-400" size={18} />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-lg font-bold shadow-lg shadow-green-100 mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
            {!loading && <ArrowRight size={20} />}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 font-bold hover:text-green-700 transition-colors">
              Sign in instead
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
