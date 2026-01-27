const { chromium } = require('playwright');

async function testTokyoLARoute() {
  console.log('Testing Tokyo -> LA Pacific crossing route...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('.leaflet-container', { timeout: 30000 });
    await page.waitForTimeout(5000);

    // Tokyo -> LA 경로 (shipment-9) 관련 데이터 확인
    console.log('\\n=== Tokyo -> LA Route Analysis ===');
    console.log('From: Tokyo (35.6528, 139.8395)');
    console.log('To: LA (33.7361, -118.2922)');
    console.log('Expected path: 139.8 -> 180 -> 241.7 (= -118.3 + 360)');

    // 지도 영역만 큰 사이즈로 스크린샷
    const mapElement = await page.$('.leaflet-container');
    await mapElement.screenshot({ path: 'tokyo-la-route-full.png' });

    // 지도를 왼쪽으로 드래그하여 아시아 지역 확인
    console.log('\\nDragging map to show Asia-Pacific region...');
    const mapBox = await mapElement.boundingBox();
    const centerX = mapBox.x + mapBox.width / 2;
    const centerY = mapBox.y + mapBox.height / 2;

    // 지도를 오른쪽으로 드래그 (아시아 쪽으로)
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 200, centerY, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(1000);
    await mapElement.screenshot({ path: 'tokyo-la-route-asia.png' });

    // 지도를 왼쪽으로 드래그 (태평양/미국 쪽으로)
    console.log('Dragging map to show Pacific-US region...');
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX - 400, centerY, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(1000);
    await mapElement.screenshot({ path: 'tokyo-la-route-pacific.png' });

    // 초기화
    console.log('Resetting map...');
    const resetButton = await page.$('button[title="지도 초기화"]');
    if (resetButton) {
      await resetButton.click();
      await page.waitForTimeout(1000);
    }

    // 줌인하여 태평양 지역 확인
    console.log('Zooming in on Pacific region...');
    await page.mouse.move(centerX, centerY);
    await page.mouse.wheel(0, -150);
    await page.waitForTimeout(500);
    await page.mouse.wheel(0, -150);
    await page.waitForTimeout(1000);
    await mapElement.screenshot({ path: 'tokyo-la-route-zoomed.png' });

    // SVG 경로 분석 - 색상별로 구분
    const pathsByColor = await page.evaluate(() => {
      const paths = document.querySelectorAll('.leaflet-overlay-pane svg path');
      const result = {};
      paths.forEach(path => {
        const stroke = path.getAttribute('stroke');
        const d = path.getAttribute('d');
        if (stroke && d && d !== 'M0 0') {
          if (!result[stroke]) result[stroke] = [];
          // d 속성에서 좌표 범위 추출
          const nums = d.match(/-?[\d.]+/g)?.map(Number);
          if (nums && nums.length >= 4) {
            const xCoords = nums.filter((_, i) => i % 2 === 0);
            const minX = Math.min(...xCoords);
            const maxX = Math.max(...xCoords);
            result[stroke].push({
              xRange: [minX, maxX],
              width: maxX - minX,
              points: nums.length / 2
            });
          }
        }
      });
      return result;
    });

    console.log('\\nPath analysis by color:');
    for (const [color, paths] of Object.entries(pathsByColor)) {
      console.log(`  ${color}:`);
      paths.forEach((p, i) => {
        console.log(`    Path ${i}: X range [${p.xRange[0].toFixed(0)} - ${p.xRange[1].toFixed(0)}], width: ${p.width.toFixed(0)}px, points: ${p.points}`);
      });
    }

    // Tokyo-LA 경로 색상 (#22C55E - green)
    console.log('\\nLooking for Tokyo-LA route (green #22C55E)...');
    if (pathsByColor['#22C55E']) {
      console.log('Found! Paths:', pathsByColor['#22C55E'].length);
      pathsByColor['#22C55E'].forEach((p, i) => {
        console.log(`  Segment ${i}: width ${p.width.toFixed(0)}px, ${p.points} points`);
        // 경로 너비가 300px 이상이면 태평양 횡단 경로일 가능성 높음
        if (p.width > 300) {
          console.log('    -> This looks like a Pacific crossing route!');
        }
      });
    } else {
      console.log('Not found in current view');
    }

    console.log('\\nTest completed!');
    console.log('Screenshots saved:');
    console.log('  - tokyo-la-route-full.png');
    console.log('  - tokyo-la-route-asia.png');
    console.log('  - tokyo-la-route-pacific.png');
    console.log('  - tokyo-la-route-zoomed.png');

  } catch (error) {
    console.error('Test failed:', error.message);
    await page.screenshot({ path: 'tokyo-la-route-error.png' });
  } finally {
    await browser.close();
  }
}

testTokyoLARoute();
