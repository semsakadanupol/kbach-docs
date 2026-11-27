"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { clsx } from "@kbach/react";
import { SiteLink } from "./SiteLink";
import { Logo } from "./Logo";
import { BrandIcon, type Brand } from "./BrandIcon";

// "Works with", as a map: the engine in the middle, its three packages
// around it, and each setup on the outside, joined to the package it uses.
// Pointing at (or tabbing to) any of them lights its path back to the
// engine and says, under the map, how Kbach plugs in there. Every node is a
// link to where to start.
//
// Positions are in % of a square box (x right, y down), placed by hand so
// the map balances around the engine: the web on the left (@kbach/react and
// its four setups), React Native above the plain page on the right (three).
// Each label's middle sits far enough from the edges for the label to fit
// at a phone's width (a 358px box), and none touches another;
// tests/e2e/home.mjs checks both.
//
// Every label is `w-max`: a box placed with `left: 80%` may otherwise be
// sized to the 20% of the map left on its right, and Firefox then squeezes a
// flex label narrower than its text, which runs out past its border.

type PackageId = "react" | "native" | "browser";

const ENGINE = { x: 50, y: 50 };

export const PACKAGES: { id: PackageId; name: string; x: number; y: number; href: string; says: string }[] = [
  { id: "react", name: "@kbach/react", x: 21, y: 50, href: "/web", says: "For React on the web: Vite, Next.js or PostCSS." },
  { id: "native", name: "@kbach/react-native", x: 68, y: 26, href: "/react-native", says: "For React Native and Expo, on Android and iOS." },
  { id: "browser", name: "@kbach/browser", x: 68, y: 74, href: "/plain-html", says: "For a plain HTML page: one script tag, no build." },
];

export const TOOLS: { name: string; brand: Brand; pkg: PackageId; x: number; y: number; href: string; says: string }[] = [
  { name: "Next.js", brand: "nextjs", pkg: "react", x: 22, y: 10, href: "/installation?tab=nextjs", says: "The PostCSS plugin fills globals.css. npx @kbach/cli init sets it up." },
  { name: "React", brand: "react", pkg: "react", x: 13, y: 31, href: "/installation?tab=vite", says: "Any React app on the web, through the Vite or PostCSS plugin." },
  { name: "Vite", brand: "vite", pkg: "react", x: 11, y: 69, href: "/installation?tab=vite", says: "The Vite plugin writes kbach.css when you build." },
  { name: "PostCSS", brand: "postcss", pkg: "react", x: 18, y: 90, href: "/plugin-options", says: "Any PostCSS setup: the plugin fills the CSS file that has the Kbach markers." },
  { name: "React Native", brand: "react", pkg: "native", x: 80, y: 7, href: "/installation?tab=react-native", says: "A Babel plugin gives each element its style object as it renders." },
  { name: "Expo", brand: "expo", pkg: "native", x: 86, y: 44, href: "/installation?tab=react-native", says: "The same as React Native, Expo Go included." },
  { name: "Plain HTML", brand: "html5", pkg: "browser", x: 80, y: 93, href: "/installation?tab=html", says: "One script tag from a CDN writes the CSS in the browser." },
];

type Point = { x: number; y: number };

/**
 * How the map fits the box it's in: the box's size, and how far each label
 * had to move (in px) to stay inside it. A label's width depends on its
 * language, the font and the reader's text size, so the % positions alone
 * can't promise it fits: the map measures, and nudges a label in from an
 * edge it would cross. The lines then run to where the labels really are.
 */
type Fit = { w: number; h: number; nudge: Record<string, [number, number]> };

/** Each node's key and point (the engine, "pkg:react", "tool:Vite"). */
const POINTS: [string, Point][] = [["engine", ENGINE], ...PACKAGES.map((p) => ["pkg:" + p.id, p] as [string, Point]), ...TOOLS.map((x) => ["tool:" + x.name, x] as [string, Point])];

/** What's lit: a tool, a package, the engine, or nothing. */
type Active = { kind: "tool"; name: string } | { kind: "package"; id: PackageId } | { kind: "engine" } | null;

export function WorksWith({ className }: { className?: string }) {
  const [active, setActive] = useState<Active>(null);
  const box = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<Fit | null>(null);

  // Measure once the map is in the page, again whenever the box or a label changes size (a
  // rotated phone, the web font arriving, a bigger text size), and nudge labels in from the edges.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const room = [w, h];
      // a node's half size as laid out (not as scaled by a hover), and its middle where its point is
      const size = (key: string) => {
        const node = el.querySelector<HTMLElement>('[data-key="' + key + '"]');
        return node ? [node.offsetWidth / 2, node.offsetHeight / 2] : null;
      };
      /** How far to move a node of half size `half`, now at `mid`, so it stays inside the box. */
      const inside = (half: number[], mid: number[]) => [0, 1].map((i) => Math.max(half[i] - mid[i], Math.min(0, room[i] - half[i] - mid[i])));
      const engineHalf = size("engine") ?? [0, 0];
      const engineMid = [(ENGINE.x / 100) * w, (ENGINE.y / 100) * h];
      const GAP = 6;
      const nudge: Record<string, [number, number]> = {};
      for (const [key, pt] of POINTS) {
        const half = size(key);
        if (!half) continue;
        const mid = [(pt.x / 100) * w, (pt.y / 100) * h];
        let move = inside(half, mid);
        // a package label next to the engine (a narrow phone): sideways, away from the engine, then inside again
        if (key.startsWith("pkg:")) {
          const cx = mid[0] + move[0];
          const cy = mid[1] + move[1];
          const reachX = half[0] + engineHalf[0] + GAP;
          const reachY = half[1] + engineHalf[1] + GAP;
          if (Math.abs(cx - engineMid[0]) < reachX && Math.abs(cy - engineMid[1]) < reachY) {
            const side = cx < engineMid[0] ? -1 : 1;
            const pushed = [engineMid[0] + side * reachX, cy];
            const back = inside(half, pushed);
            move = [pushed[0] + back[0] - mid[0], pushed[1] + back[1] - mid[1]];
          }
        }
        nudge[key] = [Math.round(move[0]), Math.round(move[1])];
      }
      const next: Fit = { w, h, nudge };
      setFit((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.querySelectorAll("[data-key]").forEach((n) => ro.observe(n));
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  /** Where a node sits: its point, plus its nudge once measured (px; % until then). */
  const at = (key: string, pt: Point): CSSProperties => {
    const [dx, dy] = fit?.nudge[key] ?? [0, 0];
    return { left: dx ? "calc(" + pt.x + "% + " + dx + "px)" : pt.x + "%", top: dy ? "calc(" + pt.y + "% + " + dy + "px)" : pt.y + "%" };
  };
  /** A node's middle in the lines' units: px of the measured box, else % of it. */
  const mid = (key: string, pt: Point): Point => {
    if (!fit) return pt;
    const [dx, dy] = fit.nudge[key] ?? [0, 0];
    return { x: (pt.x / 100) * fit.w + dx, y: (pt.y / 100) * fit.h + dy };
  };

  // what the lit thing joins up with
  const tool = active?.kind === "tool" ? TOOLS.find((x) => x.name === active.name) : undefined;
  const litPackage: PackageId | null = tool ? tool.pkg : active?.kind === "package" ? active.id : null;
  const toolLit = (name: string, pkg: PackageId) => (tool ? tool.name === name : active?.kind === "package" ? active.id === pkg : active?.kind === "engine");
  const packageLit = (id: PackageId) => active?.kind === "engine" || litPackage === id;
  const says = tool
    ? tool.says
    : active?.kind === "package"
      ? PACKAGES.find((p) => p.id === active.id)!.says
      : active?.kind === "engine"
        ? "One Rust engine reads every class, for every package."
        : "Point at a tool to see how Kbach plugs in.";

  const on = (a: Active) => ({
    onMouseEnter: () => setActive(a),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(a),
    onBlur: () => setActive(null),
  });

  // a line between two nodes' middles; lit: gold and moving, dimmed while something else is lit
  const line = (key: string, a: Point, b: Point, lit: boolean) => (
    <line
      key={key}
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      vectorEffect="non-scaling-stroke"
      strokeWidth={lit ? 2 : 1.25}
      strokeLinecap="round"
      data-lit={lit ? "" : undefined}
      className={clsx(
        "transition-[stroke,opacity] duration-300",
        lit ? "stroke-gold [stroke-dasharray:6_6] animate-[kbd-flow_0.6s_linear_infinite]" : "stroke-line",
        active && !lit && "opacity-40",
      )}
    />
  );

  return (
    <figure className={clsx("m-0 w-full", className)} aria-label="Works with">
      <figcaption className="mb-2 text-center text-xs font-semibold tracking-[0.12em] text-faint uppercase">Works with</figcaption>
      {/* taller than wide on a phone: more room between the labels stacked on each side */}
      <div ref={box} data-network="" className="relative mx-auto aspect-[4/5] w-full max-w-[30rem] sm:aspect-square">
        {/* the lines: in the box's px once measured (in % before, as the page is built) */}
        <svg viewBox={fit ? "0 0 " + fit.w + " " + fit.h : "0 0 100 100"} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
          {PACKAGES.map((pk) => line("e-" + pk.id, mid("engine", ENGINE), mid("pkg:" + pk.id, pk), packageLit(pk.id)))}
          {TOOLS.map((x) => line("t-" + x.name, mid("pkg:" + x.pkg, p(x.pkg)), mid("tool:" + x.name, x), toolLit(x.name, x.pkg)))}
        </svg>

        {/* the engine */}
        <SiteLink
          href="/how-it-works"
          {...on({ kind: "engine" })}
          aria-label="How Kbach works"
          data-key="engine"
          style={at("engine", ENGINE)}
          className={clsx(
            "absolute grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-card shadow-lg ring-1 transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold sm:size-16",
            active?.kind === "engine" ? "scale-110 ring-gold shadow-gold/30" : "ring-gold/40 shadow-gold/10",
          )}
        >
          <Logo source={64} shown={48} className="size-10 rounded-xl sm:size-12" />
        </SiteLink>

        {/* the packages */}
        {PACKAGES.map((pk) => (
          <SiteLink
            key={pk.id}
            href={pk.href}
            {...on({ kind: "package", id: pk.id })}
            data-package={pk.id}
            data-key={"pkg:" + pk.id}
            style={at("pkg:" + pk.id, pk)}
            className={clsx(
              "absolute w-max -translate-x-1/2 -translate-y-1/2 rounded-md border px-2 py-0.5 font-mono text-[10.5px] whitespace-nowrap transition duration-300 focus-visible:outline-2 focus-visible:outline-gold sm:text-[11.5px]",
              packageLit(pk.id) ? "border-gold bg-gold/15 text-accent" : "border-line bg-page text-muted",
              active && !packageLit(pk.id) && "opacity-50",
            )}
          >
            {pk.name}
          </SiteLink>
        ))}

        {/* the setups */}
        {TOOLS.map((x) => {
          const lit = toolLit(x.name, x.pkg);
          return (
            <SiteLink
              key={x.name}
              href={x.href}
              {...on({ kind: "tool", name: x.name })}
              data-tool={x.name}
              data-key={"tool:" + x.name}
              style={at("tool:" + x.name, x)}
              className={clsx(
                "absolute flex w-max -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap shadow-sm transition duration-300 focus-visible:outline-2 focus-visible:outline-gold sm:text-[13px]",
                lit ? "scale-105 border-gold bg-card text-ink shadow-gold/20" : "border-line bg-card text-muted",
                active && !lit && "opacity-50",
              )}
            >
              <BrandIcon brand={x.brand} className="text-sm sm:text-base" />
              {x.name}
            </SiteLink>
          );
        })}
      </div>
      <p data-network-says="" aria-live="polite" className="mx-auto mt-3 min-h-12 max-w-sm text-center text-sm leading-6 text-pretty text-muted">
        {says}
      </p>
    </figure>
  );
}

/** A package's point. */
function p(id: PackageId) {
  return PACKAGES.find((x) => x.id === id)!;
}
