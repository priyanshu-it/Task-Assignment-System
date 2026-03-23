
import React, { useState } from 'react';
import { Zap, Shield, User as UserIcon, Lock, ArrowRight, Info, Mail } from 'lucide-react';
import { User, TeamMember } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  members: TeamMember[];
}

const Login: React.FC<LoginProps> = ({ onLogin, members }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'admin' | 'employer'>('admin');

  // Specific state for employer login to avoid conflicts when switching tabs
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'apriyanshu@gmail.com' && password === '01234') {
      onLogin({
        email,
        name: 'Priyanshu (Admin)',
        role: 'admin'
      });
    } else {
      setError('Invalid admin credentials');
    }
  };

  const handleEmployerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if employee exists in the database
    const member = members.find(m => m.email.toLowerCase() === empEmail.toLowerCase());

    if (!member) {
      setError('Email not found in registered team members.');
      return;
    }

    // Default password check
    if (empPassword === '01234') {
      onLogin({
        email: member.email,
        name: member.name,
        role: 'employer'
      });
    } else {
      setError('Invalid password.');
    }
  };

  const inputClass = "w-full bg-slate-50 dark:bg-darkBg border border-slate-500 dark:border-darkBorder rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary transition-all text-slate-900 dark:text-white";
  const labelClass = "text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-widest ml-1";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-darkBg p-6 transition-colors duration-300">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-10">

          <h1 className="text-3xl font-black text-primary text-slate-900 dark:text-white uppercase tracking-tighter">Task-AI</h1>
          <p className="text-slate-500 dark:text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Smart Assignment Portal</p>
        </div>

        <div className="bg-white dark:bg-darkSurface border border-slate-500 dark:border-darkBorder rounded-xl overflow-hidden shadow-2xl shadow-primary/5">
          <div className="flex border-b border-slate-100 dark:border-darkBorder p-2">
            <button
              onClick={() => { setActiveTab('admin'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'admin'
                ? 'bg-blue-50 dark:bg-primary/10 text-blue-600 dark:text-primary'
                : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'
                }`}
            >
              <Shield size={18} /> Admin
            </button>
            <button
              onClick={() => { setActiveTab('employer'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'employer'
                ? 'bg-blue-50 dark:bg-primary/10 text-blue-600 dark:text-primary'
                : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'
                }`}
            >
              <UserIcon size={18} /> Employer
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'admin' ? (
              <form onSubmit={handleAdminLogin} className="space-y-5">

                <div className="space-y-1">
                  <label className={labelClass}>Admin Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className={inputClass}
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass}
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-xs font-bold bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/20 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Info size={14} /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 dark:bg-primary text-white dark:text-darkBg py-5 rounded-2xl font-black uppercase tracking-[0.15em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20 dark:shadow-primary/20"
                >
                  Log In as Admin
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmployerLogin} className="space-y-5">
                <div className="space-y-1">
                  <label className={labelClass}>Employer Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      placeholder="registered@email.com"
                      className={inputClass}
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Employer Id:</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={empPassword}
                      onChange={(e) => setEmpPassword(e.target.value)}
                      placeholder="******"
                      className={inputClass}
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-xs font-bold bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/20 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Info size={14} /> {error}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-slate-50 dark:bg-darkBg border-2 border-slate-200 dark:border-darkBorder text-slate-900 dark:text-white py-5 rounded-2xl font-black uppercase tracking-[0.15em] text-sm flex items-center justify-center gap-3 hover:bg-white dark:hover:bg-darkSurface hover:border-primary/50 transition-all shadow-sm"
                >
                  Employer Log In <ArrowRight size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
