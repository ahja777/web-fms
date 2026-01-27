const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function testSeaBookingPages() {
  console.log('='.repeat(60));
  console.log('해상 선적부킹관리 페이지 테스트');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });

    // Test 1: 예약등록 페이지
    console.log('\n[TEST 1] 해상 예약등록 페이지');
    console.log('-'.repeat(40));

    await page.goto('http://localhost:3000/logis/booking/sea/register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await delay(3000);
    await page.screenshot({ path: path.join(screenshotDir, 'sea-booking-register.png') });
    console.log('  [PASS] 예약등록 페이지 로드 완료');

    // 섹션 확인
    const sections1 = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('.section-header h3'));
      return headers.map(h => h.textContent);
    });
    console.log('  섹션:', sections1.join(', '));

    // Test 2: 멀티예약 페이지
    console.log('\n[TEST 2] 해상 멀티예약 페이지');
    console.log('-'.repeat(40));

    await page.goto('http://localhost:3000/logis/booking/sea/multi-register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await delay(3000);
    await page.screenshot({ path: path.join(screenshotDir, 'sea-booking-multi-register.png') });
    console.log('  [PASS] 멀티예약 페이지 로드 완료');

    // 행 수 확인
    const rowCount = await page.evaluate(() => {
      return document.querySelectorAll('tbody tr').length;
    });
    console.log('  기본 행 수:', rowCount);

    // Test 3: 메인 목록 페이지 버튼 테스트
    console.log('\n[TEST 3] 메인 목록 페이지 버튼');
    console.log('-'.repeat(40));

    await page.goto('http://localhost:3000/logis/booking/sea', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await delay(2000);

    // 예약등록 버튼 클릭
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('예약등록'));
      if (btn) btn.click();
    });
    await delay(2000);

    const url1 = page.url();
    const isRegisterPage = url1.includes('/sea/register') && !url1.includes('multi');
    console.log(`  [${isRegisterPage ? 'PASS' : 'FAIL'}] 예약등록 버튼 -> ${url1}`);

    // 목록으로 돌아가기
    await page.goto('http://localhost:3000/logis/booking/sea', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await delay(2000);

    // 멀티예약 버튼 클릭
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.trim() === '멀티예약');
      if (btn) btn.click();
    });
    await delay(2000);

    const url2 = page.url();
    const isMultiPage = url2.includes('/multi-register');
    console.log(`  [${isMultiPage ? 'PASS' : 'FAIL'}] 멀티예약 버튼 -> ${url2}`);

    console.log('\n' + '='.repeat(60));
    console.log('테스트 완료!');
    console.log('스크린샷 저장 위치:', screenshotDir);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testSeaBookingPages();
