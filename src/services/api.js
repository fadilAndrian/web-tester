// Helper for HTTP requests in Web Server mode
async function fetchJson(url, options = {}) {
  const headers = {
    'Accept': 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.error) errorMessage = parsed.error;
    } catch (e) {
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }
  return await response.json();
}

export const api = {
  isElectron: () => typeof window !== 'undefined' && Boolean(window.electronAPI),

  // Projects CRUD
  getProjects: async () => {
    if (window.electronAPI?.getProjects) return await window.electronAPI.getProjects();
    return await fetchJson('/api/projects');
  },

  saveProject: async (project) => {
    if (window.electronAPI?.saveProject) return await window.electronAPI.saveProject(project);
    return await fetchJson('/api/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    });
  },

  deleteProject: async (id) => {
    if (window.electronAPI?.deleteProject) return await window.electronAPI.deleteProject(id);
    return await fetchJson(`/api/projects/${id}`, {
      method: 'DELETE'
    });
  },

  // Modules CRUD
  getModules: async (projectId) => {
    if (window.electronAPI?.getModules) return await window.electronAPI.getModules(projectId);
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return await fetchJson(`/api/modules${qs}`);
  },

  saveModule: async (mod) => {
    if (window.electronAPI?.saveModule) return await window.electronAPI.saveModule(mod);
    return await fetchJson('/api/modules', {
      method: 'POST',
      body: JSON.stringify(mod)
    });
  },

  deleteModule: async (id) => {
    if (window.electronAPI?.deleteModule) return await window.electronAPI.deleteModule(id);
    return await fetchJson(`/api/modules/${id}`, {
      method: 'DELETE'
    });
  },

  // Scenarios CRUD (Filtered by Project and optional Module)
  getScenarios: async (projectId, moduleId) => {
    if (window.electronAPI?.getScenarios) return await window.electronAPI.getScenarios(projectId, moduleId);
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', projectId);
    if (moduleId) params.set('moduleId', moduleId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await fetchJson(`/api/scenarios${qs}`);
  },

  saveScenario: async (scenario) => {
    if (window.electronAPI?.saveScenario) return await window.electronAPI.saveScenario(scenario);
    return await fetchJson('/api/scenarios', {
      method: 'POST',
      body: JSON.stringify(scenario)
    });
  },

  deleteScenario: async (id) => {
    if (window.electronAPI?.deleteScenario) return await window.electronAPI.deleteScenario(id);
    return await fetchJson(`/api/scenarios/${id}`, {
      method: 'DELETE'
    });
  },

  // Suites CRUD
  getSuites: async (projectId) => {
    if (window.electronAPI?.getSuites) return await window.electronAPI.getSuites(projectId);
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return await fetchJson(`/api/suites${qs}`);
  },

  saveSuite: async (suite) => {
    if (window.electronAPI?.saveSuite) return await window.electronAPI.saveSuite(suite);
    return await fetchJson('/api/suites', {
      method: 'POST',
      body: JSON.stringify(suite)
    });
  },

  deleteSuite: async (id) => {
    if (window.electronAPI?.deleteSuite) return await window.electronAPI.deleteSuite(id);
    return await fetchJson(`/api/suites/${id}`, {
      method: 'DELETE'
    });
  },

  // History & Runs
  getHistory: async (projectId) => {
    if (window.electronAPI?.getHistory) return await window.electronAPI.getHistory(projectId);
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return await fetchJson(`/api/history${qs}`);
  },

  runTest: async (payload) => {
    if (window.electronAPI?.runTest) return await window.electronAPI.runTest(payload);
    return await fetchJson('/api/run-test', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  stopTest: async () => {
    if (window.electronAPI?.stopTest) return await window.electronAPI.stopTest();
    return await fetchJson('/api/stop-test', {
      method: 'POST'
    });
  },

  getScreenshotData: async (filename) => {
    if (window.electronAPI?.getScreenshotData) return await window.electronAPI.getScreenshotData(filename);
    return `/api/screenshots/${encodeURIComponent(filename)}`;
  },

  openScreenshot: async (filename) => {
    if (window.electronAPI?.openScreenshot) return await window.electronAPI.openScreenshot(filename);
    window.open(`/api/screenshots/${encodeURIComponent(filename)}`, '_blank');
    return true;
  },

  onTestEvent: (callback) => {
    if (window.electronAPI?.onTestEvent) return window.electronAPI.onTestEvent(callback);

    // Web Server Mode: Connect via Server-Sent Events (SSE)
    const eventSource = new EventSource('/api/test-events');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload && payload.type) {
          callback(payload.type, payload.data);
        }
      } catch (e) {
        // Heartbeat or ping event
      }
    };

    eventSource.onerror = (err) => {
      console.warn('SSE connection warning:', err);
    };

    return () => {
      eventSource.close();
    };
  }
};
