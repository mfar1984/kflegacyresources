"use client";

import { useEffect } from "react";

type Props = {
  ids: string[]; // accordion container IDs (e.g., generalFAQ)
};

export default function AccordionDebug({ ids }: Props) {
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-debug", "accordion");
    styleEl.innerHTML = `
      .accordion-body { outline: 1px dashed #ff4d4f; }
    `;
    document.head.appendChild(styleEl);

    const listeners: Array<() => void> = [];

    const logComputed = (el: Element | null, phase: string) => {
      if (!el) return;
      const body = el.querySelector(".accordion-body") as HTMLElement | null;
      if (!body) return;
      const cs = window.getComputedStyle(body);
      const parentSection = body.closest(".section");
      const vars = parentSection
        ? getComputedStyle(parentSection as Element)
        : getComputedStyle(document.documentElement);
      console.log("[FAQ DEBUG]", {
        phase,
        id: (el as HTMLElement).id,
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        defaultColorVar: vars.getPropertyValue("--default-color"),
        contrastColorVar: vars.getPropertyValue("--contrast-color"),
        headingColorVar: vars.getPropertyValue("--heading-color"),
        sectionClasses: parentSection?.className || "",
      });
    };

    const attachForId = (id: string) => {
      const acc = document.getElementById(id);
      if (!acc) return;
      const collapses = Array.from(acc.querySelectorAll<HTMLElement>(".accordion-collapse"));

      collapses.forEach((c) => {
        const onShow = () => logComputed(c, "show.bs.collapse");
        const onShown = () => logComputed(c, "shown.bs.collapse");
        const onHide = () => logComputed(c, "hide.bs.collapse");
        const onHidden = () => logComputed(c, "hidden.bs.collapse");

        c.addEventListener("show.bs.collapse", onShow);
        c.addEventListener("shown.bs.collapse", onShown);
        c.addEventListener("hide.bs.collapse", onHide);
        c.addEventListener("hidden.bs.collapse", onHidden);

        listeners.push(() => {
          c.removeEventListener("show.bs.collapse", onShow);
          c.removeEventListener("shown.bs.collapse", onShown);
          c.removeEventListener("hide.bs.collapse", onHide);
          c.removeEventListener("hidden.bs.collapse", onHidden);
        });

        // Initial snapshot
        logComputed(c, "initial");
      });

      // Observe class/style mutations that could flip color
      const obs = new MutationObserver(() => {
        collapses.forEach((c) => logComputed(c, "mutation"));
      });
      obs.observe(acc, { attributes: true, subtree: true, attributeFilter: ["class", "style"] });
      listeners.push(() => obs.disconnect());
    };

    ids.forEach(attachForId);

    return () => {
      listeners.forEach((fn) => fn());
      styleEl.remove();
    };
  }, [ids]);

  return null;
}
