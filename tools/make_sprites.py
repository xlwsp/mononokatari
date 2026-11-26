"""images/ の元絵から、ゲーム用の小さい画像を images/sprites/ に作る。
元絵を差し替えたら:  python3 tools/make_sprites.py"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / "images", ROOT / "images" / "sprites"
SPRITES = {
    # 味方（進化前）
    "suzune": "suzune02.png", "kodama": "kodama02.png", "hakua": "hakua02.png",
    "maimai": "maimai02.png", "rangyo": "rangyo02.png", "gekomaru": "gekomaru02.png",
    "uroko": "uroko02.png", "kuroro": "kuroro02.png", "komori": "komori02.png",
    "kohaku": "kohaku02.png", "sinonome": "sinonome02.png", "nejimaru": "nejimaru02.png",
    # 敵（百鬼夜行）
    "zako_ghost": "雑魚敵lv1_01.png", "zako_lantern": "雑魚敵02.png",
    "oni_mask": "lv1_03.png", "kasa": "lv1_04.png", "boss1": "lv1_Boss.png",
    "fox": "lv2_01.png", "tanuki": "lv2_02.png", "boss2": "lv2_Boss.png",
    "red_oni": "lv3_kyouteki_01.png", "big_tanuki": "lv3_kyouteki_02.png", "boss3": "lv3_Boss.png",
}
HEIGHT = 220

OUT.mkdir(exist_ok=True)
for key, name in SPRITES.items():
    im = Image.open(SRC / name).convert("RGBA")
    im = im.crop(im.getchannel("A").getbbox())  # 透明な余白を切る
    w = round(im.width * HEIGHT / im.height)
    im.resize((w, HEIGHT), Image.LANCZOS).save(OUT / f"{key}.png", optimize=True)

title = Image.open(SRC / "titlegamen.png").convert("RGB").resize((1280, 720), Image.LANCZOS)
title.save(OUT / "title.jpg", quality=85)
print("done", len(SPRITES) + 1)
