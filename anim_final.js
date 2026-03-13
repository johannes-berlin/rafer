// GSAP Animationen fuer Webflow Integration (Final)
// Zusammengefuehrt aus anim.js und bereitgestellten Scripts
//
// =========================================================
// 01) BASIS & DEPENDENCIES
// =========================================================
(function () {
  'use strict';

  // FOUC vermeiden: wichtige Elemente initial ausblenden
  if (!document.getElementById('animjs-initial-visibility')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'animjs-initial-visibility';
    styleEl.textContent = '.nav,.sticky_wrap{visibility:hidden;}';
    document.head.appendChild(styleEl);
  }

  // Register plugins if available
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  } else {
    if (typeof gsap === 'undefined') {
      console.error('[GSAP] gsap nicht gefunden. Stelle sicher, dass GSAP vor diesem Script geladen wird.');
    } else if (typeof ScrollTrigger === 'undefined') {
      console.error('[GSAP] ScrollTrigger nicht gefunden. Stelle sicher, dass das Plugin geladen wird.');
    }
  }

  if (typeof gsap !== 'undefined' && typeof Draggable !== 'undefined') {
    gsap.registerPlugin(Draggable);
  }

  // =========================================================
  // 02) SMOOTH SCROLL (LENIS)
  // =========================================================
  let __lenisInstance = null;
  let __lenisRafId = null;
  let __lenisGsapTicker = null;
  let __lenisAnchorBound = false;

  function initLenis() {
    if (typeof Lenis === 'undefined') {
      console.warn('[Lenis] Lenis nicht gefunden. Bitte Lenis vor diesem Script laden.');
      return;
    }
    if (__lenisInstance) return;

    __lenisInstance = new Lenis({ autoRaf: true });

    if (typeof ScrollTrigger !== 'undefined' && __lenisInstance && typeof __lenisInstance.on === 'function') {
      __lenisInstance.on('scroll', ScrollTrigger.update);
    }

    const jq = window.jQuery || window.$;
    if (jq && typeof jq === 'function') {
      jq('[data-lenis-start]').on('click', function () {
        __lenisInstance.start();
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });
      jq('[data-lenis-stop]').on('click', function () {
        __lenisInstance.stop();
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });
      jq('[data-lenis-toggle]').on('click', function () {
        jq(this).toggleClass('stop-scroll');
        if (jq(this).hasClass('stop-scroll')) {
          __lenisInstance.stop();
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        } else {
          __lenisInstance.start();
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        }
      });
    }
  }

  // =========================================================
  // 03) SPLITTEXT FALLBACK
  // =========================================================
  if (typeof SplitText === 'undefined') {
    function createSplitText(el) {
      const original = el.textContent;
      el.textContent = '';
      const words = [];
      const chars = [];
      const frag = document.createDocumentFragment();

      original.split(/(\s+)/).forEach(token => {
        if (token.trim() === '') {
          frag.appendChild(document.createTextNode(token));
          return;
        }
        const wSpan = document.createElement('span');
        wSpan.className = 'word';
        [...token].forEach(c => {
          const cSpan = document.createElement('span');
          cSpan.className = 'char';
          cSpan.textContent = c;
          wSpan.appendChild(cSpan);
          chars.push(cSpan);
        });
        words.push(wSpan);
        frag.appendChild(wSpan);
        frag.appendChild(document.createTextNode(' '));
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
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      document.querySelectorAll('[data-reveal-group]').forEach(groupEl => {
        const groupStaggerSec = (parseFloat(groupEl.getAttribute('data-stagger')) || 100) / 1000;
        const groupDistance = groupEl.getAttribute('data-distance') || '2em';
        const triggerStart = groupEl.getAttribute('data-start') || 'top 80%';

        const animDuration = 0.8;
        const animEase = 'power4.inOut';

        if (prefersReduced) {
          gsap.set(groupEl, { clearProps: 'all', y: 0, autoAlpha: 1 });
          return;
        }

        const directChildren = Array.from(groupEl.children).filter(el => el.nodeType === 1);
        if (!directChildren.length) {
          gsap.set(groupEl, { y: groupDistance, autoAlpha: 0 });
          ScrollTrigger.create({
            trigger: groupEl,
            start: triggerStart,
            once: true,
            onEnter: () => gsap.to(groupEl, {
              y: 0,
              autoAlpha: 1,
              duration: animDuration,
              ease: animEase,
              onComplete: () => gsap.set(groupEl, { clearProps: 'all' })
            })
          });
          return;
        }

        const slots = [];
        directChildren.forEach(child => {
          const nestedGroup = child.matches('[data-reveal-group-nested]')
            ? child
            : child.querySelector(':scope [data-reveal-group-nested]');

          if (nestedGroup) {
            const includeParent = child.getAttribute('data-ignore') === 'false' ||
              nestedGroup.getAttribute('data-ignore') === 'false';
            slots.push({ type: 'nested', parentEl: child, nestedEl: nestedGroup, includeParent });
          } else {
            slots.push({ type: 'item', el: child });
          }
        });

        slots.forEach(slot => {
          if (slot.type === 'item') {
            const isNestedSelf = slot.el.matches('[data-reveal-group-nested]');
            const d = isNestedSelf ? groupDistance : (slot.el.getAttribute('data-distance') || groupDistance);
            gsap.set(slot.el, { y: d, autoAlpha: 0 });
          } else {
            if (slot.includeParent) gsap.set(slot.parentEl, { y: groupDistance, autoAlpha: 0 });
            const nestedD = slot.nestedEl.getAttribute('data-distance') || groupDistance;
            Array.from(slot.nestedEl.children).forEach(target => gsap.set(target, { y: nestedD, autoAlpha: 0 }));
          }
        });

        slots.forEach(slot => {
          if (slot.type === 'nested' && slot.includeParent) {
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

              if (slot.type === 'item') {
                tl.to(slot.el, {
                  y: 0,
                  autoAlpha: 1,
                  duration: animDuration,
                  ease: animEase,
                  onComplete: () => gsap.set(slot.el, { clearProps: 'all' })
                }, slotTime);
              } else {
                if (slot.includeParent) {
                  tl.to(slot.parentEl, {
                    y: 0,
                    autoAlpha: 1,
                    duration: animDuration,
                    ease: animEase,
                    onComplete: () => gsap.set(slot.parentEl, { clearProps: 'all' })
                  }, slotTime);
                }
                const nestedMs = parseFloat(slot.nestedEl.getAttribute('data-stagger'));
                const nestedStaggerSec = isNaN(nestedMs) ? groupStaggerSec : nestedMs / 1000;
                Array.from(slot.nestedEl.children).forEach((nestedChild, nestedIndex) => {
                  tl.to(nestedChild, {
                    y: 0,
                    autoAlpha: 1,
                    duration: animDuration,
                    ease: animEase,
                    onComplete: () => gsap.set(nestedChild, { clearProps: 'all' })
                  }, slotTime + nestedIndex * nestedStaggerSec);
                });
              }
            });
          }
        });
      });
    });

    return () => ctx.revert();
  }

  // Global Path Animation (data-anim-arrow)
  function initArrowPathAnimation() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    document.querySelectorAll('[data-anim-arrow]').forEach((path) => {
      if (typeof path.getTotalLength !== 'function') return;

      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        duration: 3,
        scrollTrigger: {
          trigger: path.closest('svg') || path,
          start: 'top 80%',
          end: 'bottom 30%',
          scrub: false
        }
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
      DARK_OVERLAY_OPACITY: 0.5
    };

    if (typeof gsap === 'undefined') {
      console.error('[footer-anim] GSAP (gsap.min.js) ist nicht geladen.');
      return;
    }
    if (typeof ScrollTrigger === 'undefined') {
      console.error('[footer-anim] ScrollTrigger (ScrollTrigger.min.js) ist nicht geladen.');
      return;
    }

    const sections = document.querySelectorAll('[data-footer-parallax]');
    if (!sections.length) {
      console.warn('[footer-anim] Keine Elemente mit [data-footer-parallax] gefunden.');
      return;
    }

    function setupFooterScatter(textElement) {
      const split = (typeof SplitText !== 'undefined')
        ? new SplitText(textElement, {
          type: 'chars,words',
          charsClass: 'char',
          wordsClass: 'word'
        })
        : createSplitText(textElement);

      gsap.set(split.chars, {
        position: 'relative',
        display: 'inline-block'
      });

      if (split.words) {
        gsap.set(split.words, {
          display: 'inline-block',
          whiteSpace: 'nowrap'
        });
      }

      function scatterNow() {
        split.chars.forEach((char) => {
          if (!char || char.textContent.trim() === '') return;

          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * FOOTER_CONFIG.SCATTER_DISTANCE;
          const offsetX = Math.cos(angle) * distance;
          const offsetY = Math.sin(angle) * distance * FOOTER_CONFIG.SCATTER_DISTANCE_Y_FACTOR;
          const randomX = (Math.random() - 0.5) * FOOTER_CONFIG.RANDOM_OFFSET;
          const randomY = (Math.random() - 0.5) * FOOTER_CONFIG.RANDOM_OFFSET_Y;
          const finalX = offsetX + randomX;
          const finalY = offsetY + randomY;
          const rotation = (Math.random() - 0.5) * FOOTER_CONFIG.ROTATION_RANGE;
          const scale = gsap.utils.random(FOOTER_CONFIG.SCALE_MIN, FOOTER_CONFIG.SCALE_MAX);

          gsap.set(char, {
            x: finalX,
            y: finalY,
            rotation: rotation,
            scale: scale,
            force3D: true
          });
        });
      }

      scatterNow();

      return { split, scatterNow };
    }

    sections.forEach(el => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
          markers: FOOTER_CONFIG.DEBUG_MARKERS,
          invalidateOnRefresh: true
        }
      });

      const inner = el.querySelector('[data-footer-parallax-inner]');
      const dark = el.querySelector('[data-footer-parallax-dark]');
      const textTargets = el.querySelectorAll('[data-anim="footer"]');

      let maxTextTotal = 0;

      textTargets.forEach((textEl) => {
        const { split, scatterNow } = setupFooterScatter(textEl);

        const chars = split.chars.filter(c => c && c.textContent.trim() !== '');
        const textTotal = chars.length > 0
          ? FOOTER_CONFIG.CHAR_DURATION + FOOTER_CONFIG.CHAR_STAGGER * (chars.length - 1)
          : 0;

        maxTextTotal = Math.max(maxTextTotal, textTotal);

        tl.to(chars, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: FOOTER_CONFIG.CHAR_DURATION,
          stagger: {
            each: FOOTER_CONFIG.CHAR_STAGGER,
            from: 'start'
          }
        }, 0);

        const onResize = () => {
          const st = tl.scrollTrigger;
          const progress = st && st.progress != null ? st.progress : 0;
          if (progress < 0.05 || progress > 0.95) {
            scatterNow();
            ScrollTrigger.refresh();
          }
        };
        window.addEventListener('resize', onResize, { passive: true });
      });

      if (maxTextTotal === 0) maxTextTotal = 1;

      if (inner) {
        tl.from(inner, {
          yPercent: FOOTER_CONFIG.PARALLAX_Y_PERCENT,
          duration: maxTextTotal,
          force3D: true
        }, 0);
      } else {
        console.warn('[footer-anim] Kein [data-footer-parallax-inner] in:', el);
      }

      if (dark) {
        tl.from(dark, {
          opacity: FOOTER_CONFIG.DARK_OVERLAY_OPACITY,
          duration: maxTextTotal
        }, 0);
      }
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    } else {
      setTimeout(() => ScrollTrigger.refresh(), 0);
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
      DEBUG_MARKERS: false
    };

    if (typeof gsap === 'undefined') {
      console.error('[partners-anim] GSAP (gsap.min.js) ist nicht geladen.');
      return;
    }
    if (typeof ScrollTrigger === 'undefined') {
      console.error('[partners-anim] ScrollTrigger (ScrollTrigger.min.js) ist nicht geladen.');
      return;
    }

    const titleSpan = document.querySelector('.partners_title-span');
    const clip = document.querySelector('.partners_title-svg-clip');

    if (!titleSpan || !clip) {
      console.warn('[partners-anim] .partners_title-span oder .partners_title-svg-clip nicht gefunden.');
      return;
    }

    gsap.set(titleSpan, { autoAlpha: 0 });

    const split = (typeof SplitText !== 'undefined')
      ? new SplitText(titleSpan, { type: 'chars' })
      : createSplitText(titleSpan);

    const tl = gsap.timeline({
      paused: true,
      scrollTrigger: {
        trigger: titleSpan,
        start: 'top 60%',
        end: 'top 60%',
        markers: PARTNERS_CONFIG.DEBUG_MARKERS,
        once: true,
        onEnter: () => tl.play()
      }
    });

    tl.set(clip, {
      clipPath: 'inset(0 100% 0 0)',
      webkitClipPath: 'inset(0 100% 0 0)'
    })
      .to(clip, {
        clipPath: 'inset(0 0% 0 0)',
        webkitClipPath: 'inset(0 0% 0 0)',
        duration: PARTNERS_CONFIG.SVG_DURATION,
        ease: 'power4.inOut'
      })
      .set(titleSpan, {
        autoAlpha: 1
      }, `-=${PARTNERS_CONFIG.TEXT_OFFSET}`)
      .from(split.chars, {
        opacity: 0,
        y: PARTNERS_CONFIG.TEXT_Y_OFFSET,
        duration: PARTNERS_CONFIG.TEXT_DURATION,
        stagger: PARTNERS_CONFIG.TEXT_STAGGER,
        ease: 'back.out(1.7)'
      }, `-=${PARTNERS_CONFIG.TEXT_OFFSET}`);
  }

  // Challenges Card Animation (Desktop hover)
  function initChallengesAnimation() {
    const container = document.querySelector('.challenges_wrap .challenges_cards_wrap');
    if (!container) return;

    if (window.innerWidth < 992) {
      console.log('Challenges Card Animation: Screen zu klein (< 992px)');
      return;
    }

    const containerW = container.clientWidth;
    const cards = document.querySelectorAll('.challenge_card');
    const cardsLength = cards.length;
    const cardContent = document.querySelectorAll('.challenge_card .challenge_card_inner');

    let currentPortion = 0;

    cards.forEach(card => {
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
        if (currentPortion !== 0) { resetPortion(currentPortion - 1); }
        currentPortion = activePortion;
        newPortion(currentPortion - 1);
      }
    }

    function handleMouseLeave() {
      resetPortion(currentPortion - 1);
      currentPortion = 0;

      gsap.to(cardContent, {
        xPercent: 0,
        ease: 'elastic.out(1, 0.75)',
        duration: 0.8
      });
    }

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    function resetPortion(index) {
      gsap.to(cards[index], {
        xPercent: (Math.random() - 0.5) * 10,
        yPercent: (Math.random() - 0.5) * 10,
        rotation: (Math.random() - 0.5) * 20,
        scale: 1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.75)',
      });
    }

    function newPortion(i) {
      gsap.to(cards[i], {
        xPercent: 0,
        yPercent: 0,
        rotation: 0,
        duration: 0.8,
        scale: 1.1,
        ease: 'elastic.out(1, 0.75)'
      });

      cardContent.forEach((content, index) => {
        if (index !== i) {
          gsap.to(content, {
            xPercent: 80 / (index - i),
            ease: 'elastic.out(1, 0.75)',
            duration: 0.8
          });
        } else {
          gsap.to(content, {
            xPercent: 0,
            ease: 'elastic.out(1, 0.75)',
            duration: 0.8
          });
        }
      });
    }
  }

  // Challenges Illustration Parallax (paths)
  function initChallengesIllustrationAnimation() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    document.querySelectorAll('.challenges_illu').forEach((component) => {
      if (component.dataset.scriptInitialized) return;
      component.dataset.scriptInitialized = 'true';
      const pathOne = component.querySelector('.c_path_one');
      const pathTwo = component.querySelector('.c_path_two');
      const pathThree = component.querySelector('.c_path_three');

      gsap.set([pathOne, pathTwo, pathThree], {
        transformOrigin: 'center center'
      });

      gsap.timeline({
        scrollTrigger: {
          trigger: component,
          start: 'top 85%',
          end: 'bottom 10%',
          scrub: 0.8,
          markers: false
        }
      })
        .to(pathOne, {
          y: 120,
          x: 150,
          rotate: 25,
          scale: 1.4,
          ease: 'none'
        }, 0)
        .to(pathTwo, {
          y: -100,
          x: -180,
          rotate: -30,
          scale: 0.6,
          ease: 'none'
        }, 0)
        .to(pathThree, {
          y: 160,
          x: -120,
          rotate: 40,
          scale: 1.6,
          ease: 'none'
        }, 0);
    });
  }

  // Nav ausblenden, wenn Footer in View kommt
  function initNavHideOnFooter() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const nav = document.querySelector('.nav');
    const footer = document.querySelector('.footer_wrap');
    if (!nav || !footer) return;

    ScrollTrigger.create({
      trigger: footer,
      start: 'top 10%',
      onEnter: () => {
        gsap.to(nav, {
          yPercent: -100,
          autoAlpha: 0,
          duration: 0.5,
          ease: 'power2.out'
        });
      },
      onLeaveBack: () => {
        gsap.to(nav, {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.5,
          ease: 'power2.out'
        });
      }
    });
  }

  // Challenges mobile pin stack (is-mobile)
  function initChallengesMobileStack() {
    const root = document.querySelector('.challenges_wrap.is-mobile');
    if (!root) return;

    const pinHeight = root.querySelector('.pin-height');
    const container = root.querySelector('.container');
    if (!pinHeight || !container) return;

    ScrollTrigger.create({
      trigger: pinHeight,
      start: 'top top',
      end: 'bottom bottom',
      pin: container,
    });

    const gap = 30;
    const medias = root.querySelectorAll('.media');
    const distPerMedia = (pinHeight.clientHeight - window.innerHeight) / medias.length;

    gsap.set(medias, {
      y: gap * (medias.length - 1),
      z: -gap * (medias.length - 1)
    });

    medias.forEach((media, index) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinHeight,
          start: 'top top+=' + (distPerMedia * index),
          end: 'bottom bottom+=' + (distPerMedia * index),
          scrub: 0.5
        }
      });

      for (let i = 0; i < medias.length - 1; i++) {
        tl.to(media, {
          y: '-=' + gap,
          z: '+=' + gap,
          ease: 'back.inOut(3)'
        });
      }

      tl.to(media, {
        yPercent: -80,
        y: '-50vh',
        scale: 1.2,
        rotation: (Math.random() - 0.5) * 50,
        ease: 'power4.in'
      });
    });
  }

  // Testimonials reveal
  function initTestimonials() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const testimonialItems = gsap.utils.toArray('.testimonial_cms_item');
    testimonialItems.forEach((item) => {
      const img = item.querySelector('.team_card_visual img:not(.team_card_texture)');

      if (img) {
        gsap.set(img, { clipPath: 'circle(0% at 50% 50%)' });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top 90%',
          once: true,
        },
      });

      tl.from(item, {
        opacity: 0,
        scale: 0.92,
        duration: 0.7,
        ease: 'power2.out',
      });

      if (img) {
        tl.to(img, {
          clipPath: 'circle(75% at 50% 50%)',
          duration: 0.6,
          ease: 'power3.out',
        }, '-=0.4');
      }
    });
  }

  // Scatter loader for hero headline
  let scatterInstances = [];

  function initScatterLoader() {
    if (typeof gsap === 'undefined') return;

    gsap.set('.nav', { autoAlpha: 0, y: -100 });
    gsap.set('.sticky_cta', { autoAlpha: 0, y: 20 });

    window.addEventListener('load', () => {
      window.scrollTo(0, 0);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          document.querySelectorAll('[data-scatter]').forEach(el => {
            const instance = createScatter(el);
            scatterInstances.push(instance);
          });
        });
      } else {
        document.querySelectorAll('[data-scatter]').forEach(el => {
          const instance = createScatter(el);
          scatterInstances.push(instance);
        });
      }
    });

    window.addEventListener(
      'resize',
      gsap.utils.debounce(() => {
        scatterInstances.forEach(i => i.rebuild());
      }, 300)
    );
  }

  function createScatter(headline) {
    headline.style.visibility = 'hidden';

    const sticky = headline.closest('.hero-sticky');
    if (!sticky) return { rebuild() {} };
    const stage = sticky.querySelector('.scatter-stage');
    if (!stage) return { rebuild() {} };
    let letters = [];

    function measureLayout() {
      const stickyRect = sticky.getBoundingClientRect();
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
            cx: Math.round(rect.left - stickyRect.left + rect.width / 2),
            cy: Math.round(rect.top - stickyRect.top + rect.height / 2),
          });
        }
      }
      return targets;
    }

    function build() {
      const targets = measureLayout();
      const vw = sticky.offsetWidth;
      const vh = sticky.offsetHeight;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

      const maxW = Math.min(55 * rem, vw);
      const boundsLeft = (vw - maxW) / 2;
      const boundsTop = vh * 0.25;
      const boundsH = vh * 0.6;

      const typo = getComputedStyle(headline);

      targets
        .filter(t => !t.space)
        .forEach(t => {
          const randX = boundsLeft + Math.random() * maxW;
          const randY = boundsTop + Math.random() * boundsH;

          const span = document.createElement('span');
          span.className = 'scatter-letter';
          span.textContent = t.char;

          span.dataset.cx = t.cx;
          span.dataset.cy = t.cy;

          span.style.font = typo.font;
          span.style.color = typo.color;
          span.style.letterSpacing = typo.letterSpacing;
          span.style.textTransform = typo.textTransform;
          span.style.lineHeight = '1';

          gsap.set(span, {
            position: 'absolute',
            left: 0,
            top: 0,
            xPercent: -50,
            yPercent: -50,
            x: randX,
            y: randY,
            rotation: (Math.random() - 0.5) * 300,
            scale: 0.5 + Math.random() * 0.6,
            autoAlpha: 0,
            force3D: true,
          });

          stage.appendChild(span);
          letters.push(span);
        });

      runLoader();
    }

    function runLoader() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let maxEnd = 0;

      letters.forEach(el => {
        const toX = gsap.getProperty(el, 'x');
        const toY = gsap.getProperty(el, 'y');
        const toR = gsap.getProperty(el, 'rotation');
        const toS = gsap.getProperty(el, 'scale');

        const angle = Math.random() * Math.PI * 2;
        const dist = Math.max(vw, vh) * 1.3;
        const fromX = Math.cos(angle) * dist;
        const fromY = Math.sin(angle) * dist;
        const fromR = (Math.random() - 0.5) * 720;
        const fromS = 0.2 + Math.random() * 0.4;
        const delay = Math.random() * 0.5;
        const dur = 0.7 + Math.random() * 0.5;

        gsap.fromTo(
          el,
          { autoAlpha: 0, x: fromX, y: fromY, rotation: fromR, scale: fromS },
          { autoAlpha: 1, x: toX, y: toY, rotation: toR, scale: toS, duration: dur, ease: 'power3.out', delay, force3D: true }
        );

        maxEnd = Math.max(maxEnd, delay + dur);
      });

      gsap.delayedCall(maxEnd, () => {
        gsap.set('.sticky_pattern', { autoAlpha: 1 });
        gsap.to('.nav', { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' });
        createScrollAnimation();
      });
    }

    function createScrollAnimation() {
      const scrollEl =
        headline.closest('[data-scatter-scroll]') || headline.closest('.hero-scroll');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollEl,
          start: 'top top',
          end: '+=300%',
          scrub: 1.2,
        },
      });

      letters.forEach((el, i) => {
        tl.to(
          el,
          {
            x: parseFloat(el.dataset.cx),
            y: parseFloat(el.dataset.cy),
            rotation: 0,
            scale: 1,
            ease: 'power3.out',
            duration: 0.55,
            force3D: true,
          },
          (i / letters.length) * 0.55
        );
      });

      tl.to(
        '.sticky_cta',
        { autoAlpha: 1, y: 0, duration: 0.1, ease: 'power2.out' },
        0.8
      );

      tl.to({}, { duration: 1 }, 1);
    }

    function rebuild() {
      ScrollTrigger.getAll().forEach(st => st.kill());
      stage.innerHTML = '';
      letters = [];
      headline.style.visibility = 'hidden';
      build();
    }

    build();
    return { rebuild };
  }

  // Reveal clip rect (simple)
  function initRevealClip() {
    if (typeof gsap === 'undefined') return;
    const rect = document.querySelector('#reveal-clip rect');
    if (!rect) return;
    gsap.to(rect, {
      attr: { height: 571 },
      duration: 2,
      ease: 'power2.inOut'
    });
  }

  // Waage animation
  function initWaage() {
    const scene = document.querySelector('.waage-scene');
    const inner = document.querySelector('.waage-scene-inner');
    if (!scene || !inner || typeof gsap === 'undefined') return;

    function scaleWaage() {
      const scale = scene.offsetWidth / 750;
      inner.style.transform = 'scale(' + scale + ')';
    }
    scaleWaage();
    window.addEventListener('resize', scaleWaage);

    gsap.fromTo('.waage-beam-group',
      { rotation: -8 },
      {
        rotation: 8,
        duration: 2,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1,
        transformOrigin: '366px 0px'
      }
    );

    gsap.fromTo('.waage-person-left',
      { rotation: 5 },
      {
        rotation: -5,
        duration: 2,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.25,
        transformOrigin: '50% 0%'
      }
    );

    gsap.fromTo('.waage-person-right',
      { rotation: 5 },
      {
        rotation: -5,
        duration: 2,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.25,
        transformOrigin: '50% 0%'
      }
    );
  }

  // Locale switcher
  function initLocaleSwitcher() {
    function sketchFlag(paths) {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 24" width="28" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="display:block">' + paths + '</svg>';
    }

    const FLAGS = {
      en: sketchFlag('<rect x="1" y="1" width="30" height="22" rx="2" stroke-width="1.6"/><line x1="16" y1="1" x2="16" y2="23" stroke-width="2.2"/><line x1="1" y1="12" x2="31" y2="12" stroke-width="2.2"/><line x1="1" y1="1" x2="31" y2="23" stroke-width="1.2"/><line x1="31" y1="1" x2="1" y2="23" stroke-width="1.2"/>'),
      de: sketchFlag('<rect x="1" y="1" width="30" height="22" rx="2" stroke-width="1.6"/><path d="M1 8.5 Q8 8 16 8.5 T31 8.5" stroke-width="1.3"/><path d="M1 15.5 Q10 15 16 15.5 T31 15.5" stroke-width="1.3"/><line x1="3" y1="4.5" x2="12" y2="4.5" stroke-width="3" opacity="0.7"/><line x1="14" y1="5" x2="28" y2="4.5" stroke-width="3" opacity="0.7"/>'),
      pt: sketchFlag('<rect x="1" y="1" width="30" height="22" rx="2" stroke-width="1.6"/><path d="M12 1.5 Q12.5 8, 12 12 T12 22.5" stroke-width="1.3"/><circle cx="12" cy="12" r="3.5" stroke-width="1.4"/><circle cx="12" cy="12" r="1.5" stroke-width="1"/>')
    };

    const LOCALES = [
      { code: 'en', href: '/', flag: FLAGS.en, label: 'EN', fullName: 'English' },
      { code: 'de', href: '/de', flag: FLAGS.de, label: 'DE', fullName: 'Deutsch' },
      { code: 'pt', href: '/pt', flag: FLAGS.pt, label: 'PT', fullName: 'Portugues' }
    ];

    function getCurrentLocale() {
      const path = window.location.pathname;
      const htmlLang = document.documentElement.lang;
      for (let i = 0; i < LOCALES.length; i++) {
        const locPath = new URL(LOCALES[i].href, window.location.origin).pathname;
        if (path === locPath || path.startsWith(locPath + '/')) return LOCALES[i];
      }
      if (htmlLang) {
        const code = htmlLang.split('-')[0].toLowerCase();
        const match = LOCALES.find(l => l.code === code);
        if (match) return match;
      }
      return LOCALES[0];
    }

    function scatterText(text) {
      return text.split('').map(function (c, i) {
        const tx = (Math.random() - 0.5) * 8;
        const ty = (Math.random() - 0.5) * 6;
        const tr = (Math.random() - 0.5) * 12;
        return '<span class="text-char" style="--tx:' + tx + 'px;--ty:' + ty + 'px;--tr:' + tr + 'deg;animation-delay:' + (i * 0.03) + 's">' + (c === ' ' ? '&nbsp;' : c) + '</span>';
      }).join('');
    }

    function init() {
      const current = getCurrentLocale();
      document.querySelectorAll('.locale-switcher').forEach(function (switcher) {
        const dropdown = switcher.querySelector('.locale-dropdown');
        const trigger = switcher.querySelector('.locale-trigger');
        if (!dropdown || !trigger) return;

        trigger.querySelector('.current-flag').innerHTML = current.flag;
        trigger.querySelector('.current-label').textContent = current.label;

        dropdown.innerHTML = '';
        LOCALES.forEach(function (loc) {
          if (loc.code === current.code) return;
          const btn = document.createElement('button');
          btn.className = 'locale-option';
          btn.setAttribute('role', 'option');
          btn.innerHTML = '<span class="flag">' + loc.flag + '</span>' +
            '<span class="name">' + scatterText(loc.fullName) + '</span>';

          btn.addEventListener('click', function () {
            window.location.href = loc.href;
          });
          dropdown.appendChild(btn);
        });

        trigger.addEventListener('click', function (e) {
          e.stopPropagation();
          const isOpen = switcher.classList.contains('open');
          document.querySelectorAll('.locale-switcher.open').forEach(function (s) {
            s.classList.remove('open');
            s.querySelector('.locale-trigger').setAttribute('aria-expanded', 'false');
          });
          if (!isOpen) {
            switcher.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
          }
        });
      });

      document.addEventListener('click', function () {
        document.querySelectorAll('.locale-switcher.open').forEach(function (s) {
          s.classList.remove('open');
          s.querySelector('.locale-trigger').setAttribute('aria-expanded', 'false');
        });
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          document.querySelectorAll('.locale-switcher.open').forEach(function (s) {
            s.classList.remove('open');
            s.querySelector('.locale-trigger').setAttribute('aria-expanded', 'false');
          });
        }
      });

      document.querySelectorAll('.locale-dropdown').forEach(function (dd) {
        dd.addEventListener('click', function (e) { e.stopPropagation(); });
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // Reveal Scatter (data-reveal-scatter)
  function initRevealScatter() {
    const ATTR = 'data-reveal-scatter';

    function splitChars(el) {
      function makeChar(char) {
        const span = document.createElement('span');
        span.classList.add('scatter-char');
        span.setAttribute('aria-hidden', 'true');
        span.textContent = char;

        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 60;
        span.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
        span.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
        span.style.setProperty('--sr', ((Math.random() - 0.5) * 40) + 'deg');
        return span;
      }

      function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          const frag = document.createDocumentFragment();
          const parts = text.split(/(\s+)/);
          parts.forEach(part => {
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
            } else {
              const word = document.createElement('span');
              word.classList.add('scatter-word');
              word.style.display = 'inline-block';
              word.style.whiteSpace = 'nowrap';

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
          node.childNodes.forEach(child => clone.appendChild(processNode(child)));
          return clone;
        }

        return node.cloneNode(true);
      }

      const label = el.textContent;
      el.setAttribute('aria-label', label);

      const frag = document.createDocumentFragment();
      el.childNodes.forEach(child => frag.appendChild(processNode(child)));
      el.innerHTML = '';
      el.appendChild(frag);
    }

    function initElement(el) {
      const duration = parseFloat(el.getAttribute('data-reveal-scatter-duration') || 0.6);
      const stagger = parseFloat(el.getAttribute('data-reveal-scatter-stagger') || 0.04);
      const once = el.getAttribute('data-reveal-scatter-once') !== 'false';

      splitChars(el);

      const chars = el.querySelectorAll('.scatter-char');
      chars.forEach((char) => {
        char.style.display = 'inline-block';
        char.style.opacity = '0';
        char.style.transform = 'translate(var(--sx), var(--sy)) rotate(var(--sr))';
        char.style.willChange = 'transform, opacity';
      });

      let triggered = false;

      function reveal() {
        if (triggered && once) return;
        triggered = true;

        chars.forEach((char, i) => {
          char.style.transition =
            'opacity ' + duration + 's cubic-bezier(0.16, 1, 0.3, 1) ' + (i * stagger) + 's,' +
            'transform ' + duration + 's cubic-bezier(0.16, 1, 0.3, 1) ' + (i * stagger) + 's';
          char.style.opacity = '1';
          char.style.transform = 'translate(0, 0) rotate(0deg)';
        });

        if (once) observer.unobserve(el);
      }

      function hide() {
        if (once) return;
        chars.forEach(char => {
          char.style.transition = 'none';
          char.style.opacity = '0';
          char.style.transform = 'translate(var(--sx), var(--sy)) rotate(var(--sr))';
        });
        triggered = false;
      }

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) reveal();
            else hide();
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(el);
    }

    function init() {
      document.querySelectorAll('[' + ATTR + ']').forEach(el => {
        if (!el.dataset.scatterInit) {
          el.dataset.scatterInit = 'true';
          initElement(el);
        }
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
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

    const container = Array.from(document.querySelectorAll('.challenges_cards_wrap'))
      .find(function (el) {
        return !el.closest('.challenges_wrap.is-mobile');
      });

    if (!container) return;

    function getCards() {
      return Array.from(container.querySelectorAll('[data-card-rot]'));
    }
    function stackTransform(pos, rot) {
      const scale = 1 - pos * SCALE_STEP;
      const ty = pos * Y_STEP;
      return 'rotate(' + rot + 'deg) scale(' + scale + ') translateY(' + ty + 'px)';
    }
    function layoutCards(animate) {
      const cards = getCards();
      const total = cards.length;
      cards.forEach(function (card, domIdx) {
        const pos = total - 1 - domIdx;
        const rot = parseFloat(card.getAttribute('data-card-rot')) || 0;
        card.style.zIndex = domIdx + 1;
        card.style.pointerEvents = pos === 0 ? 'auto' : 'none';
        if (animate) {
          card.style.transition = 'transform 0.32s cubic-bezier(0.34,1.4,0.64,1)';
          card.style.transform = stackTransform(pos, rot);
          setTimeout(function () { card.style.transition = ''; }, 360);
        } else {
          card.style.transition = '';
          card.style.transform = stackTransform(pos, rot);
        }
      });
    }
    function bindSwipe(topCard) {
      const baseRot = parseFloat(topCard.getAttribute('data-card-rot')) || 0;
      let active = false, sx = 0, sy = 0, dx = 0, dy = 0;
      function onStart(cx, cy) {
        active = true;
        sx = cx; sy = cy; dx = 0; dy = 0;
        topCard.style.transition = 'none';
      }
      function onMove(cx, cy) {
        if (!active) return;
        dx = cx - sx;
        dy = cy - sy;
        topCard.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + (baseRot + dx * ROTATION_FACTOR) + 'deg)';
      }
      function onEnd() {
        if (!active) return;
        active = false;
        if (Math.abs(dx) >= SWIPE_THRESHOLD) {
          const dir = dx > 0 ? 1 : -1;
          topCard.style.transition = 'transform 0.38s ease-out, opacity 0.38s';
          topCard.style.transform = 'translate(' + (dir * 700) + 'px,' + dy + 'px) rotate(' + (baseRot + dir * 28) + 'deg)';
          topCard.style.opacity = '0';
          topCard.style.pointerEvents = 'none';
          setTimeout(function () {
            topCard.style.transition = '';
            topCard.style.opacity = '1';
            container.insertBefore(topCard, container.firstElementChild);
            layoutCards(true);
            const cards = getCards();
            bindSwipe(cards[cards.length - 1]);
          }, 380);
        } else {
          topCard.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)';
          topCard.style.transform = stackTransform(0, baseRot);
          setTimeout(function () { topCard.style.transition = ''; }, 380);
        }
      }
      topCard.addEventListener('mousedown', function (e) {
        e.preventDefault(); onStart(e.clientX, e.clientY);
      });
      document.addEventListener('mousemove', function (e) {
        if (active) onMove(e.clientX, e.clientY);
      });
      document.addEventListener('mouseup', function () {
        if (active) onEnd();
      });
      topCard.addEventListener('touchstart', function (e) {
        e.preventDefault();
        const t = e.changedTouches[0]; onStart(t.clientX, t.clientY);
      }, { passive: false });
      topCard.addEventListener('touchmove', function (e) {
        e.preventDefault();
        if (!active) return;
        const t = e.changedTouches[0]; onMove(t.clientX, t.clientY);
      }, { passive: false });
      topCard.addEventListener('touchend', function () {
        if (active) onEnd();
      }, { passive: false });
    }
    layoutCards(false);
    const cards = getCards();
    if (cards.length) bindSwipe(cards[cards.length - 1]);
  }

  // =========================================================
  // 05) INITIALISIERUNG
  // =========================================================
  function initAllAnimations() {
    if (typeof gsap === 'undefined') {
      window.addEventListener('load', initAllAnimations, { once: true });
      return;
    }
    initLenis();
    initContentRevealScroll();
    initArrowPathAnimation();
    initChallengesAnimation();
    initChallengesMobileStack();
    initChallengesIllustrationAnimation();
    initNavHideOnFooter();
    initFooterParallax();
    initPartnersTitle();
    initTestimonials();
    initScatterLoader();
    initRevealClip();
    initWaage();
    initLocaleSwitcher();
    initRevealScatter();
    initSwipeCardsDeck();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllAnimations);
  } else {
    initAllAnimations();
  }
})();
