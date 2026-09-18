const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });
  
  try {
    // 1. Dashboard & Demo Preset loading
    console.log('Navigating to /dashboard...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Click Demo Presets button if visible
    const presetBtn = page.locator('button:has-text("Demo Presets")').first();
    if (await presetBtn.isVisible()) {
      console.log('Opening Demo Presets modal...');
      await presetBtn.click();
      await page.waitForTimeout(600);
      const applyBtn = page.locator('button:has-text("Load Scenario")').first();
      if (await applyBtn.isVisible()) {
        console.log('Applying Demo Preset...');
        await applyBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    // Capture Dashboard with new Overview visual
    console.log('Capturing Dashboard Overview visual...');
    await page.screenshot({ path: path.join(__dirname, 'test_dashboard_overview.png'), fullPage: true });
    console.log('Saved test_dashboard_overview.png');

    // 2. Go to stress test
    console.log('Navigating to /stress-test...');
    await page.goto('http://localhost:3000/stress-test', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const runBtn = page.locator('button:has-text("Execute Stress Test")').first();
    if (await runBtn.isVisible()) {
      console.log('Executing Stress Test Simulation...');
      await runBtn.click();
      await page.waitForTimeout(3000);
    }
    await page.screenshot({ path: path.join(__dirname, 'test_stress_chart.png'), fullPage: true });
    console.log('Saved test_stress_chart.png');

    // 3. Go to survival map
    console.log('Navigating to /survival...');
    await page.goto('http://localhost:3000/survival', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(__dirname, 'test_survival_chart.png'), fullPage: true });
    console.log('Saved test_survival_chart.png');

    console.log('✅ All chart verification screenshots captured successfully!');
  } catch (err) {
    console.error('Error during chart check:', err);
  } finally {
    await browser.close();
  }
})();
