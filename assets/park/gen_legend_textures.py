"""Generate pixel textures for park legend board."""
from PIL import Image, ImageDraw
from pathlib import Path

out = Path(__file__).resolve().parent
out.mkdir(parents=True, exist_ok=True)


def stone_border(size=48, t=12):
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # outer dark
    d.rectangle([0, 0, size - 1, size - 1], fill=(20, 18, 16, 255))
    # brick mid
    for y in range(1, size - 1, 6):
        for x in range(1, size - 1, 8):
            ox = 4 if ((y // 6) % 2) else 0
            d.rectangle(
                [x + ox, y, min(x + ox + 7, size - 2), min(y + 5, size - 2)],
                fill=(110, 110, 108, 255),
                outline=(70, 70, 68, 255),
            )
    # highlight strip
    d.rectangle([1, 1, size - 2, 2], fill=(160, 160, 158, 255))
    d.rectangle([1, 1, 2, size - 2], fill=(150, 150, 148, 255))
    # shadow
    d.rectangle([1, size - 3, size - 2, size - 2], fill=(55, 55, 53, 255))
    d.rectangle([size - 3, 1, size - 2, size - 2], fill=(55, 55, 53, 255))
    # hollow center for fill
    d.rectangle([t, t, size - t - 1, size - t - 1], fill=(36, 28, 20, 255))
    # corner studs
    for cx, cy in [(4, 4), (size - 5, 4), (4, size - 5), (size - 5, size - 5)]:
        d.rectangle([cx - 1, cy - 1, cx + 2, cy + 2], fill=(200, 170, 80, 255))
        d.point((cx, cy), fill=(80, 60, 20, 255))
    return im


def wood_tile(w=64, h=48):
    im = Image.new("RGBA", (w, h), (42, 30, 20, 255))
    d = ImageDraw.Draw(im)
    for y in range(0, h, 8):
        shade = 38 + (y // 8) % 2 * 8
        d.rectangle([0, y, w - 1, min(y + 7, h - 1)], fill=(shade, shade - 10, shade - 18, 255))
        d.line([0, y, w - 1, y], fill=(28, 18, 12, 255))
        d.line([0, min(y + 7, h - 1), w - 1, min(y + 7, h - 1)], fill=(20, 12, 8, 180))
        # grain
        for x in range(4, w, 11):
            d.point((x, y + 3), fill=(55, 40, 28, 200))
            d.point((x + 3, y + 5), fill=(30, 20, 14, 180))
    return im


def moss_patch():
    im = Image.new("RGBA", (32, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for cx, cy, r, c in [
        (6, 10, 4, (60, 150, 60, 255)),
        (14, 8, 5, (40, 120, 50, 255)),
        (22, 11, 4, (70, 160, 70, 255)),
        (10, 12, 2, (160, 80, 180, 255)),
        (20, 13, 2, (180, 90, 200, 255)),
    ]:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)
    return im


def lantern():
    im = Image.new("RGBA", (16, 28), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([7, 0, 8, 6], fill=(70, 70, 68, 255))
    d.rectangle([4, 6, 11, 8], fill=(90, 90, 88, 255))
    d.rectangle([5, 8, 10, 18], fill=(255, 180, 40, 255))
    d.rectangle([6, 9, 9, 14], fill=(255, 230, 120, 255))
    d.rectangle([5, 18, 10, 22], fill=(90, 60, 30, 255))
    d.rectangle([6, 22, 9, 24], fill=(60, 40, 20, 255))
    return im


def star_flag():
    im = Image.new("RGBA", (20, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.polygon([(0, 0), (19, 0), (19, 24), (10, 31), (0, 24)], fill=(150, 70, 180, 255))
    d.polygon([(0, 0), (19, 0), (19, 4), (0, 4)], fill=(180, 100, 210, 255))
    # star
    d.polygon([(10, 6), (12, 11), (17, 11), (13, 14), (15, 19), (10, 16), (5, 19), (7, 14), (3, 11), (8, 11)], fill=(255, 220, 80, 255))
    return im


stone_border().save(out / "legend-border-stone.png")
wood_tile().save(out / "legend-wood-tile.png")
moss_patch().save(out / "legend-moss.png")
lantern().save(out / "legend-lantern.png")
star_flag().save(out / "legend-star-flag.png")
print("ok", out)
