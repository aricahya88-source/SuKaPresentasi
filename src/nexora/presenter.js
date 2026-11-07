import { gsap } from 'gsap';
import { NexoraScene } from './scene.js';

const prefersLessMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// One renderer and one real model are shared by all NEXORA stages.
export function createNexoraPresenter(host) {
  let engine = null;
  let tween = null;
  let activeScene = '';
  let failed = false;
  const staticFallback = `
    <div class="nexora-webgl-fallback" role="img" aria-label="Ilustrasi struktur bangunan NEXORA">
      <svg viewBox="0 0 520 370" fill="none" aria-hidden="true">
        <path d="M65 278 238 332 456 246 284 191Z" fill="#173653" stroke="#70b8df" stroke-width="4"/>
        <path d="M108 187 280 242 280 310 108 253Z" fill="#244862" stroke="#9bd9e9" stroke-width="5"/>
        <path d="M280 242 416 182 416 245 280 310Z" fill="#1d425d" stroke="#9bd9e9" stroke-width="5"/>
        <path d="M108 187 245 126 416 182 280 242Z" fill="#507b8b" stroke="#b1e0ec" stroke-width="5"/>
        <path d="M108 126 280 181 280 244 108 190Z" fill="#5d9fb5" fill-opacity=".37" stroke="#c2effb" stroke-width="4"/>
        <path d="M280 181 416 119 416 182 280 244Z" fill="#87bed0" fill-opacity=".34" stroke="#c2effb" stroke-width="4"/>
        <path d="M108 126 245 63 416 119 280 181Z" fill="#adbec3" stroke="#eaf7fc" stroke-width="6"/>
        <path d="M136 139V199M166 147V208M197 158V220M228 169V230M310 171V226M347 155V208M384 138V194" stroke="#d7f1fa" stroke-width="4"/>
        <circle cx="81" cy="279" r="21" fill="#4eba84"/><circle cx="448" cy="268" r="26" fill="#3e9d78"/>
      </svg>
      <strong>NEXORA • Struktur, ilmu, dan karakter</strong>
      <small>Visual 3D interaktif memerlukan WebGL. Narasi dan slide tetap dapat digunakan.</small>
    </div>`;

  function dispose() {
    tween?.kill(); tween = null;
    engine?.dispose(); engine = null;
    host.replaceChildren();
    activeScene = '';
  }

  function hide() {
    if (activeScene || engine) dispose();
    host.classList.remove('show');
    host.setAttribute('aria-hidden', 'true');
  }

  function setSlide(slide, motionEnabled = true) {
    if (!slide || slide.layout !== 'nexora') { hide(); return; }
    host.classList.add('show');
    host.setAttribute('aria-hidden', 'false');
    host.dataset.stage = slide.scene || 'opening';
    const changedStage = activeScene !== slide.scene;
    if (!engine && !failed) {
      try {
        engine = new NexoraScene(host);
        engine.setMode('explore');
        engine.setProgress(slide.scene === 'opening' ? .05 : 0);
      } catch (error) {
        console.warn('NEXORA WebGL tidak tersedia; menggunakan tampilan cadangan.', error);
        try { engine?.dispose(); } catch {}
        engine = null;
        failed = true;
        host.innerHTML = staticFallback;
      }
    }
    if (engine && changedStage) {
      tween?.kill();
      const target = Number(slide.progress ?? 1);
      const drive = { value: engine.progress };
      if (!motionEnabled || prefersLessMotion()) engine.setProgress(target);
      else {
        tween = gsap.to(drive, {
          value: target,
          duration: Math.min(3.4, Math.max(1.65, Math.abs(target - drive.value) * 5.2)),
          ease: 'power2.inOut',
          onUpdate: () => engine?.setProgress(drive.value),
          onComplete: () => { tween = null; },
        });
      }
      engine.moveCamera(slide.camera || 'hero', !motionEnabled ? .01 : 2.0);
    }
    activeScene = slide.scene || 'opening';
  }

  return { setSlide, hide, dispose };
}
