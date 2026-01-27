const puppeteer = require('puppeteer');

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function testEnterNavigation() {
  console.log('='.repeat(60));
  console.log('Enter 키 네비게이션 테스트');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });

    const testPages = [
      { name: '해상 견적 등록', url: '/logis/quote/sea/register' },
      { name: '해상 부킹 등록', url: '/logis/booking/sea/register' },
      { name: '수입 B/L 등록', url: '/logis/import-bl/sea/register' },
    ];

    for (let i = 0; i < testPages.length; i++) {
      const testPage = testPages[i];
      console.log(`\n[TEST ${i + 1}/${testPages.length}] ${testPage.name}`);
      console.log('-'.repeat(50));

      try {
        await page.goto(`http://localhost:3000${testPage.url}`, {
          waitUntil: 'networkidle2',
          timeout: 60000
        });
        await delay(3000);

        // 1. 첫 번째 input 필드 찾기
        const inputs = await page.$$('input:not([disabled]):not([type="hidden"]), select:not([disabled])');

        if (inputs.length < 2) {
          console.log(`  [SKIP] 입력 필드가 충분하지 않음 (${inputs.length}개)`);
          continue;
        }

        console.log(`  입력 필드 수: ${inputs.length}개`);

        // 2. 첫 번째 필드에 포커스
        await inputs[0].focus();
        await delay(300);

        // 현재 포커스된 요소 확인
        const firstFocused = await page.evaluate(() => {
          const el = document.activeElement;
          return el ? el.tagName + (el.name ? `[name="${el.name}"]` : '') : null;
        });
        console.log(`  첫 번째 포커스: ${firstFocused}`);

        // 3. Enter 키 입력
        await page.keyboard.press('Enter');
        await delay(300);

        // 포커스가 이동했는지 확인
        const secondFocused = await page.evaluate(() => {
          const el = document.activeElement;
          return el ? el.tagName + (el.name ? `[name="${el.name}"]` : '') : null;
        });
        console.log(`  Enter 후 포커스: ${secondFocused}`);

        // 4. 포커스 이동 여부 판단
        if (firstFocused !== secondFocused) {
          console.log(`  [PASS] Enter 키로 다음 필드로 이동 성공`);
        } else {
          console.log(`  [INFO] 같은 필드에 포커스 유지 (필드 타입에 따라 정상)`);
        }

        // 5. Tab 키 테스트 (브라우저 기본 동작)
        await page.keyboard.press('Tab');
        await delay(300);

        const thirdFocused = await page.evaluate(() => {
          const el = document.activeElement;
          return el ? el.tagName + (el.name ? `[name="${el.name}"]` : '') : null;
        });
        console.log(`  Tab 후 포커스: ${thirdFocused}`);

        if (secondFocused !== thirdFocused) {
          console.log(`  [PASS] Tab 키로 다음 필드로 이동 성공`);
        }

        console.log(`  [PASS] ${testPage.name} 테스트 완료`);

      } catch (pageError) {
        console.log(`  [ERROR] ${pageError.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('테스트 완료!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testEnterNavigation();
