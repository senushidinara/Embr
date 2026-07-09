import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildDayScene, type DaySceneBuild, type DaySceneLabel } from "@/lib/embryo-day-scenes";
import { STAGES, type StageId } from "@/lib/embryo-stages";

type Plane = "sagittal" | "transverse" | "coronal";
interface Screen {
  x: number;
  y: number;
  visible: boolean;
}

export function EmbryoScene({
  day,
  xray,
  explode,
  slicePlane,
  sliceDepth,
  onLabels,
  selectedLabel,
}: {
  day: number;
  xray: boolean;
  explode: number;
  slicePlane: Plane | "off";
  sliceDepth: number;
  onLabels: (labels: { key: string; text: string; screen: Screen; description: string }[]) => void;
  selectedLabel: string | null;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    stageGroup: THREE.Group;
    prevBuild: DaySceneBuild | null;
    prevGroup: THREE.Group | null;
    prevOpacity: number;
    build: DaySceneBuild | null;
    buildOpacity: number;
    clippingPlane: THREE.Plane;
    slicePlaneMesh: THREE.Mesh;
    labels: DaySceneLabel[];
    dispose: () => void;
    rotX: number;
    rotY: number;
    targetRotX: number;
    targetRotY: number;
    dragging: boolean;
    lastX: number;
    lastY: number;
    zoom: number;
    xray: boolean;
    explode: number;
    slicePlane: Plane | "off";
    sliceDepth: number;
    onLabels: typeof onLabels;
    selectedLabel: string | null;
    dayStartT: number;
  } | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        precision: "highp",
        stencil: false,
        depth: true,
        failIfMajorPerformanceCaveat: false,
      });
    } catch (e) {
      console.warn("WebGL initialization failed, retrying with fallback settings", e);
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "low-power",
        precision: "mediump",
        stencil: false,
        depth: true,
      });
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.localClippingEnabled = true;
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 8);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const hemi = new THREE.HemisphereLight(0xfff3fb, 0x24111b, 0.45);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffe4f0, 1.4);
    key.position.set(4, 5, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 2;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x88ccff, 0.9);
    rim.position.set(-5, -3, -4);
    rim.castShadow = true;
    rim.shadow.mapSize.set(1024, 1024);
    scene.add(rim);
    const fill = new THREE.PointLight(0xff88bb, 0.7, 20);
    fill.position.set(-3, 2, 3);
    scene.add(fill);

    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const clippingPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 100);
    const slicePlaneMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 7),
      new THREE.MeshBasicMaterial({
        color: 0xff3d8a,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    slicePlaneMesh.visible = false;
    scene.add(slicePlaneMesh);

    const st: NonNullable<typeof stateRef.current> = {
      renderer,
      scene,
      camera,
      stageGroup,
      prevBuild: null,
      prevGroup: null,
      prevOpacity: 0,
      build: null,
      buildOpacity: 1,
      clippingPlane,
      slicePlaneMesh,
      labels: [],
      rotX: 0.1,
      rotY: 0.4,
      targetRotX: 0.1,
      targetRotY: 0.4,
      dragging: false,
      lastX: 0,
      lastY: 0,
      zoom: 8,
      xray: false,
      explode: 0,
      slicePlane: "off",
      sliceDepth: 0,
      onLabels,
      selectedLabel: null,
      dispose: () => {},
      dayStartT: 0,
    };
    stateRef.current = st;

    const el = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      st.dragging = true;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!st.dragging) return;
      const dx = e.clientX - st.lastX;
      const dy = e.clientY - st.lastY;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      const sensitivity = 0.012;
      st.targetRotY += dx * sensitivity;
      st.targetRotX += dy * sensitivity;
      st.targetRotX = Math.max(-1.2, Math.min(1.2, st.targetRotX));
    };
    const onUp = (e: PointerEvent) => {
      st.dragging = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = window.innerWidth < 640 ? 0.4 : 0.6;
      st.zoom = Math.max(4, Math.min(16, st.zoom + Math.sign(e.deltaY) * zoomSpeed));
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth,
        h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(mount);

    let raf = 0;
    const clock = new THREE.Clock();
    const tmpV = new THREE.Vector3();
    const tuneMeshQuality = (root: THREE.Object3D) => {
      root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (!m) return;
        const arr = Array.isArray(m) ? m : [m];
        for (const mm of arr) {
          mm.dithering = true;
        }
      });
    };

    const applyOpacity = (root: THREE.Object3D, mult: number) => {
      root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (!m) return;
        const arr = Array.isArray(m) ? m : [m];
        for (const mm of arr) {
          if (!mm) continue;
          const anyM = mm as any;
          if (!anyM.userData) anyM.userData = {};
          if (anyM.userData.baseOp == null) {
            anyM.userData.baseOp = anyM.opacity ?? 1;
          }
          anyM.transparent = true;
          anyM.opacity = (anyM.userData.baseOp ?? 1) * mult;
        }
      });
    };

    const tick = () => {
      const t = clock.getElapsedTime();
      const rotationSmoothing = 0.15;
      const zoomSmoothing = 0.12;
      st.rotX += (st.targetRotX - st.rotX) * rotationSmoothing;
      st.rotY += (st.targetRotY - st.rotY) * rotationSmoothing;
      stageGroup.rotation.x = st.rotX;
      stageGroup.rotation.y = st.rotY;
      camera.position.z += (st.zoom - camera.position.z) * zoomSmoothing;

      // Crossfade
      if (st.prevGroup) {
        st.prevOpacity -= 0.05;
        applyOpacity(st.prevGroup, Math.max(0, st.prevOpacity));
        if (st.prevOpacity <= 0) {
          stageGroup.remove(st.prevGroup);
          st.prevGroup.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (mesh.geometry) mesh.geometry.dispose?.();
          });
          st.prevGroup = null;
          st.prevBuild = null;
        }
      }
      if (st.build && st.buildOpacity < 1) {
        st.buildOpacity = Math.min(1, st.buildOpacity + 0.06);
        applyOpacity(st.build.group, st.buildOpacity);
      }

      const localT = t - st.dayStartT;
      if (st.build?.update) st.build.update(localT);
      if (st.prevBuild?.update) st.prevBuild.update(t);

      if (st.build) {
        for (const ex of st.build.explodable) {
          const off = ex.dir.clone().multiplyScalar(st.explode * 1.5);
          ex.mesh.position.copy(ex.base).add(off);
        }
      }

      if (st.build) {
        const outerFactor = st.xray ? 0.15 : 1;
        for (const mesh of st.build.outerMeshes) {
          if (!mesh.material) continue;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of mats) {
            if (!mat) continue;
            const anyM = mat as any;
            if (!anyM.userData) anyM.userData = {};
            if (anyM.userData.xrayBase == null) {
              anyM.userData.xrayBase = anyM.userData.baseOp ?? anyM.opacity ?? 1;
            }
            const desired = (anyM.userData.xrayBase ?? 1) * outerFactor * st.buildOpacity;
            anyM.transparent = true;
            anyM.opacity = (anyM.opacity ?? 1) + (desired - (anyM.opacity ?? 1)) * 0.15;
          }
        }
      }

      // slicing plane
      if (st.slicePlane === "off") {
        st.clippingPlane.constant = 100;
        slicePlaneMesh.visible = false;
      } else {
        slicePlaneMesh.visible = true;
        const n = new THREE.Vector3();
        if (st.slicePlane === "sagittal") n.set(1, 0, 0);
        else if (st.slicePlane === "coronal") n.set(0, 0, 1);
        else n.set(0, 1, 0);
        st.clippingPlane.normal.copy(n);
        st.clippingPlane.constant = -st.sliceDepth * 2.5;
        slicePlaneMesh.position.copy(n.clone().multiplyScalar(st.sliceDepth * 2.5));
        slicePlaneMesh.lookAt(slicePlaneMesh.position.clone().add(n));
      }
      if (st.build) {
        st.build.group.traverse((o) => {
          const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
          if (!m) return;
          const arr = Array.isArray(m) ? m : [m];
          for (const mm of arr) {
            if (!mm) continue;
            mm.clippingPlanes = st.slicePlane === "off" ? [] : [st.clippingPlane];
            mm.clipShadows = true;
          }
        });
      }

      renderer.render(scene, camera);

      const w = mount.clientWidth,
        h = mount.clientHeight;
      const out: { key: string; text: string; screen: Screen; description: string }[] = [];
      for (const lb of st.labels) {
        tmpV.copy(lb.position).applyMatrix4(stageGroup.matrixWorld);
        const proj = tmpV.clone().project(camera);
        const x = (proj.x * 0.5 + 0.5) * w;
        const y = (-proj.y * 0.5 + 0.5) * h;
        const visible = proj.z > -1 && proj.z < 1 && x > 0 && x < w && y > 0 && y < h;
        out.push({
          key: lb.key,
          text: lb.text,
          description: lb.description,
          screen: { x, y, visible },
        });
      }
      st.onLabels(out);

      raf = requestAnimationFrame(tick);
    };
    tick();

    st.dispose = () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);

      // Cleanup scene objects
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of mats) mat?.dispose?.();
        }
      });

      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };

    return () => st.dispose();
  }, []); // eslint-disable-line

  // rebuild on day change with crossfade
  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;

    const tuneMeshQuality = (root: THREE.Object3D) => {
      root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (!m) return;
        const arr = Array.isArray(m) ? m : [m];
        for (const mm of arr) {
          mm.dithering = true;
        }
      });
    };

    // Move current to prev
    if (st.build) {
      st.prevBuild = st.build;
      st.prevGroup = st.build.group;
      st.prevOpacity = st.buildOpacity;
    }
    const b = buildDayScene(day);
    tuneMeshQuality(b.group);
    st.build = b;
    st.labels = b.labels;
    st.buildOpacity = 0;
    st.stageGroup.add(b.group);
    // fresh time origin so per-day animations play from start
    st.dayStartT = performance.now() / 1000;
  }, [day]);

  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    st.xray = xray;
    st.explode = explode;
    st.slicePlane = slicePlane;
    st.sliceDepth = sliceDepth;
    st.onLabels = onLabels;
    st.selectedLabel = selectedLabel;
  }, [xray, explode, slicePlane, sliceDepth, onLabels, selectedLabel]);

  return <div ref={mountRef} className="absolute inset-0 touch-none" />;
}

export { STAGES };
export type { StageId };
