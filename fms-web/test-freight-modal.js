const { chromium } = require('playwright');

async function testFreightModal() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('========================================');
  console.log('   운임조회 팝업 기능 테스트');
  console.log('========================================\n');

  try {
    // Alert 처리
    page.on('dialog', async dialog => {
      console.log(`   [Alert] "${dialog.message()}"`);
      await dialog.accept();
    });

    // B/L 등록 화면으로 이동
    console.log('1. 수입 B/L 등록 화면 이동...');
    await page.goto('http://localhost:3000/logis/import-bl/sea/register', { timeout: 60000 });
    await page.waitForTimeout(6000);
    console.log('   페이지 로드 완료\n');

    // 스크린샷
    await page.screenshot({ path: 'test-results/f1-bl-page.png', fullPage: true });

    // 페이지 내용 확인
    const content = await page.content();
    const hasButton = content.includes('운임조회');
    console.log(`2. 운임조회 버튼: ${hasButton ? '있음' : '없음'}`);

    if (hasButton) {
      // 운임조회 버튼 클릭
      console.log('\n3. 운임조회 버튼 클릭...');
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.textContent?.includes('운임조회')) {
            btn.click();
            break;
          }
        }
      });
      await page.waitForTimeout(2000);
      console.log('   클릭 완료');

      // 스크린샷
      await page.screenshot({ path: 'test-results/f2-freight-modal.png', fullPage: true });
      console.log('   스크린샷: test-results/f2-freight-modal.png');

      // 모달 확인
      const afterClick = await page.content();
      const modalOpen = afterClick.includes('운임 조회') ||
                       afterClick.includes('Freight') ||
                       afterClick.includes('Ocean Freight') ||
                       afterClick.includes('컨테이너');

      console.log(`\n4. 모달 상태: ${modalOpen ? '열림' : '닫힘'}`);

      if (modalOpen) {
        // 운임 데이터 확인
        const carriers = ['MAERSK', 'MSC', 'EVERGREEN', 'HMM', 'ONE', 'COSCO', 'CMA CGM'];
        const foundCarriers = carriers.filter(c => afterClick.includes(c));
        console.log(`   발견된 선사: ${foundCarriers.join(', ') || '없음'}`);

        // 컨테이너 타입 확인
        const containerTypes = ['20GP', '40GP', '40HC', 'LCL'];
        const foundTypes = containerTypes.filter(t => afterClick.includes(t));
        console.log(`   컨테이너 타입: ${foundTypes.join(', ') || '없음'}`);

        // 운임 금액 확인
        const hasAmount = afterClick.includes('USD') || afterClick.includes('$') || afterClick.includes('원');
        console.log(`   운임 금액: ${hasAmount ? '표시됨' : '없음'}`);

        // 검색 실행
        console.log('\n5. 검색 실행...');
        await page.evaluate(() => {
          const buttons = document.querySelectorAll('button');
          for (const btn of buttons) {
            if (btn.textContent?.includes('검색')) {
              btn.click();
              break;
            }
          }
        });
        await page.waitForTimeout(1500);
        console.log('   검색 완료');

        // 스크린샷
        await page.screenshot({ path: 'test-results/f3-freight-search.png', fullPage: true });
        console.log('   스크린샷: test-results/f3-freight-search.png');

        // 운임 선택
        console.log('\n6. 운임 선택...');
        await page.evaluate(() => {
          const rows = document.querySelectorAll('table tbody tr');
          if (rows.length > 0) {
            rows[0].click();
          }
        });
        await page.waitForTimeout(500);

        await page.evaluate(() => {
          const buttons = document.querySelectorAll('button');
          for (const btn of buttons) {
            if (btn.textContent?.includes('선택')) {
              btn.click();
              break;
            }
          }
        });
        await page.waitForTimeout(1500);
        console.log('   선택 완료');

        // 최종 스크린샷
        await page.screenshot({ path: 'test-results/f4-freight-result.png', fullPage: true });
        console.log('\n   스크린샷: test-results/f4-freight-result.png');
      }
    }

    // 해상 견적 등록 화면에서도 테스트
    console.log('\n\n========================================');
    console.log('   해상 견적 등록 화면 운임조회 테스트');
    console.log('========================================\n');

    await page.goto('http://localhost:3000/logis/quote/sea/register', { timeout: 60000 });
    await page.waitForTimeout(6000);
    console.log('1. 해상 견적 등록 화면 로드 완료');

    const seaContent = await page.content();
    const hasFreightBtn = seaContent.includes('운임조회');
    console.log(`2. 운임조회 버튼: ${hasFreightBtn ? '있음' : '없음'}`);

    if (hasFreightBtn) {
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.textContent?.includes('운임조회')) {
            btn.click();
            break;
          }
        }
      });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/f5-sea-freight-modal.png', fullPage: true });
      console.log('3. 스크린샷: test-results/f5-sea-freight-modal.png');

      const modalContent = await page.content();
      const modalOpen = modalContent.includes('운임 조회') || modalContent.includes('Ocean Freight');
      console.log(`4. 모달 상태: ${modalOpen ? '열림' : '닫힘'}`);
    }

  } catch (error) {
    console.error('\n오류:', error.message);
    await page.screenshot({ path: 'test-results/f-error.png', fullPage: true }).catch(() => {});
  }

  await browser.close();

  console.log('\n========================================');
  console.log('   테스트 완료');
  console.log('========================================');
}

testFreightModal().catch(console.error);
