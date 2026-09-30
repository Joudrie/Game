# Backlog

Everything asked for so far that isn't built yet, grouped so nothing gets lost. Done items move to `CHANGELOG.md`.

**Tags:**
- **[needs you]:** waiting on something only you can do (a token, a login download, a decision).
- **[free assets]:** can be built from what's already in `assets/`.
- **[later]:** you said to leave it for now.

---

## 1. Enemies and combat testing
- [x] ~~Five enemy soldiers, deaths by cause (head, torso, legs, explosion, push, wall impact), bodies staying 90 s, hit reactions.~~ Done in v12.
- [ ] **Physics ragdoll** on top of the death animations, so bodies slump over steps, roofs and each other. v14 fakes the flight (clip stretched to the flight, head-over-heels flips). *[free assets: Rapier or Jolt physics, downloaded]*
- [ ] **Enemies that look like enemies.** They use your hero's body with a darker tint for now. The SWAT soldier model is on disk, but its body doesn't fit our skeleton's proportions. *[free assets]*
- [ ] **More death variety:**
  - Mixamo has exact matches for your rules: `Death From Front Headshot`, `Hit To The Legs`, `Flying Back Death`, `Swing Into Wall`. The full list is in `assets/deaths/mixamo_death_hit_names.txt`. *[needs you: Mixamo login]*
  - The 27 openmw endorphin deaths are the best free set but have no licence. *[needs you: ask the author or skip]*
- [ ] **Death direction:** fall away from the shot. Needs the clips sorted by which way they fall, and mirrored copies.
- [ ] **Health per class,** using your rules: Force lowest, heavy highest. The current numbers are placeholders and unused.
- [ ] **Saber hits on enemies:** they already do damage (55 per hit, 90 for a heavy). Still to do: hit stop, sparks, and saber-specific deaths.
- [ ] **Blocking stops incoming shots and attacks;** parry timing.
- [ ] **Enemy AI:** approach, take cover, shoot. *[free assets: Yuka]*

- [ ] **Zombies** for dismemberment mode: slow, many, keep crawling after losing legs. *[free assets: Quaternius zombie models and animations]*
- [ ] **Dismemberment polish:** choose the cut from where the blade actually passed; limbs cut off living soldiers (they keep fighting one-armed); blood decals on the ground.
- [ ] **More combat moves:** air slash combos, a dash strike, a grapple yank (pull the enemy to you instead), a finisher on stunned soldiers.

## 2. Lightsaber
- [ ] **Draw and holster animations.** v14 does it with live arm IK. Mixamo clips would look better. *[needs you: Mixamo `Draw Sword 1`/`2`, `Sheath Sword 1`/`2`]*
- [ ] **Many more combos,** simple but plentiful, Fortnite-style. *[needs you: Mixamo Great Sword Pack, `One Hand Sword Combo`, `Two Hand Sword Combo`]*
- [ ] **Dual-wield attacks for The Second.** *[needs you: Mixamo `Dual Weapon Combo`]*
- [ ] **More stances,** including a proper reverse-grip set (Ahsoka). *[needs you: Mixamo Great Sword idles, `Stabbing (Reverse Grip)`]*
- [ ] **Fix saber clipping:** 51 animations cut into the body. See `SABER_CLIPPING.md`. Priority: High guard while moving (legs), and combo hit B.
- [ ] **Blade trail and clash effects.**
- [ ] **Akimbo and double-bladed staff** as full move sets (they only exist as options now).
- [ ] **Running with an ignited saber:** a dedicated run clip. *[needs you: Mixamo `Run With Sword`]*

## 3. Rifle and guns
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
- [x] ~~Jetpack~~ (v14). Still to do: fuel, a proper model and sound, and hover animations from Mixamo (`Flying`).
- [x] ~~Impact grenade.~~ Done in v12. Still to do: a grenade model, sound, and a count per life.
- [ ] **Ability pool assigned per character** as each one is added. Examples: wrist grapple, Force push, dash, grenades.
- [ ] **Force moves:** push is done (v12); pull and levitate still to do. *[free assets: Power Up, Levitate clips]*

## 6b. Looting and inventory
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
- [ ] **Your v14 play test**, especially: swing then move, aim + fire, draw/holster, jetpack, pushing bodies.
- [ ] **Reports sending by themselves from the iPhone app.** The next report will show why they failed (`dbState`).
- [ ] **A play test on a real iPhone** of the latest version.
- [ ] **Turn infinite jumps off** (Menu → Setup) once the double-jump rules matter again.
