import React, { useState } from 'react';
import { User } from '../types';
import { authenticateUser, registerUser } from '../utils/storage';
import { BookOpen, Lock, Mail, User as UserIcon, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onCleanAll?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onCleanAll }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail) {
      setError('Please enter your email address');
      return;
    }

    if (!cleanPassword) {
      setError('Please enter your password');
      return;
    }

    if (mode === 'login') {
      const result = authenticateUser(cleanEmail, cleanPassword);
      if (!result.success || !result.user) {
        setError(result.error || 'Authentication failed. Please check your credentials.');
        return;
      }
      onLogin(result.user);
    } else {
      const cleanName = name.trim();
      if (!cleanName) {
        setError('Please enter your name');
        return;
      }
      if (cleanPassword.length < 4) {
        setError('Password should be at least 4 characters long');
        return;
      }

      const result = registerUser(cleanName, cleanEmail, cleanPassword);
      if (!result.success || !result.user) {
        setError(result.error || 'Could not register user. Please try a different email.');
        return;
      }
      onLogin(result.user);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand logo matching designed image */}
        <div className="mx-auto w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center text-white shadow-xs mb-4">
          <BookOpen className="w-6 h-6 stroke-[1.75]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          StudySpace
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500 max-w-sm mx-auto">
          Sign in with your email and password to open your personal study roadmaps and learning space.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-neutral-200 shadow-xs">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-neutral-100 p-1 mb-6">
            <button
              type="button"
              id="tab-login"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              id="tab-register"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="user-name" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="user-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. Gopi"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="user-email" className="block text-xs font-semibold text-neutral-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="user-password" className="block text-xs font-semibold text-neutral-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <span>{mode === 'login' ? 'Open My Study Space' : 'Create & Open My Space'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>
              {mode === 'login' ? "Don't have an account?" : 'Already registered?'}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="font-semibold text-neutral-900 hover:underline"
            >
              {mode === 'login' ? 'Sign up here' : 'Sign in here'}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-neutral-400">
          <p>Each user has their own private space and personal roadmaps.</p>
          {onCleanAll && (
            <button
              type="button"
              id="clean-all-data-login-btn"
              onClick={() => {
                if (confirm('Are you sure you want to clean all data? All saved accounts, roadmaps, and study spaces will be cleared.')) {
                  onCleanAll();
                }
              }}
              className="text-neutral-400 hover:text-red-500 underline transition-colors cursor-pointer text-[11px]"
            >
              Reset / Clean all site data
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
