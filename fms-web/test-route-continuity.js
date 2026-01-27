const { chromium } = require('playwright');

async function testRouteContinuity() {
  console.log('Testing route continuity for Pacific crossing...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    console.log('Loading dashboard page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });

    await page.waitForSelector('.leaflet-container', { timeout: 30000 });
    await page.waitForTimeout(5000); // 경로 애니메이션 대기

    // 지도 영역 찾기
    const mapElement = await page.$('.leaflet-container');

    // 지도 전체 스크린샷
    await mapElement.screenshot({ path: 'route-continuity-1.png' });

    // 마커에 호버하여 툴팁 표시 테스트
    const markers = await page.$$('.leaflet-marker-icon');
    console.log(`Found ${markers.length} markers`);

    if (markers.length > 0) {
      // 첫 번째 마커에 호버
      const firstMarker = markers[0];
      const markerBox = await firstMarker.boundingBox();
      if (markerBox) {
        await page.mouse.move(markerBox.x + markerBox.width / 2, markerBox.y + markerBox.height / 2);
        await page.waitForTimeout(1500);
        await mapElement.screenshot({ path: 'route-continuity-marker-hover.png' });
      }
    }

    // SVG 경로 요소 직접 확인
    const svgPaths = await page.evaluate(() => {
      const overlay = document.querySelector('.leaflet-overlay-pane');
      if (overlay) {
        const svg = overlay.querySelector('svg');
        if (svg) {
          const paths = svg.querySelectorAll('path');
          return Array.from(paths).map(p => ({
            stroke: p.getAttribute('stroke'),
            strokeWidth: p.getAttribute('stroke-width'),
            d: p.getAttribute('d')?.substring(0, 200) // 첫 200자만
          }));
        }
      }
      return [];
    });

    console.log(`\\nFound ${svgPaths.length} SVG paths:`);
    svgPaths.slice(0, 5).forEach((p, idx) => {
      console.log(`Path ${idx}: stroke=${p.stroke}, width=${p.strokeWidth}`);
      if (p.d) {
        console.log(`  d: ${p.d}...`);
      }
    });

    // 경로의 실제 좌표 확인 (경로가 180도를 넘는지)
    const routeCoords = await page.evaluate(() => {
      const paths = document.querySelectorAll('.leaflet-overlay-pane svg path');
      const coords = [];
      paths.forEach(path => {
        const d = path.getAttribute('d');
        if (d) {
          // M, L, C 등의 좌표 추출
          const matches = d.match(/[\d.]+/g);
          if (matches && matches.length > 4) {
            coords.push({
              firstX: parseFloat(matches[0]),
              firstY: parseFloat(matches[1]),
              lastX: parseFloat(matches[matches.length - 2]),
              lastY: parseFloat(matches[matches.length - 1]),
              totalPoints: matches.length / 2
            });
          }
        }
      });
      return coords;
    });

    console.log(`\\nRoute coordinate ranges:`);
    routeCoords.slice(0, 5).forEach((c, idx) => {
      console.log(`Route ${idx}: start(${c.firstX.toFixed(0)}, ${c.firstY.toFixed(0)}) -> end(${c.lastX.toFixed(0)}, ${c.lastY.toFixed(0)}), points: ${c.totalPoints}`);
    });

    // 마커 클릭하여 팝업 표시 테스트
    if (markers.length > 0) {
      console.log('\\nTesting marker click...');
      const testMarker = markers[0];
      await testMarker.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'route-continuity-popup.png' });

      // 팝업 닫기
      const closeButton = await page.$('button:has-text("×")');
      if (closeButton) {
        await closeButton.click();
      }
    }

    console.log('\\nTest completed!');
    console.log('Screenshots: route-continuity-1.png, route-continuity-marker-hover.png, route-continuity-popup.png');

  } catch (error) {
    console.error('Test failed:', error.message);
    await page.screenshot({ path: 'route-continuity-error.png' });
  } finally {
    await browser.close();
  }
}

testRouteContinuity();
