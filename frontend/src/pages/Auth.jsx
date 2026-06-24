import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Search, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If user already logged in, redirect to search
    if (localStorage.getItem('rivyou_token')) {
      navigate('/');
    }
  }, [navigate]);

  const validate = () => {
    const newErrors = {};
    if (!username) newErrors.username = 'Username is required';
    if (!isLogin) {
      if (!email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Invalid email format';
      }
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;

    setLoading(true);
    try {
      if (isLogin) {
        const response = await api.post('/api/auth/login', { username, password });
        localStorage.setItem('rivyou_token', response.data.token);
        localStorage.setItem('rivyou_refresh', response.data.refresh);
        localStorage.setItem('rivyou_user', JSON.stringify(response.data.user));
        navigate('/');
      } else {
        const response = await api.post('/api/auth/register', { username, email, password });
        // Auto-login or store registration response token
        localStorage.setItem('rivyou_token', response.data.token);
        localStorage.setItem('rivyou_user', JSON.stringify({ id: response.data.id, username: response.data.username }));
        navigate('/');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const serverErrors = err.response.data;
        if (typeof serverErrors === 'object') {
          // Flatten dictionary errors for inline display
          const formatted = {};
          Object.keys(serverErrors).forEach((key) => {
            formatted[key] = Array.isArray(serverErrors[key]) ? serverErrors[key][0] : serverErrors[key];
          });
          setErrors(formatted);
        } else {
          setErrors({ non_field_errors: err.response.data.error || 'Something went wrong.' });
        }
      } else {
        setErrors({ non_field_errors: 'Server unreachable. Please check your connection.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F0F4FF]">
      
      {/* Left Branding Panel */}
      <div className="w-full md:w-1/2 bg-gradient-to-tr from-[#5B4FE8] via-[#7C72FF] to-[#FF6B35] flex flex-col justify-between p-8 md:p-16 text-white relative overflow-hidden">
        
        {/* Abstract Background Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

        {/* Top Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/20">
            <Search className="w-6 h-6 text-[#5B4FE8] stroke-[3]" />
          </div>
          <span className="font-heading text-2xl font-bold tracking-tight">Rivyou</span>
        </div>

        {/* Tagline & Discovery Intro */}
        <div className="my-auto py-12 md:py-0 z-10 max-w-lg">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Find the <span className="underline decoration-accent decoration-wavy underline-offset-8">right</span> product, not just any product.
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-8">
            Rivyou's intelligent three-tier relevance search cuts through noise and handles typos automatically, matching category context, specialized tags, and keywords.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">Category Matching</span>
            <span className="px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">Typo Tolerance</span>
            <span className="px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">Relevance Scoring</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-white/60 text-sm z-10 mt-auto">
          © {new Date().getFullYear()} Rivyou Platform. Discovery re-imagined.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="font-heading text-3xl font-bold text-[#1A1040]">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-textmuted mt-2">
              {isLogin ? 'Enter details to access the search portal' : 'Get started by creating your user profile'}
            </p>
          </div>

          {errors.non_field_errors && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errors.non_field_errors}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1040] mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-textmuted" />
                <input
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-[#F0F4FF] border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-[#1A1040] font-medium ${
                    errors.username ? 'border-red-500 ring-2 ring-red-100' : 'border-[#EEF2FF]'
                  }`}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.username}
                </p>
              )}
            </div>

            {/* Email (only for registration) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1040] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-textmuted" />
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 bg-[#F0F4FF] border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-[#1A1040] font-medium ${
                      errors.email ? 'border-red-500 ring-2 ring-red-100' : 'border-[#EEF2FF]'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                  </p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1040] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-textmuted" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-[#F0F4FF] border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-[#1A1040] font-medium ${
                    errors.password ? 'border-red-500 ring-2 ring-red-100' : 'border-[#EEF2FF]'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5B4FE8] hover:bg-[#4639D2] active:scale-[0.98] text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 group transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Link */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-[#5B4FE8] font-semibold hover:underline"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Auth;
