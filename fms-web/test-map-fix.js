const { chromium } = require('playwright');

async function testMapFix() {
  console.log('Starting map fix test...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    // 대시보드 페이지 로드
    console.log('Loading dashboard page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });

    // 지도가 로드될 때까지 대기
    console.log('Waiting for map to load...');
    await page.waitForSelector('.leaflet-container', { timeout: 30000 });
    await page.waitForTimeout(5000); // 추가 대기 (애니메이션, 타일 로딩)

    // 전체 페이지 스크린샷
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'map-fix-test-1.png', fullPage: false });

    // 지도 영역만 스크린샷
    const mapElement = await page.$('.leaflet-container');
    if (mapElement) {
      await mapElement.screenshot({ path: 'map-fix-test-2.png' });
      console.log('Map screenshot saved to map-fix-test-2.png');
    }

    // 경로가 표시되는지 확인
    const polylines = await page.$$('.leaflet-overlay-pane path');
    console.log(`Found ${polylines.length} polyline paths on the map`);

    // 마커가 표시되는지 확인
    const markers = await page.$$('.leaflet-marker-icon');
    console.log(`Found ${markers.length} markers on the map`);

    // 지도 중심 좌표 확인 (콘솔에서)
    const mapCenter = await page.evaluate(() => {
      const mapContainer = document.querySelector('.leaflet-container');
      if (mapContainer && mapContainer._leaflet_map) {
        const center = mapContainer._leaflet_map.getCenter();
        return { lat: center.lat, lng: center.lng };
      }
      return null;
    });

    if (mapCenter) {
      console.log(`Map center: lat=${mapCenter.lat}, lng=${mapCenter.lng}`);
    }

    console.log('Test completed successfully!');
    console.log('Check map-fix-test-1.png and map-fix-test-2.png for results');

  } catch (error) {
    console.error('Test failed:', error.message);
    await page.screenshot({ path: 'map-fix-error.png' });
  } finally {
    await browser.close();
  }
}

testMapFix();
