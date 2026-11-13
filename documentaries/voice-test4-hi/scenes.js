'use strict';
const EP = { images: {}, credit: {}, scenes };
function scenes() { shot(['V101'], (ctx, t) => { bgGrad(ctx, '#0E1626', '#000', 'r'); const L = LINE['V101']; const e = (L && L.err) || 'OK: no error';
  for (let i = 0; i < 10; i++) text(ctx, e.slice(i * 60, i * 60 + 60), 40, 120 + i * 44, { font: F.mono, size: 30, color: '#ff8080' }); }, { lead: .5 }); }
