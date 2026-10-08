/* ==========================================================================
   STREET CRITIC: Skater Polemico - Audio Engine (Web Audio API & Web Speech)
   Suoni procedurali realistici per skate su asfalto + Sintesi Vocale Italiana
   ========================================================================== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.voiceMuted = false;
    this.isInitialized = false;

    // Nodi per il rumore continuo di rotolamento delle ruote
    this.rollNoiseNode = null;
    this.rollFilterNode = null;
    this.rollGainNode = null;

    // Sintesi vocale
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.italianVoice = null;
    this.initVoices();
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.setupRollSound();
      this.isInitialized = true;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn("Web Audio non supportato o bloccato dall'interazione utente:", e);
    }
  }

  initVoices() {
    if (!this.synth) return;
    const load = () => {
      const voices = this.synth.getVoices();
      // Cerca voce italiana nativa
      this.italianVoice = voices.find(v => v.lang.startsWith('it') || v.lang === 'it_IT') || null;
    };
    load();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = load;
    }
  }

  // Generatore di rumore rosa procedurale per il rotolamento delle ruote in uretano
  setupRollSound() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filtro passa-banda per simulare la grana dell'asfalto
    this.rollFilterNode = this.ctx.createBiquadFilter();
    this.rollFilterNode.type = 'bandpass';
    this.rollFilterNode.frequency.value = 650;
    this.rollFilterNode.Q.value = 1.2;

    this.rollGainNode = this.ctx.createGain();
    this.rollGainNode.gain.value = 0.0;

    whiteNoise.connect(this.rollFilterNode);
    this.rollFilterNode.connect(this.rollGainNode);
    this.rollGainNode.connect(this.ctx.destination);

    whiteNoise.start(0);
    this.rollNoiseNode = whiteNoise;
  }

  // Aggiorna l'intensità e frequenza del rotolamento in base alla velocità effettiva
  updateRoll(speed, isGrounded) {
    if (!this.ctx || !this.rollGainNode || this.isMuted) return;

    if (!isGrounded || speed <= 0.02) {
      this.rollGainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      return;
    }

    const targetGain = Math.min(0.28, speed * 0.22);
    const targetFreq = 400 + speed * 1200;

    this.rollGainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
    this.rollFilterNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);
  }

  // Ollie Pop: impatto netto della tavola sul suolo
  playOlliePop() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // 1. Pop transiente ad alta frequenza (legno che sbatte)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);

    // 2. Click sordo
    const snap = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snap.type = 'sine';
    snap.frequency.setValueAtTime(850, now);
    snap.frequency.exponentialRampToValueAtTime(150, now + 0.04);
    snapGain.gain.setValueAtTime(0.25, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    snap.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snap.start(now);
    snap.stop(now + 0.05);
  }

  // Landing slap: atterraggio delle 4 ruote sull'asfalto
  playLanding() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Powerslide / Frenata brusca: stridio dell'uretano delle ruote di traverso sull'asfalto
  playPowerslide() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(260, now + 0.25);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.value = 3.5;

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  // Push / Spinta col piede
  playFootstep() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Effetto "Dissing Riuscito" / Polemica colpita
  playDissingScore() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880, now + 0.08); // A5

    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.setValueAtTime(659.25, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.36);
    osc2.stop(now + 0.36);
  }

  // Sintesi vocale italiana per far pronunciare la battuta allo skater
  speak(text) {
    if (!this.synth || this.voiceMuted) return;

    try {
      this.synth.cancel(); // Interrompi battuta precedente se in corso
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = 1.18;  // Parlata sciolta, veloce e giovanile
      utterance.pitch = 1.08; // Timbro leggermente squillante da ragazzo
      utterance.volume = 0.95;

      if (this.italianVoice) {
        utterance.voice = this.italianVoice;
      }
      this.synth.speak(utterance);
    } catch (e) {
      console.warn("Impossibile eseguire la sintesi vocale:", e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.rollGainNode && this.ctx) {
      this.rollGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  toggleVoice() {
    this.voiceMuted = !this.voiceMuted;
    if (this.voiceMuted && this.synth) {
      this.synth.cancel();
    }
    return this.voiceMuted;
  }
}

export const sound = new SoundEngine();
