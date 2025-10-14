// GSAP Animationen für Webflow Integration
// Diese Datei enthält alle Animationen, die Sie in Webflow verwenden können

// Registriere ScrollTrigger Plugin
if (typeof gsap === 'undefined') {
  console.error('[GSAP] gsap nicht gefunden. Stelle sicher, dass GSAP vor diesem Script geladen wird.');
} else if (typeof ScrollTrigger === 'undefined') {
  console.error('[GSAP] ScrollTrigger nicht gefunden. Stelle sicher, dass das Plugin geladen wird.');
} else {
  gsap.registerPlugin(ScrollTrigger);
}

// Modal Clip Animation
function initModalClip() {
  const modalWrap   = document.querySelector(".modal-wrap");
  if (!modalWrap) return;

  const bg          = modalWrap.querySelector(".modal-bg");
  const sidebar     = modalWrap.querySelector(".sidebar");
  const contents    = sidebar.querySelectorAll("[data-modal]");
  const revealItems = sidebar.querySelectorAll("[data-modal-reveal]");
  const buttons     = document.querySelectorAll("[data-modal-cta]");
  const closeBtns   = document.querySelectorAll("[data-modal-close]");

  let infoModalOpen = false;
  let animating = false;

  // --- Öffnen (von rechts nach links) ---
  const openTimeline = gsap.timeline({ paused: true })
    .set(modalWrap, { display: "block" })
    .set(sidebar,  { display: "flex" })
    .fromTo(bg, { opacity: 0 }, { opacity: 0.5 })
    .fromTo(
      sidebar,
      { 
        // Start: unsichtbar, rechts zusammengeklappt
        clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" 
      },
      { 
        // Ziel: komplette Fläche sichtbar
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1.5,
        ease: "power4.inOut"
      },
      "<"
    )
    .fromTo(revealItems, { yPercent: 70, autoAlpha: 0 }, {
      yPercent: 0,
      autoAlpha: 1,
      stagger: 0.05
    }, "<+=0.3");

  // --- Schließen (wieder nach rechts zusammenklappen) ---
  const closeTimeline = gsap.timeline({
    paused: true,
    onStart: () => { animating = true; },
    onComplete: () => { animating = false; }
  })
    .to(bg, { opacity: 0 })
    .to(revealItems, {
      yPercent: 70, autoAlpha: 0, stagger: 0.03, duration: 0.65
    }, "<")
    .to(sidebar, {
      clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
      duration: 1.0,
      ease: "power4.inOut"
    }, "<+=0.25")
    .set(modalWrap, { display: "none" })
    .set(sidebar, { clearProps: "clipPath" });

  function openModal(targetKey) {
    contents.forEach((c) => (c.style.display = "none"));
    const active = sidebar.querySelector(`[data-modal="${targetKey}"]`);
    if (active) active.style.display = "flex";

    infoModalOpen = true;
    openTimeline.play(0);

    if (targetKey === "founders" && typeof awardStackEffect?.play === "function") {
      awardStackEffect.play(0);
    }
  }

  function closeModal() {
    closeTimeline.play(0);
    infoModalOpen = false;

    if (typeof awardStackEffect?.reverse === "function") {
      awardStackEffect.reverse();
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-modal-cta");
      openModal(key);
    });
  });

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!animating) closeModal();
    });
  });

  if (bg) {
    bg.addEventListener("click", () => {
      if (infoModalOpen && !animating) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && infoModalOpen && !animating) {
      closeModal();
    }
  });
}

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

// Scatter Animation für Hero Text
function initScatterAnimation() {
    const textElement = document.querySelector('[data-adhd="true"]');
    
    if (!textElement) {
        console.log('Element mit data-adhd="true" nicht gefunden');
        return;
    }

    let split;
    let scatteredStates = [];

    // Text aufteilen - mit wordSeparator Option für saubere Wort-Trennung
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
        const nestArea = document.querySelector('.nest-area');
        const heroWrap = document.querySelector('.hero_main_wrap');
        
        if (!heroWrap) {
            console.log('.hero_main_wrap nicht gefunden');
            return;
        }

        const containerRect = heroWrap.getBoundingClientRect();
        scatteredStates = [];

        // Fallback falls .nest-area nicht existiert
        let nestRect;
        if (nestArea) {
            nestRect = nestArea.getBoundingClientRect();
        } else {
            nestRect = {
                left: containerRect.left + containerRect.width / 2 - 150,
                top: containerRect.top + containerRect.height / 2 - 100,
                width: 300,
                height: 200
            };
        }

        split.chars.forEach((char, i) => {
            if (char.textContent.trim() === '') {
                scatteredStates.push({ x: 0, y: 0, rotation: 0, scale: 1 });
                return;
            }
            
            // Zufällige Position im "Nest"-Bereich
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
        defaults: { ease: "none" }, // lineare Ease für alle Tweens in tl
        scrollTrigger: {
            trigger: textElement,           // dein data-adhd="true"-Element
            start: "top 80%",
            end: "bottom 10%",
            scrub: 1,                       // smoothes Scrubbing (~1s Nachlauf)
            anticipatePin: 1,               // reduziert kleine Jumps beim Pinning (optional)
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
        }, i * 0.02); // Kleiner zeitlicher Versatz für jeden Buchstaben
    });

    // Responsive Anpassung
    window.addEventListener('resize', () => {
        setScatteredPositions();
        ScrollTrigger.refresh();
    });
}

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

// Scatter-Helfer für Footer-Texte
function setupScatter(textElement) {
    const split = (typeof SplitText !== 'undefined')
        ? new SplitText(textElement, {
            type: 'chars,words',
            charsClass: 'char',
            wordsClass: 'word'
        })
        : createSplitText(textElement);

    // Basis-Styling
    gsap.set(split.chars, { position: 'relative', display: 'inline-block' });
    if (split.words) gsap.set(split.words, { display: 'inline-block', whiteSpace: 'nowrap' });

    function scatterNow() {
        split.chars.forEach((char) => {
            if (char.textContent.trim() === '') return;
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

            gsap.set(char, { x: finalX, y: finalY, rotation, scale });
        });
    }

    // Startzustand: direkt zerstreuen
    scatterNow();

    return { split, scatterNow };
}

// Footer Parallax inkl. geordneter Reveal für data-anim="footer"
function initFooterParallax(){
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[FooterParallax] GSAP oder ScrollTrigger nicht verfügbar.');
    return;
  }

  const sections = document.querySelectorAll('[data-footer-parallax]');
  if (!sections.length) {
    console.warn('[FooterParallax] Keine Elemente mit [data-footer-parallax] gefunden.');
    return;
  }

  console.log(`[FooterParallax] Initialisiere ${sections.length} Abschnitt(e).`);

  sections.forEach(el => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'clamp(top bottom)',
        end: '+=120%',
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    const inner = el.querySelector('[data-footer-parallax-inner]');

    if (inner) {
      tl.from(inner, {
        yPercent: -60,
        ease: 'linear',
        immediateRender: false
      });
    }

    // Entfernt: dark overlay Logik

    // Texte mit data-anim="footer" synchron von zerstreut -> geordnet
    const textTargets = el.querySelectorAll('[data-anim="footer"]');
    textTargets.forEach((textEl) => {
      const { split, scatterNow } = setupScatter(textEl);

      // Eine zusammengefasste Tween mit Stagger verhindert, dass die Timeline zu kurz ist
      tl.to(split.chars, {
        x: 0, y: 0, rotation: 0, scale: 1,
        duration: 1,
        ease: 'linear',
        stagger: 0.02
      }, 0);

      // Bei Resize neu streuen, wenn nahe Start/Ende
      const onResize = () => {
        const st = tl.scrollTrigger;
        const progress = st && st.progress != null ? st.progress : 0;
        if (progress < 0.05 || progress > 0.95) {
          scatterNow();
          ScrollTrigger.refresh();
        }
      };
      window.addEventListener('resize', onResize);
    });
  });

  // Sicherstellen, dass ScrollTrigger Layout misst
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
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

// Initialisierung aller Animationen
function initAllAnimations() {
    initModalClip();
    initScatterAnimation();
    initStickyScatterAnimation();
    initChallengesAnimation();
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
    initModalClip();
    initScatterAnimation();
    initStickyScatterAnimation();
    initChallengesAnimation();
    handleChallengesResize(); // Challenges Animation basierend auf Screen-Größe
});

// Footer Initialisierung separat (wie gewünscht eigener DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
  initFooterParallax();
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initModalClip();
        initScatterAnimation();
        initStickyScatterAnimation();
        initChallengesAnimation();
        handleChallengesResize();
    });
} else {
    initModalClip();
    initScatterAnimation();
    initStickyScatterAnimation();
    initChallengesAnimation();
    handleChallengesResize();
}

// Resize Event Listener für Challenges Animation
window.addEventListener('resize', handleChallengesResize);

// Fallback für verzögerte Initialisierung
setTimeout(() => {
    initModalClip();
    initScatterAnimation();
    initStickyScatterAnimation();
    initChallengesAnimation();
    handleChallengesResize();
}, 100);
