/*
 * Objetos de hardware da cena:
 *   3  placa-mãe    (dev mode) cubo de circuitos vermelhos sobre uma placa escura, trilhas com
 *                  pulsos rápidos, LEDs piscando e um anel de varredura
 *   4  chip de IA   chip "AI" com feixes de cabos saindo pelos quatro lados, brilhos correndo
 *   5  computador quântico  o "lustre" de refrigeração com esfera de Bloch no qubit; aço azulado
 *                  no modo normal, cobre e vermelho no dev mode
 * Metais com o mapa de ambiente da cena; brilhos e pulsos no mesmo estilo aditivo do resto.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import { BLOOD, CERULEAN, COBALT, ICE, IDENTITY, PULSE, RED, glowSprites, pulseTubes, rand, type Shared, type Station } from "./scene-kit";

/** Tubos ao longo de curvas quaisquer, com a fase do pulso por tubo (uv.x corre ao longo). */
function curvedTubes(paths: { curve: THREE.Curve<THREE.Vector3>; phase: number }[], radius: number, segments = 40) {
  return mergeGeometries(
    paths.map(({ curve, phase }) => {
      const geometry = new THREE.TubeGeometry(curve, segments, radius, 4, false);
      geometry.setAttribute(
        "aPhase",
        new THREE.BufferAttribute(new Float32Array(geometry.attributes.position!.count).fill(phase), 1),
      );
      return geometry;
    }),
  )!;
}

/** Textura desenhada num canvas. */
function canvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D, size: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  draw(canvas.getContext("2d")!, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

const metal = (color: string, roughness = 0.3, metalness = 0.9) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

/* ---------- Chip de IA com cabos ---------- */

export function makeAiChip(shared: Shared): Station {
  const group = new THREE.Group();
  const board = new THREE.Group();
  board.rotation.x = 0.95; // o topo do chip virado para a câmera
  group.add(board);

  // Encapsulamento escuro com a borda em "degraus" de blocos, como na referência
  board.add(new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.14, 1.5, 3, 0.03), metal("#101a3a", 0.35)));
  const blocks: THREE.Vector3[] = [];
  for (let ring = 0; ring < 2; ring++) {
    const half = 0.8 + ring * 0.1;
    for (let k = -8; k <= 8; k++) {
      if (Math.random() < 0.25 + ring * 0.3) continue;
      const u = (k / 8) * half;
      blocks.push(new THREE.Vector3(u, 0, half), new THREE.Vector3(u, 0, -half), new THREE.Vector3(half, 0, u), new THREE.Vector3(-half, 0, u));
    }
  }
  const bits = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), metal("#ffffff", 0.35), blocks.length);
  const m = new THREE.Matrix4();
  const size = new THREE.Vector3();
  const bitTone = new THREE.Color();
  blocks.forEach((p, i) => {
    bits.setMatrixAt(i, m.compose(p, IDENTITY, size.set(1, rand(0.4, 1.3), 1)));
    // Blocos em tons de azul, alguns acesos em cerúleo
    bits.setColorAt(i, Math.random() < 0.2 ? bitTone.copy(CERULEAN) : bitTone.set("#1d2d63").lerp(COBALT, Math.random() * 0.4));
  });
  board.add(bits);

  // Moldura interna acesa e o die com "AI" em relevo prateado
  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1.14, 0.02, 1.14)),
    new THREE.LineBasicMaterial({ color: CERULEAN, transparent: true, blending: THREE.AdditiveBlending }),
  );
  frame.position.y = 0.09;
  board.add(frame);
  const face = canvasTexture(512, (ctx, s) => {
    const bg = ctx.createLinearGradient(0, 0, s, s);
    bg.addColorStop(0, "#3b5bb0");
    bg.addColorStop(1, "#0b1330");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 6;
    ctx.strokeRect(22, 22, s - 44, s - 44);
    ctx.font = `800 ${s * 0.5}px "Bricolage Grotesque Variable", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const text = ctx.createLinearGradient(0, s * 0.25, 0, s * 0.75);
    text.addColorStop(0, "#ffffff");
    text.addColorStop(1, "#7fd0ff");
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = text;
    ctx.fillText("AI", s / 2, s * 0.53);
  });
  const dieMaterial = new THREE.MeshStandardMaterial({ color: "#ffffff", map: face, roughness: 0.25, metalness: 0.7 });
  const side = metal("#1f3470");
  const die = new THREE.Mesh(new RoundedBoxGeometry(0.98, 0.1, 0.98, 2, 0.02), [side, side, dieMaterial, side, side, side]);
  die.position.y = 0.11;
  board.add(die);

  // Feixes de cabos: saem dos quatro lados, se abrem em leque e se curvam para longe
  const paths: { curve: THREE.Curve<THREE.Vector3>; phase: number }[] = [];
  const sides = [
    [new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0)],
    [new THREE.Vector3(0, 0, -1), new THREE.Vector3(1, 0, 0)],
    [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1)],
    [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 1)],
  ] as const;
  const v = (n: THREE.Vector3, tg: THREE.Vector3, along: number, across: number, up: number) =>
    n.clone().multiplyScalar(along).addScaledVector(tg, across).setY(up);
  for (const [n, tg] of sides)
    for (let bundle = 0; bundle < 7; bundle++) {
      const base = rand(-0.6, 0.6);
      const swing = rand(-1.4, 1.4);
      const lift = rand(-0.9, 0.5);
      const reach = rand(2.4, 3.6);
      const cables = 3 + ((Math.random() * 4) | 0);
      for (let c = 0; c < cables; c++) {
        const spread = (c - cables / 2) * 0.05;
        const points = [
          v(n, tg, 0.78, base + spread * 0.3, 0.02),
          v(n, tg, 1.1, base + spread * 0.6, -0.04),
          v(n, tg, 1.7, base + swing * 0.35 + spread * 1.5, lift * 0.4 + spread),
          v(n, tg, reach * 0.8, base + swing * 0.8 + spread * 3, lift + spread * 2),
          v(n, tg, reach, base + swing + rand(-0.4, 0.4) + spread * 4, lift * 1.3 + rand(-0.3, 0.3)),
        ];
        paths.push({ curve: new THREE.CatmullRomCurve3(points), phase: Math.random() });
      }
    }
  const cables = pulseTubes(curvedTubes(paths, 0.012), shared, 0.28, 0.42, 0.5, CERULEAN, 3, COBALT);
  board.add(cables);
  // Brilho cobalto por baixo do chip
  const halo = glowSprites(1, 3.2);
  halo.positions.set([0, -0.1, 0]);
  halo.colors.set(COBALT.clone().multiplyScalar(0.55).toArray());
  board.add(halo.points);

  const frameMaterial = frame.material as THREE.LineBasicMaterial;
  return {
    group,
    update: (t) => {
      group.rotation.y = -0.35 + Math.sin(t * 0.17) * 0.25;
      frameMaterial.opacity = 0.55 + 0.45 * Math.sin(t * 2.1) ** 2;
    },
  };
}

/* ---------- Placa-mãe com cubo de circuitos (dev mode) ---------- */

export function makeBoard(shared: Shared): Station {
  const group = new THREE.Group();
  const board = new THREE.Group();
  board.rotation.x = 0.62;
  board.scale.setScalar(0.78);
  group.add(board);
  const W = 5.4;
  const D = 3.6;

  const plate = new THREE.Mesh(new THREE.BoxGeometry(W, 0.06, D), metal("#0c0406", 0.5, 0.5));
  plate.position.y = -0.03;
  board.add(plate);

  // Componentes espalhados: blocos escuros e LEDs que piscam
  const parts: { p: THREE.Vector3; s: THREE.Vector3; light: boolean }[] = [];
  for (let i = 0; i < 170; i++) {
    const x = rand(-W / 2 + 0.15, W / 2 - 0.15);
    const z = rand(-D / 2 + 0.15, D / 2 - 0.15);
    if (Math.abs(x) < 0.8 && Math.abs(z) < 0.8) continue;
    const light = Math.random() < 0.2;
    const s = light ? new THREE.Vector3(0.07, 0.03, 0.07) : new THREE.Vector3(rand(0.08, 0.34), rand(0.03, 0.12), rand(0.06, 0.26));
    parts.push({ p: new THREE.Vector3(x, s.y / 2, z), s, light });
  }
  const box = new THREE.BoxGeometry(1, 1, 1);
  const dark = parts.filter((p) => !p.light);
  const lights = parts.filter((p) => p.light);
  const darkMesh = new THREE.InstancedMesh(box, metal("#2a1216", 0.45, 0.6), dark.length);
  const lightMesh = new THREE.InstancedMesh(box, new THREE.MeshBasicMaterial(), lights.length);
  const m = new THREE.Matrix4();
  dark.forEach((p, i) => darkMesh.setMatrixAt(i, m.compose(p.p, IDENTITY, p.s)));
  lights.forEach((p, i) => lightMesh.setMatrixAt(i, m.compose(p.p, IDENTITY, p.s)));
  const blink = lights.map(() => ({ rate: rand(0.6, 3), phase: rand(0, 6) }));
  board.add(darkMesh, lightMesh);

  // Trilhas em ângulos retos saindo do cubo, com pulsos rápidos correndo para fora
  const paths: { curve: THREE.Curve<THREE.Vector3>; phase: number }[] = [];
  for (let i = 0; i < 80; i++) {
    const side = i % 4;
    const n = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)][side]!;
    const tg = new THREE.Vector3(n.z, 0, n.x);
    const path = new THREE.CurvePath<THREE.Vector3>();
    let at = n.clone().multiplyScalar(0.62).addScaledVector(tg, rand(-0.5, 0.5)).setY(0.012);
    let dir = n.clone();
    const legs = 3 + ((Math.random() * 3) | 0);
    for (let leg = 0; leg < legs; leg++) {
      const next = at.clone().addScaledVector(dir, rand(0.3, 0.9));
      next.x = THREE.MathUtils.clamp(next.x, -W / 2 + 0.1, W / 2 - 0.1);
      next.z = THREE.MathUtils.clamp(next.z, -D / 2 + 0.1, D / 2 - 0.1);
      path.add(new THREE.LineCurve3(at, next));
      at = next;
      // Alterna entre seguir para fora e dobrar a 45°
      dir = leg % 2 ? n.clone() : n.clone().addScaledVector(tg, Math.random() < 0.5 ? 1 : -1).normalize();
    }
    paths.push({ curve: path, phase: Math.random() });
  }
  board.add(pulseTubes(curvedTubes(paths, 0.011, 30), shared, 0.6, 0.38, 0.35, RED, W / 2, RED));

  // Anel de varredura: sai do cubo e se espalha pela placa (mais forte na batida)
  const sweep = new THREE.Mesh(
    new THREE.RingGeometry(0.96, 1, 96).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: RED, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  sweep.position.y = 0.02;
  board.add(sweep);

  // O cubo: circuitos vermelho-rosados que correm pelas faces escuras
  const circuit = canvasTexture(512, (ctx, s) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 90; i++) {
      ctx.strokeStyle = `rgba(255, 190, 196, ${rand(0.35, 1)})`;
      ctx.lineWidth = rand(2, 7);
      const x = rand(0, s);
      const y = rand(0, s);
      ctx.beginPath();
      ctx.moveTo(x, y);
      if (Math.random() < 0.5) ctx.lineTo(x, y + rand(-s / 2, s / 2));
      else ctx.lineTo(x + rand(-s / 2, s / 2), y);
      ctx.stroke();
    }
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = `rgba(255, 120, 130, ${rand(0.15, 0.7)})`;
      ctx.fillRect(rand(0, s), rand(0, s), rand(12, 70), rand(12, 70));
    }
  });
  circuit.wrapS = circuit.wrapT = THREE.RepeatWrapping;
  const cubeMaterial = new THREE.MeshStandardMaterial({
    color: "#12070a",
    emissive: "#ff4d5a",
    emissiveMap: circuit,
    emissiveIntensity: 1,
    roughness: 0.25,
    metalness: 0.6,
  });
  const cube = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.95, 1.1, 2, 0.03), cubeMaterial);
  cube.position.y = 0.48;
  board.add(cube);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1.12, 0.97, 1.12)),
    new THREE.LineBasicMaterial({ color: "#ffd6da", transparent: true, blending: THREE.AdditiveBlending }),
  );
  edges.position.y = 0.48;
  board.add(edges);
  const halo = glowSprites(1, 3);
  halo.positions.set([0, 0.5, 0]);
  board.add(halo.points);

  const glow = new THREE.Color();
  const edgeMaterial = edges.material as THREE.LineBasicMaterial;
  const sweepMaterial = sweep.material as THREE.MeshBasicMaterial;
  return {
    group,
    update: (t) => {
      group.rotation.y = -0.4 + Math.sin(t * 0.22) * 0.3;
      const beat = PULSE.value;
      // Circuitos correndo pelo cubo, que flutua e pulsa
      circuit.offset.set(t * 0.03, -t * 0.12);
      cube.position.y = edges.position.y = 0.48 + Math.sin(t * 1.3) * 0.05;
      cubeMaterial.emissiveIntensity = 0.8 + 0.35 * Math.sin(t * 3.1) ** 2 + beat * 1.2;
      edgeMaterial.opacity = 0.35 + 0.4 * Math.sin(t * 2.4) ** 2 + beat * 0.5;
      halo.colors.set(glow.copy(RED).multiplyScalar(0.4 + beat * 0.8 + 0.15 * Math.sin(t * 3.1) ** 2).toArray());
      halo.geometry.attributes.aColor!.needsUpdate = true;
      // Varredura: um anel a cada 1,6 s
      const k = (t / 1.6) % 1;
      sweep.scale.setScalar(0.7 + k * 3.2);
      sweepMaterial.opacity = (1 - k) * (0.5 + beat * 0.5);
      lights.forEach((_, i) => {
        const b = blink[i]!;
        lightMesh.setColorAt(i, glow.set("#ff9aa4").multiplyScalar(Math.sin(t * b.rate + b.phase) > 0.2 ? 1 : 0.15));
      });
      lightMesh.instanceColor!.needsUpdate = true;
    },
  };
}

/* ---------- Computador quântico ---------- */

/**
 * O "lustre" de refrigeração de um computador quântico, com a paleta do modo:
 * normal = aço azulado com cobalto e cerúleo; dev mode = cobre com vermelho sinal.
 * - andares com borda acesa e anel de parafusos; os andares acendem em sequência, de cima para
 *   baixo, como o frio descendo pelos estágios;
 * - cabos coaxiais de metal com laços entre os andares, e os sinais correndo por eles;
 * - trocadores de calor no eixo central e uma mola;
 * - embaixo, o chip com o qubit aceso dentro de uma esfera de Bloch (o vetor de estado precessa);
 * - partículas geladas descendo pelo miolo.
 */
export function makeQuantum(shared: Shared, dev = false): Station {
  const group = new THREE.Group();
  const rig = new THREE.Group();
  rig.rotation.x = 0.16; // um pouco de cima: dá para ver os andares
  group.add(rig);

  const tone = dev
    ? { plate: "#c9826b", top: "#3a1016", can: "#b8563a", accent: RED, light: new THREE.Color("#ffd6da"), deep: BLOOD }
    : { plate: "#a9bce6", top: "#1c2a55", can: "#8fa6d6", accent: CERULEAN, light: ICE, deep: COBALT };
  const plateMetal = metal(tone.plate, 0.2, 1);
  const silver = metal(dev ? "#d8b8b0" : "#c9d2dc", 0.18, 1);
  const canMetal = metal(tone.can, 0.28, 1);
  const additive = (color: THREE.Color) =>
    new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });

  // Placa do topo, grossa, com cilindros pendurados (as linhas de entrada)
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.08, 0.16, 96), metal(tone.top, 0.3));
  top.position.y = 1.36;
  rig.add(top);
  const topRim = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.022, 10, 128).rotateX(Math.PI / 2), additive(tone.accent));
  topRim.position.y = 1.28;
  rig.add(topRim);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 32), canMetal);
    can.position.set(Math.cos(a) * 0.74, 1.02, Math.sin(a) * 0.74);
    rig.add(can);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.04, 32), silver);
    cap.position.set(can.position.x, 0.77, can.position.z);
    rig.add(cap);
  }

  // Andares: placa, borda acesa e anel de parafusos
  const levels = [
    { y: 1.28, r: 1.0 },
    { y: 0.72, r: 0.95 },
    { y: 0.18, r: 0.84 },
    { y: -0.36, r: 0.72 },
    { y: -0.88, r: 0.6 },
  ];
  const rims: THREE.MeshBasicMaterial[] = [];
  const bolts: THREE.Vector3[] = [];
  levels.slice(1).forEach(({ y, r }) => {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.055, 96), plateMetal);
    plate.position.y = y;
    rig.add(plate);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(r, 0.03, 10, 128).rotateX(Math.PI / 2), plateMetal);
    lip.position.y = y;
    rig.add(lip);
    const rimMaterial = additive(tone.accent);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(r + 0.035, 0.008, 6, 128).rotateX(Math.PI / 2), rimMaterial);
    rim.position.y = y;
    rig.add(rim);
    rims.push(rimMaterial);
    for (let k = 0; k < 28; k++) {
      const a = (k / 28) * Math.PI * 2;
      bolts.push(new THREE.Vector3(Math.cos(a) * r * 0.9, y + 0.035, Math.sin(a) * r * 0.9));
    }
  });
  const boltMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 10), silver, bolts.length);
  const m = new THREE.Matrix4();
  bolts.forEach((p, i) => boltMesh.setMatrixAt(i, m.makeTranslation(p)));
  rig.add(boltMesh);

  // Hastes entre os andares
  const rodGeometry = new THREE.CylinderGeometry(0.018, 0.018, 1, 12);
  for (let l = 0; l < levels.length - 1; l++) {
    const a = levels[l]!;
    const b = levels[l + 1]!;
    const r = Math.min(a.r, b.r) * 0.8;
    for (let k = 0; k < 8; k++) {
      const ang = (k / 8) * Math.PI * 2 + l * 0.2;
      const rod = new THREE.Mesh(rodGeometry, silver);
      rod.scale.y = a.y - b.y;
      rod.position.set(Math.cos(ang) * r, (a.y + b.y) / 2, Math.sin(ang) * r);
      rig.add(rod);
    }
  }

  // Eixo central com trocadores de calor (discos empilhados) e uma mola
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.3, 24), silver);
  shaft.position.y = 0.2;
  rig.add(shaft);
  const fin = new THREE.CylinderGeometry(0.16, 0.16, 0.018, 48);
  for (const center of [0.98, 0.45, -0.62])
    for (let k = 0; k < 6; k++) {
      const disc = new THREE.Mesh(fin, k % 2 ? plateMetal : canMetal);
      disc.position.y = center + (k - 2.5) * 0.035;
      rig.add(disc);
    }
  const helix = new THREE.CatmullRomCurve3(
    Array.from({ length: 80 }, (_, i) => {
      const a = i * 0.55;
      return new THREE.Vector3(Math.cos(a) * 0.11, -0.1 - i * 0.0045, Math.sin(a) * 0.11);
    }),
  );
  rig.add(new THREE.Mesh(new THREE.TubeGeometry(helix, 320, 0.012, 8, false), canMetal));

  // Cabos coaxiais de metal, com laços entre os andares; os sinais correm por cima deles
  const paths: { curve: THREE.Curve<THREE.Vector3>; phase: number }[] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const points: THREE.Vector3[] = [];
    levels.forEach(({ y, r }, l) => {
      const radius = Math.min(r * 0.58, 0.52) * (l % 2 ? 0.86 : 1) + Math.sin(a * 3 + l) * 0.04;
      const ang = a + l * 0.12;
      points.push(new THREE.Vector3(Math.cos(ang) * radius, y - 0.05, Math.sin(ang) * radius));
      const next = levels[l + 1];
      // Laço entre este andar e o próximo: o cabo se afasta do eixo e volta
      if (next) {
        const mid = (y + next.y) / 2;
        const loop = radius + 0.08 + (i % 3) * 0.03;
        points.push(new THREE.Vector3(Math.cos(ang + 0.1) * loop, mid, Math.sin(ang + 0.1) * loop));
      }
    });
    points.push(new THREE.Vector3(Math.cos(a) * 0.14, -1.0, Math.sin(a) * 0.14));
    paths.push({ curve: new THREE.CatmullRomCurve3(points), phase: i / 20 });
  }
  rig.add(new THREE.Mesh(curvedTubes(paths, 0.011, 120), silver));
  rig.add(pulseTubes(curvedTubes(paths, 0.015, 120), shared, 0.3, 0.06, 0.6, tone.light, 1, tone.accent));

  // Base: suporte e o chip do qubit, com fios dourados
  const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.18, 48), plateMetal);
  mount.position.y = -1.05;
  rig.add(mount);
  const chip = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.035, 0.2, 2, 0.008), metal("#1a1f2e", 0.3));
  chip.position.y = -1.16;
  rig.add(chip);

  // Esfera de Bloch em volta do qubit: meridianos, equador e o vetor de estado
  const bloch = new THREE.Group();
  bloch.position.y = -1.34;
  rig.add(bloch);
  const wire = additive(tone.accent);
  wire.opacity = 0.45;
  const ring = new THREE.TorusGeometry(0.2, 0.0035, 6, 96);
  for (let k = 0; k < 3; k++) {
    const meridian = new THREE.Mesh(ring, wire);
    meridian.rotation.y = (k / 3) * Math.PI;
    bloch.add(meridian);
  }
  bloch.add(new THREE.Mesh(ring.clone().rotateX(Math.PI / 2), wire));
  const vector = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 8).translate(0, 0.09, 0), additive(tone.light));
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.04, 12).translate(0, 0.2, 0), additive(tone.light));
  vector.add(stem, tip);
  bloch.add(vector);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.035, 24, 12), additive(tone.light));
  bloch.add(core);
  const halo = glowSprites(1, 1.4);
  bloch.add(halo.points);

  // Partículas geladas descendo pelo miolo
  const FLAKES = 70;
  const flakes = glowSprites(FLAKES, 0.05);
  const seeds = Array.from({ length: FLAKES }, () => ({ a: rand(0, Math.PI * 2), r: rand(0.12, 0.5), y: rand(-1, 1.2), v: rand(0.08, 0.2) }));
  rig.add(flakes.points);

  const glow = new THREE.Color();
  return {
    group,
    update: (t) => {
      rig.rotation.y = t * 0.12;
      group.position.y = Math.sin(t * 0.6) * 0.03;
      const beat = PULSE.value;
      // Onda de frio: cada andar acende quando a onda passa por ele
      const wave = (t * 0.45) % 1.4;
      rims.forEach((rim, i) => {
        const d = wave - i * 0.25;
        rim.opacity = 0.25 + Math.exp(-d * d * 40) * 0.9 + beat * 0.4;
      });
      (topRim.material as THREE.MeshBasicMaterial).opacity = 0.35 + 0.25 * Math.sin(t * 1.4) ** 2 + beat * 0.4;
      // Vetor de estado precessando em volta do eixo, com nutação lenta
      vector.rotation.set(0.7 + Math.sin(t * 0.8) * 0.35, t * 1.6, 0, "YXZ");
      bloch.rotation.y = -t * 0.3;
      const breathe = 0.6 + 0.4 * Math.sin(t * 2.2) ** 2 + beat * 0.8;
      core.scale.setScalar(0.8 + breathe * 0.4);
      halo.colors.set(glow.copy(tone.accent).lerp(tone.light, 0.3).multiplyScalar(breathe).toArray());
      halo.geometry.attributes.aColor!.needsUpdate = true;
      seeds.forEach((s, i) => {
        s.y -= s.v / 60;
        if (s.y < -1.05) s.y = 1.2;
        const a = s.a + t * 0.2;
        flakes.positions.set([Math.cos(a) * s.r, s.y, Math.sin(a) * s.r], i * 3);
        const fade = Math.min(1, (s.y + 1.05) * 2) * 0.5;
        flakes.colors.set(glow.copy(tone.light).lerp(tone.accent, 0.4).multiplyScalar(fade).toArray(), i * 3);
      });
      flakes.geometry.attributes.position!.needsUpdate = true;
      flakes.geometry.attributes.aColor!.needsUpdate = true;
    },
  };
}
