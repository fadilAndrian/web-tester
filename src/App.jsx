import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ScenarioList from './components/ScenarioList';
import ScenarioEditor from './components/ScenarioEditor';
import SuiteList from './components/SuiteList';
import SuiteEditor from './components/SuiteEditor';
import LiveRunnerModal from './components/LiveRunnerModal';
import ImageViewerModal from './components/ImageViewerModal';
import TargetHistoryModal from './components/TargetHistoryModal';
import ProjectModal from './components/ProjectModal';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('scenarios'); // 'scenarios' | 'suites' | 'history'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'edit-scenario' | 'edit-suite'

  // Multi-Project & Module State
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const [scenarios, setScenarios] = useState([]);
  const [suites, setSuites] = useState([]);
  const [history, setHistory] = useState([]);

  const [editingScenario, setEditingScenario] = useState(null);
  const [editingSuite, setEditingSuite] = useState(null);

  // Filament Dark / Light Mode state
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('qa_filament_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('qa_filament_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('qa_filament_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Live Runner Modal State
  const [runnerState, setRunnerState] = useState({
    isOpen: false,
    title: '',
    scenariosToRun: [],
    keepSession: false,
    suiteId: null,
    suiteName: null,
    projectId: null
  });

  // Target History Modal State (per scenario / per suite)
  const [targetHistoryState, setTargetHistoryState] = useState({
    isOpen: false,
    targetType: 'scenario', // 'scenario' | 'suite'
    targetId: null,
    targetName: ''
  });

  // Image Viewer State
  const [viewingScreenshot, setViewingScreenshot] = useState(null);

  // Load data scoped to active project
  const loadData = useCallback(async (targetProjId) => {
    try {
      const pList = await api.getProjects();
      setProjects(pList || []);

      const chosenProjId = targetProjId || activeProjectId || (pList && pList[0]?.id) || null;
      if (!activeProjectId && chosenProjId) {
        setActiveProjectId(chosenProjId);
      }

      if (chosenProjId) {
        const [mList, scList, stList, hList] = await Promise.all([
          api.getModules(chosenProjId),
          api.getScenarios(chosenProjId),
          api.getSuites(chosenProjId),
          api.getHistory(chosenProjId)
        ]);

        setModules(mList || []);
        setScenarios(scList || []);
        setSuites(stList || []);
        setHistory(hList || []);
      } else {
        const [scList, stList, hList] = await Promise.all([
          api.getScenarios(),
          api.getSuites(),
          api.getHistory()
        ]);
        setScenarios(scList || []);
        setSuites(stList || []);
        setHistory(hList || []);
      }
    } catch (err) {
      console.error('Failed to load project data:', err);
    }
  }, [activeProjectId]);

  useEffect(() => {
    loadData();
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  // Project Handlers
  const handleSelectProject = async (projectId) => {
    setActiveProjectId(projectId);
    setActiveModuleId(null);
    setViewMode('list');
    await loadData(projectId);
  };

  const handleSaveProject = async (project) => {
    await api.saveProject(project);
    const pList = await api.getProjects();
    setProjects(pList || []);
    if (!activeProjectId || activeProjectId === project.id) {
      setActiveProjectId(project.id);
      await loadData(project.id);
    }
  };

  const handleDeleteProject = async (projectId) => {
    await api.deleteProject(projectId);
    const pList = await api.getProjects();
    setProjects(pList || []);
    const nextProj = pList[0]?.id || null;
    setActiveProjectId(nextProj);
    setActiveModuleId(null);
    if (nextProj) {
      await loadData(nextProj);
    }
  };

  // Module Handlers
  const handleSelectModule = (moduleId) => {
    setActiveModuleId(moduleId);
  };

  const handleAddModule = async () => {
    const curProjId = activeProjectId || activeProject?.id;
    if (!curProjId) {
      alert('Pilih projek terlebih dahulu.');
      return;
    }
    const name = window.prompt('Masukkan Nama Folder / Modul Baru (contoh: Autentikasi, Role & Permisi, Checkout):');
    if (name && name.trim()) {
      const newMod = {
        id: `mod-${Date.now()}`,
        project_id: curProjId,
        projectId: curProjId,
        name: name.trim(),
        sort_order: (modules || []).length + 1
      };
      await api.saveModule(newMod);
      const updatedMods = await api.getModules(curProjId);
      setModules(updatedMods || []);
      setActiveModuleId(newMod.id);
    }
  };

  // History target modal triggers
  const handleViewScenarioHistory = (scenario) => {
    setTargetHistoryState({
      isOpen: true,
      targetType: 'scenario',
      targetId: scenario.id,
      targetName: scenario.name
    });
  };

  const handleViewSuiteHistory = (suite) => {
    setTargetHistoryState({
      isOpen: true,
      targetType: 'suite',
      targetId: suite.id,
      targetName: suite.name
    });
  };

  // Scenario handlers
  const handleNewScenario = () => {
    setEditingScenario({
      projectId: activeProjectId || activeProject?.id,
      moduleId: activeModuleId || ''
    });
    setViewMode('edit-scenario');
  };

  const handleEditScenario = (scenario) => {
    setEditingScenario(scenario);
    setViewMode('edit-scenario');
  };

  const handleSaveScenario = async (savedScenario) => {
    const projId = savedScenario.projectId || savedScenario.project_id || activeProjectId || activeProject?.id;
    const toSave = { ...savedScenario, projectId: projId };
    await api.saveScenario(toSave);
    await loadData(projId);
    setEditingScenario(toSave);
    return toSave;
  };

  const handleSaveAndRunScenario = async (savedScenario) => {
    const projId = savedScenario.projectId || savedScenario.project_id || activeProjectId || activeProject?.id;
    const toSave = { ...savedScenario, projectId: projId };
    await api.saveScenario(toSave);
    await loadData(projId);
    setEditingScenario(toSave);
    handleRunScenario(toSave);
    return toSave;
  };

  const handleDeleteScenario = async (id) => {
    if (confirm('Yakin ingin menghapus skenario ini?')) {
      await api.deleteScenario(id);
      await loadData(activeProjectId || activeProject?.id);
    }
  };

  const handleDuplicateScenario = async (scenario) => {
    const projId = scenario.projectId || scenario.project_id || activeProjectId || activeProject?.id;
    const duplicated = {
      ...scenario,
      id: `sc-${Date.now()}`,
      projectId: projId,
      name: `${scenario.name} (Salinan)`,
      createdAt: new Date().toISOString()
    };
    await api.saveScenario(duplicated);
    await loadData(projId);
  };

  const handleRunScenario = (scenario) => {
    setRunnerState({
      isOpen: true,
      title: `Jalankan: ${scenario.name}`,
      scenariosToRun: [scenario],
      keepSession: false,
      suiteId: null,
      suiteName: null,
      projectId: scenario.projectId || scenario.project_id || activeProjectId || activeProject?.id
    });
  };

  // Suite handlers
  const handleNewSuite = () => {
    setEditingSuite({
      projectId: activeProjectId || activeProject?.id
    });
    setViewMode('edit-suite');
  };

  const handleEditSuite = (suite) => {
    setEditingSuite(suite);
    setViewMode('edit-suite');
  };

  const handleSaveSuite = async (savedSuite) => {
    const projId = savedSuite.projectId || savedSuite.project_id || activeProjectId || activeProject?.id;
    const toSave = { ...savedSuite, projectId: projId };
    await api.saveSuite(toSave);
    await loadData(projId);
    setEditingSuite(toSave);
    return toSave;
  };

  const handleSaveAndRunSuite = async (savedSuite) => {
    const projId = savedSuite.projectId || savedSuite.project_id || activeProjectId || activeProject?.id;
    const toSave = { ...savedSuite, projectId: projId };
    await api.saveSuite(toSave);
    await loadData(projId);
    setEditingSuite(toSave);
    handleRunSuite(toSave);
    return toSave;
  };

  const handleDeleteSuite = async (id) => {
    if (confirm('Yakin ingin menghapus test suite ini?')) {
      await api.deleteSuite(id);
      await loadData(activeProjectId || activeProject?.id);
    }
  };

  const handleRunSuite = (suite) => {
    const scenarioMap = scenarios.reduce((acc, s) => {
      acc[s.id] = s;
      return acc;
    }, {});

    const orderedScenarios = (suite.scenarioIds || [])
      .map((id) => scenarioMap[id])
      .filter(Boolean);

    if (orderedScenarios.length === 0) {
      alert('Test suite ini belum memiliki skenario pengujian.');
      return;
    }

    setRunnerState({
      isOpen: true,
      title: `Jalankan Suite: ${suite.name}`,
      scenariosToRun: orderedScenarios,
      keepSession: suite.keepSession || false,
      suiteId: suite.id,
      suiteName: suite.name,
      projectId: suite.projectId || suite.project_id || activeProjectId || activeProject?.id
    });
  };

  const handleTopAction = () => {
    if (activeTab === 'scenarios') handleNewScenario();
    else if (activeTab === 'suites') handleNewSuite();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 font-sans select-none antialiased">
      {/* Filament Left Sidebar */}
      <Sidebar
        activeProject={activeProject}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setViewMode('list');
        }}
        scenarioCount={scenarios.length}
        suiteCount={suites.length}
        historyCount={history.length}
        onNewScenario={handleNewScenario}
        onNewSuite={handleNewSuite}
      />

      {/* Main Surface Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Filament Topbar */}
        <Topbar
          activeTab={activeTab}
          viewMode={viewMode}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onNewAction={handleTopAction}
          onBackToList={() => setViewMode('list')}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-950 transition-colors duration-150">
          {viewMode === 'edit-scenario' && (
            <ScenarioEditor
              scenario={editingScenario}
              modules={modules}
              activeProjectId={activeProjectId || activeProject?.id}
              activeModuleId={activeModuleId}
              onSave={handleSaveScenario}
              onSaveAndRun={handleSaveAndRunScenario}
              onBack={() => setViewMode('list')}
              onViewHistory={handleViewScenarioHistory}
            />
          )}

          {viewMode === 'edit-suite' && (
            <SuiteEditor
              suite={editingSuite}
              scenarios={scenarios}
              onSave={handleSaveSuite}
              onSaveAndRun={handleSaveAndRunSuite}
              onBack={() => setViewMode('list')}
              onViewHistory={handleViewSuiteHistory}
            />
          )}

          {viewMode === 'list' && (
            <>
              {activeTab === 'scenarios' && (
                <ScenarioList
                  activeProject={activeProject}
                  modules={modules}
                  activeModuleId={activeModuleId}
                  onSelectModule={handleSelectModule}
                  onAddModule={handleAddModule}
                  scenarios={scenarios}
                  suites={suites}
                  history={history}
                  onRunScenario={handleRunScenario}
                  onEditScenario={handleEditScenario}
                  onDeleteScenario={handleDeleteScenario}
                  onDuplicateScenario={handleDuplicateScenario}
                  onCreateNew={handleNewScenario}
                  onViewHistory={handleViewScenarioHistory}
                />
              )}

              {activeTab === 'suites' && (
                <SuiteList
                  suites={suites}
                  scenarios={scenarios}
                  onRunSuite={handleRunSuite}
                  onEditSuite={handleEditSuite}
                  onDeleteSuite={handleDeleteSuite}
                  onCreateNew={handleNewSuite}
                  onViewHistory={handleViewSuiteHistory}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Live Runner Modal */}
      <LiveRunnerModal
        isOpen={runnerState.isOpen}
        onClose={() => {
          setRunnerState((prev) => ({ ...prev, isOpen: false }));
          loadData(activeProjectId || activeProject?.id); // reload history
        }}
        title={runnerState.title}
        scenariosToRun={runnerState.scenariosToRun}
        keepSession={runnerState.keepSession}
        suiteId={runnerState.suiteId}
        suiteName={runnerState.suiteName}
        projectId={runnerState.projectId}
        onViewScreenshot={(filename) => setViewingScreenshot(filename)}
      />

      {/* Target History Modal (Per-scenario or Per-suite) */}
      <TargetHistoryModal
        isOpen={targetHistoryState.isOpen}
        onClose={() => setTargetHistoryState((prev) => ({ ...prev, isOpen: false }))}
        targetType={targetHistoryState.targetType}
        targetId={targetHistoryState.targetId}
        targetName={targetHistoryState.targetName}
        history={history}
        onViewScreenshot={(filename) => setViewingScreenshot(filename)}
      />

      {/* Screenshot Viewer Modal */}
      <ImageViewerModal
        filename={viewingScreenshot}
        onClose={() => setViewingScreenshot(null)}
      />

      {/* Filament Project Switcher / Workspace Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId || activeProject?.id}
        onSelectProject={handleSelectProject}
        onSaveProject={handleSaveProject}
        onDeleteProject={handleDeleteProject}
      />
    </div>
  );
}
