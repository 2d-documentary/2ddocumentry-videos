'use strict';
const EP = { brand: 'EDUANIMHUB', images: {}, credit: {}, scenes };
function scenes() {
  [['1', 'MADHUR (MALE) · THODA FAST', '#FFC34D'], ['2', 'SWARA (FEMALE)', '#7FD1FF'], ['3', 'MADHUR (MALE) · CALM, DEEP', '#B6F36A']].forEach(([k, label, col]) => {
    shot(['V' + k + '01'], (ctx, t, lt) => { bgGrad(ctx, '#0E1626', '#000', 'r');
      text(ctx, 'VOICE ' + k, W / 2, H / 2 - 30, { font: F.bebas, size: 160, color: col, align: 'center' });
      text(ctx, label, W / 2, H / 2 + 60, { font: F.osw, size: 44, color: '#fff', align: 'center', weight: 600, ls: 6 }); }, { lead: 1.1 });
  });
}
