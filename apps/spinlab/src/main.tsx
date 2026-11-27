import { render } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import {
  autoSpin, BUILTIN_SCENES, describeScene, FRONT, GHOST_GUIDE, GHOST_HONEST_LINE, GHOST_SMALL_SCREEN_LINE, ghostDeskFits, PAPER_MM,
  prefersReducedMotion, project, renderCard, renderFlat, renderGhostDesk, renderWindow, rotateByDrag, rotateByKey, windowNote,
  type Ctx, type Paper, type Tilt, type ViewParams,
} from "@phantom/kit";
import "./style.css";

const MODES = ["Flat", "Window", "Ghost Desk", "Card"] as const;
type Mode = (typeof MODES)[number];

function App() {
  const [sceneIx, setSceneIx] = useState(0);
  const [mode, setMode] = useState<Mode>("Flat");
  const [view, setView] = useState<ViewParams>({ yaw: 0.6, pitch: 0.35 });
  const [ghostAngle, setGhostAngle] = useState(0);
  const [tilt, setTilt] = useState<Tilt | null>(null);
  const [paper, setPaper] = useState<Paper>("A4");
  const [side, setSide] = useState(360);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const reduced = useRef(prefersReducedMotion());
  const scene = BUILTIN_SCENES[sceneIx];

  useEffect(() => {
    const fit = () => setSide(Math.max(200, Math.min(720, window.innerWidth - 32, mode === "Ghost Desk" ? window.innerHeight - 24 : 560)));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [mode]);

  useEffect(() => {
    const on = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) setTilt({ beta: e.beta, gamma: e.gamma });
    };
    window.addEventListener("deviceorientation", on);
    return () => window.removeEventListener("deviceorientation", on);
  }, []);

  // Ghost Desk turns by itself unless the user asked for less motion.
  useEffect(() => {
    if (mode !== "Ghost Desk" || autoSpin(reduced.current) === 0) return;
    let raf = 0, last = performance.now();
    const tick = (now: number) => {
      setGhostAngle((a) => a + (autoSpin(reduced.current) * (now - last)) / 1000);
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  useEffect(() => {
    const c = canvas.current;
    if (!c || mode === "Card") return;
    const dpr = window.devicePixelRatio || 1;
    c.width = Math.round(side * dpr);
    c.height = Math.round(side * dpr);
    const g = c.getContext("2d");
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const ctx = g as unknown as Ctx;
    if (mode === "Flat") renderFlat(project(scene, view), ctx, side, side);
    else if (mode === "Window") renderWindow(scene, tilt, ctx, side, side, view);
    else renderGhostDesk(scene, ghostAngle, ctx, side, side);
  }, [mode, scene, view, tilt, ghostAngle, side]);

  const choose = async (m: Mode) => {
    if (m === "Window") {
      const D = (globalThis as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
      try {
        if (D?.requestPermission && (await D.requestPermission()) !== "granted") setTilt(null);
      } catch {
        setTilt(null);
      }
    }
    setMode(m);
  };

  const turn = (next: ViewParams | null) => {
    if (!next) return false;
    if (mode === "Ghost Desk") setGhostAngle(next.yaw);
    else setView(next);
    return true;
  };

  const cardSvg = mode === "Card" ? renderCard(scene, undefined, paper) : "";
  const { w, h } = PAPER_MM[paper];

  return (
    <main class={mode === "Ghost Desk" ? "ghost" : ""}>
      <div class="no-print bar">
        <h1>Spin Lab</h1>
        <div class="row" role="group" aria-label="Shape">
          {BUILTIN_SCENES.map((s, i) => (
            <button type="button" key={s.id} aria-pressed={i === sceneIx} onClick={() => setSceneIx(i)}>{s.title}</button>
          ))}
        </div>
        <div class="row" role="group" aria-label="Output">
          {MODES.map((m) => (
            <button type="button" key={m} class="mode" aria-pressed={m === mode} onClick={() => choose(m)}>{m}</button>
          ))}
        </div>
      </div>

      {mode !== "Card" && (
        <section class="stage">
          <canvas
            ref={canvas}
            style={{ width: `${side}px`, height: `${side}px` }}
            tabIndex={0}
            role="img"
            aria-label={describeScene(scene, mode === "Flat" ? "flat" : mode === "Window" ? "window" : "ghost-desk")}
            onKeyDown={(e) => {
              if (turn(rotateByKey(mode === "Ghost Desk" ? { ...FRONT, yaw: ghostAngle } : view, e.key))) e.preventDefault();
            }}
            onPointerDown={(e) => {
              drag.current = { x: e.clientX, y: e.clientY };
              (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!drag.current) return;
              const d = rotateByDrag(mode === "Ghost Desk" ? { ...FRONT, yaw: ghostAngle } : view, e.clientX - drag.current.x, e.clientY - drag.current.y);
              drag.current = { x: e.clientX, y: e.clientY };
              turn(d);
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          />
          <p class="hint">
            {mode === "Window" ? windowNote(tilt) : "Drag the shape, or press the arrow keys, to turn it."}
          </p>
        </section>
      )}

      {mode === "Ghost Desk" && (
        <section class="info" aria-label="Ghost Desk">
          <p class="honest">{GHOST_HONEST_LINE}</p>
          {!ghostDeskFits(side, side) && <p role="alert">{GHOST_SMALL_SCREEN_LINE}</p>}
          <details open>
            <summary>Setup guide</summary>
            <p class="warn">{GHOST_GUIDE.warning}</p>
            <ol>
              {GHOST_GUIDE.steps.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </details>
        </section>
      )}

      {mode === "Card" && (
        <section class="card-page" style={{ "--pw": `${w}mm`, "--ph": `${h}mm` }}>
          <style>{`@page { size: ${paper === "A4" ? "A4" : "letter"}; margin: 0; }`}</style>
          <div class="no-print row">
            <label>
              Paper{" "}
              <select value={paper} onChange={(e) => setPaper((e.currentTarget.value as Paper) === "Letter" ? "Letter" : "A4")}>
                <option value="A4">A4</option>
                <option value="Letter">US Letter</option>
              </select>
            </label>
            <button type="button" class="primary" onClick={() => window.print()}>Print card</button>
          </div>
          <div class="sheet" dangerouslySetInnerHTML={{ __html: cardSvg }} />
        </section>
      )}
    </main>
  );
}

render(<App />, document.getElementById("app")!);
