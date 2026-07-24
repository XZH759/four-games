"""Manual calibrated crops from ui-kit-a / ui-kit-b."""
from pathlib import Path
from PIL import Image

ROOT = Path(r"c:\Users\ZHan-\Desktop\essay\nuannuan\map\assets")
OUT = ROOT / "kit"
OUT.mkdir(parents=True, exist_ok=True)

a = Image.open(ROOT / "ui-kit-a.png").convert("RGBA")
b = Image.open(ROOT / "ui-kit-b.png").convert("RGBA")


def save(img: Image.Image, box, name: str, pad: int = 1):
    x0, y0, x1, y1 = box
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(img.width, x1 + pad)
    y1 = min(img.height, y1 + pad)
    crop = img.crop((x0, y0, x1, y1))
    crop.save(OUT / name)
    print(f"{name:28s} {crop.size} <- {box}")


# --- kit-a: panels, nav, nodes, chests, compass, avatar, buttons, decor ---
save(a, (555, 55, 655, 305), "panel-left.png")
save(a, (665, 55, 770, 305), "panel-right.png")

save(a, (788, 52, 832, 98), "icon-star.png")
save(a, (838, 55, 872, 98), "icon-gem.png")
save(a, (862, 52, 898, 98), "icon-book.png")
save(a, (888, 52, 924, 98), "icon-wardrobe.png")
save(a, (914, 52, 950, 98), "icon-partner.png")
save(a, (940, 52, 976, 98), "icon-hall.png")
save(a, (966, 52, 1002, 98), "icon-settings.png")

# region pills (1-5) — two columns in kit-a
save(a, (780, 125, 875, 158), "region-pill-1.png")
save(a, (880, 125, 980, 158), "region-pill-2.png")
save(a, (780, 185, 875, 218), "region-pill-3.png")
save(a, (880, 185, 980, 218), "region-pill-4.png")
save(a, (780, 230, 875, 263), "region-pill-5.png")

# level nodes (small but clean)
save(a, (808, 312, 858, 350), "node-done.png")
save(a, (858, 312, 908, 350), "node-current.png")
save(a, (908, 312, 958, 350), "node-open.png")
save(a, (958, 312, 1008, 350), "node-locked.png")

# larger glowing legend orbs as selected/halo variants
save(a, (295, 465, 345, 520), "node-done-lg.png")
save(a, (345, 465, 395, 520), "node-current-lg.png")
save(a, (395, 465, 445, 520), "node-open-lg.png")
save(a, (445, 465, 495, 520), "node-locked-lg.png")

save(a, (25, 450, 145, 540), "chest-locked.png")
save(a, (175, 450, 315, 540), "chest-claimable.png")
save(a, (350, 450, 490, 540), "chest-open.png")

save(a, (560, 400, 745, 560), "compass.png")
save(a, (8, 565, 145, 680), "avatar-frame.png")

save(a, (530, 562, 640, 608), "btn-enter.png")
save(a, (642, 562, 760, 608), "btn-continue.png")
save(a, (532, 612, 582, 662), "btn-minus.png")
save(a, (592, 612, 642, 662), "btn-locate.png")
save(a, (652, 612, 702, 662), "btn-plus.png")

save(a, (785, 555, 845, 620), "decor-sparkle-1.png")
save(a, (770, 610, 820, 660), "decor-sparkle-2.png")
save(a, (825, 555, 880, 675), "decor-beam.png")

# --- kit-b: larger nodes, banners, buttons, decor birds ---
save(b, (620, 68, 670, 118), "b-node-done.png")
save(b, (670, 68, 720, 118), "b-node-current.png")
save(b, (720, 68, 770, 118), "b-node-open.png")
save(b, (770, 68, 820, 118), "b-node-locked.png")
save(b, (615, 100, 675, 160), "b-node-done-lg.png")
save(b, (665, 100, 725, 160), "b-node-current-lg.png")
save(b, (715, 100, 775, 160), "b-node-open-lg.png")
save(b, (765, 100, 825, 160), "b-node-locked-lg.png")

save(b, (625, 235, 700, 295), "b-chest-open.png")
save(b, (710, 235, 785, 295), "b-chest-locked.png")

# region banners column
save(b, (435, 38, 600, 88), "region-banner-1.png")
save(b, (435, 88, 600, 138), "region-banner-2.png")
save(b, (435, 138, 600, 188), "region-banner-3.png")
save(b, (435, 188, 600, 238), "region-banner-4.png")
save(b, (435, 238, 600, 288), "region-banner-5.png")

save(b, (812, 42, 852, 82), "b-icon-book.png")
save(b, (860, 42, 900, 82), "b-icon-wardrobe.png")
save(b, (908, 42, 948, 82), "b-icon-partner.png")
save(b, (956, 42, 996, 82), "b-icon-hall.png")
save(b, (1000, 42, 1024, 82), "b-icon-settings.png")
save(b, (820, 118, 875, 172), "b-icon-star.png")
save(b, (880, 118, 935, 172), "b-icon-gem.png")

save(b, (30, 360, 120, 470), "b-avatar.png")
save(b, (158, 412, 215, 470), "b-compass.png")
save(b, (132, 358, 168, 395), "decor-bird-1.png")
save(b, (168, 358, 204, 395), "decor-bird-2.png")
save(b, (204, 358, 240, 395), "decor-bird-3.png")
save(b, (135, 390, 165, 420), "decor-star-1.png")
save(b, (165, 390, 195, 420), "decor-star-2.png")
save(b, (195, 390, 225, 420), "decor-star-3.png")

save(b, (15, 500, 195, 548), "b-btn-continue.png")
save(b, (255, 500, 420, 548), "b-btn-enter.png")
save(b, (445, 500, 560, 548), "b-btn-close.png")
save(b, (585, 500, 745, 548), "b-btn-claim.png")
save(b, (760, 500, 920, 548), "b-btn-unlock.png")
save(b, (20, 550, 70, 595), "b-btn-minus.png")
save(b, (80, 550, 130, 595), "b-btn-plus.png")
save(b, (185, 550, 295, 595), "b-btn-locate.png")

save(b, (520, 345, 790, 515), "popup-panel.png")
save(b, (810, 200, 920, 340), "panel-card-1.png")
save(b, (935, 200, 1020, 340), "panel-card-2.png")

# Prefer larger kit-b nodes as canonical
for src, dst in [
    ("b-node-done.png", "node-done.png"),
    ("b-node-current.png", "node-current.png"),
    ("b-node-open.png", "node-open.png"),
    ("b-node-locked.png", "node-locked.png"),
    ("b-node-done-lg.png", "node-done-lg.png"),
    ("b-node-current-lg.png", "node-current-lg.png"),
    ("b-node-open-lg.png", "node-open-lg.png"),
    ("b-node-locked-lg.png", "node-locked-lg.png"),
    ("b-chest-open.png", "chest-open.png"),
    ("b-chest-locked.png", "chest-locked.png"),
    ("b-btn-enter.png", "btn-enter.png"),
    ("b-btn-continue.png", "btn-continue.png"),
    ("b-btn-close.png", "btn-close.png"),
    ("b-btn-minus.png", "btn-minus.png"),
    ("b-btn-plus.png", "btn-plus.png"),
    ("b-btn-locate.png", "btn-locate.png"),
    ("b-icon-book.png", "icon-book.png"),
    ("b-icon-wardrobe.png", "icon-wardrobe.png"),
    ("b-icon-partner.png", "icon-partner.png"),
    ("b-icon-hall.png", "icon-hall.png"),
    ("b-icon-settings.png", "icon-settings.png"),
    ("b-icon-star.png", "icon-star.png"),
    ("b-icon-gem.png", "icon-gem.png"),
]:
    Image.open(OUT / src).save(OUT / dst)
    print("canon", dst)

# claimable chest: use kit-a ornate closed if present
print("files", len(list(OUT.glob("*.png"))))
