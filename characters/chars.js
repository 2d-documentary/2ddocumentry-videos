// Flat 2D character builder for "Pirates: The Entire History".
// Every character is assembled from the same parts so the cast reads as one world.
// Coordinates: feet at (0,0), y up is negative. Head centre (0,-185), r = 48.
const INK = '#1E1A1C';
let UID = 0;
const uid = (p) => `${p}${++UID}`;

function shade(hex, k = 0.72) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
  return '#' + [f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
}

// filled shape with one flat cel shadow (lower right) and an ink outline
function cel(d, col, opt = {}) {
  const id = uid('c'), w = opt.w ?? 3, dx = opt.dx ?? -7, dy = opt.dy ?? -6;
  if (opt.flat) return `<path d="${d}" fill="${col}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"/>`;
  return `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})"><path d="${d}" fill="${shade(col)}"/><path d="${d}" fill="${col}" transform="translate(${dx},${dy})"/></g><path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"/>`;
}
const circ = (cx, cy, r) => `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0Z`;
const ell = (cx, cy, rx, ry) => `M${cx - rx},${cy}a${rx},${ry} 0 1,0 ${2 * rx},0a${rx},${ry} 0 1,0 ${-2 * rx},0Z`;
const line = (pts, w = 3, col = INK) => `<path d="M${pts.map((p) => p.join(',')).join(' L')}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const limb = (pts, col, w = 7) => `<path d="M${pts.map((p) => p.join(',')).join(' L')}" fill="none" stroke="${INK}" stroke-width="${w + 5}" stroke-linecap="round" stroke-linejoin="round"/><path d="M${pts.map((p) => p.join(',')).join(' L')}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// ---------------------------------------------------------------- faces
// kind: neutral | happy | angry | shocked | confused | smug | bored | grin | none(hidden)
function face(kind, v, o = {}) {
  const dx = v * 26, side = v > 0.8, tq = v > 0.2 && !side;
  const ey = o.eyeY ?? -4;
  const eyes = side ? [[dx + 3, 1]] : tq ? [[dx - 14, 0.7], [dx + 14, 1]] : [[-17, 1], [17, 1]];
  let s = '';
  const brow = (x, sc, ang, lift = 0) => {
    const y = ey - 17 - lift, L = 9 * sc;
    const a = (ang * Math.PI) / 180;
    return line([[x - L * Math.cos(a), y - L * Math.sin(a)], [x + L * Math.cos(a), y + L * Math.sin(a)]], 3.6);
  };
  for (const [i, [x, sc]] of (o.mouthOnly ? [] : eyes).entries()) {
    const sgn = side ? 1 : (x < dx ? -1 : 1);
    if (kind === 'none') continue;
    if (kind === 'happy' || kind === 'grin') s += `<path d="M${x - 7 * sc},${ey + 2} Q${x},${ey - 8} ${x + 7 * sc},${ey + 2}" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`;
    else if (kind === 'shocked') s += `<path d="${ell(x, ey, 8.5 * sc, 9.5)}" fill="#fff" stroke="${INK}" stroke-width="2.6"/><path d="${ell(x, ey + 1, 2.6 * sc, 3)}" fill="${INK}"/>`;
    else if (kind === 'bored' || kind === 'smug') s += `<path d="${ell(x, ey + 1, 3.4 * sc, 4)}" fill="${INK}"/>` + line([[x - 7 * sc, ey - 2], [x + 7 * sc, ey - 2]], 3.2);
    else s += `<path d="${ell(x + (kind === 'confused' && i === 0 ? -1 : 0), ey, 3.6 * sc, 5.2)}" fill="${INK}"/><circle cx="${x + 1.2}" cy="${ey - 2}" r="1.2" fill="#fff"/>`;
    // brows
    const inward = sgn * (x < 0 || side ? 1 : 1);
    if (kind === 'angry') s += brow(x, sc, sgn > 0 ? -22 : 22, -2);
    else if (kind === 'shocked') s += brow(x, sc, sgn > 0 ? 8 : -8, 6);
    else if (kind === 'confused') s += brow(x, sc, i === 0 ? 14 : -6, i === 0 ? 0 : 6);
    else if (kind === 'smug' || kind === 'bored') s += brow(x, sc, i === eyes.length - 1 && kind === 'smug' ? -10 : 0, kind === 'smug' && i === eyes.length - 1 ? 3 : 0);
    else s += brow(x, sc, sgn > 0 ? -4 : 4, 1);
  }
  if (side && kind !== 'none' && !o.mouthOnly) s += `<path d="M44,${ey + 8} q9,3 3,10" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`; // nose bump
  const mx = side ? dx + 8 : dx * 1.05, my = o.mouthY ?? 20;
  if (o.noMouth) return s;
  if (o.mouthOnly) s += `<path d="${ell(mx, my + 2, 13, 8)}" fill="#E9B8A8" stroke="#3a3030" stroke-width="2"/>`;
  if (kind === 'happy') s += `<path d="M${mx - 10},${my - 2} Q${mx},${my + 10} ${mx + 10},${my - 2}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`;
  else if (kind === 'grin') s += `<path d="M${mx - 13},${my - 3} Q${mx},${my + 15} ${mx + 13},${my - 3} Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` + line([[mx - 12, my + 1], [mx + 12, my + 1]], 1.6);
  else if (kind === 'angry') s += `<path d="M${mx - 9},${my + 5} Q${mx},${my - 3} ${mx + 9},${my + 5}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`;
  else if (kind === 'shocked') s += `<path d="${ell(mx, my + 3, 6, 8)}" fill="#6b2a2a" stroke="${INK}" stroke-width="2.8"/>`;
  else if (kind === 'confused') s += `<path d="M${mx - 9},${my + 2} q4,-5 8,0 t8,0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  else if (kind === 'smug') s += `<path d="M${mx - 9},${my + 1} Q${mx + 2},${my + 5} ${mx + 10},${my - 4}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`;
  else if (kind === 'bored') s += line([[mx - 7, my + 2], [mx + 7, my + 2]], 3.2);
  else if (kind !== 'none') s += `<path d="M${mx - 7},${my} Q${mx},${my + 5} ${mx + 7},${my}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`;
  return s;
}

// ---------------------------------------------------------------- body shapes
function bodyPath(shape, wscale) {
  const W = 34 * wscale;
  if (shape === 'gown') return `M${-W * 0.85},-138 C${-W * 1.1},-110 ${-W * 2.1},-40 ${-W * 2.0},-10 Q0,2 ${W * 2.0},-10 C${W * 2.1},-40 ${W * 1.1},-110 ${W * 0.85},-138 Q0,-146 ${-W * 0.85},-138Z`;
  if (shape === 'robe') return `M${-W * 0.9},-138 C${-W * 1.2},-110 ${-W * 1.45},-40 ${-W * 1.4},-14 Q0,-6 ${W * 1.4},-14 C${W * 1.45},-40 ${W * 1.2},-110 ${W * 0.9},-138 Q0,-146 ${-W * 0.9},-138Z`;
  if (shape === 'coat') return `M${-W * 0.9},-138 C${-W * 1.15},-110 ${-W * 1.3},-60 ${-W * 1.32},-30 L${W * 1.32},-30 C${W * 1.3},-60 ${W * 1.15},-110 ${W * 0.9},-138 Q0,-146 ${-W * 0.9},-138Z`;
  return `M${-W * 0.88},-138 C${-W * 1.18},-120 ${-W * 1.18},-62 ${-W},-52 Q0,-42 ${W},-52 C${W * 1.18},-62 ${W * 1.18},-120 ${W * 0.88},-138 Q0,-146 ${-W * 0.88},-138Z`;
}

// ---------------------------------------------------------------- hats & hair (head-local, centre 0,0)
function hairBack(c, v) {
  const h = c.hair || {}; let s = '';
  if (h.type === 'long') s += cel(`M-50,-10 C-62,30 -58,62 -44,70 L-24,40 L24,40 L44,70 C58,62 62,30 50,-10 Z`, h.col);
  if (h.type === 'bigwig') for (const [x, y] of [[-50, 10], [-54, 34], [-50, 58], [50, 10], [54, 34], [50, 58]]) s += cel(circ(x - v * 10, y, 15), h.col);
  if (h.type === 'wig') s += cel(`M${-6 + v * -30},20 q-6,30 2,44 q8,-14 4,-44z`, h.col) + `<path d="${ell(-2 + v * -30, 24, 7, 5)}" fill="${INK}"/>`;
  if (c.ruffFan) s += cel(`M-92,30 Q-100,-60 0,-78 Q100,-60 92,30 Q0,10 -92,30Z`, '#F1ECE0') + line([[-70, 18], [-74, -40]], 1.5, '#b9b1a0') + line([[-35, 4], [-40, -64]], 1.5, '#b9b1a0') + line([[0, 0], [0, -76]], 1.5, '#b9b1a0') + line([[35, 4], [40, -64]], 1.5, '#b9b1a0') + line([[70, 18], [74, -40]], 1.5, '#b9b1a0');
  return s;
}
function hairFront(c, v) {
  const h = c.hair || {}; let s = ''; const dx = v * 14;
  if (h.type === 'cap' || h.type === 'long') s += cel(`M-48,-6 C-50,-46 -20,-56 0,-56 C24,-56 50,-44 48,-6 C40,-26 20,-30 ${dx},-32 C-20,-30 -40,-24 -48,-6Z`, h.col);
  if (h.type === 'fringe') s += cel(`M-48,-6 C-50,-46 -20,-56 0,-56 C24,-56 50,-44 48,-6 L40,-22 L30,-14 L22,-26 L12,-16 L2,-28 L-8,-18 L-18,-28 L-28,-16 L-38,-24Z`, h.col);
  if (h.type === 'messy') s += cel(`M-49,-2 C-52,-46 -20,-57 0,-57 C26,-57 52,-44 49,-2 L42,-18 L36,-8 L28,-24 L16,-20 L4,-30 L-10,-22 L-22,-30 L-32,-18 L-40,-22Z`, h.col);
  if (h.type === 'wig' || h.type === 'bigwig') {
    s += cel(`M-49,0 C-52,-48 -18,-60 0,-60 C22,-60 52,-48 49,0 C42,-20 24,-30 0,-30 C-24,-30 -42,-20 -49,0Z`, h.col);
    for (const sy of [-6, 14]) for (const sx of [-1, 1]) if (!(v > 0.8 && sx < 0)) s += cel(circ(sx * 49 + v * 6, sy, 11), h.col);
  }
  if (h.type === 'receding') s += cel(`M-49,4 C-52,-20 -46,-34 -36,-40 C-30,-30 -34,-12 -40,6Z`, h.col) + cel(`M49,4 C52,-20 46,-34 36,-40 C30,-30 34,-12 40,6Z`, h.col) + cel(`M-18,-50 Q0,-58 18,-50 Q10,-44 0,-46 Q-10,-44 -18,-50Z`, h.col);
  if (h.type === 'baldsides') s += cel(`M-49,8 C-52,-14 -48,-28 -40,-32 C-36,-20 -38,-4 -42,10Z`, h.col) + cel(`M49,8 C52,-14 48,-28 40,-32 C36,-20 38,-4 42,10Z`, h.col);
  if (h.type === 'shortcurl') { s += cel(`M-48,-6 C-50,-46 -20,-56 0,-56 C24,-56 50,-44 48,-6 C40,-26 20,-30 0,-32 C-20,-30 -40,-24 -48,-6Z`, h.col); for (let i = 0; i < 9; i++) { const a = Math.PI * (0.08 + 0.84 * i / 8); s += cel(circ(-Math.cos(a) * 42, -Math.sin(a) * 40 - 8, 9), h.col, { w: 2 }); } }
  if (h.type === 'longhair') s += cel(`M-50,40 C-58,-10 -46,-56 0,-58 C46,-56 58,-10 50,40 C46,10 40,-20 30,-30 C10,-34 -10,-34 -30,-30 C-40,-20 -46,10 -50,40Z`, h.col);
  if (h.type === 'curls') { for (let i = 0; i < 7; i++) { const a = Math.PI * (0.05 + 0.9 * i / 6); s += cel(circ(-Math.cos(a) * 46, -Math.sin(a) * 40 - 6, 15), h.col); } }
  if (h.type === 'bun') { s += cel(`M-49,0 C-52,-46 -20,-56 0,-56 C24,-56 52,-46 49,0 C40,-24 20,-28 0,-28 C-20,-28 -40,-24 -49,0Z`, h.col) + cel(circ(-v * 10, -62, 18), h.col) + line([[-24 - v * 10, -70], [24 - v * 10, -56]], 4, '#E9C46A'); }
  if (h.type === 'scarf') s += cel(`M-50,-2 C-52,-50 -16,-60 4,-58 C30,-56 52,-44 50,-4 C40,-28 20,-34 0,-34 C-22,-34 -42,-26 -50,-2Z`, h.col) + cel(`M44,-14 l22,6 l-6,14 z`, h.col) + cel(`M46,-10 l14,22 l-12,4 z`, h.col) + (h.hair2 ? cel(`M-50,-2 q-8,26 2,40 q6,-14 4,-40z`, h.hair2) : '');
  return s;
}
function hat(c, v) {
  const t = c.hat; if (!t) return '';
  const k = 1 - v * 0.25, col = t.col, y0 = t.low ? 16 : 0; let s = '';
  if (t.type === 'tricorne') {
    s += `<g transform="translate(0,${y0}) scale(${k},1)">` + cel(`M-38,-40 Q-32,-80 0,-82 Q32,-80 38,-40Z`, col) + cel(`M-70,-34 Q-34,-22 0,-30 Q34,-22 70,-34 Q56,-62 0,-62 Q-56,-62 -70,-34Z`, col);
    if (t.trim) s += line([[-64, -36], [-30, -28], [0, -33], [30, -28], [64, -36]], 3, t.trim);
    if (t.feather) s += cel(`M20,-62 Q60,-104 84,-88 Q62,-84 30,-56Z`, t.feather);
    s += '</g>';
  }
  if (t.type === 'widebrim') s += `<g transform="scale(${k},1)">` + cel(`M-34,-38 Q-34,-84 0,-86 Q34,-84 34,-38Z`, col) + cel(ell(0, -40, 78, 13), col) + line([[-33, -50], [33, -50]], 4, t.band || '#7a2b2b') + '</g>';
  if (t.type === 'tall') s += `<g transform="scale(${k},1)">` + cel(`M-28,-44 L-24,-116 Q0,-122 24,-116 L28,-44Z`, col) + cel(ell(0, -44, 52, 9), col) + line([[-28, -56], [28, -56]], 5, t.band || '#B8860B') + cel(`M18,-104 Q46,-140 66,-124 Q44,-118 26,-94Z`, t.feather || '#c8281e') + '</g>';
  if (t.type === 'laurel' || t.type === 'goldlaurel') {
    const lc = t.type === 'goldlaurel' ? '#E0B33C' : '#5E8A3A';
    for (let i = 0; i < 9; i++) { const a = Math.PI * (0.12 + 0.76 * i / 8), x = -Math.cos(a) * 50, y = -Math.sin(a) * 30 - 30, r = (a - Math.PI / 2) * 57;
      if (v > 0.8 && x < -10) continue;
      s += `<g transform="translate(${x},${y}) rotate(${r})">` + cel(ell(0, 0, 6, 11), lc, { w: 2 }) + '</g>'; }
  }
  if (t.type === 'diadem') { s += line([[-48, -24], [-20, -36], [0, -38], [20, -36], [48, -24]], 7, INK) + line([[-48, -24], [-20, -36], [0, -38], [20, -36], [48, -24]], 4, '#E0B33C'); for (const x of [-30, -10, 10, 30]) s += `<circle cx="${x}" cy="${-34 + Math.abs(x) * 0.25}" r="4" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`; s += cel(ell(0, -40, 7, 9), '#C1121F', { w: 2 }); }
  if (t.type === 'etruscan') s += cel(`M-46,-30 L-40,-62 L-26,-44 L-12,-70 L0,-48 L12,-70 L26,-44 L40,-62 L46,-30 Q0,-40 -46,-30Z`, '#E0B33C') + `<circle cx="0" cy="-42" r="4" fill="#2a6f97" stroke="${INK}" stroke-width="1.5"/>`;
  if (t.type === 'galea') { s += `<g transform="scale(${k},1)">` + cel(`M-50,4 C-56,-40 -30,-62 0,-62 C30,-62 56,-40 50,4 L42,4 C40,-24 24,-38 0,-38 C-24,-38 -40,-24 -42,4Z`, col) + cel(`M-50,0 h14 v34 h-14z M36,0 h14 v34 h-14z`, col, { w: 2.4 }) + cel(`M-40,-56 Q0,-120 40,-56 Q0,-80 -40,-56Z`, t.plume || '#B3261E') + line([[-46, -28], [46, -28]], 3, shade(col, 0.6)) + '</g>'; }
  if (t.type === 'hellenic') { s += `<g transform="scale(${k},1)">` + cel(`M-50,6 C-56,-44 -24,-66 10,-60 C40,-56 56,-30 50,6 L40,6 C38,-24 22,-36 0,-36 C-22,-36 -38,-24 -40,6Z`, col) + cel(`M-6,-60 Q30,-104 60,-74 Q30,-80 4,-52Z`, t.plume || '#2a2a2a') + '</g>'; }
  if (t.type === 'wolf') { s += cel(`M-54,30 C-60,-30 -36,-66 0,-66 C36,-66 60,-30 54,30 C44,0 30,-30 0,-32 C-30,-30 -44,0 -54,30Z`, col) + cel(`M-34,-58 l-6,-26 l20,16z`, col, { w: 2.4 }) + cel(`M34,-58 l6,-26 l-20,16z`, col, { w: 2.4 }) + cel(`M-14,-62 Q0,-52 14,-62 Q8,-48 0,-46 Q-8,-48 -14,-62Z`, shade(col, 0.7), { w: 2 }) + `<circle cx="-8" cy="-56" r="2" fill="${INK}"/><circle cx="8" cy="-56" r="2" fill="${INK}"/>`; }
  if (t.type === 'crown') s += cel(`M-26,-50 L-24,-74 L-12,-60 L0,-80 L12,-60 L24,-74 L26,-50Z`, '#E0B33C') + `<circle cx="0" cy="-60" r="4" fill="#c8281e" stroke="${INK}" stroke-width="2"/>`;
  if (t.fuses) {
    for (const [x, y] of [[-46, -18], [-52, 2], [46, -18], [52, 2]]) {
      if (v > 0.8 && x < 0) continue;
      s += line([[x, y], [x + Math.sign(x) * 12, y - 10]], 3, '#5a4a3a') + `<circle cx="${x + Math.sign(x) * 14}" cy="${y - 13}" r="3" fill="#ff9a2a"/>` +
        `<circle cx="${x + Math.sign(x) * 20}" cy="${y - 28}" r="8" fill="#9AA0A6" opacity=".85"/><circle cx="${x + Math.sign(x) * 14}" cy="${y - 42}" r="6" fill="#B7BCC2" opacity=".75"/>`;
    }
  }
  return s;
}
function beard(c, v) {
  const b = c.beard; if (!b) return '';
  const dx = v * 22, col = b.col; let s = '';
  if (b.type === 'full') s += cel(`M${dx - 40},4 C${dx - 42},40 ${dx - 20},62 ${dx},64 C${dx + 22},62 ${dx + 42},40 ${dx + 40},4 C${dx + 26},18 ${dx - 26},18 ${dx - 40},4Z`, col);
  if (b.type === 'pointed') s += cel(`M${dx - 22},16 Q${dx},26 ${dx + 22},16 L${dx + 4},50 Q${dx},54 ${dx - 4},50Z`, col);
  if (b.type === 'black') {
    s += cel(`M${dx - 44},0 C${dx - 50},50 ${dx - 26},96 ${dx},104 C${dx + 26},96 ${dx + 50},50 ${dx + 44},0 C${dx + 28},16 ${dx - 28},16 ${dx - 44},0Z`, col);
    for (const bx of [-18, 0, 18]) { s += line([[dx + bx, 30], [dx + bx * 1.1, 84]], 2, '#3a3a3a'); s += `<rect x="${dx + bx * 1.1 - 5}" y="${66 + Math.abs(bx) * 0.3}" width="10" height="7" rx="2" fill="#8A1C1C" stroke="${INK}" stroke-width="2"/>`; }
  }
  if (b.mous) s += `<path d="M${dx - 18},14 Q${dx - 8},6 ${dx},12 Q${dx + 8},6 ${dx + 18},14 ${b.curl ? `q8,2 10,-8 M${dx - 18},14 q-8,2 -10,-8` : ''}" fill="${b.type ? 'none' : 'none'}" stroke="${b.mcol || col}" stroke-width="${b.thin ? 3 : 5}" stroke-linecap="round"/>`;
  return s;
}

// ---------------------------------------------------------------- props (at a hand point)
function prop(kind, x, y, v) {
  switch (kind) {
    case 'spear': return line([[x - 4, y + 70], [x + 8, y - 120]], 9, INK) + line([[x - 4, y + 70], [x + 8, y - 120]], 5, '#8a5a34') + cel(`M${x + 2},${y - 118} l6,-30 l8,30z`, '#C9CDD2', { w: 2 });
    case 'scutum': return cel(`M${x - 6},${y - 52} q22,-6 44,0 v96 q-22,6 -44,0z`, '#9B2226') + line([[x + 16, y - 52], [x + 16, y + 44]], 3, '#E0B33C') + line([[x - 6, y - 4], [x + 38, y - 4]], 3, '#E0B33C') + cel(circ(x + 16, y - 4, 9), '#E0B33C', { w: 2 });
    case 'roundshield': return cel(circ(x + 14, y - 6, 34), '#7A5230') + cel(circ(x + 14, y - 6, 26), '#B08A4A', { w: 2 }) + cel(circ(x + 14, y - 6, 8), '#C9CDD2', { w: 2 });
    case 'lyre': return cel(`M${x - 16},${y + 10} Q${x - 30},${y - 40} ${x - 12},${y - 58} L${x - 6},${y - 50} Q${x - 18},${y - 30} ${x - 8},${y} Z M${x + 16},${y + 10} Q${x + 30},${y - 40} ${x + 12},${y - 58} L${x + 6},${y - 50} Q${x + 18},${y - 30} ${x + 8},${y} Z`, '#C9A227') + line([[x - 12, y - 50], [x + 12, y - 50]], 4, '#7a4a28') + [ -6, -2, 2, 6].map((d) => line([[x + d, y - 48], [x + d, y + 6]], 1.2, '#f4f1e8')).join('') + cel(`M${x - 18},${y + 4} h36 v10 h-36z`, '#7a4a28', { w: 2 });
    case 'eaglescepter': return line([[x, y + 60], [x, y - 70]], 8, INK) + line([[x, y + 60], [x, y - 70]], 4, '#E0B33C') + cel(`M${x - 14},${y - 74} q14,-14 28,0 l-6,8 l-8,-4 l-8,4z`, '#E0B33C', { w: 2 });
    case 'basket': return cel(`M${x - 22},${y - 6} h44 l-6,30 h-32z`, '#B8935A') + line([[x - 20, y + 4], [x + 20, y + 4]], 2, '#8a6a3a') + line([[x - 18, y + 14], [x + 18, y + 14]], 2, '#8a6a3a') + cel(circ(x - 8, y - 10, 7), '#7a2a6a', { w: 2 }) + cel(circ(x + 4, y - 12, 7), '#7a2a6a', { w: 2 }) + cel(circ(x + 12, y - 6, 6), '#4a7a2a', { w: 2 });
    case 'stamp': return cel(`M${x - 8},${y - 34} h16 v22 h-16z`, '#7a4a28') + cel(ell(x, y - 38, 13, 8), '#7a4a28') + cel(`M${x - 22},${y - 12} h44 v14 h-44z`, '#C9A227') + `<rect x="${x - 20}" y="${y + 2}" width="40" height="6" fill="#B3261E" stroke="${INK}" stroke-width="2"/>`;
    case 'scroll': return cel(`M${x - 6},${y - 30} h22 v56 h-22z`, '#F1E4C3') + cel(ell(x + 5, y - 30, 13, 5), '#E2D2A8') + cel(ell(x + 5, y + 26, 13, 5), '#E2D2A8') + line([[x - 1, y - 16], [x + 11, y - 16]], 2, '#8a7a5a') + line([[x - 1, y - 6], [x + 11, y - 6]], 2, '#8a7a5a') + line([[x - 1, y + 4], [x + 9, y + 4]], 2, '#8a7a5a');
    case 'bigscroll': return cel(`M${x - 4},${y - 34} h30 v100 h-30z`, '#F1E4C3') + cel(ell(x + 11, y - 34, 17, 6), '#E2D2A8') + cel(ell(x + 11, y + 66, 17, 6), '#E2D2A8') + `<text x="${x + 11}" y="${y - 12}" font-family="DejaVu Serif" font-size="6" text-anchor="middle" fill="#5a4a2a">KING'S</text><text x="${x + 11}" y="${y - 4}" font-family="DejaVu Serif" font-size="6" text-anchor="middle" fill="#5a4a2a">PARDON</text>`;
    case 'cutlass': return cel(`M${x},${y} q30,-20 38,-62 q-14,30 -42,52z`, '#C9CDD2') + cel(`M${x - 8},${y + 2} h16 v6 h-16z`, '#C9A227');
    case 'sword': return cel(`M${x - 3},${y} L${x + 30},${y - 58} L${x + 34},${y - 56} L${x + 3},${y + 2}z`, '#C9CDD2') + cel(`M${x - 9},${y - 4} l14,10 l-3,3 l-14,-10z`, '#C9A227');
    case 'axe': return line([[x, y + 20], [x + 10, y - 44]], 6, '#7a4a28') + cel(`M${x + 6},${y - 46} q20,-6 24,8 q-14,2 -22,10z`, '#AEB4BA');
    case 'fan': return cel(`M${x},${y} L${x - 26},${y - 36} Q${x},${y - 50} ${x + 26},${y - 36}Z`, '#C1121F') + line([[x, y], [x - 12, y - 42]], 1.5, '#7a0a10') + line([[x, y], [x, y - 46]], 1.5, '#7a0a10') + line([[x, y], [x + 12, y - 42]], 1.5, '#7a0a10');
    case 'book': return cel(`M${x - 16},${y - 12} h32 v24 h-32z`, '#6b2d2d') + `<text x="${x}" y="${y + 4}" font-family="DejaVu Sans" font-size="8" font-weight="bold" text-anchor="middle" fill="#E0B33C" transform="rotate(180 ${x} ${y})">NAVIGATION</text>`;
    case 'letter': return cel(`M${x - 4},${y - 26} h12 v40 h-12z`, '#F4EDDC') + `<rect x="${x - 3}" y="${y - 6}" width="10" height="5" fill="#B3261E"/>`;
    case 'tablet': return cel(`M${x - 18},${y - 26} h34 v28 h-34z`, '#C9A06A') + `<text x="${x - 1}" y="${y - 6}" font-family="DejaVu Sans" font-size="13" font-weight="bold" text-anchor="middle" fill="${INK}">XX</text>`;
    case 'pistol': return cel(`M${x - 4},${y - 4} h30 v8 h-30z`, '#3a3a3a') + cel(`M${x - 6},${y - 2} l8,0 l-4,16 l-8,0z`, '#7a4a28');
    case 'water': return cel(`M${x - 9},${y - 20} h18 l-3,26 h-12z`, '#cfe6f5');
    case 'sack': return cel(`M${x - 18},${y - 10} Q${x - 26},${y + 30} ${x},${y + 32} Q${x + 26},${y + 30} ${x + 18},${y - 10} Q${x},${y - 18} ${x - 18},${y - 10}Z`, '#C8A46A') + `<text x="${x}" y="${y + 18}" font-family="DejaVu Sans" font-size="14" font-weight="bold" text-anchor="middle" fill="#5a3a1a">$</text>`;
  }
  return '';
}

// ---------------------------------------------------------------- character
function character(c, o = {}) {
  const v = o.view ?? 0, side = v > 0.8, ex = o.expr || c.expr || 'neutral';
  const ws = side ? 0.72 : v > 0.2 ? 0.9 : 1;
  const bcol = c.body, legcol = c.legs || shade(c.body, 0.6), skin = c.skin || '#F6E3CC';
  const hL = o.handL || c.handL || [-46, -78], hR = o.handR || c.handR || [46, -78];
  let back = '', mid = '', front = '';
  // cape / far arm behind body
  if (c.cape) back += cel(`M-30,-136 C-50,-100 -56,-70 -50,-56 L10,-60 L10,-136Z`, c.cape);
  if (!side) back += limb([[-28 * ws, -128], [hL[0] * ws, hL[1]]], c.sleeve || bcol) + cel(circ(hL[0] * ws, hL[1], 9), c.glove || skin);
  // legs & boots
  if (!c.noLegs) {
    const lx = side ? [[-4, -6], [6, 6]] : [[-12, -15], [12, 15]];
    for (const [a, b] of lx) back += limb([[a, -52], [b, -12]], legcol, 8);
    for (const [, b] of lx) back += cel(ell(b + (side ? 6 : Math.sign(b) * 3), -7, side ? 15 : 13, 7.5), c.boots || '#2b2320');
  } else {
    for (const x of side ? [8] : [-16, 16]) back += cel(ell(x, -8, 13, 6.5), c.boots || '#2b2320');
  }
  // body
  mid += cel(bodyPath(c.shape || 'bean', ws), bcol);
  if (c.details) mid += c.details(ws, v);
  // near arm
  front += limb([[28 * ws, -128], [hR[0] * ws, hR[1]]], c.sleeve || bcol) + cel(circ(hR[0] * ws, hR[1], 9), c.glove || skin);
  if (c.prop) front += prop(c.prop, hR[0] * ws, hR[1], v);
  if (c.propL && !side) back = back + prop(c.propL, hL[0] * ws, hL[1], v);
  // head
  let head = hairBack(c, v) + cel(circ(0, 0, 48), skin, { dx: -9, dy: -6 });
  if (c.blush !== false) head += `<ellipse cx="${v * 26 + (side ? 18 : 26)}" cy="12" rx="7" ry="4" fill="#E9A5A0" opacity=".55"/>` + (side ? '' : `<ellipse cx="${v * 26 - 26}" cy="12" rx="7" ry="4" fill="#E9A5A0" opacity=".55"/>`);
  if (c.earring && !(side)) head += `<circle cx="47" cy="14" r="6" fill="none" stroke="#E0B33C" stroke-width="3"/>`;
  const bigBeard = c.beard && (c.beard.type === 'full' || c.beard.type === 'black');
  if (!c.hideEyes) head += face(ex, v, { noMouth: bigBeard });
  head += beard(c, v);
  if (bigBeard || c.hideEyes) head += face(ex === 'neutral' && c.hideEyes ? 'smug' : ex, v, { mouthOnly: true, mouthY: c.beard?.type === 'black' ? 24 : 22 });
  head += hairFront(c, v) + hat(c, v);
  if (c.collar === 'ruff') mid += Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2; return cel(circ(Math.cos(a) * 30 * ws, -138 + Math.sin(a) * 8, 8), '#F4F1E8', { w: 2 }); }).join('');
  if (c.collar === 'golilla') mid += cel(ell(0, -138, 36 * ws, 8), '#E9E3D3');
  if (c.collar === 'stock') mid += cel(`M-10,-140 L10,-140 L0,-112Z`, '#F4F1E8');
  const flip = o.flip ? -1 : 1, s = o.scale ?? 1;
  return `<g transform="translate(${o.x ?? 0},${o.y ?? 0}) scale(${flip * s},${s})" filter="url(#wob)">${back}${mid}${front}<g transform="translate(0,-185)">${head}</g></g>`;
}

// ---------------------------------------------------------------- the cast
const det = {
  toga: (w) => cel(`M${-28 * w},-136 L${30 * w},-60 L${18 * w},-56 L${-36 * w},-124Z`, '#6B2D7B', { w: 2.4 }) + line([[-10 * w, -100], [-24 * w, -50]], 2, '#cfc8b8') + line([[8 * w, -96], [16 * w, -46]], 2, '#cfc8b8'),
  sash: (col) => (w) => cel(`M${-30 * w},-130 L${32 * w},-74 L${30 * w},-62 L${-34 * w},-118Z`, col, { w: 2.4 }),
  buttons: (col, n = 4) => () => Array.from({ length: n }, (_, i) => `<circle cx="0" cy="${-126 + i * 16}" r="3.4" fill="${col}" stroke="${INK}" stroke-width="1.6"/>`).join(''),
  coatFront: (shirt) => (w) => cel(`M${-10 * w},-140 L0,-112 L${10 * w},-140Z`, shirt, { w: 2 }) + line([[0, -112], [0, -34]], 2.5) + `<circle cx="${-14 * w}" cy="-100" r="3" fill="#E0B33C" stroke="${INK}" stroke-width="1.5"/><circle cx="${-14 * w}" cy="-84" r="3" fill="#E0B33C" stroke="${INK}" stroke-width="1.5"/><circle cx="${-14 * w}" cy="-68" r="3" fill="#E0B33C" stroke="${INK}" stroke-width="1.5"/>`,
};
const CAST = {
  quillby: { id: 'C03', name: 'Mr. Quillby', role: 'Royal clerk (fictional)', body: '#2E3440', legs: '#1f232b', hair: { type: 'wig', col: '#E5E9F0' }, collar: 'stock', expr: 'bored', prop: 'stamp', handR: [44, -96], details: det.buttons('#C9A227', 5) },
  caesar: { id: 'C04', name: 'Julius Caesar', role: 'Hostage, 75 BC', body: '#F5F2EA', shape: 'robe', legs: '#E8D6BC', boots: '#7a4a28', hair: { type: 'fringe', col: '#3B2A20' }, expr: 'smug', details: det.toga, handR: [42, -112] },
  kilix: { id: 'C05', name: 'Captain Kilix', role: 'Cilician pirate (fictional)', body: '#C9A57A', skin: '#E2BB92', legs: '#6b5a44', beard: { type: 'full', col: '#2B2B2B' }, earring: true, expr: 'confused', prop: 'tablet', handR: [40, -96], details: det.sash('#7A2E2A') },
  drake: { id: 'C06', name: 'Francis Drake', role: 'Privateer', body: '#1F2430', legs: '#2a2f3c', cape: '#5a2430', hair: { type: 'cap', col: '#7a4a2a' }, beard: { type: 'pointed', col: '#A35A2A', mous: true }, collar: 'ruff', expr: 'smug', prop: 'sword', details: det.buttons('#E0B33C') },
  elizabeth: { id: 'C07', name: 'Elizabeth I', role: 'Queen of England', body: '#2C3E7A', shape: 'gown', skin: '#FBF6EE', noLegs: true, ruffFan: true, hair: { type: 'curls', col: '#C63D2F' }, hat: { type: 'crown' }, expr: 'neutral', blush: false, details: (w) => cel(`M${-14 * w},-130 L${14 * w},-130 L${30 * w},-12 L${-30 * w},-12Z`, '#E0B33C', { w: 2.4 }) + Array.from({ length: 7 }, (_, i) => `<circle cx="${(i - 3) * 9 * w}" cy="${-128 + Math.abs(i - 3) * -2 + 6}" r="3.2" fill="#fff" stroke="${INK}" stroke-width="1.4"/>`).join('') },
  indignado: { id: 'C08', name: 'Don Indignado', role: 'Spanish envoy (fictional)', body: '#121212', legs: '#0d0d0d', collar: 'golilla', hat: { type: 'tall', col: '#121212', feather: '#c8281e' }, beard: { mous: true, curl: true, col: '#1a1a1a', thin: false }, hair: { type: 'cap', col: '#1a1a1a' }, expr: 'angry', prop: 'letter', handR: [46, -110], details: det.buttons('#B8860B', 5) },
  morgan: { id: 'C09', name: 'Henry Morgan', role: 'Buccaneer, then governor', body: '#9B2226', shape: 'coat', legs: '#3a2a20', hair: { type: 'long', col: '#3A2A1E' }, hat: { type: 'widebrim', col: '#2B2118' }, beard: { mous: true, col: '#3A2A1E', thin: true }, expr: 'grin', prop: 'sack', handR: [48, -70], details: (w) => det.coatFront('#F4F1E8')(w) + det.sash('#E0B33C')(w) },
  every: { id: 'C10', name: 'Henry Every', role: 'The one who got away', body: '#2D4A6B', shape: 'coat', legs: '#24364d', hat: { type: 'tricorne', col: '#1C1C1C', low: true }, hideEyes: true, expr: 'smug', details: det.coatFront('#E8E2D6'), handR: [40, -66] },
  blackbeard: { id: 'C11', name: 'Blackbeard', role: 'Edward Teach', body: '#151515', shape: 'coat', legs: '#202020', hat: { type: 'tricorne', col: '#151515', fuses: true }, hair: { type: 'cap', col: '#151515' }, beard: { type: 'black', col: '#151515' }, expr: 'angry', prop: 'pistol', details: (w) => det.coatFront('#4a4a4a')(w) + cel(`M${-30 * w},-132 L${30 * w},-64 L${26 * w},-56 L${-34 * w},-124Z`, '#5a3a24', { w: 2 }) + [0, 1, 2].map((i) => prop('pistol', -14 * w + i * 14 * w, -112 + i * 16, 0)).join('') },
  bonnet: { id: 'C12', name: 'Stede Bonnet', role: 'The gentleman pirate', body: '#6C8EBF', shape: 'robe', legs: '#e8dccb', boots: '#E7A6B8', hair: { type: 'bigwig', col: '#F2EDE4' }, expr: 'happy', prop: 'book', handR: [36, -98], details: (w) => line([[-8 * w, -140], [-24 * w, -16]], 5, '#D4A373') + line([[8 * w, -140], [24 * w, -16]], 5, '#D4A373') + line([[-30 * w, -86], [30 * w, -86]], 4, '#D4A373') },
  roberts: { id: 'C13', name: 'Bartholomew Roberts', role: 'Black Bart', body: '#A4161A', legs: '#7a1014', sleeve: '#F4F1E8', hat: { type: 'tricorne', col: '#2a1a14', feather: '#C1121F', trim: '#E0B33C' }, hair: { type: 'cap', col: '#3a2a1e' }, expr: 'neutral', prop: 'scroll', propL: 'water', handR: [44, -96], details: (w) => det.buttons('#E0B33C', 4)(w) + line([[-14 * w, -138], [0, -112], [14 * w, -138]], 2, '#E0B33C') + cel(`M-4,-116 h8 v20 h-8z M-10,-110 h20 v7 h-20z`, '#E0B33C', { w: 1.6, flat: true }) },
  anne: { id: 'C14', name: 'Anne Bonny', role: 'Pirate', body: '#33415C', legs: '#6b4a32', hair: { type: 'scarf', col: '#2b2b2b', hair2: '#C1440E' }, expr: 'grin', prop: 'cutlass', handR: [48, -90], details: det.coatFront('#F4F1E8') },
  mary: { id: 'C15', name: 'Mary Read', role: 'Pirate', body: '#6B705C', legs: '#4a3a2a', sleeve: '#F4F1E8', hair: { type: 'messy', col: '#2B2B2B' }, expr: 'bored', prop: 'axe', handR: [44, -84], details: det.buttons('#c8b890', 3) },
  jack: { id: 'C16', name: 'Calico Jack', role: 'John Rackham', body: '#D9A5A0', shape: 'coat', legs: '#5a4a3a', hair: { type: 'cap', col: '#5A3E2B' }, beard: { mous: true, col: '#5A3E2B', thin: true }, expr: 'shocked', details: (w) => det.coatFront('#F3E9DC')(w) + Array.from({ length: 22 }, (_, i) => `<circle cx="${(((i * 37) % 60) - 30) * w}" cy="${-128 + ((i * 53) % 94)}" r="2.6" fill="${i % 2 ? '#B3261E' : '#F3E9DC'}"/>`).join('') + det.sash('#2f5a7a')(w) },
  zheng: { id: 'C17', name: 'Zheng Yi Sao', role: 'Red Flag Fleet', body: '#1D3557', shape: 'robe', skin: '#F3DFC4', noLegs: true, boots: '#1a1a1a', hair: { type: 'bun', col: '#161616' }, expr: 'smug', prop: 'fan', handR: [42, -98], details: (w) => cel(`M${-6 * w},-140 L${6 * w},-140 L${10 * w},-16 L${-10 * w},-16Z`, '#C1121F', { w: 2 }) + cel(`M${-38 * w},-84 h${76 * w} v12 h${-76 * w}z`, '#C1121F', { w: 2 }) + line([[-46 * w, -16], [46 * w, -16]], 4, '#C1121F') },
  rogers: { id: 'C18', name: 'Woodes Rogers', role: 'Governor of the Bahamas', body: '#1B3A57', shape: 'coat', legs: '#e8dccb', hair: { type: 'wig', col: '#ECE8E1' }, collar: 'stock', expr: 'neutral', prop: 'bigscroll', handR: [40, -100], details: (w) => line([[-30 * w, -36], [30 * w, -36]], 3, '#E0B33C') + det.buttons('#E0B33C', 5)() },
};

function parrot(o = {}) {
  const s = o.scale ?? 1, ex = o.expr || 'neutral';
  const eye = ex === 'sad' ? line([[-6, -60], [6, -58]], 3) : `<circle cx="0" cy="-60" r="9" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="2" cy="-59" r="4.5" fill="${INK}"/><circle cx="3.5" cy="-61" r="1.5" fill="#fff"/>`;
  return `<g transform="translate(${o.x},${o.y}) scale(${s})" filter="url(#wob)">` + cel(`M-12,-20 L-34,22 L-20,24 L-4,-8Z`, '#D94B2B') + cel(ell(0, -30, 24, 30), '#3FA34D') + cel(`M-16,-38 Q-34,-16 -14,-8Z`, '#2d7a38') + cel(circ(0, -60, 22), '#3FA34D') + cel(`M8,-80 q6,-20 -4,-24 q2,12 -6,20z`, '#3FA34D') + cel(`M16,-62 q18,4 10,20 q-4,-10 -12,-10z`, '#F2C230') + eye + line([[-8, 0], [-8, 8]], 3, '#E2B23C') + line([[8, 0], [8, 8]], 3, '#E2B23C') + `<rect x="4" y="2" width="16" height="6" fill="#B3261E" stroke="${INK}" stroke-width="1.5"/></g>`;
}
function archivistHand(o = {}) {
  const s = o.scale ?? 1;
  return `<g transform="translate(${o.x},${o.y}) scale(${s}) rotate(-20)" filter="url(#wob)">` + cel(`M-60,30 L-20,30 L-14,62 L-66,62Z`, '#3a2e2a') + `<rect x="-62" y="28" width="44" height="10" fill="#F1E4C3" stroke="${INK}" stroke-width="2.5"/>` + cel(`M-40,28 C-50,4 -30,-18 -6,-14 C14,-10 16,10 2,22 C-8,30 -26,34 -40,28Z`, '#F6E3CC') + cel(`M-4,-6 C8,-44 40,-86 74,-104 C70,-66 44,-26 2,4Z`, '#F4F1E8') + line([[-2, -2], [66, -96]], 2, '#b9b1a0') + `<path d="M-6,0 L-14,14" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><circle cx="-20" cy="22" r="5" fill="#1E1A1C" opacity=".35"/></g>`;
}
const DEFS = `<defs><filter id="wob" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter></defs>`;

module.exports = { character, parrot, archivistHand, CAST, DEFS, INK, cel, circ, ell, line, shade, face };
