'use client';

import { useState, useEffect, useRef } from 'react';
import { AppRecord } from '@/lib/supabase';
import slugify from 'slugify';
import {
  FiEdit2,
  FiPlus,
  FiX,
  FiSmartphone,
  FiImage,
  FiUploadCloud,
  FiCheck,
  FiTrash2,
  FiStar,
  FiCheckCircle,
  FiSave,
  FiRefreshCw,
  FiLink,
} from 'react-icons/fi';
import dynamic from 'next/dynamic';

const CompactTiptapEditor = dynamic(
  () => import('./blog/CompactTiptapEditor').then((m) => m.CompactTiptapEditor),
  { ssr: false }
);

interface Props {
  app: AppRecord | null;
  onSave: (data: Partial<AppRecord>) => Promise<boolean>;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'rummy', label: 'Rummy' },
  { id: 'teen_patti', label: 'Teen Patti' },
  { id: 'slots', label: 'Slots' },
  { id: 'casino', label: 'Casino' },
  { id: 'poker', label: 'Poker' },
  { id: 'ludo', label: 'Ludo' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'cricket', label: 'Cricket' },
  { id: 'other', label: 'Other' },
];

const defaultForm: Partial<AppRecord> = {
  name: '',
  slug: '',
  category: 'rummy',
  download_url: '',
  signup_bonus: 51,
  min_withdrawal: 100,
  rating: 4.5,
  short_desc: '',
  status: 'active',
  logo_url: '',
  banner_url: '',
  screenshot_urls: [],
  is_featured: false,
  is_verified: true,
};

export default function AppFormModal({ app, onSave, onClose }: Props) {
  const [form, setForm] = useState<Partial<AppRecord>>(defaultForm);
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Uploading loading states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingScreenshots, setUploadingScreenshots] = useState(false);

  // Hidden file inputs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const screenshotsInputRef = useRef<HTMLInputElement>(null);

  // (Legacy markdown toolbar removed — now using CompactTiptapEditor)

  useEffect(() => {
    if (app) {
      setForm({
        ...defaultForm,
        ...app,
      });
    } else {
      setForm(defaultForm);
    }
    setActiveTab(0);
    setErrors({});
  }, [app]);

  const set = (key: keyof AppRecord, val: unknown) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) {
      setErrors((e) => {
        const n = { ...e };
        delete n[key];
        return n;
      });
    }
  };

  const handleNameChange = (val: string) => {
    set('name', val);
    const autoSlug = slugify(val, { lower: true, strict: true, trim: true });
    set('slug', autoSlug);
  };

  // Upload helper
  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.error) {
        alert('Upload failed: ' + data.error);
        return null;
      }
      return data.url;
    } catch {
      alert('Network error while uploading image');
      return null;
    }
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const url = await uploadImage(file, 'logos');
    if (url) set('logo_url', url);
    setUploadingLogo(false);
    e.target.value = '';
  };

  const handleBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    const url = await uploadImage(file, 'banners');
    if (url) set('banner_url', url);
    setUploadingBanner(false);
    e.target.value = '';
  };

  const handleScreenshotsSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingScreenshots(true);
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImage(files[i], 'screenshots');
      if (url) newUrls.push(url);
    }
    if (newUrls.length > 0) {
      set('screenshot_urls', [...(form.screenshot_urls || []), ...newUrls]);
    }
    setUploadingScreenshots(false);
    e.target.value = '';
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name?.trim()) errs.name = 'App name is required';
    if (!form.slug?.trim() && form.name?.trim()) {
      form.slug = slugify(form.name, { lower: true, strict: true, trim: true });
    }
    if (!form.slug?.trim()) errs.slug = 'Slug is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.download_url?.trim()) {
      errs.download_url = 'Download / Referral link is required';
    }

    if (form.rating !== undefined && (form.rating < 0 || form.rating > 5)) {
      errs.rating = 'Rating must be 0 to 5';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setActiveTab(0);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const ok = await onSave(form);
    if (!ok) setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-white border border-slate-300 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-300 flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
              {app ? (
                <>
                  <FiEdit2 size={16} className="text-indigo-600" />
                  <span>Edit App — {app.name}</span>
                </>
              ) : (
                <>
                  <FiPlus size={16} className="text-indigo-600" />
                  <span>Add New App</span>
                </>
              )}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Direct configuration for single-site APK management
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border-0 outline-none"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* 2 Tabs */}
        <div className="flex border-b border-slate-300 bg-slate-50/70 px-3 sm:px-6 gap-1 sm:gap-2">
          <button
            className={`py-2.5 px-2.5 sm:py-3 sm:px-3 text-xs sm:text-sm font-semibold border-0 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-all outline-none cursor-pointer ${
              activeTab === 0
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab(0)}
            type="button"
          >
            <FiSmartphone size={14} />
            <span>App Details</span>
            {(errors.name || errors.slug || errors.category || errors.download_url) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            )}
          </button>
          <button
            className={`py-2.5 px-2.5 sm:py-3 sm:px-3 text-xs sm:text-sm font-semibold border-0 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-all outline-none cursor-pointer ${
              activeTab === 1
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab(1)}
            type="button"
          >
            <FiImage size={14} />
            <span>Media Upload</span>
            {form.logo_url && (
              <span className="text-xs text-emerald-500 font-bold">✓</span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3.5 sm:space-y-5">
          {/* ── TAB 0: App Details ── */}
          {activeTab === 0 && (
            <div className="space-y-4">
              {/* App Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700  mb-1.5">
                    App Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    className={`w-full bg-slate-50  border rounded-xl px-3.5 py-2.5 text-sm text-slate-900  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      errors.name
                        ? 'border-rose-500 ring-1 ring-rose-500'
                        : 'border-slate-200 '
                    }`}
                    value={form.name || ''}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Yono Rummy"
                  />
                  {errors.name && (
                    <span className="text-xs text-rose-500 mt-1 block font-medium">
                      {errors.name}
                    </span>
                  )}
                  {/* Automatic Slug Preview */}
                  <div className="text-[11px] font-mono text-slate-500  mt-1">
                    URL: /{form.slug || 'app-slug'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700  mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    className="w-full bg-slate-50  border border-slate-200  rounded-xl px-3.5 py-2.5 text-sm text-slate-900  focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={form.category || 'rummy'}
                    onChange={(e) => set('category', e.target.value)}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Single Download / Referral Link */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700  mb-1.5">
                  <FiLink size={13} className="inline mr-1 text-indigo-500" />
                  Download / Referral Link (APK) <span className="text-rose-500">*</span>
                </label>
                <input
                  className={`w-full bg-slate-50  border rounded-xl px-3.5 py-2.5 text-sm text-slate-900  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.download_url
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : 'border-slate-200 '
                  }`}
                  value={form.download_url || ''}
                  onChange={(e) => set('download_url', e.target.value)}
                  placeholder="https://... direct APK download link"
                />
                {errors.download_url && (
                  <span className="text-xs text-rose-500 mt-1 block font-medium">
                    {errors.download_url}
                  </span>
                )}
              </div>

              {/* Bonus, Min Withdrawal & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700  mb-1.5">
                    Signup Bonus (₹)
                  </label>
                  <input
                    className="w-full bg-slate-50  border border-slate-200  rounded-xl px-3.5 py-2.5 text-sm text-slate-900  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    type="number"
                    min="0"
                    value={form.signup_bonus ?? 0}
                    onChange={(e) =>
                      set('signup_bonus', parseFloat(e.target.value) || 0)
                    }
                    placeholder="e.g. 51"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700  mb-1.5">
                    Min Withdrawal (₹)
                  </label>
                  <input
                    className="w-full bg-slate-50  border border-slate-200  rounded-xl px-3.5 py-2.5 text-sm text-slate-900  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    type="number"
                    min="0"
                    value={form.min_withdrawal ?? ''}
                    onChange={(e) =>
                      set(
                        'min_withdrawal',
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    placeholder="e.g. 100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700  mb-1.5">
                    Rating (0–5)
                  </label>
                  <input
                    className={`w-full bg-slate-50  border rounded-xl px-3.5 py-2.5 text-sm text-slate-900  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      errors.rating
                        ? 'border-rose-500 ring-1 ring-rose-500'
                        : 'border-slate-200 '
                    }`}
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating ?? 4.5}
                    onChange={(e) =>
                      set('rating', parseFloat(e.target.value) || 4.5)
                    }
                  />
                  {errors.rating && (
                    <span className="text-xs text-rose-500 mt-1 block font-medium">
                      {errors.rating}
                    </span>
                  )}
                </div>
              </div>

              {/* Short Description — Rich WYSIWYG Editor */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Short Description / Highlights
                  <span className="text-[11px] font-normal text-slate-400 ml-2">
                    (Rich text · formatted on website)
                  </span>
                </label>
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                  <CompactTiptapEditor
                    content={form.short_desc || ''}
                    onChange={(html) => set('short_desc', html)}
                    placeholder="e.g. Top features: Free ₹100 bonus, instant UPI withdrawal, 24x7 support..."
                    minHeight="110px"
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                  <span>Rich text · Formatted automatically for website cards and listing pages</span>
                  <span>
                    {(form.short_desc || '').replace(/<[^>]*>/g, '').length}/800 characters
                  </span>
                </div>
              </div>

              {/* Status & Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700  mb-1.5">
                    Status
                  </label>
                  <select
                    className="w-full bg-slate-50  border border-slate-200  rounded-xl px-3.5 py-2.5 text-sm text-slate-900  focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={form.status || 'active'}
                    onChange={(e) => set('status', e.target.value)}
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200  bg-slate-50  cursor-pointer select-none hover:border-slate-300  transition-colors"
                    onClick={() => set('is_featured', !form.is_featured)}
                  >
                    <div className="flex items-center gap-2">
                      <FiStar size={16} className="text-amber-500" />
                      <span className="text-xs font-semibold text-slate-800 ">
                        Featured App
                      </span>
                    </div>
                    <div
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                        form.is_featured ? 'bg-indigo-600' : 'bg-slate-300 '
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          form.is_featured ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200  bg-slate-50  cursor-pointer select-none hover:border-slate-300  transition-colors"
                    onClick={() => set('is_verified', !form.is_verified)}
                  >
                    <div className="flex items-center gap-2">
                      <FiCheckCircle size={16} className="text-emerald-500" />
                      <span className="text-xs font-semibold text-slate-800 ">
                        Verified Badge
                      </span>
                    </div>
                    <div
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                        form.is_verified ? 'bg-indigo-600' : 'bg-slate-300 '
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          form.is_verified ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 1: Direct Media Uploads ── */}
          {activeTab === 1 && (
            <div className="space-y-5">
              {/* App Logo Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700  mb-1.5">
                  App Logo (Square Icon)
                </label>
                <input
                  type="file"
                  ref={logoInputRef}
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoSelect}
                />

                {uploadingLogo ? (
                  <div className="flex items-center justify-center p-6 rounded-2xl border border-indigo-200  bg-indigo-50/50  text-indigo-600  gap-2 text-xs font-semibold">
                    <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Uploading App Logo to Supabase Storage...</span>
                  </div>
                ) : form.logo_url ? (
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200  bg-slate-50 ">
                    <div className="flex items-center gap-3">
                      <img
                        src={form.logo_url}
                        alt="App Logo"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 "
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedFallback) {
                            target.dataset.triedFallback = 'true';
                            target.src = '/assets/img/logo.png';
                          }
                        }}
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 ">
                          Logo Uploaded
                        </div>
                        <span className="inline-flex items-center gap-0.5 text-[11px] text-emerald-500 font-semibold">
                          <FiCheck size={11} /> Saved
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="p-2 rounded-lg text-slate-600  hover:bg-slate-200/60  text-xs font-medium flex items-center gap-1"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <FiRefreshCw size={12} /> Change
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50  text-xs font-medium flex items-center gap-1"
                        onClick={() => set('logo_url', '')}
                      >
                        <FiTrash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-slate-200  hover:border-indigo-500  rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50  transition-colors"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <FiUploadCloud size={28} className="mx-auto text-slate-400 mb-2" />
                    <div className="text-xs font-bold text-slate-700 ">
                      Click to upload App Logo
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      PNG, JPG, or WEBP (Max 10MB) · Recommended 512×512
                    </div>
                  </div>
                )}
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700  mb-1.5">
                  Banner / Card Poster (Optional)
                </label>
                <input
                  type="file"
                  ref={bannerInputRef}
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleBannerSelect}
                />

                {uploadingBanner ? (
                  <div className="flex items-center justify-center p-6 rounded-2xl border border-indigo-200  bg-indigo-50/50  text-indigo-600  gap-2 text-xs font-semibold">
                    <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Uploading Banner Image...</span>
                  </div>
                ) : form.banner_url ? (
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200  bg-slate-50 ">
                    <div className="flex items-center gap-3">
                      <img
                        src={form.banner_url}
                        alt="Banner"
                        className="w-16 h-10 rounded-lg object-cover border border-slate-200 "
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 ">
                          Banner Uploaded
                        </div>
                        <span className="inline-flex items-center gap-0.5 text-[11px] text-emerald-500 font-semibold">
                          <FiCheck size={11} /> Saved
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="p-2 rounded-lg text-slate-600  hover:bg-slate-200/60  text-xs font-medium flex items-center gap-1"
                        onClick={() => bannerInputRef.current?.click()}
                      >
                        <FiRefreshCw size={12} /> Change
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50  text-xs font-medium flex items-center gap-1"
                        onClick={() => set('banner_url', '')}
                      >
                        <FiTrash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-slate-200  hover:border-indigo-500  rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50  transition-colors"
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    <FiUploadCloud size={28} className="mx-auto text-slate-400 mb-2" />
                    <div className="text-xs font-bold text-slate-700 ">
                      Click to upload Banner Image
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Landscape format (e.g. 1280×720 or 16:9)
                    </div>
                  </div>
                )}
              </div>

              {/* Screenshots Gallery Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 ">
                    Screenshots ({(form.screenshot_urls || []).length} added)
                  </label>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600  hover:bg-indigo-50  flex items-center gap-1"
                    onClick={() => screenshotsInputRef.current?.click()}
                    disabled={uploadingScreenshots}
                  >
                    <FiUploadCloud size={13} /> Upload Screenshots
                  </button>
                  <input
                    type="file"
                    ref={screenshotsInputRef}
                    className="hidden"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={handleScreenshotsSelect}
                  />
                </div>

                {uploadingScreenshots && (
                  <div className="flex items-center justify-center p-4 rounded-xl border border-indigo-200  bg-indigo-50/50  text-indigo-600  gap-2 text-xs font-semibold mb-3">
                    <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Uploading screenshots...</span>
                  </div>
                )}

                {(form.screenshot_urls || []).length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {(form.screenshot_urls || []).map((url, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-xl overflow-hidden aspect-[9/16] bg-slate-100  border border-slate-200  group"
                      >
                        <img
                          src={url}
                          alt={`Screenshot ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          className="absolute top-1.5 right-1.5 p-1 rounded-md bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            set(
                              'screenshot_urls',
                              (form.screenshot_urls || []).filter((_, j) => j !== idx)
                            )
                          }
                          title="Remove screenshot"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-slate-200  text-center text-xs text-slate-400">
                    No screenshots uploaded yet (optional)
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3.5 py-3 sm:px-6 sm:py-4 border-t border-slate-300 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-center sm:text-left">
            {activeTab === 0 ? (
              <button
                type="button"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline border-0 outline-none cursor-pointer py-1"
                onClick={() => setActiveTab(1)}
              >
                Go to Media Upload →
              </button>
            ) : (
              <button
                type="button"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline border-0 outline-none cursor-pointer py-1"
                onClick={() => setActiveTab(0)}
              >
                ← Back to Details
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
            <button
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border-0 outline-none text-center"
              onClick={onClose}
              disabled={saving}
              type="button"
            >
              Cancel
            </button>
            <button
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer border-0 outline-none text-center"
              onClick={handleSubmit}
              disabled={saving || uploadingLogo || uploadingBanner}
              type="button"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : app ? (
                <>
                  <FiSave size={15} />
                  <span>Update App</span>
                </>
              ) : (
                <>
                  <FiCheck size={15} />
                  <span>Publish App</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
