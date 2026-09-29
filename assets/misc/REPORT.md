# Enemies, ragdoll, cloth, sounds and code libraries (sourced 29 Sep 2026)

Everything is in this folder (111 MB). It was checked with `verify.html` in headless Chromium against three r186:
- All 16 models load and play their first clip.
- All 7 libraries initialise, including the Rapier and Jolt WASM builds.
- All 668 sounds decode.

**Blocked (403):** sonniss.com, pixabay, zapsplat, poly.pizza.

## 1. Test enemies
| Name | Clips | License | Path |
|---|---|---|---|
| Quaternius Toon Shooter: Soldier / Enemy / Hazmat (2.2 m) | Death, Duck, HitReact, Idle, Idle_Shoot, Jump, Jump_Idle, Jump_Land, No, Punch, Run, Run_Gun, Run_Shoot, Walk, Walk_Shoot, Wave, Yes | CC0 | models/quaternius_toonshooter/Characters/glTF/ |
| Toon Shooter guns | AK, Pistol, SMG, Shotgun, Sniper x2, Revolver x2, Rocket and Grenade Launcher, Grenade x2, Knife x2 (static) | CC0 | models/quaternius_toonshooter/Guns/glTF/ |
| **Quaternius Swat, Spacesuit** (1.8 m, realistic proportions) | Death, Gun_Shoot, HitRecieve 1–2, Idle, Idle_Gun, Idle_Gun_Pointing, Idle_Gun_Shoot, Idle_Neutral, Idle_Sword, Interact, Kick_L/R, Punch_L/R, Roll, Run, Run_Back/Left/Right, Run_Shoot, Sword_Slash, Walk, Wave | CC0 | models/quaternius_modular_chars/Individual Characters/glTF/ |
| Quaternius Cyberpunk character | 22 clips (same set as Swat) | CC0 | models/quaternius_cyberpunk/Character/ |
| Cyberpunk robot enemies (2-leg, large, flying, turrets) | Attack, Death, Idle, Jump, Run, Shoot, Walk | CC0 | models/quaternius_cyberpunk/Enemies/ |
| Quaternius Mechs (5–6.5 m; scale down) | Dance, Death, HitRecieve, Idle, Jump, Kick, Punch, Run, Shoot, SwordSlash, Walk… | CC0 | models/quaternius_mech/ |
| three.js RobotExpressive | Dance, Death, Idle, Jump, Punch, Running, Walking, WalkJump, Wave… | CC0 | models/threejs_examples/ |

## 2. Ragdoll (bodies stay 1–2 minutes)
- **Rapier** (`@dimforge/rapier3d-compat`, Apache-2.0):
  - Joints with limits and a rope joint (also what a grappling hook needs).
  - A character controller.
  - Resting bodies sleep, so leaving corpses around is cheap.
  - Capsule ragdoll example (pemmyz, MIT). Mapping it to bones is about 150 lines.
  - Files: libs/npm/dimforge-rapier3d-compat-0.21.0/ and libs/examples/pemmyz_rapier_ragdoll/.
- **Jolt** (`jolt-physics`, MIT):
  - Native skeleton ragdoll with motors (active ragdoll).
  - `libs/examples/jolt/rig/` loads a human ragdoll driven by animations. `create_rig.html` builds one in code.
- **cannon-es** (MIT): simple box-and-sphere ragdoll only.

## 3. Capes and cloth
- **@pixiv/three-vrm-springbone** (MIT): spring bones on any bone, with colliders. This is the cheapest cape. Files: libs/npm/pixiv-three-vrm-springbone-3.5.5/.
- **Fallbacks:** three.js Verlet cloth r132 (libs/examples/threejs/webgl_animation_cloth_r132.html), cannon-es cloth, and ammo soft-body cloth.

## 4. Sounds
| Need | Pick | License | Where |
|---|---|---|---|
| Footsteps (concrete) | Kenney `footstep_concrete_000-004` | CC0 | sounds/kenney/kenney_impact-sounds/Audio/ |
| Jump / land | OGA `jumpland.wav`, `Jump_1-3.wav`; freesound 678839, 363922 | CC0 | sounds/opengameart/ |
| Slide | **Gap.** Stand-in: Kenney `cloth1-4` plus a pitched-down whoosh | CC0 | |
| Whoosh / double jump | OGA Swishes `swish-1..13` | CC0 | sounds/opengameart/cc0_swishes/ |
| Rifle shots | Free Firearm Sound Library (AK-47, AR-15, SKS, pistol, shotgun); trimmed to 6 s | CC0 | sounds/free_firearm_library/ |
| Reloads | OGA `assaultriflereload1_0`, `gunreload1`, `clipload1/2`; freesound 725397 (M16 full reload) | CC0 | sounds/opengameart/ |
| Draw / holster | freesound 239959, 767308, 767309 | CC0 | sounds/freesound_cc0_previews/ |
| Dry fire | freesound 725402, 460852 | CC0 | |
| Shell casings | freesound 347603, 777923 | CC0 | |
| Lightsaber | freesound 47124–47126, 540214 (ignite, hum, off, swing). Clash is a **gap**: layer Kenney `impactMetal_heavy` with a swing. | CC0 | |
| Grappling hook | freesound 792318 (extend and retract), 685748 (reel) | CC0 | |
| Grenade | freesound 609587 (best); Kenney `explosionCrunch` | CC0 | |
| Body fall | freesound 461697, 119825 | CC0 | |
| UI clicks | Kenney UI Audio | CC0 | sounds/kenney/ |

Freesound files are HQ previews from its public CDN. `sounds/freesound_cc0_previews/INDEX.csv` maps the IDs; full-quality originals need a login.

**Credit required:**
- Michel Baradari: 2 HQ Explosions and 2 Metal Weapon Clicks (CC-BY 3.0).
- Vincent Sevedge: Gunshot Sounds (CC-BY 3.0).
- Gary (PARPG): Handling Guns (CC-BY-SA 3.0).

## 5. Code to reuse instead of writing
- **nipplejs** (MIT): mobile joystick.
- **Sketchbook** (MIT): third-person character state machine. Add Slide and DoubleJump.
- **three-fps** (MIT): weapon state machine, first-person viewmodel, recoil and muzzle flash.
- **Yuka** (MIT): enemy AI state machines and steering.
- **three.js examples:** `games_fps`, `physics_rapier_character_controller`, `skinning_additive_blending` (upper-body aim layers), `skinning_ik`.
- **Grappling hook:** no three.js repo exists. Build it on Rapier's rope joint, shortening the rope to reel in.
