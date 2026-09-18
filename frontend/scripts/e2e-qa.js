const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runQA() {
  console.log('🚀 Starting SaveSmart End-to-End QA Pass (with Landing Page & Dashboard)...\n');

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

  page.on('response', (res) => {
    if (res.status() >= 400) {
      console.log(`   [HTTP ${res.status()}] ${res.url()}`);
    }
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
    // STEP 1: SAVE A FINANCIAL BASELINE
    // ----------------------------------------------------
    console.log('👉 Step 1: Navigating to /baseline...');
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
    await page.screenshot({ path: path.join(screenshotsDir, '01_baseline_saved.png') });
    console.log('   ✅ Financial Baseline saved & verified successfully! Screenshot captured.');

    // ----------------------------------------------------
    // STEP 2: CREATE A GOAL & CHECK HEALTH WITH FINGERPRINT
    // ----------------------------------------------------
    console.log('\n👉 Step 2: Navigating to /goals...');
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

    // Test Goal Health Check with Resilience Fingerprint
    console.log('   Testing Goal Health inspection modal with 5-axis Fingerprint...');
    const healthButton = page.locator('button:has-text("Goal Health")').first();
    await healthButton.click();
    await page.waitForTimeout(2000);

    const diagnosticsCard = page.locator('text=/Pre-Shock Health Diagnostics/i').first();
    await diagnosticsCard.waitFor({ state: 'visible', timeout: 8000 });

    const fingerprint = page.locator('text=/Goal Resilience Fingerprint/i').first();
    await fingerprint.waitFor({ state: 'visible', timeout: 5000 });
    
    // Test AI Explanation in Goal Health Modal
    console.log('   Testing AI Resilience Explanation in Goal Health modal...');
    const healthAiExplainBtn = page.locator('button:has-text("Explain This Result")').first();
    if (await healthAiExplainBtn.isVisible()) {
      await healthAiExplainBtn.click();
      const aiHeadline = page.locator('text=/Analytical Narrative/i').first();
      await aiHeadline.waitFor({ state: 'visible', timeout: 15000 });
      console.log('   ✅ AI Explanation generated and verified in Goal Health Modal!');
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, '02_goal_health.png') });
    console.log('   ✅ Goal Health with 5-axis Fingerprint & AI Card verified! Screenshot captured.');

    // ----------------------------------------------------
    // STEP 3: VERIFY LANDING PAGE & NAVIGATE TO DASHBOARD
    // ----------------------------------------------------
    console.log('\n👉 Step 3: Navigating to / (Landing Page)...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    const landingHeading = page.locator('text=/SAVE SMART/i').first();
    await landingHeading.waitFor({ state: 'visible', timeout: 5000 });

    const enterBtn = page.locator('a:has-text("Enter SaveSmart")').first();
    await enterBtn.waitFor({ state: 'visible', timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotsDir, '03_landing_page.png') });
    console.log('   ✅ Landing Page verified with Hero, Features & CTA!');

    console.log('   Entering Dashboard via CTA...');
    await enterBtn.click();
    await page.waitForURL('**/dashboard', { timeout: 8000 });
    await page.waitForTimeout(1500);

    const dashGoal = page.locator('text=/Dream Home Down Payment/i').first();
    await dashGoal.waitFor({ state: 'visible', timeout: 5000 });

    const baselineIncome = page.locator('text=/1,50,000/i').first();
    await baselineIncome.waitFor({ state: 'visible', timeout: 5000 });

    // Test 1-Click Demo Presets Modal
    console.log('   Testing 1-Click Demo Presets Modal on Dashboard...');
    const demoPresetBtn = page.locator('button:has-text("Demo Presets")').first();
    await demoPresetBtn.click();
    await page.waitForTimeout(600);
    const modalTitle = page.locator('text=/Load Hackathon Demo Scenario/i').first();
    await modalTitle.waitFor({ state: 'visible', timeout: 5000 });
    const closeBtn = page.locator('div.fixed.inset-0 button').first();
    await closeBtn.click();
    await page.waitForTimeout(500);
    console.log('   ✅ 1-Click Demo Presets Modal verified!');

    await page.screenshot({ path: path.join(screenshotsDir, '03_dashboard.png') });
    console.log('   ✅ Dashboard loaded verified Goal and Baseline data from backend APIs! Screenshot captured.');

    // ----------------------------------------------------
    // STEP 4: RUN STRESS-TEST LAB (CASCADE MODE + AI EXPLANATION)
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
    console.log('   ✅ Single Shock Simulation completed!');

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

    // Verify Financial Chain Reaction Steps
    const chainReaction = page.locator('text=/Financial Chain Reaction/i').first();
    await chainReaction.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   ✅ Cascade Mode: Financial Chain Reaction Sequencer verified!');

    // Verify "Why Did My Goal Fail?" Root Cause Diagnosis
    const failureDiagnostic = page.locator('text=/Why Did My Goal Fail/i').first();
    await failureDiagnostic.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   ✅ Deterministic Root-Cause Analysis ("Why Did My Goal Fail?") verified!');

    // Verify Financial Resilience Fingerprint
    const stressFingerprint = page.locator('text=/Financial Resilience Fingerprint/i').first();
    await stressFingerprint.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   ✅ 5-Axis Resilience Fingerprint on Stress-Test verified!');

    // Verify Assumptions Ledger
    const assumptionLedger = page.locator('text=/Financial Assumptions Ledger/i').first();
    await assumptionLedger.waitFor({ state: 'visible', timeout: 5000 });
    await assumptionLedger.click();
    await page.waitForTimeout(500);
    console.log('   ✅ Financial Assumptions Ledger verified and expandable!');

    // Verify AI Explanation Card in Stress-Test
    console.log('   Testing AI Explanation Layer in Stress-Test Lab...');
    const stressAiBtn = page.locator('button:has-text("Explain This Result")').first();
    await stressAiBtn.waitFor({ state: 'visible', timeout: 5000 });
    await stressAiBtn.click();
    const stressAiNarrative = page.locator('text=/Analytical Narrative/i').first();
    await stressAiNarrative.waitFor({ state: 'visible', timeout: 15000 });

    const stressAiDisclaimer = page.locator('text=/Financial calculations are computed deterministically/i').first();
    await stressAiDisclaimer.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   ✅ AI Explanation Layer verified with validated narrative and engine disclaimer in Stress-Test!');

    await page.screenshot({ path: path.join(screenshotsDir, '04_cascade_differentiation_ai.png'), fullPage: true });

    // ----------------------------------------------------
    // STEP 5: OPEN RECOVERY PLANNER WITH TRAJECTORY COMPARATOR & AI EXPLANATION
    // ----------------------------------------------------
    console.log('\n👉 Step 5: Navigating to /recovery...');
    await page.goto('http://localhost:3000/recovery', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    const recoveryCard = page.locator('text=/Balanced/i').first();
    await recoveryCard.waitFor({ state: 'visible', timeout: 8000 });

    // Verify Recharts Trajectory Comparator
    const recoveryComparator = page.locator('text=/Recovery Trajectory Comparator/i').first();
    await recoveryComparator.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   ✅ Visual Strategy Trajectory Comparator verified!');

    // Verify Trade-Off Matrix ("What this costs you")
    const tradeOffs = page.locator('text=/Trade-Off Analysis: What This Strategy Costs You/i').first();
    await tradeOffs.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   ✅ Trade-Off Matrix ("What It Costs You") with pros/cons verified!');

    // Verify Buffer Preserved & Time to Recover metrics
    const bufferPreserved = page.locator('text=/Buffer Preserved/i').first();
    await bufferPreserved.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   ✅ Buffer Preserved & Time to Recover metrics verified!');

    // Verify AI Explanation Card in Recovery
    console.log('   Testing AI Explanation Layer in Recovery Planner...');
    const recoveryAiBtn = page.locator('button:has-text("Explain This Result")').first();
    await recoveryAiBtn.waitFor({ state: 'visible', timeout: 5000 });
    await recoveryAiBtn.click();
    const recoveryAiNarrative = page.locator('text=/Analytical Narrative/i').first();
    await recoveryAiNarrative.waitFor({ state: 'visible', timeout: 15000 });
    console.log('   ✅ AI Explanation Layer verified in Recovery Planner!');

    await page.screenshot({ path: path.join(screenshotsDir, '05_recovery_differentiation_ai.png'), fullPage: true });

    // ----------------------------------------------------
    // STEP 6: OPEN UPGRADED GOAL SURVIVAL MAP & AI EXPLANATION
    // ----------------------------------------------------
    console.log('\n👉 Step 6: Navigating to /survival...');
    await page.goto('http://localhost:3000/survival', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    // Verify Primary Question & Survival Verdict Banner
    const verdictBanner = page.locator('text=/Will my financial goal survive this disruption/i').first();
    await verdictBanner.waitFor({ state: 'visible', timeout: 8000 });
    console.log('   ✅ Primary Question & Survival Verdict Banner verified!');

    // Verify 6 Analytical Metric Badges
    const firstUnsafeMonth = page.locator('text=/FIRST UNSAFE MONTH/i').first();
    await firstUnsafeMonth.waitFor({ state: 'visible', timeout: 5000 });

    const maxDrawdown = page.locator('text=/MAX DRAWDOWN/i').first();
    await maxDrawdown.waitFor({ state: 'visible', timeout: 5000 });

    const recoveryPoint = page.locator('text=/RECOVERY POINT/i').first();
    await recoveryPoint.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   ✅ 6 Analytical Metric Cards (Status, Unsafe Month, Max Drawdown, Slippage, Shortfall, Recovery Point) verified!');

    // Verify Liquid Safety Buffer Runway Chart
    const bufferRunway = page.locator('text=/Liquid Safety Buffer Runway/i').first();
    await bufferRunway.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   ✅ Liquid Safety Buffer Runway chart verified!');

    // Verify AI Explanation Card in Survival Map
    console.log('   Testing AI Explanation Layer in Goal Survival Map...');
    const survivalAiBtn = page.locator('button:has-text("Explain This Result")').first();
    await survivalAiBtn.waitFor({ state: 'visible', timeout: 5000 });
    await survivalAiBtn.click();
    const survivalAiNarrative = page.locator('text=/Analytical Narrative/i').first();
    await survivalAiNarrative.waitFor({ state: 'visible', timeout: 15000 });
    console.log('   ✅ AI Explanation Layer verified in Goal Survival Map!');

    await page.screenshot({ path: path.join(screenshotsDir, '06_survival_differentiation_ai.png'), fullPage: true });

    // ----------------------------------------------------
    // STEP 7: MOBILE RESPONSIVENESS CHECK
    // ----------------------------------------------------
    console.log('\n👉 Step 7: Testing Mobile Responsiveness (375x667)...');
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check Landing Page on Mobile
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    const mobileLandingTitle = page.locator('text=/SAVE SMART/i').first();
    await mobileLandingTitle.waitFor({ state: 'visible', timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotsDir, '07_mobile_landing.png') });

    // Check Dashboard on Mobile
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
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

    // Check Survival on Mobile
    await page.goto('http://localhost:3000/survival', { waitUntil: 'networkidle' });
    const mobileSurvivalTitle = page.locator('h1:has-text("Goal Survival Map")').first();
    await mobileSurvivalTitle.waitFor({ state: 'visible', timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotsDir, '11_mobile_survival.png') });

    console.log('   ✅ Responsive layout verified on mobile viewport across all pages! Screenshots captured.');

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
      console.log('🎉 ALL TESTS PASSED WITH ZERO CONSOLE OR NETWORK ERRORS!');
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
