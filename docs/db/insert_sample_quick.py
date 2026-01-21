#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Quick Sample Data Insertion"""

import pymysql
from datetime import datetime, timedelta

conn = pymysql.connect(host='211.236.174.220', port=53306, user='user', password='P@ssw0rd', database='logstic', charset='utf8mb4')
cursor = conn.cursor()
today = datetime.now()

print('=== Inserting Sample Data ===')

# MST_COMPANY
try:
    cursor.execute("""
        INSERT IGNORE INTO MST_COMPANY (COMPANY_CD, COMPANY_NM, COMPANY_NM_EN, BIZ_REG_NO, CEO_NM, ADDR, TEL_NO, EMAIL, COUNTRY_CD, USE_YN)
        VALUES ('COMP001', '인터지스', 'INTERGIS Co., Ltd.', '123-45-67890', '홍길동', '서울시 강남구 테헤란로 123', '02-1234-5678', 'info@intergis.co.kr', 'KR', 'Y')
    """)
    conn.commit()
    print('[OK] MST_COMPANY')
except Exception as e:
    print(f'[SKIP] MST_COMPANY: {e}')

# MST_COUNTRY
countries = [('KR', 'KOR', '대한민국', 'Korea'), ('US', 'USA', '미국', 'United States'), ('CN', 'CHN', '중국', 'China'), ('JP', 'JPN', '일본', 'Japan'), ('HK', 'HKG', '홍콩', 'Hong Kong'), ('SG', 'SGP', '싱가포르', 'Singapore'), ('DE', 'DEU', '독일', 'Germany')]
try:
    for c in countries:
        cursor.execute('INSERT IGNORE INTO MST_COUNTRY (COUNTRY_CD, COUNTRY_CD3, COUNTRY_NM, COUNTRY_NM_EN, USE_YN) VALUES (%s, %s, %s, %s, "Y")', c)
    conn.commit()
    print('[OK] MST_COUNTRY')
except Exception as e:
    print(f'[SKIP] MST_COUNTRY: {e}')

# MST_PORT
ports = [('KRPUS', '부산항', 'Busan Port', 'KR', 'SEA'), ('KRINC', '인천공항', 'Incheon Airport', 'KR', 'AIR'), ('CNSHA', '상해항', 'Shanghai Port', 'CN', 'SEA'), ('USLAX', 'LA항', 'Los Angeles Port', 'US', 'SEA'), ('DEHAM', '함부르크항', 'Hamburg Port', 'DE', 'SEA')]
try:
    for p in ports:
        cursor.execute('INSERT IGNORE INTO MST_PORT (PORT_CD, PORT_NM, PORT_NM_EN, COUNTRY_CD, PORT_TYPE_CD, USE_YN) VALUES (%s, %s, %s, %s, %s, "Y")', p)
    conn.commit()
    print('[OK] MST_PORT')
except Exception as e:
    print(f'[SKIP] MST_PORT: {e}')

# MST_CURRENCY
currencies = [('KRW', '원화', 'W', 0), ('USD', '미달러', '$', 2), ('EUR', '유로', 'E', 2), ('JPY', '엔화', 'Y', 0), ('CNY', '위안화', 'Y', 2)]
try:
    for c in currencies:
        cursor.execute('INSERT IGNORE INTO MST_CURRENCY (CURRENCY_CD, CURRENCY_NM, CURRENCY_SYMBOL, DECIMAL_PLACES, USE_YN) VALUES (%s, %s, %s, %s, "Y")', c)
    conn.commit()
    print('[OK] MST_CURRENCY')
except Exception as e:
    print(f'[SKIP] MST_CURRENCY: {e}')

# MST_CARRIER
carriers = [('HDMU', 'HMM', 'HMM Co., Ltd.', 'SEA', 'HDMU', None, None, 'KR'), ('MAEU', 'MAERSK', 'Maersk Line', 'SEA', 'MAEU', None, None, 'DK'), ('COSU', 'COSCO', 'COSCO Shipping', 'SEA', 'COSU', None, None, 'CN'), ('KE', 'KOREAN AIR', 'Korean Air', 'AIR', None, 'KE', 'KAL', 'KR'), ('OZ', 'ASIANA', 'Asiana Airlines', 'AIR', None, 'OZ', 'AAR', 'KR')]
try:
    for c in carriers:
        cursor.execute('INSERT IGNORE INTO MST_CARRIER (CARRIER_CD, CARRIER_NM, CARRIER_NM_EN, CARRIER_TYPE_CD, SCAC_CD, IATA_CD, ICAO_CD, COUNTRY_CD, USE_YN) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, "Y")', c)
    conn.commit()
    print('[OK] MST_CARRIER')
except Exception as e:
    print(f'[SKIP] MST_CARRIER: {e}')

# MST_CUSTOMER
customers = [
    ('CUST001', '삼성전자', 'Samsung Electronics', 'SHIPPER', '124-81-00998', '홍길동', 'KR', '서울시 서초구', '02-2255-0114', 'logistics@samsung.com'),
    ('CUST002', 'LG전자', 'LG Electronics', 'SHIPPER', '107-86-14075', '김철수', 'KR', '서울시 영등포구', '02-3777-1114', 'logistics@lge.com'),
    ('CUST003', '현대자동차', 'Hyundai Motor', 'SHIPPER', '101-81-15116', '이영희', 'KR', '서울시 서초구', '02-3464-1114', 'logistics@hyundai.com'),
    ('CUST004', 'ABC Trading', 'ABC Trading Co.', 'CONSIGNEE', '98-7654321', 'John Smith', 'US', 'Los Angeles, CA', '+1-213-555-0100', 'import@abctrading.com')
]
try:
    for c in customers:
        cursor.execute('INSERT IGNORE INTO MST_CUSTOMER (CUSTOMER_CD, CUSTOMER_NM, CUSTOMER_NM_EN, CUSTOMER_TYPE_CD, BIZ_REG_NO, CEO_NM, COUNTRY_CD, ADDR, TEL_NO, EMAIL, USE_YN) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "Y")', c)
    conn.commit()
    print('[OK] MST_CUSTOMER')
except Exception as e:
    print(f'[SKIP] MST_CUSTOMER: {e}')

# Get IDs for foreign keys
cursor.execute('SELECT CARRIER_ID, CARRIER_CD FROM MST_CARRIER')
carrier_map = {row[1]: row[0] for row in cursor.fetchall()}
cursor.execute('SELECT CUSTOMER_ID, CUSTOMER_CD FROM MST_CUSTOMER')
customer_map = {row[1]: row[0] for row in cursor.fetchall()}

# SCH_OCEAN_SCHEDULE
try:
    schedules = [
        ('HDMU', 'HYUNDAI SINGAPORE', 'V.001E', 'KRPUS', 'USLAX', today.strftime('%Y-%m-%d'), (today + timedelta(days=14)).strftime('%Y-%m-%d'), 14, (today - timedelta(days=3)).strftime('%Y-%m-%d'), (today - timedelta(days=1)).strftime('%Y-%m-%d')),
        ('MAEU', 'MAERSK SEALAND', 'V.002W', 'KRPUS', 'DEHAM', today.strftime('%Y-%m-%d'), (today + timedelta(days=28)).strftime('%Y-%m-%d'), 28, (today - timedelta(days=5)).strftime('%Y-%m-%d'), (today - timedelta(days=2)).strftime('%Y-%m-%d'))
    ]
    for s in schedules:
        cursor.execute('INSERT IGNORE INTO SCH_OCEAN_SCHEDULE (CARRIER_CD, VESSEL_NM, VOYAGE_NO, POL_PORT_CD, POD_PORT_CD, ETD_DT, ETA_DT, TRANSIT_DAYS, DOC_CUTOFF_DT, CARGO_CUTOFF_DT, USE_YN) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "Y")', s)
    conn.commit()
    print('[OK] SCH_OCEAN_SCHEDULE')
except Exception as e:
    print(f'[SKIP] SCH_OCEAN_SCHEDULE: {e}')

# ORD_SHIPMENT
try:
    shipments = [
        ('SHP20260001', 'SEA', 'EXPORT', 'CY-CY', 'FOB', customer_map.get('CUST001'), customer_map.get('CUST001'), customer_map.get('CUST004'), carrier_map.get('HDMU'), 'KR', 'KRPUS', 'US', 'USLAX', today.strftime('%Y-%m-%d'), (today + timedelta(days=14)).strftime('%Y-%m-%d'), 100, 'CTN', 5000.000, 150.000, 1500000.00, 'USD', 'SHIPPED'),
        ('SHP20260002', 'SEA', 'EXPORT', 'CFS-CFS', 'CIF', customer_map.get('CUST002'), customer_map.get('CUST002'), customer_map.get('CUST004'), carrier_map.get('MAEU'), 'KR', 'KRPUS', 'DE', 'DEHAM', today.strftime('%Y-%m-%d'), (today + timedelta(days=28)).strftime('%Y-%m-%d'), 200, 'CTN', 8000.000, 400.000, 200000.00, 'USD', 'BOOKED'),
        ('SHP20260003', 'AIR', 'EXPORT', 'D2D', 'FOB', customer_map.get('CUST003'), customer_map.get('CUST003'), customer_map.get('CUST004'), carrier_map.get('KE'), 'KR', 'KRINC', 'US', 'USLAX', today.strftime('%Y-%m-%d'), (today + timedelta(days=1)).strftime('%Y-%m-%d'), 50, 'PLT', 2500.000, 75.000, 150000.00, 'USD', 'DEPARTED')
    ]
    for s in shipments:
        cursor.execute('''INSERT IGNORE INTO ORD_SHIPMENT (SHIPMENT_NO, TRANSPORT_MODE_CD, TRADE_TYPE_CD, SERVICE_TYPE_CD, INCOTERMS_CD,
            CUSTOMER_ID, SHIPPER_ID, CONSIGNEE_ID, CARRIER_ID, ORIGIN_COUNTRY_CD, ORIGIN_PORT_CD,
            DEST_COUNTRY_CD, DEST_PORT_CD, ETD_DT, ETA_DT, TOTAL_PKG_QTY, PKG_TYPE_CD, GROSS_WEIGHT_KG,
            VOLUME_CBM, DECLARED_VALUE_AMT, DECLARED_VALUE_CURR, STATUS_CD) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''', s)
    conn.commit()
    print('[OK] ORD_SHIPMENT')
except Exception as e:
    print(f'[SKIP] ORD_SHIPMENT: {e}')

# Get shipment IDs
cursor.execute('SELECT SHIPMENT_ID, SHIPMENT_NO FROM ORD_SHIPMENT')
shipment_map = {row[1]: row[0] for row in cursor.fetchall()}
cursor.execute('SELECT SCHEDULE_ID FROM SCH_OCEAN_SCHEDULE LIMIT 2')
schedule_ids = [row[0] for row in cursor.fetchall()]

# ORD_OCEAN_BOOKING
try:
    if shipment_map.get('SHP20260001') and schedule_ids:
        cursor.execute('INSERT INTO ORD_OCEAN_BOOKING (SHIPMENT_ID, SCHEDULE_ID, CARRIER_ID, VESSEL_NM, VOYAGE_NO, POL_PORT_CD, POD_PORT_CD, ETD_DT, ETA_DT, STATUS_CD) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)',
            (shipment_map.get('SHP20260001'), schedule_ids[0], carrier_map.get('HDMU'), 'HYUNDAI SINGAPORE', 'V.001E', 'KRPUS', 'USLAX', today.strftime('%Y-%m-%d'), (today + timedelta(days=14)).strftime('%Y-%m-%d'), 'CONFIRMED'))
    conn.commit()
    print('[OK] ORD_OCEAN_BOOKING')
except Exception as e:
    print(f'[SKIP] ORD_OCEAN_BOOKING: {e}')

# BL_MASTER_BL
cursor.execute('SELECT BOOKING_ID FROM ORD_OCEAN_BOOKING LIMIT 1')
booking = cursor.fetchone()
booking_id = booking[0] if booking else None
try:
    if shipment_map.get('SHP20260001'):
        cursor.execute('''INSERT INTO BL_MASTER_BL (MBL_NO, SHIPMENT_ID, BOOKING_ID, CARRIER_ID, VESSEL_NM, VOYAGE_NO, POL_PORT_CD, POD_PORT_CD,
            ETD_DT, ETA_DT, SHIPPER_NM, CONSIGNEE_NM, TOTAL_PKG_QTY, PKG_TYPE_CD, GROSS_WEIGHT_KG, VOLUME_CBM, BL_TYPE_CD, ORIGINAL_BL_COUNT, STATUS_CD)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''',
            ('HDMUPUS12345678', shipment_map.get('SHP20260001'), booking_id, carrier_map.get('HDMU'), 'HYUNDAI SINGAPORE', 'V.001E', 'KRPUS', 'USLAX', today.strftime('%Y-%m-%d'), (today + timedelta(days=14)).strftime('%Y-%m-%d'), 'Samsung Electronics', 'ABC Trading Co.', 100, 'CTN', 5000.000, 150.000, 'ORIGINAL', 3, 'RELEASED'))
    conn.commit()
    print('[OK] BL_MASTER_BL')
except Exception as e:
    print(f'[SKIP] BL_MASTER_BL: {e}')

# BL_HOUSE_BL
cursor.execute('SELECT MBL_ID FROM BL_MASTER_BL LIMIT 1')
mbl = cursor.fetchone()
mbl_id = mbl[0] if mbl else None
try:
    if mbl_id:
        cursor.execute('''INSERT INTO BL_HOUSE_BL (HBL_NO, MBL_ID, SHIPMENT_ID, SHIPPER_NM, SHIPPER_ADDR, CONSIGNEE_NM, CONSIGNEE_ADDR,
            NOTIFY_PARTY, INCOTERMS_CD, POL_PORT_CD, POD_PORT_CD, COMMODITY_DESC, TOTAL_PKG_QTY, PKG_TYPE_CD,
            GROSS_WEIGHT_KG, VOLUME_CBM, BL_TYPE_CD, ORIGINAL_BL_COUNT, STATUS_CD) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''',
            ('IGSHBL20260001', mbl_id, shipment_map.get('SHP20260001'), 'Samsung Electronics', 'Seoul, Korea', 'ABC Trading Co.', 'Los Angeles, CA', 'Same as Consignee', 'FOB', 'KRPUS', 'USLAX', 'Semiconductor Chips', 100, 'CTN', 5000.000, 150.000, 'ORIGINAL', 3, 'RELEASED'))
    conn.commit()
    print('[OK] BL_HOUSE_BL')
except Exception as e:
    print(f'[SKIP] BL_HOUSE_BL: {e}')

# BL_CONTAINER
try:
    if mbl_id:
        cursor.execute('INSERT INTO BL_CONTAINER (MBL_ID, CNTR_NO, CNTR_SIZE_CD, CNTR_TYPE_CD, SEAL_NO, GROSS_WEIGHT_KG, VOLUME_CBM, MAX_WEIGHT_KG, TARE_WEIGHT_KG) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)', (mbl_id, 'HDMU1234567', '40', 'HC', 'SL12345', 5000.000, 150.000, 30000.000, 4200.000))
        cursor.execute('INSERT INTO BL_CONTAINER (MBL_ID, CNTR_NO, CNTR_SIZE_CD, CNTR_TYPE_CD, SEAL_NO, GROSS_WEIGHT_KG, VOLUME_CBM, MAX_WEIGHT_KG, TARE_WEIGHT_KG) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)', (mbl_id, 'HDMU2345678', '40', 'HC', 'SL12346', 5000.000, 150.000, 30000.000, 4200.000))
    conn.commit()
    print('[OK] BL_CONTAINER')
except Exception as e:
    print(f'[SKIP] BL_CONTAINER: {e}')

# Summary counts
print('\n=== Data Summary ===')
for table in ['MST_COMPANY', 'MST_COUNTRY', 'MST_PORT', 'MST_CURRENCY', 'MST_CARRIER', 'MST_CUSTOMER', 'SCH_OCEAN_SCHEDULE', 'ORD_SHIPMENT', 'ORD_OCEAN_BOOKING', 'BL_MASTER_BL', 'BL_HOUSE_BL', 'BL_CONTAINER']:
    cursor.execute(f'SELECT COUNT(*) FROM {table}')
    count = cursor.fetchone()[0]
    print(f'  {table}: {count} rows')

cursor.close()
conn.close()
print('\nSample data insertion completed!')
