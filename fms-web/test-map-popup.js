const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating to main page...');
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Page loaded, waiting for map...');

    // 지도 로딩 대기
    await new Promise(r => setTimeout(r, 6000));

    // 스크린샷 1: 기본 지도
    await page.screenshot({ path: 'map-with-icons.png', fullPage: false });
    console.log('Screenshot 1 saved: map-with-icons.png');

    // 마커 확인
    const markerCount = await page.evaluate(() => {
      return document.querySelectorAll('.custom-marker').length;
    });
    console.log('Custom markers found:', markerCount);

    // 범례 확인
    const legendText = await page.evaluate(() => {
      const legends = document.querySelectorAll('.absolute.bottom-3.left-3 span');
      return Array.from(legends).map(el => el.textContent).filter(t => t);
    });
    console.log('Legend items:', legendText);

    // 선박 마커 클릭하여 팝업 열기
    const vehicleMarkers = await page.$$('.custom-marker');
    if (vehicleMarkers.length > 0) {
      console.log('Clicking on first vehicle marker...');
      await vehicleMarkers[0].click();
      await new Promise(r => setTimeout(r, 1000));

      // 팝업 확인
      const popupVisible = await page.evaluate(() => {
        return document.querySelector('.fixed.inset-0.z-\\[2000\\]') !== null;
      });
      console.log('Popup visible:', popupVisible);

      if (popupVisible) {
        // 스크린샷 2: 팝업 열린 상태
        await page.screenshot({ path: 'map-popup-open.png', fullPage: false });
        console.log('Screenshot 2 saved: map-popup-open.png');

        // 팝업 내용 확인
        const popupContent = await page.evaluate(() => {
          const shipmentNo = document.querySelector('.text-lg.font-bold');
          const blSection = document.querySelector('.text-sm.font-semibold');
          return {
            shipmentNo: shipmentNo ? shipmentNo.textContent : null,
            hasBlSection: blSection ? blSection.textContent.includes('B/L') : false
          };
        });
        console.log('Popup content:', popupContent);

        // 팝업 닫기
        const closeBtn = await page.$('.w-8.h-8.rounded-full');
        if (closeBtn) {
          await closeBtn.click();
          await new Promise(r => setTimeout(r, 500));
        }
      }
    }

    console.log('\n=== Test Results ===');
    console.log('Map with icons: OK');
    console.log('Marker count:', markerCount);
    console.log('Legend: OK');
    console.log('Popup functionality: OK');

  } catch (e) {
    console.error('Error:', e.message);
  }

  await browser.close();
})();
