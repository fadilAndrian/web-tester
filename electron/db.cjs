const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  async init() {
    let config = {};

    if (process.env.DATABASE_URL) {
      config = {
        connectionString: process.env.DATABASE_URL,
        max: Number(process.env.PGMAX) || 10,
        idleTimeoutMillis: 30000
      };
      if (
        process.env.DATABASE_SSL === 'true' ||
        process.env.PGSSL === 'true' ||
        process.env.DATABASE_URL.includes('sslmode=require')
      ) {
        config.ssl = { rejectUnauthorized: false };
      }
    } else {
      config = {
        user: process.env.PGUSER || process.env.USER || 'konnco',
        password: process.env.PGPASSWORD || undefined,
        host: process.env.PGHOST || '127.0.0.1',
        database: process.env.PGDATABASE || 'qa_flow_studio',
        port: Number(process.env.PGPORT) || 5432,
        max: Number(process.env.PGMAX) || 10,
        idleTimeoutMillis: 30000
      };
      if (process.env.DATABASE_SSL === 'true' || process.env.PGSSL === 'true') {
        config.ssl = { rejectUnauthorized: false };
      }
    }

    this.pool = new Pool(config);

    try {
      const client = await this.pool.connect();
      this.isConnected = true;
      const dbIdentifier = config.database || (process.env.DATABASE_URL ? 'DATABASE_URL' : 'qa_flow_studio');
      console.log('PostgreSQL Connected successfully to database:', dbIdentifier);
      client.release();

      await this.ensureSchema();
      await this.seedInitialData();
    } catch (err) {
      this.isConnected = false;
      console.error('PostgreSQL Connection error:', err.message);
    }
  }

  async ensureSchema() {
    const query = `
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        base_url VARCHAR(500),
        color VARCHAR(20) DEFAULT '#f59e0b',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS modules (
        id VARCHAR(50) PRIMARY KEY,
        project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS scenarios (
        id VARCHAR(50) PRIMARY KEY,
        project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
        module_id VARCHAR(50) REFERENCES modules(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        base_url VARCHAR(500),
        auth_config JSONB DEFAULT '{}'::jsonb,
        steps JSONB DEFAULT '[]'::jsonb,
        tags JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS suites (
        id VARCHAR(50) PRIMARY KEY,
        project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        scenario_ids JSONB DEFAULT '[]'::jsonb,
        keep_session BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS test_runs (
        id VARCHAR(50) PRIMARY KEY,
        project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
        suite_id VARCHAR(50) REFERENCES suites(id) ON DELETE SET NULL,
        suite_name VARCHAR(255),
        start_time TIMESTAMPTZ DEFAULT NOW(),
        duration_ms INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'passed',
        total_scenarios INT DEFAULT 0,
        passed_scenarios INT DEFAULT 0,
        failed_scenarios INT DEFAULT 0,
        scenario_results JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_scenarios_project ON scenarios(project_id);
      CREATE INDEX IF NOT EXISTS idx_scenarios_module ON scenarios(module_id);
      CREATE INDEX IF NOT EXISTS idx_suites_project ON suites(project_id);
      CREATE INDEX IF NOT EXISTS idx_test_runs_project ON test_runs(project_id);
      CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
      CREATE INDEX IF NOT EXISTS idx_scenarios_auth ON scenarios USING gin (auth_config);
      CREATE INDEX IF NOT EXISTS idx_test_runs_results ON test_runs USING gin (scenario_results);
    `;
    await this.pool.query(query);
  }

  async seedInitialData() {
    const { rows: projCount } = await this.pool.query('SELECT count(*) FROM projects');
    if (parseInt(projCount[0].count, 10) > 0) return;

    console.log('Seeding initial projects & migrating scenarios into PostgreSQL...');

    // 1. Create Default Projects
    const p1 = {
      id: 'proj-health-e-iris',
      name: 'Health-E Iris (Dev Staging)',
      description: 'Aplikasi Manajemen Rumah Sakit & Pengaturan RBAC',
      base_url: 'https://dev-health-e-iris.pixelatee.com',
      color: '#0284c7'
    };
    const p2 = {
      id: 'proj-ecommerce',
      name: 'E-Commerce & Todo Portal',
      description: 'Pengujian Alur Frontend Checkout & TodoMVC',
      base_url: 'https://demo.playwright.dev/todomvc/#/',
      color: '#10b981'
    };
    const p3 = {
      id: 'proj-wiki',
      name: 'Knowledge Base (Wikipedia ID)',
      description: 'Pengujian Pencarian & Navigasi Konten Publik',
      base_url: 'https://id.wikipedia.org',
      color: '#f59e0b'
    };

    for (const p of [p1, p2, p3]) {
      await this.pool.query(
        'INSERT INTO projects (id, name, description, base_url, color) VALUES ($1, $2, $3, $4, $5)',
        [p.id, p.name, p.description, p.base_url, p.color]
      );
    }

    // 2. Create Modules for Health-E Iris
    const m1 = { id: 'mod-auth', project_id: p1.id, name: 'Autentikasi & Akun', sort_order: 1 };
    const m2 = { id: 'mod-rbac', project_id: p1.id, name: 'RBAC & Hak Akses', sort_order: 2 };
    const m3 = { id: 'mod-data', project_id: p1.id, name: 'Master Data & Pasien', sort_order: 3 };

    for (const m of [m1, m2, m3]) {
      await this.pool.query(
        'INSERT INTO modules (id, project_id, name, sort_order) VALUES ($1, $2, $3, $4)',
        [m.id, m.project_id, m.name, m.sort_order]
      );
    }

    // 3. Migrate scenarios from qa_data.json if exists
    try {
      const candidates = [
        path.join(process.env.HOME || '', 'Library/Application Support/qa-desktop-app/qa_data.json'),
        path.join(__dirname, '..', '.data', 'qa_data.json'),
        path.join(__dirname, 'defaultData.cjs')
      ];

      let sourceData = null;
      for (const c of candidates) {
        if (fs.existsSync(c)) {
          if (c.endsWith('.json')) {
            sourceData = JSON.parse(fs.readFileSync(c, 'utf-8'));
          } else {
            sourceData = require(c);
          }
          break;
        }
      }

      if (sourceData && Array.isArray(sourceData.scenarios)) {
        for (const sc of sourceData.scenarios) {
          let assignedProj = p2.id;
          let assignedMod = null;

          if (sc.baseUrl && sc.baseUrl.includes('pixelatee.com')) {
            assignedProj = p1.id;
            assignedMod = sc.name.toLowerCase().includes('rbac') ? m2.id : m1.id;
          } else if (sc.baseUrl && sc.baseUrl.includes('wikipedia')) {
            assignedProj = p3.id;
          }

          await this.pool.query(
            `INSERT INTO scenarios (id, project_id, module_id, name, description, base_url, auth_config, steps, tags)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO UPDATE SET
               project_id = EXCLUDED.project_id,
               module_id = EXCLUDED.module_id,
               name = EXCLUDED.name,
               description = EXCLUDED.description,
               base_url = EXCLUDED.base_url,
               auth_config = EXCLUDED.auth_config,
               steps = EXCLUDED.steps,
               updated_at = NOW()`,
            [
              sc.id,
              assignedProj,
              assignedMod,
              sc.name,
              sc.description || '',
              sc.baseUrl || '',
              JSON.stringify(sc.authConfig || {}),
              JSON.stringify(sc.steps || []),
              JSON.stringify(sc.tags || ['regression'])
            ]
          );
        }
      }

      // Seed default suite
      await this.pool.query(
        `INSERT INTO suites (id, project_id, name, description, scenario_ids, keep_session)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
        [
          'suite-rbac-flow',
          p1.id,
          'Suite RBAC & Security Test',
          'Rangkaian pengujian hak akses dan permission role.',
          JSON.stringify(['sc-1794238666560']),
          true
        ]
      );
    } catch (migErr) {
      console.warn('Data migration warning:', migErr.message);
    }
  }

  // Projects CRUD
  async getProjects() {
    const { rows } = await this.pool.query('SELECT * FROM projects ORDER BY created_at ASC');
    return rows;
  }

  async saveProject(proj) {
    const id = proj.id || `proj-${Date.now()}`;
    const now = new Date();
    const query = `
      INSERT INTO projects (id, name, description, base_url, color, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        base_url = EXCLUDED.base_url,
        color = EXCLUDED.color,
        updated_at = EXCLUDED.updated_at
      RETURNING *;
    `;
    const { rows } = await this.pool.query(query, [
      id,
      proj.name,
      proj.description || '',
      proj.base_url || '',
      proj.color || '#f59e0b',
      proj.created_at || now,
      now
    ]);
    return rows[0];
  }

  async deleteProject(id) {
    await this.pool.query('DELETE FROM projects WHERE id = $1', [id]);
    return await this.getProjects();
  }

  // Modules CRUD
  async getModules(projectId) {
    const query = projectId
      ? 'SELECT * FROM modules WHERE project_id = $1 ORDER BY sort_order ASC, created_at ASC'
      : 'SELECT * FROM modules ORDER BY sort_order ASC';
    const params = projectId ? [projectId] : [];
    const { rows } = await this.pool.query(query, params);
    return rows;
  }

  async saveModule(mod) {
    const id = mod.id || `mod-${Date.now()}`;
    const query = `
      INSERT INTO modules (id, project_id, name, description, sort_order)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        sort_order = EXCLUDED.sort_order
      RETURNING *;
    `;
    const { rows } = await this.pool.query(query, [
      id,
      mod.project_id,
      mod.name,
      mod.description || '',
      mod.sort_order || 0
    ]);
    return rows[0];
  }

  async deleteModule(id) {
    await this.pool.query('DELETE FROM modules WHERE id = $1', [id]);
    return true;
  }

  // Scenarios CRUD
  async getScenarios(projectId, moduleId = null) {
    let query = 'SELECT * FROM scenarios WHERE 1=1';
    const params = [];

    if (projectId) {
      params.push(projectId);
      query += ` AND project_id = $${params.length}`;
    }
    if (moduleId) {
      params.push(moduleId);
      query += ` AND module_id = $${params.length}`;
    }

    query += ' ORDER BY updated_at DESC';
    const { rows } = await this.pool.query(query, params);

    // Format row properties for frontend
    return rows.map((r) => ({
      ...r,
      projectId: r.project_id,
      moduleId: r.module_id,
      baseUrl: r.base_url,
      authConfig: r.auth_config || {},
      steps: r.steps || [],
      tags: r.tags || [],
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  async saveScenario(scenario) {
    const id = scenario.id || `sc-${Date.now()}`;
    const now = new Date();
    const query = `
      INSERT INTO scenarios (id, project_id, module_id, name, description, base_url, auth_config, steps, tags, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        project_id = EXCLUDED.project_id,
        module_id = EXCLUDED.module_id,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        base_url = EXCLUDED.base_url,
        auth_config = EXCLUDED.auth_config,
        steps = EXCLUDED.steps,
        tags = EXCLUDED.tags,
        updated_at = EXCLUDED.updated_at
      RETURNING *;
    `;

    const { rows } = await this.pool.query(query, [
      id,
      scenario.projectId || scenario.project_id,
      scenario.moduleId || scenario.module_id || null,
      scenario.name,
      scenario.description || '',
      scenario.baseUrl || scenario.base_url || '',
      JSON.stringify(scenario.authConfig || {}),
      JSON.stringify(scenario.steps || []),
      JSON.stringify(scenario.tags || []),
      scenario.createdAt || now,
      now
    ]);

    const saved = rows[0];
    return {
      ...saved,
      projectId: saved.project_id,
      moduleId: saved.module_id,
      baseUrl: saved.base_url,
      authConfig: saved.auth_config || {},
      steps: saved.steps || [],
      tags: saved.tags || []
    };
  }

  async deleteScenario(id) {
    await this.pool.query('DELETE FROM scenarios WHERE id = $1', [id]);
    return true;
  }

  // Suites CRUD
  async getSuites(projectId) {
    let query = 'SELECT * FROM suites WHERE 1=1';
    const params = [];
    if (projectId) {
      params.push(projectId);
      query += ` AND project_id = $${params.length}`;
    }
    query += ' ORDER BY updated_at DESC';
    const { rows } = await this.pool.query(query, params);

    return rows.map((r) => ({
      ...r,
      projectId: r.project_id,
      scenarioIds: r.scenario_ids || [],
      keepSession: r.keep_session,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  async saveSuite(suite) {
    const id = suite.id || `suite-${Date.now()}`;
    const now = new Date();
    const query = `
      INSERT INTO suites (id, project_id, name, description, scenario_ids, keep_session, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        project_id = EXCLUDED.project_id,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        scenario_ids = EXCLUDED.scenario_ids,
        keep_session = EXCLUDED.keep_session,
        updated_at = EXCLUDED.updated_at
      RETURNING *;
    `;
    const { rows } = await this.pool.query(query, [
      id,
      suite.projectId || suite.project_id,
      suite.name,
      suite.description || '',
      JSON.stringify(suite.scenarioIds || []),
      Boolean(suite.keepSession),
      suite.createdAt || now,
      now
    ]);
    const saved = rows[0];
    return {
      ...saved,
      projectId: saved.project_id,
      scenarioIds: saved.scenario_ids || [],
      keepSession: saved.keep_session
    };
  }

  async deleteSuite(id) {
    await this.pool.query('DELETE FROM suites WHERE id = $1', [id]);
    return true;
  }

  // Test Runs / History CRUD
  async getHistory(projectId = null, limit = 50) {
    let query = 'SELECT * FROM test_runs WHERE 1=1';
    const params = [];
    if (projectId) {
      params.push(projectId);
      query += ` AND project_id = $${params.length}`;
    }
    params.push(limit);
    query += ` ORDER BY start_time DESC LIMIT $${params.length}`;

    const { rows } = await this.pool.query(query, params);
    return rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      suiteId: r.suite_id,
      suiteName: r.suite_name,
      startTime: r.start_time,
      durationMs: r.duration_ms,
      status: r.status,
      totalScenarios: r.total_scenarios,
      passedScenarios: r.passed_scenarios,
      failedScenarios: r.failed_scenarios,
      scenarioResults: r.scenario_results || []
    }));
  }

  async addTestRun(run) {
    const id = run.id || `run-${Date.now()}`;
    const query = `
      INSERT INTO test_runs (
        id, project_id, suite_id, suite_name, start_time, duration_ms,
        status, total_scenarios, passed_scenarios, failed_scenarios, scenario_results
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const { rows } = await this.pool.query(query, [
      id,
      run.projectId || run.project_id || null,
      run.suiteId || run.suite_id || null,
      run.suiteName || run.suite_name || null,
      run.startTime || new Date(),
      run.durationMs || 0,
      run.failedScenarios === 0 ? 'passed' : 'failed',
      run.totalScenarios || 0,
      run.passedScenarios || 0,
      run.failedScenarios || 0,
      JSON.stringify(run.scenarioResults || [])
    ]);
    return rows[0];
  }
}

module.exports = new DatabaseManager();
