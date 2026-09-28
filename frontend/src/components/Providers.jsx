"use client";
import { useEffect } from "react";
import { MotionConfig } from "framer-motion";

export default function Providers({ children }) {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;

    const onMove = (event) => {
      const card = event.target.closest?.(".card");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
