import { createParticles as createLegacyParticles } from './particles-legacy.js';

const noop = () => ({ setMode() {}, setEnabled() {}, dispose() {} });
const wantsSMA = () => document.querySelector('#main')?.classList.contains('deck-syubbanul-wathon');

async function startRenderer(type, canvas) {
  // The SMA deck owns a dedicated NEXORA WebGL renderer in presenter.js.
  // Avoid the GPU cost of a second concurrent renderer behind the slide.
  if (type === 'none') return noop();
  try {
    return await createLegacyParticles(canvas);
  } catch (error) {
    console.warn('Efek partikel tidak tersedia, presentasi tetap dapat digunakan.', error);
    return noop();
  }
}

export async function createParticles(canvas) {
  let active = wantsSMA() ? 'none' : 'legacy';
  let renderer = await startRenderer(active, canvas);
  let enabled = true;
  let mode = 0;
  let generation = 0;
  let disposed = false;

  async function switchRenderer(type) {
    if (type === active || disposed) return;
    const request = ++generation;
    renderer?.dispose?.();
    renderer = null;
    active = type;
    const next = await startRenderer(type, canvas);
    if (request !== generation || disposed) { next.dispose?.(); return; }
    renderer = next;
    renderer.setEnabled?.(enabled);
    renderer.setMode?.(mode);
  }

  return {
    async setMode(next) {
      mode = Number.isInteger(next) ? next : 0;
      await switchRenderer(wantsSMA() ? 'none' : 'legacy');
      renderer?.setMode?.(mode);
    },
    setEnabled(next) {
      enabled = Boolean(next);
      renderer?.setEnabled?.(enabled);
    },
    dispose() {
      disposed = true;
      ++generation;
      renderer?.dispose?.();
    },
  };
}
