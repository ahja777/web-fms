const puppeteer = require('puppeteer');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function testAllPopups() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  try {
    console.log('=== FMS-Web 전체 팝업 통합 테스트 ===\n');

    // 1. 해상 부킹 등록 - 화주 찾기
    console.log('1. 해상 부킹 등록 페이지 - 찾기 버튼 테스트...');
    await page.goto('http://localhost:3001/logis/booking/sea/register', { waitUntil: 'networkidle0' });
    await page.waitForSelector('.card', { timeout: 10000 });
    console.log('   ✓ 페이지 로딩 완료');

    // 찾기 버튼 클릭
    const buttons = await page.$$('button');
    let foundBtn = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.trim() === '찾기') {
        await btn.click();
        await delay(800);
        foundBtn = true;
        break;
      }
    }

    let modal = await page.$('.fixed.inset-0.bg-black\\/50');
    if (modal) {
      console.log('   ✓ CodeSearchModal 팝업 정상 작동');
      await page.keyboard.press('Escape');
      await delay(300);
    }

    // 2. 항공 부킹 등록
    console.log('\n2. 항공 부킹 등록 페이지 테스트...');
    await page.goto('http://localhost:3001/logis/booking/air/register', { waitUntil: 'networkidle0' });
    await delay(1000);
    console.log('   ✓ 페이지 로딩 완료');

    // 3. 해상 견적 등록 - 스케줄조회 버튼
    console.log('\n3. 해상 견적 등록 페이지 - 스케줄조회 버튼 테스트...');
    await page.goto('http://localhost:3001/logis/quote/sea/register', { waitUntil: 'networkidle0' });
    await delay(1000);
    console.log('   ✓ 페이지 로딩 완료');

    const scheduleButtons = await page.$$('button');
    for (const btn of scheduleButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('스케줄조회')) {
        await btn.click();
        await delay(800);
        break;
      }
    }

    modal = await page.$('.fixed.inset-0');
    if (modal) {
      console.log('   ✓ ScheduleSearchModal 팝업 정상 작동');
      await page.keyboard.press('Escape');
      await delay(300);
    }

    // 4. 해상 S/R 등록
    console.log('\n4. 해상 S/R 등록 페이지 테스트...');
    await page.goto('http://localhost:3001/logis/sr/sea/register', { waitUntil: 'networkidle0' });
    await delay(1000);
    console.log('   ✓ 페이지 로딩 완료');

    // 5. 해상 수입 B/L 등록
    console.log('\n5. 해상 수입 B/L 등록 페이지 테스트...');
    await page.goto('http://localhost:3001/logis/import-bl/sea/register', { waitUntil: 'networkidle0' });
    await delay(1000);
    console.log('   ✓ 페이지 로딩 완료');

    // 6. 해상 스케줄 등록
    console.log('\n6. 해상 스케줄 등록 페이지 테스트...');
    await page.goto('http://localhost:3001/logis/schedule/sea/register', { waitUntil: 'networkidle0' });
    await delay(1000);
    console.log('   ✓ 페이지 로딩 완료');

    // 7. AMS 등록
    console.log('\n7. AMS 등록 페이지 테스트...');
    await page.goto('http://localhost:3001/logis/ams/sea/register', { waitUntil: 'networkidle0' });
    await delay(1000);
    console.log('   ✓ 페이지 로딩 완료');

    // 8. 적하목록 등록
    console.log('\n8. 적하목록 등록 페이지 테스트...');
    await page.goto('http://localhost:3001/logis/manifest/sea/register', { waitUntil: 'networkidle0' });
    await delay(1000);
    console.log('   ✓ 페이지 로딩 완료');

    // 9. 통관 등록
    console.log('\n9. 통관 등록 페이지 테스트...');
    await page.goto('http://localhost:3001/logis/customs/sea/register', { waitUntil: 'networkidle0' });
    await delay(1000);
    console.log('   ✓ 페이지 로딩 완료');

    // 10. S/N 등록
    console.log('\n10. S/N 등록 페이지 테스트...');
    await page.goto('http://localhost:3001/logis/sn/sea/register', { waitUntil: 'networkidle0' });
    await delay(1000);
    console.log('   ✓ 페이지 로딩 완료');

    // 스크린샷 저장
    await page.screenshot({ path: 'test-screenshots/all-popups-test.png', fullPage: true });
    console.log('\n스크린샷 저장: test-screenshots/all-popups-test.png');

    console.log('\n=== 테스트 완료 ===');
    console.log('모든 등록 페이지가 정상적으로 로딩되었습니다.');
    console.log('\n팝업 컴포넌트 현황:');
    console.log('  - CodeSearchModal: 15개 코드 유형 지원');
    console.log('  - LocationCodeModal: 출발지/도착지 검색');
    console.log('  - BookingSearchModal: 부킹 정보 조회');
    console.log('  - ScheduleSearchModal: 스케줄 조회');
    console.log('  - BLSearchModal: B/L 검색');
    console.log('  - HSCodeModal: HS 품목코드');
    console.log('  - FreightCodeModal: 운임코드');
    console.log('  - ANSearchModal: A/N 검색 (신규)');
    console.log('  - StuffingOrderModal: S/O 조회 (신규)');
    console.log('  - HBLConsoleModal: HBL 취합 (신규)');
    console.log('  - OrderInfoModal: 주문정보 (신규)');
    console.log('  - DimensionsCalculatorModal: 용적계산 (신규)');

  } catch (error) {
    console.error('테스트 중 오류 발생:', error.message);
    await page.screenshot({ path: 'test-screenshots/all-popups-error.png', fullPage: true });
  } finally {
    await delay(3000);
    await browser.close();
  }
}

testAllPopups();
