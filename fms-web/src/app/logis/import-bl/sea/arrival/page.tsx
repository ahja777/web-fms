'use client';

import { useRouter } from 'next/navigation';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import DateRangeButtons, { getToday } from '@/components/DateRangeButtons';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { ANSearchModal, type ANItem } from '@/components/popup';

interface ArrivalData {
  id: number;
  blNo: string;
  vessel: string;
  voyage: string;
  eta: string;
  ata: string;
  pol: string;
  pod: string;
  shipper: string;
  consignee: string;
  containers: string;
  containerCount: number;
  cargoStatus: string;
  customsStatus: string;
  arrivalNotice: boolean;
  doIssued: boolean;
}

const cargoStatusConfig: Record<string, { label: string; color: string }> = {
  IN_TRANSIT: { label: '운송중', color: 'bg-blue-500' },
  ARRIVED: { label: '입항', color: 'bg-purple-500' },
  DISCHARGED: { label: '양하완료', color: 'bg-cyan-500' },
  IN_CY: { label: 'CY반입', color: 'bg-yellow-500' },
  RELEASED: { label: '반출', color: 'bg-green-500' },
  DELIVERED: { label: '배송완료', color: 'bg-gray-500' },
};

const customsStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: '대기', color: 'bg-gray-500' },
  DECLARED: { label: '신고', color: 'bg-blue-500' },
  INSPECTING: { label: '검사', color: 'bg-yellow-500' },
  CLEARED: { label: '통관완료', color: 'bg-green-500' },
};

const mockData: ArrivalData[] = [
  { id: 1, blNo: 'HDMU1234567', vessel: 'HMM GDANSK', voyage: '001E', eta: '2026-01-25', ata: '2026-01-25', pol: 'USLAX', pod: 'KRPUS', shipper: 'Apple Inc.', consignee: 'LG전자', containers: '40HC x 3', containerCount: 3, cargoStatus: 'DISCHARGED', customsStatus: 'DECLARED', arrivalNotice: true, doIssued: false },
  { id: 2, blNo: 'MAEU5678901', vessel: 'MAERSK SEOUL', voyage: '025W', eta: '2026-01-26', ata: '', pol: 'CNSHA', pod: 'KRPUS', shipper: 'China Electronics', consignee: 'SK하이닉스', containers: '20GP x 5, 40HC x 2', containerCount: 7, cargoStatus: 'IN_TRANSIT', customsStatus: 'PENDING', arrivalNotice: false, doIssued: false },
  { id: 3, blNo: 'MSCU2345678', vessel: 'MSC EMMA', voyage: '102E', eta: '2026-01-24', ata: '2026-01-24', pol: 'JPYOK', pod: 'KRINC', shipper: 'Toyota Japan', consignee: '현대자동차', containers: '40HC x 8', containerCount: 8, cargoStatus: 'IN_CY', customsStatus: 'CLEARED', arrivalNotice: true, doIssued: true },
  { id: 4, blNo: 'EGLV9012345', vessel: 'EVER GOLDEN', voyage: '055E', eta: '2026-01-27', ata: '', pol: 'TWKHH', pod: 'KRPUS', shipper: 'Taiwan Semi', consignee: '삼성전자', containers: '20GP x 10', containerCount: 10, cargoStatus: 'IN_TRANSIT', customsStatus: 'PENDING', arrivalNotice: false, doIssued: false },
];

export default function SeaArrivalPage() {
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const today = getToday();
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    blNo: '',
    vessel: '',
    consignee: '',
    cargoStatus: '',
    customsStatus: '',
  });
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [data] = useState<ArrivalData[]>(mockData);
  const [showANModal, setShowANModal] = useState(false);

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleANSelect = (item: ANItem) => {
    setFilters(prev => ({ ...prev, blNo: item.blNo }));
    setShowANModal(false);
  };

  const handleSearch = () => setAppliedFilters(filters);
  const handleReset = () => {
    const resetFilters = { startDate: today, endDate: today, blNo: '', vessel: '', consignee: '', cargoStatus: '', customsStatus: '' };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const filteredData = data.filter(item => {
    if (appliedFilters.blNo && !item.blNo.toLowerCase().includes(appliedFilters.blNo.toLowerCase())) return false;
    if (appliedFilters.vessel && !item.vessel.toLowerCase().includes(appliedFilters.vessel.toLowerCase())) return false;
    if (appliedFilters.consignee && !item.consignee.includes(appliedFilters.consignee)) return false;
    if (appliedFilters.cargoStatus && item.cargoStatus !== appliedFilters.cargoStatus) return false;
    if (appliedFilters.customsStatus && item.customsStatus !== appliedFilters.customsStatus) return false;
    return true;
  });

  const summaryStats = {
    total: filteredData.length,
    inTransit: filteredData.filter(d => d.cargoStatus === 'IN_TRANSIT').length,
    arrived: filteredData.filter(d => ['ARRIVED', 'DISCHARGED', 'IN_CY'].includes(d.cargoStatus)).length,
    pendingAN: filteredData.filter(d => !d.arrivalNotice).length,
    pendingDO: filteredData.filter(d => !d.doIssued && d.customsStatus === 'CLEARED').length,
  };

  const handleCloseClick = () => {
    setShowCloseModal(true);
  };

  const handleConfirmClose = () => {
    setShowCloseModal(false);
    router.back();
  };


  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header title="B/L 도착관리 (해상)" subtitle="Logis > B/L관리 > B/L 도착관리 (해상)" showCloseButton={false} />
        <main ref={formRef} className="p-6">
          <div className="flex justify-between items-center mb-6">
          </div>

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
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">B/L No.</label>
                <div className="flex gap-2">
                  <input type="text" value={filters.blNo} onChange={e => setFilters(prev => ({ ...prev, blNo: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="HDMU1234567" />
                  <button type="button" onClick={() => setShowANModal(true)} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">찾기</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">선명</label>
                <input type="text" value={filters.vessel} onChange={e => setFilters(prev => ({ ...prev, vessel: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="선박명" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">수하인</label>
                <input type="text" value={filters.consignee} onChange={e => setFilters(prev => ({ ...prev, consignee: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="수하인명" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">화물 상태</label>
                <select value={filters.cargoStatus} onChange={e => setFilters(prev => ({ ...prev, cargoStatus: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                  <option value="">전체</option>
                  <option value="IN_TRANSIT">운송중</option>
                  <option value="ARRIVED">입항</option>
                  <option value="DISCHARGED">양하완료</option>
                  <option value="IN_CY">CY반입</option>
                  <option value="RELEASED">반출</option>
                  <option value="DELIVERED">배송완료</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">통관 상태</label>
                <select value={filters.customsStatus} onChange={e => setFilters(prev => ({ ...prev, customsStatus: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                  <option value="">전체</option>
                  <option value="PENDING">대기</option>
                  <option value="DECLARED">신고</option>
                  <option value="INSPECTING">검사</option>
                  <option value="CLEARED">통관완료</option>
                </select>
              </div>
              <div className="flex items-end gap-2 col-span-2">
                <button onClick={handleSearch} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">검색</button>
                <button onClick={handleReset} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">초기화</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="card p-4 text-center"><div className="text-2xl font-bold">{summaryStats.total}</div><div className="text-sm text-[var(--muted)]">전체</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-blue-500">{summaryStats.inTransit}</div><div className="text-sm text-[var(--muted)]">운송중</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-green-500">{summaryStats.arrived}</div><div className="text-sm text-[var(--muted)]">도착</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-yellow-500">{summaryStats.pendingAN}</div><div className="text-sm text-[var(--muted)]">A/N 미발송</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-purple-500">{summaryStats.pendingDO}</div><div className="text-sm text-[var(--muted)]">D/O 미발급</div></div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--surface-100)]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">B/L No.</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">선명/항차</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">ETA</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">ATA</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">구간</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">수하인</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">컨테이너</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">화물상태</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">통관상태</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">A/N</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">D/O</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-[var(--surface-50)] cursor-pointer">
                    <td className="px-4 py-3"><Link href={`/logis/import-bl/sea/${item.id}`} className="text-blue-400 hover:underline">{item.blNo}</Link></td>
                    <td className="px-4 py-3 text-sm">{item.vessel} / {item.voyage}</td>
                    <td className="px-4 py-3 text-sm">{item.eta}</td>
                    <td className="px-4 py-3 text-sm">{item.ata || '-'}</td>
                    <td className="px-4 py-3 text-sm">{item.pol} → {item.pod}</td>
                    <td className="px-4 py-3 text-sm">{item.consignee}</td>
                    <td className="px-4 py-3 text-sm">{item.containers}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full text-white ${cargoStatusConfig[item.cargoStatus].color}`}>{cargoStatusConfig[item.cargoStatus].label}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full text-white ${customsStatusConfig[item.customsStatus].color}`}>{customsStatusConfig[item.customsStatus].label}</span></td>
                    <td className="px-4 py-3 text-center">{item.arrivalNotice ? <span className="text-green-500">✓</span> : <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">발송</button>}</td>
                    <td className="px-4 py-3 text-center">{item.doIssued ? <span className="text-green-500">✓</span> : (item.customsStatus === 'CLEARED' ? <button className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">발급</button> : <span className="text-[var(--muted)]">-</span>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <ANSearchModal
        isOpen={showANModal}
        onClose={() => setShowANModal(false)}
        onSelect={handleANSelect}
        type="sea"
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
