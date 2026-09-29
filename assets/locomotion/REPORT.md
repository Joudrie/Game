# Locomotion assets (sourced 29 Sep 2026)

Every GLB/glTF here loads in three.js GLTFLoader. UAL1/UAL2 bind to the Superhero character with 0 unresolved tracks. BVH files parse with BVHLoader. Helper scripts: `_tools/`.

## In the game now
- **Quaternius Universal Animation Library 1 and 2** (CC0): `quaternius_ual1/`, `quaternius_ual2/`, plus `Superhero_Male_FullBody.gltf` in `quaternius_base_characters/`. This is the main set, on a UE5-mannequin skeleton.
- **100STYLE** (CC BY 4.0; credit "100STYLE dataset, Mason et al."): `100style_bvh/`, retargeted offline into walk, run, crouch and idle variants.
- **CMU mocap** (free for any use): `cmu_bvh/`. Flips 87_03, 88_01 and 90_08 are baked as double-jump variants.
- **three.js Soldier** (Mixamo animations): walk, run and idle, retargeted.

## Available but not wired in yet
- **KayKit** `Rig_Medium_MovementAdvanced.glb` (CC0): running strafe left/right and walking backwards. It's a different skeleton, so it needs a bone map.
- **godot_demos/tps_player.glb** (CC-BY 3.0): strafe cycles.
- **CMU** vaults and rolls: 127_23 and 128_10 (dive-roll); 127_25 and 127_27 (jump-over).
- **LaFAN1** and **Bandai Namco** (`lafan1_bvh_NONCOMMERCIAL/`, `bandai_namco_bvh/`): high-quality sprint and obstacle mocap, **non-commercial only**.

## Gaps (get from Mixamo with your Adobe login)
Mixamo's search works without login, so these names are confirmed:
- **Slides:** `Running Slide`, `Sprint To Backslide`
- **Sprints:** `Sprint`, `Two Cycle Sprint`, `Fast Run`
- **Jumps:** `Jumping Up`, `Falling Idle`, `Hard Landing`
- **Flips:** `Front Flip`, `Running Forward Flip`, `Front Twist Flip`
- **Vaults and rolls:** `Jumping` (…obstacle, one hand planted), `Jump Over`, `Falling To Roll`
- **Packs:** `Male Locomotion Pack`, `Action Adventure Pack`

To download: choose FBX, 30 fps, and tick "In Place" for loops.

## Rejected
- Ready Player Me library: RPM-only license.
- anim.gameasset.net: unreliable CC0 claim.
- KayKit 1.2: legless chibi rig.
- GDQuest gdbot: CC-BY-NC-SA.
