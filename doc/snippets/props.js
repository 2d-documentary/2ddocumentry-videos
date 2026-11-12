// Drawn props (bitcoin coins, laptop, fake IDs, parcel, popcorn tin, chat window, forum post, prison bars, shelves, diary, spreadsheet,
// gavel, marketplace mock, cash stack). Needs editorial_helpers.js first. Uses SR palette defined at the top of this file.
// ---------------------------------------------------------------- Silk Road props (drawn)
const SR = { purple: '#8A5CF6', green: '#3BE07A', amber: '#FFB547', paper: '#F4ECDC', ink: '#1B1712', blood: '#C8322A', night: '#070A12', btc: '#F7931A' };
function btcCoin(ctx, x, y, r, t, o = {}) { // physical-style bitcoin prop
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); const sx = o.flip ? Math.cos(t * (o.spin || 3)) : 1; ctx.scale(sx, 1);
  const g = ctx.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r); g.addColorStop(0, '#FFE39A'); g.addColorStop(.6, '#F7A928'); g.addColorStop(1, '#B86A08');
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = r * .4; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(120,60,0,.6)'; ctx.lineWidth = r * .07; ctx.beginPath(); ctx.arc(0, 0, r * .84, 0, 7); ctx.stroke();
  if (Math.abs(sx) > .25) { ctx.fillStyle = '#8A4A00'; ctx.font = `700 ${r * 1.15}px ${F.osw}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.rotate(.21); ctx.fillText('B', 0, r * .04);
    ctx.fillRect(-r * .2, -r * .7, r * .09, r * .22); ctx.fillRect(r * .03, -r * .7, r * .09, r * .22); ctx.fillRect(-r * .2, r * .48, r * .09, r * .22); ctx.fillRect(r * .03, r * .48, r * .09, r * .22); }
  ctx.restore();
}
function coinRain(ctx, t, t0, n = 40, o = {}) { if (t < t0) return; const lt = t - t0;
  for (let i = 0; i < n; i++) { const st = hash(i * 3) * (o.spread || 1.5); if (lt < st) continue; const y = -100 + (lt - st) * (500 + hash(i) * 500); if (y > H + 100) continue;
    btcCoin(ctx, hash(i * 7) * W, y, (o.r || 46) * (.7 + hash(i * 11) * .6), t + i, { flip: true, spin: 3 + hash(i) * 4 }); } }
function laptop(ctx, x, y, s, o = {}, screenFn) { // base centre at (x,y)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const w = 520, h = 330;
  ctx.fillStyle = '#B9BEC6'; ctx.beginPath(); ctx.moveTo(-w / 2 - 50, 0); ctx.lineTo(w / 2 + 50, 0); ctx.lineTo(w / 2 + 30, 26); ctx.lineTo(-w / 2 - 30, 26); ctx.fill();
  ctx.fillStyle = '#2A2E35'; ctx.beginPath(); ctx.roundRect(-w / 2, -h - 8, w, h, 14); ctx.fill();
  ctx.fillStyle = o.screen || '#0B0F14'; ctx.fillRect(-w / 2 + 16, -h + 8, w - 32, h - 32);
  if (screenFn) { ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 16, -h + 8, w - 32, h - 32); ctx.clip(); ctx.translate(-w / 2 + 16, -h + 8); screenFn(ctx, w - 32, h - 32); ctx.restore(); }
  if (o.glow) { ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(0, -h / 2, 10, 0, -h / 2, 500); g.addColorStop(0, 'rgba(120,200,255,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-600, -700, 1200, 900); }
  ctx.restore();
}
function srScreen(label, col = SR.green) { return (c, w, h) => { c.fillStyle = '#0A140E'; c.fillRect(0, 0, w, h); c.fillStyle = col; c.font = `600 26px ${F.mono}`;
  c.fillText(label, 18, 40); for (let i = 0; i < 6; i++) { c.globalAlpha = .5; c.fillRect(18, 70 + i * 34, 120 + hash(i * 5) * 300, 14); } c.globalAlpha = 1; }; }
function onion(ctx, x, y, r, t, p = 1) { ctx.save(); ctx.translate(x, y);
  for (let i = 4; i >= 0; i--) { const rr = r * (.35 + i * .16) * clamp(p * 5 - (4 - i)); if (rr <= 0) continue; ctx.fillStyle = i % 2 ? '#6B3FD6' : '#9A73FF'; ctx.globalAlpha = .9;
    ctx.beginPath(); ctx.moveTo(0, -rr * 1.25); ctx.bezierCurveTo(rr * 1.1, -rr * .5, rr * 1.0, rr * .9, 0, rr); ctx.bezierCurveTo(-rr * 1.0, rr * .9, -rr * 1.1, -rr * .5, 0, -rr * 1.25); ctx.fill(); }
  ctx.strokeStyle = '#B9F27A'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -r * 1.05); ctx.quadraticCurveTo(r * .2, -r * 1.4, r * .1, -r * 1.6); ctx.stroke(); ctx.restore(); }
function idCard(ctx, x, y, s, name, i, o = {}) { // generic fake ID prop with the face photo
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); const cols = ['#D9E8F5', '#F5E3D9', '#E1F5D9', '#F2D9F5', '#F5F1D9'];
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 24; ctx.fillStyle = cols[i % 5]; ctx.beginPath(); ctx.roundRect(-170, -108, 340, 216, 14); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = ['#1E4E8C', '#8C2E1E', '#2E7A3A', '#6A2E8C', '#8C7A1E'][i % 5]; ctx.fillRect(-170, -108, 340, 40);
  text(ctx, ['DRIVER LICENSE', 'IDENTITY CARD', 'DRIVING PERMIT', 'NATIONAL ID', 'LICENCE'][i % 5], 0, -80, { font: F.osw, size: 22, color: '#fff', align: 'center', weight: 600, ls: 3 });
  if (o.face && IMG[o.face]) { ctx.save(); ctx.beginPath(); ctx.rect(-150, -50, 110, 140); ctx.clip(); const im = IMG[o.face], c = o.crop || [0, 0, im.width, im.height]; ctx.filter = 'grayscale(.3)'; ctx.drawImage(im, c[0], c[1], c[2], c[3], -150, -50, 110, 140); ctx.restore(); }
  else { ctx.fillStyle = '#9AA3AE'; ctx.fillRect(-150, -50, 110, 140); personIcon(ctx, -95, 80, 1.2, '#5A6470'); }
  text(ctx, name, -20, -20, { font: F.osw, size: 28, color: '#111', weight: 600 }); for (let k = 0; k < 4; k++) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-20, 5 + k * 22, 150 - k * 20, 8); }
  text(ctx, 'FAKE', 90, 90, { font: F.bebas, size: 30, color: 'rgba(200,40,40,.0)' }); ctx.restore(); }
function parcel(ctx, x, y, s, open, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#C89A5E'; ctx.fillRect(-260, -150, 520, 300); ctx.fillStyle = '#B4864C'; ctx.fillRect(-260, -150, 520, 40);
  const a = open * 1.9; ctx.save(); ctx.translate(-260, -150); ctx.rotate(-a); ctx.fillStyle = '#D6A96C'; ctx.fillRect(0, -2, 260, 40); ctx.restore();
  ctx.save(); ctx.translate(260, -150); ctx.rotate(a); ctx.fillStyle = '#D6A96C'; ctx.fillRect(-260, -2, 260, 40); ctx.restore();
  ctx.fillStyle = '#E8D7A8'; ctx.globalAlpha = .9; ctx.fillRect(-26, -150, 52, 300); ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff'; ctx.fillRect(40, -60, 190, 120); text(ctx, o.from || 'FROM: CANADA', 50, -25, { font: F.mono, size: 20, color: '#111' }); text(ctx, o.to || 'TO: SAN FRANCISCO', 50, 10, { font: F.mono, size: 20, color: '#111' });
  ctx.restore(); }
function popcornTin(ctx, x, y, s, t, lid = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createLinearGradient(-200, 0, 200, 0); g.addColorStop(0, '#9E1B1B'); g.addColorStop(.5, '#E2453A'); g.addColorStop(1, '#8A1515'); ctx.fillStyle = g; ctx.fillRect(-200, -300, 400, 400);
  ctx.fillStyle = '#F5E6C8'; for (let i = 0; i < 6; i++) ctx.fillRect(-200 + i * 72, -300, 30, 400);
  ctx.fillStyle = '#FFD45A'; ctx.beginPath(); ctx.ellipse(0, 100, 200, 34, 0, 0, Math.PI); ctx.fill();
  text(ctx, 'POPCORN', 0, -90, { font: F.bebas, size: 110, color: '#fff', align: 'center', shadow: 10 });
  ctx.save(); ctx.translate(0, -300 - lid * 260); ctx.rotate(lid * -.5); ctx.fillStyle = '#C9C9C9'; ctx.beginPath(); ctx.ellipse(0, 0, 214, 40, 0, 0, 7); ctx.fill(); ctx.restore();
  if (lid > .3) { const p = clamp((lid - .3) / .7); ctx.save(); ctx.translate(0, -300 - 220 * E.out(p)); ctx.fillStyle = '#1F6E3A'; ctx.fillRect(-120, -70, 240, 140);
    ctx.fillStyle = '#C9A227'; for (let i = 0; i < 10; i++) ctx.fillRect(-110 + i * 22, 60, 10, 16); ctx.fillStyle = '#222'; ctx.fillRect(-60, -40, 90, 60); ctx.fillStyle = '#DDD'; ctx.fillRect(50, -50, 50, 30);
    ctx.globalCompositeOperation = 'screen'; const gg = ctx.createRadialGradient(0, 0, 0, 0, 0, 260); gg.addColorStop(0, `rgba(255,200,80,${.6 * p})`); gg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gg; ctx.fillRect(-300, -300, 600, 600); ctx.restore(); }
  ctx.restore(); }
function chatWin(ctx, x, y, w, msgs, t, o = {}) { // msgs: [who, text, t0, side]
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = 'rgba(12,16,24,.94)'; ctx.beginPath(); ctx.roundRect(0, 0, w, o.h || 520, 20); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#1B2232'; ctx.beginPath(); ctx.roundRect(0, 0, w, 64, [20, 20, 0, 0]); ctx.fill(); text(ctx, o.title || 'PRIVATE CHAT', 28, 42, { font: F.mono, size: 26, color: '#9FB3D1' });
  let yy = 110; msgs.forEach(([who, s, t0, side]) => { if (t < t0) return; const p = E.out(prog(t, t0, t0 + .3)); ctx.save(); ctx.globalAlpha = p; const bw = Math.min(w - 120, 40 + s.length * 17), bx = side ? w - bw - 30 : 30;
    ctx.fillStyle = side ? '#2B5DD9' : '#2A3142'; ctx.beginPath(); ctx.roundRect(bx, yy - 34, bw, 66, 16); ctx.fill(); text(ctx, who, bx + 4, yy - 44, { font: F.mono, size: 20, color: 'rgba(255,255,255,.55)' });
    text(ctx, s, bx + 20, yy + 10, { font: F.osw, size: 30, color: '#fff' }); ctx.restore(); yy += 110; }); ctx.restore(); }
function forumPost(ctx, x, y, w, user, body, t, t0, o = {}) { const p = E.out(prog(t, t0, t0 + .35)); if (p <= 0) return; ctx.save(); ctx.translate(x, y + (1 - p) * 40); ctx.globalAlpha = p;
  ctx.fillStyle = '#EDEFF2'; ctx.beginPath(); ctx.roundRect(0, 0, w, o.h || 300, 10); ctx.fill(); ctx.fillStyle = '#C9D2DE'; ctx.fillRect(0, 0, w, 56);
  text(ctx, o.forum || 'FORUM · 2011', 24, 38, { font: F.mono, size: 24, color: '#2A3A50' }); ctx.fillStyle = '#7A8CA6'; ctx.fillRect(24, 80, 70, 70);
  text(ctx, user, 112, 106, { font: F.osw, size: 34, color: '#1D3A6E', weight: 600 }); text(ctx, o.when || 'posted', 112, 140, { font: F.mono, size: 20, color: '#556' });
  wrapText(ctx, body.slice(0, Math.floor(clamp((t - t0 - .2) * 30, 0, body.length))), 24, 200, w - 48, 44, { font: F.type, size: 32, color: '#1B1B1B' }); ctx.restore(); }
function bars(ctx, p) { if (p <= 0) return; ctx.save(); ctx.fillStyle = '#2A2F36'; for (let i = 0; i < 12; i++) { const x = 60 + i * 160, h = H * E.out(p); ctx.fillRect(x, 0, 26, h);
  const g = ctx.createLinearGradient(x, 0, x + 26, 0); g.addColorStop(0, 'rgba(255,255,255,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, 0, 10, h); ctx.fillStyle = '#2A2F36'; }
  ctx.fillRect(0, H * .12, W * E.out(p), 22); ctx.fillRect(0, H * .82, W * E.out(p), 22); ctx.restore(); }
function shelves(ctx, t, lt, o = {}) { bgGrad(ctx, '#2A1C14', '#0C0806'); const cols = ['#7A2E2E', '#2E4A7A', '#2E6A4A', '#7A6A2E', '#5A2E7A', '#3A3A3A'];
  for (let r = 0; r < 4; r++) { const y = 120 + r * 250; ctx.fillStyle = '#4A3222'; ctx.fillRect(0, y + 210, W, 26); let x = -lt * 30 - (r % 2) * 40;
    while (x < W) { const bw = 30 + hash(x * .1 + r) * 40, h = 150 + hash(x + r * 13) * 55; ctx.fillStyle = cols[Math.floor(hash(x * 3 + r) * 6)]; ctx.fillRect(x, y + 210 - h, bw - 4, h); x += bw; } }
  if (o.sign) { const sy = o.signY ?? 40; ctx.fillStyle = '#F2E9D8'; ctx.fillRect(W / 2 - 330, sy, 660, 90); text(ctx, o.sign, W / 2, sy + 65, { font: F.osw, size: 52, color: '#2A1C14', align: 'center', weight: 700, ls: 6 }); }
  vign(ctx, .55); }
function diaryPage(ctx, x, y, lines, t, t0, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || -.02); ctx.fillStyle = '#FBF6E8'; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; ctx.fillRect(-380, -260, 760, 520); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(80,120,200,.25)'; ctx.lineWidth = 2; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(-360, -170 + i * 54); ctx.lineTo(360, -170 + i * 54); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(200,60,60,.4)'; ctx.beginPath(); ctx.moveTo(-300, -260); ctx.lineTo(-300, 260); ctx.stroke();
  lines.forEach((s, i) => { const st = t0 + i * .5; if (t < st) return; const n = Math.floor(clamp((t - st) * 30, 0, s.length)); text(ctx, s.slice(0, n), -280, -180 + i * 54, { font: F.hand, size: 44, color: '#1E2A55', weight: 700 }); });
  ctx.restore(); }
function sheet(ctx, x, y, w, rows, t, t0) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, 60 + rows.length * 56); ctx.fillStyle = '#1F7A45'; ctx.fillRect(0, 0, w, 60);
  text(ctx, 'PROFITS.xls', 20, 42, { font: F.mono, size: 30, color: '#fff' }); rows.forEach(([a, b], i) => { if (t < t0 + i * .2) return; const yy = 60 + i * 56; ctx.fillStyle = i % 2 ? '#F2F6F3' : '#fff'; ctx.fillRect(0, yy, w, 56);
    ctx.strokeStyle = '#CFD8D2'; ctx.strokeRect(0, yy, w, 56); text(ctx, a, 20, yy + 38, { font: F.mono, size: 28, color: '#222' }); text(ctx, b, w - 20, yy + 38, { font: F.mono, size: 28, color: '#1F7A45', align: 'right', weight: 700 }); }); ctx.restore(); }
function gavel(ctx, x, y, s, t, t0) { const a = t < t0 ? -.6 : -.6 + Math.min(1, (t - t0) * 6) * .75; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#5A3A1E'; ctx.fillRect(-160, 60, 320, 40); ctx.save(); ctx.rotate(a); ctx.fillStyle = '#7A4E28'; ctx.fillRect(-10, -250, 20, 230); ctx.fillStyle = '#6A4020'; ctx.beginPath(); ctx.roundRect(-90, -300, 180, 80, 20); ctx.fill(); ctx.restore(); ctx.restore(); }
function shopMock(ctx, x, y, w, h, t, t0, o = {}) { // generic anonymous marketplace mock (no real listings)
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#F6F1E6'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#2E5E3A'; ctx.fillRect(0, 0, w, 90);
  text(ctx, 'silk road', 30, 64, { font: F.playI || F.play, size: 54, color: '#F6F1E6', weight: 700 }); text(ctx, 'anonymous marketplace', w - 30, 58, { font: F.mono, size: 22, color: '#CFE3D3', align: 'right' });
  for (let i = 0; i < 6; i++) { const st = t0 + i * .12; if (t < st) continue; const cx = 30 + (i % 3) * ((w - 60) / 3), cy = 120 + Math.floor(i / 3) * ((h - 140) / 2), cw = (w - 60) / 3 - 20, chh = (h - 140) / 2 - 20;
    ctx.globalAlpha = E.out(prog(t, st, st + .3)); ctx.fillStyle = '#fff'; ctx.fillRect(cx, cy, cw, chh); ctx.fillStyle = '#D8D2C4'; ctx.fillRect(cx + 14, cy + 14, cw - 28, chh * .5);
    text(ctx, 'LISTING #' + (1040 + i * 7), cx + 14, cy + chh * .5 + 54, { font: F.mono, size: 22, color: '#333' });
    const stars = o.stars ? 5 : 4 + (i % 2); for (let k = 0; k < 5; k++) { ctx.fillStyle = k < stars ? '#E8A21B' : '#CCC'; star(ctx, cx + 26 + k * 34, cy + chh - 30, 13); }
    ctx.globalAlpha = 1; } ctx.restore(); }
function star(ctx, x, y, r) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
function cashStack(ctx, x, y, s, n = 5) { for (let i = 0; i < n; i++) { if (!IMG.bill100) { ctx.fillStyle = '#7BA05B'; ctx.fillRect(x - 140 * s, y - i * 14 * s, 280 * s, 120 * s); continue; }
  const im = IMG.bill100, c = EP.billCrop; ctx.save(); ctx.translate(x + (hash(i) - .5) * 20 * s, y - i * 14 * s); ctx.rotate((hash(i * 3) - .5) * .08); ctx.drawImage(im, c[0], c[1], c[2], c[3], -150 * s, -64 * s, 300 * s, 128 * s); ctx.restore(); } }
