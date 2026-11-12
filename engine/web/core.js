// core.js — canvas helpers, easing, camera, grain, captions, timeline access
'use strict';
const _q = new URLSearchParams(location.search);
const W = +(_q.get('w') || 1920), H = +(_q.get('h') || 1080);
const INK = '#0B0A10';

const E = {
  lin: t => t,
  inOut: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  back: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  elastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI) / 3) + 1,
};
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));

// --- colour utils
function hex2rgb(h) { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); }
function rgb2hex(r) { return '#' + r.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join(''); }
function shade(h, k) { return rgb2hex(hex2rgb(h).map(v => v * k)); }
function mix(a, b, t) { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A.map((v, i) => lerp(v, B[i], t))); }

// --- drawing helpers
function P(ctx, fn) { ctx.beginPath(); fn(ctx); }
function inkFill(ctx, pathFn, fill, lw = 9, line = INK) {
  ctx.beginPath(); pathFn(ctx);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (lw > 0) { ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
}
// fill with a hard cel shadow: fill shadow, then lit area = same path offset, clipped to shape
function celFill(ctx, pathFn, base, dx, dy, lw = 9, line = INK, shadowK = 0.74) {
  ctx.save();
  ctx.beginPath(); pathFn(ctx); ctx.fillStyle = shade(base, shadowK); ctx.fill();
  ctx.clip();
  ctx.translate(dx, dy); ctx.beginPath(); pathFn(ctx); ctx.fillStyle = base; ctx.fill();
  ctx.restore();
  if (lw > 0) { ctx.beginPath(); pathFn(ctx); ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
}
function ellipse(ctx, x, y, rx, ry, rot = 0) { ctx.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, Math.PI * 2); }
function rrect(ctx, x, y, w, h, r) { ctx.roundRect(x, y, w, h, r); }

// seeded random
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }

// --- grain texture (paper/brush) generated once
let GRAIN = null;
function makeGrain() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d'); const id = g.createImageData(512, 512); const r = rng(7);
  for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() - .5) * 120; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0);
  // soft brush blotches
  g.globalAlpha = .08; for (let i = 0; i < 90; i++) { g.fillStyle = r() > .5 ? '#fff' : '#000'; g.beginPath(); g.arc(r() * 512, r() * 512, 8 + r() * 40, 0, 7); g.fill(); }
  GRAIN = c;
}
function grain(ctx, t, alpha = .07) {
  if (!GRAIN) makeGrain();
  const f = Math.floor(t * 12); const r = rng(f + 3);
  ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = 'overlay';
  const ox = -Math.floor(r() * 512), oy = -Math.floor(r() * 512);
  for (let x = ox; x < W; x += 512) for (let y = oy; y < H; y += 512) ctx.drawImage(GRAIN, x, y);
  ctx.restore();
}
function vignette(ctx, a = .28) {
  const g = ctx.createRadialGradient(W / 2, H * .45, H * .3, W / 2, H * .5, H * .78);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(10,5,20,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// --- camera: scale about focus point + offset + shake
function camera(ctx, { s = 1, fx = W / 2, fy = H / 2, dx = 0, dy = 0, rot = 0, shake = 0, t = 0 }) {
  const sx = shake ? (Math.sin(t * 91) + Math.sin(t * 57)) * shake : 0;
  const sy = shake ? (Math.cos(t * 83) + Math.sin(t * 41)) * shake : 0;
  ctx.translate(fx + dx + sx, fy + dy + sy); ctx.rotate(rot); ctx.scale(s, s); ctx.translate(-fx, -fy);
}
// a zoom snap: returns extra scale factor peaking at `at`
function snap(t, at, amt = .22, hold = .5) {
  if (t < at) return 1;
  const k = t - at; if (k < .07) return 1 + amt * E.out(k / .07);
  if (k < hold) return 1 + amt; return 1 + amt * (1 - E.inOut(prog(k, hold, hold + .25)));
}
function popScale(t, at, dur = .22) { if (t < at) return 0; const k = (t - at) / dur; return k >= 1 ? 1 : E.back(k); }

// --- TIMELINE
let TL = null;
function setTimeline(tl) { TL = tl; TL.byId = {}; TL.lines.forEach(l => TL.byId[l.id] = l); }
// time of a word (index) within a line; 'end' allowed
function wt(id, wi = 0) {
  const l = TL.byId[id]; if (!l) throw new Error('no line ' + id);
  if (wi === 'end') return l.end;
  if (typeof wi === 'string') { const i = l.words.findIndex(w => norm(w.w) === norm(wi)); if (i < 0) { console.warn('no word ' + wi + ' in ' + id); return l.start; } wi = i; }
  return l.words[Math.min(wi, l.words.length - 1)].s;
}
function norm(s) { return s.toLowerCase().replace(/[^a-z0-9']/g, ''); }

// --- CAPTIONS (word-by-word, grouped)
let CAPS = null;
function buildCaptions(script) {
  CAPS = [];
  for (const l of TL.lines) {
    const meta = script.lines.find(x => x.id === l.id) || {};
    const red = (meta.red || []).map(norm), gold = (meta.gold || []).map(norm), tiny = (meta.tiny || []).map(norm);
    let grp = [];
    const flush = () => { if (grp.length) CAPS.push(grp); grp = []; };
    l.words.forEach((w, i) => {
      const n = norm(w.w);
      grp.push({ text: w.w.replace(/[",]/g, '').toUpperCase(), s: w.s, e: w.e, red: red.includes(n), gold: gold.includes(n), tiny: tiny.includes(n), line: l.id });
      if (/[.?!:;…]$/.test(w.w) || /,$/.test(w.w) && grp.length >= 2 || grp.length >= 4) flush();
    });
    flush();
  }
  // group visibility window
  for (let i = 0; i < CAPS.length; i++) {
    const g = CAPS[i]; g.start = g[0].s; const nxt = CAPS[i + 1];
    g.end = nxt ? Math.min(nxt[0].s, g[g.length - 1].e + .6) : g[g.length - 1].e + .5;
  }
}
function drawCaptions(ctx, t, y = H * .60) {
  const g = CAPS.find(g => t >= g.start && t < g.end); if (!g) return;
  const base = 62; ctx.save(); ctx.textBaseline = 'middle';
  const words = g.filter(w => t >= w.s - .02);
  // layout into lines max 820px
  const sz = w => base * (w.tiny ? .42 : (w.red || w.gold) ? 1.22 : 1);
  const meas = w => { ctx.font = `700 ${sz(w)}px Poppins`; return ctx.measureText(w.text).width; };
  const all = g.map(w => ({ w, wd: meas(w) })); const lines = [[]]; let lw = 0; const sp = 18;
  for (const a of all) { if (lw + a.wd > 820 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(a); lw += a.wd + sp; }
  lines.forEach((ln, li) => {
    const tot = ln.reduce((s, a) => s + a.wd, 0) + sp * (ln.length - 1); let x = W / 2 - tot / 2;
    const yy = y + (li - (lines.length - 1) / 2) * 78;
    for (const a of ln) {
      const w = a.w; if (t >= w.s - .02) {
        const k = popScale(t, w.s - .02, .12); const sc = lerp(1.35, 1, clamp(k));
        ctx.save(); ctx.translate(x + a.wd / 2, yy); ctx.scale(sc, sc);
        ctx.font = `700 ${sz(w)}px Poppins`; ctx.textAlign = 'center';
        ctx.lineJoin = 'round'; ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
        ctx.lineWidth = w.tiny ? 6 : 13; ctx.strokeStyle = '#0a0a12'; ctx.strokeText(w.text, 0, 0);
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = w.red ? '#ED2A2F' : w.gold ? '#FFC21A' : '#FFFFFF'; ctx.fillText(w.text, 0, 0);
        ctx.restore();
      }
      x += a.wd + sp;
    }
  });
  ctx.restore();
}

// --- title / keyword cards (chunky, red strap)
function strapCard(ctx, text, x, y, k, { size = 120, color = '#fff', strap = '#D7262B', rot = -0.05 } = {}) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
  ctx.font = `700 ${size}px Poppins`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + size * .7, h = size * 1.15;
  ctx.fillStyle = '#111'; ctx.fillRect(-w / 2 - 6, -h / 2 + 8, w + 12, h);
  ctx.fillStyle = strap; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = '#fff'; ctx.fillRect(-w / 2, -h / 2 + 10, w, 6); ctx.fillRect(-w / 2, h / 2 - 16, w, 6);
  ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.strokeText(text, 0, 4);
  ctx.fillStyle = color; ctx.fillText(text, 0, 4); ctx.restore();
}
function bigNumber(ctx, text, x, y, k, color = '#C8202B', size = 210) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(-.03);
  ctx.font = `700 ${size}px Poppins`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = 26; ctx.strokeStyle = INK; ctx.strokeText(text, 0, 0);
  ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.strokeText(text, 0, 0);
  ctx.fillStyle = color; ctx.fillText(text, 0, 0);
  ctx.globalAlpha = .25; ctx.fillStyle = '#fff'; ctx.fillText(text, -4, -8); ctx.restore();
}
function flash(ctx, t, at, dur = .12, color = '255,255,255') {
  const k = 1 - prog(t, at, at + dur); if (t < at || k <= 0) return;
  ctx.fillStyle = `rgba(${color},${k * .85})`; ctx.fillRect(0, 0, W, H);
}
function speedLines(ctx, t, cx, cy, a = .5) {
  const r = rng(Math.floor(t * 15) + 11); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fff';
  for (let i = 0; i < 70; i++) { const an = r() * Math.PI * 2, r0 = 380 + r() * 300, w = .004 + r() * .01;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(an - w) * r0, cy + Math.sin(an - w) * r0); ctx.lineTo(cx + Math.cos(an) * 1800, cy + Math.sin(an) * 1800); ctx.lineTo(cx + Math.cos(an + w) * r0, cy + Math.sin(an + w) * r0); ctx.fill(); }
  ctx.restore();
}
