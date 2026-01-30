-- ============================================================================
-- FMS Database Schema - 03. Order & Booking (오더/부킹)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 Shipment (선적건) - 모든 수출입의 핵심 엔티티
-- ----------------------------------------------------------------------------
CREATE TABLE ORD_SHIPMENT (
    SHIPMENT_ID         BIGINT          PRIMARY KEY AUTO_INCREMENT,
    SHIPMENT_NO         VARCHAR(30)     UNIQUE NOT NULL,    -- 선적번호 (자동채번)

    -- 업무 유형
    TRANSPORT_MODE_CD   VARCHAR(10)     NOT NULL,           -- 운송모드 (SEA/AIR)
    TRADE_TYPE_CD       VARCHAR(10)     NOT NULL,           -- 수출입구분 (EXPORT/IMPORT)
    SERVICE_TYPE_CD     VARCHAR(10),                        -- 서비스유형 (FCL/LCL/BULK/CONSOLE)
    INCOTERMS_CD        VARCHAR(10),                        -- 인코텀즈 (FOB/CIF/EXW 등)

    -- 화주 정보
    CUSTOMER_ID         BIGINT          NOT NULL,           -- 화주
    SHIPPER_ID          BIGINT,                             -- 발송인
    CONSIGNEE_ID        BIGINT,                             -- 수하인
    NOTIFY_PARTY_ID     BIGINT,                             -- 통지처

    -- 실행사 정보
    CARRIER_ID          BIGINT,                             -- 선사/항공사
    BOOKING_AGENT_ID    BIGINT,                             -- 부킹대리점
    PARTNER_ID          BIGINT,                             -- 해외파트너

    -- 출발지 정보
    ORIGIN_COUNTRY_CD   CHAR(2),                            -- 출발국가
    ORIGIN_PORT_CD      VARCHAR(10),                        -- 출발항/공항
    ORIGIN_ADDR         VARCHAR(500),                       -- 출발지주소

    -- 도착지 정보
    DEST_COUNTRY_CD     CHAR(2),                            -- 도착국가
    DEST_PORT_CD        VARCHAR(10),                        -- 도착항/공항
    FINAL_DEST_CD       VARCHAR(10),                        -- 최종목적지
    DEST_ADDR           VARCHAR(500),                       -- 도착지주소

    -- 스케줄 연결
    OCEAN_SCHEDULE_ID   BIGINT,                             -- 해상스케줄
    AIR_SCHEDULE_ID     BIGINT,                             -- 항공스케줄

    -- 일정 정보
    CARGO_READY_DT      DATE,                               -- 화물준비일
    ETD_DT              DATE,                               -- 출발예정일
    ATD_DT              DATE,                               -- 실제출발일
    ETA_DT              DATE,                               -- 도착예정일
    ATA_DT              DATE,                               -- 실제도착일

    -- 화물 요약 정보
    TOTAL_PKG_QTY       INT             DEFAULT 0,          -- 총 포장수량
    PKG_TYPE_CD         VARCHAR(10),                        -- 포장유형 (CARTON/PALLET/DRUM 등)
    GROSS_WEIGHT_KG     DECIMAL(12,3)   DEFAULT 0,          -- 총중량 (kg)
    VOLUME_CBM          DECIMAL(12,4)   DEFAULT 0,          -- 총부피 (CBM)
    CHARGEABLE_WEIGHT   DECIMAL(12,3)   DEFAULT 0,          -- 청구중량

    -- 금액 정보
    DECLARED_VALUE_AMT  DECIMAL(18,2),                      -- 신고가액
    DECLARED_VALUE_CURR CHAR(3),                            -- 신고가액통화
    INSURANCE_AMT       DECIMAL(18,2),                      -- 보험금액
    INSURANCE_CURR      CHAR(3),                            -- 보험통화

    -- 결제 조건
    FREIGHT_TERM_CD     VARCHAR(10),                        -- 운임조건 (PREPAID/COLLECT)
    PAYMENT_TERM_CD     VARCHAR(10),                        -- 결제조건

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'DRAFT',    -- 상태
    CUSTOMS_STATUS_CD   VARCHAR(20),                        -- 통관상태

    -- 참조 정보
    CUSTOMER_REF_NO     VARCHAR(50),                        -- 화주참조번호
    PO_NO               VARCHAR(50),                        -- PO 번호
    SO_NO               VARCHAR(50),                        -- SO 번호

    REMARKS             VARCHAR(2000),                      -- 비고
    SPECIAL_INST        VARCHAR(2000),                      -- 특별지시사항

    SALES_MANAGER_ID    BIGINT,                             -- 담당영업
    OPS_MANAGER_ID      BIGINT,                             -- 담당운영

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (CUSTOMER_ID) REFERENCES MST_CUSTOMER(CUSTOMER_ID),
    FOREIGN KEY (CARRIER_ID) REFERENCES MST_CARRIER(CARRIER_ID),
    FOREIGN KEY (PARTNER_ID) REFERENCES MST_PARTNER(PARTNER_ID),
    FOREIGN KEY (ORIGIN_PORT_CD) REFERENCES MST_PORT(PORT_CD),
    FOREIGN KEY (DEST_PORT_CD) REFERENCES MST_PORT(PORT_CD)
);

COMMENT ON TABLE ORD_SHIPMENT IS '선적건 (Shipment)';

-- ----------------------------------------------------------------------------
-- 3.2 화주 오더 (Customer Order) - S/O, D/O
-- ----------------------------------------------------------------------------
CREATE TABLE ORD_CUSTOMER_ORDER (
    ORDER_ID            BIGINT          PRIMARY KEY AUTO_INCREMENT,
    ORDER_NO            VARCHAR(30)     UNIQUE NOT NULL,    -- 오더번호
    ORDER_TYPE_CD       VARCHAR(10)     NOT NULL,           -- 오더유형 (SO/DO/BR)

    -- 연결 정보
    SHIPMENT_ID         BIGINT,                             -- 선적건 (생성 후 연결)
    CUSTOMER_ID         BIGINT          NOT NULL,           -- 화주

    -- 업무 유형
    TRANSPORT_MODE_CD   VARCHAR(10)     NOT NULL,           -- 운송모드 (SEA/AIR)
    TRADE_TYPE_CD       VARCHAR(10)     NOT NULL,           -- 수출입구분
    SERVICE_TYPE_CD     VARCHAR(10),                        -- 서비스유형

    -- 발송/수하인 정보
    SHIPPER_NM          VARCHAR(200),                       -- 발송인명
    SHIPPER_ADDR        VARCHAR(500),                       -- 발송인주소
    CONSIGNEE_NM        VARCHAR(200),                       -- 수하인명
    CONSIGNEE_ADDR      VARCHAR(500),                       -- 수하인주소

    -- 출발/도착 정보
    ORIGIN_PORT_CD      VARCHAR(10),                        -- 출발항
    DEST_PORT_CD        VARCHAR(10),                        -- 도착항
    FINAL_DEST          VARCHAR(100),                       -- 최종목적지

    -- 화물 정보
    COMMODITY_DESC      VARCHAR(500),                       -- 품명
    HS_CODE             VARCHAR(12),                        -- HS코드
    TOTAL_PKG_QTY       INT,                                -- 총수량
    PKG_TYPE_CD         VARCHAR(10),                        -- 포장유형
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    VOLUME_CBM          DECIMAL(12,4),                      -- 총부피

    -- 일정
    CARGO_READY_DT      DATE,                               -- 화물준비일
    REQUESTED_ETD_DT    DATE,                               -- 희망출발일
    REQUESTED_ETA_DT    DATE,                               -- 희망도착일

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'RECEIVED', -- 상태
    RECEIPT_DTM         DATETIME,                           -- 접수일시
    CONFIRM_DTM         DATETIME,                           -- 확정일시

    -- 참조
    CUSTOMER_REF_NO     VARCHAR(50),                        -- 화주참조번호
    PO_NO               VARCHAR(50),                        -- PO번호
    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID),
    FOREIGN KEY (CUSTOMER_ID) REFERENCES MST_CUSTOMER(CUSTOMER_ID)
);

COMMENT ON TABLE ORD_CUSTOMER_ORDER IS '화주 오더';

-- 오더 화물 상세
CREATE TABLE ORD_CUSTOMER_ORDER_CARGO (
    ORDER_CARGO_ID      BIGINT          PRIMARY KEY AUTO_INCREMENT,
    ORDER_ID            BIGINT          NOT NULL,           -- 오더
    LINE_NO             INT             NOT NULL,           -- 라인번호
    COMMODITY_DESC      VARCHAR(500),                       -- 품명
    HS_CODE             VARCHAR(12),                        -- HS코드
    PKG_QTY             INT,                                -- 수량
    PKG_TYPE_CD         VARCHAR(10),                        -- 포장유형
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    NET_WEIGHT_KG       DECIMAL(12,3),                      -- 순중량
    VOLUME_CBM          DECIMAL(12,4),                      -- 부피
    UNIT_PRICE_AMT      DECIMAL(18,4),                      -- 단가
    TOTAL_AMT           DECIMAL(18,2),                      -- 금액
    CURRENCY_CD         CHAR(3),                            -- 통화
    COUNTRY_OF_ORIGIN   CHAR(2),                            -- 원산지
    MARKS_NOS           VARCHAR(500),                       -- 화인
    REMARKS             VARCHAR(500),                       -- 비고
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (ORDER_ID) REFERENCES ORD_CUSTOMER_ORDER(ORDER_ID)
);

COMMENT ON TABLE ORD_CUSTOMER_ORDER_CARGO IS '화주 오더 화물 상세';

-- ----------------------------------------------------------------------------
-- 3.3 해상 부킹 (Ocean Booking)
-- ----------------------------------------------------------------------------
CREATE TABLE ORD_OCEAN_BOOKING (
    BOOKING_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
    BOOKING_NO          VARCHAR(30)     UNIQUE NOT NULL,    -- 부킹번호 (자사)
    CARRIER_BOOKING_NO  VARCHAR(30),                        -- 선사부킹번호

    -- 연결 정보
    SHIPMENT_ID         BIGINT,                             -- 선적건
    ORDER_ID            BIGINT,                             -- 화주오더
    OCEAN_SCHEDULE_ID   BIGINT,                             -- 스케줄

    -- 선사 정보
    CARRIER_ID          BIGINT          NOT NULL,           -- 선사
    VESSEL_NM           VARCHAR(100),                       -- 선명
    VOYAGE_NO           VARCHAR(30),                        -- 항차

    -- 출발/도착 정보
    POL_PORT_CD         VARCHAR(10)     NOT NULL,           -- 선적항
    POD_PORT_CD         VARCHAR(10)     NOT NULL,           -- 양하항
    FINAL_DEST          VARCHAR(100),                       -- 최종목적지

    -- 일정
    ETD_DT              DATE,                               -- 출항예정일
    ETA_DT              DATE,                               -- 도착예정일
    CUT_OFF_DTM         DATETIME,                           -- 서류마감
    CARGO_CUT_OFF_DTM   DATETIME,                           -- 화물마감

    -- 컨테이너 요청
    CNTR_20GP_QTY       INT             DEFAULT 0,          -- 20GP 수량
    CNTR_40GP_QTY       INT             DEFAULT 0,          -- 40GP 수량
    CNTR_40HC_QTY       INT             DEFAULT 0,          -- 40HC 수량
    CNTR_45HC_QTY       INT             DEFAULT 0,          -- 45HC 수량
    CNTR_REEFER_QTY     INT             DEFAULT 0,          -- 냉동 수량
    CNTR_OT_QTY         INT             DEFAULT 0,          -- OT 수량
    CNTR_FR_QTY         INT             DEFAULT 0,          -- FR 수량
    TOTAL_CNTR_QTY      INT             DEFAULT 0,          -- 총 컨테이너 수

    -- 화물 정보
    COMMODITY_DESC      VARCHAR(500),                       -- 품명
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    VOLUME_CBM          DECIMAL(12,4),                      -- 총부피

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'REQUESTED', -- 상태 (REQUESTED/CONFIRMED/CANCELLED)
    REQUEST_DTM         DATETIME,                           -- 요청일시
    CONFIRM_DTM         DATETIME,                           -- 확정일시
    CANCEL_DTM          DATETIME,                           -- 취소일시
    CANCEL_REASON       VARCHAR(500),                       -- 취소사유

    -- 조건
    FREIGHT_TERM_CD     VARCHAR(10),                        -- 운임조건
    SPECIAL_CARGO_CD    VARCHAR(20),                        -- 특수화물유형 (DG/REEFER/OOG 등)
    SPECIAL_INST        VARCHAR(1000),                      -- 특별지시사항
    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID),
    FOREIGN KEY (CARRIER_ID) REFERENCES MST_CARRIER(CARRIER_ID),
    FOREIGN KEY (OCEAN_SCHEDULE_ID) REFERENCES SCH_OCEAN_SCHEDULE(OCEAN_SCHEDULE_ID)
);

COMMENT ON TABLE ORD_OCEAN_BOOKING IS '해상 부킹';

-- 부킹 컨테이너 상세
CREATE TABLE ORD_OCEAN_BOOKING_CNTR (
    BOOKING_CNTR_ID     BIGINT          PRIMARY KEY AUTO_INCREMENT,
    BOOKING_ID          BIGINT          NOT NULL,           -- 부킹
    LINE_NO             INT             NOT NULL,           -- 라인번호
    CNTR_TYPE_CD        VARCHAR(10)     NOT NULL,           -- 컨테이너유형
    CNTR_QTY            INT             NOT NULL,           -- 수량
    CNTR_SIZE_CD        VARCHAR(5),                         -- 사이즈 (20/40/45)
    IS_SOC              CHAR(1)         DEFAULT 'N',        -- 자가컨테이너여부
    SPECIAL_TYPE_CD     VARCHAR(20),                        -- 특수유형 (RF/OT/FR/TK)
    TEMPERATURE         DECIMAL(5,2),                       -- 온도 (냉동)
    HUMIDITY            DECIMAL(5,2),                       -- 습도
    VENTILATION         VARCHAR(20),                        -- 환기
    REMARKS             VARCHAR(500),                       -- 비고
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (BOOKING_ID) REFERENCES ORD_OCEAN_BOOKING(BOOKING_ID)
);

COMMENT ON TABLE ORD_OCEAN_BOOKING_CNTR IS '해상 부킹 컨테이너 상세';

-- ----------------------------------------------------------------------------
-- 3.4 항공 부킹 (Air Booking)
-- ----------------------------------------------------------------------------
CREATE TABLE ORD_AIR_BOOKING (
    BOOKING_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
    BOOKING_NO          VARCHAR(30)     UNIQUE NOT NULL,    -- 부킹번호
    CARRIER_BOOKING_NO  VARCHAR(30),                        -- 항공사부킹번호

    -- 연결 정보
    SHIPMENT_ID         BIGINT,                             -- 선적건
    ORDER_ID            BIGINT,                             -- 화주오더
    AIR_SCHEDULE_ID     BIGINT,                             -- 스케줄

    -- 항공사 정보
    CARRIER_ID          BIGINT          NOT NULL,           -- 항공사
    FLIGHT_NO           VARCHAR(10),                        -- 편명
    FLIGHT_DT           DATE,                               -- 운항일

    -- 출발/도착 정보
    ORIGIN_PORT_CD      VARCHAR(10)     NOT NULL,           -- 출발공항
    DEST_PORT_CD        VARCHAR(10)     NOT NULL,           -- 도착공항
    FINAL_DEST          VARCHAR(100),                       -- 최종목적지

    -- 일정
    ETD_DTM             DATETIME,                           -- 출발예정일시
    ETA_DTM             DATETIME,                           -- 도착예정일시

    -- 화물 정보
    COMMODITY_DESC      VARCHAR(500),                       -- 품명
    PKG_QTY             INT,                                -- 수량
    PKG_TYPE_CD         VARCHAR(10),                        -- 포장유형
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    VOLUME_WEIGHT_KG    DECIMAL(12,3),                      -- 용적중량
    CHARGEABLE_WEIGHT   DECIMAL(12,3),                      -- 청구중량
    VOLUME_CBM          DECIMAL(12,4),                      -- 부피
    DIMENSIONS          VARCHAR(100),                       -- 치수 (LxWxH)

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'REQUESTED', -- 상태
    REQUEST_DTM         DATETIME,                           -- 요청일시
    CONFIRM_DTM         DATETIME,                           -- 확정일시
    CANCEL_DTM          DATETIME,                           -- 취소일시
    CANCEL_REASON       VARCHAR(500),                       -- 취소사유

    -- 조건
    FREIGHT_TERM_CD     VARCHAR(10),                        -- 운임조건
    RATE_CLASS_CD       VARCHAR(10),                        -- 요율등급 (M/N/Q/C 등)
    SPECIAL_CARGO_CD    VARCHAR(20),                        -- 특수화물 (DG/PER/AVI 등)
    SPECIAL_INST        VARCHAR(1000),                      -- 특별지시사항
    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID),
    FOREIGN KEY (CARRIER_ID) REFERENCES MST_CARRIER(CARRIER_ID),
    FOREIGN KEY (AIR_SCHEDULE_ID) REFERENCES SCH_AIR_SCHEDULE(AIR_SCHEDULE_ID)
);

COMMENT ON TABLE ORD_AIR_BOOKING IS '항공 부킹';

-- ----------------------------------------------------------------------------
-- 3.5 Shipment 상태 이력 (Status History)
-- ----------------------------------------------------------------------------
CREATE TABLE ORD_SHIPMENT_STATUS_HIST (
    HIST_ID             BIGINT          PRIMARY KEY AUTO_INCREMENT,
    SHIPMENT_ID         BIGINT          NOT NULL,           -- 선적건
    STATUS_CD           VARCHAR(20)     NOT NULL,           -- 상태코드
    STATUS_NM           VARCHAR(100),                       -- 상태명
    EVENT_DTM           DATETIME        NOT NULL,           -- 이벤트일시
    LOCATION_CD         VARCHAR(10),                        -- 위치코드
    LOCATION_NM         VARCHAR(100),                       -- 위치명
    EVENT_DESC          VARCHAR(500),                       -- 이벤트설명
    SOURCE_CD           VARCHAR(20),                        -- 출처 (MANUAL/EDI/API)
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID)
);

COMMENT ON TABLE ORD_SHIPMENT_STATUS_HIST IS 'Shipment 상태 이력';

-- ----------------------------------------------------------------------------
-- 3.6 첨부파일 (Attachment)
-- ----------------------------------------------------------------------------
CREATE TABLE ORD_ATTACHMENT (
    ATTACHMENT_ID       BIGINT          PRIMARY KEY AUTO_INCREMENT,
    REF_TYPE_CD         VARCHAR(20)     NOT NULL,           -- 참조유형 (SHIPMENT/ORDER/BOOKING 등)
    REF_ID              BIGINT          NOT NULL,           -- 참조ID
    FILE_NM             VARCHAR(200)    NOT NULL,           -- 파일명
    FILE_PATH           VARCHAR(500)    NOT NULL,           -- 파일경로
    FILE_SIZE           BIGINT,                             -- 파일크기
    FILE_TYPE           VARCHAR(50),                        -- 파일유형 (MIME type)
    DOC_TYPE_CD         VARCHAR(20),                        -- 문서유형 (CI/PL/BL/AWB 등)
    DESCRIPTION         VARCHAR(500),                       -- 설명
    UPLOAD_DTM          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPLOAD_BY           VARCHAR(50),
    DEL_YN              CHAR(1)         DEFAULT 'N'
);

COMMENT ON TABLE ORD_ATTACHMENT IS '첨부파일';

-- ----------------------------------------------------------------------------
-- 인덱스 생성
-- ----------------------------------------------------------------------------
CREATE INDEX IDX_ORD_SHIPMENT_CUSTOMER ON ORD_SHIPMENT(CUSTOMER_ID);
CREATE INDEX IDX_ORD_SHIPMENT_CARRIER ON ORD_SHIPMENT(CARRIER_ID);
CREATE INDEX IDX_ORD_SHIPMENT_ETD ON ORD_SHIPMENT(ETD_DT);
CREATE INDEX IDX_ORD_SHIPMENT_STATUS ON ORD_SHIPMENT(STATUS_CD);
CREATE INDEX IDX_ORD_ORDER_CUSTOMER ON ORD_CUSTOMER_ORDER(CUSTOMER_ID);
CREATE INDEX IDX_ORD_OCEAN_BKG_CARRIER ON ORD_OCEAN_BOOKING(CARRIER_ID);
CREATE INDEX IDX_ORD_OCEAN_BKG_SHIPMENT ON ORD_OCEAN_BOOKING(SHIPMENT_ID);
CREATE INDEX IDX_ORD_AIR_BKG_CARRIER ON ORD_AIR_BOOKING(CARRIER_ID);
CREATE INDEX IDX_ORD_AIR_BKG_SHIPMENT ON ORD_AIR_BOOKING(SHIPMENT_ID);
CREATE INDEX IDX_ORD_ATTACHMENT_REF ON ORD_ATTACHMENT(REF_TYPE_CD, REF_ID);
