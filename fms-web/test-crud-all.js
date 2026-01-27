const { chromium } = require('playwright');

async function testAllRegisterPages() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('================================================');
  console.log('   FMS 등록화면 CRUD 기능 종합 테스트');
  console.log('================================================\n');

  // Alert 처리
  page.on('dialog', async dialog => {
    console.log(`   [Alert] "${dialog.message()}"`);
    await dialog.accept();
  });

  // 페이지 이동 함수 (재시도 포함)
  async function navigateTo(url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);
        return true;
      } catch (err) {
        console.log(`   페이지 로딩 재시도 (${i + 1}/${maxRetries})...`);
        await page.waitForTimeout(2000);
      }
    }
    return false;
  }

  // ============================================
  // 1. 해상 견적 등록 테스트
  // ============================================
  console.log('========================================');
  console.log('1. 해상 견적 등록 화면 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/quote/sea/register');

    // 1-1. 테스트 데이터 입력
    console.log('1-1. 테스트 데이터 입력...');
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        const placeholder = input.placeholder || '';
        if (placeholder.includes('거래처') || placeholder.includes('화주')) {
          input.value = '테스트 화주 주식회사';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (placeholder.includes('출발') || placeholder.includes('POL')) {
          input.value = 'KRPUS';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (placeholder.includes('도착') || placeholder.includes('POD')) {
          input.value = 'CNSHA';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    });
    await page.waitForTimeout(500);
    console.log('   데이터 입력 완료\n');

    // 1-2. 저장 버튼 테스트
    console.log('1-2. 저장 버튼 테스트...');
    const saveBtn1 = await page.$('button:has-text("저장")');
    if (saveBtn1) {
      await saveBtn1.click();
    }
    await page.waitForTimeout(2000);
    console.log('   저장 버튼 클릭 완료');

    await page.screenshot({ path: 'test-results/crud-1-sea-save.png', fullPage: true });
    console.log('   스크린샷: test-results/crud-1-sea-save.png\n');
  } catch (error) {
    console.log('   오류:', error.message);
  }

  // ============================================
  // 2. 해상 견적 조회 -> 수정/삭제 테스트
  // ============================================
  console.log('========================================');
  console.log('2. 해상 견적 조회 화면 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/quote/sea');

    // 2-1. 초기화 버튼 테스트
    console.log('2-1. 초기화 버튼 테스트...');
    const resetBtn1 = await page.$('button:has-text("초기화")');
    if (resetBtn1) {
      await resetBtn1.click();
      await page.waitForTimeout(1000);
      console.log('   초기화 완료');
    } else {
      console.log('   초기화 버튼 없음');
    }

    await page.screenshot({ path: 'test-results/crud-2-sea-reset.png', fullPage: true });
    console.log('   스크린샷: test-results/crud-2-sea-reset.png\n');

    // 2-2. 첫 번째 항목 선택
    console.log('2-2. 첫 번째 항목 선택...');
    const checkboxes = await page.$$('input[type="checkbox"]');
    if (checkboxes.length > 1) {
      await checkboxes[1].click();
      await page.waitForTimeout(500);
      console.log('   항목 선택 완료\n');
    } else {
      console.log('   선택할 항목 없음\n');
    }

    // 2-3. 수정 버튼 테스트
    console.log('2-3. 수정 버튼 테스트...');
    const editBtn1 = await page.$('button:has-text("수정")');
    if (editBtn1) {
      await editBtn1.click();
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      const isEditMode = currentUrl.includes('quoteId') || currentUrl.includes('register');
      console.log(`   수정 화면 이동: ${isEditMode ? '성공' : '확인필요'}`);
    } else {
      console.log('   수정 버튼 없음');
    }

    await page.screenshot({ path: 'test-results/crud-3-sea-edit.png', fullPage: true });
    console.log('   스크린샷: test-results/crud-3-sea-edit.png\n');

    // 2-4. 삭제 버튼 테스트 (조회 화면으로 돌아가서)
    console.log('2-4. 삭제 버튼 테스트...');
    await navigateTo('http://localhost:3000/logis/quote/sea');

    const checkboxes2 = await page.$$('input[type="checkbox"]');
    if (checkboxes2.length > 1) {
      await checkboxes2[1].click();
      await page.waitForTimeout(500);
    }

    const deleteBtn1 = await page.$('button:has-text("삭제")');
    if (deleteBtn1) {
      await deleteBtn1.click();
      await page.waitForTimeout(2000);
      console.log('   삭제 버튼 클릭 완료');
    } else {
      console.log('   삭제 버튼 없음');
    }

    await page.screenshot({ path: 'test-results/crud-4-sea-delete.png', fullPage: true });
    console.log('   스크린샷: test-results/crud-4-sea-delete.png\n');
  } catch (error) {
    console.log('   오류:', error.message);
  }

  // ============================================
  // 3. 항공 견적 등록 테스트
  // ============================================
  console.log('========================================');
  console.log('3. 항공 견적 등록 화면 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/quote/air/register');

    // 3-1. 테스트 데이터 입력
    console.log('3-1. 테스트 데이터 입력...');
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        const placeholder = input.placeholder || '';
        if (placeholder.includes('거래처') || placeholder.includes('화주')) {
          input.value = '항공 테스트 화주';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    });
    await page.waitForTimeout(500);
    console.log('   데이터 입력 완료\n');

    // 3-2. 저장 버튼 테스트
    console.log('3-2. 저장 버튼 테스트...');
    const saveBtn2 = await page.$('button:has-text("저장")');
    if (saveBtn2) {
      await saveBtn2.click();
      await page.waitForTimeout(2000);
      console.log('   저장 버튼 클릭 완료');
    } else {
      console.log('   저장 버튼 없음');
    }

    await page.screenshot({ path: 'test-results/crud-5-air-save.png', fullPage: true });
    console.log('   스크린샷: test-results/crud-5-air-save.png\n');
  } catch (error) {
    console.log('   오류:', error.message);
  }

  // ============================================
  // 4. 항공 견적 조회 테스트
  // ============================================
  console.log('========================================');
  console.log('4. 항공 견적 조회 화면 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/quote/air');

    // 4-1. 초기화 버튼 테스트
    console.log('4-1. 초기화 버튼 테스트...');
    const resetBtn2 = await page.$('button:has-text("초기화")');
    if (resetBtn2) {
      await resetBtn2.click();
      await page.waitForTimeout(1000);
      console.log('   초기화 완료');
    } else {
      console.log('   초기화 버튼 없음');
    }

    await page.screenshot({ path: 'test-results/crud-6-air-reset.png', fullPage: true });
    console.log('   스크린샷: test-results/crud-6-air-reset.png\n');

    // 4-2. 신규 버튼 테스트
    console.log('4-2. 신규 버튼 테스트...');
    const newBtn1 = await page.$('button:has-text("신규")');
    if (newBtn1) {
      await newBtn1.click();
      await page.waitForTimeout(2000);
      const airRegisterUrl = page.url();
      console.log(`   신규 화면 이동: ${airRegisterUrl.includes('register') ? '성공' : '확인필요'}`);
    } else {
      console.log('   신규 버튼 없음');
    }

    await page.screenshot({ path: 'test-results/crud-7-air-new.png', fullPage: true });
    console.log('   스크린샷: test-results/crud-7-air-new.png\n');
  } catch (error) {
    console.log('   오류:', error.message);
  }

  // ============================================
  // 5. 수입 B/L 등록 테스트
  // ============================================
  console.log('========================================');
  console.log('5. 수입 B/L 등록 화면 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/import-bl/sea/register');

    // 5-1. 테스트 데이터 입력
    console.log('5-1. 테스트 데이터 입력...');
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        const placeholder = input.placeholder || '';
        const name = input.name || '';
        if (placeholder.includes('HBL') || name.includes('hbl')) {
          input.value = 'TEST-HBL-001';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (placeholder.includes('MBL') || name.includes('mbl')) {
          input.value = 'TEST-MBL-001';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (placeholder.includes('SHIPPER') || name.includes('shipper')) {
          input.value = 'TEST SHIPPER CO., LTD';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (placeholder.includes('CONSIGNEE') || name.includes('consignee')) {
          input.value = 'TEST CONSIGNEE CO., LTD';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    });
    await page.waitForTimeout(500);
    console.log('   데이터 입력 완료\n');

    // 5-2. 저장 버튼 테스트
    console.log('5-2. 저장 버튼 테스트...');
    const saveBtn3 = await page.$('button:has-text("저장")');
    if (saveBtn3) {
      await saveBtn3.click();
      await page.waitForTimeout(2000);
      console.log('   저장 버튼 클릭 완료');
    } else {
      console.log('   저장 버튼 없음');
    }

    await page.screenshot({ path: 'test-results/crud-8-bl-save.png', fullPage: true });
    console.log('   스크린샷: test-results/crud-8-bl-save.png\n');
  } catch (error) {
    console.log('   오류:', error.message);
  }

  // ============================================
  // 6. 수입 B/L 조회 테스트
  // ============================================
  console.log('========================================');
  console.log('6. 수입 B/L 조회 화면 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/import-bl/sea');

    // 6-1. 초기화 버튼 테스트
    console.log('6-1. 초기화 버튼 테스트...');
    const resetBtn3 = await page.$('button:has-text("초기화")');
    if (resetBtn3) {
      await resetBtn3.click();
      await page.waitForTimeout(1000);
      console.log('   초기화 완료');
    } else {
      console.log('   초기화 버튼 없음');
    }

    await page.screenshot({ path: 'test-results/crud-9-bl-reset.png', fullPage: true });
    console.log('   스크린샷: test-results/crud-9-bl-reset.png\n');

    // 6-2. 항목 선택 후 수정
    console.log('6-2. 수정 버튼 테스트...');
    const checkboxes3 = await page.$$('input[type="checkbox"]');
    if (checkboxes3.length > 1) {
      await checkboxes3[1].click();
      await page.waitForTimeout(500);
    }

    const editBtn2 = await page.$('button:has-text("수정")');
    if (editBtn2) {
      await editBtn2.click();
      await page.waitForTimeout(2000);
      const blEditUrl = page.url();
      console.log(`   수정 화면 이동: ${blEditUrl.includes('hblId') || blEditUrl.includes('register') ? '성공' : '확인필요'}`);
    } else {
      console.log('   수정 버튼 없음');
    }

    await page.screenshot({ path: 'test-results/crud-10-bl-edit.png', fullPage: true });
    console.log('   스크린샷: test-results/crud-10-bl-edit.png\n');

    // 6-3. 삭제 버튼 테스트
    console.log('6-3. 삭제 버튼 테스트...');
    await navigateTo('http://localhost:3000/logis/import-bl/sea');

    const checkboxes4 = await page.$$('input[type="checkbox"]');
    if (checkboxes4.length > 1) {
      await checkboxes4[1].click();
      await page.waitForTimeout(500);
    }

    const deleteBtn2 = await page.$('button:has-text("삭제")');
    if (deleteBtn2) {
      await deleteBtn2.click();
      await page.waitForTimeout(2000);
      console.log('   삭제 버튼 클릭 완료');
    } else {
      console.log('   삭제 버튼 없음');
    }

    await page.screenshot({ path: 'test-results/crud-11-bl-delete.png', fullPage: true });
    console.log('   스크린샷: test-results/crud-11-bl-delete.png\n');
  } catch (error) {
    console.log('   오류:', error.message);
  }

  await browser.close();

  console.log('================================================');
  console.log('   테스트 완료');
  console.log('================================================');
}

testAllRegisterPages().catch(console.error);
