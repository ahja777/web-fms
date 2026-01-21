#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
FMS Database Table Creation Script Part 2 - BL, Shipment, Transport, Customs, Billing
"""

import pymysql

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
    try:
        cursor.execute(sql)
        print(f"  [OK] {description}")
        return True
    except Exception as e:
        print(f"  [FAIL] {description}: {e}")
        return False

def create_bl_tables(cursor):
    """04. B/L & AWB Tables"""
    print("\n=== 04. B/L & AWB Tables ===")

    # Master BL
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS BL_MASTER_BL (
            MBL_ID              BIGINT          PRIMARY KEY AUTO_INCREMENT,
            MBL_NO              VARCHAR(30)     UNIQUE NOT NULL COMMENT 'MBL 번호',
            SHIPMENT_ID         BIGINT          COMMENT '선적건',
            BOOKING_ID          BIGINT          COMMENT '부킹',
            CARRIER_ID          BIGINT          NOT NULL COMMENT '선사',
            VESSEL_NM           VARCHAR(100)    COMMENT '선명',
            VOYAGE_NO           VARCHAR(30)     COMMENT '항차',
            OCEAN_SCHEDULE_ID   BIGINT          COMMENT '스케줄',
            POL_PORT_CD         VARCHAR(10)     NOT NULL COMMENT '선적항',
            POD_PORT_CD         VARCHAR(10)     NOT NULL COMMENT '양하항',
            PLACE_OF_RECEIPT    VARCHAR(100)    COMMENT '수령지',
            PLACE_OF_DELIVERY   VARCHAR(100)    COMMENT '인도지',
            FINAL_DEST          VARCHAR(100)    COMMENT '최종목적지',
            ETD_DT              DATE            COMMENT '출항예정일',
            ATD_DT              DATE            COMMENT '실제출항일',
            ETA_DT              DATE            COMMENT '도착예정일',
            ATA_DT              DATE            COMMENT '실제도착일',
            ON_BOARD_DT         DATE            COMMENT '선적완료일',
            ISSUE_DT            DATE            COMMENT '발행일',
            ISSUE_PLACE         VARCHAR(100)    COMMENT '발행지',
            SHIPPER_NM          VARCHAR(200)    COMMENT '발송인명',
            SHIPPER_ADDR        VARCHAR(500)    COMMENT '발송인주소',
            CONSIGNEE_NM        VARCHAR(200)    COMMENT '수하인명',
            CONSIGNEE_ADDR      VARCHAR(500)    COMMENT '수하인주소',
            NOTIFY_PARTY        VARCHAR(500)    COMMENT '통지처',
            TOTAL_PKG_QTY       INT             COMMENT '총수량',
            PKG_TYPE_CD         VARCHAR(10)     COMMENT '포장유형',
            GROSS_WEIGHT_KG     DECIMAL(12,3)   COMMENT '총중량',
            VOLUME_CBM          DECIMAL(12,4)   COMMENT '총부피',
            COMMODITY_DESC      VARCHAR(1000)   COMMENT '품명',
            MARKS_NOS           VARCHAR(1000)   COMMENT '화인',
            CNTR_COUNT          INT             DEFAULT 0 COMMENT '컨테이너수',
            FREIGHT_TERM_CD     VARCHAR(10)     COMMENT '운임조건',
            FREIGHT_PAYABLE_AT  VARCHAR(100)    COMMENT '운임지급지',
            FREIGHT_AMT         DECIMAL(18,2)   COMMENT '운임금액',
            FREIGHT_CURR        CHAR(3)         COMMENT '운임통화',
            BL_TYPE_CD          VARCHAR(10)     COMMENT 'B/L유형',
            ORIGINAL_BL_COUNT   INT             DEFAULT 3 COMMENT '원본 발행부수',
            MOVEMENT_TYPE_CD    VARCHAR(10)     COMMENT '운송유형',
            STATUS_CD           VARCHAR(20)     DEFAULT 'DRAFT' COMMENT '상태',
            SURRENDER_YN        CHAR(1)         DEFAULT 'N' COMMENT 'Surrender 여부',
            SURRENDER_DTM       DATETIME        COMMENT 'Surrender 일시',
            RELEASE_STATUS_CD   VARCHAR(20)     COMMENT '반출상태',
            REMARKS             VARCHAR(2000)   COMMENT '비고',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_MBL_SHIPMENT (SHIPMENT_ID),
            INDEX IDX_MBL_CARRIER (CARRIER_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Master B/L (해상)'
    """, "BL_MASTER_BL")

    # House BL
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS BL_HOUSE_BL (
            HBL_ID              BIGINT          PRIMARY KEY AUTO_INCREMENT,
            HBL_NO              VARCHAR(30)     UNIQUE NOT NULL COMMENT 'HBL 번호',
            SHIPMENT_ID         BIGINT          NOT NULL COMMENT '선적건',
            MBL_ID              BIGINT          COMMENT 'MBL (Consolidation)',
            CUSTOMER_ID         BIGINT          NOT NULL COMMENT '화주',
            CARRIER_ID          BIGINT          COMMENT '선사',
            VESSEL_NM           VARCHAR(100)    COMMENT '선명',
            VOYAGE_NO           VARCHAR(30)     COMMENT '항차',
            POL_PORT_CD         VARCHAR(10)     NOT NULL COMMENT '선적항',
            POD_PORT_CD         VARCHAR(10)     NOT NULL COMMENT '양하항',
            PLACE_OF_RECEIPT    VARCHAR(100)    COMMENT '수령지',
            PLACE_OF_DELIVERY   VARCHAR(100)    COMMENT '인도지',
            FINAL_DEST          VARCHAR(100)    COMMENT '최종목적지',
            ETD_DT              DATE            COMMENT '출항예정일',
            ATD_DT              DATE            COMMENT '실제출항일',
            ETA_DT              DATE            COMMENT '도착예정일',
            ATA_DT              DATE            COMMENT '실제도착일',
            ON_BOARD_DT         DATE            COMMENT '선적완료일',
            ISSUE_DT            DATE            COMMENT '발행일',
            ISSUE_PLACE         VARCHAR(100)    COMMENT '발행지',
            SHIPPER_ID          BIGINT          COMMENT '발송인',
            SHIPPER_NM          VARCHAR(200)    COMMENT '발송인명',
            SHIPPER_ADDR        VARCHAR(500)    COMMENT '발송인주소',
            SHIPPER_TEL         VARCHAR(50)     COMMENT '발송인전화',
            CONSIGNEE_ID        BIGINT          COMMENT '수하인',
            CONSIGNEE_NM        VARCHAR(200)    COMMENT '수하인명',
            CONSIGNEE_ADDR      VARCHAR(500)    COMMENT '수하인주소',
            CONSIGNEE_TEL       VARCHAR(50)     COMMENT '수하인전화',
            NOTIFY_PARTY        VARCHAR(500)    COMMENT '통지처',
            ALSO_NOTIFY         VARCHAR(500)    COMMENT '추가통지처',
            TOTAL_PKG_QTY       INT             COMMENT '총수량',
            PKG_TYPE_CD         VARCHAR(10)     COMMENT '포장유형',
            GROSS_WEIGHT_KG     DECIMAL(12,3)   COMMENT '총중량',
            NET_WEIGHT_KG       DECIMAL(12,3)   COMMENT '순중량',
            VOLUME_CBM          DECIMAL(12,4)   COMMENT '총부피',
            COMMODITY_DESC      VARCHAR(2000)   COMMENT '품명',
            HS_CODE             VARCHAR(12)     COMMENT 'HS코드',
            MARKS_NOS           VARCHAR(2000)   COMMENT '화인',
            FREIGHT_TERM_CD     VARCHAR(10)     COMMENT '운임조건',
            FREIGHT_PAYABLE_AT  VARCHAR(100)    COMMENT '운임지급지',
            DECLARED_VALUE      DECIMAL(18,2)   COMMENT '신고가액',
            DECLARED_VALUE_CURR CHAR(3)         COMMENT '신고가액통화',
            BL_TYPE_CD          VARCHAR(10)     COMMENT 'B/L유형',
            ORIGINAL_BL_COUNT   INT             DEFAULT 3 COMMENT '원본 발행부수',
            MOVEMENT_TYPE_CD    VARCHAR(10)     COMMENT '운송유형',
            SERVICE_TYPE_CD     VARCHAR(10)     COMMENT '서비스유형',
            STATUS_CD           VARCHAR(20)     DEFAULT 'DRAFT' COMMENT '상태',
            PRINT_YN            CHAR(1)         DEFAULT 'N' COMMENT '출력여부',
            PRINT_DTM           DATETIME        COMMENT '출력일시',
            SURRENDER_YN        CHAR(1)         DEFAULT 'N' COMMENT 'Surrender 여부',
            SURRENDER_DTM       DATETIME        COMMENT 'Surrender 일시',
            OVERSEAS_PARTNER_ID BIGINT          COMMENT '해외파트너',
            PARTNER_REF_NO      VARCHAR(50)     COMMENT '파트너참조번호',
            CUSTOMER_REF_NO     VARCHAR(50)     COMMENT '화주참조번호',
            PO_NO               VARCHAR(50)     COMMENT 'PO번호',
            REMARKS             VARCHAR(2000)   COMMENT '비고',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_HBL_SHIPMENT (SHIPMENT_ID),
            INDEX IDX_HBL_MBL (MBL_ID),
            INDEX IDX_HBL_CUSTOMER (CUSTOMER_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='House B/L (해상)'
    """, "BL_HOUSE_BL")

    # HBL Cargo
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS BL_HOUSE_BL_CARGO (
            HBL_CARGO_ID        BIGINT          PRIMARY KEY AUTO_INCREMENT,
            HBL_ID              BIGINT          NOT NULL COMMENT 'HBL',
            LINE_NO             INT             NOT NULL COMMENT '라인번호',
            COMMODITY_DESC      VARCHAR(500)    COMMENT '품명',
            HS_CODE             VARCHAR(12)     COMMENT 'HS코드',
            PKG_QTY             INT             COMMENT '수량',
            PKG_TYPE_CD         VARCHAR(10)     COMMENT '포장유형',
            GROSS_WEIGHT_KG     DECIMAL(12,3)   COMMENT '총중량',
            NET_WEIGHT_KG       DECIMAL(12,3)   COMMENT '순중량',
            VOLUME_CBM          DECIMAL(12,4)   COMMENT '부피',
            MARKS_NOS           VARCHAR(500)    COMMENT '화인',
            COUNTRY_OF_ORIGIN   CHAR(2)         COMMENT '원산지',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='House B/L 화물 상세'
    """, "BL_HOUSE_BL_CARGO")

    # Container
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS BL_CONTAINER (
            CONTAINER_ID        BIGINT          PRIMARY KEY AUTO_INCREMENT,
            CNTR_NO             VARCHAR(15)     NOT NULL COMMENT '컨테이너번호',
            MBL_ID              BIGINT          COMMENT 'MBL',
            HBL_ID              BIGINT          COMMENT 'HBL',
            BOOKING_ID          BIGINT          COMMENT '부킹',
            CNTR_TYPE_CD        VARCHAR(10)     NOT NULL COMMENT '유형',
            CNTR_SIZE_CD        VARCHAR(5)      COMMENT '사이즈',
            ISO_CODE            VARCHAR(10)     COMMENT 'ISO 코드',
            SEAL_NO             VARCHAR(30)     COMMENT '봉인번호',
            SEAL_NO2            VARCHAR(30)     COMMENT '추가봉인번호',
            TARE_WEIGHT_KG      DECIMAL(10,2)   COMMENT '공컨테이너중량',
            GROSS_WEIGHT_KG     DECIMAL(12,3)   COMMENT '총중량',
            NET_WEIGHT_KG       DECIMAL(12,3)   COMMENT '순중량',
            VGM_WEIGHT_KG       DECIMAL(12,3)   COMMENT 'VGM 중량',
            VOLUME_CBM          DECIMAL(12,4)   COMMENT '부피',
            PKG_QTY             INT             COMMENT '포장수량',
            PKG_TYPE_CD         VARCHAR(10)     COMMENT '포장유형',
            COMMODITY_DESC      VARCHAR(500)    COMMENT '품명',
            IS_SOC              CHAR(1)         DEFAULT 'N' COMMENT '자가컨테이너여부',
            SPECIAL_TYPE_CD     VARCHAR(20)     COMMENT '특수유형',
            TEMPERATURE         DECIMAL(5,2)    COMMENT '온도설정',
            TEMPERATURE_UNIT    CHAR(1)         DEFAULT 'C' COMMENT '온도단위',
            HUMIDITY            DECIMAL(5,2)    COMMENT '습도',
            VENTILATION         VARCHAR(20)     COMMENT '환기설정',
            OVER_LENGTH_CM      DECIMAL(8,2)    COMMENT 'Over Length',
            OVER_WIDTH_CM       DECIMAL(8,2)    COMMENT 'Over Width',
            OVER_HEIGHT_CM      DECIMAL(8,2)    COMMENT 'Over Height',
            DG_YN               CHAR(1)         DEFAULT 'N' COMMENT '위험물여부',
            UN_NO               VARCHAR(10)     COMMENT 'UN번호',
            IMO_CLASS           VARCHAR(10)     COMMENT 'IMO 등급',
            DG_PROPER_NM        VARCHAR(200)    COMMENT '위험물명칭',
            STATUS_CD           VARCHAR(20)     DEFAULT 'BOOKED' COMMENT '상태',
            PICKUP_DTM          DATETIME        COMMENT '픽업일시',
            GATE_IN_DTM         DATETIME        COMMENT 'Gate In 일시',
            LOADING_DTM         DATETIME        COMMENT '선적일시',
            DISCHARGE_DTM       DATETIME        COMMENT '양하일시',
            GATE_OUT_DTM        DATETIME        COMMENT 'Gate Out 일시',
            RETURN_DTM          DATETIME        COMMENT '반납일시',
            REMARKS             VARCHAR(500)    COMMENT '비고',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_CNTR_MBL (MBL_ID),
            INDEX IDX_CNTR_HBL (HBL_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='컨테이너'
    """, "BL_CONTAINER")

    # Master AWB
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS BL_MASTER_AWB (
            MAWB_ID             BIGINT          PRIMARY KEY AUTO_INCREMENT,
            MAWB_NO             VARCHAR(15)     UNIQUE NOT NULL COMMENT 'MAWB 번호',
            SHIPMENT_ID         BIGINT          COMMENT '선적건',
            BOOKING_ID          BIGINT          COMMENT '부킹',
            CARRIER_ID          BIGINT          NOT NULL COMMENT '항공사',
            FLIGHT_NO           VARCHAR(10)     COMMENT '편명',
            FLIGHT_DT           DATE            COMMENT '운항일',
            AIR_SCHEDULE_ID     BIGINT          COMMENT '스케줄',
            ORIGIN_PORT_CD      VARCHAR(10)     NOT NULL COMMENT '출발공항',
            DEST_PORT_CD        VARCHAR(10)     NOT NULL COMMENT '도착공항',
            FIRST_CARRIER       VARCHAR(100)    COMMENT '최초운송인',
            ROUTING_1           VARCHAR(50)     COMMENT '환적1',
            ROUTING_2           VARCHAR(50)     COMMENT '환적2',
            ROUTING_3           VARCHAR(50)     COMMENT '환적3',
            ETD_DTM             DATETIME        COMMENT '출발예정일시',
            ATD_DTM             DATETIME        COMMENT '실제출발일시',
            ETA_DTM             DATETIME        COMMENT '도착예정일시',
            ATA_DTM             DATETIME        COMMENT '실제도착일시',
            ISSUE_DT            DATE            COMMENT '발행일',
            ISSUE_PLACE         VARCHAR(100)    COMMENT '발행지',
            SHIPPER_NM          VARCHAR(200)    COMMENT '발송인명',
            SHIPPER_ADDR        VARCHAR(500)    COMMENT '발송인주소',
            SHIPPER_ACCOUNT     VARCHAR(50)     COMMENT '발송인계정',
            CONSIGNEE_NM        VARCHAR(200)    COMMENT '수하인명',
            CONSIGNEE_ADDR      VARCHAR(500)    COMMENT '수하인주소',
            CONSIGNEE_ACCOUNT   VARCHAR(50)     COMMENT '수하인계정',
            AGENT_NAME          VARCHAR(200)    COMMENT '대리점명',
            AGENT_IATA_CODE     VARCHAR(10)     COMMENT '대리점IATA코드',
            AGENT_ACCOUNT       VARCHAR(50)     COMMENT '대리점계정',
            TOTAL_PKG_QTY       INT             COMMENT '총수량',
            GROSS_WEIGHT_KG     DECIMAL(12,3)   COMMENT '총중량',
            CHARGEABLE_WEIGHT   DECIMAL(12,3)   COMMENT '청구중량',
            VOLUME_CBM          DECIMAL(12,4)   COMMENT '부피',
            COMMODITY_DESC      VARCHAR(1000)   COMMENT '품명',
            DIMENSIONS          VARCHAR(200)    COMMENT '치수',
            RATE_CLASS_CD       VARCHAR(5)      COMMENT '요율등급',
            COMMODITY_ITEM_NO   VARCHAR(10)     COMMENT '품목번호',
            RATE_CHARGE         DECIMAL(18,4)   COMMENT '요율',
            TOTAL_CHARGE        DECIMAL(18,2)   COMMENT '총운임',
            CURRENCY_CD         CHAR(3)         COMMENT '통화',
            WEIGHT_CHARGE_PP    DECIMAL(18,2)   COMMENT '중량운임(Prepaid)',
            WEIGHT_CHARGE_CC    DECIMAL(18,2)   COMMENT '중량운임(Collect)',
            VALUATION_CHARGE_PP DECIMAL(18,2)   COMMENT '종가운임(Prepaid)',
            VALUATION_CHARGE_CC DECIMAL(18,2)   COMMENT '종가운임(Collect)',
            OTHER_CHARGES_PP    DECIMAL(18,2)   COMMENT '기타운임(Prepaid)',
            OTHER_CHARGES_CC    DECIMAL(18,2)   COMMENT '기타운임(Collect)',
            TOTAL_PP            DECIMAL(18,2)   COMMENT '합계(Prepaid)',
            TOTAL_CC            DECIMAL(18,2)   COMMENT '합계(Collect)',
            DECLARED_VALUE_CARRIAGE DECIMAL(18,2) COMMENT '운송신고가액',
            DECLARED_VALUE_CUSTOMS DECIMAL(18,2) COMMENT '세관신고가액',
            INSURANCE_AMT       DECIMAL(18,2)   COMMENT '보험금액',
            SPECIAL_CARGO_CD    VARCHAR(20)     COMMENT '특수화물코드',
            HANDLING_INFO       VARCHAR(500)    COMMENT '취급정보',
            SCI_CD              VARCHAR(10)     COMMENT '보안정보',
            STATUS_CD           VARCHAR(20)     DEFAULT 'DRAFT' COMMENT '상태',
            EXECUTED_DT         DATE            COMMENT '실행일',
            REMARKS             VARCHAR(2000)   COMMENT '비고',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_MAWB_SHIPMENT (SHIPMENT_ID),
            INDEX IDX_MAWB_CARRIER (CARRIER_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Master AWB (항공)'
    """, "BL_MASTER_AWB")

    # House AWB
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS BL_HOUSE_AWB (
            HAWB_ID             BIGINT          PRIMARY KEY AUTO_INCREMENT,
            HAWB_NO             VARCHAR(30)     UNIQUE NOT NULL COMMENT 'HAWB 번호',
            SHIPMENT_ID         BIGINT          NOT NULL COMMENT '선적건',
            MAWB_ID             BIGINT          COMMENT 'MAWB (Consolidation)',
            CUSTOMER_ID         BIGINT          NOT NULL COMMENT '화주',
            CARRIER_ID          BIGINT          COMMENT '항공사',
            FLIGHT_NO           VARCHAR(10)     COMMENT '편명',
            FLIGHT_DT           DATE            COMMENT '운항일',
            ORIGIN_PORT_CD      VARCHAR(10)     NOT NULL COMMENT '출발공항',
            DEST_PORT_CD        VARCHAR(10)     NOT NULL COMMENT '도착공항',
            FINAL_DEST          VARCHAR(100)    COMMENT '최종목적지',
            ETD_DTM             DATETIME        COMMENT '출발예정일시',
            ATD_DTM             DATETIME        COMMENT '실제출발일시',
            ETA_DTM             DATETIME        COMMENT '도착예정일시',
            ATA_DTM             DATETIME        COMMENT '실제도착일시',
            ISSUE_DT            DATE            COMMENT '발행일',
            ISSUE_PLACE         VARCHAR(100)    COMMENT '발행지',
            SHIPPER_ID          BIGINT          COMMENT '발송인',
            SHIPPER_NM          VARCHAR(200)    COMMENT '발송인명',
            SHIPPER_ADDR        VARCHAR(500)    COMMENT '발송인주소',
            SHIPPER_TEL         VARCHAR(50)     COMMENT '발송인전화',
            CONSIGNEE_ID        BIGINT          COMMENT '수하인',
            CONSIGNEE_NM        VARCHAR(200)    COMMENT '수하인명',
            CONSIGNEE_ADDR      VARCHAR(500)    COMMENT '수하인주소',
            CONSIGNEE_TEL       VARCHAR(50)     COMMENT '수하인전화',
            NOTIFY_PARTY        VARCHAR(500)    COMMENT '통지처',
            TOTAL_PKG_QTY       INT             COMMENT '총수량',
            PKG_TYPE_CD         VARCHAR(10)     COMMENT '포장유형',
            GROSS_WEIGHT_KG     DECIMAL(12,3)   COMMENT '총중량',
            VOLUME_WEIGHT_KG    DECIMAL(12,3)   COMMENT '용적중량',
            CHARGEABLE_WEIGHT   DECIMAL(12,3)   COMMENT '청구중량',
            VOLUME_CBM          DECIMAL(12,4)   COMMENT '부피',
            DIMENSIONS          VARCHAR(200)    COMMENT '치수',
            COMMODITY_DESC      VARCHAR(2000)   COMMENT '품명',
            HS_CODE             VARCHAR(12)     COMMENT 'HS코드',
            RATE_CLASS_CD       VARCHAR(5)      COMMENT '요율등급',
            RATE_CHARGE         DECIMAL(18,4)   COMMENT '요율',
            FREIGHT_TERM_CD     VARCHAR(10)     COMMENT '운임조건',
            DECLARED_VALUE      DECIMAL(18,2)   COMMENT '신고가액',
            DECLARED_VALUE_CURR CHAR(3)         COMMENT '신고가액통화',
            SPECIAL_CARGO_CD    VARCHAR(20)     COMMENT '특수화물코드',
            HANDLING_INFO       VARCHAR(500)    COMMENT '취급정보',
            STATUS_CD           VARCHAR(20)     DEFAULT 'DRAFT' COMMENT '상태',
            PRINT_YN            CHAR(1)         DEFAULT 'N' COMMENT '출력여부',
            PRINT_DTM           DATETIME        COMMENT '출력일시',
            OVERSEAS_PARTNER_ID BIGINT          COMMENT '해외파트너',
            PARTNER_REF_NO      VARCHAR(50)     COMMENT '파트너참조번호',
            CUSTOMER_REF_NO     VARCHAR(50)     COMMENT '화주참조번호',
            PO_NO               VARCHAR(50)     COMMENT 'PO번호',
            REMARKS             VARCHAR(2000)   COMMENT '비고',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_HAWB_SHIPMENT (SHIPMENT_ID),
            INDEX IDX_HAWB_MAWB (MAWB_ID),
            INDEX IDX_HAWB_CUSTOMER (CUSTOMER_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='House AWB (항공)'
    """, "BL_HOUSE_AWB")

    # HAWB Cargo
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS BL_HOUSE_AWB_CARGO (
            HAWB_CARGO_ID       BIGINT          PRIMARY KEY AUTO_INCREMENT,
            HAWB_ID             BIGINT          NOT NULL COMMENT 'HAWB',
            LINE_NO             INT             NOT NULL COMMENT '라인번호',
            COMMODITY_DESC      VARCHAR(500)    COMMENT '품명',
            HS_CODE             VARCHAR(12)     COMMENT 'HS코드',
            PKG_QTY             INT             COMMENT '수량',
            PKG_TYPE_CD         VARCHAR(10)     COMMENT '포장유형',
            GROSS_WEIGHT_KG     DECIMAL(12,3)   COMMENT '총중량',
            NET_WEIGHT_KG       DECIMAL(12,3)   COMMENT '순중량',
            VOLUME_CBM          DECIMAL(12,4)   COMMENT '부피',
            LENGTH_CM           DECIMAL(8,2)    COMMENT '길이',
            WIDTH_CM            DECIMAL(8,2)    COMMENT '너비',
            HEIGHT_CM           DECIMAL(8,2)    COMMENT '높이',
            COUNTRY_OF_ORIGIN   CHAR(2)         COMMENT '원산지',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='House AWB 화물 상세'
    """, "BL_HOUSE_AWB_CARGO")

    # IRRE
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS BL_IRRE (
            IRRE_ID             BIGINT          PRIMARY KEY AUTO_INCREMENT,
            IRRE_NO             VARCHAR(30)     UNIQUE NOT NULL COMMENT 'IRRE 번호',
            SHIPMENT_ID         BIGINT          COMMENT '선적건',
            MAWB_ID             BIGINT          COMMENT 'MAWB',
            HAWB_ID             BIGINT          COMMENT 'HAWB',
            MBL_ID              BIGINT          COMMENT 'MBL',
            HBL_ID              BIGINT          COMMENT 'HBL',
            IRRE_TYPE_CD        VARCHAR(20)     NOT NULL COMMENT 'IRRE유형',
            IRRE_DT             DATE            NOT NULL COMMENT '발생일',
            STATION_CD          VARCHAR(10)     COMMENT '발생지역',
            FLIGHT_NO           VARCHAR(10)     COMMENT '편명',
            REPORTED_PKG_QTY    INT             COMMENT '신고수량',
            ACTUAL_PKG_QTY      INT             COMMENT '실제수량',
            DIFF_PKG_QTY        INT             COMMENT '차이수량',
            REPORTED_WEIGHT_KG  DECIMAL(12,3)   COMMENT '신고중량',
            ACTUAL_WEIGHT_KG    DECIMAL(12,3)   COMMENT '실제중량',
            DIFF_WEIGHT_KG      DECIMAL(12,3)   COMMENT '차이중량',
            DESCRIPTION         VARCHAR(2000)   COMMENT '상세설명',
            ACTION_TAKEN        VARCHAR(2000)   COMMENT '조치사항',
            CLAIM_AMT           DECIMAL(18,2)   COMMENT '클레임금액',
            CLAIM_CURR          CHAR(3)         COMMENT '클레임통화',
            STATUS_CD           VARCHAR(20)     DEFAULT 'OPEN' COMMENT '상태',
            CLOSED_DT           DATE            COMMENT '종결일',
            CLOSED_REASON       VARCHAR(500)    COMMENT '종결사유',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='IRRE (Irregularity/사고)'
    """, "BL_IRRE")

def create_shipment_tables(cursor):
    """05. Shipment Tables (선적/도착)"""
    print("\n=== 05. Shipment Tables (선적/도착) ===")

    # S/R
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS SHP_SHIPPING_REQUEST (
            SR_ID               BIGINT          PRIMARY KEY AUTO_INCREMENT,
            SR_NO               VARCHAR(30)     UNIQUE NOT NULL COMMENT 'S/R 번호',
            SHIPMENT_ID         BIGINT          NOT NULL COMMENT '선적건',
            BOOKING_ID          BIGINT          COMMENT '부킹',
            HBL_ID              BIGINT          COMMENT 'HBL',
            HAWB_ID             BIGINT          COMMENT 'HAWB',
            CUSTOMER_ID         BIGINT          NOT NULL COMMENT '화주',
            TRANSPORT_MODE_CD   VARCHAR(10)     NOT NULL COMMENT '운송모드',
            TRADE_TYPE_CD       VARCHAR(10)     NOT NULL COMMENT '수출입구분',
            SHIPPER_NM          VARCHAR(200)    COMMENT '발송인명',
            SHIPPER_ADDR        VARCHAR(500)    COMMENT '발송인주소',
            CONSIGNEE_NM        VARCHAR(200)    COMMENT '수하인명',
            CONSIGNEE_ADDR      VARCHAR(500)    COMMENT '수하인주소',
            NOTIFY_PARTY        VARCHAR(500)    COMMENT '통지처',
            ORIGIN_PORT_CD      VARCHAR(10)     COMMENT '출발항',
            DEST_PORT_CD        VARCHAR(10)     COMMENT '도착항',
            COMMODITY_DESC      VARCHAR(1000)   COMMENT '품명',
            HS_CODE             VARCHAR(12)     COMMENT 'HS코드',
            PKG_QTY             INT             COMMENT '수량',
            PKG_TYPE_CD         VARCHAR(10)     COMMENT '포장유형',
            GROSS_WEIGHT_KG     DECIMAL(12,3)   COMMENT '총중량',
            VOLUME_CBM          DECIMAL(12,4)   COMMENT '부피',
            MARKS_NOS           VARCHAR(1000)   COMMENT '화인',
            REQUESTED_ETD_DT    DATE            COMMENT '희망출발일',
            CARGO_READY_DT      DATE            COMMENT '화물준비일',
            STATUS_CD           VARCHAR(20)     DEFAULT 'RECEIVED' COMMENT '상태',
            RECEIPT_DTM         DATETIME        COMMENT '접수일시',
            CONFIRM_DTM         DATETIME        COMMENT '확정일시',
            CI_ATTACHED_YN      CHAR(1)         DEFAULT 'N' COMMENT 'C/I 첨부여부',
            PL_ATTACHED_YN      CHAR(1)         DEFAULT 'N' COMMENT 'P/L 첨부여부',
            SPECIAL_INST        VARCHAR(1000)   COMMENT '특별지시사항',
            REMARKS             VARCHAR(2000)   COMMENT '비고',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_SR_SHIPMENT (SHIPMENT_ID),
            INDEX IDX_SR_CUSTOMER (CUSTOMER_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='선적요청 (S/R)'
    """, "SHP_SHIPPING_REQUEST")

    # S/N
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS SHP_SHIPPING_NOTICE (
            SN_ID               BIGINT          PRIMARY KEY AUTO_INCREMENT,
            SN_NO               VARCHAR(30)     UNIQUE NOT NULL COMMENT 'S/N 번호',
            SHIPMENT_ID         BIGINT          NOT NULL COMMENT '선적건',
            MBL_ID              BIGINT          COMMENT 'MBL',
            HBL_ID              BIGINT          COMMENT 'HBL',
            MAWB_ID             BIGINT          COMMENT 'MAWB',
            HAWB_ID             BIGINT          COMMENT 'HAWB',
            SENDER_NM           VARCHAR(200)    COMMENT '발신자',
            RECIPIENT_NM        VARCHAR(200)    COMMENT '수신자',
            RECIPIENT_EMAIL     VARCHAR(100)    COMMENT '수신이메일',
            TRANSPORT_MODE_CD   VARCHAR(10)     COMMENT '운송모드',
            CARRIER_NM          VARCHAR(100)    COMMENT '운송사명',
            VESSEL_FLIGHT       VARCHAR(100)    COMMENT '선명/편명',
            VOYAGE_NO           VARCHAR(30)     COMMENT '항차',
            ORIGIN_PORT_CD      VARCHAR(10)     COMMENT '출발항',
            DEST_PORT_CD        VARCHAR(10)     COMMENT '도착항',
            ETD_DT              DATE            COMMENT '출발예정일',
            ETA_DT              DATE            COMMENT '도착예정일',
            COMMODITY_DESC      VARCHAR(1000)   COMMENT '품명',
            PKG_QTY             INT             COMMENT '수량',
            GROSS_WEIGHT_KG     DECIMAL(12,3)   COMMENT '총중량',
            VOLUME_CBM          DECIMAL(12,4)   COMMENT '부피',
            ATTACHED_DOCS       VARCHAR(500)    COMMENT '첨부서류',
            SEND_DTM            DATETIME        COMMENT '발송일시',
            SEND_METHOD_CD      VARCHAR(10)     COMMENT '발송방식',
            SEND_STATUS_CD      VARCHAR(20)     COMMENT '발송상태',
            REMARKS             VARCHAR(2000)   COMMENT '비고',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_SN_SHIPMENT (SHIPMENT_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='선적통지 (S/N)'
    """, "SHP_SHIPPING_NOTICE")

    # A/N
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS SHP_ARRIVAL_NOTICE (
            AN_ID               BIGINT          PRIMARY KEY AUTO_INCREMENT,
            AN_NO               VARCHAR(30)     UNIQUE NOT NULL COMMENT 'A/N 번호',
            SHIPMENT_ID         BIGINT          NOT NULL COMMENT '선적건',
            MBL_ID              BIGINT          COMMENT 'MBL',
            HBL_ID              BIGINT          COMMENT 'HBL',
            MAWB_ID             BIGINT          COMMENT 'MAWB',
            HAWB_ID             BIGINT          COMMENT 'HAWB',
            CUSTOMER_ID         BIGINT          NOT NULL COMMENT '화주',
            SENDER_NM           VARCHAR(200)    COMMENT '발신자',
            RECIPIENT_NM        VARCHAR(200)    COMMENT '수신자',
            RECIPIENT_EMAIL     VARCHAR(100)    COMMENT '수신이메일',
            TRANSPORT_MODE_CD   VARCHAR(10)     COMMENT '운송모드',
            CARRIER_NM          VARCHAR(100)    COMMENT '운송사명',
            VESSEL_FLIGHT       VARCHAR(100)    COMMENT '선명/편명',
            ARRIVAL_PORT_CD     VARCHAR(10)     COMMENT '도착항',
            ETA_DT              DATE            COMMENT '도착예정일',
            ATA_DT              DATE            COMMENT '실제도착일',
            FREE_TIME_DAYS      INT             COMMENT 'Free Time 일수',
            LAST_FREE_DATE      DATE            COMMENT 'Free Time 종료일',
            BL_NO               VARCHAR(30)     COMMENT 'B/L 번호',
            COMMODITY_DESC      VARCHAR(1000)   COMMENT '품명',
            PKG_QTY             INT             COMMENT '수량',
            GROSS_WEIGHT_KG     DECIMAL(12,3)   COMMENT '총중량',
            CONTAINER_INFO      VARCHAR(500)    COMMENT '컨테이너정보',
            FREIGHT_AMT         DECIMAL(18,2)   COMMENT '운임',
            THC_AMT             DECIMAL(18,2)   COMMENT 'THC',
            DOC_FEE_AMT         DECIMAL(18,2)   COMMENT '서류비',
            OTHER_CHARGES_AMT   DECIMAL(18,2)   COMMENT '기타비용',
            TOTAL_AMT           DECIMAL(18,2)   COMMENT '합계',
            CURRENCY_CD         CHAR(3)         COMMENT '통화',
            CUSTOMS_BROKER_NM   VARCHAR(200)    COMMENT '관세사',
            CUSTOMS_INST        VARCHAR(1000)   COMMENT '통관안내',
            SEND_DTM            DATETIME        COMMENT '발송일시',
            SEND_STATUS_CD      VARCHAR(20)     COMMENT '발송상태',
            REMARKS             VARCHAR(2000)   COMMENT '비고',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N',
            INDEX IDX_AN_SHIPMENT (SHIPMENT_ID),
            INDEX IDX_AN_CUSTOMER (CUSTOMER_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='도착통지 (A/N)'
    """, "SHP_ARRIVAL_NOTICE")

    # Pre-Alert
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS SHP_PRE_ALERT (
            PRE_ALERT_ID        BIGINT          PRIMARY KEY AUTO_INCREMENT,
            PRE_ALERT_NO        VARCHAR(30)     UNIQUE NOT NULL COMMENT 'Pre-Alert 번호',
            SHIPMENT_ID         BIGINT          NOT NULL COMMENT '선적건',
            SN_ID               BIGINT          COMMENT 'S/N',
            SENDER_ID           BIGINT          COMMENT '발신자',
            RECIPIENT_ID        BIGINT          COMMENT '수신자',
            RECIPIENT_EMAIL     VARCHAR(100)    COMMENT '수신이메일',
            TRANSPORT_MODE_CD   VARCHAR(10)     COMMENT '운송모드',
            MBL_NO              VARCHAR(30)     COMMENT 'MBL 번호',
            HBL_NO              VARCHAR(30)     COMMENT 'HBL 번호',
            MAWB_NO             VARCHAR(15)     COMMENT 'MAWB 번호',
            HAWB_NO             VARCHAR(30)     COMMENT 'HAWB 번호',
            CARRIER_NM          VARCHAR(100)    COMMENT '운송사명',
            VESSEL_FLIGHT       VARCHAR(100)    COMMENT '선명/편명',
            ETD_DT              DATE            COMMENT '출발예정일',
            ETA_DT              DATE            COMMENT '도착예정일',
            SHIPPER_NM          VARCHAR(200)    COMMENT '발송인',
            CONSIGNEE_NM        VARCHAR(200)    COMMENT '수하인',
            PKG_QTY             INT             COMMENT '수량',
            GROSS_WEIGHT_KG     DECIMAL(12,3)   COMMENT '총중량',
            ATTACHED_DOCS       VARCHAR(500)    COMMENT '첨부서류목록',
            TRIGGER_TYPE_CD     VARCHAR(20)     COMMENT '트리거유형',
            TRIGGER_OFFSET_DAYS INT             DEFAULT 0 COMMENT '트리거오프셋',
            SCHEDULED_DTM       DATETIME        COMMENT '예정발송일시',
            SEND_DTM            DATETIME        COMMENT '실제발송일시',
            SEND_STATUS_CD      VARCHAR(20)     DEFAULT 'PENDING' COMMENT '발송상태',
            SEND_RESULT         VARCHAR(500)    COMMENT '발송결과',
            REMARKS             VARCHAR(2000)   COMMENT '비고',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Pre-Alert'
    """, "SHP_PRE_ALERT")

    # Pre-Alert Setting
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS SHP_PRE_ALERT_SETTING (
            SETTING_ID          BIGINT          PRIMARY KEY AUTO_INCREMENT,
            USER_ID             BIGINT          NOT NULL COMMENT '사용자',
            CUSTOMER_ID         BIGINT          COMMENT '화주',
            PARTNER_ID          BIGINT          COMMENT '파트너',
            TRANSPORT_MODE_CD   VARCHAR(10)     COMMENT '운송모드',
            TRIGGER_TYPE_CD     VARCHAR(20)     NOT NULL COMMENT '트리거유형',
            TRIGGER_OFFSET_DAYS INT             DEFAULT 0 COMMENT '오프셋일수',
            SEND_TIME           TIME            COMMENT '발송시간',
            RECIPIENT_EMAILS    VARCHAR(500)    COMMENT '수신이메일',
            ATTACH_BL_YN        CHAR(1)         DEFAULT 'Y' COMMENT 'B/L 첨부',
            ATTACH_CI_YN        CHAR(1)         DEFAULT 'Y' COMMENT 'C/I 첨부',
            ATTACH_PL_YN        CHAR(1)         DEFAULT 'Y' COMMENT 'P/L 첨부',
            IS_ACTIVE           CHAR(1)         DEFAULT 'Y' COMMENT '활성화여부',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY          VARCHAR(50),
            UPDATED_DTM         DATETIME        ON UPDATE CURRENT_TIMESTAMP,
            DEL_YN              CHAR(1)         DEFAULT 'N'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Pre-Alert 설정'
    """, "SHP_PRE_ALERT_SETTING")

    # Tracking Event
    execute_sql(cursor, """
        CREATE TABLE IF NOT EXISTS SHP_TRACKING_EVENT (
            TRACKING_ID         BIGINT          PRIMARY KEY AUTO_INCREMENT,
            SHIPMENT_ID         BIGINT          NOT NULL COMMENT '선적건',
            MBL_ID              BIGINT          COMMENT 'MBL',
            HBL_ID              BIGINT          COMMENT 'HBL',
            MAWB_ID             BIGINT          COMMENT 'MAWB',
            HAWB_ID             BIGINT          COMMENT 'HAWB',
            CONTAINER_ID        BIGINT          COMMENT '컨테이너',
            EVENT_CD            VARCHAR(20)     NOT NULL COMMENT '이벤트코드',
            EVENT_NM            VARCHAR(100)    COMMENT '이벤트명',
            EVENT_DTM           DATETIME        NOT NULL COMMENT '이벤트일시',
            EVENT_TIMEZONE      VARCHAR(50)     COMMENT '타임존',
            LOCATION_CD         VARCHAR(10)     COMMENT '위치코드',
            LOCATION_NM         VARCHAR(100)    COMMENT '위치명',
            COUNTRY_CD          CHAR(2)         COMMENT '국가',
            VESSEL_FLIGHT       VARCHAR(100)    COMMENT '선명/편명',
            VOYAGE_NO           VARCHAR(30)     COMMENT '항차',
            DESCRIPTION         VARCHAR(500)    COMMENT '설명',
            SOURCE_CD           VARCHAR(20)     COMMENT '출처',
            SOURCE_REF          VARCHAR(100)    COMMENT '출처참조',
            IS_EXCEPTION        CHAR(1)         DEFAULT 'N' COMMENT '예외여부',
            EXCEPTION_TYPE_CD   VARCHAR(20)     COMMENT '예외유형',
            CREATED_BY          VARCHAR(50),
            CREATED_DTM         DATETIME        DEFAULT CURRENT_TIMESTAMP,
            INDEX IDX_TRACKING_SHIPMENT (SHIPMENT_ID),
            INDEX IDX_TRACKING_DTM (EVENT_DTM)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='화물 추적 이벤트'
    """, "SHP_TRACKING_EVENT")

def main():
    print("=" * 60)
    print("FMS Database Table Creation - Part 2")
    print("=" * 60)

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")

        create_bl_tables(cursor)
        create_shipment_tables(cursor)

        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        conn.commit()

        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print("\n" + "=" * 60)
        print(f"Total tables: {len(tables)}")
        print("=" * 60)

    except Exception as e:
        print(f"\nError: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()
