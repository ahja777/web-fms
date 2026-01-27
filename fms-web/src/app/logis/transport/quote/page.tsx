'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';

interface TransportQuote {
  id: string;
  quoteNo: string;
  quoteDate: string;
  customerName: string;
  origin: string;
  destination: string;
  transportType: string;
  vehicleType: string;
  weight: number;
  amount: number;
  currency: string;
  validTo: string;
  status: 'draft' | 'submitted' | 'confirmed' | 'rejected';
}

interface SearchFilters {
  startDate: string;
  endDate: string;
  quoteNo: string;
  customerName: string;
  transportType: string;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: '작성중', color: '#6B7280', bgColor: '#F3F4F6' },
  submitted: { label: '제출', color: '#2563EB', bgColor: '#DBEAFE' },
  confirmed: { label: '확정', color: '#059669', bgColor: '#D1FAE5' },
  rejected: { label: '반려', color: '#DC2626', bgColor: '#FEE2E2' },
};

const sampleData: TransportQuote[] = [
  { id: '1', quoteNo: 'TQ-2026-0001', quoteDate: '2026-01-15', customerName: '삼성전자', origin: '부산항', destination: '수원물류센터', transportType: '내륙운송', vehicleType: '5톤트럭', weight: 5000, amount: 450000, currency: 'KRW', validTo: '2026-02-15', status: 'confirmed' },
  { id: '2', quoteNo: 'TQ-2026-0002', quoteDate: '2026-01-14', customerName: 'LG전자', origin: '인천공항', destination: '평택물류센터', transportType: '픽업', vehicleType: '11톤트럭', weight: 8000, amount: 680000, currency: 'KRW', validTo: '2026-02-14', status: 'submitted' },
  { id: '3', quoteNo: 'TQ-2026-0003', quoteDate: '2026-01-13', customerName: '현대자동차', origin: '울산공장', destination: '부산항', transportType: '셔틀', vehicleType: '25톤트럭', weight: 20000, amount: 950000, currency: 'KRW', validTo: '2026-02-13', status: 'draft' },
  { id: '4', quoteNo: 'TQ-2026-0004', quoteDate: '2026-01-12', customerName: 'SK하이닉스', origin: '이천공장', destination: '인천공항', transportType: '배송', vehicleType: '5톤트럭', weight: 3000, amount: 380000, currency: 'KRW', validTo: '2026-02-12', status: 'rejected' },
  { id: '5', quoteNo: 'TQ-2026-0005', quoteDate: '2026-01-11', customerName: '포스코', origin: '광양제철소', destination: '부산신항', transportType: '내륙운송', vehicleType: '25톤트럭', weight: 25000, amount: 1200000, currency: 'KRW', validTo: '2026-02-11', status: 'confirmed' },
];

const initialFilters: SearchFilters = {
  startDate: '',
  endDate: '',
  quoteNo: '',
  customerName: '',
  transportType: '',
  status: '',
};

export default function TransportQuotePage() {
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);

  // 화면닫기 핸들러
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

  const [allData] = useState<TransportQuote[]>(sampleData);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(initialFilters);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchMessage, setSearchMessage] = useState<string>('');

  const filteredList = useMemo(() => {
    return allData.filter(item => {
      if (appliedFilters.quoteNo && !item.quoteNo.toLowerCase().includes(appliedFilters.quoteNo.toLowerCase())) return false;
      if (appliedFilters.customerName && !item.customerName.toLowerCase().includes(appliedFilters.customerName.toLowerCase())) return false;
      if (appliedFilters.transportType && item.transportType !== appliedFilters.transportType) return false;
      if (appliedFilters.status && item.status !== appliedFilters.status) return false;
      if (appliedFilters.startDate && item.quoteDate < appliedFilters.startDate) return false;
      if (appliedFilters.endDate && item.quoteDate > appliedFilters.endDate) return false;
      return true;
    });
  }, [allData, appliedFilters]);

  const summary = useMemo(() => ({
    total: filteredList.length,
    draft: filteredList.filter(q => q.status === 'draft').length,
    submitted: filteredList.filter(q => q.status === 'submitted').length,
    confirmed: filteredList.filter(q => q.status === 'confirmed').length,
    totalAmount: filteredList.reduce((sum, q) => sum + q.amount, 0),
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
        <Header title="운송견적관리" subtitle="운송의뢰관리  운송견적관리" showCloseButton={false} />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[#E8A838] text-[#0C1222] font-semibold rounded-lg hover:bg-[#D4943A]">견적등록</button>
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
              <p className="text-sm text-[var(--muted)]">전체 견적</p>
            </div>
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: 'draft' })); setAppliedFilters(prev => ({ ...prev, status: 'draft' })); }}>
              <p className="text-2xl font-bold text-[#6B7280]">{summary.draft}</p>
              <p className="text-sm text-[var(--muted)]">작성중</p>
            </div>
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: 'submitted' })); setAppliedFilters(prev => ({ ...prev, status: 'submitted' })); }}>
              <p className="text-2xl font-bold text-[#2563EB]">{summary.submitted}</p>
              <p className="text-sm text-[var(--muted)]">제출</p>
            </div>
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: 'confirmed' })); setAppliedFilters(prev => ({ ...prev, status: 'confirmed' })); }}>
              <p className="text-2xl font-bold text-[#059669]">{summary.confirmed}</p>
              <p className="text-sm text-[var(--muted)]">확정</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold">{summary.totalAmount.toLocaleString()} 원</p>
              <p className="text-sm text-[var(--muted)]">총 견적금액</p>
            </div>
          </div>

          <div className="card mb-6">
            <div className="p-4 border-b border-[var(--border)]"><h3 className="font-bold">검색조건</h3></div>
            <div className="p-4 grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">견적일자</label>
                <div className="flex items-center gap-2">
                  <input type="date" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <span>~</span>
                  <input type="date" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">견적번호</label>
                <input type="text" value={filters.quoteNo} onChange={(e) => handleFilterChange('quoteNo', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="TQ-YYYY-XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">고객사</label>
                <input type="text" value={filters.customerName} onChange={(e) => handleFilterChange('customerName', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="고객사명" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">운송구분</label>
                <select value={filters.transportType} onChange={(e) => handleFilterChange('transportType', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">전체</option>
                  <option value="내륙운송">내륙운송</option>
                  <option value="픽업">픽업</option>
                  <option value="배송">배송</option>
                  <option value="셔틀">셔틀</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">상태</label>
                <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">전체</option>
                  <option value="draft">작성중</option>
                  <option value="submitted">제출</option>
                  <option value="confirmed">확정</option>
                  <option value="rejected">반려</option>
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
              <h3 className="font-bold">운송견적 목록 ({filteredList.length}건)</h3>
              {selectedIds.size > 0 && <span className="text-sm text-blue-600">{selectedIds.size}건 선택됨</span>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--surface-100)]">
                  <tr>
                    <th className="w-10 p-3"><input type="checkbox" checked={filteredList.length > 0 && selectedIds.size === filteredList.length} onChange={handleSelectAll} /></th>
                    <th className="p-3 text-left text-sm">견적번호</th>
                    <th className="p-3 text-left text-sm">견적일자</th>
                    <th className="p-3 text-left text-sm">고객사</th>
                    <th className="p-3 text-left text-sm">출발지</th>
                    <th className="p-3 text-left text-sm">도착지</th>
                    <th className="p-3 text-left text-sm">운송구분</th>
                    <th className="p-3 text-left text-sm">차량</th>
                    <th className="p-3 text-right text-sm">중량(kg)</th>
                    <th className="p-3 text-right text-sm">견적금액</th>
                    <th className="p-3 text-center text-sm">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length === 0 ? (
                    <tr><td colSpan={11} className="p-8 text-center text-[var(--muted)]">조회된 데이터가 없습니다.</td></tr>
                  ) : (
                    filteredList.map((row) => (
                      <tr key={row.id} className={`border-t border-[var(--border)] hover:bg-[var(--surface-50)] cursor-pointer ${selectedIds.has(row.id) ? 'bg-blue-50' : ''}`} onClick={() => handleRowSelect(row.id)}>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => handleRowSelect(row.id)} /></td>
                        <td className="p-3 text-[#2563EB] font-medium">{row.quoteNo}</td>
                        <td className="p-3 text-sm">{row.quoteDate}</td>
                        <td className="p-3 text-sm">{row.customerName}</td>
                        <td className="p-3 text-sm">{row.origin}</td>
                        <td className="p-3 text-sm">{row.destination}</td>
                        <td className="p-3 text-sm">{row.transportType}</td>
                        <td className="p-3 text-sm">{row.vehicleType}</td>
                        <td className="p-3 text-sm text-right">{row.weight.toLocaleString()}</td>
                        <td className="p-3 text-sm text-right font-semibold">{row.amount.toLocaleString()} {row.currency}</td>
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

      {/* 화면 닫기 확인 모달 */}
      <CloseConfirmModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleConfirmClose}
      />
    </div>
  );
}
