import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { experiencePhotos } from '../src/syubbanul-gallery.js';

const projectDir = fileURLToPath(new URL('../', import.meta.url));

test('galeri pengalaman berisi 14 foto unik', () => {
  assert.equal(experiencePhotos.length, 14);
  assert.equal(new Set(experiencePhotos.map(photo => photo.name)).size, 14);
});

test('nama file bernomor mempunyai urutan manual 1, 2-a, 2-b, 3 sampai 9', () => {
  assert.deepEqual(experiencePhotos.slice(0, 10).map(photo => photo.name), [
    '1.jpg', '2-a.jpg', '2-b.jpg', '3.jpg', '4.jpg', '5.jpg',
    '6.jpg', '7.jpg', '8. chilyu.jpg', '9.beqyu - dastu.jpg',
  ]);
});

test('semua path galeri menangani spasi dalam nama file dan berasal dari folder publik', () => {
  for (const photo of experiencePhotos) {
    assert.equal(decodeURI(photo.src), `/images/pengalaman/${photo.name}`);
    assert.ok(photo.number > 0);
  }
});

test('ke-14 foto fisik ada di public/images/pengalaman', () => {
  for (const photo of experiencePhotos) {
    assert.ok(existsSync(`${projectDir}/public/images/pengalaman/${photo.name}`), photo.name);
  }
});
