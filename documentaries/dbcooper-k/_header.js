// D.B. Cooper — DAGAR UNFILTERED Short (1080x1920), KINETIC style + object transitions (portal, film strip, unfold).
'use strict';
const EP = { images: {}, credit: {}, billCrop: [12, 12, 1176, 481], captions: false, scenes, brand: 'DAGAR UNFILTERED',
  kEmph: ['cash', 'cooper', 'bomb', 'parachutes', 'jumps', 'fbi', 'zero', '5,800', 'gone', 'mistake', 'perfect'] };
const C = { space: '#050A16', navy: '#0A1430', teal: '#38D6E8', tred: '#E82127', gold: '#FFC34D', xblue: '#1D9BF0', lime: '#B6F36A', violet: '#7B5CFF', cream: '#F6F0E4' };
const credit = (k, extra) => { const c = cr(k); return c ? (extra ? extra + ' · ' : '') + c : (extra || ''); };
const CX = 540;
