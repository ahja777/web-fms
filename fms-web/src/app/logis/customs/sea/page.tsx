'use client';

import { useRouter } from 'next/navigation';
import { LIST_PATHS } from '@/constants/paths';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import DateRangeButtons, { getToday } from '@/components/DateRangeButtons';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';

interface CustomsData {
  id: string;
  declarationNo: string;
  declarationType: string;
  declarationDate: string;
  brokerName: string;
  importerExporter: string;
  hsCode: string;
  goodsDesc: string;
  packageQty: number;
  grossWeight: string;
  declaredValue: string;
  currency: string;
  totalTax: string;
  status: string;
  clearanceDate: string | null;
}

// 정렬 설정 인터페이스
interface SortConfig {
  key: keyof CustomsData | null;
  direction: 'asc' | 'desc';
}

// 정렬 아이콘 컴포넌트
const SortIcon = ({ columnKey, sortConfig }: { columnKey: keyof CustomsData; sortConfig: SortConfig }) => {
  const isActive = sortConfig.key === columnKey;
  return (
    <span className="inline-flex flex-col ml-1 text-[10px] leading-none">
      <span style={{ color: isActive && sortConfig.direction === 'asc' ? '#E8A838' : '#9CA3AF' }}>&#9650;</span>
      <span style={{ color: isActive && sortConfig.direction === 'desc' ? '#E8A838' : '#9CA3AF' }}>&#9660;</span>
    </span>
  );
};

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '작성중', color: 'bg-gray-500' },
  SUBMITTED: { label: '신고완료', color: 'bg-blue-500' },
  ACCEPTED: { label: '수리', color: 'bg-green-500' },
  CLEARED: { label: '통관완료', color: 'bg-emerald-500' },
  REJECTED: { label: '반려', color: 'bg-red-500' },
};

export default function CustomsListPage() {
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const today = getToday();
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    declarationNo: '',
    declarationType: '',
    importerExporter: '',
    status: '',
  });
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [data, setData] = useState<CustomsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customs/sea');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch customs data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleSearch = () => setAppliedFilters(filters);
  const handleReset = () => {
    const resetFilters = { startDate: today, endDate: today, declarationNo: '', declarationType: '', importerExporter: '', status: '' };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const filteredData = data.filter(item => {
    if (appliedFilters.declarationNo && !item.declarationNo.toLowerCase().includes(appliedFilters.declarationNo.toLowerCase())) return false;
    if (appliedFilters.declarationType && item.declarationType !== appliedFilters.declarationType) return false;
    if (appliedFilters.importerExporter && !item.importerExporter.toLowerCase().includes(appliedFilters.importerExporter.toLowerCase())) return false;
    if (appliedFilters.status && item.status !== appliedFilters.status) return false;
    return true;
  });

  // 정렬된 데이터
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr, 'ko');
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // 정렬 핸들러
  const handleSort = (key: keyof CustomsData) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 정렬 가능한 헤더 컴포넌트
  const SortableHeader = ({ columnKey, children, className = '' }: { columnKey: keyof CustomsData; children: React.ReactNode; className?: string }) => (
    <th
      className={`px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-[var(--surface-200)] select-none ${className}`}
      onClick={() => handleSort(columnKey)}
    >
      <span className="inline-flex items-center">
        {children}
        <SortIcon columnKey={columnKey} sortConfig={sortConfig} />
      </span>
    </th>
  );

  const summaryStats = {
    total: filteredData.length,
    draft: filteredData.filter(d => d.status === 'DRAFT').length,
    submitted: filteredData.filter(d => d.status === 'SUBMITTED').length,
    accepted: filteredData.filter(d => d.status === 'ACCEPTED').length,
    cleared: filteredData.filter(d => d.status === 'CLEARED').length,
  };

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
        <Header title="통관 관리" subtitle="Logis > 통관 > 통관 관리 (해상)" showCloseButton={false} />
        <main ref={formRef} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Link href="/logis/customs/sea/register" className="px-6 py-2 font-semibold rounded-lg" style={{ background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)', color: '#0C1222' }}>
              신규 등록
            </Link>
          </div>

          <div className="card p-6 mb-6">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">신고 일자</label>
                <div className="flex gap-2 items-center">
                  <input type="date" value={filters.startDate} onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <span className="text-[var(--muted)]">~</span>
                  <input type="date" value={filters.endDate} onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <DateRangeButtons onRangeSelect={handleDateRangeSelect} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">신고번호</label>
                <input type="text" value={filters.declarationNo} onChange={e => setFilters(prev => ({ ...prev, declarationNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="ED2024-001234" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">구분</label>
                <select value={filters.declarationType} onChange={e => setFilters(prev => ({ ...prev, declarationType: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                  <option value="">전체</option>
                  <option value="EXPORT">수출</option>
                  <option value="IMPORT">수입</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">수출입자</label>
                <input type="text" value={filters.importerExporter} onChange={e => setFilters(prev => ({ ...prev, importerExporter: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="업체명" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">상태</label>
                <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                  <option value="">전체</option>
                  <option value="DRAFT">작성중</option>
                  <option value="SUBMITTED">신고완료</option>
                  <option value="ACCEPTED">수리</option>
                  <option value="CLEARED">통관완료</option>
                  <option value="REJECTED">반려</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button onClick={handleSearch} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">검색</button>
                <button onClick={handleReset} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">초기화</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="card p-4 text-center"><div className="text-2xl font-bold">{summaryStats.total}</div><div className="text-sm text-[var(--muted)]">전체</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-gray-500">{summaryStats.draft}</div><div className="text-sm text-[var(--muted)]">작성중</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-blue-500">{summaryStats.submitted}</div><div className="text-sm text-[var(--muted)]">신고완료</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-green-500">{summaryStats.accepted}</div><div className="text-sm text-[var(--muted)]">수리</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-emerald-500">{summaryStats.cleared}</div><div className="text-sm text-[var(--muted)]">통관완료</div></div>
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-[var(--muted)]">데이터를 불러오는 중...</div>
            ) : (
            <table className="w-full">
              <thead className="bg-[var(--surface-100)]">
                <tr>
                  <SortableHeader columnKey="declarationNo">신고<br/>번호</SortableHeader>
                  <SortableHeader columnKey="declarationDate">신고<br/>일자</SortableHeader>
                  <SortableHeader columnKey="declarationType">구분</SortableHeader>
                  <SortableHeader columnKey="importerExporter">수출<br/>입자</SortableHeader>
                  <SortableHeader columnKey="brokerName">관세사</SortableHeader>
                  <SortableHeader columnKey="hsCode">HS Code</SortableHeader>
                  <SortableHeader columnKey="goodsDesc">품명</SortableHeader>
                  <SortableHeader columnKey="packageQty">수량</SortableHeader>
                  <SortableHeader columnKey="declaredValue">신고<br/>금액</SortableHeader>
                  <SortableHeader columnKey="totalTax">총세액</SortableHeader>
                  <SortableHeader columnKey="status">상태</SortableHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {sortedData.length === 0 ? (
                  <tr><td colSpan={11} className="px-4 py-8 text-center text-[var(--muted)]">데이터가 없습니다.</td></tr>
                ) : (
                sortedData.map(item => (
                  <tr key={item.id} className="hover:bg-[var(--surface-50)] cursor-pointer">
                    <td className="px-4 py-3"><Link href={`/logis/customs/sea/${item.id}`} className="text-blue-400 hover:underline">{item.declarationNo}</Link></td>
                    <td className="px-4 py-3 text-sm">{item.declarationDate}</td>
                    <td className="px-4 py-3 text-sm">{item.declarationType === 'EXPORT' ? '수출' : '수입'}</td>
                    <td className="px-4 py-3 text-sm">{item.importerExporter}</td>
                    <td className="px-4 py-3 text-sm">{item.brokerName || '-'}</td>
                    <td className="px-4 py-3 text-sm">{item.hsCode}</td>
                    <td className="px-4 py-3 text-sm">{item.goodsDesc}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.packageQty?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.currency} {Number(item.declaredValue).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">{Number(item.totalTax) > 0 ? `${Number(item.totalTax).toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full text-white ${statusConfig[item.status]?.color || 'bg-gray-500'}`}>{statusConfig[item.status]?.label || item.status}</span></td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
            )}
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
