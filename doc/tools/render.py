"""Render a documentary (doc/engine/doc.html): draws every frame in headless Chrome, encodes with FFmpeg.
usage: python engine/render.py <episode dir> <timeline.json> <out.mp4|stills dir> [--audio mix.wav] [--stills 1.0,2.5] [--fps 30]
Also writes <out dir>/cues.json (SFX cue times resolved from the timeline)."""
import argparse, base64, functools, http.server, json, os, subprocess, sys, threading, time
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def serve():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    h.log_message = lambda *a, **k: None
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv.server_address[1]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode"); ap.add_argument("timeline"); ap.add_argument("out")
    ap.add_argument("--audio"); ap.add_argument("--stills"); ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--cues-only", action="store_true"); ap.add_argument("--assets", default="")
    ap.add_argument("--page", default="doc.html"); ap.add_argument("--size", default="1920x1080")
    ap.add_argument("--from-frame", type=int, default=0); ap.add_argument("--to-frame", type=int, default=-1); ap.add_argument("--crf", default="20")
    a = ap.parse_args()
    ep = os.path.basename(os.path.normpath(a.episode))
    tl = json.load(open(a.timeline))
    port = serve()
    with sync_playwright() as p:
        try:
            br = p.chromium.launch(args=["--disable-web-security", "--allow-file-access-from-files"])
        except Exception:
            br = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--disable-web-security"])
        vw, vh = map(int, a.size.split("x")); pg = br.new_page(viewport={"width": vw, "height": vh})
        pg.on("console", lambda m: print("[page]", m.text) if m.type in ("error", "warning") else None)
        pg.on("pageerror", lambda e: print("[pageerror]", e))
        pg.goto(f"http://127.0.0.1:{port}/doc/engine/{a.page}?ep={ep}&w={vw}&h={vh}" + (f"&assets={a.assets}" if a.assets else ""))
        pg.evaluate("window.READY")
        pg.wait_for_timeout(300)
        shots = pg.evaluate("tl => loadTimeline(tl)", tl)
        print("shots:", len(shots))
        cues = pg.evaluate("window.sfxCues ? sfxCues() : {}")
        cdir = os.path.dirname(os.path.abspath(a.out)) if not a.stills else a.out
        os.makedirs(cdir, exist_ok=True)
        json.dump(cues, open(os.path.join(cdir, "cues.json"), "w"), indent=1)
        if a.cues_only:
            return
        if a.stills:
            for t in [float(x) for x in a.stills.split(",")]:
                d = pg.evaluate("t => frameJPEG(t, 0.92)", t)
                open(os.path.join(a.out, f"still_{t:06.2f}.jpg"), "wb").write(base64.b64decode(d.split(",", 1)[1]))
            print("stills written"); return
        n = int(tl["duration"] * a.fps); i0 = a.from_frame; i1 = n if a.to_frame < 0 else min(n, a.to_frame)
        cmd = ["ffmpeg", "-y", "-v", "error", "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", str(a.fps), "-i", "-"]
        if a.audio: cmd += ["-i", a.audio, "-c:a", "aac", "-b:a", "192k", "-shortest"]
        cmd += ["-c:v", "libx264", "-preset", "veryfast", "-crf", a.crf, "-maxrate", "10M", "-bufsize", "20M", "-pix_fmt", "yuv420p", "-movflags", "+faststart", a.out]
        ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        t0 = time.time()
        for i in range(i0, i1):
            d = pg.evaluate("t => frameJPEG(t, 0.92)", i / a.fps)
            ff.stdin.write(base64.b64decode(d.split(",", 1)[1]))
            if i % 300 == 0: print(f"frame {i}/{i1}  {time.time()-t0:.0f}s", flush=True)
        ff.stdin.close(); ff.wait()
        br.close()
    print("wrote", a.out)

if __name__ == "__main__":
    main()
