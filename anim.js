// GSAP Animationen für Webflow Integration
// Diese Datei enthält alle Animationen, die Sie in Webflow verwenden können
//
// =========================================================
// 01) BASIS & DEPENDENCIES
// =========================================================

// Registriere ScrollTrigger Plugin
if (typeof gsap === 'undefined') {
    console.error('[GSAP] gsap nicht gefunden. Stelle sicher, dass GSAP vor diesem Script geladen wird.');
  } else if (typeof ScrollTrigger === 'undefined') {
    console.error('[GSAP] ScrollTrigger nicht gefunden. Stelle sicher, dass das Plugin geladen wird.');
  } else {
    gsap.registerPlugin(ScrollTrigger);
  }
  
  // =========================================================
  // 02) SMOOTH SCROLL (LENIS)
  // =========================================================
  // Lenis Smooth Scroll
  let __lenisInstance = null;
  let __lenisRafId = null;
  let __lenisGsapTicker = null;
  let __lenisAnchorBound = false;
  function initLenis() {
    if (typeof Lenis === 'undefined') {
      console.warn('[Lenis] Lenis nicht gefunden. Bitte Lenis vor diesem Script laden.');
      return;
    }
    if (__lenisInstance) return; // bereits initialisiert
  
    // Lenis gemäß Fix: autoRaf aktiv
    __lenisInstance = new Lenis({ autoRaf: true });
  
    // Optional: ScrollTrigger syncen
    if (typeof ScrollTrigger !== 'undefined' && __lenisInstance && typeof __lenisInstance.on === 'function') {
      __lenisInstance.on('scroll', ScrollTrigger.update);
    }
  
    // jQuery Bindings gemäß Vorgabe (nur wenn jQuery vorhanden ist)
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
  
  // Scroll-To Anchor Lenis
  // iOS-Erkennung gemäß Fix
  function isIOS() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  
  // Scroll-To Anchor mit Lenis (inkl. iOS-Fix) – gemäß Vorgabe
  // function initScrollToAnchorLenis() {
  //   document.querySelectorAll('[data-anchor-target]').forEach(element => {
  //     element.addEventListener('click', function (e) {
  //       e.preventDefault(); // native Sprung verhindern
  //
  //       const selector = this.getAttribute('data-anchor-target');
  //       const targetEl = document.querySelector(selector);
  //
  //       if (!targetEl) return;
  //
  //       if (isIOS()) {
  //         // iOS Safari – native scroll als Fallback
  //         try { targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) { targetEl.scrollIntoView(); }
  //       } else if (__lenisInstance) {
  //         __lenisInstance.scrollTo(targetEl, {
  //           easing: (x) => x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2,
  //           duration: 1.2,
  //           offset: 0 // ggf. per ID-spezifische Logik anpassen
  //         });
  //       } else {
  //         try { targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) { targetEl.scrollIntoView(); }
  //       }
  //
  //       if (targetEl.id) {
  //         try { history.replaceState(null, '', `#${targetEl.id}`); } catch (_) {}
  //       }
  //     }, { passive: false });
  //   });
  // }
  
  
  // =========================================================
  // 03) SPLITTEXT FALLBACK
  // =========================================================
  // SplitText Fallback für Demo-Zwecke
  if (typeof SplitText === 'undefined') {
      // Fallback-Splitter, erzeugt .word und .char Spans und erhält Leerzeichen
      function createSplitText(el) {
          const original = el.textContent;
          el.textContent = "";
          const words = [];
          const chars = [];
          const frag = document.createDocumentFragment();
  
          original.split(/(\s+)/).forEach(token => {
              if (token.trim() === "") {
                  frag.appendChild(document.createTextNode(token));
                  return;
              }
              const wSpan = document.createElement("span");
              wSpan.className = "word";
              [...token].forEach(c => {
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
  // Sticky Scatter Animation für data-add Elemente
  function initStickyScatterAnimation() {
      const initialScrollX = window.scrollX || 0;
      const initialScrollY = window.scrollY || 0;
      const textElements = document.querySelectorAll('[data-add]');
      const stickyTrigger = document.querySelector('.sticky_trigger');
      const stickyCta = document.querySelector('.sticky_cta');
      
      if (!stickyTrigger) {
          console.log('.sticky_trigger nicht gefunden');
          return;
      }
      
      if (textElements.length === 0) {
          console.log('Keine Elemente mit data-add gefunden');
          return;
      }
      
      textElements.forEach((textElement) => {
          let split;
          let scatteredStates = [];
          
          // Text aufteilen
          if (typeof SplitText !== 'undefined') {
              split = new SplitText(textElement, { 
                  type: 'chars,words',
                  charsClass: 'char',
                  wordsClass: 'word'
              });
          } else {
              split = createSplitText(textElement);
          }
          
          // Basis-Styling setzen
          gsap.set(split.chars, {
              position: 'relative',
              display: 'inline-block'
          });
          
          // Wörter als inline-block setzen um Umbruch zu verhindern
          if (split.words) {
              gsap.set(split.words, {
                  display: 'inline-block',
                  whiteSpace: 'nowrap'
              });
          }
          
          // Sofort verteilen (ohne Animation)
          setScatteredPositions();
          
          function setScatteredPositions() {
              const containerRect = textElement.getBoundingClientRect();
              scatteredStates = [];
              
              split.chars.forEach((char, i) => {
                  if (char.textContent.trim() === '') {
                      scatteredStates.push({ x: 0, y: 0, rotation: 0, scale: 1 });
                      return;
                  }
                  
                  // Zufällige Position um das Element
                  const angle = Math.random() * Math.PI * 2;
                  const distance = Math.random() * 120;
                  const offsetX = Math.cos(angle) * distance;
                  const offsetY = Math.sin(angle) * distance * 0.6;
                  
                  const randomX = (Math.random() - 0.5) * 100;
                  const randomY = (Math.random() - 0.5) * 60;
                  
                  const finalX = offsetX + randomX;
                  const finalY = offsetY + randomY;
                  const rotation = (Math.random() - 0.5) * 60;
                  const scale = gsap.utils.random(0.8, 1.2);
                  
                  scatteredStates.push({ 
                      x: finalX, 
                      y: finalY, 
                      rotation: rotation, 
                      scale: scale 
                  });
                  
                  // Sofort in scattered Position setzen
                  gsap.set(char, {
                      x: finalX,
                      y: finalY,
                      rotation: rotation,
                      scale: scale
                  });
              });
          }
          
          const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                  trigger: stickyTrigger,
                  start: "top top",
                  end: "bottom center",
                  scrub: 1,
                  anticipatePin: 1,
                  invalidateOnRefresh: true,
              }
          });
          
          if (stickyCta) {
              gsap.set(stickyCta, { y: 20, autoAlpha: 0 });
          }
          
          // Animation zu geordnetem Zustand
          split.chars.forEach((char, i) => {
              if (char.textContent.trim() === '') return;
              
              tl.to(char, {
                  x: 0,
                  y: 0,
                  rotation: 0,
                  scale: 1,
                  duration: 1,
                  ease: "linear",
              }, i * 0.02);
          });
          
          if (stickyCta) {
              tl.to(stickyCta, {
                  y: 0,
                  autoAlpha: 1,
                  duration: 0.6,
                  ease: "power2.out"
              }, ">");
          }
          
          // Responsive Anpassung
          window.addEventListener('resize', () => {
              setScatteredPositions();
              ScrollTrigger.refresh();
          });
      });

      // Sicherheitsnetz: Scroll-Position nach Init wiederherstellen
      if (window.scrollX !== initialScrollX || window.scrollY !== initialScrollY) {
          window.scrollTo(initialScrollX, initialScrollY);
      }
  }
  
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
  
  // Challenges Card Animation
  function initChallengesAnimation() {
      const container = document.querySelector('.challenges_wrap .challenges_cards_wrap');
      if (!container) return;
  
      // Nur für Screens ab 992px und größer
      if (window.innerWidth < 992) {
          console.log('Challenges Card Animation: Screen zu klein (< 992px)');
          return;
      }
  
      const containerW = container.clientWidth;
      const cards = document.querySelectorAll('.challenge_card');
      const cardsLength = cards.length;
      const cardContent = document.querySelectorAll('.challenge_card .challenge_card_inner');
  
      let currentPortion = 0; // No portion hovered at the start
  
      cards.forEach(card => {
          gsap.set(card, {
              xPercent: (Math.random() - 0.5) * 10,
              yPercent: (Math.random() - 0.5) * 10,
              rotation: (Math.random() - 0.5) * 20,
          });
      });
  
      // Event Handler Funktionen definieren
      function handleMouseMove(e) {
          // Cursor position relative to the left edge of the container
          const mouseX = e.clientX - container.getBoundingClientRect().left;
          // Cursor's horizontal percentage within the container
          const percentage = mouseX / containerW;
          // Round the value up to get a valid index
          const activePortion = Math.ceil(percentage * cardsLength);
          
          // If a new portion is hovered
          if(
              currentPortion !== activePortion &&
              activePortion > 0 &&
              activePortion <= cardsLength
          ){
              // If a portion was already hovered, reset it
              // -1 to target the correct index in the card set
              if(currentPortion !== 0){ resetPortion(currentPortion - 1); }
  
              // Update the index of the new portion
              currentPortion = activePortion;
              // -1 to target the correct index in the card set
              newPortion(currentPortion - 1);
          }
      }
  
      function handleMouseLeave() {
          // -1 to target the correct index in the card set
          resetPortion(currentPortion - 1);
          // No portion is hovered anymore
          currentPortion = 0;
  
          // Recenter all direct child elements of the cards
          gsap.to(cardContent, {
              xPercent: 0,
              ease:'elastic.out(1, 0.75)',
              duration:0.8
          });
      }
  
      // Event Listener hinzufügen (nur für Screens >= 992px)
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
  
      function resetPortion(index) {
          // Last active card
          gsap.to(cards[index], {
              xPercent: (Math.random() - 0.5) * 10,
              yPercent: (Math.random() - 0.5) * 10,
              rotation: (Math.random() - 0.5) * 20,
              scale:1,
              duration:0.8,
              ease:'elastic.out(1, 0.75)',
          });
      }
  
      function newPortion(i) {
          gsap.to(cards[i], {
              // Reset transformation attributes
              xPercent:0,
              yPercent:0,
              rotation:0,
              duration:0.8,
              scale:1.1,
              ease:'elastic.out(1, 0.75)' // Elastic movement at the end (out)
          });
  
          // For each card's child element
          cardContent.forEach((cardContent, index) => {
              // If it's not the active card
              if(index !== i){
                  gsap.to(cardContent, {
                      // When index - i < 0, push left
                      // When index - i > 0, push right
                      // The further (index - i) moves from 0 in both ways, the smaller the displacement
                      xPercent: 80 / (index - i),
                      ease:'elastic.out(1, 0.75)',
                      duration:0.8
                  });
              // If it is the active card
              }else{
                  // Center its child
                  gsap.to(cardContent, {
                      xPercent: 0,
                      ease:'elastic.out(1, 0.75)',
                      duration:0.8
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

          // transform-origin setzen damit scale/rotate sichtbar wird
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
  
  // Eyebrow Marker Animation (paths)
  function initEyebrowMarkerAnimation() {
      if (typeof gsap === 'undefined') return;
  
      const markers = [
          '.eyebrow_marker_one-svg',
          '.eyebrow_marker_two-svg',
          '.eyebrow_marker_three-svg'
      ];
  
      const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const svg = entry.target;
              gsap.to(svg, {
                  clipPath: 'inset(0 0 0% 0)',
                  webkitClipPath: 'inset(0 0 0% 0)',
                  duration: 1.2,
                  ease: 'power2.out'
              });
              obs.unobserve(svg);
          });
      }, { threshold: 0.1 });
  
      markers.forEach((selector) => {
          const svg = document.querySelector(selector);
          if (!svg) return;
  
          gsap.set(svg, {
              clipPath: 'inset(0 0 100% 0)',
              webkitClipPath: 'inset(0 0 100% 0)',
              willChange: 'clip-path'
          });
          observer.observe(svg);
      });
  }
  
  // Page Loader Animation
  function initPageLoaderAnimation() {
      if (typeof gsap === 'undefined') return;
  
      const heroTitle = document.querySelector('.hero_main_title');
      const nav = document.querySelector('.nav');
      const clipRect = document.querySelector('#reveal-clip rect');
      if (!heroTitle || !clipRect) return;
  
      const split = (typeof SplitText !== 'undefined')
          ? new SplitText(heroTitle, { type: 'chars', charsClass: 'char' })
          : createSplitText(heroTitle);
      const chars = split.chars || [];
  
      gsap.set(heroTitle, { autoAlpha: 1 });
      gsap.set(chars, { autoAlpha: 0, y: 12, rotation: 0 });
      gsap.set(clipRect, { attr: { height: 0 } });
      if (nav) gsap.set(nav, { yPercent: -100 });
  
      const tl = gsap.timeline();
  
      // Random reveal der Buchstaben
      tl.to(chars, {
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
          stagger: { each: 0.03, from: 'random' }
      });
  
      // Clip Reveal
      tl.to(clipRect, {
          attr: { height: 571 },
          duration: 2,
          ease: 'power2.inOut'
      }, '<+=0.1');
  
      // Nav reinfahren
      if (nav) {
          tl.to(nav, {
              yPercent: 0,
              duration: 0.6,
              ease: 'power2.out'
          }, '-=0.6');
      }
  }
  
  // Locale Switcher (Flags + Dropdown)
  function initLocaleSwitcher() {
      function sketchFlag(paths) {
          return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 24" width="28" height="20" fill="none" stroke="#1a1a1a" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="display:block">' + paths + '</svg>';
      }
  
      const FLAGS = {
          en: sketchFlag('<rect x="1" y="1" width="30" height="22" rx="2" stroke-width="1.6"/><line x1="16" y1="1" x2="16" y2="23" stroke-width="2.2"/><line x1="1" y1="12" x2="31" y2="12" stroke-width="2.2"/><line x1="1" y1="1" x2="31" y2="23" stroke-width="1.2"/><line x1="31" y1="1" x2="1" y2="23" stroke-width="1.2"/>'),
          de: sketchFlag('<rect x="1" y="1" width="30" height="22" rx="2" stroke-width="1.6"/><path d="M1 8.5 Q8 8 16 8.5 T31 8.5" stroke-width="1.3"/><path d="M1 15.5 Q10 15 16 15.5 T31 15.5" stroke-width="1.3"/><line x1="3" y1="4.5" x2="12" y2="4.5" stroke-width="3" opacity="0.7"/><line x1="14" y1="5" x2="28" y2="4.5" stroke-width="3" opacity="0.7"/>'),
          pt: sketchFlag('<rect x="1" y="1" width="30" height="22" rx="2" stroke-width="1.6"/><path d="M12 1.5 Q12.5 8, 12 12 T12 22.5" stroke-width="1.3"/><circle cx="12" cy="12" r="3.5" stroke-width="1.4"/><circle cx="12" cy="12" r="1.5" stroke-width="1"/>')
      };
  
      const LOCALES = [
          { code: 'en', href: '/', flag: FLAGS.en, label: 'EN', fullName: 'English' },
          { code: 'de', href: '/de', flag: FLAGS.de, label: 'DE', fullName: 'Deutsch' },
          { code: 'pt', href: '/pt', flag: FLAGS.pt, label: 'PT', fullName: 'Português' }
      ];
  
      const CHECKMARK = '<svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M0.5 6.5H1V7H1.5V7.5H2V8H2.5V8.5H3V9H3.5V9.5H4V10H4.5V10.5H5V11H5.5V11.5H6V11H6.5V10.5H7V10H7.5V9.5H8V9H8.5V8.5H9V8H9.5V7.5H10V7H10.5V6.5H11V6H11.5V5.5H12V5H12.5V4.5H13V4H13.5V3.5V3V2.5V2H13V2.5H12.5V3H12V3.5H11.5V4H11V4.5H10.5V5H10V5.5H9.5V6H9V6.5H8.5V7H8V7.5H7.5V8H7V8.5H6.5V9H6V8.5H5.5V8H5V7.5H4.5V7H4V6.5H3.5V6H3V5.5H2.5V5H2V5.5H1.5V6H1V6.5H0.5Z" fill="currentColor"/></svg>';
  
      function getCurrentLocale() {
          const path = window.location.pathname;
          const htmlLang = document.documentElement.lang;
          for (let i = 0; i < LOCALES.length; i++) {
              const locPath = new URL(LOCALES[i].href, window.location.origin).pathname;
              if (path === locPath || path.startsWith(locPath + '/')) return LOCALES[i];
          }
          if (htmlLang) {
              const code = htmlLang.split('-')[0].toLowerCase();
              const match = LOCALES.find((l) => l.code === code);
              if (match) return match;
          }
          return LOCALES[0];
      }
  
      function scatterText(text) {
          return text.split('').map((c, i) => {
              const tx = (Math.random() - 0.5) * 8;
              const ty = (Math.random() - 0.5) * 6;
              const tr = (Math.random() - 0.5) * 12;
              return '<span class="text-char" style="--tx:' + tx + 'px;--ty:' + ty + 'px;--tr:' + tr + 'deg;animation-delay:' + (i * 0.03) + 's">' + (c === ' ' ? '&nbsp;' : c) + '</span>';
          }).join('');
      }
  
      function init() {
          const current = getCurrentLocale();
          document.querySelectorAll('.locale-switcher').forEach((switcher) => {
              const dropdown = switcher.querySelector('.locale-dropdown');
              const trigger = switcher.querySelector('.locale-trigger');
              if (!dropdown || !trigger) return;
  
              const currentFlag = trigger.querySelector('.current-flag');
              const currentLabel = trigger.querySelector('.current-label');
              if (currentFlag) currentFlag.innerHTML = current.flag;
              if (currentLabel) currentLabel.textContent = current.label;
  
              dropdown.innerHTML = '';
              LOCALES.forEach((loc) => {
                  const btn = document.createElement('button');
                  btn.className = 'locale-option' + (loc.code === current.code ? ' active' : '');
                  btn.setAttribute('role', 'option');
                  btn.setAttribute('aria-selected', loc.code === current.code);
                  btn.innerHTML = '<span class="flag">' + loc.flag + '</span>' +
                      '<span class="name">' + scatterText(loc.fullName) + '</span>' +
                      '<span class="check">' + CHECKMARK + '</span>';
  
                  btn.addEventListener('click', () => {
                      window.location.href = loc.href;
                  });
                  dropdown.appendChild(btn);
              });
  
              trigger.addEventListener('click', (e) => {
                  e.stopPropagation();
                  const isOpen = switcher.classList.contains('open');
                  document.querySelectorAll('.locale-switcher.open').forEach((s) => {
                      s.classList.remove('open');
                      const t = s.querySelector('.locale-trigger');
                      if (t) t.setAttribute('aria-expanded', 'false');
                  });
                  if (!isOpen) {
                      switcher.classList.add('open');
                      trigger.setAttribute('aria-expanded', 'true');
                  }
              });
          });
  
          document.addEventListener('click', () => {
              document.querySelectorAll('.locale-switcher.open').forEach((s) => {
                  s.classList.remove('open');
                  const t = s.querySelector('.locale-trigger');
                  if (t) t.setAttribute('aria-expanded', 'false');
              });
          });
  
          document.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') {
                  document.querySelectorAll('.locale-switcher.open').forEach((s) => {
                      s.classList.remove('open');
                      const t = s.querySelector('.locale-trigger');
                      if (t) t.setAttribute('aria-expanded', 'false');
                  });
              }
          });
  
          document.querySelectorAll('.locale-dropdown').forEach((dd) => {
              dd.addEventListener('click', (e) => { e.stopPropagation(); });
          });
      }
  
      if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', init);
      } else {
          init();
      }
  }
  
  // =========================================================
  // 05) INITIALISIERUNG
  // =========================================================
  // Initialisierung aller Animationen
  function initAllAnimations() {
      initStickyScatterAnimation();
      initContentRevealScroll();
      initArrowPathAnimation();
      initChallengesAnimation();
      initChallengesIllustrationAnimation();
      initNavHideOnFooter();
      initEyebrowMarkerAnimation();
      initPageLoaderAnimation();
      initLocaleSwitcher();
      initFooterParallax();
      initPartnersTitle();
  }
  
  // Globale Resize-Funktion für Challenges Animation
  let challengesInitialized = false;
  function handleChallengesResize() {
      if (window.innerWidth >= 992 && !challengesInitialized) {
          initChallengesAnimation();
          challengesInitialized = true;
      } else if (window.innerWidth < 992 && challengesInitialized) {
          // Animation deaktivieren für kleine Screens
          const container = document.querySelector('.challenges_wrap .challenges_cards_wrap');
          if (container) {
              // Alle Event Listener entfernen
              container.replaceWith(container.cloneNode(true));
          }
          challengesInitialized = false;
      }
  }
  
  // DOM Ready Check
  document.addEventListener('DOMContentLoaded', () => {
      initLenis();
      // initScrollToAnchorLenis();
      initStickyScatterAnimation();
      initContentRevealScroll();
      initArrowPathAnimation();
      initChallengesAnimation();
      initChallengesIllustrationAnimation();
      initNavHideOnFooter();
      initEyebrowMarkerAnimation();
      initPageLoaderAnimation();
      initLocaleSwitcher();
      initFooterParallax();
      initPartnersTitle();
      handleChallengesResize(); // Challenges Animation basierend auf Screen-Größe
  });
  
  // (Footer Initialisierung entfernt)
  
  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
          initLenis();
          // initScrollToAnchorLenis();
          initStickyScatterAnimation();
          initContentRevealScroll();
          initArrowPathAnimation();
          initChallengesAnimation();
          initChallengesIllustrationAnimation();
          initNavHideOnFooter();
          initEyebrowMarkerAnimation();
          initPageLoaderAnimation();
          initLocaleSwitcher();
          initFooterParallax();
          initPartnersTitle();
          handleChallengesResize();
      });
  } else {
      initLenis();
      // initScrollToAnchorLenis();
      initStickyScatterAnimation();
      initContentRevealScroll();
      initArrowPathAnimation();
      initChallengesAnimation();
      initChallengesIllustrationAnimation();
      initNavHideOnFooter();
      initEyebrowMarkerAnimation();
      initPageLoaderAnimation();
      initLocaleSwitcher();
      initFooterParallax();
      initPartnersTitle();
      handleChallengesResize();
  }
  
  // Resize Event Listener für Challenges Animation
  window.addEventListener('resize', handleChallengesResize);
  
  // Fallback für verzögerte Initialisierung
  setTimeout(() => {
      initLenis();
      initScrollToAnchorLenis();
      initStickyScatterAnimation();
      initContentRevealScroll();
      initArrowPathAnimation();
      initChallengesAnimation();
      initChallengesIllustrationAnimation();
      initNavHideOnFooter();
      initEyebrowMarkerAnimation();
      initPageLoaderAnimation();
      initLocaleSwitcher();
      initFooterParallax();
      initPartnersTitle();
      handleChallengesResize();
  }, 100);
  