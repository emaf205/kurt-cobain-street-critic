/* ==========================================================================
   SAVONA ANARCHY: Kurt Cobain in Via Savona
   Game Loop, State Machine (Intro, Playing, GameOver), Input, Screen Shake,
   Combo Engine, LocalStorage Records e Rendering 60/120 FPS
   ========================================================================== */

import { Kurt, Pedestrian } from './entities.js';
import { World } from './world.js';
import { ParticleSystem } from './particles.js';
import { INTRO_TEXTS } from './dialogues.js';
import { sound } from './audio.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Dimensioni logiche retro-platformer
    this.width = 960;
    this.height = 540;
    this.resizeCanvas();

    // Macchina a stati: 'intro', 'playing', 'gameover'
    this.state = 'intro';
    this.introStep = 0;
    this.introTimer = 0;

    // Statistiche partita
    this.score = 0;
    this.humansExploded = 0;
    this.distance = 0;

    // Combo system
    this.combo = 1;
    this.comboTimer = 0;

    // Screen Shake (Spring Decay)
    this.shakeTrauma = 0;

    // Persistenza Record Locali (LocalStorage)
    this.highScore = parseInt(localStorage.getItem('savona_highscore') || '0', 10);
    this.maxHumans = parseInt(localStorage.getItem('savona_max_humans') || '0', 10);
    this.maxDistance = parseInt(localStorage.getItem('savona_max_dist') || '0', 10);

    // Sottotitoli dialoghi
    this.subtitleText = "";
    this.subtitleTimer = 0;

    // Input state
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false
    };

    // Inizializza entità
    this.world = new World();
    this.particles = new ParticleSystem();
    this.kurt = new Kurt(120, 390);
    this.pedestrians = [];
    this.bullets = [];
    this.cameraX = 0;
    this.lastSpawnX = 350;

    this.setupEvents();
    this.updateHUDRecords();

    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  updateHUDRecords() {
    const elBest = document.getElementById('best-score-val');
    if (elBest) elBest.textContent = this.highScore;
  }

  saveRecords() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('savona_highscore', this.highScore);
    }
    if (this.humansExploded > this.maxHumans) {
      this.maxHumans = this.humansExploded;
      localStorage.setItem('savona_max_humans', this.maxHumans);
    }
    const curDist = Math.round(this.kurt.x / 10);
    if (curDist > this.maxDistance) {
      this.maxDistance = curDist;
      localStorage.setItem('savona_max_dist', this.maxDistance);
    }
    this.updateHUDRecords();
  }

  setupEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (this.state === 'intro') {
        if (e.code === 'Space' || e.code === 'Enter') {
          sound.init();
          this.startGame();
        }
        return;
      }

      if (this.state === 'gameover') {
        if (e.code === 'KeyR' || e.code === 'Space' || e.code === 'Enter') {
          this.restartGame();
        }
        return;
      }

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.keys.left = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.keys.right = true;
          break;
        case 'ArrowUp':
        case 'KeyW':
          this.keys.up = true;
          this.kurt.jump();
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.keys.down = true;
          this.kurt.duck(true);
          break;
        case 'Space':
          this.keys.jump = true;
          this.kurt.jump();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.kurt.toggleSkate();
          sound.setTempoMultiplier(this.kurt.isSkating);
          break;
        case 'KeyM':
          sound.toggleMute();
          break;
        case 'KeyV':
          sound.toggleVoice();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.keys.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.keys.right = false;
          break;
        case 'ArrowUp':
        case 'KeyW':
          this.keys.up = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.keys.down = false;
          this.kurt.duck(false);
          break;
        case 'Space':
          this.keys.jump = false;
          break;
      }
    });

    // Touch controls per mobile
    const bindBtn = (id, onDown, onUp) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); onDown(); });
      el.addEventListener('pointerup', (e) => { e.preventDefault(); if (onUp) onUp(); });
    };

    bindBtn('btn-touch-left', () => { this.keys.left = true; }, () => { this.keys.left = false; });
    bindBtn('btn-touch-right', () => { this.keys.right = true; }, () => { this.keys.right = false; });
    bindBtn('btn-touch-jump', () => { this.kurt.jump(); });
    bindBtn('btn-touch-duck', () => { this.kurt.duck(true); }, () => { this.kurt.duck(false); });
    bindBtn('btn-touch-skate', () => {
      this.kurt.toggleSkate();
      sound.setTempoMultiplier(this.kurt.isSkating);
    });

    // Avvio e riavvio tramite tap / click
    window.addEventListener('click', () => {
      sound.init();
      if (this.state === 'intro') this.startGame();
      else if (this.state === 'gameover') this.restartGame();
    });

    const btnStart = document.getElementById('btn-start-game');
    if (btnStart) {
      btnStart.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.init();
        this.startGame();
      });
    }

    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', (e) => {
        e.stopPropagation();
        this.restartGame();
      });
    }
  }

  startGame() {
    this.state = 'playing';
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    sound.playGuitarStinger();
    sound.startGrungeBass();
  }

  restartGame() {
    this.saveRecords();
    this.score = 0;
    this.humansExploded = 0;
    this.distance = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.shakeTrauma = 0;
    this.cameraX = 0;
    this.lastSpawnX = 350;

    this.world = new World();
    this.particles.reset();
    this.kurt = new Kurt(120, 390);
    this.pedestrians = [];
    this.bullets = [];

    this.state = 'playing';
    document.getElementById('game-over-screen').classList.add('hidden');
    sound.playGuitarStinger();
    sound.startGrungeBass();
  }

  triggerScreenShake(amount = 0.6) {
    this.shakeTrauma = Math.min(1.0, this.shakeTrauma + amount);
  }

  update(delta) {
    if (this.state === 'intro') {
      this.introTimer += delta;
      if (this.introTimer > 2.8) {
        this.introTimer = 0;
        this.introStep = (this.introStep + 1) % INTRO_TEXTS.length;
      }
      return;
    }

    // Decadimento Screen Shake (Critically damped spring)
    if (this.shakeTrauma > 0) {
      this.shakeTrauma = Math.max(0, this.shakeTrauma - delta * 1.6);
    }

    // Gestione Combo Streak Timer
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.combo = 1;
      }
    }

    if (this.state === 'gameover') {
      this.particles.update();
      return;
    }

    // -------------------------------------------------------------
    // STATO PLAYING
    // -------------------------------------------------------------
    this.kurt.update(delta, this.keys, this.world);
    if (this.kurt.isDead) {
      this.state = 'gameover';
      sound.stopGrungeBass();
      sound.vibrateDeath();
      this.saveRecords();

      document.getElementById('game-over-screen').classList.remove('hidden');
      document.getElementById('go-score').textContent = this.score;
      document.getElementById('go-humans').textContent = this.humansExploded;
      document.getElementById('go-distance').textContent = Math.round(this.kurt.x / 10);
      const elGoBest = document.getElementById('go-best');
      if (elGoBest) elGoBest.textContent = this.highScore;
      return;
    }

    // Fumo skate
    if (this.kurt.isSkating) {
      this.particles.createSkatePuff(this.kurt.x + 12, this.kurt.y + this.kurt.height);
    }

    // Camera segue Kurt al centro dello schermo con molla fluida
    const targetCamX = this.kurt.x - 280;
    this.cameraX += (targetCamX - this.cameraX) * 0.12;

    // Aggiorna Mondo e Particelle
    this.world.update(delta, this.cameraX);
    this.particles.update();

    // Genera nuovi pedoni lungo Via Savona man mano che avanza
    while (this.lastSpawnX < this.kurt.x + 850) {
      this.lastSpawnX += 140 + Math.random() * 110;
      this.pedestrians.push(new Pedestrian(this.lastSpawnX, this.world.groundY - 54));
    }

    // Aggiorna pedoni e gestisci collisioni
    for (let i = this.pedestrians.length - 1; i >= 0; i--) {
      const p = this.pedestrians[i];
      const isAlive = p.update(delta, this.kurt, this.bullets, this.particles, (insult, pedObj) => {
        // Callback esplosione umano
        this.humansExploded++;

        // Combo system
        if (this.comboTimer > 0) {
          this.combo = Math.min(5, this.combo + 1);
        } else {
          this.combo = 1;
        }
        this.comboTimer = 3.6;

        const pointsGained = 250 * this.combo;
        this.score += pointsGained;

        // Floating points / combo text
        const comboLabel = this.combo > 1 ? `COMBO x${this.combo}! +${pointsGained}` : `+${pointsGained}`;
        this.particles.createFloatingText(p.x, p.y, comboLabel, this.combo > 1 ? "#ff4757" : "#ffd685");

        // Screen shake impulsivo
        this.triggerScreenShake(0.45);

        this.subtitleText = `KURT: "${insult}"`;
        this.subtitleTimer = 4.2;

        document.getElementById('score-val').textContent = this.score;
        document.getElementById('count-val').textContent = this.humansExploded;
      });

      if (!isAlive) {
        this.pedestrians.splice(i, 1);
      } else if (p.x < this.cameraX - 100) {
        this.pedestrians.splice(i, 1);
      }
    }

    // Aggiorna proiettili e schivata
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      const prevX = b.x;
      b.update(this.kurt);

      // Rileva schivata (bullet passa sopra a Kurt mentre è accovacciato)
      if (!b.isDead && !b.dodgedAwarded && this.kurt.isDucking) {
        if (Math.abs(b.x - this.kurt.x) < 25) {
          b.dodgedAwarded = true;
          this.score += 100;
          this.particles.createFloatingText(this.kurt.x, this.kurt.y - 10, "SCHIVATO! +100", "#2ed573");
          sound.vibrateLight();
          document.getElementById('score-val').textContent = this.score;
        }
      }

      if (b.isDead || b.x < this.cameraX - 50 || b.x > this.cameraX + 1100) {
        this.bullets.splice(i, 1);
      }
    }

    // Timer sottotitoli
    if (this.subtitleTimer > 0) {
      this.subtitleTimer -= delta;
      if (this.subtitleTimer <= 0) {
        this.subtitleText = "";
      }
    }

    // Aggiorna HUD
    this.distance = Math.round(this.kurt.x / 10);
    document.getElementById('distance-val').textContent = this.distance;
    document.getElementById('speed-val').textContent = this.kurt.isSkating ? "35" : (Math.abs(this.kurt.vx) > 0 ? "14" : "0");
  }

  render() {
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    // Scala virtuale a risoluzione proporzionata
    const scale = Math.min(cw / this.width, ch / this.height);
    const offsetX = (cw - this.width * scale) / 2;
    const offsetY = (ch - this.height * scale) / 2;

    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, cw, ch);

    this.ctx.save();
    this.ctx.translate(offsetX, offsetY);
    this.ctx.scale(scale, scale);

    // Screen Shake Offset
    if (this.shakeTrauma > 0) {
      const shakeMag = Math.pow(this.shakeTrauma, 2) * 12;
      const shakeX = (Math.random() * 2 - 1) * shakeMag;
      const shakeY = (Math.random() * 2 - 1) * shakeMag;
      this.ctx.translate(shakeX, shakeY);
    }

    // 1. Render Mondo (Cielo, parallasse, loft di Via Savona, rotaie)
    this.world.render(this.ctx, this.cameraX, this.width, this.height);

    // 2. Render Pedoni, Kurt e Proiettili con offset telecamera
    this.ctx.save();
    this.ctx.translate(-this.cameraX, 0);

    // Proiettili
    for (const b of this.bullets) {
      b.render(this.ctx);
    }

    // Pedoni
    for (const p of this.pedestrians) {
      p.render(this.ctx);
    }

    // Kurt Cobain
    this.kurt.render(this.ctx);

    // Particelle (Esplosioni umane, fumo e testi fluttuanti)
    this.particles.render(this.ctx);

    this.ctx.restore();

    // 3. Indicatore Combo Streak su Canvas
    if (this.combo > 1 && this.state === 'playing') {
      this.ctx.save();
      this.ctx.fillStyle = "rgba(231, 76, 60, 0.9)";
      this.ctx.fillRect(this.width - 170, 16, 150, 32);
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(this.width - 170, 16, 150, 32);

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "900 14px monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText(`ANARCHY x${this.combo}`, this.width - 95, 37);
      this.ctx.restore();
    }

    // 4. Sottotitoli cinematografici insulti
    if (this.subtitleText) {
      this.ctx.fillStyle = "rgba(10, 12, 16, 0.9)";
      this.ctx.fillRect(40, this.height - 75, this.width - 80, 48);
      this.ctx.strokeStyle = "#e74c3c";
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(40, this.height - 75, this.width - 80, 48);

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "italic bold 15px -apple-system, BlinkMacSystemFont, sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText(this.subtitleText, this.width / 2, this.height - 45);
    }

    // 5. Schermata Intro Cinematografica
    if (this.state === 'intro') {
      this.ctx.fillStyle = "rgba(10, 12, 16, 0.88)";
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.fillStyle = "#e74c3c";
      this.ctx.font = "bold 13px monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText("MILANO // VIA SAVONA // ANARCHIA SURREALISTA", this.width / 2, 130);

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "900 38px -apple-system, BlinkMacSystemFont, sans-serif";
      this.ctx.fillText("SAVONA ANARCHY", this.width / 2, 180);

      this.ctx.fillStyle = "#ffd685";
      this.ctx.font = "16px monospace";
      this.ctx.fillText(INTRO_TEXTS[this.introStep], this.width / 2, 235);

      this.ctx.fillStyle = "#a4b0be";
      this.ctx.font = "14px sans-serif";
      this.ctx.fillText("← → Cammina  |  ↑ Salta  |  ↓ Accovacciati per schivare i proiettili  |  Shift Skate", this.width / 2, 325);
      this.ctx.fillText("1 pedone su 5 è armato ed estrae la pistola: schiva il colpo o è GAME OVER!", this.width / 2, 350);

      this.ctx.fillStyle = "#e74c3c";
      this.ctx.font = "bold 18px monospace";
      this.ctx.fillText("PREMI [SPAZIO] O CLICCA PER INIZIARE", this.width / 2, 420);
    }

    // 6. Linee di scansione CRT retrò
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    for (let y = 0; y < this.height; y += 4) {
      this.ctx.fillRect(0, y, this.width, 1);
    }

    this.ctx.restore();
  }

  animate() {
    requestAnimationFrame(this.animate);
    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.update(delta);
    this.render();
  }
}

// Bootstrap dell'applicazione e registrazione PWA Service Worker
window.addEventListener('DOMContentLoaded', () => {
  window.savonaAnarchy = new Game();

  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('PWA ServiceWorker attivo:', reg.scope))
      .catch(err => console.log('ServiceWorker non registrato:', err));
  }
});
