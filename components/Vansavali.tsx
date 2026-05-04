'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './Header';
import TreeCanvas, { type TreeCanvasHandle } from './TreeCanvas';
import Tooltip from './Tooltip';
import SidePanel from './SidePanel';
import Splash from './Splash';
import BookView from './BookView';
import type { EditsMap, FocusScope, Lang, PersonEdit, ViewMode } from '@/lib/types';
import { I18N } from '@/lib/i18n';
import { DATA, PEOPLE, ROOT_ID } from '@/lib/data';
import { ancestorsOf, descendantsOf, focusSetOf } from '@/lib/layout';
import { resolvePerson } from '@/lib/resolve';
import { loadEdits, loadLang, saveEdits, saveLang } from '@/lib/storage';

type SidePanelMode = 'edit' | 'lineage';

const FOCUS_UP = 3;
const FOCUS_DOWN = 3;

export default function Vansavali() {
  /* ------------------ State ------------------ */
  const [edits, setEdits] = useState<EditsMap>({});
  const [lang, setLang] = useState<Lang>('ne');
  const [view, setView] = useState<ViewMode>('top-down');
  const [scope, setScope] = useState<FocusScope>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState(false);

  // Side panel
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<SidePanelMode>('lineage');
  const [panelPersonId, setPanelPersonId] = useState<string | null>(null);

  // Tooltip
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [hoverXY, setHoverXY] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Header auto-hide
  const [headerHidden, setHeaderHidden] = useState(false);
  const headerHover = useRef(false);
  const idleTimer = useRef<number | undefined>(undefined);

  // Camera control (TreeCanvas exposes imperative methods)
  const canvasRef = useRef<TreeCanvasHandle>(null);

  /* ------------------ Boot: hydrate from storage ------------------ */
  useEffect(() => {
    setEdits(loadEdits());
    setLang(loadLang('ne'));
  }, []);

  /* ------------------ Persistence ------------------ */
  const persistEdits = useCallback((next: EditsMap) => {
    setEdits(next);
    saveEdits(next);
  }, []);

  /* ------------------ Hovered person (for tooltip) ------------------ */
  const hoverPerson = useMemo(
    () => (hoverId ? resolvePerson(hoverId, edits) : null),
    [hoverId, edits],
  );

  /* ------------------ Focus set (which nodes stay visible) ------------------ */
  // Computed once per (scope, selectedId) — TreeCanvas dims everything outside it.
  const focusSet = useMemo<Set<string> | null>(() => {
    if (scope === 'all' || !selectedId) return null;
    if (scope === 'focus') return focusSetOf(selectedId, PEOPLE, FOCUS_UP, FOCUS_DOWN);
    // 'lineage' — full ancestor + descendant chain
    const s = new Set<string>();
    ancestorsOf(selectedId, PEOPLE).forEach((a) => s.add(a));
    descendantsOf(selectedId, PEOPLE).forEach((d) => s.add(d));
    return s;
  }, [scope, selectedId]);

  /* ------------------ Header callbacks ------------------ */

  const onViewChange = (v: ViewMode) => {
    setView(v);
    if (v === 'book') return;
    // After view flips, re-fit current scope.
    window.setTimeout(() => {
      if (focusSet) canvasRef.current?.fitTo(Array.from(focusSet));
      else if (selectedId) canvasRef.current?.focusOn(selectedId);
      else canvasRef.current?.homeView();
    }, 30);
  };

  const onScopeChange = (next: FocusScope) => {
    if ((next === 'focus' || next === 'lineage') && !selectedId) {
      window.alert(I18N[lang].click_a_name);
      return;
    }
    setScope(next);
    window.setTimeout(() => {
      if (next === 'all') {
        canvasRef.current?.fitTo(null);
        return;
      }
      const set = next === 'focus'
        ? focusSetOf(selectedId!, PEOPLE, FOCUS_UP, FOCUS_DOWN)
        : new Set<string>([
            ...ancestorsOf(selectedId!, PEOPLE),
            ...descendantsOf(selectedId!, PEOPLE),
          ]);
      canvasRef.current?.fitTo(Array.from(set));
    }, 30);
  };

  const onLangChange = (l: Lang) => {
    setLang(l);
    saveLang(l);
    if (typeof document !== 'undefined') document.documentElement.lang = l;
  };

  const onSearchPick = (id: string) => {
    setSelectedId(id);
    setScope('focus');
    setMatchedIds(new Set());
    if (view === 'book') return; // book view uses selectedId directly
    window.setTimeout(() => {
      const set = focusSetOf(id, PEOPLE, FOCUS_UP, FOCUS_DOWN);
      canvasRef.current?.fitTo(Array.from(set));
    }, 30);
  };

  const onExport = () => {
    const out = { ...DATA, edits };
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vansavali_export.json';
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 100);
  };

  /* ------------------ Tree node interactions ------------------ */

  const onPickNode = (id: string, kind: 'click' | 'dblclick') => {
    setSelectedId(id);
    // A click always shifts the camera to a 3-up / 3-down focused window.
    setScope('focus');
    if (editMode) {
      setPanelMode('edit');
      setPanelPersonId(id);
      setPanelOpen(true);
    } else if (kind === 'dblclick') {
      // Double-click → open the lineage detail panel.
      setPanelMode('lineage');
      setPanelPersonId(id);
      setPanelOpen(true);
    }
    window.setTimeout(() => {
      const set = focusSetOf(id, PEOPLE, FOCUS_UP, FOCUS_DOWN);
      canvasRef.current?.fitTo(Array.from(set));
    }, 30);
  };

  const onHover = (id: string | null, x: number, y: number) => {
    setHoverId(id);
    setHoverXY({ x, y });
  };

  /* ------------------ Side panel callbacks ------------------ */

  const onClosePanel = () => setPanelOpen(false);

  const onSaveEdit = (id: string, edit: PersonEdit) => {
    const next: EditsMap = { ...edits };
    if (Object.keys(edit).length === 0) {
      delete next[id];
    } else {
      next[id] = edit;
    }
    persistEdits(next);
    setPanelOpen(false);
  };

  const onResetEdit = (id: string) => {
    const next: EditsMap = { ...edits };
    delete next[id];
    persistEdits(next);
  };

  const onShowLineageFromPanel = (id: string) => {
    setSelectedId(id);
    setScope('lineage');
    setPanelOpen(false);
    const ids = [
      ...ancestorsOf(id, PEOPLE),
      ...descendantsOf(id, PEOPLE),
    ];
    window.setTimeout(() => canvasRef.current?.fitTo(ids), 30);
  };

  const onShowFullFromPanel = () => {
    setScope('all');
    setPanelOpen(false);
    window.setTimeout(() => canvasRef.current?.fitTo(null), 30);
  };

  const onSwitchToEdit = (id: string) => {
    setPanelMode('edit');
    setPanelPersonId(id);
  };

  const onFocusPersonFromPanel = (id: string) => {
    setSelectedId(id);
    setScope('focus');
    if (view === 'book') return;
    window.setTimeout(() => {
      const set = focusSetOf(id, PEOPLE, FOCUS_UP, FOCUS_DOWN);
      canvasRef.current?.fitTo(Array.from(set));
    }, 30);
  };

  /* ------------------ Header auto-hide ------------------ */

  // Hide after the cursor lingers on the canvas; show again at the top edge.
  const onCanvasMove = useCallback(() => {
    if (headerHover.current) return;
    if (idleTimer.current !== undefined) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      if (!headerHover.current) setHeaderHidden(true);
    }, 800);
  }, []);

  const onCanvasMouseDown = useCallback(() => {
    setHoverId(null); // hide tooltip on drag start
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (e.clientY < 6) {
        setHeaderHidden(false);
        if (idleTimer.current !== undefined) window.clearTimeout(idleTimer.current);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPanelOpen(false);
        setMatchedIds(new Set());
        setHoverId(null);
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const onHeaderEnter = useCallback(() => {
    headerHover.current = true;
    if (idleTimer.current !== undefined) window.clearTimeout(idleTimer.current);
    setHeaderHidden(false);
  }, []);
  const onHeaderLeave = useCallback(() => {
    headerHover.current = false;
  }, []);

  const t = I18N[lang];

  /* ------------------ Render ------------------ */
  return (
    <>
      <Splash />

      <Header
        lang={lang}
        view={view}
        scope={scope}
        hasSelected={selectedId !== null}
        editMode={editMode}
        hidden={headerHidden}
        onViewChange={onViewChange}
        onScopeChange={onScopeChange}
        onLangChange={onLangChange}
        onEditModeToggle={() => setEditMode((m) => !m)}
        onExport={onExport}
        onSearchPick={onSearchPick}
        onMouseEnter={onHeaderEnter}
        onMouseLeave={onHeaderLeave}
      />

      {view === 'book' ? (
        <BookView
          rootId={ROOT_ID}
          selectedId={selectedId}
          edits={edits}
          lang={lang}
          onPickPerson={onFocusPersonFromPanel}
        />
      ) : (
        <>
          <TreeCanvas
            ref={canvasRef}
            view={view}
            lang={lang}
            selectedId={selectedId}
            matchedIds={matchedIds}
            focusSet={focusSet}
            onPickNode={onPickNode}
            onHover={onHover}
            onCanvasMove={onCanvasMove}
            onCanvasMouseDown={onCanvasMouseDown}
          />

          <Tooltip person={hoverPerson} mouseX={hoverXY.x} mouseY={hoverXY.y} lang={lang} />

          <div className="zoomctrl">
            <button title="Zoom in"  onClick={() => canvasRef.current?.zoomBy(1.15)}>+</button>
            <button title="Zoom out" onClick={() => canvasRef.current?.zoomBy(1 / 1.15)}>−</button>
            <button title={t.fit}    onClick={() => { setScope('all'); canvasRef.current?.fitTo(null); }}>⊡</button>
          </div>

          <div className="legend latin">{t.legend}</div>
        </>
      )}

      <SidePanel
        open={panelOpen}
        mode={panelMode}
        personId={panelPersonId}
        edits={edits}
        lang={lang}
        view={view}
        onClose={onClosePanel}
        onSaveEdit={onSaveEdit}
        onResetEdit={onResetEdit}
        onShowLineage={onShowLineageFromPanel}
        onShowFull={onShowFullFromPanel}
        onSwitchToEdit={onSwitchToEdit}
        onFocusPerson={onFocusPersonFromPanel}
      />
    </>
  );
}
