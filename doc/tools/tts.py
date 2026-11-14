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
# ---------- prerecorded narration (a human voiceover already cut to the script): copy the audio + its word timeline
# script.json: "prerecorded": {"audio": "voice/voice.m4a", "timeline": "voice/timeline.json"}
if script.get("prerecorded"):
    pr = script["prerecorded"]
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ep, pr["audio"]), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    tl = json.load(open(os.path.join(ep, pr["timeline"]))); a = np.frombuffer(raw, np.float32)
    a = np.concatenate([a, np.zeros(max(0, int(tl["duration"] * SR) - len(a)), np.float32)])
    wavfile.write(os.path.join(out, "voice.wav"), SR, a)
    json.dump(tl, open(os.path.join(out, "timeline.json"), "w"), indent=1)
    print("prerecorded voice", tl["duration"], "s"); sys.exit(0)
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

def silent_synth(line, v):
    """Text-only episodes (no voiceover): the line is 'typed' on screen at cps characters/second, then held for reading."""
    words = line["text"].split(); cps = v.get("cps", 26); t, res = 0.0, []
    for w in words:
        d = max(.08, len(w) / cps); res.append({"w": w, "s": round(t, 3), "e": round(t + d, 3)}); t += d + .5 / cps
    hold = v.get("hold", .9) + v.get("per_word", .2) * len(words)
    return np.zeros(int(SR * (t + hold)), dtype=np.float32), ("direct", res)

# ---------- optional engine: Chatterbox Turbo (Resemble AI, MIT, runs on CPU). Expressive: inline tags in "say" such as
# [laugh] [chuckle] [sigh] [gasp] [surprised] [sarcastic] [whispering]. The voice is cloned from a short reference clip:
# voice config {"engine": "chatterbox", "ref_kokoro": "am_michael", "ref_speed": 1.1}  (reference made with Kokoro)  or {"ref": "voice/ref.wav"}.
# "{BEEP}" in "say" leaves a silent slot (the censored word is never synthesised); the caption word there gets the slot's time.
CB = {}
def cb_model():
    if "m" not in CB:
        import torch; torch.set_num_threads(os.cpu_count() or 4)
        from chatterbox.tts_turbo import ChatterboxTurboTTS
        CB["m"] = ChatterboxTurboTTS.from_pretrained(device="cpu")
    return CB["m"]
def cb_mtl():   # Chatterbox Multilingual V3 (Hindi and 22 more languages, zero-shot clone)
    if "mtl" not in CB:
        import torch; torch.set_num_threads(os.cpu_count() or 4)
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        CB["mtl"] = ChatterboxMultilingualTTS.from_pretrained(device="cpu", t3_model="v3")
    return CB["mtl"]
def cb_asr():
    if "asr" not in CB:
        from faster_whisper import WhisperModel
        CB["asr"] = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8")
    return CB["asr"]
def cb_cer(heard, want):
    import unicodedata
    f = lambda x: re.sub(r"[\W_]+", "", unicodedata.normalize("NFC", x).lower().replace("\u093c", "").replace("\u0901", "\u0902"))
    a, b = f(heard), f(want)
    if not b: return 1.0
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1): cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1] / len(b)
def cb_to_sr(a, sr):
    if sr == SR: return a
    from scipy.signal import resample_poly; from math import gcd; g = gcd(sr, SR); return resample_poly(a, SR // g, sr // g).astype(np.float32)
NV = ("laugh", "chuckle", "sigh", "gasp", "cough")
def mtl_part(txt, ref, v, gen):
    """one spoken piece in the cloned voice: best of N takes, each checked by Whisper against the intended text"""
    m = cb_mtl(); best = None; takes = max(1, v.get("takes", 1))
    for k in range(takes):
        import torch; torch.manual_seed(hash(txt) % 100000 + k * 7)
        w = m.generate(txt, language_id=v.get("lang", "hi"), audio_prompt_path=ref, **gen)
        a = cb_trim(cb_to_sr(w.squeeze().detach().cpu().numpy().astype(np.float32), m.sr))
        if takes == 1: return a
        from scipy.signal import resample_poly
        seg, _ = cb_asr().transcribe(resample_poly(a, 2, 3).astype(np.float32), language=v.get("lang", "hi"), beam_size=1)
        e = cb_cer(" ".join(x.text for x in seg), txt); exp = .075 * len(re.sub(r"\W", "", txt)) + .3; d = len(a) / SR
        score = e + max(0, d / exp - 1.7) + max(0, .5 - d / exp)
        print("  take", k, round(e, 3), round(d, 2), flush=True)
        if best is None or score < best[0]: best = (score, a)
        if e < .08 and score == e: break
    return best[1]
def nv_part(tag, ref, v):
    """a non-verbal sound (chuckle, sigh, gasp...) in the same cloned voice, made with Chatterbox Turbo's tags"""
    m = cb_model(); w = m.generate(v.get("nv_text", {}).get(tag, f"[{tag}]"), audio_prompt_path=ref)
    a = cb_trim(cb_to_sr(w.squeeze().detach().cpu().numpy().astype(np.float32), m.sr)); return a[:int(SR * v.get("nv_max", 1.3))]
REF_TEXT = "This is a calm reference recording. It gives the cloning model the tone, the pace and the color of the narrator's voice, so every line sounds like the same person."
def cb_ref(v):
    key = v.get("ref") or ("kokoro:" + v["ref_kokoro"] + ":" + str(v.get("ref_speed", 1.0)))
    if key not in CB:
        if v.get("ref"): CB[key] = os.path.join(ep, v["ref"])
        else:
            a = np.concatenate([(r.audio.detach().cpu().numpy() if hasattr(r.audio, "detach") else np.asarray(r.audio)) for r in pipe("a")(v.get("ref_text", REF_TEXT), voice=v["ref_kokoro"], speed=v.get("ref_speed", 1.0))])
            path = os.path.join(out, "ref_" + re.sub(r"\W", "_", key) + ".wav"); wavfile.write(path, SR, a.astype(np.float32)); CB[key] = path
    return CB[key]
def cb_trim(a, thr=.012):
    nz = np.where(np.abs(a) > thr)[0]
    return a[max(0, nz[0] - int(.02 * SR)): nz[-1] + int(.06 * SR)] if len(nz) else a[:int(.1 * SR)]
def cb_spread(words, a, t0):
    """caption words spread over the speech-active frames of one audio piece (weighted by spoken length)"""
    if not words: return []
    hop = int(.01 * SR); fr = np.sqrt(np.mean(a[:len(a) // hop * hop].reshape(-1, hop) ** 2, axis=1)) if len(a) >= hop else np.ones(1)
    act = np.where(fr > max(1e-4, fr.max() * .08))[0]
    if len(act) < 3: act = np.arange(len(fr))
    ws = [weight(w) for w in words]; tot = sum(ws); acc, res = 0, []
    for w, k in zip(words, ws):
        i0 = act[min(len(act) - 1, int(acc / tot * len(act)))]; acc += k; i1 = act[min(len(act) - 1, max(0, int(acc / tot * len(act)) - 1))]
        res.append({"w": w, "s": round(t0 + i0 * hop / SR, 3), "e": round(t0 + (i1 + 1) * hop / SR, 3)})
    return res
def chatterbox_synth(line, v):
    m = cb_model() if v.get("model") != "mtl" else None; ref = cb_ref(v)
    say = line.get("say") or line["text"]; parts = say.split("{BEEP}")
    words = line["text"].split(); bleep = set(script.get("bleep", ["shit", "fuck"]))
    # split the caption words at the censored words, one group per spoken part
    groups, cur, cens = [], [], []
    for w in words:
        if len(parts) > 1 and norm(w) in bleep and len(groups) < len(parts) - 1: groups.append(cur); cens.append(w); cur = []
        else: cur.append(w)
    groups.append(cur)
    while len(groups) < len(parts): groups.append([])
    audio, res, t = [], [], 0.0
    for k, part in enumerate(parts):
        txt = speakable(part.strip())
        if re.sub(r"\[[^\]]*\]|\W", "", txt):
            if v.get("model") == "mtl":   # Hindi etc.: speech pieces with the multilingual model, [tags] as separate non-verbal sounds
                gen = {**v.get("gen", {}), **line.get("gen", {})}; bits = [b for b in re.split(r"(\[(?:%s)\])" % "|".join(NV), txt) if b.strip()]
                sp = [b for b in bits if not b.startswith("[")]; tot = sum(len(b) for b in sp) or 1; wl = groups[k]; wi = 0; acc = 0
                for b in bits:
                    if b.startswith("["): a = nv_part(b[1:-1], ref, v); pause = np.zeros(int(SR * .08), np.float32); audio += [a, pause]; t += (len(a) + len(pause)) / SR; continue
                    a = mtl_part(b.strip(), ref, v, gen); acc += len(b); wj = len(wl) if acc >= tot else round(len(wl) * acc / tot)
                    res += cb_spread(wl[wi:wj], a, t); wi = wj; gap = np.zeros(int(SR * v.get("gap", .1)), np.float32); audio += [a, gap]; t += (len(a) + len(gap)) / SR
            else:
                w = m.generate(txt, audio_prompt_path=ref, **v.get("gen", {}))
                a = w.squeeze().detach().cpu().numpy().astype(np.float32)
                if m.sr != SR:
                    from scipy.signal import resample_poly; from math import gcd; g = gcd(m.sr, SR); a = resample_poly(a, SR // g, m.sr // g).astype(np.float32)
                a = cb_trim(a); res += cb_spread(groups[k], a, t); audio.append(a); t += len(a) / SR
        if k < len(parts) - 1:   # the beep slot
            slot = v.get("beep_slot", .42); res.append({"w": cens[k] if k < len(cens) else "****", "s": round(t + .04, 3), "e": round(t + slot - .04, 3)})
            audio.append(np.zeros(int(SR * slot), np.float32)); t += slot
    return (np.concatenate(audio) if audio else np.zeros(int(SR * .3), np.float32)), ("direct", res)

def synth(line):
    v = script["voices"][line["speaker"]]
    if v.get("engine") == "silent": return silent_synth(line, v)
    if v.get("engine") == "chatterbox": return chatterbox_synth(line, v)
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
    if not (isinstance(toks, tuple) and toks[0] == "direct"): a = a[lead:tail]
    else: lead = 0
    shift = lead / SR; dur = len(a) / SR
    if isinstance(toks, tuple) and toks[0] == "direct":   # silent engine: word times already on the caption words
        al = toks[1]
    elif isinstance(toks, tuple):   # edge engine: (tag, word boundaries)
        bounds = [(x, s - shift, e - shift) for x, s, e in toks[1]]
        al = map_bounds(line["text"].split(), bounds, dur) or align(line["text"].split(), [], dur)
    else:
        toks = [(x, s - shift, e - shift) for x, s, e in toks]; al = align(line["text"].split(), toks, dur)
    words = [{"w": w["w"], "s": round(t + max(0, w["s"]), 3), "e": round(t + min(dur, max(w["e"], w["s"] + .05)), 3)} for w in al]
    lines.append({"id": line["id"], "speaker": line["speaker"], "start": round(t, 3), "end": round(t + dur, 3), "words": words, **({"pose": line["pose"]} if line.get("pose") else {}), **({"err": err} if err else {})})
    voice.append(a); t += dur
    if i % 10 == 0: print(f"{line['id']} {t:7.1f}s  {line['speaker']}", flush=True)
TAIL = float(script.get("tail", 1.2)); voice.append(np.zeros(int(SR * TAIL), dtype=np.float32)); t += TAIL
wavfile.write(os.path.join(out, "voice.wav"), SR, np.concatenate(voice).astype(np.float32))
json.dump({"duration": round(t, 3), "lines": lines}, open(os.path.join(out, "timeline.json"), "w"), indent=1)
print("voice duration", round(t, 1), "s")
