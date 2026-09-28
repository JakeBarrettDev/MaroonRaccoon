"use client";
import { motion } from "framer-motion";
import PawPrint from "./PawPrint";

const STEPS = 8;

const steps = Array.from({ length: STEPS }, (_, i) => ({
  left: `${4 + i * (88 / (STEPS - 1))}%`,
  top: `${(i % 2 ? 52 : 8) + Math.sin(i * 0.9) * 8}%`,
  rotate: 90 + (i % 2 ? 8 : -8),
}));

const trail = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16 } },
};

const print = {
  hidden: { opacity: 0, scale: 0.4 },
  show: {
    opacity: 0.55,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 18 },
  },
};

export default function PawTrail() {
  return (
    <motion.div
      className="paw-trail"
      aria-hidden="true"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.8 }}
      variants={trail}
    >
      {steps.map((step, i) => (
        <motion.span
          key={i}
          className="paw-step"
          style={{ left: step.left, top: step.top, rotate: step.rotate }}
          variants={print}
        >
          <PawPrint size={28} />
        </motion.span>
      ))}
    </motion.div>
  );
}
