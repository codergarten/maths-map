#!/usr/bin/env python3
"""Rasterise the Maths Map map-pin icon to the PNG sizes the PWA manifest needs."""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public'

BG = '#0e7490'          # deep teal, matches brand
RING = '#155e75'        # darker teal outline
PIN = '#f7f5ef'         # warm cream pin
DOT = '#ea580c'         # coral dot (the "you are here")

def rounded_rect(draw, box, radius, fill):
    draw.rounded_rectangle(box, radius=radius, fill=fill)

def draw_icon(size: int, maskable: bool = False) -> Image.Image:
    s = size
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pad = 0 if maskable else int(s * 0.08)
    if maskable:
        d.rectangle((0, 0, s, s), fill=BG)
    else:
        rounded_rect(d, (pad // 2, pad // 2, s - pad // 2, s - pad // 2), int(s * 0.22), BG)

    cx = s / 2
    # pin geometry: circle head + triangle tip
    head_r = s * 0.21           # radius of the round head
    head_cy = s * 0.40          # head centre y
    tip_y = s * 0.78            # bottom tip y

    # outer (dark) pin, slightly larger
    def pin(head_r_, head_cy_, tip_y_, fill):
        d.ellipse((cx - head_r_, head_cy_ - head_r_, cx + head_r_, head_cy_ + head_r_), fill=fill)
        # tangent triangle from the head to the tip
        half = head_r_ * 0.72
        d.polygon([(cx - half, head_cy_ + head_r_ * 0.55), (cx + half, head_cy_ + head_r_ * 0.55), (cx, tip_y_)], fill=fill)

    pin(head_r + s * 0.03, head_cy, tip_y + s * 0.03, RING)
    pin(head_r, head_cy, tip_y, PIN)

    # inner dot
    dot_r = s * 0.105
    d.ellipse((cx - dot_r, head_cy - dot_r, cx + dot_r, head_cy + dot_r), fill=DOT)

    return img

def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    specs = [
        ('icon-192.png', 192, False),
        ('icon-512.png', 512, False),
        ('icon-maskable-512.png', 512, True),
        ('apple-touch-icon.png', 180, False),
    ]
    for name, size, maskable in specs:
        img = draw_icon(size, maskable)
        img.save(OUT / name)
        print('wrote', OUT / name)

if __name__ == '__main__':
    main()
