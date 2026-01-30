#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
FMS Database Sample Data Insertion Script
- Adapted for actual table structure
"""

import pymysql
from datetime import datetime, timedelta

# Database connection info
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
        ('KRW', '원화', 'Korean Won', 'W', 0),
        ('USD', '미달러', 'US Dollar', '$', 2),
        ('EUR', '유로', 'Euro', 'E', 2),
        ('JPY', '엔화', 'Japanese Yen', 'Y', 0),
        ('CNY', '위안화', 'Chinese Yuan', 'Y', 2),
        ('HKD', '홍콩달러', 'Hong Kong Dollar', '$', 2),
        ('SGD', '싱가포르달러', 'Singapore Dollar', '$', 2)
    ]
    for c in currencies:
        cursor.execute("""
            INSERT INTO MST_CURRENCY (CURRENCY_CD, CURRENCY_NM, CURRENCY_NM_EN, SYMBOL, DECIMAL_PLACES, USE_YN)
            VALUES (%s, %s, %s, %s, %s, 'Y')
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

    # MST_PARTNER (Overseas Agents)
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

    # MST_COMMON_CODE_GROUP
    code_groups = [
        ('CARGO_TYPE', 'Cargo Type', '화물유형'),
        ('INCOTERMS', 'Incoterms', '인코텀즈'),
        ('CNTR_TYPE', 'Container Type', '컨테이너유형'),
        ('CNTR_SIZE', 'Container Size', '컨테이너사이즈'),
        ('PKG_TYPE', 'Package Type', '포장유형'),
        ('SVC_TYPE', 'Service Type', '서비스유형'),
        ('DOC_TYPE', 'Document Type', '문서유형'),
        ('STATUS', 'Status', '상태'),
        ('TRANSPORT_MODE', 'Transport Mode', '운송모드'),
        ('TRADE_TYPE', 'Trade Type', '무역유형')
    ]
    for g in code_groups:
        cursor.execute("""
            INSERT INTO MST_COMMON_CODE_GROUP (GROUP_CD, GROUP_NM_EN, GROUP_NM, USE_YN)
            VALUES (%s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE GROUP_NM_EN=VALUES(GROUP_NM_EN)
        """, g)
    print("  [OK] MST_COMMON_CODE_GROUP")

    # MST_COMMON_CODE
    common_codes = [
        ('CARGO_TYPE', 'FCL', 'Full Container Load', 'FCL', 1),
        ('CARGO_TYPE', 'LCL', 'Less than Container Load', 'LCL', 2),
        ('CARGO_TYPE', 'BULK', 'Bulk Cargo', '벌크', 3),
        ('CARGO_TYPE', 'AIR', 'Air Cargo', '항공화물', 4),
        ('INCOTERMS', 'FOB', 'Free On Board', '본선인도', 1),
        ('INCOTERMS', 'CIF', 'Cost Insurance Freight', '운임보험료포함', 2),
        ('INCOTERMS', 'EXW', 'Ex Works', '공장인도', 3),
        ('INCOTERMS', 'DDP', 'Delivered Duty Paid', '관세지급인도', 4),
        ('INCOTERMS', 'CFR', 'Cost and Freight', '운임포함', 5),
        ('CNTR_TYPE', 'GP', 'General Purpose', '일반컨테이너', 1),
        ('CNTR_TYPE', 'HC', 'High Cube', '하이큐브', 2),
        ('CNTR_TYPE', 'RF', 'Reefer', '냉동컨테이너', 3),
        ('CNTR_TYPE', 'OT', 'Open Top', '오픈탑', 4),
        ('CNTR_TYPE', 'FR', 'Flat Rack', '플랫랙', 5),
        ('CNTR_SIZE', '20', '20 feet', '20피트', 1),
        ('CNTR_SIZE', '40', '40 feet', '40피트', 2),
        ('CNTR_SIZE', '45', '45 feet', '45피트', 3),
        ('PKG_TYPE', 'CTN', 'Carton', '카톤', 1),
        ('PKG_TYPE', 'PLT', 'Pallet', '팔레트', 2),
        ('PKG_TYPE', 'BAG', 'Bag', '백', 3),
        ('PKG_TYPE', 'DRM', 'Drum', '드럼', 4),
        ('PKG_TYPE', 'CAS', 'Case', '케이스', 5),
        ('SVC_TYPE', 'CY-CY', 'CY to CY', 'CY-CY', 1),
        ('SVC_TYPE', 'CY-CFS', 'CY to CFS', 'CY-CFS', 2),
        ('SVC_TYPE', 'CFS-CY', 'CFS to CY', 'CFS-CY', 3),
        ('SVC_TYPE', 'CFS-CFS', 'CFS to CFS', 'CFS-CFS', 4),
        ('SVC_TYPE', 'D2D', 'Door to Door', 'Door-Door', 5),
        ('TRANSPORT_MODE', 'SEA', 'Sea Freight', '해상운송', 1),
        ('TRANSPORT_MODE', 'AIR', 'Air Freight', '항공운송', 2),
        ('TRANSPORT_MODE', 'RAIL', 'Rail', '철도운송', 3),
        ('TRANSPORT_MODE', 'TRUCK', 'Trucking', '육상운송', 4),
        ('TRADE_TYPE', 'EXPORT', 'Export', '수출', 1),
        ('TRADE_TYPE', 'IMPORT', 'Import', '수입', 2),
        ('TRADE_TYPE', 'CROSS', 'Cross Trade', '삼국간', 3)
    ]
    for c in common_codes:
        cursor.execute("""
            INSERT INTO MST_COMMON_CODE (GROUP_CD, CODE, CODE_NM_EN, CODE_NM, SORT_ORDER, USE_YN)
            VALUES (%s, %s, %s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE CODE_NM_EN=VALUES(CODE_NM_EN)
        """, c)
    print("  [OK] MST_COMMON_CODE")

    # MST_USER
    users = [
        ('admin', '시스템관리자', 'admin@intergis.co.kr', 'ADMIN'),
        ('export01', '김수출', 'export01@intergis.co.kr', 'OPERATOR'),
        ('import01', '이수입', 'import01@intergis.co.kr', 'OPERATOR'),
        ('customs01', '박통관', 'customs01@intergis.co.kr', 'OPERATOR'),
        ('billing01', '최정산', 'billing01@intergis.co.kr', 'OPERATOR'),
        ('manager01', '정매니저', 'manager01@intergis.co.kr', 'MANAGER')
    ]
    for u in users:
        cursor.execute("""
            INSERT INTO MST_USER (LOGIN_ID, USER_NM, EMAIL, ROLE_CD, USE_YN)
            VALUES (%s, %s, %s, %s, 'Y')
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
        ('COSU', 'COSCO GALAXY', 'V.003E', 'CNSHA', 'KRPUS', (today + timedelta(days=3)).strftime('%Y-%m-%d'), (today + timedelta(days=6)).strftime('%Y-%m-%d'), 3, (today + timedelta(days=1)).strftime('%Y-%m-%d'), (today + timedelta(days=2)).strftime('%Y-%m-%d')),
        ('ONEY', 'ONE COMPETENCE', 'V.004W', 'KRPUS', 'SGSIN', (today + timedelta(days=7)).strftime('%Y-%m-%d'), (today + timedelta(days=14)).strftime('%Y-%m-%d'), 7, (today + timedelta(days=3)).strftime('%Y-%m-%d'), (today + timedelta(days=5)).strftime('%Y-%m-%d'))
    ]
    for s in ocean_schedules:
        cursor.execute("""
            INSERT INTO SCH_OCEAN_SCHEDULE (CARRIER_CD, VESSEL_NM, VOYAGE_NO, POL_PORT_CD, POD_PORT_CD, ETD_DT, ETA_DT, TRANSIT_DAYS, DOC_CUTOFF_DT, CARGO_CUTOFF_DT, USE_YN)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE VESSEL_NM=VALUES(VESSEL_NM)
        """, s)
    print("  [OK] SCH_OCEAN_SCHEDULE")

    # SCH_AIR_SCHEDULE
    air_schedules = [
        ('KE', 'KE001', 'KRINC', 'USLAX', today.strftime('%Y-%m-%d') + ' 10:00:00', (today + timedelta(days=1)).strftime('%Y-%m-%d') + ' 08:00:00'),
        ('OZ', 'OZ201', 'KRINC', 'CNPVG', today.strftime('%Y-%m-%d') + ' 14:00:00', today.strftime('%Y-%m-%d') + ' 15:30:00'),
        ('CX', 'CX417', 'VKHKG', 'KRINC', (today + timedelta(days=1)).strftime('%Y-%m-%d') + ' 09:00:00', (today + timedelta(days=1)).strftime('%Y-%m-%d') + ' 13:30:00'),
        ('SQ', 'SQ607', 'SGSIN', 'KRINC', (today + timedelta(days=2)).strftime('%Y-%m-%d') + ' 01:00:00', (today + timedelta(days=2)).strftime('%Y-%m-%d') + ' 09:00:00')
    ]
    for a in air_schedules:
        cursor.execute("""
            INSERT INTO SCH_AIR_SCHEDULE (CARRIER_CD, FLIGHT_NO, ORIGIN_PORT_CD, DEST_PORT_CD, ETD_DTM, ETA_DTM, USE_YN)
            VALUES (%s, %s, %s, %s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE FLIGHT_NO=VALUES(FLIGHT_NO)
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
            ON DUPLICATE KEY UPDATE CARRIER_CD=VALUES(CARRIER_CD)
        """, m)
    print("  [OK] SCH_MAWB_STOCK")


def insert_order_shipment_data(cursor):
    """03. Order, Shipment, BL/AWB Tables Sample Data"""
    print("\n=== 03. Order & Shipment Tables ===")

    today = datetime.now()

    # First get carrier IDs
    cursor.execute("SELECT CARRIER_ID, CARRIER_CD FROM MST_CARRIER")
    carrier_map = {row[1]: row[0] for row in cursor.fetchall()}

    # Get customer IDs
    cursor.execute("SELECT CUSTOMER_ID, CUSTOMER_CD FROM MST_CUSTOMER")
    customer_map = {row[1]: row[0] for row in cursor.fetchall()}

    # Get schedule IDs
    cursor.execute("SELECT SCHEDULE_ID, VESSEL_NM FROM SCH_OCEAN_SCHEDULE")
    schedule_map = {row[1]: row[0] for row in cursor.fetchall()}

    # ORD_SHIPMENT
    shipments = [
        ('SHP20260001', 'SEA', 'EXPORT', 'CY-CY', 'FOB', customer_map.get('CUST001'), customer_map.get('CUST001'), customer_map.get('CUST005'), carrier_map.get('HDMU'), 'KR', 'KRPUS', 'US', 'USLAX', today.strftime('%Y-%m-%d'), (today + timedelta(days=14)).strftime('%Y-%m-%d'), 100, 'CTN', 5000.000, 150.000, 1500000.00, 'USD', 'SHIPPED'),
        ('SHP20260002', 'SEA', 'EXPORT', 'CFS-CFS', 'CIF', customer_map.get('CUST002'), customer_map.get('CUST002'), customer_map.get('CUST006'), carrier_map.get('MAEU'), 'KR', 'KRPUS', 'DE', 'DEHAM', today.strftime('%Y-%m-%d'), (today + timedelta(days=28)).strftime('%Y-%m-%d'), 200, 'CTN', 8000.000, 400.000, 200000.00, 'USD', 'BOOKED'),
        ('SHP20260003', 'AIR', 'EXPORT', 'D2D', 'FOB', customer_map.get('CUST003'), customer_map.get('CUST003'), customer_map.get('CUST007'), carrier_map.get('KE'), 'KR', 'KRINC', 'US', 'USLXP', today.strftime('%Y-%m-%d'), (today + timedelta(days=1)).strftime('%Y-%m-%d'), 50, 'PLT', 2500.000, 75.000, 150000.00, 'USD', 'DEPARTED'),
        ('SHP20260004', 'SEA', 'IMPORT', 'CY-CY', 'CIF', customer_map.get('CUST004'), None, customer_map.get('CUST004'), carrier_map.get('COSU'), 'CN', 'CNSHA', 'KR', 'KRPUS', (today - timedelta(days=3)).strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d'), 500, 'CTN', 2000.000, 50.000, 2500000.00, 'USD', 'ARRIVED'),
        ('SHP20260005', 'AIR', 'IMPORT', 'D2D', 'DDP', customer_map.get('CUST001'), None, customer_map.get('CUST001'), carrier_map.get('CX'), 'HK', 'VKHKG', 'KR', 'KRINC', (today + timedelta(days=1)).strftime('%Y-%m-%d'), (today + timedelta(days=1)).strftime('%Y-%m-%d'), 10, 'CTN', 500.000, 5.000, 800000.00, 'USD', 'PENDING')
    ]

    shipment_ids = []
    for s in shipments:
        cursor.execute("""
            INSERT INTO ORD_SHIPMENT (SHIPMENT_NO, TRANSPORT_MODE_CD, TRADE_TYPE_CD, SERVICE_TYPE_CD, INCOTERMS_CD,
                CUSTOMER_ID, SHIPPER_ID, CONSIGNEE_ID, CARRIER_ID, ORIGIN_COUNTRY_CD, ORIGIN_PORT_CD,
                DEST_COUNTRY_CD, DEST_PORT_CD, ETD_DT, ETA_DT, TOTAL_PKG_QTY, PKG_TYPE_CD, GROSS_WEIGHT_KG,
                VOLUME_CBM, DECLARED_VALUE_AMT, DECLARED_VALUE_CURR, STATUS_CD)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE SHIPMENT_NO=VALUES(SHIPMENT_NO)
        """, s)
        cursor.execute("SELECT LAST_INSERT_ID()")
        shipment_ids.append(cursor.fetchone()[0])
    print("  [OK] ORD_SHIPMENT")

    # Get actual shipment IDs
    cursor.execute("SELECT SHIPMENT_ID, SHIPMENT_NO FROM ORD_SHIPMENT")
    shipment_map = {row[1]: row[0] for row in cursor.fetchall()}

    # ORD_OCEAN_BOOKING
    cursor.execute("SELECT SCHEDULE_ID FROM SCH_OCEAN_SCHEDULE LIMIT 3")
    schedule_ids = [row[0] for row in cursor.fetchall()]

    bookings = [
        (shipment_map.get('SHP20260001'), schedule_ids[0] if len(schedule_ids) > 0 else None, carrier_map.get('HDMU'), 'HYUNDAI SINGAPORE', 'V.001E', 'KRPUS', 'USLAX', today.strftime('%Y-%m-%d'), (today + timedelta(days=14)).strftime('%Y-%m-%d'), 'CONFIRMED'),
        (shipment_map.get('SHP20260002'), schedule_ids[1] if len(schedule_ids) > 1 else None, carrier_map.get('MAEU'), 'MAERSK SEALAND', 'V.002W', 'KRPUS', 'NLRTM', today.strftime('%Y-%m-%d'), (today + timedelta(days=28)).strftime('%Y-%m-%d'), 'CONFIRMED'),
        (shipment_map.get('SHP20260004'), schedule_ids[2] if len(schedule_ids) > 2 else None, carrier_map.get('COSU'), 'COSCO GALAXY', 'V.003E', 'CNSHA', 'KRPUS', (today - timedelta(days=3)).strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d'), 'CONFIRMED')
    ]

    booking_ids = []
    for b in bookings:
        cursor.execute("""
            INSERT INTO ORD_OCEAN_BOOKING (SHIPMENT_ID, SCHEDULE_ID, CARRIER_ID, VESSEL_NM, VOYAGE_NO, POL_PORT_CD, POD_PORT_CD, ETD_DT, ETA_DT, STATUS_CD)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, b)
        cursor.execute("SELECT LAST_INSERT_ID()")
        booking_ids.append(cursor.fetchone()[0])
    print("  [OK] ORD_OCEAN_BOOKING")

    # ORD_OCEAN_BOOKING_CNTR
    cursor.execute("SELECT BOOKING_ID FROM ORD_OCEAN_BOOKING LIMIT 3")
    booking_ids_db = [row[0] for row in cursor.fetchall()]

    containers = [
        (booking_ids_db[0] if len(booking_ids_db) > 0 else None, 'HDMU1234567', '40', 'HC', 1, 25000.000, 'SL12345'),
        (booking_ids_db[0] if len(booking_ids_db) > 0 else None, 'HDMU2345678', '40', 'HC', 2, 25000.000, 'SL12346'),
        (booking_ids_db[2] if len(booking_ids_db) > 2 else None, 'COSU9876543', '20', 'GP', 1, 18000.000, 'SL99887')
    ]
    for c in containers:
        if c[0]:
            cursor.execute("""
                INSERT INTO ORD_OCEAN_BOOKING_CNTR (BOOKING_ID, CNTR_NO, CNTR_SIZE_CD, CNTR_TYPE_CD, SEQ_NO, MAX_WEIGHT_KG, SEAL_NO)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, c)
    print("  [OK] ORD_OCEAN_BOOKING_CNTR")

    # ORD_AIR_BOOKING
    cursor.execute("SELECT SCHEDULE_ID FROM SCH_AIR_SCHEDULE LIMIT 2")
    air_schedule_ids = [row[0] for row in cursor.fetchall()]

    air_bookings = [
        (shipment_map.get('SHP20260003'), air_schedule_ids[0] if len(air_schedule_ids) > 0 else None, carrier_map.get('KE'), 'KE001', 'KRINC', 'USLXP', today.strftime('%Y-%m-%d %H:%M:%S'), (today + timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S'), 2500.000, 75.000, 'CONFIRMED'),
        (shipment_map.get('SHP20260005'), air_schedule_ids[1] if len(air_schedule_ids) > 1 else None, carrier_map.get('CX'), 'CX417', 'VKHKG', 'KRINC', (today + timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S'), (today + timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S'), 500.000, 5.000, 'PENDING')
    ]
    for a in air_bookings:
        cursor.execute("""
            INSERT INTO ORD_AIR_BOOKING (SHIPMENT_ID, SCHEDULE_ID, CARRIER_ID, FLIGHT_NO, ORIGIN_PORT_CD, DEST_PORT_CD, ETD_DTM, ETA_DTM, GROSS_WEIGHT_KG, VOLUME_CBM, STATUS_CD)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, a)
    print("  [OK] ORD_AIR_BOOKING")

    return shipment_map, carrier_map, customer_map, booking_ids_db


def insert_bl_awb_data(cursor, shipment_map, carrier_map, booking_ids_db):
    """04. B/L & AWB Tables Sample Data"""
    print("\n=== 04. B/L & AWB Tables ===")

    today = datetime.now()

    # BL_MASTER_BL
    mbls = [
        ('HDMUPUS12345678', shipment_map.get('SHP20260001'), booking_ids_db[0] if len(booking_ids_db) > 0 else None, carrier_map.get('HDMU'), 'HYUNDAI SINGAPORE', 'V.001E', 'KRPUS', 'USLAX', today.strftime('%Y-%m-%d'), (today + timedelta(days=14)).strftime('%Y-%m-%d'), 'Samsung Electronics', 'ABC Trading Co.', 100, 'CTN', 5000.000, 150.000, 'ORIGINAL', 3, 'RELEASED'),
        ('MAEULAX98765432', shipment_map.get('SHP20260002'), booking_ids_db[1] if len(booking_ids_db) > 1 else None, carrier_map.get('MAEU'), 'MAERSK SEALAND', 'V.002W', 'KRPUS', 'NLRTM', today.strftime('%Y-%m-%d'), (today + timedelta(days=28)).strftime('%Y-%m-%d'), 'LG Electronics', 'XYZ Import GmbH', 200, 'CTN', 8000.000, 400.000, 'ORIGINAL', 3, 'ISSUED'),
        ('COSUPUS55667788', shipment_map.get('SHP20260004'), booking_ids_db[2] if len(booking_ids_db) > 2 else None, carrier_map.get('COSU'), 'COSCO GALAXY', 'V.003E', 'CNSHA', 'KRPUS', (today - timedelta(days=3)).strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d'), 'Shanghai Supplier', 'SK Hynix Inc.', 500, 'CTN', 2000.000, 50.000, 'ORIGINAL', 3, 'ARRIVED')
    ]

    mbl_ids = []
    for m in mbls:
        cursor.execute("""
            INSERT INTO BL_MASTER_BL (MBL_NO, SHIPMENT_ID, BOOKING_ID, CARRIER_ID, VESSEL_NM, VOYAGE_NO, POL_PORT_CD, POD_PORT_CD,
                ETD_DT, ETA_DT, SHIPPER_NM, CONSIGNEE_NM, TOTAL_PKG_QTY, PKG_TYPE_CD, GROSS_WEIGHT_KG, VOLUME_CBM, BL_TYPE_CD, ORIGINAL_BL_COUNT, STATUS_CD)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, m)
        cursor.execute("SELECT LAST_INSERT_ID()")
        mbl_ids.append(cursor.fetchone()[0])
    print("  [OK] BL_MASTER_BL")

    # BL_HOUSE_BL
    hbls = [
        ('IGSHBL20260001', mbl_ids[0], shipment_map.get('SHP20260001'), 'Samsung Electronics', '서울시 서초구 서초대로 74길 11', 'ABC Trading Co.', '1234 Main Street, Los Angeles, CA', 'Same as Consignee', 'FOB', 'KRPUS', 'USLAX', 'Semiconductor Chips', 100, 'CTN', 5000.000, 150.000, 'ORIGINAL', 3, 'RELEASED'),
        ('IGSHBL20260002', mbl_ids[1], shipment_map.get('SHP20260002'), 'LG Electronics', '서울시 영등포구 여의대로 128', 'XYZ Import GmbH', 'Hauptstrasse 123, Hamburg', 'Same as Consignee', 'CIF', 'KRPUS', 'DEHAM', 'LED TV', 200, 'CTN', 8000.000, 400.000, 'ORIGINAL', 3, 'ISSUED'),
        ('IGSHBL20260003', mbl_ids[2], shipment_map.get('SHP20260004'), 'Shanghai Supplier', 'Shanghai, China', 'SK Hynix Inc.', '경기도 이천시 부발읍 경충대로 2091', 'Same as Consignee', 'CIF', 'CNSHA', 'KRPUS', 'Memory Chips', 500, 'CTN', 2000.000, 50.000, 'ORIGINAL', 3, 'ARRIVED')
    ]
    for h in hbls:
        cursor.execute("""
            INSERT INTO BL_HOUSE_BL (HBL_NO, MBL_ID, SHIPMENT_ID, SHIPPER_NM, SHIPPER_ADDR, CONSIGNEE_NM, CONSIGNEE_ADDR,
                NOTIFY_PARTY, INCOTERMS_CD, POL_PORT_CD, POD_PORT_CD, COMMODITY_DESC, TOTAL_PKG_QTY, PKG_TYPE_CD,
                GROSS_WEIGHT_KG, VOLUME_CBM, BL_TYPE_CD, ORIGINAL_BL_COUNT, STATUS_CD)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, h)
    print("  [OK] BL_HOUSE_BL")

    # BL_CONTAINER
    bl_containers = [
        (mbl_ids[0], 'HDMU1234567', '40', 'HC', 'SL12345', 5000.000, 150.000, 30000.000, 4200.000),
        (mbl_ids[0], 'HDMU2345678', '40', 'HC', 'SL12346', 5000.000, 150.000, 30000.000, 4200.000),
        (mbl_ids[2], 'COSU9876543', '20', 'GP', 'SL99887', 18000.000, 28.000, 24000.000, 2350.000)
    ]
    for c in bl_containers:
        cursor.execute("""
            INSERT INTO BL_CONTAINER (MBL_ID, CNTR_NO, CNTR_SIZE_CD, CNTR_TYPE_CD, SEAL_NO, GROSS_WEIGHT_KG, VOLUME_CBM, MAX_WEIGHT_KG, TARE_WEIGHT_KG)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, c)
    print("  [OK] BL_CONTAINER")

    # BL_MASTER_AWB
    mawbs = [
        ('180-12345670', shipment_map.get('SHP20260003'), carrier_map.get('KE'), 'KE001', 'KRINC', 'USLXP', today.strftime('%Y-%m-%d'), (today + timedelta(days=1)).strftime('%Y-%m-%d'), 'Hyundai Motor Company', 'Global Parts Inc.', 2500.000, 75.000, 'DEPARTED'),
        ('160-11112220', shipment_map.get('SHP20260005'), carrier_map.get('CX'), 'CX417', 'VKHKG', 'KRINC', (today + timedelta(days=1)).strftime('%Y-%m-%d'), (today + timedelta(days=1)).strftime('%Y-%m-%d'), 'HK Supplier Ltd.', 'Samsung Electronics', 500.000, 5.000, 'PENDING')
    ]

    mawb_ids = []
    for m in mawbs:
        cursor.execute("""
            INSERT INTO BL_MASTER_AWB (MAWB_NO, SHIPMENT_ID, CARRIER_ID, FLIGHT_NO, ORIGIN_PORT_CD, DEST_PORT_CD,
                ETD_DT, ETA_DT, SHIPPER_NM, CONSIGNEE_NM, GROSS_WEIGHT_KG, VOLUME_CBM, STATUS_CD)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, m)
        cursor.execute("SELECT LAST_INSERT_ID()")
        mawb_ids.append(cursor.fetchone()[0])
    print("  [OK] BL_MASTER_AWB")

    # BL_HOUSE_AWB
    hawbs = [
        ('IGSHAWB20260001', mawb_ids[0], shipment_map.get('SHP20260003'), 'Hyundai Motor Company', '서울시 서초구 헌릉로 12', 'Global Parts Inc.', '5678 Industrial Blvd, Chicago, IL', 'Same as Consignee', 'Engine Parts', 50, 'PLT', 2500.000, 75.000, 150000.00, 'USD', 'DEPARTED'),
        ('IGSHAWB20260002', mawb_ids[1], shipment_map.get('SHP20260005'), 'HK Supplier Ltd.', 'Kowloon, Hong Kong', 'Samsung Electronics', '서울시 서초구 서초대로 74길 11', 'Same as Consignee', 'IC Components', 10, 'CTN', 500.000, 5.000, 800000.00, 'USD', 'PENDING')
    ]
    for h in hawbs:
        cursor.execute("""
            INSERT INTO BL_HOUSE_AWB (HAWB_NO, MAWB_ID, SHIPMENT_ID, SHIPPER_NM, SHIPPER_ADDR, CONSIGNEE_NM,
                CONSIGNEE_ADDR, NOTIFY_PARTY, COMMODITY_DESC, TOTAL_PKG_QTY, PKG_TYPE_CD, GROSS_WEIGHT_KG,
                VOLUME_CBM, DECLARED_VALUE_AMT, DECLARED_VALUE_CURR, STATUS_CD)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, h)
    print("  [OK] BL_HOUSE_AWB")

    return mbl_ids, mawb_ids


def insert_tracking_data(cursor, shipment_map):
    """05. Tracking & Transport Tables Sample Data"""
    print("\n=== 05. Shipment & Transport Tables ===")

    today = datetime.now()

    # SHP_TRACKING_EVENT
    events = [
        (shipment_map.get('SHP20260001'), (today - timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S'), 'BKD', 'Booking Confirmed', 'KRPUS', None),
        (shipment_map.get('SHP20260001'), (today - timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S'), 'GIN', 'Gate In at Terminal', 'KRPUS', 'HDMU1234567'),
        (shipment_map.get('SHP20260001'), today.strftime('%Y-%m-%d %H:%M:%S'), 'LOD', 'Loaded on Vessel', 'KRPUS', 'HDMU1234567'),
        (shipment_map.get('SHP20260001'), today.strftime('%Y-%m-%d %H:%M:%S'), 'DEP', 'Vessel Departed', 'KRPUS', None),
        (shipment_map.get('SHP20260003'), (today - timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S'), 'BKD', 'Booking Confirmed', 'KRINC', None),
        (shipment_map.get('SHP20260003'), today.strftime('%Y-%m-%d %H:%M:%S'), 'DEP', 'Flight Departed', 'KRINC', None),
        (shipment_map.get('SHP20260004'), (today - timedelta(days=5)).strftime('%Y-%m-%d %H:%M:%S'), 'DEP', 'Vessel Departed', 'CNSHA', None),
        (shipment_map.get('SHP20260004'), today.strftime('%Y-%m-%d %H:%M:%S'), 'ARR', 'Vessel Arrived', 'KRPUS', None),
        (shipment_map.get('SHP20260004'), today.strftime('%Y-%m-%d %H:%M:%S'), 'DIS', 'Discharged from Vessel', 'KRPUS', 'COSU9876543')
    ]
    for e in events:
        if e[0]:
            cursor.execute("""
                INSERT INTO SHP_TRACKING_EVENT (SHIPMENT_ID, EVENT_DTM, EVENT_CD, EVENT_DESC, LOCATION_CD, CNTR_NO)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, e)
    print("  [OK] SHP_TRACKING_EVENT")

    # TRN_WAREHOUSE
    warehouses = [
        ('WH001', 'Busan CFS', 'Busan CFS', 'CFS', '부산시 중구 부두로', 'Busan', 'KR', '김창고', '051-123-4567', 'wh@busancfs.kr'),
        ('WH002', 'Incheon Bonded', 'Incheon Bonded WH', 'BONDED', '인천시 중구 공항로', 'Incheon', 'KR', '이창고', '032-234-5678', 'wh@incheonbonded.kr'),
        ('WH003', 'Seoul Distribution', 'Seoul Distribution Center', 'GENERAL', '서울시 강서구 공항대로', 'Seoul', 'KR', '박창고', '02-345-6789', 'wh@seouldist.kr')
    ]
    for w in warehouses:
        cursor.execute("""
            INSERT INTO TRN_WAREHOUSE (WAREHOUSE_CD, WAREHOUSE_NM, WAREHOUSE_NM_EN, WAREHOUSE_TYPE_CD, ADDR, CITY, COUNTRY_CD, CONTACT_NM, TEL_NO, EMAIL, USE_YN)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Y')
            ON DUPLICATE KEY UPDATE WAREHOUSE_NM=VALUES(WAREHOUSE_NM)
        """, w)
    print("  [OK] TRN_WAREHOUSE")

    # TRN_TRANSPORT_ORDER
    transport_orders = [
        (shipment_map.get('SHP20260001'), 'PICKUP', 'TRUCK', 'TRUCK001', '12가1234', '김기사', '010-1111-2222', '서울시 서초구 서초대로 74길 11', (today - timedelta(days=2)).strftime('%Y-%m-%d'), '09:00:00', '부산시 중구 부두로 CY', (today - timedelta(days=2)).strftime('%Y-%m-%d'), '15:00:00', 'COMPLETED'),
        (shipment_map.get('SHP20260004'), 'DELIVERY', 'TRUCK', 'TRUCK002', '34나5678', '이기사', '010-3333-4444', '부산항 CY', today.strftime('%Y-%m-%d'), '10:00:00', '경기도 이천시 부발읍 경충대로 2091', today.strftime('%Y-%m-%d'), '16:00:00', 'IN_TRANSIT')
    ]
    for t in transport_orders:
        if t[0]:
            cursor.execute("""
                INSERT INTO TRN_TRANSPORT_ORDER (SHIPMENT_ID, TRANSPORT_TYPE_CD, TRANSPORT_MODE_CD, TRUCKER_CD, VEHICLE_NO,
                    DRIVER_NM, DRIVER_MOBILE, PICKUP_ADDR, PICKUP_DT, PICKUP_TIME, DELIVERY_ADDR, DELIVERY_DT, DELIVERY_TIME, STATUS_CD)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, t)
    print("  [OK] TRN_TRANSPORT_ORDER")

    # TRN_CONTAINER_MOVEMENT
    movements = [
        ('HDMU1234567', shipment_map.get('SHP20260001'), 'GATE_IN', 'CY', 'KRPUS', 'Busan New Port', (today - timedelta(days=1)).strftime('%Y-%m-%d'), '10:30:00', 'SL12345', 'N'),
        ('HDMU1234567', shipment_map.get('SHP20260001'), 'LOAD', 'PORT', 'KRPUS', 'Busan New Port', today.strftime('%Y-%m-%d'), '08:00:00', 'SL12345', 'N'),
        ('COSU9876543', shipment_map.get('SHP20260004'), 'DISCHARGE', 'PORT', 'KRPUS', 'Busan New Port', today.strftime('%Y-%m-%d'), '06:00:00', 'SL99887', 'N'),
        ('COSU9876543', shipment_map.get('SHP20260004'), 'GATE_OUT', 'CY', 'KRPUS', 'Busan New Port', today.strftime('%Y-%m-%d'), '11:00:00', 'SL99887', 'N')
    ]
    for m in movements:
        if m[1]:
            cursor.execute("""
                INSERT INTO TRN_CONTAINER_MOVEMENT (CNTR_NO, SHIPMENT_ID, MOVEMENT_TYPE_CD, LOCATION_TYPE_CD,
                    LOCATION_CD, LOCATION_NM, MOVEMENT_DT, MOVEMENT_TIME, SEAL_NO, DAMAGE_YN)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, m)
    print("  [OK] TRN_CONTAINER_MOVEMENT")


def insert_customs_data(cursor, shipment_map):
    """06. Customs Tables Sample Data"""
    print("\n=== 06. Customs Tables ===")

    today = datetime.now()

    # CUS_DECLARATION
    declarations = [
        (shipment_map.get('SHP20260001'), '20260116-001234', 'EXPORT', today.strftime('%Y-%m-%d'), 'BROKER001', '홍길동', 'Samsung Electronics', '124-81-00998', '8542310000', 'Semiconductor Chips', 'KR', 100, 5000.000, 1500000.00, 'USD', 0.00, 0.00, 0.00, 'CLEARED', today.strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d')),
        (shipment_map.get('SHP20260004'), '20260116-005678', 'IMPORT', today.strftime('%Y-%m-%d'), 'BROKER002', '김통관', 'SK Hynix Inc.', '214-86-05453', '8542320000', 'Memory Chips', 'CN', 500, 2000.000, 2500000.00, 'USD', 0.00, 250000.00, 250000.00, 'CLEARED', today.strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d'))
    ]

    decl_ids = []
    for d in declarations:
        if d[0]:
            cursor.execute("""
                INSERT INTO CUS_DECLARATION (SHIPMENT_ID, DECLARATION_NO, DECLARATION_TYPE_CD, DECLARATION_DT,
                    BROKER_CD, DECLARANT_NM, IMPORTER_EXPORTER_NM, BIZ_REG_NO, HS_CD, COMMODITY_DESC,
                    COUNTRY_ORIGIN_CD, PKG_QTY, GROSS_WEIGHT_KG, DECLARED_VALUE_AMT, CURRENCY_CD,
                    DUTY_AMT, VAT_AMT, TOTAL_TAX_AMT, STATUS_CD, CLEARANCE_DT, RELEASE_DT)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, d)
            cursor.execute("SELECT LAST_INSERT_ID()")
            decl_ids.append(cursor.fetchone()[0])
    print("  [OK] CUS_DECLARATION")

    # CUS_DECLARATION_ITEM
    if len(decl_ids) >= 2:
        items = [
            (decl_ids[0], 1, '8542310000', 'Semiconductor Chips - Processors', 'KR', 100.000, 'EA', 15000.0000, 1500000.00, 'USD', 0.0000, 0.00, 0.0000, 0.00),
            (decl_ids[1], 1, '8542320000', 'Memory Chips - DRAM', 'CN', 300.000, 'EA', 5000.0000, 1500000.00, 'USD', 0.0000, 0.00, 10.0000, 150000.00),
            (decl_ids[1], 2, '8542320000', 'Memory Chips - NAND', 'CN', 200.000, 'EA', 5000.0000, 1000000.00, 'USD', 0.0000, 0.00, 10.0000, 100000.00)
        ]
        for i in items:
            cursor.execute("""
                INSERT INTO CUS_DECLARATION_ITEM (DECLARATION_ID, LINE_NO, HS_CD, COMMODITY_DESC, COUNTRY_ORIGIN_CD,
                    QTY, UNIT_CD, UNIT_PRICE, AMT, CURRENCY_CD, DUTY_RATE, DUTY_AMT, VAT_RATE, VAT_AMT)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, i)
        print("  [OK] CUS_DECLARATION_ITEM")

        # CUS_DUTY_PAYMENT
        payments = [
            (decl_ids[1], 'VAT', today.strftime('%Y-%m-%d'), (today + timedelta(days=15)).strftime('%Y-%m-%d'), 250000.00, 'KRW', 'BANK_TRANSFER', 'KEB Hana Bank', '123-456789-01', 'PAY20260116001', 'PAID')
        ]
        for p in payments:
            cursor.execute("""
                INSERT INTO CUS_DUTY_PAYMENT (DECLARATION_ID, PAYMENT_TYPE_CD, PAYMENT_DT, DUE_DT, AMT,
                    CURRENCY_CD, PAYMENT_METHOD_CD, BANK_NM, ACCOUNT_NO, REFERENCE_NO, STATUS_CD)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, p)
        print("  [OK] CUS_DUTY_PAYMENT")


def insert_billing_data(cursor, shipment_map, customer_map):
    """07. Billing Tables Sample Data"""
    print("\n=== 07. Billing Tables ===")

    today = datetime.now()

    # BIL_CONTRACT
    contracts = [
        (customer_map.get('CUST001'), 'CT-2026-001', 'Samsung Forwarding Contract', 'STANDARD', (today - timedelta(days=180)).strftime('%Y-%m-%d'), (today + timedelta(days=185)).strftime('%Y-%m-%d'), 'Y', 30, 500000000.00, 'KRW', 'ACTIVE'),
        (customer_map.get('CUST002'), 'CT-2026-002', 'LG Logistics Contract', 'STANDARD', (today - timedelta(days=90)).strftime('%Y-%m-%d'), (today + timedelta(days=275)).strftime('%Y-%m-%d'), 'Y', 45, 300000000.00, 'KRW', 'ACTIVE'),
        (customer_map.get('CUST003'), 'CT-2026-003', 'Hyundai Transport Contract', 'PREMIUM', (today - timedelta(days=365)).strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d'), 'N', 60, 1000000000.00, 'KRW', 'ACTIVE')
    ]

    contract_ids = []
    for c in contracts:
        if c[0]:
            cursor.execute("""
                INSERT INTO BIL_CONTRACT (CUSTOMER_ID, CONTRACT_NO, CONTRACT_NM, CONTRACT_TYPE_CD, START_DT, END_DT,
                    AUTO_RENEW_YN, PAYMENT_TERM_DAYS, CREDIT_LIMIT_AMT, CURRENCY_CD, STATUS_CD)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, c)
            cursor.execute("SELECT LAST_INSERT_ID()")
            contract_ids.append(cursor.fetchone()[0])
    print("  [OK] BIL_CONTRACT")

    # BIL_TARIFF
    tariffs = [
        (None, 'SEA', 'EXPORT', 'OFR', 'Ocean Freight', 'PER_UNIT', 'CNTR', 1500.0000, 'USD', 1500.00, None, 'KRPUS', 'USLAX', 'HDMU', '40HC', (today - timedelta(days=90)).strftime('%Y-%m-%d'), (today + timedelta(days=275)).strftime('%Y-%m-%d')),
        (None, 'SEA', 'EXPORT', 'THC', 'Terminal Handling', 'PER_UNIT', 'CNTR', 150000.0000, 'KRW', 150000.00, None, 'KRPUS', None, None, '40HC', (today - timedelta(days=90)).strftime('%Y-%m-%d'), (today + timedelta(days=275)).strftime('%Y-%m-%d')),
        (None, 'SEA', 'EXPORT', 'DOC', 'Documentation Fee', 'FIXED', 'BL', 50000.0000, 'KRW', 50000.00, None, None, None, None, None, (today - timedelta(days=90)).strftime('%Y-%m-%d'), (today + timedelta(days=275)).strftime('%Y-%m-%d')),
        (None, 'AIR', 'EXPORT', 'AFR', 'Air Freight', 'PER_UNIT', 'KG', 5.5000, 'USD', 100.00, None, 'KRINC', 'USLXP', 'KE', None, (today - timedelta(days=90)).strftime('%Y-%m-%d'), (today + timedelta(days=275)).strftime('%Y-%m-%d')),
        (contract_ids[0] if len(contract_ids) > 0 else None, 'SEA', 'EXPORT', 'OFR', 'Ocean Freight (Contract)', 'PER_UNIT', 'CNTR', 1400.0000, 'USD', 1400.00, None, 'KRPUS', 'USLAX', 'HDMU', '40HC', (today - timedelta(days=90)).strftime('%Y-%m-%d'), (today + timedelta(days=275)).strftime('%Y-%m-%d'))
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
        (shipment_map.get('SHP20260001'), 'AR', 'THC', 'Terminal Handling', customer_map.get('CUST001'), 2.000, 'CNTR', 150000.0000, 300000.00, 'KRW', 1.000000, 300000.00, 'Y', 10.0000, 30000.00, 330000.00, 'INVOICED', 'Y'),
        (shipment_map.get('SHP20260001'), 'AR', 'DOC', 'Documentation Fee', customer_map.get('CUST001'), 1.000, 'BL', 50000.0000, 50000.00, 'KRW', 1.000000, 50000.00, 'Y', 10.0000, 5000.00, 55000.00, 'INVOICED', 'Y'),
        (shipment_map.get('SHP20260003'), 'AR', 'AFR', 'Air Freight', customer_map.get('CUST003'), 2500.000, 'KG', 5.5000, 13750.00, 'USD', 1350.000000, 18562500.00, 'N', 0.0000, 0.00, 18562500.00, 'PENDING', 'Y')
    ]

    charge_ids = []
    for c in charges:
        if c[0] and c[4]:
            cursor.execute("""
                INSERT INTO BIL_CHARGE (SHIPMENT_ID, CHARGE_TYPE_CD, CHARGE_CD, CHARGE_NM, CUSTOMER_ID,
                    QTY, UNIT_TYPE_CD, UNIT_PRICE, AMT, CURRENCY_CD, EXCHANGE_RATE, LOCAL_AMT,
                    TAX_YN, TAX_RATE, TAX_AMT, TOTAL_AMT, STATUS_CD, AUTO_RATED_YN)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, c)
            cursor.execute("SELECT LAST_INSERT_ID()")
            charge_ids.append(cursor.fetchone()[0])
    print("  [OK] BIL_CHARGE")

    # BIL_INVOICE
    invoices = [
        ('INV-2026-0001', 'AR', today.strftime('%Y-%m-%d'), (today + timedelta(days=30)).strftime('%Y-%m-%d'), customer_map.get('CUST001'), 'Samsung Electronics', '서울시 서초구 서초대로 74길 11', 4130000.00, 35000.00, 4165000.00, 'KRW', 0.00, 4165000.00, 'ISSUED', today.strftime('%Y-%m-%d')),
        ('INV-2026-0002', 'AR', today.strftime('%Y-%m-%d'), (today + timedelta(days=60)).strftime('%Y-%m-%d'), customer_map.get('CUST003'), 'Hyundai Motor Company', '서울시 서초구 헌릉로 12', 18562500.00, 0.00, 18562500.00, 'KRW', 0.00, 18562500.00, 'DRAFT', None)
    ]

    invoice_ids = []
    for i in invoices:
        if i[4]:
            cursor.execute("""
                INSERT INTO BIL_INVOICE (INVOICE_NO, INVOICE_TYPE_CD, INVOICE_DT, DUE_DT, CUSTOMER_ID,
                    CUSTOMER_NM, BILL_TO_ADDR, SUBTOTAL_AMT, TAX_AMT, TOTAL_AMT, CURRENCY_CD,
                    PAID_AMT, BALANCE_AMT, STATUS_CD, ISSUED_DT)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, i)
            cursor.execute("SELECT LAST_INSERT_ID()")
            invoice_ids.append(cursor.fetchone()[0])
    print("  [OK] BIL_INVOICE")

    # BIL_INVOICE_DETAIL
    if len(invoice_ids) > 0 and len(charge_ids) >= 3:
        inv_details = [
            (invoice_ids[0], 1, charge_ids[0], shipment_map.get('SHP20260001'), 'Ocean Freight (2x40HC)', 2.000, 1890000.0000, 3780000.00, 0.00, 3780000.00),
            (invoice_ids[0], 2, charge_ids[1], shipment_map.get('SHP20260001'), 'Terminal Handling (2x40HC)', 2.000, 150000.0000, 300000.00, 30000.00, 330000.00),
            (invoice_ids[0], 3, charge_ids[2], shipment_map.get('SHP20260001'), 'Documentation Fee', 1.000, 50000.0000, 50000.00, 5000.00, 55000.00)
        ]
        for d in inv_details:
            cursor.execute("""
                INSERT INTO BIL_INVOICE_DETAIL (INVOICE_ID, LINE_NO, CHARGE_ID, SHIPMENT_ID, DESCRIPTION,
                    QTY, UNIT_PRICE, AMT, TAX_AMT, TOTAL_AMT)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, d)
        print("  [OK] BIL_INVOICE_DETAIL")

    # BIL_PROFIT_ANALYSIS
    if shipment_map.get('SHP20260001'):
        cursor.execute("""
            INSERT INTO BIL_PROFIT_ANALYSIS (SHIPMENT_ID, ANALYSIS_DT, REVENUE_TOTAL_AMT, COST_TOTAL_AMT,
                GROSS_PROFIT_AMT, PROFIT_MARGIN_RATE, CURRENCY_CD)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (shipment_map.get('SHP20260001'), today.strftime('%Y-%m-%d'), 4165000.00, 3645000.00, 520000.00, 12.4940, 'KRW'))
        print("  [OK] BIL_PROFIT_ANALYSIS")


def main():
    print("=" * 60)
    print("FMS Database - Sample Data Insertion")
    print("=" * 60)

    conn = get_connection()
    cursor = conn.cursor()

    try:
        insert_master_data(cursor)
        conn.commit()

        insert_schedule_data(cursor)
        conn.commit()

        shipment_map, carrier_map, customer_map, booking_ids_db = insert_order_shipment_data(cursor)
        conn.commit()

        mbl_ids, mawb_ids = insert_bl_awb_data(cursor, shipment_map, carrier_map, booking_ids_db)
        conn.commit()

        insert_tracking_data(cursor, shipment_map)
        conn.commit()

        insert_customs_data(cursor, shipment_map)
        conn.commit()

        insert_billing_data(cursor, shipment_map, customer_map)
        conn.commit()

        print("\n" + "=" * 60)
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
