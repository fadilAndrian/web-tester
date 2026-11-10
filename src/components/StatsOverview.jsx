import React from 'react';
import { FlaskConical, Layers, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

export default function StatsOverview({ scenarios = [], suites = [], history = [] }) {
  const totalScenarios = scenarios.length;
  const totalSuites = suites.length;

  const lastRun = history[0];
  const lastRunPassed = lastRun ? lastRun.failedScenarios === 0 : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Stat 1: Skenario */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 block mb-1">
            Total Skenario Tes
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white">
              {totalScenarios}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
              Siap diuji
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <FlaskConical className="w-5 h-5" />
        </div>
      </div>

      {/* Stat 2: Suites */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 block mb-1">
            Test Suites (Gabungan)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white">
              {totalSuites}
            </span>
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
              Orkestrasi alur
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      {/* Stat 3: Last Run */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 block mb-1">
            Status Eksekusi Terakhir
          </span>
          <div className="flex items-baseline gap-2">
            {lastRun ? (
              <>
                <span className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white">
                  {lastRunPassed ? '100%' : 'Gagal'}
                </span>
                <span
                  className={`text-[11px] font-medium px-1.5 py-0.5 rounded border ${
                    lastRunPassed
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                      : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20'
                  }`}
                >
                  {lastRunPassed ? 'Semua Lulus' : `${lastRun.failedScenarios} Error`}
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-gray-400 dark:text-zinc-500">Belum ada tes berjalan</span>
            )}
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
