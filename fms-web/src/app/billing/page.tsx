'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import DateRangeButtons, { getToday } from '@/components/DateRangeButtons';
import { useSorting, SortableHeader, SortStatusBadge } from '@/components/table';

interface BillingData {
  id: number;
  invoiceNo: string;
  invoiceDate: string;
  blNo: string;
  customerName: string;
  customerType: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  paidDate: string | null;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  DRAFT: { label: '작성중', color: 'bg-gray-500', bgColor: '#F3F4F6' },
  ISSUED: { label: '발행', color: 'bg-blue-500', bgColor: '#DBEAFE' },
  SENT: { label: '발송', color: 'bg-purple-500', bgColor: '#F3E8FF' },
  PAID: { label: '수금완료', color: 'bg-green-500', bgColor: '#D1FAE5' },
  OVERDUE: { label: '연체', color: 'bg-red-500', bgColor: '#FEE2E2' },
  CANCELLED: { label: '취소', color: 'bg-gray-500', bgColor: '#F3F4F6' },
};

const getStatusConfig = (status: string) => statusConfig[status] || { label: status || '미정', color: 'bg-gray-500', bgColor: '#F3F4F6' };

const mockData: BillingData[] = [
  { id: 1, invoiceNo: 'INV-2026-0001', invoiceDate: '2026-01-20', blNo: 'HDMU1234567', customerName: '삼성전자', customerType: 'SHIPPER', amount: 5500000, currency: 'KRW', status: 'PAID', dueDate: '2026-02-20', paidDate: '2026-02-15' },
  { id: 2, invoiceNo: 'INV-2026-0002', invoiceDate: '2026-01-19', blNo: 'MAEU5678901', customerName: 'LG전자', customerType: 'SHIPPER', amount: 7200000, currency: 'KRW', status: 'ISSUED', dueDate: '2026-02-19', paidDate: null },
  { id: 3, invoiceNo: 'INV-2026-0003', invoiceDate: '2026-01-18', blNo: 'MSCU9012345', customerName: '현대자동차', customerType: 'SHIPPER', amount: 12500, currency: 'USD', status: 'SENT', dueDate: '2026-02-18', paidDate: null },
  { id: 4, invoiceNo: 'INV-2026-0004', invoiceDate: '2026-01-10', blNo: 'EGLV3456789', customerName: 'SK하이닉스', customerType: 'SHIPPER', amount: 3200000, currency: 'KRW', status: 'OVERDUE', dueDate: '2026-01-25', paidDate: null },
  { id: 5, invoiceNo: 'INV-2026-0005', invoiceDate: '2026-01-22', blNo: '', customerName: 'CJ대한통운', customerType: 'CARRIER', amount: 8900, currency: 'USD', status: 'DRAFT', dueDate: '2026-02-22', paidDate: null },
];

export default function BillingPage() {
  const today = getToday();
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    invoiceNo: '',
    customerName: '',
    status: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [data] = useState<BillingData[]>(mockData);

  const { sortConfig, handleSort, sortData, getSortStatusText, resetSort } = useSorting<BillingData>();

  const columnLabels: Record<string, string> = {
    invoiceNo: '인보이스 번호',
    invoiceDate: '발행일',
    blNo: 'B/L 번호',
    customerName: '거래처',
    amount: '금액',
    status: '상태',
    dueDate: '결제예정일',
  };

  const handleDateRangeSelect = (startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleSearch = () => setAppliedFilters(filters);
  const handleReset = () => {
    const resetFilters = { startDate: today, endDate: today, invoiceNo: '', customerName: '', status: '' };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const filteredData = useMemo(() => data.filter(item => {
    if (appliedFilters.invoiceNo && !item.invoiceNo.toLowerCase().includes(appliedFilters.invoiceNo.toLowerCase())) return false;
    if (appliedFilters.customerName && !item.customerName.toLowerCase().includes(appliedFilters.customerName.toLowerCase())) return false;
    if (appliedFilters.status && item.status !== appliedFilters.status) return false;
    return true;
  }), [data, appliedFilters]);

  const sortedList = useMemo(() => sortData(filteredData), [filteredData, sortData]);

  const summaryStats = useMemo(() => ({
    total: filteredData.length,
    draft: filteredData.filter(d => d.status === 'DRAFT').length,
    issued: filteredData.filter(d => d.status === 'ISSUED').length,
    paid: filteredData.filter(d => d.status === 'PAID').length,
    overdue: filteredData.filter(d => d.status === 'OVERDUE').length,
  }), [filteredData]);

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'KRW') {
      return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header title="정산 관리" subtitle="Billing > 정산 관리" showCloseButton={false} />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <button className="px-6 py-2 font-semibold rounded-lg" style={{ background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)', color: '#0C1222' }}>
              신규 등록
            </button>
          </div>

          <div className="card p-6 mb-6">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">발행일</label>
                <div className="flex gap-2 items-center">
                  <input type="date" value={filters.startDate} onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <span className="text-[var(--muted)]">~</span>
                  <input type="date" value={filters.endDate} onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" />
                  <DateRangeButtons onRangeSelect={handleDateRangeSelect} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">인보이스 번호</label>
                <input type="text" value={filters.invoiceNo} onChange={e => setFilters(prev => ({ ...prev, invoiceNo: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="INV-YYYY-XXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">거래처</label>
                <input type="text" value={filters.customerName} onChange={e => setFilters(prev => ({ ...prev, customerName: e.target.value }))} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="거래처명" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">상태</label>
                <div className="flex gap-2">
                  <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg">
                    <option value="">전체</option>
                    <option value="DRAFT">작성중</option>
                    <option value="ISSUED">발행</option>
                    <option value="SENT">발송</option>
                    <option value="PAID">수금완료</option>
                    <option value="OVERDUE">연체</option>
                  </select>
                  <button onClick={handleSearch} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">검색</button>
                  <button onClick={handleReset} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">초기화</button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="card p-4 text-center"><div className="text-2xl font-bold">{summaryStats.total}</div><div className="text-sm text-[var(--muted)]">전체</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-gray-500">{summaryStats.draft}</div><div className="text-sm text-[var(--muted)]">작성중</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-blue-500">{summaryStats.issued}</div><div className="text-sm text-[var(--muted)]">발행</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-green-500">{summaryStats.paid}</div><div className="text-sm text-[var(--muted)]">수금완료</div></div>
            <div className="card p-4 text-center"><div className="text-2xl font-bold text-red-500">{summaryStats.overdue}</div><div className="text-sm text-[var(--muted)]">연체</div></div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
              <h3 className="font-bold">정산 목록</h3>
              <span className="px-2 py-1 bg-[#E8A838]/20 text-[#E8A838] rounded text-sm font-medium">{filteredData.length}건</span>
              <SortStatusBadge statusText={getSortStatusText(columnLabels)} onReset={resetSort} />
            </div>
            <table className="w-full">
              <thead className="bg-[var(--surface-100)]">
                <tr>
                  <SortableHeader columnKey="invoiceNo" label="인보이스 번호" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="invoiceDate" label="발행일" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="blNo" label="B/L 번호" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="customerName" label="거래처" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="amount" label="금액" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="dueDate" label="결제예정일" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader columnKey="status" label="상태" sortConfig={sortConfig} onSort={handleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {sortedList.map(item => (
                  <tr key={item.id} className="hover:bg-[var(--surface-50)] cursor-pointer">
                    <td className="px-4 py-3"><span className="text-blue-400 hover:underline">{item.invoiceNo}</span></td>
                    <td className="px-4 py-3 text-sm">{item.invoiceDate}</td>
                    <td className="px-4 py-3 text-sm">{item.blNo || '-'}</td>
                    <td className="px-4 py-3 text-sm">{item.customerName}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatAmount(item.amount, item.currency)}</td>
                    <td className="px-4 py-3 text-sm">{item.dueDate}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusConfig(item.status).color}`}>{getStatusConfig(item.status).label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
