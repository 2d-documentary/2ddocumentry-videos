// Hindi pipeline test: Hindi voice ("say"), Roman-script captions and graphics ("text").
'use strict';
const EP = { images: {}, credit: {}, captions: true, captionY: 1560, captionSize: 96, scenes };
function scenes() {
  shot(['H01', 'Ek'], (ctx, t, lt) => { photo(ctx, 'lib_in2', { zoom: 1.05 + lt * .02, grade: 'warm' }); shade(ctx, .45);
    if (t > T('H01', 'kaala')) text(ctx, 'KAALA BAZAAR', 540, 700, { font: F.bebas, size: 170, color: '#FFB547', align: 'center', shadow: 20 }); }, { lead: .3, name: 'h1' });
  cue(T('H01', 'kaala'), 'hit', .7);
  shot(['H02', 'Aur'], (ctx, t, lt) => { bgGrad(ctx, '#200A0A', '#000', 'r');
    if (t > T('H02', 'nakli')) stamp(ctx, 'NAKLI JHAGDA', 540, 760, t, T('H02', 'nakli'), { size: 140 }); }, { name: 'h2' });
  cue(T('H02', 'nakli'), 'stamp');
  shot(['H03', 'Poori'], (ctx, t, lt) => { bgGrad(ctx, '#120A24', '#000', 'r'); text(ctx, 'UNFILED FILMS', 540, 800, { font: F.play, size: 100, color: '#fff', align: 'center', weight: 700 }); fadeOut(ctx, t, TL.duration, .5); }, { name: 'h3' });
}
