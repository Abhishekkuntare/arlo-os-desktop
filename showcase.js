/* ============================================================
   ARLO OS — REAL SYSTEM SHOWCASE
============================================================ */
(() => {
  "use strict";

  const youtubeLaunch = document.getElementById("youtubeLaunch");
  const videoViewport = document.getElementById("showcaseVideoViewport");
  const videoShell = document.getElementById("showcaseVideoShell");
  const galleryTrack = document.getElementById("systemGalleryTrack");
  const galleryPosition = document.getElementById("galleryPosition");
  const galleryPages = document.getElementById("galleryPages");
  const galleryFilters = document.getElementById("galleryFilters");
  const assetManifestElement = document.getElementById("arlo-asset-manifest");
  const assetManifest = assetManifestElement
    ? JSON.parse(assetManifestElement.textContent)
    : null;

  const lightbox = document.getElementById("galleryLightbox");
  const image = document.getElementById("lightboxImage");
  const title = document.getElementById("lightboxTitle");
  const counter = document.getElementById("lightboxCounter");
  const close = document.getElementById("lightboxClose");
  const previous = document.getElementById("lightboxPrev");
  const next = document.getElementById("lightboxNext");
  const eyebrow = document.getElementById("lightboxEyebrow");

  const assetUrls = file => {
    const variants = assetManifest?.[`assets/${file}`];
    if (variants?.length) {
      return {
        src: variants.at(-1).url,
        srcSet: variants.map(variant => `${variant.url} ${variant.width}w`).join(", ")
      };
    }

    return {
      src: `/assets/${encodeURIComponent(file)}`,
      srcSet: ""
    };
  };

  const gallery = [
    ["ARLO Phone - App Library.png", "ARLO Phone App Library", "Browse responsive ARLO apps in a selectable iPhone, Galaxy or Pixel simulator.", "Apps"],
    ["ARLO Phone - Lock Screen.png", "ARLO Phone Lock Screen", "Unlock the phone simulator with its own wallpaper, live clock and notification shortcuts.", "System"],
    ["ARLO Phone - Desktop Home.png", "ARLO Phone Home Screen", "See phone apps, widgets and a personalized home screen inside the desktop.", "Apps"],
    ["ARLO Phone - Media and YouTube.png", "ARLO Phone Media", "Use phone-ready apps and media alongside ARLO desktop widgets.", "Apps"],
    ["ARLO Phone - Quick Panel.png", "ARLO Phone Quick Panel", "Reach phone controls, playback and device status in a compact quick panel.", "System"],
    ["ARLO Aura - Desktop Lighting.png", "ARLO Aura Edge Lighting", "Bring animated, event-aware ambient lighting to the edges of the desktop.", "Personalization"],
    ["ARLO Aura - Lighting Settings.png", "ARLO Aura Styles", "Choose from 10 lighting styles and tune colors, brightness, speed and edges.", "Personalization"],
    ["AI Agents.png", "AI Agents", "Meet a team of helpful, purpose-built desktop assistants.", "AI & agents"],
    ["Activity app.png", "Activity", "See your recent desktop actions and pick up where you left off.", "Productivity"],
    ["Ai agents Daily detective.png", "Daily Detective", "Let an AI detective help investigate your daily questions.", "AI & agents"],
    ["Ai agents daily task.png", "Daily Tasks", "Turn everyday requests into clear, manageable tasks.", "AI & agents"],
    ["All AI agents Detectives.png", "Detective Agents", "Choose from a lineup of specialist AI detectives.", "AI & agents"],
    ["All Apps.png", "App Library", "Find your installed apps in one organized place.", "Apps"],
    ["Arlo Browser.png", "ARLO Browser", "Browse the web from your desktop workspace.", "Apps"],
    ["Arlo Terminal.png", "ARLO Terminal", "Get a command-line workspace close at hand.", "Developer"],
    ["Clock.png", "Desktop Clock", "Keep the time in view as you move between tasks.", "Productivity"],
    ["Desktop Screen.png", "Your Desktop", "A personal desktop with space for your everyday workflow.", "Personalization"],
    ["Draw App.png", "Draw", "Sketch, explore ideas and make something of your own.", "Apps"],
    ["Finder App.png", "Finder", "Browse files and folders from a familiar desktop app.", "Apps"],
    ["Ghost AI.png", "Ghost AI", "Talk to your desktop assistant for help with your workflow.", "AI & agents"],
    ["Its break Time app.png", "Break Time", "Build restorative pauses into a busy day.", "Productivity"],
    ["Its break time screen.png", "Break Time Screen", "A calmer screen to help you step away and reset.", "Productivity"],
    ["Latest Apps.png", "New & Updated Apps", "Spot the latest apps available in your workspace.", "Apps"],
    ["Mission Control.png", "Mission Control", "Get an overview of your open windows and workspaces.", "System"],
    ["Notepad++.png", "Notepad++", "Open a focused space for notes and text editing.", "Apps"],
    ["Priavate Screen page.png", "Private Screen Pages", "Keep private content separate from your everyday desktop.", "Privacy"],
    ["Private Screen locker.png", "Private Screen Lock", "Add a lock to your private workspace.", "Privacy"],
    ["Private Screen.png", "Private Screen", "Move into a more private desktop space when needed.", "Privacy"],
    ["Real Updates.png", "System Updates", "See the latest ARLO OS updates and improvements.", "System"],
    ["Recent Apps.png", "Recent Apps", "Return quickly to apps you have used recently.", "Apps"],
    ["Recommendation Apps.png", "App Recommendations", "Discover apps selected for your desktop.", "Apps"],
    ["Setting-Display.png", "Display Settings", "Adjust display preferences for a comfortable setup.", "Personalization"],
    ["Setting-Dock Menu.png", "Dock Settings", "Personalize how your desktop dock behaves.", "Personalization"],
    ["Setting-Media.png", "Media Settings", "Manage media preferences from system settings.", "System"],
    ["Social Media Hub.png", "Social Media Hub", "Bring your social destinations together in one hub.", "Apps"],
    ["Social hub.png", "Social Hub", "Keep connected services easy to reach.", "Apps"],
    ["Themes.png", "Desktop Themes", "Give your desktop a look that feels like yours.", "Personalization"],
    ["Trash.png", "Trash", "Review deleted items before clearing them away.", "System"],
    ["User Profile.png", "User Profile", "Make your desktop profile feel personal.", "Personalization"],
    ["Vs-code runnig.png", "VS Code in Action", "See a developer workspace with VS Code running.", "Developer"],
    ["Vs-code.png", "VS Code Integration", "Bring your coding workflow into your desktop setup.", "Developer"],
    ["control center.png", "Control Center", "Reach everyday system controls in one quick panel.", "System"],
    ["copy me setting.png", "Copy Me Settings", "Personalize your Copy Me experience and preferences.", "Personalization"],
    ["copy me.png", "Copy Me", "A handy companion app for your desktop workflow.", "Apps"],
    ["nautch dashboard.png", "Nautch Dashboard", "Get a clear view of your daily wellbeing progress.", "Productivity"],
    ["nautch.png", "Nautch", "Make a little room for healthy routines in your day.", "Productivity"],
    ["notification center.png", "Notification Center", "Keep notifications together and easy to review.", "System"],
    ["setting battery.png", "Battery Settings", "Check battery information and power preferences.", "System"],
    ["setting-Day Progress.png", "Day Progress", "See how your day is unfolding at a glance.", "Productivity"],
    ["setting-Health.png", "Health Settings", "Explore wellbeing and health-related preferences.", "Productivity"]
  ].map(([file, heading, description, category]) => ({
    ...assetUrls(file),
    heading,
    description,
    category
  }));

  let visibleGallery = gallery;
  let index = 0;
  let currentPage = 0;
  let activeCategory = "All";
  const pageSize = 10;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setGalleryPosition = () => {
    if (!galleryPosition) return;
    const firstItem = currentPage * pageSize + 1;
    const lastItem = Math.min(firstItem + pageSize - 1, visibleGallery.length);
    galleryPosition.textContent = `${String(firstItem).padStart(2, "0")}–${String(lastItem).padStart(2, "0")} OF ${String(visibleGallery.length).padStart(2, "0")}`;
  };

  const updateGalleryPagination = () => {
    const pageCount = Math.ceil(visibleGallery.length / pageSize);
    if (galleryPages) {
      galleryPages.replaceChildren(...Array.from({ length: pageCount }, (_, pageIndex) => {
        const button = document.createElement("button");
        button.className = "gallery-page";
        button.type = "button";
        button.textContent = String(pageIndex + 1);
        button.setAttribute("aria-label", `Page ${pageIndex + 1}`);
        if (pageIndex === currentPage) {
          button.setAttribute("aria-current", "page");
        }
        button.addEventListener("click", () => renderGallery(activeCategory, pageIndex));
        return button;
      }));
    }

    const previousPage = document.getElementById("galleryPrevious");
    const nextPage = document.getElementById("galleryNext");
    if (previousPage) previousPage.disabled = currentPage === 0;
    if (nextPage) nextPage.disabled = currentPage >= pageCount - 1;
  };

  const renderGallery = (category, page = 0) => {
    if (!galleryTrack) return;
    if (category !== activeCategory) {
      activeCategory = category;
      visibleGallery = category === "All" ? gallery : gallery.filter(item => item.category === category);
    }
    const pageCount = Math.ceil(visibleGallery.length / pageSize);
    currentPage = Math.max(0, Math.min(page, pageCount - 1));
    const firstItem = currentPage * pageSize;
    index = firstItem;
    galleryTrack.replaceChildren(...visibleGallery.slice(firstItem, firstItem + pageSize).map((item, pageItemIndex) => {
      const itemIndex = firstItem + pageItemIndex;
      const card = document.createElement("button");
      card.className = "system-shot";
      card.type = "button";
      card.dataset.galleryIndex = String(itemIndex);
      card.style.setProperty("--card-index", String(itemIndex));
      card.setAttribute("aria-label", `View ${item.heading}: ${item.description}`);

      const preview = document.createElement("img");
      preview.src = item.src;
      preview.srcset = item.srcSet;
      preview.sizes = "(max-width: 600px) 84vw, (max-width: 900px) 46vw, 31vw";
      preview.alt = `${item.heading} — ${item.description}`;
      preview.loading = "lazy";
      preview.decoding = "async";
      preview.fetchPriority = "low";
      card.append(preview);

      const caption = document.createElement("span");
      caption.className = "shot-overlay";
      const categoryLabel = document.createElement("span");
      categoryLabel.className = "shot-category";
      categoryLabel.textContent = item.category;
      const number = document.createElement("b");
      number.textContent = String(itemIndex + 1).padStart(2, "0");
      const heading = document.createElement("strong");
      heading.textContent = item.heading;
      const description = document.createElement("small");
      description.textContent = item.description;
      const openIcon = document.createElement("i");
      openIcon.setAttribute("aria-hidden", "true");
      openIcon.textContent = "↗";
      caption.append(categoryLabel, number, heading, description, openIcon);
      card.append(caption);
      return card;
    }));

    galleryTrack.classList.add("gallery-ready");
    setGalleryPosition();
    updateGalleryPagination();
  };

  if (galleryTrack) {
    renderGallery("All");
    galleryFilters?.addEventListener("click", event => {
      const filter = event.target.closest("[data-gallery-filter]");
      if (!filter) return;
      galleryFilters.querySelectorAll("[data-gallery-filter]").forEach(button => {
        const selected = button === filter;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      renderGallery(filter.dataset.galleryFilter);
    });

    if (window.gsap && window.ScrollTrigger && !reducedMotion) {
      window.gsap.fromTo(
        galleryTrack.children,
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: .75,
          stagger: .045,
          ease: "power3.out",
          scrollTrigger: {
            trigger: galleryTrack,
            start: "top 82%",
            once: true
          }
        }
      );
    }
  }

  const scrollToGalleryIndex = nextIndex => {
    if (!galleryTrack || !visibleGallery.length) return;
    const targetPage = Math.floor(nextIndex / pageSize);
    if (targetPage !== currentPage) renderGallery(activeCategory, targetPage);
    const cards = galleryTrack.children;
    if (!cards.length) return;
    index = (nextIndex + visibleGallery.length) % visibleGallery.length;
    const card = cards[index - currentPage * pageSize];
    if (!card) return;
    card.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "center"
    });
    setGalleryPosition();
  };

  let galleryScrollFrame = 0;
  galleryTrack?.addEventListener("scroll", () => {
    if (galleryScrollFrame) return;
    galleryScrollFrame = window.requestAnimationFrame(() => {
      galleryScrollFrame = 0;
      const cards = [...galleryTrack.children];
      if (!cards.length) return;
      const trackBounds = galleryTrack.getBoundingClientRect();
      const trackCenter = trackBounds.left + trackBounds.width / 2;
      let visibleIndex = 0;
      let closestDistance = Infinity;

      cards.forEach((card, cardIndex) => {
        const bounds = card.getBoundingClientRect();
        const distance = Math.abs(bounds.left + bounds.width / 2 - trackCenter);
        if (distance < closestDistance) {
          visibleIndex = cardIndex;
          closestDistance = distance;
        }
      });

      const nextIndex = currentPage * pageSize + visibleIndex;
      if (nextIndex !== index) {
        index = nextIndex;
        setGalleryPosition();
      }
    });
  }, { passive: true });

  youtubeLaunch?.addEventListener("click", () => {
    if (!videoViewport || !youtubeLaunch) return;

    const iframe = document.createElement("iframe");
    iframe.className = "youtube-player";
    iframe.src = "https://www.youtube-nocookie.com/embed/wGCRAupDEvA?autoplay=1&playsinline=1&rel=0";
    iframe.title = "ARLO OS | A Smarter Windows Desktop Powered by AI";
    iframe.loading = "eager";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    videoViewport.replaceChildren(iframe);
  });

  if (videoShell && window.matchMedia("(pointer:fine)").matches) {
    const frame = videoShell.querySelector(".showcase-video-frame");
    videoShell.addEventListener("mousemove", event => {
      if (!frame || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = videoShell.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      frame.style.transform = `rotateX(${4 - y * 4}deg) rotateY(${x * 6}deg) translateZ(0)`;
    });
    videoShell.addEventListener("mouseleave", () => {
      if (frame) frame.style.transform = "rotateX(4deg) rotateY(0deg) translateZ(0)";
    });
  }

  const openGallery = nextIndex => {
    if (!lightbox || !image) return;
    index = (nextIndex + visibleGallery.length) % visibleGallery.length;
    scrollToGalleryIndex(index);
    const item = visibleGallery[index];
    image.src = item.src;
    image.srcset = item.srcSet;
    image.sizes = "(max-width: 700px) 94vw, 1180px";
    image.alt = `${item.heading} — ${item.description}`;
    title.textContent = item.heading;
    if (eyebrow) eyebrow.textContent = `${item.category} · ${item.description}`.toUpperCase();
    counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(visibleGallery.length).padStart(2, "0")}`;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    close?.focus();
  };

  const closeGallery = () => {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
  };

  let swipeStart = null;
  const finishSwipe = (endX, endY) => {
    if (!swipeStart) return;
    const deltaX = endX - swipeStart.x;
    const deltaY = endY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    openGallery(index + (deltaX < 0 ? 1 : -1));
  };
  if ("PointerEvent" in window) {
    image?.addEventListener("pointerdown", event => {
      if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
      swipeStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      image.setPointerCapture(event.pointerId);
    });
    image?.addEventListener("pointerup", event => {
      if (!swipeStart || event.pointerId !== swipeStart.pointerId) return;
      finishSwipe(event.clientX, event.clientY);
    });
    image?.addEventListener("pointercancel", () => {
      swipeStart = null;
    });
  } else {
    image?.addEventListener("touchstart", event => {
      if (event.touches.length !== 1) {
        swipeStart = null;
        return;
      }
      const touch = event.touches[0];
      swipeStart = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });
    image?.addEventListener("touchend", event => {
      const touch = event.changedTouches[0];
      if (touch) finishSwipe(touch.clientX, touch.clientY);
    });
    image?.addEventListener("touchcancel", () => {
      swipeStart = null;
    });
  }

  galleryTrack?.addEventListener("click", event => {
    const card = event.target.closest(".system-shot");
    if (card) openGallery(Number(card.dataset.galleryIndex || 0));
  });

  document.getElementById("galleryPrevious")?.addEventListener("click", () => renderGallery(activeCategory, currentPage - 1));
  document.getElementById("galleryNext")?.addEventListener("click", () => renderGallery(activeCategory, currentPage + 1));

  close?.addEventListener("click", closeGallery);
  document.querySelector("[data-lightbox-close]")?.addEventListener("click", closeGallery);
  previous?.addEventListener("click", () => openGallery(index - 1));
  next?.addEventListener("click", () => openGallery(index + 1));

  document.addEventListener("keydown", event => {
    if (!lightbox?.classList.contains("is-open")) return;
    if (event.key === "Escape") closeGallery();
    if (event.key === "ArrowLeft") openGallery(index - 1);
    if (event.key === "ArrowRight") openGallery(index + 1);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("media-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    document.querySelectorAll(".system-shot,.showcase-metrics").forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll(".system-shot,.showcase-metrics").forEach(el => el.classList.add("media-visible"));
  }
})();


/* ============================================================
   MASTER INTERACTIVE OS LAB CONTROLLER
============================================================ */
(() => {
  "use strict";
  const root = document.querySelector(".os-lab");
  if (!root) return;

  const desktop = root.querySelector("#osLabDesktop");
  const control = root.querySelector("#labControlCenter");
  const command = root.querySelector("#labCommand");
  const commandInput = root.querySelector("#labCommandInput");
  const results = root.querySelector("#labCommandResults");
  const toast = root.querySelector("#labToast");
  const wallpaper = root.querySelector("#osLabWallpaper");
  const spaceLabel = root.querySelector("#labSpaceLabel");
  const spaceTitle = root.querySelector("#labSpaceTitle");
  const clock = root.querySelector("#labClock");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let toastTimer = 0;
  let space = 1;
  let selectedCommand = 0;

  const actions = [
    { id: "browser", icon: "◉", title: "Open Browser", hint: "Launch the browser window", run: () => openWindow("browser") },
    { id: "terminal", icon: "⌘", title: "Open Terminal", hint: "Launch a developer terminal", run: () => openWindow("terminal") },
    { id: "notes", icon: "✎", title: "Open Quick Notes", hint: "Open your notes workspace", run: () => openWindow("notes") },
    { id: "focus", icon: "◒", title: "Toggle Focus Mode", hint: "Reduce visual noise", run: () => toggleFocus() },
    { id: "control", icon: "◌", title: "Control Center", hint: "Connectivity and appearance", run: () => toggleControl(true) },
    { id: "wallpaper", icon: "✦", title: "Change Wallpaper", hint: "Cycle the system environment", run: () => cycleWallpaper() },
    { id: "space1", icon: "01", title: "Command Space", hint: "Jump to workspace 01", run: () => setSpace(1) },
    { id: "space2", icon: "02", title: "Creative Space", hint: "Jump to workspace 02", run: () => setSpace(2) },
    { id: "space3", icon: "03", title: "Developer Space", hint: "Jump to workspace 03", run: () => setSpace(3) }
  ];

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function openWindow(name) {
    root.querySelectorAll(".lab-window").forEach(w => w.classList.toggle("is-active", w.dataset.labWindow === name));
    showToast(`${name.charAt(0).toUpperCase() + name.slice(1)} window focused`);
  }

  function toggleFocus(force) {
    const enabled = typeof force === "boolean" ? force : !root.classList.contains("focus-mode");
    root.classList.toggle("focus-mode", enabled);
    showToast(enabled ? "Focus Mode enabled" : "Focus Mode disabled");
  }

  function toggleControl(open) {
    const shouldOpen = typeof open === "boolean" ? open : !control.classList.contains("is-open");
    control.classList.toggle("is-open", shouldOpen);
    control.setAttribute("aria-hidden", String(!shouldOpen));
    if (shouldOpen) { command.classList.remove("is-open"); command.setAttribute("aria-hidden", "true"); }
  }

  function openCommand() {
    toggleControl(false);
    command.classList.add("is-open");
    command.setAttribute("aria-hidden", "false");
    selectedCommand = 0;
    renderCommands("");
    setTimeout(() => commandInput?.focus(), 50);
  }

  function closeCommand() { command.classList.remove("is-open"); command.setAttribute("aria-hidden", "true"); }

  function cycleWallpaper() {
    const modes = ["", "wallpaper-alt", "wallpaper-solar"];
    const current = modes.findIndex(x => x && root.classList.contains(x));
    const next = (current + 1) % modes.length;
    root.classList.remove("wallpaper-alt", "wallpaper-solar");
    if (modes[next]) root.classList.add(modes[next]);
    showToast(`Wallpaper ${next + 1} of ${modes.length}`);
  }

  function setSpace(n) {
    space = n;
    const names = { 1: "Command Center", 2: "Creative Studio", 3: "Developer Deck" };
    const labels = { 1: "SPACE 01", 2: "SPACE 02", 3: "SPACE 03" };
    if (spaceLabel) spaceLabel.textContent = labels[n];
    if (spaceTitle) spaceTitle.textContent = names[n];
    root.querySelectorAll("[data-space]").forEach(b => b.classList.toggle("active", Number(b.dataset.space) === n));
    if (!reduced) {
      if (window.gsap) {
        window.gsap.fromTo(".lab-window", { y: 16, opacity: .55 }, { y: 0, opacity: 1, duration: .5, stagger: .05, ease: "power3.out" });
      }
    }
    showToast(`Switched to ${names[n]}`);
  }

  function renderCommands(query) {
    if (!results) return;
    const q = query.trim().toLowerCase();
    const filtered = actions.filter(a => !q || `${a.title} ${a.hint}`.toLowerCase().includes(q));
    if (!filtered.length) { results.innerHTML = '<div class="lab-command-result"><span>⌁</span><div><b>No command found</b><small>Try browser, focus, wallpaper or space</small></div></div>'; return; }
    selectedCommand = Math.min(selectedCommand, filtered.length - 1);
    results.innerHTML = filtered.map((a, i) => `<button type="button" class="lab-command-result ${i === selectedCommand ? "selected" : ""}" data-command-id="${a.id}"><span>${a.icon}</span><div><b>${a.title}</b><small>${a.hint}</small></div><small>↵</small></button>`).join("");
    results.querySelectorAll("[data-command-id]").forEach(btn => btn.addEventListener("click", () => {
      const action = actions.find(a => a.id === btn.dataset.commandId); if (action) { action.run(); closeCommand(); }
    }));
  }

  commandInput?.addEventListener("input", () => { selectedCommand = 0; renderCommands(commandInput.value); });
  commandInput?.addEventListener("keydown", e => {
    const count = results?.querySelectorAll("[data-command-id]").length || 0;
    if (e.key === "ArrowDown") { e.preventDefault(); selectedCommand = (selectedCommand + 1) % Math.max(count, 1); renderCommands(commandInput.value); }
    if (e.key === "ArrowUp") { e.preventDefault(); selectedCommand = (selectedCommand - 1 + Math.max(count, 1)) % Math.max(count, 1); renderCommands(commandInput.value); }
    if (e.key === "Enter") { e.preventDefault(); results?.querySelectorAll("[data-command-id]")[selectedCommand]?.click(); }
    if (e.key === "Escape") closeCommand();
  });

  root.querySelector("#labControlToggle")?.addEventListener("click", () => toggleControl());
  root.querySelector("#labControlClose")?.addEventListener("click", () => toggleControl(false));
  root.querySelectorAll(".lab-toggle").forEach(btn => btn.addEventListener("click", () => {
    const on = !btn.classList.contains("active"); btn.classList.toggle("active", on);
    const small = btn.querySelector("small"); if (small) small.textContent = on ? "On" : "Off";
    showToast(`${btn.querySelector("span")?.textContent || "Setting"} ${on ? "enabled" : "disabled"}`);
  }));
  root.querySelector("#labBrightness")?.addEventListener("input", e => { desktop.style.filter = `brightness(${Number(e.target.value) / 100})`; });
  root.querySelector("#labDepth")?.addEventListener("input", e => { desktop.style.setProperty("--depth", e.target.value); });
  root.querySelectorAll("[data-space]").forEach(b => b.addEventListener("click", () => setSpace(Number(b.dataset.space))));
  root.querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", () => openWindow(b.dataset.open)));
  root.querySelectorAll('[data-lab-action="focus"]').forEach(b => b.addEventListener("click", () => toggleFocus()));
  root.querySelectorAll('[data-lab-action="command"]').forEach(b => b.addEventListener("click", openCommand));
  root.querySelectorAll('[data-lab-action="wallpaper"]').forEach(b => b.addEventListener("click", cycleWallpaper));
  root.querySelectorAll("[data-lab-menu]").forEach(b => b.addEventListener("click", () => showToast(`${b.textContent.trim()} menu opened`)));

  document.addEventListener("keydown", e => {
    const tag = document.activeElement?.tagName;
    const editing = tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable;
    if (editing && e.key !== "Escape") return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openCommand(); return; }
    if (e.key === "Escape") { closeCommand(); toggleControl(false); return; }
    if (e.key === "1" && !editing) setSpace(1);
    if (e.key === "2" && !editing) setSpace(2);
    if (e.key === "3" && !editing) setSpace(3);
  });

  if (window.matchMedia("(pointer:fine)").matches && !reduced) {
    desktop.addEventListener("mousemove", e => {
      const rect = desktop.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - .5;
      const y = (e.clientY - rect.top) / rect.height - .5;
      const amount = Number(desktop.style.getPropertyValue("--depth") || 68) / 68;
      root.querySelectorAll(".lab-window").forEach((win, i) => {
        const strength = (i + 1) * 1.2 * amount;
        win.style.translate = `${x * strength}px ${y * strength}px`;
      });
    });
    desktop.addEventListener("mouseleave", () => root.querySelectorAll(".lab-window").forEach(w => w.style.translate = "0 0"));
  }

  if (window.gsap && !reduced) {
    window.gsap.fromTo(".os-lab-console", { opacity: 0, y: 70, rotateX: 7, transformPerspective: 1200 }, { opacity: 1, y: 0, rotateX: 0, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: ".os-lab-console", start: "top 82%", once: true } });
    window.gsap.to(".os-lab-orb-a", { x: 90, y: -50, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });
    window.gsap.to(".os-lab-orb-b", { x: -80, y: 70, duration: 9, repeat: -1, yoyo: true, ease: "sine.inOut" });
    window.gsap.to(".lab-window-main", { y: -5, duration: 3.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
    window.gsap.to(".lab-window-terminal", { y: 7, duration: 4.1, repeat: -1, yoyo: true, ease: "sine.inOut" });
    window.gsap.to(".lab-window-notes", { y: -8, duration: 3.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }

  function updateClock() {
    const now = new Date();
    if (clock) clock.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  updateClock();
  setInterval(updateClock, 30000);
  openWindow("browser");
})();
