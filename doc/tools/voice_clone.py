"""Voice-clone TTS test with Chatterbox Multilingual (MIT, zero-shot, Hindi).

Usage: python doc/tools/voice_clone.py voices/<name>/test.json <out_dir>

test.json:
{"lang": "hi", "seed": 7, "gap": 0.28,
 "variants": [{"name": "A_normal", "ref": "voices/chintu/ref_a.wav", "field": "say",
               "exaggeration": 0.5, "cfg_weight": 0.5}],
 "lines": [{"text": "Roman Hinglish", "say": "देवनागरी हिंग्लिश"}]}
Writes <out_dir>/<variant>.wav and timing.json (seconds of audio vs seconds of compute).
"""
import json, os, sys, time
import numpy as np
import torch
import soundfile as sf
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

cfg = json.load(open(sys.argv[1]))
out = sys.argv[2]
os.makedirs(out, exist_ok=True)
torch.set_num_threads(os.cpu_count() or 4)

t0 = time.time()
model = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
SR = model.sr
timing = {"load_s": round(time.time() - t0, 1), "threads": torch.get_num_threads(), "variants": {}}

for v in cfg["variants"]:
    torch.manual_seed(cfg.get("seed", 7))
    pieces, t1 = [], time.time()
    gap = np.zeros(int(SR * cfg.get("gap", 0.28)), dtype=np.float32)
    for line in cfg["lines"]:
        txt = line[v.get("field", "say")]
        wav = model.generate(txt, language_id=cfg.get("lang", "hi"), audio_prompt_path=v["ref"],
                             exaggeration=v.get("exaggeration", 0.5), cfg_weight=v.get("cfg_weight", 0.5))
        pieces += [wav.squeeze(0).cpu().numpy().astype(np.float32), gap]
    audio = np.concatenate(pieces)
    sf.write(os.path.join(out, v["name"] + ".wav"), audio, SR)
    timing["variants"][v["name"]] = {"audio_s": round(len(audio) / SR, 2), "compute_s": round(time.time() - t1, 1)}
    print(v["name"], timing["variants"][v["name"]], flush=True)

json.dump(timing, open(os.path.join(out, "timing.json"), "w"), indent=1)
