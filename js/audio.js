/* ==========================================================================
   SAVONA ANARCHY: Sound & Procedural Audio Engine
   Zero-dependency procedural sound generator via Web Audio API + SpeechSynthesis + Haptics.
   Include un sintetizzatore grunge in tempo reale per basso e distorsione.
   ========================================================================== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('savona_muted') === 'true';
    this.voiceMuted = localStorage.getItem('savona_voice_muted') === 'true';
    this.isInitialized = false;

    // Web Speech API
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.italianVoice = null;
    this.initVoices();

    // Procedural Grunge Bass loop state
    this.bassPlaying = false;
    this.bassStep = 0;
    this.bassTimer = null;
    this.tempoBpm = 112; // Grunge mid-tempo
    this.bassScale = [55.0, 65.41, 73.42, 82.41, 65.41, 55.0, 49.0, 55.0]; // F1, C2, D2, E2 etc.
  }

  init() {
    if (this.isInitialized && this.ctx && this.ctx.state === 'running') return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.isInitialized = true;
    } catch (e) {
      console.warn("Web Audio Init:", e);
    }
  }

  initVoices() {
    if (!this.synth) return;
    const load = () => {
      const voices = this.synth.getVoices();
      this.italianVoice = voices.find(v => v.lang.startsWith('it')) || null;
    };
    load();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = load;
    }
  }

  // --- HAPTIC FEEDBACK (Vibration API) ---
  vibrate(pattern) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignora se non supportato da permessi
      }
    }
  }

  vibrateLight() {
    this.vibrate(12);
  }

  vibrateWarning() {
    this.vibrate([40, 30, 40]);
  }

  vibrateExplosion() {
    this.vibrate([60, 40, 80]);
  }

  vibrateDeath() {
    this.vibrate([120, 80, 200]);
  }

  // --- PROCEDURAL GRUNGE BASSLINE LOOP ---
  startGrungeBass() {
    if (this.bassPlaying || this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    this.bassPlaying = true;
    this.scheduleNextBassNote();
  }

  stopGrungeBass() {
    this.bassPlaying = false;
    if (this.bassTimer) {
      clearTimeout(this.bassTimer);
      this.bassTimer = null;
    }
  }

  scheduleNextBassNote() {
    if (!this.bassPlaying || this.isMuted) return;
    const noteFreq = this.bassScale[this.bassStep % this.bassScale.length];
    this.playBassNote(noteFreq);
    this.bassStep++;

    const interval = (60 / this.tempoBpm) * 500; // Ottavi (eighth notes)
    this.bassTimer = setTimeout(() => {
      this.scheduleNextBassNote();
    }, interval);
  }

  playBassNote(freq) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    // Filtro taglia-frequenze con inviluppo analogico
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(140, now + 0.22);
    filter.Q.setValueAtTime(4.5, now);

    // Inviluppo ADSR per basso grunge
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  setTempoMultiplier(isSkating) {
    this.tempoBpm = isSkating ? 148 : 112;
  }

  // --- EFFETTI SONORI PROCEDURALI ---

  // 1. ESPLOSIONE DELL'UMANO INSULTATO (Sub-bass boom + noise burst)
  playHumanExplosion() {
    this.vibrateExplosion();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Sub-bass sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(22, now + 0.48);

    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.49);

    // Detriti e impatto rumore bianco
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.28);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.065));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const nFilter = this.ctx.createBiquadFilter();
    nFilter.type = 'lowpass';
    nFilter.frequency.setValueAtTime(2200, now);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.42, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    noise.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(now);
  }

  // 2. SPARO DELLA PISTOLA (Crack tagliente da arma da fuoco)
  playGunshot() {
    this.vibrateWarning();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.12);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);

    // Riverbero sparo
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.42);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.09));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.35, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    noise.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(now);
  }

  // 3. Stinger di chitarra grunge distorta
  playGuitarStinger() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    [73.42, 110.0, 146.83, 220.0].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 0.98, now + 0.4);

      gain.gain.setValueAtTime(0.2 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.56);
    });
  }

  // 4. Salto / Ollie
  playJump() {
    this.vibrateLight();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(440, now + 0.15);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  // 5. Caduta tavola da skate
  playBoardDrop() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // 6. Passo a piedi
  playFootstep() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.05);

    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // 7. Sintesi Vocale Italiana di Kurt
  speak(text) {
    if (!this.synth || this.voiceMuted) return;
    try {
      this.synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'it-IT';
      u.rate = 1.05;
      u.pitch = 0.88;
      u.volume = 1.0;
      if (this.italianVoice) u.voice = this.italianVoice;
      this.synth.speak(u);
    } catch (e) {
      console.warn("Speech error:", e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('savona_muted', this.isMuted);
    if (this.isMuted) {
      this.stopGrungeBass();
    } else {
      this.startGrungeBass();
    }
    return this.isMuted;
  }

  toggleVoice() {
    this.voiceMuted = !this.voiceMuted;
    localStorage.setItem('savona_voice_muted', this.voiceMuted);
    if (this.voiceMuted && this.synth) this.synth.cancel();
    return this.voiceMuted;
  }
}

export const sound = new SoundEngine();
