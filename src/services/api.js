// Fallback mock data when running directly in browser without Electron
const mockDefaultData = {
  projects: [
    {
      id: "proj-health-e-iris",
      name: "Health-E Iris (Dev Staging)",
      description: "Aplikasi Manajemen Rumah Sakit & Pengaturan RBAC",
      base_url: "https://dev-health-e-iris.pixelatee.com",
      color: "#0284c7"
    },
    {
      id: "proj-ecommerce",
      name: "E-Commerce & Todo Portal",
      description: "Pengujian Alur Frontend Checkout & TodoMVC",
      base_url: "https://demo.playwright.dev/todomvc/#/",
      color: "#10b981"
    }
  ],
  modules: [
    { id: "mod-auth", project_id: "proj-health-e-iris", name: "Autentikasi & Akun", sort_order: 1 },
    { id: "mod-rbac", project_id: "proj-health-e-iris", name: "RBAC & Hak Akses", sort_order: 2 }
  ],
  scenarios: [],
  suites: [],
  history: []
};

let localCache = { ...mockDefaultData };

export const api = {
  isElectron: () => typeof window !== 'undefined' && Boolean(window.electronAPI),

  // Projects CRUD
  getProjects: async () => {
    if (window.electronAPI?.getProjects) return await window.electronAPI.getProjects();
    return localCache.projects;
  },

  saveProject: async (project) => {
    if (window.electronAPI?.saveProject) return await window.electronAPI.saveProject(project);
    const idx = localCache.projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      localCache.projects[idx] = { ...project, updated_at: new Date().toISOString() };
    } else {
      localCache.projects.push({ ...project, id: project.id || `proj-${Date.now()}` });
    }
    return project;
  },

  deleteProject: async (id) => {
    if (window.electronAPI?.deleteProject) return await window.electronAPI.deleteProject(id);
    localCache.projects = localCache.projects.filter((p) => p.id !== id);
    return localCache.projects;
  },

  // Modules CRUD
  getModules: async (projectId) => {
    if (window.electronAPI?.getModules) return await window.electronAPI.getModules(projectId);
    return localCache.modules.filter((m) => !projectId || m.project_id === projectId);
  },

  saveModule: async (mod) => {
    if (window.electronAPI?.saveModule) return await window.electronAPI.saveModule(mod);
    const idx = localCache.modules.findIndex((m) => m.id === mod.id);
    if (idx >= 0) {
      localCache.modules[idx] = mod;
    } else {
      localCache.modules.push({ ...mod, id: mod.id || `mod-${Date.now()}` });
    }
    return mod;
  },

  deleteModule: async (id) => {
    if (window.electronAPI?.deleteModule) return await window.electronAPI.deleteModule(id);
    localCache.modules = localCache.modules.filter((m) => m.id !== id);
    return true;
  },

  // Scenarios CRUD (Filtered by Project and optional Module)
  getScenarios: async (projectId, moduleId) => {
    if (window.electronAPI?.getScenarios) return await window.electronAPI.getScenarios(projectId, moduleId);
    return localCache.scenarios.filter((s) => {
      if (projectId && s.projectId !== projectId && s.project_id !== projectId) return false;
      if (moduleId && s.moduleId !== moduleId && s.module_id !== moduleId) return false;
      return true;
    });
  },

  saveScenario: async (scenario) => {
    if (window.electronAPI?.saveScenario) return await window.electronAPI.saveScenario(scenario);
    const idx = localCache.scenarios.findIndex((s) => s.id === scenario.id);
    if (idx >= 0) {
      localCache.scenarios[idx] = { ...scenario, updatedAt: new Date().toISOString() };
    } else {
      localCache.scenarios.unshift({ ...scenario, id: scenario.id || `sc-${Date.now()}` });
    }
    return [...localCache.scenarios];
  },

  deleteScenario: async (id) => {
    if (window.electronAPI?.deleteScenario) return await window.electronAPI.deleteScenario(id);
    localCache.scenarios = localCache.scenarios.filter((s) => s.id !== id);
    return [...localCache.scenarios];
  },

  // Suites CRUD
  getSuites: async (projectId) => {
    if (window.electronAPI?.getSuites) return await window.electronAPI.getSuites(projectId);
    return localCache.suites.filter((s) => !projectId || s.projectId === projectId || s.project_id === projectId);
  },

  saveSuite: async (suite) => {
    if (window.electronAPI?.saveSuite) return await window.electronAPI.saveSuite(suite);
    const idx = localCache.suites.findIndex((s) => s.id === suite.id);
    if (idx >= 0) {
      localCache.suites[idx] = { ...suite, updatedAt: new Date().toISOString() };
    } else {
      localCache.suites.unshift({ ...suite, id: suite.id || `suite-${Date.now()}` });
    }
    return [...localCache.suites];
  },

  deleteSuite: async (id) => {
    if (window.electronAPI?.deleteSuite) return await window.electronAPI.deleteSuite(id);
    localCache.suites = localCache.suites.filter((s) => s.id !== id);
    return [...localCache.suites];
  },

  // History & Runs
  getHistory: async (projectId) => {
    if (window.electronAPI?.getHistory) return await window.electronAPI.getHistory(projectId);
    return localCache.history;
  },

  runTest: async (payload) => {
    if (window.electronAPI?.runTest) return await window.electronAPI.runTest(payload);
    console.log('Simulating test run in browser mode:', payload);
    return { status: 'passed', message: 'Simulated web mode' };
  },

  stopTest: async () => {
    if (window.electronAPI?.stopTest) return await window.electronAPI.stopTest();
    return { success: true };
  },

  getScreenshotData: async (filename) => {
    if (window.electronAPI?.getScreenshotData) return await window.electronAPI.getScreenshotData(filename);
    return null;
  },

  openScreenshot: async (filename) => {
    if (window.electronAPI?.openScreenshot) return await window.electronAPI.openScreenshot(filename);
    return false;
  },

  onTestEvent: (callback) => {
    if (window.electronAPI?.onTestEvent) return window.electronAPI.onTestEvent(callback);
    return () => {};
  }
};
