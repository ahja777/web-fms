const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testPopups() {
  console.log('Starting debug popup test...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const screenshotDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    // Capture all console messages
    const logs = [];
    page.on('console', msg => {
      logs.push({ type: msg.type(), text: msg.text() });
    });

    // Test Sea page
    console.log('=== 해상 견적 등록 페이지 ===');
    await page.goto('http://localhost:3000/logis/quote/sea/register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for hydration - check periodically
    let hydrated = false;
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const info = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        const btn = Array.from(buttons).find(b => b.textContent?.includes('스케줄조회'));
        if (btn) {
          const key = Object.keys(btn).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactProps$'));
          return { hasReact: !!key };
        }
        return { hasReact: false };
      });
      if (info.hasReact) {
        hydrated = true;
        console.log(`  React 하이드레이션 완료 (${i+1}초)`);
        break;
      }
    }

    if (!hydrated) {
      console.log('  React 하이드레이션 실패 (20초 초과)');
    }

    // Print errors
    const errors = logs.filter(l => l.type === 'error');
    if (errors.length > 0) {
      console.log('  [Browser Errors]:');
      errors.forEach(e => console.log('    -', e.text.substring(0, 200)));
    }

    // Click button
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const btn = Array.from(buttons).find(b => b.textContent?.includes('스케줄조회'));
      if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 2000));

    // Check modal
    const hasModal = await page.evaluate(() => {
      return document.querySelectorAll('h2').length > 0 &&
        Array.from(document.querySelectorAll('h2')).some(h => h.textContent?.includes('스케줄 조회'));
    });
    console.log('  해상 스케줄조회 모달:', hasModal ? 'PASS' : 'FAIL');

    await page.screenshot({ path: path.join(screenshotDir, 'debug-sea-modal.png') });

    // Test Air page
    console.log('\n=== 항공 견적 등록 페이지 ===');
    await page.goto('http://localhost:3000/logis/quote/air/register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for hydration
    hydrated = false;
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const info = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        const btn = Array.from(buttons).find(b => b.textContent?.includes('스케줄조회'));
        if (btn) {
          const key = Object.keys(btn).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactProps$'));
          return { hasReact: !!key };
        }
        return { hasReact: false };
      });
      if (info.hasReact) {
        hydrated = true;
        console.log(`  React 하이드레이션 완료 (${i+1}초)`);
        break;
      }
    }

    if (!hydrated) {
      console.log('  React 하이드레이션 실패 (20초 초과)');
    }

    // Click button
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const btn = Array.from(buttons).find(b => b.textContent?.includes('스케줄조회'));
      if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 2000));

    // Check modal
    const hasAirModal = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h2')).some(h => h.textContent?.includes('스케줄 조회'));
    });
    console.log('  항공 스케줄조회 모달:', hasAirModal ? 'PASS' : 'FAIL');

    await page.screenshot({ path: path.join(screenshotDir, 'debug-air-modal.png') });

  } catch (error) {
    console.error('테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testPopups();
