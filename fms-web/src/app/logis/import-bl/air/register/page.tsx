'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { useScreenClose } from '@/hooks/useScreenClose';
import { LIST_PATHS } from '@/constants/paths';
import { DimensionsCalculatorModal, type DimensionItem } from '@/components/popup';

interface AWBFormData {
  awbNo: string;
  awbType: string;
  mawbNo: string;
  airline: string;
  flightNo: string;
  origin: string;
  destination: string;
  etd: string;
  etdTime: string;
  eta: string;
  etaTime: string;
  shipperName: string;
  shipperAddress: string;
  consigneeName: string;
  consigneeAddress: string;
  notifyParty: string;
  pieces: number;
  grossWeight: number;
  chargeWeight: number;
  volume: number;
  commodity: string;
  hsCode: string;
  dimensions: string;
  specialHandling: string;
  declaredValue: number;
  declaredCurrency: string;
  insuranceValue: number;
  freightCharges: number;
  otherCharges: number;
  paymentTerms: string;
  status: string;
  remarks: string;
}

const initialFormData: AWBFormData = {
  awbNo: '',
  awbType: 'MAWB',
  mawbNo: '',
  airline: '',
  flightNo: '',
  origin: 'ICN',
  destination: '',
  etd: '',
  etdTime: '',
  eta: '',
  etaTime: '',
  shipperName: '',
  shipperAddress: '',
  consigneeName: '',
  consigneeAddress: '',
  notifyParty: '',
  pieces: 0,
  grossWeight: 0,
  chargeWeight: 0,
  volume: 0,
  commodity: '',
  hsCode: '',
  dimensions: '',
  specialHandling: '',
  declaredValue: 0,
  declaredCurrency: 'USD',
  insuranceValue: 0,
  freightCharges: 0,
  otherCharges: 0,
  paymentTerms: 'PREPAID',
  status: 'DRAFT',
  remarks: '',
};

export default function AWBRegisterPage() {
  const router = useRouter();
  const [showDimensionsCalculator, setShowDimensionsCalculator] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });


  // useScreenClose 훅
  const {
    showModal: showCloseModal,
    handleCloseClick,
    handleModalClose,
    handleDiscard: handleDiscardChanges,
  } = useScreenClose({
    hasChanges: false,  // 이 페이지는 변경사항 추적 없음
    listPath: LIST_PATHS.IMPORT_BL_AIR,
  });

  const [formData, setFormData] = useState<AWBFormData>(initialFormData);
  const [isNewMode, setIsNewMode] = useState(true); // 신규 입력 모드 (신규버튼 비활성화 제어)
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof AWBFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.airline) { alert('항공사를 선택하세요.'); return; }
    if (!formData.origin) { alert('출발지를 입력하세요.'); return; }
    if (!formData.destination) { alert('도착지를 입력하세요.'); return; }
    if (!formData.shipperName) { alert('송하인을 입력하세요.'); return; }

    setLoading(true);
    try {
      // MAWB 또는 HAWB API 호출
      const apiUrl = formData.awbType === 'MAWB' ? '/api/awb/mawb' : '/api/awb/hawb';
      const payload = formData.awbType === 'MAWB' ? {
        carrier_id: 1, // 임시 carrier_id (실제로는 airline 코드로 매핑 필요)
        airline_code: formData.airline,
        flight_no: formData.flightNo,
        origin_airport_cd: formData.origin,
        dest_airport_cd: formData.destination,
        etd_dt: formData.etd || null,
        etd_time: formData.etdTime || null,
        eta_dt: formData.eta || null,
        eta_time: formData.etaTime || null,
        shipper_nm: formData.shipperName,
        shipper_addr: formData.shipperAddress,
        consignee_nm: formData.consigneeName,
        consignee_addr: formData.consigneeAddress,
        notify_party: formData.notifyParty,
        pieces: formData.pieces || null,
        gross_weight_kg: formData.grossWeight || null,
        charge_weight_kg: formData.chargeWeight || null,
        volume_cbm: formData.volume || null,
        commodity_desc: formData.commodity,
        hs_code: formData.hsCode,
        dimensions: formData.dimensions,
        special_handling: formData.specialHandling,
        declared_value: formData.declaredValue || null,
        declared_currency: formData.declaredCurrency,
        insurance_value: formData.insuranceValue || null,
        freight_charges: formData.freightCharges || null,
        other_charges: formData.otherCharges || null,
        payment_terms: formData.paymentTerms,
        remarks: formData.remarks,
      } : {
        shipment_id: 1, // 임시 shipment_id
        customer_id: 1, // 임시 customer_id
        carrier_id: 1,
        airline_code: formData.airline,
        flight_no: formData.flightNo,
        origin_airport_cd: formData.origin,
        dest_airport_cd: formData.destination,
        etd_dt: formData.etd || null,
        etd_time: formData.etdTime || null,
        eta_dt: formData.eta || null,
        eta_time: formData.etaTime || null,
        shipper_nm: formData.shipperName,
        shipper_addr: formData.shipperAddress,
        consignee_nm: formData.consigneeName,
        consignee_addr: formData.consigneeAddress,
        notify_party: formData.notifyParty,
        pieces: formData.pieces || null,
        gross_weight_kg: formData.grossWeight || null,
        charge_weight_kg: formData.chargeWeight || null,
        volume_cbm: formData.volume || null,
        commodity_desc: formData.commodity,
        hs_code: formData.hsCode,
        dimensions: formData.dimensions,
        special_handling: formData.specialHandling,
        declared_value: formData.declaredValue || null,
        declared_currency: formData.declaredCurrency,
        insurance_value: formData.insuranceValue || null,
        freight_charges: formData.freightCharges || null,
        other_charges: formData.otherCharges || null,
        payment_terms: formData.paymentTerms,
        remarks: formData.remarks,
      };

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setIsNewMode(false);
        const awbNo = formData.awbType === 'MAWB' ? result.mawb_no : result.hawb_no;
        alert(`AWB가 등록되었습니다.\nAWB No: ${awbNo}`);
        router.push('/logis/import-bl/air');
      } else {
        alert(result.error || 'AWB 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('AWB 등록 오류:', error);
      alert('AWB 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillTestData = () => {
    setFormData({
      ...initialFormData,
      awbNo: '180-12345680',
      awbType: 'MAWB',
      airline: 'KE',
      flightNo: 'KE001',
      origin: 'ICN',
      destination: 'LAX',
      etd: '2026-01-25',
      etdTime: '10:00',
      eta: '2026-01-25',
      etaTime: '08:30',
      shipperName: '삼성전자 주식회사',
      shipperAddress: '경기도 수원시 영통구 삼성로 129',
      consigneeName: 'Samsung America Inc.',
      consigneeAddress: '85 Challenger Road, Ridgefield Park, NJ 07660',
      notifyParty: 'SAME AS CONSIGNEE',
      pieces: 100,
      grossWeight: 5000,
      chargeWeight: 5500,
      volume: 35.5,
      commodity: 'ELECTRONIC COMPONENTS',
      hsCode: '8528.72',
      dimensions: '120x80x100 CM',
      specialHandling: '',
      declaredValue: 150000,
      declaredCurrency: 'USD',
      insuranceValue: 155000,
      freightCharges: 5500,
      otherCharges: 850,
      paymentTerms: 'PREPAID',
      status: 'DRAFT',
      remarks: '파손주의 (FRAGILE)',
    });
  };

  const handleReset = () => {
    if (!confirm('입력한 내용을 모두 초기화하시겠습니까?')) return;
    setFormData(initialFormData);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header title="AWB 등록 (항공)" subtitle="Logis > AWB 관리 > AWB 등록 (항공)" onClose={handleCloseClick} />
        <main ref={formRef} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button onClick={handleFillTestData} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">테스트데이터</button>
              <button
                onClick={() => { setFormData(initialFormData); setIsNewMode(true); }}
                disabled={isNewMode}
                className={`px-4 py-2 rounded-lg ${isNewMode ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >신규</button>
              <button onClick={handleReset} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">초기화</button>
              <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 font-semibold rounded-lg disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)', color: '#0C1222' }}>{loading ? '저장 중...' : '저장'}</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-[var(--border)]">AWB 기본 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">AWB 번호 *</label><input type="text" value={formData.awbNo} onChange={e => handleChange('awbNo', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="180-12345678" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">AWB 타입</label><select value={formData.awbType} onChange={e => handleChange('awbType', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"><option value="MAWB">MAWB</option><option value="HAWB">HAWB</option></select></div>
                {formData.awbType === 'HAWB' && (
                  <div className="col-span-2"><label className="block text-sm font-medium mb-1 text-[var(--muted)]">MAWB 번호</label><input type="text" value={formData.mawbNo} onChange={e => handleChange('mawbNo', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="연결된 MAWB 번호" /></div>
                )}
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">항공사 *</label><select value={formData.airline} onChange={e => handleChange('airline', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"><option value="">선택</option><option value="KE">대한항공 (KE)</option><option value="OZ">아시아나 (OZ)</option><option value="CX">캐세이퍼시픽 (CX)</option><option value="SQ">싱가포르항공 (SQ)</option></select></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">편명</label><input type="text" value={formData.flightNo} onChange={e => handleChange('flightNo', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="KE001" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">출발지</label><input type="text" value={formData.origin} onChange={e => handleChange('origin', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="ICN" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">도착지</label><input type="text" value={formData.destination} onChange={e => handleChange('destination', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="LAX" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">ETD 일자</label><input type="date" value={formData.etd} onChange={e => handleChange('etd', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">ETD 시간</label><input type="time" value={formData.etdTime} onChange={e => handleChange('etdTime', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">ETA 일자</label><input type="date" value={formData.eta} onChange={e => handleChange('eta', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">ETA 시간</label><input type="time" value={formData.etaTime} onChange={e => handleChange('etaTime', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-[var(--border)]">송수하인 정보</h3>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">송하인 (Shipper) *</label><input type="text" value={formData.shipperName} onChange={e => handleChange('shipperName', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="회사명" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">송하인 주소</label><textarea value={formData.shipperAddress} onChange={e => handleChange('shipperAddress', e.target.value)} rows={2} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="주소" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">수하인 (Consignee)</label><input type="text" value={formData.consigneeName} onChange={e => handleChange('consigneeName', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="회사명" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">수하인 주소</label><textarea value={formData.consigneeAddress} onChange={e => handleChange('consigneeAddress', e.target.value)} rows={2} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="주소" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">Notify Party</label><input type="text" value={formData.notifyParty} onChange={e => handleChange('notifyParty', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="SAME AS CONSIGNEE" /></div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-[var(--border)]">화물 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">Pieces</label><input type="number" value={formData.pieces} onChange={e => handleChange('pieces', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">Gross Weight (KG)</label><input type="number" value={formData.grossWeight} onChange={e => handleChange('grossWeight', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">Charge Weight (KG)</label><input type="number" value={formData.chargeWeight} onChange={e => handleChange('chargeWeight', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">Volume (CBM)</label><div className="flex gap-2"><input type="number" step="0.01" value={formData.volume} onChange={e => handleChange('volume', parseFloat(e.target.value) || 0)} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /><button type="button" onClick={() => setShowDimensionsCalculator(true)} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">계산</button></div></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">Commodity</label><input type="text" value={formData.commodity} onChange={e => handleChange('commodity', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="품명" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">HS Code</label><input type="text" value={formData.hsCode} onChange={e => handleChange('hsCode', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="8528.72" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">Dimensions</label><input type="text" value={formData.dimensions} onChange={e => handleChange('dimensions', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="L x W x H CM" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">Special Handling</label><input type="text" value={formData.specialHandling} onChange={e => handleChange('specialHandling', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="PER, DGR 등" /></div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-[var(--border)]">운임/가액 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">Declared Value</label><input type="number" value={formData.declaredValue} onChange={e => handleChange('declaredValue', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">Currency</label><select value={formData.declaredCurrency} onChange={e => handleChange('declaredCurrency', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"><option value="USD">USD</option><option value="KRW">KRW</option><option value="EUR">EUR</option></select></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">Insurance Value</label><input type="number" value={formData.insuranceValue} onChange={e => handleChange('insuranceValue', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">Payment Terms</label><select value={formData.paymentTerms} onChange={e => handleChange('paymentTerms', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"><option value="PREPAID">PREPAID</option><option value="COLLECT">COLLECT</option></select></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">Freight Charges</label><input type="number" value={formData.freightCharges} onChange={e => handleChange('freightCharges', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">Other Charges</label><input type="number" value={formData.otherCharges} onChange={e => handleChange('otherCharges', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-1 text-[var(--muted)]">비고</label><textarea value={formData.remarks} onChange={e => handleChange('remarks', e.target.value)} rows={2} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="특이사항" /></div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Dimensions 계산 모달 */}
      <DimensionsCalculatorModal
        isOpen={showDimensionsCalculator}
        onClose={() => setShowDimensionsCalculator(false)}
        onApply={(totalCbm) => handleChange('volume', totalCbm)}
      />    </div>
  );
}
