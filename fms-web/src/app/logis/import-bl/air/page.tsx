'use client';

import { useRouter } from 'next/navigation';
import { LIST_PATHS } from '@/constants/paths';
import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import AWBPrintModal, { AWBData as AWBPrintData } from '@/components/AWBPrintModal';
import DateRangeButtons, { getToday } from '@/components/DateRangeButtons';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';
import { useSorting, SortableHeader, SortStatusBadge } from '@/components/table';
import SelectionAlertModal from '@/components/SelectionAlertModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

interface AWBData {
  mawb_id: number;
  mawb_no: string;
  airline_code: string;
  flight_no: string;
  etd_dt: string;
  eta_dt: string;
  ata_dt: string;
  origin_airport_cd: string;
  dest_airport_cd: string;
  shipper_nm: string;
  consignee_nm: string;
  pieces: number;
  gross_weight_kg: number;
  charge_weight_kg: number;
  commodity_desc: string;
  status_cd: string;
  hawb_count: number;
  remarks: string;
}

// 항공수입용 상태 (부킹 관련 제거)
const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  DRAFT: { label: '초안', color: 'bg-gray-500', bgColor: '#F3F4F6' },
  ACCEPTED: { label: '수탁', color: 'bg-cyan-500', bgColor: '#CFFAFE' },
  DEPARTED: { label: '출발', color: 'bg-purple-500', bgColor: '#F3E8FF' },
  IN_TRANSIT: { label: '운송중', color: 'bg-yellow-500', bgColor: '#FEF3C7' },
  ARRIVED: { label: '도착', color: 'bg-green-500', bgColor: '#D1FAE5' },
  CUSTOMS: { label: '통관중', color: 'bg-orange-500', bgColor: '#FFEDD5' },
  RELEASED: { label: '반출', color: 'bg-blue-500', bgColor: '#DBEAFE' },
  DELIVERED: { label: '인도완료', color: 'bg-emerald-600', bgColor: '#D1FAE5' },
  CANCELLED: { label: '취소', color: 'bg-red-500', bgColor: '#FEE2E2' },
};

const getStatusConfig = (status: string) => statusConfig[status] || { label: status || '미정', color: 'bg-gray-500', bgColor: '#F3F4F6' };

export default function ImportAWBListPage() {
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const today = getToday();
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    awbNo: '',
    flightNo: '',
    consignee: '',
    status: '',
  });
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showSelectionAlert, setShowSelectionAlert] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [data, setData] = useState<AWBData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedRow, setSelectedRow] = useState<AWBData | null>(null);

  // 정렬 훅
  const { sortConfig, handleSort, sortData, getSortStatusText, resetSort } = useSorting<AWBData>();

  // 컬럼 레이블
  const columnLabels: Record<string, string> = {
    mawb_no: 'MAWB No.',
    airline_code: '항공사',
    flight_no: '편명',
    eta_dt: 'ETA',
    origin_airport_cd: '구간',
    consignee_nm: '수하인',
    commodity_desc: '품명',
    pieces: 'PCS',
    gross_weight_kg: 'G/W',
    hawb_count: 'HAWB',
    status_cd: '상태',
  };

  // 데이터 조회
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      // 항공수입 타입 지정
      params.append('import_type', 'IMPORT');
      if (appliedFilters.awbNo) params.append('awb_no', appliedFilters.awbNo);
      if (appliedFilters.status) params.append('status', appliedFilters.status);

      const response = await fetch(`/api/awb/mawb?${params}`);
      const result = await response.json();
      if (Array.isArray(result)) {
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching AWB data:', error);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleSearch = () => setAppliedFilters(filters);
  const handleReset = () => {
    const resetFilters = { startDate: today, endDate: today, awbNo: '', flightNo: '', consignee: '', status: '' };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSelectedIds(new Set());
    setSelectedRow(null);
    resetSort();
  };

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (appliedFilters.flightNo && !item.flight_no?.toLowerCase().includes(appliedFilters.flightNo.toLowerCase())) return false;
      if (appliedFilters.consignee && !item.consignee_nm?.includes(appliedFilters.consignee)) return false;
      return true;
    });
  }, [data, appliedFilters]);

  // 정렬된 목록
  const sortedList = useMemo(() => sortData(filteredData), [filteredData, sortData]);

  // 요약 통계 (부킹 제거)
  const summaryStats = useMemo(() => ({
    total: filteredData.length,
    arrived: filteredData.filter(d => d.status_cd === 'ARRIVED').length,
    inTransit: filteredData.filter(d => d.status_cd === 'IN_TRANSIT').length,
    totalWeight: filteredData.reduce((sum, d) => sum + (d.gross_weight_kg || 0), 0),
  }), [filteredData]);

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
      setSelectedIds(new Set(sortedList.map(item => item.mawb_id)));
    }
  };

  const handleRowClick = (item: AWBData) => {
    setSelectedRow(item);
  };

  // AWB 출력 데이터 변환
  const getAWBPrintData = (): AWBPrintData | null => {
    if (!selectedRow) return null;
    return {
      hawbNo: '',
      mawbNo: selectedRow.mawb_no || '',
      awbDate: selectedRow.eta_dt || '',
      shipper: selectedRow.shipper_nm || '',
      consignee: selectedRow.consignee_nm || '',
      carrier: selectedRow.airline_code || '',
      origin: selectedRow.origin_airport_cd || '',
      destination: selectedRow.dest_airport_cd || '',
      flightNo: selectedRow.flight_no || '',
      flightDate: selectedRow.eta_dt || '',
      pieces: selectedRow.pieces || 0,
      weightUnit: 'K' as const,
      grossWeight: selectedRow.gross_weight_kg || 0,
      chargeableWeight: selectedRow.charge_weight_kg,
      natureOfGoods: selectedRow.commodity_desc || '',
      currency: 'USD',
      declaredValueCarriage: 'NVD',
      declaredValueCustoms: 'NCV',
      insuranceAmount: 'NIL',
      executedAt: 'SEOUL, KOREA',
      executedOn: selectedRow.eta_dt || '',
      issuerName: 'INTERGIS LOGISTICS CO., LTD.',
    };
  };

  // 출력 핸들러
  const handlePrint = () => {
    if (selectedIds.size === 0) {
      setShowSelectionAlert(true);
      return;
    }
    const firstSelectedId = Array.from(selectedIds)[0];
    const firstSelected = data.find(d => d.mawb_id === firstSelectedId);
    if (firstSelected) {
      setSelectedRow(firstSelected);
    }
    setShowPrintModal(true);
  };

  // 삭제 핸들러
  const handleDeleteClick = () => {
    if (selectedIds.size === 0) {
      setShowSelectionAlert(true);
      return;
    }
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      for (const id of selectedIds) {
        await fetch(`/api/awb/mawb?id=${id}`, { method: 'DELETE' });
      }
      alert(`${selectedIds.size}건이 삭제되었습니다.`);
      setSelectedIds(new Set());
      setSelectedRow(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
    setShowDeleteConfirm(false);
  };

  const handleCloseClick = () => {
    setShowCloseModal(true);
  };

  const handleConfirmClose = () => {
    setShowCloseModal(false);
    router.push(LIST_PATHS.DASHBOARD);
  };

  useCloseConfirm({
    showModal: showCloseModal,
    setShowModal: setShowCloseModal,
    onConfirmClose: handleConfirmClose,
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header title="AWB 관리 (항공수입)" subtitle="Logis > 항공수입 > AWB 관리" showCloseButton={false} />
        <main ref={formRef} className="p-6">
          {/* 버튼 영역 */}
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
              <button
                onClick={handleDeleteClick}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                삭제
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

          {/* 검색 필터 */}
          <div className="card p-6 mb-6">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">ETA 기간</label>
                <div className="flex gap-2 items-center">
                  <input type="date" value={filters.startDate} onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <span className="text-[var(--muted)]">~</span>
                  <input type="date" value={filters.endDate} onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <DateRangeButtons onRangeSelect={handleDateRangeSelect} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">MAWB No.</label>
                <input type="text" value={filters.awbNo} onChange={e => setFilters(prev => ({ ...prev, awbNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="180-12345678" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">편명</label>
                <input type="text" value={filters.flightNo} onChange={e => setFilters(prev => ({ ...prev, flightNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="KE001" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">수하인</label>
                <input type="text" value={filters.consignee} onChange={e => setFilters(prev => ({ ...prev, consignee: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="수하인명" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">상태</label>
                <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                  <option value="">전체</option>
                  <option value="DRAFT">초안</option>
                  <option value="DEPARTED">출발</option>
                  <option value="IN_TRANSIT">운송중</option>
                  <option value="ARRIVED">도착</option>
                  <option value="CUSTOMS">통관중</option>
                  <option value="RELEASED">반출</option>
                  <option value="DELIVERED">인도완료</option>
                </select>
              </div>
              <div className="flex items-end gap-2 col-span-3">
                <button onClick={handleSearch} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">검색</button>
                <button onClick={handleReset} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">초기화</button>
              </div>
            </div>
          </div>

          {/* 요약 통계 (부킹 제거) */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold">{summaryStats.total}</div>
              <div className="text-sm text-[var(--muted)]">전체</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">{summaryStats.inTransit}</div>
              <div className="text-sm text-[var(--muted)]">운송중</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{summaryStats.arrived}</div>
              <div className="text-sm text-[var(--muted)]">도착</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-purple-500">{summaryStats.totalWeight.toLocaleString()}</div>
              <div className="text-sm text-[var(--muted)]">총 중량 (KG)</div>
            </div>
          </div>

          {/* 테이블 */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
              <h3 className="font-bold">AWB 목록 (항공수입)</h3>
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
                  <SortableHeader columnKey="mawb_no" label="MAWB No." sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="airline_code" label="항공사" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="flight_no" label="편명" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="eta_dt" label="ETA" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="origin_airport_cd" label="구간" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="consignee_nm" label="수하인" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="commodity_desc" label="품명" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="pieces" label="PCS" sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader columnKey="gross_weight_kg" label="G/W" sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader columnKey="hawb_count" label="HAWB" sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader columnKey="status_cd" label="상태" sortConfig={sortConfig} onSort={handleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-[var(--muted)]">
                      로딩 중...
                    </td>
                  </tr>
                ) : sortedList.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-[var(--muted)]">
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  sortedList.map(item => (
                    <tr
                      key={item.mawb_id}
                      className={`hover:bg-[var(--surface-50)] cursor-pointer ${selectedIds.has(item.mawb_id) ? 'bg-blue-500/10' : ''} ${selectedRow?.mawb_id === item.mawb_id ? 'bg-[#E8A838]/10' : ''}`}
                      onClick={() => handleRowClick(item)}
                    >
                      <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.mawb_id)}
                          onChange={() => handleRowSelect(item.mawb_id)}
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/logis/import-bl/air/${item.mawb_id}`} className="text-blue-400 hover:underline font-medium">
                          {item.mawb_no}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm">{item.airline_code}</td>
                      <td className="px-4 py-3 text-sm">{item.flight_no}</td>
                      <td className="px-4 py-3 text-sm">{item.eta_dt || item.etd_dt}</td>
                      <td className="px-4 py-3 text-sm">{item.origin_airport_cd} → {item.dest_airport_cd}</td>
                      <td className="px-4 py-3 text-sm">{item.consignee_nm}</td>
                      <td className="px-4 py-3 text-sm">{item.commodity_desc}</td>
                      <td className="px-4 py-3 text-sm text-right">{item.pieces?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right">{item.gross_weight_kg?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {item.hawb_count || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusConfig(item.status_cd).color}`}>
                          {getStatusConfig(item.status_cd).label}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
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

      {/* 선택 알림 모달 */}
      <SelectionAlertModal
        isOpen={showSelectionAlert}
        onClose={() => setShowSelectionAlert(false)}
      />

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        itemCount={selectedIds.size}
      />
    </div>
  );
}
