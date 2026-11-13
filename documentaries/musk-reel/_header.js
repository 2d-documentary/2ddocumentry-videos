// Elon Musk: the craziest hand of poker — Instagram Reel (Dagar Unfiltered) (1080x1920) in the KINETIC style (doc/snippets/kinetic.js).
'use strict';
const EP = { images: {}, credit: {}, billCrop: [12, 12, 1176, 481], captions: false, scenes, brand: 'DAGAR UNFILTERED',
  kEmph: ['garbage', 'three', 'fire', 'mars', 'rent', 'folds', 'everything', 'one', 'orbit', 'nasa', 'christmas', 'bankrupt', 'all', 'trillionaire', '2008', 'elon'], kBleep: ['fuck', 'shit'] };
const C = { space: '#050A16', navy: '#0A1430', teal: '#38D6E8', tred: '#E82127', gold: '#FFC34D', xblue: '#1D9BF0', lime: '#B6F36A', violet: '#7B5CFF', cream: '#F6F0E4' };
const CLIPS = { ign: ['catch_vid', 35], rise: ['catch_vid', 38], boom: ['ift1_vid', 32], boom2: ['ift1_vid', 32], up: ['ift1_vid', 35] };
for (const k in CLIPS) for (let i = 0; i < CLIPS[k][1]; i++) EP.images[k + '_' + i] = `archives/footage/${CLIPS[k][0]}_${k}_${i}.jpg`;
const credit = (k, extra) => { const c = cr(k); return c ? (extra ? extra + ' · ' : '') + c : (extra || ''); };
const CX = 540;
