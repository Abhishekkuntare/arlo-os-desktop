"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

let totalsAnimationFrame = 0;

function showStatus(message, state) {
  const status = document.getElementById("website-analytics-status");
  if (!status) return;
  status.dataset.state = state;
  status.textContent = message;
}

function updateTotals(totals) {
  const updates = [
    ["website-page-views", totals.pageViews],
    ["arlo-os-download-clicks", totals.arloOsDownloadClicks],
    ["arlo-deck-download-clicks", totals.arloDeckDownloadClicks]
  ]
    .map(([id, target]) => {
      const counter = document.getElementById(id);
      if (!counter) return null;

      return {
        counter,
        startValue: Number(counter.textContent.replace(/[^\d-]/g, "")) || 0,
        target
      };
    })
    .filter(Boolean);

  if (!updates.length) return;

  window.cancelAnimationFrame(totalsAnimationFrame);
  const numberFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  });
  const formatCounter = value => numberFormatter.format(Math.round(value));
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    updates.forEach(({ counter, target }) => {
      counter.textContent = formatCounter(target);
    });
    return;
  }

  const startTime = performance.now();
  const animate = now => {
    const progress = Math.min((now - startTime) / 1400, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 4);

    updates.forEach(({ counter, startValue, target }) => {
      counter.textContent = formatCounter(
        startValue + (target - startValue) * easedProgress
      );
    });

    if (progress < 1) {
      totalsAnimationFrame = window.requestAnimationFrame(animate);
    } else {
      totalsAnimationFrame = 0;
      updates.forEach(({ counter, target }) => {
        counter.textContent = formatCounter(target);
      });
    }
  };

  totalsAnimationFrame = window.requestAnimationFrame(animate);
}

async function loadTotals() {
  const response = await fetch("/api/analytics", {
    headers: { Accept: "application/json" },
    cache: "no-store"
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Website analytics are unavailable.");
  }

  updateTotals(result);
  showStatus(
    "Website page views · all time",
    "live"
  );
}

async function recordEvent(eventName, productName = null) {
  const response = await fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName, productName }),
    keepalive: true
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Website activity could not be recorded.");
  }
}

function productForLink(link) {
  const product = link.dataset.analyticsDownload;
  if (product === "arlo_os" || product === "arlo_deck") return product;

  const href = link.getAttribute("href") || "";
  if (href.includes("apps.microsoft.com/store/detail/9NN6LSN1KSZF")) {
    return "arlo_os";
  }
  if (href.includes("/apps/arlo-deck.apk")) return "arlo_deck";
  if (href.includes("/downloads/ARLO-OS-Setup.exe")) return "arlo_os";
  return null;
}

export default function WebsiteAnalytics() {
  const pathname = usePathname();
  const lastPathname = useRef(null);

  useEffect(() => {
    if (!pathname || lastPathname.current === pathname) return;
    lastPathname.current = pathname;

    void (async () => {
      try {
        await recordEvent("page_view");
        await loadTotals();
      } catch (error) {
        console.warn("ARLO OS website analytics:", error.message);
        if (pathname === "/") {
          showStatus(
            "Live totals are unavailable. Analytics storage may need setup.",
            "error"
          );
        }
      }
    })();
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      if (!link) return;

      const productName = productForLink(link);
      if (!productName) return;

      void recordEvent("download_click", productName)
        .then(loadTotals)
        .catch((error) => {
          console.warn("ARLO OS download analytics:", error.message);
          showStatus(
            "A download click could not be recorded. Please try again later.",
            "error"
          );
        });
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
