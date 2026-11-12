function scenes() {
  shot(['C01', 'Ek'], (ctx, t, lt) => { darkBG(ctx, t, '#06130C', '#000'); text(ctx, 'ACC · CEMENT SHARE (APPROX.)', 120, 380, { font: F.osw, size: 40, color: 'rgba(255,255,255,.75)', weight: 600, ls: 6 });
    const p = prog(t, T('C01', '200'), T('C01', '9,000') + .3); const last = lineChart(ctx, 120, 480, 840, 700, [[0, .02], [.3, .08], [.55, .22], [.75, .45], [.9, .72], [1, .95]], p);
    if (t > T('C01', '200')) rsText(ctx, Math.round(lerp(200, 9000, E.inOut(p))).toLocaleString('en-IN'), CX, 1330, { size: 170, color: '#fff' }); fadeIn(ctx, t, 0, .3); }, { lead: .3, name: 'c-hook' });
  cue(T('C01', '200'), 'riser', .6); cue(T('C01', '9,000'), 'cash', .9);
  shot(['C02', 'Cement'], (ctx, t, lt) => { yellowBG(ctx); [['CEMENT: WAHI', 'Cement'], ['FACTORY: WAHI', 'Factory']].forEach(([s, w], i) => { if (t > T('C02', w)) { text(ctx, s, 120, 480 + i * 160, { font: F.bebas, size: 120, color: '#111' }); tick(ctx, 900, 440 + i * 160, 40, prog(t, T('C02', w), T('C02', w) + .4), '#1B7A3A'); } });
    if (t > T('C02', 'daam')) { text(ctx, 'DAAM:', 120, 820, { font: F.bebas, size: 120, color: HM.blood }); const p = prog(t, T('C02', 'aasman'), T('C02', 'aasman') + 1.2); rocket(ctx, 700, 1300 - E.in(p) * 1200, 1, t, { flame: true }); } capBand(ctx); }, { name: 'c-joke' });
  cue(T('C02', 'aasman'), 'whoosh', .9);
  shot(['C03', 'Ye'], (ctx, t, lt) => { pBG(ctx, 'bull_bse', lt, { grade: 'warm', shade: .35, fx: .6 }); lightLeak(ctx, t, .4, 2); if (t > T('C03', 'Harshad')) pill(ctx, 'HARSHAD MEHTA', CX, 420, { align: 'center', bg: '#111', size: 56 });
    punch(ctx, 'BIG BULL', CX, 1250, t, T('C03', 'Big'), { font: F.bebas, size: 220, color: HM.gold, shadow: 30 }); cred(ctx, 'bull_bse'); }, { name: 'c-bull' });
  cue(T('C03', 'Big'), 'impact', .8);
  shot(['C04', 'Worli'], (ctx, t, lt) => { darkBG(ctx, t); photo(ctx, 'worli_sea', { x: 0, y: 200, w: W, h: 600, zoom: 1.05 + lt * .02, grade: 'warm' }); text(ctx, 'SEA-FACE PENTHOUSE', CX, 760, { font: F.bebas, size: 80, color: '#fff', align: 'center', shadow: 20 });
    if (t > T('C04', 'Lexus')) { photo(ctx, 'lexus', { x: 0, y: 820, w: W, h: 600, zoom: 1.05 + lt * .02, grade: 'color' }); text(ctx, 'TOYOTA LEXUS', CX, 1380, { font: F.bebas, size: 80, color: '#fff', align: 'center', shadow: 20 }); }
    sourceTag(ctx, [credit('worli_sea'), credit('lexus')].join(' | ')); }, { name: 'c-life' });
  cue(T('C04', 'Lexus'), 'whoosh', .6);
  shot(['C05', 'Log'], (ctx, t, lt) => { yellowBG(ctx); sedan(ctx, CX, 950, .95, t); for (let i = 0; i < 6; i++) personIcon(ctx, 120 + i * 168, 1300, 2.6, '#222');
    punch(ctx, 'HARSHAD KO NAHI,', CX, 400, t, T('C05', 'Harshad'), { font: F.bebas, size: 120, color: '#111' }); punch(ctx, 'CAR KO.', CX, 560, t, T('C05', 'car'), { font: F.bebas, size: 170, color: HM.blood }); capBand(ctx); }, { name: 'c-joke2' });
  cue(T('C05', 'car'), 'ding', .8);
  shot(['C06', 'Wo'], (ctx, t, lt) => { darkBG(ctx, t, '#03100A', '#000'); screenGrid(ctx, 90, 300, 900, 700, t); crowd(ctx, t, 1380, 7, { s: 2.6, col: 'rgba(30,40,50,.95)' });
    if (t > T('C06', 'desh')) pill(ctx, 'POORA DESH WAHI KHARIDTA', CX, 1150, { align: 'center', bg: HM.blood, size: 46 }); }, { name: 'c-follow' });
  shot(['C07', 'Par'], (ctx, t, lt) => { darkBG(ctx, t, '#1C1408', '#000'); newspaper(ctx, CX, 820, .95, 'SBI KE 500 CRORE\nKAHAN GAYE?', 'Ek broker, bank ka paisa, aur share bazaar', t, T('C07', 'report'), { date: 'BOMBAY · 23 APRIL 1992' });
    timeStamp(ctx, 'APRIL 1992', 120, 300, t, T('C07', 'April'), { size: 80 }); if (t > T('C07', 'bankon')) stamp(ctx, 'BANK KA PAISA', CX, 1340, t, T('C07', 'bankon'), { size: 100, color: HM.blood }); }, { name: 'c-paper' });
  cue(T('C07', 'report'), 'paper', .8); cue(T('C07', 'bankon'), 'stamp', .8);
  shot(['C08', 'Bazaar'], (ctx, t, lt) => { bgGrad(ctx, '#140606', '#000', 'r'); lineChart(ctx, 120, 400, 840, 500, [[0, .95], [.3, .75], [.6, .55], [1, .38]], prog(t, T('C08', 'Bazaar'), T('C08', 'gira.') + .6), { color: HM.blood });
    for (let i = 0; i < 12; i++) personIcon(ctx, 90 + i * 82, 1250, 1.5, `rgba(200,200,210,${.55 - .35 * prog(t, T('C08', 'doob'), T('C08', 'doob') + 1.5)})`);
    text(ctx, 'LAAKHON INVESTORS', CX, 1100, { font: F.osw, size: 52, color: 'rgba(246,240,228,.85)', align: 'center', weight: 500, ls: 6, alpha: prog(t, T('C08', 'laakhon'), T('C08', 'laakhon') + .6) }); }, { name: 'c-crash' });
  cue(T('C08', 'gira.'), 'thud', .7);
  ctaShot('C09', 'BIG BULL KI LEXUS', 'POORI KAHANI EDUANIMHUB PAR'); finish();
}
