"use client";

import { useEffect } from "react";

export function MotionSystem() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
    const mobileMenu = document.querySelector<HTMLDetailsElement>(".mobile-menu");
    const menuSummary = mobileMenu?.querySelector<HTMLElement>("summary");
    const firstMenuLink = mobileMenu?.querySelector<HTMLAnchorElement>(".mobile-nav a");
    const pageRegions = Array.from(
      document.querySelectorAll<HTMLElement>("main#main-content, footer.site-footer"),
    );

    root.classList.add("motion-ready");

    document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]").forEach((link) => {
      const linkPath = new URL(link.href).pathname.replace(/\/$/, "") || "/";
      if (linkPath === currentPath) link.setAttribute("aria-current", "page");
    });

    if (reducedMotion) {
      revealItems.forEach((item) => item.classList.add("in-view"));
    }

    const observer = reducedMotion
      ? null
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                observer?.unobserve(entry.target);
              }
            });
          },
          { rootMargin: "0px 0px -10%", threshold: 0.12 },
        );

    revealItems.forEach((item) => observer?.observe(item));

    let frame = 0;
    let menuFocusFrame = 0;
    const updateScrollState = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => root.classList.toggle("is-scrolled", window.scrollY > 24));
    };

    const closeMobileMenu = (event: Event) => {
      const link = (event.target as HTMLElement).closest(".mobile-nav a");
      link?.closest("details")?.removeAttribute("open");
    };

    const syncMobileMenu = () => {
      const menuOpen = mobileMenu?.open ?? false;

      cancelAnimationFrame(menuFocusFrame);
      pageRegions.forEach((region) => {
        region.inert = menuOpen;
      });
      menuSummary?.setAttribute("aria-label", menuOpen ? "Menu sluiten" : "Menu openen");

      if (menuOpen) {
        menuFocusFrame = requestAnimationFrame(() => firstMenuLink?.focus());
      }
    };

    const closeMenuOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileMenu?.open) {
        mobileMenu.open = false;
        syncMobileMenu();
        menuSummary?.focus();
      }
    };

    updateScrollState();
    syncMobileMenu();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    document.addEventListener("click", closeMobileMenu);
    document.addEventListener("keydown", closeMenuOnEscape);
    mobileMenu?.addEventListener("toggle", syncMobileMenu);

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(menuFocusFrame);
      pageRegions.forEach((region) => {
        region.inert = false;
      });
      window.removeEventListener("scroll", updateScrollState);
      document.removeEventListener("click", closeMobileMenu);
      document.removeEventListener("keydown", closeMenuOnEscape);
      mobileMenu?.removeEventListener("toggle", syncMobileMenu);
    };
  }, []);

  return null;
}
