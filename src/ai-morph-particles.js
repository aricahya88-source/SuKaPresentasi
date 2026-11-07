// Lightweight Canvas 2D morphing point cloud; no additional WebGL context.
// Each topic gets a distinct recognizable silhouette while retaining every
// particle through the transition from the previous slide.

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = x => { const t = clamp(x); return t * t * (3 - 2 * t); };

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const point = (x, y, z = 0) => ({ x, y, z });
const scatterDisk = (rng, cx, cy, rx, ry) => {
  const angle = rng() * Math.PI * 2;
  const radius = Math.sqrt(rng());
  return point(cx + Math.cos(angle) * rx * radius, cy + Math.sin(angle) * ry * radius, rng() * 2 - 1);
};
const lerpPoint = (a, b, t) => point(
  a.x + (b.x - a.x) * t,
  a.y + (b.y - a.y) * t,
  a.z + (b.z - a.z) * t,
);

function brain(rng, index) {
  if (index % 13 === 0) {
    // A slight brainstem makes the cortical silhouette more identifiable.
    return scatterDisk(rng, .04, .58, .15, .27);
  }
  const side = index % 2 ? 1 : -1;
  const a = rng() * Math.PI * 2;
  const r = Math.sqrt(rng());
  const lobe = .11 * Math.sin(a * 5.1 + side) + .045 * Math.cos(a * 8.2);
  const width = .43 + lobe;
  const x = side * .23 + Math.cos(a) * width * r;
  const y = Math.sin(a) * (.61 + .04 * Math.sin(a * 4)) * r - .055;
  return point(x, y + (Math.abs(x) < .08 ? .075 : 0), rng() * 2 - 1);
}

function neuron(rng, index) {
  if (index % 4 === 0) return scatterDisk(rng, -.24, .01, .205, .205);
  if (index % 7 === 0) {
    const x = -.12 + rng() * .99;
    const y = .045 * Math.sin(x * 8) + .06 * Math.sin(x * 23);
    return point(x, y, rng() * 2 - 1);
  }
  const branch = Math.floor(rng() * 24);
  const upper = branch < 12 ? -1 : 1;
  const strand = branch % 12;
  const t = rng();
  if (branch < 17) {
    const angle = Math.PI * (.58 + (strand / 12) * .78) * upper;
    const length = .42 + rng() * .43;
    const originX = -.2 + (strand % 3) * .05;
    return point(originX + Math.cos(angle) * length * t,
      Math.sin(angle) * length * t + .1 * Math.sin(t * 5 + branch) * t,
      rng() * 2 - 1);
  }
  const t2 = rng();
  return point(.51 + t2 * .4, (strand - 6) * .075 * t2, rng() * 2 - 1);
}

function network(rng, index) {
  const layers = [[-.79, 5],[-.41, 7],[-.02, 8],[.37, 7],[.76, 5]];
  const layer = Math.floor(rng() * (layers.length - 1));
  const [x1, count1] = layers[layer];
  const [x2, count2] = layers[layer + 1];
  const node1 = Math.floor(rng() * count1);
  const node2 = Math.floor(rng() * count2);
  const y1 = (node1 / Math.max(1, count1 - 1) - .5) * 1.35;
  const y2 = (node2 / Math.max(1, count2 - 1) - .5) * 1.35;
  if (index % 6 === 0) return scatterDisk(rng, x1, y1, .035, .035);
  const t = rng();
  return point(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t,
    Math.sin((layer + node1 + node2) * .3));
}

function microchip(rng, index) {
  if (index % 5 === 0) {
    const a = rng() * Math.PI * 2;
    const x = Math.cos(a) * (.40 + rng() * .14);
    const y = Math.sin(a) * (.40 + rng() * .14);
    return point(x, y, rng() * 2 - 1);
  }
  if (index % 3 === 0) {
    const side = Math.floor(rng() * 4);
    const pos = -.7 + Math.floor(rng() * 12) * .125;
    const t = rng();
    if (side === 0) return point(-.42 - .34 * t, pos);
    if (side === 1) return point(.42 + .34 * t, pos);
    if (side === 2) return point(pos, -.42 - .34 * t);
    return point(pos, .42 + .34 * t);
  }
  const edge = Math.floor(rng() * 4);
  const t = rng() * .84 - .42;
  if (edge === 0) return point(t, -.42);
  if (edge === 1) return point(t, .42);
  if (edge === 2) return point(-.42, t);
  return point(.42, t);
}

function globe(rng, index) {
  const lat = (rng() -.5) * Math.PI;
  const lon = rng() * Math.PI * 2;
  const ring = index % 7 === 0;
  const r = ring ? .84 : (.71 + rng() * .15);
  const phi = ring ? Math.round(lat * 6 / Math.PI) * Math.PI / 6 : lat;
  const x = r * Math.cos(phi) * Math.cos(lon);
  const y = r * Math.sin(phi);
  return point(x, y, Math.cos(phi) * Math.sin(lon));
}

function heart(rng, index) {
  const t = rng() * Math.PI * 2;
  const scale = index % 7 === 0 ? 1 : Math.sqrt(rng());
  const x = (16 * Math.sin(t) ** 3) / 18;
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 18;
  return point(x * scale, y * scale, rng() * 2 - 1);
}

const shapes = { brain, neuron, network, microchip, globe, heart };
export const AI_SHAPE_SEQUENCE = Object.freeze(Object.keys(shapes));

export function generateParticleShape(name, count = 900) {
  if (!shapes[name]) throw new Error(`Bentuk partikel tidak ditemukan: ${name}`);
  const rng = seeded(72839 + AI_SHAPE_SEQUENCE.indexOf(name) * 1021);
  return Array.from({ length: count }, (_, i) => shapes[name](rng, i))
    .sort((a, b) => Math.floor(a.y * 18) - Math.floor(b.y * 18) || a.x - b.x);
}

export function createAIMorphParticles(canvas) {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return { setSlide() {}, destroy() {} };
  const count = Math.max(500, Math.min(950, Math.round(innerWidth * innerHeight / 1150)));
  const points = generateParticleShape('brain', count);
  const particles = points.map((p, i) => ({
    current: point((i % 37 / 37 - .5) * 1.6, (Math.floor(i / 37) / Math.ceil(count / 37) - .5) * 1.6, p.z),
    from: point(0, 0), to: p, index: i,
  }));
  let shape = '';
  let started = 0;
  let request = 0;
  let visible = false;
  let animate = true;
  let colorTheme = 'dark';
  let width = 0;
  let height = 0;
  let pixelRatio = 1;

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(bounds.width));
    height = Math.max(1, Math.round(bounds.height));
    pixelRatio = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    if (visible && !animate) render(performance.now());
  }

  function render(now) {
    context.clearRect(0, 0, width, height);
    if (!visible) return;
    const p = animate ? ease((now - started) / 2050) : 1;
    const cx = width * .51;
    const cy = height * .51;
    const scale = Math.min(width * .45, height * .49);
    context.globalCompositeOperation = colorTheme === 'dark' ? 'lighter' : 'source-over';
    for (const star of particles) {
      const target = star.to;
      star.current = lerpPoint(star.from, target, p);
      const drift = animate ? Math.sin(now * .00027 + star.index * .17) * .009 : 0;
      const depth = (star.current.z + 1) * .5;
      const x = cx + (star.current.x + drift) * scale;
      const y = cy + (star.current.y + drift * .6) * scale;
      const light = star.index % 11 === 0;
      const radius = (light ? 1.75 : 1.05) * (.73 + depth * .7);
      context.beginPath();
      context.fillStyle = colorTheme === 'dark'
        ? light ? `rgba(239,197,126,${.62 + depth * .18})` : `rgba(100,197,242,${.29 + depth * .43})`
        : light ? `rgba(148,86,19,${.61 + depth * .20})` : `rgba(25,92,155,${.36 + depth * .4})`;
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    context.globalCompositeOperation = 'source-over';
  }

  function tick(now) {
    render(now);
    if (visible && animate) request = requestAnimationFrame(tick);
  }

  function setSlide(nextShape, motionEnabled, theme) {
    const shouldShow = Boolean(nextShape && shapes[nextShape]);
    visible = shouldShow;
    colorTheme = theme === 'light' ? 'light' : 'dark';
    animate = Boolean(motionEnabled && !matchMedia('(prefers-reduced-motion: reduce)').matches);
    canvas.classList.toggle('active', shouldShow);
    if (!shouldShow) {
      cancelAnimationFrame(request);
      request = 0;
      return;
    }
    resize();
    if (nextShape !== shape) {
      shape = nextShape;
      const target = generateParticleShape(nextShape, count);
      particles.forEach((part, i) => {
        part.from = { ...part.current };
        part.to = target[i];
      });
      started = performance.now();
    } else if (!animate) {
      particles.forEach(part => { part.from = { ...part.to }; part.current = { ...part.to }; });
    }
    cancelAnimationFrame(request);
    if (animate) request = requestAnimationFrame(tick);
    else render(performance.now());
  }

  addEventListener('resize', resize, { passive: true });
  resize();
  return {
    setSlide,
    destroy() { cancelAnimationFrame(request); removeEventListener('resize', resize); },
  };
}
