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
      const textElements = document.querySelectorAll('[data-add]');
      const stickyTrigger = document.querySelector('.sticky_trigger');
      
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
          
          // Responsive Anpassung
          window.addEventListener('resize', () => {
              setScatteredPositions();
              ScrollTrigger.refresh();
          });
      });
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
              start: 'top 50%',
              end: 'top 50%',
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
  
  // =========================================================
  // 05) INITIALISIERUNG
  // =========================================================
  // Initialisierung aller Animationen
  function initAllAnimations() {
      initStickyScatterAnimation();
      initContentRevealScroll();
      initChallengesAnimation();
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
      initChallengesAnimation();
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
          initChallengesAnimation();
          initFooterParallax();
          initPartnersTitle();
          handleChallengesResize();
      });
  } else {
      initLenis();
      // initScrollToAnchorLenis();
      initStickyScatterAnimation();
      initContentRevealScroll();
      initChallengesAnimation();
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
      initChallengesAnimation();
      initFooterParallax();
      initPartnersTitle();
      handleChallengesResize();
  }, 100);
  