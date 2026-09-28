"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import LogoMedallion from "./LogoMedallion";

const plainWords = ["Hand-built", "websites", "with"];
const accentWords = ["actual", "bite."];

const headline = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const word = {
  hidden: { opacity: 0, y: "0.45em", filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Hero() {
  return (
    <section className="home-hero">
      <div className="hero-container">
        <div className="hero-text">
          <motion.span className="eyebrow" {...fadeUp(0)}>
            Web design &amp; development
          </motion.span>

          <motion.h1 initial="hidden" animate="show" variants={headline}>
            {plainWords.map((text) => (
              <span key={text}>
                <motion.span className="hero-word" variants={word}>
                  {text}
                </motion.span>{" "}
              </span>
            ))}
            {accentWords.map((text) => (
              <span key={text}>
                <motion.span className="hero-word accent" variants={word}>
                  {text}
                </motion.span>{" "}
              </span>
            ))}
          </motion.h1>

          <motion.p className="lede" {...fadeUp(0.55)}>
            I design and build fast, modern sites for small businesses and
            creatives — no templates, no runaround, no surprise costs.
          </motion.p>

          <motion.div className="button-row" {...fadeUp(0.7)}>
            <Link href="/contact" className="cta-button">
              Start a project
            </Link>
            <Link href="/projects" className="btn-ghost">
              See my work →
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="hero-image"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <LogoMedallion />
        </motion.div>
      </div>
    </section>
  );
}
