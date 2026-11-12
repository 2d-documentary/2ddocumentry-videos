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
# ---- score: warm, cinematic and soft. Chord progressions, detuned pads, harp/flute/bell leads, gentle frame drums,
#      a presence dip (1.2-4 kHz) so the music never fights the narration, and a small hall reverb. No raw saws, no hiss.
from scipy.signal import fftconvolve
def sinp(f, n, ph=0.): return np.sin(2 * np.pi * f * np.arange(n) / SR + ph)
def tri(f, n): x = (f * np.arange(n) / SR) % 1; return 4 * np.abs(x - .5) - 1
def adsr(n, a=.01, r=.3):
    e = np.ones(n); ia = max(1, min(n, int(a * SR))); ir = max(1, min(n - ia, int(r * SR)))
    e[:ia] = np.linspace(0, 1, ia) ** 1.5
    if ir > 0: e[n - ir:] *= np.linspace(1, 0, ir) ** 1.5
    return e
def harp(f, dur, pizz=False):
    n = int(dur * SR); t = np.arange(n) / SR; k_ = 6 if not pizz else 4
    x = sum(np.sin(2 * np.pi * k * f * t) * np.exp(-t * ((5 if pizz else 2.2) + k * 1.3)) / k ** 1.6 for k in range(1, k_ + 1))
    return x * np.minimum(1, t / .003)
def bell(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 1.6) + .35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3.5) + .12 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 6)) * np.minimum(1, t / .002)
def flute(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR; vib = 1 + .004 * np.sin(2 * np.pi * 5 * t) * np.minimum(1, t / .4)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    return (np.sin(ph) + .22 * np.sin(2 * ph) + .06 * np.sin(3 * ph)) * adsr(n, .09, min(.35, dur * .4)) + lp(rng.uniform(-1, 1, n), 2500) * adsr(n, .03, .1) * .015
def horn(f, dur):
    n = int(dur * SR); x = sum(tri(f * (1 + d), n) for d in (-.003, 0, .003)) / 3
    return lp(x, 900) * adsr(n, .18, min(.5, dur * .5))
def pad_tone(f, n): return lp(sum(tri(f * (1 + d), n) for d in (-.005, -.0015, .002, .0055)) / 4, 1400)
def doum(g=1.):
    n = int(.5 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * np.cumsum(62 + 45 * np.exp(-t * 25)) / SR) * np.exp(-t * 6.5) + .08 * lp(rng.uniform(-1, 1, n), 300) * np.exp(-t * 25)) * g
def tek(g=1.):
    n = int(.09 * SR); t = np.arange(n) / SR
    return (bp(rng.uniform(-1, 1, n), 700, 3200) * np.exp(-t * 55) * .35 + .25 * np.sin(2 * np.pi * 410 * t) * np.exp(-t * 60)) * g
def taiko():
    n = int(1.3 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(48 + 30 * np.exp(-t * 12)) / SR) * np.exp(-t * 3.2) * 1.3 + .12 * lp(rng.uniform(-1, 1, n), 200) * np.exp(-t * 10)
_irn = int(2.4 * SR); _t = np.arange(_irn) / SR
IR = lp(rng.uniform(-1, 1, _irn), 4500) * np.exp(-_t * 2.6); IR[:int(.012 * SR)] = 0; IR /= np.sqrt(np.sum(IR ** 2))

PROG = {'minor': [(0, 'm'), (-4, 'M'), (-2, 'M'), (0, 'm')], 'hijaz': [(0, 'm'), (5, 'm'), (-4, 'M'), (-5, 'M')],
        'phryg': [(0, 'M'), (1, 'M'), (0, 'M'), (-2, 'm')], 'dark': [(0, 'm'), (1, 'M'), (0, 'm'), (-4, 'M')], 'major': [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')]}
MOODS = {   # bpm, percussion level 0-3, lead, key (Hz), progression, cue gain
  'bright': (100, 2, 'harp', 146.83, 'hijaz', 1.), 'flow': (88, 1, 'harp', 146.83, 'minor', .9), 'regal': (84, 3, 'horn', 130.81, 'phryg', 1.),
  'grand': (96, 2, 'harp', 146.83, 'phryg', 1.), 'drone': (64, 0, None, 110.0, 'dark', .8), 'gallop': (116, 3, 'harp', 146.83, 'hijaz', 1.),
  'elegant': (90, 1, 'flute', 164.81, 'minor', .9), 'shimmer': (90, 1, 'bell', 174.61, 'minor', .9), 'musicbox': (78, 0, 'bell', 196.0, 'minor', .85),
  'creepy': (86, 1, 'pizz', 110.0, 'dark', .9), 'war': (108, 3, 'horn', 123.47, 'dark', 1.), 'ominous': (70, 1, 'horn', 98.0, 'dark', .85),
  'lyre': (98, 2, 'harp', 164.81, 'major', .95), 'sultry': (82, 1, 'flute', 146.83, 'hijaz', .9), 'theme': (100, 2, 'harp', 146.83, 'hijaz', 1.)}
SCENE_MOOD = {'S01': 'bright', 'S02': 'flow', 'S03': 'regal', 'S04': 'grand', 'S05': 'drone', 'S06': 'gallop', 'S07': 'elegant', 'S08': 'shimmer',
              'S09': 'musicbox', 'S10': 'creepy', 'S11': 'war', 'S12': 'ominous', 'S13': 'lyre', 'S14': 'sultry', 'S15': 'theme'}
SCALE = {'m': [0, 2, 3, 5, 7, 8, 10], 'M': [0, 2, 4, 5, 7, 9, 11]}

def scene_music(mood, dur, seed):
    bpm, perc, lead, key, prog, gain = MOODS[mood]; r = np.random.default_rng(seed)
    n = int(dur * SR); o = np.zeros(n + SR * 3); beat = 60 / bpm; e8 = beat / 2; bar = 4 * beat; seg = 2 * bar
    def add(x, at=0., g=1.):
        i = int(at * SR); j = min(len(o), i + len(x))
        if 0 <= i < len(o) and j > i: o[i:j] += x[:j - i] * g
    chords = PROG[prog]; nseg = int(dur / seg) + 1
    for si in range(nseg):
        root, q = chords[si % 4]; t0 = si * seg; L = seg + .7; m = int(L * SR)
        third = 3 if q == 'm' else 4; fr = key * 2 ** (root / 12)
        tones = [fr, fr * 2 ** (third / 12), fr * 2 ** (7 / 12), fr * 2]
        add(sum(pad_tone(f, m) for f in tones) * adsr(m, .7, .7) * .1, t0)                      # pad
        if perc or mood in ('drone', 'ominous'):                                                     # soft bass
            for b in range(8 if perc >= 2 else 4):
                st = t0 + b * (beat if perc >= 2 else 2 * beat); bl = beat * (.9 if perc >= 2 else 1.8); k = int(bl * SR)
                add((sinp(fr / 2, k) + .25 * sinp(fr, k)) * adsr(k, .02, bl * .6) * .22, st)
        # lead
        sc = [fr * 2 ** (s / 12) for s in SCALE[q]]
        if lead in ('harp', 'pizz'):
            pat = [0, 2, 1, 2, 3, 2, 1, 2]
            for b in range(16):
                if r.random() < (.18 if perc >= 2 else .35): continue
                f = tones[pat[b % 8]] * 2; add(harp(f, 1.6, lead == 'pizz'), t0 + b * e8, .16 if lead == 'harp' else .2)
        elif lead == 'bell':
            for b in range(8):
                if r.random() < .3: continue
                f = tones[[0, 2, 3, 1][b % 4]] * 4; add(bell(f, 2.2), t0 + b * beat, .07)
        elif lead in ('flute', 'horn') and si % 4 != 3:
            deg = int(r.integers(2, 5)); at = t0
            for k in range(int(r.integers(3, 6))):
                L2 = beat * float(r.choice([1, 1.5, 2, 3])); deg = int(np.clip(deg + r.choice([-2, -1, -1, 1, 1, 2]), 0, 9))
                f = sc[deg % 7] * 2 ** (deg // 7) * (2 if lead == 'flute' else 1)
                add(flute(f, L2 * .95) if lead == 'flute' else horn(f, L2 * .95), at, .1 if lead == 'flute' else .14); at += L2
                if at > t0 + seg - beat: break
    if perc:                                                                                        # frame drums (maqsum-ish)
        pats = {1: [('d', 0), ('t', 4)], 2: [('d', 0), ('t', 1), ('t', 3), ('d', 4), ('t', 6)], 3: [('d', 0), ('t', 1), ('t', 3), ('d', 4), ('t', 6)]}
        for b in range(int(dur / bar) + 1):
            for k, s in pats[perc]: add(doum(.5) if k == 'd' else tek(.5), b * bar + s * e8)
            if perc == 3 and b % 2 == 0: add(taiko(), b * bar, .35)
    if mood in ('drone', 'ominous'): add(lp(rng.uniform(-1, 1, n), 400) * (.5 + .5 * np.sin(2 * np.pi * np.arange(n) / SR / 6)) * .025)   # soft wind
    o = o[:n]
    o = hp(o, 40) ; o = o - .35 * bp(o, 1200, 4000); o = lp(o, 8000)                             # clean low end, presence dip, no fizz
    wet = fftconvolve(o, IR)[:n]; o = o + .28 * wet * (np.sqrt(np.mean(o ** 2)) / (np.sqrt(np.mean(wet ** 2)) + 1e-9))
    o = o / (np.sqrt(np.mean(o ** 2)) + 1e-9) * gain                                                # equal loudness per cue
    fade = int(1.2 * SR); o[:fade] *= np.linspace(0, 1, fade); o[-fade:] *= np.linspace(1, 0, fade)
    return np.tanh(o * .5) / .5

# ---- music track: one cue per scene, crossfaded
music = np.zeros(N + SR * 3)
first = {}
for l in tl["lines"]:
    sc = next(s for s in script["lines"] if s["id"] == l["id"])["scene"]; first.setdefault(sc, l["start"])
order = sorted(first.items(), key=lambda kv: kv[1])
for i, (sc, st) in enumerate(order):
    s0 = max(0, st - 1.2); s1 = order[i + 1][1] + 1.2 if i + 1 < len(order) else T
    m = scene_music(SCENE_MOOD.get(sc, 'theme'), s1 - s0, i + 3); a = int(s0 * SR); music[a:a + len(m)] += m[:len(music) - a]
music = music[:N]
# level: music sits 7 dB under the narration (measured where someone is speaking), with only a gentle 1 dB ride.
ve = np.convolve(np.abs(voice), np.ones(int(.06 * SR)) / int(.06 * SR), 'same'); ve = np.convolve(ve, np.ones(int(.3 * SR)) / int(.3 * SR), 'same'); ve = np.clip(ve / (np.percentile(ve, 95) + 1e-9), 0, 1)
speech = ve > .25
music *= (1 - .11 * ve)
v_rms = np.sqrt(np.mean(voice[speech] ** 2)); m_rms = np.sqrt(np.mean(music[speech] ** 2)) + 1e-9
MUSIC_DB = float(os.environ.get("MUSIC_DB", "-7"))
music *= v_rms * 10 ** (MUSIC_DB / 20) / m_rms
print("music level vs voice (dB):", round(20 * np.log10(np.sqrt(np.mean(music[speech] ** 2)) / v_rms), 1))

def drum(kind):
    if kind == 'doum': return doum(1.)
    if kind == 'tek': return tek(1.)
    if kind == 'taiko': return taiko()
    return tek(.4)
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
fx = lp(fx[:N], 9000)
fx *= v_rms * 10 ** (-9 / 20) / (np.sqrt(np.mean(fx[np.abs(fx) > 1e-4] ** 2)) + 1e-9)   # effects ~9 dB under the voice, no harsh top end
mix = voice * 1.0 + music + fx
mix = mix / (np.max(np.abs(mix)) + 1e-9) * .89
wavfile.write(os.path.join(out, "music.wav"), SR, music.astype(np.float32)); wavfile.write(os.path.join(out, "sfx.wav"), SR, fx.astype(np.float32))
wavfile.write(os.path.join(out, "mix_raw.wav"), SR, mix.astype(np.float32))
print("mix written", round(T, 1), "s")
