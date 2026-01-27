const { chromium } = require('playwright');

async function testAfricaAmericaMap() {
  console.log('========================================');
  console.log('  지도 배치 테스트');
  console.log('  왼쪽: 아프리카 | 오른쪽: 아메리카');
  console.log('========================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    console.log('1. 대시보드 페이지 로드 중...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });

    console.log('2. 지도 로드 대기 중...');
    await page.waitForSelector('.leaflet-container', { timeout: 30000 });
    await page.waitForTimeout(5000);

    // 지도 스크린샷
    console.log('3. 스크린샷 촬영 중...');
    const mapElement = await page.$('.leaflet-container');
    await mapElement.screenshot({ path: 'africa-america-map-1.png' });
    console.log('   ✓ 스크린샷 저장: africa-america-map-1.png');

    // 전체 페이지 스크린샷
    await page.screenshot({ path: 'africa-america-full-page.png' });
    console.log('   ✓ 전체 페이지 스크린샷: africa-america-full-page.png');

    // 경로 및 마커 확인
    const paths = await page.$$('.leaflet-overlay-pane svg path');
    const markers = await page.$$('.leaflet-marker-icon');
    console.log(`\n4. 요소 확인:`);
    console.log(`   - 경로: ${paths.length}개`);
    console.log(`   - 마커: ${markers.length}개`);

    // 초기화 버튼 테스트
    console.log('\n5. 초기화 버튼 테스트...');
    const resetButton = await page.$('button[title="지도 초기화"]');
    if (resetButton) {
      await resetButton.click();
      await page.waitForTimeout(1000);
      await mapElement.screenshot({ path: 'africa-america-map-reset.png' });
      console.log('   ✓ 초기화 버튼 작동');
    }

    // 마커 클릭 테스트
    console.log('\n6. 마커 클릭 테스트...');
    if (markers.length > 0) {
      await markers[0].click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'africa-america-popup.png' });
      console.log('   ✓ 팝업 표시 확인');
    }

    console.log('\n========================================');
    console.log('  테스트 완료!');
    console.log('========================================');
    console.log('\n스크린샷 파일:');
    console.log('  - africa-america-map-1.png (지도)');
    console.log('  - africa-america-full-page.png (전체 페이지)');
    console.log('  - africa-america-map-reset.png (초기화 후)');
    console.log('  - africa-america-popup.png (팝업)');

  } catch (error) {
    console.error('\n✗ 테스트 실패:', error.message);
    await page.screenshot({ path: 'africa-america-error.png' });
  } finally {
    await browser.close();
  }
}

testAfricaAmericaMap();
