import React, { useState } from 'react';
import {
  Play,
  Edit3,
  Trash2,
  Copy,
  Globe,
  ListOrdered,
  ShieldCheck,
  Search,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  FlaskConical,
  History,
  FolderKanban,
  Plus,
  Boxes
} from 'lucide-react';
import StatsOverview from './StatsOverview';

export default function ScenarioList({
  activeProject,
  modules = [],
  activeModuleId = null,
  onSelectModule,
  onAddModule,
  scenarios,
  suites,
  history,
  onRunScenario,
  onEditScenario,
  onDeleteScenario,
  onDuplicateScenario,
  onCreateNew,
  onViewHistory
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewStyle, setViewStyle] = useState('table'); // 'table' | 'grid'

  const moduleMap = (modules || []).reduce((acc, m) => {
    acc[m.id] = m;
    return acc;
  }, {});

  const filtered = scenarios.filter((s) => {
    if (activeModuleId && s.moduleId !== activeModuleId && s.module_id !== activeModuleId) {
      return false;
    }
    const q = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.baseUrl && s.baseUrl.toLowerCase().includes(q));
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Filament Stats Overview Widgets */}
      <StatsOverview scenarios={scenarios} suites={suites} history={history} />

      {/* Filament Resource Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-950 dark:text-white">
            Skenario Pengujian
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Kelola definisi tes web, parameter URL tujuan, autentikasi otomatis, dan rangkaian aksi step.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3 top-2" />
            <input
              type="text"
              placeholder="Cari skenario atau URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Table / Grid Toggle */}
          <div className="flex items-center border border-gray-300 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 p-0.5">
            <button
              onClick={() => setViewStyle('table')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewStyle === 'table'
                  ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-medium'
                  : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
              }`}
              title="Tampilan Tabel"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewStyle('grid')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewStyle === 'grid'
                  ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-medium'
                  : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Module / Folder Tabs Bar */}
      <div className="flex items-center gap-1.5 flex-wrap pb-1 border-b border-gray-200 dark:border-zinc-800">
        <span className="text-[10px] font-bold uppercase text-gray-400 dark:text-zinc-500 mr-1 flex items-center gap-1">
          <FolderKanban className="w-3 h-3 text-amber-500" />
          <span>Folder Modul:</span>
        </span>

        <button
          type="button"
          onClick={() => onSelectModule && onSelectModule(null)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
            activeModuleId === null
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
          }`}
        >
          Semua ({scenarios.length})
        </button>

        {modules.map((m) => {
          const count = scenarios.filter((s) => (s.moduleId || s.module_id) === m.id).length;
          const isSelected = activeModuleId === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectModule && onSelectModule(m.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{m.name}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-amber-700 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onAddModule}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 border border-dashed border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors flex items-center gap-1 ml-1 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Tambah Modul</span>
        </button>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-gray-400 dark:text-zinc-500 mb-3">
            <FlaskConical className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Tidak ada skenario ditemukan</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            {searchTerm
              ? 'Tidak ada skenario yang cocok dengan kata kunci pencarian.'
              : 'Belum ada skenario pengujian yang dibuat. Mulai dengan membuat skenario test baru.'}
          </p>
          {!searchTerm && (
            <button
              onClick={onCreateNew}
              className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-all inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Setup Skenario Pertama
            </button>
          )}
        </div>
      ) : viewStyle === 'table' ? (
        /* Filament Resource Table */
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-zinc-950/60 border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3">Nama Skenario</th>
                  <th className="px-5 py-3">Modul</th>
                  <th className="px-5 py-3">Target Halaman (URL)</th>
                  <th className="px-5 py-3">Langkah</th>
                  <th className="px-5 py-3">Autentikasi</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                {filtered.map((scenario) => {
                  const enabledSteps = (scenario.steps || []).filter((s) => s.enabled !== false).length;
                  const fallbackCount = (scenario.steps || []).reduce((acc, s) => acc + (Array.isArray(s.fallbacks) ? s.fallbacks.length : 0), 0);
                  const hasAuth = scenario.authConfig && scenario.authConfig.enabled;
                  const mod = moduleMap[scenario.moduleId || scenario.module_id];

                  return (
                    <tr
                      key={scenario.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Name & Desc */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {scenario.name}
                          </span>
                          {(scenario.isComponent || (Array.isArray(scenario.tags) && scenario.tags.includes('component'))) && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                              <Boxes className="w-2.5 h-2.5 text-violet-500" />
                              Komponen
                            </span>
                          )}
                        </div>
                        {scenario.description && (
                          <div className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                            {scenario.description}
                          </div>
                        )}
                      </td>

                      {/* Module Badge */}
                      <td className="px-5 py-3.5">
                        {mod ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                            <FolderKanban className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>{mod.name}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-zinc-500 text-[11px] italic">Root / Umum</span>
                        )}
                      </td>

                      {/* Base URL */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-zinc-300 font-mono text-[11px]">
                          <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
                          <span className="truncate max-w-xs">{scenario.baseUrl || '-'}</span>
                        </div>
                      </td>

                      {/* Step count badge */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                            <ListOrdered className="w-3 h-3 text-amber-500" />
                            {enabledSteps} langkah
                          </span>
                          {fallbackCount > 0 && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                              title={`${fallbackCount} selector cadangan terpasang`}
                            >
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              Adaptive
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Auth status */}
                      <td className="px-5 py-3.5">
                        {hasAuth ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" />
                            Aktif
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-zinc-500 text-[11px]">Tanpa Login</span>
                        )}
                      </td>

                      {/* Filament Table Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onRunScenario(scenario)}
                            title="Jalankan Skenario Ini"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-md text-[11px] shadow-2xs transition-colors"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Jalankan</span>
                          </button>

                          <button
                            onClick={() => onViewHistory && onViewHistory(scenario)}
                            title="Lihat Riwayat Eksekusi"
                            className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-md transition-colors"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onEditScenario(scenario)}
                            title="Edit Skenario"
                            className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDuplicateScenario(scenario)}
                            title="Duplikat"
                            className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteScenario(scenario.id)}
                            title="Hapus"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Filament Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((scenario) => {
            const enabledSteps = (scenario.steps || []).filter((s) => s.enabled !== false).length;
            const fallbackCount = (scenario.steps || []).reduce((acc, s) => acc + (Array.isArray(s.fallbacks) ? s.fallbacks.length : 0), 0);
            const hasAuth = scenario.authConfig && scenario.authConfig.enabled;

            return (
              <div
                key={scenario.id}
                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-amber-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-gray-950 dark:text-white truncate">
                      {scenario.name}
                    </h3>
                    {(scenario.isComponent || (Array.isArray(scenario.tags) && scenario.tags.includes('component'))) && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 shrink-0">
                        <Boxes className="w-2.5 h-2.5 text-violet-500" />
                        Komponen
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 min-h-[32px] mt-1 mb-3">
                    {scenario.description || 'Tidak ada deskripsi tambahan.'}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 px-2.5 py-1.5 rounded-lg mb-3 font-mono">
                    <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
                    <span className="truncate">{scenario.baseUrl || 'Tanpa URL'}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-[10px]">
                    {moduleMap[scenario.moduleId || scenario.module_id] && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-medium">
                        <FolderKanban className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>{moduleMap[scenario.moduleId || scenario.module_id].name}</span>
                      </span>
                    )}

                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-medium">
                      <ListOrdered className="w-3 h-3 text-amber-500" />
                      {enabledSteps} Langkah
                    </span>

                    {fallbackCount > 0 && (
                      <span
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-medium"
                        title={`${fallbackCount} selector cadangan terpasang`}
                      >
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        Adaptive
                      </span>
                    )}

                    {hasAuth && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-medium">
                        <ShieldCheck className="w-3 h-3" />
                        Auth Aktif
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onRunScenario(scenario)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Jalankan
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewHistory && onViewHistory(scenario)}
                      title="Lihat Riwayat Eksekusi"
                      className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-md transition-colors"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditScenario(scenario)}
                      title="Edit Skenario"
                      className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicateScenario(scenario)}
                      title="Duplikat"
                      className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteScenario(scenario.id)}
                      title="Hapus"
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
