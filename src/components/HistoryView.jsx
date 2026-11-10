import React, { useState, useEffect } from 'react';
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Camera,
  AlertTriangle,
  Flame,
  Globe
} from 'lucide-react';
import { api } from '../services/api';

export default function HistoryView({ activeProjectId, onViewScreenshot }) {
  const [history, setHistory] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.getHistory(activeProjectId).then((data) => {
      setHistory(data || []);
      // Auto expand the first run if available
      if (data && data.length > 0) {
        setExpandedId(data[0].id);
      }
    });
  }, [activeProjectId]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
            Riwayat & Log Eksekusi
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Daftar hasil pengujian terdahulu beserta rincian error per langkah dan bukti tangkapan layar.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
          {history.length} Catatan
        </span>
      </div>

      {history.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-12 text-center text-xs text-gray-400 dark:text-zinc-500 shadow-xs">
          Belum ada riwayat pengujian tersimpan. Jalankan skenario atau suite untuk melihat log di sini.
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((run) => {
            const isPassed = run.failedScenarios === 0 && run.status !== 'aborted';
            const isExpanded = expandedId === run.id;

            return (
              <div
                key={run.id}
                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs transition-colors"
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(run.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 select-none transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isPassed ? (
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <XCircle className="w-4 h-4" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            isPassed
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                          }`}
                        >
                          {isPassed ? 'PASSED' : 'FAILED'}
                        </span>
                        <span className="text-xs font-mono text-gray-500 dark:text-zinc-400">
                          {new Date(run.startTime).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-zinc-400 flex items-center gap-2 mt-1">
                        <span>Total: {run.totalScenarios} Skenario</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Lulus: {run.passedScenarios}</span>
                        {run.failedScenarios > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-rose-600 dark:text-rose-400 font-medium">Gagal: {run.failedScenarios}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>Durasi: {((run.durationMs || 0) / 1000).toFixed(2)}s</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400 dark:text-zinc-500 text-xs">
                    <span>{isExpanded ? 'Tutup Rincian' : 'Lihat Rincian Error & Log'}</span>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Details: Skenario & Steps Breakdown */}
                {isExpanded && (
                  <div className="p-4 bg-gray-50/70 dark:bg-zinc-950/70 border-t border-gray-200 dark:border-zinc-800 space-y-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                      Rincian Skenario & Langkah Pengujian:
                    </h2>

                    {(run.scenarioResults || []).map((scRes, scIdx) => {
                      const scPassed = scRes.status === 'passed';
                      const steps = scRes.steps || [];

                      return (
                        <div
                          key={scIdx}
                          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs"
                        >
                          {/* Scenario Subheader */}
                          <div className="px-4 py-2.5 bg-gray-100/60 dark:bg-zinc-800/40 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                  scPassed ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              ></span>
                              <span className="font-bold text-xs text-gray-900 dark:text-white">
                                {scRes.scenarioName}
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 text-[11px] text-gray-500 dark:text-zinc-400">
                              <span>{steps.length} langkah</span>
                              <span>•</span>
                              <span>{((scRes.durationMs || 0) / 1000).toFixed(2)}s</span>
                              <span
                                className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded ${
                                  scPassed
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'
                                }`}
                              >
                                {scRes.status}
                              </span>
                            </div>
                          </div>

                          {/* Step Breakdown */}
                          <div className="p-3 divide-y divide-gray-100 dark:divide-zinc-800/60">
                            {steps.length === 0 ? (
                              <div className="text-xs text-gray-400 dark:text-zinc-500 italic p-2">
                                Tidak ada log langkah tersimpan untuk skenario ini.
                              </div>
                            ) : (
                              steps.map((st, stIdx) => {
                                const stepFailed = st.status === 'failed';

                                return (
                                  <div
                                    key={stIdx}
                                    className={`py-2.5 px-2 rounded-lg transition-colors ${
                                      stepFailed
                                        ? 'bg-rose-50/50 dark:bg-rose-950/20'
                                        : 'hover:bg-gray-50/50 dark:hover:bg-zinc-800/30'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3 text-xs">
                                      <div className="flex items-center gap-2 min-w-0">
                                        {stepFailed ? (
                                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                                        ) : (
                                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        )}
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                              {stIdx + 1}. {st.label || st.action}
                                            </span>
                                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 uppercase">
                                              {st.action}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        {st.durationMs && (
                                          <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">
                                            {st.durationMs}ms
                                          </span>
                                        )}
                                        {st.screenshot && (
                                          <button
                                            type="button"
                                            onClick={() => onViewScreenshot && onViewScreenshot(st.screenshot)}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                                          >
                                            <Camera className="w-3 h-3" />
                                            <span>Foto Bukti</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Error Message Box if step failed */}
                                    {stepFailed && st.error && (
                                      <div className="mt-2.5 ml-6 p-3 rounded-lg bg-rose-950/80 border border-rose-900/60 text-rose-200 text-xs font-mono overflow-x-auto">
                                        <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1">
                                          <AlertTriangle className="w-3.5 h-3.5" />
                                          Penyebab Error:
                                        </div>
                                        <pre className="whitespace-pre-wrap leading-relaxed text-[11px] select-text">
                                          {st.error}
                                        </pre>
                                        {st.screenshot && (
                                          <div className="mt-2 pt-2 border-t border-rose-900/40 flex items-center justify-between">
                                            <span className="text-[10px] text-rose-400">
                                              Tangkapan layar saat gagal tersimpan otomatis
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => onViewScreenshot && onViewScreenshot(st.screenshot)}
                                              className="underline text-[11px] text-rose-300 hover:text-white flex items-center gap-1 font-sans"
                                            >
                                              <Camera className="w-3 h-3" />
                                              Buka Foto Halaman Saat Error
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
