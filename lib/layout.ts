import type { Layout, Person } from './types';

export const NODE_W = 132;
export const NODE_H = 56;
export const GAP_X = 18;
export const GAP_Y = 90;

/**
 * Compute a Walker-style tidy tree layout.
 *
 * Each leaf gets the next x slot; each internal node is centered above its children.
 * Resulting (x, y) positions are origin-shifted so the bounding box starts at (40, 40).
 */
export function computeLayout(people: Record<string, Person>, rootId: string): Layout {
  const pos: Layout['pos'] = {};
  let cursor = 0;

  const assign = (id: string, depth: number): void => {
    const p = people[id];
    if (!p) return;
    const kids = p.children_ids || [];
    if (kids.length === 0) {
      pos[id] = {
        x: cursor * (NODE_W + GAP_X),
        y: depth * (NODE_H + GAP_Y),
        depth,
        leaf: true,
      };
      cursor++;
      return;
    }
    kids.forEach((c) => assign(c, depth + 1));
    const first = pos[kids[0]].x;
    const last = pos[kids[kids.length - 1]].x;
    pos[id] = { x: (first + last) / 2, y: depth * (NODE_H + GAP_Y), depth };
  };

  assign(rootId, 0);

  // Shift to start the bounding box at (40, 40) so we don't render at negative coords.
  let minX = Infinity, maxX = -Infinity, maxY = 0;
  for (const id in pos) {
    if (pos[id].x < minX) minX = pos[id].x;
    if (pos[id].x > maxX) maxX = pos[id].x;
    if (pos[id].y > maxY) maxY = pos[id].y;
  }
  for (const id in pos) {
    pos[id].x = pos[id].x - minX + 40;
    pos[id].y = pos[id].y + 40;
  }

  return {
    pos,
    width: maxX - minX + NODE_W + 80,
    height: maxY + NODE_H + 80,
  };
}

/** Walk up from `id` collecting ancestor ids, root last. */
export function ancestorsOf(id: string | null, people: Record<string, Person>): string[] {
  const out: string[] = [];
  let cur = id;
  while (cur) {
    out.push(cur);
    cur = people[cur]?.parent_id ?? null;
  }
  return out;
}

/** All descendants of `id` (including `id` itself). */
export function descendantsOf(id: string, people: Record<string, Person>): string[] {
  const out: string[] = [];
  const visit = (x: string): void => {
    out.push(x);
    (people[x]?.children_ids || []).forEach(visit);
  };
  visit(id);
  return out;
}

/** Walk up `up` levels from `id`, collecting ids (closest first). Includes `id`. */
export function ancestorsWithin(
  id: string,
  people: Record<string, Person>,
  up: number,
): string[] {
  const out: string[] = [];
  let cur: string | null = id;
  let steps = 0;
  while (cur && steps <= up) {
    out.push(cur);
    cur = people[cur]?.parent_id ?? null;
    steps++;
  }
  return out;
}

/** All descendants of `id` within `down` generations (BFS). Includes `id`. */
export function descendantsWithin(
  id: string,
  people: Record<string, Person>,
  down: number,
): string[] {
  const out: string[] = [];
  const visit = (x: string, level: number): void => {
    out.push(x);
    if (level >= down) return;
    (people[x]?.children_ids || []).forEach((c) => visit(c, level + 1));
  };
  visit(id, 0);
  return out;
}

/**
 * Build the "focused window" around a person — `up` ancestors + `down`
 * descendants (including siblings of each ancestor, so the parent's siblings
 * & their children stay visible at the boundary). Returns a Set of ids.
 */
export function focusSetOf(
  id: string,
  people: Record<string, Person>,
  up = 3,
  down = 3,
): Set<string> {
  const set = new Set<string>();
  // Ancestor chain (id → root, capped).
  const chain = ancestorsWithin(id, people, up);
  chain.forEach((a) => set.add(a));
  // Descendants from id (capped).
  descendantsWithin(id, people, down).forEach((d) => set.add(d));
  return set;
}

/** Depth (generation - 1) of a person from the root. */
export function generationOf(id: string, people: Record<string, Person>): number {
  let depth = 0;
  let cur: string | null = id;
  while (cur && people[cur]?.parent_id) {
    depth++;
    cur = people[cur].parent_id;
  }
  return depth + 1;
}
