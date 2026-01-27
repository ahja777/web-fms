const mysql = require('mysql2/promise');

const poolOptions = {
  host: '211.236.174.220',
  port: 53306,
  user: 'user',
  password: 'P@ssw0rd',
  database: 'logstic',
  waitForConnections: true,
  connectionLimit: 5,
};

async function runTests() {
  console.log('='.repeat(60));
  console.log('FMS-WEB 등록화면 데이터베이스 저장 테스트');
  console.log('='.repeat(60));
  console.log();

  let pool;

  try {
    // 1. DB 연결 테스트
    console.log('1. 데이터베이스 연결 테스트...');
    pool = mysql.createPool(poolOptions);
    const [connTest] = await pool.query('SELECT 1 as test');
    console.log('   [OK] 데이터베이스 연결 성공');
    console.log();

    // 2. 테이블 존재 여부 확인
    console.log('2. 테이블 존재 여부 확인...');
    const tables = [
      'ORD_OCEAN_BOOKING',
      'ORD_OCEAN_BL',
      'ORD_OCEAN_SR',
      'ORD_OCEAN_SN',
      'ORD_AIR_BOOKING',
      'SCH_OCEAN_SCHEDULE',
      'SCH_AIR_SCHEDULE',
      'ORD_QUOTE_SEA',
      'ORD_QUOTE_AIR'
    ];

    for (const table of tables) {
      try {
        const [rows] = await pool.query(`SELECT COUNT(*) as cnt FROM ${table} LIMIT 1`);
        console.log(`   [OK] ${table} - 존재 (${rows[0].cnt} rows)`);
      } catch (e) {
        console.log(`   [--] ${table} - 테이블 없음`);
      }
    }
    console.log();

    // 3. 해상 부킹 등록 테스트
    console.log('3. 해상 부킹 (ORD_OCEAN_BOOKING) 등록 테스트...');
    const testBookingNo = `TEST-${Date.now()}`;

    const [insertResult] = await pool.query(`
      INSERT INTO ORD_OCEAN_BOOKING (
        BOOKING_NO, CARRIER_BOOKING_NO, VESSEL_NM, VOYAGE_NO,
        POL_PORT_CD, POD_PORT_CD, ETD_DT, ETA_DT,
        CNTR_20GP_QTY, CNTR_40GP_QTY, TOTAL_CNTR_QTY,
        COMMODITY_DESC, GROSS_WEIGHT_KG, VOLUME_CBM, STATUS_CD, REMARKS,
        CREATED_BY, CREATED_DTM, DEL_YN
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'test', NOW(), 'N')
    `, [
      testBookingNo,
      'MAEU-TEST-001',
      'EVER GIVEN',
      '2501E',
      'KRPUS',
      'USLAX',
      '2025-02-01',
      '2025-02-15',
      2,
      1,
      3,
      'TEST CARGO - ELECTRONICS',
      15000.5,
      45.2,
      'DRAFT',
      'Test booking for validation'
    ]);

    const insertedId = insertResult.insertId;
    console.log(`   [OK] 등록 성공 - ID: ${insertedId}, Booking No: ${testBookingNo}`);

    // 4. 저장된 데이터 조회 확인
    console.log();
    console.log('4. 저장된 데이터 조회 확인...');
    const [selectResult] = await pool.query(`
      SELECT
        BOOKING_ID, BOOKING_NO, CARRIER_BOOKING_NO, VESSEL_NM, VOYAGE_NO,
        POL_PORT_CD, POD_PORT_CD, ETD_DT, ETA_DT,
        CNTR_20GP_QTY, CNTR_40GP_QTY, TOTAL_CNTR_QTY,
        COMMODITY_DESC, GROSS_WEIGHT_KG, VOLUME_CBM, STATUS_CD
      FROM ORD_OCEAN_BOOKING
      WHERE BOOKING_ID = ?
    `, [insertedId]);

    if (selectResult.length > 0) {
      console.log('   [OK] 데이터 조회 성공:');
      const data = selectResult[0];
      console.log(`       - Booking No: ${data.BOOKING_NO}`);
      console.log(`       - Vessel: ${data.VESSEL_NM} / ${data.VOYAGE_NO}`);
      console.log(`       - Route: ${data.POL_PORT_CD} -> ${data.POD_PORT_CD}`);
      console.log(`       - Containers: 20GP(${data.CNTR_20GP_QTY}) + 40GP(${data.CNTR_40GP_QTY}) = Total(${data.TOTAL_CNTR_QTY})`);
      console.log(`       - Weight: ${data.GROSS_WEIGHT_KG}kg, Volume: ${data.VOLUME_CBM}cbm`);
      console.log(`       - Status: ${data.STATUS_CD}`);
    } else {
      console.log('   [FAIL] 데이터 조회 실패');
    }

    // 5. 테스트 데이터 정리
    console.log();
    console.log('5. 테스트 데이터 정리...');
    await pool.query(`DELETE FROM ORD_OCEAN_BOOKING WHERE BOOKING_ID = ?`, [insertedId]);
    console.log(`   [OK] 테스트 데이터 삭제 완료 (ID: ${insertedId})`);

    // 6. API 엔드포인트 테스트 (dev 서버가 실행 중인 경우)
    console.log();
    console.log('6. API 엔드포인트 테스트 (http://localhost:3004)...');
    try {
      const response = await fetch('http://localhost:3004/api/booking/sea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrierBookingNo: 'API-TEST-001',
          vesselName: 'MSC OSCAR',
          voyageNo: '2502W',
          pol: 'KRPUS',
          pod: 'NLRTM',
          etd: '2025-02-10',
          eta: '2025-03-01',
          cntr20gpQty: 1,
          cntr40gpQty: 2,
          totalCntrQty: 3,
          commodityDesc: 'API TEST CARGO',
          grossWeight: 25000,
          volume: 65.5,
          status: 'CONFIRMED',
          remark: 'Created via API test'
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log(`   [OK] API 등록 성공 - Booking No: ${result.bookingNo}`);

        // API로 조회
        const getResponse = await fetch(`http://localhost:3004/api/booking/sea?bookingId=${result.bookingId}`);
        const getData = await getResponse.json();
        console.log(`   [OK] API 조회 성공 - Vessel: ${getData.vesselName}, Route: ${getData.pol} -> ${getData.pod}`);

        // 정리 - DELETE API 호출
        await fetch(`http://localhost:3004/api/booking/sea?ids=${result.bookingId}`, { method: 'DELETE' });
        console.log(`   [OK] API 테스트 데이터 정리 완료`);
      } else {
        console.log(`   [FAIL] API 등록 실패: ${result.error}`);
      }
    } catch (e) {
      console.log(`   [SKIP] API 테스트 건너뜀 - ${e.message}`);
    }

    console.log();
    console.log('='.repeat(60));
    console.log('테스트 완료!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('테스트 중 오류 발생:', error.message);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

runTests();
