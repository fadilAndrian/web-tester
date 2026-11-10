const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./electron/db.cjs');
const runner = require('./electron/runner.cjs');
const storage = require('./electron/storage.cjs');

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

  app.listen(PORT, HOST, () => {
    console.log(`=======================================================`);
    console.log(`🚀 QA Flow Studio Server is running!`);
    console.log(`   URL: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`   PostgreSQL: ${db.isConnected ? 'Connected' : 'Offline / Retrying'}`);
    console.log(`=======================================================`);
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
