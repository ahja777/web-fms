'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { ActionButton } from '@/components/buttons';
import { useSorting, SortableHeader } from '@/components/table/SortableTable';

interface CustomerOrder {
  id: number;
  co_number: string;
  order_type_code: string;
  order_type_name?: string;
  biz_type: string;
  customer_code: string;
  customer_name: string;
  shipper_name: string;
  consignee_name: string;
  pol: string;
  pod: string;
  etd: string;
  eta: string;
  cargo_type: string;
  commodity: string;
  quantity: number;
  weight: number;
  volume: number;
  incoterms: string;
  status: string;
  remarks: string;
  created_at: string;
}

interface OrderType {
  id: number;
  order_type_code: string;
  order_type_name: string;
  biz_type: string;
}

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: '임시저장', color: '#6B7280', bgColor: '#F3F4F6' },
  { value: 'REQUESTED', label: '요청', color: '#2563EB', bgColor: '#DBEAFE' },
  { value: 'APPROVED', label: '승인', color: '#059669', bgColor: '#D1FAE5' },
  { value: 'PROCESSING', label: '처리중', color: '#D97706', bgColor: '#FEF3C7' },
  { value: 'COMPLETED', label: '완료', color: '#10B981', bgColor: '#D1FAE5' },
  { value: 'CANCELLED', label: '취소', color: '#EF4444', bgColor: '#FEE2E2' },
];

const BIZ_TYPE_OPTIONS = [
  { value: 'FORWARDING', label: 'Forwarding' },
  { value: 'DOMESTIC', label: 'Domestic' },
];

const getStatusConfig = (status: string) => {
  return STATUS_OPTIONS.find(s => s.value === status) || { value: status, label: status || '미정', color: '#6B7280', bgColor: '#F3F4F6' };
};

export default function CustomerOrderPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<CustomerOrder | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedRow, setSelectedRow] = useState<CustomerOrder | null>(null);
  const { sortConfig, handleSort, sortData } = useSorting<CustomerOrder>();

  const [searchFilters, setSearchFilters] = useState({
    status: '',
    bizType: '',
    fromDate: '',
    toDate: '',
  });

  const [formData, setFormData] = useState({
    order_type_code: '',
    biz_type: 'FORWARDING',
    customer_code: '',
    customer_name: '',
    shipper_name: '',
    consignee_name: '',
    pol: '',
    pod: '',
    etd: '',
    eta: '',
    cargo_type: '',
    commodity: '',
    quantity: 0,
    weight: 0,
    volume: 0,
    incoterms: '',
    status: 'DRAFT',
    remarks: '',
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchFilters.status) params.append('status', searchFilters.status);
      if (searchFilters.bizType) params.append('bizType', searchFilters.bizType);
      if (searchFilters.fromDate) params.append('fromDate', searchFilters.fromDate);
      if (searchFilters.toDate) params.append('toDate', searchFilters.toDate);

      const response = await fetch(`/api/oms/customer-order?${params}`);
      const result = await response.json();
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [searchFilters]);

  const fetchOrderTypes = async () => {
    try {
      const response = await fetch('/api/oms/order-type?isActive=true');
      const result = await response.json();
      if (result.success) {
        setOrderTypes(result.data);
      }
    } catch (error) {
      console.error('Error fetching order types:', error);
    }
  };

  const setupDatabase = async () => {
    try {
      await fetch('/api/oms/setup', { method: 'POST' });
    } catch (error) {
      console.error('Error setting up database:', error);
    }
  };

  useEffect(() => {
    setupDatabase().then(() => {
      fetchOrders();
      fetchOrderTypes();
    });
  }, [fetchOrders]);

  const resetForm = () => {
    setFormData({
      order_type_code: '', biz_type: 'FORWARDING', customer_code: '', customer_name: '',
      shipper_name: '', consignee_name: '', pol: '', pod: '', etd: '', eta: '',
      cargo_type: '', commodity: '', quantity: 0, weight: 0, volume: 0,
      incoterms: '', status: 'DRAFT', remarks: '',
    });
    setEditingOrder(null);
  };

  const handleSave = async () => {
    try {
      const url = '/api/oms/customer-order';
      const method = editingOrder ? 'PUT' : 'POST';
      const body = editingOrder ? { ...formData, id: editingOrder.id } : formData;
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        setIsModalOpen(false);
        resetForm();
        fetchOrders();
      } else {
        alert('오류: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving order:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`/api/oms/customer-order?id=${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) { alert(result.message); fetchOrders(); }
      else { alert('오류: ' + result.error); }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) { alert('삭제할 항목을 선택해주세요.'); return; }
    if (!confirm(`선택한 ${selectedIds.size}건을 삭제하시겠습니까?`)) return;
    try {
      for (const id of selectedIds) {
        await fetch(`/api/oms/customer-order?id=${id}`, { method: 'DELETE' });
      }
      alert('삭제가 완료되었습니다.');
      setSelectedIds(new Set());
      fetchOrders();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (order: CustomerOrder) => {
    setEditingOrder(order);
    setFormData({
      order_type_code: order.order_type_code || '',
      biz_type: order.biz_type || 'FORWARDING',
      customer_code: order.customer_code || '',
      customer_name: order.customer_name || '',
      shipper_name: order.shipper_name || '',
      consignee_name: order.consignee_name || '',
      pol: order.pol || '',
      pod: order.pod || '',
      etd: order.etd ? order.etd.substring(0, 10) : '',
      eta: order.eta ? order.eta.substring(0, 10) : '',
      cargo_type: order.cargo_type || '',
      commodity: order.commodity || '',
      quantity: order.quantity || 0,
      weight: order.weight || 0,
      volume: order.volume || 0,
      incoterms: order.incoterms || '',
      status: order.status || 'DRAFT',
      remarks: order.remarks || '',
    });
    setIsModalOpen(true);
  };

  const handleEditSelected = () => {
    if (selectedIds.size !== 1) { alert('수정할 항목을 1개 선택해주세요.'); return; }
    const id = Array.from(selectedIds)[0];
    const order = orders.find(o => o.id === id);
    if (order) handleEdit(order);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(orders.map(o => o.id)) : new Set());
  };

  const handleSelect = (id: number, checked: boolean) => {
    const newSet = new Set(selectedIds);
    checked ? newSet.add(id) : newSet.delete(id);
    setSelectedIds(newSet);
  };

  const handleSearchReset = () => {
    setSearchFilters({ status: '', bizType: '', fromDate: '', toDate: '' });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header
          title="고객 오더 관리 (C/O)"
          subtitle="HOME > OMS > 고객 오더 관리"
         
        />
        <main className="p-6">
          {/* 상단 버튼 영역 */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              {selectedIds.size > 0 && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                  {selectedIds.size}건 선택
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <ActionButton variant="success" icon="plus" onClick={() => { resetForm(); setIsModalOpen(true); }}>신규</ActionButton>
              <ActionButton variant="secondary" icon="edit" onClick={handleEditSelected}>수정</ActionButton>
              <ActionButton variant="danger" icon="delete" onClick={handleBulkDelete}>삭제</ActionButton>
              <ActionButton variant="default" icon="refresh" onClick={handleSearchReset}>초기화</ActionButton>
            </div>
          </div>

          {/* 검색조건 */}
          <div className="card mb-6">
            <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
              <svg className="w-5 h-5 text-[#E8A838]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="font-bold">검색조건</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">상태</label>
                  <select
                    value={searchFilters.status}
                    onChange={(e) => setSearchFilters({ ...searchFilters, status: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm"
                  >
                    <option value="">전체</option>
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">업무구분</label>
                  <select
                    value={searchFilters.bizType}
                    onChange={(e) => setSearchFilters({ ...searchFilters, bizType: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm"
                  >
                    <option value="">전체</option>
                    {BIZ_TYPE_OPTIONS.map(b => (
                      <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">등록일</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={searchFilters.fromDate}
                      onChange={(e) => setSearchFilters({ ...searchFilters, fromDate: e.target.value })}
                      className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm"
                    />
                    <span className="text-[var(--muted)]">~</span>
                    <input
                      type="date"
                      value={searchFilters.toDate}
                      onChange={(e) => setSearchFilters({ ...searchFilters, toDate: e.target.value })}
                      className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border)] flex justify-center gap-2">
              <button onClick={fetchOrders} className="px-6 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] font-medium">조회</button>
              <button onClick={handleSearchReset} className="px-6 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-200)]">초기화</button>
            </div>
          </div>

          {/* 목록 테이블 */}
          <div className="card mb-6">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="font-bold">고객 오더 목록</h3>
                <span className="px-2 py-1 bg-[#E8A838]/20 text-[#E8A838] rounded text-sm font-medium">
                  {orders.length}건
                </span>
              </div>
              {selectedIds.size > 0 && (
                <button onClick={() => setSelectedIds(new Set())} className="text-sm text-[var(--muted)] hover:text-white">
                  선택 해제 ({selectedIds.size}건)
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--surface-100)]">
                  <tr>
                    <th className="w-12 p-3">
                      <input type="checkbox" checked={orders.length > 0 && selectedIds.size === orders.length} onChange={(e) => handleSelectAll(e.target.checked)} className="rounded" />
                    </th>
                    <th className="p-3 text-center text-sm font-semibold">No</th>
                    <SortableHeader<CustomerOrder> columnKey="co_number" label="C/O No." sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<CustomerOrder> columnKey="status" label="상태" sortConfig={sortConfig} onSort={handleSort} align="center" />
                    <SortableHeader<CustomerOrder> columnKey="order_type_code" label="오더타입" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<CustomerOrder> columnKey="customer_name" label="고객명" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<CustomerOrder> columnKey="shipper_name" label="Shipper" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<CustomerOrder> columnKey="consignee_name" label="Consignee" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<CustomerOrder> columnKey="pol" label="POL" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<CustomerOrder> columnKey="pod" label="POD" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<CustomerOrder> columnKey="etd" label="ETD" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<CustomerOrder> columnKey="commodity" label="품목" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<CustomerOrder> columnKey="quantity" label="수량" sortConfig={sortConfig} onSort={handleSort} align="right" />
                    <SortableHeader<CustomerOrder> columnKey="weight" label="중량(KG)" sortConfig={sortConfig} onSort={handleSort} align="right" />
                    <SortableHeader<CustomerOrder> columnKey="volume" label="용적(CBM)" sortConfig={sortConfig} onSort={handleSort} align="right" />
                    <SortableHeader<CustomerOrder> columnKey="incoterms" label="INCO" sortConfig={sortConfig} onSort={handleSort} align="center" />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={16} className="p-12 text-center"><p className="text-[var(--muted)]">로딩 중...</p></td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={16} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-[var(--muted)]">조회된 데이터가 없습니다.</p>
                      </div>
                    </td></tr>
                  ) : sortData(orders).map((order, index) => (
                    <tr
                      key={order.id}
                      className={`border-t border-[var(--border)] hover:bg-[var(--surface-50)] cursor-pointer transition-colors ${selectedIds.has(order.id) ? 'bg-blue-500/10' : ''} ${selectedRow?.id === order.id ? 'bg-[#E8A838]/10' : ''}`}
                      onClick={() => setSelectedRow(order)}
                      onDoubleClick={() => handleEdit(order)}
                    >
                      <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.has(order.id)} onChange={(e) => handleSelect(order.id, e.target.checked)} className="rounded" />
                      </td>
                      <td className="p-3 text-center text-sm">{index + 1}</td>
                      <td className="p-3"><span className="text-[#E8A838] font-medium hover:underline">{order.co_number}</span></td>
                      <td className="p-3 text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ color: getStatusConfig(order.status).color, backgroundColor: getStatusConfig(order.status).bgColor }}>
                          {getStatusConfig(order.status).label}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{order.order_type_name || order.order_type_code}</td>
                      <td className="p-3 text-sm">{order.customer_name}</td>
                      <td className="p-3 text-sm">{order.shipper_name || '-'}</td>
                      <td className="p-3 text-sm">{order.consignee_name || '-'}</td>
                      <td className="p-3 text-sm">{order.pol}</td>
                      <td className="p-3 text-sm">{order.pod}</td>
                      <td className="p-3 text-sm text-[var(--muted)]">{order.etd?.substring(0, 10)}</td>
                      <td className="p-3 text-sm">{order.commodity || '-'}</td>
                      <td className="p-3 text-sm text-right">{order.quantity?.toLocaleString()}</td>
                      <td className="p-3 text-sm text-right">{order.weight?.toLocaleString()}</td>
                      <td className="p-3 text-sm text-right">{order.volume?.toLocaleString()}</td>
                      <td className="p-3 text-center text-sm">{order.incoterms || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 선택된 오더 상세 정보 */}
          {selectedRow && (
            <div className="card">
              <div className="p-4 border-b border-[var(--border)]">
                <h3 className="font-bold">선택된 오더 정보</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-[var(--muted)]">C/O No.</span>
                    <p className="font-medium">{selectedRow.co_number}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[var(--muted)]">상태</span>
                    <p>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ color: getStatusConfig(selectedRow.status).color, backgroundColor: getStatusConfig(selectedRow.status).bgColor }}>
                        {getStatusConfig(selectedRow.status).label}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-[var(--muted)]">고객명</span>
                    <p className="font-medium">{selectedRow.customer_name || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[var(--muted)]">오더타입</span>
                    <p className="font-medium">{selectedRow.order_type_name || selectedRow.order_type_code || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[var(--muted)]">Shipper</span>
                    <p className="font-medium">{selectedRow.shipper_name || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[var(--muted)]">Consignee</span>
                    <p className="font-medium">{selectedRow.consignee_name || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[var(--muted)]">POL</span>
                    <p className="font-medium">{selectedRow.pol || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[var(--muted)]">POD</span>
                    <p className="font-medium">{selectedRow.pod || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 등록/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[var(--surface-100)] rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--surface-100)] px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                {editingOrder ? '고객 오더 수정' : '고객 오더 등록'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--foreground)]/60 hover:text-[var(--foreground)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 기본 정보 */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">기본 정보</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">오더 타입 *</label>
                    <select value={formData.order_type_code} onChange={(e) => setFormData({ ...formData, order_type_code: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" required>
                      <option value="">선택</option>
                      {orderTypes.map(ot => (<option key={ot.order_type_code} value={ot.order_type_code}>{ot.order_type_name} ({ot.biz_type})</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">업무 구분</label>
                    <select value={formData.biz_type} onChange={(e) => setFormData({ ...formData, biz_type: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm">
                      {BIZ_TYPE_OPTIONS.map(b => (<option key={b.value} value={b.value}>{b.label}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">상태</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm">
                      {STATUS_OPTIONS.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 고객 정보 */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">고객 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">고객 코드</label>
                    <input type="text" value={formData.customer_code} onChange={(e) => setFormData({ ...formData, customer_code: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">고객명</label>
                    <input type="text" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">송하인 (Shipper)</label>
                    <input type="text" value={formData.shipper_name} onChange={(e) => setFormData({ ...formData, shipper_name: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">수하인 (Consignee)</label>
                    <input type="text" value={formData.consignee_name} onChange={(e) => setFormData({ ...formData, consignee_name: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" />
                  </div>
                </div>
              </div>

              {/* 운송 정보 */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">운송 정보</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">출발항 (POL)</label>
                    <input type="text" value={formData.pol} onChange={(e) => setFormData({ ...formData, pol: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" placeholder="예: KRPUS" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">도착항 (POD)</label>
                    <input type="text" value={formData.pod} onChange={(e) => setFormData({ ...formData, pod: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" placeholder="예: CNSHA" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">출항예정일 (ETD)</label>
                    <input type="date" value={formData.etd} onChange={(e) => setFormData({ ...formData, etd: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">도착예정일 (ETA)</label>
                    <input type="date" value={formData.eta} onChange={(e) => setFormData({ ...formData, eta: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" />
                  </div>
                </div>
              </div>

              {/* 화물 정보 */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">화물 정보</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">화물 종류</label>
                    <select value={formData.cargo_type} onChange={(e) => setFormData({ ...formData, cargo_type: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm">
                      <option value="">선택</option>
                      <option value="FCL">FCL</option>
                      <option value="LCL">LCL</option>
                      <option value="AIR">AIR</option>
                      <option value="BULK">BULK</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">인코텀즈</label>
                    <select value={formData.incoterms} onChange={(e) => setFormData({ ...formData, incoterms: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm">
                      <option value="">선택</option>
                      <option value="FOB">FOB</option>
                      <option value="CIF">CIF</option>
                      <option value="CFR">CFR</option>
                      <option value="EXW">EXW</option>
                      <option value="DDP">DDP</option>
                      <option value="DAP">DAP</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">품목</label>
                    <input type="text" value={formData.commodity} onChange={(e) => setFormData({ ...formData, commodity: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">수량</label>
                    <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">중량 (KG)</label>
                    <input type="number" step="0.001" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">용적 (CBM)</label>
                    <input type="number" step="0.001" value={formData.volume} onChange={(e) => setFormData({ ...formData, volume: Number(e.target.value) })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" />
                  </div>
                </div>
              </div>

              {/* 비고 */}
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">비고</label>
                <textarea value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" rows={3} />
              </div>
            </div>

            <div className="sticky bottom-0 bg-[var(--surface-100)] px-6 py-4 border-t border-[var(--border)] flex justify-end gap-3">
              <button onClick={() => { resetForm(); setIsModalOpen(false); }} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">취소</button>
              <button onClick={handleSave} className="px-6 py-2 bg-[#E8A838] text-[#0C1222] font-semibold rounded-lg hover:bg-[#D4943A] transition-colors">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
