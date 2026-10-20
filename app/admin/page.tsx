'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppRecord } from '@/lib/supabase';
import {
  FiSmartphone,
  FiCheckCircle,
  FiStar,
  FiPauseCircle,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';
import AppFormModal from './components/AppFormModal';
import StatsCard from './components/StatsCard';
import AppTable from './components/AppTable';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { useTheme } from '../ThemeProvider';

export default function AdminPage() {
  const [apps, setApps] = useState<AppRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<AppRecord | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    }
  }, []);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: '15',
      ...(search && { search }),
      ...(statusFilter && { status: statusFilter }),
      ...(categoryFilter && { category: categoryFilter }),
    });
    try {
      const res = await fetch(`/api/admin/apps?${params}`);
      const json = await res.json();
      setApps(json.data || []);
      setTotal(json.total || 0);
    } catch {
      setApps([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async (formData: Partial<AppRecord>) => {
    const isEdit = !!editingApp;
    const url = isEdit ? `/api/admin/apps/${editingApp!.id}` : '/api/admin/apps';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        showToast(data.error || 'Failed to save app', 'error');
        return false;
      }

      showToast(isEdit ? 'App updated successfully!' : 'App published successfully!');
      setShowModal(false);
      setEditingApp(null);
      fetchApps();
      return true;
    } catch {
      showToast('Network error while saving app', 'error');
      return false;
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/apps/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok || data.error) {
        showToast(data.error || 'Failed to delete app', 'error');
        return;
      }

      showToast(`"${name}" deleted successfully.`);
      fetchApps();
    } catch {
      showToast('Network error while deleting app', 'error');
    }
  };

  const handleToggleStatus = async (app: AppRecord) => {
    const nextStatus = app.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/apps/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showToast(`App marked as ${nextStatus}.`);
        fetchApps();
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const openAdd = () => {
    setEditingApp(null);
    setShowModal(true);
  };

  const openEdit = (app: AppRecord) => {
    setEditingApp(app);
    setShowModal(true);
  };

  const stats = {
    total,
    active: apps.filter((a) => a.status === 'active').length,
    featured: apps.filter((a) => a.is_featured).length,
    inactive: apps.filter((a) => a.status === 'inactive').length,
  };

  return (
    <div className="flex min-h-screen bg-slate-50  text-slate-900  transition-colors duration-200">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        totalApps={total}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-200">
        <TopBar
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onAddApp={openAdd}
          search={search}
          onSearch={(val) => {
            setSearch(val);
            setPage(1);
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="p-2.5 sm:p-5 lg:p-6 space-y-3 sm:space-y-5 max-w-7xl mx-auto w-full">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <StatsCard
              icon={<FiSmartphone size={20} />}
              label="Total Apps"
              value={total}
              color="#6366f1"
            />
            <StatsCard
              icon={<FiCheckCircle size={20} />}
              label="Active Apps"
              value={stats.active}
              color="#22c55e"
            />
            <StatsCard
              icon={<FiStar size={20} />}
              label="Featured"
              value={stats.featured}
              color="#f59e0b"
            />
            <StatsCard
              icon={<FiPauseCircle size={20} />}
              label="Inactive"
              value={stats.inactive}
              color="#ef4444"
            />
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 p-3 sm:p-4 rounded-2xl bg-white border border-slate-300 shadow-xs">
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
              <select
                className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="archived">Archived</option>
              </select>

              <select
                className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Categories</option>
                <option value="rummy">Rummy</option>
                <option value="slots">Slots</option>
                <option value="teen_patti">Teen Patti</option>
                <option value="poker">Poker</option>
                <option value="ludo">Ludo</option>
                <option value="fantasy">Fantasy</option>
                <option value="cricket">Cricket</option>
                <option value="arcade">Arcade</option>
                <option value="card">Card</option>
                <option value="casino">Casino</option>
                <option value="other">Other</option>
              </select>
            </div>

            <span className="text-xs font-semibold text-slate-500 text-right sm:text-left">
              {apps.length} of {total} app{total !== 1 ? 's' : ''} shown
            </span>
          </div>

          {/* Apps Table */}
          <AppTable
            apps={apps}
            loading={loading}
            onEdit={openEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />

          {/* Pagination */}
          {total > 15 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <FiChevronLeft size={14} /> Prev
              </button>
              <span className="text-xs font-semibold text-slate-500">
                Page {page} of {Math.ceil(total / 15) || 1}
              </span>
              <button
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
                disabled={page >= Math.ceil(total / 15)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <FiChevronRight size={14} />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <AppFormModal
          app={editingApp}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingApp(null);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold border transition-all ${
            toast.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500 shadow-rose-500/20'
              : 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
          }`}
        >
          {toast.type === 'error' ? (
            <FiAlertCircle size={18} />
          ) : (
            <FiCheck size={18} />
          )}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
