// Dunia 3D: Panggung Tepian Musi (terbuka, meriah) dan Museum Seni & Budaya Palembang (gedung tertutup, scene terpisah).
// Satu renderer, dua scene. Tujuh penari chibi berpindah scene saat pindah dunia.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { Char, dancePose, idlePose, groupOf, WAVE } from './characters.js'
import { songketMat, wood, marble, carving, sky, glow, petal, board, sign, img, label } from './tex.js'

const V3 = THREE.Vector3, PI = Math.PI
const MOB = matchMedia('(pointer:coarse)').matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
const clamp = (v, a, b) => v < a ? a : v > b ? b : v
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt))
const angD = (a, b) => { let d = (b - a) % (PI * 2); if (d > PI) d -= PI * 2; if (d < -PI) d += PI * 2; return d }
const rnd = (a, b) => a + Math.random() * (b - a)

/* ===== Material & bentuk dasar ===== */
const MC = new Map(), memo = (k, f) => { if (!MC.has(k)) MC.set(k, f()); return MC.get(k) }
const std = (c, r = .6, m = 0, x = {}) => memo('s' + c + r + m + JSON.stringify(x), () => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...x }))
const GOLD = () => std('#f0be4f', .25, 1)
const basic = (c, x = {}) => memo('b' + c + JSON.stringify(x), () => new THREE.MeshBasicMaterial({ color: c, ...x }))
function add(p, geo, m, x = 0, y = 0, z = 0, rot, sc) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); if (rot) o.rotation.set(...rot); if (sc) o.scale.set(...sc); p.add(o); return o }
const grp = (p, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g }
const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d), CYL = (a, b, h, s = 24, o) => new THREE.CylinderGeometry(a, b, h, s, 1, o), SPH = (r, w = 20, h = 14) => new THREE.SphereGeometry(r, w, h)

/* ===== Tekstur prosedural tambahan ===== */
const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h || w; return [c, c.getContext('2d')] }
const tx = (c, rep, srgb = true) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep) } return t }
// Mandala bunga seruni emas (lantai panggung & lambang latar).
function flowerTex(S = 512) {
  const [c, q] = cvs(S); q.translate(S / 2, S / 2)
  q.strokeStyle = '#ffd76a'; q.lineWidth = 8; q.beginPath(); q.arc(0, 0, S * .485, 0, 7); q.stroke(); q.lineWidth = 3; q.beginPath(); q.arc(0, 0, S * .455, 0, 7); q.stroke()
  for (let i = 0; i < 48; i++) { q.save(); q.rotate(i / 48 * PI * 2); q.fillStyle = '#ffd76a'; q.beginPath(); q.moveTo(0, -S * .47); q.lineTo(6, -S * .44); q.lineTo(0, -S * .41); q.lineTo(-6, -S * .44); q.fill(); q.restore() }
  ;[[22, .4, 22, '#ffe39a', '#d6922a'], [16, .3, 30, '#ff9db1', '#c42a45'], [10, .2, 30, '#fff2c0', '#e3a93a']].forEach(([n, R, w, a, b], ring) => {
    R *= S; for (let i = 0; i < n; i++) { q.save(); q.rotate(i / n * PI * 2 + ring * .18); const g = q.createLinearGradient(0, -R, 0, 0); g.addColorStop(0, a); g.addColorStop(1, b); q.fillStyle = g; q.beginPath(); q.ellipse(0, -R * .55, w, R * .47, 0, 0, PI * 2); q.fill(); q.strokeStyle = '#5c0b1a66'; q.lineWidth = 2.5; q.stroke(); q.restore() }
  })
  const g = q.createRadialGradient(0, 0, 0, 0, 0, S * .13); g.addColorStop(0, '#fff6d0'); g.addColorStop(.55, '#e3a93a'); g.addColorStop(1, '#8c1d2c'); q.fillStyle = g; q.beginPath(); q.arc(0, 0, S * .13, 0, 7); q.fill()
  return tx(c)
}
function tiles() {
  const S = 512, [c, q] = cvs(S); q.fillStyle = '#2a1a1c'; q.fillRect(0, 0, S, S)
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { q.fillStyle = `hsl(${8 + Math.random() * 14},${18 + Math.random() * 10}%,${20 + Math.random() * 7}%)`; q.fillRect(x * 128 + 3, y * 128 + 3, 122, 122) }
  q.fillStyle = '#b8862e'; for (const [x, y] of [[128, 128], [384, 128], [128, 384], [384, 384]]) { q.beginPath(); q.moveTo(x, y - 18); q.lineTo(x + 18, y); q.lineTo(x, y + 18); q.lineTo(x - 18, y); q.fill() }
  return tx(c, [26, 14])
}
function windows() {
  const [c, q] = cvs(128, 256); q.fillStyle = '#120a18'; q.fillRect(0, 0, 128, 256)
  for (let y = 8; y < 250; y += 16) for (let x = 8; x < 124; x += 14) if (Math.random() < .42) { q.fillStyle = ['#ffcf7a', '#ffe7b0', '#ff9a5c', '#9fd8ff'][Math.random() * 4 | 0]; q.globalAlpha = rnd(.5, 1); q.fillRect(x, y, 7, 9) }
  return tx(c)
}
function beamTex() { const [c, q] = cvs(4, 128), g = q.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.6, 'rgba(255,255,255,.25)'); g.addColorStop(1, 'rgba(255,255,255,0)'); q.fillStyle = g; q.fillRect(0, 0, 4, 128); return tx(c) }
function blobTex() { const [c, q] = cvs(128), g = q.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(20,4,8,.85)'); g.addColorStop(.6, 'rgba(20,4,8,.35)'); g.addColorStop(1, 'rgba(20,4,8,0)'); q.fillStyle = g; q.fillRect(0, 0, 128, 128); return tx(c) }
function pallawa() {
  const [c, q] = cvs(512, 512); q.fillStyle = '#7d7468'; q.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 3000; i++) { q.fillStyle = `rgba(${Math.random() < .5 ? '40,34,30' : '200,190,170'},${Math.random() * .25})`; q.fillRect(Math.random() * 512, Math.random() * 512, 3, 3) }
  q.strokeStyle = '#3a322b'; q.lineWidth = 4; q.lineCap = 'round'
  for (let y = 60; y < 470; y += 44) for (let x = 40; x < 470; x += 26 + Math.random() * 10) { q.beginPath(); q.moveTo(x, y); q.quadraticCurveTo(x + rnd(-8, 14), y - rnd(8, 22), x + rnd(6, 16), y + rnd(-4, 8)); q.stroke() }
  return tx(c)
}
const GL = new Map(), glowT = c => { if (!GL.has(c)) GL.set(c, glow(c)); return GL.get(c) }

// Halo cahaya: satu draw call untuk banyak titik lampu.
function halos(parent, pts, col, size = 1.6, op = .9) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3))
  const m = new THREE.PointsMaterial({ map: glowT('#ffd76a'), color: col, size, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending })
  const p = new THREE.Points(g, m); parent.add(p); return p
}
// Kerucut sorot cahaya (volumetrik palsu).
function beam(parent, r, len, col, op = .14) {
  const g = new THREE.ConeGeometry(r, len, 32, 1, true); g.translate(0, -len / 2, 0)
  const m = new THREE.MeshBasicMaterial({ map: memo('beamT', beamTex), color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })
  const b = new THREE.Mesh(g, m); parent.add(b); return b
}
const aim = (o, from, to) => { o.position.copy(from); o.lookAt(to); o.rotateX(-PI / 2) }

// Gabungkan mesh statis yang sematerial menjadi satu geometri: ratusan draw call jadi puluhan (penting untuk HP).
function bake(S) {
  S.updateMatrixWorld(true); const by = new Map()
  const walk = o => { if (o.userData.dyn) return; o.children.slice().forEach(walk); const g = o.geometry
    if (o.isMesh && !o.isInstancedMesh && !Array.isArray(o.material) && !o.material.transparent && g.index && g.attributes.normal && g.attributes.uv) { const k = o.material.uuid + '|' + o.castShadow + o.receiveShadow; if (!by.has(k)) by.set(k, []); by.get(k).push(o) } }
  walk(S)
  const v = new V3(), n = new V3(), nm = new THREE.Matrix3()
  for (const list of by.values()) {
    if (list.length < 2) continue
    let nv = 0, ni = 0; list.forEach(o => { nv += o.geometry.attributes.position.count; ni += o.geometry.index.count })
    const P = new Float32Array(nv * 3), N = new Float32Array(nv * 3), UV = new Float32Array(nv * 2), I = new Uint32Array(ni); let ov = 0, oi = 0
    for (const o of list) {
      const g = o.geometry, p = g.attributes.position, q = g.attributes.normal, u = g.attributes.uv, ix = g.index; nm.getNormalMatrix(o.matrixWorld)
      for (let i = 0; i < p.count; i++) { const j = ov + i; v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); P[j * 3] = v.x; P[j * 3 + 1] = v.y; P[j * 3 + 2] = v.z; n.fromBufferAttribute(q, i).applyMatrix3(nm).normalize(); N[j * 3] = n.x; N[j * 3 + 1] = n.y; N[j * 3 + 2] = n.z; UV[j * 2] = u.getX(i); UV[j * 2 + 1] = u.getY(i) }
      for (let i = 0; i < ix.count; i++) I[oi + i] = ix.getX(i) + ov
      ov += p.count; oi += ix.count; o.removeFromParent()
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.BufferAttribute(UV, 2)); g.setIndex(new THREE.BufferAttribute(I, 1))
    const m = new THREE.Mesh(g, list[0].material); m.castShadow = list[0].castShadow; m.receiveShadow = list[0].receiveShadow; S.add(m)
  }
}

/* ===== Rumah limas Palembang ===== */
function limas(parent, x, z, ry, s = 1, y = -1.2) {
  const g = grp(parent, x, y, z); g.rotation.y = ry; g.scale.setScalar(s)
  const wd = memo('limasW', () => new THREE.MeshStandardMaterial({ map: wood([2, 1], ['#6b3417', '#4a220e']), roughness: .75 })), roof = std('#4a1610', .7), dk = std('#2a120a', .8)
  for (let i = -1; i <= 1; i++) for (let k = -1; k <= 1; k++) add(g, CYL(.16, .18, 2.4, 8), dk, i * 3.6, 1.2, k * 2.6)
  add(g, BOX(8.8, .35, 6.6), dk, 0, 2.45, 0)
  add(g, BOX(8, 3.2, 6), wd, 0, 4.2, 0)
  add(g, BOX(8.4, .25, .25), GOLD(), 0, 5.8, 3.05)
  for (let i = -1; i <= 1; i++) add(g, new THREE.PlaneGeometry(1.4, 1.6), basic('#ffbf66'), i * 2.5, 4.3, 3.02)
  add(g, CYL(0, 6.5, 2.4, 4), roof, 0, 7, 0, [0, PI / 4, 0], [1, 1, .78])
  add(g, CYL(0, 4, 2.8, 4), roof, 0, 8.9, 0, [0, PI / 4, 0], [1, 1, .7])
  for (const sx of [-1, 1]) add(g, new THREE.ConeGeometry(.18, 1.2, 6), GOLD(), sx * 1.6, 10.6, 0, [0, 0, sx * -.4])
  add(g, new THREE.ConeGeometry(.22, 1.6, 6), GOLD(), 0, 10.9, 0)
  for (let i = 0; i < 4; i++) add(g, BOX(2.6, .22, .9), dk, 0, 2.2 - i * .55, 3.6 + i * .55)
  if (s > .5) halos(g, [[-2.5, 4.3, 3.4], [0, 4.3, 3.4], [2.5, 4.3, 3.4]], '#ffb35c', 3.4, .55)
  return g
}

/* ===== PANGGUNG TEPIAN MUSI ===== */
function buildStage() {
  const S = new THREE.Scene(); S.fog = new THREE.Fog('#3b1a44', 70, 300); S.environmentIntensity = .42
  const U = { lan: [], beams: [], spots: [], flags: [], boats: [], sweep: [] }
  // Langit senja-malam, bintang, bulan
  add(S, SPH(320, 32, 20), new THREE.MeshBasicMaterial({ map: sky([[0, '#05031a'], [.3, '#1a0b45'], [.43, '#56185e'], [.49, '#d9573f'], [.515, '#ffbf6a'], [.56, '#40142e'], [1, '#0e0410']]), side: THREE.BackSide, fog: false, depthWrite: false }))
  { const n = 700, p = []; for (let i = 0; i < n; i++) { const a = Math.random() * PI * 2, e = rnd(.12, 1.45); p.push([Math.cos(a) * Math.cos(e) * 300, Math.sin(e) * 300, Math.sin(a) * Math.cos(e) * 300]) } const st = halos(S, p, '#ffffff', 2.2, .85); st.material.sizeAttenuation = false; st.material.fog = false; U.stars = st }
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT('#fff1c8'), fog: false, depthWrite: false, blending: THREE.AdditiveBlending })); moon.position.set(-90, 95, -240); moon.scale.set(60, 60, 1); S.add(moon)
  add(S, SPH(7, 24, 16), basic('#fff6dc', { fog: false }), -90, 95, -242)

  // Cahaya
  S.add(new THREE.HemisphereLight('#ffd9b8', '#2a1038', 1.1))
  const key = U.key = new THREE.DirectionalLight('#ffe2c4', 2.1); key.position.set(10, 24, 18); key.target.position.set(0, 0, 0); S.add(key, key.target)
  Object.assign(key.shadow.camera, { left: -15, right: 15, top: 14, bottom: -12, near: 4, far: 70 }); key.shadow.mapSize.set(MOB ? 1024 : 2048, MOB ? 1024 : 2048); key.shadow.bias = -.0008; key.shadow.normalBias = .03
  const rim = new THREE.DirectionalLight('#ff7ab0', 1.1); rim.position.set(-14, 10, -18); S.add(rim)
  const fill = new THREE.PointLight('#ffb35c', 2.2, 34, 0); fill.position.set(0, 9, -3); S.add(fill); U.fill = fill
  ;[[-11, 15, 13, '#ffe0a8'], [11, 15, 13, '#ffc0d8'], [0, 17, 16, '#fff2d8']].forEach(([x, y, z, c]) => { const s = new THREE.SpotLight(c, 3, 60, .42, .55, 0); s.position.set(x, y, z); s.target.position.set(0, 0, 0); S.add(s, s.target); U.spots.push(s); const b = beam(S, 3.6, 22, c, .085); aim(b, s.position, new V3(0, 0, 0)); U.beams.push([b, s]) })

  // Pelataran & tepian sungai
  const plaza = add(S, new THREE.PlaneGeometry(150, 80), new THREE.MeshStandardMaterial({ map: tiles(), roughness: .55, metalness: .15 }), 0, -1.2, 14, [-PI / 2, 0, 0]); plaza.receiveShadow = true
  add(S, new THREE.PlaneGeometry(6, 28), songketMat('#8c1d2c', '#f2c14e', [1.4, 6]), 0, -1.18, 23, [-PI / 2, 0, 0])
  add(S, BOX(150, 1.6, 1.2), std('#4a3026', .8), 0, -1.6, -26)
  add(S, BOX(150, .25, .5), GOLD(), 0, -.7, -25.8)
  { const p = []; for (let x = -70; x <= 70; x += 7) { add(S, CYL(.08, .1, 3.2, 8), std('#2a1a14', .5, .6), x, .4, -25.4); add(S, SPH(.28, 12, 8), basic('#ffe2a0'), x, 2.1, -25.4); p.push([x, 2.1, -25.4]) } halos(S, p, '#ffcf7a', 3.2) }

  // Sungai Musi
  const river = add(S, new THREE.PlaneGeometry(700, 300), new THREE.MeshStandardMaterial({ color: '#0c2440', roughness: .12, metalness: .9, envMapIntensity: .35 }), 0, -2.4, -176, [-PI / 2, 0, 0]); U.river = river
  const ripT = (() => { const [c, q] = cvs(256); q.fillStyle = '#000'; q.fillRect(0, 0, 256, 256); q.strokeStyle = '#fff'; for (let i = 0; i < 140; i++) { q.globalAlpha = rnd(.08, .4); q.lineWidth = rnd(1, 2.5); const x = Math.random() * 256, y = Math.random() * 256, w = rnd(10, 40); q.beginPath(); q.moveTo(x, y); q.lineTo(x + w, y); q.stroke() } return tx(c, [40, 18]) })()
  const rip = add(S, new THREE.PlaneGeometry(700, 300), new THREE.MeshBasicMaterial({ map: ripT, color: '#ffb36a', transparent: true, opacity: .22, blending: THREE.AdditiveBlending, depthWrite: false }), 0, -2.38, -176, [-PI / 2, 0, 0]); U.rip = ripT

  // Jembatan Ampera dengan lampu berkilau
  const red = std('#c3212c', .42, .35), amp = grp(S, 0, -2.4, -82), lamps = []
  add(amp, BOX(260, 1.6, 7), red, 0, 10, 0); add(amp, BOX(260, .5, 7.6), std('#3a1a1a', .7), 0, 9, 0)
  for (const sx of [-1, 1]) {
    const tx0 = sx * 24
    for (const sz of [-1, 1]) { add(amp, BOX(2.4, 36, 2.4), red, tx0, 18, sz * 3.4); for (let y = 2; y <= 35; y += 3) lamps.push([tx0 + 1.3 * -sx, y - 2.4 + 2.4, sz * 3.4 + 1.3]) }
    add(amp, BOX(3, 3.2, 9.6), red, tx0, 35.6, 0)
    for (let y = 14; y < 33; y += 6) add(amp, BOX(2, .6, 6.8), red, tx0, y, 0)
    for (let i = 0; i < 6; i++) add(amp, CYL(1.3, 1.6, 12, 12), std('#5a4a44', .9), sx * (40 + i * 22), 4, 0)
  }
  for (const sz of [-1, 1]) {
    add(amp, BOX(50, 2.4, 1.2), red, 0, 33, sz * 3.4)
    for (let i = 0; i < 8; i++) { const x = -21 + i * 6, d = add(amp, BOX(.6, 7.2, .6), red, x + 3, 29.6 + 2.4 - 2.4, sz * 3.4); d.rotation.z = i % 2 ? .6 : -.6; d.position.y = 30 }
  }
  for (let x = -130; x <= 130; x += 4) for (const sz of [-1, 1]) lamps.push([x, 11.3, sz * 3.6])
  for (let x = -23; x <= 23; x += 3) lamps.push([x, 34.6, 4.1])
  { const im = new THREE.InstancedMesh(SPH(.32, 8, 6), basic('#ffd98a'), lamps.length), m = new THREE.Matrix4(); lamps.forEach((p, i) => { m.makeTranslation(p[0], p[1], p[2]); im.setMatrixAt(i, m) }); amp.add(im); U.ampHalo = halos(amp, lamps, '#ffbf5c', 3.4, .75) }
  const reflM = new THREE.MeshBasicMaterial({ map: glowT('#ffb35c'), transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false })
  for (const x of [-24, 24, -60, 60, 0, -95, 95]) add(S, new THREE.PlaneGeometry(x % 48 ? 3 : 7, 70), reflM, x, -2.35, -50, [-PI / 2, 0, 0])

  // Siluet kota di seberang
  { const n = 90, wt = windows(), im = new THREE.InstancedMesh(BOX(1, 1, 1), new THREE.MeshStandardMaterial({ map: wt, emissive: '#ffffff', emissiveMap: wt, emissiveIntensity: .9, roughness: .9 }), n), m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new V3(), p = new V3()
    for (let i = 0; i < n; i++) { const w = rnd(5, 12), h = rnd(8, 34); p.set(rnd(-200, 200), -2.4 + h / 2, rnd(-150, -122)); s.set(w, h, rnd(5, 10)); m.compose(p, q, s); im.setMatrixAt(i, m) } S.add(im) }

  // Perahu bidar berlampion
  for (let i = 0; i < 5; i++) {
    const b = grp(S, rnd(-70, 70), -2.3, -40 - i * 7), col = ['#b3122e', '#0f6b4c', '#e3a93a', '#14506e', '#8c1d2c'][i]
    add(b, new THREE.CapsuleGeometry(.6, 9, 4, 12), songketMat(col, '#f2c14e', [3, 1]), 0, .2, 0, [0, 0, PI / 2], [.45, 1, 1])
    for (let k = -3; k <= 3; k++) add(b, CYL(.12, .12, .5, 6), std('#2a1712'), k * 1.2, .7, 0)
    const lp = []; for (let k = -2; k <= 2; k += 2) { add(b, SPH(.28, 10, 8), basic(k ? '#ff5a6a' : '#ffd76a'), k * 1.5, 1.8, 0); lp.push([k * 1.5, 1.8, 0]) } halos(b, lp, '#ff9a6a', 2.4)
    b.userData.dyn = 1; U.boats.push({ g: b, v: rnd(1.2, 2.6) * (i % 2 ? 1 : -1), ph: rnd(0, 6) })
  }

  // Rumah limas di kiri-kanan pelataran
  limas(S, -34, -14, .5); limas(S, 34, -14, -.5); limas(S, -50, 6, PI / 2 - .2, 1.1); limas(S, 50, 6, -PI / 2 + .2, 1.1)

  // Panggung utama
  const SW = 26, SD = 16, side = new THREE.MeshStandardMaterial({ map: carving('#5c0b1a', '#e3a93a', [10, .6]), roughness: .55, metalness: .2 })
  const top = new THREE.MeshStandardMaterial({ map: wood([7, 4], ['#8a4a22', '#6b3417']), roughness: .38, metalness: .05 })
  const plat = add(S, BOX(SW, 1.2, SD), [side, side, top, side, side, side], 0, -.6, 0); plat.receiveShadow = true
  for (const z of [SD / 2, -SD / 2]) add(S, BOX(SW + .3, .18, .18), GOLD(), 0, 0, z)
  for (const x of [SW / 2, -SW / 2]) add(S, BOX(.18, .18, SD + .3), GOLD(), x, 0, 0)
  for (let i = 0; i < 3; i++) add(S, BOX(9 - i * .1, .4, .9), i ? std('#4a0c18', .6) : songketMat('#8c1d2c', '#f2c14e', [3, .4]), 0, -.2 - i * .4, SD / 2 + .45 + i * .9)
  const carpet = add(S, new THREE.PlaneGeometry(21, 12), songketMat('#8c1d2c', '#f2c14e', [5, 3]), 0, .01, .4, [-PI / 2, 0, 0]); carpet.receiveShadow = true
  const fT = flowerTex()
  const med = add(S, new THREE.CircleGeometry(4.4, 64), new THREE.MeshStandardMaterial({ map: fT, transparent: true, roughness: .35, metalness: .5, emissive: '#ffb04a', emissiveMap: fT, emissiveIntensity: .25 }), 0, .025, .4, [-PI / 2, 0, 0]); med.receiveShadow = true; U.med = med
  // Lampu tepi panggung (footlights)
  { const p = []; for (let x = -12; x <= 12; x += 1.5) { add(S, SPH(.14, 8, 6), basic('#fff0c0'), x, .12, SD / 2 - .25); p.push([x, .2, SD / 2 - .2]) } U.foot = halos(S, p, '#ffd76a', 1.4) }

  // Latar gerbang ukiran + atap limas + lambang seruni
  const back = grp(S, 0, 0, -SD / 2 + .3)
  add(back, BOX(24, 11, .6), new THREE.MeshStandardMaterial({ map: carving('#6e0f20', '#f0be4f', [6, 3]), roughness: .45, metalness: .35 }), 0, 5.5, 0).receiveShadow = true
  for (const x of [-12.2, 12.2]) add(back, BOX(.5, 11.4, .9), GOLD(), x, 5.7, 0)
  add(back, BOX(24.9, .5, .9), GOLD(), 0, 11.2, 0)
  add(back, CYL(0, 15, 3, 4), std('#4a0c14', .55, .25), 0, 13.2, 0, [0, PI / 4, 0], [1, 1, .14])
  add(back, CYL(0, 9, 3.4, 4), std('#5c0b1a', .5, .3), 0, 15.6, 0, [0, PI / 4, 0], [1, 1, .16])
  for (let i = -4; i <= 4; i++) add(back, new THREE.ConeGeometry(.2, 1.2, 6), GOLD(), i * 2.6, 11.9 + (4 - Math.abs(i)) * .55 * 0, .55, [0, 0, i * -.06])
  add(back, new THREE.ConeGeometry(.4, 2.6, 8), GOLD(), 0, 18.3, 0)
  for (const sx of [-1, 1]) add(back, new THREE.ConeGeometry(.22, 1.8, 6), GOLD(), sx * 2.2, 16.4, 0, [0, 0, sx * -.5])
  const emb = grp(back, 0, 6.2, .38); U.emb = emb; emb.userData.dyn = 1
  add(emb, new THREE.CircleGeometry(3.4, 64), new THREE.MeshStandardMaterial({ map: fT, transparent: true, roughness: .3, metalness: .6, emissive: '#ffc060', emissiveMap: fT, emissiveIntensity: .5 }))
  U.embRing = grp(emb); { const p = []; for (let i = 0; i < 24; i++) { const a = i / 24 * PI * 2; add(U.embRing, SPH(.1, 8, 6), basic('#fff3c4'), Math.cos(a) * 3.7, Math.sin(a) * 3.7, .05); p.push([Math.cos(a) * 3.7, Math.sin(a) * 3.7, .1]) } halos(U.embRing, p, '#ffd76a', 1.3) }
  const sg = sign('Tari Sambut Seruni Musi', 'SMP NEGERI 18 PALEMBANG'); add(back, new THREE.PlaneGeometry(9, 2.25), new THREE.MeshBasicMaterial({ map: sg, toneMapped: false }), 0, 1.75, .34)
  // Tirai beludru di sisi latar
  const velvet = new THREE.MeshPhysicalMaterial({ color: '#7a0c1c', roughness: .7, sheen: 1, sheenColor: new THREE.Color('#ff7a8a'), sheenRoughness: .35, side: THREE.DoubleSide })
  const drape = (w, h) => { const g = new THREE.PlaneGeometry(w, h, 30, 6), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), pinch = .5 + .5 * Math.cos((y / h + .5) * PI * .9); p.setZ(i, Math.sin(x / w * PI * 10) * .28 * pinch); p.setX(i, x * (.55 + .45 * (1 - pinch * .6))) } g.computeVertexNormals(); return g }
  for (const sx of [-1, 1]) { add(S, drape(4.4, 12.5), velvet, sx * 11, 5.6, -SD / 2 + 1.1); add(S, new THREE.TorusGeometry(.5, .08, 8, 24), GOLD(), sx * 11, 3.4, -SD / 2 + 1.35) }
  add(S, BOX(26, 1.7, .4), songketMat('#5c0b1a', '#f2c14e', [8, 1]), 0, 12.05, -SD / 2 + 1.2)
  // Tiang-tiang emas berlampion
  const pil = std('#8c1d2c', .4, .3), tops = []
  for (const [x, z, h] of [[-13.6, -7, 13], [13.6, -7, 13], [-13.6, 7.4, 8], [13.6, 7.4, 8]]) {
    add(S, CYL(.55, .65, h, 24), pil, x, h / 2 - 1.2, z); for (let y = 1; y < h - 1; y += 2.2) add(S, new THREE.TorusGeometry(.62, .09, 8, 24), GOLD(), x, y - 1.2, z, [PI / 2, 0, 0])
    add(S, CYL(.9, .7, .5, 24), GOLD(), x, h - 1.2, z); add(S, SPH(.6, 16, 12), basic('#ffcf6a'), x, h - .4, z); tops.push([x, h - .4, z])
  }
  halos(S, tops, '#ffbf5c', 6, .8)
  // Untaian lampion melintang
  { const cols = ['#ff3b55', '#ffcf4a', '#ff7a2a', '#ff5ab0', '#ffe08a'], pos = [], col = [], lineM = new THREE.LineBasicMaterial({ color: '#e3a93a', transparent: true, opacity: .7 })
    const strings = [[-13.6, 11.8, -7, 13.6, 11.8, -7, 1.6], [-13.6, 6.8, 7.4, 13.6, 6.8, 7.4, 1.3], [-13.6, 11.8, -7, 13.6, 6.8, 7.4, 2], [13.6, 11.8, -7, -13.6, 6.8, 7.4, 2], [-13.6, 6.8, 7.4, -30, 9, 26, 2.4], [13.6, 6.8, 7.4, 30, 9, 26, 2.4], [-13.6, 11.8, -7, -34, 12, -14, 2.5], [13.6, 11.8, -7, 34, 12, -14, 2.5]]
    for (const [ax, ay, az, bx, by, bz, sag] of strings) { const ln = []; for (let i = 0; i <= 24; i++) { const u = i / 24, p = new V3(ax + (bx - ax) * u, ay + (by - ay) * u - sag * 4 * u * (1 - u), az + (bz - az) * u); ln.push(p); if (i % 2 && i < 24) { pos.push(p.clone().add(new V3(0, -.45, 0))); col.push(cols[pos.length % 5]) } } S.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ln), lineM)) }
    const g = SPH(.36, 14, 10); g.scale(1, 1.25, 1); const lm = U.lanM = new THREE.MeshBasicMaterial({ color: '#ffffff' }), im = new THREE.InstancedMesh(g, lm, pos.length), m = new THREE.Matrix4(), c = new THREE.Color()
    pos.forEach((p, i) => { m.makeTranslation(p.x, p.y, p.z); im.setMatrixAt(i, m); im.setColorAt(i, c.set(col[i])) }); S.add(im)
    U.lanH = halos(S, pos.map(p => [p.x, p.y, p.z]), '#ff9a6a', 2.4, .8) }
  // Umbul-umbul warna-warni
  { const fc = [['#b3122e', '#f2c14e'], ['#0f6b4c', '#f2c14e'], ['#4b2a7b', '#e8b84a'], ['#14506e', '#f0c75e'], ['#e3a93a', '#8c1d2c']]
    let n = 0; for (const sx of [-1, 1]) for (let z = -18; z <= 34; z += 6.5) { const x = sx * (z < 9 ? 19 : 17), [a, b] = fc[n++ % 5], f = grp(S, x, -1.2, z); add(f, CYL(.07, .09, 11, 8), GOLD(), 0, 5.5, 0); const fl = grp(f, 0, 10.8, 0); fl.userData.dyn = 1; add(fl, new THREE.PlaneGeometry(1.1, 5.2), songketMat(a, b, [.5, 2], { p: { side: THREE.DoubleSide } }), .58, -2.6, 0); U.flags.push(fl) } }
  // Lampu sorot ke langit
  for (const x of [-30, -12, 12, 30]) { const b = beam(S, 7, 150, x < 0 ? '#ffd0a0' : '#ffb0d8', .05); U.sweep.push({ b, from: new V3(x, -1, -22), ph: x }) }

  // Kelopak seruni berjatuhan + konfeti + kembang api
  U.petals = (() => { const n = MOB ? 160 : 260, p = new Float32Array(n * 3), sp = []; for (let i = 0; i < n; i++) { p.set([rnd(-17, 17), rnd(0, 18), rnd(-9, 14)], i * 3); sp.push([rnd(.5, 1.2), rnd(0, 6)]) } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: petal(), size: .42, transparent: true, depthWrite: false, alphaTest: .05 })); S.add(pts); return { pts, sp, n } })()
  U.fw = (() => { const B = 8, N = 110, pos = new Float32Array(B * N * 3).fill(-999), col = new Float32Array(B * N * 3), vel = new Float32Array(B * N * 3), g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: glowT('#ffffff'), size: 1.5, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); pts.frustumCulled = false; S.add(pts)
    const bs = Array.from({ length: B }, () => ({ age: 9, life: 2.4, o: new V3(), c: new THREE.Color() }))
    return { B, N, pos, col, vel, g, bs, last: 0 } })()
  bake(S)
  return { S, U, bounds: { x: 12, z0: -6.8, z1: 7.6 } }
}
const FWC = ['#ffd76a', '#ff5a7a', '#7ae0ff', '#a6ff8a', '#ff9a3c', '#ffffff', '#ff7ae0']
function launch(F, x, y, z) {
  const b = F.bs.find(b => b.age >= b.life); if (!b) return; b.age = 0; b.life = rnd(1.8, 2.6); b.o.set(x ?? rnd(-40, 40), y ?? rnd(26, 40), z ?? rnd(-60, -36)); b.c.set(FWC[Math.random() * FWC.length | 0])
  const i0 = F.bs.indexOf(b) * F.N, sp = rnd(7, 11)
  for (let i = 0; i < F.N; i++) { const u = Math.random() * 2 - 1, a = Math.random() * PI * 2, r = Math.sqrt(1 - u * u), s = sp * (.75 + Math.random() * .25); F.vel.set([r * Math.cos(a) * s, u * s, r * Math.sin(a) * s], (i0 + i) * 3) }
}
function stepFW(F, dt) {
  for (let k = 0; k < F.B; k++) { const b = F.bs[k], i0 = k * F.N; if (b.age >= b.life) { if (b.age < 99) { for (let i = 0; i < F.N; i++) F.pos[(i0 + i) * 3 + 1] = -999; b.age = 99 } continue } b.age += dt; const t = b.age, f = Math.max(0, 1 - t / b.life), fl = f * f * (Math.random() < .1 ? .4 : 1)
    for (let i = 0; i < F.N; i++) { const j = (i0 + i) * 3, drag = 1 - Math.exp(-t * 1.6); F.pos[j] = b.o.x + F.vel[j] * drag / 1.6; F.pos[j + 1] = b.o.y + F.vel[j + 1] * drag / 1.6 - 1.6 * t * t; F.pos[j + 2] = b.o.z + F.vel[j + 2] * drag / 1.6; F.col[j] = b.c.r * fl; F.col[j + 1] = b.c.g * fl; F.col[j + 2] = b.c.b * fl } }
  F.g.attributes.position.needsUpdate = true; F.g.attributes.color.needsUpdate = true
}

/* ===== Koleksi museum (model prosedural) ===== */
const EXB = {
  gong(g) { const w = std('#5a2b12', .6); for (const x of [-.75, .75]) add(g, BOX(.12, 1.7, .12), w, x, .85, 0); add(g, BOX(1.75, .14, .16), w, 0, 1.65, 0); add(g, CYL(.58, .58, .09, 40), GOLD(), 0, .95, 0, [PI / 2, 0, 0]); add(g, SPH(.15, 16, 12), GOLD(), 0, .95, .07); add(g, new THREE.TorusGeometry(.42, .02, 8, 40), std('#c99a3a', .3, 1), 0, .95, .05) },
  tepak(g) { const m = songketMat('#8c1d2c', '#f2c14e', [1, .5]); add(g, BOX(1, .38, .66), m, 0, .19, 0); add(g, BOX(1.06, .1, .72), GOLD(), 0, .42, 0); for (let i = -1; i <= 1; i++) add(g, CYL(.1, .08, .2, 16), GOLD(), i * .3, .57, 0); add(g, SPH(.09, 12, 8), std('#2f8a3a', .5), .3, .72, 0) },
  tanjak(g) { add(g, CYL(.1, .16, .5, 16), std('#e9dcc6', .5), 0, .25, 0); add(g, SPH(.34, 24, 16), std('#e9dcc6', .5), 0, .72, 0); const m = songketMat('#8c1d2c', '#e3a93a', [3, .5], { p: { side: THREE.DoubleSide } }); add(g, CYL(.35, .36, .16, 32, true), m, 0, .86, 0); add(g, new THREE.ConeGeometry(.22, .45, 4), m, 0, 1.12, .05, [-.1, PI / 4, 0], [1, 1, .3]); add(g, new THREE.ConeGeometry(.12, .26, 4), m, .2, 1.0, .06, [0, PI / 4, -.75], [1, 1, .3]) },
  songket(g) { const w = std('#5a2b12', .6); for (const x of [-.8, .8]) add(g, BOX(.08, 1.9, .08), w, x, .95, 0); add(g, CYL(.04, .04, 1.8, 8), GOLD(), 0, 1.85, 0, [0, 0, PI / 2]); const c = new THREE.PlaneGeometry(1.5, 1.6, 20, 1), p = c.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 9) * .05); c.computeVertexNormals(); add(g, c, songketMat('#b3122e', '#f2c14e', [1.2, 1.3], { p: { side: THREE.DoubleSide } }), 0, 1.02, 0) },
  aesan(g) { const m = songketMat('#b3122e', '#f2c14e', [2, 1], { p: { side: THREE.DoubleSide } }); add(g, new THREE.LatheGeometry([[.1, 0], [.5, .02], [.42, .6], [.3, 1.1], [.26, 1.5], [.2, 1.7], [.08, 1.78]].map(([r, y]) => new THREE.Vector2(r, y)), 40), m); add(g, new THREE.LatheGeometry([[.12, 1.72], [.3, 1.62], [.44, 1.5], [.46, 1.46]].map(([r, y]) => new THREE.Vector2(r, y)), 40), std('#f0be4f', .25, 1, { side: THREE.DoubleSide })); add(g, SPH(.2, 20, 14), std('#e9dcc6', .5), 0, 1.98, 0); const cr = grp(g, 0, 2.12, 0); add(cr, CYL(.2, .17, .14, 24), GOLD()); for (let i = 0; i < 9; i++) { const a = i / 9 * PI * 2; add(cr, new THREE.ConeGeometry(.03, .22, 6), GOLD(), Math.sin(a) * .19, .16, Math.cos(a) * .19) } add(cr, SPH(.04, 10, 8), std('#d6334f', .2), 0, .05, .2) },
  amperam(g) { add(g, BOX(1.8, .06, .8), std('#1d4f6e', .15, .6), 0, .03, 0); const r = std('#c3212c', .4, .3); add(g, BOX(1.8, .06, .16), r, 0, .3, 0); for (const sx of [-.4, .4]) { add(g, BOX(.07, .95, .07), r, sx, .5, .06); add(g, BOX(.07, .95, .07), r, sx, .5, -.06); add(g, BOX(.1, .08, .2), r, sx, .98, 0) } add(g, BOX(.8, .06, .04), r, 0, .9, .06); add(g, BOX(.8, .06, .04), r, 0, .9, -.06) },
  bidar(g) { add(g, new THREE.CapsuleGeometry(.12, 1.6, 4, 12), songketMat('#b3122e', '#f2c14e', [2, .5]), 0, .3, 0, [0, 0, PI / 2], [.6, 1, 1]); for (let i = -3; i <= 3; i++) add(g, BOX(.03, .5, .03), std('#5a2b12'), i * .2, .45, .14, [.5, 0, 0]); add(g, new THREE.ConeGeometry(.08, .3, 6), GOLD(), .95, .42, 0, [0, 0, -1]); add(g, BOX(1.4, .12, .06), std('#5a2b12'), 0, .1, 0) },
  prasasti(g) { const s = add(g, new THREE.DodecahedronGeometry(.6, 1), new THREE.MeshStandardMaterial({ map: pallawa(), roughness: .95 }), 0, .66, 0, [0, .2, 0], [.85, 1.12, .42]) },
  limas(g) { limas(g, 0, 0, 0, .14, 0) },
  kipas(g) { const m = songketMat('#b3122e', '#f2c14e', [.3, 1], { p: { side: THREE.DoubleSide } }), f = grp(g, 0, .3, 0), bg = new THREE.PlaneGeometry(.17, .95); bg.translate(0, .5, 0); for (let i = 0; i < 15; i++) { const b = new THREE.Mesh(bg, m); b.rotation.z = (i - 7) / 7 * 1.25; f.add(b) } add(f, SPH(.05, 10, 8), GOLD()); for (let i = 0; i < 4; i++) add(g, new THREE.ConeGeometry(.02, .3, 8), GOLD(), .55 + i * .07, .2, .1, [0, 0, PI + .2]) },
}

/* ===== MUSEUM SENI & BUDAYA PALEMBANG (gedung tertutup) ===== */
function buildMuseum(API) {
  const S = new THREE.Scene(); S.background = new THREE.Color('#1a0a08'); S.fog = new THREE.Fog('#24100a', 40, 110); S.environmentIntensity = .7
  const W = 22, D = 15, H = 12, U = { pick: [], spots: [], chand: [] }
  S.add(new THREE.HemisphereLight('#fff1d6', '#4a2014', 1.2))
  const key = U.key = new THREE.DirectionalLight('#fff0d8', 1.2); key.position.set(6, 20, 10); S.add(key, key.target); Object.assign(key.shadow.camera, { left: -22, right: 22, top: 16, bottom: -16, near: 2, far: 60 }); key.shadow.mapSize.set(MOB ? 1024 : 2048, MOB ? 1024 : 2048); key.shadow.bias = -.0008; key.shadow.normalBias = .03
  // Lantai marmer, karpet, dinding, langit-langit
  const fl = add(S, new THREE.PlaneGeometry(W * 2, D * 2), new THREE.MeshStandardMaterial({ map: marble([9, 6]), roughness: .16, metalness: .05 }), 0, 0, 0, [-PI / 2, 0, 0]); fl.receiveShadow = true
  add(S, new THREE.PlaneGeometry(5.6, D * 2 - 1), songketMat('#8c1d2c', '#f2c14e', [1.5, 7]), 0, .012, 0, [-PI / 2, 0, 0]).receiveShadow = true
  const wall = std('#f1dfc0', .85), wain = new THREE.MeshStandardMaterial({ map: carving('#5c0b1a', '#e3a93a', [12, 1]), roughness: .5, metalness: .25 }), band = songketMat('#5c0b1a', '#f2c14e', [16, .5])
  for (const [x, z, ry, w] of [[0, -D, 0, W * 2], [0, D, PI, W * 2], [-W, 0, PI / 2, D * 2], [W, 0, -PI / 2, D * 2]]) {
    const g = grp(S, x, 0, z); g.rotation.y = ry; add(g, new THREE.PlaneGeometry(w, H), wall, 0, H / 2, 0)
    add(g, BOX(w, 2.6, .25), wain, 0, 1.3, .12); add(g, BOX(w, .12, .32), GOLD(), 0, 2.62, .14); add(g, BOX(w, .7, .2), band, 0, H - .8, .1); add(g, BOX(w, .1, .26), GOLD(), 0, H - 1.2, .13)
  }
  add(S, new THREE.PlaneGeometry(W * 2, D * 2), new THREE.MeshStandardMaterial({ map: carving('#3a0610', '#c9973a', [9, 6]), roughness: .6, metalness: .3 }), 0, H, 0, [PI / 2, 0, 0])
  const bm = memo('museumBeam', () => new THREE.MeshStandardMaterial({ map: wood([6, 1], ['#5a2b12', '#3a1a08']), roughness: .6 }))
  for (let z = -12; z <= 12; z += 6) add(S, BOX(W * 2, .5, .6), bm, 0, H - .25, z)
  // Pilar
  const colM = std('#f6ead4', .4)
  const col = (x, z) => { add(S, CYL(.5, .55, H, 24), colM, x, H / 2, z); add(S, BOX(1.3, .5, 1.3), GOLD(), x, .25, z); add(S, BOX(1.3, .5, 1.3), GOLD(), x, H - .9, z); add(S, new THREE.TorusGeometry(.56, .07, 8, 24), GOLD(), x, 3, z, [PI / 2, 0, 0]) }
  for (const z of [-11, -3.7, 3.7, 11]) { col(-W + .7, z); col(W - .7, z) }
  for (const x of [-18, -6, 6, 18]) col(x, -D + .7)
  // Pintu kayu berukir (tertutup)
  const door = grp(S, 0, 0, D - .15); door.rotation.y = PI
  add(door, BOX(6.4, 8.2, .3), GOLD(), 0, 4.1, -.05)
  for (const sx of [-1, 1]) { add(door, BOX(2.9, 7.6, .25), new THREE.MeshStandardMaterial({ map: carving('#4a220e', '#e3a93a', [1, 2.6]), roughness: .5, metalness: .2 }), sx * 1.5, 3.9, .1); add(door, SPH(.13, 12, 8), GOLD(), sx * .3, 3.9, .3) }
  add(door, new THREE.PlaneGeometry(6, 1.5), new THREE.MeshBasicMaterial({ map: sign('Selamat Datang', 'MUSEUM SENI & BUDAYA PALEMBANG'), toneMapped: false }), 0, 9, .2)
  // Papan nama besar
  add(S, new THREE.PlaneGeometry(8, 2), new THREE.MeshBasicMaterial({ map: sign('Museum Seni & Budaya', 'PALEMBANG · SUMATERA SELATAN'), toneMapped: false }), 0, 9.6, -D + .12)
  // Lukisan (gambar AI lewat Image CDN)
  const pf = new THREE.MeshStandardMaterial({ color: '#d6a640', roughness: .3, metalness: 1 })
  API.ART.forEach((a, i) => {
    const g = grp(S, (i - 1) * 12, 5.6, -D + .2); add(g, BOX(8.4, 5.4, .3), pf); add(g, BOX(7.6, 4.6, .32), std('#3a0610', .6))
    const pic = add(g, new THREE.PlaneGeometry(7.2, 4.2), new THREE.MeshStandardMaterial({ map: img(a.img, 1024), roughness: .6 }), 0, 0, .18); pic.userData.info = a; pic.userData.dyn = 1; U.pick.push(pic)
    add(g, BOX(3, .14, .4), GOLD(), 0, 3.05, .4); halos(g, [[0, 2.8, .6]], '#fff0c8', 5, .6)
  })
  // Papan informasi
  API.PN.forEach((p, i) => {
    const L = i < 3, z = L ? (i - 1) * 7.6 : (i == 3 ? -7.6 : 0), g = grp(S, L ? -W + .2 : W - .2, 5.2, z); g.rotation.y = L ? PI / 2 : -PI / 2
    add(g, BOX(6.2, 4.3, .2), pf); const b = add(g, new THREE.PlaneGeometry(5.9, 3.95), new THREE.MeshBasicMaterial({ map: board(p.t, p.d), toneMapped: false }), 0, 0, .12); b.userData.info = p; b.userData.dyn = 1; U.pick.push(b)
  })
  // Kain songket besar
  { const g = grp(S, W - .3, 5.2, 7.6); g.rotation.y = -PI / 2; add(g, CYL(.06, .06, 3.6, 8), GOLD(), 0, 2.2, .2, [0, 0, PI / 2]); const c = new THREE.PlaneGeometry(3.2, 4.2, 24, 1), p = c.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 6) * .08 + .25); c.computeVertexNormals(); const m = add(g, c, songketMat('#8c1d2c', '#f2c14e', [2, 2.4], { p: { side: THREE.DoubleSide } }), 0, 0, 0); m.userData.info = API.EX.find(e => e.k == 'songket'); m.userData.dyn = 1; U.pick.push(m) }
  // Lampu gantung kristal emas
  for (const z of [-8, 0, 8]) {
    const g = grp(S, 0, 9.2, z); add(g, CYL(.04, .04, 2.6, 6), GOLD(), 0, 1.6, 0)
    add(g, new THREE.TorusGeometry(1.5, .07, 10, 48), GOLD(), 0, 0, 0, [PI / 2, 0, 0]); add(g, new THREE.TorusGeometry(.95, .06, 10, 40), GOLD(), 0, .55, 0, [PI / 2, 0, 0]); add(g, SPH(.35, 16, 12), GOLD(), 0, -.5, 0)
    const p = []; for (let i = 0; i < 14; i++) { const a = i / 14 * PI * 2; add(g, SPH(.11, 8, 6), basic('#fff6dc'), Math.cos(a) * 1.5, .16, Math.sin(a) * 1.5); add(g, new THREE.OctahedronGeometry(.1), std('#ffffff', .05, .1, { transparent: true, opacity: .7 }), Math.cos(a) * 1.5, -.35, Math.sin(a) * 1.5, 0, [1, 2.2, 1]); p.push([Math.cos(a) * 1.5, .2, Math.sin(a) * 1.5]) }
    for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2; add(g, SPH(.09, 8, 6), basic('#fff6dc'), Math.cos(a) * .95, .7, Math.sin(a) * .95); p.push([Math.cos(a) * .95, .72, Math.sin(a) * .95]) }
    halos(g, p, '#ffe2a0', 1.4); halos(g, [[0, .2, 0]], '#ffcf7a', 9, .35)
    const pl = new THREE.PointLight('#ffe2b4', 2.4, 26, 0); pl.position.set(0, -.4, 0); g.add(pl); g.userData.dyn = 1; U.chand.push(g)
  }
  // Lampu dinding
  { const p = []; for (const z of [-7.4, 0, 7.4]) for (const x of [-W + .3, W - .3]) { add(S, SPH(.18, 10, 8), basic('#fff0c8'), x, 8.4, z); p.push([x, 8.4, z]) } halos(S, p, '#ffcf7a', 4, .55) }
  // Koleksi di atas alas berputar
  U.ex = []; const SHORT = { gong: 'Gong & Gamelan', songket: 'Kain Songket', amperam: 'Mini Ampera', bidar: 'Perahu Bidar', prasasti: 'Prasasti 683 M', kipas: 'Kipas & Tanggai' }
  API.EX.forEach((e, i) => {
    const L = i < 5, x = L ? -7.4 : 7.4, z = -10 + (i % 5) * 5, g = grp(S, x, 0, z)
    add(g, CYL(1.05, 1.15, 1, 32), std('#2a0c0c', .4, .2), 0, .5, 0); add(g, new THREE.TorusGeometry(1.08, .05, 8, 40), GOLD(), 0, 1, 0, [PI / 2, 0, 0]); add(g, new THREE.TorusGeometry(1.15, .05, 8, 40), GOLD(), 0, .05, 0, [PI / 2, 0, 0])
    const tt = grp(g, 0, 1.02, 0); EXB[e.k] ? EXB[e.k](tt) : add(tt, SPH(.4), GOLD(), 0, .4, 0)
    tt.traverse(o => { if (o.isMesh) o.castShadow = true })
    const pl = add(g, new THREE.PlaneGeometry(1.5, .47), new THREE.MeshBasicMaterial({ map: label(SHORT[e.k] || e.t, 'KOLEKSI ' + (i + 1)), transparent: true, toneMapped: false }), 0, .62, L ? 1.16 : 1.16, [-.25, 0, 0])
    pl.parent.rotation.y = L ? PI / 2 - .5 : -PI / 2 + .5
    halos(g, [[0, 1.1, 0]], '#ffe7b0', 3.2, .45)
    g.userData.info = e; g.userData.dyn = 1; U.pick.push(g); U.ex.push({ g, tt, e, p: new V3(x, 0, z) })
  })
  // Tanaman hias di sudut
  for (const [x, z] of [[-19.5, 12.5], [19.5, 12.5], [-19.5, -12.5], [19.5, -12.5], [-4, 13.4], [4, 13.4]]) { add(S, CYL(.55, .4, 1, 16), std('#b8862e', .35, .8), x, .5, z); for (let i = 0; i < 7; i++) { const a = i / 7 * PI * 2, l = add(S, new THREE.ConeGeometry(.25, 1.8, 6), std('#2f7a3a', .7), x + Math.cos(a) * .3, 1.7, z + Math.sin(a) * .3); l.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5) } }
  bake(S)
  return { S, U, bounds: { x: W - 1.4, z0: -D + 1.4, z1: D - 1.4 } }
}

/* ===== createWorld ===== */
export async function createWorld(wrap, API) {
  const $ = s => document.querySelector(s), V = $('#v3'), host = $('#c3'), load = $('#v3load'), hud = $('#hud'), ic = $('#ic')
  const probe = document.createElement('canvas'); let ok = false; try { const c = probe.getContext('webgl2'); ok = !!c; c?.getExtension('WEBGL_lose_context')?.loseContext() } catch (e) { }
  if (!ok) { const e = new Error('Perangkat ini belum mendukung WebGL 2'); e.code = 'nowebgl'; throw e }
  try { await Promise.race([document.fonts?.ready, new Promise(r => setTimeout(r, 1500))]) } catch (e) { }

  // Renderer dengan beberapa percobaan agar tetap jalan di HP
  let R, err
  for (const o of [{ antialias: true, powerPreference: MOB ? 'default' : 'high-performance' }, { antialias: false, powerPreference: 'default' }, { antialias: false, powerPreference: 'low-power', precision: 'mediump' }]) {
    try { R = new THREE.WebGLRenderer({ alpha: false, stencil: false, failIfMajorPerformanceCaveat: false, ...o }); break } catch (e) { err = e }
  }
  if (!R) throw err
  R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap
  host.appendChild(R.domElement)
  let HD = !MOB; try { const s = localStorage.getItem('q3'); if (s) HD = s == '1' } catch (e) { }
  const env = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(), .04).texture

  const STG = buildStage(), MUS = buildMuseum(API)
  STG.S.environment = env; MUS.S.environment = env
  const W = { stage: STG, museum: MUS }
  let world = 'stage', game = 0, th = 0, paused = 0, vis = 1, showNames = 1, T = 0

  // Tujuh penari
  const blobM = new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: .6 }), blobG = new THREE.PlaneGeometry(1.6, 1.6)
  const chars = API.CHR.map((d, i) => { const c = new Char(d); const b = new THREE.Mesh(blobG, blobM); b.rotation.x = -PI / 2; b.position.y = .03; b.renderOrder = 1; c.root.add(b); c.root.userData.ci = i; c.st = { p: new V3(0, 0, 0), face: 0, walk: 0, y: 0, vy: 0, act: '', at: 0, wp: null, wait: rnd(0, 3) }; STG.S.add(c.root); return c })
  const WING = i => new V3(i < 4 ? (i < 2 ? -11.6 : 11.6) : (i - 5) * 2.2, 0, i < 4 ? -4 + (i % 2) * 2.6 : -6.6)
  const SX = q => new V3((q[0] - 50) * .19, 0, (q[1] - 31) * .19 + .6)

  // Kamera orbit sentuh
  const cam = new THREE.PerspectiveCamera(45, 1, .1, 900)
  const O = { th: .5, ph: 1.2, r: 30, t: new V3(0, 2.4, 0), gth: 0, gph: 1.2, gr: 21, gt: new V3(0, 2.4, 0), mode: 'cine', user: -9, focus: -1 }
  const VIEWS = { stage: { cine: [0, 1.2, 21], d: [0, 1.32, 19], b: [PI, 1.2, 19], l: [-PI / 2, 1.25, 19], r: [PI / 2, 1.25, 19], a: [0, .14, 24] }, museum: { cine: [0, 1.25, 12], d: [0, 1.3, 13], b: [PI, 1.3, 12], l: [-PI / 2, 1.3, 13], r: [PI / 2, 1.3, 13], a: [0, .2, 10] } }
  function setCam(v) { O.mode = v; O.focus = -1; const [a, b, c] = VIEWS[world][v] || VIEWS[world].cine; O.gth = O.th + angD(O.th, a); O.gph = b; O.gr = c; O.gt.set(0, world == 'stage' ? 2.4 : 2.2, 0); O.user = -9; document.querySelectorAll('#cb button').forEach(x => x.classList.toggle('on', x.dataset.v == v)) }

  // Ukuran & kualitas
  function resize() { const w = V.clientWidth || 1, h = V.clientHeight || 1; R.setPixelRatio(Math.min(devicePixelRatio || 1, HD ? 2 : MOB ? 1.25 : 1.5)); R.setSize(w, h, false); cam.aspect = w / h; cam.fov = cam.aspect < 1.25 ? 54 : 45; cam.updateProjectionMatrix() }
  function quality(hd) { HD = hd; STG.U.key.castShadow = hd; MUS.U.key.castShadow = hd; blobM.opacity = hd ? .35 : .6; $('#qBtn').classList.toggle('on', hd); $('#qBtn').textContent = hd ? 'HD ✦' : 'HD'; try { localStorage.setItem('q3', hd ? '1' : '0') } catch (e) { } resize() }
  quality(HD)
  new ResizeObserver(resize).observe(V); addEventListener('resize', () => { rotChk(); resize() })
  new IntersectionObserver(es => es.forEach(e => vis = e.isIntersecting), { threshold: .02 }).observe(V)

  // Pindah dunia dengan tirai fade
  const fade = document.createElement('div'); fade.style.cssText = 'position:absolute;inset:0;background:radial-gradient(circle,#5c0b1a,#0a0306);opacity:0;pointer-events:none;transition:opacity .35s;z-index:2'; V.appendChild(fade)
  function place(w) {
    chars.forEach((c, i) => { W[w].S.add(c.root); const s = c.st; s.wp = null; s.wait = rnd(0, 2); s.y = 0; s.vy = 0
      if (w == 'museum') { s.p.set((i - 3) * 1.5, 0, 11.5 - (i % 2) * 1.2); s.face = PI } else { const f = API.frame(API.cur()), q = f.f[i] || API.PL[10].f[i]; s.p.copy(q ? SX(q) : WING(i)); s.face = 0 } })
  }
  function setWorld(w) {
    if (w == 'museum' && !API.U.museum) return
    paused = 0; if (w == world) { API.onWorld(w); return }
    fade.style.opacity = 1
    setTimeout(() => { world = w; place(w); setCam('cine'); ic.hidden = true; hudText(); API.onWorld(w); fade.style.opacity = 0; v3toast(w == 'museum' ? '🏛️ Museum Seni & Budaya Palembang' : '🎭 Panggung Tepian Musi'); API.sfx.swish && API.sfx.swish() }, 360)
  }
  function hudText() { $('#hudK').textContent = world == 'stage' ? 'PANGGUNG TEPIAN MUSI' : 'MUSEUM SENI & BUDAYA PALEMBANG'; $('#hudT').textContent = world == 'stage' ? 'Tari Sambut Seruni Musi' : 'Koleksi Warisan Palembang'; const tp = $('#tpb'); tp.textContent = world == 'stage' ? '🏛️ Museum' : '🎭 Panggung' }
  let tt0; function v3toast(s) { const e = $('#v3toast'); e.textContent = s; e.classList.add('on'); clearTimeout(tt0); tt0 = setTimeout(() => e.classList.remove('on'), 2200) }
  function card(t, d) { ic.hidden = false; ic.innerHTML = '<button class="x" aria-label="Tutup">✕</button><b></b><span></span>'; ic.querySelector('b').textContent = t; ic.querySelector('span').textContent = d; ic.querySelector('.x').onclick = e => { e.stopPropagation(); ic.hidden = true } }

  // Layar penuh / mode bioskop: elemen dipindah ke body agar tidak terkurung blur kartu
  const home = V.parentNode, ph = document.createComment('v3')
  function rotChk() { V.classList.toggle('rot', !!th && innerHeight > innerWidth * 1.05) }
  function theater(on) {
    on = !!on; if (on == !!th) return; th = on
    if (on) { home.insertBefore(ph, V); document.body.appendChild(V); V.classList.add('theater'); document.documentElement.style.overflow = 'hidden'
      try { const p = V.requestFullscreen?.({ navigationUI: 'hide' }); p && p.then(() => screen.orientation?.lock?.('landscape')).then(() => setTimeout(() => { rotChk(); resize() }, 200)).catch(() => { }) } catch (e) { } }
    else { V.classList.remove('theater', 'rot', 'idle', 'paused'); ph.parentNode && ph.parentNode.replaceChild(V, ph); document.documentElement.style.overflow = ''; try { document.fullscreenElement && document.exitFullscreen().catch(() => { }); screen.orientation?.unlock?.() } catch (e) { } }
    rotChk(); resize(); poke()
  }
  document.addEventListener('fullscreenchange', () => setTimeout(() => { rotChk(); resize() }, 150))
  let idT; function poke() { V.classList.remove('idle'); clearTimeout(idT); if (th) idT = setTimeout(() => { if (API.music.running()) V.classList.add('idle') }, 3200) }
  // Koordinat lokal (memperhitungkan rotasi 90° landscape)
  const local = (e, el) => { const r = el.getBoundingClientRect(); return V.classList.contains('rot') ? [e.clientY - r.top, r.right - e.clientX, r.height, r.width] : [e.clientX - r.left, e.clientY - r.top, r.width, r.height] }

  // Input kamera: seret, cubit, gulir
  const cv = R.domElement, P = new Map(); let pinch = 0, moved = 0, down = [0, 0]
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); const l = local(e, cv); P.set(e.pointerId, l); moved = 0; down = l; poke(); if (P.size == 2) { const [a, b] = [...P.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]) } })
  cv.addEventListener('pointermove', e => {
    if (!P.has(e.pointerId)) return; const l = local(e, cv), pr = P.get(e.pointerId); P.set(e.pointerId, l)
    if (P.size == 2) { const [a, b] = [...P.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) O.gr = clamp(O.gr * pinch / d, 4, world == 'stage' ? 46 : 16); pinch = d; moved = 1; O.user = T; return }
    const dx = l[0] - pr[0], dy = l[1] - pr[1]; if (Math.abs(l[0] - down[0]) + Math.abs(l[1] - down[1]) > 6) moved = 1
    O.gth -= dx * .0075; O.gph = clamp(O.gph - dy * .006, .12, world == 'stage' ? 1.5 : 1.52); O.user = T
  })
  const up = e => {
    if (!P.has(e.pointerId)) return; P.delete(e.pointerId); pinch = 0
    if (!moved) { const [x, y, w, h] = local(e, cv); pick(x / w * 2 - 1, -(y / h) * 2 + 1) }
  }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', e => { P.delete(e.pointerId); pinch = 0 })
  cv.addEventListener('wheel', e => { e.preventDefault(); O.gr = clamp(O.gr * (1 + e.deltaY * .0012), 4, world == 'stage' ? 46 : 16); O.user = T }, { passive: false })
  const ray = new THREE.Raycaster()
  function pick(x, y) {
    ray.setFromCamera({ x, y }, cam)
    const objs = [...chars.map(c => c.root), ...(world == 'museum' ? MUS.U.pick : [])], hit = ray.intersectObjects(objs, true)
    for (const h of hit) { let o = h.object; while (o && o.userData.info == null && o.userData.ci == null) o = o.parent; if (!o) continue
      if (o.userData.ci != null) return focus(o.userData.ci)
      const f = o.userData.info; card(f.t, f.d); API.sfx.bell && API.sfx.bell(880, .18); return }
    if (th) V.classList.toggle('idle')
  }
  function focus(i) { const c = chars[i], d = c.def; O.focus = i; O.mode = 'focus'; O.gr = 7.5; O.gph = 1.28; O.user = T; card(d.nm + ' · ' + d.id, (d.g == 'L' ? 'Penari laki-laki' : 'Penari perempuan') + ' · ' + d.tag + '. ' + d.ciri); API.sfx.pop && API.sfx.pop(); c.st.act = 'wave'; c.st.at = 1.6 }

  // HUD
  const hb = $('#hudBar'), hbi = hb.querySelector('i')
  const tog = () => { API.music.toggle(); poke() }
  $('#hudPlay').onclick = tog; $('#hudBig').onclick = tog
  const hseek = e => { const [x, , w] = local(e, hb); API.music.seek(clamp(x / w, 0, .997) * 300) }
  hb.onpointerdown = e => { hb.setPointerCapture(e.pointerId); hseek(e); poke() }; hb.onpointermove = e => { if (hb.hasPointerCapture(e.pointerId)) hseek(e) }
  $('#fsb').onclick = () => theater(!th); $('#fsx').onclick = () => theater(0)
  const CV = ['cine', 'd', 'b', 'l', 'r', 'a'], CN = { cine: 'Sinematik', d: 'Depan', b: 'Belakang', l: 'Kiri', r: 'Kanan', a: 'Atas' }
  $('#camBtn').onclick = () => { const v = CV[(CV.indexOf(O.mode) + 1) % CV.length]; setCam(v); v3toast('🎥 ' + CN[v]); poke() }
  $('#cb').onclick = e => { const b = e.target.closest('button'); if (b) { setCam(b.dataset.v); API.sfx.tak && API.sfx.tak() } }
  $('#qBtn').onclick = () => { quality(!HD); v3toast(HD ? 'Grafis HD aktif ✦' : 'Grafis hemat baterai') }
  $('#nmBtn').onclick = () => { showNames ^= 1; chars.forEach(c => c.tag && (c.tag.visible = !!showNames)); $('#nmBtn').classList.toggle('on', !!showNames) }; $('#nmBtn').classList.add('on')
  V.addEventListener('pointermove', poke)

  // Chip Game: kendali Radit
  const K = {}, joy = $('#joy'), knob = joy.querySelector('i'); let jx = 0, jy = 0
  joy.onpointerdown = e => { joy.setPointerCapture(e.pointerId); jmove(e) }
  const jmove = e => { if (!joy.hasPointerCapture(e.pointerId)) return; const [x, y, w, h] = local(e, joy); let dx = x - w / 2, dy = y - h / 2; const m = Math.hypot(dx, dy), R0 = w * .38; if (m > R0) { dx *= R0 / m; dy *= R0 / m } knob.style.transform = `translate(${dx}px,${dy}px)`; jx = dx / R0; jy = -dy / R0 }
  joy.onpointermove = jmove; joy.onpointerup = joy.onpointercancel = () => { jx = jy = 0; knob.style.transform = '' }
  addEventListener('keydown', e => { if (!game || !(vis || th) || /INPUT|TEXTAREA/.test(document.activeElement?.tagName)) return; const k = e.key.toLowerCase(); K[k] = 1; if (k.startsWith('arrow') || k == ' ') e.preventDefault(); if (k == ' ') act('jump') })
  addEventListener('keyup', e => { K[e.key.toLowerCase()] = 0 })
  function act(a) { const s = chars[0].st; if (a == 'jump') { if (s.y <= .001) { s.vy = 7.2; API.sfx.swish && API.sfx.swish() } } else { s.act = a; s.at = a == 'dance' ? 4.5 : 2; API.sfx.pop && API.sfx.pop() } }
  $('#aJump').onclick = () => act('jump'); $('#aWave').onclick = () => act('wave'); $('#aDance').onclick = () => act('dance')
  $('#tpb').onclick = () => { if (world == 'stage') { if (!API.U.museum) { v3toast('Minta Seruni “Buka museum” dulu ✦'); return } setWorld('museum') } else setWorld('stage') }
  function setGame(on) { game = on ? 1 : 0; $('#game').hidden = !game; $('#tpb').hidden = !game; V.classList.toggle('gaming', !!game); const s = chars[0].st; s.act = ''; if (game) { s.p.set(0, 0, world == 'stage' ? 4 : 9); s.face = world == 'stage' ? 0 : PI; O.mode = 'game'; O.gr = 9; O.gph = 1.18; v3toast('🎮 Radit siap dikendalikan!') } else setCam('cine'); paused = 0; hudText() }

  /* ===== Pembaruan per bingkai ===== */
  function stepStage(dt, fr) {
    const U = STG.U, e = fr.e, on = fr.on, pulse = on ? Math.max(0, 1 - (fr.bi % 1) * 2.5) : 0
    const pre = !on && fr.pi < 0, f = pre ? API.PL[10].f : fr.f, g = groupOf(fr.mv)
    chars.forEach((c, i) => {
      const s = c.st; if (game && i == 0) return moveRadit(c, dt, STG.bounds)
      const q = f[i], tg = q ? SX(q) : WING(i), dx = tg.x - s.p.x, dz = tg.z - s.p.z, d = Math.hypot(dx, dz)
      if (d > 16) s.p.copy(tg); else if (d > .001) { const sp = Math.min(d, (2 + 2.2 * e) * dt * (fr.rate || 1)); s.p.x += dx / d * sp; s.p.z += dz / d * sp }
      const walking = d > .08; s.walk = damp(s.walk, walking ? 1 : 0, 7, dt)
      s.face += angD(s.face, walking && d > .3 ? Math.atan2(dx, dz) : 0) * (1 - Math.exp(-dt * 6))
      let Pz, spin = 0
      if (s.act == 'wave' && s.at > 0) { s.at -= dt; Pz = WAVE(T) }
      else if (pre) Pz = Math.sin(T * .9 + i * 1.3) > .55 ? WAVE(T) : idlePose(T, i)
      else if (on && q && (g == 'B' || g == 'X' || (g == 'L') == c.L)) { const r = dancePose(fr.mv, fr.mvC, c.L, e, fr.bi, on); Pz = r.p; spin = r.spin }
      else Pz = idlePose(T, i)
      c.root.position.set(s.p.x, 0, s.p.z); c.root.rotation.y = s.face; c.update(dt, Pz, { walk: s.walk, spin })
    })
    // Lampu & efek mengikuti musik
    const lv = .85 + e * .5 + pulse * .5
    U.lanM.color.setScalar(.75 + lv * .45); U.lanH.material.opacity = .45 + .35 * lv * .7; U.foot.material.opacity = .5 + pulse * .5
    U.embRing.rotation.z -= dt * (.15 + e * .6); U.emb.children[0].material.emissiveIntensity = .4 + pulse * .6 + e * .3; U.med.material.emissiveIntensity = .2 + pulse * .4
    U.fill.intensity = 1.6 + e * 1.6 + pulse * 1.2
    U.beams.forEach(([b, s], k) => { const sw = on && fr.si >= 2 ? 1 : .3, tx = Math.sin(T * (.5 + k * .17) + k * 2) * 6 * sw, tz = Math.cos(T * (.4 + k * .13) + k) * 3.5 * sw; s.target.position.set(tx, 0, tz); aim(b, s.position, s.target.position); b.material.opacity = .05 + e * .07 + pulse * .04; s.intensity = 2 + e * 2.2 })
    U.sweep.forEach(({ b, from, ph }, k) => { aim(b, from, new V3(from.x + Math.sin(T * .35 + ph) * 60, 140, from.z - 60 + Math.cos(T * .27 + ph) * 30)); b.material.opacity = .03 + e * .05 })
    U.flags.forEach((f, k) => f.rotation.y = Math.sin(T * 1.7 + k) * .35)
    U.boats.forEach(b => { b.g.position.x += b.v * dt; if (b.g.position.x > 90) b.g.position.x = -90; if (b.g.position.x < -90) b.g.position.x = 90; b.g.position.y = -2.3 + Math.sin(T * 1.4 + b.ph) * .12; b.g.rotation.z = Math.sin(T * 1.1 + b.ph) * .03; b.g.rotation.y = b.v > 0 ? 0 : PI })
    U.rip.offset.x = T * .006; U.rip.offset.y = T * .01
    // Kelopak
    const pp = U.petals.pts.geometry.attributes.position, a = pp.array, wind = .4 + e
    for (let i = 0; i < U.petals.n; i++) { const [v, ph] = U.petals.sp[i]; a[i * 3 + 1] -= v * dt * (.7 + e * .5); a[i * 3] += Math.sin(T * 1.3 + ph) * dt * wind * .5; a[i * 3 + 2] += Math.cos(T + ph) * dt * .3; if (a[i * 3 + 1] < 0) { a[i * 3 + 1] = 18; a[i * 3] = rnd(-17, 17); a[i * 3 + 2] = rnd(-9, 14) } }
    pp.needsUpdate = true
    // Kembang api: meriah saat Pesta Rakyat & akhir, sesekali di luar itu
    const F = U.fw, gap = on ? (fr.si == 4 ? .35 : fr.si == 5 ? 1.2 : 2.2) : 3.4
    if (T - F.last > gap * rnd(.7, 1.3)) { F.last = T; launch(F); if (on && fr.si == 4 && Math.random() < .5) launch(F) }
    stepFW(F, dt)
  }
  function moveRadit(c, dt, B) {
    const s = c.st; let ix = jx + ((K.d || K.arrowright) ? 1 : 0) - ((K.a || K.arrowleft) ? 1 : 0), iy = jy + ((K.w || K.arrowup) ? 1 : 0) - ((K.s || K.arrowdown) ? 1 : 0)
    const m = Math.hypot(ix, iy); if (m > 1) { ix /= m; iy /= m }
    const fx = -Math.sin(O.th), fz = -Math.cos(O.th), vx = (Math.cos(O.th) * ix + fx * iy) * 4.6, vz = (-Math.sin(O.th) * ix + fz * iy) * 4.6, sp = Math.hypot(vx, vz)
    s.p.x = clamp(s.p.x + vx * dt, -B.x, B.x); s.p.z = clamp(s.p.z + vz * dt, B.z0, B.z1)
    if (world == 'museum') MUS.U.ex.forEach(x => { const dx = s.p.x - x.p.x, dz = s.p.z - x.p.z, d = Math.hypot(dx, dz); if (d < 1.5 && d > 0) { s.p.x = x.p.x + dx / d * 1.5; s.p.z = x.p.z + dz / d * 1.5 } })
    s.vy -= 20 * dt; s.y = Math.max(0, s.y + s.vy * dt); if (s.y == 0) s.vy = 0
    if (sp > .2) s.face += angD(s.face, Math.atan2(vx, vz)) * (1 - Math.exp(-dt * 10))
    s.walk = damp(s.walk, clamp(sp / 4.6, 0, 1), 10, dt)
    let Pz = idlePose(T, 0)
    if (s.at > 0) { s.at -= dt; if (s.act == 'wave') Pz = WAVE(T); else if (s.act == 'dance') { const mv = ['Langkah Tegap', 'Hentak Gagah', 'Sikap Tanjak', 'Tepuk Jaga'][(T / 1.6 | 0) % 4], r = dancePose(mv, (T * 2.5) % 8, true, .8, T * 2.5, 1); Pz = r.p } } else s.act = ''
    c.root.position.set(s.p.x, s.y, s.p.z); c.root.rotation.y = s.face; c.update(dt, Pz, { walk: s.y > 0 ? 0 : s.walk, wspd: 1.3 })
    // Info otomatis saat Radit mendekati koleksi
    if (world == 'museum') { let best = null, bd = 2.9; MUS.U.ex.forEach(x => { const d = s.p.distanceTo(x.p); if (d < bd) { bd = d; best = x } }); if (best && best !== s.near) { card(best.e.t, best.e.d); API.sfx.sparkle && API.sfx.sparkle() } if (best !== s.near) s.near = best }
  }
  // Pengunjung museum: berjalan dari satu koleksi ke koleksi lain
  const SPOTS = () => [...MUS.U.ex.map(x => ({ p: new V3(x.p.x + (x.p.x < 0 ? 2 : -2), 0, x.p.z), look: x.p })), ...[-12, 0, 12].map(x => ({ p: new V3(x, 0, -11.6), look: new V3(x, 0, -16) })), ...[-7.6, 0, 7.6].map(z => ({ p: new V3(-18.8, 0, z), look: new V3(-25, 0, z) }))]
  let spots
  function stepMuseum(dt) {
    spots ||= SPOTS()
    chars.forEach((c, i) => {
      const s = c.st; if (game && i == 0) return moveRadit(c, dt, MUS.bounds)
      if (!s.wp) { s.wait -= dt; if (s.wait < 0) { s.wp = spots[(Math.random() * spots.length) | 0]; s.wp = { p: s.wp.p.clone().add(new V3(rnd(-.7, .7), 0, rnd(-.7, .7))), look: s.wp.look } } }
      let walking = false
      if (s.wp) { const dx = s.wp.p.x - s.p.x, dz = s.wp.p.z - s.p.z, d = Math.hypot(dx, dz); if (d < .1) { s.face += 0; s.lookAt = s.wp.look; s.wp = null; s.wait = rnd(4, 8) } else { const sp = Math.min(d, 1.6 * dt); s.p.x += dx / d * sp; s.p.z += dz / d * sp; walking = true; s.face += angD(s.face, Math.atan2(dx, dz)) * (1 - Math.exp(-dt * 6)) } }
      if (!walking && s.lookAt) s.face += angD(s.face, Math.atan2(s.lookAt.x - s.p.x, s.lookAt.z - s.p.z)) * (1 - Math.exp(-dt * 3))
      s.walk = damp(s.walk, walking ? 1 : 0, 6, dt)
      let Pz = idlePose(T, i); if (s.act == 'wave' && s.at > 0) { s.at -= dt; Pz = WAVE(T) } else if (!walking && Math.sin(T * .37 + i * 2.1) > .93) Pz = WAVE(T)
      c.root.position.set(s.p.x, 0, s.p.z); c.root.rotation.y = s.face; c.update(dt, Pz, { walk: s.walk, wspd: .8 })
    })
    MUS.U.ex.forEach((x, k) => x.tt.rotation.y += dt * .35)
    MUS.U.chand.forEach((g, k) => g.rotation.y = Math.sin(T * .3 + k) * .05)
  }
  function stepCam(dt) {
    const idle = T - O.user > 5
    if (O.mode == 'cine' && idle) { const sv = world == 'stage'; O.gth = Math.sin(T * .07) * (sv ? .85 : 1.1); O.gph = (sv ? 1.17 : 1.26) + Math.sin(T * .11) * .1; O.gr = (sv ? 20 : 11.5) + Math.sin(T * .05) * (sv ? 4 : 1.5); O.gt.set(Math.sin(T * .09) * (sv ? 1.5 : 3), sv ? 2.4 : 2.4, Math.sin(T * .05) * (sv ? 0 : 3)) }
    if (O.mode == 'focus' && O.focus >= 0) { const p = chars[O.focus].root.position; O.gt.set(p.x, 2.1, p.z) }
    if (O.mode == 'game') { const p = chars[0].root.position; O.gt.set(p.x, 1.9 + chars[0].st.y * .4, p.z) }
    const k = 1 - Math.exp(-dt * 3.2); O.th += (O.gth - O.th) * k; O.ph += (O.gph - O.ph) * k; O.r += (O.gr - O.r) * k; O.t.lerp(O.gt, k)
    const sp = Math.sin(O.ph); cam.position.set(O.t.x + O.r * sp * Math.sin(O.th), O.t.y + O.r * Math.cos(O.ph), O.t.z + O.r * sp * Math.cos(O.th))
    if (world == 'museum') { const B = MUS.bounds; cam.position.x = clamp(cam.position.x, -B.x - .6, B.x + .6); cam.position.z = clamp(cam.position.z, B.z0 - .6, B.z1 + .6); cam.position.y = clamp(cam.position.y, .8, 11) }
    else cam.position.y = Math.max(cam.position.y, .4)
    cam.lookAt(O.t)
  }
  const hp = $('#hudPlay'), htm = $('#hudTm'), hsub = $('#hudSub'); let lastSub = ''
  function stepHud(fr) {
    const on = API.music.running(), t = fr.t; hp.textContent = on ? '❚❚' : '▶'; htm.textContent = API.fmt(t) + ' / 5:00'; hbi.style.width = t / 3 + '%'; V.classList.toggle('paused', !on)
    const sub = world == 'museum' ? (game ? 'Dekati koleksi untuk membaca kisahnya' : 'Ketuk koleksi, lukisan, atau papan untuk membaca kisahnya') : !on && fr.pi < 0 ? 'Ketuk ▶ untuk memulai pertunjukan' : (fr.pi >= 0 ? API.PL[fr.pi].n + ' · ' : '') + fr.mv
    if (sub != lastSub) { hsub.textContent = sub; lastSub = sub } hsub.classList.add('on')
  }

  // Kehilangan konteks WebGL (sering di HP): tampilkan pesan, pulihkan otomatis
  cv.addEventListener('webglcontextlost', e => { e.preventDefault(); load.classList.remove('done'); load.querySelector('span').textContent = 'Memulihkan grafis 3D…' })
  cv.addEventListener('webglcontextrestored', () => { load.classList.add('done') })

  const clock = new THREE.Clock(); let first = 1
  hudText(); place('stage'); setCam('cine')
  R.setAnimationLoop(() => {
    const dt = Math.min(.05, clock.getDelta())
    if (paused || document.hidden || !(vis || th)) return
    T += dt; const fr = API.frame(API.cur())
    world == 'stage' ? stepStage(dt, fr) : stepMuseum(dt)
    stepCam(dt); stepHud(fr)
    R.render(W[world].S, cam)
    if (first) { first = 0; setTimeout(() => load.classList.add('done'), 150) }
  })

  return {
    get world() { return world },
    setWorld, setGame, theater, setCam, focus,
    pause(p) { paused = p ? 1 : 0 },
  }
}
