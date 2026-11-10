# Changelog

Semua perubahan penting pada proyek **QA Flow Studio (Web Tester)** akan didokumentasikan di berkas ini. Format changelog ini mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan mematuhi [Semantic Versioning](https://semver.org/).

---

## [1.1.0] - 2026-11-10

### 🚀 Ditambahkan (Added)
- **Smart Session Detection (`Keep Session`)**:
  - Runner kini secara cerdas mendeteksi apakah sesi pengguna masih aktif di dashboard sebelum mencoba login ulang pada skenario berikutnya di dalam Test Suite.
  - Menghindari kegagalan *Timeout 30000ms* pada `locator('input#email')` saat sesi browser dipertahankan (`keepSession: true`).
- **Dukungan Khusus Filament & Choices.js**:
  - Penambahan modul `normalizeSelector` pada runner untuk menerjemahkan pseudo-selector jQuery (`:first()`, `:first`, `:last()`, `:eq(n)`) ke syntax resmi Playwright (`>> nth=...`).
  - Cheat sheet visual 3-langkah untuk dropdown searchable Filament di dalam modal bantuan selector (`SelectorHelperModal.jsx`).
  - Quick recommendation pills untuk komponen Choices.js: `[wire\:key*="field"] .choices__inner`, `.choices__item--selectable`, dan `input.choices__input--cloned:visible`.
- **Rincian Eksekusi Test Suite Terpadu**:
  - Overhaul total modal riwayat eksekusi Test Suite (`TargetHistoryModal.jsx`).
  - Accordion per skenario dengan status kelulusan visual. Skenario yang gagal otomatis terbuka.
  - Rincian per step lengkap dengan status, durasi dalam milidetik (ms), box call log error berwarna merah, serta tombol preview tangkapan layar (**Lihat Bukti Foto**).
- **Setup Repositori GitHub**:
  - Inisialisasi Git dan publikasi repository ke [github.com/fadilAndrian/web-tester](https://github.com/fadilAndrian/web-tester).
  - Penambahan file `.gitignore` standar untuk Node, Electron, dan storage tangkapan layar.

### 🔄 Diubah (Changed)
- **Cache Busting Runner Dev Mode**:
  - Pembersihan cache `require.cache` otomatis untuk `runner.cjs` pada IPC handler di `electron/main.cjs` agar perubahan runner langsung diterapkan tanpa perlu full restart.
- **Dokumentasi `README.md`**:
  - Diperbarui dengan panduan lengkap arsitektur FilamentPHP, dukungan PostgreSQL relasional, dan tips selector otomatisasi Livewire/Filament.

### 🗑️ Dihapus (Removed)
- **Halaman Riwayat Eksekusi Standalone**:
  - Menu navigasi *Monitoring & Log ➔ Riwayat Eksekusi* dihapus dari Sidebar dan Topbar agar navigasi lebih terfokus pada *Skenario Tes* dan *Test Suites*. Riwayat kini diakses langsung *in-context* dari kartu atau tombol riwayat masing-masing skenario/suite.
- **Template Alur Cepat di Form Skenario**:
  - Menghapus tombol preset template alur cepat pada bagian Setup Autentikasi 2.d agar formulir lebih bersih dan fleksibel.

---

## [1.0.0] - 2026-11-09

### 🚀 Rilis Perdana (Initial Release)
- **FilamentPHP Admin UI & Standar `no-slop-ui`**:
  - Tampilan dashboard bersih terinspirasi FilamentPHP dengan switch **Dark & Light Mode**.
  - Sidebar tetap (256px), badge counter dinamis, dan widget statistik (*Stats Overview*).
- **PostgreSQL Database Storage**:
  - Migrasi dari file JSON lokal ke basis data PostgreSQL (`qa_flow_studio`) dengan query JSONB terindeks GIN.
  - Multi-Project Workspace: isolasi data antar project (Health-E Iris, dll.) dengan branding warna dan Base URL mandiri.
- **Scenario Builder (Setup Tes)**:
  - Form autentikasi multi-kredensial (Username, Password, Extra Inputs, Checkbox).
  - Berbagai jenis aksi Playwright: `navigate`, `type`, `click`, `select`, `check`, `wait`, `assert_visible`, `assert_text`, `assert_url`, dan `screenshot`.
- **Test Suite Orchestrator**:
  - Penggabungan beberapa skenario independen ke dalam satu urutan eksekusi (*Execution Sequence*).
  - Fitur *Shared Session / Keep Cookies*.
- **Live Runner & Logging**:
  - Mode browser Chrome Terlihat (Headed) dan Background (Headless).
  - Pengaturan kecepatan simulasi: Cepat (0ms), Normal (300ms), Demo (600ms).
  - Live console terminal log dengan pewarnaan status dan auto-scroll.
