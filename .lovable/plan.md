## Goal

Right now 28 days reuse only 7 scenes (`day1`, `day3`, `day5`, `day8`, `day16`, `day21`, `day28`), so scrubbing the timeline shows the same frame for 3–4 days in a row. I'll give every one of the 28 days its own visually distinct 3D scene with at least 10 concurrent animated actions, and make day-to-day navigation crossfade instead of hard-swap.

## What changes

### 1. A dedicated scene per day (`src/lib/embryo-day-scenes.ts`)

New builder `buildDayScene(day: number): StageBuild` returning a Three.js group + labels + an `update(t)` loop with 10+ animated actions per day. Each day advances the previous day's morphology so consecutive days look related but never identical.

Examples of what "10 actions" means per day (not repeated across days):

- **Day 1 (Fertilization)**: sperm swimming toward oocyte, acrosome flash, calcium wave sweep, cortical granule exocytosis dots, polar body extrusion, 2 pronuclei drifting + pulsing, zona hardening shimmer, meiotic spindle rotation, sperm tail detachment, PLCζ glow oscillation.
- **Day 2 (First cleavage)**: pronuclear fusion, spindle assembly + rotation, chromosome alignment, cleavage furrow forming, membrane pinch, 2 blastomere separation, zona rotation drift down tube, cilia flow lines, cytoplasm streaming, MPF flash.
- **Day 3 (Compaction)**: 8→16 blastomere divisions in staggered timing, cells flattening onto each other, tight-junction sparks at contacts, apical polarity arrows, E-cadherin edge glow, Hippo YAP pulse in outer cells, Oct4 glow in inner cells, morula rotation, mulberry surface texture pulse, cell-jitter breathing.
- **Day 4 (Late morula, pre-cavitation)**: Na⁺/K⁺ pump arrows on outer cells, water droplets flowing inward, micro-cavities blinking then merging, ICM crowding to one pole, aquaporin flashes, uterine wall backdrop appearing, zona still visible, outer cells stretching flatter, blastocoele bubble growing, tubal cilia fading out.
- **Day 5–7 (blastocyst, hatching, apposition)**: cavity expansion pulses, ICM/TE colour split, FGF4 arrows, hatching crack + emerging sphere, zona shedding fragments, blastocyst rotation, integrin dots lighting up, endometrium approach, syncytio/cyto split, hCG particles rising.
- **Day 8–13 (bilaminar + implantation)**: syncytiotrophoblast fingers extending, lacunae opening + filling red, Heuser's membrane sweeping across, amnion dome growing, yolk-sac dome growing, extraembryonic mesoderm particles, chorionic cavity carving out, connecting stalk stretching, decidual cells lighting up, maternal capillaries eroding.
- **Day 14–17 (gastrulation)**: primitive streak carving in, node forming, epiblast cells streaming into streak, mesoderm sheet spreading, endoderm sheet slipping under, notochord elongating, wing-like paraxial mesoderm forming, node cilia rotating, Nodal gradient wash, three-layer explode pulse.
- **Day 18–23 (neurulation)**: neural plate flattening, neural folds rising like a zipper closing head→tail, neural crest cells peeling off top, somites pinching off in sequential pairs (rostro-caudal), notochord glowing beneath, ANP/PNP closure animations, dorsal aorta forming, first blood islands, heart tube forming and looping, first faint heartbeat.
- **Day 24–28 (organogenesis)**: heart looping progression (straight → S → C), pharyngeal arch bumps forming one by one, optic/otic pits, limb buds emerging, C-shape body curling, tail bud extending, blood flow particle stream, brain vesicles inflating (prosen/mes/rhomben), somite count climbing, heartbeat pulse getting stronger.

### 2. Wire `EmbryoScene` to accept `day: number`

Change prop `stage: StageId` → `day: number`. When day changes:

- Crossfade the current scene group's opacity to 0 (~250 ms), then dispose and swap in the new scene, fading it up from 0. Camera rotation is preserved.
- Keep a small `THREE.Group` with two children (`prev`, `next`) so both render during the transition — no black gap.

### 3. Smoother timeline UX (`src/routes/index.tsx`)

- Bump default playback to ~1400 ms/day (feels more like a movie, less like ticks).
- Range slider: use `onInput` (not just `onChange`) so scrubbing is real-time.
- Add keyboard: ←/→ steps day, space toggles play.
- Preload the next day's scene builder off the main thread with `requestIdleCallback` so day flips don't stutter.
- The day-chip strip auto-scrolls the active chip into view.

### 4. Keep everything else intact

`STAGES` metadata, the `DAYS` content in `embryo-days.ts`, the info panel, x-ray, explode, and slicing all keep working — the slicing plane and clipping still apply to the new per-day groups.

## Technical notes

- `buildDayScene` uses small helper factories (`makeCell`, `makeArrow`, `makePulse`, `makeParticleStream`, `makeCurveTube`) shared across days so file size stays reasonable (~1500 LOC total) while each day still composes a unique arrangement.
- `update(t)` per day is one closure that mutates ≥10 objects per frame (positions, scales, emissive intensity, material opacity, geometry morphs where cheap).
- Transitions use `MeshPhysicalMaterial.opacity` tweened in the same RAF loop already in `EmbryoScene` — no new animation library.
- No new npm packages.

## Out of scope

- Rewriting anatomy of days 16/21/28 from scratch — those existing builders become the seed for their day-range variants.
- Realistic tissue rendering (volumetrics, SSS) — sticks to `MeshPhysicalMaterial`.
- New pages/routes.
