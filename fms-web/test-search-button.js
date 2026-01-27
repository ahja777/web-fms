const { chromium } = require('playwright');

async function testSearchButton() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('========================================');
  console.log('   조회 버튼 기능 테스트');
  console.log('========================================\n');

  // Alert 처리
  page.on('dialog', async dialog => {
    console.log(`   [Alert] "${dialog.message()}"`);
    await dialog.accept();
  });

  // 안정적인 페이지 이동
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
  // 1. 해상 견적 조회 화면 - 조회 버튼 테스트
  // ============================================
  console.log('========================================');
  console.log('1. 해상 견적 조회 화면 - 조회 버튼 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/quote/sea');

    // 초기 데이터 확인
    console.log('1-1. 초기 화면 확인...');
    await page.screenshot({ path: 'test-results/search-1-sea-init.png', fullPage: true });
    console.log('   스크린샷: test-results/search-1-sea-init.png\n');

    // 검색 조건 입력
    console.log('1-2. 검색 조건 입력...');
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        const placeholder = input.placeholder || '';
        if (placeholder.includes('거래처') || placeholder.includes('화주')) {
          input.value = '테스트';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    });
    await page.waitForTimeout(500);
    console.log('   검색 조건 입력 완료\n');

    // 조회 버튼 클릭
    console.log('1-3. 조회 버튼 클릭...');
    const searchBtn1 = await page.$('button:has-text("조회")');
    if (searchBtn1) {
      await searchBtn1.click();
      await page.waitForTimeout(2000);
      console.log('   조회 버튼 클릭 완료');

      // 결과 확인
      const content = await page.content();
      const hasData = content.includes('건') || content.includes('데이터');
      console.log(`   검색 결과: ${hasData ? '데이터 있음' : '확인필요'}\n`);
    } else {
      console.log('   조회 버튼 없음\n');
    }

    await page.screenshot({ path: 'test-results/search-2-sea-result.png', fullPage: true });
    console.log('   스크린샷: test-results/search-2-sea-result.png\n');

  } catch (error) {
    console.log('   오류:', error.message, '\n');
  }

  // ============================================
  // 2. 항공 견적 조회 화면 - 조회 버튼 테스트
  // ============================================
  console.log('========================================');
  console.log('2. 항공 견적 조회 화면 - 조회 버튼 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/quote/air');

    // 초기 화면
    console.log('2-1. 초기 화면 확인...');
    await page.screenshot({ path: 'test-results/search-3-air-init.png', fullPage: true });
    console.log('   스크린샷: test-results/search-3-air-init.png\n');

    // 조회 버튼 클릭
    console.log('2-2. 조회 버튼 클릭...');
    const searchBtn2 = await page.$('button:has-text("조회")');
    if (searchBtn2) {
      await searchBtn2.click();
      await page.waitForTimeout(2000);
      console.log('   조회 버튼 클릭 완료\n');
    } else {
      console.log('   조회 버튼 없음\n');
    }

    await page.screenshot({ path: 'test-results/search-4-air-result.png', fullPage: true });
    console.log('   스크린샷: test-results/search-4-air-result.png\n');

  } catch (error) {
    console.log('   오류:', error.message, '\n');
  }

  // ============================================
  // 3. 수입 B/L 조회 화면 - 조회 버튼 테스트
  // ============================================
  console.log('========================================');
  console.log('3. 수입 B/L 조회 화면 - 조회 버튼 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/import-bl/sea');

    // 초기 화면
    console.log('3-1. 초기 화면 확인...');
    await page.screenshot({ path: 'test-results/search-5-bl-init.png', fullPage: true });
    console.log('   스크린샷: test-results/search-5-bl-init.png\n');

    // 검색 조건 입력
    console.log('3-2. 검색 조건 입력...');
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        const placeholder = input.placeholder || '';
        if (placeholder.includes('HBL') || placeholder.includes('hbl')) {
          input.value = 'HBL';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    });
    await page.waitForTimeout(500);
    console.log('   검색 조건 입력 완료\n');

    // 조회 버튼 클릭
    console.log('3-3. 조회 버튼 클릭...');
    const searchBtn3 = await page.$('button:has-text("조회")');
    if (searchBtn3) {
      await searchBtn3.click();
      await page.waitForTimeout(3000);
      console.log('   조회 버튼 클릭 완료');

      // 결과 확인
      try {
        const content = await page.content();
        const countMatch = content.match(/(\d+)건/);
        if (countMatch) {
          console.log(`   검색 결과: ${countMatch[0]}\n`);
        } else {
          console.log('   검색 결과: 데이터 로드 완료\n');
        }
      } catch (err) {
        console.log('   결과 확인 오류\n');
      }
    } else {
      console.log('   조회 버튼 없음\n');
    }

    await page.screenshot({ path: 'test-results/search-6-bl-result.png', fullPage: true });
    console.log('   스크린샷: test-results/search-6-bl-result.png\n');

  } catch (error) {
    console.log('   오류:', error.message, '\n');
  }

  // ============================================
  // 4. 조회 + 초기화 연계 테스트
  // ============================================
  console.log('========================================');
  console.log('4. 조회 + 초기화 연계 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/import-bl/sea');

    // 검색 조건 입력
    console.log('4-1. 검색 조건 입력...');
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        const placeholder = input.placeholder || '';
        if (placeholder.includes('MBL')) {
          input.value = 'MBL';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (placeholder.includes('수화인')) {
          input.value = 'TEST';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    });
    await page.waitForTimeout(500);
    console.log('   검색 조건 입력 완료\n');

    await page.screenshot({ path: 'test-results/search-7-bl-filled.png', fullPage: true });
    console.log('   스크린샷: test-results/search-7-bl-filled.png\n');

    // 조회 버튼 클릭
    console.log('4-2. 조회 버튼 클릭...');
    const searchBtn4 = await page.$('button:has-text("조회")');
    if (searchBtn4) {
      await searchBtn4.click();
      await page.waitForTimeout(2000);
      console.log('   조회 완료\n');
    }

    await page.screenshot({ path: 'test-results/search-8-bl-searched.png', fullPage: true });
    console.log('   스크린샷: test-results/search-8-bl-searched.png\n');

    // 초기화 버튼 클릭
    console.log('4-3. 초기화 버튼 클릭...');
    const resetBtn = await page.$('button:has-text("초기화")');
    if (resetBtn) {
      await resetBtn.click();
      await page.waitForTimeout(1500);
      console.log('   초기화 완료\n');
    }

    await page.screenshot({ path: 'test-results/search-9-bl-reset.png', fullPage: true });
    console.log('   스크린샷: test-results/search-9-bl-reset.png\n');

  } catch (error) {
    console.log('   오류:', error.message, '\n');
  }

  await browser.close();

  console.log('================================================');
  console.log('   조회 버튼 테스트 완료');
  console.log('================================================');
}

testSearchButton().catch(console.error);
