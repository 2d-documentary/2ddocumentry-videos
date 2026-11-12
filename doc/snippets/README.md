# Shared scene snippets

`scenes.js` for a new episode = `_header.js` + snippets + `_shots.js`, assembled by:

    python doc/tools/assemble_scenes.py documentaries/<ep>            # full video (helpers only)
    python doc/tools/assemble_scenes.py documentaries/<ep> --props    # + drawn props
    python doc/tools/assemble_scenes.py documentaries/<ep> --short    # + props + Shorts helpers (brand, ctaShot, capBand, finish)

- `editorial_helpers.js`: stars/spaceBG, worldMap (needs geo_world.js), chapter cards, rocket, bigX/tick, pill, popIn, postCard, wrapText,
  money()/moneyCount, frame, snow, speedLines, cracks, boom, vign, camPhoto, hudRockets, sticky note, sinkIcon, bird, gauge, bowl, embers, shelf.
- `props.js`: btcCoin/coinRain, laptop + srScreen, onion, idCard, parcel, popcornTin, chatWin, forumPost, bars, shelves, diaryPage, sheet, gavel, shopMock, star, cashStack (uses IMG.bill100 + EP.billCrop).
- `shorts_common.js`: brand(), capBand(), ctaShot(id, title, line2), finish().

The header must define `EP`, `C`, `credit`, and `CX = 540` for Shorts; `PLACES` only if you use `mapAt`. Examples: documentaries/musk, documentaries/silkroad, documentaries/silkroad-s1..s4.
