import { createParticles as createLegacyParticles } from "./particles-legacy.js";
import { createBuildingScene, ISLANDS } from "./building3d.js";

// Browser tanpa WebGL tetap melihat ilustrasi arsitektur dan kepulauan.
function createArchitectureFallback(canvas) {
  const el = document.createElement("div");
  el.id = "architecture-fallback";
  el.setAttribute("aria-hidden", "true");
  const polygons = ISLANDS.map(poly =>
    '<polygon points="' + poly.map(([lon, lat]) => ((lon - 94) * 12) + "," + ((6 - lat) * 15)).join(" ") + '"/>'
  ).join("");
  el.innerHTML =
    '<svg class="architecture-school" viewBox="0 0 600 450">' +
    '<ellipse cx="300" cy="415" rx="270" ry="29" fill="#133e30" opacity=".3"/>' +
    '<path d="M95 180L430 180L480 215L150 215Z" fill="#e8cc8f"/>' +
    '<path d="M105 180H435V370H105Z" fill="#f3e5c4" stroke="#b18851" stroke-width="8"/>' +
    '<path d="M435 180L490 210V395L435 370Z" fill="#ac8765"/>' +
    '<path d="M92 180L270 64L450 180Z" fill="#1e5940" stroke="#f2c965" stroke-width="12"/>' +
    '<path d="M350 118V46H410V118Z" fill="#f7e9c6" stroke="#e0b351" stroke-width="7"/>' +
    '<path d="M340 46L380 5L420 46Z" fill="#1c6749"/>' +
    '<path d="M105 276H435" stroke="#ac7547" stroke-width="15"/>' +
    '<g fill="#548da4" stroke="#8b653f" stroke-width="7">' +
    [140,205,270,335,400].map(x => '<rect x="' + x + '" y="201" width="36" height="53"/><rect x="' + x + '" y="303" width="36" height="49"/>').join("") +
    '</g><rect x="257" y="298" width="54" height="72" fill="#194e39" stroke="#f4cf70" stroke-width="7"/>' +
    '<path d="M84 399H502" stroke="#f4cf70" stroke-width="15"/>' +
    '<g fill="#51ac66"><circle cx="75" cy="348" r="47"/><circle cx="513" cy="345" r="48"/></g></svg>' +
    '<svg class="architecture-indonesia" viewBox="0 0 610 330"><g fill="#4bb573" stroke="#e9d389" stroke-width="2.2">' +
    polygons + '</g></svg>';
  canvas.after(el);
  const sync = () => el.classList.toggle("map-visible", !!document.querySelector("#main.deck-syubbanul-wathon.slide-seed"));
  sync();
  return { setMode: sync, setEnabled() {}, dispose() { el.remove(); } };
}

async function startRenderer(type, canvas) {
  try {
    return type === "building" ? await createBuildingScene(canvas) : await createLegacyParticles(canvas);
  } catch (error) {
    console.warn("3D renderer unavailable; static fallback enabled:", error);
    return type === "building" ? createArchitectureFallback(canvas) : { setMode() {}, setEnabled() {}, dispose() {} };
  }
}

function wantsBuilding() {
  return document.querySelector("#main")?.classList.contains("deck-syubbanul-wathon");
}

export async function createParticles(canvas) {
  let active = wantsBuilding() ? "building" : "legacy";
  let renderer = await startRenderer(active, canvas);
  let enabled = true;
  let mode = 0;
  let generation = 0;
  let disposed = false;

  async function switchRenderer(target) {
    if (target === active || disposed) return;
    const request = ++generation;
    renderer?.dispose?.();
    renderer = null;
    canvas.style.display = "block";
    active = target;
    const created = await startRenderer(target, canvas);
    if (request !== generation || disposed) {
      created.dispose?.();
      return;
    }
    renderer = created;
    renderer.setEnabled?.(enabled);
    renderer.setMode?.(mode);
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
      disposed = true;
      generation++;
      renderer?.dispose?.();
    },
  };
}
