'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import ExchangeRateModal from '@/components/ExchangeRateModal';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';

export default function ExportAWBRegisterPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showExchangeRateModal, setShowExchangeRateModal] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    airline_code: '',
    carrier_id: '',
    flight_no: '',
    origin_airport_cd: 'ICN',
    dest_airport_cd: '',
    etd_dt: '',
    etd_time: '',
    eta_dt: '',
    eta_time: '',
    issue_dt: new Date().toISOString().split('T')[0],
    issue_place: 'SEOUL',
    shipper_nm: '',
    shipper_addr: '',
    consignee_nm: '',
    consignee_addr: '',
    notify_party: '',
    pieces: '',
    gross_weight_kg: '',
    charge_weight_kg: '',
    volume_cbm: '',
    commodity_desc: '',
    hs_code: '',
    dimensions: '',
    special_handling: '',
    declared_value: '',
    declared_currency: 'USD',
    insurance_value: '',
    freight_charges: '',
    other_charges: '',
    payment_terms: 'PREPAID',
    remarks: '',
  });

  const handleConfirmClose = () => {
    setShowCloseModal(false);
    router.push('/logis/export-awb/air');
  };

  useCloseConfirm({
    showModal: showCloseModal,
    setShowModal: setShowCloseModal,
    onConfirmClose: handleConfirmClose,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.origin_airport_cd || !formData.dest_airport_cd) {
      alert('출발공항과 도착공항은 필수입니다.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/awb/mawb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pieces: formData.pieces ? parseInt(formData.pieces) : null,
          gross_weight_kg: formData.gross_weight_kg ? parseFloat(formData.gross_weight_kg) : null,
          charge_weight_kg: formData.charge_weight_kg ? parseFloat(formData.charge_weight_kg) : null,
          volume_cbm: formData.volume_cbm ? parseFloat(formData.volume_cbm) : null,
          declared_value: formData.declared_value ? parseFloat(formData.declared_value) : null,
          insurance_value: formData.insurance_value ? parseFloat(formData.insurance_value) : null,
          freight_charges: formData.freight_charges ? parseFloat(formData.freight_charges) : null,
          other_charges: formData.other_charges ? parseFloat(formData.other_charges) : null,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`AWB가 등록되었습니다.\nMAWB No: ${result.mawb_no}`);
        router.push('/logis/export-awb/air');
      } else {
        alert('오류: ' + (result.error || '저장 실패'));
      }
    } catch (error) {
      console.error('Error saving AWB:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowCloseModal(true);
  };

  // 환율 선택 핸들러
  const handleExchangeRateSelect = (rate: { currencyCode: string; dealBasR: number }) => {
    const currencyCode = rate.currencyCode.replace('(100)', '');
    setFormData(prev => ({ ...prev, declared_currency: currencyCode }));
    setExchangeRate(rate.dealBasR);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header title="AWB 등록 (항공수출)" subtitle="Logis > 항공수출 > AWB 관리 > 신규 등록" onClose={handleCancel} />
        <main ref={formRef} className="p-6">
          {/* 항공편 정보 */}
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">항공편 정보</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">항공사 코드</label>
                <input
                  type="text"
                  name="airline_code"
                  value={formData.airline_code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  placeholder="180"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">편명</label>
                <input
                  type="text"
                  name="flight_no"
                  value={formData.flight_no}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  placeholder="KE001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">출발공항 *</label>
                <input
                  type="text"
                  name="origin_airport_cd"
                  value={formData.origin_airport_cd}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  placeholder="ICN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">도착공항 *</label>
                <input
                  type="text"
                  name="dest_airport_cd"
                  value={formData.dest_airport_cd}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  placeholder="LAX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">ETD 일자</label>
                <input
                  type="date"
                  name="etd_dt"
                  value={formData.etd_dt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">ETD 시간</label>
                <input
                  type="time"
                  name="etd_time"
                  value={formData.etd_time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">ETA 일자</label>
                <input
                  type="date"
                  name="eta_dt"
                  value={formData.eta_dt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">ETA 시간</label>
                <input
                  type="time"
                  name="eta_time"
                  value={formData.eta_time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* 거래처 정보 */}
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">거래처 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">송하인 (Shipper)</label>
                <input
                  type="text"
                  name="shipper_nm"
                  value={formData.shipper_nm}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">수하인 (Consignee)</label>
                <input
                  type="text"
                  name="consignee_nm"
                  value={formData.consignee_nm}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">송하인 주소</label>
                <textarea
                  name="shipper_addr"
                  value={formData.shipper_addr}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">수하인 주소</label>
                <textarea
                  name="consignee_addr"
                  value={formData.consignee_addr}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  rows={2}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">통지처 (Notify Party)</label>
                <input
                  type="text"
                  name="notify_party"
                  value={formData.notify_party}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* 화물 정보 */}
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">화물 정보</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">개수 (PCS)</label>
                <input
                  type="number"
                  name="pieces"
                  value={formData.pieces}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">총중량 (KG)</label>
                <input
                  type="number"
                  step="0.001"
                  name="gross_weight_kg"
                  value={formData.gross_weight_kg}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">청구중량 (KG)</label>
                <input
                  type="number"
                  step="0.001"
                  name="charge_weight_kg"
                  value={formData.charge_weight_kg}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">용적 (CBM)</label>
                <input
                  type="number"
                  step="0.001"
                  name="volume_cbm"
                  value={formData.volume_cbm}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">품명</label>
                <input
                  type="text"
                  name="commodity_desc"
                  value={formData.commodity_desc}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">HS Code</label>
                <input
                  type="text"
                  name="hs_code"
                  value={formData.hs_code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">치수 (Dimensions)</label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  placeholder="100x50x30cm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">특수취급 (Special Handling)</label>
                <input
                  type="text"
                  name="special_handling"
                  value={formData.special_handling}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  placeholder="예: FRAGILE, PERISHABLE"
                />
              </div>
            </div>
          </div>

          {/* 운임 정보 */}
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">운임 정보</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">결제조건</label>
                <select
                  name="payment_terms"
                  value={formData.payment_terms}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                >
                  <option value="PREPAID">PREPAID (선불)</option>
                  <option value="COLLECT">COLLECT (착불)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">신고가액</label>
                <input
                  type="number"
                  step="0.01"
                  name="declared_value"
                  value={formData.declared_value}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">통화</label>
                <div className="flex gap-2">
                  <select
                    name="declared_currency"
                    value={formData.declared_currency}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  >
                    <option value="USD">USD</option>
                    <option value="KRW">KRW</option>
                    <option value="EUR">EUR</option>
                    <option value="JPY">JPY</option>
                    <option value="CNY">CNY</option>
                    <option value="GBP">GBP</option>
                    <option value="HKD">HKD</option>
                    <option value="SGD">SGD</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowExchangeRateModal(true)}
                    className="px-3 py-2 bg-[#E8A838] text-[#0C1222] rounded-lg hover:bg-[#D4943A] text-sm font-medium whitespace-nowrap"
                  >
                    환율조회
                  </button>
                </div>
                {exchangeRate && (
                  <p className="mt-1 text-xs text-[#E8A838]">
                    적용환율: {exchangeRate.toLocaleString('ko-KR', { minimumFractionDigits: 2 })} KRW
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">보험가액</label>
                <input
                  type="number"
                  step="0.01"
                  name="insurance_value"
                  value={formData.insurance_value}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">운임</label>
                <input
                  type="number"
                  step="0.01"
                  name="freight_charges"
                  value={formData.freight_charges}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">기타비용</label>
                <input
                  type="number"
                  step="0.01"
                  name="other_charges"
                  value={formData.other_charges}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* 비고 */}
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">비고</h3>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
              rows={3}
            />
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 font-semibold rounded-lg disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)', color: '#0C1222' }}
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </main>
      </div>

      <CloseConfirmModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleConfirmClose}
      />

      <ExchangeRateModal
        isOpen={showExchangeRateModal}
        onClose={() => setShowExchangeRateModal(false)}
        onSelect={handleExchangeRateSelect}
        selectedCurrency={formData.declared_currency}
      />
    </div>
  );
}
