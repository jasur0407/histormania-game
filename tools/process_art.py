"""Turn raw generated images (hm_<name>.png, e.g. from ChatGPT) into game-ready files.

Crops each image to the aspect ratio the game expects, resizes, compresses, and writes it
to the right place in game/assets/img/ or itch/. Safe to rerun; existing outputs are overwritten.

Usage:  python tools/process_art.py [source_dir]      (default: ~/Downloads)
Then:   node tools/build.mjs                           (so the game picks the images up)
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "game" / "assets" / "img"
ITCH = ROOT / "itch"
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / "Downloads"

SCENES = ["house", "nile", "village", "school", "tomb", "wedding", "strike", "robbers",
          "court", "paradise", "pot", "quarry", "hippo", "weighing"]

# name -> (output path, kind, options)
JOBS = {name: (IMG / "tomb_builder" / f"{name}.jpg", "crop", {"ratio": 4 / 3}) for name in SCENES}
JOBS.update({
    # keep the bottom of the cover (the crocodile); the sky on top can go
    "cover": (IMG / "tomb_builder" / "cover.jpg", "crop", {"ratio": 3 / 4, "anchor_y": 1.0}),
    "title_bg": (IMG / "ui" / "title_bg.jpg", "crop", {"ratio": 16 / 9}),
    "logo": (IMG / "ui" / "logo.png", "cutout", {"max_w": 1200}),
    "heart_full": (IMG / "ui" / "heart_full.png", "cutout", {"square": 256}),
    "heart_empty": (IMG / "ui" / "heart_empty.png", "cutout", {"square": 256}),
    "icon": (IMG / "ui" / "icon.png", "resize", {"size": (512, 512)}),
    "itch_cover": (ITCH / "itch_cover.png", "crop", {"ratio": 630 / 500, "size": (630, 500)}),
    "profile_banner": (ITCH / "profile_banner.png", "crop", {"ratio": 4.0, "size": (1920, 480)}),
    "profile_background": (ITCH / "profile_background.jpg", "crop", {"ratio": 16 / 9, "size": (1920, 1080)}),
})
EXTRA_COPIES = {"icon": [ITCH / "avatar.png"]}


def crop_to_ratio(im, ratio, anchor_x=0.5, anchor_y=0.5):
    w, h = im.size
    if w / h > ratio:                      # too wide: trim the sides
        nw = round(h * ratio)
        x = round((w - nw) * anchor_x)
        return im.crop((x, 0, x + nw, h))
    nh = round(w / ratio)                  # too tall: trim top/bottom
    y = round((h - nh) * anchor_y)
    return im.crop((0, y, w, y + nh))


def remove_flat_background(im, tolerance=40):
    """For images that came back without transparency: flood-fill the background from
    every corner and make it transparent."""
    im = im.convert("RGBA")
    marker = (255, 0, 255, 0)
    w, h = im.size
    for corner in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        if im.getpixel(corner)[3] != 0:
            ImageDraw.floodfill(im, corner, marker, thresh=tolerance)
    px = im.load()
    for y in range(h):
        for x in range(w):
            if px[x, y] == marker:
                px[x, y] = (0, 0, 0, 0)
    return im


def cutout(im, max_w=None, square=None):
    im = im.convert("RGBA")
    corners = [im.getpixel(c)[3] for c in [(0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)]]
    note = ""
    if max(corners) > 10:
        im = remove_flat_background(im)
        note = " (background removed)"
    bbox = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    if bbox:
        im = im.crop(bbox)
    if square:
        side = max(im.size)
        canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
        pad = round(square * 0.06)
        im = canvas.resize((square - 2 * pad, square - 2 * pad), Image.LANCZOS)
        framed = Image.new("RGBA", (square, square), (0, 0, 0, 0))
        framed.paste(im, (pad, pad))
        im = framed
    elif max_w and im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    return im, note


def save(im, out):
    out.parent.mkdir(parents=True, exist_ok=True)
    if out.suffix == ".jpg":
        im.convert("RGB").save(out, "JPEG", quality=85, optimize=True, progressive=True)
    else:
        im.save(out, "PNG", optimize=True)


def main():
    done, missing = 0, []
    for name, (out, kind, opt) in JOBS.items():
        src = SRC / f"hm_{name}.png"
        if not src.exists():
            missing.append(name)
            continue
        im = Image.open(src)
        note = ""
        if kind == "crop":
            im = crop_to_ratio(im, opt["ratio"], opt.get("anchor_x", 0.5), opt.get("anchor_y", 0.5))
            if "size" in opt:
                im = im.resize(opt["size"], Image.LANCZOS)
        elif kind == "resize":
            im = im.resize(opt["size"], Image.LANCZOS)
        elif kind == "cutout":
            im, note = cutout(im, opt.get("max_w"), opt.get("square"))
        save(im, out)
        for extra in EXTRA_COPIES.get(name, []):
            save(im, extra)
        done += 1
        print(f"  {name:20s} -> {out.relative_to(ROOT)}  {im.size[0]}x{im.size[1]}  "
              f"{out.stat().st_size // 1024} KB{note}")
    print(f"\n{done} processed" + (f"; not found yet: {', '.join(missing)}" if missing else ""))


if __name__ == "__main__":
    main()
