"""Generate clean pixel accessory overlays for login doll layering."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent
OUT.mkdir(parents=True, exist_ok=True)

# common palette
C = {
    "ink": (20, 24, 32, 255),
    "metal": (160, 170, 185, 255),
    "metal2": (110, 120, 135, 255),
    "cyan": (70, 220, 255, 255),
    "cyan2": (40, 160, 230, 255),
    "white": (240, 248, 255, 255),
    "brown": (140, 90, 50, 255),
    "gold": (210, 170, 70, 255),
    "green": (70, 120, 70, 255),
    "orange": (230, 130, 50, 255),
}


def canvas(w=96, h=96):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def px(draw: ImageDraw.ImageDraw, pts, color):
    for x, y in pts:
        draw.point((x, y), fill=color)


def fill_rect(draw, box, color):
    draw.rectangle(box, fill=color)


def draw_goggles(im, style="eng"):
    d = ImageDraw.Draw(im)
    # strap
    fill_rect(d, (8, 28, 88, 36), C["ink"])
    fill_rect(d, (10, 30, 86, 34), C["brown"] if style == "eng" else C["metal2"])
    # lenses
    if style == "cyber":
        fill_rect(d, (18, 22, 46, 42), C["ink"])
        fill_rect(d, (50, 22, 78, 42), C["ink"])
        fill_rect(d, (22, 26, 42, 38), C["cyan"])
        fill_rect(d, (54, 26, 74, 38), C["cyan2"])
        d.text((26, 27), "C", fill=C["white"])
    else:
        # round-ish
        for box in ((20, 20, 44, 44), (52, 20, 76, 44)):
            fill_rect(d, box, C["ink"])
            fill_rect(d, (box[0] + 4, box[1] + 4, box[2] - 4, box[3] - 4), C["cyan"])
            fill_rect(d, (box[0] + 8, box[1] + 8, box[0] + 14, box[1] + 14), C["white"])


def draw_headset(im):
    d = ImageDraw.Draw(im)
    # band
    fill_rect(d, (18, 18, 78, 28), C["ink"])
    fill_rect(d, (20, 20, 76, 26), C["metal2"])
    # cups
    for box in ((12, 24, 34, 56), (62, 24, 84, 56)):
        fill_rect(d, box, C["ink"])
        fill_rect(d, (box[0] + 4, box[1] + 6, box[2] - 4, box[3] - 6), C["cyan"])
        fill_rect(d, (box[0] + 8, box[1] + 16, box[2] - 8, box[3] - 16), C["white"])


def draw_v_chain(d, top_y=6, join_y=34, half_w=28):
    """V-shaped necklace chain ending at center join (matches schematic)."""
    cx = 48
    # left strand
    for i in range(10):
        t = i / 9
        x = int(cx - half_w + half_w * t)
        y = int(top_y + (join_y - top_y) * t)
        fill_rect(d, (x - 1, y, x + 2, y + 3), C["metal"])
        fill_rect(d, (x, y + 1, x + 1, y + 2), C["metal2"])
    # right strand
    for i in range(10):
        t = i / 9
        x = int(cx + half_w - half_w * t)
        y = int(top_y + (join_y - top_y) * t)
        fill_rect(d, (x - 1, y, x + 2, y + 3), C["metal"])
        fill_rect(d, (x, y + 1, x + 1, y + 2), C["metal2"])
    # join ring
    fill_rect(d, (cx - 3, join_y - 1, cx + 3, join_y + 5), C["metal"])
    fill_rect(d, (cx - 1, join_y + 1, cx + 1, join_y + 3), C["cyan"])


def draw_pendant_cube(im):
    """代码立方吊坠：V链 + 居中立方（与佩戴效果胸口位置一致）。"""
    d = ImageDraw.Draw(im)
    draw_v_chain(d, top_y=8, join_y=30, half_w=26)
    # cube pendant centered under join
    fill_rect(d, (36, 36, 60, 60), C["ink"])
    fill_rect(d, (38, 38, 58, 58), C["cyan2"])
    fill_rect(d, (40, 40, 56, 56), C["cyan"])
    # </> hint
    fill_rect(d, (44, 44, 46, 52), C["white"])
    fill_rect(d, (50, 44, 52, 52), C["white"])
    fill_rect(d, (46, 47, 50, 49), C["white"])
    # glow
    fill_rect(d, (42, 62, 54, 64), (70, 220, 255, 120))


def draw_chip(im):
    """代码芯片吊坠：V链 + 方形芯片居中胸口。"""
    d = ImageDraw.Draw(im)
    draw_v_chain(d, top_y=6, join_y=28, half_w=28)
    fill_rect(d, (34, 34, 62, 62), C["ink"])
    fill_rect(d, (36, 36, 60, 60), C["metal2"])
    fill_rect(d, (40, 40, 56, 56), C["cyan"])
    fill_rect(d, (44, 44, 52, 52), C["white"])
    # pins
    for i in range(4):
        fill_rect(d, (32, 40 + i * 4, 34, 42 + i * 4), C["metal"])
        fill_rect(d, (62, 40 + i * 4, 64, 42 + i * 4), C["metal"])
    fill_rect(d, (44, 64, 52, 68), C["cyan2"])


def draw_wrench(im):
    """能量扳手项链：V链 + 竖向扳手吊坠（蓝能量芯）。"""
    d = ImageDraw.Draw(im)
    draw_v_chain(d, top_y=6, join_y=26, half_w=26)
    # vertical wrench
    fill_rect(d, (42, 30, 54, 72), C["metal"])
    fill_rect(d, (44, 32, 52, 70), C["metal2"])
    fill_rect(d, (45, 40, 51, 54), C["cyan"])  # energy core
    # jaws at bottom
    fill_rect(d, (36, 64, 60, 72), C["metal"])
    fill_rect(d, (38, 66, 44, 74), C["metal2"])
    fill_rect(d, (52, 66, 58, 74), C["metal2"])
    fill_rect(d, (44, 62, 52, 66), C["ink"])


def draw_badge(im):
    """实验室/数据识别证：蓝挂绳 V 形 + 居中竖向证章。"""
    d = ImageDraw.Draw(im)
    # blue lanyard V
    cx = 48
    for i in range(11):
        t = i / 10
        y = int(6 + 26 * t)
        xl = int(cx - 30 + 30 * t)
        xr = int(cx + 30 - 30 * t)
        fill_rect(d, (xl - 1, y, xl + 2, y + 3), C["cyan2"])
        fill_rect(d, (xr - 1, y, xr + 2, y + 3), C["cyan2"])
    # vertical rectangular badge (schematic)
    fill_rect(d, (36, 34, 60, 72), C["ink"])
    fill_rect(d, (38, 36, 58, 70), C["white"])
    fill_rect(d, (40, 38, 56, 46), C["cyan"])  # top bar
    fill_rect(d, (44, 50, 52, 62), C["cyan2"])  # silhouette block
    fill_rect(d, (46, 52, 50, 58), C["white"])


def draw_gear(im):
    d = ImageDraw.Draw(im)
    fill_rect(d, (28, 28, 68, 68), C["metal"])
    fill_rect(d, (36, 36, 60, 60), C["metal2"])
    fill_rect(d, (44, 44, 52, 52), C["ink"])
    for box in ((44, 18, 52, 30), (44, 66, 52, 78), (18, 44, 30, 52), (66, 44, 78, 52)):
        fill_rect(d, box, C["metal"])
    fill_rect(d, (58, 58, 78, 86), C["green"])
    fill_rect(d, (64, 64, 72, 80), C["gold"])


def draw_wrist_kb(im):
    d = ImageDraw.Draw(im)
    fill_rect(d, (20, 50, 76, 72), C["ink"])
    fill_rect(d, (24, 54, 72, 68), C["metal2"])
    fill_rect(d, (28, 58, 40, 64), C["cyan"])
    fill_rect(d, (18, 18, 78, 46), (40, 160, 230, 160))
    for r in range(3):
        for c in range(6):
            fill_rect(d, (24 + c * 8, 24 + r * 7, 28 + c * 8, 28 + r * 7), C["cyan"])


def draw_terminal(im):
    d = ImageDraw.Draw(im)
    fill_rect(d, (18, 40, 78, 78), C["ink"])
    fill_rect(d, (22, 44, 74, 58), C["cyan"])
    fill_rect(d, (26, 62, 70, 74), C["metal2"])
    fill_rect(d, (34, 48, 42, 54), C["white"])
    fill_rect(d, (10, 68, 22, 76), C["brown"])
    fill_rect(d, (74, 68, 86, 76), C["brown"])


def draw_helmet_pin(im):
    d = ImageDraw.Draw(im)
    fill_rect(d, (28, 30, 68, 58), C["white"])
    fill_rect(d, (24, 48, 72, 62), C["metal"])
    fill_rect(d, (44, 34, 52, 42), C["orange"])
    fill_rect(d, (40, 58, 56, 66), C["ink"])


def draw_toolbag(im):
    d = ImageDraw.Draw(im)
    fill_rect(d, (28, 34, 68, 72), C["brown"])
    fill_rect(d, (32, 38, 64, 68), (110, 70, 40, 255))
    fill_rect(d, (44, 28, 52, 38), C["metal"])
    fill_rect(d, (36, 42, 44, 58), C["metal2"])
    fill_rect(d, (52, 44, 60, 62), C["cyan"])


def draw_sensor(im):
    d = ImageDraw.Draw(im)
    fill_rect(d, (18, 40, 78, 68), C["ink"])
    fill_rect(d, (22, 44, 74, 64), C["orange"])
    fill_rect(d, (30, 48, 66, 60), C["cyan"])
    fill_rect(d, (38, 52, 58, 56), C["white"])


def draw_notes(im):
    d = ImageDraw.Draw(im)
    fill_rect(d, (24, 20, 72, 76), C["ink"])
    fill_rect(d, (28, 24, 68, 72), C["cyan2"])
    fill_rect(d, (34, 30, 62, 36), C["white"])
    fill_rect(d, (34, 42, 58, 46), C["white"])
    fill_rect(d, (34, 52, 54, 56), C["cyan"])


def draw_monocle(im):
    d = ImageDraw.Draw(im)
    fill_rect(d, (20, 28, 76, 40), C["ink"])
    fill_rect(d, (28, 22, 68, 52), C["ink"])
    fill_rect(d, (34, 28, 62, 46), C["cyan"])
    fill_rect(d, (70, 34, 84, 58), C["metal2"])


def draw_tubes(im):
    d = ImageDraw.Draw(im)
    fill_rect(d, (16, 48, 80, 74), C["ink"])
    fill_rect(d, (22, 52, 74, 70), C["metal2"])
    fill_rect(d, (36, 56, 60, 66), C["cyan"])
    for i, col in enumerate([C["cyan"], C["cyan2"], (90, 220, 140, 255)]):
        x = 26 + i * 18
        fill_rect(d, (x, 22, x + 10, 52), C["metal"])
        fill_rect(d, (x + 2, 26, x + 8, 48), col)


MAKERS = {
    "em_goggles": lambda: _make(draw_goggles, "eng"),
    "em_epaulet": lambda: _make(draw_gear),
    "em_wrench": lambda: _make(draw_wrench),
    "pm_goggles": lambda: _make(draw_goggles, "cyber"),
    "pm_chip": lambda: _make(draw_chip),
    "pm_terminal": lambda: _make(draw_terminal),
    "pf_headset": lambda: _make(draw_headset),
    "pf_wrist_kb": lambda: _make(draw_wrist_kb),
    "pf_cube": lambda: _make(draw_pendant_cube),
    "ef_helmet_pin": lambda: _make(draw_helmet_pin),
    "ef_toolbag": lambda: _make(draw_toolbag),
    "ef_sensor": lambda: _make(draw_sensor),
    "rf_goggles": lambda: _make(draw_goggles, "eng"),
    "rf_badge": lambda: _make(draw_badge),
    "rf_notes": lambda: _make(draw_notes),
    "rm_monocle": lambda: _make(draw_monocle),
    "rm_badge": lambda: _make(draw_badge),
    "rm_tubes": lambda: _make(draw_tubes),
}


def _make(fn, *args):
    im = canvas()
    fn(im, *args) if args else fn(im)
    return im


def main():
    for aid, maker in MAKERS.items():
        im = maker()
        im = im.resize((im.width * 2, im.height * 2), Image.Resampling.NEAREST)
        path = OUT / f"{aid}.png"
        im.save(path)
        print("OK", aid, im.size)
    print("DONE", len(MAKERS))


if __name__ == "__main__":
    main()
