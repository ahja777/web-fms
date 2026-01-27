const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testExcelBL() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    acceptDownloads: true
  });
  const page = await context.newPage();

  console.log('========================================');
  console.log('   수입 B/L Excel 다운로드/업로드 테스트');
  console.log('========================================\n');

  // 다운로드 경로 설정
  const downloadPath = path.join(__dirname, 'test-results', 'downloads');
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, { recursive: true });
  }

  // Alert 처리
  page.on('dialog', async dialog => {
    console.log(`   [Alert] "${dialog.message()}"`);
    await dialog.accept();
  });

  // 안정적인 페이지 이동
  async function stableNavigate(url) {
    for (let i = 0; i < 3; i++) {
      try {
        await page.goto(url, { timeout: 30000, waitUntil: 'load' });
        await page.waitForTimeout(3000);
        // 페이지 안정화 대기
        await page.waitForFunction(() => document.readyState === 'complete', { timeout: 10000 });
        await page.waitForTimeout(2000);
        return true;
      } catch (err) {
        console.log(`   재시도 ${i + 1}/3...`);
        await page.waitForTimeout(2000);
      }
    }
    return false;
  }

  try {
    // 수입 B/L 조회 화면 이동
    console.log('1. 수입 B/L 조회 화면 이동...');
    const loaded = await stableNavigate('http://localhost:3000/logis/import-bl/sea');
    if (!loaded) {
      console.log('   페이지 로드 실패');
      return;
    }
    console.log('   페이지 로드 완료\n');

    await page.screenshot({ path: 'test-results/excel-bl-1-page.png', fullPage: true });
    console.log('   스크린샷: test-results/excel-bl-1-page.png\n');

    // 페이지 내용 확인
    let content;
    try {
      content = await page.content();
      console.log('2. 버튼 확인...');
      console.log(`   - Excel 다운로드: ${content.includes('Excel 다운로드') ? '있음' : '없음'}`);
      console.log(`   - Excel 업로드: ${content.includes('Excel 업로드') ? '있음' : '없음'}\n`);
    } catch (err) {
      console.log('   페이지 내용 확인 오류, 계속 진행...\n');
    }

    // ============================================
    // Excel 다운로드 테스트
    // ============================================
    console.log('========================================');
    console.log('3. Excel 다운로드 테스트');
    console.log('========================================\n');

    try {
      const downloadBtn = await page.$('button:has-text("Excel 다운로드")');
      if (downloadBtn) {
        console.log('3-1. Excel 다운로드 버튼 클릭...');

        // 다운로드 이벤트 대기
        const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
        await downloadBtn.click();

        try {
          const download = await downloadPromise;
          const filename = download.suggestedFilename();
          const savePath = path.join(downloadPath, filename);
          await download.saveAs(savePath);

          const stats = fs.statSync(savePath);
          console.log(`   다운로드 완료!`);
          console.log(`   - 파일명: ${filename}`);
          console.log(`   - 크기: ${(stats.size / 1024).toFixed(2)} KB`);
          console.log(`   - 경로: ${savePath}\n`);
        } catch (err) {
          console.log('   다운로드 대기 시간 초과:', err.message, '\n');
        }
      } else {
        console.log('   Excel 다운로드 버튼 없음\n');
      }
    } catch (err) {
      console.log('   다운로드 테스트 오류:', err.message, '\n');
    }

    await page.screenshot({ path: 'test-results/excel-bl-2-download.png', fullPage: true });
    console.log('   스크린샷: test-results/excel-bl-2-download.png\n');

    // ============================================
    // Excel 업로드 테스트
    // ============================================
    console.log('========================================');
    console.log('4. Excel 업로드 테스트');
    console.log('========================================\n');

    try {
      const uploadBtn = await page.$('button:has-text("Excel 업로드")');
      if (uploadBtn) {
        console.log('4-1. Excel 업로드 버튼 클릭...');
        await uploadBtn.click();
        await page.waitForTimeout(2000);

        await page.screenshot({ path: 'test-results/excel-bl-3-upload-modal.png', fullPage: true });
        console.log('   스크린샷: test-results/excel-bl-3-upload-modal.png\n');

        // 모달 내용 확인
        try {
          const modalContent = await page.content();
          const hasDropzone = modalContent.includes('드래그') || modalContent.includes('drag') || modalContent.includes('파일');
          const hasSample = modalContent.includes('샘플') || modalContent.includes('양식');
          console.log(`   - 파일 드롭존: ${hasDropzone ? '있음' : '없음'}`);
          console.log(`   - 샘플 다운로드: ${hasSample ? '있음' : '없음'}\n`);
        } catch (err) {
          console.log('   모달 내용 확인 오류\n');
        }

        // 샘플 다운로드 버튼 확인
        console.log('4-2. 샘플 양식 다운로드...');
        const sampleBtn = await page.$('button:has-text("샘플")');
        if (sampleBtn) {
          console.log('   샘플 다운로드 버튼 발견');
          try {
            const sampleDownloadPromise = page.waitForEvent('download', { timeout: 10000 });
            await sampleBtn.click();

            const sampleDownload = await sampleDownloadPromise;
            const sampleFilename = sampleDownload.suggestedFilename();
            const samplePath = path.join(downloadPath, sampleFilename);
            await sampleDownload.saveAs(samplePath);

            const stats = fs.statSync(samplePath);
            console.log(`   샘플 다운로드 완료!`);
            console.log(`   - 파일명: ${sampleFilename}`);
            console.log(`   - 크기: ${(stats.size / 1024).toFixed(2)} KB\n`);
          } catch (err) {
            console.log('   샘플 다운로드 오류:', err.message, '\n');
          }
        } else {
          console.log('   샘플 다운로드 버튼 없음\n');
        }

        await page.screenshot({ path: 'test-results/excel-bl-4-sample.png', fullPage: true });
        console.log('   스크린샷: test-results/excel-bl-4-sample.png\n');

        // 모달 닫기
        const closeBtn = await page.$('button:has-text("닫기")');
        const cancelBtn = await page.$('button:has-text("취소")');
        const xBtn = await page.$('button[aria-label="Close"]');
        if (closeBtn) {
          await closeBtn.click();
          console.log('   모달 닫기 완료\n');
        } else if (cancelBtn) {
          await cancelBtn.click();
          console.log('   모달 취소 완료\n');
        } else if (xBtn) {
          await xBtn.click();
          console.log('   모달 X 버튼으로 닫기 완료\n');
        }
      } else {
        console.log('   Excel 업로드 버튼 없음\n');
      }
    } catch (err) {
      console.log('   업로드 테스트 오류:', err.message, '\n');
    }

    // ============================================
    // 다운로드된 파일 목록
    // ============================================
    console.log('========================================');
    console.log('5. 다운로드된 파일 목록');
    console.log('========================================\n');

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
    console.error('\n오류:', error.message);
    await page.screenshot({ path: 'test-results/excel-bl-error.png', fullPage: true }).catch(() => {});
  }

  await browser.close();

  console.log('\n================================================');
  console.log('   Excel 테스트 완료');
  console.log('================================================');
}

testExcelBL().catch(console.error);
