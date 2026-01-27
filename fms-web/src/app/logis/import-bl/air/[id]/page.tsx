'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import AWBPrintModal, { AWBData as AWBPrintData } from '@/components/AWBPrintModal';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';
import { LIST_PATHS } from '@/constants/paths';

interface AWBDetailData {
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
  atd: string;
  ata: string;
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
  createdAt: string;
  updatedAt: string;
}

interface TrackingEvent {
  id: number;
  datetime: string;
  location: string;
  event: string;
  status: string;
}

const mockAWBData: AWBDetailData = {
  awbNo: '180-12345678',
  awbType: 'MAWB',
  mawbNo: '',
  airline: 'KE',
  flightNo: 'KE001',
  origin: 'ICN',
  destination: 'LAX',
  etd: '2026-01-25',
  etdTime: '10:00',
  eta: '2026-01-25',
  etaTime: '08:30',
  atd: '2026-01-25',
  ata: '',
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
  status: 'DEPARTED',
  remarks: '파손주의 (FRAGILE)',
  createdAt: '2026-01-20 10:00:00',
  updatedAt: '2026-01-25 11:30:00',
};

const mockTracking: TrackingEvent[] = [
  { id: 1, datetime: '2026-01-20 10:00', location: 'ICN', event: 'AWB 생성', status: 'CREATED' },
  { id: 2, datetime: '2026-01-24 14:00', location: 'ICN', event: '화물 인수', status: 'ACCEPTED' },
  { id: 3, datetime: '2026-01-24 18:00', location: 'ICN', event: '보세구역 반입', status: 'IN_BOND' },
  { id: 4, datetime: '2026-01-25 08:30', location: 'ICN', event: '적재 완료', status: 'LOADED' },
  { id: 5, datetime: '2026-01-25 10:15', location: 'ICN', event: '항공기 출발', status: 'DEPARTED' },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '작성중', color: 'bg-gray-500' },
  BOOKED: { label: '부킹', color: 'bg-blue-500' },
  ACCEPTED: { label: '수탁', color: 'bg-cyan-500' },
  DEPARTED: { label: '출발', color: 'bg-purple-500' },
  IN_TRANSIT: { label: '운송중', color: 'bg-yellow-500' },
  ARRIVED: { label: '도착', color: 'bg-green-500' },
  DELIVERED: { label: '인도완료', color: 'bg-gray-600' },
};

export default function AWBDetailPage() {
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const params = useParams();
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const [data, setData] = useState<AWBDetailData | null>(null);
  const [tracking] = useState<TrackingEvent[]>(mockTracking);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<AWBDetailData | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // AWB 출력용 데이터 변환
  const awbPrintData: AWBPrintData | null = useMemo(() => {
    if (!data) return null;
    return {
      hawbNo: data.awbType === 'HAWB' ? data.awbNo : '',
      mawbNo: data.awbType === 'MAWB' ? data.awbNo : data.mawbNo,
      awbDate: data.etd || '',
      shipper: data.shipperName || '',
      shipperAddress: data.shipperAddress || '',
      consignee: data.consigneeName || '',
      consigneeAddress: data.consigneeAddress || '',
      carrier: data.airline || '',
      carrierCode: data.airline || '',
      origin: data.origin || '',
      destination: data.destination || '',
      flightNo: data.flightNo || '',
      flightDate: data.etd || '',
      pieces: data.pieces || 0,
      weightUnit: 'K' as const,
      grossWeight: data.grossWeight || 0,
      chargeableWeight: data.chargeWeight,
      natureOfGoods: data.commodity || '',
      dimensions: data.dimensions || '',
      volumeWeight: data.volume ? data.volume * 166.67 : undefined,
      currency: data.declaredCurrency || 'USD',
      declaredValueCarriage: data.declaredValue ? String(data.declaredValue) : 'NVD',
      declaredValueCustoms: data.declaredValue ? String(data.declaredValue) : 'NCV',
      insuranceAmount: data.insuranceValue ? String(data.insuranceValue) : 'NIL',
      totalCharge: data.freightCharges,
      totalPrepaid: data.paymentTerms === 'PREPAID' ? data.freightCharges : undefined,
      totalCollect: data.paymentTerms === 'COLLECT' ? data.freightCharges : undefined,
      handlingInfo: data.specialHandling || '',
      executedAt: 'SEOUL, KOREA',
      executedOn: data.etd || '',
      issuerName: 'INTERGIS LOGISTICS CO., LTD.',
    };
  }, [data]);

  useEffect(() => {
    setData(mockAWBData);
    setEditData(mockAWBData);
  }, [params.id]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => { setIsEditing(false); setEditData(data); };
  const handleSave = () => {
    if (editData) {
      setData(editData);
      setIsEditing(false);
      alert('AWB가 수정되었습니다.');
    }
  };

  const handleChange = (field: keyof AWBDetailData, value: string | number) => {
    if (editData) setEditData({ ...editData, [field]: value });
  };

  const handleDelete = () => {
    if (confirm('이 AWB를 삭제하시겠습니까?')) {
      alert('AWB가 삭제되었습니다.');
      router.push('/logis/import-bl/air');
    }
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  if (!data) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">로딩 중...</div>;

  const displayData = isEditing ? editData! : data;

  const handleCloseClick = () => {
    setShowCloseModal(true);
  };

  const handleConfirmClose = () => {
    setShowCloseModal(false);
    router.push(LIST_PATHS.IMPORT_BL_AIR);
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
        <Header title="AWB 상세조회 (항공)" subtitle="Logis > AWB 관리 > AWB 상세조회 (항공)" showCloseButton={false} />
        <main ref={formRef} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 text-sm rounded-full text-white ${statusConfig[displayData.status].color}`}>{statusConfig[displayData.status].label}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => router.push('/logis/import-bl/air')} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">목록</button>
              <button onClick={handlePrint} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">출력</button>
              {isEditing ? (
                <>
                  <button onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">취소</button>
                  <button onClick={handleSave} className="px-6 py-2 font-semibold rounded-lg" style={{ background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)', color: '#0C1222' }}>저장</button>
                </>
              ) : (
                <>
                  <button onClick={handleEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">수정</button>
                  <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">삭제</button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-[var(--border)]">AWB 정보</h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-[var(--muted)]">AWB No.</span><span className="font-mono font-bold text-lg">{displayData.awbNo}</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">타입</span><span className={`px-2 py-1 text-xs rounded-full ${displayData.awbType === 'MAWB' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{displayData.awbType}</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">항공사</span><span>{displayData.airline === 'KE' ? '대한항공 (KE)' : displayData.airline}</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">편명</span><span>{displayData.flightNo}</span></div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-[var(--border)]">일정 정보</h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-[var(--muted)]">구간</span><span>{displayData.origin} → {displayData.destination}</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">ETD</span><span>{displayData.etd} {displayData.etdTime}</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">ETA</span><span>{displayData.eta} {displayData.etaTime}</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">ATD</span><span className={displayData.atd ? '' : 'text-[var(--muted)]'}>{displayData.atd || '-'}</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">ATA</span><span className={displayData.ata ? '' : 'text-[var(--muted)]'}>{displayData.ata || '-'}</span></div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-[var(--border)]">화물 요약</h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-[var(--muted)]">PCS</span><span className="font-bold">{displayData.pieces}</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">G/W</span><span className="font-bold">{displayData.grossWeight.toLocaleString()} KG</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">C/W</span><span className="font-bold">{displayData.chargeWeight.toLocaleString()} KG</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">Volume</span><span>{displayData.volume} CBM</span></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-[var(--border)]">송하인 (Shipper)</h3>
              <div className="space-y-3">
                <div><label className="block text-sm text-[var(--muted)]">회사명</label><input type="text" value={displayData.shipperName} disabled={!isEditing} onChange={e => handleChange('shipperName', e.target.value)} className={`w-full px-3 py-2 border border-[var(--border)] rounded-lg ${isEditing ? 'bg-[var(--surface-50)]' : 'bg-[var(--surface-100)] text-[var(--muted)]'}`} /></div>
                <div><label className="block text-sm text-[var(--muted)]">주소</label><textarea value={displayData.shipperAddress} disabled={!isEditing} onChange={e => handleChange('shipperAddress', e.target.value)} rows={2} className={`w-full px-3 py-2 border border-[var(--border)] rounded-lg ${isEditing ? 'bg-[var(--surface-50)]' : 'bg-[var(--surface-100)] text-[var(--muted)]'}`} /></div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-[var(--border)]">수하인 (Consignee)</h3>
              <div className="space-y-3">
                <div><label className="block text-sm text-[var(--muted)]">회사명</label><input type="text" value={displayData.consigneeName} disabled={!isEditing} onChange={e => handleChange('consigneeName', e.target.value)} className={`w-full px-3 py-2 border border-[var(--border)] rounded-lg ${isEditing ? 'bg-[var(--surface-50)]' : 'bg-[var(--surface-100)] text-[var(--muted)]'}`} /></div>
                <div><label className="block text-sm text-[var(--muted)]">주소</label><textarea value={displayData.consigneeAddress} disabled={!isEditing} onChange={e => handleChange('consigneeAddress', e.target.value)} rows={2} className={`w-full px-3 py-2 border border-[var(--border)] rounded-lg ${isEditing ? 'bg-[var(--surface-50)]' : 'bg-[var(--surface-100)] text-[var(--muted)]'}`} /></div>
                <div><label className="block text-sm text-[var(--muted)]">Notify Party</label><input type="text" value={displayData.notifyParty} disabled={!isEditing} onChange={e => handleChange('notifyParty', e.target.value)} className={`w-full px-3 py-2 border border-[var(--border)] rounded-lg ${isEditing ? 'bg-[var(--surface-50)]' : 'bg-[var(--surface-100)] text-[var(--muted)]'}`} /></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-[var(--border)]">화물 상세</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-[var(--muted)]">Commodity</label><input type="text" value={displayData.commodity} disabled={!isEditing} onChange={e => handleChange('commodity', e.target.value)} className={`w-full px-3 py-2 border border-[var(--border)] rounded-lg ${isEditing ? 'bg-[var(--surface-50)]' : 'bg-[var(--surface-100)] text-[var(--muted)]'}`} /></div>
                <div><label className="block text-sm text-[var(--muted)]">HS Code</label><input type="text" value={displayData.hsCode} disabled={!isEditing} onChange={e => handleChange('hsCode', e.target.value)} className={`w-full px-3 py-2 border border-[var(--border)] rounded-lg ${isEditing ? 'bg-[var(--surface-50)]' : 'bg-[var(--surface-100)] text-[var(--muted)]'}`} /></div>
                <div><label className="block text-sm text-[var(--muted)]">Dimensions</label><input type="text" value={displayData.dimensions} disabled={!isEditing} onChange={e => handleChange('dimensions', e.target.value)} className={`w-full px-3 py-2 border border-[var(--border)] rounded-lg ${isEditing ? 'bg-[var(--surface-50)]' : 'bg-[var(--surface-100)] text-[var(--muted)]'}`} /></div>
                <div><label className="block text-sm text-[var(--muted)]">Special Handling</label><input type="text" value={displayData.specialHandling || '-'} disabled={!isEditing} onChange={e => handleChange('specialHandling', e.target.value)} className={`w-full px-3 py-2 border border-[var(--border)] rounded-lg ${isEditing ? 'bg-[var(--surface-50)]' : 'bg-[var(--surface-100)] text-[var(--muted)]'}`} /></div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-[var(--border)]">운임/가액 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-[var(--muted)]">Declared Value</label><div className="px-3 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg">{displayData.declaredCurrency} {displayData.declaredValue.toLocaleString()}</div></div>
                <div><label className="block text-sm text-[var(--muted)]">Insurance Value</label><div className="px-3 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg">{displayData.declaredCurrency} {displayData.insuranceValue.toLocaleString()}</div></div>
                <div><label className="block text-sm text-[var(--muted)]">Freight Charges</label><div className="px-3 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg">{displayData.declaredCurrency} {displayData.freightCharges.toLocaleString()}</div></div>
                <div><label className="block text-sm text-[var(--muted)]">Other Charges</label><div className="px-3 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg">{displayData.declaredCurrency} {displayData.otherCharges.toLocaleString()}</div></div>
                <div className="col-span-2"><label className="block text-sm text-[var(--muted)]">Payment Terms</label><div className="px-3 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg">{displayData.paymentTerms}</div></div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 pb-2 border-b border-[var(--border)]">운송 추적</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border)]"></div>
              <div className="space-y-4">
                {tracking.map((event, index) => (
                  <div key={event.id} className="flex items-start gap-4 pl-8 relative">
                    <div className={`absolute left-2 w-4 h-4 rounded-full border-2 ${index === tracking.length - 1 ? 'bg-blue-500 border-blue-500' : 'bg-[var(--surface-50)] border-[var(--border)]'}`}></div>
                    <div className="flex-1 bg-[var(--surface-50)] p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">{event.event}</span>
                          <span className="ml-2 text-sm text-[var(--muted)]">({event.location})</span>
                        </div>
                        <span className="text-sm text-[var(--muted)]">{event.datetime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-[var(--muted)]">
            <span>등록일: {data.createdAt}</span>
            <span className="ml-4">수정일: {data.updatedAt}</span>
          </div>
        </main>
      </div>

      {/* 화면 닫기 확인 모달 */}
      <CloseConfirmModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleConfirmClose}
      />

      {/* AWB 출력 모달 */}
      <AWBPrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        awbData={awbPrintData}
      />
    </div>
  );
}
