'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import EmailModal from '@/components/EmailModal';

// localStorage 키
const STORAGE_KEY = 'fms_quote_air_data';

interface AirQuoteData {
  id: string;
  quoteNo: string;
  quoteDate: string;
  requestNo: string;
  shipper: string;
  consignee: string;
  origin: string;
  destination: string;
  flightNo: string;
  weight: number;
  volume: number;
  commodity: string;
  validFrom: string;
  validTo: string;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'expired';
  airline: string;
}

interface SearchFilters {
  startDate: string;
  endDate: string;
  quoteNo: string;
  shipper: string;
  origin: string;
  destination: string;
  airline: string;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: '작성중', color: '#6B7280', bgColor: '#F3F4F6' },
  submitted: { label: '제출', color: '#2563EB', bgColor: '#DBEAFE' },
  approved: { label: '승인', color: '#059669', bgColor: '#D1FAE5' },
  rejected: { label: '반려', color: '#DC2626', bgColor: '#FEE2E2' },
  expired: { label: '만료', color: '#9CA3AF', bgColor: '#F3F4F6' },
};

const sampleData: AirQuoteData[] = [
  { id: '1', quoteNo: 'AQ-2026-0001', quoteDate: '2026-01-15', requestNo: 'QR-2026-0010', shipper: '삼성전자', consignee: 'Samsung America', origin: 'ICN (인천)', destination: 'JFK (뉴욕)', flightNo: 'KE081', weight: 500, volume: 3.5, commodity: '반도체', validFrom: '2026-01-15', validTo: '2026-01-30', totalAmount: 5500, currency: 'USD', status: 'approved', airline: 'KOREAN AIR' },
  { id: '2', quoteNo: 'AQ-2026-0002', quoteDate: '2026-01-14', requestNo: 'QR-2026-0011', shipper: 'SK하이닉스', consignee: 'SK Hynix America', origin: 'ICN (인천)', destination: 'SFO (샌프란시스코)', flightNo: 'OZ212', weight: 800, volume: 5.2, commodity: '메모리 칩', validFrom: '2026-01-14', validTo: '2026-01-29', totalAmount: 8200, currency: 'USD', status: 'submitted', airline: 'ASIANA' },
  { id: '3', quoteNo: 'AQ-2026-0003', quoteDate: '2026-01-13', requestNo: 'QR-2026-0012', shipper: 'LG전자', consignee: 'LG Electronics EU', origin: 'ICN (인천)', destination: 'FRA (프랑크푸르트)', flightNo: 'LH713', weight: 350, volume: 2.8, commodity: '디스플레이', validFrom: '2026-01-13', validTo: '2026-01-28', totalAmount: 4800, currency: 'USD', status: 'draft', airline: 'LUFTHANSA' },
  { id: '4', quoteNo: 'AQ-2026-0004', quoteDate: '2026-01-12', requestNo: 'QR-2026-0013', shipper: '현대자동차', consignee: 'Hyundai Motor EU', origin: 'ICN (인천)', destination: 'AMS (암스테르담)', flightNo: 'KE925', weight: 620, volume: 4.1, commodity: '자동차 부품', validFrom: '2026-01-12', validTo: '2026-01-27', totalAmount: 6800, currency: 'USD', status: 'rejected', airline: 'KOREAN AIR' },
  { id: '5', quoteNo: 'AQ-2026-0005', quoteDate: '2026-01-10', requestNo: 'QR-2026-0014', shipper: '포스코', consignee: 'POSCO Japan', origin: 'ICN (인천)', destination: 'NRT (도쿄)', flightNo: 'OZ102', weight: 1200, volume: 8.5, commodity: '철강 샘플', validFrom: '2026-01-10', validTo: '2026-01-20', totalAmount: 3200, currency: 'USD', status: 'expired', airline: 'ASIANA' },
];

const initialFilters: SearchFilters = {
  startDate: '',
  endDate: '',
  quoteNo: '',
  shipper: '',
  origin: '',
  destination: '',
  airline: '',
  status: '',
};

export default function QuoteAirPage() {
  const router = useRouter();
  const [allData, setAllData] = useState<AirQuoteData[]>(sampleData);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(initialFilters);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchMessage, setSearchMessage] = useState<string>('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTarget, setEmailTarget] = useState<AirQuoteData[]>([]);

  // localStorage에서 데이터 로드
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedData = JSON.parse(stored);
        const mergedData = [...sampleData, ...parsedData.filter((d: AirQuoteData) => !sampleData.find(s => s.id === d.id))];
        setAllData(mergedData);
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    }
  }, []);

  const filteredList = useMemo(() => {
    return allData.filter(item => {
      if (appliedFilters.quoteNo && !item.quoteNo.toLowerCase().includes(appliedFilters.quoteNo.toLowerCase())) return false;
      if (appliedFilters.shipper && !item.shipper.toLowerCase().includes(appliedFilters.shipper.toLowerCase())) return false;
      if (appliedFilters.origin && !item.origin.toLowerCase().includes(appliedFilters.origin.toLowerCase())) return false;
      if (appliedFilters.destination && !item.destination.toLowerCase().includes(appliedFilters.destination.toLowerCase())) return false;
      if (appliedFilters.airline && item.airline !== appliedFilters.airline) return false;
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
    approved: filteredList.filter(q => q.status === 'approved').length,
    totalAmount: filteredList.reduce((sum, q) => sum + q.totalAmount, 0),
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

  // 신규
  const handleNew = () => {
    router.push('/logis/quote/air/register');
  };

  // 수정
  const handleEdit = () => {
    if (selectedIds.size === 0) {
      alert('수정할 항목을 선택해주세요.');
      return;
    }
    if (selectedIds.size > 1) {
      alert('수정은 1건만 선택해주세요.');
      return;
    }
    const selectedId = Array.from(selectedIds)[0];
    router.push(`/logis/quote/air/register?quoteId=${selectedId}`);
  };

  // 삭제
  const handleDelete = () => {
    if (selectedIds.size === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }
    if (!confirm(`${selectedIds.size}건의 견적을 삭제하시겠습니까?`)) return;

    // localStorage에서 삭제
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedData = JSON.parse(stored);
        const remainingData = parsedData.filter((d: AirQuoteData) => !selectedIds.has(d.id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingData));
      } catch (e) {
        console.error('Failed to delete from storage:', e);
      }
    }

    // 화면에서 삭제
    setAllData(prev => prev.filter(item => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
    setSearchMessage(`${selectedIds.size}건이 삭제되었습니다.`);
    setTimeout(() => setSearchMessage(''), 3000);
  };

  // E-mail 발송
  const handleEmail = () => {
    if (selectedIds.size === 0) {
      alert('E-mail을 발송할 항목을 선택해주세요.');
      return;
    }
    const targets = allData.filter(item => selectedIds.has(item.id));
    setEmailTarget(targets);
    setShowEmailModal(true);
  };

  // 이메일 발송 처리
  const handleEmailSend = (emailData: any) => {
    console.log('이메일 발송:', emailData);
    console.log('대상 견적:', emailTarget.map(t => t.quoteNo));
    alert(`${emailTarget.length}건의 견적서가 이메일로 발송되었습니다.\n받는 사람: ${emailData.to.join(', ')}`);
    setSelectedIds(new Set());
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header title="견적관리 (항공)" subtitle="물류견적관리 > 견적관리 (항공)" />

        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-[var(--muted)]">화면 ID: UI-G-01-01-08</span>
            <div className="flex gap-2">
              {/* 신규 */}
              <button onClick={handleNew} className="px-4 py-2 bg-[#059669] text-white font-semibold rounded-lg hover:bg-[#047857] transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                신규
              </button>
              {/* 수정 */}
              <button onClick={handleEdit} className="px-4 py-2 bg-[#1A2744] text-white font-semibold rounded-lg hover:bg-[#243354] transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                수정
              </button>
              {/* 삭제 */}
              <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                삭제
              </button>
              {/* E-mail */}
              <button onClick={handleEmail} className="px-4 py-2 bg-[var(--surface-100)] text-[var(--foreground)] font-semibold rounded-lg hover:bg-[var(--surface-200)] transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                E-mail
              </button>
              {/* 초기화 */}
              <button onClick={handleReset} className="px-4 py-2 bg-[var(--surface-100)] text-[var(--foreground)] font-semibold rounded-lg hover:bg-[var(--surface-200)] transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                초기화
              </button>
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
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: 'approved' })); setAppliedFilters(prev => ({ ...prev, status: 'approved' })); }}>
              <p className="text-2xl font-bold text-[#059669]">{summary.approved}</p>
              <p className="text-sm text-[var(--muted)]">승인</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold">${summary.totalAmount.toLocaleString()}</p>
              <p className="text-sm text-[var(--muted)]">총 견적금액</p>
            </div>
          </div>

          {/* 검색 조건 */}
          <div className="card mb-6">
            <div className="p-4 border-b border-[var(--border)]">
              <h3 className="text-lg font-bold text-[var(--foreground)]">검색조건</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">견적일자</label>
                  <div className="flex items-center gap-2">
                    <input type="date" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <span>~</span>
                    <input type="date" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">견적번호</label>
                  <input type="text" value={filters.quoteNo} onChange={(e) => handleFilterChange('quoteNo', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="AQ-YYYY-XXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">상태</label>
                  <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">전체</option>
                    <option value="draft">작성중</option>
                    <option value="submitted">제출</option>
                    <option value="approved">승인</option>
                    <option value="rejected">반려</option>
                    <option value="expired">만료</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">화주</label>
                  <input type="text" value={filters.shipper} onChange={(e) => handleFilterChange('shipper', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="화주명" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">출발공항</label>
                  <input type="text" value={filters.origin} onChange={(e) => handleFilterChange('origin', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="공항코드/명" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">도착공항</label>
                  <input type="text" value={filters.destination} onChange={(e) => handleFilterChange('destination', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="공항코드/명" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">항공사</label>
                  <select value={filters.airline} onChange={(e) => handleFilterChange('airline', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">전체</option>
                    <option value="KOREAN AIR">대한항공</option>
                    <option value="ASIANA">아시아나</option>
                    <option value="LUFTHANSA">루프트한자</option>
                    <option value="EMIRATES">에미레이트</option>
                    <option value="CATHAY">캐세이퍼시픽</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-center gap-2">
                <button onClick={handleSearch} className="px-6 py-2 bg-[#1A2744] text-white rounded-lg hover:bg-[#243354]">조회</button>
                <button onClick={handleReset} className="px-6 py-2 bg-[var(--surface-100)] text-[var(--foreground)] rounded-lg hover:bg-[var(--surface-200)]">초기화</button>
              </div>
            </div>
          </div>

          {/* 조회 결과 */}
          <div className="card">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[var(--foreground)]">견적목록 ({filteredList.length}건)</h3>
              {selectedIds.size > 0 && <span className="text-sm text-blue-600">{selectedIds.size}건 선택됨</span>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--surface-100)]">
                  <tr>
                    <th className="w-10 p-3 text-center"><input type="checkbox" checked={filteredList.length > 0 && selectedIds.size === filteredList.length} onChange={handleSelectAll} /></th>
                    <th className="p-3 text-left text-sm font-medium">견적번호</th>
                    <th className="p-3 text-left text-sm font-medium">견적일자</th>
                    <th className="p-3 text-left text-sm font-medium">화주</th>
                    <th className="p-3 text-left text-sm font-medium">출발</th>
                    <th className="p-3 text-left text-sm font-medium">도착</th>
                    <th className="p-3 text-center text-sm font-medium">중량(kg)</th>
                    <th className="p-3 text-center text-sm font-medium">용적(CBM)</th>
                    <th className="p-3 text-left text-sm font-medium">항공사</th>
                    <th className="p-3 text-center text-sm font-medium">유효기간</th>
                    <th className="p-3 text-right text-sm font-medium">견적금액</th>
                    <th className="p-3 text-center text-sm font-medium">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length === 0 ? (
                    <tr><td colSpan={12} className="p-8 text-center text-[var(--muted)]">조회된 데이터가 없습니다.</td></tr>
                  ) : (
                    filteredList.map((row) => (
                      <tr key={row.id} className={`border-t border-[var(--border)] hover:bg-[var(--surface-50)] cursor-pointer ${selectedIds.has(row.id) ? 'bg-blue-50' : ''}`} onClick={() => handleRowSelect(row.id)}>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => handleRowSelect(row.id)} /></td>
                        <td className="p-3"><Link href={`/logis/quote/air/${row.id}`} className="text-[#2563EB] hover:underline font-medium">{row.quoteNo}</Link></td>
                        <td className="p-3 text-sm">{row.quoteDate}</td>
                        <td className="p-3 text-sm">{row.shipper}</td>
                        <td className="p-3 text-sm">{row.origin}</td>
                        <td className="p-3 text-sm">{row.destination}</td>
                        <td className="p-3 text-sm text-center">{row.weight.toLocaleString()}</td>
                        <td className="p-3 text-sm text-center">{row.volume}</td>
                        <td className="p-3 text-sm font-medium">{row.airline}</td>
                        <td className="p-3 text-sm text-center">{row.validFrom} ~ {row.validTo}</td>
                        <td className="p-3 text-sm text-right font-semibold">{row.totalAmount.toLocaleString()} {row.currency}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ color: statusConfig[row.status].color, backgroundColor: statusConfig[row.status].bgColor }}>
                            {statusConfig[row.status].label}
                          </span>
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

      {/* 이메일 모달 */}
      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSend={handleEmailSend}
        documentType="quote"
        documentNo={emailTarget.length > 0 ? emailTarget.map(t => t.quoteNo).join(', ') : ''}
        defaultSubject={emailTarget.length > 0 ? `[견적서] ${emailTarget.map(t => t.quoteNo).join(', ')} - 인터지스 물류` : ''}
      />
    </div>
  );
}
