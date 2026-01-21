#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
FMS Database Table Creation Script for MariaDB
"""

import pymysql
from pymysql.cursors import DictCursor

# Database connection settings
DB_CONFIG = {
    'host': '211.236.174.220',
    'port': 53306,
    'user': 'user',
    'password': 'P@ssw0rd',
    'database': 'logstic',
    'charset': 'utf8mb4'
}

def get_connection():
    return pymysql.connect(**DB_CONFIG)

def execute_sql(cursor, sql, description=""):
    """Execute SQL and handle errors"""
    try:
        cursor.execute(sql)
        print(f"  [OK] {description}")
        return True
    except Exception as e:
        print(f"  [FAIL] {description}: {e}")
        return False

def create_master_tables(cursor):
    """01. Master Tables (기준정보)"""
    print("\n=== 01. Master Tables (기준정보) ===")

    # 1.1 국가
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS MST_COUNTRY (
            COUNTRY_CD          CHAR(2)         PRIMARY KEY COMMENT 'ISO 3166-1 alpha-2',
            COUNTRY_CD3         CHAR(3)         COMMENT 'ISO 3166-1 alpha-3',
            COUNTRY_NM          VARCHAR(100)    NOT NULL COMMENT '국가명',
            COUNTRY_NM_EN       VARCHAR(100)    COMMENT '국가명(영문)',
            CONTINENT_CD        VARCHAR(10)     COMMENT '대륙코드',
            CURRENCY_CD         CHAR(3)         COMMENT '기본통화',
            USE_YN              CHAR(1)         DEFAULT 'Y' COMMENT '사용여부',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='국가 마스터'
    """, "MST_COUNTRY")

    # 1.2 통화
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS MST_CURRENCY (
            CURRENCY_CD         CHAR(3)         PRIMARY KEY COMMENT 'ISO 4217',
            CURRENCY_NM         VARCHAR(50)     NOT NULL COMMENT '통화명',
            CURRENCY_SYMBOL     VARCHAR(10)     COMMENT '통화기호',
            DECIMAL_PLACES      INT             DEFAULT 2 COMMENT '소수점자리',
            USE_YN              CHAR(1)         DEFAULT 'Y',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='통화 마스터'
    """, "MST_CURRENCY")

    # 1.3 환율
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS MST_EXCHANGE_RATE (
            EXCHANGE_RATE_ID    BIGINT          PRIMARY KEY AUTO_INCREMENT,
            BASE_CURRENCY_CD    CHAR(3)         NOT NULL COMMENT '기준통화',
            TARGET_CURRENCY_CD  CHAR(3)         NOT NULL COMMENT '대상통화',
            RATE_DT             DATE            NOT NULL COMMENT '환율일자',
            EXCHANGE_RATE       DECIMAL(18,6)   NOT NULL COMMENT '환율',
            RATE_TYPE_CD        VARCHAR(10)     DEFAULT 'MID' COMMENT '환율유형',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            UNIQUE KEY UK_EXCHANGE_RATE (BASE_CURRENCY_CD, TARGET_CURRENCY_CD, RATE_DT, RATE_TYPE_CD),
            INDEX IDX_RATE_DT (RATE_DT)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='환율 마스터'
    """, "MST_EXCHANGE_RATE")

    # 1.4 항구/공항
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS MST_PORT (
            PORT_CD             VARCHAR(10)     PRIMARY KEY COMMENT 'UN/LOCODE',
            PORT_NM             VARCHAR(100)    NOT NULL COMMENT '항구명',
            PORT_NM_EN          VARCHAR(100)    COMMENT '항구명(영문)',
            COUNTRY_CD          CHAR(2)         NOT NULL COMMENT '국가코드',
            PORT_TYPE_CD        VARCHAR(10)     COMMENT '항구유형 (SEA/AIR/RAIL/ROAD)',
            TIMEZONE            VARCHAR(50)     COMMENT '타임존',
            LATITUDE            DECIMAL(10,7)   COMMENT '위도',
            LONGITUDE           DECIMAL(10,7)   COMMENT '경도',
            USE_YN              CHAR(1)         DEFAULT 'Y',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_PORT_COUNTRY (COUNTRY_CD)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='항구/공항 마스터'
    """, "MST_PORT")

    # 1.5 회사
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS MST_COMPANY (
            COMPANY_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
            COMPANY_CD          VARCHAR(20)     UNIQUE NOT NULL COMMENT '회사코드',
            COMPANY_NM          VARCHAR(200)    NOT NULL COMMENT '회사명',
            COMPANY_NM_EN       VARCHAR(200)    COMMENT '회사명(영문)',
            BIZ_REG_NO          VARCHAR(20)     COMMENT '사업자등록번호',
            CORP_REG_NO         VARCHAR(20)     COMMENT '법인등록번호',
            CEO_NM              VARCHAR(100)    COMMENT '대표자명',
            BIZ_TYPE            VARCHAR(100)    COMMENT '업태',
            BIZ_ITEM            VARCHAR(200)    COMMENT '업종',
            COUNTRY_CD          CHAR(2)         COMMENT '국가코드',
            ADDR                VARCHAR(500)    COMMENT '주소',
            ADDR_EN             VARCHAR(500)    COMMENT '주소(영문)',
            TEL_NO              VARCHAR(30)     COMMENT '전화번호',
            FAX_NO              VARCHAR(30)     COMMENT '팩스번호',
            EMAIL               VARCHAR(100)    COMMENT '이메일',
            HOMEPAGE_URL        VARCHAR(200)    COMMENT '홈페이지',
            USE_YN              CHAR(1)         DEFAULT 'Y',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='회사(자사) 마스터'
    """, "MST_COMPANY")

    # 1.6 화주
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS MST_CUSTOMER (
            CUSTOMER_ID         BIGINT          PRIMARY KEY AUTO_INCREMENT,
            CUSTOMER_CD         VARCHAR(20)     UNIQUE NOT NULL COMMENT '화주코드',
            CUSTOMER_NM         VARCHAR(200)    NOT NULL COMMENT '화주명',
            CUSTOMER_NM_EN      VARCHAR(200)    COMMENT '화주명(영문)',
            CUSTOMER_TYPE_CD    VARCHAR(10)     COMMENT '화주유형 (SHIPPER/CONSIGNEE/BOTH)',
            BIZ_REG_NO          VARCHAR(20)     COMMENT '사업자등록번호',
            CEO_NM              VARCHAR(100)    COMMENT '대표자명',
            COUNTRY_CD          CHAR(2)         COMMENT '국가코드',
            ADDR                VARCHAR(500)    COMMENT '주소',
            ADDR_EN             VARCHAR(500)    COMMENT '주소(영문)',
            ZIP_CD              VARCHAR(10)     COMMENT '우편번호',
            TEL_NO              VARCHAR(30)     COMMENT '전화번호',
            FAX_NO              VARCHAR(30)     COMMENT '팩스번호',
            EMAIL               VARCHAR(100)    COMMENT '이메일',
            CONTACT_NM          VARCHAR(100)    COMMENT '담당자명',
            CONTACT_TEL         VARCHAR(30)     COMMENT '담당자연락처',
            CREDIT_LIMIT_AMT    DECIMAL(18,2)   COMMENT '신용한도',
            CURRENCY_CD         CHAR(3)         COMMENT '기본통화',
            PAYMENT_TERM_CD     VARCHAR(10)     COMMENT '결제조건',
            SALES_MANAGER_ID    BIGINT          COMMENT '담당영업사원',
            STATUS_CD           VARCHAR(10)     DEFAULT 'ACTIVE' COMMENT '상태',
            USE_YN              CHAR(1)         DEFAULT 'Y',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_CUSTOMER_TYPE (CUSTOMER_TYPE_CD)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='화주 마스터'
    """, "MST_CUSTOMER")

    # 1.7 화주 연락처
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS MST_CUSTOMER_CONTACT (
            CONTACT_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
            CUSTOMER_ID         BIGINT          NOT NULL,
            CONTACT_NM          VARCHAR(100)    NOT NULL COMMENT '담당자명',
            DEPT_NM             VARCHAR(100)    COMMENT '부서명',
            POSITION_NM         VARCHAR(50)     COMMENT '직위',
            TEL_NO              VARCHAR(30)     COMMENT '전화번호',
            MOBILE_NO           VARCHAR(30)     COMMENT '휴대전화',
            EMAIL               VARCHAR(100)    COMMENT '이메일',
            IS_PRIMARY          CHAR(1)         DEFAULT 'N' COMMENT '주담당자여부',
            USE_YN              CHAR(1)         DEFAULT 'Y',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_CONTACT_CUSTOMER (CUSTOMER_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='화주 연락처'
    """, "MST_CUSTOMER_CONTACT")

    # 1.8 실행사(선사/항공사)
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS MST_CARRIER (
            CARRIER_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
            CARRIER_CD          VARCHAR(20)     UNIQUE NOT NULL COMMENT '실행사코드',
            CARRIER_NM          VARCHAR(200)    NOT NULL COMMENT '실행사명',
            CARRIER_NM_EN       VARCHAR(200)    COMMENT '실행사명(영문)',
            CARRIER_TYPE_CD     VARCHAR(10)     NOT NULL COMMENT '유형 (OCEAN/AIR)',
            SCAC_CD             VARCHAR(4)      COMMENT 'SCAC 코드 (해상)',
            IATA_CD             VARCHAR(3)      COMMENT 'IATA 코드 (항공)',
            ICAO_CD             VARCHAR(4)      COMMENT 'ICAO 코드 (항공)',
            COUNTRY_CD          CHAR(2)         COMMENT '국가코드',
            ADDR                VARCHAR(500)    COMMENT '주소',
            TEL_NO              VARCHAR(30)     COMMENT '전화번호',
            FAX_NO              VARCHAR(30)     COMMENT '팩스번호',
            EMAIL               VARCHAR(100)    COMMENT '이메일',
            WEBSITE_URL         VARCHAR(200)    COMMENT '웹사이트',
            TRACKING_URL        VARCHAR(500)    COMMENT 'Tracking URL 패턴',
            EDI_CAPABLE_YN      CHAR(1)         DEFAULT 'N' COMMENT 'EDI 연동가능여부',
            USE_YN              CHAR(1)         DEFAULT 'Y',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_CARRIER_TYPE (CARRIER_TYPE_CD)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='실행사(선사/항공사) 마스터'
    """, "MST_CARRIER")

    # 1.9 운송사
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS MST_TRUCKER (
            TRUCKER_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
            TRUCKER_CD          VARCHAR(20)     UNIQUE NOT NULL COMMENT '운송사코드',
            TRUCKER_NM          VARCHAR(200)    NOT NULL COMMENT '운송사명',
            TRUCKER_NM_EN       VARCHAR(200)    COMMENT '운송사명(영문)',
            BIZ_REG_NO          VARCHAR(20)     COMMENT '사업자등록번호',
            CEO_NM              VARCHAR(100)    COMMENT '대표자명',
            COUNTRY_CD          CHAR(2)         COMMENT '국가코드',
            ADDR                VARCHAR(500)    COMMENT '주소',
            TEL_NO              VARCHAR(30)     COMMENT '전화번호',
            FAX_NO              VARCHAR(30)     COMMENT '팩스번호',
            EMAIL               VARCHAR(100)    COMMENT '이메일',
            CONTACT_NM          VARCHAR(100)    COMMENT '담당자명',
            CONTACT_TEL         VARCHAR(30)     COMMENT '담당자연락처',
            SERVICE_AREA        VARCHAR(500)    COMMENT '서비스지역',
            VEHICLE_CNT         INT             COMMENT '보유차량수',
            USE_YN              CHAR(1)         DEFAULT 'Y',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='운송사 마스터'
    """, "MST_TRUCKER")

    # 1.10 해외파트너
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS MST_PARTNER (
            PARTNER_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
            PARTNER_CD          VARCHAR(20)     UNIQUE NOT NULL COMMENT '파트너코드',
            PARTNER_NM          VARCHAR(200)    NOT NULL COMMENT '파트너명',
            PARTNER_NM_EN       VARCHAR(200)    COMMENT '파트너명(영문)',
            PARTNER_TYPE_CD     VARCHAR(10)     COMMENT '유형 (AGENT/FORWARDER/NVOCC)',
            COUNTRY_CD          CHAR(2)         NOT NULL COMMENT '국가코드',
            CITY_NM             VARCHAR(100)    COMMENT '도시명',
            ADDR                VARCHAR(500)    COMMENT '주소',
            TEL_NO              VARCHAR(30)     COMMENT '전화번호',
            FAX_NO              VARCHAR(30)     COMMENT '팩스번호',
            EMAIL               VARCHAR(100)    COMMENT '이메일',
            CONTACT_NM          VARCHAR(100)    COMMENT '담당자명',
            CONTACT_TEL         VARCHAR(30)     COMMENT '담당자연락처',
            IATA_CD             VARCHAR(10)     COMMENT 'IATA 코드',
            SERVICE_TYPE_CD     VARCHAR(20)     COMMENT '서비스유형 (SEA/AIR/BOTH)',
            CONTRACT_START_DT   DATE            COMMENT '계약시작일',
            CONTRACT_END_DT     DATE            COMMENT '계약종료일',
            CREDIT_LIMIT_AMT    DECIMAL(18,2)   COMMENT '신용한도',
            CURRENCY_CD         CHAR(3)         COMMENT '기본통화',
            USE_YN              CHAR(1)         DEFAULT 'Y',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_PARTNER_COUNTRY (COUNTRY_CD)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='해외파트너 마스터'
    """, "MST_PARTNER")

    # 1.11 관세사
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS MST_CUSTOMS_BROKER (
            BROKER_ID           BIGINT          PRIMARY KEY AUTO_INCREMENT,
            BROKER_CD           VARCHAR(20)     UNIQUE NOT NULL COMMENT '관세사코드',
            BROKER_NM           VARCHAR(200)    NOT NULL COMMENT '관세사명',
            LICENSE_NO          VARCHAR(50)     COMMENT '관세사등록번호',
            BIZ_REG_NO          VARCHAR(20)     COMMENT '사업자등록번호',
            CEO_NM              VARCHAR(100)    COMMENT '대표자명',
            COUNTRY_CD          CHAR(2)         COMMENT '국가코드',
            ADDR                VARCHAR(500)    COMMENT '주소',
            TEL_NO              VARCHAR(30)     COMMENT '전화번호',
            FAX_NO              VARCHAR(30)     COMMENT '팩스번호',
            EMAIL               VARCHAR(100)    COMMENT '이메일',
            CONTACT_NM          VARCHAR(100)    COMMENT '담당자명',
            EDI_ID              VARCHAR(50)     COMMENT 'EDI 식별자',
            USE_YN              CHAR(1)         DEFAULT 'Y',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='관세사 마스터'
    """, "MST_CUSTOMS_BROKER")

    # 1.12 공통코드그룹
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS MST_COMMON_CODE_GROUP (
            CODE_GROUP_ID       VARCHAR(30)     PRIMARY KEY COMMENT '코드그룹ID',
            CODE_GROUP_NM       VARCHAR(100)    NOT NULL COMMENT '코드그룹명',
            DESCRIPTION         VARCHAR(500)    COMMENT '설명',
            USE_YN              CHAR(1)         DEFAULT 'Y',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='공통코드그룹'
    """, "MST_COMMON_CODE_GROUP")

    # 1.13 공통코드
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS MST_COMMON_CODE (
            CODE_GROUP_ID       VARCHAR(30)     NOT NULL COMMENT '코드그룹ID',
            CODE_CD             VARCHAR(30)     NOT NULL COMMENT '코드',
            CODE_NM             VARCHAR(100)    NOT NULL COMMENT '코드명',
            CODE_NM_EN          VARCHAR(100)    COMMENT '코드명(영문)',
            SORT_ORDER          INT             DEFAULT 0 COMMENT '정렬순서',
            ATTR1               VARCHAR(100)    COMMENT '속성1',
            ATTR2               VARCHAR(100)    COMMENT '속성2',
            ATTR3               VARCHAR(100)    COMMENT '속성3',
            DESCRIPTION         VARCHAR(500)    COMMENT '설명',
            USE_YN              CHAR(1)         DEFAULT 'Y',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            PRIMARY KEY (CODE_GROUP_ID, CODE_CD)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='공통코드'
    """, "MST_COMMON_CODE")

    # 1.14 HS코드
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS MST_HS_CODE (
            HS_CODE             VARCHAR(12)     PRIMARY KEY COMMENT 'HS 코드',
            HS_CODE_NM          VARCHAR(500)    NOT NULL COMMENT '품목명',
            HS_CODE_NM_EN       VARCHAR(500)    COMMENT '품목명(영문)',
            PARENT_HS_CODE      VARCHAR(12)     COMMENT '상위 HS 코드',
            LEVEL_NO            INT             COMMENT '레벨',
            UNIT_CD             VARCHAR(10)     COMMENT '단위',
            TARIFF_RATE         DECIMAL(10,4)   COMMENT '관세율',
            USE_YN              CHAR(1)         DEFAULT 'Y',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='HS코드 마스터'
    """, "MST_HS_CODE")

    # 1.15 사용자
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS MST_USER (
            USER_ID             BIGINT          PRIMARY KEY AUTO_INCREMENT,
            USER_LOGIN_ID       VARCHAR(50)     UNIQUE NOT NULL COMMENT '로그인ID',
            USER_NM             VARCHAR(100)    NOT NULL COMMENT '사용자명',
            USER_NM_EN          VARCHAR(100)    COMMENT '사용자명(영문)',
            PASSWORD_HASH       VARCHAR(256)    COMMENT '비밀번호(해시)',
            EMAIL               VARCHAR(100)    UNIQUE COMMENT '이메일',
            MOBILE_NO           VARCHAR(30)     COMMENT '휴대전화',
            COMPANY_ID          BIGINT          COMMENT '소속회사',
            DEPT_NM             VARCHAR(100)    COMMENT '부서명',
            POSITION_NM         VARCHAR(50)     COMMENT '직위',
            USER_TYPE_CD        VARCHAR(10)     COMMENT '사용자유형',
            STATUS_CD           VARCHAR(10)     DEFAULT 'ACTIVE' COMMENT '상태',
            LAST_LOGIN_DTM      DATETIME        COMMENT '최종로그인일시',
            PWD_CHANGE_DTM      DATETIME        COMMENT '비밀번호변경일시',
            USE_YN              CHAR(1)         DEFAULT 'Y',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='사용자 마스터'
    """, "MST_USER")

def create_schedule_tables(cursor):
    """02. Schedule Tables (스케줄)"""
    print("\n=== 02. Schedule Tables (스케줄) ===")

    # 2.1 항차
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS SCH_VOYAGE (
            VOYAGE_ID           BIGINT          PRIMARY KEY AUTO_INCREMENT,
            CARRIER_ID          BIGINT          NOT NULL COMMENT '선사',
            VESSEL_NM           VARCHAR(100)    NOT NULL COMMENT '선명',
            VOYAGE_NO           VARCHAR(30)     NOT NULL COMMENT '항차번호',
            SERVICE_ROUTE_CD    VARCHAR(20)     COMMENT '서비스루트코드',
            SERVICE_ROUTE_NM    VARCHAR(100)    COMMENT '서비스루트명',
            DIRECTION_CD        VARCHAR(10)     COMMENT '방향 (E/W/N/S)',
            STATUS_CD           VARCHAR(10)     DEFAULT 'SCHEDULED' COMMENT '상태',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_VOYAGE_CARRIER (CARRIER_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='해상 항차'
    """, "SCH_VOYAGE")

    # 2.2 해상스케줄
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS SCH_OCEAN_SCHEDULE (
            OCEAN_SCHEDULE_ID   BIGINT          PRIMARY KEY AUTO_INCREMENT,
            VOYAGE_ID           BIGINT          NOT NULL COMMENT '항차',
            CARRIER_ID          BIGINT          NOT NULL COMMENT '선사',
            VESSEL_NM           VARCHAR(100)    COMMENT '선명',
            VOYAGE_NO           VARCHAR(30)     COMMENT '항차번호',
            POL_PORT_CD         VARCHAR(10)     NOT NULL COMMENT '선적항',
            POL_TERMINAL_NM     VARCHAR(100)    COMMENT '선적터미널',
            ETD_DTM             DATETIME        COMMENT '출항예정일시',
            ATD_DTM             DATETIME        COMMENT '실제출항일시',
            CUT_OFF_DTM         DATETIME        COMMENT '서류마감',
            CARGO_CUT_OFF_DTM   DATETIME        COMMENT '화물마감',
            POD_PORT_CD         VARCHAR(10)     NOT NULL COMMENT '양하항',
            POD_TERMINAL_NM     VARCHAR(100)    COMMENT '양하터미널',
            ETA_DTM             DATETIME        COMMENT '도착예정일시',
            ATA_DTM             DATETIME        COMMENT '실제도착일시',
            TS_YN               CHAR(1)         DEFAULT 'N' COMMENT '환적여부',
            TS_PORT_CD          VARCHAR(10)     COMMENT '환적항',
            TRANSIT_DAYS        INT             COMMENT '운항일수',
            FREQUENCY_CD        VARCHAR(10)     COMMENT '운항주기',
            STATUS_CD           VARCHAR(10)     DEFAULT 'SCHEDULED' COMMENT '상태',
            REMARKS             VARCHAR(1000)   COMMENT '비고',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_OCEAN_SCH_ETD (ETD_DTM),
            INDEX IDX_OCEAN_SCH_POL (POL_PORT_CD),
            INDEX IDX_OCEAN_SCH_POD (POD_PORT_CD)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='해상 스케줄'
    """, "SCH_OCEAN_SCHEDULE")

    # 2.3 해상 SPACE
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS SCH_OCEAN_SPACE (
            SPACE_ID            BIGINT          PRIMARY KEY AUTO_INCREMENT,
            OCEAN_SCHEDULE_ID   BIGINT          NOT NULL COMMENT '스케줄',
            CARRIER_ID          BIGINT          NOT NULL COMMENT '선사',
            CNTR_TYPE_CD        VARCHAR(10)     NOT NULL COMMENT '컨테이너유형',
            TOTAL_SPACE_QTY     INT             DEFAULT 0 COMMENT '총 할당량',
            BOOKED_QTY          INT             DEFAULT 0 COMMENT '예약수량',
            AVAILABLE_QTY       INT             DEFAULT 0 COMMENT '가용수량',
            ALLOCATION_TYPE_CD  VARCHAR(10)     COMMENT '할당유형',
            PRIORITY_NO         INT             COMMENT '우선순위',
            VALID_FROM_DT       DATE            COMMENT '유효시작일',
            VALID_TO_DT         DATE            COMMENT '유효종료일',
            STATUS_CD           VARCHAR(10)     DEFAULT 'ACTIVE' COMMENT '상태',
            REMARKS             VARCHAR(500)    COMMENT '비고',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='해상 SPACE 관리'
    """, "SCH_OCEAN_SPACE")

    # 2.4 SPACE 분배
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS SCH_OCEAN_SPACE_ALLOC (
            SPACE_ALLOC_ID      BIGINT          PRIMARY KEY AUTO_INCREMENT,
            SPACE_ID            BIGINT          NOT NULL COMMENT 'SPACE',
            CUSTOMER_ID         BIGINT          NOT NULL COMMENT '화주',
            ALLOC_QTY           INT             NOT NULL COMMENT '할당수량',
            USED_QTY            INT             DEFAULT 0 COMMENT '사용수량',
            VALID_FROM_DT       DATE            COMMENT '유효시작일',
            VALID_TO_DT         DATE            COMMENT '유효종료일',
            STATUS_CD           VARCHAR(10)     DEFAULT 'ACTIVE' COMMENT '상태',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='해상 SPACE 화주별 분배'
    """, "SCH_OCEAN_SPACE_ALLOC")

    # 2.5 항공스케줄
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS SCH_AIR_SCHEDULE (
            AIR_SCHEDULE_ID     BIGINT          PRIMARY KEY AUTO_INCREMENT,
            CARRIER_ID          BIGINT          NOT NULL COMMENT '항공사',
            FLIGHT_NO           VARCHAR(10)     NOT NULL COMMENT '편명',
            ORIGIN_PORT_CD      VARCHAR(10)     NOT NULL COMMENT '출발공항',
            ORIGIN_TERMINAL     VARCHAR(20)     COMMENT '출발터미널',
            ETD_DTM             DATETIME        COMMENT '출발예정일시',
            ATD_DTM             DATETIME        COMMENT '실제출발일시',
            DEST_PORT_CD        VARCHAR(10)     NOT NULL COMMENT '도착공항',
            DEST_TERMINAL       VARCHAR(20)     COMMENT '도착터미널',
            ETA_DTM             DATETIME        COMMENT '도착예정일시',
            ATA_DTM             DATETIME        COMMENT '실제도착일시',
            TS_YN               CHAR(1)         DEFAULT 'N' COMMENT '환적여부',
            TS_PORT_CD          VARCHAR(10)     COMMENT '환적공항',
            AIRCRAFT_TYPE       VARCHAR(20)     COMMENT '기종',
            FLIGHT_DAYS         VARCHAR(20)     COMMENT '운항요일',
            TRANSIT_HOURS       DECIMAL(5,2)    COMMENT '운항시간',
            FREQUENCY_CD        VARCHAR(10)     COMMENT '운항주기',
            MAX_WEIGHT_KG       DECIMAL(10,2)   COMMENT '최대중량(kg)',
            AVAILABLE_WEIGHT_KG DECIMAL(10,2)   COMMENT '가용중량(kg)',
            STATUS_CD           VARCHAR(10)     DEFAULT 'SCHEDULED' COMMENT '상태',
            REMARKS             VARCHAR(1000)   COMMENT '비고',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_AIR_SCH_ETD (ETD_DTM),
            INDEX IDX_AIR_SCH_ORIGIN (ORIGIN_PORT_CD),
            INDEX IDX_AIR_SCH_DEST (DEST_PORT_CD)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='항공 스케줄'
    """, "SCH_AIR_SCHEDULE")

    # 2.6 MAWB 재고
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS SCH_MAWB_STOCK (
            MAWB_STOCK_ID       BIGINT          PRIMARY KEY AUTO_INCREMENT,
            CARRIER_ID          BIGINT          NOT NULL COMMENT '항공사',
            AIRLINE_PREFIX      CHAR(3)         NOT NULL COMMENT '항공사 Prefix',
            SERIAL_START        VARCHAR(8)      NOT NULL COMMENT '시작번호',
            SERIAL_END          VARCHAR(8)      NOT NULL COMMENT '종료번호',
            TOTAL_QTY           INT             NOT NULL COMMENT '총 수량',
            USED_QTY            INT             DEFAULT 0 COMMENT '사용수량',
            AVAILABLE_QTY       INT             COMMENT '가용수량',
            ALLOC_DT            DATE            COMMENT '배정일자',
            EXPIRE_DT           DATE            COMMENT '만료일자',
            STATUS_CD           VARCHAR(10)     DEFAULT 'ACTIVE' COMMENT '상태',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_MAWB_STOCK_CARRIER (CARRIER_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='MAWB 번호 재고 (IATA Stock)'
    """, "SCH_MAWB_STOCK")

    # 2.7 MAWB 상세
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS SCH_MAWB_STOCK_DTL (
            MAWB_STOCK_DTL_ID   BIGINT          PRIMARY KEY AUTO_INCREMENT,
            MAWB_STOCK_ID       BIGINT          NOT NULL COMMENT 'MAWB 재고',
            MAWB_NO             VARCHAR(11)     UNIQUE NOT NULL COMMENT 'MAWB 번호',
            STATUS_CD           VARCHAR(10)     DEFAULT 'AVAILABLE' COMMENT '상태',
            USED_DTM            DATETIME        COMMENT '사용일시',
            USED_BY             VARCHAR(50)     COMMENT '사용자',
            SHIPMENT_ID         BIGINT          COMMENT '연결된 Shipment',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='MAWB 번호 상세'
    """, "SCH_MAWB_STOCK_DTL")

def create_order_tables(cursor):
    """03. Order & Booking Tables (오더/부킹)"""
    print("\n=== 03. Order & Booking Tables (오더/부킹) ===")

    # 3.1 Shipment (핵심 엔티티)
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS ORD_SHIPMENT (
            SHIPMENT_ID         BIGINT          PRIMARY KEY AUTO_INCREMENT,
            SHIPMENT_NO         VARCHAR(30)     UNIQUE NOT NULL COMMENT '선적번호',
            TRANSPORT_MODE_CD   VARCHAR(10)     NOT NULL COMMENT '운송모드 (SEA/AIR)',
            TRADE_TYPE_CD       VARCHAR(10)     NOT NULL COMMENT '수출입구분',
            SERVICE_TYPE_CD     VARCHAR(10)     COMMENT '서비스유형',
            INCOTERMS_CD        VARCHAR(10)     COMMENT '인코텀즈',
            CUSTOMER_ID         BIGINT          NOT NULL COMMENT '화주',
            SHIPPER_ID          BIGINT          COMMENT '발송인',
            CONSIGNEE_ID        BIGINT          COMMENT '수하인',
            NOTIFY_PARTY_ID     BIGINT          COMMENT '통지처',
            CARRIER_ID          BIGINT          COMMENT '선사/항공사',
            BOOKING_AGENT_ID    BIGINT          COMMENT '부킹대리점',
            PARTNER_ID          BIGINT          COMMENT '해외파트너',
            ORIGIN_COUNTRY_CD   CHAR(2)         COMMENT '출발국가',
            ORIGIN_PORT_CD      VARCHAR(10)     COMMENT '출발항/공항',
            ORIGIN_ADDR         VARCHAR(500)    COMMENT '출발지주소',
            DEST_COUNTRY_CD     CHAR(2)         COMMENT '도착국가',
            DEST_PORT_CD        VARCHAR(10)     COMMENT '도착항/공항',
            FINAL_DEST_CD       VARCHAR(10)     COMMENT '최종목적지',
            DEST_ADDR           VARCHAR(500)    COMMENT '도착지주소',
            OCEAN_SCHEDULE_ID   BIGINT          COMMENT '해상스케줄',
            AIR_SCHEDULE_ID     BIGINT          COMMENT '항공스케줄',
            CARGO_READY_DT      DATE            COMMENT '화물준비일',
            ETD_DT              DATE            COMMENT '출발예정일',
            ATD_DT              DATE            COMMENT '실제출발일',
            ETA_DT              DATE            COMMENT '도착예정일',
            ATA_DT              DATE            COMMENT '실제도착일',
            TOTAL_PKG_QTY       INT             DEFAULT 0 COMMENT '총 포장수량',
            PKG_TYPE_CD         VARCHAR(10)     COMMENT '포장유형',
            GROSS_WEIGHT_KG     DECIMAL(12,3)   DEFAULT 0 COMMENT '총중량 (kg)',
            VOLUME_CBM          DECIMAL(12,4)   DEFAULT 0 COMMENT '총부피 (CBM)',
            CHARGEABLE_WEIGHT   DECIMAL(12,3)   DEFAULT 0 COMMENT '청구중량',
            DECLARED_VALUE_AMT  DECIMAL(18,2)   COMMENT '신고가액',
            DECLARED_VALUE_CURR CHAR(3)         COMMENT '신고가액통화',
            INSURANCE_AMT       DECIMAL(18,2)   COMMENT '보험금액',
            INSURANCE_CURR      CHAR(3)         COMMENT '보험통화',
            FREIGHT_TERM_CD     VARCHAR(10)     COMMENT '운임조건',
            PAYMENT_TERM_CD     VARCHAR(10)     COMMENT '결제조건',
            STATUS_CD           VARCHAR(20)     DEFAULT 'DRAFT' COMMENT '상태',
            CUSTOMS_STATUS_CD   VARCHAR(20)     COMMENT '통관상태',
            CUSTOMER_REF_NO     VARCHAR(50)     COMMENT '화주참조번호',
            PO_NO               VARCHAR(50)     COMMENT 'PO 번호',
            SO_NO               VARCHAR(50)     COMMENT 'SO 번호',
            REMARKS             VARCHAR(2000)   COMMENT '비고',
            SPECIAL_INST        VARCHAR(2000)   COMMENT '특별지시사항',
            SALES_MANAGER_ID    BIGINT          COMMENT '담당영업',
            OPS_MANAGER_ID      BIGINT          COMMENT '담당운영',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_SHIPMENT_CUSTOMER (CUSTOMER_ID),
            INDEX IDX_SHIPMENT_CARRIER (CARRIER_ID),
            INDEX IDX_SHIPMENT_ETD (ETD_DT),
            INDEX IDX_SHIPMENT_STATUS (STATUS_CD)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='선적건 (Shipment)'
    """, "ORD_SHIPMENT")

    # 3.2 화주오더
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS ORD_CUSTOMER_ORDER (
            ORDER_ID            BIGINT          PRIMARY KEY AUTO_INCREMENT,
            ORDER_NO            VARCHAR(30)     UNIQUE NOT NULL COMMENT '오더번호',
            ORDER_TYPE_CD       VARCHAR(10)     NOT NULL COMMENT '오더유형',
            SHIPMENT_ID         BIGINT          COMMENT '선적건',
            CUSTOMER_ID         BIGINT          NOT NULL COMMENT '화주',
            TRANSPORT_MODE_CD   VARCHAR(10)     NOT NULL COMMENT '운송모드',
            TRADE_TYPE_CD       VARCHAR(10)     NOT NULL COMMENT '수출입구분',
            SERVICE_TYPE_CD     VARCHAR(10)     COMMENT '서비스유형',
            SHIPPER_NM          VARCHAR(200)    COMMENT '발송인명',
            SHIPPER_ADDR        VARCHAR(500)    COMMENT '발송인주소',
            CONSIGNEE_NM        VARCHAR(200)    COMMENT '수하인명',
            CONSIGNEE_ADDR      VARCHAR(500)    COMMENT '수하인주소',
            ORIGIN_PORT_CD      VARCHAR(10)     COMMENT '출발항',
            DEST_PORT_CD        VARCHAR(10)     COMMENT '도착항',
            FINAL_DEST          VARCHAR(100)    COMMENT '최종목적지',
            COMMODITY_DESC      VARCHAR(500)    COMMENT '품명',
            HS_CODE             VARCHAR(12)     COMMENT 'HS코드',
            TOTAL_PKG_QTY       INT             COMMENT '총수량',
            PKG_TYPE_CD         VARCHAR(10)     COMMENT '포장유형',
            GROSS_WEIGHT_KG     DECIMAL(12,3)   COMMENT '총중량',
            VOLUME_CBM          DECIMAL(12,4)   COMMENT '총부피',
            CARGO_READY_DT      DATE            COMMENT '화물준비일',
            REQUESTED_ETD_DT    DATE            COMMENT '희망출발일',
            REQUESTED_ETA_DT    DATE            COMMENT '희망도착일',
            STATUS_CD           VARCHAR(20)     DEFAULT 'RECEIVED' COMMENT '상태',
            RECEIPT_DTM         DATETIME        COMMENT '접수일시',
            CONFIRM_DTM         DATETIME        COMMENT '확정일시',
            CUSTOMER_REF_NO     VARCHAR(50)     COMMENT '화주참조번호',
            PO_NO               VARCHAR(50)     COMMENT 'PO번호',
            REMARKS             VARCHAR(2000)   COMMENT '비고',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_ORDER_CUSTOMER (CUSTOMER_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='화주 오더'
    """, "ORD_CUSTOMER_ORDER")

    # 3.3 오더 화물상세
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS ORD_CUSTOMER_ORDER_CARGO (
            ORDER_CARGO_ID      BIGINT          PRIMARY KEY AUTO_INCREMENT,
            ORDER_ID            BIGINT          NOT NULL COMMENT '오더',
            LINE_NO             INT             NOT NULL COMMENT '라인번호',
            COMMODITY_DESC      VARCHAR(500)    COMMENT '품명',
            HS_CODE             VARCHAR(12)     COMMENT 'HS코드',
            PKG_QTY             INT             COMMENT '수량',
            PKG_TYPE_CD         VARCHAR(10)     COMMENT '포장유형',
            GROSS_WEIGHT_KG     DECIMAL(12,3)   COMMENT '총중량',
            NET_WEIGHT_KG       DECIMAL(12,3)   COMMENT '순중량',
            VOLUME_CBM          DECIMAL(12,4)   COMMENT '부피',
            UNIT_PRICE_AMT      DECIMAL(18,4)   COMMENT '단가',
            TOTAL_AMT           DECIMAL(18,2)   COMMENT '금액',
            CURRENCY_CD         CHAR(3)         COMMENT '통화',
            COUNTRY_OF_ORIGIN   CHAR(2)         COMMENT '원산지',
            MARKS_NOS           VARCHAR(500)    COMMENT '화인',
            REMARKS             VARCHAR(500)    COMMENT '비고',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='화주 오더 화물 상세'
    """, "ORD_CUSTOMER_ORDER_CARGO")

    # 3.4 해상부킹
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS ORD_OCEAN_BOOKING (
            BOOKING_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
            BOOKING_NO          VARCHAR(30)     UNIQUE NOT NULL COMMENT '부킹번호',
            CARRIER_BOOKING_NO  VARCHAR(30)     COMMENT '선사부킹번호',
            SHIPMENT_ID         BIGINT          COMMENT '선적건',
            ORDER_ID            BIGINT          COMMENT '화주오더',
            OCEAN_SCHEDULE_ID   BIGINT          COMMENT '스케줄',
            CARRIER_ID          BIGINT          NOT NULL COMMENT '선사',
            VESSEL_NM           VARCHAR(100)    COMMENT '선명',
            VOYAGE_NO           VARCHAR(30)     COMMENT '항차',
            POL_PORT_CD         VARCHAR(10)     NOT NULL COMMENT '선적항',
            POD_PORT_CD         VARCHAR(10)     NOT NULL COMMENT '양하항',
            FINAL_DEST          VARCHAR(100)    COMMENT '최종목적지',
            ETD_DT              DATE            COMMENT '출항예정일',
            ETA_DT              DATE            COMMENT '도착예정일',
            CUT_OFF_DTM         DATETIME        COMMENT '서류마감',
            CARGO_CUT_OFF_DTM   DATETIME        COMMENT '화물마감',
            CNTR_20GP_QTY       INT             DEFAULT 0 COMMENT '20GP 수량',
            CNTR_40GP_QTY       INT             DEFAULT 0 COMMENT '40GP 수량',
            CNTR_40HC_QTY       INT             DEFAULT 0 COMMENT '40HC 수량',
            CNTR_45HC_QTY       INT             DEFAULT 0 COMMENT '45HC 수량',
            CNTR_REEFER_QTY     INT             DEFAULT 0 COMMENT '냉동 수량',
            CNTR_OT_QTY         INT             DEFAULT 0 COMMENT 'OT 수량',
            CNTR_FR_QTY         INT             DEFAULT 0 COMMENT 'FR 수량',
            TOTAL_CNTR_QTY      INT             DEFAULT 0 COMMENT '총 컨테이너 수',
            COMMODITY_DESC      VARCHAR(500)    COMMENT '품명',
            GROSS_WEIGHT_KG     DECIMAL(12,3)   COMMENT '총중량',
            VOLUME_CBM          DECIMAL(12,4)   COMMENT '총부피',
            STATUS_CD           VARCHAR(20)     DEFAULT 'REQUESTED' COMMENT '상태',
            REQUEST_DTM         DATETIME        COMMENT '요청일시',
            CONFIRM_DTM         DATETIME        COMMENT '확정일시',
            CANCEL_DTM          DATETIME        COMMENT '취소일시',
            CANCEL_REASON       VARCHAR(500)    COMMENT '취소사유',
            FREIGHT_TERM_CD     VARCHAR(10)     COMMENT '운임조건',
            SPECIAL_CARGO_CD    VARCHAR(20)     COMMENT '특수화물유형',
            SPECIAL_INST        VARCHAR(1000)   COMMENT '특별지시사항',
            REMARKS             VARCHAR(2000)   COMMENT '비고',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_OCEAN_BKG_CARRIER (CARRIER_ID),
            INDEX IDX_OCEAN_BKG_SHIPMENT (SHIPMENT_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='해상 부킹'
    """, "ORD_OCEAN_BOOKING")

    # 3.5 부킹 컨테이너 상세
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS ORD_OCEAN_BOOKING_CNTR (
            BOOKING_CNTR_ID     BIGINT          PRIMARY KEY AUTO_INCREMENT,
            BOOKING_ID          BIGINT          NOT NULL COMMENT '부킹',
            LINE_NO             INT             NOT NULL COMMENT '라인번호',
            CNTR_TYPE_CD        VARCHAR(10)     NOT NULL COMMENT '컨테이너유형',
            CNTR_QTY            INT             NOT NULL COMMENT '수량',
            CNTR_SIZE_CD        VARCHAR(5)      COMMENT '사이즈',
            IS_SOC              CHAR(1)         DEFAULT 'N' COMMENT '자가컨테이너여부',
            SPECIAL_TYPE_CD     VARCHAR(20)     COMMENT '특수유형',
            TEMPERATURE         DECIMAL(5,2)    COMMENT '온도',
            HUMIDITY            DECIMAL(5,2)    COMMENT '습도',
            VENTILATION         VARCHAR(20)     COMMENT '환기',
            REMARKS             VARCHAR(500)    COMMENT '비고',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='해상 부킹 컨테이너 상세'
    """, "ORD_OCEAN_BOOKING_CNTR")

    # 3.6 항공부킹
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS ORD_AIR_BOOKING (
            BOOKING_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
            BOOKING_NO          VARCHAR(30)     UNIQUE NOT NULL COMMENT '부킹번호',
            CARRIER_BOOKING_NO  VARCHAR(30)     COMMENT '항공사부킹번호',
            SHIPMENT_ID         BIGINT          COMMENT '선적건',
            ORDER_ID            BIGINT          COMMENT '화주오더',
            AIR_SCHEDULE_ID     BIGINT          COMMENT '스케줄',
            CARRIER_ID          BIGINT          NOT NULL COMMENT '항공사',
            FLIGHT_NO           VARCHAR(10)     COMMENT '편명',
            FLIGHT_DT           DATE            COMMENT '운항일',
            ORIGIN_PORT_CD      VARCHAR(10)     NOT NULL COMMENT '출발공항',
            DEST_PORT_CD        VARCHAR(10)     NOT NULL COMMENT '도착공항',
            FINAL_DEST          VARCHAR(100)    COMMENT '최종목적지',
            ETD_DTM             DATETIME        COMMENT '출발예정일시',
            ETA_DTM             DATETIME        COMMENT '도착예정일시',
            COMMODITY_DESC      VARCHAR(500)    COMMENT '품명',
            PKG_QTY             INT             COMMENT '수량',
            PKG_TYPE_CD         VARCHAR(10)     COMMENT '포장유형',
            GROSS_WEIGHT_KG     DECIMAL(12,3)   COMMENT '총중량',
            VOLUME_WEIGHT_KG    DECIMAL(12,3)   COMMENT '용적중량',
            CHARGEABLE_WEIGHT   DECIMAL(12,3)   COMMENT '청구중량',
            VOLUME_CBM          DECIMAL(12,4)   COMMENT '부피',
            DIMENSIONS          VARCHAR(100)    COMMENT '치수',
            STATUS_CD           VARCHAR(20)     DEFAULT 'REQUESTED' COMMENT '상태',
            REQUEST_DTM         DATETIME        COMMENT '요청일시',
            CONFIRM_DTM         DATETIME        COMMENT '확정일시',
            CANCEL_DTM          DATETIME        COMMENT '취소일시',
            CANCEL_REASON       VARCHAR(500)    COMMENT '취소사유',
            FREIGHT_TERM_CD     VARCHAR(10)     COMMENT '운임조건',
            RATE_CLASS_CD       VARCHAR(10)     COMMENT '요율등급',
            SPECIAL_CARGO_CD    VARCHAR(20)     COMMENT '특수화물',
            SPECIAL_INST        VARCHAR(1000)   COMMENT '특별지시사항',
            REMARKS             VARCHAR(2000)   COMMENT '비고',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_AIR_BKG_CARRIER (CARRIER_ID),
            INDEX IDX_AIR_BKG_SHIPMENT (SHIPMENT_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='항공 부킹'
    """, "ORD_AIR_BOOKING")

    # 3.7 상태이력
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS ORD_SHIPMENT_STATUS_HIST (
            HIST_ID             BIGINT          PRIMARY KEY AUTO_INCREMENT,
            SHIPMENT_ID         BIGINT          NOT NULL COMMENT '선적건',
            STATUS_CD           VARCHAR(20)     NOT NULL COMMENT '상태코드',
            STATUS_NM           VARCHAR(100)    COMMENT '상태명',
            EVENT_DTM           DATETIME        NOT NULL COMMENT '이벤트일시',
            LOCATION_CD         VARCHAR(10)     COMMENT '위치코드',
            LOCATION_NM         VARCHAR(100)    COMMENT '위치명',
            EVENT_DESC          VARCHAR(500)    COMMENT '이벤트설명',
            SOURCE_CD           VARCHAR(20)     COMMENT '출처',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Shipment 상태 이력'
    """, "ORD_SHIPMENT_STATUS_HIST")

    # 3.8 첨부파일
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS ORD_ATTACHMENT (
            ATTACHMENT_ID       BIGINT          PRIMARY KEY AUTO_INCREMENT,
            REF_TYPE_CD         VARCHAR(20)     NOT NULL COMMENT '참조유형',
            REF_ID              BIGINT          NOT NULL COMMENT '참조ID',
            FILE_NM             VARCHAR(200)    NOT NULL COMMENT '파일명',
            FILE_PATH           VARCHAR(500)    NOT NULL COMMENT '파일경로',
            FILE_SIZE           BIGINT          COMMENT '파일크기',
            FILE_TYPE           VARCHAR(50)     COMMENT '파일유형',
            DOC_TYPE_CD         VARCHAR(20)     COMMENT '문서유형',
            DESCRIPTION         VARCHAR(500)    COMMENT '설명',
            UPLOAD_DTM          DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPLOAD_BY           VARCHAR(50),
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_ATTACHMENT_REF (REF_TYPE_CD, REF_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='첨부파일'
    """, "ORD_ATTACHMENT")

def main():
    """Main execution"""
    print("=" * 60)
    print("FMS Database Table Creation")
    print("=" * 60)

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # Set SQL mode
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")

        # Create tables
        create_master_tables(cursor)
        create_schedule_tables(cursor)
        create_order_tables(cursor)

        # Re-enable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

        conn.commit()

        # Show results
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print("\n" + "=" * 60)
        print(f"Total tables created: {len(tables)}")
        print("=" * 60)

    except Exception as e:
        print(f"\nError: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()
