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

async function testCRUDButtons() {
  console.log('='.repeat(60));
  console.log('CRUD 버튼 기능 테스트');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });

    // 테스트할 페이지 목록
    const testPages = [
      { name: '해상 견적 등록', url: '/logis/quote/sea/register', screenshot: 'quote-sea' },
      { name: '항공 견적 등록', url: '/logis/quote/air/register', screenshot: 'quote-air' },
      { name: '해상 부킹 등록', url: '/logis/booking/sea/register', screenshot: 'booking-sea' },
      { name: '항공 부킹 등록', url: '/logis/booking/air/register', screenshot: 'booking-air' },
      { name: '수입 B/L 등록', url: '/logis/import-bl/sea/register', screenshot: 'import-bl' },
    ];

    for (let i = 0; i < testPages.length; i++) {
      const testPage = testPages[i];
      console.log(`\n[TEST ${i + 1}/${testPages.length}] ${testPage.name}`);
      console.log('-'.repeat(50));

      try {
        // 페이지 로드
        await page.goto(`http://localhost:3000${testPage.url}`, {
          waitUntil: 'networkidle2',
          timeout: 60000
        });
        await delay(2000);

        // 초기 상태 스크린샷
        await page.screenshot({
          path: path.join(screenshotDir, `${testPage.screenshot}-initial.png`),
          fullPage: false
        });
        console.log('  [PASS] 페이지 로드 완료');

        // 버튼 존재 여부 확인
        const buttons = await page.evaluate(() => {
          const allButtons = Array.from(document.querySelectorAll('button'));
          return allButtons.map(b => b.textContent?.trim()).filter(Boolean);
        });

        const requiredButtons = ['테스트데이터', '신규', '초기화', '저장'];
        const foundButtons = [];
        const missingButtons = [];

        for (const btn of requiredButtons) {
          if (buttons.some(b => b.includes(btn))) {
            foundButtons.push(btn);
          } else {
            missingButtons.push(btn);
          }
        }

        console.log(`  버튼 확인: ${foundButtons.join(', ')}`);
        if (missingButtons.length > 0) {
          console.log(`  [WARN] 누락된 버튼: ${missingButtons.join(', ')}`);
        } else {
          console.log('  [PASS] 모든 필수 버튼 존재');
        }

        // 테스트데이터 버튼 클릭 테스트
        console.log('\n  테스트데이터 버튼 테스트...');

        // dialog 핸들러 설정
        page.once('dialog', async dialog => {
          console.log(`    Dialog: ${dialog.message()}`);
          await dialog.accept();
        });

        const testDataClicked = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent && b.textContent.includes('테스트데이터'));
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        });

        if (testDataClicked) {
          await delay(1500);

          // 테스트 데이터 입력 후 스크린샷
          await page.screenshot({
            path: path.join(screenshotDir, `${testPage.screenshot}-testdata.png`),
            fullPage: false
          });

          // 입력된 데이터 확인
          const filledInputs = await page.evaluate(() => {
            const inputs = document.querySelectorAll('input[type="text"], input[type="email"], select');
            let filled = 0;
            inputs.forEach(input => {
              if (input.value && input.value.trim() !== '' && input.value !== '자동생성' && !input.disabled) {
                filled++;
              }
            });
            return filled;
          });

          if (filledInputs > 3) {
            console.log(`  [PASS] 테스트데이터 입력 완료 (${filledInputs}개 필드)`);
          } else {
            console.log(`  [INFO] 입력된 필드 수: ${filledInputs}`);
          }
        } else {
          console.log('  [SKIP] 테스트데이터 버튼을 찾지 못함');
        }

        // 초기화 버튼 테스트
        console.log('\n  초기화 버튼 테스트...');

        page.once('dialog', async dialog => {
          console.log(`    Dialog: ${dialog.message()}`);
          await dialog.accept();
        });

        const resetClicked = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent && b.textContent.includes('초기화'));
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        });

        if (resetClicked) {
          await delay(1500);

          // 초기화 후 스크린샷
          await page.screenshot({
            path: path.join(screenshotDir, `${testPage.screenshot}-reset.png`),
            fullPage: false
          });
          console.log('  [PASS] 초기화 버튼 클릭 완료');
        } else {
          console.log('  [SKIP] 초기화 버튼을 찾지 못함');
        }

        // 신규 버튼 테스트
        console.log('\n  신규 버튼 테스트...');

        const newClicked = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent && b.textContent.includes('신규'));
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        });

        if (newClicked) {
          await delay(1000);
          console.log('  [PASS] 신규 버튼 클릭 완료');
        } else {
          console.log('  [SKIP] 신규 버튼을 찾지 못함');
        }

      } catch (pageError) {
        console.log(`  [ERROR] ${pageError.message}`);
        await page.screenshot({
          path: path.join(screenshotDir, `${testPage.screenshot}-error.png`),
          fullPage: false
        });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('테스트 완료!');
    console.log('스크린샷 저장 위치:', screenshotDir);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testCRUDButtons();
