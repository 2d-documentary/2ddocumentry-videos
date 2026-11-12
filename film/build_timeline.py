"""Director's cut of THE ENTIRE HISTORY OF THE ROMAN EMPIRE.
Builds film/timeline.json (shots, cameras, actors, lip-sync, titles) and rome/mix.json (audio events)
from rome/script.json and the Kokoro line timings. Run: python3 film/build_timeline.py"""
import json, math, os, subprocess, struct

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 24
script = json.load(open(f'{ROOT}/rome/script.json'))
timing = {(t['scene'], t['i']): t for t in json.load(open(f'{ROOT}/rome/audio/timing.json'))}
WHO = {'CITIZEN': 'citizen', 'CITIZEN2': 'citizen2', 'SENATOR': 'senator', 'GENERAL': 'general', 'CAESAR': 'caesar',
       'AUGUSTUS': 'augustus', 'ROMULUS': 'romulus', 'REMUS': 'remus', 'FEMALE': 'citizenF'}

# ------------------------------------------------------------------ lip-sync from the audio
def mouth_track(name, dur):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f'{ROOT}/rome/audio/{name}.mp3', '-f', 's16le', '-ac', '1', '-ar', '24000', '-'], capture_output=True).stdout
    n = len(raw) // 2; a = struct.unpack(f'<{n}h', raw[:n * 2]); step = 24000 // FPS; out = []
    peak = max(1, max(abs(v) for v in a))
    for f in range(int(dur * FPS) + 1):
        seg = a[f * step:(f + 1) * step] or [0]
        rms = math.sqrt(sum(v * v for v in seg) / len(seg)) / peak
        out.append('2' if rms > 0.22 else '1' if rms > 0.07 else '0')
    # no single-frame flicker
    s = list(''.join(out))
    for i in range(1, len(s) - 1):
        if s[i - 1] == s[i + 1] != s[i]: s[i] = s[i - 1]
    return ''.join(s)

# ------------------------------------------------------------------ stage points per place (x, y, z); 'g' = sit on terrain
ST = {
    'tiber': {'square': (12, 'g', -2), 'edge': (-14, 'g', 26)},
    'forum': {'square': (-20, 0, 2), 'rostra': (-62, 3.2, 2), 'curia': (-60, 0, -30), 'regia': (46, 0, -6), 'divus': (70, 0, -6), 'east': (40, 0, 20)},
    'senate': {'floor': (0, 0, 3), 'tribunal': (0, 0.9, -10.5), 'stepL': (-5.0, 1.08, 0), 'stepR': (5.0, 1.08, 0)},
    'imperialRome': {'front': (10, 0, 108), 'plaza': (60, 0, 120)},
    'countryside': {'road': (0, 0.12, 0), 'gate': (150, 'g', -52), 'ridge': (-26, 'g', 30)},
    'gaul': {'gate': (150, 'g', -52), 'road': (0, 0.12, 0)},
    'carthage': {'quay': (-92, 'g', 96)},
    'shipyard': {'slip': (-38, 'g', 4)},
    'alps': {'track': (27, 'g', 100)},
    'rubicon': {'bank': (-14, 'g', 0)},
    'palace': {'table': (0, 0, -6), 'corner': (-7, 0, 12)},
    'ravenna': {'throne': (0, 0, -14), 'corner': (-7, 0, 12)},
    'constantinople': {'harbour': (60, 'g', 200)},
}
def at(place, stage, dx=0, dy=0, dz=0):
    x, y, z = ST[place.split(':')[0]][stage]
    return [x + dx, (y + dy) if y != 'g' else ['g', dy], z + dz]

# ------------------------------------------------------------------ shot helpers
def cam(p0, l0, p1=None, l1=None, f0=40, f1=None, ease='inout', shake=0.0):
    return {'keys': [{'t': 0, 'pos': p0, 'look': l0, 'fov': f0}, {'t': 1, 'pos': p1 or p0, 'look': l1 or l0, 'fov': f1 or f0}], 'ease': ease, 'shake': shake}
def named(name, name2=None, f0=None, f1=None, ease='inout'):
    return {'named': [name, name2 or name], 'fov': [f0, f1], 'ease': ease}
def A(id, pos, view='q', flip=False, expr='neutral', exprs=None, walk=None, scale=1):
    return {'id': id, 'pos': pos, 'view': view, 'flip': flip, 'expr': expr, 'exprs': exprs or {}, 'walk': walk, 'scale': scale}
def crowd(place, stage, ids, n, w, d, seed=1, avoid=1.6, view='q'):
    import random; r = random.Random(seed); out = []
    x0, y0, z0 = ST[place.split(':')[0]][stage]
    while len(out) < n:
        x, z = x0 + (r.random() - 0.5) * w, z0 + (r.random() - 0.5) * d
        if any(math.hypot(x - o['pos'][0], z - o['pos'][2]) < avoid for o in out): continue
        a = A(r.choice(ids), [x, y0 if y0 != 'g' else ['g', 0], z], view=r.choice(['q', 'f', 's']), flip=r.random() < 0.5, expr=r.choice(['neutral', 'happy', 'bored', 'confused']))
        a['crowd'] = True; a['scale'] = round(0.93 + r.random() * 0.12, 3); out.append(a)
    return out
def beast(kind, pos, ry=0.0, walk=None, saddle=True):
    return {'kind': kind, 'pos': pos, 'ry': ry, 'walk': walk, 'saddle': saddle}
def S(lines, place, camera, actors=(), pre=0.0, post=0.0, title=None, expr=None, fx=None):
    return {'lines': list(lines), 'place': place, 'cam': camera, 'actors': list(actors), 'pre': pre, 'post': post, 'title': title, 'expr': expr or {}, 'fx': fx or {}}

F, G = 'forum', 'g'
CIT = ['citizen', 'citizen2', 'citizenF']
# ------------------------------------------------------------------ THE CUT (scene -> shots; numbers are line indices in rome/script.json)
CUT = {
1: [
  S([0], 'tiber', cam([-330, 230, 420], [22, 10, -10], [-120, 80, 170], [20, 8, -8], 34, 40), pre=2.5, title='753 BC — THE LEGENDARY FOUNDING OF ROME'),
  S([1], 'tiber', cam([-22, ['g', 1.7], 40], [20, ['g', 2.2], -6], [4, ['g', 1.6], 16], [26, ['g', 2], -14], 44, 42),
    crowd('tiber', 'square', ['citizen', 'citizen2', 'citizenF'], 7, 26, 18, seed=3)),
  S([2], 'tiber', cam(at('tiber', 'square', -4, 1.6, 9), at('tiber', 'square', 0, 1.5, 0), at('tiber', 'square', -2, 1.5, 6), at('tiber', 'square', 0, 1.5, 0), 40, 36),
    [A('romulus', at('tiber', 'square', -0.9), 'q'), A('remus', at('tiber', 'square', 0.9), 'q', flip=True)]),
  S([3], 'tiber', cam(at('tiber', 'square', -1.6, 0.6, 2.6), at('tiber', 'square', -0.9, 1.6, 0), f0=38),
    [A('romulus', at('tiber', 'square', -0.9), 'q', expr='happy'), A('remus', at('tiber', 'square', 0.9), 'q', flip=True, expr='bored')]),
  S([4], 'tiber', cam(at('tiber', 'square', 0.6, 1.5, 2.4), at('tiber', 'square', 0.9, 1.55, 0), f0=34),
    [A('romulus', at('tiber', 'square', -0.9), 'q'), A('remus', at('tiber', 'square', 0.9), 'q', flip=True, expr='smug')]),
  S([5], 'tiber', cam(at('tiber', 'square', 0, 1.5, 4.2), at('tiber', 'square', 0, 1.4, 0), at('tiber', 'square', 0, 1.5, 3.4), at('tiber', 'square', 0, 1.45, 0), 38, 36),
    [A('romulus', at('tiber', 'square', -0.9), 'q', expr='smug'), A('remus', at('tiber', 'square', 0.9), 'q', flip=True, expr='confused')], post=0.4),
  S([6], 'tiber', cam(at('tiber', 'square', -3, 2.2, 6), at('tiber', 'square', 0, 1.4, 0), [-160, 120, 220], [20, 8, -10], 40, 36),
    [A('romulus', at('tiber', 'square', -0.9), 'q', expr='angry'), A('remus', at('tiber', 'square', 0.9), 'q', flip=True, expr='angry')], post=0.8),
],
2: [
  S([0], 'forum:kings', named('street', 'regia'), [A('tarquin', [52, 1.4, -6], 'f', expr='smug')] + crowd(F, 'square', CIT, 14, 70, 30, seed=5), pre=1.0),
  S([1], 'forum:kings', cam(at(F, 'square', 1.6, 1.6, 2.6), at(F, 'square', -0.9, 1.5, 0), f0=36), [A('citizen', at(F, 'square', -0.9), 'q', expr='angry'), A('senator', at(F, 'square', 0.9), 'q', flip=True, expr='bored')]),
  S([2], 'forum:kings', cam(at(F, 'square', -1.6, 1.6, 2.6), at(F, 'square', 0.9, 1.5, 0), f0=36), [A('citizen', at(F, 'square', -0.9), 'q'), A('senator', at(F, 'square', 0.9), 'q', flip=True, expr='smug')]),
  S([3], 'forum:kings', cam(at(F, 'square', -0.9, 1.5, 2.6), at(F, 'square', -0.9, 1.5, 0), at(F, 'square', -0.9, 1.5, 2.0), at(F, 'square', -0.9, 1.52, 0), 34, 30), [A('citizen', at(F, 'square', -0.9), 'f', expr='angry'), A('senator', at(F, 'square', 0.9), 'q', flip=True)]),
  S([4], 'forum:kings', cam([30, 1.0, 0], [52, 4, -6], [36, 1.0, -2], [52, 4.4, -6], 46, 42), [A('tarquin', [52, 1.4, -6], 'f', expr='shocked', walk={'to': [52, 1.4, 14], 't0': 0.45, 't1': 1.0})] + crowd(F, 'regia', CIT, 10, 14, 24, seed=9), title='509 BC — THE ROMAN REPUBLIC'),
  S([5], 'forum:kings', cam([42, 0.6, 1], [49, 2.2, -6], f0=40), [A('senator', [49, 0.9, -6], 'f', expr='happy')] + crowd(F, 'regia', CIT, 8, 10, 12, seed=11)),
  S([6], 'forum:kings', cam(at(F, 'regia', 0, 1.5, 3.0), at(F, 'regia', 0, 1.5, 0), f0=36), [A('citizen', at(F, 'regia', 0), 'f', expr='happy')]),
  S([7], 'forum:kings', cam([44.5, 1.6, -3.5], [49, 2.4, -6], [45.5, 1.7, -4.4], [49, 2.4, -6], 34, 30), [A('senator', [49, 0.9, -6], 'q', expr='bored')], post=0.4),
  S([8], 'forum:republic', cam([60, 30, 60], [-60, 8, -30], [10, 14, 14], [-60, 9, -40], 42, 38), [A('senator', [-60 + i * 1.4, 0, -28 + (i % 2)], 'q', flip=i % 2 == 0, expr='smug') for i in range(-3, 4)] + crowd(F, 'square', CIT, 18, 80, 40, seed=13), post=0.8),
],
3: [
  S([0], 'countryside', named('wide', 'camp'), pre=1.0),
  S([1], 'countryside', cam(at('countryside', 'gate', 0, 0.4, 4), at('countryside', 'gate', 0, 2.2, 0), f0=40), [A('general', at('countryside', 'gate', 0), 'f', expr='angry')] + [A('legionary', at('countryside', 'gate', -6 + (i % 7) * 2, 0, -3 - (i // 7) * 2), 'f') for i in range(21)]),
  S([2], 'countryside', cam(at('countryside', 'gate', -3.2, 1.6, 3), at('countryside', 'gate', -1.4, 1.5, 0), f0=36), [A('citizen', at('countryside', 'gate', -1.4), 'q', expr='confused'), A('general', at('countryside', 'gate', 0.8), 'q', flip=True)]),
  S([3], 'countryside', cam(at('countryside', 'gate', 1.0, 0.7, 2.4), at('countryside', 'gate', 0.8, 1.9, 0), f0=36), [A('citizen', at('countryside', 'gate', -1.4), 'q'), A('general', at('countryside', 'gate', 0.8), 'q', flip=True, expr='angry')]),
  S([4], 'countryside', cam(at('countryside', 'gate', -1.4, 1.5, 2.2), at('countryside', 'gate', -1.4, 1.5, 0), at('countryside', 'gate', -1.4, 1.5, 1.7), at('countryside', 'gate', -1.4, 1.5, 0), 32, 30), [A('citizen', at('countryside', 'gate', -1.4), 'f', expr='bored')], post=0.4),
  S([5], 'countryside', cam([-7, 1.6, 30], [2, 1.6, 0], [-7, 1.6, -20], [2, 1.6, -50], 40, 40, ease='linear'), [A('legionary', [1.6 * ((i % 3) - 1), 0.12, 20 - (i // 3) * 2.2], 's', walk={'to': [1.6 * ((i % 3) - 1), 0.12, -30 - (i // 3) * 2.2], 't0': 0, 't1': 1}) for i in range(24)]),
  S([6], 'map:italy', named('top', 'top'), title='ROME EXPANDS ACROSS ITALY', fx={'map': ['italy_500', 'italy_264']}, post=0.6),
],
4: [
  S([0], 'carthage', named('wide', 'wide', 40, 34), pre=1.0),
  S([1], 'carthage', cam([120, 2.2, 360], [0, 6, 120], [40, 2.2, 300], [0, 6, 100], 42, 42, ease='linear')),
  S([2], 'map:264', named('top', 'top'), fx={'map': ['264', '264']}),
  S([3], 'shipyard', cam(at('shipyard', 'slip', 1.6, 1.6, 2.8), at('shipyard', 'slip', -0.9, 1.6, 0), f0=36), [A('general', at('shipyard', 'slip', -0.9), 'q', expr='angry'), A('senator', at('shipyard', 'slip', 0.9), 'q', flip=True, expr='bored')]),
  S([4], 'shipyard', cam(at('shipyard', 'slip', -1.6, 1.6, 2.8), at('shipyard', 'slip', 0.9, 1.5, 0), f0=36), [A('general', at('shipyard', 'slip', -0.9), 'q'), A('senator', at('shipyard', 'slip', 0.9), 'q', flip=True, expr='smug')]),
  S([5], 'shipyard', cam(at('shipyard', 'slip', -0.9, 1.6, 2.4), at('shipyard', 'slip', -0.9, 1.7, 0), f0=34), [A('general', at('shipyard', 'slip', -0.9), 'f', expr='shocked'), A('senator', at('shipyard', 'slip', 0.9), 'q', flip=True)]),
  S([6], 'shipyard', cam(at('shipyard', 'slip', 0.9, 1.5, 2.6), at('shipyard', 'slip', 0.9, 1.5, 0), at('shipyard', 'slip', 0.9, 1.5, 1.9), at('shipyard', 'slip', 0.9, 1.5, 0), 34, 30), [A('senator', at('shipyard', 'slip', 0.9), 'f', expr='smug')], post=0.4),
  S([7], 'shipyard', named('wide', 'ribs', 42, 46), title='264–146 BC — THE PUNIC WARS'),
  S([8], 'alps', cam(at('alps', 'track', 0, 0.5, 4), at('alps', 'track', 0, 2.1, 0), at('alps', 'track', 0, 0.4, 3), at('alps', 'track', 0, 2.2, 0), 40, 36), [A('hannibal', at('alps', 'track', 0), 'f', expr='smug')]),
  S([9], 'alps', cam([42, ['g', 3.2], 64], [22, ['g', 3.5], 140], [40, ['g', 2.6], 74], [24, ['g', 3.2], 140], 40, 36),
    fx={'beasts': [beast('elephant', [30 * math.sin(z / 90), ['g', 0], z], walk={'to': [30 * math.sin((z - 9) / 90), ['g', 0], z - 9], 't0': 0, 't1': 1}) for z in range(96, 200, 15)]}),
  S([10], 'countryside', cam(at('countryside', 'ridge', -1.2, 1.6, 3), at('countryside', 'ridge', 0, 1.6, -40), f0=40), [A('citizen', at('countryside', 'ridge', -0.8), 'q', expr='shocked'), A('general', at('countryside', 'ridge', 0.9), 'q', flip=True, expr='bored')],
    fx={'beasts': [beast('elephant', [-40 + i * 9, ['g', 0], -26 - i * 4], walk={'to': [-37.5 + i * 9, ['g', 0], -26 - i * 4], 't0': 0, 't1': 1}) for i in range(5)]}),
  S([11], 'countryside', cam(at('countryside', 'ridge', 0.9, 1.6, 2.2), at('countryside', 'ridge', 0.9, 1.7, 0), f0=34), [A('general', at('countryside', 'ridge', 0.9), 'f', expr='bored')]),
  S([12], 'countryside', cam(at('countryside', 'ridge', -0.8, 1.5, 2.2), at('countryside', 'ridge', -0.8, 1.5, 0), f0=34), [A('citizen', at('countryside', 'ridge', -0.8), 'f', expr='confused')]),
  S([13], 'countryside', cam(at('countryside', 'ridge', 0.9, 1.6, 2.6), at('countryside', 'ridge', 0.9, 1.7, 0), at('countryside', 'ridge', 0.9, 1.65, 1.8), at('countryside', 'ridge', 0.9, 1.7, 0), 34, 28), [A('general', at('countryside', 'ridge', 0.9), 'f', expr='bored')], post=0.4),
  S([14], 'countryside:dusk', named('wide', 'camp', 40, 36), [A('legionary', [100 + (i % 10) * 3, ['g', 0], -20 + (i // 10) * 3], 'q') for i in range(40)],
    fx={'beasts': [beast('elephant', [140 + i * 12, ['g', 0], -18 - (i % 2) * 5], ry=-2.2 + i * 0.25) for i in range(4)]}),
  S([15], 'countryside:golden', cam(at('countryside', 'road', 0, 0.5, 4), at('countryside', 'road', 0, 2.1, 0), at('countryside', 'road', 0, 0.4, 3), at('countryside', 'road', 0, 2.2, 0), 40, 36), [A('scipio', at('countryside', 'road', 0), 'f', expr='smug')] + [A('legionary', at('countryside', 'road', -4 + (i % 5) * 2, 0, -3 - (i // 5) * 2.2), 'f') for i in range(15)]),
  S([16], 'carthage:dusk', named('wide', 'sea', 40, 44), fx={'smoke': 1}),
  S([17], 'map:146', named('top', 'top'), fx={'map': ['146', '146']}, post=1.0),
],
5: [
  S([0], 'forum:republic', cam([40, 1.7, 22], [-60, 6, -10], [-10, 1.7, 22], [-80, 6, -6], 44, 44, ease='linear'), crowd(F, 'square', CIT + ['senator', 'legionary'], 30, 110, 44, seed=21), pre=0.8),
  S([1], 'gaul', cam(at('gaul', 'gate', 0, 0.4, 4.2), at('gaul', 'gate', 0, 2.2, 0), at('gaul', 'gate', 0, 0.3, 3.0), at('gaul', 'gate', 0, 2.3, 0), 40, 34), [A('caesar', at('gaul', 'gate', 0), 'f', expr='smug')] + [A('legionary', at('gaul', 'gate', -6 + (i % 7) * 2, 0, -3 - (i // 7) * 2), 'f') for i in range(14)]),
  S([2], 'gaul', named('wide', 'camp', 40, 36)),
  S([3], F + ':republic', cam(at(F, 'east', 1.6, 1.6, 2.6), at(F, 'east', -0.9, 1.5, 0), f0=36), [A('citizen', at(F, 'east', -0.9), 'q', expr='happy'), A('citizen2', at(F, 'east', 0.9), 'q', flip=True)] + crowd(F, 'east', CIT, 8, 30, 20, seed=23, avoid=2.5)),
  S([4], F + ':republic', cam(at(F, 'east', -1.6, 1.6, 2.6), at(F, 'east', 0.9, 1.5, 0), f0=36), [A('citizen', at(F, 'east', -0.9), 'q'), A('citizen2', at(F, 'east', 0.9), 'q', flip=True, expr='happy')]),
  S([5], F + ':republic', cam(at(F, 'east', 0, 1.5, 3.6), at(F, 'east', 0, 1.5, 0), at(F, 'east', 0.6, 1.5, 2.2), at(F, 'east', 1.8, 1.6, 0), 38, 32), [A('citizen', at(F, 'east', -0.9), 'q', expr='confused'), A('citizen2', at(F, 'east', 0.9), 'q', flip=True, expr='confused'), A('senator', at(F, 'east', 2.0, 0, -0.6), 'f', expr='angry', walk={'from': at(F, 'east', 5, 0, -1), 't0': 0, 't1': 0.25})]),
  S([6], 'rubicon', named('wide', 'bank', 40, 44), title='49 BC — CAESAR CROSSES THE RUBICON'),
  S([7], 'rubicon', cam(at('rubicon', 'bank', -2.8, 1.7, 3.0), at('rubicon', 'bank', 6, 1.2, -1), f0=40), [A('general', at('rubicon', 'bank', -0.9), 's', expr='confused'), A('caesar', at('rubicon', 'bank', 0.9), 's', flip=True)]),
  S([8], 'rubicon', cam(at('rubicon', 'bank', 2.4, 0.5, 2.2), at('rubicon', 'bank', 0.9, 2.0, 0), f0=36), [A('general', at('rubicon', 'bank', -0.9), 'q'), A('caesar', at('rubicon', 'bank', 0.9), 'q', flip=True, expr='smug')], post=0.5),
  S([9], F + ':republic', cam([-40, 1.0, 14], [-62, 6, 2], [-50, 1.0, 10], [-62, 6.4, 2], 42, 36), [A('caesar', at(F, 'rostra', 0), 'f', expr='smug')] + crowd(F, 'square', CIT + ['legionary'], 24, 50, 26, seed=25)),
  S([10], F + ':republic', cam(at(F, 'square', 1.6, 1.6, 2.6), at(F, 'square', -0.9, 1.5, 0), f0=36), [A('citizen', at(F, 'square', -0.9), 'q', expr='confused'), A('senator', at(F, 'square', 0.9), 'q', flip=True)]),
  S([11], F + ':republic', cam(at(F, 'square', 0.9, 1.5, 2.8), at(F, 'square', 0.9, 1.5, 0), at(F, 'square', 0.9, 1.5, 2.0), at(F, 'square', 0.9, 1.52, 0), 34, 30), [A('senator', at(F, 'square', 0.9), 'f', expr='bored')], post=0.6),
],
6: [
  S([0], 'senate', named('entrance', 'tribunal', 50, 40), [A('caesar', at('senate', 'tribunal', 0), 'f', expr='neutral')] + [A('senator', at('senate', 'stepL' if i % 2 else 'stepR', 0, 0, -6 + i * 2), 'q', flip=i % 2 == 0, expr='bored') for i in range(8)], pre=1.0, title='15 MARCH 44 BC — THE ASSASSINATION OF CAESAR'),
  S([1], 'senate', cam([-6.5, 2.4, 6], [2, 2.0, -8], [-5.5, 2.2, 2], [1, 2.0, -9], 44, 40), [A('caesar', at('senate', 'tribunal', 0), 'f')] + [A('senator', [(-1.6 + i * 0.8), 0, -7.2 + (i % 2) * 0.6], 'q', flip=i > 2, expr='smug') for i in range(5)]),
  S([2], 'senate', cam([0, 1.9, -7.4], [0, 2.4, -10.5], f0=34), [A('caesar', at('senate', 'tribunal', 0), 'f', expr='confused')]),
  S([3], 'senate', cam([0.6, 1.6, -6.0], [0.4, 1.5, -8.0], f0=34), [A('senator', [0.4, 0, -8.0], 'f', expr='shocked')]),
  S([4], 'senate', named('entrance', 'entrance', 50, 56), [A('senator', [(-4 + i * 1.2), 0, 2 + (i % 3)], 'q', flip=i % 2 == 0, expr='shocked', walk={'to': [(-6 + i * 2.4), 0, 11], 't0': 0.1, 't1': 1}) for i in range(7)]),
  S([5], F + ':republic', cam(at(F, 'east', 1.6, 1.6, 2.6), at(F, 'east', -0.9, 1.5, 0), f0=36), [A('citizen', at(F, 'east', -0.9), 'q', expr='confused'), A('citizen2', at(F, 'east', 0.9), 'q', flip=True, expr='bored')]),
  S([6], F + ':republic', cam(at(F, 'east', 0.9, 1.5, 2.4), at(F, 'east', 0.9, 1.5, 0), f0=34), [A('citizen2', at(F, 'east', 0.9), 'f', expr='bored')]),
  S([7], F + ':republic', cam(at(F, 'east', -0.9, 1.5, 2.4), at(F, 'east', -0.9, 1.5, 0), f0=34), [A('citizen', at(F, 'east', -0.9), 'f', expr='confused')]),
  S([8], F + ':republic', cam(at(F, 'east', 0, 1.5, 3.4), at(F, 'east', 0, 1.5, 0), at(F, 'east', 0, 1.5, 2.6), at(F, 'east', 0, 1.5, 0), 38, 34), [A('citizen', at(F, 'east', -0.9), 'q', expr='shocked'), A('citizen2', at(F, 'east', 0.9), 'q', flip=True, expr='bored')], post=0.8),
],
7: [
  S([0], 'forum:augustan:golden', named('aerial', 'wide', 40, 42), pre=1.0),
  S([1], 'forum:augustan:golden', cam([46, 1.7, -6], [70, 3, -6], [58, 1.0, -6], [70, 2.4, -6], 46, 40), [A('augustus', at(F, 'divus', 0), 'f', expr='neutral')] + crowd(F, 'divus', CIT + ['senator'], 12, 30, 30, seed=31, avoid=2.2), title='27 BC — AUGUSTUS BECOMES EMPEROR'),
  S([2], 'forum:augustan:golden', cam(at(F, 'divus', -2.4, 0.5, 2.2), at(F, 'divus', 0, 2.0, 0), f0=36), [A('augustus', at(F, 'divus', 0), 'q', flip=True, expr='neutral'), A('citizen', at(F, 'divus', -1.8), 'q')]),
  S([3], 'forum:augustan:golden', cam(at(F, 'divus', 1.2, 1.6, 2.4), at(F, 'divus', -1.8, 1.5, 0), f0=36), [A('augustus', at(F, 'divus', 0), 'q', flip=True), A('citizen', at(F, 'divus', -1.8), 'q', expr='happy')]),
  S([4], 'forum:augustan:golden', cam(at(F, 'divus', 0, 1.6, 2.2), at(F, 'divus', 0, 1.6, 0), f0=34), [A('augustus', at(F, 'divus', 0), 'f', expr='smug')]),
  S([5], 'forum:augustan:golden', cam(at(F, 'divus', -1.8, 1.5, 2.2), at(F, 'divus', -1.8, 1.5, 0), f0=34), [A('citizen', at(F, 'divus', -1.8), 'f', expr='happy')]),
  S([6], 'forum:augustan:golden', cam(at(F, 'divus', 0, 1.6, 2.6), at(F, 'divus', 0, 1.6, 0), at(F, 'divus', 0, 1.6, 1.9), at(F, 'divus', 0, 1.62, 0), 34, 28), [A('augustus', at(F, 'divus', 0), 'f', expr='bored')], post=0.4),
  S([7], 'forum:augustan:golden', named('wide', 'aerial', 42, 40), crowd(F, 'square', CIT + ['senator'], 30, 120, 50, seed=33)),
  S([8], 'forum:augustan:golden', cam([10, 20, 60], [-60, 8, -10], [-10, 6, 30], [-60, 8, -20], 40, 38), post=1.0),
],
8: [
  S([0], 'imperialRome', cam([700, 420, 640], [0, 10, 0], [380, 220, 340], [0, 20, 0], 36, 38), pre=1.0, title='117 AD — ROME AT ITS GREATEST TERRITORIAL EXTENT'),
  S([1], 'imperialRome', named('street', 'street', 46, 42), crowd('imperialRome', 'plaza', CIT + ['legionary'], 30, 120, 60, seed=41)),
  S([2], 'imperialRome', cam([30, 1.2, 150], [0, 10, 0], [10, 2.2, 112], [0, 26, 0], 46, 56), crowd('imperialRome', 'front', CIT, 20, 80, 30, seed=43, avoid=2.2)),
  S([3], 'imperialRome', cam(at('imperialRome', 'front', 1.6, 1.6, 2.6), at('imperialRome', 'front', -0.9, 1.5, 0), f0=36), [A('citizen', at('imperialRome', 'front', -0.9), 'q', expr='confused'), A('citizen2', at('imperialRome', 'front', 0.9), 'q', flip=True)]),
  S([4], 'imperialRome', cam(at('imperialRome', 'front', -1.6, 1.6, 2.6), at('imperialRome', 'front', 0.9, 1.5, 0), f0=36), [A('citizen', at('imperialRome', 'front', -0.9), 'q'), A('citizen2', at('imperialRome', 'front', 0.9), 'q', flip=True, expr='happy')]),
  S([5], 'imperialRome', cam(at('imperialRome', 'front', -0.9, 1.5, 2.4), at('imperialRome', 'front', -0.9, 1.5, 0), f0=34), [A('citizen', at('imperialRome', 'front', -0.9), 'f', expr='shocked')]),
  S([6], 'imperialRome', cam(at('imperialRome', 'front', 0.9, 1.5, 2.6), at('imperialRome', 'front', 0.9, 1.5, 0), at('imperialRome', 'front', 0.9, 1.5, 1.9), at('imperialRome', 'front', 0.9, 1.52, 0), 34, 30), [A('citizen2', at('imperialRome', 'front', 0.9), 'f', expr='smug')], post=0.4),
  S([7], 'map:117', named('top', 'top'), fx={'map': ['117', '117']}),
  S([8], 'imperialRome:dusk', cam([180, 6, 260], [0, 20, 0], [120, 4, 190], [0, 24, 0], 40, 44), post=1.0),
],
9: [
  S([0, 1], 'palace', cam([0, 1.8, 20], [0, 2.2, -16], [0, 1.6, 4], [0, 2.0, -16], 48, 44, ease='linear'), [A('caligula', [-3, 0, -12], 'q', expr='happy'), A('nero', [3, 0, -14], 'q', flip=True, expr='happy')] + [A('senator', [-4.5 + (i % 2) * 9, 0, -2 - i * 3], 'q', flip=i % 2 == 1, expr='bored') for i in range(4)], pre=1.0, title='POWER CAN BE A VERY STRANGE THING'),
  S([2], 'palace', cam(at('palace', 'corner', 1.6, 1.6, 2.6), at('palace', 'corner', -0.9, 1.5, 0), f0=36), [A('citizen', at('palace', 'corner', -0.9), 'q', expr='confused'), A('senator', at('palace', 'corner', 0.9), 'q', flip=True, expr='bored')]),
  S([3], 'palace', cam(at('palace', 'corner', 0.9, 1.5, 2.4), at('palace', 'corner', 0.9, 1.5, 0), f0=34), [A('senator', at('palace', 'corner', 0.9), 'f', expr='bored')]),
  S([4], 'palace', cam(at('palace', 'corner', -0.9, 1.5, 2.4), at('palace', 'corner', -0.9, 1.5, 0), f0=34), [A('citizen', at('palace', 'corner', -0.9), 'f', expr='shocked')]),
  S([5], 'palace', cam(at('palace', 'corner', 0.9, 1.5, 2.8), at('palace', 'corner', 0.9, 1.5, 0), at('palace', 'corner', 0.9, 1.5, 1.8), at('palace', 'corner', 0.9, 1.52, 0), 34, 28), [A('senator', at('palace', 'corner', 0.9), 'f', expr='smug')], post=0.5),
  S([6], 'palace', cam([0, 2.4, 10], [0, 3, -16], [0, 3.4, -6], [0, 4, -20], 44, 40), [A('nero', [0, 0, -14], 'f', expr='happy')], post=1.2, fx={'fadeTo': 'dark'}),
],
10: [
  S([0], 'imperialRome:overcast', cam([170, 1.7, 150], [80, 4, 100], [120, 1.7, 160], [40, 4, 120], 44, 44, ease='linear'), crowd('imperialRome', 'plaza', CIT + ['legionary'], 16, 120, 60, seed=51), pre=1.0),
  S([1], 'map:crisis', named('top', 'top'), fx={'map': ['117', 'crisis']}, title='235–284 AD — CRISIS OF THE THIRD CENTURY'),
  S([2], 'imperialRome:overcast', cam(at('imperialRome', 'plaza', 1.6, 1.6, 2.6), at('imperialRome', 'plaza', -0.9, 1.5, 0), f0=36), [A('citizen', at('imperialRome', 'plaza', -0.9), 'q', expr='confused'), A('citizen2', at('imperialRome', 'plaza', 0.9), 'q', flip=True, expr='bored')]),
  S([3], 'imperialRome:overcast', cam(at('imperialRome', 'plaza', 0.9, 1.5, 2.4), at('imperialRome', 'plaza', 0.9, 1.5, 0), f0=34), [A('citizen2', at('imperialRome', 'plaza', 0.9), 'f', expr='bored')]),
  S([4], 'imperialRome:overcast', cam(at('imperialRome', 'plaza', -0.9, 1.5, 2.4), at('imperialRome', 'plaza', -0.9, 1.5, 0), f0=34), [A('citizen', at('imperialRome', 'plaza', -0.9), 'f', expr='confused')]),
  S([5], 'imperialRome:overcast', cam(at('imperialRome', 'plaza', 0.9, 1.5, 2.8), at('imperialRome', 'plaza', 0.9, 1.5, 0), at('imperialRome', 'plaza', 0.9, 1.5, 1.9), at('imperialRome', 'plaza', 0.9, 1.52, 0), 34, 28), [A('citizen2', at('imperialRome', 'plaza', 0.9), 'f', expr='smug')], post=0.4),
  S([6], 'countryside:overcast', named('camp', 'wide', 42, 40), [A('legionary', [140 + (i % 8) * 3, ['g', 0], -110 + (i // 8) * 3], 'q') for i in range(24)], post=0.8),
],
11: [
  S([0], 'palace', cam([0, 0.6, -6], [0, 2.4, -14], [0, 0.5, -8], [0, 2.6, -14], 42, 36), [A('diocletian', [0, 0, -14], 'f', expr='neutral')], pre=1.0),
  S([1], 'constantinople', named('aerial', 'harbour', 40, 42), [A('constantine', at('constantinople', 'harbour', 0), 'f')]),
  S([2], 'map:eastwest', named('top', 'top'), fx={'map': ['117', 'eastwest']}, title='EAST AND WEST — TWO ADMINISTRATIONS'),
  S([3], 'palace', cam(at('palace', 'table', 1.6, 1.6, 2.8), at('palace', 'table', -0.9, 1.5, 0), f0=36), [A('general', at('palace', 'table', -0.9, 0, 2.6), 'q', expr='confused'), A('senator', at('palace', 'table', 0.9, 0, 2.6), 'q', flip=True)]),
  S([4], 'palace', cam(at('palace', 'table', -1.6, 1.6, 5.2), at('palace', 'table', 0.9, 1.5, 2.6), f0=36), [A('general', at('palace', 'table', -0.9, 0, 2.6), 'q'), A('senator', at('palace', 'table', 0.9, 0, 2.6), 'q', flip=True, expr='smug')]),
  S([5], 'palace', cam(at('palace', 'table', -0.9, 1.6, 4.8), at('palace', 'table', -0.9, 1.7, 2.6), f0=34), [A('general', at('palace', 'table', -0.9, 0, 2.6), 'f', expr='happy')]),
  S([6], 'palace', cam(at('palace', 'table', 2.6, 1.5, 4.8), at('palace', 'table', 2.6, 1.5, 2.4), f0=34), [A('citizen', at('palace', 'table', 2.6, 0, 2.4), 'f', expr='bored')], post=0.4),
  S([7], 'constantinople', named('harbour', 'harbour', 42, 38), post=0.8),
],
12: [
  S([0], 'forum:imperial:overcast', named('wide', 'wide', 44, 40), pre=1.0),
  S([1], 'countryside:overcast', cam(at('countryside', 'road', 0, 0.5, 5), at('countryside', 'road', 0, 2.0, 0), f0=40), [A('odoacer', at('countryside', 'road', 0), 'f', expr='smug')] + [A('legionary', at('countryside', 'road', -3 + (i % 4) * 2, 0, -3 - (i // 4) * 2), 'q') for i in range(8)]),
  S([2], 'forum:imperial:dusk', named('wide', 'wide', 44, 38), fx={'smoke': 1}),
  S([3], 'ravenna', cam([0, 1.8, 10], [0, 2.0, -14], [0, 1.6, 0], [0, 2.0, -14], 46, 40), [A('augustulus', at('ravenna', 'throne', 0.9), 'f', expr='confused', scale=0.86), A('odoacer', at('ravenna', 'throne', -1.2, 0, 2), 'q', expr='smug')], title='476 AD — FALL OF THE WESTERN ROMAN EMPIRE'),
  S([4], 'ravenna', cam([0, 3, -6], [0, 8, -21], [0, 2.6, -10], [0, 8, -21], 40, 36), fx={'banner': 1}),
  S([5], 'ravenna', cam(at('ravenna', 'corner', 1.6, 1.6, 2.6), at('ravenna', 'corner', -0.9, 1.5, 0), f0=36), [A('citizen', at('ravenna', 'corner', -0.9), 'q', expr='confused'), A('senator', at('ravenna', 'corner', 0.9), 'q', flip=True, expr='bored')]),
  S([6], 'ravenna', cam(at('ravenna', 'corner', 0.9, 1.5, 2.4), at('ravenna', 'corner', 0.9, 1.5, 0), f0=34), [A('senator', at('ravenna', 'corner', 0.9), 'f', expr='bored')]),
  S([7], 'ravenna', cam(at('ravenna', 'corner', -0.9, 1.5, 2.6), at('ravenna', 'corner', -0.9, 1.5, 0), at('ravenna', 'corner', -0.9, 1.5, 1.8), at('ravenna', 'corner', -0.9, 1.52, 0), 34, 28), [A('citizen', at('ravenna', 'corner', -0.9), 'f', expr='shocked')], post=0.5),
  S([8], 'map:476', named('top', 'top'), fx={'map': ['eastwest', '476']}),
  S([9], 'constantinople:late', named('aerial', 'harbour', 40, 40), post=1.0),
],
13: [
  S([0], 'constantinople:late', named('aerial', 'walls', 40, 44), pre=1.0),
  S([1], 'constantinople:late:dusk', named('walls', 'walls', 44, 38), title='1453 — FALL OF CONSTANTINOPLE'),
  S([2], 'forum:ruins:golden', named('aerial', 'wide', 40, 42)),
  S([3], 'forum:ruins:golden', cam([0, 1.7, 30], [-92, 8, 22], [-30, 1.7, 26], [-92, 8, 22], 42, 40, ease='linear')),
  S([4], 'forum:ruins:golden', cam([10, 3, -10], [-60, 10, -48], [-20, 2, -16], [-60, 10, -48], 42, 40)),
  S([5], 'forum:ruins:golden', cam(at(F, 'square', 0.6, 1.5, 3.0), at(F, 'square', -0.9, 1.5, 0), f0=36), [A('citizen', at(F, 'square', -0.9), 'q', expr='happy')]),
  S([6], 'forum:ruins:golden', cam(at(F, 'square', -0.9, 1.5, 2.4), at(F, 'square', -0.9, 1.5, 0), at(F, 'square', -0.9, 4, 10), at(F, 'square', -0.9, 1.5, 0), 34, 40), [A('citizen', at(F, 'square', -0.9), 'f', expr='happy')], post=0.8),
],
14: [
  S([0], 'forum:ruins:golden', cam([118, 30, 62], [-60, 6, -6], [40, 10, 20], [-40, 4, 0], 44, 42), [A('citizen', at(F, 'square', -0.9), 'q'), A('senator', at(F, 'square', 0.9), 'q', flip=True)], pre=1.0),
  S([1], 'forum:ruins:golden', cam(at(F, 'square', 1.6, 1.6, 2.6), at(F, 'square', -0.9, 1.5, 0), f0=36), [A('citizen', at(F, 'square', -0.9), 'q', expr='confused'), A('senator', at(F, 'square', 0.9), 'q', flip=True)]),
  S([2], 'forum:ruins:golden', cam(at(F, 'square', 0.9, 1.5, 2.4), at(F, 'square', 0.9, 1.5, 0), f0=34), [A('senator', at(F, 'square', 0.9), 'f', expr='smug')]),
  S([3], 'forum:ruins:golden', cam(at(F, 'square', -0.9, 1.5, 2.4), at(F, 'square', -0.9, 1.5, 0), f0=34), [A('citizen', at(F, 'square', -0.9), 'f', expr='happy')]),
  S([4, 5, 6], 'forum:ruins:golden', cam(at(F, 'square', 0, 1.5, 3.2), at(F, 'square', 0, 1.4, 0), [160, 90, 140], [-40, 4, 0], 36, 46), [A('citizen', at(F, 'square', -0.9), 'q', expr='happy'), A('senator', at(F, 'square', 0.9), 'q', flip=True, expr='happy')], post=2.0, title='ROME — BUILT TO RULE. REMEMBERED FOREVER.', fx={'endcard': 1}),
],
}

NAMES = {'romulus': ('ROMULUS', 'Legendary founder of Rome'), 'remus': ('REMUS', 'His twin brother'), 'tarquin': ('TARQUINIUS SUPERBUS', 'Last King of Rome'),
         'hannibal': ('HANNIBAL BARCA', 'Carthaginian general'), 'scipio': ('SCIPIO AFRICANUS', 'Roman general'), 'caesar': ('GAIUS JULIUS CAESAR', 'General and dictator'),
         'augustus': ('AUGUSTUS', 'First Roman emperor'), 'caligula': ('CALIGULA', 'Emperor, 37–41 AD'), 'nero': ('NERO', 'Emperor, 54–68 AD'),
         'diocletian': ('DIOCLETIAN', 'Emperor, 284–305 AD'), 'constantine': ('CONSTANTINE THE GREAT', 'Emperor, 306–337 AD'), 'odoacer': ('ODOACER', 'Germanic general'),
         'augustulus': ('ROMULUS AUGUSTULUS', 'Last emperor of the West')}
# ------------------------------------------------------------------ timing
def build():
    shots, mix, T, seen = [], [], 0.0, set()
    for sc in script['scenes']:
        n = sc['scene']; lines = sc['lines']
        used = [i for s in CUT[n] for i in s['lines']]
        assert sorted(used) == list(range(len(lines))), (n, sorted(used))
        for k, s in enumerate(CUT[n]):
            t0 = T; t = T + s['pre']; talks = []
            for j, i in enumerate(s['lines']):
                ln = timing[(n, i)]; who = ln['who']
                gap = 0.25 if j else 0.0
                t += gap
                mix.append({'t': round(t, 3), 'file': ln['file'], 'who': who})
                if who != 'NARRATOR': talks.append({'id': WHO[who], 't0': round(t - t0, 3), 't1': round(t + ln['dur'] - t0, 3), 'mouth': mouth_track(ln['file'], ln['dur'])})
                t += ln['dur']
                nxt = s['lines'][j + 1] if j + 1 < len(s['lines']) else None
            # breathing room after a shot: longer after narration, short in quick dialogue
            last = timing[(n, s['lines'][-1])]['who'] if s['lines'] else 'NARRATOR'
            t += s['post'] + (0.55 if last == 'NARRATOR' else 0.3)
            dur = round(t - t0, 3)
            names = []
            for a in s['actors']:
                if a['id'] in NAMES and a['id'] not in seen and not a.get('crowd'): seen.add(a['id']); names.append(NAMES[a['id']])
            shot = {'id': f's{n:02d}_{k:02d}', 'scene': n, 'place': s['place'], 'start': round(t0, 3), 'dur': dur, 'cam': s['cam'], 'actors': s['actors'],
                    'talks': talks, 'title': s['title'], 'fx': s['fx'], 'names': names}
            shots.append(shot); T = t
    total = round(T + 0.5, 3)
    json.dump({'fps': FPS, 'total': total, 'shots': shots, 'stages': ST}, open(f'{ROOT}/film/timeline.json', 'w'))
    json.dump({'fps': FPS, 'total': total, 'lines': mix}, open(f'{ROOT}/rome/mix.json', 'w'), indent=0)
    print(len(shots), 'shots', round(total / 60, 2), 'min', sum(round(s['dur'] * FPS) for s in shots), 'frames')

if __name__ == '__main__':
    build()
