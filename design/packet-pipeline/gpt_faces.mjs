// Round-trip Packet's face template through an AI image editor (e.g. ChatGPT).
//
//   node design/packet-pipeline/gpt_faces.mjs pad
//     Writes design/packet-faces/face-template-gpt.png: the template centred on a flat
//     green 1536x1024 canvas (a size ChatGPT can return).
//
//   node design/packet-pipeline/gpt_faces.mjs import <edited.png> <name>
//     Finds the face in the editor's output (it may have shifted or rescaled it), lines it
//     back up with the template, colour-matches it to Packet's real face, removes the
//     green, feathers the edge and writes frontend/public/models/faces/<name>.png.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(new URL("../../frontend/package.json", import.meta.url));
const sharp = require("sharp");
const here = (p) => fileURLToPath(new URL(p, import.meta.url));

const TEMPLATE = here("../packet-faces/face-template.png");
const GPT_TEMPLATE = here("../packet-faces/face-template-gpt.png");
const FACES_DIR = here("../../frontend/public/models/faces/");
const CANVAS = { width: 1536, height: 1024 };
const GREEN = { r: 0, g: 177, b: 64 };
const FEATHER = 18; // px (at template size) over which the art fades into the model's own face

const isGreen = (r, g, b) => g > 110 && g > r * 1.5 && g > b * 1.4;

async function rgba(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

// Bounding box of "face" pixels, ignoring rows/columns with only a few stray hits.
function faceBox({ data, width, height }, isFace) {
  const rows = new Array(height).fill(0);
  const cols = new Array(width).fill(0);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (isFace(data, (y * width + x) * 4)) { rows[y]++; cols[x]++; }
  }
  const first = (arr) => arr.findIndex((n) => n > 3);
  const last = (arr) => arr.length - 1 - [...arr].reverse().findIndex((n) => n > 3);
  return { x0: first(cols), x1: last(cols), y0: first(rows), y1: last(rows) };
}

async function pad() {
  const meta = await sharp(TEMPLATE).metadata();
  const width = CANVAS.width - 128;
  const height = Math.round((width * meta.height) / meta.width);
  const face = await sharp(TEMPLATE).resize(width, height).flatten({ background: GREEN }).toBuffer();
  await sharp({ create: { ...CANVAS, channels: 3, background: GREEN } })
    .composite([{ input: face, left: 64, top: Math.round((CANVAS.height - height) / 2) }])
    .png()
    .toFile(GPT_TEMPLATE);
  console.log(`wrote ${GPT_TEMPLATE} (${CANVAS.width}x${CANVAS.height})`);
}

async function importFace(input, name) {
  const tpl = await rgba(TEMPLATE);
  const { width: W, height: H } = tpl;
  const src = await rgba(input);

  // Line up: the face's bounding box in the edit corresponds to the template's.
  const t = faceBox(tpl, (d, o) => d[o + 3] > 128);
  const g = faceBox(src, (d, o) => !isGreen(d[o], d[o + 1], d[o + 2]));
  const sx = (g.x1 - g.x0) / (t.x1 - t.x0);
  const sy = (g.y1 - g.y0) / (t.y1 - t.y0);
  const left = g.x0 - t.x0 * sx;
  const top = g.y0 - t.y0 * sy;
  console.log(`face found at ${g.x0},${g.y0}-${g.x1},${g.y1}; scale ${sx.toFixed(3)} x ${sy.toFixed(3)}`);

  // Resample the edit into the template frame (bilinear).
  const out = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const fx = Math.min(src.width - 1.001, Math.max(0, left + (x + 0.5) * sx - 0.5));
    const fy = Math.min(src.height - 1.001, Math.max(0, top + (y + 0.5) * sy - 0.5));
    const ix = Math.floor(fx), iy = Math.floor(fy), ax = fx - ix, ay = fy - iy;
    const o = (y * W + x) * 4;
    for (let c = 0; c < 3; c++) {
      const p = (xx, yy) => src.data[(yy * src.width + xx) * 4 + c];
      out[o + c] = Math.round(
        p(ix, iy) * (1 - ax) * (1 - ay) + p(ix + 1, iy) * ax * (1 - ay) + p(ix, iy + 1) * (1 - ax) * ay + p(ix + 1, iy + 1) * ax * ay
      );
    }
  }

  // Feathered mask: inside the template's silhouette, fading out toward its edge.
  const alpha = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) alpha[i] = tpl.data[i * 4 + 3];
  const blurred = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } }).blur(FEATHER / 2).raw().toBuffer();
  const feather = (i) => Math.max(0, Math.min(1, (blurred[i] / 255 - 0.5) * 2.2)) * (alpha[i] / 255);

  // Colour-match against the template in the edge band, where the art should be unchanged.
  const sum = { src: [0, 0, 0], tpl: [0, 0, 0], n: 0 };
  for (let i = 0; i < W * H; i++) {
    const f = feather(i);
    if (alpha[i] > 250 && f > 0.05 && f < 0.95) {
      for (let c = 0; c < 3; c++) { sum.src[c] += out[i * 4 + c]; sum.tpl[c] += tpl.data[i * 4 + c]; }
      sum.n++;
    }
  }
  const gain = sum.src.map((v, c) => (sum.n && v ? Math.min(1.3, Math.max(0.77, sum.tpl[c] / v)) : 1));
  console.log(`colour gain r${gain[0].toFixed(2)} g${gain[1].toFixed(2)} b${gain[2].toFixed(2)}`);

  for (let i = 0; i < W * H; i++) {
    const o = i * 4;
    let [r, gg, b] = [out[o], out[o + 1], out[o + 2]];
    const keyed = isGreen(r, gg, b) ? 0 : 1;
    gg = Math.min(gg, Math.max(r, b) + 20); // knock out green spill on antialiased edges
    out[o] = Math.min(255, Math.round(r * gain[0]));
    out[o + 1] = Math.min(255, Math.round(gg * gain[1]));
    out[o + 2] = Math.min(255, Math.round(b * gain[2]));
    out[o + 3] = Math.round(255 * keyed * feather(i));
  }
  const dest = `${FACES_DIR}${name}.png`;
  await sharp(out, { raw: { width: W, height: H, channels: 4 } }).png().toFile(dest);
  console.log(`wrote ${dest}`);
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === "pad") await pad();
else if (cmd === "import" && args.length === 2) await importFace(...args);
else console.log("usage: gpt_faces.mjs pad | gpt_faces.mjs import <edited.png> <name>");
