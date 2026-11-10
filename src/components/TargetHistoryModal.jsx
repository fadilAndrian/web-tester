import React, { useState } from 'react';
import {
  X,
  History,
  CheckCircle2,
  XCircle,
  Camera,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Clock,
  FlaskConical,
  Layers,
  Sparkles
} from 'lucide-react';

export default function TargetHistoryModal({
  isOpen,
  onClose,
  targetType = 'scenario', // 'scenario' | 'suite'
  targetId,
  targetName,
  history = [],
  onViewScreenshot
}) {
  const [expandedRunId, setExpandedRunId] = useState(null);
  const [expandedScenarios, setExpandedScenarios] = useState({});

  if (!isOpen) return null;

  // Filter history
  let filteredRuns = [];

  if (targetType === 'scenario') {
    // Find runs where this scenario was executed
    filteredRuns = history.map((run) => {
      const sResults = run.scenarioResults || run.scenario_results || [];
      const matchedScenario = sResults.find((sr) => sr.scenarioId === targetId || sr.scenario_id === targetId);
      if (!matchedScenario) return null;
      return {
        runId: run.id,
        startTime: run.startTime || run.start_time,
        status: matchedScenario.status,
        durationMs: matchedScenario.durationMs || matchedScenario.duration_ms,
        steps: matchedScenario.steps || [],
        error: matchedScenario.error,
        parentRunStatus: run.status
      };
    }).filter(Boolean);
  } else if (targetType === 'suite') {
    // Find runs where suiteId matches
    filteredRuns = history.filter((run) => {
      const sId = run.suiteId || run.suite_id;
      return sId === targetId;
    }).map((run) => ({
      runId: run.id,
      startTime: run.startTime || run.start_time,
      status: (Number(run.failedScenarios || run.failed_scenarios || 0) === 0 && run.status !== 'failed') ? 'passed' : 'failed',
      durationMs: run.durationMs || run.duration_ms,
      scenarioResults: run.scenarioResults || run.scenario_results || [],
      passedCount: Number(run.passedScenarios || run.passed_scenarios || 0),
      failedCount: Number(run.failedScenarios || run.failed_scenarios || 0)
    }));
  }

  const toggleExpand = (id) => {
    setExpandedRunId((prev) => (prev === id ? null : id));
  };

  const toggleScenarioExpand = (key) => {
    setExpandedScenarios((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="h-14 px-6 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-gray-50/70 dark:bg-zinc-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-950 dark:text-white">
                  Riwayat Eksekusi: <span className="text-amber-600 dark:text-amber-400">{targetName}</span>
                </h2>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.2 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
                  {targetType === 'scenario' ? 'Skenario' : 'Test Suite'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                Total {filteredRuns.length} kali pengujian tercatat untuk item ini.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredRuns.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400 dark:text-zinc-500 bg-gray-50/50 dark:bg-zinc-950/50 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
              Belum ada catatan eksekusi untuk {targetType === 'scenario' ? 'skenario' : 'suite'} ini.
              Jalankan tes untuk melihat rincian langkah dan riwayat log di sini.
            </div>
          ) : (
            filteredRuns.map((item, idx) => {
              const isPassed = item.status === 'passed';
              const isExpanded = expandedRunId === item.runId || (idx === 0 && expandedRunId === null);

              return (
                <div
                  key={item.runId}
                  className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs"
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => toggleExpand(item.runId)}
                    className="p-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 select-none transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isPassed ? (
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                          <XCircle className="w-4 h-4" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded ${
                              isPassed
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="text-xs font-mono text-gray-500 dark:text-zinc-400">
                            {new Date(item.startTime).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>Durasi: {((item.durationMs || 0) / 1000).toFixed(2)}s</span>
                          {targetType === 'suite' && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Lulus: {item.passedCount}</span>
                              {item.failedCount > 0 && (
                                <span className="text-rose-600 dark:text-rose-400 font-medium">• Gagal: {item.failedCount}</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-500">
                      <span>{isExpanded ? 'Tutup Rincian' : 'Lihat Rincian'}</span>
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Expanded: Step-by-Step for Single Scenario Target */}
                  {isExpanded && targetType === 'scenario' && (
                    <div className="p-4 bg-gray-50/70 dark:bg-zinc-950/70 border-t border-gray-200 dark:border-zinc-800 space-y-3">
                      {/* Top-Level Scenario / Auth Error if present */}
                      {item.error && (
                        <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-900/60 text-rose-200 text-xs font-mono space-y-1.5">
                          <div className="text-[10px] text-rose-400 font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Pesan Error Skenario:</span>
                          </div>
                          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed select-text font-mono text-rose-100">
                            {item.error}
                          </pre>
                        </div>
                      )}

                      {/* Steps List */}
                      {item.steps.length === 0 ? (
                        <div className="text-center py-4 text-xs text-gray-400 dark:text-zinc-500 italic">
                          Tidak ada langkah pengujian yang dijalankan (terhenti sebelum langkah pertama).
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 divide-y divide-gray-200/60 dark:divide-zinc-800/60 px-3">
                          {item.steps.map((st, sIdx) => {
                            const stepFailed = st.status === 'failed';

                            return (
                              <div key={sIdx} className="py-2.5">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {stepFailed ? (
                                      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                    ) : (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    )}
                                    <span className="font-semibold text-gray-900 dark:text-white truncate">
                                      Langkah {sIdx + 1}: {st.label || st.action}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {st.durationMs !== undefined && (
                                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">
                                        {st.durationMs}ms
                                      </span>
                                    )}
                                    {st.screenshot && (
                                      <button
                                        type="button"
                                        onClick={() => onViewScreenshot && onViewScreenshot(st.screenshot)}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 transition-colors"
                                      >
                                        <Camera className="w-3 h-3" />
                                        <span>Lihat Bukti Foto</span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Step Error Details */}
                                {stepFailed && st.error && (
                                  <div className="mt-2 p-2.5 rounded-lg bg-rose-950/80 border border-rose-900/60 text-rose-200 text-xs font-mono">
                                    <div className="text-[10px] text-rose-400 font-bold mb-1 flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" /> Error Call Log:
                                    </div>
                                    <pre className="whitespace-pre-wrap text-[11px] leading-relaxed select-text font-mono text-rose-100">
                                      {st.error}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expanded: Full Scenario & Step Breakdown for Suite Target */}
                  {isExpanded && targetType === 'suite' && (
                    <div className="p-4 bg-gray-50/70 dark:bg-zinc-950/70 border-t border-gray-200 dark:border-zinc-800 space-y-3">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center justify-between">
                        <span>Rincian Skenario dalam Suite:</span>
                        <span>Klik skenario untuk melihat detail langkah & foto</span>
                      </div>

                      <div className="space-y-2.5">
                        {item.scenarioResults.map((sc, scIdx) => {
                          const scKey = `${item.runId}-${sc.scenarioId || scIdx}`;
                          const isScExpanded = expandedScenarios[scKey] !== undefined ? expandedScenarios[scKey] : (sc.status === 'failed');
                          const scPassed = sc.status === 'passed';
                          const steps = sc.steps || [];

                          return (
                            <div
                              key={scIdx}
                              className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-2xs"
                            >
                              {/* Scenario Header Bar */}
                              <div
                                onClick={() => toggleScenarioExpand(scKey)}
                                className="p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 select-none transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {scPassed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                                  )}
                                  <span className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                                    {scIdx + 1}. {sc.scenarioName}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">
                                    {((sc.durationMs || 0) / 1000).toFixed(2)}s
                                  </span>
                                  <span className="text-[10px] text-gray-500 dark:text-zinc-400">
                                    {steps.length} langkah
                                  </span>
                                  <span
                                    className={`uppercase text-[10px] font-bold px-2 py-0.2 rounded ${
                                      scPassed
                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                        : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                                    }`}
                                  >
                                    {sc.status}
                                  </span>
                                  <span className="text-gray-400 dark:text-zinc-500 ml-1">
                                    {isScExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                  </span>
                                </div>
                              </div>

                              {/* Expanded Scenario Steps & Error Details */}
                              {isScExpanded && (
                                <div className="p-3 bg-gray-50/50 dark:bg-zinc-950/60 border-t border-gray-200 dark:border-zinc-800 space-y-2">
                                  {/* Top-Level Scenario / Auth Error if present */}
                                  {sc.error && (
                                    <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-900/60 text-rose-200 text-xs font-mono space-y-1.5">
                                      <div className="text-[10px] text-rose-400 font-bold flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        <span>Pesan Error Skenario:</span>
                                      </div>
                                      <pre className="whitespace-pre-wrap text-[11px] leading-relaxed select-text font-mono text-rose-100">
                                        {sc.error}
                                      </pre>
                                    </div>
                                  )}

                                  {/* Steps List */}
                                  {steps.length === 0 ? (
                                    <div className="text-center py-3 text-[11px] text-gray-400 dark:text-zinc-500 italic">
                                      Tidak ada langkah pengujian yang dijalankan (terhenti pada proses persiapan / autentikasi).
                                    </div>
                                  ) : (
                                    <div className="divide-y divide-gray-200/60 dark:divide-zinc-800/60 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 px-3">
                                      {steps.map((st, stIdx) => {
                                        const stepFailed = st.status === 'failed';
                                        return (
                                          <div key={stIdx} className="py-2.5">
                                            <div className="flex items-center justify-between text-xs">
                                              <div className="flex items-center gap-2 min-w-0">
                                                {stepFailed ? (
                                                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                                ) : (
                                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                )}
                                                <span className="font-medium text-gray-800 dark:text-zinc-200 truncate">
                                                  Langkah {stIdx + 1}: {st.label || st.action}
                                                </span>
                                              </div>

                                              <div className="flex items-center gap-2 shrink-0">
                                                {st.durationMs !== undefined && (
                                                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">
                                                    {st.durationMs}ms
                                                  </span>
                                                )}
                                                {st.screenshot && (
                                                  <button
                                                    type="button"
                                                    onClick={() => onViewScreenshot && onViewScreenshot(st.screenshot)}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 transition-colors"
                                                  >
                                                    <Camera className="w-3 h-3" />
                                                    <span>Lihat Bukti Foto</span>
                                                  </button>
                                                )}
                                              </div>
                                            </div>

                                            {/* Step-level Error */}
                                            {stepFailed && st.error && (
                                              <div className="mt-2 p-2.5 rounded-lg bg-rose-950/80 border border-rose-900/60 text-rose-200 text-xs font-mono space-y-1">
                                                <div className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                                                  <AlertTriangle className="w-3 h-3" /> Error Step:
                                                </div>
                                                <pre className="whitespace-pre-wrap text-[11px] leading-relaxed select-text font-mono text-rose-100">
                                                  {st.error}
                                                </pre>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="h-12 px-6 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-end bg-gray-50/70 dark:bg-zinc-950/70 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 font-semibold rounded-lg text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
