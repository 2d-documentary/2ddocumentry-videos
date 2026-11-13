function scenes() {
  const L = id => LINE[id].start;
  const frameTex = (key) => tex('frame_' + key, 900, 1120, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#C9A24E'); g.addColorStop(.5, '#8A6326'); g.addColorStop(1, '#D9B566'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#3A2810'; c.fillRect(54, 54, w - 108, h - 108); const im = srcOf(key); if (im) { const iw = im.naturalWidth, ih = im.naturalHeight, s = Math.max((w - 140) / iw, (h - 140) / ih); c.save(); c.beginPath(); c.rect(70, 70, w - 140, h - 140); c.clip(); c.filter = 'sepia(.25) contrast(1.1)'; c.drawImage(im, w / 2 - iw * s / 2, h / 2 - ih * s / 2 - 40, iw * s, ih * s); c.restore(); }
    c.strokeStyle = 'rgba(255,240,200,.5)'; c.lineWidth = 3; c.strokeRect(20, 20, w - 40, h - 40); });
  const S = [
    { t0: 0, draw: (ctx, t, lt) => { starfield(ctx, t); plate(ctx, 'damst', lt, { dark: .55, blur: 3, grade: 'bw', z0: 1.15, z1: 1.3, dur: 6 }); smoke(ctx, t, .35);
        const C3 = cam({ z: -1500 + lt * 60 }); card3d(ctx, frameTex('eli'), C3, { pos: [0, 330, 0], w: 620, ry: lerp(.75, .12, E.out(clamp(lt / 1.6))), rx: .06, shadow: 40 });
        grungeTitle(ctx, [{ s: 'THIS MAN', color: KC.white, size: 150 }, { s: 'FOOLED A COUNTRY', color: KC.red, size: 128 }], W / 2, 250, t, L('V01') + .1, { rot: -.05 });
        flashK(ctx, t, L('V01') + .1, .3); cred(ctx, 'eli'); } },
    { t0: L('V02') - .1, tr: 'whip', draw: (ctx, t, lt) => { plate(ctx, 'damascus', lt, { z0: 1.05, z1: 1.22, dur: 4, grade: 'warm', fx: .55 }); vignetteK(ctx, .6);
        pillTag(ctx, '1962', W / 2, 760, t, T('V02', '1962,'), { size: 92 }); grungeTitle(ctx, [{ s: 'DAMASCUS', color: KC.white, size: 170 }], W / 2, 900, t, T('V02', 'Damascus.'));
        lightSweep(ctx, (lt - .6) / 1.4, .3); cred(ctx, 'damascus'); } },
    { t0: L('V03') - .1, tr: 'zoom', draw: (ctx, t, lt) => { const C3 = cam({ z: -1700 + lt * 70, ry: Math.sin(lt * .4) * .03 }); card3d(ctx, wallTex(), C3, { pos: [0, 0, 400], w: 1900, n: [2, 2] });
        lampFixture(ctx, W / 2, 330, 260); const sw = Math.sin(lt * 3) * Math.exp(-lt * 1.6) * .25;
        card3d(ctx, frameTex('eli_home'), C3, { pos: [0, 120, 300], w: 760, rz: sw, ry: sw * .5, shadow: 50 }); spotlight(ctx, W / 2, 380, 900);
        blockWord(ctx, 'KAMEL AMIN THABET', W / 2, 1300, t, T('V03', 'Kamel'), { size: 84, bg: KC.yellow, color: KC.red2 }); cred(ctx, 'eli_home'); } },
    { t0: L('V04') - .1, tr: 'flash', draw: (ctx, t, lt) => { starfield(ctx, t, 200, 4); const C3 = cam({ z: -1600 + lt * 260, x: Math.sin(lt * .5) * 60 });
        plate(ctx, 'morsekey', lt, { blur: 5, dark: .72, grade: 'bw', z0: 1.2, z1: 1.35, dur: 4 }); smoke(ctx, t, .2);
        floatWords3D(ctx, C3, [{ s: 'For', pos: [-260, -700, 200], t0: T('V04', 'For') }, { s: 'three', pos: [180, -560, 500], t0: T('V04', '3') }, { s: 'years,', pos: [-120, -360, 100], t0: T('V04', 'years,') },
          { s: 'the radio', pos: [220, -100, 700], t0: T('V04', 'radio') }, { s: 'never', pos: [-240, 150, 300], t0: T('V04', 'never') }, { s: 'stopped.', pos: [140, 360, 150], t0: T('V04', 'stopped.'), color: KC.red }], t, { focus: 300 + lt * 120, dof: .012 });
        cred(ctx, 'morsekey'); } },
    { t0: L('V05') - .1, tr: 'slide', draw: (ctx, t, lt) => { const C3 = cam({ z: -1500, rx: lerp(-.18, -.05, E.out(clamp(lt / 2))), rz: lerp(.08, 0, E.out(clamp(lt / 2))) }); card3d(ctx, woodTex(), C3, { pos: [0, 0, 300], w: 2300, n: [2, 2] });
        const p = E.out(clamp(lt / 1.1)); card3d(ctx, 'paper65', C3, { pos: [lerp(900, 0, p), lerp(-500, -40, p), lerp(-300, 120, p)], w: 900, rz: lerp(.9, -.05, p), curl: (1 - p) * .55, bend: .3 + (1 - p) * .6, shadow: lerp(120, 30, p) });
        if (t > T('V05', 'headlines.')) { const q = E.out(clamp((t - T('V05', 'headlines.')) / .4)); ctx.save(); ctx.strokeStyle = KC.red; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(W / 2, 760, 420, 120, -.04, -1.5, -1.5 + Math.PI * 2 * q); ctx.stroke(); ctx.restore(); }
        pillTag(ctx, '1965', 220, 330, t, T('V05', '1965,'), { size: 80 }); cred(ctx, 'paper65', 'Archive newspaper'); } },
    { t0: L('V06') - .1, tr: 'glitch', draw: (ctx, t, lt) => { plate(ctx, 'eli_golan', lt, { grade: 'bw', z0: 1.1, z1: 1.32, dur: 4, dark: .35, fy: .45 }); smoke(ctx, t, .25);
        grungeTitle(ctx, [{ s: 'ALMOST', color: KC.white, size: 190 }, { s: 'PRESIDENT?', color: KC.red, size: 170 }], W / 2, 560, t, T('V06', 'almost'), { rot: -.04 }); cred(ctx, 'eli_golan'); } },
    { t0: L('V07') - .1, tr: 'zoom', draw: (ctx, t, lt) => { starfield(ctx, t, 160, 3); smoke(ctx, t, .3); brandEnd(ctx, t, L('V07') + .1, 'DAGAR UNFILTERED', { y: 760, size: 160 });
        glassFollow(ctx, W / 2, 1160, t, L('V07') + .5, { tapAfter: 1.3 }); fadeOut(ctx, t, TL.duration, 1); } },
  ];
  shot(0, (ctx, t, lt) => { seq(ctx, t, S); kCaption(ctx, t, ['V01', 'V02', 'V03', 'V04', 'V05', 'V06', 'V07'], { y: 1560, size: 50 }); }, { name: 'kinetic', lead: 0 });
  // no whooshes on transitions (user preference); SFX only on story beats
  cue(L('V01') + .1, 'impact', .9); cue(T('V02', '1962,'), 'tick', .6); cue(T('V03', 'Kamel'), 'stamp', .7); cue(T('V05', 'headlines.'), 'scribble', .6); cue(T('V06', 'almost'), 'impact', .9); cue(L('V07') + 1.8, 'tick', .8);
}
