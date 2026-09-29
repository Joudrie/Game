import json,re,subprocess,urllib.parse,os
D='/home/user/game/assets/deaths'; A='/home/user/game/assets'
def dur_bvh(p):
    t=open(p,errors='ignore').read(); fr=int(re.search(r'Frames:\s*(\d+)',t).group(1)); ft=float(re.search(r'Frame Time:\s*([\d.eE-]+)',t).group(1)); return round(fr*ft,2)
def glb_durs(p):
    out=subprocess.run(['python3',A+'/weapons/_tools/glb_info.py',p],capture_output=True,text=True).stdout
    d={}
    for l in out.split('\n'):
        m=re.match(r'\s+(.+?)\s+([\d.]+)s$',l)
        if m: d[m.group(1)]=float(m.group(2))
    return d
R=[]
# ---------- CMU ----------
CMU_LIC='CMU Graphics Lab Motion Capture Database: free for all uses incl. commercial (credit appreciated). cgspeed BVH conversion.'
cmu={
 '90_18':('torso|headshot','RugPullFall: feet yanked out, drops straight onto back in ~0.4s, lands flat face-up and stays down. Use 0.75-2.0s (frames ~90-240 @120fps) as a hard fall-backward / headshot snap-back crumple.'),
 '90_17':('leg|knockdown','BannanaPeelSlip: walks forward, feet slip out front, falls backward onto back (on ground ~3.5s), stays face-up. Use 1.75-4.0s (frames ~210-480) for leg-hit legs-out-from-under death or slip knockdown.'),
 '90_16':('torso','fall on face: small hop/stagger at 2.25-3.0s, then pitches forward onto hands and chest (face-down, head ~0.2 of height), stays down. Use 2.2-4.2s (frames ~265-505) as a stagger-then-fall-forward death.'),
 '90_12':('explosion','bck flp twst fall: backward flip with twist that fails and lands on the ground face-up (~4.75s). Use 3.4-5.5s (frames ~410-660) as an airborne spin + hard landing for blown-up deaths.'),
 '90_13':('explosion','bck flp twst fall (take 2): backward twisting flip, crashes to ground on side (~5.0s). Use 3.6-6.0s (frames ~430-720) as a thrown/spinning landing.'),
 '22_12':('hit_reaction','A stumbles into B: forward stumble 1.4 body-heights with a sway, stays on feet. Good hit-from-behind/push stagger forward.'),
 '23_12':('hit_reaction','Partner take of the same stumble: lurches forward 1.7 body-heights, recovers to standing.'),
 '91_59':('hit_reaction','360 smallStumble: small in-place stagger (head dips ~6%), recovers. Light stagger.'),
 '104_13':('hit_reaction|leg','StumbleWalk: drunken stumbling walk, lurches and dips (head to 0.85) twice, stays up. Use for dazed/stunned stagger locomotion.'),
 '85_07':('knockdown','KickFlipStumble: after a kick-flip the actor stumbles and drops to a crouch/hands (head 0.47 at ~5.5s) then recovers ~6.5s. Use 4.7-6.8s as stumble-to-knee-and-recover.'),
 '77_09':('hit_reaction|explosion','duck to avoid flying object: two sharp ducks/cowers (head drops to ~0.5) and recovers. Non-lethal flinch from a nearby blast or thrown object.'),
 '77_19':('leg','limping, hurt right leg (post leg-hit locomotion). Same data as 139_19 "Walk Wounded Leg".'),
 '91_16':('leg','Limp: long limping walk (15.8s). Post leg-hit locomotion.'),
 '142_12':('leg','Painfulleftknee: long stylized walk favouring the left knee (39s). Post leg-hit locomotion.'),
 '140_01':('getup','Get Up Face Down: starts prone face-down, pushes up, standing by ~4.25s.'),
 '140_02':('getup','Get Up Face Down (take 2): prone face-down, standing by ~5.0s.'),
 '140_03':('getup','Get Up Laying on Side: starts on side, rolls to hands and knees, standing by ~6.0s.'),
 '140_04':('getup','Get Up Laying on Side (take 2): standing by ~6.75s.'),
 '140_08':('getup','Get Up From Ground Laying on Back: starts face-up, sits up, rolls over to a knee, standing by ~5.25s.'),
 '140_09':('getup','Get Up From Ground Laying on Back (take 2): standing by ~4.5s.'),
 '77_16':('getup','laying down, getting up (index text) = "Get Up From Ground" in subject 139 naming: starts face-down, standing by ~3.5s (fastest face-down get-up).'),
 '77_17':('getup','Get Up From Ground (take 2): starts face-down, standing by ~5.25s.'),
 '77_18':('getup','Get Up From Ground Laying on Back: starts on back/side, standing by ~4.5s, ends in a careful ready pose.'),
 '111_06':('getup','Get up from floor: starts lying face-up, slow get-up, standing by ~10s (elderly/slow style).'),
 '111_07':('getup|torso','Lies down (on ground 2.5s, face-up) then later gets up (standing ~14.3s). The 0.8-3.0s lie-down segment works as a slow controlled collapse onto the back.'),
 '111_08':('getup','Get up from floor: starts face-up, standing by ~10.5s (slow).'),
 '113_08':('getup|torso','Lay down and get up: goes down via kneel (head 0.4 at 2s) onto back (4.0s), lies until 10.5s, stands by ~13.3s. 0.8-4.2s = kneel-then-collapse-onto-back.'),
 '114_02':('getup','Getting up from laying down: starts on side, standing by ~10s.'),
 '114_11':('getup','Laying down and getting up (29s): on ground 6.75-12.75s, standing by ~19.75s.'),
}
clips=[]
for k,(cat,desc) in cmu.items():
    p=f'{D}/cmu_bvh/{k}.bvh'
    if os.path.exists(p): clips.append(dict(name=k,file=f'cmu_bvh/{k}.bvh',duration=dur_bvh(p),category=cat,description=desc))
R.append(dict(path=D+'/cmu_bvh',source='https://github.com/una-dinosauria/cmu-mocap (raw data/NNN/NN_NN.bvh); index http://mocap.cs.cmu.edu',license=CMU_LIC,skeleton='CMU/cgspeed 31-joint BVH (Hips, LHipJoint, LeftUpLeg..., Head), Y-up, 120 fps, frame 0 is a T-pose',clips=clips,
  notes='CMU has no scripted deaths; these are falls, stumbles, limps and get-ups. Time ranges exclude the T-pose frame (frame = t*120+1). Searched index for fall/die/death/stumble/get up/hit/shot/push/knock.'))
# ---------- ACCAD ----------
acc={'Male1_A8_CrouchToLie':('torso|getup','crouch, then lowers onto hands and slides down to lie prone face-down (on ground ~4s). Slow wounded collapse onto stomach.'),
'Male2_A8_CrouchToLie':('torso|getup','crouch to lying prone (head bottoms out ~3.7s). Slow collapse to stomach.'),
'Female1_A08_CrouchToLie':('torso|getup','crouch to lying prone face-down (on ground ~3.5s).'),
'Male1_A9_LieDown':('getup','lying prone idle (8.3s) - dead/downed loop.'),
'Male1_A10_LieToCrouch':('getup','prone face-down pushes up to a crouch (first half of a get-up; ends crouched ~0.73 height).'),
'Male2_A10_LieToCrouch':('getup','prone to crouch (ends ~0.8 height).'),
'Female1_A10_LieToCrouch':('getup','prone to crouch (ends ~0.6 height).')}
R.append(dict(path=D+'/accad_bvh',source='https://accad.osu.edu/research/motion-lab/mocap-system-and-data (Male1_bvh.zip, Male2_bvh.zip, Female1_bvh.zip)',license='CC BY 3.0 (credit: ACCAD, The Ohio State University)',skeleton='22-joint BVH (Hips, ToSpine, Spine, Spine1, Neck, Head, LeftShoulder...), 30 fps',
  clips=[dict(name=k,file=f'accad_bvh/{k}.bvh',duration=dur_bvh(f'{D}/accad_bvh/{k}.bvh'),category=c,description=d) for k,(c,d) in acc.items()]))
# ---------- KayKit ----------
kd={}
for f in ['Rig_Medium_General','Rig_Medium_Simulation','Rig_Medium_Special','Rig_Medium_CombatMelee','Rig_Large_General']: kd[f]=glb_durs(f'{D}/kaykit_1.1/{f}.glb')
kk=[('Rig_Medium_General','Death_A','torso|headshot','fast death: falls straight backward onto back in ~0.3s, face-up (1.0 body-height back).'),
('Rig_Medium_General','Death_A_Pose','pose','static end pose of Death_A (lying face-up).'),
('Rig_Medium_General','Death_B','torso','slow death: sags, drops to its knees and slumps forward, ends kneeling/folded (head ~0.38) - drop-to-knees death.'),
('Rig_Medium_General','Death_B_Pose','pose','static end pose of Death_B.'),
('Rig_Medium_General','Hit_A','hit_reaction','small upper-body flinch, feet planted.'),
('Rig_Medium_General','Hit_B','hit_reaction','bigger flinch: head dips to 0.91 and recoils back 0.3, recovers.'),
('Rig_Medium_Simulation','Lie_Down','getup|torso','controlled lie-down from standing onto back/side (on ground ~1.25s).'),
('Rig_Medium_Simulation','Lie_Idle','getup','lying idle loop (downed/dead loop).'),
('Rig_Medium_Simulation','Lie_StandUp','getup','from lying on back to standing (2.3s).'),
('Rig_Medium_Special','Skeletons_Death','explosion|torso','skeleton-style death: thrown backward ~2.3 body-heights and collapses face-up in 0.5s (reads as blown back).'),
('Rig_Medium_Special','Skeletons_Awaken_Floor','getup','rises from lying on floor to standing (2.3s).'),
('Rig_Medium_Special','Skeletons_Awaken_Floor_Long','getup','slower version of the floor get-up (3.8s).'),
('Rig_Medium_Special','Skeletons_Death_Resurrect','getup','from the Skeletons_Death pose back up to standing (2.7s).'),
('Rig_Medium_Special','Skeletons_Inactive_Floor_Pose','pose','lying on floor pose.'),
('Rig_Medium_CombatMelee','Melee_Block_Hit','hit_reaction','hit while blocking: recoils back 0.2, recovers.'),
('Rig_Large_General','Death_A','torso','Rig_Large (big character) death: sags then falls backward face-up (on ground ~1.25s).'),
('Rig_Large_General','Hit_A','hit_reaction','Rig_Large flinch.')]
R.append(dict(path=D+'/kaykit_1.1',source='https://kaylousberg.itch.io/kaykit-character-animations (Free 1.1)',license='CC0',skeleton='KayKit Rig_Medium / Rig_Large (23 bones: root, hips, spine, chest, head, upperarm.l ...); Rig_Medium matches /home/user/game/assets/locomotion/kaykit_char_anims_1.1',
  clips=[dict(name=c,file=f'kaykit_1.1/{f}.glb',duration=kd[f].get(c),category=cat,description=d) for f,c,cat,d in kk],
  notes='Also has Rig_Large_Special/Transform etc. (not relevant). Mannequin meshes are in the free zip too.'))
# ---------- monogon ----------
R.append(dict(path=D+'/monogon_cc0',source='https://maxparata.itch.io/cc0-animations',license='CC0',skeleton='Mixamo bone names (Hips, Spine, Spine1, Spine2, Neck, Head, LeftArm...), animation-only (no mesh)',
  clips=[dict(name='Death',file='monogon_cc0/Death.glb (+Death.fbx)',duration=2.29,category='torso',description='stands ~1s, twists and falls sideways-backward (toward its right), lands face-up at ~1.75s.'),
         dict(name='Hit',file='monogon_cc0/Hit.glb (+Hit.fbx)',duration=0.71,category='hit_reaction',description='torso flinch: recoils back 0.3 body-heights and returns.')]))
# ---------- Quaternius Animated Human ----------
R.append(dict(path=D+'/quaternius_animated_human',source='https://opengameart.org/content/animated-human-low-poly (= quaternius.com/packs/animatedman.html)',license='CC0',skeleton='Quaternius old "Human Armature" (Hips, Spine, Head, LeftArm...), mesh included',
  clips=[dict(name='Human Armature|Death',file='quaternius_animated_human/AnimatedHuman.glb (+.fbx)',duration=3.5,category='torso',description='clutches/sags (1.0-1.5s), drops to its knees (head ~0.55), then topples forward face-down (on ground ~2.25s). Drop-to-knees-then-fall-forward.')]))
# ---------- Endorphin (unlicensed) ----------
end=[]
edesc=open(D+'/_tools/endorphin_desc.txt').read().strip().split('\n')
emap={'2_Death_Back':'torso|headshot','2_Death_Back_Far':'explosion|torso','2_Death_Back_Far2':'torso','2_Death_Back_Far_Flip':'explosion','2_Death_Down':'torso','2_Death_Down_Left':'torso','2_Death_Down_Right':'torso','2_Death_Down_Right2':'torso','2_Death_Forward_Far':'torso|explosion','2_Death_Forward_Med':'torso','2_Death_Left_Far':'torso|explosion','2_Death_Right_Far':'torso|explosion','2_Stumble_Back':'knockdown','2_Stumble_Left':'knockdown','2_Stumble_Left2':'knockdown','2_Stumble_Right':'knockdown','2_Stumble_Right2':'knockdown','Knock Back High Face':'explosion|knockdown','Knock Back High':'explosion|knockdown','Knock Back':'explosion|knockdown','Knock Down Left 2':'knockdown','Knock Down Left':'knockdown','Knock Forward':'knockdown','Stagger Back':'knockdown|torso','Stagger left':'knockdown','Stagger longer left':'knockdown','Stagger right':'knockdown'}
for l in edesc:
    n,du,de=l.split('\t'); k=n[:-4]
    end.append(dict(name=k,file='_UNLICENSED_reference_openmw_endorphin_bvh/'+n,duration=float(du),category=emap.get(k,'knockdown'),description='(auto) '+de))
R.append(dict(path=D+'/_UNLICENSED_reference_openmw_endorphin_bvh',source='https://github.com/MaxYari/HitReactionsAnimatedOpenMW (Sources/bvh)',license='NONE STATED - all rights reserved by default. Reference only; do not ship without permission from the author (MaxYari).',skeleton='NaturalMotion Endorphin 28-joint BVH (root, LowerSpineJoint... UpperNeckJoint, LeftShoulderJoint, LeftHipJoint...), 60 fps',clips=end,
  notes='Physics-simulated (Endorphin) deaths/knockdowns: the best variety found, but no licence. Left/Right in file names appear to be the hit side (analyzer sees Death_Left_Far fall toward the character right). Every clip ends lying on the ground (no get-up).'))
# ---------- existing assets ----------
def ex(path,src,lic,skel,items,notes=None):
    d=glb_durs(path); e=dict(path=path,source=src,license=lic,skeleton=skel,already_on_disk=True,clips=[dict(name=n,duration=d.get(n),category=c,description=x) for n,c,x in items])
    if notes:e['notes']=notes
    R.append(e)
ex(A+'/weapons/mesh2motion-cc0/human-addon-animations.glb','https://github.com/scottpetrovic/mesh2motion-app','CC0','Mesh2Motion UE5-style human (pelvis, spine_01.., head, upperarm_l), same as Quaternius UAL naming',[
 ('Death_A','torso','slow death: staggers ~2s, sags and folds forward to the ground face-down (on ground ~3.75s).'),
 ('Death_B','torso','steps back, spins/twists and falls onto its front (face-down, head toward where its back was) - spin-and-fall.'),
 ('Death_C','headshot|torso','instant collapse straight backward onto back (ground in 0.5s), face-up - headshot crumple.'),
 ('Idle Hurt','hit_reaction','hunched hurt idle loop.'),('Dizzy','hit_reaction','dazed swaying idle (stunned).'),
 ('Zombie_Rise','getup','rises from the ground to standing (3.4s).'),('Kneeling Tired','hit_reaction','kneeling exhausted loop (wounded on knees).'),
 ('Land_Three_Point','knockdown','superhero three-point landing (hard landing).')])
ex(A+'/weapons/mesh2motion-cc0/human-base-animations.glb','https://github.com/scottpetrovic/mesh2motion-app','CC0','Mesh2Motion human',[
 ('Death_D','torso','sags ~1s then falls backward onto back, face-up.'),('Hit_Chest','hit_reaction','small chest flinch.'),('Hit_Head','hit_reaction','small head snap.'),
 ('Hit_Knockback','explosion|knockdown','knocked backward onto back, rolls over backward and comes back up to a crouch/stand (0.8s).'),('Hit_Knockback_RM','explosion|knockdown','root-motion version: travels ~5 body-heights backward.')])
ex(A+'/locomotion/quaternius_ual1/UAL1_Standard.glb','https://quaternius.com/packs/universalanimationlibrary.html','CC0','Quaternius UAL (UE5 mannequin names)',[
 ('Death01','torso','falls backward onto back, face-up (ground ~1.0s).'),('Hit_Chest','hit_reaction','chest flinch.'),('Hit_Head','hit_reaction','head snap.')])
ex(A+'/locomotion/quaternius_ual2/UAL2_Standard.glb','https://quaternius.com/packs/universalanimationlibrary2.html','CC0','Quaternius UAL',[
 ('Hit_Knockback','explosion|knockdown','thrown backward onto its back (1.6 body-heights), ends lying face-up.')])
ex(A+'/misc/models/quaternius_toonshooter/Characters/glTF/Character_Enemy.gltf','https://quaternius.com/packs/toonshootergamekit.html','CC0','Quaternius Toon Shooter rig',[('Death','torso','quick fall backward, face-up (0.77s).'),('HitReact','hit_reaction','recoil back 0.2.')])
ex(A+'/misc/models/quaternius_modular_chars/Individual Characters/glTF/Swat.gltf','https://quaternius.com/packs/ultimatemodularcharacters.html','CC0','Quaternius modular chars rig (same clips in quaternius_cyberpunk Character.gltf)',[('Death','torso','falls backward face-up via a knee buckle (1.07s).'),('HitRecieve','hit_reaction','flinch.'),('HitRecieve_2','hit_reaction','flinch variant.')])
ex(A+'/locomotion/godot_demos/tps_player.glb','Godot TPS demo','CC-BY 3.0','Godot TPS demo robot rig',[('flinch1','hit_reaction','light flinch.'),('flinch2','hit_reaction','light flinch variant.'),('flinch_heavy','hit_reaction','heavy flinch.')])
ex(A+'/misc/models/threejs_examples/RobotExpressive.glb','three.js examples (RobotExpressive by Tomas Laulhe)','CC0','RobotExpressive rig',[('Death','explosion|torso','thrown backward 1.7 body-heights, lands face-up in 0.5s.')])
ex(A+'/locomotion/kenney/mini/character-male-a.glb','https://kenney.nl (Mini Characters)','CC0','Kenney mini rig (chibi)',[('die','torso','0.33s tip-over backward (chibi).')])
# ---------- Mixamo ----------
mix=json.load(open(D+'/_tools/mixamo_pick.json'))
R.append(dict(path=None,source='https://www.mixamo.com (search API /api/v1/products, no login needed to search; download needs a free Adobe ID)',license='Adobe Mixamo terms: free to use in games/projects; raw files may not be redistributed as standalone assets',skeleton='Mixamo (mixamorig:Hips ...)',clips=mix,notes='Not downloaded. Names are exact Mixamo product names; desc is the Mixamo description; motion_id for direct lookup.'))
json.dump(R,open(D+'/REPORT.json','w'),indent=1)
print('entries',len(R),'clips',sum(len(r['clips']) for r in R))
