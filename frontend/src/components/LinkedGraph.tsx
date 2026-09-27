import { useEffect, useRef } from "react";
import type { Answer, Link } from "@/hooks/useWebSocket";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { simulateForces, type Body } from "@/utils/simulateForces";

export default function LinkedGraph({
  answers,
  links,
  own,
}: {
  answers: Answer[];
  links: Link[];
  own: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodies = useRef(new Map<string, Body>());
  const cards = useRef(new Map<string, HTMLDivElement>());
  const drag = useRef<{ name: string; dx: number; dy: number } | null>(null);

  const moveDragged = (e: React.PointerEvent) => {
    const body = drag.current && bodies.current.get(drag.current.name);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!drag.current || !body || !rect) return;
    body.x = e.clientX - rect.left - drag.current.dx;
    body.y = e.clientY - rect.top - drag.current.dy;
  };

  const linksRef = useRef(links);
  useEffect(() => {
    linksRef.current = links;
  }, [links]);

  useEffect(() => {
    let frame: number;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const container = containerRef.current;
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;

      const nodes = new Map(
        [...cards.current].map(([name, card]) => {
          let body = bodies.current.get(name);
          if (!body) {
            body = {
              x: w / 2 + (Math.random() - 0.5) * 50,
              y: h / 2 + (Math.random() - 0.5) * 50,
              vx: 0,
              vy: 0,
            };
            bodies.current.set(name, body);
          }
          return [
            name,
            { body, card, width: card.offsetWidth, height: card.offsetHeight },
          ];
        }),
      );

      simulateForces(nodes, linksRef.current, w, h, drag.current?.name);

      for (const { body, card, width, height } of nodes.values()) {
        card.style.transform = `translate(${body.x - width / 2}px, ${body.y - height / 2}px)`;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1 overflow-hidden">
      {answers.map((res) => (
        <div
          key={res.name}
          ref={(el) => {
            if (!el) return;
            cards.current.set(res.name, el);
            return () => {
              cards.current.delete(res.name);
            };
          }}
          onPointerDown={(e) => {
            const body = bodies.current.get(res.name);
            const rect = containerRef.current?.getBoundingClientRect();
            if (!body || !rect) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = {
              name: res.name,
              dx: e.clientX - rect.left - body.x,
              dy: e.clientY - rect.top - body.y,
            };
          }}
          onPointerMove={moveDragged}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          className="absolute top-0 left-0 w-max max-w-58 cursor-grab touch-none select-none active:z-10 active:cursor-grabbing"
        >
          <Card
            size="sm"
            className={`animate-in fade-in zoom-in-90 duration-300 ${res.name === own ? "bg-main" : res.active ? "" : "bg-secondary-background"}`}
          >
            <CardHeader>
              <CardTitle className="text-lg">{res.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1">
              {res.interests.map((interest, i) => (
                <Badge key={i} variant="neutral">
                  {interest}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
