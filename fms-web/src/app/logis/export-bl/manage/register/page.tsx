'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { UnsavedChangesModal } from '@/components/UnsavedChangesModal';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { useScreenClose } from '@/hooks/useScreenClose';
import { LIST_PATHS } from '@/constants/paths';
import {
  CodeSearchModal,
  LocationCodeModal,
  type CodeItem,
  type CodeType,
  type LocationItem,
} from '@/components/popup';

// 탭 타입 정의
type TabType = 'MAIN' | 'CARGO' | 'OTHER';

// B/L 등록 폼 데이터 타입
interface BLFormData {
  // MAIN TAB
  jobNo: string;
  businessType: 'CONSOL' | 'CO-LOAD' | 'SIMPLE';
  paymentMethod: 'PREPAID' | 'COLLECT';
  mblNo: string;
  hblNo: string;
  srNo: string;
  bookingNo: string;
  shipperCode: string;
  shipperName: string;
  shipperAddress: string;
  consigneeCode: string;
  consigneeName: string;
  consigneeAddress: string;
  notifyCode: string;
  notifyName: string;
  notifyAddress: string;
  notifyToOrder: boolean;
  notifySameAsConsignee: boolean;
  forwardingAgentCode: string;
  forwardingAgentName: string;
  placeOfReceipt: string;
  placeOfReceiptName: string;
  portOfLoading: string;
  portOfLoadingName: string;
  portOfDischarge: string;
  portOfDischargeName: string;
  placeOfDelivery: string;
  placeOfDeliveryName: string;
  finalDestination: string;
  finalDestinationName: string;
  carrierCode: string;
  carrierName: string;
  vesselName: string;
  voyageNo: string;
  etd: string;
  eta: string;
  serviceTerm: string;
  freightTerm: 'PREPAID' | 'COLLECT';
  freightPayableAt: string;
  blIssueDate: string;
  blIssuePlace: string;
  // CARGO TAB
  containerType: 'LCL' | 'FCL' | 'BULK';
  packageQty: number;
  packageUnit: string;
  grossWeight: number;
  weightUnit: string;
  measurement: number;
  measurementUnit: string;
  asArranged: boolean;
  cargoDescription: string;
  marksAndNumbers: string;
  containers: ContainerInfo[];
  // OTHER TAB
  remarks: string;
}

interface ContainerInfo {
  id: string;
  containerNo: string;
  sealNo: string;
  containerType: string;
  size: string;
  packageQty: number;
  packageUnit: string;
  grossWeight: number;
  measurement: number;
}

const initialFormData: BLFormData = {
  jobNo: '',
  businessType: 'CONSOL',
  paymentMethod: 'PREPAID',
  mblNo: '',
  hblNo: '',
  srNo: '',
  bookingNo: '',
  shipperCode: '',
  shipperName: '',
  shipperAddress: '',
  consigneeCode: '',
  consigneeName: '',
  consigneeAddress: '',
  notifyCode: '',
  notifyName: '',
  notifyAddress: '',
  notifyToOrder: false,
  notifySameAsConsignee: false,
  forwardingAgentCode: '',
  forwardingAgentName: '',
  placeOfReceipt: '',
  placeOfReceiptName: '',
  portOfLoading: '',
  portOfLoadingName: '',
  portOfDischarge: '',
  portOfDischargeName: '',
  placeOfDelivery: '',
  placeOfDeliveryName: '',
  finalDestination: '',
  finalDestinationName: '',
  carrierCode: '',
  carrierName: '',
  vesselName: '',
  voyageNo: '',
  etd: '',
  eta: '',
  serviceTerm: 'CY/CY',
  freightTerm: 'PREPAID',
  freightPayableAt: '',
  blIssueDate: '',
  blIssuePlace: '',
  containerType: 'FCL',
  packageQty: 0,
  packageUnit: 'CT',
  grossWeight: 0,
  weightUnit: 'KG',
  measurement: 0,
  measurementUnit: 'CBM',
  asArranged: true,
  cargoDescription: '',
  marksAndNumbers: '',
  containers: [],
  remarks: '',
};

// 컨테이너 타입 옵션
const containerTypeOptions = [
  { code: '20GP', label: "20' Dry" },
  { code: '20HC', label: "20' HC" },
  { code: '20RF', label: "20' Reefer" },
  { code: '40GP', label: "40' Dry" },
  { code: '40HC', label: "40' HC" },
  { code: '40RF', label: "40' Reefer" },
  { code: '45HC', label: "45' HC" },
];

// 서비스 텀 옵션
const serviceTermOptions = [
  'CY/CY', 'CFS/CFS', 'CY/CFS', 'CFS/CY',
  'CY/DOOR', 'DOOR/CY', 'CFS/DOOR', 'DOOR/CFS',
  'DOOR/DOOR', 'BULK'
];

// 패키지 유닛 옵션
const packageUnitOptions = [
  { code: 'CT', label: 'Carton' },
  { code: 'PK', label: 'Package' },
  { code: 'PL', label: 'Pallet' },
  { code: 'BX', label: 'Box' },
  { code: 'BG', label: 'Bag' },
  { code: 'DR', label: 'Drum' },
  { code: 'PC', label: 'Piece' },
];

// 필수 항목 뱃지 컴포넌트
const RequiredBadge = () => (
  <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded">
    필수
  </span>
);

export default function ExportBLRegisterPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const [formData, setFormData] = useState<BLFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState<TabType>('MAIN');
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // 코드 검색 모달
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeModalType, setCodeModalType] = useState<CodeType>('customer');
  const [codeModalTarget, setCodeModalTarget] = useState<string>('');

  // 지역 검색 모달
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationModalTarget, setLocationModalTarget] = useState<string>('');

  // 화면 닫기 처리
  const { showModal, setShowModal, handleCloseClick, handleModalClose, handleDiscard } = useScreenClose({
    hasChanges: isModified,
    listPath: '/logis/export-bl/manage',
  });

  // 폼 데이터 변경 핸들러
  const handleChange = (field: keyof BLFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsModified(true);
  };

  // 코드 검색 모달 열기
  const openCodeModal = (type: CodeType, target: string) => {
    setCodeModalType(type);
    setCodeModalTarget(target);
    setShowCodeModal(true);
  };

  // 코드 선택 처리
  const handleCodeSelect = (item: CodeItem) => {
    switch (codeModalTarget) {
      case 'shipper':
        setFormData(prev => ({
          ...prev,
          shipperCode: item.code,
          shipperName: item.name,
        }));
        break;
      case 'consignee':
        setFormData(prev => ({
          ...prev,
          consigneeCode: item.code,
          consigneeName: item.name,
        }));
        break;
      case 'notify':
        setFormData(prev => ({
          ...prev,
          notifyCode: item.code,
          notifyName: item.name,
        }));
        break;
      case 'carrier':
        setFormData(prev => ({
          ...prev,
          carrierCode: item.code,
          carrierName: item.name,
        }));
        break;
    }
    setIsModified(true);
    setShowCodeModal(false);
  };

  // 지역 검색 모달 열기
  const openLocationModal = (target: string) => {
    setLocationModalTarget(target);
    setShowLocationModal(true);
  };

  // 지역 선택 처리
  const handleLocationSelect = (item: LocationItem) => {
    const fieldMap: Record<string, { code: keyof BLFormData; name: keyof BLFormData }> = {
      placeOfReceipt: { code: 'placeOfReceipt', name: 'placeOfReceiptName' },
      portOfLoading: { code: 'portOfLoading', name: 'portOfLoadingName' },
      portOfDischarge: { code: 'portOfDischarge', name: 'portOfDischargeName' },
      placeOfDelivery: { code: 'placeOfDelivery', name: 'placeOfDeliveryName' },
      finalDestination: { code: 'finalDestination', name: 'finalDestinationName' },
    };

    const target = fieldMap[locationModalTarget];
    if (target) {
      setFormData(prev => ({
        ...prev,
        [target.code]: item.code,
        [target.name]: item.nameKr,
      }));
      setIsModified(true);
    }
    setShowLocationModal(false);
  };

  // 저장
  const handleSave = async () => {
    // 필수 항목 검증
    if (!formData.hblNo) {
      setMessage('HBL No는 필수 입력 항목입니다.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (!formData.portOfLoading) {
      setMessage('선적항(POL)은 필수 입력 항목입니다.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (!formData.portOfDischarge) {
      setMessage('양하항(POD)은 필수 입력 항목입니다.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    try {
      // TODO: API 연동
      // const response = await fetch('/api/bl/export', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // 임시 저장 처리 (localStorage)
      const existingData = localStorage.getItem('fms_export_bl_data');
      const dataList = existingData ? JSON.parse(existingData) : [];
      const newData = {
        ...formData,
        id: `EBL${Date.now()}`,
        status: 'draft',
        createdAt: new Date().toISOString(),
      };
      dataList.push(newData);
      localStorage.setItem('fms_export_bl_data', JSON.stringify(dataList));

      setMessage('B/L이 성공적으로 저장되었습니다.');
      setIsModified(false);
      setTimeout(() => {
        router.push('/logis/export-bl/manage');
      }, 1500);
    } catch (error) {
      console.error('Save error:', error);
      setMessage('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // 테스트 데이터 입력
  const handleFillTestData = () => {
    setFormData({
      ...initialFormData,
      hblNo: 'HBL-2026-0001',
      mblNo: 'MAEU123456789',
      businessType: 'CONSOL',
      freightTerm: 'PREPAID',
      shipperCode: 'SHP001',
      shipperName: 'SAMSUNG ELECTRONICS',
      shipperAddress: '129 SAMSUNG-RO, SUWON-SI, KOREA',
      consigneeCode: 'CSG001',
      consigneeName: 'SAMSUNG AMERICA INC.',
      consigneeAddress: '85 CHALLENGER ROAD, NJ 07660, USA',
      notifyCode: 'NTF001',
      notifyName: 'SAME AS CONSIGNEE',
      portOfLoading: 'KRPUS',
      portOfLoadingName: 'PUSAN',
      portOfDischarge: 'USLAX',
      portOfDischargeName: 'LOS ANGELES',
      carrierCode: 'MAEU',
      carrierName: 'MAERSK LINE',
      vesselName: 'MAERSK EINDHOVEN',
      voyageNo: '001E',
      etd: '2026-01-20',
      eta: '2026-02-05',
    });
    setIsModified(true);
  };

  // 컨테이너 추가
  const addContainer = () => {
    const newContainer: ContainerInfo = {
      id: `CNT${Date.now()}`,
      containerNo: '',
      sealNo: '',
      containerType: '40HC',
      size: '40',
      packageQty: 0,
      packageUnit: 'CT',
      grossWeight: 0,
      measurement: 0,
    };
    setFormData(prev => ({
      ...prev,
      containers: [...prev.containers, newContainer],
    }));
    setIsModified(true);
  };

  // 컨테이너 삭제
  const removeContainer = (id: string) => {
    setFormData(prev => ({
      ...prev,
      containers: prev.containers.filter(c => c.id !== id),
    }));
    setIsModified(true);
  };

  // 컨테이너 정보 변경
  const updateContainer = (id: string, field: keyof ContainerInfo, value: any) => {
    setFormData(prev => ({
      ...prev,
      containers: prev.containers.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    }));
    setIsModified(true);
  };

  const tabs = [
    { id: 'MAIN' as TabType, label: 'Main', icon: '📋' },
    { id: 'CARGO' as TabType, label: 'Cargo', icon: '📦' },
    { id: 'OTHER' as TabType, label: 'Other', icon: '📝' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header
          title="수출 B/L 등록"
          subtitle="수출 B/L관리 > B/L관리 > 등록"
          showCloseButton
          onClose={handleCloseClick}
        />

        <main ref={formRef} className="p-6">
          {/* 상단 버튼 영역 */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--muted)]">화면 ID: FMS-BL-EXP-001</span>
              {isModified && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                  수정됨
                </span>
              )}
              <button
                onClick={handleFillTestData}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                테스트데이터
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-[#E8A838] text-[#0C1222] font-semibold rounded-lg hover:bg-[#D4943A] disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    저장중...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    저장
                  </>
                )}
              </button>
              <button
                onClick={handleCloseClick}
                className="px-4 py-2 bg-[var(--surface-100)] rounded-lg hover:bg-[var(--surface-200)]"
              >
                취소
              </button>
            </div>
          </div>

          {/* 메시지 */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.includes('오류') || message.includes('필수')
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {message}
            </div>
          )}

          {/* 탭 영역 */}
          <div className="flex gap-1 mb-6 border-b border-[var(--border)]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-[#E8A838]'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8A838]" />
                )}
              </button>
            ))}
          </div>

          {/* MAIN 탭 */}
          {activeTab === 'MAIN' && (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="card">
                <div className="p-4 border-b border-[var(--border)]">
                  <h3 className="font-bold flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#2563EB] rounded-full"></span>
                    기본 정보
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      HBL No <RequiredBadge />
                    </label>
                    <input
                      type="text"
                      value={formData.hblNo}
                      onChange={(e) => handleChange('hblNo', e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838]"
                      placeholder="HBL 번호"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">MBL No</label>
                    <input
                      type="text"
                      value={formData.mblNo}
                      onChange={(e) => handleChange('mblNo', e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838]"
                      placeholder="MBL 번호"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">업무유형</label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => handleChange('businessType', e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838]"
                    >
                      <option value="CONSOL">CONSOL</option>
                      <option value="CO-LOAD">CO-LOAD</option>
                      <option value="SIMPLE">SIMPLE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">운임조건</label>
                    <select
                      value={formData.freightTerm}
                      onChange={(e) => handleChange('freightTerm', e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#E8A838]"
                    >
                      <option value="PREPAID">PREPAID</option>
                      <option value="COLLECT">COLLECT</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 당사자 정보 */}
              <div className="card">
                <div className="p-4 border-b border-[var(--border)]">
                  <h3 className="font-bold flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#059669] rounded-full"></span>
                    당사자 정보
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-3 gap-4">
                  {/* Shipper */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Shipper (송화인)</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={formData.shipperCode}
                        onChange={(e) => handleChange('shipperCode', e.target.value)}
                        className="w-24 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                        placeholder="코드"
                      />
                      <input
                        type="text"
                        value={formData.shipperName}
                        onChange={(e) => handleChange('shipperName', e.target.value)}
                        className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                        placeholder="송화인명"
                      />
                      <button
                        onClick={() => openCodeModal('customer', 'shipper')}
                        className="px-3 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-200)]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>
                    <textarea
                      value={formData.shipperAddress}
                      onChange={(e) => handleChange('shipperAddress', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg resize-none"
                      placeholder="주소"
                    />
                  </div>

                  {/* Consignee */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Consignee (수화인)</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={formData.consigneeCode}
                        onChange={(e) => handleChange('consigneeCode', e.target.value)}
                        className="w-24 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                        placeholder="코드"
                      />
                      <input
                        type="text"
                        value={formData.consigneeName}
                        onChange={(e) => handleChange('consigneeName', e.target.value)}
                        className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                        placeholder="수화인명"
                      />
                      <button
                        onClick={() => openCodeModal('customer', 'consignee')}
                        className="px-3 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-200)]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>
                    <textarea
                      value={formData.consigneeAddress}
                      onChange={(e) => handleChange('consigneeAddress', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg resize-none"
                      placeholder="주소"
                    />
                  </div>

                  {/* Notify Party */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Notify Party (통지처)</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={formData.notifyCode}
                        onChange={(e) => handleChange('notifyCode', e.target.value)}
                        className="w-24 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                        placeholder="코드"
                      />
                      <input
                        type="text"
                        value={formData.notifyName}
                        onChange={(e) => handleChange('notifyName', e.target.value)}
                        className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                        placeholder="통지처명"
                      />
                      <button
                        onClick={() => openCodeModal('customer', 'notify')}
                        className="px-3 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-200)]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>
                    <textarea
                      value={formData.notifyAddress}
                      onChange={(e) => handleChange('notifyAddress', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg resize-none"
                      placeholder="주소"
                    />
                  </div>
                </div>
              </div>

              {/* 운송 정보 */}
              <div className="card">
                <div className="p-4 border-b border-[var(--border)]">
                  <h3 className="font-bold flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#7C3AED] rounded-full"></span>
                    운송 정보
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      선적항 (POL) <RequiredBadge />
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.portOfLoading}
                        onChange={(e) => handleChange('portOfLoading', e.target.value)}
                        className="w-24 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                        placeholder="코드"
                      />
                      <input
                        type="text"
                        value={formData.portOfLoadingName}
                        onChange={(e) => handleChange('portOfLoadingName', e.target.value)}
                        className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                        placeholder="항구명"
                      />
                      <button
                        onClick={() => openLocationModal('portOfLoading')}
                        className="px-3 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-200)]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      양하항 (POD) <RequiredBadge />
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.portOfDischarge}
                        onChange={(e) => handleChange('portOfDischarge', e.target.value)}
                        className="w-24 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                        placeholder="코드"
                      />
                      <input
                        type="text"
                        value={formData.portOfDischargeName}
                        onChange={(e) => handleChange('portOfDischargeName', e.target.value)}
                        className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                        placeholder="항구명"
                      />
                      <button
                        onClick={() => openLocationModal('portOfDischarge')}
                        className="px-3 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-200)]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">선사</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.carrierCode}
                        onChange={(e) => handleChange('carrierCode', e.target.value)}
                        className="w-24 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                        placeholder="코드"
                      />
                      <input
                        type="text"
                        value={formData.carrierName}
                        onChange={(e) => handleChange('carrierName', e.target.value)}
                        className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                        placeholder="선사명"
                      />
                      <button
                        onClick={() => openCodeModal('carrier', 'carrier')}
                        className="px-3 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-200)]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">선명 / 항차</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.vesselName}
                        onChange={(e) => handleChange('vesselName', e.target.value)}
                        className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                        placeholder="선명"
                      />
                      <input
                        type="text"
                        value={formData.voyageNo}
                        onChange={(e) => handleChange('voyageNo', e.target.value)}
                        className="w-24 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                        placeholder="항차"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ETD (출항일)</label>
                    <input
                      type="date"
                      value={formData.etd}
                      onChange={(e) => handleChange('etd', e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ETA (도착일)</label>
                    <input
                      type="date"
                      value={formData.eta}
                      onChange={(e) => handleChange('eta', e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">서비스 텀</label>
                    <select
                      value={formData.serviceTerm}
                      onChange={(e) => handleChange('serviceTerm', e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                    >
                      {serviceTermOptions.map(term => (
                        <option key={term} value={term}>{term}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">B/L 발행일</label>
                    <input
                      type="date"
                      value={formData.blIssueDate}
                      onChange={(e) => handleChange('blIssueDate', e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CARGO 탭 */}
          {activeTab === 'CARGO' && (
            <div className="space-y-6">
              {/* 화물 기본 정보 */}
              <div className="card">
                <div className="p-4 border-b border-[var(--border)]">
                  <h3 className="font-bold flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#EA580C] rounded-full"></span>
                    화물 정보
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">컨테이너 유형</label>
                    <select
                      value={formData.containerType}
                      onChange={(e) => handleChange('containerType', e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                    >
                      <option value="FCL">FCL</option>
                      <option value="LCL">LCL</option>
                      <option value="BULK">BULK</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">수량</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.packageQty}
                        onChange={(e) => handleChange('packageQty', Number(e.target.value))}
                        className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                      />
                      <select
                        value={formData.packageUnit}
                        onChange={(e) => handleChange('packageUnit', e.target.value)}
                        className="w-24 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                      >
                        {packageUnitOptions.map(opt => (
                          <option key={opt.code} value={opt.code}>{opt.code}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">중량 (KG)</label>
                    <input
                      type="number"
                      value={formData.grossWeight}
                      onChange={(e) => handleChange('grossWeight', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">용적 (CBM)</label>
                    <input
                      type="number"
                      value={formData.measurement}
                      onChange={(e) => handleChange('measurement', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* 화물 설명 */}
              <div className="card">
                <div className="p-4 border-b border-[var(--border)]">
                  <h3 className="font-bold">화물 상세</h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">화물 설명</label>
                    <textarea
                      value={formData.cargoDescription}
                      onChange={(e) => handleChange('cargoDescription', e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg resize-none"
                      placeholder="화물 설명을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Marks & Numbers</label>
                    <textarea
                      value={formData.marksAndNumbers}
                      onChange={(e) => handleChange('marksAndNumbers', e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg resize-none"
                      placeholder="Marks & Numbers"
                    />
                  </div>
                </div>
              </div>

              {/* 컨테이너 목록 */}
              <div className="card">
                <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
                  <h3 className="font-bold">컨테이너 목록</h3>
                  <button
                    onClick={addContainer}
                    className="px-3 py-1.5 bg-[#E8A838] text-[#0C1222] rounded-lg hover:bg-[#D4943A] text-sm font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    추가
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--surface-100)]">
                      <tr>
                        <th className="p-3 text-left text-sm">Container No</th>
                        <th className="p-3 text-left text-sm">Seal No</th>
                        <th className="p-3 text-center text-sm">Type</th>
                        <th className="p-3 text-center text-sm">Size</th>
                        <th className="p-3 text-center text-sm">수량</th>
                        <th className="p-3 text-center text-sm">중량(KG)</th>
                        <th className="p-3 text-center text-sm">용적(CBM)</th>
                        <th className="p-3 text-center text-sm">삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.containers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-[var(--muted)]">
                            컨테이너 정보가 없습니다. [추가] 버튼을 클릭하여 추가하세요.
                          </td>
                        </tr>
                      ) : (
                        formData.containers.map((container) => (
                          <tr key={container.id} className="border-t border-[var(--border)]">
                            <td className="p-2">
                              <input
                                type="text"
                                value={container.containerNo}
                                onChange={(e) => updateContainer(container.id, 'containerNo', e.target.value)}
                                className="w-full px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={container.sealNo}
                                onChange={(e) => updateContainer(container.id, 'sealNo', e.target.value)}
                                className="w-full px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded"
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={container.containerType}
                                onChange={(e) => updateContainer(container.id, 'containerType', e.target.value)}
                                className="w-full px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded"
                              >
                                {containerTypeOptions.map(opt => (
                                  <option key={opt.code} value={opt.code}>{opt.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2 text-center">{container.containerType.substring(0, 2)}</td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={container.packageQty}
                                onChange={(e) => updateContainer(container.id, 'packageQty', Number(e.target.value))}
                                className="w-20 px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded text-center"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={container.grossWeight}
                                onChange={(e) => updateContainer(container.id, 'grossWeight', Number(e.target.value))}
                                className="w-24 px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded text-right"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={container.measurement}
                                onChange={(e) => updateContainer(container.id, 'measurement', Number(e.target.value))}
                                className="w-20 px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded text-right"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => removeContainer(container.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* OTHER 탭 */}
          {activeTab === 'OTHER' && (
            <div className="space-y-6">
              <div className="card">
                <div className="p-4 border-b border-[var(--border)]">
                  <h3 className="font-bold">비고</h3>
                </div>
                <div className="p-4">
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => handleChange('remarks', e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg resize-none"
                    placeholder="추가 메모 및 비고사항을 입력하세요"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 저장하지 않은 변경사항 모달 */}
      <UnsavedChangesModal
        isOpen={showModal}
        onClose={handleModalClose}
        onDiscard={handleDiscard}
      />

      {/* 코드 검색 모달 */}
      <CodeSearchModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        onSelect={handleCodeSelect}
        codeType={codeModalType}
      />

      {/* 지역 검색 모달 */}
      <LocationCodeModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelect={handleLocationSelect}
      />
    </div>
  );
}
