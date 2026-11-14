// ===== DAGU: the Dagar Unfiltered stickman mascot (pops in, talks to the viewer, cracks jokes) =====
// Script: lines with "speaker": "DAGU" (+ optional "pose": wave|point|shrug|laugh|facepalm|think|shock).
// In scenes(): call daguLayer(ctx, t) after the visuals; leave DAGU line ids out of the normal captions.
const DAGU = { ink: '#0A0A0A', body: '#F7F5F0', cap: '#E0262B' };
function daguLines() { return TL.lines.filter(l => l.speaker === 'DAGU'); }
function daguTalking(L, t) { return L.words.some(w => t >= w.s && t <= w.e + .02); }
// arm/leg angles (radians, 0 = pointing down), per pose; [upper, lower] for left and right arm
const DAGU_POSES = {
  idle: { la: [.35, .2], ra: [-.35, -.2] }, wave: { la: [.35, .2], ra: [-2.6, -.6] }, point: { la: [.35, .2], ra: [1.75, .1] },
  shrug: { la: [1.25, -1.9], ra: [-1.25, 1.9] }, laugh: { la: [.9, 1.6], ra: [-.9, -1.6] }, facepalm: { la: [.35, .2], ra: [-1.0, -2.3] },
  think: { la: [.4, .9], ra: [-.75, -2.4] }, shock: { la: [2.2, .5], ra: [-2.2, -.5] } };
function daguFigure(ctx, x, y, s, t, o = {}) {   // (x, y) = feet; s = scale (1 = 600 px tall)
  const pose = DAGU_POSES[o.pose] || DAGU_POSES.idle, talk = o.talk, k = s * 600;
  const bob = Math.sin(t * 3.2) * k * .006 + (o.pose === 'laugh' ? Math.sin(t * 28) * k * .008 : 0);
  const hip = [x, y - k * .42 + bob], neck = [x, y - k * .74 + bob], head = [x, y - k * .86 + bob], hr = k * .12;
  const lw = k * .028;
  const seg = (p, a, len) => [p[0] + Math.sin(a) * len, p[1] + Math.cos(a) * len];
  let wave = o.pose === 'wave' ? Math.sin(t * 9) * .35 : 0;
  const lE = seg(neck, pose.la[0], k * .16), lH = seg(lE, pose.la[0] + pose.la[1], k * .15);
  const rE = seg(neck, pose.ra[0], k * .16), rH = seg(rE, pose.ra[0] + pose.ra[1] + wave, k * .15);
  const step = o.walk ? Math.sin(t * 12) * .25 : 0;
  const lK = seg(hip, .22 + step, k * .21), lF = seg(lK, .05 + step, k * .21), rK = seg(hip, -.22 - step, k * .21), rF = seg(rK, -.05 - step, k * .21);
  const stroke = (pts, w, c) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(...pts[0]); pts.slice(1).forEach(p => ctx.lineTo(...p)); ctx.stroke(); };
  ctx.save();
  // soft shadow
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y + k * .01, k * .17, k * .025, 0, 0, 7); ctx.fill();
  for (const [w, c] of [[lw * 2.2, DAGU.ink], [lw, DAGU.body]]) {
    stroke([lF, lK, hip, rK, rF], w, c); stroke([hip, neck], w, c); stroke([lH, lE, neck, rE, rH], w, c);
  }
  // hands
  [lH, rH].forEach(p => { ctx.fillStyle = DAGU.ink; ctx.beginPath(); ctx.arc(p[0], p[1], lw * 1.4, 0, 7); ctx.fill(); ctx.fillStyle = DAGU.body; ctx.beginPath(); ctx.arc(p[0], p[1], lw * .9, 0, 7); ctx.fill(); });
  // head
  const tilt = o.pose === 'think' ? -.12 : o.pose === 'shrug' ? .1 : Math.sin(t * 1.3) * .04;
  ctx.translate(head[0], head[1]); ctx.rotate(tilt);
  ctx.fillStyle = DAGU.body; ctx.strokeStyle = DAGU.ink; ctx.lineWidth = lw * 1.1; ctx.beginPath(); ctx.arc(0, 0, hr, 0, 7); ctx.fill(); ctx.stroke();
  // red cap (brand)
  ctx.fillStyle = DAGU.cap; ctx.beginPath(); ctx.arc(0, -hr * .15, hr * 1.02, Math.PI * 1.08, Math.PI * 1.92); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(hr * .75, -hr * .38, hr * .55, hr * .14, -.15, 0, 7); ctx.fill(); ctx.stroke();
  // eyes
  const blink = (t % 3.7) < .12, shock = o.pose === 'shock', laugh = o.pose === 'laugh';
  ctx.fillStyle = DAGU.ink; ctx.strokeStyle = DAGU.ink; ctx.lineWidth = lw * .7;
  [-1, 1].forEach(d => { const ex = d * hr * .38, ey = hr * .05;
    if (laugh) { ctx.beginPath(); ctx.arc(ex, ey + hr * .06, hr * .14, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    else if (blink) { ctx.beginPath(); ctx.moveTo(ex - hr * .12, ey); ctx.lineTo(ex + hr * .12, ey); ctx.stroke(); }
    else { ctx.beginPath(); ctx.ellipse(ex, ey, hr * (shock ? .14 : .1), hr * (shock ? .18 : .14), 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + hr * .03, ey - hr * .05, hr * .035, 0, 7); ctx.fill(); ctx.fillStyle = DAGU.ink; }
    // brows
    ctx.beginPath(); const by = ey - hr * (shock ? .42 : .3), tiltB = o.pose === 'facepalm' || o.pose === 'think' ? d * .25 : shock ? -d * .1 : 0;
    ctx.moveTo(ex - hr * .16, by + tiltB * hr * .3); ctx.lineTo(ex + hr * .16, by - tiltB * hr * .3); ctx.stroke(); });
  // mouth: opens and closes on the spoken words
  const open = talk ? (.35 + .65 * Math.abs(Math.sin(t * 17))) : (laugh ? .8 : shock ? .9 : 0);
  ctx.fillStyle = DAGU.ink;
  if (open > .05) { ctx.beginPath(); ctx.ellipse(0, hr * .48, hr * (laugh ? .32 : .22), hr * .2 * open, 0, 0, 7); ctx.fill(); ctx.fillStyle = DAGU.cap; ctx.beginPath(); ctx.ellipse(0, hr * .48 + hr * .1 * open, hr * .12, hr * .06 * open, 0, 0, 7); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(0, hr * .32, hr * .25, Math.PI * .2, Math.PI * .8); ctx.stroke(); }
  ctx.restore();
  return { head: [head[0], head[1] - hr] };
}
function daguBubble(ctx, L, t, x, y, maxW) {   // speech bubble, words appear as they are spoken
  const m = MN(), size = m * .036, pad = size * .7, shown = L.words.filter(w => t >= w.s - .05);
  if (!shown.length) return; ctx.save(); ctx.font = `800 ${size}px ${F.inter}, Emoji`;
  const lines = [], all = L.words.map(w => w.w); let cur = '';
  all.forEach(w => { const tst = cur ? cur + ' ' + w : w; if (ctx.measureText(tst).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tst; }); if (cur) lines.push(cur);
  const bw = Math.min(maxW, Math.max(...lines.map(l => ctx.measureText(l).width))) + pad * 2, bh = lines.length * size * 1.25 + pad * 1.6;
  const bx = x - bw, by = y - bh, p = E.back(clamp((t - L.start + .1) / .25));
  ctx.translate(x, y); ctx.scale(p, p); ctx.translate(-x, -y);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = DAGU.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, size * .6); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - bw * .18, y - 2); ctx.lineTo(x + size * .6, y + size * .9); ctx.lineTo(x - bw * .05, y - 2); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.fillRect(x - bw * .17, y - 6, bw * .11, 8);
  let n = 0; ctx.textBaseline = 'top';
  lines.forEach((ln, i) => { let xx = bx + pad; ln.split(' ').forEach(w => { const vis = n < shown.length; ctx.fillStyle = vis ? DAGU.ink : 'rgba(0,0,0,.12)'; ctx.fillText(w, xx, by + pad * .8 + i * size * 1.25); xx += ctx.measureText(w + ' ').width; n++; }); });
  ctx.restore();
}
function daguLayer(ctx, t, o = {}) {
  const L = daguLines().find(l => t >= l.start - .45 && t <= l.end + .45); if (!L) return;
  const vert = H > W, inP = E.back(clamp((t - (L.start - .45)) / .4)), outP = E.in(clamp((t - L.end - .1) / .35));
  const s = (vert ? .62 : .58) * H / 600 * (o.scale || 1), x = W - (vert ? W * .22 : W * .14) + (1 - inP) * W * .4 + outP * W * .4, y = H * (vert ? .9 : .97);
  ctx.save(); ctx.fillStyle = `rgba(0,0,0,${.35 * Math.min(inP, 1 - outP)})`; ctx.fillRect(0, 0, W, H); ctx.restore();
  const pose = (TL.lines.find(l => l.id === L.id) || {}).pose || L.pose || 'wave';
  const f = daguFigure(ctx, x, y, s, t, { pose, talk: daguTalking(L, t), walk: inP < 1 || outP > 0 });
  if (inP > .9 && outP < .1) daguBubble(ctx, L, t, f.head[0] - s * 600 * .12, f.head[1] - s * 600 * .02, vert ? W * .62 : W * .4);
}
