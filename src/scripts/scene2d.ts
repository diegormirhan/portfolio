/*
 * Fundo animado sem WebGL (aceleração de hardware desligada ou GPU bloqueada): a rede neural do
 * topo do site desenhada em Canvas 2D, com pulsos de luz passando de camada em camada e poeira
 * subindo. Leve de propósito: 30 fps, resolução 1x e brilhos pré-desenhados (sem GPU, o
 * navegador desenha tudo no processador).
 */
const LAYERS = [5, 7, 8, 7, 4];
const SPEED = 0.34; // mesmo ritmo da rede 3D
const PHASE = 0.22;
const BLUE = ["#46b6e6", "#3f8ff0", "#2f63e6", "#5a5ff0", "#7a5cff"];
const RED = ["#ff8a94", "#ff5a66", "#ff2b3a", "#d4142a", "#b3101f"];

/** Brilho radial desenhado uma vez por cor e reaproveitado com drawImage. */
function glow(color: string, size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, color);
  grad.addColorStop(0.25, color + "99");
  grad.addColorStop(1, color + "00");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

export function start2d(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const sprites = { blue: BLUE.map((c) => glow(c, 96)), red: RED.map((c) => glow(c, 96)) };
  let W = 0;
  let H = 0;
  const resize = () => {
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    if (w === W && h === H) return;
    W = canvas.width = w;
    H = canvas.height = h;
  };
  resize();
  addEventListener("resize", resize);

  const dust = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), v: 0.01 + Math.random() * 0.03, s: 0.6 + Math.random() * 1.4 }));
  const wave = (t: number, layer: number) => {
    const a = (((t * SPEED - layer * PHASE) % 1) + 1) % 1;
    const d = Math.min(a, 1 - a);
    return Math.exp(-d * d * 90);
  };

  let last = 0;
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    if (document.hidden || now - last < 1000 / 30) return;
    last = now;
    const t = now / 1000;
    const dev = document.documentElement.classList.contains("dev");
    const colors = dev ? RED : BLUE;
    const glows = dev ? sprites.red : sprites.blue;
    ctx.clearRect(0, 0, W, H);

    // Poeira subindo
    ctx.fillStyle = dev ? "rgba(255,176,182,0.55)" : "rgba(220,236,255,0.55)";
    for (const p of dust) {
      p.y -= p.v / 30;
      if (p.y < -0.02) p.y = 1.02;
      ctx.fillRect(p.x * W, p.y * H, p.s, p.s);
    }

    // Rede: à direita no desktop, centralizada e apagada no celular (atrás do texto)
    const wide = W / H > 1;
    const cx = wide ? W * 0.7 : W * 0.5;
    const cy = H * 0.5 - (scrollY % H) * 0.04;
    const span = Math.min(wide ? W * 0.36 : W * 0.8, H * 0.9);
    const sway = Math.sin(t * 0.18) * 0.35; // leve giro, como a rede 3D
    ctx.globalAlpha = wide ? 1 : 0.45;
    const nodes = LAYERS.map((n, li) =>
      Array.from({ length: n }, (_, ni) => {
        const u = li / (LAYERS.length - 1) - 0.5;
        const v = (ni - (n - 1) / 2) / 8;
        return { x: cx + u * span * Math.cos(sway), y: cy + v * span * 0.95 + u * span * Math.sin(sway) * 0.12 };
      }),
    );

    // Ligações entre camadas vizinhas, com um pulso andando por cada uma
    ctx.lineWidth = 1;
    for (let li = 0; li < LAYERS.length - 1; li++) {
      const phase = (((t * SPEED - li * PHASE) % 1) + 1) % 1;
      const k = Math.min(1, phase / PHASE); // posição do pulso ao longo da ligação
      ctx.strokeStyle = colors[li] + "30";
      ctx.beginPath();
      for (const a of nodes[li]!) for (const b of nodes[li + 1]!) {
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
      ctx.stroke();
      if (phase < PHASE) {
        ctx.fillStyle = dev ? "#ffd6da" : "#dcecff";
        for (const a of nodes[li]!) for (const b of nodes[li + 1]!) {
          ctx.fillRect(a.x + (b.x - a.x) * k - 1, a.y + (b.y - a.y) * k - 1, 2, 2);
        }
      }
    }

    // Nós: brilho que cresce quando a camada acende
    nodes.forEach((layer, li) => {
      const lit = wave(t, li);
      for (const n of layer) {
        const r = 22 + lit * 16;
        ctx.drawImage(glows[li]!, n.x - r, n.y - r, r * 2, r * 2);
        ctx.fillStyle = colors[li]!;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4 + lit * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
  };
  requestAnimationFrame(frame);
}
