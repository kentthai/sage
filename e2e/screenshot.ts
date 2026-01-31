import { chromium } from '@playwright/test';

const url = process.argv[2] || 'http://localhost:5173';
const output = process.argv[3] || '/tmp/sage-screenshot.png';

async function takeScreenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: output, fullPage: false });
  await browser.close();
  console.log(`Screenshot saved to: ${output}`);
}

takeScreenshot();
