# Full play-test audit: the prompt

Paste everything below the line into a fresh Claude Code session on `Joudrie/Game`. It tests and reports only; it changes no game code.

---

You are a senior gameplay engineer and QA lead with fifteen years of shipping third-person action games: saber combat like *Star Wars Jedi: Survivor*, cover shooters like *Red Dead Redemption 2* and *Modern Warfare*, stealth like *Metal Gear Solid*, and sandbox chaos like *Lego Star Wars* and *Helldivers*. You have been brought in to **audit this game before any more features are built.** Your job is to find everything that is broken, missing, ugly or not fun, and to grade every feature honestly.

**You are a tester, not a builder. Do not change the game code.**
- Don't edit `src/game2.html`, `tools/build2.py`, or anything under `build/` or `assets/`.
- You may write new test scripts under `tools/audit/` and the report files described below. Nothing else.
- Stop and report what you found. The owner decides what gets fixed.

## 1. Know the game before you touch it

Read these first:
- `CLAUDE.md`
- `CHANGELOG.md`, newest first: what each version claims to do
- `BACKLOG.md`, especially the owner's play-test lists and "Design answers"
- `IDEAS.md`: which games the owner wants this to feel like
- `CREDITS.md`

Then skim `src/game2.html` until you know:
- the controls (the `keydown` handler, the help panel, Menu → Moves and the Tab weapon panel)
- the items (`ITEMS`), guns (`GUNS`) and throwables (`NADES`)
- the special enemies (`makeSpecial`) and the missions (`MISSIONS`)
- the test hooks on `window.__game`

**Every claim in the CHANGELOG is something to verify, not something to believe.**

The owner's context:
- **PC first.** Mouse and keyboard are the real platform. Phones only need to load the game and look right at 375 px for a quick look.
- **The player is invincible by default** (the Invincible difficulty). Test the damage levels too, but don't report invincibility itself as a bug.
- **It's a sandbox for friends,** made fun first: "simple but plentiful".
- **Things the owner said never to do:**
  - enemy health bars
  - bullet-sponge enemies
  - assets ripped from commercial games
- **Things the owner loves:**
  - the grappling hook
  - the saber glow
  - the saber cutting whoever walks into it
  - the triple jump
  - juggernauts and the duellist
  - the courtyard
  - the Force pull

## 2. Set up

1. Run these:
   ```
   npm install
   mkdir -p dist/three && cp -r node_modules/three/build node_modules/three/examples dist/three/
   python3 tools/build2.py
   ```
2. Serve `dist/` with `tools/serve.sh <command>`, or a background `python3 -m http.server 8766 --bind 127.0.0.1 --directory dist` with a long timeout.
3. Use Playwright with Chromium at `/opt/pw-browsers/chromium`, with the swiftshader flags from any `tools/testNN-*.mjs`. Test against `http://127.0.0.1:8766/preview2.html`.
4. Run the existing suites once (test9, test17–23 and test26–36) and record which pass. A failing suite is your first finding.

Two ways to drive the game. **Use both:**
- **Real input.** Use `page.keyboard`, `page.mouse` (move, down, up, wheel) and clicks on the HUD buttons. This is how a player plays, and it's how you find bugs the hooks hide.
  - Click the canvas first for focus.
  - Note where pointer lock or headless limits stop you.
- **Hooks** (`__game.advance(sec)`, `place`, `look`, `setKey`, `selectSlot`, `fillEnemies`, `moveEnemy`, `setMind`, `spawnSpecial`, `startMission` …). Use them to set up a situation exactly and to run time quickly.
  - Headless runs at about 8 fps. **Always** step time with `advance()`, never with real waits.
  - Real-time waits will make everything look broken. They also set off the freeze watchdog.

**Evidence:**
- Take a screenshot at every interesting moment, especially every bug. Save them to `audit/shots/NN-short-name.png`.
- Read your own screenshots back and look at them like an art director: poses, clipping, T-poses, floating objects, Z-fighting, unreadable HUD.
- Keep the console log and page errors, and collect every report the in-game watchdog raises (freeze, T-pose, stuck state). The `#alert` panel and the report log both count.

## 3. Test everything: the coverage list

Work through every row. For each one:
1. Do the normal case.
2. Then try the edge cases.
3. Then try to break it.

### 3a. Every control, alone and in every state
The keys are WASD, Shift, Space, C, V, E, R, T, X, G, Q, F, Z, B, H, I, M, Y, Tab, Esc, Enter, 1–6, the scroll wheel, Shift+scroll, left click and right click (held and tapped).

Press each one in each of these states:
- standing, walking, sprinting, crouching, sneaking
- sliding
- jumping: first, second and third jump
- falling from height, on the jetpack, hovering
- grappling (pulling, swinging)
- wall running
- in cover (peeking, at an edge, low cover)
- mid saber swing, blocking, during a dash strike
- reloading, aiming, scoped
- throwing (during the wind-up), during a takedown
- choking, zapping or pulling with the Force, during a saber throw
- while the inventory, the Menu or the weapon panel is open
- dead, during a mission, in the mission-complete screen

For each one, record:
- Does it do what the help text says?
- Does anything else happen?
- Does it leave the character stuck in a pose?

### 3b. Combinations and sequences (the bug hunt)
Mash these and run them back to back. Every one is a known source of stuck states in games like this:
- **Switching items while busy.** Switch hotbar items (scroll fast and 1–6 fast) during: a reload, a swing, a throw wind-up, a grapple, a choke, cover, an aim or a scope.
- **Jump into everything.** Jump while you slide, reload, block, take cover, take down, and hold a choke.
- **Cancel the grapple.** Grapple, then slide, jump, throw, teleport, and use the jetpack mid-pull and mid-swing.
- **Leave cover.** Leave cover by every route: jump, sprint, grapple, switching items, an explosion nearby.
- **The teleport orb.** Teleport into walls, onto roofs, under buildings, mid-fall, mid-grapple, and next to soldiers.
- **Fire.** Pick up, drop, loot and throw while enemies burn. Stand in fire.
- **Inventory and menus.**
  - Open and close them during combat. Drag items while moving. Open the Menu during a mission.
  - Fill the backpack and then loot. Remove the active item. Empty all your grenades and keep pressing X.
- **Reload.**
  - Reload with no ammo. Reload a full magazine.
  - Switch guns mid-reload and switch back. Drop a gun mid-reload.
- **Dying (pick a damage difficulty for this) and respawning** in every one of the states above.
- **Missions.**
  - Start a mission while airborne, in cover or mid-grapple.
  - Quit one halfway. Reload the page mid-mission (is the sandbox inventory restored?).
- **Hold several keys at once:** W+A+Shift+C+Space; right-click plus left-click spam; R plus T plus X together.
- **Press a key for a single frame,** and hold one for 30 seconds.
- **Alt-tab and refocus.** Blur and refocus the window while keys are held, then check whether keys get stuck.
- **Resize the window** mid-game, from 1920×1080 down to 375×667, and back.

### 3c. Every system
For every feature below, check that it **works, looks right, sounds right, feels right, and can't be broken:**

- **Movement:**
  - walk, jog, sprint, crouch, sneak (V)
  - slide (momentum), double and triple jump, air control
  - wall run and wall kick, ground pound
  - fall damage and the blue berry
  - jetpack, hover
  - classes (light, Force, heavy)
- **Camera:**
  - shoulder swap (B), zoom, the rifle camera offset, the scope
  - collision with buildings, and the camera when dead
- **Saber:**
  - the combo and its variants (Moves), the heavy combo, the four dual combos
  - block, parry, guard break, the draw and holster (E)
  - glow and trail, scorch and sparks on the world, hum and swing sounds
  - dash strike, saber throw
- **Dismemberment:**
  - head, torso and legs cut by saber, sniper and grenade
  - arms off while he keeps fighting, re-arming with the other hand, crawling after a leg cut
  - blood placement (it should be at the cut, never all over), pieces on the ground
- **The Force:**
  - push (T), pull, choke (including walking up to strike him), lightning
  - the target marker
- **Saber + blaster:** left click blaster, right click saber, overheat after 6 shots.
- **Guns:**
  - pistol, AK-47, M4, shotgun, sniper
  - aim, recoil, spread, damage by zone, quickscope
  - reload with the gun staying in both hands, dropped magazines, ammo types
  - attachments (suppressor, scope), picking guns up off the ground
- **Throwables:**
  - frag, sticky (including stuck on a shield), fire grenade (freezes? lag?), teleport orb
  - the throw arc and wind-up, X quick throw
- **Gadgets and items:**
  - grapple (ground, air, onto soldiers, yank with right-click, swing)
  - holocloak and its timer, blue berry and its aura
  - stim, ration bar, kyber shard
  - Pistol + energy shield (front blocks, drain, recharge, down for 5 s)
  - items that do nothing must not be held
- **Enemies:**
  - patrol, noticing (?, then !), the alarm shout, panic at witnessed deaths, hearing noise, combat with line of sight
  - aiming at you, varied weapons, four uniforms
  - deaths by cause, the ragdoll, shoving bodies, looting bodies, corpse fade
- **Special enemies:**
  - juggernaut (three swings, sticky kills)
  - shield soldier (front-only; the stance; grapple bounces)
  - duellist (blocks, parries, cuts your grapple rope)
- **Stealth:** takedowns from behind, finishers, cover and peeking, blind fire, sneak, suppressor noise.
- **The world:**
  - the courtyard (stone, wood, glass and crates breaking; debris; the deadly ledge)
  - Kenney buildings (are the hidden collision boxes right? can you walk into a building, get stuck in one, or see through one?)
  - trees, rocks, grass, the path, clouds
  - grapple and wall run on the new buildings
- **Missions:**
  - Mission 1 (waves), Mission 2 (survival), Mission 3 (stealth infiltration)
  - kept rewards, quitting, failing, replaying
- **UI:**
  - HUD, hotbar, inventory (drag and tap), the creative catalogue, the weapon panel
  - Menu → Moves / Library / Tests, builds (Default, Speed, Silly)
  - toasts, the kill feed, health bar, ammo counter, effect timers, mission HUD, death panel
  - the watchdog's "Copy report"
  - the phone layout at 375 px
- **Performance:**
  - Tests → Performance, the soldier count at 5, 10 and 20, fps and frame time (`renderer.info`, draw calls)
  - load time, the time to first frame
  - freezes when something appears for the first time (shader compiles: grenades, fire, blood, sparks, the first enemy of each kind)
  - memory over a 10-minute session of `advance()` with constant combat (do corpses, bullet holes, debris, scorch marks and particles get cleaned up?)
  - build size against the 16 MB cap
- **Persistence:** reload the page after changing the inventory, builds, favourites, attachments, settings and difficulty. Does everything come back? Clear localStorage and check the first-run experience.

### 3d. Try to break it on purpose
Think like a speedrunner and like a 12-year-old friend of the owner. For example:
- get out of the map; climb onto or into every building; fall through the ground
- grapple to the sky; jetpack forever
- teleport into geometry; get stuck in cover forever
- stack 20 soldiers on one spot; throw 50 grenades at once
- kill everyone mid-mission-wave; kill the objective soldier before he spawns his alarm
- cut a soldier during a takedown; choke a juggernaut
- yank a duellist; shoot your own sticky in the air
- run a long session and check for memory growth

For every break, record the exact steps and whether it reproduces.

## 4. Score every feature

Grade every feature in 3c, and every control in 3a, from **1 to 10** on each of these:

| Axis | Question |
|---|---|
| **Works** | Does it do what it says, every time, in every state? |
| **Feel** | Responsiveness, weight, timing, animation quality: does it feel like the game it's inspired by? |
| **Looks and sounds** | Poses, clipping, effects, audio, readability |
| **Robustness** | Can it be broken, stuck or exploited? Does it recover? |
| **Fun** | Would the owner's friends do it again on purpose? |

Give each feature an **overall score** (your judgement, not just the average) and a **tier:**
- **S:** 9–10, ship it
- **A:** 7–8, good, with polish needed
- **B:** 5–6, works but feels off
- **C:** 3–4, half-built or often broken
- **D:** 1–2, broken or missing

Be harsh and specific. A 9/10 means it would hold up next to the commercial game the owner compares it to. Back every score with evidence (a screenshot or a measured number).

**For every feature scored below 9, write how to get it to 9:**
- **What's wrong:** concrete, observed.
- **The likely root cause:** point to the function or line in `src/game2.html` if you can.
- **The fix:**
  - Prefer the owner's rule, *find, don't build*: name free, properly licensed assets that would solve it (Quaternius, Kenney, KayKit, Poly Pizza, OpenGameArt, CC0 or CC-BY), with links and their licence.
  - Mixamo is unavailable.
  - Sketchfab's API is blocked from the container.
- **Effort:** small (under an hour), medium (a session), large (several sessions).
- **What the player gains.**

## 5. Bug list

Write every problem as one entry:

```
ID: BUG-###
Title: short and specific
Severity: Blocker (crash, can't continue) / Critical (stuck state, T-pose, freeze, lost progress) / Major (feature broken or very wrong) / Minor (cosmetic, or rare) / Polish
Area: movement / saber / guns / Force / enemies / world / UI / missions / performance / persistence
Steps to reproduce: numbered, exact (keys, timings, hooks used)
Expected: …
Actual: …
Reproduces: x out of y tries
Evidence: audit/shots/…png, console lines, watchdog report text
Suspected cause: function name / line, if known
Suggested fix: …
```

Also list:
- **Missing features:** things a player would expect from this kind of game and that the owner's references (`IDEAS.md`) do, but that aren't here at all.
- **CHANGELOG claims that turned out false.**

## 6. Deliverables

1. **`audit/REPORT.md`** with:
   - **Summary:** the overall grade for the game, the five biggest problems, and the five best things.
   - **Scorecard:** one table with every feature, its five axis scores, the overall score and the tier, sorted worst first.
   - **Bug list:** every BUG entry, sorted by severity.
   - **Fixes for everything under 9:** grouped into batches the owner can approve one at a time (quick wins first, then the big ones), with effort estimates.
   - **Missing features** and **false CHANGELOG claims.**
   - **Performance numbers** (a table).
   - **Coverage:** what you could not test, and why (pointer lock, audio in headless, and so on), so the owner can check those by hand.
2. **`audit/shots/`**: the screenshots, named by number and referenced from the report.
3. **`tools/audit/`**: the scripts you used, so every bug can be reproduced with one command.
4. Commit everything on a `claude/audit-<date>` branch, open a PR and merge it (the owner's rule). Then publish the report as a claude.ai artifact (an HTML page with the scorecard, the bugs and the screenshots) and give the owner the link.
5. **End your reply with the top ten fixes** you'd do first, in order, each with a single sentence on why.

## 7. Rules for the audit

- **Don't fix anything,** even when the fix is one line. Write it down instead.
- **Don't trust a test that passes.** The existing suites use hooks that skip real input. Check the same thing by real input before you grade it.
- **Don't guess.** If you didn't see it happen, say "not verified" rather than scoring it.
- **Don't soften scores** to be nice. The owner asked for an honest grade; a wall of 7s helps nobody.
- **Keep it in plain words.** The owner is not a programmer. Every bug and suggestion must make sense without reading code, with the code details after.
