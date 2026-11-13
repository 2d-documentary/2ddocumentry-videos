function scenes() {
  const tag = (ctx, k) => { const c = credit(k); if (c) sourceTag(ctx, c.length > 70 ? c.slice(0, 68) + '…' : c); };
  const cards = [['falconheavy', -260, -420, 900], ['fh_boosters', 300, 380, 1400], ['roadster_space', -300, 300, 2000], ['p_royal', 280, -360, 2600], ['starship_ift5', -240, -60, 3200], ['modelS', 260, 160, 3800], ['f9_lz1', -200, 420, 4400], ['mars', 0, 0, 5200]]
    .map(([key, x, y, z], i) => ({ key, x, y, z, w: 620, rot: (i % 2 ? .06 : -.05) }));
  const gold = ['#FFF3C4', '#E0A53A'];

  // A01: 3D fly-through + extruded 2018
  shot(['A01', 'In'], (ctx, t, lt) => { space3D(ctx, t, lt, cards, { speed: 1300 }); aeText(ctx, '2018', CX, 1020, lt, { size: 260, extrude: 18, grad: gold, side: '#6B4A12', glow: 'rgba(255,200,90,.6)', stagger: .07, shine: .6 }); kGrade(ctx, t); kIn(ctx, lt, 'black', .3); }, { lead: .35, capY: .8 });
  shot(['A01', 'most'], (ctx, t, lt) => { shake(ctx, t, 8); parallax(ctx, 'falconheavy', lt, { z0: 1.2, fx: .3, fy: .45, dx: .03 }); kGrade(ctx, t, { bloom: .45 }); tag(ctx, 'falconheavy'); zoomBlur(ctx, lt); }, { capY: .78 });
  // A02: Musk cut-out, then the car
  shot(['A02', 'And'], (ctx, t, lt) => { parallax(ctx, 'p_fh_press', lt, { z0: 1.1, fy: .3, grade: 'mood' }); kGrade(ctx, t); tag(ctx, 'p_fh_press'); whipSmear(ctx, lt); }, { capY: .8 });
  shot(['A02', 'car'], (ctx, t, lt) => { textMatte(ctx, 'CAR', 'roadster_space', lt, { fx: .6, fy: .2, z0: 1.3 }); stars(ctx, t, 80, 2, .4); kGrade(ctx, t); zoomBlur(ctx, lt, .3, -1); }, { capY: .8 });
  // A03: concrete block vs boring
  shot(['A03', 'See'], (ctx, t, lt) => { bgGrad(ctx, '#2A2A2E', '#08080A', 'r'); cube3D(ctx, CX, 900, 230, lt * 1.4 + .5, .5 + Math.sin(lt) * .1); text(ctx, 'TEST MASS', CX, 1300, { font: F.osw, size: 44, color: 'rgba(255,255,255,.5)', align: 'center', ls: 10, weight: 600 }); kGrade(ctx, t); kIn(ctx, lt, 'zoom'); }, { capY: .3, capMode: 'caps' });
  shot(['A03', 'Elon'], (ctx, t, lt) => { parallax(ctx, 'p_laugh', lt, { z0: 1.15, fy: .35, grade: 'mood' }); aeText(ctx, 'boring.', CX, 1450, lt - .5, { size: 170, italic: true, font: F.playI, stagger: .06 }); kGrade(ctx, t); tag(ctx, 'p_laugh'); whipSmear(ctx, lt, .25, -1); }, { cap: false });
  // A04: TESLA matte, then Starman parallax
  shot(['A04', 'So'], (ctx, t, lt) => { textMatte(ctx, 'TESLA', 'modelS', lt, { fx: .5, fy: .55, z0: 1.2 }); kGrade(ctx, t); kIn(ctx, lt, 'flash'); }, { capY: .8 });
  shot(['A04', 'dummy'], (ctx, t, lt) => { parallax(ctx, 'roadster_space2', lt, { z0: 1.15, fx: .3, dx: .06 }); kGrade(ctx, t, { bloom: .35 }); tag(ctx, 'roadster_space2'); zoomBlur(ctx, lt); }, { capY: .78 });
  // A05: Musk + quote
  shot(['A05', 'Before'], (ctx, t, lt) => { parallax(ctx, 'p_dragon2', lt, { z0: 1.25, fx: .55, fy: .7, grade: 'mood' }); kGrade(ctx, t); tag(ctx, 'p_dragon2'); kIn(ctx, lt, 'zoom'); }, { capY: .3 });
  shot(['A05', 'win'], (ctx, t, lt) => { bgGrad(ctx, '#0E0E12', '#000', 'r'); fog(ctx, t, .2);
    aeText(ctx, '"a win if it', CX, 800, lt, { size: 92, font: F.playI, italic: true, stagger: .025 }); aeText(ctx, 'doesn\'t blow up', CX, 920, lt - .35, { size: 92, font: F.playI, italic: true, stagger: .025 }); aeText(ctx, 'the pad"', CX, 1040, lt - .7, { size: 92, font: F.playI, italic: true, stagger: .025, shine: 1.2 });
    text(ctx, '— Elon Musk, 2017', CX, 1180, { font: F.play, size: 40, color: 'rgba(255,255,255,.6)', align: 'center', alpha: prog(lt, 1, 1.4) }); kGrade(ctx, t); kIn(ctx, lt, 'bar'); }, { cap: false });
  // A06: launch + IT DIDN'T
  shot(['A06', 'Spoiler'], (ctx, t, lt) => { shake(ctx, t, 18); photo(ctx, 'falconheavy', { zoom: 1.5 + lt * .08, fx: .3, fy: .4, grade: 'fire' }); embers(ctx, t, .6); kGrade(ctx, t, { bloom: .5 }); tag(ctx, 'falconheavy'); zoomBlur(ctx, lt, .35); }, { capY: .75 });
  shot(['A06', 'didn\'t'], (ctx, t, lt) => { bgGrad(ctx, '#140806', '#000', 'r'); aeText(ctx, 'IT DIDN\'T.', CX, 1000, lt, { size: 190, font: F.bebas, extrude: 16, grad: ['#FFFFFF', '#FFB36B'], side: '#5A2410', glow: 'rgba(255,140,60,.7)', stagger: .05, ls: 6 }); kGrade(ctx, t); kIn(ctx, lt, 'flash'); }, { cap: false });
  cue(T('A06', 'didn\'t'), 'impact', .6);
  // A07: boosters land side by side
  shot(['A07', 'Two'], (ctx, t, lt) => { parallax(ctx, 'fh_boosters', lt, { z0: 1.25, fx: .5, fy: .45, dx: .02 }); kGrade(ctx, t, { bloom: .4 }); tag(ctx, 'fh_boosters'); kIn(ctx, lt, 'zoom'); }, { capY: .78 });
  shot(['A07', 'exact'], (ctx, t, lt) => { const p = E.inOut(prog(lt, 0, .8)); photo(ctx, 'fh_boosters', { x: 0, y: 0, w: W / 2 - 4, h: H, zoom: 1.5, fx: .33, fy: .45, grade: 'cine' }); photo(ctx, 'fh_boosters', { x: W / 2 + 4, y: 0, w: W / 2 - 4, h: H, zoom: 1.5, fx: .74, fy: .45, grade: 'cine' });
    ctx.fillStyle = '#000'; ctx.fillRect(W / 2 - 4, 0, 8, H); aeText(ctx, 'SAME TIME', CX, 1500, lt - .2, { size: 120, font: F.bebas, ls: 8, color: '#fff' }); kGrade(ctx, t); whipSmear(ctx, lt); }, { cap: false });
  // A08: ocean + 2/3
  shot(['A08', 'third'], (ctx, t, lt, sh) => { shake(ctx, t, prog(t, T('A08', 'slammed'), T('A08', 'slammed') + .1) > 0 ? 20 : 0); ocean(ctx, t); { const ts = T('A08', 'slammed'), p = clamp(prog(t, ts - 1.4, ts)); if (t < ts + .05) rocket(ctx, CX + 60 * (1 - p), lerp(-200, 1060, E.in(p)), 1.6, t, { flame: true, rot: .12 * (1 - p) }); } splash(ctx, CX, 1050, t, T('A08', 'slammed')); kGrade(ctx, t); kIn(ctx, lt, 'zoom'); }, { capY: .3 });
  cue(T('A08', 'slammed'), 'impact', .8);
  shot(['A08', 'Hey'], (ctx, t, lt) => { bgGrad(ctx, '#0A0C14', '#000', 'r'); aeText(ctx, '2 / 3', CX, 1020, lt, { size: 300, font: F.play, extrude: 20, grad: gold, side: '#6B4A12', glow: 'rgba(255,200,90,.6)', stagger: .08 }); kGrade(ctx, t); kIn(ctx, lt, 'bar'); }, { capY: .7 });
  // A09: car still out there
  shot(['A09', 'And'], (ctx, t, lt) => { space3D(ctx, t, lt, [{ key: 'roadster_space', x: 0, y: 0, z: 1500, w: 900, spin: .05 }, { key: 'roadster_space2', x: 360, y: -500, z: 2600, w: 600 }, { key: 'mars', x: -320, y: 520, z: 3200, w: 600, h: 600 }], { speed: 500 }); kGrade(ctx, t, { bloom: .4 }); zoomBlur(ctx, lt); }, { capY: .82 });
  shot(['A09', 'looping'], (ctx, t, lt) => { bgGrad(ctx, '#05070D', '#000', 'r'); stars(ctx, t, 160, 3); const sx = CX, sy = 960; const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 160); g.addColorStop(0, '#FFF6D8'); g.addColorStop(.3, '#FFC34D'); g.addColorStop(1, 'rgba(255,150,40,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 160, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(232,33,39,.85)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(sx + 40, sy, 430, 380, 0, 0, 7); ctx.stroke(); ctx.strokeStyle = 'rgba(120,180,255,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, sy, 300, 0, 7); ctx.stroke();
    const a = lt * 1.2; ctx.fillStyle = '#E82127'; ctx.shadowColor = '#E82127'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(sx + 40 + Math.cos(a) * 430, sy + Math.sin(a) * 380, 14, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    text(ctx, 'ROADSTER', sx + 40 + Math.cos(a) * 430, sy + Math.sin(a) * 380 - 30, { font: F.osw, size: 30, color: '#FF8A8A', align: 'center', weight: 600, ls: 4 }); kGrade(ctx, t, { bloom: .4 }); kIn(ctx, lt, 'blur'); }, { capY: .25 });
  // A10: AD matte + end card
  shot(['A10', 'Honestly'], (ctx, t, lt) => { textMatte(ctx, 'AD', 'roadster_space', lt, { size: 760, fx: .62, fy: .3, z0: 1.15 }); kGrade(ctx, t); kIn(ctx, lt, 'flash'); }, { capY: .85 });
  shot(LINE['A10'].end + .5, (ctx, t, lt) => { bgGrad(ctx, '#0A0C14', '#000', 'r'); stars(ctx, t, 120, 2, .5); aeText(ctx, 'Unfiled Films', CX, 920, lt, { size: 120, stagger: .035 });
    const q = Math.max(0, E.back(prog(lt, .6, .9))); ctx.save(); ctx.translate(CX, 1110); ctx.scale(q, q); ctx.fillStyle = '#E62117'; ctx.beginPath(); ctx.roundRect(-250, -62, 500, 124, 62); ctx.fill(); text(ctx, 'SUBSCRIBE', 0, 26, { font: F.osw, size: 64, color: '#fff', align: 'center', weight: 600, ls: 4 }); ctx.restore(); fadeOut(ctx, t, TL.duration, .5); }, { cap: false });
  kfinish();
}
