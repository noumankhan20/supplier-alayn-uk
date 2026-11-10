import type { ReactNode } from "react";

/** SVG filter that roughens stamp edges and knocks small gaps out of the ink. Render once per page. */
export function InkDefs() {
  return (
    <svg width="0" height="0" aria-hidden focusable="false" style={{ position: "absolute" }}>
      <defs>
        <filter id="stamp-ink" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3 2.05"
            result="speckle"
          />
          <feComposite in="rough" in2="speckle" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * A purchase-order book seen from above: navy binding, carbon copies peeking
 * out underneath, and the top sheet (children) with its perforated tear line.
 * Children should render a <PadSheet>, or an AnimatePresence of them, so the
 * top sheet can be torn off while the binding and carbons stay put.
 */
export function PadStack({
  children,
  title = "Purchase orders",
  tag = "Example",
  className = "",
  carbon = true,
}: {
  children: ReactNode;
  title?: string;
  tag?: string;
  className?: string;
  carbon?: boolean;
}) {
  return (
    <div className={`pad ${className}`}>
      {carbon ? (
        <>
          <div aria-hidden className="pad-carbon pad-carbon-yellow" />
          <div aria-hidden className="pad-carbon pad-carbon-pink" />
        </>
      ) : null}
      <div className="relative">
        <div className="pad-binding flex h-9 items-center justify-between px-4 sm:px-6">
          <span className="font-stamp text-[13px] font-bold uppercase tracking-[0.22em] text-white/85">
            Alayn · {title}
          </span>
          {tag ? (
            <span className="rounded-sm bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75">
              {tag}
            </span>
          ) : null}
        </div>
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

/** One sheet of the pad: perforation at the top, torn edge at the bottom. */
export function PadSheet({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`pad-sheet ${className}`}>
      <div aria-hidden className="pad-perf" />
      <div className="px-4 pb-8 pt-3 sm:px-6 sm:pb-10">{children}</div>
    </div>
  );
}
