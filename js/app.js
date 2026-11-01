import { F, PL, SEC, JD, G, BU, TIPS, PRP, NR, BS, bd, MV, CHR, NM, PN, EX, ART } from './data.js'
import { createMusic, ov, nb, bell, tak, swish, gg, pop, whoosh, sparkle, unlock, tapN, scale, vb, isMuted, setMuted, mf2 } from './audio.js'

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)]
const M = createMusic()
let lp = null, last = -2
const cur = () => M.cur(), playing = () => M.running()
const secAt = t => { let r = 0; SEC.forEach((s, i) => { if (t >= s.a) r = i }); return r }
const pAt = t => { let r = -1; PL.forEach((p, i) => { if (t >= p.t - .001) r = i }); return r }
const mvAt = t => { let r = 0; MV.forEach((m, i) => { if (t >= m.t0 - .001) r = i }); return r }
const fmt = t => (t / 60 | 0) + ':' + String(t % 60 | 0).padStart(2, '0'), fm1 = t => fmt(t) + (t % 1 > .05 ? ',' + Math.round(t % 1 * 10) : '')
const seek = t => M.seek(t)
const TX = new Map(), txt = (el, v) => { if (TX.get(el) !== v) { TX.set(el, v); el.textContent = v } }

// Info per bingkai untuk 2D dan 3D (satu jam musik untuk semua)
function frame(t) {
  const si = secAt(t), S = SEC[si], bt = 60 / S.bpm, bi = (t - S.a) / bt, mi = mvAt(t), m = MV[mi], pi = pAt(t)
  return { t, si, S, bt, bi, bar: Math.min(NR[si], (bi / 4 | 0) + 1), mi, mv: m.n, mvC: (t - m.t0) / bt, pi, f: pi < 0 ? F({}) : PL[pi].f, nf: PL[pi + 1], e: S.e[0] + (S.e[1] - S.e[0]) * Math.min(1, (t - S.a) / S.d), on: playing(), rate: M.rate }
}

/* ===== Toast ===== */
let tt; function toast(s) { const e = $('#toast'); e.textContent = s; e.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => e.classList.remove('on'), 2600) }

/* ===== Maskot Seruni ===== */
function mas(m) {
  m = m || 'n'; const E = { n: '<ellipse cx="26" cy="30" rx="3" ry="3.6"/><ellipse cx="38" cy="30" rx="3" ry="3.6"/><circle cx="27" cy="28.6" r="1.1" fill="#fff"/><circle cx="39" cy="28.6" r="1.1" fill="#fff"/><path d="M27 37q5 6 10 0z" fill="#d6334f"/>', h: '<path d="M22 32q4-7 8 0M34 32q4-7 8 0" stroke="#2a1210" fill="none" stroke-width="2.2" stroke-linecap="round"/><path d="M25 36q7 10 14 0z" fill="#d6334f"/><path d="M50 10l1.6 3.4 3.4.5-2.5 2.3.7 3.4-3.2-1.8-3.2 1.8.7-3.4-2.5-2.3 3.4-.5z" fill="#ff8a5c"/>', s: '<circle cx="26" cy="30" r="4.2"/><circle cx="38" cy="30" r="4.2"/><circle cx="27.3" cy="28.6" r="1.4" fill="#fff"/><circle cx="39.3" cy="28.6" r="1.4" fill="#fff"/><ellipse cx="32" cy="40" rx="3" ry="4" fill="#d6334f"/>', t: '<ellipse cx="26" cy="30" rx="3" ry="3.6"/><ellipse cx="38" cy="30" rx="3" ry="3.6"/><path d="M28 39h8" stroke="#2a1210" stroke-width="2" stroke-linecap="round"/><circle cx="49" cy="17" r="2" fill="#ff8a5c"/><circle cx="54" cy="10" r="3.2" fill="#ff8a5c"/>', z: '<path d="M22 31q4 3 8 0M34 31q4 3 8 0" stroke="#2a1210" fill="none" stroke-width="2.2" stroke-linecap="round"/><path d="M27 37q5 5 10 0" stroke="#d6334f" fill="none" stroke-width="2" stroke-linecap="round"/>' }[m]
  return '<svg viewBox="0 0 64 64"><defs><radialGradient id="sf" cx=".4" cy=".35"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#ffe7c2"/></radialGradient></defs><g>' + Array.from({ length: 12 }, (_, i) => `<ellipse cx="32" cy="10" rx="4.5" ry="9" fill="${i % 2 ? '#ff9db1' : '#ffc94d'}" stroke="#fff" stroke-width=".5" transform="rotate(${i * 30} 32 32)"/>`).join('') + '</g><circle cx="32" cy="33" r="17" fill="url(#sf)" stroke="#e0a020" stroke-width="1.5"/><path d="M22 19l4-6 3 4 3-6 3 6 3-4 4 6z" fill="#ffd76a" stroke="#d99a1c"/><circle cx="32" cy="13.5" r="1.6" fill="#d6334f"/><circle cx="22.5" cy="37" r="3.2" fill="#ff8a9a" opacity=".6"/><circle cx="41.5" cy="37" r="3.2" fill="#ff8a9a" opacity=".6"/><g fill="#2a1210">' + E + '</g></svg>'
}
let cm = 'n'; const mood = m => { cm = m; const g = mas(m); $('#bl').innerHTML = g; const a = $('#ca'); if (a) a.innerHTML = g }; mood('n')
setInterval(() => { if (cm == 'n') { $('#bl').innerHTML = mas('z'); setTimeout(() => { if (cm == 'n') $('#bl').innerHTML = mas('n') }, 150) } }, 3600)
$$('.mini-seruni').forEach(e => e.innerHTML = mas('h'))

/* ===== Chibi 2D HD (potret kartu & chip pola lantai) ===== */
const mix = (h, t, w = '#ffffff') => { const p = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16)), A = p(h), B = p(w); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('') }
// Kepala chibi berpusat di (0,0), wajah r=14. k = awalan id gradien agar unik per SVG.
function chibiHead(c, k) {
  const L = c.g == 'L', col = c.col, G = `url(#${k}g)`, H = `url(#${k}h)`, C = `url(#${k}c)`, hy = c.hair
  const defs = `<radialGradient id="${k}s" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#ffe6d2"/><stop offset=".7" stop-color="#f6c39e"/><stop offset="1" stop-color="#e9a57e"/></radialGradient><linearGradient id="${k}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(col, .35)}"/><stop offset="1" stop-color="${mix(col, .25, '#000000')}"/></linearGradient><linearGradient id="${k}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b8"/><stop offset=".45" stop-color="#f2c14e"/><stop offset="1" stop-color="#b07a12"/></linearGradient><linearGradient id="${k}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#55301f"/><stop offset="1" stop-color="#1c0d08"/></linearGradient>`
  let back = '', front = '', face = `<circle r="14" fill="url(#${k}s)"/>`
  if (L) {
    back = `<ellipse cx="-13.6" cy="3" rx="2.6" ry="3.4" fill="#f0b48c"/><ellipse cx="13.6" cy="3" rx="2.6" ry="3.4" fill="#f0b48c"/>`
    const hair = hy == 'curly' ? [-13, -9, 9, 13].map((x, i) => `<circle cx="${x}" cy="${i % 3 ? -3 : 1}" r="4.2" fill="${H}"/>`).join('') : hy == 'spiky' ? `<path d="M-15 2l-2-8 4 2 0-6 4 4M15 2l2-8-4 2 0-6-4 4" fill="${H}"/><path d="M-11-2l3-6 2 5 3-6 2 6 3-6 2 6 3-6 2 5 3 6" fill="${H}"/>` : `<path d="M-14.5 2q-1-11 14.5-12q15.5 1 14.5 12q-3-6-10-7q-8 4-19 1z" fill="${H}"/>`
    front = hair + `<path d="M-17-4q17-9 34 0l-1.4-6q-15.6-7.4-31.2 0z" fill="${C}" stroke="${G}" stroke-width="1.1"/><path d="M-15.6-6.4q15.6-6.6 31.2 0" fill="none" stroke="${G}" stroke-width=".7" stroke-dasharray="1.6 1.2"/><path d="M-10-9q3-15 15-18.5q-1.5 9 4.5 17.5z" fill="${C}" stroke="${G}" stroke-width="1.1"/><path d="M-5-10l5-9M1-10l4-10" stroke="${G}" stroke-width=".8"/><circle cx="-1" cy="-8.6" r="1.9" fill="${G}" stroke="#fff" stroke-width=".4"/>`
  } else if (hy == 'hijab') {
    back = `<path d="M-18 5q-2-23 18-24q20 1 18 24q-1 11-7 16h-22q-6-5-7-16z" fill="#f7ecd6" stroke="${G}" stroke-width=".9"/><path d="M-11 19q11 6 22 0" fill="none" stroke="${G}" stroke-width="1.2"/>`
    face = `<circle r="12.6" cy="1" fill="url(#${k}s)"/>`
    front = `<path d="M-13-5q13-11 26 0" fill="none" stroke="#eadabb" stroke-width="2.4"/><path d="M-6.5-16l2-5.5 2.2 3.2 2.3-4.6 2.3 4.6 2.2-3.2 2 5.5z" fill="${G}" stroke="#b07a12" stroke-width=".4"/><circle cy="-17.6" r="1.1" fill="#1f8a52"/><circle cx="-13.4" cy="7" r="1.6" fill="${G}"/><circle cx="13.4" cy="7" r="1.6" fill="${G}"/>`
  } else if (hy == 'kesuhun') {
    back = `<path d="M-15 16q-4-14 0-20h30q4 6 0 20z" fill="${H}"/><path d="M-15 4q-2-18 15-18q17 0 15 18q-3-10-15-11q-12 1-15 11z" fill="${H}"/>`
    front = `<path d="M-13.5-9q13.5-6 27 0" fill="none" stroke="${G}" stroke-width="2"/><path d="M-12.5-10l-1.4-10 4.4 5 2.8-9.5 3 8.5 3.7-11 3.7 11 3-8.5 2.8 9.5 4.4-5-1.4 10z" fill="${G}" stroke="#b07a12" stroke-width=".5"/><circle cy="-13" r="2" fill="#d6334f" stroke="#fff" stroke-width=".4"/>` + [-1, 1].map(s => `<path d="M${s * 13}-12l${s * 5}-7" stroke="${G}" stroke-width=".7"/><circle cx="${s * 18.4}" cy="-19.4" r="2.1" fill="${G}"/><circle cx="${s * 18.4}" cy="-19.4" r=".8" fill="#d6334f"/>`).join('')
  } else {
    back = `<circle cy="-15.5" r="7.2" fill="${H}"/><path d="M-15 6q-2-19 15-19q17 0 15 19q-2-8-4-10h-22q-2 2-4 10z" fill="${H}"/>`
    front = `<path d="M-13.4-2q3-11 13.4-11t13.4 11q-5-5-8.4-4q-1.6 3.4-3.6 0q-2.6 3.4-4.6 0q-3.4 0-10.2 4z" fill="${H}"/>` + [[-7, -19], [7, -19], [0, -23.5]].map(([x, y]) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<ellipse cy="-2" rx="1.5" ry="2.4" fill="#ff8fb3" transform="rotate(${a})"/>`).join('')}<circle r="1.3" fill="#ffd76a"/></g>`).join('')
  }
  const eyes = [-1, 1].map(s => `<ellipse cx="${s * 5.3}" cy="2" rx="2.6" ry="3.2" fill="#2a1210"/><ellipse cx="${s * 5.3}" cy="3.4" rx="1.7" ry="1.3" fill="#7a3a2a" opacity=".55"/><circle cx="${s * 5.3 + .9}" cy=".7" r="1.15" fill="#fff"/><circle cx="${s * 5.3 - .8}" cy="3.6" r=".5" fill="#fff"/>` + (L ? '' : `<path d="M${s * 7.4}-.6l${s * 1.8}-1.6M${s * 7.9} .8l${s * 1.9}-.6" stroke="#2a1210" stroke-width=".7" stroke-linecap="round"/>`)).join('')
  const brows = L ? `<path d="M-7.6-3.4q2.3-1.3 4.6 0M3-3.4q2.3-1.3 4.6 0" stroke="#3a1a10" stroke-width=".9" fill="none" stroke-linecap="round"/>` : ''
  const blush = `<ellipse cx="-9.2" cy="7" rx="2.8" ry="1.7" fill="#ff7f95" opacity=".55"/><ellipse cx="9.2" cy="7" rx="2.8" ry="1.7" fill="#ff7f95" opacity=".55"/>`
  const mouth = hy == 'spiky' ? `<path d="M-2.6 7.4q2.6 4 5.2 0z" fill="#b03040"/><path d="M-1.2 9.2q1.2.8 2.4 0" fill="#ff8a9a"/>` : `<path d="M-2.2 7.6q2.2 2.6 4.4 0" stroke="#b03040" fill="none" stroke-width="1.15" stroke-linecap="round"/>`
  const extra = (hy == 'glasses' ? `<circle cx="-5.3" cy="2" r="4.3" fill="#ffffff22" stroke="${G}" stroke-width="1"/><circle cx="5.3" cy="2" r="4.3" fill="#ffffff22" stroke="${G}" stroke-width="1"/><path d="M-1 2h2" stroke="${G}" stroke-width="1"/>` : '') + (hy == 'spiky' ? '<circle cx="-8" cy="5" r=".5" fill="#c07a5a"/><circle cx="-9.6" cy="6.2" r=".5" fill="#c07a5a"/><circle cx="8" cy="5" r=".5" fill="#c07a5a"/><circle cx="9.6" cy="6.2" r=".5" fill="#c07a5a"/>' : '')
  return { defs, svg: back + face + `<ellipse cx="-4" cy="-7" rx="5" ry="2.4" fill="#fff" opacity=".28"/>` + brows + eyes + blush + mouth + extra + front }
}
function portrait(c, i) {
  const k = 'pt' + i, h = chibiHead(c, k), L = c.g == 'L', G = `url(#${k}g)`, C = `url(#${k}c)`
  const body = `<path d="M13 69q0-16 21-17q21 1 21 17z" fill="${C}"/>` + (L
    ? `<path d="M23 53.5l22 15.5" stroke="${G}" stroke-width="4.4"/><path d="M23 53.5l22 15.5" stroke="#5c0b1a" stroke-width="1" stroke-dasharray="1.4 1.8"/><path d="M28.5 52.6q5.5 4 11 0" fill="none" stroke="${G}" stroke-width="1.6"/><circle cx="34" cy="59" r="1.2" fill="${G}"/><circle cx="34" cy="63.5" r="1.2" fill="${G}"/>`
    : `<path d="M22 53.6q12 13 24 0l-1.6-1.8q-10.4 9.6-20.8 0z" fill="${G}"/>${[25, 29.5, 34, 38.5, 43].map((x, j) => `<circle cx="${x}" cy="${57.4 + (j == 2 ? 2.6 : j % 4 ? 1.4 : 0)}" r="1.3" fill="#d6334f" stroke="${G}" stroke-width=".5"/>`).join('')}<path d="M15 67q5-9 6-14M53 67q-5-9-6-14" stroke="${mix(col2(c), .2)}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`)
  const sp = [[9, 14, 1.4], [58, 12, 1.1], [60, 40, .9], [7, 42, 1]].map(([x, y, s]) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0-3.4l.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9z" fill="#ffe7a0"/>`).join('')
  return `<svg viewBox="0 0 68 68"><defs>${h.defs}<radialGradient id="${k}bg" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#fff7e2"/><stop offset=".7" stop-color="${mix(c.col, .78)}"/><stop offset="1" stop-color="${mix(c.col, .55)}" stop-opacity="0"/></radialGradient></defs><circle cx="34" cy="33" r="32" fill="url(#${k}bg)"/>${sp}${body}<g transform="translate(34 33.5) scale(1.14)">${h.svg}</g></svg>`
}
const col2 = c => c.g == 'L' ? '#f2c14e' : c.nm == 'Karina' ? '#ffb0cc' : '#f2c14e'
// Chip penari di pola lantai (radius ±3,7 satuan viewBox).
function chip(c, i) {
  const k = 'cp' + i, h = chibiHead(c, k), L = c.g == 'L', G = `url(#${k}g)`
  const ring = `<radialGradient id="${k}r" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="${L ? '#7be0ae' : '#ff9cb0'}"/><stop offset=".6" stop-color="${L ? '#1f8a52' : '#d6334f'}"/><stop offset="1" stop-color="${L ? '#0b5a3c' : '#8c1226'}"/></radialGradient>`
  const fan = L ? '' : `<g transform="translate(17 9) rotate(-20)"><path d="M0 0L-7-9A11.4 11.4 0 0 1 7-9z" fill="${G}" stroke="#b07a12" stroke-width=".6"/><path d="M0 0L-3.6-10.4M0 0V-11M0 0L3.6-10.4" stroke="#b3122e" stroke-width=".7"/><circle r="1.2" fill="#b3122e"/></g>`
  return { defs: h.defs + ring, g: `<g transform="scale(.165)"><ellipse cy="24" rx="19" ry="4.6" fill="#3a061033"/><circle class="tok" r="22" fill="url(#${k}r)" stroke="${G}" stroke-width="3.4"/><circle r="22" fill="none" stroke="#fff" stroke-width=".9" opacity=".7"/><path d="M-15-12a19 19 0 0 1 22-7" stroke="#fff" stroke-width="2.4" fill="none" opacity=".45" stroke-linecap="round"/><g transform="translate(0 1.5) scale(1.02)">${h.svg}</g>${fan}<g transform="translate(0 20)"><rect x="-8.5" y="-4.2" width="17" height="8.4" rx="4.2" fill="${G}" stroke="#fff" stroke-width="1"/><text y="2.6" text-anchor="middle" font-size="6.6" font-weight="800" fill="#5c0b1a">${c.id}</text></g></g><rect x="-5.6" y="5.3" width="11.2" height="3.3" rx="1.65" fill="#fff8ea" stroke="#e3a93a" stroke-width=".3"/><text y="7.68" text-anchor="middle" font-size="2.2" fill="#7a1425" font-weight="800">${c.nm}</text>` }
}

/* ===== Panggung 2D ===== */
const CL = ['#1f8a52', '#1f8a52', '#1f8a52', '#1f8a52', '#d6334f', '#d6334f', '#d6334f'], LB = ['L1', 'L2', 'L3', 'L4', 'P1', 'P2', 'P3']
$('#sv').innerHTML = '<defs><radialGradient id="stg" cx=".5" cy=".4"><stop offset="0" stop-color="#fff6de"/><stop offset="1" stop-color="#ffe3b0"/></radialGradient><radialGradient id="tkL" cx=".35" cy=".3"><stop offset="0" stop-color="#4fc18a"/><stop offset="1" stop-color="#0f6b4c"/></radialGradient><radialGradient id="tkP" cx=".35" cy=".3"><stop offset="0" stop-color="#ff7a90"/><stop offset="1" stop-color="#a8162f"/></radialGradient><pattern id="sgk" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M3 0L6 3 3 6 0 3Z" fill="none" stroke="#e3a93a" stroke-width=".25" opacity=".45"/></pattern></defs><rect x=".5" y=".5" width="99" height="61" rx="6" fill="url(#stg)" stroke="#d99a1c"/><rect x=".5" y=".5" width="99" height="61" rx="6" fill="url(#sgk)"/><rect x="2" y="2" width="96" height="3" rx="1.5" fill="#8c1d2c" opacity=".8"/><path d="M50 6V54M4 30H96" stroke="#e6c99a" stroke-dasharray="1.5 2" stroke-width=".4"/><text x="50" y="4.4" text-anchor="middle" font-size="2.4" fill="#ffd76a" font-weight="700">BELAKANG PANGGUNG</text><text x="50" y="59.5" text-anchor="middle" font-size="3" fill="#8a6a58">▼ PENONTON ▼</text><text x="3" y="31" font-size="2.6" fill="#8a6a58">KIRI</text><text x="97" y="31" text-anchor="end" font-size="2.6" fill="#8a6a58">KANAN</text><g id="tr"></g>' + CHR.map((c, i) => { const p = chip(c, i); return `<defs>${p.defs}</defs><g class="d" id="d${i}" style="opacity:0;transition-delay:${i * 70}ms"><g id="n${i}">${p.g}</g></g>` }).join('')
function show(i) {
  if (i == last) return; const pv = last >= 0 ? PL[last] : null; last = i; const p = i < 0 ? F({}) : PL[i].f; let tl = ''
  p.forEach((q, k) => { const d = $('#d' + k); if (!q) { d.style.opacity = 0; d.style.transform = k < 4 ? `translate(${k < 2 ? -10 : 110}px,30px)` : 'translate(50px,-10px)' } else { d.style.opacity = q[2] ?? 1; d.style.transform = `translate(${q[0]}px,${q[1]}px)`; const o = pv && pv.f[k]; if (o) tl += `<path d="M${o[0]} ${o[1]}L${q[0]} ${q[1]}" class="tl"/>` } })
  $('#tr').innerHTML = tl; $('#fc').textContent = i < 0 ? 'PANGGUNG KOSONG' : 'FORMASI ' + (i + 1) + ' DARI 11 · ' + SEC[PL[i].s].n.toUpperCase(); $('#fn').textContent = i < 0 ? 'Menunggu fajar di Tepian Musi' : PL[i].n; $('#fd').textContent = i < 0 ? 'Penari belum masuk.' : PL[i].m + ' (mulai ' + fm1(PL[i].t) + ')'
}
function flash() { for (let k = 0; k < 7; k++) { const d = $('#d' + k); d.classList.add('fl'); setTimeout(() => d.classList.remove('fl'), 2000) } }

/* ===== Sungai Waktu ===== */
$('#rv').innerHTML = SEC.map((s, i) => { const x = 10 + s.a / 300 * 280 + 8; return `<g class="rt" data-i="${i}"><circle cx="${x}" cy="27" r="9.5" stroke-width="1.2"/><path d="M${x - 6} 27q6-9 12 0q-6 9-12 0z" fill="#ffd76a" opacity=".35" pointer-events="none"/><text x="${x}" y="30.5" text-anchor="middle" font-size="9" pointer-events="none">${i + 1}</text></g>` }).join('')
$('#rv').onclick = e => { const g = e.target.closest('g.rt'); if (g) { const s = SEC[+g.dataset.i]; seek(s.a); bell(660); vb(10); toast('Bagian ' + (+g.dataset.i + 1) + ' · ' + s.n) } }

/* ===== Pemutar ===== */
$('#barSec').innerHTML = SEC.map(s => `<span style="width:${s.d / 3}%"></span>`).join('')
$('#pl').onclick = () => { M.toggle(); vb(10) }
$('#heroPlay').onclick = () => { M.toggle(); vb(10) }
$('#stp').onclick = () => { M.stop(); tak() }
const goPola = i => { seek(PL[i].t + .01); tab(0); setTimeout(() => $('#sv').scrollIntoView({ behavior: 'smooth', block: 'center' }), 60); flash() }
$('#pv').onclick = () => goPola(Math.max(0, pAt(cur()) - 1)); $('#nx').onclick = () => goPola(Math.min(10, pAt(cur()) + 1))
const barSeek = e => { const r = $('#bar').getBoundingClientRect(); seek(Math.max(0, Math.min(299, (e.clientX - r.left) / r.width * 300))) }
$('#bar').onpointerdown = e => { $('#bar').setPointerCapture(e.pointerId); barSeek(e) }; $('#bar').onpointerup = e => { barSeek(e); tak() }
$('#vol').oninput = e => M.setVol(+e.target.value)

/* Visualisator spektrum */
const VZ = $('#viz'), vx = VZ.getContext('2d'), SP = new Float32Array(28)
function viz(t) {
  const dpr = Math.min(2, devicePixelRatio || 1), w = VZ.clientWidth, h = VZ.clientHeight; if (!w) return; if (VZ.width != w * dpr) { VZ.width = w * dpr; VZ.height = h * dpr }
  vx.setTransform(dpr, 0, 0, dpr, 0, 0); vx.clearRect(0, 0, w, h); const on = M.spectrum(SP) > 0, n = SP.length, bw = w / n, gr = vx.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, '#b3122e'); gr.addColorStop(1, '#f2c14e'); vx.fillStyle = gr
  for (let i = 0; i < n; i++) { const v = on ? SP[i] : .08 + .06 * Math.sin(t / 600 + i * .6), bh = Math.max(3, v * h * .95); vx.globalAlpha = on ? .95 : .35; const x = i * bw + bw * .18; vx.beginPath(); vx.roundRect ? vx.roundRect(x, h - bh, bw * .64, bh, 3) : vx.rect(x, h - bh, bw * .64, bh); vx.fill() }
}

function loop(now) {
  let t = cur(); if (lp && M.S.st != 'idle' && t >= lp[1]) { seek(lp[0]); t = lp[0] } if (M.S.st != 'idle' && t >= 300) { M.stop(); t = 0 } t = Math.max(0, Math.min(t, 300))
  const fr = frame(t), si = fr.si, S = fr.S, bi = fr.bi, bar = fr.bar, mv = JD[si][Math.min((bar - 1) / 2 | 0, JD[si].length - 1)], hit = (bi | 0) % 4 + 1 + (bar % 2 ? 0 : 4), on = playing()
  txt($('#tm'), fmt(t) + ' / 5:00'); $('#bar i').style.width = t / 3 + '%'; $('#barK').style.left = t / 3 + '%'; $('#ringP').style.strokeDashoffset = 289 * (1 - t / 300)
  txt($('#gl'), on ? '❚❚' : '▶'); $('#pl').classList.toggle('playing', on); txt($('#heroPlay span'), on ? '❚❚' : '▶')
  txt($('#nowT'), (si + 1) + '. ' + S.n); txt($('#ib'), (si + 1) + ' · ' + S.n); txt($('#ir'), (BS[si] + bar) + ' / 103'); txt($('#ig'), mv); txt($('#gk'), mv)
  $$('#pp i').forEach((e, k) => e.classList.toggle('on', M.S.st != 'idle' && k == hit - 1))
  show(pAt(t)); lv(t); $('#bm').setAttribute('transform', 'translate(' + (10 + t / 300 * 280) + ' 2)'); $$('g.rt').forEach((e, k) => e.classList.toggle('on', k == si))
  if (M.S.st != 'idle') { const sc = 1 + .08 * Math.max(0, 1 - (bi % 1) * 3); for (let k = 0; k < 7; k++) $('#n' + k).style.transform = 'scale(' + sc + ')' }
  if (ti == 0) viz(now || 0)
  requestAnimationFrame(loop)
}

/* ===== Tab bar kaca ===== */
const TS = $$('.tab'), LS = $('#ls'), TB = $('#tb'); let ti = 0, dg = 0
function tab(i) { if (i != ti) whoosh(); ti = i; TS.forEach((b, k) => b.classList.toggle('on', k == i)); $$('.pg').forEach((p, k) => p.classList.toggle('on', k == i)); LS.style.left = 'calc(' + i * 20 + '% + 4px)'; scrollTo({ top: 0 }) }
const idx = e => { const r = TB.getBoundingClientRect(); return Math.max(0, Math.min(4, Math.floor((e.clientX - r.left) / r.width * 5))) }
TB.onpointerdown = e => { dg = 1; TB.setPointerCapture(e.pointerId); LS.classList.add('dg') }
TB.onpointermove = e => { if (!dg) return; const r = TB.getBoundingClientRect(), L = () => LS.style.left = Math.max(4, Math.min(r.width * .8 - 4, e.clientX - r.left - r.width / 10)) + 'px'; L(); const i = idx(e); if (i != ti) { tab(i); L(); tak(); vb(8) } }
TB.onpointerup = e => { dg = 0; LS.classList.remove('dg'); const i = idx(e); if (i != ti) { tak(); vb(8) } tab(i) }
TS.forEach((b, k) => b.onkeydown = e => { if (e.key == 'Enter' || e.key == ' ') tab(k) })

/* ===== Roda ===== */
function wheel(el, items, cb) {
  el.innerHTML = '<div class="wc">Ketuk kelopak</div>' + items.map((x, i) => { const a = i / items.length * 2 * Math.PI - Math.PI / 2; return `<button class="pt" data-i="${i}" style="left:calc(50% + ${Math.cos(a) * 38}% - 23px);top:calc(50% + ${Math.sin(a) * 38}% - 23px)" aria-label="${x}">${i + 1}</button>` }).join('')
  el.onclick = e => { const b = e.target.closest('.pt'); if (!b) return; el.querySelectorAll('.pt').forEach(x => x.classList.toggle('on', x == b)); el.firstChild.textContent = items[+b.dataset.i]; tapN(); vb(8); cb(+b.dataset.i) }
}
wheel($('#wg'), G.map(g => g[0]), i => { const g = G[i]; $('#gd').innerHTML = '<b>' + g[0] + '</b> · ' + g[1] + ' · 4 hitungan<ol>' + g[2].map((s, k) => `<li data-n="${k + 1}">${s}</li>`).join('') + '</ol><i>Makna: ' + g[3] + '</i>' })
wheel($('#wp'), PL.map(p => p.n), i => goPola(i))
$('#sb').innerHTML = SEC.map((s, i) => `<button class="mel" data-i="${i}" aria-label="Bagian ${i + 1}">${i + 1}</button>`).join('')
$('#sb').onclick = e => { const b = e.target.closest('.mel'); if (!b) return; const i = +b.dataset.i, S = SEC[i]; bell(520 + i * 60); $('#sl').innerHTML = '<b>' + (i + 1) + '. ' + S.n + '</b> <small>(tema gerak: ' + S.th + ')</small><br>' + fmt(S.a) + '–' + fmt(S.a + S.d) + ' · ' + S.bpm + ' BPM · ' + NR[i] + ' bar · dinamika ' + ['sangat lembut', 'lembut', 'tegas', 'mengalir', 'meriah', 'lembut menutup'][i] + '<br>' + JD[i].map((m, k) => { const a = k * 2 + 1, z = Math.min(NR[i], a + 1); return 'Bar ' + (a == z ? a : a + '–' + z) + ': ' + m }).join('<br>') }

/* ===== Pemeran ===== */
$('#cast').innerHTML = CHR.map((c, i) => `<div class="cm" data-i="${i}" style="--c:${c.col}" role="button" tabindex="0"><span class="id">${c.id}</span>${portrait(c, i)}<b>${c.nm}</b><small>${c.tag}</small></div>`).join('')
$('#cast').insertAdjacentHTML('afterend', '<div class="sc" id="castD">Ketuk salah satu penari untuk berkenalan.</div>')
$('#cast').onclick = e => { const b = e.target.closest('.cm'); if (!b) return; const i = +b.dataset.i, c = CHR[i]; $$('.cm').forEach(x => x.classList.toggle('on', x == b)); $('#castD').innerHTML = `<b>${c.nm}</b> (${c.id}, ${c.g == 'L' ? 'laki-laki' : 'perempuan'}) · ${c.tag}<br>${c.ciri}`; bell(scale(i + 2), .22); vb(8); if (W3) W3.focus(i) }

/* ===== Busana ===== */
let bg = 'P'; const rb = () => { $('#bu').innerHTML = BU[bg].map((x, i) => `<button class="lf" data-i="${i}">${x[0]}</button>`).join('') }; rb()
$('#bug').onclick = e => { const b = e.target.closest('button'); if (!b) return; bg = b.dataset.g; e.currentTarget.querySelectorAll('button').forEach(x => x.classList.toggle('on', x == b)); rb(); swish(); $('#bd2').textContent = 'Ketuk salah satu.' }
$('#bu').onclick = e => { const b = e.target.closest('button'); if (!b) return; const x = BU[bg][+b.dataset.i]; $('#bu').querySelectorAll('button').forEach(y => y.classList.toggle('on', y == b)); $('#bd2').innerHTML = '<b>' + x[0] + '</b><br>' + x[1]; bell(1200, .15); tak() }

/* ===== Dunia Palembang ===== */
const dn = new Set(), INF = { am: 'Jembatan Ampera, kebanggaan kota Palembang di atas Sungai Musi. Pola 10 meniru tiang dan bentangnya.', go: 'Gong menandai awal bagian dan menjaga penari tetap kompak.', bo: 'Perahu bidar didayung serempak di Sungai Musi: lambang kerja sama (Pola 9).', kn: 'Songket: kain tenun benang emas khas Palembang, dipakai sebagai selendang dan selempang.', tg: 'Tanggai: kuku emas lentik yang mempercantik gerak tangan penari.', kp: 'Kipas: simbol kelembutan penari perempuan.' }
function info(k) { $('#hi').textContent = INF[k]; mood('h'); setTimeout(() => mood('n'), 1500); dn.add(k); $('#cn').textContent = dn.size + '/6'; if (dn.size == 6) { setTimeout(() => { $('#hi').textContent = 'Semua terbuka! Pesan: kebudayaan adalah warisan berharga yang harus dijaga dan dilestarikan generasi muda.'; gg(); mood('s'); sparkle() }, 900) } }
const PA = $('#pa'), pt = (e, s) => { const r = s.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height] }
$('#go').onclick = () => { gg(); vb(30); const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('cx', 30); c.setAttribute('cy', 34); c.setAttribute('class', 'rp2'); $('#rg').appendChild(c); setTimeout(() => c.remove(), 1000); info('go') }
$('#am').onclick = () => { $$('.lt').forEach((l, i) => { l.classList.remove('lit'); setTimeout(() => { l.classList.add('lit'); bell(scale(i), .2) }, i * 160) }); info('am') }
let bx0 = null; const bo = $('#bo'), bxv = () => parseFloat((bo.style.transform.match(/[-\d.]+/) || [0])[0]) || 0
bo.onpointerdown = e => { bo.setPointerCapture(e.pointerId); bx0 = pt(e, PA)[0] * 300 - bxv() }
bo.onpointermove = e => { if (bx0 === null) return; const x = Math.max(0, Math.min(240, pt(e, PA)[0] * 300 - bx0)); if (Math.abs(x - bxv()) > 14) { nb(.3, 500, 900, .2); ov(140, .12, 'sine', .3, 0, 80) } bo.style.transform = 'translateX(' + x + 'px)' }; bo.onpointerup = () => { bx0 = null; info('bo') }
let d0 = ''; const kn = $('#kn'); kn.onpointerdown = e => { kn.setPointerCapture(e.pointerId); d0 = ''; $('#th').setAttribute('d', '') }
kn.onpointermove = e => { if (e.buttons == 0 && e.pressure == 0) return; const [x, y] = pt(e, PA); d0 += (d0 ? 'L' : 'M') + (x * 300).toFixed(1) + ' ' + (y * 170).toFixed(1); $('#th').setAttribute('d', d0); if (d0.length % 9 == 0) ov(900 + Math.random() * 600, .05, 'triangle', .12) }; kn.onpointerup = () => { if (d0) info('kn') }
const TG = $('#tg'); TG.innerHTML = Array.from({ length: 8 }, (_, i) => `<path d="M${12 + i * 19} 55q-6-25 0-48q6 23 0 48z" fill="#e3a93a" stroke="#ffd76a"/>`).join(''); let ln = -1
const tgn = e => { const i = Math.max(0, Math.min(7, Math.floor(pt(e, TG)[0] * 8))); if (i != ln) { ln = i; bell(scale(i + 5), .2); TG.children[i].setAttribute('fill', '#fff3b0'); setTimeout(() => TG.children[i].setAttribute('fill', '#e3a93a'), 200) } }
TG.onpointerdown = e => { TG.setPointerCapture(e.pointerId); ln = -1; tgn(e) }; TG.onpointermove = e => { if (e.buttons) tgn(e) }; TG.onpointerup = () => { ln = -1; info('tg') }
const KP = $('#kp'); KP.innerHTML = Array.from({ length: 7 }, (_, i) => `<path d="M80 75L68 12A64 64 0 0 1 92 12Z" transform="rotate(${(i - 3) * 18} 80 75)" fill="${i % 2 ? '#d6334f' : '#8c1d2c'}" stroke="#ffd76a" opacity=".15"/>`).join(''); let ko = 0
const kpf = e => { const n = Math.round(Math.max(0, Math.min(1, pt(e, KP)[0])) * 7); if (n > ko) swish(); ko = n; [...KP.children].forEach((p, i) => p.setAttribute('opacity', i < n ? 1 : .15)) }
KP.onpointerdown = e => { KP.setPointerCapture(e.pointerId); kpf(e) }; KP.onpointermove = e => { if (e.buttons) kpf(e) }; KP.onpointerup = () => { if (ko >= 6) info('kp') }

/* ===== Latihan ===== */
let mi = null; $('#mn').onclick = e => { if (mi) { clearInterval(mi); mi = null; e.target.textContent = 'Metronom: mati'; e.target.classList.remove('on'); return } const bt = 60000 / SEC[secAt(cur())].bpm / M.rate; let k = 0; mi = setInterval(() => ov(k++ % 4 ? 900 : 1400, .05, 'square', .08), bt); e.target.textContent = 'Metronom: nyala'; e.target.classList.add('on') }
let qOk = 0, qN = 0
function quiz() { const c = Math.random() * 11 | 0, o = [c]; while (o.length < 3) { const r = Math.random() * 11 | 0; if (!o.includes(r)) o.push(r) } o.sort(() => Math.random() - .5); $('#qt').textContent = 'Makna: ' + PL[c].m; $('#qo').innerHTML = o.map(i => `<button class="lf" data-i="${i}">${PL[i].n}</button>`).join(''); let tried = 0; $('#qo').onclick = e => { const b = e.target.closest('button'); if (!b) return; if (+b.dataset.i == c) { if (!tried) qOk++; qN++; $('#qs').textContent = '⭐ ' + qOk + '/' + qN; bell(880); sparkle(); mood('h'); $('#qt').textContent = 'Benar! ' + PL[c].n + ', mulai ' + fm1(PL[c].t) + '.'; setTimeout(quiz, 1800) } else { tried = 1; tak(); mood('t'); b.classList.add('on') } } }
$('#qz').onclick = quiz
$('#tp0').innerHTML = TIPS.map((t, i) => `<button class="mel" data-i="${i}" aria-label="Tip ${i + 1}">${i + 1}</button>`).join(''); $('#tp0').onclick = e => { const b = e.target.closest('.mel'); if (b) { $('#tp').textContent = TIPS[+b.dataset.i]; bell(1000, .2); swish() } }

/* ===== Belajar menari ===== */
const gm = n => G.filter(g => n.includes(g[0]))
const playAt = t => { M.S.off = t; M.go(t) }; let lvs = ''
function lv(t) {
  const i = mvAt(t), m = MV[i], S = SEC[m.si], bt = bd(S) / 4, c = Math.floor((t - m.t0) / bt) % 8 + 1, sp = (c + 1) >> 1, gs = gm(m.n), p = pAt(t), nx = MV[i + 1],
    stp = gs.length ? gs.map(g => (gs.length > 1 ? g[1][0] + ': ' : '') + g[2][sp - 1]).join(' | ') : 'Penari berdiri diam, menunggu giliran.',
    pr = gs.map(g => PRP[g[0]]).filter(Boolean)[0] || 'Tidak ada properti genggam (tanjak dan selempang dipakai sepanjang tari).',
    h = `<small>BAGIAN ${m.si + 1} · ${S.n.toUpperCase()}</small><br><b>${m.n}</b> (${fm1(m.t0)}–${fm1(m.t1)})<br>Hitungan <b>${sp}</b>/4 (ketuk ${c}/8): ${stp}<br>Formasi: ${p < 0 ? 'belum masuk' : (p + 1) + '. ' + PL[p].n}<br>Berikutnya: ${nx ? nx.n + ' (' + fm1(nx.t0) + ')' : 'selesai'}<br><small>Properti: ${pr}</small>`
  if (h !== lvs) { lvs = h; $('#lv').innerHTML = h }
}
$('#pl2').onclick = () => $('#pl').click()
$('#sl2').innerHTML = SEC.map((s, i) => `<button class="mel" data-i="${i}" aria-label="Ulang bagian ${i + 1}">${i + 1}</button>`).join('') + '<button class="lf" id="lpx">Hentikan ulang</button>'
$('#sl2').onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.id == 'lpx') { lp = null; return bell(500, .2) } const S = SEC[+b.dataset.i]; lp = [S.a, S.a + S.d]; playAt(S.a); bell(700, .2); toast('Mengulang bagian ' + (+b.dataset.i + 1)) }
$('#tpo').onclick = e => { const b = e.target.closest('button'); if (!b) return; M.setRate(+b.dataset.r); $('#tpo').querySelectorAll('button').forEach(x => x.classList.toggle('on', x == b)); tak() }
const mvl = $('#mvl'); mvl.innerHTML = G.map((g, i) => `<button class="lf" data-i="${i}">${i + 1}. ${g[0]}</button>`).join('')
mvl.onclick = e => {
  const b = e.target.closest('button'); if (!b) return; mvl.querySelectorAll('button').forEach(x => x.classList.toggle('on', x == b)); const g = G[+b.dataset.i], oc = MV.filter(m => m.n.includes(g[0])), f = oc[0], ix2 = MV.indexOf(f), nx = MV[ix2 + 1], pf = PL[pAt(f.t0 + .01)]
  $('#mvd').innerHTML = `<b>${g[0]}</b> · ${g[1]}<br><i>Makna: ${g[3]}</i><ol>${g[2].map((x, k) => `<li data-n="${k + 1}">Hitungan ${k + 1} (ketuk ${2 * k + 1}–${2 * k + 2}): ${x}</li>`).join('')}</ol>Satu ragam = 4 hitungan × 2 ketuk = 8 ketuk (2 bar). Kiri/kanan dari sudut pandang penari; arah hadap awal ke penonton.<br><b>Properti:</b> ${PRP[g[0]] || 'tidak ada properti genggam.'}<br><b>Pola lantai pertama:</b> ${pf ? pf.n : '—'}<br><b>Setelah ini:</b> ${nx ? nx.n : 'selesai'}<br><b>Muncul di musik:</b><div class="row" style="margin-top:6px">${oc.slice(0, 5).map(m => `<button class="lf" data-t="${m.t0}">▶ ${fm1(m.t0)}</button><button class="lf" data-t="${m.t0}" data-l="${m.t1}">↻ ${fm1(m.t0)}–${fm1(m.t1)}</button>`).join('')}</div>`; tapN(); vb(8)
}
$('#mvd').onclick = e => { const b = e.target.closest('button'); if (!b || !b.dataset.t) return; const t = +b.dataset.t; lp = b.dataset.l ? [t, +b.dataset.l] : null; playAt(t); bell(700, .2); vb(8) }

/* ===== Fitur 3D (hanya lewat Seruni) ===== */
const U = { stage: 0, museum: 0, game: 0 }; let W3 = null, w3p = null
const API = { music: M, frame, cur, fmt, PL, SEC, CHR, PN, EX, ART, sfx: { bell, tak, swish, pop, sparkle, gg, ov, nb, scale }, toast, U, onWorld: w => { $$('#wsel button').forEach(b => b.classList.toggle('on', b.dataset.w == w)) } }
function reveal3() { $('#lock3').hidden = true; $('#v3wrap').hidden = false; $('#sv').classList.add('c3') }
function ensure3D() {
  reveal3(); if (W3) return Promise.resolve(W3)
  if (!w3p) w3p = import('./three/world.js').then(m => m.createWorld($('#v3wrap'), API)).then(w => (W3 = w)).catch(err => { console.error(err); w3p = null; fail3(err); throw err })
  return w3p
}
// Pesan ramah bila 3D gagal dimuat, lengkap dengan tombol coba lagi.
function fail3(err) {
  const L = $('#v3load'), nogl = err && err.code == 'nowebgl'; L.classList.remove('done'); L.classList.add('err')
  L.innerHTML = `<div class="v3err-ic">${nogl ? '🎭' : '✨'}</div><b>${nogl ? 'Grafis 3D sedang dimatikan di perangkat ini' : 'Panggung 3D belum termuat'}</b><span>${nogl ? 'Aktifkan WebGL / akselerasi hardware di pengaturan browser (iPhone: matikan Mode Penguncian untuk situs ini), lalu coba lagi.' : 'Periksa koneksi internet, lalu ketuk coba lagi.'}</span><button class="btn soft" id="v3retry">Coba lagi ✦</button>`
  $('#v3retry').onclick = () => { $('#c3').innerHTML = ''; L.classList.remove('err'); L.innerHTML = '<div class="spin"></div><span>Menyiapkan panggung…</span>'; ensure3D().then(w => w.setWorld(U.museum && W3?.world == 'museum' ? 'museum' : 'stage')).catch(() => { }) }
}
const scroll3 = () => { tab(0); setTimeout(() => $('#v3wrap').scrollIntoView({ behavior: 'smooth', block: 'center' }), 250) }
function stage3(o) { if (o) { U.stage = 1; ensure3D().then(w => w.setWorld('stage')); scroll3(); unlock() } else { U.stage = 0; U.game = 0; if (W3) { W3.setGame(0); W3.theater(0); W3.pause(1) } $('#v3wrap').hidden = true; $('#lock3').hidden = false; $('#sv').classList.remove('c3'); bell(494, .2) } }
function museum3(o) {
  if (o) { U.museum = 1; $('#wsel [data-w="museum"]').hidden = false; $('#lockM').innerHTML = '<div class="lock-art museum" aria-hidden="true"><span>🏛️</span></div><div><b>Museum sudah dibuka</b><p>Seruni telah membuka Museum Seni &amp; Budaya Palembang. Masuk kapan saja dari penampil 3D.</p><button class="btn soft" id="goM">Masuk Museum</button></div>'; $('#goM').onclick = () => museum3(1); ensure3D().then(w => w.setWorld('museum')); scroll3(); unlock() }
  else if (W3) W3.setWorld('stage')
}
function game3(o) { U.game = o ? 1 : 0; if (o) { U.stage = 1; ensure3D().then(w => w.setGame(1)); scroll3(); unlock() } else if (W3) W3.setGame(0) }
$('#wsel').onclick = e => { const b = e.target.closest('button'); if (!b || !W3) return; if (b.dataset.w == 'museum' && !U.museum) return; W3.setWorld(b.dataset.w); tak() }
function mode3(o) { document.body.classList.toggle('m3d', o); bell(o ? 880 : 440, .2); vb(15) }

/* ===== Pemandu Seruni ===== */
const CH = $('#ch'), MS = $('#ms')
function say(t, u, cls) { const d = document.createElement('div'); d.className = (u ? 'ub' : 'mb') + (cls ? ' ' + cls : ''); d.textContent = t; MS.appendChild(d); MS.scrollTop = 1e9 }
const pl1 = i => 'Pola ' + (i + 1) + ' ' + PL[i].n + ': ' + PL[i].m + ' (Bagian ' + (PL[i].s + 1) + ', mulai ' + fm1(PL[i].t) + ').'
const need3 = { t: 'Panggung 3D belum terbuka. Bilang dulu “Aktifkan panggung 3D” ya.', m: 't' }
function ans(q) {
  q = ' ' + q.toLowerCase().replace(/[^a-z0-9: ]/g, ' ').replace(/\s+/g, ' ') + ' '; const h = (...w) => w.some(x => q.includes(x)), t = cur(), si = secAt(t), pi = pAt(t), off = h('matikan', 'nonaktif', 'tutup', 'keluar', 'hentikan'); let m
  if (h(' chip game ', ' chipgame ')) return off ? { t: 'Chip Game dimatikan. Radit kembali menari bersama teman-temannya.', a: () => game3(0) } : { t: 'Kode “Chip Game” diterima! 🎮 Kontrol Radit aktif: pakai joystick, tombol panah, atau W/A/S/D. Tombol Lompat, Salam, dan Menari ada di layar. Ketuk ⛶ untuk main layar penuh landscape.', u: 1, a: () => game3(1) }
  if (h(' 3d mode ', ' mode 3d ')) return { t: !off ? '3D Mode aktif: tampilan aplikasi berubah ke gaya timbul Palembang.' : '3D Mode dimatikan.', a: () => mode3(!off) }
  if (h(' chip 3d ', 'panggung 3d', '3d panggung', 'aktifkan 3d', 'buka 3d', 'tampilkan 3d', 'panggung megah', 'karakter 3d', 'penari 3d')) return off ? { t: 'Panggung 3D ditutup, kembali ke pola lantai 2D.', a: () => stage3(0) } : { t: 'Tirai dibuka! ✨ Panggung 3D tepian Musi aktif dengan tujuh penari: ' + NM.join(', ') + '. Putar musik dan mereka menari mengikuti irama serta pola lantai. Ketuk ⛶ untuk menonton layar penuh.', u: 1, a: () => stage3(1) }
  if (h(' kontrol radit ', 'kendalikan radit', 'gerakkan radit', 'main radit', 'mainkan radit')) return off ? { t: 'Kontrol Radit dimatikan.', a: () => game3(0) } : U.game ? { t: 'Radit sudah bisa kamu kendalikan. Pakai joystick atau W/A/S/D!', m: 'h', a: scroll3 } : { t: 'Kontrol Radit masih terkunci 🔒. Sebutkan kode rahasianya: “Chip Game”.', m: 't' }
  if (h('museum', 'teleport')) return off ? { t: 'Keluar dari museum, kembali ke panggung.', a: () => museum3(0) } : { t: U.game ? 'Teleport! Radit tiba di Museum Seni & Budaya Palembang. Dekati koleksi untuk membaca informasinya.' : 'Pintu museum dibuka! 🏛️ Selamat datang di Museum Seni & Budaya Palembang. Ketuk koleksi atau lukisan untuk membaca kisahnya.', u: 1, a: () => museum3(1) }
  if (h('layar penuh', 'fullscreen', 'full screen', 'landscape', 'bioskop', 'nonton', 'mode video', 'menonton')) return !(U.stage || U.museum) ? need3 : off ? { t: 'Keluar dari layar penuh.', a: () => W3 && W3.theater(0) } : { t: 'Mode bioskop landscape! 🎬 Putar musiknya dan nikmati pertunjukan. Ketuk layar untuk memunculkan kontrol.', a: () => ensure3D().then(w => { w.theater(1); if (!playing() && w.world == 'stage') M.toggle() }) }
  if (h('ke panggung', 'kembali panggung')) return !U.stage && !U.museum ? need3 : { t: 'Kembali ke panggung.', a: () => { U.stage = 1; ensure3D().then(w => w.setWorld('stage')); scroll3() } }
  if (h('kamera')) { if (!W3) return need3; const v = h('atas') ? 'a' : h('depan') ? 'd' : h('belakang') ? 'b' : h('kiri') ? 'l' : h('kanan') ? 'r' : 'cine'; return { t: 'Kamera ' + { a: 'atas', d: 'depan', b: 'belakang', l: 'kiri', r: 'kanan', cine: 'sinematik' }[v] + ' siap.', a: () => W3.setCam(v) } }
  for (let i = 0; i < 7; i++) if (q.includes(' ' + NM[i].toLowerCase() + ' ')) { const c = CHR[i]; return { t: c.nm + ' (' + c.id + ', ' + (c.g == 'L' ? 'laki-laki' : 'perempuan') + ', ' + c.tag.toLowerCase() + '): ' + c.ciri, m: 'h', a: () => { if (W3) W3.focus(i) } } }
  if (h('karakter', 'tokoh', 'kenalan', 'pemeran')) return { t: 'Tujuh penari: ' + CHR.map(c => c.nm + ' (' + c.id + ')').join(', ') + '. Ketuk kartunya di tab Tari untuk berkenalan.', a: () => { tab(1); setTimeout(() => $('#cast').scrollIntoView({ behavior: 'smooth', block: 'center' }), 200) } }
  if (m = q.match(/(\d+):(\d\d)/)) return { t: 'Lompat ke ' + m[0] + '.', a: () => seek(Math.min(299, +m[1] * 60 + +m[2])) }
  if (m = q.match(/menit\s*(\d+)/)) return { t: 'Lompat ke menit ' + m[1] + '.', a: () => seek(Math.min(299, m[1] * 60)) }
  if (m = q.match(/detik\s*(\d+)/)) return { t: 'Lompat ke detik ' + m[1] + '.', a: () => seek(Math.min(299, +m[1])) }
  if (m = q.match(/bagian\s*(\d)/)) { const n = +m[1]; if (n >= 1 && n <= 6) return { t: 'Bagian ' + n + ': ' + SEC[n - 1].n + ' (' + fmt(SEC[n - 1].a) + ').', a: () => seek(SEC[n - 1].a) } }
  if (m = q.match(/pola\s*(\d+)/)) { const n = +m[1]; if (n >= 1 && n <= 11) return { t: pl1(n - 1), a: () => goPola(n - 1) } }
  if (h(' lingkaran ', ' bundar ') && h(' v ', ' panah ') || h(' lingkaran ') && h(' atau ')) return { t: 'Ada dua lingkaran. ' + pl1(2) + ' ' + pl1(6) + ' Formasi V: ' + pl1(7), a: () => goPola(2) }
  const FN = [[' diagonal ', 0], [' segitiga ', 1], [' lingkaran ', [2, 6]], [' barisan ', 3], [' kotak ', 4], [' pasang', 5], [' v ', 7], [' panah ', 7], [' perahu ', 8], [' bidar ', 8], [' ampera ', 9], [' jembatan ', 9], [' hormat ', 10]]
  if (h(' sekarang ', ' saat ini ') && h('formasi', 'pola', 'posisi')) return pi < 0 ? { t: 'Belum ada penari di panggung. Pola 1 mulai di 0:15.', m: 't' } : { t: pl1(pi), a: flash }
  if (h(' sekarang ', ' saat ini ') && h('gerak')) return { t: 'Gerak sekarang: ' + $('#ig').textContent + ' (' + (si + 1) + '. ' + SEC[si].n + ').' }
  if (h(' sekarang ') && h('bagian')) return { t: 'Bagian ' + (si + 1) + ': ' + SEC[si].n + ', ' + SEC[si].bpm + ' BPM.' }
  for (const [k, v] of FN) if (q.includes(k)) { const a = [].concat(v); return { t: a.map(pl1).join(' '), a: () => goPola(a[0]) } }
  for (const g of G) { const w = g[0].toLowerCase().split(' ')[g[0] == 'Tangan Mekar' || g[0] == 'Kipas Mekar' ? 0 : g[0].startsWith('Sikap') ? 1 : 0]; if (q.includes(' ' + w) && (w != 'tanjak' || h('gerak', 'sikap')) && !h('busana')) return { t: g[0] + ' (' + g[1] + ', 4 hitungan): ' + g[2].map((s, k) => (k + 1) + ') ' + s).join('; ') + '. Makna: ' + g[3] + '.' } }
  if (h('putar', 'mulai', 'play') && !h('formasi', 'pola')) return { t: 'Siap, kuputar!', a: () => { if (!playing()) M.toggle() } }
  if (h('jeda', 'pause')) return { t: 'Dijeda.', a: () => M.pause() }; if (h('lanjut')) return { t: 'Lanjut!', a: () => M.resume() }; if (h(' stop ', 'berhenti')) return { t: 'Dihentikan.', a: () => M.stop() }
  if (h('tarian apa', 'nama tari', 'tentang tari', 'ini apa')) return { t: 'Ini Tari Sambut Seruni Musi: tari penyambutan tamu kreasi Palembang yang ramah dan penuh hormat. 7 penari (4 laki-laki, 3 perempuan), 5 menit, 12 gerak dasar.' }
  if (h('arti', 'seruni', 'makna nama')) return { t: 'Sambut = menyambut tamu; Seruni = bunga seruni, lambang keindahan dan keramahan; Musi = Sungai Musi, urat nadi kehidupan Palembang (tafsir kelompok).' }
  if (h('sinopsis', 'cerita', 'alur')) return { t: 'Perempuan menari dulu (kelembutan, keramahan), lalu laki-laki (keberanian, tanggung jawab), lalu bersama (persatuan, kerja sama, keharmonisan). Pesan: budaya warisan berharga yang harus dijaga generasi muda.' }
  if (h('utama', 'penari', 'siapa')) return { t: '7 penari: L1-L4 (laki-laki: ' + NM.slice(0, 4).join(', ') + ') dan P1-P3 (perempuan: ' + NM.slice(4).join(', ') + '). Penari utama: L1 dan P2.' }
  if (h('busana', 'baju', 'pakaian', 'properti', 'kipas', 'selendang', 'tanjak', 'tanggai')) return { t: 'Perempuan: ' + BU.P.map(x => x[0]).join(', ') + '. Laki-laki: ' + BU.L.map(x => x[0]).join(', ') + '. Lihat tab Budaya.', a: () => tab(2) }
  if (h('musik', 'instrumen', 'alat musik', 'tempo', 'bpm', 'durasi')) return { t: 'Musik orisinal 5:00, 103 bar, 64-100 BPM (4/4) bernuansa Melayu Palembang: gong, kenong, saron, gambus, akordeon, suling, biola, gendang melayu, rebana, dan kerincing. Dimulai lembut saat fajar di Musi, memuncak meriah di Pesta Rakyat, lalu ditutup dengan hormat.' }
  if (h('tips', 'latihan')) return { t: 'Mulai dari hitungan, latih per gerak, lalu per bagian. Lihat menu Gerak & Pola Lantai.', a: () => tab(3) }
  if (h('budaya', 'songket', 'musi', 'limas')) return { t: 'Jelajahi Dunia Palembang di tab Budaya: gong, Ampera, perahu bidar, songket, tanggai, kipas. Mau lebih lengkap? Bilang “Buka museum”.', a: () => tab(2) }
  if (h('perintah', 'bisa apa', 'fitur', 'bantuan', 'help')) return { t: 'Coba: “Aktifkan panggung 3D”, “Buka museum”, “Layar penuh”, kode rahasia “Chip Game”, “Kamera atas”, “Aktifkan 3D Mode”, “pola 7”, “menit 2”.' }
  if (h('halo', 'hai', 'hi ', 'pagi', 'siang', 'malam')) return { t: 'Halo! Aku Si Seruni. Tanya formasi, gerak, atau bilang “Aktifkan panggung 3D”, “Buka museum”, “pola 7”, “menit 2”.', m: 'h' }
  if (h('terima kasih', 'makasih')) return { t: 'Sama-sama!', m: 'h' }
  if (h('uji', 'kuis')) return { t: 'Ayo uji formasi!', a: () => { tab(3); quiz() } }
  return { t: 'Aku belum paham. Coba: “formasi sekarang apa?”, “Aktifkan panggung 3D”, “Buka museum”, “pola 5”, “menit 2”.', m: 't' }
}
function ask(q) { if (!q.trim()) return; say(q, 1); pop(); mood('t'); const ty = document.createElement('div'); ty.className = 'mb ty'; ty.innerHTML = '<span></span><span></span><span></span>'; MS.appendChild(ty); MS.scrollTop = 1e9; setTimeout(() => { ty.remove(); const r = ans(q); say(r.t, 0, r.u ? 'unl' : ''); ov(880, .12, 'sine', .12); mood(r.m || 'h'); setTimeout(() => mood('n'), 2500); r.a && r.a(); if (r.u) setTimeout(() => tg(0), 1400) }, 650) }
const SUG = ['Ini tarian apa?', 'Aktifkan panggung 3D', 'Buka museum', 'Chip Game', 'Layar penuh', 'Formasi sekarang apa?', 'Gerak sekarang apa?', 'Kenalan dengan karakter', 'Formasi lingkaran atau V?', 'Siapa penari utama?', 'Busana laki-laki?', 'Menit 2', 'Aktifkan 3D Mode', 'Aktifkan kontrol Radit', 'Kamera atas', 'Uji aku']
$('#cp').innerHTML = SUG.map(x => `<button class="${/3D|museum|Chip|Layar/.test(x) ? 'key' : ''}">${x}</button>`).join('')
$('#cp').onclick = e => { if (e.target.tagName == 'BUTTON') ask(e.target.textContent) }; $('#cs').onclick = () => { ask($('#ci').value); $('#ci').value = '' }; $('#ci').onkeydown = e => { if (e.key == 'Enter') { ask(e.target.value); e.target.value = '' } }
const tg = o => { CH.classList.toggle('o', o); $('#chs').classList.toggle('o', o); if (o && !MS.children.length) say('Halo! Aku Si Seruni, pemandu Tari Sambut Seruni Musi. Semua fitur 3D (panggung, museum, karakter) aku yang membukakan. Coba bilang “Aktifkan panggung 3D”!'); mood(o ? 'h' : 'n'); o ? sparkle() : whoosh() }
$('#cx').onclick = () => tg(0); $('#chs').onclick = () => tg(0)
const openAsk = s => { tg(1); const i = $('#ci'); i.value = s || ''; setTimeout(() => i.focus(), 350) }
$('#heroAsk').onclick = () => openAsk('')
$$('[data-ask]').forEach(b => b.onclick = () => openAsk(b.dataset.ask))
$('#cmds').innerHTML = 'Ketik perintah ini ke Si Seruni (ketuk untuk menyalin ke kolom tanya):<br>' + ['Aktifkan panggung 3D', 'Buka museum', 'Chip Game', 'Layar penuh', 'Kamera sinematik', 'Kembali ke panggung', 'Aktifkan 3D Mode', 'Matikan panggung 3D'].map(c => `<code>${c}</code>`).join(' ')
$('#cmds').onclick = e => { if (e.target.tagName == 'CODE') openAsk(e.target.textContent) }
const BL = $('#bl'); let bx = innerWidth - 80, by = innerHeight - 200, bdg = 0, sx = 0, sy = 0, bmv = 0, bid; const bput = () => { BL.style.transform = `translate(${bx}px,${by}px)` }, idle = () => { clearTimeout(bid); BL.classList.remove('id'); bid = setTimeout(() => BL.classList.add('id'), 3000) }
try { const s = localStorage.getItem('bl'); if (s) { const a = s.split(','); bx = Math.min(+a[0], innerWidth - 72); by = Math.min(+a[1], innerHeight - 170) } } catch (e) { } bput(); idle()
BL.onpointerdown = e => { bdg = 1; bmv = 0; sx = e.clientX - bx; sy = e.clientY - by; BL.setPointerCapture(e.pointerId); BL.classList.add('dg'); idle() }
BL.onpointermove = e => { if (!bdg) return; const nx = e.clientX - sx, ny = e.clientY - sy; if (Math.abs(nx - bx) + Math.abs(ny - by) > 3) bmv = 1; bx = nx; by = ny; bput() }
BL.onpointerup = () => { bdg = 0; BL.classList.remove('dg'); if (!bmv) { tg(!CH.classList.contains('o')); vb(10) } else { bx = bx + 34 > innerWidth / 2 ? innerWidth - 80 : 12; by = Math.max(8, Math.min(innerHeight - 170, by)); bput(); vb(8); try { localStorage.setItem('bl', bx + ',' + by) } catch (e) { } } idle() }
BL.onkeydown = e => { if (e.key == 'Enter' || e.key == ' ') tg(!CH.classList.contains('o')) }
addEventListener('resize', () => { bx = Math.min(bx, innerWidth - 72); by = Math.min(by, innerHeight - 170); bput() })

/* ===== Logo, tema, suara ===== */
const setLg = u => { $('#lgi').innerHTML = '<img alt="Logo SMP Negeri 18 Palembang" src="' + u + '">' }; try { const u = localStorage.getItem('logo'); if (u) setLg(u) } catch (e) { }
$('#lgf').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { setLg(r.result); try { localStorage.setItem('logo', r.result) } catch (e) { } }; r.readAsDataURL(f) }
const setTheme = d => { document.documentElement.dataset.theme = d ? 'dark' : ''; try { localStorage.setItem('theme', d ? 'dark' : '') } catch (e) { } }
try { setTheme(localStorage.getItem('theme') == 'dark') } catch (e) { }
$('#thm').onclick = () => { setTheme(document.documentElement.dataset.theme != 'dark'); swish() }
const sndUI = () => $('#snd').classList.toggle('off', isMuted()); sndUI(); $('#snd').onclick = () => { setMuted(!isMuted()); sndUI(); tak(); toast(isMuted() ? 'Efek suara dimatikan' : 'Efek suara menyala') }
document.addEventListener('visibilitychange', () => { if (document.hidden) M.pause() })
try { navigator.audioSession && (navigator.audioSession.type = 'playback') } catch (e) { }
const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target) } }), { threshold: .08 }); $$('.gl,.sc,h2,.cast').forEach(e => { e.classList.add('rv'); io.observe(e) })
// Kelopak seruni berjatuhan
$('#petals').innerHTML = Array.from({ length: 12 }, () => `<i style="left:${Math.random() * 100}%;animation-duration:${14 + Math.random() * 14}s;animation-delay:-${Math.random() * 20}s;--dx:${(Math.random() - .5) * 200}px;transform:scale(${.6 + Math.random() * .7})"></i>`).join('')

tab(0); loop()
