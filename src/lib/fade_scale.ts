import type { EasingFunction } from "svelte/transition";

interface FadeScaleParams {
  delay?: number;
  duration?: number;
  easing?: EasingFunction;
  baseScale?: number;
}

interface TransitionConfig {
  delay: number;
  duration: number;
  css: (t: number) => string;
}

export const fadeScale = (
  node: HTMLElement | SVGElement,
  { delay = 0, duration = 200, easing = (x: number) => x, baseScale = 0 }: FadeScaleParams
): TransitionConfig => {
  // Set transform-origin to bottom center
  (node as HTMLElement).style.transformOrigin = "bottom center";
  (node as HTMLElement).style.position = "absolute";

  const o = +getComputedStyle(node).opacity;
  const m = getComputedStyle(node).transform.match(/scale\(([0-9.]+)\)/);
  const s = m ? parseFloat(m[1]) : 1;
  const is = 1 - baseScale;

  return {
    delay,
    duration,
    css: (t: number) => {
      const eased = easing(t);
      return `opacity: ${eased * o}; transform: scale(${eased * s * is + baseScale}); position: absolute;`;
    }
  };
};
