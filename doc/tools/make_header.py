"""Build documentaries/<p>/_header.js for the DAGAR UNFILTERED (DOCX) style.
usage: python doc/tools/make_header.py <project> --assets <assets project> [--vertical] [--no-mascot]
 - clip frame sequences found in documentaries/<assets>/assets/archives/{user,footage}/<key>_f<i>.jpg are mapped as EP.images (CLIPN counts)
 - catch_vid_<seg>_<i>.jpg / ift1_vid_<seg>_<i>.jpg (fetch 'clips' output) are mapped as c_<seg>_f<i> / i_<seg>_f<i>
 - optional documentaries/<p>/bites.json: {"<key>": {"src": "file.m4a", "off": s, "d": s, "words": [[w, s, e], ...]}} (soundbites)
 - kits pasted in order: veritrix_kit, cinema3d_kit, docx_kit, mascot_kit (Dagu), dagar_extras
"""
import json, os, re, sys, argparse
ap = argparse.ArgumentParser(); ap.add_argument('project'); ap.add_argument('--assets', required=True); ap.add_argument('--vertical', action='store_true'); ap.add_argument('--no-mascot', action='store_true')
a = ap.parse_args(); R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = f'{R}/documentaries/{a.project}'; AD = f'{R}/documentaries/{a.assets}/assets'
counts, cv = {}, {}
for sub in ('user', 'footage'):
    d = f'{AD}/archives/{sub}'
    if not os.path.isdir(d): continue
    for f in os.listdir(d):
        m = re.match(r'(.+)_f(\d+)\.jpg$', f)
        if m: counts.setdefault(sub, {}); counts[sub][m.group(1)] = max(counts[sub].get(m.group(1), 0), int(m.group(2)) + 1)
        m = re.match(r'(catch_vid|ift1_vid)_([a-z0-9]+)_(\d+)\.jpg$', f)
        if m and sub == 'footage':
            k = ('c_' if m.group(1) == 'catch_vid' else 'i_') + m.group(2); cv[k] = (m.group(1) + '_' + m.group(2), max(cv.get(k, ('', 0))[1], int(m.group(3)) + 1))
bites = json.load(open(f'{P}/bites.json')) if os.path.exists(f'{P}/bites.json') else {}
allc = {**counts.get('footage', {}), **counts.get('user', {})}
h = ["'use strict';",
     "const EP = { brand: 'DAGAR UNFILTERED', images: {}, credit: {}, scenes, bleep: ['shit', 'fuck'], capScale: " + ('.046' if a.vertical else '.042') + f", assetsProject: '{a.assets}' }};",
     "const C = {};", "const credit = (k, extra) => { const c = cr(k); return c ? (extra ? extra + ' · ' : '') + c : (extra || ''); };",
     f"const CLIPN = {json.dumps(allc)};",
     f"const CLIPDIR = {json.dumps({k: sub for sub in counts for k in counts[sub]})};",
     "for (const k in CLIPN) for (let i = 0; i < CLIPN[k]; i++) EP.images[k + '_f' + i] = 'archives/' + CLIPDIR[k] + '/' + k + '_f' + i + '.jpg';",
     f"const CLIPV = {json.dumps(cv)};",
     "for (const k in CLIPV) { CLIPN[k] = CLIPV[k][1]; for (let i = 0; i < CLIPV[k][1]; i++) EP.images[k + '_f' + i] = 'archives/footage/' + CLIPV[k][0] + '_' + i + '.jpg'; }",
     f"const BITES = {json.dumps(bites)};"]
kits = ['veritrix_kit.js', 'cinema3d_kit.js', 'docx_kit.js'] + ([] if a.no_mascot else ['mascot_kit.js']) + ['dagar_extras.js', 'broll_kit.js']
body = ''.join(open(f'{R}/doc/snippets/{k}').read() + '\n' for k in kits)
open(f'{P}/_header.js', 'w').write('\n'.join(h) + '\n' + body)
print('wrote', f'{P}/_header.js', '| clips:', len(allc) + len(cv), '| bites:', len(bites))
