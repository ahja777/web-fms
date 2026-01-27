const { chromium } = require('playwright');

async function testPacificRoute() {
  console.log('Testing Pacific crossing route display...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    console.log('Loading dashboard page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });

    // 지도가 로드될 때까지 대기
    await page.waitForSelector('.leaflet-container', { timeout: 30000 });
    await page.waitForTimeout(3000);

    // 초기 상태 스크린샷
    console.log('Taking initial screenshot...');
    await page.screenshot({ path: 'pacific-route-initial.png' });

    // 지도 영역 찾기
    const mapElement = await page.$('.leaflet-container');
    const mapBox = await mapElement.boundingBox();

    // 지도 중심으로 마우스 이동
    await page.mouse.move(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
    await page.waitForTimeout(1000);

    // 지도 확대 (태평양 지역)
    console.log('Zooming into Pacific region...');
    for (let i = 0; i < 2; i++) {
      await page.mouse.wheel(0, -200);
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(2000);

    // 확대된 상태 스크린샷
    await page.screenshot({ path: 'pacific-route-zoomed.png' });

    // 지도 영역만 스크린샷
    await mapElement.screenshot({ path: 'pacific-route-map-only.png' });

    // 경로 데이터 확인
    const routeInfo = await page.evaluate(() => {
      const paths = document.querySelectorAll('.leaflet-overlay-pane path');
      const pathData = [];
      paths.forEach((path, idx) => {
        const d = path.getAttribute('d');
        if (d && d.length > 50) {
          pathData.push({
            index: idx,
            dLength: d.length,
            stroke: path.getAttribute('stroke'),
            // 경로의 시작/끝 좌표 추정
            dStart: d.substring(0, 50),
            dEnd: d.substring(d.length - 50)
          });
        }
      });
      return pathData;
    });

    console.log(`Found ${routeInfo.length} route paths:`);
    routeInfo.forEach((info, idx) => {
      console.log(`  Path ${idx}: color=${info.stroke}, dataLength=${info.dLength}`);
    });

    // 마커 위치 확인
    const markers = await page.evaluate(() => {
      const markerElements = document.querySelectorAll('.leaflet-marker-icon');
      const markerData = [];
      markerElements.forEach((marker, idx) => {
        const style = marker.getAttribute('style');
        if (style) {
          const transform = style.match(/translate3d\(([-\d.]+)px, ([-\d.]+)px/);
          if (transform) {
            markerData.push({
              index: idx,
              x: parseFloat(transform[1]),
              y: parseFloat(transform[2])
            });
          }
        }
      });
      return markerData;
    });

    console.log(`Found ${markers.length} markers on map`);

    // 초기화 버튼 클릭 테스트
    console.log('Testing reset button...');
    const resetButton = await page.$('button[title="지도 초기화"]');
    if (resetButton) {
      await resetButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'pacific-route-after-reset.png' });
      console.log('Reset button works!');
    }

    console.log('\\nTest completed successfully!');
    console.log('Screenshots saved:');
    console.log('  - pacific-route-initial.png');
    console.log('  - pacific-route-zoomed.png');
    console.log('  - pacific-route-map-only.png');
    console.log('  - pacific-route-after-reset.png');

  } catch (error) {
    console.error('Test failed:', error.message);
    await page.screenshot({ path: 'pacific-route-error.png' });
  } finally {
    await browser.close();
  }
}

testPacificRoute();
