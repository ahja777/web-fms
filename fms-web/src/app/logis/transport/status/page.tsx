'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';
import { useSorting, SortableHeader, SortConfig } from '@/components/table/SortableTable';

interface TransportStatus {
  id: string;
  transportNo: string;
  vehicleNo: string;
  driverName: string;
  origin: string;
  destination: string;
  currentLocation: string;
  progress: number;
  eta: string;
  status: 'waiting' | 'loading' | 'in_transit' | 'unloading' | 'completed';
  lastUpdate: string;
}

interface SearchFilters {
  transportNo: string;
  vehicleNo: string;
  driverName: string;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  waiting: { label: '대기중', color: '#6B7280', bgColor: '#F3F4F6' },
  loading: { label: '상차중', color: '#EA580C', bgColor: '#FED7AA' },
  in_transit: { label: '운송중', color: '#2563EB', bgColor: '#DBEAFE' },
  unloading: { label: '하차중', color: '#7C3AED', bgColor: '#EDE9FE' },
  completed: { label: '완료', color: '#059669', bgColor: '#D1FAE5' },
};

const sampleData: TransportStatus[] = [
  { id: '1', transportNo: 'TM-2026-0001', vehicleNo: '12가 3456', driverName: '김운전', origin: '부산항 신항', destination: '수원 물류센터', currentLocation: '경부고속도로 안성JC 부근', progress: 75, eta: '14:30', status: 'in_transit', lastUpdate: '2026-01-16 12:45' },
  { id: '2', transportNo: 'TM-2026-0002', vehicleNo: '34나 5678', driverName: '이배송', origin: '인천공항', destination: '평택 물류센터', currentLocation: '서해안고속도로 평택IC', progress: 90, eta: '13:15', status: 'in_transit', lastUpdate: '2026-01-16 12:50' },
  { id: '3', transportNo: 'TM-2026-0003', vehicleNo: '56다 7890', driverName: '박물류', origin: '울산 공장', destination: '부산 신항', currentLocation: '울산 공장 상차장', progress: 15, eta: '15:00', status: 'loading', lastUpdate: '2026-01-16 12:30' },
  { id: '4', transportNo: 'TM-2026-0004', vehicleNo: '78라 1234', driverName: '최배달', origin: '서울 물류센터', destination: '대전 물류센터', currentLocation: '대전 물류센터', progress: 100, eta: '-', status: 'completed', lastUpdate: '2026-01-16 11:20' },
  { id: '5', transportNo: 'TM-2026-0005', vehicleNo: '90마 5678', driverName: '정기사', origin: '인천항', destination: '화성 물류센터', currentLocation: '인천항 대기장', progress: 0, eta: '16:00', status: 'waiting', lastUpdate: '2026-01-16 10:00' },
];

const initialFilters: SearchFilters = {
  transportNo: '',
  vehicleNo: '',
  driverName: '',
  status: '',
};

export default function TransportStatusPage() {
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

  const { sortConfig, handleSort, sortData } = useSorting<TransportStatus>();
  const [allData] = useState<TransportStatus[]>(sampleData);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(initialFilters);
  const [searchMessage, setSearchMessage] = useState<string>('');

  const filteredList = useMemo(() => {
    return allData.filter(item => {
      if (appliedFilters.transportNo && !item.transportNo.toLowerCase().includes(appliedFilters.transportNo.toLowerCase())) return false;
      if (appliedFilters.vehicleNo && !item.vehicleNo.toLowerCase().includes(appliedFilters.vehicleNo.toLowerCase())) return false;
      if (appliedFilters.driverName && !item.driverName.toLowerCase().includes(appliedFilters.driverName.toLowerCase())) return false;
      if (appliedFilters.status && item.status !== appliedFilters.status) return false;
      return true;
    });
  }, [allData, appliedFilters]);

  const summary = useMemo(() => ({
    waiting: filteredList.filter(s => s.status === 'waiting').length,
    loading: filteredList.filter(s => s.status === 'loading').length,
    in_transit: filteredList.filter(s => s.status === 'in_transit').length,
    unloading: filteredList.filter(s => s.status === 'unloading').length,
    completed: filteredList.filter(s => s.status === 'completed').length,
  }), [filteredList]);

  const handleSearch = () => {
    setAppliedFilters({ ...filters });
    setSearchMessage(`검색 완료: ${filteredList.length}건이 조회되었습니다.`);
    setTimeout(() => setSearchMessage(''), 3000);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setSearchMessage('검색 조건이 초기화되었습니다.');
    setTimeout(() => setSearchMessage(''), 3000);
  };

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header title="운송상태 정보조회" subtitle="운송의뢰관리  운송상태 정보조회" />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[var(--surface-100)] rounded-lg hover:bg-[var(--surface-200)]">새로고침</button>
          </div>

          {searchMessage && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg">{searchMessage}</div>
          )}

          {/* 실시간 현황 카드 */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: 'waiting' })); setAppliedFilters(prev => ({ ...prev, status: 'waiting' })); }}>
              <p className="text-2xl font-bold text-[#6B7280]">{summary.waiting}</p>
              <p className="text-sm text-[var(--muted)]">대기중</p>
            </div>
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: 'loading' })); setAppliedFilters(prev => ({ ...prev, status: 'loading' })); }}>
              <p className="text-2xl font-bold text-[#EA580C]">{summary.loading}</p>
              <p className="text-sm text-[var(--muted)]">상차중</p>
            </div>
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: 'in_transit' })); setAppliedFilters(prev => ({ ...prev, status: 'in_transit' })); }}>
              <p className="text-2xl font-bold text-[#2563EB]">{summary.in_transit}</p>
              <p className="text-sm text-[var(--muted)]">운송중</p>
            </div>
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: 'unloading' })); setAppliedFilters(prev => ({ ...prev, status: 'unloading' })); }}>
              <p className="text-2xl font-bold text-[#7C3AED]">{summary.unloading}</p>
              <p className="text-sm text-[var(--muted)]">하차중</p>
            </div>
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: 'completed' })); setAppliedFilters(prev => ({ ...prev, status: 'completed' })); }}>
              <p className="text-2xl font-bold text-[#059669]">{summary.completed}</p>
              <p className="text-sm text-[var(--muted)]">완료</p>
            </div>
          </div>

          {/* 검색조건 */}
          <div className="card mb-6">
            <div className="p-4 border-b border-[var(--border)]"><h3 className="font-bold">검색조건</h3></div>
            <div className="p-4 grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">운송번호</label>
                <input type="text" value={filters.transportNo} onChange={(e) => handleFilterChange('transportNo', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="TM-YYYY-XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">차량번호</label>
                <input type="text" value={filters.vehicleNo} onChange={(e) => handleFilterChange('vehicleNo', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="00가 0000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">기사명</label>
                <input type="text" value={filters.driverName} onChange={(e) => handleFilterChange('driverName', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="기사명" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">상태</label>
                <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">전체</option>
                  <option value="waiting">대기중</option>
                  <option value="loading">상차중</option>
                  <option value="in_transit">운송중</option>
                  <option value="unloading">하차중</option>
                  <option value="completed">완료</option>
                </select>
              </div>
            </div>
            <div className="p-4 flex justify-center gap-2">
              <button onClick={handleSearch} className="px-6 py-2 bg-[#1A2744] text-white rounded-lg hover:bg-[#2A3754]">조회</button>
              <button onClick={handleReset} className="px-6 py-2 bg-[var(--surface-100)] rounded-lg hover:bg-[var(--surface-200)]">초기화</button>
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b border-[var(--border)]"><h3 className="font-bold">운송현황 ({filteredList.length}건)</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--surface-100)]">
                  <tr>
                    <SortableHeader columnKey="transportNo" label={<>운송<br/>번호</>} sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader columnKey="vehicleNo" label={<>차량<br/>번호</>} sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader columnKey="driverName" label="기사명" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader columnKey="origin" label="출발지" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader columnKey="destination" label="도착지" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader columnKey="currentLocation" label={<>현재<br/>위치</>} sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader columnKey="progress" label="진행률" sortConfig={sortConfig} onSort={handleSort} align="center" />
                    <SortableHeader columnKey="eta" label="ETA" sortConfig={sortConfig} onSort={handleSort} align="center" />
                    <SortableHeader columnKey="status" label="상태" sortConfig={sortConfig} onSort={handleSort} align="center" />
                    <SortableHeader columnKey="lastUpdate" label={<>최종<br/>갱신</>} sortConfig={sortConfig} onSort={handleSort} align="center" />
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length === 0 ? (
                    <tr><td colSpan={10} className="p-8 text-center text-[var(--muted)]">조회된 데이터가 없습니다.</td></tr>
                  ) : (
                    sortData(filteredList).map((row) => (
                      <tr key={row.id} className="border-t border-[var(--border)] hover:bg-[var(--surface-50)]">
                        <td className="p-3 text-[#2563EB] font-medium">{row.transportNo}</td>
                        <td className="p-3 text-sm">{row.vehicleNo}</td>
                        <td className="p-3 text-sm">{row.driverName}</td>
                        <td className="p-3 text-sm">{row.origin}</td>
                        <td className="p-3 text-sm">{row.destination}</td>
                        <td className="p-3 text-sm">{row.currentLocation}</td>
                        <td className="p-3">
                          <div className="w-full bg-[var(--surface-200)] rounded-full h-2">
                            <div className={`h-2 rounded-full ${row.progress >= 100 ? 'bg-green-500' : row.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'}`} style={{ width: `${row.progress}%` }}></div>
                          </div>
                          <p className="text-xs text-center mt-1">{row.progress}%</p>
                        </td>
                        <td className="p-3 text-sm text-center font-medium">{row.eta}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-1 rounded-full text-xs" style={{ color: statusConfig[row.status].color, backgroundColor: statusConfig[row.status].bgColor }}>{statusConfig[row.status].label}</span>
                        </td>
                        <td className="p-3 text-sm text-center text-[var(--muted)]">{row.lastUpdate}</td>
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
