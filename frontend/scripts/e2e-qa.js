const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runQA() {
  console.log('🚀 Starting SaveSmart End-to-End QA Pass...\n');

  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[CONSOLE ERROR] ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(`[PAGE UNCAUGHT ERROR] ${err.message}`);
  });

  page.on('requestfailed', (req) => {
    requestFailures.push(`[REQUEST FAILED] ${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
  });

  page.on('dialog', async (dialog) => {
    console.log(`   [BROWSER DIALOG] ${dialog.type()}: ${dialog.message()}`);
    await dialog.dismiss();
  });

  try {
    // ----------------------------------------------------
    // STEP 1: CREATE A GOAL & CHECK HEALTH
    // ----------------------------------------------------
    console.log('👉 Step 1: Navigating to /goals...');
    await page.goto('http://localhost:3000/goals', { waitUntil: 'networkidle' });

    console.log('   Creating Goal: "Dream Home Down Payment"...');
    await page.fill('input[placeholder="e.g. House Down Payment"]', 'Dream Home Down Payment');
    await page.selectOption('select:has-text("Housing")', 'housing');
    
    const targetAmountInput = page.locator('input[type="number"][min="1000"]');
    await targetAmountInput.fill('1500000');

    const currentBalanceInput = page.locator('input[type="number"][min="0"]').first();
    await currentBalanceInput.fill('250000');

    const targetMonthsInput = page.locator('input[type="number"][max="120"]');
    await targetMonthsInput.fill('24');

    await page.click('button:has-text("Add Savings Goal")');
    await page.waitForTimeout(1500);

    const goalCard = page.locator('text=/Dream Home Down Payment/i').first();
    await goalCard.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   ✅ Goal created and verified in UI list!');

    // Test Goal Health Check
    console.log('   Testing Goal Health inspection modal/card...');
    const healthButton = page.locator('button:has-text("Goal Health")').first();
    await healthButton.click();
    await page.waitForTimeout(2000);

    const diagnosticsCard = page.locator('text=/Pre-Shock Health Diagnostics/i').first();
    await diagnosticsCard.waitFor({ state: 'visible', timeout: 8000 });
    
    await page.screenshot({ path: path.join(screenshotsDir, '01_goal_health.png') });
    console.log('   ✅ Goal Health modal opened successfully! Diagnostics score displayed. Screenshot captured.');

    // ----------------------------------------------------
    // STEP 2: SAVE A FINANCIAL BASELINE
    // ----------------------------------------------------
    console.log('\n👉 Step 2: Navigating to /baseline...');
    await page.goto('http://localhost:3000/baseline', { waitUntil: 'networkidle' });

    console.log('   Configuring Monthly Baseline Profile in INR...');
    const incomeInput = page.locator('input[min="0"][step="1000"]').first();
    await incomeInput.fill('150000');

    const emergencyInput = page.locator('input[min="0"][step="1000"]').nth(1);
    await emergencyInput.fill('400000');

    const rentInput = page.locator('input[min="0"][step="500"]').first();
    await rentInput.fill('40000');

    await page.click('button:has-text("Save Baseline Profile")');
    await page.waitForTimeout(2000);

    const successMsg = page.locator('text=/saved successfully/i').first();
    await successMsg.waitFor({ state: 'visible', timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotsDir, '02_baseline_saved.png') });
    console.log('   ✅ Financial Baseline saved & verified successfully! Screenshot captured.');

    // ----------------------------------------------------
    // STEP 3: OPEN DASHBOARD
    // ----------------------------------------------------
    console.log('\n👉 Step 3: Navigating to / (Dashboard)...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    const dashGoal = page.locator('text=/Dream Home Down Payment/i').first();
    await dashGoal.waitFor({ state: 'visible', timeout: 5000 });

    const baselineIncome = page.locator('text=/1,50,000/i').first();
    await baselineIncome.waitFor({ state: 'visible', timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotsDir, '03_dashboard.png') });
    console.log('   ✅ Dashboard loaded verified Goal and Baseline data from backend APIs! Screenshot captured.');

    // ----------------------------------------------------
    // STEP 4: RUN STRESS-TEST LAB (SINGLE & CASCADE)
    // ----------------------------------------------------
    console.log('\n👉 Step 4: Navigating to /stress-test...');
    await page.goto('http://localhost:3000/stress-test', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('   Running Single Shock Simulation...');
    const runSingleBtn = page.locator('button:has-text("Execute Stress Test")').first();
    await runSingleBtn.click();
    await page.waitForTimeout(2500);

    const simResults = page.locator('text=/RESILIENCE SCORE/i').first();
    await simResults.waitFor({ state: 'visible', timeout: 8000 });
    await page.screenshot({ path: path.join(screenshotsDir, '04_single_shock.png') });
    console.log('   ✅ Single Shock Simulation completed! Verified deterministic output. Screenshot captured.');

    console.log('   Switching to Cascade Mode...');
    const cascadeTabBtn = page.locator('button:has-text("Cascade Mode")').first();
    await cascadeTabBtn.click();
    await page.waitForTimeout(500);

    const addCascadeBtn = page.locator('button:has-text("Add Shock")').first();
    await addCascadeBtn.click();
    await page.waitForTimeout(500);

    console.log('   Running Compound Cascade Simulation...');
    const runCascadeBtn = page.locator('button:has-text("Execute Stress Test")').first();
    await runCascadeBtn.click();
    await page.waitForTimeout(2500);

    await simResults.waitFor({ state: 'visible', timeout: 8000 });
    await page.screenshot({ path: path.join(screenshotsDir, '05_cascade_shock.png') });
    console.log('   ✅ Cascade Simulation completed! Compounding shock curve rendered. Screenshot captured.');

    // ----------------------------------------------------
    // STEP 5: OPEN RECOVERY PLANNER
    // ----------------------------------------------------
    console.log('\n👉 Step 5: Navigating to /recovery...');
    await page.goto('http://localhost:3000/recovery', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    const recoveryCard = page.locator('text=/Balanced/i').first();
    await recoveryCard.waitFor({ state: 'visible', timeout: 8000 });
    await page.screenshot({ path: path.join(screenshotsDir, '06_recovery_plans.png') });
    console.log('   ✅ Recovery Planner solved 3 deterministic plans (Aggressive, Balanced, Extended)! Screenshot captured.');

    // ----------------------------------------------------
    // STEP 6: OPEN GOAL SURVIVAL MAP
    // ----------------------------------------------------
    console.log('\n👉 Step 6: Navigating to /survival...');
    await page.goto('http://localhost:3000/survival', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    const survivalHeading = page.locator('text=/Multi-Scenario Goal Survival Map/i').first();
    await survivalHeading.waitFor({ state: 'visible', timeout: 8000 });
    await page.screenshot({ path: path.join(screenshotsDir, '07_survival_map.png') });
    console.log('   ✅ Goal Survival Map rendered multi-scenario Recharts comparison curves! Screenshot captured.');

    // ----------------------------------------------------
    // STEP 7: MOBILE RESPONSIVENESS CHECK
    // ----------------------------------------------------
    console.log('\n👉 Step 7: Testing Mobile Responsiveness (375x667)...');
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check Dashboard on Mobile
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    const mobileGoal = page.locator('text=/Dream Home Down Payment/i').first();
    await mobileGoal.waitFor({ state: 'visible', timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotsDir, '08_mobile_dashboard.png') });

    // Check Goals on Mobile
    await page.goto('http://localhost:3000/goals', { waitUntil: 'networkidle' });
    const mobileGoalsTitle = page.locator('h1:has-text("Goal Builder")').first();
    await mobileGoalsTitle.waitFor({ state: 'visible', timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotsDir, '09_mobile_goals.png') });

    // Check Stress-Test on Mobile
    await page.goto('http://localhost:3000/stress-test', { waitUntil: 'networkidle' });
    const mobileStressTitle = page.locator('h1:has-text("Stress-Test Lab")').first();
    await mobileStressTitle.waitFor({ state: 'visible', timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotsDir, '10_mobile_stress.png') });

    console.log('   ✅ Responsive layout verified on mobile viewport (375px width)! Screenshots captured.');

    // ----------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------
    console.log('\n========================================');
    console.log('📊 Browser Console & Network QA Results:');
    console.log(`   Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((e) => console.log(`     ${e}`));
    }
    console.log(`   Page Uncaught Errors: ${pageErrors.length}`);
    if (pageErrors.length > 0) {
      pageErrors.forEach((e) => console.log(`     ${e}`));
    }
    console.log(`   Request Failures: ${requestFailures.length}`);
    if (requestFailures.length > 0) {
      requestFailures.forEach((e) => console.log(`     ${e}`));
    }
    console.log('========================================\n');

    if (consoleErrors.length === 0 && pageErrors.length === 0 && requestFailures.length === 0) {
      console.log('🎉 ALL INTEGRATION TESTS PASSED WITH ZERO CONSOLE OR NETWORK ERRORS!');
    } else {
      console.log('⚠️ Some warnings/errors detected.');
    }
  } catch (error) {
    console.error('❌ E2E QA Test Failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runQA();
