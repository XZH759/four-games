from PIL import Image
from pathlib import Path
from collections import deque

root = Path(__file__).resolve().parent
kit = Image.open(root / "kit-frames.png").convert("RGBA")
px = kit.load()
w, h = kit.size


def is_content(x, y):
    r, g, b, a = px[x, y]
    return not (r < 18 and g < 18 and b < 18)


mask = Image.new("1", (w, h), 0)
mp = mask.load()
for y in range(h):
    for x in range(w):
        if is_content(x, y):
            mp[x, y] = 1

visited = set()
boxes = []
dirs = [(1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)]
for y in range(h):
    for x in range(w):
        if mp[x, y] == 0 or (x, y) in visited:
            continue
        q = deque([(x, y)])
        visited.add((x, y))
        minx = maxx = x
        miny = maxy = y
        count = 0
        while q:
            cx, cy = q.popleft()
            count += 1
            minx = min(minx, cx)
            maxx = max(maxx, cx)
            miny = min(miny, cy)
            maxy = max(maxy, cy)
            for dx, dy in dirs:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < w and 0 <= ny < h and mp[nx, ny] == 1 and (nx, ny) not in visited:
                    visited.add((nx, ny))
                    q.append((nx, ny))
        if count > 400:
            boxes.append((minx, miny, maxx + 1, maxy + 1, count))

boxes.sort(key=lambda b: -((b[2] - b[0]) * (b[3] - b[1])))
print("boxes", len(boxes))
for i, b in enumerate(boxes):
    print(i, b, "w", b[2] - b[0], "h", b[3] - b[1])

out = root / "slices"
out.mkdir(exist_ok=True)
names = [
    "avatar-stone-lg",
    "banner-wood",
    "banner-stone",
    "slot-cyan",
    "slot-purple",
    "chip-gold",
    "chip-silver",
    "chip-purple",
]
for i, b in enumerate(boxes[: len(names)]):
    crop = kit.crop(b[:4])
    cpx = crop.load()
    cw, ch = crop.size
    for y in range(ch):
        for x in range(cw):
            r, g, bb, a = cpx[x, y]
            if r < 18 and g < 18 and bb < 18:
                cpx[x, y] = (0, 0, 0, 0)
    name = names[i]
    crop.save(out / f"{name}.png")
    print("saved", name, crop.size)
