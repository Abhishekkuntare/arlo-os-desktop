(() => {

  "use strict";


  /* ==========================================================
     ELEMENTS
  ========================================================== */

  const downloadButton =
    document.getElementById("downloadButton");

  const downloadNote =
    document.getElementById("downloadNote");

  const windowCard =
    document.getElementById("windowCard");

  const desktopStage =
    document.getElementById("desktopStage");

  const cursorGlow =
    document.getElementById("cursorGlow");

  const mobileMenuButton =
    document.getElementById("mobileMenuButton");

  const mobileMenu =
    document.getElementById("mobileMenu");

  const consentStorageKey = "arlo-cookie-consent-v1";
  const consentBanner = document.getElementById("cookie-banner");
  const consentDialog = document.getElementById("cookie-preferences");
  const experienceToggle = document.getElementById("cookie-experience-toggle");
  const consentStatus = document.getElementById("cookie-status");
  let savedConsent = null;
  let optionalEnhancementsPromise = null;
  let enhancementsEnabled = false;

  const loadScript = src =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Unable to load optional resource: ${src}`));
      document.head.append(script);
    });

  const loadOptionalEnhancements = () => {
    if (optionalEnhancementsPromise) return optionalEnhancementsPromise;

    optionalEnhancementsPromise = (async () => {
      const fonts = document.createElement("link");
      fonts.rel = "stylesheet";
      fonts.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap";
      document.head.append(fonts);

      await loadScript("https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js");
      await loadScript("https://unpkg.com/lenis@1.3.26/dist/lenis.min.js");
      document.dispatchEvent(new Event("arlo:experience-ready"));
    })().catch(error => {
      optionalEnhancementsPromise = null;
      console.error("ARLO OS experience enhancements could not be loaded:", error);
      if (consentStatus) {
        consentStatus.textContent =
          "Your choice was saved, but some optional visual enhancements could not load.";
      }
    });

    return optionalEnhancementsPromise;
  };

  const persistConsent = experience => {
    const consent = {
      version: 1,
      experience,
      savedAt: Date.now()
    };
    savedConsent = consent;

    try {
      window.localStorage.setItem(consentStorageKey, JSON.stringify(consent));
    } catch (error) {
      console.error("Unable to persist ARLO OS privacy preferences:", error);
      if (consentStatus) {
        consentStatus.textContent =
          "Your choice applies for this visit, but your browser could not save it.";
      }
    }

    if (consentDialog.open) consentDialog.close();
    consentBanner.classList.remove("is-visible");
    window.setTimeout(() => {
      consentBanner.hidden = true;
    }, 350);

    if (experience) {
      enhancementsEnabled = true;
      loadOptionalEnhancements();
    } else if (enhancementsEnabled) {
      window.location.reload();
    }
  };

  const openConsentPreferences = () => {
    if (consentBanner) consentBanner.hidden = true;
    if (experienceToggle) {
      experienceToggle.checked = Boolean(savedConsent?.experience);
    }
    if (consentDialog && !consentDialog.open) consentDialog.showModal();
  };

  if (consentBanner && consentDialog) {
    try {
      const storedConsent = window.localStorage.getItem(consentStorageKey);
      if (storedConsent) {
        const parsedConsent = JSON.parse(storedConsent);
        const isValidConsent =
          parsedConsent?.version === 1 &&
          typeof parsedConsent.experience === "boolean" &&
          Number.isFinite(parsedConsent.savedAt);

        if (isValidConsent) {
          savedConsent = parsedConsent;
          enhancementsEnabled = parsedConsent.experience;
          if (enhancementsEnabled) loadOptionalEnhancements();
        } else {
          window.localStorage.removeItem(consentStorageKey);
        }
      }
    } catch (error) {
      console.error("Unable to read ARLO OS privacy preferences:", error);
    }

    if (!savedConsent) {
      window.setTimeout(() => {
        consentBanner.hidden = false;
        window.requestAnimationFrame(() => consentBanner.classList.add("is-visible"));
      }, 700);
    }

    document.querySelectorAll("[data-cookie-action]").forEach(button => {
      button.addEventListener("click", () => {
        switch (button.dataset.cookieAction) {
          case "accept":
            persistConsent(true);
            break;
          case "reject":
            persistConsent(false);
            break;
          case "preferences":
            openConsentPreferences();
            break;
          case "save":
            persistConsent(Boolean(experienceToggle?.checked));
            break;
          case "close":
            consentDialog.close();
            if (!savedConsent) {
              consentBanner.hidden = false;
              window.requestAnimationFrame(() => consentBanner.classList.add("is-visible"));
            }
            break;
        }
      });
    });

    consentDialog.addEventListener("click", event => {
      if (event.target === consentDialog) consentDialog.close();
    });

    consentDialog.addEventListener("close", () => {
      if (!savedConsent) {
        consentBanner.hidden = false;
        window.requestAnimationFrame(() => consentBanner.classList.add("is-visible"));
      }
    });
  }


  /* ==========================================================
     REDUCED MOTION
  ========================================================== */

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  const analyticsCounters =
    document.querySelectorAll(".insight-number[data-count]");

  if (analyticsCounters.length) {
    const insightsStatus = document.getElementById("insights-status");
    const refreshInsightsButton =
      document.getElementById("insights-refresh");
    const countryList = document.querySelector(".insights-country-list");

    const formatCounter = (value, decimals) =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value);

    const animateCounterTo = (counter, target, fromZero = false) => {
      const decimals = Number(counter.dataset.decimals || 0);
      if (reducedMotion) {
        counter.textContent = formatCounter(target, decimals);
        return;
      }

      const duration = 1400;
      const startTime = performance.now();
      const startValue = fromZero
        ? 0
        : Number(counter.textContent.replace(/,/g, "")) || 0;

      const update = now => {
        const progress = Math.min((now - startTime) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 4);
        counter.textContent = formatCounter(
          startValue + (target - startValue) * easedProgress,
          decimals
        );

        if (progress < 1) {
          window.requestAnimationFrame(update);
        } else {
          counter.textContent = formatCounter(target, decimals);
        }
      };

      window.requestAnimationFrame(update);
    };

    const animateCounter = counter => {
      const target = Number(counter.dataset.count);
      if (!Number.isFinite(target)) {
        throw new Error("Analytics counter has an invalid data-count value.");
      }
      animateCounterTo(counter, target, true);
    };

    const setInsightsStatus = (message, state) => {
      if (!insightsStatus) return;
      insightsStatus.dataset.state = state;
      insightsStatus.innerHTML = `<span></span> ${message}`;
    };

    const marketName = market => {
      if (market === "ZZ" || market === "UNKNOWN") return "Other / unknown market";
      try {
        return new Intl.DisplayNames(["en"], { type: "region" }).of(market) ||
          `Other / ${market}`;
      } catch {
        return `Other / ${market}`;
      }
    };

    const createCountryRow = (name, installs, percentage, isOther = false) => {
      const row = document.createElement("div");
      row.className = `insights-country-row${isOther ? " insights-country-other" : ""}`;
      row.setAttribute("role", "row");

      const country = document.createElement("span");
      country.setAttribute("role", "cell");
      country.textContent = name;

      const value = document.createElement("span");
      value.className = "insights-country-value";
      value.setAttribute("role", "cell");

      const bar = document.createElement("span");
      bar.className = "insights-country-bar";
      const fill = document.createElement("i");
      fill.style.setProperty("--country-share", `${percentage}%`);
      bar.append(fill);

      const count = document.createElement("b");
      count.textContent = formatCounter(installs, 0);

      const share = document.createElement("small");
      share.textContent = isOther ? "not Store" : `${percentage.toFixed(2)}%`;

      value.append(bar, count, share);
      row.append(country, value);
      return row;
    };

    const renderCountries = (markets, otherDownloads) => {
      if (!countryList) return;

      const total = markets.reduce((sum, market) => sum + market.installs, 0);
      const rows = markets.map(market => {
        const percentage = total > 0
          ? (market.installs / total) * 100
          : 0;
        return createCountryRow(
          marketName(market.market),
          market.installs,
          percentage
        );
      });

      rows.push(
        createCountryRow(
          "Other · outside Store report",
          otherDownloads,
          0,
          true
        )
      );

      const header = countryList.querySelector(".insights-country-header");
      countryList.replaceChildren(header, ...rows);
    };

    const refreshInsights = async () => {
      if (refreshInsightsButton) refreshInsightsButton.disabled = true;
      setInsightsStatus("CONNECTING TO PARTNER CENTER", "loading");

      try {
        const refreshQuery = refreshInsightsButton
          ? `?refresh=${Date.now()}`
          : "";
        const response = await fetch(`/api/insights${refreshQuery}`, {
          headers: { Accept: "application/json" },
          cache: "no-store"
        });
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 503) {
            setInsightsStatus("SNAPSHOT · PARTNER CENTER NOT CONNECTED", "snapshot");
          } else {
            setInsightsStatus("SNAPSHOT · SHARED FIGURES", "snapshot");
          }
          if (data.error && response.status !== 503) {
            console.warn("ARLO OS analytics:", data.error);
          }
          return;
        }

        const validCounts = [
          data.storeInstalls,
          data.totalDownloads,
          data.pageViews,
          data.conversionRate,
          data.otherDownloads,
          data.installAttempts,
          data.funnelSuccessfulInstalls,
          data.firstTimeLaunches
        ].every(value => Number.isFinite(value) && value >= 0);

        if (!validCounts || !Array.isArray(data.markets)) {
          throw new Error("Partner Center returned an invalid analytics response.");
        }

        const updates = [
          ["insight-download-total", data.totalDownloads],
          ["insight-store-installs", data.storeInstalls],
          ["insight-page-views", data.pageViews],
          ["insight-conversion", data.conversionRate],
          ["insight-funnel-page-views", data.pageViews],
          ["insight-install-attempts", data.installAttempts],
          ["insight-funnel-installs", data.funnelSuccessfulInstalls],
          ["insight-first-launches", data.firstTimeLaunches]
        ];

        updates.forEach(([id, value]) => {
          const counter = document.getElementById(id);
          if (counter) animateCounterTo(counter, value);
        });

        const funnelTotal = data.pageViews;
        const funnelValues = [
          data.pageViews,
          data.installAttempts,
          data.funnelSuccessfulInstalls,
          data.firstTimeLaunches
        ];
        document.querySelectorAll(".insights-funnel-step").forEach((step, index) => {
          const fill = step.querySelector("i");
          if (fill) {
            fill.style.setProperty(
              "--funnel-value",
              `${funnelTotal > 0 ? Math.min((funnelValues[index] / funnelTotal) * 100, 100) : 0}%`
            );
          }
        });

        renderCountries(data.markets, data.otherDownloads);

        const updatedAt = new Intl.DateTimeFormat("en", {
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short"
        }).format(new Date(data.updatedAt));
        setInsightsStatus(`LIVE · UPDATED ${updatedAt}`, "live");
      } catch (error) {
        console.error("ARLO OS analytics refresh failed:", error);
        setInsightsStatus("SNAPSHOT · SHARED FIGURES", "snapshot");
      } finally {
        if (refreshInsightsButton) refreshInsightsButton.disabled = false;
      }
    };

    if (reducedMotion || !("IntersectionObserver" in window)) {
      analyticsCounters.forEach(animateCounter);
    } else {
      const counterObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.35 }
      );

      analyticsCounters.forEach(counter => counterObserver.observe(counter));
    }

    if (refreshInsightsButton) {
      refreshInsightsButton.addEventListener("click", refreshInsights);
    }
    refreshInsights();
    window.setInterval(() => {
      if (document.visibilityState === "visible") refreshInsights();
    }, 15 * 60 * 1000);
  }


  /* ==========================================================
     MOBILE MENU
  ========================================================== */

  if (
    mobileMenuButton &&
    mobileMenu
  ) {

    const setMobileMenuOpen = open => {
      mobileMenu.classList.toggle(
        "open",
        open
      );

      mobileMenuButton.setAttribute(
        "aria-expanded",
        String(open)
      );

      mobileMenuButton.setAttribute(
        "aria-label",
        open ? "Close menu" : "Open menu"
      );
    };

    mobileMenuButton.addEventListener(
      "click",
      () => {
        setMobileMenuOpen(
          mobileMenuButton.getAttribute("aria-expanded") !== "true"
        );
      }
    );


    mobileMenu
      .querySelectorAll("a")
      .forEach(link => {

        link.addEventListener(
          "click",
          () => {
            setMobileMenuOpen(false);
          }
        );

      });

  }

  if (
    !reducedMotion &&
    window.matchMedia("(pointer:fine)").matches
  ) {
    document
      .querySelectorAll(".experience-card,.feature,.install-step,.spec-card,.release-card")
      .forEach(card => {
        card.addEventListener("pointermove", event => {
          if (event.pointerType === "touch") return;
          const bounds = card.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width;
          const y = (event.clientY - bounds.top) / bounds.height;
          card.style.setProperty("--pointer-x", `${(x * 100).toFixed(1)}%`);
          card.style.setProperty("--pointer-y", `${(y * 100).toFixed(1)}%`);
          card.style.setProperty("--card-rotate-x", `${((.5 - y) * 6).toFixed(2)}deg`);
          card.style.setProperty("--card-rotate-y", `${((x - .5) * 7).toFixed(2)}deg`);
        });

        card.addEventListener("pointerleave", () => {
          card.style.setProperty("--card-rotate-x", "0deg");
          card.style.setProperty("--card-rotate-y", "0deg");
          card.style.setProperty("--pointer-x", "50%");
          card.style.setProperty("--pointer-y", "50%");
        });
      });
  }


  /* ==========================================================
     DOWNLOAD
  ========================================================== */

  if (downloadButton) {

    downloadButton.addEventListener(
      "click",
      () => {

        if (downloadNote) {

          downloadNote.textContent =
            "Starting ARLO OS installer…";

        }

        downloadButton.classList.add(
          "is-downloading"
        );

        setTimeout(
          () => {

            downloadButton.classList.remove(
              "is-downloading"
            );

          },
          1800
        );

      }
    );

  }


  /* ==========================================================
     CURSOR GLOW
  ========================================================== */

  if (
    cursorGlow &&
    !reducedMotion &&
    window.matchMedia(
      "(pointer:fine)"
    ).matches
  ) {

    let mouseX = 0;
    let mouseY = 0;

    let glowX = 0;
    let glowY = 0;
    let glowFrame = 0;


    const animateGlow = () => {
      const deltaX = mouseX - glowX;
      const deltaY = mouseY - glowY;

      glowX += deltaX * .12;
      glowY += deltaY * .12;
      cursorGlow.style.transform =
        `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;

      if (Math.abs(deltaX) > .1 || Math.abs(deltaY) > .1) {
        glowFrame = window.requestAnimationFrame(animateGlow);
      } else {
        glowX = mouseX;
        glowY = mouseY;
        cursorGlow.style.transform =
          `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
        glowFrame = 0;
      }
    };

    window.addEventListener(
      "pointermove",
      event => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        cursorGlow.style.opacity = "1";

        if (!glowFrame) {
          glowFrame = window.requestAnimationFrame(animateGlow);
        }
      },
      { passive: true }
    );

    window.addEventListener("pointerleave", () => {
      cursorGlow.style.opacity = "0";
    });

  }


  /* ==========================================================
     GSAP
  ========================================================== */

  let gsapInitialized = false;
  let smoothScrollInitialized = false;
  let smoothScrollAttempts = 0;

  function initSmoothScroll(gsap) {

    if (smoothScrollInitialized || reducedMotion) return;

    if (typeof window.Lenis === "undefined") {
      if (smoothScrollAttempts < 25) {
        smoothScrollAttempts += 1;
        window.setTimeout(() => initSmoothScroll(gsap), 200);
      }
      return;
    }

    const lenis = new window.Lenis({
      autoRaf: false,
      anchors: true,
      lerp: .085,
      smoothWheel: true,
      syncTouch: false
    });

    lenis.on("scroll", window.ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    window.ScrollTrigger.refresh();
    smoothScrollInitialized = true;

  }

  function initGSAP() {

    if (gsapInitialized) return;

    const gsapAvailable =
      typeof window.gsap !== "undefined";

    const scrollTriggerAvailable =
      typeof window.ScrollTrigger !== "undefined";

    // Never allow .reveal elements to remain hidden when an external
    // animation dependency is unavailable. The content must always render.
    if (reducedMotion || !gsapAvailable || !scrollTriggerAvailable) {

      if (
        enhancementsEnabled &&
        !reducedMotion &&
        (!gsapAvailable || !scrollTriggerAvailable)
      ) {
        window.setTimeout(() => {
          if (!gsapInitialized) initGSAP();
        }, 400);
      }

      document
        .querySelectorAll(".reveal")
        .forEach(element => {
          element.style.opacity = "1";
          element.style.transform = "none";
          element.style.visibility = "visible";
        });

      return;
    }


    const gsap =
      window.gsap;

    gsapInitialized = true;


    if (
      typeof window.ScrollTrigger !==
      "undefined"
    ) {

      gsap.registerPlugin(
        window.ScrollTrigger
      );

    }

    initSmoothScroll(gsap);


    /* ========================================================
       HERO
    ====================================================== */

    const hero =
      gsap.timeline({
        defaults: {
          ease:
            "power4.out",
          immediateRender: false
        }
      });


    hero

      .from(
        ".hero-brand-lockup",
        {
          y: 18,
          opacity: 0,
          duration: .85
        }
      )

      .from(
        ".hero-eyebrow",
        {
          y: 25,
          opacity: 0,
          duration: .8
        }
      )

      .from(
        ".title-line",
        {
          y: 80,
          opacity: 0,
          duration: 1.1,
          stagger: .13
        },
        "-=.2"
      )

      .from(
        ".hero-copy",
        {
          y: 25,
          opacity: 0,
          duration: .8
        },
        "-=.55"
      )

      .from(
        ".hero-actions",
        {
          y: 25,
          opacity: 0,
          duration: .7
        },
        "-=.45"
      )

      .from(
        ".download-meta",
        {
          y: 12,
          opacity: 0,
          duration: .5
        },
        "-=.35"
      )

      .from(
        ".desktop-stage",
        {
          y: 80,
          opacity: 0,
          scale: .94,
          duration: 1.2,
          ease:
            "power3.out"
        },
        "-=.15"
      )

      .from(
        ".floating-pill",
        {
          y: 15,
          opacity: 0,
          duration: .5
        },
        "-=.5"
      );


    /* ========================================================
       STAGE
    ====================================================== */

    gsap.to(
      ".stage-glow",
      {
        scale: 1.15,
        opacity: .22,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease:
          "sine.inOut"
      }
    );

    gsap.to(
      ".hero-brand-lockup > img",
      {
        y: -5,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      }
    );


    gsap.to(
      ".floating-pill",
      {
        y: -7,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease:
          "sine.inOut"
      }
    );


    gsap.to(
      ".floating-status",
      {
        y: -6,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease:
          "sine.inOut"
      }
    );


    /* ========================================================
       ORBITS
    ====================================================== */

    gsap.to(
      ".orbit-one",
      {
        rotation: 360,
        duration: 80,
        repeat: -1,
        ease: "none"
      }
    );


    gsap.to(
      ".orbit-two",
      {
        rotation: -360,
        duration: 110,
        repeat: -1,
        ease: "none"
      }
    );


    /* ========================================================
       WALLPAPER
    ====================================================== */

    gsap.to(
      ".orb-a",
      {
        x: 30,
        y: -20,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease:
          "sine.inOut"
      }
    );


    gsap.to(
      ".orb-b",
      {
        x: -25,
        y: 20,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease:
          "sine.inOut"
      }
    );


    /* ========================================================
       REVEALS
    ====================================================== */

    if (
      typeof window.ScrollTrigger !==
      "undefined"
    ) {

      document
        .querySelectorAll(".reveal")
        .forEach(element => {

          gsap.fromTo(
            element,
            {
              opacity: 0,
              y: 45
            },
            {
              opacity: 1,
              y: 0,
              duration: .9,
              ease:
                "power3.out",
              clearProps: "transform",

              scrollTrigger: {

                trigger:
                  element,

                start:
                  "top 84%",

                once:
                  true

              }

            }
          );

        });


      /* Experience cards use their individual .reveal animations above. */


      /* ======================================================
         FEATURES
      ==================================================== */

      // Feature cards are covered by the generic .reveal animation above.
      // A second GSAP transform on the same cards can conflict with the
      // reveal and cause some cards to remain invisible after recalculation.
      // Keep one animation path only.


      /* ======================================================
         PARALLAX
      ==================================================== */

      gsap.to(
        ".window-card",
        {
          y: -45,

          scrollTrigger: {

            trigger:
              ".desktop-stage",

            start:
              "top bottom",

            end:
              "bottom top",

            scrub:
              1.2

          }

        }
      );


      gsap.to(
        ".stage-glow",
        {
          y: -70,

          scrollTrigger: {

            trigger:
              ".desktop-stage",

            start:
              "top bottom",

            end:
              "bottom top",

            scrub:
              1.5

          }

        }
      );


      gsap.to(
        ".developer-glow",
        {
          y: -100,

          scrollTrigger: {

            trigger:
              ".developer-section",

            start:
              "top bottom",

            end:
              "bottom top",

            scrub:
              1.5

          }

        }
      );

    }


    /* ========================================================
       3D DESKTOP
    ====================================================== */

    if (
      desktopStage &&
      windowCard &&
      window.matchMedia(
        "(pointer:fine)"
      ).matches
    ) {

      desktopStage.addEventListener(
        "mousemove",
        event => {

          const rect =
            desktopStage
              .getBoundingClientRect();


          const x =
            (
              event.clientX -
              rect.left
            ) / rect.width;


          const y =
            (
              event.clientY -
              rect.top
            ) / rect.height;


          const rotateY =
            (x - .5) * 7;


          const rotateX =
            (.5 - y) * 5;


          gsap.to(
            windowCard,
            {
              rotateX:
                4 + rotateX,

              rotateY:
                rotateY,

              duration:
                .65,

              ease:
                "power3.out",

              overwrite:
                true

            }
          );

        }
      );


      desktopStage.addEventListener(
        "mouseleave",
        () => {

          gsap.to(
            windowCard,
            {
              rotateX:
                4,

              rotateY:
                0,

              duration:
                .9,

              ease:
                "power3.out"
            }
          );

        }
      );

    }


    /* ========================================================
       MAGNETIC BUTTONS
    ====================================================== */

    if (
      window.matchMedia(
        "(pointer:fine)"
      ).matches
    ) {

      document
        .querySelectorAll(".magnetic")
        .forEach(element => {

          element.addEventListener(
            "mousemove",
            event => {

              const rect =
                element
                  .getBoundingClientRect();


              const x =
                event.clientX -
                rect.left -
                rect.width / 2;


              const y =
                event.clientY -
                rect.top -
                rect.height / 2;


              gsap.to(
                element,
                {
                  x:
                    x * .12,

                  y:
                    y * .12,

                  duration:
                    .35,

                  ease:
                    "power3.out"
                }
              );

            }
          );


          element.addEventListener(
            "mouseleave",
            () => {

              gsap.to(
                element,
                {
                  x: 0,
                  y: 0,
                  duration: .55,
                  ease:
                    "elastic.out(1,.45)"
                }
              );

            }
          );

        });

    }


    /* ========================================================
       CARD HOVER
       CSS owns the transform so it cannot fight GSAP reveal transforms.
    ====================================================== */

    if (window.matchMedia("(pointer:fine)").matches) {
      document
        .querySelectorAll(".experience-card, .feature")
        .forEach(card => {
          card.addEventListener("mouseenter", () => {
            card.classList.add("is-hovered");
          });

          card.addEventListener("mouseleave", () => {
            card.classList.remove("is-hovered");
          });
        });
    }


    /* ========================================================
       DOCK ICON ANIMATION
    ====================================================== */

    document
      .querySelectorAll(".dock-icon")
      .forEach(icon => {

        icon.addEventListener(
          "mouseenter",
          () => {

            gsap.to(
              icon,
              {
                y: -8,
                scale: 1.12,
                duration: .25,
                ease:
                  "power2.out"
              }
            );

          }
        );


        icon.addEventListener(
          "mouseleave",
          () => {

            gsap.to(
              icon,
              {
                y: 0,
                scale: 1,
                duration: .35,
                ease:
                  "power2.out"
              }
            );

          }
        );

      });


    /* ========================================================
       SCROLL LINE
    ====================================================== */

    gsap.to(
      ".scroll-line span",
      {
        y: 60,
        duration: 1.7,
        repeat: -1,
        ease:
          "power2.inOut"
      }
    );


    /* ========================================================
       AMBIENT MOUSE PARALLAX
    ====================================================== */

    window.addEventListener(
      "mousemove",
      event => {

        const x =
          event.clientX /
          window.innerWidth -
          .5;


        const y =
          event.clientY /
          window.innerHeight -
          .5;


        gsap.to(
          ".ambient-a",
          {
            x:
              x * 35,

            y:
              y * 25,

            duration:
              1.4,

            ease:
              "power3.out"
          }
        );


        gsap.to(
          ".ambient-b",
          {
            x:
              x * -25,

            y:
              y * -20,

            duration:
              1.7,

            ease:
              "power3.out"
          }
        );

      },
      {
        passive:
          true
      }
    );

  }


  /* ==========================================================
     INIT
  ========================================================== */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initGSAP
    );

  } else {

    initGSAP();

  }

  document.addEventListener("arlo:experience-ready", initGSAP);

})();