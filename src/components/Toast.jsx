import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export default function Toast({
  show,
  type = 'success', // 'success' | 'error' | 'info'
  title,
  message,
  onClose,
  duration = 3500
}) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-200 transition-all">
      {type === 'success' && (
        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}
      {type === 'error' && (
        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
      )}
      {type === 'info' && (
        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Info className="w-4 h-4" />
        </div>
      )}

      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className="text-xs font-bold text-gray-950 dark:text-white truncate">
          {title || (type === 'success' ? 'Berhasil' : type === 'error' ? 'Terjadi Kesalahan' : 'Pemberitahuan')}
        </h4>
        {message && (
          <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-0.5 leading-snug">
            {message}
          </p>
        )}
      </div>

      <button
        onClick={onClose}
        className="p-1 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
