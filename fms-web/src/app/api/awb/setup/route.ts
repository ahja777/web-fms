import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST() {
  try {
    // AWB_MASTER_AWB 테이블 생성
    await pool.query(`
      CREATE TABLE IF NOT EXISTS AWB_MASTER_AWB (
        MAWB_ID INT AUTO_INCREMENT PRIMARY KEY,
        MAWB_NO VARCHAR(20) UNIQUE,
        SHIPMENT_ID INT,
        BOOKING_ID INT,
        CARRIER_ID INT,
        AIRLINE_CODE VARCHAR(10),
        FLIGHT_NO VARCHAR(20),
        ORIGIN_AIRPORT_CD VARCHAR(10),
        DEST_AIRPORT_CD VARCHAR(10),
        ETD_DT DATE,
        ETD_TIME VARCHAR(10),
        ATD_DT DATE,
        ETA_DT DATE,
        ETA_TIME VARCHAR(10),
        ATA_DT DATE,
        ISSUE_DT DATE,
        ISSUE_PLACE VARCHAR(100),
        SHIPPER_NM VARCHAR(200),
        SHIPPER_ADDR TEXT,
        CONSIGNEE_NM VARCHAR(200),
        CONSIGNEE_ADDR TEXT,
        NOTIFY_PARTY VARCHAR(200),
        PIECES INT,
        GROSS_WEIGHT_KG DECIMAL(15,3),
        CHARGE_WEIGHT_KG DECIMAL(15,3),
        VOLUME_CBM DECIMAL(15,3),
        COMMODITY_DESC VARCHAR(500),
        HS_CODE VARCHAR(20),
        DIMENSIONS VARCHAR(100),
        SPECIAL_HANDLING VARCHAR(200),
        DECLARED_VALUE DECIMAL(15,2),
        DECLARED_CURRENCY VARCHAR(3) DEFAULT 'USD',
        INSURANCE_VALUE DECIMAL(15,2),
        FREIGHT_CHARGES DECIMAL(15,2),
        OTHER_CHARGES DECIMAL(15,2),
        PAYMENT_TERMS VARCHAR(20) DEFAULT 'PREPAID',
        STATUS_CD VARCHAR(20) DEFAULT 'DRAFT',
        REMARKS TEXT,
        DEL_YN CHAR(1) DEFAULT 'N',
        CREATED_BY VARCHAR(50),
        CREATED_DTM DATETIME DEFAULT CURRENT_TIMESTAMP,
        UPDATED_BY VARCHAR(50),
        UPDATED_DTM DATETIME,
        INDEX idx_mawb_no (MAWB_NO),
        INDEX idx_origin_dest (ORIGIN_AIRPORT_CD, DEST_AIRPORT_CD),
        INDEX idx_status (STATUS_CD),
        INDEX idx_etd (ETD_DT)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // AWB_HOUSE_AWB 테이블 생성
    await pool.query(`
      CREATE TABLE IF NOT EXISTS AWB_HOUSE_AWB (
        HAWB_ID INT AUTO_INCREMENT PRIMARY KEY,
        HAWB_NO VARCHAR(30) UNIQUE,
        MAWB_ID INT,
        CUSTOMER_ID INT,
        SHIPPER_NM VARCHAR(200),
        SHIPPER_ADDR TEXT,
        CONSIGNEE_NM VARCHAR(200),
        CONSIGNEE_ADDR TEXT,
        NOTIFY_PARTY VARCHAR(200),
        PIECES INT,
        GROSS_WEIGHT_KG DECIMAL(15,3),
        CHARGE_WEIGHT_KG DECIMAL(15,3),
        VOLUME_CBM DECIMAL(15,3),
        COMMODITY_DESC VARCHAR(500),
        HS_CODE VARCHAR(20),
        DIMENSIONS VARCHAR(100),
        SPECIAL_HANDLING VARCHAR(200),
        DECLARED_VALUE DECIMAL(15,2),
        DECLARED_CURRENCY VARCHAR(3) DEFAULT 'USD',
        INSURANCE_VALUE DECIMAL(15,2),
        FREIGHT_CHARGES DECIMAL(15,2),
        OTHER_CHARGES DECIMAL(15,2),
        PAYMENT_TERMS VARCHAR(20) DEFAULT 'PREPAID',
        STATUS_CD VARCHAR(20) DEFAULT 'DRAFT',
        REMARKS TEXT,
        DEL_YN CHAR(1) DEFAULT 'N',
        CREATED_BY VARCHAR(50),
        CREATED_DTM DATETIME DEFAULT CURRENT_TIMESTAMP,
        UPDATED_BY VARCHAR(50),
        UPDATED_DTM DATETIME,
        FOREIGN KEY (MAWB_ID) REFERENCES AWB_MASTER_AWB(MAWB_ID),
        INDEX idx_hawb_no (HAWB_NO),
        INDEX idx_mawb_id (MAWB_ID),
        INDEX idx_status (STATUS_CD)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    return NextResponse.json({
      success: true,
      message: 'AWB 테이블이 성공적으로 생성되었습니다.',
      tables: ['AWB_MASTER_AWB', 'AWB_HOUSE_AWB']
    });
  } catch (error) {
    console.error('AWB Setup Error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 테이블 존재 여부 확인
    const [tables] = await pool.query(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('AWB_MASTER_AWB', 'AWB_HOUSE_AWB')
    `);

    return NextResponse.json({
      success: true,
      tables: tables
    });
  } catch (error) {
    console.error('AWB Setup Check Error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
