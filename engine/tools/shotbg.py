import sys, functools, http.server, threading, base64, os
from playwright.sync_api import sync_playwright
root, path, out, fulldir = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Q, directory=root)); threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    br = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg = br.new_page(viewport={"width": 1920, "height": 720})
    pg.on("pageerror", lambda e: print("[pageerror]", e)); pg.on("console", lambda m: print("[console]", m.text) if m.type=="error" else None)
    pg.goto(f"http://127.0.0.1:{srv.server_address[1]}/{path}"); pg.wait_for_function("window.DONE === true", timeout=60000)
    pg.locator("canvas").screenshot(path=out)
    os.makedirs(fulldir, exist_ok=True)
    for k, v in pg.evaluate("window.FULL").items():
        open(os.path.join(fulldir, k + ".jpg"), "wb").write(base64.b64decode(v.split(",", 1)[1]))
