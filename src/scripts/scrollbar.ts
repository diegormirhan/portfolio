/*
 * Barra de rolagem própria (desktop com mouse): a nativa fica escondida e esta assume.
 * - polegar em degradê da paleta (cobalto → cerúleo; vermelho no dev mode, via CSS);
 * - ao rolar acende e estica levemente com a velocidade; parado, recolhe e fica discreto;
 * - hover engorda; dá para arrastar o polegar e clicar no trilho para pular até ali.
 * No celular (toque) fica a barra nativa, que já é sobreposta e some sozinha.
 */
import { lenis } from "./motion";

const bar = document.getElementById("scrollbar");
const thumb = bar?.querySelector<HTMLElement>(".scrollbar__thumb");

if (bar && thumb && matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.documentElement.classList.add("has-scrollbar");
  const html = document.documentElement;
  let size = 0; // altura do polegar (px)
  let travel = 0; // quanto o polegar anda
  let max = 0; // rolagem máxima
  let idle = 0;
  let stretch = 0;

  const measure = () => {
    const view = innerHeight;
    max = Math.max(0, html.scrollHeight - view);
    size = max > 0 ? Math.max(48, (view / html.scrollHeight) * (view - 16)) : 0;
    travel = view - 16 - size;
    thumb.style.height = `${size}px`;
    bar.classList.toggle("is-empty", max <= 0);
  };

  const place = (y: number, velocity = 0) => {
    const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    // Estica na direção do movimento (até ~35%) e volta devagar
    stretch += (Math.min(Math.abs(velocity) / 60, 0.35) - stretch) * 0.35;
    const grow = size * stretch;
    const offset = velocity < 0 ? -grow : 0;
    thumb.style.transform = `translateY(${p * travel + offset}px) scaleY(${(size + grow) / Math.max(size, 1)})`;
    bar.classList.add("is-active");
    clearTimeout(idle);
    idle = window.setTimeout(() => bar.classList.remove("is-active"), 900);
  };

  measure();
  new ResizeObserver(measure).observe(document.body);
  addEventListener("resize", measure);
  document.addEventListener("astro:page-load", () => {
    measure();
    place(scrollY);
  });
  // Rolagem nativa: cobre tudo (roda, teclado, âncoras, Lenis); a velocidade vem do Lenis
  addEventListener("scroll", () => place(scrollY, lenis.velocity), { passive: true });
  // Solta: o estiramento volta a zero mesmo sem novo evento de rolagem
  const relax = () => {
    if (stretch > 0.005) place(scrollY, 0);
    requestAnimationFrame(relax);
  };
  requestAnimationFrame(relax);

  // Arrastar o polegar
  let dragFrom = -1;
  let scrollFrom = 0;
  thumb.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    thumb.setPointerCapture(e.pointerId);
    dragFrom = e.clientY;
    scrollFrom = lenis.scroll;
    bar.classList.add("is-dragging");
  });
  thumb.addEventListener("pointermove", (e) => {
    if (dragFrom < 0 || travel <= 0) return;
    lenis.scrollTo(scrollFrom + ((e.clientY - dragFrom) / travel) * max, { immediate: true });
  });
  const release = () => {
    dragFrom = -1;
    bar.classList.remove("is-dragging");
  };
  thumb.addEventListener("pointerup", release);
  thumb.addEventListener("pointercancel", release);

  // Clique no trilho: rola suave até o ponto (centro do polegar ali)
  bar.addEventListener("pointerdown", (e) => {
    if (e.target === thumb || travel <= 0) return;
    const y = e.clientY - bar.getBoundingClientRect().top - size / 2;
    lenis.scrollTo((Math.min(Math.max(y, 0), travel) / travel) * max, { duration: 1.1 });
  });
}
