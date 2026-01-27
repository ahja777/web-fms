import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: '211.236.174.220',
  port: 53306,
  user: 'user',
  password: 'P@ssw0rd',
  database: 'logstic',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    const { id } = await params;
    connection = await mysql.createConnection(dbConfig);

    // 선적 기본 정보 조회
    const [shipments] = await connection.query(`
      SELECT
        s.*,
        c.CUSTOMER_NM,
        c.CUSTOMER_CD,
        cr.CARRIER_NM,
        cr.CARRIER_CD,
        shipper.CUSTOMER_NM as SHIPPER_NM,
        consignee.CUSTOMER_NM as CONSIGNEE_NM,
        op.PORT_NM as ORIGIN_PORT_NM,
        op.LATITUDE as ORIGIN_LAT,
        op.LONGITUDE as ORIGIN_LNG,
        dp.PORT_NM as DEST_PORT_NM,
        dp.LATITUDE as DEST_LAT,
        dp.LONGITUDE as DEST_LNG,
        oc.COUNTRY_NM as ORIGIN_COUNTRY_NM,
        dc.COUNTRY_NM as DEST_COUNTRY_NM
      FROM ORD_SHIPMENT s
      LEFT JOIN MST_CUSTOMER c ON s.CUSTOMER_ID = c.CUSTOMER_ID
      LEFT JOIN MST_CARRIER cr ON s.CARRIER_ID = cr.CARRIER_ID
      LEFT JOIN MST_CUSTOMER shipper ON s.SHIPPER_ID = shipper.CUSTOMER_ID
      LEFT JOIN MST_CUSTOMER consignee ON s.CONSIGNEE_ID = consignee.CUSTOMER_ID
      LEFT JOIN MST_PORT op ON s.ORIGIN_PORT_CD = op.PORT_CD
      LEFT JOIN MST_PORT dp ON s.DEST_PORT_CD = dp.PORT_CD
      LEFT JOIN MST_COUNTRY oc ON s.ORIGIN_COUNTRY_CD = oc.COUNTRY_CD
      LEFT JOIN MST_COUNTRY dc ON s.DEST_COUNTRY_CD = dc.COUNTRY_CD
      WHERE s.SHIPMENT_ID = ? OR s.SHIPMENT_NO = ?
      AND s.DEL_YN = 'N'
    `, [id, id]);

    if (!shipments || (shipments as any[]).length === 0) {
      // SHIPMENT_NO에서 숫자만 추출해서 다시 검색
      const numericId = id.replace(/\D/g, '');
      const [retryShipments] = await connection.query(`
        SELECT
          s.*,
          c.CUSTOMER_NM,
          c.CUSTOMER_CD,
          cr.CARRIER_NM,
          cr.CARRIER_CD,
          shipper.CUSTOMER_NM as SHIPPER_NM,
          consignee.CUSTOMER_NM as CONSIGNEE_NM,
          op.PORT_NM as ORIGIN_PORT_NM,
          op.LATITUDE as ORIGIN_LAT,
          op.LONGITUDE as ORIGIN_LNG,
          dp.PORT_NM as DEST_PORT_NM,
          dp.LATITUDE as DEST_LAT,
          dp.LONGITUDE as DEST_LNG,
          oc.COUNTRY_NM as ORIGIN_COUNTRY_NM,
          dc.COUNTRY_NM as DEST_COUNTRY_NM
        FROM ORD_SHIPMENT s
        LEFT JOIN MST_CUSTOMER c ON s.CUSTOMER_ID = c.CUSTOMER_ID
        LEFT JOIN MST_CARRIER cr ON s.CARRIER_ID = cr.CARRIER_ID
        LEFT JOIN MST_CUSTOMER shipper ON s.SHIPPER_ID = shipper.CUSTOMER_ID
        LEFT JOIN MST_CUSTOMER consignee ON s.CONSIGNEE_ID = consignee.CUSTOMER_ID
        LEFT JOIN MST_PORT op ON s.ORIGIN_PORT_CD = op.PORT_CD
        LEFT JOIN MST_PORT dp ON s.DEST_PORT_CD = dp.PORT_CD
        LEFT JOIN MST_COUNTRY oc ON s.ORIGIN_COUNTRY_CD = oc.COUNTRY_CD
        LEFT JOIN MST_COUNTRY dc ON s.DEST_COUNTRY_CD = dc.COUNTRY_CD
        WHERE s.SHIPMENT_ID = ?
        AND s.DEL_YN = 'N'
      `, [numericId]);

      if (!retryShipments || (retryShipments as any[]).length === 0) {
        return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
      }
      (shipments as any[]).push(...(retryShipments as any[]));
    }

    const shipment = (shipments as any[])[0];

    // S/R 정보 조회
    const [srData] = await connection.query(`
      SELECT * FROM SHP_SHIPPING_REQUEST
      WHERE SHIPMENT_ID = ? AND DEL_YN = 'N'
    `, [shipment.SHIPMENT_ID]);

    // S/N 정보 조회
    const [snData] = await connection.query(`
      SELECT * FROM SHP_SHIPPING_NOTICE
      WHERE SHIPMENT_ID = ? AND DEL_YN = 'N'
    `, [shipment.SHIPMENT_ID]);

    // 컨테이너 정보 조회 (해상의 경우)
    let containers: any[] = [];
    if (shipment.TRANSPORT_MODE_CD === 'SEA') {
      const [cntrData] = await connection.query(`
        SELECT * FROM ORD_OCEAN_BOOKING_CNTR
        WHERE BOOKING_ID IN (
          SELECT BOOKING_ID FROM ORD_OCEAN_BOOKING WHERE SHIPMENT_ID = ?
        )
      `, [shipment.SHIPMENT_ID]);
      containers = cntrData as any[];
    }

    // 트래킹 이벤트 조회
    const [trackingEvents] = await connection.query(`
      SELECT * FROM SHP_TRACKING_EVENT
      WHERE SHIPMENT_ID = ?
      ORDER BY EVENT_DTM DESC
    `, [shipment.SHIPMENT_ID]);

    // 진행률 계산
    const calculateProgress = () => {
      if (shipment.ATA_DT) return 100;
      if (shipment.STATUS_CD === 'ARRIVED') return 100;
      if (!shipment.ETD_DT || !shipment.ETA_DT) return 0;

      const now = new Date();
      const etd = new Date(shipment.ETD_DT);
      const eta = new Date(shipment.ETA_DT);

      if (now < etd) return 0;
      if (now > eta) return 95;

      const total = eta.getTime() - etd.getTime();
      const elapsed = now.getTime() - etd.getTime();

      return Math.min(95, Math.max(5, Math.round((elapsed / total) * 100)));
    };

    // 타임라인 이벤트 생성
    const timeline = [];

    // 기본 이벤트
    if (shipment.CREATED_DTM) {
      timeline.push({
        type: 'CREATED',
        title: '선적 등록',
        description: '선적이 시스템에 등록되었습니다.',
        datetime: shipment.CREATED_DTM,
        status: 'completed',
      });
    }

    if (shipment.STATUS_CD === 'BOOKED' || shipment.ETD_DT) {
      timeline.push({
        type: 'BOOKED',
        title: '부킹 확정',
        description: `${shipment.CARRIER_NM || '운송사'} 부킹이 확정되었습니다.`,
        datetime: shipment.CREATED_DTM,
        status: 'completed',
      });
    }

    if (shipment.ETD_DT) {
      const isDepart = shipment.ATD_DT || ['DEPARTED', 'SHIPPED', 'IN_TRANSIT', 'ARRIVED'].includes(shipment.STATUS_CD);
      timeline.push({
        type: 'DEPARTURE',
        title: '출발',
        description: `${shipment.ORIGIN_PORT_NM || shipment.ORIGIN_PORT_CD}에서 출발${isDepart ? '했습니다' : ' 예정입니다'}.`,
        datetime: shipment.ATD_DT || shipment.ETD_DT,
        status: isDepart ? 'completed' : 'pending',
        isEstimate: !shipment.ATD_DT,
      });
    }

    if (shipment.ETA_DT) {
      const isArrived = shipment.ATA_DT || shipment.STATUS_CD === 'ARRIVED';
      timeline.push({
        type: 'ARRIVAL',
        title: '도착',
        description: `${shipment.DEST_PORT_NM || shipment.DEST_PORT_CD}에 도착${isArrived ? '했습니다' : ' 예정입니다'}.`,
        datetime: shipment.ATA_DT || shipment.ETA_DT,
        status: isArrived ? 'completed' : 'pending',
        isEstimate: !shipment.ATA_DT,
      });
    }

    // DB 트래킹 이벤트 추가
    (trackingEvents as any[]).forEach(event => {
      timeline.push({
        type: event.EVENT_TYPE_CD,
        title: event.EVENT_NM || event.EVENT_TYPE_CD,
        description: event.EVENT_DESC || '',
        datetime: event.EVENT_DTM,
        location: event.LOCATION,
        status: 'completed',
      });
    });

    // 날짜순 정렬
    timeline.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

    const response = {
      shipment: {
        id: shipment.SHIPMENT_ID,
        shipmentNo: shipment.SHIPMENT_NO,
        transportMode: shipment.TRANSPORT_MODE_CD,
        tradeType: shipment.TRADE_TYPE_CD,
        serviceType: shipment.SERVICE_TYPE_CD,
        incoterms: shipment.INCOTERMS_CD,
        status: shipment.STATUS_CD,
        customsStatus: shipment.CUSTOMS_STATUS_CD,
        progress: calculateProgress(),

        // 고객/파트너 정보
        customer: {
          id: shipment.CUSTOMER_ID,
          name: shipment.CUSTOMER_NM,
          code: shipment.CUSTOMER_CD,
        },
        shipper: {
          id: shipment.SHIPPER_ID,
          name: shipment.SHIPPER_NM,
        },
        consignee: {
          id: shipment.CONSIGNEE_ID,
          name: shipment.CONSIGNEE_NM,
        },
        carrier: {
          id: shipment.CARRIER_ID,
          name: shipment.CARRIER_NM,
          code: shipment.CARRIER_CD,
        },

        // 출발지/도착지
        origin: {
          countryCode: shipment.ORIGIN_COUNTRY_CD,
          countryName: shipment.ORIGIN_COUNTRY_NM,
          portCode: shipment.ORIGIN_PORT_CD,
          portName: shipment.ORIGIN_PORT_NM,
          address: shipment.ORIGIN_ADDR,
          lat: shipment.ORIGIN_LAT ? parseFloat(shipment.ORIGIN_LAT) : null,
          lng: shipment.ORIGIN_LNG ? parseFloat(shipment.ORIGIN_LNG) : null,
        },
        destination: {
          countryCode: shipment.DEST_COUNTRY_CD,
          countryName: shipment.DEST_COUNTRY_NM,
          portCode: shipment.DEST_PORT_CD,
          portName: shipment.DEST_PORT_NM,
          finalDest: shipment.FINAL_DEST_CD,
          address: shipment.DEST_ADDR,
          lat: shipment.DEST_LAT ? parseFloat(shipment.DEST_LAT) : null,
          lng: shipment.DEST_LNG ? parseFloat(shipment.DEST_LNG) : null,
        },

        // 일정
        schedule: {
          cargoReadyDate: shipment.CARGO_READY_DT,
          etd: shipment.ETD_DT,
          atd: shipment.ATD_DT,
          eta: shipment.ETA_DT,
          ata: shipment.ATA_DT,
        },

        // 화물 정보
        cargo: {
          totalPackages: shipment.TOTAL_PKG_QTY,
          packageType: shipment.PKG_TYPE_CD,
          grossWeight: shipment.GROSS_WEIGHT_KG,
          volume: shipment.VOLUME_CBM,
          chargeableWeight: shipment.CHARGEABLE_WEIGHT,
        },

        // 금액 정보
        value: {
          declaredAmount: shipment.DECLARED_VALUE_AMT,
          declaredCurrency: shipment.DECLARED_VALUE_CURR,
          insuranceAmount: shipment.INSURANCE_AMT,
          insuranceCurrency: shipment.INSURANCE_CURR,
        },

        // 결제 조건
        terms: {
          freightTerm: shipment.FREIGHT_TERM_CD,
          paymentTerm: shipment.PAYMENT_TERM_CD,
        },

        // 참조 번호
        references: {
          customerRef: shipment.CUSTOMER_REF_NO,
          poNo: shipment.PO_NO,
          soNo: shipment.SO_NO,
        },

        // 비고
        remarks: shipment.REMARKS,
        specialInstructions: shipment.SPECIAL_INST,

        // 담당자
        salesManager: shipment.SALES_MANAGER_ID,
        opsManager: shipment.OPS_MANAGER_ID,

        // 감사 정보
        createdBy: shipment.CREATED_BY,
        createdAt: shipment.CREATED_DTM,
        updatedBy: shipment.UPDATED_BY,
        updatedAt: shipment.UPDATED_DTM,
      },
      shippingRequest: (srData as any[])[0] || null,
      shippingNotice: (snData as any[])[0] || null,
      containers,
      timeline,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Shipment Detail API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipment details' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
