import type { StageId } from "./embryo-stages";

export interface DayEntry {
  day: number;
  stageId: StageId;
  week: number;
  title: string;
  headline: string;
  size: string;
  cellCount: string;
  phase: string;
  whatHappens: string;
  keyEvents: string[];
  molecular: string[];
  clinical?: string;
  /** Gross morphology and tissue architecture changes visible on this day. */
  structuralChanges: string[];
  /** Epithelial ↔ mesenchymal interactions and cell-shape transitions (EMT/MET). */
  epithelialMesenchymal: string[];
  /** Signal-transduction pathways: ligand → receptor → cascade → transcription factor. */
  signalingPathways: {
    pathway: string;
    ligand: string;
    receptor: string;
    effect: string;
  }[];
}

export const DAYS: DayEntry[] = [
  {
    day: 1,
    week: 1,
    stageId: "day1",
    title: "Fertilization",
    headline: "Sperm fuses with the secondary oocyte in the ampulla of the fallopian tube.",
    size: "0.10 mm",
    cellCount: "1 cell · 2 pronuclei",
    phase: "Zygote — pre-cleavage",
    whatHappens:
      "Within minutes of a single sperm binding ZP3 on the zona pellucida, the acrosome reaction releases enzymes that digest a path through the glycoprotein coat. Sperm-egg membrane fusion triggers a wave of calcium that sweeps across the oocyte, causing cortical granules to exocytose and harden the zona — the fast and slow block to polyspermy. The oocyte finally completes meiosis II, ejecting the second polar body. The male and female haploid genomes decondense into two visible pronuclei that drift toward the cell center.",
    keyEvents: [
      "Sperm binds ZP3 → acrosome reaction",
      "Membrane fusion → Ca²⁺ oscillations",
      "Cortical reaction → polyspermy block",
      "Meiosis II completes → 2nd polar body extruded",
      "Male & female pronuclei form and migrate",
    ],
    molecular: [
      "PLCζ from sperm triggers IP3-mediated Ca²⁺ release",
      "Zinc sparks accompany oocyte activation",
      "CDK1/Cyclin B drives entry into first mitosis",
    ],
    structuralChanges: [
      "Zona pellucida hardens (perivitelline barrier)",
      "Second polar body sits in the perivitelline space",
      "Two pronuclei (paternal + maternal) become visible in single ooplasm",
      "Cortical granule layer disappears from the ooplasm periphery",
    ],
    epithelialMesenchymal: [
      "Oocyte is a single non-epithelial cell — no true epithelium yet",
      "Cumulus (granulosa) cells surrounding the egg are shed as sperm penetrate",
      "Sperm–oocyte fusion is a juxtacrine (contact-dependent) event",
    ],
    signalingPathways: [
      {
        pathway: "PLCζ / IP3 / Ca²⁺",
        ligand: "Sperm PLCζ (injected)",
        receptor: "IP3 receptor on ooplasmic ER",
        effect: "Ca²⁺ oscillations → cortical granule exocytosis, meiotic resumption",
      },
      {
        pathway: "Juxtacrine adhesion",
        ligand: "IZUMO1 (sperm)",
        receptor: "JUNO (oocyte plasma membrane)",
        effect: "Irreversible sperm–oocyte membrane fusion",
      },
    ],
    clinical:
      "This is conception. Clinical gestational age is counted from LMP, so Day 1 of embryology ≈ Week 2 GA.",
  },
  {
    day: 2,
    week: 1,
    stageId: "day1",
    title: "First Cleavage",
    headline: "Pronuclei fuse (syngamy) and the zygote splits into 2 blastomeres.",
    size: "0.10 mm",
    cellCount: "2 cells",
    phase: "Cleavage begins",
    whatHappens:
      "About 24–30 hours after fertilization, the two pronuclear envelopes break down and their chromosomes align on a single mitotic spindle — syngamy. The zygote divides into two roughly equal blastomeres. Cleavage is unusual: the cells shrink with each division because the zona pellucida constrains total volume. The embryo drifts down the fallopian tube toward the uterus, still entirely dependent on maternal RNA and protein stored in the oocyte.",
    keyEvents: [
      "Syngamy — first true diploid nucleus",
      "First mitotic division → 2 blastomeres",
      "No net growth (constant total volume)",
      "Embryo transported by cilia toward uterus",
    ],
    molecular: [
      "Maternal-to-zygotic transition begins",
      "Maternal mRNAs still drive most protein synthesis",
    ],
    structuralChanges: [
      "Two equal-sized blastomeres inside intact zona pellucida",
      "Overall diameter unchanged — reductive cleavage",
      "Blastomeres are totipotent, loosely apposed spheres",
    ],
    epithelialMesenchymal: [
      "No epithelial polarity yet — blastomeres are apolar",
      "No mesenchyme; no basement membrane exists",
    ],
    signalingPathways: [
      {
        pathway: "Cell-cycle control",
        ligand: "—",
        receptor: "—",
        effect:
          "CDK1/Cyclin B activity drives first cleavage; MAPK signalling resets after syngamy",
      },
      {
        pathway: "Ciliary transport (maternal)",
        ligand: "Progesterone",
        receptor: "Tubal epithelial PR",
        effect: "Regulates ciliary beat frequency propelling zygote toward uterus",
      },
    ],
  },
  {
    day: 3,
    week: 1,
    stageId: "day3",
    title: "Morula & Compaction",
    headline: "8–16 blastomeres tightly pack into a mulberry-like solid ball.",
    size: "0.15 mm",
    cellCount: "8 → 16 blastomeres",
    phase: "Compaction",
    whatHappens:
      "By the 8-cell stage, blastomeres suddenly maximize contact with each other — they flatten, form tight and gap junctions, and become polarized. This 'compaction' is the first morphogenetic event and marks the first cell-fate decision: cells on the outside express Cdx2 and commit to trophectoderm; cells trapped inside remain Oct4-positive and pluripotent. The embryo is now called a morula because it looks like a tiny mulberry.",
    keyEvents: [
      "Tight & gap junctions form between outer cells",
      "Cells polarize (apical vs basolateral)",
      "Outer cells → trophectoderm fate (Cdx2⁺)",
      "Inner cells → inner cell mass fate (Oct4⁺, Nanog⁺)",
    ],
    molecular: [
      "E-cadherin drives compaction",
      "Hippo signaling (YAP/TAZ) segregates ICM vs TE",
      "Oct4 / Nanog / Sox2 maintain pluripotency inside",
    ],
    structuralChanges: [
      "Blastomeres flatten and maximize cell–cell contact — 'compaction'",
      "Apical microvilli concentrate on outer surfaces",
      "Tight junctions seal outer cells; gap junctions couple inner cells",
      "Cell boundaries become indistinct → mulberry (morula) appearance",
    ],
    epithelialMesenchymal: [
      "First epithelialization: outer blastomeres acquire apico-basal polarity → nascent trophectoderm",
      "Inner cells stay apolar and mesenchyme-like — future ICM",
      "E-cadherin–driven adhesion (juxtacrine) is the mechanical basis of compaction",
    ],
    signalingPathways: [
      {
        pathway: "Hippo (YAP/TAZ)",
        ligand: "Cell contact / polarity cues",
        receptor: "Merlin–LATS1/2 kinase cassette",
        effect:
          "Outer cells: YAP nuclear → Cdx2 ON → trophectoderm. Inner cells: YAP cytoplasmic → Oct4/Nanog → ICM",
      },
      {
        pathway: "Cadherin juxtacrine adhesion",
        ligand: "E-cadherin",
        receptor: "E-cadherin (homophilic)",
        effect: "Compaction, polarization, tight-junction assembly",
      },
    ],
  },
  {
    day: 4,
    week: 1,
    stageId: "day3",
    title: "Late Morula",
    headline: "The morula reaches the uterine cavity — cavitation is imminent.",
    size: "0.15 mm",
    cellCount: "~32 cells",
    phase: "Pre-cavitation",
    whatHappens:
      "The morula arrives in the uterine cavity, still enclosed in its zona pellucida. Trophectoderm cells begin pumping Na⁺ inward via Na/K-ATPase; water follows by osmosis. Small fluid pockets coalesce between the inner cells — the earliest hint of the blastocoele. Inner cells crowd toward one pole, forming the eccentric inner cell mass.",
    keyEvents: [
      "Embryo reaches uterus",
      "Na⁺/K⁺-ATPase pumps ions across trophectoderm",
      "Micro-cavities coalesce into blastocoele",
    ],
    molecular: ["Aquaporins mediate water flow into the cavity"],
    structuralChanges: [
      "Trophectoderm is a continuous polarized epithelium sealed by tight junctions",
      "Micro-lumina appear at basolateral surfaces of inner cells",
      "ICM begins to compact eccentrically at one pole",
    ],
    epithelialMesenchymal: [
      "Trophectoderm behaves as a true transporting epithelium (Na⁺/K⁺-ATPase apically basal, aquaporins apical)",
      "ICM remains a mesenchyme-like cluster, apolar and pluripotent",
      "First epithelial–mesenchymal partition of the embryo",
    ],
    signalingPathways: [
      {
        pathway: "FGF / MAPK",
        ligand: "FGF4 from epiblast progenitors",
        receptor: "FGFR2 on primitive-endoderm precursors",
        effect: "Salt-and-pepper segregation of epiblast vs primitive endoderm inside the ICM",
      },
      {
        pathway: "Ion transport (not classic signalling)",
        ligand: "—",
        receptor: "Na⁺/K⁺-ATPase + aquaporin-3/9",
        effect: "Vectorial water flux → nascent blastocoele",
      },
    ],
  },
  {
    day: 5,
    week: 1,
    stageId: "day5",
    title: "Early Blastocyst",
    headline: "A hollow blastocoele cavity forms — first true lineage split.",
    size: "0.20 mm",
    cellCount: "~120 cells",
    phase: "Cavitation",
    whatHappens:
      "The embryo is now a blastocyst: a fluid-filled sphere with a single outer trophectoderm layer wrapping the blastocoele, and the inner cell mass (embryoblast) attached to one pole. The two lineages have officially diverged — the trophectoderm will build the placenta and extraembryonic membranes; the ICM contains every stem cell that will build the actual embryo.",
    keyEvents: [
      "Blastocoele fully expanded",
      "Trophoblast = outer flat epithelium",
      "Inner cell mass polarized to one pole",
      "First lineage decision complete",
    ],
    molecular: [
      "Cdx2 in TE, Oct4/Nanog in ICM",
      "FGF4 signaling further splits ICM into epiblast vs primitive endoderm",
    ],
    structuralChanges: [
      "Spherical blastocyst with expanded blastocoele",
      "Trophectoderm = simple squamous-to-cuboidal epithelium",
      "ICM eccentric at embryonic pole",
      "Primitive endoderm cells sort to the blastocoele-facing surface of the ICM",
    ],
    epithelialMesenchymal: [
      "Trophectoderm — fully polarized epithelium with apical junctional complexes",
      "Primitive endoderm — new epithelial layer emerging beneath ICM by sorting + MET-like organization",
      "Epiblast core stays as tightly packed pluripotent cells (pseudo-mesenchymal)",
    ],
    signalingPathways: [
      {
        pathway: "FGF/ERK",
        ligand: "FGF4 (epiblast)",
        receptor: "FGFR2 (primitive endoderm)",
        effect: "GATA6 ON → primitive-endoderm identity; low FGF → NANOG ON → epiblast",
      },
      {
        pathway: "Hippo",
        ligand: "Contact/polarity cues",
        receptor: "LATS→YAP",
        effect: "Reinforces TE (YAP-nuclear) vs ICM (YAP-cytoplasmic)",
      },
    ],
    clinical:
      "This is the stage transferred in IVF and the source of embryonic stem cells (harvested from the ICM).",
  },
  {
    day: 6,
    week: 1,
    stageId: "day5",
    title: "Hatching Blastocyst",
    headline: "The blastocyst escapes its zona pellucida.",
    size: "0.20 mm",
    cellCount: "~150 cells",
    phase: "Hatching",
    whatHappens:
      "Repeated expansion and contraction of the blastocoele, combined with trypsin-like enzymes from the trophectoderm, thin the zona pellucida until the blastocyst hatches out through a small hole. Only a naked, hatched blastocyst can implant into the uterine wall.",
    keyEvents: [
      "Zona pellucida ruptures",
      "Blastocyst emerges 'naked'",
      "Trophoblast now free to contact endometrium",
    ],
    molecular: ["Trypsin-like proteases secreted by trophectoderm"],
    structuralChanges: [
      "Zona pellucida thins, splits, and is shed",
      "Blastocyst emerges naked with intact trophectoderm covering",
      "Overall shape briefly ovoid during hatching",
    ],
    epithelialMesenchymal: [
      "Trophectoderm epithelium now directly faces the uterine luminal epithelium — sets up an epithelium–epithelium interaction that primes implantation",
      "No mesenchyme present yet in either partner (endometrial stroma is deeper)",
    ],
    signalingPathways: [
      {
        pathway: "Protease cascade",
        ligand: "Trophectoderm proteases (strypsin, cathepsins)",
        receptor: "Zona glycoproteins (substrate)",
        effect: "Local zona digestion → hatching hole",
      },
      {
        pathway: "LIF/STAT3 (uterine receptivity)",
        ligand: "Maternal LIF",
        receptor: "LIFR/gp130 on trophectoderm & luminal epithelium",
        effect: "STAT3 activation licenses adhesion competence",
      },
    ],
  },
  {
    day: 7,
    week: 1,
    stageId: "day5",
    title: "Apposition & Adhesion",
    headline: "The blastocyst orients ICM-first and sticks to the uterine wall.",
    size: "0.20 mm",
    cellCount: "~200 cells",
    phase: "Implantation begins",
    whatHappens:
      "The blastocyst rotates so its inner cell mass faces the endometrium (the embryonic pole leads). Trophoblast microvilli interdigitate with the uterine epithelium (apposition), then integrins and selectins lock the two together (adhesion). The trophoblast immediately begins to differentiate into an inner cytotrophoblast and an invasive outer syncytiotrophoblast.",
    keyEvents: [
      "Embryonic pole apposes endometrium",
      "Integrin-mediated adhesion",
      "Trophoblast → cytotrophoblast + syncytiotrophoblast",
    ],
    molecular: [
      "L-selectin, integrins αvβ3, HB-EGF",
      "hCG production begins → maintains corpus luteum",
    ],
    structuralChanges: [
      "Trophoblast splits into two layers: mononucleated cytotrophoblast (inner) and multinucleated syncytiotrophoblast (outer)",
      "Uterine luminal epithelial microvilli flatten (pinopodes) at the implantation site",
      "Basement membrane of uterine epithelium becomes locally exposed",
    ],
    epithelialMesenchymal: [
      "Epithelial cytotrophoblast fuses cell membranes → true syncytial epithelium (syncytiotrophoblast) — a specialized epithelial invasive front",
      "Endometrial luminal epithelium (epithelial) meets trophoblast epithelium — classic epithelium/epithelium 'implantation crosstalk'",
      "Underlying endometrial stromal fibroblasts (mesenchyme) begin decidualization — a mesenchymal → secretory-epithelioid MET",
    ],
    signalingPathways: [
      {
        pathway: "Integrin adhesion",
        ligand: "Osteopontin, fibronectin (uterine)",
        receptor: "αvβ3 integrin (trophoblast)",
        effect: "Firm attachment of blastocyst to endometrium",
      },
      {
        pathway: "HB-EGF / ErbB",
        ligand: "HB-EGF (endometrium)",
        receptor: "ErbB1/ErbB4 (trophoblast)",
        effect: "Trophoblast activation, adhesion, proliferation",
      },
      {
        pathway: "hCG / LHCGR",
        ligand: "hCG (syncytiotrophoblast)",
        receptor: "LHCGR (corpus luteum)",
        effect: "Progesterone maintenance → uterus stays receptive",
      },
    ],
    clinical: "First moment a home pregnancy test would detect hCG (~8–10 days post-conception).",
  },
  {
    day: 8,
    week: 2,
    stageId: "day8",
    title: "Bilaminar Disc",
    headline: "The ICM splits into two layers: epiblast and hypoblast.",
    size: "0.25 mm",
    cellCount: "thousands",
    phase: "Two-layer embryo",
    whatHappens:
      "The syncytiotrophoblast burrows deep into the endometrium, digesting maternal cells and starting to tap maternal blood. Meanwhile the inner cell mass reorganizes into a flat, two-layered disc: a dorsal epiblast (tall columnar cells) and a ventral hypoblast (small cuboidal cells). Small vacuoles appear inside the epiblast — the future amniotic cavity.",
    keyEvents: [
      "Syncytiotrophoblast invades endometrium",
      "Epiblast (dorsal) + hypoblast (ventral) form",
      "Amniotic cavity begins as a slit above epiblast",
    ],
    molecular: ["Nodal signaling maintains epiblast identity"],
    structuralChanges: [
      "Bilaminar embryonic disc: dorsal tall-columnar epiblast + ventral cuboidal hypoblast",
      "Slit-like amniotic cavity between epiblast and cytotrophoblast",
      "Syncytiotrophoblast erodes into endometrial glands and capillaries",
    ],
    epithelialMesenchymal: [
      "Two adjacent epithelia (epiblast and hypoblast) form — separated by a shared basement membrane",
      "This basement membrane is the first embryonic ECM interface — the future substrate for gastrulation EMT",
      "Endometrial stromal decidualization continues (mesenchymal → epithelioid decidual cells rich in glycogen/lipid)",
    ],
    signalingPathways: [
      {
        pathway: "Nodal (TGF-β family)",
        ligand: "Nodal (epiblast)",
        receptor: "ActRIIB / ALK4 + Cripto co-receptor",
        effect: "SMAD2/3 → maintains pluripotent epiblast identity",
      },
      {
        pathway: "BMP",
        ligand: "BMP4 (extraembryonic ectoderm)",
        receptor: "BMPR1/2",
        effect: "SMAD1/5/8 → restricts epiblast, promotes extraembryonic fates",
      },
    ],
  },
  {
    day: 9,
    week: 2,
    stageId: "day8",
    title: "Lacunae Appear",
    headline: "Blood-filled spaces open in the syncytiotrophoblast.",
    size: "0.30 mm",
    cellCount: "—",
    phase: "Uteroplacental circulation begins",
    whatHappens:
      "Vacuoles inside the syncytiotrophoblast fuse into large lacunae. Maternal capillaries are eroded and their blood floods the lacunae — the earliest form of uteroplacental circulation. On the ventral side, hypoblast cells migrate to line the blastocoele, creating Heuser's membrane and the primary yolk sac (exocoelomic cavity).",
    keyEvents: [
      "Trophoblast lacunae fill with maternal blood",
      "Primary yolk sac forms",
      "Embryo fully embedded in endometrium",
    ],
    molecular: [],
    structuralChanges: [
      "Lacunar spaces coalesce inside syncytiotrophoblast",
      "Heuser's exocoelomic membrane lines the blastocoele → primary yolk sac",
      "Bilaminar disc suspended between amniotic cavity (dorsal) and primary yolk sac (ventral)",
    ],
    epithelialMesenchymal: [
      "Hypoblast cells undergo MET-like sorting to build a thin squamous exocoelomic epithelium (Heuser's membrane)",
      "Syncytiotrophoblast remains a specialized invasive epithelium (no mesenchyme within it)",
      "Maternal endothelial cells (epithelial) are locally destroyed to open lacunae",
    ],
    signalingPathways: [
      {
        pathway: "VEGF / VEGFR (maternal side)",
        ligand: "VEGF from decidua",
        receptor: "VEGFR2 on maternal endothelium",
        effect: "Vessel remodeling that facilitates lacunar filling",
      },
      {
        pathway: "hCG amplification",
        ligand: "hCG",
        receptor: "LHCGR (corpus luteum + syncytiotrophoblast autocrine)",
        effect: "Sustains progesterone, promotes syncytial growth",
      },
    ],
  },
  {
    day: 10,
    week: 2,
    stageId: "day8",
    title: "Implantation Complete",
    headline: "Embryo fully embedded — a fibrin plug seals the surface.",
    size: "0.35 mm",
    cellCount: "—",
    phase: "Deep implantation",
    whatHappens:
      "The embryo sinks completely below the endometrial surface. A fibrin clot briefly seals the entry hole, later replaced by regenerated uterine epithelium. Trophoblast lacunae continue to expand and anastomose, and the syncytiotrophoblast layer thickens circumferentially around the conceptus.",
    keyEvents: [
      "Embryo fully below endometrial surface",
      "Fibrin coagulation plug over entry site",
      "Lacunar network expands around embryo",
    ],
    molecular: ["hCG rising rapidly — detectable in maternal serum"],
    structuralChanges: [
      "Conceptus fully interstitial within endometrial stroma",
      "Fibrin/closing plug at surface (replaced by regenerated uterine epithelium)",
      "Syncytiotrophoblast now circumferential around the conceptus",
    ],
    epithelialMesenchymal: [
      "Uterine luminal epithelium regenerates over the implantation site (epithelial repair)",
      "Decidualized stromal cells (mesenchyme → epithelioid) tightly surround the trophoblast",
      "Ongoing epithelium (trophoblast) ↔ mesenchyme (decidua) paracrine dialogue governs invasion depth",
    ],
    signalingPathways: [
      {
        pathway: "IL-11 / gp130",
        ligand: "Decidual IL-11",
        receptor: "IL-11Rα/gp130 (trophoblast)",
        effect: "STAT3 → regulated trophoblast invasion",
      },
      {
        pathway: "TGF-β brake",
        ligand: "TGF-β (decidua)",
        receptor: "TGF-βR (trophoblast)",
        effect: "Limits invasion depth — prevents placenta accreta",
      },
    ],
    clinical:
      "Implantation bleeding, if it occurs, happens around now — sometimes mistaken for a light period.",
  },
  {
    day: 11,
    week: 2,
    stageId: "day8",
    title: "Primitive Uteroplacental Circulation",
    headline: "Maternal blood begins to trickle through the lacunar network.",
    size: "0.4 mm",
    cellCount: "—",
    phase: "Circulation established",
    whatHappens:
      "Eroded maternal arterioles empty blood into the lacunae and eroded venules drain it — the first true uteroplacental circulation. Meanwhile the extraembryonic mesoderm begins to appear as a loose meshwork between the cytotrophoblast and the exocoelomic membrane, filling the previously empty space.",
    keyEvents: [
      "Blood flow through lacunar network established",
      "Extraembryonic mesoderm begins to appear",
      "Cytotrophoblast starts forming primary villi projections",
    ],
    molecular: [],
    structuralChanges: [
      "Arteriovenous flow through lacunar system",
      "Loose extraembryonic mesoderm fills the space between cytotrophoblast and exocoelomic membrane",
      "Primary chorionic villi (solid cytotrophoblast columns capped by syncytiotrophoblast) begin to sprout",
    ],
    epithelialMesenchymal: [
      "Birth of true embryonic-source mesenchyme (extraembryonic mesoderm) from epiblast/hypoblast derivatives — first EMT-like event of pregnancy",
      "Epithelial cytotrophoblast starts interacting with this new mesenchyme — sets up the future chorionic villus (mesenchymal core + trophoblastic epithelium)",
    ],
    signalingPathways: [
      {
        pathway: "FGF / FGFR",
        ligand: "FGF from trophoblast",
        receptor: "FGFR on extraembryonic mesoderm",
        effect: "Mesenchymal proliferation & villus core formation",
      },
      {
        pathway: "BMP",
        ligand: "BMP4",
        receptor: "BMPR1/2",
        effect: "Specifies extraembryonic mesoderm and blood-island precursors",
      },
    ],
  },
  {
    day: 12,
    week: 2,
    stageId: "day8",
    title: "Extraembryonic Coelom",
    headline: "Extraembryonic mesoderm splits — chorionic cavity opens.",
    size: "0.4 mm",
    cellCount: "—",
    phase: "Chorionic cavity forms",
    whatHappens:
      "The loose extraembryonic mesoderm splits into two sheets: a somatic layer lining the cytotrophoblast and amnion, and a splanchnic layer covering the yolk sac. The gap between them is the chorionic cavity (extraembryonic coelom). The embryo now hangs suspended by the connecting stalk — the future umbilical cord.",
    keyEvents: [
      "Extraembryonic mesoderm splits → chorionic cavity",
      "Connecting stalk suspends embryo",
      "Chorion = trophoblast + somatic mesoderm",
    ],
    molecular: [],
    structuralChanges: [
      "Extraembryonic coelom (chorionic cavity) opens",
      "Somatic (parietal) mesoderm lines cytotrophoblast + amnion",
      "Splanchnic (visceral) mesoderm covers the yolk sac",
      "Connecting stalk of mesoderm suspends the embryo",
    ],
    epithelialMesenchymal: [
      "A layer of mesenchyme is now interposed between two epithelia (trophoblast and amnion/yolk sac) — the archetypal epithelium/mesenchyme sandwich",
      "Splanchnopleure = splanchnic mesoderm + endodermal epithelium; somatopleure = somatic mesoderm + ectodermal epithelium",
    ],
    signalingPathways: [
      {
        pathway: "BMP",
        ligand: "BMP2/4",
        receptor: "BMPR",
        effect: "Splits extraembryonic mesoderm into somatic vs splanchnic domains",
      },
      {
        pathway: "FGF",
        ligand: "FGF2/4",
        receptor: "FGFR",
        effect: "Maintains extraembryonic mesoderm proliferation",
      },
    ],
  },
  {
    day: 13,
    week: 2,
    stageId: "day8",
    title: "Secondary Yolk Sac",
    headline: "The primary yolk sac collapses and a smaller secondary yolk sac forms.",
    size: "0.45 mm",
    cellCount: "—",
    phase: "Yolk-sac remodeling",
    whatHappens:
      "A second wave of hypoblast cells migrates over the exocoelomic membrane, pinching off the distal part of the primary yolk sac (which fragments into exocoelomic cysts) and creating a smaller secondary (definitive) yolk sac. This is the sac that will supply nutrition and generate the first blood islands. Primary chorionic villi — solid cytotrophoblast columns — extend into the syncytiotrophoblast.",
    keyEvents: [
      "Primary yolk sac fragments → exocoelomic cysts",
      "Secondary (definitive) yolk sac forms",
      "Primary chorionic villi appear",
    ],
    molecular: [],
    structuralChanges: [
      "Secondary yolk sac (smaller, definitive) replaces primary yolk sac",
      "Exocoelomic cysts remain as remnants in the chorionic cavity",
      "Primary chorionic villi visible as radial cytotrophoblast columns",
    ],
    epithelialMesenchymal: [
      "New hypoblast-derived epithelium re-lines the yolk sac (MET-like)",
      "Splanchnic extraembryonic mesoderm hugs the yolk-sac epithelium → hematopoiesis primed on the mesenchymal side",
      "Cytotrophoblast columns interact with underlying extraembryonic mesenchyme (future villus stroma)",
    ],
    signalingPathways: [
      {
        pathway: "BMP4 → hematopoiesis",
        ligand: "BMP4 (splanchnic mesoderm)",
        receptor: "BMPR (yolk-sac mesoderm)",
        effect: "Specifies blood-island progenitors (hemangioblasts)",
      },
      {
        pathway: "Indian hedgehog (Ihh)",
        ligand: "Ihh (yolk-sac endoderm)",
        receptor: "Patched (adjacent mesoderm)",
        effect: "Promotes vasculogenesis and early hematopoiesis",
      },
    ],
  },
  {
    day: 14,
    week: 2,
    stageId: "day8",
    title: "End of Week 2 — Prechordal Plate",
    headline: "Bilaminar disc stable, cranial pole marked, streak about to appear.",
    size: "0.5 mm",
    cellCount: "—",
    phase: "Pre-gastrulation",
    whatHappens:
      "The embryo is a small flat disc sandwiched between the amniotic cavity above and the secondary yolk sac below, suspended in a large chorionic cavity, all buried in maternal endometrium. A local thickening of hypoblast — the prechordal plate — defines the future cranial end. Everything is in place for gastrulation.",
    keyEvents: [
      "Prechordal plate defines cranial pole",
      "Cranio-caudal and left-right axes established",
      "Ready for gastrulation",
    ],
    molecular: ["Nodal gradient defines cranio-caudal axis"],
    structuralChanges: [
      "Bilaminar disc stable, ~0.5 mm across",
      "Focal hypoblast thickening at cranial end = prechordal plate",
      "AVE (anterior visceral endoderm) established cranially",
    ],
    epithelialMesenchymal: [
      "Two flat epithelia (epiblast + hypoblast) share a basement membrane — poised for gastrulation EMT",
      "Prechordal plate = tight adhesion zone where epiblast and hypoblast are fused without intervening ECM — will resist mesoderm ingression, defining oropharyngeal membrane",
    ],
    signalingPathways: [
      {
        pathway: "Nodal",
        ligand: "Nodal (posterior epiblast)",
        receptor: "ActRIIB / ALK4 + Cripto",
        effect:
          "Posteriorly high → primitive streak site; anterior AVE Cerberus/Lefty inhibit Nodal to fix cranial identity",
      },
      {
        pathway: "Wnt",
        ligand: "Wnt3",
        receptor: "Frizzled/LRP5-6",
        effect: "β-catenin nuclear → posterior identity, streak induction",
      },
    ],
    clinical:
      "The 14-day rule — most jurisdictions cap in-vitro embryo research just before the primitive streak forms.",
  },
  {
    day: 15,
    week: 3,
    stageId: "day16",
    title: "Primitive Streak Emerges",
    headline: "A midline groove appears on the caudal epiblast — gastrulation begins.",
    size: "1.0 mm",
    cellCount: "—",
    phase: "Gastrulation initiates",
    whatHappens:
      "A narrow groove appears along the caudal midline of the epiblast — the primitive streak. Its cranial end thickens into the primitive node (Hensen's node) with a small pit in the center. This groove will be the doorway through which epiblast cells dive down to form the other two germ layers. Its position establishes the body's cranio-caudal and left-right axes for good.",
    keyEvents: [
      "Primitive streak forms in caudal midline",
      "Primitive node appears at cranial end of streak",
      "Body axes locked in",
    ],
    molecular: [
      "Wnt3 + Nodal + BMP4 gradient triggers streak",
      "FGF signaling recruits epiblast cells to the streak",
    ],
    structuralChanges: [
      "Linear midline groove (primitive streak) in caudal epiblast",
      "Cranial thickening = primitive node with central pit",
      "Groove and node establish body midline",
    ],
    epithelialMesenchymal: [
      "Streak is the site of the embryo's first massive EMT: columnar epithelial epiblast cells lose E-cadherin, gain N-cadherin, detach from basement membrane, and ingress as mesenchyme",
      "Ingressed mesenchyme spreads laterally between epiblast and hypoblast as endoderm and mesoderm precursors",
    ],
    signalingPathways: [
      {
        pathway: "Wnt/β-catenin",
        ligand: "Wnt3",
        receptor: "Frizzled / LRP5-6",
        effect: "Nuclear β-catenin → Brachyury (T) → primitive-streak/mesoderm program",
      },
      {
        pathway: "Nodal",
        ligand: "Nodal",
        receptor: "ActRIIB/ALK4 + Cripto → SMAD2/3",
        effect: "Specifies node and axial mesendoderm",
      },
      {
        pathway: "FGF",
        ligand: "FGF8 (streak)",
        receptor: "FGFR1 (epiblast)",
        effect: "MAPK activation → E-cadherin down, Snail up → EMT",
      },
      {
        pathway: "BMP",
        ligand: "BMP4 (posterior)",
        receptor: "BMPR",
        effect: "Restricts streak to caudal midline; blocks anterior EMT",
      },
    ],
  },
  {
    day: 16,
    week: 3,
    stageId: "day16",
    title: "Three Germ Layers Form",
    headline: "Epiblast cells stream through the streak to build meso- and endoderm.",
    size: "1.5 mm",
    cellCount: "Ecto · Meso · Endo",
    phase: "Trilaminar embryo",
    whatHappens:
      "Epiblast cells crawl toward the streak, dive down through it via epithelial-to-mesenchymal transition, and spread out between the two existing layers. The first wave displaces the hypoblast to become definitive endoderm. The second wave fills the middle space as intraembryonic mesoderm. Cells that stay on top become ectoderm. Every tissue in the adult body now traces back to one of these three layers.",
    keyEvents: [
      "Epiblast cells ingress via EMT",
      "Definitive endoderm displaces hypoblast",
      "Mesoderm fills the middle",
      "Remaining epiblast = ectoderm",
    ],
    molecular: [
      "Snail/Slug drive EMT at the streak",
      "Brachyury (T) marks nascent mesoderm",
      "Goosecoid marks the organizer (primitive node)",
    ],
    structuralChanges: [
      "Trilaminar disc: ectoderm (top) / mesoderm (middle) / endoderm (bottom)",
      "Hypoblast displaced peripherally to extraembryonic endoderm",
      "Node and streak clearly grooved on the dorsal surface",
    ],
    epithelialMesenchymal: [
      "Prototypical EMT: apico-basal polarity is lost, tight/adherens junctions dissolved, cytoskeleton rewired, cells become migratory mesenchyme",
      "Followed by immediate MET for definitive endoderm — mesenchymal cells re-epithelialize below to make a new gut-precursor sheet",
      "Mesoderm-fated cells stay mesenchymal (will later re-epithelialize regionally: somites, kidney tubules, coelomic lining)",
    ],
    signalingPathways: [
      {
        pathway: "Snail/Slug (Zn-finger TFs)",
        ligand: "Induced by Wnt/Nodal/FGF",
        receptor: "—",
        effect: "Repress E-cadherin → drive EMT at the streak",
      },
      {
        pathway: "Nodal (high)",
        ligand: "Nodal",
        receptor: "ActRIIB/ALK4 + Cripto",
        effect: "High → endoderm (Sox17, FoxA2); low → mesoderm",
      },
      {
        pathway: "FGF",
        ligand: "FGF8",
        receptor: "FGFR1",
        effect: "Sustains streak, Brachyury expression, mesoderm migration",
      },
    ],
    clinical:
      "A persistent streak → sacrococcygeal teratoma. Failure to regress or duplicate → conjoined twins.",
  },
  {
    day: 17,
    week: 3,
    stageId: "day16",
    title: "Mesoderm Subdivides",
    headline: "The middle layer splits into paraxial, intermediate and lateral plate mesoderm.",
    size: "1.6 mm",
    cellCount: "—",
    phase: "Mesoderm patterning",
    whatHappens:
      "On either side of the midline, the sheet of mesoderm organizes into three parallel strips: paraxial mesoderm next to the notochord (future somites), intermediate mesoderm (future urogenital system), and lateral plate mesoderm (which itself splits into somatic and splanchnic layers, enclosing the intraembryonic coelom — the future body cavities). Blood islands begin forming in the yolk sac wall.",
    keyEvents: [
      "Paraxial mesoderm forms alongside notochord",
      "Intermediate mesoderm defined",
      "Lateral plate splits: somatopleure + splanchnopleure",
      "First blood islands appear in yolk sac (hematopoiesis)",
    ],
    molecular: ["BMP gradient patterns paraxial → intermediate → lateral"],
    structuralChanges: [
      "Three parallel mesodermal columns on each side of the midline",
      "Intraembryonic coelom opens within lateral plate",
      "Blood islands (Wolff & Pander) in yolk-sac splanchnopleure",
    ],
    epithelialMesenchymal: [
      "Paraxial mesoderm remains mesenchymal but starts to condense — priming MET to form somites",
      "Somatopleuric mesoderm partners with overlying ectoderm; splanchnopleuric mesoderm partners with endoderm — the fundamental epithelium/mesenchyme partnerships of body wall vs gut",
      "Yolk-sac endoderm (epithelium) instructs adjacent mesenchyme to form hemangioblasts (paracrine)",
    ],
    signalingPathways: [
      {
        pathway: "BMP gradient",
        ligand: "BMP4 (lateral, high) → (medial, low)",
        receptor: "BMPR",
        effect:
          "High BMP → lateral plate; intermediate → intermediate mesoderm; low (antagonized by Noggin/Chordin from notochord) → paraxial",
      },
      {
        pathway: "FGF/Wnt (paraxial)",
        ligand: "FGF8, Wnt3a",
        receptor: "FGFR1, Frizzled",
        effect: "Maintain presomitic mesoderm; drive segmentation clock",
      },
      {
        pathway: "VEGF",
        ligand: "VEGF (endoderm)",
        receptor: "VEGFR2 (mesoderm)",
        effect: "Endothelial specification in blood islands",
      },
    ],
  },
  {
    day: 18,
    week: 3,
    stageId: "day16",
    title: "Notochordal Process",
    headline: "A hollow rod of mesoderm extends forward from the node.",
    size: "1.8 mm",
    cellCount: "—",
    phase: "Axial induction",
    whatHappens:
      "Cells migrating through Hensen's node form a hollow tube that grows cranially between epiblast and endoderm — the notochordal process. It temporarily fuses with the endoderm below (the notochordal plate) before detaching to become the solid definitive notochord. The notochord secretes Sonic hedgehog (SHH) upward, inducing the overlying ectoderm to thicken into the neural plate.",
    keyEvents: [
      "Notochordal process extends from Hensen's node",
      "Neural plate induced in overlying ectoderm",
      "Cloacal and oropharyngeal membranes defined (no mesoderm)",
    ],
    molecular: [
      "SHH from notochord ventralizes neural tube",
      "BMP antagonists (Noggin, Chordin) permit neural induction",
    ],
    structuralChanges: [
      "Notochordal process runs cranially in the midline",
      "Overlying ectoderm thickens into neural plate",
      "Oropharyngeal (cranial) and cloacal (caudal) membranes are ectoderm–endoderm fusion zones with no intervening mesoderm",
    ],
    epithelialMesenchymal: [
      "Classic epithelium ↔ mesenchyme induction: the mesenchymal notochord signals to the epithelial ectoderm to become neural plate (neural induction)",
      "Later MET: notochordal process itself re-epithelializes into the solid rod-like notochord",
    ],
    signalingPathways: [
      {
        pathway: "Sonic hedgehog (SHH)",
        ligand: "SHH (notochord)",
        receptor: "Patched (releases repression of Smoothened) → GLI TFs",
        effect:
          "Ventralizes neural tube (floor plate, motor neurons); acts as a morphogen with cholesterol-anchored gradient",
      },
      {
        pathway: "BMP antagonism",
        ligand: "Noggin, Chordin, Follistatin (node)",
        receptor: "Sequester BMP4/7",
        effect: "Removes BMP repression → default neural fate in dorsal ectoderm",
      },
      {
        pathway: "FGF",
        ligand: "FGF8",
        receptor: "FGFR1",
        effect: "Cooperates with BMP inhibition to stabilize neural induction",
      },
    ],
  },
  {
    day: 19,
    week: 3,
    stageId: "day21",
    title: "Neural Plate Broadens",
    headline: "The neural plate widens cranially into the future brain.",
    size: "1.9 mm",
    cellCount: "—",
    phase: "Neural plate stage",
    whatHappens:
      "The neural plate expands, especially at its cranial end where it will form the brain. A shallow neural groove appears down its midline. Below, the notochord has fully detached from endoderm and lies as an isolated rod. Cardiogenic mesoderm — the cells that will form the heart — gathers in a horseshoe shape at the cranial end of the disc.",
    keyEvents: [
      "Neural plate broadens cranially",
      "Neural groove appears midline",
      "Cardiogenic mesoderm assembles cranially",
    ],
    molecular: ["BMP4 in cranial mesoderm specifies heart field"],
    structuralChanges: [
      "Neural plate broad cranially, narrow caudally",
      "Midline neural groove flanked by neural folds",
      "Horseshoe-shaped cardiogenic field cranial to the oropharyngeal membrane",
    ],
    epithelialMesenchymal: [
      "Neural plate (epithelium) sits over paraxial/axial mesenchyme — reciprocal signalling patterns dorso-ventral neural identity",
      "Cardiogenic mesoderm (mesenchyme) is instructed by adjacent pharyngeal endoderm (epithelium)",
    ],
    signalingPathways: [
      {
        pathway: "SHH (ventral)",
        ligand: "SHH (notochord/floor plate)",
        receptor: "Patched → Smoothened → GLI",
        effect: "Ventral neural patterning (floor plate, motor neurons)",
      },
      {
        pathway: "BMP/Wnt (dorsal)",
        ligand: "BMP4/7, Wnt1/3a (surface ectoderm)",
        receptor: "BMPR, Frizzled",
        effect: "Dorsal neural fates (roof plate, sensory interneurons) & neural crest priming",
      },
      {
        pathway: "BMP2 → heart field",
        ligand: "BMP2 (pharyngeal endoderm)",
        receptor: "BMPR (cardiogenic mesoderm)",
        effect: "Induces Nkx2.5/GATA4 → cardiac lineage",
      },
    ],
  },
  {
    day: 20,
    week: 3,
    stageId: "day21",
    title: "Neural Folds & First Somites",
    headline: "Neural folds rise and the first pair of somites appears.",
    size: "2.0 mm",
    cellCount: "1–4 somite pairs",
    phase: "Neurulation",
    whatHappens:
      "The neural plate's edges rise up as neural folds while its center sinks into a deeper neural groove. The first pair of somites — blocks of paraxial mesoderm — buds off on either side of the notochord in the occipital region. Somites are the future vertebrae, ribs, skeletal muscles, and dermis of the back; they will form pair by pair, cranial to caudal, at a rate of ~3 pairs per day.",
    keyEvents: [
      "Neural folds elevate",
      "Neural groove deepens",
      "First somite pairs appear (day 20)",
    ],
    molecular: [
      "Actin/myosin contraction at hinge points drives folding",
      "Segmentation clock (Notch/Hes) times somite budding",
    ],
    structuralChanges: [
      "Deep neural groove with elevating neural folds",
      "First somite pairs (spherical epithelial balls) in occipital region",
      "Presomitic mesoderm still mesenchymal caudally",
    ],
    epithelialMesenchymal: [
      "Somitogenesis is a textbook MET: mesenchymal presomitic mesoderm re-epithelializes into a hollow ball with a central somitocoele",
      "Convergent extension in the neural plate — PCP-driven cell intercalation elongates and narrows the plate to help folding",
      "Neural plate hinge cells undergo apical constriction (epithelial shape change) to bend the sheet",
    ],
    signalingPathways: [
      {
        pathway: "Notch segmentation clock",
        ligand: "Delta-like (DLL1/3)",
        receptor: "Notch1 → HES7 oscillations",
        effect: "Times ~90-min somite budding cycles",
      },
      {
        pathway: "FGF8 / Wnt3a gradient",
        ligand: "FGF8, Wnt3a (tail)",
        receptor: "FGFR1, Frizzled",
        effect: "Maintains presomitic mesoderm; retreat of gradient sets somite boundary",
      },
      {
        pathway: "Retinoic acid (opposing gradient)",
        ligand: "RA (anterior somites)",
        receptor: "RAR/RXR",
        effect: "Antagonizes FGF/Wnt → permits somite MET and maturation",
      },
      {
        pathway: "Non-canonical Wnt / PCP",
        ligand: "Wnt5a, Wnt11",
        receptor: "Frizzled (+ Vangl/Celsr)",
        effect: "Convergent extension → neural plate narrowing/elongation",
      },
    ],
  },
  {
    day: 21,
    week: 3,
    stageId: "day21",
    title: "Neural Tube Closes",
    headline: "Neural folds fuse at the neck — the CNS becomes a closed tube.",
    size: "2.5 mm",
    cellCount: "~7 somite pairs",
    phase: "CNS formed",
    whatHappens:
      "Neural folds meet and fuse at the level of the future neck, then closure spreads both cranially and caudally like a zipper. As folds meet, neural crest cells pinch off from the crests and migrate throughout the body — they will become peripheral neurons, Schwann cells, melanocytes, facial cartilage, and adrenal medulla. Two rostral and caudal openings — the neuropores — remain temporarily open. The heart also starts beating around this time.",
    keyEvents: [
      "Neural tube closes at cervical region first",
      "Neural crest delaminates and migrates",
      "Heart tube starts contracting",
    ],
    molecular: [
      "PAX3, N-cadherin → E-cadherin switch in neural crest",
      "Folate deficiency → failed closure → NTDs",
    ],
    structuralChanges: [
      "Neural tube closed at cervical level; open cranial and caudal neuropores",
      "Neural crest streams beside the tube",
      "Somites: 7 pairs; paired endocardial tubes fusing into a single heart tube",
    ],
    epithelialMesenchymal: [
      "Neural crest EMT: dorsal neuroepithelial cells switch N-cadherin → cadherin-7, lose apico-basal polarity, delaminate, and become migratory mesenchyme",
      "Fusion of neural folds requires precise epithelial adhesion at the dorsal midline (E-/N-cadherin remodelling)",
      "PCP-driven convergent extension continues to elongate the closing tube",
    ],
    signalingPathways: [
      {
        pathway: "BMP → Wnt → Snail/FoxD3",
        ligand: "BMP4/Wnt1 (dorsal ectoderm)",
        receptor: "BMPR / Frizzled",
        effect: "Induces neural crest identity and EMT",
      },
      {
        pathway: "PCP (non-canonical Wnt)",
        ligand: "Wnt5a/Wnt11",
        receptor: "Frizzled + Vangl2 / Celsr / Dishevelled → Rho/Rac",
        effect: "Convergent extension → neural tube closure; VANGL mutations cause human NTDs",
      },
      {
        pathway: "Folate one-carbon metabolism",
        ligand: "Folate (dietary)",
        receptor: "Folate receptors / MTHFR",
        effect: "Supplies methyl groups for DNA/histone methylation; deficiency → failed closure",
      },
    ],
    clinical:
      "Failed cranial closure = anencephaly; failed caudal closure = spina bifida. Prevented by peri-conceptional folic acid.",
  },
  {
    day: 22,
    week: 4,
    stageId: "day21",
    title: "Heart Starts Beating",
    headline: "Paired heart tubes fuse into a single beating primitive heart.",
    size: "2.8 mm",
    cellCount: "~14 somite pairs",
    phase: "First circulation",
    whatHappens:
      "Two endocardial tubes fuse into a single midline heart tube that starts contracting at ~65 BPM. It is a simple pump with five regional dilations (truncus arteriosus, bulbus cordis, primitive ventricle, primitive atrium, sinus venosus). Even at this stage there is unidirectional blood flow through the embryo, yolk sac, and connecting stalk vessels — the first circulation.",
    keyEvents: [
      "Endocardial tubes fuse midline",
      "First heartbeat (~day 22, ~65 BPM)",
      "Unidirectional blood flow established",
    ],
    molecular: ["Nkx2.5 and GATA4 specify cardiac lineage"],
    structuralChanges: [
      "Single midline heart tube with 5 dilations (truncus, bulbus, ventricle, atrium, sinus venosus)",
      "Surrounded by myocardial mantle with cardiac jelly (ECM) between endocardium and myocardium",
      "Paired dorsal aortae carry blood cranially",
    ],
    epithelialMesenchymal: [
      "Endocardium = endothelial epithelium; myocardium = mesenchymal-derived muscle — separated by cardiac-jelly ECM (future site of endocardial-cushion EMT)",
      "Splanchnic mesoderm (mesenchyme) instructs adjacent pharyngeal endoderm to secrete BMP2 → reciprocal induction of the heart",
    ],
    signalingPathways: [
      {
        pathway: "BMP2 → Nkx2.5/GATA4",
        ligand: "BMP2 (endoderm)",
        receptor: "BMPR (cardiogenic mesoderm)",
        effect: "Specifies cardiomyocyte identity",
      },
      {
        pathway: "Wnt inhibition (canonical)",
        ligand: "Dkk1, Crescent (anterior)",
        receptor: "LRP5/6 blockade",
        effect: "Anterior canonical Wnt OFF is required for heart induction",
      },
      {
        pathway: "FGF8",
        ligand: "FGF8 (pharyngeal endoderm)",
        receptor: "FGFR",
        effect: "Sustains second heart field for outflow tract",
      },
    ],
  },
  {
    day: 23,
    week: 4,
    stageId: "day21",
    title: "Cranial Neuropore Closes",
    headline: "The head end of the neural tube seals shut.",
    size: "3.0 mm",
    cellCount: "~20 somite pairs",
    phase: "Brain vesicles forming",
    whatHappens:
      "The cranial (anterior) neuropore closes. The rostral neural tube immediately balloons into three primary brain vesicles: prosencephalon (forebrain), mesencephalon (midbrain), and rhombencephalon (hindbrain). The heart tube begins dextral (rightward) looping — the very first left-right asymmetry in the body.",
    keyEvents: [
      "Cranial neuropore closes",
      "Three primary brain vesicles appear",
      "Heart tube undergoes dextral looping",
    ],
    molecular: ["Nodal/Lefty asymmetry establishes left-right axis"],
    structuralChanges: [
      "Three primary brain vesicles: prosencephalon, mesencephalon, rhombencephalon",
      "Cervical and cephalic flexures in the neural tube",
      "Heart loops rightward (D-loop) — first visible L–R asymmetry",
    ],
    epithelialMesenchymal: [
      "Cephalic neural crest (mesenchyme) migrates ventrolaterally to populate pharyngeal arches, meeting pharyngeal endoderm and surface ectoderm — classic three-way epithelium/mesenchyme cross-talk",
      "Endocardial cushion cells begin to undergo EMT in the atrioventricular canal (delaminating from endocardium into cardiac jelly) — foundation for valves and septa",
    ],
    signalingPathways: [
      {
        pathway: "Nodal / Lefty / Pitx2 (L–R axis)",
        ligand: "Nodal (left), Lefty (midline barrier)",
        receptor: "ActRIIB/ALK4 + Cripto → Pitx2",
        effect: "Left-sided Pitx2 drives asymmetric heart looping and visceral situs",
      },
      {
        pathway: "SHH (midline)",
        ligand: "SHH",
        receptor: "Patched → GLI",
        effect:
          "Midline barrier prevents left signals crossing right; also patterns forebrain (holoprosencephaly if lost)",
      },
      {
        pathway: "BMP / TGF-β (endocardial EMT)",
        ligand: "BMP2, TGF-β2",
        receptor: "BMPR/TGF-βR",
        effect: "Induces EMT of AV endocardial cells to seed valve mesenchyme",
      },
    ],
  },
  {
    day: 24,
    week: 4,
    stageId: "day28",
    title: "Pharyngeal Arches 1–2",
    headline: "The first two neck ridges appear on either side of the pharynx.",
    size: "3.2 mm",
    cellCount: "~22 somite pairs",
    phase: "Face & neck patterning",
    whatHappens:
      "The first (mandibular) and second (hyoid) pharyngeal arches become visible on either side of the developing head. Each arch contains a mesodermal core populated by neural crest cells, an aortic arch artery, a cranial nerve (V, VII), and specific muscle and cartilage precursors. The otic placode (future inner ear) invaginates lateral to the hindbrain, and the optic vesicles bulge out from the forebrain.",
    keyEvents: [
      "Pharyngeal arches 1 & 2 appear",
      "Otic placode invaginates → otic pit",
      "Optic vesicles evaginate from forebrain",
    ],
    molecular: ["Neural crest cells populate each arch with unique Hox codes"],
    structuralChanges: [
      "Arches 1 & 2 as paired ridges flanking the pharynx",
      "Each arch: ectodermal cover + mesenchymal core (mesoderm + neural crest) + endodermal lining + arch artery + cranial nerve",
      "Otic pit and optic vesicles visible on head",
    ],
    epithelialMesenchymal: [
      "Every arch is a three-way epithelium–mesenchyme sandwich: surface ectoderm (epithelium) — arch mesenchyme (mesoderm + crest) — pharyngeal endoderm (epithelium)",
      "Placodes (otic, optic-lens, olfactory) form from ectodermal thickenings that will invaginate — MET-driven organized epithelia interact with underlying mesenchyme",
    ],
    signalingPathways: [
      {
        pathway: "Hox code",
        ligand: "Retinoic acid gradient",
        receptor: "RAR/RXR",
        effect: "Nested Hox expression assigns arch identity to migrating crest",
      },
      {
        pathway: "Endothelin-1 / EDNRA",
        ligand: "ET-1 (arch ectoderm/endoderm)",
        receptor: "EDNRA (arch crest)",
        effect: "Ventral (mandibular) arch identity — loss → mandibular hypoplasia",
      },
      {
        pathway: "FGF8 / BMP4 / SHH",
        ligand: "FGF8, BMP4, SHH (pharyngeal epithelia)",
        receptor: "Respective receptors on arch mesenchyme",
        effect: "Pattern arch cartilages, muscles, teeth",
      },
    ],
  },
  {
    day: 25,
    week: 4,
    stageId: "day28",
    title: "Caudal Neuropore Closes",
    headline: "The tail end of the neural tube seals — the embryo folds into a C-shape.",
    size: "3.5 mm",
    cellCount: "~25 somite pairs",
    phase: "Body folding",
    whatHappens:
      "The caudal neuropore closes. Simultaneously the flat trilaminar disc folds in two directions at once: cranio-caudal folding curls the head and tail under, and lateral folding wraps the sides around the yolk sac. This transforms the flat disc into a curved 3D embryo with a primitive gut tube tucked inside. Pharyngeal arches 3 and 4 appear.",
    keyEvents: [
      "Caudal neuropore closes",
      "Cranio-caudal + lateral body folding",
      "Primitive gut tube encloses",
      "Pharyngeal arches 3 & 4 appear",
    ],
    molecular: [],
    structuralChanges: [
      "Flat disc → C-shaped embryo (cranio-caudal + lateral folding)",
      "Foregut, midgut, hindgut delineated; midgut still open to yolk sac via vitelline duct",
      "Body wall closes ventrally except at umbilical ring",
      "Arches 3 & 4 visible",
    ],
    epithelialMesenchymal: [
      "Endodermal epithelium is enclosed by splanchnic mesenchyme → future gut wall (epithelium + smooth muscle/connective from mesenchyme) — classic epithelium/mesenchyme partnership that will drive gut regionalization",
      "Somatopleure (ectoderm + somatic mesoderm) shapes the body wall",
    ],
    signalingPathways: [
      {
        pathway: "SHH (gut endoderm → mesenchyme)",
        ligand: "SHH (endoderm)",
        receptor: "Patched (mesenchyme)",
        effect: "Radial patterning of gut wall; regional specification (foregut/midgut/hindgut)",
      },
      {
        pathway: "Wnt/β-catenin (posterior)",
        ligand: "Wnt3a",
        receptor: "Frizzled",
        effect: "Posterior identity, hindgut/cloaca specification",
      },
      {
        pathway: "BMP/Noggin",
        ligand: "BMP4 vs Noggin",
        receptor: "BMPR",
        effect: "Dorso-ventral patterning of body wall and gut",
      },
    ],
    clinical:
      "Failed caudal neuropore closure → myelomeningocele (open spina bifida) at the lumbosacral level.",
  },
  {
    day: 26,
    week: 4,
    stageId: "day28",
    title: "Upper Limb Buds Appear",
    headline: "Small paddles of mesenchyme bulge out at cervical/thoracic level.",
    size: "3.7 mm",
    cellCount: "~28 somite pairs",
    phase: "Limb induction",
    whatHappens:
      "The upper limb buds appear as small bulges of lateral plate mesoderm covered by an ectodermal cap called the apical ectodermal ridge (AER). The AER secretes FGF8 to keep the underlying mesenchyme proliferating, driving proximo-distal outgrowth (shoulder → hand). A patch of posterior mesoderm — the zone of polarizing activity — secretes SHH to define the antero-posterior (thumb vs pinky) axis. The forebrain begins to divide into two telencephalic vesicles.",
    keyEvents: [
      "Upper limb buds appear (~day 26)",
      "Apical ectodermal ridge (AER) forms on each bud",
      "Forebrain splits into two telencephalic vesicles",
    ],
    molecular: [
      "FGF10 (mesenchyme) ↔ FGF8 (AER) loop drives outgrowth",
      "SHH from ZPA → antero-posterior limb axis",
      "Wnt7a from dorsal ectoderm → dorso-ventral axis",
    ],
    structuralChanges: [
      "Paddle-shaped upper limb buds: mesenchymal core (lateral plate + somitic myoblasts) capped by AER (thickened ectoderm)",
      "Forebrain begins to split into telencephalic vesicles",
    ],
    epithelialMesenchymal: [
      "The limb bud is the canonical epithelium–mesenchyme feedback loop: AER (epithelium) ↔ progress zone (mesenchyme). Disrupting either arrests outgrowth",
      "Skeletal muscle progenitors (mesenchymal) migrate in from adjacent somites (dermomyotome) and are patterned by limb mesenchyme (juxtacrine + paracrine)",
    ],
    signalingPathways: [
      {
        pathway: "FGF10 ↔ FGF8 (proximo-distal)",
        ligand: "FGF10 (mesenchyme) → FGF8 (AER)",
        receptor: "FGFR2b (AER) / FGFR2c (mesenchyme)",
        effect: "Positive feedback loop drives progressive outgrowth (shoulder→hand)",
      },
      {
        pathway: "SHH from ZPA (antero-posterior)",
        ligand: "SHH",
        receptor: "Patched → GLI3 processing",
        effect: "Digit identity gradient (thumb vs pinky); ectopic SHH → polydactyly",
      },
      {
        pathway: "Wnt7a (dorso-ventral)",
        ligand: "Wnt7a (dorsal ectoderm)",
        receptor: "Frizzled → Lmx1b",
        effect: "Dorsal limb identity (nail vs palm)",
      },
      {
        pathway: "BMP",
        ligand: "BMP2/4/7",
        receptor: "BMPR",
        effect: "Interdigital apoptosis, joint formation",
      },
    ],
  },
  {
    day: 27,
    week: 4,
    stageId: "day28",
    title: "Lower Limb Buds Appear",
    headline: "The paired lower limb buds emerge, ~1 day behind the arms.",
    size: "3.8 mm",
    cellCount: "—",
    phase: "Limbs symmetric",
    whatHappens:
      "The lower limb buds appear at the lumbar/sacral level — they follow the same molecular blueprint as the arms but lag by about a day, which is why lower-limb malformations from a teratogenic hit are usually milder than upper-limb ones at the same exposure time. Pharyngeal arches, otic pits, optic cups, and lens placodes are all clearly visible. The heart is now a curved S-shaped loop.",
    keyEvents: [
      "Lower limb buds appear (~day 27)",
      "Lens placodes invaginate opposite optic cups",
      "Heart in fully looped S-shape",
    ],
    molecular: ["Tbx5 → forelimb identity, Tbx4/Pitx1 → hindlimb identity"],
    structuralChanges: [
      "Lower limb buds at lumbosacral level",
      "Optic cup (bilayered) with invaginating lens placode facing it",
      "S-shaped heart loop with visible chambers",
    ],
    epithelialMesenchymal: [
      "Optic cup (neural epithelium) induces overlying surface ectoderm to form the lens placode → lens vesicle (MET) — textbook epithelium/epithelium instructive induction requiring interposed periocular mesenchyme (crest)",
      "Lower limb repeats the AER/mesenchyme reciprocal loop",
    ],
    signalingPathways: [
      {
        pathway: "Tbx4 / Pitx1 (hindlimb identity)",
        ligand: "Upstream Hox9-13, RA",
        receptor: "—",
        effect: "Specifies hindlimb-specific morphology",
      },
      {
        pathway: "FGF/SHH/Wnt (limb)",
        ligand: "FGF10↔FGF8, SHH, Wnt7a",
        receptor: "FGFR, Patched, Frizzled",
        effect: "Same three-axis outgrowth loop as forelimb, delayed by ~24 h",
      },
      {
        pathway: "BMP → lens induction",
        ligand: "BMP4/7 (optic vesicle)",
        receptor: "BMPR (surface ectoderm)",
        effect: "Sox2/Pax6 → lens placode; loss → anophthalmia",
      },
    ],
    clinical:
      "Thalidomide (1957–1961) hit hardest between days 20–36, when limb buds are most vulnerable — producing phocomelia.",
  },
  {
    day: 28,
    week: 4,
    stageId: "day28",
    title: "End of Week 4 — Organogenesis",
    headline: "A curved C-shaped embryo with beating heart, brain vesicles, and limb buds.",
    size: "4.0 mm",
    cellCount: "Millions",
    phase: "Organogenesis peak",
    whatHappens:
      "By the end of week 4, the embryo is unmistakably 'embryo-shaped': a curved C the size of a grain of rice. The bulging heart pumps at ~110–160 BPM, driving primitive circulation through the first blood islands. Three brain vesicles are visible through the head. Four pairs of pharyngeal arches shape the future face and neck. Upper and lower limb buds are both present. A short tail projects caudally. This is the peak of embryonic vulnerability — most teratogenic malformations trace to weeks 3–8.",
    keyEvents: [
      "Heart beats at ~110–160 BPM",
      "3 primary brain vesicles",
      "Pharyngeal arches 1–4",
      "Upper (D26) & lower (D27) limb buds present",
      "Otic & optic placodes forming",
      "Tail present (regresses by week 8)",
    ],
    molecular: [
      "FGF10 in mesenchyme → limb bud outgrowth",
      "SHH in zone of polarizing activity → antero-posterior limb axis",
    ],
    structuralChanges: [
      "C-shaped ~4 mm embryo",
      "Prominent heart bulge, cephalic flexure, tail",
      "4 pharyngeal arches, upper + lower limb buds, otic/optic placodes",
      "Enclosed gut with vitelline duct still connecting midgut to yolk sac",
    ],
    epithelialMesenchymal: [
      "Nearly every organ primordium is now an active epithelium/mesenchyme induction site (gut/mesenchyme, ureteric bud/metanephric mesenchyme, lung bud/mesenchyme, tooth/dental mesenchyme)",
      "Ongoing waves of EMT (neural crest, endocardial cushions) and MET (somites, nephron)",
    ],
    signalingPathways: [
      {
        pathway: "SHH",
        ligand: "SHH",
        receptor: "Patched → GLI",
        effect: "Midline, gut, limb, neural tube patterning",
      },
      {
        pathway: "FGF family",
        ligand: "FGF8/10",
        receptor: "FGFRs",
        effect: "Limb outgrowth, brain patterning, branching morphogenesis",
      },
      {
        pathway: "Wnt (canonical + PCP)",
        ligand: "Wnts",
        receptor: "Frizzled ± LRP",
        effect: "Axis, kidney, gut, neural tube closure via PCP",
      },
      {
        pathway: "TGF-β / BMP / Nodal",
        ligand: "BMP2/4, TGF-β, Nodal",
        receptor: "BMPR/ALK",
        effect: "L–R asymmetry, cushion EMT, dorsoventral patterning",
      },
    ],
    clinical:
      "Weeks 3–8 = embryonic period = maximum teratogen sensitivity. Alcohol, isotretinoin, valproate, and rubella cause structural birth defects if exposure occurs now.",
  },
];

export const DAY_INDEX_BY_NUMBER = new Map(DAYS.map((d, i) => [d.day, i]));
