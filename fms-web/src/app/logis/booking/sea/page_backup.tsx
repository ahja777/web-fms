'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import SeaBookingModal, { SeaBookingData } from '@/components/booking/SeaBookingModal';
import SeaBookingDetailPanel, { SeaBookingDetail } from '@/components/booking/SeaBookingDetailPanel';
import SRSendModal from '@/components/booking/SRSendModal';

interface SeaBooking extends SeaBookingDetail {}

interface SearchFilters {
  startDate: string;
  endDate: string;
  bookingNo: string;
  shipper: string;
  carrier: string;
  pol: string;
  pod: string;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: '작성중', color: '#6B7280', bgColor: '#F3F4F6' },
  requested: { label: 'B/R 요청', color: '#2563EB', bgColor: '#DBEAFE' },
  confirmed: { label: 'B/C 완료', color: '#059669', bgColor: '#D1FAE5' },
  rejected: { label: '거절', color: '#DC2626', bgColor: '#FEE2E2' },
  cancelled: { label: '취소', color: '#9CA3AF', bgColor: '#F3F4F6' },
};

const initialSampleData: SeaBooking[] = [
  { id: '1', bookingNo: 'SB-2026-0001', bookingDate: '2026-01-15', shipper: '삼성전자', shipperContact: '02-1234-5678', consignee: 'Samsung America Inc.', consigneeContact: '+1-123-456-7890', notifyParty: 'Same as Consignee', carrier: 'MAERSK', vessel: 'MAERSK EINDHOVEN', voyage: '001E', pol: 'KRPUS', pod: 'USLAX', finalDest: 'Los Angeles, CA', etd: '2026-01-20', eta: '2026-02-05', containerType: '40HC', containerQty: 2, commodity: '전자제품', grossWeight: 15000, weightUnit: 'KG', measurement: 65, measurementUnit: 'CBM', freightTerms: 'CY-CY', paymentTerms: 'PREPAID', status: 'confirmed', bcNo: 'BC-2026-0001', bcDate: '2026-01-16', createdAt: '2026-01-15' },
  { id: '2', bookingNo: 'SB-2026-0002', bookingDate: '2026-01-14', shipper: 'LG전자', consignee: 'LG Europe B.V.', carrier: 'MSC', vessel: 'MSC GULSUN', voyage: 'W002', pol: 'KRPUS', pod: 'DEHAM', etd: '2026-01-22', eta: '2026-02-15', containerType: '40GP', containerQty: 3, commodity: '가전제품', grossWeight: 24000, weightUnit: 'KG', freightTerms: 'CY-CY', paymentTerms: 'COLLECT', status: 'requested', createdAt: '2026-01-14' },
  { id: '3', bookingNo: 'SB-2026-0003', bookingDate: '2026-01-13', shipper: '현대자동차', consignee: 'Hyundai Motor America', carrier: 'HMM', vessel: 'HMM ALGECIRAS', voyage: '003S', pol: 'KRINC', pod: 'USNYC', etd: '2026-01-25', eta: '2026-02-20', containerType: '45HC', containerQty: 5, commodity: '자동차 부품', grossWeight: 45000, weightUnit: 'KG', measurement: 120, measurementUnit: 'CBM', freightTerms: 'CY-DOOR', paymentTerms: 'PREPAID', status: 'draft', createdAt: '2026-01-13' },
  { id: '4', bookingNo: 'SB-2026-0004', bookingDate: '2026-01-12', shipper: 'SK하이닉스', consignee: 'SK America Inc.', carrier: 'EVERGREEN', vessel: 'EVER GIVEN', voyage: '004E', pol: 'KRPUS', pod: 'USLGB', etd: '2026-01-28', eta: '2026-02-12', containerType: '40HC', containerQty: 4, commodity: '반도체 장비', grossWeight: 32000, weightUnit: 'KG', status: 'rejected', remarks: '스페이스 부족', createdAt: '2026-01-12' },
  { id: '5', bookingNo: 'SB-2026-0005', bookingDate: '2026-01-11', shipper: '포스코', consignee: 'POSCO Japan Co., Ltd.', carrier: 'ONE', vessel: 'ONE APUS', voyage: '005N', pol: 'KRPUS', pod: 'JPTYO', etd: '2026-01-18', eta: '2026-01-21', containerType: '20GP', containerQty: 10, commodity: '철강 제품', grossWeight: 180000, weightUnit: 'KG', freightTerms: 'CY-CY', paymentTerms: 'PREPAID', status: 'confirmed', bcNo: 'BC-2026-0005', bcDate: '2026-01-12', srNo: 'SR-2026-0005', srDate: '2026-01-13', createdAt: '2026-01-11' },
  { id: '6', bookingNo: 'SB-2026-0006', bookingDate: '2026-01-10', shipper: '한화솔루션', consignee: 'Hanwha Solutions USA', carrier: 'CMA', vessel: 'CMA CGM MARCO POLO', voyage: '006W', pol: 'KRPUS', pod: 'USHOU', etd: '2026-01-30', eta: '2026-02-25', containerType: '40HC', containerQty: 6, commodity: '태양광 패널', grossWeight: 48000, weightUnit: 'KG', measurement: 156, measurementUnit: 'CBM', status: 'confirmed', bcNo: 'BC-2026-0006', bcDate: '2026-01-11', createdAt: '2026-01-10' },
];

const initialFilters: SearchFilters = { startDate: '', endDate: '', bookingNo: '', shipper: '', carrier: '', pol: '', pod: '', status: '' };

const portNames: Record<string, string> = { KRPUS: '부산', KRINC: '인천', KRKAN: '광양', USLAX: 'LA', USLGB: '롱비치', USNYC: '뉴욕', USHOU: '휴스턴', DEHAM: '함부르크', NLRTM: '로테르담', JPTYO: '도쿄', CNSHA: '상하이', SGSIN: '싱가포르' };

export default function BookingSeaPage() {
  const router = useRouter();
  const [allData, setAllData] = useState<SeaBooking[]>(initialSampleData);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(initialFilters);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchMessage, setSearchMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingBooking, setEditingBooking] = useState<SeaBookingData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<SeaBookingDetail | null>(null);
  const [isSRModalOpen, setIsSRModalOpen] = useState(false);
  const [srBooking, setSRBooking] = useState<SeaBookingDetail | null>(null);

  const filteredList = useMemo(() => {
    return allData.filter(item => {
      if (appliedFilters.bookingNo && !item.bookingNo.toLowerCase().includes(appliedFilters.bookingNo.toLowerCase())) return false;
      if (appliedFilters.shipper && !item.shipper.toLowerCase().includes(appliedFilters.shipper.toLowerCase())) return false;
      if (appliedFilters.carrier && item.carrier !== appliedFilters.carrier) return false;
      if (appliedFilters.pol && !item.pol.toLowerCase().includes(appliedFilters.pol.toLowerCase())) return false;
      if (appliedFilters.pod && !item.pod.toLowerCase().includes(appliedFilters.pod.toLowerCase())) return false;
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
    totalContainers: filteredList.reduce((sum, b) => sum + b.containerQty, 0),
  }), [filteredList]);

  const handleSearch = useCallback(() => { setAppliedFilters({ ...filters }); setSelectedIds(new Set()); setSearchMessage('검색 완료: ' + filteredList.length + '건'); setTimeout(() => setSearchMessage(''), 3000); }, [filters, filteredList.length]);
  const handleReset = useCallback(() => { setFilters(initialFilters); setAppliedFilters(initialFilters); setSelectedIds(new Set()); setSearchMessage('초기화 완료'); setTimeout(() => setSearchMessage(''), 3000); }, []);
  const handleFilterChange = (field: keyof SearchFilters, value: string) => setFilters(prev => ({ ...prev, [field]: value }));
  const handleRowSelect = (id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const handleSelectAll = () => selectedIds.size === filteredList.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(filteredList.map(i => i.id)));
  const handleRowClick = (b: SeaBooking) => { setSelectedBooking(b); setIsDetailOpen(true); };
  const handleCreateBooking = () => { setModalMode('create'); setEditingBooking(null); setIsModalOpen(true); };
  const handleEditBooking = (b: SeaBookingDetail) => { setModalMode('edit'); setEditingBooking(b as SeaBookingData); setIsModalOpen(true); setIsDetailOpen(false); };

  const handleSaveBooking = (data: SeaBookingData) => {
    if (modalMode === 'create') {
      const nb: SeaBooking = { ...data, id: String(Date.now()), bookingNo: 'SB-2026-' + String(allData.length + 1).padStart(4, '0'), status: 'draft', createdAt: new Date().toISOString().split('T')[0] };
      setAllData(prev => [nb, ...prev]); setSearchMessage('부킹 등록 완료');
    } else { setAllData(prev => prev.map(i => i.id === data.id ? { ...i, ...data } : i)); setSearchMessage('부킹 수정 완료'); }
    setTimeout(() => setSearchMessage(''), 3000);
  };

  const handleStatusChange = (id: string, s: string) => {
    setAllData(prev => prev.map(i => i.id === id ? { ...i, status: s as SeaBooking['status'], ...(s === 'confirmed' ? { bcNo: 'BC-2026-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0'), bcDate: new Date().toISOString().split('T')[0] } : {}) } : i));
    setSearchMessage('상태 변경: ' + (statusConfig[s]?.label || s)); setTimeout(() => setSearchMessage(''), 3000);
  };

  const handleSendSR = (b: SeaBookingDetail) => { setSRBooking(b); setIsSRModalOpen(true); setIsDetailOpen(false); };

  const handleSRSubmit = (d: { bookingId: string }) => {
    setAllData(prev => prev.map(i => i.id === d.bookingId ? { ...i, srNo: 'SR-2026-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0'), srDate: new Date().toISOString().split('T')[0] } : i));
    setSearchMessage('S/R 전송 완료'); setTimeout(() => setSearchMessage(''), 3000);
  };

  const handleBulkSR = () => {
    const c = filteredList.filter(b => selectedIds.has(b.id) && b.status === 'confirmed' && !b.srNo);
    if (!c.length) { alert('S/R 전송 가능한 부킹이 없습니다.'); return; }
    if (confirm(c.length + '건 S/R 일괄 전송?')) {
      setAllData(prev => prev.map(i => c.find(x => x.id === i.id) ? { ...i, srNo: 'SR-2026-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0'), srDate: new Date().toISOString().split('T')[0] } : i));
      setSearchMessage(c.length + '건 S/R 전송 완료'); setTimeout(() => setSearchMessage(''), 3000); setSelectedIds(new Set());
    }
  };

  const summaryCards = [
    { key: '', label: '전체 부킹', value: summary.total, color: '#E8A838' },
    { key: 'draft', label: '작성중', value: summary.draft, color: '#6B7280' },
    { key: 'requested', label: 'B/R 요청', value: summary.requested, color: '#2563EB' },
    { key: 'confirmed', label: 'B/C 완료', value: summary.confirmed, color: '#059669' },
    { key: 'containers', label: '총 컨테이너', value: summary.totalContainers, color: '#8B5CF6' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header title="선적부킹관리 (해상)" subtitle="Logis > 견적/부킹관리 > 선적부킹관리 (해상)" />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--muted)]">화면 ID: FMS-BK-001</span>
              {selectedIds.size > 0 && <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">{selectedIds.size}건 선택</span>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/logis/booking/sea/register')}
                className="px-4 py-2 font-semibold rounded-lg flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)', color: '#0C1222' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                예약등록
              </button>
              <button
                onClick={() => router.push('/logis/booking/sea/multi-register')}
                className="px-4 py-2 bg-[#7C3AED] text-white font-semibold rounded-lg hover:bg-[#6D28D9]"
              >
                멀티예약
              </button>
              <button onClick={handleBulkSR} disabled={!selectedIds.size} className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed">S/R 일괄전송</button>
              <button onClick={() => alert('Excel: ' + (selectedIds.size || filteredList.length) + '건')} className="px-4 py-2 bg-[var(--surface-100)] rounded-lg hover:bg-[var(--surface-200)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Excel
              </button>
            </div>
          </div>

          {searchMessage && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-blue-100">{searchMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-5 gap-4 mb-6">
            {summaryCards.map(c => (
              <div key={c.label} onClick={() => c.key !== 'containers' && (setFilters(p => ({ ...p, status: c.key })), setAppliedFilters(p => ({ ...p, status: c.key })))} className={`card p-5 text-center transition-all duration-200 ${c.key !== 'containers' ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg' : ''}`} style={{ background: appliedFilters.status === c.key && c.key !== '' ? `linear-gradient(135deg, ${c.color}15 0%, transparent 100%)` : undefined }}>
                <p className="text-3xl font-bold" style={{ color: c.color }}>{c.value}</p>
                <p className="text-sm text-[var(--muted)] mt-1">{c.label}</p>
              </div>
            ))}
          </div>

          <div className="card mb-6">
            <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
              <svg className="w-5 h-5 text-[#E8A838]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <h3 className="font-bold">검색조건</h3>
            </div>
            <div className="p-4 grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">부킹일자</label>
                <div className="flex items-center gap-2">
                  <input type="date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)} className="flex-1 px-3 py-2.5 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838]" />
                  <span className="text-[var(--muted)]">~</span>
                  <input type="date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)} className="flex-1 px-3 py-2.5 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838]" />
                </div>
              </div>
              <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">부킹번호</label><input type="text" value={filters.bookingNo} onChange={e => handleFilterChange('bookingNo', e.target.value)} className="w-full px-3 py-2.5 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838]" placeholder="SB-YYYY-XXXX" /></div>
              <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">선사</label><select value={filters.carrier} onChange={e => handleFilterChange('carrier', e.target.value)} className="w-full px-3 py-2.5 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838]"><option value="">전체</option><option value="MAERSK">MAERSK</option><option value="MSC">MSC</option><option value="HMM">HMM</option><option value="EVERGREEN">EVERGREEN</option><option value="ONE">ONE</option><option value="CMA">CMA CGM</option></select></div>
              <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">화주</label><input type="text" value={filters.shipper} onChange={e => handleFilterChange('shipper', e.target.value)} className="w-full px-3 py-2.5 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838]" placeholder="화주명" /></div>
              <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">선적항 (POL)</label><input type="text" value={filters.pol} onChange={e => handleFilterChange('pol', e.target.value)} className="w-full px-3 py-2.5 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838]" placeholder="예: KRPUS" /></div>
              <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">양하항 (POD)</label><input type="text" value={filters.pod} onChange={e => handleFilterChange('pod', e.target.value)} className="w-full px-3 py-2.5 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838]" placeholder="예: USLAX" /></div>
              <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">상태</label><select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className="w-full px-3 py-2.5 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838]"><option value="">전체</option><option value="draft">작성중</option><option value="requested">B/R 요청</option><option value="confirmed">B/C 완료</option><option value="rejected">거절</option><option value="cancelled">취소</option></select></div>
            </div>
            <div className="p-4 flex justify-center gap-3 border-t border-[var(--border)]">
              <button onClick={handleSearch} className="px-8 py-2.5 font-semibold rounded-lg flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #1A2744 0%, #243B67 100%)', color: 'white' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>조회
              </button>
              <button onClick={handleReset} className="px-8 py-2.5 bg-[var(--surface-100)] rounded-lg hover:bg-[var(--surface-200)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>초기화
              </button>
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <div className="flex items-center gap-3"><h3 className="font-bold">부킹목록</h3><span className="px-2 py-1 bg-[#E8A838]/20 text-[#E8A838] rounded text-sm font-medium">{filteredList.length}건</span></div>
              {selectedIds.size > 0 && <button onClick={() => setSelectedIds(new Set())} className="text-sm text-[var(--muted)] hover:text-white">선택 해제</button>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--surface-100)]">
                  <tr>
                    <th className="w-12 p-3"><input type="checkbox" checked={filteredList.length > 0 && selectedIds.size === filteredList.length} onChange={handleSelectAll} className="rounded" /></th>
                    <th className="p-3 text-left text-sm font-semibold">부킹번호</th>
                    <th className="p-3 text-left text-sm font-semibold">부킹일자</th>
                    <th className="p-3 text-left text-sm font-semibold">화주</th>
                    <th className="p-3 text-left text-sm font-semibold">선사</th>
                    <th className="p-3 text-left text-sm font-semibold">선명/항차</th>
                    <th className="p-3 text-left text-sm font-semibold">구간</th>
                    <th className="p-3 text-center text-sm font-semibold">ETD</th>
                    <th className="p-3 text-center text-sm font-semibold">컨테이너</th>
                    <th className="p-3 text-center text-sm font-semibold">상태</th>
                    <th className="p-3 text-center text-sm font-semibold">S/R</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length === 0 ? (
                    <tr><td colSpan={11} className="p-12 text-center"><div className="flex flex-col items-center gap-3"><svg className="w-12 h-12 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg><p className="text-[var(--muted)]">조회된 데이터가 없습니다.</p></div></td></tr>
                  ) : filteredList.map(row => (
                    <tr key={row.id} className={`border-t border-[var(--border)] hover:bg-[var(--surface-50)] cursor-pointer transition-colors ${selectedIds.has(row.id) ? 'bg-blue-500/10' : ''}`} onClick={() => handleRowClick(row)}>
                      <td className="p-3 text-center" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => handleRowSelect(row.id)} className="rounded" /></td>
                      <td className="p-3"><span className="text-[#E8A838] font-medium hover:underline">{row.bookingNo}</span></td>
                      <td className="p-3 text-sm text-[var(--muted)]">{row.bookingDate}</td>
                      <td className="p-3 text-sm font-medium">{row.shipper}</td>
                      <td className="p-3"><span className="px-2 py-1 bg-[var(--surface-100)] rounded text-sm font-medium">{row.carrier}</span></td>
                      <td className="p-3 text-sm"><span className="text-white">{row.vessel}</span><span className="text-[var(--muted)]"> / {row.voyage}</span></td>
                      <td className="p-3 text-sm"><div className="flex items-center gap-2"><span className="font-medium">{portNames[row.pol] || row.pol}</span><svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg><span className="font-medium">{portNames[row.pod] || row.pod}</span></div></td>
                      <td className="p-3 text-sm text-center">{row.etd}</td>
                      <td className="p-3 text-center"><span className="text-sm font-medium">{row.containerQty} x {row.containerType}</span></td>
                      <td className="p-3 text-center"><span className="px-3 py-1 rounded-full text-xs font-medium" style={{ color: statusConfig[row.status].color, backgroundColor: statusConfig[row.status].bgColor }}>{statusConfig[row.status].label}</span></td>
                      <td className="p-3 text-center">{row.srNo ? <span className="text-green-400 text-xs">전송완료</span> : row.status === 'confirmed' ? <span className="text-yellow-400 text-xs">대기</span> : <span className="text-[var(--muted)] text-xs">-</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <SeaBookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveBooking} editData={editingBooking} mode={modalMode} />
      <SeaBookingDetailPanel isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} booking={selectedBooking} onEdit={handleEditBooking} onSendSR={handleSendSR} onStatusChange={handleStatusChange} />
      <SRSendModal isOpen={isSRModalOpen} onClose={() => setIsSRModalOpen(false)} onSend={handleSRSubmit} booking={srBooking} />
    </div>
  );
}
