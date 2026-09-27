import { useEffect, useRef, useState, type CSSProperties } from "react";

function gridStyle(el: HTMLElement): CSSProperties {
  const dpr = window.devicePixelRatio;
  const width = Math.round(el.clientWidth * dpr);
  const cols = Math.max(1, Math.round(width / (40 * dpr)));
  const cell = Math.round(width / cols);
  const line = Math.max(1, Math.round(dpr));
  const color = getComputedStyle(el).getPropertyValue("--grid-line");
  const verticals = Array.from(
    { length: cols },
    (_, i) =>
      `<rect x="${Math.round((i * width) / cols)}" width="${line}" height="${cell}"/>`,
  ).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${cell}" style="fill:${color}"><rect width="${width}" height="${line}"/>${verticals}</svg>`;
  return {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
    backgroundSize: `${width / dpr}px ${cell / dpr}px`,
  };
}

export default function Background() {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>();

  useEffect(() => {
    const el = ref.current!;
    const observer = new ResizeObserver(() => setStyle(gridStyle(el)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={style}
    />
  );
}
