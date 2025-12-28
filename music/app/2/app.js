// Main Application State
const MusicComposer = {
  // Current state
  state: {
    currentTool: 'note',
    currentDuration: 'quarter',
    currentAccidental: null,
    currentArticulation: null,
    isDotted: false,
    currentTuplet: null,
    tempo: 120,
    zoomLevel: 100,
    isDarkMode: false,
    notes: [],
    selectedNotes: []
  },

  // Initialize the application
  init() {
    this.loadTheme();
    this.initializeEventListeners();
    this.renderPalettes();
    this.renderStaff();
    console.log('%c🎵 Music Composer Initialized', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
    this.printKeyboardShortcuts();
  },

  // Load saved theme
  loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      this.state.isDarkMode = true;
    }
  },

  // Toggle theme
  toggleTheme() {
    document.documentElement.classList.toggle('dark');
    this.state.isDarkMode = !this.state.isDarkMode;
    localStorage.setItem('theme', this.state.isDarkMode ? 'dark' : 'light');
  },

  // Initialize event listeners
  initializeEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
      this.toggleTheme();
    });

    // Save button
    document.getElementById('save-btn').addEventListener('click', () => {
      this.saveScore();
    });

    // File menu
    document.getElementById('file-btn').addEventListener('click', (e) => {
      this.toggleFileMenu(e);
    });

    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectTool(btn.dataset.tool);
      });
    });

    // Note duration buttons
    document.querySelectorAll('.note-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectDuration(btn.dataset.duration);
      });
    });

    // Accidental buttons
    document.querySelectorAll('.accidental-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectAccidental(btn.dataset.accidental);
      });
    });

    // Articulation buttons
    document.querySelectorAll('.articulation-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectArticulation(btn.dataset.articulation);
      });
    });

    // Modifier buttons (dotted)
    document.querySelectorAll('[data-modifier]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.toggleModifier(btn.dataset.modifier);
      });
    });

    // Tuplet buttons
    document.querySelectorAll('[data-tuplet]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectTuplet(btn.dataset.tuplet);
      });
    });

    // Tempo input
    document.getElementById('tempo-input').addEventListener('change', (e) => {
      this.state.tempo = parseInt(e.target.value);
    });

    // Zoom controls
    document.getElementById('zoom-in').addEventListener('click', () => {
      this.zoom(10);
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
      this.zoom(-10);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });

    // Title editing
    this.makeEditable('score-title');
    this.makeEditable('score-subtitle');
  },

  // Select tool
  selectTool(tool) {
    this.state.currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });
  },

  // Select note duration
  selectDuration(duration) {
    this.state.currentDuration = duration;
    document.querySelectorAll('.note-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.duration === duration);
    });
  },

  // Select accidental
  selectAccidental(accidental) {
    if (this.state.currentAccidental === accidental) {
      this.state.currentAccidental = null;
      document.querySelectorAll('.accidental-btn').forEach(btn => {
        btn.classList.remove('active');
      });
    } else {
      this.state.currentAccidental = accidental;
      document.querySelectorAll('.accidental-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.accidental === accidental);
      });
    }
  },

  // Select articulation
  selectArticulation(articulation) {
    if (this.state.currentArticulation === articulation) {
      this.state.currentArticulation = null;
      document.querySelectorAll('.articulation-btn').forEach(btn => {
        btn.classList.remove('active');
      });
    } else {
      this.state.currentArticulation = articulation;
      document.querySelectorAll('.articulation-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.articulation === articulation);
      });
    }
  },

  // Toggle modifier (dotted)
  toggleModifier(modifier) {
    if (modifier === 'dotted') {
      this.state.isDotted = !this.state.isDotted;
      document.querySelectorAll('[data-modifier="dotted"]').forEach(btn => {
        btn.classList.toggle('active', this.state.isDotted);
      });
    }
  },

  // Select tuplet
  selectTuplet(tuplet) {
    if (this.state.currentTuplet === tuplet) {
      this.state.currentTuplet = null;
      document.querySelectorAll('[data-tuplet]').forEach(btn => {
        btn.classList.remove('active');
      });
    } else {
      this.state.currentTuplet = tuplet;
      document.querySelectorAll('[data-tuplet]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tuplet === tuplet);
      });
    }
  },

  // Zoom function
  zoom(delta) {
    this.state.zoomLevel = Math.max(50, Math.min(200, this.state.zoomLevel + delta));
    const container = document.getElementById('staff-container');
    container.style.transform = `scale(${this.state.zoomLevel / 100})`;
    document.getElementById('zoom-display').textContent = `Zoom: ${this.state.zoomLevel}%`;
  },

  // Handle keyboard shortcuts
  handleKeyboard(e) {
    // Space for play/pause
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      Playback.togglePlay();
    }

    // Numbers for note durations (1-8)
    if (e.key >= '1' && e.key <= '8') {
      const durations = ['double-whole', 'whole', 'half', 'quarter', 'eighth', 'sixteenth', 'thirty-second', 'sixty-fourth'];
      const duration = durations[parseInt(e.key) - 1];
      this.selectDuration(duration);
    }

    // Ctrl/Cmd + Plus for zoom in
    if ((e.ctrlKey || e.metaKey) && e.key === '+') {
      e.preventDefault();
      this.zoom(10);
    }

    // Ctrl/Cmd + Minus for zoom out
    if ((e.ctrlKey || e.metaKey) && e.key === '-') {
      e.preventDefault();
      this.zoom(-10);
    }

    // Ctrl/Cmd + 0 for reset zoom
    if ((e.ctrlKey || e.metaKey) && e.key === '0') {
      e.preventDefault();
      this.state.zoomLevel = 100;
      this.zoom(0);
    }

    // Delete key to remove selected notes
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (e.target.tagName !== 'INPUT') {
        e.preventDefault();
        this.deleteSelectedNotes();
      }
    }

    // Ctrl/Cmd + S for save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      this.saveScore();
    }
  },

  // Make element editable
  makeEditable(elementId) {
    const element = document.getElementById(elementId);
    element.addEventListener('dblclick', function() {
      const currentText = this.textContent;
      const input = document.createElement('input');
      input.type = 'text';
      input.value = currentText;
      input.className = this.className + ' bg-transparent border-b-2 border-blue-500 outline-none';
      
      this.textContent = '';
      this.appendChild(input);
      input.focus();
      input.select();
      
      const finishEdit = () => {
        element.textContent = input.value || currentText;
      };
      
      input.addEventListener('blur', finishEdit);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          finishEdit();
        }
      });
    });
  },

  // Toggle file menu
  toggleFileMenu(e) {
    const existingMenu = document.querySelector('.file-menu');
    if (existingMenu) {
      existingMenu.remove();
      return;
    }

    const menu = document.createElement('div');
    menu.className = 'file-menu';
    menu.innerHTML = `
      <button onclick="MusicComposer.newScore()">New Score</button>
      <button onclick="MusicComposer.openScore()">Open...</button>
      <button onclick="MusicComposer.saveScore()">Save</button>
      <button onclick="MusicComposer.saveAsScore()">Save As...</button>
      <hr>
      <button onclick="MusicComposer.exportPDF()">Export PDF</button>
      <button onclick="MusicComposer.exportMIDI()">Export MIDI</button>
    `;
    
    const fileBtn = document.getElementById('file-btn');
    fileBtn.parentElement.style.position = 'relative';
    fileBtn.parentElement.appendChild(menu);
    
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(event) {
        if (!menu.contains(event.target) && event.target !== fileBtn) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 0);
  },

  // Save score
  saveScore() {
    const scoreData = {
      title: document.getElementById('score-title').textContent,
      subtitle: document.getElementById('score-subtitle').textContent,
      tempo: this.state.tempo,
      notes: this.state.notes,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('musicComposerScore', JSON.stringify(scoreData));
    this.showNotification('✓ Score saved successfully!');
    console.log('Score saved:', scoreData);
  },

  // New score
  newScore() {
    if (confirm('Create a new score? Unsaved changes will be lost.')) {
      this.state.notes = [];
      this.state.selectedNotes = [];
      document.getElementById('score-title').textContent = 'Untitled Score';
      document.getElementById('score-subtitle').textContent = 'Subtitle';
      this.renderStaff();
      this.showNotification('New score created');
    }
  },

  // Open score
  openScore() {
    const saved = localStorage.getItem('musicComposerScore');
    if (saved) {
      const data = JSON.parse(saved);
      document.getElementById('score-title').textContent = data.title;
      document.getElementById('score-subtitle').textContent = data.subtitle;
      this.state.tempo = data.tempo;
      this.state.notes = data.notes || [];
      document.getElementById('tempo-input').value = data.tempo;
      this.renderStaff();
      this.showNotification('Score loaded');
    } else {
      this.showNotification('No saved score found', 'error');
    }
  },

  // Save As
  saveAsScore() {
    this.saveScore();
    this.showNotification('Score saved as...');
  },

  // Export PDF
  exportPDF() {
    this.showNotification('PDF export would generate here');
    console.log('Export PDF functionality');
  },

  // Export MIDI
  exportMIDI() {
    this.showNotification('MIDI export would generate here');
    console.log('Export MIDI functionality');
  },

  // Show notification
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.backgroundColor = type === 'error' ? '#ef4444' : '#10b981';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  },

  // Delete selected notes
  deleteSelectedNotes() {
    if (this.state.selectedNotes.length > 0) {
      this.state.notes = this.state.notes.filter(
        note => !this.state.selectedNotes.includes(note.id)
      );
      this.state.selectedNotes = [];
      this.renderStaff();
      this.showNotification(`${this.state.selectedNotes.length} note(s) deleted`);
    }
  },

  // Print keyboard shortcuts
  printKeyboardShortcuts() {
    console.log('%cKeyboard Shortcuts:', 'color: #8b5cf6; font-size: 14px; font-weight: bold;');
    console.log('Space: Play/Pause');
    console.log('1-5: Select note duration');
    console.log('Ctrl/Cmd + Plus: Zoom in');
    console.log('Ctrl/Cmd + Minus: Zoom out');
    console.log('Ctrl/Cmd + 0: Reset zoom');
    console.log('Ctrl/Cmd + S: Save');
    console.log('Delete/Backspace: Delete selected notes');
    console.log('%cDouble-click title to edit', 'color: #10b981; font-style: italic;');
  },

  // Render palettes (handled in ui.js)
  renderPalettes() {
    UI.renderPalettes();
  },

  // Render staff (handled in score.js)
  renderStaff() {
    Score.render();
  }
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MusicComposer.init());
} else {
  MusicComposer.init();
}