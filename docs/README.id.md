<h1 align="center">Pinyin Type</h1>

<p align="center">
  <a href="/README.md">English</a> |
  <a href="/docs/README.zh-CN.md">简体中文</a> |
  <a href="/docs/README.zh-TW.md">繁體中文</a> |
  <a href="/docs/README.es.md">Español</a> |
  <a href="/docs/README.pt.md">Português</a> |
  <a href="/docs/README.fr.md">Français</a> |
  <a href="/docs/README.de.md">Deutsch</a> |
  <a href="/docs/README.ru.md">Русский</a> |
  <a href="/docs/README.uk.md">Українська</a> |
  <a href="/docs/README.ja.md">日本語</a> |
  <a href="/docs/README.ko.md">한국어</a> |
  <a href="/docs/README.th.md">ไทย</a> |
  <a href="/docs/README.vi.md">Tiếng Việt</a> |
  <a href="/docs/README.id.md">Bahasa Indonesia</a>
</p>

<p align="center">
  <b>Belajar Mandarin satu ketikan pada satu waktu: ketik pinyin, dengar nadanya, ingat katanya. Alat open source untuk berlatih kata dan teks bahasa Mandarin.</b>
</p>

## Demo online

<https://www.typingchinese.club>

## Fitur

### Latihan kata

- **Empat mode latihan**: mengikuti (lihat hanzi, ketik pinyin), dikte (hanya mendengar), uji diri (pinyin ditampilkan, tulis katanya) dan menulis dari arti (hanya terjemahan yang tampil)
- **Tiga mode pengetikan**: pinyin lengkap `zhongguo`, inisial `zg`, atau nada `zhong1 guo2`
- **Dua cara input**: mengetik huruf Latin di keyboard bahasa Inggris dengan koreksi langsung per huruf, atau mengetik hanzi dengan IME Mandarin (Microsoft Pinyin dan sejenisnya) yang dinilai per kata
- Setiap kata memiliki pinyin bertanda nada, suara Mandarin, dan terjemahan
- Ulangi setiap kata sebanyak yang Anda mau; kata yang salah bisa dikosongkan otomatis lalu diketik ulang

### Latihan teks

- Teks berjenjang bawaan, dari pemula hingga menengah (dari kalimat pendek sampai fabel singkat)
- Tambahkan teks sendiri: tempel teksnya lalu ketik kalimat demi kalimat
- Setiap kalimat diucapkan saat Anda mengetik, sehingga membaca, mendengar, dan menulis saling menguatkan

### Kesalahan, ulasan, statistik

- Setiap kata yang salah otomatis masuk ke buku kesalahan
- Jadwal ulasan diatur oleh **FSRS** (Free Spaced Repetition Scheduler); rasio ulasan harian bisa diatur
- Halaman statistik mencatat target harian, jumlah kata per hari, waktu belajar, akurasi, dan jumlah ketikan

### Sangat bisa disesuaikan

- Efek suara keyboard dan suara ketikan, volume serta kecepatan suara dapat diatur
- Pintasan khusus: tombol ulangi (<kbd>Tab</kbd> / <kbd>F2</kbd>) dan tombol kata berikutnya (<kbd>Spasi</kbd> / <kbd>Enter</kbd>)
- Keyboard virtual di layar, tema terang / gelap / mengikuti sistem
- **14 bahasa antarmuka**: antarmuka mengikuti pilihan Anda, sementara materi belajar selalu bahasa Mandarin

### Bersih dan efisien

- Antarmuka modern tanpa iklan
- Berjalan sepenuhnya di browser: tanpa akun, tanpa backend, tanpa kewajiban mendaftar
- Seluruh progres disimpan lokal di `localStorage`

### Kamus

Bawaan: **Kata Sehari-hari** (59), **Kosakata Lanjutan** (51), **Idiom Empat Karakter** (40).

Bawa kamus sendiri: tempel daftar kata atau unggah `.json` / `.csv` / `.txt`. Satu entri per baris, pinyin dibuat otomatis:

```
中国,国家名称
旅行 lv you
安静=没有声音
```

Lihat `sample-words.csv` untuk contoh yang siap diimpor.

## Menjalankan secara lokal

Proyek ini dibuat dengan Next.js dan membutuhkan Node.js 18 atau lebih baru.

```bash
git clone https://github.com/CodeTrainerMan/typingchinese.git
cd typingchinese/web
npm install
npm run dev
```

Buka <http://localhost:3000>.

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | ESLint |
| `npm run gen:dict` | Membuat ulang `public/dicts/*.json` dari `scripts/seed-words.mjs` |

## Struktur proyek

```
web/                    Aplikasi Next.js (satu-satunya unit yang di-deploy)
  src/app/              Rute: / (beranda) /practice /article /dicts /wrong /stats /setting
  src/i18n/             Paket bahasa (tambah bahasa: paket baru + satu entri di LOCALES)
  src/lib/              Kamus, pinyin, TTS, penjadwalan FSRS, penyimpanan lokal
  public/dicts/         Kamus yang sudah dibuat sebelumnya
  public/articles/      Teks latihan bawaan
  scripts/              Daftar kata sumber dan generator kamus
sample-words.csv        Contoh untuk mengimpor kamus sendiri
```

## Deployment

Akar repositori tidak memiliki `package.json`, jadi saat mengimpor proyek di Vercel (atau platform lain) **Root Directory harus `web`**. Selebihnya mengikuti pengaturan bawaan Next.js.

## Saran dan kontribusi

Proyek ini masih muda dan fitur terus ditambahkan. Ide dan laporan bug diterima lewat `Issues`; jika Anda suka pendekatannya, kirim `PR`.

- Menambah bahasa: buat paket baru di `src/i18n/messages/` lalu daftarkan di `src/i18n/index.tsx`
- Menambah kata: ubah `scripts/seed-words.mjs` lalu jalankan `npm run gen:dict`
