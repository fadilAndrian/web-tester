import React, { useState } from 'react';
import {
  X,
  Plus,
  Edit3,
  Trash2,
  FolderKanban,
  Globe,
  CheckCircle2,
  ExternalLink,
  Save,
  ArrowLeft
} from 'lucide-react';

const PROJECT_COLORS = [
  { label: 'Sky Blue', value: '#0284c7' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Teal', value: '#14b8a6' }
];

export default function ProjectModal({
  isOpen,
  onClose,
  projects = [],
  activeProjectId,
  onSelectProject,
  onSaveProject,
  onDeleteProject
}) {
  const [mode, setMode] = useState('list'); // 'list' | 'create' | 'edit'
  const [editingProj, setEditingProj] = useState({
    id: '',
    name: '',
    description: '',
    base_url: '',
    color: '#0284c7'
  });

  if (!isOpen) return null;

  const handleOpenCreate = () => {
    setEditingProj({
      id: '',
      name: '',
      description: '',
      base_url: '',
      color: PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)].value
    });
    setMode('create');
  };

  const handleOpenEdit = (proj, e) => {
    e.stopPropagation();
    setEditingProj({
      id: proj.id,
      name: proj.name,
      description: proj.description || '',
      base_url: proj.base_url || proj.baseUrl || '',
      color: proj.color || '#0284c7'
    });
    setMode('edit');
  };

  const handleSubmitSave = async (e) => {
    e.preventDefault();
    if (!editingProj.name.trim()) {
      alert('Nama projek wajib diisi');
      return;
    }
    await onSaveProject({
      ...editingProj,
      id: editingProj.id || `proj-${Date.now()}`
    });
    setMode('list');
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (confirm(`Hapus projek "${name}" beserta seluruh skenario dan test suites di dalamnya?`)) {
      await onDeleteProject(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-gray-50/70 dark:bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-950 dark:text-white">
                {mode === 'list'
                  ? 'Manajemen Projek Pengujian'
                  : mode === 'create'
                  ? 'Setup Projek Pengujian Baru'
                  : 'Edit Konfigurasi Projek'}
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                {mode === 'list'
                  ? 'Pilih atau kelola ruang kerja projek QA independen.'
                  : 'Tentukan nama sistem, domain URL staging/dev, dan label identitas.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'list' ? (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Projek Baru</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode('list')}
                className="p-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {mode === 'list' ? (
            <div className="space-y-3">
              {projects.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-400">Belum ada projek. Buat projek baru.</div>
              ) : (
                projects.map((proj) => {
                  const isActive = proj.id === activeProjectId;
                  return (
                    <div
                      key={proj.id}
                      onClick={() => {
                        onSelectProject(proj.id);
                        onClose();
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isActive
                          ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-500/5 ring-1 ring-amber-500/30'
                          : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span
                          className="w-3.5 h-3.5 rounded-md mt-1 shrink-0 shadow-xs"
                          style={{ backgroundColor: proj.color || '#0284c7' }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-950 dark:text-white truncate">
                              {proj.name}
                            </h3>
                            {isActive && (
                              <span className="text-[10px] font-semibold uppercase px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                Aktif
                              </span>
                            )}
                          </div>
                          {proj.description && (
                            <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                              {proj.description}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400 dark:text-zinc-500 mt-1">
                            <Globe className="w-3 h-3" />
                            <span className="truncate">{proj.base_url || proj.baseUrl || 'Tanpa Base URL'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(proj, e)}
                          title="Edit Konfigurasi Projek"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {projects.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleDelete(proj.id, proj.name, e)}
                            title="Hapus Projek"
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Create / Edit Form */
            <form onSubmit={handleSubmitSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-200 mb-1">
                  Nama Projek <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Health-E Iris (Dev Staging), Portal Pasien"
                  value={editingProj.name}
                  onChange={(e) => setEditingProj((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-200 mb-1">
                  Base URL Default Projek
                </label>
                <input
                  type="url"
                  placeholder="https://dev-health-e-iris.pixelatee.com"
                  value={editingProj.base_url}
                  onChange={(e) => setEditingProj((prev) => ({ ...prev, base_url: e.target.value }))}
                  className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white font-mono text-[11px] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-200 mb-1">
                  Deskripsi Projek (Opsional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Catatan mengenai ruang lingkup sistem yang diuji..."
                  value={editingProj.description}
                  onChange={(e) => setEditingProj((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white resize-none focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-200 mb-1.5">
                  Warna Label Identitas
                </label>
                <div className="flex items-center gap-2">
                  {PROJECT_COLORS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setEditingProj((prev) => ({ ...prev, color: col.value }))}
                      style={{ backgroundColor: col.value }}
                      className={`w-7 h-7 rounded-lg transition-transform ${
                        editingProj.color === col.value ? 'scale-110 ring-2 ring-offset-2 ring-gray-900 dark:ring-white' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={col.label}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Projek</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
