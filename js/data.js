// Data tari Tari Sambut Seruni Musi: satu sumber kebenaran untuk musik, pola lantai, gerak, 2D dan 3D.
export const F = o => { const r = Array(7).fill(null); for (const k in o) r[k] = o[k]; return r }
const BK = [[20, 8, .35], [50, 8, .35], [80, 8, .35]]
export const RG = [0, 4, 1, 5, 2, 6, 3]
const LN = (o, y) => F(Object.fromEntries(o.map((k, i) => [k, [14 + i * 12, y]])))

// Pola lantai (x,y dalam 0–100 × 0–62, y kecil = belakang panggung). Nilai ke-3 = opasitas (penari menepi).
export const PL = [
  { s: 0, b: 5, n: 'Masuk diagonal', m: 'Perempuan memasuki panggung dengan tenang menyambut tamu.', f: F({ 4: [22, 16], 5: [36, 26], 6: [50, 36] }) },
  { s: 1, b: 1, n: 'Segitiga sambut', m: 'Penari utama di depan, dua pendamping mengapit: keramahan.', f: F({ 4: [38, 26], 5: [50, 42], 6: [62, 26] }) },
  { s: 1, b: 9, n: 'Lingkaran kecil', m: 'Kebersamaan dan kelembutan yang tak terputus.', f: F({ 4: [50, 18], 5: [60, 36], 6: [40, 36] }) },
  { s: 2, b: 1, n: 'Dua barisan laki-laki', m: 'Keberanian dan kesiapan menjaga. Perempuan menepi.', f: F({ 0: [28, 20], 1: [28, 36], 2: [72, 20], 3: [72, 36], 4: BK[0], 5: BK[1], 6: BK[2] }) },
  { s: 2, b: 13, n: 'Kotak 2×2', m: 'Kokoh dan bertanggung jawab.', f: F({ 0: [40, 24], 1: [60, 24], 2: [40, 40], 3: [60, 40], 4: BK[0], 5: BK[1], 6: BK[2] }) },
  { s: 3, b: 1, n: 'Tiga pasangan + L1', m: 'Kerja sama berpasangan, L1 berjaga di belakang.', f: F({ 0: [50, 16], 1: [19, 38], 4: [29, 38], 2: [45, 38], 5: [55, 38], 3: [71, 38], 6: [81, 38] }) },
  { s: 3, b: 11, n: 'Lingkaran gotong royong', m: 'Laki-laki dan perempuan selang-seling, saling menguatkan.', f: F(Object.fromEntries(RG.map((k, i) => { const a = (-90 + i * 360 / 7) * Math.PI / 180; return [k, [50 + 28 * Math.cos(a), 31 + 19 * Math.sin(a)]] }))) },
  { s: 4, b: 1, n: 'Panah V', m: 'Menunjuk ke penonton: kegembiraan dan semangat bersama.', f: F({ 0: [50, 50], 4: [41, 41], 5: [59, 41], 1: [32, 32], 2: [68, 32], 6: [23, 23], 3: [77, 23] }) },
  { s: 4, b: 9, n: 'Perahu bidar', m: 'Seperti perahu bidar di Sungai Musi: mendayung serempak.', f: F(Object.fromEntries([0, 1, 4, 5, 6, 2, 3].map((k, i) => { const x = 14 + i * 12; return [k, [x, 24 + ((x - 50) / 36) ** 2 * 10]] }))) },
  { s: 4, b: 17, n: 'Jembatan Ampera', m: 'Tiang dan bentang jembatan: kebanggaan kota Palembang.', f: F({ 0: [18, 40], 1: [18, 22], 2: [82, 22], 3: [82, 40], 4: [35, 26], 5: [50, 22], 6: [65, 26] }) },
  { s: 5, b: 1, n: 'Baris hormat', m: 'Penghormatan kepada tamu dan warisan budaya.', f: LN(RG, 44) }]

// Enam bagian musik. e = energi awal→akhir (dinamika lembut hingga meriah), sc = tangga nada melodi.
export const SEC = [
  { n: 'Fajar di Sungai Musi', th: 'Fajar di Tepian Musi', a: 0, d: 30, bpm: 64, lv: 1, ld: 'suling', from: 2, seq: [0, 6], e: [.18, .34], sc: 'hm', pr: 'A' },
  { n: 'Salam & Sambut Tamu', th: 'Kelembutan & Keramahan', a: 30, d: 60, bpm: 72, lv: 2, ld: 'suling', db: 'saron', from: 0, seq: [0, 1, 2, 5], e: [.34, .52], sc: 'hm', pr: 'A' },
  { n: 'Tepak Sirih', th: 'Keberanian & Tanggung Jawab', a: 90, d: 60, bpm: 96, lv: 3, ld: 'biola', db: 'petik', from: 0, seq: [3, 6, 3, 5], e: [.6, .84], sc: 'hm', pr: 'B' },
  { n: 'Musi Mengalir', th: 'Gotong Royong', a: 150, d: 60, bpm: 80, lv: 2, ld: 'suling', db: 'petik', from: 0, seq: [7, 1, 7, 5], e: [.46, .62], sc: 'nm', pr: 'C' },
  { n: 'Pesta Rakyat', th: 'Persatuan & Keharmonisan', a: 210, d: 60, bpm: 100, lv: 3, ld: 'biola', db: 'petik', from: 0, seq: [4, 2, 4, 5], e: [.72, 1], sc: 'hm', pr: 'A' },
  { n: 'Penutup & Hormat', th: 'Warisan untuk Generasi Muda', a: 270, d: 30, bpm: 64, lv: 1, ld: 'suling', db: 'saron', from: 0, seq: [0, 5], e: [.4, .16], sc: 'hm', pr: 'A' }]

export const JD = [['Panggung kosong', 'Panggung kosong', 'Langkah Melayu', 'Tangan Mekar'],
  ['Sembah Salam', 'Tangan Mekar', 'Kipas Mekar', 'Ayun Selendang', 'Langkah Melayu', 'Tangan Mekar', 'Kipas Mekar', 'Ayun Selendang', 'Sembah Salam'],
  ['Langkah Tegap', 'Sikap Tanjak', 'Hentak Gagah', 'Tepuk Jaga', 'Langkah Tegap', 'Hentak Gagah', 'Langkah Tegap', 'Sikap Tanjak', 'Hentak Gagah', 'Tepuk Jaga', 'Hentak Gagah', 'Sikap Tanjak'],
  ['Langkah Melayu', 'Saling Sambut', 'Putar Berpasangan', 'Saling Sambut', 'Angkat Bersama', 'Langkah Melayu', 'Putar Berpasangan', 'Angkat Bersama', 'Saling Sambut', 'Sembah Salam'],
  ['Langkah Melayu', 'Angkat Bersama', 'Putar Berpasangan', 'Saling Sambut', 'Langkah Melayu', 'Angkat Bersama', 'Putar Berpasangan', 'Saling Sambut', 'Langkah Melayu', 'Angkat Bersama', 'Putar Berpasangan', 'Saling Sambut', 'Angkat Bersama'],
  ['Langkah Melayu', 'Tangan Mekar (P) + Sikap Tanjak (L)', 'Sembah Salam', 'Tableau diam']]

export const G = [['Sembah Salam', 'Dasar', ['Rapatkan telapak tangan di dada', 'Angkat sampai depan dagu', 'Merunduk, kepala tunduk hormat', 'Tegak, tangan turun ke dada'], 'Penghormatan kepada tamu'],
  ['Langkah Melayu', 'Dasar', ['Kanan melangkah kecil, tumit dulu', 'Kiri menyusul, rapat', 'Kiri melangkah kecil', 'Kanan menyusul, rapat'], 'Berpindah formasi dengan lembut'],
  ['Tangan Mekar', 'Perempuan', ['Tangan di dada, jari menguncup', 'Buka ke samping setinggi bahu', 'Putar pergelangan (ukel)', 'Kembali menguncup di dada'], 'Kelembutan dan keramahan'],
  ['Kipas Mekar', 'Perempuan', ['Kipas tertutup, tangan di dada', 'Angkat kipas ke samping kanan', 'Buka kipas perlahan sambil memutar', 'Tutup, kembali ke dada'], 'Kelembutan'],
  ['Ayun Selendang', 'Perempuan', ['Pegang ujung selendang, ayun ke kanan', 'Ayun ke kiri, badan condong', 'Ayun lagi ke kanan', 'Kembali tengah, lepas lembut'], 'Keanggunan'],
  ['Langkah Tegap', 'Laki-laki', ['Kanan melangkah mantap, dada tegak', 'Kiri melangkah mantap', 'Kanan melangkah, kepalan di pinggang', 'Kiri rapat, pandangan lurus'], 'Keberanian'],
  ['Sikap Tanjak', 'Laki-laki', ['Tangan kanan menyentuh tanjak', 'Tahan, kepala sedikit tunduk', 'Tangan menyilang di dada', 'Tegak, tangan di samping'], 'Kehormatan dan wibawa'],
  ['Hentak Gagah', 'Laki-laki', ['Hentak kanan, kepalan kanan ke dada', 'Hentak kiri, kepalan kiri ke dada', 'Hentak kanan, tangan buka ke samping', 'Kaki rapat, tegak dan tegas'], 'Tanggung jawab'],
  ['Tepuk Jaga', 'Laki-laki', ['Tepuk lengan kiri dengan tangan kanan', 'Tepuk lengan kanan dengan tangan kiri', 'Silang tangan di dada, siaga', 'Buka tangan, tegak'], 'Siap menjaga'],
  ['Saling Sambut', 'Bersama', ['Laki-laki mengulurkan tangan', 'Perempuan menyambut dengan kipas/tangan mekar', 'Saling merunduk kecil', 'Tegak berdampingan'], 'Keramahan yang saling menyambut'],
  ['Putar Berpasangan', 'Bersama', ['Berdampingan, geser satu langkah kanan', 'Mulai berputar pelan di tempat', 'Selesaikan satu putaran', 'Berhenti menghadap penonton'], 'Keharmonisan'],
  ['Angkat Bersama', 'Bersama', ['Kedua tangan di dada', 'Angkat perlahan ke atas kepala', 'Tahan, pandangan ke depan', 'Turunkan sambil tersenyum'], 'Gotong royong dan persatuan']]

export const BU = {
  P: [['Aesan Gede', 'Busana adat kebesaran Palembang bernuansa songket merah-emas, dipakai penari perempuan (versi tari).'], ['Tanggai', 'Kuku emas lentik di jari penari; mempercantik gerak tangan.'], ['Selendang songket', 'Kain tenun khas Palembang untuk Ayun Selendang.'], ['Kipas', 'Properti perempuan, simbol kelembutan.'], ['Kembang goyang', 'Hiasan sanggul berbentuk bunga emas yang bergoyang lembut mengikuti gerak kepala.']],
  L: [['Aesan Paksangko', 'Busana adat Palembang yang gagah dan anggun, dipakai penari laki-laki (versi tari).'], ['Tanjak', 'Penutup kepala laki-laki, simbol kehormatan dan wibawa.'], ['Selempang songket', 'Kain songket yang disandang di bahu laki-laki.'], ['Kain samping', 'Songket yang dililit di pinggang sampai lutut, dikencangkan dengan pending (sabuk) emas.']]
}

export const TIPS = ['Hafalkan hitungan dulu: putar musik dan hitung 1-2-3-4 keras-keras.', 'Latih gerak satu per satu tanpa musik, lalu dengan musik. Tiap gerak 4 hitungan, diulang 2 kali.', 'Pasang tanda lantai bernomor L1-L4 dan P1-P3. Kiri dan kanan dilihat dari penonton.', 'Latih per bagian: ketuk bilah progres untuk lompat ke bagian yang sulit.', 'Pindah formasi saat Langkah Melayu/Tegap pada 2 bar pertama, langkah kecil dan rata.', 'Gong penanda awal bagian: jadikan patokan agar kompak.', 'Berlatih dengan properti sejak awal: kipas, selendang, tanjak.', 'Rekam dari arah penonton lalu cek kesimetrisan pola dan jarak.']

export const PRP = { 'Kipas Mekar': 'Kipas (P1–P3) dipegang tangan kanan: diangkat ke samping kanan di hitungan 2, dibuka memutar di hitungan 3, ditutup dan kembali ke dada di hitungan 4.', 'Ayun Selendang': 'Selendang songket (P1–P3): kedua tangan memegang ujung kain sepanjang gerak, dilepas lembut di hitungan 4.', 'Tangan Mekar': 'Tidak ada properti genggam; tanggai (kuku emas) menghiasi jari.', 'Saling Sambut': 'Perempuan boleh memakai kipas atau tangan mekar (sesuai file asli).' }

export const NR = [8, 18, 24, 20, 25, 8], BS = [0, 8, 26, 50, 70, 95]
export const bd = s => 240 / s.bpm
PL.forEach(p => p.t = SEC[p.s].a + (p.b - 1) * bd(SEC[p.s]))

// Ragam gerak sepanjang musik (dipakai 2D dan 3D).
export const MV = []
SEC.forEach((S, si) => JD[si].forEach((n, k) => { const t0 = S.a + 2 * k * bd(S); MV.push({ si, n, t0, t1: k == JD[si].length - 1 ? S.a + S.d : t0 + 2 * bd(S) }) }))

// Tujuh karakter 3D. g: 'L' laki-laki / 'P' perempuan.
export const CHR = [
  { id: 'L1', nm: 'Radit', g: 'L', col: '#8c1d2c', col2: '#e3a93a', hair: 'neat', tag: 'Pemimpin barisan', ciri: 'Tanjak belah mumbang merah-emas, keris kecil di pinggang, dan senyum percaya diri. Bisa kamu kendalikan dengan kode rahasia.' },
  { id: 'L2', nm: 'Zaka', g: 'L', col: '#0f6b4c', col2: '#f2c14e', hair: 'glasses', tag: 'Si cermat', ciri: 'Kacamata bulat berbingkai emas, busana hijau zamrud, dan selempang songket emas.' },
  { id: 'L3', nm: 'Noval', g: 'L', col: '#4b2a7b', col2: '#e8b84a', hair: 'curly', tag: 'Si jangkung', ciri: 'Paling tinggi, rambut ikal, busana ungu tua dengan bros emas di dada.' },
  { id: 'L4', nm: 'Zecho', g: 'L', col: '#14506e', col2: '#f0c75e', hair: 'spiky', tag: 'Si lincah', ciri: 'Rambut jabrik di bawah tanjak, bintik pipi, dan busana biru Musi.' },
  { id: 'P1', nm: 'Azizah', g: 'P', col: '#1f7a55', col2: '#f2c14e', hair: 'hijab', tag: 'Si lembut', ciri: 'Hijab krem berpeniti cempako emas, songket hijau, dan selendang emas.' },
  { id: 'P2', nm: 'Putri', g: 'P', col: '#b3122e', col2: '#f2c14e', hair: 'kesuhun', tag: 'Penari utama', ciri: 'Mahkota kesuhun dengan kembang goyang, kalung teratai emas, dan Aesan Gede merah.' },
  { id: 'P3', nm: 'Karina', g: 'P', col: '#b8336a', col2: '#ffd27a', hair: 'sanggul', tag: 'Si ceria', ciri: 'Sanggul malang berhias bunga seruni merah muda, poni lucu, dan kipas songket.' }]
export const NM = CHR.map(c => c.nm)

// Isi museum: papan informasi asli + koleksi.
export const PN = [
  { k: 'ampera', t: 'Jembatan Ampera', d: 'Jembatan di atas Sungai Musi yang menghubungkan Seberang Ilir dan Seberang Ulu. Dibangun mulai April 1962 dengan dana rampasan perang Jepang dan diresmikan 1965 dengan nama Jembatan Bung Karno; sejak 1966 bernama Ampera (Amanat Penderitaan Rakyat). Panjangnya sekitar 1,1 km, lebar 22 m, dua menara setinggi 63 m berjarak 75 m. Bagian tengahnya dulu dapat diangkat agar kapal besar lewat, dihentikan sejak 1970.' },
  { k: 'sejarah', t: 'Sejarah Palembang', d: 'Palembang termasuk kota tertua di Indonesia. Prasasti Kedukan Bukit bertarikh 683 M menyebut perjalanan Dapunta Hyang dan pendirian permukiman, dan dari sinilah usia kota dihitung. Palembang menjadi pusat Kerajaan Sriwijaya, kerajaan maritim yang berjaya sejak abad ke-7.' },
  { k: 'budaya', t: 'Budaya Sumatera Selatan', d: 'Sungai Musi menjadi urat nadi kehidupan. Kain songket Palembang ditenun dengan benang emas. Busana adat Aesan Gede dan Aesan Paksangko dipakai pada upacara besar. Tamu dihormati dengan tepak sirih dan tari penyambutan.' },
  { k: 'tari', t: 'Pengertian Tari', d: 'Tari adalah gerak tubuh yang ditata secara berirama dan ekspresif, biasanya diiringi musik, untuk menyampaikan rasa, makna, atau cerita. Unsur pokoknya: gerak, ruang, waktu, dan tenaga.' },
  { k: 'seni', t: 'Seni Tari Palembang', d: 'Contohnya Tari Gending Sriwijaya untuk menyambut tamu agung, Tari Tanggai dengan kuku emas lentik, dan Tari Tepak Keraton. Tari Sambut Seruni Musi terinspirasi dari Gending Sriwijaya.' }]

export const EX = [
  { k: 'gong', t: 'Gong & Gamelan Palembang', d: 'Gamelan Palembang berkembang di lingkungan Kesultanan Palembang Darussalam. Gong besar menandai awal setiap bagian Tari Sambut Seruni Musi agar penari tetap kompak.' },
  { k: 'tepak', t: 'Tepak Sirih', d: 'Kotak berisi sirih, pinang, kapur, dan gambir. Dalam adat Palembang, tepak sirih dipersembahkan kepada tamu sebagai tanda penghormatan dan keramahan.' },
  { k: 'tanjak', t: 'Tanjak', d: 'Ikat kepala laki-laki Palembang dari kain songket atau batik yang dilipat membentuk puncak. Bentuk tanjak menandakan kehormatan dan wibawa pemakainya.' },
  { k: 'songket', t: 'Kain Songket Palembang', d: 'Ditenun dengan benang emas atau perak di atas benang sutra. Motif terkenal: lepus, tabur, bungo cino, dan pucuk rebung. Songket Palembang termasuk Warisan Budaya Takbenda Indonesia.' },
  { k: 'aesan', t: 'Aesan Gede', d: 'Busana kebesaran Palembang berwarna merah-emas, dilengkapi mahkota kesuhun, kembang goyang, kalung teratai, dan tanggai. Dahulu dipakai keluarga bangsawan, kini dipakai pengantin dan penari.' },
  { k: 'amperam', t: 'Miniatur Jembatan Ampera', d: 'Miniatur ikon kota Palembang. Dua menara dan bentang tengahnya diabadikan dalam Pola 10 "Jembatan Ampera" pada Bagian 5 tarian.' },
  { k: 'bidar', t: 'Perahu Bidar', d: 'Perahu panjang ramping yang didayung puluhan orang secara serempak dalam lomba di Sungai Musi, terutama saat perayaan 17 Agustus. Lambang kerja sama (Pola 9).' },
  { k: 'prasasti', t: 'Prasasti Kedukan Bukit', d: 'Prasasti batu berhuruf Pallawa dan berbahasa Melayu Kuno, ditemukan di tepi Sungai Tatang, Palembang. Bertarikh 683 M dan dijadikan dasar hari jadi kota Palembang.' },
  { k: 'limas', t: 'Rumah Limas', d: 'Rumah panggung tradisional Palembang beratap limas bertingkat (kekijing). Tingkat lantainya menunjukkan kedudukan tamu dalam upacara adat. Gambarnya ada di uang Rp10.000 lama.' },
  { k: 'kipas', t: 'Kipas & Tanggai', d: 'Kipas dipakai penari perempuan untuk gerak Kipas Mekar. Tanggai adalah kuku emas lentik yang dipasang di jari penari, ciri khas Tari Tanggai Palembang.' }]

export const ART = [
  { k: 'lukis1', img: 'museum-sriwijaya.png', t: 'Lukisan: Kapal Sriwijaya', d: 'Kapal dagang Sriwijaya berlabuh di Sungai Musi pada abad ke-7. Sriwijaya menguasai jalur perdagangan Selat Malaka dan menjadi pusat belajar agama Buddha.' },
  { k: 'lukis2', img: 'museum-tari.png', t: 'Lukisan: Tari Penyambutan', d: 'Penari perempuan berbusana Aesan Gede dengan tanggai emas membawa tepak sirih, diiringi penari laki-laki bertanjak. Inspirasi Tari Sambut Seruni Musi.' },
  { k: 'lukis3', img: 'hero-musi.png', t: 'Lukisan: Fajar di Sungai Musi', d: 'Jembatan Ampera, rumah limas, dan perahu bidar menyambut pagi. Suasana inilah yang dibuka oleh Bagian 1 musik tarian.' }]
