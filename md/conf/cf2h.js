class ConfluenceConverter {
    constructor() {
        this.confluenceInput = document.getElementById('confluenceInput');
        this.htmlPreview = document.getElementById('htmlPreview');
        this.downloadPdfBtn = document.getElementById('downloadPdfBtn');
        this.fileInput = document.getElementById('fileInput');
        this.currentFileName = ''; // Store the uploaded file name
        
        this.init();
    }

    init() {
        // Event listeners for input and download
        this.confluenceInput.addEventListener('input', this.handleInput.bind(this));
        this.downloadPdfBtn.addEventListener('click', this.downloadPdf.bind(this));
        
        // Event listeners for file upload
        this.fileInput.addEventListener('change', this.handleFileUpload.bind(this));
        
        // Drag-and-drop event listeners
        const body = document.body;
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            body.addEventListener(eventName, this.preventDefaults, false);
        });
        ['dragenter', 'dragover'].forEach(eventName => {
            body.addEventListener(eventName, this.highlight, false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            body.addEventListener(eventName, this.unhighlight, false);
        });
        body.addEventListener('drop', this.handleDrop.bind(this));
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlight() {
        document.body.style.background = '#1a1f26';
    }

    unhighlight() {
        document.body.style.background = '#0d1117';
    }

    async handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            this.fileInput.files = files;
            const event = new Event('change', { bubbles: true });
            this.fileInput.dispatchEvent(event);
        }
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.currentFileName = file.name.replace(/\.[^/.]+$/, "");
        
        try {
            const confluenceText = await this.readFile(file);
            this.confluenceInput.value = confluenceText;
            this.handleInput(); // Trigger processing of the input
        } catch (error) {
            this.showError('Error reading file: ' + error.message);
        }
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    handleInput() {
        const confluenceText = this.confluenceInput.value;
        if (!confluenceText.trim()) {
            this.htmlPreview.innerHTML = `
                <div class="placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    <p>Enter Confluence markup or upload a file to see the HTML preview</p>
                </div>
            `;
            this.downloadPdfBtn.disabled = true;
            return;
        }

        try {
            const html = this.confluenceToHtml(confluenceText);
            this.displayHtmlPreview(html);
            this.downloadPdfBtn.disabled = false;
        } catch (error) {
            this.showError('Error processing Confluence markup: ' + error.message);
            this.downloadPdfBtn.disabled = true;
        }
    }

    confluenceToHtml(confluence) {
        let html = confluence;

        // Headers (h1. to h6.)
        html = html.replace(/^h1\. (.*)$/gm, '<h1>$1</h1>');
        html = html.replace(/^h2\. (.*)$/gm, '<h2>$1</h2>');
        html = html.replace(/^h3\. (.*)$/gm, '<h3>$1</h3>');
        html = html.replace(/^h4\. (.*)$/gm, '<h4>$1</h4>');
        html = html.replace(/^h5\. (.*)$/gm, '<h5>$1</h5>');
        html = html.replace(/^h6\. (.*)$/gm, '<h6>$1</h6>');

        // Bold and italic
        html = html.replace(/\*_\s*(.*?)\s*_\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
        html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

        // Code blocks
        html = html.replace(/{code(?:\|language=\w+)?}\n?([\s\S]*?)\n?{code}/g, '<pre><code>$1</code></pre>');
        html = html.replace(/{{(.*?)}}/g, '<code>$1</code>');

        // Links
        html = html.replace(/\[([^\]|]+)\|([^\]]+)\]/g, '<a href="$2">$1</a>');

        // Images
        html = html.replace(/!([^!]+)\|alt=([^!]+)!/g, '<img src="$1" alt="$2">');

        // Lists
        html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
        html = html.replace(/^(# .+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>\* .+<\/li>)/s, '<ul>$1</ul>');
        html = html.replace(/(<li># .+<\/li>)/s, '<ol>$1</ol>');
        html = html.replace(/<li># /g, '<li>');

        // Blockquotes
        html = html.replace(/^bq\. (.*)$/gm, '<blockquote>$1</blockquote>');

        // Horizontal rules
        html = html.replace(/^----$/gm, '<hr>');

        // Tables
        html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
            const cells = content.split('|').map(cell => cell.trim());
            const isHeader = cells.every(cell => cell.startsWith('||'));
            const tag = isHeader ? 'th' : 'td';
            const cleanedCells = isHeader ? cells.map(cell => cell.replace(/^\|\|/, '')) : cells;
            return `<tr>${cleanedCells.map(cell => `<${tag}>${cell}</${tag}>`).join('')}</tr>`;
        });
        html = html.replace(/(<tr>.*<\/tr>)/s, '<table>$1</table>');

        // Paragraphs
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';

        // Clean up empty paragraphs and prevent wrapping around block elements
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>(<h[1-6]>)/g, '$1');
        html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>)/g, '$1');
        html = html.replace(/(<\/ul>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ol>)/g, '$1');
        html = html.replace(/(<\/ol>)<\/p>/g, '$1');
        html = html.replace(/<p>(<blockquote>)/g, '$1');
        html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
        html = html.replace(/<p>(<pre>)/g, '$1');
        html = html.replace(/(<\/pre>)<\/p>/g, '$1');
        html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
        html = html.replace(/<p>(<table>)/g, '$1');
        html = html.replace(/(<\/table>)<\/p>/g, '$1');

        return html;
    }

    displayHtmlPreview(html) {
        this.htmlPreview.innerHTML = html;
    }

    downloadPdf() {
        const element = this.htmlPreview;
        if (!element.innerHTML || element.querySelector('.placeholder')) {
            return;
        }

        // Show downloading feedback
        const originalText = this.downloadPdfBtn.innerHTML;
        this.downloadPdfBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path class="loading" d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
            </svg>
            Generating PDF...
        `;
        this.downloadPdfBtn.disabled = true;

        // Configure html2pdf options
        const opt = {
            margin: 10,
            filename: this.currentFileName ? `${this.currentFileName}.pdf` : 'confluence_document.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Generate and download PDF
        html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {
                // Show success feedback
                this.downloadPdfBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                    </svg>
                    Downloaded
                `;
                this.downloadPdfBtn.style.background = '#238636';

                // Reset button after 2 seconds
                setTimeout(() => {
                    this.downloadPdfBtn.innerHTML = originalText;
                    this.downloadPdfBtn.style.background = '#21262d';
                    this.downloadPdfBtn.disabled = false;
                }, 2000);
            })
            .catch(error => {
                this.showError('Error generating PDF: ' + error.message);
                this.downloadPdfBtn.innerHTML = originalText;
                this.downloadPdfBtn.style.background = '#21262d';
                this.downloadPdfBtn.disabled = false;
            });
    }

    showError(message) {
        this.htmlPreview.innerHTML = `
            <div style="color: #f85149; padding: 2rem; text-align: center;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style="margin-bottom: 1rem;">
                    <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                </svg>
                <p>${message}</p>
            </div>
        `;
        this.downloadPdfBtn.disabled = true;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ConfluenceConverter();
});