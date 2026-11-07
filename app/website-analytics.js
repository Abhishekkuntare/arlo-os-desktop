"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function showStatus(message, state) {
  const status = document.getElementById("website-analytics-status");
  if (!status) return;
  status.dataset.state = state;
  status.textContent = message;
}

function updateTotals(totals) {
  const counters = [
    ["website-page-views", totals.pageViews],
    ["arlo-os-download-clicks", totals.arloOsDownloadClicks],
    ["arlo-deck-download-clicks", totals.arloDeckDownloadClicks]
  ];

  for (const [id, value] of counters) {
    const counter = document.getElementById(id);
    if (counter) counter.textContent = new Intl.NumberFormat().format(value);
  }
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
    "Anonymous website page views · all time",
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
        if (pathname === "/") await loadTotals();
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
