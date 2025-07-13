const path = require('path');
const puppeteer = require('puppeteer');

async function runLudicrousIndexingTest(browser) {
  const pagePath = path.join(__dirname, 'test-ludicrous-indexing-ui.html');
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG [Ludicrous]:', msg.text()));
  // Allow file:// URIs
  await page.goto(`file://${pagePath}`);

  await page.waitForSelector('#toggle-ludicrous');
  await page.waitForSelector('#start-indexing');
  // Adjust Ludicrous multiplier to 150x for efficiency tests
  await page.evaluate(() => {
    if (window.LudicrousSpeedManager) {
      window.LudicrousSpeedManager.speedMultiplier = 150; // ↓ from 300x
    }
  });

  // Activate Ludicrous Mode & start indexing
  await page.click('#toggle-ludicrous');
  await page.click('#start-indexing');

  // Allow a moment for indexing to progress
  await new Promise(res => setTimeout(res, 5000));
  // Dump current logs for debugging
  const currentLogs = await page.evaluate(() => Array.from(document.querySelectorAll('#debug-log .log-entry')).map(e => e.textContent));
  console.log('Current logs:', currentLogs);

  // Verify that all blocks completed
  const expected = [
    'Block completed: Test Content 1',
    'Block completed: Test Content 2',
    'Session completed successfully!'
  ];

  const missing = expected.filter(exp => !currentLogs.some(l => l.includes(exp)));
  if (missing.length) {
    throw new Error(`Missing expected log lines: ${missing.join(', ')}`);
  }

  console.log('✅ Ludicrous indexing UI test passed (150x, all blocks detected)');
  await page.close();
}

async function runAutoAdvanceReceiptTest(browser) {
  const pagePath = path.join(__dirname, 'test-auto-advance-receipt.html');
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG [Receipt]:', msg.text()));
  await page.goto(`file://${pagePath}`);

  // Trigger built-in Ludicrous mode test (defaults to 300x)
  await page.click('button[onclick="testLudicrousMode()"]');

  // Allow processing time (accelerated but still ~12s simulated)
  await new Promise(res => setTimeout(res, 60000));

  const receiptLogs = await page.evaluate(() => document.getElementById('test-log').textContent);
  if (!/Auto-advance functionality working/.test(receiptLogs)) {
    throw new Error('Auto-advance receipt verification failed.');
  }

  console.log('✅ Auto-advance receipt test passed (ludicrous mode)');
  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--allow-file-access-from-files','--enable-local-file-accesses'] });
  try {
    // Relay browser console to Node
    browser.on('console', msg => console.log('BROWSER LOG:', msg.text()));

    await runLudicrousIndexingTest(browser);
    await runAutoAdvanceReceiptTest(browser);
    console.log('\n🎉 All end-to-end tests completed successfully.');
  } catch (err) {
    console.error('❌ Test suite failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})(); 