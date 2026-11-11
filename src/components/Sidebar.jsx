import React from 'react';
import {
  FlaskConical,
  Layers,
  History,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Command,
  Play,
  FolderKanban,
  Users,
  LogOut,
  User,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({
  activeProject,
  onOpenProjectModal,
  activeTab,
  setActiveTab,
  scenarioCount = 0,
  suiteCount = 0,
  historyCount = 0,
  userCount = 0,
  currentUser,
  onOpenProfile,
  onLogout,
  onNewScenario,
  onNewSuite
}) {
  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col justify-between select-none transition-colors duration-150">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-5 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-gray-950 dark:text-white block leading-tight">
                QA Flow Studio
              </span>
              <span className="text-[10px] font-medium text-gray-500 dark:text-zinc-400 block">
                Filament Test Runner
              </span>
            </div>
          </div>
          <span className="text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300">
            v1.0
          </span>
        </div>

        {/* Project Switcher Bar */}
        <div className="p-3 pb-0">
          <button
            type="button"
            onClick={onOpenProjectModal}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-950/70 hover:border-amber-500/50 hover:bg-white dark:hover:bg-zinc-900 transition-all text-left shadow-2xs group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-3 h-3 rounded-md shrink-0 shadow-xs"
                style={{ backgroundColor: activeProject?.color || '#0284c7' }}
              />
              <div className="min-w-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-zinc-500 tracking-wider block leading-tight">
                  Projek Aktif
                </span>
                <span className="text-xs font-bold text-gray-950 dark:text-white truncate block">
                  {activeProject?.name || 'Pilih Projek...'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-500 shrink-0 transition-colors" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="p-3 space-y-6">
          {/* Group 1: Manajemen Pengujian */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              Manajemen Pengujian
            </div>

            <button
              onClick={() => setActiveTab('scenarios')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'scenarios'
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold'
                  : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-100/80 dark:hover:bg-zinc-800/60 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FlaskConical
                  className={`w-4 h-4 ${
                    activeTab === 'scenarios' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-zinc-400'
                  }`}
                />
                <span>Skenario Tes</span>
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  activeTab === 'scenarios'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
                }`}
              >
                {scenarioCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('suites')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'suites'
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold'
                  : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-100/80 dark:hover:bg-zinc-800/60 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers
                  className={`w-4 h-4 ${
                    activeTab === 'suites' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-zinc-400'
                  }`}
                />
                <span>Test Suites</span>
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  activeTab === 'suites'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
                }`}
              >
                {suiteCount}
              </span>
            </button>
          </div>

          {/* Group 2: Administrasi Sistem (Hanya Superadmin) */}
          {currentUser?.role === 'superadmin' && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500/90 flex items-center justify-between">
                <span>Administrasi</span>
                <span className="text-[9px] px-1 py-0.2 bg-amber-500/10 rounded font-bold">Khusus Admin</span>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold'
                    : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-100/80 dark:hover:bg-zinc-800/60 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users
                    className={`w-4 h-4 ${
                      activeTab === 'users' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-zinc-400'
                    }`}
                  />
                  <span>Master User</span>
                </div>
                {userCount > 0 && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      activeTab === 'users'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
                    }`}
                  >
                    {userCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer: Logged In User Card & Engine Status */}
      <div className="p-3 border-t border-gray-200 dark:border-zinc-800 space-y-2">
        {currentUser && (
          <div className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-950/70">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs ${
                    currentUser.role === 'superadmin' ? 'bg-amber-500' : 'bg-blue-600'
                  }`}
                >
                  {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'ME'}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-gray-950 dark:text-white truncate block leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 truncate block mt-0.5">
                    {currentUser.role === 'superadmin' ? 'Superadmin' : 'Tester'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shrink-0"
                title="Keluar (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenProfile}
              className="w-full py-1.5 px-2 rounded-lg text-[11px] font-semibold text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/40 transition-all text-center block shadow-2xs"
            >
              Lihat & Ubah Profil
            </button>
          </div>
        )}

        <div className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <div>
              <span className="text-[11px] font-semibold text-gray-800 dark:text-zinc-200 block leading-tight">
                Playwright Engine
              </span>
              <span className="text-[10px] text-gray-500 dark:text-zinc-400 block">Chrome Ready</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-500">
            {typeof window !== 'undefined' && window.electronAPI ? 'Desktop' : 'Server'}
          </span>
        </div>
      </div>
    </aside>
  );
}
