'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiAlertCircle,
} from 'react-icons/fi';
import { RiGamepadLine } from 'react-icons/ri';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    // Fast background check if user already has a valid session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        window.location.href = redirect;
      }
    });
  }, [redirect, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : authError.message
      );
      setLoading(false);
      return;
    }

    // Site boundary enforcement
    const userEmail = authData?.user?.email?.toLowerCase() || '';
    if (userEmail.includes('@yonoallapps.com')) {
      await supabase.auth.signOut();
      setError('Access Denied: This account is only authorized for the Yono All Apps portal.');
      setLoading(false);
      return;
    }

    // Direct fast redirect
    window.location.href = redirect;
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-50 text-slate-900 transition-colors duration-200 overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
            <RiGamepadLine size={26} className="text-white" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-slate-900 ">
              Yono Portal
            </div>
            <div className="text-xs font-semibold text-indigo-600  uppercase tracking-wider">
              Admin Access
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 ">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500  mt-1">
            Sign in to manage your applications and links
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50  border border-rose-200  text-rose-600  text-xs font-medium">
              <FiAlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700  mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <FiMail
                size={16}
                className="absolute left-3.5 text-slate-400 pointer-events-none"
              />
              <input
                type="email"
                placeholder="admin@portal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <FiLock
                size={16}
                className="absolute left-3.5 text-slate-400 pointer-events-none"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 text-slate-400 hover:text-slate-700  transition-colors"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <FiArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 ">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
