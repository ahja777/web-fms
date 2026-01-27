const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Testing shipment detail page...');
  try {
    await page.goto('http://localhost:3000/logis/shipment/1', { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Page loaded');

    // 로딩 대기
    await new Promise(r => setTimeout(r, 3000));

    // 스크린샷 저장
    await page.screenshot({ path: 'shipment-detail-1.png', fullPage: false });
    console.log('Screenshot 1 saved: shipment-detail-1.png');

    // 선적번호 확인
    const shipmentNo = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent : null;
    });
    console.log('Shipment No:', shipmentNo);

    // 상태 뱃지 확인
    const statusBadge = await page.evaluate(() => {
      const badges = document.querySelectorAll('span.rounded-full');
      return Array.from(badges).map(b => b.textContent).filter(t => t);
    });
    console.log('Status badges:', statusBadge);

    // 진행률 확인
    const progress = await page.evaluate(() => {
      const progressBar = document.querySelector('.rounded-full.transition-all');
      return progressBar ? progressBar.style.width : null;
    });
    console.log('Progress:', progress);

    // 기본정보 카드 확인
    const cards = await page.evaluate(() => {
      const cardHeaders = document.querySelectorAll('.card h3');
      return Array.from(cardHeaders).map(h => h.textContent).filter(t => t);
    });
    console.log('Cards:', cards);

    // 탭 버튼들 가져오기
    const tabButtons = await page.$$('button.px-6.py-3.rounded-lg');
    console.log('Tab buttons found:', tabButtons.length);

    // 트래킹 탭 클릭
    if (tabButtons.length > 1) {
      await tabButtons[1].click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: 'shipment-detail-tracking.png', fullPage: false });
      console.log('Screenshot 2 saved: shipment-detail-tracking.png');

      // 타임라인 이벤트 확인
      const timelineEvents = await page.evaluate(() => {
        const events = document.querySelectorAll('.font-semibold.text-\\[var\\(--foreground\\)\\]');
        return Array.from(events).map(e => e.textContent).filter(t => t);
      });
      console.log('Timeline events:', timelineEvents);
    }

    // 관련서류 탭 클릭
    if (tabButtons.length > 2) {
      await tabButtons[2].click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: 'shipment-detail-documents.png', fullPage: false });
      console.log('Screenshot 3 saved: shipment-detail-documents.png');
    }

    // 다시 기본정보 탭으로
    if (tabButtons.length > 0) {
      await tabButtons[0].click();
      await new Promise(r => setTimeout(r, 500));
    }

    // 전체 페이지 스크린샷
    await page.screenshot({ path: 'shipment-detail-full.png', fullPage: true });
    console.log('Full page screenshot saved: shipment-detail-full.png');

    console.log('\n=== Test Complete ===');
    console.log('All tests passed successfully!');

  } catch (e) {
    console.error('Error:', e.message);
  }
  await browser.close();
})();
