// Global variables
let csvData = [];
let csvColumns = [];
let filteredData = [];
let sqlDB = null;
let monacoEditor = null;
let currentResults = [];
let currentPage = 1;
let rowsPerPage = 25;
let dataCurrentPage = 1;
let dataRowsPerPage = 25;
let currentChart = null;

// Initialize Monaco Editor
require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs",
  },
});

require(["vs/editor/editor.main"], function () {
  monacoEditor = monaco.editor.create(document.getElementById("sqlEditor"), {
    value: "SELECT * FROM data LIMIT 100;",
    language: "sql",
    theme: "vs-dark",
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
  });

  // Add SQL completions
  monaco.languages.registerCompletionItemProvider("sql", {
    provideCompletionItems: function (model, position) {
      const suggestions = [...getSQLKeywords(), ...getColumnSuggestions()];
      return { suggestions };
    },
  });
});

// Initialize SQL.js
initSqlJs({
  locateFile: (file) =>
    `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`,
}).then(function (SQL) {
  window.SQL = SQL;
});

// Tab switching
document
  .getElementById("dataTab")
  .addEventListener("click", () => switchTab("data"));
document
  .getElementById("queryTab")
  .addEventListener("click", () => switchTab("query"));
document
  .getElementById("vizTab")
  .addEventListener("click", () => switchTab("viz"));

function switchTab(tab) {
  const dataTab = document.getElementById("dataTab");
  const queryTab = document.getElementById("queryTab");
  const vizTab = document.getElementById("vizTab");
  const dataContent = document.getElementById("dataContent");
  const queryContent = document.getElementById("queryContent");
  const vizContent = document.getElementById("vizContent");

  // Reset all tabs
  dataTab.className =
    "tab-inactive py-2 px-4 border-b-2 border-transparent font-medium text-sm";
  queryTab.className =
    "tab-inactive py-2 px-4 border-b-2 border-transparent font-medium text-sm";
  vizTab.className =
    "tab-inactive py-2 px-4 border-b-2 border-transparent font-medium text-sm";

  dataContent.classList.add("hidden");
  queryContent.classList.add("hidden");
  vizContent.classList.add("hidden");

  if (tab === "data") {
    dataTab.className = "tab-active py-2 px-4 border-b-2 font-medium text-sm";
    dataContent.classList.remove("hidden");
  } else if (tab === "query") {
    queryTab.className = "tab-active py-2 px-4 border-b-2 font-medium text-sm";
    queryContent.classList.remove("hidden");
  } else {
    vizTab.className = "tab-active py-2 px-4 border-b-2 font-medium text-sm";
    vizContent.classList.remove("hidden");
  }
}

// File upload handling
const fileInput = document.getElementById("csvFile");
const fileInfo = document.getElementById("fileInfo");

fileInput.addEventListener("change", handleFileUpload);

// Drag and drop
const dropZone = fileInput.parentElement;
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("border-blue-500");
});

dropZone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropZone.classList.remove("border-blue-500");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("border-blue-500");
  const files = e.dataTransfer.files;
  if (files.length > 0 && files[0].type === "text/csv") {
    handleFile(files[0]);
  }
});

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    handleFile(file);
  }
}

function handleFile(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const csv = e.target.result;
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: function (results) {
        csvData = results.data;
        csvColumns = results.meta.fields;
        filteredData = [...csvData]; // Initialize filtered data

        // Show file info
        fileInfo.innerHTML = `
                            <strong>File:</strong> ${file.name} | 
                            <strong>Rows:</strong> ${csvData.length} | 
                            <strong>Columns:</strong> ${csvColumns.join(", ")}
                        `;
        fileInfo.classList.remove("hidden");

        // Initialize SQL database
        initializeDatabase();

        // Update visualization dropdowns
        updateVizDropdowns();

        // Update data view
        updateDataView();

        // Update Monaco editor with column suggestions
        updateMonacoSuggestions();

        // Switch to data view after upload
        switchTab("data");
      },
    });
  };
  reader.readAsText(file);
}

function initializeDatabase() {
  if (window.SQL) {
    sqlDB = new SQL.Database();

    // Create table schema
    const columns = csvColumns.map((col) => `\`${col}\` TEXT`).join(", ");
    sqlDB.run(`CREATE TABLE data (${columns})`);

    // Insert data
    const stmt = sqlDB.prepare(
      `INSERT INTO data VALUES (${csvColumns.map(() => "?").join(", ")})`
    );

    csvData.forEach((row) => {
      const values = csvColumns.map((col) => row[col] ?? null);
      stmt.run(values);
    });

    stmt.free();
  }
}

function getSQLKeywords() {
  const keywords = [
    "SELECT",
    "FROM",
    "WHERE",
    "ORDER BY",
    "GROUP BY",
    "HAVING",
    "LIMIT",
    "OFFSET",
    "JOIN",
    "LEFT JOIN",
    "RIGHT JOIN",
    "INNER JOIN",
    "COUNT",
    "SUM",
    "AVG",
    "MIN",
    "MAX",
    "DISTINCT",
    "AS",
    "AND",
    "OR",
    "NOT",
    "IN",
    "LIKE",
    "BETWEEN",
  ];

  return keywords.map((keyword) => ({
    label: keyword,
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: keyword,
  }));
}

function getColumnSuggestions() {
  return csvColumns.map((column) => ({
    label: column,
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: `\`${column}\``,
  }));
}

function updateMonacoSuggestions() {
  if (monacoEditor && csvColumns.length > 0) {
    const sampleQuery = `SELECT ${csvColumns
      .slice(0, 3)
      .map((col) => `\`${col}\``)
      .join(", ")} FROM data LIMIT 10;`;
    monacoEditor.setValue(sampleQuery);
  }
}

// Query execution
document.getElementById("runQuery").addEventListener("click", executeQuery);
document.getElementById("clearQuery").addEventListener("click", () => {
  if (monacoEditor) {
    monacoEditor.setValue("");
  }
});

function executeQuery() {
  if (!sqlDB || !monacoEditor) {
    alert("Please upload a CSV file first");
    return;
  }

  const query = monacoEditor.getValue();
  if (!query.trim()) {
    alert("Please enter a SQL query");
    return;
  }

  try {
    const result = sqlDB.exec(query);
    if (result.length > 0) {
      currentResults = result[0];
      displayResults();
    } else {
      currentResults = { columns: [], values: [] };
      displayResults();
    }
  } catch (error) {
    alert("SQL Error: " + error.message);
  }
}

function displayResults() {
  const resultsSection = document.getElementById("resultsSection");
  const resultsTable = document.getElementById("resultsTable");

  resultsSection.classList.remove("hidden");

  if (!currentResults.values || currentResults.values.length === 0) {
    resultsTable.innerHTML =
      '<thead><tr><th class="px-4 py-2 text-left">No results found</th></tr></thead><tbody></tbody>';
    updateRecordsInfo(0, 0, 0);
    return;
  }

  currentPage = 1;
  renderTable();
}

function renderTable() {
  const resultsTable = document.getElementById("resultsTable");
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(
    startIndex + rowsPerPage,
    currentResults.values.length
  );
  const pageData = currentResults.values.slice(startIndex, endIndex);

  // Create headers with sorting
  const headers = currentResults.columns
    .map(
      (col, index) =>
        `<th class="px-4 py-2 text-left cursor-pointer hover:bg-gray-600" onclick="sortTable(${index})">
                    ${col} ↕️
                </th>`
    )
    .join("");

  // Create rows
  const rows = pageData
    .map(
      (row) =>
        `<tr class="border-b border-gray-700 hover:bg-gray-750">
                    ${row
                      .map((cell) => `<td class="px-4 py-2">${cell ?? ""}</td>`)
                      .join("")}
                </tr>`
    )
    .join("");

  resultsTable.innerHTML = `
                <thead class="bg-gray-700">
                    <tr>${headers}</tr>
                </thead>
                <tbody>${rows}</tbody>
            `;

  updatePagination();
  updateRecordsInfo(startIndex + 1, endIndex, currentResults.values.length);
}

function updateRecordsInfo(start, end, total) {
  document.getElementById(
    "recordsInfo"
  ).textContent = `Showing ${start}-${end} of ${total} records`;
}

function updatePagination() {
  const totalPages = Math.ceil(currentResults.values.length / rowsPerPage);
  document.getElementById(
    "pageInfo"
  ).textContent = `Page ${currentPage} of ${totalPages}`;

  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

// Pagination event listeners
document.getElementById("pageSize").addEventListener("change", (e) => {
  rowsPerPage = parseInt(e.target.value);
  currentPage = 1;
  renderTable();
});

document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  const totalPages = Math.ceil(currentResults.values.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
  }
});

// Export functionality
document.getElementById("exportResults").addEventListener("click", exportToCSV);

function exportToCSV() {
  if (!currentResults.values || currentResults.values.length === 0) {
    alert("No data to export");
    return;
  }

  const csvContent = [
    currentResults.columns.join(","),
    ...currentResults.values.map((row) =>
      row.map((cell) => `"${cell ?? ""}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "query_results.csv";
  a.click();
  window.URL.revokeObjectURL(url);
}

// Sorting functionality
function sortTable(columnIndex) {
  // Simple sorting implementation
  currentResults.values.sort((a, b) => {
    const aVal = a[columnIndex];
    const bVal = b[columnIndex];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return aVal - bVal;
    }

    return String(aVal).localeCompare(String(bVal));
  });

  renderTable();
}

// Data view functions
function updateDataView() {
  // Update search column dropdown
  const searchColumn = document.getElementById("searchColumn");
  searchColumn.innerHTML = '<option value="">All columns</option>';
  csvColumns.forEach((column) => {
    searchColumn.innerHTML += `<option value="${column}">${column}</option>`;
  });

  // Reset to first page and render
  dataCurrentPage = 1;
  filteredData = [...csvData];
  renderDataTable();
}

function renderDataTable() {
  const dataTable = document.getElementById("dataTable");
  const startIndex = (dataCurrentPage - 1) * dataRowsPerPage;
  const endIndex = Math.min(startIndex + dataRowsPerPage, filteredData.length);
  const pageData = filteredData.slice(startIndex, endIndex);

  if (filteredData.length === 0) {
    dataTable.innerHTML =
      '<thead><tr><th class="px-4 py-2 text-left">No data available</th></tr></thead><tbody></tbody>';
    updateDataRecordsInfo(0, 0, 0);
    return;
  }

  // Create headers with sorting
  const headers = csvColumns
    .map(
      (col, index) =>
        `<th class="px-4 py-2 text-left cursor-pointer hover:bg-gray-600" onclick="sortDataTable(${index})">
                    ${col} ↕️
                </th>`
    )
    .join("");

  // Create rows
  const rows = pageData
    .map(
      (row, rowIndex) =>
        `<tr class="border-b border-gray-700 hover:bg-gray-750 ${
          rowIndex % 2 === 0 ? "bg-gray-800" : "bg-gray-850"
        }">
                    ${csvColumns
                      .map(
                        (col) => `<td class="px-4 py-2">${row[col] ?? ""}</td>`
                      )
                      .join("")}
                </tr>`
    )
    .join("");

  dataTable.innerHTML = `
                <thead class="bg-gray-700">
                    <tr>${headers}</tr>
                </thead>
                <tbody>${rows}</tbody>
            `;

  updateDataPagination();
  updateDataRecordsInfo(startIndex + 1, endIndex, filteredData.length);
}

function updateDataRecordsInfo(start, end, total) {
  const info =
    total === 0
      ? "No records found"
      : `Showing ${start}-${end} of ${total} records`;
  document.getElementById("dataRecordsInfo").textContent = info;
}

function updateDataPagination() {
  const totalPages = Math.ceil(filteredData.length / dataRowsPerPage);
  document.getElementById(
    "dataPageInfo"
  ).textContent = `Page ${dataCurrentPage} of ${totalPages}`;

  document.getElementById("dataPrevPage").disabled = dataCurrentPage === 1;
  document.getElementById("dataNextPage").disabled =
    dataCurrentPage === totalPages || totalPages === 0;
}

// Data table sorting
function sortDataTable(columnIndex) {
  const columnName = csvColumns[columnIndex];
  filteredData.sort((a, b) => {
    const aVal = a[columnName];
    const bVal = b[columnName];

    // Handle numbers
    if (!isNaN(aVal) && !isNaN(bVal)) {
      return parseFloat(aVal) - parseFloat(bVal);
    }

    // Handle strings
    return String(aVal || "").localeCompare(String(bVal || ""));
  });

  renderDataTable();
}

// Data search functionality
function performDataSearch() {
  const searchTerm = document.getElementById("dataSearch").value.toLowerCase();
  const searchColumn = document.getElementById("searchColumn").value;

  if (!searchTerm) {
    filteredData = [...csvData];
  } else if (searchColumn) {
    // Search in specific column
    filteredData = csvData.filter((row) =>
      String(row[searchColumn] || "")
        .toLowerCase()
        .includes(searchTerm)
    );
  } else {
    // Search in all columns
    filteredData = csvData.filter((row) =>
      csvColumns.some((col) =>
        String(row[col] || "")
          .toLowerCase()
          .includes(searchTerm)
      )
    );
  }

  dataCurrentPage = 1;
  renderDataTable();
}

// Data view event listeners
document
  .getElementById("dataSearch")
  .addEventListener("input", performDataSearch);
document
  .getElementById("searchColumn")
  .addEventListener("change", performDataSearch);

document.getElementById("dataPageSize").addEventListener("change", (e) => {
  dataRowsPerPage = parseInt(e.target.value);
  dataCurrentPage = 1;
  renderDataTable();
});

document.getElementById("dataPrevPage").addEventListener("click", () => {
  if (dataCurrentPage > 1) {
    dataCurrentPage--;
    renderDataTable();
  }
});

document.getElementById("dataNextPage").addEventListener("click", () => {
  const totalPages = Math.ceil(filteredData.length / dataRowsPerPage);
  if (dataCurrentPage < totalPages) {
    dataCurrentPage++;
    renderDataTable();
  }
});

document.getElementById("exportOriginal").addEventListener("click", () => {
  if (csvData.length === 0) {
    alert("No data to export");
    return;
  }

  const csvContent = [
    csvColumns.join(","),
    ...filteredData.map((row) =>
      csvColumns.map((col) => `"${row[col] ?? ""}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "filtered_data.csv";
  a.click();
  window.URL.revokeObjectURL(url);
});

document.getElementById("refreshData").addEventListener("click", () => {
  document.getElementById("dataSearch").value = "";
  document.getElementById("searchColumn").value = "";
  filteredData = [...csvData];
  dataCurrentPage = 1;
  renderDataTable();
});
function updateVizDropdowns() {
  const xAxis = document.getElementById("xAxis");
  const yAxis = document.getElementById("yAxis");

  // Clear existing options
  xAxis.innerHTML = '<option value="">Select column...</option>';
  yAxis.innerHTML = '<option value="">Select column...</option>';

  // Add column options
  csvColumns.forEach((column) => {
    xAxis.innerHTML += `<option value="${column}">${column}</option>`;
    yAxis.innerHTML += `<option value="${column}">${column}</option>`;
  });
}

document
  .getElementById("generateChart")
  .addEventListener("click", generateChart);

function generateChart() {
  const chartType = document.getElementById("chartType").value;
  const xAxisColumn = document.getElementById("xAxis").value;
  const yAxisColumn = document.getElementById("yAxis").value;
  const aggregation = document.getElementById("aggregation").value;
  const chartTitle = document.getElementById("chartTitle").value || "Chart";

  if (!xAxisColumn) {
    alert("Please select X-axis column");
    return;
  }

  // Require Y-axis for all chart types except pie/doughnut when aggregation is not none
  if (
    !yAxisColumn &&
    !["pie", "doughnut"].includes(chartType) &&
    aggregation !== "none"
  ) {
    alert("Please select Y-axis column");
    return;
  }

  // For scatter and line charts with "none" aggregation, require Y-axis
  if (aggregation === "none" && !yAxisColumn) {
    alert("Y-axis column is required when aggregation is set to None");
    return;
  }

  const chartData = prepareChartData(
    chartType,
    xAxisColumn,
    yAxisColumn,
    aggregation
  );
  renderChart(chartType, chartData, chartTitle);
}

function prepareChartData(chartType, xColumn, yColumn, aggregation) {
  if (aggregation === "none") {
    // For "none" aggregation, collect all individual data points
    const labels = csvData.map((row) => row[xColumn]);
    const data = csvData.map((row) => parseFloat(row[yColumn]) || 0);
    return { labels, data };
  }

  const groupedData = {};

  csvData.forEach((row) => {
    const xValue = row[xColumn];
    const yValue = parseFloat(row[yColumn]) || 0;

    if (!groupedData[xValue]) {
      groupedData[xValue] = { values: [], count: 0 };
    }

    groupedData[xValue].values.push(yValue);
    groupedData[xValue].count++;
  });

  const labels = Object.keys(groupedData);
  const data = labels.map((label) => {
    const group = groupedData[label];

    switch (aggregation) {
      case "sum":
        return group.values.reduce((a, b) => a + b, 0);
      case "avg":
        return group.values.reduce((a, b) => a + b, 0) / group.values.length;
      case "min":
        return Math.min(...group.values);
      case "max":
        return Math.max(...group.values);
      case "count":
      default:
        return group.count;
    }
  });

  return { labels, data };
}

function renderChart(chartType, chartData, title) {
  const ctx = document.getElementById("chart").getContext("2d");
  const chartSection = document.getElementById("chartSection");

  // Destroy existing chart
  if (currentChart) {
    currentChart.destroy();
  }

  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
    "#84cc16",
    "#ec4899",
    "#6366f1",
  ];

  let datasetConfig = {
    label: title,
    data: chartData.data,
    backgroundColor: chartType === "line" ? "rgba(59, 130, 246, 0.1)" : colors,
    borderColor: chartType === "line" ? "#3b82f6" : colors,
    borderWidth: 1,
  };

  // For scatter plots with "none" aggregation, use individual points
  if (
    chartType === "scatter" &&
    document.getElementById("aggregation").value === "none"
  ) {
    datasetConfig = {
      ...datasetConfig,
      data: chartData.labels.map((label, index) => ({
        x: label,
        y: chartData.data[index],
      })),
      pointRadius: 5,
      pointHoverRadius: 8,
    };
  }

  const config = {
    type: chartType,
    data: {
      labels:
        chartType === "scatter" &&
        document.getElementById("aggregation").value === "none"
          ? []
          : chartData.labels,
      datasets: [datasetConfig],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          color: "#ffffff",
        },
        legend: {
          labels: {
            color: "#ffffff",
          },
        },
      },
      scales:
        chartType !== "pie" && chartType !== "doughnut"
          ? {
              x: {
                ticks: { color: "#ffffff" },
                grid: { color: "#374151" },
              },
              y: {
                ticks: { color: "#ffffff" },
                grid: { color: "#374151" },
              },
            }
          : {},
    },
  };

  currentChart = new Chart(ctx, config);
  chartSection.classList.remove("hidden");

  // Show download buttons
  document.getElementById("downloadSVG").classList.remove("hidden");
  document.getElementById("downloadPNG").classList.remove("hidden");
}

// Download chart functionality
document.getElementById("downloadPNG").addEventListener("click", () => {
  if (currentChart) {
    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = currentChart.toBase64Image();
    link.click();
  }
});

document.getElementById("downloadSVG").addEventListener("click", () => {
  // SVG download is more complex with Chart.js, so we'll use PNG for now
  alert("SVG download coming soon! Using PNG download instead.");
  document.getElementById("downloadPNG").click();
});

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  // Enable query button only when file is loaded
  const runButton = document.getElementById("runQuery");
  const generateButton = document.getElementById("generateChart");

  runButton.disabled = true;
  generateButton.disabled = true;

  // Check if file is loaded periodically
  const checkInterval = setInterval(() => {
    if (csvData.length > 0) {
      runButton.disabled = false;
      generateButton.disabled = false;
      clearInterval(checkInterval);
    }
  }, 1000);
});
