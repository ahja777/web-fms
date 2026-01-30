'use client';

import { useRouter } from 'next/navigation';
import { LIST_PATHS } from '@/constants/paths';

import { useState, useRef } from 'react';
import PageLayout from '@/components/PageLayout';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import DateRangeButtons, { getToday } from '@/components/DateRangeButtons';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';
import ExcelButtons from '@/components/ExcelButtons';

interface AirScheduleData {
  id: number;
  airline: string;
  flightNo: string;
  aircraftType: string;
  origin: string;
  destination: string;
  etd: string;
  eta: string;
  transitTime: string;
  frequency: string;
  space: string;
  rate: number;
  cutOff: string;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  OPEN: { label: '부킹가능', color: 'bg-green-500', bgColor: '#D1FAE5' },
  LIMITED: { label: '잔여공간', color: 'bg-yellow-500', bgColor: '#FEF3C7' },
  FULL: { label: '만석', color: 'bg-red-500', bgColor: '#FEE2E2' },
  CLOSED: { label: '마감', color: 'bg-gray-500', bgColor: '#F3F4F6' },
  DRAFT: { label: '초안', color: 'bg-gray-500', bgColor: '#F3F4F6' },
  PENDING: { label: '대기', color: 'bg-yellow-500', bgColor: '#FEF3C7' },
  SUBMITTED: { label: '제출', color: 'bg-blue-500', bgColor: '#DBEAFE' },
  APPROVED: { label: '승인', color: 'bg-green-500', bgColor: '#D1FAE5' },
  REJECTED: { label: '반려', color: 'bg-red-500', bgColor: '#FEE2E2' },
  CONFIRMED: { label: '확정', color: 'bg-green-500', bgColor: '#D1FAE5' },
  EXPIRED: { label: '만료', color: 'bg-gray-500', bgColor: '#F3F4F6' },
  CANCELLED: { label: '취소', color: 'bg-red-500', bgColor: '#FEE2E2' },
};

const getStatusConfig = (status: string) => statusConfig[status] || { label: status || '미정', color: 'bg-gray-500', bgColor: '#F3F4F6' };

// 정렬 설정 인터페이스
interface SortConfig {
  key: keyof AirScheduleData | null;
  direction: 'asc' | 'desc';
}

// 정렬 아이콘 컴포넌트
const SortIcon = ({ columnKey, sortConfig }: { columnKey: keyof AirScheduleData; sortConfig: SortConfig }) => {
  const isActive = sortConfig.key === columnKey;
  return (
    <span className="inline-flex flex-col ml-1.5 gap-px">
      <span
        style={{
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderBottom: `5px solid ${isActive && sortConfig.direction === 'asc' ? '#ffffff' : 'rgba(255,255,255,0.35)'}`,
        }}
      />
      <span
        style={{
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: `5px solid ${isActive && sortConfig.direction === 'desc' ? '#ffffff' : 'rgba(255,255,255,0.35)'}`,
        }}
      />
    </span>
  );
};

const mockData: AirScheduleData[] = [
  { id: 1, airline: 'KE', flightNo: 'KE001', aircraftType: 'B747-8F', origin: 'ICN', destination: 'LAX', etd: '2026-01-22 10:00', eta: '2026-01-22 08:30', transitTime: '10h 30m', frequency: '매일', space: '50 Ton', rate: 5.50, cutOff: '2026-01-21 18:00', status: 'OPEN' },
  { id: 2, airline: 'OZ', flightNo: 'OZ201', aircraftType: 'B777F', origin: 'ICN', destination: 'JFK', etd: '2026-01-23 13:00', eta: '2026-01-23 14:30', transitTime: '14h 30m', frequency: '화/목/토', space: '20 Ton', rate: 6.20, cutOff: '2026-01-22 18:00', status: 'LIMITED' },
  { id: 3, airline: 'KE', flightNo: 'KE011', aircraftType: 'B747-8F', origin: 'ICN', destination: 'FRA', etd: '2026-01-24 09:00', eta: '2026-01-24 14:00', transitTime: '12h 00m', frequency: '매일', space: '0 Ton', rate: 4.80, cutOff: '2026-01-23 18:00', status: 'FULL' },
  { id: 4, airline: 'CX', flightNo: 'CX416', aircraftType: 'B747-400F', origin: 'ICN', destination: 'HKG', etd: '2026-01-22 16:00', eta: '2026-01-22 19:00', transitTime: '3h 00m', frequency: '매일', space: '80 Ton', rate: 2.50, cutOff: '2026-01-21 18:00', status: 'OPEN' },
  { id: 5, airline: 'SQ', flightNo: 'SQ601', aircraftType: 'B777F', origin: 'ICN', destination: 'SIN', etd: '2026-01-25 11:00', eta: '2026-01-25 16:30', transitTime: '6h 30m', frequency: '월/수/금', space: '35 Ton', rate: 3.80, cutOff: '2026-01-24 18:00', status: 'OPEN' },
  { id: 6, airline: 'NH', flightNo: 'NH8520', aircraftType: 'B767-300F', origin: 'ICN', destination: 'NRT', etd: '2026-01-22 08:00', eta: '2026-01-22 10:30', transitTime: '2h 30m', frequency: '매일', space: '15 Ton', rate: 2.00, cutOff: '2026-01-21 18:00', status: 'LIMITED' },
  { id: 7, airline: 'KE', flightNo: 'KE089', aircraftType: 'B747-8F', origin: 'ICN', destination: 'CDG', etd: '2026-01-26 11:00', eta: '2026-01-26 17:00', transitTime: '13h 00m', frequency: '매일', space: '45 Ton', rate: 5.00, cutOff: '2026-01-25 18:00', status: 'OPEN' },
  { id: 8, airline: 'EK', flightNo: 'EK323', aircraftType: 'B777F', origin: 'ICN', destination: 'DXB', etd: '2026-01-27 01:00', eta: '2026-01-27 06:00', transitTime: '9h 00m', frequency: '매일', space: '60 Ton', rate: 4.50, cutOff: '2026-01-26 18:00', status: 'OPEN' },
  { id: 9, airline: 'OZ', flightNo: 'OZ723', aircraftType: 'A330-300F', origin: 'ICN', destination: 'PVG', etd: '2026-01-28 14:00', eta: '2026-01-28 15:30', transitTime: '2h 30m', frequency: '매일', space: '25 Ton', rate: 2.20, cutOff: '2026-01-27 18:00', status: 'LIMITED' },
  { id: 10, airline: 'TK', flightNo: 'TK091', aircraftType: 'B777F', origin: 'ICN', destination: 'IST', etd: '2026-01-29 02:00', eta: '2026-01-29 08:00', transitTime: '11h 00m', frequency: '화/금', space: '40 Ton', rate: 4.80, cutOff: '2026-01-28 18:00', status: 'OPEN' },
];

// Excel 내보내기용 컬럼 정의
const excelColumns: { key: keyof AirScheduleData; label: string }[] = [
  { key: 'airline', label: '항공사' },
  { key: 'flightNo', label: '편명' },
  { key: 'aircraftType', label: '기종' },
  { key: 'origin', label: 'Origin' },
  { key: 'destination', label: 'Dest' },
  { key: 'etd', label: 'ETD' },
  { key: 'eta', label: 'ETA' },
  { key: 'transitTime', label: 'T/T' },
  { key: 'frequency', label: '운항' },
  { key: 'space', label: '잔여공간' },
  { key: 'rate', label: '운임($/kg)' },
  { key: 'status', label: '상태' },
];

export default function AirSchedulePage() {
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const today = getToday();
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    airline: '',
    origin: '',
    destination: '',
    status: '',
  });
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [data] = useState<AirScheduleData[]>(mockData);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleSearch = () => setAppliedFilters(filters);
  const handleReset = () => {
    const resetFilters = { startDate: today, endDate: today, airline: '', origin: '', destination: '', status: '' };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const filteredData = data.filter(item => {
    if (appliedFilters.airline && item.airline !== appliedFilters.airline) return false;
    if (appliedFilters.origin && !item.origin.toLowerCase().includes(appliedFilters.origin.toLowerCase())) return false;
    if (appliedFilters.destination && !item.destination.toLowerCase().includes(appliedFilters.destination.toLowerCase())) return false;
    if (appliedFilters.status && item.status !== appliedFilters.status) return false;
    return true;
  });

  // 정렬된 리스트
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue, 'ko');
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  // 정렬 핸들러
  const handleSort = (key: keyof AirScheduleData) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // 정렬 가능한 헤더 컴포넌트
  const SortableHeader = ({ columnKey, label, className = '' }: { columnKey: keyof AirScheduleData; label: string; className?: string }) => (
    <th className={`cursor-pointer select-none ${className}`} onClick={() => handleSort(columnKey)}>
      <span className="inline-flex items-center">{label}<SortIcon columnKey={columnKey} sortConfig={sortConfig} /></span>
    </th>
  );

  const summaryStats = {
    total: filteredData.length,
    open: filteredData.filter(d => d.status === 'OPEN').length,
    limited: filteredData.filter(d => d.status === 'LIMITED').length,
    full: filteredData.filter(d => d.status === 'FULL').length,
  };

  const handleCloseClick = () => {
    setShowCloseModal(true);
  };

  const handleConfirmClose = () => {
    setShowCloseModal(false);
    router.push(LIST_PATHS.DASHBOARD);
  };

  // 브라우저 뒤로가기 버튼 처리
  useCloseConfirm({
    showModal: showCloseModal,
    setShowModal: setShowCloseModal,
    onConfirmClose: handleConfirmClose,
  });

  return (
        <PageLayout title="항공 스케줄 조회" subtitle="Logis > 스케줄관리 > 항공 스케줄 조회" showCloseButton={false} >
        <main ref={formRef} className="p-6">
          <div className="flex justify-end items-center mb-6">
            <div className="flex gap-2">
              <ExcelButtons
                data={filteredData}
                columns={excelColumns}
                filename="항공스케줄"
              />
            </div>
          </div>

          {/* 검색조건 - 화면설계서 기준 */}
          <div className="card mb-6">
            <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="font-bold">검색조건</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">ETD 기간</label>
                  <div className="flex gap-2 items-center flex-nowrap">
                    <input type="date" value={filters.startDate} onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="w-[130px] h-[38px] px-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg flex-shrink-0 text-sm" />
                    <span className="text-[var(--muted)] flex-shrink-0">~</span>
                    <input type="date" value={filters.endDate} onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="w-[130px] h-[38px] px-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg flex-shrink-0 text-sm" />
                    <DateRangeButtons onRangeSelect={handleDateRangeSelect} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">항공사</label>
                  <select value={filters.airline} onChange={e => setFilters(prev => ({ ...prev, airline: e.target.value }))} className="w-full h-[38px] px-3 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm">
                    <option value="">전체</option>
                    <option value="KE">대한항공 (KE)</option>
                    <option value="OZ">아시아나 (OZ)</option>
                    <option value="CX">캐세이퍼시픽 (CX)</option>
                    <option value="SQ">싱가포르항공 (SQ)</option>
                    <option value="NH">전일본공수 (NH)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">출발지 (Origin)</label>
                  <input type="text" value={filters.origin} onChange={e => setFilters(prev => ({ ...prev, origin: e.target.value }))} className="w-full h-[38px] px-3 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" placeholder="ICN" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">도착지 (Dest)</label>
                  <input type="text" value={filters.destination} onChange={e => setFilters(prev => ({ ...prev, destination: e.target.value }))} className="w-full h-[38px] px-3 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" placeholder="LAX" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">상태</label>
                  <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))} className="w-full h-[38px] px-3 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm">
                    <option value="">전체</option>
                    <option value="OPEN">부킹가능</option>
                    <option value="LIMITED">잔여공간</option>
                    <option value="FULL">만석</option>
                    <option value="CLOSED">마감</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border)] flex justify-center gap-2">
              <button onClick={handleSearch} className="px-6 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] font-medium">조회</button>
              <button onClick={handleReset} className="px-6 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-200)]">초기화</button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="card p-4 text-center"><div className="text-2xl font-bold">{summaryStats.total}</div><div className="text-sm text-[var(--muted)]">전체</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-green-500">{summaryStats.open}</div><div className="text-sm text-[var(--muted)]">부킹가능</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-yellow-500">{summaryStats.limited}</div><div className="text-sm text-[var(--muted)]">잔여공간</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-red-500">{summaryStats.full}</div><div className="text-sm text-[var(--muted)]">만석</div></div>
          </div>

          <div className="card overflow-hidden">
            <table className="table">
              <thead>
                <tr>
                  <SortableHeader columnKey="airline" label="항공사" className="text-center font-medium" />
                  <SortableHeader columnKey="flightNo" label="편명" className="text-center font-medium" />
                  <SortableHeader columnKey="aircraftType" label="기종" className="text-center font-medium" />
                  <SortableHeader columnKey="origin" label="Origin" className="text-center font-medium" />
                  <SortableHeader columnKey="destination" label="Dest" className="text-center font-medium" />
                  <SortableHeader columnKey="etd" label="ETD" className="text-center font-medium" />
                  <SortableHeader columnKey="eta" label="ETA" className="text-center font-medium" />
                  <SortableHeader columnKey="transitTime" label="T/T" className="text-center font-medium" />
                  <SortableHeader columnKey="frequency" label="운항" className="text-center font-medium" />
                  <SortableHeader columnKey="space" label="잔여공간" className="text-center font-medium" />
                  <SortableHeader columnKey="rate" label="운임($/kg)" className="text-center font-medium" />
                  <SortableHeader columnKey="status" label="상태" className="text-center font-medium" />
                  <th className="text-center">부킹</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {sortedData.map(item => (
                  <tr key={item.id} className="hover:bg-[var(--surface-50)]">
                    <td className="px-4 py-3 text-center text-sm font-medium">{item.airline}</td>
                    <td className="px-4 py-3 text-center text-sm">{item.flightNo}</td>
                    <td className="px-4 py-3 text-center text-sm">{item.aircraftType}</td>
                    <td className="px-4 py-3 text-center text-sm">{item.origin}</td>
                    <td className="px-4 py-3 text-center text-sm">{item.destination}</td>
                    <td className="px-4 py-3 text-center text-sm">{item.etd}</td>
                    <td className="px-4 py-3 text-center text-sm">{item.eta}</td>
                    <td className="px-4 py-3 text-center text-sm">{item.transitTime}</td>
                    <td className="px-4 py-3 text-center text-sm">{item.frequency}</td>
                    <td className="px-4 py-3 text-center text-sm">{item.space}</td>
                    <td className="px-4 py-3 text-center text-sm">${item.rate.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusConfig(item.status).color}`}>{getStatusConfig(item.status).label}</span></td>
                    <td className="px-4 py-3 text-center">
                      {item.status !== 'FULL' && item.status !== 'CLOSED' && (
                        <button className="px-3 py-1 text-xs bg-[#6e5fc9] text-white rounded hover:bg-[#584bb0]">부킹요청</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      {/* 화면 닫기 확인 모달 */}
      <CloseConfirmModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleConfirmClose}
      />
    </PageLayout>
  );
}
