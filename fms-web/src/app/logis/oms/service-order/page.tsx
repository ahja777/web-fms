'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSorting, SortableHeader, SortConfig } from '@/components/table/SortableTable';

interface ServiceOrder {
  id: number;
  so_number: string;
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
  execution_module: string;
  control_type: string;
  auto_release: boolean;
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
  { value: 'DRAFT', label: '임시저장', color: 'bg-gray-500' },
  { value: 'PENDING', label: '대기', color: 'bg-yellow-500' },
  { value: 'RELEASED', label: '릴리즈', color: 'bg-blue-500' },
  { value: 'IN_PROGRESS', label: '진행중', color: 'bg-purple-500' },
  { value: 'COMPLETED', label: '완료', color: 'bg-emerald-500' },
  { value: 'CANCELLED', label: '취소', color: 'bg-red-500' },
];

const EXECUTION_MODULE_OPTIONS = [
  { value: 'FW', label: 'Forwarding (FW)' },
  { value: 'TM', label: 'Transport (TM)' },
  { value: 'WM', label: 'Warehouse (WM)' },
];

export default function ServiceOrderPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const { sortConfig, handleSort, sortData } = useSorting<ServiceOrder>();

  // 검색 필터
  const [searchFilters, setSearchFilters] = useState({
    status: '',
    executionModule: '',
    fromDate: '',
    toDate: '',
  });

  // 폼 데이터
  const [formData, setFormData] = useState({
    co_number: '',
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
    execution_module: '',
    control_type: '',
    auto_release: false,
    status: 'DRAFT',
    remarks: '',
  });

  // 데이터 조회
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchFilters.status) params.append('status', searchFilters.status);
      if (searchFilters.executionModule) params.append('executionModule', searchFilters.executionModule);
      if (searchFilters.fromDate) params.append('fromDate', searchFilters.fromDate);
      if (searchFilters.toDate) params.append('toDate', searchFilters.toDate);

      const response = await fetch(`/api/oms/service-order?${params}`);
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

  // 오더 타입 조회
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

  useEffect(() => {
    fetchOrders();
    fetchOrderTypes();
  }, [fetchOrders]);

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      co_number: '',
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
      execution_module: '',
      control_type: '',
      auto_release: false,
      status: 'DRAFT',
      remarks: '',
    });
    setEditingOrder(null);
  };

  // 저장
  const handleSave = async () => {
    try {
      const url = '/api/oms/service-order';
      const method = editingOrder ? 'PUT' : 'POST';
      const body = editingOrder ? { ...formData, id: editingOrder.id } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

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

  // 삭제
  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/oms/service-order?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message);
        fetchOrders();
      } else {
        alert('오류: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 선택 삭제
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }
    if (!confirm(`선택한 ${selectedIds.size}건을 삭제하시겠습니까?`)) return;

    try {
      for (const id of selectedIds) {
        await fetch(`/api/oms/service-order?id=${id}`, { method: 'DELETE' });
      }
      alert('삭제가 완료되었습니다.');
      setSelectedIds(new Set());
      fetchOrders();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 수정 모달 열기
  const handleEdit = (order: ServiceOrder) => {
    setEditingOrder(order);
    setFormData({
      co_number: order.co_number || '',
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
      execution_module: order.execution_module || '',
      control_type: order.control_type || '',
      auto_release: order.auto_release || false,
      status: order.status || 'DRAFT',
      remarks: order.remarks || '',
    });
    setIsModalOpen(true);
  };

  // 전체 선택
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(orders.map(o => o.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // 개별 선택
  const handleSelect = (id: number, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs text-white ${statusOption?.color || 'bg-gray-500'}`}>
        {statusOption?.label || status}
      </span>
    );
  };

  const getModuleBadge = (module: string) => {
    const colors: Record<string, string> = {
      FW: 'bg-blue-600',
      TM: 'bg-green-600',
      WM: 'bg-purple-600',
    };
    return module ? (
      <span className={`px-2 py-1 rounded-full text-xs text-white ${colors[module] || 'bg-gray-500'}`}>
        {module}
      </span>
    ) : null;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">서비스 오더 관리 (S/O)</h1>
          <p className="text-sm text-[var(--foreground)]/60 mt-1">Service Order Management</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-[#E8A838] text-[#0C1222] font-semibold rounded-lg hover:bg-[#D4943A] transition-colors"
        >
          + 신규 등록
        </button>
      </div>

      {/* 검색 필터 */}
      <div className="bg-[var(--surface-100)] rounded-xl p-4 border border-[var(--border)]">
        <div className="grid grid-cols-5 gap-4">
          <div>
            <label className="block text-xs text-[var(--foreground)]/60 mb-1">상태</label>
            <select
              value={searchFilters.status}
              onChange={(e) => setSearchFilters({ ...searchFilters, status: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
            >
              <option value="">전체</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--foreground)]/60 mb-1">실행모듈</label>
            <select
              value={searchFilters.executionModule}
              onChange={(e) => setSearchFilters({ ...searchFilters, executionModule: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
            >
              <option value="">전체</option>
              {EXECUTION_MODULE_OPTIONS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--foreground)]/60 mb-1">시작일</label>
            <input
              type="date"
              value={searchFilters.fromDate}
              onChange={(e) => setSearchFilters({ ...searchFilters, fromDate: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--foreground)]/60 mb-1">종료일</label>
            <input
              type="date"
              value={searchFilters.toDate}
              onChange={(e) => setSearchFilters({ ...searchFilters, toDate: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={fetchOrders}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              조회
            </button>
            <button
              onClick={() => setSearchFilters({ status: '', executionModule: '', fromDate: '', toDate: '' })}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              초기화
            </button>
          </div>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-[var(--foreground)]/60">
          총 {orders.length}건 / 선택 {selectedIds.size}건
        </span>
        <button
          onClick={handleBulkDelete}
          disabled={selectedIds.size === 0}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          선택 삭제
        </button>
      </div>

      {/* 테이블 */}
      <div className="bg-[var(--surface-100)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--surface-200)]">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selectedIds.size === orders.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </th>
                <SortableHeader<ServiceOrder> columnKey="so_number" label="S/O No." sortConfig={sortConfig} onSort={handleSort} />
                <SortableHeader<ServiceOrder> columnKey="co_number" label="C/O No." sortConfig={sortConfig} onSort={handleSort} />
                <SortableHeader<ServiceOrder> columnKey="status" label="상태" sortConfig={sortConfig} onSort={handleSort} />
                <SortableHeader<ServiceOrder> columnKey="execution_module" label="실행모듈" sortConfig={sortConfig} onSort={handleSort} />
                <SortableHeader<ServiceOrder> columnKey="order_type_code" label="오더타입" sortConfig={sortConfig} onSort={handleSort} />
                <SortableHeader<ServiceOrder> columnKey="customer_name" label="고객명" sortConfig={sortConfig} onSort={handleSort} />
                <SortableHeader<ServiceOrder> columnKey="pol" label="POL" sortConfig={sortConfig} onSort={handleSort} />
                <SortableHeader<ServiceOrder> columnKey="pod" label="POD" sortConfig={sortConfig} onSort={handleSort} />
                <SortableHeader<ServiceOrder> columnKey="etd" label="ETD" sortConfig={sortConfig} onSort={handleSort} />
                <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--foreground)]/70">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-[var(--foreground)]/60">
                    로딩 중...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-[var(--foreground)]/60">
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                sortData(orders).map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--surface-200)]/50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        onChange={(e) => handleSelect(order.id, e.target.checked)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#E8A838]">{order.so_number}</td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]/70">{order.co_number}</td>
                    <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                    <td className="px-4 py-3">{getModuleBadge(order.execution_module)}</td>
                    <td className="px-4 py-3 text-sm">{order.order_type_name || order.order_type_code}</td>
                    <td className="px-4 py-3 text-sm">{order.customer_name}</td>
                    <td className="px-4 py-3 text-sm">{order.pol}</td>
                    <td className="px-4 py-3 text-sm">{order.pod}</td>
                    <td className="px-4 py-3 text-sm">{order.etd?.substring(0, 10)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(order)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 등록/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[var(--surface-100)] rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--surface-100)] px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                {editingOrder ? '서비스 오더 수정' : '서비스 오더 등록'}
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
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">연결 C/O 번호</label>
                    <input
                      type="text"
                      value={formData.co_number}
                      onChange={(e) => setFormData({ ...formData, co_number: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                      placeholder="예: CO20250126-0001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">오더 타입 *</label>
                    <select
                      value={formData.order_type_code}
                      onChange={(e) => setFormData({ ...formData, order_type_code: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                      required
                    >
                      <option value="">선택</option>
                      {orderTypes.map(ot => (
                        <option key={ot.order_type_code} value={ot.order_type_code}>
                          {ot.order_type_name} ({ot.biz_type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">실행 모듈</label>
                    <select
                      value={formData.execution_module}
                      onChange={(e) => setFormData({ ...formData, execution_module: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                    >
                      <option value="">선택</option>
                      {EXECUTION_MODULE_OPTIONS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">상태</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 고객 정보 */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">고객 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">고객 코드</label>
                    <input
                      type="text"
                      value={formData.customer_code}
                      onChange={(e) => setFormData({ ...formData, customer_code: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">고객명</label>
                    <input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">송하인 (Shipper)</label>
                    <input
                      type="text"
                      value={formData.shipper_name}
                      onChange={(e) => setFormData({ ...formData, shipper_name: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">수하인 (Consignee)</label>
                    <input
                      type="text"
                      value={formData.consignee_name}
                      onChange={(e) => setFormData({ ...formData, consignee_name: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 운송 정보 */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">운송 정보</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">출발항 (POL)</label>
                    <input
                      type="text"
                      value={formData.pol}
                      onChange={(e) => setFormData({ ...formData, pol: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">도착항 (POD)</label>
                    <input
                      type="text"
                      value={formData.pod}
                      onChange={(e) => setFormData({ ...formData, pod: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">출항예정일 (ETD)</label>
                    <input
                      type="date"
                      value={formData.etd}
                      onChange={(e) => setFormData({ ...formData, etd: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">도착예정일 (ETA)</label>
                    <input
                      type="date"
                      value={formData.eta}
                      onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 화물 정보 */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">화물 정보</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">화물 종류</label>
                    <select
                      value={formData.cargo_type}
                      onChange={(e) => setFormData({ ...formData, cargo_type: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                    >
                      <option value="">선택</option>
                      <option value="FCL">FCL</option>
                      <option value="LCL">LCL</option>
                      <option value="AIR">AIR</option>
                      <option value="BULK">BULK</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">인코텀즈</label>
                    <select
                      value={formData.incoterms}
                      onChange={(e) => setFormData({ ...formData, incoterms: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                    >
                      <option value="">선택</option>
                      <option value="FOB">FOB</option>
                      <option value="CIF">CIF</option>
                      <option value="CFR">CFR</option>
                      <option value="EXW">EXW</option>
                      <option value="DDP">DDP</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">품목</label>
                    <input
                      type="text"
                      value={formData.commodity}
                      onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">수량</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">중량 (KG)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">용적 (CBM)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.volume}
                      onChange={(e) => setFormData({ ...formData, volume: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 컨트롤 설정 */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">컨트롤 설정</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--foreground)]/60 mb-1">컨트롤 타입</label>
                    <input
                      type="text"
                      value={formData.control_type}
                      onChange={(e) => setFormData({ ...formData, control_type: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="auto_release"
                      checked={formData.auto_release}
                      onChange={(e) => setFormData({ ...formData, auto_release: e.target.checked })}
                      className="rounded mr-2"
                    />
                    <label htmlFor="auto_release" className="text-sm text-[var(--foreground)]">
                      자동 릴리즈 (Auto Release)
                    </label>
                  </div>
                </div>
              </div>

              {/* 비고 */}
              <div>
                <label className="block text-xs text-[var(--foreground)]/60 mb-1">비고</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--surface-200)] border border-[var(--border)] rounded-lg text-sm"
                  rows={3}
                />
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="sticky bottom-0 bg-[var(--surface-100)] px-6 py-4 border-t border-[var(--border)] flex justify-end gap-3">
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(false);
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-[#E8A838] text-[#0C1222] font-semibold rounded-lg hover:bg-[#D4943A] transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
