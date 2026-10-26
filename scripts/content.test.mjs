import test from "node:test";
import assert from "node:assert/strict";
import { decks, fields, links, parseRoute } from "../src/content.js";
import { createShape, morphShape, shapeNames } from "../src/shapes.js";
test("10 slide Pendidikan Fisika dan 10 bentuk unik", () => {
  const d = decks[0];
  assert.equal(d.id, "pendidikan-fisika");
  assert.equal(d.slides.length, 10);
  assert.equal(new Set(d.slides.map((s) => s.shape)).size, 10);
  assert.equal(fields.length, 4);
  assert.ok(links.physics.startsWith("https://pfis."));
  for (const s of d.slides) {
    assert.ok(s.title && s.notes);
    assert.ok(links[s.source]);
  }
  assert.equal(parseRoute("#/presentasi/pendidikan-fisika/6").index, 5);
  assert.equal(parseRoute("#/presentasi/fisika/6").deck.id, d.id);
  assert.equal(parseRoute("#/presentasi/unknown/6"), null);
  assert.equal(parseRoute("#/presentasi/pendidikan-fisika/999").index, 9);
});
test("seluruh bentuk deterministik, finite, dan berbeda", () => {
  assert.equal(shapeNames.length, 10);
  const shapes = shapeNames.map((_, i) => createShape(i, 720));
  for (let i = 0; i < 10; i++) {
    assert.equal(shapes[i].length, 2160);
    assert.ok(shapes[i].every(Number.isFinite));
    assert.ok(shapes[i].every((x) => Math.abs(x) < 3));
    assert.deepEqual(shapes[i], createShape(i, 720));
    for (let j = 0; j < i; j++) assert.notDeepEqual(shapes[i], shapes[j]);
  }
});
test("morph dimulai dan berakhir pada bentuk tepat, interupsi aman", () => {
  const a = createShape(0, 100),
    b = createShape(1, 100),
    c = new Float32Array(a.length);
  assert.deepEqual(morphShape(c, a, b, 0), a);
  assert.deepEqual(morphShape(c, a, b, 1), b);
  morphShape(c, a, b, 0.4);
  const interrupted = c.slice(),
    galaxy = createShape(2, 100);
  assert.deepEqual(morphShape(c, interrupted, galaxy, 0), interrupted);
  assert.deepEqual(morphShape(c, interrupted, galaxy, 1), galaxy);
});
