import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        s.SHIPMENT_ID as shipment_id,
        s.SHIPMENT_NO as shipment_no,
        s.TRANSPORT_MODE_CD as transport_mode,
        s.TRADE_TYPE_CD as trade_type,
        s.SERVICE_TYPE_CD as service_type,
        s.INCOTERMS_CD as incoterms,
        c.CUSTOMER_NM as customer_name,
        sh.PARTNER_NM as shipper_name,
        con.PARTNER_NM as consignee_name,
        cr.CARRIER_NM as carrier_name,
        s.ORIGIN_PORT_CD as origin_port,
        s.DEST_PORT_CD as dest_port,
        DATE_FORMAT(s.ETD_DT, '%Y-%m-%d') as etd,
        DATE_FORMAT(s.ETA_DT, '%Y-%m-%d') as eta,
        s.TOTAL_PKG_QTY as total_pkg_qty,
        s.PKG_TYPE_CD as pkg_type,
        s.GROSS_WEIGHT_KG as gross_weight,
        s.VOLUME_CBM as volume_cbm,
        s.STATUS_CD as status,
        DATE_FORMAT(s.CREATED_DTM, '%Y-%m-%d') as created_at
      FROM ORD_SHIPMENT s
      LEFT JOIN MST_CUSTOMER c ON s.CUSTOMER_ID = c.CUSTOMER_ID
      LEFT JOIN MST_CARRIER cr ON s.CARRIER_ID = cr.CARRIER_ID
      LEFT JOIN MST_PARTNER sh ON s.SHIPPER_ID = sh.PARTNER_ID
      LEFT JOIN MST_PARTNER con ON s.CONSIGNEE_ID = con.PARTNER_ID
      ORDER BY s.CREATED_DTM DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 새 Shipment 번호 생성
    const year = new Date().getFullYear();
    const [countResult] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as cnt FROM ORD_SHIPMENT WHERE SHIPMENT_NO LIKE ?`,
      [`SHP${year}%`]
    );
    const count = countResult[0].cnt + 1;
    const shipmentNo = `SHP${year}${String(count).padStart(4, '0')}`;

    const [result] = await pool.query<ResultSetHeader>(`
      INSERT INTO ORD_SHIPMENT (
        SHIPMENT_NO, TRANSPORT_MODE_CD, TRADE_TYPE_CD, SERVICE_TYPE_CD, INCOTERMS_CD,
        CUSTOMER_ID, SHIPPER_ID, CONSIGNEE_ID, CARRIER_ID,
        ORIGIN_PORT_CD, DEST_PORT_CD, ETD_DT, ETA_DT,
        TOTAL_PKG_QTY, PKG_TYPE_CD, GROSS_WEIGHT_KG, VOLUME_CBM,
        DECLARED_VALUE_AMT, DECLARED_VALUE_CURR, STATUS_CD, CREATED_DTM, CREATED_BY
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', NOW(), 'admin')
    `, [
      shipmentNo,
      body.transport_mode,
      body.trade_type,
      body.service_type,
      body.incoterms,
      body.customer_id || null,
      body.shipper_id || null,
      body.consignee_id || null,
      body.carrier_id || null,
      body.origin_port,
      body.dest_port,
      body.etd || null,
      body.eta || null,
      body.total_pkg_qty || 0,
      body.pkg_type || 'CARTON',
      body.gross_weight || 0,
      body.volume_cbm || 0,
      body.declared_value || 0,
      body.currency || 'USD'
    ]);

    return NextResponse.json({
      success: true,
      shipment_id: result.insertId,
      shipment_no: shipmentNo
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
}
