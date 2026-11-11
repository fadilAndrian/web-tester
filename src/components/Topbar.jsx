import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Moon,
  Plus,
  ChevronRight,
  ChevronDown,
  User,
  ShieldCheck,
  FlaskConical,
  LogOut,
  Monitor,
  Globe
} from 'lucide-react';
import { api } from '../services/api';

export default function Topbar({
  activeTab,
  viewMode,
  isDark,
  currentUser,
  onOpenProfile,
  onLogout,
  onToggleTheme,
  onNewAction,
  onBackToList
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const getBreadcrumbs = () => {
    const list = [{ label: 'Dashboard', onClick: onBackToList }];

    if (activeTab === 'scenarios') {
      if (viewMode === 'edit-scenario') {
        list.push({ label: 'Skenario Tes', onClick: onBackToList });
        list.push({ label: 'Setup Skenario', current: true });
      } else {
        list.push({ label: 'Skenario Tes', current: true });
      }
    } else if (activeTab === 'suites') {
      if (viewMode === 'edit-suite') {
        list.push({ label: 'Test Suites', onClick: onBackToList });
        list.push({ label: 'Setup Suite', current: true });
      } else {
        list.push({ label: 'Test Suites', current: true });
      }
    } else if (activeTab === 'users') {
      list.push({ label: 'Master User & Hak Akses', current: true });
    }

    return list;
  };

  const breadcrumbs = getBreadcrumbs();
  const isSuperadmin = currentUser?.role === 'superadmin';
  const isElectron = api.isElectron();

  return (
    <header className="h-16 px-6 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between select-none transition-colors duration-150 shrink-0 relative z-30">
      {/* Breadcrumb Trail */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
        {breadcrumbs.map((item, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />}
            {item.current ? (
              <span className="font-semibold text-gray-900 dark:text-white">{item.label}</span>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-gray-900 dark:hover:text-zinc-200 hover:underline transition-colors"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Environment Mode Badge */}
        <div
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
            isElectron
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
              : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
          }`}
          title={
            isElectron
              ? 'Aplikasi berjalan sebagai Desktop App. Browser pengujian dibuka di layar ini.'
              : 'Aplikasi berjalan via Web Browser. Pengujian dieksekusi di server host.'
          }
        >
          {isElectron ? (
            <>
              <Monitor className="w-3 h-3" />
              <span>Desktop App</span>
            </>
          ) : (
            <>
              <Globe className="w-3 h-3" />
              <span>Web Client</span>
            </>
          )}
        </div>

        {/* Filament Theme Switcher (Dark / Light) */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
          className="p-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-700/80 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Action Button */}
        {viewMode === 'list' && (activeTab === 'scenarios' || activeTab === 'suites') && (
          <button
            type="button"
            onClick={onNewAction}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-xs focus:ring-2 focus:ring-amber-500/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'scenarios' ? 'Setup Skenario Baru' : 'Buat Suite Baru'}</span>
          </button>
        )}

        {/* Top-Right User Menu & Logout Dropdown */}
        {currentUser && (
          <div className="relative pl-2 border-l border-gray-200 dark:border-zinc-800" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-amber-500/50 bg-gray-50/80 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800 transition-all text-left group shadow-2xs"
              title="Menu Akun Pengguna"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs ${
                  isSuperadmin ? 'bg-amber-500' : 'bg-blue-600'
                }`}
              >
                {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'US'}
              </div>

              <div className="hidden sm:block text-left min-w-0 max-w-[120px]">
                <span className="text-xs font-bold text-gray-900 dark:text-white block truncate leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 block truncate">
                  {isSuperadmin ? 'Superadmin' : 'Tester'}
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 group-hover:text-amber-500 transition-transform duration-200 shrink-0 ${
                  isDropdownOpen ? 'rotate-180 text-amber-500' : ''
                }`}
              />
            </button>

            {/* Dropdown Popover */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Header */}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-950/60 border border-gray-100 dark:border-zinc-800/80 mb-1.5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs ${
                        isSuperadmin ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                    >
                      {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'US'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-950 dark:text-white truncate">
                        {currentUser.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isSuperadmin ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        <ShieldCheck className="w-3 h-3" /> Superadmin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                        <FlaskConical className="w-3 h-3" /> QA Tester
                      </span>
                    )}

                    <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                      ID: {currentUser.id}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-0.5">
                  {/* Profile Menu Item */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-zinc-800 group-hover:bg-amber-500/10 text-gray-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center justify-center transition-colors">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-gray-900 dark:text-white block leading-tight">
                        Profil Saya
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 block">
                        Lihat & ubah data pribadi
                      </span>
                    </div>
                  </button>
                </div>

                <div className="my-1.5 border-t border-gray-100 dark:border-zinc-800" />

                {/* Logout Menu Item */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <LogOut className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block leading-tight">
                      Keluar (Log Out)
                    </span>
                    <span className="text-[10px] text-rose-400/80 dark:text-rose-400/70 block">
                      Akhiri sesi login saat ini
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
