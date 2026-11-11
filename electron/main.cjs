const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const storage = require('./storage.cjs');
const db = require('./db.cjs');
const runner = require('./runner.cjs');
const auth = require('./auth.cjs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 1020,
    minHeight: 680,
    title: 'QA Flow Studio - Enterprise Automation Platform',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const distHtml = path.join(__dirname, '..', 'dist', 'index.html');
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev && fs.existsSync(distHtml)) {
    mainWindow.loadFile(distHtml);
  } else {
    // Retry connection to Vite dev server
    const loadDevServer = () => {
      mainWindow.loadURL('http://localhost:5173').catch(() => {
        setTimeout(loadDevServer, 500);
      });
    };
    loadDevServer();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  storage.init();
  try {
    await db.init();
  } catch (err) {
    console.error('Failed to init PostgreSQL db:', err);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Register IPC Handlers powered by PostgreSQL
// Projects
ipcMain.handle('get-projects', async () => {
  return db.getProjects();
});

ipcMain.handle('save-project', async (_, project) => {
  return db.saveProject(project);
});

ipcMain.handle('delete-project', async (_, id) => {
  return db.deleteProject(id);
});

// Modules
ipcMain.handle('get-modules', async (_, projectId) => {
  return db.getModules(projectId);
});

ipcMain.handle('save-module', async (_, module) => {
  return db.saveModule(module);
});

ipcMain.handle('delete-module', async (_, id) => {
  return db.deleteModule(id);
});

// Scenarios
ipcMain.handle('get-scenarios', async (_, projectId, moduleId) => {
  return db.getScenarios(projectId, moduleId);
});

ipcMain.handle('save-scenario', async (_, scenario) => {
  await db.saveScenario(scenario);
  return db.getScenarios(scenario.projectId || scenario.project_id);
});

ipcMain.handle('delete-scenario', async (_, id) => {
  await db.deleteScenario(id);
  return true;
});

// Suites
ipcMain.handle('get-suites', async (_, projectId) => {
  return db.getSuites(projectId);
});

ipcMain.handle('save-suite', async (_, suite) => {
  await db.saveSuite(suite);
  return db.getSuites(suite.projectId || suite.project_id);
});

ipcMain.handle('delete-suite', async (_, id) => {
  await db.deleteSuite(id);
  return true;
});

// History / Runs
ipcMain.handle('get-history', async (_, projectId) => {
  return db.getHistory(projectId);
});

// Run Tests
ipcMain.handle('run-test', async (_, payload) => {
  // Clear require cache for runner so any runner updates take effect immediately without restarting Electron
  try {
    delete require.cache[require.resolve('./runner.cjs')];
  } catch (e) {}
  const activeRunner = require('./runner.cjs');

  const { scenarios, options } = payload;
  return activeRunner.run({
    scenarios,
    options,
    onEvent: async (type, data) => {
      if (type === 'run-finish') {
        try {
          await db.addTestRun({
            ...data,
            projectId: options.projectId,
            suiteId: options.suiteId,
            suiteName: options.suiteName
          });
        } catch (saveErr) {
          console.error('Error saving test run to PostgreSQL:', saveErr);
        }
      }

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('test-event', { type, data });
      }
    }
  });
});

ipcMain.handle('stop-test', async () => {
  runner.abort();
  return { success: true };
});

ipcMain.handle('get-screenshot-data', async (_, filename) => {
  try {
    const filePath = path.join(storage.getScreenshotsDir(), path.basename(filename));
    if (fs.existsSync(filePath)) {
      const base64 = fs.readFileSync(filePath).toString('base64');
      return `data:image/png;base64,${base64}`;
    }
  } catch (err) {
    console.error('Error reading screenshot:', err);
  }
  return null;
});

ipcMain.handle('open-screenshot', async (_, filename) => {
  const filePath = path.join(storage.getScreenshotsDir(), path.basename(filename));
  if (fs.existsSync(filePath)) {
    shell.openPath(filePath);
    return true;
  }
  return false;
});

ipcMain.handle('restart-app', () => {
  app.relaunch();
  app.exit(0);
});

// Helper to authenticate IPC calls
function requireIpcSuperadmin(token) {
  const decoded = auth.verifyToken(token);
  if (!decoded || decoded.role !== 'superadmin') {
    throw new Error('Akses ditolak: Hanya Superadmin yang diizinkan.');
  }
  return decoded;
}

// Authentication & Profile IPC Handlers
ipcMain.handle('auth-login', async (_, { email, password }) => {
  if (!email || !password) throw new Error('Email dan kata sandi wajib diisi.');
  const user = await db.getUserByEmail(email);
  if (!user) throw new Error('Email atau kata sandi tidak cocok.');
  if (user.status === 'inactive') throw new Error('Akun dinonaktifkan.');
  if (!auth.verifyPassword(password, user.password_hash)) {
    throw new Error('Email atau kata sandi tidak cocok.');
  }
  const safeUser = auth.sanitizeUser(user);
  const token = auth.generateToken(safeUser);
  return { token, user: safeUser };
});

ipcMain.handle('auth-register', async (_, data) => {
  const { name, email, password, phone } = data;
  if (!name || !email || !password) throw new Error('Nama, email, dan kata sandi wajib diisi.');
  if (password.length < 6) throw new Error('Kata sandi minimal 6 karakter.');
  const user = await db.createUser({
    name,
    email,
    password,
    role: 'tester',
    phone: phone || '',
    status: 'active'
  });
  const token = auth.generateToken(user);
  return { token, user };
});

ipcMain.handle('auth-me', async (_, token) => {
  const decoded = auth.verifyToken(token);
  if (!decoded) throw new Error('Sesi tidak valid.');
  const user = await db.getUserById(decoded.id);
  if (!user || user.status === 'inactive') throw new Error('Akun tidak aktif.');
  return { user: auth.sanitizeUser(user) };
});

ipcMain.handle('auth-profile', async (_, data, token) => {
  const decoded = auth.verifyToken(token);
  if (!decoded) throw new Error('Sesi tidak valid.');
  const user = await db.getUserById(decoded.id);
  if (!user) throw new Error('Pengguna tidak ditemukan.');

  const updatePayload = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    bio: data.bio
  };

  if (data.newPassword && data.newPassword.trim()) {
    if (!data.currentPassword) throw new Error('Kata sandi saat ini wajib diisi.');
    if (!auth.verifyPassword(data.currentPassword, user.password_hash)) {
      throw new Error('Kata sandi saat ini salah.');
    }
    if (data.newPassword.trim().length < 6) {
      throw new Error('Kata sandi baru minimal 6 karakter.');
    }
    updatePayload.password = data.newPassword.trim();
  }

  const updated = await db.updateUser(user.id, updatePayload, { id: user.id, name: user.name });
  return { user: auth.sanitizeUser(updated) };
});

// Master User IPC Handlers (Superadmin Only)
ipcMain.handle('get-users', async (_, filters, token) => {
  requireIpcSuperadmin(token);
  return await db.getUsers(filters);
});

ipcMain.handle('get-user', async (_, id, token) => {
  requireIpcSuperadmin(token);
  const user = await db.getUserById(id);
  if (!user) throw new Error('Pengguna tidak ditemukan.');
  const logs = await db.getUserLogs(id);
  return { user: auth.sanitizeUser(user), logs };
});

ipcMain.handle('get-user-logs', async (_, userId, token) => {
  requireIpcSuperadmin(token);
  return await db.getUserLogs(userId);
});

ipcMain.handle('create-user', async (_, data, token) => {
  const admin = requireIpcSuperadmin(token);
  return await db.createUser(data, { id: admin.id, name: admin.name });
});

ipcMain.handle('update-user', async (_, id, data, token) => {
  const admin = requireIpcSuperadmin(token);
  return await db.updateUser(id, data, { id: admin.id, name: admin.name });
});

ipcMain.handle('delete-user', async (_, id, token) => {
  const admin = requireIpcSuperadmin(token);
  return await db.deleteUser(id, { id: admin.id, name: admin.name });
});
