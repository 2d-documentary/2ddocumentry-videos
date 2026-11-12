// Roman Empire documentary cast, built on the same flat 2D system as the Pirates cast.
const { cel, line, circ, ell, INK, shade } = require('./chars');

const D = {
  belt: (col = '#5a3a1e') => (w) => cel(`M${-37 * w},-84 h${74 * w} v9 h${-74 * w}z`, col, { w: 2 }),
  tunicStripe: (col) => (w) => cel(`M${-14 * w},-140 h${6 * w} v86 h${-6 * w}z M${8 * w},-140 h${6 * w} v86 h${-6 * w}z`, col, { w: 1.6, flat: true }),
  toga: (border) => (w) => cel(`M${-30 * w},-138 C${-6 * w},-110 ${18 * w},-70 ${36 * w},-30 L${24 * w},-24 C${6 * w},-62 ${-14 * w},-96 ${-38 * w},-122Z`, '#EEEAE0', { w: 2.4 }) +
    (border ? line([[-30 * w, -138], [-6 * w, -110], [18 * w, -70], [36 * w, -30]], 5, border) : '') +
    line([[-18 * w, -112], [0, -60]], 1.8, '#c9c2b2') + line([[-2 * w, -120], [14 * w, -70]], 1.8, '#c9c2b2'),
  cuirass: (col = '#B98A3E') => (w) => cel(`M${-34 * w},-138 L${34 * w},-138 L${36 * w},-66 Q0,-56 ${-36 * w},-66Z`, col, { w: 2.4 }) +
    line([[0, -126], [0, -72]], 2, shade(col, 0.6)) + line([[-18 * w, -112], [-4 * w, -106]], 2, shade(col, 0.6)) + line([[18 * w, -112], [4 * w, -106]], 2, shade(col, 0.6)) +
    line([[-14 * w, -88], [14 * w, -88]], 2, shade(col, 0.6)) +
    Array.from({ length: 7 }, (_, i) => cel(`M${(-33 + i * 9.5) * w},-64 h${8 * w} v16 h${-8 * w}z`, '#7a3a2a', { w: 1.6 })).join(''),
  chainmail: (w) => cel(`M${-35 * w},-138 L${35 * w},-138 L${37 * w},-56 L${-37 * w},-56Z`, '#8E959C', { w: 2.4 }) +
    Array.from({ length: 60 }, (_, i) => `<circle cx="${(((i % 10) - 4.5) * 7) * w}" cy="${-130 + Math.floor(i / 10) * 13}" r="2.2" fill="none" stroke="#5f666d" stroke-width="1.2"/>`).join(''),
  stola: (w) => cel(`M${-30 * w},-138 C${-10 * w},-118 ${10 * w},-118 ${30 * w},-138 L${38 * w},-108 C${10 * w},-96 ${-10 * w},-96 ${-38 * w},-108Z`, '#C9A8C8', { w: 2.2 }) + line([[-20 * w, -90], [-26 * w, -20]], 1.8, shade('#3D6E9E', 0.7)) + line([[18 * w, -90], [24 * w, -20]], 1.8, shade('#3D6E9E', 0.7)),
  pelt: (w) => cel(`M${-38 * w},-140 Q0,-126 ${38 * w},-140 L${42 * w},-112 Q0,-96 ${-42 * w},-112Z`, '#7A6048', { w: 2.4 }) + Array.from({ length: 7 }, (_, i) => line([[(-34 + i * 11) * w, -112], [(-32 + i * 11) * w, -104]], 2, '#5a4430')).join(''),
  purple: (w) => cel(`M${-34 * w},-138 L${34 * w},-138 L${42 * w},-40 L${-42 * w},-40Z`, '#5B2A6E', { w: 2.4 }) + line([[-40 * w, -48], [40 * w, -48]], 5, '#E0B33C') + line([[0, -138], [0, -48]], 3, '#E0B33C'),
};
const both = (...fs) => (w, v) => fs.map((f) => f(w, v)).join('');

const ROME = {
  // --- recurring everyday characters (the voices in most scenes)
  citizen: { id: 'R01', name: 'Lucius', role: 'Roman Citizen (male) · the everyman', body: '#9C6B3E', legs: '#e8c9a0', skin: '#EBC9A6', boots: '#6b4a2a', hair: { type: 'messy', col: '#3a2a1e' }, beard: { mous: false }, expr: 'confused', details: D.belt() },
  citizen2: { id: 'R02', name: 'Gaius', role: 'Roman Citizen (male) · second speaker', body: '#5E7A4A', legs: '#e8c9a0', skin: '#E8C39C', boots: '#6b4a2a', hair: { type: 'shortcurl', col: '#2a2420' }, expr: 'bored', details: D.belt('#3a2a1a') },
  citizenF: { id: 'R03', name: 'Julia', role: 'Female Citizen', body: '#3D6E9E', shape: 'robe', noLegs: true, skin: '#F0D2B4', boots: '#6b4a2a', hair: { type: 'bun', col: '#4a2e1e' }, expr: 'happy', prop: 'basket', handR: [40, -84], details: D.stola },
  senator: { id: 'R04', name: 'Senator Cassius', role: 'Roman Senator (male, fictional)', body: '#EEEAE0', shape: 'robe', legs: '#e0d6c4', skin: '#EED2B6', boots: '#7a4a28', hair: { type: 'baldsides', col: '#B8B2A8' }, expr: 'smug', prop: 'scroll', handR: [40, -100], details: both(D.tunicStripe('#6B2D7B'), D.toga(null)) },
  general: { id: 'R05', name: 'General Marcus', role: 'Roman General (male, fictional)', body: '#8a2a22', legs: '#d8b894', skin: '#E2BC96', boots: '#5a3a1e', cape: '#9B2226', hat: { type: 'galea', col: '#B98A3E', plume: '#B3261E' }, beard: { type: 'pointed', col: '#2a2420', mous: true }, expr: 'angry', prop: 'sword', details: D.cuirass() },
  // --- historical figures, in order of appearance
  romulus: { id: 'R06', name: 'Romulus', role: 'Legendary founder, 753 BC', body: '#B07A48', legs: '#d8b894', skin: '#E2BC96', boots: '#5a3a1e', hat: { type: 'wolf', col: '#8A7458' }, beard: { type: 'pointed', col: '#5A3A22', mous: true }, expr: 'smug', prop: 'spear', handR: [40, -86], details: both(D.pelt, D.belt('#3a2a1a')) },
  remus: { id: 'R07', name: 'Remus', role: 'His twin brother', body: '#6E7F52', legs: '#d8b894', skin: '#E2BC96', boots: '#5a3a1e', hair: { type: 'messy', col: '#5A3A22' }, beard: { type: 'pointed', col: '#5A3A22', mous: true }, expr: 'bored', details: both(D.pelt, D.belt('#3a2a1a')) },
  tarquin: { id: 'R08', name: 'Tarquinius Superbus', role: 'Last king of Rome', body: '#6B2D7B', shape: 'robe', legs: '#d8b894', skin: '#E8C8A6', boots: '#3a2a1a', hat: { type: 'etruscan' }, hair: { type: 'cap', col: '#2a1e18' }, beard: { type: 'full', col: '#2a1e18' }, expr: 'smug', prop: 'eaglescepter', handR: [42, -96], details: (w) => line([[-40 * w, -30], [40 * w, -30]], 5, '#E0B33C') + line([[0, -140], [0, -30]], 4, '#E0B33C') },
  hannibal: { id: 'R09', name: 'Hannibal Barca', role: 'Carthaginian general', body: '#7A5A3A', legs: '#c8a47c', skin: '#C99A70', boots: '#3a2a1a', cape: '#2A4A6B', hat: { type: 'hellenic', col: '#A87A3A', plume: '#1a1a1a' }, beard: { type: 'full', col: '#1e1a18' }, expr: 'smug', prop: 'roundshield', handR: [40, -84], details: D.cuirass('#A87A3A') },
  scipio: { id: 'R10', name: 'Scipio Africanus', role: 'Victor at Zama, 202 BC', body: '#8a2a22', legs: '#d8b894', skin: '#E8C8A6', boots: '#5a3a1e', cape: '#7A2A6A', hat: { type: 'galea', col: '#C9CDD2', plume: '#F1E4C3' }, expr: 'neutral', prop: 'scutum', handR: [44, -80], details: D.cuirass('#C9CDD2') },
  caesar: { id: 'R11', name: 'Julius Caesar', role: 'Dictator, 49–44 BC', body: '#EEEAE0', shape: 'robe', legs: '#e0d6c4', skin: '#EBCDB0', boots: '#7a4a28', cape: '#9B2226', hair: { type: 'receding', col: '#4A3A2E' }, hat: { type: 'laurel' }, expr: 'smug', handR: [44, -112], details: both(D.tunicStripe('#6B2D7B'), D.toga('#6B2D7B')) },
  augustus: { id: 'R12', name: 'Augustus', role: 'First emperor, 27 BC', body: '#EEEAE0', shape: 'robe', legs: '#e0d6c4', skin: '#F0D4B8', boots: '#7a4a28', hair: { type: 'fringe', col: '#7A5634' }, expr: 'neutral', prop: 'scroll', handR: [40, -100], details: both(D.tunicStripe('#6B2D7B'), D.toga('#6B2D7B')) },
  caligula: { id: 'R13', name: 'Caligula', role: 'Emperor, 37–41 AD', body: '#5B2A6E', shape: 'robe', legs: '#e0d6c4', skin: '#F4DCC6', boots: '#E0B33C', hair: { type: 'cap', col: '#6A4A2E' }, hat: { type: 'goldlaurel' }, expr: 'grin', details: D.purple },
  nero: { id: 'R14', name: 'Nero', role: 'Emperor, 54–68 AD', body: '#5B2A6E', shape: 'robe', legs: '#e0d6c4', skin: '#F0D0B0', boots: '#E0B33C', hair: { type: 'shortcurl', col: '#A0522D' }, beard: { type: 'pointed', col: '#A0522D' }, expr: 'happy', prop: 'lyre', handR: [36, -92], details: D.purple },
  diocletian: { id: 'R15', name: 'Diocletian', role: 'Emperor, 284–305 AD', body: '#5B2A6E', shape: 'robe', legs: '#e0d6c4', skin: '#E6C6A6', boots: '#3a2a1a', hair: { type: 'cap', col: '#9A948A' }, beard: { type: 'full', col: '#9A948A' }, hat: { type: 'diadem' }, expr: 'neutral', details: D.purple },
  constantine: { id: 'R16', name: 'Constantine', role: 'Founded Constantinople, 330 AD', body: '#5B2A6E', shape: 'robe', legs: '#e0d6c4', skin: '#EBCBAE', boots: '#3a2a1a', hair: { type: 'fringe', col: '#4A3424' }, hat: { type: 'diadem' }, expr: 'neutral', prop: 'eaglescepter', handR: [42, -96], details: D.purple },
  odoacer: { id: 'R17', name: 'Odoacer', role: 'Germanic commander, 476 AD', body: '#5A4A3A', legs: '#6a5a4a', skin: '#EBCBAE', boots: '#3a2a1a', cape: '#3A5A3A', hair: { type: 'longhair', col: '#B07A3A' }, beard: { mous: true, col: '#B07A3A' }, expr: 'smug', prop: 'sword', details: D.chainmail },
  augustulus: { id: 'R18', name: 'Romulus Augustulus', role: 'Last western emperor, 476 AD', body: '#5B2A6E', shape: 'robe', legs: '#e0d6c4', skin: '#F4DCC6', boots: '#3a2a1a', hair: { type: 'cap', col: '#6A4A2E' }, hat: { type: 'diadem' }, expr: 'worry' === 'worry' ? 'confused' : 'neutral', details: D.purple },
};
module.exports = { ROME };
