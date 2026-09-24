/*
 * Pesos das formas da nuvem de partículas. Cada peso anda em velocidade constante
 * rumo à forma pedida (1) ou para longe dela (0). Por construção, nenhum peso muda mais
 * que `speed * dt` por frame: pedidos em sequência (scroll rápido, sobe-e-desce) apenas
 * mudam a direção do movimento, nunca geram saltos.
 */
export function stepWeights(weights: number[], shape: number, dt: number, speed: number) {
  const step = dt * speed;
  for (let i = 0; i < weights.length; i++) {
    const goal = i === shape ? 1 : 0;
    weights[i] = weights[i]! + Math.min(step, Math.max(-step, goal - weights[i]!));
  }
  return weights;
}
