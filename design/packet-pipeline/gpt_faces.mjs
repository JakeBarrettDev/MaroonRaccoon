// Round-trip Packet's face template through an AI image editor (e.g. ChatGPT).
//
//   node design/packet-pipeline/gpt_faces.mjs pad
//     Writes design/packet-faces/face-template-gpt.png: the template centred on a flat
//     green 1536x1024 canvas (a size ChatGPT can return).
//
//   node design/packet-pipeline/gpt_faces.mjs import <edited.png> <name>
//     Finds the face in the editor's output (it may have shifted or rescaled it), lines it
//     back up with the template, colour-matches it to Packet's real face, removes the
//     green, feathers the edge and writes frontend/public/models/faces/<name>.webp.
import { mkdirSync } from "node:fs";
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

// Bounding box of "face" pixels, ignoring rows/columns with only a sliver of hits
// (editors leave faint lines and fringes along the canvas edges).
function faceBox({ data, width, height }, isFace) {
  const rows = new Array(height).fill(0);
  const cols = new Array(width).fill(0);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (isFace(data, (y * width + x) * 4)) { rows[y]++; cols[x]++; }
  }
  const first = (arr, min) => arr.findIndex((n) => n > min);
  const last = (arr, min) => arr.length - 1 - [...arr].reverse().findIndex((n) => n > min);
  const rowMin = width * 0.03, colMin = height * 0.03;
  return { x0: first(cols, colMin), x1: last(cols, colMin), y0: first(rows, rowMin), y1: last(rows, rowMin) };
}

// Coarse colour classes, so the template and an edit can be compared despite small
// tone shifts: 0 background, 1 white fur, 2 red fur, 3 dark (eye masks, nose), 4 other.
function classify(r, g, b, a = 255) {
  if (a < 128 || isGreen(r, g, b)) return 0;
  if (r > 170 && g > 170 && b > 170) return 1;
  if (r > 100 && r > g * 1.8 && r > b * 1.5) return 2;
  if (Math.max(r, g, b) < 80) return 3;
  return 4;
}

// Refine the bounding-box guess by searching position and scale for the best agreement
// with the template's colour classes (fur, markings and outline the edit didn't change).
function align(tpl, src, guess) {
  const STEP = 3; // sample every 3rd template pixel
  const samples = [];
  for (let y = 0; y < tpl.height; y += STEP) for (let x = 0; x < tpl.width; x += STEP) {
    const o = (y * tpl.width + x) * 4;
    samples.push(x + 0.5, y + 0.5, classify(tpl.data[o], tpl.data[o + 1], tpl.data[o + 2], tpl.data[o + 3]));
  }
  const srcClass = new Uint8Array(src.width * src.height);
  for (let i = 0; i < srcClass.length; i++) srcClass[i] = classify(src.data[i * 4], src.data[i * 4 + 1], src.data[i * 4 + 2]);
  const score = ({ left, top, sx, sy }) => {
    let hit = 0;
    for (let i = 0; i < samples.length; i += 3) {
      const gx = Math.round(left + samples[i] * sx), gy = Math.round(top + samples[i + 1] * sy);
      const c = gx >= 0 && gy >= 0 && gx < src.width && gy < src.height ? srcClass[gy * src.width + gx] : 0;
      if (c === samples[i + 2]) hit++;
    }
    return hit / (samples.length / 3);
  };
  let best = { ...guess };
  let bestScore = score(best);
  const steps = { left: 24, top: 24, sx: 0.06, sy: 0.06 };
  for (let round = 0; round < 7; round++) {
    let improved = true;
    while (improved) {
      improved = false;
      for (const key of Object.keys(steps)) {
        for (const dir of [-1, 1]) {
          const trial = { ...best, [key]: best[key] + dir * steps[key] };
          const s = score(trial);
          if (s > bestScore) { best = trial; bestScore = s; improved = true; }
        }
      }
    }
    for (const key of Object.keys(steps)) steps[key] /= 2;
  }
  return { ...best, score: bestScore, guessScore: score(guess) };
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

  // Line up: start from the bounding boxes, then refine against the template's markings.
  const t = faceBox(tpl, (d, o) => d[o + 3] > 128);
  const g = faceBox(src, (d, o) => !isGreen(d[o], d[o + 1], d[o + 2]));
  const gsx = (g.x1 - g.x0) / (t.x1 - t.x0);
  const gsy = (g.y1 - g.y0) / (t.y1 - t.y0);
  const fit = align(tpl, src, { left: g.x0 - t.x0 * gsx, top: g.y0 - t.y0 * gsy, sx: gsx, sy: gsy });
  const { left, top, sx, sy } = fit;
  console.log(
    `aligned: scale ${sx.toFixed(3)} x ${sy.toFixed(3)}, offset ${left.toFixed(0)},${top.toFixed(0)}; ` +
      `match ${(fit.guessScore * 100).toFixed(1)}% -> ${(fit.score * 100).toFixed(1)}%`
  );

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
  const blurred = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } }).blur(FEATHER / 2).extractChannel(0).raw().toBuffer();
  const feather = (i) => Math.max(0, Math.min(1, (blurred[i] / 255 - 0.5) * 2.2)) * (alpha[i] / 255);

  // Colour-match against the template wherever both show the same fur (white or red), so
  // changed features and any stray background can't skew it.
  const sum = { src: [0, 0, 0], tpl: [0, 0, 0], n: 0 };
  for (let i = 0; i < W * H; i++) {
    const o = i * 4;
    const tc = classify(tpl.data[o], tpl.data[o + 1], tpl.data[o + 2], tpl.data[o + 3]);
    if ((tc === 1 || tc === 2) && classify(out[o], out[o + 1], out[o + 2]) === tc) {
      for (let c = 0; c < 3; c++) { sum.src[c] += out[o + c]; sum.tpl[c] += tpl.data[o + c]; }
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
  mkdirSync(FACES_DIR, { recursive: true });
  const dest = `${FACES_DIR}${name}.webp`;
  await sharp(out, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 90, alphaQuality: 100 }).toFile(dest);
  console.log(`wrote ${dest}`);
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === "pad") await pad();
else if (cmd === "import" && args.length === 2) await importFace(...args);
else console.log("usage: gpt_faces.mjs pad | gpt_faces.mjs import <edited.png> <name>");
