"""Apply new pixel character sprites to career-cutout composites."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

SRC = Path(r"C:\Users\ZHan-\.cursor\projects\c-Users-ZHan-Desktop-essay\assets")
ROOT = Path(__file__).resolve().parent

FILES = [
    ("9d9c3886-2654-484c-8d86-6b0c676242ed", "engineer_f"),
    ("1e08d47b-1d68-4c3c-9fc0-61dc49070ded", "engineer_m"),
    ("151df737-30cf-48b4-9e53-92c28dd97d41", "programmer_m"),
    ("f98d9900-1c7b-45db-a488-d85441063b76", "programmer_f"),
    ("1846254a-86b6-492f-8d75-aaa733089127", "researcher_m"),
    ("80816239-8c87-4073-92b0-ce6c3e2dabcd", "researcher_f"),
]


def find_src(token: str) -> Path:
    matches = list(SRC.glob(f"*{token}*.png"))
    if not matches:
        raise FileNotFoundError(token)
    return matches[0]


def clean_sprite(im: Image.Image, alpha_cut: int = 40) -> Image.Image:
    """Keep only solid pixels; drop near-black + low-alpha noise."""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < alpha_cut or (r <= 24 and g <= 24 and b <= 24 and a < 220):
                px[x, y] = (0, 0, 0, 0)
    return im


def tight_bbox(im: Image.Image, alpha_cut: int = 40):
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


def place_on_canvas(
    sprite: Image.Image,
    canvas_w: int = 1024,
    canvas_h: int = 1536,
    foot_y: int = 1440,
    max_h: int = 1220,
    max_w: int = 820,
) -> Image.Image:
    bb = tight_bbox(sprite)
    if not bb:
        raise ValueError("empty sprite")
    cropped = sprite.crop(bb)
    cw, ch = cropped.size
    scale = min(max_w / cw, max_h / ch)
    nw, nh = max(1, int(round(cw * scale))), max(1, int(round(ch * scale)))
    resized = cropped.resize((nw, nh), Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    x = (canvas_w - nw) // 2
    y = max(48, foot_y - nh)
    canvas.paste(resized, (x, y), resized)
    return canvas


def make_card(composite: Image.Image, size: tuple[int, int] = (320, 480)) -> Image.Image:
    bb = tight_bbox(composite)
    if not bb:
        raise ValueError("empty composite")
    cropped = composite.crop(bb)
    card = Image.new("RGBA", size, (0, 0, 0, 0))
    cw, ch = cropped.size
    pad = 12
    scale = min((size[0] - pad * 2) / cw, (size[1] - pad * 2) / ch)
    nw, nh = max(1, int(round(cw * scale))), max(1, int(round(ch * scale)))
    resized = cropped.resize((nw, nh), Image.Resampling.NEAREST)
    x = (size[0] - nw) // 2
    y = size[1] - nh - pad
    card.paste(resized, (x, y), resized)
    return card


def main() -> None:
    for token, folder in FILES:
        src = find_src(token)
        print("SRC", folder, src.name)
        sprite = clean_sprite(Image.open(src))
        print("  tight", tight_bbox(sprite))
        composite = place_on_canvas(sprite)
        card = make_card(composite)

        out_dir = ROOT / folder
        canvas_dir = out_dir / "canvas"
        canvas_dir.mkdir(parents=True, exist_ok=True)

        composite.save(canvas_dir / "composite.png")
        composite.save(out_dir / "preview_cutout.png")
        card.save(out_dir / "preview_card.png")
        print("  wrote", folder, "bbox", tight_bbox(composite))

    print("DONE")


if __name__ == "__main__":
    main()
