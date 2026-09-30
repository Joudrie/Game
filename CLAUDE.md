# Working on this game (notes for the next Claude session)

A mobile-first third-person action game in three.js (GTA / Red Dead / Watch Dogs / Assassin's Creed feel, Lego Star Wars fun). Characters come from the owner's custom Lego figures and paintings. Read `CHANGELOG.md` (what exists, newest first), `BACKLOG.md` (what's next, in sections) and `ASSET_GUIDE.md` before starting.

## How the owner works
- **Push and merge everything.** Branch `claude/<topic>`, open a PR to `main`, merge it.
- **Update the play link after every change.** It's the claude.ai artifact https://claude.ai/artifact/E9adumTVxy2TBMT8bVxEfS. Publish `dist/index.html` to that URL; read it first in a new conversation.
- **Find, don't build.** Look for free public assets (GitHub, Printables, Sketchfab, OpenGameArt, Poly Pizza, Quaternius, KayKit) before writing code. Record each one in `CREDITS.md` and in a `SOURCE.txt` next to the file. Check the licence; never ship unlicensed files.
- **Variety.** Several variants of every animation, selectable in Menu → Moves and rotated in play.
- **Report problems back.** T-poses, freezes and stuck states are caught by the in-game watchdog and reported. Take reports the owner pastes seriously and fix the root cause.
- **Keep the docs current.** Add a `CHANGELOG.md` entry for every version (bump `BUILD` in `src/game2.html`), and keep `BACKLOG.md` in sections.
- **PC first (owner, v21).** Mouse and keyboard are the real platform. Phones only need to load the game and look right for a quick look (a friend opening a texted link): keep the layout working at 375 px, but new mechanics don't need full touch controls.

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
  - Main tests: test17 (enemies), test18 (combat), test23 (dual combos), test24 (The Second, skipped while shelved), test25 (performance), test26 (dismemberment), test27 (batch 1), test28 (guns), test19 (v14 feel), test20 (loot), test21 (inventory), test22 (reload), test9 (menus and gear).
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

## The owner's answers so far (v21)
- **PC first;** phone is a quick look only (see above).
- **Enemies can't hurt the player yet;** that comes later. It's still a testing sandbox.
- **Personal, played with friends,** maybe sold one day. Fan-made Star Wars assets are acceptable for now, but keep them swappable. If it's ever sold, the sabers can become **plasma blades from the owner's book *Wake***.
- **Co-op someday, duo PvE;** no PvP.
- **The city comes later,** once it's scoped.
- **Inspiration sources the owner owns:** the book *Wake* (`github.com/Joudrie/wake`: 299 encyclopedia entries covering weapons, places, factions and tech) and the Lego collection (`github.com/Joudrie/lego`: 816 figures with lore in `SUMMARY.md`). Use them when choosing weapons, enemies and places.

- **v22 answers:** the full list is under "Design answers" in `BACKLOG.md`. The essentials: dismemberment is the current focus; the saber kills on touch; no enemy health bars, ever; the Jedi movement class comes first.

## Where things stand (v22)
- **Movement:** classes (light, Force, heavy), slides with momentum, infinite and double jumps, grapple (also onto enemies), jetpack (Mandalorian model), ground pound.
- **Combat:** five-hit saber combo, four dual-saber combos (Moves → Dual saber combo; left-hand hits are mirrored clips from `tools/bake_mirror.mjs`), fists combo, pistol with aim pitch, 12-round magazine, reload and dropped magazines, Force push, grenades, saber blocking bullets.
- **Dismemberment (v22):** `bladeCuts()` sweeps each lit blade frame to frame against the soldiers' body segments (`CUTS`). Head, torso and legs kill, severed there (`e.cut` → `goreOnDeath`); arms and hands come off and he lives (gun hand: `dropGun`, `e.unarmed`, flees). `updateBlood` handles stump spurts and splats. Test: test26.
- **Bone edits after the mixer (v23):** always go through `mixHero()`. It restores every bone to last frame's mixer output first, because three.js skips rewriting unchanged tracks and post-mix edits would otherwise pile up (the stuck-pistol bug).
- **Guns (v24):** the `GUNS` table (pistol, ak, shotgun, sniper: damage, rate, pellets, spread, zoom, sound, reload). `gunKind` and `G()` are the gun in hand; the `pistol` variable is its object in `guns`. Hotbar items carry `gun:`. Rifles in hand are placed by `holdRifle()` (stock at the shoulder, both hands by `ikArm`); the pistol uses the hand mount. Per-gun magazines are in `ammo.mags`.
- **Enemy fire (v24):** blaster bolts are projectiles (`shootBolt`/`updateBolts`): guard covers front and sides, a block within 0.3 s of arrival parries, and `guardLoad` > 8 breaks the guard. AK soldiers fire bullet bursts (`enemyBullet`). Sounds: `sfx(name, at)`, clips in `build/sfx` from `tools/make_sfx.sh`. The build is 15.67 MB, so there's very little room left under 16 MB.
- **Enemies:** five soldiers with deaths by cause (head, torso, legs, explosion, push, wall impact, grapple, pound), always-on dismemberment, bodies that can be moved, looting.
- **Items:** hotbar (5 slots, scroll or 1–5) and inventory (drag or tap), saved in localStorage.
- **Enemies (v21):** SWAT officers, `build/enemy_swat.glb` from `node tools/reskin_swat.mjs` (maps the Quaternius SWAT onto the hero skeleton, one vertex-coloured mesh), embedded as `enemy`. Tests → Performance shows the cost and sets the soldier count; `tools/test25-perf.mjs` measures it.
- **Player character:** the Superhero. The Second (v20) is shelved and not embedded, made from the owner's turnarounds in `assets/characters/the-second/`. Pipeline: Hunyuan3D-2mv Space `/shape_generation` (the `/generation_all` texture step failed with a PyMeshLab error) → `python3 tools/bake_the_second.py <shape.glb> 20000` → `node tools/rig_the_second.mjs` (needs the dist server; weights use a reach-through-the-body test, see v20.1) → check with `node tools/posesheet_second.mjs out.png front|side` → `build/the_second_rigged.glb`, embedded by `build2.py` as `second`. Soldiers still use `hero.glb`. The build is about 15.9 MB against the 16 MB artifact cap, so keep new embedded assets small.
- **Look:** sand ground, pale blue sky, grey boxes, grid always on.
- **Next:** follow the **Roadmap** at the top of `BACKLOG.md`, batch by batch (Batch 1 first). The owner's asks: better assets through the new credentials, The Second as a 3D character, free replacements for the IK draw/holster and more combos (Mixamo is unavailable).
- **Sketchfab:** in v19 the API returned `202` with an AWS WAF bot challenge for every request from the container. Don't try to get around it; ask the owner to download models by hand if needed.
