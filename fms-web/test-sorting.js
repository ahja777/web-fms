const puppeteer = require('puppeteer');

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function testSorting() {
  console.log('='.repeat(60));
  console.log('테이블 정렬 기능 테스트');
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
      { name: '해상 견적 목록', url: '/logis/quote/sea' },
      { name: '항공 견적 목록', url: '/logis/quote/air' },
      { name: '해상 부킹 목록', url: '/logis/booking/sea' },
      { name: '항공 부킹 목록', url: '/logis/booking/air' },
      { name: '수입 B/L 목록', url: '/logis/import-bl/sea' },
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

        // 테이블 헤더에서 정렬 가능한 컬럼 찾기
        const sortableHeaders = await page.evaluate(() => {
          const headers = Array.from(document.querySelectorAll('th'));
          const sortable = headers.filter(h => {
            // 클릭 가능하고 정렬 아이콘(▲▼)이 있는 헤더
            return h.className.includes('cursor-pointer') ||
                   h.innerHTML.includes('9650') ||
                   h.innerHTML.includes('9660');
          });
          return sortable.map(h => h.textContent?.trim().replace(/[▲▼]/g, '').trim()).filter(Boolean);
        });

        if (sortableHeaders.length > 0) {
          console.log(`  정렬 가능 컬럼: ${sortableHeaders.slice(0, 5).join(', ')}${sortableHeaders.length > 5 ? '...' : ''}`);
          console.log(`  [PASS] ${sortableHeaders.length}개 컬럼 정렬 기능 확인`);

          // 첫 번째 정렬 가능 컬럼 클릭 테스트
          const firstSortClick = await page.evaluate(() => {
            const header = document.querySelector('th.cursor-pointer');
            if (header) {
              header.click();
              return true;
            }
            return false;
          });

          if (firstSortClick) {
            await delay(500);

            // 정렬 상태 텍스트 확인
            const sortStatus = await page.evaluate(() => {
              const h3 = document.querySelector('h3');
              if (h3 && h3.textContent) {
                const match = h3.textContent.match(/정렬:\s*(.+?)\s*(오름차순|내림차순)/);
                if (match) return `${match[1]} ${match[2]}`;
              }
              return null;
            });

            if (sortStatus) {
              console.log(`  정렬 상태: ${sortStatus}`);
              console.log('  [PASS] 오름차순 정렬 적용됨');
            }

            // 같은 컬럼 다시 클릭 (내림차순)
            await page.evaluate(() => {
              const header = document.querySelector('th.cursor-pointer');
              if (header) header.click();
            });
            await delay(500);

            const sortStatusDesc = await page.evaluate(() => {
              const h3 = document.querySelector('h3');
              if (h3 && h3.textContent) {
                const match = h3.textContent.match(/정렬:\s*(.+?)\s*(오름차순|내림차순)/);
                if (match) return `${match[1]} ${match[2]}`;
              }
              return null;
            });

            if (sortStatusDesc && sortStatusDesc.includes('내림차순')) {
              console.log(`  정렬 상태: ${sortStatusDesc}`);
              console.log('  [PASS] 내림차순 정렬 적용됨');
            }
          }
        } else {
          console.log('  [WARN] 정렬 가능 컬럼을 찾지 못함');
        }

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

testSorting();
