"use client";
//src\components\layout\background-texture.tsx
import { useEffect, useRef } from "react";

const GRAIN_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function BackgroundTexture() {
  const grainRef = useRef<HTMLDivElement>(null);

  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (reduceMotion || !isFinePointer) return;

    const MAX_SHIFT = 6; // px
    const LERP = 0.06;

    function onPointerMove(e: PointerEvent) {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      target.current.x = nx * MAX_SHIFT;
      target.current.y = ny * MAX_SHIFT;
    }

    function tick() {
      current.current.x += (target.current.x - current.current.x) * LERP;
      current.current.y += (target.current.y - current.current.y) * LERP;

      if (grainRef.current) {
        grainRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      }

      rafId.current = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="bg-texture-root pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* soft paper falloff */}
      <div className="bg-texture-radial absolute inset-0" />

      {/* grain, parallax-shifted */}
      <div
        ref={grainRef}
        className="bg-texture-grain absolute -inset-4"
        style={{ backgroundImage: `url("${GRAIN_SVG}")` }}
      />
    </div>
  );
}