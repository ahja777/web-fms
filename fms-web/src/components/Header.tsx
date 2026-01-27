'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;  // 화면닫기 버튼 클릭 시 호출되는 콜백
  showCloseButton?: boolean;  // 화면닫기 버튼 표시 여부 (기본: true)
}

export default function Header({ title, subtitle, onClose, showCloseButton = true }: HeaderProps) {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-[var(--border)] flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Title Section */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h1>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full"
            style={{ background: 'rgba(20, 212, 206, 0.1)' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14D4CE] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#14D4CE]"></span>
            </span>
            <span className="text-[10px] font-semibold text-[#0EA5A1] uppercase tracking-wide">Live</span>
          </div>
        </div>
        {subtitle && (
          <p className="text-sm text-[var(--muted)] mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className={`relative transition-all duration-300 ${searchFocused ? 'w-80' : 'w-64'}`}>
          <input
            type="text"
            placeholder="Search shipments, B/L, customers..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200"
            style={{
              background: searchFocused ? 'white' : 'var(--surface-100)',
              border: searchFocused ? '1px solid var(--amber-500)' : '1px solid transparent',
              boxShadow: searchFocused ? '0 0 0 3px rgba(232, 168, 56, 0.1), 0 4px 12px rgba(0,0,0,0.05)' : 'none',
              color: 'var(--foreground)',
            }}
          />
          <svg
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
              searchFocused ? 'text-[var(--amber-500)]' : 'text-[var(--surface-400)]'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {/* Keyboard shortcut hint */}
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity duration-200 ${
            searchFocused ? 'opacity-0' : 'opacity-100'
          }`}>
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium rounded"
              style={{
                background: 'var(--surface-200)',
                color: 'var(--surface-500)',
              }}
            >
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-[var(--border)]" />

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <button className="group relative p-2.5 rounded-xl transition-all duration-200 hover:bg-[var(--surface-100)]">
            <svg className="w-5 h-5 text-[var(--surface-500)] group-hover:text-[var(--foreground)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
            {/* Notification badge */}
            <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white rounded-full"
              style={{
                background: 'linear-gradient(135deg, #F06449 0%, #FF7B5F 100%)',
                boxShadow: '0 2px 4px rgba(240, 100, 73, 0.3)',
              }}
            >
              3
            </span>
          </button>

          {/* Quick Add */}
          <button className="group p-2.5 rounded-xl transition-all duration-200 hover:bg-[var(--surface-100)]">
            <svg className="w-5 h-5 text-[var(--surface-500)] group-hover:text-[var(--foreground)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>

          {/* Help */}
          <button className="group p-2.5 rounded-xl transition-all duration-200 hover:bg-[var(--surface-100)]">
            <svg className="w-5 h-5 text-[var(--surface-500)] group-hover:text-[var(--foreground)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-[var(--border)]" />

        {/* Date & Time */}
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-[var(--foreground)] font-mono tracking-tight">
            {new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
          </span>
          <span className="text-xs text-[var(--muted)]">
            {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Close Button */}
        {showCloseButton && (
          <>
            <div className="w-px h-8 bg-[var(--border)]" />
            <button
              onClick={handleClose}
              className="group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-red-50 border border-transparent hover:border-red-200"
              title="화면닫기"
            >
              <svg
                className="w-5 h-5 text-[var(--surface-500)] group-hover:text-red-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm font-medium text-[var(--surface-600)] group-hover:text-red-600 transition-colors">
                화면닫기
              </span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
