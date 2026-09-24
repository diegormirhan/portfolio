/*
 * Cena de fundo persistente (Three.js), montada uma vez e mantida entre páginas.
 *
 * Objetos 3D sólidos de vidro, espalhados num espaço 3D; a câmera viaja de um para o outro
 * conforme a seção visível (transição contínua e reversível):
 *   0  </>           símbolo de código extrudado em vidro espesso
 *   1  superfície    gráfico 3D de relevos com várias montanhas que se transforma (peaks,
 *                    Rastrigin, Ackley, Griewank, Schwefel), com uma bola de luz percorrendo
 *   2  rede neural   camadas de nós brilhantes totalmente conectadas, sobre uma grade ondulada
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

const VIOLET = new THREE.Color("#7a5cff");

const rand = (a = -1, b = 1) => a + Math.random() * (b - a);

/** Altura da tela em pixels físicos (tamanho dos brilhos) e brilho da seção (data-scene-dim). */
const VIEWPORT: THREE.IUniform<number> = { value: 1 };
const DIM: THREE.IUniform<number> = { value: 1 };

/** Gradiente da marca ao longo de u (0-1): cerúleo → cobalto → violeta. */
function brand(u: number, out = new THREE.Color()) {
  return u < 0.5 ? out.copy(CERULEAN).lerp(COBALT, u * 2) : out.copy(COBALT).lerp(VIOLET, (u - 0.5) * 2);
}

/** Brilhos (glow) aditivos: um ponto de luz difuso por posição; a intensidade vem na cor. */
function glowSprites(count: number, size: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  const points = new THREE.Points(
    geometry,
    new THREE.ShaderMaterial({
      uniforms: { uSize: { value: size }, uViewport: VIEWPORT, uDim: DIM },
      vertexShader: /* glsl */ `
        uniform float uSize;
        uniform float uViewport;
        attribute vec3 aColor;
        varying vec3 vColor;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          // Tamanho em unidades do mundo, convertido para pixels pela projeção
          gl_PointSize = uSize * projectionMatrix[1][1] * uViewport * 0.5 / -mv.z;
          vColor = aColor;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uDim;
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = exp(-d * d * 5.0) * (1.0 - d);
          gl_FragColor = vec4(vColor, max(a, 0.0) * (0.35 + 0.65 * uDim));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  points.frustumCulled = false;
  return { points, positions, colors, geometry };
}

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
  varying float vX;
  void main() {
    vT = uv.x;
    vPhase = aPhase;
    vX = position.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const pulseFragment = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uBase;
  uniform float uSpan;
  uniform vec3 uCerulean;
  uniform vec3 uFar;
  uniform float uRange;
  uniform vec3 uIce;
  varying float vT;
  varying float vPhase;
  varying float vX;
  void main() {
    // Um pulso por tubo: cabeça brilhante indo de 0 a 1, com rastro atrás. A travessia dura
    // uSpan do ciclo; no resto do ciclo o tubo fica em repouso (encadeia camada a camada)
    float d = vT - fract(uTime * uSpeed - vPhase) / uSpan;
    float head = exp(-d * d * 900.0);
    float tail = d < 0.0 ? exp(d * 8.0) * 0.5 : 0.0;
    vec3 base = mix(uCerulean, uFar, clamp(vX / uRange * 0.5 + 0.5, 0.0, 1.0));
    vec3 color = mix(base, uIce, clamp(head * 1.5, 0.0, 1.0));
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
  far = CERULEAN,
  range = 1,
) {
  return new THREE.Mesh(
    geometry,
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: shared.uTime,
        uCerulean: { value: CERULEAN },
        uFar: { value: far },
        uRange: { value: range },
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
  // Rede neural em camadas (5-7-8-7-4), cada camada ligada a todas as da seguinte, no estilo
  // "bolhas de luz": nós com brilho difuso, cores em gradiente cerúleo → violeta ao longo das
  // camadas e uma grade ondulada embaixo. Os pulsos saem de uma camada e chegam na próxima
  // no instante em que ela acende (fireAt), da entrada até a saída.
  const group = new THREE.Group();
  const W = 2.6; // meia-largura (da entrada à saída)
  const layers = [5, 7, 8, 7, 4];
  const byLayer = layers.map((n, li) =>
    Array.from({ length: n }, (_, ni) => {
      const x = (li / (layers.length - 1) - 0.5) * 2 * W;
      const y = (ni / (n - 1) - 0.5) * n * 0.36 + 0.25;
      // Camadas levemente curvas em profundidade: a rede tem volume ao girar
      return new THREE.Vector3(x, y, -0.18 * y * y + rand(-0.06, 0.06));
    }),
  );
  const nodes = byLayer.flat();
  const layerOf = layers.flatMap((n, li) => Array<number>(n).fill(li));
  const tone = nodes.map((n) => brand(THREE.MathUtils.clamp(n.x / (2 * W) + 0.5, 0, 1)));

  // Nós: esferas pequenas com centro claro tingido; a cor por instância já traz a intensidade
  const orbs = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.09, 32, 16),
    new THREE.ShaderMaterial({
      uniforms: { uIce: { value: ICE } },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vView;
        varying vec3 vColor;
        void main() {
          vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
          vView = normalize(-mv.xyz);
          vColor = instanceColor;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uIce;
        varying vec3 vNormal;
        varying vec3 vView;
        varying vec3 vColor;
        void main() {
          float facing = max(dot(normalize(vNormal), normalize(vView)), 0.0);
          // Borda na cor do nó e centro mais claro, como uma bolha de luz
          vec3 color = mix(vColor, mix(vColor, uIce, 0.55) * 1.4, pow(facing, 1.6));
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    }),
    nodes.length,
  );
  const m = new THREE.Matrix4();
  nodes.forEach((node, i) => {
    orbs.setMatrixAt(i, m.makeTranslation(node));
    orbs.setColorAt(i, tone[i]!);
  });
  orbs.computeBoundingSphere();
  const halos = glowSprites(nodes.length, 0.85);
  nodes.forEach((node, i) => halos.positions.set([node.x, node.y, node.z], i * 3));

  // Conexões entre camadas vizinhas (todas com todas), pulsos sincronizados camada a camada
  const edges: [THREE.Vector3, THREE.Vector3, number][] = [];
  for (let li = 0; li < layers.length - 1; li++)
    for (const a of byLayer[li]!) for (const b of byLayer[li + 1]!) edges.push([a, b, li * NET_LAYER_PHASE]);
  const links = pulseTubes(tubes(edges, 0.0055), shared, NET_SPEED, 0.28, NET_LAYER_PHASE, VIOLET, W);

  // Grade ondulada embaixo: linhas nas duas direções, deslocadas no shader
  const GRID_W = 3.6;
  const GRID_D = 2.6;
  const LINES = 30;
  const STEPS = 90;
  const gridPoints: number[] = [];
  for (let k = 0; k <= LINES; k++) {
    const u = (k / LINES) * 2 - 1;
    for (let step = 0; step < STEPS; step++) {
      const a = (step / STEPS) * 2 - 1;
      const b = ((step + 1) / STEPS) * 2 - 1;
      // um segmento da linha ao longo de x (z fixo) e um da linha ao longo de z (x fixo)
      gridPoints.push(a * GRID_W, 0, u * GRID_D, b * GRID_W, 0, u * GRID_D);
      gridPoints.push(u * GRID_W, 0, a * GRID_D, u * GRID_W, 0, b * GRID_D);
    }
  }
  const gridGeometry = new THREE.BufferGeometry();
  gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(gridPoints, 3));
  const grid = new THREE.LineSegments(
    gridGeometry,
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: shared.uTime,
        uNear: { value: CERULEAN },
        uFar: { value: VIOLET },
        uSize: { value: new THREE.Vector2(GRID_W, GRID_D) },
        uDim: DIM,
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform vec2 uSize;
        varying vec2 vUv;
        void main() {
          vec3 p = position;
          p.y = -1.05
            + 0.22 * sin(p.x * 0.9 + uTime * 0.45) * cos(p.z * 1.2 - uTime * 0.3)
            + 0.12 * sin((p.x + p.z) * 1.8 + uTime * 0.6);
          vUv = p.xz / uSize;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uNear;
        uniform vec3 uFar;
        uniform float uDim;
        varying vec2 vUv;
        void main() {
          // Some nas bordas: a grade não tem começo nem fim visíveis
          float edge = (1.0 - smoothstep(0.55, 1.0, abs(vUv.x))) * (1.0 - smoothstep(0.4, 1.0, abs(vUv.y)));
          vec3 color = mix(uNear, uFar, vUv.x * 0.5 + 0.5);
          gl_FragColor = vec4(color, edge * 0.42 * (0.35 + 0.65 * uDim));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );

  // A grade fica como um chão abaixo da rede, inclinada para dar para ver a ondulação
  grid.position.y = -0.95;
  grid.rotation.x = 0.35;
  group.add(grid, links, orbs, halos.points);

  const color = new THREE.Color();
  const size = new THREE.Vector3();
  return {
    group,
    update: (t) => {
      group.rotation.x = 0.08;
      group.rotation.y = -0.25 + Math.sin(t * 0.18) * 0.25;
      // Cada camada acende quando os pulsos da anterior chegam; entre um e outro, respira
      nodes.forEach((node, i) => {
        const wave = fireAt(t, layerOf[i]!);
        const breathe = 0.75 + 0.25 * Math.sin(t * 1.3 + i * 1.7);
        orbs.setColorAt(i, color.copy(tone[i]!).multiplyScalar(breathe + wave * 1.3));
        orbs.setMatrixAt(i, m.compose(node, IDENTITY, size.setScalar(1 + wave * 0.35)));
        color.copy(tone[i]!).lerp(ICE, wave * 0.4).multiplyScalar(0.55 + wave * 0.9 + 0.15 * breathe);
        halos.colors.set([color.r, color.g, color.b], i * 3);
      });
      orbs.instanceColor!.needsUpdate = true;
      orbs.instanceMatrix.needsUpdate = true;
      halos.geometry.attributes.aColor!.needsUpdate = true;
    },
  };
}

/* Funções de teste de otimização com várias montanhas, em x, z ∈ [-1, 1], altura normalizada
 * ~0-1. As mesmas fórmulas em TS (a bola) e em GLSL (a superfície). */
const SURFACES = 5;
function surface(k: number, x: number, z: number) {
  const TAU = Math.PI * 2;
  switch (k) {
    case 0: {
      // peaks: três montanhas e dois vales
      const X = x * 3;
      const Z = z * 3;
      const f =
        3 * (1 - X) ** 2 * Math.exp(-X * X - (Z + 1) ** 2) -
        10 * (X / 5 - X ** 3 - Z ** 5) * Math.exp(-X * X - Z * Z) -
        Math.exp(-((X + 1) ** 2) - Z * Z) / 3;
      return (f + 6.6) / 14.8;
    }
    case 1: {
      // Rastrigin: grade de picos
      const X = x * 2.2;
      const Z = z * 2.2;
      return (20 + X * X - 10 * Math.cos(TAU * X) + Z * Z - 10 * Math.cos(TAU * Z)) / 50;
    }
    case 2: {
      // Ackley invertida: um pico central cercado de montanhas menores
      const X = x * 3;
      const Z = z * 3;
      const a = -20 * Math.exp(-0.2 * Math.sqrt(0.5 * (X * X + Z * Z)));
      const b = -Math.exp(0.5 * (Math.cos(TAU * X) + Math.cos(TAU * Z)));
      return 1 - (a + b + Math.E + 20) / 12;
    }
    case 3: {
      // Griewank (ampliada): ondas de montanhas
      const X = x * 9;
      const Z = z * 9;
      return (1 + (X * X + Z * Z) / 250 - Math.cos(X) * Math.cos(Z / Math.SQRT2)) / 2.7;
    }
    default: {
      // Schwefel: cordilheira irregular
      const X = x * 420;
      const Z = z * 420;
      return (837.97 - X * Math.sin(Math.sqrt(Math.abs(X))) - Z * Math.sin(Math.sqrt(Math.abs(Z)))) / 1680;
    }
  }
}

const surfaceGlsl = /* glsl */ `
  uniform float uA;
  uniform float uB;
  uniform float uMix;
  const float TAU = 6.2831853;
  float surfaceK(float k, float x, float z) {
    if (k < 0.5) {
      float X = x * 3.0; float Z = z * 3.0;
      float f = 3.0 * (1.0 - X) * (1.0 - X) * exp(-X * X - (Z + 1.0) * (Z + 1.0))
        - 10.0 * (X / 5.0 - X * X * X - Z * Z * Z * Z * Z) * exp(-X * X - Z * Z)
        - exp(-(X + 1.0) * (X + 1.0) - Z * Z) / 3.0;
      return (f + 6.6) / 14.8;
    }
    if (k < 1.5) {
      float X = x * 2.2; float Z = z * 2.2;
      return (20.0 + X * X - 10.0 * cos(TAU * X) + Z * Z - 10.0 * cos(TAU * Z)) / 50.0;
    }
    if (k < 2.5) {
      float X = x * 3.0; float Z = z * 3.0;
      float a = -20.0 * exp(-0.2 * sqrt(0.5 * (X * X + Z * Z)));
      float b = -exp(0.5 * (cos(TAU * X) + cos(TAU * Z)));
      return 1.0 - (a + b + 2.7182818 + 20.0) / 12.0;
    }
    if (k < 3.5) {
      float X = x * 9.0; float Z = z * 9.0;
      return (1.0 + (X * X + Z * Z) / 250.0 - cos(X) * cos(Z / 1.4142136)) / 2.7;
    }
    float X = x * 420.0; float Z = z * 420.0;
    return (837.97 - X * sin(sqrt(abs(X))) - Z * sin(sqrt(abs(Z)))) / 1680.0;
  }
  float heightAt(vec2 p) {
    return mix(surfaceK(uA, p.x, p.y), surfaceK(uB, p.x, p.y), uMix);
  }
`;

const LAND_HALF = 2.1; // meia-largura no mundo
const LAND_HEIGHT = 1.9;
const landGlsl = /* glsl */ `
  const float HALF = ${LAND_HALF.toFixed(2)};
  const float HEIGHT = ${LAND_HEIGHT.toFixed(2)};
`;

function makeLandscape(): Station {
  // Gráfico 3D de função de otimização: superfície com mapa de cores da marca (vales cobalto
  // profundo → picos cerúleo/gelo) e uma malha de linhas acesa por cima. A cada ~6,5 s a
  // superfície se transforma na próxima função, e uma bola de luz desce em espiral até o mínimo.
  const group = new THREE.Group();
  const morph = { uA: { value: 0 }, uB: { value: 1 }, uMix: { value: 0 } };

  const surfaceMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2, 140, 140).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({
      uniforms: {
        ...morph,
        uLow: { value: new THREE.Color("#081642") },
        uMid: { value: COBALT },
        uHigh: { value: CERULEAN },
        uTop: { value: new THREE.Color("#c8f1ff") },
        uDim: DIM,
      },
      vertexShader: /* glsl */ `
        ${surfaceGlsl}
        ${landGlsl}
        varying float vH;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vec2 p = position.xz;
          float h = heightAt(p);
          // Normal por diferenças finitas: sombreado do relevo
          float e = 0.01;
          float hx = (heightAt(p + vec2(e, 0.0)) - heightAt(p - vec2(e, 0.0))) * HEIGHT;
          float hz = (heightAt(p + vec2(0.0, e)) - heightAt(p - vec2(0.0, e))) * HEIGHT;
          vec3 n = normalize(vec3(-hx, 2.0 * e * HALF, -hz));
          vH = h;
          vec4 mv = modelViewMatrix * vec4(p.x * HALF, h * HEIGHT - 0.9, p.y * HALF, 1.0);
          vNormal = normalize(normalMatrix * n);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uLow;
        uniform vec3 uMid;
        uniform vec3 uHigh;
        uniform vec3 uTop;
        uniform float uDim;
        varying float vH;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          float h = clamp(vH, 0.0, 1.0);
          vec3 color = mix(uLow, uMid, smoothstep(0.0, 0.35, h));
          color = mix(color, uHigh, smoothstep(0.3, 0.7, h));
          color = mix(color, uTop, smoothstep(0.7, 1.0, h));
          vec3 n = normalize(vNormal);
          if (!gl_FrontFacing) n = -n;
          float light = 0.45 + 0.75 * max(dot(n, normalize(vec3(-0.4, 0.9, 0.5))), 0.0);
          float rim = pow(1.0 - abs(dot(n, normalize(vView))), 3.0);
          gl_FragColor = vec4((color * light + uHigh * rim * 0.5) * (0.45 + 0.55 * uDim), 0.9);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    }),
  );

  // Malha de linhas por cima (o "wireframe" do gráfico), um fio acima da superfície
  const LINES = 28;
  const STEPS = 120;
  const wire: number[] = [];
  for (let k = 0; k <= LINES; k++) {
    const u = (k / LINES) * 2 - 1;
    for (let step = 0; step < STEPS; step++) {
      const a = (step / STEPS) * 2 - 1;
      const b = ((step + 1) / STEPS) * 2 - 1;
      wire.push(a, 0, u, b, 0, u, u, 0, a, u, 0, b);
    }
  }
  const wireGeometry = new THREE.BufferGeometry();
  wireGeometry.setAttribute("position", new THREE.Float32BufferAttribute(wire, 3));
  const wireLines = new THREE.LineSegments(
    wireGeometry,
    new THREE.ShaderMaterial({
      uniforms: { ...morph, uColor: { value: ICE }, uDim: DIM },
      vertexShader: /* glsl */ `
        ${surfaceGlsl}
        ${landGlsl}
        varying float vH;
        void main() {
          float h = heightAt(position.xz);
          vH = h;
          vec3 p = vec3(position.x * HALF, h * HEIGHT - 0.9 + 0.012, position.z * HALF);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uDim;
        varying float vH;
        void main() {
          gl_FragColor = vec4(uColor, (0.12 + 0.3 * clamp(vH, 0.0, 1.0)) * (0.4 + 0.6 * uDim));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );

  // Bola de luz (o otimizador) com brilho e rastro
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 12), new THREE.MeshBasicMaterial({ color: ICE }));
  const TRAIL = 14;
  const trail = glowSprites(TRAIL + 1, 0.5);
  const history = Array.from({ length: TRAIL }, () => new THREE.Vector3(0, -99, 0));

  group.add(surfaceMesh, wireLines, ball, trail.points);

  const PERIOD = 6.5;
  const MORPH = 1.6;
  const color = new THREE.Color();
  let lastSample = 0;
  let lastT = 0;
  const target = new THREE.Vector3();
  return {
    group,
    update: (t) => {
      group.rotation.x = 0.42;
      group.rotation.y = -0.7 + t * 0.08;
      const cycle = Math.floor(t / PERIOD);
      const local = t - cycle * PERIOD;
      const a = cycle % SURFACES;
      const b = (cycle + 1) % SURFACES;
      const mix = THREE.MathUtils.smoothstep(local, PERIOD - MORPH, PERIOD);
      morph.uA.value = a;
      morph.uB.value = b;
      morph.uMix.value = mix;

      // Percorre o relevo numa órbita que abre e fecha devagar, subindo e descendo as montanhas
      const r = 0.45 + 0.3 * Math.sin(t * 0.23);
      const angle = t * 0.9;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const h = THREE.MathUtils.lerp(surface(a, x, z), surface(b, x, z), mix);
      target.set(x * LAND_HALF, h * LAND_HEIGHT - 0.9 + 0.09, z * LAND_HALF);
      // Segue o alvo com amortecimento: some o tremido de passar por cima de relevos muito
      // rugosos (Rastrigin, Griewank) e das mudanças de altura na troca de função
      const dt = Math.min(Math.max(t - lastT, 0), 0.1);
      lastT = t;
      ball.position.lerp(target, 1 - Math.exp(-dt * 6));
      if (t - lastSample > 0.06) {
        lastSample = t;
        history.pop();
        history.unshift(ball.position.clone());
      }
      trail.positions.set([ball.position.x, ball.position.y, ball.position.z], 0);
      trail.colors.set([ICE.r * 1.2, ICE.g * 1.2, ICE.b * 1.2], 0);
      history.forEach((q, i) => {
        trail.positions.set([q.x, q.y, q.z], (i + 1) * 3);
        color.copy(CERULEAN).multiplyScalar(0.55 * (1 - i / TRAIL));
        trail.colors.set([color.r, color.g, color.b], (i + 1) * 3);
      });
      trail.geometry.attributes.position!.needsUpdate = true;
      trail.geometry.attributes.aColor!.needsUpdate = true;
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

  // Cada objeto numa "estação" ao longo de z, na ordem da Home (rede → superfície → editor → camadas → </>)
  const stations: Station[] = [makeCode(), makeLandscape(), makeNetwork(shared), makeStack(shared), makeEditor()];
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
    VIEWPORT.value = h * dpr;
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
    DIM.value = state.dim;

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
