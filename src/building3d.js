import * as T from "three";
import { gsap } from "gsap";

// Model dibentuk langsung di Three.js agar tidak bergantung pada berkas GLB/CDN.
const clamp = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, t) => a + (b - a) * t;

function makeSchool() {
  const root = new T.Group();
  const sections = Object.fromEntries(["foundation", "ground", "upper", "roof", "tower", "garden"].map(k => [k, new T.Group()]));
  const mat = {
    ivory: new T.MeshStandardMaterial({ color: 0xf5ead0, roughness: 0.78 }),
    white: new T.MeshStandardMaterial({ color: 0xfff5df, roughness: 0.7 }),
    wood: new T.MeshStandardMaterial({ color: 0xa76b38, roughness: 0.79 }),
    gold: new T.MeshStandardMaterial({ color: 0xffd36e, roughness: 0.36, metalness: 0.28, emissive: 0x684a19, emissiveIntensity: 0.24 }),
    green: new T.MeshStandardMaterial({ color: 0x194c39, roughness: 0.7 }),
    grass: new T.MeshStandardMaterial({ color: 0x4fa568, roughness: 1 }),
    dark: new T.MeshStandardMaterial({ color: 0x244a36, roughness: 0.98 }),
    glass: new T.MeshStandardMaterial({ color: 0x6ca6b4, roughness: 0.22, metalness: 0.18, emissive: 0x185160, emissiveIntensity: 0.35 }),
  };
  function box(g, w, h, d, material, x, y, z) {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
    return m;
  }
  const { foundation, ground, upper, roof, tower, garden } = sections;
  box(foundation, 7.2, 0.16, 4.3, mat.dark, 0, -0.10, 0);
  box(foundation, 6.4, 0.27, 3.4, mat.green, 0, 0.13, 0);
  box(foundation, 6.23, 0.07, 3.26, mat.gold, 0, 0.29, 0);
  box(foundation, 1.15, 0.06, 2.8, mat.ivory, 0, 0.015, 2.25);
  for (let i = 0; i < 3; i++) box(foundation, 1.4 - i * 0.14, 0.08, 0.29, mat.ivory, 0, 0.22 - i * 0.076, 1.8 + i * 0.29);

  box(ground, 5.72, 1.18, 2.66, mat.ivory, 0, 0.96, -0.16);
  box(ground, 5.9, 0.12, 2.85, mat.wood, 0, 1.58, -0.12);
  box(ground, 5.9, 0.09, 0.87, mat.white, 0, 0.38, 1.17);
  box(ground, 5.9, 0.09, 0.87, mat.green, 0, 1.55, 1.17);
  for (const x of [-2.45, -1.64, -0.83, 0.83, 1.64, 2.45]) {
    const pillar = new T.Mesh(new T.CylinderGeometry(0.075, 0.09, 1.16, 10), mat.white);
    pillar.position.set(x, 1.01, 1.43);
    pillar.castShadow = true;
    ground.add(pillar);
    box(ground, 0.25, 0.07, 0.25, mat.gold, x, 1.59, 1.43);
    box(ground, 0.5, 0.66, 0.064, mat.wood, x, 1.02, 1.19);
    box(ground, 0.42, 0.58, 0.07, mat.glass, x, 1.02, 1.23);
    box(ground, 0.034, 0.58, 0.075, mat.gold, x, 1.02, 1.28);
  }
  box(ground, 0.72, 0.96, 0.072, mat.green, 0, 0.91, 1.22);
  box(ground, 0.065, 0.96, 0.08, mat.gold, 0, 0.91, 1.30);

  box(upper, 5.94, 0.17, 2.98, mat.white, 0, 1.72, -0.1);
  box(upper, 5.55, 1.02, 2.48, mat.ivory, 0, 2.30, -0.16);
  box(upper, 5.9, 0.15, 0.80, mat.wood, 0, 1.82, 1.23);
  box(upper, 5.92, 0.095, 0.10, mat.gold, 0, 2.00, 1.62);
  for (const x of [-2.32, -1.55, -0.78, 0, 0.78, 1.55, 2.32]) {
    box(upper, 0.075, 0.29, 0.08, mat.white, x, 1.96, 1.61);
  }
  for (const x of [-2.16, -1.3, -0.44, 0.44, 1.3, 2.16]) {
    box(upper, 0.52, 0.63, 0.07, mat.wood, x, 2.34, 1.12);
    box(upper, 0.43, 0.55, 0.078, mat.glass, x, 2.34, 1.17);
    box(upper, 0.035, 0.55, 0.08, mat.gold, x, 2.34, 1.23);
  }
  box(upper, 6, 0.12, 2.97, mat.gold, 0, 2.89, -0.13);

  // Atap pelana 3D; dua bidang panjang bertemu pada bubungan.
  const roofShape = new T.BufferGeometry();
  roofShape.setAttribute("position", new T.BufferAttribute(new Float32Array([
    -3.18,3.02,1.53, 3.18,3.02,1.53, -3.18,3.73,-0.10,
     3.18,3.02,1.53, 3.18,3.73,-0.10, -3.18,3.73,-0.10,
    -3.18,3.02,-1.75, -3.18,3.73,-0.10, 3.18,3.02,-1.75,
     3.18,3.02,-1.75, -3.18,3.73,-0.10, 3.18,3.73,-0.10,
  ]), 3));
  roofShape.computeVertexNormals();
  const roofMesh = new T.Mesh(roofShape, new T.MeshStandardMaterial({ color: 0x225b40, side: T.DoubleSide, metalness: 0.12, roughness: 0.68 }));
  roofMesh.castShadow = true;
  roof.add(roofMesh);
  box(roof, 6.45, 0.09, 0.11, mat.gold, 0, 3.74, -0.1);
  box(roof, 6.45, 0.09, 0.12, mat.gold, 0, 3.02, 1.53);
  box(roof, 6.45, 0.09, 0.12, mat.gold, 0, 3.02, -1.75);

  box(tower, 0.87, 1.66, 0.92, mat.white, 1.72, 3.55, -0.21);
  box(tower, 1.05, 0.12, 1.08, mat.gold, 1.72, 3.93, -0.21);
  for (const x of [1.49, 1.95]) box(tower, 0.19, 0.55, 0.07, mat.glass, x, 3.53, 0.27);
  const towerCap = new T.Mesh(new T.ConeGeometry(0.74, 0.84, 4), mat.green);
  towerCap.position.set(1.72, 4.54, -0.21);
  towerCap.rotation.y = Math.PI / 4;
  towerCap.castShadow = true;
  tower.add(towerCap);
  const ball = new T.Mesh(new T.SphereGeometry(0.12, 12, 10), mat.gold);
  ball.position.set(1.72, 5.05, -0.21);
  tower.add(ball);
  for (const x of [-3.13, -2.91, 2.91, 3.13]) {
    const z = x < 0 ? -1.39 : 1.11;
    box(garden, 0.08, 0.65, 0.08, mat.wood, x, 0.55, z);
    const leaves = new T.Mesh(new T.IcosahedronGeometry(0.4, 1), x < 0 ? mat.grass : mat.green);
    leaves.position.set(x, 1.16, z);
    leaves.castShadow = true;
    garden.add(leaves);
  }
  Object.values(sections).forEach(g => root.add(g));
  root.userData.sections = sections;
  root.userData.mat = mat;
  return root;
}

// Peta kepulauan Indonesia: bentuk pulau terpisah, bukan titik/lingkaran placeholder.
// Koordinat diurutkan mengikuti letak geografis (longitud, latitud), disederhanakan untuk ilustrasi.
export const ISLANDS = [
  [[95.2,5.6],[97.3,5.2],[99.3,3.7],[100.7,2],[102.2,0.8],[103.8,-1.5],[104.8,-2.6],[106.1,-5.7],[104.4,-5.8],[102.6,-3.9],[100.2,-1.6],[98.3,0.2],[96.8,2.5],[95,4]],
  [[105.2,-5.8],[106.9,-6.1],[109,-6.7],[111.2,-6.6],[113.6,-7.4],[114.6,-8.2],[113.1,-8.6],[111,-8.3],[108.5,-7.7],[106,-7.1]],
  [[108.8,1.4],[110.1,2.8],[112,3.4],[114.8,4],[117.4,3],[118.9,1.2],[117.6,-0.5],[116.7,-2.9],[114,-3.6],[111.5,-2.8],[109.7,-1.8]],
  [[119.1,1.6],[120.4,1.8],[121.7,1.2],[123,0.6],[124.7,1.5],[125.3,1.3],[124.1,-0.4],[122.6,-0.6],[121.2,-1.3],[122,-3.1],[121.2,-4.8],[119.6,-5.5],[120,-3.5],[119,-2.5],[118.7,-3.6],[118,-2.3],[119.2,-1.2],[120.4,-0.7],[119,0.1]],
  [[130.7,-1.4],[132.1,-0.5],[133.4,-0.6],[134.5,-1.8],[135.1,-3.1],[137.4,-2.3],[140.9,-2.5],[141,-8.9],[138.1,-8],[136.3,-6.6],[134,-5.5],[132.2,-4.4],[130.9,-2.8]],
  [[115,-8],[115.9,-8.1],[115.5,-8.8],[114.9,-8.6]],
  [[116.1,-8.2],[117.6,-8.2],[119.4,-8.5],[119,-9],[117.6,-8.9],[116.1,-8.8]],
  [[119.7,-8.2],[121.1,-8.4],[122.9,-8.6],[123.2,-8.9],[121,-8.9],[119.6,-8.7]],
  [[118.8,-9.4],[120.8,-9.3],[120.5,-10.1],[119,-10.2]],
  [[123.4,-9],[125.1,-8.9],[127.3,-9.1],[126.6,-9.8],[124.5,-9.8],[123.5,-9.4]],
  [[126.1,1.6],[127.3,1.5],[128.2,0.8],[128,-1.5],[127.3,-2.3],[126.5,-0.6]],
  [[125,-3],[126.9,-3.1],[128.6,-3.4],[130.5,-3.2],[130.2,-3.9],[127.5,-4.1],[125.3,-3.6]],
  [[125.5,-3.1],[127.4,-3.2],[127,-3.8],[125.4,-3.7]],
  [[129.5,-5.5],[131.5,-5.6],[131,-6.1],[129.8,-6]],
  [[130.1,-7],[132.1,-7.3],[131.8,-8.2],[130.3,-8.1]],
];
const xCoord = lon => (lon - 118) * 0.205;
const zCoord = lat => -(lat + 2.2) * 0.205;
function inside([x,y], polygon) {
  let yes = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) yes = !yes;
  }
  return yes;
}

function makeIndonesia() {
  const root = new T.Group();
  const leafColors = [0x91d46f, 0x43b477, 0xbad66b, 0x268f5b].map(color => new T.MeshStandardMaterial({ color, roughness: 0.9 }));
  const landTop = new T.MeshStandardMaterial({ color: 0x4caa71, roughness: 0.86, emissive: 0x102d1d, emissiveIntensity: 0.1 });
  const landSide = new T.MeshStandardMaterial({ color: 0xb29d67, roughness: 0.89 });
  const wood = new T.MeshStandardMaterial({ color: 0x2a7851, roughness: 0.94 });
  const seedMat = new T.MeshStandardMaterial({ color: 0xffdc73, emissive: 0xbd7515, emissiveIntensity: 0.7, roughness: 0.25 });
  const sea = new T.Mesh(new T.PlaneGeometry(11.6, 5.25), new T.MeshStandardMaterial({ color: 0x124842, transparent: true, opacity: 0.22, roughness: 0.78, side: T.DoubleSide }));
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -0.05;
  root.add(sea);
  const seeds = [], plants = [];
  let state = 73421;
  const rand = () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
  const targets = [];
  ISLANDS.forEach((polygon, island) => {
    const shape = new T.Shape();
    shape.moveTo(xCoord(polygon[0][0]), -zCoord(polygon[0][1]));
    polygon.slice(1).forEach(p => shape.lineTo(xCoord(p[0]), -zCoord(p[1])));
    shape.closePath();
    const geo = new T.ExtrudeGeometry(shape, { depth: 0.09, bevelEnabled: true, bevelSize: 0.018, bevelThickness: 0.026, bevelSegments: 1 });
    geo.rotateX(-Math.PI / 2);
    const land = new T.Mesh(geo, [landTop, landSide]);
    land.position.y = 0.07;
    land.receiveShadow = true;
    land.castShadow = true;
    root.add(land);
    const minX = Math.min(...polygon.map(p => p[0])), maxX = Math.max(...polygon.map(p => p[0]));
    const minY = Math.min(...polygon.map(p => p[1])), maxY = Math.max(...polygon.map(p => p[1]));
    const amount = island < 5 ? [12, 10, 12, 11, 16][island] : island < 10 ? 2 : 1;
    for (let attempt = 0, placed = 0; attempt < 200 && placed < amount; attempt++) {
      const candidate = [lerp(minX,maxX,rand()),lerp(minY,maxY,rand())];
      if (inside(candidate, polygon)) { targets.push([xCoord(candidate[0]), zCoord(candidate[1])]); placed++; }
    }
  });
  targets.forEach(([x,z], index) => {
    const seed = new T.Mesh(new T.SphereGeometry(0.044, 9, 7), seedMat);
    seed.scale.set(1,0.66,1);
    root.add(seed);
    const plant = new T.Group();
    const height = 0.28 + rand() * 0.46;
    const trunk = new T.Mesh(new T.CylinderGeometry(0.017, 0.026, height, 7), wood);
    trunk.position.y = height / 2;
    plant.add(trunk);
    const canopy = new T.Mesh(new T.IcosahedronGeometry(0.12 + rand() * 0.1, 1), leafColors[index % 4]);
    canopy.position.y = height * 0.92;
    canopy.scale.set(1.13,1.10,0.92);
    plant.add(canopy);
    for (const side of [-1,1]) {
      const leaf = new T.Mesh(new T.SphereGeometry(0.079, 8, 6), leafColors[(index+1)%4]);
      leaf.scale.set(1.25,0.35,0.6);
      leaf.position.set(side*0.095,height*0.6,0);
      leaf.rotation.z = side*0.38;
      plant.add(leaf);
    }
    plant.position.set(x,0.245,z);
    plant.scale.setScalar(0.001);
    root.add(plant);
    const delay = index * 0.052;
    seeds.push({ mesh: seed, x, z, delay });
    plants.push({ group: plant, delay, phase: rand()*Math.PI*2 });
  });
  root.userData.seeds = seeds;
  root.userData.plants = plants;
  return root;
}

export async function createBuildingScene(canvas) {
  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "default" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(36, 1, 0.1, 80);
  scene.add(new T.HemisphereLight(0xfff2d2, 0x1b4936, 2.5));
  const sun = new T.DirectionalLight(0xffe8b0, 3.5);
  sun.position.set(-4,9,7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8});
  scene.add(sun);
  const rim = new T.PointLight(0x6fe8b6,12,18,2);
  rim.position.set(5,4,4);
  scene.add(rim);
  const school = makeSchool();
  const indonesia = makeIndonesia();
  scene.add(school,indonesia);
  indonesia.visible = false;

  const pose = { turn:-0.28, distance:13.1, elevation:4.1, scale:0.96 };
  const poses = [
    [-0.30,13.4,4.0,0.96],[0.24,13.0,4.0,0.99],[-0.54,13.2,4.4,0.96],
    [0,12.7,3.8,1.04],[0.38,13.0,4.3,0.99],[-0.40,12.9,4.4,0.98],
    [0.28,13.0,3.8,1.02],[-0.12,12.7,4.1,1.03],[0.52,13.1,4.1,0.99],
    [-0.46,12.9,4.0,0.99],[0.15,13.0,4.2,1.02],[-0.12,12.5,4.8,1.04],
    [0.48,13.1,4.2,1.0],[-0.33,12.9,4.0,0.99],[0.14,12.7,3.9,1.04],
  ];
  const pointer = { x:0,y:0 };
  let slide = 0, running = true, disposed = false, frameId = 0, previousTime = 0, virtualTime = 0;
  let lastIsFinal = false, startedFinalAt = null;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1,Math.round(rect.width)), height = Math.max(1,Math.round(rect.height));
    renderer.setSize(width,height,false);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
  }
  function setMode(mode) {
    slide = Number.isInteger(mode) ? mode : 0;
    const target = poses[slide % poses.length];
    gsap.killTweensOf(pose);
    gsap.to(pose, { turn:target[0], distance:target[1], elevation:target[2], scale:target[3], duration:1.1, ease:"power3.inOut" });
    const focus = slide % 5;
    const offsets = { foundation:0, ground:focus === 1 ? 0.18 : 0, upper:focus === 2 ? 0.32 : 0, roof:focus === 3 ? 0.44 : 0, tower:focus === 4 ? 0.28 : 0, garden:0 };
    for (const [name,group] of Object.entries(school.userData.sections)) {
      gsap.killTweensOf(group.position);
      gsap.to(group.position,{ y:offsets[name],duration:0.95,ease:"back.out(1.4)" });
    }
    resize();
  }
  function render(time) {
    const isFinal = !!document.querySelector("#main.deck-syubbanul-wathon.slide-seed");
    if (isFinal !== lastIsFinal) {
      lastIsFinal = isFinal;
      startedFinalAt = isFinal ? time : null;
      resize();
    }
    indonesia.visible = isFinal;
    school.visible = !isFinal;
    if (isFinal) {
      const elapsed = Math.max(0,(time - (startedFinalAt ?? time))/1000);
      const appear = clamp(elapsed / 1.7);
      indonesia.rotation.y = Math.sin(time*0.00023)*0.025 + pointer.x*0.035;
      indonesia.position.y = 0.04 + Math.sin(time*0.00065)*0.023;
      const mobile = canvas.clientWidth < 700;
      indonesia.scale.setScalar(lerp(mobile ? 0.68 : 1.0, mobile ? 0.9 : 1.32, 1-(1-appear)**3));
      for (const item of indonesia.userData.seeds) {
        const fall = clamp((elapsed-0.60-item.delay)/1.55);
        const ease = fall*fall*(3-2*fall);
        item.mesh.position.set(item.x,lerp(3.2+(item.delay%0.6),0.25,ease),item.z);
        item.mesh.rotation.z = elapsed*2.4+item.delay;
        item.mesh.visible = fall<0.98 && elapsed>=item.delay;
      }
      for (const item of indonesia.userData.plants) {
        const growth = clamp((elapsed-2.0-item.delay)/2.3);
        item.group.scale.setScalar(Math.max(0.001,1-(1-growth)**3));
        item.group.rotation.z = growth>0.4 ? Math.sin(time*0.0014+item.phase)*0.04*growth : 0;
      }
      camera.position.set(0,(mobile ? 9.8 : 8.1)+pointer.y*0.35,mobile ? 11.7 : 9.5);
      camera.lookAt(0,0.08,0);
      camera.fov=34;
    } else {
      school.rotation.y = pose.turn + Math.sin(time*0.00032)*0.036 + pointer.x*0.17;
      school.rotation.x = pointer.y*0.034;
      school.position.y = Math.sin(time*0.00068)*0.036;
      school.scale.setScalar(pose.scale);
      school.userData.mat.glass.emissiveIntensity = 0.28+Math.sin(time*0.0018)*0.08;
      camera.position.set(0.1,pose.elevation,pose.distance);
      camera.lookAt(0,2.08,0);
      camera.fov=36;
    }
    camera.updateProjectionMatrix();
    renderer.render(scene,camera);
  }
  function tick(now) {
    frameId = 0;
    if (disposed || document.hidden) return;
    const delta = previousTime ? Math.min(65,now-previousTime) : 16;
    previousTime = now;
    if (running) virtualTime+=delta;
    render(virtualTime);
    frameId=requestAnimationFrame(tick);
  }
  const onPointer = e => { pointer.x=(e.clientX/window.innerWidth-0.5)*2; pointer.y=(e.clientY/window.innerHeight-0.5)*2; };
  const onVisibility = () => {
    previousTime = 0;
    if (document.hidden && frameId) { cancelAnimationFrame(frameId); frameId=0; }
    else if (!document.hidden && !frameId && !disposed) frameId=requestAnimationFrame(tick);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  window.addEventListener("resize",resize);
  window.addEventListener("pointermove",onPointer,{passive:true});
  document.addEventListener("visibilitychange",onVisibility);
  resize();
  setMode(0);
  frameId=requestAnimationFrame(tick);
  return {
    setMode,
    setEnabled(value) { running=Boolean(value); previousTime=0; },
    dispose() {
      disposed=true;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("resize",resize);
      window.removeEventListener("pointermove",onPointer);
      document.removeEventListener("visibilitychange",onVisibility);
      gsap.killTweensOf(pose);
      Object.values(school.userData.sections).forEach(g => gsap.killTweensOf(g.position));
      const geometries=new Set(),materials=new Set();
      scene.traverse(o => {
        if(o.geometry) geometries.add(o.geometry);
        if(o.material) (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));
      });
      geometries.forEach(g=>g.dispose());
      materials.forEach(m=>m.dispose());
      renderer.dispose();
    },
  };
}
