import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { buildStage, STAGES, type StageId, type StageLabel } from "@/lib/embryo-stages";

type Plane = "sagittal" | "transverse" | "coronal";

interface Screen { x: number; y: number; visible: boolean }

export function EmbryoScene({
  stage,
  xray,
  explode,
  slicePlane,
  sliceDepth,
  onLabels,
  selectedLabel,
}: {
  stage: StageId;
  xray: boolean;
  explode: number; // 0..1
  slicePlane: Plane | "off";
  sliceDepth: number; // -1..1
  onLabels: (labels: { key: string; text: string; screen: Screen; description: string }[]) => void;
  selectedLabel: string | null;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    stageGroup: THREE.Group;
    build: ReturnType<typeof buildStage> | null;
    clippingPlane: THREE.Plane;
    slicePlaneMesh: THREE.Mesh;
    labels: StageLabel[];
    dispose: () => void;
    // control state
    rotX: number; rotY: number;
    targetRotX: number; targetRotY: number;
    dragging: boolean;
    lastX: number; lastY: number;
    zoom: number;
    xray: boolean;
    explode: number;
    slicePlane: Plane | "off";
    sliceDepth: number;
    onLabels: typeof onLabels;
    selectedLabel: string | null;
  } | null>(null);

  // init once
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.localClippingEnabled = true;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xffe4f0, 1.4);
    key.position.set(4, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x88ccff, 0.9);
    rim.position.set(-5, -3, -4);
    scene.add(rim);
    const fill = new THREE.PointLight(0xff88bb, 0.7, 20);
    fill.position.set(-3, 2, 3);
    scene.add(fill);

    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const clippingPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 100);

    // Pink slicing plane visualizer
    const slicePlaneMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 7),
      new THREE.MeshBasicMaterial({
        color: 0xff3d8a, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false,
      }),
    );
    slicePlaneMesh.visible = false;
    scene.add(slicePlaneMesh);

    const st: NonNullable<typeof stateRef.current> = {
      renderer, scene, camera, stageGroup, build: null, clippingPlane, slicePlaneMesh,
      labels: [],
      rotX: 0, rotY: 0, targetRotX: 0, targetRotY: 0,
      dragging: false, lastX: 0, lastY: 0, zoom: 8,
      xray: false, explode: 0, slicePlane: "off", sliceDepth: 0,
      onLabels, selectedLabel: null,
      dispose: () => {},
    };
    stateRef.current = st;

    // Interaction
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
      st.targetRotY += dx * 0.01;
      st.targetRotX += dy * 0.01;
      st.targetRotX = Math.max(-1.2, Math.min(1.2, st.targetRotX));
    };
    const onUp = (e: PointerEvent) => {
      st.dragging = false;
      try { el.releasePointerCapture(e.pointerId); } catch {}
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      st.zoom = Math.max(4, Math.min(16, st.zoom + Math.sign(e.deltaY) * 0.6));
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    // Resize
    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(mount);

    // Animate
    let raf = 0;
    const clock = new THREE.Clock();
    const tmpV = new THREE.Vector3();

    const tick = () => {
      const t = clock.getElapsedTime();
      // smooth camera
      st.rotX += (st.targetRotX - st.rotX) * 0.12;
      st.rotY += (st.targetRotY - st.rotY) * 0.12;
      stageGroup.rotation.x = st.rotX;
      stageGroup.rotation.y = st.rotY;
      camera.position.z += (st.zoom - camera.position.z) * 0.1;

      if (st.build?.update) st.build.update(t);

      // explode
      if (st.build) {
        for (const ex of st.build.explodable) {
          const off = ex.dir.clone().multiplyScalar(st.explode * 1.5);
          ex.mesh.position.copy(ex.base).add(off);
        }
      }

      // xray - fade outer meshes
      if (st.build) {
        for (const m of st.build.outerMeshes) {
          const mat = m.material as THREE.MeshPhysicalMaterial;
          const targetOpacity = st.xray ? 0.15 : (mat.userData.baseOpacity ?? 1);
          if (mat.userData.baseOpacity == null) mat.userData.baseOpacity = mat.opacity;
          mat.transparent = true;
          mat.opacity += (targetOpacity - mat.opacity) * 0.15;
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
        // depth: -1..1 maps to constant
        st.clippingPlane.constant = -st.sliceDepth * 2.5;
        // position plane mesh
        slicePlaneMesh.position.copy(n.clone().multiplyScalar(st.sliceDepth * 2.5));
        slicePlaneMesh.lookAt(slicePlaneMesh.position.clone().add(n));
      }

      // Apply clipping to all stage materials
      if (st.build) {
        st.build.group.traverse((o) => {
          const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
          if (!m) return;
          const arr = Array.isArray(m) ? m : [m];
          for (const mm of arr) {
            mm.clippingPlanes = st.slicePlane === "off" ? [] : [st.clippingPlane];
            mm.clipShadows = true;
          }
        });
      }

      renderer.render(scene, camera);

      // project labels
      const w = mount.clientWidth, h = mount.clientHeight;
      const out: { key: string; text: string; screen: Screen; description: string }[] = [];
      for (const lb of st.labels) {
        tmpV.copy(lb.position).applyMatrix4(stageGroup.matrixWorld);
        const proj = tmpV.clone().project(camera);
        const x = (proj.x * 0.5 + 0.5) * w;
        const y = (-proj.y * 0.5 + 0.5) * h;
        const visible = proj.z > -1 && proj.z < 1;
        out.push({ key: lb.key, text: lb.text, description: lb.description, screen: { x, y, visible } });
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
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };

    return () => st.dispose();
  }, []); // eslint-disable-line

  // rebuild on stage change
  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    // remove old
    while (st.stageGroup.children.length) {
      const c = st.stageGroup.children[0];
      st.stageGroup.remove(c);
      c.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose?.();
      });
    }
    const b = buildStage(stage);
    st.build = b;
    st.labels = b.labels;
    st.stageGroup.add(b.group);
    // reset rotation slightly
    st.targetRotY = 0.4;
    st.targetRotX = 0.1;
  }, [stage]);

  // update reactive props
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
export type { StageId, StageLabel };
