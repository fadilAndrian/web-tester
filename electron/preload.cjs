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

  // Authentication & Profile
  login: (creds) => ipcRenderer.invoke('auth-login', creds),
  register: (data) => ipcRenderer.invoke('auth-register', data),
  getMe: (token) => ipcRenderer.invoke('auth-me', token),
  updateProfile: (data, token) => ipcRenderer.invoke('auth-profile', data, token),

  // Master User Management (Superadmin)
  getUsers: (filters, token) => ipcRenderer.invoke('get-users', filters, token),
  getUser: (id, token) => ipcRenderer.invoke('get-user', id, token),
  getUserLogs: (userId, token) => ipcRenderer.invoke('get-user-logs', userId, token),
  createUser: (data, token) => ipcRenderer.invoke('create-user', data, token),
  updateUser: (id, data, token) => ipcRenderer.invoke('update-user', id, data, token),
  deleteUser: (id, token) => ipcRenderer.invoke('delete-user', id, token),

  // Visual Web Recorder
  startRecorder: (payload) => ipcRenderer.invoke('start-recorder', payload),
  stopRecorder: () => ipcRenderer.invoke('stop-recorder'),
  getRecorderStatus: () => ipcRenderer.invoke('get-recorder-status'),
  onRecorderStep: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('recorder-step', handler);
    return () => ipcRenderer.removeListener('recorder-step', handler);
  },

  // Live Event listeners
  onTestEvent: (callback) => {
    const handler = (event, { type, data }) => callback(type, data);
    ipcRenderer.on('test-event', handler);
    return () => ipcRenderer.removeListener('test-event', handler);
  }
});
