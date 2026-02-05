
// Audio Context Singleton
let audioCtx: AudioContext | null = null;
let bgmGainNode: GainNode | null = null;
let bgmOscillators: OscillatorNode[] = [];
let nextNoteTime = 0;
let isPlayingBGM = false;
let bgmTimerID: number | null = null;

// Global settings
let sfxVol = 0.5;
let bgmVol = 0.3;
export let isBgmMuted = false;
export let isSfxMuted = false;

const getCtx = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
        audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
};

// Crucial for iOS: Must be called inside a click event handler
export const initAudio = () => {
    const ctx = getCtx();
    if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch((e) => console.warn("Audio resume failed", e));
    }
};

export const setVolumes = (sfx: number, bgm: number) => {
  sfxVol = sfx;
  bgmVol = bgm;
  if (bgmGainNode && audioCtx) {
      const targetVol = isBgmMuted ? 0 : bgmVol * 0.15; 
      bgmGainNode.gain.setTargetAtTime(targetVol, audioCtx.currentTime, 0.5);
  }
};

export const toggleBgmMute = () => {
  isBgmMuted = !isBgmMuted;
  if (bgmGainNode && audioCtx) {
     const targetVol = isBgmMuted ? 0 : bgmVol * 0.15;
     bgmGainNode.gain.setTargetAtTime(targetVol, audioCtx.currentTime, 0.1);
  }
  return isBgmMuted;
};

// Pentatonic Scale for happy, kid-friendly generic background music
const SCALE = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C4, D4, E4, G4, A4, C5

const scheduleNote = (ctx: AudioContext) => {
    if (!bgmGainNode) return;
    
    // Schedule ahead
    while (nextNoteTime < ctx.currentTime + 0.1) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        // Pick a random note from pentatonic scale
        const freq = SCALE[Math.floor(Math.random() * SCALE.length)];
        // Sometimes play a lower harmony
        const finalFreq = Math.random() > 0.8 ? freq / 2 : freq;

        osc.frequency.value = finalFreq;

        const length = 0.2; // Short staccato notes are cuter
        
        gain.gain.setValueAtTime(0, nextNoteTime);
        gain.gain.linearRampToValueAtTime(0.3, nextNoteTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + length);

        osc.connect(gain);
        gain.connect(bgmGainNode);

        osc.start(nextNoteTime);
        osc.stop(nextNoteTime + length + 0.1);
        
        // Cleanup
        osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
        };

        // Randomize rhythm slightly
        nextNoteTime += 0.25 + (Math.random() > 0.5 ? 0.25 : 0); 
    }
    
    if (isPlayingBGM) {
        bgmTimerID = window.requestAnimationFrame(() => scheduleNote(ctx));
    }
};

export const playBGM = (play: boolean) => {
    const ctx = getCtx();
    if (!ctx) return;

    if (play) {
        if (isPlayingBGM) return;
        
        // Ensure context is running (important for mobile)
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});

        if (!bgmGainNode) {
            bgmGainNode = ctx.createGain();
            bgmGainNode.connect(ctx.destination);
        }
        bgmGainNode.gain.value = isBgmMuted ? 0 : bgmVol * 0.15;

        isPlayingBGM = true;
        nextNoteTime = ctx.currentTime + 0.1;
        scheduleNote(ctx);

    } else {
        isPlayingBGM = false;
        if (bgmTimerID) cancelAnimationFrame(bgmTimerID);
    }
};

const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number = 0, volScale: number = 1.0) => {
  if (isSfxMuted || sfxVol <= 0) return;
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
  
  const volume = sfxVol * 0.3 * volScale;
  
  gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
};

export const playSFX = (type: 'correct' | 'wrong' | 'click' | 'success' | 'flip' | 'harvest' | 'water' | 'cheer' | 'eat' | 'powerup' | 'coins' | 'tick' | 'crack') => {
  try {
    switch (type) {
      case 'correct':
        playTone(523.25, 'sine', 0.2, 0); // C5
        playTone(659.25, 'sine', 0.2, 0.1); // E5
        playTone(783.99, 'sine', 0.4, 0.2); // G5
        break;
      case 'wrong':
        playTone(300, 'sawtooth', 0.3, 0);
        playTone(200, 'sawtooth', 0.4, 0.15);
        break;
      case 'click':
        playTone(1200, 'sine', 0.05, 0, 0.5);
        break;
      case 'flip':
        playTone(400, 'triangle', 0.1, 0, 0.3);
        break;
      case 'tick': // Ticker sound
        playTone(800, 'square', 0.03, 0, 0.2);
        break;
      case 'crack': // Egg crack
        playTone(150, 'sawtooth', 0.1, 0, 0.8);
        playTone(100, 'sawtooth', 0.1, 0.05, 0.8);
        break;
      case 'success':
        playTone(523.25, 'square', 0.1, 0, 0.5);
        playTone(523.25, 'square', 0.1, 0.1, 0.5);
        playTone(523.25, 'square', 0.1, 0.2, 0.5);
        playTone(659.25, 'square', 0.6, 0.3, 0.6);
        break;
      case 'harvest':
        playTone(600, 'sine', 0.1, 0);
        playTone(1200, 'sine', 0.1, 0.05);
        break;
      case 'water':
        playTone(800, 'sine', 0.1, 0);
        playTone(600, 'sine', 0.2, 0.05);
        break;
      case 'cheer':
          for(let i=0; i<6; i++) {
            playTone(400 + Math.random()*300, 'sawtooth', 0.5, i * 0.05, 0.4);
            playTone(200 + Math.random()*200, 'triangle', 0.5, i * 0.08, 0.3);
          }
          break;
      case 'eat':
          playTone(300, 'sawtooth', 0.1, 0);
          playTone(450, 'sawtooth', 0.1, 0.1);
          playTone(250, 'sawtooth', 0.15, 0.2);
          break;
      case 'powerup':
          playTone(400, 'sine', 0.1, 0);
          playTone(600, 'sine', 0.1, 0.1);
          playTone(800, 'sine', 0.2, 0.2);
          break;
      case 'coins':
          // EXTENDED COIN SOUND
          const baseTime = 0;
          playTone(1000, 'sine', 0.15, baseTime, 0.7);
          playTone(1500, 'sine', 0.15, baseTime + 0.1, 0.7);
          playTone(2000, 'sine', 0.15, baseTime + 0.2, 0.7);
          playTone(1200, 'sine', 0.2, baseTime + 0.3, 0.6);
          playTone(1800, 'sine', 0.25, baseTime + 0.4, 0.5);
          playTone(2400, 'sine', 0.3, baseTime + 0.5, 0.4);
          break;
    }
  } catch (e) {
    console.warn("Audio error", e);
  }
};
