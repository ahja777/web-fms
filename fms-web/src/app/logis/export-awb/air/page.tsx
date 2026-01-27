'use client';

import { useRouter } from 'next/navigation';
import { LIST_PATHS } from '@/constants/paths';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import DateRangeButtons, { getToday } from '@/components/DateRangeButtons';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';
import SelectionAlertModal from '@/components/SelectionAlertModal';
import AWBPrintModal, { AWBData as AWBPrintData } from '@/components/AWBPrintModal';

interface AWBData {
  mawb_id: number;
  mawb_no: string;
  flight_no: string;
  etd_dt: string;
  eta_dt: string;
  origin_airport_cd: string;
  dest_airport_cd: string;
  origin_airport_name: string;
  dest_airport_name: string;
  shipper_nm: string;
  shipper_addr?: string;
  consignee_nm: string;
  consignee_addr?: string;
  pieces: number;
  gross_weight_kg: number;
  charge_weight_kg: number;
  commodity_desc: string;
  goods_desc?: string;
  status_cd: string;
  hawb_count: number;
  carrier_name: string;
  carrier_cd?: string;
  airline_code: string;
  freight_amt?: number;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  DRAFT: { label: '초안', color: 'bg-gray-500', bgColor: '#F3F4F6' },
  BOOKED: { label: '부킹', color: 'bg-blue-500', bgColor: '#DBEAFE' },
  ACCEPTED: { label: '수탁', color: 'bg-cyan-500', bgColor: '#CFFAFE' },
  DEPARTED: { label: '출발', color: 'bg-purple-500', bgColor: '#F3E8FF' },
  IN_TRANSIT: { label: '운송중', color: 'bg-yellow-500', bgColor: '#FEF3C7' },
  ARRIVED: { label: '도착', color: 'bg-green-500', bgColor: '#D1FAE5' },
  DELIVERED: { label: '인도완료', color: 'bg-emerald-600', bgColor: '#D1FAE5' },
  CONFIRMED: { label: '확정', color: 'bg-green-500', bgColor: '#D1FAE5' },
  CANCELLED: { label: '취소', color: 'bg-red-500', bgColor: '#FEE2E2' },
};

const getStatusConfig = (status: string) => statusConfig[status] || { label: status || '미정', color: 'bg-gray-500', bgColor: '#F3F4F6' };

export default function ExportAWBListPage() {
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const today = getToday();
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    awbNo: '',
    flightNo: '',
    shipper: '',
    status: '',
  });
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [data, setData] = useState<AWBData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showSelectionAlert, setShowSelectionAlert] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // 데이터 조회
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
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

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    const resetFilters = { startDate: today, endDate: today, awbNo: '', flightNo: '', shipper: '', status: '' };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const filteredData = data.filter(item => {
    if (appliedFilters.flightNo && !item.flight_no?.toLowerCase().includes(appliedFilters.flightNo.toLowerCase())) return false;
    if (appliedFilters.shipper && !item.shipper_nm?.includes(appliedFilters.shipper)) return false;
    return true;
  });

  const summaryStats = {
    total: filteredData.length,
    draft: filteredData.filter(d => d.status_cd === 'DRAFT').length,
    booked: filteredData.filter(d => d.status_cd === 'BOOKED').length,
    totalWeight: filteredData.reduce((sum, d) => sum + (d.gross_weight_kg || 0), 0),
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

  // 체크박스 핸들러
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredData.map(d => d.mawb_id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: number, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  // 출력 핸들러
  const handlePrint = () => {
    if (selectedIds.size === 0) {
      setShowSelectionAlert(true);
      return;
    }
    setShowPrintModal(true);
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (selectedIds.size === 0) {
      setShowSelectionAlert(true);
      return;
    }
    if (!confirm(`선택한 ${selectedIds.size}건을 삭제하시겠습니까?`)) return;

    try {
      for (const id of selectedIds) {
        await fetch(`/api/awb/mawb?id=${id}`, { method: 'DELETE' });
      }
      alert('삭제가 완료되었습니다.');
      setSelectedIds(new Set());
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const getPrintData = (): AWBPrintData | null => {
    const selected = filteredData.filter(d => selectedIds.has(d.mawb_id));
    if (selected.length === 0) return null;

    const item = selected[0];
    return {
      hawbNo: '',
      mawbNo: item.mawb_no || '',
      awbDate: item.etd_dt || '',
      shipper: item.shipper_nm || '',
      shipperAddress: item.shipper_addr || '',
      consignee: item.consignee_nm || '',
      consigneeAddress: item.consignee_addr || '',
      carrier: item.carrier_name || item.airline_code || '',
      origin: item.origin_airport_cd || '',
      destination: item.dest_airport_cd || '',
      flightNo: item.flight_no || '',
      flightDate: item.etd_dt || '',
      pieces: item.pieces || 0,
      weightUnit: 'K',
      grossWeight: item.gross_weight_kg || 0,
      chargeableWeight: item.charge_weight_kg || 0,
      natureOfGoods: item.commodity_desc || item.goods_desc || 'CONSOLIDATION CARGO',
      currency: 'USD',
      totalCharge: item.freight_amt || 0,
      issuerName: 'INTERGIS LOGISTICS CO., LTD.',
      executedAt: 'SEOUL, KOREA',
    };
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header title="AWB 관리 (항공수출)" subtitle="Logis > 항공수출 > AWB 관리" showCloseButton={false} />
        <main ref={formRef} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                출력 ({selectedIds.size})
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                삭제
              </button>
              <Link href="/logis/export-awb/air/register" className="px-6 py-2 font-semibold rounded-lg" style={{ background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)', color: '#0C1222' }}>
                신규 등록
              </Link>
            </div>
          </div>

          {/* 검색 필터 */}
          <div className="card p-6 mb-6">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">ETD 기간</label>
                <div className="flex gap-2 items-center">
                  <input type="date" value={filters.startDate} onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" />
                  <span className="text-[var(--muted)]">~</span>
                  <input type="date" value={filters.endDate} onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" />
                  <DateRangeButtons onRangeSelect={handleDateRangeSelect} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">MAWB No.</label>
                <input type="text" value={filters.awbNo} onChange={e => setFilters(prev => ({ ...prev, awbNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" placeholder="180-12345678" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">편명</label>
                <input type="text" value={filters.flightNo} onChange={e => setFilters(prev => ({ ...prev, flightNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" placeholder="KE001" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">화주</label>
                <input type="text" value={filters.shipper} onChange={e => setFilters(prev => ({ ...prev, shipper: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" placeholder="화주명" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">상태</label>
                <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm">
                  <option value="">전체</option>
                  <option value="DRAFT">초안</option>
                  <option value="BOOKED">부킹</option>
                  <option value="ACCEPTED">수탁</option>
                  <option value="DEPARTED">출발</option>
                  <option value="IN_TRANSIT">운송중</option>
                  <option value="ARRIVED">도착</option>
                  <option value="DELIVERED">인도완료</option>
                </select>
              </div>
              <div className="flex items-end gap-2 col-span-3">
                <button onClick={handleSearch} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">검색</button>
                <button onClick={handleReset} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">초기화</button>
              </div>
            </div>
          </div>

          {/* 요약 통계 */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold">{summaryStats.total}</div>
              <div className="text-sm text-[var(--muted)]">전체</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-gray-500">{summaryStats.draft}</div>
              <div className="text-sm text-[var(--muted)]">초안</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{summaryStats.booked}</div>
              <div className="text-sm text-[var(--muted)]">부킹</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-purple-500">{summaryStats.totalWeight.toLocaleString()}</div>
              <div className="text-sm text-[var(--muted)]">총 중량 (KG)</div>
            </div>
          </div>

          {/* 테이블 */}
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--surface-100)]">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">MAWB No.</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">항공사</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">편명</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">ETD</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">구간</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">화주</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">품명</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">PCS</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">G/W</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">HAWB</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-[var(--muted)]">
                      로딩 중...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-[var(--muted)]">
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredData.map(item => (
                    <tr key={item.mawb_id} className="hover:bg-[var(--surface-50)]">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.mawb_id)}
                          onChange={(e) => handleSelect(item.mawb_id, e.target.checked)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/logis/export-awb/air/${item.mawb_id}`} className="text-blue-400 hover:underline font-medium">
                          {item.mawb_no}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm">{item.carrier_name || item.airline_code}</td>
                      <td className="px-4 py-3 text-sm">{item.flight_no}</td>
                      <td className="px-4 py-3 text-sm">{item.etd_dt}</td>
                      <td className="px-4 py-3 text-sm">{item.origin_airport_cd} → {item.dest_airport_cd}</td>
                      <td className="px-4 py-3 text-sm">{item.shipper_nm}</td>
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

      <CloseConfirmModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleConfirmClose}
      />

      <SelectionAlertModal
        isOpen={showSelectionAlert}
        onClose={() => setShowSelectionAlert(false)}
      />

      <AWBPrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        awbData={getPrintData()}
      />
    </div>
  );
}
