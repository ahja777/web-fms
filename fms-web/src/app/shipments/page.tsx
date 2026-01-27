'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import ShipmentForm from '@/components/ShipmentForm';
import type { Shipment, ShipmentFormData } from '@/types/shipment';

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: 'rgba(245, 158, 11, 0.1)', text: '#B45309', dot: '#F59E0B' },
  BOOKED: { bg: 'rgba(59, 130, 246, 0.1)', text: '#1D4ED8', dot: '#3B82F6' },
  SHIPPED: { bg: 'rgba(139, 92, 246, 0.1)', text: '#6D28D9', dot: '#8B5CF6' },
  DEPARTED: { bg: 'rgba(236, 72, 153, 0.1)', text: '#BE185D', dot: '#EC4899' },
  ARRIVED: { bg: 'rgba(20, 184, 166, 0.1)', text: '#0F766E', dot: '#14B8A6' },
  DELIVERED: { bg: 'rgba(34, 197, 94, 0.1)', text: '#15803D', dot: '#22C55E' },
};

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');

  const fetchShipments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/shipments');
      if (!response.ok) throw new Error('Failed to fetch shipments');
      const data = await response.json();
      setShipments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleSubmit = async (data: ShipmentFormData) => {
    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create shipment');

      setIsModalOpen(false);
      fetchShipments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create shipment');
    }
  };

  const filteredShipments = shipments.filter(s => {
    if (statusFilter && s.status !== statusFilter) return false;
    if (modeFilter && s.transport_mode !== modeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header title="Shipments" subtitle="Manage and track all shipments" />

        <main className="p-8">
          {/* Page Header with Stats */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              {/* Quick Stats */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(26, 39, 68, 0.05)' }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#1A2744]" />
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    Total: <span className="font-bold">{shipments.length}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(20, 184, 166, 0.08)' }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
                  <span className="text-sm font-medium text-[#0F766E]">
                    Active: <span className="font-bold">{shipments.filter(s => ['BOOKED', 'SHIPPED', 'DEPARTED'].includes(s.status)).length}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* New Shipment Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)',
                color: '#0C1222',
                boxShadow: '0 4px 12px rgba(232, 168, 56, 0.3)',
              }}
            >
              <svg className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Shipment
            </button>
          </div>

          {/* Filters & Table Card */}
          <div className="card animate-slide-up">
            {/* Filters Bar */}
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="select-field pr-10 min-w-[160px]"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="BOOKED">Booked</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DEPARTED">Departed</option>
                    <option value="ARRIVED">Arrived</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </div>

                {/* Mode Filter */}
                <div className="relative">
                  <select
                    value={modeFilter}
                    onChange={(e) => setModeFilter(e.target.value)}
                    className="select-field pr-10 min-w-[140px]"
                  >
                    <option value="">All Modes</option>
                    <option value="SEA">Sea</option>
                    <option value="AIR">Air</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {(statusFilter || modeFilter) && (
                  <button
                    onClick={() => { setStatusFilter(''); setModeFilter(''); }}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                )}
              </div>

              {/* View Options */}
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-[var(--surface-100)] text-[var(--foreground)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </button>
                <button className="p-2 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-100)] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Table Content */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-[var(--surface-200)]" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--amber-500)] animate-spin" />
                  </div>
                  <span className="text-[var(--muted)]">Loading shipments...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(240, 100, 73, 0.1)' }}
                  >
                    <svg className="w-8 h-8 text-[#F06449]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <p className="text-[var(--foreground)] font-medium">{error}</p>
                  <button
                    onClick={fetchShipments}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ background: 'var(--surface-100)', color: 'var(--foreground)' }}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Shipment</th>
                        <th>Mode</th>
                        <th>Type</th>
                        <th>Customer</th>
                        <th>Route</th>
                        <th>ETD</th>
                        <th>ETA</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShipments.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-16">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                                style={{ background: 'var(--surface-100)' }}
                              >
                                <svg className="w-10 h-10 text-[var(--surface-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                              <div className="text-center">
                                <p className="text-[var(--foreground)] font-medium mb-1">No shipments found</p>
                                <p className="text-sm text-[var(--muted)]">Create your first shipment to get started</p>
                              </div>
                              <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                                style={{ background: 'var(--surface-100)', color: 'var(--foreground)' }}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Shipment
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredShipments.map((shipment, idx) => (
                          <tr key={shipment.shipment_id} className="group">
                            <td>
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                  shipment.transport_mode === 'SEA'
                                    ? 'bg-[rgba(26,39,68,0.1)] text-[#1A2744]'
                                    : 'bg-[rgba(14,165,233,0.1)] text-[#0284C7]'
                                }`}>
                                  {shipment.transport_mode === 'SEA' ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                  ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-[var(--foreground)] group-hover:text-[var(--amber-500)] transition-colors cursor-pointer">
                                    {shipment.shipment_no}
                                  </p>
                                  <p className="text-xs text-[var(--muted)]">{shipment.service_type}</p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                shipment.transport_mode === 'SEA'
                                  ? 'bg-[rgba(26,39,68,0.1)] text-[#1A2744]'
                                  : 'bg-[rgba(14,165,233,0.1)] text-[#0284C7]'
                              }`}>
                                {shipment.transport_mode}
                              </span>
                            </td>
                            <td className="text-[var(--muted)]">{shipment.trade_type}</td>
                            <td className="font-medium">{shipment.customer_name || '-'}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-[var(--foreground)]">{shipment.origin_port}</span>
                                <svg className="w-4 h-4 text-[var(--amber-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                                <span className="font-medium text-[var(--foreground)]">{shipment.dest_port}</span>
                              </div>
                            </td>
                            <td>
                              <span className="font-mono text-sm">{shipment.etd || '-'}</span>
                            </td>
                            <td>
                              <span className="font-mono text-sm">{shipment.eta || '-'}</span>
                            </td>
                            <td>
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                                style={{
                                  background: statusConfig[shipment.status]?.bg || 'var(--surface-100)',
                                  color: statusConfig[shipment.status]?.text || 'var(--muted)',
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: statusConfig[shipment.status]?.dot || 'var(--muted)' }}
                                />
                                {shipment.status}
                              </span>
                            </td>
                            <td>
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-100)] transition-all"
                                  title="View"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </button>
                                <button className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-100)] transition-all"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                  </svg>
                                </button>
                                <button className="p-2 rounded-lg text-[var(--muted)] hover:text-[#F06449] hover:bg-[rgba(240,100,73,0.1)] transition-all"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredShipments.length > 0 && (
                  <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between">
                    <p className="text-sm text-[var(--muted)]">
                      Showing <span className="font-semibold text-[var(--foreground)]">{filteredShipments.length}</span> of{' '}
                      <span className="font-semibold text-[var(--foreground)]">{shipments.length}</span> shipments
                    </p>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-100)] transition-colors disabled:opacity-50" disabled>
                        Previous
                      </button>
                      <button className="w-10 h-10 text-sm font-semibold rounded-lg"
                        style={{
                          background: 'linear-gradient(135deg, #1A2744 0%, #243B67 100%)',
                          color: 'white',
                        }}
                      >
                        1
                      </button>
                      <button className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-100)] transition-colors">
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Shipment" size="lg">
        <ShipmentForm onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
