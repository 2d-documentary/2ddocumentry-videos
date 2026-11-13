"""Transcribe narration recordings with word timestamps (faster-whisper).
usage: python tools/transcribe.py documentaries/<p>/voice OUTDIR
Reads voice/transcribe.json: {"files": ["a.m4a", ...], "language": "hi", "model": "large-v3-turbo", "prompt": "..."}"""
import json, sys, os
from faster_whisper import WhisperModel
vd, out = sys.argv[1], sys.argv[2]
cfg = json.load(open(os.path.join(vd, 'transcribe.json')))
m = WhisperModel(cfg.get('model', 'large-v3-turbo'), device='cpu', compute_type='int8', cpu_threads=os.cpu_count())
from faster_whisper import decode_audio
from types import SimpleNamespace
def run(f):
    ch = cfg.get('chunks', {}).get(f)
    if not ch:
        segs, info = m.transcribe(os.path.join(vd, f), language=cfg.get('language'), word_timestamps=True, vad_filter=False,
                                  beam_size=5, initial_prompt=cfg.get('prompt'), condition_on_previous_text=False)
        return list(segs), info.duration, info.language
    audio = decode_audio(os.path.join(vd, f), sampling_rate=16000); out = []
    for k, (a, b) in enumerate(ch):
        segs, info = m.transcribe(audio[int(a * 16000):int(b * 16000)], language=cfg.get('language'), word_timestamps=True, vad_filter=False,
                                  beam_size=5, initial_prompt=cfg.get('prompt'), condition_on_previous_text=False)
        for s in segs:
            out.append(SimpleNamespace(start=s.start + a, end=s.end + a, text=s.text,
                                       words=[SimpleNamespace(word=w.word, start=w.start + a, end=w.end + a, probability=w.probability) for w in (s.words or [])]))
    return out, len(audio) / 16000, cfg.get('language')
for f in cfg['files']:
    segs, dur, lang = run(f)
    class info: duration = dur; language = lang
    S = []
    for s in segs:
        S.append({'s': s.start, 'e': s.end, 'text': s.text, 'words': [{'w': w.word, 's': w.start, 'e': w.end, 'p': w.probability} for w in (s.words or [])]})
        print(f'{s.start:8.2f} {s.end:8.2f} {s.text}', flush=True)
    json.dump({'file': f, 'duration': info.duration, 'language': info.language, 'segments': S}, open(os.path.join(out, f + '.json'), 'w'), ensure_ascii=False, indent=1)
    open(os.path.join(out, f + '.txt'), 'w').write('\n'.join(f"{s['s']:.2f}\t{s['e']:.2f}\t{s['text']}" for s in S))
