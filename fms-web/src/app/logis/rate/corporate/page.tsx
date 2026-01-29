'use client';

import { useRouter } from 'next/navigation';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';
import { useSorting, SortableHeader, SortConfig } from '@/components/table/SortableTable';

interface CorporateRateData {
  id: number;
  contractNo: string;
  customerCode: string;
  customerName: string;
  transportMode: string;
  carrier: string;
  pol: string;
  pod: string;
  containerType: string;
  validFrom: string;
  validTo: string;
  currency: string;
  agreedRate: number;
  margin: number;
  sellingRate: number;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: '유효', color: 'bg-green-500' },
  EXPIRED: { label: '만료', color: 'bg-gray-500' },
  PENDING: { label: '대기', color: 'bg-yellow-500' },
  SUSPENDED: { label: '중지', color: 'bg-red-500' },
};

const mockData: CorporateRateData[] = [
  { id: 1, contractNo: 'CT-2026-001', customerCode: 'SAMSUNG', customerName: '삼성전자', transportMode: 'SEA', carrier: 'HMM', pol: 'KRPUS', pod: 'USLAX', containerType: '40HC', validFrom: '2026-01-01', validTo: '2026-12-31', currency: 'USD', agreedRate: 2800, margin: 200, sellingRate: 3000, status: 'ACTIVE' },
  { id: 2, contractNo: 'CT-2026-002', customerCode: 'LG', customerName: 'LG전자', transportMode: 'SEA', carrier: 'MAERSK', pol: 'KRPUS', pod: 'DEHAM', containerType: '40HC', validFrom: '2026-01-01', validTo: '2026-06-30', currency: 'USD', agreedRate: 2100, margin: 150, sellingRate: 2250, status: 'ACTIVE' },
  { id: 3, contractNo: 'CT-2026-003', customerCode: 'HYUNDAI', customerName: '현대자동차', transportMode: 'AIR', carrier: 'KE', pol: 'ICN', pod: 'LAX', containerType: '+100KG', validFrom: '2026-01-01', validTo: '2026-03-31', currency: 'USD', agreedRate: 4.50, margin: 0.30, sellingRate: 4.80, status: 'ACTIVE' },
  { id: 4, contractNo: 'CT-2025-010', customerCode: 'SK', customerName: 'SK하이닉스', transportMode: 'SEA', carrier: 'MSC', pol: 'KRPUS', pod: 'CNSHA', containerType: '20GP', validFrom: '2025-07-01', validTo: '2025-12-31', currency: 'USD', agreedRate: 900, margin: 100, sellingRate: 1000, status: 'EXPIRED' },
];

export default function CorporateRatePage() {
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const [filters, setFilters] = useState({
    customerName: '',
    transportMode: '',
    carrier: '',
    status: '',
  });
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const { sortConfig, handleSort, sortData } = useSorting<CorporateRateData>();
  const [data] = useState<CorporateRateData[]>(mockData);

  const handleSearch = () => setAppliedFilters(filters);
  const handleReset = () => {
    const resetFilters = { customerName: '', transportMode: '', carrier: '', status: '' };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const filteredData = data.filter(item => {
    if (appliedFilters.customerName && !item.customerName.includes(appliedFilters.customerName)) return false;
    if (appliedFilters.transportMode && item.transportMode !== appliedFilters.transportMode) return false;
    if (appliedFilters.carrier && !item.carrier.toLowerCase().includes(appliedFilters.carrier.toLowerCase())) return false;
    if (appliedFilters.status && item.status !== appliedFilters.status) return false;
    return true;
  });

  const summaryStats = {
    total: filteredData.length,
    customers: new Set(filteredData.map(d => d.customerCode)).size,
    active: filteredData.filter(d => d.status === 'ACTIVE').length,
    expiringSoon: filteredData.filter(d => {
      const validTo = new Date(d.validTo);
      const today = new Date();
      const diffDays = Math.ceil((validTo.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }).length,
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
        <Header title="기업운임관리" subtitle="Logis > 운임관리 > 기업운임관리" />
        <main ref={formRef} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Link href="/logis/rate/corporate/register" className="px-6 py-2 font-semibold rounded-lg" style={{ background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)', color: '#0C1222' }}>
              신규 계약
            </Link>
          </div>

          <div className="card p-6 mb-6">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">고객사</label>
                <input type="text" value={filters.customerName} onChange={e => setFilters(prev => ({ ...prev, customerName: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="고객사명" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">운송모드</label>
                <select value={filters.transportMode} onChange={e => setFilters(prev => ({ ...prev, transportMode: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                  <option value="">전체</option>
                  <option value="SEA">해상</option>
                  <option value="AIR">항공</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">선사/항공사</label>
                <input type="text" value={filters.carrier} onChange={e => setFilters(prev => ({ ...prev, carrier: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="HMM, KE 등" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">상태</label>
                <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                  <option value="">전체</option>
                  <option value="ACTIVE">유효</option>
                  <option value="EXPIRED">만료</option>
                  <option value="PENDING">대기</option>
                  <option value="SUSPENDED">중지</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSearch} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">검색</button>
              <button onClick={handleReset} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">초기화</button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="card p-4 text-center"><div className="text-2xl font-bold">{summaryStats.total}</div><div className="text-sm text-[var(--muted)]">전체 계약</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-blue-500">{summaryStats.customers}</div><div className="text-sm text-[var(--muted)]">고객사</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-green-500">{summaryStats.active}</div><div className="text-sm text-[var(--muted)]">유효 계약</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-yellow-500">{summaryStats.expiringSoon}</div><div className="text-sm text-[var(--muted)]">만료 임박</div></div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--surface-100)]">
                <tr>
                  <SortableHeader columnKey="contractNo" label={<>계약<br/>번호</>} sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="customerName" label="고객사" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="transportMode" label="모드" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="carrier" label={<>선사<br/>/항공사</>} sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="pol" label="구간" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="containerType" label="타입" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="validFrom" label={<>유효<br/>기간</>} sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="agreedRate" label={<>계약<br/>단가</>} sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader columnKey="margin" label="마진" sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader columnKey="sellingRate" label={<>판매<br/>단가</>} sortConfig={sortConfig} onSort={handleSort} align="right" />
                  <SortableHeader columnKey="status" label="상태" sortConfig={sortConfig} onSort={handleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {sortData(filteredData).map(item => (
                  <tr key={item.id} className="hover:bg-[var(--surface-50)] cursor-pointer">
                    <td className="px-4 py-3"><Link href={`/logis/rate/corporate/${item.id}`} className="text-blue-400 hover:underline">{item.contractNo}</Link></td>
                    <td className="px-4 py-3">{item.customerName}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${item.transportMode === 'SEA' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{item.transportMode}</span></td>
                    <td className="px-4 py-3">{item.carrier}</td>
                    <td className="px-4 py-3 text-sm">{item.pol} → {item.pod}</td>
                    <td className="px-4 py-3 text-sm">{item.containerType}</td>
                    <td className="px-4 py-3 text-sm">{item.validFrom} ~ {item.validTo}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.currency} {item.agreedRate.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-500">+{item.currency} {item.margin.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{item.currency} {item.sellingRate.toLocaleString()}</td>
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
