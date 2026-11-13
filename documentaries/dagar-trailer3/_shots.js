function scenes() {
  const m = () => MN();
  // ---------- trailer type: wide-tracked glowing serif title + small word-by-word kicker (reference caption style)
  function ttl(ctx, s, x, y, t, t0, o = {}) { if (t < t0) return; const lt = t - t0, p = E.out(clamp(lt / .55)), words = s.split(' ');
    let size = m() * (o.size || .12); ctx.save(); ctx.font = `700 ${size}px ${F.tinos}`; ctx.letterSpacing = size * .1 + 'px';
    { const fw = words.reduce((a, w) => a + ctx.measureText(w).width, 0) + size * .35 * (words.length - 1), mx = W * .86; if (fw > mx) { size *= mx / fw; ctx.font = `700 ${size}px ${F.tinos}`; } }
    const ls = lerp(size * .32, size * .1, p); ctx.letterSpacing = ls + 'px';
    const ws = words.map(w => ctx.measureText(w).width), sp = size * .35, tw = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    let xx = x - tw / 2; ctx.textBaseline = 'middle'; ctx.globalAlpha = clamp(lt / .25);
    words.forEach((w, i) => { const red = (o.red || []).includes(i); ctx.shadowColor = red ? 'rgba(224,38,43,.9)' : 'rgba(255,255,255,.55)'; ctx.shadowBlur = size * .35; ctx.fillStyle = red ? DX.red : '#F4F1EA';
      ctx.fillText(w, xx, y); ctx.shadowBlur = 0; ctx.fillText(w, xx, y); xx += ws[i] + sp; });
    ctx.restore(); if (o.kick) kick(ctx, o.kick, x, y + size * .95, t, t0 + .2); }
  function kick(ctx, s, x, y, t, t0) { if (t < t0) return; const size = m() * .034, words = s.split(' '); ctx.save(); ctx.font = `400 ${size}px ${F.cap}`; ctx.textBaseline = 'middle';
    const gap = size * .9, ws = words.map(w => ctx.measureText(w).width), tw = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1); let xx = x - tw / 2;
    words.forEach((w, i) => { const a = clamp((t - t0 - i * .07) / .15); ctx.globalAlpha = a; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 8; ctx.fillText(w, xx, y); xx += ws[i] + gap; });
    ctx.restore(); }
  const bg = (ctx, k, lt, o = {}) => { if (!k) return black(ctx); if (CLIPN[k]) return BEAT_KINDS.clipx.draw(ctx, 0, lt, 0, [k], { dark: o.dark ?? .5, bw: o.bw }); full(ctx, k, lt, { z0: o.z0 ?? 1.18, z1: o.z1 ?? 1.06, dur: o.dur ?? 1.2, dark: o.dark ?? .5, bw: o.bw, fx: o.fx, fy: o.fy }); };
  BEAT_KINDS.tt = { cap: 0, draw: (ctx, t, lt, t0, a, o) => { bg(ctx, a[2], lt, o); ttl(ctx, a[0], W / 2, H * (o.y ?? .45), t, t0 + .02, { kick: a[1], red: o.red, size: o.size }); } };
  // a redacted file: black bars slide over the lines
  BEAT_KINDS.redact = { cap: 0, draw: (ctx, t, lt, t0) => { full(ctx, 'redacted', lt, { z0: 1.5, z1: 1.6, fx: .45, fy: .4, dark: .1 });
    for (let i = 0; i < 9; i++) { const p = E.out(clamp((lt - i * .05) / .25)), y = H * (.2 + i * .07), x0 = W * .08, w = W * (.6 + .3 * hash(i)); ctx.fillStyle = '#050505'; ctx.fillRect(x0, y, w * p, H * .035); }
    { const g = ctx.createLinearGradient(0, H * .66, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.35, 'rgba(0,0,0,.9)'); g.addColorStop(1, 'rgba(0,0,0,.95)'); ctx.fillStyle = g; ctx.fillRect(0, H * .66, W, H * .34); }
    ttl(ctx, "THEY DIDN'T SHOW YOU", W / 2, H * .82, t, t0 + .1, { size: .085, red: [2] }); } };
  // WE DO: the bars rip off, real footage underneath
  BEAT_KINDS.reveal = { cap: 0, draw: (ctx, t, lt, t0) => { bg(ctx, 'v_desc1', lt, { dark: .35 });
    for (let i = 0; i < 9; i++) { const p = E.in(clamp((lt - i * .03) / .3)), y = H * (.2 + i * .07); ctx.fillStyle = '#050505'; ctx.fillRect(W * .08 + p * W * 1.2, y, W * .8, H * .035); }
    ttl(ctx, 'WE DO', W / 2, H * .5, t, t0 + .15, { size: .2 }); } };
  // place / person tags
  const tagBox = (ctx, s, x, y, t, t0) => { if (t < t0) return; const size = m() * .045, p = E.out(clamp((t - t0) / .3)); ctx.save(); ctx.font = `700 ${size}px ${F.cond}`; const w = ctx.measureText(s).width + size;
    ctx.beginPath(); ctx.rect(x - w / 2, y - size, w * p, size * 1.6); ctx.clip(); ctx.fillStyle = 'rgba(0,0,0,.85)'; ctx.fillRect(x - w / 2, y - size, w, size * 1.6); ctx.fillStyle = DX.red; ctx.fillRect(x - w / 2, y - size, 6, size * 1.6);
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillText(s, x + 3, y - size * .2); ctx.restore(); };
  BEAT_KINDS.place = { cap: 0, draw: (ctx, t, lt, t0, a) => { bg(ctx, a[1], lt, { dark: .3 }); ttl(ctx, 'EVERY PLACE', W / 2, H * .3, t, t0 - 5, { size: .1 }); tagBox(ctx, a[0], W / 2, H * .62, t, t0 + .05); } };
  BEAT_KINDS.person = { cap: 0, draw: (ctx, t, lt, t0, a) => { dofFocus(ctx, a[1], lt, { fx: .5, fy: .38, cx: .5, cy: .42, r: .3, z0: 1.25, z1: 1.32 }); ttl(ctx, 'EVERY PERSON', W / 2, H * .18, t, t0 - 5, { size: .1 });
    serifName(ctx, a[0], W / 2, H * .7, t, t0 + .05, { size: m() * .07 }); } };
  // BOTH SIDES: a split screen, one story from two countries
  BEAT_KINDS.split = { cap: 0, draw: (ctx, t, lt, t0) => { const p = E.out(clamp(lt / .35));
    cover(ctx, 'eli', 0, 0, W / 2, H, { z: 1.1 + lt * .02, dark: .2 }); cover(ctx, 'hafpar', W / 2, 0, W / 2, H, { z: 1.2 + lt * .02 });
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = DX.red; ctx.fillRect(W / 2 - 3, H * (1 - p) / 2, 6, H * p);
    tagBox(ctx, 'ISRAEL SAYS', W * .25, H * .7, t, t0 + .15); tagBox(ctx, 'SYRIA SAYS', W * .75, H * .7, t, t0 + .3);
    ttl(ctx, 'BOTH SIDES', W / 2, H * .3, t, t0 + .02, { size: .13 }); } };
  // NO FILTERS: a heavily filtered photo snaps to clean
  BEAT_KINDS.nofilt = { cap: 0, draw: (ctx, t, lt, t0) => { const snap = t >= T('N09', 'filters.') - .05;
    cover(ctx, 'titanic', 0, 0, W, H, snap ? { z: 1.15 - lt * .02, bw: false } : { z: 1.3, blur: 18, sat: 3, contrast: 1.8, bw: false, invert: hash(Math.floor(t * 12)) > .7 });
    if (!snap) { ctx.fillStyle = 'rgba(255,40,120,.25)'; ctx.fillRect(0, 0, W, H); }
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, W, H); ttl(ctx, 'NO FILTERS', W / 2, H * .45, t, t0 + .02, { size: .17, red: [1] }); flashK(ctx, t, T('N09', 'filters.') - .05, .25); } };
  // comment section: real-looking thread, each comment with emoji + topic picture
  const CM = [['@curious.mind', 'The Titanic \u{1F6A2}', 'titanic'], ['@nightowl_92', 'Area 51 \u{1F47D}', 'area51b'], ['@space.kid', 'Black holes \u{1F573}\u{FE0F}', 'blackhole'],
    ['@dalal.street', 'Harshad Mehta \u{1F4C8}', 'harshad'], ['@desert.files', 'The pyramids \u{1F3DC}\u{FE0F}', 'pyramids']];
  const CMW = ['Titanic.', '51.', 'holes.', 'Mehta.', 'pyramids.'];
  BEAT_KINDS.cmts = { cap: 0, draw: (ctx, t, lt, t0) => { const ki = Math.max(0, CMW.filter(w => t >= T('N11', w) - .4).length - 1);
    full(ctx, CM[ki][2], lt, { z0: 1.2, z1: 1.3, dur: 8, blur: 14, dark: .55, bw: false });
    const w = W * .9, x = (W - w) / 2, y0 = H * .2, rh = m() * .16; ctx.save(); ctx.fillStyle = 'rgba(18,18,20,.92)'; ctx.beginPath(); ctx.roundRect(x, y0, w, rh * 5.9, 34); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `700 ${m() * .042}px ${F.inter}`; ctx.textAlign = 'center'; ctx.fillText('Comments', W / 2, y0 + rh * .45); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(x, y0 + rh * .7, w, 2); ctx.restore();
    CM.forEach(([u, s, k], i) => { const ts = i ? T('N11', CMW[i]) - .45 : t0 + .25; if (t < ts) return; const p = E.back(clamp((t - ts) / .3)), y = y0 + rh * (.9 + i), cx = x + rh * .55;
      ctx.save(); ctx.globalAlpha = clamp((t - ts) / .15); ctx.translate(0, (1 - p) * 40);
      const g = ctx.createLinearGradient(cx - 30, y, cx + 30, y + 60); g.addColorStop(0, ['#F58529', '#5B51D8', '#2BB673', '#E1306C', '#FCAF45'][i]); g.addColorStop(1, '#833AB4');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, y + rh * .42, rh * .3, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = `600 ${m() * .028}px ${F.inter}`; ctx.fillText(u + '   ' + (i + 1) + 'm', cx + rh * .5, y + rh * .3);
      ctx.fillStyle = '#fff'; ctx.font = `600 ${m() * .042}px ${F.inter}, Emoji`; ctx.fillText(s, cx + rh * .5, y + rh * .68);
      const tw = rh * .78, tx = x + w - tw - rh * .55; ctx.save(); ctx.beginPath(); ctx.roundRect(tx, y + rh * .05, tw, tw, 14); ctx.clip(); cover(ctx, k, tx, y + rh * .05, tw, tw, { bw: false }); ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 3; const hx = x + w - rh * .3, hy = y + rh * .45; ctx.beginPath(); ctx.moveTo(hx, hy + 10); ctx.bezierCurveTo(hx - 22, hy - 6, hx - 10, hy - 20, hx, hy - 8); ctx.bezierCurveTo(hx + 10, hy - 20, hx + 22, hy - 6, hx, hy + 10); ctx.stroke();
      ctx.restore(); });
    ttl(ctx, 'COMMENT YOUR TOPIC', W / 2, H * .12, t, t0 + .02, { size: .072, red: [2] }); } };
  // case file: the commented topic becomes a file
  BEAT_KINDS.casefile = { cap: 0, draw: (ctx, t, lt, t0) => { full(ctx, 'pyramids', lt, { blur: 16, dark: .65, z0: 1.3, z1: 1.35, bw: false }); const w = m() * .82, h = w * .74, x = W / 2 - w / 2, y = H * .42 - h / 2, p = E.out(clamp(lt / .35));
    ctx.save(); ctx.translate(0, (1 - p) * 140); ctx.rotate((1 - p) * -.04); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.fillStyle = '#C9A86A'; ctx.beginPath(); ctx.roundRect(x, y - h * .08, w * .38, h * .12, 12); ctx.fill(); ctx.fillStyle = '#D8BC80'; ctx.fillRect(x, y, w, h); ctx.shadowBlur = 0;
    ctx.save(); ctx.translate(x + w * .62, y + h * .12); ctx.rotate(.05); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w * .32, w * .32); cover(ctx, 'titanic', w * .015, w * .015, w * .29, w * .29, {}); ctx.restore();
    ctx.fillStyle = '#3a2c12'; ctx.font = `700 ${w * .075}px ${F.cond}`; ctx.fillText('CASE FILE #001', x + w * .06, y + h * .2); ctx.font = `400 ${w * .042}px ${F.mono}`;
    ['SUBJECT: YOUR TOPIC', 'SOURCES: ARCHIVES', 'SIDES: BOTH', 'STATUS: OPEN'].forEach((s, i) => ctx.fillText(s, x + w * .06, y + h * (.36 + i * .1))); ctx.restore();
    stamp(ctx, 'UNFILTERED', W / 2, H * .42 + h * .3, t, T('N12', 'unfiltered'), { size: w * .12, color: DX.red });
    kick(ctx, 'unfiltered case study', W / 2, H * .75, t, T('N12', 'case')); } };
  BEAT_KINDS.brand = { cap: 0, draw: (ctx, t, lt, t0) => { black(ctx); const g = ctx.createRadialGradient(W / 2, H * .45, 0, W / 2, H * .45, H * .5); g.addColorStop(0, 'rgba(120,20,20,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ttl(ctx, 'DAGAR', W / 2, H * .42, t, t0, { size: .2 }); ttl(ctx, 'UNFILTERED', W / 2, H * .42 + m() * .19, t, t0 + .3, { size: .13, red: [0] });
    const p = E.out(clamp((lt - .6) / .4)); ctx.fillStyle = DX.red; ctx.fillRect(W / 2 - m() * .3 * p, H * .42 + m() * .29, m() * .6 * p, 4);
    kick(ctx, 'FOLLOW FOR THE NEXT FILE', W / 2, H * .42 + m() * .38, t, T('N13', 'Follow')); fadeOut(ctx, t, TL.duration, .6); } };
  // world map, pins thrown one after another
  const PINS = [[-98, 39, 'USA'], [-64, -34, 'ARGENTINA'], [-1.5, 52.5, 'UK'], [30.8, 26.8, 'EGYPT'], [38.5, 35, 'SYRIA'], [90, 60, 'RUSSIA'], [78.96, 22.6, 'INDIA']];
  BEAT_KINDS.world = { cap: 0, draw: (ctx, t, lt, t0) => { const d = LINE.N06.start - .3 - t0, st = d / PINS.length; const pr = monoMap(ctx, viewAt([[t0, { lon: -80, lat: 20, k: 5.6 }], [t0 + d - st, { lon: 100, lat: 32, k: 5.6 }]], t));
    PINS.forEach(([lon, lat, lab], i) => { const [x, y] = pr(lon, lat); dartPin(ctx, x, y, t, t0 + .1 + i * st, lab); }); vignetteK(ctx, .5); ttl(ctx, 'EVERY COUNTRY', W / 2, H * .2, t, t0, { size: .1 }); } };
  const TOP = [['Space.', 'SPACE', 'how far can we go', 'flag'], ['Science.', 'SCIENCE', 'who figured it out', 'einstein'], ['History.', 'HISTORY', 'what really happened', 'ipn_oct20'], ['War.', 'WAR', 'who started it', 'golani67'],
    ['Spies.', 'SPIES', 'who was watching', 'vmorse'], ['Money.', 'MONEY', 'who got rich', 'notes_fan'], ['Crime.', 'CRIME', 'who did it', 'wanted'], ['Tech.', 'TECH', 'who built it', 'eniac'],
    ['Mysteries.', 'MYSTERIES', 'still unsolved', 'ufo'], ['Power.', 'POWER', "who's in charge", 'hafpar'], ['Rockets.', 'ROCKETS', 'who went up', 'v_launch'], ['internet.', 'THE INTERNET', "who's behind it", 'seized']];
  const rows = [
    ['N01', null, 'burst', ['ipn_oct20', 'wanted', 'eli', 'flag', 'iln_suspect', 'armstrong', 'dock', 'titanic'], { rate: 7, cap: 0 }],
    ['N01', 'file.', 'tt', 'HAS A FILE', 'every story', 'fbidocs', { dark: .45, size: .13 }],
    ['N02', null, 'redact', { tr: 'invert' }],
    ['N03', null, 'reveal', { tr: 'cut' }],
    ...TOP.map(([w, s, k, img], i) => ['N04', w, 'tt', s, k, img, { tr: i % 4 === 0 ? 'punch' : 'cut', size: s.length > 9 ? .1 : .14 }]),
    ['N05', null, 'world', { tr: 'invert' }],
    ['N06', null, 'place', 'DAMASCUS, SYRIA', 'dpan', { tr: 'punch' }],
    ['N06', 'place.', 'place', 'MUMBAI, INDIA', 'bse_tower', { tr: 'cut' }],
    [LINE.N06.end + .2, null, 'place', 'THE MOON', 'eagle2', { tr: 'cut' }],
    ['N07', null, 'person', 'Neil Armstrong', 'armstrong', { tr: 'punch' }],
    ['N07', 'person.', 'person', 'Albert Einstein', 'einstein', { tr: 'cut' }],
    [LINE.N07.end + .15, null, 'person', 'Eli Cohen', 'eli', { tr: 'cut' }],
    ['N08', null, 'split', { tr: 'invert' }],
    ['N09', null, 'nofilt', { tr: 'cut' }],
    ['N10', null, 'cmts', { tr: 'tiles' }],
    ['N12', null, 'casefile', { tr: 'invert' }],
    ['N13', null, 'brand', { tr: 'punch' }],
  ];
  const B = buildBeats(rows);
  shot(0, (ctx, t) => { dseq(ctx, t, B); filmFinish(ctx, t, { grain: .1, vig: .4 }); }, { name: 'trailer', lead: 0 });
  cue(T('N01', 'file.'), 'hit', .6); cue(LINE.N02.start, 'thud', .5); cue(T('N03', 'do.'), 'impact', .7);
  TOP.forEach(([w]) => cue(T('N04', w), 'tick', .45));
  PINS.forEach((p, i) => cue(LINE.N05.start - .04 + .1 + i * ((LINE.N06.start - .3 - LINE.N05.start + .04) / PINS.length) + .42, 'thud', .35));
  cue(LINE.N08.start, 'hit', .5); cue(T('N09', 'filters.'), 'impact', .6); cue(T('N12', 'unfiltered'), 'stamp', .7); cue(LINE.N13.start, 'impact', .7);
}
