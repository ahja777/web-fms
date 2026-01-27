'use client';

import { useState, useEffect } from 'react';
import type { ShipmentFormData, Customer, Carrier, Port } from '@/types/shipment';

interface ShipmentFormProps {
  onSubmit: (data: ShipmentFormData) => void;
  onCancel: () => void;
}

export default function ShipmentForm({ onSubmit, onCancel }: ShipmentFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<ShipmentFormData>({
    transport_mode: 'SEA',
    trade_type: 'EXPORT',
    service_type: 'FCL',
    incoterms: 'FOB',
    customer_id: 0,
    shipper_id: 0,
    consignee_id: 0,
    carrier_id: 0,
    origin_port: '',
    dest_port: '',
    etd: '',
    eta: '',
    total_pkg_qty: 0,
    pkg_type: 'CARTON',
    gross_weight: 0,
    volume_cbm: 0,
    declared_value: 0,
    currency: 'USD',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, carriersRes, portsRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/carriers'),
          fetch('/api/ports'),
        ]);

        if (customersRes.ok) setCustomers(await customersRes.json());
        if (carriersRes.ok) setCarriers(await carriersRes.json());
        if (portsRes.ok) setPorts(await portsRes.json());
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['customer_id', 'shipper_id', 'consignee_id', 'carrier_id', 'total_pkg_qty', 'gross_weight', 'volume_cbm', 'declared_value'].includes(name)
        ? Number(value)
        : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const filteredCarriers = carriers.filter(c => c.carrier_type === formData.transport_mode);
  const filteredPorts = ports.filter(p => p.port_type === formData.transport_mode);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--surface-200)]" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--amber-500)] animate-spin" />
          </div>
          <span className="text-[var(--muted)]">Loading form data...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transport Mode Selection */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
          Transport Mode
        </label>
        <div className="grid grid-cols-2 gap-3">
          {['SEA', 'AIR'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, transport_mode: mode as 'SEA' | 'AIR', carrier_id: 0, origin_port: '', dest_port: '' }))}
              className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                formData.transport_mode === mode
                  ? 'border-[var(--amber-500)] bg-[rgba(232,168,56,0.05)]'
                  : 'border-[var(--border)] hover:border-[var(--surface-300)]'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                mode === 'SEA'
                  ? 'bg-[rgba(26,39,68,0.1)] text-[#1A2744]'
                  : 'bg-[rgba(14,165,233,0.1)] text-[#0284C7]'
              }`}>
                {mode === 'SEA' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
              </div>
              <div className="text-left">
                <p className="font-semibold text-[var(--foreground)]">{mode === 'SEA' ? 'Sea Freight' : 'Air Freight'}</p>
                <p className="text-xs text-[var(--muted)]">{mode === 'SEA' ? 'FCL / LCL' : 'Express / Standard'}</p>
              </div>
              {formData.transport_mode === mode && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--amber-500)' }}
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Trade Type & Service Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
            Trade Type
          </label>
          <select
            name="trade_type"
            value={formData.trade_type}
            onChange={handleChange}
            className="select-field"
          >
            <option value="EXPORT">Export</option>
            <option value="IMPORT">Import</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
            Service Type
          </label>
          <select
            name="service_type"
            value={formData.service_type}
            onChange={handleChange}
            className="select-field"
          >
            <option value="FCL">FCL (Full Container)</option>
            <option value="LCL">LCL (Less Container)</option>
            <option value="BULK">Bulk</option>
          </select>
        </div>
      </div>

      {/* Customer & Carrier */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
            Customer
          </label>
          <select
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            className="select-field"
          >
            <option value={0}>Select Customer</option>
            {customers.map(c => (
              <option key={c.customer_id} value={c.customer_id}>{c.customer_name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
            Carrier
          </label>
          <select
            name="carrier_id"
            value={formData.carrier_id}
            onChange={handleChange}
            className="select-field"
          >
            <option value={0}>Select Carrier</option>
            {filteredCarriers.map(c => (
              <option key={c.carrier_id} value={c.carrier_id}>{c.carrier_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Incoterms */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
          Incoterms
        </label>
        <div className="flex flex-wrap gap-2">
          {['FOB', 'CIF', 'CFR', 'EXW', 'DDP'].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, incoterms: term }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                formData.incoterms === term
                  ? 'bg-[var(--navy-700)] text-white'
                  : 'bg-[var(--surface-100)] text-[var(--foreground)] hover:bg-[var(--surface-200)]'
              }`}
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Ports */}
      <div className="p-4 rounded-xl" style={{ background: 'var(--surface-50)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(232, 168, 56, 0.1)' }}>
            <svg className="w-4 h-4 text-[#E8A838]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[var(--foreground)]">Route Information</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
              Origin Port
            </label>
            <select
              name="origin_port"
              value={formData.origin_port}
              onChange={handleChange}
              className="select-field"
            >
              <option value="">Select Port</option>
              {filteredPorts.map(p => (
                <option key={p.port_cd} value={p.port_cd}>{p.port_cd} - {p.port_name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
              Destination Port
            </label>
            <select
              name="dest_port"
              value={formData.dest_port}
              onChange={handleChange}
              className="select-field"
            >
              <option value="">Select Port</option>
              {filteredPorts.map(p => (
                <option key={p.port_cd} value={p.port_cd}>{p.port_cd} - {p.port_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
            ETD (Estimated Departure)
          </label>
          <input
            type="date"
            name="etd"
            value={formData.etd}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
            ETA (Estimated Arrival)
          </label>
          <input
            type="date"
            name="eta"
            value={formData.eta}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      {/* Cargo Details */}
      <div className="p-4 rounded-xl" style={{ background: 'var(--surface-50)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(26, 39, 68, 0.1)' }}>
            <svg className="w-4 h-4 text-[#1A2744]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[var(--foreground)]">Cargo Details</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
              Package Qty
            </label>
            <input
              type="number"
              name="total_pkg_qty"
              value={formData.total_pkg_qty}
              onChange={handleChange}
              placeholder="0"
              className="input-field"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
              Gross Weight (kg)
            </label>
            <input
              type="number"
              name="gross_weight"
              value={formData.gross_weight}
              onChange={handleChange}
              step="0.01"
              placeholder="0.00"
              className="input-field"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
              Volume (CBM)
            </label>
            <input
              type="number"
              name="volume_cbm"
              value={formData.volume_cbm}
              onChange={handleChange}
              step="0.01"
              placeholder="0.00"
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--surface-100)] hover:bg-[var(--surface-200)] transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)',
            color: '#0C1222',
            boxShadow: '0 4px 12px rgba(232, 168, 56, 0.3)',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Create Shipment
        </button>
      </div>
    </form>
  );
}
