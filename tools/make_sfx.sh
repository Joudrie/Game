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
ls -la build/sfx
