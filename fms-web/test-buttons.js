const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    // 해상수출 B/L 페이지
    console.log('1. 해상수출 B/L 버튼 영역 확인...');
    await page.goto('http://localhost:3000/logis/bl/sea', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/export-bl-buttons.png', fullPage: false });
    console.log('   스크린샷 저장 완료');

    // 해상수입 B/L 페이지
    console.log('2. 해상수입 B/L 버튼 영역 확인...');
    await page.goto('http://localhost:3000/logis/import-bl/sea', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/import-bl-buttons.png', fullPage: false });
    console.log('   스크린샷 저장 완료');

    console.log('\n테스트 완료!');
  } catch (error) {
    console.error('오류:', error.message);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
})();
