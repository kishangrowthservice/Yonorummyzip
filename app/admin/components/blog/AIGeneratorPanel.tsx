'use client';

import { useState } from 'react';
import {
  Sparkles,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from '@/lib/ai/models';
import type { GenerateBlogPostOutput } from '@/lib/ai/generateBlogPost';

interface AIGeneratorPanelProps {
  onGenerated: (output: GenerateBlogPostOutput) => void;
  disabled?: boolean;
}

const SUGGESTED_TOPICS = [
  'How to Download All Yono Games APK Safely & Claim ₹1,500 Bonus',
  'Top 5 Rummy Tricks to Win Real Cash Daily on Yono Apps',
  'Yono 777 vs Yono Rummy: Which Sister App Gives Higher Payouts?',
  '2-Minute Instant UPI Withdrawal Guide for All Yono Games',
  'Dragon vs Tiger Winning Formula & Pattern Strategy for Beginners',
];

export function AIGeneratorPanel({ onGenerated, disabled }: AIGeneratorPanelProps) {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Authoritative & Conversational');
  const [wordCount, setWordCount] = useState<number>(1200);
  const [keywords, setKeywords] = useState('');
  const [audience, setAudience] = useState(
    'Indian online gamers, Teen Patti & Rummy players seeking verified Yono apps and payout tips'
  );
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL_ID);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const selectedModelInfo =
    AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Topic is required', {
        description: 'Please enter a target topic or headline to generate an article.',
      });
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading('Generating blog post with AI...', {
      description: `Using ${selectedModelInfo.name}. Drafting SEO copy, headings, and tables.`,
    });

    try {
      const keywordList = keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const idempotencyKey = `ai-gen-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const response = await fetch('/api/admin/blog/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          topic: topic.trim(),
          tone,
          wordCount,
          keywords: keywordList,
          audience: audience.trim(),
          category: 'Yono Games Guides',
          model: selectedModel,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate blog draft.');
      }

      onGenerated(data as GenerateBlogPostOutput);
      setHasGenerated(true);

      toast.success('Article generated successfully!', {
        id: toastId,
        description: `Draft created: "${(data.title || '').slice(0, 48)}..."`,
      });
    } catch (err: unknown) {
      console.error('AI Generator error:', err);
      const message =
        err instanceof Error ? err.message : 'Generation failed. Please try again.';
      toast.error('AI Generation Failed', {
        id: toastId,
        description: message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/60 p-5 sm:p-7 shadow-xs space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Yono Games AI Editorial Director</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                PRO
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Generates high-converting Yono rummy, teen patti guides, apk download strategies, and SEO copy with 0 AI clichés.
            </p>
          </div>
        </div>

        {hasGenerated && (
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Draft Ready in Editor</span>
          </div>
        )}
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
          Select AI Reasoning Engine
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {AVAILABLE_MODELS.map((model) => {
            const isSelected = selectedModel === model.id;
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => setSelectedModel(model.id)}
                disabled={disabled || isGenerating}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-2 border-indigo-600 bg-white shadow-md shadow-indigo-500/10'
                    : 'border border-slate-300 bg-white hover:border-indigo-400 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {model.name}
                  </span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {model.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 line-clamp-2 mb-2 leading-relaxed">
                  {model.description}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 font-medium pt-1.5 border-t border-slate-100">
                  <span>Context: {model.contextWindow}</span>
                  <span className={isSelected ? 'text-indigo-700 font-bold' : 'text-slate-600'}>
                    ⚡ {model.speed}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic & Quick Inspirations */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
          Target Topic or Headline <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. How to Download All Yono Games APK Safely & Claim ₹1,500 Bonus"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={disabled || isGenerating}
          className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all disabled:opacity-50"
          style={{ borderStyle: 'solid' }}
        />

        {/* Quick Inspiration Pills */}
        <div className="pt-1">
          <span className="text-[11px] font-bold text-slate-600 mr-2">Try inspiration:</span>
          <div className="inline-flex flex-wrap gap-1.5 mt-1">
            {SUGGESTED_TOPICS.map((suggested) => (
              <button
                key={suggested}
                type="button"
                onClick={() => setTopic(suggested)}
                disabled={disabled || isGenerating}
                className="text-xs px-3 py-1 rounded-full bg-white hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 border border-slate-300 hover:border-indigo-400 shadow-xs transition-all truncate max-w-[280px] sm:max-w-none cursor-pointer disabled:opacity-50 font-medium"
                style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1' }}
              >
                {suggested}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tone */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
            Editorial Tone
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            disabled={disabled || isGenerating}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all disabled:opacity-50 cursor-pointer font-medium"
            style={{ borderStyle: 'solid' }}
          >
            <option value="Authoritative & Conversational">
              Authoritative &amp; Conversational (Default)
            </option>
            <option value="High Stakes & Tactical Strategy">
              High Stakes &amp; Tactical Strategy
            </option>
            <option value="Deeply Analytical Odds Breakdown">
              Deeply Analytical Odds Breakdown
            </option>
            <option value="Fast Beginners Guide">
              Fast Beginners Guide
            </option>
          </select>
        </div>

        {/* Word Count */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
            Target Article Length
          </label>
          <div className="flex items-center gap-2">
            {[600, 900, 1200].map((count) => {
              const active = wordCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setWordCount(count)}
                  disabled={disabled || isGenerating}
                  className={`flex-1 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'shadow-md shadow-indigo-500/20 font-bold'
                      : 'hover:bg-slate-50 shadow-xs'
                  }`}
                  style={{
                    backgroundColor: active ? '#4f46e5' : '#ffffff',
                    color: active ? '#ffffff' : '#334155',
                    border: active ? '1px solid #4f46e5' : '1px solid #cbd5e1',
                  }}
                >
                  ~{count} words
                </button>
              );
            })}
          </div>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
            Target SEO Keywords (Comma Separated)
          </label>
          <input
            type="text"
            placeholder="e.g. yono games download, yono rummy apk, instant withdrawal, free bonus"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            disabled={disabled || isGenerating}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all disabled:opacity-50 font-medium"
            style={{ borderStyle: 'solid' }}
          />
        </div>

        {/* Audience */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
            Target Audience Persona
          </label>
          <input
            type="text"
            placeholder="e.g. Indian online gamers, Teen Patti & Rummy players seeking real cash"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            disabled={disabled || isGenerating}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all disabled:opacity-50 font-medium"
            style={{ borderStyle: 'solid' }}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
        <p className="text-xs text-slate-600 text-center sm:text-left font-medium">
          Using <span className="text-indigo-700 font-bold">{selectedModelInfo.name}</span>. Generates title, slug, meta description, structured HTML &amp; tags.
        </p>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {hasGenerated ? (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={disabled || isGenerating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs transition-all text-xs cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>Regenerate Article</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={disabled || isGenerating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white transition-all text-xs sm:text-sm cursor-pointer shadow-md shadow-indigo-500/25 disabled:opacity-50 active:scale-[0.98] border-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Drafting Full Article...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generate Draft with AI</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
