import type { Link } from "../hooks/useWebSocket";

export type Body = { x: number; y: number; vx: number; vy: number };
export type Node = { body: Body; width: number; height: number };

const REPULSION = 30000;
const COLLISION = 0.1;
const SPRING = 0.01;
const MAX_STRENGTH = 3;
const GRAVITY = 0.005;
const DAMPING = 0.85;
const JITTER = 0.1;
const GAP = 24;

const radius = (node: Node) => (node.width + node.height) / 4;

export function simulateForces(
  nodes: Map<string, Node>,
  links: Link[],
  width: number,
  height: number,
  pinned?: string,
) {
  const list = [...nodes.values()];

  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];
      const dx = b.body.x - a.body.x;
      const dy = b.body.y - a.body.y;
      const dist = Math.hypot(dx, dy) || 0.01;
      const min = radius(a) + radius(b) + GAP;
      const f =
        REPULSION / (dist * dist) + (dist < min ? (min - dist) * COLLISION : 0);
      a.body.vx -= (dx / dist) * f;
      a.body.vy -= (dy / dist) * f;
      b.body.vx += (dx / dist) * f;
      b.body.vy += (dy / dist) * f;
    }
  }

  for (const [p, q, strength] of links) {
    const a = nodes.get(p);
    const b = nodes.get(q);
    if (!a || !b) continue;
    const dx = b.body.x - a.body.x;
    const dy = b.body.y - a.body.y;
    const dist = Math.hypot(dx, dy) || 0.01;
    const f =
      SPRING *
      Math.min(strength, MAX_STRENGTH) *
      (dist - (radius(a) + radius(b) + GAP * 2));
    a.body.vx += (dx / dist) * f;
    a.body.vy += (dy / dist) * f;
    b.body.vx -= (dx / dist) * f;
    b.body.vy -= (dy / dist) * f;
  }

  for (const [name, node] of nodes) {
    const { body } = node;
    if (pinned === name) body.vx = body.vy = 0;
    body.vx += (width / 2 - body.x) * GRAVITY + (Math.random() - 0.5) * JITTER;
    body.vy += (height / 2 - body.y) * GRAVITY + (Math.random() - 0.5) * JITTER;
    body.vx *= DAMPING;
    body.vy *= DAMPING;
    body.x = Math.min(
      Math.max(body.x + body.vx, node.width / 2),
      width - node.width / 2,
    );
    body.y = Math.min(
      Math.max(body.y + body.vy, node.height / 2),
      height - node.height / 2,
    );
  }
}
