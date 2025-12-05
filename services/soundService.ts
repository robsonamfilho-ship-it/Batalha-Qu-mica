
// Web Audio API helper to generate game sounds without external files

const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number = 0) => {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
  
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + startTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(audioCtx.currentTime + startTime);
  osc.stop(audioCtx.currentTime + startTime + duration);
};

export const playSound = (effect: 'hit' | 'miss' | 'error' | 'win' | 'click' | 'start') => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
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
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.setValueAtTime(200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
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
