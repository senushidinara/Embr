import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EmbryoScene } from "@/components/EmbryoScene";
import { DAYS } from "@/lib/embryo-days";

export const Route = createFileRoute("/")({
  component: Index,
});

type Plane = "sagittal" | "transverse" | "coronal";
type ProjectedLabel = { key: string; text: string; description: string; screen: { x: number; y: number; visible: boolean } };
type Tab = "overview" | "structure" | "em" | "signaling" | "events" | "molecular" | "clinical";

function Index() {
  const [dayIdx, setDayIdx] = useState(0);
  const [xray, setXray] = useState(false);
  const [explode, setExplode] = useState(0);
  const [slicePlane, setSlicePlane] = useState<Plane | "off">("off");
  const [sliceDepth, setSliceDepth] = useState(0);
  const [labels, setLabels] = useState<ProjectedLabel[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [webglError, setWebglError] = useState(false);

  // Video playback
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [panelOpen, setPanelOpen] = useState(true);

  const day = DAYS[dayIdx];
  const onLabels = useCallback((l: ProjectedLabel[]) => setLabels(l), []);
  const selectedLabel = labels.find((l) => l.key === selected) ?? null;

  // Playback loop — advance day every N ms depending on speed
  const lastTickRef = useRef<number>(0);
  useEffect(() => {
    if (!playing) return;
    const perStep = 1400 / speed; // ms per day at 1x
    let raf = 0;
    lastTickRef.current = performance.now();
    const tick = (t: number) => {
      const elapsed = t - lastTickRef.current;
      if (elapsed >= perStep) {
        lastTickRef.current = t;
        setDayIdx((i) => {
          if (i >= DAYS.length - 1) {
            setPlaying(false);
            return i;
          }
          return i + 1;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed]);

  // Reset label selection when day changes
  useEffect(() => { setSelected(null); }, [dayIdx]);

  // Keyboard controls: ← → to step, space to play/pause
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          setDayIdx((i) => Math.min(DAYS.length - 1, i + 1));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setDayIdx((i) => Math.max(0, i - 1));
          break;
        case " ":
          e.preventDefault();
          setPlaying((p) => !p);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const positionLabels = (labels: ProjectedLabel[]) => {
    const positioned = [...labels];
    const labelSize = { w: 140, h: 28 };
    const padding = 12;
    const minDist = 85;

    for (let i = 0; i < positioned.length; i++) {
      let attempts = 0;
      const maxAttempts = 12;

      while (attempts < maxAttempts) {
        let x = positioned[i].screen.x;
        let y = positioned[i].screen.y;

        // Clamp to viewport with padding
        const w = window.innerWidth;
        const h = window.innerHeight;
        x = Math.max(padding + labelSize.w / 2, Math.min(w - padding - labelSize.w / 2, x));
        y = Math.max(padding + labelSize.h / 2, Math.min(h - padding - labelSize.h / 2, y));

        // Check collision with previous labels
        let collided = false;
        for (let j = 0; j < i; j++) {
          const other = positioned[j].screen;
          const dx = x - other.x;
          const dy = y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            collided = true;
            const angle = Math.atan2(dy, dx);
            x = other.x + Math.cos(angle) * minDist;
            y = other.y + Math.sin(angle) * minDist;
            break;
          }
        }

        if (!collided) {
          positioned[i].screen.x = x;
          positioned[i].screen.y = y;
          break;
        }
        attempts++;
      }
    }

    return positioned;
  };

  const adjustedLabels = useMemo(() => {
    // Memoize only when labels actually change to improve performance
    return positionLabels(labels);
  }, [labels]);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <EmbryoScene
        day={day.day}
        xray={xray}
        explode={explode}
        slicePlane={slicePlane}
        sliceDepth={sliceDepth}
        onLabels={onLabels}
        selectedLabel={selected}
      />

      {/* Label overlays */}
      <div className="label-container pointer-events-none absolute inset-0">
        {adjustedLabels.map((lb) =>
          lb.screen.visible ? (
            <button
              key={lb.key}
              onClick={() => setSelected(lb.key === selected ? null : lb.key)}
              className={`label-button pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2.5 py-1 text-[11px] font-medium mono transition-all duration-150 will-change-transform
                ${selected === lb.key
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_0_20px_rgba(255,100,170,0.6)] scale-105"
                  : "border-white/25 bg-black/45 text-white/90 backdrop-blur-md hover:border-primary/70 hover:bg-black/55"}`}
              style={{ left: `${lb.screen.x}px`, top: `${lb.screen.y}px` }}
              title={lb.text}
              type="button"
            >
              <span className="label-dot mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
              {lb.text}
            </button>
          ) : null,
        )}
      </div>

      {/* Header */}
      <header className="pointer-events-none absolute top-0 left-0 right-0 z-10 p-2 sm:p-3 md:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2 sm:gap-3">
          <div className="pointer-events-auto glass rounded-2xl px-3 sm:px-3.5 py-2 sm:py-2.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-primary heart-dot flex-shrink-0" />
              <h1 className="text-xs sm:text-sm md:text-base font-semibold tracking-tight truncate">Embryo Atlas</h1>
              <span className="mono text-[9px] text-muted-foreground hidden md:inline whitespace-nowrap">day-by-day · week 1–4</span>
            </div>
            <p className="mt-0.5 text-[10px] sm:text-[11px] text-muted-foreground max-w-[260px] hidden sm:block">
              Drag orbit · scroll zoom · tap labels · slice & explore
            </p>
          </div>

          <div className="pointer-events-auto glass rounded-2xl px-3 sm:px-3.5 py-2 sm:py-2.5 min-w-[140px] sm:min-w-[160px] md:min-w-[220px] flex-shrink-0">
            <div className="mono text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground">
              D{day.day} · W{day.week}
            </div>
            <div className="mt-0.5 text-xs sm:text-sm md:text-base font-semibold leading-tight truncate">{day.title}</div>
            <dl className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] sm:text-[10px] md:text-[11px]">
              <dt className="text-muted-foreground">Size</dt><dd className="mono truncate">{day.size}</dd>
              <dt className="text-muted-foreground">Cells</dt><dd className="mono truncate text-[8px]">{day.cellCount}</dd>
            </dl>
          </div>
        </div>
      </header>

      {/* Left controls - Hidden on mobile, visible on tablet+ */}
      <aside className="hidden sm:block absolute left-2 md:left-4 top-28 md:top-32 z-10 w-[168px] md:w-[212px]">
        <div className="glass rounded-2xl p-2.5 md:p-3 space-y-3">
          <ControlBlock title="View">
            <ToggleRow label="X-Ray" active={xray} onClick={() => setXray(!xray)} />
            <div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                <span>Explode</span><span className="mono">{Math.round(explode * 100)}%</span>
              </div>
              <input
                type="range" min={0} max={1} step={0.01} value={explode}
                onChange={(e) => setExplode(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </ControlBlock>

          <ControlBlock title="Slice">
            <div className="grid grid-cols-3 gap-1">
              {(["sagittal", "transverse", "coronal"] as Plane[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setSlicePlane(slicePlane === p ? "off" : p)}
                  className={`view-plane-btn rounded-lg px-1 py-1.5 text-[10px] font-medium transition
                    ${slicePlane === p ? "bg-primary text-primary-foreground" : "bg-white/5 hover:bg-white/10"}`}
                >
                  {p[0].toUpperCase() + p.slice(1, 3)}
                </button>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                <span>Depth</span><span className="mono">{sliceDepth.toFixed(2)}</span>
              </div>
              <input
                type="range" min={-1} max={1} step={0.01} value={sliceDepth}
                disabled={slicePlane === "off"}
                onChange={(e) => setSliceDepth(parseFloat(e.target.value))}
                className="w-full accent-primary disabled:opacity-40"
              />
            </div>
          </ControlBlock>
        </div>
      </aside>

      {/* Right detail panel - Responsive sizing */}
      <div className="absolute right-2 md:right-4 top-28 md:top-32 z-10 w-[min(90vw,220px)] sm:w-[220px] md:w-[320px] max-h-[calc(100vh-260px)]">
        <div className="glass rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-260px)]">
          <button
            className="panel-header flex items-center justify-between px-3 sm:px-3.5 py-2 sm:py-2.5 border-b border-white/10 text-left hover:bg-white/5 transition gap-2"
            onClick={() => setPanelOpen(!panelOpen)}
          >
            <div className="min-w-0 flex-1">
              <div className="mono text-[8px] sm:text-[10px] uppercase tracking-widest text-primary">
                {selectedLabel ? "Structure" : "What happens"}
              </div>
              <div className="text-xs sm:text-sm font-semibold leading-tight mt-0.5 truncate">
                {selectedLabel ? selectedLabel.text : day.headline}
              </div>
            </div>
            <span className={`mono text-[10px] transition flex-shrink-0 ${panelOpen ? "" : "rotate-180"}`}>▾</span>
          </button>

          {panelOpen && (
            <div className="flex-1 overflow-y-auto">
              {selectedLabel ? (
                <div className="p-3 sm:p-3.5">
                  <p className="text-[11px] sm:text-[12px] leading-relaxed text-foreground/85">{selectedLabel.description}</p>
                  <button
                    onClick={() => setSelected(null)}
                    className="mt-3 text-[10px] sm:text-[11px] text-primary hover:underline"
                  >
                    ← Back to Day {day.day}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex border-b border-white/10 sticky top-0 bg-black/30 backdrop-blur overflow-x-auto no-scrollbar">
                    {(["overview", "structure", "em", "signaling", "events", "molecular", "clinical"] as Tab[])
                      .filter((t) => t !== "clinical" || day.clinical)
                      .map((t) => (
                        <button
                          key={t}
                          onClick={() => setTab(t)}
                          className={`info-tab shrink-0 px-1.5 sm:px-2.5 py-2 text-[9px] sm:text-[10px] mono uppercase tracking-wider transition
                            ${tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          {t === "em" ? "Epi↔Mes" : t === "structure" ? "Structure" : t === "signaling" ? "Signals" : t}
                        </button>
                      ))}
                  </div>
                  <div className="p-3 sm:p-3.5 text-[11px] sm:text-[12px] leading-relaxed">
                    {tab === "overview" && (
                      <>
                        <p className="text-foreground/90">{day.whatHappens}</p>
                        <div className="mt-3 rounded-lg bg-white/5 p-2.5">
                          <div className="mono text-[9px] uppercase tracking-widest text-muted-foreground">Phase</div>
                          <div className="mt-0.5 text-[12px] text-primary">{day.phase}</div>
                        </div>
                      </>
                    )}
                    {tab === "structure" && (
                      <ul className="space-y-1.5">
                        {day.structuralChanges.map((e, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="mono text-primary/70 mt-1">▸</span>
                            <span className="text-foreground/85">{e}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {tab === "em" && (
                      <>
                        <p className="mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                          Epithelial ↔ Mesenchymal interactions
                        </p>
                        <ul className="space-y-1.5">
                          {day.epithelialMesenchymal.map((e, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="mono text-primary/70 mt-1">⇄</span>
                              <span className="text-foreground/85">{e}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {tab === "signaling" && (
                      day.signalingPathways.length ? (
                        <ul className="space-y-2.5">
                          {day.signalingPathways.map((s, i) => (
                            <li key={i} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                              <div className="mono text-[10px] text-primary uppercase tracking-wider">{s.pathway}</div>
                              <div className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px]">
                                <span className="text-muted-foreground mono">Ligand</span>
                                <span className="text-foreground/85">{s.ligand}</span>
                                <span className="text-muted-foreground mono">Receptor</span>
                                <span className="text-foreground/85">{s.receptor}</span>
                                <span className="text-muted-foreground mono">Effect</span>
                                <span className="text-foreground/85">{s.effect}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No key signaling pathways tracked for this day.</p>
                      )
                    )}
                    {tab === "events" && (
                      <ul className="space-y-1.5">
                        {day.keyEvents.map((e, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="mono text-[10px] text-primary/70 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                            <span className="text-foreground/85">{e}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {tab === "molecular" && (
                      day.molecular.length ? (
                        <ul className="space-y-1.5">
                          {day.molecular.map((e, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="mono text-primary/70 mt-1">◆</span>
                              <span className="text-foreground/85 mono text-[11px]">{e}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No key molecular events tracked for this day.</p>
                      )
                    )}
                    {tab === "clinical" && day.clinical && (
                      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                        <div className="mono text-[9px] uppercase tracking-widest text-primary">Clinical note</div>
                        <p className="mt-1 text-foreground/90">{day.clinical}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom timeline + playback */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-1.5 sm:p-2 md:p-4">
        <div className="glass mx-auto max-w-full sm:max-w-4xl rounded-2xl p-2 sm:p-2.5 md:p-3">
          {/* Playback row */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-h-10">
            <button
              onClick={() => {
                if (dayIdx >= DAYS.length - 1) setDayIdx(0);
                setPlaying(!playing);
              }}
              className="playback-btn flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_rgb(255_100_170/0.4)] hover:scale-105 transition flex-shrink-0"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

            <button
              onClick={() => setDayIdx(Math.max(0, dayIdx - 1))}
              disabled={dayIdx === 0}
              className="nav-btn rounded-lg px-1.5 sm:px-2 py-1.5 sm:py-2 bg-white/5 hover:bg-white/10 text-foreground/80 disabled:opacity-30 transition text-sm sm:text-base flex-shrink-0"
              aria-label="Previous day"
            >‹</button>
            <button
              onClick={() => setDayIdx(Math.min(DAYS.length - 1, dayIdx + 1))}
              disabled={dayIdx === DAYS.length - 1}
              className="nav-btn rounded-lg px-1.5 sm:px-2 py-1.5 sm:py-2 bg-white/5 hover:bg-white/10 text-foreground/80 disabled:opacity-30 transition text-sm sm:text-base flex-shrink-0"
              aria-label="Next day"
            >›</button>

            <div className="flex-1 min-w-0">
              <div className="mono text-[9px] sm:text-[10px] text-muted-foreground flex justify-between">
                <span className="truncate">D{day.day} W{day.week}</span>
                <span className="hidden sm:inline ml-2 flex-shrink-0">{dayIdx + 1}/{DAYS.length}</span>
              </div>
              <input
                type="range"
                min={0} max={DAYS.length - 1} step={1}
                value={dayIdx}
                onInput={(e) => setDayIdx(parseInt((e.target as HTMLInputElement).value))}
                onChange={(e) => setDayIdx(parseInt(e.target.value))}
                className="w-full accent-primary mt-1 h-1.5"
              />
            </div>

            <div className="hidden sm:flex items-center gap-0.5 md:gap-1 flex-shrink-0">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`speed-btn rounded-md px-1.5 sm:px-2 py-1 mono text-[9px] sm:text-[10px] transition
                    ${speed === s ? "bg-primary text-primary-foreground" : "bg-white/5 hover:bg-white/10 text-foreground/70"}`}
                >{s}×</button>
              ))}
            </div>
          </div>

          {/* Day chips row - horizontal scroll */}
          <div className="mt-2 sm:mt-2.5 flex gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar pb-0.5">
            {DAYS.map((d, i) => (
              <button
                key={d.day}
                onClick={() => setDayIdx(i)}
                className={`day-chip shrink-0 rounded-lg px-1.5 sm:px-2 py-1 sm:py-1.5 min-w-[48px] sm:min-w-[54px] text-left transition
                  ${i === dayIdx
                    ? "bg-primary text-primary-foreground shadow-[0_0_16px_rgb(255_100_170/0.4)]"
                    : "bg-white/5 hover:bg-white/10 text-foreground/70"}`}
              >
                <div className="mono text-[8px] sm:text-[9px] opacity-80">D{d.day}</div>
                <div className="text-[9px] sm:text-[10px] font-semibold leading-tight truncate">{d.title}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function ControlBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ToggleRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12px] transition-all duration-150
        ${active ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(255,61,138,0.3)]" : "bg-white/5 hover:bg-white/10 text-foreground"}`}
      aria-pressed={active}
    >
      <span>{label}</span>
      <span className={`mono text-[10px] font-semibold ${active ? "opacity-90" : "opacity-60"}`}>{active ? "ON" : "OFF"}</span>
    </button>
  );
}
