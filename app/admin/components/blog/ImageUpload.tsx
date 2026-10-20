'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Loader2, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { AssetPickerModal } from './AssetPickerModal';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

const PRESET_COVERS = [
  { label: 'Pro Gaming', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Rummy & Cards', url: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Slots & Casino', url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80' },
];

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please upload an image file (PNG, JPG, WebP).',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeded', {
        description: 'Maximum image size is 5MB.',
      });
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading image...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onChange(data.url);
          toast.success('Image uploaded successfully!', { id: toastId });
          return;
        }
      }

      // Fallback: Read as base64 data URL
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string);
        toast.success('Image loaded!', { id: toastId });
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Failed to upload image', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    onChange(customUrl.trim());
    setShowCustomUrlInput(false);
    toast.success('Cover image URL updated');
  };

  return (
    <div className="space-y-3 font-sans">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {value ? (
        <div className="relative rounded-3xl overflow-hidden border border-slate-300 bg-slate-100 group aspect-video max-h-64 w-full flex items-center justify-center shadow-xs">
          <img
            src={value}
            alt="Article Cover Preview"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs flex items-center justify-center gap-3 p-4">
            <button
              type="button"
              onClick={() => setIsAssetPickerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white text-slate-800 hover:bg-slate-50 shadow-md transition-all cursor-pointer border-0 outline-none"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Change Image</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all cursor-pointer border-0 outline-none"
              title="Remove image"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/90 hover:bg-indigo-50/20 p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-xs">
            <Upload className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-900">
              Article Cover Image
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5 max-w-sm">
              Choose from media library, upload local file, or enter an image URL.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setIsAssetPickerOpen(true)}
              disabled={disabled}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer border-0 outline-none active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Browse Media Library</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold shadow-xs transition-colors cursor-pointer outline-none"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              ) : (
                <Upload className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span>Upload Local</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
              className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline px-2 py-1 cursor-pointer font-bold border-0 outline-none"
            >
              {showCustomUrlInput ? 'Cancel URL' : 'Enter URL'}
            </button>
          </div>
        </div>
      )}

      {showCustomUrlInput && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/cover.webp"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 bg-white border border-slate-300 rounded-2xl px-4 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs"
            style={{ borderStyle: 'solid' }}
          />
          <button
            type="button"
            onClick={handleApplyCustomUrl}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer border-0 outline-none"
          >
            Apply
          </button>
        </div>
      )}

      {/* Preset Quick Select */}
      <div className="pt-1 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
          <span>Preset Themes:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COVERS.map((preset) => {
            const active = value === preset.url;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange(preset.url)}
                className={`text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer outline-none ${
                  active
                    ? 'font-bold shadow-xs'
                    : 'hover:bg-slate-100 font-semibold shadow-xs'
                }`}
                style={{
                  backgroundColor: active ? '#4f46e5' : '#ffffff',
                  color: active ? '#ffffff' : '#334155',
                  border: active ? '1px solid #4f46e5' : '1px solid #cbd5e1',
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <AssetPickerModal
        isOpen={isAssetPickerOpen}
        onClose={() => setIsAssetPickerOpen(false)}
        onSelectImage={(url) => onChange(url)}
        currentSelectedUrl={value}
      />
    </div>
  );
}
