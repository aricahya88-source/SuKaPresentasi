const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function makeBuilding(T) {
  const root = new T.Group();
  const structure = new T.Group();
  const green = new T.MeshStandardMaterial({ color: 0x173e32, roughness: 0.72, metalness: 0.06 });
  const cream = new T.MeshStandardMaterial({ color: 0xf2ead6, roughness: 0.68 });
  const wood = new T.MeshStandardMaterial({ color: 0x8d552b, roughness: 0.72 });
  const gold = new T.MeshStandardMaterial({ color: 0xffcb3d, emissive: 0x4c3000, emissiveIntensity: 0.25, roughness: 0.45 });
  const glass = new T.MeshStandardMaterial({ color: 0x8ad8d4, emissive: 0x195a5e, emissiveIntensity: 0.55, transparent: true, opacity: 0.82, roughness: 0.2 });
  const plant = new T.MeshStandardMaterial({ color: 0x5d9253, roughness: 0.85 });

  const box = (w, h, d, material, x, y, z, parent = structure) => {
    const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  const slab = box(3.9, 0.16, 2.45, cream, 0, 0.18, 0);
  box(3.55, 1.05, 2.05, cream, 0, 0.78, 0);
  box(2.8, 0.68, 1.85, wood, -0.12, 1.58, 0.02);
  box(2.7, 0.18, 2.08, gold, 0.18, 2.02, 0);
  box(3.25, 0.18, 2.1, cream, 0.15, 2.3, 0);
  box(2.22, 0.78, 1.45, cream, 0.26, 2.78, 0.02);
  box(2.42, 0.16, 1.65, green, 0.26, 3.2, 0);
  box(1.05, 0.12, 2.2, wood, -1.38, 1.98, 0.02);

  for (const x of [-1.25, -0.42, 0.45, 1.2]) box(0.45, 0.52, 0.035, glass, x, 0.95, 1.04);
  for (const x of [-0.96, -0.24, 0.5]) box(0.42, 0.42, 0.035, glass, x, 1.58, 0.96);
  for (const x of [-0.55, 0.2, 0.9]) box(0.38, 0.34, 0.035, glass, x, 2.7, 0.74);
  for (const x of [-1.55, 1.55]) box(0.12, 1.22, 0.16, green, x, 0.82, 0.92);
  for (const x of [-1.08, 1.08]) box(0.12, 1.02, 0.16, green, x, 2.55, 0.72);

  const ground = box(5.2, 0.08, 3.9, new T.MeshStandardMaterial({ color: 0x254e36, roughness: 1 }), 0, 0.02, 0, root);
  ground.receiveShadow = true;
  const foundation = box(4.45, 0.28, 2.8, green, 0, 0.16, 0, root);
  const baseGlow = box(4.2, 0.045, 2.55, gold, 0, 0.33, 0, root);
  baseGlow.material.transparent = true;
  baseGlow.material.opacity = 0.35;

  for (const x of [-2.0, 2.0]) {
    const trunk = box(0.07, 0.65, 0.07, wood, x, 0.72, -0.8, root);
    const crown = new T.Mesh(new T.SphereGeometry(0.38, 16, 10), plant);
    crown.position.set(x, 1.15, -0.8);
    root.add(crown);
    trunk.userData.plantPart = true;
    crown.userData.plantPart = true;
  }

  root.add(structure);
  root.userData.buildingParts = [foundation, baseGlow, slab, ...structure.children];
  root.userData.structure = structure;
  return root;
}

function makeIsland(T, points, x, y, scale = 1) {
  const shape = new T.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (const point of points.slice(1)) shape.lineTo(point[0], point[1]);
  shape.closePath();
  const geometry = new T.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.02, bevelSegments: 2 });
  const material = new T.MeshStandardMaterial({ color: 0x5d9253, emissive: 0x16351f, emissiveIntensity: 0.22, roughness: 0.88 });
  const island = new T.Mesh(geometry, material);
  island.position.set(x, y, 0);
  island.scale.setScalar(scale);
  return island;
}

function makeFinalScene(T) {
  const root = new T.Group();
  const map = new T.Group();
  const islands = [
    [[-0.28, 0.85], [-0.08, 1.03], [0.08, 0.9], [0.03, 0.62], [-0.16, 0.48], [-0.3, 0.6]],
    [[0.18, 0.42], [0.68, 0.38], [0.93, 0.16], [0.66, -0.03], [0.23, 0.07], [-0.04, 0.25]],
    [[-0.85, 0.12], [-0.42, 0.22], [-0.08, 0.04], [-0.16, -0.23], [-0.65, -0.26], [-0.92, -0.04]],
    [[0.24, -0.32], [0.55, -0.43], [0.43, -0.65], [0.06, -0.7], [-0.1, -0.5]],
    [[-0.56, -0.5], [-0.35, -0.58], [-0.28, -0.8], [-0.5, -0.9], [-0.69, -0.73]],
  ];
  islands.forEach((points, i) => map.add(makeIsland(T, points, (i - 2) * 0.04, (i - 2) * 0.02, 1.05)));
  const mapHalo = new T.Mesh(new T.RingGeometry(1.18, 1.22, 96), new T.MeshBasicMaterial({ color: 0xffcb3d, transparent: true, opacity: 0.38, side: T.DoubleSide }));
  mapHalo.position.z = -0.04;
  map.add(mapHalo);
  root.add(map);

  const destinations = [[-0.55, 0.18], [0.48, 0.22], [0.05, 0.74], [-0.38, -0.67], [0.46, -0.5], [-0.72, -0.06], [0.77, 0.05]];
  const seeds = [];
  const plants = [];
  const seedMaterial = new T.MeshStandardMaterial({ color: 0xffcb3d, emissive: 0x9a5d00, emissiveIntensity: 0.45, roughness: 0.4 });
  const stemMaterial = new T.MeshStandardMaterial({ color: 0x5d9253, roughness: 0.8 });
  destinations.forEach(([x, y], index) => {
    const seed = new T.Mesh(new T.SphereGeometry(0.055, 12, 8), seedMaterial);
    seed.scale.set(1, 0.55, 1);
    seed.position.set(x, 1.75 + index * 0.08, 0.12);
    root.add(seed);
    seeds.push({ mesh: seed, x, y, delay: index * 0.16 });
    const plantGroup = new T.Group();
    const stem = new T.Mesh(new T.CylinderGeometry(0.018, 0.028, 0.36, 8), stemMaterial);
    stem.position.y = 0.18;
    plantGroup.add(stem);
    for (const side of [-1, 1]) {
      const leaf = new T.Mesh(new T.SphereGeometry(0.09, 10, 6), stemMaterial);
      leaf.scale.set(1.6, 0.42, 0.55);
      leaf.position.set(side * 0.08, 0.26, 0);
      leaf.rotation.z = side * 0.48;
      plantGroup.add(leaf);
    }
    plantGroup.position.set(x, y, 0.12);
    plantGroup.scale.setScalar(0.001);
    root.add(plantGroup);
    plants.push(plantGroup);
  });
  root.userData.map = map;
  root.userData.seeds = seeds;
  root.userData.plants = plants;
  root.userData.started = 0;
  return root;
}

export async function createBuildingScene(canvas) {
  const T = await import("three");
  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(33, 1, 0.1, 100);
  camera.position.set(0.2, 1.05, 7.1);
  camera.lookAt(0, 1.25, 0);
  scene.add(new T.HemisphereLight(0xfff2cf, 0x173e32, 2.1));
  const key = new T.DirectionalLight(0xffe1a1, 3.4);
  key.position.set(-3, 5, 6);
  key.castShadow = true;
  scene.add(key);
  const rim = new T.PointLight(0x61d6c7, 8, 9);
  rim.position.set(3, 2.5, 2);
  scene.add(rim);
  const building = makeBuilding(T);
  const finalScene = makeFinalScene(T);
  scene.add(building, finalScene);
  finalScene.visible = false;
  const mouse = { x: 0, y: 0 };
  let enabled = true;
  let visible = !document.hidden;
  let raf = 0;
  let last = 0;
  let mode = 0;
  let disposed = false;

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  function isFinal() { return Boolean(document.querySelector("#main.slide-seed")); }
  function isBuildingDeck() { return Boolean(document.querySelector("#main.deck-syubbanul-wathon")); }
  function animateFinal(now) {
    if (!finalScene.userData.started) finalScene.userData.started = now;
    const elapsed = (now - finalScene.userData.started) / 1000;
    finalScene.rotation.y = Math.sin(now * 0.00022) * 0.08 + mouse.x * 0.12;
    finalScene.position.y = Math.sin(now * 0.0008) * 0.035;
    for (const item of finalScene.userData.seeds) {
      const progress = clamp((elapsed - item.delay) / 2.4, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      item.mesh.position.y = 1.75 + item.delay * 0.1 - eased * (1.72 - item.y);
      item.mesh.rotation.z = elapsed * 2 + item.delay;
      item.mesh.visible = progress < 1;
    }
    for (const [index, plant] of finalScene.userData.plants.entries()) {
      const growth = clamp((elapsed - 2.2 - index * 0.14) / 2.8, 0, 1);
      const eased = 1 - Math.pow(1 - growth, 3);
      plant.scale.setScalar(Math.max(0.001, eased));
    }
  }
  function animateBuilding(now) {
    finalScene.visible = false;
    building.visible = true;
    const stage = clamp((mode + 1) / 10, 0.35, 1);
    const parts = building.userData.buildingParts;
    parts.forEach((part, index) => {
      const reveal = clamp(stage * 1.45 - index / Math.max(parts.length, 1), 0, 1);
      part.scale.y = Math.max(0.04, reveal);
      part.position.y += (part.userData.baseY ?? part.position.y) * 0;
      part.material.transparent = true;
      part.material.opacity = 0.28 + reveal * 0.72;
    });
    building.rotation.y = mouse.x * 0.16 + Math.sin(now * 0.00025) * 0.04;
    building.rotation.x = mouse.y * 0.06;
    building.position.y = Math.sin(now * 0.00075) * 0.035;
  }
  function paint(now) {
    if (!isBuildingDeck()) return;
    const final = isFinal();
    if (final) {
      if (!finalScene.visible) finalScene.userData.started = now;
      building.visible = false;
      finalScene.visible = true;
      animateFinal(now);
      camera.position.z += (6.4 - camera.position.z) * 0.035;
      camera.position.y += (0.95 - camera.position.y) * 0.035;
    } else {
      animateBuilding(now);
      camera.position.z += (7.1 - camera.position.z) * 0.035;
      camera.position.y += (1.05 - camera.position.y) * 0.035;
    }
    camera.lookAt(0, final ? 0.35 : 1.25, 0);
    renderer.render(scene, camera);
  }
  function tick(now) {
    raf = 0;
    if (disposed || !visible) return;
    if (now - last < 24) { raf = requestAnimationFrame(tick); return; }
    last = now;
    paint(enabled ? now : last || now);
    raf = requestAnimationFrame(tick);
  }
  function requestTick() { if (!raf && visible && !disposed) raf = requestAnimationFrame(tick); }
  const move = (event) => { mouse.x = event.clientX / innerWidth - 0.5; mouse.y = event.clientY / innerHeight - 0.5; };
  const visibility = () => { visible = !document.hidden; if (visible) requestTick(); else cancelAnimationFrame(raf); };
  addEventListener("resize", resize);
  addEventListener("pointermove", move, { passive: true });
  document.addEventListener("visibilitychange", visibility);
  resize();
  requestTick();
  return {
    setMode(next) { mode = Number.isInteger(next) ? next : 0; requestTick(); },
    setEnabled(value) { enabled = Boolean(value); requestTick(); },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", visibility);
      renderer.dispose();
    },
  };
}
