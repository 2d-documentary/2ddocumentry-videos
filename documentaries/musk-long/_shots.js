function scenes() {
  // KINETIC long video, data-driven: each row = [line, word, type, arg, opts]. No SFX on cuts.
  const tag = (ctx, k) => { const c = credit(k); if (c) sourceTag(ctx, c.length > 90 ? c.slice(0, 88) + '…' : c); };
  const ILL = 'Illustrative · Starship test footage, NASA', ILL2 = 'Illustrative · SpaceX launch 2024, CC BY 3.0';
  const TR = ['zoom', 'flash', 'blur', 'bar', 'zoom', 'pix', 'blur', 'glitch'];
  const wallA = ['p_2006', 'p_2008', 'p_2008b', 'p_2015', 'f1_omelek', 'p_roadster08', 'p_griffin', 'falconheavy', 'p_twitter', 'cybertruck', 'starship_ift5', 'p_doge'];
  const wallB = ['dragon_iss', 'modelS', 'f9_arc', 'roadster_space', 'demo2', 'p_model3', 'p_laugh', 'nasdaq26', 'p_starship', 'boring_tunnel', 'x_hq'];
  const SPOT = { p_griffin: [.89, .15, 'Elon Musk'], p_bolden: [.62, .3, 'Elon Musk'], p_obama: [.52, .4, 'Elon Musk'], p_franz: [.57, .35, 'Elon Musk'], p_twitter: [.77, .36, 'Elon Musk'] };
  const chips = (ctx, t, s0, n = 8, k = 1) => { for (let i = 0; i < n; i++) { const p = E.inOut(prog(t, s0 + i * .06, s0 + .45 + i * .06)), a = i / n * 6.28;
    chipStack(ctx, lerp(i % 2 ? W + 120 : -120, CX + Math.cos(a) * 190 * k, p), lerp(H + 100, H * .62 + Math.sin(a) * 80 * k, p), 100 * k, 7 + (i % 4), ['#C8322A', '#1F4FA8', '#111', '#E8B12E'][i % 4]); } };
  const cards = (ctx, t, s0, dy = 0) => { playingCard(ctx, CX - 130, H * .5 + dy, 230, '7', 'c', -.12, clamp(prog(t, s0 + .1, s0 + .4))); playingCard(ctx, CX + 130, H * .52 + dy, 230, '2', 'd', .1, clamp(prog(t, s0 + .3, s0 + .6))); };

  const DRAW = {
    ph: (ctx, t, lt, sh, a, o) => { if (o.shake) { const k = (hash(Math.floor(t * 30)) - .5) * o.shake; ctx.save(); ctx.translate(k, k * .6); } kPhoto(ctx, a, lt, { z0: o.z0 ?? 1.14 * (lt > .9 ? 1.08 : 1), zs: o.zs, grade: o.grade || 'mood', fx: o.fx, fy: o.fy, shade: o.shade, pull: o.pull }); if (o.shake) ctx.restore();
      if (o.snow) snow(ctx, t, 100); if (o.leak) lightLeak(ctx, t, .3); if (o.embers) embers(ctx, t, .6); if (o.cracks) cracks(ctx, CX, H * .45, prog(t, T(...o.cracks), T(...o.cracks) + .4));
      if (o.stamp) stamp(ctx, o.stamp[0], CX, H * .4, t, T(o.stamp[1], o.stamp[2]), { size: 130, color: '#D7261E' }); kGrade(ctx, t); if (o.note) sourceTag(ctx, o.note + ' · ' + (credit(a) || '').slice(0, 60)); else tag(ctx, a); },
    spot: (ctx, t, lt, sh, a, o) => { const s = SPOT[a], op = { zoom: o.zoom || 1.15, fx: lerp(o.fx0 ?? .3, s[0], E.inOut(prog(lt, 0, .7))), fy: s[1], grade: 'mood' }; photo(ctx, a, op);
      const [x, y] = photoPt(a, op, s[0], s[1]); spotlight(ctx, x, y, o.r || 170, (o.r || 170) * 1.2, prog(lt, .6, 1), { name: s[2] }); kGrade(ctx, t); tag(ctx, a); },
    wall: (ctx, t, lt, sh, a) => { photoWall(ctx, t, a === 'B' ? wallB : wallA, { pan: 1.4 }); kGrade(ctx, t, { bloom: .35 }); },
    big: (ctx, t, lt, sh, a, o) => { bigWord(ctx, a, lt, { italic: o.italic !== false }); },
    chap: (ctx, t, lt, sh, a) => { bgGrad(ctx, '#0B0D14', '#000', 'r'); const p = E.out(prog(lt, 0, .5)); ctx.fillStyle = '#E6F23C'; ctx.fillRect(CX - 60 * p, H * .36, 120 * p, 4); bigWord(ctx, a, lt, { italic: true, keepBG: true, size: 190 }); },
    num: (ctx, t, lt, sh, a, o) => { glowNum(ctx, o.from || 0, a, lt, { pre: '$', y: .42, dur: 1.2, sub: o.sub }); if (o.rain) moneyRain(ctx, t, sh.start + .5, 'bill100', EP.billCrop, 40, { spread: 1.2 }); },
    head: (ctx, t, lt, sh, a, o) => { headline(ctx, lt, a, { kicker: true, hl: o.hl, y: .3, size: 110, x: 160 }); },
    cal: (ctx, t, lt, sh, a, o) => { calendarPage(ctx, lt, a[0], a[1], { year: a[2], start: a[3] ?? 1, len: a[4] }); if (o.snow) snow(ctx, t, 90); },
    clip: (ctx, t, lt, sh, a, o) => { clipFrame(ctx, a[0], a[1], lt, { from: o.from || 0, z0: o.z0 || 1.15, fx: o.fx, fy: o.fy, grade: o.grade || 'cine', shake: o.shake }); if (o.boom) boom(ctx, CX, H * .5, t, sh.start + .1, 1100); kGrade(ctx, t, { bloom: .45 }); sourceTag(ctx, a[0].startsWith('boom') || a[0] === 'up' ? ILL : ILL2); },
    crt: (ctx, t, lt, sh, a, o) => { crt(ctx, a, lt, { draw: o.txt ? (x, y, w, h) => { ctx.fillStyle = '#0B1A33'; ctx.fillRect(x, y, w, h); text(ctx, o.txt, x + w / 2, y + h / 2 + 30, { font: F.osw, size: 110, color: '#9FD1FF', align: 'center', weight: 600, shadow: 20 }); } : null }); kGrade(ctx, t); if (!o.txt) tag(ctx, a); },
    doc: (ctx, t, lt, sh, a) => { desk(ctx, t); card(ctx, a, { cx: CX, cy: H * .48, maxW: W * .55, maxH: H * .78, rot: -.03, scale: 1.04 + lt * .03 }); kGrade(ctx, t); tag(ctx, a); },
    felt: (ctx, t, lt, sh, a) => { feltTable(ctx, t);
      if (a === 'chips') chips(ctx, t, sh.start); else if (a === 'hand') cards(ctx, t, sh.start); else if (a === 'fold') cards(ctx, t, sh.start - 1, -E.in(prog(lt, .5, 1)) * 1100);
      else if (a === 'sweep') { ctx.save(); ctx.globalAlpha = 1 - prog(lt, .6, 1.3); chips(ctx, sh.start - 3, 0); ctx.restore(); shade(ctx, .3); } else if (a === 'glow') { chips(ctx, sh.start - 3, 0); lightLeak(ctx, t, .25); }
      kGrade(ctx, t); },
    desk: (ctx, t, lt, sh, a) => { desk(ctx, t); const s0 = sh.start; polaroid(ctx, 'p_2008', W * .3, H * .42, 360, -.1, prog(t, s0, s0 + .25), { label: 'Elon, 2008' }); polaroid(ctx, 'p_2008b', W * .55, H * .55, 320, .12, prog(t, s0 + .2, s0 + .45));
      cashStack(ctx, W * .78, H * .8, .7, 2); sticky(ctx, a, W * .78, H * .32, .06, prog(t, s0 + .45, s0 + .7)); yString(ctx, [W * .3, H * .22], [W * .55, H * .38], prog(t, s0 + .3, s0 + .7)); kGrade(ctx, t); },
    rockets: (ctx, t, lt, sh) => { bgGrad(ctx, '#0B0E16', '#000', 'r'); hudRockets(ctx, t, sh.start + .05, CX - 150, H * .72); kGrade(ctx, t); },
    orbit: (ctx, t, lt) => { orbitRing(ctx, t, lt); kGrade(ctx, t, { bloom: .4 }); },
    mars: (ctx, t, lt) => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); stars(ctx, t, 160, 3); photo(ctx, 'mars', { x: CX - H * .38, y: H * .12, w: H * .76, h: H * .76, zoom: 1 + lt * .04, grade: 'cine' }); kGrade(ctx, t, { bloom: .45 }); tag(ctx, 'mars'); },
    split: (ctx, t, lt, sh, a) => { const p = E.inOut(prog(lt, 0, .5)); photo(ctx, a[0], { x: 0, y: 0, w: W / 2 - 4, h: H, zoom: 1.1 + lt * .03, grade: 'mood' }); photo(ctx, a[1], { x: W / 2 + 4, y: H * (1 - p), w: W / 2 - 4, h: H, zoom: 1.1 + lt * .03, grade: 'mood' }); ctx.fillStyle = '#000'; ctx.fillRect(W / 2 - 4, 0, 8, H); kGrade(ctx, t); },
    stack: (ctx, t, lt, sh, a) => { desk(ctx, t, { a: '#1C1610' }); cashStack(ctx, CX, H * .62, 1.3, Math.max(1, 6 - Math.floor(lt * 5))); kGrade(ctx, t); },
    tweet: (ctx, t, lt, sh, a) => { bgGrad(ctx, '#0B1220', '#000', 'r'); postCard(ctx, CX, H * .45, 1000, a, t, sh.start, { name: 'Elon Musk', handle: '@elonmusk', date: 'Aug 7, 2018', h: 330 }); kGrade(ctx, t); },
    jump: (ctx, t, lt, sh, a, o) => { const k = T(...o.at), p = E.out(prog(t, k - .1, k + .5)), q = E.in(prog(t, k + .6, k + 1.1)), up = p * (1 - q);
      ctx.save(); const sk = up > .02 ? (hash(Math.floor(t * 30)) - .5) * 16 : 0; ctx.translate(sk, sk * .5); photo(ctx, a, { zoom: 1.12 + lt * .03, fx: .5, fy: .5 + up * .35, grade: 'cine' }); ctx.restore();
      if (up > .02) { speedLines(ctx, t); const g = ctx.createRadialGradient(CX, H, 0, CX, H, H * .6); g.addColorStop(0, `rgba(255,220,160,${.75 * up})`); g.addColorStop(.4, `rgba(255,120,40,${.45 * up})`); g.addColorStop(1, 'rgba(255,80,20,0)'); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
      kGrade(ctx, t, { bloom: .4 }); sourceTag(ctx, 'Roadster prototype (2017 reveal) · ' + (credit(a) || '').slice(0, 60)); },
    dark: (ctx, t, lt) => { bgGrad(ctx, '#0E1018', '#000', 'r'); fog(ctx, t, .2); kGrade(ctx, t); },
    roadorbit: (ctx, t, lt) => { bgGrad(ctx, '#05070D', '#000', 'r'); stars(ctx, t, 160, 3); const sx = CX, sy = H / 2; const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 120); g.addColorStop(0, '#FFF6D8'); g.addColorStop(.3, '#FFC34D'); g.addColorStop(1, 'rgba(255,150,40,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 120, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(120,180,255,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, sy, 230, 0, 7); ctx.stroke(); ctx.strokeStyle = 'rgba(232,33,39,.85)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(sx + 40, sy, 420, 330, 0, 0, 7); ctx.stroke();
      const an = lt * 1.2, rx = sx + 40 + Math.cos(an) * 420, ry = sy + Math.sin(an) * 330; ctx.fillStyle = '#E82127'; ctx.shadowColor = '#E82127'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(rx, ry, 12, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      text(ctx, 'ROADSTER', rx, ry - 26, { font: F.osw, size: 28, color: '#FF8A8A', align: 'center', weight: 600, ls: 4 }); kGrade(ctx, t, { bloom: .4 }); },
  };
  const P = [
    ['L001', 'Elon', 'ph', 'p_2015', { grade: 'ink', fy: .3, tr: 'black' }], ['L001', 'all', 'felt', 'chips', { capY: .3 }], ['L001', 'sane', 'ph', 'p_laugh', { fy: .3 }],
    ['L002', 'And', 'wall', 'A'], ['L002', 'house', 'felt', 'hand', { capY: .25 }], ['L002', 'stop', 'ph', 'p_doge', { grade: 'cine', fy: .5, z0: 1.02 }],
    ['L003', 'Every', 'wall', 'B'], ['L003', 'same', 'felt', 'hand', { capY: .25, capMode: 'caps' }], ['L003', 'Put', 'felt', 'chips', { capY: .25 }], ['L003', 'Hope', 'felt', 'hand', { capY: .25 }],
    ['L004', 'So', 'big', 'every hand.', { cap: false }],
    ['L005', 'Hand', 'chap', 'hand one.', { cap: false, name: 'ch1' }], ['L005', 'Pretoria', 'ph', 'pretoria', { grade: 'cine' }], ['L005', '1971', 'big', '1971', { cap: false, italic: false }],
    ['L006', 'Elon', 'ph', 'kingston', { grade: 'ink', shade: .35, capMode: 'stack' }], ['L006', 'When', 'dark', 0, { capMode: 'box' }], ['L006', 'encyclopedia', 'big', 'the encyclopedia.', { cap: false }], ['L006', 'For', 'dark', 0, {}],
    ['L007', 'At', 'dark', 0, { capMode: 'caps' }], ['L007', 'So', 'crt', 'compaq', {}],
    ['L008', 'At', 'doc', 'blastar', { capY: .85 }], ['L008', 'sells', 'num', 500, { capY: .62 }],
    ['L009', 'Twelve', 'ph', 'p_starship', { grade: 'cine' }], ['L009', 'Some', 'ph', 'roadster_space', { grade: 'cine' }],
    ['L010', 'At', 'ph', 'kingston', { grade: 'mood' }], ['L010', 'Then', 'ph', 'upenn', { grade: 'mood' }], ['L010', 'Physics', 'dark', 0, { capMode: 'box' }],
    ['L011', 'In', 'ph', 'stanford', { grade: 'cine' }], ['L011', 'two', 'big', 'two days.', { cap: false }],
    ['L012', 'Some', 'crt', 'stanford', { capMode: 'caps', capY: .88 }],
    ['L013', 'Because', 'wall', 'B'], ['L013', 'Elon', 'ph', 'p_2006', { grade: 'mood', fy: .3 }],
    ['L014', 'With', 'ph', 'p_2008c', { fy: .3 }], ['L014', 'Zip2', 'head', ['1995', 'Zip2:', 'online city guides', 'for newspapers'], { hl: [1, 'Zip2:'], capDark: true, capY: .86 }],
    ['L015', 'Money', 'desk', 'SLEEPS AT\nTHE OFFICE', {}], ['L015', 'showers', 'ph', 'ymca', { grade: 'cine' }],
    ['L016', 'Then', 'ph', 'compaq', { grade: 'mood' }], ['L016', 'Compaq', 'head', ['FEBRUARY 1999', 'Compaq buys Zip2', 'for $307 million'], { hl: [2, '$307 million'], capDark: true, capY: .86 }], ['L016', 'cut', 'num', 22000000, { capY: .62 }],
    ['L017', 'So', 'ph', 'mclaren', { grade: 'warm' }], ['L017', 'crashes', 'ph', 'mclaren', { grade: 'ink', shake: 24, tr: 'glitch' }], ['L017', 'No', 'ph', 'mclaren', { grade: 'ink', shade: .4, stamp: ['NO INSURANCE', 'L017', 'No'] }],
    ['L018', 'First', 'felt', 'chips', { capY: .3 }], ['L018', 'Barely', 'ph', 'mclaren', { grade: 'mood', pull: true }],
    ['L019', 'Hand', 'chap', 'hand two.', { cap: false, name: 'ch2' }], ['L019', 'He', 'ph', 'p_2008', { fy: .3 }], ['L019', 'online', 'crt', 0, { txt: 'X.com', capY: .9 }],
    ['L020', 'It', 'ph', 'paypal_hq', { grade: 'cine' }], ['L020', 'PayPal', 'ph', 'paypal_hq', { z0: 1.4, grade: 'cine' }],
    ['L021', 'In', 'big', '2000.', { cap: false, italic: false }], ['L021', 'while', 'dark', 0, { capMode: 'stack' }], ['L021', 'board', 'ph', 'p_2006', { grade: 'ink', shade: .3, stamp: ['FIRED', 'L021', 'fires'] }],
    ['L022', 'Fired', 'ph', 'p_2006', { grade: 'ink', pull: true, capMode: 'caps' }], ['L022', 'cold', 'ph', 'p_2006', { grade: 'ink', snow: true }],
    ['L023', 'But', 'head', ['JULY 2002', 'eBay buys PayPal', 'for $1.5 billion'], { hl: [2, '$1.5 billion'], capDark: true, capY: .86 }], ['L023', 'Elon', 'num', 180000000, { rain: true, capY: .62 }],
    ['L024', 'Any', 'felt', 'fold', { capY: .25, capMode: 'caps' }],
    ['L025', 'Elon', 'ph', 'p_2008b', { fy: .3 }], ['L025', 'rockets', 'clip', ['ign', 35], { from: 10, z0: 2, fx: .5, fy: .62 }],
    ['L026', 'Hand', 'chap', 'hand three.', { cap: false, name: 'ch3' }],
    ['L027', 'He', 'mars', 0, { capY: .9 }], ['L027', 'Russia', 'ph', 'redsquare', { grade: 'cine' }], ['L027', 'missiles', 'ph', 'ussr_missile', { grade: 'ink' }],
    ['L028', 'It', 'ph', 'dnepr', { grade: 'mood' }], ['L028', 'Turns', 'ph', 'redsquare', { grade: 'ink', snow: true, capMode: 'box' }],
    ['L029', 'On', 'ph', 'p_2006', { grade: 'mood', fy: .3 }], ['L029', 'SpaceX', 'ph', 'f1_omelek', { grade: 'cine' }],
    ['L030', 'Then', 'ph', 'p_roadster08', {}], ['L030', 'Tesla', 'ph', 'p_roadster08', { z0: 1.4, grade: 'cine' }],
    ['L031', 'Two', 'split', ['f1_omelek', 'p_roadster08'], { capMode: 'caps' }],
    ['L032', 'Falcon', 'rockets', 0, { capY: .3 }], ['L032', 'crashes', 'clip', ['boom', 32], { from: 21, z0: 1.4, shake: 22, tr: 'flash' }],
    ['L033', 'Flight', 'clip', ['ign', 35], { from: 14, z0: 2.2, fy: .66, grade: 'fire', boom: true, shake: 18 }],
    ['L034', 'Flight', 'ph', 'f1_2009', { grade: 'ink', shake: 16, tr: 'glitch' }], ['L034', 'fails', 'clip', ['boom2', 32], { z0: 1.4, grade: 'fire', shake: 18 }],
    ['L035', 'Tesla\'s', 'ph', 'p_roadster08', { grade: 'mood' }], ['L035', 'financial', 'ph', 'lehman', { grade: 'ink' }], ['L035', 'hits', 'head', ['SEPTEMBER 15, 2008', 'Lehman Brothers', 'files for bankruptcy'], { hl: [2, 'bankruptcy'], capDark: true, capY: .86 }],
    ['L036', 'His', 'ph', 'p_2008', { grade: 'ink', fy: .3 }], ['L036', 'borrowing', 'desk', 'RENT\nDUE', { capMode: 'box' }],
    ['L037', 'He', 'big', '2008.', { cap: false, italic: false }], ['L037', 'worst', 'ph', 'p_2008c', { grade: 'ink', shade: .3, fy: .3 }],
    ['L038', 'And', 'felt', 'hand', { capY: .25 }], ['L038', 'takes', 'felt', 'chips', { capY: .25 }], ['L038', 'splits', 'split', ['f1_flight4', 'p_roadster08'], {}],
    ['L039', 'Enough', 'stack', 0, { capY: .3 }],
    ['L040', 'September', 'cal', ['SEPTEMBER', 28, '2008', 1, 30], { capY: .92 }], ['L040', 'Falcon', 'ph', 'f1_flight4', { grade: 'cine', shake: 14, embers: true, tr: 'flash' }],
    ['L041', 'And', 'clip', ['rise', 38], { z0: 1.5, fx: .42, fy: .55, capMode: 'stack' }], ['L041', 'It', 'orbit', 0, { capY: .42 }],
    ['L042', 'Days', 'cal', ['DECEMBER', 23, '2008', 1], { capY: .92 }], ['L042', 'NASA', 'spot', 'p_griffin', { fx0: .3, capY: .86 }], ['L042', 'billion', 'num', 1600000000, { capY: .62 }],
    ['L043', 'And', 'cal', ['DECEMBER', 24, '2008', 1], { snow: true, capY: .92 }], ['L043', 'Tesla\'s', 'head', ['DECEMBER 24, 2008', 'Tesla closes', 'a $40 million funding round'], { hl: [2, '$40 million'], capDark: true, capY: .86 }],
    ['L044', 'Two', 'split', ['f1_flight4', 'p_roadster08'], {}], ['L044', 'Santa', 'ph', 'p_2008b', { grade: 'warm', snow: true, leak: true, fy: .3 }],
    ['L045', 'Hand', 'chap', 'hand four.', { cap: false, name: 'ch4' }], ['L045', 'chips', 'felt', 'chips', { capY: .25 }],
    ['L046', '2012.', 'ph', 'dragon_iss', { grade: 'cine' }], ['L046', 'first', 'spot', 'p_bolden', { fx0: .3, capY: .86 }],
    ['L047', 'Tesla\'s', 'ph', 'modelS', { grade: 'cine' }], ['L047', 'suddenly', 'ph', 'p_model3', { grade: 'cine' }],
    ['L048', '2015.', 'ph', 'f9_arc', { grade: 'cine' }], ['L048', 'comes', 'ph', 'f9_lz1', { grade: 'cine' }], ['L048', 'parks', 'ph', 'f9_night', { grade: 'cine' }],
    ['L049', '2018.', 'ph', 'falconheavy', { grade: 'cine', shake: 10 }], ['L049', 'cherry', 'ph', 'roadster_space', { grade: 'cine' }], ['L049', 'dummy', 'ph', 'roadster_space2', { grade: 'cine' }],
    ['L050', 'It\'s', 'roadorbit', 0, { capY: .85 }], ['L050', 'expensive', 'ph', 'roadster_space', { grade: 'cine', pull: true }],
    ['L051', 'But', 'spot', 'p_twitter', { fx0: .3, capY: .86 }], ['L051', 'Some', 'dark', 0, { capMode: 'caps' }],
    ['L052', 'In', 'tweet', 'Am considering taking Tesla private at $420. Funding secured.', { capY: .85 }],
    ['L053', 'It', 'ph', 'p_2008b', { grade: 'ink', shade: .4, stamp: ['NOT SECURED', 'L053', 'It'] }], ['L053', 'Regulators', 'num', 20000000, { sub: 'each', capY: .62 }],
    ['L054', 'Then', 'ph', 'cybertruck', { grade: 'cine' }], ['L054', 'designer', 'ph', 'cybertruck', { grade: 'cine', z0: 1.4, cracks: ['L054', 'breaks'] }], ['L054', 'Twice', 'big', 'twice.', { cap: false }],
    ['L055', 'Hand', 'chap', 'hand five.', { cap: false, name: 'ch5' }], ['L055', 'expensive', 'ph', 'twitter_hq', { grade: 'cine' }],
    ['L056', 'In', 'num', 44000000000, { capY: .62 }], ['L056', 'back', 'ph', 'p_twitter', { grade: 'mood' }], ['L056', 'anyway', 'ph', 'twitter_hq2', { grade: 'cine' }],
    ['L057', 'He', 'ph', 'sink', { grade: 'cine' }], ['L057', 'Let', 'ph', 'sink', { grade: 'cine', z0: 1.5, capMode: 'caps' }],
    ['L058', 'He', 'ph', 'x_hq', { grade: 'mood' }], ['L058', 'renames', 'big', 'X.', { cap: false, italic: false }],
    ['L059', 'Then', 'ph', 'p_doge', { grade: 'cine', fy: .5, z0: 1.02 }], ['L059', 'Hero', 'split', ['p_doge', 'p_laugh'], { capMode: 'caps' }], ['L059', 'few', 'ph', 'p_doge', { grade: 'ink', fy: .5, z0: 1.05, pull: true }],
    ['L060', 'Meanwhile', 'ph', 'ship39', { grade: 'cine' }], ['L060', 'Starship', 'ph', 'starship_pad', { grade: 'cine' }],
    ['L061', 'The', 'ph', 'starship_ift2', { grade: 'cine' }], ['L061', 'blows', 'clip', ['ign', 35], { from: 18, z0: 2.3, fy: .66, grade: 'fire', boom: true, shake: 22, tr: 'flash' }], ['L061', 'rapid', 'head', ['APRIL 20, 2023', 'SpaceX: a "rapid', 'unscheduled disassembly"'], { hl: [2, 'unscheduled disassembly"'], capDark: true, capY: .86 }],
    ['L062', 'Which', 'clip', ['ign', 35], { from: 8, z0: 2.6, fy: .7, grade: 'fire', shake: 26, boom: true, tr: 'glitch', capMode: 'stack' }],
    ['L063', 'But', 'ph', 'starship_ift5', { grade: 'cine' }], ['L063', 'tower', 'clip', ['tower', 44], { z0: 2.4, fx: .62, fy: .55 }], ['L063', 'catches', 'clip', ['tower', 44], { from: 20, z0: 3, fx: .64, fy: .55 }],
    ['L064', 'Hand', 'chap', 'hand six.', { cap: false, name: 'ch6' }],
    ['L065', 'In', 'crt', 0, { txt: 'xAI', capY: .9 }], ['L065', 'xAI', 'big', 'xAI.', { cap: false, italic: false }],
    ['L066', 'In', 'ph', 'nasdaq26', { grade: 'cine' }], ['L066', 'raises', 'num', 75000000000, { capY: .62 }], ['L066', 'biggest', 'ph', 'nasdaq', { grade: 'cine' }],
    ['L067', 'By', 'num', 1100000000000, { rain: true, capY: .62 }], ['L067', 'first', 'ph', 'p_royal', { grade: 'cine', fy: .3 }],
    ['L068', 'The', 'rockets', 0, { capY: .3 }], ['L068', 'borrowed', 'desk', 'RENT\nDUE', { capMode: 'box' }],
    ['L069', 'Tesla', 'ph', 'cybercab1', { grade: 'cine' }], ['L069', 'steering', 'ph', 'cybercab1', { grade: 'cine', z0: 1.6, fx: .42, fy: .5, capMode: 'caps' }],
    ['L070', 'By', 'crt', 'cybercab2', { capY: .9 }],
    ['L071', 'And', 'cal', ['SEPTEMBER', 28, '2026', 2, 30], { capY: .92 }], ['L071', 'eighteen', 'split', ['f1_flight4', 'starship_11'], {}], ['L071', 'Starship', 'ph', 'starship_iss', { grade: 'cine' }],
    ['L072', 'Then', 'cal', ['OCTOBER', 15, '2026', 4], { capY: .92 }], ['L072', 'Roadster', 'ph', 'roadster2b', { grade: 'cine', note: 'Roadster prototype (2017 reveal)' }], ['L072', 'Almost', 'big', 'ten years late.', { cap: false }],
    ['L073', 'Zero', 'big', '0–60 in < 1 s', { cap: false, italic: false }], ['L073', 'SpaceX', 'jump', 'roadster2b', { at: ['L073', 'jump'] }],
    ['L074', 'His', 'ph', 'p_laugh', { grade: 'mood', fy: .3 }], ['L074', 'Turns', 'dark', 0, { capMode: 'stack' }],
    ['L075', 'Production', 'big', '2028.', { cap: false, italic: false }], ['L075', 'Reserving', 'num', 250000, { capY: .62 }],
    ['L076', 'And', 'felt', 'chips', { capY: .25 }], ['L076', 'Remember', 'ph', 'cybertruck', { grade: 'cine' }], ['L076', 'Tesla', 'ph', 'cybertruck', { grade: 'ink', shade: .4, stamp: ['WINDING DOWN', 'L076', 'winding'] }],
    ['L077', 'SpaceX', 'split', ['f9_lz1', 'modelS'], {}], ['L077', 'merge', 'big', 'one company.', { cap: false }],
    ['L078', 'And', 'num', 850000000000, { from: 1100000000000, capY: .62 }], ['L078', 'Forbes', 'ph', 'p_2015', { grade: 'ink', fy: .3 }],
    ['L079', 'Which', 'desk', 'RENT\nDUE', { capMode: 'box' }],
    ['L080', 'So', 'ph', 'p_laugh', { grade: 'mood', fy: .3 }], ['L080', 'lucky', 'ph', 'p_royal', { grade: 'ink', fy: .3 }],
    ['L081', 'Honestly', 'ph', 'p_2015', { grade: 'ink', fy: .3, pull: true }],
    ['L082', 'Most', 'felt', 'sweep', { capY: .3 }], ['L082', 'you', 'dark', 0, {}],
    ['L083', 'Elon', 'ph', 'p_royal', { grade: 'cine', fy: .3 }], ['L083', 'still', 'felt', 'glow', { capY: .3 }],
  ];
  P.forEach(([id, w, type, a, o = {}], i) => {
    const tr = o.tr || TR[i % TR.length];
    shot([id, w], (ctx, t, lt, sh) => { DRAW[type](ctx, t, lt, sh, a, o); kIn(ctx, lt, tr); }, { cap: o.cap, capY: o.capY, capMode: o.capMode, capDark: o.capDark, name: o.name, lead: i === 0 ? .4 : undefined });
  });
  // story SFX only (no sounds on cuts)
  cue(T('L032', 'crashes'), 'impact', .7); cue(T('L033', 'fails'), 'impact', .6); cue(T('L034', 'fails'), 'impact', .6); cue(T('L061', 'blows'), 'impact', .8);
  cue(T('L017', 'crashes'), 'thud', .7); cue(T('L021', 'fires'), 'stamp', .7); cue(T('L053', 'It'), 'stamp', .7); cue(T('L017', 'No'), 'stamp', .7);
  cue(T('L023', 'Elon') + .5, 'cash', .5); cue(T('L067', 'By') + .5, 'cash', .5); cue(T('L076', 'winding'), 'stamp', .7); cue(T('L054', 'breaks'), 'impact', .5);
  cue(T('L041', 'shit') - .02, 'beep', 1, T('L041', 'shit', 'e') - T('L041', 'shit') + .06); cue(T('L062', 'fuck') - .02, 'beep', 1, T('L062', 'fuck', 'e') - T('L062', 'fuck') + .06);
  // silent end card
  shot(LINE['L083'].end + .6, (ctx, t, lt) => { bgGrad(ctx, '#0A0C14', '#000', 'r'); stars(ctx, t, 120, 2, .5); ctx.save(); ctx.globalAlpha = E.out(prog(lt, 0, .6));
    glowText(ctx, 'Dagar Unfiltered', CX, H * .52, { font: F.play, size: 120, color: '#fff', align: 'center', glow: 'rgba(255,255,255,.8)', blur: 50 }); ctx.restore(); kIn(ctx, lt, 'blur'); fadeOut(ctx, t, TL.duration, .6); }, { cap: false, brandOff: true });
  kfinish();
}
