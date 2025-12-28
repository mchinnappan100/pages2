// MIDI Player Application
const MIDIPlayer = {
  // State
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
    mutedTracks: new Set(),
    isRecording: false,
    mediaRecorder: null,
    recordedChunks: []
  },

  // Initialize the application
  init() {
    this.loadTheme();
    
    // Wait for components to be ready
    customElements.whenDefined('midi-player').then(() => {
      customElements.whenDefined('midi-visualizer').then(() => {
        this.setupEventListeners();
        console.log('🎹 MIDI Player initialized');
      });
    }).catch(err => {
      console.warn('Component loading issue:', err);
      this.setupEventListeners();
      console.log('🎹 MIDI Player initialized (with warnings)');
    });
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

    // Wait for player to be ready
    if (!player.ns) {
      setTimeout(() => {
        player.addVisualizer(visualizer);
      }, 100);
    } else {
      player.addVisualizer(visualizer);
    }

    player.src = fileData.url;

    document.getElementById('file-name').textContent = fileData.name;
    document.getElementById('file-size').textContent = `Size: ${fileData.size}`;

    document.getElementById('upload-area').classList.add('hidden');
    document.getElementById('player-section').classList.remove('hidden');

    // Parse MIDI data
    this.parseMIDIData(fileData.file);

    // Setup player event listeners
    this.setupPlayerEvents(player);

    this.showNotification(`Loaded: ${fileData.name}`);
  },

  // Setup player event listeners
  setupPlayerEvents(player) {
    // Remove old listeners
    player.removeEventListener('start', this.onPlayerStart);
    player.removeEventListener('stop', this.onPlayerStop);
    player.removeEventListener('loop', this.onPlayerLoop);

    // Add new listeners
    this.onPlayerStart = () => {
      this.state.isPlaying = true;
      document.getElementById('play-btn').classList.add('hidden');
      document.getElementById('pause-btn').classList.remove('hidden');
      this.updateProgress();
    };

    this.onPlayerStop = () => {
      this.state.isPlaying = false;
      document.getElementById('play-btn').classList.remove('hidden');
      document.getElementById('pause-btn').classList.add('hidden');
      
      // Auto-advance to next track if not looping
      if (!this.state.isLooping && this.state.playlist.length > 1) {
        setTimeout(() => this.next(), 500);
      }
    };

    this.onPlayerLoop = () => {
      if (this.state.isLooping) {
        player.start();
      }
    };

    player.addEventListener('start', this.onPlayerStart);
    player.addEventListener('stop', this.onPlayerStop);
    player.addEventListener('loop', this.onPlayerLoop);
  },

  // Parse MIDI file data
  async parseMIDIData(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Use MidiParser instead of Magenta
      const uint8Array = new Uint8Array(arrayBuffer);
      const midi = MidiParser.parse(uint8Array);
      
      if (!midi || !midi.track) {
        throw new Error('Invalid MIDI file');
      }

      // Calculate duration
      let duration = 0;
      let tempo = 120; // Default tempo
      
      midi.track.forEach(track => {
        track.event.forEach(event => {
          if (event.type === 'meta' && event.metaType === 81) {
            // Tempo event
            tempo = 60000000 / event.data;
          }
          if (event.deltaTime) {
            duration += event.deltaTime;
          }
        });
      });

      // Convert ticks to seconds
      const ticksPerBeat = midi.timeDivision || 480;
      const durationSeconds = (duration / ticksPerBeat) * (60 / tempo);
      
      document.getElementById('file-duration').textContent = `Duration: ${this.formatTime(durationSeconds)}`;
      document.getElementById('file-tracks').textContent = `Tracks: ${midi.track.length}`;
      document.getElementById('file-tempo').textContent = `Tempo: ${Math.round(tempo)} BPM`;

      this.extractTracksFromMidi(midi);
    } catch (error) {
      console.error('Error parsing MIDI:', error);
      // Don't show error, just use basic file info
      document.getElementById('file-duration').textContent = 'Duration: --';
      document.getElementById('file-tracks').textContent = 'Tracks: --';
      document.getElementById('file-tempo').textContent = 'Tempo: --';
    }
  },

  // Extract tracks from parsed MIDI
  extractTracksFromMidi(midi) {
    const trackMap = new Map();
    
    midi.track.forEach((track, trackIndex) => {
      track.event.forEach(event => {
        if (event.type === 9) { // Note On
          const channel = event.channel || 0;
          if (!trackMap.has(trackIndex)) {
            trackMap.set(trackIndex, {
              program: channel,
              instrument: `Track ${trackIndex + 1}`,
              noteCount: 0
            });
          }
          trackMap.get(trackIndex).noteCount++;
        }
        if (event.type === 12) { // Program Change
          if (trackMap.has(trackIndex)) {
            trackMap.get(trackIndex).instrument = this.getInstrumentName(event.data);
          }
        }
      });
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
    try {
      player.start();
      this.state.isPlaying = true;
      document.getElementById('play-btn').classList.add('hidden');
      document.getElementById('pause-btn').classList.remove('hidden');
      this.updateProgress();
    } catch (error) {
      console.error('Play error:', error);
      this.showNotification('Unable to play MIDI file', 'error');
    }
  },

  pause() {
    const player = document.getElementById('midi-player');
    try {
      player.stop();
      this.state.isPlaying = false;
      document.getElementById('play-btn').classList.remove('hidden');
      document.getElementById('pause-btn').classList.add('hidden');
    } catch (error) {
      console.error('Pause error:', error);
    }
  },

  stop() {
    const player = document.getElementById('midi-player');
    try {
      player.stop();
      this.state.isPlaying = false;
      document.getElementById('play-btn').classList.remove('hidden');
      document.getElementById('pause-btn').classList.add('hidden');
      document.getElementById('current-time').textContent = '0:00';
      document.getElementById('progress-bar').value = 0;
    } catch (error) {
      console.error('Stop error:', error);
    }
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
    if (!this.state.currentFile) {
      this.showNotification('No file loaded', 'error');
      return;
    }

    this.showNotification('Preparing audio export...', 'info');
    
    // Create modal for export options
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h3 class="text-2xl font-bold mb-4">Export Audio</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          This will play your MIDI file and record it as audio. The recording will start automatically.
        </p>
        
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium mb-2">Export Format</label>
            <select id="export-format" class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <option value="webm">WebM (recommended)</option>
              <option value="wav">WAV (if supported)</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Quality</label>
            <select id="export-quality" class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <option value="high">High Quality</option>
              <option value="medium" selected>Medium Quality</option>
              <option value="low">Low Quality (smaller file)</option>
            </select>
          </div>
        </div>

        <div id="recording-status" class="hidden mb-4 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            <span class="font-medium">Recording in progress...</span>
          </div>
          <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span id="recording-time">0:00</span> / <span id="recording-total">0:00</span>
          </div>
        </div>
        
        <div class="flex gap-3">
          <button id="cancel-export" class="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors">
            Cancel
          </button>
          <button id="start-export" class="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
            Start Export
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);

    // Handle cancel
    modal.querySelector('#cancel-export').addEventListener('click', () => {
      if (this.state.isRecording) {
        this.stopRecording();
      }
      modal.remove();
    });

    // Handle start export
    modal.querySelector('#start-export').addEventListener('click', () => {
      const format = modal.querySelector('#export-format').value;
      const quality = modal.querySelector('#export-quality').value;
      this.startAudioExport(modal, format, quality);
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal && !this.state.isRecording) {
        modal.remove();
      }
    });
  },

  async startAudioExport(modal, format, quality) {
    try {
      // Show recording status
      modal.querySelector('#recording-status').classList.remove('hidden');
      modal.querySelector('#start-export').disabled = true;
      modal.querySelector('#start-export').classList.add('opacity-50', 'cursor-not-allowed');

      // Wait for Tone.js to be ready
      await Tone.start();

      // Setup audio context and destination
      if (!Tone.context) {
        throw new Error('Audio context not available');
      }

      // Create a MediaStreamDestination
      const dest = Tone.context.createMediaStreamDestination();
      
      // Connect Tone.js output to our destination
      Tone.getDestination().connect(dest);

      // Determine bitrate based on quality
      const bitrates = {
        high: 256000,
        medium: 128000,
        low: 64000
      };

      // Setup MediaRecorder
      const mimeType = format === 'wav' ? 'audio/wav' : 'audio/webm';
      const options = {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'audio/webm',
        audioBitsPerSecond: bitrates[quality]
      };

      this.state.mediaRecorder = new MediaRecorder(dest.stream, options);
      this.state.recordedChunks = [];

      this.state.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.state.recordedChunks.push(e.data);
        }
      };

      this.state.mediaRecorder.onstop = () => {
        this.finalizeAudioExport(modal, format);
      };

      // Start recording
      this.state.mediaRecorder.start(100); // Capture in 100ms chunks
      this.state.isRecording = true;

      // Start playback
      this.stop(); // Reset first
      await new Promise(resolve => setTimeout(resolve, 200));
      this.play();

      // Update recording time
      let recordingDuration = 0;
      const updateTimer = setInterval(() => {
        recordingDuration += 0.1;
        modal.querySelector('#recording-time').textContent = this.formatTime(recordingDuration);
        
        // Auto-stop when playback ends
        if (!this.state.isPlaying && recordingDuration > 1) {
          clearInterval(updateTimer);
          setTimeout(() => this.stopRecording(), 500);
        }
      }, 100);

      // Fallback: stop after 5 minutes max
      setTimeout(() => {
        if (this.state.isRecording) {
          clearInterval(updateTimer);
          this.stopRecording();
        }
      }, 300000);

    } catch (error) {
      console.error('Export error:', error);
      this.showNotification('Failed to export audio: ' + error.message, 'error');
      modal.remove();
    }
  },

  stopRecording() {
    if (this.state.mediaRecorder && this.state.isRecording) {
      this.state.mediaRecorder.stop();
      this.state.isRecording = false;
      this.pause(); // Stop playback
    }
  },

  finalizeAudioExport(modal, format) {
    try {
      // Create blob from recorded chunks
      const blob = new Blob(this.state.recordedChunks, {
        type: format === 'wav' ? 'audio/wav' : 'audio/webm'
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = this.state.currentFile.name.replace(/\.(mid|midi)$/i, '');
      a.download = `${fileName}_export.${format === 'wav' ? 'wav' : 'webm'}`;
      a.click();

      // Cleanup
      URL.revokeObjectURL(url);
      modal.remove();

      this.showNotification('Audio exported successfully!');
    } catch (error) {
      console.error('Finalize error:', error);
      this.showNotification('Failed to save audio file', 'error');
      modal.remove();
    }
  },

  // Progress update
  updateProgress() {
    if (!this.state.isPlaying) return;
    
    const player = document.getElementById('midi-player');
    
    try {
      if (player && player.currentTime !== undefined && player.duration !== undefined) {
        const current = player.currentTime || 0;
        const duration = player.duration || 1;
        const progress = (current / duration) * 100;
        
        document.getElementById('progress-bar').value = progress;
        document.getElementById('current-time').textContent = this.formatTime(current);
        document.getElementById('total-time').textContent = this.formatTime(duration);
      }
    } catch (error) {
      // Silently handle timing errors
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
      'Celesta', 'Glockenspiel', 'Music Box', 'Vibraphone', 'Marimba', 'Xylophone', 'Tubular Bells', 'Dulcimer',
      'Drawbar Organ', 'Percussive Organ', 'Rock Organ', 'Church Organ', 'Reed Organ', 'Accordion', 'Harmonica', 'Tango Accordion',
      'Acoustic Guitar (nylon)', 'Acoustic Guitar (steel)', 'Electric Guitar (jazz)', 'Electric Guitar (clean)',
      'Electric Guitar (muted)', 'Overdriven Guitar', 'Distortion Guitar', 'Guitar Harmonics',
      'Acoustic Bass', 'Electric Bass (finger)', 'Electric Bass (pick)', 'Fretless Bass',
      'Slap Bass 1', 'Slap Bass 2', 'Synth Bass 1', 'Synth Bass 2',
      'Violin', 'Viola', 'Cello', 'Contrabass', 'Tremolo Strings', 'Pizzicato Strings', 'Orchestral Harp', 'Timpani',
      'String Ensemble 1', 'String Ensemble 2', 'Synth Strings 1', 'Synth Strings 2',
      'Choir Aahs', 'Voice Oohs', 'Synth Choir', 'Orchestra Hit',
      'Trumpet', 'Trombone', 'Tuba', 'Muted Trumpet', 'French Horn', 'Brass Section', 'Synth Brass 1', 'Synth Brass 2',
      'Soprano Sax', 'Alto Sax', 'Tenor Sax', 'Baritone Sax', 'Oboe', 'English Horn', 'Bassoon', 'Clarinet',
      'Piccolo', 'Flute', 'Recorder', 'Pan Flute', 'Blown bottle', 'Shakuhachi', 'Whistle', 'Ocarina',
      'Lead 1 (square)', 'Lead 2 (sawtooth)', 'Lead 3 (calliope)', 'Lead 4 (chiff)',
      'Lead 5 (charang)', 'Lead 6 (voice)', 'Lead 7 (fifths)', 'Lead 8 (bass + lead)',
      'Pad 1 (new age)', 'Pad 2 (warm)', 'Pad 3 (polysynth)', 'Pad 4 (choir)',
      'Pad 5 (bowed)', 'Pad 6 (metallic)', 'Pad 7 (halo)', 'Pad 8 (sweep)',
      'FX 1 (rain)', 'FX 2 (soundtrack)', 'FX 3 (crystal)', 'FX 4 (atmosphere)',
      'FX 5 (brightness)', 'FX 6 (goblins)', 'FX 7 (echoes)', 'FX 8 (sci-fi)',
      'Sitar', 'Banjo', 'Shamisen', 'Koto', 'Kalimba', 'Bagpipe', 'Fiddle', 'Shanai',
      'Tinkle Bell', 'Agogo', 'Steel Drums', 'Woodblock', 'Taiko Drum', 'Melodic Tom', 'Synth Drum', 'Reverse Cymbal',
      'Guitar Fret Noise', 'Breath Noise', 'Seashore', 'Bird Tweet', 'Telephone Ring', 'Helicopter', 'Applause', 'Gunshot'
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