#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
FMS Database Sample Data Insertion Script v2
- Adapted for actual table structure
"""

import pymysql
from datetime import datetime, timedelta

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

def insert_master_data(cursor):
    """01. Master Tables Sample Data"""
    print("\n=== 01. Master Tables ===")

    # MST_COMPANY
    cursor.execute("""
        INSERT INTO MST_COMPANY (COMPANY_CD, COMPANY_NM, COMPANY_NM_EN, BIZ_REG_NO, CEO_NM, ADDR, TEL_NO, FAX_NO, EMAIL, COUNTRY_CD, USE_YN)
        VALUES
        ('COMP001', '인터지스', 'INTERGIS Co., Ltd.', '123-45-67890', '홍길동', '서울시 강남구 테헤란로 123', '02-1234-5678', '02-1234-5679', 'info@intergis.co.kr', 'KR', 'Y'),
        ('COMP002', '글로벌로지스틱스', 'Global Logistics Inc.', '234-56-78901', '김철수', '부산시 중구 중앙대로 456', '051-234-5678', '051-234-5679', 'info@globallogistics.kr', 'KR', 'Y')
        ON DUPLICATE KEY UPDATE COMPANY_NM=VALUES(COMPANY_NM)
    """)
    print("  [OK] MST_COMPANY")

    # MST_COUNTRY
    countries = [
        ('KR', 'KOR', '대한민국', 'Korea, Republic of', 'AS', 'KRW'),
        ('US', 'USA', '미국', 'United States', 'NA', 'USD'),
        ('CN', 'CHN', '중국', 'China', 'AS', 'CNY'),
        ('JP', 'JPN', '일본', 'Japan', 'AS', 'JPY'),
        ('HK', 'HKG', '홍콩', 'Hong Kong', 'AS', 'HKD'),
        ('SG', 'SGP', '싱가포르', 'Singapore', 'AS', 'SGD'),
        ('DE', 'DEU', '독일', 'Germany', 'EU', 'EUR'),
        ('NL', 'NLD', '네덜란드', 'Netherlands', 'EU', 'EUR'),
        ('VN', 'VNM', '베트남', 'Vietnam', 'AS', 'VND'),
        ('TH', 'THA', '태국', 'Thailand', 'AS', 'THB')
    ]
    for c in countries:
        cursor.execute("""
            INSERT INTO MST_COUNTRY (COUNTRY_CD, COUNTRY_CD3, COUNTRY_NM, COUNTRY_NM_EN, CONTINENT_CD, CURRENCY_CD, USE_YN)
            VALUES (%s, %s, %s, %s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE COUNTRY_NM=VALUES(COUNTRY_NM)
        """, c)
    print("  [OK] MST_COUNTRY")

    # MST_PORT
    ports = [
        ('KRPUS', '부산항', 'Busan Port', 'KR', 'SEA'),
        ('KRINC', '인천공항', 'Incheon International Airport', 'KR', 'AIR'),
        ('KRICN', '인천항', 'Incheon Port', 'KR', 'SEA'),
        ('CNSHA', '상해항', 'Shanghai Port', 'CN', 'SEA'),
        ('CNPVG', '상해푸동공항', 'Shanghai Pudong Airport', 'CN', 'AIR'),
        ('CNSHE', '심천항', 'Shenzhen Port', 'CN', 'SEA'),
        ('HKHKG', '홍콩항', 'Hong Kong Port', 'HK', 'SEA'),
        ('VKHKG', '홍콩공항', 'Hong Kong International Airport', 'HK', 'AIR'),
        ('JPYOK', '요코하마항', 'Yokohama Port', 'JP', 'SEA'),
        ('JPNRT', '나리타공항', 'Narita International Airport', 'JP', 'AIR'),
        ('SGSIN', '싱가포르항', 'Singapore Port', 'SG', 'SEA'),
        ('USNYC', '뉴욕항', 'New York Port', 'US', 'SEA'),
        ('USLAX', 'LA항', 'Los Angeles Port', 'US', 'SEA'),
        ('USLXP', 'LA공항', 'Los Angeles International Airport', 'US', 'AIR'),
        ('NLRTM', '로테르담항', 'Rotterdam Port', 'NL', 'SEA'),
        ('DEHAM', '함부르크항', 'Hamburg Port', 'DE', 'SEA')
    ]
    for p in ports:
        cursor.execute("""
            INSERT INTO MST_PORT (PORT_CD, PORT_NM, PORT_NM_EN, COUNTRY_CD, PORT_TYPE_CD, USE_YN)
            VALUES (%s, %s, %s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE PORT_NM=VALUES(PORT_NM)
        """, p)
    print("  [OK] MST_PORT")

    # MST_CURRENCY
    currencies = [
        ('KRW', '원화', 'W', 0),
        ('USD', '미달러', '$', 2),
        ('EUR', '유로', 'E', 2),
        ('JPY', '엔화', 'Y', 0),
        ('CNY', '위안화', 'Y', 2),
        ('HKD', '홍콩달러', '$', 2),
        ('SGD', '싱가포르달러', '$', 2)
    ]
    for c in currencies:
        cursor.execute("""
            INSERT INTO MST_CURRENCY (CURRENCY_CD, CURRENCY_NM, CURRENCY_SYMBOL, DECIMAL_PLACES, USE_YN)
            VALUES (%s, %s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE CURRENCY_NM=VALUES(CURRENCY_NM)
        """, c)
    print("  [OK] MST_CURRENCY")

    # MST_EXCHANGE_RATE
    today = datetime.now().strftime('%Y-%m-%d')
    rates = [
        ('USD', 'KRW', today, 1350.00, 1355.00, 1345.00),
        ('EUR', 'KRW', today, 1450.00, 1455.00, 1445.00),
        ('JPY', 'KRW', today, 9.00, 9.05, 8.95),
        ('CNY', 'KRW', today, 185.00, 186.00, 184.00),
        ('HKD', 'KRW', today, 173.00, 174.00, 172.00)
    ]
    for r in rates:
        cursor.execute("""
            INSERT INTO MST_EXCHANGE_RATE (BASE_CURRENCY_CD, QUOTE_CURRENCY_CD, RATE_DT, RATE, SELL_RATE, BUY_RATE, USE_YN)
            VALUES (%s, %s, %s, %s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE RATE=VALUES(RATE)
        """, r)
    print("  [OK] MST_EXCHANGE_RATE")

    # MST_CARRIER
    carriers = [
        ('MAEU', 'MAERSK', 'Maersk Line', 'SEA', 'MAEU', None, None, 'DK'),
        ('MSCU', 'MSC', 'Mediterranean Shipping Company', 'SEA', 'MSCU', None, None, 'CH'),
        ('COSU', 'COSCO', 'COSCO Shipping Lines', 'SEA', 'COSU', None, None, 'CN'),
        ('EGLV', 'EVERGREEN', 'Evergreen Marine Corp.', 'SEA', 'EGLV', None, None, 'TW'),
        ('ONEY', 'ONE', 'Ocean Network Express', 'SEA', 'ONEY', None, None, 'JP'),
        ('HDMU', 'HMM', 'HMM Co., Ltd.', 'SEA', 'HDMU', None, None, 'KR'),
        ('YMLU', 'YANGMING', 'Yang Ming Marine Transport', 'SEA', 'YMLU', None, None, 'TW'),
        ('KE', 'KOREAN AIR', 'Korean Air Lines', 'AIR', None, 'KE', 'KAL', 'KR'),
        ('OZ', 'ASIANA', 'Asiana Airlines', 'AIR', None, 'OZ', 'AAR', 'KR'),
        ('CX', 'CATHAY', 'Cathay Pacific', 'AIR', None, 'CX', 'CPA', 'HK'),
        ('SQ', 'SINGAPORE', 'Singapore Airlines', 'AIR', None, 'SQ', 'SIA', 'SG'),
        ('LH', 'LUFTHANSA', 'Lufthansa Cargo', 'AIR', None, 'LH', 'DLH', 'DE')
    ]
    for c in carriers:
        cursor.execute("""
            INSERT INTO MST_CARRIER (CARRIER_CD, CARRIER_NM, CARRIER_NM_EN, CARRIER_TYPE_CD, SCAC_CD, IATA_CD, ICAO_CD, COUNTRY_CD, USE_YN)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE CARRIER_NM=VALUES(CARRIER_NM)
        """, c)
    print("  [OK] MST_CARRIER")

    # MST_CUSTOMER
    customers = [
        ('CUST001', '삼성전자', 'Samsung Electronics', 'SHIPPER', '124-81-00998', '홍길동', 'KR', '서울시 서초구 서초대로 74길 11', '02-2255-0114', 'logistics@samsung.com'),
        ('CUST002', 'LG전자', 'LG Electronics', 'SHIPPER', '107-86-14075', '김철수', 'KR', '서울시 영등포구 여의대로 128', '02-3777-1114', 'logistics@lge.com'),
        ('CUST003', '현대자동차', 'Hyundai Motor Company', 'SHIPPER', '101-81-15116', '이영희', 'KR', '서울시 서초구 헌릉로 12', '02-3464-1114', 'logistics@hyundai.com'),
        ('CUST004', 'SK하이닉스', 'SK Hynix Inc.', 'SHIPPER', '214-86-05453', '박지성', 'KR', '경기도 이천시 부발읍 경충대로 2091', '031-630-4114', 'logistics@skhynix.com'),
        ('CUST005', 'ABC Trading Co.', 'ABC Trading Co.', 'CONSIGNEE', '98-7654321', 'John Smith', 'US', '1234 Main Street, Los Angeles, CA', '+1-213-555-0100', 'import@abctrading.com'),
        ('CUST006', 'XYZ Import GmbH', 'XYZ Import GmbH', 'CONSIGNEE', 'DE123456789', 'Hans Mueller', 'DE', 'Hauptstrasse 123, Hamburg', '+49-40-555-0100', 'logistics@xyzimport.de'),
        ('CUST007', 'Global Parts Inc.', 'Global Parts Inc.', 'BOTH', '11-2233445', 'Mike Johnson', 'US', '5678 Industrial Blvd, Chicago, IL', '+1-312-555-0200', 'supply@globalparts.com')
    ]
    for c in customers:
        cursor.execute("""
            INSERT INTO MST_CUSTOMER (CUSTOMER_CD, CUSTOMER_NM, CUSTOMER_NM_EN, CUSTOMER_TYPE_CD, BIZ_REG_NO, CEO_NM, COUNTRY_CD, ADDR, TEL_NO, EMAIL, USE_YN)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE CUSTOMER_NM=VALUES(CUSTOMER_NM)
        """, c)
    print("  [OK] MST_CUSTOMER")

    # MST_PARTNER
    partners = [
        ('PART001', 'Shanghai Cargo Services', 'Shanghai Cargo Services', 'AGENT', 'CN', 'Room 1234, Building A, Pudong', '+86-21-5555-0100', 'ops@shcargo.cn'),
        ('PART002', 'Hong Kong Forwarding Ltd.', 'Hong Kong Forwarding Ltd.', 'AGENT', 'HK', 'Unit 5678, Kowloon Bay', '+852-2555-0100', 'booking@hkfwd.hk'),
        ('PART003', 'Tokyo Logistics KK', 'Tokyo Logistics KK', 'AGENT', 'JP', '1-2-3 Minato-ku, Tokyo', '+81-3-5555-0100', 'info@tokyolog.jp'),
        ('PART004', 'LA Freight Services', 'LA Freight Services', 'AGENT', 'US', '123 Harbor Blvd, Long Beach', '+1-562-555-0100', 'ops@lafreight.com'),
        ('PART005', 'Hamburg Shipping Agency', 'Hamburg Shipping Agency', 'AGENT', 'DE', 'Hafenstrasse 45, Hamburg', '+49-40-555-0200', 'shipping@hamburgagency.de')
    ]
    for p in partners:
        cursor.execute("""
            INSERT INTO MST_PARTNER (PARTNER_CD, PARTNER_NM, PARTNER_NM_EN, PARTNER_TYPE_CD, COUNTRY_CD, ADDR, TEL_NO, EMAIL, USE_YN)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE PARTNER_NM=VALUES(PARTNER_NM)
        """, p)
    print("  [OK] MST_PARTNER")

    # MST_TRUCKER
    truckers = [
        ('TRUCK001', '한진육운', 'Hanjin Land Transport', '123-45-67891', '서울시 강서구 공항대로', '02-2660-1234', 'dispatch@hanjinland.kr'),
        ('TRUCK002', '대한통운', 'Korea Express', '234-56-78902', '서울시 중구 소공로', '02-1588-1255', 'truck@koreaexpress.kr'),
        ('TRUCK003', '현대글로비스', 'Hyundai Glovis', '124-81-23456', '서울시 강남구 테헤란로', '02-6190-5114', 'transport@glovis.net')
    ]
    for t in truckers:
        cursor.execute("""
            INSERT INTO MST_TRUCKER (TRUCKER_CD, TRUCKER_NM, TRUCKER_NM_EN, BIZ_REG_NO, ADDR, TEL_NO, EMAIL, USE_YN)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE TRUCKER_NM=VALUES(TRUCKER_NM)
        """, t)
    print("  [OK] MST_TRUCKER")

    # MST_CUSTOMS_BROKER
    brokers = [
        ('BROKER001', '삼성관세법인', 'Samsung Customs Service', '214-81-12345', '서울시 강남구 삼성로', '02-555-1234', 'customs@samsungcs.kr'),
        ('BROKER002', '한국관세사', 'Korea Customs Broker', '123-81-23456', '인천시 중구 항동', '032-888-5678', 'clear@koreabroker.kr')
    ]
    for b in brokers:
        cursor.execute("""
            INSERT INTO MST_CUSTOMS_BROKER (BROKER_CD, BROKER_NM, BROKER_NM_EN, BIZ_REG_NO, ADDR, TEL_NO, EMAIL, USE_YN)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE BROKER_NM=VALUES(BROKER_NM)
        """, b)
    print("  [OK] MST_CUSTOMS_BROKER")

    # MST_HS_CODE
    hs_codes = [
        ('8542310000', 'Processors and controllers', '프로세서 및 컨트롤러', 0.00),
        ('8542320000', 'Memories', '메모리', 0.00),
        ('8542390000', 'Other integrated circuits', '기타 집적회로', 0.00),
        ('8471300000', 'Portable digital computers', '휴대용 컴퓨터', 0.00),
        ('8517120000', 'Telephones for cellular networks', '휴대전화기', 0.00),
        ('8703230000', 'Motor vehicles', '자동차', 8.00),
        ('8708999000', 'Parts of motor vehicles', '자동차 부품', 8.00),
        ('6403990000', 'Footwear', '신발류', 13.00)
    ]
    for h in hs_codes:
        cursor.execute("""
            INSERT INTO MST_HS_CODE (HS_CD, DESCRIPTION_EN, DESCRIPTION_KR, DUTY_RATE, USE_YN)
            VALUES (%s, %s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE DESCRIPTION_EN=VALUES(DESCRIPTION_EN)
        """, h)
    print("  [OK] MST_HS_CODE")

    # MST_COMMON_CODE_GROUP (adapted structure)
    code_groups = [
        ('CARGO_TYPE', 'Cargo Type'),
        ('INCOTERMS', 'Incoterms'),
        ('CNTR_TYPE', 'Container Type'),
        ('CNTR_SIZE', 'Container Size'),
        ('PKG_TYPE', 'Package Type'),
        ('SVC_TYPE', 'Service Type'),
        ('DOC_TYPE', 'Document Type'),
        ('STATUS', 'Status'),
        ('TRANSPORT_MODE', 'Transport Mode'),
        ('TRADE_TYPE', 'Trade Type')
    ]
    for g in code_groups:
        cursor.execute("""
            INSERT INTO MST_COMMON_CODE_GROUP (CODE_GROUP_ID, CODE_GROUP_NM, DESCRIPTION, USE_YN)
            VALUES (%s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE CODE_GROUP_NM=VALUES(CODE_GROUP_NM)
        """, (g[0], g[1], g[1]))
    print("  [OK] MST_COMMON_CODE_GROUP")

    # MST_COMMON_CODE (adapted structure)
    common_codes = [
        ('CARGO_TYPE', 'FCL', 'FCL', 'Full Container Load', 1),
        ('CARGO_TYPE', 'LCL', 'LCL', 'Less than Container Load', 2),
        ('CARGO_TYPE', 'BULK', '벌크', 'Bulk Cargo', 3),
        ('CARGO_TYPE', 'AIR', '항공화물', 'Air Cargo', 4),
        ('INCOTERMS', 'FOB', '본선인도', 'Free On Board', 1),
        ('INCOTERMS', 'CIF', '운임보험료포함', 'Cost Insurance Freight', 2),
        ('INCOTERMS', 'EXW', '공장인도', 'Ex Works', 3),
        ('INCOTERMS', 'DDP', '관세지급인도', 'Delivered Duty Paid', 4),
        ('CNTR_TYPE', 'GP', '일반컨테이너', 'General Purpose', 1),
        ('CNTR_TYPE', 'HC', '하이큐브', 'High Cube', 2),
        ('CNTR_TYPE', 'RF', '냉동컨테이너', 'Reefer', 3),
        ('CNTR_SIZE', '20', '20피트', '20 feet', 1),
        ('CNTR_SIZE', '40', '40피트', '40 feet', 2),
        ('CNTR_SIZE', '45', '45피트', '45 feet', 3),
        ('PKG_TYPE', 'CTN', '카톤', 'Carton', 1),
        ('PKG_TYPE', 'PLT', '팔레트', 'Pallet', 2),
        ('PKG_TYPE', 'BAG', '백', 'Bag', 3),
        ('TRANSPORT_MODE', 'SEA', '해상운송', 'Sea Freight', 1),
        ('TRANSPORT_MODE', 'AIR', '항공운송', 'Air Freight', 2),
        ('TRADE_TYPE', 'EXPORT', '수출', 'Export', 1),
        ('TRADE_TYPE', 'IMPORT', '수입', 'Import', 2)
    ]
    for c in common_codes:
        cursor.execute("""
            INSERT INTO MST_COMMON_CODE (CODE_GROUP_ID, CODE_CD, CODE_NM, CODE_NM_EN, SORT_ORDER, USE_YN)
            VALUES (%s, %s, %s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE CODE_NM=VALUES(CODE_NM)
        """, c)
    print("  [OK] MST_COMMON_CODE")

    # MST_USER (adapted structure)
    users = [
        ('admin', '시스템관리자', 'System Admin', 'admin@intergis.co.kr', 'ADMIN', 'ACTIVE'),
        ('export01', '김수출', 'Kim Export', 'export01@intergis.co.kr', 'OPERATOR', 'ACTIVE'),
        ('import01', '이수입', 'Lee Import', 'import01@intergis.co.kr', 'OPERATOR', 'ACTIVE'),
        ('customs01', '박통관', 'Park Customs', 'customs01@intergis.co.kr', 'OPERATOR', 'ACTIVE'),
        ('billing01', '최정산', 'Choi Billing', 'billing01@intergis.co.kr', 'OPERATOR', 'ACTIVE')
    ]
    for u in users:
        cursor.execute("""
            INSERT INTO MST_USER (USER_LOGIN_ID, USER_NM, USER_NM_EN, EMAIL, USER_TYPE_CD, STATUS_CD, USE_YN)
            VALUES (%s, %s, %s, %s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE USER_NM=VALUES(USER_NM)
        """, u)
    print("  [OK] MST_USER")


def insert_schedule_data(cursor):
    """02. Schedule Tables Sample Data"""
    print("\n=== 02. Schedule Tables ===")

    today = datetime.now()

    # SCH_VOYAGE
    voyages = [
        ('VOY20260101', 'HDMU', 'HYUNDAI SINGAPORE', 'V.001E', today.strftime('%Y-%m-%d'), (today + timedelta(days=14)).strftime('%Y-%m-%d'), 'KRPUS', 'USLAX', 'ACTIVE'),
        ('VOY20260102', 'MAEU', 'MAERSK SEALAND', 'V.002W', today.strftime('%Y-%m-%d'), (today + timedelta(days=21)).strftime('%Y-%m-%d'), 'KRPUS', 'NLRTM', 'ACTIVE'),
        ('VOY20260103', 'COSU', 'COSCO SHIPPING', 'V.003E', (today + timedelta(days=3)).strftime('%Y-%m-%d'), (today + timedelta(days=10)).strftime('%Y-%m-%d'), 'CNSHA', 'KRPUS', 'ACTIVE')
    ]
    for v in voyages:
        cursor.execute("""
            INSERT INTO SCH_VOYAGE (VOYAGE_NO, CARRIER_CD, VESSEL_NM, VOYAGE_LEG, DEPARTURE_DT, ARRIVAL_DT, ORIGIN_PORT_CD, DEST_PORT_CD, STATUS_CD)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE VESSEL_NM=VALUES(VESSEL_NM)
        """, v)
    print("  [OK] SCH_VOYAGE")

    # SCH_OCEAN_SCHEDULE
    ocean_schedules = [
        ('HDMU', 'HYUNDAI SINGAPORE', 'V.001E', 'KRPUS', 'USLAX', today.strftime('%Y-%m-%d'), (today + timedelta(days=14)).strftime('%Y-%m-%d'), 14, (today - timedelta(days=3)).strftime('%Y-%m-%d'), (today - timedelta(days=1)).strftime('%Y-%m-%d')),
        ('MAEU', 'MAERSK SEALAND', 'V.002W', 'KRPUS', 'NLRTM', today.strftime('%Y-%m-%d'), (today + timedelta(days=28)).strftime('%Y-%m-%d'), 28, (today - timedelta(days=5)).strftime('%Y-%m-%d'), (today - timedelta(days=2)).strftime('%Y-%m-%d')),
        ('COSU', 'COSCO GALAXY', 'V.003E', 'CNSHA', 'KRPUS', (today + timedelta(days=3)).strftime('%Y-%m-%d'), (today + timedelta(days=6)).strftime('%Y-%m-%d'), 3, (today + timedelta(days=1)).strftime('%Y-%m-%d'), (today + timedelta(days=2)).strftime('%Y-%m-%d'))
    ]
    for s in ocean_schedules:
        cursor.execute("""
            INSERT INTO SCH_OCEAN_SCHEDULE (CARRIER_CD, VESSEL_NM, VOYAGE_NO, POL_PORT_CD, POD_PORT_CD, ETD_DT, ETA_DT, TRANSIT_DAYS, DOC_CUTOFF_DT, CARGO_CUTOFF_DT, USE_YN)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Y')
        """, s)
    print("  [OK] SCH_OCEAN_SCHEDULE")

    # SCH_AIR_SCHEDULE
    air_schedules = [
        ('KE', 'KE001', 'KRINC', 'USLAX', today.strftime('%Y-%m-%d %H:%M:%S'), (today + timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S')),
        ('OZ', 'OZ201', 'KRINC', 'CNPVG', today.strftime('%Y-%m-%d %H:%M:%S'), today.strftime('%Y-%m-%d %H:%M:%S')),
        ('CX', 'CX417', 'VKHKG', 'KRINC', (today + timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S'), (today + timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S'))
    ]
    for a in air_schedules:
        cursor.execute("""
            INSERT INTO SCH_AIR_SCHEDULE (CARRIER_CD, FLIGHT_NO, ORIGIN_PORT_CD, DEST_PORT_CD, ETD_DTM, ETA_DTM, USE_YN)
            VALUES (%s, %s, %s, %s, %s, %s, 'Y')
        """, a)
    print("  [OK] SCH_AIR_SCHEDULE")

    # SCH_MAWB_STOCK
    mawb_stocks = [
        ('KE', '180', '12345670', '12345679', 10, 3, 7),
        ('OZ', '988', '98765430', '98765439', 10, 5, 5),
        ('CX', '160', '11112220', '11112229', 10, 2, 8)
    ]
    for m in mawb_stocks:
        cursor.execute("""
            INSERT INTO SCH_MAWB_STOCK (CARRIER_CD, PREFIX, START_NO, END_NO, TOTAL_CNT, USED_CNT, REMAIN_CNT, USE_YN)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'Y')
        """, m)
    print("  [OK] SCH_MAWB_STOCK")


def insert_shipment_data(cursor):
    """03. Shipment & Related Tables Sample Data"""
    print("\n=== 03. Shipment & Related Tables ===")

    today = datetime.now()

    # Get carrier IDs
    cursor.execute("SELECT CARRIER_ID, CARRIER_CD FROM MST_CARRIER")
    carrier_map = {row[1]: row[0] for row in cursor.fetchall()}

    # Get customer IDs
    cursor.execute("SELECT CUSTOMER_ID, CUSTOMER_CD FROM MST_CUSTOMER")
    customer_map = {row[1]: row[0] for row in cursor.fetchall()}

    # Get schedule IDs
    cursor.execute("SELECT SCHEDULE_ID FROM SCH_OCEAN_SCHEDULE LIMIT 3")
    schedule_ids = [row[0] for row in cursor.fetchall()]

    # ORD_SHIPMENT - 5 sample shipments
    shipments = [
        ('SHP20260001', 'SEA', 'EXPORT', 'CY-CY', 'FOB', customer_map.get('CUST001'), customer_map.get('CUST001'), customer_map.get('CUST005'), carrier_map.get('HDMU'), 'KR', 'KRPUS', 'US', 'USLAX', today.strftime('%Y-%m-%d'), (today + timedelta(days=14)).strftime('%Y-%m-%d'), 100, 'CTN', 5000.000, 150.000, 1500000.00, 'USD', 'SHIPPED'),
        ('SHP20260002', 'SEA', 'EXPORT', 'CFS-CFS', 'CIF', customer_map.get('CUST002'), customer_map.get('CUST002'), customer_map.get('CUST006'), carrier_map.get('MAEU'), 'KR', 'KRPUS', 'DE', 'DEHAM', today.strftime('%Y-%m-%d'), (today + timedelta(days=28)).strftime('%Y-%m-%d'), 200, 'CTN', 8000.000, 400.000, 200000.00, 'USD', 'BOOKED'),
        ('SHP20260003', 'AIR', 'EXPORT', 'D2D', 'FOB', customer_map.get('CUST003'), customer_map.get('CUST003'), customer_map.get('CUST007'), carrier_map.get('KE'), 'KR', 'KRINC', 'US', 'USLXP', today.strftime('%Y-%m-%d'), (today + timedelta(days=1)).strftime('%Y-%m-%d'), 50, 'PLT', 2500.000, 75.000, 150000.00, 'USD', 'DEPARTED'),
        ('SHP20260004', 'SEA', 'IMPORT', 'CY-CY', 'CIF', customer_map.get('CUST004'), None, customer_map.get('CUST004'), carrier_map.get('COSU'), 'CN', 'CNSHA', 'KR', 'KRPUS', (today - timedelta(days=3)).strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d'), 500, 'CTN', 2000.000, 50.000, 2500000.00, 'USD', 'ARRIVED'),
        ('SHP20260005', 'AIR', 'IMPORT', 'D2D', 'DDP', customer_map.get('CUST001'), None, customer_map.get('CUST001'), carrier_map.get('CX'), 'HK', 'VKHKG', 'KR', 'KRINC', (today + timedelta(days=1)).strftime('%Y-%m-%d'), (today + timedelta(days=1)).strftime('%Y-%m-%d'), 10, 'CTN', 500.000, 5.000, 800000.00, 'USD', 'PENDING')
    ]
    for s in shipments:
        cursor.execute("""
            INSERT INTO ORD_SHIPMENT (SHIPMENT_NO, TRANSPORT_MODE_CD, TRADE_TYPE_CD, SERVICE_TYPE_CD, INCOTERMS_CD,
                CUSTOMER_ID, SHIPPER_ID, CONSIGNEE_ID, CARRIER_ID, ORIGIN_COUNTRY_CD, ORIGIN_PORT_CD,
                DEST_COUNTRY_CD, DEST_PORT_CD, ETD_DT, ETA_DT, TOTAL_PKG_QTY, PKG_TYPE_CD, GROSS_WEIGHT_KG,
                VOLUME_CBM, DECLARED_VALUE_AMT, DECLARED_VALUE_CURR, STATUS_CD)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, s)
    print("  [OK] ORD_SHIPMENT")

    # Get shipment IDs
    cursor.execute("SELECT SHIPMENT_ID, SHIPMENT_NO FROM ORD_SHIPMENT")
    shipment_map = {row[1]: row[0] for row in cursor.fetchall()}

    # ORD_OCEAN_BOOKING
    bookings = [
        (shipment_map.get('SHP20260001'), schedule_ids[0] if schedule_ids else None, carrier_map.get('HDMU'), 'HYUNDAI SINGAPORE', 'V.001E', 'KRPUS', 'USLAX', today.strftime('%Y-%m-%d'), (today + timedelta(days=14)).strftime('%Y-%m-%d'), 'CONFIRMED'),
        (shipment_map.get('SHP20260002'), schedule_ids[1] if len(schedule_ids) > 1 else None, carrier_map.get('MAEU'), 'MAERSK SEALAND', 'V.002W', 'KRPUS', 'NLRTM', today.strftime('%Y-%m-%d'), (today + timedelta(days=28)).strftime('%Y-%m-%d'), 'CONFIRMED')
    ]
    for b in bookings:
        if b[0]:
            cursor.execute("""
                INSERT INTO ORD_OCEAN_BOOKING (SHIPMENT_ID, SCHEDULE_ID, CARRIER_ID, VESSEL_NM, VOYAGE_NO, POL_PORT_CD, POD_PORT_CD, ETD_DT, ETA_DT, STATUS_CD)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, b)
    print("  [OK] ORD_OCEAN_BOOKING")

    # Get booking IDs
    cursor.execute("SELECT BOOKING_ID FROM ORD_OCEAN_BOOKING")
    booking_ids = [row[0] for row in cursor.fetchall()]

    # ORD_OCEAN_BOOKING_CNTR
    containers = [
        (booking_ids[0] if booking_ids else None, 'HDMU1234567', '40', 'HC', 1, 25000.000, 'SL12345'),
        (booking_ids[0] if booking_ids else None, 'HDMU2345678', '40', 'HC', 2, 25000.000, 'SL12346')
    ]
    for c in containers:
        if c[0]:
            cursor.execute("""
                INSERT INTO ORD_OCEAN_BOOKING_CNTR (BOOKING_ID, CNTR_NO, CNTR_SIZE_CD, CNTR_TYPE_CD, SEQ_NO, MAX_WEIGHT_KG, SEAL_NO)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, c)
    print("  [OK] ORD_OCEAN_BOOKING_CNTR")

    # BL_MASTER_BL
    mbls = [
        ('HDMUPUS12345678', shipment_map.get('SHP20260001'), booking_ids[0] if booking_ids else None, carrier_map.get('HDMU'), 'HYUNDAI SINGAPORE', 'V.001E', 'KRPUS', 'USLAX', today.strftime('%Y-%m-%d'), (today + timedelta(days=14)).strftime('%Y-%m-%d'), 'Samsung Electronics', 'ABC Trading Co.', 100, 'CTN', 5000.000, 150.000, 'ORIGINAL', 3, 'RELEASED'),
        ('MAEULAX98765432', shipment_map.get('SHP20260002'), booking_ids[1] if len(booking_ids) > 1 else None, carrier_map.get('MAEU'), 'MAERSK SEALAND', 'V.002W', 'KRPUS', 'NLRTM', today.strftime('%Y-%m-%d'), (today + timedelta(days=28)).strftime('%Y-%m-%d'), 'LG Electronics', 'XYZ Import GmbH', 200, 'CTN', 8000.000, 400.000, 'ORIGINAL', 3, 'ISSUED')
    ]
    for m in mbls:
        if m[1]:
            cursor.execute("""
                INSERT INTO BL_MASTER_BL (MBL_NO, SHIPMENT_ID, BOOKING_ID, CARRIER_ID, VESSEL_NM, VOYAGE_NO, POL_PORT_CD, POD_PORT_CD,
                    ETD_DT, ETA_DT, SHIPPER_NM, CONSIGNEE_NM, TOTAL_PKG_QTY, PKG_TYPE_CD, GROSS_WEIGHT_KG, VOLUME_CBM, BL_TYPE_CD, ORIGINAL_BL_COUNT, STATUS_CD)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, m)
    print("  [OK] BL_MASTER_BL")

    # Get MBL IDs
    cursor.execute("SELECT MBL_ID, MBL_NO FROM BL_MASTER_BL")
    mbl_map = {row[1]: row[0] for row in cursor.fetchall()}

    # BL_HOUSE_BL
    hbls = [
        ('IGSHBL20260001', mbl_map.get('HDMUPUS12345678'), shipment_map.get('SHP20260001'), 'Samsung Electronics', '서울시 서초구 서초대로', 'ABC Trading Co.', 'Los Angeles, CA', 'Same as Consignee', 'FOB', 'KRPUS', 'USLAX', 'Semiconductor Chips', 100, 'CTN', 5000.000, 150.000, 'ORIGINAL', 3, 'RELEASED'),
        ('IGSHBL20260002', mbl_map.get('MAEULAX98765432'), shipment_map.get('SHP20260002'), 'LG Electronics', '서울시 영등포구', 'XYZ Import GmbH', 'Hamburg, Germany', 'Same as Consignee', 'CIF', 'KRPUS', 'DEHAM', 'LED TV', 200, 'CTN', 8000.000, 400.000, 'ORIGINAL', 3, 'ISSUED')
    ]
    for h in hbls:
        if h[1]:
            cursor.execute("""
                INSERT INTO BL_HOUSE_BL (HBL_NO, MBL_ID, SHIPMENT_ID, SHIPPER_NM, SHIPPER_ADDR, CONSIGNEE_NM, CONSIGNEE_ADDR,
                    NOTIFY_PARTY, INCOTERMS_CD, POL_PORT_CD, POD_PORT_CD, COMMODITY_DESC, TOTAL_PKG_QTY, PKG_TYPE_CD,
                    GROSS_WEIGHT_KG, VOLUME_CBM, BL_TYPE_CD, ORIGINAL_BL_COUNT, STATUS_CD)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, h)
    print("  [OK] BL_HOUSE_BL")

    # BL_CONTAINER
    bl_containers = [
        (mbl_map.get('HDMUPUS12345678'), 'HDMU1234567', '40', 'HC', 'SL12345', 5000.000, 150.000, 30000.000, 4200.000),
        (mbl_map.get('HDMUPUS12345678'), 'HDMU2345678', '40', 'HC', 'SL12346', 5000.000, 150.000, 30000.000, 4200.000)
    ]
    for c in bl_containers:
        if c[0]:
            cursor.execute("""
                INSERT INTO BL_CONTAINER (MBL_ID, CNTR_NO, CNTR_SIZE_CD, CNTR_TYPE_CD, SEAL_NO, GROSS_WEIGHT_KG, VOLUME_CBM, MAX_WEIGHT_KG, TARE_WEIGHT_KG)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, c)
    print("  [OK] BL_CONTAINER")

    # BL_MASTER_AWB
    cursor.execute("SELECT SCHEDULE_ID FROM SCH_AIR_SCHEDULE LIMIT 2")
    air_schedule_ids = [row[0] for row in cursor.fetchall()]

    mawbs = [
        ('180-12345670', shipment_map.get('SHP20260003'), carrier_map.get('KE'), 'KE001', 'KRINC', 'USLXP', today.strftime('%Y-%m-%d'), (today + timedelta(days=1)).strftime('%Y-%m-%d'), 'Hyundai Motor', 'Global Parts Inc.', 2500.000, 75.000, 'DEPARTED')
    ]
    for m in mawbs:
        if m[1]:
            cursor.execute("""
                INSERT INTO BL_MASTER_AWB (MAWB_NO, SHIPMENT_ID, CARRIER_ID, FLIGHT_NO, ORIGIN_PORT_CD, DEST_PORT_CD,
                    ETD_DT, ETA_DT, SHIPPER_NM, CONSIGNEE_NM, GROSS_WEIGHT_KG, VOLUME_CBM, STATUS_CD)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, m)
    print("  [OK] BL_MASTER_AWB")

    # Get MAWB ID
    cursor.execute("SELECT MAWB_ID FROM BL_MASTER_AWB LIMIT 1")
    mawb_result = cursor.fetchone()
    mawb_id = mawb_result[0] if mawb_result else None

    # BL_HOUSE_AWB
    if mawb_id:
        cursor.execute("""
            INSERT INTO BL_HOUSE_AWB (HAWB_NO, MAWB_ID, SHIPMENT_ID, SHIPPER_NM, SHIPPER_ADDR, CONSIGNEE_NM,
                CONSIGNEE_ADDR, NOTIFY_PARTY, COMMODITY_DESC, TOTAL_PKG_QTY, PKG_TYPE_CD, GROSS_WEIGHT_KG,
                VOLUME_CBM, DECLARED_VALUE_AMT, DECLARED_VALUE_CURR, STATUS_CD)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, ('IGSHAWB20260001', mawb_id, shipment_map.get('SHP20260003'), 'Hyundai Motor', 'Seoul, Korea', 'Global Parts Inc.', 'Chicago, IL', 'Same as Consignee', 'Engine Parts', 50, 'PLT', 2500.000, 75.000, 150000.00, 'USD', 'DEPARTED'))
        print("  [OK] BL_HOUSE_AWB")

    # SHP_TRACKING_EVENT
    events = [
        (shipment_map.get('SHP20260001'), (today - timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S'), 'BKD', 'Booking Confirmed', 'KRPUS', None),
        (shipment_map.get('SHP20260001'), (today - timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S'), 'GIN', 'Gate In at Terminal', 'KRPUS', 'HDMU1234567'),
        (shipment_map.get('SHP20260001'), today.strftime('%Y-%m-%d %H:%M:%S'), 'DEP', 'Vessel Departed', 'KRPUS', None),
        (shipment_map.get('SHP20260003'), today.strftime('%Y-%m-%d %H:%M:%S'), 'DEP', 'Flight Departed', 'KRINC', None),
        (shipment_map.get('SHP20260004'), today.strftime('%Y-%m-%d %H:%M:%S'), 'ARR', 'Vessel Arrived', 'KRPUS', None)
    ]
    for e in events:
        if e[0]:
            cursor.execute("""
                INSERT INTO SHP_TRACKING_EVENT (SHIPMENT_ID, EVENT_DTM, EVENT_CD, EVENT_DESC, LOCATION_CD, CNTR_NO)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, e)
    print("  [OK] SHP_TRACKING_EVENT")

    return shipment_map, customer_map


def insert_billing_data(cursor, shipment_map, customer_map):
    """04. Billing Tables Sample Data"""
    print("\n=== 04. Billing Tables ===")

    today = datetime.now()

    # BIL_CONTRACT
    contracts = [
        (customer_map.get('CUST001'), 'CT-2026-001', 'Samsung Forwarding Contract', 'STANDARD', (today - timedelta(days=180)).strftime('%Y-%m-%d'), (today + timedelta(days=185)).strftime('%Y-%m-%d'), 'Y', 30, 500000000.00, 'KRW', 'ACTIVE'),
        (customer_map.get('CUST002'), 'CT-2026-002', 'LG Logistics Contract', 'STANDARD', (today - timedelta(days=90)).strftime('%Y-%m-%d'), (today + timedelta(days=275)).strftime('%Y-%m-%d'), 'Y', 45, 300000000.00, 'KRW', 'ACTIVE')
    ]
    for c in contracts:
        if c[0]:
            cursor.execute("""
                INSERT INTO BIL_CONTRACT (CUSTOMER_ID, CONTRACT_NO, CONTRACT_NM, CONTRACT_TYPE_CD, START_DT, END_DT,
                    AUTO_RENEW_YN, PAYMENT_TERM_DAYS, CREDIT_LIMIT_AMT, CURRENCY_CD, STATUS_CD)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, c)
    print("  [OK] BIL_CONTRACT")

    # BIL_TARIFF
    tariffs = [
        (None, 'SEA', 'EXPORT', 'OFR', 'Ocean Freight', 'PER_UNIT', 'CNTR', 1500.0000, 'USD', 1500.00, None, 'KRPUS', 'USLAX', 'HDMU', '40HC', (today - timedelta(days=90)).strftime('%Y-%m-%d'), (today + timedelta(days=275)).strftime('%Y-%m-%d')),
        (None, 'SEA', 'EXPORT', 'THC', 'Terminal Handling', 'PER_UNIT', 'CNTR', 150000.0000, 'KRW', 150000.00, None, 'KRPUS', None, None, '40HC', (today - timedelta(days=90)).strftime('%Y-%m-%d'), (today + timedelta(days=275)).strftime('%Y-%m-%d')),
        (None, 'AIR', 'EXPORT', 'AFR', 'Air Freight', 'PER_UNIT', 'KG', 5.5000, 'USD', 100.00, None, 'KRINC', 'USLXP', 'KE', None, (today - timedelta(days=90)).strftime('%Y-%m-%d'), (today + timedelta(days=275)).strftime('%Y-%m-%d'))
    ]
    for t in tariffs:
        cursor.execute("""
            INSERT INTO BIL_TARIFF (CONTRACT_ID, TARIFF_TYPE_CD, SERVICE_TYPE_CD, CHARGE_CD, CHARGE_NM,
                CALCULATION_TYPE_CD, UNIT_TYPE_CD, RATE, CURRENCY_CD, MIN_AMT, MAX_AMT, ORIGIN_PORT_CD,
                DEST_PORT_CD, CARRIER_CD, CNTR_TYPE_CD, EFFECTIVE_FROM_DT, EFFECTIVE_TO_DT, USE_YN)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Y')
        """, t)
    print("  [OK] BIL_TARIFF")

    # BIL_CHARGE
    charges = [
        (shipment_map.get('SHP20260001'), 'AR', 'OFR', 'Ocean Freight', customer_map.get('CUST001'), 2.000, 'CNTR', 1400.0000, 2800.00, 'USD', 1350.000000, 3780000.00, 'N', 0.0000, 0.00, 3780000.00, 'INVOICED', 'Y'),
        (shipment_map.get('SHP20260001'), 'AR', 'THC', 'Terminal Handling', customer_map.get('CUST001'), 2.000, 'CNTR', 150000.0000, 300000.00, 'KRW', 1.000000, 300000.00, 'Y', 10.0000, 30000.00, 330000.00, 'INVOICED', 'Y')
    ]
    for c in charges:
        if c[0] and c[4]:
            cursor.execute("""
                INSERT INTO BIL_CHARGE (SHIPMENT_ID, CHARGE_TYPE_CD, CHARGE_CD, CHARGE_NM, CUSTOMER_ID,
                    QTY, UNIT_TYPE_CD, UNIT_PRICE, AMT, CURRENCY_CD, EXCHANGE_RATE, LOCAL_AMT,
                    TAX_YN, TAX_RATE, TAX_AMT, TOTAL_AMT, STATUS_CD, AUTO_RATED_YN)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, c)
    print("  [OK] BIL_CHARGE")

    # BIL_INVOICE
    invoices = [
        ('INV-2026-0001', 'AR', today.strftime('%Y-%m-%d'), (today + timedelta(days=30)).strftime('%Y-%m-%d'), customer_map.get('CUST001'), 'Samsung Electronics', '서울시 서초구', 4110000.00, 30000.00, 4140000.00, 'KRW', 0.00, 4140000.00, 'ISSUED', today.strftime('%Y-%m-%d'))
    ]
    for i in invoices:
        if i[4]:
            cursor.execute("""
                INSERT INTO BIL_INVOICE (INVOICE_NO, INVOICE_TYPE_CD, INVOICE_DT, DUE_DT, CUSTOMER_ID,
                    CUSTOMER_NM, BILL_TO_ADDR, SUBTOTAL_AMT, TAX_AMT, TOTAL_AMT, CURRENCY_CD,
                    PAID_AMT, BALANCE_AMT, STATUS_CD, ISSUED_DT)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, i)
    print("  [OK] BIL_INVOICE")

    # BIL_PROFIT_ANALYSIS
    if shipment_map.get('SHP20260001'):
        cursor.execute("""
            INSERT INTO BIL_PROFIT_ANALYSIS (SHIPMENT_ID, ANALYSIS_DT, REVENUE_TOTAL_AMT, COST_TOTAL_AMT,
                GROSS_PROFIT_AMT, PROFIT_MARGIN_RATE, CURRENCY_CD)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (shipment_map.get('SHP20260001'), today.strftime('%Y-%m-%d'), 4140000.00, 3600000.00, 540000.00, 13.04, 'KRW'))
        print("  [OK] BIL_PROFIT_ANALYSIS")


def main():
    print("=" * 60)
    print("FMS Database - Sample Data Insertion v2")
    print("=" * 60)

    conn = get_connection()
    cursor = conn.cursor()

    try:
        insert_master_data(cursor)
        conn.commit()

        insert_schedule_data(cursor)
        conn.commit()

        shipment_map, customer_map = insert_shipment_data(cursor)
        conn.commit()

        insert_billing_data(cursor, shipment_map, customer_map)
        conn.commit()

        # Summary
        print("\n" + "=" * 60)
        cursor.execute("SELECT COUNT(*) FROM MST_COMPANY")
        print(f"  MST_COMPANY: {cursor.fetchone()[0]} rows")
        cursor.execute("SELECT COUNT(*) FROM MST_CUSTOMER")
        print(f"  MST_CUSTOMER: {cursor.fetchone()[0]} rows")
        cursor.execute("SELECT COUNT(*) FROM MST_CARRIER")
        print(f"  MST_CARRIER: {cursor.fetchone()[0]} rows")
        cursor.execute("SELECT COUNT(*) FROM ORD_SHIPMENT")
        print(f"  ORD_SHIPMENT: {cursor.fetchone()[0]} rows")
        cursor.execute("SELECT COUNT(*) FROM BL_MASTER_BL")
        print(f"  BL_MASTER_BL: {cursor.fetchone()[0]} rows")
        cursor.execute("SELECT COUNT(*) FROM BL_HOUSE_BL")
        print(f"  BL_HOUSE_BL: {cursor.fetchone()[0]} rows")
        cursor.execute("SELECT COUNT(*) FROM BIL_INVOICE")
        print(f"  BIL_INVOICE: {cursor.fetchone()[0]} rows")
        print("=" * 60)
        print("Sample data insertion completed successfully!")
        print("=" * 60)

    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    main()
