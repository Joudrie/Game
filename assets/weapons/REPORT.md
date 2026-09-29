# Weapons, lightsaber and first-person assets (sourced 29 Sep 2026)

107 MB, 370 GLBs. All load in three.js and pass gltf-validator (details in `_tools/validation-results.txt`). Each folder has a `SOURCE.txt`. `mixamo-catalogue.txt` lists 580 Mixamo animation names scraped from its public search.

## Headline
- **Rifle body animations (draw, ADS, reload, fire) only exist free on Mixamo**, which needs your Adobe login.
- Mixamo has only **one** standing reload. It has no tactical-vs-empty reload, no "cock on equip" and no separate hip vs ADS fire.
- **Workaround:** use the CC0 **Flat Guns East** rifles, which have `Bolt` and `Magazine` bones, and move the bolt in code. The same Mixamo reload plus a bolt pull gives the empty reload and the "cock on spawn".
- **Lightsaber:** nothing free has ignite, reverse grip (Ahsoka) or named forms. Closest substitutes are below.

## A. Rifle
**Downloaded (CC0 unless noted):**
- `quaternius-toon-shooter/`: soldier with Idle_Shoot, Run_Gun, Run_Shoot, Walk_Shoot (hip fire only, toon rig).
- `quaternius-animated-guns/`: gun-side animations (Rifle Fire/Reload, Sniper, Shotgun, Pistol slide, P90, Revolver).
- `oga-flat-guns-east/`: 10 rigged guns with Bolt, Magazine, MagRelease, Trigger and Stock bones plus attach sockets. **Best base for the bolt and reload motion.**
- `godot-tps-demo-robot/` (CC-BY 3.0): aim poses, strafes, running while aiming (arm-cannon robot rig; reference).
- `zenxchaos-tps-anims/` (Unlicense stated, **source unverified**): revolver and shotgun aim, reload loops.

**Mixamo (login):**
- **Pack:** "Rifle 8-Way Locomotion Pack" (49 clips; same as "Pro Rifle Pack")
- **Draw:** "Grab Rifle From Back"
- **Holster:** "Put Back Rifle"
- **Idle:** "Rifle Idle" (4 variants)
- **ADS:** "Rifle Aiming Idle", "Walking" (while aiming), "Rifle Down To Aim", "Rifle Aim To Down"
- **Fire:** "Firing Rifle" (standing, walking, running, crouch), "Shoot Rifle"
- **Reload:** "Reloading", plus "Reload" (walk, run, crouch)
- **Extras:** "Inspecting", "Toss Grenade", "Dive Roll"

## B. Pistol and shotgun
- **Free:** UAL1 Pistol_Idle/Aim/Reload/Shoot (already in the game's Library).
- **Mixamo:** "Pistol/Handgun Locomotion Pack" (no pistol reload), "Gunplay – Remington Shotgun".

## C. Lightsaber and swords
**Free (CC0):**
- UAL2 sword chain A→B→C with recoveries, Combo, Heavy Combo, Block and Dash (in the game's Library).
- Mesh2Motion `human-addon-animations.glb`: Sword_Attack_Air_Vertical, Defend, Dodges, Fighting Idle, Two-hand Blast, Levitate, Power Up.

**Mixamo:**
- "Great Sword Pack" (51)
- "Lite Sword and Shield Pack" (draw and sheath)
- "One Hand Sword Combo", "Two Hand Sword Combo", "Dual Weapon Combo"
- "Run With Sword"
- "Stabbing (Rear Hand Reverse Grip)"

**Gaps and substitutes:**
| Wanted | Substitute |
|---|---|
| Ignite | "Draw Sword 1" plus a blade that grows in code |
| Reverse grip | Knife reverse-grip stabs, or the hilt flipped 180° in the hand |
| Dual stance | "Dual Weapon Combo" |
| Parry | Block plus "Great Sword Impact (Blocked)" |

## D. First-person arms
- **CC0 downloaded:** `oga-fps-rifle-hands/` (rifle and hands, fire clip) and `oga-fps-arms-rigged/`.
- **Sketchfab CC-BY (login; credit the author):**
  - ccransh "Animated FPS hands (rifle animation pack)" (5f2d0ed780a94724b36ab505f7564057)
  - barcodegames "M4 - FPS Weapon Animations Pack" (662fc74dda2646cfb48fc610705768ef)
  - ccransh MP5 (568f00dd76944baaa5eae1a1cc871423)
  - 1Matzh "9mm Pistol FP" (c26d7f5aa72f4b01a6da4578caa8f07f)

## E. Weapon models (CC0, downloaded)
- **Quaternius Ultimate Gun Pack:** 5 assault rifles, 6 snipers, 5 SMGs, 4 shotguns, 6 pistols, 5 revolvers, plus attachments.
- **Quaternius sci-fi modular guns and sci-fi gun pack:** AR_1–6 and others.
- **Kenney Blaster Kit:** 18 blasters.
- **Medieval weapons and 45 low-poly swords.**
- **OGA Energy Sword:** the only CC0 lightsaber-like model.
- **Lightsaber hilts (Sketchfab CC-BY, login):**
  - Simplix "Lightsaber" (69780e045dd449f786110f990441d4a1)
  - "Katarn's lightsaber" (4448ab9d464a4bd18556ce69fbdfc161)
  - "Customizable Lightsaber (ADVANCED RIG)" (82ad38a3b78d4209b3f5b90119be0fba)
  - and others. Lightsabers are Lucasfilm IP: fine for a personal build, not for a public release.

## Mixamo steps
1. Sign in at mixamo.com and use Y Bot, or upload your character.
2. Search each name above.
3. Download FBX Binary at 30 fps. Tick "Without Skin" after the first one, and "In Place" for loops.
4. Send me the files. I'll retarget them onto the game skeleton, the same way I did the soldier's clips.
5. Mixamo's licence allows use in games but not sharing the raw files.

## Not usable
Paragon, Lyra, UE5 GASP (Unreal-only licences) and Unity Asset Store packs.
