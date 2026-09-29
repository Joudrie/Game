# Changelog

Playable build: `dist/index.html`, also published at the claude.ai artifact link. Every report the game sends includes its build number (`build: "v8 · …"`), so we can tell which version you were playing.

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
