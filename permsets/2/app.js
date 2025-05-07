// app.js
// mohan chinnappan

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
                if (index === 0) {
                    editorLeft.setValue(e.target.result);
                    fileSelector.value = '0';
                    editorRight.setValue('');
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
        // Collect inputs
        const customObjectsInput = document.getElementById('custom-objects').value.trim();
        const objectsInput = document.getElementById('objects').value.trim();
        const tabsInput = document.getElementById('tabs').value.trim();
        const applicationsInput = document.getElementById('applications').value.trim();
        const layoutsInput = document.getElementById('layouts').value.trim();

        const replacementMessage = document.getElementById('replacement-message');
        const modifiedFilesDiv = document.getElementById('modified-files');
        const modifiedFilesList = document.getElementById('modified-files-list');

        // Parse comma-separated inputs
        const customObjects = customObjectsInput.split(',').map(obj => obj.trim()).filter(obj => obj);
        const objects = objectsInput.split(',').map(obj => obj.trim()).filter(obj => obj);
        const tabs = tabsInput.split(',').map(tab => tab.trim()).filter(tab => tab);
        const applications = applicationsInput.split(',').map(app => app.trim()).filter(app => app);
        const layouts = layoutsInput.split(',').map(layout => layout.trim()).filter(layout => layout);

        // Check if at least one input is provided and files are uploaded
        if (customObjects.length === 0 && objects.length === 0 && tabs.length === 0 && applications.length === 0 && layouts.length === 0) {
            alert('Please provide at least one name for custom objects, objects, tabs, applications, or layouts.');
            resetUI();
            return;
        }
        if (inputFiles.length === 0) {
            alert('Please upload at least one XML file.');
            resetUI();
            return;
        }

        try {
            processedFiles = [];
            modifiedFiles = [];
            const modifiedFileNames = [];
            const replacementCounts = {
                fieldPermissions: 0,
                objectPermissions: 0,
                tabSettings: 0,
                applicationVisibilities: 0,
                layoutAssignments: 0
            };

            inputFiles.forEach(file => {
                const result = processPermissionSetXml(file.content, {
                    customObjects,
                    objects,
                    tabs,
                    applications,
                    layouts
                });
                processedFiles.push({
                    originalName: file.name,
                    modifiedXml: result.modifiedXml,
                    replacements: result.replacements
                });
                if (result.replacements.total > 0) {
                    modifiedFiles.push({
                        originalName: file.name,
                        name: file.name.replace(/\.permissionset-meta\.xml$/, '_modified.permissionset-meta.xml'),
                        content: result.modifiedXml
                    });
                    modifiedFileNames.push(file.name);
                    replacementCounts.fieldPermissions += result.replacements.fieldPermissions;
                    replacementCounts.objectPermissions += result.replacements.objectPermissions;
                    replacementCounts.tabSettings += result.replacements.tabSettings;
                    replacementCounts.applicationVisibilities += result.replacements.applicationVisibilities;
                    replacementCounts.layoutAssignments += result.replacements.layoutAssignments;
                }
            });

            isProcessed = true;

            // Update right editor with the modified content of the currently selected file
            const selectedIndex = document.getElementById('file-selector').value;
            if (selectedIndex !== '') {
                const selectedFile = inputFiles[selectedIndex];
                const processedFile = processedFiles.find(f => f.originalName === selectedFile.name);
                editorRight.setValue(processedFile ? processedFile.modifiedXml : '// File not modified or processing failed');
            }

            // Update replacement message
            const totalReplacements = Object.values(replacementCounts).reduce((sum, count) => sum + count, 0);
            const messageParts = [];
            if (replacementCounts.fieldPermissions > 0) messageParts.push(`${replacementCounts.fieldPermissions} fieldPermissions`);
            if (replacementCounts.objectPermissions > 0) messageParts.push(`${replacementCounts.objectPermissions} objectPermissions`);
            if (replacementCounts.tabSettings > 0) messageParts.push(`${replacementCounts.tabSettings} tabSettings`);
            if (replacementCounts.applicationVisibilities > 0) messageParts.push(`${replacementCounts.applicationVisibilities} applicationVisibilities`);
            if (replacementCounts.layoutAssignments > 0) messageParts.push(`${replacementCounts.layoutAssignments} layoutAssignments`);
            replacementMessage.textContent = `Commented out ${totalReplacements} element${totalReplacements === 1 ? '' : 's'} (${messageParts.join(', ')}) across ${inputFiles.length} file${inputFiles.length === 1 ? '' : 's'}`;

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
            resetUI();
        }

        function resetUI() {
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

// XML Processing Logic
function processPermissionSetXml(inputXml, inputs) {
    const { customObjects, objects, tabs, applications, layouts } = inputs;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(inputXml, 'application/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error('Invalid XML');
    }

    const namespace = 'http://soap.sforce.com/2006/04/metadata';
    const replacements = {
        fieldPermissions: 0,
        objectPermissions: 0,
        tabSettings: 0,
        applicationVisibilities: 0,
        layoutAssignments: 0,
        total: 0
    };

    // Helper function to comment out an element
    function commentOutElement(element, countKey) {
        const serializer = new XMLSerializer();
        const xml = serializer.serializeToString(element);
        const comment = xmlDoc.createComment('\n' + xml + '\n');
        element.parentNode.replaceChild(comment, element);
        replacements[countKey]++;
        replacements.total++;
    }

    // Process fieldPermissions
    if (customObjects.length > 0) {
        const fieldPermissions = xmlDoc.getElementsByTagNameNS(namespace, 'fieldPermissions');
        for (let i = fieldPermissions.length - 1; i >= 0; i--) {
            const fp = fieldPermissions[i];
            const field = fp.getElementsByTagNameNS(namespace, 'field')[0]?.textContent;
            if (field) {
                const parts = field.split('.');
                if (parts.length === 2 && customObjects.includes(parts[0])) {
                    commentOutElement(fp, 'fieldPermissions');
                }
            }
        }
    }

    // Process objectPermissions
    if (objects.length > 0) {
        const objectPermissions = xmlDoc.getElementsByTagNameNS(namespace, 'objectPermissions');
        for (let i = objectPermissions.length - 1; i >= 0; i--) {
            const op = objectPermissions[i];
            const object = op.getElementsByTagNameNS(namespace, 'object')[0]?.textContent;
            if (object && objects.includes(object)) {
                commentOutElement(op, 'objectPermissions');
            }
        }
    }

    // Process tabSettings
    if (tabs.length > 0) {
        const tabSettings = xmlDoc.getElementsByTagNameNS(namespace, 'tabSettings');
        for (let i = tabSettings.length - 1; i >= 0; i--) {
            const ts = tabSettings[i];
            const tab = ts.getElementsByTagNameNS(namespace, 'tab')[0]?.textContent;
            if (tab && tabs.includes(tab)) {
                commentOutElement(ts, 'tabSettings');
            }
        }
    }

    // Process applicationVisibilities
    if (applications.length > 0) {
        const applicationVisibilities = xmlDoc.getElementsByTagNameNS(namespace, 'applicationVisibilities');
        for (let i = applicationVisibilities.length - 1; i >= 0; i--) {
            const av = applicationVisibilities[i];
            const application = av.getElementsByTagNameNS(namespace, 'application')[0]?.textContent;
            if (application && applications.includes(application)) {
                commentOutElement(av, 'applicationVisibilities');
            }
        }
    }

    // Process layoutAssignments
    if (layouts.length > 0) {
        const layoutAssignments = xmlDoc.getElementsByTagNameNS(namespace, 'layoutAssignments');
        for (let i = layoutAssignments.length - 1; i >= 0; i--) {
            const la = layoutAssignments[i];
            const layout = la.getElementsByTagNameNS(namespace, 'layout')[0]?.textContent;
            if (layout && layouts.includes(layout)) {
                commentOutElement(la, 'layoutAssignments');
            }
        }
    }

    // Serialize the modified XML
    const serializer = new XMLSerializer();
    let outputXml = serializer.serializeToString(xmlDoc);

    // Add XML declaration if missing and ensure root tag is on a new line
    if (!outputXml.startsWith('<?xml')) {
        outputXml = '<?xml version="1.0" encoding="UTF-8"?>\n' + outputXml;
    } else {
        outputXml = outputXml.replace(/(<?xml[^>]*>)(.*)/, '$1\n$2');
    }

    return {
        modifiedXml: outputXml,
        replacements
    };
}