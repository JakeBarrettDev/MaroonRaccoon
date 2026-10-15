"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export const PACKET_URL = "/models/packet.glb";

const IDLE = "Idle_9";
const WAVE = "Wave_One_Hand";
const WAVE_BLEND = 0.4;
// Radians at full cursor deflection, split between neck and head so only the head turns.
const LOOK_YAW = 0.55;
const LOOK_PITCH = 0.22;
const LOOK_SPLIT = { Neck: 0.4, Head: 0.6 };

// Every so often while idling he gets distracted and glances off-screen, turning his
// shoulders a little too. Moving the mouse snaps his attention back.
const GLANCE_EVERY = [9, 15]; // seconds between glances
const GLANCE_HOLD = [1.8, 2.8]; // seconds spent looking away
const GLANCE_LOOK = { x: 1.0, y: 0.15 }; // in cursor units, i.e. past the edge of the screen
const GLANCE_BODY_YAW = 0.25; // radians of upper-body turn per cursor unit
const GLANCE_QUIET = 1.5; // seconds the mouse must be still first

const between = ([min, max]) => min + Math.random() * (max - min);

// Meshy's idle holds the hands palms-out with the thumbs pointing sideways. Twist each arm
// around its forearm (bone Y) axis until the thumbs face forward. The idle poses the hands
// asymmetrically, hence separate values; the twist is split between forearm and wrist.
const pose = { left: 1.6, right: -1.1 };

// Colour grade for the baked texture, which skews orange-red with grey, pinkish whites.
const GRADE = { redDepth: 0.83, redGreen: 0.35, redBlue: 0.08, whiteLift: 0.25 };

const turn = new THREE.Quaternion();
const turnEuler = new THREE.Euler();
const parentQuat = new THREE.Quaternion();
const localTurn = new THREE.Quaternion();
const twist = new THREE.Quaternion();
const Y_AXIS = new THREE.Vector3(0, 1, 0);

// Rotate a bone by a world-space rotation, layered on top of whatever the mixer posed.
function applyWorldTurn(bone, worldTurn) {
  bone.parent.getWorldQuaternion(parentQuat);
  localTurn.copy(parentQuat).invert().multiply(worldTurn).multiply(parentQuat);
  bone.quaternion.premultiply(localTurn);
}

const GRADE_GLSL = /* glsl */ `
  {
    vec3 c = pow(max(diffuseColor.rgb, 0.0), vec3(1.0 / 2.2));
    float hi = max(c.r, max(c.g, c.b));
    float lo = min(c.r, min(c.g, c.b));
    float sat = hi > 0.0 ? (hi - lo) / hi : 0.0;
    // Saturated, red-dominant texels: pull orange-red toward the brand maroon.
    float red = smoothstep(0.35, 0.6, sat) * step(c.g, c.r) * step(c.b, c.r);
    vec3 maroon = vec3(c.r * uRedDepth, c.g * uRedGreen, c.g * uRedGreen + c.r * uRedBlue);
    c = mix(c, maroon, red);
    // Bright, unsaturated texels (fur, strings): strip the tint and lift toward clean white.
    float white = (1.0 - smoothstep(0.08, 0.25, sat)) * smoothstep(0.45, 0.75, hi);
    vec3 neutral = vec3(dot(c, vec3(0.299, 0.587, 0.114)));
    c = mix(c, min(neutral * (1.0 + uWhiteLift) + uWhiteLift * 0.3, 1.0), white);
    diffuseColor.rgb = pow(c, vec3(2.2));
  }
`;

function Packet({ onReady }) {
  const group = useRef(null);
  const { scene, animations } = useGLTF(PACKET_URL);
  const { actions } = useAnimations(animations, group);
  const pointer = useRef({ x: 0, y: 0 });
  const look = useRef({ x: 0, y: 0 });
  const trickTimer = useRef(0);
  const glance = useRef({ active: false, side: 1, at: 0, until: 0, blend: 0, lastMove: 0 });
  const canvas = useThree((state) => state.gl.domElement);

  // Normalise size and position so the model fills the stage regardless of export scale.
  const { fit, bones } = useMemo(() => {
    const found = {};
    const grade = {
      uRedDepth: { value: GRADE.redDepth },
      uRedGreen: { value: GRADE.redGreen },
      uRedBlue: { value: GRADE.redBlue },
      uWhiteLift: { value: GRADE.whiteLift },
    };
    scene.traverse((obj) => {
      if (obj.isSkinnedMesh) {
        obj.frustumCulled = false;
        const mat = obj.material;
        // The export leaves metalness unset, which glTF treats as fully metallic: with
        // nothing to reflect he renders dull and grey. Make it a matte, non-metal surface.
        mat.metalness = 0;
        mat.roughness = 0.75;
        mat.specularIntensity = 0.4;
        mat.specularColor?.set(1, 1, 1);
        // Meshy also copies the texture into emissive at full strength; drop it so the
        // lights give him shape instead of a flat, self-lit look.
        mat.emissiveIntensity = 0;
        mat.onBeforeCompile = (shader) => {
          Object.assign(shader.uniforms, grade);
          shader.fragmentShader = shader.fragmentShader
            .replace("void main() {", "uniform float uRedDepth;\nuniform float uRedGreen;\nuniform float uRedBlue;\nuniform float uWhiteLift;\nvoid main() {")
            .replace("#include <map_fragment>", "#include <map_fragment>\n" + GRADE_GLSL);
        };
        mat.needsUpdate = true;
      }
      const name = obj.name.replace("mixamorig:", "mixamorig");
      for (const bone of ["Spine2", "Neck", "Head", "LeftForeArm", "LeftHand", "RightForeArm", "RightHand"]) {
        if (name === `mixamorig${bone}`) found[bone] = obj;
      }
    });
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const scale = 2.75 / size.y;
    const center = box.getCenter(new THREE.Vector3());
    return {
      bones: found,
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
      const g = glance.current;
      g.lastMove = performance.now() / 1000;
      if (g.active) {
        g.active = false;
        g.at = g.lastMove + between(GLANCE_EVERY);
      }
      const rect = canvas.getBoundingClientRect();
      pointer.current.x = clamp((event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2));
      pointer.current.y = clamp((event.clientY - (rect.top + rect.height * 0.3)) / (window.innerHeight / 2));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [canvas]);

  const wave = (event) => {
    event.stopPropagation();
    const idle = actions[IDLE];
    const hello = actions[WAVE];
    if (!idle || !hello || hello.isRunning()) return;
    hello.reset().setLoop(THREE.LoopOnce, 1).play();
    idle.crossFadeTo(hello, 0.3, false);
    clearTimeout(trickTimer.current);
    // Start blending back to idle just before the wave ends.
    const ms = (hello.getClip().duration - WAVE_BLEND) * 1000;
    trickTimer.current = setTimeout(() => {
      idle.reset().play();
      hello.crossFadeTo(idle, WAVE_BLEND, false);
      trickTimer.current = setTimeout(() => hello.stop(), WAVE_BLEND * 1000 + 50);
    }, ms);
  };

  // Runs after the animation mixer each frame, so these corrections layer on top of the pose.
  useFrame((_, delta) => {
    const now = performance.now() / 1000;
    const g = glance.current;
    const waving = actions[WAVE]?.isRunning();
    if (!g.at) g.at = now + between([6, 9]);
    if (!g.active && now >= g.at) {
      if (!waving && now - g.lastMove > GLANCE_QUIET) {
        g.active = true;
        g.side = Math.random() < 0.5 ? -1 : 1;
        g.until = now + between(GLANCE_HOLD);
      } else {
        g.at = now + 2; // busy; try again shortly
      }
    }
    if (g.active && (now >= g.until || waving)) {
      g.active = false;
      g.at = now + between(GLANCE_EVERY);
    }
    g.blend += ((g.active ? 1 : 0) - g.blend) * (1 - Math.exp(-delta * 3));

    const target = g.active ? { x: g.side * GLANCE_LOOK.x, y: GLANCE_LOOK.y } : pointer.current;
    // Turning away is lazier than tracking the cursor.
    const ease = 1 - Math.exp(-delta * (g.active ? 2.5 : 5));
    look.current.x += (target.x - look.current.x) * ease;
    look.current.y += (target.y - look.current.y) * ease;

    // Upper body first, so the neck and head turns below build on the new chest angle.
    if (bones.Spine2 && g.blend > 0.001) {
      turnEuler.set(0, look.current.x * GLANCE_BODY_YAW * g.blend, 0, "YXZ");
      applyWorldTurn(bones.Spine2, turn.setFromEuler(turnEuler));
    }

    for (const [name, share] of Object.entries(LOOK_SPLIT)) {
      const bone = bones[name];
      if (!bone) continue;
      // Built in world space (screen up/right) since the rig's local axes don't match the screen.
      turnEuler.set(look.current.y * LOOK_PITCH * share, look.current.x * LOOK_YAW * share, 0, "YXZ");
      applyWorldTurn(bone, turn.setFromEuler(turnEuler));
    }

    // Only while idling (fading with it), so the wave keeps its own hand motion.
    const weight = actions[IDLE]?.getEffectiveWeight() ?? 0;
    if (weight) {
      for (const [side, angle] of [["Left", pose.left], ["Right", pose.right]]) {
        const half = (angle * weight) / 2;
        bones[`${side}ForeArm`]?.quaternion.multiply(twist.setFromAxisAngle(Y_AXIS, half));
        bones[`${side}Hand`]?.quaternion.multiply(twist.setFromAxisAngle(Y_AXIS, half));
      }
    }
  });

  return (
    <group
      ref={group}
      onClick={wave}
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
        <hemisphereLight args={["#ffffff", "#3a3632", 1.6]} />
        <directionalLight position={[2.5, 4, 5]} intensity={2.4} />
        <directionalLight position={[-3, 2, 3]} intensity={0.8} />
        <directionalLight position={[-2, 3, -4]} intensity={1.2} />
        <Suspense fallback={null}>
          <Packet onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
