'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

interface AirBooking {
  id: string;
  bookingNo: string;
  bookingDate: string;
  shipper: string;
  consignee: string;
  airline: string;
  flightNo: string;
  origin: string;
  destination: string;
  etd: string;
  eta: string;
  pieces: number;
  weight: number;
  volume: number;
  commodity: string;
  status: 'draft' | 'requested' | 'confirmed' | 'rejected' | 'cancelled';
}

interface SearchFilters {
  startDate: string;
  endDate: string;
  bookingNo: string;
  shipper: string;
  airline: string;
  origin: string;
  destination: string;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: '작성중', color: '#6B7280', bgColor: '#F3F4F6' },
  requested: { label: '요청', color: '#2563EB', bgColor: '#DBEAFE' },
  confirmed: { label: '예약확정', color: '#059669', bgColor: '#D1FAE5' },
  rejected: { label: '거절', color: '#DC2626', bgColor: '#FEE2E2' },
  cancelled: { label: '취소', color: '#9CA3AF', bgColor: '#F3F4F6' },
};

const sampleData: AirBooking[] = [
  { id: '1', bookingNo: 'AB-2026-0001', bookingDate: '2026-01-15', shipper: '삼성전자', consignee: 'Samsung America', airline: 'KOREAN AIR', flightNo: 'KE081', origin: 'ICN (인천)', destination: 'JFK (뉴욕)', etd: '2026-01-18', eta: '2026-01-18', pieces: 50, weight: 500, volume: 3.5, commodity: '반도체', status: 'confirmed' },
  { id: '2', bookingNo: 'AB-2026-0002', bookingDate: '2026-01-14', shipper: 'SK하이닉스', consignee: 'SK Hynix America', airline: 'ASIANA', flightNo: 'OZ212', origin: 'ICN (인천)', destination: 'SFO (샌프란시스코)', etd: '2026-01-17', eta: '2026-01-17', pieces: 80, weight: 800, volume: 5.2, commodity: '메모리', status: 'requested' },
  { id: '3', bookingNo: 'AB-2026-0003', bookingDate: '2026-01-13', shipper: 'LG디스플레이', consignee: 'LG Display EU', airline: 'LUFTHANSA', flightNo: 'LH713', origin: 'ICN (인천)', destination: 'FRA (프랑크푸르트)', etd: '2026-01-19', eta: '2026-01-19', pieces: 35, weight: 350, volume: 2.8, commodity: '디스플레이', status: 'draft' },
  { id: '4', bookingNo: 'AB-2026-0004', bookingDate: '2026-01-12', shipper: '현대자동차', consignee: 'Hyundai EU', airline: 'EMIRATES', flightNo: 'EK327', origin: 'ICN (인천)', destination: 'DXB (두바이)', etd: '2026-01-20', eta: '2026-01-20', pieces: 60, weight: 620, volume: 4.5, commodity: '자동차 부품', status: 'rejected' },
  { id: '5', bookingNo: 'AB-2026-0005', bookingDate: '2026-01-11', shipper: '포스코', consignee: 'POSCO Japan', airline: 'KOREAN AIR', flightNo: 'KE705', origin: 'ICN (인천)', destination: 'NRT (나리타)', etd: '2026-01-16', eta: '2026-01-16', pieces: 25, weight: 300, volume: 2.0, commodity: '철강 샘플', status: 'confirmed' },
];

const initialFilters: SearchFilters = {
  startDate: '',
  endDate: '',
  bookingNo: '',
  shipper: '',
  airline: '',
  origin: '',
  destination: '',
  status: '',
};

export default function BookingAirPage() {
  const router = useRouter();
  const [allData] = useState<AirBooking[]>(sampleData);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(initialFilters);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchMessage, setSearchMessage] = useState<string>('');

  const filteredList = useMemo(() => {
    return allData.filter(item => {
      if (appliedFilters.bookingNo && !item.bookingNo.toLowerCase().includes(appliedFilters.bookingNo.toLowerCase())) return false;
      if (appliedFilters.shipper && !item.shipper.toLowerCase().includes(appliedFilters.shipper.toLowerCase())) return false;
      if (appliedFilters.airline && item.airline !== appliedFilters.airline) return false;
      if (appliedFilters.origin && !item.origin.toLowerCase().includes(appliedFilters.origin.toLowerCase())) return false;
      if (appliedFilters.destination && !item.destination.toLowerCase().includes(appliedFilters.destination.toLowerCase())) return false;
      if (appliedFilters.status && item.status !== appliedFilters.status) return false;
      if (appliedFilters.startDate && item.bookingDate < appliedFilters.startDate) return false;
      if (appliedFilters.endDate && item.bookingDate > appliedFilters.endDate) return false;
      return true;
    });
  }, [allData, appliedFilters]);

  const summary = useMemo(() => ({
    total: filteredList.length,
    draft: filteredList.filter(b => b.status === 'draft').length,
    requested: filteredList.filter(b => b.status === 'requested').length,
    confirmed: filteredList.filter(b => b.status === 'confirmed').length,
    totalWeight: filteredList.reduce((sum, b) => sum + b.weight, 0),
  }), [filteredList]);

  const handleSearch = () => {
    setAppliedFilters({ ...filters });
    setSelectedIds(new Set());
    setSearchMessage(`검색 완료: ${filteredList.length}건이 조회되었습니다.`);
    setTimeout(() => setSearchMessage(''), 3000);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setSelectedIds(new Set());
    setSearchMessage('검색 조건이 초기화되었습니다.');
    setTimeout(() => setSearchMessage(''), 3000);
  };

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleRowSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredList.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredList.map(item => item.id)));
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header title="선적부킹관리 (항공)" subtitle="견적/부킹관리 > 선적부킹관리 (항공)" />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-[var(--muted)]">화면 ID: UI-G-01-03-04</span>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/logis/booking/air/register')}
                className="px-4 py-2 bg-[#E8A838] text-[#0C1222] font-semibold rounded-lg hover:bg-[#D4943A]"
              >
                예약등록
              </button>
              <button
                onClick={() => router.push('/logis/booking/air/multi-register')}
                className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9]"
              >
                멀티예약
              </button>
              <button onClick={() => alert(`Excel 다운로드: ${selectedIds.size > 0 ? selectedIds.size : filteredList.length}건`)} className="px-4 py-2 bg-[var(--surface-100)] rounded-lg hover:bg-[var(--surface-200)]">Excel</button>
            </div>
          </div>

          {searchMessage && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg">{searchMessage}</div>
          )}

          {/* 현황 카드 */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: '' })); setAppliedFilters(prev => ({ ...prev, status: '' })); }}>
              <p className="text-2xl font-bold">{summary.total}</p>
              <p className="text-sm text-[var(--muted)]">전체 예약</p>
            </div>
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: 'draft' })); setAppliedFilters(prev => ({ ...prev, status: 'draft' })); }}>
              <p className="text-2xl font-bold text-[#6B7280]">{summary.draft}</p>
              <p className="text-sm text-[var(--muted)]">작성중</p>
            </div>
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: 'requested' })); setAppliedFilters(prev => ({ ...prev, status: 'requested' })); }}>
              <p className="text-2xl font-bold text-[#2563EB]">{summary.requested}</p>
              <p className="text-sm text-[var(--muted)]">요청</p>
            </div>
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: 'confirmed' })); setAppliedFilters(prev => ({ ...prev, status: 'confirmed' })); }}>
              <p className="text-2xl font-bold text-[#059669]">{summary.confirmed}</p>
              <p className="text-sm text-[var(--muted)]">예약확정</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold">{summary.totalWeight.toLocaleString()} kg</p>
              <p className="text-sm text-[var(--muted)]">총 중량</p>
            </div>
          </div>

          <div className="card mb-6">
            <div className="p-4 border-b border-[var(--border)]"><h3 className="font-bold">검색조건</h3></div>
            <div className="p-4 grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">예약일자</label>
                <div className="flex items-center gap-2">
                  <input type="date" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <span>~</span>
                  <input type="date" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">예약번호</label>
                <input type="text" value={filters.bookingNo} onChange={(e) => handleFilterChange('bookingNo', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="AB-YYYY-XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">항공사</label>
                <select value={filters.airline} onChange={(e) => handleFilterChange('airline', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">전체</option>
                  <option value="KOREAN AIR">대한항공</option>
                  <option value="ASIANA">아시아나</option>
                  <option value="LUFTHANSA">루프트한자</option>
                  <option value="EMIRATES">에미레이트</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">화주</label>
                <input type="text" value={filters.shipper} onChange={(e) => handleFilterChange('shipper', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="화주명" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">출발공항</label>
                <input type="text" value={filters.origin} onChange={(e) => handleFilterChange('origin', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="공항코드" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">도착공항</label>
                <input type="text" value={filters.destination} onChange={(e) => handleFilterChange('destination', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="공항코드" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">상태</label>
                <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">전체</option>
                  <option value="draft">작성중</option>
                  <option value="requested">요청</option>
                  <option value="confirmed">예약확정</option>
                  <option value="rejected">거절</option>
                  <option value="cancelled">취소</option>
                </select>
              </div>
            </div>
            <div className="p-4 flex justify-center gap-2">
              <button onClick={handleSearch} className="px-6 py-2 bg-[#1A2744] text-white rounded-lg hover:bg-[#2A3754]">조회</button>
              <button onClick={handleReset} className="px-6 py-2 bg-[var(--surface-100)] rounded-lg hover:bg-[var(--surface-200)]">초기화</button>
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="font-bold">예약목록 ({filteredList.length}건)</h3>
              {selectedIds.size > 0 && <span className="text-sm text-blue-600">{selectedIds.size}건 선택됨</span>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--surface-100)]">
                  <tr>
                    <th className="w-10 p-3"><input type="checkbox" checked={filteredList.length > 0 && selectedIds.size === filteredList.length} onChange={handleSelectAll} /></th>
                    <th className="p-3 text-left text-sm">예약번호</th>
                    <th className="p-3 text-left text-sm">예약일자</th>
                    <th className="p-3 text-left text-sm">화주</th>
                    <th className="p-3 text-left text-sm">항공사</th>
                    <th className="p-3 text-left text-sm">편명</th>
                    <th className="p-3 text-left text-sm">출발</th>
                    <th className="p-3 text-left text-sm">도착</th>
                    <th className="p-3 text-center text-sm">ETD</th>
                    <th className="p-3 text-center text-sm">PCS</th>
                    <th className="p-3 text-right text-sm">중량(kg)</th>
                    <th className="p-3 text-center text-sm">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length === 0 ? (
                    <tr><td colSpan={12} className="p-8 text-center text-[var(--muted)]">조회된 데이터가 없습니다.</td></tr>
                  ) : (
                    filteredList.map((row) => (
                      <tr key={row.id} className={`border-t border-[var(--border)] hover:bg-[var(--surface-50)] cursor-pointer ${selectedIds.has(row.id) ? 'bg-blue-50' : ''}`} onClick={() => handleRowSelect(row.id)}>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => handleRowSelect(row.id)} /></td>
                        <td className="p-3 text-[#2563EB] font-medium">{row.bookingNo}</td>
                        <td className="p-3 text-sm">{row.bookingDate}</td>
                        <td className="p-3 text-sm">{row.shipper}</td>
                        <td className="p-3 text-sm font-medium">{row.airline}</td>
                        <td className="p-3 text-sm">{row.flightNo}</td>
                        <td className="p-3 text-sm">{row.origin}</td>
                        <td className="p-3 text-sm">{row.destination}</td>
                        <td className="p-3 text-sm text-center">{row.etd}</td>
                        <td className="p-3 text-sm text-center">{row.pieces}</td>
                        <td className="p-3 text-sm text-right">{row.weight.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-1 rounded-full text-xs" style={{ color: statusConfig[row.status].color, backgroundColor: statusConfig[row.status].bgColor }}>{statusConfig[row.status].label}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
