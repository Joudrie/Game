# Full play-test audit: v31 (build `v31 · 2026-09-30`)

Run from `docs/AUDIT_PROMPT.md` on 1 October 2026, against `dist/preview2.html` built from `main` at `833221f`. Nothing in the game was changed. Every number below was measured. Anything not seen is marked **not verified**.

**How it was tested**
- **Real input:** keyboard, mouse (pointer lock works headless), clicks on HUD buttons.
- **Test hooks:** `__game.advance()`, `place`, `spawnSpecial` and so on, used only to set up a situation or run time forward.
- **Volume:** 1,330 key-in-state combinations, about 140 scripted scenarios, 51 screenshots kept, and a 10-minute soak.
- **Repeat counts:** every bug was re-run several times. Counts are given as "x/y".
- **Reproducing:** each script reproduces with one command, for example `tools/serve.sh node tools/audit/verify3.mjs` (more under Coverage).

---

## 1. Summary

**Overall grade: 6/10 (tier B).** There's a lot here, and most of it works, and much of it is fun. But a few bugs break the saber, the thing the game is built around, in very ordinary situations. Some defaults also hide what has been built.

### The five biggest problems
1. **The "stuck swing" (Critical):** the saber goes dead and you walk at a crawl (1 m/s).
   - **Triggers (5/5 each):** a single left click with *Saber + blaster*; a click or F right after a takedown; R, T or X in the middle of a swing; R after a Force pull.
   - **What clears it:** only jumping, holstering (E) or switching items.
2. **Alt-tab leaves your mouse "held" (Critical):** an AK or M4 keeps firing on its own (4/5), or your saber guard stays up and you can only walk.
3. **Cut-off body parts turn solid red again (Major):** after a soldier's second or third cut, the severed piece is all dark red. This is the v29 complaint that v30 marked fixed. Every saber kill from the front cuts twice (left thigh, then chest), so it happens all the time.
4. **Three headline features misbehave (Major):**
   - **Mission 3** fails on its own in 6–8 s if you stand still at the start (3/3).
   - **The duellist's guard** is unreliable: cuts get through by the 2nd–4th swing in 4/5 real-input tries, and test33 fails 3/4 the other way.
   - **The grapple swing** lets go after 0.4 s unless you start close to the wall or in the air.
5. **The defaults hide the game:**
   - **Testing switches:** infinite jumps, ammo and grenades are on out of the box, so the triple jump, class limits and looting ammo mean nothing.
   - **Animation variety:** only one variant per move is ticked, so nothing varies.
   - **Crouch:** C never crouches with a saber or gun out, though the help says it does.
   - **The world:** the hero is a shirtless placeholder next to detailed SWAT soldiers, and the world is towers dropped on flat sand.

### The five best things
1. **Movement is solid:** 1,330 key-in-state combinations raised no script error, no T-pose and no permanent movement lock, apart from the stuck swing. Sliding, slide-jump chains, the jetpack and dying in any state all recover cleanly.
2. **The grapple is excellent:**
   - It pulls you to walls and onto soldiers, killing them.
   - Holding right-click yanks a soldier onto your blade.
   - A shield bounces you off, and a duellist cuts the rope.
   - All ten ways of cancelling it mid-pull leave no stuck state.
3. **The Force works and feels good:**
   - Pull lands a soldier 1.3 m in front of you, onto the blade.
   - Choke holds him for about 4 s, then he dies.
   - Lightning kills in 1.4 s.
   - The marker is clear.
4. **Enemy minds are believable:**
   - **Noticing (? then !):** 2.0 s at 6 m, 2.4 s at 12 m, 3.3 s at 20 m, never at 30 m. Crouching or sneaking adds about 50%.
   - **Panic:** soldiers panic at a witnessed death.
   - **Noise:** a pistol is heard at 32 m but not 44 m, and a suppressor only within 8 m.
5. **Under the hood it's healthy:**
   - **Memory:** no leaks in a 10-minute combat soak (heap 23–30 MB, blood, pieces, holes and particles capped).
   - **CPU:** game logic is 1.2 ms per frame with 10 soldiers.
   - **Saving:** every setting survives a reload.
   - **Collision:** buildings stop you exactly at their walls.

---

## 2. Scorecard (worst first)

Axes: **W**orks · **F**eel · **L**ooks and sounds · **R**obustness · **Fun**. **N/V** = not verified (see Coverage). Audio could not be heard headless, so **L** scores only how things look.

| # | Feature | W | F | L | R | Fun | **Overall** | Tier | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Saber + blaster | 6 | 5 | 6 | 1 | 6 | **2** | D | One left click → stuck swing 5/5 (BUG-001), HUD shows "Attack 1" ([04](shots/04-stuck-swing-attack-1-label.png)). Overheats on the 7th shot as claimed. |
| 2 | Map boundary | 2 | 3 | 3 | 2 | 3 | **2** | D | Sprint past x = 2,000 and you run into the sky ([10](shots/10-off-the-map-edge.png)). Infinite jumps take you 48 m up in 25 taps ([13](shots/13-infinite-jumps-48m.png)). |
| 3 | Mission 3: Infiltration | 5 | 4 | 6 | 3 | 5 | **3** | C | Standing still at the start, a guard spots you and the mission fails in 6–8 s (3/3, [11](shots/11-mission3-start-in-view.png), [12](shots/12-mission3-failed.png)). |
| 4 | Saber duellist | 3 | 5 | 7 | 3 | 7 | **3** | C | Real input: cut through by the 2nd–4th swing in 4/5. test33 fails 3/4 with his guard never breaking ([21](shots/21-duellist-cut-through.png)). He bats away more than 40 pistol shots, front and back. |
| 5 | Takedowns and finishers | 9 | 7 | 6 | 2 | 8 | **4** | C | Prompt only from behind, silent kill ([34](shots/34-takedown.png)). A click or F during the takedown → stuck swing 5/5. |
| 6 | Grapple swing (setting) | 4 | 5 | 3 | 5 | 6 | **4** | C | Swings from 8 m or mid-jump, but drops you after 0.4–0.9 s from the ground at 14 m+ or from 22 m. Only 4–5 m high on an 18 m tower. Hero hangs upside down ([36](shots/36-swing-upside-down.png), [37](shots/37-swing-from-ground-drops.png)). |
| 7 | Crouch (C) | 3 | 5 | 6 | 8 | 4 | **4** | C | Crouches with fists only. Saber, pistol and AK: 0/3 ("crouch when still" in the help). |
| 8 | Saber combo and heavy | 8 | 6 | 7 | 3 | 7 | **5** | B | Six-hit chain wraps, swing 0.65 s, hold = heavy. The same cut every time from the front (6/6: left thigh + chest). Stuck swing after R/T/X 5/5. |
| 9 | Shield soldier | 6 | 5 | 4 | 7 | 6 | **5** | B | Grapple bounces off and a sticky leaves him alive, as designed. He turns so fast that more than 40 pistol shots from behind never kill him. The shield is a flat white disc ([20](shots/20-shield-soldier.png)). |
| 10 | Watchdog and reports | 6 | 5 | 6 | 4 | – | **5** | B | False "Character didn't move" every time you push W into cover ([06](shots/06-cover-false-alarm.png)). Copy report works. |
| 11 | Phone layout (375 px) | 7 | 5 | 4 | 7 | – | **5** | B | Loads, no sideways scroll. The speed readout covers hotbar slots 1–4 and the inventory's bottom ([08](shots/08-phone-readout-covers-hotbar.png), [09](shots/09-phone-inventory.png)). |
| 12 | Dismemberment | 8 | 7 | 4 | 7 | 9 | **6** | B | Head, chest, waist and limb cuts all work. After 2–3 cuts the severed piece is solid red ([01](shots/01-red-piece-after-three-cuts.png) vs [02](shots/02-one-cut-keeps-uniform.png), [03](shots/03-red-bodies-in-play.png)). Blood pools are perfect red discs. |
| 13 | Juggernaut | 7 | 6 | 7 | 7 | 7 | **6** | B | 14 saber clicks from the front, 5 from behind (claimed: three hits). 27–30 pistol shots. A sticky kills him and a choke kills him. Field looks good ([19](shots/19-juggernaut.png)). |
| 14 | Force pull | 9 | 9 | 8 | 3 | 9 | **6** | B | Lands him 1.3 m in front, onto the blade, dead. Pull then R → stuck swing 5/5. |
| 15 | Cover, peek, blind fire | 8 | 6 | 6 | 6 | 6 | **6** | B | Low and tall cover, A/D along it, peek at the edge ([32](shots/32-cover-low.png), [33](shots/33-cover-tall-peek.png)). False watchdog alert. |
| 16 | Jumps (double, triple, air control) | 7 | 6 | 6 | 9 | 7 | **6** | B | With the class limits: Force 0.95 → 3.07 → 6.32 m; light 0.74 m, so it can't reach the 1.4 m hop block. Infinite jumps are on by default and override all of it. |
| 17 | Pistol | 8 | 5 | 6 | 7 | 6 | **6** | B | 3 torso or 1 head shot at 5–20 m. View kick per shot is 0.002 rad, so recoil is barely there. |
| 18 | AK-47 and M4 | 7 | 5 | 6 | 3 | 6 | **6** | B | Head 1, torso 3 at 20 m. Alt-tab while firing → fires on its own 4/5 (BUG-002). Weak recoil. |
| 19 | Shotgun | 7 | 6 | 6 | 8 | 6 | **6** | B | 3 torso shots at 8 m, 26 at 20 m (falloff plus spread). |
| 20 | HUD, hotbar, readout | 8 | 7 | 6 | 8 | – | **6** | B | Readout says "pistol" for every gun. Help bar cut off at 1920 px and hidden under 1500 px ([07](shots/07-help-bar-cut-off-1920.png)). |
| 21 | Menu: Moves, presets, builds | 8 | 5 | 7 | 9 | 6 | **6** | B | Works ([42](shots/42-menu-moves.png)), but one variant per slot is ticked by default (7 idles, 8 walks and 10 runs exist), so "Mix it up" mixes nothing. Saber combo and slide have one variant each. |
| 22 | Enemy combat and aim | 7 | 6 | 7 | 8 | 6 | **6** | B | Normal, 4 soldiers at 15–25 m: health 1.0 → 0.6 in 12 s, then they stop landing hits. On a fresh page all 10 reach combat within 30 s while you stand at spawn. |
| 23 | Force push | 7 | 7 | 7 | 8 | 7 | **7** | A | Three soldiers 4 m away thrown back to 7 m ([25](shots/25-force-push.png)). Not lethal in the open. |
| 24 | Force choke | 8 | 8 | 7 | 7 | 8 | **7** | A | Held about 4 s, then "Force choke" death ([23](shots/23-force-choke.png)). Walking up to strike him: not verified. |
| 25 | Walk, jog, sprint | 9 | 7 | 5 | 9 | 7 | **7** | A | Light 4.6/8.4, Force 5.4/12.5, heavy 3.9/7.0 m/s, matching the panel. One run clip by default. Placeholder hero ([39](shots/39-hud-default.png)). |
| 26 | Sneak (V) | 9 | 7 | 6 | 9 | 7 | **7** | A | 1.5 m/s. Seen 3.7 s at 12 m instead of 2.4 s. Reaches takedown range from behind. |
| 27 | Fall damage and blue berry | 8 | 7 | 7 | 8 | 6 | **7** | A | Normal: 6 m and 9 m no damage, 14 m −26%, 25 m −96%. The berry stops it ("about 8 m" in the changelog is really between 9 and 14 m). |
| 28 | Jetpack and hover | 9 | 6 | 6 | 9 | 7 | **7** | A | 180 m up in 20 s held, no fuel ([14](shots/14-jetpack-180m.png)). Hover holds height. Lands normally. |
| 29 | Classes | 9 | 6 | 6 | 9 | 6 | **7** | A | Speeds, slide times and jump rules differ as labelled. Hidden by infinite jumps. |
| 30 | Camera | 8 | 7 | 7 | 7 | – | **7** | A | Shoulder swap moves 0.84 m. Zoom 1.65–7 m. Rifle offset ([31](shots/31-ak-aim.png)). Pulls in front of walls. |
| 31 | Dash strike | 8 | 7 | 7 | 8 | 8 | **7** | A | Cuts him in half when you're above jog speed. A click before then is a normal swing (1/4 at short range) ([45](shots/45-dash-strike.png)). |
| 32 | Enemy variety | 9 | 7 | 8 | 9 | 7 | **7** | A | 4 uniforms, 4 skin tones, heads at 86%, pistols, AKs and shotguns. No M4 seen in 11 soldiers ([18](shots/18-soldier-close-up.png)). |
| 33 | Energy shield (player) | 8 | 7 | 7 | 7 | 7 | **7** | A | Blocks from the front, not from behind. test36 failed once under load, then passed 3/3 alone ([49](shots/49-player-shield.png)). |
| 34 | Fire grenade | 8 | 7 | 7 | 7 | 7 | **7** | A | Six fires lit in 5 ms. Adds 1 shader on first use. Soldiers steer round it (0 burned standing near). Hurts you: 80% in 3 s on Normal ([27](shots/27-fire-grenade.png)). |
| 35 | Frag grenade | 8 | 7 | 7 | 8 | 8 | **7** | A | Explosion deaths, ragdolls, pieces. Fifty mixed grenades in 5 s ran smoothly ([29](shots/29-fifty-grenades.png)). |
| 36 | Kenney buildings | 9 | 7 | 6 | 9 | 6 | **7** | A | Body stops 0.30–0.39 m from every wall tested (12/12 = the player's radius), flush with the model ([17](shots/17-building-collision-flush.png)). Roofs are solid. Sparse layout on flat sand ([15](shots/15-world-aerial.png)). |
| 37 | Courtyard and breaking | 8 | 7 | 6 | 8 | 8 | **7** | A | Glass breaks in 1 shot. One board took 11 pistol shots in 1 try (claimed: about 3) ([16](shots/16-courtyard-aerial.png)). |
| 38 | Mission 1: waves | 8 | 7 | 6 | 8 | 7 | **7** | A | Pistols → AKs → M4s ([43](shots/43-mission1-start.png)). Quitting restores your inventory. A page reload mid-mission restores it too. Death → Retry or Quit ([44](shots/44-mission-death-panel.png)). |
| 39 | Weapon panel | 8 | 6 | 7 | 9 | – | **7** | A | Works, but repeats the hotbar ("Equipment for testing"), says "five-hit combo" while the default is dual, and "Jump single" while infinite jumps are on ([41](shots/41-weapon-panel.png)). |
| 40 | Performance | 8 | – | – | 7 | – | **7** | A | See section 7. Software-GPU first-use frames of 1.4–10 s suggest shader compiles. Real GPU not verified. |
| 41 | Block, parry, guard break | 9 | 7 | 7 | 5 | 8 | **7** | A | Blocks front and side, not back. A block within 0–0.2 s of the shot parries and kills the shooter. Guard breaks after 12 bolts. Alt-tab leaves block stuck. |
| 42 | Nature, clouds, path | 8 | – | 7 | 9 | – | **7** | A | 52 trees, 93 path stones, 26 clouds ([15](shots/15-world-aerial.png)). |
| 43 | Patrol and noticing | 9 | 8 | 7 | 8 | 8 | **8** | A | 2.0 / 2.4 / 3.3 s at 6 / 12 / 20 m, never at 30 m ([35](shots/35-noticed-at-12m.png)). Sprinting behind him: noticed at 1.1 m. |
| 44 | Alarm, panic, noise, suppressor | 9 | 8 | 7 | 9 | 8 | **8** | A | Panic at a death 6 m away. Pistol heard at 32 m but not 44 m. Suppressed shot heard at 4 and 7 m, not 12–30 m. |
| 45 | Grapple (wall, soldier, yank) | 9 | 8 | 7 | 9 | 9 | **8** | A | Soldier pulled and killed. Yank lands him 1.4 m away on your blade. Shield and duellist react. All 10 ways of cancelling a pull are clean ([38](shots/38-grapple-soldier.png)). A hook mid-wall pulls you into the wall, then you drop (no hang or climb). |
| 46 | Slide | 9 | 8 | 6 | 9 | 8 | **8** | A | Light 11 m in 1 s. Slide-jump chains to 14.6 m/s (light) or 22.2 m/s (Force), then cap. |
| 47 | Holocloak | 9 | 7 | 7 | 9 | 7 | **8** | A | Lasts 8 s, recharges in 20 s, timer above the hotbar ([48](shots/48-holocloak.png)). |
| 48 | Sniper | 9 | 7 | 7 | 9 | 8 | **8** | A | One shot to torso, head or legs at 20 m. Scope FOV 20° ([30](shots/30-sniper-scope.png)). |
| 49 | Attachments | 9 | 7 | 7 | 9 | 7 | **8** | A | Suppressor radius as claimed. Pistol scope FOV 24°. |
| 50 | Teleport orb | 9 | 8 | 7 | 8 | 8 | **8** | A | Thrown 7.7 m. Into a building → pushed out to the wall. Mid-fall and mid-grapple land clean. Shoves soldiers. |
| 51 | Throw arc and wind-up | 9 | 8 | 8 | 9 | 8 | **8** | A | Dashed arc and ring ([28](shots/28-throw-arc.png)). |
| 52 | Sticky grenade | 9 | 8 | 7 | 9 | 9 | **8** | A | Stuck on a soldier, he loses 5 parts. Kills the juggernaut. Leaves the shield soldier alive. |
| 53 | Force lightning | 9 | 8 | 8 | 8 | 8 | **8** | A | Kills in 1.4 s, "lightning" death ([24](shots/24-force-lightning.png)). |
| 54 | Force marker | 9 | 8 | 8 | 9 | – | **8** | A | Ring on the target ([22](shots/22-force-marker.png)). |
| 55 | Draw and holster (E) | 9 | 8 | 7 | 9 | 7 | **8** | A | Holster 0.5 s, draw 0.3 s. Also the cure for the stuck swing. |
| 56 | Saber throw | 9 | 8 | 7 | 9 | 8 | **8** | A | Kills a soldier 6 m ahead and returns. |
| 57 | Deaths, ragdoll, corpse fade, loot | 9 | 8 | 7 | 9 | 8 | **8** | A | Head, torso, legs and explosion deaths. Bodies gone at 95 s (limit 90). G loots ammo and items ([46](shots/46-loot.png)). |
| 58 | Inventory and creative | 9 | 8 | 7 | 9 | 8 | **8** | A | Drag with the real mouse, tap to move, Escape closes, creative adds ([40](shots/40-inventory.png)). Can walk and fight with it open. |
| 59 | Items that do nothing | 9 | – | – | 9 | – | **9** | S | Data chip in the hand leaves the saber out. |
| 60 | Saving | 10 | – | – | 9 | – | **9** | S | Difficulty, attachments, hotbar order, shoulder, slot and favourites all survive a reload. First run is correct. |
| – | Saber glow, trail, scorch, sparks | N/V | | 8 | | | **N/V** | | Looks right in screenshots. Sounds not heard (headless). |
| – | Ground pound | N/V | | | | | **N/V** | | 1 real-input try didn't trigger. Suites pass. |
| – | Mission 2: survival | N/V | | | | | **N/V** | | Couldn't run its clock with the hook. test32 passes. |
| – | Stim pack and ration bar | N/V | | | | | **N/V** | | My setup hook started regeneration, which spoiled the reading. |
| – | Wall run and kick | 7 | N/V | | | | **N/V** | | Wall run triggered (Force class). The kick wasn't measured. |

### Controls (3a): every key

| Key | Does what the help says? | Side effects / stuck states found | Score |
|---|---|---|---|
| W A S D | Yes | Pushing W into cover raises a false watchdog alert | 8 |
| Shift | Yes (sprint) | – | 9 |
| Space | Yes | Infinite jumps by default. The help bar says "twice for Force" (it's three). Jump is one of only three things that clear the stuck swing | 7 |
| C | Slide yes. **Crouch only with fists** | – | 4 |
| V | Yes (sneak) | – | 8 |
| E | Yes | Clears the stuck swing. Missing from the bottom help bar | 8 |
| R | Yes | R during a swing or after a Force pull → stuck swing 5/5 | 5 |
| T | Yes | T during a swing → stuck swing 5/5 | 5 |
| X | Yes (throws the last-picked kind) | X during a swing → stuck swing 5/5 | 5 |
| G | Yes (loot, terminal) | – | 8 |
| Q | Yes | – | 8 |
| F | Yes (attack, takedown) | F during a takedown → stuck swing 5/5 | 5 |
| Z | Yes | – | 8 |
| B | Yes | – | 9 |
| H | Lightning (Force) or saber throw | Not in the bottom help bar | 8 |
| I, M, Tab | Yes | Release the mouse as intended | 9 |
| Y | Saber throw | Not in the bottom help bar | 8 |
| Esc | Closes panels | **No pause menu** | 6 |
| Enter | Respawns when dead | – | 9 |
| 1–6 | Yes | Switching from a heavy combo to the pistol freezes the sword pose (2/2) | 7 |
| Scroll | Yes | – | 8 |
| Shift + scroll | Zoom 1.65–7 m | – | 9 |
| Left click (tap / hold) | Attack / heavy | With Saber + blaster: stuck swing 5/5. Alt-tab while holding an AK → fires on its own | 5 |
| Right click (tap / hold) | Block or aim | Alt-tab while holding → guard stuck on | 6 |
| Middle click | Lightning or saber throw | – | 8 |

The full matrix is in `audit/controls-*.json`. Each record has the state before, during and 3 s after each press, plus whether you can walk again.

---

## 3. Bugs (by severity)

```
ID: BUG-001
Title: The saber gets stuck "mid-attack": you walk at 1 m/s and clicks do nothing
Severity: Critical
Area: saber
Steps to reproduce (any one of these, then wait 3 s and try to walk and click):
  a. Put "Saber + blaster" in the hotbar, select it, left-click once.
  b. Stand behind an unaware soldier, press F, then click (or press F again) within 0.3 s.
  c. Saber lit: click once, then within 0.4 s press R (grapple), T (push) or X (grenade).
  d. Select The Force, left-click a soldier (pull onto the blade), then press R.
Expected: the swing finishes and you're free.
Actual: the HUD shows "Attack 1" forever. Walking is capped at 1.0 m/s, clicks only queue a hit that never plays.
  Only jumping, holstering (E) or switching items clears it. Slide, cover and block don't.
Reproduces: 5/5 for each of a, b, c (R, T and X separately) and d. 0/5 after a Force pull with no other key.
Evidence: audit/shots/04-stuck-swing-attack-1-label.png; audit/verify3.json; controls-18-34.json (force-pull, saber-blaster, takedown rows)
Suspected cause: stopOvr() (src/game2.html:767) runs onDone.clear(), throwing away the swing's own "then: afterAttack"
  callback whenever another action plays or stops an overlay. The self-heal in updateCombat() only catches a paused action,
  but this one was faded out, not paused. attackCancelable() (line 1238) then reads a frozen action time short of the cancel
  point, so movement can't end it, and `if (atk) target = Math.min(target, 1.0)` caps the speed.
Suggested fix: when an overlay replaces or stops atk.act, set atk = null (or only clear the callbacks of the overlays being
  stopped, not all of them); extend the self-heal to `!atk.act.isRunning() || atk.act.getEffectiveWeight() < 0.01`.
```

```
ID: BUG-002
Title: Alt-tab while holding a mouse button: the AK keeps firing on its own, or the saber guard stays up
Severity: Critical
Area: guns / saber
Steps to reproduce: 1. Select the AK (4). 2. Hold left click. 3. Alt-tab away (the window loses focus, the pointer is released).
  4. Release the mouse outside the game.
Expected: firing stops when the game loses focus.
Actual: it keeps firing (30 → 11 rounds in 2 s with no button held) until you click inside the game again. The same with right
  click and the saber: the guard stays on after alt-tab and you can't go above walking speed (1.6 m/s).
Reproduces: 4/5 (the 5th started with an empty magazine); block 1/1.
Evidence: audit/verify.json → altTab; audit/bughunt.json → blurAutoFire, blurBlock
Suspected cause: the window 'blur' handler (line 4094) clears keys, slideHeld and jumpHeld only. atkHeld, rmbHeld, aimHeld and
  blocking come from mouse buttons whose mouseup never reaches the page.
Suggested fix: in the blur handler (and on pointerlockchange to unlocked), also call attackRelease(), blockRelease(), zapEnd(),
  and set rmbHeld = aimHeld = false.
```

```
ID: BUG-003
Title: Severed body parts are solid dark red after a soldier's second or third cut
Severity: Major
Area: saber / enemies
Steps to reproduce: 1. Saber lit, stand 1.5 m in front of a soldier. 2. Click three times. (Every frontal kill cuts the left
  thigh, then the chest.) 3. Look at the upper body that falls off. Or with hooks: cutEnemy(0,'hand_l'), (0,'calf_r'), (0,'waist').
Expected: pieces keep the uniform; only the cut end has a red cap (the v30 fix).
Actual: the piece from the 2nd/3rd cut is entirely red, a red mannequin lying on the sand.
Reproduces: 1/1 by hooks (three cuts), seen repeatedly in play screenshots (03, 04). One cut: uniform kept (02).
Evidence: audit/shots/01-red-piece-after-three-cuts.png, 02-one-cut-keeps-uniform.png, 03-red-bodies-in-play.png
Suspected cause: sever() (line ~2251) collects the soldier's materials with e.root.traverse(o.isMesh). After the first cut,
  the red caps (goreMat meshes) hang on his bones and are collected too, so the clone's body mesh can get goreMat.
Suggested fix: collect only the soldier's own SkinnedMesh materials (skip anything using e.goreMat / goreMat).
```

```
ID: BUG-004
Title: Mission 3 fails by itself if you stand still at the start
Severity: Major
Area: missions
Steps to reproduce: 1. Missions → Mission 3: Infiltration → Start. 2. Don't touch anything.
Expected: the start is out of sight, so you can plan a route.
Actual: you start in the open gateway in full view of the courtyard. A patrolling guard shows "!" and the mission fails after 6–8 s.
Reproduces: 3/3
Evidence: audit/shots/11-mission3-start-in-view.png, 12-mission3-failed.png; audit/verify8.json
Suspected cause: stealthSetup() start point (south gate, courtyard z −27) faces straight up the courtyard; patrol routes cross the gate's line of sight.
Suggested fix: start the player outside the wall, beside the gate (behind cover), and keep patrols off the gate line for the first 10–15 s.
```

```
ID: BUG-005
Title: The duellist's guard is unreliable: cuts get through too early, or never
Severity: Major
Area: enemies
Steps to reproduce: 1. Menu → Tests → spawn a Saber duellist. 2. Face him at 1.4 m and click once every 0.75 s.
Expected (v29): he blocks three swings, his guard breaks, then you can cut him.
Actual: real input: he's cut through on the 2nd swing (2 tries), the 3rd (1) or the 4th (1), twice while he still had guard
  left. In test33 (hooks) his guard hovers at 1–3 and recovers, so no cut lands in 12 swings.
Reproduces: real input 4/5 early; test33 fails 3/4 (once in the suite run, 2 of 3 runs alone)
Evidence: audit/verify7.json → duel; audit/suites/rerun33-*.log; audit/shots/21-duellist-cut-through.png
Suspected cause: guardAgainstBlade() runs per blade contact inside bladeCuts, so one swing can be blocked on one frame and cut on the
  next, and guard regenerates while you swing.
Suggested fix: decide block or cut once per swing (store the swing id on the duellist); pause guard recovery while he's being attacked.
```

```
ID: BUG-006
Title: Grapple swing drops you after 0.4 s unless you start close or in the air
Severity: Major
Area: movement
Steps to reproduce: 1. Weapon panel → Grapple swings on. 2. Stand 14 m or more from an 18 m+ building. 3. Aim high on the wall, press R.
Expected: you're lifted and swing like Spider-Man.
Actual: from the ground at 14 m and 22 m: 0.4–0.5 s of "swing", then the rope lets go and you stand there. Mid-jump at 22 m: 0.9 s.
  When it works (8 m, or mid-jump at 8–14 m) the arc stays 4–5 m high, and the hero hangs upside down.
Reproduces: ground 14 m 2/2, 22 m 2/2
Evidence: audit/verify7.json → swing; audit/shots/36-swing-upside-down.png, 37-swing-from-ground-drops.png
Suspected cause: swingGrapple() (line 3361) releases when you're on the ground after 0.4 s with v.y ≤ 0; reeling at 8 m/s doesn't lift you off the ground in time.
Suggested fix: give a launch impulse along the rope at the start; don't allow "swing landed" until the rope has finished reeling to `clear`.
```

```
ID: BUG-007
Title: C never crouches with a saber or gun out
Severity: Major
Area: movement / stealth
Steps to reproduce: 1. Saber lit (or pistol, or AK). 2. Stand still. 3. Press C.
Expected: crouch ("C slide while running, crouch when still").
Actual: nothing. Only works with fists or an item selected.
Reproduces: saber 0/1, pistol 0/1, AK 0/1; fists 1/1
Evidence: audit/verify.json → crouchArmed
Suspected cause: step(): `if ((gear === 'lit' || gear === 'pistol') && crouch && !inCover) crouch = false;`
Suggested fix: allow crouch with weapons (crouch idle/walk clips on the legs, weapon stance on the upper body).
```

```
ID: BUG-008
Title: Switching to the pistol during a heavy combo freezes the body in the sword pose
Severity: Major
Area: saber / guns
Steps to reproduce: 1. Saber lit, hold click 0.5 s (heavy combo). 2. Press 2. 3. Wait.
Expected: the pistol stance.
Actual: the heavy-combo overlay stays at full weight for 3 s or more: hunched, pistol out sideways.
Reproduces: 2/2
Evidence: audit/shots/05-heavy-combo-then-pistol-pose.png; audit/bughunt.json → swapWhileBusy.heavy; verify2.json → swingSwitchPose
Suspected cause: setGear() clears atk but not the heavy overlay.
Suggested fix: stopOvr() when the gear changes during an attack.
```

```
ID: BUG-009
Title: The watchdog reports "Character didn't move" whenever you push W toward the wall in cover
Severity: Major (it pops an alert over the game in normal play, and floods the owner's reports)
Area: UI
Steps to reproduce: 1. Stand next to the low block by the start, press Q. 2. Hold W (toward the wall) for 1 s.
Expected: no alert.
Actual: "Character didn't move: Pushing to move (100%) but the character stays at 0.00 m/s".
Reproduces: every time the 15-second report limit allows (8 times in the matrix, 1/1 in verify after 15 s)
Evidence: audit/shots/06-cover-false-alarm.png; controls-1-17.json (cover-low rows)
Suspected cause: checkStuck() (line 4022) excludes attacks and menus but not cover.
Suggested fix: `&& !cover` in wantsMove.
```

```
ID: BUG-010
Title: You can walk off the edge of the world
Severity: Minor
Area: world
Steps to reproduce: 1. Go to x = 1985 (or sprint about 4 minutes east). 2. Keep running.
Expected: a boundary.
Actual: the sand ends at 2,000 m and you run on into blue sky.
Reproduces: 1/1
Evidence: audit/shots/10-off-the-map-edge.png
Suggested fix: clamp the player to ±1,900 m, or a ring of cliffs or water.
```

```
ID: BUG-011
Title: The help bar doesn't fit: cut off at both edges at 1920×1080, hidden below 1500 px
Severity: Minor
Area: UI
Steps to reproduce: open the game at 1920×1080.
Actual: one 2,200 px line, centred, so the first and last controls are off screen. At 1280 or 1440 px wide there's no help bar at all.
Reproduces: always
Evidence: audit/shots/07-help-bar-cut-off-1920.png; bughunt.json → resize
Suspected cause: `#help { white-space: nowrap }` and `@media (max-width: 1500px) { #help { display: none } }`.
Suggested fix: wrap into two lines, or a "?" key / panel listing the controls.
```

```
ID: BUG-012
Title: On a 375 px phone the speed readout covers hotbar slots 1–4
Severity: Minor
Area: UI
Steps to reproduce: open at 375×667.
Evidence: audit/shots/08-phone-readout-covers-hotbar.png, 09-phone-inventory.png
Suggested fix: hide #readout under 500 px, or move it above the hotbar.
```

```
ID: BUG-013
Title: Testing switches ship on: infinite jumps, ammo and grenades
Severity: Minor (but it hides several features)
Area: movement / guns
Actual: testCfg = { infiniteJumps: true, infiniteNades: true, infiniteAmmo: true } on a fresh save. 25 jump taps take you 48 m up;
  the light class's "Jump single", the triple jump and looting ammo don't matter.
Reproduces: always (verify.json → defaults; verify2.json → jumps)
Evidence: audit/shots/13-infinite-jumps-48m.png
Suggested fix: default them off (keep them in Menu → Tests), or show a small "Test mode" badge when on.
```

```
ID: BUG-014
Title: Shield soldiers and duellists turn so fast you can't get behind them with a gun
Severity: Minor
Area: enemies
Steps: spawn a shield soldier 12 m away facing away from you; shoot him in the back with the pistol.
Actual: more than 40 shots and he's still up (he turns to face you). Duellist: more than 40, front or back.
Reproduces: 1/1 each (verify6.json → specials)
Suggested fix: cap their turn rate while shooting (e.g. 90°/s) so flanking works.
```

```
ID: BUG-015
Title: A fresh sandbox is never calm: all 10 soldiers reach combat within 30 s while you stand at spawn
Severity: Polish
Area: enemies
Evidence: verify6.json → patrolFresh (all "combat" after 30 s)
Suggested fix: spawn soldiers 40 m+ away and facing away, or spawn them calm with longer posts.
```

```
ID: BUG-016
Title: Text disagrees with the game
Severity: Polish
Area: UI
Actual:
  • Bottom help: "Space jump (twice for Force)": it's three times.
  • Bottom help: E, V, Y, H and M are missing.
  • Weapon panel and code comments: "1–5" for the hotbar: it's 1–6.
  • Weapon panel: "Saber lit: the five-hit combo", but the default style is Dual, and the light class shows "Jump single" while infinite jumps are on.
  • Speed readout: "Aim · pistol" with any gun in hand.
  • Mission 3: the start text is shown twice (toast and mission bar).
  • IDEAS.md: "the blaster overheats after four shots": it's six.
Suggested fix: one pass over the texts.
```

```
ID: BUG-017
Title: One wooden board took 11 pistol shots (the changelog says about three)
Severity: Minor
Area: world
Steps: courtyard, 4 m in front of a board of the west wooden wall, crosshair on its centre, click.
Reproduces: 1/1 (needs a second look by hand: some shots may have hit the neighbouring board)
Evidence: systems-b.json → world
```

Also noticed, and not counted as bugs:
- **test36** (energy shield) failed once in the full suite run (heavy CPU load) and passed 3/3 alone. A timing flake.
- In the software renderer the watchdog raised "Game froze" alerts throughout, and at load (9.9 s and 10.4 s first frames in 2 of 3 loads). This is a headless artifact unless it also happens on a PC: **check by hand**.

---

## 4. Fixes for everything under 9, in batches

Effort: **S** = under an hour, **M** = a session, **L** = several sessions. Assets are free and licensed. Mixamo is unavailable and Sketchfab's API is blocked.

### Batch 1: quick wins (all S, one session together)
| Fix | Features it lifts | What the player gains |
|---|---|---|
| BUG-001: clear `atk` when its overlay is stopped; widen the self-heal | Saber + blaster (2→7), takedowns (4→8), saber combo (5→7), Force pull (6→8), R/T/X/F keys | The saber never goes dead |
| BUG-002: blur and pointer-unlock release every held mouse action | AK/M4, block | No runaway fire after alt-tab |
| BUG-003: `sever()` collects only SkinnedMesh materials | Dismemberment (6→8) | The owner's "whole body red" complaint actually fixed |
| BUG-008: `stopOvr()` on gear change mid-attack | 1–6 keys | No frozen sword pose |
| BUG-009: `!cover` in the watchdog | Cover (6→7), watchdog (5→7) | Clean reports, no popup in cover |
| BUG-010: clamp to ±1,900 m | Map boundary (2→6) | Can't fall off the world |
| BUG-011/012/016: help bar in two lines (plus a "?" panel), readout off the hotbar on phones, text pass | HUD (6→8), phone (5→7) | You can actually read the controls |
| BUG-013: testing switches off by default | Jumps (6→8), classes (7→8), jetpack | Triple jump and classes mean something |
| Tick 3 variants per move slot by default (or "Mix it up" picks from all) | Moves (6→8), walk/run feel | The variety the owner asked for, out of the box |
| Weapon panel: drop the "Equipment for testing" buttons (the hotbar does it), fix the "five-hit" text | Weapon panel (7→8) | Less confusion |

### Batch 2: feature fixes (M each)
| Fix | Features | Notes |
|---|---|---|
| BUG-004: safe Mission 3 start behind the wall, patrols clear of the gate for 15 s | Mission 3 (3→8) | Also consider a marker over the terminal |
| BUG-005: duellist blocks or is cut once per swing; guard doesn't recover while you attack | Duellist (3→8), test33 | Re-run test33 |
| BUG-006: grapple swing launch impulse and a higher arc; the swing pose upright | Swing (4→7) | Pose: use one of the four existing "Grapple: pulled" variants instead of the upside-down pose |
| BUG-007: crouch with weapons | Crouch (4→8), stealth | The crouch clips are in the build; drive the legs with them and keep the weapon stance above the waist |
| BUG-014: cap special soldiers' turning while they fire | Shield soldier (5→7), duellist | Makes "get round him" real |
| Saber cut variety: pick the cut from the blade's angle instead of always thigh + chest | Combo feel (6→8) | It's on the backlog as "slanted cuts". Even a random pick among three cut sets helps |
| Recoil: a visible camera kick of 0.02–0.05 rad per shot, and gun kick per gun | Pistol, AK, M4, shotgun (6→7/8) | Today the view barely moves (0.002 rad over 5 shots) |
| Shader pre-warm: at load, render one hidden instance of every effect (frag, fire, sticky, orb, blood, sparks, each special) with `renderer.compile()` | Performance (7→8), first-use hitches | Measured 1.4–10 s first frames headless; check on a PC first |
| Blood: irregular splat decals instead of perfect discs | Dismemberment looks (4→7) | Kenney **Particle Pack** (CC0, kenney.nl/assets/particle-pack) has splat sprites |
| Shield soldier's shield: a real shield model | Shield soldier looks (4→7) | Search Poly Pizza (poly.pizza, CC0/CC-BY) for "riot shield"; credit the author |
| Juggernaut: count a hit per swing, not per contact, so three swings means three | Juggernaut (6→8) | Measured 14 clicks from the front today |

### Batch 3: the big ones (L)
| Fix | Features | Free, licensed sources |
|---|---|---|
| **A real player character** to replace the shirtless Superhero (it looks like a placeholder next to the SWAT soldiers) | Every feature's "Looks" | Quaternius **Ultimate Modular Men / Women** (CC0, quaternius.com), mapped onto the hero skeleton the way `tools/reskin_swat.mjs` did the Quaternius SWAT soldier. Or finish **The Second**. |
| **A fuller world:** roads, kerbs, props and blocks between the towers instead of open sand | World (7→8), fun | Kenney **City Kit (Roads)** (CC0, kenney.nl) to go with the City Kits already used; KayKit **City Builder Bits** (CC0, kaylousberg.itch.io/city-builder-bits) for props |
| **A pause and settings menu:** mouse sensitivity, invert Y, volume, FOV, key list | Missing features | No asset needed |
| **Sound pass** (couldn't be heard here): saber clash, bullet impacts, footsteps | Looks & sounds | Kenney **Impact Sounds** and **Sci-fi Sounds** (CC0, kenney.nl) |
| **Civilians** (next on the backlog) | – | Quaternius modular characters (CC0) for the looks |

---

## 5. Missing features

Things a player would expect from this kind of game, or that the owner's references (`IDEAS.md`) have, and that aren't here:
- **A pause menu and settings:** Esc only releases the mouse. There's no mouse sensitivity, invert Y, volume, FOV or key rebinding.
- **A world boundary** (BUG-010) and a reason to go places: objective markers, points of interest.
- **Hanging or climbing** where the hook lands mid-wall (Arkham), and ledge climbing (Assassin's Creed).
- **A clothed player character**, and character switching (Lego Star Wars).
- **Mission objective markers:** I saw no marker on the Mission 3 terminal from the start (not checked up close).
- **Music and enemy voices or chatter.**
- **Civilians** (next on the backlog), **droids** that come apart, **killstreaks**, **Dead Eye**, **disguises**, **first person**.
- **Hiding bodies** and **distractions** for stealth (IDEAS, Metal Gear).

## 6. CHANGELOG claims that turned out false

| Version | Claim | What happened |
|---|---|---|
| v30 | "Wounds: a cut end gets a small flat cap, not a big red ball (the 'whole corpse red' look)" | After a soldier's 2nd–3rd cut the severed piece is solid red (BUG-003) |
| v29 | Duellist "blocks your swings (three before his guard breaks)" | Cut through by the 2nd–4th swing in 4/5; test33 fails 3/4 (BUG-005) |
| v29 | Juggernaut "takes three saber hits" | 14 clicks from the front, 5 from behind (real input) |
| v29 | "A long drop (about 8 m or more) hurts" | 9 m does no damage on Normal; damage starts between 9 and 14 m |
| v28 | Grapple swing: "a hook high on a wall swings you like a pendulum" | Only from close or mid-jump; drops you after 0.4 s from the ground at 14 m+ (BUG-006) |
| v26 / IDEAS | "Crouching (C) and cover make you harder to see" | You can't crouch with a weapon out (BUG-007) |
| v27 | Wooden boards break "after about three pistol shots" | 11 in one try (BUG-017, needs a second look) |
| CLAUDE.md | "Several variants of every animation … rotated in play" | One variant per slot is ticked by default, so nothing rotates |
| CLAUDE.md | "hotbar (5 slots, scroll or 1–5)" | 6 slots, 1–6 (the docs are out of date) |
| IDEAS | "Saber and blaster … overheats after four shots" | Six (v30 changed it; IDEAS wasn't updated) |

Verified true (selection): the Force pull onto the blade, choke and lightning, the parry, the guard break, suppressor and noise radii, ? then !, the panic, takedowns only from behind, the holocloak timings, attachments, dropped guns and loot, corpse fade, mission inventory restore (including after a reload), death → Retry, saving, and the building collision boxes resized to the models.

## 7. Performance

Headless Chromium uses a **software GPU**, so frame rates aren't meaningful. CPU, draw-call, memory and size numbers are.

| Measure | Value |
|---|---|
| Build size (`dist/index.html`) | **15.23 MB** of the 16 MB cap (0.77 MB left) |
| Page load to the game ready (headless) | 3.7 s (8.6 s with a cleared cache) |
| Game logic per 1/30 s step | 0.90 ms (5 soldiers) · 1.23 ms (10) · 1.56 ms (20) · 1.62 ms (30) |
| Draw calls / triangles | 154 / 287k (5) · 176 / 368k (10) · 261 / 535k (20) · 348 / 702k (30) |
| Shader programs | 38–42 in play, stable over 10 minutes |
| First frame after the first use (software GPU) | frag 4.6 s · sticky 2.6 s · orb 3.5 s · fire 1.4 s · blood 4.1 s · sparks 10.2 s · duellist 7.2 s · juggernaut 0.04 s · shield soldier 0.06 s. Likely shader compiles; **check on a PC** |
| 10-minute combat soak (heap / DOM nodes) | 23.4 → 25–30 MB (GC sawtooth, no growth) / 1,736 → 1,741–1,787 |
| Things that pile up, after the soak | splats capped at 90, pieces at 60, bullet holes ≤ 51, corpses ≤ 12, particles ~55, fires ≤ 1, dropped mags 0. Nothing grows |
| Fifty mixed grenades in 5 s | 322 ms wall time for 5 s of game time (no stall) |

## 8. Coverage: what couldn't be tested here (please check by hand)

- **Sound:** everything audible (saber hum and clash, gun sounds, footsteps, grenade, ignite) was not heard headless.
- **Real GPU frame rate and first-use hitches.** Turn on Menu → Tests → Performance and throw each grenade type, cut a soldier and spawn each special once. Watch for a freeze the first time.
- **A real alt-tab.** I simulated it (window blur plus pointer release); BUG-002 should be confirmed on Windows.
- **The "Game froze" alert at load** on a normal PC.
- **Gamepad and real touch controls** (the phone layout was checked at 375 px, not with fingers).
- **Mission 2 end to end, and Mission 1's sniper wave and reward by real input.** The suites (test31, test32) cover them with hooks.
- **Stim and ration healing, ground pound, wall kick, and the choke "walk up and strike"**: my setups didn't get a clean reading.
- **A saber-trail streak after a teleport:** the trail drew a huge green wedge when my test moved the player instantly. A real teleport orb with the saber lit may do the same; check by hand.
- **Occasional pistol misses at 8–12 m with the crosshair on the chest** (6 in a row in one run). Not explained. Check by hand before treating it as a bug.
- **Report sending:** the watchdog's report can't be sent from this environment (no runtime). "Copy report" works.

### Existing suites (step 4 of the prompt)
19 suites run. **17 passed, 2 failed:**
- **test33** (duellist guard): failed 3 of 4 runs. A real bug, BUG-005.
- **test36** (energy shield): failed 1 of 4 runs, only under load. A flake.

The logs are in `audit/suites/`.

### Reproduce
Serve `dist/` on :8766 (or prefix with `tools/serve.sh`), then run:

| Command | What it covers |
|---|---|
| `node tools/audit/controls.mjs 0 34` | Every key in 35 states (pass a range to split it) |
| `node tools/audit/bughunt.mjs` | Section 3b sequences |
| `node tools/audit/systems-a.mjs`, `systems-b.mjs` | Section 3c systems, first pass |
| `node tools/audit/verify.mjs` … `verify8.mjs` | Every BUG above, with repeat counts |
| `node tools/audit/perf.mjs` | Performance and the 10-minute soak |
| `tools/audit/run_suites.sh` | The existing suites |

The raw results are in `audit/*.json`, and screenshots go to `audit/shots/`. Only the 51 numbered screenshots referenced here are committed; the scripts regenerate the rest.
