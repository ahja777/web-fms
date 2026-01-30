'use client';

import { useRouter } from 'next/navigation';
import { LIST_PATHS } from '@/constants/paths';

import { useState, useRef, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import DateRangeButtons, { getToday } from '@/components/DateRangeButtons';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';
import ExcelButtons from '@/components/ExcelButtons';
import { useSorting, SortableHeader, SortStatusBadge } from '@/components/table';

interface ScheduleData {
  id: number;
  carrier: string;
  vessel: string;
  voyage: string;
  pol: string;
  polTerminal: string;
  pod: string;
  podTerminal: string;
  etd: string;
  eta: string;
  transitTime: number;
  space: string;
  cutOff: string;
  docCutOff: string;
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

const mockData: ScheduleData[] = [
  { id: 1, carrier: 'HMM', vessel: 'HMM GDANSK', voyage: '001E', pol: 'KRPUS', polTerminal: 'HPNT', pod: 'USLAX', podTerminal: 'APL', etd: '2026-01-22', eta: '2026-02-08', transitTime: 17, space: '500 TEU', cutOff: '2026-01-20 17:00', docCutOff: '2026-01-21 12:00', status: 'OPEN' },
  { id: 2, carrier: 'MAERSK', vessel: 'MAERSK EINDHOVEN', voyage: '002W', pol: 'KRPUS', polTerminal: 'PNIT', pod: 'USNYC', podTerminal: 'APM', etd: '2026-01-25', eta: '2026-02-20', transitTime: 26, space: '120 TEU', cutOff: '2026-01-23 17:00', docCutOff: '2026-01-24 12:00', status: 'LIMITED' },
  { id: 3, carrier: 'MSC', vessel: 'MSC OSCAR', voyage: '003E', pol: 'KRPUS', polTerminal: 'HPNT', pod: 'DEHAM', podTerminal: 'CTB', etd: '2026-01-28', eta: '2026-02-25', transitTime: 28, space: '0 TEU', cutOff: '2026-01-26 17:00', docCutOff: '2026-01-27 12:00', status: 'FULL' },
  { id: 4, carrier: 'EVERGREEN', vessel: 'EVER GIVEN', voyage: '004W', pol: 'KRPUS', polTerminal: 'PNIT', pod: 'CNSHA', podTerminal: 'YST', etd: '2026-01-20', eta: '2026-01-25', transitTime: 5, space: '800 TEU', cutOff: '2026-01-18 17:00', docCutOff: '2026-01-19 12:00', status: 'OPEN' },
  { id: 5, carrier: 'ONE', vessel: 'ONE STORK', voyage: '005E', pol: 'KRPUS', polTerminal: 'HPNT', pod: 'JPYOK', podTerminal: 'HON', etd: '2026-01-30', eta: '2026-02-02', transitTime: 3, space: '300 TEU', cutOff: '2026-01-28 17:00', docCutOff: '2026-01-29 12:00', status: 'OPEN' },
  { id: 6, carrier: 'HMM', vessel: 'HMM OSLO', voyage: '006W', pol: 'KRPUS', polTerminal: 'HPNT', pod: 'NLRTM', podTerminal: 'ECT', etd: '2026-02-01', eta: '2026-02-28', transitTime: 27, space: '50 TEU', cutOff: '2026-01-30 17:00', docCutOff: '2026-01-31 12:00', status: 'LIMITED' },
  { id: 7, carrier: 'CMA', vessel: 'CMA CGM MARCO POLO', voyage: '007E', pol: 'KRPUS', polTerminal: 'PNIT', pod: 'SGSIN', podTerminal: 'PSA', etd: '2026-02-03', eta: '2026-02-10', transitTime: 7, space: '650 TEU', cutOff: '2026-02-01 17:00', docCutOff: '2026-02-02 12:00', status: 'OPEN' },
  { id: 8, carrier: 'COSCO', vessel: 'COSCO SHIPPING ARIES', voyage: '008W', pol: 'KRINC', polTerminal: 'ICT', pod: 'CNTAO', podTerminal: 'QQCT', etd: '2026-02-05', eta: '2026-02-07', transitTime: 2, space: '400 TEU', cutOff: '2026-02-03 17:00', docCutOff: '2026-02-04 12:00', status: 'OPEN' },
  { id: 9, carrier: 'YANGMING', vessel: 'YM WITNESS', voyage: '009E', pol: 'KRPUS', polTerminal: 'HPNT', pod: 'VNSGN', podTerminal: 'TCIT', etd: '2026-02-08', eta: '2026-02-14', transitTime: 6, space: '200 TEU', cutOff: '2026-02-06 17:00', docCutOff: '2026-02-07 12:00', status: 'LIMITED' },
  { id: 10, carrier: 'PIL', vessel: 'KOTA PEKARANG', voyage: '010W', pol: 'KRPUS', polTerminal: 'PNIT', pod: 'IDJKT', podTerminal: 'TPK', etd: '2026-02-10', eta: '2026-02-18', transitTime: 8, space: '350 TEU', cutOff: '2026-02-08 17:00', docCutOff: '2026-02-09 12:00', status: 'OPEN' },
];

// Excel 내보내기용 컬럼 정의
const excelColumns: { key: keyof ScheduleData; label: string }[] = [
  { key: 'carrier', label: '선사' },
  { key: 'vessel', label: '선명' },
  { key: 'voyage', label: '항차' },
  { key: 'pol', label: 'POL' },
  { key: 'polTerminal', label: 'POL터미널' },
  { key: 'pod', label: 'POD' },
  { key: 'podTerminal', label: 'POD터미널' },
  { key: 'etd', label: 'ETD' },
  { key: 'eta', label: 'ETA' },
  { key: 'transitTime', label: 'T/T(일)' },
  { key: 'space', label: '잔여공간' },
  { key: 'cutOff', label: 'C/T Off' },
  { key: 'status', label: '상태' },
];

export default function SeaSchedulePage() {
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const today = getToday();
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    carrier: '',
    pol: '',
    pod: '',
    status: '',
  });
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [data] = useState<ScheduleData[]>(mockData);

  // 정렬 훅
  const { sortConfig, handleSort, sortData, getSortStatusText, resetSort } = useSorting<ScheduleData>();

  // 컬럼 레이블
  const columnLabels: Record<string, string> = {
    carrier: '선사',
    vessel: '선명',
    pol: 'POL',
    pod: 'POD',
    etd: 'ETD',
    eta: 'ETA',
    transitTime: 'T/T',
    space: '잔여공간',
    cutOff: 'C/T Off',
    status: '상태',
  };

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleSearch = () => setAppliedFilters(filters);
  const handleReset = () => {
    const resetFilters = { startDate: today, endDate: today, carrier: '', pol: '', pod: '', status: '' };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const filteredData = useMemo(() => data.filter(item => {
    if (appliedFilters.carrier && item.carrier !== appliedFilters.carrier) return false;
    if (appliedFilters.pol && !item.pol.toLowerCase().includes(appliedFilters.pol.toLowerCase())) return false;
    if (appliedFilters.pod && !item.pod.toLowerCase().includes(appliedFilters.pod.toLowerCase())) return false;
    if (appliedFilters.status && item.status !== appliedFilters.status) return false;
    return true;
  }), [data, appliedFilters]);

  // 정렬된 목록
  const sortedList = useMemo(() => sortData(filteredData), [filteredData, sortData]);

  const summaryStats = useMemo(() => ({
    total: filteredData.length,
    open: filteredData.filter(d => d.status === 'OPEN').length,
    limited: filteredData.filter(d => d.status === 'LIMITED').length,
    full: filteredData.filter(d => d.status === 'FULL').length,
  }), [filteredData]);

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
        <PageLayout title="해상 스케줄 조회" subtitle="Logis > 스케줄관리 > 해상 스케줄 조회" showCloseButton={false} >
        <main ref={formRef} className="p-6">
          <div className="flex justify-end items-center mb-6">
            <div className="flex gap-2">
              <ExcelButtons
                data={filteredData}
                columns={excelColumns}
                filename="해상스케줄"
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
                  <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">선사</label>
                  <select value={filters.carrier} onChange={e => setFilters(prev => ({ ...prev, carrier: e.target.value }))} className="w-full h-[38px] px-3 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm">
                    <option value="">전체</option>
                    <option value="MAERSK">MAERSK</option>
                    <option value="MSC">MSC</option>
                    <option value="HMM">HMM</option>
                    <option value="EVERGREEN">EVERGREEN</option>
                    <option value="ONE">ONE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">선적항 (POL)</label>
                  <input type="text" value={filters.pol} onChange={e => setFilters(prev => ({ ...prev, pol: e.target.value }))} className="w-full h-[38px] px-3 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" placeholder="KRPUS" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">양하항 (POD)</label>
                  <input type="text" value={filters.pod} onChange={e => setFilters(prev => ({ ...prev, pod: e.target.value }))} className="w-full h-[38px] px-3 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" placeholder="USLAX" />
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
            <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
              <h3 className="font-bold">스케줄 목록</h3>
              <span className="px-2 py-1 bg-[#E8A838]/20 text-[#E8A838] rounded text-sm font-medium">{filteredData.length}건</span>
              <SortStatusBadge statusText={getSortStatusText(columnLabels)} onReset={resetSort} />
            </div>
            <table className="table">
              <thead>
                <tr>
                  <SortableHeader columnKey="carrier" label="선사" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="vessel" label="선명/항차" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="pol" label="POL" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="pod" label="POD" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="etd" label="ETD" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="eta" label="ETA" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="transitTime" label="T/T" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="space" label="잔여공간" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="cutOff" label="C/T Off" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="status" label="상태" sortConfig={sortConfig} onSort={handleSort} />
                  <th>부킹</th>
                </tr>
              </thead>
              <tbody>
                {sortedList.map(item => (
                  <tr key={item.id}>
                    <td className="text-center font-medium">{item.carrier}</td>
                    <td className="text-center">{item.vessel}<br /><span className="text-[var(--muted)] text-xs">{item.voyage}</span></td>
                    <td className="text-center">{item.pol}<br /><span className="text-[var(--muted)] text-xs">{item.polTerminal}</span></td>
                    <td className="text-center">{item.pod}<br /><span className="text-[var(--muted)] text-xs">{item.podTerminal}</span></td>
                    <td className="text-center">{item.etd}</td>
                    <td className="text-center">{item.eta}</td>
                    <td className="text-center">{item.transitTime}일</td>
                    <td className="text-center">{item.space}</td>
                    <td className="text-center text-xs">{item.cutOff}<br /><span className="text-[var(--muted)]">Doc: {item.docCutOff}</span></td>
                    <td className="text-center"><span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusConfig(item.status).color}`}>{getStatusConfig(item.status).label}</span></td>
                    <td className="text-center">
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
