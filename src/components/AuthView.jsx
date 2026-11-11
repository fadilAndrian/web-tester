import React, { useState } from 'react';
import {
  FlaskConical,
  Lock,
  Mail,
  User,
  Phone,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { api } from '../services/api';

export default function AuthView({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errorMessage) setErrorMessage('');
  };

  const handleQuickLogin = (email, password) => {
    setFormData((prev) => ({
      ...prev,
      email,
      password
    }));
    setMode('login');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!formData.email.trim() || !formData.password) {
          throw new Error('Email dan kata sandi wajib diisi.');
        }
        const res = await api.login({
          email: formData.email.trim(),
          password: formData.password
        });
        if (res && res.user) {
          onLoginSuccess(res.user);
        }
      } else {
        // Register mode
        if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
          throw new Error('Nama, email, dan kata sandi wajib diisi.');
        }
        if (formData.password.length < 6) {
          throw new Error('Kata sandi minimal 6 karakter.');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Konfirmasi kata sandi tidak cocok.');
        }

        const res = await api.register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password
        });
        if (res && res.user) {
          onLoginSuccess(res.user);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4 sm:p-6 transition-colors duration-150 select-none">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/10 dark:bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/30 mb-4 transition-transform hover:scale-105">
            <FlaskConical className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            QA Flow Studio
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Enterprise Test Automation Platform & Orchestrator
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl p-6 sm:p-8 backdrop-blur-sm">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-gray-100 dark:bg-zinc-800/80 p-1 mb-6 border border-gray-200/50 dark:border-zinc-700/50">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-400 shadow-xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-400 shadow-xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-400 text-xs animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            {/* Phone Field (Register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Nomor Telepon (Opsional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="081234567890"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Kata Sandi
                </label>
                {mode === 'register' && (
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500">Min. 6 Karakter</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Role Notice on Register */}
            {mode === 'register' && (
              <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-2 text-[11px] text-blue-700 dark:text-blue-300">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" />
                <span>
                  Akun Anda akan didaftarkan sebagai role <strong>Tester</strong>. Akses Superadmin dikelola langsung oleh Administrator.
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-amber-600/20 transition-all mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Masuk ke Aplikasi' : 'Daftar Sekarang'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Credentials (Convenience Bar) */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 tracking-wider block mb-2.5">
              Akun Percobaan (1-Klik Demo)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@qa.local', 'admin123')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-amber-200/80 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-500/10 hover:bg-amber-100/70 dark:hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-semibold transition-all group"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                <span>Superadmin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('tester@qa.local', 'tester123')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-blue-200/80 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-500/10 hover:bg-blue-100/70 dark:hover:bg-blue-500/20 text-blue-800 dark:text-blue-300 text-[11px] font-semibold transition-all group"
              >
                <FlaskConical className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                <span>Tester</span>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-2">
              Password default: <code className="text-gray-600 dark:text-zinc-400">admin123</code> / <code className="text-gray-600 dark:text-zinc-400">tester123</code>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-gray-400 dark:text-zinc-600 mt-6">
          QA Flow Studio © 2026. Automated Playwright Engine & Multi-tenant RBAC.
        </p>
      </div>
    </div>
  );
}
