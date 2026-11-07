import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { syubbanulDeck } from '../src/syubbanul-deck.js';

test('animasi CV dan Nusantara tersimpan lokal untuk deployment', async () => {
  for (const file of [
    '../public/cv/index.html',
    '../public/cv/script.js',
    '../public/cv/styles.css',
    '../public/nusantara/index.html',
    '../public/nusantara/app.js',
    '../public/nusantara/data/indonesia.geojson',
    '../public/nusantara/data/indonesia-data.js',
    '../public/models/nexora-ecolearning.glb',
  ]) {
    const entry = await stat(new URL(file, import.meta.url));
    assert.ok(entry.isFile() && entry.size > 20, `${file} tidak ditemukan`);
  }
});

test('NEXORA builds in continuous order, then seed, then general UIN Sospro', () => {
  const stages = syubbanulDeck.slides.filter(s => s.layout === 'nexora' && s.scene !== 'opening');
  assert.deepEqual(stages.map(s => s.scene), ['foundation','structure','floor','facade','complete']);
  assert.deepEqual(stages.map(s => s.progress), [...stages.map(s => s.progress)].sort((a,b) => a-b));
  assert.match(syubbanulDeck.slides[7].intro, /angkatan kedua/i);
  assert.match(syubbanulDeck.slides[7].intro, /pembimbing/i);
  assert.equal(syubbanulDeck.slides[15].layout, 'nusantara');
  assert.equal(syubbanulDeck.slides[16].layout, 'sospro');
});

test('link Sospro dan embed menggunakan jalur lokal dengan benar', async () => {
  const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.match(main, /\/cv\/index\.html/);
  assert.match(main, /\/nusantara\/index\.html\?embed=1/);
  assert.match(main, /sospro-qr/);
  assert.match(main, /K\.admission/);
});
