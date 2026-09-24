/*
 * Movimento do site: rolagem suave (Lenis), preloader, transição entre páginas (cortina),
 * menu hambúrguer e as animações de cada página (GSAP + ScrollTrigger + SplitText).
 *
 * O script roda uma vez; o que depende da página é refeito a cada `astro:page-load`
 * e desfeito em `astro:before-swap` (gsap.context + revert).
 *
 * Atributos usados nas páginas:
 *   data-split          título revelado linha a linha por trás de uma máscara
 *   data-split="intro"  idem, mas espera o preloader / a cortina (hero)
 *   data-split="chars"  título revelado letra a letra, girando para frente
 *   data-lines          parágrafo aparece linha a linha, saindo de um desfoque
 *   data-reveal         sobe e aparece ao entrar na tela
 *   data-fill           palavras se acendem conforme o scroll (e apagam ao voltar)
 * As revelações tocam uma vez só; só o data-fill acompanha o scroll nos dois sentidos.
 *   data-scene="0-3"    ao entrar, a nuvem de partículas morfa (data-scene-x/y/scale/dim)
 *   data-parallax="n"   desloca no scroll (n = intensidade)
 *   data-clip           imagem revelada por clip-path
 *   data-preview        linha de lista que mostra data-preview-src flutuando no cursor
 *   data-magnetic       é puxado levemente pelo cursor
 *   data-marquee="1|-1" faixa que corre na horizontal (sentido 1 ou -1) e acelera com o scroll;
 *                       data-marquee-duration = segundos por volta
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const EASE = "expo.out";

/* ---------- Rolagem suave ---------- */

export const lenis = reduceMotion ? null : new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
if (lenis) {
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Em telas estreitas a nuvem fica centralizada: o deslocamento lateral a jogaria para fora.
const NETWORK = 2;
const setShape = (el: HTMLElement) => {
  const d = el.dataset;
  const wide = innerWidth / innerHeight > 1;
  const shape = Number(d.scene);
  const detail = {
    // A rede neural nunca fica atrás de texto: sem espaço lateral (telas estreitas),
    // ela é trocada pela esfera
    shape: !wide && shape === NETWORK ? 1 : shape,
    x: wide ? Number(d.sceneX ?? 0) : 0,
    y: Number(d.sceneY ?? 0),
    scale: Number(d.sceneScale ?? 1) * (wide ? 1 : 0.8),
    // No celular a nuvem fica sempre atrás do texto: mais apagada
    dim: Number(d.sceneDim ?? 1) * (wide ? 1 : 0.55),
  };
  // A cena carrega depois (chunk separado): ela lê o último pedido ao iniciar
  (window as unknown as { __sceneShape: unknown }).__sceneShape = detail;
  dispatchEvent(new CustomEvent("scene:shape", { detail }));
};

// Imagens, fontes e revelações mudam a altura da página depois que os gatilhos são criados.
// Sem recalcular, as seções "acham" que estão em outra posição e a forma de fundo não troca.
let refreshTimer = 0;
new ResizeObserver(() => {
  clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
}).observe(document.body);

/* ---------- Preloader (só na primeira carga) ---------- */

function sceneReady() {
  return new Promise<void>((resolve) => {
    if ((window as unknown as { __sceneReady?: boolean }).__sceneReady) resolve();
    else addEventListener("scene:ready", () => resolve(), { once: true });
  });
}

async function runPreloader() {
  const root = document.getElementById("preloader");
  if (!root) return;
  const counter = root.querySelector<HTMLElement>("[data-count]")!;
  const bar = root.querySelector<HTMLElement>("[data-bar]")!;
  const progress = { value: 0 };
  const render = () => {
    counter.textContent = String(Math.round(progress.value)).padStart(3, "0");
    bar.style.transform = `scaleX(${progress.value / 100})`;
  };

  if (reduceMotion) {
    await Promise.race([Promise.all([document.fonts.ready, sceneReady()]), wait(2500)]);
    root.remove();
    return;
  }

  // O "Diego." do topo entra no fim da abertura (revealBrand)
  gsap.set(".header__brand", { opacity: 0 });
  // O som do título baixa enquanto o contador corre (só é decodificado depois do clique)
  const hitData = fetch("/audio/intro-hit.m4a")
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .catch(() => null);

  // Sobe até 80% sozinho; os 20% finais esperam fontes e cena (com teto de 4s).
  const fake = gsap.to(progress, { value: 80, duration: 1.1, ease: "power2.out", onUpdate: render });
  await Promise.race([Promise.all([document.fonts.ready, sceneReady(), fake.then()]), wait(4000)]);
  await gsap.to(progress, { value: 100, duration: 0.35, ease: "power1.inOut", onUpdate: render }).then();
  // Botão no meio: o clique libera o som (os navegadores exigem um gesto da pessoa)
  const choice = await askToEnter(root);
  const hitIn = await startHitSound(choice.sound, hitData);
  const expander = expandPill(root, choice.rect, choice.hovered, Math.max(0.6, hitIn - 0.2));
  await wait(hitIn * 1000);
  await playIntro(root, expander);
}

/** Momento do golpe dentro de intro-hit.m4a (a subida vem antes). */
const HIT_AT = 1.31;

/**
 * Do contador para o botão: os dígitos sobem e somem por trás de um corte, e a linha de progresso
 * sobe até o centro, encolhe e se transforma na própria pílula "Entrar" (o texto já aparece junto),
 * o halo acende e o "entrar sem som" aparece. Espera a escolha e devolve o centro do botão.
 */
async function askToEnter(root: HTMLElement) {
  const panel = root.querySelector<HTMLElement>("[data-enter]");
  const go = root.querySelector<HTMLButtonElement>("[data-enter-sound]");
  const silent = root.querySelector<HTMLButtonElement>("[data-enter-silent]");
  const bar = root.querySelector<HTMLElement>(".preloader__bar");
  const center = { sound: false, rect: new DOMRect(innerWidth / 2 - 60, innerHeight / 2 - 32, 120, 64), hovered: false };
  if (!panel || !go || !silent || !bar) return center;

  // O painel ocupa o lugar final (invisível) para medir onde a pílula vai ficar
  panel.hidden = false;
  gsap.set(panel, { autoAlpha: 0 });
  const target = go.getBoundingClientRect();
  const from = bar.getBoundingClientRect();
  const morph = document.createElement("div");
  morph.className = "preloader__morph";
  Object.assign(morph.style, {
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
  });
  morph.innerHTML = "<span></span>"; // camada cobalto que cobre o degradê da linha
  root.append(morph);
  gsap.set(bar, { autoAlpha: 0 });

  await gsap
    .timeline()
    // Os dígitos sobem e são cortados; o nome some
    .to(root.querySelector(".preloader__count"), { clipPath: "inset(0 0 100% 0)", yPercent: -18, duration: 0.7, ease: "expo.in" }, 0)
    .to(root.querySelector("p.mono"), { autoAlpha: 0, y: -10, duration: 0.4, ease: "power2.in" }, 0)
    // A linha sobe ao centro e encolhe até a largura do botão...
    .to(morph, {
      top: target.top + target.height / 2 - from.height / 2,
      left: target.left,
      width: target.width,
      duration: 0.85,
      ease: "expo.inOut",
    }, 0.15)
    // ...e cresce na altura, virando a pílula cobalto
    .to(morph, {
      top: target.top,
      height: target.height,
      borderRadius: target.height / 2,
      duration: 0.55,
      ease: "expo.out",
    }, 0.95)
    .to(morph.firstElementChild, { opacity: 1, duration: 0.45, ease: "power1.out" }, 0.95)
    .set(panel, { autoAlpha: 1 }, 1.35)
    .set(morph, { autoAlpha: 0 }, 1.35)
    .from(root.querySelector(".preloader__halo"), { autoAlpha: 0, duration: 0.8, ease: "power2.out" }, 1.35)
    .from(silent, { autoAlpha: 0, y: 12, duration: 0.6, ease: EASE }, 1.5)
    .then();
  morph.remove();

  return new Promise<{ sound: boolean; rect: DOMRect; hovered: boolean }>((resolve) => {
    const pick = (sound: boolean) => {
      const rect = go.getBoundingClientRect();
      const hovered = go.matches(":hover");
      gsap.to(silent, { autoAlpha: 0, duration: 0.25, ease: "power1.in" });
      gsap.to(root.querySelector(".preloader__halo"), { autoAlpha: 0, duration: 0.3 });
      resolve({ sound, rect, hovered });
    };
    go.addEventListener("click", () => pick(true), { once: true });
    silent.addEventListener("click", () => pick(false), { once: true });
  });
}

/**
 * Toca o impacto (subida + golpe) e devolve em quantos segundos o golpe soa. Sem som (escolha
 * da pessoa ou falha de áudio), o tempo é o mesmo: a abertura fica igual, só em silêncio.
 */
async function startHitSound(sound: boolean, data: Promise<ArrayBuffer | null>) {
  if (!sound) return HIT_AT;
  try {
    const ctx = new AudioContext();
    void ctx.resume();
    const raw = await data;
    if (!raw) return HIT_AT;
    const buffer = await ctx.decodeAudioData(raw);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    const lead = 0.06;
    source.start(ctx.currentTime + lead);
    source.onended = () => void ctx.close();
    return lead + HIT_AT + (ctx.outputLatency || 0) + ctx.baseLatency;
  } catch {
    return HIT_AT;
  }
}

/**
 * A própria pílula cresce na cor dela até tomar a tela (enquanto a subida do som toca): um aperto
 * rápido no clique, ela se arredonda num círculo e o círculo cresce até cobrir tudo, assentando
 * no degradê cobalto do fundo do nome.
 */
function expandPill(root: HTMLElement, rect: DOMRect, hovered: boolean, duration: number) {
  const el = document.createElement("div");
  el.className = "intro-expand";
  el.setAttribute("aria-hidden", "true");
  // Camadas: a cor que a pílula tinha no clique (cobalto ou o cerúleo do hover) e, por cima, o
  // degradê do fundo do nome (SVG), que aparece durante a expansão: a troca no golpe não aparece
  const r = Math.hypot(innerWidth, innerHeight) * 0.6;
  el.innerHTML = `<span class="intro-expand__pill${hovered ? " is-hover" : ""}"></span><span class="intro-expand__glow"></span>`;
  (el.lastElementChild as HTMLElement).style.background =
    `radial-gradient(circle ${r}px at 50% 50%, #1f4bc4 0%, #10286e 45%, #060d2a 100%)`;
  Object.assign(el.style, {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    borderRadius: `${rect.height / 2}px`,
  });
  document.body.append(el);
  root.querySelector<HTMLElement>("[data-enter-sound]")?.style.setProperty("visibility", "hidden");

  // Círculo centrado no botão, grande o bastante para cobrir o canto mais distante
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const reach = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
  const circle = (d: number) => ({ left: cx - d / 2, top: cy - d / 2, width: d, height: d, borderRadius: d / 2 });
  gsap
    .timeline()
    // Aperto do clique, e a pílula se arredonda num círculo
    .to(el, { scale: 0.92, duration: 0.12, ease: "power2.out" })
    .to(el, { scale: 1, ...circle(rect.height * 1.15), duration: 0.28, ease: "power2.inOut" })
    // O círculo cresce até cobrir a tela inteira
    .to(el, { ...circle(reach * 2), duration: Math.max(0.4, duration - 0.4), ease: "expo.inOut" })
    .to(el.lastElementChild, { opacity: 1, duration: Math.max(0.3, duration - 0.55), ease: "power2.inOut" }, "<0.1");
  return el;
}

/**
 * "Diego." do topo esquerdo, bem marcado: as letras caem girando de trás de uma máscara com
 * desfoque, uma a uma; o ponto entra por último, quicando, e acende em cerúleo antes de
 * assentar.
 */
function revealBrand() {
  const brand = document.querySelector<HTMLElement>(".header__brand");
  if (!brand) return;
  const split = SplitText.create(brand, { type: "chars", mask: "chars" });
  const dot = brand.querySelector<HTMLElement>(".accent");
  const letters = split.chars.filter((c) => !dot?.contains(c));
  gsap.set(brand, { opacity: 1 });
  gsap
    .timeline({ onComplete: () => split.revert() })
    .from(letters, {
      yPercent: -130,
      rotate: -24,
      filter: "blur(6px)",
      duration: 1.1,
      stagger: 0.07,
      ease: "expo.out",
    })
    .from(
      dot ? [dot] : [],
      { scale: 0, yPercent: -220, duration: 0.9, ease: "bounce.out", transformOrigin: "50% 100%" },
      "-=0.55",
    )
    .fromTo(
      dot ? [dot] : [],
      { color: "#ffffff", textShadow: "0 0 18px rgba(120, 200, 255, 0.95)" },
      { color: "", textShadow: "0 0 0 rgba(120, 200, 255, 0)", duration: 0.8, ease: "power2.out" },
      "-=0.2",
    );
}

/**
 * Abertura (a cada carregamento completo): contador → "Entrar" → a pílula vira um círculo
 * cobalto enquanto a subida do som toca → no golpe, "DIEGO" surge de uma vez com clarão e
 * tremor → o branco se apaga (o site aparece por dentro das letras), o miolo do "O" ganha um
 * contorno luminoso e a câmera mergulha por ele até o site ocupar a tela.
 *
 * Técnica: uma camada SVG cobalto com o nome recortado (máscara), uma cópia sólida do nome por
 * cima (que some no fade) e uma elipse que abre o miolo do "O". O zoom é aplicado à mão.
 */
async function playIntro(root: HTMLElement, expander?: HTMLElement) {
  const NS = "http://www.w3.org/2000/svg";
  const W = innerWidth;
  const H = innerHeight;
  const WORD = "DIEGO";

  // Medidas reais da fonte (já carregada): largura de cada prefixo para posicionar as letras
  // uma a uma, altura das maiúsculas para centralizar e o traço do "O" para mirar o zoom
  const font = getComputedStyle(document.documentElement).getPropertyValue("--font-display");
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = `800 100px ${font}`;
  const whole = probe.measureText(WORD);
  const capRatio = whole.actualBoundingBoxAscent / 100;
  const size = Math.min((100 * W * 0.76) / whole.width, (H * 0.5) / capRatio);
  probe.font = `800 ${size}px ${font}`;
  const left = W / 2 - probe.measureText(WORD).width / 2;
  const baseline = H / 2 + (capRatio * size) / 2;
  const xs = [...WORD].map((_, i) => left + probe.measureText(WORD.slice(0, i)).width);
  const o = probe.measureText("O");
  const oInkLeft = xs[4]! - o.actualBoundingBoxLeft;
  const oInkWidth = o.actualBoundingBoxLeft + o.actualBoundingBoxRight;
  const oInkTop = baseline - o.actualBoundingBoxAscent;
  const oInkHeight = o.actualBoundingBoxAscent + o.actualBoundingBoxDescent;
  const ox = oInkLeft + oInkWidth / 2; // centro do "O"
  const oy = oInkTop + oInkHeight / 2;
  // Portal: elipse que passa pelo meio do traço do "O" (traço lateral ≈ 30% da largura, de
  // cima/baixo ≈ 19% da altura). Somada à letra recortada, deixa o miolo inteiro transparente
  // com a borda externa exatamente a do "O".
  const portal = `<ellipse class="intro-portal" cx="${ox}" cy="${oy}" rx="${oInkWidth * 0.35}" ry="${oInkHeight * 0.405}" fill-opacity="0" />`;

  // Uma <text> por letra (posição absoluta): subir letra a letra não desloca as vizinhas
  const glyphs = [...WORD]
    .map((c, i) => `<text class="intro-letter" x="${xs[i]}" y="${baseline}" font-size="${size}">${c}</text>`)
    .join("");
  const svg = document.createElementNS(NS, "svg");
  svg.id = "intro";
  svg.setAttribute("aria-hidden", "true");
  // Tamanho exato da janela em px (100vh pode ser maior que a janela no celular)
  svg.setAttribute("width", String(W));
  svg.setAttribute("height", String(H));
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  // Contorno interno do "O": a própria letra só com traço, recortada pela elipse do portal
  // (sobra só a linha do miolo)
  const ring = (cls: string) => `<text class="intro-letter ${cls}" x="${xs[4]}" y="${baseline}" font-size="${size}" opacity="0">O</text>`;
  svg.innerHTML = `
    <defs>
      <mask id="intro-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
        <rect width="${W}" height="${H}" fill="#fff" />
        <g class="intro-zoom" fill="#000">${glyphs}${portal}</g>
      </mask>
      <clipPath id="intro-counter">
        <ellipse cx="${ox}" cy="${oy}" rx="${oInkWidth * 0.35}" ry="${oInkHeight * 0.405}" />
      </clipPath>
      <radialGradient id="intro-glow" gradientUnits="userSpaceOnUse" cx="${W / 2}" cy="${H / 2}" r="${Math.hypot(W, H) * 0.6}">
        <stop offset="0" stop-color="#1f4bc4" />
        <stop offset="0.45" stop-color="#10286e" />
        <stop offset="1" stop-color="#060d2a" />
      </radialGradient>
    </defs>
    <g mask="url(#intro-mask)" class="intro-cover">
      <rect width="${W}" height="${H}" class="intro-base" />
      <rect width="${W}" height="${H}" fill="url(#intro-glow)" class="intro-glow" />
    </g>
    <g class="intro-zoom">
      <g class="intro-fill" fill-opacity="1">${glyphs}</g>
      <g clip-path="url(#intro-counter)">${ring("intro-ring intro-ring--glow")}${ring("intro-ring")}</g>
    </g>
    <rect class="intro-flash" x="-${W}" y="-${H}" width="${W * 3}" height="${H * 3}" fill="#fff" opacity="0" />`;
  document.body.append(svg);
  // O SVG tem o mesmo cobalto do círculo que se expandiu: a troca é invisível
  root.remove();
  expander?.remove();

  const [maskGroup, visible] = [...svg.querySelectorAll<SVGGElement>(".intro-zoom")];
  const zoom = [maskGroup!, visible!];
  const rings = [...svg.querySelectorAll<SVGTextElement>(".intro-ring")];

  // Durante a abertura, um engasgo do navegador desacelera a animação em vez de pular etapas
  // (o site usa lagSmoothing(0) por causa da rolagem suave; restaurado no fim)
  gsap.ticker.lagSmoothing(120, 33);
  const tl = gsap.timeline({ onComplete: () => gsap.ticker.lagSmoothing(0) });
  // 0. O golpe: o nome surge inteiro de uma vez (corte seco), com um clarão, um tremor curto de
  //    câmera e uma aproximação lenta, como título de trailer
  tl.fromTo(svg.querySelector(".intro-flash"), { opacity: 0.85 }, { opacity: 0, duration: 0.55, ease: "power2.out" }, 0);
  const shake = [
    [14, -9],
    [-11, 7],
    [8, 6],
    [-6, -5],
    [4, 3],
    [-2, -2],
    [0, 0],
  ];
  shake.forEach(([x, y], i) => tl.to(svg, { x, y, duration: 0.045, ease: "none" }, i * 0.045));
  tl.fromTo(svg, { scale: 1 }, { scale: 1.05, duration: 2.8, ease: "power1.out", transformOrigin: "50% 50%" }, 0);
  // 1. Fade do branco para o transparente: as letras perdem o branco juntas e o site aparece
  //    por dentro delas
  tl.to(svg.querySelector(".intro-fill"), { attr: { "fill-opacity": 0 }, duration: 1.3, ease: "power1.inOut" }, 1.1);
  //    ...enquanto o miolo do "O" se abre e ganha um contorno branco luminoso, parado
  tl.to(svg.querySelector(".intro-portal"), { attr: { "fill-opacity": 1 }, duration: 0.8, ease: "sine.inOut" }, 1.5);
  tl.to(rings, { opacity: 1, duration: 0.7, ease: "power2.out" }, 1.8);
  // 4. Mergulho pelo portal: a câmera traz o "O" para o centro e atravessa o miolo. A escala
  //    cresce exponencialmente (sensação de velocidade constante), com início e fim suaves.
  //    Transformação aplicada à mão: dentro de <mask> o GSAP não acha a origem.
  const MAX = 45;
  // Raio do miolo (a linha do contorno): traço lateral ≈ 30% da largura, de cima/baixo ≈ 19%
  const counterRx = oInkWidth * 0.2;
  const counterRy = oInkHeight * 0.31;
  const lens = { p: 0 };
  tl.to(
    lens,
    {
      p: 1,
      duration: 2.1,
      ease: "power2.inOut",
      onUpdate: () => {
        const scale = MAX ** lens.p;
        const follow = Math.min(1, lens.p / 0.55);
        const eased = 1 - (1 - follow) ** 3;
        const fx = ox + (W / 2 - ox) * eased;
        const fy = oy + (H / 2 - oy) * eased;
        const t = `translate(${fx} ${fy}) scale(${scale}) translate(${-ox} ${-oy})`;
        zoom.forEach((group) => group.setAttribute("transform", t));
        // O contorno do miolo fica visível até sair da tela e some exatamente ao cruzar as bordas:
        // quando os cantos da tela entram na elipse do miolo, ele já está todo fora de vista
        const cornerX = W / 2 / (counterRx * scale);
        const cornerY = H / 2 / (counterRy * scale);
        const inside = Math.hypot(cornerX, cornerY);
        const ringFade = Math.min(1, Math.max(0, (inside - 0.92) / 0.2));
        rings.forEach((ring) => (ring.style.opacity = String(ringFade)));
      },
    },
    2.9,
  );
  tl.to(svg.querySelector(".intro-cover"), { opacity: 0, duration: 0.45, ease: "power1.inOut" }, 4.55);
  // O "Diego." do topo entra quando o site aparece
  tl.add(() => revealBrand(), 4.45);
  await tl.then();
  svg.remove();
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* ---------- Transição entre páginas ---------- */

const curtain = () => document.getElementById("curtain");

document.addEventListener("astro:before-preparation", (event) => {
  closeMenu(true);
  const el = curtain();
  if (!el || reduceMotion) return;
  const load = event.loader;
  event.loader = async () => {
    await Promise.all([
      gsap
        .fromTo(el, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 0.7, ease: "expo.inOut" })
        .then(),
      load(),
    ]);
  };
});

document.addEventListener("astro:before-swap", (event) => {
  // O preloader só existe na primeira carga
  event.newDocument.getElementById("preloader")?.remove();
  event.newDocument.documentElement.classList.add(...document.documentElement.classList);
  pageContext?.revert();
  pageContext = null;
});

document.addEventListener("astro:after-swap", () => {
  lenis?.scrollTo(0, { immediate: true, force: true });
  if (!lenis) scrollTo(0, 0);
});

/* ---------- Menu hambúrguer ---------- */

let menuOpen = false;
let menuTimeline: gsap.core.Timeline | null = null;

function setupMenu() {
  const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const panel = document.getElementById("menu");
  if (!toggle || !panel) return;

  menuTimeline = gsap
    .timeline({ paused: true })
    .set(panel, { visibility: "visible" })
    .fromTo(panel, { clipPath: "circle(0% at calc(100% - 3rem) 2.5rem)" }, {
      clipPath: "circle(150% at calc(100% - 3rem) 2.5rem)",
      duration: reduceMotion ? 0.01 : 0.9,
      ease: "expo.inOut",
    })
    .fromTo(
      panel.querySelectorAll("[data-menu-item]"),
      { yPercent: 110 },
      { yPercent: 0, duration: reduceMotion ? 0.01 : 0.9, stagger: 0.06, ease: EASE },
      "-=0.45",
    )
    .fromTo(panel.querySelectorAll("[data-menu-fade]"), { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.6");

  toggle.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

function openMenu() {
  const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const panel = document.getElementById("menu");
  if (!toggle || !panel || !menuTimeline) return;
  menuOpen = true;
  toggle.setAttribute("aria-expanded", "true");
  document.documentElement.classList.add("menu-open");
  panel.inert = false;
  lenis?.stop();
  menuTimeline.timeScale(1).play();
  panel.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
}

function closeMenu(instant = false) {
  if (!menuOpen) return;
  const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const panel = document.getElementById("menu");
  menuOpen = false;
  toggle?.setAttribute("aria-expanded", "false");
  document.documentElement.classList.remove("menu-open");
  if (panel) panel.inert = true;
  lenis?.start();
  if (instant) menuTimeline?.progress(0).pause();
  else menuTimeline?.timeScale(1.6).reverse();
  if (!instant) toggle?.focus({ preventScroll: true });
}

addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

/* ---------- Animações de página ---------- */

let pageContext: gsap.Context | null = null;
let firstLoad = true;

function splitLines(el: HTMLElement) {
  return SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-line" });
}

function setupPage(intro: Promise<void>) {
  pageContext = gsap.context(() => {
    // Títulos por linha (os do hero esperam a introdução)
    document.querySelectorAll<HTMLElement>("[data-split]:not([data-split=chars])").forEach((el) => {
      const split = splitLines(el);
      gsap.set(el, { opacity: 1 });
      const play = () =>
        gsap.from(split.lines, { yPercent: 115, duration: 1.3, stagger: 0.09, ease: EASE, delay: Number(el.dataset.delay ?? 0) });
      if (el.dataset.split === "intro") {
        gsap.set(split.lines, { yPercent: 115 });
        intro.then(() => {
          gsap.set(split.lines, { yPercent: 0 });
          play();
        });
      } else {
        // Escondido desde já: senão o título aparece inteiro ao entrar na tela e "pula"
        // para baixo quando a animação começa
        gsap.set(split.lines, { yPercent: 115 });
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () =>
            gsap.to(split.lines, { yPercent: 0, duration: 1.3, stagger: 0.09, ease: EASE, delay: Number(el.dataset.delay ?? 0) }),
        });
      }
    });

    // Títulos de seção letra a letra: cada letra sobe de trás da máscara girando para frente
    document.querySelectorAll<HTMLElement>("[data-split=chars]").forEach((el) => {
      const split = SplitText.create(el, { type: "lines,chars", mask: "lines", linesClass: "split-line" });
      gsap.set(el, { opacity: 1 });
      gsap.set(split.chars, { yPercent: 110, rotateX: -80, transformOrigin: "50% 100%" });
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () =>
          gsap.to(split.chars, { yPercent: 0, rotateX: 0, duration: 1.1, stagger: 0.025, ease: EASE }),
      });
    });

    // Parágrafos linha a linha, saindo de um leve desfoque. Sem máscara: dentro dela o
    // desfoque e o deslocamento seriam cortados em retângulos
    document.querySelectorAll<HTMLElement>("[data-lines]").forEach((el) => {
      const split = SplitText.create(el, { type: "lines" });
      gsap.set(el, { opacity: 1 });
      gsap.set(split.lines, { y: 24, opacity: 0, filter: "blur(6px)" });
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () =>
          gsap.to(split.lines, {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.1,
            stagger: 0.08,
            ease: EASE,
            clearProps: "filter",
          }),
      });
    });

    // Aparecer subindo (os do hero entram junto com a introdução)
    const introReveals = gsap.utils.toArray<HTMLElement>("[data-intro] [data-reveal]");
    intro.then(() =>
      gsap.fromTo(introReveals, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: EASE, delay: 0.3 }),
    );
    ScrollTrigger.batch("[data-reveal]:not([data-intro] [data-reveal])", {
      start: "top 90%",
      once: true,
      onEnter: (els) =>
        gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: EASE }),
    });

    // Texto que se acende com o scroll (rezonbio)
    document.querySelectorAll<HTMLElement>("[data-fill]").forEach((el) => {
      const split = SplitText.create(el, { type: "words" });
      gsap.fromTo(
        split.words,
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.6 },
        },
      );
    });

    // Cada seção escolhe a forma da nuvem de partículas
    const sceneSections = gsap.utils.toArray<HTMLElement>("[data-scene]");
    sceneSections.forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 55%", onToggle: (self) => self.isActive && setShape(el) });
    });
    // Forma inicial = seção que está na tela (o navegador pode restaurar a rolagem no reload)
    const line = innerHeight * 0.55;
    const visible = sceneSections.find((el) => {
      const r = el.getBoundingClientRect();
      return r.top <= line && r.bottom > line;
    });
    const initial = visible ?? sceneSections[0];
    if (initial) setShape(initial);

    if (reduceMotion) return;

    // Paralaxe
    document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
      const amount = Number(el.dataset.parallax || 1);
      gsap.fromTo(
        el,
        { yPercent: -8 * amount },
        { yPercent: 8 * amount, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      );
    });

    // Imagens reveladas por clip-path
    document.querySelectorAll<HTMLElement>("[data-clip]").forEach((el) => {
      gsap.fromTo(
        el,
        { clipPath: "inset(18% 12% 18% 12% round 1.5rem)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 0rem)",
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 90%", end: "top 25%", scrub: true },
        },
      );
    });

    // Faixas infinitas; cada uma tem sentido próprio e acelera de leve com o scroll
    document.querySelectorAll<HTMLElement>("[data-marquee]").forEach((el) => {
      const track = el.firstElementChild as HTMLElement;
      const dir = Number(el.dataset.marquee || 1) < 0 ? -1 : 1;
      const duration = Number(el.dataset.marqueeDuration || 80);
      const loop =
        dir > 0
          ? gsap.to(track, { xPercent: -50, duration, ease: "none", repeat: -1 })
          : gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, duration, ease: "none", repeat: -1 });
      ScrollTrigger.create({
        trigger: el,
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 600, 2.5);
          const sign = self.direction < 0 ? -1 : 1;
          gsap.to(loop, { timeScale: boost * sign, duration: 0.3, overwrite: true });
          gsap.to(loop, { timeScale: sign, duration: 1.5, delay: 0.3 });
        },
      });
    });

    if (!finePointer) return;

    // Preview flutuante das listas
    const preview = document.getElementById("preview");
    const previewImg = preview?.querySelector("img");
    if (preview && previewImg) {
      const xTo = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });
      const rTo = gsap.quickTo(preview, "rotation", { duration: 0.8, ease: "power3" });
      let lastX = 0;
      const move = (e: PointerEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
        rTo(gsap.utils.clamp(-10, 10, (e.clientX - lastX) * 0.6));
        lastX = e.clientX;
      };
      document.querySelectorAll<HTMLElement>("[data-preview]").forEach((row) => {
        row.addEventListener("pointerenter", (e) => {
          const src = row.dataset.previewSrc;
          if (!src) return;
          previewImg.src = src;
          gsap.set(preview, { x: e.clientX, y: e.clientY });
          lastX = e.clientX;
          gsap.to(preview, { scale: 1, opacity: 1, duration: 0.5, ease: EASE, overwrite: "auto" });
        });
        row.addEventListener("pointermove", move);
        row.addEventListener("pointerleave", () =>
          gsap.to(preview, { scale: 0.6, opacity: 0, duration: 0.4, ease: "power3.out", overwrite: "auto" }),
        );
      });
    }

    // Elementos magnéticos
    document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
      const strength = Number(el.dataset.magnetic || 0.3);
      const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      el.addEventListener("pointerleave", () => {
        xTo(0);
        yTo(0);
      });
    });
  });

  // Recalcula depois que as imagens carregam (alturas mudam)
  document.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  });
}

document.addEventListener("astro:page-load", () => {
  setupMenu();
  let intro: Promise<void>;
  if (firstLoad) {
    firstLoad = false;
    intro = runPreloader();
  } else {
    const el = curtain();
    intro = new Promise<void>((resolve) => {
      if (!el || reduceMotion) return resolve();
      gsap.to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.8, ease: "expo.inOut", delay: 0.05, onComplete: resolve });
    });
  }
  // Divide as linhas só depois das fontes: senão as quebras saem erradas
  document.fonts.ready.then(() => {
    setupPage(intro);
    ScrollTrigger.refresh();
  });
});
