import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  FlaskConical,
  Search,
  Filter,
  History,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  RefreshCw,
  Eye,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import UserDetailModal from './UserDetailModal';
import UserFormModal from './UserFormModal';
import Toast from './Toast';

export default function UserManagementView({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'superadmin' | 'tester'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  // Modals state
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null); // null = create mode, object = edit mode

  // Toast notification
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showToast = (type, title, message) => {
    setToast({ show: true, type, title, message });
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers({
        search: searchQuery,
        role: roleFilter,
        status: statusFilter
      });
      setUsers(data || []);
    } catch (err) {
      showToast('error', 'Gagal Memuat Pengguna', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'superadmin') {
      loadUsers();
    }
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  // Guard: If not superadmin
  if (currentUser?.role !== 'superadmin') {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Akses Khusus Superadministrator
        </h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-md mt-1 leading-relaxed">
          Sesuai kebijakan keamanan, menu Master User dan manajemen hak akses pengguna hanya dapat dikelola oleh akun dengan peran <strong>Superadmin</strong>.
        </p>
      </div>
    );
  }

  // Handle Create or Update User
  const handleSaveUser = async (formData) => {
    if (userToEdit) {
      // Update existing user
      await api.updateUser(userToEdit.id, formData);
      showToast('success', 'Pengguna Diperbarui', `Data ${formData.name} berhasil diperbarui dan dicatat dalam audit log.`);
    } else {
      // Create new user
      await api.createUser(formData);
      showToast('success', 'Pengguna Dibuat', `Akun baru ${formData.name} berhasil ditambahkan ke sistem.`);
    }
    await loadUsers();
  };

  // Handle Delete User
  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }

    if (
      confirm(
        `Yakin ingin menghapus pengguna "${targetUser.name}" (${targetUser.email})?\n\nSemua riwayat pengujian dan log perubahan akun ini akan dibersihkan.`
      )
    ) {
      try {
        await api.deleteUser(targetUser.id);
        showToast('success', 'Pengguna Dihapus', `Akun ${targetUser.name} telah berhasil dihapus.`);
        await loadUsers();
      } catch (err) {
        showToast('error', 'Gagal Menghapus', err.message);
      }
    }
  };

  // Calculate Metrics
  const totalCount = users.length;
  const superadminCount = users.filter((u) => u.role === 'superadmin').length;
  const testerCount = users.filter((u) => u.role === 'tester').length;
  const activeCount = users.filter((u) => u.role === 'active').length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none transition-colors duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-950 dark:text-white">
              Master User & Hak Akses
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Manajemen data pengguna terpusat, kontrol peran (Superadmin & Tester), dan audit log perubahan data.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setUserToEdit(null);
            setIsFormModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-sm shadow-amber-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Metrics / Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Pengguna
            </span>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-950 dark:text-white mt-1">
            {totalCount}
          </div>
          <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5 block">
            Seluruh akun terdaftar
          </span>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Superadmin
            </span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {superadminCount}
          </div>
          <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5 block">
            Akses sistem & Master User
          </span>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              QA Tester
            </span>
            <FlaskConical className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {testerCount}
          </div>
          <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5 block">
            Eksekusi otomasi & skenario
          </span>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Akun Aktif
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {activeCount}
          </div>
          <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5 block">
            Dapat melakukan login
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, email, atau no telepon..."
            className="w-full pl-9 pr-20 py-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold text-gray-700 dark:text-zinc-300 bg-gray-200/60 dark:bg-zinc-700 rounded-md hover:bg-gray-300/60 dark:hover:bg-zinc-600 transition-colors"
          >
            Cari
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-lg bg-gray-100 dark:bg-zinc-800 p-0.5 border border-gray-200/60 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                roleFilter === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-gray-950 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
              }`}
            >
              Semua Role
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('superadmin')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                roleFilter === 'superadmin'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
              }`}
            >
              Superadmin
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('tester')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                roleFilter === 'tester'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
              }`}
            >
              Tester
            </button>
          </div>

          <div className="flex items-center rounded-lg bg-gray-100 dark:bg-zinc-800 p-0.5 border border-gray-200/60 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-gray-950 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
              }`}
            >
              Semua Status
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
              }`}
            >
              Aktif
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                statusFilter === 'inactive'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900'
              }`}
            >
              Nonaktif
            </button>
          </div>

          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400 transition-colors"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50/75 dark:bg-zinc-950/60 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                <th className="py-3.5 px-5">Pengguna</th>
                <th className="py-3.5 px-4">Role & Hak Akses</th>
                <th className="py-3.5 px-4">Kontak Telepon</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Terdaftar</th>
                <th className="py-3.5 px-5 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 dark:text-zinc-500">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Memuat data master user...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 dark:text-zinc-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Tidak ada pengguna yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuperadmin = u.role === 'superadmin';
                  const isSelf = u.id === currentUser?.id;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 transition-colors group"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs ${
                              isSuperadmin ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                          >
                            {u.name ? u.name.slice(0, 2).toUpperCase() : 'US'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-950 dark:text-white truncate">
                                {u.name}
                              </span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300">
                                  Anda
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-500 dark:text-zinc-400 flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 text-gray-400" /> {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isSuperadmin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            <ShieldCheck className="w-3.5 h-3.5" /> Superadmin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                            <FlaskConical className="w-3.5 h-3.5" /> Tester
                          </span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-600 dark:text-zinc-400 font-mono text-[11px]">
                        {u.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" /> {u.phone}
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-zinc-600">-</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {u.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Nonaktif
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-500 dark:text-zinc-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {formatDate(u.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Detail & Audit Log */}
                          <button
                            type="button"
                            onClick={() => setSelectedUserForDetail(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-zinc-300 bg-gray-100/80 dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400 hover:border-amber-500/30 border border-gray-200/50 dark:border-zinc-700 transition-all"
                            title="Lihat Detail & Audit Log Perubahan"
                          >
                            <History className="w-3.5 h-3.5 text-amber-500" />
                            <span>Detail & Log</span>
                          </button>

                          {/* Edit User */}
                          <button
                            type="button"
                            onClick={() => {
                              setUserToEdit(u);
                              setIsFormModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit Data Pengguna"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User */}
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            disabled={isSelf}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSelf
                                ? 'text-gray-300 dark:text-zinc-700 cursor-not-allowed'
                                : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10'
                            }`}
                            title={isSelf ? 'Tidak dapat menghapus akun Anda sendiri' : 'Hapus Pengguna'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail & Audit Log Modal */}
      <UserDetailModal
        isOpen={Boolean(selectedUserForDetail)}
        user={selectedUserForDetail}
        onClose={() => setSelectedUserForDetail(null)}
        onEditUser={(u) => {
          setSelectedUserForDetail(null);
          setUserToEdit(u);
          setIsFormModalOpen(true);
        }}
      />

      {/* User Create / Edit Form Modal */}
      <UserFormModal
        isOpen={isFormModalOpen}
        initialUser={userToEdit}
        onClose={() => {
          setIsFormModalOpen(false);
          setUserToEdit(null);
        }}
        onSave={handleSaveUser}
      />

      {/* Toast Feedback */}
      <Toast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
