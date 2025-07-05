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
                fontFamily: 'Segoe UI, "Helvetica Neue", Arial, sans-serif'
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

async function generateVideo() {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'block';
    loadingDiv.textContent = 'Generating Video...';

    // Store original theme and body styles outside try block
    const originalDataTheme = document.body.getAttribute('data-theme');
    const originalBodyStyles = {
        backgroundColor: document.body.style.backgroundColor,
        color: document.body.style.color,
        opacity: document.body.style.opacity
    };

    try {
        const slideDuration = prompt('Enter duration per slide (seconds):', '5');
        const duration = parseFloat(slideDuration) || 5;

        const slideTexts = slides.map(slide => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = marked.parse(slide);
            return tempDiv.textContent.trim();
        });

        const audioResponse = await fetch('http://localhost:5000/generate_audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slides: slideTexts }),
        });

        if (!audioResponse.ok) {
            throw new Error('Failed to generate audio: ' + audioResponse.statusText);
        }

        const audioData = await audioResponse.json();
        const audioFiles = audioData.audio_files;
        
        const slideImages = [];
        for (let i = 0; i < slides.length; i++) {
            currentSlideIndex = i;
            renderSlides();
            await new Promise(resolve => setTimeout(resolve, 300));

            // Create temp container with fixed dimensions
            const tempContainer = document.createElement('div');
            tempContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 1920px;
                height: 1080px;
                padding: 60px;
                background-color: #ffffff !important;
                font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                box-sizing: border-box;
                z-index: 9999;
                opacity: 1 !important;
                visibility: visible !important;
            `;
            
            document.body.appendChild(tempContainer);

            // Create slide content
            const slideContent = marked.parse(slides[i]);
            const tempSlide = document.createElement('div');
            tempSlide.innerHTML = slideContent;
            tempSlide.className = 'slide';
            tempSlide.style.cssText = `
                position: relative;
                transform: translateX(0);
                font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
                color: #333333 !important;
                background-color: transparent !important;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                opacity: 1 !important;
                visibility: visible !important;
            `;

            // Recursively fix all elements for high contrast and opacity

function fixElementStyles(element) {
    if (element.nodeType === Node.ELEMENT_NODE) {
        // Get computed styles to preserve font sizes
        const computedStyle = window.getComputedStyle(element);
        const originalFontSize = computedStyle.fontSize;
        
        // Reset all potentially problematic styles
        element.style.cssText += `
            color: #333333 !important;
            opacity: 1 !important;
            visibility: visible !important;
            background-color: transparent !important;
            -webkit-background-clip: initial !important;
            -webkit-text-fill-color: #333333 !important;
            font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif !important;
            text-shadow: none !important;
            filter: none !important;
            backdrop-filter: none !important;
            font-size: ${originalFontSize} !important;
        `;
        
        // Special handling for different element types with proper font sizes
        const tagName = element.tagName.toLowerCase();
        if (tagName === 'pre' || tagName === 'code') {
            element.style.cssText += `
                background-color: #f5f5f5 !important;
                padding: 10px !important;
                border-radius: 5px !important;
                border: 1px solid #ddd !important;
                color: #333333 !important;
                font-size: ${originalFontSize || '14px'} !important;
            `;
        } else if (tagName === 'h1') {
            element.style.cssText += `
                font-weight: bold !important;
                color: #333333 !important;
                font-size: ${originalFontSize || '2.5rem'} !important;
            `;
        } else if (tagName === 'h2') {
            element.style.cssText += `
                font-weight: bold !important;
                color: #333333 !important;
                font-size: ${originalFontSize || '2rem'} !important;
            `;
        } else if (tagName === 'h3') {
            element.style.cssText += `
                font-weight: bold !important;
                color: #333333 !important;
                font-size: ${originalFontSize || '1.5rem'} !important;
            `;
        } else if (tagName === 'p') {
            element.style.cssText += `
                font-size: ${originalFontSize || '1.2rem'} !important;
                line-height: 1.6 !important;
            `;
        } else if (tagName === 'ul') {
            element.style.cssText += `
                font-size: ${originalFontSize || '1.1rem'} !important;
                line-height: 1.5 !important;
                padding-left: 2rem !important;
                margin-left: 0 !important;
                list-style-type: disc !important;
                list-style-position: outside !important;
                text-align: left !important;
            `;
        } else if (tagName === 'ol') {
            element.style.cssText += `
                font-size: ${originalFontSize || '1.1rem'} !important;
                line-height: 1.5 !important;
                padding-left: 2rem !important;
                margin-left: 0 !important;
                list-style-type: decimal !important;
                list-style-position: outside !important;
                text-align: left !important;
            `;
        } else if (tagName === 'li') {
            element.style.cssText += `
                font-size: ${originalFontSize || '1.1rem'} !important;
                margin-bottom: 0.5rem !important;
                padding-left: 0.5rem !important;
                text-align: left !important;
                display: list-item !important;
            `;
        } else if (tagName === 'a') {
            element.style.cssText += `
                color: #0066cc !important;
                text-decoration: underline !important;
                font-size: ${originalFontSize || '1.1rem'} !important;
            `;
        } else if (tagName === 'blockquote') {
            element.style.cssText += `
                font-size: ${originalFontSize || '1.1rem'} !important;
                font-style: italic !important;
                border-left: 4px solid #ddd !important;
                padding-left: 1rem !important;
            `;
        }
        
        // Remove any classes that might interfere
        const problematicClasses = ['fade', 'invisible', 'hidden', 'transparent'];
        problematicClasses.forEach(className => {
            element.classList.remove(className);
        });
        
        // Recursively fix child elements
        for (let child of element.children) {
            fixElementStyles(child);
        }
    }
}

            // Apply fixes to all elements
            fixElementStyles(tempSlide);
            tempContainer.appendChild(tempSlide);

            console.log(`Rendering slide ${i} for video:`, slideContent.substring(0, 100));
            
            // Force multiple layout recalculations
            tempSlide.offsetHeight;
            tempContainer.offsetHeight;
            await new Promise(resolve => setTimeout(resolve, 200));

            // Temporarily override any global styles that might interfere
            const styleOverride = document.createElement('style');
            styleOverride.textContent = `

* {
    opacity: 1 !important;
    visibility: visible !important;
}
.slide * {
    color: #333333 !important;
    opacity: 1 !important;
    visibility: visible !important;
}
.slide h1 {
    font-size: 3.5rem !important;
    font-weight: bold !important;
    margin-bottom: 1rem !important;
}
.slide h2 {
    font-size: 3rem !important;
    font-weight: bold !important;
    margin-bottom: 0.8rem !important;
}
.slide h3 {
    font-size: 2.5rem !important;
    font-weight: bold !important;
    margin-bottom: 0.6rem !important;
}
.slide p {
    font-size: 2.2rem !important;
    line-height: 1.6 !important;
    margin-bottom: 1rem !important;
}
.slide ul {
    font-size: 2.1rem !important;
    line-height: 1.5 !important;
    margin-bottom: 1rem !important;
    padding-left: 2rem !important;
    margin-left: 0 !important;
    list-style-type: disc !important;
    list-style-position: outside !important;
    text-align: left !important;
}
.slide ol {
    font-size: 2.1rem !important;
    line-height: 1.5 !important;
    margin-bottom: 1rem !important;
    padding-left: 2rem !important;
    margin-left: 0 !important;
    list-style-type: decimal !important;
    list-style-position: outside !important;
    text-align: left !important;
}
.slide li {
    font-size: 2.1rem !important;
    margin-bottom: 0.5rem !important;
    padding-left: 0.5rem !important;
    text-align: left !important;
    display: list-item !important;
}
.slide blockquote {
    font-size: 1.1rem !important;
    font-style: italic !important;
    border-left: 4px solid #ddd !important;
    padding-left: 1rem !important;
    margin: 1rem 0 !important;
}
.slide code {
    font-size: 1rem !important;
    background-color: #f5f5f5 !important;
    padding: 2px 4px !important;
    border-radius: 3px !important;
}
.slide pre {
    font-size: 1rem !important;
    background-color: #f5f5f5 !important;
    padding: 1rem !important;
    border-radius: 5px !important;
    border: 1px solid #ddd !important;
    margin: 1rem 0 !important;
}
/* Nested list handling */
.slide ul ul, .slide ol ol, .slide ul ol, .slide ol ul {
    margin-top: 0.5rem !important;
    margin-bottom: 0.5rem !important;
    padding-left: 1.5rem !important;
}
.slide li ul, .slide li ol {
    margin-top: 0.25rem !important;
} 
            `;
            document.head.appendChild(styleOverride);

            const canvas = await html2canvas(tempContainer, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: true, // Enable logging to debug issues
                width: 1920,
                height: 1080,
                windowWidth: 1920,
                windowHeight: 1080,
                ignoreElements: (el) => el.tagName === 'SCRIPT',
                // Replace the onclone handler in html2canvas with this improved version:

onclone: (clonedDoc) => {
    // Fix cloned document styles
    const clonedElements = clonedDoc.querySelectorAll('*');
    clonedElements.forEach(el => {
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        if (el.matches('h1, h2, h3, p, ul, ol, li, blockquote, code, pre, span, div')) {
            el.style.color = '#333333';
        }
        
        // Preserve font sizes in cloned document
        if (el.matches('h1')) {
            el.style.fontSize = '2.5rem';
        } else if (el.matches('h2')) {
            el.style.fontSize = '2rem';
        } else if (el.matches('h3')) {
            el.style.fontSize = '1.5rem';
        } else if (el.matches('p')) {
            el.style.fontSize = '1.2rem';
        } else if (el.matches('ul, ol')) {
            el.style.fontSize = '1.1rem';
            el.style.paddingLeft = '2rem';
            el.style.marginLeft = '0';
            el.style.textAlign = 'left';
            if (el.matches('ul')) {
                el.style.listStyleType = 'disc';
            } else {
                el.style.listStyleType = 'decimal';
            }
            el.style.listStylePosition = 'outside';
        } else if (el.matches('li')) {
            el.style.fontSize = '1.1rem';
            el.style.paddingLeft = '0.5rem';
            el.style.textAlign = 'left';
            el.style.display = 'list-item';
        } else if (el.matches('blockquote')) {
            el.style.fontSize = '1.1rem';
        } else if (el.matches('code, pre')) {
            el.style.fontSize = '1rem';
        }
    });
}
            });

            console.log(`Canvas captured for slide ${i} in video:`, canvas);

            // Cleanup
            document.head.removeChild(styleOverride);
            document.body.removeChild(tempContainer);

            // Use maximum quality for video frames
            slideImages.push(canvas.toDataURL('image/png', 1.0));
        }

        const videoResponse = await fetch('http://localhost:5000/generate_video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                images: slideImages,
                audio_files: audioFiles,
                slide_duration: duration,
            }),
        });

        if (!videoResponse.ok) {
            throw new Error('Failed to generate video: ' + videoResponse.statusText);
        }

        const blob = await videoResponse.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'slides_video.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Video generation error:', error);
        alert('Error generating video: ' + error.message);
    } finally {
        // Restore original theme and body styles
        document.body.setAttribute('data-theme', originalDataTheme);
        Object.keys(originalBodyStyles).forEach(key => {
            if (originalBodyStyles[key]) {
                document.body.style[key] = originalBodyStyles[key];
            }
        });
        
        loadingDiv.style.display = 'none';
        currentSlideIndex = 0;
        renderSlides();
        updateSlideCounter();
        updateNavigationButtons();
    }
}

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