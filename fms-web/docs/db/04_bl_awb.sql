-- ============================================================================
-- FMS Database Schema - 04. B/L & AWB (선하증권/항공운송장)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 Master B/L (해상 - 선사 발행)
-- ----------------------------------------------------------------------------
CREATE TABLE BL_MASTER_BL (
    MBL_ID              BIGINT          PRIMARY KEY AUTO_INCREMENT,
    MBL_NO              VARCHAR(30)     UNIQUE NOT NULL,    -- MBL 번호

    -- 연결 정보
    SHIPMENT_ID         BIGINT,                             -- 선적건
    BOOKING_ID          BIGINT,                             -- 부킹
    CARRIER_ID          BIGINT          NOT NULL,           -- 선사

    -- 운항 정보
    VESSEL_NM           VARCHAR(100),                       -- 선명
    VOYAGE_NO           VARCHAR(30),                        -- 항차
    OCEAN_SCHEDULE_ID   BIGINT,                             -- 스케줄

    -- 출발/도착 정보
    POL_PORT_CD         VARCHAR(10)     NOT NULL,           -- 선적항
    POD_PORT_CD         VARCHAR(10)     NOT NULL,           -- 양하항
    PLACE_OF_RECEIPT    VARCHAR(100),                       -- 수령지
    PLACE_OF_DELIVERY   VARCHAR(100),                       -- 인도지
    FINAL_DEST          VARCHAR(100),                       -- 최종목적지

    -- 일정
    ETD_DT              DATE,                               -- 출항예정일
    ATD_DT              DATE,                               -- 실제출항일
    ETA_DT              DATE,                               -- 도착예정일
    ATA_DT              DATE,                               -- 실제도착일
    ON_BOARD_DT         DATE,                               -- 선적완료일
    ISSUE_DT            DATE,                               -- 발행일
    ISSUE_PLACE         VARCHAR(100),                       -- 발행지

    -- 발송인/수하인
    SHIPPER_NM          VARCHAR(200),                       -- 발송인명
    SHIPPER_ADDR        VARCHAR(500),                       -- 발송인주소
    CONSIGNEE_NM        VARCHAR(200),                       -- 수하인명
    CONSIGNEE_ADDR      VARCHAR(500),                       -- 수하인주소
    NOTIFY_PARTY        VARCHAR(500),                       -- 통지처

    -- 화물 정보 요약
    TOTAL_PKG_QTY       INT,                                -- 총수량
    PKG_TYPE_CD         VARCHAR(10),                        -- 포장유형
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    VOLUME_CBM          DECIMAL(12,4),                      -- 총부피
    COMMODITY_DESC      VARCHAR(1000),                      -- 품명
    MARKS_NOS           VARCHAR(1000),                      -- 화인

    -- 컨테이너 요약
    CNTR_COUNT          INT             DEFAULT 0,          -- 컨테이너수

    -- 운임 조건
    FREIGHT_TERM_CD     VARCHAR(10),                        -- 운임조건 (PREPAID/COLLECT)
    FREIGHT_PAYABLE_AT  VARCHAR(100),                       -- 운임지급지
    FREIGHT_AMT         DECIMAL(18,2),                      -- 운임금액
    FREIGHT_CURR        CHAR(3),                            -- 운임통화

    -- B/L 정보
    BL_TYPE_CD          VARCHAR(10),                        -- B/L유형 (ORIGINAL/SURRENDER/SWB)
    ORIGINAL_BL_COUNT   INT             DEFAULT 3,          -- 원본 발행부수
    MOVEMENT_TYPE_CD    VARCHAR(10),                        -- 운송유형 (CY-CY/CFS-CFS 등)

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'DRAFT',    -- 상태
    SURRENDER_YN        CHAR(1)         DEFAULT 'N',        -- Surrender 여부
    SURRENDER_DTM       DATETIME,                           -- Surrender 일시
    RELEASE_STATUS_CD   VARCHAR(20),                        -- 반출상태

    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID),
    FOREIGN KEY (BOOKING_ID) REFERENCES ORD_OCEAN_BOOKING(BOOKING_ID),
    FOREIGN KEY (CARRIER_ID) REFERENCES MST_CARRIER(CARRIER_ID)
);

COMMENT ON TABLE BL_MASTER_BL IS 'Master B/L (해상)';

-- ----------------------------------------------------------------------------
-- 4.2 House B/L (해상 - 포워더 발행)
-- ----------------------------------------------------------------------------
CREATE TABLE BL_HOUSE_BL (
    HBL_ID              BIGINT          PRIMARY KEY AUTO_INCREMENT,
    HBL_NO              VARCHAR(30)     UNIQUE NOT NULL,    -- HBL 번호

    -- 연결 정보
    SHIPMENT_ID         BIGINT          NOT NULL,           -- 선적건
    MBL_ID              BIGINT,                             -- MBL (Consolidation)
    CUSTOMER_ID         BIGINT          NOT NULL,           -- 화주

    -- 운항 정보
    CARRIER_ID          BIGINT,                             -- 선사
    VESSEL_NM           VARCHAR(100),                       -- 선명
    VOYAGE_NO           VARCHAR(30),                        -- 항차

    -- 출발/도착 정보
    POL_PORT_CD         VARCHAR(10)     NOT NULL,           -- 선적항
    POD_PORT_CD         VARCHAR(10)     NOT NULL,           -- 양하항
    PLACE_OF_RECEIPT    VARCHAR(100),                       -- 수령지
    PLACE_OF_DELIVERY   VARCHAR(100),                       -- 인도지
    FINAL_DEST          VARCHAR(100),                       -- 최종목적지

    -- 일정
    ETD_DT              DATE,                               -- 출항예정일
    ATD_DT              DATE,                               -- 실제출항일
    ETA_DT              DATE,                               -- 도착예정일
    ATA_DT              DATE,                               -- 실제도착일
    ON_BOARD_DT         DATE,                               -- 선적완료일
    ISSUE_DT            DATE,                               -- 발행일
    ISSUE_PLACE         VARCHAR(100),                       -- 발행지

    -- 발송인/수하인
    SHIPPER_ID          BIGINT,                             -- 발송인
    SHIPPER_NM          VARCHAR(200),                       -- 발송인명
    SHIPPER_ADDR        VARCHAR(500),                       -- 발송인주소
    SHIPPER_TEL         VARCHAR(50),                        -- 발송인전화
    CONSIGNEE_ID        BIGINT,                             -- 수하인
    CONSIGNEE_NM        VARCHAR(200),                       -- 수하인명
    CONSIGNEE_ADDR      VARCHAR(500),                       -- 수하인주소
    CONSIGNEE_TEL       VARCHAR(50),                        -- 수하인전화
    NOTIFY_PARTY        VARCHAR(500),                       -- 통지처
    ALSO_NOTIFY         VARCHAR(500),                       -- 추가통지처

    -- 화물 정보
    TOTAL_PKG_QTY       INT,                                -- 총수량
    PKG_TYPE_CD         VARCHAR(10),                        -- 포장유형
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    NET_WEIGHT_KG       DECIMAL(12,3),                      -- 순중량
    VOLUME_CBM          DECIMAL(12,4),                      -- 총부피
    COMMODITY_DESC      VARCHAR(2000),                      -- 품명
    HS_CODE             VARCHAR(12),                        -- HS코드
    MARKS_NOS           VARCHAR(2000),                      -- 화인

    -- 운임 조건
    FREIGHT_TERM_CD     VARCHAR(10),                        -- 운임조건
    FREIGHT_PAYABLE_AT  VARCHAR(100),                       -- 운임지급지
    DECLARED_VALUE      DECIMAL(18,2),                      -- 신고가액
    DECLARED_VALUE_CURR CHAR(3),                            -- 신고가액통화

    -- B/L 정보
    BL_TYPE_CD          VARCHAR(10),                        -- B/L유형
    ORIGINAL_BL_COUNT   INT             DEFAULT 3,          -- 원본 발행부수
    MOVEMENT_TYPE_CD    VARCHAR(10),                        -- 운송유형
    SERVICE_TYPE_CD     VARCHAR(10),                        -- 서비스유형 (FCL/LCL)

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'DRAFT',    -- 상태
    PRINT_YN            CHAR(1)         DEFAULT 'N',        -- 출력여부
    PRINT_DTM           DATETIME,                           -- 출력일시
    SURRENDER_YN        CHAR(1)         DEFAULT 'N',        -- Surrender 여부
    SURRENDER_DTM       DATETIME,                           -- Surrender 일시

    -- 해외파트너
    OVERSEAS_PARTNER_ID BIGINT,                             -- 해외파트너
    PARTNER_REF_NO      VARCHAR(50),                        -- 파트너참조번호

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
    FOREIGN KEY (MBL_ID) REFERENCES BL_MASTER_BL(MBL_ID),
    FOREIGN KEY (CUSTOMER_ID) REFERENCES MST_CUSTOMER(CUSTOMER_ID)
);

COMMENT ON TABLE BL_HOUSE_BL IS 'House B/L (해상)';

-- HBL 화물 상세
CREATE TABLE BL_HOUSE_BL_CARGO (
    HBL_CARGO_ID        BIGINT          PRIMARY KEY AUTO_INCREMENT,
    HBL_ID              BIGINT          NOT NULL,           -- HBL
    LINE_NO             INT             NOT NULL,           -- 라인번호
    COMMODITY_DESC      VARCHAR(500),                       -- 품명
    HS_CODE             VARCHAR(12),                        -- HS코드
    PKG_QTY             INT,                                -- 수량
    PKG_TYPE_CD         VARCHAR(10),                        -- 포장유형
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    NET_WEIGHT_KG       DECIMAL(12,3),                      -- 순중량
    VOLUME_CBM          DECIMAL(12,4),                      -- 부피
    MARKS_NOS           VARCHAR(500),                       -- 화인
    COUNTRY_OF_ORIGIN   CHAR(2),                            -- 원산지
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (HBL_ID) REFERENCES BL_HOUSE_BL(HBL_ID)
);

COMMENT ON TABLE BL_HOUSE_BL_CARGO IS 'House B/L 화물 상세';

-- ----------------------------------------------------------------------------
-- 4.3 컨테이너 (Container)
-- ----------------------------------------------------------------------------
CREATE TABLE BL_CONTAINER (
    CONTAINER_ID        BIGINT          PRIMARY KEY AUTO_INCREMENT,
    CNTR_NO             VARCHAR(15)     NOT NULL,           -- 컨테이너번호

    -- 연결 정보 (MBL 또는 HBL에 연결)
    MBL_ID              BIGINT,                             -- MBL
    HBL_ID              BIGINT,                             -- HBL
    BOOKING_ID          BIGINT,                             -- 부킹

    -- 컨테이너 정보
    CNTR_TYPE_CD        VARCHAR(10)     NOT NULL,           -- 유형 (20GP/40GP/40HC 등)
    CNTR_SIZE_CD        VARCHAR(5),                         -- 사이즈 (20/40/45)
    ISO_CODE            VARCHAR(10),                        -- ISO 코드
    SEAL_NO             VARCHAR(30),                        -- 봉인번호
    SEAL_NO2            VARCHAR(30),                        -- 추가봉인번호

    -- 중량/용적
    TARE_WEIGHT_KG      DECIMAL(10,2),                      -- 공컨테이너중량
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    NET_WEIGHT_KG       DECIMAL(12,3),                      -- 순중량
    VGM_WEIGHT_KG       DECIMAL(12,3),                      -- VGM 중량
    VOLUME_CBM          DECIMAL(12,4),                      -- 부피

    -- 화물 정보
    PKG_QTY             INT,                                -- 포장수량
    PKG_TYPE_CD         VARCHAR(10),                        -- 포장유형
    COMMODITY_DESC      VARCHAR(500),                       -- 품명

    -- 특수 컨테이너
    IS_SOC              CHAR(1)         DEFAULT 'N',        -- 자가컨테이너여부
    SPECIAL_TYPE_CD     VARCHAR(20),                        -- 특수유형 (RF/OT/FR/TK)
    TEMPERATURE         DECIMAL(5,2),                       -- 온도설정 (냉동)
    TEMPERATURE_UNIT    CHAR(1)         DEFAULT 'C',        -- 온도단위 (C/F)
    HUMIDITY            DECIMAL(5,2),                       -- 습도
    VENTILATION         VARCHAR(20),                        -- 환기설정

    -- 치수 (OOG - Over Size)
    OVER_LENGTH_CM      DECIMAL(8,2),                       -- Over Length
    OVER_WIDTH_CM       DECIMAL(8,2),                       -- Over Width
    OVER_HEIGHT_CM      DECIMAL(8,2),                       -- Over Height

    -- 위험물
    DG_YN               CHAR(1)         DEFAULT 'N',        -- 위험물여부
    UN_NO               VARCHAR(10),                        -- UN번호
    IMO_CLASS           VARCHAR(10),                        -- IMO 등급
    DG_PROPER_NM        VARCHAR(200),                       -- 위험물명칭

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'BOOKED',   -- 상태
    PICKUP_DTM          DATETIME,                           -- 픽업일시
    GATE_IN_DTM         DATETIME,                           -- Gate In 일시
    LOADING_DTM         DATETIME,                           -- 선적일시
    DISCHARGE_DTM       DATETIME,                           -- 양하일시
    GATE_OUT_DTM        DATETIME,                           -- Gate Out 일시
    RETURN_DTM          DATETIME,                           -- 반납일시

    REMARKS             VARCHAR(500),                       -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (MBL_ID) REFERENCES BL_MASTER_BL(MBL_ID),
    FOREIGN KEY (HBL_ID) REFERENCES BL_HOUSE_BL(HBL_ID)
);

COMMENT ON TABLE BL_CONTAINER IS '컨테이너';

-- ----------------------------------------------------------------------------
-- 4.4 Master AWB (항공 - 항공사 발행)
-- ----------------------------------------------------------------------------
CREATE TABLE BL_MASTER_AWB (
    MAWB_ID             BIGINT          PRIMARY KEY AUTO_INCREMENT,
    MAWB_NO             VARCHAR(15)     UNIQUE NOT NULL,    -- MAWB 번호 (Prefix + Serial)

    -- 연결 정보
    SHIPMENT_ID         BIGINT,                             -- 선적건
    BOOKING_ID          BIGINT,                             -- 부킹
    CARRIER_ID          BIGINT          NOT NULL,           -- 항공사

    -- 운항 정보
    FLIGHT_NO           VARCHAR(10),                        -- 편명
    FLIGHT_DT           DATE,                               -- 운항일
    AIR_SCHEDULE_ID     BIGINT,                             -- 스케줄

    -- 출발/도착 정보
    ORIGIN_PORT_CD      VARCHAR(10)     NOT NULL,           -- 출발공항
    DEST_PORT_CD        VARCHAR(10)     NOT NULL,           -- 도착공항
    FIRST_CARRIER       VARCHAR(100),                       -- 최초운송인

    -- 환적 정보
    ROUTING_1           VARCHAR(50),                        -- 환적1 (TO/BY)
    ROUTING_2           VARCHAR(50),                        -- 환적2
    ROUTING_3           VARCHAR(50),                        -- 환적3

    -- 일정
    ETD_DTM             DATETIME,                           -- 출발예정일시
    ATD_DTM             DATETIME,                           -- 실제출발일시
    ETA_DTM             DATETIME,                           -- 도착예정일시
    ATA_DTM             DATETIME,                           -- 실제도착일시
    ISSUE_DT            DATE,                               -- 발행일
    ISSUE_PLACE         VARCHAR(100),                       -- 발행지

    -- 발송인/수하인
    SHIPPER_NM          VARCHAR(200),                       -- 발송인명
    SHIPPER_ADDR        VARCHAR(500),                       -- 발송인주소
    SHIPPER_ACCOUNT     VARCHAR(50),                        -- 발송인계정
    CONSIGNEE_NM        VARCHAR(200),                       -- 수하인명
    CONSIGNEE_ADDR      VARCHAR(500),                       -- 수하인주소
    CONSIGNEE_ACCOUNT   VARCHAR(50),                        -- 수하인계정
    AGENT_NAME          VARCHAR(200),                       -- 대리점명
    AGENT_IATA_CODE     VARCHAR(10),                        -- 대리점IATA코드
    AGENT_ACCOUNT       VARCHAR(50),                        -- 대리점계정

    -- 화물 정보
    TOTAL_PKG_QTY       INT,                                -- 총수량
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    CHARGEABLE_WEIGHT   DECIMAL(12,3),                      -- 청구중량
    VOLUME_CBM          DECIMAL(12,4),                      -- 부피
    COMMODITY_DESC      VARCHAR(1000),                      -- 품명
    DIMENSIONS          VARCHAR(200),                       -- 치수

    -- 운임 정보
    RATE_CLASS_CD       VARCHAR(5),                         -- 요율등급
    COMMODITY_ITEM_NO   VARCHAR(10),                        -- 품목번호
    RATE_CHARGE         DECIMAL(18,4),                      -- 요율
    TOTAL_CHARGE        DECIMAL(18,2),                      -- 총운임
    CURRENCY_CD         CHAR(3),                            -- 통화

    -- 결제 조건
    WEIGHT_CHARGE_PP    DECIMAL(18,2),                      -- 중량운임(Prepaid)
    WEIGHT_CHARGE_CC    DECIMAL(18,2),                      -- 중량운임(Collect)
    VALUATION_CHARGE_PP DECIMAL(18,2),                      -- 종가운임(Prepaid)
    VALUATION_CHARGE_CC DECIMAL(18,2),                      -- 종가운임(Collect)
    OTHER_CHARGES_PP    DECIMAL(18,2),                      -- 기타운임(Prepaid)
    OTHER_CHARGES_CC    DECIMAL(18,2),                      -- 기타운임(Collect)
    TOTAL_PP            DECIMAL(18,2),                      -- 합계(Prepaid)
    TOTAL_CC            DECIMAL(18,2),                      -- 합계(Collect)

    -- 신고가액/보험
    DECLARED_VALUE_CARRIAGE  DECIMAL(18,2),                 -- 운송신고가액
    DECLARED_VALUE_CUSTOMS   DECIMAL(18,2),                 -- 세관신고가액
    INSURANCE_AMT       DECIMAL(18,2),                      -- 보험금액

    -- 특수화물
    SPECIAL_CARGO_CD    VARCHAR(20),                        -- 특수화물코드
    HANDLING_INFO       VARCHAR(500),                       -- 취급정보
    SCI_CD              VARCHAR(10),                        -- 보안정보 (Security)

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'DRAFT',    -- 상태
    EXECUTED_DT         DATE,                               -- 실행일

    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID),
    FOREIGN KEY (BOOKING_ID) REFERENCES ORD_AIR_BOOKING(BOOKING_ID),
    FOREIGN KEY (CARRIER_ID) REFERENCES MST_CARRIER(CARRIER_ID)
);

COMMENT ON TABLE BL_MASTER_AWB IS 'Master AWB (항공)';

-- ----------------------------------------------------------------------------
-- 4.5 House AWB (항공 - 포워더 발행)
-- ----------------------------------------------------------------------------
CREATE TABLE BL_HOUSE_AWB (
    HAWB_ID             BIGINT          PRIMARY KEY AUTO_INCREMENT,
    HAWB_NO             VARCHAR(30)     UNIQUE NOT NULL,    -- HAWB 번호

    -- 연결 정보
    SHIPMENT_ID         BIGINT          NOT NULL,           -- 선적건
    MAWB_ID             BIGINT,                             -- MAWB (Consolidation)
    CUSTOMER_ID         BIGINT          NOT NULL,           -- 화주

    -- 운항 정보
    CARRIER_ID          BIGINT,                             -- 항공사
    FLIGHT_NO           VARCHAR(10),                        -- 편명
    FLIGHT_DT           DATE,                               -- 운항일

    -- 출발/도착 정보
    ORIGIN_PORT_CD      VARCHAR(10)     NOT NULL,           -- 출발공항
    DEST_PORT_CD        VARCHAR(10)     NOT NULL,           -- 도착공항
    FINAL_DEST          VARCHAR(100),                       -- 최종목적지

    -- 일정
    ETD_DTM             DATETIME,                           -- 출발예정일시
    ATD_DTM             DATETIME,                           -- 실제출발일시
    ETA_DTM             DATETIME,                           -- 도착예정일시
    ATA_DTM             DATETIME,                           -- 실제도착일시
    ISSUE_DT            DATE,                               -- 발행일
    ISSUE_PLACE         VARCHAR(100),                       -- 발행지

    -- 발송인/수하인
    SHIPPER_ID          BIGINT,                             -- 발송인
    SHIPPER_NM          VARCHAR(200),                       -- 발송인명
    SHIPPER_ADDR        VARCHAR(500),                       -- 발송인주소
    SHIPPER_TEL         VARCHAR(50),                        -- 발송인전화
    CONSIGNEE_ID        BIGINT,                             -- 수하인
    CONSIGNEE_NM        VARCHAR(200),                       -- 수하인명
    CONSIGNEE_ADDR      VARCHAR(500),                       -- 수하인주소
    CONSIGNEE_TEL       VARCHAR(50),                        -- 수하인전화
    NOTIFY_PARTY        VARCHAR(500),                       -- 통지처

    -- 화물 정보
    TOTAL_PKG_QTY       INT,                                -- 총수량
    PKG_TYPE_CD         VARCHAR(10),                        -- 포장유형
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    VOLUME_WEIGHT_KG    DECIMAL(12,3),                      -- 용적중량
    CHARGEABLE_WEIGHT   DECIMAL(12,3),                      -- 청구중량
    VOLUME_CBM          DECIMAL(12,4),                      -- 부피
    DIMENSIONS          VARCHAR(200),                       -- 치수
    COMMODITY_DESC      VARCHAR(2000),                      -- 품명
    HS_CODE             VARCHAR(12),                        -- HS코드

    -- 운임 정보
    RATE_CLASS_CD       VARCHAR(5),                         -- 요율등급
    RATE_CHARGE         DECIMAL(18,4),                      -- 요율
    FREIGHT_TERM_CD     VARCHAR(10),                        -- 운임조건
    DECLARED_VALUE      DECIMAL(18,2),                      -- 신고가액
    DECLARED_VALUE_CURR CHAR(3),                            -- 신고가액통화

    -- 특수화물
    SPECIAL_CARGO_CD    VARCHAR(20),                        -- 특수화물코드
    HANDLING_INFO       VARCHAR(500),                       -- 취급정보

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'DRAFT',    -- 상태
    PRINT_YN            CHAR(1)         DEFAULT 'N',        -- 출력여부
    PRINT_DTM           DATETIME,                           -- 출력일시

    -- 해외파트너
    OVERSEAS_PARTNER_ID BIGINT,                             -- 해외파트너
    PARTNER_REF_NO      VARCHAR(50),                        -- 파트너참조번호

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
    FOREIGN KEY (MAWB_ID) REFERENCES BL_MASTER_AWB(MAWB_ID),
    FOREIGN KEY (CUSTOMER_ID) REFERENCES MST_CUSTOMER(CUSTOMER_ID)
);

COMMENT ON TABLE BL_HOUSE_AWB IS 'House AWB (항공)';

-- HAWB 화물 상세
CREATE TABLE BL_HOUSE_AWB_CARGO (
    HAWB_CARGO_ID       BIGINT          PRIMARY KEY AUTO_INCREMENT,
    HAWB_ID             BIGINT          NOT NULL,           -- HAWB
    LINE_NO             INT             NOT NULL,           -- 라인번호
    COMMODITY_DESC      VARCHAR(500),                       -- 품명
    HS_CODE             VARCHAR(12),                        -- HS코드
    PKG_QTY             INT,                                -- 수량
    PKG_TYPE_CD         VARCHAR(10),                        -- 포장유형
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    NET_WEIGHT_KG       DECIMAL(12,3),                      -- 순중량
    VOLUME_CBM          DECIMAL(12,4),                      -- 부피
    LENGTH_CM           DECIMAL(8,2),                       -- 길이
    WIDTH_CM            DECIMAL(8,2),                       -- 너비
    HEIGHT_CM           DECIMAL(8,2),                       -- 높이
    COUNTRY_OF_ORIGIN   CHAR(2),                            -- 원산지
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (HAWB_ID) REFERENCES BL_HOUSE_AWB(HAWB_ID)
);

COMMENT ON TABLE BL_HOUSE_AWB_CARGO IS 'House AWB 화물 상세';

-- ----------------------------------------------------------------------------
-- 4.6 IRRE (Irregularity - 사고/예외)
-- ----------------------------------------------------------------------------
CREATE TABLE BL_IRRE (
    IRRE_ID             BIGINT          PRIMARY KEY AUTO_INCREMENT,
    IRRE_NO             VARCHAR(30)     UNIQUE NOT NULL,    -- IRRE 번호

    -- 연결 정보
    SHIPMENT_ID         BIGINT,                             -- 선적건
    MAWB_ID             BIGINT,                             -- MAWB
    HAWB_ID             BIGINT,                             -- HAWB
    MBL_ID              BIGINT,                             -- MBL
    HBL_ID              BIGINT,                             -- HBL

    -- IRRE 정보
    IRRE_TYPE_CD        VARCHAR(20)     NOT NULL,           -- IRRE유형 (DAMAGE/SHORTAGE/OVERAGE/DELAY 등)
    IRRE_DT             DATE            NOT NULL,           -- 발생일
    STATION_CD          VARCHAR(10),                        -- 발생지역
    FLIGHT_NO           VARCHAR(10),                        -- 편명

    -- 상세 정보
    REPORTED_PKG_QTY    INT,                                -- 신고수량
    ACTUAL_PKG_QTY      INT,                                -- 실제수량
    DIFF_PKG_QTY        INT,                                -- 차이수량
    REPORTED_WEIGHT_KG  DECIMAL(12,3),                      -- 신고중량
    ACTUAL_WEIGHT_KG    DECIMAL(12,3),                      -- 실제중량
    DIFF_WEIGHT_KG      DECIMAL(12,3),                      -- 차이중량

    -- 처리 정보
    DESCRIPTION         VARCHAR(2000),                      -- 상세설명
    ACTION_TAKEN        VARCHAR(2000),                      -- 조치사항
    CLAIM_AMT           DECIMAL(18,2),                      -- 클레임금액
    CLAIM_CURR          CHAR(3),                            -- 클레임통화

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'OPEN',     -- 상태 (OPEN/IN_PROGRESS/CLOSED)
    CLOSED_DT           DATE,                               -- 종결일
    CLOSED_REASON       VARCHAR(500),                       -- 종결사유

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N'
);

COMMENT ON TABLE BL_IRRE IS 'IRRE (Irregularity/사고)';

-- ----------------------------------------------------------------------------
-- 인덱스 생성
-- ----------------------------------------------------------------------------
CREATE INDEX IDX_BL_MBL_SHIPMENT ON BL_MASTER_BL(SHIPMENT_ID);
CREATE INDEX IDX_BL_MBL_CARRIER ON BL_MASTER_BL(CARRIER_ID);
CREATE INDEX IDX_BL_HBL_SHIPMENT ON BL_HOUSE_BL(SHIPMENT_ID);
CREATE INDEX IDX_BL_HBL_MBL ON BL_HOUSE_BL(MBL_ID);
CREATE INDEX IDX_BL_HBL_CUSTOMER ON BL_HOUSE_BL(CUSTOMER_ID);
CREATE INDEX IDX_BL_CNTR_MBL ON BL_CONTAINER(MBL_ID);
CREATE INDEX IDX_BL_CNTR_HBL ON BL_CONTAINER(HBL_ID);
CREATE INDEX IDX_BL_MAWB_SHIPMENT ON BL_MASTER_AWB(SHIPMENT_ID);
CREATE INDEX IDX_BL_MAWB_CARRIER ON BL_MASTER_AWB(CARRIER_ID);
CREATE INDEX IDX_BL_HAWB_SHIPMENT ON BL_HOUSE_AWB(SHIPMENT_ID);
CREATE INDEX IDX_BL_HAWB_MAWB ON BL_HOUSE_AWB(MAWB_ID);
CREATE INDEX IDX_BL_HAWB_CUSTOMER ON BL_HOUSE_AWB(CUSTOMER_ID);
