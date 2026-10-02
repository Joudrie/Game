# Recording soldier voices

How the owner records lines, and how they become the game's voices (v37).

## Recording
- One long recording is fine. Before each group, say the label quietly: "This is me saying reloading". Then yell the takes, with about a second's pause between them.
- Say each line several ways (calm, yelled, panicked) and with different words ("Reloading!", "Changing mag!", "Cover me, I'm reloading!"). That's what keeps it from sounding repeated.
- Any phone voice-memo app works (m4a, mp3, wav). A quiet room, phone a hand's width from your mouth.
- A new voice (a friend, or you doing a different guy) is a new recording: it becomes `v2`, `v3`…, and each soldier gets one of the voices.

## The categories, most used first
| Category | When the game plays it | Example lines |
|---|---|---|
| `pain` | hit, and the last cry when he dies (not headshots) | grunts, "Agh!", groans |
| `spot` | a guard sees you (the "!") | "Contact!", "There he is!", "Over there!" |
| `reload` | a soldier in a fight stops to change mags | "Reloading!", "Changing mag!" |
| `sus` | a guard notices something (the "?") | "Huh?", "Did you hear something?" |
| `chatter` | *not recorded yet*: calm guards talking on patrol | "Quiet tonight.", "I'm starving." |
| `mandown` | a buddy dies where he can see | "Man down!", "He's dead!" |
| `whatthe` | a calm guard sees a buddy drop | "What the—?!" |
| `grenade` | your grenade comes down near him, or a sticky lands on him | "Grenade!", "Get down!", "Move!" |
| `giveup` | the "?" fades, or he loses you for good | "Must have been the wind.", "Eh, whatever." |
| `alarm` | after "Contact!", alerting everyone | "Sound the alarm!", "We're under attack!" |
| `search` | he lost sight of you for a few seconds | "Where'd he go?", "Spread out!" |
| `cover` | now and then mid-fight | "Cover me!", "Moving!", "Push up!" |
| `flying` | Force-pushed or blown into the air | screams |
| `jedi` | spotted while your saber is lit | "We got a Jedi over here!" |
| `panic` | three soldiers down in a few seconds, or his gun hand cut off | "Fall back!" |
| `arm` | an arm or hand cut off | "My arm!" |
| `hit` | sometimes instead of `pain` when shot | "I'm hit!" |
| `medic` | after losing an arm or a leg | "Medic!", "I need a medic!" |
| `fire` | set alight | screaming |
| `barrels` | a barrel blows up near him | "Who put those barrels there?!" |
| `taunt` | you die | "Target down!", "Got him!" |
| `fragout` | *not used yet*: soldiers throwing grenades | "Frag out!" |

## Rules in the game
- One voice says one line at a time. With everyone sharing voice v1, you never hear two soldiers at once; a scream cuts a calmer line off.
- Takes come from a shuffled deck per category, so the same take never plays twice in a row.
- A soldier who dies mid-sentence stops talking.
