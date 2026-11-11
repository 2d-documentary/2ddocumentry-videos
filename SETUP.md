# DAGAR CLIPS render setup (Blender on GitHub Actions)

This branch contains the full render pipeline that made the DAGAR CLIPS videos: Blender (bpy 5.2.3, Cycles) runs on the free GitHub runners, one job per chunk of frames, then a join job adds voice and sound effects and encodes the final MP4. Nothing renders until you ask for it: `blender/evo/job.json` is set to `"mode": "idle"`.

## What is here
- `.github/workflows/render.yml`: the render workflow. It starts when `blender/evo/job.json` is pushed (branches `main` and `claude/render-setup`).
- `.github/actions/west-setup`: runner setup (Python 3.13, bpy 5.2.3, MPFB, CMU mocap clips, ffmpeg). It avoids apt when possible, so it does not hang on mirror outages.
- `.github/workflows/assets.yml` + `scripts/sketchfab.py`: search/download CC-BY / CC0 models from Sketchfab. Needs a repo secret `SKETCHFAB_TOKEN`.
- `blender/`: the scene code. It includes the ink-toon characters (`west/`, `pirate/`, `dagar/`), the Poly Haven environment helpers (`lib.py`), the city (`zombie/`), the house (`gta/`) and the realistic nature worlds (`evo/terra.py`, `evo/worlds.py`, `evo/creatures.py`).
- `scripts/kaggle_render.py`: optional GPU worker for Kaggle.

## How to render a video
Edit `blender/evo/job.json` and push. The modes are:
- `{"mode": "tasks", "tasks": [...]}`: test renders (world tests, stills).
- `{"mode": "stills", "only": "c01,c02"}`: one still per shot.
- `{"mode": "video", "only": "<shots>", "chunk": 24, "handle": 0.25, "w": 1920, "h": 1080, "samples": 32, "env": {"RW": "1920", "RH": "1080", "SAMPLES": "32", "ADAPT": ".02"}}`: the final frames. The join at the end writes `previews/evo/final_share.mp4`.
- `{"mode": "compose", "src_run": <run id>, "also_runs": [...], "also_repo_runs": ["owner/repo:run"]}`: join chunks rendered by earlier runs, including runs in another repo.
- `{"mode": "idle"}`: do nothing.

Limits on the free plan: 20 jobs at a time per account and at most 256 chunks per run, so split big videos into several pushes. Runners have 16 GB RAM; very heavy forests can run out of memory.

Assets: the dinosaur and animal `.glb` models of the evolution video are not copied here (300 MB). Download your own with the assets workflow, and keep `CREDITS.txt` for the YouTube description (CC-BY needs credit).
