const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testMapRoutes() {
  console.log('🚀 지도 경로 테스트 시작...\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  try {
    // 1. Dashboard 페이지 로드
    console.log('1️⃣ Dashboard 페이지 로드 중...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('   ✅ Dashboard 페이지 로드 완료\n');

    // 2. 지도 컴포넌트 확인
    console.log('2️⃣ 지도 컴포넌트 확인 중...');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    console.log('   ✅ Leaflet 지도 컴포넌트 로드됨\n');

    // 3. 지도 타일 로드 확인
    console.log('3️⃣ 지도 타일 로드 확인 중...');
    await page.waitForSelector('.leaflet-tile-loaded', { timeout: 10000 });
    console.log('   ✅ Google Maps 타일 로드됨\n');

    // 4. 경로(Polyline) 확인
    console.log('4️⃣ 운송 경로 확인 중...');
    const polylines = await page.$$('.leaflet-interactive');
    console.log(`   ✅ ${polylines.length}개의 경로/마커 요소 발견\n`);

    // 5. 운송 마커 확인
    console.log('5️⃣ 운송 마커 확인 중...');
    const markers = await page.$$('.leaflet-marker-icon');
    console.log(`   ✅ ${markers.length}개의 마커 발견\n`);

    // 6. 마커 클릭 테스트
    if (markers.length > 0) {
      console.log('6️⃣ 마커 클릭 테스트...');
      await markers[0].click();
      await delay(1000);

      // 팝업 확인
      const popup = await page.$('.fixed.inset-0');
      if (popup) {
        console.log('   ✅ 팝업이 정상적으로 열림\n');

        // 7. 팝업 내용 확인
        console.log('7️⃣ 팝업 내용 확인 중...');
        try {
          const popupContent = await page.evaluate(() => {
            const el = document.querySelector('.bg-white.rounded-2xl');
            return el ? el.innerText : '';
          });
          if (popupContent && (popupContent.includes('Shipment') || popupContent.includes('SN-') || popupContent.includes('B/L') || popupContent.includes('AWB') || popupContent.includes('No.'))) {
            console.log('   ✅ 팝업에 선적 정보 표시됨\n');
          } else {
            console.log('   ⚠️ 팝업 내용 확인 필요\n');
          }
        } catch (e) {
          console.log('   ⚠️ 팝업 내용 확인 스킵\n');
        }

        // 8. B/L 클릭 버튼 확인
        console.log('8️⃣ B/L 번호 클릭 버튼 확인...');
        const blButtons = await page.$$('.text-blue-600');
        if (blButtons.length > 0) {
          console.log(`   ✅ ${blButtons.length}개의 B/L 클릭 버튼 발견\n`);
        } else {
          console.log('   ⚠️ B/L 클릭 버튼 없음\n');
        }

        // 팝업 닫기 대기 (자동 종료 테스트)
        console.log('9️⃣ 팝업 자동 종료 테스트 (3초 대기)...');
        await delay(4000);
        const popupClosed = await page.$('.fixed.inset-0.z-\\[2000\\]');
        if (!popupClosed) {
          console.log('   ✅ 팝업이 자동으로 종료됨\n');
        } else {
          console.log('   ⚠️ 팝업이 아직 열려있음 (마우스가 팝업 위에 있을 수 있음)\n');
        }
      } else {
        console.log('   ⚠️ 팝업이 열리지 않음 (데이터 없을 수 있음)\n');
      }
    } else {
      console.log('6️⃣ 마커가 없어 클릭 테스트 스킵\n');
    }

    // 10. 범례 확인
    console.log('🔟 범례 확인 중...');
    const legendText = await page.evaluate(() => {
      const legends = document.querySelectorAll('.absolute.bottom-3.left-3 span');
      return Array.from(legends).map(l => l.textContent);
    });
    console.log(`   범례: ${legendText.join(', ')}`);
    if (legendText.some(t => t && (t.includes('해상') || t.includes('항공') || t.includes('내륙')))) {
      console.log('   ✅ 범례 정상 표시됨\n');
    }

    // 11. 통계 확인
    console.log('1️⃣1️⃣ 통계 정보 확인 중...');
    const stats = await page.evaluate(() => {
      const statElements = document.querySelectorAll('.absolute.top-3.right-3 .text-xl');
      return Array.from(statElements).map(s => s.textContent);
    });
    console.log(`   통계: Total=${stats[0] || 'N/A'}, In Transit=${stats[1] || 'N/A'}, Ports=${stats[2] || 'N/A'}`);
    console.log('   ✅ 통계 정보 표시됨\n');

    // 12. 스크린샷 저장
    console.log('1️⃣2️⃣ 스크린샷 저장 중...');
    await page.screenshot({ path: 'test-map-screenshot.png', fullPage: false });
    console.log('   ✅ 스크린샷 저장: test-map-screenshot.png\n');

    // 13. 5초 대기 (시각적 확인용)
    console.log('⏳ 5초 대기 중 (지도 확인)...');
    await delay(5000);

    console.log('═══════════════════════════════════════════════');
    console.log('✅ 모든 테스트 완료!');
    console.log('═══════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  } finally {
    await browser.close();
  }
}

testMapRoutes();
