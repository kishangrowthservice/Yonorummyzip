import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 space-y-4 font-sans">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs animate-pulse">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Loading All Yono Games 99...
      </p>
    </div>
  );
}
