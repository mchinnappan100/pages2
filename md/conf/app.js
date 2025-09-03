class MarkdownConverter {
    constructor() {
        this.fileInput = document.getElementById('fileInput');
        this.htmlPreview = document.getElementById('htmlPreview');
        this.confluenceOutput = document.getElementById('confluenceOutput');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.currentFileName = '';
        
        this.init();
    }

    init() {
        this.fileInput.addEventListener('change', this.handleFileUpload.bind(this));
        this.downloadBtn.addEventListener('click', this.downloadConfluence.bind(this));
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.currentFileName = file.name.replace(/\.[^/.]+$/, "");
        
        try {
            const markdownText = await this.readFile(file);
            this.processMarkdown(markdownText);
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

    processMarkdown(markdownText) {
        // Convert markdown to HTML
        const html = this.markdownToHtml(markdownText);
        this.displayHtmlPreview(html);
        
        // Convert markdown to Confluence format
        const confluenceFormat = this.markdownToConfluence(markdownText);
        this.displayConfluenceFormat(confluenceFormat);
        
        // Enable download button
        this.downloadBtn.disabled = false;
    }

    markdownToHtml(markdown) {
        let html = markdown;
        
        // Headers
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        
        // Bold and italic
        html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Code blocks
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        
        // Images
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
        
        // Unordered lists
        html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Ordered lists
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        
        // Blockquotes
        html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
        
        // Horizontal rules
        html = html.replace(/^---$/gm, '<hr>');
        
        // Paragraphs
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        
        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>(<h[1-6]>)/g, '$1');
        html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>)/g, '$1');
        html = html.replace(/(<\/ul>)<\/p>/g, '$1');
        html = html.replace(/<p>(<blockquote>)/g, '$1');
        html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
        html = html.replace(/<p>(<pre>)/g, '$1');
        html = html.replace(/(<\/pre>)<\/p>/g, '$1');
        html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
        
        return html;
    }

    markdownToConfluence(markdown) {
        let confluence = markdown;
        
        // Headers
        confluence = confluence.replace(/^# (.*$)/gm, 'h1. $1');
        confluence = confluence.replace(/^## (.*$)/gm, 'h2. $1');
        confluence = confluence.replace(/^### (.*$)/gm, 'h3. $1');
        confluence = confluence.replace(/^#### (.*$)/gm, 'h4. $1');
        confluence = confluence.replace(/^##### (.*$)/gm, 'h5. $1');
        confluence = confluence.replace(/^###### (.*$)/gm, 'h6. $1');
        
        // Bold and italic
        confluence = confluence.replace(/\*\*\*(.*?)\*\*\*/g, '*_$1_*');
        confluence = confluence.replace(/\*\*(.*?)\*\*/g, '*$1*');
        confluence = confluence.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '_$1_');
        
        // Code blocks
        confluence = confluence.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang ? `|language=${lang}` : '';
            return `{code${language}}\n${code.trim()}\n{code}`;
        });
        confluence = confluence.replace(/```([\s\S]*?)```/g, '{code}\n$1\n{code}');
        confluence = confluence.replace(/`(.*?)`/g, '{{$1}}');
        
        // Links
        confluence = confluence.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1|$2]');
        
        // Images
        confluence = confluence.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '!$2|alt=$1!');
        
        // Lists
        confluence = confluence.replace(/^\* (.+)$/gm, '* $1');
        confluence = confluence.replace(/^\d+\. (.+)$/gm, '# $1');
        
        // Blockquotes
        confluence = confluence.replace(/^> (.+)$/gm, 'bq. $1');
        
        // Horizontal rules
        confluence = confluence.replace(/^---$/gm, '----');
        
        // Tables (basic support)
        confluence = confluence.replace(/\|(.+)\|/g, (match, content) => {
            const cells = content.split('|').map(cell => cell.trim());
            return '|' + cells.join('|') + '|';
        });
        
        // Convert table headers (lines with only |---|---|)
        confluence = confluence.replace(/^\|[\s\-\|:]+\|$/gm, '');
        
        // Clean up extra whitespace
        confluence = confluence.replace(/\n{3,}/g, '\n\n');
        
        return confluence.trim();
    }

    displayHtmlPreview(html) {
        this.htmlPreview.innerHTML = html;
    }

    displayConfluenceFormat(confluenceText) {
        this.confluenceOutput.value = confluenceText;
    }

    downloadConfluence() {
        const confluenceText = this.confluenceOutput.value;
        if (!confluenceText) return;

        const blob = new Blob([confluenceText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentFileName}_confluence.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        // Show download feedback
        this.showDownloadFeedback();
    }

    showDownloadFeedback() {
        const originalText = this.downloadBtn.innerHTML;
        this.downloadBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
            </svg>
            Downloaded
        `;
        this.downloadBtn.style.background = '#238636';
        
        setTimeout(() => {
            this.downloadBtn.innerHTML = originalText;
            this.downloadBtn.style.background = '#21262d';
        }, 2000);
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
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MarkdownConverter();
});

// Add drag and drop functionality
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const fileInput = document.getElementById('fileInput');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        body.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        body.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        body.style.background = '#1a1f26';
    }

    function unhighlight() {
        body.style.background = '#0d1117';
    }

    body.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
        }
    }
});