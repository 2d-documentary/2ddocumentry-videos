"""Mix for an UNFILED FILMS documentary: narration + quiet noir underscore + synced documentary SFX.
Everything is synthesised here (no samples, no licences).
usage: python doc/tools/audio_doc.py documentaries/<ep> build/<ep>
needs build/<ep>/voice.wav, timeline.json, cues.json  ->  writes music.wav, sfx.wav, mix_raw.wav
Music sits at about 20% of the narration level (MUSIC_LEVEL env var, default 0.20) and ducks further under speech."""
import json, os, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, fftconvolve

SR = 24000
ep, out = sys.argv[1], sys.argv[2]
tl = json.load(open(os.path.join(out, "timeline.json")))
cues = json.load(open(os.path.join(out, "cues.json"))) if os.path.exists(os.path.join(out, "cues.json")) else []
sr, voice = wavfile.read(os.path.join(out, "voice.wav")); voice = voice.astype(np.float64); assert sr == SR
N = len(voice); T = N / SR
# censor beeps: cue {"type": "beep", "t": start, "d": seconds} mutes the narration there and plays a 1 kHz tone
BEEPS = [c for c in cues if c["type"] == "beep"]; cues = [c for c in cues if c["type"] != "beep"]
_vref0 = np.sqrt(np.mean(voice ** 2) + 1e-12)
for c in BEEPS:
    a, b = int(c["t"] * SR), min(N, int((c["t"] + c.get("d", .3)) * SR)); n = b - a; r = max(1, min(int(.006 * SR), n // 4))
    g = np.zeros(n); g[:r] = np.linspace(1, 0, r); g[-r:] = np.linspace(0, 1, r); voice[a:b] *= g
rng = np.random.default_rng(11)
MUSIC_LEVEL = float(os.environ.get("MUSIC_LEVEL", "0.20"))


def lp(x, f, o=2): b, a = butter(o, f / (SR / 2)); return lfilter(b, a, x)
def hp(x, f, o=2): b, a = butter(o, f / (SR / 2), 'high'); return lfilter(b, a, x)
def bp(x, f0, f1, o=2): b, a = butter(o, [f0 / (SR / 2), f1 / (SR / 2)], 'band'); return lfilter(b, a, x)
def noise(d): return rng.uniform(-1, 1, int(d * SR))
def t_(d): return np.arange(int(d * SR)) / SR
def expd(d, k): return np.exp(-k * t_(d))
def add(buf, x, at, g=1.0):
    i = int(at * SR)
    if i >= len(buf) or i + len(x) <= 0: return
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), len(buf) - i); buf[i:i + n] += g * x[:n]
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)

# ------------------------------------------------------------------ score
BPM = 104; beat = 60 / BPM
music = np.zeros(N)
# D minor world: drone + pulsing bass + ticking + sparse piano
roots = [38, 38, 34, 36]  # D2, D2, Bb1, C2  (midi)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
bar = 4 * beat
nbars = int(T / bar) + 2
# drone: detuned low sines + filtered noise air, slow swell
tt = np.arange(N) / SR
drone = sum(np.sin(2 * np.pi * hz(38) * (1 + d) * tt) for d in (-.003, 0, .003)) / 3
drone += .5 * np.sin(2 * np.pi * hz(45) * tt + .5) * (0.5 + .5 * np.sin(2 * np.pi * tt / 23))
drone = lp(drone, 500) * .35 + lp(rng.uniform(-1, 1, N), 900) * .03
music += drone * (0.7 + .3 * np.sin(2 * np.pi * tt / 17))
def bass_note(f, d):
    x = t_(d); s = np.sin(2 * np.pi * f * x) + .35 * np.sin(4 * np.pi * f * x) + .15 * np.sign(np.sin(2 * np.pi * f * x))
    return lp(s, 380) * np.exp(-x * 5.5) * np.minimum(1, x / .004)
def tick(g=1.):
    return hp(noise(.03), 6000) * expd(.03, 140) * .5 * g
def piano(f, d=2.4):
    x = t_(d); s = sum(np.sin(2 * np.pi * f * k * x) * np.exp(-x * (1.5 + k * .9)) / k ** 1.4 for k in range(1, 6))
    return s * np.minimum(1, x / .003)
motif = [62, 65, 69, 67, 65, 64]  # D F A G F E
for b in range(nbars):
    t0 = b * bar; r = hz(roots[b % 4])
    for k in range(8):  # 8th-note pulse
        acc = 1.0 if k % 2 == 0 else .6
        add(music, bass_note(r, beat / 2 * .95), t0 + k * beat / 2, .55 * acc)
    for k in range(16):
        add(music, tick(.9 if k % 4 == 0 else .45), t0 + k * beat / 4)
    if b % 2 == 1:
        n = motif[(b // 2) % len(motif)]
        add(music, piano(hz(n)), t0 + beat * 1.5, .22)
        add(music, piano(hz(n - 12)), t0 + beat * 1.5, .1)
# short reverb tail for the score
ir_t = t_(1.6); ir = rng.normal(0, 1, len(ir_t)) * np.exp(-ir_t * 3.2); ir = lp(ir, 3500); ir /= np.sqrt(np.sum(ir ** 2))
music = music + .25 * fftconvolve(music, ir)[:N]
# presence dip so the score never fights the voice
music = music - .5 * bp(music, 1200, 4000)
# intro/outro fades
fade = np.minimum(1, tt / 2.5) * np.minimum(1, (T - tt) / 2.0)
music *= np.clip(fade, 0, 1)

# ducking from the voice envelope
env = np.abs(voice); win = int(.12 * SR); env = np.convolve(env, np.ones(win) / win, mode='same')
env = env / (env.max() + 1e-9)
duck = 1 - .45 * np.clip(env * 4, 0, 1)
duck = np.convolve(duck, np.ones(int(.25 * SR)) / int(.25 * SR), mode='same')
music *= duck
VREF = rms(voice) if rms(voice) > 1e-4 else 0.06   # silent (text-only) episodes: music carries the track
music *= MUSIC_LEVEL * VREF / rms(music)

# ------------------------------------------------------------------ SFX
sfx = np.zeros(N)
def key():
    x = bp(noise(.05), 1800, 7000) * expd(.05, 90) + .6 * np.sin(2 * np.pi * 180 * t_(.05)) * expd(.05, 70)
    return x * (.8 + .4 * rng.random())
def ding():
    x = t_(1.2); return (np.sin(2 * np.pi * 2093 * x) + .4 * np.sin(2 * np.pi * 4186 * x)) * np.exp(-x * 4) * .5
def paper():
    d = .45; x = bp(noise(d), 600, 5000); e = np.sin(np.pi * np.clip(t_(d) / d, 0, 1)) ** 1.5
    return x * e * (0.6 + .4 * np.sin(2 * np.pi * 23 * t_(d)))
def whoosh(d=.55):
    x = noise(d); n = len(x); out = np.zeros(n); seg = int(.02 * SR)
    for i in range(0, n, seg):
        f = 300 + 3500 * np.sin(np.pi * i / n) ** 2; out[i:i + seg] = bp(x[i:i + seg + 200], f * .7, min(f * 1.4, SR / 2 - 100))[:len(out[i:i + seg])]
    return out * np.sin(np.pi * np.clip(t_(d) / d, 0, 1)) ** 2 * 1.4
def impact():
    d = 1.6; x = t_(d)
    sub = np.sin(2 * np.pi * (48 + 50 * np.exp(-x * 9)) * x) * np.exp(-x * 2.6)
    return 1.3 * sub + .35 * lp(noise(d), 1200) * np.exp(-x * 7)
def shutter():
    a = bp(noise(.03), 1500, 8000) * expd(.03, 120)
    b = np.zeros(int(.12 * SR)); b[:len(a)] += a; b[int(.07 * SR):int(.07 * SR) + len(a)] += .8 * a; return b
def scribble(d=.7):
    x = bp(noise(d), 2500, 7000) * (0.5 + .5 * np.abs(np.sin(2 * np.pi * 9 * t_(d))))
    return x * np.minimum(1, t_(d) / .05) * np.minimum(1, (d - t_(d)) / .08) * .5
def thud():
    d = .5; x = t_(d); return (np.sin(2 * np.pi * (90 + 60 * np.exp(-x * 30)) * x) * np.exp(-x * 12) + .3 * lp(noise(d), 800) * np.exp(-x * 25)) * 1.2
def riser(d=1.5):
    x = t_(d); f = 200 + 1800 * (x / d) ** 2
    return (bp(noise(d), 400, 6000) * (x / d) ** 2 * .7 + .25 * np.sin(2 * np.pi * np.cumsum(f) / SR) * (x / d) ** 3)
def hit(): return impact() * .8 + np.concatenate([whoosh(.25)[::-1] * .4, np.zeros(int(1.35 * SR))])
def tickclock():
    return bp(noise(.02), 2500, 6000) * expd(.02, 200) + .3 * np.sin(2 * np.pi * 1200 * t_(.02)) * expd(.02, 150)
def cash():
    x = np.zeros(int(.6 * SR))
    for k in range(5): add(x, bp(noise(.06), 2000, 8000) * expd(.06, 60), k * .07, .7)
    return x
SFX = {"key": key, "ding": ding, "paper": paper, "whoosh": whoosh, "impact": impact, "shutter": shutter, "scribble": scribble,
       "thud": thud, "riser": riser, "hit": hit, "tick": tickclock, "cash": cash, "stamp": thud}
LEVEL = {"key": .10, "ding": .12, "paper": .22, "whoosh": .22, "impact": .45, "shutter": .25, "scribble": .14, "thud": .3,
         "riser": .18, "hit": .4, "tick": .12, "cash": .18, "stamp": .35}
missing = set()
for c in cues:
    f = SFX.get(c["type"])
    if not f: missing.add(c["type"]); continue
    add(sfx, f(), c["t"], LEVEL[c["type"]] * c.get("gain", 1))
if missing: print("unknown sfx types:", missing)
sfx *= .55 * VREF / max(rms(sfx), 1e-9) if rms(sfx) > VREF * .55 else 1.0

beep = np.zeros(N)
for c in BEEPS:
    a, b = int(c["t"] * SR), min(N, int((c["t"] + c.get("d", .3)) * SR)); n = b - a; tt = np.arange(n) / SR
    env = np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (.006 * SR)); beep[a:b] += np.sin(2 * np.pi * 1000 * tt) * env * _vref0 * 1.5
mix = voice + music + sfx + beep
peak = np.max(np.abs(mix)); mix = mix / peak * .89 if peak > .89 else mix
for name, x in (("music", music), ("sfx", sfx), ("mix_raw", mix)):
    wavfile.write(os.path.join(out, name + ".wav"), SR, x.astype(np.float32))
print(f"mix {T:.1f}s  voice rms {rms(voice):.4f}  music rms {rms(music):.4f} ({rms(music)/rms(voice):.0%})  sfx cues {len(cues)}")
