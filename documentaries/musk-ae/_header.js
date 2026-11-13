// Elon sent his car to space — AE-style demo Short (1080x1920): cut-out parallax, 3D camera, per-letter text, track mattes.
'use strict';
const EP = { images: {}, credit: {}, billCrop: [12, 12, 1176, 481], captions: false, scenes,
  kEmph: ['2018', 'car', 'boring', 'tesla', 'win', 'didn\'t', 'same', 'ocean', 'sun', 'expensive'] };
['p_fh_press', 'p_dragon2', 'p_laugh', 'p_royal'].forEach(k => EP.images[k + '_cut'] = `archives/cutouts/${k}.png`);
const C = { space: '#050A16', navy: '#0A1430', teal: '#38D6E8', tred: '#E82127', gold: '#FFC34D', xblue: '#1D9BF0', lime: '#B6F36A', violet: '#7B5CFF', cream: '#F6F0E4' };
const credit = (k, extra) => { const c = cr(k); return c ? (extra ? extra + ' · ' : '') + c : (extra || ''); };
const CX = 540;
