"use client";

import { useEffect } from "react";

export function StudioMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".music-site");
    const stage = root?.querySelector<HTMLElement>(".music-hero-art");
    if (!root) return;

    root.classList.add("motion-ready");
    const items = root.querySelectorAll<HTMLElement>(
      ".music-section-heading, .music-service-card, .music-beat-card, .music-video-card, .music-budget-card, .music-shop-card, .music-process-band li, .music-quote aside",
    );
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.14, rootMargin: "0px 0px -36px 0px" },
    );
    items.forEach((item, index) => {
      item.setAttribute("data-reveal", "");
      item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
      observer.observe(item);
    });

    const handlePointerMove = (event: PointerEvent) => {
      if (!stage || event.pointerType === "touch") return;
      const bounds = stage.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      stage.style.setProperty("--tilt-x", `${-y * 5}deg`);
      stage.style.setProperty("--tilt-y", `${x * 6}deg`);
    };
    const resetTilt = () => {
      stage?.style.setProperty("--tilt-x", "0deg");
      stage?.style.setProperty("--tilt-y", "0deg");
    };

    stage?.addEventListener("pointermove", handlePointerMove);
    stage?.addEventListener("pointerleave", resetTilt);
    return () => {
      observer.disconnect();
      stage?.removeEventListener("pointermove", handlePointerMove);
      stage?.removeEventListener("pointerleave", resetTilt);
      root.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
