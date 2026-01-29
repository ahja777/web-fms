'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { ActionButton } from '@/components/buttons';
import { useSorting, SortableHeader } from '@/components/table/SortableTable';

interface OrderType {
  id: number;
  order_type_code: string;
  order_type_name: string;
  biz_type: string;
  description: string;
  related_system: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const BIZ_TYPE_OPTIONS = [
  { value: 'DOMESTIC', label: 'Domestic (내수)', color: 'bg-blue-500' },
  { value: 'WAREHOUSE', label: 'Warehouse (창고)', color: 'bg-purple-500' },
  { value: 'IMPORT', label: 'Import (수입)', color: 'bg-green-500' },
  { value: 'EXPORT', label: 'Export (수출)', color: 'bg-orange-500' },
];

const SYSTEM_OPTIONS = ['FIS', 'TMS', 'WMS'];

export default function OrderTypePage() {
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<OrderType | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const { sortConfig, handleSort, sortData } = useSorting<OrderType>();

  const [formData, setFormData] = useState({
    order_type_code: '',
    order_type_name: '',
    biz_type: 'EXPORT',
    description: '',
    related_system: '',
    is_active: true,
  });

  const fetchOrderTypes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/oms/order-type');
      const result = await response.json();
      if (result.success) {
        setOrderTypes(result.data);
      }
    } catch (error) {
      console.error('Error fetching order types:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrderTypes();
  }, [fetchOrderTypes]);

  const resetForm = () => {
    setFormData({ order_type_code: '', order_type_name: '', biz_type: 'EXPORT', description: '', related_system: '', is_active: true });
    setEditingType(null);
  };

  const handleSave = async () => {
    if (!formData.order_type_code || !formData.order_type_name) {
      alert('오더 타입 코드와 이름은 필수입니다.');
      return;
    }
    try {
      const url = '/api/oms/order-type';
      const method = editingType ? 'PUT' : 'POST';
      const body = editingType ? { ...formData, id: editingType.id } : formData;
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        setIsModalOpen(false);
        resetForm();
        fetchOrderTypes();
      } else {
        alert('오류: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`/api/oms/order-type?id=${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        fetchOrderTypes();
      } else {
        alert('오류: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) { alert('삭제할 항목을 선택해주세요.'); return; }
    if (!confirm(`선택한 ${selectedIds.size}건을 삭제하시겠습니까?`)) return;
    try {
      for (const id of selectedIds) {
        await fetch(`/api/oms/order-type?id=${id}`, { method: 'DELETE' });
      }
      alert('삭제가 완료되었습니다.');
      setSelectedIds(new Set());
      fetchOrderTypes();
    } catch (error) {
      console.error('Error bulk deleting:', error);
    }
  };

  const handleEdit = (ot: OrderType) => {
    setEditingType(ot);
    setFormData({
      order_type_code: ot.order_type_code || '',
      order_type_name: ot.order_type_name || '',
      biz_type: ot.biz_type || 'EXPORT',
      description: ot.description || '',
      related_system: ot.related_system || '',
      is_active: ot.is_active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(orderTypes.map(o => o.id)) : new Set());
  };

  const handleSelect = (id: number, checked: boolean) => {
    const newSet = new Set(selectedIds);
    checked ? newSet.add(id) : newSet.delete(id);
    setSelectedIds(newSet);
  };

  const getBizTypeBadge = (bizType: string) => {
    const opt = BIZ_TYPE_OPTIONS.find(b => b.value === bizType);
    return (
      <span className={`px-2 py-1 rounded-full text-xs text-white ${opt?.color || 'bg-gray-500'}`}>
        {opt?.label || bizType}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header
          title="오더 타입 관리"
          subtitle="HOME > OMS > 오더 타입 관리"
          showCloseButton={false}
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
              <ActionButton variant="danger" icon="delete" onClick={handleBulkDelete}>삭제</ActionButton>
              <ActionButton variant="default" icon="refresh" onClick={fetchOrderTypes}>초기화</ActionButton>
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
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">업무구분</label>
                  <select className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm">
                    <option value="">전체</option>
                    {BIZ_TYPE_OPTIONS.map(b => (
                      <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">연계시스템</label>
                  <select className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm">
                    <option value="">전체</option>
                    {SYSTEM_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">활성여부</label>
                  <select className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838] text-sm">
                    <option value="">전체</option>
                    <option value="true">활성</option>
                    <option value="false">비활성</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border)] flex justify-center gap-2">
              <button onClick={fetchOrderTypes} className="px-6 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] font-medium">조회</button>
              <button onClick={fetchOrderTypes} className="px-6 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-200)]">초기화</button>
            </div>
          </div>

          {/* 목록 테이블 */}
          <div className="card mb-6">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="font-bold">오더 타입 목록</h3>
                <span className="px-2 py-1 bg-[#E8A838]/20 text-[#E8A838] rounded text-sm font-medium">
                  {orderTypes.length}건
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
                      <input type="checkbox" checked={orderTypes.length > 0 && selectedIds.size === orderTypes.length} onChange={(e) => handleSelectAll(e.target.checked)} className="rounded" />
                    </th>
                    <th className="p-3 text-center text-sm font-semibold">No</th>
                    <SortableHeader<OrderType> columnKey="order_type_code" label="오더타입코드" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<OrderType> columnKey="order_type_name" label="오더타입명" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<OrderType> columnKey="biz_type" label="업무구분" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<OrderType> columnKey="related_system" label="연계시스템" sortConfig={sortConfig} onSort={handleSort} />
                    <SortableHeader<OrderType> columnKey="is_active" label="활성" sortConfig={sortConfig} onSort={handleSort} align="center" />
                    <SortableHeader<OrderType> columnKey="description" label="설명" sortConfig={sortConfig} onSort={handleSort} />
                    <th className="p-3 text-center text-sm font-semibold">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} className="p-12 text-center"><p className="text-[var(--muted)]">로딩 중...</p></td></tr>
                  ) : orderTypes.length === 0 ? (
                    <tr><td colSpan={9} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-[var(--muted)]">조회된 데이터가 없습니다.</p>
                      </div>
                    </td></tr>
                  ) : sortData(orderTypes).map((ot, index) => (
                    <tr key={ot.id} className={`border-t border-[var(--border)] hover:bg-[var(--surface-50)] cursor-pointer transition-colors ${selectedIds.has(ot.id) ? 'bg-blue-500/10' : ''}`}>
                      <td className="p-3 text-center">
                        <input type="checkbox" checked={selectedIds.has(ot.id)} onChange={(e) => handleSelect(ot.id, e.target.checked)} className="rounded" />
                      </td>
                      <td className="p-3 text-center text-sm">{index + 1}</td>
                      <td className="p-3 text-sm font-medium text-[#E8A838]">{ot.order_type_code}</td>
                      <td className="p-3 text-sm">{ot.order_type_name}</td>
                      <td className="p-3">{getBizTypeBadge(ot.biz_type)}</td>
                      <td className="p-3 text-sm">{ot.related_system || '-'}</td>
                      <td className="p-3 text-center">
                        {ot.is_active ? <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">활성</span> : <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full">비활성</span>}
                      </td>
                      <td className="p-3 text-sm text-[var(--muted)]">{ot.description || '-'}</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(ot)} className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">수정</button>
                          <button onClick={() => handleDelete(ot.id)} className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors">삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* 등록/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[var(--surface-100)] rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--surface-100)] px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                {editingType ? '오더 타입 수정' : '오더 타입 등록'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--foreground)]/60 hover:text-[var(--foreground)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">오더 타입 코드 *</label>
                  <input type="text" value={formData.order_type_code} onChange={(e) => setFormData({ ...formData, order_type_code: e.target.value.toUpperCase() })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" disabled={!!editingType} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">오더 타입 명 *</label>
                  <input type="text" value={formData.order_type_name} onChange={(e) => setFormData({ ...formData, order_type_name: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">업무 구분</label>
                  <select value={formData.biz_type} onChange={(e) => setFormData({ ...formData, biz_type: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm">
                    {BIZ_TYPE_OPTIONS.map(b => (<option key={b.value} value={b.value}>{b.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">연계 시스템</label>
                  <select value={formData.related_system} onChange={(e) => setFormData({ ...formData, related_system: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm">
                    <option value="">선택</option>
                    {SYSTEM_OPTIONS.map(s => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">설명</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm" rows={3} />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="rounded" />
                  <span className="text-sm">활성화</span>
                </label>
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
