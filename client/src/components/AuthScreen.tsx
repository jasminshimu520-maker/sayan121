import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import {
  CheckCircle2,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Calendar,
  BellRing,
} from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: User, token: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('অনুগ্রহ করে জিমেইল ঠিকানা দিন');
      return;
    }
    if (!password) {
      setError('পাসওয়ার্ড লিখুন');
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        const res = await api.auth.login({ email: trimmedEmail, password });
        localStorage.setItem('auth_token', res.token);
        onAuthSuccess(res.user, res.token);
      } else {
        if (!name.trim()) {
          setError('আপনার পুরো নাম লিখুন');
          setLoading(false);
          return;
        }
        const res = await api.auth.signup({
          name: name.trim(),
          email: trimmedEmail,
          password,
        });
        localStorage.setItem('auth_token', res.token);
        onAuthSuccess(res.user, res.token);
      }
    } catch (err: any) {
      setError(err.message || 'অথেন্টিকেশন ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo user for instant testing
  const fillDemo = () => {
    setName('Demo User');
    setEmail('demo.user@gmail.com');
    setPassword('secret123');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Decorative gradient glow backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-md w-full relative z-10">
        
        {/* App Title Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/25 mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Smart Task Reminder
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            স্বয়ংক্রিয় ৩-দিনের জিমেইল নোটিফিকেশন ও টাস্ক শিডিউলার
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          {/* Tabs: Login vs Signup */}
          <div className="flex bg-slate-900/80 p-1 rounded-2xl mb-6 border border-slate-700/50">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                isLogin
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              লগইন (Sign In)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                !isLogin
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              নতুন অ্যাকাউন্ট (Sign Up)
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name field (Signup only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  আপনার পূর্ণ নাম (Full Name)
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sayan Ghosh"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Gmail Address field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                জিমেইল ঠিকানা (Gmail Address)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                ℹ️ এই জিমেইল ঠিকানাতেই আপনার সকল টাস্কের ৩-দিনের রিমাইন্ডার পাঠানো হবে।
              </p>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>লোড হচ্ছে...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isLogin ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">টেস্ট করতে চান?</span>
            <button
              type="button"
              onClick={fillDemo}
              className="font-bold text-indigo-400 hover:text-indigo-300 underline"
            >
              ডেমো তথ্য ফিল করুন
            </button>
          </div>

        </div>

        {/* Feature Pills */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400">
          <div className="flex flex-col items-center p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <Calendar className="w-4 h-4 text-indigo-400 mb-1" />
            <span>ইন্টারেক্টিভ ক্যালেন্ডার</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <BellRing className="w-4 h-4 text-amber-400 mb-1" />
            <span>৩-দিনের অটো রিমাইন্ডার</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
            <span>PWA & APK রেডি</span>
          </div>
        </div>

      </div>

    </div>
  );
};
