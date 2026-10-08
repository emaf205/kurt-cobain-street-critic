/* ==========================================================================
   STREET CRITIC: Skater Polemico - UI & HUD Manager
   Fumetti dinamici 3D->2D proiettati su schermo, tachimetro, bacheca dei dissing
   e gestione degli eventi di interfaccia.
   ========================================================================== */

export class UIManager {
  constructor() {
    this.container = document.getElementById('ui-container');
    this.skaterBubble = document.getElementById('skater-bubble');
    this.pedestrianBubble = document.getElementById('pedestrian-bubble');

    this.scoreVal = document.getElementById('score-val');
    this.countVal = document.getElementById('count-val');
    this.speedVal = document.getElementById('speed-val');
    this.distanceVal = document.getElementById('distance-val');
    this.logList = document.getElementById('dialogue-log-list');

    this.bubbleTimeout = null;
    this.activePedestrian = null;

    // Statistiche partita
    this.score = 0;
    this.polemicheCount = 0;
    this.distance = 0;
  }

  // Mostra il balloon del dialogo proiettato sullo schermo
  showDialogue(dialogue, pedestrianObj) {
    this.activePedestrian = pedestrianObj;

    // 1. Aggiorna balloon skater
    const skaterText = document.getElementById('skater-bubble-text');
    skaterText.textContent = `"${dialogue.skater}"`;
    this.skaterBubble.classList.add('visible');

    // 2. Aggiorna balloon pedone
    const pedName = document.getElementById('ped-bubble-name');
    const pedText = document.getElementById('ped-bubble-text');
    pedName.textContent = dialogue.name;
    pedText.textContent = `"${dialogue.pedestrian}"`;
    this.pedestrianBubble.classList.add('visible');

    // 3. Aumenta statistiche e combo
    this.polemicheCount++;
    this.score += 150;
    this.countVal.textContent = this.polemicheCount;
    this.scoreVal.textContent = this.score;

    // Piccolo effetto popup punteggio
    this.showFloatingScore("+150 DISSING!");

    // 4. Aggiungi alla bacheca live dei dissing
    this.addLogEntry(dialogue);

    // 5. Timer di scomparsa dopo 5 secondi
    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
    this.bubbleTimeout = setTimeout(() => {
      this.skaterBubble.classList.remove('visible');
      this.pedestrianBubble.classList.remove('visible');
      this.activePedestrian = null;
    }, 5200);
  }

  // Aggiunge una voce al log laterale
  addLogEntry(dialogue) {
    if (!this.logList) return;
    const li = document.createElement('li');
    li.className = 'log-item';
    li.innerHTML = `
      <span class="log-target">${dialogue.name}:</span>
      <span class="log-quote">${dialogue.skater.substring(0, 55)}...</span>
    `;
    this.logList.prepend(li);

    // Mantieni massimo 6 voci nel log
    while (this.logList.children.length > 6) {
      this.logList.removeChild(this.logList.lastChild);
    }
  }

  // Mostra un tag galleggiante per il punteggio
  showFloatingScore(text) {
    const floatEl = document.createElement('div');
    floatEl.className = 'floating-score';
    floatEl.textContent = text;
    document.body.appendChild(floatEl);

    setTimeout(() => {
      floatEl.remove();
    }, 1200);
  }

  // Aggiorna posizione dei fumetti proiettando le coordinate 3D della scena su 2D del viewport
  updateBubblesPosition(camera, skaterPosition) {
    const widthHalf = window.innerWidth / 2;
    const heightHalf = window.innerHeight / 2;
    const padding = 20;

    let currentSkaterSx = 0;
    let currentSkaterSy = 0;

    // Proiezione fumetto Skater
    if (this.skaterBubble && this.skaterBubble.classList.contains('visible')) {
      const skaterHeadPos = skaterPosition.clone();
      skaterHeadPos.y += 2.0; // Sopra la testa dello skater
      skaterHeadPos.project(camera);

      // Se è davanti alla telecamera
      if (skaterHeadPos.z >= -1 && skaterHeadPos.z <= 1) {
        let sx = (skaterHeadPos.x * widthHalf) + widthHalf;
        let sy = -(skaterHeadPos.y * heightHalf) + heightHalf;

        // Limita entro lo schermo
        sx = Math.max(190, Math.min(window.innerWidth - 190, sx));
        sy = Math.max(140, Math.min(window.innerHeight - 90, sy));

        currentSkaterSx = sx;
        currentSkaterSy = sy;

        this.skaterBubble.style.visibility = 'visible';
        this.skaterBubble.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -100%)`;
      } else {
        this.skaterBubble.style.visibility = 'hidden';
      }
    }

    // Proiezione fumetto Pedone
    if (this.activePedestrian && this.pedestrianBubble && this.pedestrianBubble.classList.contains('visible')) {
      const pedHeadPos = this.activePedestrian.group.position.clone();
      pedHeadPos.y += 2.1; // Sopra la testa del pedone
      pedHeadPos.project(camera);

      if (pedHeadPos.z >= -1 && pedHeadPos.z <= 1) {
        let px = (pedHeadPos.x * widthHalf) + widthHalf;
        let py = -(pedHeadPos.y * heightHalf) + heightHalf;

        px = Math.max(160, Math.min(window.innerWidth - 160, px));
        py = Math.max(80, Math.min(window.innerHeight - 80, py));

        // Prevenzione collisione visiva se i due fumetti sono vicini
        if (currentSkaterSy > 0 && Math.abs(px - currentSkaterSx) < 220 && Math.abs(py - currentSkaterSy) < 90) {
          if (py >= currentSkaterSy) {
            py = currentSkaterSy + 85;
          } else {
            py = Math.max(80, currentSkaterSy - 95);
          }
        }

        this.pedestrianBubble.style.visibility = 'visible';
        this.pedestrianBubble.style.transform = `translate(${px}px, ${py}px) translate(-50%, -100%)`;
      } else {
        this.pedestrianBubble.style.visibility = 'hidden';
      }
    }
  }

  // Aggiorna tachimetro e distanza percorsa
  updateHUD(speed, currentZ) {
    // Calcola velocità realistica in km/h (da 12 a 38 km/h)
    const kmh = Math.round(speed * 85);
    this.speedVal.textContent = kmh;

    // Distanza percorsa in metri (valore assoluto di Z)
    this.distance = Math.max(0, Math.round(Math.abs(currentZ)));
    this.distanceVal.textContent = this.distance;
  }

  reset() {
    this.score = 0;
    this.polemicheCount = 0;
    this.distance = 0;
    this.countVal.textContent = '0';
    this.scoreVal.textContent = '0';
    this.speedVal.textContent = '15';
    this.distanceVal.textContent = '0';
    if (this.logList) this.logList.innerHTML = '';
    if (this.skaterBubble) this.skaterBubble.classList.remove('visible');
    if (this.pedestrianBubble) this.pedestrianBubble.classList.remove('visible');
    this.activePedestrian = null;
  }
}
