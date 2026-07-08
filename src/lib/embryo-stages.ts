import * as THREE from "three";

export type StageId = "day1" | "day3" | "day5" | "day8" | "day16" | "day21" | "day28";

export interface StageMeta {
  id: StageId;
  day: number;
  title: string;
  subtitle: string;
  size: string;
  cells: string;
  phase: string;
  blurb: string;
}

export const STAGES: StageMeta[] = [
  { id: "day1", day: 1, title: "Zygote", subtitle: "Fertilization",
    size: "0.10 mm", cells: "1 cell · 2 pronuclei", phase: "Pre-cleavage",
    blurb: "A single fertilized cell wrapped in a translucent zona pellucida. Two pronuclei drift toward each other before syngamy." },
  { id: "day3", day: 3, title: "Morula", subtitle: "Cleavage",
    size: "0.15 mm", cells: "16 blastomeres", phase: "Compaction",
    blurb: "A mulberry-like ball of totipotent blastomeres tightly packed inside the zona pellucida." },
  { id: "day5", day: 5, title: "Blastocyst", subtitle: "Cavitation",
    size: "0.20 mm", cells: "~120 cells", phase: "First lineage decision",
    blurb: "A hollow blastocoele forms. Outer trophoblasts commit to placenta; inner cell mass stays pluripotent." },
  { id: "day8", day: 8, title: "Bilaminar Disc", subtitle: "Implantation",
    size: "0.25 mm", cells: "Epiblast + Hypoblast", phase: "Two-layer embryo",
    blurb: "The embryo implants into endometrium. A flat two-layered disc sits between the amniotic and yolk sac cavities." },
  { id: "day16", day: 16, title: "Gastrulation", subtitle: "Three germ layers",
    size: "1.5 mm", cells: "Ecto · Meso · Endo", phase: "Primitive streak",
    blurb: "Epiblast cells stream through the primitive streak, forming mesoderm and endoderm between the layers." },
  { id: "day21", day: 21, title: "Neurulation", subtitle: "Neural tube",
    size: "2.5 mm", cells: "Neural tube + somites", phase: "CNS forms",
    blurb: "The neural plate folds into a tube. Paired somites bud off along its sides as the future spine." },
  { id: "day28", day: 28, title: "Organogenesis", subtitle: "C-shaped embryo",
    size: "4.0 mm", cells: "Millions · organs form", phase: "Beating heart",
    blurb: "A curved C-shaped embryo with brain vesicles, pharyngeal arches, limb buds and an actively pulsing heart." },
];

export interface StageLabel {
  key: string;
  text: string;
  position: THREE.Vector3;
  description: string;
}

export interface StageBuild {
  group: THREE.Group;
  labels: StageLabel[];
  outerMeshes: THREE.Mesh[]; // fade for x-ray
  explodable: { mesh: THREE.Object3D; dir: THREE.Vector3; base: THREE.Vector3 }[];
  heart?: THREE.Mesh;
  update?: (t: number) => void;
}

const mat = (opts: THREE.MeshPhysicalMaterialParameters) =>
  new THREE.MeshPhysicalMaterial({ roughness: 0.35, clearcoat: 0.4, ...opts });

function makeLabel(key: string, text: string, pos: [number, number, number], desc: string): StageLabel {
  return { key, text, position: new THREE.Vector3(...pos), description: desc };
}

// ============ DAY 1 : ZYGOTE ============
function buildDay1(): StageBuild {
  const group = new THREE.Group();
  const labels: StageLabel[] = [];
  const outerMeshes: THREE.Mesh[] = [];
  const explodable: StageBuild["explodable"] = [];

  const zona = new THREE.Mesh(
    new THREE.SphereGeometry(2.4, 64, 64),
    mat({ color: 0xf7c8dc, transmission: 0.85, transparent: true, opacity: 0.35, thickness: 0.6, roughness: 0.15, ior: 1.3 }),
  );
  group.add(zona);
  outerMeshes.push(zona);

  const membrane = new THREE.Mesh(
    new THREE.SphereGeometry(2.0, 48, 48),
    mat({ color: 0xffe4ec, transmission: 0.4, transparent: true, opacity: 0.55, roughness: 0.5 }),
  );
  group.add(membrane);
  outerMeshes.push(membrane);

  const pnMat1 = mat({ color: 0x8ec5ff, emissive: 0x2244aa, emissiveIntensity: 0.4, roughness: 0.3 });
  const pnMat2 = mat({ color: 0xffb3c8, emissive: 0xaa2255, emissiveIntensity: 0.4, roughness: 0.3 });
  const pn1 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32), pnMat1);
  const pn2 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32), pnMat2);
  pn1.position.set(-0.55, 0.1, 0);
  pn2.position.set(0.55, -0.1, 0);
  group.add(pn1, pn2);
  explodable.push({ mesh: pn1, dir: pn1.position.clone().normalize(), base: pn1.position.clone() });
  explodable.push({ mesh: pn2, dir: pn2.position.clone().normalize(), base: pn2.position.clone() });

  labels.push(
    makeLabel("zona", "Zona Pellucida", [0, 2.55, 0], "Glycoprotein shell protecting the zygote and blocking polyspermy."),
    makeLabel("pn1", "Male Pronucleus", [-0.55, 0.7, 0], "Paternal DNA decondensing before fusion with the maternal pronucleus."),
    makeLabel("pn2", "Female Pronucleus", [0.85, -0.5, 0], "Maternal DNA awaiting syngamy — the fusion event that ends fertilization."),
  );

  const drift = (t: number) => {
    pn1.position.x = -0.55 + Math.sin(t * 0.6) * 0.08;
    pn2.position.x = 0.55 + Math.cos(t * 0.5) * 0.08;
  };
  return { group, labels, outerMeshes, explodable, update: drift };
}

// ============ DAY 3 : MORULA ============
function buildDay3(): StageBuild {
  const group = new THREE.Group();
  const labels: StageLabel[] = [];
  const outerMeshes: THREE.Mesh[] = [];
  const explodable: StageBuild["explodable"] = [];

  const zona = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 48, 48),
    mat({ color: 0xf7c8dc, transmission: 0.85, transparent: true, opacity: 0.28, roughness: 0.15, ior: 1.3 }),
  );
  group.add(zona);
  outerMeshes.push(zona);

  // 16 blastomeres packed spherically (fibonacci sphere then jitter)
  const N = 16;
  const cellGeo = new THREE.SphereGeometry(0.55, 24, 24);
  const cellMat = mat({ color: 0xffd6e4, roughness: 0.3, clearcoat: 0.7, sheen: 1, sheenColor: 0xffaacc });
  const cells: THREE.Mesh[] = [];
  const phi = Math.PI * (Math.sqrt(5) - 1);
  const R = 0.95;
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = phi * i;
    const p = new THREE.Vector3(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R);
    const m = new THREE.Mesh(cellGeo, cellMat);
    m.position.copy(p);
    m.userData.base = p.clone();
    group.add(m);
    cells.push(m);
    explodable.push({ mesh: m, dir: p.clone().normalize(), base: p.clone() });
  }

  labels.push(
    makeLabel("morula", "Blastomeres (16)", [0, 1.6, 0], "Totipotent daughter cells produced by cleavage divisions of the zygote."),
    makeLabel("zona-m", "Zona Pellucida", [0, 2.7, 0], "Still enclosing the embryo — will hatch by Day 5."),
  );

  const update = (t: number) => {
    for (let i = 0; i < cells.length; i++) {
      const s = 1 + Math.sin(t * 2 + i) * 0.03;
      cells[i].scale.setScalar(s);
    }
  };
  return { group, labels, outerMeshes, explodable, update };
}

// ============ DAY 5 : BLASTOCYST ============
function buildDay5(): StageBuild {
  const group = new THREE.Group();
  const labels: StageLabel[] = [];
  const outerMeshes: THREE.Mesh[] = [];
  const explodable: StageBuild["explodable"] = [];

  // Trophoblast shell (hollow flat cells) - a thin sphere
  const tropho = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 64, 64),
    mat({ color: 0xffb3c8, roughness: 0.4, transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
  );
  group.add(tropho);
  outerMeshes.push(tropho);

  // Blastocoele cavity — soft glowing fluid interior
  const cavity = new THREE.Mesh(
    new THREE.SphereGeometry(2.05, 48, 48),
    mat({ color: 0x88ddff, transmission: 0.9, transparent: true, opacity: 0.25, roughness: 0.1, ior: 1.33, thickness: 1 }),
  );
  group.add(cavity);

  // Inner cell mass (blue pluripotent stem cells) — clustered on one pole
  const icm = new THREE.Group();
  icm.position.set(0, 1.35, 0);
  const icmMat = mat({ color: 0x4aa8ff, emissive: 0x1a4a99, emissiveIntensity: 0.3, roughness: 0.35 });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r = 0.35 + Math.random() * 0.15;
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 20), icmMat);
    c.position.set(Math.cos(a) * r, (Math.random() - 0.5) * 0.35, Math.sin(a) * r);
    icm.add(c);
  }
  group.add(icm);
  explodable.push({ mesh: icm, dir: new THREE.Vector3(0, 1, 0), base: icm.position.clone() });

  labels.push(
    makeLabel("tropho", "Trophoblast", [2.3, 0.4, 0], "Outer flat cells that will form the placenta and extraembryonic membranes."),
    makeLabel("blastocoele", "Blastocoele", [-1.3, -0.3, 0.8], "Fluid-filled cavity created by pumping sodium and water inward."),
    makeLabel("icm", "Inner Cell Mass", [0.3, 1.9, 0], "Pluripotent stem cells that will become the entire embryo."),
  );

  return { group, labels, outerMeshes, explodable };
}

// ============ DAY 8 : BILAMINAR DISC ============
function buildDay8(): StageBuild {
  const group = new THREE.Group();
  const labels: StageLabel[] = [];
  const outerMeshes: THREE.Mesh[] = [];
  const explodable: StageBuild["explodable"] = [];

  // Endometrium (background block)
  const endo = new THREE.Mesh(
    new THREE.BoxGeometry(6, 4.5, 3.5),
    mat({ color: 0x992244, roughness: 0.85, transparent: true, opacity: 0.55 }),
  );
  endo.position.z = -0.5;
  group.add(endo);
  outerMeshes.push(endo);

  // Amniotic cavity (top dome)
  const amnion = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 40, 32, 0, Math.PI * 2, 0, Math.PI / 2),
    mat({ color: 0xbfeaff, transmission: 0.9, transparent: true, opacity: 0.4, roughness: 0.1, side: THREE.DoubleSide }),
  );
  amnion.position.y = 0.05;
  group.add(amnion);
  explodable.push({ mesh: amnion, dir: new THREE.Vector3(0, 1, 0), base: amnion.position.clone() });

  // Yolk sac (bottom dome)
  const yolk = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 40, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    mat({ color: 0xffe08a, transmission: 0.85, transparent: true, opacity: 0.45, roughness: 0.15, side: THREE.DoubleSide }),
  );
  yolk.position.y = -0.05;
  group.add(yolk);
  explodable.push({ mesh: yolk, dir: new THREE.Vector3(0, -1, 0), base: yolk.position.clone() });

  // Bilaminar disc
  const disc = new THREE.Group();
  const epiblast = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.05, 0.14, 48, 1),
    mat({ color: 0x4aa8ff, emissive: 0x1a4a99, emissiveIntensity: 0.3, roughness: 0.35 }),
  );
  epiblast.position.y = 0.09;
  const hypoblast = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.05, 0.14, 48, 1),
    mat({ color: 0xffd166, emissive: 0x996611, emissiveIntensity: 0.25, roughness: 0.4 }),
  );
  hypoblast.position.y = -0.09;
  disc.add(epiblast, hypoblast);
  group.add(disc);
  explodable.push({ mesh: epiblast, dir: new THREE.Vector3(0, 1, 0), base: epiblast.position.clone() });
  explodable.push({ mesh: hypoblast, dir: new THREE.Vector3(0, -1, 0), base: hypoblast.position.clone() });

  labels.push(
    makeLabel("epiblast", "Epiblast", [1.3, 0.4, 0], "Upper layer — will give rise to all three germ layers."),
    makeLabel("hypoblast", "Hypoblast", [1.3, -0.4, 0], "Lower layer — contributes to extraembryonic endoderm."),
    makeLabel("amnion", "Amniotic Cavity", [0, 1.3, 0], "Fluid space that will surround the growing embryo."),
    makeLabel("yolk", "Yolk Sac", [0, -1.3, 0], "Early nutrition and site of first blood cell formation."),
    makeLabel("endo", "Endometrium", [-2.5, 0.5, 0], "Maternal uterine lining — the embryo is now implanted."),
  );

  return { group, labels, outerMeshes, explodable };
}

// ============ DAY 16 : GASTRULATION ============
function buildDay16(): StageBuild {
  const group = new THREE.Group();
  const labels: StageLabel[] = [];
  const outerMeshes: THREE.Mesh[] = [];
  const explodable: StageBuild["explodable"] = [];

  const ecto = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.18, 2.2),
    mat({ color: 0x4aa8ff, emissive: 0x1a4a99, emissiveIntensity: 0.25, roughness: 0.35 }),
  );
  ecto.position.y = 0.42;
  group.add(ecto);
  outerMeshes.push(ecto);

  // Groove (primitive streak) — carved as a small dark strip on top
  const streak = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.06, 0.16),
    mat({ color: 0x111122, roughness: 0.8 }),
  );
  streak.position.set(0.5, 0.52, 0);
  group.add(streak);

  const meso = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 0.18, 2.0),
    mat({ color: 0xff5599, emissive: 0x881144, emissiveIntensity: 0.35, roughness: 0.35 }),
  );
  meso.position.y = 0.2;
  group.add(meso);

  const endoLayer = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.18, 2.2),
    mat({ color: 0xffd166, emissive: 0x996611, emissiveIntensity: 0.25, roughness: 0.4 }),
  );
  endoLayer.position.y = -0.02;
  group.add(endoLayer);

  explodable.push({ mesh: ecto, dir: new THREE.Vector3(0, 1, 0), base: ecto.position.clone() });
  explodable.push({ mesh: meso, dir: new THREE.Vector3(0, 0, 0.001), base: meso.position.clone() });
  explodable.push({ mesh: endoLayer, dir: new THREE.Vector3(0, -1, 0), base: endoLayer.position.clone() });

  // Migrating cells (particles between layers)
  const migrating: THREE.Mesh[] = [];
  const partMat = mat({ color: 0xff88bb, emissive: 0xaa3366, emissiveIntensity: 0.5 });
  for (let i = 0; i < 24; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), partMat);
    m.userData.seed = Math.random();
    m.userData.x = (Math.random() - 0.5) * 2.5;
    m.userData.z = (Math.random() - 0.5) * 1.6;
    group.add(m);
    migrating.push(m);
  }

  labels.push(
    makeLabel("ecto", "Ectoderm", [1.9, 0.55, 0], "Future skin and nervous system."),
    makeLabel("meso", "Mesoderm", [1.9, 0.25, 0], "New middle layer — muscles, bones, blood, kidneys."),
    makeLabel("endo", "Endoderm", [1.9, -0.05, 0], "Gut lining, lungs, liver, pancreas."),
    makeLabel("streak", "Primitive Streak", [0.5, 0.72, 0], "Groove where epiblast cells ingress to form meso- and endoderm."),
  );

  const update = (t: number) => {
    for (const m of migrating) {
      const s = m.userData.seed as number;
      const phase = (t * 0.4 + s) % 1;
      m.position.set(m.userData.x, 0.42 - phase * 0.4, m.userData.z);
      const mm = m.material as THREE.MeshPhysicalMaterial;
      mm.transparent = true;
      mm.opacity = 1 - phase;
    }
  };

  return { group, labels, outerMeshes, explodable, update };
}

// ============ DAY 21 : NEURULATION ============
function buildDay21(): StageBuild {
  const group = new THREE.Group();
  const labels: StageLabel[] = [];
  const outerMeshes: THREE.Mesh[] = [];
  const explodable: StageBuild["explodable"] = [];

  // Neural tube — cylinder
  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 3.2, 32, 8, false),
    mat({ color: 0x88ccff, emissive: 0x224488, emissiveIntensity: 0.35, roughness: 0.3 }),
  );
  tube.rotation.z = Math.PI / 2;
  group.add(tube);

  // Inner canal (hollow feel through emissive)
  const canal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 3.25, 24, 1),
    mat({ color: 0x001122, emissive: 0x0088ff, emissiveIntensity: 0.8, roughness: 1 }),
  );
  canal.rotation.z = Math.PI / 2;
  group.add(canal);

  // Somites — paired cubes along both sides
  const somMat = mat({ color: 0xff77aa, emissive: 0x881144, emissiveIntensity: 0.35, roughness: 0.35 });
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.42;
    const sL = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), somMat);
    const sR = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), somMat);
    sL.position.set(x, 0, 0.55);
    sR.position.set(x, 0, -0.55);
    group.add(sL, sR);
    explodable.push({ mesh: sL, dir: new THREE.Vector3(0, 0, 1), base: sL.position.clone() });
    explodable.push({ mesh: sR, dir: new THREE.Vector3(0, 0, -1), base: sR.position.clone() });
  }

  // Notochord below tube
  const noto = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 3.0, 16, 1),
    mat({ color: 0xffd166, emissive: 0x996611, emissiveIntensity: 0.3 }),
  );
  noto.rotation.z = Math.PI / 2;
  noto.position.y = -0.45;
  group.add(noto);

  outerMeshes.push(tube);

  labels.push(
    makeLabel("tube", "Neural Tube", [0, 0.55, 0], "Closing dorsal cylinder — future brain and spinal cord."),
    makeLabel("somL", "Somites (Left)", [0, 0, 1], "Paired paraxial mesoderm blocks — future vertebrae, muscles and dermis."),
    makeLabel("somR", "Somites (Right)", [0, 0, -1], "Paired paraxial mesoderm blocks — bilateral segmentation of the body."),
    makeLabel("noto", "Notochord", [1.6, -0.6, 0], "Signaling rod that induced neural tube formation."),
  );

  return { group, labels, outerMeshes, explodable };
}

// ============ DAY 28 : ORGANOGENESIS ============
function buildDay28(): StageBuild {
  const group = new THREE.Group();
  const labels: StageLabel[] = [];
  const outerMeshes: THREE.Mesh[] = [];
  const explodable: StageBuild["explodable"] = [];

  // C-shaped body from a parametric curve extruded as a tube
  const cCurve = new THREE.CatmullRomCurve3(
    Array.from({ length: 40 }, (_, i) => {
      const t = i / 39;
      const a = -Math.PI * 0.85 + t * Math.PI * 1.7;
      const r = 1.5 + Math.sin(t * Math.PI) * 0.15;
      return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0);
    }),
  );
  const curve = cCurve;
  const body = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 80, 0.42, 24, false),
    mat({ color: 0xffcbb0, emissive: 0x552211, emissiveIntensity: 0.2, roughness: 0.45, clearcoat: 0.5 }),
  );
  group.add(body);
  outerMeshes.push(body);

  // Head / brain vesicles (three swellings at head end)
  const headPos = curve.getPoint(0);
  const brainMat = mat({ color: 0xbfa8ff, emissive: 0x442288, emissiveIntensity: 0.35, roughness: 0.35 });
  const brain1 = new THREE.Mesh(new THREE.SphereGeometry(0.52, 24, 24), brainMat);
  brain1.position.copy(headPos).add(new THREE.Vector3(-0.25, 0.35, 0));
  const brain2 = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24), brainMat);
  brain2.position.copy(headPos).add(new THREE.Vector3(0.15, 0.5, 0));
  const brain3 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 24), brainMat);
  brain3.position.copy(headPos).add(new THREE.Vector3(0.45, 0.3, 0));
  group.add(brain1, brain2, brain3);

  // Pharyngeal arches (neck rings)
  const neckMat = mat({ color: 0xff9977, roughness: 0.45 });
  for (let i = 0; i < 3; i++) {
    const t = 0.12 + i * 0.04;
    const p = curve.getPoint(t);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.08, 12, 24), neckMat);
    ring.position.copy(p);
    ring.rotation.y = Math.PI / 2;
    group.add(ring);
  }

  // Heart bulge
  const heartMat = mat({
    color: 0xff2244, emissive: 0xff2244, emissiveIntensity: 0.9, roughness: 0.3,
  });
  const heart = new THREE.Mesh(new THREE.SphereGeometry(0.36, 32, 32), heartMat);
  const heartPos = curve.getPoint(0.28);
  heart.position.copy(heartPos).add(new THREE.Vector3(0.1, -0.2, 0.35));
  group.add(heart);
  const heartLight = new THREE.PointLight(0xff3355, 2.5, 4);
  heart.add(heartLight);

  // Limb buds — small nubs
  const limbMat = mat({ color: 0xffb090, roughness: 0.5 });
  for (const tt of [0.42, 0.72]) {
    const p = curve.getPoint(tt);
    const bud1 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), limbMat);
    bud1.position.copy(p).add(new THREE.Vector3(0.2, 0, 0.45));
    const bud2 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), limbMat);
    bud2.position.copy(p).add(new THREE.Vector3(0.2, 0, -0.45));
    group.add(bud1, bud2);
  }

  // Tail
  const tailPos = curve.getPoint(1);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.7, 20), mat({ color: 0xffcbb0, roughness: 0.5 }));
  tail.position.copy(tailPos);
  tail.rotation.z = -Math.PI / 4;
  group.add(tail);

  labels.push(
    makeLabel("brain", "Brain Vesicles", [brain2.position.x + 0.2, brain2.position.y + 0.6, 0], "Forebrain, midbrain and hindbrain swellings of the neural tube."),
    makeLabel("heart", "Beating Heart", [heart.position.x + 0.6, heart.position.y, 0.4], "S-shaped looping heart tube — already contracting at ~160 BPM."),
    makeLabel("limb", "Limb Buds", [1.6, -1.2, 0.5], "Mesenchymal outgrowths that will become arms and legs."),
    makeLabel("arches", "Pharyngeal Arches", [-1.1, 1.4, 0], "Neck ridges that shape the jaw, ear and throat."),
    makeLabel("tail", "Embryonic Tail", [tailPos.x - 0.5, tailPos.y - 0.5, 0], "Transient tail — regresses over the coming weeks."),
  );

  explodable.push(
    { mesh: brain1, dir: new THREE.Vector3(-1, 1, 0).normalize(), base: brain1.position.clone() },
    { mesh: brain2, dir: new THREE.Vector3(0, 1, 0), base: brain2.position.clone() },
    { mesh: brain3, dir: new THREE.Vector3(1, 1, 0).normalize(), base: brain3.position.clone() },
    { mesh: heart, dir: new THREE.Vector3(1, -0.2, 1).normalize(), base: heart.position.clone() },
  );

  const bpm = 160;
  const update = (t: number) => {
    const beat = (t * bpm) / 60;
    const s = 1 + Math.max(0, Math.sin(beat * Math.PI * 2)) * 0.28;
    heart.scale.setScalar(s);
    heartLight.intensity = 1.5 + Math.max(0, Math.sin(beat * Math.PI * 2)) * 3;
  };

  return { group, labels, outerMeshes, explodable, heart, update };
}

export function buildStage(id: StageId): StageBuild {
  switch (id) {
    case "day1": return buildDay1();
    case "day3": return buildDay3();
    case "day5": return buildDay5();
    case "day8": return buildDay8();
    case "day16": return buildDay16();
    case "day21": return buildDay21();
    case "day28": return buildDay28();
  }
}
