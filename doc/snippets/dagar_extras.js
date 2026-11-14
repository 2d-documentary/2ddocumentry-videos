// ===== DAGAR extras: clips (clipx), real soundbites (bite), world maps + thrown-dart pins (mapRow / map), chapter cards (chap),
// rolling year tape (yearTape / yearAt), end card (endCard). Pasted after veritrix_kit + cinema3d_kit + docx_kit (+ mascot_kit) by doc/tools/make_header.py
// ---------- musk-doc extras: soundbites (real audio + 24 fps picture + subtitles), clip fps option
const AUDIO_DIR = 'documentaries/' + (EP.assetsProject || '') + '/assets/archives/user/';
function biteDraw(ctx, key, lt) { const n = CLIPN[key] || 1, i = Math.min(n - 1, Math.floor(lt * 24)); full(ctx, key + '_f' + i, lt, { z0: 1.0, z1: 1.04, dur: 6, bw: true }); }
const BITE_IDS = [];
function bite(t0, key) { const b = BITES[key], id = 'B_' + key; LINE[id] = { id, start: t0, end: t0 + b.d, words: b.words.map(w => ({ w: w[0], s: t0 + w[1], e: t0 + w[2] })) }; BITE_IDS.push(id);
  cue(t0, 'audio', 1, { src: AUDIO_DIR + (b.src || 'bites.m4a'), off: b.off, d: b.d }); return [t0, null, 'bite', key, { tr: 'cut' }]; }
BEAT_KINDS.bite = { cap: 'bite', draw: (ctx, t, lt, t0, a) => biteDraw(ctx, a[0], lt) };
BEAT_KINDS.clipx = { cap: 1, draw: (ctx, t, lt, t0, a, o) => { const n = CLIPN[a[0]] || clipCount(a[0]), i = Math.min(n - 1, Math.floor((lt + (o.off || 0)) * (o.fps || 12))); full(ctx, a[0] + '_f' + i, lt, { z0: o.z0 ?? 1.02, z1: o.z1 ?? 1.08, bw: o.bw, dark: o.dark }); } };
const wi = (id, i) => LINE[id].words[i].s - .04;
function endCard(ctx, t, t0, vert) { black(ctx); if (vert) { headline(ctx, 'FULL DOCUMENTARY', W / 2, H * .4, t, t0, { size: MN() * .1, sub: 'on my YouTube channel' }); headline(ctx, 'DAGAR UNFILTERED', W / 2, H * .6, t, t0 + .5, { size: MN() * .11, colors: ['#fff', DX.red] }); }
  else headline(ctx, 'DAGAR UNFILTERED', W / 2, H * .5, t, t0 + .1, { size: H * .1, colors: ['#fff', DX.red] }); fadeOut(ctx, t, TL.duration, 1); }

// ---------- maps (mono), thrown-dart pins, chapter cards, year tape
function monoMap(ctx, v) { const pr = geoProj(v); ctx.fillStyle = '#0B0B0C'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1; for (let lo = -180; lo <= 180; lo += 10) { const [x0, y0] = pr(lo, -80), [x1, y1] = pr(lo, 80); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  for (let la = -80; la <= 80; la += 10) { const [x0, y0] = pr(-180, la), [x1, y1] = pr(180, la); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  ctx.fillStyle = '#2A2A2C'; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.6; GEO_WORLD.land.forEach(r => { geoPath(ctx, r, pr, true); ctx.fill(); }); GEO_WORLD.land.forEach(r => { geoPath(ctx, r, pr, true); ctx.stroke(); }); ctx.restore(); return pr; }
function viewAt(views, t) { if (t <= views[0][0]) return views[0][1]; for (let i = 1; i < views.length; i++) if (t < views[i][0]) { const [ta, a] = views[i - 1], [tb, b] = views[i], p = E.inOut(clamp((t - ta) / Math.max(.01, tb - ta)));
    return { lon: lerp(a.lon, b.lon, p), lat: lerp(a.lat, b.lat, p), k: Math.exp(lerp(Math.log(a.k), Math.log(b.k), p)) }; } return views[views.length - 1][1]; }
function pinShape(ctx, s) { ctx.save(); ctx.scale(s, s); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 14; ctx.fillStyle = DX.red; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-6, -14, -20, -26, -20, -40); ctx.arc(0, -40, 20, Math.PI, 0); ctx.bezierCurveTo(20, -26, 6, -14, 0, 0); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -40, 7.5, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(-6, -46, 10, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke(); ctx.restore(); }
// pin thrown from the camera: flies in big + blurred, sticks into the map, wobbles like a dart, ripple, then the label slides out
function dartPin(ctx, x, y, t, ts, label, o = {}) { if (t < ts) return; const FLY = .42, u = clamp((t - ts) / FLY), e = E.in(u), m = MN() / 1080;
  if (u < 1) { const sx = lerp(W * (o.fromX ?? .62), x, e), sy = lerp(H * 1.05, y, e), s = lerp(9, 1, e) * m; ctx.save(); ctx.globalAlpha = .25 * e; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(x, y, 24 * m * e, 7 * m * e, 0, 0, 7); ctx.fill(); ctx.restore();
    ctx.save(); ctx.filter = `blur(${(1 - e) * 10}px)`; ctx.translate(sx, sy); ctx.rotate((1 - e) * -.5); pinShape(ctx, s); ctx.restore(); return; }
  const a = t - ts - FLY, wob = Math.sin(a * 38) * Math.exp(-a * 6) * .28;
  if (a < .7) { ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${.7 * (1 - a / .7)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, 90 * m * a / .7 + 10, 30 * m * a / .7 + 4, 0, 0, 7); ctx.stroke(); ctx.restore(); }
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(x, y, 16 * m, 5 * m, 0, 0, 7); ctx.fill(); ctx.translate(x, y); ctx.rotate(wob); pinShape(ctx, m); ctx.restore();
  if (label) { const lp = E.out(clamp((a - .08) / .3)); if (lp <= 0) return; const size = 40 * m; ctx.save(); ctx.font = `700 ${size}px ${F.cond}`; const w = ctx.measureText(label).width, lx = o.left ? x - 34 * m - w - 28 : x + 34 * m, ly = y - 58 * m;
    ctx.globalAlpha = lp; ctx.beginPath(); ctx.rect(o.left ? lx + (w + 28) * (1 - lp) : lx, ly - size * .85, (w + 28) * lp, size * 1.35); ctx.clip(); ctx.fillStyle = 'rgba(0,0,0,.85)'; ctx.fillRect(lx, ly - size * .85, w + 28, size * 1.35); ctx.fillStyle = DX.red; ctx.fillRect(lx, ly - size * .85, 6, size * 1.35);
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(label, lx + 16, ly - size * .15); ctx.restore(); } }
const PIN_TIMES = [];
BEAT_KINDS.map = { cap: 1, draw: (ctx, t, lt, t0, a, o) => { const v = viewAt(o.views, t), pr = monoMap(ctx, v);
  (o.routes || []).forEach(([A, B, ts, d]) => { const pa = pr(...A), pb = pr(...B), dx = pb[0] - pa[0], dy = pb[1] - pa[1]; route(ctx, pa, pb, (t - ts) / d, { ctrl: [(pa[0] + pb[0]) / 2 + dy * .12, (pa[1] + pb[1]) / 2 - Math.hypot(dx, dy) * .22], color: '#fff', lw: 4 }); });
  (o.pins || []).forEach(([lon, lat, label, ts, left]) => { const [x, y] = pr(lon, lat); dartPin(ctx, x, y, t, ts < 0 ? t0 - 5 : ts, label, { left }); }); vignetteK(ctx, .5); } };
function mapRow(id, word, o) { (o.pins || []).forEach(p => { if (p[3] >= 0) cue(p[3] + .42, 'thud', .45); }); return [id, word, 'map', o]; }
BEAT_KINDS.chap = { cap: 0, draw: (ctx, t, lt, t0, a) => { black(ctx); const m = MN(); ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = `400 ${m * .03}px ${F.cap}`; ctx.letterSpacing = m * .012 + 'px';
  ctx.globalAlpha = clamp(lt / .25); ctx.fillText('CHAPTER ' + a[0], W / 2, H * .4); ctx.restore(); const p = E.out(clamp((lt - .1) / .45)); ctx.fillStyle = DX.red; ctx.fillRect(W / 2 - m * .12 * p, H * .43, m * .24 * p, 4);
  headline(ctx, a[1], W / 2, H * .55, t, t0 + .15, { size: m * .1 }); } };
// year tape: a ruler of years at the bottom that rolls forward as the story moves on
function yearAt(keys, t) { let y = keys[0][1]; for (let i = 1; i < keys.length; i++) { if (t < keys[i][0]) break; y = lerp(keys[i - 1][1], keys[i][1], E.inOut(clamp((t - keys[i][0]) / 1.1))); } return y; }
function yearTape(ctx, yr, alpha = 1) { const m = MN(), cy = H * .935, sp = m * .026, cx = W / 2, half = W * .3; ctx.save(); ctx.globalAlpha = alpha;
  const g = ctx.createLinearGradient(0, cy - m * .09, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.75)'); ctx.fillStyle = g; ctx.fillRect(0, cy - m * .09, W, H);
  ctx.textAlign = 'center'; ctx.font = `400 ${m * .018}px ${F.cap}`;
  for (let y = Math.floor(yr - half / sp) - 1; y <= yr + half / sp + 1; y++) { const x = cx + (y - yr) * sp, d = Math.abs(x - cx) / half; if (d > 1) continue; const a = (1 - d * d) * .9, major = y % 5 === 0;
    ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(x - 1, cy - (major ? m * .022 : m * .012), 2, major ? m * .022 : m * .012); if (major) ctx.fillText(String(y), x, cy + m * .026); }
  ctx.fillStyle = DX.red; ctx.beginPath(); ctx.moveTo(cx - m * .012, cy - m * .045); ctx.lineTo(cx + m * .012, cy - m * .045); ctx.lineTo(cx, cy - m * .026); ctx.fill();
  ctx.font = `700 ${m * .036}px ${F.cond}`; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 10; ctx.fillText(String(Math.round(yr)), cx, cy - m * .055); ctx.restore(); }
