'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';
import { LIST_PATHS } from '@/constants/paths';

interface ShipmentData {
  shipment: {
    id: number;
    shipmentNo: string;
    transportMode: string;
    tradeType: string;
    serviceType: string;
    incoterms: string;
    status: string;
    customsStatus: string;
    progress: number;
    customer: { id: number; name: string; code: string };
    shipper: { id: number; name: string };
    consignee: { id: number; name: string };
    carrier: { id: number; name: string; code: string };
    origin: {
      countryCode: string;
      countryName: string;
      portCode: string;
      portName: string;
      address: string;
      lat: number | null;
      lng: number | null;
    };
    destination: {
      countryCode: string;
      countryName: string;
      portCode: string;
      portName: string;
      finalDest: string;
      address: string;
      lat: number | null;
      lng: number | null;
    };
    schedule: {
      cargoReadyDate: string;
      etd: string;
      atd: string;
      eta: string;
      ata: string;
    };
    cargo: {
      totalPackages: number;
      packageType: string;
      grossWeight: number;
      volume: number;
      chargeableWeight: number;
    };
    value: {
      declaredAmount: number;
      declaredCurrency: string;
      insuranceAmount: number;
      insuranceCurrency: string;
    };
    terms: {
      freightTerm: string;
      paymentTerm: string;
    };
    references: {
      customerRef: string;
      poNo: string;
      soNo: string;
    };
    remarks: string;
    specialInstructions: string;
    salesManager: number;
    opsManager: number;
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
  };
  shippingRequest: any;
  shippingNotice: any;
  containers: any[];
  timeline: {
    type: string;
    title: string;
    description: string;
    datetime: string;
    status: string;
    isEstimate?: boolean;
    location?: string;
  }[];
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  DRAFT: { label: '작성중', color: '#6B7280', bgColor: '#F3F4F6' },
  BOOKED: { label: '부킹확정', color: '#2563EB', bgColor: '#DBEAFE' },
  DEPARTED: { label: '출발', color: '#F59E0B', bgColor: '#FEF3C7' },
  SHIPPED: { label: '선적', color: '#8B5CF6', bgColor: '#EDE9FE' },
  IN_TRANSIT: { label: '운송중', color: '#14B8A6', bgColor: '#CCFBF1' },
  ARRIVED: { label: '도착', color: '#059669', bgColor: '#D1FAE5' },
  COMPLETED: { label: '완료', color: '#059669', bgColor: '#D1FAE5' },
  CANCELLED: { label: '취소', color: '#DC2626', bgColor: '#FEE2E2' },
};

const transportModeConfig: Record<string, { label: string; icon: string; color: string }> = {
  SEA: { label: '해상', icon: '🚢', color: '#3B82F6' },
  AIR: { label: '항공', icon: '✈️', color: '#8B5CF6' },
  RAIL: { label: '철도', icon: '🚃', color: '#F59E0B' },
  TRUCK: { label: '육상', icon: '🚛', color: '#10B981' },
};

// 샘플 선적 데이터
const sampleShipmentData: ShipmentData = {
  shipment: {
    id: 1,
    shipmentNo: 'SHP-2026-00001',
    transportMode: 'SEA',
    tradeType: 'EXPORT',
    serviceType: 'FCL',
    incoterms: 'FOB',
    status: 'IN_TRANSIT',
    customsStatus: 'CLEARED',
    progress: 65,
    customer: { id: 1, name: '삼성전자', code: 'SAMS001' },
    shipper: { id: 1, name: '삼성전자 수원사업장' },
    consignee: { id: 2, name: 'Samsung America Inc.' },
    carrier: { id: 1, name: 'Maersk Line', code: 'MAEU' },
    origin: {
      countryCode: 'KR',
      countryName: '대한민국',
      portCode: 'KRPUS',
      portName: '부산항',
      address: '부산광역시 남구 신선로 352',
      lat: 35.1028,
      lng: 129.0403,
    },
    destination: {
      countryCode: 'US',
      countryName: '미국',
      portCode: 'USLAX',
      portName: 'Los Angeles',
      finalDest: 'Dallas, TX',
      address: '301 E. Ocean Blvd., Long Beach, CA',
      lat: 33.7701,
      lng: -118.1937,
    },
    schedule: {
      cargoReadyDate: '2026-01-15',
      etd: '2026-01-20',
      atd: '2026-01-20',
      eta: '2026-02-05',
      ata: '',
    },
    cargo: {
      totalPackages: 150,
      packageType: 'PALLET',
      grossWeight: 12500,
      volume: 45.5,
      chargeableWeight: 12500,
    },
    value: {
      declaredAmount: 250000,
      declaredCurrency: 'USD',
      insuranceAmount: 260000,
      insuranceCurrency: 'USD',
    },
    terms: {
      freightTerm: 'PREPAID',
      paymentTerm: 'T/T 30 DAYS',
    },
    references: {
      customerRef: 'PO-2026-12345',
      poNo: 'PO-2026-12345',
      soNo: 'SO-2026-00789',
    },
    remarks: '취급주의 화물',
    specialInstructions: '하역 시 충격 주의',
    salesManager: 1,
    opsManager: 2,
    createdBy: 'admin',
    createdAt: '2026-01-10T09:00:00Z',
    updatedBy: 'admin',
    updatedAt: '2026-01-20T15:30:00Z',
  },
  shippingRequest: {
    SR_NO: 'SR-2026-00001',
    STATUS_CD: 'CONFIRMED',
    CARGO_READY_DT: '2026-01-15',
    COMMODITY_DESC: '전자제품 (반도체)',
  },
  shippingNotice: {
    SN_NO: 'SN-2026-00001',
    VESSEL_FLIGHT: 'MAERSK HANGZHOU',
    VOYAGE_NO: '001E',
    SEND_STATUS_CD: 'SENT',
  },
  containers: [
    { CNTR_NO: 'MSKU1234567', CNTR_SIZE_CD: '40', CNTR_TYPE_CD: 'HC', SEAL_NO: 'SEAL001', GROSS_WEIGHT_KG: 8500, STATUS_CD: 'ACTIVE' },
    { CNTR_NO: 'MSKU7654321', CNTR_SIZE_CD: '40', CNTR_TYPE_CD: 'HC', SEAL_NO: 'SEAL002', GROSS_WEIGHT_KG: 4000, STATUS_CD: 'ACTIVE' },
  ],
  timeline: [
    { type: 'booking', title: '부킹 접수', description: '선사 부킹이 확정되었습니다.', datetime: '2026-01-12T10:00:00Z', status: 'completed', location: '부산항' },
    { type: 'pickup', title: '화물 픽업', description: '화물이 공장에서 픽업되었습니다.', datetime: '2026-01-18T08:00:00Z', status: 'completed', location: '수원 공장' },
    { type: 'customs', title: '수출 통관', description: '수출 통관이 완료되었습니다.', datetime: '2026-01-19T14:00:00Z', status: 'completed', location: '부산세관' },
    { type: 'departure', title: '출항', description: '선박이 부산항에서 출항하였습니다.', datetime: '2026-01-20T06:00:00Z', status: 'completed', location: '부산항' },
    { type: 'transit', title: '운송 중', description: '현재 태평양을 횡단 중입니다.', datetime: '2026-01-28T12:00:00Z', status: 'in_progress', location: '태평양' },
    { type: 'arrival', title: '도착 예정', description: 'LA항 도착 예정', datetime: '2026-02-05T08:00:00Z', status: 'pending', isEstimate: true, location: 'LA항' },
  ],
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
};

export default function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [data, setData] = useState<ShipmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'documents'>('overview');

  const fetchShipment = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shipments/${resolvedParams.id}`);
      if (!response.ok) {
        // API 실패 시 샘플 데이터 사용
        setData({
          ...sampleShipmentData,
          shipment: {
            ...sampleShipmentData.shipment,
            shipmentNo: `SHP-${resolvedParams.id}`,
          },
        });
        return;
      }
      const result = await response.json();
      if (result && result.shipment) {
        setData(result);
      } else {
        // 데이터가 비어있는 경우 샘플 데이터 사용
        setData({
          ...sampleShipmentData,
          shipment: {
            ...sampleShipmentData.shipment,
            shipmentNo: `SHP-${resolvedParams.id}`,
          },
        });
      }
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      // API 호출 실패 시 샘플 데이터 사용
      setData({
        ...sampleShipmentData,
        shipment: {
          ...sampleShipmentData.shipment,
          shipmentNo: `SHP-${resolvedParams.id}`,
        },
      });
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    fetchShipment();
  }, [fetchShipment]);

  const handleCloseClick = () => {
    setShowCloseModal(true);
  };

  const handleConfirmClose = () => {
    setShowCloseModal(false);
    router.push(LIST_PATHS.SHIPMENT);
  };

  useCloseConfirm({
    showModal: showCloseModal,
    setShowModal: setShowCloseModal,
    onConfirmClose: handleConfirmClose,
  });

  const handleList = () => {
    router.push('/logis');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8A838] mx-auto"></div>
          <p className="mt-4 text-[var(--muted)]">선적 정보를 불러오는 중...</p>
        </div>
      </div>
  );
}

  if (!data) {
    return (
          <PageLayout title="선적 상세조회" subtitle="물류관리 > 선적관리 > 상세조회" showCloseButton={false} >
          <main className="p-6">
            <div className="card p-12 text-center">
              <svg className="w-16 h-16 text-[var(--muted)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">선적 정보를 찾을 수 없습니다</h3>
              <p className="text-[var(--muted)] mb-6">요청하신 선적 정보가 존재하지 않습니다.</p>
              <button onClick={handleList} className="px-6 py-2 bg-[#1A2744] text-white rounded-lg hover:bg-[#243354]">
                메인으로 돌아가기
              </button>
            </div>
          </main>
      </PageLayout>
    );
  }

  const { shipment, timeline, containers, shippingRequest, shippingNotice } = data;
  const status = statusConfig[shipment.status] || statusConfig.DRAFT;
  const transportMode = transportModeConfig[shipment.transportMode] || transportModeConfig.SEA;

  return (
        <PageLayout title="선적 상세조회" subtitle="물류관리 > 선적관리 > 상세조회" showCloseButton={false} >

        <main className="p-6">
          {/* 상단 헤더 */}
          <div className="card mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${transportMode.color}20` }}>
                    {transportMode.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold text-[var(--foreground)]">{shipment.shipmentNo}</h1>
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{ color: status.color, backgroundColor: status.bgColor }}
                      >
                        {status.label}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#1A2744] text-white">
                        {transportMode.label}
                      </span>
                    </div>
                    <p className="text-[var(--muted)] mt-1">
                      {shipment.origin.portName || shipment.origin.portCode} → {shipment.destination.portName || shipment.destination.portCode}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleList} className="px-4 py-2 bg-[var(--surface-100)] text-[var(--foreground)] font-semibold rounded-lg hover:bg-[var(--surface-200)] transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    메인
                  </button>
                </div>
              </div>

              {/* 진행률 */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--muted)]">운송 진행률</span>
                  <span className="text-sm font-bold" style={{ color: transportMode.color }}>{shipment.progress}%</span>
                </div>
                <div className="w-full h-3 bg-[var(--surface-100)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${shipment.progress}%`, backgroundColor: transportMode.color }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 탭 */}
          <div className="flex gap-1 border-b border-[var(--border)] mb-6">
            {[
              { key: 'overview', label: '기본정보' },
              { key: 'timeline', label: '트래킹' },
              { key: 'documents', label: '관련서류' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-3 font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.key
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[var(--surface-100)] text-[var(--muted)] hover:bg-[var(--surface-200)] hover:text-[var(--foreground)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 기본정보 탭 */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 운송 정보 */}
              <div className="card">
                <div className="p-4 border-b border-[var(--border)]">
                  <h3 className="text-lg font-bold text-[var(--foreground)]">운송 정보</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-6 gap-6">
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">운송모드</label>
                      <p className="text-[var(--foreground)] font-medium">{transportMode.icon} {transportMode.label}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">수출입</label>
                      <p className="text-[var(--foreground)] font-medium">{shipment.tradeType === 'EXPORT' ? '수출' : shipment.tradeType === 'IMPORT' ? '수입' : shipment.tradeType || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">서비스타입</label>
                      <p className="text-[var(--foreground)] font-medium">{shipment.serviceType || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">인코텀즈</label>
                      <p className="text-[var(--foreground)] font-medium">{shipment.incoterms || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">운임조건</label>
                      <p className="text-[var(--foreground)] font-medium">{shipment.terms.freightTerm || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">결제조건</label>
                      <p className="text-[var(--foreground)] font-medium">{shipment.terms.paymentTerm || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 출발지/도착지 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="card">
                  <div className="p-4 border-b border-[var(--border)] bg-blue-50 rounded-t-lg">
                    <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      출발지 (Origin)
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-[var(--foreground)] mb-1">국가</label>
                        <p className="text-[var(--foreground)] font-medium">{shipment.origin.countryName || shipment.origin.countryCode || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-[var(--foreground)] mb-1">항구/공항</label>
                        <p className="text-[var(--foreground)] font-semibold text-lg">{shipment.origin.portName || shipment.origin.portCode || '-'}</p>
                        <p className="text-sm text-[var(--muted)]">{shipment.origin.portCode}</p>
                      </div>
                      {shipment.origin.address && (
                        <div>
                          <label className="block text-sm text-[var(--foreground)] mb-1">주소</label>
                          <p className="text-[var(--foreground)]">{shipment.origin.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="p-4 border-b border-[var(--border)] bg-green-50 rounded-t-lg">
                    <h3 className="text-lg font-bold text-green-700 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      도착지 (Destination)
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-[var(--foreground)] mb-1">국가</label>
                        <p className="text-[var(--foreground)] font-medium">{shipment.destination.countryName || shipment.destination.countryCode || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-[var(--foreground)] mb-1">항구/공항</label>
                        <p className="text-[var(--foreground)] font-semibold text-lg">{shipment.destination.portName || shipment.destination.portCode || '-'}</p>
                        <p className="text-sm text-[var(--muted)]">{shipment.destination.portCode}</p>
                      </div>
                      {shipment.destination.finalDest && (
                        <div>
                          <label className="block text-sm text-[var(--foreground)] mb-1">최종목적지</label>
                          <p className="text-[var(--foreground)]">{shipment.destination.finalDest}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 일정 */}
              <div className="card">
                <div className="p-4 border-b border-[var(--border)]">
                  <h3 className="text-lg font-bold text-[var(--foreground)]">일정</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-5 gap-6">
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">화물준비일</label>
                      <p className="text-[var(--foreground)] font-medium">{formatDate(shipment.schedule.cargoReadyDate)}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">ETD (출발예정)</label>
                      <p className="text-[var(--foreground)] font-medium">{formatDate(shipment.schedule.etd)}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">ATD (실제출발)</label>
                      <p className="text-[var(--foreground)] font-medium text-blue-600">{formatDate(shipment.schedule.atd)}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">ETA (도착예정)</label>
                      <p className="text-[var(--foreground)] font-medium">{formatDate(shipment.schedule.eta)}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">ATA (실제도착)</label>
                      <p className="text-[var(--foreground)] font-medium text-green-600">{formatDate(shipment.schedule.ata)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 화물 정보 */}
              <div className="card">
                <div className="p-4 border-b border-[var(--border)]">
                  <h3 className="text-lg font-bold text-[var(--foreground)]">화물 정보</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-5 gap-6">
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">총 패키지</label>
                      <p className="text-[var(--foreground)] font-medium">{shipment.cargo.totalPackages || '-'} {shipment.cargo.packageType || ''}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">총 중량</label>
                      <p className="text-[var(--foreground)] font-medium">{shipment.cargo.grossWeight?.toLocaleString() || '-'} KG</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">용적</label>
                      <p className="text-[var(--foreground)] font-medium">{shipment.cargo.volume?.toLocaleString() || '-'} CBM</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">청구중량</label>
                      <p className="text-[var(--foreground)] font-medium">{shipment.cargo.chargeableWeight?.toLocaleString() || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">신고가액</label>
                      <p className="text-[var(--foreground)] font-medium text-[#E8A838]">
                        {shipment.value.declaredAmount?.toLocaleString() || '-'} {shipment.value.declaredCurrency || ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 컨테이너 정보 (해상인 경우) */}
              {containers && containers.length > 0 && (
                <div className="card">
                  <div className="p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-bold text-[var(--foreground)]">컨테이너 정보</h3>
                  </div>
                  <div className="p-6">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>컨테이너 번호</th>
                          <th>사이즈/타입</th>
                          <th>씰번호</th>
                          <th>중량 (KG)</th>
                          <th>상태</th>
                        </tr>
                      </thead>
                      <tbody>
                        {containers.map((cntr, idx) => (
                          <tr key={idx} className="border-b border-[var(--border)] last:border-0">
                            <td className="py-3 font-medium">{cntr.CNTR_NO || '-'}</td>
                            <td className="py-3">{cntr.CNTR_SIZE_CD}/{cntr.CNTR_TYPE_CD}</td>
                            <td className="py-3">{cntr.SEAL_NO || '-'}</td>
                            <td className="py-3">{cntr.GROSS_WEIGHT_KG?.toLocaleString() || '-'}</td>
                            <td className="py-3">
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                {cntr.STATUS_CD || 'ACTIVE'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 거래처 정보 */}
              <div className="card">
                <div className="p-4 border-b border-[var(--border)]">
                  <h3 className="text-lg font-bold text-[var(--foreground)]">거래처 정보</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">고객사</label>
                      <p className="text-[var(--foreground)] font-semibold">{shipment.customer.name || '-'}</p>
                      <p className="text-sm text-[var(--muted)]">{shipment.customer.code || ''}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">화주 (Shipper)</label>
                      <p className="text-[var(--foreground)] font-medium">{shipment.shipper.name || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">수하인 (Consignee)</label>
                      <p className="text-[var(--foreground)] font-medium">{shipment.consignee.name || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">운송사 (Carrier)</label>
                      <p className="text-[var(--foreground)] font-medium">{shipment.carrier.name || '-'}</p>
                      <p className="text-sm text-[var(--muted)]">{shipment.carrier.code || ''}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 참조번호 */}
              <div className="card">
                <div className="p-4 border-b border-[var(--border)]">
                  <h3 className="text-lg font-bold text-[var(--foreground)]">참조 번호</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">고객 참조번호</label>
                      <p className="text-[var(--foreground)] font-medium">{shipment.references.customerRef || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">PO 번호</label>
                      <p className="text-[var(--foreground)] font-medium">{shipment.references.poNo || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--foreground)] mb-1">SO 번호</label>
                      <p className="text-[var(--foreground)] font-medium">{shipment.references.soNo || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 트래킹 탭 */}
          {activeTab === 'timeline' && (
            <div className="card">
              <div className="p-4 border-b border-[var(--border)]">
                <h3 className="text-lg font-bold text-[var(--foreground)]">운송 트래킹</h3>
              </div>
              <div className="p-6">
                {timeline && timeline.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[var(--border)]"></div>
                    <div className="space-y-6">
                      {timeline.map((event, idx) => (
                        <div key={idx} className="relative flex items-start gap-6 pl-12">
                          <div className={`absolute left-4 w-5 h-5 rounded-full border-2 ${
                            event.status === 'completed'
                              ? 'bg-green-500 border-green-500'
                              : 'bg-white border-[var(--border)]'
                          }`}>
                            {event.status === 'completed' && (
                              <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 bg-[var(--surface-50)] rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-[var(--foreground)]">{event.title}</h4>
                              <span className={`text-sm ${event.isEstimate ? 'text-[var(--muted)]' : 'text-[var(--foreground)]'}`}>
                                {event.isEstimate && '(예정) '}
                                {formatDateTime(event.datetime)}
                              </span>
                            </div>
                            <p className="text-[var(--muted)] text-sm">{event.description}</p>
                            {event.location && (
                              <p className="text-[var(--muted)] text-sm mt-1 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {event.location}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[var(--muted)]">트래킹 정보가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 관련서류 탭 */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* S/R 정보 */}
              {shippingRequest && (
                <div className="card">
                  <div className="p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-bold text-[var(--foreground)]">Shipping Request (S/R)</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm text-[var(--foreground)] mb-1">S/R 번호</label>
                        <p className="text-[var(--foreground)] font-semibold text-blue-600 cursor-pointer hover:underline">
                          {shippingRequest.SR_NO || '-'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-[var(--foreground)] mb-1">상태</label>
                        <p className="text-[var(--foreground)]">{shippingRequest.STATUS_CD || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-[var(--foreground)] mb-1">화물준비일</label>
                        <p className="text-[var(--foreground)]">{formatDate(shippingRequest.CARGO_READY_DT)}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-[var(--foreground)] mb-1">품명</label>
                        <p className="text-[var(--foreground)]">{shippingRequest.COMMODITY_DESC || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* S/N 정보 */}
              {shippingNotice && (
                <div className="card">
                  <div className="p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-bold text-[var(--foreground)]">Shipping Notice (S/N)</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm text-[var(--foreground)] mb-1">S/N 번호</label>
                        <p className="text-[var(--foreground)] font-semibold text-blue-600 cursor-pointer hover:underline">
                          {shippingNotice.SN_NO || '-'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-[var(--foreground)] mb-1">선박/항공편</label>
                        <p className="text-[var(--foreground)]">{shippingNotice.VESSEL_FLIGHT || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-[var(--foreground)] mb-1">항차번호</label>
                        <p className="text-[var(--foreground)]">{shippingNotice.VOYAGE_NO || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-[var(--foreground)] mb-1">발송상태</label>
                        <p className="text-[var(--foreground)]">{shippingNotice.SEND_STATUS_CD || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 서류가 없는 경우 */}
              {!shippingRequest && !shippingNotice && (
                <div className="card p-12 text-center">
                  <svg className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-[var(--muted)]">연결된 서류가 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </main>
      <CloseConfirmModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleConfirmClose}
      />
    </PageLayout>
  );
}
