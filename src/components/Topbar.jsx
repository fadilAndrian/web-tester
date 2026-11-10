import React from 'react';
import { Sun, Moon, Plus, ChevronRight, Search, ExternalLink } from 'lucide-react';

export default function Topbar({
  activeTab,
  viewMode,
  isDark,
  onToggleTheme,
  onNewAction,
  onBackToList
}) {
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
    }

    return list;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 px-6 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between select-none transition-colors duration-150 shrink-0">
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
      </div>
    </header>
  );
}
