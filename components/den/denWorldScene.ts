import {
  AmbientLight, BoxGeometry, Color, CylinderGeometry, DirectionalLight,
  Group, LineSegments, MathUtils, Mesh, PCFSoftShadowMap, SRGBColorSpace,
  MeshStandardMaterial, OrthographicCamera, PlaneGeometry, PointLight, Raycaster,
  Scene, SphereGeometry, TorusGeometry, Vector2, Vector3, WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { denStations, type DenStationId } from "./denStations";

type Projection = { x: number; y: number; visible: boolean; scale: number };
type Projected = Record<string, Projection>;
type Callbacks = {
  onSelect: (id: DenStationId) => void;
  onProject: (points: Projected) => void;
};
export type DenWorldController = {
  focus: (id: DenStationId) => void;
  reset: () => void;
  zoom: (factor: number) => void;
  dispose: () => void;
};

const ink = 0x151a22, graphite = 0x303947, edge = 0x788ca4;
const blue = 0x4c91f5, gold = 0xf5c66b, paper = 0xece5d7;
const material = (color: number, metalness = 0.16, roughness = 0.73, emissive = 0x000000) =>
  new MeshStandardMaterial({ color, metalness, roughness, emissive, emissiveIntensity: emissive ? 0.28 : 0 });

function box(parent: Group | Scene, w: number, h: number, d: number, color: number, x = 0, y = 0, z = 0) {
  const mesh = new Mesh(new BoxGeometry(w, h, d), material(color));
  mesh.position.set(x, y, z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  parent.add(mesh); return mesh;
}
function sphere(parent: Group | Scene, radius: number, color: number, x: number, y: number, z: number) {
  const mesh = new Mesh(new SphereGeometry(radius, 14, 10), material(color));
  mesh.position.set(x, y, z); mesh.castShadow = true; parent.add(mesh); return mesh;
}
function cylinder(parent: Group, top: number, bottom: number, height: number, color: number, x: number, y: number, z: number) {
  const mesh = new Mesh(new CylinderGeometry(top, bottom, height, 12), material(color));
  mesh.position.set(x, y, z); mesh.castShadow = true; parent.add(mesh); return mesh;
}
function ring(parent: Group, radius: number, color: number, y: number) {
  const mesh = new Mesh(new TorusGeometry(radius, 0.035, 6, 32), material(color, 0.25, 0.35, color));
  mesh.rotation.x = -Math.PI / 2; mesh.position.y = y; parent.add(mesh); return mesh;
}
function plinth(parent: Group, accent: number) {
  box(parent, 2.85, 0.18, 2.3, 0x343d4b, 0, 0.16, 0);
  box(parent, 2.62, 0.06, 2.08, 0x454e5b, 0, 0.29, 0);
  box(parent, 2.68, 0.025, 0.06, accent, 0, 0.27, 1.04);
}

function makeStation(id: DenStationId) {
  const group = new Group();
  const accent = id === "guestbook" || id === "contact" ? gold : blue;
  plinth(group, accent);
  if (id === "beacon") {
    cylinder(group, 0.30, 0.47, 1.55, 0x6c788a, 0, 1.15, 0);
    cylinder(group, 0.22, 0.22, 0.16, gold, 0, 1.99, 0);
    ring(group, 0.79, blue, 1.43);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      sphere(group, 0.10, i % 2 ? gold : paper, Math.cos(a) * 0.78, 1.43, Math.sin(a) * 0.78);
    }
  } else if (id === "workbench") {
    box(group, 2.05, 0.14, 0.85, 0x8e7968, 0, 0.95, -0.12);
    for (const x of [-0.8, 0.8]) box(group, 0.10, 0.62, 0.55, graphite, x, 0.64, -0.15);
    for (let i = 0; i < 5; i++) {
      const chip = box(group, 0.31, 0.32, 0.26, i === 2 ? gold : blue, -0.72 + i * 0.36, 1.27 + (i % 2) * 0.23, -0.12);
      chip.rotation.y = i * 0.15;
    }
    box(group, 1.5, 0.035, 0.035, paper, 0, 1.68, -0.46);
  } else if (id === "research") {
    cylinder(group, 0.74, 0.74, 0.14, 0x8892a3, 0, 0.49, 0);
    sphere(group, 0.44, blue, 0, 1.25, 0);
    const orbit = new Mesh(new TorusGeometry(0.77, 0.025, 6, 42), material(gold, 0.2, 0.45, gold));
    orbit.position.y = 1.27; orbit.rotation.set(0.5, 0.23, 0.3); group.add(orbit);
    for (let i = 0; i < 3; i++) sphere(group, 0.11, paper, Math.cos(i * 2.09) * 0.72, 1.2, Math.sin(i * 2.09) * 0.55);
  } else if (id === "builds") {
    box(group, 2.2, 1.35, 0.16, graphite, 0, 1.1, -0.64);
    for (let i = 0; i < 4; i++) {
      box(group, 0.39, 0.48, 0.26, [blue, gold, 0x9bd0bb, paper][i], -0.76 + 0.5 * i, 1.09, -0.42);
      box(group, 0.36, 0.045, 0.4, ink, -0.76 + 0.5 * i, 0.8, -0.26);
    }
  } else if (id === "guestbook") {
    box(group, 1.75, 0.10, 0.95, 0x8b7461, 0, 0.9, 0);
    for (const x of [-0.7, 0.7]) box(group, 0.09, 0.52, 0.6, graphite, x, 0.61, 0);
    for (let i = 0; i < 4; i++) {
      const note = box(group, 0.33, 0.025, 0.44, paper, -0.58 + i * 0.39, 1.02 + 0.02 * i, 0);
      note.rotation.y = i * 0.21;
    }
    sphere(group, 0.12, gold, 0.9, 1.13, -0.3);
  } else {
    for (const x of [-0.60, 0.60]) box(group, 0.20, 1.85, 0.27, 0x9da9b7, x, 1.24, -0.14);
    box(group, 1.45, 0.23, 0.34, gold, 0, 2.20, -0.14);
    box(group, 0.98, 1.5, 0.12, 0x1f4673, 0, 1.12, -0.19);
    box(group, 0.69, 0.045, 0.045, gold, 0, 1.2, -0.10);
  }
  // Invisible raycastable surface makes click targets generous even at overview scale.
  const hit = new Mesh(new BoxGeometry(3.1, 2.8, 2.65), new MeshStandardMaterial({
    transparent: true, opacity: 0, depthWrite: false, colorWrite: false,
  }));
  hit.position.y = 1.35;
  hit.userData.denStation = id;
  group.add(hit);
  return { group, hit };
}

export function createDenWorld(canvas: HTMLCanvasElement, callbacks: Callbacks): DenWorldController {
  const scene = new Scene();
  scene.background = new Color(0x0e0f11);
  const camera = new OrthographicCamera(-8, 8, 6, -6, 0.1, 90);
  camera.position.set(12, 14, 19);
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "low-power", alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.outputColorSpace = SRGBColorSpace;
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0.3, 0);
  controls.enableDamping = true; controls.dampingFactor = 0.075;
  controls.enablePan = true; controls.screenSpacePanning = true;
  controls.minPolarAngle = 0.36; controls.maxPolarAngle = 1.25;
  controls.minAzimuthAngle = -1.0; controls.maxAzimuthAngle = 1.1;
  controls.minZoom = 0.78; controls.maxZoom = 2.5;
  controls.update();

  scene.add(new AmbientLight(0xdce5ff, 1.35));
  const sun = new DirectionalLight(0xffe1ac, 3.0);
  sun.position.set(-4, 13, 8); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -13; sun.shadow.camera.right = 13;
  sun.shadow.camera.top = 13; sun.shadow.camera.bottom = -13;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  const glow = new PointLight(blue, 14, 16, 2);
  glow.position.set(0, 4.5, -2.5); scene.add(glow);

  const floor = new Mesh(new PlaneGeometry(200, 200), material(ink));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.36; floor.receiveShadow = true;
  scene.add(floor);
  const island = new Group(); scene.add(island);
  box(island, 13.4, 0.45, 10.75, 0x222a35, 0, -0.13, 0);
  box(island, 13.0, 0.04, 10.4, 0x303845, 0, 0.11, 0);
  for (let x = -6; x <= 6; x += 1) box(island, 0.012, 0.012, 10.1, 0x414a56, x, 0.14, 0);
  for (let z = -5; z <= 5; z += 1) box(island, 12.8, 0.012, 0.012, 0x414a56, 0, 0.14, z);
  // Raised central dais under the projected SVG leopard.
  cylinder(island, 1.24, 1.40, 0.23, 0x626a73, 0, 0.29, 0);
  ring(island, 1.07, gold, 0.42);
  const centerDot = sphere(island, 0.12, gold, 0, 0.47, 0);
  centerDot.visible = false;

  const markers = new Map<DenStationId, Vector3>();
  const hitObjects: Mesh[] = [];
  const floats: Group[] = [];
  for (const station of denStations) {
    const made = makeStation(station.id);
    made.group.position.set(station.x, 0, station.z);
    island.add(made.group);
    markers.set(station.id, new Vector3(station.x, 1.98, station.z));
    hitObjects.push(made.hit);
    floats.push(made.group);
  }
  const baseOffset = new Vector3(12, 13.7, 19);
  let desiredTarget = new Vector3(0, 0.3, 0);
  let desiredZoom = 1;
  let moving = false;
  const cancelFocus = () => { moving = false; };
  controls.addEventListener("start", cancelFocus);
  const raycaster = new Raycaster(), pointer = new Vector2();
  let down: { x: number; y: number } | null = null;
  const onDown = (event: PointerEvent) => { down = { x: event.clientX, y: event.clientY }; };
  const onUp = (event: PointerEvent) => {
    if (!down || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 7) { down = null; return; }
    down = null;
    const rect = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(hitObjects, false);
    const id = hits[0]?.object.userData.denStation as DenStationId | undefined;
    if (id) callbacks.onSelect(id);
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  const onCancel = () => { down = null; };
  canvas.addEventListener("pointercancel", onCancel);

  let height = 0, width = 0;
  function resize() {
    width = Math.max(canvas.clientWidth, 1); height = Math.max(canvas.clientHeight, 1);
    const aspect = width / height;
    const halfH = aspect < 1 ? 6.6 / Math.max(aspect, 0.53) : 6.7;
    camera.left = -halfH * aspect; camera.right = halfH * aspect;
    camera.top = halfH; camera.bottom = -halfH;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);

  const project = (position: Vector3): Projection => {
    const v = position.clone().project(camera);
    return { x: (v.x + 1) * width / 2, y: (1 - v.y) * height / 2,
      visible: v.z > -1 && v.z < 1 && v.x > -1.2 && v.x < 1.2 && v.y > -1.2 && v.y < 1.2,
      scale: camera.zoom };
  };

  let disposed = false, playing = !document.hidden, raf = 0, last = 0;
  const onVisibility = () => { playing = !document.hidden; if (playing) { last = 0; raf = requestAnimationFrame(tick); } else cancelAnimationFrame(raf); };
  const tick = (time: number) => {
    if (disposed || !playing) return;
    raf = requestAnimationFrame(tick);
    if (time - last < 1000 / 36) return;
    const dt = Math.min((time - last) / 1000 || 0.016, 0.05);
    last = time;
    if (moving) {
      const diff = desiredTarget.clone().sub(controls.target);
      controls.target.addScaledVector(diff, Math.min(1, dt * 4.5));
      camera.position.addScaledVector(diff, Math.min(1, dt * 4.5));
      camera.zoom = MathUtils.damp(camera.zoom, desiredZoom, 5, dt);
      camera.updateProjectionMatrix();
      if (diff.length() < 0.009 && Math.abs(camera.zoom - desiredZoom) < 0.01) moving = false;
    }
    // Prevent disorienting infinite panning away from the miniature workshop.
    const clamped = new Vector3(
      MathUtils.clamp(controls.target.x, -5.2, 5.2),
      MathUtils.clamp(controls.target.y, -0.3, 2.3),
      MathUtils.clamp(controls.target.z, -4.2, 4.2),
    );
    const correction = clamped.clone().sub(controls.target);
    controls.target.copy(clamped); camera.position.add(correction);
    controls.update();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      floats.forEach((g, i) => { g.position.y = Math.sin(time * 0.0008 + i * 0.9) * 0.018; });
    }
    renderer.render(scene, camera);
    const points: Projected = { leopard: project(new Vector3(0, 1.18, 0)) };
    for (const station of denStations) points[station.id] = project(markers.get(station.id)!);
    callbacks.onProject(points);
  };
  document.addEventListener("visibilitychange", onVisibility);
  raf = requestAnimationFrame(tick);

  return {
    focus(id) {
      const station = denStations.find((entry) => entry.id === id);
      if (!station) return;
      desiredTarget = new Vector3(station.x, 0.85, station.z);
      desiredZoom = Math.min(1.85, controls.maxZoom);
      moving = true;
    },
    reset() {
      desiredTarget = new Vector3(0, 0.3, 0);
      desiredZoom = 1; moving = true;
      // Restore the intended three-quarter angle as well.
      camera.position.copy(desiredTarget).add(baseOffset);
    },
    zoom(factor) {
      moving = false;
      camera.zoom = MathUtils.clamp(camera.zoom * factor, controls.minZoom, controls.maxZoom);
      camera.updateProjectionMatrix();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onCancel);
      controls.removeEventListener("start", cancelFocus);
      controls.dispose(); ro.disconnect();
      scene.traverse((object) => {
        if (object instanceof Mesh) {
          object.geometry.dispose();
          const mats = Array.isArray(object.material) ? object.material : [object.material];
          mats.forEach((mat) => mat.dispose());
        } else if (object instanceof LineSegments) {
          object.geometry.dispose();
          const mat = object.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
      renderer.dispose();
    },
  };
}
