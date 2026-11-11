const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./electron/db.cjs');
const runner = require('./electron/runner.cjs');
const storage = require('./electron/storage.cjs');
const auth = require('./electron/auth.cjs');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Initialize storage & database
storage.init();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Active SSE client connections
const sseClients = new Set();

function broadcastTestEvent(type, data) {
  const payload = `data: ${JSON.stringify({ type, data })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

// Keep SSE connections alive with periodic heartbeat comments
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': ping\n\n');
    } catch (e) {
      sseClients.delete(client);
    }
  }
}, 20000);

// Health Check
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    database: {
      connected: db.isConnected
    },
    version: '1.1.0'
  });
});

// ==========================================
// Authentication & User Management Middleware
// ==========================================
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token autentikasi diperlukan.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = auth.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Sesi login telah kedaluwarsa atau tidak valid.' });
    }
    const user = await db.getUserById(decoded.id);
    if (!user || user.status === 'inactive') {
      return res.status(401).json({ error: 'Akun tidak ditemukan atau berstatus nonaktif.' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Verifikasi autentikasi gagal: ' + err.message });
  }
}

async function requireSuperadmin(req, res, next) {
  authenticate(req, res, () => {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Akses ditolak: Hanya Superadmin yang diizinkan mengelola Master User.' });
    }
    next();
  });
}

// ==========================================
// Auth Endpoints
// ==========================================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan kata sandi wajib diisi.' });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Email atau kata sandi tidak cocok.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Akun Anda dinonaktifkan. Hubungi Superadministrator.' });
    }

    const isValid = auth.verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Email atau kata sandi tidak cocok.' });
    }

    const safeUser = auth.sanitizeUser(user);
    const token = auth.generateToken(safeUser);

    res.json({
      token,
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register Endpoint (Public registration disabled: users only registered by Superadmin via Master User)
app.post('/api/auth/register', (req, res) => {
  return res.status(403).json({
    error: 'Pendaftaran publik dinonaktifkan. Pengguna hanya dapat didaftarkan oleh Superadministrator melalui menu Master User.'
  });
});

// Get Current Logged-in User
app.get('/api/auth/me', authenticate, async (req, res) => {
  res.json({
    user: auth.sanitizeUser(req.user)
  });
});

// Update Current User's Profile
app.put('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const { name, email, phone, bio, currentPassword, newPassword } = req.body;
    const updatePayload = {
      name,
      email,
      phone,
      bio
    };

    // If changing password, verify current password first
    if (newPassword && newPassword.trim()) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Kata sandi saat ini wajib diisi untuk mengubah kata sandi baru.' });
      }
      const isCurrentValid = auth.verifyPassword(currentPassword, req.user.password_hash);
      if (!isCurrentValid) {
        return res.status(400).json({ error: 'Kata sandi saat ini salah.' });
      }
      if (newPassword.trim().length < 6) {
        return res.status(400).json({ error: 'Kata sandi baru minimal 6 karakter.' });
      }
      updatePayload.password = newPassword.trim();
    }

    // Ensure users cannot self-escalate role or status via profile endpoint
    const updated = await db.updateUser(req.user.id, updatePayload, {
      id: req.user.id,
      name: req.user.name
    });

    res.json({
      user: auth.sanitizeUser(updated)
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// Master User Management (Superadmin Only)
// ==========================================

// List users with search and filter
app.get('/api/users', requireSuperadmin, async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const users = await db.getUsers({ search, role, status });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single user detail
app.get('/api/users/:id', requireSuperadmin, async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    }
    const logs = await db.getUserLogs(req.params.id);
    res.json({
      user: auth.sanitizeUser(user),
      logs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user change logs
app.get('/api/users/:id/logs', requireSuperadmin, async (req, res) => {
  try {
    const logs = await db.getUserLogs(req.params.id);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create user by Superadmin
app.post('/api/users', requireSuperadmin, async (req, res) => {
  try {
    const { name, email, password, role, phone, bio, status } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Nama dan email wajib diisi.' });
    }
    const created = await db.createUser(
      {
        name,
        email,
        password,
        role: role === 'superadmin' ? 'superadmin' : 'tester',
        phone,
        bio,
        status: status || 'active'
      },
      {
        id: req.user.id,
        name: req.user.name
      }
    );
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update user by Superadmin
app.put('/api/users/:id', requireSuperadmin, async (req, res) => {
  try {
    const updated = await db.updateUser(req.params.id, req.body, {
      id: req.user.id,
      name: req.user.name
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user by Superadmin
app.delete('/api/users/:id', requireSuperadmin, async (req, res) => {
  try {
    await db.deleteUser(req.params.id, {
      id: req.user.id,
      name: req.user.name
    });
    res.json({ success: true, message: 'Pengguna berhasil dihapus.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Projects CRUD
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.getProjects();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const saved = await db.saveProject(req.body);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const projects = await db.deleteProject(req.params.id);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modules CRUD
app.get('/api/modules', async (req, res) => {
  try {
    const modules = await db.getModules(req.query.projectId);
    res.json(modules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/modules', async (req, res) => {
  try {
    const saved = await db.saveModule(req.body);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/modules/:id', async (req, res) => {
  try {
    await db.deleteModule(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scenarios CRUD
app.get('/api/scenarios', async (req, res) => {
  try {
    const scenarios = await db.getScenarios(req.query.projectId, req.query.moduleId);
    res.json(scenarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/scenarios', async (req, res) => {
  try {
    const saved = await db.saveScenario(req.body);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/scenarios/:id', async (req, res) => {
  try {
    await db.deleteScenario(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Suites CRUD
app.get('/api/suites', async (req, res) => {
  try {
    const suites = await db.getSuites(req.query.projectId);
    res.json(suites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/suites', async (req, res) => {
  try {
    const saved = await db.saveSuite(req.body);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/suites/:id', async (req, res) => {
  try {
    await db.deleteSuite(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// History & Test Runs
app.get('/api/history', async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const history = await db.getHistory(req.query.projectId, limit);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/history', async (req, res) => {
  try {
    const saved = await db.addTestRun(req.body);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SSE Stream for Live Test Events
app.get('/api/test-events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  res.write(': connected\n\n');
  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Runner Endpoints
app.post('/api/run-test', async (req, res) => {
  try {
    const { scenarios = [], options = {} } = req.body;

    // Run test asynchronously
    const runPromise = runner.run({
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
        broadcastTestEvent(type, data);
      }
    });

    // Await run completion so caller gets full summary
    const result = await runPromise;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stop-test', (req, res) => {
  try {
    runner.abort();
    broadcastTestEvent('log', { level: 'warn', message: 'Uji coba dihentikan oleh pengguna.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Screenshots
app.use('/api/screenshots', express.static(storage.getScreenshotsDir()));

app.get('/api/screenshot-data/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(storage.getScreenshotsDir(), filename);
    if (fs.existsSync(filePath)) {
      const base64 = fs.readFileSync(filePath).toString('base64');
      res.json({ data: `data:image/png;base64,${base64}` });
    } else {
      res.status(404).json({ error: 'Screenshot not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend static build
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/health')) {
      return res.sendFile(path.join(distDir, 'index.html'));
    }
    next();
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>QA Flow Studio - Server Ready</title></head>
        <body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; line-height: 1.6; color: #333;">
          <h2>QA Flow Studio Backend Server</h2>
          <p>Backend API & Runner are active and connected to PostgreSQL!</p>
          <p>Untuk menyajikan frontend web, jalankan perintah build terlebih dahulu:</p>
          <pre style="background: #f4f4f4; padding: 12px; border-radius: 6px;">npm run build</pre>
          <p>Setelah di-build, muat ulang halaman ini untuk melihat tampilan antarmuka QA Flow Studio.</p>
        </body>
      </html>
    `);
  });
}

// Start Server
async function startServer() {
  try {
    await db.init();
  } catch (e) {
    console.error('Warning: Database failed to initialize at boot:', e.message);
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`=======================================================`);
    console.log(`🚀 QA Flow Studio Server is running!`);
    console.log(`   URL: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`   PostgreSQL: ${db.isConnected ? 'Connected' : 'Offline / Retrying'}`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Server] Port ${PORT} already in use. Server is likely already running.`);
    } else {
      console.error('[Server] Server error:', err);
    }
  });
}

startServer();

// Graceful termination
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down QA Flow Studio server...');
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, closing server...');
  process.exit(0);
});
