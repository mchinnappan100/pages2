// app.js
// Import JSZip for ZIP file creation
// mohan chinnappan

// -- This script processes XML files, modifies them based on user input,
//  and allows downloading the modified files as a ZIP archive.

// Load Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.0/min/vs' } });
require(['vs/editor/editor.main'], function() {
    // Initialize Monaco Editors
    const editorLeft = monaco.editor.create(document.getElementById('editor-left'), {
        value: '',
        language: 'xml',
        theme: 'vs-dark',
        automaticLayout: true,
        readOnly: true,
        minimap: { enabled: false }
    });

    const editorRight = monaco.editor.create(document.getElementById('editor-right'), {
        value: '',
        language: 'xml',
        theme: 'vs-dark',
        automaticLayout: true,
        readOnly: true,
        minimap: { enabled: false }
    });

    // Store input files, their processed results, and modified files
    let inputFiles = [];
    let processedFiles = []; // Store { originalName, modifiedXml, replacements }
    let modifiedFiles = []; // Store modified files for ZIP
    let isProcessed = false; // Track if files have been processed

    // Handle file upload
    document.getElementById('xml-upload').addEventListener('change', function(e) {
        inputFiles = [];
        processedFiles = [];
        modifiedFiles = [];
        isProcessed = false;
        const fileSelector = document.getElementById('file-selector');
        fileSelector.innerHTML = '<option value="">Select a file</option>';
        fileSelector.disabled = true;
        editorLeft.setValue('');
        editorRight.setValue('');
        document.getElementById('download-btn').disabled = true;
        document.getElementById('replacement-message').textContent = '';
        document.getElementById('modified-files').classList.add('hidden');
        document.getElementById('modified-files-list').classList.add('hidden');

        const files = e.target.files;
        if (files.length === 0) return;

        fileSelector.disabled = false;
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                inputFiles.push({ name: file.name, content: e.target.result });
                const option = document.createElement('option');
                option.value = index;
                option.textContent = file.name;
                fileSelector.appendChild(option);
                // Display the first file by default
                if (index === 0) {
                    editorLeft.setValue(e.target.result);
                    fileSelector.value = '0';
                    editorRight.setValue(''); // Clear right editor until processed
                }
            };
            reader.readAsText(file);
        });
    });

    // Handle file selection
    document.getElementById('file-selector').addEventListener('change', function(e) {
        const index = e.target.value;
        if (index === '') {
            editorLeft.setValue('');
            editorRight.setValue('');
            return;
        }
        const file = inputFiles[index];
        editorLeft.setValue(file.content);
        // Show corresponding processed file if available
        if (isProcessed) {
            const processedFile = processedFiles.find(f => f.originalName === file.name);
            if (processedFile) {
                editorRight.setValue(processedFile.modifiedXml);
            } else {
                editorRight.setValue('// File not modified or processing failed');
            }
        } else {
            editorRight.setValue('// File not yet processed');
        }
    });

    // Toggle modified files list
    document.getElementById('toggle-modified-files').addEventListener('click', function() {
        const list = document.getElementById('modified-files-list');
        const button = document.getElementById('toggle-modified-files');
        if (list.classList.contains('hidden')) {
            list.classList.remove('hidden');
            button.textContent = 'Hide modified files';
        } else {
            list.classList.add('hidden');
            button.textContent = 'Show modified files';
        }
    });

    // Process XML
    document.getElementById('process-btn').addEventListener('click', function() {
        const customObjectsInput = document.getElementById('custom-objects').value.trim();
        const replacementMessage = document.getElementById('replacement-message');
        const modifiedFilesDiv = document.getElementById('modified-files');
        const modifiedFilesList = document.getElementById('modified-files-list');

        // Parse comma-separated custom objects
        const customObjects = customObjectsInput.split(',').map(obj => obj.trim()).filter(obj => obj);

        if (customObjects.length === 0 || inputFiles.length === 0) {
            alert('Please provide at least one custom object name and upload at least one XML file.');
            replacementMessage.textContent = '';
            modifiedFilesDiv.classList.add('hidden');
            modifiedFilesList.classList.add('hidden');
            editorRight.setValue('');
            document.getElementById('download-btn').disabled = true;
            return;
        }

        try {
            processedFiles = [];
            modifiedFiles = [];
            let totalReplacements = 0;
            const modifiedFileNames = [];

            inputFiles.forEach(file => {
                const result = processPermissionSetXml(file.content, customObjects);
                processedFiles.push({
                    originalName: file.name,
                    modifiedXml: result.replacements > 0 ? result.modifiedXml : file.content,
                    replacements: result.replacements
                });
                if (result.replacements > 0) {
                    modifiedFiles.push({
                        originalName: file.name,
                        name: file.name.replace(/\.permissionset-meta\.xml$/, '_modified.permissionset-meta.xml'),
                        content: result.modifiedXml
                    });
                    modifiedFileNames.push(file.name);
                    totalReplacements += result.replacements;
                }
            });

            isProcessed = true; // Mark files as processed

            // Update right editor with the modified content of the currently selected file
            const selectedIndex = document.getElementById('file-selector').value;
            if (selectedIndex !== '') {
                const selectedFile = inputFiles[selectedIndex];
                const processedFile = processedFiles.find(f => f.originalName === selectedFile.name);
                editorRight.setValue(processedFile ? processedFile.modifiedXml : '// File not modified or processing failed');
            }

            // Update replacement message
            replacementMessage.textContent = `Commented out ${totalReplacements} fieldPermissions element${totalReplacements === 1 ? '' : 's'} across ${inputFiles.length} file${inputFiles.length === 1 ? '' : 's'}`;

            // Update modified files list
            modifiedFilesList.innerHTML = '';
            if (modifiedFileNames.length > 0) {
                modifiedFileNames.forEach(name => {
                    const li = document.createElement('li');
                    li.textContent = name;
                    modifiedFilesList.appendChild(li);
                });
                modifiedFilesDiv.classList.remove('hidden');
            } else {
                modifiedFilesDiv.classList.add('hidden');
            }

            document.getElementById('download-btn').disabled = modifiedFiles.length === 0;
        } catch (err) {
            alert('Error processing XML: ' + err.message);
            editorRight.setValue('');
            document.getElementById('download-btn').disabled = true;
            replacementMessage.textContent = '';
            modifiedFilesDiv.classList.add('hidden');
            modifiedFilesList.classList.add('hidden');
            isProcessed = false;
        }
    });

    // Download modified files as ZIP
    document.getElementById('download-btn').addEventListener('click', function() {
        if (modifiedFiles.length === 0) return;

        const zip = new JSZip();
        modifiedFiles.forEach(file => {
            zip.file(file.name, file.content);
        });

        zip.generateAsync({ type: 'blob' }).then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'modified_permissionset_files.zip';
            a.click();
            URL.revokeObjectURL(url);
        });
    });
});

// XML Processing Logic (updated for multiple custom objects)
function processPermissionSetXml(inputXml, customObjects) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(inputXml, 'application/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error('Invalid XML');
    }

    // Get all fieldPermissions elements
    const fieldPermissions = xmlDoc.getElementsByTagNameNS('http://soap.sforce.com/2006/04/metadata', 'fieldPermissions');
    let replacements = 0;

    // Process each fieldPermissions element
    for (let i = fieldPermissions.length - 1; i >= 0; i--) {
        const fp = fieldPermissions[i];
        const field = fp.getElementsByTagNameNS('http://soap.sforce.com/2006/04/metadata', 'field')[0]?.textContent;

        if (field) {
            const parts = field.split('.');
            if (parts.length === 2 && customObjects.includes(parts[0])) {
                // Comment out this fieldPermissions section
                const serializer = new XMLSerializer();
                const fpXml = serializer.serializeToString(fp);
                const comment = xmlDoc.createComment('\n' + fpXml + '\n');
                fp.parentNode.replaceChild(comment, fp);
                replacements++;
            }
        }
    }

    // Serialize the modified XML
    const serializer = new XMLSerializer();
    let outputXml = serializer.serializeToString(xmlDoc);

    // Add XML declaration if missing and ensure <PermissionSet> is on a new line
    if (!outputXml.startsWith('<?xml')) {
        outputXml = '<?xml version="1.0" encoding="UTF-8"?>\n' + outputXml;
    } else {
        // Insert newline before <PermissionSet> or similar root tag
        outputXml = outputXml.replace(/(<?xml[^>]*>)(.*)/, '$1\n$2');
    }

    return {
        modifiedXml: outputXml,
        replacements: replacements
    };
}
