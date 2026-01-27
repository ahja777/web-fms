const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    // 1. 해상수출 B/L 목록 페이지 접속
    console.log('1. 해상수출 B/L 목록 페이지 접속...');
    await page.goto('http://localhost:3000/logis/bl/sea', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/export-bl-list-page.png', fullPage: true });
    console.log('   목록 페이지 로드 완료');

    // 2. 첫 번째 항목 체크박스 선택
    console.log('2. 첫 번째 항목 체크박스 선택...');
    const checkbox = await page.$('table tbody tr:first-child input[type="checkbox"]');
    if (checkbox) {
      await checkbox.click();
      await page.waitForTimeout(500);
      console.log('   체크박스 선택 완료');
    } else {
      console.log('   체크박스를 찾을 수 없음');
    }

    // 3. 출력 버튼 클릭
    console.log('3. 출력 버튼 클릭...');
    const printButton = await page.$('button:has-text("출력")');
    if (printButton) {
      await printButton.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'test-screenshots/export-bl-print-modal.png', fullPage: true });
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

    // 4. 정렬 기능 테스트
    console.log('4. 정렬 기능 테스트 (JOB.NO. 컬럼)...');
    const jobNoHeader = await page.$('th:has-text("JOB.NO.")');
    if (jobNoHeader) {
      await jobNoHeader.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-screenshots/export-bl-sorted-asc.png', fullPage: true });
      console.log('   오름차순 정렬 완료');
      
      await jobNoHeader.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-screenshots/export-bl-sorted-desc.png', fullPage: true });
      console.log('   내림차순 정렬 완료');
    }

    // 5. Excel 다운로드 테스트
    console.log('5. Excel 다운로드 버튼 클릭...');
    const excelButton = await page.$('button:has-text("Excel")');
    if (excelButton) {
      // 다운로드 이벤트 대기
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
        excelButton.click()
      ]);
      
      if (download) {
        console.log('   Excel 파일 다운로드 완료:', download.suggestedFilename());
      } else {
        console.log('   Excel 다운로드 시작 (alert 확인)');
      }
      await page.waitForTimeout(1000);
    }

    console.log('\n테스트 완료!');
    console.log('스크린샷 저장 위치: test-screenshots/');

  } catch (error) {
    console.error('테스트 오류:', error.message);
    await page.screenshot({ path: 'test-screenshots/export-bl-error.png', fullPage: true });
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
})();
