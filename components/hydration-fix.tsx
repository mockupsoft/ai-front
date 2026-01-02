"use client";

import { useEffect } from "react";

/**
 * Client component to fix hydration mismatches caused by browser extensions
 * that add className attributes to the HTML element.
 */
export function HydrationFix() {
  useEffect(() => {
    // Remove browser extension classNames that cause hydration mismatches
    const extensionClasses = ["fusion-extension-loaded"];
    
    const cleanup = () => {
      const html = document.documentElement;
      if (html) {
        extensionClasses.forEach((cls) => {
          if (html.classList.contains(cls)) {
            html.classList.remove(cls);
          }
        });
      }
    };

    // Clean up immediately
    cleanup();

    // Also clean up after a short delay to catch any late additions
    const timeoutId = setTimeout(cleanup, 100);

    // Use MutationObserver to watch for className changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          cleanup();
        }
      });
    });

    if (document.documentElement) {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  return null;
}

