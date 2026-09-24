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

import { createFluid } from "./fluid";
import { makeMatmul, makeNabla, makeSystem } from "./scene-dev";
import {
  reduceMotion,
  isSmall,
  finePointer,
  COBALT,
  CERULEAN,
  ICE,
  VIOLET,
  rand,
  VIEWPORT,
  DIM,
  brand,
  glowSprites,
  glass,
  setLowQuality,
  tubes,
  pulseTubes,
  NET_SPEED,
  NET_LAYER_PHASE,
  IDENTITY,
  fireAt,
  fireWave,
  PULSE,
  PULSE_AGE,
  RED,
  BLOOD,
  SURFACES,
  surface,
  surfaceGlsl,
  LAND_HALF,
  LAND_HEIGHT,
  landGlsl,
  type Shared,
  type Station,
} from "./scene-kit";

export type ShapeDetail = { shape: number; x?: number; y?: number; scale?: number; dim?: number };

// Dev mode: ciclo mais lento, com ida (forward) na primeira metade e volta (backward) na segunda
const BP_SPEED = 0.2;
const BP_PHASE = 0.11;

function makeNetwork(shared: Shared, dev = false): Station {
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
  const tone = nodes.map((n) => {
    const u = THREE.MathUtils.clamp(n.x / (2 * W) + 0.5, 0, 1);
    return dev ? new THREE.Color().copy(BLOOD).lerp(RED, u * 0.7) : brand(u);
  });

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
  const links = dev
    ? pulseTubes(tubes(edges.map(([a, b]) => [a, b, layerOf[nodes.indexOf(a)]! * BP_PHASE]), 0.0055), shared, BP_SPEED, 0.22, BP_PHASE, ICE, W, BLOOD)
    : pulseTubes(tubes(edges, 0.0055), shared, NET_SPEED, 0.28, NET_LAYER_PHASE, VIOLET, W);
  // Backpropagation: o gradiente volta da saída para a entrada, em vermelho, pelas mesmas conexões
  const gradients = dev
    ? pulseTubes(
        tubes(
          edges.map(([a, b]) => [b, a, 0.5 + (layers.length - 2 - layerOf[nodes.indexOf(a)]!) * BP_PHASE]),
          0.0075,
        ),
        shared,
        BP_SPEED,
        0,
        BP_PHASE,
        RED,
        W,
        RED,
      )
    : null;

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
        uNear: { value: dev ? BLOOD : CERULEAN },
        uFar: { value: dev ? RED : VIOLET },
        uSize: { value: new THREE.Vector2(GRID_W, GRID_D) },
        uDim: DIM,
        uPulseAge: PULSE_AGE,
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform vec2 uSize;
        uniform float uPulseAge;
        varying vec2 vUv;
        void main() {
          vec3 p = position;
          // Onda de choque da batida (dev mode): um anel que se abre do centro da grade
          float ring = uPulseAge * 3.2;
          float shock = 0.32 * exp(-pow((length(p.xz) - ring) * 2.2, 2.0)) * exp(-uPulseAge * 1.4);
          p.y = -1.05
            + 0.22 * sin(p.x * 0.9 + uTime * 0.45) * cos(p.z * 1.2 - uTime * 0.3)
            + 0.12 * sin((p.x + p.z) * 1.8 + uTime * 0.6)
            + shock;
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
  if (gradients) group.add(gradients);

  const color = new THREE.Color();
  const size = new THREE.Vector3();
  const last = layers.length - 1;
  return {
    group,
    update: (t) => {
      group.rotation.x = 0.08;
      group.rotation.y = -0.25 + Math.sin(t * 0.18) * 0.25;
      // Cada camada acende quando os pulsos da anterior chegam; entre um e outro, respira
      nodes.forEach((node, i) => {
        const layer = layerOf[i]!;
        const breathe = 0.75 + 0.25 * Math.sin(t * 1.3 + i * 1.7);
        if (dev) {
          // Forward acende em rosa claro; o gradiente, ao chegar de volta, acende em vermelho
          const forward = fireWave(t, BP_SPEED, layer * BP_PHASE);
          const backward = fireWave(t, BP_SPEED, 0.5 + (last - layer) * BP_PHASE);
          const beat = PULSE.value;
          color.copy(tone[i]!).lerp(ICE, forward * 0.5).lerp(RED, backward);
          orbs.setColorAt(i, color.clone().multiplyScalar(breathe + (forward + backward) * 1.2 + beat * 0.6));
          orbs.setMatrixAt(i, m.compose(node, IDENTITY, size.setScalar(1 + (forward + backward) * 0.35 + beat * 0.25)));
          color.multiplyScalar(0.5 + (forward + backward) * 0.9 + beat * 0.5);
        } else {
          const wave = fireAt(t, layer);
          orbs.setColorAt(i, color.copy(tone[i]!).multiplyScalar(breathe + wave * 1.3));
          orbs.setMatrixAt(i, m.compose(node, IDENTITY, size.setScalar(1 + wave * 0.35)));
          color.copy(tone[i]!).lerp(ICE, wave * 0.4).multiplyScalar(0.55 + wave * 0.9 + 0.15 * breathe);
        }
        halos.colors.set([color.r, color.g, color.b], i * 3);
      });
      orbs.instanceColor!.needsUpdate = true;
      orbs.instanceMatrix.needsUpdate = true;
      halos.geometry.attributes.aColor!.needsUpdate = true;
    },
  };
}

function makeLandscape(dev = false): Station {
  // Gráfico 3D de função de otimização: superfície com mapa de cores da marca (vales cobalto
  // profundo → picos cerúleo/gelo) e uma malha de linhas acesa por cima. A cada ~6,5 s a
  // superfície se transforma na próxima função, e uma bola de luz desce em espiral até o mínimo.
  const group = new THREE.Group();
  const morph = { uA: { value: 0 }, uB: { value: 1 }, uMix: { value: 0 } };

  const surfaceMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2, isSmall ? 80 : 130, isSmall ? 80 : 130).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({
      uniforms: {
        ...morph,
        uLow: { value: new THREE.Color(dev ? "#140307" : "#081642") },
        uMid: { value: dev ? new THREE.Color("#6b0d1c") : COBALT },
        uHigh: { value: dev ? RED : CERULEAN },
        uTop: { value: new THREE.Color(dev ? "#ffd6da" : "#c8f1ff") },
        uDim: DIM,
        uContour: { value: dev ? 1 : 0 },
        uPulseAge: PULSE_AGE,
      },
      vertexShader: /* glsl */ `
        ${surfaceGlsl}
        ${landGlsl}
        uniform float uPulseAge;
        // Onda da batida (dev mode): anel que se abre do centro do relevo
        float shock(vec2 p) {
          float ring = uPulseAge * 1.5;
          return 0.07 * exp(-pow((length(p) - ring) * 6.0, 2.0)) * exp(-uPulseAge * 1.3);
        }
        varying float vH;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vec2 p = position.xz;
          float h = heightAt(p) + shock(p);
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
        uniform float uContour;
        varying float vH;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          float h = clamp(vH, 0.0, 1.0);
          vec3 color = mix(uLow, uMid, smoothstep(0.0, 0.35, h));
          color = mix(color, uHigh, smoothstep(0.3, 0.7, h));
          color = mix(color, uTop, smoothstep(0.7, 1.0, h));
          // Curvas de nível (dev mode): linhas finas a cada 1/14 da altura
          float level = abs(fract(vH * 14.0) - 0.5);
          color += uTop * uContour * smoothstep(0.06, 0.0, level) * 0.6;
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
      uniforms: { ...morph, uColor: { value: dev ? new THREE.Color("#ff9aa4") : ICE }, uDim: DIM, uPulseAge: PULSE_AGE },
      vertexShader: /* glsl */ `
        ${surfaceGlsl}
        ${landGlsl}
        uniform float uPulseAge;
        // Onda da batida (dev mode): anel que se abre do centro do relevo
        float shock(vec2 p) {
          float ring = uPulseAge * 1.5;
          return 0.07 * exp(-pow((length(p) - ring) * 6.0, 2.0)) * exp(-uPulseAge * 1.3);
        }
        varying float vH;
        void main() {
          float h = heightAt(position.xz) + shock(position.xz);
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

  // Dev mode: campo de gradiente, uma seta por ponto de uma grade apontando para a descida
  const ARROWS = 11;
  const arrows = dev
    ? new THREE.InstancedMesh(
        new THREE.ConeGeometry(0.03, 0.16, 8).rotateX(Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff6b76"), transparent: true, opacity: 0.85 }),
        ARROWS * ARROWS,
      )
    : null;
  if (arrows) group.add(arrows);
  const arrowMatrix = new THREE.Matrix4();
  const arrowPos = new THREE.Vector3();
  const arrowDir = new THREE.Vector3();
  const arrowQuat = new THREE.Quaternion();
  const FORWARD = new THREE.Vector3(0, 0, 1);
  const ONE = new THREE.Vector3(1, 1, 1);

  // Bola de luz (o otimizador) com brilho e rastro
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 12), new THREE.MeshBasicMaterial({ color: dev ? RED : ICE }));
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
  // Descida do gradiente com momento (dev mode): posição e velocidade no domínio [-1, 1]²
  const descent = { x: 0.8, z: 0.6, vx: 0, vz: 0, cycle: -1 };
  const heightOf = (a: number, b: number, mix: number, x: number, z: number) =>
    THREE.MathUtils.lerp(surface(a, x, z), surface(b, x, z), mix);
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

      let x: number;
      let z: number;
      if (dev) {
        // Cada função recomeça de um ponto da borda e desce pelo gradiente (com momento)
        if (descent.cycle !== cycle) {
          const start = Math.random() * Math.PI * 2;
          Object.assign(descent, { x: Math.cos(start) * 0.85, z: Math.sin(start) * 0.85, vx: 0, vz: 0, cycle });
        }
        const step = Math.min(Math.max(t - lastT, 0), 0.05);
        const e = 0.01;
        const gx = (heightOf(a, b, mix, descent.x + e, descent.z) - heightOf(a, b, mix, descent.x - e, descent.z)) / (2 * e);
        const gz = (heightOf(a, b, mix, descent.x, descent.z + e) - heightOf(a, b, mix, descent.x, descent.z - e)) / (2 * e);
        descent.vx = (descent.vx - gx * 0.9 * step) * Math.exp(-step * 2.2);
        descent.vz = (descent.vz - gz * 0.9 * step) * Math.exp(-step * 2.2);
        descent.x = THREE.MathUtils.clamp(descent.x + descent.vx * step, -0.95, 0.95);
        descent.z = THREE.MathUtils.clamp(descent.z + descent.vz * step, -0.95, 0.95);
        x = descent.x;
        z = descent.z;
        // Setas do campo: posição no relevo, apontando para −∇f
        if (arrows) {
          let i = 0;
          for (let ix = 0; ix < ARROWS; ix++)
            for (let iz = 0; iz < ARROWS; iz++) {
              const px = (ix / (ARROWS - 1)) * 1.8 - 0.9;
              const pz = (iz / (ARROWS - 1)) * 1.8 - 0.9;
              const h0 = heightOf(a, b, mix, px, pz);
              const dx = heightOf(a, b, mix, px + e, pz) - heightOf(a, b, mix, px - e, pz);
              const dz = heightOf(a, b, mix, px, pz + e) - heightOf(a, b, mix, px, pz - e);
              arrowPos.set(px * LAND_HALF, h0 * LAND_HEIGHT - 0.9 + 0.1, pz * LAND_HALF);
              arrowDir.set(-dx * LAND_HALF, -(dx * dx + dz * dz) * LAND_HEIGHT * 20, -dz * LAND_HALF).normalize();
              arrowQuat.setFromUnitVectors(FORWARD, arrowDir);
              arrows.setMatrixAt(i++, arrowMatrix.compose(arrowPos, arrowQuat, ONE));
            }
          arrows.instanceMatrix.needsUpdate = true;
        }
      } else {
        // Percorre o relevo numa órbita que abre e fecha devagar, subindo e descendo as montanhas
        const r = 0.45 + 0.3 * Math.sin(t * 0.23);
        const angle = t * 0.9;
        x = Math.cos(angle) * r;
        z = Math.sin(angle) * r;
      }
      const h = heightOf(a, b, mix, x, z);
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
        color.copy(dev ? RED : CERULEAN).multiplyScalar(0.55 * (1 - i / TRAIL));
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
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isSmall, alpha: true, powerPreference: "high-performance" });
  let dpr = Math.min(devicePixelRatio, isSmall ? 1.25 : 1.75);
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
  const normal: Station[] = [makeCode(), makeLandscape(), makeNetwork(shared), makeStack(shared), makeEditor()];
  // Dev mode: versões técnicas nas mesmas estações (∇, descida do gradiente, backpropagation,
  // arquitetura de sistema, multiplicação de matrizes)
  const technical: Station[] = [makeNabla(), makeLandscape(true), makeNetwork(shared, true), makeSystem(shared), makeMatmul()];
  const depthOf = [-80, -20, 0, -60, -40];
  [normal, technical].forEach((set) =>
    set.forEach((station, i) => {
      station.group.position.set(0, 0, depthOf[i]!);
      station.group.visible = false;
      scene.add(station.group);
    }),
  );
  const devWindow = window as unknown as { __devOn?: boolean; __devPulse?: { level: number; age: number } };
  let stations = devWindow.__devOn ? technical : normal;
  // A troca acontece com a tela coberta pela bolha: basta esconder o conjunto anterior
  addEventListener("dev:change", (e) => {
    const on = (e as CustomEvent<{ on: boolean }>).detail.on;
    (on ? normal : technical).forEach((station) => (station.group.visible = false));
    stations = on ? technical : normal;
    dustUniforms.uColor.value = on ? DEV_DUST : ICE;
    smokePalette = on ? redPalette : bluePalette;
    keyLight.color.copy(on ? RED : CERULEAN);
    rimLight.color.copy(on ? BLOOD : COBALT);
  });

  // Poeira de luz subindo ao fundo: pontinhos ancorados no mundo (ganham paralaxe na viagem)
  // que dão a volta numa caixa ao redor da câmera. Subida e volta calculadas no shader: nada
  // é reenviado para a GPU a cada quadro.
  const DUST = isSmall ? 1100 : 3600;
  const dustPositions = new Float32Array(DUST * 3);
  const dustSpeed = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    dustPositions.set([rand(-9, 9), rand(-6, 6), rand(-18, 4)], i * 3);
    dustSpeed[i] = rand(0.08, 0.3);
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  dustGeometry.setAttribute("aSpeed", new THREE.BufferAttribute(dustSpeed, 1));
  const DEV_DUST = new THREE.Color("#ffb0b6");
  const dustUniforms = {
    uPixelRatio: { value: dpr },
    uColor: { value: devWindow.__devOn ? DEV_DUST : ICE },
    uTime: shared.uTime,
    uCamera: { value: new THREE.Vector3() },
  };
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.ShaderMaterial({
      uniforms: dustUniforms,
      vertexShader: /* glsl */ `
        uniform float uPixelRatio;
        uniform float uTime;
        uniform vec3 uCamera;
        attribute float aSpeed;
        varying float vAlpha;
        void main() {
          // Caixa de 18 × 12 × 22 ao redor da câmera; o que sai por um lado volta pelo outro
          vec3 boxMin = vec3(-9.0, -6.0, -18.0);
          vec3 boxSize = vec3(18.0, 12.0, 22.0);
          vec3 p = position + vec3(0.0, uTime * aSpeed, 0.0);
          vec3 rel = mod(p - uCamera - boxMin, boxSize) + boxMin;
          vec4 mv = viewMatrix * vec4(uCamera + rel, 1.0);
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
  const bluePalette = ["#1f45e0", "#2f7bff", "#16b4ff", "#3a5cff"].map((hex) => new THREE.Color(hex));
  const redPalette = ["#b3101f", "#ff2b3a", "#d4142a", "#ff5a66"].map((hex) => new THREE.Color(hex));
  let smokePalette = devWindow.__devOn ? redPalette : bluePalette;
  const smokeIce = new THREE.Color("#c8ecff");
  const smokeColor = new THREE.Color();
  const splatColor = new THREE.Color();
  const parallax = new THREE.Vector2();
  let smokeIdle = 0;

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

  // Pré-compila os shaders de todos os objetos (inclusive os do dev mode, ainda escondidos):
  // sem isso, cada objeto trava a página por um instante na primeira vez que aparece
  const hidden = [...normal, ...technical].filter((station) => !station.group.visible);
  hidden.forEach((station) => (station.group.visible = true));
  renderer.compile(scene, camera);
  hidden.forEach((station) => (station.group.visible = false));

  const timer = new THREE.Timer();
  let running = true;
  let ready = false;
  let lastScroll = scrollY;
  let speedZoom = 0;
  // Medição de FPS nos primeiros segundos: abaixo de ~45, simplifica o vidro
  let sampleFrames = 0;
  let sampleTime = 0;
  let qualityChecked = isSmall;
  // Monitores de 120/144 Hz: renderiza no máximo ~60 vezes por segundo (metade do trabalho)
  let lastFrame = 0;
  let lowRes = false;
  function frame(now: number) {
    if (!running) return;
    if (now - lastFrame < 1000 / 62) {
      requestAnimationFrame(frame);
      return;
    }
    lastFrame = now;
    timer.update(now);
    const rawDt = timer.getDelta();
    const dt = Math.min(rawDt, 0.05);
    const t = timer.getElapsed();
    const ease = 1 - Math.pow(0.001, dt); // aproximação exponencial independente de FPS

    if (!qualityChecked && t > 1.5) {
      sampleFrames++;
      sampleTime += rawDt;
      if (sampleTime > 2.5) {
        const fps = sampleFrames / sampleTime;
        if (fps < 45) setLowQuality();
        // Ainda lento depois de simplificar o vidro: mede de novo e, se preciso, reduz a resolução
        if (fps < 45 && !lowRes) {
          lowRes = fps < 30;
          if (lowRes) {
            dpr = 1;
            renderer.setPixelRatio(dpr);
            dustUniforms.uPixelRatio.value = dpr;
            resize();
          }
        }
        qualityChecked = true;
      }
    }

    if (!reduceMotion) {
      shared.uTime.value = t;
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
      // Só anima o que aparece: as estações fora de vista não custam nada
      if (station.group.visible && !reduceMotion) station.update?.(t);
    });
    // Batida do dev mode: a cena acende de leve e a câmera sente o impacto
    const pulse = devWindow.__devPulse;
    PULSE.value = pulse?.level ?? 0;
    PULSE_AGE.value = pulse?.age ?? 99;
    renderer.toneMappingExposure = 0.55 + 0.55 * state.dim + PULSE.value * 0.15;
    DIM.value = Math.min(1, state.dim + PULSE.value * 0.15);

    // Rolar rápido aproxima um pouco a câmera; o cursor dá uma leve paralaxe
    const scrollSpeed = Math.abs(scrollY - lastScroll) / Math.max(dt, 1e-3) / innerHeight;
    lastScroll = scrollY;
    speedZoom += (Math.min(scrollSpeed * 0.25, 1) - speedZoom) * ease * 0.15;
    parallax.x += ((pointer.x - 0.5) * 2 - parallax.x) * ease * 0.3;
    parallax.y += ((pointer.y - 0.5) * 2 - parallax.y) * ease * 0.3;
    const kick = reduceMotion ? 0 : PULSE.value * 0.12;
    camera.position.set(camPos.x + parallax.x * 0.35, camPos.y + parallax.y * 0.25, camPos.z - speedZoom * 0.8 - kick);
    camera.lookAt(look);

    dustUniforms.uCamera.value.copy(camera.position);

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
          smokeIdle = 0;
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
      // Sem movimento por 5 s a fumaça já se dissipou: para de simular até o cursor mexer
      smokeIdle += dt;
      if (smokeIdle < 5) {
        fluid.step(Math.min(dt, 1 / 60));
        smokeRenderer!.setRenderTarget(null);
        smokeRenderer!.clear();
        fluid.render();
      }
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
