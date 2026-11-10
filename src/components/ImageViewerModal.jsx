import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { api } from '../services/api';

export default function ImageViewerModal({ filename, onClose }) {
  const [imgData, setImgData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!filename) return;
    setLoading(true);
    api.getScreenshotData(filename).then((data) => {
      setImgData(data);
      setLoading(false);
    });
  }, [filename]);

  if (!filename) return null;

  const handleOpenSystem = () => {
    api.openScreenshot(filename);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-6">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="px-5 py-3 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-mono font-medium text-gray-900 dark:text-white truncate max-w-md">
              {filename}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenSystem}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 text-xs font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka di Preview</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100/50 dark:bg-zinc-950/50">
          {loading ? (
            <div className="text-xs text-gray-400 dark:text-zinc-500">Memuat gambar...</div>
          ) : imgData ? (
            <img
              src={imgData}
              alt={filename}
              className="max-w-full max-h-[75vh] object-contain rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm"
            />
          ) : (
            <div className="text-xs text-rose-500">Gagal memuat tangkapan layar.</div>
          )}
        </div>
      </div>
    </div>
  );
}
