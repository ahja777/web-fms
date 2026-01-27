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
    console.log('=== 팝업 통합 테스트 시작 ===\n');

    // 1. 해상 부킹 등록 페이지로 이동
    console.log('1. 해상 부킹 등록 페이지 접속...');
    await page.goto('http://localhost:3000/logis/booking/sea/register', { waitUntil: 'networkidle0' });
    await page.waitForSelector('.card', { timeout: 10000 });
    console.log('   ✓ 페이지 로딩 완료\n');

    // 2. 화주(Shipper) 찾기 버튼 테스트
    console.log('2. 화주(Shipper) 찾기 버튼 클릭...');
    const allButtons = await page.$$('button');

    // 첫 번째 찾기 버튼 (화주)
    for (const btn of allButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.trim() === '찾기') {
        await btn.click();
        await delay(800);
        break;
      }
    }

    // 팝업이 열렸는지 확인
    let modal = await page.$('.fixed.inset-0.bg-black\\/50');
    if (modal) {
      console.log('   ✓ 거래처코드 조회 팝업이 정상적으로 열림');

      // 검색 결과에서 첫 번째 항목 클릭
      const row = await page.$('tbody tr');
      if (row) {
        await row.click();
        await delay(300);
        console.log('   ✓ 거래처 항목 선택됨');
      }

      // 적용 버튼 클릭
      const applyButtons = await page.$$('button');
      for (const btn of applyButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.trim() === '적용') {
          await btn.click();
          await delay(500);
          console.log('   ✓ 거래처 적용 완료\n');
          break;
        }
      }
    } else {
      console.log('   ✗ 팝업이 열리지 않음 (버튼 연동 확인 필요)\n');
    }

    // 3. 스케줄 조회 버튼 테스트
    console.log('3. 스케줄 조회 버튼 클릭...');
    const scheduleButtons = await page.$$('button');
    for (const btn of scheduleButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('스케줄조회')) {
        await btn.click();
        await delay(800);
        break;
      }
    }

    modal = await page.$('.fixed.inset-0.bg-black\\/50');
    if (modal) {
      console.log('   ✓ 해상 스케줄 조회 팝업이 정상적으로 열림');

      // 스케줄 선택
      const radioBtn = await page.$('input[type="radio"]');
      if (radioBtn) {
        await radioBtn.click();
        await delay(300);
        console.log('   ✓ 스케줄 선택됨');
      }

      // 선택 버튼 클릭
      const selectButtons = await page.$$('button');
      for (const btn of selectButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.trim() === '선택') {
          await btn.click();
          await delay(500);
          console.log('   ✓ 스케줄 적용 완료\n');
          break;
        }
      }
    }

    // 4. 이메일 버튼 테스트
    console.log('4. E-mail 버튼 클릭...');
    const emailButtons = await page.$$('button');
    for (const btn of emailButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('E-mail')) {
        await btn.click();
        await delay(800);
        break;
      }
    }

    modal = await page.$('.fixed.inset-0');
    if (modal) {
      console.log('   ✓ 이메일 발송 팝업이 정상적으로 열림');

      // 닫기 버튼 클릭
      const closeButtons = await page.$$('button');
      for (const btn of closeButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.trim() === '닫기') {
          await btn.click();
          await delay(300);
          console.log('   ✓ 팝업 닫기 완료\n');
          break;
        }
      }
    }

    // 5. 테스트 데이터 버튼 테스트
    console.log('5. 테스트 데이터 버튼 클릭...');

    // alert 핸들러 설정
    page.on('dialog', async dialog => {
      console.log('   ✓ 알림:', dialog.message());
      await dialog.accept();
    });

    const testButtons = await page.$$('button');
    for (const btn of testButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('테스트데이터')) {
        await btn.click();
        await delay(1500);
        break;
      }
    }

    // 6. 폼 데이터 확인
    console.log('\n6. 폼 데이터 확인...');
    await delay(500);

    // 입력 필드 값 확인
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
    await page.screenshot({ path: 'test-screenshots/popup-test-result.png', fullPage: true });
    console.log('\n스크린샷 저장: test-screenshots/popup-test-result.png');

    console.log('\n=== 테스트 완료 ===');
    console.log('팝업 기능 테스트가 완료되었습니다.');

  } catch (error) {
    console.error('테스트 중 오류 발생:', error.message);
    await page.screenshot({ path: 'test-screenshots/popup-test-error.png', fullPage: true });
  } finally {
    await delay(3000);
    await browser.close();
  }
}

testPopupIntegration();
