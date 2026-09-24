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

const lenis = reduceMotion ? null : new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
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

  // Sobe até 80% sozinho; os 20% finais esperam fontes e cena (com teto de 4s).
  const fake = gsap.to(progress, { value: 80, duration: 1.1, ease: "power2.out", onUpdate: render });
  await Promise.race([Promise.all([document.fonts.ready, sceneReady(), fake.then()]), wait(4000)]);
  await gsap.to(progress, { value: 100, duration: 0.35, ease: "power1.inOut", onUpdate: render }).then();
  await gsap
    .timeline()
    .to(root.querySelectorAll("[data-fade]"), { opacity: 0, y: -12, duration: 0.4, stagger: 0.04, ease: "power2.in" })
    .to(root, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, "-=0.1")
    .then();
  root.remove();
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
        ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: play });
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

    // Parágrafos linha a linha, saindo de um leve desfoque
    document.querySelectorAll<HTMLElement>("[data-lines]").forEach((el) => {
      const split = splitLines(el);
      gsap.set(el, { opacity: 1 });
      gsap.set(split.lines, { yPercent: 60, opacity: 0, filter: "blur(8px)" });
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () =>
          gsap.to(split.lines, {
            yPercent: 0,
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
