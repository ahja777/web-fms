const { chromium } = require('playwright');

async function testWideMap() {
  console.log('========================================');
  console.log('  넓은 지도 뷰 테스트');
  console.log('  왼쪽끝: 아프리카 | 오른쪽끝: 아메리카');
  console.log('  center: [20, 110], zoom: 1.8');
  console.log('========================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    console.log('1. 대시보드 로드 중...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });

    console.log('2. 지도 로드 대기 중...');
    await page.waitForSelector('.leaflet-container', { timeout: 30000 });
    await page.waitForTimeout(5000);

    // 지도 스크린샷
    console.log('3. 스크린샷 촬영...');
    const mapElement = await page.$('.leaflet-container');
    await mapElement.screenshot({ path: 'wide-map-result.png' });

    // 전체 페이지 스크린샷
    await page.screenshot({ path: 'wide-map-fullpage.png' });

    // 요소 확인
    const paths = await page.$$('.leaflet-overlay-pane svg path');
    const markers = await page.$$('.leaflet-marker-icon');

    console.log(`\n4. 요소 확인:`);
    console.log(`   - 경로: ${paths.length}개`);
    console.log(`   - 마커: ${markers.length}개`);

    // 초기화 버튼 테스트
    console.log('\n5. 초기화 버튼 테스트...');
    const resetBtn = await page.$('button[title="지도 초기화"]');
    if (resetBtn) {
      await resetBtn.click();
      await page.waitForTimeout(1000);
      await mapElement.screenshot({ path: 'wide-map-reset.png' });
      console.log('   ✓ 초기화 완료');
    }

    console.log('\n========================================');
    console.log('  테스트 완료!');
    console.log('========================================');
    console.log('\n결과 파일:');
    console.log('  - wide-map-result.png');
    console.log('  - wide-map-fullpage.png');
    console.log('  - wide-map-reset.png');

  } catch (error) {
    console.error('오류:', error.message);
    await page.screenshot({ path: 'wide-map-error.png' });
  } finally {
    await browser.close();
  }
}

testWideMap();
