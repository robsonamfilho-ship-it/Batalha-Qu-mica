
// Web Audio API helper to generate game sounds without external files

let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    // @ts-ignore
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
};

const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number = 0) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
  
  gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
};

export const playSound = (effect: 'hit' | 'miss' | 'error' | 'win' | 'click' | 'start') => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  switch (effect) {
    case 'hit':
      // Explosion-ish sound + high ping
      playTone(100, 'sawtooth', 0.2);
      playTone(50, 'square', 0.3);
      playTone(880, 'sine', 0.5, 0.1); // High ping
      break;
    
    case 'miss':
      // Low descending sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      break;

    case 'error':
      // Dissonant buzz
      playTone(150, 'sawtooth', 0.2);
      playTone(140, 'sawtooth', 0.2);
      break;

    case 'win':
      // Victory fanfare
      playTone(523.25, 'square', 0.2, 0); // C5
      playTone(659.25, 'square', 0.2, 0.2); // E5
      playTone(783.99, 'square', 0.2, 0.4); // G5
      playTone(1046.50, 'square', 0.6, 0.6); // C6
      break;
      
    case 'click':
      playTone(800, 'sine', 0.05);
      break;

    case 'start':
      playTone(440, 'sine', 0.1);
      playTone(660, 'sine', 0.3, 0.1);
      break;
  }
};
