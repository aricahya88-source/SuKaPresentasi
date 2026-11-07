# Dari Syubbanul Wathon untuk Indonesia — Presentasi Interaktif

Website presentasi 17 slide untuk Expo Campus / Guest Teacher oleh **Ari Cahya Mawardi**, mengintegrasikan empat proyek yang diberikan:

1. **SuKaPresentasi** sebagai kerangka rute, tombol, catatan pembicara, PDF, dan deck Pendidikan Fisika opsional.
2. **NEXORA 3D V1.0** sebagai model bangunan Three.js asli dengan 14 kelompok komponen dan fase animasi nyata.
3. **Curriculum Vitae Ari Cahya Mawardi v2** sebagai satu slide HTML interaktif dengan empat tab.
4. **Nusantara Bertumbuh** sebagai animasi peta geografis Indonesia, penyemaian, dan pertumbuhan tanaman.

Website **tidak memerlukan database, API key, autentikasi, atau backend**. Aset animasi disimpan lokal. Tautan penerimaan mahasiswa menuju website resmi UIN Sunan Kalijaga.

## Memulai di komputer

Prasyarat: **Node.js 22+** dan browser modern dengan WebGL. Ekstrak ZIP hingga terlihat `package.json`.

```bash
npm ci
npm run dev
```

Buka URL lokal yang muncul, lalu pilih kartu **Syubbanul Wathon**. Untuk langsung membuka slide pembuka gunakan:

`http://localhost:5173/#/presentasi/syubbanul-wathon/1`

Jika port bukan 5173, sesuaikan dengan alamat terminal. Jalankan pengujian dan produksi dengan:

```bash
npm test
npm run build
npm run preview
```

`dist/` adalah hasil build untuk web statis. Semua animasi lokal disalin oleh Vite ke `dist/`.

## Mengunggah ke GitHub dan deploy ke Vercel

1. Upload **seluruh isi folder proyek** ke root repository GitHub; jangan hanya upload ZIP atau folder `dist`.
2. Import repo ke Vercel. Framework preset: **Vite**.
3. Install Command `npm ci`, Build Command `npm run build`, Output Directory `dist`.
4. Gunakan Node.js 22+ (direkomendasikan 22.x atau 24.x). Tidak ada environment variable wajib.
5. Deploy, lalu uji slide NEXORA di browser target, foto CV, animasi penutup, dan QR admisi.

Rute menggunakan hash (`#/presentasi/...`), sehingga bisa dibuka ulang langsung tanpa konfigurasi rewrite.

## Isi 17 slide

| No. | Judul | Visual utama |
| --- | --- | --- |
| 1 | Dari Syubbanul Wathon untuk Indonesia | NEXORA utuh untuk pembuka |
| 2 | Curriculum Vitae — Ari Cahya Mawardi | CV satu slide, empat tab |
| 3 | Pengalaman hidup dan mengabdi | Timeline 2013, 2014–2018, 2019–sekarang |
| 4 | Good Character adalah pondasi | Fondasi NEXORA, Legacy I |
| 5 | Dari pondasi menjadi watak | Kolom dan balok NEXORA |
| 6 | Ilmu, adab, dan kompetensi | Lantai dua dan tangga NEXORA |
| 7 | Ilmu membuka pintu. Karakter membuat dipercaya | Kaca, fasad, dan atap NEXORA |
| 8 | Mars yang menjadi arah perjalanan | Bangunan utuh dan taman, Legacy II |
| 9 | Generasi Z di tengah revolusi AI | Tantangan abad ke-21 |
| 10 | Ketika AI semakin cerdas | Kemampuan dan batas AI |
| 11 | AI Tidak Akan Menggantikan Santri! | Manifesto empat nilai santri |
| 12 | Pekerjaan Generasi Z: dunia digital | Enam contoh profesi digital |
| 13 | Pekerjaan Generasi Z: dunia nyata | Enam contoh profesi lintas sektor |
| 14 | Bekerja adalah jalan pengabdian | Mendidik, mencipta, melayani, memimpin |
| 15 | Pilih benihmu. Bentuk masa depanmu | Tunas sebagai potensi diri |
| 16 | Benih Syubbanul Wathon untuk Indonesia | Peta Indonesia & benih bertumbuh |
| 17 | Melangkah lebih jauh bersama UIN Sunan Kalijaga | Promosi kampus umum & QR PMB |

Good Character dibentuk pada tahun kedua masa pengabdian narasumber dalam konteks kesiswaan. Mars SMA Syubbanul Wathon adalah karya **siswa angkatan kedua**, dengan narasumber berperan sebagai **pembimbing**. Bangunan NEXORA adalah **metafora konseptual**, bukan gambar gedung SMA yang sesungguhnya.

## Mengoperasikan presentasi

- Panah kanan/kiri atau Page Down/Page Up: maju/mundur satu slide.
- Home/End: slide pertama/terakhir.
- F: layar penuh; G: daftar slide; N: catatan pembicara.
- Tombol **Animasi**: mengaktifkan/menonaktifkan animasi presentasi.
- Pada slide NEXORA: seret model untuk memutar kamera; scroll di atas model untuk zoom.
- Pada CV: pilih tab Profil, Pengalaman, Pengajaran, Publikasi; dapat diputar otomatis dalam satu slide.
- Pada slide 16: animasi peta menyemai benih otomatis saat slide dibuka.
- **Cetak PDF**: semua slide deck aktif disusun untuk dialog print browser; gunakan Landscape dan aktifkan grafik latar. PDF adalah representasi statis, bukan video animasi.

Di browser yang tidak mendukung WebGL, NEXORA menampilkan ilustrasi cadangan dengan teks tetap terbaca. Untuk efek 3D asli, gunakan Chrome, Edge, atau browser modern dengan akselerasi grafis. Jika pengguna mengaktifkan preferensi sistem untuk mengurangi gerak, animasi tertentu dihentikan.

## Struktur yang penting

| Lokasi | Fungsi |
| --- | --- |
| `src/syubbanul-deck.js` | Semua isi, urutan, dan catatan 17 slide |
| `src/nexora/building.js` | Model geometri bangunan NEXORA asli |
| `src/nexora/scene.js` | Kamera, WebGL, animasi perakitan, dan orbit |
| `src/nexora/presenter.js` | Sinkronisasi model dengan slide |
| `src/main.js` | Layout, navigasi, catatan, PDF, dan QR |
| `src/style.css` | Desain sinematik dan responsif |
| `public/cv/` | Slide CV independen |
| `public/nusantara/` | Animasi Nusantara Bertumbuh independen |
| `public/models/` | Salinan model `.glb` NEXORA untuk pemakaian lanjutan |
| `public/assets/campus.jpg` | Foto ilustrasi akademik untuk Sospro |

Rute **Pendidikan Fisika** lama tetap tersedia pada `#/presentasi/pendidikan-fisika/1`; Sospro pada slide 17 sendiri fokus pada **UIN Sunan Kalijaga secara umum**.

## Catatan sumber dan batasan

- Posisi kedua nasional THE WUR 2027 mengikuti pengumuman resmi UIN Sunan Kalijaga; situs THE mencantumkan UIN Sunan Kalijaga pada kelompok 801–1.000 dunia. Klaim dibatasi pada sistem/tahun tersebut.
- Slide pekerjaan merupakan contoh eksplorasi masa depan, bukan jaminan keamanan atau ketersediaan pekerjaan. Rujukan umum: WEF *Future of Jobs Report 2025* dan kajian ILO tentang transformasi pekerjaan oleh AI.
- Foto CV memakai URL gambar dari materi CV awal; bila gambar eksternal tidak dapat dimuat, tersedia placeholder inisial ACM. Agar 100% offline, ganti URL itu dengan aset foto yang disimpan sendiri di `public/cv/`.
- File audio/lirik resmi Mars tidak disertakan; presentasi menyampaikan kisah warisannya tanpa memutar rekaman atau mengarang lirik.
- Visual Nusantara adalah karya animasi konseptual, bukan data titik tanam nyata.
- QR menggunakan tujuan `https://admisi.uin-suka.ac.id/`; syarat, jadwal, dan jalur masuk mengikuti situs resmi terbaru.
- PPT rekap PMB 2026 yang diberikan berisi 54 **pendaftaran** gabungan empat jalur untuk SMA Syubbanul Wathon, tidak bisa diperlakukan sebagai 54 peserta unik/mahasiswa diterima; data ini disimpan sebagai catatan pembicara Sospro, bukan angka utama promosi.

## Status paket

Source, aset statis, model NEXORA, file proyek independen, `package-lock.json`, tes, dan `dist/` disertakan; `node_modules/` tidak disertakan. Build serta tes otomatis bisa dijalankan sebelum upload. Verifikasi visual WebGL pada browser pengguna tetap direkomendasikan setelah deploy.
