"""Narration with Kokoro-82M (free, Apache-2.0 open weights), or Microsoft Edge neural voices when a voice sets "engine": "edge". One wav for the whole episode plus a word-level timeline.
usage: python doc/tools/tts.py documentaries/<ep> build/<ep> [part]   ->  build/<ep>/voice.wav, build/<ep>/timeline.json
Each script line is synthesised with its speaker's voice/speed; word times come from Kokoro's token timestamps and are
mapped back onto the script's own words (so scene cues like ['L034', 'Great'] resolve exactly)."""
import json, os, re, sys, asyncio, subprocess, tempfile, time
import numpy as np
from scipy.io import wavfile

SR = 24000
ep, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
script = json.load(open(os.path.join(ep, "script.json")))
PART = sys.argv[3] if len(sys.argv) > 3 else None
if PART: script["lines"] = [l for l in script["lines"] if PART in l.get("parts", ["full"])]
pipes = {}
def pipe(lang):
    if lang not in pipes:
        from kokoro import KPipeline   # imported lazily so "engine": "edge" episodes don't need it
        pipes[lang] = KPipeline(lang_code=lang)
    return pipes[lang]

# ---------- optional engine: Microsoft Edge neural voices (free, e.g. hi-IN-MadhurNeural) via the edge-tts package.
# voice config: {"engine": "edge", "voice": "hi-IN-MadhurNeural", "rate": "+8%", "pitch": "+0Hz"}
def edge_synth(text, v):
    import edge_tts
    async def run():
        com = edge_tts.Communicate(text, v["voice"], rate=v.get("rate", "+0%"), pitch=v.get("pitch", "+0Hz"), volume=v.get("volume", "+0%"), boundary="WordBoundary")
        mp3, bounds = bytearray(), []
        async for ch in com.stream():
            if ch["type"] == "audio": mp3.extend(ch["data"])
            elif ch["type"] == "WordBoundary": bounds.append((ch["text"], ch["offset"] / 1e7, (ch["offset"] + ch["duration"]) / 1e7))
        return bytes(mp3), bounds
    for attempt in range(5):
        try:
            mp3, bounds = asyncio.run(run())
            if mp3: break
        except Exception as e:
            print("edge-tts retry", attempt, e, flush=True); time.sleep(3 + attempt * 4)
    else: raise RuntimeError("edge-tts failed for: " + text[:60])
    with tempfile.TemporaryDirectory() as d:
        open(os.path.join(d, "a.mp3"), "wb").write(mp3)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(d, "a.mp3"), "-ac", "1", "-ar", str(SR), os.path.join(d, "a.wav")], check=True)
        sr, a = wavfile.read(os.path.join(d, "a.wav"))
    a = a.astype(np.float32) / (32768.0 if a.dtype == np.int16 else 1.0)
    return a, bounds

def weight(w):  # rough spoken length of a caption word (digits are spoken as long number words)
    core = re.sub(r"[^\w]", "", w); dg = sum(c.isdigit() for c in core)
    return max(1, len(core) - dg + dg * 4)

def map_bounds(words, bounds, dur):
    """Map caption words (Roman) onto the spoken word boundaries (Devanagari) by matching relative position along the line."""
    if not bounds: return None
    bw = [max(1, len(b[0])) for b in bounds]; btot = sum(bw); cum = np.cumsum([0] + bw) / btot
    def time_at(f):
        f = min(max(f, 0), 1); i = min(int(np.searchsorted(cum, f, side="right") - 1), len(bounds) - 1)
        s, e = bounds[i][1], bounds[i][2]; lo, hi = cum[i], cum[i + 1]
        return s + (e - s) * ((f - lo) / (hi - lo) if hi > lo else 0)
    ws = [weight(w) for w in words]; tot = sum(ws); acc, res = 0, []
    for w, k in zip(words, ws):
        s = time_at(acc / tot); acc += k; e = time_at(acc / tot - 1e-6)
        res.append({"w": w, "s": float(round(s, 3)), "e": float(round(max(e, s + .05), 3))})
    return res
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
# Kokoro reads digits; make dates and numbers speakable the way a narrator would say them
SPOKEN = script.get("spoken", {})
def speakable(text):
    out = []
    for w in text.split():
        core = w.rstrip(".,:;!?\u2014"); punct = w[len(core):]
        out.append(SPOKEN.get(core, core) + punct)
    return " ".join(out)

# ---------- optional engine: AI4Bharat Indic Parler-TTS (open weights, Apache-2.0). No word timestamps -> proportional timing.
# voice config: {"engine": "parler", "model": "ai4bharat/indic-parler-tts", "description": "Rohit speaks in a natural, expressive tone ..."}
PARLER = {}
def parler_synth(text, v):
    if "m" not in PARLER:
        try: import parler_tts  # noqa
        except ImportError:
            subprocess.run([sys.executable, "-m", "pip", "install", "-q", "git+https://github.com/huggingface/parler-tts.git"], check=True)
        import torch; from parler_tts import ParlerTTSForConditionalGeneration; from transformers import AutoTokenizer
        name = v.get("model", "ai4bharat/indic-parler-tts"); torch.set_num_threads(os.cpu_count() or 4)
        m = ParlerTTSForConditionalGeneration.from_pretrained(name); PARLER.update(m=m, tok=AutoTokenizer.from_pretrained(name), dtok=AutoTokenizer.from_pretrained(m.config.text_encoder._name_or_path), torch=torch)
    m, tok, dtok, torch = PARLER["m"], PARLER["tok"], PARLER["dtok"], PARLER["torch"]
    d = dtok(v["description"], return_tensors="pt"); pr = tok(text, return_tensors="pt")
    with torch.no_grad():
        g = m.generate(input_ids=d.input_ids, attention_mask=d.attention_mask, prompt_input_ids=pr.input_ids, prompt_attention_mask=pr.attention_mask)
    a = g.cpu().numpy().squeeze().astype(np.float32); sr = m.config.sampling_rate
    if sr != SR:
        from scipy.signal import resample_poly; from math import gcd; k = gcd(sr, SR); a = resample_poly(a, SR // k, sr // k).astype(np.float32)
    return a

def synth(line):
    v = script["voices"][line["speaker"]]
    # "read": "text" makes the voice read the Roman caption text (e.g. Indian-English voices reading Hinglish)
    spoken = speakable(line["text"]) if v.get("read") == "text" or not line.get("say") else line["say"]
    if v.get("engine") == "edge":
        try:
            a, bounds = edge_synth(spoken, v)
        except RuntimeError:
            # Edge sometimes returns no audio for a whole sentence; speak it in smaller pieces and join them
            parts = [p.strip() for p in re.split(r"(?<=[।,?!.])\s+", spoken) if p.strip()]
            if len(parts) < 2: raise
            chunks, bounds, off = [], [], 0.0
            for p in parts:
                pa, pb = edge_synth(p, v)
                chunks.append(pa); bounds += [(x, s0 + off, e0 + off) for x, s0, e0 in pb]
                gap = np.zeros(int(SR * .06), dtype=np.float32); chunks.append(gap); off += (len(pa) + len(gap)) / SR
            a = np.concatenate(chunks)
        return a, ("edge", bounds)
    if v.get("engine") == "parler":
        return parler_synth(spoken, v), []
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
    err = None
    try: a, toks = synth(line)
    except Exception as e:
        if not script.get("lenient"): raise
        import traceback; err = (type(e).__name__ + ": " + str(e))[-600:]; traceback.print_exc()
        print("FAILED", line["id"], err, flush=True); a, toks = np.zeros(int(SR * 1.0), dtype=np.float32), []
    a = a.astype(np.float32)
    # trim leading/trailing silence a little so pauses are controlled by gap_before
    nz = np.where(np.abs(a) > 0.01)[0]; lead = max(0, nz[0] - int(.03 * SR)) if len(nz) else 0; tail = min(len(a), nz[-1] + int(.08 * SR)) if len(nz) else len(a)
    a = a[lead:tail]; shift = lead / SR; dur = len(a) / SR
    if isinstance(toks, tuple):   # edge engine: (tag, word boundaries)
        bounds = [(x, s - shift, e - shift) for x, s, e in toks[1]]
        al = map_bounds(line["text"].split(), bounds, dur) or align(line["text"].split(), [], dur)
    else:
        toks = [(x, s - shift, e - shift) for x, s, e in toks]; al = align(line["text"].split(), toks, dur)
    words = [{"w": w["w"], "s": round(t + max(0, w["s"]), 3), "e": round(t + min(dur, max(w["e"], w["s"] + .05)), 3)} for w in al]
    lines.append({"id": line["id"], "speaker": line["speaker"], "start": round(t, 3), "end": round(t + dur, 3), "words": words, **({"err": err} if err else {})})
    voice.append(a); t += dur
    if i % 10 == 0: print(f"{line['id']} {t:7.1f}s  {line['speaker']}", flush=True)
TAIL = float(script.get("tail", 1.2)); voice.append(np.zeros(int(SR * TAIL), dtype=np.float32)); t += TAIL
wavfile.write(os.path.join(out, "voice.wav"), SR, np.concatenate(voice).astype(np.float32))
json.dump({"duration": round(t, 3), "lines": lines}, open(os.path.join(out, "timeline.json"), "w"), indent=1)
print("voice duration", round(t, 1), "s")
