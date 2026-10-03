# Asset shortlist: weapons, throwables, explosions, enemies (owner, after v47)

**Rule from now on (owner): no 3D models made by Claude in code.** Everything we add is downloaded, licensed and credited. **Done in v48:** pistol (G17), AK (AKM), M4 (M4a1), shotgun (Remington 870), sniper (L115A3) and the frag (M67), all TastyTony; enemies are bumstrum's "terrorist". The hand-made ones still in the game stay until a downloaded model replaces them:

| In the game now | Made by | Replace with |
|---|---|---|
| Sticky grenade, fire grenade, teleport orb (`makeThrowable`) | Claude, spheres and cylinders | Quaternius Toon Shooter `FireGrenade.glb` (on disk); Kenney Blaster Kit `grenade-a/b.glb` (on disk) for the sticky and the orb |
| Explosion look (flash + fire particles) | code, with Kenney textures | a CC0 explosion flipbook (below) |

Everything was checked on 2026-10-03: licence, author, downloadable, polygon count. **CC-BY means credit the author** in `CREDITS.md` and a `SOURCE.txt`. Skipped: NonCommercial and NoDerivs licences, and anything ripped from a commercial game. The Sketchfab API works from the container again (the 2026-09 bot challenge is gone): search `https://api.sketchfab.com/v3/search?type=models&q=…&downloadable=true`, download `https://api.sketchfab.com/v3/models/<uid>/download`.

## 1. Guns: TastyTony's low-poly set (CC-BY, Sketchfab)
One artist, **144 real-world guns** in one consistent low-poly style, 750 to 17,000 faces each (light enough for the play link). This should be our one gun source, so every gun matches.

| Our slot | Pick | Faces | Sketchfab id |
|---|---|---|---|
| Pistol | Low-Poly G17 (Glock) | 2.3k | search "Low-Poly G17" user TastyTony |
| Pistol (alt) | Low-Poly M1911, Beretta 92fs, Desert Eagle, Sig P226 | 2.2–4.3k | " |
| AK-47 | Low-Poly AKM | 6.9k | 849b7cdf8622487485febc40db89e734 |
| AK-47 (alt) | Low-Poly AK-47 Type 2 | 5.5k | a7260926fb0a40f8bba5f651b03d23f1 |
| M4 carbine | Low-Poly M4a1 | 10.7k | 8cab1cbeb82c4396a154f9fc8771417b |
| Pump shotgun | Low-Poly Remington 870 | 1.4k | 8766498ce778479aa03c3b6078937510 |
| Shotgun (alt) | Low-Poly SPAS-12, Mossberg 590 | 4.5k, 2.6k | c95154ea…, c0551a6b… |
| Sniper | Low-Poly L115A3 or M24a2 or SVD Dragunov | 8.1k / 4.7k / 9.2k | " |
| New: SMGs | MP5, MP7, Uzi, P90, Kriss Vector | 4–7k | " |
| New: machine guns | M249 SAW, PKM, M60 | 12–17k | " |
| New: launchers | RPG-7, Panzerfaust 3 | 3.2k, 5.4k | " |

Other good CC-BY single guns if we ever want higher detail: "AR-15 style rifle" (jeandiz, 30k, 50d33435…), "Remington 870 Shotgun" (milinam2002, 6.2k, 6db0ad47…), "Modern Sniper Rifle | Free Lowpoly" (dan741vlasov, 20k, 45c99509…).

## 2. Grenades and throwables
| Item | Pick | Licence | Where |
|---|---|---|---|
| Frag | **Low-Poly M67** (1k faces) or **Low-Poly RGD-5** (0.8k) | CC-BY, TastyTony | Sketchfab |
| Frag (alts) | MK2 Grenade, RG42, V40 Mini, M26 | CC-BY, TastyTony | Sketchfab |
| Impact grenade | Low-Poly RGO Impact | CC-BY, TastyTony | Sketchfab |
| Fire grenade | `FireGrenade.glb` | CC0, Quaternius Toon Shooter | already in `assets/weapons/quaternius-toon-shooter/` |
| Sci-fi (sticky, orb) | `Grenade_1..3.glb` / `grenade-a/b.glb` | CC0, Quaternius / Kenney | already in `assets/weapons/` |
| Molotov (later) | "Molotov Cocktail" (LiliumLetifer, 10k) | CC-BY | Sketchfab e57a0fd669974a3dab7d3919bda9032c |
| Dynamite (later) | "Dynamite" (MaX3Dd, 2.1k) | CC-BY | Sketchfab 7308cdc679c14e24880b8d05c2f22ffe |

## 3. Explosions, fire, smoke (all CC0)
| Pick | What | Where |
|---|---|---|
| **Unity Labs VFX flipbooks** | Explosion, FireBall, smoke flipbooks rendered in Houdini; the best-looking free option | [unity.com blog](https://unity.com/blog/engine-platform/free-vfx-image-sequences-flipbooks) |
| **Sinestesia "2D Explosion Animations"** | 4 explosions, 512 px frames, atlas | [OpenGameArt](https://opengameart.org/content/2d-explosion-animations-frame-by-frame) |
| StumpyStrust "Explosion Sheet" / "More Explosions" | sprite sheets | [OpenGameArt](https://opengameart.org/content/explosion-sheet), [more](https://opengameart.org/content/more-explosions) |
| Kenney Smoke Particles | 70 smoke and explosion sprites | [kenney.nl](https://kenney.nl/assets/smoke-particles) |
| CGHEVEN | explosion and fire flipbooks (CC0) | [cgheven.com](https://cgheven.com/blog/free-explosion-vfx-assets-for-cg-games-vfx-projects) |
Flipbooks are flat textures: they cost a few hundred KB, not polygons, and play on a camera-facing sprite (the fire particles already work this way).

## 4. Enemies (rigged characters)
Our enemies since v48: bumstrum's "terrorist" via `tools/reskin_enemy.mjs` (before: Quaternius SWAT via `tools/reskin_swat.mjs`). Any rigged humanoid with readable bone names can go through `reskin_enemy.mjs` with a new name map.

| Pick | Faces | Licence | Notes | Sketchfab id |
|---|---|---|---|---|
| **Quaternius Ultimate Modular Men** (11 characters incl. SWAT, 24 animations) | low | CC0 | what we use; the other 10 bodies are free variety | [quaternius.com](https://quaternius.com/packs/ultimatemodularcharacters.html) |
| **"terrorist"** (bumstrum) | 7k | CC-BY | light, rigged, a different enemy faction | ccce1abd9086451da3bed9ec30c82c37 |
| **"Game Ready low poly character tactical"** (1799danly) | 23k | CC-BY | rigged, realistic modern soldier | 342501b0c84843a3a418319c31ea26fa |
| "Military tactical suit (LowPolyGameReady)" (1799danly) | 32k | CC-BY | rigged | ef698ce36b1545a78ce592dd3db4c7ed |
| "Soldier Full Tactical Gear" (1799danly) | 84k | CC-BY | rigged; heavy, maybe for a boss or juggernaut | 850593a8c7114c188395ba1849a66eb9 |
| "S.W.A.T. Operator" / "FSB Operator" (jeandiz) | 107k / 114k | CC-BY | the best-looking; too heavy for many on screen, fine for a special or to decimate | 9e82fabf26194896b5ad4a364d864eab / 43a561e941704eefb1ab0614be4f0049 |
| "Sci-Fi Soldier / Futuristic Combat Trooper" (evgenytvidov) | 31k | CC-BY | not rigged (would need rigging); a sci-fi faction look | de876bfdce1c47a4aa67670faee7208e |
| Quaternius Universal Base Characters | low | CC0 | what civilians use | [quaternius.com](https://quaternius.com/packs/universalbasecharacters.html) |

Skipped on purpose: "Heavy Nazi Soldier" (not for this game), anything named after a commercial game.

## Budget
The play link is 11.9 MB (v48). GitHub Pages has no cap; the claude.ai link caps at 16 MB. Rough costs: a TastyTony gun 50–300 KB, a grenade 20–40 KB, a flipbook 200–600 KB, a 23k-face rigged soldier about 1 MB. Swapping the five guns and the frag costs well under 1 MB.

## Suggested order
1. ~~Guns~~ and ~~frag~~ (v48). Fire grenade: Quaternius FireGrenade.
3. Explosion: a Unity Labs or Sinestesia flipbook on the blast.
4. ~~Terrorist enemy~~ (v48). Next: a second faction, the 23k tactical soldier.
