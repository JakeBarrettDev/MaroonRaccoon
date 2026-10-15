"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export const PACKET_URL = "/models/packet.glb";

const IDLE = "Idle_9";
const TRICKS = ["Running", "Walking"];
const TRICK_MS = 1600;
// Radians at full cursor deflection.
const BODY_YAW = 0.3;
const HEAD_YAW = 0.3;
const HEAD_PITCH = 0.18;

const headTurn = new THREE.Quaternion();
const headEuler = new THREE.Euler();
const parentQuat = new THREE.Quaternion();
const localTurn = new THREE.Quaternion();

function Packet({ onReady }) {
  const group = useRef(null);
  const { scene, animations } = useGLTF(PACKET_URL);
  const { actions } = useAnimations(animations, group);
  const pointer = useRef({ x: 0, y: 0 });
  const look = useRef({ x: 0, y: 0 });
  const trickTimer = useRef(0);
  const trickIndex = useRef(0);
  const canvas = useThree((state) => state.gl.domElement);

  // Normalise size and position so the model fills the stage regardless of export scale.
  const { fit, head } = useMemo(() => {
    let headBone = null;
    scene.traverse((obj) => {
      if (obj.isSkinnedMesh) {
        obj.frustumCulled = false;
        // Meshy exports bake the texture into emissive at full strength, which
        // flattens the shading. Keep a little glow so he still pops on the dark page.
        obj.material.emissiveIntensity = 0.3;
      }
      if (obj.name === "mixamorigHead" || obj.name === "mixamorig:Head") headBone = obj;
    });
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const scale = 2.75 / size.y;
    const center = box.getCenter(new THREE.Vector3());
    return {
      head: headBone,
      // Feet land on the medallion's CSS ground shadow.
      fit: { scale, x: -center.x * scale, y: -box.min.y * scale - 1.38, z: -center.z * scale },
    };
  }, [scene]);

  useEffect(() => {
    const idle = actions[IDLE];
    idle?.reset().fadeIn(0.3).play();
    // Wait two frames so the first painted frame already shows the posed model.
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => onReady?.());
    });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(trickTimer.current);
      idle?.fadeOut(0.2);
    };
  }, [actions, onReady]);

  useEffect(() => {
    const clamp = (value) => Math.max(-1, Math.min(1, value));
    // Measured from Packet himself (like the medallion tilt), not the window center.
    const onMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current.x = clamp((event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2));
      pointer.current.y = clamp((event.clientY - (rect.top + rect.height * 0.3)) / (window.innerHeight / 2));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [canvas]);

  const doTrick = (event) => {
    event.stopPropagation();
    const idle = actions[IDLE];
    const name = TRICKS[trickIndex.current++ % TRICKS.length];
    const trick = actions[name];
    if (!idle || !trick || trick.isRunning()) return;
    trick.reset().setLoop(THREE.LoopRepeat, Infinity).play();
    idle.crossFadeTo(trick, 0.25, false);
    clearTimeout(trickTimer.current);
    trickTimer.current = setTimeout(() => {
      idle.reset().play();
      trick.crossFadeTo(idle, 0.35, false);
      trickTimer.current = setTimeout(() => trick.stop(), 400);
    }, TRICK_MS);
  };

  // Runs after the animation mixer each frame, so the look-at adds on top of the idle pose.
  useFrame((_, delta) => {
    const ease = 1 - Math.exp(-delta * 5);
    look.current.x += (pointer.current.x - look.current.x) * ease;
    look.current.y += (pointer.current.y - look.current.y) * ease;
    if (group.current) group.current.rotation.y = look.current.x * BODY_YAW;
    if (head) {
      // Build the turn in world space (screen up/right), then convert it into the
      // head bone's parent space, since the rig's local bone axes don't match the screen.
      headEuler.set(look.current.y * HEAD_PITCH, look.current.x * HEAD_YAW, 0, "YXZ");
      headTurn.setFromEuler(headEuler);
      head.parent.getWorldQuaternion(parentQuat);
      localTurn.copy(parentQuat).invert().multiply(headTurn).multiply(parentQuat);
      head.quaternion.premultiply(localTurn);
    }
  });

  return (
    <group
      ref={group}
      onClick={doTrick}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <primitive object={scene} scale={fit.scale} position={[fit.x, fit.y, fit.z]} />
    </group>
  );
}

export default function PacketScene({ onReady }) {
  const wrapRef = useRef(null);
  const [visible, setVisible] = useState(true);

  // Stop rendering entirely while the hero is scrolled out of view.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <div ref={wrapRef} className="packet-canvas" aria-hidden="true">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.15, 6], fov: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power", toneMapping: THREE.NeutralToneMapping }}
      >
        <hemisphereLight args={["#fff1e6", "#2a0606", 1.4]} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} />
        <directionalLight position={[-4, 2, -3]} intensity={1.6} color="#ff4a3a" />
        <Suspense fallback={null}>
          <Packet onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
