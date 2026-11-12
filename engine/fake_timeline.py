"""Estimate a timeline (no TTS) so scenes can be previewed locally.
usage: python engine/fake_timeline.py episodes/<ep> build/timeline.json"""
import json, sys, re
ep, out = sys.argv[1], sys.argv[2]
script = json.load(open(f"{ep}/script.json"))
t, lines = 0.25, []
for l in script["lines"]:
    t += l.get("gap_before", 0.08)
    sp = script["voices"][l["speaker"]].get("speed", 1.0)
    words, st = [], t
    for w in l["text"].split():
        d = (0.07 + 0.052 * len(re.sub(r"[^A-Za-z0-9]", "", w))) / sp
        words.append({"w": w, "s": round(t, 3), "e": round(t + d, 3)})
        t += d + (0.18 / sp if re.search(r"[.,?!…]$", w) else 0.02)
    lines.append({"id": l["id"], "speaker": l["speaker"], "start": round(st, 3), "end": round(t, 3), "words": words})
json.dump({"duration": round(t + 0.9, 3), "lines": lines}, open(out, "w"), indent=1)
print("duration", round(t + 0.9, 2))
