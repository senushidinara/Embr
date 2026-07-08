import * as THREE from "three";

export interface DaySceneLabel {
  key: string;
  text: string;
  position: THREE.Vector3;
  description: string;
}

export interface DaySceneBuild {
  group: THREE.Group;
  labels: DaySceneLabel[];
  outerMeshes: THREE.Mesh[];
  explodable: { mesh: THREE.Object3D; dir: THREE.Vector3; base: THREE.Vector3 }[];
  update?: (t: number) => void;
}

// ============================================================
// Helpers
// ============================================================
const mat = (opts: THREE.MeshPhysicalMaterialParameters) =>
  new THREE.MeshPhysicalMaterial({ roughness: 0.35, clearcoat: 0.4, ...opts });

const basicMat = (opts: THREE.MeshBasicMaterialParameters) =>
  new THREE.MeshBasicMaterial(opts);

const mkLabel = (key: string, text: string, p: [number, number, number], desc: string): DaySceneLabel => ({
  key, text, position: new THREE.Vector3(...p), description: desc,
});

function makeParticles(
  n: number,
  color: number,
  radius = 0.03,
): { points: THREE.Mesh[]; seeds: { x: number; y: number; z: number; s: number; ph: number }[] } {
  const points: THREE.Mesh[] = [];
  const seeds: { x: number; y: number; z: number; s: number; ph: number }[] = [];
  const geom = new THREE.SphereGeometry(radius, 8, 8);
  const material = mat({ color, emissive: color, emissiveIntensity: 0.8, transparent: true, opacity: 0.9 });
  for (let i = 0; i < n; i++) {
    const p = new THREE.Mesh(geom, material.clone());
    points.push(p);
    seeds.push({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: (Math.random() - 0.5) * 2,
      s: 0.4 + Math.random() * 1.6,
      ph: Math.random() * Math.PI * 2,
    });
  }
  return { points, seeds };
}

function makeArrow(from: THREE.Vector3, to: THREE.Vector3, color = 0xff88bb): THREE.ArrowHelper {
  const dir = to.clone().sub(from);
  const len = dir.length();
  return new THREE.ArrowHelper(dir.normalize(), from, len, color, len * 0.35, len * 0.2);
}

function makeRing(r: number, thick = 0.02, color = 0xff3d8a, opacity = 0.35) {
  return new THREE.Mesh(
    new THREE.TorusGeometry(r, thick, 12, 64),
    mat({ color, emissive: color, emissiveIntensity: 0.5, transparent: true, opacity }),
  );
}

// Deterministic pseudo-random so scenes rebuild identically.
function rand(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 100000) / 100000;
  };
}

// ============================================================
// PHASE 1 — Pre-implantation (days 1–7)
// ============================================================

// -------- DAY 1 : Fertilization
function day1(): DaySceneBuild {
  const g = new THREE.Group();
  const labels: DaySceneLabel[] = [];
  const outer: THREE.Mesh[] = [];
  const explodable: DaySceneBuild["explodable"] = [];

  // Oocyte + zona
  const zona = new THREE.Mesh(
    new THREE.SphereGeometry(2.4, 64, 64),
    mat({ color: 0xf7c8dc, transmission: 0.85, transparent: true, opacity: 0.35, roughness: 0.15, ior: 1.3 }),
  );
  g.add(zona); outer.push(zona);
  const membrane = new THREE.Mesh(
    new THREE.SphereGeometry(2.0, 48, 48),
    mat({ color: 0xffe4ec, transmission: 0.4, transparent: true, opacity: 0.55, roughness: 0.5 }),
  );
  g.add(membrane); outer.push(membrane);

  // Sperm (head + tail) approaching from left
  const sperm = new THREE.Group();
  const spermHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 16),
    mat({ color: 0xffffff, emissive: 0xffccdd, emissiveIntensity: 0.4 }),
  );
  const spermTail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.005, 0.9, 8),
    mat({ color: 0xffddee, transparent: true, opacity: 0.7 }),
  );
  spermTail.rotation.z = Math.PI / 2;
  spermTail.position.x = -0.5;
  sperm.add(spermHead, spermTail);
  sperm.position.set(-3.5, 0, 0);
  g.add(sperm);

  // Acrosome flash sphere (grows/fades on contact)
  const acrosome = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 20, 20),
    mat({ color: 0xffffcc, emissive: 0xffee77, emissiveIntensity: 1.2, transparent: true, opacity: 0 }),
  );
  g.add(acrosome);

  // Calcium wave ring
  const caWave = makeRing(0.2, 0.03, 0x66ccff, 0);
  caWave.rotation.x = Math.PI / 2;
  g.add(caWave);

  // Cortical granule dots — many around inner surface
  const gr = makeParticles(40, 0xffe4a0, 0.04);
  gr.points.forEach((p, i) => {
    const s = gr.seeds[i];
    const th = s.x * Math.PI, ph = s.y * Math.PI;
    p.position.setFromSphericalCoords(1.95, ph, th);
    g.add(p);
  });

  // Polar body (small sphere in perivitelline space)
  const polar = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 16),
    mat({ color: 0xffb0c8, roughness: 0.5, transparent: true, opacity: 0 }),
  );
  polar.position.set(0, 2.15, 0);
  g.add(polar);

  // Meiotic spindle (fibrous)
  const spindle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8),
    mat({ color: 0xffcce0, emissive: 0xff88bb, emissiveIntensity: 0.6, transparent: true, opacity: 0.9 }),
  );
  spindle.position.set(0, 1.6, 0);
  g.add(spindle);

  // Pronuclei
  const pn1 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 24),
    mat({ color: 0x8ec5ff, emissive: 0x2244aa, emissiveIntensity: 0.4, transparent: true, opacity: 0 }));
  const pn2 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 24),
    mat({ color: 0xffb3c8, emissive: 0xaa2255, emissiveIntensity: 0.4, transparent: true, opacity: 0 }));
  pn1.position.set(-0.6, 0.1, 0);
  pn2.position.set(0.6, -0.1, 0);
  g.add(pn1, pn2);
  explodable.push({ mesh: pn1, dir: new THREE.Vector3(-1, 0, 0), base: pn1.position.clone() });
  explodable.push({ mesh: pn2, dir: new THREE.Vector3(1, 0, 0), base: pn2.position.clone() });

  // PLCζ glow point light
  const plcz = new THREE.PointLight(0xffee88, 0, 3);
  plcz.position.set(0, 0, 0);
  g.add(plcz);

  // Zona shimmer ring
  const shimmer = makeRing(2.42, 0.015, 0xffccee, 0.3);
  shimmer.rotation.x = Math.PI / 2;
  g.add(shimmer);

  labels.push(
    mkLabel("zona", "Zona Pellucida", [0, 2.6, 0], "Glycoprotein shell — hardens after sperm entry."),
    mkLabel("sperm", "Sperm", [-2.8, 0.4, 0], "Single fertilizing sperm; tail detaches after fusion."),
    mkLabel("acrosome", "Acrosome Reaction", [-1.8, 0.2, 0], "Enzymatic burst that digests the zona."),
    mkLabel("polar", "2nd Polar Body", [0.4, 2.35, 0], "Ejected as oocyte completes meiosis II."),
    mkLabel("pn1", "Male Pronucleus", [-0.9, 0.7, 0], "Paternal DNA decondensing."),
    mkLabel("pn2", "Female Pronucleus", [0.9, -0.5, 0], "Maternal DNA awaiting syngamy."),
  );

  const update = (t: number) => {
    // 1. Sperm approach (0–3s), then dock
    const approach = Math.min(1, t / 3);
    sperm.position.x = -3.5 + approach * 3.3;
    sperm.position.y = Math.sin(t * 6) * 0.05;
    // 2. Tail wiggle
    spermTail.rotation.y = Math.sin(t * 20) * 0.4;
    // 3. Acrosome flash on contact
    const flash = Math.max(0, Math.sin((t - 3) * 2)) * (t > 3 && t < 4.5 ? 1 : 0);
    (acrosome.material as THREE.MeshPhysicalMaterial).opacity = flash;
    acrosome.position.copy(sperm.position);
    acrosome.scale.setScalar(1 + flash * 1.5);
    // 4. Calcium wave sweep
    const wave = ((t - 3.5) % 4) / 4;
    if (t > 3.5 && wave > 0) {
      caWave.scale.setScalar(0.2 + wave * 10);
      (caWave.material as THREE.MeshPhysicalMaterial).opacity = Math.max(0, 0.8 * (1 - wave));
    }
    // 5. Cortical granule burst (outward drift)
    gr.points.forEach((p, i) => {
      const s = gr.seeds[i];
      const local = Math.max(0, Math.min(1, (t - 4 - s.ph * 0.3) / 2));
      p.scale.setScalar(1 - local);
      (p.material as THREE.MeshPhysicalMaterial).opacity = 1 - local;
    });
    // 6. Polar body appears
    const pbOp = Math.max(0, Math.min(1, (t - 5) / 1.5));
    (polar.material as THREE.MeshPhysicalMaterial).opacity = pbOp;
    // 7. Meiotic spindle rotation
    spindle.rotation.z = t * 0.5;
    (spindle.material as THREE.MeshPhysicalMaterial).opacity = Math.max(0, 0.9 - Math.max(0, (t - 5.5) / 2));
    // 8. Pronuclei fade in and drift
    const pnOp = Math.max(0, Math.min(1, (t - 6) / 2));
    (pn1.material as THREE.MeshPhysicalMaterial).opacity = pnOp;
    (pn2.material as THREE.MeshPhysicalMaterial).opacity = pnOp;
    pn1.position.x = -0.6 + Math.sin(t * 0.6) * 0.15;
    pn2.position.x = 0.6 + Math.cos(t * 0.5) * 0.15;
    // 9. PLCζ oscillation
    plcz.intensity = t > 3 ? (0.8 + Math.sin(t * 2) * 0.6) : 0;
    // 10. Zona shimmer
    (shimmer.material as THREE.MeshPhysicalMaterial).opacity = 0.15 + Math.abs(Math.sin(t * 1.5)) * 0.3;
    shimmer.rotation.z = t * 0.3;
  };

  return { group: g, labels, outerMeshes: outer, explodable, update };
}

// -------- Small utility: cleavage sphere with N blastomeres inside zona
function cleavageStage(nCells: number, opts: { size?: number; zonaOp?: number } = {}): DaySceneBuild {
  const g = new THREE.Group();
  const labels: DaySceneLabel[] = [];
  const outer: THREE.Mesh[] = [];
  const explodable: DaySceneBuild["explodable"] = [];

  const zonaR = 2.4;
  const zona = new THREE.Mesh(
    new THREE.SphereGeometry(zonaR, 48, 48),
    mat({ color: 0xf7c8dc, transmission: 0.85, transparent: true, opacity: opts.zonaOp ?? 0.3, roughness: 0.15, ior: 1.3 }),
  );
  g.add(zona); outer.push(zona);

  const r = opts.size ?? Math.pow(1 / nCells, 1 / 3) * 1.4;
  const cellGeo = new THREE.SphereGeometry(r, 20, 20);
  const cellMat = mat({ color: 0xffd6e4, roughness: 0.3, clearcoat: 0.7, sheen: 1, sheenColor: 0xffaacc });
  const cells: THREE.Mesh[] = [];
  const R = nCells <= 2 ? 0 : nCells <= 4 ? 0.55 : 0.95;
  const phi = Math.PI * (Math.sqrt(5) - 1);
  const rnd = rand(nCells * 13 + 7);

  if (nCells === 2) {
    for (let i = 0; i < 2; i++) {
      const p = new THREE.Vector3(i === 0 ? -r * 0.95 : r * 0.95, 0, 0);
      const m = new THREE.Mesh(cellGeo, cellMat.clone());
      m.position.copy(p);
      g.add(m); cells.push(m);
      explodable.push({ mesh: m, dir: p.clone().normalize(), base: p.clone() });
    }
  } else {
    for (let i = 0; i < nCells; i++) {
      const y = 1 - (i / Math.max(1, nCells - 1)) * 2;
      const rr = Math.sqrt(Math.max(0, 1 - y * y));
      const th = phi * i;
      const jitter = 0.1 * rnd();
      const p = new THREE.Vector3(
        Math.cos(th) * rr * (R + jitter),
        y * (R + jitter),
        Math.sin(th) * rr * (R + jitter),
      );
      const m = new THREE.Mesh(cellGeo, cellMat.clone());
      m.position.copy(p);
      g.add(m); cells.push(m);
      explodable.push({ mesh: m, dir: p.clone().normalize(), base: p.clone() });
    }
  }

  labels.push(
    mkLabel("cells", `Blastomeres (${nCells})`, [0, 1.6, 0], "Totipotent cleavage cells inside the zona pellucida."),
    mkLabel("zona", "Zona Pellucida", [0, 2.6, 0], "Glycoprotein shell — reductive cleavage keeps outer size constant."),
  );

  const update = (t: number) => {
    cells.forEach((c, i) => {
      const s = 1 + Math.sin(t * 2 + i * 0.7) * 0.04;
      c.scale.setScalar(s);
    });
    zona.rotation.y = t * 0.05;
  };

  return { group: g, labels, outerMeshes: outer, explodable, update };
}

// -------- DAY 2 : First cleavage — 2-cell with visible spindle & furrow
function day2(): DaySceneBuild {
  const base = cleavageStage(2);
  const g = base.group;
  // Spindle rod between the two cells
  const spindle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 1.6, 8),
    mat({ color: 0xffe0ee, emissive: 0xff77bb, emissiveIntensity: 0.7, transparent: true, opacity: 0.7 }),
  );
  spindle.rotation.z = Math.PI / 2;
  g.add(spindle);

  // Chromosome dots on spindle
  const chromos: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const c = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 12),
      mat({ color: 0x88ccff, emissive: 0x2255aa, emissiveIntensity: 0.6 }),
    );
    c.position.set((i - 2.5) * 0.15, 0, 0);
    g.add(c); chromos.push(c);
  }

  // Cleavage furrow ring
  const furrow = makeRing(1.2, 0.02, 0xff2288, 0.5);
  furrow.rotation.y = Math.PI / 2;
  g.add(furrow);

  // Cytoplasm streaming particles
  const cyto = makeParticles(30, 0xffaadd, 0.03);
  cyto.points.forEach((p, i) => {
    const s = cyto.seeds[i];
    p.position.set((s.x) * 1.4, (s.y) * 1.4, (s.z) * 1.4);
    g.add(p);
  });

  // MPF flash light
  const mpf = new THREE.PointLight(0xff88ff, 0, 4);
  g.add(mpf);

  // Tubal cilia arrows (outside zona)
  const arrows: THREE.ArrowHelper[] = [];
  for (let i = 0; i < 4; i++) {
    const a = makeArrow(new THREE.Vector3(-3, -1 + i * 0.6, 0), new THREE.Vector3(-1.5, -1 + i * 0.6, 0), 0x88ffcc);
    g.add(a); arrows.push(a);
  }

  const prevUpdate = base.update!;
  base.update = (t: number) => {
    prevUpdate(t);
    // Spindle
    spindle.rotation.x = t * 0.4;
    (spindle.material as THREE.MeshPhysicalMaterial).opacity = 0.4 + Math.abs(Math.sin(t)) * 0.5;
    // Chromosomes migrate outward
    chromos.forEach((c, i) => {
      const side = i < 3 ? -1 : 1;
      const idx = i < 3 ? i : i - 3;
      c.position.x = side * (0.15 + Math.abs(Math.sin(t * 0.6)) * 0.5) + idx * 0.08 * side;
      c.position.y = Math.sin(t + i) * 0.04;
    });
    // Furrow contracts
    furrow.scale.setScalar(1 + Math.sin(t) * 0.15);
    // Cyto streaming
    cyto.points.forEach((p, i) => {
      const s = cyto.seeds[i];
      p.position.x = Math.cos(t * s.s + s.ph) * 0.9 * (i % 2 === 0 ? -1 : 1) - 0.95 * (i % 2 === 0 ? -1 : 1);
      p.position.y = Math.sin(t * s.s + s.ph) * 0.5;
    });
    // MPF flash pulse
    mpf.intensity = Math.max(0, Math.sin(t * 0.8)) * 2;
    // Cilia arrow drift
    arrows.forEach((a, i) => {
      a.position.x = Math.sin(t * 2 + i) * 0.15;
    });
  };
  return base;
}

// -------- DAY 3 : Compaction — 16 blastomeres with tight junctions
function day3(): DaySceneBuild {
  const base = cleavageStage(16);
  const g = base.group;

  // Tight junction sparks (small emissive dots at contacts)
  const sparks = makeParticles(24, 0xffee88, 0.04);
  sparks.points.forEach((p, i) => {
    const s = sparks.seeds[i];
    p.position.setFromSphericalCoords(1.05, s.y * Math.PI, s.x * Math.PI);
    g.add(p);
  });

  // Polarity arrows on outer cells
  const arrows: THREE.ArrowHelper[] = [];
  for (let i = 0; i < 8; i++) {
    const th = (i / 8) * Math.PI * 2;
    const from = new THREE.Vector3(Math.cos(th) * 1.1, 0, Math.sin(th) * 1.1);
    const to = from.clone().multiplyScalar(1.4);
    const a = makeArrow(from, to, 0x88ccff);
    g.add(a); arrows.push(a);
  }

  // Inner (Oct4+) glow — small blue sphere at center
  const inner = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 20, 20),
    mat({ color: 0x4aa8ff, emissive: 0x1a4a99, emissiveIntensity: 0.6, transparent: true, opacity: 0.7 }),
  );
  g.add(inner);

  // Outer YAP pulse light
  const yap = new THREE.PointLight(0xff88cc, 1, 3);
  yap.position.set(1.4, 0, 0);
  g.add(yap);

  const prevUpdate = base.update!;
  base.update = (t: number) => {
    prevUpdate(t);
    sparks.points.forEach((p, i) => {
      const s = sparks.seeds[i];
      const pulse = Math.abs(Math.sin(t * 3 + s.ph));
      p.scale.setScalar(0.5 + pulse * 1.3);
      (p.material as THREE.MeshPhysicalMaterial).opacity = pulse;
    });
    arrows.forEach((a, i) => {
      a.scale.setScalar(0.5 + Math.abs(Math.sin(t * 1.5 + i)) * 0.8);
    });
    inner.scale.setScalar(1 + Math.sin(t * 2) * 0.08);
    yap.intensity = 0.5 + Math.abs(Math.sin(t * 1.2)) * 1.5;
    yap.position.x = Math.cos(t * 0.6) * 1.4;
    yap.position.z = Math.sin(t * 0.6) * 1.4;
  };
  return base;
}

// -------- DAY 4 : Late morula, micro-cavities forming
function day4(): DaySceneBuild {
  const base = cleavageStage(32, { size: 0.34 });
  const g = base.group;

  // Na/K arrows pointing inward from outer cells
  const naArrows: THREE.ArrowHelper[] = [];
  for (let i = 0; i < 10; i++) {
    const th = (i / 10) * Math.PI * 2;
    const y = (i % 3 - 1) * 0.4;
    const from = new THREE.Vector3(Math.cos(th) * 1.3, y, Math.sin(th) * 1.3);
    const to = from.clone().multiplyScalar(0.3);
    const a = makeArrow(from, to, 0xffee55);
    g.add(a); naArrows.push(a);
  }

  // Micro-cavity blobs (small transparent bubbles inside)
  const cavities: THREE.Mesh[] = [];
  const rnd = rand(41);
  for (let i = 0; i < 6; i++) {
    const c = new THREE.Mesh(
      new THREE.SphereGeometry(0.15 + rnd() * 0.1, 16, 16),
      mat({ color: 0x88ddff, transmission: 0.9, transparent: true, opacity: 0.35, roughness: 0.1 }),
    );
    c.position.set((rnd() - 0.5) * 1.2, (rnd() - 0.5) * 1.2, (rnd() - 0.5) * 1.2);
    g.add(c); cavities.push(c);
  }

  // ICM cluster (eccentric)
  const icm = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 20, 20),
    mat({ color: 0x4aa8ff, emissive: 0x1a4a99, emissiveIntensity: 0.5 }),
  );
  icm.position.set(0, 1, 0);
  g.add(icm);

  // Water droplet particles flowing inward
  const water = makeParticles(20, 0xaaeeff, 0.04);
  water.points.forEach((p, i) => {
    const s = water.seeds[i];
    p.position.set(s.x * 2, s.y * 2, s.z * 2);
    g.add(p);
  });

  const prevUpdate = base.update!;
  base.update = (t: number) => {
    prevUpdate(t);
    naArrows.forEach((a, i) => {
      a.scale.setScalar(0.6 + Math.abs(Math.sin(t * 2 + i * 0.5)) * 0.7);
    });
    cavities.forEach((c, i) => {
      const s = 1 + Math.sin(t * 1.2 + i) * 0.35;
      c.scale.setScalar(s);
    });
    icm.scale.setScalar(1 + Math.sin(t * 1.5) * 0.1);
    water.points.forEach((p, i) => {
      const s = water.seeds[i];
      const phase = ((t * 0.4 + s.ph) % 1);
      const dir = new THREE.Vector3(s.x, s.y, s.z).normalize();
      p.position.copy(dir.multiplyScalar(2 * (1 - phase)));
      (p.material as THREE.MeshPhysicalMaterial).opacity = phase;
    });
  };
  return base;
}

// -------- DAY 5–7 : Blastocyst family (with progression)
function blastocyst(subDay: number): DaySceneBuild {
  const g = new THREE.Group();
  const labels: DaySceneLabel[] = [];
  const outer: THREE.Mesh[] = [];
  const explodable: DaySceneBuild["explodable"] = [];

  // Trophoblast shell
  const trophoR = 2.2;
  const tropho = new THREE.Mesh(
    new THREE.SphereGeometry(trophoR, 64, 64),
    mat({ color: 0xffb3c8, roughness: 0.4, transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
  );
  g.add(tropho); outer.push(tropho);

  // Blastocoele glow
  const cavity = new THREE.Mesh(
    new THREE.SphereGeometry(2.05, 48, 48),
    mat({ color: 0x88ddff, transmission: 0.9, transparent: true, opacity: 0.25, roughness: 0.1, ior: 1.33, thickness: 1 }),
  );
  g.add(cavity);

  // Zona (shrinks/cracks by day 6, gone by day 7)
  const zona = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 48, 48),
    mat({ color: 0xf7c8dc, transmission: 0.85, transparent: true, opacity: subDay < 0.34 ? 0.25 : subDay < 0.67 ? 0.15 : 0.05, roughness: 0.15 }),
  );
  g.add(zona); outer.push(zona);

  // ICM cluster
  const icmGrp = new THREE.Group();
  icmGrp.position.set(0, 1.35, 0);
  const icmMat = mat({ color: 0x4aa8ff, emissive: 0x1a4a99, emissiveIntensity: 0.35 });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = 0.3 + Math.random() * 0.15;
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), icmMat);
    c.position.set(Math.cos(a) * r, (Math.random() - 0.5) * 0.3, Math.sin(a) * r);
    icmGrp.add(c);
  }
  g.add(icmGrp);
  explodable.push({ mesh: icmGrp, dir: new THREE.Vector3(0, 1, 0), base: icmGrp.position.clone() });

  // Primitive endoderm dots (day 5+ inside ICM, facing cavity)
  const pe: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 12, 12),
      mat({ color: 0xffd166, emissive: 0x996611, emissiveIntensity: 0.4 }),
    );
    p.position.set((i - 2.5) * 0.15, 0.85, 0);
    g.add(p); pe.push(p);
  }

  // FGF4 arrows radiating out from ICM
  const fgf: THREE.ArrowHelper[] = [];
  for (let i = 0; i < 6; i++) {
    const th = (i / 6) * Math.PI * 2;
    const from = new THREE.Vector3(Math.cos(th) * 0.3, 1.35, Math.sin(th) * 0.3);
    const to = from.clone().add(new THREE.Vector3(Math.cos(th) * 0.6, -0.3, Math.sin(th) * 0.6));
    const a = makeArrow(from, to, 0xffaa66);
    g.add(a); fgf.push(a);
  }

  // Hatching crack (only for day 6/7)
  const crack = new THREE.Mesh(
    new THREE.TorusGeometry(0.4, 0.03, 8, 24),
    mat({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1, transparent: true, opacity: subDay > 0.34 ? 0.7 : 0 }),
  );
  crack.position.set(2.4, 0, 0);
  crack.lookAt(3.5, 0, 0);
  g.add(crack);

  // Zona fragments floating away (day 6+)
  const frags: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const f = new THREE.Mesh(
      new THREE.PlaneGeometry(0.15, 0.08),
      mat({ color: 0xf7c8dc, transparent: true, opacity: subDay > 0.34 ? 0.5 : 0, side: THREE.DoubleSide }),
    );
    f.position.set(2.6 + Math.random() * 0.6, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2);
    g.add(f); frags.push(f);
  }

  // Endometrium wall (day 7)
  const endo = new THREE.Mesh(
    new THREE.BoxGeometry(6, 4, 0.4),
    mat({ color: 0x992244, roughness: 0.85, transparent: true, opacity: subDay > 0.67 ? 0.7 : 0 }),
  );
  endo.position.set(3.5, 0, 0);
  g.add(endo);

  // Integrin adhesion dots (day 7)
  const integ = makeParticles(12, 0xffee55, 0.06);
  integ.points.forEach((p, i) => {
    const th = (i / 12) * Math.PI * 2;
    p.position.set(2.6, Math.sin(th) * 0.6, Math.cos(th) * 0.6);
    (p.material as THREE.MeshPhysicalMaterial).opacity = subDay > 0.67 ? 1 : 0;
    g.add(p);
  });

  // hCG rising particles (day 7)
  const hcg = makeParticles(10, 0xff88cc, 0.05);
  hcg.points.forEach((p, i) => {
    const s = hcg.seeds[i];
    p.position.set(s.x, -2 + s.y, s.z);
    (p.material as THREE.MeshPhysicalMaterial).opacity = subDay > 0.67 ? 0.7 : 0;
    g.add(p);
  });

  labels.push(
    mkLabel("tropho", "Trophoblast", [-2.3, 0.4, 0], "Outer cells — future placenta."),
    mkLabel("blastocoele", "Blastocoele", [-1.3, -0.3, 0.8], "Fluid-filled cavity."),
    mkLabel("icm", "Inner Cell Mass", [0.3, 1.9, 0], "Pluripotent stem cells → embryo proper."),
  );
  if (subDay > 0.67) labels.push(mkLabel("endo", "Endometrium", [3.5, 1.5, 0], "Maternal uterine lining — adhesion begins."));

  const update = (t: number) => {
    // Cavity pulse
    cavity.scale.setScalar(1 + Math.sin(t * 0.8) * 0.02);
    // ICM breathe
    icmGrp.children.forEach((c, i) => c.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.06));
    // PE sorting drift
    pe.forEach((p, i) => {
      p.position.y = 0.85 + Math.sin(t + i) * 0.05;
      p.position.z = 0.3 * Math.sin(t * 0.5 + i);
    });
    // FGF4 pulse
    fgf.forEach((a, i) => a.scale.setScalar(0.4 + Math.abs(Math.sin(t + i * 0.7)) * 0.8));
    // Hatching crack shimmer
    if (subDay > 0.34) {
      (crack.material as THREE.MeshPhysicalMaterial).opacity = 0.4 + Math.abs(Math.sin(t * 3)) * 0.5;
      crack.scale.setScalar(1 + Math.sin(t * 2) * 0.15);
    }
    // Zona fragments drift
    frags.forEach((f, i) => {
      f.position.x += 0.003;
      f.rotation.z = t + i;
      if (f.position.x > 4) f.position.x = 2.6;
    });
    // Integrin dots pulse
    integ.points.forEach((p, i) => {
      const pulse = Math.abs(Math.sin(t * 2 + i));
      p.scale.setScalar(0.5 + pulse);
    });
    // hCG rise
    hcg.points.forEach((p, i) => {
      const s = hcg.seeds[i];
      const ph = ((t * 0.3 + s.ph) % 1);
      p.position.y = -2 + ph * 4;
      (p.material as THREE.MeshPhysicalMaterial).opacity = subDay > 0.67 ? (1 - ph) * 0.7 : 0;
    });
    // Whole shell subtle rotation
    tropho.rotation.y = t * 0.05;
    // Zona rotation
    zona.rotation.y = -t * 0.03;
  };
  return { group: g, labels, outerMeshes: outer, explodable, update };
}

// ============================================================
// PHASE 2 — Implantation & bilaminar (days 8–13)
// ============================================================
function implantationScene(subDay: number): DaySceneBuild {
  const g = new THREE.Group();
  const labels: DaySceneLabel[] = [];
  const outer: THREE.Mesh[] = [];
  const explodable: DaySceneBuild["explodable"] = [];

  // Endometrium backdrop
  const endo = new THREE.Mesh(
    new THREE.BoxGeometry(6.5, 5, 3.2),
    mat({ color: 0x992244, roughness: 0.85, transparent: true, opacity: 0.55 }),
  );
  endo.position.z = -0.8;
  g.add(endo); outer.push(endo);

  // Syncytiotrophoblast fingers extending outward (grow with subDay)
  const syncytioG = new THREE.Group();
  const fingerColor = 0xdd4477;
  for (let i = 0; i < 10; i++) {
    const len = 0.4 + subDay * 0.8 + Math.random() * 0.2;
    const f = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.14, len, 8),
      mat({ color: fingerColor, roughness: 0.5, emissive: 0x662233, emissiveIntensity: 0.3 }),
    );
    const th = (i / 10) * Math.PI * 2;
    f.position.set(Math.cos(th) * 1.1, Math.sin(th) * 0.6, -0.3 - subDay * 0.4);
    f.lookAt(f.position.clone().add(new THREE.Vector3(Math.cos(th), Math.sin(th) * 0.6, -1)));
    f.rotateX(Math.PI / 2);
    syncytioG.add(f);
  }
  g.add(syncytioG);

  // Bilaminar disc (grows to trilaminar hint by day 13)
  const disc = new THREE.Group();
  const epi = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05 + subDay * 0.15, 1.05 + subDay * 0.15, 0.14, 48, 1),
    mat({ color: 0x4aa8ff, emissive: 0x1a4a99, emissiveIntensity: 0.3 }),
  );
  epi.position.y = 0.09;
  const hypo = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05 + subDay * 0.15, 1.05 + subDay * 0.15, 0.14, 48, 1),
    mat({ color: 0xffd166, emissive: 0x996611, emissiveIntensity: 0.25 }),
  );
  hypo.position.y = -0.09;
  disc.add(epi, hypo);
  g.add(disc);
  explodable.push({ mesh: epi, dir: new THREE.Vector3(0, 1, 0), base: epi.position.clone() });
  explodable.push({ mesh: hypo, dir: new THREE.Vector3(0, -1, 0), base: hypo.position.clone() });

  // Amniotic cavity dome (grows)
  const amnR = 0.9 + subDay * 0.5;
  const amnion = new THREE.Mesh(
    new THREE.SphereGeometry(amnR, 40, 32, 0, Math.PI * 2, 0, Math.PI / 2),
    mat({ color: 0xbfeaff, transmission: 0.9, transparent: true, opacity: 0.4, roughness: 0.1, side: THREE.DoubleSide }),
  );
  amnion.position.y = 0.05;
  g.add(amnion);
  explodable.push({ mesh: amnion, dir: new THREE.Vector3(0, 1, 0), base: amnion.position.clone() });

  // Yolk sac dome (grows)
  const yolkR = 0.95 + subDay * 0.5;
  const yolk = new THREE.Mesh(
    new THREE.SphereGeometry(yolkR, 40, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    mat({ color: 0xffe08a, transmission: 0.85, transparent: true, opacity: 0.45, roughness: 0.15, side: THREE.DoubleSide }),
  );
  yolk.position.y = -0.05;
  g.add(yolk);
  explodable.push({ mesh: yolk, dir: new THREE.Vector3(0, -1, 0), base: yolk.position.clone() });

  // Lacunae (day 9+)
  const lacunae: THREE.Mesh[] = [];
  if (subDay > 0.16) {
    const nL = Math.floor(4 + subDay * 8);
    for (let i = 0; i < nL; i++) {
      const l = new THREE.Mesh(
        new THREE.SphereGeometry(0.13 + Math.random() * 0.1, 16, 16),
        mat({ color: 0xcc2233, emissive: 0x661122, emissiveIntensity: 0.7, transparent: true, opacity: 0.85 }),
      );
      const th = Math.random() * Math.PI * 2;
      const r = 1.4 + Math.random() * 0.5;
      l.position.set(Math.cos(th) * r, Math.sin(th) * r * 0.6, -0.5 - Math.random() * 0.5);
      g.add(l); lacunae.push(l);
    }
  }

  // Heuser's membrane sweep (day 9)
  const heuser = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    mat({ color: 0xffddbb, transparent: true, opacity: subDay > 0.16 ? 0.4 : 0, side: THREE.DoubleSide }),
  );
  heuser.position.y = -0.15;
  g.add(heuser);

  // Connecting stalk (day 12+)
  const stalk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 1, 12),
    mat({ color: 0xff88aa, roughness: 0.5, transparent: true, opacity: subDay > 0.5 ? 0.85 : 0 }),
  );
  stalk.position.set(-1, 0.5, -0.8);
  stalk.rotation.z = Math.PI / 4;
  g.add(stalk);

  // Chorionic villi bumps (day 11+)
  const villi: THREE.Mesh[] = [];
  if (subDay > 0.33) {
    for (let i = 0; i < 5; i++) {
      const v = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.35, 10),
        mat({ color: 0xdd6688, roughness: 0.5 }),
      );
      const th = -Math.PI / 2 + (i - 2) * 0.35;
      v.position.set(Math.cos(th) * 1.6, Math.sin(th) * 1.2, -1.2);
      v.rotation.z = th + Math.PI / 2;
      g.add(v); villi.push(v);
    }
  }

  // Decidualization dots
  const dec = makeParticles(20, 0xffaacc, 0.05);
  dec.points.forEach((p, i) => {
    const s = dec.seeds[i];
    p.position.set(s.x * 2.5, s.y * 2, -1.5 - Math.random() * 0.5);
    g.add(p);
  });

  // Extraembryonic mesoderm particles (day 10+)
  const eem = makeParticles(30, 0xffccaa, 0.04);
  if (subDay > 0.33) {
    eem.points.forEach((p, i) => {
      const s = eem.seeds[i];
      p.position.set(s.x * 2.2, s.y * 1.6, s.z * 1.2);
      g.add(p);
    });
  }

  labels.push(
    mkLabel("epi", "Epiblast", [1.4, 0.4, 0], "Upper layer — gives rise to all germ layers."),
    mkLabel("hypo", "Hypoblast", [1.4, -0.4, 0], "Lower layer — extraembryonic endoderm."),
    mkLabel("amn", "Amniotic Cavity", [0, 1.4, 0], "Fluid space above the disc."),
    mkLabel("yolk", "Yolk Sac", [0, -1.4, 0], "Below the disc — early nutrition, first blood."),
    mkLabel("syncytio", "Syncytiotrophoblast", [-1.6, 0.9, -0.5], "Invasive multinucleated placental layer."),
  );
  if (subDay > 0.16) labels.push(mkLabel("lac", "Lacunae", [1.7, 1, -0.5], "Blood-filled spaces — earliest uteroplacental circulation."));
  if (subDay > 0.5) labels.push(mkLabel("stalk", "Connecting Stalk", [-1.5, 1.1, -0.5], "Precursor of the umbilical cord."));

  const update = (t: number) => {
    // Syncytio fingers wiggle (invasion)
    syncytioG.children.forEach((c, i) => {
      c.scale.y = 1 + Math.sin(t * 1.5 + i) * 0.15;
    });
    // Lacunae blood pulse
    lacunae.forEach((l, i) => {
      const s = 1 + Math.sin(t * 1.2 + i * 0.4) * 0.15;
      l.scale.setScalar(s);
      (l.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.4 + Math.abs(Math.sin(t + i)) * 0.5;
    });
    // Amnion + yolk breathe
    amnion.scale.setScalar(1 + Math.sin(t * 0.5) * 0.03);
    yolk.scale.setScalar(1 + Math.cos(t * 0.5) * 0.03);
    // Disc pulse
    epi.scale.setScalar(1 + Math.sin(t) * 0.02);
    hypo.scale.setScalar(1 + Math.sin(t + 0.5) * 0.02);
    // Heuser sweep
    heuser.rotation.y = t * 0.2;
    // Villi wiggle
    villi.forEach((v, i) => v.rotation.z += 0);
    // Decidualization dots pulse
    dec.points.forEach((p, i) => {
      p.scale.setScalar(0.6 + Math.abs(Math.sin(t + i * 0.3)) * 0.5);
    });
    // EEM particles flow
    if (subDay > 0.33) {
      eem.points.forEach((p, i) => {
        const s = eem.seeds[i];
        p.position.x += Math.sin(t * 0.5 + s.ph) * 0.002;
        p.position.y += Math.cos(t * 0.5 + s.ph) * 0.002;
      });
    }
  };
  return { group: g, labels, outerMeshes: outer, explodable, update };
}

// ============================================================
// PHASE 3 — Gastrulation (days 14–17)
// ============================================================
function gastrulationScene(subDay: number): DaySceneBuild {
  const g = new THREE.Group();
  const labels: DaySceneLabel[] = [];
  const outer: THREE.Mesh[] = [];
  const explodable: DaySceneBuild["explodable"] = [];

  // Ectoderm (top)
  const ecto = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.18, 2.2),
    mat({ color: 0x4aa8ff, emissive: 0x1a4a99, emissiveIntensity: 0.25 }),
  );
  ecto.position.y = 0.42;
  g.add(ecto); outer.push(ecto);
  explodable.push({ mesh: ecto, dir: new THREE.Vector3(0, 1, 0), base: ecto.position.clone() });

  // Primitive streak groove (grows with subDay)
  const streakLen = 0.8 + subDay * 1.4;
  const streak = new THREE.Mesh(
    new THREE.BoxGeometry(streakLen, 0.07, 0.18),
    mat({ color: 0x220033, roughness: 0.8 }),
  );
  streak.position.set(-0.4, 0.52, 0);
  g.add(streak);

  // Primitive node (bulge at rostral end)
  const node = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 16, 16),
    mat({ color: 0xff88ff, emissive: 0xaa33aa, emissiveIntensity: 0.8 }),
  );
  node.position.set(-0.4 - streakLen / 2, 0.55, 0);
  g.add(node);

  // Mesoderm sheet (grows with subDay)
  const mesoW = 2 + subDay * 1.4;
  const meso = new THREE.Mesh(
    new THREE.BoxGeometry(mesoW, 0.16, 1.6 + subDay * 0.6),
    mat({ color: 0xff5599, emissive: 0x881144, emissiveIntensity: 0.35, transparent: true, opacity: 0.4 + subDay * 0.5 }),
  );
  meso.position.y = 0.2;
  g.add(meso);
  explodable.push({ mesh: meso, dir: new THREE.Vector3(0, 0, 0.001), base: meso.position.clone() });

  // Endoderm sheet
  const endo = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.16, 2.2),
    mat({ color: 0xffd166, emissive: 0x996611, emissiveIntensity: 0.25, transparent: true, opacity: 0.5 + subDay * 0.5 }),
  );
  endo.position.y = -0.02;
  g.add(endo);
  explodable.push({ mesh: endo, dir: new THREE.Vector3(0, -1, 0), base: endo.position.clone() });

  // Notochord process (extends anteriorly from node with subDay)
  const notoLen = 0.3 + subDay * 1.6;
  const noto = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, notoLen, 16),
    mat({ color: 0xffee88, emissive: 0xffaa22, emissiveIntensity: 0.7 }),
  );
  noto.rotation.z = Math.PI / 2;
  noto.position.set(-0.4 - streakLen / 2 - notoLen / 2, 0.32, 0);
  g.add(noto);

  // Migrating cells (ingressing at streak)
  const migrate = makeParticles(30, 0xff88cc, 0.06);
  migrate.points.forEach((p, i) => {
    const s = migrate.seeds[i];
    p.position.set(-0.4 + (s.x) * streakLen * 0.5, 0.5, 0);
    g.add(p);
  });

  // Paraxial mesoderm wings (day 16+)
  const wings: THREE.Mesh[] = [];
  if (subDay > 0.4) {
    for (const side of [-1, 1]) {
      const w = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.12, 0.4),
        mat({ color: 0xff77aa, emissive: 0x881155, emissiveIntensity: 0.3 }),
      );
      w.position.set(-0.4, 0.2, side * 0.85);
      g.add(w); wings.push(w);
    }
  }

  // Node cilia (rotating disc)
  const cilia = new THREE.Mesh(
    new THREE.RingGeometry(0.16, 0.28, 24),
    basicMat({ color: 0xffddff, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
  );
  cilia.rotation.x = -Math.PI / 2;
  cilia.position.copy(node.position);
  cilia.position.y = 0.7;
  g.add(cilia);

  // Nodal gradient wash (a soft radial disc)
  const gradient = new THREE.Mesh(
    new THREE.CircleGeometry(2.5, 48),
    basicMat({ color: 0xff66dd, transparent: true, opacity: 0.15, side: THREE.DoubleSide }),
  );
  gradient.rotation.x = -Math.PI / 2;
  gradient.position.y = 0.6;
  g.add(gradient);

  // Prechordal plate (small bump ahead of noto)
  const pc = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 16),
    mat({ color: 0xffee88, emissive: 0xffaa22, emissiveIntensity: 0.6 }),
  );
  pc.position.set(-2.1, 0.32, 0);
  g.add(pc);

  labels.push(
    mkLabel("ecto", "Ectoderm", [1.9, 0.55, 0], "Future skin and nervous system."),
    mkLabel("meso", "Mesoderm", [1.9, 0.25, 0], "New middle layer — muscles, bones, blood."),
    mkLabel("endo", "Endoderm", [1.9, -0.05, 0], "Gut lining, lungs, liver."),
    mkLabel("streak", "Primitive Streak", [0.3, 0.72, 0], "Ingression groove."),
    mkLabel("node", "Primitive Node", [node.position.x - 0.3, 0.85, 0], "Rostral organizer — cilia set left-right asymmetry."),
    mkLabel("noto", "Notochord", [noto.position.x, 0.55, 0], "Axial rod inducing neural tube."),
  );

  const update = (t: number) => {
    // Migrating cells cycle into streak
    migrate.points.forEach((p, i) => {
      const s = migrate.seeds[i];
      const phase = ((t * 0.4 + s.ph / 6) % 1);
      p.position.x = -0.4 + s.x * streakLen * 0.5;
      p.position.y = 0.5 - phase * 0.6;
      p.position.z = s.z * 0.9;
      (p.material as THREE.MeshPhysicalMaterial).opacity = phase < 0.9 ? (1 - phase) : 0;
    });
    // Node cilia rotate
    cilia.rotation.z = t * 3;
    // Nodal gradient pulse
    (gradient.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.abs(Math.sin(t * 0.8)) * 0.15;
    gradient.rotation.z = t * 0.1;
    // Meso spread pulse
    meso.scale.x = 1 + Math.sin(t * 0.6) * 0.02;
    // Noto glow
    (noto.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.5 + Math.abs(Math.sin(t)) * 0.4;
    // Wings pulse
    wings.forEach((w, i) => w.scale.z = 1 + Math.sin(t * 0.8 + i) * 0.1);
    // Streak pulse
    (streak.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0;
    // Node pulse
    node.scale.setScalar(1 + Math.sin(t * 2) * 0.1);
    // Prechordal wobble
    pc.position.y = 0.32 + Math.sin(t * 1.5) * 0.03;
    // Ectoderm glow
    (ecto.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.2 + Math.abs(Math.sin(t * 0.8)) * 0.15;
  };
  return { group: g, labels, outerMeshes: outer, explodable, update };
}

// ============================================================
// PHASE 4 — Neurulation (days 18–23)
// ============================================================
function neurulationScene(subDay: number): DaySceneBuild {
  const g = new THREE.Group();
  const labels: DaySceneLabel[] = [];
  const outer: THREE.Mesh[] = [];
  const explodable: DaySceneBuild["explodable"] = [];

  // Neural tube — split into segments for fold-then-close animation
  // subDay: 0 = flat plate, 1 = tube closed with somites
  const segments = 12;
  const foldAmt = subDay;
  const tubeGroup = new THREE.Group();

  const plateMat = mat({ color: 0x88ccff, emissive: 0x224488, emissiveIntensity: 0.35, roughness: 0.3, side: THREE.DoubleSide });
  const segs: THREE.Mesh[] = [];
  for (let i = 0; i < segments; i++) {
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 0.28, 24, 1, true, 0, Math.PI),
      plateMat,
    );
    seg.rotation.z = Math.PI / 2;
    seg.position.x = (i - segments / 2 + 0.5) * 0.28;
    // fold: rotate top half; when open it's a wide plate.
    // rostro-caudal wave: rostral closes first
    const rostralFrac = 1 - i / segments;
    const localFold = Math.max(0, Math.min(1, foldAmt * 1.6 - rostralFrac * 0.6));
    seg.scale.z = 1 + (1 - localFold) * 2; // flatter when open
    seg.rotation.y = 0;
    tubeGroup.add(seg);
    segs.push(seg);
  }
  g.add(tubeGroup);
  outer.push(...segs);

  // Notochord
  const noto = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 3.4, 16),
    mat({ color: 0xffee88, emissive: 0xffaa22, emissiveIntensity: 0.6 }),
  );
  noto.rotation.z = Math.PI / 2;
  noto.position.y = -0.45;
  g.add(noto);

  // Somites (pairs) — number depends on subDay
  const somCount = Math.floor(3 + subDay * 12);
  const somMat = mat({ color: 0xff77aa, emissive: 0x881144, emissiveIntensity: 0.35, roughness: 0.35 });
  const somites: THREE.Mesh[] = [];
  for (let i = 0; i < somCount; i++) {
    for (const side of [-1, 1]) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), somMat);
      s.position.set((i - somCount / 2 + 0.5) * 0.32, 0, side * 0.55);
      g.add(s); somites.push(s);
      explodable.push({ mesh: s, dir: new THREE.Vector3(0, 0, side), base: s.position.clone() });
    }
  }

  // Neural crest cells peeling (particles migrating outward from top)
  const crest = makeParticles(24, 0xffaa88, 0.05);
  crest.points.forEach((p, i) => {
    const s = crest.seeds[i];
    p.position.set(s.x * 1.6, 0.3, s.z * 0.3);
    g.add(p);
  });

  // Heart tube (day 21+) — a small pulsing pink C
  const heart = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.11, 12, 24, Math.PI * 1.3),
    mat({ color: 0xff2244, emissive: 0xff2244, emissiveIntensity: 0.9, transparent: true, opacity: subDay > 0.4 ? 0.95 : 0 }),
  );
  heart.position.set(-1.5, -0.7, 0.8);
  heart.rotation.y = Math.PI / 2;
  g.add(heart);
  const heartLight = new THREE.PointLight(0xff3355, subDay > 0.4 ? 1.5 : 0, 3);
  heart.add(heartLight);

  // Dorsal aortae (day 20+)
  const aorta: THREE.Mesh[] = [];
  if (subDay > 0.3) {
    for (const side of [-1, 1]) {
      const a = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 3, 12),
        mat({ color: 0xcc2244, emissive: 0x881122, emissiveIntensity: 0.5 }),
      );
      a.rotation.z = Math.PI / 2;
      a.position.set(0, -0.35, side * 0.25);
      g.add(a); aorta.push(a);
    }
  }

  // Blood island particles (yolk sac area)
  const blood = makeParticles(15, 0xff4466, 0.05);
  if (subDay > 0.3) {
    blood.points.forEach((p, i) => {
      const s = blood.seeds[i];
      p.position.set(s.x * 2, -1.2, s.z * 0.8);
      g.add(p);
    });
  }

  // ANP / PNP glow at open neuropores (rostral/caudal)
  const anp = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 12),
    mat({ color: 0xffffff, emissive: 0xffff88, emissiveIntensity: 1, transparent: true, opacity: subDay < 0.9 ? 0.9 : 0 }),
  );
  anp.position.set(-1.7, 0, 0);
  g.add(anp);
  const pnp = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 12),
    mat({ color: 0xffffff, emissive: 0xff88ff, emissiveIntensity: 1, transparent: true, opacity: subDay < 1 ? 0.9 : 0 }),
  );
  pnp.position.set(1.7, 0, 0);
  g.add(pnp);

  // SHH glow from notochord
  const shh = new THREE.PointLight(0xffcc44, 0.9, 3);
  shh.position.set(0, -0.4, 0);
  g.add(shh);

  labels.push(
    mkLabel("tube", "Neural Tube", [0, 0.6, 0], "Folding neural plate — closes rostrally to caudally."),
    mkLabel("noto", "Notochord", [1.6, -0.6, 0], "Signaling rod (SHH) below the tube."),
    mkLabel("som", "Somites (pairs)", [0, 0, 1], "Paraxial mesoderm blocks — future vertebrae & muscles."),
    mkLabel("crest", "Neural Crest", [0, 0.7, 0.5], "Cells peeling from tube crest — will populate face, PNS, melanocytes."),
    mkLabel("anp", "Anterior Neuropore", [-1.9, 0.2, 0], "Rostral opening — closes around day 25."),
    mkLabel("pnp", "Posterior Neuropore", [1.9, 0.2, 0], "Caudal opening — closes around day 27."),
  );
  if (subDay > 0.4) labels.push(mkLabel("heart", "Heart Tube", [-1.5, -0.4, 1.2], "Newly fused tube — first beats."));

  const update = (t: number) => {
    // Segments: gentle wiggle simulating fold consolidation
    segs.forEach((s, i) => {
      s.rotation.z = Math.PI / 2 + Math.sin(t * 0.5 + i * 0.3) * 0.02;
    });
    // Notochord glow
    (noto.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.4 + Math.abs(Math.sin(t)) * 0.5;
    // Somites pulse & sequentially glow rostro-caudal
    somites.forEach((s, i) => {
      const idx = Math.floor(i / 2);
      const gate = Math.max(0, Math.sin(t * 0.5 - idx * 0.3));
      s.scale.setScalar(1 + gate * 0.15);
    });
    // Neural crest particles drift outward
    crest.points.forEach((p, i) => {
      const s = crest.seeds[i];
      const phase = ((t * 0.4 + s.ph) % 1);
      p.position.y = 0.3 + phase * 0.5;
      p.position.z = s.z * 0.3 + Math.sign(s.z) * phase * 0.9;
      (p.material as THREE.MeshPhysicalMaterial).opacity = 1 - phase;
    });
    // Heart pulse
    if (subDay > 0.4) {
      const beat = Math.max(0, Math.sin(t * 2)) * 0.3 + 0.9;
      heart.scale.setScalar(beat);
      heartLight.intensity = 0.5 + Math.max(0, Math.sin(t * 2)) * 2;
    }
    // Blood particles flow along aorta
    blood.points.forEach((p, i) => {
      const s = blood.seeds[i];
      const ph = ((t * 0.6 + s.ph) % 1);
      p.position.x = -1.5 + ph * 3;
      p.position.y = -0.35;
      p.position.z = s.z * 0.25;
    });
    // Neuropore glow flicker
    (anp.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.8 + Math.abs(Math.sin(t * 3)) * 0.6;
    (pnp.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.8 + Math.abs(Math.sin(t * 3 + 1)) * 0.6;
    // SHH pulse
    shh.intensity = 0.5 + Math.abs(Math.sin(t * 1.5)) * 0.8;
  };
  return { group: g, labels, outerMeshes: outer, explodable, update };
}

// ============================================================
// PHASE 5 — Organogenesis (days 24–28)
// ============================================================
function organogenesisScene(subDay: number): DaySceneBuild {
  const g = new THREE.Group();
  const labels: DaySceneLabel[] = [];
  const outer: THREE.Mesh[] = [];
  const explodable: DaySceneBuild["explodable"] = [];

  // C-shaped body — curl amount increases with subDay
  const curl = 0.6 + subDay * 1.1;
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 40 }, (_, i) => {
      const t = i / 39;
      const a = -Math.PI * (0.45 + curl * 0.2) + t * Math.PI * curl * 1.15;
      const r = 1.4 + Math.sin(t * Math.PI) * 0.2;
      return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0);
    }),
  );
  const body = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 80, 0.42, 24, false),
    mat({ color: 0xffcbb0, emissive: 0x552211, emissiveIntensity: 0.2, roughness: 0.45, clearcoat: 0.5 }),
  );
  g.add(body); outer.push(body);

  // Brain vesicles: 3 (day 24-26) → 5 (day 28)
  const headPos = curve.getPoint(0);
  const brainMat = mat({ color: 0xbfa8ff, emissive: 0x442288, emissiveIntensity: 0.35 });
  const nBrains = subDay > 0.6 ? 5 : 3;
  const brains: THREE.Mesh[] = [];
  for (let i = 0; i < nBrains; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.44 - i * 0.03, 24, 24), brainMat);
    const spread = i / Math.max(1, nBrains - 1);
    b.position.copy(headPos).add(new THREE.Vector3(-0.35 + spread * 0.9, 0.4 - spread * 0.15, 0));
    g.add(b); brains.push(b);
    explodable.push({ mesh: b, dir: new THREE.Vector3(spread - 0.5, 1, 0).normalize(), base: b.position.clone() });
  }

  // Pharyngeal arches: 2 (day 24) → 4 (day 27+)
  const nArches = Math.min(4, Math.floor(2 + subDay * 3));
  const neckMat = mat({ color: 0xff9977, roughness: 0.45 });
  const arches: THREE.Mesh[] = [];
  for (let i = 0; i < nArches; i++) {
    const tt = 0.12 + i * 0.04;
    const p = curve.getPoint(tt);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.08, 12, 24), neckMat);
    ring.position.copy(p);
    ring.rotation.y = Math.PI / 2;
    g.add(ring); arches.push(ring);
  }

  // Optic vesicle (day 25+)
  const optic = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 16),
    mat({ color: 0x334455, emissive: 0x2244aa, emissiveIntensity: 0.8, transparent: true, opacity: subDay > 0.2 ? 1 : 0 }),
  );
  optic.position.copy(headPos).add(new THREE.Vector3(-0.55, 0.15, 0.3));
  g.add(optic);

  // Otic pit/vesicle
  const otic = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    mat({ color: 0xffeecc, emissive: 0x887744, emissiveIntensity: 0.6, transparent: true, opacity: subDay > 0.2 ? 1 : 0 }),
  );
  otic.position.copy(headPos).add(new THREE.Vector3(-0.1, 0.15, 0.35));
  g.add(otic);

  // Heart bulge — S-loop → D-loop
  const heartMat = mat({ color: 0xff2244, emissive: 0xff2244, emissiveIntensity: 0.9, roughness: 0.3 });
  const heart = new THREE.Mesh(new THREE.SphereGeometry(0.36 + subDay * 0.06, 32, 32), heartMat);
  const heartPos = curve.getPoint(0.28);
  heart.position.copy(heartPos).add(new THREE.Vector3(0.1, -0.2, 0.35));
  g.add(heart);
  const heartLight = new THREE.PointLight(0xff3355, 2.5, 4);
  heart.add(heartLight);
  explodable.push({ mesh: heart, dir: new THREE.Vector3(1, -0.2, 1).normalize(), base: heart.position.clone() });

  // Limb buds — upper first, lower later
  const limbMat = mat({ color: 0xffb090, roughness: 0.5 });
  const limbs: THREE.Mesh[] = [];
  const limbTs = subDay > 0.4 ? [0.42, 0.72] : subDay > 0.2 ? [0.42] : [];
  for (const tt of limbTs) {
    const p = curve.getPoint(tt);
    const bud1 = new THREE.Mesh(new THREE.SphereGeometry(0.18 + subDay * 0.1, 16, 16), limbMat);
    bud1.position.copy(p).add(new THREE.Vector3(0.2, 0, 0.45));
    const bud2 = new THREE.Mesh(new THREE.SphereGeometry(0.18 + subDay * 0.1, 16, 16), limbMat);
    bud2.position.copy(p).add(new THREE.Vector3(0.2, 0, -0.45));
    g.add(bud1, bud2); limbs.push(bud1, bud2);
  }

  // Tail
  const tailPos = curve.getPoint(1);
  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 0.7, 20),
    mat({ color: 0xffcbb0, roughness: 0.5 }),
  );
  tail.position.copy(tailPos);
  tail.rotation.z = -Math.PI / 4;
  g.add(tail);

  // Somites bumps along the back
  const nSomites = Math.floor(20 + subDay * 22);
  const somMat = mat({ color: 0xff77aa, emissive: 0x881144, emissiveIntensity: 0.3 });
  const somites: THREE.Mesh[] = [];
  const somStep = 0.9 / nSomites;
  for (let i = 0; i < nSomites; i++) {
    const tt = 0.05 + i * somStep;
    if (tt > 0.95) break;
    const p = curve.getPoint(tt);
    const tangent = curve.getTangent(tt);
    const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), somMat);
    s.position.copy(p).add(normal.multiplyScalar(0.4));
    g.add(s); somites.push(s);
  }

  // Blood flow particles along body curve
  const blood = makeParticles(20, 0xff4466, 0.05);
  blood.points.forEach((p) => g.add(p));

  labels.push(
    mkLabel("brain", "Brain Vesicles", [brains[Math.floor(nBrains / 2)].position.x + 0.2, brains[Math.floor(nBrains / 2)].position.y + 0.6, 0], `${nBrains === 5 ? "Five" : "Three"} primary vesicles of the neural tube.`),
    mkLabel("heart", "Beating Heart", [heart.position.x + 0.6, heart.position.y, 0.4], "Looping heart — ~160 BPM."),
    mkLabel("arches", "Pharyngeal Arches", [-1.1, 1.4, 0], `${nArches} arches — face, jaw, throat structures.`),
    mkLabel("optic", "Optic Vesicle", [optic.position.x - 0.4, optic.position.y + 0.3, 0], "Lateral outgrowth of forebrain — future eye."),
    mkLabel("otic", "Otic Pit", [otic.position.x + 0.4, otic.position.y + 0.3, 0], "Ectodermal pit — future inner ear."),
    mkLabel("tail", "Embryonic Tail", [tailPos.x - 0.5, tailPos.y - 0.5, 0], "Transient — will regress."),
  );
  if (limbs.length > 0) labels.push(mkLabel("limbs", "Limb Buds", [1.6, -1.2, 0.5], "Mesenchymal outgrowths — future arms and legs."));

  const bpm = 160 + subDay * 20;
  const update = (t: number) => {
    // Heart beat
    const beat = (t * bpm) / 60;
    const bs = 1 + Math.max(0, Math.sin(beat * Math.PI * 2)) * 0.28;
    heart.scale.setScalar(bs);
    heartLight.intensity = 1.5 + Math.max(0, Math.sin(beat * Math.PI * 2)) * 3;
    // Brain vesicles inflate/pulse
    brains.forEach((b, i) => b.scale.setScalar(1 + Math.sin(t * 1 + i * 0.5) * 0.05));
    // Arches subtle wiggle
    arches.forEach((a, i) => a.rotation.z = Math.sin(t * 0.5 + i) * 0.05);
    // Optic + otic pulse
    optic.scale.setScalar(1 + Math.sin(t * 1.5) * 0.1);
    otic.scale.setScalar(1 + Math.sin(t * 1.5 + 1) * 0.1);
    // Limb bud grow pulse
    limbs.forEach((l, i) => l.scale.setScalar(1 + Math.sin(t * 0.8 + i) * 0.06));
    // Tail sway
    tail.rotation.z = -Math.PI / 4 + Math.sin(t * 1.2) * 0.06;
    // Somites glow rostro-caudal wave
    somites.forEach((s, i) => {
      const gate = 0.7 + Math.sin(t * 2 - i * 0.15) * 0.3;
      s.scale.setScalar(gate);
    });
    // Blood particles flow along curve
    blood.points.forEach((p, i) => {
      const s = blood.seeds[i];
      const ph = ((t * 0.35 + s.ph) % 1);
      const pos = curve.getPoint(ph);
      p.position.copy(pos);
      (p.material as THREE.MeshPhysicalMaterial).opacity = 1;
    });
  };
  return { group: g, labels, outerMeshes: outer, explodable, update };
}

// ============================================================
// Master dispatcher
// ============================================================
export function buildDayScene(day: number): DaySceneBuild {
  if (day === 1) return day1();
  if (day === 2) return day2();
  if (day === 3) return day3();
  if (day === 4) return day4();
  if (day >= 5 && day <= 7) return blastocyst((day - 5) / 2);
  if (day >= 8 && day <= 13) return implantationScene((day - 8) / 5);
  if (day >= 14 && day <= 17) return gastrulationScene((day - 14) / 3);
  if (day >= 18 && day <= 23) return neurulationScene((day - 18) / 5);
  if (day >= 24 && day <= 28) return organogenesisScene((day - 24) / 4);
  return day1();
}
