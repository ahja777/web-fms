# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

통합물류플랫폼 구축사업의 Logistics 플랫폼 프로젝트입니다.
Cloud 기반 통합 물류 Platform으로 포워딩/창고관리/운송관리/가시성관리/정산관리 등 국제 수출입 포워더 全 영역의 통합 기능을 제공합니다.

## Directory Structure

- `Image/` - 물류 문서(Air Waybill, B/L 등) 이미지/PDF 저장
- `backdata/` - 프로젝트 참조 문서 및 제안서

## System Architecture

### 인터지스 Logistics Platform 구성
```
ECC Platform ─┬─ Forwarding (FMS)
              ├─ Warehouse (WMS)
              ├─ Transport (TMS)
              └─ Visibility

Intelligence Platform ─┬─ Monitoring
                       ├─ Control
                       └─ Communication
```

### 외부 연계 대상
- 화주 (Customer/Shipper)
- 실행사 (선사/항공사/운송사)
- 파트너 (해외 포워더)
- 관세사
- 세관 (EDI)

## FMS 핵심 기능 모듈

### 1. 해상수출 (Sea Export)
- 스케줄 관리: 해상운송사 항차/스케줄 정보, SPACE 정보 관리
- Booking 관리: 오더(S/O, D/O, B/R) 관리, B/R-B/C 연계
- 선적 관리: S/R(Shipping Request), 선적/출항정보, S/N(Shipping Notice)
- B/L 관리: HBL(House B/L), MBL(Master B/L), Consolidation

### 2. 항공수출 (Air Export)
- 스케줄 관리: 항공사 스케줄 정보
- Booking 관리: 오더 관리, Booking Merge
- 수탁 관리: MAWB 번호 목록(IATA Stock), 기적/출항정보, Pre-Alert
- AWB 관리: HAWB(House AWB), MAWB(Master AWB)
- IRRE 관리: Exception/사고 정보 관리

### 3. 해상수입 (Sea Import)
- 도착 관리: S/N 기반 오더 관리, A/N(Arrival Notice)
- B/L 관리: MBL, HBL 통합 관리

### 4. 항공수입 (Air Import)
- 도착 관리: Pre-Alert 기반 오더 관리, A/N
- AWB 관리: MAWB, HAWB 통합 관리

### 5. 내륙운송 (Inland Transport)
- 운송정보 관리: 운송지시, Multimodal 지원
- 운송스케줄 관리: 운송 진행상태
- POD/GR 관리: 화물 인수 증빙

### 6. 통관 (Customs)
- 수출/수입 통관 관리: 관세사 연계
- AMS 관리: 세관 사전신고 (미국, 캐나다, 멕시코, 인도 등)
- 적하목록 관리: EDI 전송

### 7. 정산 (Billing - BMS)
- 요율 관리: User Defined Tariff, Contract 기반
- 매출/매입 관리: Auto-Rating Engine
- 실적 관리: Order Base/Term Base, 화주별/국가별/센터별

## 주요 문서 유형

| 문서 코드 | 문서명 | 설명 |
|----------|--------|------|
| S/O | Shipping Order | 선적 오더 |
| D/O | Delivery Order | 인도 지시서 |
| B/R | Booking Request | 부킹 요청 |
| B/C | Booking Confirmation | 부킹 확정 |
| S/R | Shipping Request | 선적 요청 |
| S/N | Shipping Notice | 선적 통지 |
| S/A | Shipping Advice | 선적 안내 |
| A/N | Arrival Notice | 도착 통지 |
| M/F | Manifest | 적하목록 |
| HBL | House B/L | 화주용 선하증권 |
| MBL | Master B/L | 선사 발행 선하증권 |
| HAWB | House Air Waybill | 화주용 항공화물운송장 |
| MAWB | Master Air Waybill | 항공사 발행 운송장 |
| C/I | Commercial Invoice | 상업송장 |
| P/L | Packing List | 포장명세서 |
| POD | Proof of Delivery | 인수 증빙 |
| GR | Goods Receipt | 화물 수령 |

## 연계 인터페이스

지원 연계 방식:
- EDI (Electronic Data Interchange)
- FTP
- XML
- Excel Upload
- Email/Fax

## 핵심 기능 요구사항

1. **Seamless Visibility**: 공급망 전 구간 실시간 가시성
2. **Tracking & Tracing**: 화물 추적 (ATD/ATA Actual 정보)
3. **Exception Alerting**: 실시간 예외상황 알림
4. **Pre-Alert 자동화**: ETD/On-board date 기준 자동 발송
5. **EDI 통합 모니터링**: Inbound/Outbound 통합 관리
6. **Auto-Rating**: 계약단가 기반 자동 운임 산정



# Database Configuration (MariaDB/MySQL)
DATABASE_URL=mysql://user:P%40ssw0rd@211.236.174.220:53306/logstic
DB_USER=user
DB_PASSWORD=P@ssw0rd
DB_HOST=211.236.174.220
DB_NAME=logstic
DB_PORT=53306