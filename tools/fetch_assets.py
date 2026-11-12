#!/usr/bin/env python3
"""INK AND ANTIQUITY - archival asset fetcher.

Reads documentaries/<project>/manifest.json, downloads every asset that is not
yet in the store, and writes:
  <store>/<folder>/<filename>      the asset itself
  <store>/_previews/<id>.jpg       small preview (max 1280 px) for quick review
  <store>/_research/<id>.ocr.txt   newspaper OCR text when the source has it
  <store>/REPORT.md                what worked, what failed (with links to grab by hand)
  <store>/CREDITS.md               attribution list for the YouTube description
  <store>/manifest.lock.json       manifest + resolved urls, licences, status

Supported sources: Wikimedia Commons, loc.gov (incl. Chronicling America),
Internet Archive, direct file links, and any page exposing an og:image.
Usage: python tools/fetch_assets.py documentaries/<project> <store-dir>
"""
import html
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

UA = ("InkAndAntiquityAssetBot/1.0 (YouTube history documentary research; "
      "https://github.com/2d-documentary/2ddocumentry-videos)")
MAX_BYTES = 90 * 1024 * 1024        # GitHub hard limit is 100 MB per file
CONVERT_OVER = 40 * 1024 * 1024     # big images get re-encoded to keep the repo light
MAX_EDGE = 6000                     # long edge after re-encoding (plenty for 4K pans)

FOLDERS = {
    "newspapers": "archives/newspapers",
    "historical-photos": "archives/historical-photos",
    "documents": "archives/documents",
    "maps": "archives/maps",
    "paintings": "archives/paintings",
    "artefacts": "archives/artefacts",
    "footage": "archives/footage",
    "illustrations": "illustrations",
    "generated-assets": "generated-assets",
    "audio": "audio",
}
MEDIA_EXT = {
    "image/jpeg": ".jpg", "image/png": ".png", "image/gif": ".gif", "image/webp": ".webp",
    "image/tiff": ".tif", "image/jp2": ".jp2", "image/jpx": ".jp2", "image/svg+xml": ".svg",
    "application/pdf": ".pdf", "video/mp4": ".mp4", "video/webm": ".webm",
    "audio/mpeg": ".mp3", "audio/ogg": ".ogg", "audio/x-wav": ".wav", "audio/wav": ".wav",
}


class FetchError(Exception):
    pass


# ---------------------------------------------------------------- http helpers
_last_host_hit = {}


def _polite(host):
    # loc.gov rate-limits aggressively; everyone else gets a lighter pause
    gap = 3.0 if host.endswith("loc.gov") else 1.0
    wait = _last_host_hit.get(host, 0) + gap - time.time()
    if wait > 0:
        time.sleep(wait)
    _last_host_hit[host] = time.time()


def http_get(url, accept=None, limit=MAX_BYTES):
    host = urllib.parse.urlsplit(url).hostname or ""
    last = None
    for attempt in range(3):
        _polite(host)
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": accept or "*/*"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                size = int(r.headers.get("Content-Length") or 0)
                if size and size > limit:
                    raise FetchError(f"file too large ({size // 1048576} MB)")
                chunks, got, t0 = [], 0, time.time()
                while True:
                    c = r.read(1 << 20)
                    if not c:
                        break
                    chunks.append(c)
                    got += len(c)
                    if got > limit:
                        raise FetchError("file too large (over 90 MB)")
                    if time.time() - t0 > 300:
                        raise FetchError("download too slow (over 5 min)")
                data = b"".join(chunks)
                ctype = (r.headers.get("Content-Type") or "").split(";")[0].strip().lower()
                return data, ctype, r.geturl()
        except urllib.error.HTTPError as e:
            last = f"HTTP {e.code}"
            if e.code in (429, 500, 502, 503, 504):
                time.sleep(min(int(e.headers.get("Retry-After") or 0) or 10 * (attempt + 1), 60))
                continue
            raise FetchError(last)
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            last = f"network error / timeout: {getattr(e, 'reason', e)}"
            if attempt >= 1:
                break
            time.sleep(5)
    raise FetchError(last or "unknown error")


def get_json(url):
    data, _, _ = http_get(url, accept="application/json", limit=20 * 1024 * 1024)
    try:
        return json.loads(data)
    except ValueError:
        raise FetchError("source did not return JSON (blocked or page moved?)")


def strip_tags(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s or ""))).strip()


# ---------------------------------------------------------------- resolvers
# Each resolver returns a dict: {"url": direct file url, "license": ..., "attribution": ..., "ocr_url": ...}

def resolve_commons(page):
    p = urllib.parse.urlsplit(page)
    if p.hostname == "upload.wikimedia.org":
        title = "File:" + urllib.parse.unquote(p.path.rsplit("/", 1)[-1])
    else:
        m = re.search(r"/wiki/(File:[^?#]+)", p.path) or re.search(r"title=(File:[^&#]+)", p.query)
        if not m:
            raise FetchError("not a Commons File: page")
        title = urllib.parse.unquote(m.group(1)).replace("_", " ")
    api = ("https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo"
           "&iiprop=url|size|mime|extmetadata&iiurlwidth=" + str(MAX_EDGE) +
           "&titles=" + urllib.parse.quote(title))
    pages = get_json(api).get("query", {}).get("pages", {})
    info = next(iter(pages.values()), {})
    if "imageinfo" not in info:
        raise FetchError("file not found on Commons")
    ii = info["imageinfo"][0]
    meta = ii.get("extmetadata", {})
    val = lambda k: strip_tags(meta.get(k, {}).get("value", ""))
    url = ii["url"] if ii.get("size", 0) <= CONVERT_OVER else ii.get("thumburl", ii["url"])
    return {
        "url": url,
        "license": val("LicenseShortName") or None,
        "attribution": ", ".join(x for x in [val("Artist"), val("Credit")] if x) or None,
        "page": ii.get("descriptionurl", page),
    }


def resolve_chronam(page):
    """Old chroniclingamerica.loc.gov page URLs: .../lccn/<id>/<date>/ed-1/seq-N/"""
    m = re.search(r"(/lccn/[^/]+/\d{4}-\d{2}-\d{2}/ed-\d+/seq-\d+)", page)
    if not m:
        raise FetchError("need a newspaper PAGE url (…/ed-1/seq-1/)")
    base = "https://chroniclingamerica.loc.gov" + m.group(1)
    lccn, date, ed, seq = re.search(r"/lccn/([^/]+)/([^/]+)/(ed-\d+)/seq-(\d+)", m.group(1)).groups()
    return {"url": base + ".jp2", "fallback": base + ".pdf", "ocr_url": base + "/ocr.txt",
            # Chronicling America is moving to www.loc.gov; this is the same page there
            "then": f"https://www.loc.gov/resource/{lccn}/{date}/{ed}/?sp={seq}",
            "license": "No known restrictions (Chronicling America, Library of Congress)",
            "attribution": "Library of Congress, Chronicling America"}


def resolve_loc(page):
    p = urllib.parse.urlsplit(page)
    path = p.path
    m = re.match(r"/pictures/(?:item|collection/[^/]+/item)/([^/]+)", path)
    if m:  # legacy Prints & Photographs urls -> current item page
        path = f"/item/{m.group(1)}/"
    q = urllib.parse.parse_qs(p.query)
    q["fo"] = ["json"]
    api = urllib.parse.urlunsplit(("https", "www.loc.gov", path, urllib.parse.urlencode(q, doseq=True), ""))
    j = get_json(api)
    item = j.get("item", {}) or {}

    # Collect every media url in the response, then rank: biggest usable image first.
    found = {}

    def walk(o, ctx=None):
        if isinstance(o, dict):
            if isinstance(o.get("url"), str):
                walk_url(o["url"], o)
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
        elif isinstance(o, str):
            walk_url(o, None)

    def walk_url(u, meta):
        u = ("https:" + u) if u.startswith("//") else u
        if not re.match(r"https?://", u):
            return
        base = u.split("#")[0]
        if not re.search(r"\.(jpe?g|png|gif|tiff?|jp2|pdf)$", base, re.I) or "/service/" not in base and "tile.loc.gov" not in base:
            return
        w = 0
        mw = re.search(r"#.*w=(\d+)", u)
        if meta and meta.get("width"):
            w = int(meta.get("width") or 0)
        elif mw:
            w = int(mw.group(1))
        size = int((meta or {}).get("size") or 0)
        if size > MAX_BYTES:
            return
        ext = base.rsplit(".", 1)[-1].lower()
        # LoC file suffixes: t=thumb, r=reference, v=larger jpeg, u=master tiff
        hint = {"t": 0, "r": 1, "v": 2, "u": 3}.get(re.sub(r"\.[a-z0-9]+$", "", base)[-1:], 1)
        score = (ext in ("tif", "tiff", "jp2"), w or hint * 1000, ext == "jpg" or ext == "jpeg")
        if base not in found or score > found[base]:
            found[base] = score

    walk(j.get("resources", []))
    walk(item)
    if not found:
        raise FetchError("no downloadable image on this loc.gov page")
    ranked = [u for u, _ in sorted(found.items(), key=lambda kv: kv[1], reverse=True)]
    rights = item.get("rights_advisory") or item.get("rights") or j.get("rights") or ""
    if isinstance(rights, list):
        rights = " ".join(map(str, rights))
    creator = item.get("contributor_names") or item.get("creators") or []
    if isinstance(creator, list):
        creator = "; ".join(c if isinstance(c, str) else c.get("title", "") for c in creator[:3])
    out = {"url": ranked[0], "alts": ranked[1:4], "license": strip_tags(str(rights))[:300] or None,
           "attribution": ", ".join(x for x in [strip_tags(str(creator)), "Library of Congress"] if x)}
    ocr = [r.get("fulltext_file") for r in j.get("resources", []) or [] if isinstance(r, dict) and r.get("fulltext_file")]
    if ocr:
        out["ocr_url"] = ocr[0]
    return out


def resolve_archive(page, wanted_file=None, category=""):
    m = re.search(r"archive\.org/(?:details|download)/([^/?#]+)(?:/([^?#]+))?", page)
    if not m:
        raise FetchError("not an archive.org item url")
    ident, path_file = m.group(1), wanted_file or m.group(2)
    meta = get_json(f"https://archive.org/metadata/{ident}")
    files = meta.get("files") or []
    if not files:
        raise FetchError("archive.org item not found or dark")
    if path_file:
        chosen = urllib.parse.unquote(path_file)
    else:
        size = lambda f: int(f.get("size") or 0)
        fits = [f for f in files if 0 < size(f) <= MAX_BYTES and not re.search(r"(_thumb|__ia_thumb|_itemimage)\.", f.get("name", ""))]
        if category in ("footage", "audio"):
            pat = r"\.(mp4|webm|ogv)$" if category == "footage" else r"\.(mp3|ogg|wav|flac)$"
            ok = [f for f in fits if re.search(pat, f.get("name", ""), re.I)]
        else:
            ok = [f for f in fits if re.search(r"\.(jpe?g|png|tiff?|jp2|pdf)$", f.get("name", ""), re.I)
                  and f.get("source") == "original"]
        if not ok:
            raise FetchError("no suitable file under 90 MB in this item; name the exact file in the manifest 'file' field")
        chosen = max(ok, key=size)["name"]
    md = meta.get("metadata", {})
    lic = md.get("licenseurl") or md.get("rights") or None
    return {"url": f"https://archive.org/download/{ident}/{urllib.parse.quote(chosen)}",
            "license": strip_tags(str(lic)) if lic else None,
            "attribution": ", ".join(x for x in [strip_tags(str(md.get("creator") or "")), "Internet Archive"] if x)}


def resolve(asset):
    page = asset.get("url") or asset.get("source_page")
    if not page:
        raise FetchError("no url or source_page in manifest")
    host = (urllib.parse.urlsplit(page).hostname or "").lower()
    if host.endswith("wikimedia.org") or host.endswith("wikipedia.org"):
        return resolve_commons(page)
    if host == "chroniclingamerica.loc.gov":
        return resolve_chronam(page)
    if host.endswith("loc.gov") and not re.search(r"\.(jpe?g|png|tiff?|jp2|pdf|gif)$", page, re.I):
        return resolve_loc(page)
    if host.endswith("archive.org"):
        return resolve_archive(page, asset.get("file"), asset.get("category", ""))
    return {"url": page}


# ---------------------------------------------------------------- saving
def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60] or "asset"


def ext_for(ctype, url):
    if ctype in MEDIA_EXT:
        return MEDIA_EXT[ctype]
    m = re.search(r"\.([a-z0-9]{2,4})$", urllib.parse.urlsplit(url).path.lower())
    return "." + m.group(1) if m else ""


def is_media(ctype, data):
    if ctype.startswith(("image/", "video/", "audio/")) or ctype == "application/pdf":
        return True
    # some servers send octet-stream; sniff magic bytes
    return (data[:3] == b"\xff\xd8\xff" or data[:4] in (b"\x89PNG", b"%PDF", b"II*\x00", b"MM\x00*")
            or data[:12] == b"\x00\x00\x00\x0cjP  \r\n\x87\n")


def og_image(data, base):
    text = data[:400000].decode("utf-8", "ignore")
    m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)', text, re.I) or \
        re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image', text, re.I)
    return urllib.parse.urljoin(base, html.unescape(m.group(1))) if m else None


def open_image(data):
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    im = Image.open(io.BytesIO(data))
    im.load()
    return im


def reencode(data, ext):
    """Convert jp2/tiff (and anything huge) to a sane JPEG/PNG, long edge <= MAX_EDGE."""
    if ext not in (".jp2", ".tif", ".tiff") and len(data) <= CONVERT_OVER:
        return data, ext
    im = open_image(data)
    if max(im.size) > MAX_EDGE:
        im.thumbnail((MAX_EDGE, MAX_EDGE))
    buf = io.BytesIO()
    if im.mode in ("RGBA", "LA", "P") and ext != ".jp2":
        im.save(buf, "PNG", optimize=True)
        return buf.getvalue(), ".png"
    if im.mode not in ("RGB", "L"):
        im = im.convert("RGB")
    im.save(buf, "JPEG", quality=92, optimize=True)
    return buf.getvalue(), ".jpg"


def preview(data, path):
    try:
        im = open_image(data)
        im.thumbnail((1280, 1280))
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        im.save(path, "JPEG", quality=80)
        return True
    except Exception:
        return False


def fetch_one(asset, store):
    r = resolve(asset)
    cands = [r["url"]] + list(r.get("alts") or []) + ([r["fallback"]] if r.get("fallback") else [])
    data, ctype, url, err = None, "", r["url"], None
    html_page = None
    for c in cands:
        try:
            d, t, u = http_get(c)
        except FetchError as e:
            err = e
            if "HTTP 429" in str(e):
                break  # rate-limited: trying more urls on the same host only makes it worse
            continue
        if is_media(t, d):
            data, ctype, url = d, t, u
            break
        html_page = html_page or (d, t, u)
        err = FetchError(f"link returned a web page, not a file ('{t}')")
    if data is None and r.get("then") and "HTTP 429" not in str(err):
        r2 = resolve_loc(r["then"])
        r = {**r, **{k: v for k, v in r2.items() if v}}
        for c in [r2["url"]] + list(r2.get("alts") or []):
            try:
                d, t, u = http_get(c)
            except FetchError as e:
                err = e
                continue
            if is_media(t, d):
                data, ctype, url = d, t, u
                break
    if data is None and html_page:
        data, ctype, url = html_page
    if data is None:
        raise err
    if not is_media(ctype, data):
        if ctype.startswith("text/html"):
            img = og_image(data, url)
            if not img:
                raise FetchError("page has no direct image (needs manual download)")
            data, ctype, url = http_get(img)
            if not is_media(ctype, data):
                raise FetchError("og:image link did not return a file")
        else:
            raise FetchError(f"unexpected content type '{ctype}'")
    ext = ext_for(ctype, url)
    if ext not in MEDIA_EXT.values() and ext not in (".jpeg", ".tiff"):
        ext = {b"\xff\xd8": ".jpg", b"\x89P": ".png", b"%P": ".pdf", b"II": ".tif", b"MM": ".tif"}.get(data[:2], ext)
        if data[:12] == b"\x00\x00\x00\x0cjP  \r\n\x87\n":
            ext = ".jp2"
    if ext in (".jp2", ".tif", ".tiff") or (ctype.startswith("image/") and len(data) > CONVERT_OVER):
        data, ext = reencode(data, ext)
    folder = FOLDERS.get(asset.get("category", ""), "archives/misc")
    name = asset.get("filename") or f"{asset['id']}_{slug(asset.get('description', ''))[:40]}"
    name = re.sub(r"\.[a-z0-9]{2,4}$", "", name) + ext
    rel = f"{folder}/{name}"
    os.makedirs(os.path.join(store, folder), exist_ok=True)
    with open(os.path.join(store, rel), "wb") as fh:
        fh.write(data)
    if ctype.startswith("image/") or ext in (".jpg", ".png"):
        os.makedirs(os.path.join(store, "_previews"), exist_ok=True)
        preview(data, os.path.join(store, "_previews", asset["id"] + ".jpg"))
    if r.get("ocr_url"):
        try:
            txt, _, _ = http_get(r["ocr_url"], limit=5 * 1024 * 1024)
            os.makedirs(os.path.join(store, "_research"), exist_ok=True)
            with open(os.path.join(store, "_research", asset["id"] + ".ocr.txt"), "wb") as fh:
                fh.write(txt)
        except FetchError:
            pass
    return {"file": rel, "resolved_url": url, "bytes": len(data),
            "license": asset.get("license") or r.get("license"),
            "attribution": asset.get("attribution") or r.get("attribution"),
            "page": r.get("page") or asset.get("source_page") or asset.get("url")}


# ---------------------------------------------------------------- main
def main():
    project_dir, store = sys.argv[1], sys.argv[2]
    manifest = json.load(open(os.path.join(project_dir, "manifest.json"), encoding="utf-8"))
    lock_path = os.path.join(store, "manifest.lock.json")
    old = {}
    if os.path.exists(lock_path):
        old = {a["id"]: a for a in json.load(open(lock_path, encoding="utf-8")).get("assets", [])}
    ids = [a.get("id") for a in manifest["assets"]]
    dupes = {i for i in ids if ids.count(i) > 1}
    if None in ids or dupes:
        sys.exit(f"manifest error: every asset needs a unique id (duplicates: {sorted(map(str, dupes))})")

    results = []
    for a in manifest["assets"]:
        prev = old.get(a["id"], {})
        same_source = all(prev.get(k) == a.get(k) for k in ("url", "source_page", "file"))
        if prev.get("status") == "downloaded" and same_source and os.path.exists(os.path.join(store, prev.get("file", ""))):
            results.append({**a, **{k: prev[k] for k in ("status", "file", "resolved_url", "bytes", "license", "attribution", "page") if k in prev}})
            print(f"= {a['id']} already in store")
            continue
        # files downloaded by hand are dropped into <store>/_manual/<id>.<ext>
        mdir = os.path.join(store, "_manual")
        hand = [f for f in (os.listdir(mdir) if os.path.isdir(mdir) else []) if os.path.splitext(f)[0] == a["id"]]
        if hand:
            src = os.path.join(mdir, hand[0])
            data = open(src, "rb").read()
            ext = os.path.splitext(hand[0])[1].lower()
            if ext in (".jp2", ".tif", ".tiff") or len(data) > CONVERT_OVER:
                try:
                    data, ext = reencode(data, ext)
                except Exception:
                    pass
            folder = FOLDERS.get(a.get("category", ""), "archives/misc")
            rel = f"{folder}/{a.get('filename') or a['id'] + '_' + slug(a.get('description', ''))[:40]}"
            rel = re.sub(r"\.[a-z0-9]{2,4}$", "", rel) + ext
            os.makedirs(os.path.join(store, folder), exist_ok=True)
            open(os.path.join(store, rel), "wb").write(data)
            os.makedirs(os.path.join(store, "_previews"), exist_ok=True)
            preview(data, os.path.join(store, "_previews", a["id"] + ".jpg"))
            results.append({**a, "status": "downloaded", "file": rel, "bytes": len(data), "resolved_url": "manual upload",
                            "page": a.get("source_page") or a.get("url")})
            print(f"+ {a['id']} -> {rel} (manual)")
            continue
        if a.get("manual"):
            results.append({**a, "status": "manual", "error": "marked manual in manifest"})
            print(f"~ {a['id']} manual")
            continue
        try:
            got = fetch_one(a, store)
            # source changed and the file name/extension moved: drop the stale copy
            for stale in (prev.get("file"),):
                if stale and stale != got["file"] and os.path.exists(os.path.join(store, stale)):
                    os.remove(os.path.join(store, stale))
            results.append({**a, **got, "status": "downloaded"})
            print(f"+ {a['id']} -> {got['file']} ({got['bytes'] // 1024} KB)")
        except Exception as e:  # keep going, report at the end
            results.append({**a, "status": "failed", "error": str(e)[:300]})
            print(f"! {a['id']} FAILED: {e}")

    json.dump({**manifest, "assets": results}, open(lock_path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    write_report(manifest, results, store)
    write_credits(manifest, results, store)
    ok = sum(r["status"] == "downloaded" for r in results)
    print(f"\n{ok}/{len(results)} assets in store")


def write_report(manifest, results, store):
    ok = [r for r in results if r["status"] == "downloaded"]
    bad = [r for r in results if r["status"] != "downloaded"]
    L = [f"# Asset report: {manifest.get('title', manifest.get('project', ''))}", "",
         f"**{len(ok)} downloaded, {len(bad)} need attention** (of {len(results)})", ""]
    if bad:
        L += ["## Download these by hand", "",
              "Open each link, download the highest-resolution version, and send it back with its ID.", "",
              "| ID | Scene | What | Link | Why it failed |", "|---|---|---|---|---|"]
        for r in bad:
            link = r.get("source_page") or r.get("url") or ""
            L.append(f"| {r['id']} | {r.get('scene', '')} | {r.get('description', '')} | {link} | {r.get('error', '')} |")
        L.append("")
    L += ["## In the store", "", "| ID | Scene | File | Licence | Authenticity |", "|---|---|---|---|---|"]
    for r in ok:
        L.append(f"| {r['id']} | {r.get('scene', '')} | `{r['file']}` | {r.get('license') or 'CHECK'} | {r.get('authenticity', 'authentic')} |")
    unchecked = [r["id"] for r in ok if not r.get("license")]
    if unchecked:
        L += ["", f"**Licence not confirmed automatically:** {', '.join(unchecked)}. Check before publishing."]
    open(os.path.join(store, "REPORT.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")


def write_credits(manifest, results, store):
    L = [f"# Credits: {manifest.get('title', '')}", "", "Archival material used in this video:", ""]
    for r in sorted((r for r in results if r["status"] == "downloaded"), key=lambda r: (r.get("scene") or 0, r["id"])):
        tag = "" if r.get("authenticity", "authentic") == "authentic" else f" [{r['authenticity']}]"
        bits = [r.get("description", r["id"]) + tag, r.get("attribution"), r.get("license"), r.get("page")]
        L.append("- " + " | ".join(b for b in bits if b))
    open(os.path.join(store, "CREDITS.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")


if __name__ == "__main__":
    main()
