'use client';

import { useRouter } from 'next/navigation';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import DateRangeButtons, { getToday } from '@/components/DateRangeButtons';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';

interface AMSData {
  id: number;
  amsNo: string;
  amsDate: string;
  amsType: string;
  targetCountry: string;
  blNo: string;
  shipper: string;
  consignee: string;
  vessel: string;
  voyage: string;
  pol: string;
  pod: string;
  etd: string;
  filingDeadline: string;
  containerQty: number;
  responseCode: string;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '작성중', color: 'bg-gray-500' },
  SENT: { label: '전송완료', color: 'bg-blue-500' },
  ACCEPTED: { label: '접수완료', color: 'bg-green-500' },
  HOLD: { label: 'HOLD', color: 'bg-yellow-500' },
  REJECTED: { label: '반려', color: 'bg-red-500' },
  NO_LOAD: { label: 'DO NOT LOAD', color: 'bg-red-600' },
};

const responseConfig: Record<string, { label: string; color: string }> = {
  NONE: { label: '-', color: 'text-gray-500' },
  '1A': { label: '1A (접수)', color: 'text-green-500' },
  '1B': { label: '1B (Hold)', color: 'text-yellow-500' },
  '1C': { label: '1C (반려)', color: 'text-red-500' },
  '3H': { label: '3H (Do Not Load)', color: 'text-red-600' },
};

const mockData: AMSData[] = [
  { id: 1, amsNo: 'AMS-2026-0001', amsDate: '2026-01-20', amsType: 'ISF', targetCountry: 'USA', blNo: 'HDMU1234567', shipper: '삼성전자', consignee: 'Samsung America', vessel: 'HMM GDANSK', voyage: '001E', pol: 'KRPUS', pod: 'USLAX', etd: '2026-01-22', filingDeadline: '2026-01-20 12:00', containerQty: 2, responseCode: '1A', status: 'ACCEPTED' },
  { id: 2, amsNo: 'AMS-2026-0002', amsDate: '2026-01-19', amsType: 'AMS', targetCountry: 'USA', blNo: 'MAEU5678901', shipper: 'LG전자', consignee: 'LG Electronics USA', vessel: 'MAERSK EINDHOVEN', voyage: '002W', pol: 'KRPUS', pod: 'USNYC', etd: '2026-01-25', filingDeadline: '2026-01-23 12:00', containerQty: 3, responseCode: '1B', status: 'HOLD' },
  { id: 3, amsNo: 'AMS-2026-0003', amsDate: '2026-01-18', amsType: 'ACI', targetCountry: 'Canada', blNo: 'MSCU2345678', shipper: '현대자동차', consignee: 'Hyundai Motor Canada', vessel: 'MSC OSCAR', voyage: '003E', pol: 'KRPUS', pod: 'CAHAL', etd: '2026-01-28', filingDeadline: '2026-01-25 00:00', containerQty: 5, responseCode: 'NONE', status: 'SENT' },
  { id: 4, amsNo: 'AMS-2026-0004', amsDate: '2026-01-17', amsType: 'ENS', targetCountry: 'EU', blNo: 'EGLV9012345', shipper: 'SK하이닉스', consignee: 'SK Hynix Europe', vessel: 'EVER GIVEN', voyage: '004W', pol: 'KRPUS', pod: 'DEHAM', etd: '2026-02-01', filingDeadline: '2026-01-30 00:00', containerQty: 1, responseCode: 'NONE', status: 'DRAFT' },
  { id: 5, amsNo: 'AMS-2026-0005', amsDate: '2026-01-16', amsType: 'AFR', targetCountry: 'Japan', blNo: 'NYKU7890123', shipper: '포스코', consignee: 'Nippon Steel', vessel: 'ONE STORK', voyage: '005E', pol: 'KRPUS', pod: 'JPYOK', etd: '2026-01-22', filingDeadline: '2026-01-20 00:00', containerQty: 10, responseCode: '1A', status: 'ACCEPTED' },
];

export default function AMSListPage() {
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const today = getToday();
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    amsNo: '',
    blNo: '',
    amsType: '',
    targetCountry: '',
    shipper: '',
    status: '',
  });
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [data] = useState<AMSData[]>(mockData);

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleSearch = () => setAppliedFilters(filters);
  const handleReset = () => {
    const resetFilters = { startDate: today, endDate: today, amsNo: '', blNo: '', amsType: '', targetCountry: '', shipper: '', status: '' };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const filteredData = data.filter(item => {
    if (appliedFilters.amsNo && !item.amsNo.toLowerCase().includes(appliedFilters.amsNo.toLowerCase())) return false;
    if (appliedFilters.blNo && !item.blNo.toLowerCase().includes(appliedFilters.blNo.toLowerCase())) return false;
    if (appliedFilters.amsType && item.amsType !== appliedFilters.amsType) return false;
    if (appliedFilters.targetCountry && item.targetCountry !== appliedFilters.targetCountry) return false;
    if (appliedFilters.shipper && !item.shipper.toLowerCase().includes(appliedFilters.shipper.toLowerCase())) return false;
    if (appliedFilters.status && item.status !== appliedFilters.status) return false;
    return true;
  });

  const summaryStats = {
    total: filteredData.length,
    draft: filteredData.filter(d => d.status === 'DRAFT').length,
    sent: filteredData.filter(d => d.status === 'SENT').length,
    accepted: filteredData.filter(d => d.status === 'ACCEPTED').length,
    hold: filteredData.filter(d => d.status === 'HOLD').length,
  };

  const handleSendAMS = (id: number) => {
    alert(`AMS ID ${id}를 세관으로 전송합니다.`);
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
        <Header title="AMS 관리" subtitle="Logis > AMS > AMS 관리 (해상)" onClose={handleCloseClick} />
        <main ref={formRef} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-[var(--muted)]">화면 ID: UI-G-01-08-01</span>
            <Link href="/logis/ams/sea/register" className="px-6 py-2 font-semibold rounded-lg" style={{ background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)', color: '#0C1222' }}>
              신규 등록
            </Link>
          </div>

          <div className="card p-6 mb-6">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">AMS 일자</label>
                <div className="flex gap-2 items-center">
                  <input type="date" value={filters.startDate} onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <span className="text-[var(--muted)]">~</span>
                  <input type="date" value={filters.endDate} onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <DateRangeButtons onRangeSelect={handleDateRangeSelect} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">AMS 번호</label>
                <input type="text" value={filters.amsNo} onChange={e => setFilters(prev => ({ ...prev, amsNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="AMS-YYYY-XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">B/L 번호</label>
                <input type="text" value={filters.blNo} onChange={e => setFilters(prev => ({ ...prev, blNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="HDMU1234567" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">AMS 유형</label>
                <select value={filters.amsType} onChange={e => setFilters(prev => ({ ...prev, amsType: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                  <option value="">전체</option>
                  <option value="AMS">AMS (미국)</option>
                  <option value="ISF">ISF (미국)</option>
                  <option value="ACI">ACI (캐나다)</option>
                  <option value="ENS">ENS (EU)</option>
                  <option value="AFR">AFR (일본)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">대상국가</label>
                <select value={filters.targetCountry} onChange={e => setFilters(prev => ({ ...prev, targetCountry: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                  <option value="">전체</option>
                  <option value="USA">USA</option>
                  <option value="Canada">Canada</option>
                  <option value="EU">EU</option>
                  <option value="Japan">Japan</option>
                  <option value="Mexico">Mexico</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">화주</label>
                <input type="text" value={filters.shipper} onChange={e => setFilters(prev => ({ ...prev, shipper: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="화주명" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">상태</label>
                <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                  <option value="">전체</option>
                  <option value="DRAFT">작성중</option>
                  <option value="SENT">전송완료</option>
                  <option value="ACCEPTED">접수완료</option>
                  <option value="HOLD">HOLD</option>
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
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-blue-500">{summaryStats.sent}</div><div className="text-sm text-[var(--muted)]">전송완료</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-green-500">{summaryStats.accepted}</div><div className="text-sm text-[var(--muted)]">접수완료</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-yellow-500">{summaryStats.hold}</div><div className="text-sm text-[var(--muted)]">HOLD</div></div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--surface-100)]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">AMS 번호</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">일자</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">유형</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">대상국</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">B/L 번호</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">화주</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">선명/항차</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">POL/POD</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Filing 마감</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Response</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">상태</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">전송</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-[var(--surface-50)] cursor-pointer">
                    <td className="px-4 py-3"><Link href={`/logis/ams/sea/${item.id}`} className="text-blue-400 hover:underline">{item.amsNo}</Link></td>
                    <td className="px-4 py-3 text-sm">{item.amsDate}</td>
                    <td className="px-4 py-3 text-sm font-medium">{item.amsType}</td>
                    <td className="px-4 py-3 text-sm">{item.targetCountry}</td>
                    <td className="px-4 py-3 text-sm">{item.blNo}</td>
                    <td className="px-4 py-3 text-sm">{item.shipper}</td>
                    <td className="px-4 py-3 text-sm">{item.vessel}<br /><span className="text-[var(--muted)]">{item.voyage}</span></td>
                    <td className="px-4 py-3 text-sm">{item.pol} → {item.pod}</td>
                    <td className="px-4 py-3 text-sm text-xs">{item.filingDeadline}</td>
                    <td className="px-4 py-3 text-sm"><span className={responseConfig[item.responseCode]?.color}>{responseConfig[item.responseCode]?.label}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full text-white ${statusConfig[item.status].color}`}>{statusConfig[item.status].label}</span></td>
                    <td className="px-4 py-3">
                      {item.status === 'DRAFT' && (
                        <button onClick={() => handleSendAMS(item.id)} className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">전송</button>
                      )}
                    </td>
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

// ORIGINAL