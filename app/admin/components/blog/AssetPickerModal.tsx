'use client';

import React, { useState, useMemo } from 'react';
import assets from '@/data/blog_assets.json';
import { Search, X, Check, Image as ImageIcon, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface AssetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  currentSelectedUrl?: string | null;
}

export function AssetPickerModal({
  isOpen,
  onClose,
  onSelectImage,
  currentSelectedUrl,
}: AssetPickerModalProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Gaming', 'Cards', 'Casino', 'Payments', 'Mobile'];

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchesCategory =
        selectedCategory === 'All' || a.category === selectedCategory;
      const matchesSearch =
        !search.trim() ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.category.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  const handleCopy = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    toast.success('Image link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
              <ImageIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Curated Gaming Media Library
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Pick a high-resolution, royalty-free cover image for your article.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border-0 outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-100/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search images by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all"
              style={{ borderStyle: 'solid' }}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer outline-none ${
                    active
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20'
                      : 'hover:bg-slate-100 hover:text-slate-950 font-semibold shadow-xs'
                  }`}
                  style={{
                    backgroundColor: active ? '#4f46e5' : '#ffffff',
                    color: active ? '#ffffff' : '#334155',
                    border: active ? '1px solid #4f46e5' : '1px solid #cbd5e1',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50/70">
          {filteredAssets.map((asset) => {
            const isSelected = currentSelectedUrl === asset.url;
            return (
              <div
                key={asset.id}
                onClick={() => {
                  onSelectImage(asset.url);
                  onClose();
                  toast.success('Cover image updated!');
                }}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 bg-white shadow-xs ${
                  isSelected
                    ? 'border-2 border-indigo-600 ring-2 ring-indigo-500/30 shadow-md'
                    : 'border border-slate-300 hover:border-indigo-500 hover:shadow-md'
                }`}
              >
                <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={asset.url}
                    alt={asset.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent opacity-90" />

                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg font-bold">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleCopy(asset.url, e)}
                    className="absolute top-2.5 left-2.5 p-2 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 hover:text-indigo-600 border border-slate-300 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer outline-none"
                    title="Copy URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <div className="absolute bottom-2.5 left-3 right-3 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-600/90 text-white backdrop-blur-sm shadow-sm">
                      {asset.category}
                    </span>
                    <h4 className="text-xs font-semibold text-white mt-1.5 line-clamp-1">
                      {asset.title}
                    </h4>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-700 font-medium">
          <span>{filteredAssets.length} assets available</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors shadow-xs cursor-pointer border-0 outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
