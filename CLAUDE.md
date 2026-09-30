# Working on this game (notes for the next Claude session)

A mobile-first third-person action game in three.js (GTA / Red Dead / Watch Dogs / Assassin's Creed feel, Lego Star Wars fun). Characters come from the owner's custom Lego figures and paintings. Read `CHANGELOG.md` (what exists, newest first), `BACKLOG.md` (what's next, in sections) and `ASSET_GUIDE.md` before starting.

## How the owner works
- **Push and merge everything.** Branch `claude/<topic>`, open a PR to `main`, merge it.
- **Update the play link after every change.** It's the claude.ai artifact https://claude.ai/artifact/E9adumTVxy2TBMT8bVxEfS. Publish `dist/index.html` to that URL; read it first in a new conversation.
- **Find, don't build.** Look for free public assets (GitHub, Printables, Sketchfab, OpenGameArt, Poly Pizza, Quaternius, KayKit) before writing code. Record each one in `CREDITS.md` and in a `SOURCE.txt` next to the file. Check the licence; never ship unlicensed files.
- **Variety.** Several variants of every animation, selectable in Menu → Moves and rotated in play.
- **Report problems back.** T-poses, freezes and stuck states are caught by the in-game watchdog and reported. Take reports the owner pastes seriously and fix the root cause.
- **Keep the docs current.** Add a `CHANGELOG.md` entry for every version (bump `BUILD` in `src/game2.html`), and keep `BACKLOG.md` in sections.
- **Mobile first.** Every feature needs a touch control, and the layout has to work at 375 px.

## Build and test
- **Game source:** `src/game2.html`, a single file with the module script inside. `python3 tools/build2.py` embeds the models, animations and the jetpack OBJ from `build/` and `assets/`, and writes:
  - `dist/index.html`, for the artifact
  - `dist/preview2.html`, for local tests, which loads three.js from `/three/`
- **Setup:**
  1. `npm install`
  2. `mkdir -p dist/three && cp -r node_modules/three/build node_modules/three/examples dist/three/`
  3. Serve with `python3 -m http.server 8766 --bind 127.0.0.1 --directory dist`, run in the background with a long timeout.
- **Tests:** `node tools/testNN-*.mjs` (Playwright, Chromium at `/opt/pw-browsers/chromium` with swiftshader flags; see any test).
  - Headless runs at about 8 fps, so use the `__game.advance(seconds)` hook instead of real waits.
  - Test hooks live on `window.__game`: `setGear`, `selectSlot`, `fillEnemies`, `moveEnemy`, `damageEnemy`, `shootAt`, `setKey`, `advance`, `startLoot`, `startReload`…
  - Main tests: test17 (enemies), test18 (combat), test23 (dual combos), test19 (v14 feel), test20 (loot), test21 (inventory), test22 (reload), test9 (menus and gear).
  - `tools/sheet17.mjs` makes animation contact sheets. Use them to check clips by eye before adding them.
- **Animation pipeline:** everything is retargeted onto the UE5-mannequin skeleton of the Quaternius Superhero.
  - `tools/retarget.mjs`: `retarget` for sources with a T-pose; `retargetDir` for rigs that don't have one.
  - Bake scripts: `tools/bake_*.mjs` (Mixamo names: `mixamoMap('mixamorig')`; CMU BVH; KayKit).
  - Output clips go into `build/extra.json` (`clips` + `library`).
  - Run `python3 tools/trim_snap.py build/extra.json` after adding one-shot clips; it removes the snap-back last frame.
  - `tools/pack.mjs` repacks the Quaternius UAL libraries (the `KEEP` lists).
  - Some scripts have `/home/user/game` hard-coded as the path; adjust if the clone lives elsewhere.

## Credentials in the environment
These are added as **API credentials** in the cloud environment. The proxy injects the header; the token is never visible. Don't ask for tokens in chat.

- **Sketchfab** (`api.sketchfab.com`, `Authorization: Token …`)
  - Search: `GET https://api.sketchfab.com/v3/search?type=models&q=<words>&downloadable=true&license=cc0|by`
  - Download: `GET https://api.sketchfab.com/v3/models/<uid>/download` returns signed `glb`/`gltf` URLs, which need no auth.
  - Check each model's licence and author, and credit it. Skip models ripped from commercial games (for example "Fortnite rip").
- **Hugging Face** (`huggingface.co`, `*.hf.space`, `Authorization: Bearer …`)
  - Use it to turn the owner's paintings into 3D. Image-to-3D Spaces include `microsoft/TRELLIS`, `tencent/Hunyuan3D-2` and `stabilityai/TripoSR`; call them with `gradio_client`.
  - First character: **The Second**. The front, side and back turnaround images are in the owner's earlier chat; ask them to add the images to `assets/characters/the-second/` if they aren't in the repo.
- **Mixamo** (`www.mixamo.com`, `Authorization: Bearer <localStorage.access_token>`). This API is **unofficial** and the token **expires after about a day**. **As of v19 the owner can't sign in to Mixamo at all** (account pages are broken), so every authorized call returns 401. Search and product details still work without auth. Don't plan around Mixamo; look for free sources instead. `tools/mixamo_fetch.mjs` does the whole export if a token ever works.
  - Also send `X-Api-Key: mixamo2`. Search works without auth: `GET /api/v1/products?page=1&limit=48&type=Motion%2CMotionPack&query=<words>`.
  - Export flow, as the site does it (unverified here):
    1. `GET /api/v1/products/<id>?similar=0&character_id=<char>` for `details.gms_hash`
    2. `POST /api/v1/animations/export` with `{character_id, product_name, type:'Motion', preferences:{format:'fbx7_2019', skin:'false', fps:'30', reducekf:'0'}, gms_hash:[…]}`
    3. Poll `GET /api/v1/characters/<char>/monitor` until `status: 'completed'`; `job_result` is the download URL.
    4. Get the owner's default character id from `GET /api/v1/characters/primary`.
  - Convert the FBX, for example with the `fbx2gltf` npm binary, then bake with `mixamoMap('mixamorig')`.
  - Wanted clips: see `ASSET_GUIDE.md` (sword draw and sheath, sword and dual combos, pistol locomotion, rifle pack, deaths by cause, slides, flips, flying).

## Where things stand (v19)
- **Movement:** classes (light, Force, heavy), slides with momentum, infinite and double jumps, grapple (also onto enemies), jetpack (Mandalorian model), ground pound.
- **Combat:** five-hit saber combo, four dual-saber combos (Moves → Dual saber combo; left-hand hits are mirrored clips from `tools/bake_mirror.mjs`), fists combo, pistol with aim pitch, 12-round magazine, reload and dropped magazines, Force push, grenades, saber blocking bullets.
- **Enemies:** five soldiers with deaths by cause (head, torso, legs, explosion, push, wall impact, grapple, pound), always-on dismemberment, bodies that can be moved, looting.
- **Items:** hotbar (5 slots, scroll or 1–5) and inventory (drag or tap), saved in localStorage.
- **Look:** sand ground, pale blue sky, grey boxes, grid always on.
- **Next:** see `BACKLOG.md`. The owner's asks: better assets through the new credentials, The Second as a 3D character, free replacements for the IK draw/holster and more combos (Mixamo is unavailable).
- **Sketchfab:** in v19 the API returned `202` with an AWS WAF bot challenge for every request from the container. Don't try to get around it; ask the owner to download models by hand if needed.
