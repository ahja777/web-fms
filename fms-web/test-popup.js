const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testPopups() {
  console.log('Starting popup test...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const screenshotDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  try {
    // Test 1: 해상 견적 등록 - 스케줄조회
    console.log('=== Test 1: 해상 견적 등록 페이지 ===');
    const page1 = await browser.newPage();
    await page1.setViewport({ width: 1400, height: 900 });

    // Enable console log from browser
    page1.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('  [Browser Error]', msg.text());
      }
    });

    await page1.goto('http://localhost:3000/logis/quote/sea/register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for React hydration
    await new Promise(r => setTimeout(r, 5000));
    await page1.screenshot({ path: path.join(screenshotDir, '1-sea-register-page.png') });
    console.log('  [INFO] 페이지 로드 완료');

    // Debug: Check all buttons
    const buttons = await page1.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.map(btn => btn.textContent?.trim()).filter(t => t);
    });
    console.log('  [DEBUG] 버튼 목록:', buttons.slice(0, 10).join(', '));

    // Click 스케줄조회 button
    try {
      const btnClicked = await page1.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const scheduleBtn = buttons.find(btn => btn.textContent?.includes('스케줄조회'));
        if (scheduleBtn) {
          console.log('Found schedule button, clicking...');
          scheduleBtn.click();
          return { found: true, text: scheduleBtn.textContent };
        }
        return { found: false };
      });
      console.log('  [DEBUG] 스케줄조회 버튼:', btnClicked);

      await new Promise(r => setTimeout(r, 2000));
      await page1.screenshot({ path: path.join(screenshotDir, '2-schedule-modal.png') });

      // Check modal with more selectors
      const modalInfo = await page1.evaluate(() => {
        // Try multiple selectors
        const modal1 = document.querySelector('.fixed.inset-0');
        const modal2 = document.querySelector('[class*="fixed"][class*="inset-0"]');
        const modal3 = document.querySelector('.fixed');
        const h2Elements = document.querySelectorAll('h2');

        return {
          hasFixed: !!modal1,
          hasFixedInset: !!modal2,
          hasAnyFixed: !!modal3,
          h2Count: h2Elements.length,
          h2Texts: Array.from(h2Elements).map(h => h.textContent)
        };
      });
      console.log('  [DEBUG] 모달 확인:', modalInfo);

      if (modalInfo.h2Texts.some(t => t?.includes('스케줄 조회'))) {
        console.log('  [PASS] 스케줄조회 모달 열림');

        // Close modal
        await page1.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const closeBtn = buttons.find(btn => btn.textContent?.includes('취소'));
          if (closeBtn) closeBtn.click();
        });
        await new Promise(r => setTimeout(r, 500));
      } else {
        console.log('  [FAIL] 스케줄조회 모달이 열리지 않음');
      }
    } catch (e) {
      console.log('  [ERROR] 스케줄조회 테스트 오류:', e.message);
    }

    // Test 2: 운임조회 팝업
    console.log('\n=== Test 2: 운임조회 팝업 ===');
    try {
      const freightClicked = await page1.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const freightBtn = buttons.find(btn => btn.textContent?.includes('운임조회'));
        if (freightBtn) {
          freightBtn.click();
          return { found: true, text: freightBtn.textContent };
        }
        return { found: false };
      });
      console.log('  [DEBUG] 운임조회 버튼:', freightClicked);

      await new Promise(r => setTimeout(r, 2000));
      await page1.screenshot({ path: path.join(screenshotDir, '3-freight-modal.png') });

      const modalInfo = await page1.evaluate(() => {
        const h2Elements = document.querySelectorAll('h2');
        return {
          h2Texts: Array.from(h2Elements).map(h => h.textContent)
        };
      });
      console.log('  [DEBUG] 모달 확인:', modalInfo);

      if (modalInfo.h2Texts.some(t => t?.includes('운임 조회'))) {
        console.log('  [PASS] 운임조회 모달 열림');

        // Select first row and close
        await page1.evaluate(() => {
          const rows = document.querySelectorAll('tbody tr');
          if (rows.length > 0) rows[0].click();
        });
        await new Promise(r => setTimeout(r, 300));

        await page1.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const selectBtn = buttons.find(btn => btn.textContent?.trim() === '선택');
          if (selectBtn) selectBtn.click();
        });
        await new Promise(r => setTimeout(r, 1000));
        await page1.screenshot({ path: path.join(screenshotDir, '4-after-freight-select.png') });
        console.log('  [PASS] 운임 선택 완료');
      } else {
        console.log('  [FAIL] 운임조회 모달이 열리지 않음');
      }
    } catch (e) {
      console.log('  [ERROR] 운임조회 테스트 오류:', e.message);
    }

    await page1.close();

    // Test 3: 항공 스케줄조회
    console.log('\n=== Test 3: 항공 견적 등록 페이지 ===');
    const page2 = await browser.newPage();
    await page2.setViewport({ width: 1400, height: 900 });

    await page2.goto('http://localhost:3000/logis/quote/air/register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    await new Promise(r => setTimeout(r, 5000));
    await page2.screenshot({ path: path.join(screenshotDir, '5-air-register-page.png') });
    console.log('  [INFO] 페이지 로드 완료');

    try {
      await page2.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(btn => btn.textContent?.includes('스케줄조회'));
        if (btn) btn.click();
      });

      await new Promise(r => setTimeout(r, 2000));
      await page2.screenshot({ path: path.join(screenshotDir, '6-air-schedule-modal.png') });

      const modalInfo = await page2.evaluate(() => {
        const h2Elements = document.querySelectorAll('h2');
        return {
          h2Texts: Array.from(h2Elements).map(h => h.textContent)
        };
      });

      if (modalInfo.h2Texts.some(t => t?.includes('스케줄 조회'))) {
        console.log('  [PASS] 항공 스케줄조회 모달 열림');
      } else {
        console.log('  [FAIL] 항공 스케줄조회 모달이 열리지 않음');
      }
    } catch (e) {
      console.log('  [ERROR] 항공 스케줄조회 테스트 오류:', e.message);
    }

    await page2.close();

    console.log('\n=== 테스트 완료 ===');
    console.log('스크린샷 저장 위치:', screenshotDir);

  } catch (error) {
    console.error('테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testPopups();
