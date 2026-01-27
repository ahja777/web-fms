const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function test() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });

  const screenshotDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    await page.goto('http://localhost:3000/logis/quote/sea/register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait longer for hydration
    console.log('Waiting for React hydration (15 seconds)...');
    await new Promise(r => setTimeout(r, 15000));

    // Check React bindings
    const checkReact = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const emailBtn = buttons.find(b => b.textContent && b.textContent.includes('E-mail'));
      if (emailBtn) {
        const key = Object.keys(emailBtn).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactProps$'));
        return { found: true, hasReact: !!key };
      }
      return { found: false };
    });
    console.log('React check:', checkReact);

    // Click E-mail button
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes('E-mail'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log('E-mail button clicked:', clicked);

    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotDir, 'email-modal-test.png') });
    console.log('Screenshot saved');

    // Check if modal appeared
    const modalCheck = await page.evaluate(() => {
      const h2s = Array.from(document.querySelectorAll('h2'));
      return h2s.map(h => h.textContent);
    });
    console.log('H2 elements:', modalCheck);

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

test();
