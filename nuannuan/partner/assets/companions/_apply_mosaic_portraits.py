"""Apply mosaic companion portraits for /nuannuan/partner."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

SRC = Path(r"C:\Users\ZHan-\.cursor\projects\c-Users-ZHan-Desktop-essay\assets")
OUT = Path(__file__).resolve().parent

# thematic map: source token -> companion id
FILES = [
    ("1d01f464", "bella"),   # purple star guardian
    ("ae11a49c", "ava"),     # lavender ice
    ("0cd1a7f1", "eileen"),  # crystal ice wings
    ("252101ed", "gladys"),  # tech AI purple
    ("a379db88", "diana"),   # fox + book scholar
    ("6f9d5e56", "fiona"),   # pink bunny warmth
]

TARGET_W, TARGET_H = 682, 1024
WHITE_THRESH = 245


def find_src(token: str) -> Path:
    matches = list(SRC.glob(f"*{token}*.png"))
    if not matches:
        raise FileNotFoundError(token)
    return matches[0]


def knock_white(im: Image.Image) -> Image.Image:
    """Convert near-white background to transparent."""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r >= WHITE_THRESH and g >= WHITE_THRESH and b >= WHITE_THRESH:
                px[x, y] = (0, 0, 0, 0)
            elif abs(r - g) < 8 and abs(g - b) < 8 and r >= 230:
                # soft white fringe
                fade = max(0, min(255, int((255 - r) * 8)))
                px[x, y] = (r, g, b, fade)
    return im


def tight_bbox(im: Image.Image, alpha_cut: int = 16):
    px = im.load()
    w, h = im.size
    minx, miny, maxx, maxy = w, h, -1, -1
    for y in range(h):
        for x in range(w):
            if px[x, y][3] >= alpha_cut:
                if x < minx:
                    minx = x
                if y < miny:
                    miny = y
                if x > maxx:
                    maxx = x
                if y > maxy:
                    maxy = y
    if maxx < 0:
        return None
    return (minx, miny, maxx + 1, maxy + 1)


def fit_portrait(sprite: Image.Image) -> Image.Image:
    bb = tight_bbox(sprite)
    if not bb:
        raise ValueError("empty sprite")
    cropped = sprite.crop(bb)
    cw, ch = cropped.size
    pad = 18
    scale = min((TARGET_W - pad * 2) / cw, (TARGET_H - pad * 2) / ch)
    nw = max(1, int(round(cw * scale)))
    nh = max(1, int(round(ch * scale)))
    # Keep mosaic look: nearest when upscaling small, but sources are already large —
    # use NEAREST to preserve pixel edges.
    resized = cropped.resize((nw, nh), Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", (TARGET_W, TARGET_H), (0, 0, 0, 0))
    x = (TARGET_W - nw) // 2
    y = TARGET_H - nh - pad
    canvas.paste(resized, (x, y), resized)
    return canvas


def main() -> None:
    for token, companion_id in FILES:
        src = find_src(token)
        print("SRC", companion_id, "←", src.name[-60:])
        sprite = knock_white(Image.open(src))
        print("  tight", tight_bbox(sprite))
        portrait = fit_portrait(sprite)
        out = OUT / f"{companion_id}.png"
        # backup once
        bak = OUT / f"{companion_id}.png.bak"
        if out.exists() and not bak.exists():
            out.replace(bak)
            print("  backed up", bak.name)
        portrait.save(out)
        print("  wrote", out.name, portrait.size, "bbox", tight_bbox(portrait))
    print("DONE")


if __name__ == "__main__":
    main()
