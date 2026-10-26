// Bentuk artistik untuk presentasi; bukan simulasi astronomi berskala.
export const shapeNames = [
  "Bola partikel",
  "Saturnus",
  "Galaksi spiral",
  "Gelombang",
  "Heliks ganda",
  "Torus",
  "Konstelasi",
  "Tata surya",
  "Orbit atom",
  "Nebula bintang",
];
export function createShape(mode, count) {
  const out = new Float32Array(count * 3);
  let seed = 2026;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    const t = i / count,
      a = i * 2.39996323;
    let x = 0,
      y = 0,
      z = 0;
    const sphere = (r, v = t) => {
      const h = 1 - 2 * v,
        s = Math.sqrt(Math.max(0, 1 - h * h));
      return [r * s * Math.cos(a), r * h, r * s * Math.sin(a)];
    };
    switch (mode) {
      case 0:
        [x, y, z] = sphere(1.35);
        break;
      case 1:
        if (t < 0.5) {
          [x, y, z] = sphere(0.78, t * 2);
        } else {
          const r = 1.12 + rand() * 0.74,
            theta = a;
          x = Math.cos(theta) * r;
          y = Math.sin(theta) * r * 0.24;
          z = Math.sin(theta) * r * 0.58;
        }
        break;
      case 2: {
        const arm = i % 4,
          theta = t * 8 + (arm * Math.PI) / 2,
          r = 0.08 + Math.sqrt(t) * 1.75;
        x = Math.cos(theta) * r + (rand() - 0.5) * 0.18;
        z = Math.sin(theta) * r + (rand() - 0.5) * 0.18;
        y = (rand() - 0.5) * 0.15 + z * 0.2;
        break;
      }
      case 3:
        x = (t - 0.5) * 3.5;
        y = Math.sin(t * 23) * 0.55 + ((i % 13) - 6) * 0.035;
        z = Math.cos(t * 23) * 0.55;
        break;
      case 4: {
        const theta = t * 22 + (i % 2) * Math.PI;
        x = Math.cos(theta) * 0.8;
        y = (t - 0.5) * 2.7;
        z = Math.sin(theta) * 0.8;
        if (i % 7 === 0) {
          x *= rand();
          z *= rand();
        }
        break;
      }
      case 5: {
        const v = rand() * Math.PI * 2,
          r = 1.12 + 0.36 * Math.cos(v);
        x = r * Math.cos(a);
        y = 0.36 * Math.sin(v);
        z = r * Math.sin(a);
        break;
      }
      case 6: {
        const cluster = i % 7,
          theta = (cluster / 7) * Math.PI * 2,
          r = 0.1 + rand() * 0.16;
        x = Math.cos(theta) * 1.3 + r * Math.cos(a);
        y = Math.sin(theta) * 1.1 + r * Math.sin(a);
        z = Math.sin(theta * 3) * 0.5 + (rand() - 0.5) * 0.1;
        if (i % 5 === 0) {
          const u = rand(),
            next = (((cluster + 1) % 7) / 7) * Math.PI * 2;
          x = (1 - u) * Math.cos(theta) * 1.3 + u * Math.cos(next) * 1.3;
          y = (1 - u) * Math.sin(theta) * 1.1 + u * Math.sin(next) * 1.1;
        }
        break;
      }
      case 7:
        if (t < 0.23) {
          [x, y, z] = sphere(0.4, t / 0.23);
        } else {
          const ring = i % 4,
            r = 0.7 + ring * 0.36;
          x = Math.cos(a) * r;
          y = Math.sin(a) * r * 0.14;
          z = Math.sin(a) * r * 0.8;
          if (i % 19 === 0) {
            x += 0.06 * Math.cos(a * 8);
            y += 0.06 * Math.sin(a * 8);
          }
        }
        break;
      case 8:
        if (t < 0.18) {
          [x, y, z] = sphere(0.33, t / 0.18);
        } else {
          const orbit = i % 3,
            theta = (orbit * Math.PI) / 3,
            u = Math.cos(a) * 1.55,
            v = Math.sin(a) * 0.56;
          x = u * Math.cos(theta) - v * Math.sin(theta);
          y = u * Math.sin(theta) + v * Math.cos(theta);
          z = Math.sin(a) * 0.7;
        }
        break;
      case 9: {
        const r = Math.pow(rand(), 0.55) * 1.8,
          theta = a;
        x = Math.cos(theta) * r;
        y = Math.sin(theta) * r * 0.75;
        z = (rand() - 0.5) * r;
        const arm = 1 + 0.2 * Math.sin(theta * 5);
        x *= arm;
        y *= arm;
        break;
      }
      default:
        throw new RangeError("Bentuk partikel tidak tersedia");
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}
export function morphShape(current, from, to, progress) {
  const t = Math.min(1, Math.max(0, progress));
  if (t === 0) {
    current.set(from);
    return current;
  }
  if (t === 1) {
    current.set(to);
    return current;
  }
  const e = t * t * (3 - 2 * t),
    scatter = Math.sin(Math.PI * t) * 0.1;
  for (let i = 0; i < current.length; i++) {
    current[i] = from[i] + (to[i] - from[i]) * e + Math.sin(i * 1.71) * scatter;
  }
  return current;
}
