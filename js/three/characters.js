// Tujuh karakter chibi HD berbusana adat Palembang + rig sendi + pustaka pose 12 gerak tari.
import * as THREE from 'three'
import { songketMat, label } from './tex.js'

const MC = new Map()
const mat = (k, f) => { if (!MC.has(k)) MC.set(k, f()); return MC.get(k) }
const std = (c, r = .6, m = 0, x = {}) => mat('s' + c + r + m + JSON.stringify(x), () => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...x }))
const fab = (c, x = {}) => mat('f' + c, () => new THREE.MeshPhysicalMaterial({ color: c, roughness: .62, sheen: 1, sheenColor: new THREE.Color(c).lerp(new THREE.Color('#ffe7b0'), .5), sheenRoughness: .35, ...x }))
const GOLD = () => std('#f0be4f', .26, 1)
const SKIN = () => mat('skin', () => new THREE.MeshPhysicalMaterial({ color: '#f5c6a0', roughness: .5, sheen: .4, sheenColor: new THREE.Color('#ffb59a'), clearcoat: .08 }))
const HAIR = () => mat('hair', () => new THREE.MeshPhysicalMaterial({ color: '#2a1712', roughness: .4, sheen: 1, sheenColor: new THREE.Color('#8a5a3a'), sheenRoughness: .3 }))
const EYE = () => mat('eye', () => new THREE.MeshPhysicalMaterial({ color: '#24120c', roughness: .1, clearcoat: 1, clearcoatRoughness: .05 }))
const WHITE = () => mat('wh', () => new THREE.MeshBasicMaterial({ color: '#ffffff' }))
const BLUSH = () => mat('bl', () => new THREE.MeshBasicMaterial({ color: '#ff8a9a', transparent: true, opacity: .45, depthWrite: false }))

const SG = (r, w = 40, h = 28, ...a) => new THREE.SphereGeometry(r, w, h, ...a)
const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 8, 20)
function add(p, geo, m, x = 0, y = 0, z = 0, sc) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); if (sc) o.scale.set(...sc); p.add(o); return o }
const grp = (p, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g }
const lathe = (pts, seg = 48) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg)

const KEYS = ['sx', 'sy', 'sz', 'hx', 'hy', 'hz', 'lx', 'ly', 'lz', 'le', 'lw', 'rx', 'ry', 'rz', 're', 'rw', 'lh', 'lk', 'rh', 'rk', 'y', 'fan', 'smile', 'eyes']
const REST = { lz: .12, le: -.14, rz: .12, re: -.14, smile: .6 }

export class Char {
  constructor(def, opt = {}) {
    this.def = def; const L = def.g == 'L', s = def.nm == 'Noval' ? 1.07 : def.nm == 'Zecho' ? .96 : def.nm == 'Karina' ? .97 : 1
    this.L = L; this.J = { ...REST }; KEYS.forEach(k => this.J[k] ??= 0); this.blink = 2 + Math.random() * 3; this.bt = 0; this.wp = Math.random() * 6; this.wob = []; this.t = Math.random() * 10
    const root = this.root = new THREE.Group(); const body = this.body = grp(root); body.scale.setScalar(s)
    const col = def.col, c2 = def.col2, sk = SKIN(), gold = GOLD(), dark = fab(new THREE.Color(col).multiplyScalar(.45).getStyle())
    const HIP = .78, hips = this.hips = grp(body, 0, HIP, 0)
    // Kaki
    const leg = sx => { const g = grp(hips, sx * .15, 0, 0); add(g, cap(.1, .22), L ? dark : sk, 0, -.18, 0); const k = grp(g, 0, -.38, 0); add(k, cap(.088, .2), L ? dark : sk, 0, -.16, 0); add(k, SG(.11, 24, 16), L ? std('#3a2418', .5) : gold, 0, -.34, .06, [1, .55, 1.6]); return [g, k] }
    ;[this.lL, this.kL] = leg(1); [this.lR, this.kR] = leg(-1)
    // Kain: samping (laki-laki, sampai lutut) / kain songket panjang (perempuan)
    const kain = songketMat(L ? new THREE.Color(col).multiplyScalar(.75).getStyle() : col, c2, [3, 1.2], { p: { side: THREE.DoubleSide } })
    if (L) add(hips, lathe([[.27, .08], [.3, 0], [.33, -.2], [.36, -.42]]), kain).castShadow = true
    else { this.skirt = add(hips, lathe([[.25, .1], [.28, 0], [.33, -.3], [.4, -.62], [.43, -.72]]), kain); add(hips, new THREE.TorusGeometry(.43, .022, 8, 48), gold, 0, -.72, 0).rotation.x = Math.PI / 2 }
    // Pending (sabuk emas)
    add(hips, new THREE.TorusGeometry(.285, .03, 10, 48), gold, 0, .07, 0).rotation.x = Math.PI / 2
    add(hips, new THREE.BoxGeometry(.16, .1, .04), gold, 0, .07, .29)
    // Badan
    const sp = this.sp = grp(hips, 0, .06, 0)
    add(sp, lathe([[.27, 0], [.3, .1], [.29, .3], [.27, .45], [.2, .58], [.09, .64]]), L ? fab(col) : songketMat(col, c2, [2, 1]))
    add(sp, new THREE.TorusGeometry(.11, .02, 8, 32), gold, 0, .62, 0).rotation.x = Math.PI / 2
    if (L) {
      const sel = add(sp, new THREE.TorusGeometry(.3, .045, 10, 48), songketMat('#5c0b1a', '#f2c14e', [6, 1]), 0, .3, 0, [1, 1, 1.12]); sel.rotation.set(Math.PI / 2, -.62, 0)
      for (let i = 0; i < 5; i++) add(sp, SG(.022, 10, 8), gold, 0, .52 - i * .1, .3 - (i * .1) ** 2 * .3)
      if (def.nm == 'Noval') add(sp, new THREE.IcosahedronGeometry(.06, 1), gold, .13, .44, .26)
      if (def.nm == 'Radit') { const kr = grp(hips, -.2, .08, .26); kr.rotation.z = .5; add(kr, cap(.025, .08), std('#5a3418', .4), 0, .1, 0); add(kr, new THREE.BoxGeometry(.07, .22, .04), gold, 0, -.05, 0); add(kr, SG(.04, 12, 8), gold, 0, .16, 0, [1.5, .8, 1]) }
    } else {
      // Kalung teratai emas
      const ter = add(sp, lathe([[.1, .6], [.22, .57], [.36, .5], [.4, .46]], 48), std('#f0be4f', .28, 1, { side: THREE.DoubleSide }))
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; add(sp, SG(.025, 10, 8), std('#d6334f', .2, .1), Math.sin(a) * .33, .5, Math.cos(a) * .33) }
      // Selendang
      const cur = new THREE.CatmullRomCurve3([[-.3, -.2, .18], [-.33, .2, .1], [-.2, .55, -.12], [0, .6, -.22], [.2, .55, -.12], [.33, .2, .1], [.3, -.2, .18]].map(p => new THREE.Vector3(...p)))
      this.sel = grp(sp); add(this.sel, new THREE.TubeGeometry(cur, 40, .035, 8, false), fab(def.nm == 'Azizah' ? '#f2c14e' : def.nm == 'Putri' ? '#f2c14e' : '#ffd0e0'))
    }
    // Lengan
    const arm = sx => {
      const a = grp(sp, sx * .31, .5, 0); a.rotation.order = 'ZXY'; add(a, cap(.085, .18), L ? fab(col) : songketMat(col, c2, [1, 1]), 0, -.13, 0)
      if (!L) add(a, new THREE.TorusGeometry(.09, .018, 8, 24), gold, 0, -.14, 0).rotation.x = Math.PI / 2
      const e = grp(a, 0, -.28, 0); add(e, cap(.074, .16), L ? fab(col) : fab(col), 0, -.11, 0); add(e, new THREE.TorusGeometry(.078, .02, 8, 24), gold, 0, -.21, 0).rotation.x = Math.PI / 2
      const h = grp(e, 0, -.27, 0); add(h, SG(.085, 20, 14), sk, 0, -.02, 0, [1, 1.05, .8])
      if (!L) for (let i = 0; i < 4; i++) { const t = add(h, new THREE.ConeGeometry(.016, .22, 8), gold, (i - 1.5) * .032, -.17, .02); t.rotation.set(.18, 0, (i - 1.5) * -.05 + Math.PI); }
      return [a, e, h]
    }
    ;[this.aL, this.eL, this.hL] = arm(1); [this.aR, this.eR, this.hR] = arm(-1)
    // Kipas di tangan kanan (perempuan)
    if (!L) {
      const fan = this.fanG = grp(this.hR, 0, -.06, .05); fan.rotation.set(-1.2, 0, Math.PI); this.blades = []
      const fm = songketMat('#b3122e', '#f2c14e', [.3, 1], { p: { side: THREE.DoubleSide } }), bg = new THREE.PlaneGeometry(.075, .34); bg.translate(0, .19, 0)
      for (let i = 0; i < 11; i++) { const b = new THREE.Mesh(bg, fm); fan.add(b); this.blades.push(b) }
      add(fan, SG(.02, 8, 6), gold)
    }
    // Kepala
    const hd = this.hd = grp(sp, 0, .66, 0), hc = grp(hd, 0, .5, 0); this.hc = hc
    add(hc, SG(.5, 56, 40), sk, 0, 0, 0, [1, .96, .94])
    add(hc, SG(.09, 16, 12), sk, .49, -.03, 0, [.5, 1, .8]); add(hc, SG(.09, 16, 12), sk, -.49, -.03, 0, [.5, 1, .8])
    this.eyes = [1, -1].map(sx => { const g = grp(hc, sx * .17, -.04, .425); add(g, SG(.088, 28, 20), EYE(), 0, 0, 0, [.82, 1.18, .5]); add(g, SG(.03, 12, 8), WHITE(), .022 * sx, .045, .035); add(g, SG(.014, 10, 8), WHITE(), -.022 * sx, -.035, .038); if (!L) { const l = add(g, new THREE.TorusGeometry(.09, .012, 6, 16, 1.2), EYE(), 0, .01, .01); l.rotation.z = sx > 0 ? .75 : Math.PI - .75 - 1.2 } return g })
    ;[1, -1].forEach(sx => { const b = add(hc, cap(.016, .08), HAIR(), sx * .17, .1, .45); b.rotation.z = Math.PI / 2 + sx * .15 })
    this.mouth = add(hc, new THREE.TorusGeometry(.055, .015, 8, 20, Math.PI), std('#b03040', .5), 0, -.2, .435); this.mouth.rotation.z = Math.PI
    add(hc, SG(.024, 10, 8), std('#eaa888', .6), 0, -.09, .468)
    ;[1, -1].forEach(sx => add(hc, SG(.075, 16, 10), BLUSH(), sx * .29, -.14, .355, [1, .6, .3]))
    if (def.hair == 'spiky') [[.2, -.12], [.24, -.17], [-.22, -.13], [-.25, -.18]].forEach(([x, y]) => add(hc, SG(.011, 6, 4), std('#c08060', .6), x, y, .41))
    if (def.hair == 'glasses') { [1, -1].forEach(sx => add(hc, new THREE.TorusGeometry(.105, .013, 8, 32), gold, sx * .17, -.04, .47)); add(hc, cap(.01, .07), gold, 0, -.02, .49).rotation.z = Math.PI / 2 }
    // Rambut & tutup kepala
    const H = HAIR()
    if (def.hair != 'hijab') { const c = add(hc, SG(.53, 48, 24, 0, Math.PI * 2, 0, 1.25), H); c.rotation.x = -.32; add(hc, SG(.525, 48, 24, Math.PI, Math.PI, 0, 2.15), H, 0, 0, -.02) }
    if (L) {
      if (def.hair == 'curly') for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, y = -.05 - (i % 3) * .08; add(hc, SG(.1, 14, 10), H, Math.sin(a) * .5, y, Math.cos(a) * .48 - .08).visible = Math.cos(a) < .5 }
      if (def.hair == 'spiky') for (let i = 0; i < 7; i++) { const c = add(hc, new THREE.ConeGeometry(.06, .2, 8), H, (i - 3) * .1, .16, .42 - Math.abs(i - 3) * .04); c.rotation.set(1.1, 0, (i - 3) * -.2) }
      if (def.hair == 'neat' || def.hair == 'glasses') { const f = add(hc, SG(.2, 20, 14), H, .12, .2, .38, [1.4, .45, .6]); f.rotation.z = -.35 }
      // Tanjak belah mumbang
      const tj = grp(hc, 0, .18, -.02); tj.rotation.x = -.16; const tm = songketMat(def.col, def.col2, [4, .6], { p: { side: THREE.DoubleSide } })
      add(tj, new THREE.CylinderGeometry(.535, .55, .22, 56, 1, true), tm); add(tj, new THREE.CylinderGeometry(.5, .535, .05, 56), tm, 0, .12, 0)
      add(tj, new THREE.TorusGeometry(.55, .018, 8, 56), gold, 0, -.11, 0).rotation.x = Math.PI / 2
      const pk = add(tj, new THREE.ConeGeometry(.3, .62, 4), tm, 0, .43, .08, [1, 1, .3]); pk.rotation.set(-.12, Math.PI / 4, 0)
      const wg = add(tj, new THREE.ConeGeometry(.18, .36, 4), tm, .3, .26, .1, [1, 1, .3]); wg.rotation.set(0, Math.PI / 4, -.75)
      add(tj, SG(.05, 12, 8), gold, 0, .14, .53)
    } else if (def.hair == 'hijab') {
      const hj = fab('#f3e6cc', { side: THREE.DoubleSide })
      add(hc, SG(.565, 48, 32, Math.PI / 2 + .9, Math.PI * 2 - 1.8, 0, 2.5), hj, 0, .01, -.03)
      add(hc, SG(.565, 48, 16, 0, Math.PI * 2, 0, .98), hj, 0, .01, -.03)
      add(hc, lathe([[.38, -.36], [.48, -.48], [.56, -.66], [.58, -.72]], 48), hj)
      ;[1, -1].forEach(sx => add(hc, SG(.035, 12, 8), gold, sx * .45, -.05, .25))
      const cr = grp(hc, 0, .5, -.02); add(cr, new THREE.CylinderGeometry(.2, .24, .08, 32), gold); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, c = add(cr, new THREE.ConeGeometry(.035, .14, 8), gold, Math.sin(a) * .2, .1, Math.cos(a) * .2) } add(cr, SG(.04, 10, 8), std('#1f8a52', .2, .2), 0, .02, .24)
    } else {
      // Poni & rambut panjang belakang
      add(hc, SG(.26, 24, 16), H, 0, .25, .32, [1.5, .5, .6])
      add(hc, SG(.42, 32, 20), H, 0, -.25, -.22, [1.1, 1.05, .8])
      if (def.hair == 'kesuhun') {
        const kc = grp(hc, 0, .42, -.04); add(kc, lathe([[.3, 0], [.32, .12], [.36, .32], [.42, .46]], 48), std('#f0be4f', .25, 1, { side: THREE.DoubleSide }))
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; add(kc, new THREE.ConeGeometry(.04, .2, 8), gold, Math.sin(a) * .41, .55, Math.cos(a) * .41) }
        add(kc, SG(.07, 16, 12), std('#d6334f', .15, .1), 0, .2, .34)
        add(hc, new THREE.TorusGeometry(.5, .025, 8, 40, Math.PI), gold, 0, .2, .02).rotation.set(-.3, 0, 0)
        this.kg(kc, 5, .5, .4, gold)
      } else {
        const bun = grp(hc, 0, .3, -.42); add(bun, SG(.24, 28, 20), H)
        for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, fl = grp(bun, Math.sin(a) * .22, Math.cos(a) * .14 + .05, .06); for (let k = 0; k < 6; k++) { const b = k / 6 * Math.PI * 2; add(fl, SG(.04, 10, 8), std('#ff8fb3', .5), Math.cos(b) * .045, Math.sin(b) * .045, 0) } add(fl, SG(.03, 10, 8), std('#ffd76a', .4)) }
        ;[1, -1].forEach(sx => add(hc, SG(.11, 16, 12), H, sx * .46, -.3, .05, [.8, 1.4, .8]))
        this.kg(bun, 3, .2, .25, gold)
      }
      ;[1, -1].forEach(sx => { add(hc, SG(.03, 10, 8), gold, sx * .5, -.12, .02); add(hc, new THREE.ConeGeometry(.025, .08, 8), gold, sx * .5, -.2, .02).rotation.x = Math.PI })
    }
    // Label nama
    if (opt.label !== false) { const sp2 = this.tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: label(def.nm, def.id), depthWrite: false, transparent: true })); sp2.scale.set(1.3, .41, 1); sp2.position.y = 3.25 * s; sp2.renderOrder = 10; root.add(sp2) }
    root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false } })
  }
  // Kembang goyang: bunga emas pada tangkai pegas yang bergoyang.
  kg(p, n, r, h, gold) { for (let i = 0; i < n; i++) { const a = (i - (n - 1) / 2) * .5, g = grp(p, Math.sin(a) * r, h, Math.cos(a) * r * .6); const st = add(g, new THREE.CylinderGeometry(.008, .008, .22, 6), gold, 0, .11, 0); const f = grp(g, 0, .23, 0); for (let k = 0; k < 5; k++) { const b = k / 5 * Math.PI * 2; add(f, SG(.03, 10, 8), gold, Math.cos(b) * .035, 0, Math.sin(b) * .035) } add(f, SG(.022, 8, 6), std('#d6334f', .2, .1)); g.rotation.z = -a * .5; this.wob.push(g) } }

  update(dt, P, o = {}) {
    const J = this.J, k = 1 - Math.exp(-dt * (o.snap || 9)); this.t += dt
    for (const key of KEYS) { const tv = P[key] ?? REST[key] ?? 0; J[key] += (tv - J[key]) * k }
    // Langkah kaki saat berpindah formasi
    const w = Math.min(1, o.walk || 0); this.wp += dt * (5 + 5 * w) * (o.wspd || 1); const sn = Math.sin(this.wp), la = this.L ? .6 : .38
    const lg = (a, b) => a * (1 - w) + b * w
    this.lL.rotation.x = lg(J.lh, -la * sn); this.kL.rotation.x = lg(J.lk, Math.max(0, -Math.sin(this.wp - .8)) * .7)
    this.lR.rotation.x = lg(J.rh, la * sn); this.kR.rotation.x = lg(J.rk, Math.max(0, Math.sin(this.wp - .8)) * .7)
    this.aL.rotation.set(lg(J.lx, .38 * sn), J.ly * (1 - w), lg(J.lz, .14)); this.eL.rotation.x = lg(J.le, -.35)
    this.aR.rotation.set(lg(J.rx, -.38 * sn), -J.ry * (1 - w), -lg(J.rz, .14)); this.eR.rotation.x = lg(J.re, -.35)
    this.hL.rotation.y = J.lw; this.hR.rotation.y = -J.rw
    this.sp.rotation.set(J.sx + w * .06, J.sy, J.sz); this.hd.rotation.set(J.hx, J.hy, J.hz)
    this.body.position.y = J.y + (o.jump || 0) + w * Math.abs(Math.cos(this.wp)) * .05 + (o.bob || 0)
    this.body.rotation.y = o.spin || 0
    const fl = Math.min(J.lk, J.rk); this.hips.position.y = .78 - (1 - w) * Math.max(0, fl) * .12
    // Kipas membuka
    if (this.blades) { const n = this.blades.length; this.blades.forEach((b, i) => b.rotation.z = (i - (n - 1) / 2) / ((n - 1) / 2) * J.fan * 1.25) }
    if (this.sel) this.sel.rotation.set(Math.sin(this.t * 1.6) * .04 + J.sx * -.3, J.sy * -.4, Math.sin(this.t * 1.2) * .05 - J.sz * .8)
    // Kedip, senyum, mata bahagia
    this.blink -= dt; let es = 1; if (this.blink < 0) { es = .12; if (this.blink < -.12) this.blink = 2 + Math.random() * 3.5 }
    const hap = J.eyes; this.eyes.forEach(e => e.scale.set(1, Math.max(.1, es * (1 - hap * .82)), 1))
    this.mouth.scale.set(.75 + J.smile * .5, .6 + J.smile * .7, 1)
    // Goyangan kembang goyang mengikuti kepala
    this.wob.forEach((g, i) => { g.rotation.x = Math.sin(this.t * 7 + i * 1.7) * (.05 + Math.abs(J.hy) * .2 + w * .12) - J.hx * .3; g.rotation.y = Math.sin(this.t * 5 + i) * .08 })
  }
}

/* ===== Pustaka pose =====
   Tiap gerak = 4 hitungan (kunci), tiap hitungan 2 ketuk. c = ketuk sejak awal gerak (0..8). */
const CHEST = { lx: -.48, lz: -.22, le: -1.85, rx: -.48, rz: -.22, re: -1.85 }
const SEMBAH = { lx: -.55, lz: -.3, le: -1.98, rx: -.55, rz: -.3, re: -1.98, lw: .4, rw: .4 }
const CLASP = { lx: -.35, lz: -.3, le: -1.0, rx: -.35, rz: -.3, re: -1.0 }
const AKIMBO = { lx: .1, ly: -1.5, lz: .72, le: -1.55, rx: .1, ry: -1.5, rz: .72, re: -1.55 }
const CROSS = { lx: -.62, lz: -.62, le: -1.9, rx: -.7, rz: -.5, re: -1.75 }
const OPEN = { lz: 1.42, le: -.25, rz: 1.42, re: -.25 }
const UP = { lx: -2.85, lz: .3, le: -.22, rx: -2.85, rz: .3, re: -.22, hx: -.18 }
const KP = {
  'Sembah Salam': [SEMBAH, { ...SEMBAH, lx: -.95, rx: -.95, le: -2.1, re: -2.1, hx: -.06 }, { ...SEMBAH, sx: .42, hx: .32, y: -.06, lk: .3, rk: .3, eyes: 1, smile: .9 }, SEMBAH],
  'Langkah Melayu': [{ rh: -.35, rk: .35, sz: .05, sy: .1, lx: -.15, lz: .38, le: -.75, rx: -.15, rz: .38, re: -.75, lw: .6, rw: .6, y: .01, hz: -.06 }, { lx: -.15, lz: .3, le: -.75, rx: -.15, rz: .3, re: -.75, lk: .2, rk: .2, y: -.05 }, { lh: -.35, lk: .35, sz: -.05, sy: -.1, lx: -.15, lz: .38, le: -.75, rx: -.15, rz: .38, re: -.75, lw: -.6, rw: -.6, y: .01, hz: .06 }, { lx: -.15, lz: .3, le: -.75, rx: -.15, rz: .3, re: -.75, lk: .2, rk: .2, y: -.05 }],
  'Tangan Mekar': [CHEST, { ...OPEN, lw: .3, rw: .3 }, { lz: 1.5, le: -.38, rz: 1.5, re: -.38, lw: 1.5, rw: 1.5, sz: .07, hz: .14, lk: .22, rk: .22, y: -.05, smile: .9 }, CHEST],
  'Kipas Mekar': [{ ...CHEST, fan: 0 }, { lx: -.48, lz: -.22, le: -1.85, rx: -.3, rz: 1.25, re: -.5, fan: .3, sy: -.1, hy: -.15 }, { lx: -.48, lz: -.22, le: -1.85, rx: -.65, rz: 1.6, re: -.6, rw: 1.2, fan: 1, sy: -.22, hz: -.12, hy: -.32, lk: .22, rk: .22, y: -.05, smile: .9 }, { ...CHEST, fan: 0 }],
  'Ayun Selendang': [{ lx: -.3, lz: .35, le: -.5, rx: -.2, rz: .95, re: -.3, sy: -.32, sz: .12, hy: -.22 }, { lx: -.2, lz: .95, le: -.3, rx: -.3, rz: .35, re: -.5, sy: .32, sz: -.16, hy: .22, lk: .22, rk: .22, y: -.05 }, { lx: -.3, lz: .35, le: -.5, rx: -.2, rz: .95, re: -.3, sy: -.32, sz: .12, hy: -.22 }, { lz: .28, le: -.3, rz: .28, re: -.3 }],
  'Langkah Tegap': [{ ...AKIMBO, rh: -.55, rk: .55, sx: -.05, y: .02 }, { ...AKIMBO, lh: -.55, lk: .55, sx: -.05, y: .02 }, { ...AKIMBO, rh: -.55, rk: .55, sx: -.05, y: .02 }, { ...AKIMBO, hx: -.05 }],
  'Sikap Tanjak': [{ rx: -2.45, rz: .4, re: -1.5, lz: .12, le: -.14, hx: .05 }, { rx: -2.45, rz: .4, re: -1.5, hx: .28, sx: .1 }, CROSS, { lz: .08, le: -.08, rz: .08, re: -.08, hx: -.05 }],
  'Hentak Gagah': [{ rx: -.35, rz: -.18, re: -2.15, lz: .2, le: -.3, rh: -.25, rk: .35, y: -.07, sx: .05 }, { lx: -.35, lz: -.18, le: -2.15, rx: -.35, rz: -.18, re: -2.15, lh: -.25, lk: .35, y: -.07 }, { ...OPEN, lz: 1.25, rz: 1.25, rh: -.25, rk: .35, y: -.07, hx: -.06 }, { lz: .1, le: -.1, rz: .1, re: -.1, hx: -.06 }],
  'Tepuk Jaga': [{ rx: -.62, rz: -.72, re: -1.25, lx: -.35, lz: .18, le: -1.25 }, { lx: -.62, lz: -.72, le: -1.25, rx: -.35, rz: .18, re: -1.25 }, CROSS, { lz: .55, le: -.2, rz: .55, re: -.2 }],
  'Putar Berpasangan': [{ lz: .9, le: -.35, rz: .9, re: -.35, rh: -.2, rk: .2 }, { lz: 1.05, le: -.3, rz: 1.05, re: -.3, sz: .05, lk: .15, rk: .15 }, { lz: 1.05, le: -.3, rz: 1.05, re: -.3, sz: -.05, lk: .15, rk: .15 }, { lz: .4, le: -.3, rz: .4, re: -.3 }],
  'Angkat Bersama': [CHEST, UP, { ...UP, y: .04, smile: 1, eyes: .6 }, { lx: -.3, lz: .55, le: -.3, rx: -.3, rz: .55, re: -.3, smile: 1 }],
}
const SAMBUT_L = [{ rx: -1.25, rz: .15, re: -.25, rw: 1.2, sx: .05 }, { rx: -1.25, rz: .15, re: -.25, rw: 1.2, sx: .05 }, { ...CLASP, sx: .28, hx: .2 }, { lz: .12, le: -.14 }]
const SAMBUT_P = [CHEST, { lx: -.48, lz: -.22, le: -1.85, rx: -1.0, rz: .4, re: -.5, fan: 1, hy: -.1 }, { ...CHEST, sx: .28, hx: .2, fan: .4, eyes: 1 }, { ...CHEST, fan: 0 }]
const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u)
function blend(A, B, u) { const o = {}; for (const k of KEYS) { const a = A[k] ?? REST[k] ?? 0, b = B[k] ?? REST[k] ?? 0; o[k] = a + (b - a) * u } return o }
export const IDLE = CLASP
export function groupOf(n) { if (/Tableau|kosong/.test(n)) return 'X'; if (n.includes('(P)')) return 'B'; for (const k of ['Tangan Mekar', 'Kipas Mekar', 'Ayun Selendang']) if (n.includes(k)) return 'P'; for (const k of ['Langkah Tegap', 'Sikap Tanjak', 'Hentak Gagah', 'Tepuk Jaga']) if (n.includes(k)) return 'L'; return 'B' }

// Pose menari untuk satu karakter. L = laki-laki, c = ketuk dalam gerak, e = energi musik, beat = ketuk total (untuk ayunan).
export function dancePose(n, c, L, e, beat, on) {
  let keys
  if (n.includes('(P)')) keys = L ? KP['Sikap Tanjak'] : KP['Tangan Mekar']
  else if (n == 'Saling Sambut') keys = L ? SAMBUT_L : SAMBUT_P
  else if (n == 'Tableau diam') { const p = L ? { ...CROSS } : { ...OPEN, lz: 1.3, lw: 1.2, rw: 1.2, hz: .12, smile: 1 }; return { p, spin: 0 } }
  else keys = KP[n]
  if (!keys) return { p: { ...REST, sz: Math.sin(beat * Math.PI / 2) * .03 * (on ? 1 : .3), smile: .6 }, spin: 0 }
  const cc = ((c % 8) + 8) % 8, k = Math.floor(cc / 2), u = (cc % 2) / 2, sharp = /Hentak|Tegap|Tepuk/.test(n) ? .35 : .7
  let p = blend(keys[(k + 3) % 4], keys[k], ease(u / sharp))
  const amp = .82 + .25 * e; for (const kk of KEYS) if (kk != 'smile' && kk != 'eyes' && kk != 'fan') p[kk] = (REST[kk] ?? 0) + (p[kk] - (REST[kk] ?? 0)) * amp
  // ayunan lembut tiap ketuk (mendhak) agar menyatu dengan irama
  if (on) { const ph = beat % 1; p.y += -.035 * (.5 - .5 * Math.cos(ph * Math.PI * 2)) * (.6 + e * .6); p.hz = (p.hz || 0) + Math.sin(beat * Math.PI) * .04 }
  const spin = n == 'Putar Berpasangan' ? ease((cc - 2) / 4) * Math.PI * 2 : 0
  return { p, spin }
}
export function idlePose(t, i) { return { ...CLASP, sz: Math.sin(t * .9 + i) * .03, hy: Math.sin(t * .5 + i * 2) * .25, smile: .55 } }
export const WAVE = t => ({ rx: -2.6, rz: .55 + Math.sin(t * 12) * .25, re: -.7, smile: 1, eyes: .8, hz: -.1 })
