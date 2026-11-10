import React from 'react';
import { Layers, Play, CheckCircle2, History, Plus, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onNewScenario, onNewSuite }) {
  return (
    <header className="bg-slate-950 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between select-none">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white">QA Flow Studio</h1>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Desktop Runner
            </span>
          </div>
          <p className="text-xs text-slate-400">Low-Code Web Automation & Test Orchestrator</p>
        </div>
      </div>

      <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'scenarios'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Skenario Pengujian
        </button>

        <button
          onClick={() => setActiveTab('suites')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'suites'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          Test Suites (Gabungan)
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <History className="w-4 h-4" />
          Riwayat Log
        </button>
      </nav>

      <div className="flex items-center gap-2">
        {activeTab === 'scenarios' && (
          <button
            onClick={onNewScenario}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Setup Test Baru
          </button>
        )}
        {activeTab === 'suites' && (
          <button
            onClick={onNewSuite}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Buat Suite Baru
          </button>
        )}
      </div>
    </header>
  );
}
