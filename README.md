# QA Flow Studio (Web Tester) 🚀
> **Enterprise Desktop Web Test Automation Runner & Orchestrator**  
> Dibangun dengan UI terinspirasi **FilamentPHP Admin Dashboard**, mematuhi standar desain **[no-slop-ui](https://github.com/LeoStehlik/no-slop-ui)**, ditenagai **Playwright** & **PostgreSQL**, lengkap dengan fitur **Multi-Project Workspace** dan switch **Dark & Light Mode**.

---

## 🎨 Tampilan & Desain (FilamentPHP Style & No-Slop-UI)

Aplikasi dibangun dengan antarmuka administratif khas **FilamentPHP**:
* **Project Switcher (Sidebar Kiri Atas)**:
  * Dropdown pemilihan workspace / multi-project instan (Health-E Iris, E-Commerce, dll.).
  * Pengaturan warna branding dan Base URL per projek.
* **Folder Modul**:
  * Pengelompokan skenario tes per modul bisnis (Autentikasi, Role & Permisi / RBAC, Master Data, Transaksi).
* **Navigasi Terfokus**:
  * *Manajemen Pengujian*: **Skenario Tes** & **Test Suites**.
  * Riwayat eksekusi dan log kegagalan tertanam langsung di dalam tiap skenario dan suite (*in-context history modal*).
* **Dark & Light Mode Switcher**:
  * Toggle tema (Matahari / Bulan) di topbar dengan penyimpanan otomatis ke `localStorage`.
* **Mematuhi Prinsip `no-slop-ui`**:
  * ❌ Tanpa background gradient ungu generik atau efek glassmorphism berlebihan.
  * ❌ Tanpa sudut melengkung ekstrem (border radius 8–12px profesional).
  * ✅ Tata letak bersih, border halus 1px, ring fokus tegas, hierarki tipografi fungsional.

---

## 🌟 Fitur Unggulan

1. **Multi-Project & Multi-Module Workspace**:
   - Mendukung 5+ projek dengan 100+ skenario pengujian per projek.
   - Database terisolasi per project ID menggunakan PostgreSQL relasional.

2. **Dukungan Khusus Filament & Livewire**:
   - **Smart Session Detection**: Otomatis mendeteksi jika sesi login masih aktif (*Keep Session*) pada suite dan melewati form login tanpa error timeout.
   - **Choices.js Searchable Select Support**: Panduan khusus dan auto-normalizer untuk selector dropdown dinamis Filament (`[wire\:key*="..."] .choices__inner`, `.choices__item--selectable`).
   - **Auto-Normalizer Selector**: Menangani selector Playwright cerdas (`>> nth=0`, filter `:visible`, dan auto-retry saat detasemen Livewire DOM morphing terjadi).

3. **Scenario Builder (Setup Tes)**:
   - Form autentikasi fleksibel: multi-input (Username, Password, Extra Inputs, Checkbox), dan aksi pasca-login (OTP 2FA, verifikasi URL, popup dismissal).
   - Rangkaian aksi lengkap: *Navigate*, *Type*, *Click*, *Select*, *Check*, *Wait*, *Assert Visible*, *Assert Text*, *Assert URL*, *Screenshot*.

4. **Test Suite & Shared Session (Keep Cookies)**:
   - Menghubungkan beberapa skenario menjadi satu rantai eksekusi terpadu.
   - Opsi *Shared Session* untuk meneruskan status login antar skenario tanpa perlu login ulang.

5. **Live Runner & In-Context Inspection**:
   - Mode browser **Chrome Terlihat (Headed)** atau **Background (Headless)**.
   - Pilihan kecepatan eksekusi (Cepat 0ms, Normal 300ms, Demo 600ms).
   - Live Terminal log per langkah.
   - Modal riwayat komprehensif: menampilkan rincian tiap langkah, durasi ms, error call log, dan foto tangkapan layar bukti kegagalan.

6. **PostgreSQL Storage Engine**:
   - Skema relasional terindeks: tabel `projects`, `modules`, `scenarios` (JSONB), `suites`, dan `test_runs` (JSONB).
   - Query JSONB berkecepatan tinggi dengan indeks GIN.

---

## 🛠️ Prasyarat

* **Node.js** v18+ atau v20+
* **PostgreSQL** v14+ (Database: `qa_flow_studio`)
* **Google Chrome** terinstal di sistem

---

## 🚀 Cara Menjalankan

1. **Clone repositori**:
   ```bash
   git clone https://github.com/fadilAndrian/web-tester.git
   cd web-tester
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Pastikan PostgreSQL berjalan**:
   ```bash
   # Contoh pada macOS (Homebrew):
   brew services start postgresql
   ```

4. **Jalankan Aplikasi dalam Mode Pengembangan**:
   ```bash
   npm run dev
   ```

5. **Build Aplikasi Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📄 Lisensi
MIT License
