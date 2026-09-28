"use client";
import { useEffect, useRef } from "react";

const DEPTH_LAYERS = 12;

const glyphs = [
  { text: "</>", left: "0%", top: "12%", depth: 28, size: "1.6rem", duration: "6s", accent: true },
  { text: "{ }", left: "86%", top: "4%", depth: -20, size: "1.2rem", duration: "7.5s" },
  { text: ";", left: "93%", top: "58%", depth: 34, size: "1.9rem", duration: "5.5s", accent: true },
  { text: "#", left: "3%", top: "68%", depth: -26, size: "1.15rem", duration: "8s" },
  { text: "=>", left: "78%", top: "88%", depth: 18, size: "1rem", duration: "6.8s" },
];

function sideColor(index) {
  const t = index / (DEPTH_LAYERS - 1);
  const lightness = 8 + t * 10;
  return `hsl(0 70% ${lightness}%)`;
}

export default function LogoMedallion() {
  const sceneRef = useRef(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduceMotion) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;

    const tick = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      scene.style.setProperty("--tx", current.x.toFixed(4));
      scene.style.setProperty("--ty", current.y.toFixed(4));

      const settled =
        Math.abs(target.x - current.x) < 0.001 && Math.abs(target.y - current.y) < 0.001;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };

    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const clamp = (value) => Math.max(-1, Math.min(1, value));

    const onMove = (event) => {
      const rect = scene.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      target.x = clamp((event.clientX - centerX) / (window.innerWidth / 2));
      target.y = clamp((event.clientY - centerY) / (window.innerHeight / 2));
      scene.classList.add("is-tilting");
      start();
    };

    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      scene.classList.remove("is-tilting");
      start();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={sceneRef} className="medallion-scene" role="img" aria-label="Maroon Raccoon logo">
      <div className="medallion-glow" aria-hidden="true" />

      <svg className="medallion-orbit" viewBox="0 0 100 100" aria-hidden="true">
        <g className="orbit-spin">
          <circle cx="50" cy="50" r="47" className="orbit-ring" />
          <circle cx="97" cy="50" r="1.4" className="orbit-packet" />
        </g>
      </svg>

      <div className="medallion-shadow" aria-hidden="true" />

      <div className="medallion-sway" aria-hidden="true">
        <div className="medallion-tilt">
          {Array.from({ length: DEPTH_LAYERS }, (_, i) => (
            <div
              key={i}
              className="medallion-layer"
              style={{
                transform: `translateZ(${i * 1.5}px)`,
                background: sideColor(i),
              }}
            />
          ))}
          <div
            className="medallion-layer medallion-face"
            style={{ transform: `translateZ(${DEPTH_LAYERS * 1.5}px)` }}
          />
          <div
            className="medallion-layer medallion-sheen"
            style={{ transform: `translateZ(${DEPTH_LAYERS * 1.5 + 0.5}px)` }}
          />
        </div>
      </div>

      {glyphs.map((glyph) => (
        <span
          key={glyph.text}
          className={`medallion-glyph${glyph.accent ? " is-accent" : ""}`}
          style={{ left: glyph.left, top: glyph.top, "--depth": glyph.depth, fontSize: glyph.size }}
          aria-hidden="true"
        >
          <span style={{ animationDuration: glyph.duration }}>{glyph.text}</span>
        </span>
      ))}
    </div>
  );
}
