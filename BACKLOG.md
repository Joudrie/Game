# Backlog

Everything asked for so far that isn't built yet, grouped so nothing gets lost. Done items move to `CHANGELOG.md`.

**Tags:**
- **[needs you]:** waiting on something only you can do (a token, a login download, a decision).
- **[free assets]:** can be built from what's already in `assets/`.
- **[later]:** you said to leave it for now.

---

## The vision (owner, v21)
No plot. A **third-person combat sandbox, creative-mode style**, where movement and combat are the whole point. **Jedi: Survivor** is the gameplay template, **Lego Star Wars** the model for saber feel (the little blade trail), **Fortnite** the inspiration for gadgets.

The ground rules:
- **The lightsaber is lethal.** If it touches you, you're in trouble. No health bar slowly going down: it cuts.
- **Dismemberment is not for gore's sake:** when you slice a droid, it should actually come apart. Humans can lose a hand and keep fighting without it.
- **Every weapon is deadly.** Enemies have little health; difficulty comes from **numbers**, not bullet sponges. Being overwhelmed, not being on round 20 with enemies that soak up 1000 bullets.
- **Keep the game small** if that buys more enemies on screen.
- **Mostly droids** as enemies, plus the human soldiers we have.

## 0. Next up: your asks from the v20 play test
(They were on hold for The Second's rig; The Second is now shelved, so these are open.)
- [ ] **Jetpack off by default;** you turn it on yourself. (The switch exists in the Weapon panel; the default flips.)
- [ ] **Pistol stuck pointing at the sky:** after aiming and firing, recoil leaves the gun pointing up until the mouse moves again. Find the root cause (recoil offset not decaying while the mouse is still).
- [ ] **Bullet holes** where shots hit boxes and the ground; short-lived decals.
- [ ] **A better pistol model** from a free, licensed source.
- [ ] **Move presets:** instead of rotating at random, pick a default per slot (and saved presets), e.g. "always this idle, this run".

## 1. Enemies and combat testing
- [x] ~~Five enemy soldiers, deaths by cause (head, torso, legs, explosion, push, wall impact), bodies staying 90 s, hit reactions.~~ Done in v12.
- [ ] **Physics ragdoll** on top of the death animations, so bodies slump over steps, roofs and each other. v14 fakes the flight (clip stretched to the flight, head-over-heels flips). *[free assets: Rapier or Jolt physics, downloaded]*
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
- [ ] **Blocking stops incoming shots and attacks;** parry timing.
- [ ] **Enemy AI:** approach, take cover, shoot. *[free assets: Yuka]*

- [ ] **Zombies mode** (eventually): slow, many, keep crawling after losing legs. Later rounds bring **more zombies, not tougher ones**: each keeps a small amount of health, so it stays tactical. *[free assets: Quaternius zombie models and animations]*
- [ ] **Dismemberment polish:** choose the cut from where the blade actually passed; **hands and arms cut off living soldiers, who keep fighting without them**; dismemberment on every model we add (droids, robots); blood decals on the ground (sparks for droids).
- [ ] **One-touch saber lethality:** a blade that touches a soldier cuts or kills, instead of taking a slice of health.
- [ ] **More combat moves:** air slash combos, a dash strike, a grapple yank (pull the enemy to you instead), a finisher on stunned soldiers.

## 0. On hold until The Second's rig is finished (owner's order, v20.2)
- [ ] **Jetpack off by default;** you turn it on yourself. (The switch exists in the Weapon panel; the default flips.)
- [ ] **Pistol stuck pointing at the sky:** after aiming and firing, recoil leaves the gun pointing up until the mouse moves again. Find the root cause (recoil offset not decaying while the mouse is still).
- [ ] **Bullet holes** where shots hit boxes and the ground; short-lived decals.
- [ ] **A better pistol model** from a free, licensed source.
- [ ] **Move presets:** instead of rotating at random, pick a default per slot (and saved presets), e.g. "always this idle, this run".
- [ ] **Easy model switching:** The Second or the default hero. v20.2 put the switch in Menu → Moves; a quicker toggle could follow.

## 1b. The Second *[later: shelved in v21]*
The image-to-3D route was too rough: the colour step never worked on Hugging Face, Blender needs a T-pose, and image generators can't draw a side-on T-pose. The files and tools stay in the repo (`assets/characters/the-second/`, `tools/bake_the_second.py`, `tools/rig_the_second.mjs`); he's just not in the build. Add `"second": b64('the_second_rigged.glb')` back to `tools/build2.py` to bring him back.
- [ ] Unfinished rig items if he returns: fingers that close around the hilt, the tank's top nozzle, elbow and knee positions, a sharper texture.

## 2. Lightsaber
The centrepiece. It should feel like a tool you can do anything with.
- [ ] **Drawing the saber, with a choice of carry:** at the hip, cross-draw, on the back… picked in the menu, each with its own draw.
- [ ] **The blade is a light source:** a coloured glow on the character's face and nearby surfaces, bright enough to light a dark room like a torch.
- [ ] **Sound:** ignite, the quiet hum, swings, clashes.
- [ ] **Cutting the world:** sparks and glowing scorch marks when the blade cuts the ground, walls and buildings.
- [ ] **Blade trail** as it swings and moves (the Lego Star Wars look).
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
- [ ] **Attachments from the item menu:** right-click (long-press on a phone) a weapon in the inventory → e.g. "Add suppressor".
- [ ] **Rifle on the back; draw and holster.** *[needs you: Mixamo `Grab Rifle From Back`, `Put Back Rifle`]*
- [ ] **Two-handed rifle locomotion.** *[needs you: Mixamo `Rifle 8-Way Locomotion Pack`]*
- [ ] **Cock the rifle on spawn or equip:** procedural bolt pull. *[free assets: Flat Guns East rifles have bolt bones]*
- [ ] **Hip fire and aim-down-sights fire.** *[needs you: Mixamo `Firing Rifle`, `Rifle Aiming Idle`]*
- [ ] **Reloads:**
  - tactical (ammo left) versus empty
  - aiming versus not aiming
  - an alternate reload about 20% of the time, just as fast

  *[needs you: Mixamo `Reloading`; the variants come from procedural bolt and magazine motion]*
- [ ] **Weapon switching** between rifle and saber.
- [ ] **First-person mode:** arms, aim down sights, reloads. *[free assets: CC0 FPS rifle hands; better: Sketchfab ccransh FPS hands, CC-BY]*
- [ ] **Pistol feel:** the shot, flash, tracer and hit marker work (v12). Still to do: recoil animation, sound, ammo and reload.
- [ ] **Shotgun.** *[later]*

## 4. Grappling hook
- [x] ~~Grapple onto enemies.~~ Done in v13: hook, stun, pull in, strike.
- [ ] **Swinging** (Spider-Man style) as an option next to the zip-line.
- [ ] **Hanging and climbing on walls** when the hook lands mid-wall. *[needs you: Mixamo `Hanging Idle`, `Braced Hang`, `Climbing Up Wall`]*
- [ ] **Grapple yank:** pull the enemy to you instead of you to them.
- [ ] **Rope physics:** sag and wobble on the rope.
- [ ] **Per-character grapple:** a wrist hook only for characters who have it, from the ability pool (see section 6).

## 5. Movement variety
- [ ] **More athletic sprints and runs.** *[needs you: Mixamo `Sprint`, `Fast Run`, `Two Cycle Sprint`]*
- [ ] **Knee slide, and a second slide for after long sprints.** *[needs you: Mixamo `Running Slide`, `Sprint To Backslide`]*
- [ ] **Real jump, flip and landing clips.** *[needs you: Mixamo `Front Flip`, `Running Forward Flip`, `Hard Landing`]*
- [ ] **Vault and roll** over low blocks. *[free assets: CMU vault and roll mocap]*
- [ ] **Wall run** (fits the fun-first feel).
- [ ] **The Second's green trail** when he bursts forward, and a Force dash.

## 6. Gadgets and abilities
- [ ] **Fortnite-inspired gadgets** (inspired, not copied): go through the vaulted-items catalogue and pick ideas, e.g. a thrown orb that teleports you where it lands.
- [x] ~~Jetpack~~ (v14). Still to do: fuel, a proper model and sound, and hover animations from Mixamo (`Flying`).
- [x] ~~Impact grenade.~~ Done in v12. Still to do: a grenade model, sound, and a count per life.
- [ ] **Ability pool assigned per character** as each one is added. Examples: wrist grapple, Force push, dash, grenades.
- [ ] **Force moves:** push is done (v12); pull and levitate still to do. *[free assets: Power Up, Levitate clips]*

## 6b. Looting and inventory
- [ ] **Creative menu:** a catalogue of every weapon and item; drag any of them into an inventory slot. Keep it uncluttered: options live in each item's own menu (right-click / long-press), not on the main screen.
- [ ] **Saved items:** customised weapons (sabers, pistols with attachments) saved and listed in the inventory.
- [x] ~~Loot bodies (kneel, rummage, items pop up).~~ Done in v15, cosmetic.
- [x] ~~Inventory: hotbar and backpack, loot is kept.~~ Done in v16. Pistol ammo and reloads done in v17. Still to do: stims healing once health exists, dropping items, and credits for something.
- [ ] **Loot per enemy type** once there are more enemy types.
- [ ] **Better rummage animations and a quick-loot tap.** *[needs you: Mixamo `Kneeling Pointing`, `Picking Up`, `Searching Pockets`]*

## 7. Your characters
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
*[later]*
- [ ] The painted look from your Lego paintings.
- [ ] Lighting, sky and shadows.
- [ ] Building detail beyond grey boxes.

## 10. Testing and tools
- [x] **Performance readout** (v21): Menu → Tests → Performance, with soldier counts 5/10/20/40.
- [ ] **Your v14 play test**, especially: swing then move, aim + fire, draw/holster, jetpack, pushing bodies.
- [ ] **Reports sending by themselves from the iPhone app.** The next report will show why they failed (`dbState`).
- [ ] **A play test on a real iPhone** of the latest version.
- [ ] **Turn infinite jumps off** (Menu → Setup) once the double-jump rules matter again.
