        let editor;
        let slides = [];
        let currentSlideIndex = 0;
        let isFullscreen = false;
        let isOutlineVisible = false;

        // Default markdown content
        const defaultMarkdown = `# Welcome to Modern Slides
A beautiful markdown-based presentation tool

---

## Features
- **Monaco Editor** for syntax highlighting
- **Real-time preview** of your slides
- **PDF export** functionality
- **Modern glassmorphism design**
- **URL parameter support**

---

## How to Use
1. Edit markdown in the left panel
2. Use \`---\` to separate slides
3. Navigate with arrow buttons
4. Export to PDF when ready

---

## Markdown Support
- Headers (H1, H2, H3)
- **Bold** and *italic* text  
- Code blocks and \`inline code\`
- Lists and bullet points
- > Blockquotes for emphasis

---

## Thank You!
Start editing to create your own presentation
        `;

        // Initialize Monaco Editor
        require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
        require(['vs/editor/editor.main'], function () {
            editor = monaco.editor.create(document.getElementById('editor'), {
                value: defaultMarkdown,
                language: 'markdown',
                theme: localStorage.getItem('theme') === 'dark' ? 'vs-dark' : 'vs',
                automaticLayout: true,
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontFamily: 'Fira Code, Consolas, Monaco, monospace'
            });

            // Listen for content changes
            editor.onDidChangeModelContent(() => {
                updateSlides();
                updateOutline();
                updateSlideTitle();
            });

            // Initial slide, outline, and title update
            updateSlides();
            updateOutline();
            updateSlideTitle();
            
            // Check for URL parameter
            checkUrlParameter();
            
            // Load repository slides
            loadRepoSlides();

            // Apply saved theme
            applySavedTheme();
        });

        function applySavedTheme() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.body.setAttribute('data-theme', savedTheme);
            if (editor) {
                monaco.editor.setTheme(savedTheme === 'dark' ? 'vs-dark' : 'vs');
            }
            updateThemeToggleButton();
        }

        function toggleTheme() {
            const currentTheme = document.body.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            if (editor) {
                monaco.editor.setTheme(newTheme === 'dark' ? 'vs-dark' : 'vs');
            }
            updateThemeToggleButton();
        }

        function updateThemeToggleButton() {
            const themeToggle = document.getElementById('themeToggle');
            const currentTheme = document.body.getAttribute('data-theme') || 'light';
            themeToggle.textContent = currentTheme === 'light' ? '🌙 Dark Theme' : '☀️ Light Theme';
        }

        async function loadRepoSlides() {
            const tocUrl = 'https://raw.githubusercontent.com/mchinnappan100/myslides/main/toc.txt';
            const select = document.getElementById('repoSelect');
            const loadingDiv = document.getElementById('loading');
            loadingDiv.style.display = 'block';
            loadingDiv.textContent = 'Loading slides from repository...';

            try {
                const response = await fetch(tocUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch toc.txt: ${response.status} ${response.statusText}`);
                }
                const tocContent = await response.text();
                console.log('toc.txt content:', tocContent);
                parseAndPopulateToc(tocContent);
            } catch (error) {
                console.error('Error loading toc.txt:', error);
                select.innerHTML = '<option value="" disabled selected>Failed to load slides</option>';
                alert('Failed to load slides from repository: ' + error.message);
            } finally {
                loadingDiv.style.display = 'none';
            }
        }

        function parseAndPopulateToc(tocContent) {
            const select = document.getElementById('repoSelect');
            select.innerHTML = '<option value="" disabled selected>Select a slide...</option>';
            const lines = tocContent.split('\n').map(line => line.trim()).filter(line => line);
            const folders = {};

            console.log('Parsed lines:', lines);

            lines.forEach(line => {
                if (line.endsWith('README.md')) {
                    console.log('Skipping:', line);
                    return;
                }

                const match = line.match(/\/mchinnappan100\/myslides\/refs\/heads\/main\/([^/]+)\/([^/]+\.md)$/);
                if (match) {
                    const folder = match[1];
                    const file = match[2];
                    console.log('Found file:', file, 'in folder:', folder);
                    if (!folders[folder]) {
                        folders[folder] = [];
                    }
                    folders[folder].push({ file, url: line });
                } else {
                    console.warn('Invalid URL format:', line);
                }
            });

            Object.keys(folders).sort().forEach(folder => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = folder;
                folders[folder].forEach(({ file, url }) => {
                    const option = document.createElement('option');
                    option.value = url;
                    option.textContent = file;
                    optgroup.appendChild(option);
                });
                select.appendChild(optgroup);
            });

            if (Object.keys(folders).length === 0) {
                console.warn('No valid slides found in toc.txt');
                select.innerHTML = '<option value="" disabled selected>No slides available</option>';
            }
        }

        async function loadRepoSlide() {
            const select = document.getElementById('repoSelect');
            const url = select.value;
            const loadingDiv = document.getElementById('loading');
            if (url) {
                loadingDiv.style.display = 'block';
                loadingDiv.textContent = 'Loading slide...';

                try {
                    console.log('Fetching slide from:', url);
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch markdown file: ${response.status} ${response.statusText}`);
                    }
                    const content = await response.text();
                    console.log('Loaded slide content:', content.substring(0, 100) + '...');
                    editor.setValue(content);
                    select.value = '';
                    updateOutline();
                    updateSlideTitle();
                } catch (error) {
                    console.error('Error loading markdown file:', error);
                    alert('Failed to load selected slide: ' + error.message);
                } finally {
                    loadingDiv.style.display = 'none';
                }
            }
        }

        function updateSlides() {
            const markdown = editor.getValue();
            const slideContents = markdown.split('---').map(slide => slide.trim()).filter(slide => slide);
            
            slides = slideContents;
            renderSlides();
            updateSlideCounter();
            updateNavigationButtons();
        }

        function updateOutline() {
            const outlineList = document.getElementById('outlineList');
            outlineList.innerHTML = '';

            slides.forEach((slideContent, index) => {
                const li = document.createElement('li');
                li.className = 'outline-item';
                if (index === currentSlideIndex) {
                    li.classList.add('active');
                }

                const headerMatch = slideContent.match(/^(#{1,3})\s+(.+)$/m);
                const title = headerMatch ? headerMatch[2].trim() : `Slide ${index + 1}`;
                li.textContent = title;
                li.addEventListener('click', () => {
                    currentSlideIndex = index;
                    renderSlides();
                    updateSlideCounter();
                    updateNavigationButtons();
                    updateOutline();
                });

                outlineList.appendChild(li);
            });
        }

        function updateSlideTitle() {
            const slideTitle = document.getElementById('slideTitle');
            const markdown = editor.getValue();
            const headerMatch = markdown.match(/^#\s+(.+)$/m);
            slideTitle.textContent = headerMatch ? headerMatch[1].trim() : 'Slide Presentation';
        }

        function toggleOutline() {
            const outlinePanel = document.getElementById('outlinePanel');
            isOutlineVisible = !isOutlineVisible;
            outlinePanel.classList.toggle('visible', isOutlineVisible);
        }

        function renderSlides() {
            const container = document.getElementById('slideContainer');
            container.innerHTML = '';
            
            slides.forEach((slideContent, index) => {
                const slideDiv = document.createElement('div');
                slideDiv.className = 'slide';
                slideDiv.id = `slide-${index}`;
                
                if (slideContent.trim().startsWith('# ')) {
                    slideDiv.classList.add('title-slide');
                }
                
                try {
                    slideDiv.innerHTML = marked.parse(slideContent);
                } catch (error) {
                    slideDiv.innerHTML = `<p>Error rendering slide: ${error.message}</p>`;
                }
                
                if (index === currentSlideIndex) {
                    slideDiv.style.transform = 'translateX(0)';
                } else if (index > currentSlideIndex) {
                    slideDiv.style.transform = 'translateX(100%)';
                } else {
                    slideDiv.style.transform = 'translateX(-100%)';
                }
                
                container.appendChild(slideDiv);
            });

            updateOutline();
        }

        function nextSlide() {
            if (currentSlideIndex < slides.length - 1) {
                currentSlideIndex++;
                renderSlides();
                updateSlideCounter();
                updateNavigationButtons();
            }
        }

        function previousSlide() {
            if (currentSlideIndex > 0) {
                currentSlideIndex--;
                renderSlides();
                updateSlideCounter();
                updateNavigationButtons();
            }
        }

        function updateSlideCounter() {
            document.getElementById('currentSlide').textContent = currentSlideIndex + 1;
            document.getElementById('totalSlides').textContent = slides.length;
        }

        function updateNavigationButtons() {
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            
            prevBtn.disabled = currentSlideIndex === 0;
            nextBtn.disabled = currentSlideIndex === slides.length - 1;
        }

        function uploadMarkdown() {
            document.getElementById('fileInput').click();
        }

        function handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    editor.setValue(e.target.result);
                    updateOutline();
                    updateSlideTitle();
                };
                reader.readAsText(file);
            }
        }

        function downloadMarkdown() {
            const content = editor.getValue();
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'slides.md';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

      async function generatePDF() {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'block';
    loadingDiv.textContent = 'Preparing PDF...';
    
    try {
        // Create a new window for PDF generation
        const printWindow = window.open('', '_blank');
        
        // Get all slides HTML
        const slidesHTML = generateAllSlidesHTML();
        
        // Create complete HTML for printing
        const printHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Slides PDF</title>
                <style>
                    @page {
                        size: A4 landscape;
                        margin: 0;
                    }
                    
                    body {
                        margin: 0;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        background: white;
                    }
                    
                    .slide {
                        width: 100vw;
                        height: 100vh;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        padding: 40px;
                        box-sizing: border-box;
                        page-break-after: always;
                        background: white;
                        color: #333;
                    }
                    
                    .slide:last-child {
                        page-break-after: avoid;
                    }
                    
                    .slide h1 {
                        font-size: 2.5em;
                        margin-bottom: 0.5em;
                        text-align: center;
                    }
                    
                    .slide h2 {
                        font-size: 2em;
                        margin-bottom: 0.5em;
                        text-align: center;
                    }
                    
                    .slide p, .slide li {
                        font-size: 1.2em;
                        line-height: 1.6;
                        margin-bottom: 0.5em;
                    }
                    
                    .slide ul {
                        text-align: left;
                        max-width: 80%;
                    }
                    
                    .slide pre {
                        background: #f5f5f5;
                        padding: 15px;
                        border-radius: 5px;
                        overflow-x: auto;
                        max-width: 90%;
                    }
                    
                    .slide code {
                        background: #f5f5f5;
                        padding: 2px 4px;
                        border-radius: 3px;
                        font-family: 'Courier New', monospace;
                    }
                    
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                ${slidesHTML}
            </body>
            </html>
        `;
        
        printWindow.document.write(printHTML);
        printWindow.document.close();
        
        // Wait for content to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Trigger print dialog
        printWindow.print();
        
        // Close the window after printing
        printWindow.onafterprint = () => {
            printWindow.close();
        };
        
    } catch (error) {
        alert('Error generating PDF: ' + error.message);
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function generateAllSlidesHTML() {
    return slides.map(slide => `
        <div class="slide">
            ${marked.parse(slide)}
        </div>
    `).join('');
}

// Alternative: Direct print of current view
function printCurrentSlides() {
    const originalContents = document.body.innerHTML;
    const slideContainer = document.getElementById('slideContainer');
    
    // Create print-friendly HTML
    const printContents = `
        <style>
            @page { size: A4 landscape; margin: 0; }
            body { font-family: Arial, sans-serif; }
            .slide { 
                width: 100vw; 
                height: 100vh; 
                display: flex; 
                flex-direction: column; 
                justify-content: center; 
                align-items: center; 
                padding: 40px; 
                box-sizing: border-box;
                page-break-after: always;
                background: white;
            }
            .slide:last-child { page-break-after: avoid; }
        </style>
        ${generateAllSlidesHTML()}
    `;
    
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
}

        function toggleFullscreen() {
            const slidesPanel = document.querySelector('.slides-panel');
            const editorPanel = document.querySelector('.editor-panel');
            
            if (!isFullscreen) {
                editorPanel.style.display = 'none';
                slidesPanel.style.width = '100%';
                isFullscreen = true;
                isOutlineVisible = false;
                document.getElementById('outlinePanel').classList.remove('visible');
            } else {
                editorPanel.style.display = 'flex';
                slidesPanel.style.width = '50%';
                isFullscreen = false;
            }
        }

        document.addEventListener('keydown', function(e) {
            if (editor && editor.hasTextFocus()) {
                return;
            }

            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                previousSlide();
            } else if (e.key === 'Escape') {
                if (isOutlineVisible) {
                    toggleOutline();
                } else if (isFullscreen) {
                    toggleFullscreen();
                }
            }
        });

        async function checkUrlParameter() {
            const urlParams = new URLSearchParams(window.location.search);
            const url = urlParams.get('url');
            if (url) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        const content = await response.text();
                        editor.setValue(content);
                        updateOutline();
                        updateSlideTitle();
                    } else {
                        console.error('Failed to load markdown from URL:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error loading markdown from URL:', error);
                }
            }
        }

        function autoSave() {
            if (editor) {
                localStorage.setItem('slides-autosave', editor.getValue());
            }
        }

        setInterval(autoSave, 30000);

        window.addEventListener('load', function() {
            const saved = localStorage.getItem('slides-autosave');
            if (saved && editor && editor.getValue() === defaultMarkdown) {
                const loadSaved = confirm('Auto-saved content found. Would you like to restore it?');
                if (loadSaved) {
                    editor.setValue(saved);
                    updateOutline();
                    updateSlideTitle();
                }
            }
        });