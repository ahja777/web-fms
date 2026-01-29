'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

// 메뉴 아이템 타입 정의
interface SubMenuItem {
  title: string;
  href: string;
}

interface CategoryItem {
  title: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  children: SubMenuItem[];
}

interface MenuItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  color?: string;  // 메뉴별 아이콘 색상
  subItems?: SubMenuItem[];
  categories?: CategoryItem[];
}

// 카테고리별 아이콘 및 색상 - 물류 업무 특화 색상
const categoryConfig = {
  seaExport: {
    title: '해상수출',
    color: '#1E40AF',  // 진한 네이비 블루 - 깊은 바다/대양
    bgColor: 'rgba(30, 64, 175, 0.1)',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 17h1l1-2h14l1 2h1M5 15l1-3h12l1 3M7 12V9l5-3 5 3v3M12 6V3m-4 9h8" />
      </svg>
    ),
  },
  seaImport: {
    title: '해상수입',
    color: '#0891B2',  // 청록색 - 해안/도착
    bgColor: 'rgba(8, 145, 178, 0.1)',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 17h1l1-2h14l1 2h1M5 15l1-3h12l1 3M7 12V9l5-3 5 3v3M12 21v-3m0 0l-2-2m2 2l2-2" />
      </svg>
    ),
  },
  airExport: {
    title: '항공수출',
    color: '#6366F1',  // 인디고 - 하늘 높이
    bgColor: 'rgba(99, 102, 241, 0.1)',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5M12 3v3m0 0l2-2m-2 2l-2-2" />
      </svg>
    ),
  },
  airImport: {
    title: '항공수입',
    color: '#EA580C',  // 오렌지 - 일출/도착
    bgColor: 'rgba(234, 88, 12, 0.1)',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5M12 21v-3m0 0l2 2m-2-2l-2 2" />
      </svg>
    ),
  },
  common: {
    title: '공통',
    color: '#64748B',  // 슬레이트 - 중립적
    bgColor: 'rgba(100, 116, 139, 0.1)',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  oms: {
    title: 'OMS',
    color: '#DC2626',  // 레드 - 주문관리 중요성
    bgColor: 'rgba(220, 38, 38, 0.1)',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
};

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    color: '#14B8A6',  // Teal - 대시보드/모니터링
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    title: 'Logis',
    href: '/logis',
    color: '#3B82F6',  // Blue - 물류 핵심 업무
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    categories: [
      {
        ...categoryConfig.oms,
        children: [
          { title: '고객오더 (C/O)', href: '/logis/oms/customer-order' },
          { title: '서비스오더 (S/O)', href: '/logis/oms/service-order' },
          { title: '오더타입 관리', href: '/logis/oms/order-type' },
          { title: 'S/O Control', href: '/logis/oms/so-control' },
        ],
      },
      {
        ...categoryConfig.seaExport,
        children: [
          { title: '견적관리', href: '/logis/quote/sea' },
          { title: '부킹관리', href: '/logis/booking/sea' },
          { title: 'S/R 선적요청', href: '/logis/sr/sea' },
          { title: 'S/N 선적통지', href: '/logis/sn/sea' },
          { title: 'House B/L 관리', href: '/logis/bl/sea/house' },
          { title: 'Master B/L 관리', href: '/logis/bl/sea/master' },
          { title: 'STUFFING', href: '/logis/export/stuffing' },
          { title: 'CLP', href: '/logis/export/clp' },
          { title: 'VGM', href: '/logis/export/vgm' },
          { title: '적하목록', href: '/logis/manifest/sea' },
          { title: 'AMS', href: '/logis/ams/sea' },
        ],
      },
      {
        ...categoryConfig.seaImport,
        children: [
          { title: 'House B/L 관리', href: '/logis/import-bl/sea/house' },
          { title: 'Master B/L 관리', href: '/logis/import-bl/sea/master' },
          { title: '도착관리 (A/N)', href: '/logis/import-bl/sea/arrival' },
          { title: '통관관리', href: '/logis/customs/sea' },
          { title: '화물반출입', href: '/logis/cargo/release' },
        ],
      },
      {
        ...categoryConfig.airExport,
        children: [
          { title: '견적관리', href: '/logis/quote/air' },
          { title: '부킹관리', href: '/logis/booking/air' },
          { title: 'House AWB 관리', href: '/logis/bl/air/house' },
          { title: 'Master AWB 관리', href: '/logis/bl/air/master' },
          { title: 'Pre-Alert', href: '/logis/pre-alert/air' },
        ],
      },
      {
        ...categoryConfig.airImport,
        children: [
          { title: 'House AWB 관리', href: '/logis/import-bl/air/house' },
          { title: 'Master AWB 관리', href: '/logis/import-bl/air/master' },
          { title: '도착관리 (A/N)', href: '/logis/import-bl/air/arrival' },
        ],
      },
      {
        ...categoryConfig.common,
        children: [
          { title: '견적요청', href: '/logis/quote/request' },
          { title: '스케줄 (해상)', href: '/logis/schedule/sea' },
          { title: '스케줄 (항공)', href: '/logis/schedule/air' },
          { title: '운임기초정보', href: '/logis/rate/base' },
          { title: '기업운임관리', href: '/logis/rate/corporate' },
          { title: '컨테이너공유', href: '/logis/container/share' },
          { title: '수출입서류', href: '/logis/document' },
          { title: '화물추적', href: '/logis/tracking' },
          { title: '환율조회', href: '/logis/exchange-rate' },
        ],
      },
    ],
  },
  {
    title: 'Shipments',
    href: '/shipments',
    color: '#8B5CF6',  // Violet - 운송/배송 추적
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    title: 'B/L Management',
    href: '/bl',
    color: '#F59E0B',  // Amber - 서류 관리
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    title: 'Schedules',
    href: '/schedules',
    color: '#10B981',  // Emerald - 스케줄/일정
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    title: 'Billing',
    href: '/billing',
    color: '#EF4444',  // Red - 정산/비용 관리
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
];

const masterMenuItems = [
  { title: 'Customers', href: '/master/customers' },
  { title: 'Carriers', href: '/master/carriers' },
  { title: 'Ports', href: '/master/ports' },
  { title: 'Partners', href: '/master/partners' },
];

// localStorage 키
const STORAGE_KEY = 'fms_sidebar_expanded';

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Logis']);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // localStorage에서 상태 복원
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.menus) setExpandedMenus(parsed.menus);
        if (parsed.categories) setExpandedCategories(parsed.categories);
      } catch {
        // 파싱 실패시 기본값 유지
      }
    }

    // 현재 경로에 맞는 카테고리 자동 펼침
    const currentCategory = menuItems
      .find(item => item.categories)
      ?.categories?.find(cat =>
        cat.children.some(child => pathname.startsWith(child.href))
      );
    if (currentCategory && !expandedCategories.includes(currentCategory.title)) {
      setExpandedCategories(prev => [...prev, currentCategory.title]);
    }
  }, []);

  // 상태 변경시 localStorage 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      menus: expandedMenus,
      categories: expandedCategories,
    }));
  }, [expandedMenus, expandedCategories]);

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const toggleCategory = (title: string) => {
    setExpandedCategories(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 flex flex-col z-40 dark-scroll"
      style={{
        background: 'linear-gradient(180deg, #0C1222 0%, #030712 100%)',
      }}
    >
      {/* Decorative gradient line */}
      <div className="absolute top-0 right-0 w-px h-full"
        style={{
          background: 'linear-gradient(180deg, rgba(232,168,56,0.3) 0%, rgba(232,168,56,0) 50%, rgba(232,168,56,0.1) 100%)',
        }}
      />

      {/* Logo Section - Clickable to Main Page */}
      <Link
        href="/"
        className="h-20 flex items-center px-6 relative hover:opacity-80 transition-opacity cursor-pointer"
      >
        <div className="flex items-center gap-4">
          {/* Logo Image */}
          <div className="relative">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-white"
              style={{
                boxShadow: '0 4px 12px rgba(232, 168, 56, 0.3)',
              }}
            >
              <img
                src="/images/kcs-logo.jpg"
                alt="KCS Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            {/* Active indicator dot */}
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0C1222]"
              style={{ background: '#14D4CE' }}
            />
          </div>
          {/* Logo Text */}
          <div>
            <h1 className="text-xl font-bold tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              케이씨에스
            </h1>
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase"
              style={{ color: 'rgba(232, 168, 56, 0.8)' }}
            >
              Logistics Platform
            </p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {/* Main Menu */}
        <div className="mb-8">
          <div className="flex items-center gap-2 px-3 mb-4">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Navigation
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const hasCategories = item.categories && item.categories.length > 0;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedMenus.includes(item.title);

              return (
                <li key={item.href} className="animate-slide-in-left" style={{ animationDelay: `${index * 0.05}s` }}>
                  {hasCategories ? (
                    <>
                      <button
                        onClick={() => toggleMenu(item.title)}
                        className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full ${
                          isActive ? '' : 'hover:bg-white/[0.04]'
                        }`}
                        style={isActive ? { background: item.color ? `${item.color}15` : 'rgba(232, 168, 56, 0.1)' } : {}}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                            style={{ background: item.color || 'linear-gradient(180deg, #F5B756 0%, #E8A838 100%)' }}
                          />
                        )}
                        <span
                          className="transition-colors duration-200"
                          style={{ color: item.color || (isActive ? '#F5B756' : 'rgba(255,255,255,0.4)') }}
                        >
                          {item.icon}
                        </span>
                        <span className={`font-medium transition-colors duration-200 flex-1 text-left ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}
                          style={{ fontFamily: 'var(--font-display)' }}>
                          {item.title}
                        </span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          style={{ color: item.color || (isActive ? '#F5B756' : 'rgba(255,255,255,0.4)') }}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isExpanded && (
                        <ul className="ml-2 mt-1 space-y-0.5">
                          {item.categories?.map((category) => {
                            const isCategoryExpanded = expandedCategories.includes(category.title);
                            const hasCategoryActive = category.children.some(
                              child => pathname === child.href || pathname.startsWith(child.href + '/')
                            );

                            return (
                              <li key={category.title}>
                                <button
                                  onClick={() => toggleCategory(category.title)}
                                  className={`group flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-all duration-200 ${
                                    hasCategoryActive ? '' : 'hover:bg-white/[0.03]'
                                  }`}
                                  style={hasCategoryActive ? { background: category.bgColor } : {}}
                                >
                                  <span
                                    className="flex items-center justify-center w-5 h-5 rounded"
                                    style={{ color: category.color }}
                                  >
                                    {category.icon}
                                  </span>
                                  <span
                                    className={`text-sm font-medium flex-1 text-left transition-colors duration-200 ${
                                      hasCategoryActive ? '' : 'text-white/50 group-hover:text-white/70'
                                    }`}
                                    style={hasCategoryActive ? { color: category.color } : {}}
                                  >
                                    {category.title}
                                  </span>
                                  <span className="text-[10px] text-white/30 mr-1">{category.children.length}</span>
                                  <svg
                                    className={`w-3 h-3 transition-transform duration-200 ${isCategoryExpanded ? 'rotate-180' : ''} text-white/30`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                {isCategoryExpanded && (
                                  <ul className="ml-5 mt-0.5 space-y-0 border-l pl-3" style={{ borderColor: `${category.color}30` }}>
                                    {category.children.map((child) => {
                                      const isChildActive = pathname === child.href || pathname.startsWith(child.href + '/');
                                      return (
                                        <li key={child.href}>
                                          <Link
                                            href={child.href}
                                            className={`group flex items-center gap-2 px-2 py-1.5 rounded transition-all duration-200 ${
                                              isChildActive ? '' : 'hover:bg-white/[0.02]'
                                            }`}
                                            style={isChildActive ? { background: `${category.color}15` } : {}}
                                          >
                                            <span
                                              className={`w-1 h-1 rounded-full transition-all duration-200 ${
                                                isChildActive ? 'scale-150' : 'group-hover:scale-125'
                                              }`}
                                              style={{ background: isChildActive ? category.color : 'rgba(255,255,255,0.2)' }}
                                            />
                                            <span
                                              className={`text-xs transition-colors duration-200 ${
                                                isChildActive ? 'font-medium' : 'text-white/40 group-hover:text-white/60'
                                              }`}
                                              style={isChildActive ? { color: category.color } : {}}
                                            >
                                              {child.title}
                                            </span>
                                          </Link>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : hasSubItems ? (
                    <>
                      <button
                        onClick={() => toggleMenu(item.title)}
                        className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full ${
                          isActive ? '' : 'hover:bg-white/[0.04]'
                        }`}
                        style={isActive ? { background: item.color ? `${item.color}15` : 'rgba(232, 168, 56, 0.1)' } : {}}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                            style={{ background: item.color || 'linear-gradient(180deg, #F5B756 0%, #E8A838 100%)' }}
                          />
                        )}
                        <span
                          className="transition-colors duration-200"
                          style={{ color: item.color || (isActive ? '#F5B756' : 'rgba(255,255,255,0.4)') }}
                        >
                          {item.icon}
                        </span>
                        <span className={`font-medium transition-colors duration-200 flex-1 text-left ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}
                          style={{ fontFamily: 'var(--font-display)' }}>
                          {item.title}
                        </span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          style={{ color: item.color || (isActive ? '#F5B756' : 'rgba(255,255,255,0.4)') }}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isExpanded && (
                        <ul className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-4">
                          {item.subItems?.map((subItem) => {
                            const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/');
                            return (
                              <li key={subItem.href}>
                                <Link
                                  href={subItem.href}
                                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${isSubActive ? 'bg-[#E8A838]/10' : 'hover:bg-white/[0.03]'}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${isSubActive ? 'bg-[#F5B756] scale-125' : 'bg-white/20 group-hover:bg-white/40'}`} />
                                  <span className={`text-sm transition-colors duration-200 ${isSubActive ? 'text-white/90 font-medium' : 'text-white/50 group-hover:text-white/70'}`}>
                                    {subItem.title}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive ? '' : 'hover:bg-white/[0.04]'
                      }`}
                      style={isActive ? {
                        background: item.color ? `${item.color}15` : 'rgba(232, 168, 56, 0.1)',
                      } : {}}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                          style={{ background: item.color || 'linear-gradient(180deg, #F5B756 0%, #E8A838 100%)' }}
                        />
                      )}
                      <span
                        className="transition-colors duration-200"
                        style={{ color: item.color || (isActive ? '#F5B756' : 'rgba(255,255,255,0.4)') }}
                      >
                        {item.icon}
                      </span>
                      <span className={`font-medium transition-colors duration-200 ${
                        isActive
                          ? 'text-white'
                          : 'text-white/60 group-hover:text-white/90'
                      }`}
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {item.title}
                      </span>
                      {!isActive && (
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{
                            background: item.color
                              ? `radial-gradient(circle at 20% 50%, ${item.color}15 0%, transparent 50%)`
                              : 'radial-gradient(circle at 20% 50%, rgba(232,168,56,0.08) 0%, transparent 50%)',
                          }}
                        />
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Master Data */}
        <div>
          <div className="flex items-center gap-2 px-3 mb-4">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Master Data
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <ul className="space-y-0.5">
            {masterMenuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href} className="animate-slide-in-left" style={{ animationDelay: `${(index + 6) * 0.05}s` }}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive ? '' : 'hover:bg-white/[0.03]'
                    }`}
                    style={isActive ? { background: 'rgba(232, 168, 56, 0.08)' } : {}}
                  >
                    {/* Dot indicator */}
                    <span className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-[#F5B756] scale-125'
                        : 'bg-white/20 group-hover:bg-white/40'
                    }`} />

                    {/* Title */}
                    <span className={`text-sm transition-colors duration-200 ${
                      isActive
                        ? 'text-white/90 font-medium'
                        : 'text-white/50 group-hover:text-white/70'
                    }`}>
                      {item.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 mx-4 mb-4 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #1A2744 0%, #243B67 100%)',
              }}
            >
              <span className="text-sm font-bold text-white/80">AD</span>
            </div>
            {/* Online status */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
              style={{
                borderColor: '#0C1222',
                background: '#14D4CE',
              }}
            />
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white/90 truncate"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Admin User
            </p>
            <p className="text-xs text-white/40 truncate">
              admin@intergis.co.kr
            </p>
          </div>

          {/* Settings button */}
          <button className="p-2 rounded-lg transition-colors duration-200 hover:bg-white/[0.05]">
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Version badge */}
      <div className="px-6 pb-4 flex items-center justify-center">
        <span className="text-[10px] font-medium px-2 py-1 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.03)',
            color: 'rgba(255,255,255,0.25)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          v1.0.0
        </span>
      </div>
    </aside>
  );
}
