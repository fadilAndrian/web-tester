import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  Square,
  Play,
  Globe,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  Sparkles,
  MousePointer,
  Keyboard,
  ListOrdered,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export default function VisualRecorderModal({
  isOpen,
  onClose,
  initialUrl = '',
  onImportSteps
}) {
  const [targetUrl, setTargetUrl] = useState(initialUrl || 'https://demo.playwright.dev/todomvc/#/');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState([]);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [duration, setDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);

  // Sync initial URL if modal opens
  useEffect(() => {
    if (initialUrl) {
      setTargetUrl(initialUrl);
    }
  }, [initialUrl, isOpen]);

  // Duration timer when recording
  useEffect(() => {
    let timer = null;
    if (isRecording) {
      timer = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  // Listen for live steps emitted by recorder
  useEffect(() => {
    if (!isOpen) return;

    const cleanup = api.onRecorderStep(({ step, isUpdate }) => {
      if (!step) return;

      setRecordedSteps((prev) => {
        if (isUpdate) {
          const index = prev.findIndex((s) => s.id === step.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = step;
            return next;
          }
        }
        // Avoid duplicate identical step by id
        const exists = prev.some((s) => s.id === step.id);
        if (exists) return prev;
        return [...prev, step];
      });
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStart = async () => {
    setErrorMsg(null);
    let url = targetUrl.trim();
    if (!url) {
      url = 'https://demo.playwright.dev/todomvc/#/';
      setTargetUrl(url);
    }

    try {
      setIsRecording(true);
      await api.startRecorder({ url });
    } catch (err) {
      setIsRecording(false);
      setErrorMsg(err.message || 'Gagal memulai perekam visual.');
    }
  };

  const handleStop = async () => {
    try {
      const res = await api.stopRecorder();
      setIsRecording(false);
      if (res && Array.isArray(res.steps) && res.steps.length > 0) {
        setRecordedSteps(res.steps);
      }
    } catch (err) {
      setIsRecording(false);
      console.warn('Stop recorder error:', err);
    }
  };

  const handleRemoveStep = (index) => {
    setRecordedSteps((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveStep = (index, direction) => {
    setRecordedSteps((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const handleImport = async () => {
    if (isRecording) {
      await handleStop();
    }
    if (typeof onImportSteps === 'function') {
      onImportSteps(recordedSteps, replaceExisting);
    }
    onClose();
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-gray-50/70 dark:bg-zinc-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-2">
                <span>Perekam Interaksi Web Visual (Built-in Recorder)</span>
                {isRecording && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    REC {formatSeconds(duration)}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                Otomatis menangkap klik mouse, isian formulir, dan navigasi menjadi langkah skenario dengan Adaptive Selector.
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              if (isRecording) await handleStop();
              onClose();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* URL Toolbar & Recorder Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Globe className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="url"
                disabled={isRecording}
                placeholder="https://example.com/halaman-web-yang-ingin-diuji"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono disabled:opacity-60"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full sm:w-auto px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Mulai Rekam</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStop}
                  className="w-full sm:w-auto px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Square className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  <span>Hentikan Rekam</span>
                </button>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isRecording && (
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                Jendela browser terbuka. Klik dan isi elemen di browser untuk mencatat langkah tes secara otomatis.
              </span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                {recordedSteps.length} langkah tercatat
              </span>
            </div>
          )}
        </div>

        {/* Recorded Steps Stream List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/50 dark:bg-zinc-950/50 min-h-[220px]">
          {recordedSteps.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500 dark:text-zinc-400">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800/80 flex items-center justify-center mb-3 text-gray-400 dark:text-zinc-500">
                <MousePointer className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                Belum Ada Interaksi yang Direkam
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-zinc-500 max-w-sm mt-1">
                Masukkan URL target di atas dan klik <strong>Mulai Rekam</strong>. Jendela browser akan terbuka dan seluruh interaksi Anda akan tercatat di sini secara real-time.
              </p>
            </div>
          ) : (
            recordedSteps.map((step, idx) => (
              <div
                key={step.id || idx}
                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-3 shadow-2xs hover:border-amber-500/30 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 shrink-0">
                    #{idx + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold uppercase">
                        {step.action}
                      </span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {step.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 dark:text-zinc-400 font-mono">
                      {step.selector && (
                        <span className="truncate max-w-md bg-gray-50 dark:bg-zinc-950 px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-800 text-[10px]">
                          {step.selector}
                        </span>
                      )}
                      {Array.isArray(step.fallbacks) && step.fallbacks.length > 0 && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          <Sparkles className="w-2.5 h-2.5" />
                          +{step.fallbacks.length} Fallback
                        </span>
                      )}
                      {step.value && (
                        <span className="text-gray-600 dark:text-zinc-300 font-sans text-[11px]">
                          Nilai: <strong>"{step.value}"</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveStep(idx, -1)}
                    disabled={idx === 0}
                    className={`p-1 rounded transition-colors ${
                      idx === 0 ? 'text-gray-300 dark:text-zinc-800 cursor-not-allowed' : 'text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
                    }`}
                    title="Geser ke atas"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveStep(idx, 1)}
                    disabled={idx === recordedSteps.length - 1}
                    className={`p-1 rounded transition-colors ${
                      idx === recordedSteps.length - 1 ? 'text-gray-300 dark:text-zinc-800 cursor-not-allowed' : 'text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
                    }`}
                    title="Geser ke bawah"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    title="Hapus langkah ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="h-16 px-6 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-gray-50/70 dark:bg-zinc-950/70 shrink-0">
          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold text-gray-700 dark:text-zinc-300">
              Total: {recordedSteps.length} langkah
            </span>

            {recordedSteps.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-[11px]">Gantikan langkah yang ada (Reset)</span>
              </label>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                if (isRecording) await handleStop();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={recordedSteps.length === 0}
              onClick={handleImport}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                recordedSteps.length === 0
                  ? 'bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Masukkan ke Skenario ({recordedSteps.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
