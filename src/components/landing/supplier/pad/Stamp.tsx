"use client";

import { motion, useReducedMotion } from "framer-motion";

export type StampTone = "red" | "navy";

/**
 * A rubber-stamp impression. It "lands": comes down large and slightly
 * rotated, then settles hard onto the paper. Ink grain comes from the
 * #stamp-ink SVG filter rendered once by <InkDefs />.
 */
export default function Stamp({
  label,
  sub,
  tone = "red",
  rotate = -8,
  show = true,
  delay = 0,
  className = "",
  size = 1,
}: {
  label: string;
  sub?: string;
  tone?: StampTone;
  rotate?: number;
  show?: boolean;
  delay?: number;
  className?: string;
  /** Scale multiplier for smaller slips. */
  size?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`stamp stamp-${tone} ${className}`}
      style={{ fontSize: `${size}em` }}
      initial={false}
      animate={
        show
          ? { opacity: 1, scale: 1, rotate }
          : { opacity: 0, scale: 1.7, rotate: rotate - 9 }
      }
      transition={
        reduce
          ? { duration: 0 }
          : show
            ? { type: "spring", stiffness: 560, damping: 26, mass: 0.7, delay }
            : { duration: 0.15 }
      }
    >
      <span className="stamp-main">{label}</span>
      {sub ? <span className="stamp-sub">{sub}</span> : null}
    </motion.div>
  );
}
