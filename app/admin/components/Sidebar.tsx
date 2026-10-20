'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { RiAppsLine, RiGamepadLine, RiLogoutBoxRLine } from 'react-icons/ri';
import { FiExternalLink, FiFileText, FiX } from 'react-icons/fi';

interface Props {
  open: boolean;
  onClose?: () => void;
  totalApps?: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export default function Sidebar({
  open,
  onClose,
  totalApps,
  theme = 'dark',
  onToggleTheme,
}: Props) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const [userEmail, setUserEmail] = useState('');
  const [userInitial, setUserInitial] = useState('A');
  const [loggingOut, setLoggingOut] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
        setUserInitial(user.email[0].toUpperCase());
      }
    });
  }, [supabase]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace('/admin/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] flex flex-col bg-white border-r border-slate-300 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 flex-shrink-0">
              <RiGamepadLine size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">
                Yono Portal
              </div>
              <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                Admin Panel
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors border-0 outline-none cursor-pointer flex-shrink-0"
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Menu
          </div>

          <Link
            href="/admin"
            onClick={onClose}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all no-underline ${
              pathname === '/admin'
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            style={{ textDecoration: 'none' }}
          >
            <div className="flex items-center gap-3">
              <RiAppsLine size={18} />
              <span>All Apps</span>
            </div>
            {totalApps !== undefined && totalApps > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-600 text-white">
                {totalApps}
              </span>
            )}
          </Link>

          <Link
            href="/admin/blog"
            onClick={onClose}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-semibold text-sm transition-all no-underline ${
              pathname.startsWith('/admin/blog')
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            style={{ textDecoration: 'none' }}
          >
            <div className="flex items-center gap-3">
              <FiFileText size={18} />
              <span>Blog Articles</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
              AI CMS
            </span>
          </Link>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all no-underline"
            style={{ textDecoration: 'none' }}
            title="Open website in new tab"
          >
            <FiExternalLink size={16} />
            <span>View Website</span>
          </a>

          
        </nav>

        {/* User & Logout Footer */}
        <div className="p-3.5 border-t border-slate-300 bg-slate-50/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow">
              {userInitial}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                Admin
              </div>
              <div
                className="text-[11px] text-slate-500 truncate max-w-[130px]"
                title={userEmail}
              >
                {userEmail || 'admin@portal.com'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out"
            aria-label="Sign out"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 active:scale-95 transition-all flex-shrink-0 border-0 outline-none cursor-pointer"
          >
            {loggingOut ? (
              <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin inline-block" />
            ) : (
              <RiLogoutBoxRLine size={17} />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
