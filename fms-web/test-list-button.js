const { chromium } = require('playwright');

async function testListButton() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('========================================');
  console.log('   목록 버튼 기능 테스트');
  console.log('========================================\n');

  // Alert 처리
  page.on('dialog', async dialog => {
    console.log(`   [Alert] "${dialog.message()}"`);
    await dialog.accept();
  });

  // 페이지 이동 함수
  async function navigateTo(url) {
    try {
      await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);
      return true;
    } catch (err) {
      console.log('   페이지 로딩 실패:', err.message);
      return false;
    }
  }

  // ============================================
  // 1. 해상 견적 등록 화면 -> 목록 버튼
  // ============================================
  console.log('========================================');
  console.log('1. 해상 견적 등록 화면 목록 버튼 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/quote/sea/register');

    console.log('1-1. 현재 URL:', page.url());
    await page.screenshot({ path: 'test-results/list-1-sea-register.png', fullPage: true });
    console.log('   스크린샷: test-results/list-1-sea-register.png\n');

    // 목록 버튼 확인 및 클릭
    console.log('1-2. 목록 버튼 클릭...');
    const listBtn1 = await page.$('button:has-text("목록")');
    if (listBtn1) {
      await listBtn1.click();
      await page.waitForTimeout(3000);

      const newUrl = page.url();
      console.log('   이동 후 URL:', newUrl);

      const isListPage = newUrl.includes('/logis/quote/sea') && !newUrl.includes('register');
      console.log(`   목록 화면 이동: ${isListPage ? '성공' : '확인필요'}`);

      await page.screenshot({ path: 'test-results/list-2-sea-list.png', fullPage: true });
      console.log('   스크린샷: test-results/list-2-sea-list.png\n');
    } else {
      console.log('   목록 버튼 없음\n');
    }
  } catch (error) {
    console.log('   오류:', error.message);
  }

  // ============================================
  // 2. 항공 견적 등록 화면 -> 목록 버튼
  // ============================================
  console.log('========================================');
  console.log('2. 항공 견적 등록 화면 목록 버튼 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/quote/air/register');

    console.log('2-1. 현재 URL:', page.url());
    await page.screenshot({ path: 'test-results/list-3-air-register.png', fullPage: true });
    console.log('   스크린샷: test-results/list-3-air-register.png\n');

    // 목록 버튼 확인 및 클릭
    console.log('2-2. 목록 버튼 클릭...');
    const listBtn2 = await page.$('button:has-text("목록")');
    if (listBtn2) {
      await listBtn2.click();
      await page.waitForTimeout(3000);

      const newUrl = page.url();
      console.log('   이동 후 URL:', newUrl);

      const isListPage = newUrl.includes('/logis/quote/air') && !newUrl.includes('register');
      console.log(`   목록 화면 이동: ${isListPage ? '성공' : '확인필요'}`);

      await page.screenshot({ path: 'test-results/list-4-air-list.png', fullPage: true });
      console.log('   스크린샷: test-results/list-4-air-list.png\n');
    } else {
      console.log('   목록 버튼 없음\n');
    }
  } catch (error) {
    console.log('   오류:', error.message);
  }

  // ============================================
  // 3. 수입 B/L 등록 화면 -> 목록 버튼
  // ============================================
  console.log('========================================');
  console.log('3. 수입 B/L 등록 화면 목록 버튼 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/import-bl/sea/register');

    console.log('3-1. 현재 URL:', page.url());
    await page.screenshot({ path: 'test-results/list-5-bl-register.png', fullPage: true });
    console.log('   스크린샷: test-results/list-5-bl-register.png\n');

    // 목록 버튼 확인 및 클릭
    console.log('3-2. 목록 버튼 클릭...');
    const listBtn3 = await page.$('button:has-text("목록")');
    if (listBtn3) {
      await listBtn3.click();
      await page.waitForTimeout(3000);

      const newUrl = page.url();
      console.log('   이동 후 URL:', newUrl);

      const isListPage = newUrl.includes('/logis/import-bl/sea') && !newUrl.includes('register');
      console.log(`   목록 화면 이동: ${isListPage ? '성공' : '확인필요'}`);

      await page.screenshot({ path: 'test-results/list-6-bl-list.png', fullPage: true });
      console.log('   스크린샷: test-results/list-6-bl-list.png\n');
    } else {
      console.log('   목록 버튼 없음\n');
    }
  } catch (error) {
    console.log('   오류:', error.message);
  }

  // ============================================
  // 4. 수출 B/L 등록 화면 -> 목록 버튼
  // ============================================
  console.log('========================================');
  console.log('4. 수출 B/L 등록 화면 목록 버튼 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/export-bl/sea/register');

    console.log('4-1. 현재 URL:', page.url());

    // 목록 버튼 확인 및 클릭
    console.log('4-2. 목록 버튼 클릭...');
    const listBtn4 = await page.$('button:has-text("목록")');
    if (listBtn4) {
      await listBtn4.click();
      await page.waitForTimeout(3000);

      const newUrl = page.url();
      console.log('   이동 후 URL:', newUrl);

      const isListPage = newUrl.includes('/logis/export-bl/sea') && !newUrl.includes('register');
      console.log(`   목록 화면 이동: ${isListPage ? '성공' : '확인필요'}`);

      await page.screenshot({ path: 'test-results/list-7-export-bl-list.png', fullPage: true });
      console.log('   스크린샷: test-results/list-7-export-bl-list.png\n');
    } else {
      console.log('   목록 버튼 없음\n');
    }
  } catch (error) {
    console.log('   오류:', error.message);
  }

  await browser.close();

  console.log('================================================');
  console.log('   목록 버튼 테스트 완료');
  console.log('================================================');
}

testListButton().catch(console.error);
