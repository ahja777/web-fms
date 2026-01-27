const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise');

const BASE_URL = 'http://localhost:3004';

// 테스트할 등록 화면 목록
const registerPages = [
  {
    name: '항공 스케줄 등록',
    path: '/logis/schedule/air/register',
    testDataBtn: true,
  },
  {
    name: '해상 부킹 등록',
    path: '/logis/booking/sea/register',
    testDataBtn: true,
  },
  {
    name: '항공 부킹 등록',
    path: '/logis/booking/air/register',
    testDataBtn: true,
  },
  {
    name: '해상 견적 등록',
    path: '/logis/quote/sea/register',
    testDataBtn: true,
  },
  {
    name: '항공 견적 등록',
    path: '/logis/quote/air/register',
    testDataBtn: true,
  },
  {
    name: 'S/R 등록',
    path: '/logis/sr/sea/register',
    testDataBtn: true,
  },
  {
    name: 'S/N 등록',
    path: '/logis/sn/sea/register',
    testDataBtn: true,
  },
];

async function testRegisterPage(browser, pageInfo) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  let result = { name: pageInfo.name, status: 'UNKNOWN', message: '' };

  try {
    // alert 처리 설정
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    // 페이지 이동
    await page.goto(BASE_URL + pageInfo.path, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // 테스트데이터 버튼 찾기
    await page.waitForSelector('button', { timeout: 5000 });
    const buttons = await page.$$('button');

    let testDataClicked = false;
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text && text.includes('테스트데이터')) {
        await btn.click();
        testDataClicked = true;
        break;
      }
    }

    if (!testDataClicked) {
      result.status = 'SKIP';
      result.message = '테스트데이터 버튼 없음';
      await page.close();
      return result;
    }

    await new Promise(r => setTimeout(r, 500));

    // 저장 버튼 클릭
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text && text.includes('저장') && !text.includes('테스트')) {
        await btn.click();
        break;
      }
    }

    await new Promise(r => setTimeout(r, 3000));

    // 결과 확인
    if (alertMessage.includes('등록되었습니다') || alertMessage.includes('저장되었습니다')) {
      result.status = 'OK';
      result.message = alertMessage;
    } else if (alertMessage.includes('실패')) {
      result.status = 'FAIL';
      result.message = alertMessage;
    } else if (alertMessage.includes('선택') || alertMessage.includes('입력')) {
      result.status = 'WARN';
      result.message = alertMessage;
    } else if (alertMessage) {
      result.status = 'INFO';
      result.message = alertMessage;
    } else {
      result.status = 'UNKNOWN';
      result.message = 'Alert 없음';
    }

    // 스크린샷
    const screenshotName = pageInfo.path.replace(/\//g, '-').substring(1) + '.png';
    await page.screenshot({ path: screenshotName, fullPage: true });

  } catch (error) {
    result.status = 'ERROR';
    result.message = error.message;
  } finally {
    await page.close();
  }

  return result;
}

async function checkDBData(pool) {
  console.log('\n' + '='.repeat(60));
  console.log('DB 저장 데이터 확인');
  console.log('='.repeat(60));

  // 각 테이블에서 최근 데이터 확인
  const tables = [
    { name: 'SCH_AIR_SCHEDULE', label: '항공 스케줄' },
    { name: 'ORD_OCEAN_BOOKING', label: '해상 부킹' },
    { name: 'ORD_AIR_BOOKING', label: '항공 부킹' },
    { name: 'ORD_QUOTE_SEA', label: '해상 견적' },
    { name: 'ORD_QUOTE_AIR', label: '항공 견적' },
    { name: 'ORD_OCEAN_SR', label: 'S/R' },
    { name: 'ORD_OCEAN_SN', label: 'S/N' },
  ];

  for (const table of tables) {
    try {
      const [rows] = await pool.query(`SELECT COUNT(*) as cnt FROM ${table.name} WHERE DEL_YN = 'N'`);
      const [recent] = await pool.query(`SELECT * FROM ${table.name} WHERE DEL_YN = 'N' ORDER BY CREATED_DTM DESC LIMIT 1`);

      console.log(`\n${table.label} (${table.name}): ${rows[0].cnt}건`);
      if (recent.length > 0) {
        const row = recent[0];
        const createdAt = row.CREATED_DTM ? new Date(row.CREATED_DTM).toLocaleString('ko-KR') : 'N/A';
        console.log(`  최근 등록: ${createdAt}`);
      }
    } catch (e) {
      console.log(`\n${table.label} (${table.name}): 테이블 없음 또는 오류`);
    }
  }
}

async function main() {
  console.log('FMS-WEB 전체 등록 화면 저장 테스트');
  console.log('='.repeat(60));
  console.log(`테스트 대상: ${registerPages.length}개 화면`);
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const results = [];

  for (const pageInfo of registerPages) {
    console.log(`\n테스트 중: ${pageInfo.name}...`);
    const result = await testRegisterPage(browser, pageInfo);
    results.push(result);

    const statusIcon = result.status === 'OK' ? '[OK]' :
                       result.status === 'FAIL' ? '[FAIL]' :
                       result.status === 'WARN' ? '[WARN]' :
                       result.status === 'SKIP' ? '[SKIP]' :
                       result.status === 'ERROR' ? '[ERROR]' : '[?]';
    console.log(`  ${statusIcon} ${result.message}`);
  }

  await browser.close();

  // 결과 요약
  console.log('\n' + '='.repeat(60));
  console.log('테스트 결과 요약');
  console.log('='.repeat(60));
  console.log('');

  const okCount = results.filter(r => r.status === 'OK').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const warnCount = results.filter(r => r.status === 'WARN').length;
  const errorCount = results.filter(r => r.status === 'ERROR').length;

  results.forEach(r => {
    const icon = r.status === 'OK' ? '✓' : r.status === 'FAIL' ? '✗' : r.status === 'WARN' ? '!' : r.status === 'ERROR' ? 'E' : '-';
    console.log(`  [${icon}] ${r.name}: ${r.status} - ${r.message}`);
  });

  console.log('');
  console.log(`성공: ${okCount}, 실패: ${failCount}, 경고: ${warnCount}, 에러: ${errorCount}`);

  // DB 확인
  const pool = mysql.createPool({
    host: '211.236.174.220',
    port: 53306,
    user: 'user',
    password: 'P@ssw0rd',
    database: 'logstic'
  });

  await checkDBData(pool);
  await pool.end();

  console.log('\n' + '='.repeat(60));
  console.log('테스트 완료!');
  console.log('='.repeat(60));
}

main().catch(console.error);
