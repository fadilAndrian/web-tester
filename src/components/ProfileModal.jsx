import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  FlaskConical,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Calendar,
  History,
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated
}) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'activity'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Recent activity logs
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (currentUser && isOpen) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrorMessage('');
      setSuccessMessage('');
      loadActivity();
    }
  }, [currentUser, isOpen]);

  const loadActivity = async () => {
    if (!currentUser?.id) return;
    setLoadingLogs(true);
    try {
      const logs = await api.getUserLogs(currentUser.id);
      setActivityLogs(logs || []);
    } catch (e) {
      console.warn('Could not load user activity:', e.message);
    } finally {
      setLoadingLogs(false);
    }
  };

  if (!isOpen || !currentUser) return null;

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMessage('Nama dan email wajib diisi.');
      return;
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setErrorMessage('Masukkan kata sandi saat ini untuk memverifikasi penggantian kata sandi.');
        return;
      }
      if (formData.newPassword.length < 6) {
        setErrorMessage('Kata sandi baru minimal 6 karakter.');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setErrorMessage('Konfirmasi kata sandi baru tidak cocok.');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await api.updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        currentPassword: formData.currentPassword || undefined,
        newPassword: formData.newPassword || undefined
      });

      if (res && res.user) {
        onProfileUpdated(res.user);
        setSuccessMessage('Data profil berhasil diperbarui! Perubahan telah dicatat dalam audit log.');
        // Reset password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        await loadActivity();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memperbarui profil.');
    } finally {
      setLoading(false);
    }
  };

  const isSuperadmin = currentUser.role === 'superadmin';

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-zinc-800 flex items-start justify-between bg-gray-50/50 dark:bg-zinc-950/40">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs ${
                isSuperadmin ? 'bg-amber-500' : 'bg-blue-600'
              }`}
            >
              {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'ME'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-950 dark:text-white">
                  Profil Saya
                </h3>
                {isSuperadmin ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    <ShieldCheck className="w-3 h-3" /> Superadmin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                    <FlaskConical className="w-3 h-3" /> QA Tester
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Kelola informasi akun Anda dan pantau riwayat pembaruan profil.
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

        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 dark:border-zinc-800 px-5 bg-white dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Edit Data Pribadi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'activity'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Aktivitas Profil</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300">
              {activityLogs.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: EDIT PROFILE FORM */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Feedback banners */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-emerald-700 dark:text-emerald-400 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Personal Data Section */}
              <div className="space-y-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 block">
                  Informasi Akun
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>

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
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

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
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Peran / Hak Akses (Read-Only)
                    </label>
                    <div className="px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-100/70 dark:bg-zinc-800/50 text-gray-600 dark:text-zinc-400 flex items-center justify-between">
                      <span className="font-bold">
                        {isSuperadmin ? 'Superadmin' : 'QA Tester'}
                      </span>
                      <span className="text-[10px] text-gray-400">Dikelola Admin</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Bio / Catatan Pribadi
                  </label>
                  <textarea
                    rows={2}
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="Tuliskan catatan keahlian atau deskripsi peran Anda..."
                    className="w-full p-2.5 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Change Section */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 block">
                    Ubah Kata Sandi (Opsional)
                  </span>
                  <p className="text-[11px] text-gray-400 dark:text-zinc-500">
                    Kosongkan jika Anda tidak bermaksud mengganti kata sandi.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Kata Sandi Saat Ini
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => handleChange('currentPassword', e.target.value)}
                      placeholder="Masukkan password saat ini..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => handleChange('newPassword', e.target.value)}
                        placeholder="Min. 6 Karakter"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        placeholder="Ulangi kata sandi baru"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
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
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PROFILE ACTIVITY LOG */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h4 className="text-xs font-bold text-gray-950 dark:text-white">
                    Riwayat Perubahan Profil Akun Anda
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                    Setiap pembaruan data yang Anda simpan otomatis tercatat dalam audit log sistem.
                  </p>
                </div>
              </div>

              {loadingLogs ? (
                <div className="py-10 text-center text-gray-400 dark:text-zinc-500 text-xs">
                  <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Memuat riwayat aktivitas...
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="py-10 text-center rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50">
                  <History className="w-8 h-8 text-gray-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                    Belum ada riwayat aktivitas yang tercatat
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-zinc-800">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="relative group">
                      <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 bg-amber-500 shadow-2xs" />
                      <div className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-950/50">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            {log.action}
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(log.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-800 dark:text-zinc-200 leading-snug">
                          {log.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
