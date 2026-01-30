-- ============================================================================
-- FMS Database Schema - 05. Shipment (선적/도착 관리)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 Shipping Request (S/R - 선적요청)
-- ----------------------------------------------------------------------------
CREATE TABLE SHP_SHIPPING_REQUEST (
    SR_ID               BIGINT          PRIMARY KEY AUTO_INCREMENT,
    SR_NO               VARCHAR(30)     UNIQUE NOT NULL,    -- S/R 번호

    -- 연결 정보
    SHIPMENT_ID         BIGINT          NOT NULL,           -- 선적건
    BOOKING_ID          BIGINT,                             -- 부킹
    HBL_ID              BIGINT,                             -- HBL
    HAWB_ID             BIGINT,                             -- HAWB
    CUSTOMER_ID         BIGINT          NOT NULL,           -- 화주

    -- 업무 유형
    TRANSPORT_MODE_CD   VARCHAR(10)     NOT NULL,           -- 운송모드 (SEA/AIR)
    TRADE_TYPE_CD       VARCHAR(10)     NOT NULL,           -- 수출입구분

    -- 발송인/수하인
    SHIPPER_NM          VARCHAR(200),                       -- 발송인명
    SHIPPER_ADDR        VARCHAR(500),                       -- 발송인주소
    CONSIGNEE_NM        VARCHAR(200),                       -- 수하인명
    CONSIGNEE_ADDR      VARCHAR(500),                       -- 수하인주소
    NOTIFY_PARTY        VARCHAR(500),                       -- 통지처

    -- 출발/도착 정보
    ORIGIN_PORT_CD      VARCHAR(10),                        -- 출발항
    DEST_PORT_CD        VARCHAR(10),                        -- 도착항

    -- 화물 정보
    COMMODITY_DESC      VARCHAR(1000),                      -- 품명
    HS_CODE             VARCHAR(12),                        -- HS코드
    PKG_QTY             INT,                                -- 수량
    PKG_TYPE_CD         VARCHAR(10),                        -- 포장유형
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    VOLUME_CBM          DECIMAL(12,4),                      -- 부피
    MARKS_NOS           VARCHAR(1000),                      -- 화인

    -- 일정
    REQUESTED_ETD_DT    DATE,                               -- 희망출발일
    CARGO_READY_DT      DATE,                               -- 화물준비일

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'RECEIVED', -- 상태
    RECEIPT_DTM         DATETIME,                           -- 접수일시
    CONFIRM_DTM         DATETIME,                           -- 확정일시

    -- 첨부서류
    CI_ATTACHED_YN      CHAR(1)         DEFAULT 'N',        -- C/I 첨부여부
    PL_ATTACHED_YN      CHAR(1)         DEFAULT 'N',        -- P/L 첨부여부

    SPECIAL_INST        VARCHAR(1000),                      -- 특별지시사항
    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID),
    FOREIGN KEY (CUSTOMER_ID) REFERENCES MST_CUSTOMER(CUSTOMER_ID)
);

COMMENT ON TABLE SHP_SHIPPING_REQUEST IS '선적요청 (S/R)';

-- ----------------------------------------------------------------------------
-- 5.2 Shipping Notice (S/N - 선적통지)
-- ----------------------------------------------------------------------------
CREATE TABLE SHP_SHIPPING_NOTICE (
    SN_ID               BIGINT          PRIMARY KEY AUTO_INCREMENT,
    SN_NO               VARCHAR(30)     UNIQUE NOT NULL,    -- S/N 번호

    -- 연결 정보
    SHIPMENT_ID         BIGINT          NOT NULL,           -- 선적건
    MBL_ID              BIGINT,                             -- MBL
    HBL_ID              BIGINT,                             -- HBL
    MAWB_ID             BIGINT,                             -- MAWB
    HAWB_ID             BIGINT,                             -- HAWB

    -- 수신/발신
    SENDER_NM           VARCHAR(200),                       -- 발신자
    RECIPIENT_NM        VARCHAR(200),                       -- 수신자
    RECIPIENT_EMAIL     VARCHAR(100),                       -- 수신이메일

    -- 선적 정보
    TRANSPORT_MODE_CD   VARCHAR(10),                        -- 운송모드
    CARRIER_NM          VARCHAR(100),                       -- 운송사명
    VESSEL_FLIGHT       VARCHAR(100),                       -- 선명/편명
    VOYAGE_NO           VARCHAR(30),                        -- 항차

    -- 출발/도착
    ORIGIN_PORT_CD      VARCHAR(10),                        -- 출발항
    DEST_PORT_CD        VARCHAR(10),                        -- 도착항
    ETD_DT              DATE,                               -- 출발예정일
    ETA_DT              DATE,                               -- 도착예정일

    -- 화물 정보
    COMMODITY_DESC      VARCHAR(1000),                      -- 품명
    PKG_QTY             INT,                                -- 수량
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    VOLUME_CBM          DECIMAL(12,4),                      -- 부피

    -- 첨부서류 목록
    ATTACHED_DOCS       VARCHAR(500),                       -- 첨부서류 (BL,CI,PL 등)

    -- 발송 정보
    SEND_DTM            DATETIME,                           -- 발송일시
    SEND_METHOD_CD      VARCHAR(10),                        -- 발송방식 (EMAIL/EDI/FAX)
    SEND_STATUS_CD      VARCHAR(20),                        -- 발송상태

    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID)
);

COMMENT ON TABLE SHP_SHIPPING_NOTICE IS '선적통지 (S/N)';

-- ----------------------------------------------------------------------------
-- 5.3 Arrival Notice (A/N - 도착통지)
-- ----------------------------------------------------------------------------
CREATE TABLE SHP_ARRIVAL_NOTICE (
    AN_ID               BIGINT          PRIMARY KEY AUTO_INCREMENT,
    AN_NO               VARCHAR(30)     UNIQUE NOT NULL,    -- A/N 번호

    -- 연결 정보
    SHIPMENT_ID         BIGINT          NOT NULL,           -- 선적건
    MBL_ID              BIGINT,                             -- MBL
    HBL_ID              BIGINT,                             -- HBL
    MAWB_ID             BIGINT,                             -- MAWB
    HAWB_ID             BIGINT,                             -- HAWB
    CUSTOMER_ID         BIGINT          NOT NULL,           -- 화주

    -- 수신/발신
    SENDER_NM           VARCHAR(200),                       -- 발신자 (해외파트너)
    RECIPIENT_NM        VARCHAR(200),                       -- 수신자 (화주)
    RECIPIENT_EMAIL     VARCHAR(100),                       -- 수신이메일

    -- 운송 정보
    TRANSPORT_MODE_CD   VARCHAR(10),                        -- 운송모드
    CARRIER_NM          VARCHAR(100),                       -- 운송사명
    VESSEL_FLIGHT       VARCHAR(100),                       -- 선명/편명

    -- 도착 정보
    ARRIVAL_PORT_CD     VARCHAR(10),                        -- 도착항
    ETA_DT              DATE,                               -- 도착예정일
    ATA_DT              DATE,                               -- 실제도착일
    FREE_TIME_DAYS      INT,                                -- Free Time 일수
    LAST_FREE_DATE      DATE,                               -- Free Time 종료일

    -- 화물 정보
    BL_NO               VARCHAR(30),                        -- B/L 번호
    COMMODITY_DESC      VARCHAR(1000),                      -- 품명
    PKG_QTY             INT,                                -- 수량
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    CONTAINER_INFO      VARCHAR(500),                       -- 컨테이너정보

    -- 요금 정보
    FREIGHT_AMT         DECIMAL(18,2),                      -- 운임
    THC_AMT             DECIMAL(18,2),                      -- THC
    DOC_FEE_AMT         DECIMAL(18,2),                      -- 서류비
    OTHER_CHARGES_AMT   DECIMAL(18,2),                      -- 기타비용
    TOTAL_AMT           DECIMAL(18,2),                      -- 합계
    CURRENCY_CD         CHAR(3),                            -- 통화

    -- 통관 안내
    CUSTOMS_BROKER_NM   VARCHAR(200),                       -- 관세사
    CUSTOMS_INST        VARCHAR(1000),                      -- 통관안내

    -- 발송 정보
    SEND_DTM            DATETIME,                           -- 발송일시
    SEND_STATUS_CD      VARCHAR(20),                        -- 발송상태

    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID),
    FOREIGN KEY (CUSTOMER_ID) REFERENCES MST_CUSTOMER(CUSTOMER_ID)
);

COMMENT ON TABLE SHP_ARRIVAL_NOTICE IS '도착통지 (A/N)';

-- ----------------------------------------------------------------------------
-- 5.4 Pre-Alert
-- ----------------------------------------------------------------------------
CREATE TABLE SHP_PRE_ALERT (
    PRE_ALERT_ID        BIGINT          PRIMARY KEY AUTO_INCREMENT,
    PRE_ALERT_NO        VARCHAR(30)     UNIQUE NOT NULL,    -- Pre-Alert 번호

    -- 연결 정보
    SHIPMENT_ID         BIGINT          NOT NULL,           -- 선적건
    SN_ID               BIGINT,                             -- S/N

    -- 수신/발신
    SENDER_ID           BIGINT,                             -- 발신자 (자사)
    RECIPIENT_ID        BIGINT,                             -- 수신자 (해외파트너)
    RECIPIENT_EMAIL     VARCHAR(100),                       -- 수신이메일

    -- 선적 정보
    TRANSPORT_MODE_CD   VARCHAR(10),                        -- 운송모드
    MBL_NO              VARCHAR(30),                        -- MBL 번호
    HBL_NO              VARCHAR(30),                        -- HBL 번호
    MAWB_NO             VARCHAR(15),                        -- MAWB 번호
    HAWB_NO             VARCHAR(30),                        -- HAWB 번호

    -- 운송 정보
    CARRIER_NM          VARCHAR(100),                       -- 운송사명
    VESSEL_FLIGHT       VARCHAR(100),                       -- 선명/편명
    ETD_DT              DATE,                               -- 출발예정일
    ETA_DT              DATE,                               -- 도착예정일

    -- 화물 정보
    SHIPPER_NM          VARCHAR(200),                       -- 발송인
    CONSIGNEE_NM        VARCHAR(200),                       -- 수하인
    PKG_QTY             INT,                                -- 수량
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량

    -- 첨부서류
    ATTACHED_DOCS       VARCHAR(500),                       -- 첨부서류목록

    -- 발송 설정
    TRIGGER_TYPE_CD     VARCHAR(20),                        -- 트리거유형 (ETD/ONBOARD/MANUAL)
    TRIGGER_OFFSET_DAYS INT             DEFAULT 0,          -- 트리거오프셋 (일)
    SCHEDULED_DTM       DATETIME,                           -- 예정발송일시

    -- 발송 결과
    SEND_DTM            DATETIME,                           -- 실제발송일시
    SEND_STATUS_CD      VARCHAR(20)     DEFAULT 'PENDING',  -- 발송상태 (PENDING/SENT/FAILED)
    SEND_RESULT         VARCHAR(500),                       -- 발송결과

    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID)
);

COMMENT ON TABLE SHP_PRE_ALERT IS 'Pre-Alert';

-- Pre-Alert 설정 (사용자별)
CREATE TABLE SHP_PRE_ALERT_SETTING (
    SETTING_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
    USER_ID             BIGINT          NOT NULL,           -- 사용자
    CUSTOMER_ID         BIGINT,                             -- 화주 (특정 화주용)
    PARTNER_ID          BIGINT,                             -- 파트너 (특정 파트너용)

    -- 트리거 설정
    TRANSPORT_MODE_CD   VARCHAR(10),                        -- 운송모드
    TRIGGER_TYPE_CD     VARCHAR(20)     NOT NULL,           -- 트리거유형
    TRIGGER_OFFSET_DAYS INT             DEFAULT 0,          -- 오프셋일수

    -- 발송 설정
    SEND_TIME           TIME,                               -- 발송시간
    RECIPIENT_EMAILS    VARCHAR(500),                       -- 수신이메일 (복수)

    -- 첨부서류 설정
    ATTACH_BL_YN        CHAR(1)         DEFAULT 'Y',        -- B/L 첨부
    ATTACH_CI_YN        CHAR(1)         DEFAULT 'Y',        -- C/I 첨부
    ATTACH_PL_YN        CHAR(1)         DEFAULT 'Y',        -- P/L 첨부

    IS_ACTIVE           CHAR(1)         DEFAULT 'Y',        -- 활성화여부

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N'
);

COMMENT ON TABLE SHP_PRE_ALERT_SETTING IS 'Pre-Alert 설정';

-- ----------------------------------------------------------------------------
-- 5.5 Tracking Event (화물 추적)
-- ----------------------------------------------------------------------------
CREATE TABLE SHP_TRACKING_EVENT (
    TRACKING_ID         BIGINT          PRIMARY KEY AUTO_INCREMENT,
    SHIPMENT_ID         BIGINT          NOT NULL,           -- 선적건
    MBL_ID              BIGINT,                             -- MBL
    HBL_ID              BIGINT,                             -- HBL
    MAWB_ID             BIGINT,                             -- MAWB
    HAWB_ID             BIGINT,                             -- HAWB
    CONTAINER_ID        BIGINT,                             -- 컨테이너

    -- 이벤트 정보
    EVENT_CD            VARCHAR(20)     NOT NULL,           -- 이벤트코드
    EVENT_NM            VARCHAR(100),                       -- 이벤트명
    EVENT_DTM           DATETIME        NOT NULL,           -- 이벤트일시
    EVENT_TIMEZONE      VARCHAR(50),                        -- 타임존

    -- 위치 정보
    LOCATION_CD         VARCHAR(10),                        -- 위치코드
    LOCATION_NM         VARCHAR(100),                       -- 위치명
    COUNTRY_CD          CHAR(2),                            -- 국가

    -- 운송수단 정보
    VESSEL_FLIGHT       VARCHAR(100),                       -- 선명/편명
    VOYAGE_NO           VARCHAR(30),                        -- 항차

    -- 상세 정보
    DESCRIPTION         VARCHAR(500),                       -- 설명
    SOURCE_CD           VARCHAR(20),                        -- 출처 (EDI/API/MANUAL)
    SOURCE_REF          VARCHAR(100),                       -- 출처참조

    -- 예외 여부
    IS_EXCEPTION        CHAR(1)         DEFAULT 'N',        -- 예외여부
    EXCEPTION_TYPE_CD   VARCHAR(20),                        -- 예외유형

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID)
);

COMMENT ON TABLE SHP_TRACKING_EVENT IS '화물 추적 이벤트';

-- ----------------------------------------------------------------------------
-- 인덱스 생성
-- ----------------------------------------------------------------------------
CREATE INDEX IDX_SHP_SR_SHIPMENT ON SHP_SHIPPING_REQUEST(SHIPMENT_ID);
CREATE INDEX IDX_SHP_SR_CUSTOMER ON SHP_SHIPPING_REQUEST(CUSTOMER_ID);
CREATE INDEX IDX_SHP_SN_SHIPMENT ON SHP_SHIPPING_NOTICE(SHIPMENT_ID);
CREATE INDEX IDX_SHP_AN_SHIPMENT ON SHP_ARRIVAL_NOTICE(SHIPMENT_ID);
CREATE INDEX IDX_SHP_AN_CUSTOMER ON SHP_ARRIVAL_NOTICE(CUSTOMER_ID);
CREATE INDEX IDX_SHP_TRACKING_SHIPMENT ON SHP_TRACKING_EVENT(SHIPMENT_ID);
CREATE INDEX IDX_SHP_TRACKING_DTM ON SHP_TRACKING_EVENT(EVENT_DTM);
