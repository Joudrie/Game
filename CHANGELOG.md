# Changelog

Playable build: `dist/index.html`, also published at the claude.ai artifact link. Every report the game sends includes its build number (`build: "v11 · …"`), so we can tell which version you were playing.

## v29: batch 7 (juggernauts, shields, saber duels, sneaking, Mission 3, move presets, falls)
- **You're still invincible** (v28.1). Duellist hits and fall damage only count on the damage levels in Weapon → Difficulty.
- **Special soldiers** turn up in the sandbox now and then (Menu → Tests turns that off, and has buttons to spawn one in front of you).
  - **Juggernaut** (MW2, Halo): a shimmering skin-tight force field. It takes **three saber hits** (or plenty of bullets, even headshots) to drop. He's too heavy to throw far and walks at you firing long bursts. **A sticky grenade kills him outright.** With the field down he dies like anyone.
  - **Shield soldier** (Halo's Jackals): a hand-held energy shield covers his front. Shots and the saber from the front hit the shield; **get round him**, or break it (two saber hits or several shots).
  - **Saber duellist** (Jedi: Survivor): a red blade. From the front he **blocks your swings** (three before his guard breaks, recovering over time) and **bats away your shots**. He closes in and swings: **block just as it lands to parry** and he staggers. Your raised guard clashes with his blade rather than cutting him.
- **Sneak (V):** a slow, quiet stealth walk. Soldiers see you at about half the range, as when crouching. Sprinting ends it. (V used to be the walk toggle.)
- **Holocloak** (from *Wake*): 8 s of near-invisibility, then a 20 s recharge. Guards can't see you beyond arm's length. A loud shot ends it. It's in the creative catalogue, and it's the reward for Mission 3.
- **Mission 3: Infiltration.**
  - **The job:** ten guards patrol the courtyard, two of them watching from the balcony. Download the plans at the terminal up there (**G**, 3 s, stay close) and leave through the south gate.
  - **Any guard alerted and it's over;** kill one before he finishes shouting and nobody knows.
  - **Your kit:** your pistol wears a suppressor for the mission, and your own attachments come back afterwards.
  - **Missions now take your earned gear:** the holocloak is in the kit once you have it.
- **Falls:** a long drop (about 8 m or more) hurts everyone but the Force class on the damage levels. Soldiers thrown from high up die ("Fell to his death"), so push them off the tower. The tower's deadly edge is striped red and white. **The blue berry** (on the tower top and the balcony, respawning; also in the catalogue) makes you fall-proof for 30 s with a blue sheen.
- **Move presets** (your v20 ask; Menu → Moves):
  - a ★ on every variant marks your favourite
  - **Mix it up** rotates through what's ticked (as before)
  - **Always my favourites** plays the starred one every time
  - **three packs** save and load the whole set for the class
- **Tests:** `tools/test33-batch7.mjs` covers all of the above, and `tools/serve.sh` runs a test with its own short-lived server. Build 14.64 MB.

## v28.1: invincible while testing
- **The player is invincible by default** (owner's rule for the testing phase). Nothing hurts you: bolts, bullets, fire, your own grenade.
- **Every existing save is switched to it once.** The other levels (Easy to Extreme) stay under Weapon → Difficulty for trying damage out; the level is now called **Invincible** instead of Sandbox.

## v28: batch 6 (throwables, saber moves, grapple swing, Mission 2)
- **The roadmap was finished,** so Claude picked Batch 6 from the backlog (see BACKLOG → Roadmap; change the order any time).
- **Three new throwables** (in your backpack once: 3 sticky, 2 fire, 2 orbs; also in the creative catalogue). Pick one in the hotbar and click to throw; **X throws whichever you picked last**.
  - **Sticky grenade:** sticks to whatever it hits, a soldier included, and goes off 1.6 s later, blinking faster at the end. Stuck on a soldier, it blows him apart.
  - **Fire grenade:** leaves a burning patch for 8 s. Soldiers who walk in catch fire, run about and drop ("Burned"). Wooden boards in it burn through after 3 s. **It hurts you too.**
  - **Teleport orb:** you appear where it lands, or beside the soldier it hits.
- **Saber moves:**
  - **Dash strike:** attack while sprinting at a soldier up to 10 m ahead and you lunge across the gap and cut him in half.
  - **Grapple yank:** hold right-click (aim or guard) as you grapple a soldier and he's pulled to you instead, onto your blade if it's lit.
  - **Finishers:** a soldier who's crawling, getting up or clutching a stump shows **F Finisher** from any side.
- **Grapple swing** (Weapon panel setting): a hook high on a wall swings you like a pendulum instead of reeling you in. It reels in until the arc clears the ground, you push to pump the swing, and jump lets go with the speed.
- **Mission 2: Hold the courtyard.** Stay alive for 3 minutes while soldiers keep coming from the north and the sides, more of them and better armed as time runs down, with a sniper on the balcony near the end. **The reward is the jetpack:** once earned, holding Jump in the air flies in every mission.
- **BACKLOG cleanup:** 33 items built since v22 are ticked off with their version, and the duplicate "on hold" section is gone.
- **Automated test:** `tools/test32-batch6.mjs` covers all three throwables, fire spreading to soldiers, boards and you, the dash strike, yank, finisher, swing and Mission 2 (including the jetpack reward in use). Build 14.62 MB.

## v27: roadmap batch 5 (the courtyard, Mission 1, gear you keep, attachments, creative)
- **The courtyard** (Missions → Go to the courtyard, or 175 m north of the start): a walled arena with pillars, crates, a tall corner tower and **a balcony 3.4 m up** with stairs at both ends (a ledge to fall or be pushed from).
  - **Glass shatters** at the first hit and shots carry on through. Soldiers can see you through it.
  - **Wooden walls are built from boards** that break one at a time (about three pistol shots each), so walls come apart partly. **Crates** break whole. The pieces fall and stay for 40 s.
  - **What breaks them:** bullets, blaster bolts, grenades, the Force push, the saber (it goes straight through), and **soldiers thrown into them crash through**.
  - **Stone** only takes marks.
- **Mission 1: The courtyard** (the new **Missions** button). Four waves: pistols, AK-47s, M4 carbines, then **snipers on the balcony** with carbines below.
  - **Snipers** show a red laser and a scope glint before a heavy shot (two hits' worth).
  - **Your kit:** a saber, a pistol, 3 grenades and 2 stims, plus gear you've earned. **Loot the rest** from bodies and dropped guns.
  - **Dying** offers **Retry mission** or **Quit mission**.
  - **Your sandbox inventory** is put back when you leave, even if you reload the page mid-mission.
- **Gear you keep forever:** finishing Mission 1 earns the **grappling hook**. In missions you can only grapple once you've earned it; the sandbox always has everything. The jetpack stays a sandbox gadget for now. Best times are saved.
- **The M4 carbine** (new gun, in your backpack once): automatic, 30 rounds, rifle ammo, its own sound. Soldiers carry it too (bursts of four).
- **Attachments:** in the inventory, **tap a gun** and its attachment switches appear.
  - **Suppressor:** soldiers only hear the shot within 8 m, with a muffled sound and no muzzle flash.
  - **Scope:** aiming zooms 2.5× with the scope view.
  - Pistol, AK and M4 take both; the shotgun takes a scope, the sniper a suppressor.
- **Creative:** the inventory lists **every item**; click one to add it (sandbox only).
- **Stim packs heal** half your health.
- **Grenades have a sound** now.
- **Build size:** the animation data is packed at build time (shared keyframe times stored once, tracks that never change keep one key), which saved 1.4 MB. The build is now **14.6 MB**, including the new models and sounds.
- **Phones:** the top bar fits at 375 px again.
- **Automated test:** `tools/test31-batch5.mjs` covers the M4, the scope and suppressor, glass, boards and blasts, all four waves, the reward, retry, stims, the creative catalogue and the attachment switches.

## v26: roadmap batch 4 (enemies that think, your health, ragdolls, takedowns, cover)
- **Soldiers start on patrol.** They stroll between spots near their post and stop to idle.
  - **They notice you:** a **?** over a soldier's head means he's seen something; he stops and looks. It fills faster the closer you are, and slower if you crouch or sit in cover. Walking up behind him is fine; running up isn't.
  - **Spotted:** a **!** and he turns on you and shouts. The shout takes about a second. **Kill him before it ends and nobody knows.** When it ends, everyone within 40 m joins the fight.
  - **Panic:** a calm soldier who sees someone die nearby flinches for a moment, then shouts.
  - **Noise:** gunfire carries (pistol 35 m, AK and shotgun 50 m, sniper 70 m, grenades 60 m) and alerts anyone calm in range. **The saber and the Force are silent.** Soldiers' own shots alert their friends, so fights spread. (Suppressors come with the attachments in batch 5; the noise rule is ready for them.)
  - **In a fight:** a soldier only shoots when he can see you. When he can't, he closes in; on Hard and Extreme he comes round the side. After 20 s without seeing you he goes back to patrolling.
- **Stealth takedowns:** get behind a soldier who hasn't seen you (or one who's panicking) and press **F**. With the saber lit: saber through the back. Otherwise: a strike to the head. It's silent; only someone who sees it panics.
- **You can be hurt now.** Blaster bolts that reach you and AK bullets (which can't be blocked) take health.
  - **Difficulty** (Weapon panel, top): Sandbox (can't be hurt), Easy (about 12 hits), Normal (about 7), Hard (about 4; soldiers flank), Extreme (2 hits; sharp eyes, quick shouts). Harder levels also mean better aim and faster fire.
  - **Health comes back slowly** after 4 s without a hit. A thin bar above the hotbar and a red edge show it.
- **Dying:** your body goes **limp (a real ragdoll)** and the camera watches it. Press **Enter** or **Respawn** to start again at the spawn point. Soldiers calm down when you respawn.
  - **Your own grenade** at your feet (within about 2.6 m) **blows you apart** like anyone else. Further out it hurts.
- **Ragdoll soldiers:** soldiers killed by a grenade, a Force push, a grapple strike, a ground pound or a wall now go limp instead of playing a death clip, and later blasts toss the bodies about. Switch it off in the Weapon panel (Ragdoll deaths). The ragdoll is written for this game (15 points joined by sticks, steering the skeleton), so it adds nothing to the download.
- **Cover: Q** next to a wall or a crate.
  - Low cover: you crouch behind it with your back to it. Tall cover: you stand.
  - **A/D** slide along it.
  - **Right-click peeks**: over low cover you stand up and aim; at the end of tall cover you lean round the corner.
  - **Firing without aiming is blind fire** (wild spread). Reloading works as usual.
  - Q again, jump, sprint or walking away leaves cover.
  - Cover and crouching also hide you from patrols.
- **Q changed:** it used to duplicate the right mouse button (aim or block). Right-click still does both.
- **Automated test:** `tools/test30-batch4.mjs` covers patrols, spotting and the shout, silent kills mid-shout, panic, gunfire noise, takedowns (and none from the front), health and regeneration, bolt hits, death and respawn, your own grenade, ragdoll soldiers, cover sliding and peeking, and Sandbox. Build 15.75 MB.

## v25: roadmap batch 3 (the Force, saber throw, saber feel, saber + blaster, triple jump, wall run)
- **The Force is an item** (Lego Star Wars style). With it selected your saber stays lit, and **a red ring marks the one soldier you're looking at**; switch the ring off in the Weapon panel if you like.
  - **Left click: Force pull.** He flies to about 1.4 m in front of you, and if your saber is lit **it swings as he arrives: pulled onto the blade.**
  - **Right click (hold): Force choke.** He's lifted about a metre and kicks; hold 2.2 s and he's dead ("Force choke"). Let go early and he drops. 2.5 s cooldown.
  - **H or middle click (hold): Force lightning.** Crackling arcs from your left hand to the target and on to one soldier next to him. Up to 3 s, then a cooldown.
  - **T** is still Force push.
- **Saber throw: middle click or Y** with the saber lit. It spins out about 13 m along your aim, **cuts anything it passes through** (the same blade-contact system), and comes back to your hand.
- **Saber feel:**
  - **A trail** behind the blade when it moves fast (the Lego Star Wars look), in the blade's colour.
  - **The blade is a light:** it lights your face, body and the ground around you in its colour.
  - **Cutting the world:** slash the ground or a wall and you get **sparks and a glowing scorch mark** that cools from orange to dark and fades after about 20 s.
  - **Sound:** ignite, a hum that gets louder and higher as you swing, swing whooshes, and switch-off. All CC0.
- **Saber + blaster** (a new item): saber in your right hand, blaster in your left. **Right click fires**, and **four quick shots overheat it** for 2.5 s. The heat gauge shows in the corner.
- **Triple jump** (Force class): the third jump goes 25% higher than the second.
- **Wall run:** jump alongside a wall at super-sprint speed and you run along it for about a second, arcing up about 2 m. **Jump again to kick off.**
- **Existing saves** get The Force and the Saber + blaster once, in a free hotbar slot or the backpack (drag them in with I).
- **Automated test:** `tools/test29-force.mjs` covers the marker, pull, choke, lightning, throw, blade light, scorch, blaster overheat, triple jump and wall run. All 10 earlier suites pass. Build 15.72 MB.

## v24: roadmap batch 2 (guns, sounds, blaster bolts and the parry)
- **Three new guns,** already in your hotbar (slots 4–6; existing saves get them once). All are free CC0 models from Quaternius:
  - **AK-47:** fully automatic while you hold the trigger, 30 rounds; the spread grows while you hold it and tightens when you let go.
  - **Pump shotgun:** 9 pellets that fall off with distance, 6 shells, a pump sound after each shot, and a close kill **blasts the body backwards**.
  - **Sniper rifle:** bolt-action, 5 rounds, one-shot kills. **Aim and the scope snaps in fast**, so quickscopes work: the view zooms 3×, you get scope crosshairs, and your character and rifle hide so you can see.
- **Rifles are held properly:** the stock sits in your shoulder, and both hands go onto the gun (right on the grip, left on the fore-grip) using the same arm-reach code as the saber draw. There are no free two-handed rifle animations, so this is done in code. Not aiming, the rifle is held low and ready. Recoil kicks it back into the shoulder and the muzzle climbs.
- **Holstering:** rifles go on your back and the pistol on your hip.
- **Ammo per gun:** pistol ammo, rifle ammo, shotgun shells and sniper rounds are separate items, and each gun keeps its own magazine.
- **Sounds:** every gun has its own shot (real recordings from the CC0 Free Firearm Sound Library), plus pump, bolt, reload, blaster, deflect and parry sounds. Enemy shots get quieter with distance. The whole set is 41 KB (`tools/make_sfx.sh`).
- **Blaster bolts vs bullets:**
  - Most soldiers now carry **blaster pistols** that fire red bolts you can see flying at you. Their gun **glints red just before they fire**: that's your cue.
  - **Holding block** with the lit saber deflects bolts from the front and sides, but **not from behind**.
  - **A timed block** (pressed in the last 0.3 s before a bolt reaches you) is a **parry**: the bolt turns green and flies straight back and kills the shooter ("Parried · his own bolt").
  - **Too many blocks in a row break your guard.** You stagger and can't block for 1.6 s.
  - **About a third of soldiers carry AK-47s** and fire bursts of real bullets, which **can't be deflected**.
- **Their guns drop and you can take them:** walk over a dropped AK to get it and its rounds. AK soldiers' bodies have rifle ammo (60–90 rounds) when you search them.
- **Automated test:** `tools/test28-guns.mjs` covers AK auto fire, the shotgun kill and knock-back, the sniper scope and one-shot, the parry kill, held-block deflect, an unguarded back, guard break, AK drop and pickup, and mixed loadouts. All earlier tests pass.
- Build: 15.67 MB (limit 16).

## v23: roadmap batch 1 (fixes, limb loss, pickups, 6-slot hotbar)
- **The pistol no longer climbs to the sky.** This was your report, and the root cause was an engine detail.
  - three.js only rewrites a bone when the animation's value changes. While you aim without moving the mouse, the aim pose never changes, so each shot's recoil kick (a direct rotation of the arms and chest) was never undone and piled up on the last one: +25° on the arms after 12 shots. Moving the mouse changed the pose and snapped it back.
  - Now every bone returns to the animation's own pose before each update (`mixHero`). That also protects the fists, the draw reach and the air guard, which adjust bones the same way.
  - The camera kick from each shot also eases back, instead of leaving you looking a little higher every time.
  - Measured: after 12 aimed shots the barrel moves about 1° and the view returns exactly.
- **The jetpack is off by default.** Switch it on in the Weapon panel. Your saved setting was reset once.
- **Bullet holes:** shots that hit nothing alive leave a small scorched hole on walls (with sparks) or on the ground (with a puff). Enemy misses too. They fade after 20 seconds.
- **Losing a limb:**
  - **An arm or hand:** the soldier clutches himself (Mesh2Motion's hurt stance) and carries on.
  - **His gun hand:** he drops the pistol and panics for about 2.5 seconds, then **draws a backup pistol with his other hand** and fights on one-handed. Lose that hand too and he just runs.
  - **A leg** (thigh, below the knee, or a foot): he no longer dies. **He goes down and army-crawls after you** (Mesh2Motion "Crawl", CC0, newly baked in). Cut him again to finish him.
  - **Severed limbs and dropped guns stay for 3 minutes,** even after the body fades (up to 60 at a time).
- **Picking up weapons:** walk over a dropped pistol and you take it: 12 rounds, and the pistol itself if you don't have one. **Every body you search now has about three magazines** (30 to 36 rounds). Reloads were already arcade: leftover rounds are never lost.
- **6-slot hotbar, centred** at the bottom of the screen; keys 1–6 and the scroll wheel.
- **B swaps the camera shoulder** (right or left), and it's remembered.
- **Automated test:** `tools/test27-batch1.mjs` covers all of the above; test26 now expects legs to crawl.

## v22: the blade decides (dismemberment, part 1)
Your top priority. The saber no longer does "damage": it cuts exactly where it passes.
- **Blade contact:** every frame, a moving lit blade is swept from where it was to where it is and tested against each soldier's head, chest, waist, upper arms, forearms, hands, thighs, calves and feet. A fast swing can't skip through someone between frames.
- **Head, chest, waist or legs: dead, every time,** cut right there: head off, cut through the chest, cut in half at the waist, leg off above or below the knee, foot off.
- **Hands and arms: they come off and he lives.** He staggers, bleeds from the stump and keeps fighting with the arm he has left.
  - **Lose the gun hand** (right hand or arm) and he **drops his pistol and runs away** from you.
- **Dropped guns:** every soldier's pistol falls out of his hand when he dies or loses that hand, and lies on the ground. Picking them up comes later.
- **Cartoon blood:** the stump spurts for about two seconds; drops fall and leave small splats on the ground for 25 seconds.
- **Loose pieces fly:** grenades and Force push now throw severed limbs and dropped guns too, not just bodies.
- **The kill feed names the cut:** "Saber · right hand off", "Saber · cut in half".
- Fists still hit by reach; only the saber cuts.
- **Automated test:** `tools/test26-dismember.mjs` covers a real swing, gun hand off (alive, unarmed, gun dropped, runs), left arm off (alive, still armed), head, waist and leg cuts (dead, cut there), blood splats and loose pieces.

## v21: SWAT soldiers, a performance readout, The Second shelved
- **The soldiers are SWAT officers** (Quaternius SWAT, CC0) instead of a grey copy of the hero.
  - Dark grey armour, black vest and helmet, visor, knee pads, gloved hands.
  - `tools/reskin_swat.mjs` puts him on our skeleton: his bones are matched to ours by name, our joints are moved onto his, and he's scaled so his hip height matches (the animations set the hip height). He keeps the artist's own weights, so he bends cleanly.
  - His 5 meshes and 7 colours are merged into one mesh with painted-on colours: one draw call per soldier instead of seven. His built-in gun is left out; the game still hands every soldier its pistol.
  - Deaths, pushes, grenades and dismemberment all work on him (test17 and test18 pass).
- **Performance readout:** Menu → Tests → Performance.
  - "Show frame rate and costs" puts a line at the top left: fps, game-logic time (the soldiers' share separately), draw time, draw calls, triangles, soldiers and bodies.
  - Buttons keep **5, 10, 20 or 40 soldiers** alive, so you can see what more enemies cost on your own device.
- **Measured headless** (`tools/test25-perf.mjs`):

  | Soldiers | Game logic per frame | Draw calls | Triangles |
  |---|---|---|---|
  | 5 | 0.24 ms | 87 | 118k |
  | 10 | 0.23 ms | 115 | 198k |
  | 20 | 0.46 ms | 165 | 359k |
  | 40 | 0.74 ms | 242 | 675k |

  - Each soldier adds about 4 draw calls and 16k triangles: his body and pistol, drawn twice because they also cast shadows.
  - Game logic is tiny. The graphics card does the real work.
- **The Second is shelved.** He's out of the build (the files and tools stay in the repo); the Superhero plays again. The build dropped from 15.9 to 15.2 MB, SWAT soldiers included.
- **`BACKLOG.md` has the owner's whole vision:** a lethal saber, dismemberment for droids, deadly weapons with difficulty from numbers, ragdolls and flying limbs, saber light and trails, a creative-mode catalogue, attachments, saved sabers, and Fortnite-inspired gadgets.

## v20.2: character switch in the Menu
- The Second / Superhero switch is now at the top of **Menu → Moves** too; it was only in the Weapon panel, so there was no obvious way back after switching.
- Your other requests (jetpack off by default, the pistol stuck pointing up after recoil, bullet holes, a better pistol, move presets) are in `BACKLOG.md` under "On hold until The Second's rig is finished".

## v20.1: The Second's rig fixed (lumps and stretching)
- **Fixed your report:** big lumps and webbing between his arms and thighs whenever the arms moved (jumps, folded arms), and bulging hips.
  - **Cause:** the rig attached each part of the body to the closest bone in a straight line. His arms hang right beside his hips and ribs, so those got attached to the arm bones and were dragged along.
  - **Fix:** a part can now only attach to a bone it can reach through the body itself, never across the air gap next to the arm (`tools/rig_the_second.mjs`, using a solid voxel model of him).
- **His arms fit:** the skeleton's forearms and wrists are stretched about 13% to match his longer arms, so the hands bend at his wrists.
- **His back tank** rides on the upper spine. Before, it stretched into spikes when he moved his shoulders.
- **New tool:** `tools/posesheet_second.mjs` renders him in the poses that showed the problem (colour-by-bone, arms folded, jumps, sprint, saber, punch), front or side.
- `test24` also takes a jump screenshot.

## v20: The Second is playable
- **You now play as The Second**, a 3D model made from your four turnaround images (front, back, left, right).
  - He has the helmet with its silver stripes, the chest plate markings, the metal left arm, the thigh pouches and boots, and the tank and hose on his back.
  - He uses every animation the old hero had: runs, flips, slides, saber combos including the dual ones, pistol, grapple, deaths.
- **How he was made:**
  - Tencent's Hunyuan3D-2mv (free, on Hugging Face) turned the four images into a shape.
  - `tools/bake_the_second.py` reduces it to 20k triangles and paints it by projecting your images onto the surface, so the colours are yours, not AI-invented.
  - `tools/rig_the_second.mjs` attaches it to the game's skeleton.
- **His own tank is the jetpack:** the Mandalorian jetpack model is hidden when you play him, and the flame comes out from under his tank.
- **Menu → Setup → Character** switches between The Second and the old Superhero (the game reloads).
- The soldiers keep the old body.
- **Automated test:** `tools/test24-the-second.mjs`.

## v19: dual-saber combos
- **Four dual-saber combos**, now with both hands striking. They're picked in **Menu → Moves → Dual saber combo**; the ticked ones rotate, a different one each time you start a new chain (the first three are ticked by default).
  - **Flurry:** right, left, right, left, then a cross-slash and a double chop (6 hits).
  - **Twin spin:** right, left, spin, left-handed spin slash, double stab.
  - **Double blades:** slice, chop, left-handed spin, stab.
  - **Mixed:** the v18 dual chain, kept as an option.
- **Where the moves come from:** Mixamo sign-in doesn't work, so these are built from free CC0 clips we already had.
  - KayKit's three dual-wield strikes: chop, slice, and the stab, which is now used for the first time.
  - Left-handed copies of the Quaternius sword hits. `tools/bake_mirror.mjs` mirrors them left to right, and they match the originals to within 3 mm.
- Single saber keeps the five-hit combo.
- **Automated test:** `tools/test23-dual-combo.mjs`.
- `tools/mixamo_fetch.mjs` does the full Mixamo export in one command, in case sign-in ever works again.

## v18: a real Mandalorian jetpack
- **The jetpack is now a downloaded model:** "Boba Fett/Mandalorian Jet Pack" by Jace1969 on Printables (CC BY, credited in `CREDITS.md`). Source file and notes are in `assets/jetpack/`.
  - It's the classic look: a missile up the middle, twin fuel tanks, and a cone thruster hanging off each lower corner.
  - Silver finish. It sits flush on the upper back: the flat mounting plate against the body, the bottom tilted in.
  - The flames now come out of its two thrusters.
- Scaled to 0.72 m tall, missile included. If the model ever fails to load, the old plain box is used instead.

## v17: better icons, pistol magazine and reload
- **Better item icons:**
  - The lightsaber, pistol and frag grenade icons are pictures of their actual 3D models, rendered when the game loads. The saber icon shows your blade colour and updates when you change it.
  - Every other item has a detailed two-colour drawing: a stack of gold credits, brass rounds, a power cell with a charge bolt, a data chip, a keycard, a stim, a ration bar, a comlink, and a pale blue kyber shard.
- **The thrown grenade** is the same model as the icon (olive body, band, fuse cap, lever and pin ring) instead of a plain ball.
- **Pistol magazine:**
  - 12 rounds. The count shows on the pistol's hotbar slot, and a counter above the hotbar reads "rounds / spare"; it turns orange at 3 or fewer.
  - Spare rounds are the Pistol ammo in your inventory. "Infinite spare ammo" (Weapon → Settings, on by default for testing) keeps them from running out, but the magazine still empties.
- **Reload:**
  - **Z** (the Reload button on a phone, D-pad up on a gamepad), or automatically when you fire the last round.
  - The upper body plays the reload from the free animation pack, so you can reload while running.
  - An empty reload drops the spent magazine: it flies out to your right, clatters, kicks up a small puff of dust, and lies flat on the ground. Up to 24 stay.
  - A reload with rounds left keeps the old magazine (it goes in a pocket) and is faster (1.05 s against 1.35 s).
  - A fresh magazine appears in your left hand and goes into the gun partway through.
  - Pulling the trigger with an empty magazine and no spare ammo tells you to loot some.
  - Holstering or switching weapons cancels a reload. If the spent magazine was already out, the gun stays empty until you reload.
- **Automated test:** `tools/test22-reload.mjs`.

## v16: hotbar and inventory
- **Hotbar:** five slots in the bottom right, Fortnite/Minecraft style. **Scroll** (or keys **1–5**, or tap a slot on a phone) picks a slot.
  - A weapon slot (lightsaber or pistol) draws that weapon, with the draw/holster animation.
  - An empty slot or an item slot leaves your hands free: Attack punches, or uses the item. From a grenade slot Attack throws a grenade; from a stim slot it uses a stim (health comes later).
  - You start with the lightsaber, the pistol and 5 frag grenades.
- **Inventory** (the Inventory button, or **I**): the hotbar plus a 20-slot backpack.
  - Drag anything to any slot to move it or swap two. On a phone you can tap one slot, then another.
  - The same items stack together up to a limit (grenades 10, stims 5, ammo 120, credits 9999…).
  - Moving a weapon out of the active slot puts it away.
- **Loot goes into the inventory now:** matching stacks fill first, then empty backpack slots. If there's no room, the loot list says so.
- **Grenades come from the inventory** once "Infinite grenades" is off (Weapon panel → Settings; it starts on so you can keep testing). The X key still throws.
- The inventory is saved in the browser, so it's still there next time.
- **Layout:** the hotbar sits in the bottom right, so the PC key hints and the phone buttons move up above it. On phones the speed readout sits above the buttons.
- **Automated test:** `tools/test21-inventory.mjs`.

## v15: looting
- **Loot bodies:** walk up to a body and a "Loot body" prompt appears. Press **G** (the **Loot** button on a phone, or D-pad down on a gamepad).
  - You kneel and rummage for about 2 seconds, using `Fixing_Kneeling` from the free pack (now packed). A lit saber switches off while you search and relights after.
  - Items pop up one at a time under the top bar: 1–3 per body from a small table (credits, pistol ammo, power cells, stim packs, frag grenades, ration bars, data chips, keycards, comlinks, and a rare kyber shard in orange).
  - Moving, jumping, sliding or attacking stops the search. Stop before anything turns up and you can come back for it.
  - A searched body stops prompting and stays around a little longer.
- **Cosmetic for now:** nothing is added to an inventory yet. Every find is recorded (item, amount, time, which body) so the inventory can use it later.
- **Automated test:** `tools/test20-loot.mjs`.

## v14.1: dismemberment always on, scroll to switch weapons
- **Dismemberment is always on.** The switch is gone from the Weapon panel.
- **Scroll wheel switches weapons:** fists → hilt → saber → pistol, and back around, one step per notch, with the draw or holster animation each time. A small label shows the new weapon.
- **Shift + scroll zooms the camera** (it used to be plain scroll). Windows sends Shift + wheel as a sideways scroll; that's handled.

## v14: combat feel, pistol rework, draw and holster, jetpack, bodies you can move, new look, Weapon panel
**Fixes from your PC play test**
- **No more freezing after a saber swing.**
  - A swing commits you until its cancel point. After that, moving, jumping or sliding ends it on the spot, and a recovery move always ends when you move.
  - Also covers the single saber's "freeze at each end point".
- **Aim and fire together.** Holding right-click to aim swallowed the left click: browsers don't send a second "pointer down" while one button is held. Mouse buttons now use mouse events.
- **Pistol:**
  - The stance is back to the default two-handed pistol idle, from the same pack as the run and walk. The old one held the gun low, pointing at the ground, and twisted the shoulders.
  - The whole upper body keeps the gun up while you run.
  - Aiming follows the camera, up and down, using the pack's three aim poses.
  - Firing from the hip raises the gun toward the crosshair for a moment and turns you to face it.
  - Each shot kicks the arms up a little.
- **Grapple:**
  - Hooking a spot on the roof you're standing on no longer leaves you hanging sideways: roof-top hooks bring your feet onto the roof.
  - Any pull that stops getting closer ends by itself.
  - Much shorter skid when you land on a roof.
  - Enemies are easier to hook.
  - Grappling from the air was already allowed; confirmed working.
- **Thrown soldiers don't freeze in mid-air.**
  - The death or knockback clip is stretched to last the whole flight.
  - A long, high throw flips the body head over heels, landing on its back.
  - This is a stand-in for real physics ragdoll, which is still to come.
- **The dance-like pistol stance** is reset to the default for every class.

**New**
- **Fists:** with no gear (or an unlit hilt), Attack throws jab, cross, kick, hook. The kick and hook knock soldiers back. The kick is KayKit (CC0), baked onto our skeleton.
- **Dual-saber combo:** mixes KayKit's dual-wield slice and chop into the five hits.
- **Soft lock-on:** an attack turns you toward the nearest soldier within 3.5 m in front of the camera.
- **Draw and holster:**
  - The hand reaches to the holster, takes the weapon, and brings it up. Sabers come from the hips (a single saber is drawn across from the left hip; the staff from the back) and ignite once in hand.
  - Holstering the pistol spins it twice around the trigger finger first, Red Dead style.
  - There are no draw clips in the free packs, so the arm reach is worked out live (two-bone IK) over whatever you're doing, including running.
- **Blocking bullets:** guard with a lit saber facing a shooter, and most shots spark off the blade and deflect away. Cosmetic: you still can't be hurt.
- **Jetpack** (on by default; switch in the Weapon panel):
  - In the air, hold Jump to fly up, and hold C (or Slide) to hover in place.
  - Sprint to fly flat out, Mandalorian style, at up to 24 m/s.
  - Let go and you drift down. A tap of Jump is still a double jump.
- **Bodies react:**
  - Grenades always shove bodies on the ground; Force push does too (switch in the Weapon panel).
  - A grenade that strikes a soldier directly goes off on him; with dismemberment on, he comes apart.
  - A grenade at a soldier's feet takes the feet off (dismemberment on).
- **Dust clouds** where heavy things land: thrown bodies, the ground pound, grenades, and you after a big fall.
- **Faster sprint:** light 8.4, Force 12.5, heavy 7.0 m/s (was 7, 10.5, 5.8).
- **Higher double jump:** Force 8.2 (was 6), light 6.8, heavy 5.6.

**Look and menus**
- Pale blue sky, sand ground, grey buildings, and the grid is always on. The Grid button is gone.
- **Weapon** (top right, or Tab) opens a small panel over the running game:
  - class, equipment, and saber style, grip and colour
  - settings: jetpack, dismemberment (now off by default), Force push moves bodies, infinite jumps
  - a controls list
- **Menu** now holds Moves, Library and Tests, and opens on Moves. Each slot marks the variant recommended for your class (heavy infantry, for example, gets the arms-folded idle and the high-guard saber stance).

**Also**
- Stance clips added from the free pack: pistol aim up, aim neutral, aim down; `Interact` and `Spell_Simple_Enter` are packed too.
- Automated test: `tools/test19-v14.mjs` covers swing then move, fists, and aim + fire with real mouse events. test9 is updated for the Weapon panel.

## v13: grapple strikes, ground pound, dismemberment, combo freeze fixed, skin shows on phones
- **Fixed: stuck mid saber combo.**
  - Hits 1 and 2 end in a recovery move (`Sword_Regular_A_Rec`, `Sword_Regular_B_Rec`). Those clips were never packed into the game, so if you stopped tapping after hit 1 or 2, the swing froze at full strength while you walked. That was your "Animation froze" report.
  - The recovery clips are now in the game (`tools/pack.mjs`).
  - A safety net also finishes any swing or one-shot move that ends without handing off, so the body can't freeze while you move.
- **Fixed: white hero and grey enemies on your phone.**
  - The skin textures loaded through temporary `blob:` links, which the Claude app's page rules block. Every material fell back to plain white, and the enemies' tint turned white into grey.
  - Textures are now decoded straight from memory. Reproduced and confirmed fixed locally under the same kind of page rules.
- **Grapple onto enemies:**
  - Aim the crosshair at a soldier (it lights up) and press Grapple. The aim is forgiving and gets more so with distance.
  - Once hooked, the soldier stops shooting and reels.
  - You're pulled in fast and strike on arrival: with a lit saber, a lunging slash that always kills; empty-handed, a hook punch (45 + speed damage).
  - The soldier is knocked flying, and you flip back off them.
  - New death cause: **Grapple strike**.
- **Ground pound:**
  - With the saber lit, press Attack in the air after a double jump (or from 2.5 m up).
  - You dive blade-first and land in a superhero landing. A ring spreads across the ground and throws every soldier within 6.5 m; closer ones take more damage (up to 100).
  - New death cause: **Ground pound**.
- **Dismemberment mode** (Menu → Tests; on by default):
  - Saber kills take off an arm, a leg or the head, sometimes two.
  - Pistol headshot kills take off the head, and leg-shot kills take off a leg.
  - Grenade and ground-pound kills throw 1–3 limbs.
  - Limbs fly off spinning, bounce and settle. Both cut ends are capped in dark red, with a small blood burst.
  - Limbs fade with the body. At most 24 at once.
  - Works on the current soldiers; it's built to carry over to zombies later.
- **Automated test:** `tools/test18-combat.mjs` covers the grapple strike, ground pound, dismemberment, and a swing that loses its finish callback.

## v12: enemies, deaths by cause, Force push, grenades
- **Five enemy soldiers** close in on you. They run at you from far off, back away if you get closer than 7 m, and strafe and shoot in between. The shots always miss and do no damage, but you see the tracer and the muzzle flash. When one dies, a replacement arrives every 3 s to keep five alive.
- **Hit zones:**
  - A pistol shot is checked against the head, torso (arms count as torso) and legs.
  - The head wins whenever the shot passes through it, so a raised gun arm doesn't eat a headshot.
  - Damage: head 100 (one shot), torso 34, legs 26.
  - Non-fatal hits play a flinch.
- **Death by cause, using your rules:**
  - **Headshot:** the killing bullet hit the head.
  - **Leg death:** at least half of all the damage taken, including the killing shot, was in the legs. Otherwise the death is a **torso death**.
  - **Explosion:** the grenade throws the body; the death plays in the air, and it lands in the final pose.
  - **Force push:** a push that kills throws the body back.
  - **Wall impact:** a pushed or blasted soldier who hits a wall faster than 7 m/s dies on impact and crumples down it.
  - Each cause picks from its own pool and never plays the same death twice in a row:
    - torso: 7 variants
    - explosion: 6
    - push: 5
    - head: 4
    - legs: 4
    - impact: 4
  - The kill feed (top right) shows the cause and the clip.
- **Bodies stay 90 seconds,** then fade out. At most 12 bodies at once; the oldest goes first.
- **Force push** (Force class only: the **Push** button or `T`): a two-hand blast that knocks back everyone in a 14 m cone in front of you. Closer soldiers fly further. Survivors get back up.
- **Impact grenade** (the **Grenade** button or `X`): thrown toward the crosshair; it goes off on first contact. 7 m blast; up close it kills.
- **New death clips:**
  - CMU mocap falls: fall flat on the back, fall face-down, two crash landings.
  - KayKit: a drop-to-the-knees death and two hit reactions.
  - These were picked from what the search found (`assets/deaths/REPORT.json`) and checked by eye on a contact sheet. Rejected: a slip fall and the Quaternius human death (arms too close to a T-pose), and a KayKit death that ends propped on its arms. The openmw endorphin deaths have no licence, so they stay out of the game.
- **Fixed: dead bodies standing back up.**
  - Four death clips (SW_Death and Mesh2Motion Death A, B and C) ended on a keyframe that snapped back to standing, so a corpse would pop upright.
  - `tools/trim_snap.py` cuts that last frame from every one-shot clip (deaths, landings, dodges, throws, jumps).
- **Tests tab:** a switch for enemies, Respawn all, Clear bodies, and a count of deaths by cause.
- **Automated test:** `tools/test17-enemies.mjs` checks spawning, every death rule, a lethal push, a wall impact and a grenade.

## v11: long, fast grapple and slide canceling
- **Grappling hook range: 70 m → 1000 m.** The fog is pushed back so far buildings stay visible. A ring of 12 tall towers (40–90 m) stands 220–450 m out for long-range grapples.
- **Faster grapple:** the hook flies at 260 m/s (was 90), and the pull tops out at 55 m/s (was 24). Arriving on a roof keeps half your speed.
- **Slide canceling:**
  - Tap Slide or Jump during a slide to cancel it and keep its speed.
  - Speed above sprint bleeds off slowly, so you can chain slides.
  - Chained slides are capped at 1.8× the class's sprint (19 m/s for Force).
- **Backlog:** everything still to do is listed in sections in `BACKLOG.md`.

## v10: buildings and grappling hook
- **City blocks:** 38 plain grey boxes, 1.4 m to 32 m tall, scattered with wide streets between them. Three low ones sit near the start for hopping and grappling practice.
  - You can't pass through them. You stop at the wall and slide along it.
  - You can stand on roofs, and walking off an edge makes you fall.
  - The camera pulls in rather than going through a wall.
- **Grappling hook:** press **Grapple** (touch button, `R`, or gamepad RT) while the centre crosshair lights up on a building (range raised to 1000 m in v11).
  1. **Fire:** the hook flies from the left wrist on a rope.
  2. **Pull:** once it attaches, the rope reels you in.
  3. **Arrive:** reaching a roof edge puts you on the roof; hitting a wall drops you from it.
  - Press Grapple again to let go. Press Jump to let go with an upward boost and an air flip.
  - A miss sends the hook out and back.
- **Grapple animations:** there are three new Moves slots, each with free clips to compare:
  - **Fire:** wrist thrust, point and fire, overhand throw, throw.
  - **Pulled:** Superman, tucked, glide, airborne.
  - **Arrive:** superhero landing, climb up, landing, roll.

## v9: momentum, combo flow, air moves, clipping list, menu tabs
- **Slide momentum:**
  - Your entry speed carries into the slide. Sprinting in adds up to 25% more, and a faster slide lasts longer, up to 1.7× the class's slide time.
  - Force class: 6.2 m/s from a jog versus 14.7 m/s from a sprint.
- **Jump into slide:** press Slide in the air. The character drops fast and lands straight into a slide at 10% extra speed.
- **Infinite jumps (testing):** tap Jump in the air as often as you like, for every class. The switch is in Menu → Setup and starts on. The default extra jump is the quick CMU backflip, the Lego Star Wars-style flip.
- **Block in the air:** the high guard is laid over whatever jump or flip is playing. You can also jump while blocking.
- **Five-hit saber combo:** A → B → C → spin slash → lunge. A buffered tap cuts each hit at its cancel point so they flow together, and the lunge flows back into hit 1. Hold still heavy-attacks, and pausing still plays the recovery.
- **Crouch transition:** standing to crouching blends over about 0.3 s instead of snapping.
- **Saber clipping:**
  - The game measures the blades against a body model every few frames while lit. It notes each animation where a blade cuts in (Menu → Tests → Noticed while playing), and those notes ride along in every report.
  - **Check saber clipping** plays every animation with the sabers lit, lists the ones that cut into the body, and sends the list as a report. See `SABER_CLIPPING.md`.
- **Menu for phone testing:** four tabs (Setup, Moves, Library, Tests), an Expand button for a taller sheet, and larger touch targets. Report a problem, the clipping check and the reporting status live under Tests.

## v8: freeze logging, dual sabers in fists
- **Freezes are logged and reported.** The watchdog now catches three more problems, each with a banner and a report:
  - **Game froze:** a frame took longer than 1.2 s. Hitches over 0.4 s go into the event log.
  - **Character didn't move:** you pushed the stick or keys for 0.6 s and the character stayed below 0.3 m/s.
  - **Animation froze:** the character is moving but the body stopped animating.
- **Every report now includes your input:** whether the joystick was held and where, the keys held, how hard you pushed, and which hands hold something.
- **The event log records:**
  - joystick down, up and cancelled by the browser, and touch lost
  - movement keys
  - app hidden and visible
  - hitches
- **Likely freeze causes fixed:**
  - The speed readout and hint panels no longer catch touches. A left thumb landing on the readout used to start nothing.
  - The joystick and look drags now capture their finger, so moving over a button or lifting outside the frame no longer drops them.
  - The page blocks the surrounding app's scroll and swipe gestures on the game area. Those could cancel the joystick mid-drag.
- **Dual sabers are the default,** lit, in both hands. Your gear choice is remembered.
- **Closed fists in every animation.** While a hand holds a hilt or the pistol, its fingers are set to a closed fist after every animation frame. That covers runs, slides, flips, previews and attacks.

## v7: report notes
- The Moves screen has a "What looked wrong?" note that goes with Send report.
- Reports record why sending failed (`dbState`, `sendError`).
- Phone previews are framed wider.

## v6: strafing
- Aim with the pistol, or guard with the saber, to face the camera and move in any direction.
- Clips are blended by their measured travel direction.

## v5: weapon arm and class moves
- While moving with a weapon, only the weapon arm holds its pose, so the torso and the free arm swing.
- Each class keeps its own ticked moves: heavy stride and hard jog for heavy infantry, anime dash for Force users.

## v4: the T-pose fix
- Moves previews stopped the animations walking used, which caused the T-pose. They now play on their own copies.
- Added the T-pose watchdog and reports.
- Added gear sets (none, hilt, saber lit, pistol) and gap filling across animation sources.

## v3: lightsaber
- Ignite and holster; single, dual or staff; reverse grip; blade colours.
- Tap chain A → B → C, hold for heavy, block.

## v2: classes and the Moves screen
- Three classes, slide and double jump.
- 30+ animation variants from Quaternius, Mesh2Motion, 100STYLE, CMU and Mixamo (via the three.js Soldier), retargeted onto one skeleton.

## v1: first prototype
- White sky, grey ground, the three.js Soldier, and a GTA-style camera.
