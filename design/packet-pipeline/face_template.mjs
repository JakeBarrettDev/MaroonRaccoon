// Render Packet's own face, flattened into the exact frame the expression overlay uses,
// so expression art can be painted over it and line up with the 3D head.
//
// Usage (from the repo root, after fix_packet.py has produced a fixed GLB):
//   node design/packet-pipeline/face_template.mjs <fixed.glb> <out.png>
//
// Keep FACE_RECT in sync with faceRect in frontend/src/components/PacketFace.jsx.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(new URL("../../frontend/package.json", import.meta.url));
const sharp = require("sharp");

const FACE_RECT = { cx: 0.5, cy: 0.36, w: 0.95, h: 0.75 };
const OUT_W = 1024;
// Same colour grade the 3D model gets, so painted art matches what's on screen.
const GRADE = { redDepth: 0.83, redGreen: 0.35, redBlue: 0.08, whiteLift: 0.25 };

const [src, out] = process.argv.slice(2);
const buf = readFileSync(src);
const jsonLen = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.subarray(20, 20 + jsonLen).toString());
const binStart = 20 + jsonLen + 8;
const COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
const READ = {
  5121: [1, (o) => buf.readUInt8(o)],
  5123: [2, (o) => buf.readUInt16LE(o)],
  5125: [4, (o) => buf.readUInt32LE(o)],
  5126: [4, (o) => buf.readFloatLE(o)],
};

function accessor(index) {
  const a = gltf.accessors[index];
  const view = gltf.bufferViews[a.bufferView];
  const n = COMPONENTS[a.type];
  const [size, read] = READ[a.componentType];
  const stride = view.byteStride || n * size;
  const base = binStart + (view.byteOffset || 0) + (a.byteOffset || 0);
  const rows = [];
  for (let i = 0; i < a.count; i++) {
    const row = [];
    for (let k = 0; k < n; k++) row.push(read(base + i * stride + k * size));
    rows.push(row);
  }
  return rows;
}

const prim = gltf.meshes[0].primitives[0];
const pos = accessor(prim.attributes.POSITION);
const uv = accessor(prim.attributes.TEXCOORD_0);
const joints = accessor(prim.attributes.JOINTS_0);
const weights = accessor(prim.attributes.WEIGHTS_0);
const idx = accessor(prim.indices).map((r) => r[0]);
const names = gltf.skins[0].joints.map((j) => gltf.nodes[j].name.replace("mixamorig:", ""));
const head = names.indexOf("Head");

// Rigid-head bounding box, exactly as PacketFace computes it.
const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
pos.forEach((p, i) => {
  const w = joints[i].reduce((sum, j, k) => sum + (j === head ? weights[i][k] : 0), 0);
  if (w > 0.99) for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], p[k]); max[k] = Math.max(max[k], p[k]); }
});
const size = max.map((v, k) => v - min[k]);
const midZ = (min[2] + max[2]) / 2;
const width = FACE_RECT.w * size[0], height = FACE_RECT.h * size[1];
const x0 = min[0] + FACE_RECT.cx * size[0] - width / 2;
const y0 = min[1] + FACE_RECT.cy * size[1] - height / 2;
const OUT_H = Math.round((OUT_W * height) / width);

// Model texture, decoded once.
const image = gltf.images[gltf.textures[gltf.materials[0].pbrMetallicRoughness.baseColorTexture.index].source];
const view = gltf.bufferViews[image.bufferView];
const pngBytes = buf.subarray(binStart + (view.byteOffset || 0), binStart + (view.byteOffset || 0) + view.byteLength);
const { data: tex, info } = await sharp(pngBytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

function sample(u, v) {
  const x = Math.min(info.width - 1, Math.max(0, Math.round(u * (info.width - 1))));
  const y = Math.min(info.height - 1, Math.max(0, Math.round(v * (info.height - 1)))); // glTF UV origin is top-left
  const o = (y * info.width + x) * 4;
  return [tex[o], tex[o + 1], tex[o + 2]];
}

function grade([r, g, b]) {
  let c = [r / 255, g / 255, b / 255];
  const hi = Math.max(...c), lo = Math.min(...c);
  const sat = hi > 0 ? (hi - lo) / hi : 0;
  const smooth = (a, b2, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b2 - a))); return t * t * (3 - 2 * t); };
  const red = smooth(0.35, 0.6, sat) * (c[1] <= c[0] ? 1 : 0) * (c[2] <= c[0] ? 1 : 0);
  const maroon = [c[0] * GRADE.redDepth, c[1] * GRADE.redGreen, c[1] * GRADE.redGreen + c[0] * GRADE.redBlue];
  c = c.map((v, k) => v + (maroon[k] - v) * red);
  const white = (1 - smooth(0.08, 0.25, sat)) * smooth(0.45, 0.75, hi);
  const neutral = c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114;
  const lifted = Math.min(neutral * (1 + GRADE.whiteLift) + GRADE.whiteLift * 0.3, 1);
  c = c.map((v) => v + (lifted - v) * white);
  return c.map((v) => Math.round(v * 255));
}

// Orthographic raster of the front of the head into the overlay frame (z-buffered).
const outBuf = Buffer.alloc(OUT_W * OUT_H * 4);
const depth = new Float32Array(OUT_W * OUT_H).fill(-Infinity);
const toPx = (p) => [((p[0] - x0) / width) * OUT_W, (1 - (p[1] - y0) / height) * OUT_H, p[2]];
for (let t = 0; t < idx.length; t += 3) {
  const [ia, ib, ic] = [idx[t], idx[t + 1], idx[t + 2]];
  if (pos[ia][2] <= midZ || pos[ib][2] <= midZ || pos[ic][2] <= midZ) continue;
  const [A, B, C] = [toPx(pos[ia]), toPx(pos[ib]), toPx(pos[ic])];
  const area = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]);
  if (Math.abs(area) < 1e-9) continue;
  const xs = [A[0], B[0], C[0]], ys = [A[1], B[1], C[1]];
  for (let y = Math.max(0, Math.floor(Math.min(...ys))); y <= Math.min(OUT_H - 1, Math.ceil(Math.max(...ys))); y++) {
    for (let x = Math.max(0, Math.floor(Math.min(...xs))); x <= Math.min(OUT_W - 1, Math.ceil(Math.max(...xs))); x++) {
      const px = x + 0.5, py = y + 0.5;
      const w0 = ((B[0] - px) * (C[1] - py) - (C[0] - px) * (B[1] - py)) / area;
      const w1 = ((C[0] - px) * (A[1] - py) - (A[0] - px) * (C[1] - py)) / area;
      const w2 = 1 - w0 - w1;
      if (w0 < 0 || w1 < 0 || w2 < 0) continue;
      const z = w0 * A[2] + w1 * B[2] + w2 * C[2];
      const k = y * OUT_W + x;
      if (z <= depth[k]) continue;
      depth[k] = z;
      const u = w0 * uv[ia][0] + w1 * uv[ib][0] + w2 * uv[ic][0];
      const v = w0 * uv[ia][1] + w1 * uv[ib][1] + w2 * uv[ic][1];
      const [r, g, b] = grade(sample(u, v));
      outBuf[k * 4] = r; outBuf[k * 4 + 1] = g; outBuf[k * 4 + 2] = b; outBuf[k * 4 + 3] = 255;
    }
  }
}
await sharp(outBuf, { raw: { width: OUT_W, height: OUT_H, channels: 4 } }).png().toFile(out);
console.log(`wrote ${out} (${OUT_W}x${OUT_H})`);
