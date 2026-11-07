/* Nusantara Bertumbuh — animation engine. No WebGL, network, or external libraries. */
(() => {
  'use strict';

  const VIEW = { width: 1400, height: 660 };
  const DURATION = 24;
  const NS = 'http://www.w3.org/2000/svg';
  const params = new URLSearchParams(window.location.search);
  const embed = params.get('embed') === '1';
  const loop = params.get('loop') === '1';
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const autoplay = params.get('autoplay') !== '0' && !reduceMotion;
  const $ = (id) => document.getElementById(id);
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const easeOut = (v) => 1 - (1 - clamp(v)) ** 3;
  const easeBack = (v) => { const t = clamp(v); return 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2; };
  function mulberry32(seed) { return () => { let v = seed += 0x6D2B79F5; v = Math.imul(v ^ (v >>> 15), v | 1); v ^= v + Math.imul(v ^ (v >>> 7), v | 61); return ((v ^ (v >>> 14)) >>> 0) / 4294967296; }; }
  const random = mulberry32(20261107);

  const content = [
    { until: 0.23, title: 'Membuka Peta Nusantara', kicker: 'BABAK PERTAMA', text: 'Sebuah negeri dengan ribuan pulau dan sejuta harapan.', detail: 'Peta Nusantara terbentuk...' },
    { until: 0.54, title: 'Menyemai Benih Unggul', kicker: 'BABAK KEDUA', text: 'Benih-benih harapan disemai dari barat hingga timur.', detail: 'Benih sedang disemai...' },
    { until: 0.83, title: 'Tunas Mulai Kehidupan', kicker: 'BABAK KETIGA', text: 'Dari tanah Nusantara, tunas kehidupan mulai tumbuh.', detail: 'Tunas mulai tumbuh...' },
    { until: 1.001, title: 'Indonesia Terus Bertumbuh', kicker: 'BABAK KEEMPAT', text: 'Dari Sabang sampai Merauke, harapan tumbuh bersama.', detail: 'Nusantara menghijau!' }
  ];

  let polygons = [];
  let plants = [];
  let project = () => ({ x: 0, y: 0 });
  let progress = reduceMotion ? 1 : 0;
  let playing = autoplay;
  let lastFrame = 0;
  let loopStartAt = 0;
  let currentChapter = -1;
  let canvas, ctx, stage, mapSvg, cssSize = { w: 1400, h: 660, scale: 1, ox: 0, oy: 0, dpr: 1 };
  let rafId = 0;

  function makePath(d, className) {
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', className);
    path.setAttribute('fill-rule', 'evenodd');
    return path;
  }

  function getMapGeometry() {
    const data = window.INDONESIA_GEOJSON;
    if (!data?.geometry || data.geometry.type !== 'MultiPolygon') throw new Error('Data batas wilayah Indonesia tidak tersedia.');
    const coordinates = data.geometry.coordinates;
    let west = 180, east = -180, south = 90, north = -90;
    for (const polygon of coordinates) for (const ring of polygon) for (const [lon, lat] of ring) {
      west = Math.min(west, lon); east = Math.max(east, lon);
      south = Math.min(south, lat); north = Math.max(north, lat);
    }
    // Equirectangular projection is well suited to the equatorial archipelago.
    const scale = Math.min((VIEW.width - 160) / (east - west), (VIEW.height - 215) / (north - south));
    const xOffset = (VIEW.width - (east - west) * scale) / 2;
    const yOffset = (VIEW.height - (north - south) * scale) / 2 - 5;
    project = ([lon, lat]) => ({ x: xOffset + (lon - west) * scale, y: yOffset + (north - lat) * scale });
    polygons = coordinates.map((poly) => poly.map((ring) => ring.map(project)));
  }

  function pathString(poly) {
    return poly.map((ring) => ring.map((pt, i) => `${i ? 'L' : 'M'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ') + ' Z').join(' ');
  }

  function setupSVG() {
    const fragBase = document.createDocumentFragment();
    const fragGlow = document.createDocumentFragment();
    const fragLand = document.createDocumentFragment();
    const fragGrown = document.createDocumentFragment();
    for (const poly of polygons) {
      const d = pathString(poly);
      fragBase.appendChild(makePath(d, 'map-base-island'));
      fragGlow.appendChild(makePath(d, 'map-shadow'));
      fragLand.appendChild(makePath(d, 'map-island'));
      fragGrown.appendChild(makePath(d, 'map-grown-island'));
    }
    $('mapBase').appendChild(fragBase);
    $('mapGlow').appendChild(fragGlow);
    $('mapLand').appendChild(fragLand);
    $('mapGrown').appendChild(fragGrown);
  }

  function polygonArea(ring) {
    let sum = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) sum += ring[j].x * ring[i].y - ring[i].x * ring[j].y;
    return Math.abs(sum / 2);
  }

  function inRing(x, y, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[i], b = ring[j];
      if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) inside = !inside;
    }
    return inside;
  }

  function inPolygon(x, y, polygon) {
    if (!inRing(x, y, polygon[0])) return false;
    for (let hole = 1; hole < polygon.length; hole++) if (inRing(x, y, polygon[hole])) return false;
    return true;
  }

  function samplePlants() {
    const sampled = [];
    // Sample EACH mapped island, including small islands, not merely a bounding box.
    for (const polygon of polygons) {
      const outer = polygon[0];
      if (outer.length < 3) continue;
      const minX = Math.min(...outer.map(p => p.x)), maxX = Math.max(...outer.map(p => p.x));
      const minY = Math.min(...outer.map(p => p.y)), maxY = Math.max(...outer.map(p => p.y));
      const area = polygonArea(outer) - polygon.slice(1).reduce((a, ring) => a + polygonArea(ring), 0);
      const desired = Math.min(125, Math.max(1, Math.round(area / 290)));
      for (let n = 0; n < desired; n++) {
        let point = null;
        for (let attempt = 0; attempt < 120; attempt++) {
          const x = lerp(minX, maxX, random()), y = lerp(minY, maxY, random());
          if (inPolygon(x, y, polygon)) { point = { x, y }; break; }
        }
        // Extremely tiny islands may not yield a suitable random sample.
        if (!point) {
          const mx = (minX + maxX) / 2, my = (minY + maxY) / 2;
          point = inPolygon(mx, my, polygon) ? { x: mx, y: my } : { ...outer[0] };
        }
        const rate = random();
        const spread = clamp((point.x - 85) / 1250);
        const sowAt = 0.23 + 0.235 * (spread * 0.76 + rate * 0.24);
        const landAt = sowAt + 0.038 + random() * 0.05;
        const growAt = Math.max(landAt + 0.012, 0.525 + spread * 0.095 + random() * 0.105);
        const fullAt = 0.80 + spread * 0.11 + random() * 0.075;
        sampled.push({ ...point, sowAt, landAt, growAt, fullAt, phase: random() * Math.PI * 2,
          size: lerp(10, 22, random()), hue: 0.65 + random() * 0.35,
          startX: point.x + (random() - .5) * 130, startY: -130 - random() * 170,
          spark: random() > .65, ornament: random() > .77 });
      }
    }
    // Layering north-to-south keeps southern plants visibly in the foreground.
    plants = sampled.sort((a, b) => a.y - b.y);
  }

  function setupLabels() {
    const labels = [
      ['SUMATRA', 100.9, .0], ['JAWA', 110.2, -7.3], ['KALIMANTAN', 114.0, .1],
      ['SULAWESI', 121.2, -1.9], ['BALI', 115.2, -8.4], ['MALUKU', 127.2, -.4],
      ['PAPUA', 137.5, -4.2], ['NUSA TENGGARA', 120.9, -8.9]
    ];
    const frag = document.createDocumentFragment();
    for (const [name, lon, lat] of labels) {
      const pos = project([lon, lat]);
      const el = document.createElement('span');
      el.className = 'map-label';
      el.textContent = name;
      el.dataset.x = pos.x;
      el.dataset.y = pos.y;
      frag.appendChild(el);
    }
    $('mapLabels').appendChild(frag);
  }

  function resize() {
    if (!canvas || !mapSvg) return;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, rect.width), h = Math.max(1, rect.height);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    const scale = Math.min(w / VIEW.width, h / VIEW.height);
    const ox = (w - VIEW.width * scale) / 2, oy = (h - VIEW.height * scale) / 2;
    cssSize = { w, h, scale, ox, oy, dpr };
    const mapRect = mapSvg.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    for (const el of $('mapLabels').children) {
      el.style.left = `${(mapRect.left - stageRect.left + ox + Number(el.dataset.x) * scale) / stageRect.width * 100}%`;
      el.style.top = `${(mapRect.top - stageRect.top + oy + Number(el.dataset.y) * scale) / stageRect.height * 100}%`;
    }
    render();
  }

  function seedLight(ctx, x, y, radius, alpha) {
    if (alpha <= 0.004) return;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(245,225,164,${alpha})`);
    gradient.addColorStop(.28, `rgba(214,229,144,${alpha * .36})`);
    gradient.addColorStop(1, 'rgba(211,226,152,0)');
    ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  }

  function drawSeed(p, t) {
    if (p < t.sowAt || p > t.growAt + .045) return;
    const falling = clamp((p - t.sowAt) / (t.landAt - t.sowAt));
    if (falling < 1) {
      const fly = easeOut(falling);
      const x = lerp(t.startX, t.x, fly) + Math.sin(falling * Math.PI * 2 + t.phase) * 8 * (1 - falling);
      const y = lerp(t.startY, t.y, fly);
      const alpha = Math.min(1, falling * 5) * (1 - smooth(.94, 1, falling) * .1);
      ctx.strokeStyle = `rgba(246,227,155,${alpha * .45})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y - 14 - 22 * (1 - fly)); ctx.lineTo(x, y - 4); ctx.stroke();
      seedLight(ctx, x, y, 15, alpha * .75);
      ctx.fillStyle = `rgba(255,229,156,${alpha})`;
      ctx.beginPath(); ctx.ellipse(x, y, 2.1, 3.4, -.32, 0, Math.PI * 2); ctx.fill();
    } else {
      const after = clamp((p - t.landAt) / .045);
      seedLight(ctx, t.x, t.y, 10 + 15 * after, (1 - after) * .47);
      ctx.fillStyle = `rgba(233,212,147,${(1 - after * .68) * .95})`;
      ctx.beginPath(); ctx.ellipse(t.x, t.y, 1.6, 2.1, -.4, 0, Math.PI * 2); ctx.fill();
      if (after < .85) {
        ctx.strokeStyle = `rgba(237,221,168,${(1 - after) * .6})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(t.x, t.y, 3 + after * 12, 0, Math.PI * 2); ctx.stroke();
      }
    }
  }

  function leaf(ctx, x, y, dx, dy, size, color, alpha) {
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + dx * .7 - dy * .48, y + dy * .7 + dx * .48, x + dx, y + dy);
    ctx.quadraticCurveTo(x + dx * .68 + dy * .40, y + dy * .72 - dx * .40, x, y);
    ctx.fill();
    ctx.restore();
  }

  function drawPlant(p, t, wind) {
    if (p < t.growAt) return;
    const growth = clamp((p - t.growAt) / (t.fullAt - t.growAt));
    const rise = Math.max(0, easeBack(growth));
    const height = t.size * rise;
    const sway = Math.sin(wind * 1.2 + t.phase) * .9 * growth;
    const x = t.x, y = t.y;

    // A small ground aura and roots anchor each sapling to its own island.
    ctx.fillStyle = `rgba(139,231,155,${.09 + .12 * growth})`;
    ctx.beginPath(); ctx.ellipse(x, y + .5, 3.5 + growth * 3.5, 1.1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(127,222,136,${.5 + .5 * growth})`;
    ctx.lineWidth = 1.25 + growth * .45;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sway * .6, y - height * .53, x + sway, y - height); ctx.stroke();

    const leafSize = (4.7 + t.size * .24) * smooth(.13, .60, growth);
    const colA = t.hue > .84 ? '#bff0a0' : '#6ddfa4';
    const colB = t.hue > .82 ? '#8ddc86' : '#8fdcb1';
    const topY = y - height;
    leaf(ctx, x + sway * .65, topY + leafSize * .9, -leafSize * 1.06, -leafSize * .75, leafSize, colA, .95);
    leaf(ctx, x + sway * .65, topY + leafSize * .58, leafSize * 1.02, -leafSize * .83, leafSize, colB, .94);
    if (growth > .58) {
      leaf(ctx, x + sway, topY + 1.2, leafSize * .15, -leafSize * 1.02, leafSize, '#c4ef9f', smooth(.58, .9, growth));
    }
    if (t.ornament && growth > .87) {
      ctx.fillStyle = `rgba(247,221,137,${smooth(.87,1,growth) * .7})`;
      ctx.beginPath(); ctx.arc(x + sway, topY - 2.8, 1.55, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawWaterDust(p, wind) {
    // Sparse, deterministic drifting particles: an atmospheric accent, not fake land.
    for (let i = 0; i < 56; i++) {
      const x = 35 + ((i * 297.61 + 40 + wind * (i % 3 + 1) * 2) % 1330);
      const y = 75 + ((i * 149.37 + 30) % 490);
      const shimmer = Math.max(0, Math.sin(wind * .8 + i * 4.73));
      ctx.globalAlpha = (.045 + shimmer * .14) * (.3 + .7 * smooth(0,.24,p));
      ctx.fillStyle = i % 5 === 0 ? '#e8cf9c' : '#91c7bf';
      ctx.beginPath(); ctx.arc(x, y, i % 9 === 0 ? 1.2 : .65, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawCanvas(p, wind) {
    const { w, h, scale, ox, oy, dpr } = cssSize;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, ox * dpr, oy * dpr);
    drawWaterDust(p, wind);
    if (p < .22) return;
    for (const t of plants) drawSeed(p, t);
    for (const t of plants) drawPlant(p, t, wind);
    // Very subtle wave of light when the archipelago is fully green.
    const ending = smooth(.81, .98, p);
    if (ending > 0) {
      for (let i = 0; i < 36; i++) {
        const t = plants[(i * 71) % plants.length];
        if (!t) continue;
        const twinkle = Math.pow(Math.max(0, Math.sin(wind * 1.7 + i * 2.91)), 13);
        if (twinkle < .04) continue;
        seedLight(ctx, t.x, t.y - t.size, 10, ending * twinkle * .18);
      }
    }
  }

  function formatTime(s) { const sec = Math.round(s); return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; }

  function updateUI() {
    const p = progress;
    const chapter = content.findIndex(c => p < c.until);
    if (chapter !== currentChapter) {
      currentChapter = chapter;
      const c = content[chapter];
      $('sceneName').textContent = c.title;
      $('narrativeKicker').textContent = c.kicker;
      $('narrativeText').textContent = c.text;
      document.querySelectorAll('.chapter').forEach((b, i) => b.classList.toggle('active', i === chapter));
    }
    const arrived = plants.reduce((n, t) => n + Number(p >= t.landAt), 0);
    const grown = plants.reduce((n, t) => n + Number(p >= t.growAt), 0);
    $('seedCount').textContent = String(p >= .23 ? (p >= .83 ? grown : arrived) : 0).padStart(3, '0');
    $('growthIndicator').textContent = content[chapter].detail;
    $('stagePercent').textContent = `${String(Math.round(p * 100)).padStart(2, '0')}%`;
    $('currentTime').textContent = formatTime(p * DURATION);
    $('timeline').value = String(Math.round(p * 1000));
    $('timeline').style.setProperty('--fill', `${(p * 100).toFixed(1)}%`);
    const revealWidth = 1290 * smooth(.01, .23, p);
    $('revealRect').setAttribute('width', String(revealWidth));
    const beam = $('scanBeam');
    beam.setAttribute('d', `M${(60 + revealWidth).toFixed(2)} 85 V575`);
    beam.setAttribute('opacity', String(p > .02 && p < .235 ? .52 : 0));
    $('mapGrown').setAttribute('opacity', String((smooth(.65, 1, p) * .68).toFixed(3)));
    const labelVisibility = p > .24;
    for (const label of $('mapLabels').children) label.classList.toggle('visible', labelVisibility);
    const icon = playing ? '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>' : '<path d="M7 4.5v15L19 12z"/>';
    const play = $('playPause');
    if (play.dataset.state !== String(playing)) {
      play.dataset.state = String(playing);
      play.setAttribute('aria-label', playing ? 'Jeda animasi' : 'Putar animasi');
      play.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">${icon}</svg>`;
    }
  }

  function render(time = 0) { updateUI(); if (ctx) drawCanvas(progress, time / 1000); }

  function tick(time) {
    const delta = lastFrame ? Math.min(.07, (time - lastFrame) / 1000) : 0;
    lastFrame = time;
    if (playing) {
      progress = clamp(progress + delta / DURATION);
      if (progress >= 1) {
        if (loop) {
          if (!loopStartAt) loopStartAt = time;
          if (time - loopStartAt > 2700) { progress = 0; loopStartAt = 0; }
        } else playing = false;
      }
    }
    render(time);
    rafId = requestAnimationFrame(tick);
  }

  function play() { if (progress >= 1) progress = 0; playing = true; loopStartAt = 0; updateUI(); }
  function pause() { playing = false; updateUI(); }
  function restart() { progress = 0; playing = true; loopStartAt = 0; updateUI(); }
  function seek(p) { progress = clamp(Number(p)); loopStartAt = 0; if (progress >= 1 && !loop) playing = false; render(performance.now()); }
  function fullscreen() {
    const target = $('cinema');
    if (document.fullscreenElement) document.exitFullscreen?.();
    else target.requestFullscreen?.().catch(() => {});
  }

  function bindEvents() {
    $('playPause').addEventListener('click', () => playing ? pause() : play());
    $('restart').addEventListener('click', restart);
    $('fullscreen').addEventListener('click', fullscreen);
    $('headerFullscreen').addEventListener('click', fullscreen);
    $('timeline').addEventListener('input', e => { playing = false; seek(Number(e.target.value) / 1000); });
    document.querySelectorAll('.chapter').forEach(b => b.addEventListener('click', () => { playing = true; seek(Number(b.dataset.seek)); }));
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input,button,a,textarea,select')) return;
      if (e.code === 'Space') { e.preventDefault(); playing ? pause() : play(); }
      if (e.key?.toLowerCase() === 'r') restart();
      if (e.key === 'ArrowRight') seek(progress + .035);
      if (e.key === 'ArrowLeft') seek(progress - .035);
    });
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('fullscreenchange', () => requestAnimationFrame(resize));
    document.addEventListener('visibilitychange', () => { lastFrame = 0; });
  }

  function init() {
    try {
      if (embed) document.body.classList.add('embed-mode');
      stage = $('mapStage'); mapSvg = $('mapSvg'); canvas = $('growthCanvas'); ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) throw new Error('Browser ini tidak mendukung Canvas 2D.');
      getMapGeometry(); setupSVG(); samplePlants(); setupLabels(); bindEvents();
      $('totalTime').textContent = formatTime(DURATION);
      resize();
      $('stageLoading').classList.add('hidden');
      rafId = requestAnimationFrame(tick);
    } catch (err) {
      console.error('Nusantara animation error:', err);
      $('loadingText').textContent = `Animasi tidak dapat dibuka: ${err.message}`;
      const loading = $('stageLoading'); loading.querySelector('.loading-orb')?.remove();
    }
  }

  // An optional integration interface for embedding the scene in a slide deck.
  window.NusantaraAnimation = { play, pause, restart, seek, getProgress: () => progress, destroy: () => cancelAnimationFrame(rafId) };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
