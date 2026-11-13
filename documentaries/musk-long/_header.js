// Elon Musk: every hand he played — DAGAR UNFILTERED long video (1920x1080) in the KINETIC style.
'use strict';
const EP = { images: {}, credit: {}, billCrop: [12, 12, 1176, 481], captions: false, scenes, brand: 'DAGAR UNFILTERED',
  kEmph: ['all', 'everything', 'hand', 'blastar', 'two', 'zip2', 'crashes', 'paypal', 'rockets', 'mars', 'missiles', 'fails', 'rent', 'orbit', 'nasa', 'christmas', 'cool', 'tweets', 'twice', 'sink', 'x', 'starship', 'trillionaire', 'table', 'lucky', 'fun', 'cold', 'twelve', 'disassembly'],
  kBleep: ['shit', 'fuck'] };
const CLIPS = { ign: ['catch_vid', 35], rise: ['catch_vid', 38], tower: ['catch_vid', 44], boom: ['ift1_vid', 32], boom2: ['ift1_vid', 32], up: ['ift1_vid', 35] };
for (const k in CLIPS) for (let i = 0; i < CLIPS[k][1]; i++) EP.images[k + '_' + i] = `archives/footage/${CLIPS[k][0]}_${k}_${i}.jpg`;
EP.images.blastar_doc = 'archives/documents/blastar_blastar-source-code-1984.png';
const C = { space: '#050A16', navy: '#0A1430', teal: '#38D6E8', tred: '#E82127', gold: '#FFC34D', xblue: '#1D9BF0', lime: '#B6F36A', violet: '#7B5CFF', cream: '#F6F0E4' };
const credit = (k, extra) => { const c = cr(k); return c ? (extra ? extra + ' · ' : '') + c : (extra || ''); };
const CX = W / 2;
