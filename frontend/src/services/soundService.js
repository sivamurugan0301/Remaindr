// Pure Web Audio API Sound Synthesizer for TimeFlow
// Generates rich, realistic acoustic tones without external audio file dependencies.

let audioCtx = null;
let activeLoopInterval = null;
let isAudioPlaying = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundService = {
  // Play one iteration of the selected tone
  playTone(tone = 'CHIME') {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      if (tone === 'BEEP') {
        // High-clarity double electronic pulse (880Hz A5)
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now + i * 0.16);

          gain.gain.setValueAtTime(0, now + i * 0.16);
          gain.gain.linearRampToValueAtTime(0.3, now + i * 0.16 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.16 + 0.12);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * 0.16);
          osc.stop(now + i * 0.16 + 0.13);
        }
      } else if (tone === 'GENTLE') {
        // Warm meditative chord: E4, G4, B4, D5
        const freqs = [329.63, 392.00, 493.88, 587.33];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, now);

          gain.gain.setValueAtTime(0, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 1.6);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 1.8);
        });
      } else {
        // Default: CHIME (Ascending crystal chime: C5, E5, G5, C6)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + index * 0.14);

          gain.gain.setValueAtTime(0, now + index * 0.14);
          gain.gain.linearRampToValueAtTime(0.25, now + index * 0.14 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.14 + 0.9);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + index * 0.14);
          osc.stop(now + index * 0.14 + 1.0);
        });
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  },

  // Start continuous looping alarm until explicitly stopped
  startAlarmLoop(tone = 'CHIME') {
    if (isAudioPlaying) return;
    isAudioPlaying = true;

    // Play immediately
    this.playTone(tone);

    // Loop interval based on tone style
    const intervalMs = tone === 'BEEP' ? 1200 : (tone === 'GENTLE' ? 2600 : 2000);
    activeLoopInterval = setInterval(() => {
      this.playTone(tone);
    }, intervalMs);
  },

  stopAlarmLoop() {
    if (activeLoopInterval) {
      clearInterval(activeLoopInterval);
      activeLoopInterval = null;
    }
    isAudioPlaying = false;
  },

  isPlaying() {
    return isAudioPlaying;
  }
};
