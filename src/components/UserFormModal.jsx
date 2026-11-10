import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  FlaskConical,
  AlertCircle,
  KeyRound,
  FileText,
  CheckCircle2
} from 'lucide-react';

export default function UserFormModal({
  isOpen,
  onClose,
  initialUser = null, // null for create, object for edit
  onSave
}) {
  const isEditing = Boolean(initialUser);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'tester', // 'superadmin' | 'tester'
    password: '',
    status: 'active', // 'active' | 'inactive'
    bio: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialUser) {
      setFormData({
        name: initialUser.name || '',
        email: initialUser.email || '',
        phone: initialUser.phone || '',
        role: initialUser.role || 'tester',
        password: '', // blank on edit
        status: initialUser.status || 'active',
        bio: initialUser.bio || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'tester',
        password: '',
        status: 'active',
        bio: ''
      });
    }
    setErrorMessage('');
  }, [initialUser, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMessage('Nama dan email wajib diisi.');
      return;
    }

    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      setErrorMessage('Kata sandi awal wajib diisi (minimal 6 karakter).');
      return;
    }

    if (isEditing && formData.password && formData.password.length < 6) {
      setErrorMessage('Kata sandi baru minimal 6 karakter jika ingin diubah.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim()
      });
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menyimpan data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-950 dark:text-white">
                {isEditing ? 'Perbarui Data Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                {isEditing
                  ? 'Perubahan akan dicatat secara otomatis dalam audit log.'
                  : 'Buat akun pengguna baru dengan hak akses yang ditentukan.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Contoh: Sarah Connor"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Alamat Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="sarah@qa.local"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5">
              Role & Hak Akses <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Tester Card */}
              <button
                type="button"
                onClick={() => handleChange('role', 'tester')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  formData.role === 'tester'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 ring-1 ring-blue-500'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FlaskConical className={`w-4 h-4 ${formData.role === 'tester' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                  <span className={`text-xs font-bold ${formData.role === 'tester' ? 'text-blue-900 dark:text-blue-200' : 'text-gray-800 dark:text-zinc-200'}`}>
                    Tester
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-zinc-400 leading-tight">
                  Menjalankan tes otomasi & edit profil sendiri.
                </p>
              </button>

              {/* Superadmin Card */}
              <button
                type="button"
                onClick={() => handleChange('role', 'superadmin')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  formData.role === 'superadmin'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-500/10 ring-1 ring-amber-500'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className={`w-4 h-4 ${formData.role === 'superadmin' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`} />
                  <span className={`text-xs font-bold ${formData.role === 'superadmin' ? 'text-amber-900 dark:text-amber-200' : 'text-gray-800 dark:text-zinc-200'}`}>
                    Superadmin
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-zinc-400 leading-tight">
                  Akses penuh sistem & kelola Master User & log.
                </p>
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                {isEditing ? 'Reset Kata Sandi Baru (Opsional)' : 'Kata Sandi Awal'} {!isEditing && <span className="text-rose-500">*</span>}
              </label>
              {isEditing && (
                <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                  Kosongkan jika tidak diubah
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder={isEditing ? '•••••••• (Biarkan kosong untuk tetap memakai password lama)' : 'Minimal 6 karakter'}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Phone & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Nomor Telepon
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="08123456789"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Status Akun
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
              >
                <option value="active">Aktif (Dapat Login)</option>
                <option value="inactive">Nonaktif (Dibekukan)</option>
              </select>
            </div>
          </div>

          {/* Bio / Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Catatan / Deskripsi Tambahan
            </label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Catatan tanggung jawab, departemen, atau peran..."
              className="w-full p-2.5 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <span>{isEditing ? 'Simpan Perubahan' : 'Buat Pengguna'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
