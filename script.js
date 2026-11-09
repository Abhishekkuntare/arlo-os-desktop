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

  const heroKeywords = document.querySelectorAll(
    ".hero-keyword-rotator > span"
  );
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

  if (heroKeywords.length > 1 && !reducedMotion) {
    let activeKeyword = 0;

    window.setInterval(() => {
      heroKeywords[activeKeyword].classList.remove("is-active");
      activeKeyword = (activeKeyword + 1) % heroKeywords.length;
      heroKeywords[activeKeyword].classList.add("is-active");
    }, 2800);
  }

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

(() => {
  "use strict";

  const mascots = Array.from(document.querySelectorAll("[data-arlo-mascot]"));
  if (!mascots.length) return;

  const namedColors = [
    ["Red", "#e53935"], ["Crimson", "#dc143c"], ["Scarlet", "#ff2400"],
    ["Maroon", "#800000"], ["Burgundy", "#800020"], ["Ruby", "#9b111e"],
    ["Cherry", "#de3163"], ["Rose", "#f33a6a"], ["Pink", "#ff69b4"],
    ["Hot Pink", "#ff1493"], ["Baby Pink", "#f4c2c2"], ["Blush Pink", "#de5d83"],
    ["Dusty Rose", "#c08081"], ["Coral Pink", "#f88379"], ["Salmon Pink", "#ff91a4"],
    ["Peach", "#ffcba4"], ["Apricot", "#fbceb1"], ["Orange", "#ff851b"],
    ["Burnt Orange", "#cc5500"], ["Tangerine", "#f28500"], ["Amber", "#ffbf00"],
    ["Pumpkin", "#ff7518"], ["Rust", "#b7410e"], ["Terracotta", "#e2725b"],
    ["Copper", "#b87333"], ["Bronze", "#cd7f32"], ["Gold", "#d4af37"],
    ["Rose Gold", "#b76e79"], ["Yellow", "#ffd60a"], ["Lemon Yellow", "#fff44f"],
    ["Mustard Yellow", "#d4a017"], ["Golden Yellow", "#ffdf00"], ["Saffron", "#f4c430"],
    ["Honey", "#e6a817"], ["Cream", "#fffdd0"], ["Ivory", "#fffff0"],
    ["Beige", "#d8c3a5"], ["Champagne", "#f7e7ce"], ["Tan", "#d2b48c"],
    ["Khaki", "#c3b091"], ["Camel", "#c19a6b"], ["Brown", "#8b5a2b"],
    ["Chocolate Brown", "#7b3f00"], ["Coffee Brown", "#6f4e37"], ["Espresso", "#3c2415"],
    ["Mocha", "#967969"], ["Caramel", "#c68e17"], ["Chestnut", "#954535"],
    ["Walnut", "#773f1a"], ["Mahogany", "#4a1c1c"], ["Umber", "#635147"],
    ["Taupe", "#8b8589"], ["Sand", "#c2b280"], ["Ochre", "#cc7722"],
    ["Olive", "#808000"], ["Army Green", "#4b5320"], ["Forest Green", "#228b22"],
    ["Emerald Green", "#50c878"], ["Jade Green", "#00a86b"], ["Mint Green", "#98ffcc"],
    ["Sage Green", "#9caf88"], ["Seafoam Green", "#93e9be"], ["Lime Green", "#7cfc00"],
    ["Neon Green", "#39ff14"], ["Apple Green", "#8db600"], ["Grass Green", "#4caf50"],
    ["Moss Green", "#8a9a5b"], ["Fern Green", "#4f7942"], ["Hunter Green", "#355e3b"],
    ["Pistachio Green", "#93c572"], ["Teal", "#008c8c"], ["Turquoise", "#40e0d0"],
    ["Aqua", "#00ffff"], ["Cyan", "#00bcd4"], ["Baby Blue", "#89cff0"],
    ["Sky Blue", "#87ceeb"], ["Powder Blue", "#b0e0e6"], ["Ice Blue", "#d7f3ff"],
    ["Pastel Blue", "#a7c7e7"], ["Royal Blue", "#4169e1"], ["Navy Blue", "#000080"],
    ["Midnight Blue", "#191970"], ["Cobalt Blue", "#0047ab"], ["Sapphire Blue", "#0f52ba"],
    ["Azure", "#007fff"], ["Cerulean", "#2a52be"], ["Denim Blue", "#1560bd"],
    ["Steel Blue", "#4682b4"], ["Ocean Blue", "#006994"], ["Electric Blue", "#7df9ff"],
    ["Peacock Blue", "#005f69"], ["Periwinkle", "#8e9aee"], ["Indigo", "#4b0082"],
    ["Violet", "#8f00ff"], ["Purple", "#8000a8"], ["Lavender", "#b57edc"],
    ["Lilac", "#c8a2c8"], ["Mauve", "#b784a7"], ["Plum", "#8e4585"],
    ["Orchid", "#da70d6"], ["Amethyst", "#9966cc"], ["Magenta", "#ff00ff"],
    ["Fuchsia", "#c154c1"], ["Grape", "#6f2da8"], ["Eggplant", "#614051"],
    ["Wine", "#722f37"], ["Mulberry", "#c54b8c"], ["Wisteria", "#c9a0dc"],
    ["Heather", "#9b7cb9"], ["Grey", "#808080"], ["Light Grey", "#d3d3d3"],
    ["Silver", "#c0c0c0"], ["Charcoal Grey", "#36454f"], ["Slate Grey", "#708090"],
    ["Ash Grey", "#b2beb5"], ["Gunmetal Grey", "#2a3439"], ["Smoke Grey", "#738276"],
    ["Graphite", "#41424c"], ["Pewter", "#899499"], ["Stone Grey", "#928e85"],
    ["White", "#ffffff"], ["Snow White", "#fffafa"], ["Pure White", "#ffffff"],
    ["Off White", "#f5f5ee"], ["Antique White", "#faebd7"], ["Alabaster", "#edeae0"],
    ["Pearl White", "#f0ead6"], ["Black", "#111111"], ["Jet Black", "#0a0a0a"],
    ["Matte Black", "#242424"], ["Onyx", "#353839"], ["Obsidian", "#0b1215"],
    ["Ebony", "#28211f"], ["Midnight Black", "#101116"]
  ];
  const hexToHsl = hex => {
    const values = hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16) / 255);
    const [red, green, blue] = values;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;
    let hue = 0;
    const lightness = (max + min) / 2;
    let saturation = 0;
    if (delta) {
      saturation = delta / (1 - Math.abs(2 * lightness - 1));
      switch (max) {
        case red: hue = ((green - blue) / delta) % 6; break;
        case green: hue = (blue - red) / delta + 2; break;
        default: hue = (red - green) / delta + 4;
      }
      hue = (hue * 60 + 360) % 360;
    }
    return [hue, saturation, lightness];
  };
  const hslToHex = (hue, saturation, lightness) => {
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const segment = hue / 60;
    const secondary = chroma * (1 - Math.abs(segment % 2 - 1));
    const [red, green, blue] = segment < 1 ? [chroma, secondary, 0]
      : segment < 2 ? [secondary, chroma, 0]
        : segment < 3 ? [0, chroma, secondary]
          : segment < 4 ? [0, secondary, chroma]
            : segment < 5 ? [secondary, 0, chroma] : [chroma, 0, secondary];
    const offset = lightness - chroma / 2;
    return `#${[red, green, blue].map(value =>
      Math.round((value + offset) * 255).toString(16).padStart(2, "0")
    ).join("")}`;
  };
  const makePalette = (name, hex, finish = "solid") => {
    const [hue, saturation, lightness] = hexToHsl(hex);
    const vivid = finish === "neon" || finish === "fluorescent";
    const pastel = finish === "pastel";
    const sat = vivid ? Math.max(saturation, .92) : pastel ? Math.min(saturation, .52) : saturation;
    const baseLight = vivid ? .58 : pastel ? .78 : Math.min(.72, Math.max(.32, lightness));
    const shade = (lightOffset, saturationScale = 1) =>
      hslToHex(hue, Math.min(1, sat * saturationScale), Math.min(.96, Math.max(.12, baseLight + lightOffset)));
    const shell = [.24, .1, 0, -.1, -.24].map((offset, index) =>
      shade(offset, finish === "metallic" ? [.15, .55, .35, .68, .2][index] : 1)
    );
    const face = [.27, .19, .12, .05, -.02].map(offset => shade(offset, .68));
    if (finish === "rainbow" || finish === "multicolor" || finish === "iridescent" || finish === "holographic") {
      const hues = finish === "rainbow" || finish === "multicolor"
        ? [0, 48, 125, 190, 265]
        : [300, 190, 48, 265, 150];
      shell.forEach((_color, index) => {
        shell[index] = hslToHex(hues[index], .84, [.62, .55, .56, .5, .52][index]);
        face[index] = hslToHex(hues[index], .48, [.91, .86, .84, .82, .88][index]);
      });
    } else if (finish === "metallic") {
      shell[0] = "#ffffff";
      shell[2] = hex;
      shell[4] = "#34343a";
    }
    const rgb = hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16));
    const darkInk = "#17131b";
    return {
      name: name.toLowerCase().replace(/\s+/g, "-"),
      finish,
      colors: {
        "shell-start": shell[0], "shell-quarter": shell[1], "shell-middle": shell[2],
        "shell-three-quarter": shell[3], "shell-end": shell[4],
        "face-start": face[0], "face-quarter": face[1], "face-middle": face[2],
        "face-three-quarter": face[3], "face-end": face[4],
        "shell-outline": shade(.16), "face-outline": "#ffffff",
        "feature-ink": darkInk, "eye-highlight": "#ffffff", "tongue": "#ff8ba9"
      },
      glow: `rgba(${rgb.join(",")},.22)`,
      hoverGlow: `rgba(${rgb.join(",")},.4)`
    };
  };
  const blendHex = (first, second, amount) => {
    const firstRgb = first.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16));
    const secondRgb = second.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16));
    return `#${firstRgb.map((value, index) =>
      Math.round(value + (secondRgb[index] - value) * amount).toString(16).padStart(2, "0")
    ).join("")}`;
  };
  const makeGradientPalette = (name, swatches) => {
    const shell = [
      swatches[0], blendHex(swatches[0], swatches[1], .5), swatches[1],
      blendHex(swatches[1], swatches[2], .5), swatches[2]
    ];
    const face = shell.map((color, index) => blendHex(color, "#ffffff", [.78, .68, .58, .48, .4][index]));
    const [red, green, blue] = swatches[1].match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16));
    return {
      name: name.toLowerCase().replace(/\s+/g, "-"),
      finish: "solid",
      colors: {
        "shell-start": shell[0], "shell-quarter": shell[1], "shell-middle": shell[2],
        "shell-three-quarter": shell[3], "shell-end": shell[4],
        "face-start": face[0], "face-quarter": face[1], "face-middle": face[2],
        "face-three-quarter": face[3], "face-end": face[4],
        "shell-outline": blendHex(swatches[0], "#ffffff", .28), "face-outline": "#ffffff",
        "feature-ink": "#17131b", "eye-highlight": "#ffffff", "tongue": "#ff8ba9"
      },
      glow: `rgba(${red},${green},${blue},.22)`,
      hoverGlow: `rgba(${red},${green},${blue},.4)`
    };
  };
  const gradientPalettes = [
    ["Electric Aurora", "#36f1cd", "#32b8ff", "#9d4edd"],
    ["Cosmic Galaxy", "#18134f", "#7138b5", "#f15bb5"],
    ["Royal Sunset", "#542788", "#e84a5f", "#ffb347"],
    ["Royal Luxury", "#541388", "#9d4edd", "#d4af37"],
    ["Neon Dream", "#ff00a8", "#8a2be2", "#39ff14"],
    ["Cyberpunk", "#ff2a6d", "#d500f9", "#05d9e8"],
    ["Ocean Aurora", "#073b4c", "#06d6a0", "#48cae4"],
    ["Sunset Glow", "#ff5e5b", "#ff9966", "#ffd166"],
    ["Candy Fusion", "#ff70a6", "#ff9770", "#70d6ff"],
    ["Mystic Flame", "#5a189a", "#e63946", "#ff9f1c"],
    ["Arctic Fantasy", "#b8f2e6", "#70d6ff", "#7b61ff"],
    ["Tropical Paradise", "#00c9a7", "#f9f871", "#ff6f91"],
    ["Purple Haze", "#3c096c", "#9d4edd", "#e0aaff"],
    ["Blue Raspberry", "#00b4d8", "#277da1", "#80ffdb"],
    ["Cherry Blossom", "#ff8fab", "#ffc2d1", "#cdb4db"],
    ["Golden Hour", "#b5651d", "#f4a261", "#ffd166"],
    ["Midnight Aurora", "#101040", "#00c2a8", "#8a5cf6"],
    ["Emerald Dream", "#064e3b", "#10b981", "#a3e635"],
    ["Pink Galaxy", "#78004b", "#e73895", "#9b5de5"],
    ["Fire and Ice", "#ff3b30", "#ff9f1c", "#48cae4"],
    ["Royal Ocean", "#071952", "#086788", "#47b5ff"],
    ["Lavender Sky", "#8e7dbe", "#c8b6ff", "#e7c6ff"],
    ["Mango Splash", "#ff7b00", "#ffb703", "#ff5d8f"],
    ["Mint Breeze", "#b7e4c7", "#52b788", "#168aad"],
    ["Peach Paradise", "#ffb5a7", "#fcd5ce", "#f4a261"],
    ["Deep Space", "#090a24", "#302b63", "#6f42c1"],
    ["Violet Flame", "#4c1d95", "#9b5de5", "#ff5d8f"],
    ["Coral Reef", "#ff6b6b", "#f9844a", "#00b4d8"],
    ["Blue Lagoon", "#023e8a", "#00b4d8", "#90e0ef"],
    ["Pink Champagne", "#b76e79", "#e8aeb7", "#f7e7ce"],
    ["Aurora Borealis", "#00f5d4", "#00bbf9", "#9b5de5"],
    ["Plum Royale", "#3c1642", "#7b2cbf", "#c77dff"],
    ["Lemon Berry", "#f9c80e", "#f86624", "#c1126b"],
    ["Sapphire Glow", "#082f8f", "#1768ac", "#72ddf7"],
    ["Rose Gold", "#9e4f68", "#c47a83", "#f3c7b5"],
    ["Inferno", "#6a040f", "#d00000", "#ffba08"],
    ["Forest Magic", "#143d2b", "#386641", "#a7c957"],
    ["Indigo Dream", "#240046", "#5a189a", "#7b9acc"],
    ["Cotton Candy", "#ffafcc", "#cdb4db", "#a2d2ff"],
    ["Electric Citrus", "#b7e000", "#f9c80e", "#ff5e00"],
    ["Neon Ocean", "#00f5d4", "#00bbf9", "#005bea"],
    ["Galaxy Purple", "#240046", "#7209b7", "#f15bb5"],
    ["Desert Sunset", "#9c6644", "#d98c5f", "#f2cc8f"],
    ["Blue Flame", "#023e8a", "#00b4d8", "#b8f2e6"],
    ["Ruby Velvet", "#4a001f", "#9b111e", "#e63950"],
    ["Opal Glow", "#8ecae6", "#cdb4db", "#b7e4c7"],
    ["Holographic", "#ff70a6", "#70d6ff", "#c77dff"],
    ["Peacock Jewel", "#005f73", "#0a9396", "#ca6702"],
    ["Purple Gold", "#4a148c", "#8e44ad", "#d4af37"],
    ["Red Velvet", "#3d001e", "#8b0035", "#d7263d"],
    ["Nordic Blue", "#14213d", "#31587a", "#a8dadc"],
    ["Mauve Magic", "#614051", "#a2678a", "#d8a7ca"],
    ["Solar Flare", "#ff4800", "#ff9500", "#ffcc00"],
    ["Blueberry Crush", "#241468", "#4f46e5", "#b8c0ff"],
    ["Spring Meadow", "#386641", "#6a994e", "#c7f9cc"],
    ["Pink Electric", "#ff00a8", "#f72585", "#7209b7"],
    ["Glacier", "#caf0f8", "#90e0ef", "#0077b6"],
    ["Amethyst Sky", "#5a189a", "#9d4edd", "#c8b6ff"],
    ["Citrus Punch", "#aacc00", "#ffba08", "#f77f00"],
    ["Deep Emerald", "#022c22", "#047857", "#34d399"],
    ["Moonlight", "#30364f", "#748cab", "#dbe7f3"],
    ["Cherry Pop", "#9d0208", "#e5383b", "#ff758f"],
    ["Lavender Dream", "#7b2cbf", "#b185db", "#e0aaff"],
    ["Ocean Sunset", "#005f73", "#ee6c4d", "#f4a261"],
    ["Electric Lime", "#386641", "#80b918", "#d9ed92"],
    ["Dark Matter", "#09090b", "#27272a", "#52525b"],
    ["Pink Coral", "#ff5d8f", "#ff8fab", "#ffb4a2"],
    ["Golden Galaxy", "#8c5e00", "#d4af37", "#f7e7a9"],
    ["Teal Purple", "#007f86", "#3a0ca3", "#b5179e"],
    ["Flamingo", "#ff4d6d", "#ff8fa3", "#ffcad4"],
    ["Arctic Aurora", "#caf0f8", "#48cae4", "#80ffdb"],
    ["Magma", "#370617", "#9d0208", "#ffba08"],
    ["Jade Ocean", "#006466", "#0a9396", "#94d2bd"],
    ["Royal Berry", "#3c096c", "#7b2cbf", "#e75480"],
    ["Tangerine Dream", "#c2410c", "#f97316", "#facc15"],
    ["Dreamscape", "#4361ee", "#b5179e", "#4cc9f0"],
    ["Neon Jungle", "#14532d", "#39ff14", "#00f5d4"],
    ["Obsidian Glow", "#09090b", "#27272a", "#7c3aed"],
    ["Rose Quartz", "#b56576", "#e5989b", "#ffcdb2"],
    ["Midnight Sapphire", "#050b2e", "#142a73", "#3267c8"],
    ["Autumn Leaves", "#7f1d1d", "#c2410c", "#eab308"],
    ["Mint Chocolate", "#064e3b", "#2d6a4f", "#9c6644"],
    ["Ruby Sapphire", "#8f001a", "#c9184a", "#1446a0"],
    ["Solar Aurora", "#f72585", "#ffba08", "#4cc9f0"],
    ["Blue Violet", "#14213d", "#4361ee", "#9d4edd"],
    ["Peach Lavender", "#ffb5a7", "#e7c6ff", "#cdb4db"],
    ["Emerald Gold", "#064e3b", "#10b981", "#d4af37"],
    ["Crimson Purple", "#9d0208", "#c9184a", "#7209b7"],
    ["Tropical Sunset", "#06d6a0", "#ff9f1c", "#ef476f"],
    ["Ice Berry", "#caf0f8", "#72ddf7", "#9d4edd"],
    ["Electric Royal", "#0037ff", "#7209b7", "#ff00a8"],
    ["Mocha Cream", "#4e342e", "#967969", "#f3e5d0"],
    ["Ocean Pearl", "#005f73", "#48cae4", "#f1faee"],
    ["Velvet Night", "#171123", "#4a1942", "#943f71"],
    ["Fluorescent Pop", "#ff00a8", "#39ff14", "#00bbf9"],
    ["Sakura Glow", "#d63384", "#ff8fab", "#ffd6e0"],
    ["Copper Sunset", "#7f3b08", "#b87333", "#ff9966"],
    ["Blue Mint", "#0077b6", "#48cae4", "#80ed99"],
    ["Purple Peach", "#7209b7", "#c77dff", "#ffb5a7"],
    ["Starfire", "#6a040f", "#e63946", "#ffd166"],
    ["Arctic Ocean", "#caf0f8", "#48cae4", "#0077b6"],
    ["Galaxy Gold", "#3c096c", "#7b2cbf", "#d4af37"]
  ].map(([name, ...swatches]) => makeGradientPalette(name, swatches));
  const bluePalette = {
    name: "blue",
    finish: "solid",
    colors: {
      "shell-start": "#83dcff", "shell-quarter": "#4cb8ff", "shell-middle": "#1599f5",
      "shell-three-quarter": "#0c88e7", "shell-end": "#0872cf",
      "face-start": "#c5edff", "face-quarter": "#9ad9ff", "face-middle": "#7dc7ff",
      "face-three-quarter": "#64b5f7", "face-end": "#4f9fe9",
      "shell-outline": "#70d2ff", "face-outline": "#d7f3ff",
      "feature-ink": "#17476d", "eye-highlight": "#a9e3ff", "tongue": "#ff8ba9"
    },
    glow: "rgba(34,139,255,.2)",
    hoverGlow: "rgba(88,174,255,.34)"
  };
  const specialPalettes = [
    ["Rainbow", "#ff5277", "rainbow"], ["Multicolor", "#9564ed", "multicolor"],
    ["Pastel", "#a7c7e7", "pastel"], ["Neon", "#39ff14", "neon"],
    ["Metallic", "#b8a36a", "metallic"], ["Fluorescent", "#39ff14", "fluorescent"],
    ["Iridescent", "#8e9aee", "iridescent"],
    ["Transparent", "#7dc7ff", "transparent"], ["Translucent", "#7dc7ff", "translucent"]
  ].map(([name, hex, finish]) => makePalette(name, hex, finish));
  const palettes = [
    bluePalette,
    ...namedColors.map(([name, hex]) => makePalette(name, hex)),
    ...gradientPalettes,
    ...specialPalettes
  ];
  const applyPalette = (mascot, palette) => {
    Object.entries(palette.colors).forEach(([name, color]) => {
      mascot.style.setProperty(`--arlo-${name}`, color);
    });
    mascot.style.setProperty("--arlo-mascot-glow", palette.glow);
    mascot.style.setProperty("--arlo-mascot-hover-glow", palette.hoverGlow);
    mascot.dataset.colorPalette = palette.name;
    mascot.dataset.colorFinish = palette.finish;
  };
  let currentPalette = palettes[0];
  mascots.forEach(mascot => applyPalette(mascot, currentPalette));

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.setInterval(() => {
      const nextPalettes = palettes.filter(palette => palette !== currentPalette);
      currentPalette = nextPalettes[Math.floor(Math.random() * nextPalettes.length)];
      mascots.forEach(mascot => applyPalette(mascot, currentPalette));
    }, 10000);
  }

  let pointer = null;
  let gazeFrame = 0;
  const reactionTimers = new WeakMap();

  const updateGaze = () => {
    gazeFrame = 0;
    if (!pointer) return;

    mascots.forEach(mascot => {
      const eyes = mascot.querySelector(".arlo-mascot-eyes");
      if (!eyes) return;

      const bounds = mascot.getBoundingClientRect();
      const dx = pointer.x - (bounds.left + bounds.width / 2);
      const dy = pointer.y - (bounds.top + bounds.height / 2);
      const horizontalRange = Math.max(window.innerWidth * 0.42, 180);
      const verticalRange = Math.max(window.innerHeight * 0.42, 180);
      const x = Math.max(-1, Math.min(1, dx / horizontalRange)) * 4.5;
      const y = Math.max(-1, Math.min(1, dy / verticalRange)) * 3.5;
      eyes.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    });
  };

  const scheduleGaze = () => {
    if (gazeFrame) return;
    gazeFrame = window.requestAnimationFrame(updateGaze);
  };

  window.addEventListener("pointermove", event => {
    pointer = { x: event.clientX, y: event.clientY };
    scheduleGaze();
  }, { passive: true });
  window.addEventListener("scroll", scheduleGaze, { passive: true });
  window.addEventListener("resize", scheduleGaze, { passive: true });

  const scheduleBlink = mascot => {
    const delay = 2400 + Math.random() * 3000;
    window.setTimeout(() => {
      if (!mascot.classList.contains("is-surprised")) {
        mascot.classList.add("is-blinking");
        window.setTimeout(() => mascot.classList.remove("is-blinking"), 140);
      }
      scheduleBlink(mascot);
    }, delay);
  };

  mascots.forEach(mascot => {
    mascot.addEventListener("pointerenter", () => mascot.classList.add("is-hovered"));
    mascot.addEventListener("pointerleave", () => mascot.classList.remove("is-hovered"));
    scheduleBlink(mascot);
  });

  document.addEventListener("click", () => {
    mascots.forEach(mascot => {
      window.clearTimeout(reactionTimers.get(mascot));
      mascot.classList.remove("is-blinking", "is-surprised");
      void mascot.offsetWidth;
      mascot.classList.add("is-surprised");
      reactionTimers.set(
        mascot,
        window.setTimeout(() => mascot.classList.remove("is-surprised"), 680)
      );
    });
  });
})();