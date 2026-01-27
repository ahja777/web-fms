const { chromium } = require('playwright');

async function testEmailModal() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('========================================');
  console.log('   E-mail 버튼 기능 테스트');
  console.log('========================================\n');

  // Alert 처리
  page.on('dialog', async dialog => {
    console.log(`   [Alert] "${dialog.message()}"`);
    await dialog.accept();
  });

  // 페이지 이동 함수
  async function navigateTo(url) {
    try {
      await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);
      return true;
    } catch (err) {
      console.log('   페이지 로딩 실패:', err.message);
      return false;
    }
  }

  // ============================================
  // 1. 해상 견적 등록 화면 E-mail 테스트
  // ============================================
  console.log('========================================');
  console.log('1. 해상 견적 등록 화면 E-mail 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/quote/sea/register');

    // E-mail 버튼 확인
    console.log('1-1. E-mail 버튼 확인...');
    const emailBtn1 = await page.$('button:has-text("E-mail")');
    if (emailBtn1) {
      console.log('   E-mail 버튼 발견\n');

      // E-mail 버튼 클릭
      console.log('1-2. E-mail 버튼 클릭...');
      await emailBtn1.click();
      await page.waitForTimeout(1500);

      // 모달 확인
      const content = await page.content();
      const modalOpen = content.includes('E-mail 발송') ||
                       content.includes('받는 사람') ||
                       content.includes('이메일');
      console.log(`   모달 상태: ${modalOpen ? '열림' : '닫힘'}`);

      await page.screenshot({ path: 'test-results/email-1-sea-modal.png', fullPage: true });
      console.log('   스크린샷: test-results/email-1-sea-modal.png\n');

      if (modalOpen) {
        // 이메일 주소 입력
        console.log('1-3. 이메일 정보 입력...');
        await page.evaluate(() => {
          const inputs = document.querySelectorAll('input');
          inputs.forEach(input => {
            const placeholder = input.placeholder || '';
            const type = input.type || '';
            if (type === 'email' || placeholder.includes('이메일') || placeholder.includes('email')) {
              input.value = 'test@example.com';
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
          });

          // 제목 입력
          const subjectInput = document.querySelector('input[placeholder*="제목"]');
          if (subjectInput) {
            subjectInput.value = '해상 견적서 발송';
            subjectInput.dispatchEvent(new Event('input', { bubbles: true }));
          }

          // 내용 입력
          const textarea = document.querySelector('textarea');
          if (textarea) {
            textarea.value = '견적서를 첨부하여 발송드립니다.';
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
        await page.waitForTimeout(500);
        console.log('   이메일 정보 입력 완료');

        await page.screenshot({ path: 'test-results/email-2-sea-filled.png', fullPage: true });
        console.log('   스크린샷: test-results/email-2-sea-filled.png\n');

        // 발송 버튼 클릭
        console.log('1-4. 발송 버튼 테스트...');
        const sendBtn = await page.$('button:has-text("발송")');
        if (sendBtn) {
          await sendBtn.click();
          await page.waitForTimeout(1500);
          console.log('   발송 버튼 클릭 완료');
        }

        await page.screenshot({ path: 'test-results/email-3-sea-sent.png', fullPage: true });
        console.log('   스크린샷: test-results/email-3-sea-sent.png\n');

        // 닫기 버튼 테스트
        console.log('1-5. 닫기 버튼 테스트...');
        const closeBtn = await page.$('button:has-text("닫기")');
        if (closeBtn) {
          await closeBtn.click();
          await page.waitForTimeout(500);
          console.log('   모달 닫기 완료');
        }
      }
    } else {
      console.log('   E-mail 버튼 없음\n');
    }
  } catch (error) {
    console.log('   오류:', error.message);
  }

  // ============================================
  // 2. 항공 견적 등록 화면 E-mail 테스트
  // ============================================
  console.log('========================================');
  console.log('2. 항공 견적 등록 화면 E-mail 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/quote/air/register');

    // E-mail 버튼 확인
    console.log('2-1. E-mail 버튼 확인...');
    const emailBtn2 = await page.$('button:has-text("E-mail")');
    if (emailBtn2) {
      console.log('   E-mail 버튼 발견\n');

      // E-mail 버튼 클릭
      console.log('2-2. E-mail 버튼 클릭...');
      await emailBtn2.click();
      await page.waitForTimeout(1500);

      // 모달 확인
      const content = await page.content();
      const modalOpen = content.includes('E-mail 발송') ||
                       content.includes('받는 사람') ||
                       content.includes('이메일');
      console.log(`   모달 상태: ${modalOpen ? '열림' : '닫힘'}`);

      await page.screenshot({ path: 'test-results/email-4-air-modal.png', fullPage: true });
      console.log('   스크린샷: test-results/email-4-air-modal.png\n');

      if (modalOpen) {
        // 닫기
        const closeBtn = await page.$('button:has-text("닫기")');
        if (closeBtn) {
          await closeBtn.click();
          await page.waitForTimeout(500);
        }
      }
    } else {
      console.log('   E-mail 버튼 없음\n');
    }
  } catch (error) {
    console.log('   오류:', error.message);
  }

  // ============================================
  // 3. 수입 B/L 등록 화면 E-mail 테스트
  // ============================================
  console.log('========================================');
  console.log('3. 수입 B/L 등록 화면 E-mail 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/import-bl/sea/register');

    // E-mail 버튼 확인
    console.log('3-1. E-mail 버튼 확인...');
    const emailBtn3 = await page.$('button:has-text("E-mail")');
    if (emailBtn3) {
      console.log('   E-mail 버튼 발견\n');

      // E-mail 버튼 클릭
      console.log('3-2. E-mail 버튼 클릭...');
      await emailBtn3.click();
      await page.waitForTimeout(1500);

      // 모달 확인
      const content = await page.content();
      const modalOpen = content.includes('E-mail 발송') ||
                       content.includes('받는 사람') ||
                       content.includes('이메일');
      console.log(`   모달 상태: ${modalOpen ? '열림' : '닫힘'}`);

      await page.screenshot({ path: 'test-results/email-5-bl-modal.png', fullPage: true });
      console.log('   스크린샷: test-results/email-5-bl-modal.png\n');
    } else {
      console.log('   E-mail 버튼 없음\n');
    }
  } catch (error) {
    console.log('   오류:', error.message);
  }

  // ============================================
  // 4. 해상 견적 조회 화면 E-mail 테스트
  // ============================================
  console.log('========================================');
  console.log('4. 해상 견적 조회 화면 E-mail 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/quote/sea');

    // 항목 선택
    console.log('4-1. 항목 선택...');
    const checkboxes = await page.$$('input[type="checkbox"]');
    if (checkboxes.length > 1) {
      await checkboxes[1].click();
      await page.waitForTimeout(500);
      console.log('   항목 선택 완료\n');
    }

    // E-mail 버튼 확인
    console.log('4-2. E-mail 버튼 확인...');
    const emailBtn4 = await page.$('button:has-text("E-mail")');
    if (emailBtn4) {
      console.log('   E-mail 버튼 발견\n');

      // E-mail 버튼 클릭
      console.log('4-3. E-mail 버튼 클릭...');
      await emailBtn4.click();
      await page.waitForTimeout(1500);

      await page.screenshot({ path: 'test-results/email-6-sea-list.png', fullPage: true });
      console.log('   스크린샷: test-results/email-6-sea-list.png\n');
    } else {
      console.log('   E-mail 버튼 없음\n');
    }
  } catch (error) {
    console.log('   오류:', error.message);
  }

  // ============================================
  // 5. 수입 B/L 조회 화면 E-mail 테스트
  // ============================================
  console.log('========================================');
  console.log('5. 수입 B/L 조회 화면 E-mail 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/import-bl/sea');

    // 항목 선택
    console.log('5-1. 항목 선택...');
    const checkboxes = await page.$$('input[type="checkbox"]');
    if (checkboxes.length > 1) {
      await checkboxes[1].click();
      await page.waitForTimeout(500);
      console.log('   항목 선택 완료\n');
    }

    // E-mail 버튼 확인
    console.log('5-2. E-mail 버튼 확인...');
    const emailBtn5 = await page.$('button:has-text("E-mail")');
    if (emailBtn5) {
      console.log('   E-mail 버튼 발견\n');

      // E-mail 버튼 클릭
      console.log('5-3. E-mail 버튼 클릭...');
      await emailBtn5.click();
      await page.waitForTimeout(1500);

      await page.screenshot({ path: 'test-results/email-7-bl-list.png', fullPage: true });
      console.log('   스크린샷: test-results/email-7-bl-list.png\n');
    } else {
      console.log('   E-mail 버튼 없음\n');
    }
  } catch (error) {
    console.log('   오류:', error.message);
  }

  await browser.close();

  console.log('================================================');
  console.log('   E-mail 테스트 완료');
  console.log('================================================');
}

testEmailModal().catch(console.error);
