#!/usr/bin/env python3
"""전투 타격·스킬 효과 스프라이트 시트 제작기 (v4.52).

캐릭터 그림과 같은 셀 셰이딩 만화풍: 진한 갈색/남색 외곽선 + 2~3단 평면 채색 + 흰 심(core).
모든 모양은 이 스크립트가 직접 그린다(외부 이미지·생성형 이미지 없음). 3배 크기로 그린 뒤 줄여
가장자리를 매끄럽게 한다. 셀 경계는 모양 안쪽까지의 거리로 정해서 끝이 가늘어지는 획은
끝이 바깥색, 가운데가 흰 심이 된다.

사용: python3 tools/build-combat-vfx.py [출력폴더]   (numpy·scipy·Pillow 필요)
출력: <폴더>/<효과id>.png (가로 한 줄 프레임 시트) + manifest.json
"""
import json, math, os, random, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import distance_transform_edt as edt, gaussian_filter

SS = 3  # 수퍼샘플 배율

PALETTES = {
    # core, mid, edge, outline  (캐릭터 그림의 외곽선 색을 따른다)
    'ari':      ('#FFFDF2', '#FFD84A', '#FF8F1F', '#5B2C12'),
    'ari-hot':  ('#FFFFFF', '#FFE98A', '#FF6A1A', '#5B2112'),
    'popo':     ('#F6FFFB', '#8DF0D2', '#2FB3A6', '#20304F'),
    'popo-hot': ('#FFFFFF', '#C8FFF0', '#FF7E6B', '#20304F'),
    'guard':    ('#FFFFFF', '#BFEBFF', '#4AA8F0', '#1E3460'),
    'control':  ('#FFFFFF', '#F2D2FF', '#B67BF2', '#3A2160'),
    'gold':     ('#FFFFFF', '#FFF2B0', '#FFC02E', '#5B3A12'),
    'dust':     ('#FFF6E4', '#EAD3AE', '#B98E62', '#5A3A22'),
}

def rgb(h):
    h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)])

def ease_out(t): return 1 - (1 - t) ** 3
def ease_in(t): return t ** 2
def ramp(t, a, b): return min(1.0, max(0.0, (t - a) / (b - a))) if b > a else float(t >= a)


class Canvas:
    def __init__(self, w, h):
        self.w, self.h, self.W, self.H = w, h, w * SS, h * SS
        self.col = np.zeros((self.H, self.W, 3))  # 미리 곱한 색
        self.a = np.zeros((self.H, self.W))

    def new(self):
        im = Image.new('L', (self.W, self.H), 0); return im, ImageDraw.Draw(im)

    def over(self, color, alpha):
        alpha = np.clip(alpha, 0, 1)
        c = color if np.ndim(color) == 3 else np.broadcast_to(color, (self.H, self.W, 3))
        self.col = c * alpha[..., None] + self.col * (1 - alpha[..., None])
        self.a = alpha + self.a * (1 - alpha)

    def add(self, color, alpha):  # 빛 더하기(번쩍임)
        alpha = np.clip(alpha, 0, 1)
        self.col = np.clip(self.col + color * alpha[..., None], 0, 1)
        self.a = np.clip(self.a + alpha, 0, 1)

    def cel(self, mask_img, pal, outline=3.0, b1=4.0, b2=9.0, alpha=1.0, glow=0.0):
        """셀 채색: 외곽선 → 바깥색 → 중간색 → 흰 심. 단위는 출력 px."""
        m = np.asarray(mask_img) > 127
        if not m.any():
            return
        core, mid, edge, line = (rgb(c) for c in (PALETTES[pal] if isinstance(pal, str) else pal))
        din = edt(m) / SS
        dout = edt(~m) / SS
        if glow:
            g = gaussian_filter(m.astype(float), glow * SS) * 0.55 * alpha
            self.add(mid * 0.9, g)
        ol = (dout <= outline) & ~m
        # 외곽선은 거리로 부드럽게(수퍼샘플이라 계단이 없다)
        self.over(line, ol.astype(float) * 0.92 * alpha)
        colr = np.where((din > b2)[..., None], core,
                        np.where((din > b1)[..., None], mid, edge))
        self.over(colr, m.astype(float) * alpha)

    def image(self):
        a = np.clip(self.a, 1e-6, 1)
        out = np.dstack([np.clip(self.col / a[..., None], 0, 1), self.a])
        im = Image.fromarray((out * 255).astype(np.uint8), 'RGBA')
        return im.resize((self.w, self.h), Image.LANCZOS)


# ── 모양(마스크에 그린다; 좌표는 출력 px) ───────────────────────────
def P(pts): return [(x * SS, y * SS) for x, y in pts]

def crescent(d, cx, cy, R, width, a0, a1, rot=0.0, tip=0.85, sweep=1.0, n=72):
    """끝이 가늘어지는 초승달 베기 궤적. sweep<1 이면 앞부분만 그린다."""
    a1 = a0 + (a1 - a0) * sweep
    out, inn = [], []
    for i in range(n + 1):
        s = i / n
        ang = math.radians(a0 + (a1 - a0) * s + rot)
        w = width * (math.sin(math.pi * min(1, s * (1 + (1 - tip)))) ** 0.75)
        w *= 0.35 + 0.65 * s  # 뒤쪽(시작)은 가늘고 머리쪽이 두껍다
        out.append((cx + R * math.cos(ang), cy + R * math.sin(ang)))
        inn.append((cx + (R - w) * math.cos(ang), cy + (R - w) * math.sin(ang)))
    d.polygon(P(out + inn[::-1]), fill=255)

def burst(d, cx, cy, rl, rs, n, rot=0.0, jitter=0.25, seed=1, sharp=0.18):
    """만화 타격 별(뾰족한 가시 + 가운데 원)."""
    r = random.Random(seed)
    pts = []
    for i in range(n * 2):
        a = rot + math.pi * i / n
        if i % 2 == 0:
            L = rl * (1 - jitter + 2 * jitter * r.random())
            pts.append((cx + L * math.cos(a), cy + L * math.sin(a)))
        else:
            for k in (-1, 1):
                aa = a + k * sharp * math.pi / n
                pts.append((cx + rs * math.cos(aa), cy + rs * math.sin(aa)))
    d.polygon(P(pts), fill=255)

def star5(d, cx, cy, r, rot=-90.0, inner=0.46):
    pts = []
    for i in range(10):
        a = math.radians(rot + 36 * i); rr = r if i % 2 == 0 else r * inner
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d.polygon(P(pts), fill=255)

def circle(d, cx, cy, r):
    d.ellipse([(cx - r) * SS, (cy - r) * SS, (cx + r) * SS, (cy + r) * SS], fill=255)

def ellipse(d, cx, cy, rx, ry, fill=255):
    d.ellipse([(cx - rx) * SS, (cy - ry) * SS, (cx + rx) * SS, (cy + ry) * SS], fill=fill)

def ring(d, cx, cy, r, th, ry=None):
    ry = ry if ry is not None else r
    k = ry / r if r else 1
    ellipse(d, cx, cy, r, ry)
    ellipse(d, cx, cy, max(0, r - th), max(0, ry - th * k), fill=0)

def diamond(d, cx, cy, length, wid, ang):
    a = math.radians(ang); ca, sa = math.cos(a), math.sin(a)
    pts = [(cx + ca * length, cy + sa * length), (cx - sa * wid, cy + ca * wid),
           (cx - ca * length * 0.35, cy - sa * length * 0.35), (cx + sa * wid, cy - ca * wid)]
    d.polygon(P(pts), fill=255)

def wedge(d, x0, y0, x1, y1, w0, w1):
    """두께가 바뀌는 막대(내려찍기 기둥·집중선)."""
    ang = math.atan2(y1 - y0, x1 - x0); nx, ny = -math.sin(ang), math.cos(ang)
    d.polygon(P([(x0 + nx * w0, y0 + ny * w0), (x1 + nx * w1, y1 + ny * w1),
                 (x1 - nx * w1, y1 - ny * w1), (x0 - nx * w0, y0 - ny * w0)]), fill=255)

def hexagon(d, cx, cy, r, rot=0.0):
    d.polygon(P([(cx + r * math.cos(math.radians(rot + 60 * i)), cy + r * math.sin(math.radians(rot + 60 * i))) for i in range(6)]), fill=255)


# ── 공통 파편 ────────────────────────────────────────────────────
def sparks(c, cx, cy, t, n, dist, size, pal, seed, spread=360, base=0, alpha=1.0, outline=2.0):
    if t <= 0:
        return
    r = random.Random(seed)
    im, d = c.new()
    for i in range(n):
        ang = base + (r.random() - 0.5) * spread if spread < 360 else r.random() * 360
        sp = 0.55 + 0.45 * r.random()
        dd = dist * ease_out(t) * sp
        L = size * (1 - t) * (0.6 + 0.6 * r.random())
        if L < 1.2:
            continue
        x = cx + math.cos(math.radians(ang)) * dd; y = cy + math.sin(math.radians(ang)) * dd
        diamond(d, x, y, L, L * 0.32, ang)
    c.cel(im, pal, outline=outline, b1=1.5, b2=3.2, alpha=alpha)

def star_pop(c, cx, cy, t, n, dist, size, pal, seed, alpha=1.0):
    """작은 별이 튀어 나가며 돈다(아리 모티프)."""
    if t <= 0:
        return
    r = random.Random(seed)
    im, d = c.new()
    for i in range(n):
        ang = r.random() * 360
        dd = dist * ease_out(t) * (0.6 + 0.4 * r.random())
        s = size * (0.7 + 0.5 * r.random()) * (1 - ease_in(ramp(t, 0.45, 1)))
        if s < 1.5:
            continue
        star5(d, cx + math.cos(math.radians(ang)) * dd, cy + math.sin(math.radians(ang)) * dd - 8 * t,
              s, rot=-90 + 220 * t * (1 if i % 2 else -1))
    c.cel(im, pal, outline=2.4, b1=2.0, b2=4.5, alpha=alpha)


# ── 효과 정의: f(t, canvas, opts) ─────────────────────────────────
def fx_light(c, t, o):
    w, h = c.w, c.h; cx, cy = w * 0.42, h * 0.5
    flip = -1 if o.get('variant') == 2 else 1
    pal = o['pal']
    # 1) 베기 궤적: 0~0.35 동안 휘두르고, 이후 가늘어지며 사라진다
    if t < 0.8:
        im, d = c.new()
        thin = 1 - ease_in(ramp(t, 0.3, 0.8))
        crescent(d, cx, cy, h * 0.36, h * 0.13 * thin, -75 * flip, 60 * flip, sweep=0.55 + 0.45 * ease_out(ramp(t, 0, 0.3)))
        c.cel(im, pal, outline=2.6, b1=3.0, b2=7.0, alpha=1 - ramp(t, 0.6, 0.8))
    # 2) 타격 별: 맞는 자리(오른쪽)
    ht = ramp(t, 0.18, 1)
    if 0 < ht < 1:
        hx, hy = w * 0.72, h * 0.5 + 6 * flip
        s = ease_out(ramp(ht, 0, 0.3)) * (1 - 0.25 * ramp(ht, 0.3, 1))
        im, d = c.new()
        burst(d, hx, hy, h * 0.24 * s, h * 0.08 * s, 7, rot=0.3 * flip, seed=3 + o.get('variant', 1))
        core_shrink = ramp(ht, 0.45, 1)
        c.cel(im, pal, outline=2.6, b1=2.5 + 6 * core_shrink, b2=6 + 14 * core_shrink, alpha=1 - ramp(ht, 0.7, 1))
        sparks(c, hx, hy, ht, 5, h * 0.36, h * 0.09, pal, seed=11 + o.get('variant', 1))

def fx_finisher(c, t, o):
    w, h = c.w, c.h; cx, cy = w * 0.4, h * 0.5; pal = o['pal']; hot = o['hot']
    if t < 0.8:
        im, d = c.new()
        thin = 1 - ease_in(ramp(t, 0.3, 0.8)); sw = 0.55 + 0.45 * ease_out(ramp(t, 0, 0.3))
        crescent(d, cx, cy, h * 0.38, h * 0.15 * thin, -80, 60, sweep=sw)
        crescent(d, cx + 8, cy, h * 0.34, h * 0.1 * thin, 85, -40, sweep=0.4 + 0.6 * ease_out(ramp(t, 0.08, 0.38)))
        c.cel(im, pal, outline=2.8, b1=3.0, b2=7.5, alpha=1 - ramp(t, 0.6, 0.8))
    ht = ramp(t, 0.15, 1)
    if 0 < ht < 1:
        hx, hy = w * 0.7, h * 0.5
        if ht < 0.45:  # 고리 충격파
            im, d = c.new(); rr = h * 0.42 * ease_out(ht / 0.45)
            ring(d, hx, hy, rr, max(1.5, 11 * (1 - ht / 0.45)))
            c.cel(im, hot, outline=1.4, b1=2.0, b2=5, alpha=(1 - ht / 0.45) * 0.9)
        s = ease_out(ramp(ht, 0, 0.25)) * (1 - 0.2 * ramp(ht, 0.3, 1))
        im, d = c.new()
        burst(d, hx, hy, h * 0.33 * s, h * 0.11 * s, 9, rot=0.2, seed=5)
        cs = ramp(ht, 0.45, 1)
        c.cel(im, hot, outline=3.0, b1=3 + 8 * cs, b2=7 + 18 * cs, alpha=1 - ramp(ht, 0.72, 1), glow=4)
        star_pop(c, hx, hy, ramp(ht, 0.1, 1), 3, h * 0.38, h * 0.07, pal, seed=8)
        sparks(c, hx, hy, ht, 7, h * 0.44, h * 0.1, pal, seed=21)

def fx_charged(c, t, o):
    """차지 1단(level=1) / 2단(level=2): 2단은 큰 별 + 이중 충격파 + 집중선 + 화면 번쩍."""
    w, h = c.w, c.h; pal = o['pal']; hot = o['hot']; lv = o['level']
    cx, cy = w * 0.36, h * 0.5; hx, hy = w * 0.64, h * 0.5
    if lv == 2 and t < 0.2:  # 첫 순간 번쩍(맞는 자리만 하얗게)
        im, d = c.new(); circle(d, hx, hy, h * 0.16)
        m = gaussian_filter(np.asarray(im, float) / 255, 9 * SS)
        c.add(rgb('#FFFFFF'), np.clip(m * 1.6, 0, 1) * (1 - t / 0.2) * 0.85)
    if t < 0.85:  # 넓은 반원 베기
        im, d = c.new()
        thin = 1 - ease_in(ramp(t, 0.35, 0.85)); sw = 0.5 + 0.5 * ease_out(ramp(t, 0, 0.3))
        crescent(d, cx, cy, h * 0.4, h * (0.17 if lv == 1 else 0.2) * thin, -95, 95, sweep=sw)
        if lv == 2:
            crescent(d, cx - 14, cy, h * 0.33, h * 0.09 * thin, -80, 80, sweep=0.4 + 0.6 * ease_out(ramp(t, 0.06, 0.36)))
        c.cel(im, pal, outline=3.0, b1=3.5, b2=8.5, alpha=1 - ramp(t, 0.65, 0.85), glow=3 if lv == 2 else 0)
    ht = ramp(t, 0.1, 1)
    if 0 < ht < 1:
        if lv == 2 and ht < 0.6:  # 집중선
            im, d = c.new(); r = random.Random(4)
            for i in range(14):
                a = math.radians(r.random() * 360); L0 = h * (0.2 + 0.5 * ease_out(ht)); L1 = L0 + h * 0.22 * (1 - ht)
                wedge(d, hx + math.cos(a) * L0, hy + math.sin(a) * L0, hx + math.cos(a) * L1, hy + math.sin(a) * L1, 3.2 * (1 - ht), 0.3)
            c.cel(im, hot, outline=1.6, b1=1.2, b2=2.6, alpha=1 - ht / 0.6)
        for k, delay in enumerate((0, 0.12) if lv == 2 else (0,)):
            rt = ramp(ht, delay, delay + 0.5)
            if 0 < rt < 1:
                im, d = c.new(); rr = h * (0.48 if lv == 2 else 0.4) * ease_out(rt)
                ring(d, hx, hy, rr, max(1.5, (16 if lv == 2 else 11) * (1 - rt)))
                c.cel(im, hot, outline=1.4, b1=2.0, b2=5.0, alpha=(1 - rt) * 0.9)
        s = ease_out(ramp(ht, 0, 0.22)) * (1 - 0.2 * ramp(ht, 0.3, 1))
        im, d = c.new()
        burst(d, hx, hy, h * (0.36 if lv == 1 else 0.42) * s, h * 0.13 * s, 10 if lv == 1 else 12, rot=0.1, seed=7)
        if lv == 2:
            star5(d, hx, hy, h * 0.2 * s, rot=-90 + 25 * ht)
        cs = ramp(ht, 0.5, 1)
        c.cel(im, hot, outline=3.2, b1=3.5 + 9 * cs, b2=8 + 22 * cs, alpha=1 - ramp(ht, 0.75, 1), glow=5)
        star_pop(c, hx, hy, ramp(ht, 0.2, 1), 3 if lv == 1 else 5, h * 0.5, h * 0.085, 'gold' if lv == 2 else pal, seed=9)
        sparks(c, hx, hy, ht, 8 if lv == 1 else 12, h * 0.5, h * 0.11, pal, seed=31)

def fx_plunge(c, t, o):
    w, h = c.w, c.h; pal = o['pal']; hot = o['hot']; gx, gy = w * 0.5, h * 0.8
    if t < 0.55:  # 내려꽂는 기둥
        im, d = c.new(); k = 1 - ramp(t, 0.15, 0.55)
        wedge(d, gx, h * 0.05 + h * 0.4 * ease_out(ramp(t, 0, 0.15)), gx, gy, 2 * k, w * 0.06 * k)
        c.cel(im, pal, outline=2.6, b1=2.5, b2=6, alpha=k)
    ht = ramp(t, 0.1, 1)
    if 0 < ht < 1:
        if ht < 0.55:
            im, d = c.new(); rr = w * 0.44 * ease_out(ht / 0.55)
            ring(d, gx, gy, rr, max(1, 8 * (1 - ht / 0.55)), ry=rr * 0.22)
            c.cel(im, hot, outline=2.0, b1=1.6, b2=4, alpha=1 - ht / 0.55)
        im, d = c.new(); r = random.Random(12)  # 먼지 구름(울퉁불퉁한 덩어리가 양옆으로 굴러간다)
        p = ease_out(ht); shrink = 1 - 0.5 * ramp(ht, 0.6, 1)
        for side in (-1, 1):
            for i in range(5):
                x = gx + side * (w * 0.06 + w * 0.3 * p * (0.45 + 0.14 * i)); y = gy - 4 - i * 6 * p
                R = h * (0.065 + 0.025 * r.random()) * (0.5 + 0.7 * p) * shrink
                circle(d, x, y, R)
                for k in range(3):  # 덩어리 위에 작은 혹을 붙여 구름 윤곽을 만든다
                    a = math.radians(r.random() * 200 - 190); circle(d, x + math.cos(a) * R * 0.8, y + math.sin(a) * R * 0.8, R * (0.45 + 0.25 * r.random()))
        c.cel(im, 'dust', outline=2.4, b1=5, b2=14, alpha=1 - ramp(ht, 0.7, 1))
        s = ease_out(ramp(ht, 0, 0.2)) * (1 - 0.3 * ramp(ht, 0.3, 1))
        im, d = c.new(); burst(d, gx, gy - 4, h * 0.3 * s, h * 0.09 * s, 8, rot=-math.pi / 2, seed=13)
        ellipse(d, gx, gy, w * 0.0, 0)
        c.cel(im, hot, outline=2.8, b1=3 + 7 * ramp(ht, 0.4, 1), b2=7 + 14 * ramp(ht, 0.4, 1), alpha=1 - ramp(ht, 0.6, 1))
        sparks(c, gx, gy - 4, ht, 9, h * 0.5, h * 0.1, 'dust', seed=41, spread=150, base=-90)

def fx_skill_attack(c, t, o):
    """공격 스킬: 별똥 베기. 단계가 오르면 궤적이 겹치고 별자리 선·금빛 테가 붙는다."""
    w, h = c.w, c.h; st = o['stage']; pal = o['pal']; hot = 'gold' if st == 3 else o['hot']
    hx, hy = w * 0.68, h * 0.5
    trails = [(0, 0)] + ([(-14, 0.08)] if st >= 2 else []) + ([(14, 0.14)] if st == 3 else [])
    for dy, delay in trails:
        tt = ramp(t, delay, delay + 0.55)
        if 0 < tt < 1:
            im, d = c.new(); head = ease_out(ramp(tt, 0, 0.45)); k = 1 - ramp(tt, 0.45, 1)
            x1 = w * 0.08 + (hx - w * 0.08) * head
            wedge(d, w * 0.06 + (x1 - w * 0.06) * ramp(tt, 0.3, 1), hy + dy, x1, hy + dy * 0.3, 1.0, h * (0.07 if st < 3 else 0.09) * k)
            c.cel(im, pal, outline=2.6, b1=2.5, b2=6.5, alpha=k, glow=3 if st == 3 else 0)
    ht = ramp(t, 0.22, 1)
    if 0 < ht < 1:
        if st == 3 and ht < 0.7:  # 별자리 선
            im, d = c.new(); r = random.Random(17); pts = []
            for i in range(6):
                a = math.radians(i * 60 + 20 + r.random() * 20); L = h * 0.36 * ease_out(ramp(ht, 0, 0.4))
                pts.append((hx + math.cos(a) * L, hy + math.sin(a) * L))
            for i in range(6):
                wedge(d, *pts[i], *pts[(i + 1) % 6], 1.3, 1.3); star5(d, *pts[i], h * 0.035)
            c.cel(im, 'gold', outline=1.6, b1=1.2, b2=2.5, alpha=1 - ramp(ht, 0.45, 0.7))
        if st >= 2:
            rt = ramp(ht, 0, 0.5)
            if rt < 1:
                im, d = c.new(); ring(d, hx, hy, h * 0.42 * ease_out(rt), max(1, 7 * (1 - rt)))
                c.cel(im, hot, outline=1.8, b1=1.5, b2=4, alpha=1 - rt)
        s = ease_out(ramp(ht, 0, 0.25)) * (1 - 0.2 * ramp(ht, 0.35, 1))
        im, d = c.new()
        star5(d, hx, hy, h * (0.22 if st == 1 else 0.27 if st == 2 else 0.32) * s, rot=-90 + 40 * ht)
        c.cel(im, hot, outline=3.0, b1=3 + 8 * ramp(ht, 0.45, 1), b2=7 + 18 * ramp(ht, 0.45, 1), alpha=1 - ramp(ht, 0.72, 1), glow=4)
        star_pop(c, hx, hy, ramp(ht, 0.05, 1), 3 + 2 * st, h * 0.44, h * 0.06, 'gold' if st == 3 else pal, seed=19)

def fx_skill_guard(c, t, o):
    """보호 스킬: 둥근 방울막. 2단계는 육각 무늬, 3단계는 금빛 테 + 도는 별."""
    w, h = c.w, c.h; st = o['stage']; cx, cy = w * 0.5, h * 0.52
    grow = ease_out(ramp(t, 0, 0.3)); fade = 1 - ramp(t, 0.75, 1)
    R = h * 0.4 * (0.6 + 0.4 * grow) * (1 + 0.05 * math.sin(t * 12))
    im, d = c.new(); ellipse(d, cx, cy, R, R)  # 반투명 막
    m = np.asarray(im, float) / 255
    c.over(rgb(PALETTES['guard'][1]), m * 0.22 * fade)
    if st >= 2:
        im, d = c.new()
        for i in range(-2, 3):
            for j in range(-2, 3):
                x = cx + i * R * 0.42 + (j % 2) * R * 0.21; y = cy + j * R * 0.36
                if (x - cx) ** 2 + (y - cy) ** 2 < (R * 0.82) ** 2:
                    hexagon(d, x, y, R * 0.19); hexagon_hole = (x, y)
                    d.polygon(P([(x + R * 0.15 * math.cos(math.radians(60 * k)), y + R * 0.15 * math.sin(math.radians(60 * k))) for k in range(6)]), fill=0)
        c.cel(im, 'guard', outline=1.2, b1=1.0, b2=3, alpha=0.75 * fade)
    im, d = c.new(); ring(d, cx, cy, R, h * (0.05 if st < 3 else 0.065))
    c.cel(im, 'gold' if st == 3 else 'guard', outline=2.6, b1=2.2, b2=5, alpha=fade, glow=3)
    im, d = c.new(); crescent(d, cx, cy, R * 0.86, R * 0.16, 200, 250)  # 반짝 하이라이트
    c.cel(im, ('#FFFFFF', '#FFFFFF', '#E8F7FF', '#1E3460'), outline=0, b1=1, b2=2, alpha=0.9 * fade)
    if st == 3:
        im, d = c.new()
        for i in range(3):
            a = math.radians(120 * i + 360 * t); star5(d, cx + math.cos(a) * R, cy + math.sin(a) * R, h * 0.06 * grow)
        c.cel(im, 'gold', outline=2.2, b1=2, b2=4.5, alpha=fade)
    if t < 0.4:
        sparks(c, cx, cy, ramp(t, 0, 0.4), 8, R * 1.2, h * 0.07, 'guard', seed=51)

def fx_skill_control(c, t, o):
    """제어 스킬: 도는 소용돌이 고리. 단계가 오르면 고리가 겹치고 시계 눈금·별이 붙는다."""
    w, h = c.w, c.h; st = o['stage']; cx, cy = w * 0.5, h * 0.52
    grow = ease_out(ramp(t, 0, 0.35)); fade = 1 - ramp(t, 0.72, 1)
    arms = 3 if st == 1 else 4
    for layer in range(1 if st == 1 else 2):
        im, d = c.new(); R = h * (0.38 - 0.1 * layer) * (0.5 + 0.5 * grow); spin = (1 if layer == 0 else -1.4) * 300 * t
        for k in range(arms):
            crescent(d, cx, cy, R, h * 0.09, k * 360 / arms + spin, k * 360 / arms + 95 + spin)
        c.cel(im, 'control', outline=2.4, b1=2.2, b2=5.5, alpha=fade, glow=3 if st == 3 else 0)
    if st >= 2:
        im, d = c.new(); R = h * 0.44 * (0.5 + 0.5 * grow)
        for k in range(12):
            a = math.radians(30 * k - 120 * t)
            wedge(d, cx + math.cos(a) * R * 0.9, cy + math.sin(a) * R * 0.9, cx + math.cos(a) * R, cy + math.sin(a) * R, 1.6, 1.6)
        c.cel(im, 'control', outline=1.4, b1=1, b2=2.5, alpha=0.9 * fade)
    if st == 3:
        star_pop(c, cx, cy, ramp(t, 0.1, 1), 6, h * 0.4, h * 0.06, 'gold', seed=61)
    im, d = c.new(); circle(d, cx, cy, h * 0.06 * grow * (1 + 0.2 * math.sin(t * 20)))
    c.cel(im, 'control', outline=2.2, b1=2, b2=4, alpha=fade)

def fx_burst(c, t, o):
    """공명 정화(F): 가운데 큰 별 + 퍼지는 빛살 + 이중 금빛 고리 + 쏟아지는 별."""
    w, h = c.w, c.h; pal = o['pal']; hot = o['hot']; cx, cy = w * 0.5, h * 0.5
    if t < 0.22:
        im, d = c.new(); circle(d, cx, cy, h * 0.2)
        m = gaussian_filter(np.asarray(im, float) / 255, 14 * SS)
        c.add(rgb('#FFFFFF'), np.clip(m * 1.4, 0, 1) * (1 - t / 0.22) * 0.8)
    if t < 0.7:  # 빛살
        im, d = c.new(); r = random.Random(71); k = ramp(t, 0, 0.7)
        for i in range(16):
            a = math.radians(i * 22.5 + 6 * r.random()); L0 = h * (0.12 + 0.3 * ease_out(k)); L1 = L0 + h * (0.12 + 0.1 * (i % 2)) * (1 - k)
            wedge(d, cx + math.cos(a) * L0, cy + math.sin(a) * L0, cx + math.cos(a) * L1, cy + math.sin(a) * L1, 5 * (1 - k), 0.4)
        c.cel(im, 'gold', outline=1.8, b1=1.5, b2=3.2, alpha=1 - k)
    for delay, pl in ((0.0, 'gold'), (0.15, hot)):
        rt = ramp(t, delay, delay + 0.6)
        if 0 < rt < 1:
            im, d = c.new(); rr = h * 0.47 * ease_out(rt)
            ring(d, cx, cy, rr, max(1.5, 18 * (1 - rt)))
            c.cel(im, pl, outline=1.6, b1=2.2, b2=6, alpha=(1 - rt) * 0.95, glow=3)
    s = ease_out(ramp(t, 0, 0.2)) * (1 - 0.25 * ramp(t, 0.4, 1))
    im, d = c.new()
    burst(d, cx, cy, h * 0.26 * s, h * 0.12 * s, 12, rot=0.13, seed=73, jitter=0.15)
    star5(d, cx, cy, h * 0.17 * s, rot=-90 + 30 * t)
    cs = ramp(t, 0.5, 1)
    c.cel(im, hot, outline=3.2, b1=4 + 9 * cs, b2=9 + 24 * cs, alpha=1 - ramp(t, 0.72, 1), glow=6)
    star_pop(c, cx, cy, ramp(t, 0.1, 1), 9, h * 0.48, h * 0.06, 'gold', seed=77)
    star_pop(c, cx, cy, ramp(t, 0.22, 1), 5, h * 0.36, h * 0.05, pal, seed=79)
    sparks(c, cx, cy, t, 14, h * 0.5, h * 0.07, pal, seed=81)

EFFECTS = {
    'burst':     (fx_burst, 10, (640, 640), {}),
    # id: (함수, 프레임 수, 크기 w×h, 옵션)
    'light-1':   (fx_light, 6, (320, 320), {'variant': 1}),
    'light-2':   (fx_light, 6, (320, 320), {'variant': 2}),
    'finisher':  (fx_finisher, 7, (384, 384), {}),
    'charged-1': (fx_charged, 8, (448, 448), {'level': 1}),
    'charged-2': (fx_charged, 10, (512, 512), {'level': 2}),
    'plunge':    (fx_plunge, 8, (448, 320), {}),
}
for st in (1, 2, 3):
    EFFECTS[f'skill-attack-{st}'] = (fx_skill_attack, 8, (448, 384), {'stage': st})
    EFFECTS[f'skill-guard-{st}'] = (fx_skill_guard, 8, (384, 384), {'stage': st})
    EFFECTS[f'skill-control-{st}'] = (fx_skill_control, 8, (384, 384), {'stage': st})

HEROES = {'ari': ('ari', 'ari-hot'), 'popo': ('popo', 'popo-hot')}


def render(eid, hero):
    fn, n, (w, h), opts = EFFECTS[eid]
    pal, hot = HEROES[hero]
    frames = []
    for i in range(n):
        t = (i + 0.5) / n
        c = Canvas(w, h); fn(c, t, dict(opts, pal=pal, hot=hot)); frames.append(c.image())
    return frames


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else 'assets/vfx-v452'
    only = sys.argv[2].split(',') if len(sys.argv) > 2 else None
    os.makedirs(out, exist_ok=True)
    mpath = os.path.join(out, 'manifest.json')
    manifest = json.load(open(mpath)) if os.path.exists(mpath) else {}
    for hero in HEROES:
        for eid, (_, n, (w, h), _) in EFFECTS.items():
            key = f'{hero}-{eid}'
            if only and key not in only:
                continue
            frames = render(eid, hero)
            sheet = Image.new('RGBA', (w * n, h), (0, 0, 0, 0))
            for i, f in enumerate(frames):
                sheet.paste(f, (i * w, 0))
            # 게임에는 WebP(투명 유지, 손실 압축 q90)로 싣는다. PNG 는 검토·재작업용 원본.
            sheet.save(os.path.join(out, key + '.webp'), quality=90, method=6, alpha_quality=95)
            if os.environ.get('VFX_PNG') == '1':
                sheet.save(os.path.join(out, key + '.png'), optimize=True)
            manifest[key] = {'frames': n, 'w': w, 'h': h}
            print(key, n, w, h, flush=True)
    with open(os.path.join(out, 'manifest.json'), 'w') as f:
        json.dump(dict(sorted(manifest.items())), f, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
