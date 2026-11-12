#!/usr/bin/env python3
"""Find candidate archival assets for a documentary and make contact sheets to pick from.

Reads documentaries/<project>/discover.json:
  {"commons_categories": [...], "commons_search": [...], "pages": [...], "max_per_query": 40}
Writes to <out>: results.json (title, page, licence, size, description, thumb), thumbs/NNN.jpg,
sheets/sheet_NN.jpg (numbered grids). Commons metadata comes from its API; "pages" are scraped for
<img> and .pdf links (e.g. fbi.gov, vault.fbi.gov).
usage: python tools/discover.py documentaries/<project> <out-dir>
"""
import html, io, json, os, re, sys, urllib.parse
sys.path.insert(0, os.path.dirname(__file__))
from fetch_assets import http_get, get_json, strip_tags, FetchError  # noqa: E402

API = "https://commons.wikimedia.org/w/api.php?format=json&"


def commons_files(params):
    out, cont = [], {}
    while True:
        j = get_json(API + urllib.parse.urlencode({**params, **cont}))
        pages = (j.get("query") or {}).get("pages") or {}
        for p in pages.values():
            ii = (p.get("imageinfo") or [{}])[0]
            if not ii:
                continue
            m = ii.get("extmetadata", {})
            v = lambda k: strip_tags(m.get(k, {}).get("value", ""))[:300]
            out.append({"source": "commons", "title": p["title"], "page": ii.get("descriptionurl"),
                        "license": v("LicenseShortName"), "artist": v("Artist"), "date": v("DateTimeOriginal"),
                        "desc": v("ImageDescription"), "w": ii.get("width"), "h": ii.get("height"),
                        "mime": ii.get("mime"), "thumb": ii.get("thumburl")})
        if "continue" in j and len(out) < params.get("_max", 60):
            cont = j["continue"]
        else:
            return out


def category(cat, depth=1, seen=None, maxn=60):
    seen = seen if seen is not None else set()
    if cat in seen:
        return []
    seen.add(cat)
    files = commons_files({"action": "query", "generator": "categorymembers", "gcmtitle": "Category:" + cat,
                           "gcmtype": "file", "gcmlimit": 50, "prop": "imageinfo",
                           "iiprop": "url|size|mime|extmetadata", "iiurlwidth": 330, "_max": maxn})
    if depth > 0:
        subs = get_json(API + urllib.parse.urlencode({"action": "query", "list": "categorymembers",
                        "cmtitle": "Category:" + cat, "cmtype": "subcat", "cmlimit": 50}))
        for s in (subs.get("query") or {}).get("categorymembers", [])[:15]:
            files += category(s["title"].split(":", 1)[1], depth - 1, seen, maxn)
    return files


def search(q, maxn):
    return commons_files({"action": "query", "generator": "search", "gsrsearch": q, "gsrnamespace": 6,
                          "gsrlimit": min(maxn, 50), "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata",
                          "iiurlwidth": 330})


def scrape(url):
    data, ctype, final = http_get(url, limit=10 * 1024 * 1024)
    text = data.decode("utf-8", "ignore")
    out = []
    for m in re.finditer(r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>', text, re.I):
        tag = m.group(0)
        alt = re.search(r'alt=["\']([^"\']*)', tag)
        src = urllib.parse.urljoin(final, html.unescape(m.group(1)))
        if re.search(r"(logo|icon|sprite|pixel|spacer|\.svg)", src, re.I):
            continue
        out.append({"source": urllib.parse.urlsplit(url).hostname, "title": (alt.group(1) if alt else "")[:200],
                    "page": url, "file_url": src, "thumb": src})
    for m in re.finditer(r'href=["\']([^"\']+?(?:\.pdf|/view|/at_download/file)[^"\']*)["\'][^>]*>(.*?)</a>', text, re.I | re.S):
        out.append({"source": urllib.parse.urlsplit(url).hostname, "title": strip_tags(m.group(2))[:200],
                    "page": url, "file_url": urllib.parse.urljoin(final, html.unescape(m.group(1))), "doc": True})
    return out


def main():
    proj, out = sys.argv[1], sys.argv[2]
    cfg = json.load(open(os.path.join(proj, "discover.json")))
    maxn = cfg.get("max_per_query", 40)
    res, errors = [], []
    for c in cfg.get("commons_categories", []):
        try:
            got = category(c, cfg.get("depth", 1), maxn=maxn)
            res += [{**g, "query": "cat:" + c} for g in got]
            print(f"cat {c}: {len(got)}", flush=True)
        except Exception as e:
            errors.append(f"cat {c}: {e}")
    for q in cfg.get("commons_search", []):
        try:
            got = search(q, maxn)
            res += [{**g, "query": q} for g in got]
            print(f"search {q}: {len(got)}", flush=True)
        except Exception as e:
            errors.append(f"search {q}: {e}")
    for u in cfg.get("pages", []):
        try:
            got = scrape(u)
            res += [{**g, "query": "page"} for g in got]
            print(f"page {u}: {len(got)}", flush=True)
        except Exception as e:
            errors.append(f"page {u}: {e}")
    # dedupe
    seen, uniq = set(), []
    for r in res:
        k = r.get("title") if r["source"] == "commons" else r.get("file_url")
        if k in seen:
            continue
        seen.add(k)
        uniq.append(r)
    os.makedirs(os.path.join(out, "thumbs"), exist_ok=True)
    from PIL import Image, ImageDraw
    tiles = []
    for i, r in enumerate(uniq):
        r["n"] = i
        if r.get("doc") or not r.get("thumb"):
            continue
        try:
            d, ct, _ = http_get(r["thumb"], limit=15 * 1024 * 1024)
            im = Image.open(io.BytesIO(d)).convert("RGB")
            im.thumbnail((400, 400))
            p = os.path.join(out, "thumbs", f"{i:03d}.jpg")
            im.save(p, "JPEG", quality=82)
            r["thumb_file"] = f"thumbs/{i:03d}.jpg"
            tiles.append((i, im))
        except Exception as e:
            r["thumb_error"] = str(e)[:120]
    os.makedirs(os.path.join(out, "sheets"), exist_ok=True)
    per, cols, cw, ch = 20, 5, 320, 260
    for s in range(0, len(tiles), per):
        sheet = Image.new("RGB", (cols * cw, 4 * ch), (24, 24, 24))
        dr = ImageDraw.Draw(sheet)
        for k, (i, im) in enumerate(tiles[s:s + per]):
            x, y = (k % cols) * cw, (k // cols) * ch
            t = im.copy()
            t.thumbnail((cw - 10, ch - 34))
            sheet.paste(t, (x + 5 + (cw - 10 - t.width) // 2, y + 5))
            dr.rectangle([x, y + ch - 28, x + 64, y + ch - 2], fill=(200, 30, 30))
            dr.text((x + 8, y + ch - 24), f"#{i}", fill=(255, 255, 255))
        sheet.save(os.path.join(out, "sheets", f"sheet_{s // per:02d}.jpg"), "JPEG", quality=80)
    json.dump({"results": uniq, "errors": errors}, open(os.path.join(out, "results.json"), "w"), indent=1, ensure_ascii=False)
    with open(os.path.join(out, "results.txt"), "w") as fh:
        for r in uniq:
            fh.write(f"#{r['n']} [{r['source']}] {r.get('title','')} | {r.get('license','')} | {r.get('w','')}x{r.get('h','')} | "
                     f"{r.get('date','')} | {(r.get('desc') or '')[:140]} | {r.get('page') or ''} {r.get('file_url','') if r.get('doc') else ''}\n")
        for e in errors:
            fh.write("ERROR " + e + "\n")
    print(len(uniq), "candidates;", len(errors), "errors")


if __name__ == "__main__":
    main()
