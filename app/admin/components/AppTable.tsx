'use client';

import { ComponentType } from 'react';
import { AppRecord } from '@/lib/supabase';
import {
  FiEdit2,
  FiExternalLink,
  FiTrash2,
  FiCheck,
} from 'react-icons/fi';
import {
  RiGamepadLine,
  RiStarFill,
  RiInboxLine,
  RiPlayListLine,
  RiCoinLine,
  RiVipCrownLine,
  RiTrophyLine,
  RiFireLine,
  RiAppsLine,
} from 'react-icons/ri';

interface Props {
  apps: AppRecord[];
  loading: boolean;
  onEdit: (app: AppRecord) => void;
  onDelete: (id: string, name: string) => void;
  onToggleStatus: (app: AppRecord) => void;
}

const CATEGORY_ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  rummy: RiPlayListLine,
  slots: RiCoinLine,
  teen_patti: RiVipCrownLine,
  poker: RiVipCrownLine,
  ludo: RiGamepadLine,
  fantasy: RiTrophyLine,
  cricket: RiTrophyLine,
  arcade: RiGamepadLine,
  board: RiGamepadLine,
  card: RiPlayListLine,
  casino: RiFireLine,
  other: RiAppsLine,
};

export default function AppTable({
  apps,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
}: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400  gap-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading apps...</span>
      </div>
    );
  }

  if (!apps.length) {
    return (
      <div className="flex flex-col items-center justify-center p-16 rounded-2xl border-2 border-dashed border-slate-200  bg-white/50  text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100  flex items-center justify-center mb-4 text-slate-400 ">
          <RiInboxLine size={32} />
        </div>
        <div className="text-base font-bold text-slate-900 ">No apps found</div>
        <div className="text-xs text-slate-500  mt-1">Add your first app to get started</div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop / Tablet View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-300 bg-white shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-700 uppercase tracking-wider select-none">
              <th className="py-3.5 px-4">App</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Bonus</th>
              <th className="py-3.5 px-4">Rating</th>
              <th className="py-3.5 px-4">Featured</th>
              <th className="py-3.5 px-4">Downloads</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 ">
            {apps.map((app) => {
              const CategoryIcon = CATEGORY_ICONS[app.category] || RiAppsLine;
              const isActive = app.status === 'active';

              return (
                <tr
                  key={app.id}
                  className="hover:bg-slate-50/80  transition-colors"
                >
                  {/* App Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100  flex items-center justify-center flex-shrink-0 border border-slate-200 ">
                        {app.logo_url ? (
                          <img
                            src={app.logo_url}
                            alt={app.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (!target.dataset.triedFallback) {
                                target.dataset.triedFallback = 'true';
                                target.src = '/assets/img/logo.png';
                              }
                            }}
                          />
                        ) : (
                          <RiGamepadLine size={20} className="text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900  truncate">
                          <span>{app.name}</span>
                          {app.is_verified && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-600   border border-emerald-200 "
                              title="Verified Official"
                            >
                              <FiCheck size={10} /> Verified
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400  font-mono truncate">
                          /{app.slug}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100  text-slate-700  capitalize border border-slate-200/60 ">
                      <CategoryIcon size={13} className="text-indigo-500" />
                      <span>{app.category.replace('_', ' ')}</span>
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(app)}
                      title="Click to toggle status"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer outline-none ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isActive ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      />
                      <span className="capitalize">{app.status.replace('_', ' ')}</span>
                    </button>
                  </td>

                  {/* Bonus */}
                  <td className="py-3.5 px-4 font-semibold text-xs">
                    {app.signup_bonus > 0 ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700   border border-amber-200 ">
                        ₹{app.signup_bonus}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Rating */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-700 ">
                      <RiStarFill size={13} className="text-amber-400" />
                      <span>{app.rating.toFixed(1)}</span>
                    </div>
                  </td>

                  {/* Featured */}
                  <td className="py-3.5 px-4">
                    {app.is_featured ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 ">
                        <RiStarFill size={13} /> Featured
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>

                  {/* Downloads */}
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600 ">
                    {app.total_downloads >= 1000000
                      ? `${(app.total_downloads / 1000000).toFixed(1)}M`
                      : app.total_downloads >= 1000
                      ? `${(app.total_downloads / 1000).toFixed(0)}K`
                      : app.total_downloads.toString()}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => onEdit(app)}
                        title="Edit app"
                        aria-label="Edit app"
                        className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer border-0 outline-none"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <a
                        href={`/${app.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Visit ${app.name} page`}
                        aria-label={`Visit ${app.name} page`}
                        className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer border-0 outline-none"
                      >
                        <FiExternalLink size={15} />
                      </a>
                      <button
                        type="button"
                        onClick={() => onDelete(app.id, app.name)}
                        title="Delete app"
                        aria-label="Delete app"
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border-0 outline-none"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (<768px) */}
      <div className="block md:hidden space-y-2.5">
        {apps.map((app) => {
          const CategoryIcon = CATEGORY_ICONS[app.category] || RiAppsLine;
          const isActive = app.status === 'active';

          return (
            <div
              key={app.id}
              className="rounded-2xl border border-slate-300 bg-white p-3.5 shadow-xs space-y-3 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-xs">
                    {app.logo_url ? (
                      <img
                        src={app.logo_url}
                        alt={app.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedFallback) {
                            target.dataset.triedFallback = 'true';
                            target.src = '/assets/img/logo.png';
                          }
                        }}
                      />
                    ) : (
                      <RiGamepadLine size={22} className="text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 truncate">
                      <span className="truncate">{app.name}</span>
                      {app.is_verified && (
                        <FiCheck size={13} className="text-emerald-600 flex-shrink-0" title="Verified" />
                      )}
                      {app.is_featured && (
                        <RiStarFill size={13} className="text-amber-500 flex-shrink-0" title="Featured" />
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono truncate">
                      /{app.slug}
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <button
                  type="button"
                  onClick={() => onToggleStatus(app)}
                  title="Click to toggle status"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border flex-shrink-0 cursor-pointer outline-none transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  />
                  <span className="capitalize">{app.status.replace('_', ' ')}</span>
                </button>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 text-slate-700 font-medium capitalize bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  <CategoryIcon size={13} className="text-indigo-600" />
                  <span>{app.category.replace('_', ' ')}</span>
                </span>

                <div className="flex items-center gap-2">
                  {app.signup_bonus > 0 && (
                    <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-amber-50 text-amber-800 border border-amber-200">
                      ₹{app.signup_bonus} Bonus
                    </span>
                  )}

                  <div className="flex items-center gap-1 font-bold text-xs text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                    <RiStarFill size={12} className="text-amber-400" />
                    <span>{app.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <span className="text-[11px] font-mono text-slate-500">
                  {app.total_downloads >= 1000 ? `${(app.total_downloads / 1000).toFixed(0)}k+ downloads` : `${app.total_downloads} downloads`}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEdit(app)}
                    title="Edit app"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 active:scale-95 transition-all cursor-pointer outline-none"
                  >
                    <FiEdit2 size={13} />
                    <span>Edit</span>
                  </button>

                  <a
                    href={`/${app.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Visit ${app.name} page`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 active:scale-95 transition-all cursor-pointer outline-none"
                  >
                    <FiExternalLink size={13} />
                    <span className="hidden xs:inline sm:inline">View</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => onDelete(app.id, app.name)}
                    title="Delete app"
                    className="p-1.5 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 active:scale-95 transition-all cursor-pointer outline-none"
                    aria-label="Delete app"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
