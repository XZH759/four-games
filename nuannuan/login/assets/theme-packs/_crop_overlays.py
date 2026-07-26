"""Auto-detect and crop accessory art from theme-pack concept sheets."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
OVERLAY_DIR = ROOT / "overlays"
OVERLAY_DIR.mkdir(parents=True, exist_ok=True)

# sheet -> ordered accessory ids (top to bottom on right column)
SHEETS = {
    "engineer_m.png": ["em_goggles", "em_epaulet", "em_wrench"],
    "programmer_m.png": ["pm_goggles", "pm_chip", "pm_terminal"],
    "programmer_f.png": ["pf_headset", "pf_wrist_kb", "pf_cube"],
    "engineer_f.png": ["ef_helmet_pin", "ef_toolbag", "ef_sensor"],
    "researcher_f.png": ["rf_goggles", "rf_badge", "rf_notes"],
    "researcher_m.png": ["rm_monocle", "rm_badge", "rm_tubes"],
}


def is_content(r, g, b) -> bool:
    """True if pixel looks like accessory art (not dark UI / text-ish)."""
    if r < 28 and g < 32 and b < 40:
        return False
    # skip very dim blue-gray panels
    mx, mn = max(r, g, b), min(r, g, b)
    if mx < 55:
        return False
    # keep colorful / mid-bright pixels (sprites have cyan, brown, white, etc.)
    if mx - mn >= 25:
        return True
    if mx >= 90:
        return True
    return False


def content_mask(im: Image.Image, x0: int, x1: int, y0: int, y1: int):
    px = im.load()
    mask = []
    for y in range(y0, y1):
        row = []
        for x in range(x0, x1):
            r, g, b = px[x, y][:3]
            row.append(is_content(r, g, b))
        mask.append(row)
    return mask


def largest_bbox(mask, x0, y0, min_area=400):
    """Find connected components; return largest bbox in sheet coords."""
    h = len(mask)
    w = len(mask[0]) if h else 0
    seen = [[False] * w for _ in range(h)]
    best = None
    best_area = 0

    for sy in range(h):
        for sx in range(w):
            if not mask[sy][sx] or seen[sy][sx]:
                continue
            stack = [(sx, sy)]
            seen[sy][sx] = True
            minx = maxx = sx
            miny = maxy = sy
            area = 0
            while stack:
                x, y = stack.pop()
                area += 1
                minx = min(minx, x)
                maxx = max(maxx, x)
                miny = min(miny, y)
                maxy = max(maxy, y)
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and mask[ny][nx] and not seen[ny][nx]:
                        seen[ny][nx] = True
                        stack.append((nx, ny))
            bw, bh = maxx - minx + 1, maxy - miny + 1
            # prefer blob that is roughly icon-sized, not a thin text strip
            if area < min_area or bh < 28 or bw < 28:
                continue
            if bh < 20 and bw > 80:  # text line
                continue
            score = area
            # prefer squarish-ish accessory art
            ratio = bw / max(bh, 1)
            if 0.45 <= ratio <= 2.4:
                score *= 1.4
            if score > best_area:
                best_area = score
                best = (x0 + minx, y0 + miny, x0 + maxx + 1, y0 + maxy + 1)
    return best


def knock_dark(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if not is_content(r, g, b) and max(r, g, b) < 70:
                px[x, y] = (0, 0, 0, 0)
            elif r > 240 and g > 240 and b > 240:
                px[x, y] = (0, 0, 0, 0)
    return im


def tight(im: Image.Image, cut=20):
    px = im.load()
    w, h = im.size
    minx, miny, maxx, maxy = w, h, -1, -1
    for y in range(h):
        for x in range(w):
            if px[x, y][3] >= cut:
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    if maxx < 0:
        return None
    return (minx, miny, maxx + 1, maxy + 1)


def main() -> None:
    for sheet_name, ids in SHEETS.items():
        path = ROOT / sheet_name
        im = Image.open(path).convert("RGBA")
        w, h = im.size
        # right column where accessory cards live
        rx0, rx1 = int(w * 0.42), w - 12
        # vertical bands for 3 cards (skip header)
        top = int(h * 0.10)
        bottom = int(h * 0.88)
        band_h = (bottom - top) // 3

        print("SHEET", sheet_name)
        for i, acc_id in enumerate(ids):
            y0 = top + i * band_h
            y1 = top + (i + 1) * band_h
            # Prefer upper-middle of each card (illustration), skip title strip
            y0b = y0 + int(band_h * 0.18)
            y1b = y0 + int(band_h * 0.78)
            mask = content_mask(im, rx0, rx1, y0b, y1b)
            box = largest_bbox(mask, rx0, y0b, min_area=350)
            if not box:
                # fallback fixed center of band
                cx0 = rx0 + 40
                cx1 = rx1 - 20
                cy0 = y0b + 10
                cy1 = y1b - 10
                box = (cx0, cy0, cx1, cy1)
                print("  FALLBACK", acc_id, box)
            else:
                print("  DET", acc_id, box)

            crop = im.crop(box)
            crop = knock_dark(crop)
            bb = tight(crop)
            if bb:
                crop = crop.crop(bb)
            # normalize size for overlay use
            max_side = 160
            scale = min(max_side / max(crop.width, 1), max_side / max(crop.height, 1), 1.0)
            if scale < 1:
                nw = max(1, int(crop.width * scale))
                nh = max(1, int(crop.height * scale))
                crop = crop.resize((nw, nh), Image.Resampling.NEAREST)
            pad = 6
            canvas = Image.new("RGBA", (crop.width + pad * 2, crop.height + pad * 2), (0, 0, 0, 0))
            canvas.paste(crop, (pad, pad), crop)
            out = OVERLAY_DIR / f"{acc_id}.png"
            canvas.save(out)
            print("  wrote", out.name, canvas.size)


if __name__ == "__main__":
    main()
