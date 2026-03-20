
// GSAP Animationen fuer Webflow Integration (Final)
// Zusammengefuehrt aus anim.js und bereitgestellten Scripts
//
// =========================================================
// 01) BASIS & DEPENDENCIES
// =========================================================
(function () {
    "use strict";
  
    // FOUC vermeiden: wichtige Elemente initial ausblenden
    if (
      !document.getElementById("animjs-initial-visibility") &&
      document.readyState === "loading"
    ) {
      const styleEl = document.createElement("style");
      styleEl.id = "animjs-initial-visibility";
      styleEl.textContent = ".nav,.nav_wrap,.sticky_wrap{visibility:hidden;}";
      document.head.appendChild(styleEl);
    }
  
    // Register plugins if available
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    } else {
      if (typeof gsap === "undefined") {
        console.error(
          "[GSAP] gsap nicht gefunden. Stelle sicher, dass GSAP vor diesem Script geladen wird.",
        );
      } else if (typeof ScrollTrigger === "undefined") {
        console.error(
          "[GSAP] ScrollTrigger nicht gefunden. Stelle sicher, dass das Plugin geladen wird.",
        );
      }
    }
  
    if (typeof gsap !== "undefined" && typeof Draggable !== "undefined") {
      gsap.registerPlugin(Draggable);
    }
  
    function debounce(fn, wait) {
      let timeoutId = null;
  
      return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => fn(...args), wait);
      };
    }
  
    function getNavElement() {
      return document.querySelector(".nav") || document.querySelector(".nav_wrap");
    }
  
    // =========================================================
    // 02) SMOOTH SCROLL (LENIS)
    // =========================================================
    let __lenisInstance = null;
    let __lenisRafId = null;
    let __lenisGsapTicker = null;
    let __lenisAnchorBound = false;
  
    function initLenis() {
      if (typeof Lenis === "undefined") {
        console.warn(
          "[Lenis] Lenis nicht gefunden. Bitte Lenis vor diesem Script laden.",
        );
        return;
      }
      if (__lenisInstance) return;
  
      __lenisInstance = new Lenis({
        lerp: 0.1,
        smoothTouch: false,
        syncTouch: false,
      });
  
      if (typeof ScrollTrigger !== "undefined") {
        __lenisInstance.on("scroll", ScrollTrigger.update);
      }
  
      if (typeof gsap !== "undefined") {
        gsap.ticker.add((time) => {
          __lenisInstance.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      }
  
      const jq = window.jQuery || window.$;
      if (jq && typeof jq === "function") {
        jq("[data-lenis-start]").on("click", function () {
          __lenisInstance.start();
          if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
        });
        jq("[data-lenis-stop]").on("click", function () {
          __lenisInstance.stop();
          if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
        });
        jq("[data-lenis-toggle]").on("click", function () {
          jq(this).toggleClass("stop-scroll");
          if (jq(this).hasClass("stop-scroll")) {
            __lenisInstance.stop();
            if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
          } else {
            __lenisInstance.start();
            if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
          }
        });
      }
    }
  
    // =========================================================
    // 03) SPLITTEXT FALLBACK
    // =========================================================
    if (typeof SplitText === "undefined") {
      function createSplitText(el) {
        const original = el.textContent;
        el.textContent = "";
        const words = [];
        const chars = [];
        const frag = document.createDocumentFragment();
  
        original.split(/(\s+)/).forEach((token) => {
          if (token.trim() === "") {
            frag.appendChild(document.createTextNode(token));
            return;
          }
          const wSpan = document.createElement("span");
          wSpan.className = "word";
          [...token].forEach((c) => {
            const cSpan = document.createElement("span");
            cSpan.className = "char";
            cSpan.textContent = c;
            wSpan.appendChild(cSpan);
            chars.push(cSpan);
          });
          words.push(wSpan);
          frag.appendChild(wSpan);
          frag.appendChild(document.createTextNode(" "));
        });
  
        el.appendChild(frag);
        return { words, chars };
      }
    }
  
    // =========================================================
    // 04) ANIMATIONEN
    // =========================================================
  
    // Global Content Reveal (data-reveal-group)
    function initContentRevealScroll() {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
  
      const ctx = gsap.context(() => {
        document.querySelectorAll("[data-reveal-group]").forEach((groupEl) => {
          const groupStaggerSec =
            (parseFloat(groupEl.getAttribute("data-stagger")) || 100) / 1000;
          const groupDistance = groupEl.getAttribute("data-distance") || "2em";
          const triggerStart = groupEl.getAttribute("data-start") || "top 80%";
  
          const animDuration = 0.8;
          const animEase = "power4.inOut";
  
          if (prefersReduced) {
            gsap.set(groupEl, { clearProps: "all", y: 0, autoAlpha: 1 });
            return;
          }
  
          const directChildren = Array.from(groupEl.children).filter(
            (el) => el.nodeType === 1,
          );
          if (!directChildren.length) {
            gsap.set(groupEl, { y: groupDistance, autoAlpha: 0 });
            ScrollTrigger.create({
              trigger: groupEl,
              start: triggerStart,
              once: true,
              onEnter: () =>
                gsap.to(groupEl, {
                  y: 0,
                  autoAlpha: 1,
                  duration: animDuration,
                  ease: animEase,
                  onComplete: () => gsap.set(groupEl, { clearProps: "all" }),
                }),
            });
            return;
          }
  
          const slots = [];
          directChildren.forEach((child) => {
            const nestedGroup = child.matches("[data-reveal-group-nested]")
              ? child
              : child.querySelector(":scope [data-reveal-group-nested]");
  
            if (nestedGroup) {
              const includeParent =
                child.getAttribute("data-ignore") === "false" ||
                nestedGroup.getAttribute("data-ignore") === "false";
              slots.push({
                type: "nested",
                parentEl: child,
                nestedEl: nestedGroup,
                includeParent,
              });
            } else {
              slots.push({ type: "item", el: child });
            }
          });
  
          slots.forEach((slot) => {
            if (slot.type === "item") {
              const isNestedSelf = slot.el.matches("[data-reveal-group-nested]");
              const d = isNestedSelf
                ? groupDistance
                : slot.el.getAttribute("data-distance") || groupDistance;
              gsap.set(slot.el, { y: d, autoAlpha: 0 });
            } else {
              if (slot.includeParent)
                gsap.set(slot.parentEl, { y: groupDistance, autoAlpha: 0 });
              const nestedD =
                slot.nestedEl.getAttribute("data-distance") || groupDistance;
              Array.from(slot.nestedEl.children).forEach((target) =>
                gsap.set(target, { y: nestedD, autoAlpha: 0 }),
              );
            }
          });
  
          slots.forEach((slot) => {
            if (slot.type === "nested" && slot.includeParent) {
              gsap.set(slot.parentEl, { y: groupDistance });
            }
          });
  
          ScrollTrigger.create({
            trigger: groupEl,
            start: triggerStart,
            once: true,
            onEnter: () => {
              const tl = gsap.timeline();
  
              slots.forEach((slot, slotIndex) => {
                const slotTime = slotIndex * groupStaggerSec;
  
                if (slot.type === "item") {
                  tl.to(
                    slot.el,
                    {
                      y: 0,
                      autoAlpha: 1,
                      duration: animDuration,
                      ease: animEase,
                      onComplete: () => gsap.set(slot.el, { clearProps: "all" }),
                    },
                    slotTime,
                  );
                } else {
                  if (slot.includeParent) {
                    tl.to(
                      slot.parentEl,
                      {
                        y: 0,
                        autoAlpha: 1,
                        duration: animDuration,
                        ease: animEase,
                        onComplete: () =>
                          gsap.set(slot.parentEl, { clearProps: "all" }),
                      },
                      slotTime,
                    );
                  }
                  const nestedMs = parseFloat(
                    slot.nestedEl.getAttribute("data-stagger"),
                  );
                  const nestedStaggerSec = isNaN(nestedMs)
                    ? groupStaggerSec
                    : nestedMs / 1000;
                  Array.from(slot.nestedEl.children).forEach(
                    (nestedChild, nestedIndex) => {
                      tl.to(
                        nestedChild,
                        {
                          y: 0,
                          autoAlpha: 1,
                          duration: animDuration,
                          ease: animEase,
                          onComplete: () =>
                            gsap.set(nestedChild, { clearProps: "all" }),
                        },
                        slotTime + nestedIndex * nestedStaggerSec,
                      );
                    },
                  );
                }
              });
            },
          });
        });
      });
  
      return () => ctx.revert();
    }
  
    // Arrow Path Animation (#down)
    function initArrowPathAnimation() {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
        return;
  
      const path = document.querySelector("#down");
      if (!path || typeof path.getTotalLength !== "function") return;
  
      const len = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: len,
        strokeDashoffset: len,
      });
  
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "power2.out",
        duration: 1.5,
        scrollTrigger: {
          trigger: path,
          start: "top 80%",
          end: "top 20%",
          toggleActions: "play none none reverse",
        },
      });
    }
  
    // Eyebrow Marker Draw-on + Fill Animation
    function initEyebrowMarkerAnimation() {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
        return;
  
      const markers = [
        {
          selector: ".eyebrow_marker_two-svg path",
          from: "inset(0 0 100% 0)",
          to: "inset(0 0 0% 0)",
        },
        {
          selector: ".eyebrow_marker_three-svg path",
          from: "inset(0 100% 0 0)",
          to: "inset(0 0% 0 0)",
        },
        {
          selector: ".eyebrow_marker_four-svg path",
          from: "inset(0 0 0 100%)",
          to: "inset(0 0 0 0%)",
        },
      ];
  
      markers.forEach(({ selector, from, to }) => {
        document.querySelectorAll(selector).forEach((path) => {
          gsap.set(path, { clipPath: from });
  
          gsap.to(path, {
            clipPath: to,
            ease: "power4.in",
            duration: 0.8,
            scrollTrigger: {
              trigger: path,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });
        });
      });
    }
  
    // Footer Parallax & Scatter Animation
    function initFooterParallax() {
      const FOOTER_CONFIG = {
        DEBUG_MARKERS: false,
        CHAR_DURATION: 0.6,
        CHAR_STAGGER: 0.02,
        SCATTER_DISTANCE: 120,
        SCATTER_DISTANCE_Y_FACTOR: 0.6,
        RANDOM_OFFSET: 100,
        RANDOM_OFFSET_Y: 60,
        ROTATION_RANGE: 60,
        SCALE_MIN: 0.8,
        SCALE_MAX: 1.2,
        PARALLAX_Y_PERCENT: -30,
        DARK_OVERLAY_OPACITY: 0.5,
      };
  
      if (typeof gsap === "undefined") {
        console.error("[footer-anim] GSAP (gsap.min.js) ist nicht geladen.");
        return;
      }
      if (typeof ScrollTrigger === "undefined") {
        console.error(
          "[footer-anim] ScrollTrigger (ScrollTrigger.min.js) ist nicht geladen.",
        );
        return;
      }
  
      const sections = document.querySelectorAll("[data-footer-parallax]");
      if (!sections.length) {
        console.warn(
          "[footer-anim] Keine Elemente mit [data-footer-parallax] gefunden.",
        );
        return;
      }
  
      function setupFooterScatter(textElement) {
        const split =
          typeof SplitText !== "undefined"
            ? new SplitText(textElement, {
                type: "chars,words",
                charsClass: "char",
                wordsClass: "word",
              })
            : createSplitText(textElement);
  
        gsap.set(split.chars, {
          position: "relative",
          display: "inline-block",
        });
  
        if (split.words) {
          gsap.set(split.words, {
            display: "inline-block",
            whiteSpace: "nowrap",
          });
        }
  
        function scatterNow() {
          split.chars.forEach((char) => {
            if (!char || char.textContent.trim() === "") return;
  
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * FOOTER_CONFIG.SCATTER_DISTANCE;
            const offsetX = Math.cos(angle) * distance;
            const offsetY =
              Math.sin(angle) *
              distance *
              FOOTER_CONFIG.SCATTER_DISTANCE_Y_FACTOR;
            const randomX = (Math.random() - 0.5) * FOOTER_CONFIG.RANDOM_OFFSET;
            const randomY = (Math.random() - 0.5) * FOOTER_CONFIG.RANDOM_OFFSET_Y;
            const finalX = offsetX + randomX;
            const finalY = offsetY + randomY;
            const rotation = (Math.random() - 0.5) * FOOTER_CONFIG.ROTATION_RANGE;
            const scale = gsap.utils.random(
              FOOTER_CONFIG.SCALE_MIN,
              FOOTER_CONFIG.SCALE_MAX,
            );
  
            gsap.set(char, {
              x: finalX,
              y: finalY,
              rotation: rotation,
              scale: scale,
              force3D: true,
            });
          });
        }
  
        scatterNow();
  
        return { split, scatterNow };
      }
  
      sections.forEach((el) => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "top top",
            scrub: true,
            markers: FOOTER_CONFIG.DEBUG_MARKERS,
            invalidateOnRefresh: true,
          },
        });
  
        const inner = el.querySelector(
          "[data-footer-parallax-inner], [data-footer-parallax-inne]",
        );
        const dark = el.querySelector("[data-footer-parallax-dark]");
        const textTargets = el.querySelectorAll('[data-anim="footer"]');
  
        let maxTextTotal = 0;
  
        textTargets.forEach((textEl) => {
          const { split, scatterNow } = setupFooterScatter(textEl);
  
          const chars = split.chars.filter(
            (c) => c && c.textContent.trim() !== "",
          );
          const textTotal =
            chars.length > 0
              ? FOOTER_CONFIG.CHAR_DURATION +
                FOOTER_CONFIG.CHAR_STAGGER * (chars.length - 1)
              : 0;
  
          maxTextTotal = Math.max(maxTextTotal, textTotal);
  
          tl.to(
            chars,
            {
              x: 0,
              y: 0,
              rotation: 0,
              scale: 1,
              duration: FOOTER_CONFIG.CHAR_DURATION,
              stagger: {
                each: FOOTER_CONFIG.CHAR_STAGGER,
                from: "start",
              },
            },
            0,
          );
  
          let footerResizeTimeout;
          window.addEventListener(
            "resize",
            () => {
              clearTimeout(footerResizeTimeout);
              footerResizeTimeout = setTimeout(() => {
                const st = tl.scrollTrigger;
                const progress = st && st.progress != null ? st.progress : 0;
                if (progress < 0.05 || progress > 0.95) {
                  scatterNow();
                  ScrollTrigger.refresh();
                }
              }, 400);
            },
            { passive: true },
          );
        });
  
        if (maxTextTotal === 0) maxTextTotal = 1;
  
        if (inner) {
          tl.from(
            inner,
            {
              yPercent: FOOTER_CONFIG.PARALLAX_Y_PERCENT,
              duration: maxTextTotal,
              force3D: true,
            },
            0,
          );
        } else {
          console.warn("[footer-anim] Kein [data-footer-parallax-inner] in:", el);
        }
  
        if (dark) {
          tl.from(
            dark,
            {
              opacity: FOOTER_CONFIG.DARK_OVERLAY_OPACITY,
              duration: maxTextTotal,
            },
            0,
          );
        }
      });
  
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          // Delay refresh so the scatter loader can finish first
          setTimeout(() => ScrollTrigger.refresh(), 2000);
        });
      } else {
        setTimeout(() => ScrollTrigger.refresh(), 2000);
      }
    }
  
    // Partners Title Animation
    function initPartnersTitle() {
      const PARTNERS_CONFIG = {
        SVG_DURATION: 1,
        TEXT_OFFSET: 0.3,
        TEXT_DURATION: 0.5,
        TEXT_STAGGER: 0.03,
        TEXT_Y_OFFSET: 20,
        DEBUG_MARKERS: false,
      };
  
      if (typeof gsap === "undefined") {
        console.error("[partners-anim] GSAP (gsap.min.js) ist nicht geladen.");
        return;
      }
      if (typeof ScrollTrigger === "undefined") {
        console.error(
          "[partners-anim] ScrollTrigger (ScrollTrigger.min.js) ist nicht geladen.",
        );
        return;
      }
  
      const titleSpan = document.querySelector(".partners_title-span");
      const clip = document.querySelector(".partners_title-svg-clip");
  
      if (!titleSpan || !clip) {
        console.warn(
          "[partners-anim] .partners_title-span oder .partners_title-svg-clip nicht gefunden.",
        );
        return;
      }
  
      gsap.set(titleSpan, { autoAlpha: 0 });
  
      const split =
        typeof SplitText !== "undefined"
          ? new SplitText(titleSpan, { type: "chars" })
          : createSplitText(titleSpan);
  
      const tl = gsap.timeline({
        paused: true,
        scrollTrigger: {
          trigger: titleSpan,
          start: "top 60%",
          end: "top 60%",
          markers: PARTNERS_CONFIG.DEBUG_MARKERS,
          once: true,
          onEnter: () => tl.play(),
        },
      });
  
      tl.set(clip, {
        clipPath: "inset(0 100% 0 0)",
        webkitClipPath: "inset(0 100% 0 0)",
      })
        .to(clip, {
          clipPath: "inset(0 0% 0 0)",
          webkitClipPath: "inset(0 0% 0 0)",
          duration: PARTNERS_CONFIG.SVG_DURATION,
          ease: "power4.inOut",
        })
        .set(
          titleSpan,
          {
            autoAlpha: 1,
          },
          `-=${PARTNERS_CONFIG.TEXT_OFFSET}`,
        )
        .from(
          split.chars,
          {
            opacity: 0,
            y: PARTNERS_CONFIG.TEXT_Y_OFFSET,
            duration: PARTNERS_CONFIG.TEXT_DURATION,
            stagger: PARTNERS_CONFIG.TEXT_STAGGER,
            ease: "back.out(1.7)",
          },
          `-=${PARTNERS_CONFIG.TEXT_OFFSET}`,
        );
    }
  
    // Challenges Card Animation (Desktop hover)
    function initChallengesAnimation() {
      const container = document.querySelector(
        ".challenges_wrap .challenges_cards_wrap",
      );
      if (!container) return;
  
      if (window.innerWidth < 992) {
        console.log("Challenges Card Animation: Screen zu klein (< 992px)");
        return;
      }
  
      const containerW = container.clientWidth;
      const cards = document.querySelectorAll(".challenge_card");
      const cardsLength = cards.length;
      const cardContent = document.querySelectorAll(
        ".challenge_card .challenge_card_inner",
      );
  
      let currentPortion = 0;
  
      cards.forEach((card) => {
        gsap.set(card, {
          xPercent: (Math.random() - 0.5) * 10,
          yPercent: (Math.random() - 0.5) * 10,
          rotation: (Math.random() - 0.5) * 20,
        });
      });
  
      function handleMouseMove(e) {
        const mouseX = e.clientX - container.getBoundingClientRect().left;
        const percentage = mouseX / containerW;
        const activePortion = Math.ceil(percentage * cardsLength);
  
        if (
          currentPortion !== activePortion &&
          activePortion > 0 &&
          activePortion <= cardsLength
        ) {
          if (currentPortion !== 0) {
            resetPortion(currentPortion - 1);
          }
          currentPortion = activePortion;
          newPortion(currentPortion - 1);
        }
      }
  
      function handleMouseLeave() {
        resetPortion(currentPortion - 1);
        currentPortion = 0;
  
        gsap.to(cardContent, {
          xPercent: 0,
          ease: "elastic.out(1, 0.75)",
          duration: 0.8,
        });
      }
  
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
  
      function resetPortion(index) {
        gsap.to(cards[index], {
          xPercent: (Math.random() - 0.5) * 10,
          yPercent: (Math.random() - 0.5) * 10,
          rotation: (Math.random() - 0.5) * 20,
          scale: 1,
          duration: 0.8,
          ease: "elastic.out(1, 0.75)",
        });
      }
  
      function newPortion(i) {
        gsap.to(cards[i], {
          xPercent: 0,
          yPercent: 0,
          rotation: 0,
          duration: 0.8,
          scale: 1.1,
          ease: "elastic.out(1, 0.75)",
        });
  
        cardContent.forEach((content, index) => {
          if (index !== i) {
            gsap.to(content, {
              xPercent: 80 / (index - i),
              ease: "elastic.out(1, 0.75)",
              duration: 0.8,
            });
          } else {
            gsap.to(content, {
              xPercent: 0,
              ease: "elastic.out(1, 0.75)",
              duration: 0.8,
            });
          }
        });
      }
    }
  
    // Challenges Illustration Parallax (paths)
    function initChallengesIllustrationAnimation() {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
        return;
      document.querySelectorAll(".challenges_illu").forEach((component) => {
        if (component.dataset.scriptInitialized) return;
        component.dataset.scriptInitialized = "true";
        const pathOne = component.querySelector(".c_path_one");
        const pathTwo = component.querySelector(".c_path_two");
        const pathThree = component.querySelector(".c_path_three");
  
        gsap.set([pathOne, pathTwo, pathThree], {
          transformOrigin: "center center",
        });
  
        gsap
          .timeline({
            scrollTrigger: {
              trigger: component,
              start: "top 85%",
              end: "bottom 10%",
              scrub: 0.8,
              markers: false,
            },
          })
          .to(
            pathOne,
            {
              y: 120,
              x: 150,
              rotate: 25,
              scale: 1.4,
              ease: "none",
            },
            0,
          )
          .to(
            pathTwo,
            {
              y: -100,
              x: -180,
              rotate: -30,
              scale: 0.6,
              ease: "none",
            },
            0,
          )
          .to(
            pathThree,
            {
              y: 160,
              x: -120,
              rotate: 40,
              scale: 1.6,
              ease: "none",
            },
            0,
          );
      });
    }
  
    // Nav ausblenden, wenn Footer in View kommt
    function initNavHideOnFooter() {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
        return;
  
      const nav = getNavElement();
      const footer = document.querySelector(".footer_wrap");
      if (!nav || !footer) return;
  
      ScrollTrigger.create({
        trigger: footer,
        start: "top 10%",
        onEnter: () => {
          gsap.to(nav, {
            yPercent: -100,
            autoAlpha: 0,
            duration: 0.5,
            ease: "power2.out",
          });
        },
        onLeaveBack: () => {
          gsap.to(nav, {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.5,
            ease: "power2.out",
          });
        },
      });
    }
  
    // Challenges mobile pin stack (is-mobile)
    function initChallengesMobileStack() {
      const root = document.querySelector(".challenges_wrap.is-mobile");
      if (!root) return;
  
      const pinHeight = root.querySelector(".pin-height");
      const container = root.querySelector(".container");
      if (!pinHeight || !container) return;
  
      // pinType "fixed" for smooth Safari perf.
      // The fixed container escapes normal stacking, so we clip it
      // to the .pin-height bounds on every scroll frame. The container
      // is always visible — it never hides. The top edge is clipped
      // so the section above covers it; the bottom is never clipped
      // so the first card stays visible after the section, and the
      // next section scrolls over it via z-index.
      var sectionBelow = root.nextElementSibling;
      if (sectionBelow) {
        sectionBelow.style.position = "relative";
        sectionBelow.style.zIndex = "10";
      }
  
      ScrollTrigger.create({
        trigger: pinHeight,
        start: "top top",
        end: "bottom bottom",
        pin: container,
        pinType: "fixed",
        invalidateOnRefresh: true,
        onUpdate: function () {
          var rect = pinHeight.getBoundingClientRect();
          var topGap = Math.max(0, rect.top);
          if (topGap > 0) {
            container.style.clipPath = "inset(" + topGap + "px 0px 0px 0px)";
          } else {
            container.style.clipPath = "none";
          }
        },
      });
  
      const gap = 30;
      const medias = root.querySelectorAll(".media");
      const distPerMedia =
        (pinHeight.clientHeight - window.innerHeight) / medias.length;
  
      gsap.set(medias, {
        y: gap * (medias.length - 1),
        z: -gap * (medias.length - 1),
      });
  
      medias.forEach((media, index) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinHeight,
            start: "top top+=" + distPerMedia * index,
            end: "bottom bottom+=" + distPerMedia * index,
            scrub: 0.5,
          },
        });
  
        for (let i = 0; i < medias.length - 1; i++) {
          tl.to(media, {
            y: "-=" + gap,
            z: "+=" + gap,
            ease: "back.inOut(3)",
          });
        }
  
        // First card stays on screen — only fly away cards stacked on top of it
        if (index > 0) {
          tl.to(media, {
            yPercent: -80,
            y: "-50vh",
            scale: 1.2,
            rotation: (Math.random() - 0.5) * 50,
            ease: "power4.in",
          });
        }
      });
    }
  
    // Testimonials reveal
    function initTestimonials() {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
        return;
  
      const testimonialItems = gsap.utils.toArray(".testimonial_cms_item");
      testimonialItems.forEach((item) => {
        const imgs = item.querySelectorAll(".team_card_visual img");
  
        if (imgs.length) {
          gsap.set(imgs, { clipPath: "circle(0% at 50% 50%)" });
        }
  
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
            once: true,
          },
        });
  
        tl.from(item, {
          opacity: 0,
          scale: 0.92,
          duration: 0.7,
          ease: "power2.out",
        });
  
        if (imgs.length) {
          tl.to(
            imgs,
            {
              clipPath: "circle(75% at 50% 50%)",
              duration: 0.6,
              ease: "power3.out",
            },
            "-=0.4",
          );
        }
      });
    }
  
    // Scatter loader for hero headline
    let scatterInstances = [];
    let scatterLoaderStarted = false;
  
    function initScatterLoader() {
      if (!document.body || !document.body.hasAttribute("data-home")) return;
      if (typeof gsap === "undefined") return;
      const lateInit = document.readyState === "complete";
  
      const nav = getNavElement();
  
      if (nav && !lateInit) {
        gsap.set(nav, { autoAlpha: 0, y: -100 });
      }
      gsap.set(".sticky_cta", { autoAlpha: 0, y: 20 });
  
      // Scroll während Load verhindern
      if (!lateInit) {
        document.documentElement.style.overflow = "hidden";
      }
  
      const startScatterLoader = () => {
        if (scatterLoaderStarted) return;
        scatterLoaderStarted = true;
  
        if (!lateInit) {
          window.scrollTo(0, 0);
        }
  
        const fontsReady =
          document.fonts && document.fonts.ready
            ? document.fonts.ready
            : Promise.resolve();
        fontsReady.then(() => {
          document.querySelectorAll("[data-scatter]").forEach((el) => {
            scatterInstances.push(createScatter(el));
          });
          if (!lateInit) {
            document.documentElement.style.overflow = "";
          }
        });
      };
  
      if (document.readyState === "complete") {
        startScatterLoader();
      } else {
        window.addEventListener("load", startScatterLoader, { once: true });
      }
  
      var lastResizeWidth = window.innerWidth;
      window.addEventListener(
        "resize",
        debounce(() => {
          var newWidth = window.innerWidth;
          // Skip rebuild if only height changed (iOS Safari address bar hide/show)
          if (newWidth === lastResizeWidth) return;
          lastResizeWidth = newWidth;
          scatterInstances.forEach((i) => i.rebuild());
        }, 300),
      );
    }
  
    function createScatter(headline) {
      const sticky = headline.closest(".hero-sticky");
      if (!sticky) return { rebuild() {} };
      const stage = sticky.querySelector(".scatter-stage");
      if (!stage) return { rebuild() {} };
  
      // Prevent hero from overlapping sections below during fast scroll
      const heroScroll = headline.closest(".hero-scroll") || sticky.parentElement;
      if (heroScroll) {
        heroScroll.style.position = "relative";
        heroScroll.style.zIndex = "1";
        heroScroll.style.isolation = "isolate";
      }
      const sectionBelow = heroScroll
        ? heroScroll.nextElementSibling
        : sticky.parentElement && sticky.parentElement.nextElementSibling;
      if (sectionBelow) {
        sectionBelow.style.position = "relative";
        sectionBelow.style.zIndex = "2";
      }
      let letters = [];
      let scatterScrollTrigger = null;
      let indicatorScrollTrigger = null;
  
      function measureLayout() {
        const stageRect = stage.getBoundingClientRect();
        const walker = document.createTreeWalker(headline, NodeFilter.SHOW_TEXT);
        const range = document.createRange();
        const targets = [];
        let node;
  
        while ((node = walker.nextNode())) {
          const text = node.textContent;
          for (let i = 0; i < text.length; i++) {
            range.setStart(node, i);
            range.setEnd(node, i + 1);
            const rect = range.getBoundingClientRect();
            if (rect.width < 0.5) continue;
            const char = text[i];
            targets.push({
              char,
              space: /\s/.test(char),
              cx: rect.left - stageRect.left + rect.width / 2,
              cy: rect.top - stageRect.top + rect.height / 2,
            });
          }
        }
        return targets;
      }
  
      function build() {
        const targets = measureLayout();
        headline.style.visibility = "hidden";
        stage.style.visibility = "hidden";
  
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const stageRect = stage.getBoundingClientRect();
  
        // Zentrierung: jede Zeile an der Viewport-Mitte ausrichten
        const nonSpace = targets.filter((t) => !t.space);
        if (nonSpace.length) {
          // Use clientWidth (excludes scrollbar) to match CSS-centred elements
          const clientW = document.documentElement.clientWidth;
          const stageCenterX =
            clientW / 2 -
            stageRect.left +
            parseFloat(getComputedStyle(document.documentElement).fontSize);
  
          // Group characters into lines by cy
          const cySet = [...new Set(nonSpace.map((t) => Math.round(t.cy)))];
          cySet.forEach((lineCy) => {
            const lineChars = nonSpace.filter((t) => Math.round(t.cy) === lineCy);
            const minX = Math.min(...lineChars.map((t) => t.cx));
            const maxX = Math.max(...lineChars.map((t) => t.cx));
            const lineCenterX = (minX + maxX) / 2;
            const shift = stageCenterX - lineCenterX;
            // Shift all targets on this line (including spaces)
            targets.forEach((t) => {
              if (Math.round(t.cy) === lineCy) {
                t.cx += shift;
              }
            });
          });
        }
  
        const rem = parseFloat(
          getComputedStyle(document.documentElement).fontSize,
        );
        const maxW = Math.min(55 * rem, vw);
        const boundsLeft = (vw - maxW) / 2 - stageRect.left;
        const boundsH = vh * 0.6;
        const boundsTop = (vh - boundsH) / 2 - stageRect.top;
  
        const typo = getComputedStyle(headline);
  
        targets
          .filter((t) => !t.space)
          .forEach((t) => {
            const randX = boundsLeft + Math.random() * maxW;
            const randY = boundsTop + Math.random() * boundsH;
            const randRotation = (Math.random() - 0.5) * 300;
            const randScale = 0.5 + Math.random() * 0.6;
  
            const span = document.createElement("span");
            span.className = "scatter-letter";
            span.textContent = t.char;
  
            span.dataset.cx = t.cx;
            span.dataset.cy = t.cy;
            span.dataset.scatterTargetX = randX;
            span.dataset.scatterTargetY = randY;
            span.dataset.scatterTargetRotation = randRotation;
            span.dataset.scatterTargetScale = randScale;
  
            span.style.font = typo.font;
            span.style.color = typo.color;
            span.style.letterSpacing = typo.letterSpacing;
            span.style.textTransform = typo.textTransform;
            span.style.lineHeight = "1";
  
            gsap.set(span, {
              position: "absolute",
              left: 0,
              top: 0,
              xPercent: -50,
              yPercent: -50,
              autoAlpha: 0,
              force3D: true,
              transformOrigin: "50% 50%",
              backfaceVisibility: "hidden",
            });
  
            stage.appendChild(span);
            letters.push(span);
          });
  
        primeLoader();
      }
  
      function primeLoader() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
  
        letters.forEach((el) => {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.max(vw, vh) * 1.3;
          const fromX = Math.cos(angle) * dist;
          const fromY = Math.sin(angle) * dist;
          const fromR = (Math.random() - 0.5) * 720;
          const fromS = 0.2 + Math.random() * 0.4;
          const delay = Math.random() * 0.5;
          const dur = 0.7 + Math.random() * 0.5;
  
          el.dataset.scatterDelay = delay;
          el.dataset.scatterDuration = dur;
  
          el.style.willChange = "transform, opacity";
          gsap.set(el, {
            x: fromX,
            y: fromY,
            rotation: fromR,
            scale: fromS,
            autoAlpha: 0,
            force3D: true,
          });
        });
  
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            stage.style.visibility = "";
            runLoader();
          });
        });
      }
  
      function runLoader() {
        let maxEnd = 0;
  
        const patternPaths = document.querySelectorAll(".sticky_pattern path");
        if (patternPaths.length) {
          patternPaths.forEach((p) => {
            if (typeof p.getTotalLength !== "function") return;
            const len = p.getTotalLength();
            gsap.set(p, {
              strokeDasharray: len,
              strokeDashoffset: len,
              stroke: "currentColor",
              fill: "none",
            });
          });
          gsap.set(".sticky_pattern", { autoAlpha: 1 });
          gsap.to(patternPaths, {
            strokeDashoffset: 0,
            duration: 1.6,
            ease: "power3.out",
            stagger: 0.06,
          });
        }
  
        letters.forEach((el) => {
          const toX = parseFloat(el.dataset.scatterTargetX || "0");
          const toY = parseFloat(el.dataset.scatterTargetY || "0");
          const toR = parseFloat(el.dataset.scatterTargetRotation || "0");
          const toS = parseFloat(el.dataset.scatterTargetScale || "1");
          const delay = parseFloat(el.dataset.scatterDelay || "0");
          const dur = parseFloat(el.dataset.scatterDuration || "0.7");
  
          gsap.to(el, {
            autoAlpha: 1,
            x: toX,
            y: toY,
            rotation: toR,
            scale: toS,
            duration: dur,
            ease: "power3.out",
            delay,
            force3D: true,
            onComplete: () => {
              el.style.willChange = "";
            },
          });
  
          maxEnd = Math.max(maxEnd, delay + dur);
        });
  
        gsap.delayedCall(maxEnd, () => {
          gsap.set(".sticky_pattern", { autoAlpha: 1 });
          gsap.set(".sticky-indicator", { autoAlpha: 0, y: 20 });
          const nav = getNavElement();
          if (nav) {
            gsap.to(nav, {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              ease: "power2.out",
            });
          }
          const scrollTop =
            typeof __lenisInstance !== "undefined" &&
            __lenisInstance &&
            typeof __lenisInstance.scroll === "number"
              ? __lenisInstance.scroll
              : typeof window.scrollY === "number"
                ? window.scrollY
                : document.documentElement.scrollTop || 0;
          if (scrollTop <= 80) {
            gsap.to(
              ".sticky-indicator",
              { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" },
              "<",
            );
          } else {
            gsap.set(".sticky-indicator", { autoAlpha: 0 });
          }
          createScrollAnimation();
        });
      }
  
      function createScrollAnimation() {
        const scrollEl =
          headline.closest("[data-scatter-scroll]") ||
          headline.closest(".hero-scroll");
  
        // Lock end value to absolute pixels so iOS address bar
        // height changes don't recalculate the scroll range
        var scrollEndPx = window.innerHeight * 3;
  
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scrollEl,
            start: "top top",
            end: "+=" + scrollEndPx + "px",
            scrub: true,
            onToggle: (self) => {
              scatterScrollTrigger = self;
            },
          },
        });
  
        letters.forEach((el, i) => {
          tl.fromTo(
            el,
            {
              x: parseFloat(el.dataset.scatterTargetX || "0"),
              y: parseFloat(el.dataset.scatterTargetY || "0"),
              rotation: parseFloat(el.dataset.scatterTargetRotation || "0"),
              scale: parseFloat(el.dataset.scatterTargetScale || "1"),
            },
            {
              x: parseFloat(el.dataset.cx),
              y: parseFloat(el.dataset.cy),
              rotation: 0,
              scale: 1,
              ease: "power3.out",
              duration: 0.55,
              immediateRender: false,
            },
            (i / letters.length) * 0.55,
          );
        });
  
        tl.to(
          ".sticky_cta",
          { autoAlpha: 1, y: 0, duration: 0.1, ease: "power2.out" },
          0.8,
        );
  
        tl.to({}, { duration: 1 }, 1);
  
        scatterScrollTrigger = tl.scrollTrigger;
  
        // .sticky-indicator nur am Page-Top sichtbar (bei Scroll ausblenden, bei Zurück-nach-oben einblenden)
        if (indicatorScrollTrigger) indicatorScrollTrigger.kill();
        indicatorScrollTrigger = ScrollTrigger.create({
          start: "top top",
          end: "81px top",
          onEnterBack: () =>
            gsap.to(".sticky-indicator", {
              autoAlpha: 1,
              y: 0,
              duration: 0.3,
              ease: "power2.out",
            }),
          onLeave: () =>
            gsap.to(".sticky-indicator", {
              autoAlpha: 0,
              duration: 0.2,
              ease: "power2.out",
            }),
        });
        // Nach Reload mit gescrollter Position: Indicator sofort ausblenden, wenn nicht am Top
        const scrollTop =
          typeof __lenisInstance !== "undefined" &&
          __lenisInstance &&
          typeof __lenisInstance.scroll === "number"
            ? __lenisInstance.scroll
            : typeof window.scrollY === "number"
              ? window.scrollY
              : document.documentElement.scrollTop || 0;
        if (scrollTop > 80) gsap.set(".sticky-indicator", { autoAlpha: 0 });
      }
  
      function rebuild() {
        if (scatterScrollTrigger) {
          scatterScrollTrigger.kill();
          scatterScrollTrigger = null;
        }
        if (indicatorScrollTrigger) {
          indicatorScrollTrigger.kill();
          indicatorScrollTrigger = null;
        }
        stage.innerHTML = "";
        letters = [];
        headline.style.visibility = "";
        // Reflow abwarten bevor neu gemessen wird
        requestAnimationFrame(() => requestAnimationFrame(() => build()));
      }
  
      build();
      return { rebuild };
    }
  
    // Waage animation
    function initWaage() {
      const scene = document.querySelector(".waage-scene");
      const inner = document.querySelector(".waage-scene-inner");
      if (!scene || !inner || typeof gsap === "undefined") return;
  
      function scaleWaage() {
        const scale = scene.offsetWidth / 750;
        inner.style.transform = "scale(" + scale + ")";
      }
      scaleWaage();
      window.addEventListener("resize", scaleWaage);
  
      gsap.fromTo(
        ".waage-beam-group",
        { rotation: -8 },
        {
          rotation: 8,
          duration: 2,
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1,
          transformOrigin: "366px 0px",
        },
      );
  
      gsap.fromTo(
        ".waage-person-left",
        { rotation: 5 },
        {
          rotation: -5,
          duration: 2,
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1,
          delay: 0.25,
          transformOrigin: "50% 0%",
        },
      );
  
      gsap.fromTo(
        ".waage-person-right",
        { rotation: 5 },
        {
          rotation: -5,
          duration: 2,
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1,
          delay: 0.25,
          transformOrigin: "50% 0%",
        },
      );
    }
  
    // Locale switcher
    let __localeSwitcherInitialized = false;
    function initLocaleSwitcher() {
      function sketchFlag(paths) {
        return (
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 24" width="28" height="20" fill="none" stroke="var(--_theme---text)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="display:block">' +
          paths +
          "</svg>"
        );
      }
  
      const FLAGS = {
        en: sketchFlag(
          '<rect x="1" y="1" width="30" height="22" rx="2" stroke-width="1.6"/><line x1="16" y1="1" x2="16" y2="23" stroke-width="2.2"/><line x1="1" y1="12" x2="31" y2="12" stroke-width="2.2"/><line x1="1" y1="1" x2="31" y2="23" stroke-width="1.2"/><line x1="31" y1="1" x2="1" y2="23" stroke-width="1.2"/>',
        ),
        de: sketchFlag(
          '<rect x="1" y="1" width="30" height="22" rx="2" stroke-width="1.6"/><path d="M1 8.5 Q8 8 16 8.5 T31 8.5" stroke-width="1.3"/><path d="M1 15.5 Q10 15 16 15.5 T31 15.5" stroke-width="1.3"/><line x1="3" y1="4.5" x2="12" y2="4.5" stroke-width="3" opacity="0.7"/><line x1="14" y1="5" x2="28" y2="4.5" stroke-width="3" opacity="0.7"/>',
        ),
        pt: sketchFlag(
          '<rect x="1" y="1" width="30" height="22" rx="2" stroke-width="1.6"/><path d="M12 1.5 Q12.5 8, 12 12 T12 22.5" stroke-width="1.3"/><circle cx="12" cy="12" r="3.5" stroke-width="1.4"/><circle cx="12" cy="12" r="1.5" stroke-width="1"/>',
        ),
      };
  
      const LOCALES = [
        { code: "en", href: "/", label: "EN", fullName: "English" },
        { code: "de", href: "/de", label: "DE", fullName: "Deutsch" },
        { code: "pt", href: "/pt", label: "PT", fullName: "Portugues" },
      ];
  
      function detectCurrentLocale() {
        const path = window.location.pathname;
        const htmlLang = document.documentElement.lang;
        for (let i = 0; i < LOCALES.length; i++) {
          const locPath = new URL(LOCALES[i].href, window.location.origin)
            .pathname;
          if (path === locPath || path.startsWith(locPath + "/"))
            return LOCALES[i].code;
        }
        if (htmlLang) {
          const code = htmlLang.split("-")[0].toLowerCase();
          const match = LOCALES.find((l) => l.code === code);
          if (match) return match.code;
        }
        return LOCALES[0].code;
      }
  
      function switchLocale(code) {
        const locale = LOCALES.find((l) => l.code === code);
        if (locale) window.location.href = locale.href;
      }
  
      function init() {
        if (__localeSwitcherInitialized) return;
        const switcher = document.querySelector(".locale-switcher");
        const trigger = document.querySelector(".locale-trigger");
        const dropdown = document.querySelector(".locale-dropdown");
        const currentFlag = document.querySelector(".current-flag");
        const currentLabel = document.querySelector(".current-label");
        if (!switcher || !trigger || !dropdown || !currentFlag || !currentLabel)
          return;
  
        const inlineFlags = {};
        const inlineFlagNodes = document.querySelectorAll("[data-locale-flag]");
        inlineFlagNodes.forEach((node) => {
          const code = (
            node.getAttribute("data-locale-flag") || ""
          ).toLowerCase();
          if (!code) return;
          let markup = "";
          const tag = node.tagName.toLowerCase();
          if (tag === "template") {
            markup = node.innerHTML.trim();
          } else if (tag === "svg") {
            markup = node.outerHTML;
          } else {
            markup = node.innerHTML.trim() || node.outerHTML;
          }
          if (markup) inlineFlags[code] = markup;
        });
  
        let activeCode = detectCurrentLocale();
  
        function getFlagMarkup(code) {
          return inlineFlags[code] || FLAGS[code] || "";
        }
  
        function renderTrigger(code) {
          const locale = LOCALES.find((l) => l.code === code);
          if (!locale) return;
          currentFlag.innerHTML = getFlagMarkup(locale.code);
          currentLabel.textContent = locale.code.toUpperCase();
        }
  
        function renderDropdown() {
          dropdown.innerHTML = "";
          LOCALES.forEach((locale) => {
            if (locale.code === activeCode) return;
            const btn = document.createElement("button");
            btn.dataset.code = locale.code;
            btn.innerHTML =
              '<span class="flag">' +
              getFlagMarkup(locale.code) +
              "</span>" +
              '<span class="label">' +
              locale.code.toUpperCase() +
              "</span>";
            btn.addEventListener("click", () => {
              activeCode = locale.code;
              renderTrigger(activeCode);
              renderDropdown();
              close();
              switchLocale(locale.code);
            });
            dropdown.appendChild(btn);
          });
        }
  
        function open() {
          switcher.classList.add("open", "locale-switcher--open");
          trigger.setAttribute("aria-expanded", "true");
        }
        function close() {
          switcher.classList.remove("open", "locale-switcher--open");
          trigger.setAttribute("aria-expanded", "false");
        }
        function toggle() {
          switcher.classList.contains("open") ? close() : open();
        }
  
        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          toggle();
        });
        document.addEventListener("click", (e) => {
          if (!switcher.contains(e.target)) close();
        });
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") close();
        });
  
        renderTrigger(activeCode);
        renderDropdown();
        __localeSwitcherInitialized = true;
      }
  
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
      } else {
        init();
      }
    }
  
    // Reveal Scatter (data-reveal-scatter)
    function initRevealScatter() {
      const ATTR = "data-reveal-scatter";
  
      function splitChars(el) {
        function makeChar(char) {
          const span = document.createElement("span");
          span.classList.add("scatter-char");
          span.setAttribute("aria-hidden", "true");
          span.textContent = char;
  
          const angle = Math.random() * Math.PI * 2;
          const dist = 40 + Math.random() * 60;
          span.style.setProperty("--sx", Math.cos(angle) * dist + "px");
          span.style.setProperty("--sy", Math.sin(angle) * dist + "px");
          span.style.setProperty("--sr", (Math.random() - 0.5) * 40 + "deg");
          return span;
        }
  
        function processNode(node) {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const frag = document.createDocumentFragment();
            const parts = text.split(/(\s+)/);
            parts.forEach((part) => {
              if (/^\s+$/.test(part)) {
                frag.appendChild(document.createTextNode(part));
              } else {
                const word = document.createElement("span");
                word.classList.add("scatter-word");
                word.style.display = "inline-block";
                word.style.whiteSpace = "nowrap";
  
                for (const char of part) {
                  word.appendChild(makeChar(char));
                }
                frag.appendChild(word);
              }
            });
            return frag;
          }
  
          if (node.nodeType === Node.ELEMENT_NODE) {
            const clone = node.cloneNode(false);
            node.childNodes.forEach((child) =>
              clone.appendChild(processNode(child)),
            );
            return clone;
          }
  
          return node.cloneNode(true);
        }
  
        const label = el.textContent;
        el.setAttribute("aria-label", label);
  
        const frag = document.createDocumentFragment();
        el.childNodes.forEach((child) => frag.appendChild(processNode(child)));
        el.innerHTML = "";
        el.appendChild(frag);
      }
  
      function initElement(el) {
        const duration = parseFloat(
          el.getAttribute("data-reveal-scatter-duration") || 0.6,
        );
        const stagger = parseFloat(
          el.getAttribute("data-reveal-scatter-stagger") || 0.04,
        );
        const once = el.getAttribute("data-reveal-scatter-once") !== "false";
  
        splitChars(el);
  
        const chars = el.querySelectorAll(".scatter-char");
        chars.forEach((char) => {
          char.style.display = "inline-block";
          char.style.opacity = "0";
          char.style.transform =
            "translate(var(--sx), var(--sy)) rotate(var(--sr))";
          char.style.willChange = "transform, opacity";
        });
  
        let triggered = false;
  
        function reveal() {
          if (triggered && once) return;
          triggered = true;
  
          chars.forEach((char, i) => {
            char.style.transition =
              "opacity " +
              duration +
              "s cubic-bezier(0.16, 1, 0.3, 1) " +
              i * stagger +
              "s," +
              "transform " +
              duration +
              "s cubic-bezier(0.16, 1, 0.3, 1) " +
              i * stagger +
              "s";
            char.style.opacity = "1";
            char.style.transform = "translate(0, 0) rotate(0deg)";
          });
  
          if (once) observer.unobserve(el);
        }
  
        function hide() {
          if (once) return;
          chars.forEach((char) => {
            char.style.transition = "none";
            char.style.opacity = "0";
            char.style.transform =
              "translate(var(--sx), var(--sy)) rotate(var(--sr))";
          });
          triggered = false;
        }
  
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) reveal();
              else hide();
            });
          },
          { threshold: 0.1 },
        );
  
        observer.observe(el);
      }
  
      function init() {
        document.querySelectorAll("[" + ATTR + "]").forEach((el) => {
          if (!el.dataset.scatterInit) {
            el.dataset.scatterInit = "true";
            initElement(el);
          }
        });
      }
  
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
      } else {
        init();
      }
  
      window.RevealScatter = { init };
    }
  
    // Swipe cards deck (non-mobile challenges)
    function initSwipeCardsDeck() {
      const SWIPE_THRESHOLD = 90;
      const ROTATION_FACTOR = 0.08;
      const SCALE_STEP = 0.032;
      const Y_STEP = 9;
  
      const container = Array.from(
        document.querySelectorAll(".challenges_cards_wrap"),
      ).find(function (el) {
        return !el.closest(".challenges_wrap.is-mobile");
      });
  
      if (!container) return;
  
      function getCards() {
        return Array.from(container.querySelectorAll("[data-card-rot]"));
      }
      function stackTransform(pos, rot) {
        const scale = 1 - pos * SCALE_STEP;
        const ty = pos * Y_STEP;
        return (
          "rotate(" + rot + "deg) scale(" + scale + ") translateY(" + ty + "px)"
        );
      }
      function layoutCards(animate) {
        const cards = getCards();
        const total = cards.length;
        cards.forEach(function (card, domIdx) {
          const pos = total - 1 - domIdx;
          const rot = parseFloat(card.getAttribute("data-card-rot")) || 0;
          card.style.zIndex = domIdx + 1;
          card.style.pointerEvents = pos === 0 ? "auto" : "none";
          if (animate) {
            card.style.transition =
              "transform 0.32s cubic-bezier(0.34,1.4,0.64,1)";
            card.style.transform = stackTransform(pos, rot);
            setTimeout(function () {
              card.style.transition = "";
            }, 360);
          } else {
            card.style.transition = "";
            card.style.transform = stackTransform(pos, rot);
          }
        });
      }
      function bindSwipe(topCard) {
        const baseRot = parseFloat(topCard.getAttribute("data-card-rot")) || 0;
        let active = false,
          sx = 0,
          sy = 0,
          dx = 0,
          dy = 0;
        function onStart(cx, cy) {
          active = true;
          sx = cx;
          sy = cy;
          dx = 0;
          dy = 0;
          topCard.style.transition = "none";
        }
        function onMove(cx, cy) {
          if (!active) return;
          dx = cx - sx;
          dy = cy - sy;
          topCard.style.transform =
            "translate(" +
            dx +
            "px," +
            dy +
            "px) rotate(" +
            (baseRot + dx * ROTATION_FACTOR) +
            "deg)";
        }
        function onEnd() {
          if (!active) return;
          active = false;
          if (Math.abs(dx) >= SWIPE_THRESHOLD) {
            const dir = dx > 0 ? 1 : -1;
            topCard.style.transition = "transform 0.38s ease-out, opacity 0.38s";
            topCard.style.transform =
              "translate(" +
              dir * 700 +
              "px," +
              dy +
              "px) rotate(" +
              (baseRot + dir * 28) +
              "deg)";
            topCard.style.opacity = "0";
            topCard.style.pointerEvents = "none";
            setTimeout(function () {
              topCard.style.transition = "";
              topCard.style.opacity = "1";
              container.insertBefore(topCard, container.firstElementChild);
              layoutCards(true);
              const cards = getCards();
              bindSwipe(cards[cards.length - 1]);
            }, 380);
          } else {
            topCard.style.transition =
              "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)";
            topCard.style.transform = stackTransform(0, baseRot);
            setTimeout(function () {
              topCard.style.transition = "";
            }, 380);
          }
        }
        topCard.addEventListener("mousedown", function (e) {
          e.preventDefault();
          onStart(e.clientX, e.clientY);
        });
        document.addEventListener("mousemove", function (e) {
          if (active) onMove(e.clientX, e.clientY);
        });
        document.addEventListener("mouseup", function () {
          if (active) onEnd();
        });
        topCard.addEventListener(
          "touchstart",
          function (e) {
            e.preventDefault();
            const t = e.changedTouches[0];
            onStart(t.clientX, t.clientY);
          },
          { passive: false },
        );
        topCard.addEventListener(
          "touchmove",
          function (e) {
            e.preventDefault();
            if (!active) return;
            const t = e.changedTouches[0];
            onMove(t.clientX, t.clientY);
          },
          { passive: false },
        );
        topCard.addEventListener(
          "touchend",
          function () {
            if (active) onEnd();
          },
          { passive: false },
        );
      }
      layoutCards(false);
      const cards = getCards();
      if (cards.length) bindSwipe(cards[cards.length - 1]);
    }
  
    function ensureBaseVisibility() {
      const styleEl = document.getElementById("animjs-initial-visibility");
      if (styleEl) styleEl.remove();
      const nav = getNavElement();
      if (nav) nav.style.visibility = "visible";
      const stickyWrap = document.querySelector(".sticky_wrap");
      if (stickyWrap) stickyWrap.style.visibility = "visible";
    }
  
    // =========================================================
    // Nav Wrap (Overlay + Scatter Links + Hamburger)
    // =========================================================
    function initNavWrap() {
      if (typeof gsap === "undefined") return;
      document.querySelectorAll(".nav_wrap").forEach((component) => {
        if (component.dataset.scriptInitialized) return;
        component.dataset.scriptInitialized = "true";
        const toggle = component.querySelector(".nav_toggle_wrap");
        const overlay = component.querySelector(".nav_overlay_wrap");
        let backdrop = component.querySelector(".nav_backdrop");
        if (!backdrop && component.parentElement) {
          backdrop = component.parentElement.querySelector(".nav_backdrop");
        }
        if (!backdrop) backdrop = document.querySelector(".nav_backdrop");
        // fixed + transform-Vorfahren (nav_wrap / Webflow-GPU) = nur Zeilenhöhe.
        // An body hängen → echter Viewport für inset:0.
        if (backdrop && backdrop.parentElement !== document.body) {
          backdrop.dataset.navBackdropPortal = "true";
          document.body.appendChild(backdrop);
        }
        const lineTop = component.querySelector(".nav_toggle_line--top");
        const lineBot = component.querySelector(".nav_toggle_line--bot");
        const navBar = component.querySelector(".nav_bar");
        const primaryLinks = component.querySelectorAll(".nav_primary_link_wrap");
        const secondaryLinks = component.querySelectorAll(
          ".nav_social_link_wrap, .nav_legal_link_wrap",
        );
        if (!toggle || !overlay || !lineTop || !lineBot) return;
        let isOpen = false;
        let openTl = null;
  
        function splitToScatterChars(el) {
          const text = el.textContent.trim();
          el.setAttribute("aria-label", text);
          el.innerHTML = "";
          for (const char of text) {
            if (char === " ") {
              el.appendChild(document.createTextNode(" "));
              continue;
            }
            const span = document.createElement("span");
            span.classList.add("nav_scatter_char");
            span.setAttribute("aria-hidden", "true");
            span.textContent = char;
            el.appendChild(span);
          }
        }
  
        primaryLinks.forEach((link) => {
          const textEl = link.querySelector(".nav_primary_link_text");
          if (textEl) splitToScatterChars(textEl);
        });
  
        function getChars(link) {
          return Array.from(link.querySelectorAll(".nav_scatter_char"));
        }
  
        function buildOpenTimeline() {
          const tl = gsap.timeline({ paused: true });
          const overlayEase = "power4.inOut";
          if (backdrop) {
            gsap.killTweensOf(backdrop);
            tl.fromTo(
              backdrop,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.4, ease: "power2.out" },
              0,
            );
          }
          tl.fromTo(
            overlay,
            { clipPath: "inset(0 0 100% 0)" },
            { clipPath: "inset(0 0 0% 0)", duration: 0.75, ease: overlayEase },
            0,
          );
          tl.to(
            lineTop,
            { y: "0.45rem", rotation: 45, duration: 0.4, ease: "power3.inOut" },
            0.1,
          );
          tl.to(
            lineBot,
            { y: "-0.45rem", rotation: -45, duration: 0.4, ease: "power3.inOut" },
            0.1,
          );
          primaryLinks.forEach((link, linkIndex) => {
            const chars = getChars(link);
            const linkDelay = 0.35 + linkIndex * 0.07;
            const charDuration = 0.55;
            const charStagger = 0.025;
            chars.forEach((char) => {
              const angle = Math.random() * Math.PI * 2;
              const dist = 30 + Math.random() * 50;
              const rx = Math.cos(angle) * dist;
              const ry = Math.sin(angle) * dist;
              const rot = (Math.random() - 0.5) * 35;
              gsap.set(char, { x: rx, y: ry, rotation: rot, opacity: 0 });
            });
            tl.to(
              chars,
              {
                x: 0,
                y: 0,
                rotation: 0,
                opacity: 1,
                duration: charDuration,
                ease: "expo.out",
                stagger: charStagger,
              },
              linkDelay,
            );
          });
          tl.fromTo(
            secondaryLinks,
            { opacity: 0, y: "0.75rem" },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: "power3.out",
              stagger: 0.04,
            },
            0.5,
          );
          return tl;
        }
  
        function openNav() {
          isOpen = true;
          overlay.classList.add("is-active");
          overlay.setAttribute("aria-hidden", "false");
          toggle.setAttribute("aria-expanded", "true");
          toggle.setAttribute("aria-label", "Close navigation");
          component.style.mixBlendMode = "normal";
          if (navBar) navBar.style.color = "var(--swatch--light-100)";
          primaryLinks.forEach((l) => l.setAttribute("tabindex", "0"));
          secondaryLinks.forEach((l) => l.setAttribute("tabindex", "0"));
          if (openTl) openTl.kill();
          openTl = buildOpenTimeline();
          openTl.play();
          document.body.style.overflow = "hidden";
        }
  
        function closeNav() {
          isOpen = false;
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "Open navigation");
          primaryLinks.forEach((l) => l.setAttribute("tabindex", "-1"));
          secondaryLinks.forEach((l) => l.setAttribute("tabindex", "-1"));
          if (openTl) {
            openTl.reverse();
            openTl.eventCallback("onReverseComplete", () => {
              overlay.classList.remove("is-active");
              overlay.setAttribute("aria-hidden", "true");
              component.style.mixBlendMode = "";
              if (navBar) navBar.style.color = "";
              if (backdrop) gsap.set(backdrop, { clearProps: "opacity,visibility" });
            });
          } else {
            if (backdrop) {
              gsap.killTweensOf(backdrop);
              gsap.to(backdrop, {
                autoAlpha: 0,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => gsap.set(backdrop, { clearProps: "opacity,visibility" }),
              });
            }
            overlay.classList.remove("is-active");
            overlay.setAttribute("aria-hidden", "true");
            component.style.mixBlendMode = "";
            if (navBar) navBar.style.color = "";
          }
          document.body.style.overflow = "";
        }
  
        toggle.addEventListener("click", () => {
          if (isOpen) closeNav();
          else openNav();
        });
  
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && isOpen) {
            closeNav();
            toggle.focus();
          }
        });
  
        overlay.addEventListener("keydown", (e) => {
          if (e.key !== "Tab" || !isOpen) return;
          const focusable = Array.from(
            overlay.querySelectorAll("a[tabindex='0'], button[tabindex='0']"),
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        });

        // Schließen bei Klick auf einen Link im Overlay (Delegation auf <a>, nicht nur auf Wrapper)
        overlay.addEventListener("click", (e) => {
          const a = e.target.closest("a[href]");
          if (!a || !overlay.contains(a)) return;
          if (isOpen) closeNav();
        });

        // Schließen bei Klick außerhalb von Overlay (Toggle ausgenommen – dort öffnet/schließt der Toggle selbst)
        function onDocumentClickCloseNav(e) {
          if (!isOpen) return;
          if (overlay.contains(e.target)) return;
          if (toggle.contains(e.target)) return;
          closeNav();
        }
        document.addEventListener("click", onDocumentClickCloseNav);
      });
    }
  
    // =========================================================
    // 05) INITIALISIERUNG
    // =========================================================
    let __animFinalInitialized = false;
  
    function initAllAnimations() {
      initLocaleSwitcher();
      if (!document.body || !document.body.hasAttribute("data-home")) {
        ensureBaseVisibility();
      }
      if (typeof gsap === "undefined") {
        window.addEventListener("load", initAllAnimations, { once: true });
        return;
      }
      if (__animFinalInitialized) return;
      __animFinalInitialized = true;
      initLenis();
      initNavWrap();
      initContentRevealScroll();
      initArrowPathAnimation();
      initEyebrowMarkerAnimation();
      initChallengesAnimation();
      initChallengesMobileStack();
      initChallengesIllustrationAnimation();
      initNavHideOnFooter();
      initFooterParallax();
      initPartnersTitle();
      initTestimonials();
      initScatterLoader();
      initWaage();
      initLocaleSwitcher();
      initRevealScatter();
      initSwipeCardsDeck();
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initAllAnimations);
    } else {
      initAllAnimations();
    }
  
    // Sicherstellen, dass spaet geladene Elemente init haben
    window.addEventListener(
      "load",
      () => {
        if (typeof gsap === "undefined") return;
        initWaage();
        initRevealScatter();
      },
      { once: true },
    );
  })();