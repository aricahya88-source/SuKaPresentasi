'use strict';
document.body.classList.toggle('theme-light', new URLSearchParams(location.search).get('theme') === 'light');

// Materi penelitian dipertahankan sesuai dokumen profil akademik yang diberikan.
const research = [
  {year:'2026',title:'Facilitating the Utilization and Refinement of the Sains Masemba Application to Support Science Assessment Readiness at MTsN 9 Bantul'},
  {year:'2026',title:'Profil Literasi Dasar Keislaman Calon Mahasiswa Kelompok IPS melalui Seleksi CBT di UIN Sunan Kalijaga Yogyakarta dan Implikasinya terhadap Pembinaan Keagamaan'},
  {year:'2025',title:'Augmented Reality (AR) Sebagai Media Interaktif Dalam Pembelajaran Bahasa Arab Di UIN Sunan Kalijaga Yogyakarta'},
  {year:'2025',title:'Transformasi Pendidikan: Peran Mata Kuliah Perencanaan Terhadap Kesiapan Kompetensi Mengajar Calon Guru Fisika'},
  {year:'2025',title:'The Development of Android-Based Educational Games on Work and Energy Material to Train Critical Thinking Skills'},
  {year:'2024',title:"Visualization of Mercury's Orbital Path Around the Sun Using Matlab for Astronomic Distance Learning"},
  {year:'2024',title:'Integrating Environmental Conservation and Economic Empowerment: Lessons from Temanggung’s Coffee Sector'},
  {year:'2023',title:'Tantangan Profesionalisme Guru: Integrasi Pembelajaran pada Kurikulum Merdeka dengan Pendidikan di Abad 21'},
  {year:'2023',title:'The Development of Electronic-based Student Worksheets to Facilitate the Critical Thinking Skills of Tenth Graders'},
  {year:'2022',title:"Visualization of Refractive Index and Reflectance of Sodium Metal Based on Drude's Theory Using MATLAB as an Alternative for Optics and Astrophysics Lectures"},
  {year:'2022',title:'Hubungan Faktor Lingkungan Terhadap Self-Regulated Learning (SRL) pada Mata Kuliah Praktikum Optika dan Gelombang pada Masa Pandemi COVID-19'}
];

const researchList = document.getElementById('research-list');
for (const item of research) {
  const row = document.createElement('article');
  row.className = 'research-item';
  const year = document.createElement('span');
  year.className = 'research-year';
  year.textContent = item.year;
  const title = document.createElement('span');
  title.className = 'research-title';
  title.textContent = item.title;
  row.append(year, title);
  researchList.append(row);
}

const tabNames = ['profil','pengalaman','pengajaran','publikasi'];
const tabs = [...document.querySelectorAll('[data-tab]')];
const panels = [...document.querySelectorAll('.content-panel')];
const panelCount = document.getElementById('panel-count');
const announcement = document.getElementById('announcement');
const playButton = document.getElementById('play-button');
const playLabel = document.getElementById('play-label');
const playIcon = document.getElementById('play-icon');
const progress = document.getElementById('timeline-fill');
const frame = document.querySelector('.presentation-frame');
const AUTO_DURATION = 8500;

let activeTab = 0;
let autoplay = false;
let timeStarted = 0;
let animationFrame = 0;

function changeTab(index, announce = true) {
  activeTab = (index + tabNames.length) % tabNames.length;
  tabs.forEach((tab, i) => {
    const selected = i === activeTab;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  panels.forEach((panel, i) => {
    const selected = i === activeTab;
    panel.hidden = !selected;
    panel.classList.toggle('is-active', selected);
    if (selected) panel.scrollTop = 0;
  });
  panelCount.innerHTML = `${String(activeTab + 1).padStart(2,'0')} <span>/ 04</span>`;
  if (announce) announcement.textContent = `Bagian ${activeTab + 1} dari 4: ${tabs[activeTab].textContent.trim()}`;
  if (autoplay) timeStarted = performance.now();
  else progress.style.width = '0%';
}

function stopAutoplay() {
  autoplay = false;
  cancelAnimationFrame(animationFrame);
  playButton.setAttribute('aria-pressed', 'false');
  playButton.classList.remove('is-playing');
  playIcon.textContent = '▶';
  playLabel.textContent = 'PUTAR OTOMATIS';
  progress.style.width = '0%';
}

function autoTick(time) {
  if (!autoplay) return;
  const elapsed = time - timeStarted;
  if (elapsed >= AUTO_DURATION) {
    changeTab(activeTab + 1);
    timeStarted = time;
  }
  progress.style.width = `${Math.max(0,Math.min(100,((time - timeStarted) / AUTO_DURATION) * 100))}%`;
  animationFrame = requestAnimationFrame(autoTick);
}

function startAutoplay() {
  if (autoplay) return;
  autoplay = true;
  timeStarted = performance.now();
  playButton.setAttribute('aria-pressed', 'true');
  playButton.classList.add('is-playing');
  playIcon.textContent = 'Ⅱ';
  playLabel.textContent = 'JEDA OTOMATIS';
  animationFrame = requestAnimationFrame(autoTick);
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => changeTab(index));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (activeTab + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    changeTab(next);
    tabs[next].focus();
  });
});

playButton.addEventListener('click', () => autoplay ? stopAutoplay() : startAutoplay());

document.getElementById('replay-button').addEventListener('click', () => {
  stopAutoplay();
  changeTab(0);
  frame.classList.add('is-replaying');
  // Restart CSS entrance animations, including on repeat clicks.
  void frame.offsetHeight;
  frame.classList.remove('is-replaying');
  announcement.textContent = 'Animasi slide diulang dari awal.';
});

document.getElementById('fullscreen-button').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
  } catch (error) {
    announcement.textContent = 'Layar penuh tidak tersedia di browser ini.';
  }
});

document.addEventListener('keydown', event => {
  if (/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(document.activeElement?.tagName || '')) return;
  if (event.code === 'Space' && !event.repeat) {
    event.preventDefault();
    autoplay ? stopAutoplay() : startAutoplay();
  }
  if (event.key === 'Escape' && autoplay) stopAutoplay();
});

const photo = document.getElementById('tutor-photo');
photo.addEventListener('error', () => {
  photo.classList.add('photo-error');
  document.getElementById('photo-placeholder').setAttribute('aria-hidden','false');
});

// Kanvas bintang ringan: tidak memakai WebGL, jadi kompatibel di lebih banyak browser.
const canvas = document.getElementById('constellation');
const ctx = canvas.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let stars = [];
let canvasWidth = 0;
let canvasHeight = 0;
let lastFrame = 0;

function resizeCanvas() {
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  canvas.width = Math.round(canvasWidth * dpr);
  canvas.height = Math.round(canvasHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(105,Math.max(38,Math.round(canvasWidth * canvasHeight / 11500)));
  stars = Array.from({length:count},(_,i) => ({
    x:Math.random() * canvasWidth,
    y:Math.random() * canvasHeight,
    r:Math.random() * 1.35 + .25,
    vx:(Math.random()-.5) * .15,
    vy:(Math.random()-.5) * .12,
    alpha:Math.random() * .46 + .17,
    phase:Math.random() * Math.PI * 2,
    color:i % 9 === 0 ? '249,211,136' : '128,195,255'
  }));
}

function drawStars(now) {
  if (!ctx || reduceMotion.matches || document.hidden) return;
  if (now - lastFrame < 30) {requestAnimationFrame(drawStars);return;}
  lastFrame = now;
  ctx.clearRect(0,0,canvasWidth,canvasHeight);
  const t = now * .001;
  for (const star of stars) {
    star.x += star.vx;
    star.y += star.vy;
    if (star.x < -5) star.x = canvasWidth + 5;
    if (star.x > canvasWidth + 5) star.x = -5;
    if (star.y < -5) star.y = canvasHeight + 5;
    if (star.y > canvasHeight + 5) star.y = -5;
    ctx.fillStyle = `rgba(${star.color},${star.alpha * (.74 + .26*Math.sin(t + star.phase))})`;
    ctx.beginPath();ctx.arc(star.x,star.y,star.r,0,Math.PI*2);ctx.fill();
  }
  requestAnimationFrame(drawStars);
}

if (ctx && !reduceMotion.matches) {
  resizeCanvas();
  requestAnimationFrame(drawStars);
  window.addEventListener('resize', resizeCanvas, {passive:true});
}

reduceMotion.addEventListener?.('change', event => {
  if (!event.matches && ctx) {
    resizeCanvas();
    requestAnimationFrame(drawStars);
  } else if (ctx) ctx.clearRect(0,0,canvasWidth,canvasHeight);
});

changeTab(0, false);
