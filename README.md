# Rafer Website - GSAP Animationen für Webflow

GSAP-Animationen für die Integration in Ihre Webflow-Website. HTML-Markup und CSS-Styling erfolgen direkt in Webflow.

## 🎯 Was ist enthalten

- **`main_animations.js`** - Alle GSAP-Animationen für Webflow
- **`netlify.toml`** - Netlify-Konfiguration für Hosting
- **`webflow-setup.md`** - Detaillierte Webflow-Integration

## 🚀 Schnellstart für Webflow

### 1. GSAP Scripts zu Webflow hinzufügen

**Site Settings → Custom Code → Head Code:**
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js"></script>
```

### 2. Animationen einbetten

**Site Settings → Custom Code → Footer Code:**
```html
<script src="https://your-site.netlify.app/main_animations.js"></script>
```

### 3. HTML-Struktur in Webflow erstellen

Siehe `webflow-setup.md` für detaillierte Anweisungen.

## 📁 Projektstruktur

```
rafer_website/
├── main_animations.js      # GSAP-Animationen
├── netlify.toml           # Netlify-Konfiguration
├── webflow-setup.md       # Webflow-Integration Guide
├── example-structure.html # HTML-Struktur Referenz
└── README.md             # Diese Datei
```

## 🌐 Netlify Deployment

### Drag & Drop Methode:
1. Alle Dateien zippen
2. Auf [netlify.com](https://netlify.com) hochladen
3. URL kopieren für Webflow-Integration

### Git Integration:
1. Repository zu GitHub hochladen
2. Netlify mit Git verbinden
3. Automatisches Deployment aktivieren

## 🔗 Webflow Integration

### Schritt-für-Schritt:

1. **GSAP Scripts hinzufügen** (siehe oben)
2. **HTML-Struktur erstellen** mit folgenden Klassen:
   - `.hero_main_wrap` - Hero-Section Container
   - `.nest-area` - Bereich für Scatter-Animation
   - `[data-adhd="true"]` - Text für Scatter-Animation
   - `.challenges_wrap` - Challenges Container
   - `.challenges_cards_wrap` - Cards Container
   - `.challenge_card` - Einzelne Cards
   - `.modal-wrap` - Modal Container
   - `.sidebar` - Modal Sidebar

3. **Animationen aktivieren** durch Einbetten der JavaScript-Datei

## 🎨 Animationen im Detail

### 1. Scatter Text Animation
- **Trigger**: Element mit `data-adhd="true"`
- **Effekt**: Buchstaben verteilen sich zufällig und ordnen sich beim Scrollen
- **Container**: `.hero_main_wrap` und `.nest-area`

### 2. Modal Clip Animation
- **Trigger**: Buttons mit `data-modal-cta`
- **Effekt**: Sidebar öffnet sich von rechts mit Clip-Path-Animation
- **Container**: `.modal-wrap`, `.sidebar`

### 3. Card Hover Animation
- **Trigger**: Hover über `.challenges_cards_wrap`
- **Effekt**: Cards bewegen sich basierend auf Mausposition
- **Container**: `.challenge_card`

## 🛠 Anpassungen

### Animationen anpassen:
In `main_animations.js`:
- **Timing**: `duration` Werte ändern
- **Easing**: `ease` Parameter anpassen
- **Trigger**: `start` und `end` Werte für ScrollTrigger

### Klassen ändern:
Alle CSS-Selektoren können in der JavaScript-Datei angepasst werden.

## 📱 Responsive Verhalten

Alle Animationen sind responsive und passen sich automatisch an verschiedene Bildschirmgrößen an.

## 🐛 Troubleshooting

### Animationen funktionieren nicht:
1. **GSAP Scripts prüfen**: Sind alle CDN-Links erreichbar?
2. **Element-Selektoren prüfen**: Existieren alle Klassen in Webflow?
3. **Console prüfen**: Browser Developer Tools → Console

### Webflow-spezifische Probleme:
1. **HTTPS prüfen**: Webflow benötigt HTTPS für externe Scripts
2. **Publish prüfen**: Sind die Custom Codes published?
3. **Cache leeren**: Browser-Cache leeren

## 📞 Support

Bei Problemen:
1. **Webflow University** für Webflow-spezifische Fragen
2. **GSAP Documentation** für Animation-Details
3. **Netlify Community** für Hosting-Probleme

---

**Viel Erfolg mit Ihren Webflow-Animationen! 🚀**