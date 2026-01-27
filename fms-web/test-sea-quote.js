const puppeteer = require('puppeteer');

async function testSeaQuote() {
  console.log('해상 견적 등록 페이지 테스트');
  console.log('='.repeat(50));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });

    console.log('페이지 로딩 중...');
    await page.goto('http://localhost:3000/logis/quote/sea/register', {
      waitUntil: 'domcontentloaded',
      timeout: 90000
    });

    await new Promise(r => setTimeout(r, 5000));

    // 버튼 확인
    const buttons = await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      return allButtons.map(b => b.textContent?.trim()).filter(Boolean);
    });

    const crudButtons = buttons.filter(b =>
      b.includes('테스트') || b.includes('신규') || b.includes('초기화') || b.includes('저장') || b.includes('삭제')
    );
    console.log('발견된 CRUD 버튼:', crudButtons.join(', '));

    // 테스트데이터 버튼 클릭
    page.on('dialog', async dialog => {
      console.log('Dialog:', dialog.message());
      await dialog.accept();
    });

    const clicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent && b.textContent.includes('테스트데이터')
      );
      if (btn) { btn.click(); return true; }
      return false;
    });

    if (clicked) {
      await new Promise(r => setTimeout(r, 2000));
      console.log('[PASS] 테스트데이터 버튼 클릭 성공');

      // 입력된 데이터 확인
      const data = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input, select');
        let filled = 0;
        inputs.forEach(i => {
          if (i.value && i.value.trim() && i.disabled === false) filled++;
        });
        return filled;
      });
      console.log('입력된 필드 수:', data);
    } else {
      console.log('[FAIL] 테스트데이터 버튼을 찾지 못함');
    }

    await page.screenshot({ path: 'test-screenshots/quote-sea-final.png' });
    console.log('[PASS] 테스트 완료');

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

testSeaQuote();
