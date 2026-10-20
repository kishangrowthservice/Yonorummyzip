'use client';

import React from 'react';
import Link from 'next/link';
import { Download, ShieldCheck, Zap, Gift, Sparkles } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/blog-config';

interface YonoCtaBoxProps {
  className?: string;
}

export default function YonoCtaBox({ className = '' }: YonoCtaBoxProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/70 border border-indigo-200/80 p-6 sm:p-8 shadow-md ${className}`}
    >
      {/* Background soft glow effects */}
      <div className="absolute -top-16 -right-16 w-52 h-52 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5" />
            <span>₹1,500 Sign-Up Bonus Active</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Download Official <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">Yono Games APK</span>
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl leading-relaxed font-normal">
            Get instant access to 50+ official Yono sister apps (Yono Rummy, 777, Arcade, VIP). 100% virus-free verified downloads and automated 2-minute UPI cashouts.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-slate-700 font-medium">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" /> 2-Min UPI Cashout
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Verified Safe
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" /> Min ₹100 Withdrawal
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full sm:w-auto flex-shrink-0">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 text-center cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download All Apps</span>
          </Link>
          <a
            href={SITE_CONFIG.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:text-indigo-600 hover:border-indigo-300 transition-all text-center shadow-sm"
          >
            <span>Join VIP Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );
}
