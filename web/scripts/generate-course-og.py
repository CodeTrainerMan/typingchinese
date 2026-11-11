"""生成课程页社交分享卡（og:image，1200×630，X / Facebook 抓取用）。

输入：public/brand/coder-trainer-cutout.png（作者形象，透明底）
输出：public/og/course-<slug>.png

为什么不用 AI 生成图：排版合成的文字清晰可控、风格与站点一致，
也避免了上一轮 AI 插画风格不佳的问题。
新增课程时在 COURSES 里加一条并重跑：python web/scripts/generate-course-og.py
"""
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WEB = Path(__file__).resolve().parents[1]
AVATAR = WEB / "public" / "brand" / "coder-trainer-cutout.png"
OUT = WEB / "public" / "og"
FONTS = Path(r"C:\Windows\Fonts")

W, H = 1200, 630
BG = (5, 7, 13)
CYAN = (34, 230, 255)
MAGENTA = (255, 46, 151)
WHITE = (234, 249, 255)
GREY = (143, 169, 183)
DIM = (95, 123, 139)

COURSES = [
    {
        "slug": "10-everyday-chinese-words",
        "no": "01",
        "n_words": 10,
        "n_sentences": 30,
        "title_en": "10 Everyday Chinese Words",
        "sub_en": "with real sentences people actually say",
        "words": [("牛逼", "niú bī"), ("厉害", "lì hai"), ("加油", "jiā yóu")],
        "sentence": "这也太牛逼了！",
        "pinyin": "Zhè yě tài niú bī le!",
        "sentence2": "他一个人把项目做完了，太牛逼了。",
    },
    {
        "slug": "10-most-common-chinese-words",
        "no": "02",
        "n_words": 10,
        "n_sentences": 30,
        "title_en": "10 Most-Used Chinese Words",
        "sub_en": "the words you'll hear dozens of times a day",
        "words": [("你好", "nǐ hǎo"), ("谢谢", "xiè xie"), ("好的", "hǎo de")],
        "sentence": "你好，请问地铁站在哪儿？",
        "pinyin": "Nǐ hǎo, qǐngwèn dìtiězhàn zài nǎr?",
        "sentence2": "太谢谢了，帮大忙了。",
    },
]


def F(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / name), size)


def render(c: dict) -> None:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # 微网格底纹
    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    for x in range(60, W, 60):
        gd.line([(x, 0), (x, H)], fill=(34, 230, 255, 10))
    for y in range(60, H, 60):
        gd.line([(0, y), (W, y)], fill=(34, 230, 255, 10))
    img.paste(grid, (0, 0), grid)
    d = ImageDraw.Draw(img)

    # 作者形象：右下角，脚部渐隐贴住底边（先贴人物，HUD 角框压在其上）
    av = Image.open(AVATAR)
    av_h = 520
    av = av.resize((round(av.width * av_h / av.height), av_h), Image.LANCZOS)
    img.paste(av, (W - av.width - 24, H - av_h), av)

    # HUD 四角框
    L = 40
    for x0, y0, dx, dy in [(16, 16, 1, 1), (W - 17, 16, -1, 1), (16, H - 17, 1, -1), (W - 17, H - 17, -1, -1)]:
        d.line([(x0, y0), (x0 + dx * L, y0)], fill=CYAN, width=3)
        d.line([(x0, y0), (x0, y0 + dy * L)], fill=CYAN, width=3)

    x = 72
    d.text((x, 56), f"// TYPINGCHINESE · COURSE {c['no']} — {c['n_words']} WORDS · {c['n_sentences']} SENTENCES", font=F("consola.ttf", 24), fill=CYAN)
    d.text((x, 96), c["title_en"], font=F("msyhbd.ttc", 54), fill=WHITE)
    d.text((x, 172), c["sub_en"], font=F("msyh.ttc", 30), fill=GREY)

    # 词行：中文 + 拼音并排
    wx = x
    for hanzi, pinyin in c["words"]:
        d.text((wx, 232), hanzi, font=F("msyhbd.ttc", 54), fill=CYAN)
        hw = d.textlength(hanzi, font=F("msyhbd.ttc", 54))
        d.text((wx + hw + 12, 258), pinyin, font=F("msyh.ttc", 28), fill=MAGENTA)
        wx += hw + 12 + d.textlength(pinyin, font=F("msyh.ttc", 28)) + 44

    # 真实例句（与页面第 1 句一致）
    d.text((x, 336), c["sentence"], font=F("msyhbd.ttc", 44), fill=WHITE)
    d.text((x, 404), c["pinyin"], font=F("msyh.ttc", 30), fill=CYAN)
    d.text((x, 466), c["sentence2"], font=F("msyh.ttc", 32), fill=GREY)

    d.text((x, 588), "typingchinese.club", font=F("consola.ttf", 24), fill=DIM)

    OUT.mkdir(parents=True, exist_ok=True)
    img.save(OUT / f"course-{c['slug']}.png", optimize=True)


# 防线：课程数据里每门课都必须有卡，否则分享出去 og:image 会是 404（X 又不显示图）。
# 新增课程时先在这里补 COURSES 配置，再重跑本脚本。
src_slugs = set(re.findall(r"slug:\s*'([^']+)'", (WEB / "src/lib/courses.ts").read_text(encoding="utf-8")))
card_slugs = {c["slug"] for c in COURSES}
if src_slugs != card_slugs:
    print("课程 slug 与卡配置不一致：", file=sys.stderr)
    print(f"  courses.ts      : {sorted(src_slugs)}", file=sys.stderr)
    print(f"  generate-og.py  : {sorted(card_slugs)}", file=sys.stderr)
    print("请更新本脚本的 COURSES 后重跑。", file=sys.stderr)
    sys.exit(1)

for c in COURSES:
    render(c)
    print(f"ok: public/og/course-{c['slug']}.png")
