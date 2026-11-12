// Vertical Short helpers: brand bug, CTA end shot, caption band for light backgrounds, finish() to stamp the brand on every shot.
// Brand text comes from EP.brand (default 'UNFILED FILMS'). Needs editorial_helpers.js + props.js, and CX = 540 in the header.
function brand(ctx) { text(ctx, EP.brand || 'UNFILED FILMS', CX, 110, { font: F.play, size: 34, color: 'rgba(246,240,228,.8)', align: 'center', weight: 700, ls: 5 }); }
function capBand(ctx) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.78)'; ctx.fillRect(0, 1460, W, 200); ctx.restore(); } // call on yellow/light shots so captions stay readable
function ctaShot(id, title, line2, firstWord) { // end card: title + "full story" line + subscribe pop on the last word
  const words = (LINE[id] || { words: [] }).words; const w0 = firstWord || (words[0] && words[0].w), wl = words.length ? words[words.length - 1].w : w0;
  shot([id, w0], (ctx, t, lt) => {
    bgGrad(ctx, '#120A24', '#000', 'r'); fog(ctx, t, .3, '140,90,255');
    glowText(ctx, title, CX, 720, { font: F.play, size: 110, color: '#fff', align: 'center', weight: 700, glow: 'rgba(138,92,246,.9)' });
    text(ctx, line2 || 'FULL STORY ON ' + (EP.brand || 'UNFILED FILMS'), CX, 840, { font: F.osw, size: 46, color: '#FFB547', align: 'center', weight: 600, ls: 4, alpha: prog(t, T(id, w0), T(id, w0) + .4) });
    const tw = T(id, wl); if (t > tw - .2) { const p = Math.max(0, E.back(prog(t, tw - .2, tw + .1))); ctx.save(); ctx.translate(CX, 1080); ctx.scale(p, p); ctx.fillStyle = '#E62117'; ctx.beginPath(); ctx.roundRect(-280, -70, 560, 140, 70); ctx.fill(); text(ctx, 'SUBSCRIBE', 0, 25, { font: F.bebas, size: 80, color: '#fff', align: 'center' }); ctx.restore(); }
    fadeOut(ctx, t, TL.duration, .5);
  }, { name: 's-cta' });
  cue(T(id, w0) - .05, 'impact', .7);
}
function finish() { const _d = SHOTS.map(s => s.draw); SHOTS.forEach((s, i) => { s.draw = (ctx, t, lt, sh) => { _d[i](ctx, t, lt, sh); brand(ctx); }; }); }
