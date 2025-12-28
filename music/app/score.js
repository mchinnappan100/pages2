// Score Module - Handles music notation rendering
const Score = {
  // Score properties
  properties: {
    clef: 'treble',
    keySignature: 'C',
    timeSignature: '4/4',
    measures: 8,
    systemCount: 2
  },

  // Note positions on staff (line numbers, 0 = top line)
  notePositions: {
    treble: {
      'C5': 0, 'D5': 1, 'E5': 2, 'F5': 3, 'G5': 4,
      'A5': 5, 'B5': 6, 'C6': 7, 'D6': 8, 'E6': 9
    },
    bass: {
      'E3': 0, 'F3': 1, 'G3': 2, 'A3': 3, 'B3': 4,
      'C4': 5, 'D4': 6, 'E4': 7, 'F4': 8, 'G4': 9
    }
  },

  // Render the complete score
  render() {
    const container = document.getElementById('staff-container');
    container.innerHTML = '';

    for (let i = 0; i < this.properties.systemCount; i++) {
      const system = this.createSystem(i);
      container.appendChild(system);
    }

    this.attachStaffListeners();
  },

  // Create a system (staff system)
  createSystem(index) {
    const div = document.createElement('div');
    div.className = 'relative';
    div.dataset.system = index;

    const clefType = index === 0 ? 'treble' : 'bass';
    const svg = this.createStaffSVG(clefType, index);
    
    div.appendChild(svg);
    return div;
  },

  // Create staff SVG
  createStaffSVG(clefType, systemIndex) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '200');
    svg.setAttribute('class', 'text-gray-800 dark:text-gray-300 staff-svg');
    svg.dataset.clef = clefType;
    svg.dataset.system = systemIndex;

    // Create staff lines
    for (let i = 0; i < 5; i++) {
      const line = this.createLine(0, 40 + i * 20, '100%', 40 + i * 20);
      svg.appendChild(line);
    }

    // Add clef
    const clef = this.createClef(clefType);
    svg.appendChild(clef);

    // Add time signature
    const timeSig = this.createTimeSignature(this.properties.timeSignature);
    timeSig.forEach(element => svg.appendChild(element));

    // Add bar lines
    const measureWidth = 180;
    for (let i = 0; i <= this.properties.measures; i++) {
      const x = 110 + (i * measureWidth);
      const barLine = this.createLine(x, 40, x, 120);
      barLine.setAttribute('stroke-width', i === 0 || i === this.properties.measures ? '2' : '1.5');
      svg.appendChild(barLine);
    }

    // Render existing notes for this system
    this.renderNotesForSystem(svg, systemIndex);

    return svg;
  },

  // Create SVG line
  createLine(x1, y1, x2, y2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', 'staff-line');
    return line;
  },

  // Create clef symbol
  createClef(type) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '10');
    text.setAttribute('font-size', type === 'treble' ? '80' : '60');
    text.setAttribute('class', 'fill-current');
    
    if (type === 'treble') {
      text.setAttribute('y', '105');
      text.textContent = '𝄞';
    } else if (type === 'bass') {
      text.setAttribute('y', '108');
      text.textContent = '𝄢';
    } else {
      text.setAttribute('y', '105');
      text.textContent = '𝄡';
    }
    
    return text;
  },

  // Create time signature
  createTimeSignature(timeSig) {
    const [upper, lower] = timeSig.split('/');
    const elements = [];
    
    const upperText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    upperText.setAttribute('x', '85');
    upperText.setAttribute('y', '70');
    upperText.setAttribute('font-size', '32');
    upperText.setAttribute('font-weight', 'bold');
    upperText.setAttribute('class', 'fill-current');
    upperText.textContent = upper;
    elements.push(upperText);
    
    const lowerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lowerText.setAttribute('x', '85');
    lowerText.setAttribute('y', '110');
    lowerText.setAttribute('font-size', '32');
    lowerText.setAttribute('font-weight', 'bold');
    lowerText.setAttribute('class', 'fill-current');
    lowerText.textContent = lower;
    elements.push(lowerText);
    
    return elements;
  },

  // Create note
  createNote(x, y, duration = 'quarter') {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'note-group');
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '6');
    circle.setAttribute('class', 'note-head');
    
    // Add stem for non-whole notes
    if (duration !== 'whole') {
      const stem = this.createLine(x + 6, y, x + 6, y - 40);
      stem.setAttribute('stroke-width', '2');
      group.appendChild(stem);
    }
    
    // Add flags for eighth and sixteenth notes
    if (duration === 'eighth' || duration === 'sixteenth') {
      const flag = this.createFlag(x + 6, y - 40, duration);
      group.appendChild(flag);
    }
    
    group.appendChild(circle);
    return group;
  },

  // Create flag for eighth/sixteenth notes
  createFlag(x, y, duration) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const flagPath = duration === 'eighth' 
      ? `M ${x} ${y} Q ${x + 8} ${y + 5} ${x + 10} ${y + 15}`
      : `M ${x} ${y} Q ${x + 8} ${y + 5} ${x + 10} ${y + 15} M ${x} ${y + 5} Q ${x + 8} ${y + 10} ${x + 10} ${y + 20}`;
    
    path.setAttribute('d', flagPath);
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    
    return path;
  },

  // Render notes for a specific system
  renderNotesForSystem(svg, systemIndex) {
    const systemNotes = MusicComposer.state.notes.filter(note => note.system === systemIndex);
    
    systemNotes.forEach(note => {
      const noteElement = this.createNote(note.x, note.y, note.duration);
      noteElement.dataset.noteId = note.id;
      svg.appendChild(noteElement);
    });
  },

  // Attach staff interaction listeners
  attachStaffListeners() {
    document.querySelectorAll('.staff-svg').forEach(svg => {
      svg.addEventListener('click', (e) => {
        if (MusicComposer.state.currentTool === 'note') {
          this.handleStaffClick(e, svg);
        }
      });
    });

    // Note selection
    document.querySelectorAll('.note-head').forEach(noteHead => {
      noteHead.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleNoteClick(e, noteHead);
      });
    });
  },

  // Handle staff click to add note
  handleStaffClick(e, svg) {
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Snap to nearest staff line or space
    const snappedY = Math.round((y - 40) / 10) * 10 + 40;
    
    // Create note object
    const note = {
      id: Date.now() + Math.random(),
      x: x,
      y: snappedY,
      duration: MusicComposer.state.currentDuration,
      accidental: MusicComposer.state.currentAccidental,
      articulation: MusicComposer.state.currentArticulation,
      system: parseInt(svg.dataset.system)
    };
    
    MusicComposer.state.notes.push(note);
    
    // Create and append note element
    const noteElement = this.createNote(x, snappedY, note.duration);
    noteElement.dataset.noteId = note.id;
    svg.appendChild(noteElement);
    
    // Add click listener to new note
    const noteHead = noteElement.querySelector('.note-head');
    noteHead.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleNoteClick(e, noteHead);
    });
    
    // Visual feedback
    noteHead.style.opacity = '0';
    setTimeout(() => {
      noteHead.style.opacity = '1';
    }, 10);
    
    console.log('Note added:', note);
  },

  // Handle note click for selection
  handleNoteClick(e, noteHead) {
    const noteGroup = noteHead.closest('.note-group');
    const noteId = noteGroup.dataset.noteId;
    
    // Toggle selection
    if (noteHead.classList.contains('selected')) {
      noteHead.classList.remove('selected');
      MusicComposer.state.selectedNotes = MusicComposer.state.selectedNotes.filter(id => id !== noteId);
    } else {
      if (!e.shiftKey) {
        // Clear other selections if not holding shift
        document.querySelectorAll('.note-head.selected').forEach(n => n.classList.remove('selected'));
        MusicComposer.state.selectedNotes = [];
      }
      noteHead.classList.add('selected');
      MusicComposer.state.selectedNotes.push(noteId);
    }
    
    console.log('Selected notes:', MusicComposer.state.selectedNotes);
  },

  // Set clef
  setClef(clef) {
    this.properties.clef = clef;
    this.render();
    MusicComposer.showNotification(`Clef changed to ${clef}`);
  },

  // Set key signature
  setKeySignature(key) {
    this.properties.keySignature = key;
    this.render();
    MusicComposer.showNotification(`Key signature: ${key}`);
  },

  // Set time signature
  setTimeSignature(time) {
    this.properties.timeSignature = time;
    this.render();
    MusicComposer.showNotification(`Time signature: ${time}`);
  },

  // Add dynamic marking
  addDynamic(dynamic) {
    MusicComposer.showNotification(`Dynamic ${dynamic} would be added to selected notes`);
    console.log('Add dynamic:', dynamic);
  },

  // Add tempo marking
  addTempoMarking(tempo) {
    MusicComposer.showNotification(`Tempo marking: ${tempo}`);
    console.log('Add tempo:', tempo);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Score;
}