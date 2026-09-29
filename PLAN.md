# Game plan: every instruction so far

Source: your notes from 29 Sep 2026. Rules you stated are written as rules. Open questions are marked **Decide**.

## 0. Ground rules for how we work
- **Mostly find, don't build.** My job is to search public sources (GitHub first) for free-to-use assets, download them, fit them together and make sure they work. Write code only where no asset exists.
- **Mobile first.** You'll be testing on your phone, so every feature needs a touch control.
- **Test world only.** White sky, flat gray ground. No story, no enemies that can hurt you, no co-op. Lighting comes last.
- **Pick from variety.** Wherever there's a choice, collect several versions of the animation. Build a select screen so you can watch them all and pick.
- **Rotate animations to break up repetition.** If we love two sprints, use both. A longer sprint can trigger a different slide, covering the same distance in the same time.
- **Athletic bodies only.** Everyone is at peak fitness, so no chunky jogs. The current stand-in soldier is acceptable for now.
- **The look comes from your Lego paintings** (Joudrie/lego → The Paintings): painterly and grounded sci-fi, with characters based on your custom figures.

## 1. Movement (the current focus)
Every character can: walk, run, sprint, jump and slide. Sprint is unlimited (no stamina bar), and slides work like Fortnite's.

| | Light infantry | Ultralight (Force users) | Heavy infantry |
|---|---|---|---|
| Who | Armored soldiers, a guy in a suit with a pistol, civilians. The default. | Any character with a lightsaber or the Force | Heavy body armor, minigun carriers. You'll confirm who. |
| Sprint | Normal | Fastest | Slowest (implied) |
| Double jump | No | Yes | No |
| Slide | Normal length | Normal or longer (implied) | Shorter |
| Health | Middle | Lowest | Highest |

- Several walk, run, sprint and slide animations to choose from on the select screen.
- The Second has a green trail when he bursts (from his card). That's a later visual effect.

## 2. Lightsaber (after movement)
- Ignite and unholster from the belt, with several animations.
- Styles: single saber (the current focus), dual wield, and a double-bladed staff later. The Beowulf Jedi and The Second carry two; The Jedi in the paintings has a staff.
- Stances: several ways of holding it, including reverse grip (Ahsoka style).
- Combat later: many combos, simple but plentiful (Fortnite-style chains), plus blocking.
- Rules you set:
  - No sprinting while blocking.
  - No attacking while sprinting.
  - No blocking while jumping.
  - All transitions between them must be smooth.

## 3. Rifle (the only gun for now)
- Carried on the back. Draw and holster animations.
- A charge or cock animation when you spawn or equip.
- Hip fire and aim-down-sights fire.
- Reloads:
  - A tactical reload when rounds are left and an empty reload when the magazine is out.
  - Reloading while aiming and while not aiming.
  - About 80% of reloads use the standard one; the rest use a different one that's equally fast.
- Weapon switching between rifle and saber.
- **Maybe a first-person mode** for guns. That needs first-person arms with the same set of actions.

## 4. Test enemies (built in v12; see CHANGELOG)
- About 5 enemy soldiers (not zombies) within a close radius.
- They're aggressive and shoot at you but can't do damage.
- When killed they ragdoll, and the bodies stay for 1–2 minutes, like Call of Duty.

## 5. Later: gadgets and abilities
- A shared pool of abilities that you assign per character as each asset comes in. One example is a wrist grappling hook.
- An impact grenade you can throw.
- Some abilities are items and some belong to the character.

## 6. Later: sound, then lighting
- Sound effects for everything above: footsteps, slides, jumps, rifle, reloads, lightsaber, gadgets.
- Lighting and the full art style come last.

## 7. Characters
- The pipeline: painting → front, side and back turnaround → image-to-3D → rig → drop into the game.
- **Blocker:** a Hugging Face token (`HF_TOKEN` in environment settings) so I can run the 3D conversion.
- Capes and fabric (Purple Shadow, Reznod, Crimson Ninja and others) need cloth or spring bones, so those characters come later.
- **First character: The Second.** He's the black operative whose turnaround you sent. He's a Force user who dual-wields green sabers, so he's ultralight.

## 8. Your Lego characters: which to build first
From Joudrie/lego: 884 entries, 44 with full-body paintings. The paintings match the style of the three images you sent: painterly, grounded sci-fi, full-body standing poses. Easiest means tight clothing, no cape or long coat, a standing pose facing front, and weapons that can be separate props.

**Build first (easy):**
| Character | Class | Why |
|---|---|---|
| **The Second** | Force (ultralight) | You already sent a front, side and back turnaround, and his suit is tight. His two green sabers are separate props. |
| The Snow Jedi (white pilot, green saber) | Force | Plain background, no cape. The baggy trousers become one solid mesh. |
| Drake, The Planner, The Mechanic, The Green Demigod (suit), The Chaosborn | Light infantry | Fitted clothes, standing poses. Weapons come off as props. |
| The Minigunner, Heavy (honor guard) | Heavy infantry | Rigid armor converts well. The minigun or big gun becomes a separate prop. |

**Medium (long coats or robes, which clip through the legs when running):**
- The Second Padawan (red coat)
- The Blue-Haired Ninja (robe)
- The Prince (robe)
- The Commissioner
- The Woodsman (fur coat)
- The Young Watchman (parka)

**Hard, do later (capes need spring bones or cloth):**
- The Purple Shadow, Reznod, The Crimson Ninja
- The Outlaw, The In-Betweener, The Green Captain

**Hardest (not human-shaped, or two figures in one painting):**
- Phalanx, The Slime King, The Reformed
- The Twins, The Repair Crew
- The Beowulf Jedi (dark cave painting; needs a clean re-render first)

**Force users found in the lore:**
- The Second: dual green sabers, green trail
- The Jedi: saber staff
- The Snow Jedi
- The Beowulf Jedi: blue and green sabers
- The Second Padawan
- The Purple Shadow: Sith
- Reznod: green saber

## 9. Assets found (full tables in assets/*/REPORT.md)
| Need | Found free, in the game now | Found free, downloaded, not wired yet | Needs your login |
|---|---|---|---|
| Athletic body | Quaternius Superhero (CC0) | Female version | — |
| Walk, run, sprint variants | Quaternius UAL, Mesh2Motion, 100STYLE mocap, soldier (Mixamo): 6 walks, 9 runs, 2 sprints, 5 idles, 3 crouch walks | KayKit strafes and backwards walk | Mixamo `Sprint`, `Two Cycle Sprint`, `Fast Run` |
| Slide | Quaternius baseball slide | — | Mixamo `Running Slide`, `Sprint To Backslide` |
| Jump, double jump | 3 jumps; 6 double jumps (ninja tuck, side flip, 2 backflips, backflip or side flip into a superhero landing) | CMU vaults and rolls | Mixamo `Front Flip`, `Running Forward Flip` |
| Force moves | Library: Two-hand Blast, Power Up, Levitate, Flying, Glide, Dodges | — | Mixamo Magic Spell Pack |
| Lightsaber | Library: UAL sword chain A→B→C, combos, block, dash | Energy Sword model (CC0) | Mixamo Great Sword Pack, sword combos, reverse-grip stab; Sketchfab hilts (CC-BY) |
| Rifle | — | 50+ gun models; Flat Guns East rifles with bolt and magazine bones | Mixamo Rifle 8-Way pack, Grab Rifle From Back, Reloading, Firing Rifle |
| First person | — | CC0 rifle hands and arms | Sketchfab ccransh FPS rifle hands (CC-BY) |
| Enemies | — | Quaternius Swat and Spacesuit (realistic), toon soldiers, robots, mechs, all with shoot/hit/death | — |
| Ragdoll | — | Rapier, Jolt (skeleton ragdoll), cannon-es | — |
| Capes | — | three-vrm spring bones, Verlet cloth | — |
| Sounds | — | 668 files: footsteps, rifle, reloads, saber, grapple, grenade, UI. Gaps: slide, saber clash. | Sonniss GDC bundles (blocked here) |

## 10. Status
- **Live now at the same link:**
  - Three classes, unlimited sprint, slide, and double jump (Force only).
  - A Moves screen that previews every variant. Tick variants for rotation.
  - Long-sprint slide variant.
  - Phone controls: pushing the stick to the edge sprints; Jump and Slide buttons.
- **Lightsaber (v3):**
  - Controls: **Saber** button, `E` or gamepad Y ignites and holsters it.
  - Styles: single, dual or staff. Grip: normal or reverse (Ahsoka). Six blade colours.
  - Holstered on the hip, or across the back for the staff.
  - Three saber stances.
  - Legs keep running while the arms hold the stance.
  - Attacks: tap for the A → B → C chain; hold for the heavy combo; hold Block to guard.
  - Your rules are enforced: no sprinting while blocking, no attacking while sprinting (the swing ends the sprint), no jumping while blocking or mid-swing.
  - Still missing: an unholster animation (the blade just ignites), a clash effect and saber sounds.
- **v4 (fixes your play test):**
  - **T-pose bug fixed.** Previewing a move in the Moves screen stopped the same animation player that walking and running use. Previews and one-shots now use their own copies, and walking and running restart their player if anything ever stops it.
  - **Watchdog:** every frame it checks that the body is posed and 100% covered by animation. If it catches a T-pose, a pose gap, a missing clip or a script error, it saves a report (state, current animations, last 25 events) to the game's database, where Claude reads it, and shows a banner with Copy report. Moves also has a Send report button.
  - **Mixing across sources:** every clip now keys every bone, with gaps filled from a natural idle. Mocap clips no longer leave fingers splayed.
  - **Gear sets:**

    | Gear | Walk and run |
    |---|---|
    | No gear | Full arm swing |
    | Hilt in hand | Full swing, hand closed round the hilt |
    | Saber lit | Legs run, upper body holds the saber stance |
    | Pistol | Legs run, upper body holds a SWAT pistol stance (CC0) |

  - **Rifle:** no free two-handed rifle animations exist. The SWAT and Toon Shooter gun clips are all one-handed. The rifle waits for the Mixamo Rifle 8-Way pack.
  - **Unholster and draw:** no free assets. Mixamo has `Draw Sword 1`, `Draw Sword 2`, `Sheath Sword 1`, `Sheath Sword 2`, `Grab Rifle From Back` and `Put Back Rifle`.
- **v5:**
  - **Running with a weapon:** standing still, the whole upper body holds the stance. Once moving, only the weapon arm holds it (both arms for dual or staff), so the torso bobs and the free arm swings.
  - **Each class keeps its own ticked moves in the Moves screen:**
    - Heavy infantry: heavy stride walk, soldier run, and a hard-jog sprint matched to 5.8 m/s so the feet don't slide.
    - Force users: the anime dash sprint.
    - Light infantry: the standard set.
- **v6: strafing:**
  - **Controls:** hold **Aim** with the pistol (right mouse, `Q` or LB), or **Block** with the saber lit.
  - **Movement:** the character keeps facing the camera and walks sideways or backwards, blending the two clips closest to where you push. Each clip's travel direction is measured from its planted foot rather than taken from its name. Mesh2Motion's "Strafe_left" actually moves right.
  - **Clips:** Mesh2Motion walk-backwards and sidesteps for walk speed; SWAT run-strafes for faster aiming.
  - **Saber guard:** holds the high-guard pose over moving legs. Walk speed only, no jumping.
  - **Pistol aim:** holds the aimed pose, eases the camera closer, and allows up to 75% of run speed.
- **v7: reports:**
  - The Moves screen has a **"What looked wrong?"** note that goes with Send report.
  - Reports record why sending failed (`dbState`, `sendError`).
  - Your first manual report from the iPhone app could not reach the database, so it was pasted by hand. The next report will say why.
  - Phone previews are framed wider.
- **v8:** freeze logging and reports, touch fixes for the joystick, dual sabers held in closed fists in every animation. See `CHANGELOG.md`.
- **v9:** slide momentum, jump into slide, infinite jumps (test switch), block in the air, five-hit combo that loops, crouch transition, saber clipping checks (`SABER_CLIPPING.md`), menu tabs. See `CHANGELOG.md`.
- **v10:** city blocks with collision, roofs and ledge falls; grappling hook (fire, pull, arrive), with pickable animations for each step. See `CHANGELOG.md`.
- **v11:** 1000 m grapple, faster hook and pull, far towers, slide canceling. The full to-do list is now `BACKLOG.md`.
- **Next, in order:**
  1. Your 3D characters (needs `HF_TOKEN`).
  2. Mixamo downloads for the gaps above.
  3. Rifle.
  4. Test enemies and ragdoll.
  5. Gadgets.
  6. Sound.
  7. Lighting.

## Decide
- Heavy infantry: who's in it, and how much slower they are.
- Health numbers for each class.
- Whether Force users' slides are longer than light infantry's.
- The first-person mode: now, or after third-person rifle is done.
