/*
 * Dev mode: um modo mais "agressivo" do site, ligado pelo botão ao lado da bandeira.
 *
 * - Entra e sai por uma bolha que cresce do botão em ondas; a troca acontece com a tela
 *   coberta e sempre leva ao topo da página.
 * - Batida a cada 5 s: um tambor grave (dev-pulse.m4a), uma cordilheira de areia vermelha que
 *   explode de baixo da tela, no fundo de tudo, e uma varredura que desce
 *   deslocando o código flutuante. A cena 3D lê o mesmo pulso (window.__devPulse) e gera
 *   ondas no relevo.
 * - Trilha (dev-theme.m4a) que se abre com o scroll: filtro passa-baixa e volume sobem conforme
 *   a pessoa desce a página e rola mais rápido.
 * - Continua ligado ao navegar (a classe .dev vai junto na troca de página); desliga no reload.
 *
 * O relógio da batida é o do áudio (AudioContext): som e imagem não se desencontram.
 */
import { lenis } from "./motion";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isSmall = matchMedia("(max-width: 767px)").matches;
const BEAT = 5; // s entre batidas
const SIGNAL = "255, 43, 58";
const COBALT = "88, 128, 255"; // só na saída do dev mode (bolha de volta ao normal)
const PINK = "255, 176, 184";
const ICE = "255, 226, 229";

type DevWindow = { __devOn?: boolean; __devPulse?: { level: number; age: number } };
const devWindow = window as unknown as DevWindow;
devWindow.__devPulse = { level: 0, age: 99 };

let on = false;
let muted = false;
let busy = false;

/* ---------- Áudio ---------- */

type AudioRig = {
  ctx: AudioContext;
  master: GainNode;
  music: HTMLAudioElement;
  musicGain: GainNode;
  filter: BiquadFilterNode;
  pulseBus: GainNode;
  pulse?: AudioBuffer;
};
let audio: AudioRig | null = null;
let beatStart = 0; // instante (relógio do áudio ou da página) da primeira batida
let nextBeat = 0;

/** Criado dentro do clique: os navegadores só liberam áudio após um gesto da pessoa. */
function setupAudio(): AudioRig | null {
  if (audio) return audio;
  try {
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const music = new window.Audio("/audio/dev-theme.m4a");
    music.loop = true;
    music.preload = "auto";
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    const musicGain = ctx.createGain();
    musicGain.gain.value = 0.3;
    ctx.createMediaElementSource(music).connect(filter).connect(musicGain).connect(master);

    // Pulso: reforço no subgrave para soar como um estrondo, não um clique
    const pulseBus = ctx.createGain();
    pulseBus.gain.value = 0.8;
    const shelf = ctx.createBiquadFilter();
    shelf.type = "lowshelf";
    shelf.frequency.value = 80;
    shelf.gain.value = 6;
    pulseBus.connect(shelf).connect(master);

    audio = { ctx, master, music, musicGain, filter, pulseBus };
    fetch("/audio/dev-pulse.m4a")
      .then((r) => r.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((buffer) => audio && (audio.pulse = buffer))
      .catch(() => {});
    return audio;
  } catch {
    return null; // sem Web Audio: o dev mode segue só com o visual
  }
}

const clock = () => (audio ? audio.ctx.currentTime : performance.now() / 1000);

function fadeMaster(to: number, seconds: number) {
  if (!audio) return;
  const now = audio.ctx.currentTime;
  audio.master.gain.cancelScheduledValues(now);
  audio.master.gain.setValueAtTime(audio.master.gain.value, now);
  audio.master.gain.linearRampToValueAtTime(to, now + seconds);
}

function startAudio() {
  const a = setupAudio();
  if (!a) return;
  void a.ctx.resume();
  a.music.play().catch(() => {});
  fadeMaster(muted ? 0 : 1, 2.5);
}

function stopAudio() {
  if (!audio) return;
  fadeMaster(0, 0.8);
  const a = audio;
  setTimeout(() => {
    if (on) return;
    a.music.pause();
    void a.ctx.suspend();
  }, 900);
}

/** Agenda as batidas com folga (os timers do JS atrasam; o relógio do áudio não). */
function scheduleBeats(now: number) {
  if (!audio?.pulse) return;
  while (nextBeat < now + 0.2) {
    if (nextBeat >= now - 0.02) {
      const source = audio.ctx.createBufferSource();
      source.buffer = audio.pulse;
      source.connect(audio.pulseBus);
      source.start(nextBeat);
    }
    nextBeat += BEAT;
  }
}

/* ---------- Código e símbolos flutuando ---------- */

const TOKENS = [
  "loss.backward()", "∂L/∂w", "∇θ J(θ)", "Σ xᵢwᵢ + b", "σ(z) = 1 / (1 + e⁻ᶻ)", "softmax(QKᵀ/√d)·V",
  "optimizer.step()", "for epoch in range(n):", "Wₜ₊₁ = Wₜ − η∇L", "λ‖w‖²", "∫ f(x) dx", "argmin θ",
  "x.shape → (B, T, C)", "await fetch('/api')", "SELECT * FROM events", "git push origin main", "∂²f/∂x²",
  "E[x] = Σ p(x)·x", "det(A) ≠ 0", "Ax = b", "x ∈ ℝⁿ", "O(n log n)", "lim n→∞", "KL(P‖Q)",
  "H = −Σ p log p", "relu(x) = max(0, x)", "0x7FFF", "01001101", "δ = ∂L/∂z", "y = Wx + b",
];
const SYMBOLS = ["π", "∞", "Δ", "λ", "θ", "∂", "Σ", "∇", "√", "≈", "∈", "⊗", "∮", "ƒ", "μ"];

type Item = { text: string; x: number; y: number; vy: number; size: number; alpha: number; color: string; symbol: boolean };

const layer = {
  canvas: null as HTMLCanvasElement | null,
  ctx: null as CanvasRenderingContext2D | null,
  items: [] as Item[],
  width: 0,
  height: 0,
  dpr: Math.min(devicePixelRatio, 1.5),
};

function spawn(item: Partial<Item> = {}, anywhere = false): Item {
  const symbol = Math.random() < 0.3;
  const pick = <T,>(list: T[]) => list[(Math.random() * list.length) | 0]!;
  return {
    text: symbol ? pick(SYMBOLS) : pick(TOKENS),
    x: Math.random() * layer.width,
    y: anywhere ? Math.random() * layer.height : layer.height + 40,
    vy: 8 + Math.random() * 22,
    size: symbol ? 26 + Math.random() * 46 : 11 + Math.random() * 4,
    alpha: symbol ? 0.08 + Math.random() * 0.14 : 0.18 + Math.random() * 0.3,
    color: Math.random() < 0.55 ? SIGNAL : Math.random() < 0.6 ? PINK : ICE,
    symbol,
    ...item,
  };
}

function resizeLayer() {
  const canvas = layer.canvas;
  if (!canvas) return;
  layer.width = innerWidth;
  layer.height = innerHeight;
  canvas.width = layer.width * layer.dpr;
  canvas.height = layer.height * layer.dpr;
  layer.ctx?.setTransform(layer.dpr, 0, 0, layer.dpr, 0, 0);
}

function setupLayer() {
  if (layer.canvas) return;
  layer.canvas = document.getElementById("dev-layer") as HTMLCanvasElement | null;
  layer.ctx = layer.canvas?.getContext("2d") ?? null;
  resizeLayer();
  addEventListener("resize", resizeLayer);
  const count = isSmall ? 16 : 40;
  layer.items = Array.from({ length: count }, () => spawn({}, true));
}

function drawLayer(dt: number, age: number, level: number) {
  const ctx = layer.ctx;
  if (!ctx) return;
  ctx.clearRect(0, 0, layer.width, layer.height);
  // Onda de varredura: cada batida manda uma faixa de cima para baixo em 0,9 s
  const sweep = age < 0.9 ? age / 0.9 : -1;
  const bandY = sweep * layer.height;
  const bandFade = 1 - sweep;

  for (const item of layer.items) {
    if (!reduceMotion) item.y -= item.vy * dt;
    if (item.y < -60) Object.assign(item, spawn());
    let x = item.x;
    let alpha = item.alpha * (1 + level * 0.9);
    if (sweep >= 0) {
      // Perto da faixa o texto é empurrado para o lado e acende: a onda "passa" por ele
      const d = (item.y - bandY) / 60;
      const hit = Math.exp(-d * d);
      x += Math.sin(item.y * 0.08 + age * 30) * 16 * hit * bandFade;
      alpha += hit * 0.5 * bandFade;
    }
    ctx.font = `${item.symbol ? 300 : 500} ${item.size}px "JetBrains Mono Variable", ui-monospace, monospace`;
    ctx.fillStyle = `rgba(${item.color}, ${Math.min(alpha, 0.9)})`;
    ctx.fillText(item.text, x, item.y);
  }

  if (sweep >= 0) {
    const gradient = ctx.createLinearGradient(0, bandY - 50, 0, bandY + 4);
    gradient.addColorStop(0, `rgba(${SIGNAL}, 0)`);
    gradient.addColorStop(1, `rgba(${SIGNAL}, ${0.16 * bandFade})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, bandY - 50, layer.width, 54);
    ctx.fillStyle = `rgba(${SIGNAL}, ${0.55 * bandFade})`;
    ctx.fillRect(0, bandY, layer.width, 1);
  }
}

/* ---------- Cordilheira de areia ---------- */

/**
 * Em repouso a areia fica escondida abaixo da borda da tela. A cada pulso ela é arremessada
 * para cima e forma uma cordilheira na largura toda (picos, alturas e posições sorteados a cada
 * batida, até um terço da altura da tela), depois cai de volta e some pela borda de baixo.
 * Cada grão sobe até uma fração da altura do relevo naquele ponto: no auge, o conjunto é uma
 * montanha cheia, densa na base e rarefeita no topo.
 */
const SAND = isSmall ? 11000 : 32000;
const sand = {
  x: new Float32Array(SAND),
  y: new Float32Array(SAND),
  vx: new Float32Array(SAND),
  vy: new Float32Array(SAND),
  share: new Float32Array(SAND), // fração da altura do relevo que o grão alcança
  kickAt: new Float32Array(SAND), // instante (s) em que o grão é arremessado
  tone: new Uint8Array(SAND),
  width: 0,
  height: 0,
  ready: false,
  canvas: null as HTMLCanvasElement | null,
  ctx: null as CanvasRenderingContext2D | null,
};
type Ridge = { peaks: { at: number; width: number; height: number }[]; from: number };
let ridge: Ridge | null = null;
let ridgeBeat = -1;

const gravity = () => layer.height * 1.45; // px/s²: o pico leva ~0,7 s para subir
const hidden = () => layer.height + 12; // logo abaixo da borda da tela

/** Canvas da areia: o mais ao fundo possível (atrás da cena 3D e de todo o conteúdo). */
function setupSandCanvas() {
  if (!sand.canvas) {
    sand.canvas = document.getElementById("dev-sand") as HTMLCanvasElement | null;
    sand.ctx = sand.canvas?.getContext("2d") ?? null;
  }
  const canvas = sand.canvas;
  if (!canvas) return;
  canvas.width = layer.width * layer.dpr;
  canvas.height = layer.height * layer.dpr;
  sand.ctx?.setTransform(layer.dpr, 0, 0, layer.dpr, 0, 0);
}

function setupSand() {
  setupSandCanvas();
  sand.width = layer.width;
  sand.height = layer.height;
  for (let i = 0; i < SAND; i++) {
    sand.x[i] = Math.random() * layer.width;
    sand.y[i] = hidden();
    sand.vx[i] = sand.vy[i] = 0;
    // Mais grãos baixos que altos: corpo cheio e topo esfarelado
    sand.share[i] = Math.random() ** 0.75;
    sand.kickAt[i] = -1;
    sand.tone[i] = Math.random() < 0.55 ? 0 : Math.random() < 0.6 ? 1 : 2;
  }
  sand.ready = true;
}

/** Altura do relevo (px) num ponto x (0-1 da largura): o maior pico que cobre o ponto. */
function ridgeHeight(r: Ridge, u: number) {
  let h = 0;
  for (const peak of r.peaks) {
    const d = (u - peak.at) / peak.width;
    h = Math.max(h, peak.height * Math.exp(-d * d));
  }
  return h;
}

function newRidge(beatTime: number) {
  const max = layer.height / 3;
  const count = 4 + Math.floor(Math.random() * 5);
  ridge = {
    peaks: Array.from({ length: count }, (_, j) => ({
      at: (j + 0.2 + Math.random() * 0.6) / count, // espalhados pela largura toda
      width: 0.05 + Math.random() * 0.09,
      height: max * (0.45 + Math.random() * 0.55),
    })),
    from: Math.random(), // epicentro: a cordilheira "nasce" daqui para os lados
  };
  ridge.peaks[Math.floor(Math.random() * count)]!.height = max; // sempre um pico no máximo
  for (let i = 0; i < SAND; i++) {
    const u = sand.x[i]! / sand.width;
    sand.kickAt[i] = beatTime + Math.abs(u - ridge.from) * 0.28 + Math.random() * 0.04;
  }
}

function stepSand(dt: number, time: number, age: number) {
  if (!sand.ready || sand.width !== layer.width || sand.height !== layer.height) setupSand();
  const beatIndex = age < 99 ? Math.floor(time / BEAT) : -1;
  if (beatIndex >= 0 && beatIndex !== ridgeBeat && age < 0.2 && !reduceMotion) {
    ridgeBeat = beatIndex;
    newRidge(time - age);
  }
  const g = gravity();
  const floor = hidden();
  for (let i = 0; i < SAND; i++) {
    let y = sand.y[i]!;
    let vy = sand.vy[i]!;
    let x = sand.x[i]!;
    if (ridge && sand.kickAt[i]! > 0 && time >= sand.kickAt[i]!) {
      sand.kickAt[i] = -1;
      // Velocidade para alcançar a altura sorteada (v = √(2gh)), com um pouco de variação
      const h = ridgeHeight(ridge, x / sand.width) * sand.share[i]! * (0.82 + Math.random() * 0.18) + 6;
      vy = -Math.sqrt(2 * g * (h + (floor - layer.height)));
      sand.vx[i] = (Math.random() - 0.5) * 50;
    }
    if (vy !== 0 || y < floor) {
      vy += g * dt;
      y += vy * dt;
      x += sand.vx[i]! * dt;
      if (y >= floor) {
        // Caiu de volta abaixo da borda: some e se reposiciona para o próximo pulso
        y = floor;
        vy = 0;
        x = Math.random() * sand.width;
      }
    }
    sand.x[i] = x;
    sand.y[i] = y;
    sand.vy[i] = vy;
  }
}

/**
 * Desenho direto nos pixels (dezenas de milhares de grãos custariam caro como retângulos),
 * só na faixa de baixo da tela onde a areia alcança. Sem grãos à vista, não desenha nada.
 */
const SAND_RGBA = [
  [255, 43, 58, 225],
  [255, 122, 132, 205],
  [170, 18, 36, 235],
].map(([r, g, b, a]) => ((a! << 24) | (b! << 16) | (g! << 8) | r!) >>> 0);
const band = { image: null as ImageData | null, pixels: null as Uint32Array | null, top: 0, dirty: false };

function drawSand() {
  const ctx = sand.ctx;
  const canvas = sand.canvas;
  if (!ctx || !canvas || !sand.ready) return;
  const dpr = layer.dpr;
  const top = Math.floor(canvas.height * 0.56); // a cordilheira chega a ~1/3 da tela
  if (!band.image || band.image.width !== canvas.width || band.top !== top) {
    band.image = ctx.createImageData(canvas.width, canvas.height - top);
    band.pixels = new Uint32Array(band.image.data.buffer);
    band.top = top;
  }
  const pixels = band.pixels!;
  const w = band.image.width;
  const h = band.image.height;
  const size = Math.max(2, Math.round((isSmall ? 1.7 : 1.5) * dpr));
  const floor = hidden();
  let visible = 0;
  pixels.fill(0);
  for (let i = 0; i < SAND; i++) {
    if (sand.y[i]! >= floor) continue;
    const px = (sand.x[i]! * dpr) | 0;
    const py = ((sand.y[i]! * dpr) | 0) - top;
    if (py < 0 || py >= h - size || px < 0 || px >= w - size) continue;
    visible++;
    const color = SAND_RGBA[sand.tone[i]!]!;
    for (let dy = 0; dy < size; dy++) {
      const row = (py + dy) * w + px;
      for (let dx = 0; dx < size; dx++) pixels[row + dx] = color;
    }
  }
  if (visible === 0 && !band.dirty) return; // já está limpo
  ctx.putImageData(band.image, 0, top);
  band.dirty = visible > 0;
}

/* ---------- Loop do dev mode ---------- */

/** Intensidade da batida: um golpe único com cauda longa, como o boom. */
const envelope = (age: number) => Math.exp(-age * 2.4);

let looping = false;
let lastFrame = 0;
let lastParams = 0;
let lastScroll = scrollY;

function loop(time: number) {
  // Monitores de 120/144 Hz: no máximo ~60 quadros por segundo, como a cena 3D
  if (on && time - lastFrame < 1000 / 62) {
    requestAnimationFrame(loop);
    return;
  }
  const dt = Math.min((time - lastFrame) / 1000 || 0, 0.05);
  lastFrame = time;
  const now = clock();
  scheduleBeats(now);

  // Tempo "visual": desconta a latência de saída para o clarão coincidir com o som
  const latency = audio ? (audio.ctx.outputLatency || 0) + audio.ctx.baseLatency : 0;
  const t = now - latency - beatStart;
  const age = t < 0 ? 99 : t % BEAT;
  const level = on && t >= 0 ? envelope(age) : 0;
  devWindow.__devPulse = { level, age: on ? age : 99 };

  drawLayer(dt, on ? age : 99, level);
  if (on) {
    stepSand(dt, t, age);
    drawSand();
  }

  // Trilha: abre o filtro e sobe o volume conforme a descida e a velocidade do scroll
  if (audio && time - lastParams > 120) {
    lastParams = time;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const depth = Math.min(1, scrollY / max);
    const speed = Math.min(1, Math.abs(scrollY - lastScroll) / Math.max(innerHeight * 0.25, 1));
    lastScroll = scrollY;
    const at = audio.ctx.currentTime;
    audio.filter.frequency.setTargetAtTime(700 + 5200 * depth ** 1.2 + 2200 * speed, at, 0.4);
    audio.musicGain.gain.setTargetAtTime(0.26 + 0.22 * depth + 0.1 * speed, at, 0.6);
  }

  if (on) requestAnimationFrame(loop);
  else looping = false;
}

function startLoop() {
  if (looping) return;
  looping = true;
  lastFrame = performance.now();
  requestAnimationFrame(loop);
}

/* ---------- Transição: bolha que cresce em ondas ---------- */

function wobblyCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number) {
  const steps = 96;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const k = 1 + 0.035 * Math.sin(5 * a + t * 9) + 0.02 * Math.sin(9 * a - t * 13);
    const px = x + Math.cos(a) * r * k;
    const py = y + Math.sin(a) * r * k;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/**
 * Fase 1: a bolha cresce do botão até cobrir a tela, com anéis de onda por dentro.
 * No meio (tela coberta) troca o modo. Fase 2: um buraco abre do mesmo ponto, com ondas
 * saindo pela borda, revelando o site já no novo modo.
 */
function bubble(x: number, y: number, toDev: boolean, swap: () => void) {
  const canvas = document.getElementById("dev-bubble") as HTMLCanvasElement | null;
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx || reduceMotion) {
    swap();
    return Promise.resolve();
  }
  const dpr = Math.min(devicePixelRatio, 1.5);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const reach = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) * 1.12;
  const fill = toDev ? "#0d0306" : "#070b1a";
  const edge = toDev ? SIGNAL : COBALT;
  const DURATION = 1500;
  const MID = 0.52;
  const ease = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - (-2 * v + 2) ** 3 / 2);
  let swapped = false;

  return new Promise<void>((resolve) => {
    const start = performance.now();
    const draw = (time: number) => {
      const p = Math.min((time - start) / DURATION, 1);
      const t = (time - start) / 1000;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      if (p < MID) {
        const r = ease(p / MID) * reach;
        ctx.beginPath();
        wobblyCircle(ctx, x, y, r, t);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(r, 1));
        gradient.addColorStop(0, fill);
        gradient.addColorStop(0.85, fill);
        gradient.addColorStop(1, `rgba(${edge}, 0.9)`);
        ctx.fillStyle = gradient;
        ctx.fill();
        // Ondas concêntricas dentro da bolha
        for (let k = 1; k <= 3; k++) {
          ctx.beginPath();
          wobblyCircle(ctx, x, y, r * (1 - k * 0.17), t + k);
          ctx.strokeStyle = `rgba(${edge}, ${0.5 - k * 0.12})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      } else {
        if (!swapped) {
          swapped = true;
          swap();
        }
        const q = (p - MID) / (1 - MID);
        const hole = ease(q) * reach;
        ctx.beginPath();
        ctx.rect(0, 0, innerWidth, innerHeight);
        wobblyCircle(ctx, x, y, hole, t);
        ctx.fillStyle = fill;
        ctx.fill("evenodd");
        // Ondas saindo pela borda do buraco
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          wobblyCircle(ctx, x, y, hole + (k + 1) * 26 * (1 - q), t + k);
          ctx.strokeStyle = `rgba(${edge}, ${(0.6 - k * 0.18) * (1 - q)})`;
          ctx.lineWidth = 2 - k * 0.5;
          ctx.stroke();
        }
      }
      if (p < 1) requestAnimationFrame(draw);
      else {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        resolve();
      }
    };
    requestAnimationFrame(draw);
  });
}

/* ---------- Liga / desliga ---------- */

function apply(next: boolean) {
  on = next;
  devWindow.__devOn = on;
  document.documentElement.classList.toggle("dev", on);
  // Sempre recomeça do topo
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else scrollTo(0, 0);
  dispatchEvent(new CustomEvent("dev:change", { detail: { on } }));
  syncButtons();
  if (on) {
    setupLayer();
    beatStart = nextBeat = clock() + 0.35;
    startLoop();
  } else {
    stopAudio();
  }
}

async function toggle(button: HTMLElement) {
  if (busy) return;
  busy = true;
  const next = !on;
  if (next) startAudio(); // ainda dentro do clique
  const r = button.getBoundingClientRect();
  await bubble(r.left + r.width / 2, r.top + r.height / 2, next, () => apply(next));
  busy = false;
}

function setMuted(value: boolean) {
  muted = value;
  if (on) fadeMaster(muted ? 0 : 1, 0.4);
  syncButtons();
}

function syncButtons() {
  document.querySelectorAll<HTMLElement>("[data-dev-toggle]").forEach((b) => b.setAttribute("aria-pressed", String(on)));
  document.querySelectorAll<HTMLElement>("[data-dev-sound]").forEach((b) => {
    b.setAttribute("aria-pressed", String(muted));
    const label = muted ? b.dataset.labelUnmute : b.dataset.labelMute;
    if (label) {
      b.setAttribute("aria-label", label);
      b.title = label;
    }
  });
}

// O cabeçalho é trocado a cada página: religa os botões e mantém o estado
document.addEventListener("astro:page-load", () => {
  document.querySelectorAll<HTMLElement>("[data-dev-toggle]").forEach((b) => b.addEventListener("click", () => toggle(b)));
  document
    .querySelectorAll<HTMLElement>("[data-dev-sound]")
    .forEach((b) => b.addEventListener("click", () => setMuted(!muted)));
  syncButtons();
});

// Aba em segundo plano: pausa a trilha; ao voltar, retoma
document.addEventListener("visibilitychange", () => {
  if (!on || !audio) return;
  if (document.hidden) audio.music.pause();
  else audio.music.play().catch(() => {});
});
