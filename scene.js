/**
 * Bâtikub — Three.js scene
 * Shared transparent canvas: copper brick house (InstancedMesh) + dust particles.
 * Falls back to static image on mobile / reduced motion.
 */

import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const BRICK_COLS = 8;
const BRICK_ROWS = 7;
const BRICK_W = 0.42;
const BRICK_H = 0.2;
const BRICK_D = 0.22;
const MORTAR = 0.035;

export function createScene(canvas) {
  const reduced =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(max-width: 768px)").matches;

  const arch = document.querySelector(".hero-arch");

  if (reduced || !canvas) {
    arch?.classList.add("is-static");
    arch?.classList.remove("has-webgl");
    return {
      reduced: true,
      setScrollProgress() {},
      setPointer() {},
      resize() {},
      dispose() {},
    };
  }

  arch?.classList.add("has-webgl");
  arch?.classList.remove("is-static");

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.55, 5.2);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const key = new THREE.DirectionalLight(0xfff2e0, 1.35);
  key.position.set(3.2, 4.5, 2.8);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xe8741e, 0.45);
  fill.position.set(-2.5, 1.5, -1.5);
  scene.add(fill);

  const ambient = new THREE.AmbientLight(0xfff8ef, 0.35);
  scene.add(ambient);

  const copper = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#C45A18"),
    metalness: 0.18,
    roughness: 0.72,
    envMapIntensity: 0.45,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#E8741E"),
    metalness: 0.22,
    roughness: 0.55,
    envMapIntensity: 0.55,
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#2a2420"),
    metalness: 0.08,
    roughness: 0.88,
  });

  const root = new THREE.Group();
  scene.add(root);

  // Contact shadow disc
  const shadowGeo = new THREE.CircleGeometry(1.65, 48);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x1a1a17,
    transparent: true,
    opacity: 0.14,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.05;
  root.add(shadow);

  // Instanced brick wall / house body
  const count = BRICK_COLS * BRICK_ROWS;
  const brickGeo = new THREE.BoxGeometry(BRICK_W, BRICK_H, BRICK_D);
  const bricks = new THREE.InstancedMesh(brickGeo, copper, count);
  bricks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  root.add(bricks);

  const dummy = new THREE.Object3D();
  const targets = [];

  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      const i = row * BRICK_COLS + col;
      const offset = row % 2 === 0 ? 0 : (BRICK_W + MORTAR) * 0.5;
      const x = (col - (BRICK_COLS - 1) / 2) * (BRICK_W + MORTAR) + offset;
      const y = row * (BRICK_H + MORTAR) - 0.55;
      const z = 0;

      // Skip a rough door opening
      const isDoor = row < 3 && col >= 3 && col <= 4;
      const scattered = {
        x: x + (Math.random() - 0.5) * 2.8,
        y: y + 1.2 + Math.random() * 2.2,
        z: (Math.random() - 0.5) * 2.4,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        rz: Math.random() * Math.PI,
        visible: !isDoor,
      };

      targets.push({
        x,
        y,
        z,
        rx: 0,
        ry: 0,
        rz: 0,
        scattered,
        visible: !isDoor,
      });

      dummy.position.set(scattered.x, scattered.y, scattered.z);
      dummy.rotation.set(scattered.rx, scattered.ry, scattered.rz);
      dummy.scale.set(scattered.visible ? 1 : 0.001, scattered.visible ? 1 : 0.001, scattered.visible ? 1 : 0.001);
      dummy.updateMatrix();
      bricks.setMatrixAt(i, dummy.matrix);
    }
  }
  bricks.instanceMatrix.needsUpdate = true;

  // Roof — pitched tile look
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(2.05, 0.95, 4),
    accentMat
  );
  roof.position.set(0, 1.35, 0);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1, 1, 0.72);
  root.add(roof);

  // Chimney
  const chimney = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.55, 0.28),
    darkMat
  );
  chimney.position.set(0.55, 1.55, -0.15);
  root.add(chimney);

  // Door frame
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.85, 0.08),
    darkMat
  );
  door.position.set(0, -0.45, 0.14);
  root.add(door);

  // Windows
  const glassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#c9dde8"),
    metalness: 0.3,
    roughness: 0.15,
    envMapIntensity: 0.8,
  });
  [-0.85, 0.85].forEach((x) => {
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.48, 0.06),
      darkMat
    );
    frame.position.set(x, 0.35, 0.13);
    root.add(frame);
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.38, 0.04),
      glassMat
    );
    glass.position.set(x, 0.35, 0.16);
    root.add(glass);
  });

  // Foundation slab
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.14, 1.2),
    darkMat
  );
  slab.position.set(0, -0.88, 0);
  root.add(slab);

  // Ground plane under house
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(2.1, 48),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#C9BDA3"),
      metalness: 0,
      roughness: 1,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.95;
  root.add(ground);

  // Floating decorative brick (services deco proxy via group clone logic in main)
  const floatBrick = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.24, 0.28),
    accentMat
  );
  floatBrick.position.set(1.8, 1.1, 0.6);
  root.add(floatBrick);

  // Cement dust particles
  const dustCount = 80;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustSpeeds = [];
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 4;
    dustPositions[i * 3 + 1] = Math.random() * 3 - 0.5;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    dustSpeeds.push(0.15 + Math.random() * 0.35);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0xc9bda3,
      size: 0.035,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    })
  );
  root.add(dust);

  let scrollProgress = 0;
  let pointer = { x: 0, y: 0 };
  let running = true;
  let raf = 0;
  const clock = new THREE.Clock();

  function applyBuild(progress) {
    const p = THREE.MathUtils.clamp(progress, 0, 1);
    for (let i = 0; i < count; i++) {
      const t = targets[i];
      const rowDelay = Math.floor(i / BRICK_COLS) / BRICK_ROWS;
      const local = THREE.MathUtils.clamp((p - rowDelay * 0.55) / 0.45, 0, 1);
      const ease = local * local * (3 - 2 * local);
      const s = t.scattered;

      dummy.position.set(
        THREE.MathUtils.lerp(s.x, t.x, ease),
        THREE.MathUtils.lerp(s.y, t.y, ease),
        THREE.MathUtils.lerp(s.z, t.z, ease)
      );
      dummy.rotation.set(
        THREE.MathUtils.lerp(s.rx, t.rx, ease),
        THREE.MathUtils.lerp(s.ry, t.ry, ease),
        THREE.MathUtils.lerp(s.rz, t.rz, ease)
      );
      const scale = t.visible ? 1 : 0.001;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      bricks.setMatrixAt(i, dummy.matrix);
    }
    bricks.instanceMatrix.needsUpdate = true;

    roof.scale.setScalar(0.35 + p * 0.65);
    roof.material.opacity = 1;
    roof.position.y = THREE.MathUtils.lerp(2.2, 1.35, p);
  }

  function resize() {
    const parent = canvas.parentElement;
    const w = parent?.clientWidth || canvas.clientWidth || 1;
    const h = parent?.clientHeight || canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function tick() {
    if (!running) return;
    const t = clock.getElapsedTime();

    root.rotation.y = t * 0.12 + pointer.x * 0.35;
    root.rotation.x = pointer.y * 0.12;
    root.position.y = Math.sin(t * 0.7) * 0.04;

    floatBrick.rotation.x = t * 0.4;
    floatBrick.rotation.y = t * 0.55;
    floatBrick.position.y = 1.1 + Math.sin(t * 1.2) * 0.12;

    camera.position.z = THREE.MathUtils.lerp(5.2, 3.6, scrollProgress);
    camera.position.y = THREE.MathUtils.lerp(0.55, 0.85, scrollProgress);
    camera.lookAt(0, 0.2, 0);

    applyBuild(scrollProgress * 1.15);

    const pos = dust.geometry.attributes.position.array;
    for (let i = 0; i < dustCount; i++) {
      pos[i * 3 + 1] += dustSpeeds[i] * 0.004;
      if (pos[i * 3 + 1] > 2.5) pos[i * 3 + 1] = -1;
    }
    dust.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }

  resize();
  applyBuild(0);
  tick();

  // Lazy-load optional GLB to replace procedural house
  import("three/addons/loaders/GLTFLoader.js")
    .then(({ GLTFLoader }) => {
      const loader = new GLTFLoader();
      loader.load(
        "/assets/hero.glb",
        (gltf) => {
          bricks.visible = false;
          roof.visible = false;
          slab.visible = false;
          const model = gltf.scene;
          model.traverse((child) => {
            if (child.isMesh) {
              child.material = copper.clone();
              child.castShadow = false;
            }
          });
          model.scale.setScalar(1.4);
          model.position.y = -0.9;
          root.add(model);
        },
        undefined,
        () => {
          /* keep procedural bricks if GLB missing */
        }
      );
    })
    .catch(() => {});

  return {
    reduced: false,
    setScrollProgress(p) {
      scrollProgress = THREE.MathUtils.clamp(p, 0, 1);
    },
    setPointer(nx, ny) {
      pointer.x = nx;
      pointer.y = ny;
    },
    resize,
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      renderer.dispose();
      brickGeo.dispose();
      copper.dispose();
      accentMat.dispose();
      darkMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      dustGeo.dispose();
      dust.material.dispose();
      pmrem.dispose();
    },
  };
}

/** Mini floating brick for services section (DOM-driven CSS fallback if no WebGL) */
export function createMiniBrickCanvas(container) {
  if (!container) return null;
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(max-width: 768px)").matches
  ) {
    container.innerHTML =
      '<div style="width:72px;height:36px;border-radius:8px;background:#E8741E;box-shadow:0 12px 30px rgba(232,116,30,.35);transform:rotate(-12deg)"></div>';
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 160;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 10);
  camera.position.z = 2.4;

  const light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(2, 3, 2);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xfff0e0, 0.5));

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.5, 0.55),
    new THREE.MeshStandardMaterial({
      color: "#E8741E",
      metalness: 0.85,
      roughness: 0.25,
    })
  );
  scene.add(mesh);

  let raf = 0;
  let alive = true;
  const clock = new THREE.Clock();

  function tick() {
    if (!alive) return;
    const t = clock.getElapsedTime();
    mesh.rotation.x = t * 0.5;
    mesh.rotation.y = t * 0.7;
    mesh.position.y = Math.sin(t) * 0.12;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    renderer.dispose();
  };
}
