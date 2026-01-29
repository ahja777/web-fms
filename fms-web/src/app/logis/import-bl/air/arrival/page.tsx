'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { ANSearchModal, type ANItem } from '@/components/popup';
import { ActionButton } from '@/components/buttons';
import { useSorting, SortableHeader, SortConfig } from '@/components/table/SortableTable';

interface AirArrivalData {
  id: number;
  awbNo: string;
  flightNo: string;
  airline: string;
  eta: string;
  ata: string;
  origin: string;
  destination: string;
  shipper: string;
  consignee: string;
  pieces: number;
  grossWeight: number;
  commodity: string;
  cargoStatus: string;
  customsStatus: string;
  arrivalNotice: boolean;
  releaseOrder: boolean;
}

const cargoStatusConfig: Record<string, { label: string; color: string }> = {
  IN_TRANSIT: { label: '비행중', color: 'bg-blue-500' },
  ARRIVED: { label: '도착', color: 'bg-purple-500' },
  UNLOADED: { label: '하기완료', color: 'bg-cyan-500' },
  IN_BONDED: { label: '보세창고', color: 'bg-yellow-500' },
  RELEASED: { label: '반출', color: 'bg-green-500' },
  DELIVERED: { label: '배송완료', color: 'bg-gray-500' },
};

const customsStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: '대기', color: 'bg-gray-500' },
  DECLARED: { label: '신고', color: 'bg-blue-500' },
  INSPECTING: { label: '검사', color: 'bg-yellow-500' },
  CLEARED: { label: '통관완료', color: 'bg-green-500' },
};

const mockData: AirArrivalData[] = [
  { id: 1, awbNo: '180-98765432', flightNo: 'KE001', airline: 'KE', eta: '2026-01-25', ata: '2026-01-25', origin: 'LAX', destination: 'ICN', shipper: 'Apple Inc.', consignee: 'LG전자', pieces: 200, grossWeight: 8000, commodity: 'Electronics', cargoStatus: 'UNLOADED', customsStatus: 'DECLARED', arrivalNotice: true, releaseOrder: false },
  { id: 2, awbNo: '988-11223344', flightNo: 'OZ202', airline: 'OZ', eta: '2026-01-26', ata: '', origin: 'NRT', destination: 'ICN', shipper: 'Sony Japan', consignee: '삼성전자', pieces: 50, grossWeight: 2500, commodity: 'Components', cargoStatus: 'IN_TRANSIT', customsStatus: 'PENDING', arrivalNotice: false, releaseOrder: false },
  { id: 3, awbNo: '160-55667788', flightNo: 'CX415', airline: 'CX', eta: '2026-01-24', ata: '2026-01-24', origin: 'HKG', destination: 'ICN', shipper: 'HK Trading', consignee: '현대자동차', pieces: 80, grossWeight: 3200, commodity: 'Auto Parts', cargoStatus: 'IN_BONDED', customsStatus: 'CLEARED', arrivalNotice: true, releaseOrder: true },
  { id: 4, awbNo: '131-44556677', flightNo: 'NH872', airline: 'NH', eta: '2026-01-27', ata: '', origin: 'TYO', destination: 'ICN', shipper: 'Japan Electronics', consignee: 'SK하이닉스', pieces: 120, grossWeight: 4800, commodity: 'Semiconductors', cargoStatus: 'IN_TRANSIT', customsStatus: 'PENDING', arrivalNotice: false, releaseOrder: false },
];

export default function AirArrivalPage() {
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
    cargoStatus: '',
    customsStatus: '',
  });
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [data] = useState<AirArrivalData[]>(mockData);
  const [showANModal, setShowANModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const { sortConfig, handleSort, sortData } = useSorting<AirArrivalData>();

  const handleANSelect = (item: ANItem) => {
    setFilters(prev => ({ ...prev, awbNo: item.blNo }));
    setShowANModal(false);
  };

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
      cargoStatus: '',
      customsStatus: ''
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSelectedIds(new Set());
  };

  const filteredData = sortData(data.filter(item => {
    if (appliedFilters.awbNo && !item.awbNo.includes(appliedFilters.awbNo)) return false;
    if (appliedFilters.flightNo && !item.flightNo.toLowerCase().includes(appliedFilters.flightNo.toLowerCase())) return false;
    if (appliedFilters.consignee && !item.consignee.includes(appliedFilters.consignee)) return false;
    if (appliedFilters.cargoStatus && item.cargoStatus !== appliedFilters.cargoStatus) return false;
    if (appliedFilters.customsStatus && item.customsStatus !== appliedFilters.customsStatus) return false;
    if (appliedFilters.etaDateFrom && item.eta < appliedFilters.etaDateFrom) return false;
    if (appliedFilters.etaDateTo && item.eta > appliedFilters.etaDateTo) return false;
    if (appliedFilters.ataDateFrom && item.ata && item.ata < appliedFilters.ataDateFrom) return false;
    if (appliedFilters.ataDateTo && item.ata && item.ata > appliedFilters.ataDateTo) return false;
    return true;
  }));

  const summaryStats = {
    total: filteredData.length,
    inTransit: filteredData.filter(d => d.cargoStatus === 'IN_TRANSIT').length,
    arrived: filteredData.filter(d => ['ARRIVED', 'UNLOADED', 'IN_BONDED'].includes(d.cargoStatus)).length,
    pendingAN: filteredData.filter(d => !d.arrivalNotice).length,
    pendingRO: filteredData.filter(d => !d.releaseOrder && d.customsStatus === 'CLEARED').length,
  };

  const handleConfirmClose = () => {
    setShowCloseModal(false);
    router.back();
  };

  const handleRowSelect = (id: number) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleSelectAll = () => {
    selectedIds.size === filteredData.length
      ? setSelectedIds(new Set())
      : setSelectedIds(new Set(filteredData.map(i => i.id)));
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
  const handleDelete = () => {
    if (selectedIds.size === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }
    if (confirm(`${selectedIds.size}건을 삭제하시겠습니까?`)) {
      alert('삭제되었습니다.');
      setSelectedIds(new Set());
    }
  };
  const handleANSend = () => {
    const pendingAN = filteredData.filter(d => selectedIds.has(d.id) && !d.arrivalNotice);
    if (pendingAN.length === 0) {
      alert('A/N 발송할 항목을 선택해주세요.');
      return;
    }
    alert(`${pendingAN.length}건의 A/N이 발송되었습니다.`);
  };
  const handleExcel = () => {
    const dataToExport = selectedIds.size > 0
      ? filteredData.filter(item => selectedIds.has(item.id))
      : filteredData;
    alert(`${dataToExport.length}건의 데이터를 Excel로 다운로드합니다.`);
  };


  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header title="AWB 도착관리 (항공)" subtitle="Logis > AWB 관리 > AWB 도착관리 (항공)" />
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
              <ActionButton variant="danger" icon="delete" onClick={handleDelete}>삭제</ActionButton>
              <ActionButton variant="primary" icon="email" onClick={handleANSend}>A/N 발송</ActionButton>
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
                {/* AWB No. */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">AWB No.</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={filters.awbNo}
                      onChange={e => setFilters(prev => ({ ...prev, awbNo: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm"
                      placeholder="180-12345678"
                    />
                    <button
                      onClick={() => setShowANModal(true)}
                      className="px-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-200)]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
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
                {/* 화물 상태 */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">화물 상태</label>
                  <select
                    value={filters.cargoStatus}
                    onChange={e => setFilters(prev => ({ ...prev, cargoStatus: e.target.value }))}
                    className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm"
                  >
                    <option value="">전체</option>
                    <option value="IN_TRANSIT">비행중</option>
                    <option value="ARRIVED">도착</option>
                    <option value="UNLOADED">하기완료</option>
                    <option value="IN_BONDED">보세창고</option>
                    <option value="RELEASED">반출</option>
                    <option value="DELIVERED">배송완료</option>
                  </select>
                </div>
                {/* 통관 상태 */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">통관 상태</label>
                  <select
                    value={filters.customsStatus}
                    onChange={e => setFilters(prev => ({ ...prev, customsStatus: e.target.value }))}
                    className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm"
                  >
                    <option value="">전체</option>
                    <option value="PENDING">대기</option>
                    <option value="DECLARED">신고</option>
                    <option value="INSPECTING">검사</option>
                    <option value="CLEARED">통관완료</option>
                  </select>
                </div>
                {/* 빈 칸 (정렬용) */}
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

          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="card p-4 text-center"><div className="text-2xl font-bold">{summaryStats.total}</div><div className="text-sm text-[var(--muted)]">전체</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-blue-500">{summaryStats.inTransit}</div><div className="text-sm text-[var(--muted)]">비행중</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-green-500">{summaryStats.arrived}</div><div className="text-sm text-[var(--muted)]">도착</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-yellow-500">{summaryStats.pendingAN}</div><div className="text-sm text-[var(--muted)]">A/N 미발송</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-purple-500">{summaryStats.pendingRO}</div><div className="text-sm text-[var(--muted)]">R/O 미발급</div></div>
          </div>

          {/* 목록 테이블 */}
          <div className="card mb-6">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="font-bold">도착 AWB 목록</h3>
                <span className="px-2 py-1 bg-[#E8A838]/20 text-[#E8A838] rounded text-sm font-medium">
                  {filteredData.length}건
                </span>
              </div>
              {selectedIds.size > 0 && (
                <button onClick={() => setSelectedIds(new Set())} className="text-sm text-[var(--muted)] hover:text-white">
                  선택 해제 ({selectedIds.size}건)
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--surface-100)]">
                  <tr>
                    <th className="w-12 p-3">
                      <input
                        type="checkbox"
                        checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">No</th>
                    <SortableHeader<AirArrivalData> columnKey="awbNo" label="AWB No." sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<AirArrivalData> columnKey="flightNo" label="편명" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<AirArrivalData> columnKey="eta" label="ETA" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<AirArrivalData> columnKey="ata" label="ATA" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<AirArrivalData> columnKey="origin" label="구간" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<AirArrivalData> columnKey="consignee" label="수하인" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<AirArrivalData> columnKey="pieces" label="PCS" sortConfig={sortConfig} onSort={handleSort} align="right" />
                    <SortableHeader<AirArrivalData> columnKey="grossWeight" label="G/W" sortConfig={sortConfig} onSort={handleSort} align="right" />
                    <SortableHeader<AirArrivalData> columnKey="cargoStatus" label={<>화물<br/>상태</>} sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<AirArrivalData> columnKey="customsStatus" label={<>통관<br/>상태</>} sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<AirArrivalData> columnKey="arrivalNotice" label="A/N" sortConfig={sortConfig} onSort={handleSort} align="center" />
                    <SortableHeader<AirArrivalData> columnKey="releaseOrder" label="R/O" sortConfig={sortConfig} onSort={handleSort} align="center" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <svg className="w-12 h-12 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-[var(--muted)]">조회된 데이터가 없습니다.</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-[var(--surface-50)] cursor-pointer transition-colors ${selectedIds.has(item.id) ? 'bg-blue-500/10' : ''}`}
                    >
                      <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => handleRowSelect(item.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3">
                        <Link href={`/logis/import-bl/air/${item.id}`} className="text-[#E8A838] font-medium hover:underline">
                          {item.awbNo}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm">{item.flightNo}</td>
                      <td className="px-4 py-3 text-sm">{item.eta}</td>
                      <td className="px-4 py-3 text-sm">{item.ata || '-'}</td>
                      <td className="px-4 py-3 text-sm">{item.origin} → {item.destination}</td>
                      <td className="px-4 py-3 text-sm">{item.consignee}</td>
                      <td className="px-4 py-3 text-sm text-right">{item.pieces}</td>
                      <td className="px-4 py-3 text-sm text-right">{item.grossWeight.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full text-white ${cargoStatusConfig[item.cargoStatus].color}`}>
                          {cargoStatusConfig[item.cargoStatus].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full text-white ${customsStatusConfig[item.customsStatus].color}`}>
                          {customsStatusConfig[item.customsStatus].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.arrivalNotice ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">발송</button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.releaseOrder ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          item.customsStatus === 'CLEARED' ? (
                            <button className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">발급</button>
                          ) : (
                            <span className="text-[var(--muted)]">-</span>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <ANSearchModal
        isOpen={showANModal}
        onClose={() => setShowANModal(false)}
        onSelect={handleANSelect}
        type="air"
      />

      <CloseConfirmModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleConfirmClose}
      />
    </div>
  );
}
