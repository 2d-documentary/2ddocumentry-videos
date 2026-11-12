"""Free TTS with Kokoro-82M (Apache-2.0). One file per line + timing.json.
usage: python tools/tts_kokoro.py rome/script.json rome/audio"""
import json, os, sys, numpy as np, soundfile as sf
from kokoro import KPipeline
src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
cfg = json.load(open(src)); V = cfg['voices']; speed = cfg.get('speed', {})
pipes = {}
def pipe(voice):
    lang = 'b' if voice.startswith('b') else 'a'
    if lang not in pipes: pipes[lang] = KPipeline(lang_code=lang, repo_id='hexgrad/Kokoro-82M')
    return pipes[lang]
timing = []
for s in cfg['scenes']:
    for i, ln in enumerate(s['lines']):
        voice = V[ln['who']]; parts = []
        for r in pipe(voice)(ln['text'], voice=voice, speed=speed.get(ln['who'], 1.0)):
            a = r.audio if hasattr(r, 'audio') else r[2]
            parts.append(np.asarray(a, np.float32))
        a = np.concatenate(parts)
        # trim leading/trailing silence
        nz = np.where(np.abs(a) > 0.01)[0]
        if len(nz): a = a[max(0, nz[0] - 600): nz[-1] + 1200]
        name = f"s{s['scene']:02d}_{i:02d}_{ln['who'].lower()}"
        sf.write(f'{out}/{name}.wav', a, 24000)
        timing.append({'scene': s['scene'], 'i': i, 'who': ln['who'], 'file': name, 'dur': round(len(a) / 24000, 3), 'text': ln['text']})
        print(name, timing[-1]['dur'], flush=True)
json.dump(timing, open(f'{out}/timing.json', 'w'), indent=1, ensure_ascii=False)
print('total', round(sum(t['dur'] for t in timing) / 60, 2), 'min')
