"""Build an episode scenes.js from a small header, the shared snippets and your shots.
usage: python doc/tools/assemble_scenes.py documentaries/<ep> [--props] [--short] [--kinetic]
reads  documentaries/<ep>/_header.js and documentaries/<ep>/_shots.js, writes documentaries/<ep>/scenes.js
  _header.js : 'use strict'; EP = {...}; C = {...}; credit(); PLACES (if maps); CX = 540 (Shorts)
  _shots.js  : function scenes() { shot(...); cue(...); ... }   (Shorts: call finish() at the end)"""
import sys, os
ep = sys.argv[1]; root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sn = lambda f: open(os.path.join(root, 'doc', 'snippets', f), encoding='utf-8').read()
parts = [open(os.path.join(ep, '_header.js'), encoding='utf-8').read(), sn('editorial_helpers.js')]
if '--props' in sys.argv or '--short' in sys.argv: parts.append(sn('props.js'))
if '--short' in sys.argv: parts.append(sn('shorts_common.js'))
if '--kinetic' in sys.argv: parts.append(sn('kinetic.js'))  # fast-cut cinematic style (call kfinish())
if '--ae' in sys.argv: parts.append(sn('ae.js'))  # After-Effects-like toolkit: parallax cut-outs, 3D camera, per-letter text, mattes
parts.append(open(os.path.join(ep, '_shots.js'), encoding='utf-8').read())
open(os.path.join(ep, 'scenes.js'), 'w', encoding='utf-8').write('\n'.join(parts))
print('wrote', os.path.join(ep, 'scenes.js'))
