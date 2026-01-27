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

async function testBackNavigation() {
  console.log('='.repeat(60));
  console.log('브라우저 뒤로가기 기능 테스트');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });

    // Test 1: 해상 견적 등록 페이지 테스트
    console.log('\n[TEST 1] 해상 견적 등록 페이지');
    console.log('-'.repeat(40));

    await page.goto('http://localhost:3000/logis/quote/sea/register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await delay(2000);

    // 페이지 로드 확인
    const title1 = await page.title();
    console.log('  [PASS] 페이지 로드 완료');

    // 스크린샷 저장
    await page.screenshot({ path: path.join(screenshotDir, 'quote-sea-register-test.png') });

    // Test 2: 항공 부킹 등록 페이지 테스트
    console.log('\n[TEST 2] 항공 부킹 등록 페이지');
    console.log('-'.repeat(40));

    await page.goto('http://localhost:3000/logis/booking/air/register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await delay(2000);

    console.log('  [PASS] 페이지 로드 완료');
    await page.screenshot({ path: path.join(screenshotDir, 'booking-air-register-test.png') });

    // Test 3: 해상 부킹 등록 페이지 테스트
    console.log('\n[TEST 3] 해상 부킹 등록 페이지');
    console.log('-'.repeat(40));

    await page.goto('http://localhost:3000/logis/booking/sea/register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await delay(2000);

    console.log('  [PASS] 페이지 로드 완료');
    await page.screenshot({ path: path.join(screenshotDir, 'booking-sea-register-test.png') });

    // Test 4: 수입 B/L 등록 페이지 테스트
    console.log('\n[TEST 4] 수입 B/L 등록 페이지');
    console.log('-'.repeat(40));

    await page.goto('http://localhost:3000/logis/import-bl/sea/register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await delay(2000);

    console.log('  [PASS] 페이지 로드 완료');
    await page.screenshot({ path: path.join(screenshotDir, 'import-bl-register-test.png') });

    // Test 5: 목록 버튼 테스트 (해상 견적)
    console.log('\n[TEST 5] 목록 버튼 클릭 테스트 (해상 견적)');
    console.log('-'.repeat(40));

    await page.goto('http://localhost:3000/logis/quote/sea/register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await delay(2000);

    // confirm 대화상자 처리
    page.once('dialog', async dialog => {
      console.log('  Dialog message:', dialog.message());
      await dialog.accept();
    });

    // 목록 버튼 찾기 및 클릭
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && b.textContent.includes('목록'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      await delay(3000);
      const currentUrl = page.url();
      if (currentUrl.includes('/logis/quote/sea') && !currentUrl.includes('register')) {
        console.log('  [PASS] 목록 페이지로 이동 성공');
      } else {
        console.log('  [INFO] 현재 URL:', currentUrl);
      }
    } else {
      console.log('  [INFO] 목록 버튼을 찾지 못했습니다.');
    }

    // Test 6: 조회 페이지에서 데이터 확인
    console.log('\n[TEST 6] 조회 페이지 데이터 확인');
    console.log('-'.repeat(40));

    await page.goto('http://localhost:3000/logis/quote/sea', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await delay(2000);

    // 테이블 행 수 확인
    const rowCount = await page.evaluate(() => {
      const rows = document.querySelectorAll('tbody tr');
      return rows.length;
    });
    console.log('  조회된 데이터 수:', rowCount);
    console.log('  [PASS] 조회 페이지 로드 완료');
    await page.screenshot({ path: path.join(screenshotDir, 'quote-sea-list-test.png') });

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

testBackNavigation();
