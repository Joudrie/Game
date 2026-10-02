# Backlog

Everything asked for so far that isn't built yet, grouped so nothing gets lost. Done items move to `CHANGELOG.md`.
The owner's game references and ideas, with what's built, are in `IDEAS.md`.

**Tags:**
- **[needs you]:** waiting on something only you can do (a token, a login download, a decision).
- **[free assets]:** can be built from what's already in `assets/`.
- **[later]:** you said to leave it for now.

---

## The vision
**Current vision: `VISION.md` (after v34).** The game is now missions for the Vanguard on different planets: "Hitman, but loud", with classes, several paths, things that blow up, score and a perfect-stealth trophy. First milestone: Mission 1, the cargo yard. The v21 notes below still hold except "no plot".

### The v21 vision
No plot. A **third-person combat sandbox, creative-mode style**, where movement and combat are the whole point. **Jedi: Survivor** is the gameplay template, **Lego Star Wars** the model for saber feel (the little blade trail), **Fortnite** the inspiration for gadgets.

The ground rules:
- **The lightsaber is lethal.** If it touches you, you're in trouble. No health bar slowly going down: it cuts.
- **Dismemberment is not for gore's sake:** when you slice a droid, it should actually come apart. Humans can lose a hand and keep fighting without it.
- **Every weapon is deadly.** Enemies have little health; difficulty comes from **numbers**, not bullet sponges. Being overwhelmed, not being on round 20 with enemies that soak up 1000 bullets.
- **Keep the game small** if that buys more enemies on screen.
- **Mostly droids** as enemies, plus the human soldiers we have.
- **Fun over everything, and always fast.** No weight system, nothing that slows the player down. Even in a cutscene you can walk around, interact, even wander a little out of frame.
- **Minecraft-style limits:** the only limit is inventory slots. A scrollable hotbar is your quick hand (Minecraft / Fortnite).
- **References:** Jedi: Survivor (saber combat, but third person), Red Dead Redemption 2 and GTA V (cover shooting), MW2 Spec Ops (enemy types, killstreaks, the co-op mission "Big Brother"), Fortnite (weapons and gadgets), Black Ops 2 (quickscoping, trickshots), Rainbow Six Siege (destruction), Arkham Knight (grappling), Metal Gear (stealth), Zelda (islands and boats), Portal (the vibe of puzzle areas), Fallout (character creator), Fortnite and Destiny (emotes).
- **Owner's answers (v21):** PC first (phone only needs to load and look right); no player damage yet; personal and played with friends (maybe sold one day, so keep Star Wars assets swappable, with *Wake*'s plasma blades as the fallback for sabers); duo co-op PvE someday; the city later.
- **Variety in every weapon's animations** (not just two per weapon, first person included). The owner's lesson from Destiny: the moment-to-moment play has to be fun, and the rewards have to feel worth it.
- **Story is light:** "go take out these people". But there are characters: a villain, **civilians walking around with overheard chatter (GTA)**, unalerted guards, **Hitman-style disguises**, silly cutscenes, and **voice lines recorded by the owner**.
- **Character switching like Lego Star Wars.**
- **Inspiration:** the owner's book *Wake* (weapons such as plasma knives, plasma and beryllium rifles, holocloaks, magboots, hoverboards, breaching kits; worlds like Marfeld and Kelton) and the Lego collection's lore (the Snow Jedi, the Purple Shadow, the realm where guns don't work).
- **Licences still apply:** assets ripped from commercial games (like the Skate 3 or Call of Duty files people pass around) can't go in. We take ideas from those games, and assets only from properly licensed sources.

## ★ Next (owner, after v31)
1. ✅ **Full audit** (done after v31): `audit/REPORT.md`, also as a page at https://claude.ai/artifact/BfXt8RGyuyEq87WM4WiPNF. Overall 6/10. Its fixes come in three batches (below); Batch 1 is done in v32.

### Audit fixes (from `audit/REPORT.md`)
**Batch 1, quick wins** ✅ *done in v32*: the stuck swing, alt-tab held buttons, red severed pieces, the sword pose after switching, the cover false alarm, the world edge, infinite jumps off, move variety, help and labels.

**Batch 2, feature fixes** ✅ *mostly done in v33*
- [x] **Mission 3:** a safe start beside the gate, out of sight, with patrols kept off the gate for the first 15 s (it fails on its own in 6–8 s today)
- [x] **Duellist:** block or cut decided once per swing; no guard recovery while you attack (test33 fails 3 times in 4)
- [x] **Grapple swing:** a launch impulse so it works from the ground, a higher arc, an upright pose (not upside down)
- [x] **Crouch with a weapon out** (C does nothing with the saber or a gun)
- [x] **Shield soldiers and duellists turn slower** while firing, so you can get behind them
- [ ] **Saber cut variety:** not the same thigh + chest cut on every frontal kill (towards the slanted cut)
- [x] **Recoil you can see:** a real camera kick per gun
- [x] **Shader pre-warm at load:** first frag, sticky, orb, blood, sparks and duellist each froze 1.4–10 s in the software renderer (check on a PC first)
- [x] **Blood splats** instead of perfect red discs *(v33: Kenney Particle Pack dirt sprites)*
- [ ] **A real model for the shield soldier's shield** (Poly Pizza or Kenney; needs a download by hand or a key)
- [x] **Juggernaut:** three swings means three hits (14 clicks from the front today)

**Batch 3, the big ones** (several sessions)
- [x] **A real player character** instead of the shirtless Superhero *(v34: the hooded Ranger from Quaternius Modular Character Outfits - Fantasy, CC0, on the same skeleton; Menu → Look switches back)*
  - [ ] more outfits from the same pack (Knight, Wizard, Peasant…) as further looks, if the 16 MB budget allows (~40 KB each without textures)
- [x] **A fuller world:** roads and props between the towers *(v34: Kenney City Kit Roads: a street grid with lights, traffic lights, signs, closed road ends, dumpsters)*
  - [ ] more props (benches, cars, fences: KayKit City Builder Bits) and pavements by the buildings
- [x] **Pause and settings menu:** mouse sensitivity, invert Y, volume, FOV, key list *(v34: Esc or P)*
  - [ ] key rebinding
- [x] **Sound pass** (Kenney Impact and Sci-fi Sounds, CC0) *(v34: steps, landings, punches, cuts, hits, dry fire, grapple, jetpack, pickups, gun draw, bodies falling, alarm, mission results)*
  - [ ] voices: soldiers' shouts and chatter, pain sounds

2. **Civilians** (after the audit). Neutral people walking around the sandbox:
   - [ ] they wander the streets and paths (ideally with free, licensed civilian models: several looks, men and women)
   - [ ] they run from soldiers and from gunfire, explosions, the lit saber, and bodies (panic, using the soldiers' `noise` / `witnessDeath` ideas)
   - [ ] they can die: shot, cut, blown up and ragdolled like soldiers, with dismemberment
   - [ ] soldiers don't target them, but stray fire can hit them
   - [ ] later: game modes such as **protect the civilians**; overheard chatter (GTA) is already in Design answers

## ★ Play test on PC, v29 (owner): fix these first
Your play-by-play, item by item. v30 takes the fixes, and v31 the downloaded assets.

**Character and guns**
- [~] **Shoulders look wrecked:** *(v30: rifles are held closer with both hands, which crosses the arms less; tell me if it still looks wrong)* the pistol and rifle stances hunch and cross the shoulders; the left arm pulls across the chest.
- [x] **Move presets as named builds:** Default, Speed, Silly/Goofy (plus a reset to defaults).
- [x] **Rifle camera:** put the character further to the left of the screen with a rifle (more over the shoulder), so you can see down the gun as you aim.
- [x] **Rifle hold:** stock in the shoulder; hands actually gripping (the left hand is open and hovering, the shotgun isn't held properly).
- [x] **Reloading makes the gun vanish** (AK, shotgun, sniper): the hands play the pistol reload while the rifle hangs at the shoulder. Rifles need their own reload.
- [x] **Sniper:** a chest kill blows the chest apart.
- [x] **Saber + blaster:** the blaster points the wrong way. Saber in the right hand, blaster in the left, facing forward, gripped in a fist. Left click fires the left hand, right click swings the right. Six shots before it overheats.
- [x] **Items that do nothing** (data chip, comlink, kyber crystal, keycard, power cell…) shouldn't be held in the hand. The ration bar could heal.

**Saber and the Force**
- [x] **Tone the glow down** a little (you love it, just less obvious); the trail shouldn't flare while you're only running.
- [x] **Juggernauts and duellists need a real swing:** walking into them with the blade shouldn't hurt them (walking into ordinary soldiers can stay: "hilarious").
- [x] **Grappling into a shield soldier** shouldn't kill him. A duellist cuts the rope or knocks you back.
- [x] **Force target marker** less solid.
- [x] **Choke:** a choking animation, held longer, and you can walk up and strike him down while he hangs there.
- [x] **More punch attacks** (keep the current combo as the main one).

**Throwables and gear**
- [x] **Fire grenade:** the game freezes 1–2 s as it ignites, and lags near the flames. The flames look poor: find realistic fire textures. Soldiers should generally avoid fire.
- [x] **Teleport orb:**
  - a wind-up throw and a visible arc while you aim
  - teleporting next to a soldier knocks him back
  - teleporting while falling left you stuck in the jump pose, and so did pressing X in the air
- [x] **Blue berry:** a subtle blue aura rather than turning blue all over. Show how long it lasts.
- [x] **Holocloak:** show how long it lasts.
- [x] **Shields for the player** to use. *(v31: Pistol + energy shield)*

**Movement**
- [x] **Air control:** when jumping straight up beside a building you can't steer onto it. Let you move in the air.

**Enemies**
- [x] **When they shoot, they don't aim at you.**
- [x] **Different skins,** rotated between spawns (for example a desert SWAT); **heads too big** (too cartoon, not serious); **mixed weapons**.
- [x] **Shield soldier:** the shield on his arm *(v30: held at his hand, and it takes one blast; v31: the one-handed stance)*, a one-handed pistol stance; a sticky grenade on the shield can leave him alive.
- [x] **Cutting a soldier in half turns his whole body red:** blood belongs at the cut.
- [x] **More enemies** in the sandbox.

**The world** *(download free assets rather than building them; any theme, modern or fantasy, just not cartoon)*
- [x] **Buildings** from free asset packs, for a more interesting sandbox.
- [x] **Clouds** in the sky.
- [x] **Patches of grass and pathways.** *(v31: Kenney City Kits and Nature Kit, CC0)*

**What you liked:** the grappling hook (the best thing so far), the saber glow, the saber cutting whoever walks into it, the triple jump, juggernauts, the duellist, the holocloak idea, the courtyard temple, the Force pull.

## ★ Roadmap (agreed v22): build in this order
Each batch ends with a play-link update for the owner to try. Order can change whenever the owner says so.

**Batch 1: finish the saber cutting and fix the basics** ✅ *done in v23* (except limb reactions with sound, which comes with Batch 2)
1. Play-test fixes: jetpack off by default; the pistol stuck pointing up after recoil (root cause); short-lived bullet holes on walls and ground.
2. Dismemberment part 2:
   - soldiers react to losing a limb (clutching the stump)
   - one-armed soldiers switch the gun to the other hand and keep shooting
   - a leg cut drops him to crawl instead of killing him
   - limbs stay on the ground longer
3. **Pick up dropped weapons** (walk over them or press the loot key); a body gives about 3 magazines. Arcade reloads: rounds are never lost.
4. **6-slot hotbar, centred** at the bottom.
5. **A key to swap shoulders** (camera).

**Batch 2: guns** ✅ *done in v24* (soldiers hold their AKs pistol-style for now; the player's rifle hold uses arm IK)
1. **AK-47, pump shotgun, sniper** (free CC0 models already in `assets/weapons/quaternius-ultimate-guns`), each with several animations and its own feel.
2. **Weapon sounds** (free sounds already in `assets/misc/sounds`).
3. **Bullets vs blasters:** only blaster bolts can be deflected.
4. **Block and parry:** holding block covers the front and sides, not the back; the guard breaks after many hits; a block timed to the shot sends the bolt back at the shooter (a sniper's scope glint is the tell).
5. Soldiers carry these weapons and drop them.

**Batch 3: Jedi powers and movement** ✅ *done in v25* (the Jedi class first)
1. **Force targeting like Lego Star Wars** (a marker on whoever you look at, with an on/off toggle and cooldowns): pull (into your blade), choke, lightning, saber throw.
2. **Saber feel:** blade trail, the blade lights faces and rooms, sparks and scorch marks on walls and ground, the hum and ignite sounds.
3. **Triple jump,** each jump higher; a little wall running during the super sprint.
4. **Saber + blaster** as one item (the blaster overheats after about 4 shots).

**Batch 4: enemies that think, and you can die** ✅ *done in v26* (suppressors wait for the batch 5 attachments; the noise rule is ready for them)
1. **Enemy states:** idle, patrol, alerted, targeting. An idle guard who sees someone die panics for a moment. A guard who spots you yells, and killing him before he finishes keeps it quiet. Suppressors are silent; gunfire alerts everyone.
2. **Stealth kills.**
3. **Player damage** (hits to kill set by difficulty), slow regenerating health, easy / normal / hard / extreme (smarter AI on the hard ones).
4. **Dying is fun:** full ragdoll; your own grenade blows you apart like anyone else; watch the body or respawn.
5. **Snap-to-cover** with peeking, blind fire and reloading behind cover.

**Batch 5: a proper sandbox and the first mission** ✅ *done in v27* (the grappling hook is the first gear you keep; more missions add more)
1. **A better test arena:** a courtyard with cover, a wooden wall that breaks (in pieces, partly), glass that shatters, stone that only takes marks, ledges to fall from.
2. **Mission 1, waves:** pistols, then AKs, then ARs, then snipers. Loot what they drop. Replayable.
3. **Gear you keep forever** from each mission (for example, the grappling hook).
4. **Creative menu:** a catalogue of every weapon and item to drag into the inventory; attachments from each item's menu (suppressor, scope).

**Batch 6: gadgets and saber moves** ✅ *done in v28* (chosen by Claude from this backlog when the owner said "continue"; change the order any time)
1. **Throwables:** sticky grenade, fire grenade (a burning patch that sets soldiers alight and burns through boards), teleport orb. X throws the one you picked last.
2. **Saber moves:** dash strike (attack while sprinting at a soldier), grapple yank (hold right-click as you grapple a soldier), finishers on soldiers who are down or hurt.
3. **Grapple swing** (Spider-Man), a setting next to the zip-line.
4. **Mission 2: Hold the courtyard.** Survive 3 minutes of reinforcements; the reward is the jetpack, for good.

**Batch 7: enemies worth a saber, stealth that counts** ✅ *done in v29* (the owner said go)
1. Juggernauts and Jackal-style shields; 2. saber duellists (block, guard break, parry); 3. a sneak button, the holocloak and Mission 3 (infiltration); 4. move presets (favourites and packs); 5. falls (by class, deadly ledges, the blue berry).

**Ideas for Batch 8** (the owner picks): droids that fall apart; killstreaks; first person with aim-down-sights; a first city block (Naboo-style) to fight through; customisable, saved sabers; the slanted cut that follows the blade's angle.

**Later** (in the sections below): first person with ADS, leaning and quickscoping; droids; co-op (duo PvE); killstreaks and throwables; fire and sticky grenades; juggernauts and shields; saber duels; Dead Eye; stealth missions and climbing; the character creator; the Naboo city; the hoverboard; mechs; emotes; civilians and voice lines.

## Owner's answers (v22, round 3)
- **Cuts at full speed** (no slow motion). **Severed limbs stay a while.**
- **An idle guard who sees someone die panics for a moment** (stealth missions).
- **The player:** intact for now, but **your own explosion blows you apart** like anyone else.
- **Character:** keep the current hero. **Classes:** don't worry about them for now.
- **Weapon switching:** scroll wheel and number keys (as now, Fortnite-style).
- **First guns after the pistol:** AK-47, pump shotgun, sniper.
- **Only blaster bolts can be deflected;** bullets can't.
- **Arcade reloads:** never lose rounds.
- **Droids:** set aside for now.
- **Hits to kill the player:** set by difficulty.
- **Rewards:** new gear each mission that you keep forever (e.g. the grappling hook); missions are replayable; the sandbox has everything.

## ★ Current focus: dismemberment (owner, v22)
"I really want to ace the dismemberment mechanic." Cartoon, not gory: blood yes, gore no.
- [x] **v22:** the blade decides. Head, torso and legs kill, cut exactly where the blade passed; hands and arms come off and the soldier lives; the gun hand drops the pistol and he runs; cartoon blood and splats; grenades and pushes throw loose limbs and guns.
- [x] **Better reactions to losing a limb:** clutching the stump, a scream (voice lines later), switching the gun to the other hand, one-armed soldiers still shooting. *(done v23 (the scream waits for voice lines))*
- [x] **Leg cuts that don't kill:** he falls and crawls. *(done v23)*
- [ ] **The cut follows the blade's angle:** a slanted slice through the mesh instead of cutting at a joint.
- [ ] **Droids fall apart:** sparks instead of blood, and they keep coming with missing parts.
- [ ] **Energy shields:** a Jackal-style shield, and **juggernauts** whose skin-tight force field (like a starship's shield) takes three saber hits while they shoot you. Not yet.
- [ ] **Saber duels:** enemies with sabers block instead of dying on contact.

## Design answers (owner, v22)
- **Saber:** one touch kills (except shields and saber duellists); limbs can come off with a reaction.
- **Block and parry:**
  - Holding block stops shots from the front and sides, **not the back**.
  - The guard **breaks after a lot of bullets**.
  - **A block timed to the moment an enemy fires sends the bolt straight back at him.** A sniper's scope glint or aim animation is the tell.
- **Force, Lego Star Wars style:**
  - Select Force in the inventory and a target marker appears on whoever you look at.
  - Powers: choke, lightning, saber throw, pull (combo: pull him into your blade).
  - Cooldowns so it isn't spammed, and a toggle to hide the markers in crowds.
  - Later: Avatar-style earth powers (stomp to raise a rock wall that stays for a while).
- **No enemy health bars, ever.** A hard line: you shouldn't see the enemy's cards.
- **Saber and blaster together** as one inventory item. The blaster has a drawback (for example 4 shots, then a cooldown, or a slower reload). Balance later.
- **Dead Eye** (RDR2 slow-motion aim): single player only.
- **Movement:**
  - Triple jump, each jump higher (more Force each time).
  - A little wall running, only during the super sprint.
  - Walls with a special texture you can walk up (magboots, from *Wake*) in campaign missions.
  - Assassin's Creed climbing: ledges and proper leaps.
  - Hay bales or water that save you from a fall.
- **Falls:**
  - Fall damage depends on the class; Jedi survive huge falls; deadly ledges are marked.
  - A pickup that grants fall immunity for a while, shown as a faint blue outline.
- **Dying should be fun (Helldivers):** a full ragdoll; watch your body tumble down a cliff or float down a stream, or press a button to respawn. Helldivers-style **throwable killstreaks**.
- **Aiming:** snappy (Fortnite / Call of Duty), maybe varying by class later. The **Jedi movement class comes first**: ace that and the rest follows.
- **Cover:** a snap-to-cover button (keys decided later).
- **Ammo:** plentiful; a body gives about three magazines.
- **Enemy AI:** dumb and fun on easy and normal, smarter on hard and extreme.
  - States: idle, patrol, alerted, targeting you.
  - Suppressed shots don't alert anyone; gunfire alerts anyone not already on high alert.
  - Stealth kills. A guard who spots you yells; kill him before he finishes and nobody else is alerted.
- **Waves:** no endless waves in the sandbox; a setting for how many enemies at a time (Tests → Performance has 5/10/20/40; the owner suggested 10 as a default).
  - The first level can be **wave-based with escalating enemy weapons:** pistols, then AKs, then ARs, then snipers. You pick up what they drop, so where you kill them matters: loot a body in the open and you get shot.
- **Enemies drop their weapons and you can pick them up.** This is the owner's favourite next step after dismemberment.
- **Inventory:** a **6-slot hotbar centred at the bottom**; the backpack can be as big as needed.
- **Art style:** not Lego (animations would look clunky on brick figures). Leaning toward RDR2 / Modern Warfare realism at lower fidelity: **modern special forces in a Naboo-like city**.
- **Camera:** a key to swap shoulders, to test.
- **Blood and dismemberment on humans:** yes (cartoon).
- **Weapon sounds** would make the owner grin.
- **Later:** mechs, a hoverboard (a skateboard with no wheels), stealth missions.

## 0. Your asks from the v20 play test
- [x] **Jetpack off by default;** you turn it on yourself. (The switch exists in the Weapon panel; the default flips.) *(done v23)*
- [x] **Pistol stuck pointing at the sky:** after aiming and firing, recoil leaves the gun pointing up until the mouse moves again. Find the root cause (recoil offset not decaying while the mouse is still). *(done v23)*
- [x] **Bullet holes** where shots hit boxes and the ground; short-lived decals. *(done v23)*
- [ ] **A better pistol model** from a free, licensed source.
- [ ] **Move presets:** instead of rotating at random, pick a default per slot (and saved presets), e.g. "always this idle, this run".

## 1. Enemies and combat testing
- [x] ~~Five enemy soldiers, deaths by cause (head, torso, legs, explosion, push, wall impact), bodies staying 90 s, hit reactions.~~ Done in v12.
- [x] **Physics ragdoll** on top of the death animations, so bodies slump over steps, roofs and each other. v14 fakes the flight (clip stretched to the flight, head-over-heels flips). *[free assets: Rapier or Jolt physics, downloaded]* *(done v26 (Verlet ragdoll for blast, push and wall deaths))*
  - **Bodies already on the ground ragdoll** when a grenade or Force push hits them, instead of staying frozen in their pose.
  - **Severed limbs** (a foot lying on the ground) get knocked away by grenades and Force push too.
- [x] **Enemies that look like enemies:** SWAT officers since v21 (`tools/reskin_swat.mjs`).
- [ ] **Droids** as the main enemy, built so they **fall apart** when cut: arms, heads and legs come off cleanly, sparks instead of blood. *[free assets to find: CC0/CC-BY droid models]*
- [ ] **More soldiers on screen:** v21 measured the cost (Tests → Performance). Next steps if needed: soldiers far away don't cast shadows, the pistol merged into one mesh, fewer bones for distant soldiers.
- [ ] **Enemy chatter and voice lines** (you may record the voice lines).
- [ ] **More death variety:**
  - Mixamo has exact matches for your rules: `Death From Front Headshot`, `Hit To The Legs`, `Flying Back Death`, `Swing Into Wall`. The full list is in `assets/deaths/mixamo_death_hit_names.txt`. *[needs you: Mixamo login]*
  - The 27 openmw endorphin deaths are the best free set but have no licence. *[needs you: ask the author or skip]*
- [ ] **Death direction:** fall away from the shot. Needs the clips sorted by which way they fall, and mirrored copies.
- [ ] **Health per class,** using your rules: Force lowest, heavy highest. The current numbers are placeholders and unused.
- [ ] **Saber hits on enemies:** they already do damage (55 per hit, 90 for a heavy). Still to do: hit stop, sparks, and saber-specific deaths.
- [x] **Blocking stops incoming shots and attacks;** parry timing. *(done v24)*
- [ ] **Enemy AI:** approach, take cover, shoot. *[free assets: Yuka]*

- [ ] **Zombies mode** (eventually): slow, many, keep crawling after losing legs. Later rounds bring **more zombies, not tougher ones**: each keeps a small amount of health, so it stays tactical. *[free assets: Quaternius zombie models and animations]*
- [x] **Dismemberment polish:** choose the cut from where the blade actually passed; **hands and arms cut off living soldiers, who keep fighting without them**; dismemberment on every model we add (droids, robots); blood decals on the ground (sparks for droids). *(done v22–v23)*
- [x] **One-touch saber lethality:** a blade that touches a soldier cuts or kills, instead of taking a slice of health. *(done v22)*
- [x] **More combat moves:** air slash combos, a dash strike, a grapple yank (pull the enemy to you instead), a finisher on stunned soldiers. *(done v28 (dash strike, grapple yank, finishers; air slashes still to do))*

## 1b. The Second *[later: shelved in v21]*
The image-to-3D route was too rough: the colour step never worked on Hugging Face, Blender needs a T-pose, and image generators can't draw a side-on T-pose. The files and tools stay in the repo (`assets/characters/the-second/`, `tools/bake_the_second.py`, `tools/rig_the_second.mjs`); he's just not in the build. Add `"second": b64('the_second_rigged.glb')` back to `tools/build2.py` to bring him back.
- [ ] Unfinished rig items if he returns: fingers that close around the hilt, the tank's top nozzle, elbow and knee positions, a sharper texture.

## 2. Lightsaber
The centrepiece. It should feel like a tool you can do anything with.
- [ ] **Drawing the saber, with a choice of carry:** at the hip, cross-draw, on the back… picked in the menu, each with its own draw.
- [x] **The blade is a light source:** a coloured glow on the character's face and nearby surfaces, bright enough to light a dark room like a torch. *(done v25)*
- [x] **Sound:** ignite, the quiet hum, swings, clashes. *(done v25 (clashes still to do))*
- [x] **Cutting the world:** sparks and glowing scorch marks when the blade cuts the ground, walls and buildings. *(done v25)*
- [x] **Blade trail** as it swings and moves (the Lego Star Wars look). *(done v25)*
- [ ] **Customisable sabers,** saved as items: hilt, blade colour and more. Saved sabers appear under "saved items" in the inventory next time you play.
- [ ] **Draw and holster animations.** v14 does it with live arm IK. Mixamo clips would look better. *[needs you: Mixamo `Draw Sword 1`/`2`, `Sheath Sword 1`/`2`]*
- [ ] **Many more combos,** simple but plentiful, Fortnite-style. *[needs you: Mixamo Great Sword Pack, `One Hand Sword Combo`, `Two Hand Sword Combo`]*
- [x] **Dual-wield attacks for The Second.** v19: four dual combos from KayKit dual strikes and mirrored Quaternius hits (CC0).
  - [ ] More dual moves: a dual spin and dual air attacks. Mixamo is out (sign-in is broken for the owner), so these need another free source. Sketchfab blocks this container with a bot challenge.
- [ ] **More stances,** including a proper reverse-grip set (Ahsoka). *[needs you: Mixamo Great Sword idles, `Stabbing (Reverse Grip)`]*
- [ ] **Fix saber clipping:** 51 animations cut into the body. See `SABER_CLIPPING.md`. Priority: High guard while moving (legs), and combo hit B.
- [ ] **Clash effects** (saber on saber, saber on blaster bolt).
- [ ] **Akimbo and double-bladed staff** as full move sets (they only exist as options now).
- [ ] **Running with an ignited saber:** a dedicated run clip. *[needs you: Mixamo `Run With Sword`]*

## 3. Rifle and guns
- [x] **Cover shooting (RDR2 / GTA V):** a button to duck behind cover; peek out, aim out and duck back; reload crouched behind cover; blind-fire over the top without exposing yourself. *(done v26)*
- [ ] **First-person mode** with aim down sights, and **leaning** around corners while aiming.
- [x] **Snipers that feel like Black Ops 2:** quickscoping matters; optional trickshot mechanics. *(done v24 (trickshots still to do))*
- [x] **More guns:** shotgun, sniper rifles and more; Fortnite-level variety. *(done v24, v27)*
- [x] **Attachments from the item menu:** right-click (long-press on a phone) a weapon in the inventory → e.g. "Add suppressor". *(done v27 (tap the gun in the inventory))*
- [ ] **Rifle on the back; draw and holster.** *[needs you: Mixamo `Grab Rifle From Back`, `Put Back Rifle`]*
- [ ] **Two-handed rifle locomotion.** *[needs you: Mixamo `Rifle 8-Way Locomotion Pack`]*
- [ ] **Cock the rifle on spawn or equip:** procedural bolt pull. *[free assets: Flat Guns East rifles have bolt bones]*
- [ ] **Hip fire and aim-down-sights fire.** *[needs you: Mixamo `Firing Rifle`, `Rifle Aiming Idle`]*
- [ ] **Reloads:**
  - tactical (ammo left) versus empty
  - aiming versus not aiming
  - an alternate reload about 20% of the time, just as fast

  *[needs you: Mixamo `Reloading`; the variants come from procedural bolt and magazine motion]*
- [x] **Weapon switching** between rifle and saber. *(done v23)*
- [ ] **First-person mode:** arms, aim down sights, reloads. *[free assets: CC0 FPS rifle hands; better: Sketchfab ccransh FPS hands, CC-BY]*
- [x] **Pistol feel:** the shot, flash, tracer and hit marker work (v12). Still to do: recoil animation, sound, ammo and reload. *(done v24)*
- [x] **Shotgun.** *[later]* *(done v24)*

## 4. Grappling hook
- [x] ~~Grapple onto enemies.~~ Done in v13: hook, stun, pull in, strike.
- [x] **Swinging** (Spider-Man style) as an option next to the zip-line. *(done v28 (a setting in the Weapon panel))*
- [ ] **Hanging and climbing on walls** when the hook lands mid-wall. *[needs you: Mixamo `Hanging Idle`, `Braced Hang`, `Climbing Up Wall`]*
- [x] **Grapple yank:** pull the enemy to you instead of you to them. *(done v28 (hold right-click as you grapple))*
- [ ] **Rope physics:** sag and wobble on the rope.
- [ ] **Per-character grapple:** a wrist hook only for characters who have it, from the ability pool (see section 6).

## 5. Movement variety
- [ ] **More athletic sprints and runs.** *[needs you: Mixamo `Sprint`, `Fast Run`, `Two Cycle Sprint`]*
- [ ] **Knee slide, and a second slide for after long sprints.** *[needs you: Mixamo `Running Slide`, `Sprint To Backslide`]*
- [ ] **Real jump, flip and landing clips.** *[needs you: Mixamo `Front Flip`, `Running Forward Flip`, `Hard Landing`]*
- [ ] **Vault and roll** over low blocks. *[free assets: CMU vault and roll mocap]*
- [x] **Wall run** (fits the fun-first feel). *(done v25)*
- [ ] **The Second's green trail** when he bursts forward, and a Force dash.

## 6. Gadgets and abilities
- [ ] **Fortnite-style weapons:** swords with lunges, a plunger-style grappling hook, fun side weapons.
- [x] **Grenade types:** impact (done), **fire** (leaves a trail of fire that blocks an enemy's path), **sticky** (sticks to an enemy and kills outright, even armoured ones). *(done v28 (sticky and fire; plus a teleport orb))*
- [ ] **Grappling that feels like Arkham Knight.**
- [ ] **Fortnite-inspired gadgets** (inspired, not copied): go through the vaulted-items catalogue and pick ideas, e.g. a thrown orb that teleports you where it lands.
- [x] ~~Jetpack~~ (v14). Still to do: fuel, a proper model and sound, and hover animations from Mixamo (`Flying`).
- [x] ~~Impact grenade.~~ Done in v12. Still to do: a grenade model, sound, and a count per life.
- [ ] **Ability pool assigned per character** as each one is added. Examples: wrist grapple, Force push, dash, grenades.
- [x] **Force moves:** push is done (v12); pull and levitate still to do. *[free assets: Power Up, Levitate clips]* *(done v25 (pull, choke, lightning))*

## 6b. Looting and inventory
- [x] **Creative menu:** a catalogue of every weapon and item; drag any of them into an inventory slot. Keep it uncluttered: options live in each item's own menu (right-click / long-press), not on the main screen. *(done v27)*
- [ ] **Saved items:** customised weapons (sabers, pistols with attachments) saved and listed in the inventory.
- [x] ~~Loot bodies (kneel, rummage, items pop up).~~ Done in v15, cosmetic.
- [x] ~~Inventory: hotbar and backpack, loot is kept.~~ Done in v16. Pistol ammo and reloads done in v17. Still to do: stims healing once health exists, dropping items, and credits for something.
- [ ] **Loot per enemy type** once there are more enemy types.
- [ ] **Better rummage animations and a quick-loot tap.** *[needs you: Mixamo `Kneeling Pointing`, `Picking Up`, `Searching Pockets`]*

## 6c. Enemy types, killstreaks and modes
- [ ] **Enemy types like MW2 Spec Ops** (types, not just skins): infantry, **juggernauts** (heavily armoured), **dogs**, and later droids.
- [ ] **Killstreaks,** e.g. a support gunship or an ally covering you, like the co-op mission "Big Brother" where someone assists you as you run through enemies.
- [x] **Health:** slow regenerating health (about a minute to heal fully), with the saber still one-hit lethal to enemies. *(done v26)*
- [ ] **Armour** you find and wear (Skyrim-ish).
- [x] **Difficulty modes:** easy, normal, hard, extreme. *(done v26)*
- [x] **Stealth** (Metal Gear). *(done v26 (patrols, takedowns))*
- [ ] **Emotes** (Fortnite / Destiny).

## 6d. Destruction (Rainbow Six Siege)
Not everything breaks, but some things do, and by material:
- [x] **Stone:** buildings; they take marks (bullet holes, saber scorch) but stand. *(done v27)*
- [x] **Glass:** shatters completely. *(done v27)*
- [x] **Wood (soft walls):** can be destroyed; the fragments stay on the ground. **Partial destruction:** a grenade in the right corner takes out mostly that corner and leaves the rest of the wall standing. *(done v27)*
- [ ] **Bullet holes** in soft walls you can see through.

## 7. Your characters
- [ ] **Character creator like Fallout:** face shape, cheekbones, facial hair and more, with extreme settings allowed. Helmets on a giant head: a "silly" option (the face clips through) or "squish to fit" (the helmet stays on); sensible limits on the sliders.
- [ ] **Turn the paintings into 3D models,** starting with The Second (turnaround ready). *[needs you: `HF_TOKEN` in the environment settings]*
- [ ] **Rig them and load them** with the current animation sets.
- [ ] **Assign each character a class.** *[needs you: which characters are heavy infantry]*
- [ ] **Capes and fabric** for Purple Shadow, Reznod, Crimson Ninja and others. *[free assets: three-vrm spring bones]*
- [ ] **A character select screen** once there's more than one character.

## 8. Sound
- [ ] The saber hum and ignite first (see section 2); enemy chatter and voice lines later.
*[later, but the files are ready: 668 free sounds in `assets/misc/sounds`]*
- [ ] Footsteps, jump and land, slide.
- [ ] Saber ignite, hum, swing, clash.
- [ ] Gunshots, reloads, dry fire, shell casings.
- [ ] Grapple fire and reel.
- [ ] Grenade.
- [ ] Menu clicks.

## 9. Look and lighting
- [ ] **Setting:** an ancient-Roman-style city like Naboo, with close-quarters areas and sniper areas.
- [ ] **Later areas:** water with islands and boats (Zelda); puzzle areas with a Portal vibe.
*[later]*
- [ ] The painted look from your Lego paintings.
- [ ] Lighting, sky and shadows.
- [ ] Building detail beyond grey boxes.

## 10. Testing and tools
- [x] **Performance readout** (v21): Menu → Tests → Performance, with soldier counts 5/10/20/40.
- [ ] **Your v14 play test**, especially: swing then move, aim + fire, draw/holster, jetpack, pushing bodies.
- [ ] **Reports sending by themselves from the iPhone app.** The next report will show why they failed (`dbState`).
- [ ] **A play test on a real iPhone** of the latest version.
- [x] **Turn infinite jumps off** *(v32: off by default; the switch is in Weapon → Settings)*
