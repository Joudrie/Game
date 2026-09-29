# Game

A mobile-first third-person action game prototype in three.js. The world is a white sky over flat grey ground. For now the only focus is movement: three classes, sprint, slide and double jump, plus a **Moves** screen for previewing and picking animation variants.

- **Plan and every instruction so far:** [PLAN.md](PLAN.md)
- **Where each asset came from:** [CREDITS.md](CREDITS.md) and `assets/*/REPORT.md`
- **Playable build:** `dist/index.html`. It's one self-contained file that loads three.js from jsDelivr. `dist/v1.html` is the first prototype.

## Layout
| Path | What |
|---|---|
| `src/game2.html` | Game source: the current version |
| `src/game.html` | First prototype (three.js Soldier) |
| `build/` | Packed character (`hero.glb`), animation libraries (`ual1_anims.glb`, `ual2_anims.glb`) and retargeted clips (`extra*.json`) |
| `tools/` | Asset pipeline and headless tests |
| `assets/` | Downloaded source assets: locomotion, weapons, enemies, sounds, physics libraries |

## Rebuild
```sh
npm install
node tools/pack.mjs          # character + UAL clips -> build/*.glb
node tools/bake_soldier.mjs  # Mixamo soldier clips -> build/extra_soldier.json
node tools/bake_bvh.mjs Neutral_FW.bvh:ST_Walk_Neutral ...  # 100STYLE mocap (see PLAN.md for the list)
node tools/bake_cmu.mjs      # CMU flips
node tools/bake_m2m.mjs "Run_Anime,Backflip,..."             # Mesh2Motion clips
python3 tools/build2.py      # embeds everything into dist/index.html
```
`tools/retarget.mjs` maps any T-posed humanoid clip (Mixamo, BVH mocap, UE-style rigs) onto the game skeleton, using world-space rotation deltas.
