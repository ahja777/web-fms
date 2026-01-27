'use client';

import { useRouter } from 'next/navigation';
import { LIST_PATHS } from '@/constants/paths';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import DateRangeButtons, { getToday } from '@/components/DateRangeButtons';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';

interface ManifestData {
  id: string;
  mfNo: string;
  mfDate: string;
  mfType: string;
  blNo: string;
  vessel: string;
  voyage: string;
  pol: string;
  pod: string;
  etd: string;
  shipper: string;
  consignee: string;
  containerQty: number;
  grossWeight: number;
  ediStatus: string;
  status: string;
}

// 정렬 설정 인터페이스
interface SortConfig {
  key: keyof ManifestData | null;
  direction: 'asc' | 'desc';
}

// 정렬 아이콘 컴포넌트
const SortIcon = ({ columnKey, sortConfig }: { columnKey: keyof ManifestData; sortConfig: SortConfig }) => {
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
  READY: { label: '제출대기', color: 'bg-yellow-500' },
  SENT: { label: '전송완료', color: 'bg-blue-500' },
  ACCEPTED: { label: '수리', color: 'bg-green-500' },
  REJECTED: { label: '반려', color: 'bg-red-500' },
};

const ediStatusConfig: Record<string, { label: string; color: string }> = {
  NOT_SENT: { label: '미전송', color: 'text-gray-500' },
  SENDING: { label: '전송중', color: 'text-yellow-500' },
  SENT: { label: '전송완료', color: 'text-blue-500' },
  ERROR: { label: '전송오류', color: 'text-red-500' },
};

const defaultData: ManifestData[] = [
  { id: '1', mfNo: 'MF-2026-0001', mfDate: '2026-01-20', mfType: '수출', blNo: 'HDMU1234567', vessel: 'HMM GDANSK', voyage: '001E', pol: 'KRPUS', pod: 'USLAX', etd: '2026-01-22', shipper: '삼성전자', consignee: 'Samsung America', containerQty: 2, grossWeight: 18500, ediStatus: 'SENT', status: 'ACCEPTED' },
  { id: '2', mfNo: 'MF-2026-0002', mfDate: '2026-01-19', mfType: '수출', blNo: 'MAEU5678901', vessel: 'MAERSK EINDHOVEN', voyage: '002W', pol: 'KRPUS', pod: 'USNYC', etd: '2026-01-25', shipper: 'LG전자', consignee: 'LG Electronics USA', containerQty: 3, grossWeight: 22000, ediStatus: 'SENDING', status: 'SENT' },
  { id: '3', mfNo: 'MF-2026-0003', mfDate: '2026-01-18', mfType: '수출', blNo: 'MSCU2345678', vessel: 'MSC OSCAR', voyage: '003E', pol: 'KRPUS', pod: 'DEHAM', etd: '2026-01-28', shipper: '현대자동차', consignee: 'Hyundai Motor Germany', containerQty: 5, grossWeight: 45000, ediStatus: 'NOT_SENT', status: 'DRAFT' },
  { id: '4', mfNo: 'MF-2026-0004', mfDate: '2026-01-17', mfType: '수입', blNo: 'EGLV9012345', vessel: 'EVER GIVEN', voyage: '004W', pol: 'CNSHA', pod: 'KRPUS', etd: '2026-01-15', shipper: 'China Electronics', consignee: 'SK하이닉스', containerQty: 4, grossWeight: 32000, ediStatus: 'ERROR', status: 'REJECTED' },
];

export default function ManifestListPage() {
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const today = getToday();
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    mfNo: '',
    blNo: '',
    mfType: '',
    vessel: '',
    status: '',
  });
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [data, setData] = useState<ManifestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manifest/sea');
      if (response.ok) {
        const result = await response.json();
        if (Array.isArray(result) && result.length > 0) {
          const mappedData: ManifestData[] = result.map((item: Record<string, unknown>) => ({
            id: String(item.id || ''),
            mfNo: String(item.filingNo || item.id || ''),
            mfDate: String(item.filingDate || ''),
            mfType: '수출',
            blNo: String(item.mblNo || item.hblNo || ''),
            vessel: '-',
            voyage: '-',
            pol: 'KRPUS',
            pod: 'USLAX',
            etd: '-',
            shipper: String(item.shipperName || ''),
            consignee: String(item.consigneeName || ''),
            containerQty: 1,
            grossWeight: Number(item.weight) || 0,
            ediStatus: item.responseCode ? 'SENT' : 'NOT_SENT',
            status: String(item.status || 'DRAFT'),
          }));
          setData(mappedData);
        } else {
          setData(defaultData);
        }
      } else {
        setData(defaultData);
      }
    } catch (error) {
      console.error('적하목록 조회 오류:', error);
      setData(defaultData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleSearch = () => setAppliedFilters(filters);
  const handleReset = () => {
    const resetFilters = { startDate: today, endDate: today, mfNo: '', blNo: '', mfType: '', vessel: '', status: '' };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const filteredData = data.filter(item => {
    if (appliedFilters.mfNo && !item.mfNo.toLowerCase().includes(appliedFilters.mfNo.toLowerCase())) return false;
    if (appliedFilters.blNo && !item.blNo.toLowerCase().includes(appliedFilters.blNo.toLowerCase())) return false;
    if (appliedFilters.mfType && item.mfType !== appliedFilters.mfType) return false;
    if (appliedFilters.vessel && !item.vessel.toLowerCase().includes(appliedFilters.vessel.toLowerCase())) return false;
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
  const handleSort = (key: keyof ManifestData) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 정렬 가능한 헤더 컴포넌트
  const SortableHeader = ({ columnKey, children, className = '' }: { columnKey: keyof ManifestData; children: React.ReactNode; className?: string }) => (
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
    sent: filteredData.filter(d => d.status === 'SENT').length,
    accepted: filteredData.filter(d => d.status === 'ACCEPTED').length,
    rejected: filteredData.filter(d => d.status === 'REJECTED').length,
  };

  const handleSendEDI = (id: string) => {
    alert('적하목록 ID ' + id + '의 EDI를 전송합니다.');
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }
    if (!confirm('선택한 ' + selectedIds.length + '건을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch('/api/manifest/sea?ids=' + selectedIds.join(','), {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('삭제되었습니다.');
        setSelectedIds([]);
        fetchData();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredData.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
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
        <Header title="적하목록 관리" subtitle="Logis > 적하목록 > 적하목록 관리 (해상)" showCloseButton={false} />
        <main ref={formRef} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">삭제</button>
              <Link href="/logis/manifest/sea/register" className="px-6 py-2 font-semibold rounded-lg" style={{ background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)', color: '#0C1222' }}>
                신규 등록
              </Link>
            </div>
          </div>

          <div className="card p-6 mb-6">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">적하목록 일자</label>
                <div className="flex gap-2 items-center">
                  <input type="date" value={filters.startDate} onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <span className="text-[var(--muted)]">~</span>
                  <input type="date" value={filters.endDate} onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <DateRangeButtons onRangeSelect={handleDateRangeSelect} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">적하목록 번호</label>
                <input type="text" value={filters.mfNo} onChange={e => setFilters(prev => ({ ...prev, mfNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="MF-YYYY-XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">B/L 번호</label>
                <input type="text" value={filters.blNo} onChange={e => setFilters(prev => ({ ...prev, blNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="HDMU1234567" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">구분</label>
                <select value={filters.mfType} onChange={e => setFilters(prev => ({ ...prev, mfType: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                  <option value="">전체</option>
                  <option value="수출">수출</option>
                  <option value="수입">수입</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">선명</label>
                <input type="text" value={filters.vessel} onChange={e => setFilters(prev => ({ ...prev, vessel: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="선박명" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">상태</label>
                <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                  <option value="">전체</option>
                  <option value="DRAFT">작성중</option>
                  <option value="READY">제출대기</option>
                  <option value="SENT">전송완료</option>
                  <option value="ACCEPTED">수리</option>
                  <option value="REJECTED">반려</option>
                </select>
              </div>
              <div className="col-span-2 flex items-end gap-2">
                <button onClick={handleSearch} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">검색</button>
                <button onClick={handleReset} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">초기화</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="card p-4 text-center"><div className="text-2xl font-bold">{summaryStats.total}</div><div className="text-sm text-[var(--muted)]">전체</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-gray-500">{summaryStats.draft}</div><div className="text-sm text-[var(--muted)]">작성중</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-blue-500">{summaryStats.sent}</div><div className="text-sm text-[var(--muted)]">전송완료</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-green-500">{summaryStats.accepted}</div><div className="text-sm text-[var(--muted)]">수리</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-red-500">{summaryStats.rejected}</div><div className="text-sm text-[var(--muted)]">반려</div></div>
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-[var(--muted)]">데이터를 불러오는 중...</div>
            ) : (
              <table className="w-full">
                <thead className="bg-[var(--surface-100)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      <input type="checkbox" checked={selectedIds.length === sortedData.length && sortedData.length > 0} onChange={e => handleSelectAll(e.target.checked)} className="w-4 h-4" />
                    </th>
                    <SortableHeader columnKey="mfNo">적하목록번호</SortableHeader>
                    <SortableHeader columnKey="mfDate">일자</SortableHeader>
                    <SortableHeader columnKey="mfType">구분</SortableHeader>
                    <SortableHeader columnKey="blNo">B/L 번호</SortableHeader>
                    <SortableHeader columnKey="vessel">선명/항차</SortableHeader>
                    <SortableHeader columnKey="pol">POL/POD</SortableHeader>
                    <SortableHeader columnKey="shipper">화주</SortableHeader>
                    <SortableHeader columnKey="containerQty">컨테이너</SortableHeader>
                    <SortableHeader columnKey="grossWeight">중량(KG)</SortableHeader>
                    <SortableHeader columnKey="ediStatus">EDI</SortableHeader>
                    <SortableHeader columnKey="status">상태</SortableHeader>
                    <th className="px-4 py-3 text-left text-sm font-medium">전송</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {sortedData.map(item => (
                    <tr key={item.id} className="hover:bg-[var(--surface-50)] cursor-pointer">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={e => handleSelectOne(item.id, e.target.checked)} className="w-4 h-4" />
                      </td>
                      <td className="px-4 py-3"><Link href={'/logis/manifest/sea/' + item.id} className="text-blue-400 hover:underline">{item.mfNo}</Link></td>
                      <td className="px-4 py-3 text-sm">{item.mfDate}</td>
                      <td className="px-4 py-3 text-sm">{item.mfType}</td>
                      <td className="px-4 py-3 text-sm">{item.blNo}</td>
                      <td className="px-4 py-3 text-sm">{item.vessel}<br /><span className="text-[var(--muted)]">{item.voyage}</span></td>
                      <td className="px-4 py-3 text-sm">{item.pol} → {item.pod}</td>
                      <td className="px-4 py-3 text-sm">{item.shipper}</td>
                      <td className="px-4 py-3 text-sm">{item.containerQty}</td>
                      <td className="px-4 py-3 text-sm">{item.grossWeight.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm"><span className={ediStatusConfig[item.ediStatus]?.color || 'text-gray-500'}>{ediStatusConfig[item.ediStatus]?.label || '-'}</span></td>
                      <td className="px-4 py-3"><span className={'px-2 py-1 text-xs rounded-full text-white ' + (statusConfig[item.status]?.color || 'bg-gray-500')}>{statusConfig[item.status]?.label || item.status}</span></td>
                      <td className="px-4 py-3">
                        {(item.status === 'DRAFT' || item.status === 'READY' || item.status === 'REJECTED') && (
                          <button onClick={() => handleSendEDI(item.id)} className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">EDI전송</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      <CloseConfirmModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleConfirmClose}
      />
    </div>
  );
}
