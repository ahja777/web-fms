const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function clickButton(page, text) {
  return page.evaluate((btnText) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes(btnText));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }, text);
}

async function checkModal(page, titleText) {
  return page.evaluate((text) => {
    const h2s = Array.from(document.querySelectorAll('h2'));
    return h2s.some(h => h.textContent && h.textContent.includes(text));
  }, titleText);
}

async function testPage(browser, url, pageName, tests) {
  console.log(`\n[${pageName}]`);
  console.log('-'.repeat(50));

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const results = [];

  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for React hydration
    await delay(3000);

    console.log('  [PASS] 페이지 로드 완료');
    results.push({ name: '페이지 로드', passed: true });

    for (const test of tests) {
      try {
        const result = await test.fn(page);
        console.log(`  [${result ? 'PASS' : 'FAIL'}] ${test.name}`);
        results.push({ name: test.name, passed: result });
        await delay(500);
      } catch (err) {
        console.log(`  [FAIL] ${test.name}: ${err.message}`);
        results.push({ name: test.name, passed: false, error: err.message });
      }
    }

  } catch (err) {
    console.log(`  [FAIL] 페이지 로드 실패: ${err.message}`);
    results.push({ name: '페이지 로드', passed: false, error: err.message });
  } finally {
    await page.close();
  }

  return results;
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('FMS-WEB 기능 테스트 (개선판)');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const allResults = [];

  // Test 1: 해상 견적 등록
  allResults.push(...await testPage(browser,
    'http://localhost:3000/logis/quote/sea/register',
    '해상 견적 등록',
    [
      {
        name: '스케줄조회 모달',
        fn: async (page) => {
          await clickButton(page, '스케줄조회');
          await delay(1500);
          const hasModal = await checkModal(page, '스케줄 조회');
          await page.screenshot({ path: path.join(screenshotDir, 'test-sea-schedule.png') });
          if (hasModal) await clickButton(page, '취소');
          await delay(500);
          return hasModal;
        }
      },
      {
        name: '운임조회 모달',
        fn: async (page) => {
          await clickButton(page, '운임조회');
          await delay(1500);
          const hasModal = await checkModal(page, '운임 조회');
          await page.screenshot({ path: path.join(screenshotDir, 'test-sea-freight.png') });
          if (hasModal) await clickButton(page, '취소');
          await delay(500);
          return hasModal;
        }
      },
      {
        name: 'E-mail 모달',
        fn: async (page) => {
          await clickButton(page, 'E-mail');
          await delay(1500);
          const hasModal = await checkModal(page, '이메일 발송');
          await page.screenshot({ path: path.join(screenshotDir, 'test-sea-email.png') });
          if (hasModal) await clickButton(page, '취소');
          await delay(500);
          return hasModal;
        }
      }
    ]
  ));

  // Test 2: 항공 견적 등록
  allResults.push(...await testPage(browser,
    'http://localhost:3000/logis/quote/air/register',
    '항공 견적 등록',
    [
      {
        name: '스케줄조회 모달',
        fn: async (page) => {
          await clickButton(page, '스케줄조회');
          await delay(1500);
          const hasModal = await checkModal(page, '스케줄 조회');
          await page.screenshot({ path: path.join(screenshotDir, 'test-air-schedule.png') });
          if (hasModal) await clickButton(page, '취소');
          await delay(500);
          return hasModal;
        }
      },
      {
        name: 'E-mail 모달',
        fn: async (page) => {
          await clickButton(page, 'E-mail');
          await delay(1500);
          const hasModal = await checkModal(page, '이메일 발송');
          await page.screenshot({ path: path.join(screenshotDir, 'test-air-email.png') });
          if (hasModal) await clickButton(page, '취소');
          await delay(500);
          return hasModal;
        }
      }
    ]
  ));

  // Test 3: 해상 B/L 등록
  allResults.push(...await testPage(browser,
    'http://localhost:3000/logis/import-bl/sea/register',
    '해상 B/L 등록',
    [
      {
        name: 'E-mail 모달',
        fn: async (page) => {
          await clickButton(page, 'E-mail');
          await delay(1500);
          const hasModal = await checkModal(page, '이메일 발송');
          await page.screenshot({ path: path.join(screenshotDir, 'test-bl-email.png') });
          if (hasModal) await clickButton(page, '취소');
          await delay(500);
          return hasModal;
        }
      }
    ]
  ));

  // Test 4: 해상 견적 조회 (목록)
  allResults.push(...await testPage(browser,
    'http://localhost:3000/logis/quote/sea',
    '해상 견적 조회 (목록)',
    [
      {
        name: '데이터 테이블 표시',
        fn: async (page) => {
          await page.screenshot({ path: path.join(screenshotDir, 'test-sea-list.png') });
          const hasTable = await page.evaluate(() => {
            const rows = document.querySelectorAll('tbody tr');
            return rows.length > 0;
          });
          return hasTable;
        }
      },
      {
        name: '초기화 버튼',
        fn: async (page) => {
          return await clickButton(page, '초기화');
        }
      },
      {
        name: '신규 버튼 (네비게이션)',
        fn: async (page) => {
          await clickButton(page, '신규');
          await delay(2000);
          return page.url().includes('/register');
        }
      }
    ]
  ));

  // Test 5: 항공 견적 조회 (목록)
  allResults.push(...await testPage(browser,
    'http://localhost:3000/logis/quote/air',
    '항공 견적 조회 (목록)',
    [
      {
        name: '데이터 테이블 표시',
        fn: async (page) => {
          await page.screenshot({ path: path.join(screenshotDir, 'test-air-list.png') });
          const hasTable = await page.evaluate(() => {
            const rows = document.querySelectorAll('tbody tr');
            return rows.length > 0;
          });
          return hasTable;
        }
      }
    ]
  ));

  // Test 6: 해상 B/L 조회 (목록)
  allResults.push(...await testPage(browser,
    'http://localhost:3000/logis/import-bl/sea',
    '해상 B/L 조회 (목록)',
    [
      {
        name: '데이터 테이블 표시',
        fn: async (page) => {
          await page.screenshot({ path: path.join(screenshotDir, 'test-bl-list.png') });
          const hasTable = await page.evaluate(() => {
            const rows = document.querySelectorAll('tbody tr');
            return rows.length > 0;
          });
          return hasTable;
        }
      }
    ]
  ));

  await browser.close();

  // Summary
  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;

  console.log('\n' + '='.repeat(60));
  console.log('테스트 결과 요약');
  console.log('='.repeat(60));
  console.log(`총 테스트: ${allResults.length}건`);
  console.log(`성공: ${passed}건`);
  console.log(`실패: ${failed}건`);
  console.log(`성공률: ${((passed / allResults.length) * 100).toFixed(1)}%`);
  console.log('\n스크린샷 저장 위치:', screenshotDir);

  if (failed > 0) {
    console.log('\n실패한 테스트:');
    allResults.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}${r.error ? ': ' + r.error : ''}`);
    });
  }
}

runTests().catch(console.error);
