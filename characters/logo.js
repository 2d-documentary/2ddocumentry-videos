// Channel logo: Lucius (the everyman citizen) crowned with a golden laurel, inside a Roman badge.
// usage: node logo.js <outDir>   -> logo_round.png (2048, round badge), logo_square.png (2048, full-bleed), logo_mascot.png (transparent)
const { chromium } = require('playwright'); const fs = require('fs');
const { character, DEFS } = require('./chars'); const { ROME } = require('./rome_cast');
const out = process.argv[2] || 'logo'; fs.mkdirSync(out, { recursive: true });
const hero = { ...ROME.citizen, hat: { type: 'goldlaurel' }, body: '#F2EAD8', details: (ROME.citizen.details || '') };
const C = 512, GOLD = '#E0B33C', GOLD_D = '#9a6f14', RED = '#9b2226', RED_D = '#5c0f12', INK = '#2a1d16';
// laurel wreath around the badge: leaves along two arcs
function wreath(r) {
  let s = '';
  for (const side of [-1, 1]) for (let i = 0; i < 15; i++) {
    const a = Math.PI / 2 + side * (0.35 + i * 0.165), x = C + Math.cos(a) * r, y = C + Math.sin(a) * r, rot = (a * 180 / Math.PI) + (side > 0 ? 90 : -90) + side * 28;
    for (const o of [-1, 1]) s += `<ellipse cx="${x + Math.cos(a) * o * 15}" cy="${y + Math.sin(a) * o * 15}" rx="26" ry="11" transform="rotate(${rot + o * side * 22} ${x + Math.cos(a) * o * 15} ${y + Math.sin(a) * o * 15})" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="4"/>`;
  }
  return s;
}
// arcade of Roman arches (Colosseum) behind the bust
function arcade() {
  let s = `<rect x="150" y="560" width="724" height="300" fill="#e9d7b0"/>`;
  for (let i = 0; i < 7; i++) { const x = 170 + i * 102; s += `<path d="M${x},860 L${x},660 A40,40 0 0 1 ${x + 80},660 L${x + 80},860Z" fill="#c9a874"/>`; }
  s += `<rect x="150" y="560" width="724" height="22" fill="#d9c08e"/><rect x="150" y="610" width="724" height="10" fill="#d9c08e"/>`;
  return s;
}
const badge = (full) => `
<defs>${DEFS}
 <radialGradient id="sky" cx="50%" cy="38%" r="65%"><stop offset="0" stop-color="#fbe3a8"/><stop offset=".55" stop-color="#f2b866"/><stop offset="1" stop-color="#d9824a"/></radialGradient>
 <clipPath id="inner"><circle cx="${C}" cy="${C}" r="372"/></clipPath>
</defs>
${full ? `<rect width="1024" height="1024" fill="${RED}"/>` : ''}
<circle cx="${C}" cy="${C}" r="500" fill="${RED_D}"/>
<circle cx="${C}" cy="${C}" r="486" fill="${RED}"/>
${wreath(432)}
<circle cx="${C}" cy="${C}" r="392" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="6"/>
<g clip-path="url(#inner)">
 <rect width="1024" height="1024" fill="url(#sky)"/>
 <circle cx="${C}" cy="430" r="150" fill="#fff4d6" opacity=".55"/>
 ${arcade()}
 <g transform="translate(${C},1210) scale(3.1)">${character(hero, { x: 0, y: 0, scale: 1, view: 0, expr: 'happy' })}</g>
</g>
<circle cx="${C}" cy="${C}" r="372" fill="none" stroke="${INK}" stroke-width="10"/>
<circle cx="${C}" cy="${C}" r="500" fill="none" stroke="${INK}" stroke-width="10"/>
${[0, 1, 2].map((i) => { const x = C + (i - 1) * 46, y = 82; return `<path d="M${x},${y - 22} L${x + 7},${y - 6} L${x + 24},${y - 5} L${x + 11},${y + 6} L${x + 15},${y + 23} L${x},${y + 13} L${x - 15},${y + 23} L${x - 11},${y + 6} L${x - 24},${y - 5} L${x - 7},${y - 6}Z" fill="${GOLD}" stroke="${INK}" stroke-width="4"/>`; }).join('')}`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 2 });
  const shot = async (svg, name, transparent) => { await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`); await p.screenshot({ path: `${out}/${name}`, omitBackground: transparent, clip: { x: 0, y: 0, width: 1024, height: 1024 } }); };
  await shot(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${badge(false)}</svg>`, 'logo_round.png', true);
  await shot(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${badge(true)}</svg>`, 'logo_square.png', false);
  await shot(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="-170 -380 340 400">${DEFS}${character(hero, { x: 0, y: 0, scale: 1, view: 0, expr: 'happy' })}</svg>`, 'logo_mascot.png', true);
  console.log('logo done'); await b.close();
})();
