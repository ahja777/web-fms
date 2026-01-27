const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testEmailModal() {
  console.log('Starting email modal test...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const screenshotDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    // 해상 견적 등록 페이지
    console.log('=== 해상 견적 등록 - 이메일 모달 테스트 ===');
    await page.goto('http://localhost:3000/logis/quote/sea/register', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for hydration
    let hydrated = false;
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const info = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        const btn = Array.from(buttons).find(b => b.textContent?.includes('E-mail'));
        if (btn) {
          const key = Object.keys(btn).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactProps$'));
          return { hasReact: !!key };
        }
        return { hasReact: false };
      });
      if (info.hasReact) {
        hydrated = true;
        console.log(`  React 하이드레이션 완료 (${i+1}초)`);
        break;
      }
    }

    if (!hydrated) {
      console.log('  React 하이드레이션 실패');
      await browser.close();
      return;
    }

    // Click E-mail button
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const btn = Array.from(buttons).find(b => b.textContent?.includes('E-mail'));
      if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotDir, 'email-modal.png') });

    // Check modal
    const modalInfo = await page.evaluate(() => {
      const h2Elements = document.querySelectorAll('h2');
      const hasEmailModal = Array.from(h2Elements).some(h => h.textContent?.includes('이메일 발송'));

      // Check for input fields
      const hasToField = !!document.querySelector('input[placeholder*="이메일"]');
      const hasSubject = document.querySelector('input[type="text"]');
      const hasBody = document.querySelector('textarea');

      return {
        hasEmailModal,
        hasToField,
        hasSubjectField: !!hasSubject,
        hasBodyField: !!hasBody
      };
    });

    if (modalInfo.hasEmailModal) {
      console.log('  [PASS] 이메일 모달 열림');
      console.log('  [INFO] 받는 사람 필드:', modalInfo.hasToField ? 'O' : 'X');
      console.log('  [INFO] 제목 필드:', modalInfo.hasSubjectField ? 'O' : 'X');
      console.log('  [INFO] 내용 필드:', modalInfo.hasBodyField ? 'O' : 'X');
    } else {
      console.log('  [FAIL] 이메일 모달이 열리지 않음');
    }

    console.log('\n=== 테스트 완료 ===');
    console.log('스크린샷:', path.join(screenshotDir, 'email-modal.png'));

  } catch (error) {
    console.error('테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testEmailModal();
