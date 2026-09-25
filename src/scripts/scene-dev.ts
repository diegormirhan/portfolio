/*
 * Versões técnicas dos objetos para o dev mode (substituem as normais nas mesmas estações):
 *   0  ∇            nabla extrudado em vidro vermelho, com símbolos matemáticos orbitando
 *   2  Gargantua    buraco negro de Interstellar: sombra, disco de acreção, lente e anel de fótons
 *   4  matmul       multiplicação de matrizes: A × B = C, linha e coluna varridas em vermelho
 * (A descida do gradiente fica em scene.ts, como variante da superfície.)
 * Todos pulsam na batida do dev mode (PULSE).
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

import { BLOOD, DIM, ICE, IDENTITY, PULSE, RED, glass, type Shared, type Station } from "./scene-kit";

/** Texto como sprite (rótulos e símbolos), desenhado num canvas. */
function label(text: string, color: string, height = 0.28, weight = 600) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const font = `${weight} 96px "JetBrains Mono Variable", ui-monospace, monospace`;
  ctx.font = font;
  canvas.width = Math.ceil(ctx.measureText(text).width) + 24;
  canvas.height = 128;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 12, 68);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set((height * canvas.width) / canvas.height, height, 1);
  return sprite;
}

function redGlass() {
  return glass("#ffb3b9", { attenuationColor: new THREE.Color("#8a0f1e"), attenuationDistance: 1.2 });
}

export function makeNabla(): Station {
  // ∇: triângulo invertido vazado, extrudado com bisel; símbolos giram ao redor
  const group = new THREE.Group();
  const outer = [new THREE.Vector2(-1.35, 1.05), new THREE.Vector2(1.35, 1.05), new THREE.Vector2(0, -1.25)];
  const center = new THREE.Vector2(0, 0.28);
  const inner = outer.map((p) => p.clone().sub(center).multiplyScalar(0.55).add(center));
  const shape = new THREE.Shape(outer);
  shape.holes.push(new THREE.Path([...inner].reverse()));
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.45,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.08,
    bevelSegments: 4,
  });
  geometry.center();
  const nabla = new THREE.Mesh(geometry, redGlass());
  group.add(nabla);

  const symbols = ["∂", "Σ", "λ", "θ", "∫", "π", "η", "ε"].map((s, i) =>
    label(s, i % 2 ? "#ff6b76" : "#ffc2c7", 0.5, 400),
  );
  const orbit = new THREE.Group();
  symbols.forEach((sprite, i) => {
    const a = (i / symbols.length) * Math.PI * 2;
    sprite.position.set(Math.cos(a) * 2.3, Math.sin(a * 2) * 0.35, Math.sin(a) * 2.3);
    orbit.add(sprite);
  });
  group.add(orbit);

  return {
    group,
    update: (t) => {
      nabla.rotation.y = Math.sin(t * 0.5) * 0.5;
      nabla.rotation.x = Math.sin(t * 0.3) * 0.15;
      nabla.scale.setScalar(1 + PULSE.value * 0.08);
      orbit.rotation.y = t * 0.25;
    },
  };
}

export function makeMatmul(): Station {
  // C = A · B: A (4×5) à esquerda, B (5×4) acima, C (4×4) embaixo à direita. A linha i de A e a
  // coluna j de B acendem em vermelho, e a célula C[i][j] se preenche; depois a próxima.
  const group = new THREE.Group();
  const inner = new THREE.Group(); // as três matrizes, centradas na estação
  inner.position.set(-0.7, -0.25, 0);
  inner.scale.setScalar(0.72);
  group.add(inner);
  const N = 4;
  const K = 5;
  const GAP = 0.3;
  const cube = new RoundedBoxGeometry(0.22, 0.22, 0.22, 2, 0.04);
  const count = N * K * 2 + N * N;
  const cells = new THREE.InstancedMesh(cube, new THREE.MeshBasicMaterial(), count);
  type Cell = { kind: "A" | "B" | "C"; r: number; c: number; pos: THREE.Vector3 };
  const list: Cell[] = [];
  const cx = 0.6; // canto de C
  const cy = -0.2;
  for (let r = 0; r < N; r++)
    for (let c = 0; c < K; c++) list.push({ kind: "A", r, c, pos: new THREE.Vector3(cx - (K - c) * GAP - 0.25, cy - r * GAP, 0) });
  for (let r = 0; r < K; r++)
    for (let c = 0; c < N; c++) list.push({ kind: "B", r, c, pos: new THREE.Vector3(cx + c * GAP, cy + (K - r) * GAP + 0.25, 0) });
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) list.push({ kind: "C", r, c, pos: new THREE.Vector3(cx + c * GAP, cy - r * GAP, 0) });
  const m = new THREE.Matrix4();
  const size = new THREE.Vector3();
  list.forEach((cell, i) => cells.setMatrixAt(i, m.makeTranslation(cell.pos)));
  cells.setColorAt(0, BLOOD);
  inner.add(cells);

  const a = label("A", "#ffc2c7", 0.34);
  a.position.set(cx - K * GAP * 0.5 - 0.3, cy + 0.45, 0);
  const b = label("B", "#ffc2c7", 0.34);
  b.position.set(cx - 0.55, cy + K * GAP * 0.5 + 0.35, 0);
  const c = label("A·B", "#ff6b76", 0.3);
  c.position.set(cx + N * GAP * 0.5 - 0.15, cy - N * GAP - 0.1, 0);
  inner.add(a, b, c);

  const color = new THREE.Color();
  const dim = new THREE.Color().copy(BLOOD).multiplyScalar(0.6);
  return {
    group,
    update: (t) => {
      inner.rotation.y = -0.5 + Math.sin(t * 0.25) * 0.2;
      inner.rotation.x = 0.2;
      const step = Math.floor(t * 2.2) % (N * N);
      const ri = Math.floor(step / N);
      const cj = step % N;
      const within = (t * 2.2) % 1;
      const beat = PULSE.value;
      list.forEach((cell, i) => {
        let glow = 0;
        const active = (cell.kind === "A" && cell.r === ri) || (cell.kind === "B" && cell.c === cj);
        if (active) {
          color.copy(RED);
          glow = 1;
        } else if (cell.kind === "C") {
          // Já calculadas: vermelho escuro; a atual: vermelho clareando; as próximas: apagadas
          const index = cell.r * N + cell.c;
          if (index < step) color.copy(RED).lerp(BLOOD, 0.45);
          else if (index === step) {
            color.copy(RED).lerp(ICE, within);
            glow = within;
          } else color.copy(dim).multiplyScalar(0.5);
        } else color.copy(dim);
        cells.setColorAt(i, color.multiplyScalar(1 + beat * 0.5));
        cells.setMatrixAt(i, m.compose(cell.pos, IDENTITY, size.setScalar(1 + glow * 0.15 + beat * 0.1)));
      });
      cells.instanceColor!.needsUpdate = true;
      cells.instanceMatrix.needsUpdate = true;
    },
  };
}

/* ---------- Gargantua (Interstellar) ---------- */

/**
 * Buraco negro com disco de acreção, como o Gargantua de Interstellar, por traçado de raios:
 * cada pixel lança um raio de luz que é curvado pela gravidade (Schwarzschild) passo a passo.
 * O raio que cai no horizonte vira a sombra; o que cruza o disco pega a cor dele; e como os
 * raios dão a volta no buraco, a parte de trás do disco aparece dobrada por cima e por baixo
 * da sombra (o arco do filme), junto com o anel de fótons fino na borda.
 * Só um quadrado voltado para a câmera, do tamanho do objeto: o resto da tela não paga nada.
 * Unidades do shader: raio de Schwarzschild = 1.
 */
export function makeGargantua(shared: Shared): Station {
  const group = new THREE.Group();
  const RS = 0.27; // raio de Schwarzschild em unidades do mundo (sombra aparente ≈ 2,6 RS)
  const BOUND = 13; // esfera (em RS) que contém o disco: fora dela o raio segue reto
  const tilt = new THREE.Group();
  tilt.rotation.set(0.055, 0, 0.2); // câmera um pouco acima do disco, que sobe para a direita (como no filme)
  group.add(tilt);

  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: { uTime: shared.uTime, uDim: DIM, uPulse: PULSE, uRs: { value: RS }, uBound: { value: BOUND } },
      vertexShader: /* glsl */ `
        uniform float uRs, uBound;
        varying vec3 vRo;
        varying vec3 vRd;
        void main() {
          // Quadrado voltado para a câmera, centrado no buraco
          vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float s = length(modelViewMatrix[0].xyz);
          vec3 viewPos = c.xyz + vec3(position.xy * uBound * uRs * s, 0.0);
          gl_Position = projectionMatrix * vec4(viewPos, 1.0);
          // Câmera e ponto do quadrado no espaço do buraco (disco no plano y = 0), em RS.
          // A direção é linear no quadrado: interpolada, continua exata.
          mat3 toLocal = transpose(mat3(modelViewMatrix) / s);
          vRo = toLocal * (-c.xyz) / (s * uRs);
          vRd = toLocal * (viewPos - c.xyz) / (s * uRs) - vRo;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime, uDim, uPulse, uBound;
        varying vec3 vRo;
        varying vec3 vRd;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
        }
        float fbm(vec2 p) { return noise(p) * 0.5 + noise(p * 2.1) * 0.3 + noise(p * 4.3) * 0.2; }

        const float R_IN = 2.6;
        const float R_OUT = 11.0;

        // Disco: gás quente (branco no centro, vermelho para fora), em faixas finas
        // que giram mais rápido perto do buraco; o lado que vem para nós brilha mais
        vec4 disk(vec3 p) {
          float r = length(p.xz);
          float t = (r - R_IN) / (R_OUT - R_IN);
          float a = atan(p.z, p.x) + uTime * 1.4 / pow(r / R_IN, 1.5);
          vec2 q = vec2(cos(a), sin(a)) * r;
          // Poeira fibrosa esticada pela rotação (ruído alongado ao longo da órbita)
          float grain = fbm(vec2(r * 2.2, 0.0) + q * 0.35);
          float fibers = 0.8 + 0.2 * sin(r * 5.0 + grain * 7.0);
          float heat = pow(1.0 - t, 1.6) * smoothstep(0.0, 0.025, t);
          float doppler = 1.0 + 0.4 * (p.x / r);
          float i = heat * fibers * mix(0.6, 1.25, grain) * doppler * (1.0 + uPulse * 0.5);
          // Tons do dev mode: vermelho profundo → vermelho alaranjado → branco quente no centro
          vec3 col = mix(vec3(0.55, 0.04, 0.06), vec3(1.0, 0.28, 0.2), smoothstep(0.08, 0.45, i));
          col = mix(col, vec3(1.0, 0.88, 0.84), smoothstep(0.55, 1.05, i));
          float alpha = clamp(i * 1.8, 0.0, 0.95) * smoothstep(1.0, 0.75, t);
          return vec4(col * i * 3.2, alpha);
        }

        void main() {
          vec3 dir = normalize(vRd);
          vec3 pos = vRo;
          // Leva o raio (reto, sem gravidade relevante) até a esfera que contém tudo
          float b = dot(pos, dir);
          float h = b * b - dot(pos, pos) + uBound * uBound;
          if (h < 0.0) discard;
          pos += dir * max(0.0, -b - sqrt(h));

          vec3 vel = dir;
          vec3 L = cross(pos, vel);
          float h2 = dot(L, L);
          vec3 col = vec3(0.0);
          float alpha = 0.0;
          float rMin = 1e3;
          for (int i = 0; i < 150; i++) {
            float r = length(pos);
            rMin = min(rMin, r);
            if (r < 1.0) { alpha = 1.0; break; } // caiu no horizonte: sombra
            if (r > uBound + 0.5 && dot(pos, vel) > 0.0) break; // escapou
            // Passos curtos perto do buraco, onde a curva é forte
            float dt = clamp(0.07 * (r - 0.9) * r, 0.02, 0.9);
            vec3 prev = pos;
            vel += -1.5 * h2 * pos / pow(r, 5.0) * dt;
            pos += vel * dt;
            if (prev.y * pos.y < 0.0) {
              vec3 hit = mix(prev, pos, prev.y / (prev.y - pos.y));
              float rr = length(hit.xz);
              if (rr > R_IN && rr < R_OUT) {
                vec4 d = disk(hit);
                col += (1.0 - alpha) * d.rgb;
                alpha += (1.0 - alpha) * d.a;
              }
            }
            if (alpha > 0.97) break;
          }
          // Brilho difuso em volta da sombra (o "bloom" do filme): raios que raspam o buraco
          if (alpha < 1.0) col += (1.0 - alpha) * vec3(1.0, 0.22, 0.2) * 0.22 * exp(-(rMin - 1.5) * 0.55) * (1.0 + uPulse * 0.6);
          // Estoura para branco com suavidade em vez de saturar
          col = (1.0 - exp(-col * 1.4)) * uDim;
          // Pré-multiplicado: a sombra tapa o fundo; o gás soma luz
          gl_FragColor = vec4(col, max(alpha, min(1.0, max(col.r, max(col.g, col.b)))));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    }),
  );
  quad.frustumCulled = false;
  tilt.add(quad);

  return {
    group,
    update: (t) => {
      // Oscila bem devagar: a lente muda de forma conforme o ângulo, como numa câmera orbitando
      tilt.rotation.x = 0.055 + Math.sin(t * 0.21) * 0.012;
      group.rotation.y = Math.sin(t * 0.13) * 0.12;
    },
  };
}
