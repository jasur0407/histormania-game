# Publishing Histormania on itch.io

## 1. Build
From the repo root:
```
node tools/simulate.mjs     # optional: checks every playthrough of every path
node tools/build.mjs        # validates, bundles, writes dist/histormania.zip
```
The build stops if any path has a structural error. It also lists which images are still missing;
missing images are fine, because the game shows placeholders.

To test locally before uploading, serve the folder the way itch.io does:
`python -m http.server 8000` inside `game/`, then open http://localhost:8000.
The game never fetches files at runtime, so double-clicking `game/index.html` should also work.

## 2. Create the project (itch.io → Dashboard → Create new project)

| Field | Value |
|---|---|
| Title | Histormania |
| Kind of project | **HTML** |
| Uploads | `dist/histormania.zip`, then tick **"This file will be played in the browser"** |
| Embed options → Viewport dimensions | **1280 × 720** (or 960 × 540 if you want a smaller frame; the game scales to any 16:9 size) |
| Embed options → Mobile friendly | ☐ **unticked**. This is a desktop game |
| Embed options → Fullscreen button | ✅ ticked (the game also has its own fullscreen button and the <kbd>F</kbd> key) |
| Embed options → Enable scrollbars | ☐ unticked |
| Embed options → Automatically start on page load | leave unticked (shows a "Run game" button; fine either way) |
| Classification | Games |
| Genre | Interactive Fiction |
| Tags | `choose-your-own-adventure`, `history`, `interactive-fiction`, `text-based`, `choices-matter`, `dark-humor`, `short`, `egypt`, `ancient-egypt` |
| Cover image | 630×500. The prompt is in `game/ART_PROMPTS.md` §4 |
| Screenshots | 3–5 taken from the game in fullscreen (16:9) |
| Platforms / Inputs (Metadata) | Web; Mouse, Keyboard |
| Pricing | your choice (e.g. "No payments" or "Name your own price") |

## 3. Suggested page text

**Short description / tagline:** Live short lives in real history. Two choices at a time. Try not to die.

**Description:**
> CONGRATULATIONS! You are born in Egypt, 1185 BC.
>
> Histormania is a short, darkly funny choice game set in real history. Every life starts at birth and every
> decision has only two options. Some of them cost you hearts. Lose them all and your life ends. It ends
> badly, but in a way that is part of the story.
>
> **Born by the Nile:** grow up in the real village of the men who dug the Pharaohs' tombs. Survive
> crocodiles, school beatings, your mother-in-law, the first workers' strike in history and a very
> tempting offer from your oldest friend.
>
> - 5 endings to find, from paradise to the belly of a monster
> - Real history: Ramesses III, the strike of 1157 BC, the tomb-robbery trials, the weighing of the heart
> - About 5 minutes per life. Plays in your browser with mouse or keyboard (1 / 2 to choose)
>
> More lives from other eras are coming.

## 4. Your profile page
The theme, banner, avatar and About section for your itch.io profile, plus a matching theme for this
game page, are in **`itch/PROFILE_SETUP.md`**.

## 5. Updating
Rebuild, then upload the new `dist/histormania.zip` to the same project and delete the old file.
Progress (endings found, the autosaved life) is stored in each player's browser with
localStorage under a `histormania.v1.` prefix. It normally survives updates, but a player who clears site
data, or plays in a private window, starts fresh.
