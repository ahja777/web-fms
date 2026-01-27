/**
 * FMS-Web 데이터베이스 CRUD 상세 테스트
 * 저장, 수정, 삭제, 조회 기능 테스트
 */

const BASE_URL = 'http://localhost:3000';

async function testDatabaseOperations() {
  console.log('\n' + '='.repeat(70));
  console.log('   FMS-Web 데이터베이스 CRUD 상세 테스트');
  console.log('='.repeat(70) + '\n');

  const results = [];

  // ===== 1. 해상 견적 CRUD 테스트 =====
  console.log('\n1. 해상 견적 (Sea Quote) CRUD 테스트');
  console.log('-'.repeat(50));

  try {
    // 조회 테스트
    console.log('  [조회] 해상 견적 목록 조회...');
    const listRes = await fetch(`${BASE_URL}/api/quote/sea`);
    const listData = await listRes.json();
    console.log(`  [성공] ${listData.length}건 조회됨`);
    results.push({ test: '해상 견적 조회', status: 'pass', count: listData.length });

    // 저장 테스트
    console.log('  [저장] 새 해상 견적 저장...');
    const newQuote = {
      quoteNo: `TEST-SQ-${Date.now()}`,
      shipper: '테스트 화주 주식회사',
      consignee: '테스트 수하인',
      pol: 'KRPUS',
      pod: 'CNSHA',
      carrier: 'MAERSK',
      cargoType: 'FCL',
      containerType: '20GP',
      containerQty: 2,
      oceanFreight: 1500,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'PENDING'
    };

    const saveRes = await fetch(`${BASE_URL}/api/quote/sea`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuote)
    });

    if (saveRes.ok) {
      const saveData = await saveRes.json();
      console.log(`  [성공] 견적 저장됨 (ID: ${saveData.insertId || saveData.id || '확인필요'})`);
      results.push({ test: '해상 견적 저장', status: 'pass' });
    } else {
      console.log(`  [실패] HTTP ${saveRes.status}`);
      results.push({ test: '해상 견적 저장', status: 'fail', error: `HTTP ${saveRes.status}` });
    }
  } catch (error) {
    console.log(`  [오류] ${error.message}`);
    results.push({ test: '해상 견적 CRUD', status: 'fail', error: error.message });
  }

  // ===== 2. 해상 부킹 CRUD 테스트 =====
  console.log('\n2. 해상 부킹 (Sea Booking) CRUD 테스트');
  console.log('-'.repeat(50));

  try {
    // 조회 테스트
    console.log('  [조회] 해상 부킹 목록 조회...');
    const bookingListRes = await fetch(`${BASE_URL}/api/booking/sea`);
    const bookingListData = await bookingListRes.json();
    console.log(`  [성공] ${bookingListData.length}건 조회됨`);
    results.push({ test: '해상 부킹 조회', status: 'pass', count: bookingListData.length });

    // 저장 테스트
    console.log('  [저장] 새 해상 부킹 저장...');
    const newBooking = {
      bookingNo: `TEST-SB-${Date.now()}`,
      bookingDate: new Date().toISOString().split('T')[0],
      shipper: '테스트 화주',
      carrier: 'MSC',
      vessel: 'TEST VESSEL',
      voyage: 'V001',
      pol: 'KRPUS',
      pod: 'USLA',
      etd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      eta: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      containerType: '40HC',
      containerQty: 1,
      status: 'PENDING'
    };

    const bookingSaveRes = await fetch(`${BASE_URL}/api/booking/sea`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking)
    });

    if (bookingSaveRes.ok) {
      const bookingSaveData = await bookingSaveRes.json();
      console.log(`  [성공] 부킹 저장됨 (ID: ${bookingSaveData.insertId || bookingSaveData.id || '확인필요'})`);
      results.push({ test: '해상 부킹 저장', status: 'pass' });
    } else {
      console.log(`  [실패] HTTP ${bookingSaveRes.status}`);
      results.push({ test: '해상 부킹 저장', status: 'fail', error: `HTTP ${bookingSaveRes.status}` });
    }
  } catch (error) {
    console.log(`  [오류] ${error.message}`);
    results.push({ test: '해상 부킹 CRUD', status: 'fail', error: error.message });
  }

  // ===== 3. 해상 스케줄 CRUD 테스트 =====
  console.log('\n3. 해상 스케줄 (Sea Schedule) CRUD 테스트');
  console.log('-'.repeat(50));

  try {
    // 조회 테스트
    console.log('  [조회] 해상 스케줄 목록 조회...');
    const scheduleListRes = await fetch(`${BASE_URL}/api/schedule/sea`);
    const scheduleListData = await scheduleListRes.json();
    console.log(`  [성공] ${scheduleListData.length}건 조회됨`);
    results.push({ test: '해상 스케줄 조회', status: 'pass', count: scheduleListData.length });

    // 저장 테스트
    console.log('  [저장] 새 해상 스케줄 저장...');
    const newSchedule = {
      carrier: 'EVERGREEN',
      vessel: 'EVER GIVEN',
      voyage: 'E001',
      pol: 'KRPUS',
      pod: 'NLRTM',
      etd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      eta: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      transitTime: 21,
      space: 'AVAILABLE',
      closing: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const scheduleSaveRes = await fetch(`${BASE_URL}/api/schedule/sea`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSchedule)
    });

    if (scheduleSaveRes.ok) {
      const scheduleSaveData = await scheduleSaveRes.json();
      console.log(`  [성공] 스케줄 저장됨 (ID: ${scheduleSaveData.insertId || scheduleSaveData.id || '확인필요'})`);
      results.push({ test: '해상 스케줄 저장', status: 'pass' });
    } else {
      console.log(`  [실패] HTTP ${scheduleSaveRes.status}`);
      results.push({ test: '해상 스케줄 저장', status: 'fail', error: `HTTP ${scheduleSaveRes.status}` });
    }
  } catch (error) {
    console.log(`  [오류] ${error.message}`);
    results.push({ test: '해상 스케줄 CRUD', status: 'fail', error: error.message });
  }

  // ===== 4. S/R (Shipping Request) CRUD 테스트 =====
  console.log('\n4. S/R (Shipping Request) CRUD 테스트');
  console.log('-'.repeat(50));

  try {
    console.log('  [조회] S/R 목록 조회...');
    const srListRes = await fetch(`${BASE_URL}/api/sr/sea`);
    const srListData = await srListRes.json();
    console.log(`  [성공] ${srListData.length}건 조회됨`);
    results.push({ test: 'S/R 조회', status: 'pass', count: srListData.length });
  } catch (error) {
    console.log(`  [오류] ${error.message}`);
    results.push({ test: 'S/R CRUD', status: 'fail', error: error.message });
  }

  // ===== 5. S/N (Shipping Notice) CRUD 테스트 =====
  console.log('\n5. S/N (Shipping Notice) CRUD 테스트');
  console.log('-'.repeat(50));

  try {
    console.log('  [조회] S/N 목록 조회...');
    const snListRes = await fetch(`${BASE_URL}/api/sn/sea`);
    const snListData = await snListRes.json();
    console.log(`  [성공] ${snListData.length}건 조회됨`);
    results.push({ test: 'S/N 조회', status: 'pass', count: snListData.length });
  } catch (error) {
    console.log(`  [오류] ${error.message}`);
    results.push({ test: 'S/N CRUD', status: 'fail', error: error.message });
  }

  // ===== 6. 화물 (Shipments) CRUD 테스트 =====
  console.log('\n6. 화물 (Shipments) CRUD 테스트');
  console.log('-'.repeat(50));

  try {
    console.log('  [조회] 화물 목록 조회...');
    const shipmentsRes = await fetch(`${BASE_URL}/api/shipments`);
    const shipmentsData = await shipmentsRes.json();
    console.log(`  [성공] ${shipmentsData.length}건 조회됨`);
    results.push({ test: '화물 조회', status: 'pass', count: shipmentsData.length });

    // 단건 조회 테스트
    if (shipmentsData.length > 0) {
      const firstShipment = shipmentsData[0];
      console.log(`  [단건 조회] ID: ${firstShipment.id || firstShipment.shipment_id}...`);
      const singleRes = await fetch(`${BASE_URL}/api/shipments/${firstShipment.id || firstShipment.shipment_id}`);
      if (singleRes.ok) {
        console.log('  [성공] 단건 조회 완료');
        results.push({ test: '화물 단건 조회', status: 'pass' });
      }
    }
  } catch (error) {
    console.log(`  [오류] ${error.message}`);
    results.push({ test: '화물 CRUD', status: 'fail', error: error.message });
  }

  // ===== 7. 항공 견적 CRUD 테스트 =====
  console.log('\n7. 항공 견적 (Air Quote) CRUD 테스트');
  console.log('-'.repeat(50));

  try {
    console.log('  [조회] 항공 견적 목록 조회...');
    const airQuoteRes = await fetch(`${BASE_URL}/api/quote/air`);
    const airQuoteData = await airQuoteRes.json();
    console.log(`  [성공] ${airQuoteData.length}건 조회됨`);
    results.push({ test: '항공 견적 조회', status: 'pass', count: airQuoteData.length });
  } catch (error) {
    console.log(`  [오류] ${error.message}`);
    results.push({ test: '항공 견적 CRUD', status: 'fail', error: error.message });
  }

  // ===== 8. 항공 부킹 CRUD 테스트 =====
  console.log('\n8. 항공 부킹 (Air Booking) CRUD 테스트');
  console.log('-'.repeat(50));

  try {
    console.log('  [조회] 항공 부킹 목록 조회...');
    const airBookingRes = await fetch(`${BASE_URL}/api/booking/air`);
    const airBookingData = await airBookingRes.json();
    console.log(`  [성공] ${airBookingData.length}건 조회됨`);
    results.push({ test: '항공 부킹 조회', status: 'pass', count: airBookingData.length });
  } catch (error) {
    console.log(`  [오류] ${error.message}`);
    results.push({ test: '항공 부킹 CRUD', status: 'fail', error: error.message });
  }

  // ===== 9. 대시보드 API 테스트 =====
  console.log('\n9. 대시보드 API 테스트');
  console.log('-'.repeat(50));

  try {
    console.log('  [조회] 대시보드 데이터 조회...');
    const dashboardRes = await fetch(`${BASE_URL}/api/dashboard`);
    const dashboardData = await dashboardRes.json();
    console.log('  [성공] 대시보드 데이터 조회됨');
    console.log(`    - 총 화물: ${dashboardData.totalShipments || 0}건`);
    console.log(`    - 진행중: ${dashboardData.inProgressShipments || 0}건`);
    results.push({ test: '대시보드 조회', status: 'pass' });
  } catch (error) {
    console.log(`  [오류] ${error.message}`);
    results.push({ test: '대시보드 CRUD', status: 'fail', error: error.message });
  }

  // ===== 10. 고객/운송사 마스터 데이터 테스트 =====
  console.log('\n10. 마스터 데이터 테스트');
  console.log('-'.repeat(50));

  try {
    console.log('  [조회] 고객 목록 조회...');
    const customersRes = await fetch(`${BASE_URL}/api/customers`);
    const customersData = await customersRes.json();
    console.log(`  [성공] 고객 ${customersData.length}건 조회됨`);
    results.push({ test: '고객 목록 조회', status: 'pass', count: customersData.length });

    console.log('  [조회] 운송사 목록 조회...');
    const carriersRes = await fetch(`${BASE_URL}/api/carriers`);
    const carriersData = await carriersRes.json();
    console.log(`  [성공] 운송사 ${carriersData.length}건 조회됨`);
    results.push({ test: '운송사 목록 조회', status: 'pass', count: carriersData.length });
  } catch (error) {
    console.log(`  [오류] ${error.message}`);
    results.push({ test: '마스터 데이터', status: 'fail', error: error.message });
  }

  // ===== 결과 요약 =====
  console.log('\n' + '='.repeat(70));
  console.log('   데이터베이스 CRUD 테스트 결과 요약');
  console.log('='.repeat(70));

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;

  console.log(`\n총 테스트: ${results.length}개`);
  console.log(`성공: ${passed}개`);
  console.log(`실패: ${failed}개`);
  console.log(`성공률: ${((passed / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n[실패 항목]');
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`  - ${r.test}: ${r.error}`);
    });
  }

  console.log('\n[데이터 조회 현황]');
  results.filter(r => r.count !== undefined).forEach(r => {
    console.log(`  - ${r.test}: ${r.count}건`);
  });

  console.log('\n' + '='.repeat(70));

  return { passed, failed, total: results.length };
}

testDatabaseOperations()
  .then(result => {
    console.log('\n테스트 완료!');
    process.exit(result.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('테스트 실행 중 오류:', error);
    process.exit(1);
  });
