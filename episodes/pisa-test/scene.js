// Episode: pisa-test — "The Tower That Couldn't Stand Up Straight" (30 s test scene)
'use strict';
const EP = {};

// ---- shared set: Piazza dei Miracoli ----
function piazza(ctx, t, o = {}) {
  sky(ctx, o.skyTop || '#62AEE6', o.skyBot || '#D7EEF8', 0, 1250);
  cloud(ctx, 200 + t * 6, 330, 170, 3); cloud(ctx, 860 - t * 4, 520, 130, 9); cloud(ctx, 560 + t * 3, 180, 110, 21);
  hills(ctx, 1130, '#A9C3AE', 70, 4, 4); hills(ctx, 1190, '#8FB08F', 50, 8, 2);
  if (o.duomo !== false) duomo(ctx, o.duomoX ?? 300, 1255, o.duomoW ?? 520);
  cypress(ctx, 960, 1262, 260); cypress(ctx, 1045, 1262, 200); cypress(ctx, 70, 1262, 230);
  lawn(ctx, 1250);
  // marble path
  ctx.fillStyle = '#E7E0D2'; ctx.beginPath(); ctx.moveTo(380, 1250); ctx.lineTo(700, 1250); ctx.lineTo(1300, H + 200); ctx.lineTo(-200, H + 200); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.06)'; for (let y = 1290; y < H; y += 70) ctx.fillRect(-200, y, W + 400, 4);
  light(ctx);
}
function light(ctx) { sunGlow(ctx, 90, 140, .3); }
function blurred(ctx, px, fn) { ctx.save(); ctx.filter = `blur(${px}px)`; fn(); ctx.restore(); }

// ---- shots ----
// each: {from: [line, word], draw(ctx, t, lt)}  lt = time since shot start
EP.shots = () => [
  { // S1 wide establishing: building site, "1173"
    from: ['L1', 0], draw(ctx, t, lt, sh) {
      ctx.save(); camera(ctx, { s: lerp(1.0, 1.06, E.inOut(prog(lt, 0, sh.dur))), fy: 1150, t });
      piazza(ctx, t);
      pisaTower(ctx, { x: 700, y: 1330, r: 120, levels: .35, lean: 0, scaffold: true, eye: -1 });
      drawCharacter(ctx, CAST.GHERARDO, { x: 560, y: 1420, s: 42, t, armR: { ...ARMS.raise, wob: 14 }, eyes: 'proud', mouth: 'smile', lw: 6 });
      drawCharacter(ctx, CAST.WORKER, { x: 860, y: 1440, s: 40, t, flip: true, armR: 'hold', armL: 'hold', eyes: 'dots', lw: 6, blinkPhase: 1 });
      ctx.restore();
      bigNumber(ctx, '1173', W / 2, 420, popScale(t, wt('L1', '1173') - .05, .3));
    }
  },
  { // S2 Consul with the plan of a perfectly straight tower
    from: ['L1', 'the'], draw(ctx, t, lt, sh) {
      ctx.save(); camera(ctx, { s: lerp(1.0, 1.05, E.inOut(prog(lt, 0, sh.dur))), fy: 800, t });
      blurred(ctx, 7, () => piazza(ctx, t, { duomoX: 760, duomoW: 640 }));
      drawCharacter(ctx, CAST.RANIERI, { x: 540, y: 1700, s: 245, t, armL: 'hold', armR: 'hold', eyes: 'proud', mouth: t > wt('L1', 'beautiful') ? 'grin' : 'smile' });
      // the blueprint: a perfectly straight tower
      ctx.save(); ctx.translate(540, 1240); ctx.rotate(-.04);
      inkFill(ctx, c => c.roundRect(-210, -300, 420, 380, 14), '#2F6DB5', 11);
      ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 2; for (let x = -190; x < 210; x += 40) { ctx.beginPath(); ctx.moveTo(x, -290); ctx.lineTo(x, 70); ctx.stroke(); }
      ctx.strokeStyle = '#EAF4FF'; ctx.lineWidth = 6; ctx.strokeRect(-55, -255, 110, 300); for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-62, -255 + i * 37); ctx.lineTo(62, -255 + i * 37); ctx.stroke(); }
      ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.moveTo(0, -285); ctx.lineTo(0, 60); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = '700 30px Poppins'; ctx.fillStyle = '#EAF4FF'; ctx.textAlign = 'center'; ctx.fillText('100% STRAIGHT', 0, 32 + 25);
      inkFill(ctx, c => c.roundRect(-232, -318, 40, 420, 20), '#E9E2CF', 10); inkFill(ctx, c => c.roundRect(192, -318, 40, 420, 20), '#E9E2CF', 10);
      ctx.restore();
      // hands on top of the scroll
      handAt(ctx, 335, 1120, 'fist', 3.1, 245, true); handAt(ctx, 745, 1120, 'fist', 0, 245, false);
      ctx.restore();
      const b = wt('L1', 'beautiful'); if (t > b) { sparkle(ctx, 300, 580, 1.4, t); sparkle(ctx, 820, 470, 1.1, t + 1); sparkle(ctx, 760, 760, .8, t + 2); }
    }
  },
  { // S3 three floors later... it leans
    from: ['L2', 0], draw(ctx, t, lt, sh) {
      const lean0 = wt('L2', 'leaning'); const k = prog(t, lean0 - .1, lean0 + .55);
      const lean = .11 * E.elastic(k);
      ctx.save(); camera(ctx, { s: lerp(1.0, 1.04, E.inOut(prog(lt, 0, sh.dur))) * snap(t, lean0, .14, 1.2), fy: 1050, t, shake: t > lean0 && t < lean0 + .35 ? 9 : 0 });
      piazza(ctx, t, { duomoX: 220, duomoW: 460 });
      pisaTower(ctx, { x: 600, y: 1390, r: 175, levels: 3, lean, scaffold: true, eye: -1 });
      drawCharacter(ctx, CAST.GHERARDO, { x: 260, y: 1520, s: 62, t, eyes: t > lean0 ? 'shock' : 'dots', mouth: t > lean0 ? 'open' : 'beak', armR: t > lean0 ? 'raise' : 'down', lw: 7 });
      ctx.restore();
      strapCard(ctx, '5 YEARS LATER', W / 2, 330, popScale(t, sh.start + .05, .25), { size: 78 });
    }
  },
  { // S4 consul: "Is it supposed to do that?"
    from: ['L3', 0], draw(ctx, t, lt, sh) {
      ctx.save(); camera(ctx, { s: lerp(1.0, 1.05, E.inOut(prog(lt, 0, sh.dur))), fy: 800, t });
      blurred(ctx, 5, () => { piazza(ctx, t, { duomoX: 120, duomoW: 380 }); pisaTower(ctx, { x: 790, y: 1330, r: 125, levels: 3, lean: .11, scaffold: true }); });
      drawCharacter(ctx, CAST.RANIERI, { x: 360, y: 1780, s: 235, t, eyes: 'squint', talk: t < TL.byId.L3.end, mouth: 'flat', armR: 'point', armL: 'hip' });
      ctx.restore();
    }
  },
  { // S5 builder: "Uh... yes?"
    from: ['L4', 0], draw(ctx, t, lt, sh) {
      const z = snap(t, TL.byId.L4.end - .15, .12, 3);
      ctx.save(); camera(ctx, { s: lerp(1.0, 1.04, E.inOut(prog(lt, 0, sh.dur))) * z, fy: 760, t });
      blurred(ctx, 6, () => piazza(ctx, t, { duomoX: 780, duomoW: 560 }));
      drawCharacter(ctx, CAST.GHERARDO, { x: 540, y: 1720, s: 255, t, eyes: 'nervous', talk: t < TL.byId.L4.end, mouth: 'wobbly', armL: 'palmUp', armR: 'palmUp', sweat: true });
      ctx.restore();
    }
  },
  { // S6 cross-section: soft clay
    from: ['L5', 0], draw(ctx, t, lt, sh) {
      const gy = 980; const sink = 70 * E.inOut(prog(lt, .2, sh.dur));
      ctx.save(); camera(ctx, { s: lerp(1.04, 1.0, E.inOut(prog(lt, 0, sh.dur))), fy: 1000, t });
      sky(ctx, '#62AEE6', '#D7EEF8', 0, gy); cloud(ctx, 260, 300, 150, 5); hills(ctx, gy - 40, '#A9C3AE', 50, 2, 3);
      soilSection(ctx, gy, t);
      // tower base with its shallow 3 m foundation, sinking into clay
      pisaTower(ctx, { x: 540, y: gy + 40, r: 150, levels: 3, lean: .02 + sink / 900, sink, eye: 4 });
      ctx.save(); ctx.translate(540, gy + 40 + sink); ctx.rotate(.02 + sink / 900); inkFill(ctx, c => c.rect(-175, 0, 350, 58), '#B7AE9C', 8, '#5B5245'); ctx.restore();
      // labels
      mapLabel(ctx, 'SOFT CLAY', 760, gy + 380, 64, '#FFD9F0');
      mapLabel(ctx, 'FOUNDATION: 3 m', 300, gy + 120 + sink, 36);
      curvedArrow(ctx, 240, gy + 150 + sink, 380, gy + 70 + sink, -.2, popScale(t, sh.start + .3, .3) * 1);
      ctx.restore();
    }
  },
  { // S7 ...on pudding
    from: ['L5', 'basically'], draw(ctx, t, lt, sh) {
      const p = wt('L5', 'pudding');
      ctx.save(); camera(ctx, { s: lerp(1.0, 1.06, E.inOut(prog(lt, 0, sh.dur))) * snap(t, p, .1, 2), fy: 1000, t });
      // sunburst gag background
      ctx.fillStyle = '#FFE08A'; ctx.fillRect(-W, -H, W * 3, H * 3); ctx.save(); ctx.translate(W / 2, 1000); ctx.rotate(t * .2); ctx.fillStyle = '#FFC94D'; for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1800, -220); ctx.lineTo(1800, 220); ctx.fill(); i++; } ctx.restore();
      const wob = t > p - .1 ? 1.4 : .35;
      ctx.save(); ctx.translate(540, 1330); ctx.transform(1, 0, Math.sin(t * 13) * .08 * wob, 1, 0, 0);
      pudding(ctx, 0, 0, 1.25, t, 0);
      pisaTower(ctx, { x: 0, y: -232, r: 92, levels: 3, lean: .11 + Math.sin(t * 13) * .05 * wob, eye: 1 });
      ctx.restore(); ctx.restore();
    }
  },
  { // S8 map: almost a century of war with Genoa, Lucca, Florence
    from: ['L6', 0], draw(ctx, t, lt, sh) {
      const m = { x: -250, y: 420, w: 1600 };
      ctx.save(); camera(ctx, { s: lerp(1.0, 1.05, E.inOut(prog(lt, 0, sh.dur))), fy: 900, t });
      tuscanyMap(ctx, m, t);
      const P = n => mapXY(...CITIES[n], m);
      const f = wt('L6', 'fighting');
      curvedArrow(ctx, P('genoa')[0] + 60, P('genoa')[1] + 40, P('pisa')[0] - 40, P('pisa')[1] - 20, .25, prog(t, f - .1, f + .35));
      curvedArrow(ctx, P('florence')[0], P('florence')[1] + 60, P('pisa')[0] + 40, P('pisa')[1] + 50, -.3, prog(t, f + .1, f + .55));
      curvedArrow(ctx, P('lucca')[0] + 20, P('lucca')[1] - 130, P('pisa')[0] + 20, P('pisa')[1] - 60, -.4, prog(t, f + .25, f + .7));
      flag(ctx, P('genoa')[0] + 40, P('genoa')[1], 'genoa', t, .62); mapLabel(ctx, 'GENOA', P('genoa')[0] + 90, P('genoa')[1] + 50, 40);
      flag(ctx, P('lucca')[0] + 30, P('lucca')[1] - 40, 'lucca', t + .5, .55); mapLabel(ctx, 'LUCCA', P('lucca')[0] + 100, P('lucca')[1] - 190, 40);
      flag(ctx, P('florence')[0], P('florence')[1], 'florence', t + 1, .62); mapLabel(ctx, 'FLORENCE', P('florence')[0] - 30, P('florence')[1] + 50, 40);
      drawCharacter(ctx, CAST.RANIERI, { x: P('pisa')[0] - 190, y: P('pisa')[1] + 170, s: 50, t, eyes: 'angry', mouth: 'open', armR: { ...ARMS.raise, wob: 18 }, lw: 6 });
      flag(ctx, P('pisa')[0] - 10, P('pisa')[1] + 40, 'pisa', t + 1.5, .55); mapLabel(ctx, 'PISA', P('pisa')[0] + 20, P('pisa')[1] + 85, 46);
      crossedSwords(ctx, P('pisa')[0] + 150, P('pisa')[1] - 150, popScale(t, f, .3) * .7, t);
      ctx.restore();
      const c0 = wt('L6', 'century'); const yr = Math.round(lerp(1178, 1272, E.inOut(prog(t, c0 - .2, TL.byId.L6.end)))); bigNumber(ctx, String(yr), W / 2, 330, popScale(t, c0 - .25, .25), '#C8202B', 170);
    }
  },
  { // S9 the long pause — soil settles; accidental genius
    from: ['L7', 0], draw(ctx, t, lt, sh) {
      const day = (Math.sin(lt * 7) + 1) / 2; const gy = 1260; const st = wt('L7', 'settle');
      ctx.save(); camera(ctx, { s: lerp(1.0, 1.05, E.inOut(prog(lt, 0, sh.dur))), fy: 1000, t });
      sky(ctx, mix('#1B2550', '#62AEE6', day), mix('#3B3F7A', '#D7EEF8', day), 0, gy);
      ctx.save(); ctx.globalAlpha = (1 - day) * (1 - day); ctx.fillStyle = '#FFF6D8'; ctx.beginPath(); ctx.arc(820, 260, 60, 0, 7); ctx.fill(); ctx.restore();
      ctx.save(); ctx.globalAlpha = day * day; ctx.fillStyle = '#FFE27A'; ctx.beginPath(); ctx.arc(250, 250, 70, 0, 7); ctx.fill(); ctx.restore();
      hills(ctx, gy - 90, mix('#4A5A6A', '#A9C3AE', day), 60, 4, 3); cypress(ctx, 960, gy, 240, mix('#1F3326', '#2F5B36', day));
      lawn(ctx, gy, mix('#3E5E30', '#7DB84C', day));
      pisaTower(ctx, { x: 560, y: gy + 20, r: 150, levels: 3, lean: .11, scaffold: true });
      // cobwebs on the scaffold + a growing weed
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.translate(380, gy - 600); for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(i * .4) * 90, Math.sin(i * .4) * 90); ctx.stroke(); } for (let r = 25; r < 90; r += 22) { ctx.beginPath(); ctx.arc(0, 0, r, 0, 1.6); ctx.stroke(); } ctx.restore();
      // settle meter in the soil
      const k = E.inOut(prog(t, sh.start, st + .2));
      inkFill(ctx, c => c.roundRect(240, gy + 230, 600, 70, 35), '#3a2b20', 9); inkFill(ctx, c => c.roundRect(250, gy + 240, 580 * k, 50, 25), '#62C25B', 0);
      mapLabel(ctx, k < 1 ? 'SOIL SETTLING…' : 'SOIL SETTLED ✓', W / 2, gy + 360, 46, k < 1 ? '#fff' : '#9BF08F');
      drawCharacter(ctx, CAST.GHERARDO, { x: 250, y: gy + 170, s: 80, t, eyes: t > wt('L7', 'saved') ? 'smug' : 'closed', mouth: t > wt('L7', 'saved') ? 'smirk' : 'flat', armR: t > wt('L7', 'saved') ? 'thumb' : 'down', lw: 8, blink: false });
      ctx.restore();
    }
  },
  { // S10 the fix: upper floors taller on one side
    from: ['L8', 0], draw(ctx, t, lt, sh) {
      const g = E.inOut(prog(lt, .1, sh.dur - .2)); const tl = wt('L8', 'taller');
      ctx.save(); camera(ctx, { s: lerp(1.08, .98, g), fy: 900, t });
      piazza(ctx, t, { duomoX: 170, duomoW: 380 });
      pisaTower(ctx, { x: 600, y: 1420, r: 120, levels: 3 + 4 * g, lean: .11, curve: .018 * g, scaffold: true, eye: 0 });
      ctx.restore();
      // dimension markers: right side taller than left
      const kk = popScale(t, tl - .05, .3);
      if (kk > 0) { ctx.save(); ctx.globalAlpha = clamp(kk); mapLabel(ctx, 'TALLER SIDE →', 640, 560, 50, '#FFD93D'); curvedArrow(ctx, 700, 620, 800, 760, -.2, clamp(kk)); ctx.restore(); }
      drawCharacter(ctx, CAST.WORKER, { x: 210, y: 1560, s: 70, t, armR: 'pointUp', eyes: 'dots', mouth: 'smile', lw: 7 });
    }
  },
  { // S11 the reveal: it's a banana
    from: ['L9', 0], draw(ctx, t, lt, sh) {
      const b = wt('L9', 'banana');
      ctx.save(); camera(ctx, { s: lerp(1.0, 1.05, E.inOut(prog(lt, 0, sh.dur))) * snap(t, b, .12, 5), fy: 1000, t, shake: t > b && t < b + .25 ? 8 : 0 });
      piazza(ctx, t, { duomoX: 230, duomoW: 470 });
      pisaTower(ctx, { x: 620, y: 1420, r: 112, levels: 8, lean: .12, curve: .03, eye: 0 });
      const k = popScale(t, b - .05, .35);
      if (k > 0) banana(ctx, 900, 1060, .85 * k, .2);
      drawCharacter(ctx, CAST.RANIERI, { x: 250, y: 1640, s: 90, t, eyes: t > b ? 'shock' : 'squint', mouth: t > b ? 'open' : 'flat', armR: t > b ? 'raise' : 'hip', armL: 'hip', lw: 8 });
      ctx.restore();
      flash(ctx, t, b - .02, .14);
    }
  },
];

// ---- SFX cues (times resolved from the voice timeline) ----
EP.sfx = () => {
  const c = [];
  const add = (t, name, gain = 1) => c.push({ t: +t.toFixed(3), name, gain });
  add(wt('L1', '1173') - .05, 'pop');
  add(wt('L1', 'the'), 'whoosh', .6); add(wt('L1', 'beautiful'), 'sparkle', .7);
  add(TL.byId.L2.start, 'pop', .8); add(wt('L2', 'leaning') - .1, 'creak'); add(wt('L2', 'leaning'), 'scratch', .9);
  add(TL.byId.L4.end - .1, 'bwomp', .8);
  add(TL.byId.L5.start, 'whoosh', .5); add(wt('L5', 'basically'), 'boing', .9);
  add(TL.byId.L6.start, 'whoosh', .6); add(wt('L6', 'fighting'), 'clang'); add(wt('L6', 'century') - .25, 'pop', .7); add(wt('L6', 'century'), 'ticks', .5);
  add(TL.byId.L7.start, 'whoosh', .5); add(wt('L7', 'saved'), 'ding', .7); add(wt('L7', 'settle'), 'pop', .7);
  add(TL.byId.L8.start, 'whoosh', .5); add(TL.byId.L8.start + .2, 'build', .6); add(wt('L8', 'taller'), 'pop', .6);
  add(wt('L9', 'banana') - .03, 'sting');
  return c;
};
// moments where the music bed ducks (silence before a reveal)
EP.duck = () => [[wt('L9', 'banana') - .5, wt('L9', 'banana') - .02]];
