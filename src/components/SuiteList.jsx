import React, { useState } from 'react';
import { Layers, Play, Edit3, Trash2, ListOrdered, Shield, Search, Plus, Sparkles, History } from 'lucide-react';

export default function SuiteList({
  suites,
  scenarios,
  onRunSuite,
  onEditSuite,
  onDeleteSuite,
  onCreateNew,
  onViewHistory
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const scenarioMap = (scenarios || []).reduce((acc, s) => {
    acc[s.id] = s;
    return acc;
  }, {});

  const filtered = suites.filter((suite) =>
    suite.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-950 dark:text-white">
            Test Suites (Gabungan Skenario)
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Orkestrasikan beberapa skenario pengujian ke dalam satu alur eksekusi berurutan.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3 top-2" />
          <input
            type="text"
            placeholder="Cari test suite..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-gray-400 dark:text-zinc-500 mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Tidak ada Test Suite ditemukan</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            {searchTerm
              ? 'Tidak ada suite yang sesuai dengan kata kunci pencarian.'
              : 'Anda belum memiliki test suite gabungan. Buat suite baru untuk merangkai beberapa skenario.'}
          </p>
          {!searchTerm && (
            <button
              onClick={onCreateNew}
              className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Buat Test Suite Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((suite) => {
            const suiteScenarios = (suite.scenarioIds || [])
              .map((id) => scenarioMap[id])
              .filter(Boolean);

            return (
              <div
                key={suite.id}
                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-amber-500/40 transition-colors"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-950 dark:text-white truncate">
                    {suite.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 min-h-[32px] mt-1 mb-3">
                    {suite.description || 'Tidak ada deskripsi tambahan.'}
                  </p>

                  {/* Flow preview */}
                  <div className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg p-3 mb-3 space-y-1.5">
                    <span className="text-[10px] uppercase font-semibold text-gray-400 dark:text-zinc-500 block">
                      Urutan Eksekusi Skenario:
                    </span>
                    {suiteScenarios.length === 0 ? (
                      <span className="text-xs text-gray-400 dark:text-zinc-500 italic">Belum ada skenario dipilih.</span>
                    ) : (
                      <ol className="space-y-1">
                        {suiteScenarios.map((sc, idx) => (
                          <li key={sc.id} className="text-xs text-gray-700 dark:text-zinc-300 flex items-center gap-2 truncate">
                            <span className="w-4 h-4 rounded bg-gray-200 dark:bg-zinc-800 text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="truncate">{sc.name}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-[10px]">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-medium">
                      <ListOrdered className="w-3 h-3 text-amber-500" />
                      {suiteScenarios.length} Skenario
                    </span>

                    {suite.keepSession && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-medium">
                        <Shield className="w-3 h-3" />
                        Sesi Dibagikan (Shared Cookies)
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onRunSuite(suite)}
                    disabled={suiteScenarios.length === 0}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors ${
                      suiteScenarios.length > 0
                        ? 'bg-amber-600 hover:bg-amber-500'
                        : 'bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Jalankan Suite
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewHistory && onViewHistory(suite)}
                      title="Riwayat Eksekusi Suite Ini"
                      className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-md transition-colors"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditSuite(suite)}
                      title="Edit Urutan Skenario"
                      className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSuite(suite.id)}
                      title="Hapus Suite"
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
