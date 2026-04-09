// ==================== WEB AUDIO SOUND SYNTHESIS ====================

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

/** Lazily create (or resume) the shared AudioContext */
const getAudioCtx = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  // Resume if suspended (browsers require user-gesture to start audio)
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
};

// --------------- helpers ---------------

const playTone = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
  frequencyEnd?: number,
): void => {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  if (frequencyEnd !== undefined) {
    osc.frequency.linearRampToValueAtTime(frequencyEnd, ctx.currentTime + duration / 1000);
  }

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration / 1000);
};

const playNoteSequence = (
  notes: Array<{ freq: number; start: number; duration: number }>,
  type: OscillatorType = 'sine',
  volume = 0.3,
): void => {
  const ctx = getAudioCtx();

  for (const note of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.start / 1000);

    gain.gain.setValueAtTime(volume, ctx.currentTime + note.start / 1000);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + (note.start + note.duration) / 1000,
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + note.start / 1000);
    osc.stop(ctx.currentTime + (note.start + note.duration) / 1000);
  }
};

// --------------- public API ---------------

/** Pop sound for correct QCM answer (300 Hz, 100 ms) */
export const playCorrectQCM = (): void => {
  if (!soundEnabled) return;
  playTone(300, 100, 'sine', 0.3);
};

/** Ding for correct keypad answer (800 Hz → 1200 Hz, 150 ms) */
export const playCorrectKeypad = (): void => {
  if (!soundEnabled) return;
  playTone(800, 150, 'sine', 0.3, 1200);
};

/** Buzz for wrong answer (150 Hz, 200 ms, low volume) */
export const playWrong = (): void => {
  if (!soundEnabled) return;
  playTone(150, 200, 'sawtooth', 0.1);
};

/** Ascending arpeggio do-mi-sol for 5-combo */
export const playCombo5 = (): void => {
  if (!soundEnabled) return;
  playNoteSequence(
    [
      { freq: 523, start: 0, duration: 120 },   // C5  (do)
      { freq: 659, start: 100, duration: 120 },  // E5  (mi)
      { freq: 784, start: 200, duration: 160 },  // G5  (sol)
    ],
    'sine',
    0.25,
  );
};

/** Power-up sweep (400 Hz → 1600 Hz) for 10-combo */
export const playCombo10 = (): void => {
  if (!soundEnabled) return;
  playTone(400, 300, 'sine', 0.3, 1600);
};

/** Fanfare – 3-note celebration for new record */
export const playRecord = (): void => {
  if (!soundEnabled) return;
  playNoteSequence(
    [
      { freq: 523, start: 0, duration: 180 },   // C5
      { freq: 659, start: 160, duration: 180 },  // E5
      { freq: 1047, start: 320, duration: 300 }, // C6
    ],
    'triangle',
    0.35,
  );
};

/** Victory melody – 5 notes for beating dad's score */
export const playBeatDad = (): void => {
  if (!soundEnabled) return;
  playNoteSequence(
    [
      { freq: 523, start: 0, duration: 140 },    // C5
      { freq: 587, start: 120, duration: 140 },   // D5
      { freq: 659, start: 240, duration: 140 },   // E5
      { freq: 784, start: 360, duration: 140 },   // G5
      { freq: 1047, start: 480, duration: 300 },  // C6
    ],
    'square',
    0.2,
  );
};

/** Sweep + ding for level-up */
export const playLevelUp = (): void => {
  if (!soundEnabled) return;
  const ctx = getAudioCtx();

  // Sweep
  const oscSweep = ctx.createOscillator();
  const gainSweep = ctx.createGain();
  oscSweep.type = 'sine';
  oscSweep.frequency.setValueAtTime(300, ctx.currentTime);
  oscSweep.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.2);
  gainSweep.gain.setValueAtTime(0.25, ctx.currentTime);
  gainSweep.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  oscSweep.connect(gainSweep);
  gainSweep.connect(ctx.destination);
  oscSweep.start(ctx.currentTime);
  oscSweep.stop(ctx.currentTime + 0.25);

  // Ding after sweep
  const oscDing = ctx.createOscillator();
  const gainDing = ctx.createGain();
  oscDing.type = 'sine';
  oscDing.frequency.setValueAtTime(1200, ctx.currentTime + 0.25);
  gainDing.gain.setValueAtTime(0.35, ctx.currentTime + 0.25);
  gainDing.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  oscDing.connect(gainDing);
  gainDing.connect(ctx.destination);
  oscDing.start(ctx.currentTime + 0.25);
  oscDing.stop(ctx.currentTime + 0.5);
};

/** Subtle click for tick / countdown */
export const playTick = (): void => {
  if (!soundEnabled) return;
  playTone(1000, 30, 'sine', 0.15);
};

/** Enable or disable all sounds */
export const setSoundEnabled = (enabled: boolean): void => {
  soundEnabled = enabled;
};

/** Check whether sounds are currently enabled */
export const isSoundEnabled = (): boolean => soundEnabled;
