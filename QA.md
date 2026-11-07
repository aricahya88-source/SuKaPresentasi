# Catatan Pengujian — Presentasi Syubbanul Wathon

Tanggal penyusunan: 7 November 2026.

## Pengujian otomatis

- `npm test` menguji konsistensi deck, 17 slide, urutan fase NEXORA, dan keberadaan aset CV/Nusantara.
- Tes V2 memeriksa bentuk partikel AI (otak, neuron, jaringan, mikrocip, globe, hati), determinisme, batas koordinat, serta integrasi tema sampai ke CV/Nusantara.
- Pengujian model NEXORA dari proyek aslinya memeriksa 14 grup terpisah, transformasi fondasi/atap/lantai, X-Ray, GLB, geometri, dan kamera.
- `npm run build` mengkompilasi source Vite dan menyalin seluruh aset statis ke `dist/`.
- `unzip -t` dipakai pada ZIP akhir untuk memeriksa CRC dan keterbacaan arsip.

## Kondisi pengujian visual

Peninjauan visual via browser terintegrasi **tidak dapat dilakukan** pada lingkungan ini karena akses browser ke alamat development lokal dibatasi. Uji otomatis dan build bukan pengganti pemeriksaan GPU pada perangkat target. Saat pertama dijalankan, periksa khususnya:

1. Slide 1, 4–8: model 3D NEXORA muncul dan transisi tahap bertambah; drag/orbit dan zoom bekerja.
2. Slide 2: CV terlihat penuh dan keempat tab bisa dibuka; foto atau fallback inisial tampil.
3. Slide 3: timeline menampilkan tahun 2013, 2014–2018, dan 2019–sekarang.
4. Slide 8: kredit pencipta Mars diberikan kepada angkatan kedua dan Ari Cahya Mawardi sebagai pembimbing.
5. Slide 11: judul persis `AI Tidak Akan Menggantikan Santri!`.
6. Slide 16: peta Indonesia dan tanaman tampil dari file lokal.
7. Slide 17: informasi UIN umum, website, QR ke situs admisi.
8. Cetak PDF: output statis tidak memuat iframe kosong dan tautan QR dapat dipindai.
9. Ubah Mode Terang dan Mode Gelap pada slide 2, 4, 9, 11, 16, dan 17: pastikan kartu dan teks tetap terbaca.
10. Lihat slide 9–14 secara berurutan: partikel berubah bentuk dengan transisi halus, tidak menutupi teks.

## Batasan yang disengaja

- NEXORA adalah model konseptual dan membutuhkan WebGL untuk 3D langsung; fallback statis tersedia.
- Slide CV memiliki foto eksternal pada materi asal; fallback inisial tersedia.
- Tidak menyertakan audio Mars karena audio resmi tidak dilampirkan.
- Ukuran bundel JS relatif besar karena Three.js dan model interaktif, tetapi build tetap sukses.
- Belum dilakukan deployment ke GitHub/Vercel dan belum mengubah situs produksi mana pun.
