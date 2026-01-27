const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    // 1. 목록 페이지 테스트
    console.log('1. 해상 수입 B/L 목록 페이지 접속...');
    await page.goto('http://localhost:3000/logis/import-bl/sea', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/sea-bl-list-page.png', fullPage: true });
    console.log('   목록 페이지 로드 완료');

    // 2. 체크박스 선택
    console.log('2. 첫 번째 항목 체크박스 선택...');
    const checkbox = await page.$('table tbody tr:first-child input[type="checkbox"]');
    if (checkbox) {
      await checkbox.click();
      await page.waitForTimeout(500);
      console.log('   체크박스 선택 완료');
    } else {
      console.log('   체크박스를 찾을 수 없음 - 데이터가 없을 수 있음');
    }

    // 3. 출력 버튼 찾기 및 클릭
    console.log('3. 출력 버튼 찾기...');
    const printButton = await page.$('button:has-text("출력")');
    if (printButton) {
      await printButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-screenshots/sea-bl-print-modal.png', fullPage: true });
      console.log('   출력 모달 열기 성공');

      // 모달 닫기
      const closeButton = await page.$('button:has-text("닫기")');
      if (closeButton) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    } else {
      console.log('   출력 버튼을 찾을 수 없음');
    }

    // 4. 상세 페이지 테스트
    console.log('4. 해상 수입 B/L 상세 페이지 접속...');
    await page.goto('http://localhost:3000/logis/import-bl/sea/1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/sea-bl-detail-page.png', fullPage: true });
    console.log('   상세 페이지 로드 완료');

    // 5. 상세 페이지에서 출력 버튼 찾기
    console.log('5. 상세 페이지 출력 버튼 찾기...');
    const detailPrintButton = await page.$('button:has-text("출력")');
    if (detailPrintButton) {
      await detailPrintButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-screenshots/sea-bl-detail-print-modal.png', fullPage: true });
      console.log('   상세 페이지 출력 모달 열기 성공');
    } else {
      console.log('   상세 페이지에서 출력 버튼을 찾을 수 없음');
    }

    console.log('\n테스트 완료!');
    console.log('스크린샷 저장 위치: test-screenshots/');

  } catch (error) {
    console.error('테스트 오류:', error.message);
    await page.screenshot({ path: 'test-screenshots/sea-bl-print-error.png', fullPage: true });
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
})();
