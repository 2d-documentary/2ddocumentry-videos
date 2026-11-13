// KINETIC style (fast-cut cinematic doc look): glowing serif word-by-word subtitles, a cut every 0.5-1.5 s,
// light-bar / flash / pixel / blur-in transitions, big glowing serif words & numbers, photo walls, desk collages,
// headline cards with black highlight boxes, calendars, CRT TVs, real footage clips.
// Needs docengine + editorial_helpers (+ props for cash/bitcoin rain). Call kfinish() at the end of scenes()
// instead of finish(): it draws the subtitles and brand on every shot. Header: EP.captions = false.
// EP.kEmph = ['word', ...] -> those words render big italic. Shot option { cap: false } hides subtitles,
// { capY: 0.3 } moves them, { capDark: true } = dark text for white shots, { capMode: 'spread'|'stack'|'line' }.
GRADES.mood = 'grayscale(.45) saturate(.8) contrast(1.18) brightness(.82)';
GRADES.ink = 'grayscale(1) contrast(1.35) brightness(.9)';
GRADES.fire = 'contrast(1.6) saturate(1.5) brightness(.75) sepia(.25)';
GRADES.cine = 'saturate(.9) contrast(1.15) brightness(.85) sepia(.08)';

// ---------------------------------------------------------------- subtitles
let _KG = null;
function kGroups() {
  if (_KG) return _KG; _KG = [];
  TL.lines.forEach(l => {
    let g = [];
    const push = (end) => { if (g.length) _KG.push({ id: l.id, words: g, s: g[0].s, e: end }); g = []; };
    l.words.forEach((w, i) => {
      g.push(w); const nxt = l.words[i + 1]; const punct = /[.,!?;:]$/.test(w.w);
      if (!nxt) push(l.end + .3); else if (punct || g.length >= 3) push(nxt.s);
    });
  });
  for (let i = 0; i < _KG.length - 1; i++) _KG[i].e = Math.min(_KG[i].e, _KG[i + 1].s);
  return _KG;
}
const kClean = (w) => w.replace(/[^\w$'.,%-]/g, '').replace(/[.,]$/, '').toLowerCase();
function kcaps(ctx, t, sh) {
  if (sh && sh.cap === false) return;
  const g = kGroups().find(c => t >= c.s && t < c.e); if (!g) return;
  const emph = new Set((EP.kEmph || []).map(s => s.toLowerCase()));
  const y = H * (sh && sh.capY != null ? sh.capY : (VERT ? .5 : .52)), base = VERT ? 58 : 52;
  const dark = sh && sh.capDark;
  const bleep = new Set((EP.kBleep || []).map(s => s.toLowerCase()));
  const mask = (s) => bleep.has(kClean(s)) ? s.replace(/^(\W*\w)(\w*)/, (m, a, b) => a + '*'.repeat(Math.max(2, b.length))) : s;
  const parts = g.words.map(w => ({ w, s: mask(w.w.replace(/[",]/g, '').replace(/\.$/, g.words.length === 1 ? '.' : '')), big: emph.has(kClean(w.w)) }));
  const m0 = (sh && sh.capMode) || ''; if (m0 === 'caps' || m0 === 'box' || m0 === 'stack') { kcapsAlt(ctx, t, g, parts, m0, y, base, dark); return; }
  const mode = (sh && sh.capMode) || (g.words.length === 2 && hash(g.s * 7) > .55 ? 'spread' : 'line');
  ctx.save(); ctx.textBaseline = 'alphabetic';
  const fontOf = (p) => `${p.big ? 'italic ' : ''}${p.big ? base * 2.1 : base}px ${p.big ? F.playI : F.play}`;
  const widths = parts.map(p => { ctx.font = fontOf(p); return ctx.measureText(p.s).width; });
  const gap = base * .32; let xs;
  if (mode === 'spread') xs = [clamp(W * .22 - widths[0] / 2, 40, W - widths[0] - 40), clamp(W * .78 - widths[1] / 2, 40, W - widths[1] - 40)];
  else { const tot = widths.reduce((a, b) => a + b, 0) + gap * (parts.length - 1); let x = W / 2 - tot / 2; xs = widths.map(w => { const x0 = x; x += w + gap; return x0; }); }
  parts.forEach((p, i) => {
    const a = E.out(prog(t, p.w.s - .02, p.w.s + .14)); if (a <= 0) return;
    ctx.font = fontOf(p); ctx.globalAlpha = a;
    const yy = y + (1 - a) * 10, bl = (1 - a) * 8;
    ctx.filter = bl > .5 ? `blur(${bl}px)` : 'none';
    if (dark) { ctx.fillStyle = '#111'; ctx.shadowColor = 'rgba(255,255,255,.6)'; ctx.shadowBlur = 14; }
    else { ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = 'rgba(255,255,255,.75)'; ctx.shadowBlur = p.big ? 34 : 22; }
    ctx.fillText(p.s, xs[i], yy);
    if (!dark) { ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 18; ctx.globalAlpha = a * .55; ctx.fillText(p.s, xs[i], yy); }
  });
  ctx.restore();
}
function kfinish() {
  const _d = SHOTS.map(s => s.draw);
  SHOTS.forEach((s, i) => { s.draw = (ctx, t, lt, sh) => { _d[i](ctx, t, lt, sh); kcaps(ctx, t, sh); if (typeof brand === 'function' && EP.brandOn !== false) kbrand(ctx); }; });
}
function kbrand(ctx) { text(ctx, EP.brand || 'DAGAR UNFILTERED', W / 2, VERT ? 96 : 60, { font: F.play, size: VERT ? 26 : 22, color: 'rgba(255,255,255,.55)', align: 'center', weight: 700, ls: 6 }); }

function kcapsAlt(ctx, t, g, parts, mode, y, base, dark) { // other subtitle looks from the references
  ctx.save(); ctx.textBaseline = 'alphabetic';
  if (mode === 'caps') { // bold condensed caps with cold glow (tech/AI look)
    const size = base * 1.25; ctx.font = `600 ${size}px ${F.osw}`; ctx.letterSpacing = '3px';
    const ws = parts.map(p => ctx.measureText(p.s.toUpperCase()).width), gap = size * .3, tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1); let x = W / 2 - tot / 2;
    parts.forEach((p, i) => { const a = E.out(prog(t, p.w.s - .02, p.w.s + .12)); if (a > 0) { ctx.globalAlpha = a; ctx.shadowColor = 'rgba(90,150,255,.95)'; ctx.shadowBlur = 30; ctx.fillStyle = '#DCE8FF'; ctx.fillText(p.s.toUpperCase(), x, y); ctx.shadowBlur = 8; ctx.fillText(p.s.toUpperCase(), x, y); } x += ws[i] + gap; });
  } else if (mode === 'box') { // yellow marker boxes, black serif text
    const size = base * .95; ctx.font = `${size}px ${F.play}`;
    const ws = parts.map(p => ctx.measureText(p.s).width), gap = size * .22, tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1); let x = W / 2 - tot / 2;
    parts.forEach((p, i) => { const a = E.out(prog(t, p.w.s - .02, p.w.s + .1)); if (a > 0) { ctx.globalAlpha = 1; ctx.fillStyle = '#F2E33A'; ctx.fillRect(x - 10, y - size * .82, (ws[i] + 20) * a, size * 1.08); if (a > .6) { ctx.fillStyle = '#111'; ctx.fillText(p.s, x, y); } } x += ws[i] + gap; });
  } else { // stack: one word per line, staggered, mixed sizes
    let yy = y - parts.length * base * .55;
    parts.forEach((p, i) => { const a = E.out(prog(t, p.w.s - .02, p.w.s + .14)); const size = p.big ? base * 2 : base * 1.15; yy += size * .95; if (a <= 0) return;
      ctx.font = `${p.big ? 'italic ' : ''}${size}px ${p.big ? F.playI : F.play}`; ctx.globalAlpha = a; ctx.fillStyle = dark ? '#111' : '#fff'; ctx.shadowColor = dark ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.7)'; ctx.shadowBlur = 22;
      ctx.fillText(p.s, W * .2 + i * base * .5, yy); });
  }
  ctx.restore();
}

// ---------------------------------------------------------------- transitions (call at the END of a shot's draw)
function kIn(ctx, lt, type = 'flash', d) {
  if (type === 'flash') { const p = prog(lt, 0, d || .14); if (p < 1) { ctx.save(); ctx.globalAlpha = 1 - p; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
  else if (type === 'bar') { const p = prog(lt, 0, d || .3); if (p < 1) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const w = W * E.out(Math.min(1, p * 2)), h = 6 + 70 * p * p, a = 1 - p;
    const g = ctx.createLinearGradient(0, H / 2 - h, 0, H / 2 + h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(W / 2 - w / 2, H / 2 - h, w, h * 2); ctx.shadowColor = '#fff'; ctx.shadowBlur = 40; ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(W / 2 - w / 2, H / 2 - 3, w, 6); ctx.restore(); } }
  else if (type === 'pix') { const p = prog(lt, 0, d || .22); if (p < 1) { ctx.save(); const n = 26, s = W / 9; for (let i = 0; i < n; i++) { if (hash(i * 3.1) > 1 - p * 1.3 + .3) continue;
    ctx.globalAlpha = .9 * (1 - p); ctx.fillStyle = hash(i) > .5 ? '#fff' : '#cfd6e6'; ctx.fillRect(Math.floor(hash(i * 5) * 9) * s, Math.floor(hash(i * 7) * (H / s)) * s, s * (1 + (hash(i * 9) > .7)), s); } ctx.restore(); } }
  else if (type === 'blur') { const p = prog(lt, 0, d || .22); if (p < 1) { ctx.save(); ctx.filter = `blur(${(1 - p) * 26}px)`; ctx.globalAlpha = 1 - E.in(p); ctx.drawImage(ctx.canvas, 0, 0); ctx.restore(); } }
  else if (type === 'glitch') { const p = prog(lt, 0, d || .2); if (p < 1) glitch(ctx, lt * 3, 1.6 * (1 - p), 3); }
  else if (type === 'zoom') { const p = prog(lt, 0, d || .28); if (p < 1) { const z = lerp(1.32, 1, E.out(p)); ctx.save(); ctx.filter = `blur(${(1 - p) * 6}px)`; ctx.drawImage(ctx.canvas, W / 2 - W * z / 2, H / 2 - H * z / 2, W * z, H * z); ctx.restore(); } }
  else if (type === 'black') { const p = prog(lt, 0, d || .2); if (p < 1) { ctx.save(); ctx.globalAlpha = 1 - p; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
}
// bloom: soft glow of the bright parts (cheap)
function bloom(ctx, a = .35) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = a; ctx.filter = 'blur(22px) brightness(1.1)'; ctx.drawImage(ctx.canvas, 0, 0); ctx.restore(); }
function kGrade(ctx, t, o = {}) { vign(ctx, o.vig ?? .75); if (o.bloom !== false) bloom(ctx, o.bloom ?? .28); }

// ---------------------------------------------------------------- visuals
function kPhoto(ctx, key, lt, o = {}) { // fast cinematic push-in on a photo
  const z = (o.z0 ?? 1.16) - (o.pull ? lt * .05 : -lt * (o.zs ?? .05));
  photo(ctx, key, { zoom: Math.max(1, z), fx: o.fx ?? .5, fy: o.fy ?? .45, grade: o.grade || 'mood', tint: o.tint, tintAmt: o.tintAmt, blur: o.blur });
  if (o.shade) shade(ctx, o.shade);
}
function clipFrame(ctx, prefix, n, lt, o = {}) { // footage frames prefix_0..n-1 at fps
  const fps = o.fps || 15; let i = Math.floor(lt * fps * (o.speed || 1)) + (o.from || 0); i = o.loop ? i % n : Math.min(n - 1, i);
  photo(ctx, prefix + '_' + i, { zoom: (o.z0 ?? 1.08) + lt * (o.zs ?? .03), fx: o.fx ?? .5, fy: o.fy ?? .5, grade: o.grade || 'cine', blur: o.blur });
  if (o.shake) { ctx.translate((hash(Math.floor(lt * 30)) - .5) * o.shake, (hash(Math.floor(lt * 30) + 9) - .5) * o.shake); }
}
function bigWord(ctx, s, lt, o = {}) { // giant glowing serif word on black
  if (!o.keepBG) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
  const p = E.out(prog(lt, 0, .35)), size = o.size || (VERT ? 230 : 210);
  ctx.save(); ctx.translate(W / 2, (o.y ?? .5) * H); ctx.scale(1 + (1 - p) * .12 + lt * .02, 1 + (1 - p) * .45 + lt * .02);
  ctx.font = `${o.italic ? 'italic ' : ''}${size}px ${o.italic ? F.playI : F.play}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.globalAlpha = p; ctx.filter = p < 1 ? `blur(${(1 - p) * 14}px)` : 'none';
  ctx.shadowColor = o.glow || 'rgba(255,255,255,.85)'; ctx.shadowBlur = 60; ctx.fillStyle = o.color || '#fff'; ctx.fillText(s, 0, 0);
  ctx.shadowBlur = 18; ctx.fillText(s, 0, 0); ctx.restore();
}
function glowNum(ctx, v0, v1, lt, o = {}) { // counting big number with glow over stars
  if (!o.keepBG) { bgGrad(ctx, '#05070D', '#000', 'r'); stars(ctx, lt * 3, 120, 2, .6); }
  const p = E.out(prog(lt, o.delay || 0, (o.delay || 0) + (o.dur || 1.1))); const v = Math.round(lerp(v0, v1, p));
  const s = (o.pre || '') + v.toLocaleString('en-US') + (o.post || ''); let size = o.size || (VERT ? 130 : 170);
  ctx.save(); ctx.font = `${size}px ${F.play}`; const w = ctx.measureText(s).width; if (w > W * .9) size *= W * .9 / w; ctx.restore();
  glowText(ctx, s, W / 2, H * (o.y ?? .5), { font: F.play, size, color: '#fff', align: 'center', glow: 'rgba(255,255,255,.8)', blur: 50 });
  if (o.sub) text(ctx, o.sub, W / 2 + (o.subDx ?? W * .28), H * (o.y ?? .5) + size * .42, { font: F.playI, size: size * .3, color: 'rgba(255,255,255,.85)', align: 'right' });
}
function photoWall(ctx, t, keys, o = {}) { // curved wall of tiles, slow pan; o.hero = index that glows
  ctx.fillStyle = '#05060A'; ctx.fillRect(0, 0, W, H);
  const cols = VERT ? 3 : 5, tw = W / cols * .94, th = tw * .72, pan = (o.pan ?? 1) * t * 40;
  const rows = Math.ceil(H / th) + 2;
  for (let r = -1; r < rows; r++) for (let c = 0; c < cols; c++) {
    const k = keys[(r * cols + c + 99 * keys.length) % keys.length];
    const cx = (c + .5) * W / cols, cy = r * th * 1.04 + ((pan + (c % 2) * th * .5) % th) - th * .2;
    const dx = (cx - W / 2) / W, sc = 1 - Math.abs(dx) * .18;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
    photo(ctx, k, { x: -tw / 2, y: -th / 2, w: tw - 8, h: th - 8, zoom: 1.05, grade: 'mood' }); ctx.restore();
  }
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .15, W / 2, H / 2, H * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.85)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function desk(ctx, t, o = {}) { // dark desk surface with a sweeping light
  bgGrad(ctx, o.a || '#2A1E14', o.b || '#0B0805', 'r');
  ctx.save(); ctx.globalAlpha = .18; for (let i = 0; i < 40; i++) { ctx.fillStyle = hash(i) > .5 ? '#000' : '#5a4330'; ctx.fillRect(0, hash(i * 3) * H, W, 2 + hash(i * 5) * 6); } ctx.restore();
  const x = W * (.3 + .4 * Math.sin(t * .4)); const g = ctx.createRadialGradient(x, H * .4, 0, x, H * .4, W * .9); g.addColorStop(0, 'rgba(255,230,190,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function polaroid(ctx, key, x, y, w, rot, p = 1, o = {}) {
  if (p <= 0) return; const h = w * (o.ratio || 1.05), sc = lerp(1.25, 1, E.out(p));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = clamp(p * 2.5);
  ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16; ctx.fillStyle = '#F2EFE8'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowColor = 'transparent';
  photo(ctx, key, { x: -w / 2 + w * .06, y: -h / 2 + w * .06, w: w * .88, h: h - w * .26, zoom: 1.05, grade: o.grade || 'mood' });
  if (o.label) text(ctx, o.label, 0, h / 2 - w * .07, { font: F.hand, size: w * .1, color: '#222', align: 'center', weight: 700 });
  ctx.restore();
}
function yString(ctx, a, b, p, col = '#E6F23C') { // yellow evidence string with pins
  if (p <= 0) return; const q = E.out(clamp(p)); ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.shadowColor = col; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(lerp(a[0], b[0], q), lerp(a[1], b[1], q)); ctx.stroke(); ctx.fillStyle = col;
  [a, q > .98 ? b : null].forEach(pt => { if (!pt) return; ctx.beginPath(); ctx.arc(pt[0], pt[1], 11, 0, 7); ctx.fill(); }); ctx.restore();
}
function headline(ctx, lt, lines, o = {}) { // paper headline card; o.hl = [lineIndex, 'phrase'] gets a black box
  ctx.fillStyle = '#F4F2EE'; ctx.fillRect(0, 0, W, H);
  const z = (VERT ? 1.02 : 1.0) + lt * .04; ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.rotate(o.rot ?? -.025); ctx.translate(-W / 2, -H / 2);
  const size = o.size || (VERT ? 72 : 80), x0 = o.x ?? W * .08; let y = H * (o.y ?? .42);
  lines.forEach((ln, i) => {
    ctx.font = `${i === 0 && o.kicker ? 30 : size}px ${o.font || F.play}`; ctx.fillStyle = '#141414'; ctx.textBaseline = 'alphabetic';
    if (o.hl && o.hl[0] === i) { const idx = ln.indexOf(o.hl[1]); const pre = ctx.measureText(ln.slice(0, idx)).width, w = ctx.measureText(o.hl[1]).width, p = E.out(prog(lt, .25, .55));
      ctx.fillText(ln.slice(0, idx), x0, y); ctx.fillStyle = '#0B0B0B'; ctx.fillRect(x0 + pre - 8, y - size * .82, (w + 16) * p, size * 1.05);
      ctx.fillStyle = p > .5 ? '#fff' : '#141414'; ctx.fillText(o.hl[1], x0 + pre, y); ctx.fillStyle = '#141414'; ctx.fillText(ln.slice(idx + o.hl[1].length), x0 + pre + w, y); }
    else ctx.fillText(ln, x0, y);
    y += size * 1.15;
  });
  ctx.font = `28px ${F.osw}`; ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 0; i < 9; i++) { ctx.fillRect(x0, y + 40 + i * 44, W * (.6 + hash(i) * .3), 14); }
  ctx.restore();
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .2, W / 2, H / 2, H * .8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function calendarPage(ctx, lt, month, day, o = {}) { // fisheye calendar with the day circled
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const r = VERT ? W * .47 : H * .4; const z = 1.04 + lt * .06;
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.rotate(Math.sin(lt * .8) * .02 - .04);
  ctx.fillStyle = '#F3EEE4'; ctx.fillRect(-r, -r, 2 * r, 2 * r);
  text(ctx, month, -r * .82, -r * .55, { font: F.osw, size: r * (month.length > 7 ? .22 : .28), color: '#D7261E', weight: 700 });
  if (o.year) text(ctx, o.year, r * .8, -r * .55, { font: F.osw, size: r * .16, color: '#D7261E', weight: 500, align: 'right' });
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], cw = r * 1.64 / 7, start = o.start ?? 1;
  days.forEach((d, i) => text(ctx, d, -r * .82 + cw * (i + .5), -r * .32, { font: F.osw, size: r * .07, color: '#D7261E', align: 'center', weight: 600 }));
  for (let n = 1; n <= (o.len || 31); n++) { const c = (n - 1 + start) % 7, rr = Math.floor((n - 1 + start) / 7);
    const x = -r * .82 + cw * (c + .5), y = -r * .12 + rr * cw * .78; text(ctx, String(n), x, y, { font: F.osw, size: r * .1, color: '#2B2B2B', align: 'center', weight: 500 });
    if (n === day) { const p = prog(lt, .3, .8); penEllipse(ctx, x, y - r * .035, cw * .48, cw * .4, p, { color: "#D7261E", lw: 8 }); } }
  ctx.restore();
  const g = ctx.createRadialGradient(W / 2, H / 2, r * .45, W / 2, H / 2, r * 1.2); g.addColorStop(0, 'rgba(255,240,215,0)'); g.addColorStop(.7, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,.95)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function crt(ctx, key, lt, o = {}) { // photo playing on an old TV in a dark room
  bgGrad(ctx, '#0E1420', '#000', 'r'); const w = VERT ? W * .82 : W * .5, h = w * .78, cx = W / 2, cy = H * (o.y ?? .5);
  ctx.save(); ctx.shadowColor = 'rgba(120,170,255,.45)'; ctx.shadowBlur = 90; ctx.fillStyle = '#1B1B1D'; ctx.beginPath(); ctx.roundRect(cx - w / 2 - 40, cy - h / 2 - 40, w + 80, h + 120, 40); ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 50); ctx.clip();
  if (o.draw) o.draw(cx - w / 2, cy - h / 2, w, h); else photo(ctx, key, { x: cx - w / 2, y: cy - h / 2, w, h, zoom: 1.06 + lt * .03, grade: o.grade || 'cine' });
  ctx.globalAlpha = .18; for (let y = cy - h / 2; y < cy + h / 2; y += 6) { ctx.fillStyle = '#000'; ctx.fillRect(cx - w / 2, y, w, 3); }
  ctx.restore();
  ctx.fillStyle = '#2A2A2E'; ctx.beginPath(); ctx.arc(cx + w / 2 - 30, cy + h / 2 + 50, 16, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(cx + w / 2 - 80, cy + h / 2 + 50, 16, 0, 7); ctx.fill();
}
function orbitRing(ctx, t, lt) { // Earth limb + glowing orbit path with a tiny craft
  spaceBG(ctx, t, '#1E3A8A'); const R = W * 1.4, cx = W / 2, cy = H + R * .62;
  const g = ctx.createRadialGradient(cx, cy, R * .9, cx, cy, R * 1.08); g.addColorStop(0, '#0B2A5C'); g.addColorStop(.92, '#2E7BD6'); g.addColorStop(1, 'rgba(120,190,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.08, 0, 7); ctx.fill();
  const p = E.inOut(prog(lt, .1, 1.8)); ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 4; ctx.shadowColor = '#fff'; ctx.shadowBlur = 20; ctx.setLineDash([2, 14]);
  ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.18, R * 1.18, 0, Math.PI * 1.25, Math.PI * (1.25 + .5 * p)); ctx.stroke(); ctx.setLineDash([]);
  const a = Math.PI * (1.25 + .5 * p); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * R * 1.18, cy + Math.sin(a) * R * 1.18, 9, 0, 7); ctx.fill(); ctx.restore();
}

// ---------------------------------------------------------------- group photos: spotlight the main person
// photoPt(key, o, u, v): canvas point of image point (u, v in 0..1) for a photo() drawn with the same options o.
function photoPt(key, o, u, v) {
  const im = IMG[key]; if (!im) return [W / 2, H / 2];
  const bx = o.x ?? 0, by = o.y ?? 0, bw = o.w ?? W, bh = o.h ?? H, z = o.zoom ?? 1, fx = o.fx ?? .5, fy = o.fy ?? .5;
  const s = Math.max(bw / im.width, bh / im.height) * z, dw = im.width * s, dh = im.height * s;
  const dx = clamp(bx + bw / 2 - fx * dw, bx + bw - dw, bx), dy = clamp(by + bh / 2 - fy * dh, by + bh - dh, by);
  return [dx + u * dw, dy + v * dh];
}
// spotlight(ctx, x, y, rx, ry, p): everyone else goes dark, the main person stays lit (+ optional yellow frame / name)
function spotlight(ctx, x, y, rx, ry, p = 1, o = {}) {
  if (p <= 0) return; const a = (o.dark ?? .82) * E.out(clamp(p));
  ctx.save(); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.72, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`);
  ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.moveTo(x + rx * 1.35, y); ctx.ellipse(x, y, rx * 1.35, ry * 1.35, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill('evenodd');
  ctx.translate(x, y); ctx.scale(rx * 1.35, ry * 1.35); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, 7); ctx.fill(); ctx.restore();
  if (o.frame !== false) { const q = E.out(prog(p, .3, 1)); if (q > 0) { ctx.save(); ctx.strokeStyle = o.color || '#E6F23C'; ctx.lineWidth = 6; ctx.shadowColor = o.color || '#E6F23C'; ctx.shadowBlur = 16;
    const w = rx * 2 * q, h = ry * 2; ctx.strokeRect(x - w / 2, y - h / 2, w, h); ctx.restore(); } }
  if (o.name) { const q = E.out(prog(p, .5, 1)); text(ctx, o.name, x, y + ry + 70, { font: F.playI, size: 54, color: '#fff', align: 'center', alpha: q, shadow: 20 }); }
}
