// ---------- B-roll motion kinds (Dagar): a cut-out prop that falls into frame, or drives in. Cut-outs come from
// fetch-assets "cutout": true -> archives/cutouts/<id>.png; map them with brollCuts(['gren', ...]) at the top of _shots.js.
function brollCuts(ids) { ids.forEach(k => EP.images[k + '_cut'] = 'archives/cutouts/' + k + '.png'); }
function propImg(k) { const im = imgOf(k + '_cut') || imgOf(k); if (!im) return null; return [im, im.naturalWidth || im.width, im.naturalHeight || im.height]; }
function brollKinds() {
  // ['L011', null, 'fall', bgKey, propKey, { text, x, y, s, dark }] : prop drops in, lands with a bounce + screen shake
  BEAT_KINDS.fall = { cap: 1, draw: (ctx, t, lt, t0, a, o) => {
    const D = o.d ?? .5, u = clamp(lt / D), land = lt >= D, b = lt - D;
    const sh = land ? Math.exp(-b * 9) * Math.sin(b * 70) * MN() * .014 : 0;
    ctx.save(); ctx.translate(sh, sh * .6);
    full(ctx, a[0], lt, { dark: o.dark ?? .45, z0: 1.08, z1: 1.18 });
    const p = propImg(a[1]);
    if (p) { const [im, iw, ih] = p, h = H * (o.s ?? .42), w = h * iw / ih, yEnd = H * (o.y ?? .6), x = W * (o.x ?? .5);
      let y = lerp(-h, yEnd, E.in(u)), rot = lerp(-1.8, .22, u);
      if (land) { y = yEnd - Math.abs(Math.sin(b * 9)) * Math.exp(-b * 5) * H * .06; rot = .22 + Math.sin(b * 7) * Math.exp(-b * 4) * .12; }
      ctx.fillStyle = `rgba(0,0,0,${.55 * u})`; ctx.beginPath(); ctx.ellipse(x, yEnd + h * .47, w * .5 * (.3 + .7 * u), h * .06, 0, 0, Math.PI * 2); ctx.fill();
      ctx.translate(x, y); ctx.rotate(rot); ctx.filter = 'grayscale(1) contrast(1.15)';
      if (!land) { ctx.globalAlpha = .22; ctx.drawImage(im, -w / 2, -h * .8, w, h); ctx.globalAlpha = 1; }
      ctx.drawImage(im, -w / 2, -h / 2, w, h); }
    ctx.restore();
    if (o.text) headline(ctx, o.text, W / 2, H * (o.ty ?? .2), t, t0 + D, { colors: o.colors || [DX.red], size: o.size || MN() * .12, sub: o.sub });
  } };
  // ['L021', 'tanker', 'drive', bgKey, propKey, { text, from: 'r'|'l', x, y, s }] : prop slides in fast and brakes
  BEAT_KINDS.drive = { cap: 1, draw: (ctx, t, lt, t0, a, o) => {
    full(ctx, a[0], lt, { dark: o.dark ?? .35, z0: 1.05, z1: 1.1 });
    const p = propImg(a[1]); if (p) { const [im, iw, ih] = p, h = H * (o.s ?? .42), w = h * iw / ih, D = o.d ?? 1.0, u = E.out(clamp(lt / D)), dir = o.from === 'l' ? -1 : 1;
      const xEnd = W * (o.x ?? .5), x = lerp(W / 2 + dir * (W / 2 + w * .6), xEnd, u), y = H * (o.y ?? .6), v = 1 - u;
      ctx.save(); ctx.filter = 'grayscale(1) contrast(1.1)';
      ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(x, y + h * .46, w * .48, h * .05, 0, 0, Math.PI * 2); ctx.fill();
      for (let k = 4; k >= 1; k--) { ctx.globalAlpha = .14 * v; ctx.drawImage(im, x - w / 2 + dir * k * w * .07 * v, y - h / 2, w, h); }
      ctx.globalAlpha = 1; ctx.drawImage(im, x - w / 2, y - h / 2, w, h); ctx.restore(); }
    if (o.text) headline(ctx, o.text, W / 2, H * (o.ty ?? .18), t, t0 + .3, { colors: o.colors, size: o.size || MN() * .1, sub: o.sub });
  } };
  // ['L013', 'fuel', 'alarm', bgKey, TEXT, sub] : photo with a blinking red warning (gauges, cockpit)
  BEAT_KINDS.alarm = { cap: 0, draw: (ctx, t, lt, t0, a, o) => {
    full(ctx, a[0], lt, { dark: o.dark ?? .4, z0: 1.15, z1: 1.3, fx: o.fx, fy: o.fy });
    const on = Math.floor(lt * 4) % 2 === 0; ctx.fillStyle = `rgba(224,38,43,${on ? .22 : .06})`; ctx.fillRect(0, 0, W, H);
    if (on || lt < .3) headline(ctx, a[1], W / 2, H * .46, t, t0, { colors: [DX.red], size: o.size || MN() * .13, sub: a[2] });
  } };
}
