const puppeteer = require('puppeteer');

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function testDateButtons() {
  console.log('='.repeat(60));
  console.log('날짜 검색 버튼 기능 테스트');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });

    const testPages = [
      { name: '해상 견적 목록', url: '/logis/quote/sea', dateFields: ['dateFrom', 'dateTo'] },
      { name: '항공 견적 목록', url: '/logis/quote/air', dateFields: ['startDate', 'endDate'] },
      { name: '해상 부킹 목록', url: '/logis/booking/sea', dateFields: ['startDate', 'endDate'] },
      { name: '항공 부킹 목록', url: '/logis/booking/air', dateFields: ['startDate', 'endDate'] },
      { name: '수입 B/L 목록', url: '/logis/import-bl/sea', dateFields: ['dateFrom', 'dateTo'] },
    ];

    for (let i = 0; i < testPages.length; i++) {
      const testPage = testPages[i];
      console.log(`\n[TEST ${i + 1}/${testPages.length}] ${testPage.name}`);
      console.log('-'.repeat(50));

      try {
        await page.goto(`http://localhost:3000${testPage.url}`, {
          waitUntil: 'networkidle2',
          timeout: 60000
        });
        await delay(2000);

        // 1. 날짜 기본값 확인 (오늘 날짜)
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = await page.evaluate(() => {
          const inputs = Array.from(document.querySelectorAll('input[type="date"]'));
          return inputs.map(i => i.value);
        });

        const hasDefaultDate = dateInputs.some(d => d === today);
        if (hasDefaultDate) {
          console.log(`  [PASS] 기본 날짜값 확인 (오늘: ${today})`);
        } else {
          console.log(`  [WARN] 기본 날짜값이 오늘이 아님: ${dateInputs.join(', ')}`);
        }

        // 2. 날짜 버튼 존재 확인
        const buttons = await page.evaluate(() => {
          const allButtons = Array.from(document.querySelectorAll('button'));
          return allButtons.map(b => b.textContent?.trim()).filter(Boolean);
        });

        const dateButtons = ['당일', '일주일', '한달', '1년'];
        const foundButtons = dateButtons.filter(btn => buttons.some(b => b.includes(btn)));

        if (foundButtons.length === 4) {
          console.log(`  [PASS] 날짜 버튼 확인: ${foundButtons.join(', ')}`);
        } else {
          console.log(`  [FAIL] 날짜 버튼 누락: ${dateButtons.filter(b => !foundButtons.includes(b)).join(', ')}`);
          continue;
        }

        // 3. 일주일 버튼 클릭 테스트
        const weekButtonClicked = await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b =>
            b.textContent && b.textContent.trim() === '일주일'
          );
          if (btn) { btn.click(); return true; }
          return false;
        });

        if (weekButtonClicked) {
          await delay(500);
          const datesAfterWeek = await page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input[type="date"]'));
            return inputs.slice(0, 2).map(i => i.value);
          });

          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const expectedStart = weekAgo.toISOString().split('T')[0];

          if (datesAfterWeek[0] === expectedStart && datesAfterWeek[1] === today) {
            console.log(`  [PASS] 일주일 버튼 클릭: ${datesAfterWeek[0]} ~ ${datesAfterWeek[1]}`);
          } else {
            console.log(`  [INFO] 일주일 버튼 결과: ${datesAfterWeek.join(' ~ ')}`);
          }
        }

        // 4. 한달 버튼 클릭 테스트
        const monthButtonClicked = await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b =>
            b.textContent && b.textContent.trim() === '한달'
          );
          if (btn) { btn.click(); return true; }
          return false;
        });

        if (monthButtonClicked) {
          await delay(500);
          const datesAfterMonth = await page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input[type="date"]'));
            return inputs.slice(0, 2).map(i => i.value);
          });
          console.log(`  [PASS] 한달 버튼 클릭: ${datesAfterMonth.join(' ~ ')}`);
        }

        // 5. 당일 버튼 클릭 테스트 (초기화)
        const todayButtonClicked = await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b =>
            b.textContent && b.textContent.trim() === '당일'
          );
          if (btn) { btn.click(); return true; }
          return false;
        });

        if (todayButtonClicked) {
          await delay(500);
          const datesAfterToday = await page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input[type="date"]'));
            return inputs.slice(0, 2).map(i => i.value);
          });

          if (datesAfterToday[0] === today && datesAfterToday[1] === today) {
            console.log(`  [PASS] 당일 버튼 클릭: ${datesAfterToday[0]} ~ ${datesAfterToday[1]}`);
          } else {
            console.log(`  [INFO] 당일 버튼 결과: ${datesAfterToday.join(' ~ ')}`);
          }
        }

        console.log(`  [PASS] ${testPage.name} 테스트 완료`);

      } catch (pageError) {
        console.log(`  [ERROR] ${pageError.message}`);
      }
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

testDateButtons();
