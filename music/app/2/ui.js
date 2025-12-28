// UI Module - Handles rendering of UI components
const UI = {
  // Render left sidebar palettes
  renderPalettes() {
    const container = document.getElementById('palettes');
    container.innerHTML = `
      <div class="p-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Palettes</h2>
        </div>

        <!-- Clefs -->
        <details open class="mb-4">
          <summary class="cursor-pointer py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
            Clefs
          </summary>
          <div class="mt-2 grid grid-cols-3 gap-2">
            ${this.createPaletteButton('𝄞', 'Treble Clef', 'clef', 'treble')}
            ${this.createPaletteButton('𝄢', 'Bass Clef', 'clef', 'bass')}
            ${this.createPaletteButton('𝄡', 'Alto Clef', 'clef', 'alto')}
          </div>
        </details>

        <!-- Key Signatures -->
        <details open class="mb-4">
          <summary class="cursor-pointer py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
            Key Signatures
          </summary>
          <div class="mt-2 space-y-1">
            ${this.createListButton('C Major', 'key', 'C')}
            ${this.createListButton('G Major (1#)', 'key', 'G')}
            ${this.createListButton('D Major (2#)', 'key', 'D')}
            ${this.createListButton('F Major (1♭)', 'key', 'F')}
            ${this.createListButton('A Minor', 'key', 'Am')}
            ${this.createListButton('E Minor', 'key', 'Em')}
          </div>
        </details>

        <!-- Time Signatures -->
        <details open class="mb-4">
          <summary class="cursor-pointer py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
            Time Signatures
          </summary>
          <div class="mt-2 grid grid-cols-3 gap-2">
            ${this.createPaletteButton('<div class="text-lg font-bold">4/4</div>', '4/4 Time', 'time', '4/4')}
            ${this.createPaletteButton('<div class="text-lg font-bold">3/4</div>', '3/4 Time', 'time', '3/4')}
            ${this.createPaletteButton('<div class="text-lg font-bold">6/8</div>', '6/8 Time', 'time', '6/8')}
            ${this.createPaletteButton('<div class="text-lg font-bold">2/4</div>', '2/4 Time', 'time', '2/4')}
            ${this.createPaletteButton('<div class="text-lg font-bold">5/4</div>', '5/4 Time', 'time', '5/4')}
            ${this.createPaletteButton('<div class="text-lg font-bold">7/8</div>', '7/8 Time', 'time', '7/8')}
          </div>
        </details>

        <!-- Dynamics -->
        <details open class="mb-4">
          <summary class="cursor-pointer py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
            Dynamics
          </summary>
          <div class="mt-2 grid grid-cols-3 gap-2">
            ${this.createDynamicButton('pp')}
            ${this.createDynamicButton('p')}
            ${this.createDynamicButton('mp')}
            ${this.createDynamicButton('mf')}
            ${this.createDynamicButton('f')}
            ${this.createDynamicButton('ff')}
          </div>
        </details>

        <!-- Tempo -->
        <details class="mb-4">
          <summary class="cursor-pointer py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
            Tempo Markings
          </summary>
          <div class="mt-2 space-y-1">
            ${this.createListButton('Largo', 'tempo', 'largo')}
            ${this.createListButton('Adagio', 'tempo', 'adagio')}
            ${this.createListButton('Andante', 'tempo', 'andante')}
            ${this.createListButton('Moderato', 'tempo', 'moderato')}
            ${this.createListButton('Allegro', 'tempo', 'allegro')}
            ${this.createListButton('Presto', 'tempo', 'presto')}
          </div>
        </details>

        <!-- Articulations & Ornaments -->
        <details class="mb-4">
          <summary class="cursor-pointer py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
            Articulations
          </summary>
          <div class="mt-2 grid grid-cols-3 gap-2">
            ${this.createPaletteButton('•', 'Staccato', 'articulation', 'staccato')}
            ${this.createPaletteButton('>', 'Accent', 'articulation', 'accent')}
            ${this.createPaletteButton('𝄐', 'Fermata', 'articulation', 'fermata')}
            ${this.createPaletteButton('tr', 'Trill', 'articulation', 'trill')}
            ${this.createPaletteButton('⌢', 'Slur', 'articulation', 'slur')}
            ${this.createPaletteButton('>', 'Marcato', 'articulation', 'marcato')}
          </div>
        </details>

        <!-- Repeats & Endings -->
        <details class="mb-4">
          <summary class="cursor-pointer py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
            Repeats & Endings
          </summary>
          <div class="mt-2 space-y-1">
            ${this.createListButton('Repeat Start', 'repeat', 'start')}
            ${this.createListButton('Repeat End', 'repeat', 'end')}
            ${this.createListButton('1st Ending', 'ending', '1')}
            ${this.createListButton('2nd Ending', 'ending', '2')}
            ${this.createListButton('D.C. al Fine', 'navigation', 'dc')}
            ${this.createListButton('D.S. al Coda', 'navigation', 'ds')}
          </div>
        </details>
      </div>
    `;

    // Add event listeners to palette items
    this.attachPaletteListeners();
  },

  // Create palette button
  createPaletteButton(content, title, type, value) {
    return `
      <button class="palette-item p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-center transition-colors" 
              title="${title}" 
              data-type="${type}" 
              data-value="${value}">
        <span class="text-2xl text-gray-700 dark:text-gray-300">${content}</span>
      </button>
    `;
  },

  // Create list button
  createListButton(text, type, value) {
    return `
      <button class="palette-item w-full p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-left text-sm text-gray-700 dark:text-gray-300 transition-colors"
              data-type="${type}"
              data-value="${value}">
        ${text}
      </button>
    `;
  },

  // Create dynamic button
  createDynamicButton(dynamic) {
    return `
      <button class="palette-item p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-center transition-colors"
              data-type="dynamic"
              data-value="${dynamic}">
        <span class="text-lg font-bold italic text-gray-700 dark:text-gray-300">${dynamic}</span>
      </button>
    `;
  },

  // Attach event listeners to palette items
  attachPaletteListeners() {
    document.querySelectorAll('.palette-item').forEach(button => {
      button.addEventListener('click', function() {
        const type = this.dataset.type;
        const value = this.dataset.value;
        
        // Visual feedback
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
          this.style.transform = 'scale(1)';
        }, 100);

        // Handle the palette selection
        UI.handlePaletteSelection(type, value);
      });
    });
  },

  // Handle palette selection
  handlePaletteSelection(type, value) {
    console.log(`Selected ${type}: ${value}`);
    
    switch(type) {
      case 'clef':
        Score.setClef(value);
        break;
      case 'key':
        Score.setKeySignature(value);
        break;
      case 'time':
        Score.setTimeSignature(value);
        break;
      case 'dynamic':
        Score.addDynamic(value);
        break;
      case 'tempo':
        Score.addTempoMarking(value);
        break;
      case 'articulation':
        MusicComposer.selectArticulation(value);
        break;
      default:
        MusicComposer.showNotification(`${type} (${value}) selected`);
    }
  },

  // Create a simple modal dialog
  createModal(title, content, buttons) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">${title}</h3>
        <div class="text-gray-700 dark:text-gray-300 mb-6">${content}</div>
        <div class="flex gap-2 justify-end">
          ${buttons.map(btn => `
            <button class="px-4 py-2 ${btn.primary ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100'} rounded-lg transition-colors"
                    onclick="${btn.action}">
              ${btn.text}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    return modal;
  },

  // Show loading indicator
  showLoading(element) {
    const loader = document.createElement('span');
    loader.className = 'loading';
    element.appendChild(loader);
    return loader;
  },

  // Remove loading indicator
  hideLoading(loader) {
    if (loader && loader.parentElement) {
      loader.remove();
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UI;
}