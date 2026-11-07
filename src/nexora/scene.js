import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gsap } from 'gsap';
import { createBuilding } from './building.js';

const clamp = (n) => Math.min(1, Math.max(0, n));
const smooth = (t) => { const n = clamp(t); return n * n * (3 - 2 * n); };

export const CAMERA_VIEWS = {
  hero: { position: [31, 23, 31], target: [0, 4.15, 0] },
  front: { position: [0, 11.6, 38], target: [0, 4.2, 0] },
  top: { position: [0, 36, .5], target: [0, 3.7, 0] },
  atrium: { position: [13, 13, 15], target: [0, 3.2, 1.2] },
  structure: { position: [-25, 16, 24], target: [0, 3.0, 0] },
  green: { position: [23, 14, -27], target: [0, 5.0, 0] },
};

export class NexoraScene {
  constructor(container, onSelect = () => {}) {
    this.container = container;
    this.onSelect = onSelect;
    this.mode = 'presentation';
    this.progress = 1;
    this.explode = 0;
    this.roofLift = 0;
    this.floorLift = 0;
    this.xray = 0;
    this.selected = null;
    this.activeTweens = new Set();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x10263a);
    this.scene.fog = new THREE.FogExp2(0x10263a, 0.0084);
    this.camera = new THREE.PerspectiveCamera(37, 1, 0.1, 220);
    this.camera.position.set(...CAMERA_VIEWS.hero.position);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1.5 : 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.55;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.setAttribute('aria-label', 'Kanvas tiga dimensi bangunan NEXORA');
    this.container.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.HemisphereLight(0xc5e5ff, 0x3d5362, 2.75));
    const sun = new THREE.DirectionalLight(0xfff1d9, 3.3);
    sun.position.set(-22, 36, 22);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -38;
    sun.shadow.camera.right = 38;
    sun.shadow.camera.top = 38;
    sun.shadow.camera.bottom = -38;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 100;
    sun.shadow.normalBias = .025;
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0x57a7f2, 2.0);
    fill.position.set(24, 16, -21);
    this.scene.add(fill);
    const centerGlow = new THREE.PointLight(0x9de7f8, 30, 24, 2);
    centerGlow.position.set(0, 5, 2);
    this.scene.add(centerGlow);

    const baseGround = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ color: 0x132c41, roughness: 1 }));
    baseGround.rotation.x = -Math.PI / 2;
    baseGround.position.y = -0.91;
    baseGround.receiveShadow = true;
    this.scene.add(baseGround);
    const grid = new THREE.GridHelper(145, 55, 0x365a73, 0x26465f);
    grid.position.y = -.87;
    const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMaterials.forEach(material => { material.transparent = true; material.opacity = 0.32; });
    this.scene.add(grid);

    this.model = createBuilding();
    this.scene.add(this.model.root);
    this.configureXrayMaterials();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(...CAMERA_VIEWS.hero.target);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = .075;
    this.controls.minDistance = 12;
    this.controls.maxDistance = 94;
    this.controls.maxPolarAngle = Math.PI * .49;
    this.controls.enablePan = true;
    this.controls.enabled = false;
    this.controls.update();
    this.controls.addEventListener('start', () => this.killCameraTween());

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.downPointer = null;
    this.renderer.domElement.addEventListener('pointerdown', ev => { this.downPointer = { x: ev.clientX, y: ev.clientY }; });
    this.renderer.domElement.addEventListener('pointerup', ev => {
      if (!this.downPointer || this.mode === 'presentation') return;
      if (Math.hypot(ev.clientX - this.downPointer.x, ev.clientY - this.downPointer.y) < 5) this.pick(ev);
    });
    this.selectionHelper = null;
    this.cameraTween = null;
    this.applyTransforms();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
    this.tick = this.tick.bind(this);
    this.requestId = requestAnimationFrame(this.tick);
  }

  configureXrayMaterials() {
    this.xrayMaterials = [];
    for (const key of ['walls', 'facade', 'louvers']) {
      const lookup = new Map();
      this.model.parts[key].group.traverse(node => {
        if (!node.isMesh) return;
        if (!lookup.has(node.material)) {
          const cloned = node.material.clone();
          cloned.userData.defaultOpacity = node.material.opacity;
          lookup.set(node.material, cloned);
          this.xrayMaterials.push(cloned);
        }
        node.material = lookup.get(node.material);
      });
    }
  }

  resize() {
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.camera.aspect = width / height;
    this.camera.fov = width < 700 ? 46 : 37;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  tick() {
    this.requestId = requestAnimationFrame(this.tick);
    this.controls.update();
    if (this.selectionHelper) this.selectionHelper.update();
    this.renderer.render(this.scene, this.camera);
  }

  setMode(mode) {
    this.mode = mode;
    this.controls.enabled = mode !== 'presentation';
    this.clearSelection();
  }

  applyTransforms() {
    for (const part of Object.values(this.model.parts)) {
      const t = smooth((this.progress - part.start) / Math.max(.0001, part.end - part.start));
      part.group.visible = t > .0005;
      part.group.position.copy(part.basePosition).addScaledVector(part.offset, (1 - t));
      if (part.id === 'columns') {
        part.group.scale.set(1, Math.max(.001, t), 1);
        part.group.position.y -= 0.05 * (1 - t);
      } else if (part.id === 'landscape' || part.id === 'interior') {
        const s = Math.max(.001, t);
        part.group.scale.setScalar(s);
      } else {
        part.group.scale.set(1, 1, 1);
      }
      part.group.position.addScaledVector(part.offset, this.explode * t);
      if (part.id === 'roof') part.group.position.y += this.roofLift * 6.4 * t;
      if (part.id === 'solar') part.group.position.y += this.roofLift * 6.4 * t;
      if (part.id === 'floor2') part.group.position.y += this.floorLift * 3.6 * t;
    }
    for (const material of this.xrayMaterials) {
      const base = material.userData.defaultOpacity ?? 1;
      material.opacity = base * (1 - .85 * this.xray);
      material.transparent = this.xray > .005 || base < 1;
      material.depthWrite = this.xray < .005 && base >= 1;
      material.needsUpdate = true;
    }
  }

  setProgress(value) { this.progress = clamp(value); this.applyTransforms(); }

  tweenProperty(name, to, duration = .9) {
    const existing = this[name + 'Tween'];
    if (existing) existing.kill();
    const tween = gsap.to(this, { [name]: to, duration, ease: 'power2.inOut', onUpdate: () => this.applyTransforms() });
    this[name + 'Tween'] = tween;
    return tween;
  }

  toggleExplode(force) { return this.tweenProperty('explode', force ?? (this.explode > .5 ? 0 : 1), 1.25); }
  toggleRoof(force) { return this.tweenProperty('roofLift', force ?? (this.roofLift > .5 ? 0 : 1), .95); }
  toggleFloor(force) { return this.tweenProperty('floorLift', force ?? (this.floorLift > .5 ? 0 : 1), 1); }
  toggleXray(force) { return this.tweenProperty('xray', force ?? (this.xray > .5 ? 0 : 1), .75); }

  resetModel() {
    for (const key of ['explode', 'roofLift', 'floorLift', 'xray']) {
      if (this[key + 'Tween']) this[key + 'Tween'].kill();
      this[key] = 0;
    }
    this.setProgress(1);
    this.clearSelection();
  }

  killCameraTween() {
    if (this.cameraTween) { this.cameraTween.kill(); this.cameraTween = null; }
    if (this.targetTween) { this.targetTween.kill(); this.targetTween = null; }
  }

  moveCamera(view, duration = 1.5) {
    const preset = typeof view === 'string' ? CAMERA_VIEWS[view] : view;
    if (!preset) return;
    const aspect = this.container.clientWidth / Math.max(1, this.container.clientHeight);
    const distanceFactor = aspect < 1.3 ? Math.min(1.6, 1.3 / aspect) : 1;
    const target = new THREE.Vector3(...preset.target);
    const position = new THREE.Vector3(...preset.position).sub(target).multiplyScalar(distanceFactor).add(target);
    this.killCameraTween();
    this.cameraTween = gsap.to(this.camera.position, {
      x: position.x, y: position.y, z: position.z,
      duration, ease: 'power3.inOut', onUpdate: () => this.controls.update(),
    });
    this.targetTween = gsap.to(this.controls.target, {
      x: preset.target[0], y: preset.target[1], z: preset.target[2],
      duration, ease: 'power3.inOut', onUpdate: () => this.controls.update(),
    });
  }

  pick(event) {
    const bounds = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    this.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObject(this.model.root, true);
    const hit = hits.find(item => item.object.userData.part && item.object.parent?.visible);
    if (!hit) { this.clearSelection(); return; }
    this.selectPart(hit.object.userData.part);
  }

  selectPart(key) {
    const part = this.model.parts[key];
    if (!part) return;
    this.clearSelection(false);
    this.selected = key;
    this.selectionHelper = new THREE.BoxHelper(part.group, 0x83d1ff);
    this.selectionHelper.material.depthTest = false;
    this.selectionHelper.material.transparent = true;
    this.selectionHelper.material.opacity = .82;
    this.scene.add(this.selectionHelper);
    this.onSelect(part);
  }

  clearSelection(notify = true) {
    if (this.selectionHelper) {
      this.scene.remove(this.selectionHelper);
      this.selectionHelper.geometry.dispose();
      this.selectionHelper.material.dispose();
      this.selectionHelper = null;
    }
    this.selected = null;
    if (notify) this.onSelect(null);
  }

  diagnostics() {
    const counts = {};
    for (const [key, part] of Object.entries(this.model.parts)) counts[key] = part.group.children.length;
    return {
      meshCount: this.model.meshCount, assemblyCount: Object.keys(this.model.parts).length,
      componentCounts: counts, progress: this.progress, mode: this.mode,
      roofLift: this.roofLift, floorLift: this.floorLift, explode: this.explode, xray: this.xray,
      canvasSize: [this.renderer.domElement.width, this.renderer.domElement.height],
      webgl: this.renderer.capabilities.isWebGL2,
    };
  }

  dispose() {
    cancelAnimationFrame(this.requestId);
    this.resizeObserver.disconnect();
    this.killCameraTween();
    this.controls.dispose();
    this.renderer.dispose();
  }
}
