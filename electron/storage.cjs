const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const defaultData = require('./defaultData.cjs');

class StorageManager {
  constructor() {
    this.dataDir = null;
    this.dataFile = null;
    this.screenshotsDir = null;
    this.cache = null;
  }

  init() {
    const baseDir = app ? app.getPath('userData') : path.join(__dirname, '..', '.data');
    this.dataDir = baseDir;
    this.dataFile = path.join(this.dataDir, 'qa_data.json');
    this.screenshotsDir = path.join(this.dataDir, 'screenshots');

    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }

    if (!fs.existsSync(this.dataFile)) {
      fs.writeFileSync(this.dataFile, JSON.stringify(defaultData, null, 2), 'utf-8');
      this.cache = JSON.parse(JSON.stringify(defaultData));
    } else {
      try {
        const raw = fs.readFileSync(this.dataFile, 'utf-8');
        this.cache = JSON.parse(raw);
        // Ensure keys exist
        if (!this.cache.scenarios) this.cache.scenarios = defaultData.scenarios;
        if (!this.cache.suites) this.cache.suites = defaultData.suites;
        if (!this.cache.history) this.cache.history = [];
      } catch (err) {
        console.error('Failed to read data file, restoring default:', err);
        this.cache = JSON.parse(JSON.stringify(defaultData));
        this.save();
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.cache, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving data:', e);
    }
  }

  getScenarios() {
    return this.cache?.scenarios || [];
  }

  saveScenario(scenario) {
    if (!this.cache.scenarios) this.cache.scenarios = [];
    const index = this.cache.scenarios.findIndex((s) => s.id === scenario.id);
    const now = new Date().toISOString();
    if (index >= 0) {
      this.cache.scenarios[index] = { ...this.cache.scenarios[index], ...scenario, updatedAt: now };
    } else {
      const newScenario = {
        ...scenario,
        id: scenario.id || `sc-${Date.now()}`,
        createdAt: now,
        updatedAt: now
      };
      this.cache.scenarios.unshift(newScenario);
    }
    this.save();
    return this.cache.scenarios;
  }

  deleteScenario(id) {
    this.cache.scenarios = (this.cache.scenarios || []).filter((s) => s.id !== id);
    // Also remove from any suites
    if (this.cache.suites) {
      this.cache.suites.forEach((suite) => {
        suite.scenarioIds = suite.scenarioIds.filter((sId) => sId !== id);
      });
    }
    this.save();
    return this.cache.scenarios;
  }

  getSuites() {
    return this.cache?.suites || [];
  }

  saveSuite(suite) {
    if (!this.cache.suites) this.cache.suites = [];
    const index = this.cache.suites.findIndex((s) => s.id === suite.id);
    const now = new Date().toISOString();
    if (index >= 0) {
      this.cache.suites[index] = { ...this.cache.suites[index], ...suite, updatedAt: now };
    } else {
      const newSuite = {
        ...suite,
        id: suite.id || `suite-${Date.now()}`,
        createdAt: now,
        updatedAt: now
      };
      this.cache.suites.unshift(newSuite);
    }
    this.save();
    return this.cache.suites;
  }

  deleteSuite(id) {
    this.cache.suites = (this.cache.suites || []).filter((s) => s.id !== id);
    this.save();
    return this.cache.suites;
  }

  getHistory() {
    return this.cache?.history || [];
  }

  addHistory(entry) {
    if (!this.cache.history) this.cache.history = [];
    this.cache.history.unshift(entry);
    // Keep last 50 runs
    if (this.cache.history.length > 50) {
      this.cache.history = this.cache.history.slice(0, 50);
    }
    this.save();
  }

  getScreenshotsDir() {
    return this.screenshotsDir;
  }
}

module.exports = new StorageManager();
