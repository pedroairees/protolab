import * as THREE from "three";

export function createSculpture(container, reducedMotion) {
  const canvas = document.createElement("canvas");
  // Probe support before constructing Three.js to avoid errors in older browsers.
  const context = canvas.getContext("webgl2", { alpha: true, antialias: true });
  if (!context) return;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    context,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30);
  camera.position.set(0, 2.1, 7.8);
  camera.lookAt(0, -0.05, 0);
  scene.add(new THREE.AmbientLight(0xcde9ff, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 4);
  key.position.set(-3, 5, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(512, 512);
  key.shadow.camera.left = -3;
  key.shadow.camera.right = 3;
  key.shadow.camera.top = 3;
  key.shadow.camera.bottom = -3;
  key.shadow.normalBias = 0.025;
  key.shadow.bias = -0.0003;
  key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x69d9ff, 3);
  rim.position.set(2, 3, -3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x2379ff, 1);
  fill.position.set(4, 0, 2);
  scene.add(fill);

  const sculpture = new THREE.Group();
  sculpture.rotation.z = -0.12;
  sculpture.rotation.x = 0.08;
  scene.add(sculpture);
  const segments = 192;
  const rows = 80;
  const vertices = [];
  const indices = [];
  const radiusAt = (t, angle) =>
    0.73 +
    0.15 * Math.cos(t * Math.PI * 2 - 0.6) +
    0.09 * Math.sin(t * Math.PI) +
    0.047 * Math.cos(angle * 48 + t * 4.7);
  // Outer wall, rounded rim, inner wall and base form an open, ribbed vase.
  for (let row = 0; row <= rows * 2 + 1; row++) {
    const inner = row > rows;
    const t = inner ? 1 - (row - rows - 1) / rows : row / rows;
    for (let col = 0; col <= segments; col++) {
      const angle = (col / segments) * Math.PI * 2;
      const radius = radiusAt(t, angle) - (inner ? 0.055 : 0);
      vertices.push(
        Math.cos(angle) * radius,
        -1.55 + t * 3.1 + (inner ? 0.025 * (1 - t) : 0),
        Math.sin(angle) * radius,
      );
    }
  }
  for (let row = 0; row < rows * 2 + 1; row++) {
    for (let col = 0; col < segments; col++) {
      const a = row * (segments + 1) + col;
      const b = a + segments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    color: 0x0081ec,
    roughness: 0.34,
    metalness: 0.12,
    side: THREE.DoubleSide,
  });
  const vase = new THREE.Mesh(geometry, material);
  vase.castShadow = true;
  vase.receiveShadow = true;
  sculpture.add(vase);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.79, 0.79, 0.045, 100),
    material,
  );
  base.position.y = -1.53;
  sculpture.add(base);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.ShadowMaterial({ opacity: 0.14 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.74;
  floor.receiveShadow = true;
  scene.add(floor);

  let frame = 0;
  let visible = true;
  let targetRotation = 0;
  let rotation = 0;
  const render = () => renderer.render(scene, camera);
  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  let lastFrame = 0;
  function animate(time) {
    frame = 0;
    if (!visible || document.hidden || reducedMotion.matches) return;
    if (time - lastFrame < 1000 / 30) {
      frame = requestAnimationFrame(animate);
      return;
    }
    lastFrame = time;
    rotation += (targetRotation - rotation) * 0.025;
    sculpture.rotation.y = time * 0.00007 + rotation;
    sculpture.position.y = Math.sin(time * 0.00065) * 0.055;
    render();
    frame = requestAnimationFrame(animate);
  }
  function updateAnimation() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (reducedMotion.matches) {
      sculpture.position.y = 0;
      render();
    } else if (visible && !document.hidden)
      frame = requestAnimationFrame(animate);
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateAnimation();
  });
  observer.observe(container);
  document.addEventListener("visibilitychange", updateAnimation);
  reducedMotion.addEventListener("change", updateAnimation);
  container.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || reducedMotion.matches) return;
    const bounds = container.getBoundingClientRect();
    targetRotation =
      ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.45;
  });
  container.addEventListener("pointerleave", () => {
    targetRotation = 0;
  });
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    visible = false;
    updateAnimation();
    container.classList.remove("has-webgl");
    canvas.hidden = true;
  });
  resize();
  container.classList.add("has-webgl");
  updateAnimation();
}
