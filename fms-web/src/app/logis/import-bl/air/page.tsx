'use client';

import { useRouter } from 'next/navigation';
import { LIST_PATHS } from '@/constants/paths';

import { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import AWBPrintModal, { AWBData as AWBPrintData } from '@/components/AWBPrintModal';
import DateRangeButtons, { getToday } from '@/components/DateRangeButtons';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';
import { useSorting, SortableHeader, SortStatusBadge } from '@/components/table';

interface AWBData {
  id: number;
  awbNo: string;
  awbType: string;
  flightNo: string;
  etd: string;
  eta: string;
  origin: string;
  destination: string;
  shipper: string;
  consignee: string;
  pieces: number;
  grossWeight: number;
  chargeWeight: number;
  commodity: string;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  BOOKED: { label: '부킹', color: 'bg-blue-500', bgColor: '#DBEAFE' },
  ACCEPTED: { label: '수탁', color: 'bg-cyan-500', bgColor: '#CFFAFE' },
  DEPARTED: { label: '출발', color: 'bg-purple-500', bgColor: '#F3E8FF' },
  IN_TRANSIT: { label: '운송중', color: 'bg-yellow-500', bgColor: '#FEF3C7' },
  ARRIVED: { label: '도착', color: 'bg-green-500', bgColor: '#D1FAE5' },
  DELIVERED: { label: '인도완료', color: 'bg-gray-500', bgColor: '#F3F4F6' },
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

const mockData: AWBData[] = [
  { id: 1, awbNo: '180-12345678', awbType: 'MAWB', flightNo: 'KE001', etd: '2026-01-25', eta: '2026-01-25', origin: 'ICN', destination: 'LAX', shipper: '삼성전자', consignee: 'Samsung America', pieces: 100, grossWeight: 5000, chargeWeight: 5500, commodity: '전자제품', status: 'DEPARTED' },
  { id: 2, awbNo: '180-12345679', awbType: 'HAWB', flightNo: 'KE001', etd: '2026-01-25', eta: '2026-01-25', origin: 'ICN', destination: 'JFK', shipper: 'LG전자', consignee: 'LG Electronics USA', pieces: 50, grossWeight: 2500, chargeWeight: 2800, commodity: '디스플레이', status: 'DEPARTED' },
  { id: 3, awbNo: '988-87654321', awbType: 'MAWB', flightNo: 'OZ202', etd: '2026-01-24', eta: '2026-01-24', origin: 'ICN', destination: 'SFO', shipper: '현대자동차', consignee: 'Hyundai America', pieces: 200, grossWeight: 8000, chargeWeight: 8000, commodity: '자동차부품', status: 'ARRIVED' },
  { id: 4, awbNo: '988-87654322', awbType: 'HAWB', flightNo: 'OZ202', etd: '2026-01-24', eta: '2026-01-24', origin: 'ICN', destination: 'NRT', shipper: 'SK하이닉스', consignee: 'SK Japan', pieces: 30, grossWeight: 1500, chargeWeight: 1800, commodity: '반도체', status: 'ARRIVED' },
  { id: 5, awbNo: '160-11223344', awbType: 'MAWB', flightNo: 'CX415', etd: '2026-01-26', eta: '2026-01-26', origin: 'ICN', destination: 'ORD', shipper: '포스코', consignee: 'POSCO America', pieces: 80, grossWeight: 12000, chargeWeight: 12000, commodity: '철강제품', status: 'BOOKED' },
];

export default function AWBListPage() {
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const today = getToday();
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    awbNo: '',
    flightNo: '',
    awbType: '',
    shipper: '',
    status: '',
  });
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [data] = useState<AWBData[]>(mockData);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedRow, setSelectedRow] = useState<AWBData | null>(null);

  // 정렬 훅
  const { sortConfig, handleSort, sortData, getSortStatusText, resetSort } = useSorting<AWBData>();

  // 컬럼 레이블
  const columnLabels: Record<string, string> = {
    awbNo: 'AWB No.',
    awbType: '타입',
    flightNo: '편명',
    etd: 'ETD',
    origin: '구간',
    shipper: '화주',
    commodity: '품명',
    pieces: 'PCS',
    grossWeight: 'G/W',
    chargeWeight: 'C/W',
    status: '상태',
  };

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleSearch = () => setAppliedFilters(filters);
  const handleReset = () => {
    const resetFilters = { startDate: today, endDate: today, awbNo: '', flightNo: '', awbType: '', shipper: '', status: '' };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSelectedIds(new Set());
    setSelectedRow(null);
  };

  // 선택 핸들러
  const handleRowSelect = (id: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === sortedList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedList.map(item => item.id)));
    }
  };

  const handleRowClick = (item: AWBData) => {
    setSelectedRow(item);
  };

  // AWB 출력 데이터 변환
  const getAWBPrintData = (): AWBPrintData | null => {
    if (!selectedRow) return null;
    return {
      hawbNo: selectedRow.awbType === 'HAWB' ? selectedRow.awbNo : '',
      mawbNo: selectedRow.awbType === 'MAWB' ? selectedRow.awbNo : '',
      awbDate: selectedRow.etd || '',
      shipper: selectedRow.shipper || '',
      consignee: selectedRow.consignee || '',
      carrier: selectedRow.flightNo?.substring(0, 2) || '',
      origin: selectedRow.origin || '',
      destination: selectedRow.destination || '',
      flightNo: selectedRow.flightNo || '',
      flightDate: selectedRow.etd || '',
      pieces: selectedRow.pieces || 0,
      weightUnit: 'K' as const,
      grossWeight: selectedRow.grossWeight || 0,
      chargeableWeight: selectedRow.chargeWeight,
      natureOfGoods: selectedRow.commodity || '',
      currency: 'USD',
      declaredValueCarriage: 'NVD',
      declaredValueCustoms: 'NCV',
      insuranceAmount: 'NIL',
      executedAt: 'SEOUL, KOREA',
      executedOn: selectedRow.etd || '',
      issuerName: 'INTERGIS LOGISTICS CO., LTD.',
    };
  };

  // 출력 핸들러
  const handlePrint = () => {
    if (selectedIds.size === 0) {
      alert('출력할 AWB를 선택해주세요.');
      return;
    }
    // 선택된 항목 중 첫 번째 항목을 selectedRow로 설정
    const firstSelectedId = Array.from(selectedIds)[0];
    const firstSelected = data.find(d => d.id === firstSelectedId);
    if (firstSelected) {
      setSelectedRow(firstSelected);
    }
    setShowPrintModal(true);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (appliedFilters.awbNo && !item.awbNo.includes(appliedFilters.awbNo)) return false;
      if (appliedFilters.flightNo && !item.flightNo.toLowerCase().includes(appliedFilters.flightNo.toLowerCase())) return false;
      if (appliedFilters.awbType && item.awbType !== appliedFilters.awbType) return false;
      if (appliedFilters.shipper && !item.shipper.includes(appliedFilters.shipper)) return false;
      if (appliedFilters.status && item.status !== appliedFilters.status) return false;
      return true;
    });
  }, [data, appliedFilters]);

  // 정렬된 목록
  const sortedList = useMemo(() => sortData(filteredData), [filteredData, sortData]);

  const summaryStats = useMemo(() => ({
    total: filteredData.length,
    mawb: filteredData.filter(d => d.awbType === 'MAWB').length,
    hawb: filteredData.filter(d => d.awbType === 'HAWB').length,
    totalWeight: filteredData.reduce((sum, d) => sum + d.grossWeight, 0),
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
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header title="AWB 관리 (항공)" subtitle="Logis > AWB 관리 > AWB 조회 (항공)" showCloseButton={false} />
        <main ref={formRef} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <Link href="/logis/import-bl/air/register" className="px-6 py-2 font-semibold rounded-lg" style={{ background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)', color: '#0C1222' }}>
                신규 등록
              </Link>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                출력
              </button>
              {selectedIds.size > 0 && (
                <button
                  onClick={() => { setSelectedIds(new Set()); setSelectedRow(null); }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  선택해제 ({selectedIds.size}건)
                </button>
              )}
            </div>
          </div>

          <div className="card p-6 mb-6">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">ETD 기간</label>
                <div className="flex gap-2 items-center">
                  <input type="date" value={filters.startDate} onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <span className="text-[var(--muted)]">~</span>
                  <input type="date" value={filters.endDate} onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <DateRangeButtons onRangeSelect={handleDateRangeSelect} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">AWB No.</label>
                <input type="text" value={filters.awbNo} onChange={e => setFilters(prev => ({ ...prev, awbNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="180-12345678" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">편명</label>
                <input type="text" value={filters.flightNo} onChange={e => setFilters(prev => ({ ...prev, flightNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="KE001" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">AWB 타입</label>
                <select value={filters.awbType} onChange={e => setFilters(prev => ({ ...prev, awbType: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                  <option value="">전체</option>
                  <option value="MAWB">MAWB</option>
                  <option value="HAWB">HAWB</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">화주</label>
                <input type="text" value={filters.shipper} onChange={e => setFilters(prev => ({ ...prev, shipper: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="화주명" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">상태</label>
                <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                  <option value="">전체</option>
                  <option value="BOOKED">부킹</option>
                  <option value="ACCEPTED">수탁</option>
                  <option value="DEPARTED">출발</option>
                  <option value="IN_TRANSIT">운송중</option>
                  <option value="ARRIVED">도착</option>
                  <option value="DELIVERED">인도완료</option>
                </select>
              </div>
              <div className="flex items-end gap-2 col-span-2">
                <button onClick={handleSearch} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">검색</button>
                <button onClick={handleReset} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">초기화</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="card p-4 text-center"><div className="text-2xl font-bold">{summaryStats.total}</div><div className="text-sm text-[var(--muted)]\">전체</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-blue-500">{summaryStats.mawb}</div><div className="text-sm text-[var(--muted)]">MAWB</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-green-500">{summaryStats.hawb}</div><div className="text-sm text-[var(--muted)]">HAWB</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-purple-500">{summaryStats.totalWeight.toLocaleString()}</div><div className="text-sm text-[var(--muted)]">총 중량 (KG)</div></div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
              <h3 className="font-bold">AWB 목록</h3>
              <span className="px-2 py-1 bg-[#E8A838]/20 text-[#E8A838] rounded text-sm font-medium">{filteredData.length}건</span>
              <SortStatusBadge statusText={getSortStatusText(columnLabels)} onReset={resetSort} />
            </div>
            <table className="w-full">
              <thead className="bg-[var(--surface-100)]">
                <tr>
                  <th className="px-4 py-3 text-center w-12">
                    <input
                      type="checkbox"
                      checked={sortedList.length > 0 && selectedIds.size === sortedList.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded"
                    />
                  </th>
                  <SortableHeader columnKey="awbNo" label="AWB No." sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="awbType" label="타입" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="flightNo" label="편명" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="etd" label="ETD" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="origin" label="구간" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="shipper" label="화주" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="commodity" label="품명" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="pieces" label="PCS" sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader columnKey="grossWeight" label="G/W" sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader columnKey="chargeWeight" label="C/W" sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader columnKey="status" label="상태" sortConfig={sortConfig} onSort={handleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {sortedList.map(item => (
                  <tr
                    key={item.id}
                    className={`hover:bg-[var(--surface-50)] cursor-pointer ${selectedIds.has(item.id) ? 'bg-blue-500/10' : ''} ${selectedRow?.id === item.id ? 'bg-[#E8A838]/10' : ''}`}
                    onClick={() => handleRowClick(item)}
                  >
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => handleRowSelect(item.id)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                    <td className="px-4 py-3"><Link href={`/logis/import-bl/air/${item.id}`} className="text-blue-400 hover:underline">{item.awbNo}</Link></td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${item.awbType === 'MAWB' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{item.awbType}</span></td>
                    <td className="px-4 py-3">{item.flightNo}</td>
                    <td className="px-4 py-3 text-sm">{item.etd}</td>
                    <td className="px-4 py-3 text-sm">{item.origin} → {item.destination}</td>
                    <td className="px-4 py-3 text-sm">{item.shipper}</td>
                    <td className="px-4 py-3 text-sm">{item.commodity}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.pieces}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.grossWeight.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.chargeWeight.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusConfig(item.status).color}`}>{getStatusConfig(item.status).label}</span></td>
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

      {/* AWB 출력 모달 */}
      <AWBPrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        awbData={getAWBPrintData()}
      />
    </div>
  );
}
