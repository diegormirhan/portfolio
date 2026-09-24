// Verificação da transição de formas: `node src/scripts/morph.test.ts`
import assert from "node:assert/strict";

import { stepWeights } from "./morph.ts";

const DT = 1 / 60;
const SPEED = 0.55;

// Scroll rápido descendo, depois subindo no meio das trocas: pedidos a cada 6 frames
const requests = [0, 1, 2, 3, 1, 0, 2, 0];
const weights = [1, 0, 0, 0];
let maxJump = 0;
for (let frame = 0; frame < requests.length * 6 + 400; frame++) {
  const shape = requests[Math.min(Math.floor(frame / 6), requests.length - 1)]!;
  const before = [...weights];
  stepWeights(weights, shape, DT, SPEED);
  maxJump = Math.max(maxJump, ...weights.map((w, i) => Math.abs(w - before[i]!)));
  for (const w of weights) assert.ok(w >= 0 && w <= 1, "peso fora de [0,1]");
}

// Nunca salta mais que o passo de um frame
assert.ok(maxJump <= SPEED * DT + 1e-9, `salto de ${maxJump}`);
// E termina exatamente na última forma pedida
assert.deepEqual(weights, [1, 0, 0, 0]);

console.log(`ok: maior variação por frame ${maxJump.toFixed(4)} (limite ${(SPEED * DT).toFixed(4)})`);
