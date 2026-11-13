import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Play,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Globe,
  Lock,
  MousePointer,
  Keyboard,
  Clock,
  Eye,
  Camera,
  CheckCircle,
  HelpCircle,
  Layers,
  Sparkles,
  BookOpen,
  Terminal,
  History,
  ShieldCheck,
  CheckSquare,
  KeyRound,
  ExternalLink,
  Sliders,
  Copy,
  ShieldAlert,
  Boxes,
  Workflow,
  Radio
} from 'lucide-react';
import SelectorHelperModal from './SelectorHelperModal';
import VisualRecorderModal from './VisualRecorderModal';
import Toast from './Toast';

const QUICK_SELECTOR_PRESETS = {
  click: [
    { label: 'button[type="submit"]:visible', value: 'button[type="submit"]:visible' },
    { label: 'button:has-text("Masuk")', value: 'button:has-text("Masuk")' },
    { label: 'button:has-text("Simpan")', value: 'button:has-text("Simpan")' },
    { label: '[wire\\:key*="field"] .choices__inner', value: '[wire\\:key*="field_name"] .choices__inner' },
    { label: '.choices__item--selectable', value: '.choices__item--selectable' },
    { label: '.choices__inner:visible', value: '.choices__inner:visible' },
    { label: '.choices__item--choice:visible', value: '.choices__item--choice:visible' },
    { label: 'a:has-text("Detail")', value: 'a:has-text("Detail")' },
    { label: '#btn-submit', value: '#btn-submit' }
  ],
  type: [
    { label: 'input[name="email"]:visible', value: 'input[name="email"]:visible' },
    { label: 'input.choices__input--cloned:visible', value: 'input.choices__input--cloned:visible' },
    { label: '[wire\\:key*="field"] input.choices__input--cloned', value: '[wire\\:key*="field_name"] input.choices__input--cloned' },
    { label: 'input[name="username"]', value: 'input[name="username"]' },
    { label: 'input[type="password"]', value: 'input[type="password"]' },
    { label: 'input[placeholder*="Cari"]', value: 'input[placeholder*="Cari"]' }
  ],
  select: [
    { label: 'select[name="kategori"]', value: 'select[name="kategori"]' },
    { label: 'select#status', value: 'select#status' }
  ],
  check: [
    { label: 'input[type="checkbox"]#remember', value: 'input[type="checkbox"]#remember' }
  ],
  wait: [
    { label: '.modal.show', value: '.modal.show' },
    { label: 'table tbody tr', value: 'table tbody tr' }
  ],
  assert_visible: [
    { label: '.alert-success:visible', value: '.alert-success:visible' },
    { label: 'h1:visible', value: 'h1:visible' },
    { label: '.text-danger:visible', value: '.text-danger:visible' }
  ],
  assert_text: [
    { label: '#firstHeading', value: '#firstHeading' },
    { label: '.toast-message', value: '.toast-message' },
    { label: '.badge-status', value: '.badge-status' }
  ]
};

const POST_LOGIN_ACTION_CONFIGS = {
  type: {
    label: 'Ketik Input (OTP / PIN / Form)',
    badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    needsSelector: true,
    needsValue: true,
    selectorPlaceholder: 'input[name="otp"]:visible, input[autocomplete="one-time-code"]',
    valuePlaceholder: '123456{Enter} (Gunakan {Enter} untuk submit)',
    defaultLabel: 'Masukkan Kode OTP 2FA',
    hint: 'Mengetikkan teks atau kode OTP. Tambahkan {Enter} untuk otomatis menekan enter.'
  },
  click: {
    label: 'Klik Tombol / Dialog Modal',
    badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    needsSelector: true,
    needsValue: false,
    selectorPlaceholder: 'button:has-text("Verifikasi"), button:has-text("Lanjutkan"), button[aria-label="Close"]:visible',
    defaultLabel: 'Klik Tombol Konfirmasi / Modal',
    hint: 'Melakukan klik tombol pada pop-up, pilihan workspace, atau modal konfirmasi.'
  },
  select: {
    label: 'Pilih Dropdown Workspace / Role',
    badge: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20',
    needsSelector: true,
    needsValue: true,
    selectorPlaceholder: 'select#workspace, select[name="organization"]',
    valuePlaceholder: 'ID atau teks opsi yang dipilih',
    defaultLabel: 'Pilih Organisasi / Workspace',
    hint: 'Memilih opsi dari dropdown <select> pasca-login.'
  },
  check: {
    label: 'Centang Checkbox (Ingat Perangkat)',
    badge: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
    needsSelector: true,
    needsValue: false,
    selectorPlaceholder: 'input[type="checkbox"]#remember_device, input[name="trust_device"]',
    defaultLabel: 'Centang Ingat Perangkat 30 Hari',
    hint: 'Menandai checkbox keamanan / simpan sesi browser.'
  },
  uncheck: {
    label: 'Hapus Centang Checkbox',
    badge: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
    needsSelector: true,
    needsValue: false,
    selectorPlaceholder: 'input[type="checkbox"]#newsletter',
    defaultLabel: 'Hapus Centang Checkbox',
    hint: 'Menghapus tanda centang pada checkbox.'
  },
  wait: {
    label: 'Tunggu Elemen / Jeda Waktu (ms)',
    badge: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    needsSelector: true,
    needsValue: true,
    selectorPlaceholder: 'Selector opsional (kosongkan jika hanya jeda ms)',
    valuePlaceholder: '2000 (jeda waktu dalam ms)',
    defaultLabel: 'Tunggu Halaman / Elemen Siap',
    hint: 'Menunggu elemen tertentu muncul di layar. Kosongkan selector jika Anda hanya ingin jeda waktu sejumlah milidetik (ms).'
  },
  assert_url: {
    label: 'Verifikasi URL Dashboard',
    badge: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    needsSelector: false,
    needsValue: true,
    valuePlaceholder: '/dashboard atau /app atau /admin',
    defaultLabel: 'Pastikan Redirect ke Dashboard',
    hint: 'Memastikan browser berhasil dialihkan ke URL dashboard atau landing page aplikasi.'
  },
  assert_visible: {
    label: 'Pastikan Elemen Terlihat (Assert Visible)',
    badge: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20',
    needsSelector: true,
    needsValue: false,
    selectorPlaceholder: 'h1.dashboard-title:visible, .user-avatar:visible',
    defaultLabel: 'Verifikasi Elemen Utama Tampil',
    hint: 'Memastikan elemen kunci aplikasi sudah tampil dan siap diinteraksikan.'
  },
  assert_text: {
    label: 'Pastikan Teks Muncul (Assert Text)',
    badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    needsSelector: true,
    needsValue: true,
    selectorPlaceholder: '.welcome-message, #user-name',
    valuePlaceholder: 'Selamat Datang',
    defaultLabel: 'Verifikasi Teks Sambutan',
    hint: 'Memastikan teks tertentu tercantum di dalam elemen target.'
  },
  screenshot: {
    label: 'Ambil Foto Bukti (Screenshot)',
    badge: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    needsSelector: false,
    needsValue: false,
    defaultLabel: 'Foto Bukti Halaman Pasca-Login',
    hint: 'Mengambil tangkapan layar penuh sebagai bukti autentikasi berhasil.'
  }
};

const POST_LOGIN_QUICK_SELECTORS = {
  type: [
    { label: 'input[name="otp"]:visible', value: 'input[name="otp"]:visible' },
    { label: 'input[autocomplete="one-time-code"]', value: 'input[autocomplete="one-time-code"]' },
    { label: 'input[name="pin"]:visible', value: 'input[name="pin"]:visible' }
  ],
  click: [
    { label: 'button:has-text("Verifikasi")', value: 'button:has-text("Verifikasi")' },
    { label: 'button:has-text("Lanjutkan")', value: 'button:has-text("Lanjutkan")' },
    { label: 'button:has-text("Pilih")', value: 'button:has-text("Pilih")' },
    { label: 'button:has-text("Tutup")', value: 'button:has-text("Tutup")' },
    { label: 'button[aria-label="Close"]:visible', value: 'button[aria-label="Close"]:visible' }
  ],
  select: [
    { label: 'select[name="workspace"]', value: 'select[name="workspace"]' },
    { label: 'select#tenant-select', value: 'select#tenant-select' }
  ],
  check: [
    { label: 'input[type="checkbox"]#remember_device', value: 'input[type="checkbox"]#remember_device' },
    { label: 'input[name="trust_this_device"]', value: 'input[name="trust_this_device"]' }
  ],
  wait: [
    { label: '[role="dialog"]:visible', value: '[role="dialog"]:visible' },
    { label: '.modal.show:visible', value: '.modal.show:visible' },
    { label: 'main:visible', value: 'main:visible' },
    { label: '.fi-main:visible', value: '.fi-main:visible' }
  ],
  assert_visible: [
    { label: 'h1:visible', value: 'h1:visible' },
    { label: '.user-avatar:visible', value: '.user-avatar:visible' },
    { label: '.sidebar-nav:visible', value: '.sidebar-nav:visible' }
  ],
  assert_text: [
    { label: '.welcome-text', value: '.welcome-text' },
    { label: '#user-display-name', value: '#user-display-name' }
  ]
};

const ACTION_CONFIGS = {
  navigate: {
    label: 'Buka Halaman (Navigate)',
    needsSelector: false,
    needsTarget: true,
    needsValue: false,
    targetPlaceholder: 'https://example.com/halaman',
    badge: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    hint: 'Mengarahkan browser ke URL yang ditentukan.'
  },
  type: {
    label: 'Ketik Input Form (Type)',
    needsSelector: true,
    needsTarget: false,
    needsValue: true,
    selectorPlaceholder: 'input[name="username"]:visible, #email',
    valuePlaceholder: 'admin@company.com (Gunakan {Enter} untuk submit)',
    badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    hint: 'Mengetikkan teks ke kolom form. Tambahkan {Enter} di akhir jika ingin otomatis submit.'
  },
  click: {
    label: 'Klik Tombol / Elemen (Click)',
    needsSelector: true,
    needsTarget: false,
    needsValue: false,
    selectorPlaceholder: 'button[type="submit"]:visible, button:has-text("Masuk")',
    badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    hint: 'Melakukan klik mouse pada tombol atau elemen interaktif.'
  },
  select: {
    label: 'Pilih Dropdown (Select Option)',
    needsSelector: true,
    needsTarget: false,
    needsValue: true,
    selectorPlaceholder: 'select#country, select[name="role"]',
    valuePlaceholder: 'ID, atau value option',
    badge: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20',
    hint: 'Memilih opsi dari elemen <select> dropdown.'
  },
  check: {
    label: 'Centang Checkbox (Check)',
    needsSelector: true,
    needsTarget: false,
    needsValue: false,
    selectorPlaceholder: 'input[type="checkbox"]#agree',
    badge: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
    hint: 'Menandai checklist atau radio button.'
  },
  wait: {
    label: 'Tunggu Elemen / Waktu (Wait)',
    needsSelector: true,
    needsTarget: false,
    needsValue: true,
    selectorPlaceholder: 'Selector opsional (atau kosongkan untuk jeda ms)',
    valuePlaceholder: '2000 (jeda dalam milidetik)',
    badge: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    hint: 'Menunggu elemen muncul di layar, atau berhenti sejenak sejumlah milidetik.'
  },
  assert_visible: {
    label: 'Cek Elemen Muncul (Assert Visible)',
    needsSelector: true,
    needsTarget: false,
    needsValue: false,
    selectorPlaceholder: '.alert-success:visible, h1.dashboard-title',
    badge: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20',
    hint: 'Memastikan elemen target benar-benar terlihat di layar.'
  },
  assert_text: {
    label: 'Cek Teks Konten (Assert Text)',
    needsSelector: true,
    needsTarget: false,
    needsValue: true,
    selectorPlaceholder: '.toast-message, #order-number',
    valuePlaceholder: 'Teks yang diharapkan muncul',
    badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    hint: 'Memastikan elemen tertentu memuat teks yang sesuai.'
  },
  screenshot: {
    label: 'Ambil Tangkapan Layar (Screenshot)',
    needsSelector: false,
    needsTarget: false,
    needsValue: true,
    valuePlaceholder: 'Nama file foto, misal: bukti_form_berhasil',
    badge: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    hint: 'Menyimpan tangkapan layar penuh saat langkah ini dijalankan.'
  },
  sub_scenario: {
    label: 'Jalankan Sub-Flow / Komponen (Sub-Scenario)',
    needsSelector: false,
    needsTarget: false,
    needsValue: false,
    needsSubScenario: true,
    badge: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-500/20',
    hint: 'Memanggil seluruh rangkaian langkah dari skenario lain (seperti Alur Login, Setup Data) dalam sesi browser yang sama.'
  }
};

export default function ScenarioEditor({
  scenario,
  allScenarios = [],
  modules = [],
  activeProjectId,
  activeModuleId,
  onSave,
  onBack,
  onSaveAndRun,
  onViewHistory
}) {
  const [formData, setFormData] = useState({
    id: scenario?.id || '',
    projectId: scenario?.projectId || scenario?.project_id || activeProjectId || '',
    moduleId: scenario?.moduleId || scenario?.module_id || activeModuleId || '',
    name: scenario?.name || '',
    description: scenario?.description || '',
    baseUrl: scenario?.baseUrl || '',
    isComponent: Boolean(
      scenario?.isComponent ||
      (Array.isArray(scenario?.tags) && scenario.tags.includes('component'))
    ),
    tags: Array.isArray(scenario?.tags) ? JSON.parse(JSON.stringify(scenario.tags)) : [],
    authConfig: {
      enabled: scenario?.authConfig?.enabled || false,
      usernameSelector: scenario?.authConfig?.usernameSelector || '',
      usernameValue: scenario?.authConfig?.usernameValue || '',
      passwordSelector: scenario?.authConfig?.passwordSelector || '',
      passwordValue: scenario?.authConfig?.passwordValue || '',
      submitSelector: scenario?.authConfig?.submitSelector || '',
      extraInputs: Array.isArray(scenario?.authConfig?.extraInputs)
        ? JSON.parse(JSON.stringify(scenario.authConfig.extraInputs))
        : [],
      postLoginActions: Array.isArray(scenario?.authConfig?.postLoginActions)
        ? JSON.parse(JSON.stringify(scenario.authConfig.postLoginActions))
        : []
    },
    steps: Array.isArray(scenario?.steps) && scenario.steps.length > 0
      ? scenario.steps.map((s) => {
          let primary = '';
          let fallbacks = [];
          if (s.target && typeof s.target === 'object') {
            primary = s.target.primary || '';
            if (Array.isArray(s.target.fallbacks)) fallbacks = s.target.fallbacks;
          } else if (s.selector && typeof s.selector === 'object') {
            primary = s.selector.primary || '';
            if (Array.isArray(s.selector.fallbacks)) fallbacks = s.selector.fallbacks;
          } else {
            primary = typeof s.selector === 'string' ? s.selector : '';
            if (Array.isArray(s.fallbacks)) {
              fallbacks = s.fallbacks;
            } else if (Array.isArray(s.fallbackSelectors)) {
              fallbacks = s.fallbackSelectors;
            }
          }
          return {
            ...s,
            subScenarioId: s.subScenarioId || (s.action === 'sub_scenario' ? (s.value || s.target || '') : ''),
            selector: primary,
            fallbacks: Array.isArray(fallbacks) ? fallbacks : []
          };
        })
      : [
          {
            id: `step-${Date.now()}`,
            action: 'navigate',
            label: 'Buka Halaman Utama',
            target: '',
            subScenarioId: '',
            selector: '',
            fallbacks: [],
            value: '',
            timeout: 10000,
            enabled: true
          }
        ]
  });

  const availableSubScenarios = (allScenarios || []).filter((s) => s.id !== formData.id);
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' });
  const [helperModalTarget, setHelperModalTarget] = useState(null);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(null);

  const handleImportRecordedSteps = (recordedSteps, replaceExisting = false) => {
    if (!Array.isArray(recordedSteps) || recordedSteps.length === 0) return;

    setFormData((prev) => ({
      ...prev,
      steps: replaceExisting ? [...recordedSteps] : [...prev.steps, ...recordedSteps]
    }));

    setToast({
      show: true,
      type: 'success',
      title: 'Langkah Berhasil Diimpor',
      message: `${recordedSteps.length} langkah hasil rekaman visual berhasil ditambahkan.`
    });
  };

  const copySnippet = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(text);
    setTimeout(() => setCopiedSnippet(null), 1500);
  };

  const handleFieldChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleAuthChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      authConfig: { ...prev.authConfig, [field]: val }
    }));
  };

  // Extra Inputs (Pre-login form fields)
  const addExtraInput = (type = 'text') => {
    const newInput = {
      id: `extra-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      label: type === 'checkbox' ? 'Ingat Saya' : 'Kode Perusahaan / Tenant ID',
      selector: type === 'checkbox' ? 'input[type="checkbox"]#remember' : 'input[name="tenant_id"]:visible',
      value: type === 'checkbox' ? true : '',
      type: type
    };
    setFormData((prev) => ({
      ...prev,
      authConfig: {
        ...prev.authConfig,
        extraInputs: [...(prev.authConfig.extraInputs || []), newInput]
      }
    }));
  };

  const updateExtraInput = (id, field, val) => {
    setFormData((prev) => ({
      ...prev,
      authConfig: {
        ...prev.authConfig,
        extraInputs: (prev.authConfig.extraInputs || []).map((item) =>
          item.id === id ? { ...item, [field]: val } : item
        )
      }
    }));
  };

  const removeExtraInput = (id) => {
    setFormData((prev) => ({
      ...prev,
      authConfig: {
        ...prev.authConfig,
        extraInputs: (prev.authConfig.extraInputs || []).filter((item) => item.id !== id)
      }
    }));
  };

  // Post-Login Actions (Customizable Post-Login Workflow)
  const addPostLoginAction = (actionType = 'type', customProps = {}) => {
    const config = POST_LOGIN_ACTION_CONFIGS[actionType] || POST_LOGIN_ACTION_CONFIGS.type;
    const newAction = {
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action: actionType,
      label: config.defaultLabel,
      selector: '',
      value:
        actionType === 'type'
          ? '123456{Enter}'
          : actionType === 'assert_url'
          ? '/dashboard'
          : actionType === 'wait'
          ? '2000'
          : '',
      timeout: 10000,
      optional: false,
      enabled: true,
      ...customProps
    };
    setFormData((prev) => ({
      ...prev,
      authConfig: {
        ...prev.authConfig,
        postLoginActions: [...(prev.authConfig.postLoginActions || []), newAction]
      }
    }));
  };

  const updatePostLoginAction = (id, field, val) => {
    setFormData((prev) => ({
      ...prev,
      authConfig: {
        ...prev.authConfig,
        postLoginActions: (prev.authConfig.postLoginActions || []).map((item) =>
          item.id === id ? { ...item, [field]: val } : item
        )
      }
    }));
  };

  const duplicatePostLoginAction = (id) => {
    const actionToDup = (formData.authConfig.postLoginActions || []).find((a) => a.id === id);
    if (!actionToDup) return;
    const duplicated = {
      ...actionToDup,
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      label: `${actionToDup.label} (Salinan)`
    };
    const index = formData.authConfig.postLoginActions.findIndex((a) => a.id === id);
    const newList = [...formData.authConfig.postLoginActions];
    newList.splice(index + 1, 0, duplicated);
    setFormData((prev) => ({
      ...prev,
      authConfig: {
        ...prev.authConfig,
        postLoginActions: newList
      }
    }));
  };

  const removePostLoginAction = (id) => {
    setFormData((prev) => ({
      ...prev,
      authConfig: {
        ...prev.authConfig,
        postLoginActions: (prev.authConfig.postLoginActions || []).filter((item) => item.id !== id)
      }
    }));
  };

  const movePostLoginAction = (index, direction) => {
    const list = [...(formData.authConfig.postLoginActions || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    setFormData((prev) => ({
      ...prev,
      authConfig: {
        ...prev.authConfig,
        postLoginActions: list
      }
    }));
  };

  // Steps methods
  const addStep = (actionType = 'type') => {
    const config = ACTION_CONFIGS[actionType] || ACTION_CONFIGS.type;
    const newStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action: actionType,
      label: config.label.split('(')[0].trim(),
      target: actionType === 'navigate' ? formData.baseUrl : '',
      subScenarioId: '',
      selector: '',
      fallbacks: [],
      value: '',
      timeout: 10000,
      enabled: true
    };
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStep = (id, field, val) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    }));
  };

  const addStepFallback = (stepId, fallbackVal = '') => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => {
        if (s.id !== stepId) return s;
        const currentFallbacks = Array.isArray(s.fallbacks) ? [...s.fallbacks] : [];
        return {
          ...s,
          fallbacks: [...currentFallbacks, fallbackVal]
        };
      })
    }));
  };

  const updateStepFallback = (stepId, fallbackIndex, val) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => {
        if (s.id !== stepId) return s;
        const updated = Array.isArray(s.fallbacks) ? [...s.fallbacks] : [];
        updated[fallbackIndex] = val;
        return {
          ...s,
          fallbacks: updated
        };
      })
    }));
  };

  const removeStepFallback = (stepId, fallbackIndex) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => {
        if (s.id !== stepId) return s;
        const updated = (Array.isArray(s.fallbacks) ? s.fallbacks : []).filter((_, idx) => idx !== fallbackIndex);
        return {
          ...s,
          fallbacks: updated
        };
      })
    }));
  };

  const moveStepFallback = (stepId, fallbackIndex, direction) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => {
        if (s.id !== stepId) return s;
        const list = Array.isArray(s.fallbacks) ? [...s.fallbacks] : [];
        const targetIndex = fallbackIndex + direction;
        if (targetIndex < 0 || targetIndex >= list.length) return s;
        const temp = list[fallbackIndex];
        list[fallbackIndex] = list[targetIndex];
        list[targetIndex] = temp;
        return {
          ...s,
          fallbacks: list
        };
      })
    }));
  };

  const handleSelectPatternFromModal = (pattern) => {
    if (!helperModalTarget) return;

    if (helperModalTarget.type === 'step-primary') {
      updateStep(helperModalTarget.stepId, 'selector', pattern);
      setToast({
        show: true,
        type: 'success',
        title: 'Selector Primer Terpilih',
        message: `Selector "${pattern}" diterapkan sebagai selector utama.`
      });
    } else if (helperModalTarget.type === 'step-fallback') {
      updateStepFallback(helperModalTarget.stepId, helperModalTarget.fallbackIndex, pattern);
      setToast({
        show: true,
        type: 'success',
        title: 'Selector Cadangan Terpilih',
        message: `Selector "${pattern}" diterapkan pada cadangan #${helperModalTarget.fallbackIndex + 1}.`
      });
    } else if (helperModalTarget.type === 'step-new-fallback') {
      addStepFallback(helperModalTarget.stepId, pattern);
      setToast({
        show: true,
        type: 'success',
        title: 'Selector Cadangan Ditambahkan',
        message: `Selector "${pattern}" ditambahkan sebagai cadangan baru.`
      });
    } else {
      copySnippet(pattern);
      setToast({
        show: true,
        type: 'success',
        title: 'Pola Disalin',
        message: `Pola "${pattern}" disalin ke clipboard.`
      });
    }
  };

  const removeStep = (id) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((s) => s.id !== id)
    }));
  };

  const moveStep = (index, direction) => {
    const newSteps = [...formData.steps];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const handleSubmit = async (runAfter = false) => {
    if (!formData.name.trim()) {
      setToast({
        show: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Mohon masukkan Judul Test sebelum menyimpan skenario.'
      });
      return;
    }

    const sanitizedSteps = (formData.steps || []).map((s) => {
      const cleanFallbacks = Array.isArray(s.fallbacks)
        ? s.fallbacks.map((f) => (typeof f === 'string' ? f.trim() : '')).filter(Boolean)
        : [];
      const cleanPrimary = typeof s.selector === 'string' ? s.selector.trim() : '';

      return {
        ...s,
        subScenarioId: s.subScenarioId || '',
        selector: cleanPrimary,
        fallbacks: cleanFallbacks,
        target: s.action === 'navigate'
          ? (s.target || formData.baseUrl || '')
          : (s.action === 'sub_scenario'
              ? (s.subScenarioId || '')
              : { primary: cleanPrimary, fallbacks: cleanFallbacks })
      };
    });

    const tags = Array.isArray(formData.tags) ? [...formData.tags] : [];
    if (formData.isComponent && !tags.includes('component')) {
      tags.push('component');
    } else if (!formData.isComponent && tags.includes('component')) {
      const idx = tags.indexOf('component');
      if (idx >= 0) tags.splice(idx, 1);
    }

    const payload = {
      ...formData,
      tags,
      isComponent: Boolean(formData.isComponent),
      id: formData.id || `sc-${Date.now()}`,
      projectId: formData.projectId || activeProjectId || 'proj-health-e-iris',
      moduleId: formData.moduleId || null,
      steps: sanitizedSteps
    };

    try {
      if (runAfter) {
        await onSaveAndRun(payload);
        setFormData((prev) => ({ ...prev, id: payload.id }));
        setToast({
          show: true,
          type: 'success',
          title: 'Tersimpan & Dijalankan',
          message: 'Skenario berhasil disimpan dan runner pengujian dimulai.'
        });
      } else {
        await onSave(payload);
        setFormData((prev) => ({ ...prev, id: payload.id }));
        setToast({
          show: true,
          type: 'success',
          title: 'Skenario Tersimpan',
          message: 'Perubahan skenario pengujian berhasil disimpan.'
        });
      }
    } catch (err) {
      setToast({
        show: true,
        type: 'error',
        title: 'Gagal Menyimpan',
        message: err.message || 'Terjadi kesalahan saat menyimpan skenario.'
      });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 pb-24">
      {/* Filament Form Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-950 dark:text-white">
              {formData.id ? 'Edit Skenario Pengujian' : 'Setup Skenario Test Baru'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Konfigurasi parameter URL tujuan, form autentikasi berurutan, dan susunan langkah aksi browser.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {formData.id && onViewHistory && (
            <button
              type="button"
              onClick={() => onViewHistory(formData)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
            >
              <History className="w-3.5 h-3.5 text-amber-500" />
              <span>Riwayat Skenario Ini</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Skenario</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-xs focus:ring-2 focus:ring-amber-500/30 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simpan & Jalankan</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Left (2 cols), Dedicated Sticky Guide Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Informasi Dasar */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-gray-950 dark:text-white">
                1. Parameter Halaman & Judul Test
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Informasi identitas skenario dan URL halaman yang akan dibuka pertama kali.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-zinc-200 mb-1">
                    Judul Test <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Form Checkout Produk, Verifikasi Login Sukses"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-zinc-200 mb-1">
                    Folder Modul
                  </label>
                  <select
                    value={formData.moduleId || ''}
                    onChange={(e) => handleFieldChange('moduleId', e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                  >
                    <option value="">Tanpa Modul (Root / Umum)</option>
                    {(modules || []).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-200 mb-1">
                  Target Halaman URL (Base URL)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    placeholder="https://example.com/login atau https://demo.playwright.dev/todomvc"
                    value={formData.baseUrl}
                    onChange={(e) => handleFieldChange('baseUrl', e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-200 mb-1">
                  Deskripsi Singkat (Opsional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Catatan mengenai tujuan pengujian skenario ini..."
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              {/* Reusable Component Toggle */}
              <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1 rounded-md bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <label
                      htmlFor="isComponentToggle"
                      className="text-xs font-semibold text-gray-900 dark:text-white cursor-pointer select-none flex items-center gap-1.5"
                    >
                      <span>Jadikan Komponen Reusable (Sub-Flow)</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                        Modular
                      </span>
                    </label>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                      Skenario ini dapat dipanggil dan disisipkan sebagai satu langkah di dalam skenario lain tanpa duplikasi langkah.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                  <input
                    id="isComponentToggle"
                    type="checkbox"
                    checked={Boolean(formData.isComponent)}
                    onChange={(e) => handleFieldChange('isComponent', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Form Login & Rangkaian Autentikasi Lanjutan */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  2. Form Autentikasi & Rangkaian Login Multi-Step
                </h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Dukungan input ekstra (Tenant/PIN/Checkbox) dan alur aksi pasca-login fleksibel (OTP, modal workspace, dismiss pop-up, assertions).
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.authConfig.enabled}
                  onChange={(e) => handleAuthChange('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                <span className="ml-2 text-xs font-medium text-gray-700 dark:text-zinc-300">
                  {formData.authConfig.enabled ? 'Aktif' : 'Nonaktif'}
                </span>
              </label>
            </div>

            {formData.authConfig.enabled && (
              <div className="space-y-6 pt-3 border-t border-gray-200 dark:border-zinc-800">
                {/* A. Kredensial Utama */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>A. Form Login Utama</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 dark:text-zinc-400 mb-1">
                        Selector Input Email / Username
                      </label>
                      <input
                        type="text"
                        placeholder="input#email, input[name='username']:visible"
                        value={formData.authConfig.usernameSelector}
                        onChange={(e) => handleAuthChange('usernameSelector', e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono text-[11px]"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <button
                          type="button"
                          onClick={() => handleAuthChange('usernameSelector', 'input[name="email"]:visible')}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:text-amber-600 font-mono border border-gray-200 dark:border-zinc-700 cursor-pointer"
                        >
                          input[name="email"]:visible
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAuthChange('usernameSelector', 'input[name="username"]:visible')}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:text-amber-600 font-mono border border-gray-200 dark:border-zinc-700 cursor-pointer"
                        >
                          input[name="username"]:visible
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 dark:text-zinc-400 mb-1">
                        Nilai Email / Username
                      </label>
                      <input
                        type="text"
                        placeholder="admin@test.com"
                        value={formData.authConfig.usernameValue}
                        onChange={(e) => handleAuthChange('usernameValue', e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 dark:text-zinc-400 mb-1">
                        Selector Input Password
                      </label>
                      <input
                        type="text"
                        placeholder="input#password, [type='password']:visible"
                        value={formData.authConfig.passwordSelector}
                        onChange={(e) => handleAuthChange('passwordSelector', e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 dark:text-zinc-400 mb-1">
                        Nilai Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={formData.authConfig.passwordValue}
                        onChange={(e) => handleAuthChange('passwordValue', e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* B. Form Tambahan Sebelum Submit (Tenant ID, PIN, Checkbox) */}
                <div className="pt-3 border-t border-gray-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
                        <Sliders className="w-3.5 h-3.5 text-amber-500" />
                        <span>B. Input Form Tambahan (Sebelum Submit)</span>
                      </span>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                        Untuk form login yang membutuhkan kolom ekstra (misal: Kode Perusahaan, Tenant ID, atau centang Ingat Saya).
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => addExtraInput('text')}
                        className="px-2 py-1 text-[10px] font-semibold rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 transition-colors"
                      >
                        + Input Teks
                      </button>
                      <button
                        type="button"
                        onClick={() => addExtraInput('checkbox')}
                        className="px-2 py-1 text-[10px] font-semibold rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-200 transition-colors"
                      >
                        + Checkbox
                      </button>
                    </div>
                  </div>

                  {(formData.authConfig.extraInputs || []).length === 0 ? (
                    <div className="text-center py-3 text-[11px] text-gray-400 dark:text-zinc-500 italic bg-gray-50/50 dark:bg-zinc-950/40 rounded-lg border border-dashed border-gray-200 dark:border-zinc-800">
                      Tidak ada form input tambahan sebelum submit (opsional).
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formData.authConfig.extraInputs.map((extra) => (
                        <div
                          key={extra.id}
                          className="bg-gray-50 dark:bg-zinc-950/70 border border-gray-200 dark:border-zinc-800 rounded-lg p-2.5 flex flex-col sm:flex-row items-start sm:items-center gap-2.5"
                        >
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 shrink-0">
                            {extra.type === 'checkbox' ? 'Checkbox' : 'Teks'}
                          </span>

                          <input
                            type="text"
                            placeholder="Label (e.g. Tenant ID)"
                            value={extra.label}
                            onChange={(e) => updateExtraInput(extra.id, 'label', e.target.value)}
                            className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white w-full sm:w-36 focus:outline-none"
                          />

                          <input
                            type="text"
                            placeholder="Selector elemen (e.g. input[name='tenant'])"
                            value={extra.selector}
                            onChange={(e) => updateExtraInput(extra.id, 'selector', e.target.value)}
                            className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white font-mono text-[11px] flex-1 w-full focus:outline-none"
                          />

                          {extra.type === 'checkbox' ? (
                            <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-zinc-300 shrink-0 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={extra.value === true || extra.value === 'true'}
                                onChange={(e) => updateExtraInput(extra.id, 'value', e.target.checked)}
                                className="rounded text-amber-600 focus:ring-amber-500"
                              />
                              <span>Centang</span>
                            </label>
                          ) : (
                            <input
                              type="text"
                              placeholder="Nilai yang diisi"
                              value={extra.value || ''}
                              onChange={(e) => updateExtraInput(extra.id, 'value', e.target.value)}
                              className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white w-full sm:w-36 focus:outline-none"
                            />
                          )}

                          <button
                            type="button"
                            onClick={() => removeExtraInput(extra.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* C. Tombol Submit / Login */}
                <div className="pt-3 border-t border-gray-200 dark:border-zinc-800 space-y-2">
                  <div className="text-[11px] font-bold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                    <span>C. Tombol Submit / Login</span>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="button[type='submit']:visible, button:has-text('Masuk')"
                      value={formData.authConfig.submitSelector}
                      onChange={(e) => handleAuthChange('submitSelector', e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono text-[11px]"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500">Rekomendasi:</span>
                      <button
                        type="button"
                        onClick={() => handleAuthChange('submitSelector', 'button[type="submit"]:visible')}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-mono hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors cursor-pointer"
                      >
                        button[type="submit"]:visible
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAuthChange('submitSelector', 'button:has-text("Masuk")')}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 font-mono hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                      >
                        button:has-text("Masuk")
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAuthChange('submitSelector', 'button:has-text("Login")')}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 font-mono hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                      >
                        button:has-text("Login")
                      </button>
                    </div>
                  </div>
                </div>

                {/* D. Rangkaian Proses Pasca-Login (Super Customizable Workflow) */}
                <div className="pt-4 border-t border-gray-200 dark:border-zinc-800 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-950 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                          <span>D. Rangkaian Proses Pasca-Login (Post-Login Workflow)</span>
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                          {(formData.authConfig.postLoginActions || []).length} Aksi Terkonfigurasi
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                        Alur otomatis fleksibel setelah tombol login ditekan (2FA OTP, modal workspace, dismiss pop-up, assertions, dan langkah bersyarat/opsional).
                      </p>
                    </div>
                  </div>

                  {/* Add Action Bar (All 10 Actions Supported) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 mr-1">Tambah Aksi:</span>
                    <button
                      type="button"
                      onClick={() => addPostLoginAction('type')}
                      className="px-2 py-0.5 text-[10px] font-medium rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 transition-colors"
                    >
                      + Ketik Teks / OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => addPostLoginAction('click')}
                      className="px-2 py-0.5 text-[10px] font-medium rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 transition-colors"
                    >
                      + Klik Tombol / Modal
                    </button>
                    <button
                      type="button"
                      onClick={() => addPostLoginAction('select')}
                      className="px-2 py-0.5 text-[10px] font-medium rounded bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 hover:bg-cyan-100 transition-colors"
                    >
                      + Dropdown
                    </button>
                    <button
                      type="button"
                      onClick={() => addPostLoginAction('check')}
                      className="px-2 py-0.5 text-[10px] font-medium rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 transition-colors"
                    >
                      + Checkbox
                    </button>
                    <button
                      type="button"
                      onClick={() => addPostLoginAction('wait')}
                      className="px-2 py-0.5 text-[10px] font-medium rounded bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 hover:bg-purple-100 transition-colors"
                    >
                      + Tunggu Elemen/ms
                    </button>
                    <button
                      type="button"
                      onClick={() => addPostLoginAction('assert_url')}
                      className="px-2 py-0.5 text-[10px] font-medium rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 transition-colors"
                    >
                      + Cek URL
                    </button>
                    <button
                      type="button"
                      onClick={() => addPostLoginAction('assert_visible')}
                      className="px-2 py-0.5 text-[10px] font-medium rounded bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20 hover:bg-teal-100 transition-colors"
                    >
                      + Cek Muncul
                    </button>
                    <button
                      type="button"
                      onClick={() => addPostLoginAction('assert_text')}
                      className="px-2 py-0.5 text-[10px] font-medium rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 transition-colors"
                    >
                      + Cek Teks
                    </button>
                    <button
                      type="button"
                      onClick={() => addPostLoginAction('screenshot')}
                      className="px-2 py-0.5 text-[10px] font-medium rounded bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 transition-colors"
                    >
                      + Screenshot
                    </button>
                  </div>

                  {/* Post-Login Steps Repeater Items */}
                  {(formData.authConfig.postLoginActions || []).length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400 dark:text-zinc-500 italic bg-gray-50/50 dark:bg-zinc-950/40 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
                      Belum ada alur pasca-login yang ditentukan. Klik template di atas atau tambahkan aksi manual jika form login Anda memiliki alur bertahap (seperti 2FA, seleksi workspace, atau dialog onboarding).
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.authConfig.postLoginActions.map((postAct, pIdx) => {
                        const config = POST_LOGIN_ACTION_CONFIGS[postAct.action] || POST_LOGIN_ACTION_CONFIGS.type;
                        const isFirst = pIdx === 0;
                        const isLast = pIdx === formData.authConfig.postLoginActions.length - 1;

                        return (
                          <div
                            key={postAct.id}
                            className={`border rounded-xl transition-all ${
                              postAct.enabled !== false
                                ? 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-2xs'
                                : 'bg-gray-100/50 dark:bg-zinc-950/20 border-gray-200/60 dark:border-zinc-800/40 opacity-60'
                            }`}
                          >
                            {/* Card Header Bar */}
                            <div className="px-4 py-2.5 bg-gray-50/90 dark:bg-zinc-950/70 border-b border-gray-200 dark:border-zinc-800 rounded-t-xl flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                                <span className="w-5 h-5 rounded bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                                  #{pIdx + 1}
                                </span>

                                <select
                                  value={postAct.action}
                                  onChange={(e) => updatePostLoginAction(postAct.id, 'action', e.target.value)}
                                  className={`text-xs font-semibold px-2 py-0.5 rounded border focus:outline-none ${config.badge} bg-white dark:bg-zinc-900 cursor-pointer`}
                                >
                                  {Object.entries(POST_LOGIN_ACTION_CONFIGS).map(([key, item]) => (
                                    <option key={key} value={key} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
                                      {item.label}
                                    </option>
                                  ))}
                                </select>

                                <input
                                  type="text"
                                  placeholder="Nama label aksi..."
                                  value={postAct.label}
                                  onChange={(e) => updatePostLoginAction(postAct.id, 'label', e.target.value)}
                                  className="bg-transparent text-xs text-gray-900 dark:text-white font-medium border-b border-transparent hover:border-gray-300 dark:hover:border-zinc-700 focus:border-amber-500 focus:outline-none px-1 py-0.5 flex-1 min-w-[120px] truncate"
                                />
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {/* Optional Step Toggle */}
                                <label
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer border transition-colors ${
                                    postAct.optional
                                      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30'
                                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-200'
                                  }`}
                                  title="Jika dicentang, pengujian TIDAK akan gagal jika elemen modal/pop-up ini tidak muncul"
                                >
                                  <input
                                    type="checkbox"
                                    checked={Boolean(postAct.optional)}
                                    onChange={(e) => updatePostLoginAction(postAct.id, 'optional', e.target.checked)}
                                    className="sr-only"
                                  />
                                  <ShieldAlert className="w-3 h-3 text-amber-500" />
                                  <span>{postAct.optional ? 'Opsional (Aman jika tdk ada)' : 'Wajib (Harus ada)'}</span>
                                </label>

                                {/* Timeout Setting */}
                                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-700 font-mono">
                                  <span>Timeout:</span>
                                  <input
                                    type="number"
                                    min="1000"
                                    step="1000"
                                    value={postAct.timeout || 10000}
                                    onChange={(e) => updatePostLoginAction(postAct.id, 'timeout', Number(e.target.value))}
                                    className="w-12 bg-transparent text-gray-900 dark:text-white focus:outline-none text-right font-mono"
                                  />
                                  <span>ms</span>
                                </div>

                                {/* Reorder & Action Buttons */}
                                <div className="flex items-center gap-0.5 border-l border-gray-200 dark:border-zinc-800 pl-2">
                                  <button
                                    type="button"
                                    onClick={() => movePostLoginAction(pIdx, -1)}
                                    disabled={isFirst}
                                    title="Geser ke atas"
                                    className={`p-1 rounded ${
                                      isFirst
                                        ? 'text-gray-300 dark:text-zinc-700 cursor-not-allowed'
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-700'
                                    }`}
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => movePostLoginAction(pIdx, 1)}
                                    disabled={isLast}
                                    title="Geser ke bawah"
                                    className={`p-1 rounded ${
                                      isLast
                                        ? 'text-gray-300 dark:text-zinc-700 cursor-not-allowed'
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-700'
                                    }`}
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => duplicatePostLoginAction(postAct.id)}
                                    title="Duplikat Aksi"
                                    className="p-1 rounded text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-700"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => updatePostLoginAction(postAct.id, 'enabled', postAct.enabled === false ? true : false)}
                                    className="text-[10px] font-medium px-1.5 py-0.5 rounded text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-700"
                                  >
                                    {postAct.enabled !== false ? 'Aktif' : 'Lewati'}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => removePostLoginAction(postAct.id)}
                                    title="Hapus aksi"
                                    className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors ml-0.5"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Card Body Fields */}
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {config.needsSelector && (
                                <div className={config.needsValue ? 'sm:col-span-1 lg:col-span-2' : 'sm:col-span-2 lg:col-span-3'}>
                                  <label className="block text-[10px] uppercase font-semibold text-gray-500 dark:text-zinc-400 mb-1">
                                    Selector Target Playwright
                                  </label>
                                  <input
                                    type="text"
                                    placeholder={config.selectorPlaceholder}
                                    value={postAct.selector || ''}
                                    onChange={(e) => updatePostLoginAction(postAct.id, 'selector', e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono text-[11px]"
                                  />

                                  {/* Quick Recommendation Selector Chips */}
                                  {POST_LOGIN_QUICK_SELECTORS[postAct.action] && (
                                    <div className="flex items-center gap-1 flex-wrap mt-1.5">
                                      <span className="text-[10px] text-gray-400 dark:text-zinc-500">Rekomendasi:</span>
                                      {POST_LOGIN_QUICK_SELECTORS[postAct.action].map((preset, prIdx) => (
                                        <button
                                          key={prIdx}
                                          type="button"
                                          onClick={() => updatePostLoginAction(postAct.id, 'selector', preset.value)}
                                          className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400 hover:border-amber-300 dark:hover:border-amber-700 border border-gray-200 dark:border-zinc-700 font-mono transition-colors active:scale-95 cursor-pointer"
                                        >
                                          {preset.label}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {config.needsValue && (
                                <div className={config.needsSelector ? 'sm:col-span-1' : 'sm:col-span-2 lg:col-span-3'}>
                                  <label className="block text-[10px] uppercase font-semibold text-gray-500 dark:text-zinc-400 mb-1">
                                    {postAct.action === 'assert_url'
                                      ? 'Bagian URL yang Diharapkan'
                                      : postAct.action === 'wait'
                                      ? 'Jeda Waktu (ms)'
                                      : postAct.action === 'select'
                                      ? 'Nilai / Value Opsi'
                                      : postAct.action === 'assert_text'
                                      ? 'Teks yang Harus Ada'
                                      : 'Nilai Inputan'}
                                  </label>
                                  <input
                                    type="text"
                                    placeholder={config.valuePlaceholder}
                                    value={postAct.value || ''}
                                    onChange={(e) => updatePostLoginAction(postAct.id, 'value', e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Card Footer Hint */}
                            <div className="px-4 pb-3 text-[10px] text-gray-500 dark:text-zinc-400 flex items-center justify-between border-t border-gray-100 dark:border-zinc-800/80 pt-2">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-zinc-600"></span>
                                <span>{config.hint}</span>
                              </div>
                              {postAct.optional && (
                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                  🛡️ Test tetap berlanjut meskipun elemen ini tidak ada saat login.
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🌟 The Single Most Effective Place: Sticky Sidebar Guide */}
        <div className="lg:sticky lg:top-6 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs text-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="font-bold text-gray-950 dark:text-white flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs">
                <BookOpen className="w-4 h-4" />
                <span>Kamus Selector Playwright</span>
              </h3>
            </div>

            {/* Crucial Tip: :visible */}
            <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 space-y-1">
              <span className="font-bold text-amber-800 dark:text-amber-300 text-[11px] block">
                ⚡ Aturan Emas: :visible
              </span>
              <p className="text-amber-900/80 dark:text-amber-200/80 text-[10px] leading-relaxed">
                Jika error <em>"locator resolved to 2 elements"</em>, gunakan selector berakhiran <code className="bg-white dark:bg-zinc-900 px-1 rounded font-mono font-bold">:visible</code> agar Playwright hanya mengklik tombol yang sedang tampil.
              </p>
            </div>

            {/* Quick Cheats */}
            <div className="space-y-2.5 text-[11px]">
              <div>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Tombol / Klik (Klik untuk salin)
                </span>
                <button
                  type="button"
                  onClick={() => copySnippet('button[type="submit"]:visible')}
                  className="w-full text-left text-amber-700 dark:text-amber-400 font-mono text-[10px] py-0.5 px-1 rounded hover:bg-amber-50 dark:hover:bg-amber-500/10 flex items-center justify-between transition-colors"
                >
                  <span>button[type="submit"]:visible</span>
                  {copiedSnippet === 'button[type="submit"]:visible' && <span className="text-[9px] text-emerald-500 font-sans">Tersalin!</span>}
                </button>
                <button
                  type="button"
                  onClick={() => copySnippet('button:has-text("Masuk")')}
                  className="w-full text-left text-gray-700 dark:text-zinc-300 font-mono text-[10px] py-0.5 px-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-between transition-colors"
                >
                  <span>button:has-text("Masuk")</span>
                  {copiedSnippet === 'button:has-text("Masuk")' && <span className="text-[9px] text-emerald-500 font-sans">Tersalin!</span>}
                </button>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Form Input (Klik untuk salin)
                </span>
                <button
                  type="button"
                  onClick={() => copySnippet('input[name="email"]:visible')}
                  className="w-full text-left text-amber-700 dark:text-amber-400 font-mono text-[10px] py-0.5 px-1 rounded hover:bg-amber-50 dark:hover:bg-amber-500/10 flex items-center justify-between transition-colors"
                >
                  <span>input[name="email"]:visible</span>
                  {copiedSnippet === 'input[name="email"]:visible' && <span className="text-[9px] text-emerald-500 font-sans">Tersalin!</span>}
                </button>
                <button
                  type="button"
                  onClick={() => copySnippet('input[type="password"]')}
                  className="w-full text-left text-gray-700 dark:text-zinc-300 font-mono text-[10px] py-0.5 px-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-between transition-colors"
                >
                  <span>input[type="password"]</span>
                  {copiedSnippet === 'input[type="password"]' && <span className="text-[9px] text-emerald-500 font-sans">Tersalin!</span>}
                </button>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                <span className="font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-1 text-[10px] mb-1">
                  <Terminal className="w-3 h-3 text-amber-500" />
                  Cek di Console Browser (F12)
                </span>
                <button
                  type="button"
                  onClick={() => copySnippet("$$('button[type=\"submit\"]:visible')")}
                  className="w-full text-left text-[10px] text-gray-600 dark:text-zinc-400 font-mono bg-gray-50 dark:bg-zinc-950 p-1.5 rounded border border-gray-200 dark:border-zinc-800 flex items-center justify-between hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                >
                  <span>$$('button[type="submit"]:visible')</span>
                  {copiedSnippet === "$$('button[type=\"submit\"]:visible')" && <span className="text-[9px] text-emerald-500 font-sans">Tersalin!</span>}
                </button>
              </div>
            </div>

            {/* The One Single Button to Open Full Dictionary */}
            <button
              type="button"
              onClick={() => setHelperModalTarget({ type: 'general' })}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buka Kamus Lengkap & Cari Pola</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Langkah Pengujian (Filament Repeater Style) */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-amber-500" />
              3. Rangkaian Langkah Pengujian Utama (Test Steps)
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
                {formData.steps.length} Langkah
              </span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Urutan aksi interaksi pengguna setelah autentikasi berhasil diselesaikan.
            </p>
          </div>

          {/* Action Types Add Bar & Visual Recorder */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsRecorderOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors cursor-pointer mr-1"
              title="Buka browser visual untuk merekam langkah tes"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Rekam Interaksi Web</span>
            </button>

            <span className="text-[11px] text-gray-400 dark:text-zinc-500 mr-1">Tambah:</span>
            <button
              type="button"
              onClick={() => addStep('type')}
              className="px-2.5 py-1 text-[11px] font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-md hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
            >
              + Input Teks
            </button>
            <button
              type="button"
              onClick={() => addStep('click')}
              className="px-2.5 py-1 text-[11px] font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
            >
              + Klik Tombol
            </button>
            <button
              type="button"
              onClick={() => addStep('assert_text')}
              className="px-2.5 py-1 text-[11px] font-medium bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20 rounded-md hover:bg-teal-100 dark:hover:bg-teal-500/20 transition-colors"
            >
              + Cek Teks
            </button>
            <button
              type="button"
              onClick={() => addStep('sub_scenario')}
              className="px-2.5 py-1 text-[11px] font-medium bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20 rounded-md hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-colors"
            >
              + Sub-Flow
            </button>
            <button
              type="button"
              onClick={() => addStep('screenshot')}
              className="px-2.5 py-1 text-[11px] font-medium bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-md hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
            >
              + Screenshot
            </button>
          </div>
        </div>

        {/* Steps Repeater Items */}
        <div className="space-y-3">
          {formData.steps.map((step, index) => {
            const config = ACTION_CONFIGS[step.action] || ACTION_CONFIGS.type;
            const isFirst = index === 0;
            const isLast = index === formData.steps.length - 1;

            return (
              <div
                key={step.id}
                className={`border rounded-xl transition-all ${
                  step.enabled !== false
                    ? 'bg-gray-50/50 dark:bg-zinc-950/60 border-gray-200 dark:border-zinc-800'
                    : 'bg-gray-100/50 dark:bg-zinc-950/20 border-gray-200/60 dark:border-zinc-800/40 opacity-60'
                }`}
              >
                {/* Repeater Item Header */}
                <div className="px-4 py-2.5 bg-gray-100/80 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800/80 rounded-t-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="w-5 h-5 rounded bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    <select
                      value={step.action}
                      onChange={(e) => updateStep(step.id, 'action', e.target.value)}
                      className={`text-xs font-semibold px-2 py-0.5 rounded border focus:outline-none ${config.badge} bg-white dark:bg-zinc-900 cursor-pointer`}
                    >
                      {Object.entries(ACTION_CONFIGS).map(([key, item]) => (
                        <option key={key} value={key} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
                          {item.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Label langkah..."
                      value={step.label}
                      onChange={(e) => updateStep(step.id, 'label', e.target.value)}
                      className="bg-transparent text-xs text-gray-900 dark:text-white font-medium border-b border-transparent hover:border-gray-300 dark:hover:border-zinc-700 focus:border-amber-500 focus:outline-none px-1 py-0.5 flex-1 truncate"
                    />
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveStep(index, -1)}
                      disabled={isFirst}
                      title="Geser ke atas"
                      className={`p-1 rounded transition-colors ${
                        isFirst
                          ? 'text-gray-300 dark:text-zinc-700 cursor-not-allowed'
                          : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => moveStep(index, 1)}
                      disabled={isLast}
                      title="Geser ke bawah"
                      className={`p-1 rounded transition-colors ${
                        isLast
                          ? 'text-gray-300 dark:text-zinc-700 cursor-not-allowed'
                          : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStep(step.id, 'enabled', step.enabled === false ? true : false)}
                      className="text-[11px] font-medium px-2 py-0.5 rounded text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 ml-1"
                    >
                      {step.enabled !== false ? 'Aktif' : 'Lewati'}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      title="Hapus langkah"
                      className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Repeater Item Fields */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {config.needsTarget && (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-[10px] uppercase font-semibold text-gray-500 dark:text-zinc-400 mb-1">
                        Target URL
                      </label>
                      <input
                        type="text"
                        placeholder={config.targetPlaceholder}
                        value={step.target}
                        onChange={(e) => updateStep(step.id, 'target', e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono text-[11px]"
                      />
                    </div>
                  )}

                  {config.needsSelector && (
                    <div className="sm:col-span-1 lg:col-span-2 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-[10px] uppercase font-semibold text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                          <span>Selector Utama (Primary)</span>
                          {Array.isArray(step.fallbacks) && step.fallbacks.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">
                              <Sparkles className="w-2.5 h-2.5" />
                              +{step.fallbacks.length} Fallback
                            </span>
                          )}
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setHelperModalTarget({ type: 'step-primary', stepId: step.id })}
                            className="text-[10px] font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:underline flex items-center gap-1"
                            title="Buka Kamus Selector untuk selector utama"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Kamus</span>
                          </button>
                          <span className="text-gray-300 dark:text-zinc-700">|</span>
                          <button
                            type="button"
                            onClick={() => addStepFallback(step.id, '')}
                            className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline flex items-center gap-1"
                            title="Tambah alternatif selector cadangan"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ Fallback</span>
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder={config.selectorPlaceholder}
                        value={step.selector || ''}
                        onChange={(e) => updateStep(step.id, 'selector', e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono text-[11px]"
                      />

                      {/* Clickable Recommended Presets */}
                      {QUICK_SELECTOR_PRESETS[step.action] && (
                        <div className="flex items-center gap-1 flex-wrap pt-0.5">
                          <span className="text-[10px] text-gray-400 dark:text-zinc-500">Rekomendasi:</span>
                          {QUICK_SELECTOR_PRESETS[step.action].map((preset, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => updateStep(step.id, 'selector', preset.value)}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400 hover:border-amber-300 dark:hover:border-amber-700 border border-gray-200 dark:border-zinc-700 font-mono transition-colors active:scale-95 cursor-pointer"
                              title={`Klik untuk mengisi: ${preset.value}`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Adaptive Fallback Selectors Chain */}
                      {Array.isArray(step.fallbacks) && step.fallbacks.length > 0 && (
                        <div className="mt-2.5 p-2.5 bg-gray-50/80 dark:bg-zinc-950/60 border border-dashed border-gray-300 dark:border-zinc-800 rounded-lg space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              Selector Cadangan (Adaptive Fallback Chain)
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                              Failover 1.5 detik
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {step.fallbacks.map((fallbackVal, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono px-1.5 py-1 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20 shrink-0">
                                  #{fIdx + 1}
                                </span>
                                <input
                                  type="text"
                                  placeholder={`Selector cadangan ke-${fIdx + 1} (misal: button:has-text("Kirim"))`}
                                  value={fallbackVal}
                                  onChange={(e) => updateStepFallback(step.id, fIdx, e.target.value)}
                                  className="flex-1 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md px-2 py-1 text-[11px] font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => setHelperModalTarget({ type: 'step-fallback', stepId: step.id, fallbackIndex: fIdx })}
                                  className="p-1 rounded text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"
                                  title="Pilih dari Kamus"
                                >
                                  <BookOpen className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveStepFallback(step.id, fIdx, -1)}
                                  disabled={fIdx === 0}
                                  className={`p-1 rounded transition-colors ${
                                    fIdx === 0 ? 'text-gray-300 dark:text-zinc-800 cursor-not-allowed' : 'text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-800'
                                  }`}
                                  title="Naikkan prioritas"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveStepFallback(step.id, fIdx, 1)}
                                  disabled={fIdx === step.fallbacks.length - 1}
                                  className={`p-1 rounded transition-colors ${
                                    fIdx === step.fallbacks.length - 1 ? 'text-gray-300 dark:text-zinc-800 cursor-not-allowed' : 'text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-800'
                                  }`}
                                  title="Turunkan prioritas"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeStepFallback(step.id, fIdx)}
                                  className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                  title="Hapus cadangan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[10px]">
                            <button
                              type="button"
                              onClick={() => addStepFallback(step.id, '')}
                              className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Tambah Cadangan Lain</span>
                            </button>
                            <span className="text-gray-400 dark:text-zinc-500 italic">
                              Otomatis dicoba jika selector primer timeout
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {config.needsSubScenario && (
                    <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                      <label className="block text-[10px] uppercase font-semibold text-gray-500 dark:text-zinc-400 mb-1">
                        Pilih Skenario Sub-Flow / Komponen
                      </label>
                      <select
                        value={step.subScenarioId || ''}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const targetSc = availableSubScenarios.find((s) => s.id === selectedId);
                          updateStep(step.id, 'subScenarioId', selectedId);
                          if (targetSc && (!step.label || step.label.startsWith('Jalankan Sub-Flow') || step.label.startsWith('Sub-Flow:'))) {
                            updateStep(step.id, 'label', `Sub-Flow: ${targetSc.name}`);
                          }
                        }}
                        className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-medium"
                      >
                        <option value="">-- Pilih Skenario Komponen untuk Dijalankan --</option>
                        {availableSubScenarios.map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {sc.isComponent || (Array.isArray(sc.tags) && sc.tags.includes('component')) ? '🧩 ' : '📄 '}
                            {sc.name} ({(sc.steps || []).length} langkah)
                          </option>
                        ))}
                      </select>

                      {/* Sub-scenario preview box if selected */}
                      {(() => {
                        const selectedSub = availableSubScenarios.find((s) => s.id === step.subScenarioId);
                        if (!selectedSub) return null;
                        const subSteps = (selectedSub.steps || []).filter((s) => s.enabled !== false);

                        return (
                          <div className="mt-2 p-3 bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-800/40 rounded-lg space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-violet-900 dark:text-violet-300 flex items-center gap-1.5">
                                <Boxes className="w-4 h-4 text-violet-500" />
                                <span>Komponen: {selectedSub.name}</span>
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-mono font-bold">
                                {subSteps.length} langkah
                              </span>
                            </div>

                            {selectedSub.description && (
                              <p className="text-[11px] text-gray-600 dark:text-zinc-400">
                                {selectedSub.description}
                              </p>
                            )}

                            <div className="pt-1 border-t border-violet-100 dark:border-violet-900/40 space-y-1">
                              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 block">
                                Rangkaian Langkah di Dalam Komponen:
                              </span>
                              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                                {subSteps.map((st, idx) => (
                                  <div
                                    key={st.id || idx}
                                    className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-zinc-300 bg-white/70 dark:bg-zinc-900/70 px-2 py-1 rounded border border-violet-100/60 dark:border-violet-900/30 font-mono"
                                  >
                                    <span className="text-[10px] text-violet-500 font-bold shrink-0">#{idx + 1}</span>
                                    <span className="px-1 py-0.2 rounded bg-gray-100 dark:bg-zinc-800 text-[9px] uppercase text-gray-600 dark:text-zinc-400 shrink-0">
                                      {st.action}
                                    </span>
                                    <span className="truncate">{st.label || st.selector || st.target || ''}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {config.needsValue && (
                    <div className={config.needsSelector ? 'sm:col-span-1' : 'sm:col-span-2 lg:col-span-3'}>
                      <label className="block text-[10px] uppercase font-semibold text-gray-500 dark:text-zinc-400 mb-1">
                        Nilai / Inputan / Expected
                      </label>
                      <input
                        type="text"
                        placeholder={config.valuePlaceholder}
                        value={step.value}
                        onChange={(e) => updateStep(step.id, 'value', e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>

                <div className="px-4 pb-3 text-[10px] text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-zinc-600"></span>
                  {config.hint}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Step Buttons */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => addStep('type')}
            className="py-2.5 border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-amber-500/60 rounded-xl text-gray-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Langkah Interaksi</span>
          </button>

          <button
            type="button"
            onClick={() => addStep('sub_scenario')}
            className="py-2.5 border-2 border-dashed border-violet-300 dark:border-violet-800/80 hover:border-violet-500 rounded-xl text-violet-700 dark:text-violet-400 hover:bg-violet-500/5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Boxes className="w-4 h-4" />
            <span>Sisipkan Sub-Flow</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRecorderOpen(true)}
            className="py-2.5 border-2 border-dashed border-rose-300 dark:border-rose-800/80 hover:border-rose-500 rounded-xl text-rose-700 dark:text-rose-400 hover:bg-rose-500/5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Radio className="w-4 h-4 animate-pulse text-rose-500" />
            <span>Rekam via Browser Visual</span>
          </button>
        </div>
      </div>

      {/* Visual Web Recorder Modal */}
      <VisualRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        initialUrl={formData.baseUrl}
        onImportSteps={handleImportRecordedSteps}
      />

      {/* Kamus Selector Modal with Adaptive Pattern Selection */}
      <SelectorHelperModal
        isOpen={Boolean(helperModalTarget)}
        onClose={() => setHelperModalTarget(null)}
        onSelectPattern={handleSelectPatternFromModal}
      />

      {/* Filament Notification Toast */}
      <Toast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
