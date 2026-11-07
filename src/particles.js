import { createParticles as createLegacyParticles } from "./particles-legacy.js";
import { createBuildingScene } from "./building3d.js";

export async function createParticles(canvas) {
  if (document.querySelector("#main")?.classList.contains("deck-syubbanul-wathon")) {
    return createBuildingScene(canvas);
  }
  return createLegacyParticles(canvas);
}
