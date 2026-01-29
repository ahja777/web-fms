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

interface CLPData {
  id: number;
  clpNo: string;
  bookingNo: string;
  blNo: string;
  containerNo: string;
  containerType: string;
  sealNo: string;
  shipper: string;
  consignee: string;
  pol: string;
  pod: string;
  packages: number;
  grossWeight: number;
  volume: number;
  commodity: string;
  createdDate: string;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '작성중', color: 'bg-gray-500' },
  CONFIRMED: { label: '확정', color: 'bg-blue-500' },
  SUBMITTED: { label: '제출', color: 'bg-green-500' },
  REJECTED: { label: '반려', color: 'bg-red-500' },
};

const mockData: CLPData[] = [
  { id: 1, clpNo: 'CLP-2026-0001', bookingNo: 'BK-2026-0001', blNo: 'HDMU1234567', containerNo: 'HDMU1234567', containerType: '40HC', sealNo: 'SL001234', shipper: '삼성전자', consignee: 'Samsung America', pol: 'KRPUS', pod: 'USLAX', packages: 500, grossWeight: 12000, volume: 65.5, commodity: '전자제품', createdDate: '2026-01-20', status: 'SUBMITTED' },
  { id: 2, clpNo: 'CLP-2026-0002', bookingNo: 'BK-2026-0002', blNo: 'MAEU5678901', containerNo: 'MAEU5678901', containerType: '20GP', sealNo: 'SL002345', shipper: 'LG전자', consignee: 'LG Electronics USA', pol: 'KRINC', pod: 'DEHAM', packages: 200, grossWeight: 8000, volume: 45.2, commodity: '가전제품', createdDate: '2026-01-21', status: 'CONFIRMED' },
  { id: 3, clpNo: 'CLP-2026-0003', bookingNo: 'BK-2026-0003', blNo: '', containerNo: 'MSCU2345678', containerType: '40HC', sealNo: '', shipper: '현대자동차', consignee: 'Hyundai Motor Germany', pol: 'KRPUS', pod: 'NLRTM', packages: 800, grossWeight: 18000, volume: 72.0, commodity: '자동차부품', createdDate: '2026-01-22', status: 'DRAFT' },
];

export default function CLPPage() {
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const today = getToday();
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    clpNo: '',
    bookingNo: '',
    containerNo: '',
    status: '',
  });
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [data] = useState<CLPData[]>(mockData);
  const { sortConfig, handleSort, sortData } = useSorting<CLPData>();

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleSearch = () => setAppliedFilters(filters);
  const handleReset = () => {
    const resetFilters = { startDate: today, endDate: today, clpNo: '', bookingNo: '', containerNo: '', status: '' };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const filteredData = sortData(data.filter(item => {
    if (appliedFilters.clpNo && !item.clpNo.includes(appliedFilters.clpNo)) return false;
    if (appliedFilters.bookingNo && !item.bookingNo.includes(appliedFilters.bookingNo)) return false;
    if (appliedFilters.containerNo && !item.containerNo.includes(appliedFilters.containerNo)) return false;
    if (appliedFilters.status && item.status !== appliedFilters.status) return false;
    return true;
  }));

  const summaryStats = {
    total: filteredData.length,
    draft: filteredData.filter(d => d.status === 'DRAFT').length,
    confirmed: filteredData.filter(d => d.status === 'CONFIRMED').length,
    submitted: filteredData.filter(d => d.status === 'SUBMITTED').length,
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
        <Header title="CLP 관리" subtitle="Logis > 수출B/L관리 > CLP 관리" />
        <main ref={formRef} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Link href="/logis/export/clp/register" className="px-6 py-2 font-semibold rounded-lg" style={{ background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)', color: '#0C1222' }}>
              신규 등록
            </Link>
          </div>

          <div className="card p-6 mb-6">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">작성 일자</label>
                <div className="flex gap-2 items-center">
                  <input type="date" value={filters.startDate} onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <span className="text-[var(--muted)]">~</span>
                  <input type="date" value={filters.endDate} onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <DateRangeButtons onRangeSelect={handleDateRangeSelect} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">CLP 번호</label>
                <input type="text" value={filters.clpNo} onChange={e => setFilters(prev => ({ ...prev, clpNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="CLP-YYYY-XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">컨테이너 번호</label>
                <input type="text" value={filters.containerNo} onChange={e => setFilters(prev => ({ ...prev, containerNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="HDMU1234567" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">상태</label>
                <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                  <option value="">전체</option>
                  <option value="DRAFT">작성중</option>
                  <option value="CONFIRMED">확정</option>
                  <option value="SUBMITTED">제출</option>
                  <option value="REJECTED">반려</option>
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
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-gray-500">{summaryStats.draft}</div><div className="text-sm text-[var(--muted)]">작성중</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-blue-500">{summaryStats.confirmed}</div><div className="text-sm text-[var(--muted)]">확정</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-green-500">{summaryStats.submitted}</div><div className="text-sm text-[var(--muted)]">제출</div></div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--surface-100)]">
                <tr>
                  <SortableHeader<CLPData> columnKey="clpNo" label="CLP 번호" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<CLPData> columnKey="bookingNo" label={<>부킹<br/>번호</>} sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<CLPData> columnKey="blNo" label="B/L 번호" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<CLPData> columnKey="containerNo" label="컨테이너" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<CLPData> columnKey="pol" label="구간" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<CLPData> columnKey="shipper" label="화주" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<CLPData> columnKey="packages" label="PKG" sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader<CLPData> columnKey="grossWeight" label="G/W (KG)" sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader<CLPData> columnKey="volume" label="CBM" sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader<CLPData> columnKey="createdDate" label="작성일" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader<CLPData> columnKey="status" label="상태" sortConfig={sortConfig} onSort={handleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-[var(--surface-50)] cursor-pointer">
                    <td className="px-4 py-3"><Link href={`/logis/export/clp/${item.id}`} className="text-blue-400 hover:underline">{item.clpNo}</Link></td>
                    <td className="px-4 py-3 text-sm">{item.bookingNo}</td>
                    <td className="px-4 py-3 text-sm">{item.blNo || '-'}</td>
                    <td className="px-4 py-3 text-sm">{item.containerNo} ({item.containerType})</td>
                    <td className="px-4 py-3 text-sm">{item.pol} → {item.pod}</td>
                    <td className="px-4 py-3 text-sm">{item.shipper}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.packages}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.grossWeight.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.volume}</td>
                    <td className="px-4 py-3 text-sm">{item.createdDate}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full text-white ${statusConfig[item.status].color}`}>{statusConfig[item.status].label}</span></td>
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
