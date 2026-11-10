import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  ShieldCheck,
  FlaskConical,
  Mail,
  Phone,
  Calendar,
  Clock,
  History,
  Info,
  ChevronDown,
  ChevronRight,
  Edit,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText
} from 'lucide-react';
import { api } from '../services/api';

export default function UserDetailModal({
  isOpen,
  onClose,
  user,
  onEditUser
}) {
  const [activeTab, setActiveTab] = useState('logs'); // default to 'logs' to highlight requirement!
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState({});

  useEffect(() => {
    if (isOpen && user?.id) {
      loadLogs();
    }
  }, [isOpen, user?.id]);

  const loadLogs = async () => {
    if (!user?.id) return;
    setLoadingLogs(true);
    try {
      const res = await api.getUserLogs(user.id);
      setLogs(res || []);
    } catch (err) {
      console.error('Failed to load user logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  if (!isOpen || !user) return null;

  const toggleExpandLog = (logId) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Pembuatan Akun
          </span>
        );
      case 'REGISTER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <User className="w-3 h-3" /> Registrasi Mandiri
          </span>
        );
      case 'PROFILE_UPDATE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            <User className="w-3 h-3" /> Update Profil Mandiri
          </span>
        );
      case 'PASSWORD_RESET':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-3 h-3" /> Reset Kata Sandi
          </span>
        );
      case 'UPDATE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <RefreshCw className="w-3 h-3" /> Perubahan Data
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const isSuperadmin = user.role === 'superadmin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header with User Quick Profile */}
        <div className="p-5 border-b border-gray-200 dark:border-zinc-800 flex items-start justify-between bg-gray-50/50 dark:bg-zinc-950/40">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs ${
                isSuperadmin ? 'bg-amber-500' : 'bg-blue-600'
              }`}
            >
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-950 dark:text-white">
                  {user.name}
                </h3>
                {isSuperadmin ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    <ShieldCheck className="w-3 h-3" /> Superadmin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                    <FlaskConical className="w-3 h-3" /> Tester
                  </span>
                )}

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    user.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                <Mail className="w-3 h-3" /> {user.email}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-zinc-800 px-5 bg-white dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'logs'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Log Perubahan Data (Audit Log)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300">
              {logs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'info'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Detail Pengguna Lengkap</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: LOGS (AUDIT HISTORY) */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h4 className="text-xs font-bold text-gray-950 dark:text-white">
                    Riwayat Audit Perubahan Data Pengguna
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                    Seluruh modifikasi profil, hak akses, dan status pengguna tercatat secara kronologis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadLogs}
                  disabled={loadingLogs}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400 text-xs flex items-center gap-1 transition-colors"
                  title="Segarkan Log"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                  <span className="text-[11px]">Refresh</span>
                </button>
              </div>

              {loadingLogs ? (
                <div className="py-12 text-center text-gray-400 dark:text-zinc-500 text-xs">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Memuat riwayat log perubahan...
                </div>
              ) : logs.length === 0 ? (
                <div className="py-10 text-center rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50">
                  <History className="w-8 h-8 text-gray-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                    Belum ada riwayat perubahan data
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
                    Aktivitas update data atau pergantian role akan otomatis tercatat di sini.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-zinc-800">
                  {logs.map((log) => {
                    const isExpanded = Boolean(expandedLogs[log.id]);
                    const hasDiff =
                      log.changes &&
                      ((log.changes.before && Object.keys(log.changes.before).length > 0) ||
                        (log.changes.after && Object.keys(log.changes.after).length > 0));

                    return (
                      <div key={log.id} className="relative group">
                        {/* Timeline Bullet */}
                        <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 bg-amber-500 shadow-2xs" />

                        {/* Log Item Card */}
                        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-950/60 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getActionBadge(log.action)}
                              <span className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                                Oleh: <strong className="text-gray-900 dark:text-white">{log.actorName || 'Sistem'}</strong>
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3" />
                              {formatDate(log.createdAt)}
                            </span>
                          </div>

                          {/* Details Message */}
                          <p className="text-xs text-gray-800 dark:text-zinc-200 font-medium leading-relaxed">
                            {log.details || 'Pembaruan data pengguna.'}
                          </p>

                          {/* Expandable Changes Diff */}
                          {hasDiff && (
                            <div className="mt-2.5 pt-2 border-t border-gray-200/60 dark:border-zinc-800/80">
                              <button
                                type="button"
                                onClick={() => toggleExpandLog(log.id)}
                                className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronDown className="w-3 h-3" /> Sembunyikan Detail Perubahan (Diff)
                                  </>
                                ) : (
                                  <>
                                    <ChevronRight className="w-3 h-3" /> Lihat Detail Perubahan (Diff)
                                  </>
                                )}
                              </button>

                              {isExpanded && (
                                <div className="mt-2 p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-[11px] space-y-1.5 font-mono overflow-x-auto">
                                  {log.changes.before &&
                                    Object.keys(log.changes.before).map((field) => (
                                      <div key={field} className="flex items-center gap-2">
                                        <span className="font-bold text-gray-600 dark:text-zinc-400 capitalize w-24 shrink-0">
                                          {field}:
                                        </span>
                                        <span className="text-rose-600 dark:text-rose-400 line-through bg-rose-50 dark:bg-rose-950/40 px-1 rounded">
                                          {log.changes.before[field] || '(kosong)'}
                                        </span>
                                        <span className="text-gray-400">→</span>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded">
                                          {log.changes.after[field] || '(kosong)'}
                                        </span>
                                      </div>
                                    ))}

                                  {/* For creation logs with only "after" fields */}
                                  {(!log.changes.before || Object.keys(log.changes.before).length === 0) &&
                                    log.changes.after &&
                                    Object.keys(log.changes.after).map((field) => (
                                      <div key={field} className="flex items-center gap-2">
                                        <span className="font-bold text-gray-600 dark:text-zinc-400 capitalize w-24 shrink-0">
                                          {field}:
                                        </span>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded">
                                          {log.changes.after[field] || '(kosong)'}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DETAILED INFO */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 block">
                    User ID
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-900 dark:text-white block mt-0.5">
                    {user.id}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 block">
                    Hak Akses / Peran
                  </span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block mt-0.5">
                    {user.role === 'superadmin' ? 'Superadmin (Akses Penuh)' : 'Tester (Automated Testing)'}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 block">
                    Nomor Telepon
                  </span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white block mt-0.5">
                    {user.phone || '-'}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 block">
                    Status Akun
                  </span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white block mt-0.5">
                    {user.status === 'active' ? 'Aktif (Dapat Login)' : 'Nonaktif (Dibekukan)'}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 block">
                    Terdaftar Pada
                  </span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white block mt-0.5">
                    {formatDate(user.createdAt)}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 block">
                    Terakhir Diperbarui
                  </span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white block mt-0.5">
                    {formatDate(user.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Bio / Description */}
              <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40">
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 block mb-1">
                  Bio / Catatan Pengguna
                </span>
                <p className="text-xs text-gray-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {user.bio || 'Tidak ada catatan atau bio untuk pengguna ini.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/40 flex items-center justify-between">
          <span className="text-[11px] text-gray-400 dark:text-zinc-500">
            Akses dikontrol oleh Superadministrator
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onEditUser) onEditUser(user);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Data Pengguna</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-200/60 dark:hover:bg-zinc-800 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
