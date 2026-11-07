# Nusantara Bertumbuh

Website animasi sinematik yang menampilkan **peta geografis nyata Indonesia**, penyemaian benih yang bergerak dari barat ke timur, perkecambahan, dan pertumbuhan bibit di berbagai pulau. Cocok untuk layar presentasi, pembuka/penutup acara, dan materi pendidikan.

## Menjalankan

**Tanpa instalasi:** buka `index.html` langsung di Chrome, Edge, Firefox, atau Safari modern. Seluruh aset animasi dan bentuk peta tersimpan lokal.

**Dengan server lokal (opsional):**

```bash
python3 -m http.server 3000
```

Lalu buka `http://localhost:3000` dari folder proyek ini.

## Deploy ke Vercel

1. Ekstrak ZIP, kemudian unggah seluruh isi folder `indonesia-growth` ke repositori GitHub.
2. Import repositori ke Vercel.
3. Pilih **Framework Preset: Other**. **Build Command** dan **Output Directory** dibiarkan kosong karena proyek adalah website statis.
4. Deploy. Tidak ada database, backend, atau variabel rahasia yang diperlukan.

## Mode dan kontrol

- **Putar / Jeda**, **Ulangi**, atau geser *timeline*.
- Klik empat babak untuk lompat ke bagian animasi.
- Klik **Mode Presentasi** untuk membuka layar penuh.
- **Spasi**: putar/jeda; **R**: ulangi; **panah kiri/kanan**: geser waktu.
- Masukkan `?embed=1` di akhir URL untuk tampil **tanpa header dan kontrol**. Cocok sebagai animasi penutup slide, misalnya dalam `iframe`.
- `?embed=1&loop=1` agar terus berulang. `?autoplay=0` jika ingin mulai manual melalui API.

Contoh penyematan:

```html
<iframe src="https://domain-anda.vercel.app/?embed=1&loop=1"
  title="Peta Indonesia Bertumbuh" allow="fullscreen"
  style="width:100%;height:100vh;border:0"></iframe>
```

API untuk pengendali presentasi: `window.NusantaraAnimation.play()`, `.pause()`, `.restart()`, `.seek(0.5)`, `.getProgress()`.

## Teknologi

- HTML, CSS, JavaScript murni — **tanpa WebGL, tanpa dependensi CDN, tanpa framework**.
- Peta Indonesia diambil dari **Natural Earth Admin-0 1:50m (public domain)**, dengan geometri MultiPolygon. Sumber data diletakkan dalam `data/indonesia.geojson`, dan salinan JavaScript lokal dalam `data/indonesia-data.js` untuk mendukung pembukaan file secara langsung.
- SVG untuk bentuk kepulauan, siluet, penyapuan peta, dan pembaruan warna wilayah.
- Canvas 2D untuk benih jatuh, kilau, perkecambahan, tunas, daun, dan titik tumbuh.
- Penempatan bibit dihitung di dalam batas poligon pulau, termasuk sampel minimal pada pulau-pulau kecil. Titik-titik tersebut adalah **representasi artistik**, bukan titik pertanian nyata.
- Mendukung layar sentuh, layar presentasi, navigasi keyboard, dan preferensi pengurangan gerak sistem.

## Catatan sumber dan interpretasi

Data geografis: [Natural Earth](https://www.naturalearthdata.com/) via berkas negara Indonesia skala 1:50m yang didistribusikan oleh [geojson-regions](https://github.com/AshKyd/geojson-regions). Natural Earth adalah data peta domain publik. Pada skala ini, detail batas dan pulau sangat kecil disederhanakan. Tampilan bukan pengganti peta batas administrasi atau kartografi hukum resmi.

Proses penyemaian, jumlah titik tumbuh, dan pertumbuhan **merupakan visualisasi konseptual**. Angka pada animasi bukan statistik pertanian, data penanaman, atau klaim capaian program pemerintahan.

## Penyesuaian cepat

| Ingin mengubah | Berkas / parameter |
| --- | --- |
| Judul, narasi, teks | `index.html`, array `content` di `app.js` |
| Durasi animasi | `DURATION = 24` di `app.js` |
| Jumlah bibit | Nilai `area / 290` di `samplePlants()` pada `app.js` |
| Warna & tampilan | `styles.css`, SVG gradients dalam `index.html` |
| Posisi label pulau | Array `labels` di `setupLabels()` pada `app.js` |

© 2026 — Demo visual Nusantara Bertumbuh.
