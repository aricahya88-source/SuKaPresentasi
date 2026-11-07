/* Zero-dependency smoke test for the geographic data and browser animation logic. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/indonesia.geojson'), 'utf8'));
assert.equal(data.geometry.type, 'MultiPolygon');
assert.ok(data.geometry.coordinates.length > 100, 'Gugusan pulau harus tersedia');
for (const poly of data.geometry.coordinates) {
  assert.ok(poly[0].length >= 4, 'Setiap cincin poligon harus memiliki titik');
  for (const ring of poly) for (const [lon, lat] of ring) {
    assert.ok(Number.isFinite(lon) && Number.isFinite(lat));
    assert.ok(lon >= 94 && lon <= 142 && lat >= -12 && lat <= 7);
  }
}

const elements = new Map();
class FakeEl {
  constructor(tag = 'div') {
    this.tag = tag; this.children = []; this.dataset = {}; this.style = { setProperty() {} };
    this.classSet = new Set(); this.classList = {
      add: s => this.classSet.add(s), remove: s => this.classSet.delete(s),
      contains: s => this.classSet.has(s),
      toggle: (s, force) => { if (force ?? !this.classSet.has(s)) this.classSet.add(s); else this.classSet.delete(s); }
    };
    this.textContent = ''; this.innerHTML = ''; this.attributes = {};
  }
  appendChild(el) { if (el.tag === '#fragment') this.children.push(...el.children); else this.children.push(el); return el; }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getBoundingClientRect() { return { left: 0, top: 0, width: 1400, height: 660 }; }
  addEventListener() {}
  querySelector() { return null; }
  getContext() {
    const noop = () => {};
    return { setTransform: noop, clearRect: noop, beginPath: noop, arc: noop, ellipse: noop,
      fill: noop, stroke: noop, moveTo: noop, lineTo: noop, quadraticCurveTo: noop,
      save: noop, restore: noop,
      createRadialGradient: () => ({ addColorStop: noop }) };
  }
}
const ids = ['mapStage','mapSvg','growthCanvas','mapBase','mapGlow','mapLand','mapGrown',
  'mapLabels','stageLoading','loadingText','totalTime','sceneName','narrativeKicker',
  'narrativeText','seedCount','growthIndicator','stagePercent','currentTime',
  'timeline','revealRect','scanBeam','playPause','cinema','restart','fullscreen',
  'headerFullscreen'];
for (const id of ids) elements.set(id, new FakeEl());
elements.get('stageLoading').querySelector = () => new FakeEl();
const chapters = Array.from({ length: 4 }, (_, i) => {
  const el = new FakeEl('button');
  el.dataset.seek = [0, .23, .54, .83][i];
  return el;
});
const document = {
  readyState: 'complete', body: new FakeEl(), fullscreenElement: null,
  getElementById: id => elements.get(id),
  createElementNS: (_, tag) => new FakeEl(tag),
  createElement: tag => new FakeEl(tag),
  createDocumentFragment: () => new FakeEl('#fragment'),
  querySelectorAll: selector => selector === '.chapter' ? chapters : [],
  addEventListener() {}
};
const window = {
  INDONESIA_GEOJSON: data,
  location: { search: '?autoplay=0' },
  matchMedia: () => ({ matches: false }),
  devicePixelRatio: 1,
  addEventListener() {}
};
const context = vm.createContext({ document, window, URLSearchParams, Math, Number, String,
  console, performance: { now: () => 0 }, requestAnimationFrame: () => 1,
  cancelAnimationFrame: () => {} });
vm.runInContext(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), context);
assert.ok(elements.get('stageLoading').classSet.has('hidden'), 'Animasi harus selesai inisialisasi');
assert.equal(elements.get('mapLand').children.length, data.geometry.coordinates.length);
assert.equal(elements.get('mapLabels').children.length, 8);

window.NusantaraAnimation.seek(.42);
assert.equal(elements.get('sceneName').textContent, 'Menyemai Benih Unggul');
window.NusantaraAnimation.seek(.68);
assert.equal(elements.get('sceneName').textContent, 'Tunas Mulai Kehidupan');
window.NusantaraAnimation.seek(1);
assert.equal(elements.get('sceneName').textContent, 'Indonesia Terus Bertumbuh');
const finalCount = Number(elements.get('seedCount').textContent);
assert.ok(finalCount > 250, `Minimal 250 titik harus tumbuh, ditemukan ${finalCount}`);
assert.equal(elements.get('stagePercent').textContent, '100%');
assert.equal(elements.get('revealRect').attributes.width, '1290');
window.NusantaraAnimation.restart();
assert.equal(window.NusantaraAnimation.getProgress(), 0);

console.log(`LULUS: ${data.geometry.coordinates.length} poligon pulau, ${finalCount} titik tumbuh, 4 fase, kontrol timeline, dan reset.`);
