# Adding the assets only you can get

Three things are blocked on you: a Hugging Face token (to turn your paintings into 3D), Mixamo animations (they need a free Adobe login), and a couple of decisions. Everything else I find and hook up myself.

---

## 1. Hugging Face token (turns your paintings into 3D characters)

This unlocks the painting → 3D model step, starting with The Second.

1. Go to **huggingface.co** and sign up (free).
2. Open your profile picture → **Settings** → **Access Tokens** → **Create new token**.
3. Choose **Read**, name it `game`, and create it. Copy the token.
4. In the Claude app, open this project's cloud environment: the environment menu in the session's title bar → **Edit**.
5. Add an environment variable named **`HF_TOKEN`** and paste the token as its value. Save.
6. Start a new session (the token is picked up at start) and tell me "HF token is in".

Never paste the token into the chat.

---

## 2. Mixamo animations

Mixamo is Adobe's free animation library. Its licence lets us use the clips in the game, but I can't download them without your login.

### One-time setup
1. Go to **mixamo.com** and sign in with a free Adobe account.
2. Leave the default character (**Y Bot**) selected. I retarget everything onto our skeleton, so the character doesn't matter.

### For each animation
1. Search the exact name from the lists below.
2. If there's an **In Place** checkbox, tick it (runs, walks and strafes). Leave the other sliders alone.
3. Click **Download** and use these settings:
   - Format: **FBX Binary (.fbx)**
   - Skin: **Without Skin** (much smaller file)
   - Frames per second: **30**
   - Keyframe reduction: **none**
4. Keep the file name Mixamo gives you (it matches the animation name).

### Getting the files to me
The easiest way is to upload them straight into the game repository:

1. On **github.com/Joudrie/Game**, click **Add file** → **Upload files**.
2. Drag in the `.fbx` files. At the top of the page, type `assets/mixamo/` before the file names so they land in that folder.
3. Pick **Create a new branch** and click **Propose changes**. You don't have to merge it; just tell me it's there.

A Google Drive folder works too, since Drive is connected here. Share the folder link with me in the chat.

### What to download, in order

**Batch 1: lightsaber and pistol** (fixes the things you noticed most)
- `Draw Sword 1`, `Draw Sword 2`, `Sheath Sword 1`, `Sheath Sword 2`: real draw and holster moves, to replace the arm reach I built.
- `One Hand Sword Combo`, `Two Hand Sword Combo`, `Dual Weapon Combo`: more combos, including dual-wield for The Second.
- `Stabbing` (the reverse-grip one): the Ahsoka stance and attacks.
- `Run With Sword`: a dedicated saber run.
- `Pistol Idle`, `Pistol Walk`, `Pistol Run`, `Pistol Strafe`: proper pistol movement.
- Search `holster` and download any pistol holster or unholster clips: a better draw than the arm reach.

**Batch 2: rifle**
- `Rifle 8-Way Locomotion Pack` (downloads as one zip; keep it zipped).
- `Grab Rifle From Back`, `Put Back Rifle`.
- `Firing Rifle`, `Rifle Aiming Idle`, `Reloading`.

**Batch 3: movement variety**
- `Sprint`, `Fast Run`, `Two Cycle Sprint`.
- `Running Slide`, `Sprint To Backslide`.
- `Front Flip`, `Running Forward Flip`, `Hard Landing`.
- `Hanging Idle`, `Braced Hang`, `Climbing Up Wall` (for grappling onto walls).
- `Flying` (for the jetpack).

**Batch 4: enemy deaths and hits** (exact matches for your death rules)
- Headshot: `Death From Front Headshot`, `Death From Back Headshot`.
- Legs: `Hit To The Legs`, `Sweep Fall`, `Tripping`.
- Torso: `Dying Backwards`, `Falling Back Death`, `Falling Forward Death`, `Standing React Death Backward`, `Standing React Death Forward`, `Standing React Death Left`, `Standing React Death Right`.
- Explosion and push: `Flying Back Death`, `Getting Thrown`.
- Wall impact: `Swing Into Wall`, `Knocked Down`.
- Hit reactions: `Head Hit`, `Stomach Hit`, `Big Rib Hit`, `Standing React Large From Front`.
- Get-ups: `Getting Up`, `Standing Up`.

The full list, with 91 names, is in `assets/deaths/mixamo_death_hit_names.txt`.

**Batch 5: hand-to-hand**
- `Mma Kick`, `Roundhouse Kick`, `Hurricane Kick`, `Punching`, `Uppercut`.

Batch 1 alone is a good first drop; send more whenever you like.

---

## 3. Decisions only you can make
- **Heavy infantry:** which of your characters are heavy, and whether they carry the minigun.
- **Health numbers** for each class, for when enemies start doing damage.
- **Jetpack:** unlimited, or with fuel that recharges on the ground?
- **Dismemberment:** keep it as a switch (off by default), or only for zombies later?
