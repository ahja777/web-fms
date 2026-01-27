const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  // Alert 자동 수락
  page.on('dialog', async dialog => {
    console.log('   - Alert:', dialog.message());
    await dialog.accept();
  });

  console.log('=== AWB CRUD 테스트 시작 ===\n');

  try {
    // 1. 항공수입 AWB 조회 화면 테스트
    console.log('1. 항공수입 AWB 조회 화면 접속');
    await page.goto('http://localhost:3000/logis/import-bl/air');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/awb-import-list.png' });
    console.log('   - 조회 화면 접속 완료 ✓');

    // 2. 신규 등록 화면 이동
    console.log('\n2. 신규등록 화면 이동');
    await page.goto('http://localhost:3000/logis/import-bl/air/register');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/awb-import-register.png' });
    console.log('   - 등록 화면 이동 완료 ✓');

    // 3. 테스트 데이터 입력
    console.log('\n3. 테스트 데이터 입력');
    const testDataBtn = page.locator('button:has-text("테스트데이터")');
    if (await testDataBtn.isVisible()) {
      await testDataBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-screenshots/awb-import-testdata.png' });
      console.log('   - 테스트 데이터 자동 입력 완료 ✓');
    }

    // 4. 환율 조회 기능 테스트
    console.log('\n4. 환율 조회 기능 테스트');
    const exchangeBtn = page.locator('button:has-text("환율조회")');
    if (await exchangeBtn.isVisible()) {
      await exchangeBtn.click();
      await page.waitForTimeout(2000);
      const exchangeModal = page.locator('h2:has-text("환율")');
      if (await exchangeModal.isVisible({ timeout: 3000 })) {
        console.log('   - 환율 조회 모달 열림 ✓');
        await page.screenshot({ path: 'test-screenshots/awb-exchange-modal.png' });
        // 모달 닫기 버튼 클릭
        const closeBtn = page.locator('.fixed.inset-0 button').first();
        await closeBtn.click({ force: true });
        await page.waitForTimeout(1000);
        console.log('   - 환율 조회 모달 닫힘 ✓');
      }
    }

    // 5. 용적 계산 기능 테스트
    console.log('\n5. 용적 계산 기능 테스트');
    const calcBtn = page.locator('button:has-text("계산")').first();
    if (await calcBtn.isVisible()) {
      await calcBtn.click();
      await page.waitForTimeout(1500);
      const calcModal = page.locator('h2:has-text("Dimensions")');
      if (await calcModal.isVisible({ timeout: 3000 })) {
        console.log('   - Dimensions 계산 모달 열림 ✓');
        await page.screenshot({ path: 'test-screenshots/awb-dimensions-modal.png' });
        // 모달 닫기 버튼 클릭
        const closeBtn = page.locator('button:has-text("닫기")').last();
        await closeBtn.click({ force: true });
        await page.waitForTimeout(500);
        console.log('   - Dimensions 계산 모달 닫힘 ✓');
      }
    }

    // 6. CREATE - 저장 버튼 클릭
    console.log('\n6. CREATE - 데이터 저장');
    const saveBtn = page.locator('button:has-text("저장")');
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'test-screenshots/awb-create-result.png' });
      console.log('   - 저장 요청 완료 ✓');
    }

    // 7. READ - 조회 화면으로 돌아가서 데이터 확인
    console.log('\n7. READ - 데이터 조회 확인');
    await page.goto('http://localhost:3000/logis/import-bl/air');
    await page.waitForTimeout(2000);

    // 조회 버튼 클릭
    const searchBtn = page.locator('button:has-text("조회")');
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: 'test-screenshots/awb-read-list.png' });
    console.log('   - 데이터 조회 완료 ✓');

    // 8. 항공수출 AWB 조회 화면 테스트
    console.log('\n8. 항공수출 AWB 조회 화면 테스트');
    await page.goto('http://localhost:3000/logis/export-awb/air');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/awb-export-list.png' });
    console.log('   - 항공수출 AWB 조회 화면 접속 완료 ✓');

    // 9. 항공수출 AWB 등록 화면 테스트
    console.log('\n9. 항공수출 AWB 등록 화면 테스트');
    await page.goto('http://localhost:3000/logis/export-awb/air/register');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/awb-export-register.png' });
    console.log('   - 항공수출 AWB 등록 화면 접속 완료 ✓');

    // 10. DELETE 테스트 (조회 화면에서)
    console.log('\n10. DELETE 테스트');
    await page.goto('http://localhost:3000/logis/import-bl/air');
    await page.waitForTimeout(2000);

    // 첫 번째 체크박스 선택
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    if (count > 1) {
      await checkboxes.nth(1).click();
      await page.waitForTimeout(500);

      // 삭제 버튼 클릭
      const deleteBtn = page.locator('button:has-text("삭제")');
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-screenshots/awb-delete-confirm.png' });
        console.log('   - 삭제 확인 모달 표시 ✓');

        // 취소 버튼 클릭 (실제 삭제 방지)
        const cancelBtn = page.locator('button:has-text("취소")');
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
          console.log('   - 삭제 취소됨');
        }
      }
    } else {
      console.log('   - 삭제할 데이터 없음 (체크박스 부족)');
    }

    console.log('\n=== AWB CRUD 테스트 완료 ===');
    console.log('스크린샷: test-screenshots/ 폴더 확인');

    await page.waitForTimeout(2000);

  } catch (error) {
    console.error('테스트 오류:', error.message);
    await page.screenshot({ path: 'test-screenshots/awb-error.png' });
  } finally {
    await browser.close();
  }
})();
