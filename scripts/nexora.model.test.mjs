import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createBuilding } from '../src/nexora/building.js';
import { NexoraScene } from '../src/nexora/scene.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { readFile } from 'node:fs/promises';

test('model contains 14 independently movable assemblies', () => {
  const model = createBuilding();
  assert.equal(Object.keys(model.parts).length, 14);
  assert.ok(model.meshCount >= 200, `Only ${model.meshCount} meshes created`);
  for (const [name, part] of Object.entries(model.parts)) {
    assert.equal(part.group.parent, model.root);
    assert.ok(part.group.children.length > 0, `${name} has no geometry`);
  }
});

test('scrubbing, roof lift, floor lift and explode alter separate groups', () => {
  const engine = Object.create(NexoraScene.prototype);
  engine.model = createBuilding();
  engine.progress = 1;
  engine.roofLift = 0;
  engine.floorLift = 0;
  engine.explode = 0;
  engine.xray = 0;
  engine.xrayMaterials = [];
  engine.applyTransforms();
  const baselineRoof = engine.model.parts.roof.group.position.y;
  const baselineFloor = engine.model.parts.floor2.group.position.y;
  engine.roofLift = 1;
  engine.floorLift = 1;
  engine.applyTransforms();
  assert.equal(engine.model.parts.roof.group.position.y, baselineRoof + 6.4);
  assert.equal(engine.model.parts.floor2.group.position.y, baselineFloor + 3.6);
  assert.equal(engine.model.parts.floor1.group.position.y, 0);
  engine.roofLift = 0;
  engine.floorLift = 0;
  engine.explode = 1;
  engine.applyTransforms();
  assert.equal(engine.model.parts.roof.group.position.y, 7);
  assert.equal(engine.model.parts.floor2.group.position.y, 4.4);
  engine.explode = 0;
  engine.setProgress(0);
  assert.ok(Object.values(engine.model.parts).every(part => !part.group.visible));
  engine.setProgress(1);
  assert.ok(Object.values(engine.model.parts).every(part => part.group.visible));
});

test('X-Ray mode reduces opacity and restores the original values', () => {
  const engine = Object.create(NexoraScene.prototype);
  engine.model = createBuilding();
  engine.progress = 1;
  engine.roofLift = engine.floorLift = engine.explode = engine.xray = 0;
  engine.configureXrayMaterials();
  const material = engine.xrayMaterials.find(m => m.userData.defaultOpacity === 1);
  assert.ok(material, 'Expected an opaque material in walls or louvers');
  engine.xray = 1;
  engine.applyTransforms();
  assert.ok(material.opacity < .2, `X-Ray opacity ${material.opacity} is not transparent`);
  engine.xray = 0;
  engine.applyTransforms();
  assert.equal(material.opacity, 1);
});

test('GLB asset opens and preserves all 14 assembly groups', async () => {
  const source = await readFile(new URL('../public/models/nexora-ecolearning.glb', import.meta.url));
  const buffer = source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  const gltf = await new GLTFLoader().parseAsync(buffer, '');
  const building = gltf.scene.getObjectByName('NEXORA_LEARNING_CENTER');
  assert.ok(building);
  assert.equal(building.children.length, 14);
  assert.equal(building.children.reduce((count, group) => count + group.children.length, 0), 450);
});

test('mesh transforms, geometry, material, and component ids are valid', () => {
  const model = createBuilding();
  let count = 0;
  model.root.traverse(node => {
    if (!node.isMesh) return;
    count++;
    assert.ok(model.parts[node.userData.part], `Missing component id: ${node.name}`);
    assert.ok(node.geometry.getAttribute('position')?.count > 0, `Empty geometry: ${node.name}`);
    for (const axis of ['x', 'y', 'z']) assert.ok(Number.isFinite(node.position[axis]));
    assert.ok(node.material);
  });
  assert.equal(count, model.meshCount);
});

test('building bounds are 3D and suitable for the camera presets', () => {
  const model = createBuilding();
  const size = model.bounds.getSize(new THREE.Vector3());
  assert.ok(size.x > 34 && size.x < 45, `Unexpected width ${size.x}`);
  assert.ok(size.y > 9 && size.y < 20, `Unexpected height ${size.y}`);
  assert.ok(size.z > 27 && size.z < 40, `Unexpected depth ${size.z}`);
  for (const key of ['roof', 'solar', 'floor2', 'facade', 'walls']) {
    const part = model.parts[key];
    assert.ok(Number.isFinite(part.start) && Number.isFinite(part.end));
    assert.ok(part.start >= 0 && part.end <= 1 && part.start < part.end);
  }
});
