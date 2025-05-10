// view.js
// author: Mohan Chinnappan

// ----------

// Configure Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
let editor;
let currentDecorations = [];
require(['vs/editor/editor.main'], function () {
  editor = monaco.editor.create(document.getElementById('editor'), {
    value: '// Upload a Profile or Permission Set XML file to view its contents',
    language: 'xml',
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },  
    readOnly: false,
  });
  console.log('Monaco Editor initialized');
});

// Initialize DataTable
let table = $('#permissionsTable').DataTable({
  paging: true,
  pagingType: 'simple_numbers', // "Previous", "1, 2, 3", "Next"
  searching: true,
  ordering: true,
  info: true,
  autoWidth: false,
  scrollY: 'calc(100vh - 200px)', // Adjusted for header, filter, pagination
  scrollCollapse: false, // Prevent table height collapse
  lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, 'All']], // Added page size 5
  columns: [
    { data: 'type' },
    { data: 'name' },
    { data: 'enabled' },
    { data: 'object' },
    { data: 'field' },
    { data: 'read' },
    { data: 'edit' },
    { data: 'apexClass' },
    { data: 'application' },
    { data: 'layout' },
    { data: 'apexPage' },
    { data: 'recordType' },
    { data: 'default' },
    { data: 'flow' },
    { data: 'customMetadataType' },
    { data: 'tab' }
  ],
  dom: 'lfBptip' // Pagination (p) above table (t)


});

// Store parsed data for CSV export
let parsedData = [];
let uploadedFileName = ''; // Store uploaded file name
let uploadedFiles = []; // Store uploaded files



// Initialize Split.js
Split(['#left-pane', '#right-pane'], {
  sizes: [50, 50],
  minSize: 300,
  gutterSize: 8,
  direction: 'horizontal',
  onDragEnd: function () {
    if (editor) {
      editor.layout();
    }
    table.columns.adjust().draw();
  }
});

// Handle window resize
window.addEventListener('resize', function () {
  if (editor) {
    editor.layout();
  }
  table.columns.adjust().draw();
});

// Handle File Upload
document.getElementById('xmlFileInput').addEventListener('change', function (event) {
  uploadedFiles = Array.from(event.target.files); // Store all uploaded files
  if (!uploadedFiles.length) return;

  // Populate file selector dropdown
  const fileSelector = document.getElementById('fileSelector');
  fileSelector.innerHTML = '<option value="">Select a file</option>';
  uploadedFiles.forEach(file => {
    const option = document.createElement('option');
    option.value = file.name;
    option.textContent = file.name;
    fileSelector.appendChild(option);
  });

  // Automatically select the first file
  if (uploadedFiles.length > 0) {
    fileSelector.value = uploadedFiles[0].name;
    uploadedFileName = uploadedFiles[0].name;
    const reader = new FileReader();
    reader.onload = function (e) {
      const xmlText = e.target.result;
      editor.setValue(xmlText);
      parseXmlAndUpdateTable(xmlText);
    };
    reader.readAsText(uploadedFiles[0]);
  }
});

// Handle File Selection
document.getElementById('fileSelector').addEventListener('change', function () {
  const selectedFileName = this.value;
  if (!selectedFileName) {
    editor.setValue('// Select a file to view its contents');
    table.clear().draw();
    parsedData = [];
    uploadedFileName = '';
    return;
  }

  const selectedFile = uploadedFiles.find(file => file.name === selectedFileName);
  if (selectedFile) {
    uploadedFileName = selectedFile.name; // Update for XML download
    const reader = new FileReader();
    reader.onload = function (e) {
      const xmlText = e.target.result;
      editor.setValue(xmlText);
      parseXmlAndUpdateTable(xmlText);
    };
    reader.readAsText(selectedFile);
  }
});

// Define tag-to-attribute mapping
const tagMappings = {
  userPermissions: {
    type: 'User Permission',
    attributes: [
      { xml: 'name', table: 'name' },
      { xml: 'enabled', table: 'enabled' }
    ],
    keyAttribute: 'name'
  },
  objectPermissions: {
    type: 'Object Permission',
    attributes: [
      { xml: 'object', table: 'object' },
      { xml: 'allowRead', table: 'read' },
      { xml: 'allowEdit', table: 'edit' }
    ],
    keyAttribute: 'object'
  },
  fieldPermissions: {
    type: 'Field Permission',
    attributes: [
      { xml: 'field', table: 'field' },
      { xml: 'readable', table: 'read' },
      { xml: 'editable', table: 'edit' }
    ],
    keyAttribute: 'field'
  },
  classAccesses: {
    type: 'Apex Class Access',
    attributes: [
      { xml: 'apexClass', table: 'apexClass' },
      { xml: 'enabled', table: 'enabled' }
    ],
    keyAttribute: 'apexClass'
  },
  applicationVisibilities: {
    type: 'Application Visibility',
    attributes: [
      { xml: 'application', table: 'application' },
      { xml: 'visible', table: 'enabled' }
    ],
    keyAttribute: 'application'
  },
  customPermissions: {
    type: 'Custom Permission',
    attributes: [
      { xml: 'name', table: 'name' },
      { xml: 'enabled', table: 'enabled' }
    ],
    keyAttribute: 'name'
  },
  layoutAssignments: {
    type: 'Layout Assignment',
    attributes: [
      { xml: 'layout', table: 'layout' },
      { xml: 'recordType', table: 'recordType' }
    ],
    keyAttribute: 'layout'
  },
  pageAccesses: {
    type: 'Page Access',
    attributes: [
      { xml: 'apexPage', table: 'apexPage' },
      { xml: 'enabled', table: 'enabled' }
    ],
    keyAttribute: 'apexPage'
  },
  recordTypeVisibilities: {
    type: 'Record Type Visibility',
    attributes: [
      { xml: 'recordType', table: 'recordType' },
      { xml: 'visible', table: 'enabled' },
      { xml: 'default', table: 'default' }
    ],
    keyAttribute: 'recordType'
  },
  flowAccesses: {
    type: 'Flow Access',
    attributes: [
      { xml: 'flow', table: 'flow' },
      { xml: 'enabled', table: 'enabled' }
    ],
    keyAttribute: 'flow'
  },
  customMetadataTypeAccesses: {
    type: 'Custom Metadata Type Access',
    attributes: [
      { xml: 'name', table: 'customMetadataType' },
      { xml: 'enabled', table: 'enabled' }
    ],
    keyAttribute: 'name'
  },
  tabVisibilities: {
    type: 'Tab Visibility',
    attributes: [
      { xml: 'tab', table: 'tab' },
      { xml: 'visibility', table: 'enabled' }
    ],
    keyAttribute: 'tab'
  },
  customSettingAccesses: {
    type: 'Custom Setting Access',
    attributes: [
      { xml: 'name', table: 'name' },
      { xml: 'enabled', table: 'enabled' }
    ],
    keyAttribute: 'name'
  },
  tabSettings: {
    type: 'Tab Settings',
    attributes: [
      { xml: 'tab', table: 'tab' },
      { xml: 'visibility', table: 'enabled' }
    ],
    keyAttribute: 'tab'
  }
};

// Chart.js instance
let tagCountsChart = null;

// Parse XML and Populate DataTable
function parseXmlAndUpdateTable(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
  parsedData = [];

  // Helper to get text content or default
  const getText = (node, defaultValue = '') => (node ? node.textContent : defaultValue);

  // Create reverse mapping from type to tagName for editor search
  const typeToTagMap = {};
  Object.keys(tagMappings).forEach(tag => {
    typeToTagMap[tagMappings[tag].type] = tag;
  });

  // Track tag counts, duplicates, and uncovered tags
  const tagCounts = new Map();
  const duplicates = new Map();
  const uncoveredTags = new Set();
  const root = xmlDoc.documentElement;

  // Find unique tags and count occurrences
  const tags = new Set();
  for (let child of root.children) {
    const tagName = child.tagName;
    tags.add(tagName);
    tagCounts.set(tagName, (tagCounts.get(tagName) || 0) + 1);
    if (!tagMappings[tagName]) {
      uncoveredTags.add(tagName);
    }
  }

  // Parse each known tag and check for duplicates
  const uniqueTypes = new Set(['ALL']);
  for (let tag of tags) {
    if (!tagMappings[tag]) continue;
    const mapping = tagMappings[tag];
    uniqueTypes.add(mapping.type);
    const elements = xmlDoc.getElementsByTagName(tag);
    const keyValues = new Map();

    for (let elem of elements) {
      let row = { type: mapping.type };
      row.name = '';
      row.enabled = '';
      row.object = '';
      row.field = '';
      row.read = '';
      row.edit = '';
      row.apexClass = '';
      row.application = '';
      row.layout = '';
      row.apexPage = '';
      row.recordType = '';
      row.default = '';
      row.flow = '';
      row.customMetadataType = '';
      row.tab = '';

      for (let attr of mapping.attributes) {
        row[attr.table] = getText(elem.getElementsByTagName(attr.xml)[0], '');
      }

      if (mapping.keyAttribute) {
        let keyValue;
        if (tag === 'layoutAssignments') {
          const layout = row.layout || '';
          const recordType = row.recordType || '';
          keyValue = `${layout}|${recordType}`;
        } else {
          keyValue = row[mapping.keyAttribute];
        }
        if (keyValue) {
          keyValues.set(keyValue, (keyValues.get(keyValue) || 0) + 1);
        }
      }

      parsedData.push(row);
    }

    for (let [key, count] of keyValues) {
      if (count > 1) {
        if (tag === 'layoutAssignments') {
          const [layout, recordType] = key.split('|');
          duplicates.set(`${mapping.type}: ${layout} (Record Type: ${recordType || 'None'})`, count);
        } else {
          duplicates.set(`${mapping.type}: ${key}`, count);
        }
      }
    }
  }

  // Update KPI Section
  const uniqueElements = document.getElementById('uniqueElements');
  uniqueElements.textContent = `${tags.size}`;

  const uncoveredTagsDiv = document.getElementById('uncoveredTags');
  uncoveredTagsDiv.innerHTML = '';
  if (uncoveredTags.size > 0) {
    const ul = document.createElement('ul');
    ul.className = 'list-disc pl-5 text-sm';
    for (let tag of uncoveredTags) {
      const li = document.createElement('li');
      li.textContent = tag;
      ul.appendChild(li);
    }
    uncoveredTagsDiv.appendChild(ul);
  } else {
    uncoveredTagsDiv.innerHTML = '<p class="text-sm">All tags are covered.</p>';
  }

  // Update Tag Counts with Chart.js and Text List
  const tagCountsChartCanvas = document.getElementById('tagCountsChart');
  const tagCountsListDiv = document.getElementById('tagCountsList');
  tagCountsListDiv.innerHTML = '';
  if (tagCounts.size > 0) {
    const labels = Array.from(tagCounts.keys());
    const values = Array.from(tagCounts.values());

    // Render Chart.js Bar Chart
    if (tagCountsChart) {
      tagCountsChart.destroy(); // Destroy previous chart instance
    }
    tagCountsChart = new Chart(tagCountsChartCanvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Tag Counts',
          data: values,
          backgroundColor: '#3b82f6', // Tailwind blue-600
          borderColor: '#1d4ed8', // Tailwind blue-700
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Tags'
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              autoSkip: false
            }
          },
          y: {
            title: {
              display: true,
              text: 'Count'
            },
            ticks: {
              stepSize: 1 // Integer ticks
            },
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false // Hide legend
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.raw}`;
              }
            }
          }
        }
      }
    });

    // Render Bulleted List
    const ul = document.createElement('ul');
    ul.className = 'list-disc pl-5 text-sm text-gray-600';
    for (let [tag, count] of tagCounts) {
      const li = document.createElement('li');
      li.textContent = `${tag}: ${count}`;
      ul.appendChild(li);
    }
    tagCountsListDiv.appendChild(ul);

    // Add Screen Reader Table
    const srTable = document.createElement('table');
    srTable.className = 'sr-only';
    srTable.setAttribute('aria-label', 'Tag counts data');
    srTable.innerHTML = `<tr><th>Tag</th><th>Count</th></tr>${labels.map((label, i) => `<tr><td>${label}</td><td>${values[i]}</td></tr>`).join('')}`;
    tagCountsListDiv.appendChild(srTable);
  } else {
    const p = document.createElement('p');
    p.className = 'text-sm text-gray-600 text-center';
    p.textContent = 'No tags found.';
    tagCountsListDiv.appendChild(p);
  }

  const duplicatesDiv = document.getElementById('duplicates');
  duplicatesDiv.innerHTML = '';
  if (duplicates.size > 0) {
    const ul = document.createElement('ul');
    ul.className = 'list-disc pl-5 text-sm';
    for (let [key, count] of duplicates) {
      const li = document.createElement('li');
      li.textContent = `${key} (${count} times)`;
      ul.appendChild(li);
    }
    duplicatesDiv.appendChild(ul);
  } else {
    duplicatesDiv.innerHTML = '<p class="text-sm">No duplicates found.</p>';
  }

  // Populate dropdown with unique types
  const tagFilter = document.getElementById('tagFilter');
  tagFilter.innerHTML = '';
  uniqueTypes.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    tagFilter.appendChild(option);
  });

  // Clear and Update Table
  table.clear();
  table.rows.add(parsedData).draw();

  // Reset filter to ALL
  tagFilter.value = 'ALL';
  table.column(0).search('').draw();

  // Clear editor highlights
  currentDecorations = editor.deltaDecorations(currentDecorations, []);
}

// Filter Table and Search Editor
document.getElementById('tagFilter').addEventListener('change', function () {
  const selectedTag = this.value;

  if (selectedTag === 'ALL') {
    table.column(0).search('').draw();
  } else {
    table.column(0).search('^' + selectedTag + '$', true, false).draw();
  }

  if (!editor) {
    console.warn('Editor not initialized');
    return;
  }

  currentDecorations = editor.deltaDecorations(currentDecorations, []);

  if (selectedTag !== 'ALL') {
    const typeToTagMap = {};
    Object.keys(tagMappings).forEach(tag => {
      typeToTagMap[tagMappings[tag].type] = tag;
    });
    const tagName = typeToTagMap[selectedTag];
    if (tagName) {
      const searchRegex = new RegExp(`<${tagName}>|</${tagName}>`, 'g');
      const model = editor.getModel();
      if (!model) {
        console.warn('Editor model not available');
        return;
      }

      const matches = model.findMatches(searchRegex, true, true, true, null, true);
      console.log(`Found ${matches.length} matches for ${tagName}`);

      const decorations = matches.map(match => ({
        range: match.range,
        options: {
          isWholeLine: false,
          className: 'highlight',
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
        }
      }));

      currentDecorations = editor.deltaDecorations(currentDecorations, decorations);
      console.log(`Applied ${decorations.length} decorations`);

      if (matches.length > 0) {
        editor.revealRangeAtTop(matches[0].range);
      }
    } else {
      console.warn(`No tagName found for type: ${selectedTag}`);
    }
  }
});

// Export to CSV
document.getElementById('exportCsv').addEventListener('click', function () {
  if (!parsedData.length) {
    alert('No data to export. Please upload an XML file first.');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(parsedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Permissions');

  const csv = XLSX.write(workbook, { bookType: 'csv', type: 'string' });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `permissions_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

// Export to XLSX with tabs for each tag type
document.getElementById('exportXlsx').addEventListener('click', function () {
  if (!parsedData.length) {
    alert('No data to export. Please upload an XML file first.');
    return;
  }

  // Define table headers matching DataTable columns
  const headers = [
    'Type', 'Name', 'Enabled', 'Object', 'Field', 'Read', 'Edit',
    'Apex Class', 'Application', 'Layout', 'Apex Page', 'Record Type',
    'Default', 'Flow', 'Custom Metadata Type', 'Tab'
  ];

  // Group data by tag type
  const groupedData = {};
  parsedData.forEach(row => {
    if (!groupedData[row.type]) {
      groupedData[row.type] = [];
    }
    groupedData[row.type].push(row);
  });

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Create a worksheet for each tag type
  Object.keys(groupedData).forEach(type => {
    // Convert data to array of arrays for SheetJS
    const data = groupedData[type].map(row => [
      row.type, row.name, row.enabled, row.object, row.field, row.read, row.edit,
      row.apexClass, row.application, row.layout, row.apexPage, row.recordType,
      row.default, row.flow, row.customMetadataType, row.tab
    ]);

    // Create worksheet with headers
    const worksheetData = [headers, ...data];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Sanitize sheet name (remove invalid characters: \, /, *, [, ], :, ?)
    let sheetName = type.replace(/[\\\/*\[\]:?]/g, '_').substring(0, 31); // Excel max 31 chars
    if (!sheetName) sheetName = 'Sheet'; // Fallback

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  // Generate and download XLSX file
  XLSX.writeFile(workbook, `permissions_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`);
});

// Download XML from Monaco Editor
document.getElementById('downloadXml').addEventListener('click', function () {
  if (!editor || !editor.getValue()) {
    alert('No XML content to download. Please upload an XML file first.');
    return;
  }

  const xmlContent = editor.getValue();
  let fileName = 'edited.xml'; // Default file name
  if (uploadedFileName) {
    const baseName = uploadedFileName.replace(/\.[^/.]+$/, ''); // Remove extension
    fileName = `${baseName}-edited.xml`;
  }

  const blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});