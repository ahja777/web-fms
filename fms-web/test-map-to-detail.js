const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Testing map to detail page navigation...');
  try {
    // 메인 페이지 이동
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Main page loaded');

    // 지도 로딩 대기
    await new Promise(r => setTimeout(r, 5000));

    // 마커 클릭
    const markers = await page.$$('.custom-marker');
    console.log('Markers found:', markers.length);

    if (markers.length > 0) {
      // 첫 번째 마커 클릭
      await markers[0].click();
      await new Promise(r => setTimeout(r, 1500));

      // 팝업 스크린샷
      await page.screenshot({ path: 'map-popup-test.png', fullPage: false });
      console.log('Popup screenshot saved');

      // 팝업이 열렸는지 확인
      const popupVisible = await page.evaluate(() => {
        const popup = document.querySelector('.fixed.inset-0');
        return popup !== null;
      });
      console.log('Popup visible:', popupVisible);

      if (popupVisible) {
        // 상세 조회 버튼 클릭
        const detailBtn = await page.$('button.bg-\\[\\#1A2744\\]');
        if (detailBtn) {
          console.log('Clicking detail button...');
          await detailBtn.click();
          await new Promise(r => setTimeout(r, 3000));

          // 현재 URL 확인
          const currentUrl = page.url();
          console.log('Current URL:', currentUrl);

          // 상세 페이지인지 확인
          if (currentUrl.includes('/logis/shipment/')) {
            console.log('Successfully navigated to shipment detail page!');
            await page.screenshot({ path: 'detail-from-map.png', fullPage: false });
            console.log('Detail page screenshot saved');

            // 선적번호 확인
            const shipmentNo = await page.evaluate(() => {
              const h1 = document.querySelector('h1');
              return h1 ? h1.textContent : null;
            });
            console.log('Shipment No on detail page:', shipmentNo);
          }
        } else {
          console.log('Detail button not found in popup');
        }
      }
    }

    console.log('\n=== Navigation Test Complete ===');

  } catch (e) {
    console.error('Error:', e.message);
  }
  await browser.close();
})();
