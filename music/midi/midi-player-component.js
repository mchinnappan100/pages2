// midi-player-component.js - Custom MIDI Player Web Component
class MIDIPlayerElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.state = {
      isPlaying: false,
      isLoading: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      loop: false,
      error: null,
      fileName: ''
    };

    this.audioContext = null;
    this.midiData = null;
    this.currentNotes = new Map();
    this.startTime = 0;
    this.pausedTime = 0;
    this.scheduledEvents = [];
    this.nextEventIndex = 0;
    this.animationFrame = null;
  }

  static get observedAttributes() {
    return ['src', 'autoplay', 'loop', 'volume'];
  }

  // Lifecycle Methods
  connectedCallback() {
    this.render();
    this.setupEventListeners();
    
    // Load from src attribute
    const src = this.getAttribute('src');
    if (src) {
      this.load(src);
    }
  }

  // Cleanup
  disconnectedCallback() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  // Attribute change handler
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'src':
        if (newValue) this.load(newValue);
        break;
      case 'loop':
        this.state.loop = newValue !== null;
        break;
      case 'volume':
        this.state.volume = parseFloat(newValue) || 1;
        break;
      case 'autoplay':
        if (newValue !== null && this.midiData) {
          this.play();
        }
        break;
    }
  }

  // Render Method
  render() {
    const isDark = document.documentElement.classList.contains('dark');
    
    this.shadowRoot.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :host {
          display: block;
          width: 100%;
          font-family: system-ui, -apple-system, sans-serif;
          --bg: ${isDark ? '#1f2937' : '#ffffff'};
          --bg-secondary: ${isDark ? '#374151' : '#f3f4f6'};
          --text: ${isDark ? '#f9fafb' : '#111827'};
          --text-secondary: ${isDark ? '#d1d5db' : '#6b7280'};
          --border: ${isDark ? '#4b5563' : '#e5e7eb'};
          --primary: #3b82f6;
          --primary-hover: #2563eb;
          --success: #10b981;
          --error: #ef4444;
        }

        .player {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .icon {
          font-size: 1.5rem;
        }

        .title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .progress-container {
          margin-bottom: 1rem;
        }

        .time-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .progress-bar {
          width: 100%;
          height: 0.5rem;
          background: var(--bg-secondary);
          border-radius: 0.25rem;
          position: relative;
          cursor: pointer;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 0.25rem;
          transition: width 0.1s linear;
          position: relative;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 0.75rem;
          height: 0.75rem;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .btn {
          background: var(--bg-secondary);
          border: none;
          border-radius: 0.5rem;
          padding: 0.75rem;
          cursor: pointer;
          color: var(--text);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn:hover {
          background: var(--border);
          transform: scale(1.05);
        }

        .btn:active {
          transform: scale(0.95);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
          padding: 1rem;
        }

        .btn-primary:hover {
          background: var(--primary-hover);
        }

        .volume-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        .volume-slider {
          flex: 1;
          height: 0.25rem;
          background: var(--bg-secondary);
          border-radius: 0.25rem;
          position: relative;
          cursor: pointer;
        }

        .volume-fill {
          height: 100%;
          background: var(--text-secondary);
          border-radius: 0.25rem;
          transition: width 0.1s;
        }

        .waveform {
          display: flex;
          align-items: center;
          justify-content: space-around;
          height: 2rem;
          gap: 2px;
          margin-bottom: 1rem;
          padding: 0 1rem;
        }

        .waveform-bar {
          flex: 1;
          background: var(--primary);
          border-radius: 2px;
          opacity: 0.3;
          transition: all 0.1s;
        }

        .waveform-bar.active {
          opacity: 1;
          animation: pulse 0.5s ease-in-out;
        }

        @keyframes pulse {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }

        .error {
          background: var(--error);
          color: white;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: var(--text-secondary);
        }

        .spinner {
          border: 3px solid var(--bg-secondary);
          border-top: 3px solid var(--primary);
          border-radius: 50%;
          width: 2rem;
          height: 2rem;
          animation: spin 1s linear infinite;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .metadata {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-secondary);
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }

        .metadata-item {
          display: flex;
          flex-direction: column;
        }

        .metadata-label {
          color: var(--text-secondary);
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
        }

        .metadata-value {
          color: var(--text);
          font-weight: 500;
        }
      </style>

      <div class="player">
        ${this.state.error ? `<div class="error">${this.state.error}</div>` : ''}
        
        ${this.state.isLoading ? `
          <div class="loading">
            <div class="spinner"></div>
            <span>Loading MIDI file...</span>
          </div>
        ` : ''}

        <div class="header">
          <span class="icon">🎹</span>
          <span class="title">${this.state.fileName || 'MIDI Player'}</span>
        </div>

        <div class="waveform" id="waveform">
          ${Array(20).fill(0).map((_, i) => `<div class="waveform-bar" style="height: ${Math.random() * 100}%"></div>`).join('')}
        </div>

        <div class="progress-container">
          <div class="time-info">
            <span id="current-time">0:00</span>
            <span id="duration">0:00</span>
          </div>
          <div class="progress-bar" id="progress-bar">
            <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
          </div>
        </div>

        <div class="controls">
          <button class="btn" id="prev-btn" title="Previous" disabled>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>

          <button class="btn btn-primary" id="play-btn" title="Play">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>

          <button class="btn" id="stop-btn" title="Stop">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z"/>
            </svg>
          </button>

          <button class="btn" id="next-btn" title="Next" disabled>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 18h2V6h-2zm-11-7l8.5-6v12z"/>
            </svg>
          </button>

          <button class="btn" id="loop-btn" title="Loop">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
            </svg>
          </button>

          <div class="volume-container">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <div class="volume-slider" id="volume-slider">
              <div class="volume-fill" id="volume-fill" style="width: 100%"></div>
            </div>
          </div>
        </div>

        <div class="metadata" id="metadata" style="display: none;">
          <div class="metadata-item">
            <span class="metadata-label">Tracks</span>
            <span class="metadata-value" id="tracks">--</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Tempo</span>
            <span class="metadata-value" id="tempo">--</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Time Signature</span>
            <span class="metadata-value" id="time-sig">--</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Format</span>
            <span class="metadata-value" id="format">--</span>
          </div>
        </div>
      </div>
    `;
  }

  // Event Listeners Setup
  setupEventListeners() {
    const playBtn = this.shadowRoot.getElementById('play-btn');
    const stopBtn = this.shadowRoot.getElementById('stop-btn');
    const loopBtn = this.shadowRoot.getElementById('loop-btn');
    const progressBar = this.shadowRoot.getElementById('progress-bar');
    const volumeSlider = this.shadowRoot.getElementById('volume-slider');

    playBtn.addEventListener('click', () => {
      if (this.state.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    });

    stopBtn.addEventListener('click', () => this.stop());
    
    loopBtn.addEventListener('click', () => {
      this.state.loop = !this.state.loop;
      loopBtn.style.background = this.state.loop ? 'var(--primary)' : 'var(--bg-secondary)';
      loopBtn.style.color = this.state.loop ? 'white' : 'var(--text)';
    });

    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this.seek(percent);
    });

    volumeSlider.addEventListener('click', (e) => {
      const rect = volumeSlider.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this.setVolume(Math.max(0, Math.min(1, percent)));
    });
  }

  // Load and Parse MIDI File
  async load(src) {
    this.state.isLoading = true;
    this.state.error = null;
    this.render();

    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error('Failed to load MIDI file');
      
      const arrayBuffer = await response.arrayBuffer();
      await this.parseMIDI(arrayBuffer);
      
      this.state.fileName = src.split('/').pop();
      this.state.isLoading = false;
      this.render();
      
      this.dispatchEvent(new CustomEvent('load', { 
        detail: { src, duration: this.state.duration } 
      }));
    } catch (error) {
      this.state.error = error.message;
      this.state.isLoading = false;
      this.render();
      
      this.dispatchEvent(new CustomEvent('error', { detail: { error } }));
    }
  }

  // MIDI Parsing Logic
  async parseMIDI(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    
    // Check for MIDI header 'MThd'
    if (view.getUint32(0) !== 0x4D546864) {
      throw new Error('Invalid MIDI file');
    }

    const headerLength = view.getUint32(4);
    const format = view.getUint16(8);
    const numTracks = view.getUint16(10);
    const division = view.getUint16(12);

    // Parse all tracks
    let offset = 8 + headerLength;
    const tracks = [];
    
    for (let i = 0; i < numTracks; i++) {
      // Check for track header 'MTrk'
      if (view.getUint32(offset) !== 0x4D54726B) {
        throw new Error('Invalid track header');
      }
      
      const trackLength = view.getUint32(offset + 4);
      offset += 8;
      
      const trackData = new Uint8Array(arrayBuffer, offset, trackLength);
      const trackEvents = this.parseTrack(trackData, division);
      tracks.push(trackEvents);
      
      offset += trackLength;
    }

    // Merge all tracks into a single timeline
    const allEvents = [];
    tracks.forEach(track => allEvents.push(...track));
    allEvents.sort((a, b) => a.time - b.time);

    this.scheduledEvents = allEvents;
    this.state.duration = allEvents.length > 0 ? allEvents[allEvents.length - 1].time + 1 : 0;

    this.midiData = { format, numTracks, division, tracks, events: allEvents };
    
    // Update metadata
    const metadata = this.shadowRoot.getElementById('metadata');
    if (metadata) {
      metadata.style.display = 'grid';
      this.shadowRoot.getElementById('tracks').textContent = numTracks;
      this.shadowRoot.getElementById('format').textContent = `Type ${format}`;
      
      // Extract tempo and time signature from events
      const tempoEvent = allEvents.find(e => e.type === 'tempo');
      const timeSigEvent = allEvents.find(e => e.type === 'timeSignature');
      
      this.shadowRoot.getElementById('tempo').textContent = tempoEvent ? 
        `${Math.round(tempoEvent.bpm)} BPM` : '120 BPM';
      this.shadowRoot.getElementById('time-sig').textContent = timeSigEvent ? 
        `${timeSigEvent.numerator}/${timeSigEvent.denominator}` : '4/4';
    }
  }

  // Parse individual track data
  parseTrack(data, division) {
    const events = [];
    let time = 0;
    let i = 0;
    let runningStatus = 0;

    const ticksPerSecond = division; // Simplified tempo calculation
    
    while (i < data.length) {
      // Read delta time
      const [deltaTime, deltaBytes] = this.readVariableLength(data, i);
      i += deltaBytes;
      time += deltaTime / ticksPerSecond;

      if (i >= data.length) break;

      let status = data[i];
      
      // Handle running status
      if (status < 0x80) {
        status = runningStatus;
      } else {
        i++;
        runningStatus = status;
      }

      const eventType = status & 0xF0;
      const channel = status & 0x0F;

      if (eventType === 0x90) { // Note On
        const note = data[i++];
        const velocity = data[i++];
        
        if (velocity > 0) {
          events.push({
            type: 'noteOn',
            time: time,
            note: note,
            velocity: velocity,
            channel: channel
          });
        } else {
          events.push({
            type: 'noteOff',
            time: time,
            note: note,
            channel: channel
          });
        }
      } else if (eventType === 0x80) { // Note Off
        const note = data[i++];
        i++; // velocity
        
        events.push({
          type: 'noteOff',
          time: time,
          note: note,
          channel: channel
        });
      } else if (eventType === 0xB0) { // Control Change
        i += 2;
      } else if (eventType === 0xC0) { // Program Change
        i += 1;
      } else if (eventType === 0xE0) { // Pitch Bend
        i += 2;
      } else if (status === 0xFF) { // Meta Event
        const metaType = data[i++];
        const [length, lengthBytes] = this.readVariableLength(data, i);
        i += lengthBytes;
        
        if (metaType === 0x51) { // Tempo
          const microsecondsPerBeat = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
          const bpm = 60000000 / microsecondsPerBeat;
          events.push({
            type: 'tempo',
            time: time,
            bpm: bpm
          });
        } else if (metaType === 0x58) { // Time Signature
          events.push({
            type: 'timeSignature',
            time: time,
            numerator: data[i],
            denominator: Math.pow(2, data[i + 1])
          });
        }
        
        i += length;
      } else {
        // Skip unknown events
        break;
      }
    }

    return events;
  }

  // Read variable length quantity
  readVariableLength(data, offset) {
    let value = 0;
    let bytes = 0;
    
    while (bytes < 4) {
      const byte = data[offset + bytes];
      value = (value << 7) | (byte & 0x7F);
      bytes++;
      
      if ((byte & 0x80) === 0) break;
    }
    
    return [value, bytes];
  }

  // 
  async play() {
    if (!this.midiData) {
      this.state.error = 'No MIDI file loaded';
      this.render();
      return;
    }

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    await this.audioContext.resume();

    this.state.isPlaying = true;
    this.startTime = this.audioContext.currentTime - this.pausedTime;
    this.nextEventIndex = this.scheduledEvents.findIndex(e => e.time > this.pausedTime);
    if (this.nextEventIndex === -1) this.nextEventIndex = 0;
    
    const playBtn = this.shadowRoot.getElementById('play-btn');
    playBtn.innerHTML = `
      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
      </svg>
    `;

    this.scheduleNextEvents();
    this.updateProgress();
    this.animateWaveform();
    
    this.dispatchEvent(new CustomEvent('play'));
  }

  // Schedule MIDI Events

  scheduleNextEvents() {
    if (!this.state.isPlaying) return;

    const currentTime = this.audioContext.currentTime - this.startTime;
    const lookAheadTime = 0.1; // Schedule 100ms ahead

    while (
      this.nextEventIndex < this.scheduledEvents.length &&
      this.scheduledEvents[this.nextEventIndex].time < currentTime + lookAheadTime
    ) {
      const event = this.scheduledEvents[this.nextEventIndex];
      const scheduleTime = this.startTime + event.time;

      if (event.type === 'noteOn') {
        this.playNote(event.note, event.velocity, scheduleTime);
      } else if (event.type === 'noteOff') {
        this.stopNote(event.note, scheduleTime);
      }

      this.nextEventIndex++;
    }

    // Continue scheduling
    if (this.state.isPlaying) {
      setTimeout(() => this.scheduleNextEvents(), 50);
    }
  }

  // 
  playNote(midiNote, velocity, time) {
    // Create oscillator for the note
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    // Apply velocity and master volume
    const noteVolume = (velocity / 127) * this.state.volume * 0.3;
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(noteVolume, time + 0.01);
    
    oscillator.start(time);
    
    // Store for note off
    this.currentNotes.set(midiNote, { oscillator, gainNode });
  }

  //
  stopNote(midiNote, time) {
    const note = this.currentNotes.get(midiNote);
    if (note) {
      const { oscillator, gainNode } = note;
      
      // Fade out
      gainNode.gain.setValueAtTime(gainNode.gain.value, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      
      oscillator.stop(time + 0.1);
      this.currentNotes.delete(midiNote);
    }
  }

  // Pause Playback
  pause() {
    this.state.isPlaying = false;
    this.pausedTime = this.audioContext.currentTime - this.startTime;
    
    // Stop all playing notes
    this.currentNotes.forEach(({ oscillator, gainNode }) => {
      gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    });
    this.currentNotes.clear();
    
    const playBtn = this.shadowRoot.getElementById('play-btn');
    playBtn.innerHTML = `
      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.dispatchEvent(new CustomEvent('pause'));
  }

  // 

  stop() {
    this.state.isPlaying = false;
    this.pausedTime = 0;
    this.nextEventIndex = 0;
    
    // Stop all playing notes
    this.currentNotes.forEach(({ oscillator, gainNode }) => {
      try {
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime);
      } catch (e) {
        // Note already stopped
      }
    });
    this.currentNotes.clear();
    
    const playBtn = this.shadowRoot.getElementById('play-btn');
    playBtn.innerHTML = `
      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;

    this.state.currentTime = 0;
    this.updateProgressDisplay();

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    this.dispatchEvent(new CustomEvent('stop'));
  }

  seek(percent) {
    this.state.currentTime = this.state.duration * percent;
    if (this.state.isPlaying) {
      this.startTime = this.audioContext.currentTime - this.state.currentTime;
    }
    this.updateProgressDisplay();
  }

  setVolume(value) {
    this.state.volume = value;
    const volumeFill = this.shadowRoot.getElementById('volume-fill');
    if (volumeFill) {
      volumeFill.style.width = `${value * 100}%`;
    }
    this.dispatchEvent(new CustomEvent('volumechange', { detail: { volume: value } }));
  }

  updateProgress() {
    if (!this.state.isPlaying) return;

    if (this.audioContext) {
      this.state.currentTime = this.audioContext.currentTime - this.startTime;
    }

    if (this.state.currentTime >= this.state.duration) {
      if (this.state.loop) {
        this.stop();
        setTimeout(() => this.play(), 100);
      } else {
        this.stop();
        return;
      }
    }

    this.updateProgressDisplay();
    this.animationFrame = requestAnimationFrame(() => this.updateProgress());
  }

  updateProgressDisplay() {
    const currentTimeEl = this.shadowRoot.getElementById('current-time');
    const durationEl = this.shadowRoot.getElementById('duration');
    const progressFill = this.shadowRoot.getElementById('progress-fill');

    if (currentTimeEl) currentTimeEl.textContent = this.formatTime(this.state.currentTime);
    if (durationEl) durationEl.textContent = this.formatTime(this.state.duration);
    if (progressFill) {
      const percent = (this.state.currentTime / this.state.duration) * 100;
      progressFill.style.width = `${Math.min(100, percent)}%`;
    }
  }

  animateWaveform() {
    if (!this.state.isPlaying) return;

    const bars = this.shadowRoot.querySelectorAll('.waveform-bar');
    const randomIndex = Math.floor(Math.random() * bars.length);
    
    bars.forEach((bar, i) => {
      if (i === randomIndex) {
        bar.classList.add('active');
        setTimeout(() => bar.classList.remove('active'), 500);
      }
    });

    setTimeout(() => this.animateWaveform(), 100);
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

customElements.define('midi-player', MIDIPlayerElement);