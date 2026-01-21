-- ============================================================================
-- FMS Database Schema - 01. Master (기준정보)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1.1 국가 (Country)
-- ----------------------------------------------------------------------------
CREATE TABLE MST_COUNTRY (
    COUNTRY_CD          CHAR(2)         PRIMARY KEY,        -- ISO 3166-1 alpha-2
    COUNTRY_CD3         CHAR(3),                            -- ISO 3166-1 alpha-3
    COUNTRY_NM          VARCHAR(100)    NOT NULL,           -- 국가명
    COUNTRY_NM_EN       VARCHAR(100),                       -- 국가명(영문)
    CONTINENT_CD        VARCHAR(10),                        -- 대륙코드
    CURRENCY_CD         CHAR(3),                            -- 기본통화
    USE_YN              CHAR(1)         DEFAULT 'Y',        -- 사용여부
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N'
);

COMMENT ON TABLE MST_COUNTRY IS '국가 마스터';

-- ----------------------------------------------------------------------------
-- 1.2 통화 (Currency)
-- ----------------------------------------------------------------------------
CREATE TABLE MST_CURRENCY (
    CURRENCY_CD         CHAR(3)         PRIMARY KEY,        -- ISO 4217
    CURRENCY_NM         VARCHAR(50)     NOT NULL,           -- 통화명
    CURRENCY_SYMBOL     VARCHAR(10),                        -- 통화기호
    DECIMAL_PLACES      INT             DEFAULT 2,          -- 소수점자리
    USE_YN              CHAR(1)         DEFAULT 'Y',
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N'
);

COMMENT ON TABLE MST_CURRENCY IS '통화 마스터';

-- ----------------------------------------------------------------------------
-- 1.3 환율 (Exchange Rate)
-- ----------------------------------------------------------------------------
CREATE TABLE MST_EXCHANGE_RATE (
    EXCHANGE_RATE_ID    BIGINT          PRIMARY KEY AUTO_INCREMENT,
    BASE_CURRENCY_CD    CHAR(3)         NOT NULL,           -- 기준통화
    TARGET_CURRENCY_CD  CHAR(3)         NOT NULL,           -- 대상통화
    RATE_DT             DATE            NOT NULL,           -- 환율일자
    EXCHANGE_RATE       DECIMAL(18,6)   NOT NULL,           -- 환율
    RATE_TYPE_CD        VARCHAR(10)     DEFAULT 'MID',      -- 환율유형 (BUY/SELL/MID)
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    UNIQUE (BASE_CURRENCY_CD, TARGET_CURRENCY_CD, RATE_DT, RATE_TYPE_CD)
);

COMMENT ON TABLE MST_EXCHANGE_RATE IS '환율 마스터';

-- ----------------------------------------------------------------------------
-- 1.4 항구 (Port)
-- ----------------------------------------------------------------------------
CREATE TABLE MST_PORT (
    PORT_CD             VARCHAR(10)     PRIMARY KEY,        -- UN/LOCODE
    PORT_NM             VARCHAR(100)    NOT NULL,           -- 항구명
    PORT_NM_EN          VARCHAR(100),                       -- 항구명(영문)
    COUNTRY_CD          CHAR(2)         NOT NULL,           -- 국가코드
    PORT_TYPE_CD        VARCHAR(10),                        -- 항구유형 (SEA/AIR/RAIL/ROAD)
    TIMEZONE            VARCHAR(50),                        -- 타임존
    LATITUDE            DECIMAL(10,7),                      -- 위도
    LONGITUDE           DECIMAL(10,7),                      -- 경도
    USE_YN              CHAR(1)         DEFAULT 'Y',
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (COUNTRY_CD) REFERENCES MST_COUNTRY(COUNTRY_CD)
);

COMMENT ON TABLE MST_PORT IS '항구/공항 마스터';

-- ----------------------------------------------------------------------------
-- 1.5 회사 (Company) - 자사 정보
-- ----------------------------------------------------------------------------
CREATE TABLE MST_COMPANY (
    COMPANY_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
    COMPANY_CD          VARCHAR(20)     UNIQUE NOT NULL,    -- 회사코드
    COMPANY_NM          VARCHAR(200)    NOT NULL,           -- 회사명
    COMPANY_NM_EN       VARCHAR(200),                       -- 회사명(영문)
    BIZ_REG_NO          VARCHAR(20),                        -- 사업자등록번호
    CORP_REG_NO         VARCHAR(20),                        -- 법인등록번호
    CEO_NM              VARCHAR(100),                       -- 대표자명
    BIZ_TYPE            VARCHAR(100),                       -- 업태
    BIZ_ITEM            VARCHAR(200),                       -- 업종
    COUNTRY_CD          CHAR(2),                            -- 국가코드
    ADDR                VARCHAR(500),                       -- 주소
    ADDR_EN             VARCHAR(500),                       -- 주소(영문)
    TEL_NO              VARCHAR(30),                        -- 전화번호
    FAX_NO              VARCHAR(30),                        -- 팩스번호
    EMAIL               VARCHAR(100),                       -- 이메일
    HOMEPAGE_URL        VARCHAR(200),                       -- 홈페이지
    USE_YN              CHAR(1)         DEFAULT 'Y',
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N'
);

COMMENT ON TABLE MST_COMPANY IS '회사(자사) 마스터';

-- ----------------------------------------------------------------------------
-- 1.6 화주 (Customer/Shipper)
-- ----------------------------------------------------------------------------
CREATE TABLE MST_CUSTOMER (
    CUSTOMER_ID         BIGINT          PRIMARY KEY AUTO_INCREMENT,
    CUSTOMER_CD         VARCHAR(20)     UNIQUE NOT NULL,    -- 화주코드
    CUSTOMER_NM         VARCHAR(200)    NOT NULL,           -- 화주명
    CUSTOMER_NM_EN      VARCHAR(200),                       -- 화주명(영문)
    CUSTOMER_TYPE_CD    VARCHAR(10),                        -- 화주유형 (SHIPPER/CONSIGNEE/BOTH)
    BIZ_REG_NO          VARCHAR(20),                        -- 사업자등록번호
    CEO_NM              VARCHAR(100),                       -- 대표자명
    COUNTRY_CD          CHAR(2),                            -- 국가코드
    ADDR                VARCHAR(500),                       -- 주소
    ADDR_EN             VARCHAR(500),                       -- 주소(영문)
    ZIP_CD              VARCHAR(10),                        -- 우편번호
    TEL_NO              VARCHAR(30),                        -- 전화번호
    FAX_NO              VARCHAR(30),                        -- 팩스번호
    EMAIL               VARCHAR(100),                       -- 이메일
    CONTACT_NM          VARCHAR(100),                       -- 담당자명
    CONTACT_TEL         VARCHAR(30),                        -- 담당자연락처
    CREDIT_LIMIT_AMT    DECIMAL(18,2),                      -- 신용한도
    CURRENCY_CD         CHAR(3),                            -- 기본통화
    PAYMENT_TERM_CD     VARCHAR(10),                        -- 결제조건 (PREPAID/COLLECT)
    SALES_MANAGER_ID    BIGINT,                             -- 담당영업사원
    STATUS_CD           VARCHAR(10)     DEFAULT 'ACTIVE',   -- 상태 (ACTIVE/INACTIVE)
    USE_YN              CHAR(1)         DEFAULT 'Y',
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N'
);

COMMENT ON TABLE MST_CUSTOMER IS '화주 마스터';

-- 화주 연락처 (복수)
CREATE TABLE MST_CUSTOMER_CONTACT (
    CONTACT_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
    CUSTOMER_ID         BIGINT          NOT NULL,
    CONTACT_NM          VARCHAR(100)    NOT NULL,           -- 담당자명
    DEPT_NM             VARCHAR(100),                       -- 부서명
    POSITION_NM         VARCHAR(50),                        -- 직위
    TEL_NO              VARCHAR(30),                        -- 전화번호
    MOBILE_NO           VARCHAR(30),                        -- 휴대전화
    EMAIL               VARCHAR(100),                       -- 이메일
    IS_PRIMARY          CHAR(1)         DEFAULT 'N',        -- 주담당자여부
    USE_YN              CHAR(1)         DEFAULT 'Y',
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    FOREIGN KEY (CUSTOMER_ID) REFERENCES MST_CUSTOMER(CUSTOMER_ID)
);

COMMENT ON TABLE MST_CUSTOMER_CONTACT IS '화주 연락처';

-- ----------------------------------------------------------------------------
-- 1.7 실행사 (Carrier) - 선사/항공사
-- ----------------------------------------------------------------------------
CREATE TABLE MST_CARRIER (
    CARRIER_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
    CARRIER_CD          VARCHAR(20)     UNIQUE NOT NULL,    -- 실행사코드
    CARRIER_NM          VARCHAR(200)    NOT NULL,           -- 실행사명
    CARRIER_NM_EN       VARCHAR(200),                       -- 실행사명(영문)
    CARRIER_TYPE_CD     VARCHAR(10)     NOT NULL,           -- 유형 (OCEAN/AIR)
    SCAC_CD             VARCHAR(4),                         -- SCAC 코드 (해상)
    IATA_CD             VARCHAR(3),                         -- IATA 코드 (항공)
    ICAO_CD             VARCHAR(4),                         -- ICAO 코드 (항공)
    COUNTRY_CD          CHAR(2),                            -- 국가코드
    ADDR                VARCHAR(500),                       -- 주소
    TEL_NO              VARCHAR(30),                        -- 전화번호
    FAX_NO              VARCHAR(30),                        -- 팩스번호
    EMAIL               VARCHAR(100),                       -- 이메일
    WEBSITE_URL         VARCHAR(200),                       -- 웹사이트
    TRACKING_URL        VARCHAR(500),                       -- Tracking URL 패턴
    EDI_CAPABLE_YN      CHAR(1)         DEFAULT 'N',        -- EDI 연동가능여부
    USE_YN              CHAR(1)         DEFAULT 'Y',
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N'
);

COMMENT ON TABLE MST_CARRIER IS '실행사(선사/항공사) 마스터';

-- ----------------------------------------------------------------------------
-- 1.8 운송사 (Trucker) - 내륙운송
-- ----------------------------------------------------------------------------
CREATE TABLE MST_TRUCKER (
    TRUCKER_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
    TRUCKER_CD          VARCHAR(20)     UNIQUE NOT NULL,    -- 운송사코드
    TRUCKER_NM          VARCHAR(200)    NOT NULL,           -- 운송사명
    TRUCKER_NM_EN       VARCHAR(200),                       -- 운송사명(영문)
    BIZ_REG_NO          VARCHAR(20),                        -- 사업자등록번호
    CEO_NM              VARCHAR(100),                       -- 대표자명
    COUNTRY_CD          CHAR(2),                            -- 국가코드
    ADDR                VARCHAR(500),                       -- 주소
    TEL_NO              VARCHAR(30),                        -- 전화번호
    FAX_NO              VARCHAR(30),                        -- 팩스번호
    EMAIL               VARCHAR(100),                       -- 이메일
    CONTACT_NM          VARCHAR(100),                       -- 담당자명
    CONTACT_TEL         VARCHAR(30),                        -- 담당자연락처
    SERVICE_AREA        VARCHAR(500),                       -- 서비스지역
    VEHICLE_CNT         INT,                                -- 보유차량수
    USE_YN              CHAR(1)         DEFAULT 'Y',
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N'
);

COMMENT ON TABLE MST_TRUCKER IS '운송사 마스터';

-- ----------------------------------------------------------------------------
-- 1.9 해외 파트너 (Overseas Partner/Agent)
-- ----------------------------------------------------------------------------
CREATE TABLE MST_PARTNER (
    PARTNER_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
    PARTNER_CD          VARCHAR(20)     UNIQUE NOT NULL,    -- 파트너코드
    PARTNER_NM          VARCHAR(200)    NOT NULL,           -- 파트너명
    PARTNER_NM_EN       VARCHAR(200),                       -- 파트너명(영문)
    PARTNER_TYPE_CD     VARCHAR(10),                        -- 유형 (AGENT/FORWARDER/NVOCC)
    COUNTRY_CD          CHAR(2)         NOT NULL,           -- 국가코드
    CITY_NM             VARCHAR(100),                       -- 도시명
    ADDR                VARCHAR(500),                       -- 주소
    TEL_NO              VARCHAR(30),                        -- 전화번호
    FAX_NO              VARCHAR(30),                        -- 팩스번호
    EMAIL               VARCHAR(100),                       -- 이메일
    CONTACT_NM          VARCHAR(100),                       -- 담당자명
    CONTACT_TEL         VARCHAR(30),                        -- 담당자연락처
    IATA_CD             VARCHAR(10),                        -- IATA 코드
    SERVICE_TYPE_CD     VARCHAR(20),                        -- 서비스유형 (SEA/AIR/BOTH)
    CONTRACT_START_DT   DATE,                               -- 계약시작일
    CONTRACT_END_DT     DATE,                               -- 계약종료일
    CREDIT_LIMIT_AMT    DECIMAL(18,2),                      -- 신용한도
    CURRENCY_CD         CHAR(3),                            -- 기본통화
    USE_YN              CHAR(1)         DEFAULT 'Y',
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N'
);

COMMENT ON TABLE MST_PARTNER IS '해외파트너 마스터';

-- ----------------------------------------------------------------------------
-- 1.10 관세사 (Customs Broker)
-- ----------------------------------------------------------------------------
CREATE TABLE MST_CUSTOMS_BROKER (
    BROKER_ID           BIGINT          PRIMARY KEY AUTO_INCREMENT,
    BROKER_CD           VARCHAR(20)     UNIQUE NOT NULL,    -- 관세사코드
    BROKER_NM           VARCHAR(200)    NOT NULL,           -- 관세사명
    LICENSE_NO          VARCHAR(50),                        -- 관세사등록번호
    BIZ_REG_NO          VARCHAR(20),                        -- 사업자등록번호
    CEO_NM              VARCHAR(100),                       -- 대표자명
    COUNTRY_CD          CHAR(2),                            -- 국가코드
    ADDR                VARCHAR(500),                       -- 주소
    TEL_NO              VARCHAR(30),                        -- 전화번호
    FAX_NO              VARCHAR(30),                        -- 팩스번호
    EMAIL               VARCHAR(100),                       -- 이메일
    CONTACT_NM          VARCHAR(100),                       -- 담당자명
    EDI_ID              VARCHAR(50),                        -- EDI 식별자
    USE_YN              CHAR(1)         DEFAULT 'Y',
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N'
);

COMMENT ON TABLE MST_CUSTOMS_BROKER IS '관세사 마스터';

-- ----------------------------------------------------------------------------
-- 1.11 공통코드 (Common Code)
-- ----------------------------------------------------------------------------
CREATE TABLE MST_COMMON_CODE_GROUP (
    CODE_GROUP_ID       VARCHAR(30)     PRIMARY KEY,        -- 코드그룹ID
    CODE_GROUP_NM       VARCHAR(100)    NOT NULL,           -- 코드그룹명
    DESCRIPTION         VARCHAR(500),                       -- 설명
    USE_YN              CHAR(1)         DEFAULT 'Y',
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N'
);

CREATE TABLE MST_COMMON_CODE (
    CODE_GROUP_ID       VARCHAR(30)     NOT NULL,           -- 코드그룹ID
    CODE_CD             VARCHAR(30)     NOT NULL,           -- 코드
    CODE_NM             VARCHAR(100)    NOT NULL,           -- 코드명
    CODE_NM_EN          VARCHAR(100),                       -- 코드명(영문)
    SORT_ORDER          INT             DEFAULT 0,          -- 정렬순서
    ATTR1               VARCHAR(100),                       -- 속성1
    ATTR2               VARCHAR(100),                       -- 속성2
    ATTR3               VARCHAR(100),                       -- 속성3
    DESCRIPTION         VARCHAR(500),                       -- 설명
    USE_YN              CHAR(1)         DEFAULT 'Y',
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N',
    PRIMARY KEY (CODE_GROUP_ID, CODE_CD),
    FOREIGN KEY (CODE_GROUP_ID) REFERENCES MST_COMMON_CODE_GROUP(CODE_GROUP_ID)
);

COMMENT ON TABLE MST_COMMON_CODE_GROUP IS '공통코드그룹';
COMMENT ON TABLE MST_COMMON_CODE IS '공통코드';

-- ----------------------------------------------------------------------------
-- 1.12 HS 코드 (HS Code)
-- ----------------------------------------------------------------------------
CREATE TABLE MST_HS_CODE (
    HS_CODE             VARCHAR(12)     PRIMARY KEY,        -- HS 코드
    HS_CODE_NM          VARCHAR(500)    NOT NULL,           -- 품목명
    HS_CODE_NM_EN       VARCHAR(500),                       -- 품목명(영문)
    PARENT_HS_CODE      VARCHAR(12),                        -- 상위 HS 코드
    LEVEL_NO            INT,                                -- 레벨
    UNIT_CD             VARCHAR(10),                        -- 단위
    TARIFF_RATE         DECIMAL(10,4),                      -- 관세율
    USE_YN              CHAR(1)         DEFAULT 'Y',
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N'
);

COMMENT ON TABLE MST_HS_CODE IS 'HS코드 마스터';

-- ----------------------------------------------------------------------------
-- 1.13 사용자 (User)
-- ----------------------------------------------------------------------------
CREATE TABLE MST_USER (
    USER_ID             BIGINT          PRIMARY KEY AUTO_INCREMENT,
    USER_LOGIN_ID       VARCHAR(50)     UNIQUE NOT NULL,    -- 로그인ID
    USER_NM             VARCHAR(100)    NOT NULL,           -- 사용자명
    USER_NM_EN          VARCHAR(100),                       -- 사용자명(영문)
    PASSWORD_HASH       VARCHAR(256),                       -- 비밀번호(해시)
    EMAIL               VARCHAR(100)    UNIQUE,             -- 이메일
    MOBILE_NO           VARCHAR(30),                        -- 휴대전화
    COMPANY_ID          BIGINT,                             -- 소속회사
    DEPT_NM             VARCHAR(100),                       -- 부서명
    POSITION_NM         VARCHAR(50),                        -- 직위
    USER_TYPE_CD        VARCHAR(10),                        -- 사용자유형 (ADMIN/USER/CUSTOMER)
    STATUS_CD           VARCHAR(10)     DEFAULT 'ACTIVE',   -- 상태
    LAST_LOGIN_DTM      DATETIME,                           -- 최종로그인일시
    PWD_CHANGE_DTM      DATETIME,                           -- 비밀번호변경일시
    USE_YN              CHAR(1)         DEFAULT 'Y',
    CREATED_BY          VARCHAR(50),
    CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UPDATED_BY          VARCHAR(50),
    UPDATED_DTM         DATETIME,
    DEL_YN              CHAR(1)         DEFAULT 'N'
);

COMMENT ON TABLE MST_USER IS '사용자 마스터';

-- ----------------------------------------------------------------------------
-- 인덱스 생성
-- ----------------------------------------------------------------------------
CREATE INDEX IDX_MST_PORT_COUNTRY ON MST_PORT(COUNTRY_CD);
CREATE INDEX IDX_MST_CUSTOMER_TYPE ON MST_CUSTOMER(CUSTOMER_TYPE_CD);
CREATE INDEX IDX_MST_CARRIER_TYPE ON MST_CARRIER(CARRIER_TYPE_CD);
CREATE INDEX IDX_MST_PARTNER_COUNTRY ON MST_PARTNER(COUNTRY_CD);
CREATE INDEX IDX_MST_EXCHANGE_RATE_DT ON MST_EXCHANGE_RATE(RATE_DT);
