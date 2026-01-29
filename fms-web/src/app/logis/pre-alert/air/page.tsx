'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AWBSelectModal from '@/components/AWBSelectModal';
import { useSorting, SortableHeader, SortConfig } from '@/components/table/SortableTable';

interface AWBData {
  mawb_id: number;
  mawb_no: string;
  airline_code: string;
  flight_no: string;
  origin_airport_cd: string;
  dest_airport_cd: string;
  etd_dt: string;
  eta_dt: string;
  shipper_nm: string;
  consignee_nm: string;
  pieces: number;
  gross_weight_kg: number;
  commodity_desc: string;
  status_cd: string;
}

interface PreAlertSetting {
  setting_id: number;
  setting_name: string;
  service_group: string;
  shipper_code: string;
  consignee_code: string;
  partner_code: string;
  pol_code: string;
  pod_code: string;
  attachment_types: string;
  base_date_type: string;
  auto_send_yn: string;
  auto_send_days: number;
  auto_send_time: string;
  mail_subject: string;
  mail_body: string;
  use_yn: string;
  addresses: Address[];
}

interface Address {
  id?: number;
  addr_type: string;
  addr_name: string;
  email: string;
}

interface MailLog {
  log_id: number;
  doc_type: string;
  doc_no: string;
  mail_from: string;
  mail_to: string;
  mail_cc: string;
  mail_subject: string;
  status: string;
  response_msg: string;
  send_dt_fmt: string;
  created_dt_fmt: string;
  setting_name: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  SUCCESS: { label: '성공', color: 'bg-green-500' },
  STANDBY: { label: '대기', color: 'bg-yellow-500' },
  FAILED: { label: '실패', color: 'bg-red-500' },
};

export default function PreAlertPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'logs'>('settings');
  const [settings, setSettings] = useState<PreAlertSetting[]>([]);
  const [logs, setLogs] = useState<MailLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PreAlertSetting | null>(null);
  const [formData, setFormData] = useState<Partial<PreAlertSetting>>({
    setting_name: '',
    service_group: 'AIR',
    shipper_code: '',
    consignee_code: '',
    partner_code: '',
    pol_code: '',
    pod_code: '',
    attachment_types: '',
    base_date_type: 'ETD',
    auto_send_yn: 'N',
    auto_send_days: 0,
    auto_send_time: '',
    mail_subject: '',
    mail_body: '',
    use_yn: 'Y',
    addresses: [],
  });

  const { sortConfig: settingsSortConfig, handleSort: handleSettingsSort, sortData: sortSettingsData } = useSorting<PreAlertSetting>();
  const { sortConfig: logsSortConfig, handleSort: handleLogsSort, sortData: sortLogsData } = useSorting<MailLog>();

  const [logFilters, setLogFilters] = useState({
    docNo: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  // AWB 팝업 관련 state
  const [showAWBModal, setShowAWBModal] = useState(false);
  const [selectedAwb, setSelectedAwb] = useState<AWBData | null>(null);

  // AWB 선택 시 Pre-Alert 설정 자동 채우기
  const handleAWBSelect = (awb: AWBData) => {
    setSelectedAwb(awb);
    setFormData(prev => ({
      ...prev,
      setting_name: `Pre-Alert: ${awb.mawb_no}`,
      pol_code: awb.origin_airport_cd,
      pod_code: awb.dest_airport_cd,
      shipper_code: awb.shipper_nm || '',
      consignee_code: awb.consignee_nm || '',
      mail_subject: `[Pre-Alert] ${awb.mawb_no} - ${awb.origin_airport_cd} to ${awb.dest_airport_cd}`,
      mail_body: `Dear Partner,\n\nPlease find attached Pre-Alert information.\n\nMAWB No.: ${awb.mawb_no}\nFlight: ${awb.flight_no || 'TBA'}\nRoute: ${awb.origin_airport_cd} → ${awb.dest_airport_cd}\nETD: ${awb.etd_dt || 'TBA'}\nShipper: ${awb.shipper_nm || ''}\nConsignee: ${awb.consignee_nm || ''}\nPCS: ${awb.pieces || 0}\nGross Weight: ${awb.gross_weight_kg || 0} KG\nCommodity: ${awb.commodity_desc || ''}\n\nBest regards,\nKCS Forwarding`,
    }));
  };

  // Settings 조회
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pre-alert/settings?serviceGroup=AIR');
      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mail Log 조회
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ docType: 'PRE_ALERT_AIR' });
      if (logFilters.docNo) params.append('docNo', logFilters.docNo);
      if (logFilters.status) params.append('status', logFilters.status);
      if (logFilters.startDate) params.append('startDate', logFilters.startDate);
      if (logFilters.endDate) params.append('endDate', logFilters.endDate);

      const response = await fetch(`/api/pre-alert/mail-log?${params}`);
      const result = await response.json();
      if (result.success) {
        setLogs(result.data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [logFilters]);

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchSettings();
    } else {
      fetchLogs();
    }
  }, [activeTab, fetchSettings, fetchLogs]);

  // Settings 저장
  const handleSave = async () => {
    if (!formData.setting_name) {
      alert('설정명은 필수입니다.');
      return;
    }

    try {
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem
        ? { ...formData, setting_id: editingItem.setting_id }
        : formData;

      const response = await fetch('/api/pre-alert/settings', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message);
        setShowModal(false);
        setEditingItem(null);
        resetForm();
        fetchSettings();
      } else {
        alert('오류: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // Settings 삭제
  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/pre-alert/settings?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        fetchSettings();
      } else {
        alert('오류: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      setting_name: '',
      service_group: 'AIR',
      shipper_code: '',
      consignee_code: '',
      partner_code: '',
      pol_code: '',
      pod_code: '',
      attachment_types: '',
      base_date_type: 'ETD',
      auto_send_yn: 'N',
      auto_send_days: 0,
      auto_send_time: '',
      mail_subject: '',
      mail_body: '',
      use_yn: 'Y',
      addresses: [],
    });
  };

  const handleEdit = (item: PreAlertSetting) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    resetForm();
    setShowModal(true);
  };

  // 수신자 추가
  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...(prev.addresses || []), { addr_type: 'TO', addr_name: '', email: '' }],
    }));
  };

  // 수신자 삭제
  const removeAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses?.filter((_, i) => i !== index),
    }));
  };

  // 수신자 수정
  const updateAddress = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses?.map((addr, i) =>
        i === index ? { ...addr, [field]: value } : addr
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header title="Pre-Alert 관리 (항공수출)" subtitle="Logis > 항공수출 > Pre-Alert" />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
          </div>

          {/* 탭 메뉴 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-purple-600 text-white'
                  : 'bg-[var(--surface-100)] text-[var(--muted)] hover:bg-[var(--surface-200)]'
              }`}
            >
              설정 관리
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'logs'
                  ? 'bg-purple-600 text-white'
                  : 'bg-[var(--surface-100)] text-[var(--muted)] hover:bg-[var(--surface-200)]'
              }`}
            >
              발송 이력
            </button>
          </div>

          {/* Settings 탭 */}
          {activeTab === 'settings' && (
            <>
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleNew}
                  className="px-6 py-2 font-semibold rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)', color: '#0C1222' }}
                >
                  신규 등록
                </button>
              </div>

              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[var(--surface-100)]">
                    <tr>
                      <SortableHeader<PreAlertSetting> columnKey="setting_name" label="설정명" sortConfig={settingsSortConfig} onSort={handleSettingsSort} />
                      <SortableHeader<PreAlertSetting> columnKey="service_group" label="Service" sortConfig={settingsSortConfig} onSort={handleSettingsSort} />
                      <SortableHeader<PreAlertSetting> columnKey="shipper_code" label="Shipper" sortConfig={settingsSortConfig} onSort={handleSettingsSort} />
                      <SortableHeader<PreAlertSetting> columnKey="consignee_code" label="Consignee" sortConfig={settingsSortConfig} onSort={handleSettingsSort} />
                      <SortableHeader<PreAlertSetting> columnKey="pol_code" label="POL/POD" sortConfig={settingsSortConfig} onSort={handleSettingsSort} />
                      <SortableHeader<PreAlertSetting> columnKey="base_date_type" label="Base Date" sortConfig={settingsSortConfig} onSort={handleSettingsSort} />
                      <SortableHeader<PreAlertSetting> columnKey="auto_send_yn" label="Auto" sortConfig={settingsSortConfig} onSort={handleSettingsSort} />
                      <SortableHeader<PreAlertSetting> columnKey="use_yn" label="사용" sortConfig={settingsSortConfig} onSort={handleSettingsSort} />
                      <th className="px-4 py-3 text-center text-sm font-medium">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-[var(--muted)]">
                          로딩 중...
                        </td>
                      </tr>
                    ) : settings.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-[var(--muted)]">
                          등록된 설정이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      sortSettingsData(settings).map(item => (
                        <tr key={item.setting_id} className="hover:bg-[var(--surface-50)]">
                          <td className="px-4 py-3 text-sm font-medium">{item.setting_name}</td>
                          <td className="px-4 py-3 text-sm">{item.service_group}</td>
                          <td className="px-4 py-3 text-sm">{item.shipper_code || '*'}</td>
                          <td className="px-4 py-3 text-sm">{item.consignee_code || '*'}</td>
                          <td className="px-4 py-3 text-sm">
                            {item.pol_code || '*'} → {item.pod_code || '*'}
                          </td>
                          <td className="px-4 py-3 text-sm">{item.base_date_type}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${
                              item.auto_send_yn === 'Y' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {item.auto_send_yn === 'Y' ? 'ON' : 'OFF'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${
                              item.use_yn === 'Y' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {item.use_yn === 'Y' ? '사용' : '미사용'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleEdit(item)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDelete(item.setting_id)}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Mail Log 탭 */}
          {activeTab === 'logs' && (
            <>
              <div className="card p-4 mb-4">
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Doc No.</label>
                    <input
                      type="text"
                      value={logFilters.docNo}
                      onChange={e => setLogFilters(p => ({ ...p, docNo: e.target.value }))}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm"
                      placeholder="MAWB No."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">상태</label>
                    <select
                      value={logFilters.status}
                      onChange={e => setLogFilters(p => ({ ...p, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm"
                    >
                      <option value="">전체</option>
                      <option value="SUCCESS">성공</option>
                      <option value="STANDBY">대기</option>
                      <option value="FAILED">실패</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">시작일</label>
                    <input
                      type="date"
                      value={logFilters.startDate}
                      onChange={e => setLogFilters(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--muted)]">종료일</label>
                    <input
                      type="date"
                      value={logFilters.endDate}
                      onChange={e => setLogFilters(p => ({ ...p, endDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={fetchLogs}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      검색
                    </button>
                  </div>
                </div>
              </div>

              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[var(--surface-100)]">
                    <tr>
                      <SortableHeader<MailLog> columnKey="status" label="상태" sortConfig={logsSortConfig} onSort={handleLogsSort} />
                      <SortableHeader<MailLog> columnKey="doc_no" label="Doc No." sortConfig={logsSortConfig} onSort={handleLogsSort} />
                      <SortableHeader<MailLog> columnKey="mail_subject" label="제목" sortConfig={logsSortConfig} onSort={handleLogsSort} />
                      <SortableHeader<MailLog> columnKey="mail_from" label="From" sortConfig={logsSortConfig} onSort={handleLogsSort} />
                      <SortableHeader<MailLog> columnKey="mail_to" label="To" sortConfig={logsSortConfig} onSort={handleLogsSort} />
                      <SortableHeader<MailLog> columnKey="send_dt_fmt" label="발송일시" sortConfig={logsSortConfig} onSort={handleLogsSort} />
                      <SortableHeader<MailLog> columnKey="setting_name" label="설정" sortConfig={logsSortConfig} onSort={handleLogsSort} />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-[var(--muted)]">
                          로딩 중...
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-[var(--muted)]">
                          발송 이력이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      sortLogsData(logs).map(log => (
                        <tr key={log.log_id} className="hover:bg-[var(--surface-50)]">
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full text-white ${statusConfig[log.status]?.color || 'bg-gray-500'}`}>
                              {statusConfig[log.status]?.label || log.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">{log.doc_no}</td>
                          <td className="px-4 py-3 text-sm">{log.mail_subject}</td>
                          <td className="px-4 py-3 text-sm">{log.mail_from}</td>
                          <td className="px-4 py-3 text-sm">{log.mail_to?.substring(0, 30)}...</td>
                          <td className="px-4 py-3 text-sm">{log.send_dt_fmt || log.created_dt_fmt}</td>
                          <td className="px-4 py-3 text-sm">{log.setting_name}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Settings 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--surface-100)] rounded-lg shadow-xl p-6 w-[800px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Pre-Alert 설정 {editingItem ? '수정' : '등록'}
              </h2>
              {!editingItem && (
                <button
                  onClick={() => setShowAWBModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  AWB 선택
                </button>
              )}
            </div>

            {/* 선택된 AWB 정보 표시 */}
            {selectedAwb && (
              <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-400 font-medium">선택된 AWB</span>
                  <button
                    onClick={() => setSelectedAwb(null)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    (해제)
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div><span className="text-[var(--muted)]">MAWB: </span><span className="font-medium">{selectedAwb.mawb_no}</span></div>
                  <div><span className="text-[var(--muted)]">편명: </span><span>{selectedAwb.flight_no}</span></div>
                  <div><span className="text-[var(--muted)]">구간: </span><span>{selectedAwb.origin_airport_cd} → {selectedAwb.dest_airport_cd}</span></div>
                  <div><span className="text-[var(--muted)]">ETD: </span><span>{selectedAwb.etd_dt}</span></div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">설정명 *</label>
                <input
                  type="text"
                  value={formData.setting_name || ''}
                  onChange={e => setFormData(p => ({ ...p, setting_name: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  placeholder="예: SKC ICN-LAX Pre-alert"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Service Group</label>
                <select
                  value={formData.service_group || 'AIR'}
                  onChange={e => setFormData(p => ({ ...p, service_group: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                >
                  <option value="AIR">AIR</option>
                  <option value="SEA">SEA</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Base Date</label>
                <select
                  value={formData.base_date_type || 'ETD'}
                  onChange={e => setFormData(p => ({ ...p, base_date_type: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                >
                  <option value="ETD">ETD</option>
                  <option value="ON_BOARD">On-board Date</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Shipper Code</label>
                <input
                  type="text"
                  value={formData.shipper_code || ''}
                  onChange={e => setFormData(p => ({ ...p, shipper_code: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  placeholder="* 전체"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Consignee Code</label>
                <input
                  type="text"
                  value={formData.consignee_code || ''}
                  onChange={e => setFormData(p => ({ ...p, consignee_code: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  placeholder="* 전체"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">POL</label>
                <input
                  type="text"
                  value={formData.pol_code || ''}
                  onChange={e => setFormData(p => ({ ...p, pol_code: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  placeholder="ICN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">POD</label>
                <input
                  type="text"
                  value={formData.pod_code || ''}
                  onChange={e => setFormData(p => ({ ...p, pod_code: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  placeholder="LAX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">첨부파일 유형</label>
                <input
                  type="text"
                  value={formData.attachment_types || ''}
                  onChange={e => setFormData(p => ({ ...p, attachment_types: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  placeholder="HBL,MBL,CI,PL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">자동발송</label>
                <div className="flex items-center gap-4">
                  <select
                    value={formData.auto_send_yn || 'N'}
                    onChange={e => setFormData(p => ({ ...p, auto_send_yn: e.target.value }))}
                    className="px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  >
                    <option value="Y">ON</option>
                    <option value="N">OFF</option>
                  </select>
                  <input
                    type="time"
                    value={formData.auto_send_time || ''}
                    onChange={e => setFormData(p => ({ ...p, auto_send_time: e.target.value }))}
                    className="px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                    placeholder="발송시간"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">메일 제목</label>
                <input
                  type="text"
                  value={formData.mail_subject || ''}
                  onChange={e => setFormData(p => ({ ...p, mail_subject: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  placeholder="Pre-Alert: {MAWB_NO} - {ETD}"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">메일 본문</label>
                <textarea
                  value={formData.mail_body || ''}
                  onChange={e => setFormData(p => ({ ...p, mail_body: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  rows={4}
                  placeholder="메일 본문 템플릿..."
                />
              </div>
            </div>

            {/* 수신자 목록 */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-[var(--muted)]">수신자 목록</label>
                <button
                  onClick={addAddress}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  + 추가
                </button>
              </div>
              {formData.addresses?.map((addr, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <select
                    value={addr.addr_type}
                    onChange={e => updateAddress(idx, 'addr_type', e.target.value)}
                    className="px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                  >
                    <option value="FROM">FROM</option>
                    <option value="TO">TO</option>
                    <option value="CC">CC</option>
                    <option value="BCC">BCC</option>
                  </select>
                  <input
                    type="text"
                    value={addr.addr_name}
                    onChange={e => updateAddress(idx, 'addr_name', e.target.value)}
                    className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                    placeholder="이름"
                  />
                  <input
                    type="email"
                    value={addr.email}
                    onChange={e => updateAddress(idx, 'email', e.target.value)}
                    className="flex-1 px-3 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg"
                    placeholder="이메일"
                  />
                  <button
                    onClick={() => removeAddress(idx)}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowModal(false); setEditingItem(null); setSelectedAwb(null); }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 font-semibold rounded-lg"
                style={{ background: 'linear-gradient(135deg, #E8A838 0%, #D4943A 100%)', color: '#0C1222' }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AWB 선택 팝업 */}
      <AWBSelectModal
        isOpen={showAWBModal}
        onClose={() => setShowAWBModal(false)}
        onSelect={handleAWBSelect}
      />
    </div>
  );
}
