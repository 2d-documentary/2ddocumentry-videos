"""Narration with Kokoro-82M (free, Apache-2.0 open weights). One wav for the whole episode plus a word-level timeline.
usage: python doc/tools/tts.py documentaries/<ep> build/<ep> [part]   ->  build/<ep>/voice.wav, build/<ep>/timeline.json
Each script line is synthesised with its speaker's voice/speed; word times come from Kokoro's token timestamps and are
mapped back onto the script's own words (so scene cues like ['L034', 'Great'] resolve exactly)."""
import json, os, re, sys
import numpy as np
from scipy.io import wavfile
from kokoro import KPipeline

SR = 24000
ep, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
script = json.load(open(os.path.join(ep, "script.json")))
PART = sys.argv[3] if len(sys.argv) > 3 else None
if PART: script["lines"] = [l for l in script["lines"] if PART in l.get("parts", ["full"])]
pipes = {}
def pipe(lang):
    if lang not in pipes: pipes[lang] = KPipeline(lang_code=lang)
    return pipes[lang]
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
# Kokoro reads digits; make dates and numbers speakable the way a narrator would say them
SPOKEN = script.get("spoken", {})
def speakable(text):
    out = []
    for w in text.split():
        core = w.rstrip(".,:;!?\u2014"); punct = w[len(core):]
        out.append(SPOKEN.get(core, core) + punct)
    return " ".join(out)

def synth(line):
    v = script["voices"][line["speaker"]]
    audio, toks, off = [], [], 0.0
    # optional "say": what the voice actually speaks (e.g. Devanagari Hindi), while "text" stays the on-screen/caption words
    # (Roman-script Hindi). Timings then fall back to proportional word spacing over "text".
    spoken_text = line["say"] if line.get("say") else speakable(line["text"])
    for r in pipe(v["lang"])(spoken_text, voice=v["voice"], speed=v.get("speed", 1.0)):
        a = r.audio.detach().cpu().numpy() if hasattr(r.audio, "detach") else np.asarray(r.audio)
        for t in (getattr(r, 'tokens', None) or []):
            if getattr(t, 'start_ts', None) is not None and getattr(t, 'end_ts', None) is not None and norm(t.text): toks.append((norm(t.text), off + t.start_ts, off + t.end_ts))
        audio.append(a); off += len(a) / SR
    if line.get("say"): toks = []
    return np.concatenate(audio) if audio else np.zeros(1), toks

def align(words, toks, dur):
    """Map script words (with digits) onto spoken tokens (digits spelled out). Greedy by character budget, proportional fallback."""
    spoken = [norm(speakable(w)) for w in words]; total = sum(len(s) or 1 for s in spoken)
    if not toks:   # proportional fallback
        t, res = 0.0, []
        for w, s in zip(words, spoken): d = dur * (len(s) or 1) / total; res.append({"w": w, "s": round(t, 3), "e": round(t + d, 3)}); t += d
        return res
    res, ti = [], 0
    for w, s in zip(words, spoken):
        if ti >= len(toks): last = res[-1]["e"] if res else 0; res.append({"w": w, "s": last, "e": min(dur, last + .2)}); continue
        acc, st, en = "", toks[ti][1], toks[ti][2]
        while ti < len(toks) and len(acc) < len(s):
            acc += toks[ti][0]; en = toks[ti][2]; ti += 1
        res.append({"w": w, "s": round(st, 3), "e": round(en, 3)})
    return res

voice, t, lines = [], 0.35, []
voice.append(np.zeros(int(SR * t), dtype=np.float32))
for i, line in enumerate(script["lines"]):
    gap = line.get("gap_before", .12)
    voice.append(np.zeros(int(SR * gap), dtype=np.float32)); t += gap
    a, toks = synth(line); a = a.astype(np.float32)
    # trim leading/trailing silence a little so pauses are controlled by gap_before
    nz = np.where(np.abs(a) > 0.01)[0]; lead = max(0, nz[0] - int(.03 * SR)) if len(nz) else 0; tail = min(len(a), nz[-1] + int(.08 * SR)) if len(nz) else len(a)
    a = a[lead:tail]; shift = lead / SR; toks = [(x, s - shift, e - shift) for x, s, e in toks]
    dur = len(a) / SR
    words = [{"w": w["w"], "s": round(t + max(0, w["s"]), 3), "e": round(t + min(dur, max(w["e"], w["s"] + .05)), 3)} for w in align(line["text"].split(), toks, dur)]
    lines.append({"id": line["id"], "speaker": line["speaker"], "start": round(t, 3), "end": round(t + dur, 3), "words": words})
    voice.append(a); t += dur
    if i % 10 == 0: print(f"{line['id']} {t:7.1f}s  {line['speaker']}", flush=True)
TAIL = float(script.get("tail", 1.2)); voice.append(np.zeros(int(SR * TAIL), dtype=np.float32)); t += TAIL
wavfile.write(os.path.join(out, "voice.wav"), SR, np.concatenate(voice).astype(np.float32))
json.dump({"duration": round(t, 3), "lines": lines}, open(os.path.join(out, "timeline.json"), "w"), indent=1)
print("voice duration", round(t, 1), "s")
