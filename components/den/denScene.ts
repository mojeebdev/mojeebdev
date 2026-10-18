/**
 * Three.js environment for Enter the Den: a shadow-catching floor, a soft directional light, drifting dust and a
 * gently parallaxing camera. The leopard itself is SVG; an invisible proxy body here casts its real, soft shadow.
 * Loaded on demand by DenIntro, never on other routes.
 */
import {
  BufferAttribute, BufferGeometry, Color, DirectionalLight, Group, HemisphereLight, Mesh, MeshBasicMaterial, PerspectiveCamera,
  Plane, PlaneGeometry, Points, PointsMaterial, Raycaster, Scene, ShadowMaterial, SphereGeometry, Vector2, Vector3, PCFSoftShadowMap, WebGLRenderer,
} from "three";

export function createDenScene(canvas: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  const base = new Vector3(0, 1.5, 8);
  camera.position.copy(base);
  const lookAt = new Vector3(0, 0.6, 0);

  const ink = new Color(getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#16171a");

  // Floor that only shows shadows.
  const floor = new Mesh(new PlaneGeometry(40, 40), new ShadowMaterial({ opacity: 0.2, color: ink }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  scene.add(new HemisphereLight(0xffffff, 0xdddddd, 0.6));
  const sun = new DirectionalLight(0xffffff, 1.4);
  sun.position.set(-2.5, 6, 3.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(512, 512);
  sun.shadow.radius = 4;
  const sc = sun.shadow.camera;
  sc.left = -12; sc.right = 12; sc.top = 12; sc.bottom = -12; sc.near = 0.5; sc.far = 20;
  scene.add(sun);
  scene.add(sun.target);

  // Invisible proxy shaped like the seated leopard: it casts the shadow under the SVG.
  const proxy = new Group();
  const hidden = new MeshBasicMaterial({ colorWrite: false, depthWrite: false });
  const body = new Mesh(new SphereGeometry(0.5, 24, 16), hidden); body.scale.set(1, 1.1, 0.8); body.position.y = 0.55;
  const head = new Mesh(new SphereGeometry(0.46, 24, 16), hidden); head.position.y = 1.35; head.scale.set(1.15, 0.95, 0.8);
  const tail = new Mesh(new SphereGeometry(0.18, 12, 8), hidden); tail.position.set(-0.7, 0.25, 0); tail.scale.set(1.6, 0.8, 0.8);
  [body, head, tail].forEach((m) => { m.castShadow = true; proxy.add(m); });
  scene.add(proxy);

  // Dust motes for depth.
  const COUNT = 180;
  const pos = new Float32Array(COUNT * 3);
  const speed = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 14;
    pos[i * 3 + 1] = Math.random() * 6;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
    speed[i] = 0.05 + Math.random() * 0.12;
  }
  const dustGeo = new BufferGeometry();
  dustGeo.setAttribute("position", new BufferAttribute(pos, 3));
  const dustMat = new PointsMaterial({ color: ink, size: 0.035, transparent: true, opacity: 0.28, depthWrite: false });
  const dust = new Points(dustGeo, dustMat);
  scene.add(dust);

  // Map a screen point onto the floor plane so the proxy sits exactly under the SVG leopard.
  const ray = new Raycaster();
  const ground = new Plane(new Vector3(0, 1, 0), 0);
  const hit = new Vector3();
  const toGround = (px: number, py: number, w: number, h: number) => {
    ray.setFromCamera(new Vector2((px / w) * 2 - 1, -(py / h) * 2 + 1), camera);
    return ray.ray.intersectPlane(ground, hit) ? hit.clone() : null;
  };

  let catOffset = 0, catOffsetTarget = 0, anchorX = 0, catWorldWidth = 1;
  const look = new Vector2(0, 0), lookTarget = new Vector2(0, 0);
  let dolly = 0, dollyTarget = 0;

  const layout = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    camera.position.copy(base);
    camera.lookAt(lookAt);
    const stage = canvas.parentElement?.querySelector(".den__stage") as HTMLElement | null;
    if (!stage) return;
    const r = stage.getBoundingClientRect(), c = canvas.getBoundingClientRect();
    const feetY = r.bottom - c.top - r.height * 0.05;
    const left = toGround(r.left - c.left + r.width * 0.25, feetY, w, h);
    const right = toGround(r.right - c.left - r.width * 0.25, feetY, w, h);
    const mid = toGround(r.left - c.left + r.width / 2, feetY, w, h);
    if (left && right && mid) {
      catWorldWidth = right.distanceTo(left) * 2;
      anchorX = mid.x;
      proxy.position.set(mid.x, 0, mid.z);
      proxy.scale.setScalar(catWorldWidth / 1.6);
      sun.target.position.copy(proxy.position);
      sun.position.set(mid.x - 2.5, 6, mid.z + 3.5);
    }
  };
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(canvas);

  let raf = 0, last = performance.now(), running = true;
  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    look.lerp(lookTarget, 0.06);
    catOffset += (catOffsetTarget - catOffset) * 0.12;
    dolly += (dollyTarget - dolly) * 0.08;
    camera.position.set(base.x + look.x * 0.9, base.y - look.y * 0.35, base.z - dolly * 3.2);
    camera.lookAt(lookAt);
    proxy.position.x = anchorX + catOffset * catWorldWidth;
    const p = dustGeo.attributes.position as BufferAttribute;
    for (let i = 0; i < COUNT; i++) {
      let y = p.getY(i) + speed[i] * dt;
      if (y > 6) y = 0;
      p.setY(i, y);
      p.setX(i, p.getX(i) + Math.sin(now / 2000 + i) * 0.0008);
    }
    p.needsUpdate = true;
    dustMat.opacity = 0.28 * (1 - dolly);
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  const onVis = () => {
    if (document.hidden) { running = false; cancelAnimationFrame(raf); }
    else if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); }
  };
  document.addEventListener("visibilitychange", onVis);

  return {
    setLook(x: number, y: number) { lookTarget.set(x, y); },
    /** offset in leopard widths (DOM dodge) */
    setCatX(offset: number) { catOffsetTarget = offset; },
    reveal() { dollyTarget = 1; },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      scene.traverse((o) => { const m = o as Mesh; m.geometry?.dispose?.(); });
      dustMat.dispose(); hidden.dispose(); (floor.material as ShadowMaterial).dispose();
      renderer.dispose();
    },
  };
}
