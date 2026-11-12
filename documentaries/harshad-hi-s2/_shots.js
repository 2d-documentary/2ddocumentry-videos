function scenes() {
  shot(['B01', 'Kya'], (ctx, t, lt) => { yellowBG(ctx); suitcase(ctx, CX, 1050, 1.3, prog(t, T('B01', 'suitcase'), T('B01', 'suitcase') + .5));
    punch(ctx, '1 CRORE', CX, 420, t, T('B01', 'crore'), { font: F.bebas, size: 190, color: '#111' }); punch(ctx, '1 SUITCASE?', CX, 600, t, T('B01', 'suitcase'), { font: F.bebas, size: 170, color: HM.blood });
    timeStamp(ctx, '1993', 120, 330, t, T('B01', '1993'), { size: 100 }); capBand(ctx); fadeIn(ctx, t, 0, .3); }, { lead: .3, name: 'b-hook' });
  cue(T('B01', 'suitcase'), 'thud', .8); cue(T('B01', '1993'), 'ding', .5);
  shot(['B02', 'Big'], (ctx, t, lt) => { board(ctx, t); figCard(ctx, CX, 820, 460, 620, 'HARSHAD MEHTA', prog(t, T('B02', 'Big'), T('B02', 'Big') + .3), { specs: true });
    if (t > T('B02', 'arrest')) handcuffs(ctx, CX, 1300, .7, prog(t, T('B02', 'arrest'), T('B02', 'arrest') + .3)); if (t > T('B02', 'bail')) stamp(ctx, 'BAIL', CX, 820, t, T('B02', 'bail'), { size: 160, color: HM.green });
    text(ctx, 'ILLUSTRATION', CX, 1170, { font: F.mono, size: 20, color: 'rgba(255,255,255,.45)', align: 'center' }); }, { name: 'b-bail' });
  cue(T('B02', 'arrest'), 'thud', .8); cue(T('B02', 'bail'), 'stamp', .8);
  shot(['B03', 'June'], (ctx, t, lt) => { darkBG(ctx, t, '#0E1626', '#03050A'); timeStamp(ctx, 'JUNE 1993', 120, 330, t, T('B03', 'June'), { size: 90 });
    if (t > T('B03', 'press')) { pill(ctx, 'PRESS CONFERENCE', 120, 480, { bg: HM.blood, size: 46 }); for (let i = 0; i < 4; i++) flash(ctx, t, T('B03', 'press') + i * .45, .06); }
    if (t > T('B03', 'Ram')) { frame(ctx, 'jethmalani', 240, 620, 600, 700, { grade: 'color', label: 'RAM JETHMALANI · VAKEEL', labelBg: '#222' }); cred(ctx, 'jethmalani'); } }, { name: 'b-press' });
  cue(T('B03', 'press'), 'shutter', .8); cue(T('B03', 'press') + .45, 'shutter', .6);
  shot(['B04', 'Aur'], (ctx, t, lt) => { pBG(ctx, 'rao_fort', lt, { grade: 'warm', shade: .35, fx: .62 }); kicker(ctx, 'HARSHAD KA DAAVA', 120, 330, t, T('B04', 'daava'), { color: HM.gold });
    lowerTag(ctx, 'P. V. NARASIMHA RAO', 'Prime Minister, 1991–96', t, T('B04', 'Narasimha'), { y: 1400 }); if (t > T('B04', 'crore')) rsText(ctx, '1 CRORE?', CX, 560, { size: 150, glow: 'rgba(255,190,60,.6)' }); cred(ctx, 'rao_fort'); }, { name: 'b-claim' });
  cue(T('B04', 'crore'), 'cash', .6);
  shot(['B05', 'Saboot'], (ctx, t, lt) => { darkBG(ctx, t, '#14100A', '#000'); pill(ctx, 'SABOOT?', CX, 420, { align: 'center', bg: '#333', size: 60 }); suitcase(ctx, CX, 900, 1.5, prog(t, T('B05', 'suitcase'), T('B05', 'suitcase') + .4));
    text(ctx, 'ILLUSTRATION', CX, 1220, { font: F.mono, size: 20, color: 'rgba(255,255,255,.45)', align: 'center' }); }, { name: 'b-case' });
  cue(T('B05', 'suitcase'), 'thud', .7);
  shot(['B06', 'TV,'], (ctx, t, lt) => { pBG(ctx, 'parliament', lt, { grade: 'duo', tint: 'navy', tintAmt: .5, shade: .4 });
    [['TV', 'TV,', 430], ['AKHBAAR', 'akhbaar,', 650], ['PARLIAMENT', 'Parliament.', 870]].forEach(([s, w, y]) => { if (t > T('B06', w)) punch(ctx, s, CX, y, t, T('B06', w), { font: F.bebas, size: 150, color: '#fff', shadow: 30 }); });
    if (t > T('B06', 'baat.')) pill(ctx, 'HAR JAGAH EK HI BAAT', CX, 1120, { align: 'center', bg: HM.blood, size: 50 }); cred(ctx, 'parliament'); }, { name: 'b-buzz' });
  ['TV,', 'akhbaar,', 'Parliament.'].forEach(w => cue(T('B06', w), 'whoosh', .5));
  shot(['B07', 'Narasimha'], (ctx, t, lt) => { pBG(ctx, 'rao_tv', lt, { grade: 'duo', tint: 'navy', tintAmt: .5, shade: .3, fx: .45 }); if (t > T('B07', 'inkaar')) stamp(ctx, 'AAROP SE INKAAR', CX, 1200, t, T('B07', 'inkaar'), { size: 100, color: '#fff' }); cred(ctx, 'rao_tv'); }, { name: 'b-deny' });
  cue(T('B07', 'inkaar'), 'stamp', .8);
  shot(['B08', 'Aur'], (ctx, t, lt) => { gridBG(ctx, t, '#0A1322'); kicker(ctx, 'CBI JAANCH', 140, 700, t, T('B08', 'CBI'), { color: HM.gold }); dataRow(ctx, 'PAKKA SABOOT', 'NAHI MILA', 150, 820, t, T('B08', 'saboot'), { size: 130, gap: 150, color: HM.blood }); }, { name: 'b-cbi' });
  cue(T('B08', 'saboot'), 'hit', .5);
  shot(['B09', 'Sach'], (ctx, t, lt) => { darkBG(ctx, t); glowText(ctx, 'SACH?', CX, 640, { font: F.bebas, size: 220, color: HM.gold, align: 'center', glow: 'rgba(255,195,77,.6)' });
    glowText(ctx, 'YA CHAAL?', CX, 880, { font: F.bebas, size: 200, color: HM.blood, align: 'center', glow: 'rgba(232,64,47,.6)', alpha: prog(t, T('B09', 'Sach') + .4, T('B09', 'Sach') + .8) });
    if (t > T('B09', 'Behas')) text(ctx, 'BEHAS AAJ TAK JAARI', CX, 1100, { font: F.osw, size: 52, color: '#fff', align: 'center', weight: 600, ls: 6 }); }, { name: 'b-q' });
  cue(T('B09', 'Sach'), 'whoosh', .5);
  ctaShot('B10', 'SUITCASE KA SACH', 'POORI KAHANI EDUANIMHUB PAR'); finish();
}
