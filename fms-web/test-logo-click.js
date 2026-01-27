const puppeteer = require('puppeteer');

async function testLogoClick() {
  console.log('='.repeat(50));
  console.log('케이씨에스 로고 클릭 테스트');
  console.log('='.repeat(50));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });

    console.log('\n페이지 로딩 중...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await new Promise(r => setTimeout(r, 3000));

    // 로고 링크 확인
    const logoLink = await page.evaluate(() => {
      const link = document.querySelector('a[href="https://www.kcins.co.kr"]');
      if (link) {
        return {
          href: link.href,
          target: link.target,
          text: link.textContent?.trim()
        };
      }
      return null;
    });

    if (logoLink) {
      console.log('\n[PASS] 로고 링크 발견!');
      console.log('  - href:', logoLink.href);
      console.log('  - target:', logoLink.target);
      console.log('  - 포함된 텍스트:', logoLink.text?.substring(0, 50));
    } else {
      console.log('\n[FAIL] 로고 링크를 찾지 못함');
    }

    // 로고 영역에 hover 효과 확인
    const hasHoverEffect = await page.evaluate(() => {
      const link = document.querySelector('a[href="https://www.kcins.co.kr"]');
      if (link) {
        return link.className.includes('hover:opacity') || link.className.includes('transition');
      }
      return false;
    });

    if (hasHoverEffect) {
      console.log('[PASS] 호버 효과 적용됨');
    }

    // 케이씨에스 텍스트 확인
    const hasKCSText = await page.evaluate(() => {
      return document.body.textContent?.includes('케이씨에스');
    });

    if (hasKCSText) {
      console.log('[PASS] 케이씨에스 텍스트 표시됨');
    }

    await page.screenshot({ path: 'test-screenshots/logo-click-test.png' });
    console.log('\n스크린샷 저장: test-screenshots/logo-click-test.png');

    console.log('\n' + '='.repeat(50));
    console.log('테스트 완료!');
    console.log('='.repeat(50));

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

testLogoClick();
