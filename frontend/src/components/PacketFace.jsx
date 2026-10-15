"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// Expression art, painted over his face. Packet's own painted face shows when none is active.
const FACES = {
  wink: "/models/faces/wink.png",
  happy: "/models/faces/happy.png",
  worried: "/models/faces/worried.png",
};

// Where the art sits, as fractions of the rigid head's bounding box (bind pose):
// cx/cy centre, w/h size, lift = how far it floats off the surface.
const faceRect = { cx: 0.5, cy: 0.36, w: 0.95, h: 0.75, lift: 0.006 };
const SEGMENTS = 40;

function headWeight(skinIndex, skinWeight, i, head) {
  let w = 0;
  if (skinIndex.getX(i) === head) w += skinWeight.getX(i);
  if (skinIndex.getY(i) === head) w += skinWeight.getY(i);
  if (skinIndex.getZ(i) === head) w += skinWeight.getZ(i);
  if (skinIndex.getW(i) === head) w += skinWeight.getW(i);
  return w;
}

// Shrink-wrap a grid onto the front of the head by casting rays at the bind-pose mesh,
// then express it in the Head bone's space so it can ride along as the bone's child.
function buildFaceGeometry(skinned, headBone, rect) {
  const geo = skinned.geometry;
  const head = skinned.skeleton.bones.indexOf(headBone);
  const { position, skinIndex, skinWeight } = geo.attributes;
  const index = geo.index;

  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    if (headWeight(skinIndex, skinWeight, i, head) > 0.99) box.expandByPoint(v.fromBufferAttribute(position, i));
  }
  const size = box.getSize(new THREE.Vector3());
  const midZ = (box.min.z + box.max.z) / 2;

  // Only the front half of the head is worth testing rays against.
  const tris = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let t = 0; t < index.count; t += 3) {
    a.fromBufferAttribute(position, index.getX(t));
    b.fromBufferAttribute(position, index.getX(t + 1));
    c.fromBufferAttribute(position, index.getX(t + 2));
    if (a.z > midZ && b.z > midZ && c.z > midZ && a.y > box.min.y && b.y > box.min.y && c.y > box.min.y) {
      tris.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    }
  }
  const front = new THREE.BufferGeometry();
  front.setAttribute("position", new THREE.Float32BufferAttribute(tris, 3));
  const probe = new THREE.Mesh(front, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));

  const toBone = new THREE.Matrix4().copy(skinned.skeleton.boneInverses[head]).multiply(skinned.bindMatrix);
  const width = rect.w * size.x;
  const height = rect.h * size.y;
  const x0 = box.min.x + rect.cx * size.x - width / 2;
  const y0 = box.min.y + rect.cy * size.y - height / 2;
  const raycaster = new THREE.Raycaster();
  const down = new THREE.Vector3(0, 0, -1);
  const positions = [];
  const uvs = [];
  for (let j = 0; j <= SEGMENTS; j++) {
    for (let i = 0; i <= SEGMENTS; i++) {
      const u = i / SEGMENTS;
      const w = j / SEGMENTS;
      raycaster.set(new THREE.Vector3(x0 + u * width, y0 + w * height, box.max.z + size.z), down);
      const hit = raycaster.intersectObject(probe, false)[0];
      const p = hit ? hit.point.clone() : new THREE.Vector3(x0 + u * width, y0 + w * height, box.max.z);
      p.z += rect.lift * size.y;
      p.applyMatrix4(toBone);
      positions.push(p.x, p.y, p.z);
      uvs.push(u, w);
    }
  }
  const indices = [];
  const row = SEGMENTS + 1;
  for (let j = 0; j < SEGMENTS; j++) {
    for (let i = 0; i < SEGMENTS; i++) {
      const k = j * row + i;
      indices.push(k, k + 1, k + row, k + 1, k + row + 1, k + row);
    }
  }
  front.dispose();
  probe.material.dispose();

  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  out.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  out.setIndex(indices);
  out.computeVertexNormals();
  return out;
}

export default function PacketFace({ skinned, head, expression }) {
  const textures = useTexture(FACES, (loaded) => {
    for (const tex of Object.values(loaded)) {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
    }
  });
  const [version, setVersion] = useState(0);
  const geometry = useMemo(() => buildFaceGeometry(skinned, head, faceRect), [skinned, head, version]); // eslint-disable-line react-hooks/exhaustive-deps
  const material = useRef(null);
  const forced = useRef(null);
  const cap = useRef(1);
  const camera = useThree((state) => state.camera);

  useEffect(() => () => geometry.dispose(), [geometry]);

  // Dev-only handle for lining the art up with his painted features.
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    window.__packetFace = {
      rect: faceRect,
      rebuild: () => setVersion((n) => n + 1),
      force: (name) => (forced.current = name),
      cap: (value) => (cap.current = value),
      camera,
      head,
    };
    return () => delete window.__packetFace;
  }, [camera, head]);

  useFrame((_, delta) => {
    const mat = material.current;
    if (!mat) return;
    const want = forced.current ?? expression.current;
    if (want && textures[want] && mat.map !== textures[want]) {
      mat.map = textures[want];
      mat.needsUpdate = true;
    }
    mat.opacity += ((want ? cap.current : 0) - mat.opacity) * (1 - Math.exp(-delta * 14));
    mat.visible = mat.opacity > 0.01;
  });

  return createPortal(
    <mesh geometry={geometry} renderOrder={2}>
      <meshStandardMaterial
        ref={material}
        transparent
        opacity={0}
        roughness={0.75}
        metalness={0}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-4}
        polygonOffsetUnits={-4}
      />
    </mesh>,
    head
  );
}
