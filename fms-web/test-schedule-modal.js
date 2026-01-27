const { chromium } = require('playwright');

async function testScheduleModal() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('========================================');
  console.log('   스케줄조회 팝업 기능 테스트');
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
    await page.screenshot({ path: 'test-results/s1-bl-page.png', fullPage: true });

    // 페이지 내용 확인
    const content = await page.content();
    const hasButton = content.includes('스케줄조회');
    console.log(`2. 스케줄조회 버튼: ${hasButton ? '있음' : '없음'}`);

    if (hasButton) {
      // 스케줄조회 버튼 클릭
      console.log('\n3. 스케줄조회 버튼 클릭...');
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.textContent?.includes('스케줄조회')) {
            btn.click();
            break;
          }
        }
      });
      await page.waitForTimeout(2000);
      console.log('   클릭 완료');

      // 스크린샷
      await page.screenshot({ path: 'test-results/s2-bl-modal.png', fullPage: true });
      console.log('   스크린샷: test-results/s2-bl-modal.png');

      // 모달 확인
      const afterClick = await page.content();
      const modalOpen = afterClick.includes('해상 스케줄 조회') ||
                       afterClick.includes('선적항') ||
                       afterClick.includes('POL');

      console.log(`\n4. 모달 상태: ${modalOpen ? '열림' : '닫힘'}`);

      if (modalOpen) {
        // 스케줄 데이터 확인
        const carriers = ['MAERSK', 'MSC', 'EVERGREEN', 'HMM', 'ONE', 'COSCO'];
        const foundCarriers = carriers.filter(c => afterClick.includes(c));
        console.log(`   발견된 선사: ${foundCarriers.join(', ') || '없음'}`);

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
        await page.screenshot({ path: 'test-results/s3-bl-search.png', fullPage: true });
        console.log('   스크린샷: test-results/s3-bl-search.png');

        // 스케줄 선택
        console.log('\n6. 스케줄 선택...');
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
        await page.screenshot({ path: 'test-results/s4-bl-result.png', fullPage: true });
        console.log('\n   스크린샷: test-results/s4-bl-result.png');
      }
    }

  } catch (error) {
    console.error('\n오류:', error.message);
    await page.screenshot({ path: 'test-results/s-error.png', fullPage: true }).catch(() => {});
  }

  await browser.close();

  console.log('\n========================================');
  console.log('   테스트 완료');
  console.log('========================================');
}

testScheduleModal().catch(console.error);
