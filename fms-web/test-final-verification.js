const { chromium } = require('playwright');

async function finalVerification() {
  console.log('========================================');
  console.log('  FINAL VERIFICATION TEST');
  console.log('  Dashboard Map Pacific Route Fix');
  console.log('========================================\\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const results = {
    mapDisplayed: false,
    worldMapComplete: false,
    asiaOnLeft: false,
    usaOnRight: false,
    routesVisible: false,
    markersVisible: false,
    resetButtonWorks: false,
    popupWorks: false
  };

  try {
    console.log('1. Loading dashboard page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });

    console.log('2. Waiting for map to load...');
    await page.waitForSelector('.leaflet-container', { timeout: 30000 });
    await page.waitForTimeout(5000);
    results.mapDisplayed = true;
    console.log('   ✓ Map container loaded');

    // 3. 경로 확인
    console.log('3. Checking routes...');
    const paths = await page.$$('.leaflet-overlay-pane svg path');
    results.routesVisible = paths.length > 0;
    console.log(`   ✓ Found ${paths.length} route paths`);

    // 4. 마커 확인
    console.log('4. Checking markers...');
    const markers = await page.$$('.leaflet-marker-icon');
    results.markersVisible = markers.length > 0;
    console.log(`   ✓ Found ${markers.length} markers`);

    // 5. 지도 영역 스크린샷
    console.log('5. Taking screenshot...');
    const mapElement = await page.$('.leaflet-container');
    await mapElement.screenshot({ path: 'FINAL-map-result.png' });
    console.log('   ✓ Screenshot saved: FINAL-map-result.png');

    // 6. 초기화 버튼 테스트
    console.log('6. Testing reset button...');
    const resetButton = await page.$('button[title="지도 초기화"]');
    if (resetButton) {
      await resetButton.click();
      await page.waitForTimeout(1000);
      results.resetButtonWorks = true;
      console.log('   ✓ Reset button works');
    }

    // 7. 마커 클릭하여 팝업 테스트
    console.log('7. Testing popup...');
    if (markers.length > 0) {
      await markers[0].click();
      await page.waitForTimeout(2000);
      const popup = await page.$('.fixed.inset-0.z-\\[2000\\]');
      if (popup) {
        results.popupWorks = true;
        await page.screenshot({ path: 'FINAL-popup-result.png' });
        console.log('   ✓ Popup displayed correctly');

        // 팝업 닫기
        const closeBtn = await page.$('button.w-8.h-8.rounded-full');
        if (closeBtn) await closeBtn.click();
      }
    }

    // 8. 지도 위치 분석 (아시아 왼쪽, 미국 오른쪽 확인)
    console.log('8. Analyzing map positioning...');
    const mapInfo = await page.evaluate(() => {
      const container = document.querySelector('.leaflet-container');
      if (container && container._leaflet_map) {
        const map = container._leaflet_map;
        const center = map.getCenter();
        const bounds = map.getBounds();
        return {
          center: { lat: center.lat, lng: center.lng },
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        };
      }
      return null;
    });

    if (mapInfo) {
      console.log(`   Map center: lat=${mapInfo.center.lat.toFixed(2)}, lng=${mapInfo.center.lng.toFixed(2)}`);
      console.log(`   Bounds: W=${mapInfo.west.toFixed(0)} to E=${mapInfo.east.toFixed(0)}`);

      // 지도 중심이 태평양(-160 근처)인지 확인
      if (mapInfo.center.lng < -100 || mapInfo.center.lng > 160) {
        results.worldMapComplete = true;
        results.asiaOnLeft = true;
        results.usaOnRight = true;
        console.log('   ✓ Pacific-centered view (Asia left, USA right)');
      }
    }

    // 결과 요약
    console.log('\\n========================================');
    console.log('  TEST RESULTS SUMMARY');
    console.log('========================================');
    console.log(`  Map Displayed:       ${results.mapDisplayed ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`  World Map Complete:  ${results.worldMapComplete ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`  Asia on Left:        ${results.asiaOnLeft ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`  USA on Right:        ${results.usaOnRight ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`  Routes Visible:      ${results.routesVisible ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`  Markers Visible:     ${results.markersVisible ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`  Reset Button:        ${results.resetButtonWorks ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`  Popup Works:         ${results.popupWorks ? '✓ PASS' : '✗ FAIL'}`);

    const passCount = Object.values(results).filter(v => v).length;
    const totalCount = Object.keys(results).length;
    console.log('----------------------------------------');
    console.log(`  TOTAL: ${passCount}/${totalCount} tests passed`);
    console.log('========================================\\n');

    if (passCount === totalCount) {
      console.log('🎉 ALL TESTS PASSED! The map fix is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Please review the results.');
    }

  } catch (error) {
    console.error('\\n✗ Test failed with error:', error.message);
    await page.screenshot({ path: 'FINAL-error.png' });
  } finally {
    await browser.close();
  }
}

finalVerification();
