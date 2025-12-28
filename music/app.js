// MIDI Player Application
const MIDIPlayer = {
  state: {
    currentFile: null,
    playlist: [],
    currentIndex: 0,
    isPlaying: false,
    isLooping: false,
    isShuffling: false,
    volume: 100,
    tempo: 100,
    pitch: 0,
    tracks: [],
    mutedTracks: new Set()
  },

  // Initialize the application
  init() {
    this.loadTheme();
    this.setupEventListeners();
    console.log('🎹 MIDI Player initialized');
  },

  // Load saved theme
  loadTheme() {
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  },

  // Setup all event listeners
  setupEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });

    // Help button
    document.getElementById('help-btn').addEventListener('click', () => {
      this.showHelp();
    });

    // Upload area
    const uploadArea = document.getElementById('upload-area');
    const midiInput = document.getElementById('midi-input');
    const uploadBtn = document.getElementById('upload-btn');

    uploadArea.addEventListener('click', () => midiInput.click());
    uploadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      midiInput.click();
    });

    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        this.handleFiles(e.dataTransfer.files);
      }
    });

    midiInput.addEventListener('change', () => {
      if (midiInput.files.length) {
        this.handleFiles(midiInput.files);
      }
    });

    // New file button
    document.getElementById('new-file-btn').addEventListener('click', () => {
      document.getElementById('upload-area').classList.remove('hidden');
      midiInput.click();
    });

    // Playback controls
    document.getElementById('play-btn').addEventListener('click', () => this.play());
    document.getElementById('pause-btn').addEventListener('click', () => this.pause());
    document.getElementById('stop-btn').addEventListener('click', () => this.stop());
    document.getElementById('prev-btn').addEventListener('click', () => this.previous());
    document.getElementById('next-btn').addEventListener('click', () => this.next());

    // Loop and shuffle
    document.getElementById('loop-btn').addEventListener('click', () => this.toggleLoop());
    document.getElementById('shuffle-btn').addEventListener('click', () => this.toggleShuffle());

    // Audio controls
    document.getElementById('volume-slider').addEventListener('input', (e) => {
      this.setVolume(e.target.value);
    });

    document.getElementById('tempo-slider').addEventListener('input', (e) => {
      this.setTempo(e.target.value);
    });

    document.getElementById('pitch-slider').addEventListener('input', (e) => {
      this.setPitch(e.target.value);
    });

    // Progress bar
    document.getElementById('progress-bar').addEventListener('input', (e) => {
      this.seek(e.target.value);
    });

    // Track controls
    document.getElementById('mute-all-btn').addEventListener('click', () => this.toggleMuteAll());

    // Playlist controls
    document.getElementById('clear-playlist-btn').addEventListener('click', () => this.clearPlaylist());

    // Export buttons
    document.getElementById('download-midi-btn').addEventListener('click', () => this.downloadMIDI());
    document.getElementById('export-audio-btn').addEventListener('click', () => this.exportAudio());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  },

  // Handle file uploads
  handleFiles(files) {
    const midiFiles = Array.from(files).filter(file => 
      file.name.toLowerCase().endsWith('.mid') || 
      file.name.toLowerCase().endsWith('.midi')
    );

    if (midiFiles.length === 0) {
      this.showNotification('Please select valid MIDI files', 'error');
      return;
    }

    // Add files to playlist
    midiFiles.forEach(file => {
      const fileData = {
        file: file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: this.formatFileSize(file.size)
      };
      this.state.playlist.push(fileData);
    });

    // Load first file if none loaded
    if (!this.state.currentFile) {
      this.loadFile(0);
    }

    this.updatePlaylist();
    this.showNotification(`Added ${midiFiles.length} file(s) to playlist`);
  },

  // Load a file from playlist
  loadFile(index) {
    if (index < 0 || index >= this.state.playlist.length) return;

    this.state.currentIndex = index;
    const fileData = this.state.playlist[index];
    this.state.currentFile = fileData;

    const player = document.getElementById('midi-player');
    const visualizer = document.getElementById('visualizer');

    player.src = fileData.url;
    visualizer.src = fileData.url;

    document.getElementById('file-name').textContent = fileData.name;
    document.getElementById('file-size').textContent = `Size: ${fileData.size}`;

    document.getElementById('upload-area').classList.add('hidden');
    document.getElementById('player-section').classList.remove('hidden');

    // Parse MIDI data
    this.parseMIDIData(fileData.file);

    this.showNotification(`Loaded: ${fileData.name}`);
  },

  // Parse MIDI file data
  async parseMIDIData(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const midi = await Magenta.midi.midiToNoteSequence(arrayBuffer);
      
      document.getElementById('file-duration').textContent = `Duration: ${this.formatTime(midi.totalTime)}`;
      document.getElementById('file-tracks').textContent = `Tracks: ${midi.notes ? new Set(midi.notes.map(n => n.program)).size : 0}`;
      
      if (midi.tempos && midi.tempos.length > 0) {
        document.getElementById('file-tempo').textContent = `Tempo: ${Math.round(midi.tempos[0].qpm)} BPM`;
      }

      this.extractTracks(midi);
    } catch (error) {
      console.error('Error parsing MIDI:', error);
      this.showNotification('Error parsing MIDI file', 'error');
    }
  },

  // Extract and display tracks
  extractTracks(midi) {
    if (!midi.notes) return;

    const trackMap = new Map();
    midi.notes.forEach(note => {
      const program = note.program || 0;
      if (!trackMap.has(program)) {
        trackMap.set(program, {
          program: program,
          instrument: this.getInstrumentName(program),
          noteCount: 0
        });
      }
      trackMap.get(program).noteCount++;
    });

    this.state.tracks = Array.from(trackMap.values());
    this.renderTracks();
  },

  // Render track list
  renderTracks() {
    const trackList = document.getElementById('track-list');
    
    if (this.state.tracks.length === 0) {
      trackList.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No tracks loaded</p>';
      return;
    }

    trackList.innerHTML = this.state.tracks.map((track, index) => `
      <div class="track-item flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div class="flex-1">
          <div class="font-medium text-sm">${track.instrument}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">${track.noteCount} notes</div>
        </div>
        <div class="flex items-center gap-2">
          <button class="solo-btn p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors" 
                  data-track="${index}" 
                  title="Solo">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
            </svg>
          </button>
          <button class="mute-btn p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors" 
                  data-track="${index}"
                  title="Mute">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" class="volume-on"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" class="volume-off hidden"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');

    // Attach event listeners
    trackList.querySelectorAll('.mute-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const trackIndex = parseInt(e.currentTarget.dataset.track);
        this.toggleMuteTrack(trackIndex);
      });
    });

    trackList.querySelectorAll('.solo-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const trackIndex = parseInt(e.currentTarget.dataset.track);
        this.soloTrack(trackIndex);
      });
    });
  },

  // Update playlist display
  updatePlaylist() {
    const playlist = document.getElementById('playlist');
    
    if (this.state.playlist.length === 0) {
      playlist.innerHTML = '<p class="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No files in playlist</p>';
      return;
    }

    playlist.innerHTML = this.state.playlist.map((file, index) => `
      <div class="flex items-center gap-2 p-3 ${index === this.state.currentIndex ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'} rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors"
           onclick="MIDIPlayer.loadFile(${index})">
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
        </svg>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium truncate">${file.name}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">${file.size}</div>
        </div>
        <button class="remove-playlist-item p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded" 
                onclick="event.stopPropagation(); MIDIPlayer.removeFromPlaylist(${index})">
          <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `).join('');
  },

  // Playback controls
  play() {
    const player = document.getElementById('midi-player');
    player.start();
    this.state.isPlaying = true;
    document.getElementById('play-btn').classList.add('hidden');
    document.getElementById('pause-btn').classList.remove('hidden');
    this.updateProgress();
  },

  pause() {
    const player = document.getElementById('midi-player');
    player.stop();
    this.state.isPlaying = false;
    document.getElementById('play-btn').classList.remove('hidden');
    document.getElementById('pause-btn').classList.add('hidden');
  },

  stop() {
    const player = document.getElementById('midi-player');
    player.stop();
    this.state.isPlaying = false;
    document.getElementById('play-btn').classList.remove('hidden');
    document.getElementById('pause-btn').classList.add('hidden');
    document.getElementById('current-time').textContent = '0:00';
    document.getElementById('progress-bar').value = 0;
  },

  previous() {
    if (this.state.playlist.length === 0) return;
    let prevIndex = this.state.currentIndex - 1;
    if (prevIndex < 0) prevIndex = this.state.playlist.length - 1;
    this.loadFile(prevIndex);
  },

  next() {
    if (this.state.playlist.length === 0) return;
    let nextIndex;
    
    if (this.state.isShuffling) {
      nextIndex = Math.floor(Math.random() * this.state.playlist.length);
    } else {
      nextIndex = (this.state.currentIndex + 1) % this.state.playlist.length;
    }
    
    this.loadFile(nextIndex);
  },

  toggleLoop() {
    this.state.isLooping = !this.state.isLooping;
    const btn = document.getElementById('loop-btn');
    btn.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
      Loop: ${this.state.isLooping ? 'On' : 'Off'}
    `;
    if (this.state.isLooping) {
      btn.classList.add('bg-blue-600', 'text-white');
      btn.classList.remove('bg-gray-200', 'dark:bg-gray-700');
    } else {
      btn.classList.remove('bg-blue-600', 'text-white');
      btn.classList.add('bg-gray-200', 'dark:bg-gray-700');
    }
  },

  toggleShuffle() {
    this.state.isShuffling = !this.state.isShuffling;
    const btn = document.getElementById('shuffle-btn');
    btn.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
      </svg>
      Shuffle: ${this.state.isShuffling ? 'On' : 'Off'}
    `;
    if (this.state.isShuffling) {
      btn.classList.add('bg-blue-600', 'text-white');
      btn.classList.remove('bg-gray-200', 'dark:bg-gray-700');
    } else {
      btn.classList.remove('bg-blue-600', 'text-white');
      btn.classList.add('bg-gray-200', 'dark:bg-gray-700');
    }
  },

  // Audio settings
  setVolume(value) {
    this.state.volume = value;
    document.getElementById('volume-value').textContent = `${value}%`;
    // Apply volume to Tone.js
    if (window.Tone) {
      Tone.Master.volume.value = (value / 100) * 10 - 10;
    }
  },

  setTempo(value) {
    this.state.tempo = value;
    document.getElementById('tempo-value').textContent = `${value}%`;
    const player = document.getElementById('midi-player');
    if (player && player.player) {
      player.player.playbackRate = value / 100;
    }
  },

  setPitch(value) {
    this.state.pitch = value;
    document.getElementById('pitch-value').textContent = value;
    // Note: Pitch shifting requires more complex implementation
    this.showNotification(`Pitch: ${value > 0 ? '+' : ''}${value} semitones`);
  },

  seek(value) {
    const player = document.getElementById('midi-player');
    // Seeking implementation depends on player capabilities
  },

  // Track controls
  toggleMuteTrack(index) {
    if (this.state.mutedTracks.has(index)) {
      this.state.mutedTracks.delete(index);
    } else {
      this.state.mutedTracks.add(index);
    }
    this.showNotification(`Track ${index + 1} ${this.state.mutedTracks.has(index) ? 'muted' : 'unmuted'}`);
  },

  soloTrack(index) {
    this.state.mutedTracks.clear();
    this.state.tracks.forEach((_, i) => {
      if (i !== index) {
        this.state.mutedTracks.add(i);
      }
    });
    this.showNotification(`Soloed track ${index + 1}`);
  },

  toggleMuteAll() {
    if (this.state.mutedTracks.size === this.state.tracks.length) {
      this.state.mutedTracks.clear();
      this.showNotification('All tracks unmuted');
    } else {
      this.state.tracks.forEach((_, i) => this.state.mutedTracks.add(i));
      this.showNotification('All tracks muted');
    }
  },

  // Playlist management
  removeFromPlaylist(index) {
    this.state.playlist.splice(index, 1);
    if (index === this.state.currentIndex) {
      if (this.state.playlist.length > 0) {
        this.loadFile(Math.min(index, this.state.playlist.length - 1));
      } else {
        this.state.currentFile = null;
        document.getElementById('player-section').classList.add('hidden');
        document.getElementById('upload-area').classList.remove('hidden');
      }
    } else if (index < this.state.currentIndex) {
      this.state.currentIndex--;
    }
    this.updatePlaylist();
  },

  clearPlaylist() {
    if (confirm('Clear entire playlist?')) {
      this.state.playlist = [];
      this.state.currentFile = null;
      this.state.currentIndex = 0;
      this.updatePlaylist();
      document.getElementById('player-section').classList.add('hidden');
      document.getElementById('upload-area').classList.remove('hidden');
      this.showNotification('Playlist cleared');
    }
  },

  // Export functions
  downloadMIDI() {
    if (!this.state.currentFile) return;
    const a = document.createElement('a');
    a.href = this.state.currentFile.url;
    a.download = this.state.currentFile.name;
    a.click();
    this.showNotification('Download started');
  },

  exportAudio() {
    this.showNotification('Audio export feature coming soon!', 'info');
  },

  // Progress update
  updateProgress() {
    if (!this.state.isPlaying) return;
    
    const player = document.getElementById('midi-player');
    if (player && player.currentTime !== undefined && player.duration !== undefined) {
      const progress = (player.currentTime / player.duration) * 100;
      document.getElementById('progress-bar').value = progress;
      document.getElementById('current-time').textContent = this.formatTime(player.currentTime);
      document.getElementById('total-time').textContent = this.formatTime(player.duration);
    }

    requestAnimationFrame(() => this.updateProgress());
  },

  // Keyboard shortcuts
  handleKeyboard(e) {
    if (e.target.tagName === 'INPUT') return;

    switch(e.code) {
      case 'Space':
        e.preventDefault();
        if (this.state.isPlaying) this.pause();
        else this.play();
        break;
      case 'ArrowRight':
        this.next();
        break;
      case 'ArrowLeft':
        this.previous();
        break;
      case 'KeyL':
        this.toggleLoop();
        break;
      case 'KeyS':
        this.toggleShuffle();
        break;
    }
  },

  // Utility functions
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

  getInstrumentName(program) {
    const instruments = [
      'Acoustic Grand Piano', 'Bright Acoustic Piano', 'Electric Grand Piano', 'Honky-tonk Piano',
      'Electric Piano 1', 'Electric Piano 2', 'Harpsichord', 'Clavi',
      'Celesta', 'Glockenspiel', 'Music Box', 'Vibraphone', 'Marimba', 'Xylophone', 'Tubular Bells', 'Dulcimer'
    ];
    return instruments[program] || `Instrument ${program + 1}`;
  },

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'error' ? 'bg-red-500' : type === 'info' ? 'bg-blue-500' : 'bg-green-500'
    } text-white transform transition-all duration-300`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },

  showHelp() {
    const helpText = `
🎹 Keyboard Shortcuts:
• Space: Play/Pause
• ← →: Previous/Next track
• L: Toggle Loop
• S: Toggle Shuffle

📝 Features:
• Drag & drop MIDI files
• Multi-file playlist
• Track muting & soloing
• Tempo & pitch control
• Visual piano roll
• Export options
    `;
    alert(helpText);
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  MIDIPlayer.init();
});