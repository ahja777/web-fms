# FMS Database ERD (Entity Relationship Diagram)

## 1. 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FMS DATABASE ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                    │
│   │   MASTER     │     │   SCHEDULE   │     │    ORDER     │                    │
│   │──────────────│     │──────────────│     │──────────────│                    │
│   │ Country      │     │ Voyage       │     │ Shipment ◄───┼──── 핵심 엔티티    │
│   │ Port         │     │ Ocean Sched  │     │ Order        │                    │
│   │ Customer     │◄────│ Air Schedule │◄────│ Booking      │                    │
│   │ Carrier      │     │ MAWB Stock   │     │              │                    │
│   │ Trucker      │     │ Space        │     │              │                    │
│   │ Partner      │     │              │     │              │                    │
│   │ Broker       │     │              │     │              │                    │
│   └──────────────┘     └──────────────┘     └──────┬───────┘                    │
│          │                    │                    │                             │
│          │                    │                    │                             │
│          ▼                    ▼                    ▼                             │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                    │
│   │    B/L       │     │   SHIPMENT   │     │  TRANSPORT   │                    │
│   │──────────────│     │──────────────│     │──────────────│                    │
│   │ Master BL    │◄────│ S/R          │     │ Order        │                    │
│   │ House BL     │     │ S/N          │────►│ Schedule     │                    │
│   │ Master AWB   │     │ A/N          │     │ POD          │                    │
│   │ House AWB    │     │ Pre-Alert    │     │ Tracking     │                    │
│   │ Container    │     │ Tracking     │     │              │                    │
│   │ IRRE         │     │              │     │              │                    │
│   └──────────────┘     └──────────────┘     └──────────────┘                    │
│          │                    │                    │                             │
│          │                    │                    │                             │
│          ▼                    ▼                    ▼                             │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                    │
│   │   CUSTOMS    │     │   BILLING    │     │              │                    │
│   │──────────────│     │──────────────│     │              │                    │
│   │ Request      │     │ Contract     │     │              │                    │
│   │ Export Decl  │────►│ Tariff       │     │              │                    │
│   │ Import Decl  │     │ AR/AP        │     │              │                    │
│   │ AMS          │     │ Invoice      │     │              │                    │
│   │ Manifest     │     │ Profit/Loss  │     │              │                    │
│   │ EDI Log      │     │ Performance  │     │              │                    │
│   └──────────────┘     └──────────────┘     └──────────────┘                    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 2. 핵심 엔티티 관계도

### 2.1 Shipment 중심 관계

```
                                    ┌───────────────┐
                                    │  MST_CUSTOMER │
                                    └───────┬───────┘
                                            │ 1:N
                                            ▼
┌───────────────┐      1:N      ┌───────────────────┐      1:N      ┌───────────────┐
│  MST_CARRIER  │◄──────────────│   ORD_SHIPMENT    │──────────────►│  MST_PARTNER  │
└───────────────┘               │                   │               └───────────────┘
                                │ - SHIPMENT_NO     │
                                │ - TRANSPORT_MODE  │
                                │ - TRADE_TYPE      │
                                │ - STATUS          │
                                └─────────┬─────────┘
                                          │
              ┌───────────────┬───────────┼───────────┬───────────────┐
              │               │           │           │               │
              ▼               ▼           ▼           ▼               ▼
       ┌──────────┐    ┌──────────┐ ┌──────────┐ ┌──────────┐  ┌──────────┐
       │ BOOKING  │    │   B/L    │ │ SHIPMENT │ │ CUSTOMS  │  │ BILLING  │
       │──────────│    │──────────│ │──────────│ │──────────│  │──────────│
       │ Ocean    │    │ MBL/HBL  │ │ S/R, S/N │ │ Request  │  │ AR/AP    │
       │ Air      │    │ MAWB/HAWB│ │ A/N      │ │ Decl     │  │ Invoice  │
       └──────────┘    │ Container│ │ Pre-Alert│ │ AMS      │  │ P/L      │
                       └──────────┘ │ Tracking │ │ Manifest │  └──────────┘
                                    └──────────┘ └──────────┘
```

### 2.2 해상 운송 흐름

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ ORD_CUSTOMER │     │ ORD_OCEAN    │     │ SCH_OCEAN    │
│    _ORDER    │────►│   _BOOKING   │◄────│  _SCHEDULE   │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ ORD_SHIPMENT │
                     └──────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
       ┌──────────┐  ┌──────────┐  ┌──────────┐
       │BL_MASTER │  │BL_HOUSE  │  │   BL_    │
       │   _BL    │◄─│   _BL    │──│CONTAINER │
       └──────────┘  └──────────┘  └──────────┘
```

### 2.3 항공 운송 흐름

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ ORD_CUSTOMER │     │  ORD_AIR     │◄────│  SCH_AIR     │
│    _ORDER    │────►│  _BOOKING    │     │  _SCHEDULE   │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ ORD_SHIPMENT │
                     └──────┬───────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
       ┌──────────────┐           ┌──────────────┐
       │ BL_MASTER_AWB│◄──────────│ BL_HOUSE_AWB │
       └──────────────┘           └──────────────┘
```

### 2.4 정산 흐름

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ BIL_CONTRACT  │────►│  BIL_TARIFF   │     │ ORD_SHIPMENT  │
└───────────────┘     └───────┬───────┘     └───────┬───────┘
                              │                     │
                              ▼                     ▼
                       ┌──────────────────────────────┐
                       │      Auto-Rating Engine       │
                       └──────────────┬───────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
             ┌──────────┐      ┌──────────┐      ┌──────────┐
             │  BIL_AR  │      │  BIL_AP  │      │BIL_PROFIT│
             │  (매출)  │      │  (매입)  │      │  _LOSS   │
             └────┬─────┘      └──────────┘      └──────────┘
                  │
                  ▼
             ┌──────────┐      ┌──────────┐
             │  BIL_    │◄─────│  BIL_    │
             │ INVOICE  │      │ RECEIPT  │
             └──────────┘      └──────────┘
```

## 3. 테이블 목록

### 3.1 기준정보 (Master) - 13개

| 테이블명 | 설명 | 주요 컬럼 |
|----------|------|-----------|
| MST_COUNTRY | 국가 | COUNTRY_CD, COUNTRY_NM |
| MST_CURRENCY | 통화 | CURRENCY_CD, CURRENCY_SYMBOL |
| MST_EXCHANGE_RATE | 환율 | BASE_CURRENCY_CD, RATE_DT, EXCHANGE_RATE |
| MST_PORT | 항구/공항 | PORT_CD, PORT_TYPE_CD, COUNTRY_CD |
| MST_COMPANY | 회사(자사) | COMPANY_CD, COMPANY_NM |
| MST_CUSTOMER | 화주 | CUSTOMER_CD, CUSTOMER_TYPE_CD |
| MST_CUSTOMER_CONTACT | 화주연락처 | CUSTOMER_ID, CONTACT_NM |
| MST_CARRIER | 선사/항공사 | CARRIER_CD, CARRIER_TYPE_CD |
| MST_TRUCKER | 운송사 | TRUCKER_CD, SERVICE_AREA |
| MST_PARTNER | 해외파트너 | PARTNER_CD, COUNTRY_CD |
| MST_CUSTOMS_BROKER | 관세사 | BROKER_CD, LICENSE_NO |
| MST_COMMON_CODE | 공통코드 | CODE_GROUP_ID, CODE_CD |
| MST_HS_CODE | HS코드 | HS_CODE, HS_CODE_NM |
| MST_USER | 사용자 | USER_LOGIN_ID, USER_TYPE_CD |

### 3.2 스케줄 (Schedule) - 6개

| 테이블명 | 설명 | 주요 컬럼 |
|----------|------|-----------|
| SCH_VOYAGE | 항차 | CARRIER_ID, VESSEL_NM, VOYAGE_NO |
| SCH_OCEAN_SCHEDULE | 해상스케줄 | VOYAGE_ID, POL_PORT_CD, POD_PORT_CD, ETD_DTM |
| SCH_OCEAN_SPACE | 해상SPACE | OCEAN_SCHEDULE_ID, CNTR_TYPE_CD, AVAILABLE_QTY |
| SCH_OCEAN_SPACE_ALLOC | SPACE분배 | SPACE_ID, CUSTOMER_ID, ALLOC_QTY |
| SCH_AIR_SCHEDULE | 항공스케줄 | CARRIER_ID, FLIGHT_NO, ORIGIN_PORT_CD |
| SCH_MAWB_STOCK | MAWB재고 | CARRIER_ID, AIRLINE_PREFIX, SERIAL_START |
| SCH_MAWB_STOCK_DTL | MAWB상세 | MAWB_STOCK_ID, MAWB_NO, STATUS_CD |

### 3.3 오더/부킹 (Order) - 8개

| 테이블명 | 설명 | 주요 컬럼 |
|----------|------|-----------|
| ORD_SHIPMENT | 선적건 | SHIPMENT_NO, TRANSPORT_MODE_CD, TRADE_TYPE_CD |
| ORD_CUSTOMER_ORDER | 화주오더 | ORDER_NO, ORDER_TYPE_CD, CUSTOMER_ID |
| ORD_CUSTOMER_ORDER_CARGO | 오더화물 | ORDER_ID, COMMODITY_DESC, HS_CODE |
| ORD_OCEAN_BOOKING | 해상부킹 | BOOKING_NO, CARRIER_BOOKING_NO, CARRIER_ID |
| ORD_OCEAN_BOOKING_CNTR | 부킹컨테이너 | BOOKING_ID, CNTR_TYPE_CD, CNTR_QTY |
| ORD_AIR_BOOKING | 항공부킹 | BOOKING_NO, CARRIER_ID, FLIGHT_NO |
| ORD_SHIPMENT_STATUS_HIST | 상태이력 | SHIPMENT_ID, STATUS_CD, EVENT_DTM |
| ORD_ATTACHMENT | 첨부파일 | REF_TYPE_CD, REF_ID, FILE_NM |

### 3.4 B/L & AWB - 10개

| 테이블명 | 설명 | 주요 컬럼 |
|----------|------|-----------|
| BL_MASTER_BL | MBL | MBL_NO, CARRIER_ID, VESSEL_NM |
| BL_HOUSE_BL | HBL | HBL_NO, MBL_ID, CUSTOMER_ID |
| BL_HOUSE_BL_CARGO | HBL화물 | HBL_ID, COMMODITY_DESC, HS_CODE |
| BL_CONTAINER | 컨테이너 | CNTR_NO, CNTR_TYPE_CD, SEAL_NO |
| BL_MASTER_AWB | MAWB | MAWB_NO, CARRIER_ID, FLIGHT_NO |
| BL_HOUSE_AWB | HAWB | HAWB_NO, MAWB_ID, CUSTOMER_ID |
| BL_HOUSE_AWB_CARGO | HAWB화물 | HAWB_ID, COMMODITY_DESC, HS_CODE |
| BL_IRRE | IRRE(사고) | IRRE_NO, IRRE_TYPE_CD, SHIPMENT_ID |

### 3.5 선적/도착 (Shipment) - 6개

| 테이블명 | 설명 | 주요 컬럼 |
|----------|------|-----------|
| SHP_SHIPPING_REQUEST | 선적요청(S/R) | SR_NO, SHIPMENT_ID, CUSTOMER_ID |
| SHP_SHIPPING_NOTICE | 선적통지(S/N) | SN_NO, SHIPMENT_ID, MBL_ID |
| SHP_ARRIVAL_NOTICE | 도착통지(A/N) | AN_NO, SHIPMENT_ID, ETA_DT |
| SHP_PRE_ALERT | Pre-Alert | PRE_ALERT_NO, SHIPMENT_ID, TRIGGER_TYPE_CD |
| SHP_PRE_ALERT_SETTING | Pre-Alert설정 | USER_ID, TRIGGER_TYPE_CD |
| SHP_TRACKING_EVENT | 화물추적 | SHIPMENT_ID, EVENT_CD, EVENT_DTM |

### 3.6 내륙운송 (Transport) - 6개

| 테이블명 | 설명 | 주요 컬럼 |
|----------|------|-----------|
| TRN_TRANSPORT_ORDER | 운송지시 | TRANSPORT_ORDER_NO, TRANSPORT_TYPE_CD |
| TRN_TRANSPORT_ORDER_STOP | 운송경유지 | TRANSPORT_ORDER_ID, SEQ_NO, LOCATION_NM |
| TRN_TRANSPORT_SCHEDULE | 운송스케줄 | TRANSPORT_ORDER_ID, TRUCKER_ID |
| TRN_POD | POD | POD_NO, SHIPMENT_ID, DELIVERY_DT |
| TRN_POD_DETAIL | POD상세 | POD_ID, COMMODITY_DESC, CONDITION_CD |
| TRN_TRANSPORT_TRACKING | 운송추적 | TRANSPORT_ORDER_ID, EVENT_CD, LOCATION_NM |

### 3.7 통관 (Customs) - 9개

| 테이블명 | 설명 | 주요 컬럼 |
|----------|------|-----------|
| CUS_CUSTOMS_REQUEST | 통관요청 | CUSTOMS_REQUEST_NO, CUSTOMS_TYPE_CD |
| CUS_EXPORT_DECLARATION | 수출신고서 | EXPORT_DECL_NO, CUSTOMS_OFFICE_CD |
| CUS_EXPORT_DECLARATION_ITEM | 수출신고품목 | EXPORT_DECL_ID, HS_CODE, QTY |
| CUS_IMPORT_DECLARATION | 수입신고서 | IMPORT_DECL_NO, CUSTOMS_OFFICE_CD |
| CUS_IMPORT_DECLARATION_ITEM | 수입신고품목 | IMPORT_DECL_ID, HS_CODE, DUTY_AMT |
| CUS_AMS | AMS | AMS_NO, AMS_TYPE_CD, BL_NO |
| CUS_MANIFEST | 적하목록 | MANIFEST_NO, MANIFEST_TYPE_CD |
| CUS_MANIFEST_DETAIL | 적하목록상세 | MANIFEST_ID, BL_NO, PKG_QTY |
| CUS_EDI_LOG | EDI이력 | EDI_TYPE_CD, REF_ID, STATUS_CD |

### 3.8 정산 (Billing) - 12개

| 테이블명 | 설명 | 주요 컬럼 |
|----------|------|-----------|
| BIL_CONTRACT | 계약 | CONTRACT_NO, PARTNER_TYPE_CD, CONTRACT_START_DT |
| BIL_TARIFF | 요율 | TARIFF_CD, CHARGE_CD, RATE_AMT |
| BIL_TARIFF_TIER | 요율구간 | TARIFF_ID, FROM_VALUE, TO_VALUE, RATE_AMT |
| BIL_AR | 매출 | AR_NO, SHIPMENT_ID, CUSTOMER_ID, CHARGE_CD |
| BIL_AP | 매입 | AP_NO, SHIPMENT_ID, VENDOR_ID, CHARGE_CD |
| BIL_INVOICE | Invoice | INVOICE_NO, CUSTOMER_ID, TOTAL_AMT |
| BIL_INVOICE_DETAIL | Invoice상세 | INVOICE_ID, AR_ID, AMT |
| BIL_RECEIPT | 수금 | RECEIPT_NO, CUSTOMER_ID, RECEIPT_AMT |
| BIL_RECEIPT_ALLOC | 수금배분 | RECEIPT_ID, INVOICE_ID, ALLOC_AMT |
| BIL_PROFIT_LOSS | 손익 | SHIPMENT_ID, AR_AMT, AP_AMT, GROSS_PROFIT_AMT |
| BIL_PERFORMANCE | 실적 | PERF_YEAR, PERF_MONTH, CUSTOMER_ID |

## 4. 총 테이블 수: 70개

| 도메인 | 테이블 수 |
|--------|-----------|
| Master | 14 |
| Schedule | 7 |
| Order | 8 |
| B/L & AWB | 8 |
| Shipment | 6 |
| Transport | 6 |
| Customs | 9 |
| Billing | 12 |
| **합계** | **70** |
