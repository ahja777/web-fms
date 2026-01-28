'use client';

import { useRouter } from 'next/navigation';
import { LIST_PATHS } from '@/constants/paths';
import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import AWBPrintModal, { AWBData as AWBPrintData } from '@/components/AWBPrintModal';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';
import { useSorting, SortableHeader, SortStatusBadge } from '@/components/table';
import SelectionAlertModal from '@/components/SelectionAlertModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { ActionButton } from '@/components/buttons';

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

  const today = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState({
    etaDateFrom: today,
    etaDateTo: today,
    ataDateFrom: '',
    ataDateTo: '',
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

  const handleSearch = () => setAppliedFilters(filters);
  const handleReset = () => {
    const resetFilters = {
      etaDateFrom: today,
      etaDateTo: today,
      ataDateFrom: '',
      ataDateTo: '',
      awbNo: '',
      flightNo: '',
      consignee: '',
      status: ''
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSelectedIds(new Set());
    setSelectedRow(null);
    resetSort();
  };

  // 버튼 핸들러
  const handleNew = () => router.push('/logis/import-bl/air/register');
  const handleEdit = () => {
    if (selectedIds.size !== 1) {
      alert('수정할 항목을 1개 선택해주세요.');
      return;
    }
    const id = Array.from(selectedIds)[0];
    router.push(`/logis/import-bl/air/${id}`);
  };
  const handleExcel = () => {
    const dataToExport = selectedIds.size > 0
      ? filteredData.filter(item => selectedIds.has(item.mawb_id))
      : filteredData;
    alert(`${dataToExport.length}건의 데이터를 Excel로 다운로드합니다.`);
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
          {/* 상단 버튼 영역 - 해상수출 B/L과 동일한 스타일 */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              {selectedIds.size > 0 && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                  {selectedIds.size}건 선택
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <ActionButton variant="success" icon="plus" onClick={handleNew}>신규</ActionButton>
              <ActionButton variant="secondary" icon="edit" onClick={handleEdit}>수정</ActionButton>
              <ActionButton variant="danger" icon="delete" onClick={handleDeleteClick}>삭제</ActionButton>
              <ActionButton variant="primary" icon="print" onClick={handlePrint}>출력</ActionButton>
              <ActionButton variant="default" icon="download" onClick={handleExcel}>Excel</ActionButton>
              <ActionButton variant="default" icon="refresh" onClick={handleReset}>초기화</ActionButton>
            </div>
          </div>

          {/* 검색조건 - 해상수출 B/L과 동일한 레이아웃 (grid-cols-6) */}
          <div className="card mb-6">
            <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
              <svg className="w-5 h-5 text-[#E8A838]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="font-bold">검색조건</h3>
            </div>
            <div className="p-4">
              {/* 첫 번째 줄 */}
              <div className="grid grid-cols-6 gap-4 mb-4">
                {/* 업무구분 (고정값) */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">업무구분</label>
                  <input
                    type="text"
                    value="항공"
                    readOnly
                    className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                  />
                </div>
                {/* 수출입구분 (고정값) */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">수출입구분</label>
                  <input
                    type="text"
                    value="수입(IN)"
                    readOnly
                    className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                  />
                </div>
                {/* ETA 기간 */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">ETA 기간</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={filters.etaDateFrom}
                      onChange={e => setFilters(prev => ({ ...prev, etaDateFrom: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm"
                    />
                    <span className="text-[var(--muted)]">~</span>
                    <input
                      type="date"
                      value={filters.etaDateTo}
                      onChange={e => setFilters(prev => ({ ...prev, etaDateTo: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm"
                    />
                  </div>
                </div>
                {/* ATA 기간 */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">ATA 기간</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={filters.ataDateFrom}
                      onChange={e => setFilters(prev => ({ ...prev, ataDateFrom: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm"
                    />
                    <span className="text-[var(--muted)]">~</span>
                    <input
                      type="date"
                      value={filters.ataDateTo}
                      onChange={e => setFilters(prev => ({ ...prev, ataDateTo: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm"
                    />
                  </div>
                </div>
              </div>
              {/* 두 번째 줄 */}
              <div className="grid grid-cols-6 gap-4">
                {/* MAWB No. */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">MAWB No.</label>
                  <input
                    type="text"
                    value={filters.awbNo}
                    onChange={e => setFilters(prev => ({ ...prev, awbNo: e.target.value }))}
                    className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm"
                    placeholder="180-12345678"
                  />
                </div>
                {/* 편명 */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">편명</label>
                  <input
                    type="text"
                    value={filters.flightNo}
                    onChange={e => setFilters(prev => ({ ...prev, flightNo: e.target.value }))}
                    className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm"
                    placeholder="KE001"
                  />
                </div>
                {/* 수하인 */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">수하인</label>
                  <input
                    type="text"
                    value={filters.consignee}
                    onChange={e => setFilters(prev => ({ ...prev, consignee: e.target.value }))}
                    className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm"
                    placeholder="수하인명"
                  />
                </div>
                {/* 상태 */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">상태</label>
                  <select
                    value={filters.status}
                    onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm"
                  >
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
                {/* 빈 칸 (정렬용) */}
                <div></div>
                <div></div>
              </div>
            </div>
            {/* 검색 버튼 영역 - 하단 별도 영역 */}
            <div className="p-4 border-t border-[var(--border)] flex justify-center gap-2">
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] font-medium"
              >
                조회
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-200)]"
              >
                초기화
              </button>
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
