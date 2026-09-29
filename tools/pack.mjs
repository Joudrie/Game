import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, textureCompress, resample, dedup } from '@gltf-transform/functions';
import sharp from 'sharp';
const L='/home/user/game/assets/locomotion', OUT='/home/user/game/build';
import fs from 'fs'; fs.mkdirSync(OUT,{recursive:true});
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

// character: textures to 1024 jpeg (normals stay png)
const ch = await io.read(`${L}/quaternius_base_characters/Superhero_Male_FullBody.gltf`);
await ch.transform(
  textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024,1024], quality: 82 }),
  prune(), dedup());
await io.write(`${OUT}/hero.glb`, ch);

const KEEP = {
  ual1: ['Idle_Loop','Walk_Loop','Walk_Formal_Loop','Jog_Fwd_Loop','Sprint_Loop','Jump_Start','Jump_Loop','Jump_Land','Roll','Crouch_Idle_Loop','Crouch_Fwd_Loop','Sword_Idle','Sword_Attack','Pistol_Idle_Loop','Pistol_Shoot','Pistol_Reload','Pistol_Aim_Down','Pistol_Aim_Neutral','Pistol_Aim_Up','Interact','Spell_Simple_Enter','Punch_Jab','Punch_Cross','Death01','Hit_Chest','Hit_Head','Idle_Talking_Loop','Dance_Loop','Spell_Simple_Shoot'],
  ual2: ['Slide_Start','Slide_Loop','Slide_Exit','NinjaJump_Start','NinjaJump_Idle_Loop','NinjaJump_Land','ClimbUp_1m','Idle_FoldArms_Loop','Sword_Block','Sword_Dash','Sword_Regular_A','Sword_Regular_A_Rec','Sword_Regular_B','Sword_Regular_B_Rec','Sword_Regular_C','Sword_Regular_Combo','Sword_Heavy_Combo','Melee_Hook','Melee_Hook_Rec','OverhandThrow','Hit_Knockback','Shield_Dash','LayToIdle','Idle_No_Loop'],
};
for (const [k, list] of Object.entries(KEEP)) {
  const d = await io.read(`${L}/quaternius_${k}/${k.toUpperCase()}_Standard.glb`);
  const r = d.getRoot();
  for (const a of r.listAnimations()) if (!list.includes(a.getName())) a.dispose();
  for (const n of r.listNodes()) { if (n.getMesh()) n.setMesh(null); if (n.getSkin()) n.setSkin(null); }
  for (const m of r.listMeshes()) m.dispose();
  for (const s of r.listSkins()) s.dispose();
  for (const a of r.listAnimations()) for (const c of a.listChannels()) {
    const n = c.getTargetNode(), p = c.getTargetPath();
    if (p === 'scale' || (p === 'translation' && !['root','pelvis'].includes(n.getName()))) { const s = c.getSampler(); c.dispose(); s.dispose(); }
  }
  await d.transform(resample({ tolerance: 0.0005 }), prune({ keepLeaves: true }), dedup());
  console.log(k, r.listAnimations().map(a=>a.getName()).length, 'clips');
  await io.write(`${OUT}/${k}_anims.glb`, d);
}
