'use client';

import { FiMenu, FiChevronRight, FiSearch, FiX, FiPlus } from 'react-icons/fi';

interface Props {
  onToggleSidebar: () => void;
  onAddApp: () => void;
  search: string;
  onSearch: (val: string) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export default function TopBar({
  onToggleSidebar,
  onAddApp,
  search,
  onSearch,
  theme = 'dark',
  onToggleTheme,
}: Props) {
  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 w-full flex items-center justify-between px-3 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-300 transition-colors duration-200">
      {/* Left: Mobile Menu + Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
          className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all border-0 outline-none cursor-pointer flex-shrink-0"
        >
          <FiMenu size={19} />
        </button>
        <div className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-medium select-none min-w-0">
          <span className="text-slate-600 font-semibold">Admin</span>
          <FiChevronRight size={13} className="text-slate-400 flex-shrink-0" />
          <span className="text-slate-900 font-bold truncate">App Manager</span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xs sm:max-w-md mx-2 sm:mx-4 min-w-0">
        <div className="relative flex items-center w-full">
          <FiSearch
            size={14}
            className="absolute left-2.5 sm:left-3 text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search apps..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-slate-100 border border-slate-300 rounded-2xl pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearch('')}
              title="Clear search"
              aria-label="Clear search"
              className="absolute right-2 p-1 rounded-full text-slate-400 hover:text-slate-700 transition-colors border-0 outline-none cursor-pointer"
            >
              <FiX size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Right: Add App Button */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={onAddApp}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 active:scale-95 shadow-md shadow-indigo-500/20 transition-all flex-shrink-0 cursor-pointer border-0 outline-none"
        >
          <FiPlus size={15} />
          <span className="hidden sm:inline">Add App</span>
          <span className="inline sm:hidden font-bold">New</span>
        </button>
      </div>
    </header>
  );
}
