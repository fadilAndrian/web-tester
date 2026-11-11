const TOKEN_KEY = 'qa_auth_token';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
}

// Helper for HTTP requests in Web Server mode
async function fetchJson(url, options = {}) {
  const token = getToken();
  const headers = {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
      if (errorText) {
        const match = errorText.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
        if (match && match[1]) {
          errorMessage = match[1].trim();
        } else {
          const stripped = errorText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          if (stripped) errorMessage = stripped;
        }
      }
    }
    throw new Error(errorMessage);
  }
  return await response.json();
}

export const api = {
  isElectron: () => typeof window !== 'undefined' && Boolean(window.electronAPI),

  // Token Helpers
  getToken,
  setToken,
  clearToken: () => setToken(null),

  // Authentication & Profile
  login: async (credentials) => {
    let result;
    if (window.electronAPI?.login) {
      result = await window.electronAPI.login(credentials);
    } else {
      result = await fetchJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
    }
    if (result && result.token) {
      setToken(result.token);
    }
    return result;
  },

  register: async (userData) => {
    let result;
    if (window.electronAPI?.register) {
      result = await window.electronAPI.register(userData);
    } else {
      result = await fetchJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    }
    if (result && result.token) {
      setToken(result.token);
    }
    return result;
  },

  getMe: async () => {
    const token = getToken();
    if (!token) return null;
    if (window.electronAPI?.getMe) {
      return await window.electronAPI.getMe(token);
    }
    return await fetchJson('/api/auth/me');
  },

  updateProfile: async (data) => {
    const token = getToken();
    if (window.electronAPI?.updateProfile) {
      return await window.electronAPI.updateProfile(data, token);
    }
    return await fetchJson('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Master User Management (Superadmin Only)
  getUsers: async (filters = {}) => {
    const token = getToken();
    if (window.electronAPI?.getUsers) {
      return await window.electronAPI.getUsers(filters, token);
    }
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.role) params.set('role', filters.role);
    if (filters.status) params.set('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await fetchJson(`/api/users${qs}`);
  },

  getUser: async (id) => {
    const token = getToken();
    if (window.electronAPI?.getUser) {
      return await window.electronAPI.getUser(id, token);
    }
    return await fetchJson(`/api/users/${id}`);
  },

  getUserLogs: async (userId) => {
    const token = getToken();
    if (window.electronAPI?.getUserLogs) {
      return await window.electronAPI.getUserLogs(userId, token);
    }
    return await fetchJson(`/api/users/${userId}/logs`);
  },

  createUser: async (userData) => {
    const token = getToken();
    if (window.electronAPI?.createUser) {
      return await window.electronAPI.createUser(userData, token);
    }
    return await fetchJson('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  updateUser: async (id, userData) => {
    const token = getToken();
    if (window.electronAPI?.updateUser) {
      return await window.electronAPI.updateUser(id, userData, token);
    }
    return await fetchJson(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  deleteUser: async (id) => {
    const token = getToken();
    if (window.electronAPI?.deleteUser) {
      return await window.electronAPI.deleteUser(id, token);
    }
    return await fetchJson(`/api/users/${id}`, {
      method: 'DELETE'
    });
  },

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

  // Visual Web Recorder
  startRecorder: async (payload) => {
    if (window.electronAPI?.startRecorder) return await window.electronAPI.startRecorder(payload);
    return await fetchJson('/api/recorder/start', {
      method: 'POST',
      body: JSON.stringify(payload || {})
    });
  },

  stopRecorder: async () => {
    if (window.electronAPI?.stopRecorder) return await window.electronAPI.stopRecorder();
    return await fetchJson('/api/recorder/stop', {
      method: 'POST'
    });
  },

  getRecorderStatus: async () => {
    if (window.electronAPI?.getRecorderStatus) return await window.electronAPI.getRecorderStatus();
    return await fetchJson('/api/recorder/status');
  },

  onRecorderStep: (callback) => {
    if (window.electronAPI?.onRecorderStep) return window.electronAPI.onRecorderStep(callback);

    return api.onTestEvent((type, data) => {
      if (type === 'recorder-step') {
        callback(data);
      } else if (type === 'step-recorded') {
        callback({ step: data, isUpdate: false });
      } else if (type === 'step-updated') {
        callback({ step: data, isUpdate: true });
      }
    });
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
