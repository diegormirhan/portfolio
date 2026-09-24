/*
 * Peças compartilhadas da cena 3D (modo normal e dev mode): cores, materiais, tubos com pulsos,
 * brilhos, ritmo da rede neural e as funções de relevo do gráfico 3D.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isSmall = matchMedia("(max-width: 767px)").matches;
export const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

export const COBALT = new THREE.Color("#2f63e6");
export const CERULEAN = new THREE.Color("#46b6e6");
export const ICE = new THREE.Color("#dcecff");

export const VIOLET = new THREE.Color("#7a5cff");
/** Vermelho sinal do dev mode */
export const RED = new THREE.Color("#ff2b3a");
/** Vermelho profundo: substitui o cobalto no dev mode (só vermelho, sem azul) */
export const BLOOD = new THREE.Color("#8a0f1e");

export const rand = (a = -1, b = 1) => a + Math.random() * (b - a);

/** Altura da tela em pixels físicos (tamanho dos brilhos) e brilho da seção (data-scene-dim). */
export const VIEWPORT: THREE.IUniform<number> = { value: 1 };
export const DIM: THREE.IUniform<number> = { value: 1 };
/** Batida do dev mode: intensidade (0-1) e segundos desde a última batida (dev.ts). */
export const PULSE: THREE.IUniform<number> = { value: 0 };
export const PULSE_AGE: THREE.IUniform<number> = { value: 99 };

/** Gradiente da marca ao longo de u (0-1): cerúleo → cobalto → violeta. */
export function brand(u: number, out = new THREE.Color()) {
  return u < 0.5 ? out.copy(CERULEAN).lerp(COBALT, u * 2) : out.copy(COBALT).lerp(VIOLET, (u - 0.5) * 2);
}

/** Brilhos (glow) aditivos: um ponto de luz difuso por posição; a intensidade vem na cor. */
export function glowSprites(count: number, size: number) {
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

export function glass(tint = "#8bb8ff", options: THREE.MeshPhysicalMaterialParameters = {}) {
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
export function setLowQuality() {
  for (const material of glassMaterials) {
    material.transmission = 0;
    material.transparent = true;
    // Sem refração o vidro vira um véu claro: mais transparente e menos reflexo para não lavar o texto
    material.opacity = 0.4;
    material.envMapIntensity = 0.9;
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

export function tubes(edges: [THREE.Vector3, THREE.Vector3, number][], radius: number) {
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

export function pulseTubes(
  geometry: THREE.BufferGeometry,
  shared: { uTime: THREE.IUniform },
  speed: number,
  base: number,
  span = 1,
  far = CERULEAN,
  range = 1,
  near = CERULEAN,
) {
  return new THREE.Mesh(
    geometry,
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: shared.uTime,
        uCerulean: { value: near },
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

export type Shared = { uTime: THREE.IUniform };
export type Station = { group: THREE.Group; update?: (t: number) => void };

export const NET_SPEED = 0.34;
export const NET_LAYER_PHASE = 0.22;
export const IDENTITY = new THREE.Quaternion();

/**
 * 0-1: o quanto a camada acende agora. Os pulsos da camada L saem em L·fase e levam uma fase
 * para cruzar, então chegam na camada L+1 exatamente quando os dela saem.
 */
/** 0-1: pulso que passa por um ponto do ciclo (fase `offset`), no ritmo `speed`. */
export function fireWave(t: number, speed: number, offset: number) {
  const a = (((t * speed - offset) % 1) + 1) % 1;
  const dist = Math.min(a, 1 - a);
  return Math.exp(-dist * dist * 90);
}

export function fireAt(t: number, layer: number) {
  const a = (((t * NET_SPEED - layer * NET_LAYER_PHASE) % 1) + 1) % 1;
  const dist = Math.min(a, 1 - a);
  return Math.exp(-dist * dist * 90);
}


/* Funções de teste de otimização com várias montanhas, em x, z ∈ [-1, 1], altura normalizada
 * ~0-1. As mesmas fórmulas em TS (a bola) e em GLSL (a superfície). */
export const SURFACES = 5;
export function surface(k: number, x: number, z: number) {
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

export const surfaceGlsl = /* glsl */ `
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

export const LAND_HALF = 2.1; // meia-largura no mundo
export const LAND_HEIGHT = 1.9;
export const landGlsl = /* glsl */ `
  const float HALF = ${LAND_HALF.toFixed(2)};
  const float HEIGHT = ${LAND_HEIGHT.toFixed(2)};
`;
