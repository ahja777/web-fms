const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testPopups() {
  console.log('Starting visual popup test...\n');

  const browser = await puppeteer.launch({
    headless: false,  // Visual mode
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
    defaultViewport: null
  });

  const screenshotDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  try {
    const page = await browser.newPage();

    // 해상 견적 등록 페이지
    console.log('=== 해상 견적 등록 페이지 ===');
    await page.goto('http://localhost:3000/logis/quote/sea/register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for full hydration
    console.log('  페이지 로딩 완료, 10초 대기...');
    await new Promise(r => setTimeout(r, 10000));

    // Find and click 스케줄조회 button using waitForSelector
    console.log('  스케줄조회 버튼 클릭 시도...');

    // Try clicking with page.click using text selector
    try {
      const buttons = await page.$$('button');
      let clicked = false;
      for (const btn of buttons) {
        const text = await btn.evaluate(el => el.textContent);
        if (text && text.includes('스케줄조회')) {
          await btn.click();
          clicked = true;
          console.log('  버튼 클릭됨!');
          break;
        }
      }

      if (!clicked) {
        console.log('  버튼을 찾을 수 없음');
      }

      // Wait for modal
      await new Promise(r => setTimeout(r, 3000));

      // Take screenshot
      await page.screenshot({ path: path.join(screenshotDir, 'visual-sea-schedule.png'), fullPage: true });

      // Check for modal
      const hasModal = await page.evaluate(() => {
        const elements = document.querySelectorAll('h2');
        for (const el of elements) {
          if (el.textContent && el.textContent.includes('스케줄 조회')) {
            return true;
          }
        }
        return false;
      });

      console.log('  모달 표시:', hasModal ? 'YES' : 'NO');

      // Wait for user to see
      console.log('  5초 대기 후 종료...');
      await new Promise(r => setTimeout(r, 5000));

    } catch (e) {
      console.log('  오류:', e.message);
    }

  } catch (error) {
    console.error('테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testPopups();
