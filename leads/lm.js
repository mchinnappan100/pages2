let leadData = [];
let currentPage = 1;
let itemsPerPage = 50;
let filteredData = [];
let sortColumn = null;
let sortDirection = "asc";
let resultsData = [];
let resultsFilteredData = [];
let resultsCurrentPage = 1;
let resultsItemsPerPage = 50;
let resultsSortColumn = null;
let resultsSortDirection = "asc";
let currentEditingRule = null;
let currentEditingCategory = null;
let currentEditingIndex = -1;

// Default decision table
let leadScoringDecisionTable = {
  basicQualification: [
    {
      field: "Email",
      condition: "exists",
      score: 10,
      reason: "Email available",
    },
    {
      field: "Phone",
      condition: "exists_or",
      altField: "MobilePhone",
      score: 10,
      reason: "Phone contact available",
    },
    {
      field: "Company",
      condition: "not_empty",
      score: 15,
      reason: "Company information available",
    },
    {
      field: "Industry",
      condition: "exists",
      score: 10,
      reason: "Industry specified",
    },
  ],
  revenueRules: [
    {
      field: "AnnualRevenue",
      condition: ">",
      value: 10000000,
      score: 25,
      reason: "High annual revenue (>$10M)",
    },
    {
      field: "AnnualRevenue",
      condition: ">",
      value: 1000000,
      score: 15,
      reason: "Good annual revenue (>$1M)",
    },
    {
      field: "AnnualRevenue",
      condition: ">",
      value: 100000,
      score: 10,
      reason: "Moderate annual revenue (>$100K)",
    },
  ],
  employeeRules: [
    {
      field: "NumberOfEmployees",
      condition: ">",
      value: 1000,
      score: 20,
      reason: "Large company (>1000 employees)",
    },
    {
      field: "NumberOfEmployees",
      condition: ">",
      value: 100,
      score: 15,
      reason: "Medium company (>100 employees)",
    },
    {
      field: "NumberOfEmployees",
      condition: ">",
      value: 10,
      score: 10,
      reason: "Small company (>10 employees)",
    },
  ],
  titleRules: [
    {
      field: "Title",
      condition: "contains_any",
      values: ["ceo", "president", "owner"],
      score: 30,
      reason: "C-level executive",
    },
    {
      field: "Title",
      condition: "contains_any",
      values: ["cto", "cfo", "cmo", "vp"],
      score: 25,
      reason: "Senior executive",
    },
    {
      field: "Title",
      condition: "contains_any",
      values: ["director", "manager"],
      score: 15,
      reason: "Management level",
    },
  ],
  leadSourceRules: [
    {
      field: "LeadSource",
      condition: "contains_any",
      values: ["referral", "partner"],
      score: 20,
      reason: "High-quality lead source",
    },
    {
      field: "LeadSource",
      condition: "contains_any",
      values: ["web", "inbound"],
      score: 15,
      reason: "Inbound interest",
    },
  ],
  statusRules: [
    {
      field: "Status",
      condition: "contains_any",
      values: ["hot", "qualified"],
      score: 25,
      reason: "Hot/Qualified status",
    },
    {
      field: "Status",
      condition: "contains_any",
      values: ["warm", "working"],
      score: 15,
      reason: "Warm lead status",
    },
  ],
  ratingRules: [
    {
      field: "Rating",
      condition: "contains",
      value: "hot",
      score: 25,
      reason: "Hot rating",
    },
    {
      field: "Rating",
      condition: "contains",
      value: "warm",
      score: 15,
      reason: "Warm rating",
    },
  ],
  customFieldRules: [
    {
      field: "ProductInterest__c",
      condition: "exists",
      score: 15,
      reason: "Product interest indicated",
    },
    {
      field: "Primary__c",
      condition: "equals",
      value: "Yes",
      score: 20,
      reason: "Primary contact",
    },
    {
      field: "CurrentGenerators__c",
      condition: "exists",
      score: 10,
      reason: "Current generator info available",
    },
    {
      field: "NumberofLocations__c",
      condition: ">",
      value: 1,
      score: 10,
      reason: "Multiple locations",
    },
  ],
  activityRules: [
    {
      field: "LastActivityDate",
      condition: "days_ago",
      value: 7,
      score: 20,
      reason: "Recent activity (< 7 days)",
    },
    {
      field: "LastActivityDate",
      condition: "days_ago",
      value: 30,
      score: 10,
      reason: "Recent activity (< 30 days)",
    },
  ],
  additionalRules: [
    {
      field: "IsUnreadByOwner",
      condition: "equals",
      value: true,
      score: 15,
      reason: "Unread by owner - needs attention",
    },
    {
      fields: ["Street", "City", "State"],
      condition: "all_exist",
      score: 5,
      reason: "Complete address available",
    },
    {
      field: "Website",
      condition: "exists",
      score: 5,
      reason: "Company website available",
    },
  ],
  priorityThresholds: [
    { minScore: 80, priority: "P1" },
    { minScore: 60, priority: "P2" },
    { minScore: 40, priority: "P3" },
    { minScore: 0, priority: "P4" },
  ],
};

const soqlQuery = `SELECT Id, IsDeleted, MasterRecordId, LastName, FirstName, Salutation, Name,
                    Title, Company, Street, City, State, PostalCode, Country,
                    Latitude, Longitude, GeocodeAccuracy, Address, Phone, MobilePhone,
                    Fax, Email, Website, PhotoUrl, Description, LeadSource, Status,
                    Industry, Rating, AnnualRevenue, NumberOfEmployees, OwnerId,
                    IsConverted, ConvertedDate, ConvertedAccountId, ConvertedContactId,
                    ConvertedOpportunityId, IsUnreadByOwner, CreatedDate, CreatedById,
                    LastModifiedDate, LastModifiedById, SystemModstamp, LastActivityDate,
                    LastViewedDate, LastReferencedDate, Jigsaw, JigsawContactId,
                    CleanStatus, CompanyDunsNumber, DandbCompanyId, EmailBouncedReason,
                    EmailBouncedDate, IndividualId, SICCode__c, ProductInterest__c,
                    Primary__c, CurrentGenerators__c, NumberofLocations__c
FROM Lead
WHERE IsDeleted = FALSE
ORDER BY LastModifiedDate DESC
`;

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  initializeEventListeners();
  renderRules();
  renderThresholds();
});

function initializeEventListeners() {
  // File upload handlers
  document.getElementById("uploadBtn").addEventListener("click", () => {
    document.getElementById("csvFileInput").click();
  });

  document
    .getElementById("csvFileInput")
    .addEventListener("change", handleFileUpload);

  document
    .getElementById("downloadRulesBtn")
    .addEventListener("click", downloadRules);

  document.getElementById("uploadRulesBtn").addEventListener("click", () => {
    document.getElementById("rulesFileInput").click();
  });

  document
    .getElementById("rulesFileInput")
    .addEventListener("change", handleRulesUpload);

  // SOQL button
  document.getElementById("soqlBtn").addEventListener("click", showSoqlModal);
  document.getElementById("closeSoqlModal").addEventListener("click", () => {
    document.getElementById("soqlModal").classList.remove("show");
  });
  document
    .getElementById("copySoqlBtn")
    .addEventListener("click", copySoqlToClipboard);

  // Rule management
  document.getElementById("addRuleBtn").addEventListener("click", addNewRule);
  document.getElementById("ruleForm").addEventListener("submit", saveRule);
  document.getElementById("closeRuleModal").addEventListener("click", () => {
    document.getElementById("ruleModal").classList.remove("show");
  });
  document
    .getElementById("deleteRuleBtn")
    .addEventListener("click", deleteCurrentRule);

  // Threshold management
  document
    .getElementById("editThresholdsBtn")
    .addEventListener("click", editThresholds);
  document
    .getElementById("thresholdForm")
    .addEventListener("submit", saveThresholds);
  document
    .getElementById("closeThresholdModal")
    .addEventListener("click", () => {
      document.getElementById("thresholdModal").classList.remove("show");
    });

  // Rule condition change handler
  document
    .getElementById("ruleCondition")
    .addEventListener("change", updateRuleFormVisibility);

  // Export results
  document
    .getElementById("exportResultsBtn")
    .addEventListener("click", exportResults);

  // Drag and drop
  const dropZone = document.getElementById("dropZone");
  dropZone.addEventListener("click", () => {
    document.getElementById("csvFileInput").click();
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("border-blue-500", "bg-gray-800");
  });

  dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropZone.classList.remove("border-blue-500", "bg-gray-800");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("border-blue-500", "bg-gray-800");
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === "text/csv") {
      handleFile(files[0]);
    }
  });

  // Search functionality for both tables
  document
    .getElementById("searchInput")
    .addEventListener("input", handleSearch);
  document
    .getElementById("resultsSearchInput")
    .addEventListener("input", handleResultsSearch);
}

function showSoqlModal() {
  document.getElementById("soqlQuery").textContent = soqlQuery;
  document.getElementById("soqlModal").classList.add("show");
}

function copySoqlToClipboard() {
  navigator.clipboard
    .writeText(soqlQuery)
    .then(() => {
      alert("SOQL query copied to clipboard!");
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
      const textArea = document.createElement("textarea");
      textArea.value = soqlQuery;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("SOQL query copied to clipboard!");
    });
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    handleFile(file);
  }
}

function handleFile(file) {
  Papa.parse(file, {
    header: true,
    complete: function (results) {
      leadData = results.data.filter((row) => row.Id);
      filteredData = [...leadData];
      renderTable();
      document.getElementById("recordCount").textContent = leadData.length;
      document.getElementById("dropZone").classList.add("hidden");
      document.getElementById("dataTable").classList.remove("hidden");

      // Auto-classify on load
      setTimeout(() => {
        classifyLeads();
      }, 500);
    },
    error: function (error) {
      alert("Error parsing CSV: " + error.message);
    },
  });
}

function renderTable() {
  if (leadData.length === 0) return;

  const headers = Object.keys(leadData[0]);
  const headerRow = document.getElementById("tableHeader");
  const tbody = document.getElementById("tableBody");

  headerRow.innerHTML = headers
    .map(
      (header) =>
        `<th class="p-2 text-left cursor-pointer hover:bg-gray-700" onclick="sortTable('${header}')">
                    ${header}
                    ${
                      sortColumn === header
                        ? sortDirection === "asc"
                          ? "↑"
                          : "↓"
                        : ""
                    }
                </th>`
    )
    .join("");

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);

  tbody.innerHTML = pageData
    .map(
      (row) =>
        `<tr class="hover:bg-gray-800">
                    ${headers
                      .map(
                        (header) =>
                          `<td class="p-2 border-r border-gray-700">${
                            row[header] || ""
                          }</td>`
                      )
                      .join("")}
                </tr>`
    )
    .join("");

  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pagination = document.getElementById("pagination");

  pagination.innerHTML = `
                <div class="text-sm text-gray-400">
                    Showing ${Math.min(
                      (currentPage - 1) * itemsPerPage + 1,
                      filteredData.length
                    )} to 
                    ${Math.min(
                      currentPage * itemsPerPage,
                      filteredData.length
                    )} of ${filteredData.length} records
                </div>
                <div class="flex gap-2">
                    <button onclick="changePage(${currentPage - 1})" 
                            class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50" 
                            ${currentPage === 1 ? "disabled" : ""}>
                        Previous
                    </button>
                    <span class="px-3 py-1 bg-blue-600 rounded">${currentPage} / ${totalPages}</span>
                    <button onclick="changePage(${currentPage + 1})" 
                            class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50" 
                            ${currentPage === totalPages ? "disabled" : ""}>
                        Next
                    </button>
                </div>
            `;
}

function changePage(page) {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    renderTable();
  }
}

function sortTable(column) {
  if (sortColumn === column) {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
  } else {
    sortColumn = column;
    sortDirection = "asc";
  }

  filteredData.sort((a, b) => {
    let valueA = a[column] || "";
    let valueB = b[column] || "";

    const numA = parseFloat(valueA);
    const numB = parseFloat(valueB);

    if (!isNaN(numA) && !isNaN(numB)) {
      return sortDirection === "asc" ? numA - numB : numB - numA;
    }

    return sortDirection === "asc"
      ? valueA.toString().localeCompare(valueB.toString())
      : valueB.toString().localeCompare(valueA.toString());
  });

  currentPage = 1;
  renderTable();

  // Re-classify after search
  if (leadData.length > 0) {
    classifyLeads();
  }
}

function handleSearch() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  filteredData = leadData.filter((row) => {
    return Object.values(row).some(
      (value) => value && value.toString().toLowerCase().includes(searchTerm)
    );
  });
  currentPage = 1;
  renderTable();

  // Re-classify after search
  if (leadData.length > 0) {
    classifyLeads();
  }
}

function renderRules() {
  const container = document.getElementById("rulesContainer");
  container.innerHTML = "";

  Object.entries(leadScoringDecisionTable).forEach(([category, rules]) => {
    if (category === "priorityThresholds") return;

    const categoryDiv = document.createElement("div");
    categoryDiv.className = "mb-4 bg-gray-900 rounded-lg p-3";

    categoryDiv.innerHTML = `
                    <h4 class="font-medium mb-2 text-blue-400 capitalize">${category
                      .replace(/([A-Z])/g, " $1")
                      .trim()}</h4>
                    <div class="space-y-1">
                        ${rules
                          .map(
                            (rule, index) => `
                            <div class="text-sm bg-gray-800 p-2 rounded flex justify-between items-start">
                                <div class="flex-1">
                                    <div class="font-medium">${
                                      rule.reason
                                    }</div>
                                    <div class="text-gray-400 text-xs">
                                        ${
                                          rule.field ||
                                          (rule.fields
                                            ? rule.fields.join(", ")
                                            : "")
                                        } ${rule.condition} ${
                              rule.value || rule.values?.join(", ") || ""
                            } 
                                        <span class="text-green-400">+${
                                          rule.score
                                        } pts</span>
                                    </div>
                                </div>
                                <div class="flex gap-1 ml-2">
                                    <button onclick="editRule('${category}', ${index})" 
                                            class="text-blue-400 hover:text-blue-300 text-xs">
                                        Edit
                                    </button>
                                    <button onclick="deleteRule('${category}', ${index})" 
                                            class="text-red-400 hover:text-red-300 text-xs">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                `;

    container.appendChild(categoryDiv);
  });
}

function renderThresholds() {
  const container = document.getElementById("thresholds");
  container.innerHTML = leadScoringDecisionTable.priorityThresholds
    .map(
      (threshold) => `
                <div class="flex justify-between items-center bg-gray-900 p-2 rounded text-sm">
                    <span class="font-medium ${getPriorityColor(
                      threshold.priority
                    )}">${threshold.priority}</span>
                    <span class="text-gray-400">${
                      threshold.minScore
                    }+ points</span>
                </div>
            `
    )
    .join("");
}

function getPriorityColor(priority) {
  switch (priority) {
    case "P1":
      return "text-red-400";
    case "P2":
      return "text-orange-400";
    case "P3":
      return "text-yellow-400";
    case "P4":
      return "text-green-400";
    default:
      return "text-gray-400";
  }
}

function addNewRule() {
  currentEditingRule = null;
  currentEditingCategory = null;
  currentEditingIndex = -1;

  document.getElementById("ruleModalTitle").textContent = "Add New Rule";
  document.getElementById("deleteRuleBtn").classList.add("hidden");

  // Reset form
  document.getElementById("ruleForm").reset();
  updateRuleFormVisibility();

  document.getElementById("ruleModal").classList.add("show");
}

function editRule(category, index) {
  const rule = leadScoringDecisionTable[category][index];
  currentEditingRule = rule;
  currentEditingCategory = category;
  currentEditingIndex = index;

  document.getElementById("ruleModalTitle").textContent = "Edit Rule";
  document.getElementById("deleteRuleBtn").classList.remove("hidden");

  // Populate form
  document.getElementById("ruleCategory").value = category;
  document.getElementById("ruleField").value = rule.field || "";
  document.getElementById("ruleCondition").value = rule.condition;
  document.getElementById("ruleValue").value = rule.value || "";
  document.getElementById("ruleValues").value = rule.values
    ? rule.values.join(", ")
    : "";
  document.getElementById("ruleAltField").value = rule.altField || "";
  document.getElementById("ruleScore").value = rule.score;
  document.getElementById("ruleReason").value = rule.reason;

  updateRuleFormVisibility();
  document.getElementById("ruleModal").classList.add("show");
}

function deleteRule(category, index) {
  if (confirm("Are you sure you want to delete this rule?")) {
    leadScoringDecisionTable[category].splice(index, 1);
    renderRules();

    // Re-classify leads
    if (leadData.length > 0) {
      classifyLeads();
    }
  }
}

function deleteCurrentRule() {
  if (currentEditingCategory && currentEditingIndex >= 0) {
    if (confirm("Are you sure you want to delete this rule?")) {
      leadScoringDecisionTable[currentEditingCategory].splice(
        currentEditingIndex,
        1
      );
      renderRules();
      document.getElementById("ruleModal").classList.remove("show");

      // Re-classify leads
      if (leadData.length > 0) {
        classifyLeads();
      }
    }
  }
}

function updateRuleFormVisibility() {
  const condition = document.getElementById("ruleCondition").value;
  const valueContainer = document.getElementById("valueContainer");
  const valuesContainer = document.getElementById("valuesContainer");
  const altFieldContainer = document.getElementById("altFieldContainer");

  // Hide all initially
  valueContainer.classList.remove("hidden");
  valuesContainer.classList.add("hidden");
  altFieldContainer.classList.add("hidden");

  // Show relevant fields based on condition
  if (condition === "contains_any") {
    valueContainer.classList.add("hidden");
    valuesContainer.classList.remove("hidden");
  } else if (condition === "exists_or") {
    altFieldContainer.classList.remove("hidden");
  } else if (["exists", "not_empty", "all_exist"].includes(condition)) {
    valueContainer.classList.add("hidden");
  }
}

function saveRule(event) {
  event.preventDefault();

  const category = document.getElementById("ruleCategory").value;
  const field = document.getElementById("ruleField").value;
  const condition = document.getElementById("ruleCondition").value;
  const value = document.getElementById("ruleValue").value;
  const values = document.getElementById("ruleValues").value;
  const altField = document.getElementById("ruleAltField").value;
  const score = parseInt(document.getElementById("ruleScore").value);
  const reason = document.getElementById("ruleReason").value;

  const newRule = {
    field: field,
    condition: condition,
    score: score,
    reason: reason,
  };

  // Add condition-specific properties
  if (condition === "contains_any") {
    newRule.values = values.split(",").map((v) => v.trim());
  } else if (condition === "exists_or") {
    newRule.altField = altField;
  } else if (!["exists", "not_empty", "all_exist"].includes(condition)) {
    if (condition === ">" || condition === "days_ago") {
      newRule.value = parseFloat(value) || 0;
    } else {
      newRule.value = value;
    }
  }

  if (condition === "all_exist") {
    newRule.fields = field.split(",").map((f) => f.trim());
    delete newRule.field;
  }

  // Add or update rule
  if (currentEditingIndex >= 0 && currentEditingCategory) {
    leadScoringDecisionTable[currentEditingCategory][currentEditingIndex] =
      newRule;
  } else {
    if (!leadScoringDecisionTable[category]) {
      leadScoringDecisionTable[category] = [];
    }
    leadScoringDecisionTable[category].push(newRule);
  }

  renderRules();
  document.getElementById("ruleModal").classList.remove("show");

  // Re-classify leads
  if (leadData.length > 0) {
    classifyLeads();
  }
}

function editThresholds() {
  const container = document.getElementById("thresholdInputs");
  container.innerHTML = leadScoringDecisionTable.priorityThresholds
    .map(
      (threshold, index) => `
                <div class="flex items-center gap-4">
                    <label class="w-12 font-medium ${getPriorityColor(
                      threshold.priority
                    )}">${threshold.priority}</label>
                    <input type="number" 
                           value="${threshold.minScore}" 
                           data-priority="${threshold.priority}"
                           data-index="${index}"
                           class="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2">
                    <span class="text-gray-400">+ points</span>
                </div>
            `
    )
    .join("");

  document.getElementById("thresholdModal").classList.add("show");
}

function saveThresholds(event) {
  event.preventDefault();

  const inputs = document.querySelectorAll("#thresholdInputs input");
  inputs.forEach((input, index) => {
    leadScoringDecisionTable.priorityThresholds[index].minScore =
      parseInt(input.value) || 0;
  });

  renderThresholds();
  document.getElementById("thresholdModal").classList.remove("show");

  // Re-classify leads
  if (leadData.length > 0) {
    classifyLeads();
  }
}

function classifyLeads() {
  const results = filteredData.map((lead) => {
    const scoreData = calculateLeadScore(lead);
    return {
      lead,
      score: scoreData.totalScore,
      priority: scoreData.priority,
      reasons: scoreData.reasons,
    };
  });

  results.sort((a, b) => b.score - a.score);
  displayResults(results);
}

function calculateLeadScore(lead) {
  let totalScore = 0;
  const reasons = [];

  Object.entries(leadScoringDecisionTable).forEach(([category, rules]) => {
    if (category === "priorityThresholds") return;

    rules.forEach((rule) => {
      const ruleResult = evaluateRule(lead, rule);
      if (ruleResult.matches) {
        totalScore += rule.score;
        reasons.push(rule.reason);
      }
    });
  });

  const priority =
    leadScoringDecisionTable.priorityThresholds.find(
      (threshold) => totalScore >= threshold.minScore
    )?.priority || "P4";

  return { totalScore, priority, reasons };
}

function evaluateRule(lead, rule) {
  const fieldValue = lead[rule.field];

  switch (rule.condition) {
    case "exists":
      return { matches: fieldValue && fieldValue.trim() !== "" };

    case "exists_or":
      const altFieldValue = lead[rule.altField];
      return {
        matches:
          (fieldValue && fieldValue.trim() !== "") ||
          (altFieldValue && altFieldValue.trim() !== ""),
      };

    case "not_empty":
      return { matches: fieldValue && fieldValue.trim() !== "" };

    case ">":
      const numValue = parseFloat(fieldValue);
      return { matches: !isNaN(numValue) && numValue > rule.value };

    case "contains":
      return {
        matches:
          fieldValue &&
          fieldValue.toLowerCase().includes(rule.value.toLowerCase()),
      };

    case "contains_any":
      return {
        matches:
          fieldValue &&
          rule.values.some((value) =>
            fieldValue.toLowerCase().includes(value.toLowerCase())
          ),
      };

    case "equals":
      return { matches: fieldValue == rule.value };

    case "days_ago":
      if (!fieldValue) return { matches: false };
      const date = new Date(fieldValue);
      const now = new Date();
      const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
      return { matches: daysDiff <= rule.value };

    case "all_exist":
      return {
        matches: rule.fields.every(
          (field) => lead[field] && lead[field].trim() !== ""
        ),
      };

    default:
      return { matches: false };
  }
}

function updateKpiBanner() {
  const counts = { P1: 0, P2: 0, P3: 0, P4: 0 };
  resultsData.forEach((result) => {
    counts[result.priority]++;
  });
  document.getElementById("p1Count").textContent = counts.P1;
  document.getElementById("p2Count").textContent = counts.P2;
  document.getElementById("p3Count").textContent = counts.P3;
  document.getElementById("p4Count").textContent = counts.P4;
}

function displayResults(results) {
  resultsData = results;
  resultsFilteredData = [...resultsData];
  const resultsPane = document.getElementById("resultsPane");

  resultsPane.classList.remove("hidden");
  renderResultsTable();
  updateKpiBanner();
}

function handleResultsSearch() {
  const searchTerm = document
    .getElementById("resultsSearchInput")
    .value.toLowerCase();
  resultsFilteredData = resultsData.filter((result) => {
    return (
      `${result.lead.FirstName || ""} ${result.lead.LastName || ""}`
        .toLowerCase()
        .includes(searchTerm) ||
      (result.lead.Company || "").toLowerCase().includes(searchTerm) ||
      result.score.toString().includes(searchTerm) ||
      result.priority.toLowerCase().includes(searchTerm) ||
      result.reasons.join(", ").toLowerCase().includes(searchTerm)
    );
  });
  resultsCurrentPage = 1;
  renderResultsTable();
}

function sortResultsTable(column) {
  if (resultsSortColumn === column) {
    resultsSortDirection = resultsSortDirection === "asc" ? "desc" : "asc";
  } else {
    resultsSortColumn = column;
    resultsSortDirection = "asc";
  }

  resultsFilteredData.sort((a, b) => {
    let valueA, valueB;
    switch (column) {
      case "LeadName":
        valueA = `${a.lead.FirstName || ""} ${a.lead.LastName || ""}`;
        valueB = `${b.lead.FirstName || ""} ${b.lead.LastName || ""}`;
        break;
      case "Company":
        valueA = a.lead.Company || "";
        valueB = b.lead.Company || "";
        break;
      case "Score":
        valueA = a.score;
        valueB = b.score;
        break;
      case "Priority":
        valueA = a.priority;
        valueB = b.priority;
        break;
      default:
        valueA = "";
        valueB = "";
    }

    if (column === "Score") {
      return resultsSortDirection === "asc" ? valueA - valueB : valueB - valueA;
    }

    return resultsSortDirection === "asc"
      ? valueA.toString().localeCompare(valueB.toString())
      : valueB.toString().localeCompare(valueA.toString());
  });

  resultsCurrentPage = 1;
  renderResultsTable();
}

function renderResultsTable() {
  const resultsBody = document.getElementById("resultsBody");
  const startIndex = (resultsCurrentPage - 1) * resultsItemsPerPage;
  const endIndex = startIndex + resultsItemsPerPage;
  const pageData = resultsFilteredData.slice(startIndex, endIndex);

  resultsBody.innerHTML = pageData
    .map(
      (result) => `
                <tr class="hover:bg-gray-700">
                    <td class="p-2">${result.lead.FirstName || ""} ${
        result.lead.LastName || ""
      }</td>
                    <td class="p-2">${result.lead.Company || ""}</td>
                    <td class="p-2 font-bold">${result.score}</td>
                    <td class="p-2">
                        <span class="px-2 py-1 rounded text-xs font-medium ${getPriorityBgColor(
                          result.priority
                        )}">
                            ${result.priority}
                        </span>
                    </td>
                    <td class="p-2 text-xs">
                        ${result.reasons.slice(0, 3).join(", ")}
                        ${
                          result.reasons.length > 3
                            ? `... (+${result.reasons.length - 3} more)`
                            : ""
                        }
                    </td>
                </tr>
            `
    )
    .join("");

  renderResultsPagination();
}

function renderResultsPagination() {
  const totalPages = Math.ceil(
    resultsFilteredData.length / resultsItemsPerPage
  );
  const pagination = document.getElementById("resultsPagination");

  pagination.innerHTML = `
                <div class="text-sm text-gray-400">
                    Showing ${Math.min(
                      (resultsCurrentPage - 1) * resultsItemsPerPage + 1,
                      resultsFilteredData.length
                    )} to 
                    ${Math.min(
                      resultsCurrentPage * resultsItemsPerPage,
                      resultsFilteredData.length
                    )} of ${resultsFilteredData.length} results
                </div>
                <div class="flex gap-2">
                    <button onclick="changeResultsPage(${
                      resultsCurrentPage - 1
                    })" 
                            class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50" 
                            ${resultsCurrentPage === 1 ? "disabled" : ""}>
                        Previous
                    </button>
                    <span class="px-3 py-1 bg-blue-600 rounded">${resultsCurrentPage} / ${totalPages}</span>
                    <button onclick="changeResultsPage(${
                      resultsCurrentPage + 1
                    })" 
                            class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50" 
                            ${
                              resultsCurrentPage === totalPages
                                ? "disabled"
                                : ""
                            }>
                        Next
                    </button>
                </div>
            `;
}

function changeResultsPage(page) {
  const totalPages = Math.ceil(
    resultsFilteredData.length / resultsItemsPerPage
  );
  if (page >= 1 && page <= totalPages) {
    resultsCurrentPage = page;
    renderResultsTable();
  }
}

function getPriorityBgColor(priority) {
  switch (priority) {
    case "P1":
      return "bg-red-600 text-white";
    case "P2":
      return "bg-orange-600 text-white";
    case "P3":
      return "bg-yellow-600 text-black";
    case "P4":
      return "bg-green-600 text-white";
    default:
      return "bg-gray-600 text-white";
  }
}

function exportResults() {
  const resultsBody = document.getElementById("resultsBody");
  const results = [];

  // Extract data from results table
  Array.from(resultsBody.rows).forEach((row) => {
    results.push({
      LeadName: row.cells[0].textContent,
      Company: row.cells[1].textContent,
      Score: row.cells[2].textContent,
      Priority: row.cells[3].textContent.trim(),
      Reasons: row.cells[4].textContent,
    });
  });

  const csv = Papa.unparse(results);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "lead-classification-results.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function downloadRules() {
  const dataStr = JSON.stringify(leadScoringDecisionTable, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "lead-scoring-rules.json";
  link.click();
  URL.revokeObjectURL(url);
}

function handleRulesUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const uploadedRules = JSON.parse(e.target.result);
      leadScoringDecisionTable = uploadedRules;
      renderRules();
      renderThresholds();

      // Re-classify leads if data is loaded
      if (leadData.length > 0) {
        classifyLeads();
      }

      alert("Rules uploaded successfully!");
    } catch (error) {
      alert("Error parsing rules file: " + error.message);
    }
  };
  reader.readAsText(file);
}
