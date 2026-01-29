'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import { useScreenClose } from '@/hooks/useScreenClose';
import { UnsavedChangesModal } from '@/components/UnsavedChangesModal';
import { LIST_PATHS } from '@/constants/paths';
import {
  CodeSearchModal,
  LocationCodeModal,
  BLSearchModal,
  SRSearchModal,
  type CodeItem,
  type CodeType,
  type LocationItem,
  type SeaBL,
  type AirBL,
  type SRData,
} from '@/components/popup';

interface SNFormData {
  snNo: string;
  snDate: string;
  srNo: string;
  blNo: string;
  shipper: string;
  consignee: string;
  notifyParty: string;
  carrier: string;
  vessel: string;
  voyage: string;
  pol: string;
  pod: string;
  finalDest: string;
  etd: string;
  atd: string;
  eta: string;
  ata: string;
  containerType: string;
  containerQty: number;
  containerNo: string;
  sealNo: string;
  commodity: string;
  grossWeight: number;
  measurement: number;
  remarks: string;
}

const initialFormData: SNFormData = {
  snNo: '자동생성',
  snDate: new Date().toISOString().split('T')[0],
  srNo: '',
  blNo: '',
  shipper: '',
  consignee: '',
  notifyParty: '',
  carrier: '',
  vessel: '',
  voyage: '',
  pol: '',
  pod: '',
  finalDest: '',
  etd: '',
  atd: '',
  eta: '',
  ata: '',
  containerType: '40HC',
  containerQty: 1,
  containerNo: '',
  sealNo: '',
  commodity: '',
  grossWeight: 0,
  measurement: 0,
  remarks: '',
};

export default function SNRegisterPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // useScreenClose 훅
  const {
    showModal: showCloseModal,
    handleCloseClick,
    handleModalClose,
    handleDiscard: handleDiscardChanges,
  } = useScreenClose({
    hasChanges: hasUnsavedChanges,
    listPath: LIST_PATHS.SN_SEA,
  });

  const [formData, setFormData] = useState<SNFormData>(initialFormData);
  const [isNewMode, setIsNewMode] = useState(true); // 신규 입력 모드 (신규버튼 비활성화 제어)

  // 코드/위치 검색 팝업 상태
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showSRModal, setShowSRModal] = useState(false);
  const [showBLModal, setShowBLModal] = useState(false);
  const [currentField, setCurrentField] = useState<string>('');
  const [currentCodeType, setCurrentCodeType] = useState<CodeType>('customer');

  const handleChange = (field: keyof SNFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  
  // 코드 검색 버튼 클릭
  const handleCodeSearch = (field: string, codeType: CodeType) => {
    setCurrentField(field);
    setCurrentCodeType(codeType);
    setShowCodeModal(true);
  };

  // 코드 선택 완료
  const handleCodeSelect = (item: CodeItem) => {
    if (currentField === 'shipper') {
      setFormData(prev => ({ ...prev, shipper: item.name }));
    } else if (currentField === 'consignee') {
      setFormData(prev => ({ ...prev, consignee: item.name }));
    } else if (currentField === 'carrier') {
      setFormData(prev => ({ ...prev, carrier: item.name }));
    }
    setShowCodeModal(false);
  };

  // 위치 검색 버튼 클릭
  const handleLocationSearch = (field: string) => {
    setCurrentField(field);
    setShowLocationModal(true);
  };

  // 위치 선택 완료
  const handleLocationSelect = (item: LocationItem) => {
    setFormData(prev => ({ ...prev, [currentField]: item.code }));
    setShowLocationModal(false);
  };

  // S/R 선택 완료
  const handleSRSelect = (sr: SRData) => {
    setFormData(prev => ({
      ...prev,
      srNo: sr.srNo,
      shipper: sr.shipper,
      consignee: sr.consignee,
      carrier: sr.carrier || '',
      pol: sr.pol,
      pod: sr.pod,
      etd: sr.etd || '',
      eta: sr.eta || '',
      containerType: sr.containerType || '',
      containerQty: sr.containerQty || 0,
      grossWeight: sr.grossWeight,
      measurement: sr.measurement || 0,
    }));
    setShowSRModal(false);
  };

  // B/L 선택 완료
  const handleBLSelect = (bl: SeaBL | AirBL) => {
    if ('blNo' in bl) {
      setFormData(prev => ({
        ...prev,
        blNo: bl.blNo,
        shipper: bl.shipper,
        consignee: bl.consignee,
        pol: bl.pol,
        pod: bl.pod,
        vessel: bl.vessel,
        voyage: bl.voyageNo,
        carrier: bl.line,
      }));
    }
    setShowBLModal(false);
  };

  const handleSubmit = () => {
    if (!formData.srNo) { alert('S/R 번호를 입력하세요.'); return; }
    if (!formData.shipper) { alert('화주를 입력하세요.'); return; }
    setIsNewMode(false); // 저장 완료 후 신규버튼 활성화
    alert('선적통지(S/N)가 등록되었습니다.');
    router.push('/logis/sn/sea');
  };

  const handleReset = () => {
    if (!confirm('입력한 내용을 모두 초기화하시겠습니까?')) return;
    setFormData(initialFormData);
  };

  const handleSendNotice = () => {
    if (!formData.srNo) { alert('S/R 번호를 먼저 입력하세요.'); return; }
    alert('선적통지(S/N)가 발송되었습니다.');
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header title="선적통지 등록 (S/N)" subtitle="Logis > 선적관리 > 선적통지 등록 (해상)" onClose={handleCloseClick} />
        <main ref={formRef} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-[var(--muted)]">화면 ID: SN-SEA-REG</span>
            <div className="flex gap-2">
              <button
                onClick={() => { setFormData(initialFormData); setIsNewMode(true); }}
                disabled={isNewMode}
                className={`px-4 py-2 rounded-lg font-medium ${isNewMode ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >신규</button>
              <button onClick={handleReset} className="px-4 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-200)] font-medium">초기화</button>
              <button onClick={() => router.push('/logis/sn/sea')} className="px-4 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-200)] font-medium">목록</button>
              <button onClick={handleSendNotice} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">통지발송</button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-[#E8A838] text-[#0C1222] font-semibold rounded-lg hover:bg-[#D4943A]">저장</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-[var(--border)]">기본 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">S/N 번호</label><input type="text" value={formData.snNo} disabled className="w-full px-3 py-2 bg-[var(--surface-100)] border border-[var(--border)] rounded-lg text-[var(--muted)]" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">S/N 일자</label><input type="date" value={formData.snDate} onChange={e => handleChange('snDate', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">S/R 번호 *</label><div className="flex gap-2"><input type="text" value={formData.srNo} onChange={e => handleChange('srNo', e.target.value)} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="SR-YYYY-XXXX" /><button type="button" onClick={() => setShowSRModal(true)} className="px-3 py-2 bg-[#1A2744] text-white text-sm rounded-lg hover:bg-[#243354]">찾기</button></div></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">B/L 번호</label><div className="flex gap-2"><input type="text" value={formData.blNo} onChange={e => handleChange('blNo', e.target.value)} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="HDMU1234567" /><button type="button" onClick={() => setShowBLModal(true)} className="px-3 py-2 bg-[#1A2744] text-white text-sm rounded-lg hover:bg-[#243354]">찾기</button></div></div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-[var(--border)]">운송 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">선사</label><select value={formData.carrier} onChange={e => handleChange('carrier', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"><option value="">선택</option><option value="MAERSK">MAERSK</option><option value="MSC">MSC</option><option value="HMM">HMM</option><option value="EVERGREEN">EVERGREEN</option><option value="ONE">ONE</option></select></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">선명</label><input type="text" value={formData.vessel} onChange={e => handleChange('vessel', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="선박명" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">항차</label><input type="text" value={formData.voyage} onChange={e => handleChange('voyage', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="001E" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">최종목적지</label><input type="text" value={formData.finalDest} onChange={e => handleChange('finalDest', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="최종 목적지" /></div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-[var(--border)]">화주/수하인 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">화주 (Shipper) *</label><div className="flex gap-2"><input type="text" value={formData.shipper} onChange={e => handleChange('shipper', e.target.value)} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="화주명" /><button type="button" onClick={() => handleCodeSearch('shipper', 'customer')} className="px-3 py-2 bg-[#1A2744] text-white text-sm rounded-lg hover:bg-[#243354]">찾기</button></div></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">수하인 (Consignee)</label><div className="flex gap-2"><input type="text" value={formData.consignee} onChange={e => handleChange('consignee', e.target.value)} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="수하인명" /><button type="button" onClick={() => handleCodeSearch('consignee', 'customer')} className="px-3 py-2 bg-[#1A2744] text-white text-sm rounded-lg hover:bg-[#243354]">찾기</button></div></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-1 text-[var(--muted)]">Notify Party</label><input type="text" value={formData.notifyParty} onChange={e => handleChange('notifyParty', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="통지처" /></div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-[var(--border)]">구간/일정 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">선적항 (POL)</label><div className="flex gap-2"><input type="text" value={formData.pol} onChange={e => handleChange('pol', e.target.value)} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="KRPUS" /><button type="button" onClick={() => handleLocationSearch('pol')} className="px-3 py-2 bg-[#1A2744] text-white text-sm rounded-lg hover:bg-[#243354]">찾기</button></div></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">양하항 (POD)</label><div className="flex gap-2"><input type="text" value={formData.pod} onChange={e => handleChange('pod', e.target.value)} className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="USLAX" /><button type="button" onClick={() => handleLocationSearch('pod')} className="px-3 py-2 bg-[#1A2744] text-white text-sm rounded-lg hover:bg-[#243354]">찾기</button></div></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">ETD</label><input type="date" value={formData.etd} onChange={e => handleChange('etd', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">ATD (실제출항)</label><input type="date" value={formData.atd} onChange={e => handleChange('atd', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">ETA</label><input type="date" value={formData.eta} onChange={e => handleChange('eta', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">ATA (실제도착)</label><input type="date" value={formData.ata} onChange={e => handleChange('ata', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
              </div>
            </div>

            <div className="card p-6 col-span-2">
              <h3 className="font-bold text-lg mb-4 pb-2 border-b border-[var(--border)]">컨테이너/화물 정보</h3>
              <div className="grid grid-cols-4 gap-4">
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">컨테이너 타입</label><select value={formData.containerType} onChange={e => handleChange('containerType', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"><option value="20GP">20GP</option><option value="40GP">40GP</option><option value="40HC">40HC</option><option value="45HC">45HC</option><option value="20RF">20RF</option><option value="40RF">40RF</option></select></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">수량</label><input type="number" value={formData.containerQty} onChange={e => handleChange('containerQty', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">총중량 (KG)</label><input type="number" value={formData.grossWeight} onChange={e => handleChange('grossWeight', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1 text-[var(--muted)]">용적 (CBM)</label><input type="number" value={formData.measurement} onChange={e => handleChange('measurement', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-1 text-[var(--muted)]">컨테이너 번호</label><input type="text" value={formData.containerNo} onChange={e => handleChange('containerNo', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="HDMU1234567, HDMU1234568" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-1 text-[var(--muted)]">씰 번호</label><input type="text" value={formData.sealNo} onChange={e => handleChange('sealNo', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="SL001, SL002" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-1 text-[var(--muted)]">품명</label><input type="text" value={formData.commodity} onChange={e => handleChange('commodity', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="화물 품명" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-1 text-[var(--muted)]">비고</label><input type="text" value={formData.remarks} onChange={e => handleChange('remarks', e.target.value)} className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg" placeholder="특이사항" /></div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 코드 검색 모달 */}
      <CodeSearchModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        onSelect={handleCodeSelect}
        codeType={currentCodeType}
      />

      {/* 위치 검색 모달 */}
      <LocationCodeModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelect={handleLocationSelect}
        type="seaport"
      />

      {/* S/R 검색 모달 */}
      <SRSearchModal
        isOpen={showSRModal}
        onClose={() => setShowSRModal(false)}
        onSelect={handleSRSelect}
      />

      {/* B/L 검색 모달 */}
      <BLSearchModal
        isOpen={showBLModal}
        onClose={() => setShowBLModal(false)}
        onSelect={handleBLSelect}
        type="sea"
      />      {/* 저장 확인 모달 */}
      <UnsavedChangesModal
        isOpen={showCloseModal}
        onClose={handleModalClose}
        onDiscard={handleDiscardChanges}
        message="저장하지 않은 변경사항이 있습니다.\n이 페이지를 떠나시겠습니까?"
      />
    </div>
  );
}
