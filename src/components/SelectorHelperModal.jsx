import React, { useState } from 'react';
import {
  X,
  Search,
  Copy,
  Check,
  Code2,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Terminal,
  MousePointer,
  Keyboard,
  Layers,
  Eye,
  ShieldAlert
} from 'lucide-react';

const SELECTOR_CATEGORIES = [
  {
    id: 'text',
    name: 'Teks & Label Tombol',
    icon: MousePointer,
    description: 'Paling stabil & mirip cara manusia membaca halaman web.',
    items: [
      {
        pattern: 'button:has-text("Masuk")',
        description: 'Mencari tombol yang memuat tulisan "Masuk" (case-insensitive).',
        example: '<button>Masuk ke Akun</button>'
      },
      {
        pattern: 'text="Simpan Perubahan"',
        description: 'Mencari elemen teks apa pun dengan kalimat tersebut.',
        example: '<span>Simpan Perubahan</span>'
      },
      {
        pattern: 'a:has-text("Dashboard")',
        description: 'Mencari link navigasi (tag <a>) dengan teks Dashboard.',
        example: '<a href="/home">Dashboard Admin</a>'
      },
      {
        pattern: 'button:text-is("Login")',
        description: 'Mencari tombol dengan teks persis "Login" (exact match).',
        example: '<button>Login</button>'
      }
    ]
  },
  {
    id: 'visible',
    name: 'Filter Tampil (:visible)',
    icon: Eye,
    highlight: true,
    description: 'Solusi jika ada 2 elemen identik (misal tombol desktop & mobile).',
    items: [
      {
        pattern: 'button[type="submit"]:visible',
        description: 'Hanya memilih tombol submit yang benar-benar tampil di layar, mengabaikan tombol hidden/mobile.',
        example: '<button type="submit" class="hidden md:block">Submit</button>'
      },
      {
        pattern: 'input[name="email"]:visible',
        description: 'Hanya memilih input email yang sedang aktif & terlihat.',
        example: '<input name="email" />'
      },
      {
        pattern: '.modal.open button:visible',
        description: 'Memilih tombol hanya di dalam popup modal yang sedang terbuka.',
        example: '<div class="modal open"><button>Tutup</button></div>'
      }
    ]
  },
  {
    id: 'forms',
    name: 'Form & Input Kolom',
    icon: Keyboard,
    description: 'Mengenali kolom input berdasarkan nama, tipe, atau placeholder.',
    items: [
      {
        pattern: 'input[name="username"]',
        description: 'Berdasarkan atribut name form input.',
        example: '<input type="text" name="username" />'
      },
      {
        pattern: 'input[type="password"]',
        description: 'Memilih kolom input kata sandi.',
        example: '<input type="password" />'
      },
      {
        pattern: 'input[placeholder*="Cari"]',
        description: 'Mencari input yang placeholdernya memuat kata "Cari".',
        example: '<input placeholder="Cari nama produk..." />'
      },
      {
        pattern: 'select[name="kategori"]',
        description: 'Memilih elemen dropdown <select> berdasarkan name.',
        example: '<select name="kategori"><option>Elektronik</option></select>'
      },
      {
        pattern: 'textarea[name="catatan"]',
        description: 'Memilih kolom input teks panjang (textarea).',
        example: '<textarea name="catatan"></textarea>'
      }
    ]
  },
  {
    id: 'frameworks',
    name: 'Filament, Livewire & Searchable Select',
    icon: Layers,
    highlight: true,
    description: 'Atribut khusus pada Laravel Filament, Livewire, dan dropdown Choices.js.',
    items: [
      {
        pattern: '[wire\\:key*="nama_field"] .choices__inner',
        description: 'Buka dropdown Searchable Select Filament berdasarkan nama field database (aman jika ada banyak dropdown).',
        example: '<div wire:key="...data.medical_record_id..."><div class="choices__inner">...</div></div>'
      },
      {
        pattern: '.filament-forms-field-wrapper:has-text("No. Rekam Medis") .choices__inner',
        description: 'Buka dropdown Choices.js berdasarkan teks label form yang terlihat di layar.',
        example: '<div class="filament-forms-field-wrapper"><label>No. Rekam Medis</label>...</div>'
      },
      {
        pattern: 'input.choices__input--cloned:visible',
        description: 'Kolom pencarian teks saat dropdown Choices.js/Filament sedang terbuka.',
        example: '<input type="search" class="choices__input--cloned" placeholder="Ketik untuk mencari...">'
      },
      {
        pattern: '.choices__item--selectable',
        description: 'Pilih opsi hasil pencarian pertama pada dropdown Choices.js (bersih, tanpa perlu :not atau :first).',
        example: '<div class="choices__item choices__item--selectable">RM-001 - Budi</div>'
      },
      {
        pattern: '[wire\\:key*="nama_field"] .choices__item--selectable',
        description: 'Pilih opsi pertama spesifik pada field tertentu jika ada lebih dari 1 dropdown di satu halaman.',
        example: '<div wire:key="...doctor_id..."><div class="choices__item--selectable">dr. Siti</div></div>'
      },
      {
        pattern: '.choices__item--choice:has-text("RM-001")',
        description: 'Pilih opsi item dari hasil pencarian dropdown yang memuat teks atau nomor spesifik.',
        example: '<div class="choices__item--choice">RM-001 - Budi</div>'
      },
      {
        pattern: 'button[type="submit"]:visible',
        description: 'Tombol submit Filament/Livewire yang sedang aktif (otomatis mengabaikan tombol hidden/duplikat).',
        example: '<button type="submit" wire:target="authenticate">Masuk</button>'
      },
      {
        pattern: '[data-filament-action]',
        description: 'Tombol aksi khusus pada tabel atau halaman Filament.',
        example: '<button data-filament-action="create">Tambah</button>'
      },
      {
        pattern: '[wire\\:model="data.email"]',
        description: 'Input yang terikat ke state Livewire wire:model.',
        example: '<input wire:model="data.email" />'
      },
      {
        pattern: 'button[wire\\:target="authenticate"]:visible',
        description: 'Tombol spesifik aksi otentikasi Livewire.',
        example: '<button wire:target="authenticate">Masuk</button>'
      }
    ]
  },
  {
    id: 'hierarchy',
    name: 'Urutan & Hierarki (Index / Nth)',
    icon: Code2,
    description: 'Memilih elemen bersarang atau urutan tertentu dalam list.',
    items: [
      {
        pattern: 'form#login-form >> button[type="submit"]',
        description: 'Tombol submit yang berada spesifik di dalam form dengan ID "login-form".',
        example: '<form id="login-form"><button type="submit">Submit</button></form>'
      },
      {
        pattern: '.todo-list li >> nth=0',
        description: 'Memilih item urutan pertama (index 0) pada daftar todo.',
        example: '<ul class="todo-list"><li>Pertama</li><li>Kedua</li></ul>'
      },
      {
        pattern: '.todo-list li >> nth=-1',
        description: 'Memilih item paling terakhir dari daftar.',
        example: '<ul class="todo-list"><li>Pertama</li><li>Terakhir</li></ul>'
      },
      {
        pattern: 'tr:has-text("INV-001") >> button',
        description: 'Memilih tombol yang berada pada baris tabel yang memuat teks "INV-001".',
        example: '<tr><td>INV-001</td><td><button>Lihat</button></td></tr>'
      }
    ]
  },
  {
    id: 'testid',
    name: 'ID & Testing Attributes',
    icon: Sparkles,
    description: 'Standar pengujian menggunakan ID unik atau atribut data-testid.',
    items: [
      {
        pattern: '#id-unik',
        description: 'Berdasarkan ID elemen HTML (paling cepat dan spesifik).',
        example: '<button id="btn-submit">Kirim</button>'
      },
      {
        pattern: '[data-testid="tombol-bayar"]',
        description: 'Standar QA modern: atribut data-testid khusus automation.',
        example: '<button data-testid="tombol-bayar">Bayar</button>'
      },
      {
        pattern: '[aria-label="Tutup Dialog"]',
        description: 'Berdasarkan label aksesibilitas tombol (misal tombol silang modal).',
        example: '<button aria-label="Tutup Dialog">×</button>'
      }
    ]
  }
];

export default function SelectorHelperModal({ isOpen, onClose, onSelectPattern }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [copiedPattern, setCopiedPattern] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (pattern) => {
    navigator.clipboard.writeText(pattern);
    setCopiedPattern(pattern);
    setTimeout(() => setCopiedPattern(null), 1800);
  };

  const handleUse = (pattern) => {
    if (typeof onSelectPattern === 'function') {
      onSelectPattern(pattern);
    }
    onClose();
  };

  // Filter items
  const filteredCategories = SELECTOR_CATEGORIES.map((cat) => {
    const matchesCategory = activeCategory === 'all' || activeCategory === cat.id;
    const filteredItems = cat.items.filter((item) => {
      const q = searchTerm.toLowerCase();
      return (
        item.pattern.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        cat.name.toLowerCase().includes(q)
      );
    });
    return { ...cat, matchesCategory, filteredItems };
  }).filter((cat) => cat.matchesCategory && cat.filteredItems.length > 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-gray-50/70 dark:bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-950 dark:text-white">
                Kamus & Panduan Selector Playwright
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                Pilih pola selector yang sesuai atau gunakan tombol salin untuk disisipkan ke langkah tes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari pola selector (misal: :visible, button, input, text, Livewire)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                activeCategory === 'all'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
              }`}
            >
              Semua Kategori
            </button>
            {SELECTOR_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.highlight && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Tip Banner: Cara Cek di Chrome DevTools */}
          <div className="p-3.5 bg-amber-50/60 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 text-xs">
              <Terminal className="w-4 h-4" />
              <span>Cara Menguji Selector di Browser Anda Sebelum Menjalankan Tes:</span>
            </div>
            <p className="text-amber-900/80 dark:text-amber-200/80 leading-relaxed text-[11px]">
              Buka website yang ingin diuji di Google Chrome, tekan <kbd className="font-mono bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200">F12</kbd> (atau Klik Kanan → <em>Inspect</em>), lalu buka tab <strong>Console</strong>. Ketik perintah:
            </p>
            <div className="bg-white dark:bg-zinc-950 p-2 rounded-lg border border-amber-200 dark:border-amber-500/20 font-mono text-[11px] text-amber-900 dark:text-amber-200 flex items-center justify-between">
              <code>$$('button[type="submit"]')</code>
              <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-sans">
                (Jika muncul lebih dari 1 elemen, gunakan filter <strong className="font-mono">:visible</strong>)
              </span>
            </div>
          </div>

          {/* Special Visual Guide: Filament Searchable Select (Choices.js) */}
          <div className="p-4 bg-sky-50/60 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 rounded-xl text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sky-950 dark:text-sky-300 text-xs">
                <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Panduan Khusus: Dropdown Searchable Filament (Choices.js)</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300">
                Alur 3 Langkah
              </span>
            </div>
            <p className="text-[11px] text-sky-900/80 dark:text-sky-200/80 leading-relaxed">
              Dropdown Filament dengan fitur cari tidak menggunakan tag <code className="font-mono bg-white dark:bg-zinc-800 px-1 py-0.5 rounded">&lt;select&gt;</code> standar. Gunakan susunan 3 langkah berikut:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
              <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-sky-200 dark:border-sky-500/20 space-y-1">
                <div className="font-bold text-sky-700 dark:text-sky-400 font-sans text-[11px]">1. Aksi Click (Buka Dropdown)</div>
                <code className="text-[10px] text-gray-800 dark:text-zinc-200 block truncate font-mono">[wire\:key*="field_name"] .choices__inner</code>
                <div className="text-[10px] text-gray-500 dark:text-zinc-400 font-sans">Membuka kotak list pilihan.</div>
              </div>
              <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-sky-200 dark:border-sky-500/20 space-y-1">
                <div className="font-bold text-sky-700 dark:text-sky-400 font-sans text-[11px]">2. Aksi Type (Ketik Kata Kunci)</div>
                <code className="text-[10px] text-gray-800 dark:text-zinc-200 block truncate font-mono">input.choices__input--cloned:visible</code>
                <div className="text-[10px] text-gray-500 dark:text-zinc-400 font-sans">Ketik nomor RM / teks cari.</div>
              </div>
              <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-sky-200 dark:border-sky-500/20 space-y-1">
                <div className="font-bold text-sky-700 dark:text-sky-400 font-sans text-[11px]">3. Aksi Click (Pilih Opsi Pertama)</div>
                <code className="text-[10px] text-gray-800 dark:text-zinc-200 block truncate font-mono">.choices__item--selectable</code>
                <div className="text-[10px] text-gray-500 dark:text-zinc-400 font-sans">Pilih hasil pertama tanpa :not.</div>
              </div>
            </div>
            <div className="text-[11px] text-sky-900/90 dark:text-sky-300/90 font-sans pt-1 border-t border-sky-200/60 dark:border-sky-800/60">
              💡 <strong>Tips jika ada &gt; 1 dropdown di 1 halaman:</strong> Berikan awalan <code className="font-mono bg-white dark:bg-zinc-800 px-1 py-0.2 rounded border border-sky-300 dark:border-sky-700">[wire\:key*="nama_field"]</code> agar tidak tertukar satu sama lain.
            </div>
          </div>

          {/* Categories & Patterns List */}
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400 dark:text-zinc-500">
              Tidak ada pola selector yang cocok dengan pencarian Anda.
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.id} className="space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{cat.name}</span>
                    {cat.highlight && (
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Rekomendasi Utama
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">{cat.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cat.filteredItems.map((item, idx) => {
                    const isCopied = copiedPattern === item.pattern;

                    return (
                      <div
                        key={idx}
                        className="bg-gray-50/70 dark:bg-zinc-950/70 border border-gray-200 dark:border-zinc-800 rounded-lg p-3 flex flex-col justify-between space-y-2 hover:border-amber-500/40 transition-colors"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <code className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-white dark:bg-zinc-900 px-2 py-1 rounded border border-gray-200 dark:border-zinc-800 truncate block flex-1">
                              {item.pattern}
                            </code>
                          </div>
                          <p className="text-[11px] text-gray-600 dark:text-zinc-300 leading-snug">
                            {item.description}
                          </p>
                          {item.example && (
                            <div className="mt-1 text-[10px] text-gray-400 dark:text-zinc-500 font-mono truncate">
                              Contoh HTML: <span className="text-gray-500 dark:text-zinc-400">{item.example}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-gray-200/70 dark:border-zinc-800/60">
                          <button
                            type="button"
                            onClick={() => handleCopy(item.pattern)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Salin</span>
                              </>
                            )}
                          </button>

                          {onSelectPattern && (
                            <button
                              type="button"
                              onClick={() => handleUse(item.pattern)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-amber-600 hover:bg-amber-500 text-white shadow-2xs transition-colors"
                            >
                              <span>Gunakan Ini</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="h-12 px-6 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs bg-gray-50/70 dark:bg-zinc-950/70">
          <span className="text-gray-500 dark:text-zinc-400 text-[11px]">
            Playwright otomatis mendukung CSS selector standar, XPath, dan selector berbasis teks.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 font-semibold rounded-lg text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
