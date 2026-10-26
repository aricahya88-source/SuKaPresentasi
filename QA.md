# QA — Pendidikan Fisika v2.0

26 Oktober 2026.

## Pemeriksaan lulus

- Build produksi Vite berhasil; source dan hasil dist ikut diarsipkan.
- Tiga tes otomatis: integritas 10 slide Pendidikan Fisika dan tautan sumber; 10 geometri berbeda yang deterministik/finite; endpoint morph dan interupsi pergantian bentuk.
- Seluruh slide memakai shape unik 0–9. Semua label bentuk dan sumber tampil sesuai deck Pendidikan Fisika.
- Browser desktop: slide 1–10 terbuka, tidak ada luapan horizontal pada viewport pengujian.
- Bentuk bola dan Saturnus terlihat melalui renderer cadangan Canvas. Mode cadangan memakai geometri dan fungsi morph yang sama dengan WebGL.
- Tombol berikutnya memindahkan slide 1 ke 2 dan memperbarui pola serta label.
- Cetak PDF: 10 halaman materi disiapkan, seluruh judul benar, empat detail Study Club ikut, foto dan QR sudah selesai dimuat (naturalWidth 2560 dan 260).
- Tautan prodi dan sumber telah diarahkan ke pfis.uin-suka.ac.id. Tidak ada materi riset Geofisika/Fisika Material maupun berita alumni prodi Fisika lama yang tersisa pada antarmuka.
- npm audit saat rilis: 0 vulnerabilities.
- ZIP standar disimpan tanpa kompresi/enkripsi/ZIP64, diuji CRC dan ekstraksi. Salinan setelah penyimpanan juga diverifikasi identik lewat SHA-256.

## Batas verifikasi

Browser pengujian menonaktifkan WebGL. Visual GPU Three.js belum dapat diuji secara langsung; jalur fallback Canvas telah diuji dan memakai koordinat 3D yang sama. Fullscreen API dibatasi lingkungan pengujian; perilaku masuk layar penuh sebenarnya perlu diperiksa pada browser pengguna di domain Vercel. Tata letak responsif disediakan; belum diuji pada perangkat fisik Android/iPhone. Hasil PDF final tergantung pengaturan cetak browser; di pengujian, 10 halaman materi siap cetak dan gambar/QR telah diverifikasi, bukan keluaran printer fisik.

Three.js diimpor dinamis, chunk sekitar 705 kB (181 kB gzip). Peringatan ukuran bundel bukan kegagalan build. Konten inti dapat tampil sebelum modul GPU selesai dimuat.

Belum diunggah ke GitHub atau Vercel pengguna. Paket disiapkan untuk deploy mandiri sesuai permintaan.

## Cek singkat setelah deploy

Buka presentasi → berpindah kesepuluh slide → periksa bentuk partikel/morph → coba Full Screen dan Esc → buka daftar slide/Study Club → Cetak PDF → pilih A4 Landscape, Background graphics aktif, header/footer nonaktif → pindai QR admisi.

## Revisi 2.1 — Partikel latar

Panggung/label nama bentuk dihapus dari DOM. Partikel kini memenuhi latar dengan bias ke kanan, transparansi 24% pada slide gelap dan 18% pada slide terang; HP lebih samar. Mask gradasi mengurangi partikel di area teks. Rotasi diperlambat dan morph menjadi 2,2 detik. Pemeriksaan browser pada slide pembuka menunjukkan label berjumlah nol, mask aktif, opacity 0,24, dan tidak ada luapan horizontal. Nama bentuk tetap tersedia hanya sebagai konfigurasi internal, tidak ditampilkan di slide. Tes geometri/morph tetap lulus; build berhasil. Full Screen dan jalur Cetak PDF tidak diubah.

## Revisi 2.2

Ukuran dan kontras titik ditingkatkan setelah partikel versi 2.1 terlalu samar. Pemeriksaan screenshot slide pembuka menunjukkan bentuk bola terlihat jelas sebagai latar kanan, tanpa label; teks tetap terbaca. Tes dan build lulus.
