    let csvData = [];
    let sqlDb = null;
    let editor = null;
    let resultsTable = null;
    let csvTable = null;
    let csvColumns = []; // Store CSV column names for autocomplete
    
    // Initialize Monaco Editor
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' } });
    require(['vs/editor/editor.main'], function () {
        editor = monaco.editor.create(document.getElementById('editor'), {
            value: 'SELECT * FROM data LIMIT 10;',
            language: 'sql',
            theme: 'vs-dark',
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            automaticLayout: true
        });

        // Register autocomplete provider
        registerAutocompleteProvider();
    });
    
    // Function to register or update the autocomplete provider
    function registerAutocompleteProvider() {
        // Dispose of existing provider to avoid duplicates
        if (window.autocompleteProvider) {
            window.autocompleteProvider.dispose();
        }

        window.autocompleteProvider = monaco.languages.registerCompletionItemProvider('sql', {
            triggerCharacters: [' ', '.', ','], // Trigger on space, dot, or comma
            provideCompletionItems: function(model, position) {
                if (!csvColumns || csvColumns.length === 0) {
                    console.warn('No CSV columns available for autocomplete');
                    return { suggestions: [] };
                }

                const suggestions = csvColumns.map(col => ({
                    label: col,
                    kind: monaco.languages.CompletionItemKind.Field,
                    insertText: col,
                    detail: 'CSV Column',
                    range: null // Let Monaco handle the range
                }));

                console.log('Providing autocomplete suggestions:', suggestions);
                return { suggestions };
            }
        });
    }
    
    // Initialize SQL.js
    initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    }).then(function(SQL) {
        sqlDb = new SQL.Database();
        loadQueryHistory();
    }).catch(err => {
        console.error('Failed to initialize SQL.js:', err);
        showError('Failed to initialize database');
    });
    
    // File upload handling
    document.getElementById('csvFile').addEventListener('change', handleFileSelect);
    
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    
    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    }
    
    function handleDragLeave(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    }
    
    function handleDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }
    
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    }
    
    function processFile(file) {
        if (!file.name.toLowerCase().endsWith('.csv')) {
            showError('Please select a CSV file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const csv = e.target.result;
            parseCSV(csv, file);
        };
        reader.readAsText(file);
    }
    
    function parseCSV(csv, file) {
        Papa.parse(csv, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: function(results) {
                if (results.errors.length > 0) {
                    showError('Error parsing CSV: ' + results.errors[0].message);
                    return;
                }
                
                csvData = results.data;
                csvColumns = Object.keys(csvData[0] || {}); // Store column names for autocomplete
                console.log('CSV Columns loaded:', csvColumns);
                displayFileInfo(file, csvData);
                displayCSVData(csvData);
                setupSQLDatabase(csvData);
                showSections();
                registerAutocompleteProvider(); // Re-register provider with updated columns
            },
            error: function(error) {
                showError('Error reading file: ' + error.message);
            }
        });
    }
    
    function displayFileInfo(file, data) {
        const fileInfo = document.getElementById('fileInfo');
        fileInfo.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <strong>File:</strong> ${file.name}<br>
                    <strong>Size:</strong> ${formatFileSize(file.size)}<br>
                    <strong>Type:</strong> ${file.type || 'text/csv'}
                </div>
                <div class="col-md-6">
                    <strong>Rows:</strong> ${data.length}<br>
                    <strong>Columns:</strong> ${Object.keys(data[0] || {}).length}<br>
                    <strong>Status:</strong> <span class="text-success">Loaded successfully</span>
                </div>
            </div>
        `;
        fileInfo.style.display = 'block';
        
        // Update stats
        document.getElementById('rowCount').textContent = data.length;
        document.getElementById('columnCount').textContent = Object.keys(data[0] || {}).length;
        document.getElementById('fileSize').textContent = formatFileSize(file.size);
        document.getElementById('fileNameDisplay').textContent = file.name;
        document.getElementById('statsRow').style.display = 'flex';
        document.getElementById('fileInfoBar').style.display = 'block';
    }
    
    function displayCSVData(data) {
        if (csvTable) {
            csvTable.destroy();
        }
        
        const table = document.getElementById('csvTable');
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        
        thead.innerHTML = '';
        tbody.innerHTML = '';
        
        if (data.length === 0) return;
        
        // Create header
        const headerRow = document.createElement('tr');
        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        
        // Create body
        data.forEach(row => {
            const tr = document.createElement('tr');
            Object.values(row).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value || '';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        
        // Initialize DataTable
        csvTable = $('#csvTable').DataTable({
            pageLength: 25,
            lengthMenu: [10, 25, 50, 100],
            responsive: true,
            dom: 'Bfrtip',
            buttons: [],
            scrollX: true
        });
    }
    
    function setupSQLDatabase(data) {
        if (!sqlDb || data.length === 0) return;
        
        // Drop existing table
        try {
            sqlDb.run('DROP TABLE IF EXISTS data');
        } catch (e) {
            console.error('Error dropping table:', e);
        }
        
        // Create table structure
        const columns = Object.keys(data[0]);
        const columnDefs = columns.map(col => `"${col}" TEXT`).join(', ');
        sqlDb.run(`CREATE TABLE data (${columnDefs})`);
        
        // Insert data
        const placeholders = columns.map(() => '?').join(', ');
        const stmt = sqlDb.prepare(`INSERT INTO data VALUES (${placeholders})`);
        
        data.forEach(row => {
            const values = columns.map(col => row[col] || '');
            stmt.run(values);
        });
        
        stmt.free();
    }
    
    function executeSQL() {
        if (!sqlDb || !editor) {
            showError('Database not initialized or editor not ready');
            return;
        }
        
        const query = editor.getValue().trim();
        if (!query) {
            showError('Please enter a SQL query');
            return;
        }
        
        document.getElementById('queryLoading').style.display = 'block';
        hideError();
        
        setTimeout(() => {
            try {
                const results = sqlDb.exec(query);
                displayQueryResults(results, query);
                saveQueryToHistory(query); // Save query to history
            } catch (error) {
                showError('SQL Error: ' + error.message);
            } finally {
                document.getElementById('queryLoading').style.display = 'none';
            }
        }, 100);
    }
    
    function displayQueryResults(results, query) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsInfo = document.getElementById('resultsInfo');
        
        if (results.length === 0) {
            resultsInfo.innerHTML = '<strong>Query executed successfully!</strong> No results returned.';
            resultsInfo.style.display = 'block';
            resultsSection.style.display = 'block';
            
            if (resultsTable) {
                resultsTable.destroy();
                document.getElementById('resultsTable').innerHTML = '<thead></thead><tbody></tbody>';
            }
            return;
        }
        
        const result = results[0];
        const data = result.values.map(row => {
            const obj = {};
            result.columns.forEach((col, index) => {
                obj[col] = row[index];
            });
            return obj;
        });
        
        resultsInfo.innerHTML = `
            <strong>Query executed successfully!</strong> 
            Returned ${data.length} rows in ${result.columns.length} columns.
        `;
        resultsInfo.style.display = 'block';
        
        if (resultsTable) {
            resultsTable.destroy();
        }
        
        const table = document.getElementById('resultsTable');
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        
        thead.innerHTML = '';
        tbody.innerHTML = '';
        
        // Create header
        const headerRow = document.createElement('tr');
        result.columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        
        // Create body
        data.forEach(row => {
            const tr = document.createElement('tr');
            result.columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = row[col] || '';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        
        // Initialize DataTable
        resultsTable = $('#resultsTable').DataTable({
            pageLength: 25,
            lengthMenu: [10, 25, 50, 100],
            responsive: true,
            scrollX: true,
            dom: 'Bfrtip',
            buttons: []
        });
        
        resultsSection.style.display = 'block';
        
        // Store results for export
        window.queryResults = data;
    }
    
    function exportResults() {
        if (!window.queryResults) {
            showError('No results to export');
            return;
        }
        
        const csv = Papa.unparse(window.queryResults);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'query_results.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    function clearEditor() {
        if (editor) {
            editor.setValue('');
        }
    }
    
    function showSections() {
        document.getElementById('dataSection').style.display = 'block';
        document.getElementById('sqlSection').style.display = 'block';
    }
    
    function showError(message) {
        const errorAlert = document.getElementById('errorAlert');
        errorAlert.textContent = message;
        errorAlert.style.display = 'block';
        setTimeout(() => {
            errorAlert.style.display = 'none';
        }, 5000);
    }
    
    function hideError() {
        document.getElementById('errorAlert').style.display = 'none';
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Query History Functions
    function saveQueryToHistory(query) {
        const maxHistoryLength = 20; // Limit history to 20 queries
        let queryHistory = JSON.parse(localStorage.getItem('queryHistory') || '[]');
        queryHistory = queryHistory.filter(q => q !== query); // Remove duplicates
        queryHistory.unshift(query); // Add new query to the start
        if (queryHistory.length > maxHistoryLength) {
            queryHistory.pop(); // Remove oldest query if exceeding limit
        }
        localStorage.setItem('queryHistory', JSON.stringify(queryHistory));
        loadQueryHistory();
    }

    function loadQueryHistory() {
        const queryHistory = JSON.parse(localStorage.getItem('queryHistory') || '[]');
        const select = document.getElementById('queryHistory');
        select.innerHTML = '<option value="">Select a previous query...</option>';
        queryHistory.forEach(query => {
            const option = document.createElement('option');
            option.value = query;
            option.textContent = query.length > 50 ? query.substring(0, 47) + '...' : query;
            select.appendChild(option);
        });
    }

    function loadQueryFromHistory() {
        const select = document.getElementById('queryHistory');
        const selectedQuery = select.value;
        if (selectedQuery && editor) {
            editor.setValue(selectedQuery);
        }
    }

    function clearQueryHistory() {
        localStorage.removeItem('queryHistory');
        loadQueryHistory();
        showError('Query history cleared');
    }