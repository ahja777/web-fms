const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '211.236.174.220',
    port: 53306,
    user: 'user',
    password: 'P@ssw0rd',
    database: 'logstic'
  });

  console.log('Inserting test data...');

  try {
    // 해상 부킹 테스트 데이터
    await conn.query(`
      INSERT IGNORE INTO ORD_OCEAN_BOOKING (BOOKING_ID, BOOKING_NO, CARRIER_BOOKING_NO, CARRIER_ID, VESSEL_NM, VOYAGE_NO, POL_PORT_CD, POD_PORT_CD, ETD_DT, ETA_DT, CNTR_40HC_QTY, TOTAL_CNTR_QTY, COMMODITY_DESC, GROSS_WEIGHT_KG, VOLUME_CBM, STATUS_CD, CREATED_BY, CREATED_DTM, DEL_YN)
      VALUES
      (1, 'SB-2026-0001', 'MAEU12345678', 1, 'EVER GIVEN', 'VOY001', 'KRPUS', 'USLAX', '2026-02-01', '2026-02-15', 2, 2, 'Electronics - Samsung', 15000, 65.5, 'CONFIRMED', 'admin', NOW(), 'N'),
      (2, 'SB-2026-0002', 'COSC87654321', 2, 'COSCO SHIPPING', 'VOY002', 'KRPUS', 'DEHAM', '2026-02-05', '2026-02-25', 4, 4, 'Home Appliances - LG', 22000, 88.0, 'DRAFT', 'admin', NOW(), 'N'),
      (3, 'SB-2026-0003', 'YMLU11223344', 3, 'YM WITNESS', 'VOY003', 'KRINC', 'JPTYO', '2026-02-10', '2026-02-12', 1, 1, 'Auto Parts - Hyundai', 8500, 32.0, 'PENDING', 'admin', NOW(), 'N')
    `);
    console.log('✓ Sea bookings inserted');

    // 항공 부킹 테스트 데이터
    await conn.query(`
      INSERT IGNORE INTO ORD_AIR_BOOKING (BOOKING_ID, BOOKING_NO, CARRIER_BOOKING_NO, CARRIER_ID, FLIGHT_NO, FLIGHT_DT, ORIGIN_PORT_CD, DEST_PORT_CD, ETD_DTM, ETA_DTM, COMMODITY_DESC, GROSS_WEIGHT_KG, CHARGEABLE_WEIGHT, VOLUME_CBM, PKG_QTY, STATUS_CD, CREATED_BY, CREATED_DTM, DEL_YN)
      VALUES
      (1, 'AB-2026-0001', 'KE00112233', 4, 'KE001', '2026-02-01', 'KRICN', 'USJFK', '2026-02-01 10:00:00', '2026-02-02 09:00:00', 'Semiconductors', 500, 550, 2.5, 10, 'CONFIRMED', 'admin', NOW(), 'N'),
      (2, 'AB-2026-0002', 'OZ00445566', 5, 'OZ201', '2026-02-03', 'KRICN', 'DEFRK', '2026-02-03 14:00:00', '2026-02-04 06:00:00', 'Display Panels', 800, 880, 4.0, 25, 'DRAFT', 'admin', NOW(), 'N')
    `);
    console.log('✓ Air bookings inserted');

    // S/R 테스트 데이터
    await conn.query(`
      INSERT IGNORE INTO SHP_SHIPPING_REQUEST (SR_ID, SR_NO, SHIPMENT_ID, CUSTOMER_ID, TRANSPORT_MODE_CD, TRADE_TYPE_CD, SHIPPER_NM, SHIPPER_ADDR, CONSIGNEE_NM, CONSIGNEE_ADDR, ORIGIN_PORT_CD, DEST_PORT_CD, CARGO_READY_DT, COMMODITY_DESC, PKG_QTY, PKG_TYPE_CD, GROSS_WEIGHT_KG, VOLUME_CBM, STATUS_CD, CREATED_BY, CREATED_DTM, DEL_YN)
      VALUES
      (1, 'SR-2026-0001', 1, 1, 'SEA', 'EXPORT', 'Samsung Electronics', '129 Samsung-ro, Suwon', 'Samsung America Inc.', '85 Challenger Road, Ridgefield Park, NJ', 'KRPUS', 'USLAX', '2026-01-25', 'Electronics', 100, 'CTN', 15000, 65.5, 'CONFIRMED', 'admin', NOW(), 'N'),
      (2, 'SR-2026-0002', 2, 2, 'SEA', 'EXPORT', 'LG Electronics', '128 Yeoui-daero, Seoul', 'LG Electronics Europe', 'Am Kronberger Hang, Eschborn', 'KRPUS', 'DEHAM', '2026-01-28', 'Home Appliances', 200, 'PLT', 22000, 88.0, 'DRAFT', 'admin', NOW(), 'N')
    `);
    console.log('✓ Shipping requests inserted');

    // S/N 테스트 데이터
    await conn.query(`
      INSERT IGNORE INTO SHP_SHIPPING_NOTICE (SN_ID, SN_NO, SHIPMENT_ID, SENDER_NM, RECIPIENT_NM, RECIPIENT_EMAIL, TRANSPORT_MODE_CD, CARRIER_NM, VESSEL_FLIGHT, VOYAGE_NO, ORIGIN_PORT_CD, DEST_PORT_CD, ETD_DT, ETA_DT, PKG_QTY, GROSS_WEIGHT_KG, VOLUME_CBM, SEND_STATUS_CD, CREATED_BY, CREATED_DTM, DEL_YN)
      VALUES
      (1, 'SN-2026-0001', 1, 'Samsung Logistics', 'Samsung America', 'logistics@samsung-us.com', 'SEA', 'Maersk', 'EVER GIVEN', 'VOY001', 'KRPUS', 'USLAX', '2026-02-01', '2026-02-15', 100, 15000, 65.5, 'SENT', 'admin', NOW(), 'N'),
      (2, 'SN-2026-0002', 2, 'LG Global Logistics', 'LG Europe', 'shipping@lg-europe.com', 'SEA', 'COSCO', 'COSCO SHIPPING', 'VOY002', 'KRPUS', 'DEHAM', '2026-02-05', '2026-02-25', 200, 22000, 88.0, 'DRAFT', 'admin', NOW(), 'N')
    `);
    console.log('✓ Shipping notices inserted');

    // 해상 스케줄 테스트 데이터 - VOYAGE 먼저 생성
    await conn.query(`
      INSERT IGNORE INTO SCH_VOYAGE (VOYAGE_ID, VESSEL_NM, VOYAGE_NO, CARRIER_ID, CREATED_BY, CREATED_DTM, DEL_YN)
      VALUES
      (1, 'EVER GIVEN', 'VOY001', 1, 'admin', NOW(), 'N'),
      (2, 'COSCO SHIPPING', 'VOY002', 2, 'admin', NOW(), 'N'),
      (3, 'YM WITNESS', 'VOY003', 3, 'admin', NOW(), 'N')
    `);

    await conn.query(`
      INSERT IGNORE INTO SCH_OCEAN_SCHEDULE (OCEAN_SCHEDULE_ID, VOYAGE_ID, CARRIER_ID, VESSEL_NM, VOYAGE_NO, POL_PORT_CD, POL_TERMINAL_NM, ETD_DTM, CUT_OFF_DTM, POD_PORT_CD, POD_TERMINAL_NM, ETA_DTM, TRANSIT_DAYS, STATUS_CD, CREATED_BY, CREATED_DTM, DEL_YN)
      VALUES
      (1, 1, 1, 'EVER GIVEN', 'VOY001', 'KRPUS', 'Pier 5', '2026-02-01 09:00:00', '2026-01-30 18:00:00', 'USLAX', 'Long Beach Terminal', '2026-02-15 14:00:00', 14, 'SCHEDULED', 'admin', NOW(), 'N'),
      (2, 2, 2, 'COSCO SHIPPING', 'VOY002', 'KRPUS', 'Pier 3', '2026-02-05 11:00:00', '2026-02-03 18:00:00', 'DEHAM', 'Hamburg Port', '2026-02-25 08:00:00', 20, 'SCHEDULED', 'admin', NOW(), 'N'),
      (3, 3, 3, 'YM WITNESS', 'VOY003', 'KRINC', 'Incheon Terminal', '2026-02-10 15:00:00', '2026-02-08 18:00:00', 'JPTYO', 'Tokyo Bay', '2026-02-12 10:00:00', 2, 'SCHEDULED', 'admin', NOW(), 'N')
    `);
    console.log('✓ Ocean schedules inserted');

    // 항공 스케줄 테스트 데이터
    await conn.query(`
      INSERT IGNORE INTO SCH_AIR_SCHEDULE (AIR_SCHEDULE_ID, CARRIER_ID, FLIGHT_NO, ORIGIN_PORT_CD, ORIGIN_TERMINAL, ETD_DTM, DEST_PORT_CD, DEST_TERMINAL, ETA_DTM, AIRCRAFT_TYPE, FREQUENCY_CD, STATUS_CD, CREATED_BY, CREATED_DTM, DEL_YN)
      VALUES
      (1, 4, 'KE001', 'KRICN', 'Terminal 2', '2026-02-01 10:00:00', 'USJFK', 'Terminal 1', '2026-02-02 09:00:00', 'B777', 'DAILY', 'SCHEDULED', 'admin', NOW(), 'N'),
      (2, 5, 'OZ201', 'KRICN', 'Terminal 1', '2026-02-03 14:00:00', 'DEFRK', 'Terminal 1', '2026-02-04 06:00:00', 'A380', 'DAILY', 'SCHEDULED', 'admin', NOW(), 'N'),
      (3, 4, 'KE085', 'KRICN', 'Terminal 2', '2026-02-05 23:00:00', 'USLAX', 'TBIT', '2026-02-06 18:00:00', 'B747', 'DAILY', 'SCHEDULED', 'admin', NOW(), 'N')
    `);
    console.log('✓ Air schedules inserted');

    console.log('\nAll test data inserted successfully!');
  } catch (e) {
    console.error('Error:', e.message);
  }

  await conn.end();
})();
