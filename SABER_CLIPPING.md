# Saber clipping list

The in-game sweep (Menu → Tests → Check saber clipping) played 186 animations with **dual** sabers lit, normal grip. **51** of them had a blade cutting into the body.

How it's measured: the body is modelled as capsules (torso, chest, neck, head, thighs, shins, upper arms, forearms) and each blade as a line segment. The forearm holding each hilt is skipped. "Frames" is the share of 20 sampled frames where a blade is inside a capsule.

Fix options, per animation:
- Swap in a saber-specific clip from Mixamo, such as `Run With Sword`, `Great Sword` idles or `Dual Weapon Combo`.
- Hold the blade further out with an arm pose offset.
- For locomotion, keep the blade lowered or retracted (hilt only) while sprinting.

This file was generated on 2026-09-29 from build v9. Run the sweep again after changing animations; its result arrives as a `saber-clipping` report.

## Walking, running and idle with the sabers lit (what you see in play) (6)

| Animation | Blade cuts into | Frames |
|---|---|---|
| `walk: M2M_Walk_Stealth + STANCE_HighGuard (moving, saber lit)` | left thigh, left shin | 45% |
| `walk: M2M_Walk_Large + STANCE_HighGuard (moving, saber lit)` | left thigh, left shin | 30% |
| `jog: Jog_Fwd_Loop + STANCE_HighGuard (moving, saber lit)` | right shin, right thigh | 15% |
| `sprint: Jog_Fwd_Loop + STANCE_HighGuard (moving, saber lit)` | right shin, right thigh | 15% |
| `sprint: M2M_Run_Anime + STANCE_HighGuard (moving, saber lit)` | left thigh, right shin | 15% |
| `sprint: Sprint_Loop + STANCE_HighGuard (moving, saber lit)` | right shin | 10% |

## Saber and sword animations (7)

| Animation | Blade cuts into | Frames |
|---|---|---|
| `M2M_Defend` | left forearm | 100% |
| `Sword_Regular_B` | right upper arm, chest, right thigh, right shin | 35% |
| `Sword_Heavy_Combo` | chest, right upper arm, left shin, left thigh, torso | 30% |
| `Sword_Dash` | chest | 10% |
| `Sword_Regular_C` | chest | 5% |
| `Sword_Block` | left thigh, left shin | 5% |
| `Sword_Regular_Combo` | chest | 5% |

## Other animations (sabers held in hand while previewing non-saber moves) (38)

| Animation | Blade cuts into | Frames |
|---|---|---|
| `Idle_FoldArms_Loop` | chest, head | 100% |
| `ST_Run_Roadrunner` | left thigh, right thigh, left shin, torso | 100% |
| `Punch_Cross` | chest, head, neck | 100% |
| `ST_Run_Neutral` | head, chest, neck | 95% |
| `ST_Walk_Neutral` | right thigh, left thigh | 90% |
| `M2M_Run_Anime` | chest, neck, head | 85% |
| `ST_Run_HighKnees` | right thigh, left thigh, left shin | 75% |
| `MX_Walk` | left thigh, left shin, right thigh, right shin | 70% |
| `Punch_Jab` | chest, head | 70% |
| `ST_Run_Rushed` | head, chest, neck, left shin, right thigh, left thigh | 65% |
| `M2M_Dodge_left` | chest, head, right upper arm, left thigh | 55% |
| `M2M_Dodge_right` | chest, head, left upper arm, right thigh | 55% |
| `SW_Run_Right` | torso, left thigh, right thigh, right shin | 55% |
| `ST_Walk_Rushed` | right thigh, left thigh | 50% |
| `Slide_Exit` | left thigh, left shin, chest, head | 50% |
| `Roll` | left thigh, left shin, head, chest, neck, right upper arm | 50% |
| `MX_Run` | head, chest, torso | 45% |
| `ClimbUp_1m` | head, left shin, right thigh, right shin, left thigh | 45% |
| `M2M_Throw_Object` | torso, chest, right upper arm | 45% |
| `CMU_Backflip_A` | left thigh, right thigh, right shin, left shin | 40% |
| `ST_Walk_Proud` | right thigh, left thigh | 35% |
| `ST_Run_BigSteps` | right thigh, left thigh, left shin | 35% |
| `ST_Run_Proud` | right thigh | 35% |
| `Sprint_Loop` | head | 35% |
| `Slide_Start` | head, chest, neck, right upper arm, torso | 35% |
| `Jog_Fwd_Loop` | head | 25% |
| `CMU_SideFlip` | left thigh, left shin, right thigh | 25% |
| `M2M_Dodge_back` | chest | 20% |
| `CMU_Backflip_B` | left thigh, left shin, right thigh, right shin | 15% |
| `M2M_Death_B` | head, chest | 15% |
| `NinjaJump_Land` | right thigh, right shin | 10% |
| `M2M_Backflip` | right upper arm, right thigh | 10% |
| `M2M_Land_Three_Point` | chest, left thigh, left shin | 10% |
| `Melee_Hook` | chest, head | 10% |
| `M2M_Run_Stealth` | right thigh | 5% |
| `ST_Walk_Crouched` | left thigh | 5% |
| `NinjaJump_Start` | right thigh, right shin | 5% |
| `OverhandThrow` | left shin | 5% |
