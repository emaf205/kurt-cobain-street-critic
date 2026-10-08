/* ==========================================================================
   STREET CRITIC: Skater Polemico - Game Core & Main Loop
   Three.js WebGL Renderer, gestione telecamera cinematografica, input e stati
   ========================================================================== */

import { Skater } from './skater.js';
import { PedestrianManager } from './pedestrians.js';
import { City } from './city.js';
import { UIManager } from './ui.js';
import { sound } from './audio.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.clock = new THREE.Clock();

    this.isPlaying = false;
    this.isPaused = false;

    this.cameraMode = 0; // 0: Terza Persona, 1: Skate-Cam Bassa, 2: Panoramica Alta

    // Input state
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false
    };

    this.initThree();
    this.initEntities();
    this.initInputs();
    this.setupEvents();

    // Avvia loop di rendering
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    // 1. Scena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xb8c6d4); // Colore cielo metropolitano

    // 2. Camera prospettica
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      250
    );
    this.camera.position.set(0, 2.5, 5.5);

    // 3. Renderer con impostazioni per resa realistica
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Ombre realistiche Soft Shadow (PCFSoft)
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Tone mapping fotografico cinematografico (ACES Filmic)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    // Gestione ridimensionamento finestra
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  initEntities() {
    this.city = new City(this.scene);
    this.skater = new Skater(this.scene);
    this.pedestrians = new PedestrianManager(this.scene);
    this.ui = new UIManager();

    // Collega l'evento dialogo tra pedoni e UI
    this.pedestrians.onDialogueTriggered = (dialogue, pedestrianObj) => {
      this.ui.showDialogue(dialogue, pedestrianObj);
    };
  }

  initInputs() {
    // Tastiera
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault(); // Evita scroll pagina
      }

      if (!this.isPlaying) return;

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
          this.skater.push();
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.keys.down = true;
          this.skater.brake(true);
          break;
        case 'Space':
          this.keys.jump = true;
          this.skater.ollie();
          break;
        case 'KeyC':
          this.cycleCamera();
          break;
        case 'KeyM':
          this.toggleMuteAudio();
          break;
        case 'KeyV':
          this.toggleMuteVoice();
          break;
        case 'KeyP':
          this.togglePause();
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
          this.skater.brake(false);
          break;
        case 'Space':
          this.keys.jump = false;
          break;
      }
    });

    // Supporto Touch / Comandi su schermo mobile
    const bindBtn = (id, onDown, onUp) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        onDown();
      });
      el.addEventListener('pointerup', (e) => {
        e.preventDefault();
        if (onUp) onUp();
      });
      el.addEventListener('pointerleave', (e) => {
        if (onUp) onUp();
      });
    };

    bindBtn('btn-touch-left', () => { this.keys.left = true; }, () => { this.keys.left = false; });
    bindBtn('btn-touch-right', () => { this.keys.right = true; }, () => { this.keys.right = false; });
    bindBtn('btn-touch-push', () => { this.skater.push(); });
    bindBtn('btn-touch-ollie', () => { this.skater.ollie(); });
  }

  setupEvents() {
    // Tasto Avvia Gioco
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        sound.init(); // Attiva Web Audio API su gesto utente
        this.startGame();
      });
    }

    // Tasto Riavvia
    const restartBtn = document.getElementById('btn-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.restartGame();
      });
    }

    // Tasti Mute e Opzioni HUD
    const muteAudioBtn = document.getElementById('btn-toggle-sound');
    if (muteAudioBtn) {
      muteAudioBtn.addEventListener('click', () => this.toggleMuteAudio());
    }

    const muteVoiceBtn = document.getElementById('btn-toggle-voice');
    if (muteVoiceBtn) {
      muteVoiceBtn.addEventListener('click', () => this.toggleMuteVoice());
    }

    const camBtn = document.getElementById('btn-toggle-camera');
    if (camBtn) {
      camBtn.addEventListener('click', () => this.cycleCamera());
    }
  }

  startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    this.isPlaying = true;
    this.clock.start();
  }

  restartGame() {
    this.skater.position.set(0, 0, 0);
    this.skater.laneX = 0;
    this.skater.speed = this.skater.baseSpeed;
    this.city.reset();
    this.pedestrians.reset();
    this.ui.reset();
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseOverlay = document.getElementById('pause-overlay');
    if (pauseOverlay) {
      pauseOverlay.classList.toggle('hidden', !this.isPaused);
    }
  }

  toggleMuteAudio() {
    const isMuted = sound.toggleMute();
    const btn = document.getElementById('btn-toggle-sound');
    if (btn) btn.textContent = isMuted ? '🔇 Audio Spento' : '🔊 Effetti Audio';
  }

  toggleMuteVoice() {
    const isMuted = sound.toggleVoice();
    const btn = document.getElementById('btn-toggle-voice');
    if (btn) btn.textContent = isMuted ? '🙊 Voce Spenta' : '🗣️ Voce Skater';
  }

  cycleCamera() {
    this.cameraMode = (this.cameraMode + 1) % 3;
    const camBtn = document.getElementById('btn-toggle-camera');
    const names = ['🎥 Terza Persona', '🛹 Skate Cam Bassa', '🏙️ Vista Panoramica'];
    if (camBtn) camBtn.textContent = names[this.cameraMode];
  }

  updateCamera(delta) {
    const skPos = this.skater.position;
    let targetX, targetY, targetZ;
    let lookX, lookY, lookZ;

    if (this.cameraMode === 0) {
      // 0: Terza persona dinamica fluida (Follow cam realistica)
      targetX = skPos.x * 0.65;
      targetY = 2.2 + skPos.y * 0.4;
      targetZ = skPos.z + 5.2;

      lookX = skPos.x * 0.35;
      lookY = 1.1 + skPos.y * 0.5;
      lookZ = skPos.z - 7.5;
    } else if (this.cameraMode === 1) {
      // 1: Skate Cam rasoterra
      targetX = skPos.x;
      targetY = 0.55 + skPos.y * 0.3;
      targetZ = skPos.z + 2.6;

      lookX = skPos.x;
      lookY = 0.5;
      lookZ = skPos.z - 9.0;
    } else {
      // 2: Panoramica aerea urbana
      targetX = skPos.x * 0.3;
      targetY = 6.8;
      targetZ = skPos.z + 9.8;

      lookX = skPos.x * 0.2;
      lookY = 0.8;
      lookZ = skPos.z - 8.0;
    }

    // Interpolazione morbida (Lerp) per sensazione cinematografica realistica
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetX, 0.12);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetY, 0.12);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetZ, 0.15);

    this.camera.lookAt(lookX, lookY, lookZ);

    // FOV dinamico che si allarga con l'aumentare della velocità per enfatizzare il movimento
    const targetFOV = 58 + (this.skater.speed / this.skater.maxSpeed) * 12;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 0.08);
    this.camera.updateProjectionMatrix();
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.05);

    if (this.isPlaying && !this.isPaused) {
      // 1. Gestione sterzata dello skater
      let steerDir = 0;
      if (this.keys.left) steerDir -= 1;
      if (this.keys.right) steerDir += 1;
      this.skater.steer(steerDir);

      // 2. Aggiornamento entità
      this.skater.update(delta);
      this.city.update(this.skater.position.z);
      this.pedestrians.update(delta, this.skater);

      // 3. Aggiornamento telecamera
      this.updateCamera(delta);

      // 4. Aggiornamento interfaccia UI (fumetti 3D proiettati, tachimetro, bacheca)
      this.ui.updateBubblesPosition(this.camera, this.skater.position);
      this.ui.updateHUD(this.skater.speed, this.skater.position.z);
    } else if (!this.isPlaying) {
      // Animazione panoramica idling attorno allo skater prima di avviare il gioco
      const time = Date.now() * 0.0008;
      this.camera.position.x = Math.sin(time) * 4.5;
      this.camera.position.z = Math.cos(time) * 4.5;
      this.camera.position.y = 2.0;
      this.camera.lookAt(0, 0.9, 0);
    }

    // Render WebGL
    this.renderer.render(this.scene, this.camera);
  }
}

// Inizializza il gioco al caricamento del DOM
window.addEventListener('DOMContentLoaded', () => {
  window.streetCriticGame = new Game();
});
