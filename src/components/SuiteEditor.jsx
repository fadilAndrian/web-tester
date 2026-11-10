import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Play,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  Shield,
  Globe,
  History
} from 'lucide-react';
import Toast from './Toast';

export default function SuiteEditor({
  suite,
  scenarios,
  onSave,
  onBack,
  onSaveAndRun,
  onViewHistory
}) {
  const [formData, setFormData] = useState({
    id: suite?.id || '',
    name: suite?.name || '',
    description: suite?.description || '',
    scenarioIds: suite?.scenarioIds ? [...suite.scenarioIds] : [],
    keepSession: suite?.keepSession || false
  });

  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' });
  const [selectedScenarioToAdd, setSelectedScenarioToAdd] = useState('');

  const scenarioMap = (scenarios || []).reduce((acc, s) => {
    acc[s.id] = s;
    return acc;
  }, {});

  const handleFieldChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const addScenarioToSuite = () => {
    if (!selectedScenarioToAdd) return;
    setFormData((prev) => ({
      ...prev,
      scenarioIds: [...prev.scenarioIds, selectedScenarioToAdd]
    }));
    setSelectedScenarioToAdd('');
  };

  const removeScenarioFromSuite = (index) => {
    setFormData((prev) => ({
      ...prev,
      scenarioIds: prev.scenarioIds.filter((_, idx) => idx !== index)
    }));
  };

  const moveScenario = (index, direction) => {
    const list = [...formData.scenarioIds];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    setFormData((prev) => ({ ...prev, scenarioIds: list }));
  };

  const handleSubmit = async (runAfter = false) => {
    if (!formData.name.trim()) {
      setToast({
        show: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Mohon masukkan Nama Test Suite terlebih dahulu.'
      });
      return;
    }
    if (formData.scenarioIds.length === 0) {
      setToast({
        show: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Pilih setidaknya 1 skenario pengujian untuk dimasukkan ke dalam suite.'
      });
      return;
    }

    const payload = {
      ...formData,
      id: formData.id || `suite-${Date.now()}`
    };

    try {
      if (runAfter) {
        await onSaveAndRun(payload);
        setFormData((prev) => ({ ...prev, id: payload.id }));
        setToast({
          show: true,
          type: 'success',
          title: 'Tersimpan & Dijalankan',
          message: 'Test Suite berhasil disimpan dan runner pengujian dimulai.'
        });
      } else {
        await onSave(payload);
        setFormData((prev) => ({ ...prev, id: payload.id }));
        setToast({
          show: true,
          type: 'success',
          title: 'Suite Tersimpan',
          message: 'Perubahan Test Suite berhasil disimpan ke penyimpanan lokal.'
        });
      }
    } catch (err) {
      setToast({
        show: true,
        type: 'error',
        title: 'Gagal Menyimpan',
        message: err.message || 'Terjadi kesalahan saat menyimpan test suite.'
      });
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-950 dark:text-white">
              {formData.id ? 'Edit Test Suite' : 'Buat Test Suite Baru'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Rangkaikan beberapa skenario independen menjadi satu alur pengujian terpadu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {formData.id && onViewHistory && (
            <button
              type="button"
              onClick={() => onViewHistory(formData)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
            >
              <History className="w-3.5 h-3.5 text-amber-500" />
              <span>Riwayat Suite Ini</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Suite</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-xs focus:ring-2 focus:ring-amber-500/30 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simpan & Jalankan</span>
          </button>
        </div>
      </div>

      {/* Basic Setup Card */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            1. Informasi Test Suite
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Nama dan tujuan pengujian gabungan.
          </p>
        </div>

        <div className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-zinc-200 mb-1">
              Nama Test Suite <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Regression Checkout & Pembayaran, Smoke Test E2E"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-zinc-200 mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              rows="2"
              placeholder="Catatan mengenai alur pengujian skenario ini..."
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Keep session toggle */}
          <div className="pt-3 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" />
                Pertahankan Sesi Browser (Shared Session / Keep Cookies)
              </span>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                Jika aktif, cookies dan login dari skenario 1 akan diteruskan ke skenario berikutnya tanpa perlu login ulang.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.keepSession}
                onChange={(e) => handleFieldChange('keepSession', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Sequence & Ordering */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-bold text-gray-950 dark:text-white">
              2. Susunan Urutan Skenario (Execution Sequence)
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Urutan dari atas ke bawah menentukan alur eksekusi browser saat test suite dijalankan.
            </p>
          </div>

          {/* Add Scenario Picker */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedScenarioToAdd}
              onChange={(e) => setSelectedScenarioToAdd(e.target.value)}
              className="bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-xs text-gray-900 dark:text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="">-- Pilih Skenario untuk Ditambahkan --</option>
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name} ({sc.steps?.length || 0} langkah)
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={addScenarioToSuite}
              disabled={!selectedScenarioToAdd}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedScenarioToAdd
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-2xs'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {/* List with Reorder Controls */}
        {formData.scenarioIds.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl text-gray-400 dark:text-zinc-500 text-xs">
            Belum ada skenario dalam suite ini. Pilih skenario pada dropdown di atas dan klik tombol "Tambah".
          </div>
        ) : (
          <div className="space-y-2">
            {formData.scenarioIds.map((scId, index) => {
              const sc = scenarioMap[scId];
              const isFirst = index === 0;
              const isLast = index === formData.scenarioIds.length - 1;

              return (
                <div
                  key={`${scId}-${index}`}
                  className="flex items-center justify-between gap-3 bg-gray-50/70 dark:bg-zinc-950/70 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {sc ? sc.name : `Skenario Tidak Ditemukan (${scId})`}
                      </h3>
                      {sc && (
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">
                          <span className="flex items-center gap-1 font-mono">
                            <Globe className="w-3 h-3 text-gray-400 dark:text-zinc-500" />
                            {sc.baseUrl || 'Tanpa URL'}
                          </span>
                          <span>•</span>
                          <span>{sc.steps?.length || 0} langkah pengujian</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveScenario(index, -1)}
                      disabled={isFirst}
                      title="Geser urutan lebih dulu (Ke atas)"
                      className={`p-1.5 rounded transition-colors ${
                        isFirst
                          ? 'text-gray-300 dark:text-zinc-700 cursor-not-allowed'
                          : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => moveScenario(index, 1)}
                      disabled={isLast}
                      title="Geser urutan belakangan (Ke bawah)"
                      className={`p-1.5 rounded transition-colors ${
                        isLast
                          ? 'text-gray-300 dark:text-zinc-700 cursor-not-allowed'
                          : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeScenarioFromSuite(index)}
                      title="Hapus dari suite ini"
                      className="p-1.5 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filament Notification Toast */}
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
