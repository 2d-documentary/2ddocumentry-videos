# 2ddocumentry-videos

## INK AND ANTIQUITY: archival asset pipeline

Archival photos, newspapers, maps and documents are downloaded **on GitHub**, not on a local machine.

1. Each documentary gets a folder `documentaries/<project>/` with a `manifest.json` (see `documentaries/_template/`).
2. Pushing a manifest to `main` runs **fetch-assets** automatically. You can also start it from *Actions → fetch-assets → Run workflow* with the project name.
3. Downloads land on the branch **`assets-<project>`**, which keeps `main` light:
   - `archives/newspapers`, `archives/historical-photos`, `archives/documents`, `archives/maps`, `archives/paintings`, `archives/artefacts`, `archives/footage`
   - `illustrations`, `generated-assets`, `audio`
   - `_previews/` holds small JPEGs for quick review, and `_research/` holds newspaper OCR text
   - `REPORT.md` lists what downloaded and what failed, with the link to fetch failed items by hand
   - `CREDITS.md` is an attribution list ready for the video description
4. **Hand-downloaded files:** put them in `_manual/<asset-id>.<ext>` on the `assets-<project>` branch and re-run the workflow. They are filed into the right folder automatically.

Supported sources: Wikimedia Commons, Library of Congress (loc.gov, Chronicling America), Internet Archive, direct file links, and pages with an `og:image`.
Use only public-domain or openly licensed material. Mark anything that is not authentic with `"authenticity": "reconstruction"` or `"ai-generated"`.
