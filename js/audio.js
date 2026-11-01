// Mesin musik orisinal "Tari Sambut Seruni Musi" (Web Audio API) + efek suara UI.
// Seluruh instrumen disintesis langsung: gong, kenong, saron, gambus, akordeon, suling, biola,
// bas, gendang melayu, rebana, kerincing, ditambah suasana sungai & burung saat fajar.
import { SEC } from './data.js'

const mf = m => 440 * 2 ** ((m - 69) / 12)
const HM = [0, 2, 3, 5, 7, 8, 11], NMI = [0, 2, 3, 5, 7, 8, 10]
// Melodi dari derajat tangga nada D (0 = D4). Derajat negatif turun oktaf.
const nt = (d, sc) => { const s = sc == 'nm' ? NMI : HM, o = Math.floor(d / 7); return 62 + s[((d % 7) + 7) % 7] + 12 * o }

// Frasa 2 bar: [ketuk, derajat, durasi ketuk]
const PH = [
  [[0, 4, 2], [2, 3, 1], [3, 2, 1], [4, 1, 1.5], [5.5, 2, .5], [6, 0, 2]],
  [[0, 2, 1], [1, 3, 1], [2, 4, 2], [4, 5, 1], [5, 4, 1], [6, 3, 2]],
  [[0, 4, .5], [.5, 5, .5], [1, 4, 1], [2, 3, .5], [2.5, 2, .5], [3, 3, 1], [4, 2, .5], [4.5, 1, .5], [5, 2, .5], [5.5, 1, .5], [6, 0, 2]],
  [[0, 0, .5], [.5, 2, .5], [1, 4, 1], [2, 6, 1], [3, 7, 1], [4, 6, .5], [4.5, 5, .5], [5, 4, 1], [6, 3, 1], [7, 4, 1]],
  [[0, 7, .5], [.5, 6, .5], [1, 7, .5], [1.5, 8, .5], [2, 7, 1], [3, 5, 1], [4, 4, .5], [4.5, 5, .5], [5, 6, .5], [5.5, 7, .5], [6, 4, 1], [7, 2, 1]],
  [[0, 5, 1], [1, 4, 1], [2, 3, 1], [3, 2, 1], [4, 1, 1], [5, -1, 1], [6, 0, 2]],
  [[0, 6, 1], [1, 5, 1], [2, 6, .5], [2.5, 5, .5], [3, 4, 1], [4, 5, 2], [6, 4, 2]],
  [[0, 0, .5], [.5, 1, .5], [1, 2, .5], [1.5, 4, .5], [2, 3, 1], [3, 2, 1], [4, 4, .5], [4.5, 5, .5], [5, 4, .5], [5.5, 2, .5], [6, 1, 2]]]

// Progresi akor 4 bar (akar MIDI, kualitas)
const CH = { Dm: [50, 'm'], Gm: [55, 'm'], A: [57, 'M'], Bb: [58, 'M'], F: [53, 'M'], C: [48, 'M'] }
const PR = { A: ['Dm', 'Gm', 'A', 'Dm'], B: ['Dm', 'Bb', 'A', 'Dm'], C: ['F', 'C', 'Gm', 'Dm'] }
const tones = c => { const [r, q] = CH[c]; return [r, r + (q == 'm' ? 3 : 4), r + 7] }

// Pola gendang per bagian (posisi 1/16 dalam satu bar)
const DR = [
  null,
  { D: [0, 6, 8], T: [4, 12], U: [14] },
  { D: [0, 3, 8, 11], T: [4, 12], P: [6, 14], U: [10], B: [0, 8], K: [4, 6, 12, 14] },
  { D: [0, 10], T: [4, 12], U: [7, 15], J: [0, 2, 4, 6, 8, 10, 12, 14] },
  { D: [0, 3, 6, 8, 11], T: [4, 12, 14], P: [2, 10], B: [0, 8], K: [2, 4, 6, 10, 12, 14], J: [0, 2, 4, 6, 8, 10, 12, 14] },
  { D: [0, 8], T: [12] }]

export function createMusic() {
  let ctx, mst, cmp, rev, an, NB, KB = {}, base = 0, ix = 0, tm, rt = 1, TS = 1, vol = .8
  const S = { st: 'idle', off: 0 }
  const evs = []

  function env(g, w, a, d, v, sus) { const p = g.gain; p.setValueAtTime(.0001, w); p.exponentialRampToValueAtTime(Math.max(v, .0002), w + a); if (sus) p.setValueAtTime(Math.max(v, .0002), w + Math.max(a, d - .12)); p.exponentialRampToValueAtTime(.0001, w + d) }
  const out = (g, pan, wet) => { let n = g; if (pan && ctx.createStereoPanner) { const s = ctx.createStereoPanner(); s.pan.value = pan; g.connect(s); n = s } n.connect(mst); if (wet) { const w = ctx.createGain(); w.gain.value = wet; n.connect(w); w.connect(rev) } }
  function nz(w, d, ty, fr, v, q, sus, pan, wet) { const o = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.buffer = NB; o.loop = true; o.loopStart = Math.random() * .5; f.type = ty; f.frequency.value = fr; f.Q.value = q || 1; env(g, w, .004, d, v, sus); o.connect(f); f.connect(g); out(g, pan, wet); o.start(w, Math.random() * .5); o.stop(w + d + .05) }
  function sw(w, f1, f2, d, v, pan, wet, ty) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = ty || 'sine'; o.frequency.setValueAtTime(f1, w); o.frequency.exponentialRampToValueAtTime(f2, w + d); env(g, w, .004, d, v); o.connect(g); out(g, pan, wet); o.start(w); o.stop(w + d + .05) }
  function partials(w, f0, list, v, pan, wet, atk) { list.forEach(([r, a, d]) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f0 * r; env(g, w, atk || .006, d * TS ** .3, v * a); o.connect(g); out(g, pan, wet); o.start(w); o.stop(w + d * TS ** .3 + .1) }) }

  // Perkusi
  const gendang = (w, k, v) => {
    if (k == 'D') { sw(w, 190, 92, .32, .55 * v, -.1, .12); nz(w, .05, 'lowpass', 900, .12 * v) }
    else if (k == 'T') { nz(w, .08, 'bandpass', 2600, .42 * v, 2.2, 0, -.1, .15); sw(w, 440, 300, .07, .14 * v, -.1) }
    else if (k == 'P') nz(w, .11, 'highpass', 1500, .3 * v, 1, 0, -.15, .2)
    else if (k == 'U') sw(w, 300, 225, .17, .38 * v, -.1, .15)
    else if (k == 'B') { sw(w, 120, 68, .38, .45 * v, .2, .1); nz(w, .03, 'lowpass', 600, .1 * v, 1, 0, .2) }
    else if (k == 'K') { nz(w, .05, 'bandpass', 3600, .3 * v, 3, 0, .25, .2); sw(w, 620, 520, .04, .08 * v, .25) }
    else if (k == 'J') [0, .014, .03].forEach((o, i) => nz(w + o, .05, 'highpass', 7500, (.12 - i * .03) * v, 1, 0, .35, .25))
  }
  const gong = (w, m, v) => { nz(w, .18, 'lowpass', 420, v * .9, 1, 0, 0, .5); partials(w, mf(m), [[1, 1, 7], [1.0045, .9, 7], [2.02, .35, 5], [2.74, .2, 4], [4.13, .08, 2.5]], v, 0, .45, .025) }
  const kenong = (w, m, v) => partials(w, mf(m), [[1, 1, 2.6], [1.006, .7, 2.6], [2.42, .25, 1.4], [3.9, .08, .8]], v, -.25, .4, .008)
  const saron = (w, m, d, v) => partials(w, mf(m), [[1, 1, Math.min(d, 1.6) + .6], [2.76, .35, .9], [5.4, .12, .4]], v * (.85 + Math.random() * .3), -.35, .5, .004)
  const bell = (w, m, v) => partials(w, mf(m), [[1, 1, 2.2], [2.01, .3, 1.2], [3.0, .12, .7]], v, .3, .6, .003)

  // Gambus (Karplus-Strong, badan kayu)
  function ks(m) { if (KB[m]) return KB[m]; const sr = ctx.sampleRate, N = sr * 2 | 0, p = Math.round(sr / mf(m)), b = ctx.createBuffer(1, N, sr), d = b.getChannelData(0); for (let i = 0; i < p; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / p * .3); for (let i = p; i < N; i++) d[i] = .4988 * (d[i - p] + d[i - p + 1]); return KB[m] = b }
  function gambus(w, m, v, pan = .35) { const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter(), bdy = ctx.createBiquadFilter(); s.buffer = ks(m); f.type = 'lowpass'; f.frequency.value = 3400; bdy.type = 'peaking'; bdy.frequency.value = 260; bdy.gain.value = 6; bdy.Q.value = 1.2; g.gain.value = v * (.8 + Math.random() * .4); s.connect(bdy); bdy.connect(f); f.connect(g); out(g, pan, .35); s.start(w) }
  function bass(w, m, d, v) { const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = mf(m); f.type = 'lowpass'; f.frequency.value = 700; env(g, w, .01, Math.min(d * TS, 1.2), v); o.connect(f); f.connect(g); out(g, 0, .08); o.start(w); o.stop(w + d * TS + .2); gambus(w, m + 12, v * .25, 0) }

  // Akordeon (musette: dua lidah sedikit berselisih nada)
  function akordeon(w, ms, d, v, pan = -.2) {
    d *= TS; const g = ctx.createGain(), f = ctx.createBiquadFilter(), bp = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2100; bp.type = 'peaking'; bp.frequency.value = 1100; bp.gain.value = 4
    ms.forEach(m => [-9, 9].forEach((c, i) => { const o = ctx.createOscillator(), q = ctx.createGain(); o.type = i ? 'square' : 'sawtooth'; o.frequency.value = mf(m); o.detune.value = c; q.gain.value = i ? .5 : .7; o.connect(q); q.connect(bp); o.start(w); o.stop(w + d + .3) }))
    bp.connect(f); f.connect(g); const a = Math.min(.18, d * .3); g.gain.setValueAtTime(.0001, w); g.gain.exponentialRampToValueAtTime(v / ms.length, w + a); g.gain.linearRampToValueAtTime(v / ms.length * .78, w + d * .6); g.gain.exponentialRampToValueAtTime(.0001, w + d + .2); out(g, pan, .35)
  }
  // Suling & biola dengan cengkok (hiasan nada khas Melayu)
  function vox(w, m, d, ty, v = 1) {
    d *= TS; const bi = ty == 'biola', g = ctx.createGain(), f = ctx.createBiquadFilter(), l = ctx.createOscillator(), lg = ctx.createGain(); f.type = 'lowpass'; f.frequency.value = bi ? 2600 : 5400
    l.frequency.value = 5 + Math.random(); lg.gain.setValueAtTime(0, w); lg.gain.linearRampToValueAtTime(bi ? 18 : 11, w + Math.min(d * .8, .6)); l.connect(lg); l.start(w); l.stop(w + d + .3)
    const orn = d > .45 && Math.random() < .55;
    (bi ? [['sawtooth', -6, 1, .4], ['sawtooth', 7, 1, .4], ['triangle', 0, 2, .12]] : [['sine', 0, 1, 1], ['sine', 0, 2, .14], ['triangle', 0, 3, .03]]).forEach(([t, c, k, a]) => {
      const o = ctx.createOscillator(), q = ctx.createGain(), fr = mf(m) * k; o.type = t
      if (orn) { o.frequency.setValueAtTime(fr * 2 ** (2 / 12), w); o.frequency.setValueAtTime(fr * 2 ** (2 / 12), w + .045); o.frequency.exponentialRampToValueAtTime(fr, w + .09) }
      else { o.frequency.setValueAtTime(bi ? fr * .985 : fr * .975, w); o.frequency.exponentialRampToValueAtTime(fr, w + (bi ? .12 : .08)) }
      o.detune.value = c; lg.connect(o.detune); q.gain.value = a; o.connect(q); q.connect(f); o.start(w); o.stop(w + d + .3)
    })
    env(g, w, bi ? .1 : .06, d + .18, (bi ? .08 : .23) * v, 1); f.connect(g); out(g, bi ? -.3 : .15, .45); if (!bi) nz(w, d, 'bandpass', mf(m) * 2, .022 * v, 2, 1, .15, .3)
  }
  // Suasana fajar: arus sungai & kicau burung
  function river(w, d, v) { const o = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain(); o.buffer = NB; o.loop = true; f.type = 'lowpass'; f.frequency.value = 520; f.Q.value = .7; l.frequency.value = .18; lg.gain.value = 220; l.connect(lg); lg.connect(f.frequency); d *= TS; g.gain.setValueAtTime(.0001, w); g.gain.exponentialRampToValueAtTime(v, w + 3); g.gain.setValueAtTime(v, w + d - 6); g.gain.exponentialRampToValueAtTime(.0001, w + d); o.connect(f); f.connect(g); out(g, 0, .3); o.start(w); l.start(w); o.stop(w + d + .1); l.stop(w + d + .1) }
  const bird = (w, v) => { const b = 2600 + Math.random() * 1400; for (let i = 0; i < 3 + (Math.random() * 3 | 0); i++) sw(w + i * .09, b, b * (1.25 + Math.random() * .3), .07, v, .5 - Math.random(), .5) }

  function build() {
    const add = (t, f, j) => evs.push({ t: t + (j ? (Math.random() - .5) * .03 : 0), f })
    add(0, w => river(w, 34, .05))
    for (let i = 0; i < 9; i++) add(2 + i * 3.2 + Math.random() * 2, w => bird(w, .025 + Math.random() * .02))
    SEC.forEach((s, si) => {
      const bt = 60 / s.bpm, bar = bt * 4, nb = Math.round(s.d / bar), prog = PR[s.pr]
      for (let b = 0; b < nb; b++) {
        const T = s.a + b * bar, e = s.e[0] + (s.e[1] - s.e[0]) * b / Math.max(1, nb - 1), ch = tones(prog[b % 4]), root = ch[0], last = b == nb - 1, fill = (si == 2 || si == 4) && (b % 4 == 3 || last)
        // Akhir lagu: gong panjang dan akor penutup
        if (si == 5 && last) { add(T, w => gong(w, 38, .42)); [50, 57, 62, 65, 69].forEach((m, i) => add(T + i * .11, w => gambus(w, m, .3))); add(T, w => akordeon(w, [62, 65, 69], 7, .1)); add(T + .1, w => vox(w, 62, 6, 'suling', .9)); continue }
        // Gong & kenong (penanda awal bagian)
        if (b == 0) add(T, w => gong(w, 38, .26 + .14 * e)); else if (s.lv == 3 ? true : b % 4 == 0) add(T, w => gong(w, 45, .1 + .08 * e))
        if (si > 0) add(T + 2 * bt, w => kenong(w, b % 2 ? 69 : 62, .08 + .06 * e))
        // Akordeon: pad lembut / hentakan di sela ketuk saat meriah
        if (si == 0 && b >= 2) add(T, w => akordeon(w, ch.map(m => m + 12), bar * .98, .05 + .04 * b / nb))
        else if (s.lv == 3) [.5, 1.5, 2.5, 3.5].forEach(o => add(T + o * bt, w => akordeon(w, ch.map(m => m + 12), bt * .38, .08 + .06 * e)))
        else if (si > 0) add(T, w => akordeon(w, ch.map(m => m + 12), bar * .97, .07 + .05 * e))
        // Bas & gambus
        if (si > 0) { add(T, w => bass(w, root - 12, bt * 1.6, .22 + .12 * e), 1); add(T + 2 * bt, w => bass(w, root - 5, bt * 1.4, .18 + .1 * e), 1) }
        const arp = s.lv == 1 ? (b >= 4 || si == 5 ? [0, 2] : []) : si == 3 ? [0, .5, 1, 1.5, 2, 2.5, 3, 3.5] : [0, 1, 1.5, 2, 3, 3.5]
        arp.forEach((o, k) => add(T + o * bt, w => gambus(w, ch[k % 3] + 12 + (k % 4 == 3 ? 12 : 0), (.16 + .14 * e) * (o % 1 ? .7 : 1)), 1))
        // Saron balungan
        if (si > 0) add(T + 2 * bt, w => saron(w, 74 - (b % 4 == 3 ? 5 : 0), 1, .08 + .06 * e))
        if (s.lv > 1) [1, 3].forEach(o => add(T + (o + .5) * bt, w => saron(w, nt(5 + (b + o) % 4, s.sc) + 12, .5, .05 + .04 * e), 1))
        // Gendang, rebana, kerincing
        const pt = DR[si]
        if (pt && !(si == 5 && b >= 6)) for (const k in pt) pt[k].forEach(x => { if (fill && x >= 8) return; add(T + x * bt / 4, w => gendang(w, k, (.55 + .5 * e) * (x % 4 ? .75 : 1)), 1) })
        if (fill) for (let x = 8; x < 16; x++) add(T + x * bt / 4, w => gendang(w, x % 2 ? 'T' : (x > 13 ? 'D' : 'U'), (.45 + .05 * (x - 8)) * (.7 + .5 * e)), 1)
        if (si == 0 && b >= 6) [0, 2, 3].forEach(x => add(T + x * bt, w => gendang(w, 'B', .25 + .1 * (b - 6)), 1))
        if (si == 0 && last) for (let x = 12; x < 16; x++) add(T + x * bt / 4, w => gendang(w, 'T', .2 + x * .02), 1)
        // Hentakan bersama (cocok dengan Hentak Gagah) & kembang api bunyi di Pesta Rakyat
        if (si == 2 && b % 4 == 0 && b) add(T, w => { gendang(w, 'D', 1); gendang(w, 'P', .8); akordeon(w, ch.map(m => m + 12), .3, .2) })
        if (si == 4 && b % 4 == 0 && b) [0, 1, 2, 3, 4, 5].forEach(i => add(T + i * .06, w => bell(w, 86 + [0, 3, 7, 10, 12, 15][i], .05)))
        // Melodi utama + lapisan pengganda
        if (b >= s.from && (b - s.from) % 2 == 0 && b + 1 < nb) {
          const ph = PH[s.seq[((b - s.from) / 2 | 0) % s.seq.length]]
          ph.forEach(([o, d, du]) => {
            const m = nt(d, s.sc), t = T + o * bt, lead = s.ld == 'biola' ? m - 12 : m
            add(t, w => vox(w, lead, du * bt * .96, s.ld, .8 + .4 * e), 1)
            if (si == 4 || (si == 2 && b >= 12)) add(t, w => vox(w, m, du * bt * .94, s.ld == 'biola' ? 'suling' : 'biola', .5 + .3 * e), 1)
            if (s.db) add(t, w => s.db == 'saron' ? saron(w, m - 12, du * bt, .12 + .08 * e) : gambus(w, m, .14 + .1 * e, -.4), 1)
          })
        }
      }
    })
    evs.sort((a, b) => a.t - b.t)
  }
  build()

  function tick() { const lim = (ctx.currentTime - base) * rt + .6 * rt; while (ix < evs.length && evs[ix].t < lim) { const e = evs[ix++], w = base + e.t / rt; if (w >= ctx.currentTime - .02) e.f(w) } }
  function halt() { clearInterval(tm); if (ctx) { ctx.close(); ctx = null } S.st = 'idle' }
  function go(o) {
    halt(); KB = {}; ctx = new (window.AudioContext || window.webkitAudioContext)(); TS = 1 / rt
    mst = ctx.createGain(); mst.gain.value = vol; cmp = ctx.createDynamicsCompressor(); cmp.threshold.value = -16; cmp.ratio.value = 3.5; an = ctx.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = .78
    mst.connect(cmp); cmp.connect(an); an.connect(ctx.destination)
    NB = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const nd = NB.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1
    const L = ctx.sampleRate * 3 | 0, im = ctx.createBuffer(2, L, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = im.getChannelData(c); let p = 0; for (let i = 0; i < L; i++) { p = p * .55 + (Math.random() * 2 - 1) * .45; d[i] = p * (1 - i / L) ** 2.8 } }
    rev = ctx.createConvolver(); rev.buffer = im; const wg = ctx.createGain(); wg.gain.value = .55; rev.connect(wg); wg.connect(mst)
    base = ctx.currentTime - o / rt; ix = evs.findIndex(e => e.t >= o); if (ix < 0) ix = evs.length; tm = setInterval(tick, 100); tick(); S.st = 'play'
  }
  const M = {
    S,
    cur: () => S.st == 'idle' ? S.off : (ctx.currentTime - base) * rt,
    running: () => S.st != 'idle' && ctx && ctx.state == 'running',
    go, halt,
    stop() { halt(); S.off = 0 },
    seek(t) { S.off = t; if (S.st != 'idle') go(t) },
    toggle() { if (S.st == 'idle') go(S.off); else if (ctx.state == 'running') ctx.suspend(); else ctx.resume() },
    pause() { if (ctx && ctx.state == 'running') ctx.suspend() },
    resume() { if (ctx) ctx.resume() },
    setVol(v) { vol = v; if (mst) mst.gain.value = v },
    get rate() { return rt },
    setRate(r) { const c = M.cur(); rt = r; if (S.st != 'idle') go(c); else S.off = c },
    // Spektrum untuk visualisasi (0..1)
    spectrum(arr) { if (!an || S.st == 'idle') return 0; const d = new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(d); let sum = 0; for (let i = 0; i < arr.length; i++) { const v = d[Math.min(d.length - 1, Math.floor((i / arr.length) ** 1.6 * d.length * .7) + 1)] / 255; arr[i] = v; sum += v } return sum / arr.length },
  }
  return M
}

/* ===== Efek suara UI ===== */
let a2, NZ, muted = 0
try { muted = +localStorage.getItem('mute') || 0 } catch (e) { }
const sv = () => muted ? 0 : .5
const X = () => { if (!a2) { a2 = new (window.AudioContext || window.webkitAudioContext)(); NZ = a2.createBuffer(1, a2.sampleRate / 2, a2.sampleRate); const d = NZ.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1 } if (a2.state != 'running') a2.resume(); return a2 }
export function ov(f, d, ty, v, at, sl) { const V = v * sv(); if (!V) return; const c = X(), t = c.currentTime + (at || 0), o = c.createOscillator(), g = c.createGain(); o.type = ty || 'sine'; o.frequency.setValueAtTime(f, t); if (sl) o.frequency.exponentialRampToValueAtTime(sl, t + d); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(V, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .05) }
export function nb(d, f1, f2, v, at) { const V = v * sv(); if (!V) return; const c = X(), t = c.currentTime + (at || 0), s = c.createBufferSource(), b = c.createBiquadFilter(), g = c.createGain(); s.buffer = NZ; b.type = 'bandpass'; b.frequency.setValueAtTime(f1, t); b.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(V, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d); s.connect(b); b.connect(g); g.connect(c.destination); s.start(t); s.stop(t + d + .05) }
export const mf2 = mf
export const bell = (f, v = .3) => { ov(f, 1.3, 'sine', v); ov(f * 2.76, .5, 'sine', v * .3) }
export const tak = () => { nb(.08, 2200, 2200, .4); ov(300, .1, 'sine', .25, 0, 200) }
export const swish = () => nb(.4, 400, 3500, .3)
export const gg = () => [1, 1.004, 2.02, 2.74].forEach((r, i) => ov(110 * r, 4 - i * .6, 'sine', .35 / (i + 1)))
export const pop = () => { ov(520, .09, 'sine', .22, 0, 980); ov(1300, .06, 'triangle', .06, .04) }
export const whoosh = () => nb(.32, 1800, 300, .18)
export const sparkle = () => [0, 4, 7, 12, 16, 19].forEach((s, i) => ov(mf(81 + s), .5, 'sine', .14, i * .055))
export const unlock = () => { [0, 7, 12].forEach((s, i) => ov(mf(69 + s), .8, 'triangle', .16, i * .09)); setTimeout(sparkle, 260) }
const PS = [0, 2, 4, 7, 9, 12, 14, 16]; let tn = 0
export const tapN = () => bell(mf(74 + PS[tn++ % 8]), .25)
export const scale = i => mf(PS[i % 8] + 72 + 12 * (i / 8 | 0))
export const vb = n => navigator.vibrate && navigator.vibrate(n)
export const isMuted = () => !!muted
export const setMuted = m => { muted = m ? 1 : 0; try { localStorage.setItem('mute', muted) } catch (e) { } }
