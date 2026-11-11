const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright-core');
const storage = require('./storage.cjs');

// Normalize selector to sanitize jQuery-style pseudo-selectors (:first(), :last(), :eq(n)) into Playwright syntax
function normalizeSelector(selector) {
  if (!selector || typeof selector !== 'string') return selector;
  let s = selector.trim();
  s = s.replace(/:first\(\)/gi, ' >> nth=0');
  s = s.replace(/:first\b/gi, ' >> nth=0');
  s = s.replace(/:last\(\)/gi, ' >> nth=-1');
  s = s.replace(/:last\b/gi, ' >> nth=-1');
  s = s.replace(/:eq\((\d+)\)/gi, ' >> nth=$1');
  return s;
}

// Parse step or input into structured primary selector and fallback selectors
function parseAdaptiveSelectors(input) {
  if (!input) return { primary: '', fallbacks: [], all: [] };

  let primary = '';
  let fallbacks = [];

  if (typeof input === 'string') {
    primary = input.trim();
  } else if (typeof input === 'object') {
    // If target is an object with primary and fallbacks
    if (input.target && typeof input.target === 'object') {
      primary = input.target.primary || '';
      if (Array.isArray(input.target.fallbacks)) {
        fallbacks = input.target.fallbacks;
      }
    } else if (input.selector && typeof input.selector === 'object') {
      primary = input.selector.primary || '';
      if (Array.isArray(input.selector.fallbacks)) {
        fallbacks = input.selector.fallbacks;
      }
    } else {
      if (typeof input.selector === 'string') {
        primary = input.selector;
      } else if (typeof input.primary === 'string') {
        primary = input.primary;
      }
      if (Array.isArray(input.fallbacks)) {
        fallbacks = input.fallbacks;
      } else if (Array.isArray(input.fallbackSelectors)) {
        fallbacks = input.fallbackSelectors;
      } else if (typeof input.fallbacks === 'string') {
        fallbacks = input.fallbacks.split('\n');
      }
    }
  }

  const cleanPrimary = typeof primary === 'string' ? primary.trim() : '';
  const cleanFallbacks = (Array.isArray(fallbacks) ? fallbacks : [])
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter((s) => s && s !== cleanPrimary);

  const seen = new Set();
  const all = [];
  if (cleanPrimary) {
    all.push(cleanPrimary);
    seen.add(cleanPrimary);
  }
  for (const f of cleanFallbacks) {
    if (!seen.has(f)) {
      all.push(f);
      seen.add(f);
    }
  }

  return {
    primary: cleanPrimary,
    fallbacks: cleanFallbacks,
    all
  };
}

// Helper to smartly target visible elements when multiple match (e.g. Livewire/Alpine mobile+desktop buttons)
async function getSmartLocator(page, rawSelector) {
  const selector = normalizeSelector(rawSelector);
  let loc = page.locator(selector);
  try {
    // If selector already specifies index or visibility, proceed directly
    if (selector.includes('nth=') || selector.includes(':visible')) {
      return loc.first();
    }
    const count = await loc.count();
    if (count > 1) {
      try {
        const visibleLoc = page.locator(`${selector}:visible`);
        if (await visibleLoc.count() > 0) {
          return visibleLoc.first();
        }
      } catch (subErr) {
        const vLoc = loc.locator('visible=true');
        if (await vLoc.count() > 0) {
          return vLoc.first();
        }
      }
    }
  } catch (e) {
    // ignore and fallback
  }
  return loc.first();
}

// Adaptive Multi-Selector Locator with automatic failover (probe timeout ~1.5s per candidate)
async function findAdaptiveLocator(page, selectorSpec, timeout = 10000, options = {}) {
  const { primary, fallbacks, all } = parseAdaptiveSelectors(selectorSpec);
  if (all.length === 0) {
    throw new Error('Selector elemen tidak boleh kosong');
  }

  // Fast path: single selector without fallbacks
  if (all.length === 1) {
    const loc = await getSmartLocator(page, all[0]);
    await loc.waitFor({ state: options.state || 'visible', timeout });
    return {
      locator: loc,
      matchedSelector: all[0],
      isFallback: false,
      fallbackIndex: null,
      primary
    };
  }

  // Multi-selector adaptive fallback failover loop
  const startTime = Date.now();
  const probeTimeout = options.probeTimeout || 1500;
  let lastErr = null;

  while (Date.now() - startTime < timeout) {
    for (let i = 0; i < all.length; i++) {
      const currentSelector = all[i];
      const remainingTime = timeout - (Date.now() - startTime);
      if (remainingTime <= 0) break;

      const currentWait = Math.min(probeTimeout, remainingTime);
      try {
        const loc = await getSmartLocator(page, currentSelector);
        await loc.waitFor({ state: options.state || 'visible', timeout: currentWait });

        const isFallback = i > 0;
        return {
          locator: loc,
          matchedSelector: currentSelector,
          isFallback,
          fallbackIndex: isFallback ? i - 1 : null,
          primary
        };
      } catch (err) {
        lastErr = err;
        // Proceed to next fallback candidate
      }
    }

    if (Date.now() - startTime < timeout) {
      await page.waitForTimeout(150);
    }
  }

  const fallbackMsg = fallbacks.length > 0 ? ` dan ${fallbacks.length} selector cadangan [${fallbacks.join(', ')}]` : '';
  const err = new Error(`Elemen tidak ditemukan setelah mencoba selector primer "${primary}"${fallbackMsg} (Timeout ${timeout}ms)`);
  if (lastErr) err.originalError = lastErr;
  throw err;
}

// Resilient click helper that handles Livewire/Alpine DOM-morphing, temporary disabled state, and Adaptive Multi-Selectors
async function clickElementSmartly(page, selectorSpec, timeout = 15000, onFallbackMatched = null) {
  await page.waitForTimeout(250);
  const startTime = Date.now();
  let lastErr = null;

  while (Date.now() - startTime < timeout) {
    const remainingTime = timeout - (Date.now() - startTime);
    if (remainingTime <= 0) break;

    try {
      const { locator, matchedSelector, isFallback, primary } = await findAdaptiveLocator(
        page,
        selectorSpec,
        remainingTime,
        { state: 'visible', probeTimeout: 1500 }
      );

      // If button has wire:loading or disabled attribute, give Livewire a moment to complete
      const isDisabled = await locator.getAttribute('disabled').catch(() => null);
      if (isDisabled !== null && isDisabled !== 'false') {
        await page.waitForTimeout(300);
        continue;
      }

      await locator.click({ timeout: Math.min(5000, remainingTime) });

      if (isFallback && typeof onFallbackMatched === 'function') {
        onFallbackMatched({ matchedSelector, primary });
      }

      return { matchedSelector, isFallback, primary };
    } catch (err) {
      lastErr = err;
      if (
        err.message.includes('detached') ||
        err.message.includes('not visible') ||
        err.message.includes('element is not enabled')
      ) {
        await page.waitForTimeout(300);
        continue;
      }
      if (Date.now() - startTime >= timeout) {
        throw err;
      }
    }
  }

  if (lastErr) throw lastErr;
}

class TestRunner {
  constructor() {
    this.activeBrowser = null;
    this.isAborted = false;
  }

  abort() {
    this.isAborted = true;
    if (this.activeBrowser) {
      try {
        this.activeBrowser.close().catch(() => {});
      } catch (e) {
        // ignore
      }
      this.activeBrowser = null;
    }
  }

  async resolveScenario(scenarioId, options = {}) {
    if (!scenarioId) return null;

    if (Array.isArray(options.allScenarios)) {
      const match = options.allScenarios.find((s) => s.id === scenarioId);
      if (match) return match;
    }
    if (Array.isArray(options.scenarios)) {
      const match = options.scenarios.find((s) => s.id === scenarioId);
      if (match) return match;
    }

    try {
      const s = storage.getScenarioById(scenarioId);
      if (s) return s;
    } catch (e) {}

    try {
      const db = require('./db.cjs');
      if (db && typeof db.getScenarioById === 'function') {
        const d = await db.getScenarioById(scenarioId);
        if (d) return d;
      }
    } catch (e) {}

    return null;
  }

  async executeStepList(page, stepsToRun, context) {
    const { scenario, depth = 0, callStack = new Set(), options = {}, emit } = context;
    const executedSteps = [];
    let overallSuccess = true;
    let overallError = null;

    for (let i = 0; i < stepsToRun.length; i++) {
      if (this.isAborted) {
        overallSuccess = false;
        overallError = 'Eksekusi dibatalkan oleh pengguna.';
        break;
      }

      const step = stepsToRun[i];
      const stepStartTime = Date.now();

      emit('step-start', {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        stepId: step.id,
        stepIndex: i + 1,
        totalSteps: stepsToRun.length,
        label: step.label || `${step.action} ${step.selector || step.target || ''}`,
        action: step.action,
        depth,
        isSubScenario: depth > 0
      });

      let stepSuccess = false;
      let stepError = null;
      let screenshotFile = null;
      let matchedSelector = null;
      let isFallbackUsed = false;

      try {
        const timeout = Number(step.timeout) || 15000;

        switch (step.action) {
          case 'sub_scenario':
          case 'run_component': {
            const subId = step.subScenarioId || step.targetScenarioId || step.value || step.target;
            if (!subId) throw new Error('ID Skenario Sub-Flow belum dipilih');

            if (callStack.has(subId)) {
              throw new Error(`Terdeteksi siklus pemanggilan berulang (circular dependency): ${Array.from(callStack).join(' -> ')} -> ${subId}`);
            }

            if (depth >= 5) {
              throw new Error('Batas kedalaman pemanggilan sub-flow terlampaui (maksimal 5 tingkat).');
            }

            const subScenario = await this.resolveScenario(subId, options);
            if (!subScenario) {
              throw new Error(`Sub-flow dengan ID "${subId}" tidak ditemukan.`);
            }

            const subSteps = (subScenario.steps || []).filter((s) => s.enabled !== false);
            emit('log', {
              level: 'info',
              message: `📦 [Depth ${depth + 1}] Memulai Sub-Flow: "${subScenario.name}" (${subSteps.length} langkah)...`
            });

            const nextCallStack = new Set(callStack);
            nextCallStack.add(subId);

            const subRunRes = await this.executeStepList(page, subSteps, {
              scenario: subScenario,
              parentScenario: scenario,
              depth: depth + 1,
              callStack: nextCallStack,
              options,
              emit
            });

            if (!subRunRes.success) {
              throw new Error(`Gagal pada Sub-Flow "${subScenario.name}": ${subRunRes.error}`);
            }

            emit('log', {
              level: 'success',
              message: `📦 [Depth ${depth + 1}] Sub-Flow "${subScenario.name}" selesai dieksekusi dengan sukses.`
            });
            break;
          }

          case 'navigate': {
            const targetUrl = step.target || scenario.baseUrl;
            if (!targetUrl) throw new Error('Target URL belum ditentukan');
            await page.goto(targetUrl, { timeout, waitUntil: 'domcontentloaded' });
            break;
          }

          case 'type': {
            const targetRes = await findAdaptiveLocator(page, step, timeout);
            const target = targetRes.locator;
            matchedSelector = targetRes.matchedSelector;
            if (targetRes.isFallback) {
              isFallbackUsed = true;
              emit('log', {
                level: 'warn',
                message: `⚡ Adaptive Fallback: Elemen input "${step.label || 'type'}" ditemukan via cadangan "${targetRes.matchedSelector}" (Primer: "${targetRes.primary}")`
              });
            }

            if (step.value && step.value.includes('{Enter}')) {
              const cleanText = step.value.replace(/{Enter}/g, '');
              await target.fill(cleanText);
              await target.press('Enter');
            } else {
              await target.fill(step.value || '');
            }
            break;
          }

          case 'click': {
            const clickRes = await clickElementSmartly(page, step, timeout, ({ matchedSelector: mSel, primary: pSel }) => {
              isFallbackUsed = true;
              matchedSelector = mSel;
              emit('log', {
                level: 'warn',
                message: `⚡ Adaptive Fallback: Tombol "${step.label || 'click'}" diklik via cadangan "${mSel}" (Primer: "${pSel}")`
              });
            });
            if (clickRes) {
              matchedSelector = clickRes.matchedSelector;
              if (clickRes.isFallback) isFallbackUsed = true;
            }
            break;
          }

          case 'select': {
            const targetRes = await findAdaptiveLocator(page, step, timeout);
            matchedSelector = targetRes.matchedSelector;
            if (targetRes.isFallback) {
              isFallbackUsed = true;
              emit('log', {
                level: 'warn',
                message: `⚡ Adaptive Fallback: Dropdown "${step.label || 'select'}" ditemukan via cadangan "${targetRes.matchedSelector}" (Primer: "${targetRes.primary}")`
              });
            }
            await targetRes.locator.selectOption(step.value);
            break;
          }

          case 'check': {
            const targetRes = await findAdaptiveLocator(page, step, timeout);
            matchedSelector = targetRes.matchedSelector;
            if (targetRes.isFallback) {
              isFallbackUsed = true;
              emit('log', {
                level: 'warn',
                message: `⚡ Adaptive Fallback: Checkbox "${step.label || 'check'}" ditemukan via cadangan "${targetRes.matchedSelector}" (Primer: "${targetRes.primary}")`
              });
            }
            await targetRes.locator.check({ timeout });
            break;
          }

          case 'wait': {
            const selSpec = parseAdaptiveSelectors(step);
            if (selSpec.all.length > 0) {
              const targetRes = await findAdaptiveLocator(page, step, timeout);
              matchedSelector = targetRes.matchedSelector;
              if (targetRes.isFallback) {
                isFallbackUsed = true;
                emit('log', {
                  level: 'warn',
                  message: `⚡ Adaptive Fallback: Elemen tunggu "${step.label || 'wait'}" ditemukan via cadangan "${targetRes.matchedSelector}" (Primer: "${targetRes.primary}")`
                });
              }
            }
            if (step.value) {
              const ms = parseInt(step.value, 10);
              if (!isNaN(ms) && ms > 0) {
                await page.waitForTimeout(ms);
              }
            }
            break;
          }

          case 'assert_visible': {
            const targetRes = await findAdaptiveLocator(page, step, timeout);
            matchedSelector = targetRes.matchedSelector;
            if (targetRes.isFallback) {
              isFallbackUsed = true;
              emit('log', {
                level: 'warn',
                message: `⚡ Adaptive Fallback: Elemen assert_visible "${step.label || 'assert_visible'}" ditemukan via cadangan "${targetRes.matchedSelector}" (Primer: "${targetRes.primary}")`
              });
            }
            break;
          }

          case 'assert_text': {
            const targetRes = await findAdaptiveLocator(page, step, timeout);
            matchedSelector = targetRes.matchedSelector;
            if (targetRes.isFallback) {
              isFallbackUsed = true;
              emit('log', {
                level: 'warn',
                message: `⚡ Adaptive Fallback: Elemen assert_text "${step.label || 'assert_text'}" ditemukan via cadangan "${targetRes.matchedSelector}" (Primer: "${targetRes.primary}")`
              });
            }
            const actualText = await targetRes.locator.innerText();
            const expectedText = step.value || '';
            if (!actualText || !actualText.toLowerCase().includes(expectedText.toLowerCase())) {
              throw new Error(`Teks tidak cocok. Diharapkan mengandung: "${expectedText}", tetapi menemukan: "${actualText ? actualText.trim() : ''}"`);
            }
            break;
          }

          case 'assert_url': {
            const currentUrl = page.url();
            const expected = step.value || '';
            if (!currentUrl.toLowerCase().includes(expected.toLowerCase())) {
              throw new Error(`URL tidak cocok. Diharapkan mengandung: "${expected}", URL saat ini: "${currentUrl}"`);
            }
            break;
          }

          case 'screenshot': {
            const cleanName = (step.value || step.label || 'screenshot').replace(/[^a-zA-Z0-9_-]/g, '_');
            const filename = `${cleanName}-${Date.now()}.png`;
            const filePath = path.join(storage.getScreenshotsDir(), filename);
            await page.screenshot({ path: filePath, fullPage: true });
            screenshotFile = filename;
            break;
          }

          default:
            throw new Error(`Aksi tidak dikenali: ${step.action}`);
        }

        stepSuccess = true;
      } catch (err) {
        stepSuccess = false;
        stepError = err.message || String(err);
        overallSuccess = false;
        overallError = stepError;

        try {
          const errFilename = `error-${scenario.id}-step${i + 1}-${Date.now()}.png`;
          const errFilePath = path.join(storage.getScreenshotsDir(), errFilename);
          await page.screenshot({ path: errFilePath });
          screenshotFile = errFilename;
        } catch (snapErr) {}
      }

      const stepDuration = Date.now() - stepStartTime;
      const stepResultItem = {
        stepId: step.id,
        label: step.label || step.action,
        action: step.action,
        status: stepSuccess ? 'passed' : 'failed',
        durationMs: stepDuration,
        error: stepError,
        screenshot: screenshotFile,
        isFallback: isFallbackUsed,
        matchedSelector: matchedSelector,
        depth,
        isSubScenario: depth > 0
      };

      executedSteps.push(stepResultItem);

      if (stepSuccess) {
        emit('step-pass', {
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          stepId: step.id,
          durationMs: stepDuration,
          screenshot: screenshotFile,
          isFallback: isFallbackUsed,
          matchedSelector: matchedSelector,
          depth,
          isSubScenario: depth > 0
        });
      } else {
        emit('step-fail', {
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          stepId: step.id,
          durationMs: stepDuration,
          error: stepError,
          screenshot: screenshotFile,
          depth,
          isSubScenario: depth > 0
        });
        break;
      }
    }

    return {
      success: overallSuccess,
      error: overallError,
      steps: executedSteps
    };
  }

  async run({ scenarios, options = {}, onEvent }) {
    this.isAborted = false;
    const isServerWithoutDisplay = process.platform === 'linux' && !process.env.DISPLAY;
    const effectiveHeadless = Boolean(
      options.headless || process.env.FORCE_HEADLESS === 'true' || isServerWithoutDisplay
    );

    const {
      slowMo = 300,
      keepSession = false,
      suiteId = null,
      suiteName = null
    } = options;

    const emit = (type, payload) => {
      if (typeof onEvent === 'function') {
        onEvent(type, { timestamp: new Date().toISOString(), ...payload });
      }
    };

    const runStartTime = Date.now();
    const runResult = {
      id: `run-${Date.now()}`,
      startTime: new Date().toISOString(),
      suiteId,
      suiteName,
      totalScenarios: scenarios.length,
      passedScenarios: 0,
      failedScenarios: 0,
      scenarioResults: []
    };

    emit('run-start', {
      totalScenarios: scenarios.length,
      headless: effectiveHeadless,
      slowMo,
      isRemoteRequest: Boolean(options.isRemoteRequest),
      serverPlatform: process.platform
    });

    const runnerModeDesc = effectiveHeadless
      ? 'Background Runner (Headless)'
      : `Chrome Terlihat (Headed GUI pada Server Host [${process.platform}])`;

    emit('log', {
      level: 'info',
      message: `🖥️ Inisialisasi Browser: ${runnerModeDesc} | Delay: ${slowMo}ms`
    });

    if (!effectiveHeadless && options.isRemoteRequest) {
      emit('log', {
        level: 'warn',
        message: `ℹ️ Info: Request pengujian berasal dari Web Client remote (${options.clientIp || 'client'}). Jendela Chrome dibuka di monitor server host.`
      });
    }

    let browser = null;
    let sharedContext = null;

    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ];

    try {
      // Launch browser using installed Chrome or default chromium
      try {
        browser = await chromium.launch({
          channel: 'chrome',
          headless: effectiveHeadless,
          slowMo,
          args: launchArgs
        });
      } catch (chromeErr) {
        console.warn('Could not launch Chrome via channel, trying default chromium launch:', chromeErr.message);
        browser = await chromium.launch({
          headless: effectiveHeadless,
          slowMo,
          args: launchArgs
        });
      }

      this.activeBrowser = browser;

      if (keepSession) {
        sharedContext = await browser.newContext({
          viewport: { width: 1280, height: 800 }
        });
      }

      for (let sIdx = 0; sIdx < scenarios.length; sIdx++) {
        if (this.isAborted) {
          emit('log', { level: 'warn', message: 'Eksekusi dibatalkan oleh pengguna.' });
          break;
        }

        const scenario = scenarios[sIdx];
        const scenarioStartTime = Date.now();
        const scenarioResult = {
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          status: 'running',
          steps: [],
          error: null
        };

        emit('scenario-start', {
          scenarioIndex: sIdx + 1,
          totalScenarios: scenarios.length,
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          totalSteps: (scenario.steps || []).filter(s => s.enabled !== false).length
        });

        // Use shared context or create fresh isolated context for this scenario
        const context = sharedContext || await browser.newContext({
          viewport: { width: 1280, height: 800 }
        });
        const page = await context.newPage();

        let scenarioFailed = false;

        // 1. Auth Setup if enabled
        if (scenario.authConfig && scenario.authConfig.enabled) {
          try {
            emit('log', { level: 'info', message: `Menjalankan konfigurasi Auth untuk: ${scenario.name}` });
            if (scenario.baseUrl) {
              await page.goto(scenario.baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
            }

            // Check if login form is actually needed (e.g. if keepSession is active and user is already logged in)
            let needsLogin = true;
            if (scenario.authConfig.usernameSelector) {
              const uTarget = await getSmartLocator(page, scenario.authConfig.usernameSelector);
              try {
                // If keepSession is active or this is not the first scenario in a run, probe briefly (2500ms)
                const probeTime = (keepSession || sIdx > 0) ? 2500 : 10000;
                await uTarget.waitFor({ state: 'visible', timeout: probeTime });
                needsLogin = true;
              } catch (noLoginFieldErr) {
                if (keepSession || sIdx > 0) {
                  emit('log', {
                    level: 'info',
                    message: `Sesi login sebelumnya terdeteksi masih aktif (Keep Session). Melewati proses login ulang untuk: ${scenario.name}`
                  });
                  needsLogin = false;
                } else {
                  throw new Error(`Field login "${scenario.authConfig.usernameSelector}" tidak ditemukan di halaman.`);
                }
              }
            }

            if (needsLogin) {
              if (scenario.authConfig.usernameSelector && scenario.authConfig.usernameValue) {
                const uTarget = await getSmartLocator(page, scenario.authConfig.usernameSelector);
                await uTarget.fill(scenario.authConfig.usernameValue);
              }
              if (scenario.authConfig.passwordSelector && scenario.authConfig.passwordValue) {
                const pTarget = await getSmartLocator(page, scenario.authConfig.passwordSelector);
                await pTarget.fill(scenario.authConfig.passwordValue);
              }

              // A. Extra Form Inputs (Before Submit)
              if (Array.isArray(scenario.authConfig.extraInputs)) {
                for (const extra of scenario.authConfig.extraInputs) {
                  if (!extra.selector) continue;
                  const extraTarget = await getSmartLocator(page, extra.selector);
                  await extraTarget.waitFor({ state: 'visible', timeout: 10000 });
                  if (extra.type === 'checkbox') {
                    if (extra.value === true || extra.value === 'true') {
                      await extraTarget.check();
                    } else {
                      await extraTarget.uncheck();
                    }
                  } else {
                    await extraTarget.fill(extra.value || '');
                  }
                  emit('log', { level: 'info', message: `Auth: Mengisi ${extra.label || extra.selector}` });
                }
              }

              // B. Click Submit
              if (scenario.authConfig.submitSelector) {
                await clickElementSmartly(page, scenario.authConfig.submitSelector, 15000);
                await page.waitForLoadState('networkidle').catch(() => {});
              }

              // C. Post-Login Actions (After Submit: OTP/PIN/Popups/Tenant selection/Modals)
              if (Array.isArray(scenario.authConfig.postLoginActions)) {
                for (let pIdx = 0; pIdx < scenario.authConfig.postLoginActions.length; pIdx++) {
                  const postAct = scenario.authConfig.postLoginActions[pIdx];
                  if (postAct.enabled === false) continue;
                  const to = Number(postAct.timeout) || 10000;
                  const stepLabel = postAct.label || `Langkah ${pIdx + 1} (${postAct.action})`;
                  emit('log', { level: 'info', message: `Auth Pasca-Login [${pIdx + 1}]: ${stepLabel}${postAct.optional ? ' (Opsional)' : ''}` });

                  try {
                    switch (postAct.action) {
                      case 'type': {
                        if (!postAct.selector) break;
                        const tRes = await findAdaptiveLocator(page, postAct, to);
                        const t = tRes.locator;
                        if (tRes.isFallback) {
                          emit('log', {
                            level: 'warn',
                            message: `⚡ Auth Fallback [${pIdx + 1}]: Elemen input ditemukan via cadangan "${tRes.matchedSelector}" (Primer: "${tRes.primary}")`
                          });
                        }
                        if (postAct.value && postAct.value.includes('{Enter}')) {
                          const clean = postAct.value.replace(/{Enter}/g, '');
                          await t.fill(clean);
                          await t.press('Enter');
                        } else {
                          await t.fill(postAct.value || '');
                        }
                        break;
                      }
                      case 'click': {
                        if (!postAct.selector) break;
                        await clickElementSmartly(page, postAct, to, ({ matchedSelector, primary }) => {
                          emit('log', {
                            level: 'warn',
                            message: `⚡ Auth Fallback [${pIdx + 1}]: Tombol diklik via cadangan "${matchedSelector}" (Primer: "${primary}")`
                          });
                        });
                        break;
                      }
                      case 'select': {
                        if (!postAct.selector) break;
                        const tRes = await findAdaptiveLocator(page, postAct, to);
                        if (tRes.isFallback) {
                          emit('log', {
                            level: 'warn',
                            message: `⚡ Auth Fallback [${pIdx + 1}]: Dropdown ditemukan via cadangan "${tRes.matchedSelector}" (Primer: "${tRes.primary}")`
                          });
                        }
                        await tRes.locator.selectOption(postAct.value || '');
                        break;
                      }
                      case 'check': {
                        if (!postAct.selector) break;
                        const tRes = await findAdaptiveLocator(page, postAct, to);
                        await tRes.locator.check({ timeout: to });
                        break;
                      }
                      case 'uncheck': {
                        if (!postAct.selector) break;
                        const tRes = await findAdaptiveLocator(page, postAct, to);
                        await tRes.locator.uncheck({ timeout: to });
                        break;
                      }
                      case 'wait': {
                        const selSpec = parseAdaptiveSelectors(postAct);
                        if (selSpec.all.length > 0) {
                          await findAdaptiveLocator(page, postAct, to);
                        }
                        if (postAct.value) {
                          const ms = parseInt(postAct.value, 10);
                          if (!isNaN(ms) && ms > 0) {
                            await page.waitForTimeout(ms);
                          }
                        }
                        break;
                      }
                      case 'assert_url': {
                        await page.waitForTimeout(500);
                        const curUrl = page.url();
                        if (!curUrl.toLowerCase().includes((postAct.value || '').toLowerCase())) {
                          throw new Error(`URL pasca-login tidak sesuai. Harap memuat: "${postAct.value}", saat ini: "${curUrl}"`);
                        }
                        break;
                      }
                      case 'assert_visible': {
                        if (!postAct.selector) break;
                        await findAdaptiveLocator(page, postAct, to);
                        break;
                      }
                      case 'assert_text': {
                        if (!postAct.selector) break;
                        const tRes = await findAdaptiveLocator(page, postAct, to);
                        const txt = await tRes.locator.innerText();
                        if (!txt.toLowerCase().includes((postAct.value || '').toLowerCase())) {
                          throw new Error(`Teks pasca-login tidak cocok. Harap memuat: "${postAct.value}", ditemukan: "${txt.trim()}"`);
                        }
                        break;
                      }
                      case 'screenshot': {
                        const ssName = `${scenario.id}-auth-${Date.now()}.png`;
                        const ssPath = path.join(storage.getScreenshotsDir(), ssName);
                        await page.screenshot({ path: ssPath, fullPage: true });
                        emit('log', { level: 'info', message: `Foto bukti pasca-login tersimpan: ${ssName}` });
                        break;
                      }
                      default:
                        break;
                    }
                  } catch (stepErr) {
                    if (postAct.optional) {
                      emit('log', {
                        level: 'warn',
                        message: `Aksi opsional "${stepLabel}" dilewati (elemen tidak muncul/timeout): ${stepErr.message}`
                      });
                    } else {
                      throw stepErr;
                    }
                  }
                }
              }

              emit('log', { level: 'success', message: 'Rangkaian proses Auth selesai dieksekusi.' });
            }
          } catch (authErr) {
            scenarioFailed = true;
            scenarioResult.error = `Gagal pada proses Auth: ${authErr.message}`;
            emit('log', { level: 'error', message: `Gagal pada proses Auth: ${authErr.message}` });

            // Capture automatic screenshot of auth failure so user sees the page state
            try {
              const errFilename = `error-${scenario.id}-auth-${Date.now()}.png`;
              const errFilePath = path.join(storage.getScreenshotsDir(), errFilename);
              await page.screenshot({ path: errFilePath, fullPage: true });
              scenarioResult.steps.push({
                stepId: 'auth-error',
                label: 'Proses Autentikasi / Pasca-Login',
                action: 'auth',
                status: 'failed',
                durationMs: Date.now() - scenarioStartTime,
                error: authErr.message,
                screenshot: errFilename
              });
              emit('step-fail', {
                scenarioId: scenario.id,
                stepId: 'auth-error',
                durationMs: Date.now() - scenarioStartTime,
                error: authErr.message,
                screenshot: errFilename
              });
            } catch (snapErr) {
              // ignore
            }
          }
        }

        // If auth failed, do not proceed to scenario steps
        if (scenarioFailed) {
          scenarioResult.status = 'failed';
          scenarioResult.durationMs = Date.now() - scenarioStartTime;
          runResult.failedScenarios++;
          runResult.scenarioResults.push(scenarioResult);

          emit('scenario-finish', {
            scenarioIndex: sIdx + 1,
            totalScenarios: scenarios.length,
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            status: 'failed',
            durationMs: scenarioResult.durationMs
          });

          if (!keepSession) {
            await context.close().catch(() => {});
          } else {
            await page.close().catch(() => {});
          }
          continue;
        }

        // 2. Iterate Scenario Steps
        const stepsToRun = (scenario.steps || []).filter((s) => s.enabled !== false);
        const stepListResult = await this.executeStepList(page, stepsToRun, {
          scenario,
          depth: 0,
          callStack: new Set([scenario.id]),
          options,
          emit
        });

        scenarioResult.steps = stepListResult.steps;
        if (!stepListResult.success) {
          scenarioFailed = true;
          scenarioResult.error = stepListResult.error;
        }

        // Close page/context if not shared
        if (!keepSession) {
          await context.close().catch(() => {});
        } else {
          await page.close().catch(() => {});
        }

        const scenarioDuration = Date.now() - scenarioStartTime;
        scenarioResult.durationMs = scenarioDuration;
        scenarioResult.status = scenarioFailed ? 'failed' : 'passed';

        if (scenarioFailed) {
          runResult.failedScenarios++;
        } else {
          runResult.passedScenarios++;
        }

        runResult.scenarioResults.push(scenarioResult);

        emit('scenario-finish', {
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          status: scenarioResult.status,
          durationMs: scenarioDuration
        });
      }

      if (sharedContext) {
        await sharedContext.close().catch(() => {});
      }
    } catch (globalErr) {
      emit('log', { level: 'error', message: `Runner Error: ${globalErr.message}` });
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
        this.activeBrowser = null;
      }
    }

    runResult.durationMs = Date.now() - runStartTime;
    runResult.status = runResult.failedScenarios > 0 ? 'failed' : (this.isAborted ? 'aborted' : 'passed');

    // Save to history
    storage.addHistory(runResult);

    emit('run-finish', runResult);
    return runResult;
  }
}

module.exports = new TestRunner();
