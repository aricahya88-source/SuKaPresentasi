# SUKA Presentasi — Pendidikan Fisika (v2.1)

Website presentasi statis Pendidikan Fisika, Fakultas Ilmu Tarbiyah dan Keguruan, UIN Sunan Kalijaga Yogyakarta. Paket lengkap untuk GitHub dan Vercel. Tidak memerlukan database, akun, API key, atau backend.

## Deploy melalui GitHub → Vercel

1. Ekstrak ZIP. Buka folder `suka-presentasi`.
2. Buat repository GitHub dan upload **isi folder** ke root repository. Pastikan `package.json`, `package-lock.json`, `index.html`, `src/`, `public/`, dan `vercel.json` ada di root. Jangan upload ZIP sebagai isi repository.
3. Di Vercel pilih Add New → Project dan impor repository.
4. Framework: **Vite**. Root Directory: `./` (atau folder `suka-presentasi` jika ada folder pembungkus).
5. Install: `npm ci`. Build: `npm run build`. Output: `dist`. Node.js: **22.x atau 24.x**.
6. Environment Variables: tidak diperlukan. Klik Deploy.
7. Buka domain hasil deploy, uji navigasi, animasi, Full Screen, Cetak PDF, dan pindai QR admisi.

Konfigurasi build tersedia di `vercel.json`. Rute hash memungkinkan refresh slide langsung tanpa rewrite server.

## Menjalankan lokal

Pasang Node.js 22+ lalu buka terminal pada folder proyek:

```bash
npm ci
npm run dev
```

Buka localhost yang ditampilkan. Jangan membuka `index.html` melalui klik dua kali; source memerlukan server modul.

```bash
npm test
npm run build
npm run preview
```

`dist/` berisi hasil build siap dilayani server statis. Library runtime dan foto dibundel lokal; internet diperlukan untuk instalasi dan membuka kanal eksternal. Tidak menggunakan CDN runtime dan tidak memiliki service worker/offline cache otomatis.

## Sepuluh slide dan bentuk partikel

| Slide | Materi | Bentuk |
| --- | --- | --- |
| 1 | Menguasai Fisika, Menginspirasi Generasi | Bola |
| 2 | Kenali rumah belajarmu | Saturnus |
| 3 | Mengapa Pendidikan Fisika? | Galaksi spiral |
| 4 | Gambaran kompetensi belajar | Gelombang |
| 5 | Ciri khas prodi | Heliks ganda |
| 6 | Media dan proyek pembelajaran | Torus |
| 7 | HMPS dan Study Club | Konstelasi |
| 8 | Pengalaman sekolah dan mobilitas internasional | Tata surya |
| 9 | Profil lulusan | Orbit atom |
| 10 | Ajakan bergabung dan admisi | Nebula bintang |

Bentuk adalah ilustrasi artistik, bukan simulasi astronomi/fisika berskala. Setiap perpindahan slide memakai morph posisi partikel selama sekitar 2,2 detik disertai sebaran singkat. Pergantian cepat tetap berawal dari posisi terakhir. Animasi terus berputar perlahan dan merespons mouse. Tidak ada mode autoplay slide.

Three.js memakai WebGL pada perangkat yang mendukung. Jika WebGL tidak tersedia, Canvas 2D memproyeksikan koordinat tiga dimensi yang sama, termasuk bentuk dan morph yang sama. Jadi semua sepuluh bentuk tetap tersedia pada mode cadangan. Jumlah partikel lebih sedikit di HP; loop berhenti saat tab tersembunyi. Tombol Animasi dan preferensi reduced motion menghentikan gerakan, tetapi bentuk statis tetap terlihat.

## Kontrol

- ← / → atau Page Up / Page Down: slide sebelumnya/berikutnya.
- Home / End: slide pertama/terakhir.
- F: Full Screen; Esc: keluar atau tutup dialog.
- G: daftar slide; N: catatan pembicara.
- Tombol Animasi: hentikan/aktifkan gerakan.
- Swipe horizontal pada area kosong materi: berpindah slide di HP.
- Kartu Study Club: buka detail.

Full Screen mengikuti dukungan Fullscreen API browser. Jika tidak didukung/ditolak, tampil penjelasan; presentasi tetap dapat digunakan. Di HP, slide panjang dapat digulir.

## Cetak PDF

Klik **Cetak PDF** di menu atas. Semua 10 slide deck aktif disiapkan, tanpa mengubah URL atau slide aktif. Pada beranda, deck pertama dipilih. Setelah foto dan QR siap, dialog cetak browser dibuka.

Pilih **Simpan sebagai PDF / Save as PDF**, A4 mendatar (Landscape), skala 100% atau Default. Matikan header/footer browser dan aktifkan Background graphics agar warna tercetak. Satu slide dirancang per halaman. Detail kartu Study Club ikut dicetak; kontrol dan animasi partikel disembunyikan. PDF merupakan halaman statis. Tidak ada upload dokumen ke layanan pihak ketiga.

## Mengubah atau menambah materi

- `src/content.js`: `links`, `fields`, dan `decks`.
- `decks` adalah array presentasi. Tambah objek dengan `id` unik huruf kecil/angka/tanda hubung, `label`, `category`, `title`, `subtitle`, `description`, dan `slides`.
- Slide berisi `title`, `eyebrow`, `intro`, `layout`, `shape` (0–9), `notes`, `source` (kunci pada links), dan opsional `items`/`dark`.
- Layout: hero, campus, applications, profile, journey, admission, fields, experience, closing.
- `fields` dipakai oleh layout fields, saat ini berisi empat Study Club. Untuk deck baru dengan kartu berbeda, perlu memisahkan data kartu per deck di renderer.
- `src/shapes.js`: nama dan geometri partikel; ubah bentuk di sini.
- `src/particles.js`: renderer, morph, pengaturan performa.
- `src/main.js`: antarmuka, navigasi, dialog, PDF.
- `src/style.css`: warna, responsivitas, dan tata letak cetak.
- `public/assets/campus.jpg`: foto ilustrasi kegiatan akademik dari situs universitas. Bukan klaim foto khusus Pendidikan Fisika.

Tautan utama: `#/presentasi/pendidikan-fisika/1`. Rute lama `#/presentasi/fisika/1` tetap membuka materi Pendidikan Fisika sebagai kompatibilitas. QR otomatis mengikuti `links.admission`.

Setelah perubahan: jalankan tes/build, lalu push ke GitHub. Proyek Vercel yang terhubung akan membangun ulang. Seluruh konten website statis bersifat publik; jangan menyimpan rahasia dalam source.

## Isi paket

Source, package-lock, konfigurasi Vercel, hasil build, tes, sumber materi, dan catatan QA. Tidak menyertakan node_modules karena dapat dibuat ulang dengan npm ci. ZIP standar tanpa enkripsi/ZIP64, diuji CRC dan ekstraksi ulang.


## Revisi latar 2.1

Partikel kini menjadi latar seluruh slide tanpa nama bentuk atau area pajangan khusus. Bentuk tetap berubah mengikuti slide. Latar diperbesar dan digeser ke kanan, memakai transparansi rendah dan mask gradasi untuk melindungi area teks. Rotasi diperlambat dan morph menjadi sekitar 2,2 detik. Di HP latar lebih samar. Saat gerakan dihentikan, bentuk statis tetap tampil sebagai latar. Full Screen dan Cetak PDF tetap tersedia; partikel tidak ikut dicetak.


## Revisi 2.2 — Visibilitas partikel

Kontras dan ukuran titik dinaikkan setelah versi sebelumnya terlalu samar. Opacity lapisan desktop: gelap 68%, terang 55%, beranda 50%, masih dikalikan alpha tiap titik dan mask pelindung teks. HP: gelap 55%, terang/beranda 45%. Nama bentuk tetap tersembunyi. Jika memasang ulang di Vercel, unggah seluruh source lalu lakukan deployment baru; gunakan refresh paksa untuk memastikan versi baru dimuat.
