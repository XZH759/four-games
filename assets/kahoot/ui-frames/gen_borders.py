"""Generate 9-slice Terraria-style border textures for CSS border-image."""
from PIL import Image, ImageDraw
from pathlib import Path

out = Path(__file__).resolve().parent / "slices"
out.mkdir(exist_ok=True)

GOLD = {
    "outer": (26, 16, 8, 255),
    "hi": (255, 236, 150, 255),
    "mid": (224, 176, 48, 255),
    "lo": (144, 96, 24, 255),
    "fill": (42, 28, 18, 255),
}
STONE = {
    "outer": (14, 12, 10, 255),
    "hi": (170, 170, 168, 255),
    "mid": (110, 110, 108, 255),
    "lo": (70, 70, 68, 255),
    "fill": (36, 32, 28, 255),
}
WOOD = {
    "outer": (18, 12, 8, 255),
    "hi": (180, 120, 64, 255),
    "mid": (110, 70, 36, 255),
    "lo": (70, 42, 20, 255),
    "fill": (48, 32, 20, 255),
}


def draw_frame(size, palette, thickness=10, rivet=True):
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # outer dark
    d.rectangle([0, 0, size - 1, size - 1], fill=palette["outer"])
    # mid metal/stone ring
    t = thickness
    d.rectangle([1, 1, size - 2, size - 2], fill=palette["mid"])
    # highlight top/left
    d.rectangle([2, 2, size - 3, 3], fill=palette["hi"])
    d.rectangle([2, 2, 3, size - 3], fill=palette["hi"])
    # shadow bottom/right
    d.rectangle([2, size - 4, size - 3, size - 3], fill=palette["lo"])
    d.rectangle([size - 4, 2, size - 3, size - 3], fill=palette["lo"])
    # inner fill (will be covered by content via border-image center)
    inset = t
    d.rectangle([inset, inset, size - inset - 1, size - inset - 1], fill=palette["fill"])
    # thin inner gold line for gold palette
    d.rectangle(
        [inset - 2, inset - 2, size - inset + 1, size - inset + 1],
        outline=palette["hi"] if palette is GOLD else palette["mid"],
    )
    if rivet:
        for cx, cy in [
            (t // 2 + 1, t // 2 + 1),
            (size - t // 2 - 2, t // 2 + 1),
            (t // 2 + 1, size - t // 2 - 2),
            (size - t // 2 - 2, size - t // 2 - 2),
        ]:
            d.ellipse([cx - 2, cy - 2, cx + 2, cy + 2], fill=palette["hi"])
            d.ellipse([cx - 1, cy - 1, cx + 1, cy + 1], fill=palette["lo"])
    return im


def draw_banner(w, h, palette, thickness=8):
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, w - 1, h - 1], fill=palette["outer"])
    d.rectangle([1, 1, w - 2, h - 2], fill=palette["mid"])
    d.rectangle([2, 2, w - 3, 3], fill=palette["hi"])
    d.rectangle([2, 2, 3, h - 3], fill=palette["hi"])
    d.rectangle([2, h - 4, w - 3, h - 3], fill=palette["lo"])
    d.rectangle([w - 4, 2, w - 3, h - 3], fill=palette["lo"])
    inset = thickness
    d.rectangle([inset, inset, w - inset - 1, h - inset - 1], fill=palette["fill"])
    # wood grain lines
    if palette is WOOD:
        for y in range(inset + 2, h - inset - 2, 4):
            d.line([inset + 2, y, w - inset - 3, y], fill=(60, 40, 24, 120))
    if palette is STONE:
        for y in range(inset + 2, h - inset - 2, 6):
            d.line([inset + 2, y, w - inset - 3, y], fill=(80, 80, 78, 90))
            for x in range(inset + 8, w - inset - 2, 18):
                d.line([x, y, x, min(y + 5, h - inset - 3)], fill=(80, 80, 78, 80))
    return im


# 9-slice friendly squares (center will stretch)
draw_frame(48, GOLD, 12).save(out / "border-gold.png")
draw_frame(48, STONE, 12).save(out / "border-stone.png")
draw_frame(48, WOOD, 12).save(out / "border-wood.png")
draw_banner(96, 40, WOOD, 8).save(out / "border-banner-wood.png")
draw_banner(96, 40, STONE, 8).save(out / "border-banner-stone.png")
draw_banner(96, 40, GOLD, 8).save(out / "border-banner-gold.png")

# gem accents
for name, color in [
    ("gem-red", (255, 70, 70)),
    ("gem-green", (80, 230, 100)),
    ("gem-cyan", (80, 220, 255)),
    ("gem-purple", (190, 90, 255)),
    ("gem-gold", (255, 210, 70)),
]:
    g = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(g)
    d.ellipse([2, 2, 13, 13], fill=(*color, 255))
    d.ellipse([4, 4, 8, 8], fill=(255, 255, 255, 200))
    g.save(out / f"{name}.png")

print("generated borders + gems in", out)
