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

async function waitForHydration(page, selector, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const hasReact = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        const key = Object.keys(el).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactProps$'));
        return !!key;
      }
      return false;
    }, selector);
    if (hasReact) return true;
    await delay(500);
  }
  return false;
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

async function testAllFeatures() {
  console.log('='.repeat(60));
  console.log('FMS-WEB 전체 기능 테스트');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function logResult(testName, passed, detail = '') {
    const status = passed ? '[PASS]' : '[FAIL]';
    console.log(`  ${status} ${testName}${detail ? ': ' + detail : ''}`);
    results.tests.push({ name: testName, passed, detail });
    if (passed) results.passed++;
    else results.failed++;
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    // ============================================
    // TEST 1: 해상 견적 등록 페이지
    // ============================================
    console.log('\n[TEST 1] 해상 견적 등록 페이지');
    console.log('-'.repeat(40));

    await page.goto('http://localhost:3000/logis/quote/sea/register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    const hydrated1 = await waitForHydration(page, 'button');
    logResult('페이지 로드 및 React 하이드레이션', hydrated1);

    if (hydrated1) {
      // 스케줄조회 모달
      await clickButton(page, '스케줄조회');
      await delay(1500);
      const scheduleModal = await checkModal(page, '스케줄 조회');
      await page.screenshot({ path: path.join(screenshotDir, '01-sea-schedule-modal.png') });
      logResult('스케줄조회 모달', scheduleModal);

      if (scheduleModal) {
        await clickButton(page, '취소');
        await delay(500);
      }

      // 운임조회 모달
      await clickButton(page, '운임조회');
      await delay(1500);
      const freightModal = await checkModal(page, '운임 조회');
      await page.screenshot({ path: path.join(screenshotDir, '02-sea-freight-modal.png') });
      logResult('운임조회 모달', freightModal);

      if (freightModal) {
        await clickButton(page, '취소');
        await delay(500);
      }

      // E-mail 모달
      await clickButton(page, 'E-mail');
      await delay(1500);
      const emailModal = await checkModal(page, '이메일 발송');
      await page.screenshot({ path: path.join(screenshotDir, '03-sea-email-modal.png') });
      logResult('E-mail 모달', emailModal);

      if (emailModal) {
        await clickButton(page, '취소');
        await delay(500);
      }
    }

    // ============================================
    // TEST 2: 항공 견적 등록 페이지
    // ============================================
    console.log('\n[TEST 2] 항공 견적 등록 페이지');
    console.log('-'.repeat(40));

    await page.goto('http://localhost:3000/logis/quote/air/register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    const hydrated2 = await waitForHydration(page, 'button');
    logResult('페이지 로드 및 React 하이드레이션', hydrated2);

    if (hydrated2) {
      // 스케줄조회 모달
      await clickButton(page, '스케줄조회');
      await delay(1500);
      const airScheduleModal = await checkModal(page, '스케줄 조회');
      await page.screenshot({ path: path.join(screenshotDir, '04-air-schedule-modal.png') });
      logResult('스케줄조회 모달', airScheduleModal);

      if (airScheduleModal) {
        await clickButton(page, '취소');
        await delay(500);
      }

      // E-mail 모달
      await clickButton(page, 'E-mail');
      await delay(1500);
      const airEmailModal = await checkModal(page, '이메일 발송');
      await page.screenshot({ path: path.join(screenshotDir, '05-air-email-modal.png') });
      logResult('E-mail 모달', airEmailModal);

      if (airEmailModal) {
        await clickButton(page, '취소');
        await delay(500);
      }
    }

    // ============================================
    // TEST 3: 해상 견적 조회 페이지
    // ============================================
    console.log('\n[TEST 3] 해상 견적 조회 페이지');
    console.log('-'.repeat(40));

    await page.goto('http://localhost:3000/logis/quote/sea', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    const hydrated3 = await waitForHydration(page, 'button');
    logResult('페이지 로드 및 React 하이드레이션', hydrated3);

    if (hydrated3) {
      await page.screenshot({ path: path.join(screenshotDir, '06-sea-list-page.png') });

      // 데이터 테이블 확인
      const hasTable = await page.evaluate(() => {
        const rows = document.querySelectorAll('tbody tr');
        return rows.length > 0;
      });
      logResult('데이터 테이블 표시', hasTable);

      // 체크박스 선택
      const checked = await page.evaluate(() => {
        const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
        if (checkboxes.length > 0) {
          checkboxes[0].click();
          return true;
        }
        return false;
      });
      await delay(500);
      logResult('체크박스 선택', checked);

      // E-mail 버튼 (선택 후)
      if (checked) {
        await clickButton(page, 'E-mail');
        await delay(1500);
        const listEmailModal = await checkModal(page, '이메일 발송');
        await page.screenshot({ path: path.join(screenshotDir, '07-sea-list-email-modal.png') });
        logResult('조회화면 E-mail 모달', listEmailModal);

        if (listEmailModal) {
          await clickButton(page, '취소');
          await delay(500);
        }
      }

      // 초기화 버튼
      const resetClicked = await clickButton(page, '초기화');
      await delay(500);
      logResult('초기화 버튼', resetClicked);

      // 신규 버튼 (URL 변경 확인)
      await clickButton(page, '신규');
      await delay(2000);
      const navigatedToRegister = page.url().includes('/register');
      logResult('신규 버튼 (등록 페이지 이동)', navigatedToRegister);
    }

    // ============================================
    // TEST 4: 해상 B/L 조회 페이지
    // ============================================
    console.log('\n[TEST 4] 해상 B/L 조회 페이지');
    console.log('-'.repeat(40));

    await page.goto('http://localhost:3000/logis/import-bl/sea', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    const hydrated4 = await waitForHydration(page, 'button');
    logResult('페이지 로드 및 React 하이드레이션', hydrated4);

    if (hydrated4) {
      await page.screenshot({ path: path.join(screenshotDir, '08-bl-list-page.png') });

      // 데이터 테이블 확인
      const hasBLTable = await page.evaluate(() => {
        const rows = document.querySelectorAll('tbody tr');
        return rows.length > 0;
      });
      logResult('B/L 데이터 테이블 표시', hasBLTable);
    }

    // ============================================
    // TEST 5: 해상 B/L 등록 페이지
    // ============================================
    console.log('\n[TEST 5] 해상 B/L 등록 페이지');
    console.log('-'.repeat(40));

    await page.goto('http://localhost:3000/logis/import-bl/sea/register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    const hydrated5 = await waitForHydration(page, 'button');
    logResult('페이지 로드 및 React 하이드레이션', hydrated5);

    if (hydrated5) {
      // E-mail 모달
      await clickButton(page, 'E-mail');
      await delay(1500);
      const blEmailModal = await checkModal(page, '이메일 발송');
      await page.screenshot({ path: path.join(screenshotDir, '09-bl-email-modal.png') });
      logResult('B/L E-mail 모달', blEmailModal);

      if (blEmailModal) {
        await clickButton(page, '취소');
        await delay(500);
      }
    }

    // ============================================
    // 결과 요약
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('테스트 결과 요약');
    console.log('='.repeat(60));
    console.log(`총 테스트: ${results.passed + results.failed}건`);
    console.log(`성공: ${results.passed}건`);
    console.log(`실패: ${results.failed}건`);
    console.log(`성공률: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    console.log('\n스크린샷 저장 위치:', screenshotDir);

  } catch (error) {
    console.error('\n테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testAllFeatures();
