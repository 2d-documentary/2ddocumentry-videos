'use strict';
const EP = { images: {}, credit: {}, scenes };
function scenes() { shot(['V01'], (ctx, t) => { bgGrad(ctx, '#0E1626', '#000', 'r'); let y = 40;
  TL.lines.forEach(L => { const e = L.err ? L.id + ' ERR ' + L.err : L.id + ' ok ' + (L.end - L.start).toFixed(2) + 's'; text(ctx, e.slice(0, 110), 20, y, { font: F.mono, size: 18, color: L.err ? '#ff8080' : '#8f8' }); y += 22; if (L.err) { text(ctx, L.err.slice(110, 330), 20, y, { font: F.mono, size: 16, color: '#ff8080' }); y += 22; } }); }, { lead: .3 }); }
