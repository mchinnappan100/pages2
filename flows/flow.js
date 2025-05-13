// flow.js
// Author: Mohan Chinnappan

// Configure Monaco Editor
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
let editor;
require(['vs/editor/editor.main'], function () {
  editor = monaco.editor.create(document.getElementById('editor'), {
    value: '// Upload a Flow XML file to view its contents',
    language: 'xml',
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    readOnly: false,
  });
  console.log('Monaco Editor initialized');
});

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
  },
});

// Handle window resize
window.addEventListener('resize', function () {
  if (editor) {
    editor.layout();
  }
});

// Chart.js instance
let nodeTypesChart = null;

// Initialize Mermaid
mermaid.initialize({ startOnLoad: false, theme: 'default' });

// Global nodes, edges, and mermaidCode
let nodes = [];
let edges = [];
let mermaidCode = '';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
  // Handle File Upload
  let uploadedFiles = [];
  let uploadedFileName = '';
  const xmlFileInput = document.getElementById('xmlFileInput');
  if (xmlFileInput) {
    xmlFileInput.addEventListener('change', function (event) {
      uploadedFiles = Array.from(event.target.files);
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
          parseXmlAndUpdateDiagram(xmlText);
        };
        reader.readAsText(uploadedFiles[0]);
      }
    });
  }

  // Handle File Selection
  const fileSelector = document.getElementById('fileSelector');
  if (fileSelector) {
    fileSelector.addEventListener('change', function () {
      const selectedFileName = this.value;
      if (!selectedFileName) {
        editor.setValue('// Select a file to view its contents');
        document.getElementById('mermaidCode').textContent = '';
        document.getElementById('mermaidCode').classList.add('hidden');
        document.getElementById('diagram').innerHTML = '';
        nodes = [];
        edges = [];
        mermaidCode = '';
        updateKPIs({ start: 0, recordLookups: 0, recordUpdates: 0, other: 0 }, new Set());
        uploadedFileName = '';
        return;
      }

      const selectedFile = uploadedFiles.find(file => file.name === selectedFileName);
      if (selectedFile) {
        uploadedFileName = selectedFile.name;
        const reader = new FileReader();
        reader.onload = function (e) {
          const xmlText = e.target.result;
          editor.setValue(xmlText);
          parseXmlAndUpdateDiagram(xmlText);
        };
        reader.readAsText(selectedFile);
      }
    });
  }

  // Handle Draw Flow
  const drawFlowBtn = document.getElementById('drawFlow');
  if (drawFlowBtn) {
    drawFlowBtn.addEventListener('click', function () {
      if (!mermaidCode) {
        alert('No diagram code available. Please upload a Flow XML file first.');
        return;
      }
      const diagramElement = document.getElementById('diagram');
      diagramElement.innerHTML = ''; // Clear previous content
      if (document) {
        mermaid.render('mermaid-diagram', mermaidCode, (svgCode) => {
          diagramElement.innerHTML = svgCode;
        }).catch(err => {
          console.error('Mermaid render error:', err);
          diagramElement.innerHTML = '<p>Error rendering diagram. Please check the console.</p>';
        });
      } else {
        console.error('DOM not available for Mermaid rendering');
        diagramElement.innerHTML = '<p>Error: DOM not available.</p>';
      }
    });
  }

  // Export Diagram as PNG
  const exportImageBtn = document.getElementById('exportImage');
  if (exportImageBtn) {
    exportImageBtn.addEventListener('click', function () {
      const diagramElement = document.getElementById('diagram');
      if (!diagramElement.innerHTML) {
        alert('No diagram to export. Please draw the flow first.');
        return;
      }

      html2canvas(diagramElement).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `flow_diagram_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }).catch(err => {
        console.error('html2canvas error:', err);
        alert('Failed to export diagram. Please try again.');
      });
    });
  }

  // Download XML from Monaco Editor
  const downloadXmlBtn = document.getElementById('downloadXml');
  if (downloadXmlBtn) {
    downloadXmlBtn.addEventListener('click', function () {
      if (!editor || !editor.getValue()) {
        alert('No XML content to download. Please upload a Flow XML file first.');
        return;
      }

      const xmlContent = editor.getValue();
      let fileName = 'edited.xml';
      if (uploadedFileName) {
        const baseName = uploadedFileName.replace(/\.[^/.]+$/, '');
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
  }
});

// Parse XML and Update Diagram
function parseXmlAndUpdateDiagram(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
  const root = xmlDoc.documentElement;

  // Helper to get text content
  const getText = (node, defaultValue = '') => (node ? node.textContent : defaultValue);

  // Reset nodes, edges, and mermaidCode
  nodes = [];
  edges = [];
  mermaidCode = 'graph TD;\n';
  const nodeCounts = { start: 0, recordLookups: 0, recordUpdates: 0, other: 0 };
  const uniqueElements = new Set();
  const mermaidStyles = [];

  // Parse start
  const startElements = xmlDoc.getElementsByTagName('start');
  for (let elem of startElements) {
    uniqueElements.add('start');
    nodeCounts.start++;
    nodes.push({ id: 'start', label: 'Start', type: 'start' });
    mermaidStyles.push('style start fill:#fef08a,stroke:#3b82f6,stroke-width:2px');
    const connector = elem.getElementsByTagName('connector')[0];
    if (connector) {
      const target = getText(connector.getElementsByTagName('targetReference')[0]);
      edges.push({ source: 'start', target });
    }
  }

  // Parse recordLookups
  const recordLookupElements = xmlDoc.getElementsByTagName('recordLookups');
  for (let elem of recordLookupElements) {
    uniqueElements.add('recordLookups');
    nodeCounts.recordLookups++;
    const name = getText(elem.getElementsByTagName('name')[0]);
    const label = getText(elem.getElementsByTagName('label')[0], name);
    nodes.push({ id: name, label, type: 'recordLookups' });
    mermaidStyles.push(`style ${name} fill:#a3e635,stroke:#3b82f6,stroke-width:2px`);
    const connector = elem.getElementsByTagName('connector')[0];
    if (connector) {
      const target = getText(connector.getElementsByTagName('targetReference')[0]);
      edges.push({ source: name, target });
    }
  }

  // Parse recordUpdates
  const recordUpdateElements = xmlDoc.getElementsByTagName('recordUpdates');
  for (let elem of recordUpdateElements) {
    uniqueElements.add('recordUpdates');
    nodeCounts.recordUpdates++;
    const name = getText(elem.getElementsByTagName('name')[0]);
    const label = getText(elem.getElementsByTagName('label')[0], name);
    nodes.push({ id: name, label, type: 'recordUpdates' });
    mermaidStyles.push(`style ${name} fill:#2dd4bf,stroke:#3b82f6,stroke-width:2px`);
    const connector = elem.getElementsByTagName('connector')[0];
    if (connector) {
      const target = getText(connector.getElementsByTagName('targetReference')[0]);
      edges.push({ source: name, target });
    }
  }

  // Parse other elements (e.g., decisions, assignments)
  const otherElements = ['decisions', 'assignments', 'loops'];
  otherElements.forEach(tag => {
    const elements = xmlDoc.getElementsByTagName(tag);
    for (let elem of elements) {
      uniqueElements.add(tag);
      nodeCounts.other++;
      const name = getText(elem.getElementsByTagName('name')[0], `Unknown_${tag}`);
      const label = getText(elem.getElementsByTagName('label')[0], name);
      nodes.push({ id: name, label, type: 'other' });
      mermaidStyles.push(`style ${name} fill:#bfdbfe,stroke:#3b82f6,stroke-width:2px`);
      const connector = elem.getElementsByTagName('connector')[0];
      if (connector) {
        const target = getText(connector.getElementsByTagName('targetReference')[0]);
        edges.push({ source: name, target });
      }
    }
  });

  // Generate Mermaid flowchart
  nodes.forEach(node => {
    // Sanitize label to avoid Mermaid syntax issues (e.g., spaces, special chars)
    const safeLabel = node.label.replace(/[^a-zA-Z0-9]/g, '_');
    mermaidCode += `${node.id}["${node.label}"];\n`;
  });
  edges.forEach(edge => {
    mermaidCode += `${edge.source} --> ${edge.target};\n`;
  });
  mermaidStyles.forEach(style => {
    mermaidCode += `${style};\n`;
  });

  // Display Mermaid code
  const mermaidCodeElement = document.getElementById('mermaidCode');
  mermaidCodeElement.textContent = mermaidCode;
  mermaidCodeElement.classList.remove('hidden');

  // Clear diagram until "Draw Flow" is clicked
  const diagramElement = document.getElementById('diagram');
  diagramElement.innerHTML = '';

  // Update KPI Section
  updateKPIs(nodeCounts, uniqueElements);
}

// Update KPIs
function updateKPIs(nodeCounts, uniqueElements) {
  // Update Unique Elements
  document.getElementById('uniqueElements').textContent = uniqueElements.size;

  // Update Node Count
  const totalNodes = nodeCounts.start + nodeCounts.recordLookups + nodeCounts.recordUpdates + nodeCounts.other;
  document.getElementById('nodeCount').textContent = totalNodes;

  // Update Connection Count
  const connectionCount = edges.length;
  document.getElementById('connectionCount').textContent = connectionCount;

  // Update Node Types Chart
  const nodeTypesChartCanvas = document.getElementById('nodeTypesChart');
  if (nodeTypesChart) {
    nodeTypesChart.destroy();
  }
  nodeTypesChart = new Chart(nodeTypesChartCanvas, {
    type: 'pie',
    data: {
      labels: ['Start', 'Record Lookups', 'Record Updates', 'Other'],
      datasets: [{
        data: [
          nodeCounts.start,
          nodeCounts.recordLookups,
          nodeCounts.recordUpdates,
          nodeCounts.other
        ],
        backgroundColor: ['#fef08a', '#a3e635', '#2dd4bf', '#bfdbfe']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}