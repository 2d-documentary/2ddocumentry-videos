"""Painted 2D backgrounds with real textures (Poly Haven, CC0), 1080 x 1920.
No ink outlines on the world: depth comes from perspective, atmospheric haze, soft shadows and light.
Water is shaded per pixel: wave normals reflect the sky (Fresnel) and the sun or moon (glint)."""
import os, sys, math, json
import numpy as np, cv2

W, H = 1080, 1920
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, 'assets', 'ph')
rng = np.random.default_rng(7)

# ------------------------------------------------------------------ basics
def tex(name, kind='diff'):
    p = os.path.join(A, f'{name}_{kind}.jpg')
    im = cv2.imread(p, cv2.IMREAD_COLOR)
    if im is None: raise FileNotFoundError(p)
    return im[:, :, ::-1].astype(np.float32) / 255.0

def canvas(col=(0, 0, 0)): c = np.zeros((H, W, 3), np.float32); c[:] = col; return c
def lerp(a, b, t): return a + (b - a) * t
def smooth(t): t = np.clip(t, 0, 1); return t * t * (3 - 2 * t)
def C(hexs): hexs = hexs.lstrip('#'); return np.array([int(hexs[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32)

def mask_poly(pts, blur=0):
    m = np.zeros((H, W), np.float32)
    cv2.fillPoly(m, [np.round(np.asarray(pts, np.float64) * 16).astype(np.int32)], 1.0, lineType=cv2.LINE_AA, shift=4)
    if blur: m = cv2.GaussianBlur(m, (0, 0), blur)
    return m

def mask_ellipse(cx, cy, rx, ry, blur=0, ang=0):
    m = np.zeros((H, W), np.float32)
    cv2.ellipse(m, (int(cx * 16), int(cy * 16)), (int(rx * 16), int(ry * 16)), ang, 0, 360, 1.0, -1, cv2.LINE_AA, 4)
    if blur: m = cv2.GaussianBlur(m, (0, 0), blur)
    return m

def comp(cv, layer, m, op=1.0):
    m = (m * op)[..., None]; cv[:] = cv * (1 - m) + layer * m

def tiled(t, w, h, scale=1.0, rot=0):
    tt = cv2.resize(t, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_LINEAR)
    if rot: tt = np.ascontiguousarray(np.rot90(tt, rot))
    ry, rx = h // tt.shape[0] + 2, w // tt.shape[1] + 2
    return np.tile(tt, (ry, rx, 1))[:h, :w]

def warp_quad(t, dst, tw, th, scale=1.0, rot=0):
    """Map a tiled tw x th texture rectangle onto the 4 destination points (TL, TR, BR, BL)."""
    T = tiled(t, tw, th, scale, rot)
    src = np.float32([[0, 0], [tw, 0], [tw, th], [0, th]])
    M = cv2.getPerspectiveTransform(src, np.float32(dst))
    return cv2.warpPerspective(T, M, (W, H), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_REFLECT)

def place_tex(t, scale=1.0, rot=0, dx=0, dy=0, tint=None, gain=1.0):
    T = tiled(t, W + 400, H + 400, scale, rot)[200 + dy:200 + dy + H, 200 + dx:200 + dx + W]
    if tint is not None: T = T * np.asarray(tint, np.float32)
    return T * gain

def shade_lin(m, x0, y0, x1, y1, a, b):
    """Linear light ramp (a at x0,y0 to b at x1,y1) as a full-frame factor map."""
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.float32([x1 - x0, y1 - y0]); L = float(d @ d) or 1
    t = np.clip(((xx - x0) * d[0] + (yy - y0) * d[1]) / L, 0, 1)
    return lerp(a, b, t)

def darken(cv, m, k):  # soft shadow / occlusion
    cv[:] = cv * (1 - m[..., None] * k)

def add_glow(cv, cx, cy, r, col, k):
    m = mask_ellipse(cx, cy, r, r, blur=r * 0.45)
    cv[:] = cv + m[..., None] * np.asarray(col, np.float32) * k

def haze(cv, m, col, k):
    cv[:] = lerp(cv, np.asarray(col, np.float32)[None, None], (m * k)[..., None])

def line_aa(cv, pts, col, w, op=1.0):
    m = np.zeros((H, W), np.float32)
    cv2.polylines(m, [np.round(np.asarray(pts) * 16).astype(np.int32)], False, 1.0, max(1, int(round(w))), cv2.LINE_AA, 4)
    comp(cv, np.asarray(col, np.float32)[None, None], m, op)

def noise2(h, w, scale, octaves=4, seed=0):
    r = np.random.default_rng(seed); out = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
    for o in range(octaves):
        s = max(2, int(scale / (2 ** o)))
        small = r.random((h // s + 2, w // s + 2)).astype(np.float32)
        out += cv2.resize(small, (w + 2 * s, h + 2 * s), interpolation=cv2.INTER_CUBIC)[s:s + h, s:s + w] * amp
        tot += amp; amp *= 0.5
    return out / tot

def sky_from_photo(name, y_h, crop=(0.10, 0.50), xoff=0.30):
    """Real sky photo: a horizontal band of the tonemapped HDRI, stretched to sit above the horizon."""
    im = tex('sky_' + name.split('_')[-1], 'jpg') if False else cv2.imread(os.path.join(A, f'sky_{name}.jpg'))[:, :, ::-1].astype(np.float32) / 255
    h, w = im.shape[:2]
    y0, y1 = int(h * crop[0]), int(h * crop[1]); x0 = int(w * xoff); x1 = x0 + int((y1 - y0) * W / max(1, y_h))
    band = im[y0:y1, x0:min(w, x1)]
    return cv2.resize(band, (W, y_h), interpolation=cv2.INTER_AREA)

# ------------------------------------------------------------------ water
def ocean(cv, y_h, y_end, sky_full, deep, cam_h=6.0, f=1100.0, sun=None, sun_k=6.0, amp=1.0, chop=1.0, seed=3,
          shallow=None, rough=1.0):
    """Physically shaded water plane between the horizon and y_end.
    sky_full: H x W image used for reflections (row = elevation). shallow: (y_shore, colour, bottom_img) or None."""
    ys = np.arange(y_h + 1, y_end, dtype=np.float32); xs = np.arange(W, dtype=np.float32)
    X, Y = np.meshgrid(xs, ys)
    dy = Y - y_h
    z = cam_h * f / dy                       # distance in metres
    xw = (X - W / 2) * z / f
    r = np.random.default_rng(seed)
    gx = np.zeros_like(z); gz = np.zeros_like(z)
    # sum of directional swells (Gerstner-like slopes); fade small waves with distance to avoid aliasing
    for i in range(28):
        lam = 0.35 * (1.33 ** i) * rough       # wavelength 0.35 m .. ~800 m
        k = 2 * math.pi / lam; ang = r.normal(0.25, 0.55); a = amp * 0.018 * lam ** 0.95 * chop
        dx, dz = math.cos(ang), math.sin(ang) + 0.6
        n = math.hypot(dx, dz); dx, dz = dx / n, dz / n
        ph = r.uniform(0, 2 * math.pi)
        pix = lam * f / z                       # wavelength in pixels at this distance
        fade = np.clip((pix - 2.0) / 6.0, 0, 1)
        c = np.cos(k * (dx * xw + dz * z) + ph) * a * k * fade
        gx += c * dx; gz += c * dz
    nx, ny, nz = -gx, np.ones_like(gx), -gz
    nl = np.sqrt(nx * nx + ny * ny + nz * nz); nx, ny, nz = nx / nl, ny / nl, nz / nl
    # view ray (camera looks along +z, y up)
    vx = (X - W / 2) / f; vy = -dy / f; vz = np.ones_like(vx)
    vl = np.sqrt(vx * vx + vy * vy + 1); vx, vy, vz = vx / vl, vy / vl, vz / vl
    d = vx * nx + vy * ny + vz * nz
    rx, ry, rz = vx - 2 * d * nx, vy - 2 * d * ny, vz - 2 * d * nz
    ry = np.maximum(ry, 0.002)
    srow = np.clip(y_h - (ry / np.maximum(rz, 0.05)) * f, 0, y_h - 1).astype(np.int32)
    scol = np.clip(W / 2 + (rx / np.maximum(rz, 0.05)) * f, 0, W - 1).astype(np.int32)
    refl = sky_full[srow, scol]
    cosv = np.clip(-d, 0, 1)
    F = 0.02 + 0.98 * (1 - cosv) ** 5
    base = np.broadcast_to(np.asarray(deep, np.float32), refl.shape).copy()
    # subsurface: waves facing us look lighter and greener
    sss = np.clip(nz * -3.0, 0, 1)[..., None] * 0.18
    base = base * (1 + sss)
    col = base * (1 - F[..., None]) + refl * F[..., None]
    if sun is not None:
        sxv, syv, szv = sun; sl = math.sqrt(sxv * sxv + syv * syv + szv * szv)
        sp = np.clip((rx * sxv + ry * syv + rz * szv) / sl, 0, 1)
        col += (sp ** 900 * sun_k + sp ** 120 * sun_k * 0.08)[..., None] * np.float32([1.0, 0.95, 0.85])
    # distance haze toward the horizon colour
    hz = sky_full[max(0, y_h - 3)].mean(0)
    t = np.clip(1 - dy / 140.0, 0, 1)[..., None] ** 2
    col = lerp(col, hz[None, None], t * 0.8)
    if shallow is not None:
        y_shore, scol_, bottom = shallow
        depth = np.clip((y_shore - Y) / (y_shore - y_h), 0, 1)
        clarity = smooth(1 - depth / 0.35)[..., None]
        bed = bottom[y_h + 1:y_end] * 0.85
        wet = lerp(bed * np.asarray(scol_, np.float32), np.asarray(scol_, np.float32)[None, None] * 0.9, 0.45)
        col = lerp(col, wet + refl * F[..., None] * 0.6, clarity * 0.9)
    cv[y_h + 1:y_end] = np.clip(col, 0, 4)
    return z

def foam(cv, y, amp, thick, seed, col=(0.95, 0.97, 0.96), op=0.9):
    n = noise2(H, W, 40, 3, seed)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    edge = y + np.sin(xx / 70.0 + seed) * amp + (n - 0.5) * amp * 2
    m = np.clip(1 - np.abs(yy - edge) / thick, 0, 1) * smooth((n - 0.35) / 0.3)
    comp(cv, np.float32(col)[None, None], m, op)

# ------------------------------------------------------------------ props
def cylinder_shade(m, cx, rx, light=-0.6, amb=0.35):
    """Horizontal shading across a round object: lit from the side the light comes from."""
    xx = (np.arange(W, dtype=np.float32) - cx) / max(rx, 1)
    nx = np.clip(xx, -1, 1); nz = np.sqrt(np.clip(1 - nx * nx, 0, 1))
    lam = np.clip(nx * light + nz * 0.8, 0, 1)
    return np.broadcast_to((amb + (1 - amb) * lam)[None], (H, W))

def barrel(cv, cx, by, rx, h, t_wood, hoop=(0.22, 0.22, 0.22), light=-0.6, label=None):
    top = by - h; bulge = rx * 0.12
    pts = [(cx - rx, top + rx * 0.2)] + [(cx - rx - bulge * math.sin(math.pi * k / 10), top + rx * 0.2 + (h - rx * 0.4) * k / 10) for k in range(11)] + \
          [(cx + rx + bulge * math.sin(math.pi * k / 10), top + rx * 0.2 + (h - rx * 0.4) * (10 - k) / 10) for k in range(11)]
    m = mask_poly(pts)
    darken(cv, mask_ellipse(cx + rx * 0.6, by + 2, rx * 1.6, rx * 0.28, blur=10), 0.5)
    body = place_tex(t_wood, 0.35, rot=1) * cylinder_shade(m, cx, rx, light)[..., None]
    comp(cv, body, m)
    for fy in (0.18, 0.42, 0.62, 0.86):
        y = top + h * fy; hm = mask_poly([(cx - rx - bulge * 0.8, y - 5), (cx + rx + bulge * 0.8, y - 5), (cx + rx + bulge * 0.8, y + 5), (cx - rx - bulge * 0.8, y + 5)])
        comp(cv, np.float32(hoop)[None, None] * cylinder_shade(hm, cx, rx, light)[..., None] * 1.3, hm)
    lid = mask_ellipse(cx, top + rx * 0.2, rx, rx * 0.22)
    comp(cv, place_tex(t_wood, 0.3) * 0.75, lid)

def jar(cv, cx, by, s, t_clay, light=-0.6, tint=(1.0, 0.85, 0.75)):
    prof = [(0.16, 1.0), (0.2, 0.93), (0.42, 0.8), (0.52, 0.6), (0.5, 0.35), (0.36, 0.14), (0.12, 0.0)]
    pts = [(cx - p[0] * s, by - p[1] * s) for p in prof] + [(cx + p[0] * s, by - p[1] * s) for p in reversed(prof)]
    m = mask_poly(pts)
    darken(cv, mask_ellipse(cx + s * 0.3, by, s * 0.55, s * 0.09, blur=8), 0.55)
    comp(cv, place_tex(t_clay, 0.3, tint=tint) * cylinder_shade(m, cx, s * 0.5, light)[..., None], m)
    comp(cv, np.float32([0.08, 0.05, 0.04])[None, None], mask_ellipse(cx, by - s, s * 0.14, s * 0.04))

def rope_coil(cv, cx, cy, r, t_rope):
    for k, rr in enumerate(np.linspace(r, r * 0.2, 7)):
        m = mask_ellipse(cx, cy, rr * 1.45, rr * 0.55) - mask_ellipse(cx, cy, rr * 1.45 - 9, rr * 0.55 - 4)
        m = np.clip(m, 0, 1)
        comp(cv, place_tex(t_rope, 0.25, tint=(0.95, 0.85, 0.65)) * (0.75 + 0.25 * (k % 2)), m)

def save(cv, path, grade=None, grain=0.012, vignette=0.25):
    out = cv.copy()
    if grade: out = grade(out)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    v = 1 - vignette * (((xx - W / 2) / (W / 2)) ** 2 * 0.6 + ((yy - H / 2) / (H / 2)) ** 2 * 0.4)
    out = out * v[..., None]
    out += rng.normal(0, grain, out.shape).astype(np.float32)
    out = np.clip(out, 0, 1)
    out = 1 - np.exp(-out * 1.6) if False else out
    cv2.imwrite(path, (out[:, :, ::-1] * 255 + 0.5).astype(np.uint8), [cv2.IMWRITE_PNG_COMPRESSION, 3])
