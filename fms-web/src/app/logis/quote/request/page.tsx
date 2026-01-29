'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LIST_PATHS } from '@/constants/paths';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CloseConfirmModal from '@/components/CloseConfirmModal';
import { useCloseConfirm } from '@/hooks/useCloseConfirm';
import CodeSearchModal, { CodeType, CodeItem } from '@/components/popup/CodeSearchModal';
import LocationCodeModal, { LocationType, LocationItem } from '@/components/popup/LocationCodeModal';

// 운임정보 데이터 타입
interface RateInfo {
  id: number;
  rateType: string;
  rateCode: string;
  currency: string;
  baseRate: number;
  surcharge: number;
  total: number;
  remark: string;
}

// 운송요율 데이터 타입
interface TransportRate {
  id: number;
  rateCode: string;
  origin: string;
  destination: string;
  transportType: string;
  vehicleType: string;
  amount: number;
  contact: string;
}

export default function QuoteRequestPage() {
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);

  // 화면닫기 핸들러
  const handleCloseClick = () => {
    setShowCloseModal(true);
  };

  const handleConfirmClose = () => {
    setShowCloseModal(false);
    router.push(LIST_PATHS.DASHBOARD);
  };

  // 브라우저 뒤로가기 버튼 처리
  useCloseConfirm({
    showModal: showCloseModal,
    setShowModal: setShowCloseModal,
    onConfirmClose: handleConfirmClose,
  });

  // 기본정보 상태
  const [formData, setFormData] = useState({
    registrationDate: new Date().toISOString().split('T')[0],
    inputEmployee: '',
    category: 'sea', // sea or air
    origin: '',
    originCode: '',
    destination: '',
    destinationCode: '',
    tradeTerms: 'CIF',
    quoteStatus: 'draft',
    shippingDate: '',
    attachment: null as File | null,
    tradingPartner: '',
    tradingPartnerCode: '',
    cargoDescription: '',
    weight: '',
    volume: '',
    quantity: '',
  });

  // 운임정보 그리드 데이터
  const [rateInfoList, setRateInfoList] = useState<RateInfo[]>([
    { id: 1, rateType: '해상운임', rateCode: 'OFR-001', currency: 'USD', baseRate: 1500, surcharge: 200, total: 1700, remark: '' },
  ]);

  // 운송요율 그리드 데이터
  const [transportRateList, setTransportRateList] = useState<TransportRate[]>([
    { id: 1, rateCode: 'TRF-001', origin: '부산항', destination: '서울물류센터', transportType: '내륙운송', vehicleType: '5톤트럭', amount: 350000, contact: '010-1234-5678' },
  ]);

  // 선택된 행 관리
  const [selectedRateRows, setSelectedRateRows] = useState<number[]>([]);
  const [selectedTransportRows, setSelectedTransportRows] = useState<number[]>([]);

  // 섹션 접힘 상태
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    cargo: true,
    rate: true,
    transport: true,
  });

  // 코드 검색 모달 상태
  const [showCodeSearchModal, setShowCodeSearchModal] = useState(false);
  const [codeSearchType, setCodeSearchType] = useState<CodeType>('customer');
  const [codeSearchField, setCodeSearchField] = useState<string>('');

  // 위치 검색 모달 상태
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationSearchType, setLocationSearchType] = useState<LocationType>('seaport');
  const [locationSearchField, setLocationSearchField] = useState<string>('');

  // 코드 검색 핸들러
  const handleCodeSearch = (field: string, type: CodeType) => {
    setCodeSearchField(field);
    setCodeSearchType(type);
    setShowCodeSearchModal(true);
  };

  const handleCodeSelect = (item: CodeItem) => {
    if (codeSearchField === 'inputEmployee') {
      setFormData(prev => ({ ...prev, inputEmployee: item.name }));
    } else if (codeSearchField === 'tradingPartner') {
      setFormData(prev => ({ ...prev, tradingPartnerCode: item.code, tradingPartner: item.name }));
    }
    setShowCodeSearchModal(false);
  };

  // 위치 검색 핸들러
  const handleLocationSearch = (field: string) => {
    setLocationSearchField(field);
    // 해상/항공 구분에 따라 seaport 또는 airport 선택
    setLocationSearchType(formData.category === 'sea' ? 'seaport' : 'airport');
    setShowLocationModal(true);
  };

  const handleLocationSelect = (item: LocationItem) => {
    if (locationSearchField === 'origin') {
      setFormData(prev => ({ ...prev, originCode: item.code, origin: item.nameKr }));
    } else if (locationSearchField === 'destination') {
      setFormData(prev => ({ ...prev, destinationCode: item.code, destination: item.nameKr }));
    }
    setShowLocationModal(false);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // 운임정보 행 추가
  const addRateRow = () => {
    const newId = Math.max(...rateInfoList.map(r => r.id), 0) + 1;
    setRateInfoList([...rateInfoList, {
      id: newId,
      rateType: '',
      rateCode: '',
      currency: 'USD',
      baseRate: 0,
      surcharge: 0,
      total: 0,
      remark: '',
    }]);
  };

  // 운임정보 선택 행 삭제
  const deleteSelectedRateRows = () => {
    setRateInfoList(rateInfoList.filter(r => !selectedRateRows.includes(r.id)));
    setSelectedRateRows([]);
  };

  // 운송요율 행 추가
  const addTransportRow = () => {
    const newId = Math.max(...transportRateList.map(r => r.id), 0) + 1;
    setTransportRateList([...transportRateList, {
      id: newId,
      rateCode: '',
      origin: '',
      destination: '',
      transportType: '',
      vehicleType: '',
      amount: 0,
      contact: '',
    }]);
  };

  // 운송요율 선택 행 삭제
  const deleteSelectedTransportRows = () => {
    setTransportRateList(transportRateList.filter(r => !selectedTransportRows.includes(r.id)));
    setSelectedTransportRows([]);
  };

  // 폼 저장
  const handleSave = () => {
    console.log('Saving form data:', { formData, rateInfoList, transportRateList });
    alert('저장되었습니다.');
  };

  // 견적 등록
  const handleRegister = () => {
    console.log('Registering quote:', { formData, rateInfoList, transportRateList });
    alert('견적이 등록되었습니다.');
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header title="견적요청 등록" subtitle="물류견적관리  견적요청 등록/조회 > 견적요청 등록(화주)" showCloseButton={false} />

        <main className="p-6">
          {/* 상단 버튼 영역 */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRegister}
                className="px-4 py-2 bg-[#E8A838] text-[#0C1222] font-semibold rounded-lg hover:bg-[#D4943A] transition-colors"
              >
                견적등록
              </button>
              <button className="px-4 py-2 bg-[var(--surface-100)] text-[var(--foreground)] rounded-lg hover:bg-[var(--surface-200)] transition-colors">
                E-mail
              </button>
              <button className="px-4 py-2 bg-[var(--surface-100)] text-[var(--foreground)] rounded-lg hover:bg-[var(--surface-200)] transition-colors">
                알람
              </button>
              <Link href="/logis/quote/request/list" className="px-4 py-2 bg-[var(--surface-100)] text-[var(--foreground)] rounded-lg hover:bg-[var(--surface-200)] transition-colors">
                목록
              </Link>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#1A2744] text-white rounded-lg hover:bg-[#243354] transition-colors"
              >
                저장
              </button>
            </div>
          </div>

          {/* 기본정보 섹션 */}
          <div className="card mb-4">
            <div
              className="flex justify-between items-center p-4 cursor-pointer border-b border-[var(--border)]"
              onClick={() => toggleSection('basic')}
            >
              <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#E8A838] rounded-full"></span>
                기본정보
              </h3>
              <svg
                className={`w-5 h-5 text-[var(--muted)] transition-transform ${expandedSections.basic ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {expandedSections.basic && (
              <div className="p-4 grid grid-cols-4 gap-4">
                {/* 등록일자 */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">등록일자 <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={formData.registrationDate}
                    onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#E8A838]"
                  />
                </div>
                {/* 입력사원 */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">입력사원</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.inputEmployee}
                      onChange={(e) => setFormData({ ...formData, inputEmployee: e.target.value })}
                      className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#E8A838]"
                      placeholder="사원명"
                    />
                    <button
                      onClick={() => handleCodeSearch('inputEmployee', 'customer')}
                      className="px-3 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-200)]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* 구분 (항공/해상) */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">구분 <span className="text-red-500">*</span></label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#E8A838]"
                  >
                    <option value="sea">해상</option>
                    <option value="air">항공</option>
                  </select>
                </div>
                {/* 견적상태 */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">견적상태</label>
                  <select
                    value={formData.quoteStatus}
                    onChange={(e) => setFormData({ ...formData, quoteStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#E8A838]"
                  >
                    <option value="draft">임시저장</option>
                    <option value="requested">요청</option>
                    <option value="quoted">견적완료</option>
                    <option value="confirmed">확정</option>
                    <option value="cancelled">취소</option>
                  </select>
                </div>
                {/* 출발지 */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">출발지 <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.originCode}
                      onChange={(e) => setFormData({ ...formData, originCode: e.target.value })}
                      className="w-24 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#E8A838]"
                      placeholder="코드"
                    />
                    <input
                      type="text"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#E8A838]"
                      placeholder="출발지명"
                    />
                    <button
                      onClick={() => handleLocationSearch('origin')}
                      className="px-3 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-200)]"
                      title="공항/항구 코드 팝업"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* 도착지 */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">도착지 <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.destinationCode}
                      onChange={(e) => setFormData({ ...formData, destinationCode: e.target.value })}
                      className="w-24 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#E8A838]"
                      placeholder="코드"
                    />
                    <input
                      type="text"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#E8A838]"
                      placeholder="도착지명"
                    />
                    <button
                      onClick={() => handleLocationSearch('destination')}
                      className="px-3 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-200)]"
                      title="공항/항구 코드 팝업"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* 무역조건 */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">무역조건</label>
                  <select
                    value={formData.tradeTerms}
                    onChange={(e) => setFormData({ ...formData, tradeTerms: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#E8A838]"
                  >
                    <option value="CIF">CIF (Cost, Insurance and Freight)</option>
                    <option value="CFR">CFR (Cost and Freight)</option>
                    <option value="DAP">DAP (Delivered at Place)</option>
                    <option value="DDP">DDP (Delivered Duty Paid)</option>
                    <option value="FOB">FOB (Free on Board)</option>
                    <option value="EXW">EXW (Ex Works)</option>
                  </select>
                </div>
                {/* 출고예정일 */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">출고예정일</label>
                  <input
                    type="date"
                    value={formData.shippingDate}
                    onChange={(e) => setFormData({ ...formData, shippingDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#E8A838]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 화물정보 섹션 */}
          <div className="card mb-4">
            <div
              className="flex justify-between items-center p-4 cursor-pointer border-b border-[var(--border)]"
              onClick={() => toggleSection('cargo')}
            >
              <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#0F766E] rounded-full"></span>
                화물정보
              </h3>
              <svg
                className={`w-5 h-5 text-[var(--muted)] transition-transform ${expandedSections.cargo ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {expandedSections.cargo && (
              <div className="p-4 grid grid-cols-4 gap-4">
                {/* 거래처 */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">거래처 <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.tradingPartnerCode}
                      onChange={(e) => setFormData({ ...formData, tradingPartnerCode: e.target.value })}
                      className="w-32 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#E8A838]"
                      placeholder="거래처코드"
                    />
                    <input
                      type="text"
                      value={formData.tradingPartner}
                      onChange={(e) => setFormData({ ...formData, tradingPartner: e.target.value })}
                      className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#E8A838]"
                      placeholder="거래처명"
                    />
                    <button
                      onClick={() => handleCodeSearch('tradingPartner', 'customer')}
                      className="px-3 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-200)]"
                      title="거래처 코드 팝업"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* 첨부파일 */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">첨부파일</label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      onChange={(e) => setFormData({ ...formData, attachment: e.target.files?.[0] || null })}
                      className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#E8A838] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-[var(--surface-200)] file:text-[var(--foreground)]"
                    />
                  </div>
                </div>
                {/* 화물 설명 */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">화물 설명</label>
                  <textarea
                    value={formData.cargoDescription}
                    onChange={(e) => setFormData({ ...formData, cargoDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#E8A838] resize-none"
                    rows={3}
                    placeholder="화물에 대한 상세 설명을 입력하세요"
                  />
                </div>
                {/* 중량/용적/수량 */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">중량 (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#E8A838]"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">용적 (CBM)</label>
                  <input
                    type="number"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#E8A838]"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 운임정보 섹션 */}
          <div className="card mb-4">
            <div
              className="flex justify-between items-center p-4 cursor-pointer border-b border-[var(--border)]"
              onClick={() => toggleSection('rate')}
            >
              <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#7C3AED] rounded-full"></span>
                운임정보
              </h3>
              <svg
                className={`w-5 h-5 text-[var(--muted)] transition-transform ${expandedSections.rate ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {expandedSections.rate && (
              <div className="p-4">
                {/* 운임정보 버튼 영역 */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm bg-[var(--surface-100)] text-[var(--foreground)] rounded-lg hover:bg-[var(--surface-200)] transition-colors">
                      운임조회
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addRateRow}
                      className="px-3 py-1.5 text-sm bg-[#1A2744] text-white rounded-lg hover:bg-[#243354] transition-colors"
                    >
                      추가
                    </button>
                    <button
                      onClick={deleteSelectedRateRows}
                      className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      disabled={selectedRateRows.length === 0}
                    >
                      선택삭제
                    </button>
                  </div>
                </div>
                {/* 운임정보 그리드 */}
                <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
                  <table className="w-full">
                    <thead className="bg-[var(--surface-100)]">
                      <tr>
                        <th className="w-10 p-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedRateRows.length === rateInfoList.length && rateInfoList.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRateRows(rateInfoList.map(r => r.id));
                              } else {
                                setSelectedRateRows([]);
                              }
                            }}
                            className="rounded"
                          />
                        </th>
                        <th className="p-3 text-left text-sm font-medium text-[var(--foreground)]">운임<br/>유형</th>
                        <th className="p-3 text-left text-sm font-medium text-[var(--foreground)]">운임<br/>코드</th>
                        <th className="p-3 text-left text-sm font-medium text-[var(--foreground)]">통화</th>
                        <th className="p-3 text-right text-sm font-medium text-[var(--foreground)]">기본<br/>운임</th>
                        <th className="p-3 text-right text-sm font-medium text-[var(--foreground)]">할증료</th>
                        <th className="p-3 text-right text-sm font-medium text-[var(--foreground)]">합계</th>
                        <th className="p-3 text-left text-sm font-medium text-[var(--foreground)]">비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rateInfoList.map((row) => (
                        <tr key={row.id} className="border-t border-[var(--border)] hover:bg-[var(--surface-50)]">
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedRateRows.includes(row.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRateRows([...selectedRateRows, row.id]);
                                } else {
                                  setSelectedRateRows(selectedRateRows.filter(id => id !== row.id));
                                }
                              }}
                              className="rounded"
                            />
                          </td>
                          <td className="p-3">
                            <select
                              value={row.rateType}
                              onChange={(e) => {
                                setRateInfoList(rateInfoList.map(r =>
                                  r.id === row.id ? { ...r, rateType: e.target.value } : r
                                ));
                              }}
                              className="w-full px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded text-sm"
                            >
                              <option value="">선택</option>
                              <option value="해상운임">해상운임</option>
                              <option value="항공운임">항공운임</option>
                              <option value="THC">THC</option>
                              <option value="BAF">BAF</option>
                              <option value="CAF">CAF</option>
                              <option value="기타">기타</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={row.rateCode}
                                onChange={(e) => {
                                  setRateInfoList(rateInfoList.map(r =>
                                    r.id === row.id ? { ...r, rateCode: e.target.value } : r
                                  ));
                                }}
                                className="flex-1 px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded text-sm"
                                placeholder="운임코드"
                              />
                              <button className="px-2 py-1 bg-[var(--surface-100)] border border-[var(--border)] rounded hover:bg-[var(--surface-200)]">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="p-3">
                            <select
                              value={row.currency}
                              onChange={(e) => {
                                setRateInfoList(rateInfoList.map(r =>
                                  r.id === row.id ? { ...r, currency: e.target.value } : r
                                ));
                              }}
                              className="w-full px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded text-sm"
                            >
                              <option value="USD">USD</option>
                              <option value="KRW">KRW</option>
                              <option value="EUR">EUR</option>
                              <option value="JPY">JPY</option>
                              <option value="CNY">CNY</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={row.baseRate}
                              onChange={(e) => {
                                const baseRate = parseFloat(e.target.value) || 0;
                                setRateInfoList(rateInfoList.map(r =>
                                  r.id === row.id ? { ...r, baseRate, total: baseRate + r.surcharge } : r
                                ));
                              }}
                              className="w-full px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded text-sm text-right"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={row.surcharge}
                              onChange={(e) => {
                                const surcharge = parseFloat(e.target.value) || 0;
                                setRateInfoList(rateInfoList.map(r =>
                                  r.id === row.id ? { ...r, surcharge, total: r.baseRate + surcharge } : r
                                ));
                              }}
                              className="w-full px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded text-sm text-right"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={row.total}
                              readOnly
                              className="w-full px-2 py-1 bg-[var(--surface-100)] border border-[var(--border)] rounded text-sm text-right font-semibold"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={row.remark}
                              onChange={(e) => {
                                setRateInfoList(rateInfoList.map(r =>
                                  r.id === row.id ? { ...r, remark: e.target.value } : r
                                ));
                              }}
                              className="w-full px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded text-sm"
                              placeholder="비고"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* 운송요율 섹션 */}
          <div className="card mb-4">
            <div
              className="flex justify-between items-center p-4 cursor-pointer border-b border-[var(--border)]"
              onClick={() => toggleSection('transport')}
            >
              <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#059669] rounded-full"></span>
                운송요율
              </h3>
              <svg
                className={`w-5 h-5 text-[var(--muted)] transition-transform ${expandedSections.transport ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {expandedSections.transport && (
              <div className="p-4">
                {/* 운송요율 버튼 영역 */}
                <div className="flex justify-end items-center mb-3">
                  <div className="flex gap-2">
                    <button
                      onClick={addTransportRow}
                      className="px-3 py-1.5 text-sm bg-[#1A2744] text-white rounded-lg hover:bg-[#243354] transition-colors"
                    >
                      추가
                    </button>
                    <button
                      onClick={deleteSelectedTransportRows}
                      className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      disabled={selectedTransportRows.length === 0}
                    >
                      선택삭제
                    </button>
                  </div>
                </div>
                {/* 운송요율 그리드 */}
                <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
                  <table className="w-full">
                    <thead className="bg-[var(--surface-100)]">
                      <tr>
                        <th className="w-10 p-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedTransportRows.length === transportRateList.length && transportRateList.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTransportRows(transportRateList.map(r => r.id));
                              } else {
                                setSelectedTransportRows([]);
                              }
                            }}
                            className="rounded"
                          />
                        </th>
                        <th className="p-3 text-left text-sm font-medium text-[var(--foreground)]">운임코드</th>
                        <th className="p-3 text-left text-sm font-medium text-[var(--foreground)]">출발지</th>
                        <th className="p-3 text-left text-sm font-medium text-[var(--foreground)]">도착지</th>
                        <th className="p-3 text-left text-sm font-medium text-[var(--foreground)]">운송<br/>구분</th>
                        <th className="p-3 text-left text-sm font-medium text-[var(--foreground)]">차량<br/>구분</th>
                        <th className="p-3 text-right text-sm font-medium text-[var(--foreground)]">금액</th>
                        <th className="p-3 text-left text-sm font-medium text-[var(--foreground)]">연락처</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transportRateList.map((row) => (
                        <tr key={row.id} className="border-t border-[var(--border)] hover:bg-[var(--surface-50)]">
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedTransportRows.includes(row.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTransportRows([...selectedTransportRows, row.id]);
                                } else {
                                  setSelectedTransportRows(selectedTransportRows.filter(id => id !== row.id));
                                }
                              }}
                              className="rounded"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={row.rateCode}
                              onChange={(e) => {
                                setTransportRateList(transportRateList.map(r =>
                                  r.id === row.id ? { ...r, rateCode: e.target.value } : r
                                ));
                              }}
                              className="w-full px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded text-sm"
                              placeholder="운임코드"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={row.origin}
                              onChange={(e) => {
                                setTransportRateList(transportRateList.map(r =>
                                  r.id === row.id ? { ...r, origin: e.target.value } : r
                                ));
                              }}
                              className="w-full px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded text-sm"
                              placeholder="출발지"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={row.destination}
                              onChange={(e) => {
                                setTransportRateList(transportRateList.map(r =>
                                  r.id === row.id ? { ...r, destination: e.target.value } : r
                                ));
                              }}
                              className="w-full px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded text-sm"
                              placeholder="도착지"
                            />
                          </td>
                          <td className="p-3">
                            <select
                              value={row.transportType}
                              onChange={(e) => {
                                setTransportRateList(transportRateList.map(r =>
                                  r.id === row.id ? { ...r, transportType: e.target.value } : r
                                ));
                              }}
                              className="w-full px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded text-sm"
                            >
                              <option value="">선택</option>
                              <option value="내륙운송">내륙운송</option>
                              <option value="픽업">픽업</option>
                              <option value="배송">배송</option>
                              <option value="셔틀">셔틀</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <select
                              value={row.vehicleType}
                              onChange={(e) => {
                                setTransportRateList(transportRateList.map(r =>
                                  r.id === row.id ? { ...r, vehicleType: e.target.value } : r
                                ));
                              }}
                              className="w-full px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded text-sm"
                            >
                              <option value="">선택</option>
                              <option value="1톤트럭">1톤트럭</option>
                              <option value="2.5톤트럭">2.5톤트럭</option>
                              <option value="5톤트럭">5톤트럭</option>
                              <option value="11톤트럭">11톤트럭</option>
                              <option value="25톤트럭">25톤트럭</option>
                              <option value="컨테이너">컨테이너</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={row.amount}
                              onChange={(e) => {
                                setTransportRateList(transportRateList.map(r =>
                                  r.id === row.id ? { ...r, amount: parseFloat(e.target.value) || 0 } : r
                                ));
                              }}
                              className="w-full px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded text-sm text-right"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={row.contact}
                              onChange={(e) => {
                                setTransportRateList(transportRateList.map(r =>
                                  r.id === row.id ? { ...r, contact: e.target.value } : r
                                ));
                              }}
                              className="w-full px-2 py-1 bg-[var(--surface-50)] border border-[var(--border)] rounded text-sm"
                              placeholder="연락처"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 화면 닫기 확인 모달 */}
      <CloseConfirmModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleConfirmClose}
      />

      {/* 코드 검색 모달 */}
      <CodeSearchModal
        isOpen={showCodeSearchModal}
        onClose={() => setShowCodeSearchModal(false)}
        onSelect={handleCodeSelect}
        codeType={codeSearchType}
      />

      {/* 위치 검색 모달 */}
      <LocationCodeModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelect={handleLocationSelect}
        type={locationSearchType}
      />
    </div>
  );
}
