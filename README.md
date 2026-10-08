# STREET CRITIC: Skater Polemico 🛹

Un videogioco 3D per browser d'azione urbana, ironico e immediato, sviluppato in Vanilla Web & WebGL (Three.js), dove uno skater irriverente, polemico e maleducato attraversa il corso cittadino commentando e dissando a raffica chiunque incontri.

![Version](https://img.shields.io/badge/version-1.0.0-orange)
![Tech](https://img.shields.io/badge/tech-Three.js%20%7C%20Web%20Audio%20%7C%20Web%20Speech-blue)
![Zero Dependencies](https://img.shields.io/badge/dependencies-Zero%20NPM%20Installs-brightgreen)

---

## 🎮 Concetto di Gioco

Sei uno skater adolescente sarcastico, colto a modo suo e polemico fino al midollo. Viaggi dritto lungo un viale metropolitano realistico con asfalto scuro, marciapiedi lastricati, cantieri stradali e palazzi.

Con le frecce della tastiera o i controlli touch guidi la tavola:
- **← / →** : Sterza a destra e a sinistra per cambiare corsia o salire sul marciapiede;
- **↑ / W** : Spinta decisa con il piede a terra per accelerare;
- **↓ / S** : Powerslide di frenata brusca con derapata della tavola;
- **SPAZIO** : Salto Ollie per superare tombini, cordoli e ostacoli.

Quando ti avvicini a qualsiasi passante sul marciapiede o lungo la strada, lo skater lancia automaticamente una battuta satirica, tagliente e spassosa su misura per l'archetipo incontrato, mentre il passante risponde indignato!

---

## 👥 Gli Archetipi Urbani Incontrati

1. **L'Umarell al Cantiere**: Mani rigorosamente dietro la schiena, cappello a coppola e sguardo fisso sulla malta.
2. **Il Manager / Yuppie**: Completo scuro formale, cravatta rossa, ventiquattrore e ansia da briefing.
3. **L'Agente di Polizia Locale (Vigile)**: Pettorina catarifrangente giallo fluo, fischietto e severità da codice stradale del 1992.
4. **L'Influencer**: Tuta athleisure, selfie stick in mano e ossessione per la "golden hour".
5. **Il Boomer in Monopattino**: Caschetto fluo, giacca a vento e terrore della velocità a 15 km/h.
6. **La Sciura Borghese**: Cappotto cammello elegante, occhiali da sole e barboncino con cappottino al guinzaglio.
7. **Il Maranza di Periferia**: Tuta sportiva lucida, borsello a tracolla e trap a tutto volume.
8. **Il Runner / Fanatico del Fitness**: Canotta tecnica, fascia per capelli e monitoraggio ossessivo della zona cardio.
9. **Il Turista Spaesato**: Zaino da 90 litri per fare due passi in centro e mappa capovolta.

---

## 🔊 Audio & Sintesi Vocale

- **Suoni Procedurali (Web Audio API)**:
  - Rotolamento continuo delle ruote in uretano con frequenza e volume proporzionali alla velocità effettiva.
  - *Pop* secco del legno durante l'ollie e *slap* dell'atterraggio delle ruote sull'asfalto.
  - Derapata del powerslide con stridio delle ruote di traverso.
- **Sintesi Vocale Italiana (Web Speech API)**:
  - Lo skater **pronuncia realmente a voce alta** ogni battuta in italiano quando incrocia un cittadino, con timbro scanzonato e ritmato.
  - È possibile disattivare la voce o l'audio in qualsiasi momento dai pulsanti dell'HUD (`M` o `V`).

---

## 🎥 Modalità di Telecamera

Premi il tasto `C` o clicca sul pulsante della camera nell'HUD per alternare:
1. **Terza Persona (Default)**: Visuale dinamica classica dietro le spalle dello skater con FOV dinamico basato sulla velocità.
2. **Skate-Cam Bassa**: Inquadratura rasoterra a pelo d'asfalto per un senso di velocità puro.
3. **Panoramica Urbana**: Visuale aerea cinematografica per ammirare il viale e i palazzi.

---

## 📁 Architettura del Progetto

```
kind-volta/
├── index.html          # Entry point del gioco con canvas WebGL e HUD
├── VERSION.txt         # File di versione (1.0.0)
├── CHANGELOG.md        # Registro delle modifiche
├── README.md           # Documentazione completa
├── css/
│   └── style.css       # Design system urbano, layout HUD e balloon 3D
├── js/
│   ├── game.js         # Core loop, gestione input, camera cinematografica
│   ├── skater.js       # Entità 3D dello skater e skateboard con animazioni
│   ├── pedestrians.js  # Archetipi 3D dei pedoni e sistema di interazione
│   ├── city.js         # Ambiente urbano procedurale infinito con ombre
│   ├── textures.js     # Generatore procedurale di texture HD (asfalto, palazzi)
│   ├── dialogues.js    # Database dialoghi e battute satiriche
│   ├── audio.js        # Motore sonoro Web Audio API & Web Speech API
│   └── ui.js           # Gestione HUD e posizionamento dinamico 3D->2D
└── vendor/
    └── three.min.js    # Libreria Three.js r128 integrata localmente
```

---

## 🚀 Come Eseguire in Locale

Il gioco non richiede installazioni di pacchetti o configurazioni complesse:

```bash
# Con Python 3:
python3 -m http.server 8085

# Oppure con Node (npx):
npx serve -p 8085
```

Apri `http://localhost:8085` nel tuo browser (Chrome, Safari, Firefox o Edge).
