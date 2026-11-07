import * as THREE from 'three';

// A procedural, fully 3D architectural model. Every major assembly is a distinct
// Group with its own transform; no rendered picture or placeholder plane is used.
export function createBuilding() {
  const root = new THREE.Group();
  root.name = 'NEXORA_LEARNING_CENTER';
  const materials = {
    base: new THREE.MeshStandardMaterial({ color: 0x758a97, roughness: 0.82, metalness: 0.08 }),
    concrete: new THREE.MeshStandardMaterial({ color: 0xc5d0d1, roughness: 0.77 }),
    concreteLight: new THREE.MeshStandardMaterial({ color: 0xe0e6e3, roughness: 0.72 }),
    trim: new THREE.MeshStandardMaterial({ color: 0x354a58, metalness: 0.45, roughness: 0.47 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x182b3b, metalness: 0.4, roughness: 0.38 }),
    roof: new THREE.MeshStandardMaterial({ color: 0x7b92a0, roughness: 0.69, metalness: 0.14 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x90c3d2, metalness: 0.12, roughness: 0.13, transparent: true, opacity: 0.60, depthWrite: false, side: THREE.DoubleSide, clearcoat: 0.7 }),
    glassSide: new THREE.MeshPhysicalMaterial({ color: 0x6294af, metalness: 0.14, roughness: 0.17, transparent: true, opacity: 0.57, depthWrite: false, side: THREE.DoubleSide, clearcoat: 0.8 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x9f704c, metalness: 0.0, roughness: 0.73 }),
    woodLight: new THREE.MeshStandardMaterial({ color: 0xbd916a, roughness: 0.68 }),
    soil: new THREE.MeshStandardMaterial({ color: 0x475c4d, roughness: 1 }),
    green: new THREE.MeshStandardMaterial({ color: 0x4d8a67, roughness: 0.91 }),
    greenDark: new THREE.MeshStandardMaterial({ color: 0x315d48, roughness: 0.91 }),
    greenLight: new THREE.MeshStandardMaterial({ color: 0x7ca67c, roughness: 0.91 }),
    water: new THREE.MeshStandardMaterial({ color: 0x4d7c92, roughness: 0.23, metalness: 0.33 }),
    glow: new THREE.MeshStandardMaterial({ color: 0xb0d6e2, emissive: 0x5697b2, emissiveIntensity: 0.45, roughness: 0.4 }),
    solar: new THREE.MeshStandardMaterial({ color: 0x173963, metalness: 0.49, roughness: 0.23 }),
    solarLine: new THREE.MeshStandardMaterial({ color: 0x6ca0bd, metalness: 0.5, roughness: 0.32 }),
  };

  const specs = [
    ['site', 'Tapak & Lanskap Dasar', 'Platform, area akses, dan dasar lingkungan yang menopang gedung.', 0, 0.11, [0, -1.0, 0]],
    ['foundation', 'Fondasi', 'Fondasi terpisah sebagai struktur dasar yang muncul dari permukaan tanah.', 0.02, 0.17, [0, -2.1, 0]],
    ['floor1', 'Lantai Dasar', 'Pelat lantai pertama dengan tiga zona ruang yang mengitari atrium.', 0.13, 0.27, [0, -0.8, 0]],
    ['columns', 'Kolom Struktur', 'Kolom penopang dua lantai, dirakit secara vertikal.', 0.17, 0.34, [0, 0, 0]],
    ['beams', 'Balok Pengikat', 'Balok horizontal menghubungkan kolom dan membentuk kerangka gedung.', 0.29, 0.44, [0, 1.6, 0]],
    ['floor2', 'Lantai Dua', 'Pelat lantai kedua dapat diangkat untuk memperlihatkan ruang di bawahnya.', 0.39, 0.53, [0, 4.4, 0]],
    ['stairs', 'Tangga & Balkon', 'Sirkulasi vertikal serta pagar kaca di sekitar atrium terbuka.', 0.46, 0.58, [0, 0, 3.4]],
    ['walls', 'Dinding & Inti Ruang', 'Dinding masif dari material beton berwarna cerah.', 0.49, 0.65, [-3.0, 0, 0]],
    ['facade', 'Fasad Kaca', 'Panel kaca transparan dan kusen logam yang membentuk selubung gedung.', 0.56, 0.75, [0, 0, 4.5]],
    ['louvers', 'Kisi Kayu', 'Lapisan peneduh vertikal dari bilah-bilah kayu dekoratif.', 0.66, 0.82, [0, 0, 5.0]],
    ['interior', 'Interior & Furnitur', 'Meja, kursi, tanaman atrium, dan unsur ruang belajar.', 0.64, 0.85, [0, 0, 0]],
    ['roof', 'Atap Kanopi', 'Atap datar berlapis dengan kanopi yang dapat terangkat untuk melihat interior.', 0.76, 0.92, [0, 7.0, 0]],
    ['solar', 'Panel Surya', 'Panel energi matahari dengan sel berwarna biru gelap.', 0.85, 0.96, [0, 8.0, 0]],
    ['landscape', 'Penghijauan', 'Pohon, semak, dan taman yang tumbuh di sekitar dan di dalam gedung.', 0.90, 1, [0, 0, 0]],
  ];
  const parts = {};
  for (const [id, title, description, start, end, offset] of specs) {
    const group = new THREE.Group();
    group.name = id.toUpperCase();
    group.userData.part = id;
    root.add(group);
    parts[id] = { id, title, description, start, end, offset: new THREE.Vector3(...offset), group, basePosition: group.position.clone() };
  }

  const add = (part, geometry, material, x, y, z, name, options = {}) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.castShadow = options.castShadow !== false;
    mesh.receiveShadow = options.receiveShadow !== false;
    mesh.userData.part = part;
    parts[part].group.add(mesh);
    return mesh;
  };
  const box = (part, size, position, material, name, options) => add(part, new THREE.BoxGeometry(...size), material, ...position, name, options);
  const cyl = (part, radiusTop, radiusBottom, height, position, material, name, segments = 8) => add(part, new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material, ...position, name);

  // Site platform and approach plaza
  box('site', [37, 0.6, 31], [0, -0.55, 0], materials.base, 'SITE_PLATFORM');
  box('site', [35.6, 0.08, 29.6], [0, -0.20, 0], materials.concrete, 'SITE_TOP');
  box('site', [30.4, 0.1, 24.0], [0, -0.08, -0.2], materials.concreteLight, 'BUILDING_PAD');
  box('site', [10.0, 0.07, 4.5], [0, -0.1, 12.4], materials.concreteLight, 'ENTRY_PLAZA');
  for (let i = 0; i < 5; i++) {
    box('site', [10.8 - i * 0.35, 0.13, 0.72], [0, 0.00 + i * 0.14, 10.55 - i * 0.72], materials.concrete, `ENTRY_STEP_${i}`);
  }
  for (let i = 0; i < 8; i++) {
    const z = -12.9 + i * 3.6;
    box('site', [0.13, 0.09, 1.65], [-16.4, -0.09, z], materials.concreteLight, `PAVING_L_${i}`);
    box('site', [0.13, 0.09, 1.65], [16.4, -0.09, z], materials.concreteLight, `PAVING_R_${i}`);
  }

  // Separately visible structural footings and beams below first floor
  const xCols = [-12, -4.7, 4.7, 12];
  const zCols = [-8.1, -0.15, 7.7];
  const columnCoords = [];
  for (const x of xCols) for (const z of zCols) {
    if (Math.abs(x) < 5 && z > 0) continue; // atrium void
    columnCoords.push([x, z]);
  }
  for (const [x, z] of columnCoords) {
    box('foundation', [1.35, 0.65, 1.35], [x, -0.53, z], materials.concrete, `FOOTING_${x}_${z}`);
    box('columns', [0.36, 8.30, 0.36], [x, 4.2, z], materials.concreteLight, `COLUMN_${x}_${z}`);
  }
  for (const z of [-8.1, -0.15, 7.7]) {
    box('foundation', [24.3, 0.26, 0.26], [0, -0.35, z], materials.concrete, `GRADE_BEAM_X_${z}`);
    box('beams', [24.3, 0.31, 0.31], [0, 4.25, z], materials.trim, `BEAM_L2_X_${z}`);
    box('beams', [24.3, 0.30, 0.3], [0, 8.43, z], materials.trim, `BEAM_ROOF_X_${z}`);
  }
  for (const x of xCols) {
    box('foundation', [0.26, 0.24, 15.8], [x, -0.36, -0.2], materials.concrete, `GRADE_BEAM_Z_${x}`);
    box('beams', [0.30, 0.31, 15.9], [x, 4.25, -0.2], materials.trim, `BEAM_L2_Z_${x}`);
    box('beams', [0.3, 0.30, 15.9], [x, 8.43, -0.2], materials.trim, `BEAM_ROOF_Z_${x}`);
  }
  box('beams', [9.7, 0.30, 0.34], [0, 4.25, -3.35], materials.trim, 'ATRIUM_CROSS_BEAM');
  box('beams', [9.7, 0.30, 0.34], [0, 8.43, -3.35], materials.trim, 'ATRIUM_HIGH_CROSS_BEAM');

  // Floor plates are arranged as U-shaped wings so the courtyard remains open.
  for (const [id, y] of [['floor1', 0.17], ['floor2', 4.36]]) {
    for (const side of [-1, 1]) {
      box(id, [8.2, 0.39, 16.8], [side * 8.45, y, -0.2], materials.concreteLight, `${id}_WING_${side}`);
      box(id, [7.95, 0.04, 16.4], [side * 8.45, y + 0.22, -0.2], materials.concrete, `${id}_FINISH_${side}`);
    }
    box(id, [8.9, 0.39, 5.1], [0, y, -6.05], materials.concreteLight, `${id}_REAR_BRIDGE`);
    box(id, [8.6, 0.04, 4.8], [0, y + 0.22, -6.05], materials.concrete, `${id}_REAR_FINISH`);
  }

  // Opaque core walls; facades are a distinct selectable assembly.
  for (const y of [2.32, 6.52]) {
    box('walls', [0.21, 3.67, 6.4], [-12.45, y, -4.55], materials.concreteLight, `LEFT_CORE_${y}`);
    box('walls', [0.21, 3.67, 6.4], [12.45, y, -4.55], materials.concreteLight, `RIGHT_CORE_${y}`);
    box('walls', [8.7, 3.67, 0.21], [0, y, -8.55], materials.concreteLight, `BACK_CORE_${y}`);
    box('walls', [0.2, 3.67, 2.25], [-4.36, y, -6.1], materials.concreteLight, `ATRIUM_LEFT_WALL_${y}`);
    box('walls', [0.2, 3.67, 2.25], [4.36, y, -6.1], materials.concreteLight, `ATRIUM_RIGHT_WALL_${y}`);
  }

  const glassPanel = (x, y, z, width, height, depth, label, material = materials.glass) => {
    box('facade', [width, height, depth], [x, y, z], material, `GLASS_${label}`, { castShadow: false });
  };
  for (const y of [2.3, 6.5]) {
    // Front of the left and right classroom wings
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const x = side * (5.1 + i * 2.12);
        glassPanel(x, y, 8.26, 1.98, 3.46, 0.055, `FRONT_${side}_${i}_${y}`);
        box('facade', [0.065, 3.7, 0.09], [x - 1.03, y, 8.30], materials.trim, `MULLION_FRONT_${side}_${i}_${y}`);
      }
    }
    for (const side of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const z = -1.18 + i * 1.84;
        glassPanel(side * 12.62, y, z, 0.06, 3.35, 1.75, `SIDE_${side}_${i}_${y}`, materials.glassSide);
        box('facade', [0.1, 3.62, 0.055], [side * 12.66, y, z - .92], materials.trim, `SIDE_MULLION_${side}_${i}_${y}`);
      }
    }
    for (const side of [-1, 1]) {
      // Glass opening into the central courtyard
      for (let i = 0; i < 5; i++) {
        const z = -1.6 + i * 1.95;
        glassPanel(side * 4.28, y, z, 0.055, 3.34, 1.83, `ATRIUM_${side}_${i}_${y}`);
      }
    }
    for (const z of [8.32, -8.61]) {
      box('facade', [24.8, 0.1, 0.14], [0, y - 1.84, z], materials.trim, `FACADE_SILL_${y}_${z}`);
      box('facade', [24.8, 0.1, 0.14], [0, y + 1.84, z], materials.trim, `FACADE_HEAD_${y}_${z}`);
    }
  }
  // Deep wooden vertical louvres on outer wings.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const x = side * (10.6 + i * 0.23);
      box('louvers', [0.10, 7.32, 0.35], [x, 4.4, 8.67], materials.wood, `FRONT_WOOD_FIN_${side}_${i}`);
    }
    for (let i = 0; i < 11; i++) {
      const z = -7.7 + i * .41;
      box('louvers', [0.34, 7.32, 0.11], [side * 12.91, 4.4, z], materials.woodLight, `SIDE_WOOD_FIN_${side}_${i}`);
    }
  }

  // Exterior stair, balconies and guardrail around the courtyard.
  for (let i = 0; i < 15; i++) {
    box('stairs', [2.35, 0.19, 0.42], [0, 0.43 + i * 0.253, 8.0 - i * 0.49], materials.concrete, `CENTRAL_STAIR_${i}`);
  }
  box('stairs', [3.3, 0.18, 1.2], [0, 4.25, .64], materials.concreteLight, 'UPPER_STAIR_LANDING');
  for (const side of [-1, 1]) {
    box('stairs', [0.09, 1.03, 12], [side * 4.32, 5.1, 2.2], materials.glass, `BALCONY_GLASS_${side}`, { castShadow: false });
    box('stairs', [0.10, 0.08, 12], [side * 4.32, 5.64, 2.2], materials.trim, `BALCONY_RAIL_${side}`);
  }
  box('stairs', [8.6, 1.02, 0.09], [0, 5.1, -3.2], materials.glass, 'BALCONY_REAR_GLASS', { castShadow: false });
  box('stairs', [8.6, 0.08, 0.11], [0, 5.64, -3.2], materials.trim, 'BALCONY_REAR_RAIL');

  // Roof is U-shaped. Its separate Group can be lifted without touching the walls.
  for (const side of [-1, 1]) {
    box('roof', [9.7, 0.42, 18.9], [side * 8.43, 8.94, -0.2], materials.roof, `ROOF_WING_${side}`);
    box('roof', [9.4, 0.15, 18.6], [side * 8.43, 8.67, -0.2], materials.wood, `ROOF_WOOD_SOFFIT_${side}`);
  }
  box('roof', [9.6, 0.44, 6.1], [0, 8.96, -6.1], materials.roof, 'ROOF_REAR_BRIDGE');
  box('roof', [27.0, 0.38, 2.65], [0, 9.05, 8.43], materials.roof, 'ROOF_ENTRY_CANOPY');
  box('roof', [26.4, 0.14, 2.4], [0, 8.80, 8.42], materials.wood, 'CANOPY_WOOD_SOFFIT');
  for (let i = -8; i <= 8; i++) {
    cyl('roof', .058, .058, .035, [i * 1.45, 8.71, 8.36], materials.glow, `CANOPY_DOWNLIGHT_${i}`, 12);
  }

  // Distinct solar-panel assembly on the upper-right roof.
  for (let col = 0; col < 4; col++) for (let row = 0; row < 3; row++) {
    const x = 6.2 + col * 1.38, z = -6.8 + row * 1.75;
    const panel = box('solar', [1.21, 0.11, 1.52], [x, 9.40, z], materials.solar, `SOLAR_${col}_${row}`);
    panel.rotation.x = -.10;
    box('solar', [1.12, 0.013, 0.025], [x, 9.48, z], materials.solarLine, `SOLAR_CELL_A_${col}_${row}`);
    box('solar', [0.024, 0.013, 1.43], [x, 9.48, z], materials.solarLine, `SOLAR_CELL_B_${col}_${row}`);
  }

  // Interior furnishings & courtyard planting are independently selectable.
  for (const side of [-1, 1]) for (const level of [0, 4.19]) {
    for (let i = 0; i < 3; i++) {
      const z = -5 + i * 3.5;
      box('interior', [2.15, 0.12, 1.05], [side * 8.45, level + .88, z], materials.woodLight, `DESK_${side}_${level}_${i}`);
      for (let leg of [-.8, .8]) box('interior', [.08, .71, .08], [side * 8.45 + leg, level + .46, z], materials.trim, `DESK_LEG_${side}_${level}_${i}_${leg}`);
      box('interior', [1.5, 0.12, 0.45], [side * 8.45, level + .55, z + 1.0], materials.wood, `BENCH_${side}_${level}_${i}`);
    }
  }
  for (const side of [-1, 1]) {
    box('interior', [1.5, 0.46, 1.7], [side * 2.15, .20, 3.1], materials.concreteLight, `ATRIUM_BENCH_${side}`);
    box('interior', [1.25, .09, 1.55], [side * 2.15, .47, 3.1], materials.woodLight, `ATRIUM_BENCH_SEAT_${side}`);
  }

  // Procedural trees and shrubs; these remain real meshes with shadows.
  function tree(x, z, h, label, part = 'landscape') {
    const trunk = cyl(part, .11, .19, h * .48, [x, h * .24 - .06, z], materials.wood, `${label}_TRUNK`, 8);
    trunk.castShadow = true;
    const canopy = add(part, new THREE.IcosahedronGeometry(h * .37, 1), materials.greenDark, x, h * .61, z, `${label}_CROWN`);
    canopy.scale.set(1.16, .86, 1.04);
    const crown2 = add(part, new THREE.IcosahedronGeometry(h * .29, 1), materials.green, x + h * .16, h * .73, z + h * .10, `${label}_CANOPY`);
    crown2.scale.set(1.02, .91, 1.1);
  }
  const trees = [[-15, -10.8, 3.3], [15, -10.1, 3.0], [-15, 8.6, 3.2], [15, 8.1, 2.8], [-13.9, 12.4, 2.0], [13.4, 12.2, 2.1], [0, 3.8, 3.2], [1.6, -1.1, 2.2]];
  trees.forEach(([x, z, h], i) => tree(x, z, h, `TREE_${i}`));
  for (let i = 0; i < 42; i++) {
    const r = i % 3, row = Math.floor(i / 3), x = (r - 1) * 1.14, z = -1.9 + row * .29;
    if (i < 14) {
      const m = add('landscape', new THREE.DodecahedronGeometry(.19 + i % 3 * .06, 0), i % 2 ? materials.green : materials.greenLight, x + (i % 5) * .3, .18, z + .42, `ATRIUM_SHRUB_${i}`);
      m.scale.y = .8;
    }
  }
  for (let i = 0; i < 28; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = -11.4 + Math.floor(i / 2) * 1.55;
    const shrub = add('landscape', new THREE.DodecahedronGeometry(.23 + (i % 4) * .04, 0), i % 3 ? materials.green : materials.greenLight, side * 14.7, .14, z, `OUTER_SHRUB_${i}`);
    shrub.scale.set(1.6, .58, .96);
  }
  for (const side of [-1, 1]) {
    box('landscape', [6.0, .28, .85], [side * 8.1, 4.74, 8.24], materials.concrete, `BALCONY_PLANTER_${side}`);
    for (let i = 0; i < 9; i++) {
      const plant = add('landscape', new THREE.DodecahedronGeometry(.24, 0), i % 2 ? materials.greenLight : materials.green, side * 8.1 - 2.5 + i * .62, 5.04, 8.26, `BALCONY_PLANT_${side}_${i}`);
      plant.scale.set(.85, 1.1, 1.1);
    }
  }

  // Geometry is fully local and deterministic. Explicit bounding volume is
  // exported to make camera-fit checks and automated diagnostics possible.
  root.traverse(node => {
    if (node.isMesh) {
      node.userData.baseMaterial = node.material;
      if (node.geometry && !node.geometry.boundingSphere) node.geometry.computeBoundingSphere();
    }
  });
  const bounds = new THREE.Box3().setFromObject(root);
  return { root, parts, materials, bounds, meshCount: root.children.reduce((n, group) => n + group.children.length, 0) };
}
