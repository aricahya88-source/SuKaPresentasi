// Urutan eksplisit berdasarkan nama file yang diberikan narasumber.
// Jangan bergantung pada pengurutan file otomatis dari sistem operasi.
const filenames = [
  '1.jpg',
  '2-a.jpg',
  '2-b.jpg',
  '3.jpg',
  '4.jpg',
  '5.jpg',
  '6.jpg',
  '7.jpg',
  '8. chilyu.jpg',
  '9.beqyu - dastu.jpg',
  '511731848_10032257370189899_4353097291180421828_n.jpg',
  '512634423_10032257250189911_1008900489672492652_n.jpg',
  '514644398_10231122742071658_7838384995560130203_n.jpg',
  '72606788_10212150833879838_4058420026552614912_n.jpg',
];

export const experiencePhotos = filenames.map((name, index) => ({
  name,
  number: index + 1,
  src: `/images/pengalaman/${encodeURIComponent(name)}`,
}));
