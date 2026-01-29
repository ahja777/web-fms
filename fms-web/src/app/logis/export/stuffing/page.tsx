'use client';

import { useRouter } from 'next/navigation';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import DateRangeButtons, { getToday } from '@/components/DateRangeButtons';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';
import { StuffingOrderModal, type StuffingOrderItem } from '@/components/popup';
import { useSorting, SortableHeader, SortConfig } from '@/components/table/SortableTable';

interface StuffingData {
  id: number;
  stuffingNo: string;
  bookingNo: string;
  blNo: string;
  containerNo: string;
  containerType: string;
  sealNo: string;
  stuffingDate: string;
  stuffingTime: string;
  warehouse: string;
  shipper: string;
  packages: number;
  grossWeight: number;
  volume: number;
  commodity: string;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: '예정', color: 'bg-blue-500' },
  IN_PROGRESS: { label: '진행중', color: 'bg-yellow-500' },
  COMPLETED: { label: '완료', color: 'bg-green-500' },
  CANCELLED: { label: '취소', color: 'bg-red-500' },
};

const mockData: StuffingData[] = [
  { id: 1, stuffingNo: 'STF-2026-0001', bookingNo: 'BK-2026-0001', blNo: 'HDMU1234567', containerNo: 'HDMU1234567', containerType: '40HC', sealNo: 'SL001234', stuffingDate: '2026-01-22', stuffingTime: '09:00', warehouse: '부산신항 CFS', shipper: '삼성전자', packages: 500, grossWeight: 12000, volume: 65.5, commodity: '전자제품', status: 'COMPLETED' },
  { id: 2, stuffingNo: 'STF-2026-0002', bookingNo: 'BK-2026-0002', blNo: 'MAEU5678901', containerNo: 'MAEU5678901', containerType: '20GP', sealNo: '', stuffingDate: '2026-01-23', stuffingTime: '14:00', warehouse: '인천항 CFS', shipper: 'LG전자', packages: 200, grossWeight: 8000, volume: 45.2, commodity: '가전제품', status: 'SCHEDULED' },
  { id: 3, stuffingNo: 'STF-2026-0003', bookingNo: 'BK-2026-0003', blNo: 'MSCU2345678', containerNo: 'MSCU2345678', containerType: '40HC', sealNo: 'SL002345', stuffingDate: '2026-01-21', stuffingTime: '10:00', warehouse: '부산신항 CFS', shipper: '현대자동차', packages: 800, grossWeight: 18000, volume: 72.0, commodity: '자동차부품', status: 'IN_PROGRESS' },
];

export default function StuffingPage() {
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const today = getToday();
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    stuffingNo: '',
    bookingNo: '',
    shipper: '',
    status: '',
  });
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [data] = useState<StuffingData[]>(mockData);
  const [showSOModal, setShowSOModal] = useState(false);
  const { sortConfig, handleSort, sortData } = useSorting<StuffingData>();

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleSOSelect = (item: StuffingOrderItem) => {
    setFilters(prev => ({ ...prev, bookingNo: item.blNo }));
    setShowSOModal(false);
  };

  const handleSearch = () => setAppliedFilters(filters);
  const handleReset = () => {
    const resetFilters = { startDate: today, endDate: today, stuffingNo: '', bookingNo: '', shipper: '', status: '' };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const filteredData = sortData(data.filter(item => {
    if (appliedFilters.stuffingNo && !item.stuffingNo.includes(appliedFilters.stuffingNo)) return false;
    if (appliedFilters.bookingNo && !item.bookingNo.includes(appliedFilters.bookingNo)) return false;
    if (appliedFilters.shipper && !item.shipper.includes(appliedFilters.shipper)) return false;
    if (appliedFilters.status && item.status !== appliedFilters.status) return false;
    return true;
  }));

  const summaryStats = {
    total: filteredData.length,
    scheduled: filteredData.filter(d => d.status === 'SCHEDULED').length,
    inProgress: filteredData.filter(d => d.status === 'IN_PROGRESS').length,
    completed: filteredData.filter(d => d.status === 'COMPLETED').length,
  };

  const handleCloseClick = () => {
    setShowCloseModal(true);
  };

  const handleConfirmClose = () => {
    setShowCloseModal(false);
    router.back();
  };

  // 브라우저 뒤로가기 버튼 처리
  useCloseConfirm({
    showModal: showCloseModal,
    setShowModal: setShowCloseModal,
    onConfirmClose: handleConfirmClose,
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header title="STUFFING ORDER 관리" subtitle="Logis > 수출B/L관리 > STUFFING ORDER 관리" />
        <main ref={formRef} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button onClick={() => setShowSOModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">S/O 조회</button>
              <Link href="/logis/export/stuffing/register" className="px-6 py-2 font-semibold rounded-lg" style={{ background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)', color: '#0C1222' }}>
                신규 등록
              </Link>
            </div>
          </div>

          <div className="card p-6 mb-6">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">작업 일자</label>
                <div className="flex gap-2 items-center flex-nowrap">
                  <input type="date" value={filters.startDate} onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <span className="text-[var(--muted)]">~</span>
                  <input type="date" value={filters.endDate} onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <DateRangeButtons onRangeSelect={handleDateRangeSelect} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">작업번호</label>
                <input type="text" value={filters.stuffingNo} onChange={e => setFilters(prev => ({ ...prev, stuffingNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="STF-YYYY-XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">부킹번호</label>
                <input type="text" value={filters.bookingNo} onChange={e => setFilters(prev => ({ ...prev, bookingNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="BK-YYYY-XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">상태</label>
                <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                  <option value="">전체</option>
                  <option value="SCHEDULED">예정</option>
                  <option value="IN_PROGRESS">진행중</option>
                  <option value="COMPLETED">완료</option>
                  <option value="CANCELLED">취소</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSearch} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">검색</button>
              <button onClick={handleReset} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">초기화</button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="card p-4 text-center"><div className="text-2xl font-bold">{summaryStats.total}</div><div className="text-sm text-[var(--muted)]">전체</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-blue-500">{summaryStats.scheduled}</div><div className="text-sm text-[var(--muted)]">예정</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-yellow-500">{summaryStats.inProgress}</div><div className="text-sm text-[var(--muted)]">진행중</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-green-500">{summaryStats.completed}</div><div className="text-sm text-[var(--muted)]">완료</div></div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--surface-100)]">
                <tr>
                  <SortableHeader<StuffingData> columnKey="stuffingNo" label={<>작업<br/>번호</>} sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<StuffingData> columnKey="bookingNo" label={<>부킹<br/>번호</>} sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<StuffingData> columnKey="containerNo" label="컨테이너" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<StuffingData> columnKey="stuffingDate" label={<>작업<br/>일시</>} sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<StuffingData> columnKey="warehouse" label="창고" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<StuffingData> columnKey="shipper" label="화주" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<StuffingData> columnKey="packages" label="PKG" sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader<StuffingData> columnKey="grossWeight" label="G/W (KG)" sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader<StuffingData> columnKey="volume" label="CBM" sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader<StuffingData> columnKey="sealNo" label="Seal No." sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<StuffingData> columnKey="status" label="상태" sortConfig={sortConfig} onSort={handleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-[var(--surface-50)] cursor-pointer">
                    <td className="px-4 py-3"><Link href={`/logis/export/stuffing/${item.id}`} className="text-blue-400 hover:underline">{item.stuffingNo}</Link></td>
                    <td className="px-4 py-3 text-sm">{item.bookingNo}</td>
                    <td className="px-4 py-3 text-sm">{item.containerNo} ({item.containerType})</td>
                    <td className="px-4 py-3 text-sm">{item.stuffingDate} {item.stuffingTime}</td>
                    <td className="px-4 py-3 text-sm">{item.warehouse}</td>
                    <td className="px-4 py-3 text-sm">{item.shipper}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.packages}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.grossWeight.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.volume}</td>
                    <td className="px-4 py-3 text-sm">{item.sealNo || '-'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full text-white ${statusConfig[item.status].color}`}>{statusConfig[item.status].label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <StuffingOrderModal
        isOpen={showSOModal}
        onClose={() => setShowSOModal(false)}
        onSelect={handleSOSelect}
      />

      {/* 화면 닫기 확인 모달 */}
      <CloseConfirmModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleConfirmClose}
      />
    </div>
  );
}
