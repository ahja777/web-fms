'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import WorldMapGlobe from '@/components/WorldMapGlobe';

interface DashboardData {
  stats: {
    totalShipments: number;
    inTransit: number;
    pendingBL: number;
  };
  recentShipments: Array<{
    shipment_no: string;
    customer_name: string;
    route: string;
    status: string;
    eta: string;
    transport_mode: string;
    pkg_qty: number;
    pkg_type: string;
    gross_weight: number;
    volume_cbm: number;
  }>;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: 'rgba(245, 158, 11, 0.1)', text: '#B45309', dot: '#F59E0B' },
  BOOKED: { bg: 'rgba(59, 130, 246, 0.1)', text: '#1D4ED8', dot: '#3B82F6' },
  SHIPPED: { bg: 'rgba(139, 92, 246, 0.1)', text: '#6D28D9', dot: '#8B5CF6' },
  DEPARTED: { bg: 'rgba(236, 72, 153, 0.1)', text: '#BE185D', dot: '#EC4899' },
  ARRIVED: { bg: 'rgba(20, 184, 166, 0.1)', text: '#0F766E', dot: '#14B8A6' },
  DELIVERED: { bg: 'rgba(34, 197, 94, 0.1)', text: '#15803D', dot: '#22C55E' },
};

function useAnimatedValue(endValue: number, duration: number = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (endValue === 0) return;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(endValue * easeOut));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [endValue, duration]);
  return value;
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = -90;
  const segments = data.map((d) => {
    const angle = (d.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + angle) * Math.PI) / 180;
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;
    return { ...d, path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z` };
  });
  return (
    <div className="relative">
      <svg viewBox="0 0 100 100" className="w-44 h-44">
        {segments.map((seg, i) => (<path key={i} d={seg.path} fill={seg.color} className="transition-all duration-500 hover:opacity-80 cursor-pointer" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />))}
        <circle cx="50" cy="50" r="25" fill="white" />
        <text x="50" y="47" textAnchor="middle" style={{ fontSize: '12px' }} className="font-bold fill-[var(--foreground)]">{total}</text>
        <text x="50" y="58" textAnchor="middle" style={{ fontSize: '6px' }} className="fill-[var(--muted)]">Total</text>
      </svg>
      <div className="mt-3 space-y-1.5">
        {data.map((d, i) => (<div key={i} className="flex items-center gap-2 text-xs"><span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} /><span className="text-[var(--muted)]">{d.label}</span><span className="ml-auto font-semibold text-[var(--foreground)]">{d.value}</span></div>))}
      </div>
    </div>
  );
}

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((v, i) => (<div key={i} className="flex-1 rounded-t transition-all duration-500 hover:opacity-80" style={{ height: `${(v / max) * 100}%`, background: `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`, minHeight: '4px' }} />))}
    </div>
  );
}

function KPIGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const animatedValue = useAnimatedValue(value, 2000);
  const circumference = 2 * Math.PI * 35;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="90" height="90" className="-rotate-90">
          <circle cx="45" cy="45" r="35" fill="none" stroke="var(--surface-100)" strokeWidth="8" />
          <circle cx="45" cy="45" r="35" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000" style={{ filter: `drop-shadow(0 0 6px ${color}50)` }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-bold text-[var(--foreground)]">{animatedValue}%</span></div>
      </div>
      <span className="mt-2 text-xs text-[var(--muted)] text-center">{label}</span>
    </div>
  );
}

function WorldMap() {
  const [animationProgress, setAnimationProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setAnimationProgress((prev) => (prev + 1) % 100), 50);
    return () => clearInterval(interval);
  }, []);
  const ports = [
    { name: 'LA', x: 85, y: 125, active: true },
    { name: 'Rotterdam', x: 285, y: 95, active: true },
    { name: 'Shanghai', x: 420, y: 135, active: true },
    { name: 'Busan', x: 445, y: 125, active: true },
    { name: 'Singapore', x: 395, y: 185, active: false },
    { name: 'Dubai', x: 330, y: 150, active: false },
  ];
  const routes = [
    { from: ports[0], to: ports[2], color: '#E8A838', progress: animationProgress },
    { from: ports[1], to: ports[3], color: '#14D4CE', progress: (animationProgress + 30) % 100 },
    { from: ports[2], to: ports[3], color: '#8B5CF6', progress: (animationProgress + 60) % 100 },
  ];
  return (
    <div className="relative w-full h-56 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0C1222 0%, #1A2744 100%)' }}>
      <svg className="absolute inset-0 w-full h-full opacity-20"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E8A838" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>
      <svg viewBox="0 0 500 250" className="absolute inset-0 w-full h-full">
        <path d="M60,90 Q120,60 180,80 Q220,70 260,85 Q300,75 320,90 L320,130 Q280,140 240,130 Q200,145 160,135 Q120,145 80,130 Q60,120 60,90" fill="none" stroke="#E8A83840" strokeWidth="1" />
        <path d="M340,80 Q400,60 450,90 L470,140 Q450,180 400,170 Q360,190 340,160 Q350,120 340,80" fill="none" stroke="#E8A83840" strokeWidth="1" />
        {routes.map((route, i) => {
          const midX = (route.from.x + route.to.x) / 2;
          const midY = Math.min(route.from.y, route.to.y) - 30;
          const pathD = `M${route.from.x},${route.from.y} Q${midX},${midY} ${route.to.x},${route.to.y}`;
          const shipX = route.from.x + (route.to.x - route.from.x) * (route.progress / 100);
          const shipY = route.from.y + (route.to.y - route.from.y) * (route.progress / 100) - 15 * Math.sin((route.progress / 100) * Math.PI);
          return (<g key={i}><path d={pathD} fill="none" stroke={route.color} strokeWidth="2" strokeDasharray="6 4" opacity="0.4" /><circle cx={shipX} cy={shipY} r="4" fill={route.color} style={{ filter: `drop-shadow(0 0 8px ${route.color})` }} /><circle cx={shipX} cy={shipY} r="8" fill={route.color} opacity="0.3" className="animate-ping" /></g>);
        })}
        {ports.map((port, i) => (<g key={i}><circle cx={port.x} cy={port.y} r={port.active ? 6 : 4} fill={port.active ? '#E8A838' : '#64748b'} style={{ filter: port.active ? 'drop-shadow(0 0 6px #E8A838)' : 'none' }} /><text x={port.x} y={port.y - 10} fill={port.active ? '#E8A838' : '#64748b'} fontSize="8" textAnchor="middle" fontWeight="600">{port.name}</text></g>))}
      </svg>
      <div className="absolute bottom-3 left-3 flex gap-3">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.4)' }}><span className="w-2 h-2 rounded-full bg-[#E8A838]" /><span className="text-[10px] text-white/80">Sea Freight</span></div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.4)' }}><span className="w-2 h-2 rounded-full bg-[#14D4CE]" /><span className="text-[10px] text-white/80">Air Freight</span></div>
      </div>
      <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.4)' }}><span className="text-xs text-white/60">Active Routes: </span><span className="text-sm font-bold text-[#E8A838]">12</span></div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (response.ok) { const result = await response.json(); setData(result); }
      } catch (error) { console.error('Failed to fetch dashboard data:', error); }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const animatedTotal = useAnimatedValue(data?.stats.totalShipments || 0);
  const animatedInTransit = useAnimatedValue(data?.stats.inTransit || 0);
  const animatedPending = useAnimatedValue(data?.stats.pendingBL || 0);

  const donutData = useMemo(() => [
    { label: 'In Transit', value: data?.stats.inTransit || 28, color: '#14D4CE' },
    { label: 'Pending', value: data?.stats.pendingBL || 15, color: '#E8A838' },
    { label: 'Completed', value: 42, color: '#22C55E' },
    { label: 'Delayed', value: 8, color: '#F06449' },
  ], [data]);

  const stats = [
    { title: 'Total Shipments', value: animatedTotal, suffix: '', change: '+12%', trend: 'up', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>), gradient: 'linear-gradient(135deg, #1A2744 0%, #243B67 100%)' },
    { title: 'In Transit', value: animatedInTransit, suffix: '', change: '+5%', trend: 'up', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>), gradient: 'linear-gradient(135deg, #0EA5A1 0%, #14D4CE 100%)' },
    { title: 'Pending B/L', value: animatedPending, suffix: '', change: '-8%', trend: 'down', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>), gradient: 'linear-gradient(135deg, #E8A838 0%, #F5B756 100%)' },
    { title: 'Revenue (MTD)', value: 2.4, suffix: 'M', prefix: '$', change: '+18%', trend: 'up', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)' },
    { title: 'Avg Lead Time', value: 4.2, suffix: 'd', change: '-12%', trend: 'down', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)' },
  ];

  const alerts = [
    { type: 'critical', title: 'Delayed shipment', desc: 'SHP20260002 - 2 days delay', icon: '⚠️' },
    { type: 'warning', title: 'Document pending', desc: '3 B/L awaiting approval', icon: '📄' },
    { type: 'info', title: 'Vessel arrival', desc: 'EVER GIVEN arriving Rotterdam', icon: '🚢' },
    { type: 'success', title: 'Customs cleared', desc: 'SHP20260008 cleared customs', icon: '✅' },
  ];

  const alertStyles: Record<string, { bg: string; border: string }> = {
    critical: { bg: 'rgba(240, 100, 73, 0.08)', border: 'rgba(240, 100, 73, 0.3)' },
    warning: { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.3)' },
    info: { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.3)' },
    success: { bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.3)' },
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pattern-dots">
      <Sidebar />
      <div className="ml-72">
        <Header title="Dashboard" subtitle="Maritime Command Center" showCloseButton={false} />
        <main className="p-6">
          <div className="grid grid-cols-5 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div key={stat.title} className="stat-card opacity-0 animate-slide-up" style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: stat.gradient }}>{stat.icon}</div>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${stat.trend === 'up' ? 'bg-[rgba(34,197,94,0.1)] text-[#15803D]' : 'bg-[rgba(239,68,68,0.1)] text-[#DC2626]'}`}>
                    <svg className={`w-2.5 h-2.5 ${stat.trend === 'down' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold text-[var(--foreground)] mb-0.5 number-display" style={{ fontFamily: 'var(--font-display)' }}>
                  {isLoading ? <span className="inline-block w-16 h-7 skeleton" /> : <>{(stat as any).prefix || ''}{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}{stat.suffix || ''}</>}
                </p>
                <p className="text-xs text-[var(--muted)]">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Global Shipment Tracking + Recent Shipments 나란히 배치 */}
          <div className="grid grid-cols-12 gap-5 mb-5">
            {/* Global Shipment Tracking - 70% (8칸) */}
            <div className="col-span-8 card opacity-0 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              <div className="card-header flex items-center justify-between pb-2">
                <div>
                  <h2 className="text-sm font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>Global Shipment Tracking</h2>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">Korea Centered - Real-time Shipment Monitoring</p>
                </div>
              </div>
              <div className="px-3 pb-3">
                <WorldMapGlobe viewMode="compact" compactHeight={527} />
              </div>
            </div>

            {/* Recent Shipments - 30% (4칸) */}
            <div className="col-span-4 card opacity-0 animate-slide-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
              <div className="card-header flex items-center justify-between pb-2">
                <div><h2 className="text-lg font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>Recent Shipments</h2></div>
                <a href="/logis" className="flex items-center gap-1 text-sm font-medium text-[var(--amber-500)] hover:underline">View All<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></a>
              </div>
              <div className="overflow-y-auto" style={{ height: '527px' }}>
                {isLoading ? (
                  <div className="card-body"><div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => (<div key={i} className="flex items-center gap-3"><div className="w-10 h-10 skeleton rounded-lg" /><div className="flex-1 space-y-1.5"><div className="w-28 h-4 skeleton" /><div className="w-40 h-3 skeleton" /></div></div>))}</div></div>
                ) : (
                  <div className="space-y-2.5 p-3">
                    {(!data?.recentShipments || data.recentShipments.length === 0) ? (
                      <div className="text-center py-8"><div className="flex flex-col items-center gap-2"><div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-100)' }}><svg className="w-7 h-7 text-[var(--surface-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div><p className="text-sm text-[var(--muted)]">No shipments found</p></div></div>
                    ) : (
                      data.recentShipments.slice(0, 6).map((shipment) => (
                        <div key={shipment.shipment_no} className="p-3 rounded-lg hover:bg-[var(--surface-50)] transition-all cursor-pointer group border border-transparent hover:border-[var(--border)]">
                          {/* 상단: Shipment No, 운송모드, 상태 */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${shipment.transport_mode === 'SEA' ? 'bg-[rgba(26,39,68,0.1)] text-[#1A2744]' : 'bg-[rgba(14,165,233,0.1)] text-[#0284C7]'}`}>
                                {shipment.transport_mode === 'SEA' ? (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>) : (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>)}
                              </div>
                              <Link
                                href={shipment.transport_mode === 'SEA' ? `/logis/import-bl/sea/${shipment.shipment_no}` : `/logis/import-bl/air/${shipment.shipment_no}`}
                                className="font-semibold text-[var(--foreground)] text-sm group-hover:text-[var(--amber-500)] transition-colors hover:underline"
                              >
                                {shipment.shipment_no}
                              </Link>
                            </div>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold" style={{ background: statusConfig[shipment.status]?.bg || 'var(--surface-100)', color: statusConfig[shipment.status]?.text || 'var(--muted)' }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusConfig[shipment.status]?.dot || 'var(--muted)' }} />{shipment.status}
                            </span>
                          </div>
                          {/* 화주 + Route + 갯수/중량/용적 나란히 */}
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-[var(--muted)]">
                              <span>화주:</span>
                              <span className="font-medium text-[var(--foreground)] truncate">{shipment.customer_name || '-'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[var(--muted)]">
                              <span>수량:</span>
                              <span className="font-medium text-[var(--foreground)]">{Number(shipment.pkg_qty || 0).toLocaleString()} {shipment.pkg_type || 'PKG'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[var(--muted)]">
                              <span>출발:</span>
                              <span className="font-medium text-[var(--foreground)]">{shipment.route.split('→')[0]?.trim() || '-'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[var(--muted)]">
                              <span>중량:</span>
                              <span className="font-medium text-[var(--foreground)]">{Number(shipment.gross_weight || 0).toLocaleString()} KG</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[var(--muted)]">
                              <span>도착:</span>
                              <span className="font-medium text-[var(--foreground)]">{shipment.route.split('→')[1]?.trim() || '-'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[var(--muted)]">
                              <span>용적:</span>
                              <span className="font-medium text-[var(--foreground)]">{Number(shipment.volume_cbm || 0).toFixed(1)} CBM</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 하단 위젯 영역 */}
          <>
              <div className="grid grid-cols-12 gap-5">
                {/* Performance KPIs */}
                <div className="col-span-4 card opacity-0 animate-slide-up" style={{ animationDelay: '0.55s', animationFillMode: 'forwards' }}>
                  <div className="card-header pb-2"><h2 className="text-base font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>Performance KPIs</h2></div>
                  <div className="card-body pt-2"><div className="flex justify-around"><KPIGauge value={94} label="On-Time Rate" color="#22C55E" /><KPIGauge value={87} label="Customer Sat." color="#3B82F6" /><KPIGauge value={78} label="Efficiency" color="#E8A838" /></div></div>
                </div>
                {/* Status Distribution */}
                <div className="col-span-4 card opacity-0 animate-slide-up" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                  <div className="card-header pb-2"><h2 className="text-base font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>Status Distribution</h2></div>
                  <div className="card-body flex justify-center pt-2"><DonutChart data={donutData} /></div>
                </div>
                {/* Alerts & Exceptions */}
                <div className="col-span-4 card opacity-0 animate-slide-up" style={{ animationDelay: '0.65s', animationFillMode: 'forwards' }}>
                  <div className="card-header flex items-center justify-between pb-2">
                    <h2 className="text-base font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>Alerts & Exceptions</h2>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #F06449 0%, #FF7B5F 100%)' }}>4 NEW</span>
                  </div>
                  <div className="card-body space-y-2">
                    {alerts.map((alert, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer" style={{ background: alertStyles[alert.type].bg, borderColor: alertStyles[alert.type].border }}>
                        <span className="text-sm">{alert.icon}</span>
                        <div className="flex-1 min-w-0"><p className="text-xs font-medium text-[var(--foreground)] truncate">{alert.title}</p><p className="text-[10px] text-[var(--muted)] truncate">{alert.desc}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 card opacity-0 animate-slide-up" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
                <div className="card-body py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Quick Actions</span>
                    <div className="w-px h-6 bg-[var(--border)]" />
                    <div className="flex gap-2 flex-1">
                      {[{ label: 'New Shipment', icon: '📦', href: '/logis' }, { label: 'Issue B/L', icon: '📄', href: '/logis' }, { label: 'Check Schedules', icon: '📅', href: '/logis' }, { label: 'Track & Trace', icon: '🔍', href: '/logis' }, { label: 'Generate Report', icon: '📊', href: '/logis' }].map((action) => (
                        <a key={action.label} href={action.href} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:bg-[var(--surface-100)] hover:text-[var(--amber-500)]" style={{ color: 'var(--foreground)' }}><span>{action.icon}</span>{action.label}</a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
          </>
        </main>
      </div>
    </div>
  );
}
