# Credits and licences

Most assets are CC0 (public domain) and need no credit. The ones below need credit or have conditions. Per-folder details are in each `SOURCE.txt` and in `assets/*/REPORT.md`.

## Used in the playable build
- **Soldier voices**: recorded by the owner (v37). `assets/voice/`.
- **The Second**: the owner's character, from their own turnaround images. Shape generated with **Tencent Hunyuan3D-2mv** (Tencent Hunyuan 3D 2.0 Community License; Tencent claims no rights in outputs; not licensed in the EU, UK or South Korea). Details in `assets/characters/the-second/SOURCE.txt`.
- **Quaternius**: Universal Animation Library 1 and 2, Superhero base character (CC0). The `MR_` clips are our left-to-right mirrors of its sword hits (`tools/bake_mirror.mjs`). quaternius.com
- **Mesh2Motion**: human add-on animations (CC0). github.com/scottpetrovic/mesh2motion-app v23 adds the Crawl clip (`M2M_Crawl`, crawling soldiers who lost a leg).
- **100STYLE dataset** (CC BY 4.0): I. Mason, S. Starke, T. Komura, "Real-Time Style Modelling of Human Locomotion via Feature-Wise Transformations and Local Motion Phases", 2022.
- **CMU Graphics Lab Motion Capture Database** (free for any use): mocap.cs.cmu.edu. BVH conversion by cgspeed.
- **KayKit Character Animations 1.1** by Kay Lousberg (CC0): kneel-and-fall death, two hit reactions, dual-wield chop, slice and stab. kaylousberg.itch.io
- **"Boba Fett/Mandalorian Jet Pack"** by Jace1969 on Printables (CC BY 4.0): the jetpack model. printables.com/model/23735
- **Quaternius Swat** (CC0): the enemy soldiers' body since v21 (`build/enemy_swat.glb`, via `tools/reskin_swat.mjs`), and their run, strafe, shoot and death clips.
- **three.js** example Soldier model (MIT repository; animations from Mixamo).

## In `assets/` (downloaded, not all used yet)
- **LaFAN1** (Ubisoft La Forge, CC BY-NC-ND 4.0): **non-commercial only**, no modified redistribution.
- **Bandai Namco Research motion dataset** (CC BY-NC 4.0): **non-commercial only**.
- **godot tps-demo robot** (CC-BY 3.0): Juan Linietsky and Fernando Miguel Calabró.
- **Sounds:**
  - Michel Baradari: "2 HQ Explosions" and "2 Metal Weapon Clicks" (CC-BY 3.0, OpenGameArt).
  - Vincent Sevedge: "Gunshot Sounds" (CC-BY 3.0, OpenGameArt).
  - Gary (PARPG): "Handling Guns" (CC-BY-SA 3.0, OpenGameArt).
- **openmw endorphin BVH deaths** (`assets/deaths/_UNLICENSED_reference_openmw_endorphin_bvh`): the repository has **no licence**, so these are reference only and are not in the game.
- **ACCAD motion capture** (Ohio State, CC BY 3.0): crouch-to-lie and get-up clips, not used yet.
- **zenxchaos-tps-anims**: listed as Unlicense by its repository. The original source of the animations is unverified.
- **Guns (v24):** Quaternius *Ultimate Gun Pack* (CC0): AssaultRifle_2 (AK-47), Shotgun_3 (pump), SniperRifle_3. See `build/GUNS_SOURCE.txt`.
- **Sounds (v24):** Free Firearm Sound Library (Walther PPQ, AK-47, Nova, Mosin-Nagant), OpenGameArt shotgun cock and handgun reload, Freesound 267895 (bolt), and Kenney Sci-fi Sounds (blaster, deflect, parry). All CC0. See `build/sfx/SOURCE.txt`; made by `tools/make_sfx.sh`.
- **Saber and Force sounds (v25):** Freesound 47124, 47125, 47126 (gyzhor), 591433 and 423799, plus Kenney forceField_001. All CC0; see `build/sfx/SOURCE.txt`.
- **v27:** the M4 carbine (AssaultRifle2_4), suppressor (Silencer_Short) and scope (Scope_1) from the same Quaternius *Ultimate Gun Pack* (CC0). Sounds: Free Firearm Sound Library AR-15, Kenney Impact Sounds (glass and wood breaking), and Freesound 609587 (grenade blast). All CC0; see `build/GUNS_SOURCE.txt` and `build/sfx/SOURCE.txt`.
- **v30:** fire flames and smoke are Kenney's *Particle Pack* (CC0), in `build/fx_flames.png` and `build/fx_smoke.png`. See `assets/misc/particles/SOURCE.txt`.
- **v33:** blood splats are the same pack's dirt sprites (CC0), in `build/fx_splat.png`.
- **v34 player outfit:** Quaternius *Modular Character Outfits - Fantasy* (CC0), the Ranger outfit, dressed onto the Superhero by `tools/dress_hero.mjs` into `build/hero_dressed.glb`. See `build/HERO_SOURCE.txt`.
- **v36 props:** Quaternius *Toon Shooter Game Kit* (CC0): the exploding barrel, gas tank, landmine and sign, packed by `tools/pack_props.mjs` into `build/props.glb`. See `build/PROPS_SOURCE.txt`.
- **v35 civilians:** Quaternius *Universal Base Characters* (bodies, hairstyles, eyes) and *Modular Character Outfits - Fantasy* (Peasant outfits), both CC0, combined by `tools/make_civilians.mjs` into `build/civilians.glb`. See `build/CIVILIANS_SOURCE.txt`.
- **v34 roads and sounds:** Kenney *City Kit (Roads)* (CC0): road tiles, street lights, traffic lights, signs, barriers, cones and dumpsters in `build/world_roads.glb`. New sounds from Kenney Impact, Interface, RPG and Sci-fi Sounds and Freesound 364690, 725402, 541975, 239959 and 461697 (all CC0); see `build/sfx/SOURCE.txt`.
- **v31 world:** Kenney *City Kit (Commercial)* 2.1, *City Kit (Industrial)* 2.0 and *Nature Kit* (CC0): the buildings, grass, flowers, bushes, rocks, trees and path stones, packed into `build/world_buildings.glb` and `build/world_nature.glb` by `tools/pack_buildings.mjs`. The clouds reuse the v30 Kenney smoke sprite. See `assets/world/kenney/SOURCE.txt`.
- Everything else (Kenney, Quaternius, OpenGameArt CC0, Freesound CC0, Free Firearm Sound Library) is CC0. Libraries (Rapier, Jolt, cannon-es, three-vrm, nipplejs, Yuka, Sketchbook, three-fps) are MIT or Apache-2.0.

## Not included (need a login)
Mixamo and Sketchfab downloads. Mixamo's licence allows use in games but not redistributing its raw files.
