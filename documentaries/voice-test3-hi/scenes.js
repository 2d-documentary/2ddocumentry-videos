'use strict';
const EP = { brand: 'EDUANIMHUB', images: {}, credit: {}, scenes };
function scenes() {
  [['7', 'ROHIT · INDIC PARLER (MALE)', '#FF8A65'], ['8', 'DIVYA · INDIC PARLER (FEMALE)', '#CE93D8']].forEach(([k, label, col]) => {
    shot(['V' + k + '01'], (ctx, t, lt) => { bgGrad(ctx, '#0E1626', '#000', 'r');
      text(ctx, 'VOICE ' + k, W / 2, 200, { font: F.bebas, size: 120, color: col, align: 'center' });
      text(ctx, label, W / 2, 270, { font: F.osw, size: 36, color: '#fff', align: 'center', weight: 600, ls: 6 });
      const L = LINE['V' + k + '01']; if (L && L.err) { const e = L.err; for (let i = 0; i < 8; i++) text(ctx, e.slice(i * 70, i * 70 + 70), 60, 380 + i * 40, { font: F.mono, size: 26, color: '#ff8080' }); } }, { lead: 1.1 });
  });
}
