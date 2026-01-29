'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useEnterNavigation } from '@/hooks/useEnterNavigation';
import * as XLSX from 'xlsx';
import { useSorting, SortableHeader, SortConfig } from '@/components/table/SortableTable';

interface ExchangeRate {
  rateId?: number;
  currencyCode: string;
  currencyName: string;
  ttb: number;
  tts: number;
  dealBasR: number;
  bkpr: number;
  kftcDealBasR: number;
  rateDate?: string;
}

interface ExchangeRateResponse {
  success: boolean;
  data: ExchangeRate[];
  searchDate: string;
  updateTime: string;
  source?: string;
  isDemo?: boolean;
  message?: string;
}

// 주요 통화 (카드에 표시)
const MAIN_CURRENCIES = ['USD', 'EUR', 'JPY(100)', 'CNY'];

// 통화별 국가 코드 (텍스트 기반)
const currencyCountryCodes: Record<string, string> = {
  'USD': 'US',
  'EUR': 'EU',
  'JPY(100)': 'JP',
  'CNY': 'CN',
  'GBP': 'GB',
  'HKD': 'HK',
  'SGD': 'SG',
  'AUD': 'AU',
  'CAD': 'CA',
  'CHF': 'CH',
  'THB': 'TH',
  'NZD': 'NZ',
  'MYR': 'MY',
  'IDR(100)': 'ID',
  'VND(100)': 'VN',
  'PHP': 'PH',
  'INR': 'IN',
  'TWD': 'TW',
};

// 국가 코드별 배경색
const countryColors: Record<string, string> = {
  'US': 'bg-blue-600',
  'EU': 'bg-blue-800',
  'JP': 'bg-red-600',
  'CN': 'bg-red-700',
  'GB': 'bg-blue-700',
  'HK': 'bg-red-500',
  'SG': 'bg-red-600',
  'AU': 'bg-green-700',
  'CA': 'bg-red-600',
  'CH': 'bg-red-600',
  'TH': 'bg-blue-600',
  'NZ': 'bg-blue-800',
  'MY': 'bg-yellow-600',
  'ID': 'bg-red-600',
  'VN': 'bg-red-700',
  'PH': 'bg-blue-600',
  'IN': 'bg-orange-600',
  'TW': 'bg-blue-700',
};

// 통화명 한글 매핑 (짧은 이름)
const currencyKoreanNames: Record<string, string> = {
  'USD': '달러',
  'EUR': '유로',
  'JPY(100)': '엔',
  'CNY': '위안',
  'GBP': '파운드',
  'HKD': '홍콩달러',
  'SGD': '싱가포르달러',
  'AUD': '호주달러',
  'CAD': '캐나다달러',
  'CHF': '스위스프랑',
  'THB': '바트',
  'NZD': '뉴질랜드달러',
  'MYR': '링깃',
  'IDR(100)': '루피아',
  'VND(100)': '동',
  'PHP': '페소',
  'INR': '루피',
  'TWD': '대만달러',
};

// 통화명 가져오기 (한글 매핑 우선)
function getCurrencyDisplayName(currencyCode: string, originalName: string): string {
  return currencyKoreanNames[currencyCode] || originalName;
}

// 국가 코드 배지 컴포넌트
function CountryBadge({ currencyCode }: { currencyCode: string }) {
  const countryCode = currencyCountryCodes[currencyCode] || '--';
  const bgColor = countryColors[countryCode] || 'bg-gray-600';

  return (
    <span className={`inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold text-white ${bgColor}`}>
      {countryCode}
    </span>
  );
}

// 숫자 포맷 (천단위 콤마)
function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// 날짜 포맷 (YYYY-MM-DD)
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// 날짜를 API 형식으로 변환 (YYYYMMDD)
function toApiDate(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

export default function ExchangeRatePage() {
  const formRef = useRef<HTMLDivElement>(null);
  useEnterNavigation({ containerRef: formRef as React.RefObject<HTMLElement> });

  const today = formatDate(new Date());

  const [searchDate, setSearchDate] = useState(today);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [updateTime, setUpdateTime] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sortConfig, handleSort, sortData } = useSorting<ExchangeRate>();

  // 환율 조회
  const fetchExchangeRates = useCallback(async (date?: string) => {
    setLoading(true);
    try {
      const dateParam = date ? toApiDate(date) : toApiDate(searchDate);
      const response = await fetch(`/api/exchange-rate?date=${dateParam}`);
      const result: ExchangeRateResponse = await response.json();

      if (result.success) {
        setRates(result.data);
        setUpdateTime(result.updateTime);
        setDataSource(result.source || '');
        setIsDemo(result.isDemo || false);
        setMessage(result.message || '');
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      setMessage('환율 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [searchDate]);

  // 초기 로드
  useEffect(() => {
    fetchExchangeRates();
  }, []);

  // 빠른 날짜 버튼
  const handleQuickDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const newDate = formatDate(date);
    setSearchDate(newDate);
    fetchExchangeRates(newDate);
  };

  // 검색 버튼 클릭
  const handleSearch = () => {
    fetchExchangeRates(searchDate);
  };

  // 엑셀 다운로드
  const handleExcelDownload = () => {
    if (rates.length === 0) {
      alert('다운로드할 환율 데이터가 없습니다.');
      return;
    }

    const excelData = rates.map((rate, idx) => ({
      'No': idx + 1,
      '통화코드': rate.currencyCode,
      '통화명': rate.currencyName,
      '매매기준율': rate.dealBasR,
      '송금보내실때(TTS)': rate.tts,
      '송금받으실때(TTB)': rate.ttb,
      '서울외국환중개': rate.kftcDealBasR,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '환율정보');

    // 열 너비 설정
    ws['!cols'] = [
      { wch: 5 }, { wch: 12 }, { wch: 20 }, { wch: 15 },
      { wch: 18 }, { wch: 18 }, { wch: 15 }
    ];

    const fileName = `환율정보_${searchDate.replace(/-/g, '')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // 엑셀 업로드
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // 데이터 변환
      const uploadRates = jsonData.map((row: any) => ({
        currencyCode: row['통화코드'] || row.currencyCode,
        currencyName: row['통화명'] || row.currencyName,
        dealBasR: parseFloat(row['매매기준율'] || row.dealBasR) || 0,
        tts: parseFloat(row['송금보내실때(TTS)'] || row.tts) || 0,
        ttb: parseFloat(row['송금받으실때(TTB)'] || row.ttb) || 0,
        bkpr: parseFloat(row['장부가격'] || row.bkpr) || 0,
        kftcDealBasR: parseFloat(row['서울외국환중개'] || row.kftcDealBasR) || 0,
      }));

      if (uploadRates.length === 0) {
        alert('유효한 환율 데이터가 없습니다.');
        return;
      }

      // API로 저장
      const response = await fetch('/api/exchange-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: searchDate, rates: uploadRates }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`${result.savedCount}개 환율 데이터가 저장되었습니다.`);
        fetchExchangeRates(searchDate);
      } else {
        alert('저장 실패: ' + result.error);
      }
    } catch (error) {
      console.error('Excel upload error:', error);
      alert('엑셀 파일 처리 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 필터링된 환율 목록
  const filteredRates = rates.filter(rate => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      rate.currencyCode.toLowerCase().includes(term) ||
      rate.currencyName.toLowerCase().includes(term)
    );
  });

  // 주요 통화 데이터
  const mainCurrencyRates = MAIN_CURRENCIES.map(code =>
    rates.find(r => r.currencyCode === code)
  ).filter(Boolean) as ExchangeRate[];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="ml-72">
        <Header
          title="환율조회"
          subtitle="Logis > 공통 > 환율조회"
        />
        <main ref={formRef} className="p-6">
          {/* 조회 영역 */}
          <div className="card p-6 mb-6">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">조회일자</label>
                <input
                  type="date"
                  value={searchDate}
                  onChange={e => setSearchDate(e.target.value)}
                  max={today}
                  className="px-4 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm"
                />
              </div>

              {/* 빠른 날짜 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleQuickDate(0)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    searchDate === today
                      ? 'bg-blue-600 text-white'
                      : 'bg-[var(--surface-100)] hover:bg-[var(--surface-200)]'
                  }`}
                >
                  오늘
                </button>
                <button
                  onClick={() => handleQuickDate(1)}
                  className="px-3 py-2 bg-[var(--surface-100)] hover:bg-[var(--surface-200)] rounded-lg text-sm transition-colors"
                >
                  어제
                </button>
                <button
                  onClick={() => handleQuickDate(7)}
                  className="px-3 py-2 bg-[var(--surface-100)] hover:bg-[var(--surface-200)] rounded-lg text-sm transition-colors"
                >
                  1주전
                </button>
                <button
                  onClick={() => handleQuickDate(30)}
                  className="px-3 py-2 bg-[var(--surface-100)] hover:bg-[var(--surface-200)] rounded-lg text-sm transition-colors"
                >
                  1개월전
                </button>
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    조회 중...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    환율조회
                  </>
                )}
              </button>

              {/* 구분선 */}
              <div className="w-px h-8 bg-[var(--border)]" />

              {/* 엑셀 다운로드 */}
              <button
                onClick={handleExcelDownload}
                disabled={rates.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                엑셀 다운로드
              </button>

              {/* 엑셀 업로드 */}
              <label className={`px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {uploading ? '업로드 중...' : '엑셀 업로드'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* 업데이트 시간 */}
            {updateTime && (
              <div className="mt-4 text-sm text-[var(--muted)] flex items-center gap-4">
                <span>기준일시: {new Date(updateTime).toLocaleString('ko-KR')}</span>
                {dataSource && (
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    dataSource === 'database' ? 'bg-blue-500/20 text-blue-400' :
                    dataSource === 'api' ? 'bg-green-500/20 text-green-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {dataSource === 'database' ? 'DB 조회' :
                     dataSource === 'api' ? 'API 조회' : '데모 데이터'}
                  </span>
                )}
                {isDemo && (
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                    데모 데이터
                  </span>
                )}
                {message && <span className="text-yellow-400">({message})</span>}
              </div>
            )}
          </div>

          {/* 주요 통화 카드 */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {mainCurrencyRates.map(rate => (
              <div
                key={rate.currencyCode}
                className="card p-4 bg-gradient-to-br from-[var(--surface-100)] to-[var(--surface-50)] border border-[var(--border)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CountryBadge currencyCode={rate.currencyCode} />
                    <div>
                      <span className="font-bold text-lg">{rate.currencyCode}</span>
                      <p className="text-xs text-[var(--muted)]">{getCurrencyDisplayName(rate.currencyCode, rate.currencyName)}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#E8A838]">
                    {formatNumber(rate.dealBasR)}
                  </p>
                  <p className="text-xs text-[var(--muted)]">매매기준율</p>
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--border)] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[var(--muted)]">보내실때</span>
                    <p className="font-medium text-red-400">{formatNumber(rate.tts)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[var(--muted)]">받으실때</span>
                    <p className="font-medium text-blue-400">{formatNumber(rate.ttb)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 검색 필터 */}
          <div className="card p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="통화코드 또는 통화명으로 검색..."
                  className="w-full px-4 py-2 bg-[var(--surface-50)] border border-[var(--border)] rounded-lg text-sm"
                />
              </div>
              <div className="text-sm text-[var(--muted)]">
                총 {filteredRates.length}개 통화
              </div>
            </div>
          </div>

          {/* 환율 테이블 */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--surface-200)]">
                  <tr>
                    <SortableHeader<ExchangeRate> columnKey="currencyCode" label="통화" sortConfig={sortConfig} onSort={handleSort} width="7rem" />
                    <SortableHeader<ExchangeRate> columnKey="currencyName" label="통화명" sortConfig={sortConfig} onSort={handleSort} width="8rem" />
                    <SortableHeader<ExchangeRate> columnKey="dealBasR" label={<>매매<br/>기준율</>} sortConfig={sortConfig} onSort={handleSort} align="right" width="9rem" />
                    <SortableHeader<ExchangeRate> columnKey="tts" label={<span className="text-red-400">송금<br/>보내실때</span>} sortConfig={sortConfig} onSort={handleSort} align="right" width="9rem" />
                    <SortableHeader<ExchangeRate> columnKey="ttb" label={<span className="text-blue-400">송금<br/>받으실때</span>} sortConfig={sortConfig} onSort={handleSort} align="right" width="9rem" />
                    <SortableHeader<ExchangeRate> columnKey="kftcDealBasR" label={<>서울외국환<br/>중개</>} sortConfig={sortConfig} onSort={handleSort} align="right" width="9rem" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-[var(--muted)]">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          환율 정보를 불러오는 중...
                        </div>
                      </td>
                    </tr>
                  ) : filteredRates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-[var(--muted)]">
                        환율 데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    sortData(filteredRates).map((rate, index) => {
                      const isMainCurrency = MAIN_CURRENCIES.includes(rate.currencyCode);
                      return (
                        <tr
                          key={rate.currencyCode}
                          className={`hover:bg-[var(--surface-50)] transition-colors ${
                            isMainCurrency ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <CountryBadge currencyCode={rate.currencyCode} />
                              <span className={`font-medium ${isMainCurrency ? 'text-[#E8A838]' : ''}`}>
                                {rate.currencyCode}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{getCurrencyDisplayName(rate.currencyCode, rate.currencyName)}</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold">
                            {formatNumber(rate.dealBasR)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-red-400">
                            {formatNumber(rate.tts)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-blue-400">
                            {formatNumber(rate.ttb)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[var(--muted)]">
                            {formatNumber(rate.kftcDealBasR)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 안내 문구 */}
          <div className="mt-4 p-4 bg-[var(--surface-50)] rounded-lg text-sm text-[var(--muted)]">
            <p className="font-medium mb-2">환율 안내</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>매매기준율: 은행간 외환거래의 기준이 되는 환율</li>
              <li>송금보내실때 (TTS): 해외로 송금할 때 적용되는 환율 (매매기준율 + 스프레드)</li>
              <li>송금받으실때 (TTB): 해외에서 송금받을 때 적용되는 환율 (매매기준율 - 스프레드)</li>
              <li>JPY(100), IDR(100), VND(100)은 100단위 기준 환율입니다.</li>
              <li>환율 정보는 한국수출입은행 제공 자료이며, 영업일 11:00 이후 고시됩니다.</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
