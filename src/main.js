import "./style.css";
import Jt from "qrcode";
import {
  links as K,
  fields as kt,
  decks as bt,
  parseRoute as zt,
} from "./content.js";
import { createParticles as xt } from "./particles.js";
const se = document.querySelector("#app"),
  Wt = document.querySelector("#status"),
  R = (e) =>
    String(e).replace(
      /[&<>"']/g,
      (n) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[n],
    );
let B = null,
  j = null,
  q = !matchMedia("(prefers-reduced-motion: reduce)").matches;
try {
  const e = localStorage.getItem("suka-motion");
  e !== null && (q = e === "on");
} catch {}
let ne = null;
const O = (e, n, r = "text-link") =>
    `<a class="${r}" href="${R(e)}" target="_blank" rel="noopener noreferrer">${R(n)} <span aria-hidden="true">↗</span></a>`,
  Qt = '<span class="brand-mark" aria-hidden="true">✳</span>';
function yt(e) {
  return `<header class="header"><a class="brand" href="#/">${Qt}<span><strong>${e ? R(B.deck.label || B.deck.title) : "SUKA Presentasi"}</strong><small>UIN Sunan Kalijaga</small></span></a><nav aria-label="Menu utama">${e ? '<a class="all-link" href="#/">Semua materi</a>' : '<span class="nav-label">RUANG GAGASAN & INSPIRASI</span>'}<button data-action="motion" aria-pressed="${q}" title="Aktifkan atau hentikan partikel">${q ? "◉" : "○"} <span>Animasi ${q ? "aktif" : "nonaktif"}</span></button><button data-action="print" class="print-button" title="Cetak semua slide / simpan sebagai PDF">▤ <span>Cetak PDF</span></button><button data-action="fullscreen" class="full" title="Layar penuh (F)" aria-label="Aktifkan layar penuh">⛶ <span>Full Screen</span></button></nav></header>`;
}
function Xt() {
  ((document.body.className = "home" + (q ? "" : " still")),
    (se.innerHTML =
      yt(!1) +
      `<main id="main" class="home-main" tabindex="-1"><div class="eyebrow">SOSIALISASI & PROMOSI</div><div class="home-top"><div><h1>Satu ruang.<br><em>Banyak inspirasi.</em></h1><p class="lead">Kenali kampus, jelajahi peluang,<br>dan mulai perjalanan masa depanmu.</p></div><div class="orbit-caption"><span>ILMU</span><span>INTEGRASI</span><span>KEBERMANFAATAN</span></div></div><section aria-label="Pilihan materi" class="deck-grid">${bt.map((e) => `<a class="deck-card" href="#/presentasi/${e.id}/1"><div class="card-orbit" aria-hidden="true">✳</div><div class="badge">${e.slides.length} slide • Interaktif</div><div><h2>${R(e.title)}</h2><p>${R(e.subtitle)}</p><p class="deck-description">${R(e.description)}</p><span class="button gold">Buka presentasi <b>↗</b></span></div></a>`).join("")}<article class="coming"><span class="coming-icon">＋</span><h2>Ruang untuk<br>cerita berikutnya.</h2><p>Materi sosialisasi lainnya akan hadir di sini.</p><span class="badge">Segera hadir</span></article></section><footer class="home-footer"><span>SAINS YANG MENGINSPIRASI. NILAI YANG MENGARAHKAN.</span>${O(K.university, "Website kampus")}</footer></main><dialog id="dialog" aria-labelledby="dialog-title"></dialog>`),
    j == null || j.setMode(0));
}
function le(e) {
  return `<div class="info-grid">${e.map((n, r) => `<article class="info-card"><span class="card-number">0${r + 1}</span><h2>${R(n[0])}</h2><p>${R(n[1])}</p></article>`).join("")}</div>`;
}
function Zt(e) {
  switch (e.layout) {
    case "hero":
      return `<div class="hero-copy"><p class="lead">${R(e.intro)}</p><button class="button gold" data-action="next">Mulai eksplorasi <span>→</span></button><div class="hero-meta"><span>${R(B.deck.category || B.deck.subtitle)}</span><span>YOGYAKARTA</span></div></div><div class="science-visual" aria-hidden="true"><span class="orbit o1"></span><span class="orbit o2"></span><span class="orbit o3"></span><span class="nucleus"></span><span class="visual-label">RASA INGIN TAHU<br>ADALAH AWAL PENEMUAN.</span></div>`;
    case "campus":
      return `<div class="campus-layout"><div>${le(e.items)}</div><figure class="campus-photo"><img src="/assets/campus.jpg" alt="Kegiatan akademik pada situs resmi UIN Sunan Kalijaga" loading="lazy"><figcaption>UIN Sunan Kalijaga • Yogyakarta</figcaption></figure></div>`;
    case "applications":
      return `<div class="application-grid">${e.items.map((n) => `<article><span class="huge-number">${n[0]}</span><h2>${R(n[1])}</h2><p>${R(n[2])}</p></article>`).join("")}</div><p class="micro">Memahami sains sekaligus mengembangkan cara mengajarkannya.</p>`;
    case "profile":
      return `${le(e.items)}<div class="statement">Berpikir kritis. Bekerja teliti. <em>Memberi manfaat.</em></div>`;
    case "journey":
    case "admission":
      return `<div class="journey">${e.items.map((n) => `<article><span class="step">${n[0]}</span><h2>${R(n[1])}</h2><p>${R(n[2])}</p></article>`).join("")}</div>${e.layout === "admission" ? `<div class="action-row">${O(K.admission, "Jadwal, biaya & informasi beasiswa", "button green")}${O(K.requirements, "Jalur & persyaratan")}</div>` : '<p class="micro">Ilustrasi alur belajar, bukan pembagian semester. Rincian mata kuliah mengikuti kurikulum resmi.</p>'}`;
    case "fields":
      return `<div class="field-grid">${kt.map((n, r) => `<button class="field-card field-${r}" data-field="${r}" aria-label="Jelajahi ${R(n.title)}"><span class="field-symbol" aria-hidden="true">${n.symbol}</span><span class="field-tag">${R(n.tag)}</span><strong>${R(n.title)}</strong><span class="field-caption">${R(n.text)}</span><span class="field-arrow" aria-hidden="true">↗</span></button>`).join("")}</div><p class="micro">Klik kartu untuk menjelajahi contoh penerapannya.</p>`;
    case "experience":
      return `<div class="experience-grid">${e.items.map((n, r) => `<article><div class="lab-glyph" aria-hidden="true">${r ? "◈" : "⌁"}</div><h2>${R(n[0])}</h2><p>${R(n[1])}</p></article>`).join("")}</div>`;
    case "closing":
      return `<div class="closing-grid"><div><p class="lead">${R(e.intro)}</p><div class="action-row">${O(K.admission, "Info penerimaan", "button gold")}${O(K.physics, "Website prodi", "button outline")}${O(K.faq, "Tanya admisi", "button outline")}</div><p class="micro">Informasi jalur, biaya, dan jadwal mengikuti kanal resmi.</p></div><a class="qr-card" href="${K.admission}" target="_blank" rel="noopener noreferrer"><img id="qr" alt="QR menuju situs resmi admisi UIN Sunan Kalijaga" width="220" height="220"><strong>Pindai. Jelajahi. Mulai.</strong><small>admisi.uin-suka.ac.id</small></a></div>`;
    default:
      return le(e.items || []);
  }
}
function en() {
  const { deck: e, index: n } = B,
    r = e.slides[n];
  ((document.body.className = `presenting ${r.dark ? "dark" : "light"}${q ? "" : " still"}`),
    (document.title = `${n + 1}. ${r.title} — SUKA Presentasi`),
    (se.innerHTML =
      yt(!0) +
      `<main id="main" class="slide slide-${r.layout}" tabindex="-1"><div class="slide-heading"><div class="eyebrow"><span>${String(n + 1).padStart(2, "0")} / ${e.slides.length}</span> ${R(r.eyebrow)}</div><h1>${R(r.title)}</h1>${r.layout !== "hero" && r.layout !== "closing" ? `<p class="intro">${R(r.intro)}</p>` : ""}</div>${Zt(r)}<div class="source-row">${r.source ? O(K[r.source], "Sumber resmi") : `<span>Contoh edukatif • ${R(e.label || e.title)}</span>`}</div></main><footer class="controls"><button data-action="overview" title="Daftar slide (G)">▦ <span>Daftar slide</span></button><div class="progress" role="progressbar" aria-label="Kemajuan presentasi" aria-valuenow="${n + 1}" aria-valuemin="1" aria-valuemax="${e.slides.length}"><span style="width:${((n + 1) / e.slides.length) * 100}%"></span></div><span class="counter">${String(n + 1).padStart(2, "0")} / ${e.slides.length}</span><button data-action="notes" title="Catatan pembicara (N)" aria-label="Catatan pembicara">☷</button><button data-action="prev" aria-label="Slide sebelumnya" ${n === 0 ? "disabled" : ""}>←</button><button data-action="next" aria-label="Slide berikutnya" ${n === e.slides.length - 1 ? "disabled" : ""}>→</button></footer><dialog id="dialog" aria-labelledby="dialog-title"></dialog>`),
    j == null || j.setMode(r.shape || 0),
    (Wt.textContent = `Slide ${n + 1} dari ${e.slides.length}. ${r.title}`),
    r.layout === "closing" &&
      Jt.toDataURL(K.admission, {
        width: 260,
        margin: 2,
        color: { dark: "#173e32", light: "#ffffff" },
        errorCorrectionLevel: "M",
      })
        .then((a) => {
          const t = document.querySelector("#qr");
          t && (t.src = a);
        })
        .catch(() => {
          const a = document.querySelector("#qr");
          a && (a.alt = "Buka tautan admisi di bawah ini");
        }));
}
function $e() {
  const e = B;
  ((B = zt(location.hash)),
    B ? en() : ((document.title = "SUKA Presentasi — Ruang inspirasi"), Xt()),
    wt(),
    e && B && document.querySelector("#main").focus({ preventScroll: !0 }));
}
function ie(e) {
  B &&
    (location.hash = `/presentasi/${B.deck.id}/${Math.max(1, Math.min(B.deck.slides.length, e + 1))}`);
}
function re(e, n) {
  ne = document.activeElement;
  const r = document.querySelector("#dialog");
  ((r.innerHTML = `<div class="dialog-top"><h2 id="dialog-title">${R(e)}</h2><button data-action="close" aria-label="Tutup dialog">✕</button></div>${n}`),
    r.showModal(),
    r.addEventListener("click", (a) => {
      a.target === r && r.close();
    }),
    r.addEventListener(
      "close",
      () => (ne == null ? void 0 : ne.isConnected) && ne.focus(),
      { once: !0 },
    ));
}
async function tn() {
  try {
    document.fullscreenElement
      ? await document.exitFullscreen()
      : document.documentElement.requestFullscreen
        ? await document.documentElement.requestFullscreen()
        : re(
            "Layar penuh",
            "<p>Browser ini belum mendukung Full Screen melalui tombol. Gunakan mode layar penuh browser atau tambahkan website ke layar utama.</p>",
          );
  } catch {
    re(
      "Layar penuh belum tersedia",
      "<p>Coba buka website langsung di tab browser, lalu tekan tombol Full Screen kembali.</p>",
    );
  }
}
function wt() {
  const e = document.querySelector('[data-action="fullscreen"]');
  if (e) {
    const n = !!document.fullscreenElement;
    (e.setAttribute(
      "aria-label",
      n ? "Keluar layar penuh" : "Aktifkan layar penuh",
    ),
      (e.innerHTML = `${n ? "⊡" : "⛶"} <span>${n ? "Keluar" : "Full Screen"}</span>`));
  }
}
function W(e) {
  switch (e) {
    case "print":
      printDeck();
      break;
    case "next":
      B && ie(B.index + 1);
      break;
    case "prev":
      B && ie(B.index - 1);
      break;
    case "fullscreen":
      tn();
      break;
    case "motion":
      q = !q;
      try {
        localStorage.setItem("suka-motion", q ? "on" : "off");
      } catch {}
      (j == null || j.setEnabled(q), $e());
      break;
    case "close":
      document.querySelector("#dialog").close();
      break;
    case "overview":
      B &&
        re(
          "Jelajahi materi",
          `<div class="overview">${B.deck.slides.map((n, r) => `<button data-slide="${r}" ${r === B.index ? 'aria-current="step"' : ""}><span>${String(r + 1).padStart(2, "0")}</span>${R(n.title)}</button>`).join("")}</div>`,
        );
      break;
    case "notes":
      B &&
        re(
          "Catatan pembicara",
          `<p>${R(B.deck.slides[B.index].notes)}</p><div class="shortcuts"><kbd>← →</kbd> Pindah slide <kbd>F</kbd> Full Screen <kbd>G</kbd> Daftar <kbd>N</kbd> Catatan <kbd>Esc</kbd> Tutup / keluar layar penuh</div>`,
        );
      break;
  }
}
se.addEventListener("click", (e) => {
  const n = e.target.closest("[data-action]");
  if (n) {
    W(n.dataset.action);
    return;
  }
  const r = e.target.closest("[data-field]");
  if (r) {
    const t = kt[Number(r.dataset.field)];
    (j == null || j.setMode(t.shape),
      re(
        t.title,
        `<p class="eyebrow">${R(t.tag)}</p><p>${R(t.detail)}</p>${O(K.physics, "Informasi resmi prodi")}`,
      ));
  }
  const a = e.target.closest("[data-slide]");
  a && (document.querySelector("#dialog").close(), ie(Number(a.dataset.slide)));
});
addEventListener("keydown", (e) => {
  var r;
  if (
    e.ctrlKey ||
    e.altKey ||
    e.metaKey ||
    /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) ||
    e.target.isContentEditable ||
    ((r = document.querySelector("#dialog")) != null && r.open)
  )
    return;
  const n = e.key.toLowerCase();
  ["arrowright", "pagedown", "arrowleft", "pageup", "home", "end"].includes(
    n,
  ) && B
    ? (e.preventDefault(),
      n === "home"
        ? ie(0)
        : n === "end"
          ? ie(B.deck.slides.length - 1)
          : W(n === "arrowright" || n === "pagedown" ? "next" : "prev"))
    : n === " " && B && e.target === document.body
      ? (e.preventDefault(), W("next"))
      : n === "f"
        ? (e.preventDefault(), W("fullscreen"))
        : n === "g" && B
          ? W("overview")
          : n === "n" && B && W("notes");
});
let ae = null;
se.addEventListener(
  "touchstart",
  (e) => {
    e.target.closest("button,a,dialog") ||
      (ae = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY });
  },
  { passive: !0 },
);
se.addEventListener(
  "touchend",
  (e) => {
    if (!ae || !B) return;
    const n = e.changedTouches[0].clientX - ae.x,
      r = e.changedTouches[0].clientY - ae.y;
    (Math.abs(n) > 85 && Math.abs(r) < 45 && W(n < 0 ? "next" : "prev"),
      (ae = null));
  },
  { passive: !0 },
);
addEventListener("hashchange", $e);
document.addEventListener("fullscreenchange", wt);
$e();
xt(document.querySelector("#particles")).then((e) => {
  ((j = e),
    e.setEnabled(q),
    e.setMode((B == null ? void 0 : B.deck.slides[B.index].shape) || 0));
});
document.querySelector(".skip").addEventListener("click", (e) => {
  (e.preventDefault(), document.querySelector("#main").focus());
});

// Cetak seluruh materi, tanpa mengubah slide aktif atau URL.
let printing = false;
async function printDeck() {
  if (printing) return;
  printing = true;
  const printButton = document.querySelector('[data-action="print"]');
  if (printButton) printButton.disabled = true;
  const originalRoute = B;
  const originalTitle = document.title;
  const deck = B?.deck || bt[0];
  const openDialog = document.querySelector("dialog[open]");
  openDialog?.close();
  document.querySelector("#print-deck")?.remove();
  const root = document.createElement("div");
  root.id = "print-deck";
  root.setAttribute("aria-hidden", "true");
  try {
    // Zt menggunakan konteks deck saat membentuk label pembuka.
    B = { deck, index: 0 };
    root.innerHTML = deck.slides
      .map(
        (slide, index) => `
      <section class="print-slide ${slide.dark ? "dark" : "light"}">
        <div class="eyebrow">UIN SUNAN KALIJAGA · ${R(deck.label || deck.title)} · ${index + 1}/${deck.slides.length}</div>
        <h1>${R(slide.title)}</h1>
        ${slide.layout !== "hero" && slide.layout !== "closing" ? `<p class="intro">${R(slide.intro)}</p>` : ""}
        ${Zt(slide)}
        <div class="print-footer">${slide.source ? O(K[slide.source], "Sumber resmi") : "Materi sosialisasi"} · ${index + 1} / ${deck.slides.length}</div>
      </section>`,
      )
      .join("");
    B = originalRoute;
    // Elemen interaktif diubah menjadi konten cetak, tetap menyertakan detail bidang.
    root.querySelectorAll("[data-action]").forEach((el) => el.remove());
    root.querySelectorAll(".science-visual").forEach((el) => el.remove());
    root.querySelectorAll(".field-card").forEach((el, index) => {
      const detail = document.createElement("p");
      detail.className = "print-field-detail";
      detail.textContent = kt[index].detail;
      el.append(detail);
    });
    const qr = await Jt.toDataURL(K.admission, {
      width: 260,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#173e32", light: "#ffffff" },
    });
    root.querySelectorAll(".qr-card img").forEach((img) => {
      img.removeAttribute("id");
      img.src = qr;
    });
    root.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
    });
    document.body.append(root);
    await Promise.all(
      [...root.querySelectorAll("img")].map((img) =>
        img.decode().catch(() => {}),
      ),
    );
    await document.fonts.ready;
    document.title = `${deck.label || deck.title} - Semua Slide`;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    window.print();
  } catch (error) {
    re(
      "Cetak PDF belum tersedia",
      "<p>Coba buka website langsung di tab browser lalu tekan Cetak PDF kembali. Pada dialog cetak, pilih Simpan sebagai PDF.</p>",
    );
  } finally {
    B = originalRoute;
    document.title = originalTitle;
    printing = false;
    if (printButton?.isConnected) printButton.disabled = false;
  }
}
