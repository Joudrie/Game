#!/bin/sh
# Build the game's short sound clips (build/sfx/*.ogg, Opus mono 24 kHz) from the CC0 sources in assets/misc/sounds.
# Each gunshot is cut to its first moments with a fade, so the whole set stays around 40 KB (the play link has a 16 MB cap).
# Needs ffmpeg; `pip install imageio-ffmpeg` provides one.
set -e
cd "$(dirname "$0")/.."
FF=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())" 2>/dev/null || echo ffmpeg)
S=assets/misc/sounds; mkdir -p build/sfx
enc() { # name source seconds
  fade=$(python3 -c "print(max(0, $3 - 0.25))")
  "$FF" -hide_banner -loglevel error -y -i "$2" -t "$3" -af "afade=t=out:st=$fade:d=0.25" -ac 1 -ar 24000 -c:a libopus -b:a 36k "build/sfx/$1.ogg"
}
enc pistol  $S/free_firearm_library/Walther_PPQ_X_31P.ogg 0.7
enc ak      $S/free_firearm_library/AK-47_C_27P.ogg 0.55
enc shotgun $S/free_firearm_library/Nova_O_17P.ogg 1.0
enc sniper  $S/free_firearm_library/Mosin_Nagant_M_21P.ogg 1.4
enc pump    $S/opengameart/cc0_gun-reload-sounds/shotguncock_0.wav 0.8
enc bolt    "$S/freesound_cc0_previews/bolt_action__267895_Mosin_Nagant_Bolt_fast_.wav.mp3" 0.9
enc reload  $S/opengameart/cc0_handgun-reload/reload.wav 1.2
enc blaster $S/kenney/kenney_sci-fi-sounds/Audio/laserSmall_000.ogg 0.4
enc deflect $S/kenney/kenney_sci-fi-sounds/Audio/laserRetro_002.ogg 0.4
enc parry   $S/kenney/kenney_sci-fi-sounds/Audio/laserLarge_001.ogg 0.6
F=$S/freesound_cc0_previews
enc saber_on   $F/lightsaber_ignition__47126_lightsaber4.mp3 1.0
enc saber_off  $F/laser_sword__591433_Laser_Sword_Turn_Off_1.mp3 0.8
enc saber_swing $F/lightsaber_swing__47125_lightsaber.mp3 0.6
enc force      $F/whoosh__423799_Little_Whoosh_2.mp3 0.6
enc zap        $S/kenney/kenney_sci-fi-sounds/Audio/forceField_001.ogg 0.5
# v27: the AR, a suppressed shot (the pistol, muffled), breaking glass and wood, grenade blasts
enc ar      $S/free_firearm_library/AR-15_D_24P.ogg 0.5
"$FF" -hide_banner -loglevel error -y -i $S/free_firearm_library/Walther_PPQ_X_31P.ogg -t 0.35 -af "lowpass=f=700,volume=0.6,afade=t=out:st=0.2:d=0.15" -ac 1 -ar 24000 -c:a libopus -b:a 32k build/sfx/suppressed.ogg
K=$S/kenney/kenney_impact-sounds/Audio
enc glass   $K/impactGlass_heavy_000.ogg 0.8
enc glass2  $K/impactGlass_heavy_003.ogg 0.8
enc wood    $K/impactWood_heavy_001.ogg 0.6
enc wood2   $K/impactPlank_medium_002.ogg 0.5
enc boom    "$F/grenade_explosion__609587_Grenade_Explosion_SFX_medium-sized_meaty_realistic.mp3" 1.4
# the hum loops: a clean second from the middle of the recording
"$FF" -hide_banner -loglevel error -y -i $F/lightsaber_hum__47124_lightsaber2.mp3 -ss 0.8 -t 1.2 -af "afade=t=in:d=0.05,afade=t=out:st=1.15:d=0.05" -ac 1 -ar 24000 -c:a libopus -b:a 36k build/sfx/saber_hum.ogg
# v34 sound pass: steps, landings, hits, cuts, punches, an empty click, the grapple, bouncing grenades, pickups,
# gun draws, bodies falling, the alarm, mission stingers, the jetpack loop (Kenney Impact, Interface, RPG and Sci-fi
# Sounds, and Freesound CC0)
I=$S/kenney/kenney_interface-sounds/Audio; R=$S/kenney/kenney_rpg-audio/Audio; SF=$S/kenney/kenney_sci-fi-sounds/Audio
enc step1   $K/footstep_concrete_000.ogg 0.3
enc step2   $K/footstep_concrete_002.ogg 0.3
enc step3   $K/footstep_concrete_004.ogg 0.3
enc land    $F/land_thud__364690_Human_Impact_on_Ground.mp3 0.5
enc punch   $K/impactPunch_medium_000.ogg 0.4
enc punch2  $K/impactPunch_heavy_001.ogg 0.45
enc hit     $K/impactSoft_medium_001.ogg 0.3
enc impact  $K/impactGeneric_light_002.ogg 0.3
enc cut     $R/knifeSlice.ogg 0.4
enc dry     $F/dry_fire__725402_A_rifle_being_dry_fired_once.mp3 0.35
enc grapple $F/grappling_hook__541975_grappling_hook.mp3 0.7
enc bounce  $K/impactTin_medium_001.ogg 0.3
enc pickup  $R/handleSmallLeather.ogg 0.5
enc draw    $F/holster__239959_Gun_draw_holster.wav.mp3 0.6
enc bodyfall $F/body_fall__461697_Body_falls_into_debris.mp3 0.8
enc alarm   $I/error_006.ogg 0.6
enc win     $I/confirmation_002.ogg 0.8
enc lose    $I/error_008.ogg 0.8
"$FF" -hide_banner -loglevel error -y -i $SF/thrusterFire_002.ogg -ss 0.2 -t 0.8 -af "afade=t=in:d=0.04,afade=t=out:st=0.76:d=0.04" -ac 1 -ar 24000 -c:a libopus -b:a 32k build/sfx/jet.ogg
ls -la build/sfx
