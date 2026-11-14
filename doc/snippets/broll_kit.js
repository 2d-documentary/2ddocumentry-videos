// ---------- B-roll motion kinds (Dagar): a cut-out prop that falls into frame, or drives in. Cut-outs come from
// fetch-assets "cutout": true -> archives/cutouts/<id>.png; map them with brollCuts(['gren', ...]) at the top of _shots.js.
function brollCuts(ids) { ids.forEach(k => EP.images[k + '_cut'] = 'archives/cutouts/' + k + '.png'); }
function propImg(k) { const im = imgOf(k + '_cut') || imgOf(k); if (!im) return null; return [im, im.naturalWidth || im.width, im.naturalHeight || im.height]; }
function brollKinds() {
  // ['L011', null, 'fall', bgKey, propKey, { text, x, y, s, dark }] : prop drops in, lands with a bounce + screen shake
  BEAT_KINDS.fall = { cap: 1, draw: (ctx, t, lt, t0, a, o) => {
    const D = o.d ?? .5, u = clamp(lt / D), land = lt >= D, b = lt - D;
    const sh = land ? Math.exp(-b * 9) * Math.sin(b * 70) * MN() * .014 : 0;
    ctx.save(); ctx.translate(sh, sh * .6);
    full(ctx, a[0], lt, { dark: o.dark ?? .45, z0: 1.08, z1: 1.18 });
    const p = propImg(a[1]);
    if (p) { const [im, iw, ih] = p, h = H * (o.s ?? .42), w = h * iw / ih, yEnd = H * (o.y ?? .6), x = W * (o.x ?? .5);
      let y = lerp(-h, yEnd, E.in(u)), rot = lerp(-1.8, .22, u);
      if (land) { y = yEnd - Math.abs(Math.sin(b * 9)) * Math.exp(-b * 5) * H * .06; rot = .22 + Math.sin(b * 7) * Math.exp(-b * 4) * .12; }
      ctx.fillStyle = `rgba(0,0,0,${.55 * u})`; ctx.beginPath(); ctx.ellipse(x, yEnd + h * .47, w * .5 * (.3 + .7 * u), h * .06, 0, 0, Math.PI * 2); ctx.fill();
      ctx.translate(x, y); ctx.rotate(rot); ctx.filter = 'grayscale(1) contrast(1.15)';
      if (!land) { ctx.globalAlpha = .22; ctx.drawImage(im, -w / 2, -h * .8, w, h); ctx.globalAlpha = 1; }
      ctx.drawImage(im, -w / 2, -h / 2, w, h); }
    ctx.restore();
    if (o.text) headline(ctx, o.text, W / 2, H * (o.ty ?? .2), t, t0 + D, { colors: o.colors || [DX.red], size: o.size || MN() * .12, sub: o.sub });
  } };
  // ['L021', 'tanker', 'drive', bgKey, propKey, { text, from: 'r'|'l', x, y, s }] : prop slides in fast and brakes
  BEAT_KINDS.drive = { cap: 1, draw: (ctx, t, lt, t0, a, o) => {
    full(ctx, a[0], lt, { dark: o.dark ?? .35, z0: 1.05, z1: 1.1 });
    const p = propImg(a[1]); if (p) { const [im, iw, ih] = p, h = H * (o.s ?? .42), w = h * iw / ih, D = o.d ?? 1.0, u = E.out(clamp(lt / D)), dir = o.from === 'l' ? -1 : 1;
      const xEnd = W * (o.x ?? .5), x = lerp(W / 2 + dir * (W / 2 + w * .6), xEnd, u), y = H * (o.y ?? .6), v = 1 - u;
      ctx.save(); ctx.filter = 'grayscale(1) contrast(1.1)';
      ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(x, y + h * .46, w * .48, h * .05, 0, 0, Math.PI * 2); ctx.fill();
      for (let k = 4; k >= 1; k--) { ctx.globalAlpha = .14 * v; ctx.drawImage(im, x - w / 2 + dir * k * w * .07 * v, y - h / 2, w, h); }
      ctx.globalAlpha = 1; ctx.drawImage(im, x - w / 2, y - h / 2, w, h); ctx.restore(); }
    if (o.text) headline(ctx, o.text, W / 2, H * (o.ty ?? .18), t, t0 + .3, { colors: o.colors, size: o.size || MN() * .1, sub: o.sub });
  } };
  // ['L013', 'fuel', 'alarm', bgKey, TEXT, sub] : photo with a blinking red warning (gauges, cockpit)
  BEAT_KINDS.alarm = { cap: 0, draw: (ctx, t, lt, t0, a, o) => {
    full(ctx, a[0], lt, { dark: o.dark ?? .4, z0: 1.15, z1: 1.3, fx: o.fx, fy: o.fy });
    const on = Math.floor(lt * 4) % 2 === 0; ctx.fillStyle = `rgba(224,38,43,${on ? .22 : .06})`; ctx.fillRect(0, 0, W, H);
    if (on || lt < .3) headline(ctx, a[1], W / 2, H * .46, t, t0, { colors: [DX.red], size: o.size || MN() * .13, sub: a[2] });
  } };
}
// ---------- year ruler only where a year/date is spoken: windows from the caption words (19xx/20xx, month names).
// A date without a year (e.g. "25 December") keeps the last year. Usage in shot(): dateTape(ctx, t, DW) with DW = dateWindows(ids).
const MONTH_RE = /^(january|february|march|april|may|june|july|august|september|october|november|december)$/i;
function dateWindows(ids, o = {}) { const out = []; let lastY = o.y0 || null;
  ids.forEach(id => { const l = LINE[id]; if (!l || !l.words) return; let yr = null, at = null;
    l.words.forEach((w, i) => { const s = w.w.replace(/[^0-9a-z]/gi, '');
      const isY = /^(19|20)\d\d$/.test(s), isM = MONTH_RE.test(s);
      if ((isY || isM) && at === null) { const p = i > 0 ? l.words[i - 1].w.replace(/[^0-9]/g, '') : ''; at = (p && p.length <= 2 && isM) ? l.words[i - 1].s : w.s; }
      if (isY && yr === null) yr = +s; });
    if (at === null) return; if (yr === null) yr = lastY || o.y0 || 1999;
    out.push({ a: at - .35, b: Math.max(at + 2.8, Math.min(l.end + .25, at + 4.5)), y: yr, from: lastY ?? yr }); lastY = yr; });
  for (let i = 1; i < out.length; i++) if (out[i].a < out[i - 1].b + .6) { out[i - 1].b = Math.max(out[i - 1].b, out[i].a); }
  return out; }
function dateTape(ctx, t, DW) { for (const w of DW) if (t > w.a && t < w.b) {
  const yr = lerp(w.from, w.y, E.inOut(clamp((t - w.a - .2) / 1.0)));
  yearTape(ctx, yr, clamp((t - w.a) / .3) * clamp((w.b - t) / .3)); return; } }
// ---------- a person's photo shown whole (never cropped to a face): card over its own blurred copy + serif name.
// ['L046', 'Ajit', 'person', key, 'Name', { cx, fx, fy }]   16:9 -> card left, name right; 9:16 -> card centre, name above
function personCard(ctx, k, lt, cx, cy, maxW, maxH, o = {}) { const im = imgOf(k); if (!im) return; const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
  let h = maxH, w = h * iw / ih; if (w > maxW) { w = maxW; h = w * ih / iw; }
  const p = E.out(clamp(lt / .5)), s = lerp(.94, 1, p) * (1 + lt * .01);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.shadowColor = 'rgba(0,0,0,.75)'; ctx.shadowBlur = 50; ctx.fillStyle = '#000'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowColor = 'transparent';
  cover(ctx, k, -w / 2, -h / 2, w, h, { z: 1.0, fx: o.fx, fy: o.fy }); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = Math.max(2, MN() * .004); ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.restore(); }
function brollPerson() {
  BEAT_KINDS.person = { cap: 1, draw: (ctx, t, lt, t0, a, o) => {
    cover(ctx, a[0], 0, 0, W, H, { z: 1.3 + lt * .02, blur: 24, bright: .4 }); const land = W > H;
    if (land) { personCard(ctx, a[0], lt, W * (o.cx ?? .3), H * .46, W * .4, H * .78, o); if (a[1]) serifName(ctx, a[1], W * .7, H * .4, t, t0 + .15, { size: MN() * .085 }); }
    else { personCard(ctx, a[0], lt, W / 2, H * .38, W * .8, H * .42, o); if (a[1]) serifName(ctx, a[1], W / 2, H * .12, t, t0 + .15, {}); }
  } };
}
// ---------- clock, logo, waving flag, satellite map (Dagar B-roll)
function brollExtras() {
  // ['L019', null, 'clock', '4:40', 'PM · ATC ko khabar', { bg }]: analog clock that winds to the time + digital label
  BEAT_KINDS.clock = { cap: 0, draw: (ctx, t, lt, t0, a, o) => {
    if (o.bg) full(ctx, o.bg, lt, { dark: o.dark ?? .7, z0: 1.15, z1: 1.25 }); else black(ctx);
    const [hh, mm] = a[0].split(':').map(Number), m = MN(), R = m * (W > H ? .22 : .3), cx = W / 2, cy = H * (W > H ? .42 : .38);
    const p = E.out(clamp(lt / .7)), tot = (hh % 12) * 60 + mm, cur = tot - (1 - p) * 90 + Math.max(0, lt - .7) * 1.5;
    ctx.save(); ctx.translate(cx, cy); ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 40;
    ctx.fillStyle = 'rgba(244,241,234,.95)'; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#111'; for (let i = 0; i < 60; i++) { const big = i % 5 === 0; ctx.lineWidth = big ? R * .035 : R * .012; const an = i / 60 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.sin(an) * R * (big ? .8 : .88), -Math.cos(an) * R * (big ? .8 : .88)); ctx.lineTo(Math.sin(an) * R * .94, -Math.cos(an) * R * .94); ctx.stroke(); }
    const hand = (an, len, wdt, col) => { ctx.strokeStyle = col; ctx.lineWidth = wdt; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-Math.sin(an) * len * .15, Math.cos(an) * len * .15); ctx.lineTo(Math.sin(an) * len, -Math.cos(an) * len); ctx.stroke(); };
    hand(cur / 720 * Math.PI * 2, R * .5, R * .07, '#111'); hand((cur % 60) / 60 * Math.PI * 2, R * .78, R * .045, '#111'); hand(lt * Math.PI * 2 / 2, R * .85, R * .015, DX.red);
    ctx.fillStyle = DX.red; ctx.beginPath(); ctx.arc(0, 0, R * .05, 0, 7); ctx.fill(); ctx.restore();
    headline(ctx, a[0] + (o.ampm ? ' ' + o.ampm : ''), cx, cy + R + m * .11, t, t0 + .2, { size: m * .1, sub: a[1], colors: o.colors });
  } };
  // ['L089', null, 'logo', key, 'sub line', { bg }]: a brand logo in its own colours on black, for factual reference
  BEAT_KINDS.logo = { cap: 0, draw: (ctx, t, lt, t0, a, o) => {
    if (o.bg) full(ctx, o.bg, lt, { dark: .85 }); else black(ctx); const im = imgOf(a[0]); if (!im) return;
    const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height, w = Math.min(W * .5, H * .9 * iw / ih) * (o.s ?? 1), h = w * ih / iw, p = E.out(clamp(lt / .5));
    ctx.save(); ctx.globalAlpha = p; ctx.translate(W / 2, H * .4); ctx.scale(lerp(.85, 1, p) * (1 + lt * .015), lerp(.85, 1, p) * (1 + lt * .015)); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore();
    if (a[1]) headline(ctx, '', W / 2, H * .4 + h / 2 + MN() * .06, t, t0 + .35, { size: MN() * .05, sub: a[1], subSize: MN() * .04 });
  } };
  // ['L052', 'Pakistan', 'flag', key, 'TEXT', 'sub', { colors }]: waving flag, full frame, darkened
  BEAT_KINDS.flag = { cap: 0, draw: (ctx, t, lt, t0, a, o) => {
    black(ctx); const im = imgOf(a[0]); if (im) { const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height, s = Math.max(W / iw, H / ih) * 1.15, dw = iw * s, dh = ih * s, x0 = (W - dw) / 2, y0 = (H - dh) / 2, N = 60;
      ctx.save(); ctx.filter = o.bw ? 'grayscale(1)' : 'saturate(.8)';
      for (let i = 0; i < N; i++) { const sx = iw * i / N, sw = iw / N + .5, dx = x0 + dw * i / N, ph = i / N * 7 - lt * 4, dy = Math.sin(ph) * MN() * .02 * (i / N + .2);
        ctx.drawImage(im, sx, 0, sw, ih, dx, y0 + dy, dw / N + 1, dh); ctx.fillStyle = `rgba(0,0,0,${.18 + .14 * Math.sin(ph + 1.2)})`; ctx.fillRect(dx, y0 + dy, dw / N + 1, dh); }
      ctx.restore(); ctx.fillStyle = `rgba(0,0,0,${o.dark ?? .45})`; ctx.fillRect(0, 0, W, H); }
    headline(ctx, a[1], W / 2, H * .46, t, t0 + .05, { sub: a[2], colors: o.colors, size: o.size });
  } };
}
// satellite base under the dart-pin map (NASA Blue Marble, public domain). EP.sat = { world: key, region: [key, lonW, latN, lonE, latS] }
function brollSatMap() { if (typeof monoMap !== 'function') return; const vec = monoMap;
  monoMap = (ctx, v) => { const S = EP.sat || {}, wi = imgOf(S.world); if (!wi) return vec(ctx, v); const pr = geoProj(v);
    ctx.fillStyle = '#050506'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.filter = 'grayscale(.85) brightness(.85) contrast(1.2)';
    const [x0, y0] = pr(-180, 90), [x1, y1] = pr(180, -90); ctx.drawImage(wi, x0, y0, x1 - x0, y1 - y0);
    if (S.region) { const ri = imgOf(S.region[0]); if (ri) { const [a0, b0] = pr(S.region[1], S.region[2]), [a1, b1] = pr(S.region[3], S.region[4]); ctx.drawImage(ri, a0, b0, a1 - a0, b1 - b0); } }
    ctx.restore(); ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1.2; GEO_WORLD.land.forEach(r => { geoPath(ctx, r, pr, true); ctx.stroke(); });
    const g = ctx.createRadialGradient(W / 2, H / 2, MN() * .3, W / 2, H / 2, Math.max(W, H) * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.7)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); return pr; };
}
