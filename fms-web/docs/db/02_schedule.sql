-- ============================================================================
-- FMS Database Schema - 02. Schedule (스케줄 관리)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 해상 항차 (Voyage)
-- ----------------------------------------------------------------------------
CREATE TABLE SCH_VOYAGE (
    VOYAGE_ID           BIGINT          PRIMARY KEY AUTO_INCREMENT,
    CARRIER_ID          BIGINT          NOT NULL,           -- 선사
    VESSEL_NM           VARCHAR(100)    NOT NULL,           -- 선명
    VOYAGE_NO           VARCHAR(30)     NOT NULL,           -- 항차번호
    SERVICE_ROUTE_CD    VARCHAR(20),                        -- 서비스루트코드
    SERVICE_ROUTE_NM    VARCHAR(100),                       -- 서비스루트명
    DIRECTION_CD        VARCHAR(10),                        -- 방향 (E/W/N/S)
    STATUS_CD           VARCHAR(10)     DEFAULT 'SCHEDULED', -- 상태
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (CARRIER_ID) REFERENCES MST_CARRIER(CARRIER_ID)
);

COMMENT ON TABLE SCH_VOYAGE IS '해상 항차';

-- ----------------------------------------------------------------------------
-- 2.2 해상 스케줄 (Ocean Schedule)
-- ----------------------------------------------------------------------------
CREATE TABLE SCH_OCEAN_SCHEDULE (
    OCEAN_SCHEDULE_ID   BIGINT          PRIMARY KEY AUTO_INCREMENT,
    VOYAGE_ID           BIGINT          NOT NULL,           -- 항차
    CARRIER_ID          BIGINT          NOT NULL,           -- 선사
    VESSEL_NM           VARCHAR(100),                       -- 선명
    VOYAGE_NO           VARCHAR(30),                        -- 항차번호

    -- 출발 정보
    POL_PORT_CD         VARCHAR(10)     NOT NULL,           -- 선적항 (Port of Loading)
    POL_TERMINAL_NM     VARCHAR(100),                       -- 선적터미널
    ETD_DTM             DATETIME,                           -- 출항예정일시
    ATD_DTM             DATETIME,                           -- 실제출항일시
    CUT_OFF_DTM         DATETIME,                           -- 서류마감
    CARGO_CUT_OFF_DTM   DATETIME,                           -- 화물마감

    -- 도착 정보
    POD_PORT_CD         VARCHAR(10)     NOT NULL,           -- 양하항 (Port of Discharge)
    POD_TERMINAL_NM     VARCHAR(100),                       -- 양하터미널
    ETA_DTM             DATETIME,                           -- 도착예정일시
    ATA_DTM             DATETIME,                           -- 실제도착일시

    -- 환적 정보
    T/S_YN              CHAR(1)         DEFAULT 'N',        -- 환적여부
    T/S_PORT_CD         VARCHAR(10),                        -- 환적항

    -- 운항 정보
    TRANSIT_DAYS        INT,                                -- 운항일수
    FREQUENCY_CD        VARCHAR(10),                        -- 운항주기 (WEEKLY/BIWEEKLY)
    STATUS_CD           VARCHAR(10)     DEFAULT 'SCHEDULED', -- 상태
    REMARKS             VARCHAR(1000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (VOYAGE_ID) REFERENCES SCH_VOYAGE(VOYAGE_ID),
    FOREIGN KEY (CARRIER_ID) REFERENCES MST_CARRIER(CARRIER_ID),
    FOREIGN KEY (POL_PORT_CD) REFERENCES MST_PORT(PORT_CD),
    FOREIGN KEY (POD_PORT_CD) REFERENCES MST_PORT(PORT_CD)
);

COMMENT ON TABLE SCH_OCEAN_SCHEDULE IS '해상 스케줄';

-- ----------------------------------------------------------------------------
-- 2.3 해상 SPACE 관리 (Container Space)
-- ----------------------------------------------------------------------------
CREATE TABLE SCH_OCEAN_SPACE (
    SPACE_ID            BIGINT          PRIMARY KEY AUTO_INCREMENT,
    OCEAN_SCHEDULE_ID   BIGINT          NOT NULL,           -- 스케줄
    CARRIER_ID          BIGINT          NOT NULL,           -- 선사

    -- 컨테이너 유형별 SPACE
    CNTR_TYPE_CD        VARCHAR(10)     NOT NULL,           -- 컨테이너유형 (20GP/40GP/40HC/45HC)
    TOTAL_SPACE_QTY     INT             DEFAULT 0,          -- 총 할당량
    BOOKED_QTY          INT             DEFAULT 0,          -- 예약수량
    AVAILABLE_QTY       INT             DEFAULT 0,          -- 가용수량

    -- 분배 정보
    ALLOCATION_TYPE_CD  VARCHAR(10),                        -- 할당유형 (GUARANTEED/FLOATING)
    PRIORITY_NO         INT,                                -- 우선순위

    VALID_FROM_DT       DATE,                               -- 유효시작일
    VALID_TO_DT         DATE,                               -- 유효종료일
    STATUS_CD           VARCHAR(10)     DEFAULT 'ACTIVE',   -- 상태
    REMARKS             VARCHAR(500),                       -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (OCEAN_SCHEDULE_ID) REFERENCES SCH_OCEAN_SCHEDULE(OCEAN_SCHEDULE_ID),
    FOREIGN KEY (CARRIER_ID) REFERENCES MST_CARRIER(CARRIER_ID)
);

COMMENT ON TABLE SCH_OCEAN_SPACE IS '해상 SPACE 관리';

-- 화주별 SPACE 분배
CREATE TABLE SCH_OCEAN_SPACE_ALLOC (
    SPACE_ALLOC_ID      BIGINT          PRIMARY KEY AUTO_INCREMENT,
    SPACE_ID            BIGINT          NOT NULL,           -- SPACE
    CUSTOMER_ID         BIGINT          NOT NULL,           -- 화주
    ALLOC_QTY           INT             NOT NULL,           -- 할당수량
    USED_QTY            INT             DEFAULT 0,          -- 사용수량
    VALID_FROM_DT       DATE,                               -- 유효시작일
    VALID_TO_DT         DATE,                               -- 유효종료일
    STATUS_CD           VARCHAR(10)     DEFAULT 'ACTIVE',   -- 상태
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (SPACE_ID) REFERENCES SCH_OCEAN_SPACE(SPACE_ID),
    FOREIGN KEY (CUSTOMER_ID) REFERENCES MST_CUSTOMER(CUSTOMER_ID)
);

COMMENT ON TABLE SCH_OCEAN_SPACE_ALLOC IS '해상 SPACE 화주별 분배';

-- ----------------------------------------------------------------------------
-- 2.4 항공 스케줄 (Air Schedule)
-- ----------------------------------------------------------------------------
CREATE TABLE SCH_AIR_SCHEDULE (
    AIR_SCHEDULE_ID     BIGINT          PRIMARY KEY AUTO_INCREMENT,
    CARRIER_ID          BIGINT          NOT NULL,           -- 항공사
    FLIGHT_NO           VARCHAR(10)     NOT NULL,           -- 편명

    -- 출발 정보
    ORIGIN_PORT_CD      VARCHAR(10)     NOT NULL,           -- 출발공항
    ORIGIN_TERMINAL     VARCHAR(20),                        -- 출발터미널
    ETD_DTM             DATETIME,                           -- 출발예정일시
    ATD_DTM             DATETIME,                           -- 실제출발일시

    -- 도착 정보
    DEST_PORT_CD        VARCHAR(10)     NOT NULL,           -- 도착공항
    DEST_TERMINAL       VARCHAR(20),                        -- 도착터미널
    ETA_DTM             DATETIME,                           -- 도착예정일시
    ATA_DTM             DATETIME,                           -- 실제도착일시

    -- 환적 정보
    T/S_YN              CHAR(1)         DEFAULT 'N',        -- 환적여부
    T/S_PORT_CD         VARCHAR(10),                        -- 환적공항

    -- 운항 정보
    AIRCRAFT_TYPE       VARCHAR(20),                        -- 기종
    FLIGHT_DAYS         VARCHAR(20),                        -- 운항요일 (1234567)
    TRANSIT_HOURS       DECIMAL(5,2),                       -- 운항시간
    FREQUENCY_CD        VARCHAR(10),                        -- 운항주기

    -- 용량 정보
    MAX_WEIGHT_KG       DECIMAL(10,2),                      -- 최대중량(kg)
    AVAILABLE_WEIGHT_KG DECIMAL(10,2),                      -- 가용중량(kg)

    STATUS_CD           VARCHAR(10)     DEFAULT 'SCHEDULED', -- 상태
    REMARKS             VARCHAR(1000),                      -- 비고

    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (CARRIER_ID) REFERENCES MST_CARRIER(CARRIER_ID),
    FOREIGN KEY (ORIGIN_PORT_CD) REFERENCES MST_PORT(PORT_CD),
    FOREIGN KEY (DEST_PORT_CD) REFERENCES MST_PORT(PORT_CD)
);

COMMENT ON TABLE SCH_AIR_SCHEDULE IS '항공 스케줄';

-- ----------------------------------------------------------------------------
-- 2.5 MAWB 번호 재고 (IATA Stock)
-- ----------------------------------------------------------------------------
CREATE TABLE SCH_MAWB_STOCK (
    MAWB_STOCK_ID       BIGINT          PRIMARY KEY AUTO_INCREMENT,
    CARRIER_ID          BIGINT          NOT NULL,           -- 항공사
    AIRLINE_PREFIX      CHAR(3)         NOT NULL,           -- 항공사 Prefix (3자리)
    SERIAL_START        VARCHAR(8)      NOT NULL,           -- 시작번호
    SERIAL_END          VARCHAR(8)      NOT NULL,           -- 종료번호
    TOTAL_QTY           INT             NOT NULL,           -- 총 수량
    USED_QTY            INT             DEFAULT 0,          -- 사용수량
    AVAILABLE_QTY       INT,                                -- 가용수량
    ALLOC_DT            DATE,                               -- 배정일자
    EXPIRE_DT           DATE,                               -- 만료일자
    STATUS_CD           VARCHAR(10)     DEFAULT 'ACTIVE',   -- 상태
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (CARRIER_ID) REFERENCES MST_CARRIER(CARRIER_ID)
);

COMMENT ON TABLE SCH_MAWB_STOCK IS 'MAWB 번호 재고 (IATA Stock)';

-- MAWB 번호 상세
CREATE TABLE SCH_MAWB_STOCK_DTL (
    MAWB_STOCK_DTL_ID   BIGINT          PRIMARY KEY AUTO_INCREMENT,
    MAWB_STOCK_ID       BIGINT          NOT NULL,           -- MAWB 재고
    MAWB_NO             VARCHAR(11)     UNIQUE NOT NULL,    -- MAWB 번호 (Prefix + Serial)
    STATUS_CD           VARCHAR(10)     DEFAULT 'AVAILABLE', -- 상태 (AVAILABLE/USED/VOID)
    USED_DTM            DATETIME,                           -- 사용일시
    USED_BY             VARCHAR(50),                        -- 사용자
    SHIPMENT_ID         BIGINT,                             -- 연결된 Shipment
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (MAWB_STOCK_ID) REFERENCES SCH_MAWB_STOCK(MAWB_STOCK_ID)
);

COMMENT ON TABLE SCH_MAWB_STOCK_DTL IS 'MAWB 번호 상세';

-- ----------------------------------------------------------------------------
-- 인덱스 생성
-- ----------------------------------------------------------------------------
CREATE INDEX IDX_SCH_VOYAGE_CARRIER ON SCH_VOYAGE(CARRIER_ID);
CREATE INDEX IDX_SCH_OCEAN_SCH_ETD ON SCH_OCEAN_SCHEDULE(ETD_DTM);
CREATE INDEX IDX_SCH_OCEAN_SCH_POL ON SCH_OCEAN_SCHEDULE(POL_PORT_CD);
CREATE INDEX IDX_SCH_OCEAN_SCH_POD ON SCH_OCEAN_SCHEDULE(POD_PORT_CD);
CREATE INDEX IDX_SCH_AIR_SCH_ETD ON SCH_AIR_SCHEDULE(ETD_DTM);
CREATE INDEX IDX_SCH_AIR_SCH_ORIGIN ON SCH_AIR_SCHEDULE(ORIGIN_PORT_CD);
CREATE INDEX IDX_SCH_AIR_SCH_DEST ON SCH_AIR_SCHEDULE(DEST_PORT_CD);
CREATE INDEX IDX_SCH_MAWB_STOCK_CARRIER ON SCH_MAWB_STOCK(CARRIER_ID);
