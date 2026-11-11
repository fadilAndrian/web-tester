module.exports = {
  scenarios: [
    {
      id: "sc-todo-01",
      name: "TodoMVC: Tambah & Selesaikan Tugas",
      description: "Membuat todo baru, menandai selesai, dan memeriksa sisa tugas.",
      baseUrl: "https://demo.playwright.dev/todomvc/#/",
      authConfig: {
        enabled: false,
        usernameSelector: "",
        usernameValue: "",
        passwordSelector: "",
        passwordValue: "",
        submitSelector: ""
      },
      steps: [
        {
          id: "step-1",
          action: "navigate",
          label: "Buka Halaman TodoMVC",
          target: "https://demo.playwright.dev/todomvc/#/",
          selector: "",
          value: "",
          timeout: 10000,
          enabled: true
        },
        {
          id: "step-2",
          action: "assert_visible",
          label: "Pastikan Input Todo Terlihat",
          target: "",
          selector: "input.new-todo",
          fallbacks: ["input[placeholder*='needs to be done']", ".new-todo"],
          value: "",
          timeout: 5000,
          enabled: true
        },
        {
          id: "step-3",
          action: "type",
          label: "Ketik Todo Pertama & Tekan Enter",
          target: "",
          selector: "input.new-todo",
          fallbacks: ["input[placeholder*='needs to be done']"],
          value: "Beli Kopi untuk Tim QA{Enter}",
          timeout: 5000,
          enabled: true
        },
        {
          id: "step-4",
          action: "type",
          label: "Ketik Todo Kedua & Tekan Enter",
          target: "",
          selector: "input.new-todo",
          value: "Buat Laporan Test Plan{Enter}",
          timeout: 5000,
          enabled: true
        },
        {
          id: "step-5",
          action: "assert_text",
          label: "Verifikasi Daftar Todo Memuat 'Beli Kopi'",
          target: "",
          selector: ".todo-list",
          value: "Beli Kopi",
          timeout: 5000,
          enabled: true
        },
        {
          id: "step-6",
          action: "click",
          label: "Centang Selesai pada Tugas Pertama",
          target: "",
          selector: ".todo-list li:first-child .toggle",
          value: "",
          timeout: 5000,
          enabled: true
        },
        {
          id: "step-7",
          action: "screenshot",
          label: "Ambil Screenshot Status Todo",
          target: "",
          selector: "",
          value: "todomvc_status",
          timeout: 5000,
          enabled: true
        },
        {
          id: "step-8",
          action: "assert_text",
          label: "Cek Sisa Item Adalah 1",
          target: "",
          selector: ".todo-count",
          value: "1 item left",
          timeout: 5000,
          enabled: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "sc-wiki-02",
      name: "Wikipedia ID: Pencarian Istilah QA",
      description: "Mencari halaman Wikipedia Indonesia dan memverifikasi judul artikel.",
      baseUrl: "https://id.wikipedia.org",
      authConfig: {
        enabled: false,
        usernameSelector: "",
        usernameValue: "",
        passwordSelector: "",
        passwordValue: "",
        submitSelector: ""
      },
      steps: [
        {
          id: "step-w1",
          action: "navigate",
          label: "Buka Wikipedia Indonesia",
          target: "https://id.wikipedia.org",
          selector: "",
          value: "",
          timeout: 10000,
          enabled: true
        },
        {
          id: "step-w2",
          action: "type",
          label: "Masukkan Kata Kunci di Kolom Cari",
          target: "",
          selector: "input[name='search']",
          value: "Jaminan kualitas",
          timeout: 5000,
          enabled: true
        },
        {
          id: "step-w3",
          action: "click",
          label: "Klik Tombol Cari",
          target: "",
          selector: "form#searchform button",
          value: "",
          timeout: 5000,
          enabled: true
        },
        {
          id: "step-w4",
          action: "wait",
          label: "Tunggu Hasil Memuat (1.5 detik)",
          target: "",
          selector: "",
          value: "1500",
          timeout: 5000,
          enabled: true
        },
        {
          id: "step-w5",
          action: "assert_visible",
          label: "Pastikan Judul Artikel Muncul",
          target: "",
          selector: "#firstHeading",
          value: "",
          timeout: 5000,
          enabled: true
        },
        {
          id: "step-w6",
          action: "screenshot",
          label: "Tangkapan Layar Hasil Pencarian",
          target: "",
          selector: "",
          value: "wiki_qa_search",
          timeout: 5000,
          enabled: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  suites: [
    {
      id: "suite-smoke-01",
      name: "Smoke Test Suite: Flow Lengkap",
      description: "Menjalankan TodoMVC dilanjutkan dengan verifikasi pencarian Wikipedia.",
      scenarioIds: ["sc-todo-01", "sc-wiki-02"],
      keepSession: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  history: []
};
