const { chromium } = require('playwright');

async function testRegisterPages() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('========================================');
  console.log('   등록 화면 테스트 시작');
  console.log('========================================\n');

  // 1. 해상 견적 등록 화면 테스트
  console.log('=== 1. 해상 견적 등록 화면 테스트 ===\n');
  try {
    await page.goto('http://localhost:3000/logis/quote/sea/register', { waitUntil: 'networkidle' });

    // 제목 확인
    const pageContent = await page.content();
    console.log('페이지 로드: 성공');

    // 섹션 확인
    const sections = ['기본정보', '운임정보', '운송요율', '기타정보'];
    for (const section of sections) {
      const found = pageContent.includes(section);
      console.log(`  [${found ? 'O' : 'X'}] ${section} 섹션`);
    }

    // 합계 카드 확인
    const totals = ['외화합계', '원화합계', '부가세합계', '총 합계'];
    console.log('\n합계 정보:');
    for (const total of totals) {
      const found = pageContent.includes(total);
      console.log(`  [${found ? 'O' : 'X'}] ${total}`);
    }

    // 버튼 확인
    const buttons = ['스케줄조회', '운임조회', 'E-mail', '목록', '저장'];
    console.log('\n버튼:');
    for (const btn of buttons) {
      const found = pageContent.includes(btn);
      console.log(`  [${found ? 'O' : 'X'}] ${btn}`);
    }

    // 스케줄조회 버튼 클릭 테스트
    console.log('\n스케줄조회 버튼 클릭 테스트:');
    await page.click('button:has-text("스케줄조회")');
    await page.waitForTimeout(500);
    const afterClick = await page.content();
    const modalOpen = afterClick.includes('스케줄 조회') || afterClick.includes('Schedule');
    console.log(`  모달 열림: ${modalOpen ? '성공' : '확인필요'}`);

    // ESC로 모달 닫기
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 스크린샷
    await page.screenshot({ path: 'test-results/1-sea-register.png', fullPage: true });
    console.log('\n스크린샷: test-results/1-sea-register.png');

  } catch (e) {
    console.log('오류:', e.message);
  }

  // 2. 항공 견적 등록 화면 테스트
  console.log('\n\n=== 2. 항공 견적 등록 화면 테스트 ===\n');
  try {
    await page.goto('http://localhost:3000/logis/quote/air/register', { waitUntil: 'networkidle' });

    const pageContent = await page.content();
    console.log('페이지 로드: 성공');

    // 섹션 확인
    const sections = ['기본정보', '운임정보', '운송요율', '기타정보'];
    for (const section of sections) {
      const found = pageContent.includes(section);
      console.log(`  [${found ? 'O' : 'X'}] ${section} 섹션`);
    }

    // 항공 운임 특화 확인
    const airSpecific = ['항공 운임 견적', 'M/C', '-45kg', '-100kg'];
    console.log('\n항공 운임 특화 항목:');
    for (const item of airSpecific) {
      const found = pageContent.includes(item);
      console.log(`  [${found ? 'O' : 'X'}] ${item}`);
    }

    // 스크린샷
    await page.screenshot({ path: 'test-results/2-air-register.png', fullPage: true });
    console.log('\n스크린샷: test-results/2-air-register.png');

  } catch (e) {
    console.log('오류:', e.message);
  }

  // 3. 수입 B/L 등록 화면 테스트
  console.log('\n\n=== 3. 수입 B/L 등록 화면 테스트 ===\n');
  try {
    await page.goto('http://localhost:3000/logis/import-bl/sea/register', { waitUntil: 'networkidle' });

    const pageContent = await page.content();
    console.log('페이지 로드: 성공');

    // 탭 확인
    const tabs = ['Main Information', 'Cargo Information', 'Other Charges'];
    console.log('탭 구조:');
    for (const tab of tabs) {
      const found = pageContent.includes(tab);
      console.log(`  [${found ? 'O' : 'X'}] ${tab}`);
    }

    // 버튼 확인
    const buttons = ['스케줄조회', '운임조회', 'E-mail', '목록', '저장'];
    console.log('\n버튼:');
    for (const btn of buttons) {
      const found = pageContent.includes(btn);
      console.log(`  [${found ? 'O' : 'X'}] ${btn}`);
    }

    // CARGO 탭 클릭
    console.log('\nCARGO 탭 클릭 테스트:');
    await page.click('text=Cargo Information');
    await page.waitForTimeout(500);
    const afterCargoClick = await page.content();
    const cargoVisible = afterCargoClick.includes('MARK') || afterCargoClick.includes('Description');
    console.log(`  CARGO 내용 표시: ${cargoVisible ? '성공' : '확인필요'}`);

    await page.screenshot({ path: 'test-results/3-bl-cargo-tab.png', fullPage: true });

    // OTHER 탭 클릭
    console.log('\nOTHER 탭 클릭 테스트:');
    await page.click('text=Other Charges');
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'test-results/4-bl-other-tab.png', fullPage: true });
    console.log('  스크린샷 저장 완료');

  } catch (e) {
    console.log('오류:', e.message);
  }

  // 4. 저장 기능 테스트
  console.log('\n\n=== 4. 저장 기능 테스트 (해상 견적) ===\n');
  try {
    await page.goto('http://localhost:3000/logis/quote/sea/register', { waitUntil: 'networkidle' });

    // Alert 처리
    page.on('dialog', async dialog => {
      console.log(`Alert 메시지: "${dialog.message()}"`);
      await dialog.accept();
    });

    // 저장 버튼 클릭 (필수 항목 미입력 상태)
    console.log('저장 버튼 클릭 (필수 항목 미입력):');
    await page.click('button:has-text("저장")');
    await page.waitForTimeout(1000);

    // 거래처 입력 후 저장
    console.log('\n거래처 입력 후 저장:');
    const inputs = await page.$$('input');
    for (const input of inputs) {
      const placeholder = await input.getAttribute('placeholder');
      if (placeholder && placeholder.includes('거래처')) {
        await input.fill('테스트 화주 주식회사');
        console.log('  거래처 입력: 테스트 화주 주식회사');
        break;
      }
    }

    await page.click('button:has-text("저장")');
    await page.waitForTimeout(1000);

  } catch (e) {
    console.log('오류:', e.message);
  }

  await browser.close();

  console.log('\n========================================');
  console.log('   테스트 완료');
  console.log('========================================');
}

testRegisterPages().catch(console.error);
