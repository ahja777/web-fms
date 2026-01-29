'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { LIST_PATHS } from '@/constants/paths';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';
import { useSorting, SortableHeader, SortConfig } from '@/components/table/SortableTable';

interface TransportManage {
  id: string;
  transportNo: string;
  requestNo: string;
  driverName: string;
  driverPhone: string;
  vehicleNo: string;
  vehicleType: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: 'waiting' | 'departed' | 'arrived' | 'completed';
  gpsLat: number;
  gpsLng: number;
}

interface SearchFilters {
  startDate: string;
  endDate: string;
  transportNo: string;
  driverName: string;
  vehicleNo: string;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  waiting: { label: '대기', color: '#6B7280', bgColor: '#F3F4F6' },
  departed: { label: '출발', color: '#2563EB', bgColor: '#DBEAFE' },
  arrived: { label: '도착', color: '#7C3AED', bgColor: '#EDE9FE' },
  completed: { label: '완료', color: '#059669', bgColor: '#D1FAE5' },
};

const sampleData: TransportManage[] = [
  { id: '1', transportNo: 'TM-2026-0001', requestNo: 'TR-2026-0001', driverName: '김운전', driverPhone: '010-1234-5678', vehicleNo: '12가 3456', vehicleType: '5톤 윙바디', origin: '부산항 신항', destination: '수원 물류센터', departureTime: '2026-01-16 08:00', arrivalTime: '2026-01-16 14:30', status: 'completed', gpsLat: 37.2636, gpsLng: 127.0286 },
  { id: '2', transportNo: 'TM-2026-0002', requestNo: 'TR-2026-0002', driverName: '이배송', driverPhone: '010-2345-6789', vehicleNo: '34나 5678', vehicleType: '11톤 카고', origin: '인천공항', destination: '평택 물류센터', departureTime: '2026-01-16 09:30', arrivalTime: '', status: 'departed', gpsLat: 37.0324, gpsLng: 127.0716 },
  { id: '3', transportNo: 'TM-2026-0003', requestNo: 'TR-2026-0003', driverName: '박물류', driverPhone: '010-3456-7890', vehicleNo: '56다 7890', vehicleType: '25톤 트레일러', origin: '울산 공장', destination: '부산 신항', departureTime: '', arrivalTime: '', status: 'waiting', gpsLat: 35.5384, gpsLng: 129.3114 },
  { id: '4', transportNo: 'TM-2026-0004', requestNo: 'TR-2026-0004', driverName: '최배달', driverPhone: '010-4567-8901', vehicleNo: '78라 1234', vehicleType: '5톤 탑차', origin: '인천공항', destination: '이천 물류센터', departureTime: '2026-01-16 10:00', arrivalTime: '2026-01-16 12:30', status: 'arrived', gpsLat: 37.2795, gpsLng: 127.4428 },
];

const initialFilters: SearchFilters = {
  startDate: '',
  endDate: '',
  transportNo: '',
  driverName: '',
  vehicleNo: '',
  status: '',
};

export default function TransportManagePage() {
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);

  // 화면닫기 핸들러
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

  const { sortConfig, handleSort, sortData } = useSorting<TransportManage>();
  const [allData] = useState<TransportManage[]>(sampleData);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(initialFilters);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchMessage, setSearchMessage] = useState<string>('');

  const filteredList = useMemo(() => {
    return allData.filter(item => {
      if (appliedFilters.transportNo && !item.transportNo.toLowerCase().includes(appliedFilters.transportNo.toLowerCase())) return false;
      if (appliedFilters.driverName && !item.driverName.toLowerCase().includes(appliedFilters.driverName.toLowerCase())) return false;
      if (appliedFilters.vehicleNo && !item.vehicleNo.toLowerCase().includes(appliedFilters.vehicleNo.toLowerCase())) return false;
      if (appliedFilters.status && item.status !== appliedFilters.status) return false;
      return true;
    });
  }, [allData, appliedFilters]);

  const summary = useMemo(() => ({
    total: filteredList.length,
    waiting: filteredList.filter(t => t.status === 'waiting').length,
    departed: filteredList.filter(t => t.status === 'departed').length,
    arrived: filteredList.filter(t => t.status === 'arrived').length,
    completed: filteredList.filter(t => t.status === 'completed').length,
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
        <Header title="운송관리 조회" subtitle="운송의뢰관리  운송관리 조회" showCloseButton={false} />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => alert(`Excel 다운로드: ${selectedIds.size > 0 ? selectedIds.size : filteredList.length}건`)} className="px-4 py-2 bg-[var(--surface-100)] rounded-lg hover:bg-[var(--surface-200)]">Excel</button>
          </div>

          {searchMessage && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg">{searchMessage}</div>
          )}

          {/* 현황 카드 */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: '' })); setAppliedFilters(prev => ({ ...prev, status: '' })); }}>
              <p className="text-2xl font-bold">{summary.total}</p>
              <p className="text-sm text-[var(--muted)]">전체</p>
            </div>
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: 'waiting' })); setAppliedFilters(prev => ({ ...prev, status: 'waiting' })); }}>
              <p className="text-2xl font-bold text-[#6B7280]">{summary.waiting}</p>
              <p className="text-sm text-[var(--muted)]">대기</p>
            </div>
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: 'departed' })); setAppliedFilters(prev => ({ ...prev, status: 'departed' })); }}>
              <p className="text-2xl font-bold text-[#2563EB]">{summary.departed}</p>
              <p className="text-sm text-[var(--muted)]">출발</p>
            </div>
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: 'arrived' })); setAppliedFilters(prev => ({ ...prev, status: 'arrived' })); }}>
              <p className="text-2xl font-bold text-[#7C3AED]">{summary.arrived}</p>
              <p className="text-sm text-[var(--muted)]">도착</p>
            </div>
            <div className="card p-4 text-center cursor-pointer hover:shadow-lg" onClick={() => { setFilters(prev => ({ ...prev, status: 'completed' })); setAppliedFilters(prev => ({ ...prev, status: 'completed' })); }}>
              <p className="text-2xl font-bold text-[#059669]">{summary.completed}</p>
              <p className="text-sm text-[var(--muted)]">완료</p>
            </div>
          </div>

          <div className="card mb-6">
            <div className="p-4 border-b border-[var(--border)]"><h3 className="font-bold">검색조건</h3></div>
            <div className="p-4 grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">운송일자</label>
                <div className="flex items-center gap-2">
                  <input type="date" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <span>~</span>
                  <input type="date" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">운송번호</label>
                <input type="text" value={filters.transportNo} onChange={(e) => handleFilterChange('transportNo', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="TM-YYYY-XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">기사명</label>
                <input type="text" value={filters.driverName} onChange={(e) => handleFilterChange('driverName', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="기사명" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">차량번호</label>
                <input type="text" value={filters.vehicleNo} onChange={(e) => handleFilterChange('vehicleNo', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="00가 0000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">상태</label>
                <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">전체</option>
                  <option value="waiting">대기</option>
                  <option value="departed">출발</option>
                  <option value="arrived">도착</option>
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
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="font-bold">운송관리 목록 ({filteredList.length}건)</h3>
              {selectedIds.size > 0 && <span className="text-sm text-blue-600">{selectedIds.size}건 선택됨</span>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--surface-100)]">
                  <tr>
                    <th className="w-10 p-3"><input type="checkbox" checked={filteredList.length > 0 && selectedIds.size === filteredList.length} onChange={handleSelectAll} /></th>
                    <SortableHeader columnKey="transportNo" label={<>운송<br/>번호</>} sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader columnKey="requestNo" label={<>요청<br/>번호</>} sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader columnKey="driverName" label="기사명" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader columnKey="driverPhone" label="연락처" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader columnKey="vehicleNo" label={<>차량<br/>번호</>} sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader columnKey="vehicleType" label={<>차량<br/>종류</>} sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader columnKey="origin" label="출발지" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader columnKey="destination" label="도착지" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader columnKey="departureTime" label={<>출발<br/>시간</>} sortConfig={sortConfig} onSort={handleSort} align="center" />
                    <SortableHeader columnKey="arrivalTime" label={<>도착<br/>시간</>} sortConfig={sortConfig} onSort={handleSort} align="center" />
                    <SortableHeader columnKey="status" label="상태" sortConfig={sortConfig} onSort={handleSort} align="center" />
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length === 0 ? (
                    <tr><td colSpan={12} className="p-8 text-center text-[var(--muted)]">조회된 데이터가 없습니다.</td></tr>
                  ) : (
                    sortData(filteredList).map((row) => (
                      <tr key={row.id} className={`border-t border-[var(--border)] hover:bg-[var(--surface-50)] cursor-pointer ${selectedIds.has(row.id) ? 'bg-blue-50' : ''}`} onClick={() => handleRowSelect(row.id)}>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => handleRowSelect(row.id)} /></td>
                        <td className="p-3 text-[#2563EB] font-medium">{row.transportNo}</td>
                        <td className="p-3 text-sm">{row.requestNo}</td>
                        <td className="p-3 text-sm">{row.driverName}</td>
                        <td className="p-3 text-sm">{row.driverPhone}</td>
                        <td className="p-3 text-sm">{row.vehicleNo}</td>
                        <td className="p-3 text-sm">{row.vehicleType}</td>
                        <td className="p-3 text-sm">{row.origin}</td>
                        <td className="p-3 text-sm">{row.destination}</td>
                        <td className="p-3 text-sm text-center">{row.departureTime || '-'}</td>
                        <td className="p-3 text-sm text-center">{row.arrivalTime || '-'}</td>
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
