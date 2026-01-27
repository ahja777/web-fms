const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log('=== 검색 팝업 테스트 시작 ===\n');

  try {
    // 1. B/L 등록(해상수입) - 선사 검색 팝업 테스트
    console.log('1. B/L 등록(해상수입) 페이지 테스트');
    await page.goto('http://localhost:3000/logis/import-bl/sea/register');
    await page.waitForTimeout(2000);

    // 선사(LINE) 검색 버튼 찾기
    const carrierSearchBtn = page.locator('label:has-text("선사 (LINE)")').locator('..').locator('button').first();
    if (await carrierSearchBtn.isVisible()) {
      console.log('   - 선사 검색 버튼 발견');
      await carrierSearchBtn.click();
      await page.waitForTimeout(1500);

      // 모달이 열렸는지 확인
      const modalTitle = page.locator('h2:has-text("선사코드 조회")');
      if (await modalTitle.isVisible({ timeout: 3000 })) {
        console.log('   - 선사 검색 모달 열림 ✓');
        await page.screenshot({ path: 'test-screenshots/popup-carrier-modal.png' });

        // 모달 내부 닫기 버튼 클릭 (X 버튼)
        const closeBtn = page.locator('.fixed.inset-0.z-50 button svg').first();
        await closeBtn.click({ force: true });
        await page.waitForTimeout(500);
        console.log('   - 모달 닫기 ✓');
      } else {
        console.log('   - 선사 검색 모달 열리지 않음 ✗');
      }
    }

    // 2. 견적 요청 페이지 테스트
    console.log('\n2. 견적 요청 페이지 테스트');
    await page.goto('http://localhost:3000/logis/quote/request');
    await page.waitForTimeout(2000);

    // 2-1. 입력사원 검색 버튼
    console.log('   2-1. 입력사원 검색 버튼 테스트');
    const employeeBtn = page.locator('label:has-text("입력사원")').locator('..').locator('button').first();
    if (await employeeBtn.isVisible()) {
      await employeeBtn.click();
      await page.waitForTimeout(1500);

      const modalTitle = page.locator('h2:has-text("거래처코드 조회")');
      if (await modalTitle.isVisible({ timeout: 3000 })) {
        console.log('        - 입력사원 검색 모달 열림 ✓');
        await page.screenshot({ path: 'test-screenshots/popup-employee-modal.png' });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }

    // 2-2. 출발지 검색 버튼
    console.log('   2-2. 출발지 검색 버튼 테스트');
    const originBtn = page.locator('label:has-text("출발지")').first().locator('..').locator('button').first();
    if (await originBtn.isVisible()) {
      await originBtn.click();
      await page.waitForTimeout(1500);

      const modalTitle = page.locator('h2:has-text("항구코드 조회")');
      if (await modalTitle.isVisible({ timeout: 3000 })) {
        console.log('        - 출발지 검색 모달 열림 ✓');
        await page.screenshot({ path: 'test-screenshots/popup-origin-modal.png' });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }

    // 2-3. 도착지 검색 버튼
    console.log('   2-3. 도착지 검색 버튼 테스트');
    const destBtn = page.locator('label:has-text("도착지")').first().locator('..').locator('button').first();
    if (await destBtn.isVisible()) {
      await destBtn.click();
      await page.waitForTimeout(1500);

      const modalTitle = page.locator('h2:has-text("항구코드 조회")');
      if (await modalTitle.isVisible({ timeout: 3000 })) {
        console.log('        - 도착지 검색 모달 열림 ✓');
        await page.screenshot({ path: 'test-screenshots/popup-dest-modal.png' });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }

    // 2-4. 거래처 검색 버튼
    console.log('   2-4. 거래처 검색 버튼 테스트');
    const partnerBtn = page.locator('label:has-text("거래처")').first().locator('..').locator('button').first();
    if (await partnerBtn.isVisible()) {
      await partnerBtn.click();
      await page.waitForTimeout(1500);

      const modalTitle = page.locator('h2:has-text("거래처코드 조회")');
      if (await modalTitle.isVisible({ timeout: 3000 })) {
        console.log('        - 거래처 검색 모달 열림 ✓');
        await page.screenshot({ path: 'test-screenshots/popup-partner-modal.png' });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }

    console.log('\n=== 검색 팝업 테스트 완료 ===');
    console.log('스크린샷: test-screenshots/ 폴더 확인');
    await page.waitForTimeout(2000);

  } catch (error) {
    console.error('테스트 오류:', error.message);
    await page.screenshot({ path: 'test-screenshots/popup-error.png' });
  } finally {
    await browser.close();
  }
})();
