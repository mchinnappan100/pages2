// Playback Module - Handles audio playback and timing
const Playback = {
  // Playback state
  state: {
    isPlaying: false,
    currentTime: 0,
    playbackInterval: null,
    audioContext: null,
    currentNoteIndex: 0
  },

  // Note frequencies (A4 = 440Hz)
  noteFrequencies: {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46,
    'G5': 783.99, 'A5': 880.00, 'B5': 987.77, 'C6': 1046.50
  },

  // Note durations in milliseconds (at 120 BPM)
  noteDurations: {
    'whole': 2000,
    'half': 1000,
    'quarter': 500,
    'eighth': 250,
    'sixteenth': 125
  },

  // Initialize audio context
  init() {
    if (!this.state.audioContext) {
      this.state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  // Toggle play/pause
  togglePlay() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  },

  // Play
  play() {
    this.init();
    this.state.isPlaying = true;
    this.updatePlayButton(true);
    this.startTimer();
    this.startPlayback();
  },

  // Pause
  pause() {
    this.state.isPlaying = false;
    this.updatePlayButton(false);
    this.stopTimer();
  },

  // Stop
  stop() {
    this.state.isPlaying = false;
    this.state.currentTime = 0;
    this.state.currentNoteIndex = 0;
    this.updatePlayButton(false);
    this.stopTimer();
    this.updateTimeDisplay();
    this.clearNoteHighlights();
  },

  // Start playback timer
  startTimer() {
    this.state.playbackInterval = setInterval(() => {
      this.state.currentTime += 100;
      this.updateTimeDisplay();
    }, 100);
  },

  // Stop timer
  stopTimer() {
    if (this.state.playbackInterval) {
      clearInterval(this.state.playbackInterval);
      this.state.playbackInterval = null;
    }
  },

  // Update time display
  updateTimeDisplay() {
    const totalMs = this.state.currentTime;
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const ms = Math.floor((totalMs % 1000) / 100);
    
    const display = document.getElementById('time-display');
    display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}.${ms}`;
  },

  // Update play button
  updatePlayButton(isPlaying) {
    const playBtn = document.getElementById('play-btn');
    
    if (isPlaying) {
      playBtn.innerHTML = `
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
        </svg>
      `;
      playBtn.title = "Pause";
    } else {
      playBtn.innerHTML = `
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      `;
      playBtn.title = "Play";
    }
  },

  // Start note playback
  startPlayback() {
    const notes = MusicComposer.state.notes.sort((a, b) => a.x - b.x);
    
    if (notes.length === 0) {
      MusicComposer.showNotification('No notes to play');
      this.stop();
      return;
    }

    this.playNextNote(notes);
  },

  // Play next note in sequence
  playNextNote(notes) {
    if (!this.state.isPlaying || this.state.currentNoteIndex >= notes.length) {
      if (this.state.isPlaying) {
        this.stop();
      }
      return;
    }

    const note = notes[this.state.currentNoteIndex];
    const duration = this.getDuration(note.duration);
    
    // Play the note sound
    this.playNoteSound(this.estimateFrequency(note.y), duration);
    
    // Highlight the note
    this.highlightNote(note.id);
    
    // Schedule next note
    this.state.currentNoteIndex++;
    setTimeout(() => {
      this.clearNoteHighlight(note.id);
      this.playNextNote(notes);
    }, duration);
  },

  // Play note sound using Web Audio API
  playNoteSound(frequency, duration) {
    if (!this.state.audioContext) return;

    const oscillator = this.state.audioContext.createOscillator();
    const gainNode = this.state.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.state.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    // Envelope
    const now = this.state.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);
    
    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
  },

  // Estimate frequency from Y position on staff
  estimateFrequency(y) {
    // Map Y position to approximate frequency
    // This is a simplified mapping
    const baseFreq = 440; // A4
    const stepsFromA4 = Math.round((80 - y) / 5);
    return baseFreq * Math.pow(2, stepsFromA4 / 12);
  },

  // Get duration in milliseconds based on tempo
  getDuration(durationType) {
    const baseDuration = this.noteDurations[durationType] || 500;
    const tempo = MusicComposer.state.tempo;
    return (baseDuration * 120) / tempo;
  },

  // Highlight playing note
  highlightNote(noteId) {
    const noteGroup = document.querySelector(`[data-note-id="${noteId}"]`);
    if (noteGroup) {
      const noteHead = noteGroup.querySelector('.note-head');
      if (noteHead) {
        noteHead.classList.add('note-playing');
      }
    }
  },

  // Clear note highlight
  clearNoteHighlight(noteId) {
    const noteGroup = document.querySelector(`[data-note-id="${noteId}"]`);
    if (noteGroup) {
      const noteHead = noteGroup.querySelector('.note-head');
      if (noteHead) {
        noteHead.classList.remove('note-playing');
      }
    }
  },

  // Clear all note highlights
  clearNoteHighlights() {
    document.querySelectorAll('.note-playing').forEach(note => {
      note.classList.remove('note-playing');
    });
  }
};

// Initialize playback controls
document.addEventListener('DOMContentLoaded', () => {
  // Play button
  document.getElementById('play-btn').addEventListener('click', () => {
    Playback.togglePlay();
  });

  // Stop button
  document.getElementById('stop-btn').addEventListener('click', () => {
    Playback.stop();
  });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Playback;
}