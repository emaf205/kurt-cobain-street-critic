/* ==========================================================================
   VIA SAVONA CRITIC: Kurt Cobain Edition - Audio Engine
   Realistic grunge audio: Overdrive guitar feedback, footsteps, skateboard drops,
   obstacle collision sounds, and English Web Speech synthesis.
   ========================================================================== */

class GrungeSoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.voiceMuted = false;
    this.isInitialized = false;

    this.rollNoiseNode = null;
    this.rollFilterNode = null;
    this.rollGainNode = null;

    this.distortionCurve = this.makeDistortionCurve(45);

    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.englishVoice = null;
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
      console.warn("Web Audio initialization note:", e);
    }
  }

  initVoices() {
    if (!this.synth) return;
    const load = () => {
      const voices = this.synth.getVoices();
      // Look for natural English voices (US or UK)
      this.englishVoice = voices.find(v => (v.lang.startsWith('en_US') || v.lang.startsWith('en-US') || v.lang.startsWith('en')) && !v.name.includes('Google')) ||
                          voices.find(v => v.lang.startsWith('en')) || null;
    };
    load();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = load;
    }
  }

  makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 45;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

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

  updateRoll(speed, isSkating) {
    if (!this.ctx || !this.rollGainNode || this.isMuted) return;

    if (!isSkating || speed <= 0.02) {
      this.rollGainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.06);
      return;
    }

    const targetGain = Math.min(0.24, speed * 0.28);
    const targetFreq = 450 + speed * 1300;

    this.rollGainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
    this.rollFilterNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);
  }

  playFootstep(isAlternate = false) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const freq = isAlternate ? 82 : 72;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.07);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playBoardDrop() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.1);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  playOlliePop() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Pedestrian gasp / surprised exclamation sound
  playPedestrianGasp() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(390, now + 0.16);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Collision with obstacle: dull thud + scrape + wood rattle
  playObstacleHit() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Heavy Grunge Electric Guitar Stinger (Drop D Power Chords)
  playGrungeStinger() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const notes = [73.42, 110.0, 146.83]; // D2, A2, D3

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const waveShaper = this.ctx.createWaveShaper();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 0.985, now + 0.45);

      waveShaper.curve = this.distortionCurve;
      waveShaper.oversample = '4x';

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, now);
      filter.Q.value = 2.2;

      gain.gain.setValueAtTime(0.19 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(waveShaper);
      waveShaper.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.72);
    });

    // Feedback squeal
    const feedback = this.ctx.createOscillator();
    const fbGain = this.ctx.createGain();
    feedback.type = 'sine';
    feedback.frequency.setValueAtTime(659.25, now);
    feedback.frequency.linearRampToValueAtTime(685, now + 0.5);

    fbGain.gain.setValueAtTime(0.07, now);
    fbGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    feedback.connect(fbGain);
    fbGain.connect(this.ctx.destination);
    feedback.start(now);
    feedback.stop(now + 0.56);
  }

  // English Web Speech API Voice: Tired, cynical Kurt Cobain delivery
  speak(text) {
    if (!this.synth || this.voiceMuted) return;

    try {
      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.05;  // Deliberate, deadpan, cynical tempo
      utterance.pitch = 0.86; // Lower, raspy, tired Kurt Cobain pitch
      utterance.volume = 0.95;

      if (this.englishVoice) {
        utterance.voice = this.englishVoice;
      }
      this.synth.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
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

export const sound = new GrungeSoundEngine();
