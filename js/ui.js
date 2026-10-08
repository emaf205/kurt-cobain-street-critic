/* ==========================================================================
   VIA SAVONA CRITIC: Kurt in Milan - English UI & HUD Manager
   Anti-overlap 3D->2D speech bubbles, Cynicism Score, live Milan roast feed,
   and obstacle alert notifications.
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

    this.score = 0;
    this.roastCount = 0;
    this.distance = 0;
  }

  showDialogue(dialogue, pedestrianObj) {
    this.activePedestrian = pedestrianObj;

    // 1. Kurt's Dialogue Bubble
    const kurtText = document.getElementById('skater-bubble-text');
    kurtText.textContent = `"${dialogue.kurt}"`;
    this.skaterBubble.classList.add('visible');

    // 2. Milanese Pedestrian's Reaction Bubble
    const pedName = document.getElementById('ped-bubble-name');
    const pedText = document.getElementById('ped-bubble-text');
    pedName.textContent = dialogue.name.toUpperCase();
    pedText.textContent = `"${dialogue.pedestrian}"`;
    this.pedestrianBubble.classList.add('visible');

    // 3. Score & Counter Progression
    this.roastCount++;
    this.score += 150;
    this.countVal.textContent = this.roastCount;
    this.scoreVal.textContent = this.score;

    this.showFloatingScore("+150 CYNICISM!");
    this.addLogEntry(dialogue);

    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
    this.bubbleTimeout = setTimeout(() => {
      this.skaterBubble.classList.remove('visible');
      this.pedestrianBubble.classList.remove('visible');
      this.activePedestrian = null;
    }, 5400);
  }

  showObstacleHitAlert(obstacleName) {
    this.showFloatingScore(`STUMBLED ON ${obstacleName.toUpperCase()}!`, '#e74c3c');
  }

  addLogEntry(dialogue) {
    if (!this.logList) return;
    const li = document.createElement('li');
    li.className = 'log-item';
    li.innerHTML = `
      <span class="log-target">${dialogue.name}:</span>
      <span class="log-quote">${dialogue.kurt.substring(0, 58)}...</span>
    `;
    this.logList.prepend(li);

    while (this.logList.children.length > 6) {
      this.logList.removeChild(this.logList.lastChild);
    }
  }

  showFloatingScore(text, color = 'var(--color-yellow)') {
    const floatEl = document.createElement('div');
    floatEl.className = 'floating-score';
    floatEl.textContent = text;
    floatEl.style.background = color;
    document.body.appendChild(floatEl);

    setTimeout(() => {
      floatEl.remove();
    }, 1200);
  }

  updateBubblesPosition(camera, kurtPosition) {
    const widthHalf = window.innerWidth / 2;
    const heightHalf = window.innerHeight / 2;

    let currentKurtSx = 0;
    let currentKurtSy = 0;

    // Kurt's Bubble Projection
    if (this.skaterBubble && this.skaterBubble.classList.contains('visible')) {
      const kurtHeadPos = kurtPosition.clone();
      kurtHeadPos.y += 2.05;
      kurtHeadPos.project(camera);

      if (kurtHeadPos.z >= -1 && kurtHeadPos.z <= 1) {
        let sx = (kurtHeadPos.x * widthHalf) + widthHalf;
        let sy = -(kurtHeadPos.y * heightHalf) + heightHalf;

        sx = Math.max(190, Math.min(window.innerWidth - 190, sx));
        sy = Math.max(140, Math.min(window.innerHeight - 90, sy));

        currentKurtSx = sx;
        currentKurtSy = sy;

        this.skaterBubble.style.visibility = 'visible';
        this.skaterBubble.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -100%)`;
      } else {
        this.skaterBubble.style.visibility = 'hidden';
      }
    }

    // Pedestrian's Bubble Projection
    if (this.activePedestrian && this.pedestrianBubble && this.pedestrianBubble.classList.contains('visible')) {
      const pedHeadPos = this.activePedestrian.group.position.clone();
      pedHeadPos.y += 2.15;
      pedHeadPos.project(camera);

      if (pedHeadPos.z >= -1 && pedHeadPos.z <= 1) {
        let px = (pedHeadPos.x * widthHalf) + widthHalf;
        let py = -(pedHeadPos.y * heightHalf) + heightHalf;

        px = Math.max(160, Math.min(window.innerWidth - 160, px));
        py = Math.max(80, Math.min(window.innerHeight - 80, py));

        // Anti-overlap offset
        if (currentKurtSy > 0 && Math.abs(px - currentKurtSx) < 220 && Math.abs(py - currentKurtSy) < 95) {
          if (py >= currentKurtSy) {
            py = currentKurtSy + 88;
          } else {
            py = Math.max(80, currentKurtSy - 98);
          }
        }

        this.pedestrianBubble.style.visibility = 'visible';
        this.pedestrianBubble.style.transform = `translate(${px}px, ${py}px) translate(-50%, -100%)`;
      } else {
        this.pedestrianBubble.style.visibility = 'hidden';
      }
    }
  }

  updateHUD(speed, currentZ) {
    const kmh = Math.round(speed * 3.6);
    this.speedVal.textContent = kmh;

    this.distance = Math.max(0, Math.round(Math.abs(currentZ)));
    this.distanceVal.textContent = this.distance;
  }

  reset() {
    this.score = 0;
    this.roastCount = 0;
    this.distance = 0;
    this.countVal.textContent = '0';
    this.scoreVal.textContent = '0';
    this.speedVal.textContent = '0';
    this.distanceVal.textContent = '0';
    if (this.logList) this.logList.innerHTML = '';
    if (this.skaterBubble) this.skaterBubble.classList.remove('visible');
    if (this.pedestrianBubble) this.pedestrianBubble.classList.remove('visible');
    this.activePedestrian = null;
  }
}
