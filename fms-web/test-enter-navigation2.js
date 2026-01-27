const puppeteer = require('puppeteer');

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function testEnterNavigation() {
  console.log('='.repeat(60));
  console.log('Enter 키 네비게이션 상세 테스트');
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

    // 모든 input과 select 필드 정보 가져오기
    const fieldInfo = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input:not([disabled]):not([type="hidden"]), select:not([disabled])'));
      return inputs.slice(0, 10).map((el, i) => ({
        index: i,
        tag: el.tagName,
        type: el.getAttribute('type') || 'text',
        name: el.getAttribute('name') || '',
        placeholder: el.getAttribute('placeholder') || '',
      }));
    });

    console.log('  처음 10개 입력 필드:');
    fieldInfo.forEach(f => {
      console.log(`    [${f.index}] ${f.tag} type=${f.type} name=${f.name} placeholder=${f.placeholder}`);
    });

    // text 타입 input 찾기 (첫 번째)
    const textInputIndex = fieldInfo.findIndex(f => f.tag === 'INPUT' && f.type === 'text');
    if (textInputIndex === -1) {
      console.log('  [SKIP] text 타입 input을 찾지 못함');
      return;
    }

    console.log(`\n  테스트할 필드 인덱스: ${textInputIndex}`);

    // 해당 필드에 포커스
    const inputs = await page.$$('input:not([disabled]):not([type="hidden"]), select:not([disabled])');
    await inputs[textInputIndex].focus();
    await delay(300);

    // 텍스트 입력
    await page.keyboard.type('TEST');
    await delay(200);

    // 현재 포커스 확인
    const beforeEnter = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tag: el?.tagName,
        type: el?.getAttribute('type'),
        value: el?.value,
      };
    });
    console.log(`  Enter 전: ${beforeEnter.tag} type=${beforeEnter.type} value=${beforeEnter.value}`);

    // Enter 키 입력
    await page.keyboard.press('Enter');
    await delay(500);

    // 포커스 이동 확인
    const afterEnter = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tag: el?.tagName,
        type: el?.getAttribute('type'),
        value: el?.value,
        name: el?.getAttribute('name'),
      };
    });
    console.log(`  Enter 후: ${afterEnter.tag} type=${afterEnter.type} name=${afterEnter.name}`);

    // 결과 판단
    if (beforeEnter.tag === afterEnter.tag && beforeEnter.type === afterEnter.type && beforeEnter.value === afterEnter.value) {
      console.log('  [INFO] 포커스가 이동하지 않음 - 훅 동작 확인 필요');
    } else {
      console.log('  [PASS] Enter 키로 다음 필드로 이동 성공!');
    }

    // 연속 Enter 테스트
    console.log('\n  연속 Enter 키 테스트:');
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Enter');
      await delay(300);
      const current = await page.evaluate(() => {
        const el = document.activeElement;
        return `${el?.tagName} type=${el?.getAttribute('type')} name=${el?.getAttribute('name') || '-'}`;
      });
      console.log(`    Enter ${i + 1}: ${current}`);
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
