        let templateEditor, variablesEditor, outputEditor;
        let isDragging = false;
        let dragType = '';

        // Initialize Monaco Editor
        require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' } });
        require(['vs/editor/editor.main'], function () {
            // Template Editor
            templateEditor = monaco.editor.create(document.getElementById('templateEditor'), {
                value: `Hello {{name}}!

{{#if showWelcome}}
Welcome to our template engine.
{{/if}}

{{#each items}}
- {{this.name}}: {{this.description}}
{{/each}}

{{#switch status}}
{{#case "active"}}Status is active{{/case}}
{{#case "inactive"}}Status is inactive{{/case}}
{{#default}}Unknown status{{/default}}
{{/switch}}`,
                language: 'html',
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: false }
            });

            // Variables Editor
            variablesEditor = monaco.editor.create(document.getElementById('variablesEditor'), {
                value: `{
  "name": "John Doe",
  "showWelcome": true,
  "status": "active",
  "items": [
    {
      "name": "Item 1",
      "description": "First item description"
    },
    {
      "name": "Item 2", 
      "description": "Second item description"
    }
  ]
}`,
                language: 'json',
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: false }
            });

            // Output Editor
            outputEditor = monaco.editor.create(document.getElementById('outputEditor'), {
                value: 'Click "Process Template" to see the output here...',
                language: 'html',
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: false },
                readOnly: true
            });

            // Auto-process on changes
            templateEditor.onDidChangeModelContent(() => processTemplate());
            variablesEditor.onDidChangeModelContent(() => processTemplate());
        });

        // Template Processing Engine
        function processTemplate() {
            try {
                const template = templateEditor.getValue();
                const variables = JSON.parse(variablesEditor.getValue());
                const result = renderTemplate(template, variables);
                outputEditor.setValue(result);
            } catch (error) {
                outputEditor.setValue(`Error: ${error.message}`);
            }
        }

        function renderTemplate(template, data) {
            let result = template;

            // Variable replacement {{variable}}
            result = result.replace(/\{\{([^#/}]+)\}\}/g, (match, varName) => {
                const value = getNestedValue(data, varName.trim());
                return value !== undefined ? value : match;
            });

            // If statements {{#if condition}}...{{/if}}
            result = result.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
                const value = getNestedValue(data, condition.trim());
                return value ? content : '';
            });

            // Each loops {{#each array}}...{{/each}}
            result = result.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, content) => {
                const array = getNestedValue(data, arrayName.trim());
                if (!Array.isArray(array)) return '';

                return array.map(item => {
                    return content.replace(/\{\{this\.([^}]+)\}\}/g, (match, prop) => {
                        return item[prop] !== undefined ? item[prop] : match;
                    });
                }).join('');
            });

            // Switch statements {{#switch value}}{{#case "val"}}...{{/case}}{{#default}}...{{/default}}{{/switch}}
            result = result.replace(/\{\{#switch\s+([^}]+)\}\}([\s\S]*?)\{\{\/switch\}\}/g, (match, switchVar, content) => {
                const switchValue = getNestedValue(data, switchVar.trim());

                // Find matching case
                const caseRegex = /\{\{#case\s+"([^"]+)"\}\}([\s\S]*?)\{\{\/case\}\}/g;
                let caseMatch;
                while ((caseMatch = caseRegex.exec(content)) !== null) {
                    if (caseMatch[1] === switchValue) {
                        return caseMatch[2];
                    }
                }

                // Check for default case
                const defaultMatch = content.match(/\{\{#default\}\}([\s\S]*?)\{\{\/default\}\}/);
                return defaultMatch ? defaultMatch[1] : '';
            });

            return result;
        }

        function getNestedValue(obj, path) {
            return path.split('.').reduce((current, key) => {
                return current && current[key] !== undefined ? current[key] : undefined;
            }, obj);
        }

        // File Handling
        document.getElementById('templateFile').addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    templateEditor.setValue(e.target.result);
                };
                reader.readAsText(file);
            }
        });

        document.getElementById('variablesFile').addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    try {
                        JSON.parse(e.target.result); // Validate JSON
                        variablesEditor.setValue(e.target.result);
                    } catch (error) {
                        alert('Invalid JSON file');
                    }
                };
                reader.readAsText(file);
            }
        });

        // Download Functions
        function downloadTemplate() {
            downloadFile(templateEditor.getValue(), 'template.txt', 'text/plain');
        }

        function downloadVariables() {
            downloadFile(variablesEditor.getValue(), 'variables.json', 'application/json');
        }

        function downloadOutput() {
            downloadFile(outputEditor.getValue(), 'output.txt', 'text/plain');
        }

        function downloadFile(content, filename, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Resizing functionality
        const leftPanel = document.getElementById('leftPanel');
        const rightPanel = document.getElementById('rightPanel');
        const bottomPanel = document.getElementById('bottomPanel');
        const verticalResizer = document.getElementById('verticalResizer');
        const horizontalResizer = document.getElementById('horizontalResizer');

        verticalResizer.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragType = 'vertical';
            document.body.style.cursor = 'col-resize';
        });

        horizontalResizer.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragType = 'horizontal';
            document.body.style.cursor = 'row-resize';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            if (dragType === 'vertical') {
                const containerWidth = leftPanel.parentElement.offsetWidth;
                const newLeftWidth = (e.clientX / containerWidth) * 100;

                if (newLeftWidth > 20 && newLeftWidth < 80) {
                    leftPanel.style.width = newLeftWidth + '%';
                    rightPanel.style.width = (100 - newLeftWidth) + '%';
                }
            } else if (dragType === 'horizontal') {
                const container = document.querySelector('.flex-1');
                const containerHeight = container.offsetHeight;
                const newBottomHeight = ((container.offsetHeight + container.offsetTop - e.clientY) / window.innerHeight) * 100;

                if (newBottomHeight > 15 && newBottomHeight < 60) {
                    bottomPanel.style.height = newBottomHeight + '%';
                }
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                dragType = '';
                document.body.style.cursor = 'default';
            }
        });

        // Initial template processing
        setTimeout(() => {
            if (templateEditor && variablesEditor && outputEditor) {
                processTemplate();
            }
        }, 1000);