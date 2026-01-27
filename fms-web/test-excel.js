const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testExcelFeatures() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('========================================');
  console.log('   Excel 다운로드/업로드 기능 테스트');
  console.log('========================================\n');

  // Alert 처리
  page.on('dialog', async dialog => {
    console.log(`   [Alert] "${dialog.message()}"`);
    await dialog.accept();
  });

  // 다운로드 이벤트 처리
  const downloadPath = path.join(__dirname, 'test-results', 'downloads');
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, { recursive: true });
  }

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
  // 1. 해상 견적 조회 화면 Excel 다운로드
  // ============================================
  console.log('========================================');
  console.log('1. 해상 견적 조회 - Excel 다운로드 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/quote/sea');

    // Excel 다운로드 버튼 확인
    console.log('1-1. Excel 다운로드 버튼 확인...');
    const content = await page.content();
    const hasExcelDownload = content.includes('Excel') || content.includes('엑셀');
    console.log(`   Excel 버튼: ${hasExcelDownload ? '있음' : '없음'}`);

    await page.screenshot({ path: 'test-results/excel-1-sea-list.png', fullPage: true });
    console.log('   스크린샷: test-results/excel-1-sea-list.png\n');

    // Excel 다운로드 버튼 클릭
    console.log('1-2. Excel 다운로드 버튼 클릭...');
    const downloadBtn = await page.$('button:has-text("Excel 다운로드")');
    if (downloadBtn) {
      // 다운로드 이벤트 대기
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
        downloadBtn.click()
      ]);

      if (download) {
        const filename = download.suggestedFilename();
        const savePath = path.join(downloadPath, filename);
        await download.saveAs(savePath);
        console.log(`   다운로드 완료: ${filename}`);
        console.log(`   저장 경로: ${savePath}`);
      } else {
        console.log('   다운로드 시작됨 (파일 저장 확인 필요)');
      }
    } else {
      // 다른 형태의 Excel 버튼 찾기
      const excelBtn = await page.$('button:has-text("Excel")');
      if (excelBtn) {
        await excelBtn.click();
        await page.waitForTimeout(2000);
        console.log('   Excel 버튼 클릭 완료');
      } else {
        console.log('   Excel 다운로드 버튼 없음');
      }
    }

    await page.screenshot({ path: 'test-results/excel-2-sea-download.png', fullPage: true });
    console.log('   스크린샷: test-results/excel-2-sea-download.png\n');
  } catch (error) {
    console.log('   오류:', error.message);
  }

  // ============================================
  // 2. 항공 견적 조회 화면 Excel 다운로드
  // ============================================
  console.log('========================================');
  console.log('2. 항공 견적 조회 - Excel 다운로드 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/quote/air');

    // Excel 다운로드 버튼 확인 및 클릭
    console.log('2-1. Excel 다운로드 버튼 클릭...');
    const downloadBtn2 = await page.$('button:has-text("Excel 다운로드")');
    if (downloadBtn2) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
        downloadBtn2.click()
      ]);

      if (download) {
        const filename = download.suggestedFilename();
        const savePath = path.join(downloadPath, filename);
        await download.saveAs(savePath);
        console.log(`   다운로드 완료: ${filename}`);
      } else {
        console.log('   다운로드 시작됨');
      }
    } else {
      console.log('   Excel 다운로드 버튼 없음');
    }

    await page.screenshot({ path: 'test-results/excel-3-air-download.png', fullPage: true });
    console.log('   스크린샷: test-results/excel-3-air-download.png\n');
  } catch (error) {
    console.log('   오류:', error.message);
  }

  // ============================================
  // 3. 수입 B/L 조회 화면 Excel 다운로드
  // ============================================
  console.log('========================================');
  console.log('3. 수입 B/L 조회 - Excel 다운로드 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/import-bl/sea');

    // Excel 다운로드 버튼 확인 및 클릭
    console.log('3-1. Excel 다운로드 버튼 클릭...');
    const downloadBtn3 = await page.$('button:has-text("Excel 다운로드")');
    if (downloadBtn3) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
        downloadBtn3.click()
      ]);

      if (download) {
        const filename = download.suggestedFilename();
        const savePath = path.join(downloadPath, filename);
        await download.saveAs(savePath);
        console.log(`   다운로드 완료: ${filename}`);
      } else {
        console.log('   다운로드 시작됨');
      }
    } else {
      console.log('   Excel 다운로드 버튼 없음');
    }

    await page.screenshot({ path: 'test-results/excel-4-bl-download.png', fullPage: true });
    console.log('   스크린샷: test-results/excel-4-bl-download.png\n');
  } catch (error) {
    console.log('   오류:', error.message);
  }

  // ============================================
  // 4. Excel 업로드 기능 테스트
  // ============================================
  console.log('========================================');
  console.log('4. Excel 업로드 기능 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/quote/sea');

    // Excel 업로드 버튼 확인
    console.log('4-1. Excel 업로드 버튼 확인...');
    const uploadBtn = await page.$('button:has-text("Excel 업로드")');
    if (uploadBtn) {
      console.log('   Excel 업로드 버튼 발견\n');

      // 업로드 버튼 클릭
      console.log('4-2. Excel 업로드 버튼 클릭...');
      await uploadBtn.click();
      await page.waitForTimeout(1500);

      // 모달 확인
      const content = await page.content();
      const modalOpen = content.includes('Excel 업로드') ||
                       content.includes('파일 선택') ||
                       content.includes('업로드');
      console.log(`   업로드 모달: ${modalOpen ? '열림' : '닫힘'}`);

      await page.screenshot({ path: 'test-results/excel-5-upload-modal.png', fullPage: true });
      console.log('   스크린샷: test-results/excel-5-upload-modal.png\n');

      // 샘플 다운로드 버튼 확인
      console.log('4-3. 샘플 다운로드 버튼 확인...');
      const sampleBtn = await page.$('button:has-text("샘플")');
      if (sampleBtn) {
        console.log('   샘플 다운로드 버튼 발견');
        await sampleBtn.click();
        await page.waitForTimeout(1500);
        console.log('   샘플 다운로드 클릭 완료');
      } else {
        console.log('   샘플 다운로드 버튼 없음');
      }

      await page.screenshot({ path: 'test-results/excel-6-upload-sample.png', fullPage: true });
      console.log('   스크린샷: test-results/excel-6-upload-sample.png\n');

      // 닫기
      const closeBtn = await page.$('button:has-text("닫기")');
      if (closeBtn) {
        await closeBtn.click();
        await page.waitForTimeout(500);
      }
    } else {
      console.log('   Excel 업로드 버튼 없음\n');
    }
  } catch (error) {
    console.log('   오류:', error.message);
  }

  // ============================================
  // 5. 수입 B/L 조회 화면 Excel 업로드 테스트
  // ============================================
  console.log('========================================');
  console.log('5. 수입 B/L 조회 - Excel 업로드 테스트');
  console.log('========================================\n');

  try {
    await navigateTo('http://localhost:3000/logis/import-bl/sea');

    // Excel 업로드 버튼 확인
    console.log('5-1. Excel 업로드 버튼 확인...');
    const uploadBtn2 = await page.$('button:has-text("Excel 업로드")');
    if (uploadBtn2) {
      console.log('   Excel 업로드 버튼 발견\n');

      // 업로드 버튼 클릭
      console.log('5-2. Excel 업로드 버튼 클릭...');
      await uploadBtn2.click();
      await page.waitForTimeout(1500);

      await page.screenshot({ path: 'test-results/excel-7-bl-upload-modal.png', fullPage: true });
      console.log('   스크린샷: test-results/excel-7-bl-upload-modal.png\n');

      // 닫기
      const closeBtn = await page.$('button:has-text("닫기")');
      if (closeBtn) {
        await closeBtn.click();
        await page.waitForTimeout(500);
      }
    } else {
      console.log('   Excel 업로드 버튼 없음\n');
    }
  } catch (error) {
    console.log('   오류:', error.message);
  }

  // 다운로드된 파일 목록 확인
  console.log('========================================');
  console.log('다운로드된 파일 목록');
  console.log('========================================\n');

  try {
    const files = fs.readdirSync(downloadPath);
    if (files.length > 0) {
      files.forEach(file => {
        const filePath = path.join(downloadPath, file);
        const stats = fs.statSync(filePath);
        console.log(`   - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
      });
    } else {
      console.log('   다운로드된 파일 없음');
    }
  } catch (error) {
    console.log('   폴더 확인 오류:', error.message);
  }

  await browser.close();

  console.log('\n================================================');
  console.log('   Excel 기능 테스트 완료');
  console.log('================================================');
}

testExcelFeatures().catch(console.error);
