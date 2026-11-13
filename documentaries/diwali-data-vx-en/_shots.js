// ---------------------------------------------------------------- episode props (drawn, labelled where illustrative)
function aqiMeter(ctx, x, y, w, h, t, val, blank) { ctx.save(); ctx.fillStyle = '#111214'; ctx.strokeStyle = '#3A3B40'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fill(); ctx.stroke();
  text(ctx, 'PM2.5  ·  UG/M3', x + 34, y + 62, { font: F.type, size: 34, color: VX.dim }); text(ctx, 'LIVE', x + w - 34, y + 62, { font: F.type, size: 30, color: blank ? '#555' : VX.red, align: 'right', alpha: blank ? 1 : (Math.sin(t * 6) > 0 ? 1 : .3) });
  ctx.fillStyle = '#060607'; ctx.fillRect(x + 30, y + 92, w - 60, h - 122);
  if (blank) { text(ctx, '- - -', x + w / 2, y + h * .72, { font: F.bebas, size: 200, color: '#3A3B40', align: 'center' }); text(ctx, 'NO DATA', x + w / 2, y + h - 52, { font: F.type, size: 36, color: VX.red, align: 'center', alpha: Math.sin(t * 5) > -.3 ? 1 : .2 }); }
  else { ctx.save(); ctx.shadowColor = 'rgba(224,55,43,.6)'; ctx.shadowBlur = 30; text(ctx, Math.round(val).toLocaleString('en-IN'), x + w / 2, y + h * .72, { font: F.bebas, size: 220, color: VX.red, align: 'center' }); ctx.restore(); }
  ctx.restore(); }
const DEAD = new Set([0,2,3,5,6,9,11,12,14,15,17,19,20,22,24,25,27,28,30,31,33,34,36,37,38]);
function stationGrid(ctx, x, y, t, t0) { const cols = 8, gap = 112; for (let i = 0; i < 39; i++) { const cx = x + (i % cols) * gap, cy = y + Math.floor(i / cols) * gap; const dead = DEAD.has(i);
  const off = dead && t > t0 + hash(i) * .8; ctx.fillStyle = off ? '#1A1B1E' : '#E9E4DA'; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, 7); ctx.fill();
  if (off) { ctx.strokeStyle = VX.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx - 14, cy - 14); ctx.lineTo(cx + 14, cy + 14); ctx.moveTo(cx + 14, cy - 14); ctx.lineTo(cx - 14, cy + 14); ctx.stroke(); } } }
function rangeGauge(ctx, cx, cy, r, p, t, out) { ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 26; ctx.strokeStyle = '#2A2B30'; ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI); ctx.stroke();
  const g = ctx.createLinearGradient(cx - r, 0, cx + r, 0); g.addColorStop(0, '#E9E4DA'); g.addColorStop(1, VX.red); ctx.strokeStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * clamp(p)); ctx.stroke();
  [['0', Math.PI], ['500', Math.PI * 1.5], ['999', Math.PI * 2]].forEach(([s, a]) => text(ctx, s, cx + Math.cos(a) * (r + 70), cy + Math.sin(a) * (r + 70) + 14, { font: F.type, size: 36, color: VX.dim, align: 'center' }));
  const a = Math.PI + Math.PI * Math.min(1.04, p) + (p >= 1 ? Math.sin(t * 40) * .015 : 0); ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (r - 30), cy + Math.sin(a) * (r - 30)); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 7); ctx.fill(); ctx.restore(); }
function barPair(ctx, x, y, w, t, t0) { const p = E.out(prog(t, t0, t0 + 1.2)); text(ctx, 'NATIONAL STANDARD (24H)', x, y, { font: F.type, size: 32, color: VX.dim }); ctx.fillStyle = '#E9E4DA'; ctx.fillRect(x, y + 24, Math.max(6, w * 60 / 3744), 70); text(ctx, '60', x + 40, y + 80, { font: F.bebas, size: 64, color: '#fff' });
  text(ctx, 'MUNDKA, 2 AM', x, y + 190, { font: F.type, size: 32, color: VX.dim }); ctx.save(); ctx.shadowColor = 'rgba(224,55,43,.6)'; ctx.shadowBlur = 30; ctx.fillStyle = VX.red; ctx.fillRect(x, y + 214, w * p, 70); ctx.restore();
  text(ctx, Math.round(3744 * p).toLocaleString('en-IN'), x + w * p - 10, y + 270, { font: F.bebas, size: 64, color: '#fff', align: 'right' }); }
function dualChart(ctx, x, y, w, h, t, t0) { const p = prog(t, t0, t0 + 1.6); ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(x, y + h * i / 4); ctx.lineTo(x + w, y + h * i / 4); ctx.stroke(); }
  const cap = y + h - h * 1000 / 3800; ctx.setLineDash([10, 10]); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.moveTo(x, cap); ctx.lineTo(x + w, cap); ctx.stroke(); ctx.setLineDash([]); text(ctx, '999 CUT-OFF', x + w, cap - 14, { font: F.type, size: 26, color: VX.dim, align: 'right' });
  const pts = [[0, 180], [.15, 300], [.3, 700], [.42, 1500], [.52, 3744], [.62, 3000], [.75, 2100], [.88, 1100], [1, 600]].map(([u, v]) => [x + u * w, y + h - h * v / 3800]);
  const draw = (col, rec) => { ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.beginPath(); let pen = false; pts.forEach((q, i) => { if (i / (pts.length - 1) > p) return; const v = 3800 * (y + h - q[1]) / h; if (rec && v > 999) { pen = false; return; } pen ? ctx.lineTo(...q) : ctx.moveTo(...q); pen = true; }); ctx.stroke(); };
  ctx.shadowColor = VX.red; ctx.shadowBlur = 20; draw(VX.red, false); ctx.shadowBlur = 0; draw('#fff', true);
  text(ctx, 'REAL AIR', x, y + h + 56, { font: F.type, size: 32, color: VX.red }); text(ctx, 'ON RECORD', x + w, y + h + 56, { font: F.type, size: 32, color: '#fff', align: 'right' });
  text(ctx, 'ILLUSTRATIVE', x + w, y + h + 100, { font: F.osw, size: 20, color: VX.dim, align: 'right', weight: 600, ls: 2 }); ctx.restore(); }
function wordKeys(id, g = .16) { const L = LINE[id]; if (!L) return; L.words.forEach((w, i) => cue(w.s, 'key', g)); }

function scenes() {
  const X = 64, TY = 320, TS = 62, TW = 950;
  // 1. date + poison air, over Diwali footage/photo
  shot(['V01'], (ctx, t, lt) => { vxBackdrop(ctx, BG_OPEN, lt, { clip: BG_OPEN_CLIP, fps: 12, n: CLIP_N, dark: .5 });
    vxType(ctx, t, [{ id: 'V01', color: VX.red }, { id: 'V02', red: ['poison'] }], X, TY, { size: TS, w: TW });
    vxFrame(ctx, 'station', X, 860, TW, 600, t, T('V02', 'poison'), lt, { tag: 'DELHI · SMOG · ARCHIVE PHOTO', fy: .45 });
    if (t < T('V02', 'poison')) sourceTag(ctx, credit('fw2', 'Archive footage: firecrackers, Bengaluru 2024')); fadeIn(ctx, t, 0, .4); }, { lead: .3, name: 'open' });
  // 2. meters go silent
  shot(['V03'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V03', red: ['silent'] }], X, TY, { size: TS, w: TW });
    const off = T('V03', 'silent'); aqiMeter(ctx, 140, 820, 800, 520, t, lerp(420, 980, clamp((t - LINE.V03.start) / Math.max(.5, off - LINE.V03.start))), t > off); }, { name: 'meter' });
  cue(T('V03', 'silent'), 'hit', .7);
  // 3. 25 stations blank
  shot(['V04'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V04', red: ['25', 'vanished'] }], X, TY, { size: TS, w: TW });
    stationGrid(ctx, 150, 860, t, T('V04', 'vanished')); vxNote(ctx, '[25] of 39 stations: no PM2.5 between 2 and 3 AM, 8-9 Nov (CPCB data)', X, 1520, t, T('V04', 'vanished') + .3, { size: 32, w: TW, redParts: true }); }, { name: 'grid' });
  cue(T('V04', 'vanished'), 'hit', .6);
  // 4. DPCC released it
  shot(['V05'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V05', red: ['dpcc'] }], X, TY, { size: TS, w: TW });
    vxCard(ctx, X, 900, TW, 380, t, T('V05', 'DPCC'), 'DPCC · DELAYED HOURLY DATA · 9 NOV, ~8 PM', [['125', 'STATION-HOURS MISSING ON CPCB', true], ['1,000+', 'EVERY ONE OF THEM', false]]);
    vxNote(ctx, 'Provisional data, not yet quality-assured.', X, 1360, t, T('V05', 'released'), { size: 30, w: TW, color: VX.dim }); }, { name: 'dpcc' });
  cue(T('V05', 'DPCC'), 'paper', .6);
  // 5. Mundka 3,744
  shot(['V06'], (ctx, t, lt) => { vxBackdrop(ctx, BG_SMOG, lt, { dark: .65 }); vxType(ctx, t, [{ id: 'V06', red: ['3744'] }], X, TY, { size: TS, w: TW });
    vxNum(ctx, t, T('V06', '3,744'), 3744, W / 2, 1060, { size: 300, label: 'MUNDKA · 2 AM · PM2.5 (UG/M3)', lsize: 36, dur: 1.1 }); cred(ctx, BG_SMOG); }, { name: 'mundka' });
  cue(T('V06', '3,744'), 'impact', .8);
  // 6. 60x
  shot(['V07'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V07', red: ['60', 'times'] }], X, TY, { size: TS, w: TW }); barPair(ctx, X, 900, TW, t, T('V07', 'India'));
    vxNum(ctx, t, T('V07', '60'), 60, W / 2, 1520, { size: 200, suf: 'X', fixed: true }); }, { name: 'bars' });
  cue(T('V07', '60'), 'stamp', .7);
  // 7. other stations
  shot(['V08'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V08', red: ['3023', '3008', '2000'] }], X, TY, { size: TS, w: TW });
    vxCard(ctx, X, 940, TW, 380, t, T('V08', 'JNU'), 'DPCC · PM2.5 (UG/M3) · 9 NOV', [['3,023', 'JNU · 4 AM', true], ['3,008', 'NSUT WEST · 5 AM', true], ['11', 'STATIONS > 2,000', false]]); }, { name: 'stations' });
  cue(T('V08', 'JNU'), 'tick', .5); cue(T('V08', 'NSUT'), 'tick', .5); cue(T('V08', '11'), 'tick', .5);
  // 8. question
  shot(['V09'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V09', red: ['where'] }], X, 760, { size: 92, w: TW }); }, { name: 'q' });
  // 9-10. CPCB answer: 999 cut-off
  shot(['V10'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V10', red: ['2015', '999'] }], X, TY, { size: TS, w: TW });
    rangeGauge(ctx, W / 2, 1300, 340, E.inOut(prog(t, T('V10', '999'), T('V10', '999') + 1.2)), t, false);
    vxNote(ctx, 'CPCB: National AQI (2015) was built for a 0-1,000 range.', X, 1560, t, T('V10', 'system'), { size: 32, w: TW, color: VX.dim }); }, { name: 'gauge' });
  cue(T('V10', '999'), 'riser', .5);
  shot(['V11'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V11', red: ['out', 'of', 'range'] }], X, TY, { size: TS, w: TW }); rangeGauge(ctx, W / 2, 1100, 340, 1, t, true);
    if (t > T('V11', 'range')) stamp(ctx, 'OUT OF RANGE', W / 2, 1320, t, T('V11', 'range'), { size: 120, color: VX.red, rot: -.08 });
    if (t > T('V11', 'drops')) vxNote(ctx, '3,744  ->  [NO DATA]', X + 120, 1600, t, T('V11', 'drops'), { size: 54, w: 900, redParts: true }); }, { name: 'oor' });
  cue(T('V11', 'range'), 'stamp', .9);
  // 11. the irony
  shot(['V12'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V12', red: ['toxic', 'vanishes'] }], X, TY, { size: TS, w: TW }); dualChart(ctx, X, 860, TW, 520, t, LINE.V12.start); }, { name: 'chart' });
  // 12. 49%
  shot(['V13'], (ctx, t, lt) => { vxBG(ctx, t); vxType(ctx, t, [{ id: 'V13', red: ['49', 'percent'] }], X, TY, { size: TS, w: TW });
    vxNum(ctx, t, T('V13', '49'), 49, W / 2, 1180, { size: 330, pre: '+', suf: '%', label: 'CREA ANALYSIS · ESTIMATE', lsize: 36 }); }, { name: '49' });
  cue(T('V13', '49'), 'impact', .7); cue(LINE.V15.start + 1.6, 'tick', .8);
  // 13. closing question over smog
  shot(['V14'], (ctx, t, lt) => { vxBackdrop(ctx, BG_END, lt, { dark: .55 }); vxType(ctx, t, [{ id: 'V14', red: ['breathing', 'breathe'] }], X, TY, { size: 62, w: TW }); cred(ctx, BG_END); }, { name: 'close' });
  // 14. badge
  shot(['V15'], (ctx, t, lt) => { vxBackdrop(ctx, BG_END, lt + 6, { dark: .75 }); vxType(ctx, t, [{ id: 'V15', red: ['veritrix'] }], X, TY, { size: TS, w: TW }); vxEnd(ctx, t, LINE.V15.start + .2); glassSubscribe(ctx, W / 2, 1180, t, LINE.V15.start + .5, { tapAfter: 1.1 }); fadeOut(ctx, t, TL.duration, .8); }, { name: 'end' });
  ['V01', 'V02', 'V03', 'V04', 'V05', 'V06', 'V07', 'V08', 'V09', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15'].forEach(id => wordKeys(id));
}
