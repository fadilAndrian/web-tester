import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Square,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Camera,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function LiveRunnerModal({
  isOpen,
  onClose,
  title = 'Eksekusi Pengujian',
  scenariosToRun = [],
  keepSession = false,
  suiteId = null,
  suiteName = null,
  projectId = null,
  onViewScreenshot
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [headless, setHeadless] = useState(false); // default: Headed (Chrome terlihat)
  const [slowMo, setSlowMo] = useState(300);

  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [currentScenarioName, setCurrentScenarioName] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [stepStatuses, setStepStatuses] = useState({});
  const [logs, setLogs] = useState([]);
  const [runSummary, setRunSummary] = useState(null);

  const logsEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    setIsRunning(false);
    setIsFinished(false);
    setRunSummary(null);
    setStepStatuses({});
    setLogs([]);
    setCurrentScenarioIndex(0);
    setCurrentStepIndex(0);

    const unsubscribe = api.onTestEvent((type, data) => {
      const timeStr = new Date(data.timestamp || Date.now()).toLocaleTimeString();

      switch (type) {
        case 'run-start':
          setIsRunning(true);
          setIsFinished(false);
          setLogs((prev) => [
            ...prev,
            { time: timeStr, type: 'info', text: `Mulai eksekusi ${data.totalScenarios} skenario pengujian...` }
          ]);
          break;

        case 'scenario-start':
          setCurrentScenarioIndex(data.scenarioIndex);
          setCurrentScenarioName(data.scenarioName);
          setCurrentStepIndex(0);
          setLogs((prev) => [
            ...prev,
            {
              time: timeStr,
              type: 'info',
              text: `[${data.scenarioIndex}/${data.totalScenarios}] Skenario: "${data.scenarioName}"`
            }
          ]);
          break;

        case 'step-start':
          setCurrentStepIndex(data.stepIndex);
          setStepStatuses((prev) => ({
            ...prev,
            [data.stepId]: { status: 'running', label: data.label, action: data.action }
          }));
          setLogs((prev) => [
            ...prev,
            {
              time: timeStr,
              type: 'step',
              text: `  ⏳ Step ${data.stepIndex}: ${data.label} (${data.action})`
            }
          ]);
          break;

        case 'step-pass':
          setStepStatuses((prev) => ({
            ...prev,
            [data.stepId]: {
              ...prev[data.stepId],
              status: 'passed',
              duration: data.durationMs,
              screenshot: data.screenshot
            }
          }));
          setLogs((prev) => [
            ...prev,
            {
              time: timeStr,
              type: 'success',
              text: `  ✅ Berhasil (${data.durationMs}ms)${data.screenshot ? ` [📸 ${data.screenshot}]` : ''}`
            }
          ]);
          break;

        case 'step-fail':
          setStepStatuses((prev) => ({
            ...prev,
            [data.stepId]: {
              ...prev[data.stepId],
              status: 'failed',
              duration: data.durationMs,
              error: data.error,
              screenshot: data.screenshot
            }
          }));
          setLogs((prev) => [
            ...prev,
            {
              time: timeStr,
              type: 'error',
              text: `  ❌ GAGAL (${data.durationMs}ms): ${data.error}`
            }
          ]);
          break;

        case 'scenario-finish':
          setLogs((prev) => [
            ...prev,
            {
              time: timeStr,
              type: data.status === 'passed' ? 'success' : 'error',
              text: `🏁 Selesai "${data.scenarioName}" -> Status: ${data.status.toUpperCase()} (${data.durationMs}ms)`
            }
          ]);
          break;

        case 'log':
          setLogs((prev) => [...prev, { time: timeStr, type: data.level || 'info', text: data.message }]);
          break;

        case 'run-finish':
          setIsRunning(false);
          setIsFinished(true);
          setRunSummary(data);
          setLogs((prev) => [
            ...prev,
            {
              time: timeStr,
              type: data.status === 'passed' ? 'success' : 'error',
              text: `🎉 Selesai! Lulus: ${data.passedScenarios}, Gagal: ${data.failedScenarios} (${data.durationMs}ms)`
            }
          ]);
          break;

        default:
          break;
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isOpen]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!isOpen) return null;

  const handleStart = async () => {
    setIsRunning(true);
    setIsFinished(false);
    setRunSummary(null);
    setStepStatuses({});
    setLogs([]);

    try {
      await api.runTest({
        scenarios: scenariosToRun,
        options: {
          headless,
          slowMo: Number(slowMo),
          keepSession,
          suiteId,
          suiteName,
          projectId: projectId || scenariosToRun[0]?.projectId || scenariosToRun[0]?.project_id
        }
      });
    } catch (err) {
      setIsRunning(false);
      setLogs((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString(), type: 'error', text: `Eksekusi terhenti: ${err.message}` }
      ]);
    }
  };

  const handleStop = async () => {
    await api.stopTest();
    setIsRunning(false);
    setLogs((prev) => [
      ...prev,
      { time: new Date().toLocaleTimeString(), type: 'warn', text: 'Menghentikan pengujian...' }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl w-full max-w-5xl h-[86vh] flex flex-col shadow-xl overflow-hidden">
        {/* Filament Modal Header */}
        <div className="h-14 px-6 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-gray-50/70 dark:bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 fill-current" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-2">
                {title}
                {isRunning && (
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Sedang Berjalan
                  </span>
                )}
                {isFinished && runSummary && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      runSummary.failedScenarios === 0
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                        : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                    }`}
                  >
                    {runSummary.failedScenarios === 0 ? 'Semua Passed' : 'Failed'}
                  </span>
                )}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isRunning}
            className={`p-1.5 rounded-lg transition-colors ${
              isRunning ? 'text-gray-300 dark:text-zinc-600 cursor-not-allowed' : 'text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filament Control Bar */}
        <div className="px-6 py-2.5 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            {/* Headed / Headless Toggle */}
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-zinc-400 font-medium text-[11px]">Browser:</span>
              <div className="border border-gray-200 dark:border-zinc-700 rounded-lg p-0.5 bg-gray-50 dark:bg-zinc-800 flex items-center">
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => setHeadless(false)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    !headless
                      ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-2xs'
                      : 'text-gray-500 dark:text-zinc-400'
                  }`}
                >
                  Chrome Terlihat
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => setHeadless(true)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    headless
                      ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-2xs'
                      : 'text-gray-500 dark:text-zinc-400'
                  }`}
                >
                  Background
                </button>
              </div>
            </div>

            {/* Delay Speed */}
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-zinc-400 font-medium text-[11px]">Kecepatan:</span>
              <select
                disabled={isRunning}
                value={slowMo}
                onChange={(e) => setSlowMo(Number(e.target.value))}
                className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white rounded-md px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value={0}>Cepat (0ms)</option>
                <option value={300}>Normal (300ms)</option>
                <option value={600}>Demo Santai (600ms)</option>
              </select>
            </div>
          </div>

          {/* Action Run / Stop Buttons */}
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <button
                type="button"
                onClick={handleStart}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isFinished ? 'Jalankan Ulang' : 'Mulai Eksekusi'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStop}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Hentikan</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Main Content: Left Steps Tree + Right Console Log */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left: Scenarios & Steps list (5 cols) */}
          <div className="md:col-span-5 border-r border-gray-200 dark:border-zinc-800 p-4 overflow-y-auto space-y-3 bg-gray-50/40 dark:bg-zinc-950/40">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 flex items-center justify-between">
              <span>Skenario & Langkah</span>
              {currentScenarioName && (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {currentScenarioIndex}/{scenariosToRun.length}
                </span>
              )}
            </h3>

            <div className="space-y-3">
              {scenariosToRun.map((sc, scIdx) => {
                const isCurrentScenario = currentScenarioIndex === scIdx + 1;
                const steps = (sc.steps || []).filter((s) => s.enabled !== false);

                return (
                  <div
                    key={sc.id}
                    className={`border rounded-lg p-3 transition-colors ${
                      isCurrentScenario
                        ? 'bg-white dark:bg-zinc-900 border-amber-500/50 shadow-xs'
                        : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 text-[10px] font-bold flex items-center justify-center">
                          {scIdx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-gray-950 dark:text-white truncate max-w-[180px]">{sc.name}</h4>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500">{steps.length} step</span>
                    </div>

                    <div className="space-y-1 pl-2 border-l border-gray-200 dark:border-zinc-800 ml-2">
                      {steps.map((st) => {
                        const statusObj = stepStatuses[st.id];
                        const status = statusObj?.status || 'idle';

                        return (
                          <div
                            key={st.id}
                            className={`flex items-center justify-between gap-2 text-xs px-2 py-1 rounded transition-colors ${
                              status === 'running'
                                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 font-medium'
                                : status === 'passed'
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : status === 'failed'
                                ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 font-medium'
                                : 'text-gray-500 dark:text-zinc-400'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {status === 'running' && (
                                <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin shrink-0" />
                              )}
                              {status === 'passed' && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              )}
                              {status === 'failed' && (
                                <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              )}
                              {status === 'idle' && (
                                <span className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-zinc-700 inline-block shrink-0"></span>
                              )}
                              <span className="truncate">{st.label || st.action}</span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {statusObj?.duration && (
                                <span className="text-[10px] text-gray-400 dark:text-zinc-500">{statusObj.duration}ms</span>
                              )}
                              {statusObj?.screenshot && (
                                <button
                                  type="button"
                                  onClick={() => onViewScreenshot(statusObj.screenshot)}
                                  title="Lihat screenshot"
                                  className="text-rose-500 hover:text-rose-700 p-0.5 rounded"
                                >
                                  <Camera className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Live Terminal Logs (7 cols) */}
          <div className="md:col-span-7 flex flex-col bg-zinc-950 p-4 min-h-0 overflow-hidden text-zinc-100">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs">
              <span className="font-mono text-zinc-400 flex items-center gap-1.5 text-[11px]">
                <Terminal className="w-3.5 h-3.5 text-amber-500" />
                Live Execution Console
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">{logs.length} logs</span>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-1 p-2 bg-zinc-900/80 rounded-lg border border-zinc-800/80">
              {logs.length === 0 ? (
                <div className="text-zinc-500 italic py-8 text-center text-xs">
                  Menunggu tombol "Mulai Eksekusi" ditekan...
                </div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={`leading-relaxed ${
                      log.type === 'error'
                        ? 'text-rose-400 font-semibold'
                        : log.type === 'success'
                        ? 'text-emerald-400 font-medium'
                        : log.type === 'warn'
                        ? 'text-amber-400'
                        : log.type === 'step'
                        ? 'text-sky-300'
                        : 'text-zinc-300'
                    }`}
                  >
                    <span className="text-zinc-600 mr-2 select-none">[{log.time}]</span>
                    {log.text}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

        {/* Modal Summary Footer */}
        {isFinished && runSummary && (
          <div className="h-12 px-6 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs bg-gray-50/70 dark:bg-zinc-950/70">
            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-zinc-400">
                Waktu Total: <strong className="text-gray-900 dark:text-white">{(runSummary.durationMs / 1000).toFixed(2)}s</strong>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Passed: {runSummary.passedScenarios}
              </span>
              {runSummary.failedScenarios > 0 && (
                <span className="text-rose-600 dark:text-rose-400 font-medium">
                  Failed: {runSummary.failedScenarios}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 font-semibold rounded-lg transition-colors text-xs"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
