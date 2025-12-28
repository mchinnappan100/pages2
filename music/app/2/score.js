// Score Module - Handles music notation rendering
const Score = {
  // Score properties
  properties: {
    clef: 'treble',
    keySignature: 'C',
    timeSignature: '4/4',
    measures: 8,
    systemCount: 2,
    measureWidth: 180
  },

  // Note duration values (in quarter note beats)
  noteDurationValues: {
    'double-whole': 8,
    'whole': 4,
    'half': 2,
    'quarter': 1,
    'eighth': 0.5,
    'sixteenth': 0.25,
    'thirty-second': 0.125,
    'sixty-fourth': 0.0625,
    'quarter-rest': 1,
    'eighth-rest': 0.5
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
    const measureWidth = this.properties.measureWidth;
    for (let i = 0; i <= this.properties.measures; i++) {
      const x = 110 + (i * measureWidth);
      const barLine = this.createLine(x, 40, x, 120);
      barLine.setAttribute('stroke-width', i === 0 || i === this.properties.measures ? '2' : '1.5');
      barLine.setAttribute('data-measure', i);
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
  createNote(x, y, duration = 'quarter', isDotted = false) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'note-group');
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '6');
    circle.setAttribute('class', 'note-head');
    
    // Determine if note should be filled
    const isFilled = !['whole', 'double-whole', 'half'].includes(duration);
    if (!isFilled) {
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', 'currentColor');
      circle.setAttribute('stroke-width', '2');
    }
    
    // Add stem for non-whole notes
    if (duration !== 'whole' && duration !== 'double-whole') {
      const stem = this.createLine(x + 6, y, x + 6, y - 40);
      stem.setAttribute('stroke-width', '2');
      group.appendChild(stem);
    }
    
    // Add flags for eighth, sixteenth, etc.
    if (['eighth', 'sixteenth', 'thirty-second', 'sixty-fourth'].includes(duration)) {
      const flagCount = {
        'eighth': 1,
        'sixteenth': 2,
        'thirty-second': 3,
        'sixty-fourth': 4
      }[duration];
      
      for (let i = 0; i < flagCount; i++) {
        const flag = this.createFlag(x + 6, y - 40 + (i * 5), duration);
        group.appendChild(flag);
      }
    }
    
    // Add dot for dotted notes
    if (isDotted) {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', x + 12);
      dot.setAttribute('cy', y);
      dot.setAttribute('r', '2');
      dot.setAttribute('class', 'note-head');
      group.appendChild(dot);
    }
    
    group.appendChild(circle);
    return group;
  },

  // Create flag for eighth/sixteenth notes
  createFlag(x, y, duration) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const flagPath = duration === 'eighth' 
      ? `M ${x} ${y} Q ${x + 8} ${y + 5} ${x + 10} ${y + 15}`
      : `M ${x} ${y} Q ${x + 8} ${y + 5} ${x + 10} ${y + 15}`;
    
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
      const noteElement = this.createNote(note.x, note.y, note.duration, note.isDotted);
      noteElement.dataset.noteId = note.id;
      
      // Add tooltip
      this.addNoteTooltip(noteElement, note);
      
      svg.appendChild(noteElement);
      
      // Add click listener
      const noteHead = noteElement.querySelector('.note-head');
      noteHead.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleNoteClick(e, noteHead, note);
      });
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

    // Note selection - get notes from state to include note data
    document.querySelectorAll('.note-head').forEach(noteHead => {
      const noteGroup = noteHead.closest('.note-group');
      const noteId = noteGroup.dataset.noteId;
      const note = MusicComposer.state.notes.find(n => n.id == noteId);
      
      noteHead.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleNoteClick(e, noteHead, note);
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
    
    // Determine which measure this click is in
    const measureIndex = this.getMeasureFromX(x);
    
    if (measureIndex === -1) {
      MusicComposer.showNotification('Click within a measure', 'error');
      return;
    }
    
    // Check if measure has capacity
    const duration = MusicComposer.state.currentDuration;
    const isDotted = MusicComposer.state.isDotted;
    const systemIndex = parseInt(svg.dataset.system);
    
    const capacityCheck = this.canAddNoteToMeasure(measureIndex, systemIndex, duration, isDotted);
    if (!capacityCheck.canAdd) {
      MusicComposer.showNotification(`Measure ${measureIndex + 1} is full (${capacityCheck.currentBeats}/${capacityCheck.capacity} beats)`, 'error');
      return;
    }
    
    // Snap X to position within measure based on current beats
    const measureStart = 110 + (measureIndex * this.properties.measureWidth);
    const availableWidth = this.properties.measureWidth - 20; // Leave space for bar lines
    const xPositionInMeasure = measureStart + 10 + (capacityCheck.currentBeats / capacityCheck.capacity) * availableWidth;
    
    // Create note object
    const note = {
      id: Date.now() + Math.random(),
      x: xPositionInMeasure,
      y: snappedY,
      duration: duration,
      isDotted: isDotted,
      accidental: MusicComposer.state.currentAccidental,
      articulation: MusicComposer.state.currentArticulation,
      tuplet: MusicComposer.state.currentTuplet,
      system: systemIndex,
      measure: measureIndex,
      noteName: this.getNoteNameFromY(snappedY, svg.dataset.clef)
    };
    
    MusicComposer.state.notes.push(note);
    
    // Create and append note element
    const noteElement = this.createNote(xPositionInMeasure, snappedY, note.duration, isDotted);
    noteElement.dataset.noteId = note.id;
    
    // Add tooltip
    this.addNoteTooltip(noteElement, note);
    
    svg.appendChild(noteElement);
    
    // Add click listener to new note
    const noteHead = noteElement.querySelector('.note-head');
    noteHead.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleNoteClick(e, noteHead, note);
    });
    
    // Visual feedback
    noteHead.style.opacity = '0';
    setTimeout(() => {
      noteHead.style.opacity = '1';
    }, 10);
    
    console.log('Note added:', note);
  },

  // Get measure index from X position
  getMeasureFromX(x) {
    const measureStart = 110;
    const measureWidth = this.properties.measureWidth;
    
    if (x < measureStart) return -1;
    
    const measureIndex = Math.floor((x - measureStart) / measureWidth);
    
    if (measureIndex >= this.properties.measures) return -1;
    
    return measureIndex;
  },

  // Check if note can be added to measure
  canAddNoteToMeasure(measureIndex, systemIndex, duration, isDotted) {
    // Get time signature capacity
    const [beatsPerMeasure, beatUnit] = this.properties.timeSignature.split('/').map(Number);
    const measureCapacity = beatsPerMeasure * (4 / beatUnit); // Convert to quarter note beats
    
    // Calculate current measure usage
    const notesInMeasure = MusicComposer.state.notes.filter(
      note => note.measure === measureIndex && note.system === systemIndex
    );
    
    let currentBeats = 0;
    notesInMeasure.forEach(note => {
      let noteValue = this.noteDurationValues[note.duration] || 1;
      if (note.isDotted) {
        noteValue *= 1.5; // Dotted notes are 1.5x their normal value
      }
      currentBeats += noteValue;
    });
    
    // Calculate new note value
    let newNoteValue = this.noteDurationValues[duration] || 1;
    if (isDotted) {
      newNoteValue *= 1.5;
    }
    
    // Check if there's room
    const canAdd = (currentBeats + newNoteValue) <= measureCapacity;
    
    return {
      canAdd: canAdd,
      currentBeats: currentBeats,
      capacity: measureCapacity,
      remaining: measureCapacity - currentBeats
    };
  },

  // Handle note click for selection and playback
  handleNoteClick(e, noteHead, note) {
    const noteGroup = noteHead.closest('.note-group');
    const noteId = noteGroup.dataset.noteId;
    
    // Play the note sound
    if (note) {
      const frequency = this.getFrequencyFromNoteName(note.noteName);
      let duration = Playback.noteDurations[note.duration] || 500;
      if (note.isDotted) {
        duration *= 1.5;
      }
      Playback.playNoteSound(frequency, duration);
    }
    
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
  },

  // Get note name from Y position
  getNoteNameFromY(y, clef) {
    const linePosition = Math.round((y - 40) / 10);
    
    if (clef === 'treble') {
      const trebleNotes = ['F6', 'E6', 'D6', 'C6', 'B5', 'A5', 'G5', 'F5', 'E5', 'D5', 'C5', 'B4', 'A4'];
      return trebleNotes[linePosition] || 'C5';
    } else {
      const bassNotes = ['A4', 'G4', 'F4', 'E4', 'D4', 'C4', 'B3', 'A3', 'G3', 'F3', 'E3', 'D3', 'C3'];
      return bassNotes[linePosition] || 'E3';
    }
  },

  // Get frequency from note name
  getFrequencyFromNoteName(noteName) {
    const noteFrequencies = {
      'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
      'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91
    };
    return noteFrequencies[noteName] || 440;
  },

  // Add tooltip to note
  addNoteTooltip(noteElement, note) {
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    
    // Format duration name
    const durationName = note.duration.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const dottedText = note.isDotted ? ' (Dotted)' : '';
    const beats = this.noteDurationValues[note.duration] * (note.isDotted ? 1.5 : 1);
    
    title.textContent = `${note.noteName} - ${durationName}${dottedText}\nMeasure ${note.measure + 1}\n${beats} beat${beats !== 1 ? 's' : ''}\nClick to play`;
    
    noteElement.appendChild(title);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Score;
}