/* ==========================================================================
   VIA SAVONA CRITIC: Kurt in Milan - Game Core & Main Loop
   Three.js WebGL engine with free 360° movement, Kurt Cobain character controller,
   Milanese pedestrians, interactive obstacles, and dynamic cinematic follow camera.
   ========================================================================== */

import { KurtCharacter } from './skater.js';
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
    this.cameraMode = 0; // 0: 3rd Person Follow, 1: Low Skate/Shoe Cam, 2: Overhead Aerial

    // Input state (Full 360° Omnidirectional + Actions)
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      jump: false
    };

    this.initThree();
    this.initEntities();
    this.initInputs();
    this.setupEvents();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x9ca8b5); // Atmospheric Milanese sky

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      250
    );
    this.camera.position.set(0, 2.6, 6.0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  initEntities() {
    this.city = new City(this.scene);
    this.kurt = new KurtCharacter(this.scene);
    this.pedestrians = new PedestrianManager(this.scene);
    this.ui = new UIManager();

    this.pedestrians.onDialogueTriggered = (dialogue, pedestrianObj) => {
      this.ui.showDialogue(dialogue, pedestrianObj);
    };
  }

  initInputs() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (!this.isPlaying) return;

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.keys.up = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.keys.down = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.keys.left = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.keys.right = true;
          break;
        case 'Space':
          this.keys.jump = true;
          this.kurt.jump();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          // Manual burst into skate mode
          this.kurt.triggerSkateBurst();
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
        case 'ArrowUp':
        case 'KeyW':
          this.keys.up = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.keys.down = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          this.keys.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.keys.right = false;
          break;
        case 'Space':
          this.keys.jump = false;
          break;
      }
    });

    // Touch controls
    const bindBtn = (id, onDown, onUp) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); onDown(); });
      el.addEventListener('pointerup', (e) => { e.preventDefault(); if (onUp) onUp(); });
      el.addEventListener('pointerleave', (e) => { if (onUp) onUp(); });
    };

    bindBtn('btn-touch-up', () => { this.keys.up = true; }, () => { this.keys.up = false; });
    bindBtn('btn-touch-down', () => { this.keys.down = true; }, () => { this.keys.down = false; });
    bindBtn('btn-touch-left', () => { this.keys.left = true; }, () => { this.keys.left = false; });
    bindBtn('btn-touch-right', () => { this.keys.right = true; }, () => { this.keys.right = false; });
    bindBtn('btn-touch-jump', () => { this.kurt.jump(); });
    bindBtn('btn-touch-skate', () => { this.kurt.triggerSkateBurst(); });
  }

  setupEvents() {
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        sound.init();
        this.startGame();
      });
    }

    const restartBtn = document.getElementById('btn-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restartGame());
    }

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
    this.kurt.position.set(0, 0, 0);
    this.kurt.rotation = 0;
    this.kurt.currentSpeed = 0;
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
    if (btn) btn.textContent = isMuted ? '🔇 Audio Off' : '🔊 Grunge Audio';
  }

  toggleMuteVoice() {
    const isMuted = sound.toggleVoice();
    const btn = document.getElementById('btn-toggle-voice');
    if (btn) btn.textContent = isMuted ? '🙊 Voice Muted' : '🗣️ Kurt Voice';
  }

  cycleCamera() {
    this.cameraMode = (this.cameraMode + 1) % 3;
    const camBtn = document.getElementById('btn-toggle-camera');
    const names = ['🎥 3rd Person', '🛹 Low Street Cam', '🏙️ Overhead Loft'];
    if (camBtn) camBtn.textContent = names[this.cameraMode];
  }

  updateCamera(delta) {
    const kp = this.kurt.position;
    let targetX, targetY, targetZ;
    let lookX, lookY, lookZ;

    if (this.cameraMode === 0) {
      // Dynamic 3rd person follow behind Kurt
      targetX = kp.x * 0.75;
      targetY = 2.4 + kp.y * 0.4;
      targetZ = kp.z + 5.5;

      lookX = kp.x * 0.4;
      lookY = 1.2 + kp.y * 0.5;
      lookZ = kp.z - 6.5;
    } else if (this.cameraMode === 1) {
      // Low street-level camera
      targetX = kp.x;
      targetY = 0.55 + kp.y * 0.3;
      targetZ = kp.z + 2.8;

      lookX = kp.x;
      lookY = 0.5;
      lookZ = kp.z - 8.5;
    } else {
      // Overhead Milan loft view
      targetX = kp.x * 0.3;
      targetY = 7.5;
      targetZ = kp.z + 10.5;

      lookX = kp.x * 0.2;
      lookY = 0.8;
      lookZ = kp.z - 7.5;
    }

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetX, 0.12);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetY, 0.12);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetZ, 0.14);

    this.camera.lookAt(lookX, lookY, lookZ);

    const targetFOV = 58 + (this.kurt.currentSpeed / this.kurt.skateSpeed) * 12;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 0.08);
    this.camera.updateProjectionMatrix();
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.05);

    if (this.isPlaying && !this.isPaused) {
      // 1. Update Kurt Cobain Character
      this.kurt.update(delta, this.keys);

      // 2. Update Via Savona City & Check Obstacle Collisions
      this.city.update(this.kurt.position.z);
      const hitObstacle = this.city.checkCollisions(this.kurt);
      if (hitObstacle) {
        this.ui.showObstacleHitAlert(hitObstacle.name);
      }

      // 3. Update Milanese Pedestrians & Check Proximity
      this.pedestrians.update(delta, this.kurt);

      // 4. Update Camera & UI
      this.updateCamera(delta);
      this.ui.updateBubblesPosition(this.camera, this.kurt.position);
      this.ui.updateHUD(this.kurt.currentSpeed, this.kurt.position.z);
    } else if (!this.isPlaying) {
      // Idle turntable camera before starting
      const time = Date.now() * 0.0008;
      this.camera.position.x = Math.sin(time) * 4.5;
      this.camera.position.z = Math.cos(time) * 4.5;
      this.camera.position.y = 2.2;
      this.camera.lookAt(0, 0.9, 0);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.viaSavonaGame = new Game();
});
