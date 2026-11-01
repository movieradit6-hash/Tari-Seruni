// Tekstur prosedural HD (kanvas) untuk panggung, museum, dan busana karakter.
import * as THREE from 'three'

const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h || w; return [c, c.getContext('2d')] }
const T = (c, rep, srgb = true) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]) } return t }
const cache = new Map()

// Songket: warna dasar + motif benang emas (lepus/tabur, pucuk rebung). Kembalikan peta warna + peta kasar/logam.
export function songket(base = '#8c1d2c', gold = '#e3a93a', rep = [1, 1], kind = 0) {
  const key = base + gold + kind
  if (!cache.has(key)) {
    const S = 256, [c, q] = cv(S), [m, r] = cv(S)
    q.fillStyle = base; q.fillRect(0, 0, S, S); r.fillStyle = 'rgb(0,215,0)'; r.fillRect(0, 0, S, S)
    // serat tenun halus
    for (let y = 0; y < S; y += 2) { q.fillStyle = `rgba(0,0,0,${.05 + Math.random() * .05})`; q.fillRect(0, y, S, 1) }
    const both = (fn) => { q.fillStyle = gold; q.strokeStyle = gold; r.fillStyle = 'rgb(0,70,255)'; r.strokeStyle = 'rgb(0,70,255)'; fn(q); fn(r) }
    both(g => {
      g.lineWidth = 3
      // pita pucuk rebung atas & bawah
      for (const y0 of [0, S - 34]) { g.fillRect(0, y0 + (y0 ? 30 : 0), S, 4); for (let x = 0; x < S; x += 32) { g.beginPath(); const up = !y0; g.moveTo(x, up ? 4 : y0 + 30); g.lineTo(x + 16, up ? 32 : y0 + 2); g.lineTo(x + 32, up ? 4 : y0 + 30); g.closePath(); kind ? g.fill() : g.stroke() } }
      // motif tabur wajik bunga
      for (let y = 48; y < S - 40; y += 40) for (let x = (y / 40 % 2) * 20 + 10; x < S; x += 40) {
        g.beginPath(); g.moveTo(x, y - 11); g.lineTo(x + 11, y); g.lineTo(x, y + 11); g.lineTo(x - 11, y); g.closePath(); g.stroke()
        g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill()
        for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; g.beginPath(); g.arc(x + Math.cos(a) * 16, y + Math.sin(a) * 16, 1.6, 0, 7); g.fill() }
      }
    })
    cache.set(key, [c, m])
  }
  const [c, m] = cache.get(key)
  return { map: T(c, rep), mr: T(m, rep, false) }
}
export function songketMat(base, gold, rep, extra = {}) {
  const s = songket(base, gold, rep, extra.kind || 0)
  return new THREE.MeshPhysicalMaterial({ map: s.map, roughnessMap: s.mr, metalnessMap: s.mr, roughness: 1, metalness: 1, sheen: .6, sheenColor: new THREE.Color(gold), sheenRoughness: .5, ...extra.p })
}

export function wood(rep = [4, 4], tone = ['#7a3e1c', '#5a2b12']) {
  const S = 512, [c, q] = cv(S); q.fillStyle = tone[0]; q.fillRect(0, 0, S, S)
  for (let i = 0; i < 8; i++) { const y = i * S / 8; q.fillStyle = `hsl(${20 + Math.random() * 8},${45 + Math.random() * 10}%,${22 + Math.random() * 8}%)`; q.fillRect(0, y, S, S / 8 - 2); q.fillStyle = '#2a1208'; q.fillRect(0, y + S / 8 - 2, S, 2); q.fillRect((Math.random() * S) | 0, y, 2, S / 8) }
  q.globalAlpha = .18; for (let i = 0; i < 260; i++) { q.strokeStyle = Math.random() < .5 ? '#2a1208' : '#c07a40'; q.beginPath(); const y = Math.random() * S; q.moveTo(0, y); q.bezierCurveTo(S * .3, y + Math.random() * 6 - 3, S * .6, y + Math.random() * 6 - 3, S, y + Math.random() * 4 - 2); q.stroke() }
  return T(c, rep)
}
export function marble(rep = [6, 8]) {
  const S = 512, [c, q] = cv(S); q.fillStyle = '#f4ead8'; q.fillRect(0, 0, S, S)
  q.globalAlpha = .35; for (let i = 0; i < 40; i++) { q.strokeStyle = ['#c9b79a', '#d8c7a8', '#b9a07a'][i % 3]; q.lineWidth = Math.random() * 1.6 + .3; q.beginPath(); let x = Math.random() * S, y = Math.random() * S; q.moveTo(x, y); for (let k = 0; k < 6; k++) { x += Math.random() * 120 - 40; y += Math.random() * 120 - 60; q.lineTo(x, y) } q.stroke() }
  q.globalAlpha = 1; q.strokeStyle = '#b8913f'; q.lineWidth = 4; q.strokeRect(2, 2, S - 4, S - 4); q.fillStyle = '#8c1d2c'; q.save(); q.translate(S / 2, S / 2); q.rotate(Math.PI / 4); q.fillRect(-26, -26, 52, 52); q.fillStyle = '#e3a93a'; q.fillRect(-14, -14, 28, 28); q.restore()
  return T(c, rep)
}
// Ukiran Palembang: sulur emas di atas merah marun / kayu.
export function carving(base = '#5c0b1a', gold = '#e3a93a', rep = [1, 1]) {
  const S = 512, [c, q] = cv(S); q.fillStyle = base; q.fillRect(0, 0, S, S)
  q.strokeStyle = gold; q.fillStyle = gold; q.lineWidth = 6; q.strokeRect(14, 14, S - 28, S - 28); q.lineWidth = 2; q.strokeRect(28, 28, S - 56, S - 56)
  const scroll = (x, y, s, a) => { q.save(); q.translate(x, y); q.rotate(a); q.scale(s, s); q.lineWidth = 5 / s; q.beginPath(); q.moveTo(0, 0); q.bezierCurveTo(30, -40, 80, -10, 60, 20); q.bezierCurveTo(48, 38, 24, 26, 32, 10); q.stroke(); q.beginPath(); q.ellipse(70, -18, 10, 5, .6, 0, 7); q.fill(); q.restore() }
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; q.save(); q.translate(S / 2, S / 2); q.rotate(a); scroll(30, 10, 1.6, 0); scroll(30, -10, 1.6, -0.2); q.restore() }
  q.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = i % 2 ? 26 : 50; q.lineTo(S / 2 + Math.cos(a) * rr, S / 2 + Math.sin(a) * rr) } q.closePath(); q.fill(); q.fillStyle = base; q.beginPath(); q.arc(S / 2, S / 2, 14, 0, 7); q.fill()
  for (const [x, y] of [[60, 60], [S - 60, 60], [60, S - 60], [S - 60, S - 60]]) { q.fillStyle = gold; q.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; q.ellipse(x + Math.cos(a) * 12, y + Math.sin(a) * 12, 9, 4, a, 0, 7) } q.fill() }
  return T(c, rep)
}
export function sky(stops) {
  const [c, q] = cv(16, 512), g = q.createLinearGradient(0, 0, 0, 512); stops.forEach(([o, col]) => g.addColorStop(o, col)); q.fillStyle = g; q.fillRect(0, 0, 16, 512); return T(c)
}
export function glow(col = '#ffd76a') {
  const [c, q] = cv(128), g = q.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, '#fff'); g.addColorStop(.25, col); g.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = g; q.fillRect(0, 0, 128, 128); return T(c)
}
export function petal() {
  const [c, q] = cv(64); q.translate(32, 32); q.rotate(.6); const g = q.createLinearGradient(-20, 0, 20, 0); g.addColorStop(0, '#ffe08a'); g.addColorStop(1, '#ff9db1'); q.fillStyle = g; q.beginPath(); q.ellipse(0, 0, 26, 12, 0, 0, 7); q.fill(); return T(c)
}
function round(q, x, y, w, h, r) { q.beginPath(); q.moveTo(x + r, y); q.arcTo(x + w, y, x + w, y + h, r); q.arcTo(x + w, y + h, x, y + h, r); q.arcTo(x, y + h, x, y, r); q.arcTo(x, y, x + w, y, r); q.closePath() }
export function label(text, sub, col = '#8c1d2c') {
  const [c, q] = cv(512, 160); q.font = '800 64px "Plus Jakarta Sans",system-ui,sans-serif'; const w = Math.min(500, q.measureText(text).width + 90)
  round(q, (512 - w) / 2, 14, w, sub ? 120 : 96, 48); const g = q.createLinearGradient(0, 14, 0, 130); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#ffe7c2'); q.fillStyle = g; q.fill(); q.lineWidth = 6; q.strokeStyle = '#e3a93a'; q.stroke()
  q.fillStyle = col; q.textAlign = 'center'; q.fillText(text, 256, 84); if (sub) { q.font = '700 30px system-ui,sans-serif'; q.fillStyle = '#b8860b'; q.fillText(sub, 256, 122) }
  return T(c)
}
export function board(title, body, w = 1024, h = 680) {
  const [c, q] = cv(w, h); const g = q.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6e0f20'); g.addColorStop(1, '#3a0610'); q.fillStyle = g; q.fillRect(0, 0, w, h)
  q.strokeStyle = '#e3a93a'; q.lineWidth = 14; q.strokeRect(10, 10, w - 20, h - 20); q.lineWidth = 3; q.strokeRect(34, 34, w - 68, h - 68)
  for (let x = 60; x < w - 40; x += 36) { q.fillStyle = '#e3a93a'; q.beginPath(); q.moveTo(x, 46); q.lineTo(x + 10, 60); q.lineTo(x, 74); q.lineTo(x - 10, 60); q.fill() }
  q.fillStyle = '#ffd76a'; q.textAlign = 'center'; q.font = '700 64px "Playfair Display",Georgia,serif'; q.fillText(title, w / 2, 150)
  q.fillStyle = '#fbeed2'; q.textAlign = 'left'; q.font = '400 31px "Plus Jakarta Sans",system-ui,sans-serif'
  const words = body.split(' '); let line = '', y = 220; const mw = w - 140
  for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (q.measureText(t).width > mw) { q.fillText(line, 70, y); y += 42; line = wd; if (y > h - 60) break } else line = t } if (y <= h - 60) q.fillText(line, 70, y)
  return T(c)
}
export function sign(text, sub) {
  const [c, q] = cv(1024, 256); q.fillStyle = '#3a0610'; q.fillRect(0, 0, 1024, 256); q.strokeStyle = '#e3a93a'; q.lineWidth = 10; q.strokeRect(8, 8, 1008, 240)
  q.fillStyle = '#ffd76a'; q.textAlign = 'center'; q.font = '700 78px "Playfair Display",Georgia,serif'; q.fillText(text, 512, 120); if (sub) { q.font = '600 36px system-ui'; q.fillStyle = '#fbeed2'; q.fillText(sub, 512, 190) } return T(c)
}
// Gambar AI dimuat lewat Netlify Image CDN, jatuh balik ke file asli bila CDN tidak tersedia.
const TL = new THREE.TextureLoader()
export function img(file, w = 1024) {
  const t = new THREE.Texture(); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
  const set = im => { t.image = im; t.needsUpdate = true }
  TL.load(`/.netlify/images?url=/img/${file}&w=${w}&fm=webp`, x => set(x.image), undefined, () => TL.load('/img/' + file, x => set(x.image)))
  return t
}
