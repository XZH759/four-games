"""Crop option banners from black backgrounds and export clean PNGs."""
from PIL import Image
from pathlib import Path

root = Path(__file__).resolve().parent
names = {
    "ref-green.png": "option-green.png",
    "ref-gold.png": "option-gold.png",
    "ref-red.png": "option-red.png",
    "ref-blue.png": "option-blue.png",
}

for src_name, out_name in names.items():
    im = Image.open(root / src_name).convert("RGBA")
    px = im.load()
    w, h = im.size
    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r > 12 or g > 12 or b > 12:
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    # pad a little
    pad = 2
    box = (
        max(0, minx - pad),
        max(0, miny - pad),
        min(w, maxx + 1 + pad),
        min(h, maxy + 1 + pad),
    )
    crop = im.crop(box)
    cpx = crop.load()
    cw, ch = crop.size
    for y in range(ch):
        for x in range(cw):
            r, g, b, a = cpx[x, y]
            if r < 10 and g < 10 and b < 10:
                cpx[x, y] = (0, 0, 0, 0)
    crop.save(root / out_name)
    print(out_name, crop.size)
