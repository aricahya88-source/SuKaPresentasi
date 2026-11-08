import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { marsTitle, marsVerses } from '../src/mars-lyrics.js';
import { syubbanulDeck } from '../src/syubbanul-deck.js';

test('teks lengkap Mars sesuai naskah 14 baris dan empat bait yang diberikan', () => {
  const expected = `MARS SMA SYUBBANUL WATHON

Tatkala gemilang mulai menantang
Derap langkah tegak bahu siapkan
Singsingkan tinggi berjalan berlari
Mimbar dunia menanti

Meski ku terpukul angin terpendam
Seakan runtuhkan harapan terang
Mercusuar timur ku takkan redam
Kian tegak menjulang

Jaya jaya SMA Syubbanul Wathon
Muda mudi bangsa berpanji Pancasila
Jaya jaya SMA Syubbanul Wathon
Unggul berprestasi, beriman, dan berbudi

Teguhkanlah iman taqwa menjadi insan berakhlaq mulia
Berbudaya bina bangsa menjadi insan yang cendekia`;
  assert.equal(`${marsTitle}\n\n${marsVerses.map(verse => verse.join('\n')).join('\n\n')}`, expected);
  assert.deepEqual(marsVerses.map(verse => verse.length), [4, 4, 4, 2]);
});

test('lirik dipasangkan ke slide Mars dengan NEXORA bangunan utuh', () => {
  const slide = syubbanulDeck.slides.find(item => item.title === 'Mars yang menjadi arah perjalanan.');
  assert.equal(slide?.scene, 'complete');
  assert.equal(slide?.layout, 'nexora');
  assert.equal(slide?.legacy, 'LEGACY II');
  assert.match(slide.notes, /siswa angkatan kedua/);
});

test('tombol Mars membuka dialog, dan teks lengkap juga tersedia saat cetak', () => {
  const mainSource = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const cssSource = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
  assert.match(mainSource, /data-action=\\?"mars-lyrics\\?"/);
  assert.match(mainSource, /function openMarsLyrics\(\)/);
  assert.match(mainSource, /mars-print-lyrics/);
  assert.match(cssSource, /\.print-slide \.mars-print-lyrics \{display:block/);
});
