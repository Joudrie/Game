# Credits and licences

Most assets are CC0 (public domain) and need no credit. The ones below need credit or have conditions. Per-folder details are in each `SOURCE.txt` and in `assets/*/REPORT.md`.

## Used in the playable build
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
- Everything else (Kenney, Quaternius, OpenGameArt CC0, Freesound CC0, Free Firearm Sound Library) is CC0. Libraries (Rapier, Jolt, cannon-es, three-vrm, nipplejs, Yuka, Sketchbook, three-fps) are MIT or Apache-2.0.

## Not included (need a login)
Mixamo and Sketchfab downloads. Mixamo's licence allows use in games but not redistributing its raw files.
