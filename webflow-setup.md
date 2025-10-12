# Webflow Integration Guide - GSAP Animationen

Detaillierte Anleitung zur Integration der GSAP-Animationen in Ihre Webflow-Website.

## 🎯 Übersicht

Dieser Guide zeigt Ihnen, wie Sie die GSAP-Animationen in Webflow integrieren, ohne HTML oder CSS zu verwenden - alles wird direkt in Webflow erstellt.

## 📋 Schritt 1: GSAP Scripts hinzufügen

### Site Settings → Custom Code → Head Code:
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js"></script>
```

## 📋 Schritt 2: Animationen einbetten

### Site Settings → Custom Code → Footer Code:
```html
<script src="https://your-site.netlify.app/main_animations.js"></script>
```
*Ersetzen Sie `your-site` mit Ihrer tatsächlichen Netlify-URL*

## 📋 Schritt 3: HTML-Struktur in Webflow erstellen

### 3.1 Hero Section (Scatter Animation)

**Container erstellen:**
- **Element**: Section
- **CSS Class**: `hero_main_wrap`
- **Styling**: Vollbildhöhe, Hintergrundfarbe/Gradient

**Nest-Bereich erstellen:**
- **Element**: Div Block
- **CSS Class**: `nest-area`
- **Styling**: Unsichtbar (nur für Animation-Berechnung)
- **Position**: Absolut, zentriert

**Text für Scatter-Animation:**
- **Element**: Heading (H1)
- **CSS Class**: `data-adhd="true"`
- **Styling**: Große Schrift, zentriert
- **Text**: Ihr gewünschter Text

### 3.2 Challenges Section (Card Animation)

**Hauptcontainer:**
- **Element**: Section
- **CSS Class**: `challenges_wrap`
- **Styling**: Padding, Hintergrund

**Cards-Container:**
- **Element**: Div Block
- **CSS Class**: `challenges_cards_wrap`
- **Styling**: Flexbox oder Grid Layout

**Einzelne Cards:**
- **Element**: Div Block
- **CSS Class**: `challenge_card`
- **Styling**: Card-Design, Schatten, Border-Radius
- **Inhalt**: Heading + Text

**Card-Inner:**
- **Element**: Div Block (innerhalb jeder Card)
- **CSS Class**: `challenge_card_inner`
- **Styling**: Padding, Text-Ausrichtung

### 3.3 Modal Section (Clip Animation)

**Modal-Wrapper:**
- **Element**: Div Block
- **CSS Class**: `modal-wrap`
- **Styling**: Fixed Position, Vollbild, z-index hoch
- **Initial**: `display: none`

**Modal-Hintergrund:**
- **Element**: Div Block
- **CSS Class**: `modal-bg`
- **Styling**: Vollbild, halbtransparenter Hintergrund

**Sidebar:**
- **Element**: Div Block
- **CSS Class**: `sidebar`
- **Styling**: Fixed rechts, Breite 400px, Hintergrund weiß
- **Initial**: `display: none`

**Modal-Inhalte:**
- **Element**: Div Block
- **CSS Class**: `data-modal="founders"` oder `data-modal="about"`
- **Styling**: Padding, Text-Styling
- **Initial**: `display: none`

**Modal-Buttons:**
- **Element**: Button
- **CSS Class**: `data-modal-cta="founders"` oder `data-modal-cta="about"`
- **Styling**: Button-Design

**Schließen-Buttons:**
- **Element**: Button
- **CSS Class**: `data-modal-close`
- **Styling**: Button-Design

## 📋 Schritt 4: CSS-Styling in Webflow

### 4.1 Hero Section Styling
```css
/* In Webflow Designer → Style Panel */
.hero_main_wrap {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.nest-area {
  position: absolute;
  width: 300px;
  height: 200px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  pointer-events: none;
  /* Zentriert positionieren */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### 4.2 Challenges Section Styling
```css
.challenges_wrap {
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.challenges_cards_wrap {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  cursor: pointer;
}

.challenge_card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  overflow: hidden;
}

.challenge_card_inner {
  text-align: center;
}
```

### 4.3 Modal Section Styling
```css
.modal-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: none;
}

.modal-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.sidebar {
  position: absolute;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  background: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.1);
}
```

## 📋 Schritt 5: Responsive Design

### Mobile Anpassungen:
```css
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
  }
  
  .challenges_cards_wrap {
    grid-template-columns: 1fr;
  }
}
```

## 📋 Schritt 6: Testing

### 6.1 Lokales Testing:
1. **Webflow Designer**: Preview-Modus verwenden
2. **Browser Developer Tools**: Console auf Fehler prüfen
3. **Responsive Testing**: Verschiedene Bildschirmgrößen testen

### 6.2 Live Testing:
1. **Webflow Publish**: Website publishen
2. **Netlify Deploy**: Animationen deployen
3. **Cross-Browser Testing**: Verschiedene Browser testen

## 🎨 Animationen anpassen

### Scatter Animation anpassen:
```javascript
// In main_animations.js
const distance = Math.random() * 120; // Streuung anpassen
const rotation = (Math.random() - 0.5) * 60; // Rotation anpassen
```

### Card Animation anpassen:
```javascript
// In main_animations.js
xPercent: 80 / (index - i), // Verschiebung anpassen
scale: 1.1, // Skalierung anpassen
```

### Modal Animation anpassen:
```javascript
// In main_animations.js
duration: 1.5, // Geschwindigkeit anpassen
ease: "power4.inOut" // Easing anpassen
```

## 🐛 Häufige Probleme

### Problem 1: Animationen starten nicht
**Lösung**: 
- GSAP Scripts prüfen
- Element-Selektoren prüfen
- Console auf Fehler prüfen

### Problem 2: Scatter Animation funktioniert nicht
**Lösung**:
- `data-adhd="true"` Attribut prüfen
- `.hero_main_wrap` Container prüfen
- `.nest-area` Element prüfen

### Problem 3: Modal öffnet sich nicht
**Lösung**:
- `data-modal-cta` Attribute prüfen
- `.modal-wrap` Container prüfen
- `.sidebar` Element prüfen

### Problem 4: Card Animation funktioniert nicht
**Lösung**:
- `.challenges_cards_wrap` Container prüfen
- `.challenge_card` Elemente prüfen
- `.challenge_card_inner` Elemente prüfen

## 📞 Support

Bei Problemen:
1. **Webflow University**: Für Webflow-spezifische Fragen
2. **GSAP Documentation**: Für Animation-Details
3. **Netlify Community**: Für Hosting-Probleme

---

**Viel Erfolg mit Ihrer Webflow-Integration! 🚀**
