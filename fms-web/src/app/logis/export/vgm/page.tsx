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
import { useSorting, SortableHeader, SortConfig } from '@/components/table/SortableTable';

interface VGMData {
  id: number;
  vgmNo: string;
  bookingNo: string;
  blNo: string;
  containerNo: string;
  containerType: string;
  sealNo: string;
  shipper: string;
  tareWeight: number;
  cargoWeight: number;
  vgmWeight: number;
  weighingMethod: string;
  weighingDate: string;
  weighingStation: string;
  cutOffDate: string;
  submittedDate: string;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: '대기', color: 'bg-gray-500' },
  SUBMITTED: { label: '제출', color: 'bg-blue-500' },
  ACCEPTED: { label: '수신확인', color: 'bg-green-500' },
  REJECTED: { label: '반려', color: 'bg-red-500' },
  OVERDUE: { label: '기한초과', color: 'bg-yellow-500' },
};

const mockData: VGMData[] = [
  { id: 1, vgmNo: 'VGM-2026-0001', bookingNo: 'BK-2026-0001', blNo: 'HDMU1234567', containerNo: 'HDMU1234567', containerType: '40HC', sealNo: 'SL001234', shipper: '삼성전자', tareWeight: 3800, cargoWeight: 12000, vgmWeight: 15800, weighingMethod: 'Method 1', weighingDate: '2026-01-22', weighingStation: '부산신항 계근장', cutOffDate: '2026-01-23', submittedDate: '2026-01-22', status: 'ACCEPTED' },
  { id: 2, vgmNo: 'VGM-2026-0002', bookingNo: 'BK-2026-0002', blNo: 'MAEU5678901', containerNo: 'MAEU5678901', containerType: '20GP', sealNo: 'SL002345', shipper: 'LG전자', tareWeight: 2200, cargoWeight: 8000, vgmWeight: 10200, weighingMethod: 'Method 2', weighingDate: '2026-01-21', weighingStation: '인천항 계근장', cutOffDate: '2026-01-24', submittedDate: '2026-01-22', status: 'SUBMITTED' },
  { id: 3, vgmNo: 'VGM-2026-0003', bookingNo: 'BK-2026-0003', blNo: '', containerNo: 'MSCU2345678', containerType: '40HC', sealNo: '', shipper: '현대자동차', tareWeight: 3800, cargoWeight: 18000, vgmWeight: 21800, weighingMethod: 'Method 1', weighingDate: '', weighingStation: '', cutOffDate: '2026-01-25', submittedDate: '', status: 'PENDING' },
  { id: 4, vgmNo: 'VGM-2026-0004', bookingNo: 'BK-2026-0004', blNo: 'EGLV9012345', containerNo: 'EGLV9012345', containerType: '40GP', sealNo: 'SL003456', shipper: 'SK하이닉스', tareWeight: 3700, cargoWeight: 15000, vgmWeight: 18700, weighingMethod: 'Method 1', weighingDate: '2026-01-20', weighingStation: '부산신항 계근장', cutOffDate: '2026-01-19', submittedDate: '', status: 'OVERDUE' },
];

export default function VGMPage() {
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const today = getToday();
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    vgmNo: '',
    containerNo: '',
    shipper: '',
    status: '',
  });
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [data] = useState<VGMData[]>(mockData);
  const { sortConfig, handleSort, sortData } = useSorting<VGMData>();

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleSearch = () => setAppliedFilters(filters);
  const handleReset = () => {
    const resetFilters = { startDate: today, endDate: today, vgmNo: '', containerNo: '', shipper: '', status: '' };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const filteredData = sortData(data.filter(item => {
    if (appliedFilters.vgmNo && !item.vgmNo.includes(appliedFilters.vgmNo)) return false;
    if (appliedFilters.containerNo && !item.containerNo.includes(appliedFilters.containerNo)) return false;
    if (appliedFilters.shipper && !item.shipper.includes(appliedFilters.shipper)) return false;
    if (appliedFilters.status && item.status !== appliedFilters.status) return false;
    return true;
  }));

  const summaryStats = {
    total: filteredData.length,
    pending: filteredData.filter(d => d.status === 'PENDING').length,
    submitted: filteredData.filter(d => d.status === 'SUBMITTED').length,
    accepted: filteredData.filter(d => d.status === 'ACCEPTED').length,
    overdue: filteredData.filter(d => d.status === 'OVERDUE').length,
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
        <Header title="VGM 관리" subtitle="Logis > 수출B/L관리 > VGM 관리" />
        <main ref={formRef} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Link href="/logis/export/vgm/register" className="px-6 py-2 font-semibold rounded-lg" style={{ background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)', color: '#0C1222' }}>
              신규 등록
            </Link>
          </div>

          <div className="card p-6 mb-6">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Cut-Off 기간</label>
                <div className="flex gap-2 items-center">
                  <input type="date" value={filters.startDate} onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <span className="text-[var(--muted)]">~</span>
                  <input type="date" value={filters.endDate} onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <DateRangeButtons onRangeSelect={handleDateRangeSelect} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">VGM 번호</label>
                <input type="text" value={filters.vgmNo} onChange={e => setFilters(prev => ({ ...prev, vgmNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="VGM-YYYY-XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">컨테이너 번호</label>
                <input type="text" value={filters.containerNo} onChange={e => setFilters(prev => ({ ...prev, containerNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="HDMU1234567" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">상태</label>
                <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                  <option value="">전체</option>
                  <option value="PENDING">대기</option>
                  <option value="SUBMITTED">제출</option>
                  <option value="ACCEPTED">수신확인</option>
                  <option value="REJECTED">반려</option>
                  <option value="OVERDUE">기한초과</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSearch} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">검색</button>
              <button onClick={handleReset} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">초기화</button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="card p-4 text-center"><div className="text-2xl font-bold">{summaryStats.total}</div><div className="text-sm text-[var(--muted)]">전체</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-gray-500">{summaryStats.pending}</div><div className="text-sm text-[var(--muted)]">대기</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-blue-500">{summaryStats.submitted}</div><div className="text-sm text-[var(--muted)]">제출</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-green-500">{summaryStats.accepted}</div><div className="text-sm text-[var(--muted)]">수신확인</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-yellow-500">{summaryStats.overdue}</div><div className="text-sm text-[var(--muted)]">기한초과</div></div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--surface-100)]">
                <tr>
                  <SortableHeader<VGMData> columnKey="vgmNo" label="VGM 번호" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<VGMData> columnKey="bookingNo" label={<>부킹<br/>번호</>} sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<VGMData> columnKey="containerNo" label="컨테이너" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<VGMData> columnKey="shipper" label="화주" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<VGMData> columnKey="tareWeight" label="Tare (KG)" sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader<VGMData> columnKey="cargoWeight" label="Cargo (KG)" sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader<VGMData> columnKey="vgmWeight" label="VGM (KG)" sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader<VGMData> columnKey="weighingMethod" label="Method" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<VGMData> columnKey="cutOffDate" label="Cut-Off" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<VGMData> columnKey="submittedDate" label="제출일" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<VGMData> columnKey="status" label="상태" sortConfig={sortConfig} onSort={handleSort} />
                  <th className="px-4 py-3 text-center text-sm font-medium">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-[var(--surface-50)] cursor-pointer">
                    <td className="px-4 py-3"><Link href={`/logis/export/vgm/${item.id}`} className="text-blue-400 hover:underline">{item.vgmNo}</Link></td>
                    <td className="px-4 py-3 text-sm">{item.bookingNo}</td>
                    <td className="px-4 py-3 text-sm">{item.containerNo} ({item.containerType})</td>
                    <td className="px-4 py-3 text-sm">{item.shipper}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.tareWeight.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.cargoWeight.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{item.vgmWeight.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{item.weighingMethod}</td>
                    <td className="px-4 py-3 text-sm">{item.cutOffDate}</td>
                    <td className="px-4 py-3 text-sm">{item.submittedDate || '-'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full text-white ${statusConfig[item.status].color}`}>{statusConfig[item.status].label}</span></td>
                    <td className="px-4 py-3 text-center">
                      {item.status === 'PENDING' && <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">제출</button>}
                      {item.status === 'OVERDUE' && <button className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">긴급제출</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* 화면 닫기 확인 모달 */}
      <CloseConfirmModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleConfirmClose}
      />
    </div>
  );
}
