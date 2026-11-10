const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Projects
  getProjects: () => ipcRenderer.invoke('get-projects'),
  saveProject: (project) => ipcRenderer.invoke('save-project', project),
  deleteProject: (id) => ipcRenderer.invoke('delete-project', id),

  // Modules / Folders
  getModules: (projectId) => ipcRenderer.invoke('get-modules', projectId),
  saveModule: (module) => ipcRenderer.invoke('save-module', module),
  deleteModule: (id) => ipcRenderer.invoke('delete-module', id),

  // Scenarios
  getScenarios: (projectId, moduleId) => ipcRenderer.invoke('get-scenarios', projectId, moduleId),
  saveScenario: (scenario) => ipcRenderer.invoke('save-scenario', scenario),
  deleteScenario: (id) => ipcRenderer.invoke('delete-scenario', id),

  // Suites
  getSuites: (projectId) => ipcRenderer.invoke('get-suites', projectId),
  saveSuite: (suite) => ipcRenderer.invoke('save-suite', suite),
  deleteSuite: (id) => ipcRenderer.invoke('delete-suite', id),

  // History & Runs
  getHistory: (projectId) => ipcRenderer.invoke('get-history', projectId),
  runTest: (payload) => ipcRenderer.invoke('run-test', payload),
  stopTest: () => ipcRenderer.invoke('stop-test'),

  // Screenshots
  getScreenshotData: (filename) => ipcRenderer.invoke('get-screenshot-data', filename),
  openScreenshot: (filename) => ipcRenderer.invoke('open-screenshot', filename),
  restartApp: () => ipcRenderer.invoke('restart-app'),

  // Live Event listeners
  onTestEvent: (callback) => {
    const handler = (event, { type, data }) => callback(type, data);
    ipcRenderer.on('test-event', handler);
    return () => ipcRenderer.removeListener('test-event', handler);
  }
});
