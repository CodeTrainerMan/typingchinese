"""把个人形象图（灰底棚拍）处理成首页可用的透明 PNG，并留一份原图备份。

用法：python web/scripts/prepare-coder-trainer.py [源图路径]

思路：背景是低饱和的中性灰且带暗角，人物是低亮皮衣 + 高饱和橙色头部。
从四条边做种子、只在「低饱和 + 相邻亮度连续」的像素上漫水，得到背景区域后
转成 alpha；再轻微收缩羽化去掉灰边霓边。不做换脸、不重绘，形象保持原样。
"""
from __future__ import annotations

import shutil
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

DEFAULT_SRC = Path(
    r"C:\Users\Administrator\AppData\Local\CodeBuddyExtension\Data"
    r"\aa3ea90f-e974-4812-a1bd-acdc5d4cf1a1\CodeBuddyIDE"
    r"\aa3ea90f-e974-4812-a1bd-acdc5d4cf1a1\history"
    r"\ed14d39efa9b5aae958171f49dd325ad\f0c38c1b7a4f4d0ea693a884d58367f0"
    r"\assets\image.41755aee62.png"
)
OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "brand"
ORIGINAL = OUT_DIR / "coder-trainer-original.png"
CUTOUT = OUT_DIR / "coder-trainer-cutout.png"


def background_mask(arr: np.ndarray) -> np.ndarray:
    """返回 True=背景。做法：拟合灰底的渐变/暗角曲面，再按与预期背景的差异分割。

    不能靠「从边缘漫水吃低饱和像素」——深色皮衣和暗角背景亮度接近，
    会一路吃进人物。改成全局建模就没有连通性问题。
    """
    h, w, _ = arr.shape
    rgb = arr.astype(np.float64)
    gray = rgb.mean(axis=2)
    sat = arr.max(axis=2) - arr.min(axis=2)

    # 用四边环带的低饱和像素拟合二次曲面（灰底是中心亮、四周暗的渐变 + 暗角）
    yy, xx = np.mgrid[0:h, 0:w]
    xn, yn = xx / (w - 1) * 2 - 1, yy / (h - 1) * 2 - 1
    design = np.stack(
        [np.ones_like(xn), xn, yn, xn * xn, yn * yn, xn * yn], axis=-1
    ).reshape(-1, 6)
    edge = ((xx < 16) | (xx > w - 17) | (yy < 16) | (yy > h - 17)) & (sat <= 28)
    coef, _, _, _ = np.linalg.lstsq(
        design[edge.reshape(-1)], gray.reshape(-1)[edge.reshape(-1)], rcond=None
    )
    expected = (design @ coef).reshape(h, w)
    diff = np.maximum.reduce(
        [np.abs(rgb[..., c] - expected) for c in range(3)]
    )

    fg = diff > 20
    fg |= sat > 45  # 橙色头部 / 光纤 / 霓虹文字必定是主体

    # 闭运算封住轮廓上的小缺口，避免外部漫水漏进人物
    solid = np.asarray(
        Image.fromarray((fg * 255).astype(np.uint8), mode="L")
        .filter(ImageFilter.MaxFilter(5))
        .filter(ImageFilter.MinFilter(5))
    ) > 128

    # 从四边漫水「非主体」区域得到外部；没被到达的即人物内部小洞，填回主体
    outside = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in (0, h - 1):
            if not solid[y, x] and not outside[y, x]:
                outside[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if not solid[y, x] and not outside[y, x]:
                outside[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not outside[ny, nx] and not solid[ny, nx]:
                outside[ny, nx] = True
                q.append((ny, nx))

    # 只把「小面积」内部洞填回主体；大洞（两腿之间的背景）必须保持透明。
    # 用连通组件计数，纯 numpy + BFS，避免引入 OpenCV。
    holes = (~solid) & (~outside)
    seen = np.zeros((h, w), dtype=bool)
    small = np.zeros((h, w), dtype=bool)
    for y0 in range(h):
        for x0 in range(w):
            if not holes[y0, x0] or seen[y0, x0]:
                continue
            comp: list[tuple[int, int]] = []
            seen[y0, x0] = True
            q.append((y0, x0))
            while q:
                y, x = q.popleft()
                comp.append((y, x))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and holes[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((ny, nx))
            if len(comp) <= 2500:
                for cy, cx in comp:
                    small[cy, cx] = True
    fg = solid | small

    # 地面投影、腿间背景与右下角贴图水印：y>790 只保留两条腿/靴的竖条（素材固定）
    legs = ((xx >= 210) & (xx <= 310)) | ((xx >= 380) & (xx <= 490))
    fg &= ~((yy > 790) & ~legs)
    # 下半部残留的亮灰投影：靴子与皮衣都是暗色，>82 的低饱和灰一定是背景
    fg &= ~((yy > 760) & (sat < 32) & (gray > 82))
    fg &= (yy > 28) & (yy < 1000)
    return ~fg


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SRC
    if not src.exists():
        raise SystemExit(f"源图不存在：{src}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, ORIGINAL)

    img = Image.open(src).convert("RGB")
    arr = np.asarray(img, dtype=np.int16)
    bg = background_mask(arr)

    alpha = Image.fromarray(np.where(bg, 0, 255).astype(np.uint8), mode="L")
    alpha = alpha.filter(ImageFilter.MinFilter(3))   # 收 1px，去掉残留灰边
    # 脚部渐隐：像全息投影从地面浮起，也让地面投影残留自然消失
    fade = np.clip((1000.0 - np.arange(img.height)) / 120.0, 0.0, 1.0)
    alpha = Image.fromarray(
        (np.asarray(alpha).astype(np.float64) * fade[:, None]).astype(np.uint8), mode="L"
    )
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.6))

    out = ImageEnhance.Color(img).enhance(1.12)
    out = ImageEnhance.Contrast(out).enhance(1.05)
    out.putalpha(alpha)
    out.save(CUTOUT, optimize=True)

    kept = int((np.asarray(alpha) > 128).sum())
    print(f"原图：{ORIGINAL} ({img.width}x{img.height})")
    print(f"去底：{CUTOUT} ({out.width}x{out.height})，保留人物像素 {kept:,}")


if __name__ == "__main__":
    main()
