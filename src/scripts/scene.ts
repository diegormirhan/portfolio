/*
 * Cena de fundo persistente (Three.js), montada uma vez e mantida entre páginas.
 *
 * - Nuvem de partículas com 4 formas: galáxia espiral, esfera, rede neural e onda.
 *   Cada forma tem um peso (0-1) que anda em velocidade constante na direção da forma
 *   pedida. A posição de cada partícula é a média ponderada das 4 formas, com um atraso
 *   por partícula e uma dispersão quando nenhuma forma domina. Como é tudo contínuo,
 *   rolar para cima e para baixo no meio de uma troca só inverte o caminho, sem saltos.
 * - Zoom: quanto mais indefinida a forma, mais a câmera mergulha na nuvem; rolar rápido
 *   também aproxima um pouco.
 * - Cursor: fumaça fluida que segue o mouse (ver fluid.ts).
 * - Bolhas: esferas translúcidas subindo, com desfoque de profundidade.
 *
 * API por eventos em window, para não acoplar a cena ao resto do JS:
 *   scene:shape  { shape: 0-3, x?, y?, scale?, dim? }  morfa, reposiciona e ajusta o brilho
 *   scene:ready                                         disparado após o primeiro frame
 */
import * as THREE from "three";

import { createFluid } from "./fluid";
import { stepWeights } from "./morph";

export type ShapeDetail = { shape: number; x?: number; y?: number; scale?: number; dim?: number };

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isSmall = matchMedia("(max-width: 767px)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const COUNT = isSmall ? 3200 : 7000;

const COBALT = new THREE.Color("#3a6ee8");
const CERULEAN = new THREE.Color("#46b6e6");
const ICE = new THREE.Color("#e6efff");

/* ---------- Formas (todas com volume, para os círculos ficarem espalhados) ---------- */

const rand = (a = -1, b = 1) => a + Math.random() * (b - a);
/** Deslocamento aleatório que se concentra perto de zero */
const jitter = (amount: number) => rand() * Math.random() * amount;

function galaxy(count: number): Float32Array {
  // Espiral com 3 braços no plano XZ; a inclinação e o giro ficam no shader.
  const out = new Float32Array(count * 3);
  const arms = 3;
  for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 1.35) * 2.5;
    const arm = ((i % arms) / arms) * Math.PI * 2;
    const angle = arm + r * 1.35;
    const spread = 0.12 + r * 0.22;
    out[i * 3] = Math.cos(angle) * r + jitter(spread * 2.2);
    out[i * 3 + 1] = jitter(0.35 * (1.2 - r / 2.5));
    out[i * 3 + 2] = Math.sin(angle) * r + jitter(spread * 2.2);
  }
  return out;
}

function sphere(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    // Casca espessa + alguns pontos soltos por dentro e por fora
    const radius = Math.random() < 0.18 ? rand(0.4, 2.4) : 1.75 + jitter(0.3);
    out[i * 3] = Math.cos(theta) * r * radius;
    out[i * 3 + 1] = y * radius;
    out[i * 3 + 2] = Math.sin(theta) * r * radius;
  }
  return out;
}

function network(count: number): Float32Array {
  // Camadas de neurônios; partículas agrupadas nos nós e espalhadas ao longo das conexões.
  const layers = [4, 6, 6, 3];
  const nodes: THREE.Vector3[][] = layers.map((n, li) =>
    Array.from({ length: n }, (_, ni) => {
      const x = (li / (layers.length - 1) - 0.5) * 4.2;
      const y = (n === 1 ? 0 : ni / (n - 1) - 0.5) * (n * 0.55);
      return new THREE.Vector3(x, y, rand(-0.5, 0.5));
    }),
  );
  const flat = nodes.flat();
  const out = new Float32Array(count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    if (Math.random() < 0.4) {
      const node = flat[(Math.random() * flat.length) | 0]!;
      v.set(rand(), rand(), rand()).normalize().multiplyScalar(Math.abs(jitter(0.34))).add(node);
    } else {
      const li = (Math.random() * (layers.length - 1)) | 0;
      const a = nodes[li]![(Math.random() * nodes[li]!.length) | 0]!;
      const b = nodes[li + 1]![(Math.random() * nodes[li + 1]!.length) | 0]!;
      v.lerpVectors(a, b, Math.random());
      v.x += jitter(0.07);
      v.y += jitter(0.07);
      v.z += jitter(0.07);
    }
    v.toArray(out, i * 3);
  }
  return out;
}

function wave(count: number): Float32Array {
  // Pontos soltos sobre um plano (não uma grade), ondulados no shader
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    out[i * 3] = rand(-4.2, 4.2);
    out[i * 3 + 1] = -0.9 + jitter(0.12);
    out[i * 3 + 2] = rand(-2.6, 2.6);
  }
  return out;
}

/* ---------- Shaders ---------- */

const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform vec4 uWeights; // galáxia, esfera, rede, onda
  uniform float uSize;
  uniform float uPixelRatio;
  attribute vec3 aGalaxy;
  attribute vec3 aSphere;
  attribute vec3 aNet;
  attribute vec3 aWave;
  attribute vec3 aScatter;
  attribute float aRand;
  varying float vRand;
  varying float vDepth;
  varying float vTravel;

  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

  vec3 galaxyAt(vec3 p) {
    p.xz = rot(uTime * 0.06) * p.xz;          // gira devagar
    p.yz = rot(-1.05) * p.yz;                 // inclina o disco em direção à câmera
    return p;
  }

  vec3 waveAt(vec3 p) {
    p.y += sin(p.x * 1.2 + uTime * 0.8) * 0.3 + sin(p.z * 1.9 + uTime * 1.1) * 0.18;
    return p;
  }

  void main() {
    // Atraso por partícula: umas chegam antes na nova forma, outras depois
    vec4 w = smoothstep(vec4(aRand * 0.35), vec4(0.65 + aRand * 0.35), uWeights);
    float total = w.x + w.y + w.z + w.w;
    w = total > 0.001 ? w / total : uWeights / max(dot(uWeights, vec4(1.0)), 0.001);
    vec3 p = galaxyAt(aGalaxy) * w.x + aSphere * w.y + aNet * w.z + waveAt(aWave) * w.w;

    // Nenhuma forma dominante = partícula em trânsito: dispersa e brilha um pouco
    float confidence = max(max(w.x, w.y), max(w.z, w.w));
    float travel = sin(clamp((1.0 - confidence) * 2.0, 0.0, 1.0) * 1.5708);
    p += aScatter * travel * 1.8;

    // Respiração contínua
    p += 0.05 * vec3(
      sin(uTime * 0.6 + aRand * 40.0),
      cos(uTime * 0.5 + aRand * 31.0),
      sin(uTime * 0.4 + aRand * 17.0)
    );

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.45 + pow(aRand, 2.0) * 1.6) * uPixelRatio / -mv.z;
    vRand = aRand;
    vDepth = -mv.z;
    vTravel = travel;
  }
`;

const particleFragment = /* glsl */ `
  uniform vec3 uCobalt;
  uniform vec3 uCerulean;
  uniform vec3 uIce;
  uniform float uAlpha;
  varying float vRand;
  varying float vDepth;
  varying float vTravel;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    // Círculo com borda definida e um núcleo mais claro
    float disc = smoothstep(0.5, 0.4, d);
    float core = smoothstep(0.3, 0.0, d);
    vec3 color = vRand < 0.5 ? uCobalt : (vRand < 0.88 ? uCerulean : uIce);
    color = mix(color, uIce, core * 0.35 + vTravel * 0.25);
    // Muito perto da câmera o círculo fica mais transparente (mergulho sem ofuscar)
    float fog = smoothstep(20.0, 9.0, vDepth) * smoothstep(1.0, 3.5, vDepth);
    gl_FragColor = vec4(color, disc * (0.5 + core * 0.4) * fog * uAlpha);
  }
`;

const bubbleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aSpeed;
  varying float vBlur;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    // Sobem devagar e dão a volta; as mais próximas se movem mais com o scroll (paralaxe)
    float depth = (p.z + 6.0) / 10.0;
    p.y = mod(p.y + uTime * aSpeed + uScroll * (0.4 + depth * 1.6) + 6.0, 12.0) - 6.0;
    p.x += sin(uTime * 0.3 + position.y) * 0.35;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * 260.0 / -mv.z;
    // Plano de foco a ~7.5 unidades da câmera: fora dele, a bolha borra
    vBlur = clamp(abs(-mv.z - 7.5) / 5.0, 0.0, 1.0);
    vAlpha = smoothstep(6.0, 4.5, abs(p.y));
  }
`;

const bubbleFragment = /* glsl */ `
  uniform vec3 uCobalt;
  uniform vec3 uCerulean;
  uniform vec3 uIce;
  varying float vBlur;
  varying float vAlpha;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float soft = mix(0.015, 0.2, vBlur);
    float body = smoothstep(0.5, 0.5 - soft, d);
    float rim = body * smoothstep(0.28 - soft, 0.48, d);
    float spec = smoothstep(0.16 + soft, 0.0, length(uv - vec2(-0.16, -0.17)));
    vec3 color = mix(uCobalt, uCerulean, smoothstep(-0.5, 0.5, uv.y)) * (body * 0.35 + rim * 1.1) + uIce * spec * 0.8;
    float alpha = (body * 0.12 + rim * 0.5 + spec * 0.55) * vAlpha * mix(1.0, 0.45, vBlur);
    gl_FragColor = vec4(color, alpha);
  }
`;

/* ---------- Montagem ---------- */

function init(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  const dpr = Math.min(devicePixelRatio, isSmall ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  let baseZ = 9;

  const shared = {
    uTime: { value: 0 },
    uPixelRatio: { value: dpr },
    uCobalt: { value: COBALT },
    uCerulean: { value: CERULEAN },
    uIce: { value: ICE },
  };

  // Partículas
  const geometry = new THREE.BufferGeometry();
  const g = galaxy(COUNT);
  geometry.setAttribute("position", new THREE.BufferAttribute(g, 3));
  geometry.setAttribute("aGalaxy", new THREE.BufferAttribute(g, 3));
  geometry.setAttribute("aSphere", new THREE.BufferAttribute(sphere(COUNT), 3));
  geometry.setAttribute("aNet", new THREE.BufferAttribute(network(COUNT), 3));
  geometry.setAttribute("aWave", new THREE.BufferAttribute(wave(COUNT), 3));
  const scatter = new Float32Array(COUNT * 3);
  const randoms = new Float32Array(COUNT);
  const v = new THREE.Vector3();
  for (let i = 0; i < COUNT; i++) {
    v.set(rand(), rand(), rand()).normalize().multiplyScalar(rand(0.3, 1)).toArray(scatter, i * 3);
    randoms[i] = Math.random();
  }
  geometry.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
  geometry.setAttribute("aRand", new THREE.BufferAttribute(randoms, 1));

  const particleUniforms = {
    ...shared,
    uWeights: { value: new THREE.Vector4(1, 0, 0, 0) },
    uSize: { value: isSmall ? 52 : 64 },
    uAlpha: { value: 1 },
  };
  const cloud = new THREE.Points(
    geometry,
    new THREE.ShaderMaterial({
      uniforms: particleUniforms,
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  cloud.frustumCulled = false;
  scene.add(cloud);

  // Bolhas
  const BUBBLES = isSmall ? 16 : 30;
  const bubbleGeo = new THREE.BufferGeometry();
  const bPos = new Float32Array(BUBBLES * 3);
  const bSize = new Float32Array(BUBBLES);
  const bSpeed = new Float32Array(BUBBLES);
  for (let i = 0; i < BUBBLES; i++) {
    bPos.set([rand(-7, 7), rand(-6, 6), rand(-6, 4)], i * 3);
    bSize[i] = rand(0.35, 1.6) * (Math.random() < 0.15 ? 2.2 : 1);
    bSpeed[i] = rand(0.05, 0.22);
  }
  bubbleGeo.setAttribute("position", new THREE.BufferAttribute(bPos, 3));
  bubbleGeo.setAttribute("aSize", new THREE.BufferAttribute(bSize, 1));
  bubbleGeo.setAttribute("aSpeed", new THREE.BufferAttribute(bSpeed, 1));
  const bubbleUniforms = { ...shared, uScroll: { value: 0 } };
  const bubbles = new THREE.Points(
    bubbleGeo,
    new THREE.ShaderMaterial({
      uniforms: bubbleUniforms,
      vertexShader: bubbleVertex,
      fragmentShader: bubbleFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  bubbles.frustumCulled = false;
  scene.add(bubbles);

  // Fumaça do cursor: só com mouse de verdade e com movimento liberado
  const fluid = !reduceMotion && finePointer ? createFluid(renderer, { simRes: 128, dyeRes: 512 }) : null;
  const pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, ready: false };
  // Paleta da fumaça: o tom corre entre os azuis com o tempo e clareia com a velocidade
  const smokePalette = ["#1f45e0", "#2f7bff", "#16b4ff", "#3a5cff"].map((hex) => new THREE.Color(hex));
  const smokeIce = new THREE.Color("#c8ecff");
  const smokeColor = new THREE.Color();
  const splatColor = new THREE.Color();
  const parallax = new THREE.Vector2();

  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch") return;
      pointer.x = e.clientX / innerWidth;
      pointer.y = 1 - e.clientY / innerHeight;
      if (!pointer.ready) {
        // Primeira entrada do cursor: sem um jato de fumaça atravessando a tela
        pointer.px = pointer.x;
        pointer.py = pointer.y;
        pointer.ready = true;
      }
    },
    { passive: true },
  );

  /* Formas guiadas pelas páginas */
  const target = { shape: 0, x: 0, y: 0, scale: 1, dim: 1 };
  const state = { x: 0, y: 0, scale: 1, dim: 1 };
  const weights = [1, 0, 0, 0];
  // Só em desenvolvimento: permite inspecionar a transição pelo console
  if (import.meta.env.DEV) (window as unknown as { __sceneWeights: number[] }).__sceneWeights = weights;
  const MORPH_SPEED = 0.55; // fração de forma por segundo: uma troca completa leva ~1,8 s

  function applyShape(detail: ShapeDetail) {
    target.shape = THREE.MathUtils.clamp(Math.round(detail.shape), 0, 3);
    target.x = detail.x ?? 0;
    target.y = detail.y ?? 0;
    target.scale = detail.scale ?? 1;
    target.dim = detail.dim ?? 1;
    if (reduceMotion) {
      weights.fill(0);
      weights[target.shape] = 1;
      Object.assign(state, target);
    }
  }
  addEventListener("scene:shape", (e) => applyShape((e as CustomEvent<ShapeDetail>).detail));
  // Pedido feito antes deste módulo carregar: começa já na forma e posição certas
  const pending = (window as unknown as { __sceneShape?: ShapeDetail }).__sceneShape;
  if (pending) {
    applyShape(pending);
    weights.fill(0);
    weights[target.shape] = 1;
    Object.assign(state, target);
  }

  function resize() {
    const w = innerWidth;
    const h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Em telas estreitas, afasta a câmera para a nuvem caber
    baseZ = w / h < 0.8 ? 13 : 9;
    camera.updateProjectionMatrix();
    fluid?.resize();
  }
  resize();
  addEventListener("resize", resize);

  const timer = new THREE.Timer();
  let running = true;
  let ready = false;
  let lastScroll = scrollY;
  let speedZoom = 0;

  function frame(now: number) {
    if (!running) return;
    timer.update(now);
    const dt = Math.min(timer.getDelta(), 0.05);
    const t = timer.getElapsed();
    const ease = 1 - Math.pow(0.001, dt); // aproximação exponencial independente de FPS

    if (!reduceMotion) {
      shared.uTime.value = t;
      // Pesos andam em velocidade constante: sem saltos mesmo com pedidos em sequência
      stepWeights(weights, target.shape, dt, MORPH_SPEED);
      // Posição e brilho acompanham o ritmo da forma (mais lentos que antes)
      state.x += (target.x - state.x) * ease * 0.3;
      state.y += (target.y - state.y) * ease * 0.3;
      state.scale += (target.scale - state.scale) * ease * 0.3;
      state.dim += (target.dim - state.dim) * ease * 0.4;
    }
    const sum = weights.reduce((a, b) => a + b, 0) || 1;
    particleUniforms.uWeights.value.set(weights[0]! / sum, weights[1]! / sum, weights[2]! / sum, weights[3]! / sum);
    particleUniforms.uAlpha.value = state.dim;
    cloud.position.set(state.x, state.y, 0);
    cloud.scale.setScalar(state.scale);

    // Zoom: a câmera mergulha na nuvem no meio da transição e acompanha a velocidade do scroll
    const scroll = scrollY / innerHeight;
    const scrollSpeed = Math.abs(scrollY - lastScroll) / Math.max(dt, 1e-3) / innerHeight;
    lastScroll = scrollY;
    speedZoom += (Math.min(scrollSpeed * 0.25, 1) - speedZoom) * ease * 0.15;
    // Mergulho proporcional à indefinição da forma: máximo quando duas formas empatam
    const confidence = Math.max(...weights) / sum;
    const dive = THREE.MathUtils.smoothstep(1 - confidence, 0, 0.5);
    if (!reduceMotion) {
      camera.position.z = baseZ - dive * 3.4 - speedZoom * 0.8;
      camera.fov = 35 + dive * 6;
      camera.updateProjectionMatrix();
    } else {
      camera.position.z = baseZ;
    }
    bubbleUniforms.uScroll.value = scroll * 0.9;

    // Paralaxe leve com o cursor
    parallax.x += ((pointer.x - 0.5) * 2 - parallax.x) * ease * 0.3;
    parallax.y += ((pointer.y - 0.5) * 2 - parallax.y) * ease * 0.3;
    cloud.rotation.y = reduceMotion ? 0 : Math.sin(t * 0.15) * 0.2 + parallax.x * 0.12;
    // A onda fica inclinada para ser vista em perspectiva; as outras formas, de frente
    cloud.rotation.x = reduceMotion ? 0 : -parallax.y * 0.08 - 0.35 * (weights[3]! / sum);

    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(scene, camera);

    if (fluid) {
      // O ponto de emissão persegue o cursor com atraso (movimento macio), e o trajeto do
      // frame é preenchido com vários splats pequenos: um rastro contínuo, sem "bolhas".
      if (pointer.ready) {
        const nx = pointer.px + (pointer.x - pointer.px) * Math.min(1, ease * 1.6);
        const ny = pointer.py + (pointer.y - pointer.py) * Math.min(1, ease * 1.6);
        const dx = nx - pointer.px;
        const dy = ny - pointer.py;
        const dist = Math.hypot(dx, dy);
        if (dist > 1e-4) {
          const cycle = (t * 0.25) % smokePalette.length;
          const a = smokePalette[Math.floor(cycle)]!;
          const b = smokePalette[(Math.floor(cycle) + 1) % smokePalette.length]!;
          const speed = dist / Math.max(dt, 1e-3); // telas por segundo
          smokeColor.lerpColors(a, b, cycle % 1).lerp(smokeIce, THREE.MathUtils.smoothstep(speed, 0.6, 3.5) * 0.7);
          const steps = Math.min(10, Math.ceil(dist / 0.008));
          const amount = (Math.min(dist * 14, 1) * 1.6) / steps;
          splatColor.copy(smokeColor).multiplyScalar(amount);
          for (let i = 1; i <= steps; i++) {
            const k = i / steps;
            fluid.addSplat(pointer.px + dx * k, pointer.py + dy * k, dx / steps, dy / steps, splatColor);
          }
        }
        pointer.px = nx;
        pointer.py = ny;
      }
      fluid.step(Math.min(dt, 1 / 60));
      fluid.render();
    }

    if (!ready) {
      ready = true;
      (window as unknown as { __sceneReady: boolean }).__sceneReady = true;
      dispatchEvent(new Event("scene:ready"));
    }
    requestAnimationFrame(frame);
  }

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) {
      timer.reset(); // descarta o tempo parado na aba oculta
      requestAnimationFrame(frame);
    }
  });

  requestAnimationFrame(frame);
}

const canvas = document.querySelector<HTMLCanvasElement>("#scene");
if (canvas) {
  try {
    init(canvas);
  } catch (error) {
    // Sem WebGL: o CSS mostra um gradiente estático no lugar
    console.warn("[scene] WebGL indisponível", error);
    document.documentElement.classList.add("no-webgl");
    (window as unknown as { __sceneReady: boolean }).__sceneReady = true;
    dispatchEvent(new Event("scene:ready"));
  }
}
