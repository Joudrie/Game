# The Second: turn the Hunyuan3D-2mv shape (generated from the owner's four turnaround images) into a
# game-ready textured model. Steps: drop floating bits, decimate, UV-unwrap (xatlas), then paint the
# texture by projecting the four images onto the surface (each texel takes the views that face it and
# can see it, found with a z-buffer). Output: build/the_second.glb (static, unrigged; tools/rig_the_second.mjs skins it).
# Usage: python3 tools/bake_the_second.py <white_mesh.glb> [faces] [texsize]
import sys, numpy as np, trimesh, fast_simplification, xatlas
from PIL import Image, ImageFilter

SRC = sys.argv[1]
FACES = int(sys.argv[2]) if len(sys.argv) > 2 else 24000
TEX = int(sys.argv[3]) if len(sys.argv) > 3 else 1024
D = 'assets/characters/the-second/'

m = trimesh.load(SRC, force='mesh')
# keep the body and anything big attached to it; drop specks
parts = m.split(only_watertight=False)
big = max(len(p.faces) for p in parts)
m = trimesh.util.concatenate([p for p in parts if len(p.faces) > 0.01 * big])
print('source', len(m.vertices), 'verts', len(m.faces), 'faces', len(parts), 'parts')
dense = m.sample(600000)  # surface points for the visibility z-buffers

v, f = fast_simplification.simplify(m.vertices.astype(np.float32), m.faces.astype(np.int32), target_count=FACES)
low = trimesh.Trimesh(v, f, process=True)
print('decimated', len(low.vertices), 'verts', len(low.faces), 'faces')
vmap, idx, uv = xatlas.parametrize(low.vertices, low.faces)
V, N, F = low.vertices[vmap], low.vertex_normals[vmap], idx
lo, hi = low.bounds

def silhouette(img):
    a = np.asarray(img).astype(int); d = np.abs(a - a[5, 5]).sum(-1) > 40
    ys, xs = np.where(d); return xs.min(), xs.max(), ys.min(), ys.max()

# view: image, direction to the camera, (horizontal axis, sign), depth axis sign
VIEWS = {
  'front': (np.array([0, 0, 1.]), lambda P: P[:, 0], lo[0], hi[0]),
  'back':  (np.array([0, 0, -1.]), lambda P: -P[:, 0], -hi[0], -lo[0]),
  'right': (np.array([-1., 0, 0]), lambda P: P[:, 2], lo[2], hi[2]),   # the character's right side (dark arm)
  'left':  (np.array([1., 0, 0]), lambda P: -P[:, 2], -hi[2], -lo[2]), # the character's left side (metal arm)
}
views = []
for name, (dirv, hx, h0, h1) in VIEWS.items():
    img = Image.open(D + name + '.png').convert('RGB'); x0, x1, y0, y1 = silhouette(img)
    arr = np.asarray(img).astype(np.float32)
    def proj(P, hx=hx, h0=h0, h1=h1, x0=x0, x1=x1, y0=y0, y1=y1):
        px = x0 + (hx(P) - h0) / (h1 - h0) * (x1 - x0)
        py = y0 + (hi[1] - P[:, 1]) / (hi[1] - lo[1]) * (y1 - y0)
        return px, py
    # z-buffer on a 4 px grid from the dense surface samples
    C = 4; H, W = arr.shape[0] // C + 1, arr.shape[1] // C + 1
    px, py = proj(dense); dep = dense @ dirv
    zb = np.full((H, W), -1e9); ix = np.clip((px / C).astype(int), 0, W - 1); iy = np.clip((py / C).astype(int), 0, H - 1)
    np.maximum.at(zb, (iy, ix), dep)
    views.append((name, dirv, proj, arr, zb, C))

# rasterise the UV layout: position + normal for every covered texel
pos = np.zeros((TEX, TEX, 3), np.float32); nor = np.zeros((TEX, TEX, 3), np.float32); cov = np.zeros((TEX, TEX), bool)
T = uv * (TEX - 1); T[:, 1] = (TEX - 1) - T[:, 1]
for tri in F:
    a, b, c = T[tri]
    xmin, xmax = int(np.floor(min(a[0], b[0], c[0]))), int(np.ceil(max(a[0], b[0], c[0])))
    ymin, ymax = int(np.floor(min(a[1], b[1], c[1]))), int(np.ceil(max(a[1], b[1], c[1])))
    xs, ys = np.meshgrid(np.arange(xmin, xmax + 1), np.arange(ymin, ymax + 1)); xs = xs.ravel(); ys = ys.ravel()
    den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
    if abs(den) < 1e-12: continue
    w0 = ((b[1] - c[1]) * (xs - c[0]) + (c[0] - b[0]) * (ys - c[1])) / den
    w1 = ((c[1] - a[1]) * (xs - c[0]) + (a[0] - c[0]) * (ys - c[1])) / den
    w2 = 1 - w0 - w1; e = -0.02
    k = (w0 >= e) & (w1 >= e) & (w2 >= e) & (xs >= 0) & (ys >= 0) & (xs < TEX) & (ys < TEX)
    if not k.any(): continue
    W3 = np.stack([w0[k], w1[k], w2[k]], 1)
    pos[ys[k], xs[k]] = W3 @ V[tri]; nor[ys[k], xs[k]] = W3 @ N[tri]; cov[ys[k], xs[k]] = True
P = pos[cov]; Nn = nor[cov]; Nn /= np.linalg.norm(Nn, axis=1, keepdims=True) + 1e-9
acc = np.zeros((len(P), 3)); wsum = np.zeros(len(P)); best = np.full(len(P), -2.0); bestc = np.zeros((len(P), 3))
for name, dirv, proj, arr, zb, C in views:
    px, py = proj(P); d = P @ dirv
    ix = np.clip((px / C).astype(int), 0, zb.shape[1] - 1); iy = np.clip((py / C).astype(int), 0, zb.shape[0] - 1)
    vis = d >= zb[iy, ix] - 0.025
    col = arr[np.clip(py.astype(int), 0, arr.shape[0] - 1), np.clip(px.astype(int), 0, arr.shape[1] - 1)]
    bgd = np.abs(col - arr[5, 5]).sum(1) < 45; vis &= ~bgd  # never paint with the backdrop (silhouette edges)
    dot = Nn @ dirv; w = np.clip(dot, 0, 1) ** 4 * vis
    acc += col * w[:, None]; wsum += w
    upd = dot > best; best[upd] = dot[upd]; bestc[upd] = col[upd]  # fallback: the view it faces most
out = np.where(wsum[:, None] > 1e-4, acc / np.maximum(wsum, 1e-9)[:, None], bestc)
img = np.zeros((TEX, TEX, 3), np.float32); img[cov] = out
# pad the islands so mip-mapping doesn't bleed the background into seams
tex = Image.fromarray(img.clip(0, 255).astype(np.uint8)); mask = Image.fromarray((cov * 255).astype(np.uint8))
for _ in range(8):
    grown = tex.filter(ImageFilter.MaxFilter(3)); gm = mask.filter(ImageFilter.MaxFilter(3))
    tex = Image.composite(tex, grown, mask); mask = gm
print('coverage', cov.mean().round(3), 'texels unseen by any view', int((wsum <= 1e-4).sum()))

# feet on the ground, facing +Z
V2 = V.copy(); V2[:, 1] -= lo[1]; V2[:, 0] -= (lo[0] + hi[0]) / 2; V2[:, 2] -= (lo[2] + hi[2]) / 2
mat = trimesh.visual.material.PBRMaterial(baseColorTexture=tex, metallicFactor=0.25, roughnessFactor=0.6)
out_mesh = trimesh.Trimesh(V2, F, visual=trimesh.visual.TextureVisuals(uv=uv, material=mat), process=False)
out_mesh.export('build/the_second.glb')
tex.save('build/the_second_tex.png')
print('wrote build/the_second.glb')
