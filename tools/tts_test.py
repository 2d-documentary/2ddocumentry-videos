"""Compare TTS engines on one script: Kokoro (am_michael) vs Chatterbox Turbo (paralinguistic tags) vs Chatterbox (exaggeration).
Usage: python tools/tts_test.py tests/tts/sample1.json out_dir"""
import json, os, re, sys, traceback
import numpy as np, soundfile as sf
cfg = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
log = open(os.path.join(out, "info.txt"), "w")
def say(*a): print(*a); print(*a, file=log); log.flush()
plain = re.sub(r"\s*\[[^\]]+\]\s*", " ", cfg["text"]).strip()

# 1) Kokoro / Michael (same text, tags removed) + a clean reference clip for cloning
from kokoro import KPipeline
kp = KPipeline(lang_code="a")
def kok(text, path):
    a = np.concatenate([np.asarray(x.audio if hasattr(x, "audio") else x[2]) for x in kp(text, voice=cfg["kokoro_voice"], speed=cfg["kokoro_speed"])])
    sf.write(path, a, 24000); return len(a) / 24000
say("kokoro michael", round(kok(plain, f"{out}/michael.wav"), 2), "s")
kok(cfg["ref_text"], f"{out}/ref_michael.wav")

# 2) Chatterbox Turbo, voice cloned from the Michael reference, with [laugh]/[chuckle]/[gasp] tags
try:
    from chatterbox.tts_turbo import ChatterboxTurboTTS
    m = ChatterboxTurboTTS.from_pretrained(device="cpu")
    try:
        tok = getattr(getattr(m, "tokenizer", None), "get_added_vocab", lambda: {})()
        say("turbo added tokens:", sorted(k for k in tok if k.startswith("[")))
    except Exception: pass
    w = m.generate(cfg["text"], audio_prompt_path=f"{out}/ref_michael.wav")
    a = w.squeeze().cpu().numpy(); sf.write(f"{out}/chatterbox_turbo.wav", a, m.sr); say("turbo", round(len(a) / m.sr, 2), "s")
except Exception:
    say("TURBO FAILED\n" + traceback.format_exc())

# 3) Chatterbox (original): no tags, but an emotion 'exaggeration' dial
try:
    from chatterbox.tts import ChatterboxTTS
    m = ChatterboxTTS.from_pretrained(device="cpu")
    w = m.generate(plain, audio_prompt_path=f"{out}/ref_michael.wav", exaggeration=cfg["exaggeration"], cfg_weight=0.4)
    a = w.squeeze().cpu().numpy(); sf.write(f"{out}/chatterbox_expressive.wav", a, m.sr); say("chatterbox", round(len(a) / m.sr, 2), "s")
except Exception:
    say("CHATTERBOX FAILED\n" + traceback.format_exc())
