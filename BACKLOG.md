# Backlog

Everything asked for so far that isn't built yet, grouped so nothing gets lost. Done items move to `CHANGELOG.md`.

**Tags:**
- **[needs you]:** waiting on something only you can do (a token, a login download, a decision).
- **[free assets]:** can be built from what's already in `assets/`.
- **[later]:** you said to leave it for now.

---

## 1. Enemies and combat testing
- [ ] **About five enemy soldiers** (not zombies) within a close radius. They're aggressive and shoot at you, but do no damage. *[free assets: Quaternius SWAT, Toon Shooter soldiers, cyberpunk robots, all with shoot, hit and death clips]*
- [ ] **Ragdoll on death, bodies staying 1–2 minutes** like Call of Duty. *[free assets: Rapier or Jolt physics, downloaded]*
- [ ] **Hit reactions** on enemies. *[free assets]*
- [ ] **Health per class,** using your rules: Force lowest, heavy highest. The current numbers are placeholders and unused.
- [ ] **Saber hits connect with enemies:** damage, hit stop, sparks.
- [ ] **Blocking stops incoming shots and attacks;** parry timing.
- [ ] **Enemy AI:** approach, take cover, shoot. *[free assets: Yuka]*

## 2. Lightsaber
- [ ] **Draw and holster animations.** *[needs you: Mixamo `Draw Sword 1`/`2`, `Sheath Sword 1`/`2`]*
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
- [ ] **Pistol shooting:** muzzle flash, recoil, hit markers. The aim stance exists already. *[free assets]*
- [ ] **Shotgun.** *[later]*

## 4. Grappling hook
- [ ] **Swinging** (Spider-Man style) as an option next to the zip-line.
- [ ] **Hanging and climbing on walls** when the hook lands mid-wall. *[needs you: Mixamo `Hanging Idle`, `Braced Hang`, `Climbing Up Wall`]*
- [ ] **Grapple onto enemies** to pull them to you, or you to them.
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
- [ ] **Impact grenade** you can throw. *[free assets: throw clips, explosion sounds]*
- [ ] **Ability pool assigned per character** as each one is added. Examples: wrist grapple, Force push, dash, grenades.
- [ ] **Force moves:** push, pull, levitate. *[free assets: Two-hand Blast, Power Up, Levitate clips]*

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
- [ ] **Reports sending by themselves from the iPhone app.** The next report will show why they failed (`dbState`).
- [ ] **A play test on a real iPhone** of the latest version.
- [ ] **Turn infinite jumps off** (Menu → Setup) once the double-jump rules matter again.
