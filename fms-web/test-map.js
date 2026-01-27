const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating to main page...');
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Page loaded, waiting for map data...');

    // API 데이터 로딩 대기
    await new Promise(r => setTimeout(r, 8000));

    // 스크린샷 저장
    await page.screenshot({ path: 'map-with-real-data.png', fullPage: false });
    console.log('Screenshot saved: map-with-real-data.png');

    // Leaflet 로딩 여부 확인
    const hasLeaflet = await page.evaluate(() => {
      return document.querySelector('.leaflet-container') !== null;
    });
    console.log('Leaflet container found:', hasLeaflet);

    // 타일이 로드되었는지 확인
    const hasTiles = await page.evaluate(() => {
      return document.querySelector('.leaflet-tile-loaded') !== null;
    });
    console.log('Tiles loaded:', hasTiles);

    // 마커 확인 (선박 + 항구)
    const markerCount = await page.evaluate(() => {
      return document.querySelectorAll('.leaflet-marker-icon').length;
    });
    console.log('Markers count:', markerCount);

    // 폴리라인 확인 (항로)
    const polylineCount = await page.evaluate(() => {
      return document.querySelectorAll('.leaflet-interactive').length;
    });
    console.log('Polylines count:', polylineCount);

    // 통계 정보 확인
    const stats = await page.evaluate(() => {
      const statElements = document.querySelectorAll('.absolute.top-3.right-3 .text-xl');
      return Array.from(statElements).map(el => el.textContent);
    });
    console.log('Stats:', stats);

    // 마커에 마우스 호버하여 툴팁 테스트
    const markers = await page.$$('.custom-marker');
    if (markers.length > 0) {
      console.log('Testing hover on first ship marker...');
      const firstMarker = markers[0];
      await firstMarker.hover();
      await new Promise(r => setTimeout(r, 1000));

      // 호버 후 스크린샷
      await page.screenshot({ path: 'map-hover-tooltip.png', fullPage: false });
      console.log('Hover screenshot saved: map-hover-tooltip.png');

      // 툴팁 확인
      const tooltipVisible = await page.evaluate(() => {
        const tooltip = document.querySelector('.leaflet-tooltip');
        return tooltip !== null && tooltip.style.display !== 'none';
      });
      console.log('Tooltip visible:', tooltipVisible);
    }

    console.log('\n=== Test Results ===');
    console.log('Map loaded:', hasLeaflet && hasTiles);
    console.log('Ship markers:', markerCount > 0 ? 'OK' : 'FAIL');
    console.log('Route polylines:', polylineCount > 0 ? 'OK' : 'FAIL');

  } catch (e) {
    console.error('Error:', e.message);
  }

  await browser.close();
})();
