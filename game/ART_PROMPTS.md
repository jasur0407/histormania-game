# Histormania — art & audio you need to make

The game runs without any of these files: each missing image shows a flat colored placeholder.
Add files one at a time, in any order, then run `node tools/build.mjs` from the repo root.
The build finds new files automatically, so you don't change any code.

**Where files go:** `game/assets/img/<folder>/<name>.<ext>`
- The file name must match exactly, in lowercase.
- The extension can be `.webp`, `.jpg` or `.png`; the build picks up whichever exists.
- Use `.png` only for images that need transparency.
- Keep each file under about 500 KB (e.g. export as JPG/WebP at quality 80), so the itch.io page loads fast.

---

## 1. The style block (paste at the end of EVERY prompt)

> Flat 2D illustration, bold simple shapes, clean hard edges, thick dark-brown outlines, flat colors
> with one flat shadow tone, no gradients, no texture noise. Limited palette: sand beige #E9D3A6,
> terracotta red #C8553D, Nile teal #2F7F7A, deep umber #3A2A1E, warm gold #E3AA3E (plus white).
> Deadpan comic tone, simple rounded faces with dot eyes, slightly exaggerated proportions.
> Main subject centered with empty margin around it. No text, no letters, no readable writing,
> no watermark, no signature, no border or frame, not photorealistic, not 3D.

**Negative prompt** (if your tool has one): `text, letters, words, watermark, signature, frame, border, photorealistic, 3d render, gradient, blurry, extra fingers`

**Keeping it consistent:** generate the **cover** first. Then use it as the style/character reference image
for every other picture of this path, if your tool supports that (Midjourney `--sref`/`--cref`, or an
image reference in GPT-image, Ideogram or Leonardo).

**The recurring characters** (copy their description into any prompt that shows them):
- **Meri** (the player): slim Egyptian boy or man, brown skin, short black hair, white linen kilt, a small blue amulet on a cord around his neck, cheeky half-smile.
- **Hori** (his friend and later a tomb robber): chubby, shaved head, sly grin, sandals. In adult scenes he wears too many gold rings.
- **Tiy** (his wife): Egyptian woman with a black bob haircut, a colorful beaded collar and a warm laugh.

**How scenes are shown:** the game is a 16:9 desktop layout. Scene images fill a large 4:3 panel on the
left side of the screen (about 715×535 at 1280×720, bigger in fullscreen), with nothing cropped.
Text and choices sit on the right, never on top of the art, so the whole picture can be busy.

---

## 2. UI images: `game/assets/img/ui/`

| File | Size | Notes |
|---|---|---|
| `title_bg.jpg` | 1920×1080 (16:9) | Title screen background |
| `logo.png` | ~1200×600, transparent | Optional. The text logo already works |
| `heart_full.png` | 256×256, transparent | Optional. A ♥ glyph is used until then |
| `heart_empty.png` | 256×256, transparent | Optional |
| `icon.png` | 512×512 | Browser tab icon |

**title_bg**
> Wide 16:9 panorama. A long winding dirt road travels through history from left to right: on the far left, an Egyptian pyramid and palm trees; then a Roman column, a Viking longship on a river, a medieval castle, and on the far right a small steam-factory chimney. Dusk sky. Keep the CENTER of the picture simple and low-detail (calm sky and plain ground), because the logo and menu buttons sit in the middle. The busy details go near the left and right edges. + STYLE BLOCK

**logo** (only if your tool is good at text, e.g. Ideogram or GPT-image)
> Game logo wordmark "HISTORMANIA" in heavy slab-serif capital letters, warm gold #E3AA3E fill with a thick dark-brown #3A2A1E outline and a hard drop shadow, very slightly arched. A tiny red heart replaces the dot area above the letter I. Isolated on a transparent background. Flat, no gradients.

**heart_full / heart_empty** (generate on plain white, then remove the background, e.g. remove.bg)
> A single chunky cartoon heart icon, bright red #D9442F with a thick dark-brown outline and one small white shine mark. Flat game UI icon, centered, plain white background.

> Same chunky cartoon heart icon but empty: only the thick dark-brown outline, dark grey-brown #5D5148 inside, no shine. Flat game UI icon, centered, plain white background.

**icon**
> App icon: a chunky cartoon red heart with a deadpan face, wearing a tiny bronze Roman soldier helmet, on a solid terracotta #C8553D square background. Simple and readable at small size. + STYLE BLOCK

---

## 3. Path "Born by the Nile": `game/assets/img/tomb_builder/`

Setting: Deir el-Medina, the village of the workers who dug the royal tombs of Egypt, around 1185–1130 BC.
Scene size **1600×1200 (4:3)** unless noted.

| File | Used for |
|---|---|
| `cover.jpg` (**1200×1600, 3:4**) | Path card and intro screen |
| `house.jpg` | Birth and baby scenes |
| `nile.jpg` | The crocodile "log" and the hippo dare |
| `village.jpg` | Most of adult life |
| `school.jpg` | Scribe school branch |
| `tomb.jpg` | Tomb-worker branch, the lonely work day, and becoming chief |
| `wedding.jpg` | Marriage |
| `strike.jpg` | The strike and the Vizier |
| `robbers.jpg` | Tomb robbers at night |
| `court.jpg` | The robbery trial |
| `paradise.jpg` | Good ending |
| `pot.jpg` | Neutral ending |
| `quarry.jpg` | Bad ending |
| `hippo.jpg` | The joke death |
| `weighing.jpg` | Death when your hearts run out |

**cover** (3:4)
> Meri [description] as a young man, standing proudly in front of the tall pale cliffs of the Valley of the Kings, holding a copper chisel in one hand and a clay beer jar in the other. At the bottom, the Nile, with a crocodile's eyes peeking out of the water, watching him. Sunny blue sky. + STYLE BLOCK

**house**
> Inside a small mud-brick Egyptian house at night, lit by one clay oil lamp. A stern old midwife holds up a tiny screaming newborn baby, wrapped in linen. A tired mother sits on a low stool and smiles. A goose looks in through the doorway, offended. A little statue of the ugly dwarf god Bes stands on a shelf. + STYLE BLOCK

**nile**
> The bank of the Nile river on a hot day, with papyrus reeds and palm trees. In the water, a "log" floats toward the shore, but it is clearly a crocodile with its eyes and nostrils just above the water. Far behind, a hippo's ears and back break the surface. Nobody on the bank. + STYLE BLOCK

**village**
> A narrow street in an ancient Egyptian workers' village inside a dry desert valley. Whitewashed mud-brick houses in a row, rocky cliffs behind them. Neighbors chat in doorways, bread and beer jars are stacked up, and a skinny, bored donkey stands in the street. Late afternoon light. + STYLE BLOCK

**school**
> An ancient Egyptian scribe school in a shady courtyard. A strict bald teacher holds a thin stick. A row of boys sits cross-legged, copying signs onto broken pottery shards with reed brushes. One chubby boy with a shaved head (Hori) is asleep next to a hidden clay beer jar. The copied signs are abstract squiggles, not real writing. + STYLE BLOCK

**tomb**
> Inside an unfinished royal tomb corridor, deep in the rock of the Valley of the Kings. The walls are half-painted with tall Egyptian gods, and the rest is rough stone. Sweaty workers cut stone with copper chisels and wooden mallets by the light of small oil lamps. A scribe with a writing board counts lamp wicks. A small snake is curled in a dark corner. The wall paintings have no readable writing. + STYLE BLOCK

**wedding**
> Meri [description], age 18, happily carries a rolled-up reed sleeping mat into a small mud-brick house. Tiy [description] laughs at the doorway. Behind her stands her mother, arms crossed, very unimpressed, holding a goose under one arm. + STYLE BLOCK

**strike**
> The first workers' strike in history, ancient Egypt. A crowd of tomb workers sits on the ground behind a temple wall with their arms crossed, next to empty grain baskets. One of them shouts with his hands around his mouth. From the side, a proud official in long white robes arrives, with servants carrying tall feather fans. Hot sun. + STYLE BLOCK

**robbers**
> Night in a desert valley under a big moon. Two men with one small oil lamp sneak into the dark entrance of an old tomb cut into the cliff. The chubby one (Hori) wears many gold rings. Inside the tomb, gold treasure glints. Far away, a guard's lamp is coming closer. Deep teal and umber night colors. + STYLE BLOCK

**court**
> An open-air village court in ancient Egypt. Three old judges sit on a low bench, a scribe writes on papyrus, and two guards hold wooden sticks. In the middle stands a chubby man with a shaved head and gold rings (Hori), who looks sideways at the viewer with a guilty grin. + STYLE BLOCK

**paradise** (good ending)
> The Egyptian afterlife "Field of Reeds": bright green fields of wheat along clean blue canals, under a golden sky. A round, happy old man (Meri at 62, same blue amulet) lies on a cushion, drinking beer from a jar, while servants fan him. It looks like a joyful tomb wall painting, but in the flat style. + STYLE BLOCK

**pot** (neutral ending)
> Close-up of a single broken pottery shard lying in desert sand. On it is a simple, grumpy doodle of a lazy donkey lying down (no letters). A small modern archaeologist's brush lies next to it. Calm, quiet, a little funny. + STYLE BLOCK

**quarry** (bad ending)
> A blazing hot stone quarry in the Egyptian desert. A tired man in simple chains (Meri as an adult) cuts a huge block of stone with a chisel. A bored overseer with a stick sits under a small sunshade, drinking water. + STYLE BLOCK

**hippo** (death by the joke choice; keep it silly, no blood)
> A huge, angry hippo in the Nile, with a big splash of water around it. Its mouth is shut and it looks very satisfied. A single leather sandal floats on the water in front of it. The riverbank is empty except for one shocked boy (Hori) peeking from the reeds. + STYLE BLOCK

**weighing** (death when hearts run out)
> The Egyptian afterlife judgement hall. Jackal-headed Anubis kneels by a big golden balance scale. On one pan is a human heart, on the other a single white feather, and the heart side is sinking. Next to the scale, the monster Ammit (crocodile head, lion front legs, hippo back) waits eagerly with a napkin tied around its neck. Deadpan and comic, not scary. + STYLE BLOCK

---

## 4. itch.io page images (not in the game; upload them on the itch.io page)

- **Cover image, 630×500:**
  > Meri [description], age 15, triumphantly riding on the back of a hippo in the Nile for one second, with water splashing everywhere, while the hippo looks furious and a crocodile watches from the side with its jaw dropped. Pyramids and cliffs in the background. + STYLE BLOCK
- **Screenshots:** take 3–5 from the game itself in fullscreen, or with the browser window near 1280×720. Good ones: the title screen, a scene with a red result line, the "YOU ARE DEAD" ending, and the endings gallery.

---

## 5. Audio (optional): `game/assets/audio/`

The game is silent until these files exist. Any of `.mp3`, `.ogg` or `.m4a` works.
Good free sources with no attribution required: **Kenney.nl** (the "Interface Sounds" and "Impact Sounds" packs, CC0) and
**freesound.org** (filter by license: Creative Commons 0).

| File | What it should sound like |
|---|---|
| `click.mp3` | Short, soft wooden or paper tap for buttons (under 0.2s) |
| `heart_loss.mp3` | A dull thud or "oof" hit (under 0.5s) |
| `heart_gain.mp3` | A small bright chime (under 0.5s) |
| `ending_death.mp3` | A comic sad trombone or a low gong (1–2s) |
| `ending_bad.mp3` | A low, gloomy drum hit (1s) |
| `ending_neutral.mp3` | A calm single harp or lute strum (1s) |
| `ending_good.mp3` | A short happy fanfare (1–2s) |
| `music.mp3` | A quiet, loopable background track, 1–2 min, under 2 MB (e.g. lute/oud and hand drum) |
