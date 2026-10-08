# Changelog

Tutti i cambiamenti rilevanti a questo progetto sono documentati in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/)
e rispetta la convenzione [Semantic Versioning](https://semver.org/).

## [3.2.0] - 2026-10-08 - "Auteur Mastery & Engine Polish"

### Aggiunto
- **PWA & Offline Architecture (`client-app-artisan`)**:
  - `manifest.webmanifest` con metadati di installazione e icona dinamica maskable.
  - `service-worker.js` Cache-First con cache busting `savona-anarchy-v3.2.0` per supporto 100% offline.
- **Sintetizzatore Procedurale Grunge & Haptics (`gamification-haptics-audio`)**:
  - Sintesi in tempo reale di linea di basso grunge arpeggiata a onde a dente di sega e overdrive tramite Web Audio API (nessun file audio esterno!).
  - Tempo musicale reattivo: 112 BPM camminando, accelera a 148 BPM quando si attiva il burst in skateboard.
  - Feedback aptico nativo tramite Vibration API (`vibrateLight`, `vibrateWarning`, `vibrateExplosion`, `vibrateDeath`).
  - Persistenza record locali in `localStorage` (`savona_highscore`, `savona_max_humans`, `savona_max_dist`).
- **Motion Design & Particle Engine Avanzato (`creative-motion-engine`)**:
  - Screen shake con fisica a smorzamento critico (spring decay) su esplosioni e spari.
  - Testi fluttuanti dinamici con fisica elastica per combo e schivate.
  - Sistema Combo Anarchia (moltiplicatore da 1x a 5x per esplosioni a catena).
  - Bonus schivata (+100 pt quando ci si accovaccia sotto un proiettile).
- **Tipografia Brutalista Svizzera & Layout (`editorial-craft-typography`)**:
  - Refactoring HUD con cifre tabulari (`font-variant-numeric: tabular-nums`).
  - Supporto alle aree sicure per dispositivi mobili (`env(safe-area-inset-*)`).
  - Rifinitura dei pulsanti e badge con rigore geometrico ed eliminazione di qualunque effetto generico "AI-slop".

## [3.0.0] - 2026-10-08 - "Savona Anarchy: Surrealist Platformer Edition"

### Aggiunto
- **Riprogettazione Platformer Cinematografico**: Ispirato ai grandi classici rotoscopici d'autore (*Prince of Persia*, *Another World*, *Flashback*), con rendering fluido a 60 FPS, palette minimalista e iconica.
- **Ambientazione Iconica: Via Savona a Milano**:
  - Loft industriali in mattoni rossi, showroom di design (`Superstudio Expo`, `Spazio Anarchia`), rotaie e storico **Tram 19 Carelli** che transita sullo sfondo.
  - Targhe toponomastiche milanesi *"VIA SAVONA"*.
- **Meccanica Insulto & Esplosione Umana**:
  - Quando Kurt si avvicina a un passante, pronuncia una tagliente battuta satirica ed esistenzialista in italiano.
  - **L'umano esplode all'istante** in un'esplosione surrealista di particelle geometriche, coriandoli e fumo, mentre Kurt prosegue impassibile attraverso la nube.
- **Meccanica Nemici Armati (1 su 5 Spara)**:
  - Il 20% dei pedoni è segretamente armato: quando Kurt si avvicina, estraggono una pistola con indicatore di allerta `[!]` e fanno fuoco con un colpo letale.
  - Il giocatore deve accovacciarsi tempestivamente (`↓` / Duck) per far sibilare il proiettile sopra la testa, altrimenti Kurt muore sul colpo (*Game Over* drammatico).
- **Variabili Casuali d'Ambiente**:
  - Ciclo casuale Giorno / Notte (Crepuscolo industriale vs Notte milanese blu petrolio).
  - Condizioni meteo casuali (Pioggia milanese sui vetri vs foschia secca).
  - Burst skate casuale (Kurt lancia la tavola e scatta a 35 km/h).
- **Intro Cinematografica Testuale**: Sequenza d'atmosfera ambientata alle ore 03:42 a Milano.
- **5 Screenshot Reali In-Game**: Catturati direttamente dal motore di gioco e inclusi nel repository (`screenshots/`).
- **Sound Design Retro-Grunge**:
  - Boombass per l'esplosione degli umani con detriti.
  - Sparo realistico con eco da vicolo urbano.
  - Riff distorti in Drop-D, rumore dei passi e voce italiana recitata via Web Speech API.

## [2.0.0] - 2026-10-08
- Versione 3D free-roam di Via Savona con Kurt Cobain e ostacoli urbani.

## [1.0.0] - 2026-10-08
- Prototipo iniziale runner straight-line.
