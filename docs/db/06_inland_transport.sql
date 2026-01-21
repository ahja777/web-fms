-- ============================================================================
-- FMS Database Schema - 06. Inland Transport (내륙운송)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 6.1 운송지시 (Transport Order)
-- ----------------------------------------------------------------------------
CREATE TABLE TRN_TRANSPORT_ORDER (
    TRANSPORT_ORDER_ID  BIGINT          PRIMARY KEY AUTO_INCREMENT,
    TRANSPORT_ORDER_NO  VARCHAR(30)     UNIQUE NOT NULL,    -- 운송지시번호

    -- 연결 정보
    SHIPMENT_ID         BIGINT          NOT NULL,           -- 선적건
    BOOKING_ID          BIGINT,                             -- 부킹
    HBL_ID              BIGINT,                             -- HBL
    HAWB_ID             BIGINT,                             -- HAWB
    CONTAINER_ID        BIGINT,                             -- 컨테이너

    -- 화주/운송사
    CUSTOMER_ID         BIGINT          NOT NULL,           -- 화주
    TRUCKER_ID          BIGINT,                             -- 운송사

    -- 운송 유형
    TRANSPORT_TYPE_CD   VARCHAR(20)     NOT NULL,           -- 운송유형 (PICKUP/DELIVERY/DRAYAGE)
    TRANSPORT_MODE_CD   VARCHAR(10),                        -- 운송모드 (TRUCK/RAIL/BARGE)
    TRADE_TYPE_CD       VARCHAR(10),                        -- 수출입구분

    -- 출발지 정보
    PICKUP_LOCATION_NM  VARCHAR(200),                       -- 픽업지명
    PICKUP_ADDR         VARCHAR(500),                       -- 픽업주소
    PICKUP_CONTACT_NM   VARCHAR(100),                       -- 픽업담당자
    PICKUP_CONTACT_TEL  VARCHAR(30),                        -- 픽업연락처
    PICKUP_DT           DATE,                               -- 픽업일자
    PICKUP_TIME_FROM    TIME,                               -- 픽업시작시간
    PICKUP_TIME_TO      TIME,                               -- 픽업종료시간

    -- 도착지 정보
    DELIVERY_LOCATION_NM VARCHAR(200),                      -- 도착지명
    DELIVERY_ADDR       VARCHAR(500),                       -- 도착주소
    DELIVERY_CONTACT_NM VARCHAR(100),                       -- 도착담당자
    DELIVERY_CONTACT_TEL VARCHAR(30),                       -- 도착연락처
    DELIVERY_DT         DATE,                               -- 배송일자
    DELIVERY_TIME_FROM  TIME,                               -- 배송시작시간
    DELIVERY_TIME_TO    TIME,                               -- 배송종료시간

    -- 화물 정보
    COMMODITY_DESC      VARCHAR(500),                       -- 품명
    PKG_QTY             INT,                                -- 수량
    PKG_TYPE_CD         VARCHAR(10),                        -- 포장유형
    GROSS_WEIGHT_KG     DECIMAL(12,3),                      -- 총중량
    VOLUME_CBM          DECIMAL(12,4),                      -- 부피

    -- 컨테이너 정보 (해상 Drayage)
    CNTR_NO             VARCHAR(15),                        -- 컨테이너번호
    CNTR_TYPE_CD        VARCHAR(10),                        -- 컨테이너유형
    SEAL_NO             VARCHAR(30),                        -- 봉인번호

    -- 차량 정보
    VEHICLE_TYPE_CD     VARCHAR(20),                        -- 차량유형 (TRUCK/TRAILER/WING)
    VEHICLE_NO          VARCHAR(20),                        -- 차량번호
    DRIVER_NM           VARCHAR(100),                       -- 기사명
    DRIVER_TEL          VARCHAR(30),                        -- 기사연락처

    -- 운임 정보
    RATE_AMT            DECIMAL(18,2),                      -- 운임단가
    TOTAL_AMT           DECIMAL(18,2),                      -- 총운임
    CURRENCY_CD         CHAR(3),                            -- 통화
    TOLL_AMT            DECIMAL(18,2),                      -- 통행료
    EXTRA_CHARGES_AMT   DECIMAL(18,2),                      -- 추가비용

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'REQUESTED', -- 상태
    REQUEST_DTM         DATETIME,                           -- 요청일시
    DISPATCH_DTM        DATETIME,                           -- 배차일시
    PICKUP_COMPLETE_DTM DATETIME,                           -- 픽업완료일시
    DELIVERY_COMPLETE_DTM DATETIME,                         -- 배송완료일시

    SPECIAL_INST        VARCHAR(1000),                      -- 특별지시사항
    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID),
    FOREIGN KEY (CUSTOMER_ID) REFERENCES MST_CUSTOMER(CUSTOMER_ID),
    FOREIGN KEY (TRUCKER_ID) REFERENCES MST_TRUCKER(TRUCKER_ID)
);

COMMENT ON TABLE TRN_TRANSPORT_ORDER IS '운송지시';

-- 운송 경유지 (Multimodal)
CREATE TABLE TRN_TRANSPORT_ORDER_STOP (
    STOP_ID             BIGINT          PRIMARY KEY AUTO_INCREMENT,
    TRANSPORT_ORDER_ID  BIGINT          NOT NULL,           -- 운송지시
    SEQ_NO              INT             NOT NULL,           -- 순번
    STOP_TYPE_CD        VARCHAR(20),                        -- 유형 (PICKUP/DELIVERY/TRANSFER)
    LOCATION_NM         VARCHAR(200),                       -- 지점명
    ADDR                VARCHAR(500),                       -- 주소
    CONTACT_NM          VARCHAR(100),                       -- 담당자
    CONTACT_TEL         VARCHAR(30),                        -- 연락처
    SCHEDULED_DT        DATE,                               -- 예정일
    SCHEDULED_TIME      TIME,                               -- 예정시간
    ACTUAL_DTM          DATETIME,                           -- 실제일시
    STATUS_CD           VARCHAR(20),                        -- 상태
    REMARKS             VARCHAR(500),                       -- 비고
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (TRANSPORT_ORDER_ID) REFERENCES TRN_TRANSPORT_ORDER(TRANSPORT_ORDER_ID)
);

COMMENT ON TABLE TRN_TRANSPORT_ORDER_STOP IS '운송 경유지';

-- ----------------------------------------------------------------------------
-- 6.2 운송 스케줄 (Transport Schedule)
-- ----------------------------------------------------------------------------
CREATE TABLE TRN_TRANSPORT_SCHEDULE (
    SCHEDULE_ID         BIGINT          PRIMARY KEY AUTO_INCREMENT,
    TRANSPORT_ORDER_ID  BIGINT          NOT NULL,           -- 운송지시
    TRUCKER_ID          BIGINT          NOT NULL,           -- 운송사

    -- 스케줄 정보
    SCHEDULED_PICKUP_DTM    DATETIME,                       -- 예정픽업일시
    SCHEDULED_DELIVERY_DTM  DATETIME,                       -- 예정배송일시
    ACTUAL_PICKUP_DTM       DATETIME,                       -- 실제픽업일시
    ACTUAL_DELIVERY_DTM     DATETIME,                       -- 실제배송일시

    -- 차량/기사 배정
    VEHICLE_NO          VARCHAR(20),                        -- 차량번호
    DRIVER_NM           VARCHAR(100),                       -- 기사명
    DRIVER_TEL          VARCHAR(30),                        -- 기사연락처

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'SCHEDULED', -- 상태
    DISPATCH_DTM        DATETIME,                           -- 배차일시
    CONFIRMED_BY        VARCHAR(50),                        -- 확정자
    CONFIRMED_DTM       DATETIME,                           -- 확정일시

    REMARKS             VARCHAR(500),                       -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (TRANSPORT_ORDER_ID) REFERENCES TRN_TRANSPORT_ORDER(TRANSPORT_ORDER_ID),
    FOREIGN KEY (TRUCKER_ID) REFERENCES MST_TRUCKER(TRUCKER_ID)
);

COMMENT ON TABLE TRN_TRANSPORT_SCHEDULE IS '운송 스케줄';

-- ----------------------------------------------------------------------------
-- 6.3 POD/GR (Proof of Delivery / Goods Receipt)
-- ----------------------------------------------------------------------------
CREATE TABLE TRN_POD (
    POD_ID              BIGINT          PRIMARY KEY AUTO_INCREMENT,
    POD_NO              VARCHAR(30)     UNIQUE NOT NULL,    -- POD 번호

    -- 연결 정보
    SHIPMENT_ID         BIGINT          NOT NULL,           -- 선적건
    TRANSPORT_ORDER_ID  BIGINT,                             -- 운송지시
    HBL_ID              BIGINT,                             -- HBL
    HAWB_ID             BIGINT,                             -- HAWB
    CUSTOMER_ID         BIGINT          NOT NULL,           -- 화주

    -- 배송 정보
    DELIVERY_DT         DATE            NOT NULL,           -- 배송일자
    DELIVERY_DTM        DATETIME,                           -- 배송일시
    DELIVERY_LOCATION   VARCHAR(200),                       -- 배송장소
    DELIVERY_ADDR       VARCHAR(500),                       -- 배송주소

    -- 수령 정보
    RECEIVED_BY         VARCHAR(100),                       -- 수령자명
    RECEIVED_TITLE      VARCHAR(50),                        -- 수령자직함
    RECEIVED_DTM        DATETIME,                           -- 수령일시

    -- 화물 정보
    DELIVERED_PKG_QTY   INT,                                -- 배송수량
    DELIVERED_WEIGHT_KG DECIMAL(12,3),                      -- 배송중량
    RECEIVED_PKG_QTY    INT,                                -- 수령수량
    RECEIVED_WEIGHT_KG  DECIMAL(12,3),                      -- 수령중량

    -- 상태
    STATUS_CD           VARCHAR(20)     DEFAULT 'DELIVERED', -- 상태
    CONDITION_CD        VARCHAR(20)     DEFAULT 'GOOD',      -- 상태 (GOOD/DAMAGED/SHORTAGE)

    -- 이상 정보
    HAS_EXCEPTION       CHAR(1)         DEFAULT 'N',        -- 이상여부
    EXCEPTION_DESC      VARCHAR(500),                       -- 이상내용
    DAMAGE_DESC         VARCHAR(500),                       -- 파손내용

    -- 서명 이미지
    SIGNATURE_FILE_PATH VARCHAR(500),                       -- 서명이미지경로
    PHOTO_FILE_PATH     VARCHAR(500),                       -- 사진경로

    -- 화주 확인
    CUSTOMER_CONFIRMED_YN CHAR(1)       DEFAULT 'N',        -- 화주확인여부
    CUSTOMER_CONFIRMED_DTM DATETIME,                        -- 화주확인일시

    REMARKS             VARCHAR(2000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',

    FOREIGN KEY (SHIPMENT_ID) REFERENCES ORD_SHIPMENT(SHIPMENT_ID),
    FOREIGN KEY (TRANSPORT_ORDER_ID) REFERENCES TRN_TRANSPORT_ORDER(TRANSPORT_ORDER_ID),
    FOREIGN KEY (CUSTOMER_ID) REFERENCES MST_CUSTOMER(CUSTOMER_ID)
);

COMMENT ON TABLE TRN_POD IS 'POD (Proof of Delivery)';

-- POD 상세 (화물별)
CREATE TABLE TRN_POD_DETAIL (
    POD_DETAIL_ID       BIGINT          PRIMARY KEY AUTO_INCREMENT,
    POD_ID              BIGINT          NOT NULL,           -- POD
    LINE_NO             INT             NOT NULL,           -- 라인번호
    COMMODITY_DESC      VARCHAR(500),                       -- 품명
    PKG_QTY             INT,                                -- 수량
    PKG_TYPE_CD         VARCHAR(10),                        -- 포장유형
    WEIGHT_KG           DECIMAL(12,3),                      -- 중량
    CONDITION_CD        VARCHAR(20),                        -- 상태
    REMARKS             VARCHAR(500),                       -- 비고
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (POD_ID) REFERENCES TRN_POD(POD_ID)
);

COMMENT ON TABLE TRN_POD_DETAIL IS 'POD 상세';

-- ----------------------------------------------------------------------------
-- 6.4 운송 추적 (Transport Tracking)
-- ----------------------------------------------------------------------------
CREATE TABLE TRN_TRANSPORT_TRACKING (
    TRACKING_ID         BIGINT          PRIMARY KEY AUTO_INCREMENT,
    TRANSPORT_ORDER_ID  BIGINT          NOT NULL,           -- 운송지시

    -- 이벤트 정보
    EVENT_CD            VARCHAR(20)     NOT NULL,           -- 이벤트코드
    EVENT_NM            VARCHAR(100),                       -- 이벤트명
    EVENT_DTM           DATETIME        NOT NULL,           -- 이벤트일시

    -- 위치 정보
    LOCATION_NM         VARCHAR(200),                       -- 위치명
    ADDR                VARCHAR(500),                       -- 주소
    LATITUDE            DECIMAL(10,7),                      -- 위도
    LONGITUDE           DECIMAL(10,7),                      -- 경도

    -- 차량 정보
    VEHICLE_NO          VARCHAR(20),                        -- 차량번호
    DRIVER_NM           VARCHAR(100),                       -- 기사명

    DESCRIPTION         VARCHAR(500),                       -- 설명
    SOURCE_CD           VARCHAR(20),                        -- 출처 (GPS/MANUAL/MOBILE)

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (TRANSPORT_ORDER_ID) REFERENCES TRN_TRANSPORT_ORDER(TRANSPORT_ORDER_ID)
);

COMMENT ON TABLE TRN_TRANSPORT_TRACKING IS '운송 추적';

-- ----------------------------------------------------------------------------
-- 인덱스 생성
-- ----------------------------------------------------------------------------
CREATE INDEX IDX_TRN_ORDER_SHIPMENT ON TRN_TRANSPORT_ORDER(SHIPMENT_ID);
CREATE INDEX IDX_TRN_ORDER_CUSTOMER ON TRN_TRANSPORT_ORDER(CUSTOMER_ID);
CREATE INDEX IDX_TRN_ORDER_TRUCKER ON TRN_TRANSPORT_ORDER(TRUCKER_ID);
CREATE INDEX IDX_TRN_ORDER_STATUS ON TRN_TRANSPORT_ORDER(STATUS_CD);
CREATE INDEX IDX_TRN_SCHEDULE_ORDER ON TRN_TRANSPORT_SCHEDULE(TRANSPORT_ORDER_ID);
CREATE INDEX IDX_TRN_POD_SHIPMENT ON TRN_POD(SHIPMENT_ID);
CREATE INDEX IDX_TRN_POD_CUSTOMER ON TRN_POD(CUSTOMER_ID);
CREATE INDEX IDX_TRN_TRACKING_ORDER ON TRN_TRANSPORT_TRACKING(TRANSPORT_ORDER_ID);
