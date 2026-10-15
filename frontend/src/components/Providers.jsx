"use client";
import { MotionConfig } from "framer-motion";

export default function Providers({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
