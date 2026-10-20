export default function FloatingTelegram() {
  return (
    <aside aria-label="Official Telegram Community">
      <a
        href="https://t.me/yonorummyzip"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#38bdf8] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group"
        aria-label="Join Official Telegram Channel"
        title="Join Telegram for Daily VIP Bonus Codes"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
        </span>
        <svg
          viewBox="0 0 24 24"
          width="26"
          height="26"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="translate-x-[-1px] translate-y-[-1px]"
        >
          <path d="M21 2l-2 20-6-4-3 4V14L2 10l19-8z" />
          <path d="M21 2L9 14" />
        </svg>
      </a>
    </aside>
  );
}
