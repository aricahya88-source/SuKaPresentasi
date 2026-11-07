import { createParticles as createLegacyParticles } from "./particles-legacy.js";
import { createBuildingScene } from "./building3d.js";

function wantsBuilding() {
  return document.querySelector("#main")?.classList.contains("deck-syubbanul-wathon");
}

export async function createParticles(canvas) {
  let active = wantsBuilding() ? "building" : "legacy";
  let renderer = active === "building"
    ? await createBuildingScene(canvas)
    : await createLegacyParticles(canvas);
  let enabled = true;
  let mode = 0;
  let switching = null;

  async function switchRenderer(target) {
    if (target === active) return;
    switching?.catch(() => {});
    switching = (async () => {
      renderer?.dispose?.();
      canvas.style.display = "block";
      active = target;
      renderer = target === "building"
        ? await createBuildingScene(canvas)
        : await createLegacyParticles(canvas);
      renderer.setEnabled?.(enabled);
      renderer.setMode?.(mode);
    })();
    await switching;
  }

  return {
    async setMode(next) {
      mode = Number.isInteger(next) ? next : 0;
      await switchRenderer(wantsBuilding() ? "building" : "legacy");
      renderer?.setMode?.(mode);
    },
    setEnabled(value) {
      enabled = Boolean(value);
      renderer?.setEnabled?.(enabled);
    },
    dispose() {
      switching?.catch(() => {});
      renderer?.dispose?.();
    },
  };
}
