# Your itch.io profile: gaming-style setup

**The look:** a dark "title screen" page in the same colors as Histormania: deep umber background, papyrus-cream
text, gold headers and terracotta buttons. A wide banner shows your name as a chunky game logo over a
panorama of history, and your About section reads like a character sheet (Player 1, HP, current quest,
achievements).

Everything here works **without custom CSS**. Budget about 20 minutes once the images exist.
Wherever you see **STUDIO NAME**, use your developer/studio name.

---

## 1. Images to generate (3 required, 1 optional)

> **Already generated** (2026-09-30, via ChatGPT) and ready in this folder: `profile_banner.png` (no name yet, so
> add STUDIO NAME in the dark center as described below), `profile_background.jpg`, `avatar.png` and
> `itch_cover.png`. The prompts below are kept so you can regenerate any of them. Raw originals are in
> your Downloads folder as `hm_*.png`; `python tools/process_art.py` re-crops them.

Paste the **style block** from `game/ART_PROMPTS.md` §1 at the end of each prompt. Then add:
`video game title screen feel, strong silhouettes, high contrast against a dark background`.

### `profile_banner.png`: 1920×480
The banner replaces your name at the top of the profile, so **the name has to be in the image**.
itch.io centers the banner and crops the sides on smaller screens, so keep the name and main art
**inside the middle 1000 px**.

> Wide video game title banner. In the center, the words "STUDIO NAME" in huge chunky slab-serif capital letters, warm gold #E3AA3E with a thick dark-brown #2B2118 outline and a hard drop shadow straight down, like a retro game logo. Behind and around the name, a panorama of history in silhouette on a dark dusk sky: on the left, a pyramid, palm trees and a hippo in a river; on the right, a Roman column, a Viking longship and a castle tower. A small row of five red cartoon hearts sits under the name, like a health bar. Dark umber #1D1915 edges that fade into the page. + STYLE BLOCK

**If the generator garbles the letters** (common), generate the same prompt with *"no text; leave the center empty"*.
Then add the name yourself for free in **Photopea** (photopea.com, runs in the browser):
- Font: **Alfa Slab One** (a free Google Font; Photopea has it).
- Fill **#E3AA3E**.
- Stroke 6 px **#2B2118**, set to outside.
- Drop shadow **#2B2118**, 100% opacity, distance 10 px straight down, size 0.

Save as PNG.

### `profile_background.jpg`: 1920×1080
This sits behind the whole page. Keep it dark and quiet so the text stays readable.

> Very dark, low-contrast wallpaper for a video game website. Deep umber #1D1915 background with faint, slightly lighter outlines of history scattered sparsely around the edges: a pyramid, a sword, a crown, an hourglass, a scroll, a small heart. The center column is almost empty and plain. The bottom 20% fades into solid #120E0B. Subtle, calm, not busy. + STYLE BLOCK

### `avatar.png`: 512×512 (your profile picture)
Use the same image as the game's `icon.png` (prompt in `game/ART_PROMPTS.md` §2), so your profile and game
share a mascot: a red heart with a deadpan face wearing a tiny Roman helmet. Generating it once covers both.

### Optional: `divider.png`, 960×40, transparent
A decorative line for the About section. Put it in place of the `<hr>` lines via the editor's image button.

> A thin horizontal ornamental divider for a game website: a gold #E3AA3E line with a small red cartoon heart in the exact center and tiny diamond ends. Flat, on plain white (remove the background after). + STYLE BLOCK

---

## 2. Set it up on itch.io

**A. Profile picture and name.** Go to itch.io → your avatar (top right) → **Settings → Profile**. Upload `avatar.png`
and set your display name to **STUDIO NAME**.

**B. About section.** Open your profile page (`yourname.itch.io`) → **Edit profile**. Switch the description
editor to HTML/source mode and paste the contents of **`itch/profile_about.html`**, without the comment at the top.
Replace `STUDIO NAME` and `GAME_URL`, then save.

**C. Theme.** On your profile page, click **Edit theme** (top of the screen, only you see it). Set:

| Setting | Value |
|---|---|
| Banner / header image | `profile_banner.png` |
| Background image | `profile_background.jpg`, no repeat, centered at the top (if those options appear) |
| **BG** (page background) | `#120E0B` (matches the faded bottom of the background image) |
| **BG2** (content column) | `#1D1915`. In *More options*, set BG2 alpha to about **90%** so the background shows faintly |
| **Text** | `#F3E8D0` |
| **Link** | `#E3AA3E` |
| **Buttons** | `#C8553D` |
| **Headers** | `#E3AA3E` |
| Header font | **Alfa Slab One** (type it in the font search, since every Google Font is available) |
| Body font | **Nunito** |

These are the game's own colors and fonts, so the jump from profile to game feels seamless.

**D. Show the game.** Make sure Histormania is published and not hidden. It then appears in the games
grid on your profile automatically.

---

## 3. Match the Histormania game page

Open the game page → **Edit theme** and use the **same color and font table** as above, plus:

| Setting | Value |
|---|---|
| Banner | `game/assets/img/ui/logo.png` (the transparent HISTORMANIA logo from the art prompts) |
| Background image | `profile_background.jpg` (the same one) |
| Layout | Single column (the default for browser games) |

---

## 4. Optional, later: custom CSS
itch.io only enables custom CSS after you email support, and it doesn't grant it to empty accounts. Ask once the
game is up. If they enable it, paste **`itch/custom.css`**. It adds the game's "chunky button" feel:
- game cards get the thick outline and hard shadow and lift when hovered
- buttons get the same press effect as in the game

Without CSS the profile still looks complete. This is only polish.
