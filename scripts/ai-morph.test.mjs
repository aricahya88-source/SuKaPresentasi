import test from 'node:test';
import assert from 'node:assert/strict';
import { AI_SHAPE_SEQUENCE, generateParticleShape } from '../src/ai-morph-particles.js';
import { syubbanulDeck } from '../src/syubbanul-deck.js';
import { readFile, stat } from 'node:fs/promises';

test('enam bentuk partikel AI sesuai urutan materi slide 9–14', () => {
  assert.deepEqual(AI_SHAPE_SEQUENCE,
    ['brain','neuron','network','microchip','globe','heart']);
  assert.deepEqual(syubbanulDeck.slides.slice(8, 14).map(slide => slide.aiShape),
    AI_SHAPE_SEQUENCE);
  assert.equal(syubbanulDeck.slides[10].title, 'AI Tidak Akan Menggantikan Santri!');
});

test('semua point cloud deterministik, finite, dan berbeda', () => {
  const signature = [];
  for (const shape of AI_SHAPE_SEQUENCE) {
    const points = generateParticleShape(shape, 850);
    assert.equal(points.length, 850);
    assert.ok(points.every(p => [p.x,p.y,p.z].every(Number.isFinite)), `Invalid ${shape}`);
    assert.ok(points.every(p => Math.abs(p.x) < 2.2 && Math.abs(p.y) < 2.2), `Out of bounds ${shape}`);
    assert.deepEqual(generateParticleShape(shape, 850), points);
    signature.push(points.slice(0, 16).map(p => p.x.toFixed(3)).join(','));
  }
  assert.equal(new Set(signature).size, AI_SHAPE_SEQUENCE.length);
});

test('mode terang/gelap tersinkron hingga slide CV, Nusantara, dan NEXORA', async () => {
  const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
  const cv = await readFile(new URL('../public/cv/script.js', import.meta.url), 'utf8');
  const growth = await readFile(new URL('../public/nusantara/app.js', import.meta.url), 'utf8');
  const presenter = await readFile(new URL('../src/nexora/presenter.js', import.meta.url), 'utf8');
  assert.match(main, /suka-theme/);
  assert.match(main, /data-action=\\?"theme/);
  assert.match(main, /\?theme=\$\{theme\}/);
  assert.match(cv, /theme-light/);
  assert.match(growth, /theme-light/);
  assert.match(presenter, /function setTheme\(theme\)/);
  for (const file of ['../public/cv/theme.css','../public/nusantara/theme.css']) {
    assert.ok((await stat(new URL(file, import.meta.url))).size > 100);
  }
});
