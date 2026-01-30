-- ============================================================================
-- FMS Database Schema - 08. Billing (정산)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 8.1 계약 (Contract)
-- ----------------------------------------------------------------------------
CREATE TABLE BIL_CONTRACT (
    CONTRACT_ID         BIGINT          PRIMARY KEY AUTO_INCREMENT,
    CONTRACT_NO         VARCHAR(30)     UNIQUE NOT NULL,    -- 계약번호

    -- 거래처 정보
    PARTNER_TYPE_CD     VARCHAR(20)     NOT NULL,           -- 거래처유형 (CUSTOMER/CARRIER/TRUCKER/PARTNER)
    PARTNER_ID          BIGINT          NOT NULL,           -- 거래처ID
    PARTNER_NM          VARCHAR(200),                       -- 거래처명

    -- 계약 정보
    CONTRACT_TYPE_CD    VARCHAR(20),                        -- 계약유형 (SALES/PURCHASE)
    CONTRACT_NM         VARCHAR(200),                       -- 계약명
    CONTRACT_START_DT   DATE            NOT NULL,           -- 계약시작일
    CONTRACT_END_DT     DATE            NOT NULL,           -- 계약종료일

    -- 서비스 범위
    SERVICE_SCOPE_CD    VARCHAR(20),                        -- 서비스범위 (SEA/AIR/BOTH)
    TRADE_TYPE_CD       VARCHAR(20),                        -- 수출입구분
    ROUTE_CD            VARCHAR(50),                        -- 루트 (특정구간 계약시)

    -- 결제 조건
    PAYMENT_TERM_CD     VARCHAR(20),                        -- 결제조건
    CREDIT_DAYS         INT,                                -- 여신일수
    CREDIT_LIMIT_AMT    DECIMAL(18,2),                      -- 신용한도
    CURRENCY_CD         CHAR(3),                            -- 기준통화

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'DRAFT',    -- 상태 (DRAFT/ACTIVE/EXPIRED/TERMINATED)
    APPROVED_BY         VARCHAR(50),                        -- 승인자
    APPROVED_DTM        DATETIME,                           -- 승인일시

    DESCRIPTION         VARCHAR(2000),                      -- 설명
    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N'
);

COMMENT ON TABLE BIL_CONTRACT IS '계약';

-- ----------------------------------------------------------------------------
-- 8.2 요율 (Tariff)
-- ----------------------------------------------------------------------------
CREATE TABLE BIL_TARIFF (
    TARIFF_ID           BIGINT          PRIMARY KEY AUTO_INCREMENT,
    TARIFF_CD           VARCHAR(30)     NOT NULL,           -- 요율코드
    TARIFF_NM           VARCHAR(200)    NOT NULL,           -- 요율명

    -- 연결 정보
    CONTRACT_ID         BIGINT,                             -- 계약 (계약 기반 요율)

    -- 적용 범위
    PARTNER_TYPE_CD     VARCHAR(20),                        -- 거래처유형
    PARTNER_ID          BIGINT,                             -- 특정거래처 (NULL이면 전체)
    SERVICE_TYPE_CD     VARCHAR(20),                        -- 서비스유형 (SEA_EXPORT/SEA_IMPORT/AIR_EXPORT/AIR_IMPORT/TRUCKING)

    -- 운임 항목
    CHARGE_CD           VARCHAR(20)     NOT NULL,           -- 운임항목코드
    CHARGE_NM           VARCHAR(100),                       -- 운임항목명
    CHARGE_TYPE_CD      VARCHAR(20),                        -- 운임유형 (FREIGHT/THC/DOC/HANDLING 등)
    AR_AP_TYPE_CD       VARCHAR(10)     NOT NULL,           -- AR/AP구분 (AR/AP)

    -- 계산 기준
    CALC_BASIS_CD       VARCHAR(20)     NOT NULL,           -- 계산기준 (PER_SHIPMENT/PER_BL/PER_CNTR/PER_KG/PER_CBM 등)
    CALC_UNIT_CD        VARCHAR(10),                        -- 계산단위
    MIN_CHARGE_AMT      DECIMAL(18,4),                      -- 최소운임
    MAX_CHARGE_AMT      DECIMAL(18,4),                      -- 최대운임

    -- 요율 정보
    RATE_AMT            DECIMAL(18,6),                      -- 요율금액
    RATE_PERCENT        DECIMAL(8,4),                       -- 요율(%)
    CURRENCY_CD         CHAR(3)         NOT NULL,           -- 통화

    -- 적용 조건
    ORIGIN_COUNTRY_CD   CHAR(2),                            -- 출발국가
    ORIGIN_PORT_CD      VARCHAR(10),                        -- 출발항
    DEST_COUNTRY_CD     CHAR(2),                            -- 도착국가
    DEST_PORT_CD        VARCHAR(10),                        -- 도착항
    CARRIER_ID          BIGINT,                             -- 운송사
    CNTR_TYPE_CD        VARCHAR(10),                        -- 컨테이너유형
    COMMODITY_CD        VARCHAR(20),                        -- 품목코드

    -- 유효기간
    VALID_FROM_DT       DATE            NOT NULL,           -- 유효시작일
    VALID_TO_DT         DATE            NOT NULL,           -- 유효종료일

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'ACTIVE',   -- 상태
    PRIORITY_NO         INT             DEFAULT 0,          -- 우선순위 (높을수록 우선)

    DESCRIPTION         VARCHAR(500),                       -- 설명
    REMARKS             VARCHAR(500),                       -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (CONTRACT_ID) REFERENCES BIL_CONTRACT(CONTRACT_ID)
);

COMMENT ON TABLE BIL_TARIFF IS '요율 (Tariff)';

-- 요율 구간 (중량/부피별 구간요율)
CREATE TABLE BIL_TARIFF_TIER (
    TIER_ID             BIGINT          PRIMARY KEY AUTO_INCREMENT,
    TARIFF_ID           BIGINT          NOT NULL,           -- 요율
    TIER_NO             INT             NOT NULL,           -- 구간번호
    FROM_VALUE          DECIMAL(12,3),                      -- 시작값
    TO_VALUE            DECIMAL(12,3),                      -- 종료값
    RATE_AMT            DECIMAL(18,6)   NOT NULL,           -- 구간요율
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (TARIFF_ID) REFERENCES BIL_TARIFF(TARIFF_ID)
);

COMMENT ON TABLE BIL_TARIFF_TIER IS '요율 구간';

-- ----------------------------------------------------------------------------
-- 8.3 매출 (AR - Accounts Receivable)
-- ----------------------------------------------------------------------------
CREATE TABLE BIL_AR (
    AR_ID               BIGINT          PRIMARY KEY AUTO_INCREMENT,
    AR_NO               VARCHAR(30)     UNIQUE NOT NULL,    -- 매출번호

    -- 연결 정보
    SHIPMENT_ID         BIGINT          NOT NULL,           -- 선적건
    HBL_ID              BIGINT,                             -- HBL
    HAWB_ID             BIGINT,                             -- HAWB
    CUSTOMER_ID         BIGINT          NOT NULL,           -- 화주

    -- 매출 정보
    AR_TYPE_CD          VARCHAR(20),                        -- 매출유형 (FREIGHT/HANDLING/OTHER)
    SERVICE_TYPE_CD     VARCHAR(20),                        -- 서비스유형
    CHARGE_CD           VARCHAR(20)     NOT NULL,           -- 운임항목코드
    CHARGE_NM           VARCHAR(100),                       -- 운임항목명

    -- 계산 정보
    CALC_BASIS_CD       VARCHAR(20),                        -- 계산기준
    CALC_QTY            DECIMAL(12,3),                      -- 계산수량
    RATE_AMT            DECIMAL(18,6),                      -- 요율
    RATE_CURRENCY_CD    CHAR(3),                            -- 요율통화

    -- 금액 정보
    ORIGINAL_AMT        DECIMAL(18,2)   NOT NULL,           -- 원통화금액
    ORIGINAL_CURR       CHAR(3)         NOT NULL,           -- 원통화
    EXCHANGE_RATE       DECIMAL(18,6),                      -- 환율
    LOCAL_AMT           DECIMAL(18,2),                      -- 원화금액
    VAT_AMT             DECIMAL(18,2),                      -- 부가세

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'DRAFT',    -- 상태 (DRAFT/CONFIRMED/INVOICED/PAID)
    CONFIRMED_BY        VARCHAR(50),                        -- 확정자
    CONFIRMED_DTM       DATETIME,                           -- 확정일시

    -- 청구 정보
    INVOICE_ID          BIGINT,                             -- Invoice
    INVOICE_NO          VARCHAR(30),                        -- Invoice번호
    INVOICE_DT          DATE,                               -- 청구일

    -- 수금 정보
    RECEIVED_AMT        DECIMAL(18,2)   DEFAULT 0,          -- 수금액
    BALANCE_AMT         DECIMAL(18,2),                      -- 잔액

    -- 요율 참조
    TARIFF_ID           BIGINT,                             -- 적용요율
    AUTO_RATED_YN       CHAR(1)         DEFAULT 'N',        -- Auto-Rating 여부

    REMARKS             VARCHAR(500),                       -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID),
    FOREIGN KEY (CUSTOMER_ID) REFERENCES MST_CUSTOMER(CUSTOMER_ID),
    FOREIGN KEY (TARIFF_ID) REFERENCES BIL_TARIFF(TARIFF_ID)
);

COMMENT ON TABLE BIL_AR IS '매출 (AR)';

-- ----------------------------------------------------------------------------
-- 8.4 매입 (AP - Accounts Payable)
-- ----------------------------------------------------------------------------
CREATE TABLE BIL_AP (
    AP_ID               BIGINT          PRIMARY KEY AUTO_INCREMENT,
    AP_NO               VARCHAR(30)     UNIQUE NOT NULL,    -- 매입번호

    -- 연결 정보
    SHIPMENT_ID         BIGINT          NOT NULL,           -- 선적건
    MBL_ID              BIGINT,                             -- MBL
    MAWB_ID             BIGINT,                             -- MAWB

    -- 거래처 정보
    VENDOR_TYPE_CD      VARCHAR(20)     NOT NULL,           -- 거래처유형 (CARRIER/TRUCKER/PARTNER/BROKER)
    VENDOR_ID           BIGINT          NOT NULL,           -- 거래처ID
    VENDOR_NM           VARCHAR(200),                       -- 거래처명

    -- 매입 정보
    AP_TYPE_CD          VARCHAR(20),                        -- 매입유형
    SERVICE_TYPE_CD     VARCHAR(20),                        -- 서비스유형
    CHARGE_CD           VARCHAR(20)     NOT NULL,           -- 운임항목코드
    CHARGE_NM           VARCHAR(100),                       -- 운임항목명

    -- 계산 정보
    CALC_BASIS_CD       VARCHAR(20),                        -- 계산기준
    CALC_QTY            DECIMAL(12,3),                      -- 계산수량
    RATE_AMT            DECIMAL(18,6),                      -- 요율
    RATE_CURRENCY_CD    CHAR(3),                            -- 요율통화

    -- 금액 정보
    ORIGINAL_AMT        DECIMAL(18,2)   NOT NULL,           -- 원통화금액
    ORIGINAL_CURR       CHAR(3)         NOT NULL,           -- 원통화
    EXCHANGE_RATE       DECIMAL(18,6),                      -- 환율
    LOCAL_AMT           DECIMAL(18,2),                      -- 원화금액
    VAT_AMT             DECIMAL(18,2),                      -- 부가세

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'DRAFT',    -- 상태 (DRAFT/CONFIRMED/PAID)
    CONFIRMED_BY        VARCHAR(50),                        -- 확정자
    CONFIRMED_DTM       DATETIME,                           -- 확정일시
    VERIFIED_BY         VARCHAR(50),                        -- 검증자
    VERIFIED_DTM        DATETIME,                           -- 검증일시

    -- 지급 정보
    PAYMENT_DUE_DT      DATE,                               -- 지급예정일
    PAID_AMT            DECIMAL(18,2)   DEFAULT 0,          -- 지급액
    PAID_DT             DATE,                               -- 지급일
    BALANCE_AMT         DECIMAL(18,2),                      -- 잔액

    -- 거래처 청구 참조
    VENDOR_INVOICE_NO   VARCHAR(50),                        -- 거래처청구번호
    VENDOR_INVOICE_DT   DATE,                               -- 거래처청구일

    -- 요율 참조
    TARIFF_ID           BIGINT,                             -- 적용요율
    AUTO_RATED_YN       CHAR(1)         DEFAULT 'N',        -- Auto-Rating 여부

    REMARKS             VARCHAR(500),                       -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID),
    FOREIGN KEY (TARIFF_ID) REFERENCES BIL_TARIFF(TARIFF_ID)
);

COMMENT ON TABLE BIL_AP IS '매입 (AP)';

-- ----------------------------------------------------------------------------
-- 8.5 Invoice (청구서)
-- ----------------------------------------------------------------------------
CREATE TABLE BIL_INVOICE (
    INVOICE_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
    INVOICE_NO          VARCHAR(30)     UNIQUE NOT NULL,    -- Invoice 번호

    -- 거래처 정보
    CUSTOMER_ID         BIGINT          NOT NULL,           -- 화주
    CUSTOMER_NM         VARCHAR(200),                       -- 화주명
    CUSTOMER_ADDR       VARCHAR(500),                       -- 화주주소

    -- Invoice 정보
    INVOICE_TYPE_CD     VARCHAR(20),                        -- Invoice유형 (REGULAR/CREDIT/DEBIT)
    INVOICE_DT          DATE            NOT NULL,           -- 발행일
    DUE_DT              DATE,                               -- 만기일

    -- 금액 정보
    SUBTOTAL_AMT        DECIMAL(18,2)   NOT NULL,           -- 공급가액
    VAT_AMT             DECIMAL(18,2)   DEFAULT 0,          -- 부가세
    TOTAL_AMT           DECIMAL(18,2)   NOT NULL,           -- 총액
    CURRENCY_CD         CHAR(3)         NOT NULL,           -- 통화

    -- 원화 환산
    EXCHANGE_RATE       DECIMAL(18,6),                      -- 환율
    LOCAL_SUBTOTAL_AMT  DECIMAL(18,2),                      -- 원화공급가액
    LOCAL_VAT_AMT       DECIMAL(18,2),                      -- 원화부가세
    LOCAL_TOTAL_AMT     DECIMAL(18,2),                      -- 원화총액

    -- 수금 정보
    RECEIVED_AMT        DECIMAL(18,2)   DEFAULT 0,          -- 수금액
    BALANCE_AMT         DECIMAL(18,2),                      -- 잔액

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'DRAFT',    -- 상태 (DRAFT/ISSUED/PARTIAL_PAID/PAID/CANCELLED)
    ISSUED_DTM          DATETIME,                           -- 발행일시
    ISSUED_BY           VARCHAR(50),                        -- 발행자

    -- 전자세금계산서
    E_TAX_INVOICE_YN    CHAR(1)         DEFAULT 'N',        -- 전자세금계산서여부
    E_TAX_INVOICE_NO    VARCHAR(50),                        -- 전자세금계산서번호
    E_TAX_ISSUE_DT      DATE,                               -- 전자세금계산서발행일

    -- 참조
    REF_INVOICE_ID      BIGINT,                             -- 참조Invoice (Credit/Debit Note)

    DESCRIPTION         VARCHAR(500),                       -- 설명
    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (CUSTOMER_ID) REFERENCES MST_CUSTOMER(CUSTOMER_ID)
);

COMMENT ON TABLE BIL_INVOICE IS 'Invoice (청구서)';

-- Invoice 상세
CREATE TABLE BIL_INVOICE_DETAIL (
    INVOICE_DTL_ID      BIGINT          PRIMARY KEY AUTO_INCREMENT,
    INVOICE_ID          BIGINT          NOT NULL,           -- Invoice
    LINE_NO             INT             NOT NULL,           -- 라인번호
    AR_ID               BIGINT,                             -- AR
    SHIPMENT_ID         BIGINT,                             -- 선적건
    SHIPMENT_NO         VARCHAR(30),                        -- 선적번호
    HBL_NO              VARCHAR(30),                        -- HBL번호
    CHARGE_CD           VARCHAR(20),                        -- 운임항목코드
    CHARGE_NM           VARCHAR(100),                       -- 운임항목명
    DESCRIPTION         VARCHAR(500),                       -- 설명
    QTY                 DECIMAL(12,3),                      -- 수량
    UNIT_PRICE          DECIMAL(18,6),                      -- 단가
    AMT                 DECIMAL(18,2),                      -- 금액
    VAT_AMT             DECIMAL(18,2),                      -- 부가세
    TOTAL_AMT           DECIMAL(18,2),                      -- 합계
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (INVOICE_ID) REFERENCES BIL_INVOICE(INVOICE_ID),
    FOREIGN KEY (AR_ID) REFERENCES BIL_AR(AR_ID)
);

COMMENT ON TABLE BIL_INVOICE_DETAIL IS 'Invoice 상세';

-- ----------------------------------------------------------------------------
-- 8.6 수금 (Receipt)
-- ----------------------------------------------------------------------------
CREATE TABLE BIL_RECEIPT (
    RECEIPT_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
    RECEIPT_NO          VARCHAR(30)     UNIQUE NOT NULL,    -- 수금번호

    -- 거래처 정보
    CUSTOMER_ID         BIGINT          NOT NULL,           -- 화주

    -- 수금 정보
    RECEIPT_DT          DATE            NOT NULL,           -- 수금일
    RECEIPT_AMT         DECIMAL(18,2)   NOT NULL,           -- 수금액
    CURRENCY_CD         CHAR(3)         NOT NULL,           -- 통화
    EXCHANGE_RATE       DECIMAL(18,6),                      -- 환율
    LOCAL_AMT           DECIMAL(18,2),                      -- 원화금액

    -- 결제 정보
    PAYMENT_METHOD_CD   VARCHAR(20),                        -- 결제방법 (BANK_TRANSFER/CHECK/CASH/CARD)
    BANK_NM             VARCHAR(100),                       -- 은행명
    ACCOUNT_NO          VARCHAR(50),                        -- 계좌번호
    REF_NO              VARCHAR(50),                        -- 참조번호

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'RECEIVED', -- 상태

    REMARKS             VARCHAR(500),                       -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (CUSTOMER_ID) REFERENCES MST_CUSTOMER(CUSTOMER_ID)
);

COMMENT ON TABLE BIL_RECEIPT IS '수금';

-- 수금 배분 (Invoice별)
CREATE TABLE BIL_RECEIPT_ALLOC (
    ALLOC_ID            BIGINT          PRIMARY KEY AUTO_INCREMENT,
    RECEIPT_ID          BIGINT          NOT NULL,           -- 수금
    INVOICE_ID          BIGINT          NOT NULL,           -- Invoice
    ALLOC_AMT           DECIMAL(18,2)   NOT NULL,           -- 배분금액
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (RECEIPT_ID) REFERENCES BIL_RECEIPT(RECEIPT_ID),
    FOREIGN KEY (INVOICE_ID) REFERENCES BIL_INVOICE(INVOICE_ID)
);

COMMENT ON TABLE BIL_RECEIPT_ALLOC IS '수금 배분';

-- ----------------------------------------------------------------------------
-- 8.7 손익 (Profit/Loss)
-- ----------------------------------------------------------------------------
CREATE TABLE BIL_PROFIT_LOSS (
    PL_ID               BIGINT          PRIMARY KEY AUTO_INCREMENT,
    SHIPMENT_ID         BIGINT          NOT NULL,           -- 선적건

    -- 집계 기준
    PL_DT               DATE            NOT NULL,           -- 손익일자
    CUSTOMER_ID         BIGINT,                             -- 화주
    SERVICE_TYPE_CD     VARCHAR(20),                        -- 서비스유형

    -- 매출 (AR)
    AR_AMT              DECIMAL(18,2)   DEFAULT 0,          -- 매출금액
    AR_LOCAL_AMT        DECIMAL(18,2)   DEFAULT 0,          -- 매출원화

    -- 매입 (AP)
    AP_AMT              DECIMAL(18,2)   DEFAULT 0,          -- 매입금액
    AP_LOCAL_AMT        DECIMAL(18,2)   DEFAULT 0,          -- 매입원화

    -- 손익
    GROSS_PROFIT_AMT    DECIMAL(18,2),                      -- 매출총이익
    GROSS_PROFIT_RATE   DECIMAL(8,4),                       -- 매출총이익률

    CURRENCY_CD         CHAR(3)         DEFAULT 'KRW',      -- 통화

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'DRAFT',    -- 상태 (DRAFT/CONFIRMED)
    CONFIRMED_DTM       DATETIME,                           -- 확정일시

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID),
    UNIQUE (SHIPMENT_ID, PL_DT)
);

COMMENT ON TABLE BIL_PROFIT_LOSS IS '손익';

-- ----------------------------------------------------------------------------
-- 8.8 실적 관리 (Performance)
-- ----------------------------------------------------------------------------
CREATE TABLE BIL_PERFORMANCE (
    PERF_ID             BIGINT          PRIMARY KEY AUTO_INCREMENT,

    -- 집계 기준
    PERF_YEAR           INT             NOT NULL,           -- 연도
    PERF_MONTH          INT             NOT NULL,           -- 월
    CUSTOMER_ID         BIGINT,                             -- 화주
    SALES_MANAGER_ID    BIGINT,                             -- 영업담당
    SERVICE_TYPE_CD     VARCHAR(20),                        -- 서비스유형
    TRADE_LANE_CD       VARCHAR(50),                        -- 트레이드레인

    -- 물동량 실적
    SHIPMENT_CNT        INT             DEFAULT 0,          -- 선적건수
    TEU_QTY             DECIMAL(10,2)   DEFAULT 0,          -- TEU
    WEIGHT_KG           DECIMAL(18,3)   DEFAULT 0,          -- 중량
    VOLUME_CBM          DECIMAL(18,4)   DEFAULT 0,          -- 부피

    -- 금액 실적
    AR_AMT              DECIMAL(18,2)   DEFAULT 0,          -- 매출금액
    AP_AMT              DECIMAL(18,2)   DEFAULT 0,          -- 매입금액
    GROSS_PROFIT_AMT    DECIMAL(18,2)   DEFAULT 0,          -- 매출총이익
    CURRENCY_CD         CHAR(3)         DEFAULT 'KRW',      -- 통화

    -- 전년 대비
    PREV_YEAR_AR_AMT    DECIMAL(18,2),                      -- 전년매출
    YOY_GROWTH_RATE     DECIMAL(8,4),                       -- 전년대비성장률

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    UNIQUE (PERF_YEAR, PERF_MONTH, CUSTOMER_ID, SERVICE_TYPE_CD)
);

COMMENT ON TABLE BIL_PERFORMANCE IS '실적 관리';

-- ----------------------------------------------------------------------------
-- 인덱스 생성
-- ----------------------------------------------------------------------------
CREATE INDEX IDX_BIL_CONTRACT_PARTNER ON BIL_CONTRACT(PARTNER_TYPE_CD, PARTNER_ID);
CREATE INDEX IDX_BIL_CONTRACT_STATUS ON BIL_CONTRACT(STATUS_CD);
CREATE INDEX IDX_BIL_TARIFF_SERVICE ON BIL_TARIFF(SERVICE_TYPE_CD);
CREATE INDEX IDX_BIL_TARIFF_CHARGE ON BIL_TARIFF(CHARGE_CD);
CREATE INDEX IDX_BIL_TARIFF_VALID ON BIL_TARIFF(VALID_FROM_DT, VALID_TO_DT);
CREATE INDEX IDX_BIL_AR_SHIPMENT ON BIL_AR(SHIPMENT_ID);
CREATE INDEX IDX_BIL_AR_CUSTOMER ON BIL_AR(CUSTOMER_ID);
CREATE INDEX IDX_BIL_AR_STATUS ON BIL_AR(STATUS_CD);
CREATE INDEX IDX_BIL_AP_SHIPMENT ON BIL_AP(SHIPMENT_ID);
CREATE INDEX IDX_BIL_AP_VENDOR ON BIL_AP(VENDOR_TYPE_CD, VENDOR_ID);
CREATE INDEX IDX_BIL_AP_STATUS ON BIL_AP(STATUS_CD);
CREATE INDEX IDX_BIL_INVOICE_CUSTOMER ON BIL_INVOICE(CUSTOMER_ID);
CREATE INDEX IDX_BIL_INVOICE_STATUS ON BIL_INVOICE(STATUS_CD);
CREATE INDEX IDX_BIL_PL_SHIPMENT ON BIL_PROFIT_LOSS(SHIPMENT_ID);
CREATE INDEX IDX_BIL_PERF_PERIOD ON BIL_PERFORMANCE(PERF_YEAR, PERF_MONTH);
