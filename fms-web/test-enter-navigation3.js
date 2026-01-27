const puppeteer = require('puppeteer');

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function testEnterNavigation() {
  console.log('='.repeat(60));
  console.log('Enter 키 네비게이션 테스트 (폼 필드)');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });

    console.log('\n[TEST] 해상 견적 등록 페이지');
    console.log('-'.repeat(50));

    await page.goto('http://localhost:3000/logis/quote/sea/register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await delay(3000);

    // main 태그 내의 입력 필드만 선택 (헤더 검색창 제외)
    const fieldInfo = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return [];
      const inputs = Array.from(main.querySelectorAll('input:not([disabled]):not([type="hidden"]), select:not([disabled])'));
      return inputs.slice(0, 15).map((el, i) => ({
        index: i,
        tag: el.tagName,
        type: el.getAttribute('type') || 'select',
        placeholder: el.getAttribute('placeholder') || '',
      }));
    });

    console.log('  main 내 처음 15개 입력 필드:');
    fieldInfo.forEach(f => {
      console.log(`    [${f.index}] ${f.tag} type=${f.type} placeholder="${f.placeholder}"`);
    });

    // main 내 첫 번째 text 입력 필드 찾기
    const textInputIndex = fieldInfo.findIndex(f => f.tag === 'INPUT' && f.type === 'text');
    if (textInputIndex === -1) {
      console.log('  [SKIP] text 타입 input을 찾지 못함');
      await browser.close();
      return;
    }

    console.log(`\n  테스트 시작 인덱스: ${textInputIndex} (${fieldInfo[textInputIndex].placeholder})`);

    // main 내 해당 필드에 포커스
    await page.evaluate((idx) => {
      const main = document.querySelector('main');
      if (!main) return;
      const inputs = Array.from(main.querySelectorAll('input:not([disabled]):not([type="hidden"]), select:not([disabled])'));
      if (inputs[idx]) inputs[idx].focus();
    }, textInputIndex);
    await delay(300);

    // 현재 포커스 확인
    let current = await page.evaluate(() => {
      const el = document.activeElement;
      return `${el?.tagName} type=${el?.getAttribute('type')} placeholder="${el?.getAttribute('placeholder') || ''}"`;
    });
    console.log(`\n  시작 포커스: ${current}`);

    // 연속 Enter 키 테스트
    console.log('\n  Enter 키 연속 입력 테스트:');
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Enter');
      await delay(300);
      current = await page.evaluate(() => {
        const el = document.activeElement;
        return `${el?.tagName} type=${el?.getAttribute('type')} placeholder="${el?.getAttribute('placeholder') || ''}"`;
      });
      console.log(`    Enter ${i + 1}: ${current}`);
    }

    // Tab 키 테스트 비교
    console.log('\n  Tab 키 연속 입력 테스트 (비교):');
    await page.evaluate((idx) => {
      const main = document.querySelector('main');
      if (!main) return;
      const inputs = Array.from(main.querySelectorAll('input:not([disabled]):not([type="hidden"]), select:not([disabled])'));
      if (inputs[idx]) inputs[idx].focus();
    }, textInputIndex);
    await delay(300);

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await delay(300);
      current = await page.evaluate(() => {
        const el = document.activeElement;
        return `${el?.tagName} type=${el?.getAttribute('type')} placeholder="${el?.getAttribute('placeholder') || ''}"`;
      });
      console.log(`    Tab ${i + 1}: ${current}`);
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
