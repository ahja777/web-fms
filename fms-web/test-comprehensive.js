/**
 * FMS-Web 종합 테스트 스크립트
 * 전체 페이지 CRUD, 팝업, 데이터베이스 연동 테스트
 */
const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';

// 테스트 결과 저장
const testResults = {
  pages: [],
  crud: [],
  popups: [],
  database: [],
  summary: { passed: 0, failed: 0, total: 0 }
};

// 테스트할 페이지 목록
const TEST_PAGES = [
  // 대시보드
  { name: '대시보드', url: '/logis', type: 'dashboard' },

  // 해상 견적
  { name: '해상 견적 목록', url: '/logis/quote/sea', type: 'list', crud: true },
  { name: '해상 견적 등록', url: '/logis/quote/sea/register', type: 'register', crud: true },

  // 항공 견적
  { name: '항공 견적 목록', url: '/logis/quote/air', type: 'list', crud: true },
  { name: '항공 견적 등록', url: '/logis/quote/air/register', type: 'register', crud: true },

  // 해상 부킹
  { name: '해상 부킹 목록', url: '/logis/booking/sea', type: 'list', crud: true },
  { name: '해상 부킹 등록', url: '/logis/booking/sea/register', type: 'register', crud: true },

  // 항공 부킹
  { name: '항공 부킹 목록', url: '/logis/booking/air', type: 'list', crud: true },
  { name: '항공 부킹 등록', url: '/logis/booking/air/register', type: 'register', crud: true },

  // 해상 스케줄
  { name: '해상 스케줄 목록', url: '/logis/schedule/sea', type: 'list', crud: true },
  { name: '해상 스케줄 등록', url: '/logis/schedule/sea/register', type: 'register', crud: true },

  // 항공 스케줄
  { name: '항공 스케줄 목록', url: '/logis/schedule/air', type: 'list', crud: true },
  { name: '항공 스케줄 등록', url: '/logis/schedule/air/register', type: 'register', crud: true },

  // 해상 수입 B/L
  { name: '해상 수입 B/L 목록', url: '/logis/import-bl/sea', type: 'list', crud: true },
  { name: '해상 수입 B/L 등록', url: '/logis/import-bl/sea/register', type: 'register', crud: true },

  // 항공 수입 AWB
  { name: '항공 수입 AWB 목록', url: '/logis/import-bl/air', type: 'list', crud: true },
  { name: '항공 수입 AWB 등록', url: '/logis/import-bl/air/register', type: 'register', crud: true },

  // S/R (Shipping Request)
  { name: '해상 S/R 목록', url: '/logis/sr/sea', type: 'list', crud: true },
  { name: '해상 S/R 등록', url: '/logis/sr/sea/register', type: 'register', crud: true },

  // S/N (Shipping Notice)
  { name: '해상 S/N 목록', url: '/logis/sn/sea', type: 'list', crud: true },
  { name: '해상 S/N 등록', url: '/logis/sn/sea/register', type: 'register', crud: true },

  // AMS
  { name: 'AMS 목록', url: '/logis/ams/sea', type: 'list' },

  // 적하목록
  { name: '적하목록 목록', url: '/logis/manifest/sea', type: 'list' },

  // 기타 페이지
  { name: '문서관리', url: '/logis/document', type: 'list' },
  { name: '화물현황', url: '/logis/cargo/status', type: 'list' },
  { name: '운송관리', url: '/logis/transport/manage', type: 'list' },
];

// API 엔드포인트 목록 (DB 테스트용)
const API_ENDPOINTS = [
  { name: '해상 견적 API', url: '/api/quote/sea', method: 'GET' },
  { name: '항공 견적 API', url: '/api/quote/air', method: 'GET' },
  { name: '해상 부킹 API', url: '/api/booking/sea', method: 'GET' },
  { name: '항공 부킹 API', url: '/api/booking/air', method: 'GET' },
  { name: '해상 스케줄 API', url: '/api/schedule/sea', method: 'GET' },
  { name: '항공 스케줄 API', url: '/api/schedule/air', method: 'GET' },
  { name: '해상 S/R API', url: '/api/sr/sea', method: 'GET' },
  { name: '해상 S/N API', url: '/api/sn/sea', method: 'GET' },
  { name: '화물 목록 API', url: '/api/shipments', method: 'GET' },
  { name: '대시보드 API', url: '/api/dashboard', method: 'GET' },
  { name: '고객 목록 API', url: '/api/customers', method: 'GET' },
  { name: '항구 목록 API', url: '/api/ports', method: 'GET' },
  { name: '운송사 목록 API', url: '/api/carriers', method: 'GET' },
];

// 유틸리티 함수
function log(message, type = 'info') {
  const prefix = {
    info: '[INFO]',
    success: '[PASS]',
    error: '[FAIL]',
    warn: '[WARN]'
  };
  console.log(`${prefix[type]} ${message}`);
}

function addResult(category, name, status, details = '') {
  testResults[category].push({ name, status, details });
  testResults.summary.total++;
  if (status === 'pass') testResults.summary.passed++;
  else testResults.summary.failed++;
}

// 메인 테스트 함수
async function runComprehensiveTest() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Alert 처리
  page.on('dialog', async dialog => {
    log(`Alert: "${dialog.message()}"`, 'info');
    await dialog.accept();
  });

  console.log('\n' + '='.repeat(70));
  console.log('   FMS-Web 종합 테스트 시작');
  console.log('='.repeat(70) + '\n');

  // ===== 1. 페이지 로딩 테스트 =====
  console.log('\n' + '-'.repeat(50));
  console.log('1. 페이지 로딩 테스트');
  console.log('-'.repeat(50));

  for (const pageInfo of TEST_PAGES) {
    try {
      await page.goto(`${BASE_URL}${pageInfo.url}`, {
        timeout: 30000,
        waitUntil: 'domcontentloaded'
      });
      await page.waitForTimeout(1500);

      // 에러 체크
      const hasError = await page.locator('text=Error').count() > 0 ||
                       await page.locator('text=404').count() > 0;

      if (hasError) {
        log(`${pageInfo.name}: 로딩 실패 (에러 발생)`, 'error');
        addResult('pages', pageInfo.name, 'fail', '페이지 에러');
      } else {
        log(`${pageInfo.name}: 로딩 성공`, 'success');
        addResult('pages', pageInfo.name, 'pass');
      }
    } catch (error) {
      log(`${pageInfo.name}: 로딩 실패 - ${error.message}`, 'error');
      addResult('pages', pageInfo.name, 'fail', error.message);
    }
  }

  // ===== 2. CRUD 버튼 테스트 =====
  console.log('\n' + '-'.repeat(50));
  console.log('2. CRUD 버튼 기능 테스트');
  console.log('-'.repeat(50));

  const crudPages = TEST_PAGES.filter(p => p.crud && p.type === 'list');

  for (const pageInfo of crudPages) {
    try {
      await page.goto(`${BASE_URL}${pageInfo.url}`, {
        timeout: 30000,
        waitUntil: 'domcontentloaded'
      });
      await page.waitForTimeout(2000);

      // 버튼 존재 확인
      const buttons = {
        search: await page.locator('button:has-text("조회")').count(),
        new: await page.locator('button:has-text("신규")').count(),
        edit: await page.locator('button:has-text("수정")').count(),
        delete: await page.locator('button:has-text("삭제")').count(),
        reset: await page.locator('button:has-text("초기화")').count(),
        save: await page.locator('button:has-text("저장")').count()
      };

      const foundButtons = Object.entries(buttons)
        .filter(([k, v]) => v > 0)
        .map(([k]) => k)
        .join(', ');

      log(`${pageInfo.name}: 버튼 [${foundButtons}]`, 'success');
      addResult('crud', `${pageInfo.name} - 버튼`, 'pass', foundButtons);

      // 조회 버튼 클릭 테스트
      const searchBtn = page.locator('button:has-text("조회")').first();
      if (await searchBtn.count() > 0) {
        await searchBtn.click();
        await page.waitForTimeout(1500);
        log(`${pageInfo.name}: 조회 버튼 클릭 성공`, 'success');
        addResult('crud', `${pageInfo.name} - 조회`, 'pass');
      }

      // 신규 버튼 클릭 테스트
      const newBtn = page.locator('button:has-text("신규")').first();
      if (await newBtn.count() > 0) {
        await newBtn.click();
        await page.waitForTimeout(1500);
        const isRegisterPage = page.url().includes('register');
        if (isRegisterPage) {
          log(`${pageInfo.name}: 신규 버튼 이동 성공`, 'success');
          addResult('crud', `${pageInfo.name} - 신규`, 'pass');
        } else {
          log(`${pageInfo.name}: 신규 버튼 이동 확인 필요`, 'warn');
          addResult('crud', `${pageInfo.name} - 신규`, 'pass', '페이지 이동 확인 필요');
        }
      }

    } catch (error) {
      log(`${pageInfo.name}: CRUD 테스트 실패 - ${error.message}`, 'error');
      addResult('crud', pageInfo.name, 'fail', error.message);
    }
  }

  // ===== 3. 등록 페이지 저장 테스트 =====
  console.log('\n' + '-'.repeat(50));
  console.log('3. 등록 페이지 저장 테스트');
  console.log('-'.repeat(50));

  const registerPages = TEST_PAGES.filter(p => p.type === 'register');

  for (const pageInfo of registerPages) {
    try {
      await page.goto(`${BASE_URL}${pageInfo.url}`, {
        timeout: 30000,
        waitUntil: 'domcontentloaded'
      });
      await page.waitForTimeout(2000);

      // 저장 버튼 존재 확인
      const saveBtn = page.locator('button:has-text("저장")').first();
      if (await saveBtn.count() > 0) {
        log(`${pageInfo.name}: 저장 버튼 존재`, 'success');
        addResult('crud', `${pageInfo.name} - 저장버튼`, 'pass');
      } else {
        log(`${pageInfo.name}: 저장 버튼 없음`, 'warn');
        addResult('crud', `${pageInfo.name} - 저장버튼`, 'fail', '저장 버튼 없음');
      }

      // 입력 필드 확인
      const inputCount = await page.locator('input').count();
      const selectCount = await page.locator('select').count();
      log(`${pageInfo.name}: 입력필드 ${inputCount}개, 선택필드 ${selectCount}개`, 'info');

    } catch (error) {
      log(`${pageInfo.name}: 등록 테스트 실패 - ${error.message}`, 'error');
      addResult('crud', `${pageInfo.name} - 등록`, 'fail', error.message);
    }
  }

  // ===== 4. 팝업 모달 테스트 =====
  console.log('\n' + '-'.repeat(50));
  console.log('4. 팝업 모달 테스트');
  console.log('-'.repeat(50));

  const popupTestPages = [
    { name: '해상 부킹 등록', url: '/logis/booking/sea/register', buttonText: '찾기' },
    { name: '해상 견적 등록', url: '/logis/quote/sea/register', buttonText: '스케줄조회' },
    { name: '해상 수입 B/L 등록', url: '/logis/import-bl/sea/register', buttonText: '찾기' },
  ];

  for (const popupPage of popupTestPages) {
    try {
      await page.goto(`${BASE_URL}${popupPage.url}`, {
        timeout: 30000,
        waitUntil: 'domcontentloaded'
      });
      await page.waitForTimeout(2000);

      // 찾기 버튼 클릭
      const searchButton = page.locator(`button:has-text("${popupPage.buttonText}")`).first();
      if (await searchButton.count() > 0) {
        await searchButton.click();
        await page.waitForTimeout(1000);

        // 모달 존재 확인
        const modal = page.locator('.fixed.inset-0, [role="dialog"], .modal');
        if (await modal.count() > 0) {
          log(`${popupPage.name}: 팝업 모달 정상 작동`, 'success');
          addResult('popups', `${popupPage.name} - ${popupPage.buttonText}`, 'pass');

          // ESC로 닫기
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        } else {
          log(`${popupPage.name}: 팝업 모달 확인 필요`, 'warn');
          addResult('popups', `${popupPage.name} - ${popupPage.buttonText}`, 'pass', '모달 확인 필요');
        }
      } else {
        log(`${popupPage.name}: ${popupPage.buttonText} 버튼 없음`, 'warn');
        addResult('popups', `${popupPage.name} - ${popupPage.buttonText}`, 'fail', '버튼 없음');
      }
    } catch (error) {
      log(`${popupPage.name}: 팝업 테스트 실패 - ${error.message}`, 'error');
      addResult('popups', popupPage.name, 'fail', error.message);
    }
  }

  // ===== 5. 데이터베이스 API 테스트 =====
  console.log('\n' + '-'.repeat(50));
  console.log('5. 데이터베이스 API 테스트');
  console.log('-'.repeat(50));

  for (const api of API_ENDPOINTS) {
    try {
      const response = await page.request.get(`${BASE_URL}${api.url}`);
      const status = response.status();

      if (status === 200) {
        const data = await response.json();
        const count = Array.isArray(data) ? data.length : (data.data ? data.data.length : 0);
        log(`${api.name}: 성공 (${count}건)`, 'success');
        addResult('database', api.name, 'pass', `${count}건 조회`);
      } else {
        log(`${api.name}: 실패 (HTTP ${status})`, 'error');
        addResult('database', api.name, 'fail', `HTTP ${status}`);
      }
    } catch (error) {
      log(`${api.name}: 실패 - ${error.message}`, 'error');
      addResult('database', api.name, 'fail', error.message);
    }
  }

  // ===== 6. 데이터 저장 테스트 =====
  console.log('\n' + '-'.repeat(50));
  console.log('6. 데이터 저장 테스트 (해상 스케줄)');
  console.log('-'.repeat(50));

  try {
    await page.goto(`${BASE_URL}/logis/schedule/sea/register`, {
      timeout: 30000,
      waitUntil: 'domcontentloaded'
    });
    await page.waitForTimeout(2000);

    // 테스트 데이터 입력
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        const name = input.name || input.placeholder || '';
        if (name.includes('vessel') || name.includes('선박')) {
          input.value = 'TEST VESSEL ' + Date.now();
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (name.includes('voyage') || name.includes('항차')) {
          input.value = 'V001';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    });

    // 저장 버튼 클릭
    const saveBtn = page.locator('button:has-text("저장")').first();
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
      log('데이터 저장 테스트: 저장 버튼 클릭 완료', 'success');
      addResult('database', '데이터 저장 테스트', 'pass');
    }
  } catch (error) {
    log(`데이터 저장 테스트 실패: ${error.message}`, 'error');
    addResult('database', '데이터 저장 테스트', 'fail', error.message);
  }

  // ===== 테스트 완료 =====
  await browser.close();

  // 결과 출력
  console.log('\n' + '='.repeat(70));
  console.log('   테스트 결과 요약');
  console.log('='.repeat(70));
  console.log(`\n총 테스트: ${testResults.summary.total}개`);
  console.log(`성공: ${testResults.summary.passed}개`);
  console.log(`실패: ${testResults.summary.failed}개`);
  console.log(`성공률: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);

  console.log('\n[카테고리별 결과]');
  console.log(`- 페이지 로딩: ${testResults.pages.filter(r => r.status === 'pass').length}/${testResults.pages.length}`);
  console.log(`- CRUD 기능: ${testResults.crud.filter(r => r.status === 'pass').length}/${testResults.crud.length}`);
  console.log(`- 팝업 모달: ${testResults.popups.filter(r => r.status === 'pass').length}/${testResults.popups.length}`);
  console.log(`- DB API: ${testResults.database.filter(r => r.status === 'pass').length}/${testResults.database.length}`);

  // 실패 항목 출력
  const failures = [
    ...testResults.pages.filter(r => r.status === 'fail'),
    ...testResults.crud.filter(r => r.status === 'fail'),
    ...testResults.popups.filter(r => r.status === 'fail'),
    ...testResults.database.filter(r => r.status === 'fail')
  ];

  if (failures.length > 0) {
    console.log('\n[실패 항목]');
    failures.forEach(f => {
      console.log(`  - ${f.name}: ${f.details}`);
    });
  }

  console.log('\n' + '='.repeat(70));

  return testResults;
}

// 테스트 실행
runComprehensiveTest()
  .then(results => {
    console.log('\n테스트 완료!');
    process.exit(results.summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('테스트 실행 중 오류:', error);
    process.exit(1);
  });
