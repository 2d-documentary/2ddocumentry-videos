"""Final soundtrack: Kokoro narration and voices on top, a quiet procedural orchestral score that ducks under
speech, light ambience per location and a few sound effects. Writes rome/final_mix.m4a (and .wav).
Run: python3 tools/mix.py"""
import json, os, subprocess, math
import numpy as np
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
mix = json.load(open(f'{ROOT}/rome/mix.json'))
tl = json.load(open(f'{ROOT}/film/timeline.json'))
TOTAL = tl['total']; N = int(TOTAL * SR) + SR
rng = np.random.default_rng(7)

def load(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def db(x): return 10 ** (x / 20)
def put(buf, t, sig, gain=1.0):
    i = int(t * SR)
    if i >= len(buf): return
    n = min(len(sig), len(buf) - i); buf[i:i + n] += sig[:n] * gain

# ------------------------------------------------------------------ speech
speech = np.zeros(N, np.float32)
for ln in mix['lines']:
    put(speech, ln['t'], load(f"{ROOT}/rome/audio/{ln['file']}" + ("" if ln["file"].endswith(".mp3") else ".mp3")))
active = np.abs(speech) > 1e-4
rms = np.sqrt(np.mean(speech[active] ** 2)); speech *= db(-19) / rms     # speech at about -19 dBFS RMS
# speech envelope for ducking (attack 40 ms, release 450 ms)
env = np.abs(speech); k = SR // 100; env = np.maximum.reduceat(env, np.arange(0, N, k)); env = (env > db(-45)).astype(np.float32)
sm = np.zeros_like(env); a, r = 1 - math.exp(-1 / 4), 1 - math.exp(-1 / 45)
for i in range(1, len(env)): sm[i] = sm[i - 1] + (a if env[i] > sm[i - 1] else r) * (env[i] - sm[i - 1])
duck = np.repeat(sm, k)[:N]

# ------------------------------------------------------------------ score
NOTE = {'C': 0, 'C#': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
def hz(midi): return 440 * 2 ** ((midi - 69) / 12)
def strings(f, dur, att=0.6, rel=0.9, bright=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for det in (-0.12, 0.0, 0.11):
        ff = f * 2 ** (det / 12); vib = 1 + 0.003 * np.sin(2 * np.pi * 5.2 * t + det * 30)
        ph = 2 * np.pi * ff * np.cumsum(vib) / SR
        for h in range(1, 9): y += np.sin(h * ph) / h * (0.7 ** (h - 1)) * bright ** (h - 1)
    e = np.minimum(1, t / att) * np.minimum(1, (dur - t) / rel).clip(0, 1)
    return (y * e / 3).astype(np.float32)
def pluck(f, dur=0.6):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for h in range(1, 7): y += np.sin(2 * np.pi * f * h * t) * np.exp(-t * (6 + h * 4)) / h
    return (y * np.minimum(1, t / 0.004)).astype(np.float32)
def drum(f=55, dur=0.8, noise=0.25):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(f * (1 + 1.5 * np.exp(-t * 30))) / SR
    y = np.sin(ph) * np.exp(-t * 5) + noise * lp(rng.standard_normal(n), 900) * np.exp(-t * 18)
    return y.astype(np.float32)

PROG = {'maj': [0, 7, 9, 5], 'min': [0, 8, 3, 10], 'tense': [0, 5, 0, 7], 'sad': [0, 8, 5, 7]}
QUAL = {'maj': {0: 'M', 7: 'M', 9: 'm', 5: 'M'}, 'min': {0: 'm', 8: 'M', 3: 'M', 10: 'M'}, 'tense': {0: 'm', 5: 'm', 7: 'M'}, 'sad': {0: 'm', 8: 'M', 5: 'm', 7: 'M'}}
SC = {1: ('D', 'maj', 92, 'pizz'), 2: ('G', 'maj', 100, 'pizz'), 3: ('D', 'min', 100, 'march'), 4: ('D', 'min', 96, 'war'), 5: ('A', 'min', 96, 'march'), 6: ('C', 'tense', 70, 'pad'),
      7: ('F', 'maj', 88, 'pizz'), 8: ('D', 'maj', 84, 'pad'), 9: ('E', 'min', 112, 'pizz'), 10: ('B', 'tense', 96, 'war'), 11: ('G', 'min', 90, 'pad'), 12: ('D', 'sad', 66, 'pad'),
      13: ('F', 'maj', 76, 'pad'), 14: ('D', 'maj', 80, 'swell')}
scenes = {}
for s in tl['shots']: a, b = scenes.get(s['scene'], (1e9, 0)); scenes[s['scene']] = (min(a, s['start']), max(b, s['start'] + s['dur']))
music = np.zeros((2, N), np.float32)
for sc, (t0, t1) in scenes.items():
    key, mode, bpm, style = SC[sc]; root = 50 + NOTE[key] - (12 if NOTE[key] > 7 else 0); beat = 60 / bpm; bar = beat * 4
    t0 = max(0, t0 - 0.6); t1 = min(TOTAL, t1 + 1.2); seg = np.zeros((2, int((t1 - t0) * SR) + SR), np.float32)
    nb = int((t1 - t0) / (bar * 2)) + 1
    for c in range(nb):
        deg = PROG[mode][c % 4]; q = QUAL[mode][deg]; r0 = root + deg; tones = [r0, r0 + (4 if q == 'M' else 3), r0 + 7]
        ct = c * bar * 2; dur = bar * 2 + 0.8
        for j, m in enumerate(tones):
            pad = strings(hz(m + 12), dur, att=0.9 if style != 'war' else 0.3, bright=0.9); pan = 0.5 + (j - 1) * 0.25
            put(seg[0], ct, pad, 0.2 * (1 - pan) * 2); put(seg[1], ct, pad, 0.2 * pan * 2)
        bass = strings(hz(r0 - 12), dur, att=0.4, bright=0.7); put(seg[0], ct, bass, 0.22); put(seg[1], ct, bass, 0.22)
        if style in ('pizz',):
            arp = [tones[0], tones[1], tones[2], tones[1] + 12, tones[2], tones[1]] * 3
            for i in range(16):
                if (i % 8) in (3, 7) and sc == 9: continue
                p = pluck(hz(arp[i % len(arp)] + 12)); pn = 0.3 + 0.4 * ((i * 3) % 5) / 4
                put(seg[0], ct + i * beat / 2, p, 0.11 * (1 - pn) * 2); put(seg[1], ct + i * beat / 2, p, 0.11 * pn * 2)
        if style in ('march', 'war'):
            for i in range(8):
                d = drum(55 if i % 4 == 0 else 70, noise=0.3 if style == 'war' else 0.15); g = (0.28 if i % 4 == 0 else 0.14) * (1.0 if style == 'war' else 0.7)
                put(seg[0], ct + i * beat, d, g); put(seg[1], ct + i * beat, d, g)
                if style == 'march': sn = hp(rng.standard_normal(int(0.12 * SR)), 1800) * np.exp(-np.arange(int(0.12 * SR)) / SR * 40); put(seg[0], ct + i * beat + beat / 2, sn.astype(np.float32), 0.03); put(seg[1], ct + i * beat + beat / 2, sn.astype(np.float32), 0.03)
    for ch in range(2): seg[ch] = lp(seg[ch], 5000)
    fade = np.ones(seg.shape[1]); f = int(1.2 * SR); fade[:f] = np.linspace(0, 1, f); fade[-f:] = np.linspace(1, 0, f)
    if sc == 14: fade *= np.linspace(0.8, 1.25, len(fade))
    i0 = int(t0 * SR); n = min(seg.shape[1], N - i0); music[:, i0:i0 + n] += seg[:, :n] * fade[:n]
mus_rms = np.sqrt(np.mean(music ** 2)); music *= db(-19) / mus_rms        # normalise, then sit far under the voice
music *= (db(-17) * (1 - duck) + db(-25) * duck)                       # gaps: -17 dB under voice level, under speech: -25 dB

# ------------------------------------------------------------------ ambience and effects
amb = np.zeros((2, N), np.float32)
def noise(sec): return rng.standard_normal(int(sec * SR)).astype(np.float32)
def bed(kind, sec):
    n = int(sec * SR); t = np.arange(n) / SR; out = np.zeros((2, n), np.float32)
    for ch in range(2):
        w = noise(sec)
        if kind == 'crowd':
            y = bp(w, 250, 1800) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * t + ch))
            for _ in range(int(sec * 3)):   # distant voices: short formant blips
                st = rng.uniform(0, sec - 0.5); L = rng.uniform(0.15, 0.4); m = int(L * SR); tt = np.arange(m) / SR
                f0 = rng.uniform(110, 240); v = np.sin(2 * np.pi * f0 * tt + 3 * np.sin(2 * np.pi * 4 * tt)) * np.sin(np.pi * tt / L) ** 2
                y[int(st * SR):int(st * SR) + m] += bp(v, 300, 2500) * 0.6
            out[ch] = y * 0.5
        elif kind == 'wind': out[ch] = lp(w, 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t + ch * 2)) * 1.6
        elif kind == 'storm': out[ch] = lp(w, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t + ch * 2)) * 2.2
        elif kind == 'waves':
            sw = 0.5 + 0.5 * np.sin(2 * np.pi * t / 6.5 + ch) ** 2; out[ch] = lp(w, 1200) * sw * 1.4
        elif kind == 'stream': out[ch] = bp(w, 600, 4000) * (0.8 + 0.2 * np.sin(2 * np.pi * 1.3 * t + ch)) * 0.8
        elif kind == 'room': out[ch] = lp(w, 300) * 0.5
        elif kind == 'fire':
            y = lp(w, 700) * 0.8
            for _ in range(int(sec * 14)): st = int(rng.uniform(0, sec - 0.02) * SR); y[st:st + 200] += hp(noise(200 / SR), 2000) * rng.uniform(0.5, 2)
            out[ch] = y
    if kind in ('wind', 'crowd') and kind == 'wind':
        for _ in range(int(sec / 3)):          # birds
            st = rng.uniform(0, sec - 0.3); m = int(0.12 * SR); tt = np.arange(m) / SR; f = rng.uniform(2500, 4200)
            c = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.25 * np.sin(2 * np.pi * 18 * tt))) / SR) * np.sin(np.pi * tt / 0.12) ** 2
            ch = rng.integers(0, 2); out[ch, int(st * SR):int(st * SR) + m] += c * 0.35
    return out
AMB = {'forum': ('crowd', -31), 'imperialRome': ('crowd', -30), 'tiber': ('wind', -33), 'countryside': ('wind', -32), 'gaul': ('wind', -32), 'alps': ('storm', -28), 'carthage': ('waves', -30),
       'shipyard': ('waves', -31), 'constantinople': ('waves', -31), 'rubicon': ('stream', -31), 'senate': ('room', -38), 'palace': ('room', -38), 'ravenna': ('room', -38)}
for s in tl['shots']:
    name = s['place'].split(':')[0]; era = s['place'].split(':')[1] if ':' in s['place'] else ''
    kind, lvl = AMB.get(name, (None, 0))
    if name == 'forum' and era == 'ruins': kind, lvl = 'wind', -34
    if s['fx'].get('smoke'): kind, lvl = 'fire', -28
    if not kind: continue
    b = bed(kind, s['dur'] + 0.6); f = int(0.3 * SR); fade = np.ones(b.shape[1]); fade[:f] = np.linspace(0, 1, f); fade[-f:] = np.linspace(1, 0, f)
    i0 = int(max(0, s['start'] - 0.3) * SR); n = min(b.shape[1], N - i0)
    b = b / (np.sqrt(np.mean(b ** 2)) + 1e-9) * db(lvl); amb[:, i0:i0 + n] += b[:, :n] * fade[:n]
    # marching legion: boots in step
    if s['id'] == 's03_05':
        for i in range(int(s['dur'] * 2)):
            d = drum(70, 0.25, noise=0.8) * 0.5; jit = rng.uniform(-0.02, 0.02); put(amb[0], s['start'] + i * 0.5 + jit, d, db(-30)); put(amb[1], s['start'] + i * 0.5 - jit, d, db(-30))
amb *= (1 - 0.45 * duck)
sfx = np.zeros((2, N), np.float32)
def whoosh(sec=1.2):
    n = int(sec * SR); t = np.arange(n) / SR; w = noise(sec); out = np.zeros(n)
    for i in range(0, n, 2400):   # sweeping band
        f = 300 + 2400 * (i / n); seg = bp(w[i:i + 2400], f, f * 1.8) if i + 2400 <= n else w[i:] * 0; out[i:i + len(seg)] = seg
    return (out * np.sin(np.pi * t / sec) ** 2).astype(np.float32)
for s in tl['shots']:
    if s['title'] and not s['fx'].get('endcard'):
        w = whoosh(); b = drum(42, 2.2, noise=0.1)
        for ch in range(2): put(sfx[ch], s['start'] + 0.0, w, db(-27)); put(sfx[ch], s['start'] + 0.45, b, db(-22))
    if s['place'].startswith('map:'):
        w = whoosh(0.9)
        for ch in range(2): put(sfx[ch], s['start'] + 0.05, w, db(-30))
    if s['fx'].get('endcard'):
        b = drum(40, 3.5, noise=0.05)
        for ch in range(2): put(sfx[ch], s['start'] + s['dur'] * 0.4, b, db(-20))

# ------------------------------------------------------------------ master
out = music + amb + sfx + speech[None, :]
out = hp(out, 30)
# look-ahead peak limiter (ceiling -1 dBFS): voice stays at its level, only the rare peaks are tamed
from scipy.ndimage import maximum_filter1d, uniform_filter1d
pk = maximum_filter1d(np.max(np.abs(out), axis=0), size=int(0.012 * SR))
g = np.minimum(1.0, db(-1) / np.maximum(pk, 1e-9)); g = np.minimum(g, uniform_filter1d(g, size=int(0.01 * SR)))
g = uniform_filter1d(g, size=int(0.004 * SR)); out *= g[None, :]
peak = np.max(np.abs(out)); out *= min(1.0, db(-0.5) / peak)
ln = int(TOTAL * SR); out = out[:, :ln]
print('speech rms dB', 20 * np.log10(np.sqrt(np.mean(speech[active] ** 2)) + 1e-9), 'music rms dB', 20 * np.log10(np.sqrt(np.mean(music ** 2)) + 1e-9), 'peak', peak)
wav = f'{ROOT}/rome/final_mix.wav'
import wave
with wave.open(wav, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(out.T, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-c:a', 'aac', '-b:a', '192k', f'{ROOT}/rome/final_mix.m4a'], check=True)
print('wrote rome/final_mix.m4a', round(TOTAL / 60, 2), 'min')
