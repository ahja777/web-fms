#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
FMS Database Table Creation Script - Part 3
Transport, Customs, Billing Tables
"""

import pymysql

# Database connection info
DB_CONFIG = {
    'host': '211.236.174.220',
    'port': 53306,
    'user': 'user',
    'password': 'P@ssw0rd',
    'database': 'logstic',
    'charset': 'utf8mb4'
}

# 06. Transport Tables
TRANSPORT_TABLES = {
    'TRN_TRANSPORT_ORDER': '''
        CREATE TABLE IF NOT EXISTS TRN_TRANSPORT_ORDER (
            TRN_ORDER_ID VARCHAR(20) NOT NULL COMMENT 'Transport Order ID',
            SHIPMENT_ID VARCHAR(20) NOT NULL COMMENT 'Shipment Reference',
            TRANSPORT_TYPE VARCHAR(20) COMMENT 'Transport Type (PICKUP/DELIVERY/SHUTTLE)',
            TRANSPORT_MODE VARCHAR(20) COMMENT 'Mode (TRUCK/RAIL/BARGE)',
            TRUCKER_ID VARCHAR(20) COMMENT 'Trucker Company',
            VEHICLE_NO VARCHAR(20) COMMENT 'Vehicle Number',
            DRIVER_NAME VARCHAR(100) COMMENT 'Driver Name',
            DRIVER_MOBILE VARCHAR(20) COMMENT 'Driver Mobile',
            PICKUP_ADDR TEXT COMMENT 'Pickup Address',
            PICKUP_DATE DATE COMMENT 'Pickup Date',
            PICKUP_TIME TIME COMMENT 'Pickup Time',
            DELIVERY_ADDR TEXT COMMENT 'Delivery Address',
            DELIVERY_DATE DATE COMMENT 'Delivery Date',
            DELIVERY_TIME TIME COMMENT 'Delivery Time',
            STATUS VARCHAR(20) DEFAULT 'REQUESTED' COMMENT 'Status',
            REMARKS TEXT COMMENT 'Remarks',
            CREATED_BY VARCHAR(50),
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY VARCHAR(50),
            UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (TRN_ORDER_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Transport Order'
    ''',

    'TRN_TRANSPORT_SCHEDULE': '''
        CREATE TABLE IF NOT EXISTS TRN_TRANSPORT_SCHEDULE (
            SCHEDULE_ID VARCHAR(20) NOT NULL COMMENT 'Schedule ID',
            TRN_ORDER_ID VARCHAR(20) NOT NULL COMMENT 'Transport Order Reference',
            SEQUENCE_NO INT COMMENT 'Sequence Number',
            LOCATION_TYPE VARCHAR(20) COMMENT 'Location Type (PICKUP/DROP/WAYPOINT)',
            LOCATION_NAME VARCHAR(200) COMMENT 'Location Name',
            LOCATION_ADDR TEXT COMMENT 'Location Address',
            PLANNED_DATE DATE COMMENT 'Planned Date',
            PLANNED_TIME TIME COMMENT 'Planned Time',
            ACTUAL_DATE DATE COMMENT 'Actual Date',
            ACTUAL_TIME TIME COMMENT 'Actual Time',
            STATUS VARCHAR(20) DEFAULT 'PENDING' COMMENT 'Status',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (SCHEDULE_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Transport Schedule'
    ''',

    'TRN_CONTAINER_MOVEMENT': '''
        CREATE TABLE IF NOT EXISTS TRN_CONTAINER_MOVEMENT (
            MOVEMENT_ID VARCHAR(20) NOT NULL COMMENT 'Movement ID',
            CONTAINER_NO VARCHAR(20) NOT NULL COMMENT 'Container Number',
            SHIPMENT_ID VARCHAR(20) COMMENT 'Shipment Reference',
            MOVEMENT_TYPE VARCHAR(20) COMMENT 'Movement Type (GATE_IN/GATE_OUT/LOAD/DISCHARGE)',
            LOCATION_TYPE VARCHAR(20) COMMENT 'Location Type (CY/CFS/DEPOT/PORT)',
            LOCATION_CODE VARCHAR(20) COMMENT 'Location Code',
            LOCATION_NAME VARCHAR(200) COMMENT 'Location Name',
            MOVEMENT_DATE DATE COMMENT 'Movement Date',
            MOVEMENT_TIME TIME COMMENT 'Movement Time',
            SEAL_NO VARCHAR(50) COMMENT 'Seal Number',
            DAMAGE_YN CHAR(1) DEFAULT 'N' COMMENT 'Damage Flag',
            DAMAGE_DESC TEXT COMMENT 'Damage Description',
            CREATED_BY VARCHAR(50),
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (MOVEMENT_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Container Movement History'
    ''',

    'TRN_DEMURRAGE': '''
        CREATE TABLE IF NOT EXISTS TRN_DEMURRAGE (
            DEMURRAGE_ID VARCHAR(20) NOT NULL COMMENT 'Demurrage ID',
            SHIPMENT_ID VARCHAR(20) NOT NULL COMMENT 'Shipment Reference',
            CONTAINER_NO VARCHAR(20) COMMENT 'Container Number',
            DEMURRAGE_TYPE VARCHAR(20) COMMENT 'Type (DEMURRAGE/DETENTION/STORAGE)',
            FREE_DAYS INT DEFAULT 0 COMMENT 'Free Days',
            START_DATE DATE COMMENT 'Charge Start Date',
            END_DATE DATE COMMENT 'Charge End Date',
            CHARGEABLE_DAYS INT COMMENT 'Chargeable Days',
            RATE_PER_DAY DECIMAL(15,2) COMMENT 'Rate per Day',
            CURRENCY VARCHAR(3) DEFAULT 'USD' COMMENT 'Currency',
            TOTAL_AMOUNT DECIMAL(15,2) COMMENT 'Total Amount',
            STATUS VARCHAR(20) DEFAULT 'CALCULATED' COMMENT 'Status',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (DEMURRAGE_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Demurrage/Detention Charges'
    ''',

    'TRN_WAREHOUSE': '''
        CREATE TABLE IF NOT EXISTS TRN_WAREHOUSE (
            WAREHOUSE_ID VARCHAR(20) NOT NULL COMMENT 'Warehouse ID',
            WAREHOUSE_NAME VARCHAR(200) COMMENT 'Warehouse Name',
            WAREHOUSE_TYPE VARCHAR(20) COMMENT 'Type (CFS/BONDED/GENERAL)',
            ADDRESS TEXT COMMENT 'Address',
            CITY VARCHAR(100) COMMENT 'City',
            COUNTRY_CODE VARCHAR(3) COMMENT 'Country Code',
            CONTACT_NAME VARCHAR(100) COMMENT 'Contact Name',
            CONTACT_TEL VARCHAR(30) COMMENT 'Contact Tel',
            CONTACT_EMAIL VARCHAR(100) COMMENT 'Contact Email',
            ACTIVE_YN CHAR(1) DEFAULT 'Y' COMMENT 'Active Flag',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (WAREHOUSE_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Warehouse Master'
    ''',

    'TRN_CARGO_RECEIPT': '''
        CREATE TABLE IF NOT EXISTS TRN_CARGO_RECEIPT (
            RECEIPT_ID VARCHAR(20) NOT NULL COMMENT 'Receipt ID',
            SHIPMENT_ID VARCHAR(20) COMMENT 'Shipment Reference',
            WAREHOUSE_ID VARCHAR(20) COMMENT 'Warehouse Reference',
            RECEIPT_DATE DATE COMMENT 'Receipt Date',
            RECEIPT_TYPE VARCHAR(20) COMMENT 'Type (IN/OUT)',
            CARGO_DESC TEXT COMMENT 'Cargo Description',
            PACKAGE_QTY INT COMMENT 'Package Quantity',
            PACKAGE_TYPE VARCHAR(20) COMMENT 'Package Type',
            GROSS_WEIGHT DECIMAL(15,3) COMMENT 'Gross Weight (KG)',
            CBM DECIMAL(15,3) COMMENT 'Volume (CBM)',
            STORAGE_LOCATION VARCHAR(50) COMMENT 'Storage Location',
            RECEIVED_BY VARCHAR(100) COMMENT 'Received By',
            REMARKS TEXT COMMENT 'Remarks',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (RECEIPT_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Cargo Receipt'
    '''
}

# 07. Customs Tables
CUSTOMS_TABLES = {
    'CUS_DECLARATION': '''
        CREATE TABLE IF NOT EXISTS CUS_DECLARATION (
            DECLARATION_ID VARCHAR(20) NOT NULL COMMENT 'Declaration ID',
            SHIPMENT_ID VARCHAR(20) NOT NULL COMMENT 'Shipment Reference',
            DECLARATION_NO VARCHAR(50) COMMENT 'Customs Declaration Number',
            DECLARATION_TYPE VARCHAR(20) COMMENT 'Type (IMPORT/EXPORT)',
            DECLARATION_DATE DATE COMMENT 'Declaration Date',
            CUSTOMS_BROKER_ID VARCHAR(20) COMMENT 'Customs Broker',
            DECLARANT VARCHAR(100) COMMENT 'Declarant Name',
            IMPORTER_EXPORTER VARCHAR(200) COMMENT 'Importer/Exporter Name',
            IMPORTER_EXPORTER_BRN VARCHAR(20) COMMENT 'Business Registration No',
            HS_CODE VARCHAR(20) COMMENT 'HS Code',
            GOODS_DESC TEXT COMMENT 'Goods Description',
            COUNTRY_ORIGIN VARCHAR(3) COMMENT 'Country of Origin',
            PACKAGE_QTY INT COMMENT 'Package Quantity',
            GROSS_WEIGHT DECIMAL(15,3) COMMENT 'Gross Weight',
            DECLARED_VALUE DECIMAL(18,2) COMMENT 'Declared Value',
            CURRENCY VARCHAR(3) DEFAULT 'USD' COMMENT 'Currency',
            DUTY_AMOUNT DECIMAL(18,2) COMMENT 'Duty Amount',
            VAT_AMOUNT DECIMAL(18,2) COMMENT 'VAT Amount',
            TOTAL_TAX DECIMAL(18,2) COMMENT 'Total Tax',
            STATUS VARCHAR(20) DEFAULT 'DRAFT' COMMENT 'Status',
            CLEARANCE_DATE DATE COMMENT 'Clearance Date',
            RELEASE_DATE DATE COMMENT 'Release Date',
            REMARKS TEXT COMMENT 'Remarks',
            CREATED_BY VARCHAR(50),
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY VARCHAR(50),
            UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (DECLARATION_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Customs Declaration'
    ''',

    'CUS_DECLARATION_ITEM': '''
        CREATE TABLE IF NOT EXISTS CUS_DECLARATION_ITEM (
            ITEM_ID VARCHAR(20) NOT NULL COMMENT 'Item ID',
            DECLARATION_ID VARCHAR(20) NOT NULL COMMENT 'Declaration Reference',
            LINE_NO INT COMMENT 'Line Number',
            HS_CODE VARCHAR(20) COMMENT 'HS Code',
            GOODS_DESC TEXT COMMENT 'Goods Description',
            COUNTRY_ORIGIN VARCHAR(3) COMMENT 'Country of Origin',
            QUANTITY DECIMAL(15,3) COMMENT 'Quantity',
            UNIT VARCHAR(10) COMMENT 'Unit',
            UNIT_PRICE DECIMAL(18,4) COMMENT 'Unit Price',
            AMOUNT DECIMAL(18,2) COMMENT 'Amount',
            CURRENCY VARCHAR(3) DEFAULT 'USD' COMMENT 'Currency',
            DUTY_RATE DECIMAL(10,4) COMMENT 'Duty Rate (%)',
            DUTY_AMOUNT DECIMAL(18,2) COMMENT 'Duty Amount',
            VAT_RATE DECIMAL(10,4) DEFAULT 10.0000 COMMENT 'VAT Rate (%)',
            VAT_AMOUNT DECIMAL(18,2) COMMENT 'VAT Amount',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (ITEM_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Customs Declaration Items'
    ''',

    'CUS_AMS_MANIFEST': '''
        CREATE TABLE IF NOT EXISTS CUS_AMS_MANIFEST (
            AMS_ID VARCHAR(20) NOT NULL COMMENT 'AMS ID',
            SHIPMENT_ID VARCHAR(20) COMMENT 'Shipment Reference',
            MBL_NO VARCHAR(50) COMMENT 'Master B/L Number',
            HBL_NO VARCHAR(50) COMMENT 'House B/L Number',
            AMS_TYPE VARCHAR(20) COMMENT 'Type (AMS/ISF/ACI)',
            FILING_TYPE VARCHAR(20) COMMENT 'Filing Type (ORIGINAL/AMEND)',
            FILING_NO VARCHAR(50) COMMENT 'Filing Number',
            FILING_DATE DATETIME COMMENT 'Filing Date',
            SHIPPER_NAME VARCHAR(200) COMMENT 'Shipper Name',
            SHIPPER_ADDR TEXT COMMENT 'Shipper Address',
            CONSIGNEE_NAME VARCHAR(200) COMMENT 'Consignee Name',
            CONSIGNEE_ADDR TEXT COMMENT 'Consignee Address',
            NOTIFY_NAME VARCHAR(200) COMMENT 'Notify Party',
            NOTIFY_ADDR TEXT COMMENT 'Notify Address',
            GOODS_DESC TEXT COMMENT 'Goods Description',
            CONTAINER_NO VARCHAR(20) COMMENT 'Container Number',
            SEAL_NO VARCHAR(50) COMMENT 'Seal Number',
            WEIGHT DECIMAL(15,3) COMMENT 'Weight',
            WEIGHT_UNIT VARCHAR(5) COMMENT 'Weight Unit',
            RESPONSE_CODE VARCHAR(20) COMMENT 'Response Code',
            RESPONSE_MSG TEXT COMMENT 'Response Message',
            STATUS VARCHAR(20) DEFAULT 'DRAFT' COMMENT 'Status',
            CREATED_BY VARCHAR(50),
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (AMS_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AMS/ISF Manifest'
    ''',

    'CUS_INSPECTION': '''
        CREATE TABLE IF NOT EXISTS CUS_INSPECTION (
            INSPECTION_ID VARCHAR(20) NOT NULL COMMENT 'Inspection ID',
            DECLARATION_ID VARCHAR(20) COMMENT 'Declaration Reference',
            SHIPMENT_ID VARCHAR(20) COMMENT 'Shipment Reference',
            INSPECTION_TYPE VARCHAR(20) COMMENT 'Inspection Type (X-RAY/PHYSICAL/DOCUMENT)',
            INSPECTION_DATE DATE COMMENT 'Inspection Date',
            INSPECTION_LOCATION VARCHAR(200) COMMENT 'Inspection Location',
            INSPECTOR_NAME VARCHAR(100) COMMENT 'Inspector Name',
            RESULT VARCHAR(20) COMMENT 'Result (PASS/FAIL/HOLD)',
            FINDINGS TEXT COMMENT 'Inspection Findings',
            ACTION_REQUIRED TEXT COMMENT 'Action Required',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (INSPECTION_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Customs Inspection'
    ''',

    'CUS_LICENSE_PERMIT': '''
        CREATE TABLE IF NOT EXISTS CUS_LICENSE_PERMIT (
            PERMIT_ID VARCHAR(20) NOT NULL COMMENT 'Permit ID',
            DECLARATION_ID VARCHAR(20) COMMENT 'Declaration Reference',
            PERMIT_TYPE VARCHAR(50) COMMENT 'Permit Type',
            PERMIT_NO VARCHAR(50) COMMENT 'Permit Number',
            ISSUE_DATE DATE COMMENT 'Issue Date',
            EXPIRY_DATE DATE COMMENT 'Expiry Date',
            ISSUING_AGENCY VARCHAR(200) COMMENT 'Issuing Agency',
            GOODS_DESC TEXT COMMENT 'Goods Description',
            QUANTITY DECIMAL(15,3) COMMENT 'Quantity',
            UNIT VARCHAR(10) COMMENT 'Unit',
            REMARKS TEXT COMMENT 'Remarks',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (PERMIT_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Import/Export Licenses and Permits'
    ''',

    'CUS_FTA_CERT': '''
        CREATE TABLE IF NOT EXISTS CUS_FTA_CERT (
            CERT_ID VARCHAR(20) NOT NULL COMMENT 'Certificate ID',
            DECLARATION_ID VARCHAR(20) COMMENT 'Declaration Reference',
            FTA_TYPE VARCHAR(20) COMMENT 'FTA Type (KORUS/KCFTA/RCEP etc)',
            CERT_NO VARCHAR(50) COMMENT 'Certificate Number',
            ISSUE_DATE DATE COMMENT 'Issue Date',
            EXPIRY_DATE DATE COMMENT 'Expiry Date',
            ISSUER_NAME VARCHAR(200) COMMENT 'Issuer Name',
            COUNTRY_ORIGIN VARCHAR(3) COMMENT 'Country of Origin',
            HS_CODE VARCHAR(20) COMMENT 'HS Code',
            GOODS_DESC TEXT COMMENT 'Goods Description',
            ORIGIN_CRITERIA VARCHAR(20) COMMENT 'Origin Criteria',
            PREFERENTIAL_RATE DECIMAL(10,4) COMMENT 'Preferential Rate (%)',
            DUTY_SAVED DECIMAL(18,2) COMMENT 'Duty Saved',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (CERT_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='FTA Certificate of Origin'
    ''',

    'CUS_BOND': '''
        CREATE TABLE IF NOT EXISTS CUS_BOND (
            BOND_ID VARCHAR(20) NOT NULL COMMENT 'Bond ID',
            DECLARATION_ID VARCHAR(20) COMMENT 'Declaration Reference',
            BOND_TYPE VARCHAR(20) COMMENT 'Bond Type (CUSTOMS/SURETY/GUARANTEE)',
            BOND_NO VARCHAR(50) COMMENT 'Bond Number',
            BOND_AMOUNT DECIMAL(18,2) COMMENT 'Bond Amount',
            CURRENCY VARCHAR(3) DEFAULT 'KRW' COMMENT 'Currency',
            ISSUE_DATE DATE COMMENT 'Issue Date',
            EXPIRY_DATE DATE COMMENT 'Expiry Date',
            ISSUING_BANK VARCHAR(200) COMMENT 'Issuing Bank',
            BENEFICIARY VARCHAR(200) COMMENT 'Beneficiary',
            STATUS VARCHAR(20) DEFAULT 'ACTIVE' COMMENT 'Status',
            RELEASE_DATE DATE COMMENT 'Release Date',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (BOND_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Customs Bond'
    ''',

    'CUS_DUTY_PAYMENT': '''
        CREATE TABLE IF NOT EXISTS CUS_DUTY_PAYMENT (
            PAYMENT_ID VARCHAR(20) NOT NULL COMMENT 'Payment ID',
            DECLARATION_ID VARCHAR(20) NOT NULL COMMENT 'Declaration Reference',
            PAYMENT_TYPE VARCHAR(20) COMMENT 'Payment Type (DUTY/VAT/SURCHARGE)',
            PAYMENT_DATE DATE COMMENT 'Payment Date',
            DUE_DATE DATE COMMENT 'Due Date',
            AMOUNT DECIMAL(18,2) COMMENT 'Amount',
            CURRENCY VARCHAR(3) DEFAULT 'KRW' COMMENT 'Currency',
            PAYMENT_METHOD VARCHAR(20) COMMENT 'Payment Method',
            BANK_NAME VARCHAR(100) COMMENT 'Bank Name',
            ACCOUNT_NO VARCHAR(50) COMMENT 'Account Number',
            REFERENCE_NO VARCHAR(50) COMMENT 'Reference Number',
            STATUS VARCHAR(20) DEFAULT 'PENDING' COMMENT 'Status',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (PAYMENT_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Duty Payment'
    ''',

    'CUS_EDI_LOG': '''
        CREATE TABLE IF NOT EXISTS CUS_EDI_LOG (
            LOG_ID BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Log ID',
            EDI_TYPE VARCHAR(20) COMMENT 'EDI Type',
            DIRECTION VARCHAR(10) COMMENT 'Direction (IN/OUT)',
            REFERENCE_ID VARCHAR(20) COMMENT 'Reference ID',
            REFERENCE_TYPE VARCHAR(20) COMMENT 'Reference Type',
            MESSAGE_ID VARCHAR(50) COMMENT 'Message ID',
            MESSAGE_TYPE VARCHAR(20) COMMENT 'Message Type',
            MESSAGE_CONTENT LONGTEXT COMMENT 'Message Content',
            RESPONSE_CODE VARCHAR(20) COMMENT 'Response Code',
            RESPONSE_MSG TEXT COMMENT 'Response Message',
            SENT_AT DATETIME COMMENT 'Sent DateTime',
            RECEIVED_AT DATETIME COMMENT 'Received DateTime',
            STATUS VARCHAR(20) COMMENT 'Status',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (LOG_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Customs EDI Log'
    '''
}

# 08. Billing Tables
BILLING_TABLES = {
    'BIL_CONTRACT': '''
        CREATE TABLE IF NOT EXISTS BIL_CONTRACT (
            CONTRACT_ID VARCHAR(20) NOT NULL COMMENT 'Contract ID',
            CUSTOMER_ID VARCHAR(20) NOT NULL COMMENT 'Customer Reference',
            CONTRACT_NO VARCHAR(50) COMMENT 'Contract Number',
            CONTRACT_NAME VARCHAR(200) COMMENT 'Contract Name',
            CONTRACT_TYPE VARCHAR(20) COMMENT 'Contract Type',
            START_DATE DATE COMMENT 'Start Date',
            END_DATE DATE COMMENT 'End Date',
            AUTO_RENEW_YN CHAR(1) DEFAULT 'N' COMMENT 'Auto Renew Flag',
            PAYMENT_TERM INT DEFAULT 30 COMMENT 'Payment Term (days)',
            CREDIT_LIMIT DECIMAL(18,2) COMMENT 'Credit Limit',
            CURRENCY VARCHAR(3) DEFAULT 'KRW' COMMENT 'Currency',
            STATUS VARCHAR(20) DEFAULT 'ACTIVE' COMMENT 'Status',
            REMARKS TEXT COMMENT 'Remarks',
            CREATED_BY VARCHAR(50),
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY VARCHAR(50),
            UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (CONTRACT_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Customer Contract'
    ''',

    'BIL_TARIFF': '''
        CREATE TABLE IF NOT EXISTS BIL_TARIFF (
            TARIFF_ID VARCHAR(20) NOT NULL COMMENT 'Tariff ID',
            CONTRACT_ID VARCHAR(20) COMMENT 'Contract Reference (null for standard)',
            TARIFF_TYPE VARCHAR(20) COMMENT 'Tariff Type (SEA/AIR/INLAND/CUSTOMS)',
            SERVICE_TYPE VARCHAR(20) COMMENT 'Service Type (EXPORT/IMPORT)',
            CHARGE_CODE VARCHAR(20) NOT NULL COMMENT 'Charge Code',
            CHARGE_NAME VARCHAR(100) COMMENT 'Charge Name',
            CALCULATION_TYPE VARCHAR(20) COMMENT 'Calculation Type (FIXED/PER_UNIT/PERCENTAGE)',
            UNIT_TYPE VARCHAR(20) COMMENT 'Unit Type (CNTR/CBM/KG/BL/SHIPMENT)',
            RATE DECIMAL(18,4) COMMENT 'Rate',
            CURRENCY VARCHAR(3) DEFAULT 'KRW' COMMENT 'Currency',
            MIN_AMOUNT DECIMAL(18,2) COMMENT 'Minimum Amount',
            MAX_AMOUNT DECIMAL(18,2) COMMENT 'Maximum Amount',
            ORIGIN_PORT VARCHAR(10) COMMENT 'Origin Port',
            DEST_PORT VARCHAR(10) COMMENT 'Destination Port',
            CARRIER_CODE VARCHAR(10) COMMENT 'Carrier Code',
            CONTAINER_TYPE VARCHAR(10) COMMENT 'Container Type',
            EFFECTIVE_FROM DATE COMMENT 'Effective From',
            EFFECTIVE_TO DATE COMMENT 'Effective To',
            ACTIVE_YN CHAR(1) DEFAULT 'Y' COMMENT 'Active Flag',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (TARIFF_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Tariff/Rate Master'
    ''',

    'BIL_CHARGE': '''
        CREATE TABLE IF NOT EXISTS BIL_CHARGE (
            CHARGE_ID VARCHAR(20) NOT NULL COMMENT 'Charge ID',
            SHIPMENT_ID VARCHAR(20) NOT NULL COMMENT 'Shipment Reference',
            CHARGE_TYPE VARCHAR(20) COMMENT 'Charge Type (AR/AP)',
            CHARGE_CODE VARCHAR(20) COMMENT 'Charge Code',
            CHARGE_NAME VARCHAR(100) COMMENT 'Charge Name',
            CUSTOMER_ID VARCHAR(20) COMMENT 'Customer/Vendor ID',
            QUANTITY DECIMAL(15,3) DEFAULT 1 COMMENT 'Quantity',
            UNIT_TYPE VARCHAR(20) COMMENT 'Unit Type',
            UNIT_PRICE DECIMAL(18,4) COMMENT 'Unit Price',
            AMOUNT DECIMAL(18,2) COMMENT 'Amount',
            CURRENCY VARCHAR(3) DEFAULT 'KRW' COMMENT 'Currency',
            EXCHANGE_RATE DECIMAL(15,6) DEFAULT 1 COMMENT 'Exchange Rate',
            LOCAL_AMOUNT DECIMAL(18,2) COMMENT 'Local Currency Amount',
            TAX_YN CHAR(1) DEFAULT 'Y' COMMENT 'Taxable Flag',
            TAX_RATE DECIMAL(10,4) DEFAULT 10.0000 COMMENT 'Tax Rate',
            TAX_AMOUNT DECIMAL(18,2) COMMENT 'Tax Amount',
            TOTAL_AMOUNT DECIMAL(18,2) COMMENT 'Total Amount (incl. Tax)',
            INVOICE_ID VARCHAR(20) COMMENT 'Invoice Reference',
            STATUS VARCHAR(20) DEFAULT 'PENDING' COMMENT 'Status',
            AUTO_RATED_YN CHAR(1) DEFAULT 'N' COMMENT 'Auto Rated Flag',
            REMARKS TEXT COMMENT 'Remarks',
            CREATED_BY VARCHAR(50),
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY VARCHAR(50),
            UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (CHARGE_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Shipment Charges'
    ''',

    'BIL_INVOICE': '''
        CREATE TABLE IF NOT EXISTS BIL_INVOICE (
            INVOICE_ID VARCHAR(20) NOT NULL COMMENT 'Invoice ID',
            INVOICE_NO VARCHAR(50) COMMENT 'Invoice Number',
            INVOICE_TYPE VARCHAR(20) COMMENT 'Invoice Type (AR/AP)',
            INVOICE_DATE DATE COMMENT 'Invoice Date',
            DUE_DATE DATE COMMENT 'Due Date',
            CUSTOMER_ID VARCHAR(20) COMMENT 'Customer/Vendor ID',
            CUSTOMER_NAME VARCHAR(200) COMMENT 'Customer/Vendor Name',
            BILL_TO_ADDR TEXT COMMENT 'Bill To Address',
            SUBTOTAL DECIMAL(18,2) COMMENT 'Subtotal',
            TAX_AMOUNT DECIMAL(18,2) COMMENT 'Tax Amount',
            TOTAL_AMOUNT DECIMAL(18,2) COMMENT 'Total Amount',
            CURRENCY VARCHAR(3) DEFAULT 'KRW' COMMENT 'Currency',
            PAID_AMOUNT DECIMAL(18,2) DEFAULT 0 COMMENT 'Paid Amount',
            BALANCE DECIMAL(18,2) COMMENT 'Balance',
            STATUS VARCHAR(20) DEFAULT 'DRAFT' COMMENT 'Status',
            ISSUED_DATE DATE COMMENT 'Issued Date',
            ISSUED_BY VARCHAR(50) COMMENT 'Issued By',
            REMARKS TEXT COMMENT 'Remarks',
            CREATED_BY VARCHAR(50),
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UPDATED_BY VARCHAR(50),
            UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (INVOICE_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Invoice Header'
    ''',

    'BIL_INVOICE_DETAIL': '''
        CREATE TABLE IF NOT EXISTS BIL_INVOICE_DETAIL (
            DETAIL_ID VARCHAR(20) NOT NULL COMMENT 'Detail ID',
            INVOICE_ID VARCHAR(20) NOT NULL COMMENT 'Invoice Reference',
            LINE_NO INT COMMENT 'Line Number',
            CHARGE_ID VARCHAR(20) COMMENT 'Charge Reference',
            SHIPMENT_ID VARCHAR(20) COMMENT 'Shipment Reference',
            DESCRIPTION VARCHAR(200) COMMENT 'Description',
            QUANTITY DECIMAL(15,3) DEFAULT 1 COMMENT 'Quantity',
            UNIT_PRICE DECIMAL(18,4) COMMENT 'Unit Price',
            AMOUNT DECIMAL(18,2) COMMENT 'Amount',
            TAX_AMOUNT DECIMAL(18,2) COMMENT 'Tax Amount',
            TOTAL_AMOUNT DECIMAL(18,2) COMMENT 'Total Amount',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (DETAIL_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Invoice Detail'
    ''',

    'BIL_PAYMENT': '''
        CREATE TABLE IF NOT EXISTS BIL_PAYMENT (
            PAYMENT_ID VARCHAR(20) NOT NULL COMMENT 'Payment ID',
            PAYMENT_NO VARCHAR(50) COMMENT 'Payment Number',
            PAYMENT_TYPE VARCHAR(20) COMMENT 'Payment Type (RECEIPT/DISBURSEMENT)',
            PAYMENT_DATE DATE COMMENT 'Payment Date',
            CUSTOMER_ID VARCHAR(20) COMMENT 'Customer/Vendor ID',
            PAYMENT_METHOD VARCHAR(20) COMMENT 'Method (BANK/CASH/CHECK/CARD)',
            BANK_NAME VARCHAR(100) COMMENT 'Bank Name',
            ACCOUNT_NO VARCHAR(50) COMMENT 'Account Number',
            REFERENCE_NO VARCHAR(50) COMMENT 'Reference Number',
            AMOUNT DECIMAL(18,2) COMMENT 'Amount',
            CURRENCY VARCHAR(3) DEFAULT 'KRW' COMMENT 'Currency',
            EXCHANGE_RATE DECIMAL(15,6) DEFAULT 1 COMMENT 'Exchange Rate',
            LOCAL_AMOUNT DECIMAL(18,2) COMMENT 'Local Currency Amount',
            STATUS VARCHAR(20) DEFAULT 'PENDING' COMMENT 'Status',
            APPROVED_BY VARCHAR(50) COMMENT 'Approved By',
            APPROVED_DATE DATE COMMENT 'Approved Date',
            REMARKS TEXT COMMENT 'Remarks',
            CREATED_BY VARCHAR(50),
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (PAYMENT_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Payment Header'
    ''',

    'BIL_PAYMENT_DETAIL': '''
        CREATE TABLE IF NOT EXISTS BIL_PAYMENT_DETAIL (
            DETAIL_ID VARCHAR(20) NOT NULL COMMENT 'Detail ID',
            PAYMENT_ID VARCHAR(20) NOT NULL COMMENT 'Payment Reference',
            INVOICE_ID VARCHAR(20) COMMENT 'Invoice Reference',
            APPLIED_AMOUNT DECIMAL(18,2) COMMENT 'Applied Amount',
            DISCOUNT_AMOUNT DECIMAL(18,2) DEFAULT 0 COMMENT 'Discount Amount',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (DETAIL_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Payment Application Detail'
    ''',

    'BIL_AR_AGING': '''
        CREATE TABLE IF NOT EXISTS BIL_AR_AGING (
            AGING_ID BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Aging ID',
            SNAPSHOT_DATE DATE NOT NULL COMMENT 'Snapshot Date',
            CUSTOMER_ID VARCHAR(20) NOT NULL COMMENT 'Customer ID',
            INVOICE_ID VARCHAR(20) COMMENT 'Invoice Reference',
            INVOICE_DATE DATE COMMENT 'Invoice Date',
            DUE_DATE DATE COMMENT 'Due Date',
            ORIGINAL_AMOUNT DECIMAL(18,2) COMMENT 'Original Amount',
            BALANCE DECIMAL(18,2) COMMENT 'Balance',
            CURRENCY VARCHAR(3) COMMENT 'Currency',
            DAYS_OVERDUE INT COMMENT 'Days Overdue',
            AGING_BUCKET VARCHAR(20) COMMENT 'Aging Bucket (CURRENT/30/60/90/120+)',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (AGING_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AR Aging Snapshot'
    ''',

    'BIL_AP_AGING': '''
        CREATE TABLE IF NOT EXISTS BIL_AP_AGING (
            AGING_ID BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Aging ID',
            SNAPSHOT_DATE DATE NOT NULL COMMENT 'Snapshot Date',
            VENDOR_ID VARCHAR(20) NOT NULL COMMENT 'Vendor ID',
            INVOICE_ID VARCHAR(20) COMMENT 'Invoice Reference',
            INVOICE_DATE DATE COMMENT 'Invoice Date',
            DUE_DATE DATE COMMENT 'Due Date',
            ORIGINAL_AMOUNT DECIMAL(18,2) COMMENT 'Original Amount',
            BALANCE DECIMAL(18,2) COMMENT 'Balance',
            CURRENCY VARCHAR(3) COMMENT 'Currency',
            DAYS_OVERDUE INT COMMENT 'Days Overdue',
            AGING_BUCKET VARCHAR(20) COMMENT 'Aging Bucket (CURRENT/30/60/90/120+)',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (AGING_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AP Aging Snapshot'
    ''',

    'BIL_PROFIT_ANALYSIS': '''
        CREATE TABLE IF NOT EXISTS BIL_PROFIT_ANALYSIS (
            ANALYSIS_ID BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Analysis ID',
            SHIPMENT_ID VARCHAR(20) NOT NULL COMMENT 'Shipment Reference',
            ANALYSIS_DATE DATE COMMENT 'Analysis Date',
            REVENUE_TOTAL DECIMAL(18,2) COMMENT 'Total Revenue',
            COST_TOTAL DECIMAL(18,2) COMMENT 'Total Cost',
            GROSS_PROFIT DECIMAL(18,2) COMMENT 'Gross Profit',
            PROFIT_MARGIN DECIMAL(10,4) COMMENT 'Profit Margin (%)',
            CURRENCY VARCHAR(3) DEFAULT 'KRW' COMMENT 'Currency',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (ANALYSIS_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Profit Analysis by Shipment'
    ''',

    'BIL_CREDIT_CHECK': '''
        CREATE TABLE IF NOT EXISTS BIL_CREDIT_CHECK (
            CHECK_ID BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Check ID',
            CUSTOMER_ID VARCHAR(20) NOT NULL COMMENT 'Customer ID',
            CHECK_DATE DATETIME NOT NULL COMMENT 'Check DateTime',
            CREDIT_LIMIT DECIMAL(18,2) COMMENT 'Credit Limit',
            CURRENT_AR DECIMAL(18,2) COMMENT 'Current AR Balance',
            PENDING_ORDERS DECIMAL(18,2) COMMENT 'Pending Orders Amount',
            AVAILABLE_CREDIT DECIMAL(18,2) COMMENT 'Available Credit',
            REQUESTED_AMOUNT DECIMAL(18,2) COMMENT 'Requested Amount',
            CHECK_RESULT VARCHAR(20) COMMENT 'Result (APPROVED/REJECTED/WARNING)',
            OVERRIDE_YN CHAR(1) DEFAULT 'N' COMMENT 'Override Flag',
            OVERRIDE_BY VARCHAR(50) COMMENT 'Override By',
            OVERRIDE_REASON TEXT COMMENT 'Override Reason',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (CHECK_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Credit Check Log'
    ''',

    'BIL_EXCHANGE_GAIN_LOSS': '''
        CREATE TABLE IF NOT EXISTS BIL_EXCHANGE_GAIN_LOSS (
            RECORD_ID BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Record ID',
            REFERENCE_TYPE VARCHAR(20) COMMENT 'Reference Type (INVOICE/PAYMENT)',
            REFERENCE_ID VARCHAR(20) COMMENT 'Reference ID',
            ORIGINAL_CURRENCY VARCHAR(3) COMMENT 'Original Currency',
            ORIGINAL_AMOUNT DECIMAL(18,2) COMMENT 'Original Amount',
            ORIGINAL_RATE DECIMAL(15,6) COMMENT 'Original Exchange Rate',
            SETTLEMENT_RATE DECIMAL(15,6) COMMENT 'Settlement Exchange Rate',
            LOCAL_ORIGINAL DECIMAL(18,2) COMMENT 'Local Amount at Original Rate',
            LOCAL_SETTLEMENT DECIMAL(18,2) COMMENT 'Local Amount at Settlement Rate',
            GAIN_LOSS DECIMAL(18,2) COMMENT 'Exchange Gain/Loss',
            RECORD_DATE DATE COMMENT 'Record Date',
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (RECORD_ID)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Exchange Gain/Loss'
    '''
}

def create_tables():
    print("=" * 60)
    print("FMS Database Table Creation - Part 3")
    print("=" * 60)

    conn = pymysql.connect(**DB_CONFIG)
    cursor = conn.cursor()

    all_tables = [
        ("06. Transport Tables", TRANSPORT_TABLES),
        ("07. Customs Tables", CUSTOMS_TABLES),
        ("08. Billing Tables", BILLING_TABLES)
    ]

    for section_name, tables in all_tables:
        print(f"\n=== {section_name} ===")
        for table_name, create_sql in tables.items():
            try:
                cursor.execute(create_sql)
                conn.commit()
                print(f"  [OK] {table_name}")
            except Exception as e:
                print(f"  [FAIL] {table_name}: {e}")

    # Get total table count
    cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'logstic'")
    total = cursor.fetchone()[0]

    print(f"\n{'=' * 60}")
    print(f"Total tables: {total}")
    print("=" * 60)

    cursor.close()
    conn.close()

if __name__ == "__main__":
    create_tables()
