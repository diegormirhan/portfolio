/*
 * Cena de fundo persistente (Three.js), montada uma vez e mantida entre páginas.
 *
 * Objetos 3D sólidos de vidro, espalhados num espaço 3D; a câmera viaja de um para o outro
 * conforme a seção visível (transição contínua e reversível):
 *   0  </>           símbolo de código extrudado em vidro espesso
 *   1  grafo         poliedros facetados ligados aos vizinhos por tubos luminosos
 *   2  rede neural   5 camadas de neurônios cobalto com brilho interno que respira e dispara com o pulso
 *   3  camadas       pilha de placas de vidro (arquitetura), com feixes de luz entre elas
 *   4  editor        linhas de código como barras de vidro, com uma linha ativa "digitando"
 * Nos tubos correm pulsos de luz (camada a camada na rede neural). Poeira de luz sobe ao
 * fundo, e uma fumaça fluida segue o cursor (fluid.ts, em canvas próprio).
 *
 * Qualidade automática: vidro com refração real (transmission) no desktop; no celular ou se o
 * FPS medido cair, vidro simplificado (reflexo + transparência), visualmente parecido.
 *
 * API por eventos em window, para não acoplar a cena ao resto do JS:
 *   scene:shape  { shape: 0-4, x?, y?, scale?, dim? }  viaja até o objeto, com deslocamento na tela
 *   scene:ready                                         disparado após o primeiro frame
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { createFluid } from "./fluid";

export type ShapeDetail = { shape: number; x?: number; y?: number; scale?: number; dim?: number };

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isSmall = matchMedia("(max-width: 767px)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

const COBALT = new THREE.Color("#2f63e6");
const CERULEAN = new THREE.Color("#46b6e6");
const ICE = new THREE.Color("#dcecff");

const rand = (a = -1, b = 1) => a + Math.random() * (b - a);

/* ---------- Materiais ---------- */

const glassMaterials: THREE.MeshPhysicalMaterial[] = [];

function glass(tint = "#8bb8ff", options: THREE.MeshPhysicalMaterialParameters = {}) {
  const material = new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0,
    roughness: 0.07,
    ior: 1.5,
    thickness: 0.9,
    transmission: 1,
    attenuationColor: new THREE.Color("#1c4fe0"),
    attenuationDistance: 1.6,
    iridescence: 0.35,
    iridescenceIOR: 1.3,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.5,
    ...options,
  });
  glassMaterials.push(material);
  return material;
}

/** Vidro simplificado: sem refração (a parte cara), mas com reflexo e transparência. */
function setLowQuality() {
  for (const material of glassMaterials) {
    material.transmission = 0;
    material.transparent = true;
    material.opacity = 0.58;
    material.needsUpdate = true;
  }
}

/* Tubos com pulsos de luz: uv.x vai de 0 a 1 ao longo de cada tubo */
const pulseVertex = /* glsl */ `
  attribute float aPhase;
  varying float vT;
  varying float vPhase;
  void main() {
    vT = uv.x;
    vPhase = aPhase;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const pulseFragment = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uBase;
  uniform float uSpan;
  uniform vec3 uCerulean;
  uniform vec3 uIce;
  varying float vT;
  varying float vPhase;
  void main() {
    // Um pulso por tubo: cabeça brilhante indo de 0 a 1, com rastro atrás. A travessia dura
    // uSpan do ciclo; no resto do ciclo o tubo fica em repouso (encadeia camada a camada)
    float d = vT - fract(uTime * uSpeed - vPhase) / uSpan;
    float head = exp(-d * d * 900.0);
    float tail = d < 0.0 ? exp(d * 8.0) * 0.5 : 0.0;
    vec3 color = mix(uCerulean, uIce, clamp(head * 1.5, 0.0, 1.0));
    gl_FragColor = vec4(color, uBase + (head + tail) * 1.1);
  }
`;

function tubes(edges: [THREE.Vector3, THREE.Vector3, number][], radius: number) {
  const geometries = edges.map(([a, b, phase]) => {
    const geometry = new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 1, radius, 6, false);
    geometry.setAttribute(
      "aPhase",
      new THREE.BufferAttribute(new Float32Array(geometry.attributes.position!.count).fill(phase), 1),
    );
    return geometry;
  });
  return mergeGeometries(geometries)!;
}

function pulseTubes(
  geometry: THREE.BufferGeometry,
  shared: { uTime: THREE.IUniform },
  speed: number,
  base: number,
  span = 1,
) {
  return new THREE.Mesh(
    geometry,
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: shared.uTime,
        uCerulean: { value: CERULEAN },
        uIce: { value: ICE },
        uSpeed: { value: speed },
        uBase: { value: base },
        uSpan: { value: span },
      },
      vertexShader: pulseVertex,
      fragmentShader: pulseFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
}

/* ---------- Objetos ---------- */

type Shared = { uTime: THREE.IUniform };
type Station = { group: THREE.Group; update?: (t: number) => void };

const NET_SPEED = 0.34;
const NET_LAYER_PHASE = 0.22;
const IDENTITY = new THREE.Quaternion();

/**
 * 0-1: o quanto a camada acende agora. Os pulsos da camada L saem em L·fase e levam uma fase
 * para cruzar, então chegam na camada L+1 exatamente quando os dela saem.
 */
function fireAt(t: number, layer: number) {
  const a = (((t * NET_SPEED - layer * NET_LAYER_PHASE) % 1) + 1) % 1;
  const dist = Math.min(a, 1 - a);
  return Math.exp(-dist * dist * 90);
}

function makeNetwork(shared: Shared): Station {
  // Perceptron 6-10-12-10-4 com 340 conexões. Cada neurônio é uma esfera cobalto escura com um
  // brilho ciano por dentro, que respira devagar e intensifica quando o pulso da camada anterior
  // chega. A intensidade de cada um vem por instância (instanceColor.r).
  const group = new THREE.Group();
  const layers = [6, 10, 12, 10, 4];
  const byLayer = layers.map((n, li) =>
    Array.from({ length: n }, (_, ni) => {
      const x = (li / (layers.length - 1) - 0.5) * 5;
      const y = (n === 1 ? 0 : ni / (n - 1) - 0.5) * (n * 0.34);
      return new THREE.Vector3(x, y, rand(-0.12, 0.12));
    }),
  );
  const nodes = byLayer.flat();
  const layerOf = layers.flatMap((n, li) => Array<number>(n).fill(li));

  const neurons = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.13, 32, 16),
    new THREE.ShaderMaterial({
      uniforms: { uBody: { value: new THREE.Color("#0d3380") }, uGlow: { value: CERULEAN } },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vView;
        varying float vLevel;
        void main() {
          vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
          vView = normalize(-mv.xyz);
          vLevel = instanceColor.r;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uBody;
        uniform vec3 uGlow;
        varying vec3 vNormal;
        varying vec3 vView;
        varying float vLevel;
        void main() {
          float facing = max(dot(normalize(vNormal), normalize(vView)), 0.0);
          // Brilho interno: forte no centro, some na borda; a borda ganha um leve contorno cobalto
          float inner = pow(facing, 2.2) * vLevel;
          float rim = pow(1.0 - facing, 3.0) * 0.5;
          vec3 color = uBody + uGlow * inner * 1.3 + uBody * rim * 2.5;
          gl_FragColor = vec4(min(color, uGlow * 1.15), 1.0);
        }
      `,
    }),
    nodes.length,
  );
  const m = new THREE.Matrix4();
  nodes.forEach((node, i) => {
    m.makeTranslation(node);
    neurons.setMatrixAt(i, m);
    neurons.setColorAt(i, new THREE.Color(0, 0, 0));
  });
  neurons.computeBoundingSphere();
  group.add(neurons);

  const edges: [THREE.Vector3, THREE.Vector3, number][] = [];
  for (let li = 0; li < layers.length - 1; li++)
    for (const a of byLayer[li]!) for (const b of byLayer[li + 1]!) edges.push([a, b, li * NET_LAYER_PHASE]);
  group.add(pulseTubes(tubes(edges, 0.006), shared, NET_SPEED, 0.12, NET_LAYER_PHASE));

  const level = new THREE.Color();
  return {
    group,
    update: (t) => {
      group.rotation.y = Math.sin(t * 0.2) * 0.28;
      // Respiração lenta (defasada por neurônio) + disparo quando os pulsos chegam
      nodes.forEach((_, i) => {
        const breathe = 0.45 + 0.15 * Math.sin(t * 1.1 + i * 0.9);
        neurons.setColorAt(i, level.setRGB(breathe + fireAt(t, layerOf[i]!) * 0.9, 0, 0));
      });
      neurons.instanceColor!.needsUpdate = true;
    },
  };
}

function makeGraph(shared: Shared): Station {
  // Constelação: poliedros facetados numa casca irregular + alguns internos, cada nó ligado
  // aos 3 vizinhos mais próximos por tubos com pulsos. Gira devagar.
  const group = new THREE.Group();
  const nodes: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const SHELL = 60;
  for (let i = 0; i < SHELL; i++) {
    const y = 1 - (i / (SHELL - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const radius = 1.9 * rand(0.8, 1.05);
    nodes.push(new THREE.Vector3(Math.cos(golden * i) * r * radius, y * radius, Math.sin(golden * i) * r * radius));
  }
  for (let i = 0; i < 10; i++) nodes.push(new THREE.Vector3(rand(), rand(), rand()).normalize().multiplyScalar(rand(0.4, 1.1)));

  const shells = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.15, 0),
    glass("#9cc6ff", { flatShading: true }),
    nodes.length,
  );
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const s = new THREE.Vector3();
  nodes.forEach((node, i) => {
    q.setFromEuler(e.set(rand(0, 6), rand(0, 6), 0));
    shells.setMatrixAt(i, m.compose(node, q, s.setScalar(rand(0.7, 1.25))));
  });
  shells.computeBoundingSphere();
  group.add(shells);

  const seen = new Set<string>();
  const edges: [THREE.Vector3, THREE.Vector3, number][] = [];
  nodes.forEach((node, a) => {
    nodes
      .map((other, b) => [b, node.distanceTo(other)] as const)
      .filter(([b]) => b !== a)
      .sort((x, y) => x[1] - y[1])
      .slice(0, 3)
      .forEach(([b]) => {
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (seen.has(key)) return;
        seen.add(key);
        edges.push([node, nodes[b]!, Math.random()]);
      });
  });
  group.add(pulseTubes(tubes(edges, 0.014), shared, 0.28, 0.45));

  return {
    group,
    update: (t) => {
      group.rotation.y = t * 0.12;
      group.rotation.x = Math.sin(t * 0.15) * 0.15;
    },
  };
}

function makeEditor(): Station {
  // Arquivo de código visto de longe (minimap): cada palavra é uma barra de vidro arredondada,
  // com cores de "syntax highlight". Uma linha ativa desce pelo arquivo e salta para a frente.
  const group = new THREE.Group();
  const LINES = 16;
  const LINE_H = 0.32;
  const tokens: { x: number; len: number; line: number }[] = [];
  let indent = 0;
  for (let line = 0; line < LINES; line++) {
    if (Math.random() < 0.16) continue; // linha em branco
    indent = Math.max(0, Math.min(3, indent + (Math.random() < 0.45 ? 1 : Math.random() < 0.5 ? -1 : 0)));
    let x = indent * 0.36;
    const end = x + rand(1, 3.2);
    while (x < end) {
      const len = Math.min(rand(0.16, 0.66), end - x);
      tokens.push({ x, len, line });
      x += len + 0.1;
    }
  }
  const bars = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 0.15, 0.15, 3, 0.06), glass("#ffffff"), tokens.length);
  const palette = [COBALT, CERULEAN, ICE, new THREE.Color("#7f8cff")];
  tokens.forEach((_, i) => bars.setColorAt(i, palette[(Math.random() * palette.length) | 0]!));
  group.add(bars);

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const pos = new THREE.Vector3();
  const place = (t: number) => {
    const cursor = ((t * 0.09 * LINES) % (LINES + 4)) - 2;
    tokens.forEach((token, i) => {
      const lift = Math.exp(-(((token.line - cursor) / 0.8) ** 2));
      pos.set(token.x + token.len / 2 - 2 + lift * 0.1, -(token.line - (LINES - 1) / 2) * LINE_H, lift * 0.5);
      bars.setMatrixAt(i, m.compose(pos, q, scale.set(token.len, 1, 1)));
    });
    bars.instanceMatrix.needsUpdate = true;
  };
  place(0);
  bars.computeBoundingSphere();

  return {
    group,
    update: (t) => {
      place(t);
      group.rotation.y = -0.4 + Math.sin(t * 0.25) * 0.12;
    },
  };
}

function makeCode(): Station {
  // </> extrudado: dois chevrons e uma barra, com bisel, em vidro espesso
  const group = new THREE.Group();
  const extrude = (points: [number, number][]) =>
    new THREE.ExtrudeGeometry(new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y))), {
      depth: 0.4,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.06,
      bevelSegments: 4,
    }).center();
  const chevron = extrude([
    [0.8, 1.05],
    [0.8, 0.66],
    [-0.3, 0],
    [0.8, -0.66],
    [0.8, -1.05],
    [-0.85, 0],
  ]);
  const slash = extrude([
    [-0.42, -1.2],
    [-0.08, -1.2],
    [0.42, 1.2],
    [0.08, 1.2],
  ]);
  const material = glass("#9cc6ff", { thickness: 1.4 });
  const left = new THREE.Mesh(chevron, material);
  left.position.x = -1.75;
  const right = new THREE.Mesh(chevron, material);
  right.position.x = 1.75;
  right.rotation.y = Math.PI; // espelhado: >
  group.add(left, new THREE.Mesh(slash, material), right);

  return {
    group,
    update: (t) => {
      group.rotation.y = Math.sin(t * 0.35) * 0.4;
      group.rotation.x = Math.sin(t * 0.22) * 0.08;
    },
  };
}

function makeStack(shared: Shared): Station {
  // Arquitetura em camadas (dados → modelo → API → interface): placas finas de vidro empilhadas,
  // cada uma com módulos acesos em cima. Feixes de luz sobem de uma placa para a de cima, e a
  // placa acende quando os feixes chegam, no mesmo ritmo da rede neural.
  const group = new THREE.Group();
  const LAYERS = 4;
  const GAP = 0.85;
  const W = 3;
  const D = 2;
  const plateGeometry = new RoundedBoxGeometry(W, 0.1, D, 4, 0.05);
  const plateMaterial = glass("#9cc6ff", { thickness: 0.4 });
  const baseY = (li: number) => (li - (LAYERS - 1) / 2) * GAP;

  const cells: { layer: number; x: number; z: number; w: number; d: number }[] = [];
  for (let li = 0; li < LAYERS; li++) {
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.position.y = baseY(li);
    group.add(plate);
    // Módulos numa grade 5 × 3 com falhas, larguras variadas por camada
    for (let cx = 0; cx < 5; cx++)
      for (let cz = 0; cz < 3; cz++) {
        if (Math.random() < 0.3) continue;
        cells.push({ layer: li, x: (cx - 2) * 0.54, z: (cz - 1) * 0.55, w: rand(0.28, 0.46), d: rand(0.22, 0.4) });
      }
  }
  const modules = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 0.05, 1, 2, 0.02), new THREE.MeshBasicMaterial(), cells.length);
  const m = new THREE.Matrix4();
  const place = new THREE.Vector3();
  const size = new THREE.Vector3();
  const palette = [COBALT, CERULEAN, ICE];
  const tint = cells.map(() => palette[(Math.random() * palette.length) | 0]!);
  group.add(modules);

  const edges: [THREE.Vector3, THREE.Vector3, number][] = [];
  for (let li = 0; li < LAYERS - 1; li++)
    for (let k = 0; k < 7; k++) {
      const x = rand(-W / 2 + 0.2, W / 2 - 0.2);
      const z = rand(-D / 2 + 0.2, D / 2 - 0.2);
      edges.push([new THREE.Vector3(x, baseY(li) + 0.05, z), new THREE.Vector3(x, baseY(li + 1) - 0.05, z), li * NET_LAYER_PHASE]);
    }
  group.add(pulseTubes(tubes(edges, 0.012), shared, NET_SPEED, 0.1, NET_LAYER_PHASE));

  const glow = new THREE.Color();
  return {
    group,
    update: (t) => {
      cells.forEach((cell, i) => {
        const flash = fireAt(t, cell.layer);
        place.set(cell.x, baseY(cell.layer) + 0.075 + flash * 0.05, cell.z);
        modules.setMatrixAt(i, m.compose(place, IDENTITY, size.set(cell.w, 1, cell.d)));
        modules.setColorAt(i, glow.copy(tint[i]!).multiplyScalar(0.55 + flash * 1.8));
      });
      modules.instanceMatrix.needsUpdate = true;
      modules.instanceColor!.needsUpdate = true;
      group.rotation.x = 0.42;
      group.rotation.y = -0.6 + Math.sin(t * 0.2) * 0.25;
    },
  };
}

/* ---------- Montagem ---------- */

function init(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  const dpr = Math.min(devicePixelRatio, isSmall ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 34);
  scene.add(camera);
  // Luzes presas à câmera: reflexos coloridos iguais em qualquer ponto da viagem
  const keyLight = new THREE.PointLight(CERULEAN, 40, 30);
  keyLight.position.set(5, 4, 2);
  const rimLight = new THREE.PointLight(COBALT, 50, 30);
  rimLight.position.set(-6, -3, -2);
  camera.add(keyLight, rimLight);

  const shared: Shared = { uTime: { value: 0 } };

  // Cada objeto numa "estação" ao longo de z, na ordem da Home (rede → grafo → editor → camadas → </>)
  const stations: Station[] = [makeCode(), makeGraph(shared), makeNetwork(shared), makeStack(shared), makeEditor()];
  const depthOf = [-80, -20, 0, -60, -40];
  stations.forEach((station, i) => {
    station.group.position.set(0, 0, depthOf[i]!);
    scene.add(station.group);
  });

  // Poeira de luz subindo ao fundo: pontinhos ancorados no mundo (ganham paralaxe na viagem),
  // que dão a volta dentro de uma caixa ao redor da câmera
  const DUST = isSmall ? 1400 : 3600;
  const dustPositions = new Float32Array(DUST * 3);
  const dustSpeed = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    dustPositions.set([rand(-9, 9), rand(-6, 6), rand(-18, 4)], i * 3);
    dustSpeed[i] = rand(0.08, 0.3);
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.ShaderMaterial({
      uniforms: { uPixelRatio: { value: dpr }, uColor: { value: ICE } },
      vertexShader: /* glsl */ `
        uniform float uPixelRatio;
        varying float vAlpha;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          float depth = -mv.z;
          // Perto da câmera: maior e mais fraco (desfocado); longe: ponto pequeno e nítido
          gl_PointSize = uPixelRatio * clamp(46.0 / depth, 3.2, 16.0);
          vAlpha = smoothstep(24.0, 8.0, depth) * mix(0.6, 1.0, smoothstep(1.0, 5.0, depth));
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          // Núcleo nítido + halo suave: cada grão lê como um ponto de luz, não uma mancha
          float a = smoothstep(0.5, 0.0, d) * 0.7 + smoothstep(0.2, 0.06, d) * 0.9;
          gl_FragColor = vec4(uColor, a * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  dust.frustumCulled = false;
  scene.add(dust);

  // Fumaça do cursor: canvas próprio, acima do escurecimento do texto
  const smokeCanvas = document.querySelector<HTMLCanvasElement>("#smoke");
  const smokeRenderer =
    !reduceMotion && finePointer && smokeCanvas
      ? new THREE.WebGLRenderer({ canvas: smokeCanvas, antialias: false, alpha: true, premultipliedAlpha: true })
      : null;
  smokeRenderer?.setPixelRatio(Math.min(devicePixelRatio, 1.25)); // fumaça é macia: resolução menor basta
  smokeRenderer?.setClearColor(0x000000, 0);
  if (smokeRenderer) smokeRenderer.autoClear = false;
  const fluid = smokeRenderer ? createFluid(smokeRenderer, { simRes: 128, dyeRes: 512 }) : null;
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

  /* Viagem da câmera entre as estações */
  const target = { shape: 2, x: 0, y: 0, scale: 1, dim: 1 };
  const camPos = new THREE.Vector3(0, 0, 9);
  const look = new THREE.Vector3();
  const desiredPos = new THREE.Vector3();
  const desiredLook = new THREE.Vector3();
  const state = { scale: 1, dim: 1 };
  let baseZ = 9;

  function desired() {
    const obj = stations[target.shape]!.group.position;
    // O objeto aparece deslocado na tela: a câmera mira ao lado dele
    desiredLook.set(obj.x - target.x, obj.y - target.y, obj.z);
    desiredPos.set(desiredLook.x, desiredLook.y, obj.z + baseZ);
  }

  function snap() {
    desired();
    camPos.copy(desiredPos);
    look.copy(desiredLook);
    state.scale = target.scale;
    state.dim = target.dim;
  }

  function applyShape(detail: ShapeDetail) {
    target.shape = THREE.MathUtils.clamp(Math.round(detail.shape), 0, stations.length - 1);
    target.x = detail.x ?? 0;
    target.y = detail.y ?? 0;
    target.scale = detail.scale ?? 1;
    target.dim = detail.dim ?? 1;
    if (reduceMotion) snap();
  }
  addEventListener("scene:shape", (e) => applyShape((e as CustomEvent<ShapeDetail>).detail));

  function resize() {
    const w = innerWidth;
    const h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    baseZ = w / h < 0.8 ? 12 : 9; // telas estreitas: câmera mais longe para o objeto caber
    camera.updateProjectionMatrix();
    smokeRenderer?.setSize(w, h, false);
    fluid?.resize();
  }
  resize();
  addEventListener("resize", resize);

  // Pedido feito antes deste módulo carregar: começa já na estação certa
  const pending = (window as unknown as { __sceneShape?: ShapeDetail }).__sceneShape;
  if (pending) applyShape(pending);
  snap();

  if (isSmall) setLowQuality();

  const timer = new THREE.Timer();
  let running = true;
  let ready = false;
  let lastScroll = scrollY;
  let speedZoom = 0;
  // Medição de FPS nos primeiros segundos: abaixo de ~45, simplifica o vidro
  let sampleFrames = 0;
  let sampleTime = 0;
  let qualityChecked = isSmall;
  function frame(now: number) {
    if (!running) return;
    timer.update(now);
    const rawDt = timer.getDelta();
    const dt = Math.min(rawDt, 0.05);
    const t = timer.getElapsed();
    const ease = 1 - Math.pow(0.001, dt); // aproximação exponencial independente de FPS

    if (!qualityChecked && t > 1.5) {
      sampleFrames++;
      sampleTime += rawDt;
      if (sampleTime > 2.5) {
        qualityChecked = true;
        if (sampleFrames / sampleTime < 45) setLowQuality();
      }
    }

    if (!reduceMotion) {
      shared.uTime.value = t;
      stations.forEach((station) => station.update?.(t));
      desired();
      // Viagem suave: rápida no começo, desacelerando ao chegar (e reversível no meio)
      const travel = 1 - Math.exp(-dt * 1.7);
      camPos.lerp(desiredPos, travel);
      look.lerp(desiredLook, travel);
      state.scale += (target.scale - state.scale) * ease * 0.3;
      state.dim += (target.dim - state.dim) * ease * 0.4;
    }
    // Só o objeto perto da câmera aparece: os outros encolhem até sumir e crescem ao se
    // aproximar (os vizinhos não ficam atrás do objeto atual, e cada um "surge" na viagem)
    const focus = camPos.z - baseZ;
    stations.forEach((station, i) => {
      const near = 1 - THREE.MathUtils.smoothstep(Math.abs(station.group.position.z - focus), 3, 11);
      station.group.visible = near > 0.01;
      station.group.scale.setScalar(Math.max(near, 0.001) * (i === target.shape ? state.scale : 1));
    });
    renderer.toneMappingExposure = 0.55 + 0.55 * state.dim;

    // Rolar rápido aproxima um pouco a câmera; o cursor dá uma leve paralaxe
    const scrollSpeed = Math.abs(scrollY - lastScroll) / Math.max(dt, 1e-3) / innerHeight;
    lastScroll = scrollY;
    speedZoom += (Math.min(scrollSpeed * 0.25, 1) - speedZoom) * ease * 0.15;
    parallax.x += ((pointer.x - 0.5) * 2 - parallax.x) * ease * 0.3;
    parallax.y += ((pointer.y - 0.5) * 2 - parallax.y) * ease * 0.3;
    camera.position.set(camPos.x + parallax.x * 0.35, camPos.y + parallax.y * 0.25, camPos.z - speedZoom * 0.8);
    camera.lookAt(look);

    // Poeira: sobe devagar e dá a volta na caixa ao redor da câmera
    for (let i = 0; i < DUST; i++) {
      const k = i * 3;
      if (!reduceMotion) dustPositions[k + 1] = dustPositions[k + 1]! + dustSpeed[i]! * dt;
      const rx = dustPositions[k]! - camera.position.x;
      const ry = dustPositions[k + 1]! - camera.position.y;
      const rz = dustPositions[k + 2]! - camera.position.z;
      if (ry > 6) dustPositions[k + 1] = dustPositions[k + 1]! - 12;
      if (ry < -6) dustPositions[k + 1] = dustPositions[k + 1]! + 12;
      if (rx > 9) dustPositions[k] = dustPositions[k]! - 18;
      if (rx < -9) dustPositions[k] = dustPositions[k]! + 18;
      if (rz > 4) dustPositions[k + 2] = dustPositions[k + 2]! - 22;
      if (rz < -18) dustPositions[k + 2] = dustPositions[k + 2]! + 22;
    }
    dustGeometry.attributes.position!.needsUpdate = true;

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
      smokeRenderer!.setRenderTarget(null);
      smokeRenderer!.clear();
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
