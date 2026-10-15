"use client";
import { Component, useCallback, useEffect, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import LogoMedallion from "./LogoMedallion";

// three.js only loads for visitors who actually get Packet.
const PacketScene = dynamic(() => import("./PacketScene"), { ssr: false });

const DESKTOP = "(min-width: 769px) and (hover: hover) and (pointer: fine)";

const QUERIES = [DESKTOP, "(prefers-reduced-motion: reduce)"];

function subscribe(onChange) {
  const lists = QUERIES.map((q) => window.matchMedia(q));
  lists.forEach((list) => list.addEventListener("change", onChange));
  return () => lists.forEach((list) => list.removeEventListener("change", onChange));
}

let webgl;
function supportsWebGL() {
  if (webgl !== undefined) return webgl;
  try {
    const canvas = document.createElement("canvas");
    webgl = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return webgl;
}

// "auto": desktop, loads Packet on its own · "offer": phones/data saver, opt in · "none": logo only
function getEligibility() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !supportsWebGL()) return "none";
  if (navigator.connection?.saveData || !window.matchMedia(DESKTOP).matches) return "offer";
  return "auto";
}

const getServerEligibility = () => "none";

// If anything in the 3D scene throws, quietly fall back to the logo.
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function PacketHero() {
  const eligibility = useSyncExternalStore(subscribe, getEligibility, getServerEligibility);
  // "logo" → "loading" → "ready", or "failed" if the scene errors.
  const [mode, setMode] = useState("logo");

  useEffect(() => {
    if (eligibility !== "auto") return;
    // Desktop: let the page settle first, then bring Packet in behind the logo.
    const start = () => setMode((current) => (current === "logo" ? "loading" : current));
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(start, { timeout: 1500 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(start, 600);
    return () => clearTimeout(id);
  }, [eligibility]);

  const handleReady = useCallback(() => setMode("ready"), []);
  const handleError = useCallback(() => setMode("failed"), []);

  const showScene = mode === "loading" || mode === "ready";

  return (
    <div className={`packet-hero${mode === "ready" ? " is-packet" : ""}`}>
      <LogoMedallion label={mode === "ready" ? "Packet, the Maroon Raccoon mascot" : undefined}>
        {showScene && (
          <SceneBoundary onError={handleError}>
            <PacketScene onReady={handleReady} />
          </SceneBoundary>
        )}
      </LogoMedallion>

      {eligibility === "offer" && (mode === "logo" || mode === "loading") && (
        <button
          type="button"
          className="packet-wake"
          onClick={() => setMode("loading")}
          disabled={mode === "loading"}
        >
          {mode === "loading" ? "Waking Packet…" : "Meet Packet"}
        </button>
      )}
      {/* Takes the button's place so the page doesn't jump once he appears. */}
      {eligibility === "offer" && mode === "ready" && (
        <p className="packet-hint">Tap Packet for a trick</p>
      )}
    </div>
  );
}
