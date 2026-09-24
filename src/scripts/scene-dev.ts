/*
 * Versões técnicas dos objetos para o dev mode (substituem as normais nas mesmas estações):
 *   0  ∇            nabla extrudado em vidro vermelho, com símbolos matemáticos orbitando
 *   3  sistema      arquitetura de serviços (cliente → API → fila → workers → vetores / LLM)
 *                   com pacotes de luz trafegando pelas conexões
 *   4  matmul       multiplicação de matrizes: A × B = C, linha e coluna varridas em vermelho
 * (A rede neural com backpropagation e a descida do gradiente ficam em scene.ts, como variantes.)
 * Todos pulsam na batida do dev mode (PULSE).
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

import { BLOOD, ICE, IDENTITY, PULSE, RED, glass, pulseTubes, tubes, type Shared, type Station } from "./scene-kit";

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

export function makeSystem(shared: Shared): Station {
  // Arquitetura de um sistema de IA local: cada caixa é um serviço; os pulsos são requisições
  const group = new THREE.Group();
  const inner = new THREE.Group(); // o diagrama inteiro, reduzido para caber ao lado do texto
  inner.scale.setScalar(0.62);
  group.add(inner);
  const services: [string, number, number, number][] = [
    ["client", -2.7, 0.5, 0],
    ["api", -1.35, 0, 0.1],
    ["queue", 0, 0.95, -0.3],
    ["cache", 0, -0.95, 0.3],
    ["worker", 1.3, 1.25, 0],
    ["worker", 1.3, 0.2, 0.2],
    ["worker", 1.3, -0.85, -0.1],
    ["vectors", 2.7, 0.8, -0.2],
    ["llm", 2.7, -0.55, 0.2],
  ];
  const at = services.map(([, x, y, z]) => new THREE.Vector3(x, y, z));
  const box = new RoundedBoxGeometry(0.72, 0.42, 0.42, 4, 0.06);
  const edgesGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.76, 0.46, 0.46));
  const material = redGlass();
  const wire = new THREE.LineBasicMaterial({ color: RED, transparent: true, opacity: 0.8 });
  const boxes = services.map(([name], i) => {
    const node = new THREE.Group();
    node.add(new THREE.Mesh(box, material), new THREE.LineSegments(edgesGeometry, wire));
    const tag = label(name, "#ffd6da", 0.2, 500);
    tag.position.set(0, 0.42, 0);
    node.add(tag);
    node.position.copy(at[i]!);
    inner.add(node);
    return node;
  });

  // Conexões por etapa: a fase do pulso segue a ordem da requisição
  const link = (a: number, b: number, stage: number): [THREE.Vector3, THREE.Vector3, number] => [at[a]!, at[b]!, stage * 0.2];
  const edges = [
    link(0, 1, 0),
    link(1, 2, 1),
    link(1, 3, 1),
    link(2, 4, 2),
    link(2, 5, 2),
    link(2, 6, 2),
    link(4, 7, 3),
    link(5, 7, 3),
    link(5, 8, 3),
    link(6, 8, 3),
  ];
  inner.add(pulseTubes(tubes(edges, 0.012), shared, 0.32, 0.16, 0.2, RED, 2.7, BLOOD));

  return {
    group,
    update: (t) => {
      group.rotation.y = -0.35 + Math.sin(t * 0.2) * 0.25;
      group.rotation.x = 0.18;
      boxes.forEach((node, i) => {
        node.position.y = at[i]!.y + Math.sin(t * 0.8 + i) * 0.05;
        node.scale.setScalar(1 + PULSE.value * 0.1);
      });
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
