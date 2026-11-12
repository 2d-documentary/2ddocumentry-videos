"""Procedural score + sound effects + mix for an episode (no samples, no licences: everything is synthesised here).
usage: python engine/audio.py episodes/<ep> build/<ep>     (needs build/<ep>/voice.wav + timeline.json from tts.py)
writes build/<ep>/music.wav, sfx.wav, mix_raw.wav; the workflow then loudness-normalises to about -15 LUFS with ffmpeg."""
import json, os, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

SR = 24000
ep, out = sys.argv[1], sys.argv[2]
script = json.load(open(os.path.join(ep, "script.json"))); tl = json.load(open(os.path.join(out, "timeline.json")))
sr, voice = wavfile.read(os.path.join(out, "voice.wav")); voice = voice.astype(np.float64); assert sr == SR
N = len(voice); T = N / SR
rng = np.random.default_rng(7)
def lp(x, f, o=2): b, a = butter(o, f / (SR / 2)); return lfilter(b, a, x)
def hp(x, f, o=2): b, a = butter(o, f / (SR / 2), 'high'); return lfilter(b, a, x)
def bp(x, f0, f1, o=2): b, a = butter(o, [f0 / (SR / 2), f1 / (SR / 2)], 'band'); return lfilter(b, a, x)
def env(n, a=.005, d=.3, curve=4): t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-curve * np.maximum(0, t - a) / max(d, 1e-3)); return e
def tone(f, dur, kind='sine', vib=0, vibr=5):
    t = np.arange(int(dur * SR)) / SR; ph = 2 * np.pi * np.cumsum(f * (1 + vib * np.sin(2 * np.pi * vibr * t))) / SR
    if kind == 'sine': return np.sin(ph)
    if kind == 'saw': return 2 * ((ph / (2 * np.pi)) % 1) - 1
    if kind == 'square': return np.sign(np.sin(ph))
    if kind == 'tri': return 2 * np.abs(2 * ((ph / (2 * np.pi)) % 1) - 1) - 1
def pluck(f, dur, bright=.5):   # Karplus-Strong string (oud / harp / lyre)
    n = int(dur * SR); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p) * (.5 + .5 * bright); o = np.zeros(n)
    for i in range(n): o[i] = buf[i % p]; buf[i % p] = .5 * (buf[i % p] + buf[(i + 1) % p]) * .996
    return o * env(n, .002, dur * .7, 3)
def noise(dur): return rng.uniform(-1, 1, int(dur * SR))
def drum(kind):
    if kind == 'doum': n = int(.45 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * (70 + 60 * np.exp(-t * 18)) * t) * np.exp(-t * 7) + .15 * lp(noise(.45), 400) * np.exp(-t * 20)
    if kind == 'tek': return bp(noise(.12), 1800, 6000) * env(int(.12 * SR), .001, .04, 5) * .6
    if kind == 'taiko': n = int(1.2 * SR); t = np.arange(n) / SR; return 1.6 * np.sin(2 * np.pi * (55 + 40 * np.exp(-t * 10)) * t) * np.exp(-t * 3.5) + .3 * lp(noise(1.2), 300) * np.exp(-t * 8)
    if kind == 'shaker': return hp(noise(.06), 5000) * env(int(.06 * SR), .002, .02, 4) * .35
HIJAZ = [0, 1, 4, 5, 7, 8, 10]   # D Hijaz-flavoured scale degrees
def note(root, deg, octv=0): s = HIJAZ[deg % 7] + 12 * (deg // 7 + octv); return root * 2 ** (s / 12)

MOODS = {   # tempo, drum density, melody instrument, pad, energy, root
  'bright': (112, 2, 'pluck', 1, .9, 146.8), 'flow': (98, 1, 'harp', 1, .7, 146.8), 'regal': (92, 3, 'brass', 1, .9, 130.8),
  'grand': (110, 2, 'pluck', 1, 1., 146.8), 'drone': (70, 0, None, 1, .5, 110.0), 'gallop': (126, 4, 'pluck', 0, 1., 146.8),
  'elegant': (100, 1, 'flute', 1, .7, 164.8), 'shimmer': (96, 1, 'flute', 1, .7, 174.6), 'musicbox': (88, 0, 'box', 1, .6, 196.0),
  'creepy': (92, 1, 'pizz', 0, .7, 110.0), 'war': (118, 4, 'brass', 1, 1., 123.5), 'ominous': (78, 1, 'brass', 1, .7, 98.0),
  'lyre': (108, 2, 'harp', 1, .8, 164.8), 'sultry': (94, 1, 'flute', 1, .8, 146.8), 'theme': (112, 2, 'pluck', 1, 1., 146.8)}
SCENE_MOOD = {'S01': 'bright', 'S02': 'flow', 'S03': 'regal', 'S04': 'grand', 'S05': 'drone', 'S06': 'gallop', 'S07': 'elegant', 'S08': 'shimmer',
              'S09': 'musicbox', 'S10': 'creepy', 'S11': 'war', 'S12': 'ominous', 'S13': 'lyre', 'S14': 'sultry', 'S15': 'theme'}

def scene_music(mood, dur, seed):
    bpm, dens, inst, pad, energy, root = MOODS[mood]; r = np.random.default_rng(seed); n = int(dur * SR); o = np.zeros(n + SR * 2)
    beat = 60 / bpm; step = beat / 2
    def add(x, at=0., g=1.):
        i = int(at * SR); j = min(len(o), i + len(x));
        if i < len(o) and j > i: o[i:j] += x[:j - i] * g
    # drone / pad: root + fifth, slowly breathing
    if pad:
        t = np.arange(n) / SR; lfo = .75 + .25 * np.sin(2 * np.pi * t / 7)
        d = (tone(root / 2, dur, 'saw') + .7 * tone(root * .75, dur, 'saw') + .5 * tone(root, dur, 'saw', vib=.003)) * lfo
        add(lp(d, 900 if mood not in ('drone', 'ominous') else 500) * .16)
    if mood in ('drone', 'ominous'): add(lp(noise(dur), 600) * (.5 + .5 * np.sin(2 * np.pi * np.arange(n) / SR / 5)) * .05)   # wind
    # percussion
    pats = {0: [], 1: [('doum', 0), ('tek', 3)], 2: [('doum', 0), ('tek', 2), ('tek', 3), ('doum', 4), ('tek', 6)], 3: [('taiko', 0), ('tek', 4)], 4: [('doum', 0), ('tek', 1), ('doum', 2), ('tek', 3), ('doum', 4), ('tek', 5), ('tek', 6), ('tek', 7)]}
    bar = 8 * step; nb = int(dur / bar) + 1
    for b in range(nb):
        for k, s in pats[dens]: add(drum(k), b * bar + s * step, .55 * energy)
        if dens >= 2 or mood == 'shimmer': [add(drum('shaker'), b * bar + s * step / 2, .5) for s in range(16)]
    # melody: a motif repeated with variation (call-and-response), rests between phrases
    deg = 4; motif = [r.integers(-2, 3) for _ in range(6)]
    for b in range(nb):
        if inst is None or (b % 4 == 3): continue
        for i in range(6 if b % 2 == 0 else 4):
            if r.random() < .25: continue
            deg = int(np.clip(deg + motif[i % 6] + (r.integers(-1, 2) if b % 2 else 0), 0, 11)); f = note(root, deg, 1); at = b * bar + i * step * (1.33 if inst in ('flute', 'brass') else 1); L = step * (2.6 if inst in ('flute', 'brass') else 1.8)
            if inst in ('pluck', 'harp', 'box', 'pizz'): x = pluck(f * (2 if inst in ('harp', 'box') else 1), L, .9 if inst == 'box' else .5) * (.5 if inst == 'pizz' else .38)
            elif inst == 'flute': x = (tone(f * 2, L, 'sine', vib=.006) + .2 * tone(f * 4, L, 'sine')) * env(int(L * SR), .06, L * .8, 1.5) * .16 + lp(noise(L), 3000) * env(int(L * SR), .02, .1) * .02
            elif inst == 'brass': x = lp(tone(f, L, 'saw', vib=.004) + .5 * tone(f * 1.5, L, 'saw'), 1800) * env(int(L * SR), .05, L * .7, 1.5) * .14
            add(x, at)
    o = o[:n]; fade = int(.8 * SR); o[:fade] *= np.linspace(0, 1, fade); o[-fade:] *= np.linspace(1, 0, fade)
    return o

# ---- music track: one cue per scene, crossfaded
music = np.zeros(N + SR * 3)
first = {}
for l in tl["lines"]:
    sc = next(s for s in script["lines"] if s["id"] == l["id"])["scene"]; first.setdefault(sc, l["start"])
order = sorted(first.items(), key=lambda kv: kv[1])
for i, (sc, st) in enumerate(order):
    s0 = max(0, st - .8); s1 = order[i + 1][1] + .8 if i + 1 < len(order) else T
    m = scene_music(SCENE_MOOD.get(sc, 'theme'), s1 - s0, i + 3); a = int(s0 * SR); music[a:a + len(m)] += m
music = music[:N]
# duck under the voice (sidechain from a smoothed voice envelope)
ve = np.convolve(np.abs(voice), np.ones(int(.06 * SR)) / int(.06 * SR), 'same'); ve = np.convolve(ve, np.ones(int(.25 * SR)) / int(.25 * SR), 'same'); ve = np.clip(ve / (np.percentile(ve, 95) + 1e-9), 0, 1)
music *= (1 - .55 * ve)
music *= 10 ** (-17 / 20) / (np.sqrt(np.mean(music ** 2)) + 1e-9) * .25   # music bed well under the voice

# ---- sound effects at word cues
def sfx(name):
    if name == 'whoosh': x = noise(.7); return bp(x, 300, 3000) * np.sin(np.linspace(0, np.pi, len(x))) ** 2 * .6
    if name == 'recordscratch': t = np.arange(int(.45 * SR)) / SR; return (bp(noise(.45), 400, 2500) * .5 + .3 * tone(1, .45, 'saw') * 0 + .4 * np.sin(2 * np.pi * (900 - 1500 * t) * t)) * env(len(t), .005, .3, 2)
    if name == 'sting': x = sum(lp(tone(146.8 * k, 1.2, 'saw'), 2400) for k in (1, 1.26, 1.5, 2)) * env(int(1.2 * SR), .01, .9, 2); return x * .25 + drum('taiko') [:len(x)] * .5
    if name == 'drumhit': return drum('taiko')
    if name == 'water': return sum(np.roll(np.pad(tone(500 + 400 * rng.random(), .08) * env(int(.08 * SR), .002, .05), (0, int(.8 * SR))), int(rng.random() * .7 * SR)) for _ in range(9)) * .3
    if name == 'chomp': return np.concatenate([drum('doum')[:int(.15 * SR)] * 1.2 + bp(noise(.15), 800, 4000) * .4, np.zeros(int(.05 * SR)), drum('doum')[:int(.15 * SR)] + bp(noise(.15), 800, 4000) * .4])
    if name == 'boing': t = np.arange(int(.6 * SR)) / SR; return np.sin(2 * np.pi * (180 + 120 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4)) * t) * np.exp(-t * 5) * .6
    if name == 'pop': t = np.arange(int(.12 * SR)) / SR; return np.sin(2 * np.pi * (600 + 2000 * t) * t) * np.exp(-t * 40) * .6
    if name == 'choir': L = 2.2; x = sum(tone(220 * k, L, 'saw', vib=.005) for k in (1, 1.25, 1.5)); y = bp(x, 600, 1200) + bp(x, 2400, 3200) * .4; return y * env(int(L * SR), .4, 1.6, 1.2) * .25
    if name == 'ufo': t = np.arange(int(1.4 * SR)) / SR; return np.sin(2 * np.pi * (700 + 250 * np.sin(2 * np.pi * 6 * t)) * t) * env(len(t), .1, 1, 1.5) * .3
    if name == 'thud': return drum('doum') * 1.2
    if name == 'stomach': t = np.arange(int(1 * SR)) / SR; return lp(tone(60, 1, 'saw', vib=.3, vibr=7), 300) * env(len(t), .1, .7, 2) * .6
    if name == 'uhoh': return np.concatenate([tone(330, .22, 'tri') * env(int(.22 * SR), .01, .2, 2), tone(247, .4, 'tri') * env(int(.4 * SR), .01, .35, 2)]) * .4
    if name == 'horses': x = np.zeros(int(1.6 * SR)); [x.__setitem__(slice(i, i + int(.05 * SR)), x[i:i + int(.05 * SR)] + drum('tek')[:int(.05 * SR)] * 1.5) for i in [int((b * .32 + o) * SR) for b in range(5) for o in (0, .07, .14)]]; return lp(x, 2500)
    if name == 'fanfare': return np.concatenate([lp(tone(f, d, 'saw'), 2400) * env(int(d * SR), .02, d * .8, 2) for f, d in ((293.7, .3), (370, .3), (440, .9))]) * .22
    if name == 'monkey': return np.concatenate([np.sin(2 * np.pi * np.cumsum(np.linspace(900, 1600, int(.1 * SR))) / SR) * env(int(.1 * SR), .005, .08) for _ in range(4)]) * .3
    if name == 'chisel': return np.concatenate([np.pad(bp(noise(.04), 2500, 7000) * env(int(.04 * SR), .001, .02), (0, int(.1 * SR))) for _ in range(4)]) * .7
    if name == 'chime': return sum(tone(f, 1.2) * env(int(1.2 * SR), .005, .8, 3) for f in (1318.5, 1760, 2637)) * .15
    if name == 'rewind': t = np.arange(int(.8 * SR)) / SR; return bp(noise(.8), 500, 4000) * .3 + np.sin(2 * np.pi * (1600 * np.exp(-t * 3)) * t) * .2 * env(len(t), .01, .7, 1)
    if name == 'reveal': return sum(tone(f, 2, 'sine') * env(int(2 * SR), .3, 1.5, 1.5) for f in (523, 659, 784, 1046)) * .14
    if name == 'squelch': t = np.arange(int(.5 * SR)) / SR; return lp(noise(.5), 700) * np.sin(2 * np.pi * 7 * t) ** 2 * env(len(t), .02, .4) * .8
    if name == 'gong': t = np.arange(int(3 * SR)) / SR; return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in ((110, .8), (171, 1.1), (243, 1.5), (397, 2))) * .25
    if name == 'clash': return (drum('taiko') * .8 + np.pad(hp(noise(.6), 3000) * env(int(.6 * SR), .002, .4), (0, int(.6 * SR))))
    if name == 'ding': t = np.arange(int(1 * SR)) / SR; return (np.sin(2 * np.pi * 1760 * t) + .4 * np.sin(2 * np.pi * 3520 * t)) * np.exp(-t * 4) * .3
    if name == 'waves': x = lp(noise(2.5), 900); return x * np.sin(np.linspace(0, np.pi, len(x))) * .5
    if name == 'clatter': return np.concatenate([np.pad(bp(noise(.05), 1500, 5000) * env(int(.05 * SR), .001, .03), (0, int((.03 + .08 * rng.random()) * SR))) for _ in range(7)]) * .8
    if name == 'stab': return bp(noise(.3), 2000, 6000) * env(int(.3 * SR), .002, .1, 3) * .7
    if name == 'bell': t = np.arange(int(3.5 * SR)) / SR; return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in ((220, .7), (440 * 1.19, 1.0), (660, 1.4))) * .25
    return np.zeros(10)
fx = np.zeros(N + SR * 4)
tlid = {l["id"]: l for l in tl["lines"]}
norm = lambda s: ''.join(c for c in s.lower() if c.isalnum() or c == "'")
for line in script["lines"]:
    L = tlid.get(line["id"])
    if not L: continue
    for word, name in line.get("sfx", []):
        w = next((w for w in L["words"] if norm(w["w"]) == norm(word)), None); at = w["s"] if w else L["start"]
        x = np.asarray(sfx(name), dtype=float)
        if x.size < 20: continue
        x = x / (np.max(np.abs(x)) + 1e-9) * .5; i = int(at * SR); fx[i:i + len(x)] += x[:len(fx) - i]
fx = fx[:N] * .55
mix = voice * 1.0 + music + fx
mix = mix / (np.max(np.abs(mix)) + 1e-9) * .89
wavfile.write(os.path.join(out, "music.wav"), SR, music.astype(np.float32)); wavfile.write(os.path.join(out, "sfx.wav"), SR, fx.astype(np.float32))
wavfile.write(os.path.join(out, "mix_raw.wav"), SR, mix.astype(np.float32))
print("mix written", round(T, 1), "s")
