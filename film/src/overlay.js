// 2D motion-graphics layer drawn over each 3D frame: grade, vignette, film grain, date titles, name lower-thirds,
// end card and fades.
const GOLD = '#d4a84a';
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));
const win = (t, a, b, fin = 0.5, fout = 0.5) => Math.min(ease((t - a) / fin), ease((b - t) / fout));

export class Overlay {
  constructor(W, H) {
    this.W = W; this.H = H;
    this.grain = [0, 1, 2].map((s) => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), d = x.createImageData(256, 256);
      for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return c; });
    const v = document.createElement('canvas'); v.width = W; v.height = H; const vx = v.getContext('2d');
    const g = vx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.72); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.42)'); vx.fillStyle = g; vx.fillRect(0, 0, W, H);
    this.vig = v;
  }
  post(ctx, frame) {
    ctx.drawImage(this.vig, 0, 0);
    ctx.save(); ctx.globalAlpha = 0.045; ctx.globalCompositeOperation = 'overlay'; const gpat = ctx.createPattern(this.grain[frame % 3], 'repeat'); ctx.fillStyle = gpat;
    ctx.translate((frame * 37) % 256, (frame * 91) % 256); ctx.fillRect(-256, -256, this.W + 512, this.H + 512); ctx.restore();
  }
  // date / chapter title: "753 BC — THE LEGENDARY FOUNDING OF ROME"
  title(ctx, text, t, dur) {
    const end = Math.min(dur - 0.25, 5.6), a = win(t, 0.35, end, 0.6, 0.5); if (a <= 0) return;
    const [head, sub] = text.includes('—') ? text.split('—').map((s) => s.trim()) : [null, text];
    const W = this.W, H = this.H, y = H * 0.76, slide = (1 - ease((t - 0.35) / 0.8)) * 40;
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center';
    const band = ctx.createLinearGradient(0, y - 130, 0, y + 80); band.addColorStop(0, 'rgba(10,6,4,0)'); band.addColorStop(0.45, 'rgba(10,6,4,0.55)'); band.addColorStop(1, 'rgba(10,6,4,0)');
    ctx.fillStyle = band; ctx.fillRect(0, y - 130, W, 210);
    if (head) { ctx.font = '700 84px Cinzel, "Times New Roman", serif'; if ('letterSpacing' in ctx) ctx.letterSpacing = '6px'; ctx.fillStyle = GOLD; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 16; ctx.fillText(head, W / 2 + slide, y - 22); }
    const lw = Math.min(W * 0.5, 820) * ease((t - 0.5) / 0.9); ctx.shadowBlur = 0; ctx.fillStyle = GOLD; ctx.fillRect(W / 2 - lw / 2, y + 2, lw, 3);
    ctx.font = `600 ${head ? 40 : 54}px Cinzel, "Times New Roman", serif`; if ('letterSpacing' in ctx) ctx.letterSpacing = '4px'; ctx.fillStyle = '#fbf3e4'; ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 12;
    ctx.fillText(sub, W / 2 - slide, y + (head ? 58 : 66));
    ctx.restore(); if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }
  // historical figure lower third
  name(ctx, [nm, role], t0, t, dur) {
    const a = win(t, t0, Math.min(dur - 0.2, t0 + 4.2), 0.45, 0.45); if (a <= 0) return;
    const x = 96, y = this.H - 190, k = ease((t - t0) / 0.6);
    ctx.save(); ctx.globalAlpha = a;
    ctx.font = '700 46px Cinzel, "Times New Roman", serif'; const w1 = ctx.measureText(nm).width; ctx.font = 'italic 32px "EB Garamond", Georgia, serif'; const w2 = ctx.measureText(role).width;
    const w = (Math.max(w1, w2) + 70) * k;
    ctx.fillStyle = 'rgba(12,8,6,0.72)'; ctx.fillRect(x, y, w, 118); ctx.fillStyle = '#9b2226'; ctx.fillRect(x, y, 8, 118); ctx.fillStyle = GOLD; ctx.fillRect(x + 8, y + 116, w - 8, 2);
    ctx.beginPath(); ctx.rect(x, y, w, 118); ctx.clip();
    ctx.font = '700 46px Cinzel, "Times New Roman", serif'; ctx.fillStyle = '#fbf3e4'; ctx.fillText(nm, x + 34, y + 56);
    ctx.font = 'italic 32px "EB Garamond", Georgia, serif'; ctx.fillStyle = GOLD; ctx.fillText(role, x + 34, y + 98);
    ctx.restore();
  }
  endcard(ctx, text, t, dur) {
    const a = ease((t - dur * 0.4) / 1.2); if (a <= 0) return;
    const W = this.W, H = this.H; ctx.save(); ctx.fillStyle = `rgba(8,5,3,${0.45 * a})`; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a; ctx.textAlign = 'center';
    const [l1, l2] = text.includes('—') ? text.split('—').map((s) => s.trim()) : [text, ''];
    ctx.font = '700 120px Cinzel, "Times New Roman", serif'; if ('letterSpacing' in ctx) ctx.letterSpacing = '18px'; ctx.fillStyle = GOLD; ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 24; ctx.fillText(l1, W / 2, H * 0.46);
    ctx.shadowBlur = 0; ctx.fillRect(W / 2 - 300 * a, H * 0.5, 600 * a, 3);
    ctx.font = '600 44px Cinzel, "Times New Roman", serif'; if ('letterSpacing' in ctx) ctx.letterSpacing = '6px'; ctx.fillStyle = '#fbf3e4'; ctx.fillText(l2, W / 2, H * 0.58);
    ctx.restore(); if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }
  black(ctx, a) { if (a <= 0) return; ctx.save(); ctx.fillStyle = `rgba(0,0,0,${Math.min(1, a)})`; ctx.fillRect(0, 0, this.W, this.H); ctx.restore(); }
}
