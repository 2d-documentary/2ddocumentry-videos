"""Voice-clone TTS with Chatterbox Multilingual (MIT, zero-shot, Hindi) + glitch control.

Usage: python doc/tools/voice_clone.py voices/<name>/test.json <out_dir> [variant_name]

Glitch control:
  * text is split into short chunks (sentences; long sentences at commas),
  * each chunk is generated N times (different seeds, lower temperature),
  * every take is transcribed with Whisper and scored against the intended text
    (character error rate + length sanity); the cleanest take wins,
  * each take is trimmed of edge noise and given 8 ms fades so joins never click.

test.json:
{"lang":"hi","gap":0.28,"comma_gap":0.12,
 "variants":[{"name":"A","ref":"voices/chintu/ref_a.wav","field":"say","model":"v3",
              "takes":3,"temperature":0.6,"exaggeration":0.5,"cfg_weight":0.5}],
 "lines":[{"text":"Roman Hinglish","say":"देवनागरी"}]}
"""
import json, os, re, sys, time, unicodedata
import numpy as np
import torch
import soundfile as sf
import librosa
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from faster_whisper import WhisperModel

cfg = json.load(open(sys.argv[1]))
out = sys.argv[2]
only = sys.argv[3] if len(sys.argv) > 3 else None
os.makedirs(out, exist_ok=True)
torch.set_num_threads(os.cpu_count() or 4)

asr = WhisperModel(cfg.get("asr", "large-v3-turbo"), device="cpu", compute_type="int8")


def norm(s):
    s = unicodedata.normalize("NFC", s).lower()
    s = s.replace("़", "").replace("ँ", "ं")          # nukta, chandrabindu -> anusvara
    return re.sub(r"[\W_]+", "", s)


def cer(a, b):
    a, b = norm(a), norm(b)
    if not b:
        return 1.0
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1] / len(b)


def chunks(text, max_words=14):
    out = []
    for sent in re.split(r"(?<=[।?!.])\s+", text.strip()):
        if len(sent.split()) <= max_words:
            out.append((sent, "sent"))
            continue
        parts = re.split(r"(?<=,)\s+", sent)
        buf = ""
        for p in parts:
            if buf and len((buf + " " + p).split()) > max_words:
                out.append((buf, "comma")); buf = p
            else:
                buf = (buf + " " + p).strip()
        if buf:
            out.append((buf, "sent"))
    return out


def clean_edges(w, sr):
    # trim leading/trailing low-energy audio (edge noise), then fade
    env = np.abs(w)
    win = int(sr * 0.01)
    if len(w) > win * 4:
        rms = np.sqrt(np.convolve(env ** 2, np.ones(win) / win, mode="same"))
        thr = max(rms.max() * 0.02, 1e-4)
        idx = np.where(rms > thr)[0]
        if len(idx):
            w = w[max(0, idx[0] - int(sr * 0.02)): min(len(w), idx[-1] + int(sr * 0.06))]
    f = min(int(sr * 0.008), len(w) // 4)
    if f > 0:
        w = w.copy()
        w[:f] *= np.linspace(0, 1, f)
        w[-f:] *= np.linspace(1, 0, f)
    return w


models = {}
report = {}
for v in cfg["variants"]:
    if only and v["name"] != only:
        continue
    mk = v.get("model", "v3")
    if mk not in models:
        t0 = time.time()
        models[mk] = ChatterboxMultilingualTTS.from_pretrained(device="cpu", t3_model=None if mk == "v2" else mk)
        print("loaded", mk, round(time.time() - t0, 1), flush=True)
    model = models[mk]
    SR = model.sr
    t1 = time.time()
    pieces, rep = [], []
    for li, line in enumerate(cfg["lines"]):
        for ci, (txt, kind) in enumerate(chunks(line[v.get("field", "say")])):
            ref_txt = chunks(line["say"])[ci][0] if v.get("field", "say") != "say" and len(chunks(line["say"])) > ci else txt
            best = None
            for k in range(v.get("takes", 3)):
                torch.manual_seed(1000 * li + 10 * ci + k + 7)
                w = model.generate(txt, language_id=cfg.get("lang", "hi"), audio_prompt_path=v["ref"],
                                   exaggeration=v.get("exaggeration", 0.5), cfg_weight=v.get("cfg_weight", 0.5),
                                   temperature=v.get("temperature", 0.6),
                                   repetition_penalty=v.get("repetition_penalty", 1.3))
                w = clean_edges(w.squeeze(0).cpu().numpy().astype(np.float32), SR)
                seg, _ = asr.transcribe(librosa.resample(w, orig_sr=SR, target_sr=16000), language="hi", beam_size=1, vad_filter=False)
                heard = " ".join(s.text for s in seg)
                e = cer(heard, ref_txt)
                dur = len(w) / SR
                exp = 0.075 * len(norm(ref_txt)) + 0.25           # rough expected seconds
                pen = max(0.0, dur / exp - 1.6) + max(0.0, 0.55 - dur / exp)
                score = e + pen
                if best is None or score < best[0]:
                    best = (score, w, heard, e, dur)
                if e < 0.08 and pen == 0:
                    break                                          # clean enough, skip remaining takes
            pieces += [best[1], np.zeros(int(SR * (cfg.get("gap", 0.28) if kind == "sent" else cfg.get("comma_gap", 0.12))), np.float32)]
            rep.append({"chunk": txt, "heard": best[2], "cer": round(best[3], 3), "sec": round(best[4], 2), "takes": k + 1})
            print(v["name"], li, ci, rep[-1], flush=True)
    audio = np.concatenate(pieces)
    sf.write(os.path.join(out, v["name"] + ".wav"), audio, SR)
    report[v["name"]] = {"audio_s": round(len(audio) / SR, 2), "compute_s": round(time.time() - t1, 1),
                         "mean_cer": round(float(np.mean([r["cer"] for r in rep])), 3), "chunks": rep}

json.dump(report, open(os.path.join(out, f"report_{only or 'all'}.json"), "w"), ensure_ascii=False, indent=1)
