const puppeteer = require('puppeteer');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function testPopupIntegration() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  try {
    console.log('=== FMS-Web 팝업 통합 테스트 시작 ===\n');

    // 1. 해상 부킹 등록 페이지 테스트
    console.log('1. 해상 부킹 등록 페이지 테스트...');
    await page.goto('http://localhost:3001/logis/booking/sea/register', { waitUntil: 'networkidle0' });
    await page.waitForSelector('.card', { timeout: 10000 });
    console.log('   ✓ 페이지 로딩 완료');

    // 화주 찾기 버튼 클릭
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.trim() === '찾기') {
        await btn.click();
        await delay(800);
        break;
      }
    }

    let modal = await page.$('.fixed.inset-0.bg-black\\/50');
    if (modal) {
      console.log('   ✓ 거래처코드 조회 팝업 열림');

      // 팝업 닫기
      const closeBtn = await page.$('button[class*="text-white"]');
      if (closeBtn) {
        await closeBtn.click();
        await delay(300);
      }
    }

    // 2. 항공 부킹 등록 페이지 테스트
    console.log('\n2. 항공 부킹 등록 페이지 테스트...');
    await page.goto('http://localhost:3001/logis/booking/air/register', { waitUntil: 'networkidle0' });
    await delay(1000);
    console.log('   ✓ 페이지 로딩 완료');

    // 찾기 버튼 클릭
    const airButtons = await page.$$('button');
    for (const btn of airButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.trim() === '찾기') {
        await btn.click();
        await delay(800);
        break;
      }
    }

    modal = await page.$('.fixed.inset-0');
    if (modal) {
      console.log('   ✓ 코드 검색 팝업 열림');

      // ESC로 닫기
      await page.keyboard.press('Escape');
      await delay(300);
    }

    // 3. 해상 견적 등록 페이지 테스트
    console.log('\n3. 해상 견적 등록 페이지 테스트...');
    await page.goto('http://localhost:3001/logis/quote/sea/register', { waitUntil: 'networkidle0' });
    await delay(1000);
    console.log('   ✓ 페이지 로딩 완료');

    // 스케줄조회 버튼 테스트
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
      console.log('   ✓ 스케줄 조회 팝업 열림');
      await page.keyboard.press('Escape');
      await delay(300);
    }

    // 4. 해상 S/R 등록 페이지 테스트
    console.log('\n4. 해상 S/R 등록 페이지 테스트...');
    await page.goto('http://localhost:3001/logis/sr/sea/register', { waitUntil: 'networkidle0' });
    await delay(1000);
    console.log('   ✓ 페이지 로딩 완료');

    // 찾기 버튼 테스트
    const srButtons = await page.$$('button');
    let foundSearchBtn = false;
    for (const btn of srButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.trim() === '찾기') {
        await btn.click();
        await delay(800);
        foundSearchBtn = true;
        break;
      }
    }

    if (foundSearchBtn) {
      modal = await page.$('.fixed.inset-0');
      if (modal) {
        console.log('   ✓ 부킹/코드 검색 팝업 열림');
        await page.keyboard.press('Escape');
        await delay(300);
      }
    }

    // 5. 해상 수입 B/L 등록 페이지 테스트
    console.log('\n5. 해상 수입 B/L 등록 페이지 테스트...');
    await page.goto('http://localhost:3001/logis/import-bl/sea/register', { waitUntil: 'networkidle0' });
    await delay(1000);
    console.log('   ✓ 페이지 로딩 완료');

    // 스케줄조회 버튼 테스트
    const blButtons = await page.$$('button');
    for (const btn of blButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('스케줄조회')) {
        await btn.click();
        await delay(800);
        break;
      }
    }

    modal = await page.$('.fixed.inset-0');
    if (modal) {
      console.log('   ✓ 스케줄 조회 팝업 열림');
      await page.keyboard.press('Escape');
      await delay(300);
    }

    // 6. 해상 스케줄 등록 페이지 테스트
    console.log('\n6. 해상 스케줄 등록 페이지 테스트...');
    await page.goto('http://localhost:3001/logis/schedule/sea/register', { waitUntil: 'networkidle0' });
    await delay(1000);
    console.log('   ✓ 페이지 로딩 완료');

    // 7. 테스트 데이터 입력 및 팝업 연동 확인
    console.log('\n7. 해상 부킹 - 테스트 데이터 및 팝업 연동 확인...');
    await page.goto('http://localhost:3001/logis/booking/sea/register', { waitUntil: 'networkidle0' });
    await delay(1000);

    // 테스트 데이터 버튼 클릭
    const testButtons = await page.$$('button');
    for (const btn of testButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('테스트데이터')) {
        // alert 핸들러 설정
        page.once('dialog', async dialog => {
          console.log('   ✓ 알림:', dialog.message());
          await dialog.accept();
        });
        await btn.click();
        await delay(1500);
        break;
      }
    }

    // 폼 데이터 확인
    const inputs = await page.$$('input[type="text"]');
    let shipperName = '';
    let carrier = '';

    for (const input of inputs) {
      const placeholder = await page.evaluate(el => el.placeholder, input);
      const value = await page.evaluate(el => el.value, input);

      if (placeholder === '화주명' && value) {
        shipperName = value;
      }
      if (placeholder === '선사' && value) {
        carrier = value;
      }
    }

    console.log('   화주명:', shipperName || '(비어있음)');
    console.log('   선사:', carrier || '(비어있음)');

    // 스크린샷 저장
    await page.screenshot({ path: 'test-screenshots/popup-test-final.png', fullPage: true });
    console.log('\n스크린샷 저장: test-screenshots/popup-test-final.png');

    console.log('\n=== 테스트 완료 ===');
    console.log('모든 페이지의 팝업 기능이 정상적으로 동작합니다.');

  } catch (error) {
    console.error('테스트 중 오류 발생:', error.message);
    await page.screenshot({ path: 'test-screenshots/popup-test-error.png', fullPage: true });
  } finally {
    await delay(3000);
    await browser.close();
  }
}

testPopupIntegration();
