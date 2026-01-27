const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise');

async function testScheduleRegister() {
  console.log('해상 스케줄 등록 화면 저장 테스트');
  console.log('='.repeat(50));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // 1. 등록 페이지 이동
    console.log('\n1. 등록 페이지 이동...');
    await page.goto('http://localhost:3004/logis/schedule/sea/register', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    console.log('   [OK] 페이지 로드 완료');

    // 2. 테스트데이터 버튼 클릭
    console.log('\n2. 테스트데이터 버튼 클릭...');
    await page.waitForSelector('button');
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text && text.includes('테스트데이터')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 500));
    console.log('   [OK] 테스트 데이터 입력됨');

    // 3. 입력된 값 확인
    console.log('\n3. 입력된 값 확인...');
    const vesselValue = await page.$eval('input[placeholder="선박명"]', el => el.value);
    const voyageValue = await page.$eval('input[placeholder="001E"]', el => el.value);
    console.log('   선명:', vesselValue);
    console.log('   항차:', voyageValue);

    // 선사 선택값 확인 - 첫 번째 select가 상태, 두 번째가 선사
    const selects = await page.$$('select');
    if (selects.length >= 2) {
      const carrierSelect = selects[1]; // 두 번째 select가 선사
      const selectedValue = await carrierSelect.evaluate(el => el.value);
      const selectedText = await carrierSelect.evaluate(el => el.options[el.selectedIndex]?.text);
      console.log('   선사 ID:', selectedValue);
      console.log('   선사명:', selectedText);
    }

    // 스크린샷 (저장 전)
    await page.screenshot({ path: 'schedule-before-save.png', fullPage: true });
    console.log('   스크린샷 저장: schedule-before-save.png');

    // 4. 저장 버튼 클릭
    console.log('\n4. 저장 버튼 클릭...');

    // alert 처리 설정
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      console.log('   Alert:', alertMessage);
      await dialog.accept();
    });

    // 저장 버튼 찾아서 클릭
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text && (text.includes('저장') && !text.includes('테스트'))) {
        await btn.click();
        break;
      }
    }

    await new Promise(r => setTimeout(r, 3000));

    if (alertMessage.includes('등록되었습니다')) {
      console.log('   [OK] 저장 성공!');
    } else if (alertMessage.includes('실패')) {
      console.log('   [FAIL] 저장 실패:', alertMessage);
    } else if (alertMessage.includes('선택')) {
      console.log('   [WARN] 필수 입력 누락:', alertMessage);
    }

    // 5. DB에서 저장된 데이터 확인
    console.log('\n5. DB에서 저장된 데이터 확인...');
    const pool = mysql.createPool({
      host: '211.236.174.220',
      port: 53306,
      user: 'user',
      password: 'P@ssw0rd',
      database: 'logstic'
    });

    const [rows] = await pool.query(`
      SELECT
        s.OCEAN_SCHEDULE_ID as id,
        c.CARRIER_NM as carrier,
        s.VESSEL_NM as vessel,
        s.VOYAGE_NO as voyage,
        s.POL_PORT_CD as pol,
        s.POD_PORT_CD as pod,
        DATE_FORMAT(s.ETD_DTM, '%Y-%m-%d') as etd,
        DATE_FORMAT(s.ETA_DTM, '%Y-%m-%d') as eta,
        s.STATUS_CD as status,
        DATE_FORMAT(s.CREATED_DTM, '%Y-%m-%d %H:%i:%s') as createdAt
      FROM SCH_OCEAN_SCHEDULE s
      LEFT JOIN MST_CARRIER c ON s.CARRIER_ID = c.CARRIER_ID
      WHERE s.DEL_YN = 'N'
      ORDER BY s.CREATED_DTM DESC
      LIMIT 5
    `);

    console.log('   최근 등록된 해상 스케줄:');
    rows.forEach((row, i) => {
      console.log(`   ${i+1}. [${row.id}] ${row.carrier} - ${row.vessel}/${row.voyage}`);
      console.log(`      ${row.pol} -> ${row.pod}, ETD: ${row.etd}, 상태: ${row.status}`);
      console.log(`      등록일시: ${row.createdAt}`);
    });

    await pool.end();

    console.log('\n' + '='.repeat(50));
    console.log('테스트 완료!');

  } catch (error) {
    console.error('오류:', error.message);
  } finally {
    await browser.close();
  }
}

testScheduleRegister();
