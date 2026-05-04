'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  Camera,
  EditsMap,
  Lang,
  Layout,
  Person,
  ViewMode,
} from '@/lib/types';
import { I18N } from '@/lib/i18n';
import { toNeDigits } from '@/lib/bsAd';
import { transliterate } from '@/lib/transliterate';
import {
  ancestorsOf,
  GAP_X, GAP_Y,
  NODE_H, NODE_W,
  computeLayout,
} from '@/lib/layout';
import { PEOPLE, ROOT_ID } from '@/lib/data';

/** Imperative API the canvas exposes to the parent (camera control). */
export interface TreeCanvasHandle {
  focusOn(id: string, smooth?: boolean): void;
  fitTo(ids: string[] | null, smooth?: boolean): void;
  zoomBy(factor: number): void;
  homeView(smooth?: boolean): void;
}

interface Props {
  view: ViewMode;
  lang: Lang;
  selectedId: string | null;
  matchedIds: Set<string>;
  /** Ids that should remain visible; everything else is dimmed. null = show everything. */
  focusSet: Set<string> | null;

  onPickNode(id: string, kind: 'click' | 'dblclick'): void;
  onHover(id: string | null, x: number, y: number): void;
  onCanvasMove(): void;
  onCanvasMouseDown(): void;
}

const TreeCanvas = forwardRef<TreeCanvasHandle, Props>(function TreeCanvas(
  { view, lang, selectedId, matchedIds, focusSet,
    onPickNode, onHover, onCanvasMove, onCanvasMouseDown },
  ref,
) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Camera lives in a ref — we mutate it on every mousemove and write directly
  // to the stage's transform. Using React state would re-render 60×/sec.
  const cameraRef = useRef<Camera>({ x: 0, y: 0, zoom: 0.85 });

  // Layout is pure — memoize it once. It does not depend on view/lang/edits.
  const layout: Layout = useMemo(() => computeLayout(PEOPLE, ROOT_ID), []);

  /* -------- Helpers (mapping/derivations) -------- */

  // y-coordinate mapping that flips when in bottom-up view.
  const yMap = useCallback(
    (id: string): number => {
      const p = layout.pos[id];
      if (!p) return 0;
      return view === 'bottom-up' ? layout.height - p.y - NODE_H - 80 : p.y;
    },
    [view, layout.height, layout.pos],
  );

  /** The set of nodes that should be visible (others get dimmed). null = no scope. */
  const visibleSet = focusSet;

  /** Highlight ancestor chain when a person is selected (for any mode). */
  const ancestorSet = useMemo(() => {
    if (!selectedId) return new Set<string>();
    return new Set(ancestorsOf(selectedId, PEOPLE));
  }, [selectedId]);

  /* -------- Transform application -------- */

  const applyTransform = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const c = cameraRef.current;
    stage.style.transform = `translate(${c.x}px, ${c.y}px) scale(${c.zoom})`;
  }, []);

  const animateTo = useCallback((next: Camera, smooth: boolean) => {
    cameraRef.current = next;
    const stage = stageRef.current;
    if (!stage) return;
    if (smooth) {
      stage.classList.add('smooth');
      applyTransform();
      window.setTimeout(() => stage.classList.remove('smooth'), 600);
    } else {
      applyTransform();
    }
  }, [applyTransform]);

  /* -------- Imperative camera API -------- */

  const focusOn = useCallback((id: string, smooth = true) => {
    const p = layout.pos[id];
    if (!p) return;
    const cx = p.x + NODE_W / 2;
    const cy = yMap(id) + NODE_H / 2;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const zoom = Math.max(cameraRef.current.zoom, 0.9);
    animateTo({
      x: W / 2 - cx * zoom,
      y: H / 2 - cy * zoom,
      zoom,
    }, smooth);
  }, [layout.pos, yMap, animateTo]);

  const fitTo = useCallback((ids: string[] | null, smooth = true) => {
    const list = ids ?? Object.keys(layout.pos);
    if (list.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    list.forEach((id) => {
      const p = layout.pos[id];
      if (!p) return;
      const x = p.x;
      const y = yMap(id);
      if (x < minX) minX = x;
      if (x + NODE_W > maxX) maxX = x + NODE_W;
      if (y < minY) minY = y;
      if (y + NODE_H > maxY) maxY = y + NODE_H;
    });
    const W = window.innerWidth;
    const H = window.innerHeight;
    const padX = 100;
    const padY = 180; // leave room under the header
    const sx = (W - 2 * padX) / Math.max(1, maxX - minX);
    const sy = (H - 2 * padY) / Math.max(1, maxY - minY);
    // For a focused subset we want names readable (floor ≈ 0.55); for the whole
    // tree we accept a lower floor so it fits.
    const isWhole = ids === null;
    const minZoom = isWhole ? 0.18 : 0.55;
    const maxZoom = isWhole ? 1.0 : 1.5;
    const zoom = Math.min(maxZoom, Math.max(minZoom, Math.min(sx, sy)));
    animateTo({
      x: (W - (maxX - minX) * zoom) / 2 - minX * zoom,
      y: (H - (maxY - minY) * zoom) / 2 - minY * zoom + 30,
      zoom,
    }, smooth);
  }, [layout.pos, yMap, animateTo]);

  const zoomBy = useCallback((factor: number) => {
    const W = window.innerWidth, H = window.innerHeight;
    const cx = W / 2, cy = H / 2;
    const c = cameraRef.current;
    const wx = (cx - c.x) / c.zoom;
    const wy = (cy - c.y) / c.zoom;
    const zoom = Math.min(3, Math.max(0.1, c.zoom * factor));
    animateTo({ x: cx - wx * zoom, y: cy - wy * zoom, zoom }, true);
  }, [animateTo]);

  const homeView = useCallback((smooth = true) => {
    const root = layout.pos[ROOT_ID];
    const cx = root.x + NODE_W / 2;
    const cy = yMap(ROOT_ID) + NODE_H / 2;
    const zoom = 0.85;
    animateTo({
      x: window.innerWidth / 2 - cx * zoom,
      y: 180 - cy * zoom + NODE_H, // root sits a bit below the top
      zoom,
    }, smooth);
  }, [layout.pos, yMap, animateTo]);

  useImperativeHandle(ref, () => ({ focusOn, fitTo, zoomBy, homeView }),
    [focusOn, fitTo, zoomBy, homeView]);

  /* -------- Initial view + view-flip handling -------- */

  // Initial view (root, comfortable zoom). Runs once on mount.
  useEffect(() => {
    homeView(false);
    // Subsequent application after a tick so the stage definitely exists.
    const t = window.setTimeout(() => homeView(true), 60);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply transform on every render so view-flip etc. don't desync.
  useEffect(() => { applyTransform(); });

  /* -------- Pan / Zoom event handlers -------- */

  const drag = useRef<{ active: boolean; sx: number; sy: number; startX: number; startY: number; moved: boolean }>(
    { active: false, sx: 0, sy: 0, startX: 0, startY: 0, moved: false }
  );

  // Touch pinch
  const touch = useRef<{ lastDist: number; startCam: Camera; cx: number; cy: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.topbar') || target.closest('.zoomctrl') ||
          target.closest('.side-panel') || target.closest('.tooltip')) return;
      drag.current = {
        active: true,
        sx: e.clientX,
        sy: e.clientY,
        startX: cameraRef.current.x,
        startY: cameraRef.current.y,
        moved: false,
      };
      canvas.classList.add('grabbing');
      onCanvasMouseDown();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.sx;
      const dy = e.clientY - drag.current.sy;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
      cameraRef.current = {
        ...cameraRef.current,
        x: drag.current.startX + dx,
        y: drag.current.startY + dy,
      };
      applyTransform();
    };

    const onMouseUp = () => {
      drag.current.active = false;
      canvas.classList.remove('grabbing');
    };

    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.topbar') || target.closest('.side-panel')) return;
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0015);
      const c = cameraRef.current;
      const newZoom = Math.min(3, Math.max(0.1, c.zoom * factor));
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const wx = (cx - c.x) / c.zoom;
      const wy = (cy - c.y) / c.zoom;
      cameraRef.current = {
        zoom: newZoom,
        x: cx - wx * newZoom,
        y: cy - wy * newZoom,
      };
      applyTransform();
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        drag.current = {
          active: true,
          sx: e.touches[0].clientX,
          sy: e.touches[0].clientY,
          startX: cameraRef.current.x,
          startY: cameraRef.current.y,
          moved: false,
        };
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0], t2 = e.touches[1];
        touch.current = {
          lastDist: Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY),
          startCam: { ...cameraRef.current },
          cx: (t1.clientX + t2.clientX) / 2,
          cy: (t1.clientY + t2.clientY) / 2,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && drag.current.active) {
        e.preventDefault();
        const dx = e.touches[0].clientX - drag.current.sx;
        const dy = e.touches[0].clientY - drag.current.sy;
        if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
        cameraRef.current = {
          ...cameraRef.current,
          x: drag.current.startX + dx,
          y: drag.current.startY + dy,
        };
        applyTransform();
      } else if (e.touches.length === 2 && touch.current) {
        e.preventDefault();
        const t1 = e.touches[0], t2 = e.touches[1];
        const d = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const z = Math.min(3, Math.max(0.1, touch.current.startCam.zoom * (d / touch.current.lastDist)));
        const wx = (touch.current.cx - touch.current.startCam.x) / touch.current.startCam.zoom;
        const wy = (touch.current.cy - touch.current.startCam.y) / touch.current.startCam.zoom;
        cameraRef.current = {
          zoom: z,
          x: touch.current.cx - wx * z,
          y: touch.current.cy - wy * z,
        };
        applyTransform();
      }
    };

    const onTouchEnd = () => {
      drag.current.active = false;
      touch.current = null;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [applyTransform, onCanvasMouseDown]);

  /* -------- Click / dblclick on nodes (with drag suppression) -------- */

  const lastClickRef = useRef<{ t: number; id: string | null }>({ t: 0, id: null });

  const handleNodeClick = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    if (drag.current.moved) return;
    const now = Date.now();
    const isDouble = now - lastClickRef.current.t < 320 && lastClickRef.current.id === id;
    lastClickRef.current = { t: now, id };
    if (isDouble) {
      onPickNode(id, 'dblclick');
      return;
    }
    // Defer single-click slightly so a 2nd click can upgrade to dblclick.
    window.setTimeout(() => {
      if (Date.now() - lastClickRef.current.t < 320 && lastClickRef.current.id === id) {
        // a 2nd click came in; ignore — dblclick handler above already fired
        return;
      }
      onPickNode(id, 'click');
    }, 320);
  };

  /* -------- Hover handling -------- */

  const handleNodeMove = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    onHover(id, e.clientX, e.clientY);
  };
  const handleStageMove = () => {
    onCanvasMove();
  };
  const handleStageLeave = () => {
    onHover(null, 0, 0);
  };

  /* -------- Render -------- */

  const t = I18N[lang];

  // Build node JSX for all 153 ids (a small enough set to render eagerly).
  const nodes: React.ReactNode[] = [];
  const paths: React.ReactNode[] = [];

  for (const id in layout.pos) {
    const p = PEOPLE[id];
    const lp = layout.pos[id];
    const x = lp.x;
    const y = yMap(id);

    const isMatch = matchedIds.has(id);
    const isSelected = selectedId === id;
    const isLineage = ancestorSet.has(id);
    const isRoot = !p.parent_id;
    const dim = visibleSet ? !visibleSet.has(id) : false;

    const cls = [
      'node',
      isRoot && 'root',
      isMatch && 'match',
      isSelected && 'selected',
      isLineage && !isSelected && 'lineage',
      dim && 'dim',
      !dim && 'in-scope',
    ].filter(Boolean).join(' ');

    const display = lang === 'ne' ? p.name : transliterate(p.name);
    const meta = `${t.gen} ${lang === 'ne' ? toNeDigits(lp.depth + 1) : lp.depth + 1}`;

    nodes.push(
      <div
        key={id}
        className={cls}
        style={{ left: x, top: y, width: NODE_W, height: NODE_H }}
        onMouseMove={(e) => handleNodeMove(e, id)}
        onClick={(e) => handleNodeClick(e, id)}
      >
        <div className={lang === 'ne' ? 'name' : 'name-en'}>{display}</div>
        <div className="meta latin">{meta}</div>
      </div>
    );

    // Connector to parent
    if (p.parent_id) {
      const parent = layout.pos[p.parent_id];
      const cx = lp.x + NODE_W / 2;
      const cy = y;
      const px = parent.x + NODE_W / 2;
      const py = yMap(p.parent_id) + NODE_H;
      const my = (py + cy) / 2;
      const d = `M ${px} ${py} C ${px} ${my}, ${cx} ${my}, ${cx} ${cy}`;

      const isActive = ancestorSet.has(id) && ancestorSet.has(p.parent_id);
      const isDim = visibleSet && !(visibleSet.has(id) && visibleSet.has(p.parent_id));
      const pathCls = [isActive && 'active', isDim && 'dim'].filter(Boolean).join(' ');
      paths.push(<path key={`l-${id}`} d={d} className={pathCls || undefined} />);
    }
  }

  return (
    <div
      className="canvas"
      ref={canvasRef}
      onMouseMove={handleStageMove}
      onMouseLeave={handleStageLeave}
    >
      <div
        className="stage"
        ref={stageRef}
        style={{ width: layout.width, height: layout.height }}
      >
        <svg
          className="links"
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
        >
          {paths}
        </svg>
        <div>{nodes}</div>
      </div>
    </div>
  );
});

export default TreeCanvas;
