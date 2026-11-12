// Motion-graphics maps (2D, drawn on a canvas each frame): parchment land on a deep sea, Roman territory that
// grows, splits and fades, year counter, labels and city markers. Coastlines: Natural Earth (assets/geo/med_land.json).
const RED = '#9b2226', RED_D = '#5c0f12', PURPLE = '#5b2a6e', ORANGE = '#c0661c', GREEN = '#2f6a4a', GREY = '#8a8272', GOLD = '#d4a84a';

// ------------------------------------------------------------------ territories (lon, lat), drawn over land only
const ROME_500 = [[11.9, 42.3], [12.9, 42.25], [13.45, 41.75], [13.15, 41.2], [12.5, 41.4], [11.9, 41.9]];
const ITALY = [[10.0, 44.05], [12.5, 44.15], [13.8, 43.4], [15.0, 42.2], [16.3, 41.9], [18.7, 40.6], [18.7, 39.8], [17.2, 38.6], [16.4, 37.8], [15.55, 37.85], [15.65, 38.3], [15.0, 40.0], [13.0, 41.2], [11.2, 42.3], [10.4, 43.0]];
const SICILY = [[12.2, 38.3], [15.7, 38.35], [15.4, 36.5], [12.2, 37.4]];
const W_SICILY = [[12.2, 38.3], [13.6, 38.3], [13.6, 37.0], [12.2, 37.4]];
const SARD_CORS = [[8.0, 43.1], [9.9, 43.1], [9.9, 38.8], [8.0, 38.8]];
const BALEARIC = [[1.1, 40.2], [4.5, 40.2], [4.5, 38.6], [1.1, 38.6]];
const AFR_CARTH = [[-6.5, 36.2], [2, 37.2], [11.3, 37.6], [11.5, 33.5], [15.5, 32.3], [15.5, 30.8], [10.5, 32.6], [8, 33.4], [2, 34.8], [-6.5, 34.6]];
const S_SPAIN = [[-6.4, 37.3], [-2, 37.4], [-0.6, 38.4], [-0.6, 37.2], [-6.4, 35.9]];
const CISALPINE = [[6.8, 44.1], [7.0, 45.2], [8.5, 46.3], [10.5, 46.6], [12.5, 46.6], [13.8, 45.8], [13.6, 44.8], [12.5, 44.1]];
const HISP_146 = [[-9.6, 37.0], [-6, 36], [-2, 36.6], [0.5, 38.6], [0.0, 40.0], [1.0, 41.0], [3.3, 42.0], [3.2, 42.5], [0.8, 42.8], [-1.5, 42.0], [-3.5, 40.8], [-4.5, 39.5], [-7.0, 38.5], [-8.0, 38.0]];
const AFRICA_146 = [[8.6, 37.4], [11.3, 37.4], [11.3, 35.4], [10.5, 34.8], [8.6, 35.4]];
const GREECE_146 = [[19.3, 40.6], [20.5, 41.8], [22.5, 42.2], [24.5, 41.6], [26.4, 41.0], [26.2, 40.0], [24, 37.5], [23.2, 36.3], [21.8, 36.6], [21, 37.8], [20.6, 39.5]];
const ILLYRIA = [[19.3, 40.6], [20.5, 41.8], [19.5, 42.6], [18.4, 43.4], [17.0, 43.4], [18.5, 42.4]];
const BRIT = [[-5.8, 49.8], [2.0, 50.6], [1.9, 53.2], [-1.6, 55.1], [-3.4, 55.05], [-4.9, 54.8], [-4.6, 53.3], [-5.5, 51.7]];
const europe = ({ dacia = true, agri = true } = {}) => [
  [-10, 44.4], [-3, 44.2], [-2.8, 46.5], [-5.4, 47.8], [-5.4, 48.9], [-1.5, 49.9], [1.6, 51.1], [3.5, 51.7], [4.3, 52.25], [6.0, 51.85], [7.0, 50.6],
  ...(agri ? [[7.6, 50.45], [8.5, 50.35], [9.0, 50.3], [9.1, 49.9], [9.5, 49.4], [9.7, 48.8], [11.0, 48.95], [12.1, 49.0]] : [[7.6, 48.6], [8.6, 47.6], [10.0, 47.6], [12.1, 48.9]]),
  [13.4, 48.55], [16.4, 48.2], [16.9, 48.1], [18.0, 47.75], [18.9, 47.75], [18.95, 46.0], [20.3, 44.85],
  ...(dacia ? [[21.3, 46.2], [22.5, 47.8], [24.5, 47.7], [25.8, 47.0], [26.6, 45.9], [27.5, 45.3], [28.3, 45.4]] : [[22.5, 44.6], [25.0, 43.7], [27.5, 44.0], [28.3, 45.2]]),
  [29.7, 45.2], [29.0, 44.0], [28.6, 43.2], [28.0, 42.0], [28.1, 41.6], [29.1, 41.25], [28.0, 40.4], [26.5, 40.1], [26.5, 38.5], [28, 36.0], [24, 34.6], [20, 36.5], [15, 36.2], [12, 36.6], [11.3, 37.7], [8, 38.5], [2, 38.5], [-2, 36.4], [-5.6, 35.95], [-10, 36.2]];
const asia = ({ meso = true } = {}) => [[26.0, 40.3], [29.0, 41.2], [31.5, 41.3], [35.0, 42.2], [38.5, 41.2], [41.6, 41.6],
  ...(meso ? [[43.5, 41.2], [45.0, 41.3], [46.5, 39.6], [47.0, 38.5], [48.0, 37.0], [48.5, 32.0], [48.6, 30.0], [47.5, 29.5], [46.0, 30.2], [43.5, 31.2], [41.0, 33.3]] : [[42.5, 40.0], [41.5, 37.5], [40.5, 36.0], [38.8, 34.5]]),
  [39.0, 32.5], [37.5, 30.5], [36.8, 29.0], [36.0, 27.2], [35.2, 28.0], [34.5, 29.4], [34.2, 31.3], [33, 32.5], [30.5, 36], [26.5, 36.2], [25.8, 38.5]];
const EGYPT = [[25.0, 31.7], [29.5, 31.2], [32.3, 31.4], [34.2, 31.3], [34.9, 29.5], [33.6, 27.6], [33.0, 24.2], [32.8, 23.6], [32.4, 23.6], [31.2, 25.5], [30.2, 27.5], [29.0, 30.3], [25.0, 30.5]];
const N_AFRICA = [[-9.8, 35.9], [-2, 35.3], [2, 36.8], [8, 37.4], [11.2, 37.4], [11.5, 33.5], [15, 32.5], [19, 30.4], [20.5, 31.3], [22, 33], [25, 32.0], [25, 30.5], [20, 30.0], [15, 30.6], [10.5, 32.4], [8, 33.3], [5, 34.4], [0, 34.2], [-5, 33.6], [-9.8, 33.0]];
const EMPIRE_117 = [BRIT, europe(), asia(), EGYPT, N_AFRICA];
const EMPIRE_260 = [BRIT, europe({ agri: false }), asia({ meso: false }), EGYPT, N_AFRICA];
const EMPIRE_395 = [BRIT, europe({ dacia: false, agri: false }), asia({ meso: false }), EGYPT, N_AFRICA];
const GALLIC = [[-14, 36.0], [-1, 36.5], [2, 38.2], [6, 40], [7.0, 44.1], [7.0, 46.5], [8.6, 47.6], [9, 62], [-14, 62]];
const PALMYRA = [[24.5, 20], [24.5, 32], [30, 36.0], [31.5, 37.0], [33.0, 39.5], [35, 43], [52, 43], [52, 20]];
const EAST = [[19.4, 62], [19.4, 46], [19.6, 44.8], [19.2, 43.5], [19.2, 42], [18.0, 40.5], [16, 35], [19, 32], [19.0, 18], [62, 18], [62, 62]];
const WEST = [[19.4, 62], [19.4, 46], [19.6, 44.8], [19.2, 43.5], [19.2, 42], [18.0, 40.5], [16, 35], [19, 32], [19.0, 18], [-20, 18], [-20, 62]];

const CITY = { Rome: [12.48, 41.89], Carthage: [10.32, 36.85], Constantinople: [28.97, 41.01], Ravenna: [12.2, 44.42], Alexandria: [29.92, 31.2], Antioch: [36.16, 36.2], Palmyra: [38.27, 34.55], Byzantium: [28.97, 41.01], 'Augusta Treverorum': [6.64, 49.75] };
const VIEW = { italy: { c: [12.6, 41.6], h: 11.5 }, med: { c: [17.5, 40.5], h: 30 } };
const STAGES = {
  italy_500: { year: -500, view: 'italy', layers: [{ col: RED, polys: [ROME_500] }], labels: [['ROME', 12.2, 42.6, 1]], cities: ['Rome'] },
  italy_264: { year: -264, view: 'italy', layers: [{ col: RED, polys: [ITALY] }], labels: [['ROMAN REPUBLIC', 14.4, 41.4, 1.2]], cities: ['Rome'] },
  264: { year: -264, view: 'med', layers: [{ col: RED, polys: [ITALY] }, { col: PURPLE, polys: [AFR_CARTH, W_SICILY, SARD_CORS, S_SPAIN, BALEARIC] }], labels: [['ROME', 14.6, 42.4, 1], ['CARTHAGE', 5.5, 33.2, 1]], cities: ['Rome', 'Carthage'], clash: [13.6, 37.6] },
  146: { year: -146, view: 'med', layers: [{ col: RED, polys: [ITALY, SICILY, SARD_CORS, CISALPINE, HISP_146, AFRICA_146, GREECE_146, ILLYRIA] }], labels: [['ROMAN REPUBLIC', 12, 46.6, 1]], cities: ['Rome', 'Carthage'] },
  117: { year: 117, view: 'med', layers: [{ col: RED, polys: EMPIRE_117 }], labels: [['ROMAN EMPIRE', 22, 44.2, 1.4]], cities: ['Rome', 'Alexandria', 'Antioch', 'Byzantium'] },
  crisis: { year: 270, yearText: '260–274 AD', view: 'med', layers: [{ col: RED, polys: EMPIRE_260 }, { col: ORANGE, polys: [GALLIC], atop: true }, { col: GREEN, polys: [PALMYRA], atop: true }],
    labels: [['GALLIC EMPIRE', -1.5, 46.8, 0.9], ['ROMAN EMPIRE', 18, 43.2, 0.9], ['PALMYRENE EMPIRE', 36, 31.5, 0.9]], cities: ['Rome', 'Palmyra', 'Augusta Treverorum'], cracks: true },
  eastwest: { year: 395, view: 'med', layers: [{ col: RED, polys: EMPIRE_395 }, { col: PURPLE, polys: [EAST], atop: true }], labels: [['WESTERN EMPIRE', 4, 45.4, 1], ['EASTERN EMPIRE', 30, 38.8, 1]], cities: ['Rome', 'Constantinople', 'Ravenna'], divide: true },
  476: { year: 476, view: 'med', layers: [{ col: RED, polys: EMPIRE_395 }, { col: PURPLE, polys: [EAST], atop: true }, { col: GREY, polys: [WEST], atop: true, hatch: true }],
    labels: [['EASTERN ROMAN EMPIRE', 30, 38.8, 1], ['VISIGOTHS', -4, 41.0, 0.75], ['FRANKS', 2.5, 48.8, 0.75], ['VANDALS', 6, 34.6, 0.75], ["ODOACER'S ITALY", 11.8, 44.9, 0.75]], cities: ['Constantinople', 'Ravenna', 'Rome'] },
};

let LAND = null;
export async function loadMap() {
  try { LAND = await (await fetch('../assets/geo/med_land.json')).json(); } catch (e) { LAND = { rings: [] }; }
  try { await document.fonts.load('64px Cinzel'); await document.fonts.load('32px "EB Garamond"'); } catch (e) {}
}
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const yearStr = (y) => (y < 0 ? `${-y} BC` : `${y} AD`);

// draw a frame of the map animation: from stage A to stage B, u = 0..1 of the shot, t = seconds
export function drawMap(ctx, W, H, a, b, u, t) {
  const A = STAGES[a], B = STAGES[b], same = a === b;
  const vA = VIEW[A.view], vB = VIEW[B.view], kv = ease(Math.min(1, u / 0.45));
  const cx = vA.c[0] + (vB.c[0] - vA.c[0]) * kv, cy = vA.c[1] + (vB.c[1] - vA.c[1]) * kv, span = vA.h + (vB.h - vA.h) * kv;
  const zoom = 1 + u * 0.07, k = H / span * zoom, cosl = Math.cos(cy * Math.PI / 180);
  const X = (lon) => W / 2 + (lon - cx) * cosl * k, Y = (lat) => H / 2 - (lat - cy) * k;
  const path = (poly) => { ctx.moveTo(X(poly[0][0]), Y(poly[0][1])); for (let i = 1; i < poly.length; i++) ctx.lineTo(X(poly[i][0]), Y(poly[i][1])); ctx.closePath(); };
  // sea
  const g = ctx.createRadialGradient(W * 0.5, H * 0.45, H * 0.1, W * 0.5, H * 0.5, W * 0.75); g.addColorStop(0, '#2c5566'); g.addColorStop(1, '#122a36');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
  for (let lon = -30; lon <= 70; lon += 5) { ctx.beginPath(); ctx.moveTo(X(lon), 0); ctx.lineTo(X(lon), H); ctx.stroke(); }
  for (let lat = 10; lat <= 65; lat += 5) { ctx.beginPath(); ctx.moveTo(0, Y(lat)); ctx.lineTo(W, Y(lat)); ctx.stroke(); }
  // land with soft shadow
  const landPath = () => { ctx.beginPath(); for (const r of LAND.rings) path(r); };
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18 * k / 40; ctx.shadowOffsetY = 4; landPath(); ctx.fillStyle = '#d8c8a0'; ctx.fill('evenodd'); ctx.restore();
  // parchment mottling on land
  ctx.save(); landPath(); ctx.clip('evenodd');
  for (let i = 0; i < 40; i++) { const x = (Math.sin(i * 12.9) * 0.5 + 0.5) * W, y = (Math.sin(i * 78.2) * 0.5 + 0.5) * H, r = 80 + (i % 7) * 40; const gg = ctx.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, i % 2 ? 'rgba(120,90,50,0.10)' : 'rgba(255,250,230,0.10)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gg; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  // territory layers, revealed from the centre of Rome (growth) or crossfaded
  const reveal = same ? 1 : ease(Math.max(0, Math.min(1, (u - 0.25) / 0.5)));
  const drawStage = (S, alpha, radius) => {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = alpha;
    if (radius !== null) { ctx.beginPath(); ctx.arc(X(12.5), Y(41.9), radius, 0, Math.PI * 2); ctx.clip(); }
    for (const L of S.layers) {
      ctx.save();
      if (L.atop) { ctx.beginPath(); for (const p of S.layers[0].polys) path(p); ctx.clip(); }
      ctx.beginPath(); for (const p of L.polys) path(p);
      ctx.fillStyle = L.col; ctx.globalAlpha = alpha * 0.82; ctx.fill();
      if (L.hatch) { ctx.clip(); ctx.strokeStyle = 'rgba(40,30,20,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = -H; x < W + H; x += 14) { ctx.moveTo(x, 0); ctx.lineTo(x + H, H); } ctx.stroke(); }
      ctx.restore();
      if (!L.atop) { ctx.save(); ctx.globalAlpha = alpha * 0.9; ctx.strokeStyle = L.col === RED ? RED_D : 'rgba(30,10,30,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); for (const p of L.polys) path(p); ctx.stroke(); ctx.restore(); }
    }
    ctx.restore();
  };
  const growth = !same && (B.layers[0].polys.length >= A.layers[0].polys.length) && !B.layers.some((l) => l.atop);
  if (same) drawStage(B, 1, null);
  else if (growth) { drawStage(A, 1, null); drawStage(B, 1, reveal * Math.hypot(W, H) * 1.1); }
  else { drawStage(A, 1 - reveal * 0.999, null); drawStage(B, reveal, null); }
  ctx.restore();   // end land clip
  // coastline
  ctx.save(); landPath(); ctx.strokeStyle = 'rgba(70,52,30,0.85)'; ctx.lineWidth = 1.4; ctx.stroke(); ctx.restore();
  const S = reveal > 0.5 ? B : A, la = same ? ease(Math.min(1, u / 0.15)) : Math.abs(reveal - 0.5) * 2;
  // division line, cracks, clash marker
  if (S.divide) { ctx.save(); ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.setLineDash([14, 10]); ctx.globalAlpha = la; ctx.beginPath(); const L = EAST.slice(0, 9), n = Math.max(2, Math.ceil(L.length * Math.min(1, la * 1.2)));
    ctx.moveTo(X(L[0][0]), Y(Math.min(L[0][1], 48))); for (let i = 1; i < n; i++) ctx.lineTo(X(L[i][0]), Y(L[i][1])); ctx.stroke(); ctx.restore(); }
  if (S.cracks) { ctx.save(); ctx.strokeStyle = 'rgba(20,10,5,0.7)'; ctx.lineWidth = 2.2; ctx.globalAlpha = la;
    for (const [x0, y0] of [[7, 46], [8, 40], [31, 40], [30, 33]]) { ctx.beginPath(); let x = X(x0), y = Y(y0); ctx.moveTo(x, y); for (let i = 0; i < 7; i++) { x += Math.sin(i * 3.1 + x0) * 22; y += 18; ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore(); }
  if (S.clash) { const x = X(S.clash[0]), y = Y(S.clash[1]), p = 1 + Math.sin(t * 6) * 0.08; ctx.save(); ctx.globalAlpha = la; ctx.translate(x, y); ctx.scale(p, p);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-22 * s, -22); ctx.lineTo(22 * s, 22); ctx.stroke(); }
    ctx.restore();
    const arrow = (x0, y0, x1, y1, col) => { const k2 = ease(Math.min(1, u / 0.6)); const ex = x0 + (x1 - x0) * k2, ey = y0 + (y1 - y0) * k2; ctx.save(); ctx.globalAlpha = la; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + ex) / 2 + 30, (y0 + ey) / 2, ex, ey); ctx.stroke();
      const a2 = Math.atan2(ey - y0, ex - x0); ctx.beginPath(); ctx.moveTo(ex + Math.cos(a2) * 16, ey + Math.sin(a2) * 16); ctx.lineTo(ex + Math.cos(a2 + 2.5) * 18, ey + Math.sin(a2 + 2.5) * 18); ctx.lineTo(ex + Math.cos(a2 - 2.5) * 18, ey + Math.sin(a2 - 2.5) * 18); ctx.fill(); ctx.restore(); };
    arrow(X(12.5), Y(41.9), X(13.7) + 10, Y(37.9) - 30, '#f3e6c8'); arrow(X(10.3), Y(36.85), X(13.3) - 30, Y(37.5), '#e8d8f0'); }
  // cities
  ctx.save(); ctx.globalAlpha = Math.max(0.0, la);
  for (const name of S.cities || []) { const [lo, lt] = CITY[name], x = X(lo), y = Y(lt);
    ctx.fillStyle = '#1a1210'; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = '500 26px "EB Garamond", Georgia, serif'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(20,14,10,0.85)'; ctx.fillStyle = '#fff6e6'; ctx.strokeText(name, x + 12, y - 10); ctx.fillText(name, x + 12, y - 10); }
  // region labels
  for (const [txt, lo, lt, s] of S.labels || []) { const x = X(lo), y = Y(lt); ctx.font = `600 ${Math.round(34 * s)}px Cinzel, "Times New Roman", serif`; ctx.textAlign = 'center';
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.round(6 * s)}px`;
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(25,15,10,0.75)'; ctx.fillStyle = '#fff2dc'; ctx.strokeText(txt, x, y); ctx.fillText(txt, x, y); }
  ctx.restore(); ctx.textAlign = 'left'; if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  // year badge, counting between stages
  const yr = Math.round(A.year + (B.year - A.year) * reveal), txt = (reveal > 0.98 || same) && B.yearText ? B.yearText : yearStr(yr);
  ctx.save(); ctx.font = '700 58px Cinzel, "Times New Roman", serif'; const tw = ctx.measureText(txt).width;
  ctx.fillStyle = 'rgba(14,10,8,0.62)'; ctx.fillRect(56, 52, tw + 60, 96); ctx.fillStyle = GOLD; ctx.fillRect(56, 52, 6, 96);
  ctx.fillStyle = '#fff2dc'; ctx.fillText(txt, 84, 122); ctx.restore();
}
