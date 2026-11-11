const { chromium } = require('playwright-core');

class WebRecorder {
  constructor() {
    this.activeBrowser = null;
    this.activePage = null;
    this.isRecording = false;
    this.recordedSteps = [];
    this.sessionStartTime = null;
    this.onStepCallback = null;
    this.onEventCallback = null;
  }

  getIsRecording() {
    return this.isRecording;
  }

  getRecordedSteps() {
    return this.recordedSteps;
  }

  async startRecording({ url, options = {}, onStep, onEvent }) {
    if (this.isRecording) {
      await this.stopRecording();
    }

    this.isRecording = true;
    this.recordedSteps = [];
    this.sessionStartTime = Date.now();
    this.onStepCallback = onStep;
    this.onEventCallback = onEvent;

    const emit = (type, data) => {
      if (typeof this.onEventCallback === 'function') {
        this.onEventCallback(type, { timestamp: new Date().toISOString(), ...data });
      }
    };

    const targetUrl = url && url.startsWith('http') ? url : (url ? `https://${url}` : 'about:blank');

    // Initial navigation step
    if (targetUrl !== 'about:blank') {
      const initialStep = {
        id: `rec-step-${Date.now()}-1`,
        action: 'navigate',
        label: `Buka Halaman: ${targetUrl}`,
        target: targetUrl,
        selector: '',
        fallbacks: [],
        value: '',
        timeout: 15000,
        enabled: true
      };
      this.recordedSteps.push(initialStep);
      if (typeof this.onStepCallback === 'function') {
        this.onStepCallback(initialStep);
      }
      emit('step-recorded', initialStep);
    }

    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ];

    let browser = null;
    try {
      browser = await chromium.launch({
        channel: 'chrome',
        headless: false,
        args: launchArgs
      });
    } catch (e) {
      console.warn('Could not launch Chrome via channel for recording, using default Chromium:', e.message);
      browser = await chromium.launch({
        headless: false,
        args: launchArgs
      });
    }

    this.activeBrowser = browser;
    const context = await browser.newContext({
      viewport: { width: 1280, height: 850 }
    });

    const page = await context.newPage();
    this.activePage = page;

    // Expose Node.js callback function to page window
    await page.exposeFunction('__qaRecorderEmitStep', (stepData) => {
      if (!this.isRecording) return;

      const step = {
        id: `rec-step-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        action: stepData.action || 'click',
        label: stepData.label || `${stepData.action} ${stepData.selector || ''}`,
        target: stepData.target || '',
        selector: stepData.selector || '',
        fallbacks: Array.isArray(stepData.fallbacks) ? stepData.fallbacks : [],
        value: stepData.value || '',
        timeout: 10000,
        enabled: true
      };

      // Avoid immediate duplicate typing on the same selector
      const lastStep = this.recordedSteps[this.recordedSteps.length - 1];
      if (
        lastStep &&
        lastStep.action === step.action &&
        lastStep.selector === step.selector &&
        step.action === 'type'
      ) {
        lastStep.value = step.value;
        lastStep.label = step.label;
        if (typeof this.onStepCallback === 'function') {
          this.onStepCallback(lastStep, true); // true indicates update
        }
        emit('step-updated', lastStep);
        return;
      }

      this.recordedSteps.push(step);
      if (typeof this.onStepCallback === 'function') {
        this.onStepCallback(step, false);
      }
      emit('step-recorded', step);
    });

    // Injected client script to listen for events and generate smart selectors
    const recorderScript = `
      (function() {
        if (window.__qaRecorderInjected) return;
        window.__qaRecorderInjected = true;

        // Floating Recording Indicator UI
        function createRecorderBadge() {
          const badge = document.createElement('div');
          badge.id = '__qa_recorder_badge';
          badge.style.position = 'fixed';
          badge.style.bottom = '16px';
          badge.style.right = '16px';
          badge.style.zIndex = '2147483647';
          badge.style.background = '#18181b';
          badge.style.color = '#ffffff';
          badge.style.padding = '8px 14px';
          badge.style.borderRadius = '9999px';
          badge.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)';
          badge.style.fontFamily = 'system-ui, -apple-system, sans-serif';
          badge.style.fontSize = '12px';
          badge.style.fontWeight = '600';
          badge.style.display = 'flex';
          badge.style.alignItems = 'center';
          badge.style.gap = '8px';
          badge.style.pointerEvents = 'none';
          badge.style.userSelect = 'none';
          badge.innerHTML = '<span style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; display: inline-block; animation: pulse 1.5s infinite;"></span><span>QA Flow Studio Recorder</span>';
          
          const style = document.createElement('style');
          style.innerHTML = '@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }';
          document.head.appendChild(style);
          document.body.appendChild(badge);
        }

        if (document.body) createRecorderBadge();
        else window.addEventListener('DOMContentLoaded', createRecorderBadge);

        // Smart Selector Generator
        function computeSelector(el) {
          if (!el || el === document.body || el === document.documentElement) return { primary: 'body', fallbacks: [] };

          const primary = [];
          const fallbacks = [];

          // 1. data-testid
          const testId = el.getAttribute('data-testid') || el.getAttribute('data-test') || el.getAttribute('data-cy');
          if (testId) {
            primary.push('[data-testid="' + testId + '"]');
          }

          // 2. Element ID (if valid and not purely numeric/dynamic)
          if (el.id && !el.id.match(/^\\d+$/) && !el.id.includes(':')) {
            const idSel = '#' + el.id;
            if (primary.length === 0) primary.push(idSel);
            else fallbacks.push(idSel);
          }

          const tag = el.tagName.toLowerCase();

          // 3. Text based (buttons, links, labels)
          const text = (el.innerText || el.textContent || '').trim();
          if ((tag === 'button' || tag === 'a' || el.getAttribute('role') === 'button') && text && text.length < 35) {
            const cleanText = text.replace(/"/g, '\\\\"');
            const textSel = tag + ':has-text("' + cleanText + '")';
            if (primary.length === 0) primary.push(textSel);
            else fallbacks.push(textSel);
          }

          // 4. Form inputs (name, placeholder, type)
          if (tag === 'input' || tag === 'textarea' || tag === 'select') {
            const name = el.getAttribute('name');
            if (name) {
              const nameSel = tag + '[name="' + name + '"]';
              if (primary.length === 0) primary.push(nameSel);
              else fallbacks.push(nameSel);
            }
            const placeholder = el.getAttribute('placeholder');
            if (placeholder) {
              fallbacks.push(tag + '[placeholder*="' + placeholder.slice(0, 20).replace(/"/g, '') + '"]');
            }
            const type = el.getAttribute('type');
            if (type && type !== 'text') {
              fallbacks.push(tag + '[type="' + type + '"]:visible');
            }
          }

          // 5. Accessible label
          const ariaLabel = el.getAttribute('aria-label');
          if (ariaLabel) {
            const ariaSel = '[aria-label="' + ariaLabel.replace(/"/g, '') + '"]';
            if (primary.length === 0) primary.push(ariaSel);
            else fallbacks.push(ariaSel);
          }

          // 6. Distinct CSS classes
          const classes = Array.from(el.classList || []).filter(c =>
            !c.match(/^(hover|focus|active|dark|sm|md|lg|xl|transition|duration|p-|m-|text-|bg-|flex|grid|w-|h-)/)
          );
          if (classes.length > 0) {
            fallbacks.push(tag + '.' + classes.slice(0, 2).join('.'));
          }

          if (primary.length === 0) {
            primary.push(tag + ':visible');
          }

          const primarySelector = primary[0];
          const cleanFallbacks = Array.from(new Set(fallbacks)).filter(f => f && f !== primarySelector);

          return { primary: primarySelector, fallbacks: cleanFallbacks };
        }

        // Listen for Click
        document.addEventListener('click', function(e) {
          const target = e.target;
          if (!target || target.id === '__qa_recorder_badge') return;

          const sel = computeSelector(target);
          const tag = target.tagName.toLowerCase();
          const text = (target.innerText || target.textContent || '').trim().slice(0, 25);
          const label = text ? 'Klik "' + text + '"' : 'Klik elemen <' + tag + '>';

          if (window.__qaRecorderEmitStep) {
            window.__qaRecorderEmitStep({
              action: 'click',
              selector: sel.primary,
              fallbacks: sel.fallbacks,
              label: label
            });
          }
        }, true);

        // Listen for Typing & Change
        let typeDebounceTimer = null;
        document.addEventListener('input', function(e) {
          const target = e.target;
          if (!target || (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA')) return;

          clearTimeout(typeDebounceTimer);
          typeDebounceTimer = setTimeout(function() {
            const sel = computeSelector(target);
            const val = target.value;
            const inputLabel = target.name || target.placeholder || target.id || 'kolom input';

            if (window.__qaRecorderEmitStep) {
              window.__qaRecorderEmitStep({
                action: 'type',
                selector: sel.primary,
                fallbacks: sel.fallbacks,
                value: val,
                label: 'Ketik "' + (val.length > 20 ? val.slice(0, 20) + '...' : val) + '" ke ' + inputLabel
              });
            }
          }, 400);
        }, true);

        // Listen for Enter key on inputs
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            const target = e.target;
            if (!target || (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA')) return;
            const sel = computeSelector(target);
            const val = target.value ? target.value + '{Enter}' : '{Enter}';

            if (window.__qaRecorderEmitStep) {
              window.__qaRecorderEmitStep({
                action: 'type',
                selector: sel.primary,
                fallbacks: sel.fallbacks,
                value: val,
                label: 'Tekan Enter pada ' + (target.name || 'input')
              });
            }
          }
        }, true);

        // Listen for Select dropdown
        document.addEventListener('change', function(e) {
          const target = e.target;
          if (!target || target.tagName !== 'SELECT') return;

          const sel = computeSelector(target);
          const val = target.value;
          const text = target.options[target.selectedIndex]?.text || val;

          if (window.__qaRecorderEmitStep) {
            window.__qaRecorderEmitStep({
              action: 'select',
              selector: sel.primary,
              fallbacks: sel.fallbacks,
              value: val,
              label: 'Pilih opsi "' + text + '"'
            });
          }
        }, true);
      })();
    `;

    await page.addInitScript(recorderScript);

    // Track navigation events
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame() && this.isRecording) {
        const currentUrl = page.url();
        if (currentUrl && !currentUrl.startsWith('about:')) {
          const lastStep = this.recordedSteps[this.recordedSteps.length - 1];
          if (!lastStep || lastStep.action !== 'navigate' || lastStep.target !== currentUrl) {
            const navStep = {
              id: `rec-step-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              action: 'navigate',
              label: `Navigasi ke: ${currentUrl}`,
              target: currentUrl,
              selector: '',
              fallbacks: [],
              value: '',
              timeout: 15000,
              enabled: true
            };
            this.recordedSteps.push(navStep);
            if (typeof this.onStepCallback === 'function') {
              this.onStepCallback(navStep, false);
            }
            emit('step-recorded', navStep);
          }
        }
      }
    });

    // Handle user closing browser manually
    browser.on('disconnected', () => {
      this.isRecording = false;
      this.activeBrowser = null;
      this.activePage = null;
      emit('recorder-stopped', { stepsCount: this.recordedSteps.length });
    });

    // Navigate to target URL
    if (targetUrl !== 'about:blank') {
      try {
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      } catch (navErr) {
        console.warn('Initial recorder navigation warning:', navErr.message);
      }
    }

    emit('recorder-started', { url: targetUrl });
    return { status: 'recording', initialUrl: targetUrl };
  }

  async stopRecording() {
    this.isRecording = false;
    if (this.activeBrowser) {
      try {
        await this.activeBrowser.close();
      } catch (e) {}
      this.activeBrowser = null;
      this.activePage = null;
    }
    return {
      status: 'stopped',
      totalSteps: this.recordedSteps.length,
      steps: this.recordedSteps
    };
  }
}

module.exports = new WebRecorder();
