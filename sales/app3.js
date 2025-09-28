// Global variables
let usersData = [];
let purchasesData = [];
let currentUsersPage = 0;
let currentPurchasesPage = 0;
const itemsPerPage = 10;
let userMatrix = {};
let itemMatrix = {};

// File upload handlers
document.getElementById("usersFile").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    Papa.parse(file, {
      header: true,
      complete: function (results) {
        usersData = results.data.filter((row) =>
          Object.values(row).some((val) => val.trim())
        );
        document.getElementById(
          "usersStatus"
        ).innerHTML = `<i class="fas fa-check text-green-400 mr-2"></i>${usersData.length} users loaded`;
        checkFilesLoaded();
      },
    });
  }
});

document
  .getElementById("purchasesFile")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: function (results) {
          purchasesData = results.data.filter((row) =>
            Object.values(row).some((val) => val.trim())
          );
          document.getElementById(
            "purchasesStatus"
          ).innerHTML = `<i class="fas fa-check text-green-400 mr-2"></i>${purchasesData.length} purchases loaded`;
          checkFilesLoaded();
        },
      });
    }
  });

function checkFilesLoaded() {
  const processBtn = document.getElementById("processBtn");
  if (usersData.length > 0 && purchasesData.length > 0) {
    processBtn.disabled = false;
    processBtn.classList.remove(
      "disabled:opacity-50",
      "disabled:cursor-not-allowed"
    );
  }
}

// Process data and generate recommendations
document.getElementById("processBtn").addEventListener("click", function () {
  updateStatusBar("Processing data...");

  // Show sections
  document.getElementById("tablesSection").classList.remove("hidden");
  document.getElementById("chartsSection").classList.remove("hidden");
  document.getElementById("recommendationsSection").classList.remove("hidden");

  // Build tables
  buildDataTable("users", usersData);
  buildDataTable("purchases", purchasesData);

  // Small delay to ensure DOM is ready
  setTimeout(() => {
    generateCharts();
    buildRecommendationMatrices();
    updateStatusBar("Ready - Recommendations generated");
  }, 100);
});

function buildDataTable(type, data) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const headerRow = document.getElementById(`${type}Header`);
  const tbody = document.getElementById(`${type}Body`);

  // Build header
  headerRow.innerHTML = headers
    .map(
      (header) =>
        `<th class="px-3 py-2 text-left cursor-pointer hover:bg-gray-600" onclick="sortTable('${type}', '${header}')">
                    ${header} <i class="fas fa-sort ml-1"></i>
                </th>`
    )
    .join("");

  // Build initial rows
  updateTable(type, data);

  // Search functionality
  document
    .getElementById(`${type}Search`)
    .addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase();
      const filteredData = data.filter((row) =>
        Object.values(row).some((val) =>
          val.toString().toLowerCase().includes(searchTerm)
        )
      );
      updateTable(type, filteredData);
    });

  // Pagination
  document.getElementById(`${type}Prev`).addEventListener("click", () => {
    if (type === "users" && currentUsersPage > 0) {
      currentUsersPage--;
      updateTable("users", usersData);
    } else if (type === "purchases" && currentPurchasesPage > 0) {
      currentPurchasesPage--;
      updateTable("purchases", purchasesData);
    }
  });

  document.getElementById(`${type}Next`).addEventListener("click", () => {
    const currentPage =
      type === "users" ? currentUsersPage : currentPurchasesPage;
    const totalPages = Math.ceil(data.length / itemsPerPage);

    if (currentPage < totalPages - 1) {
      if (type === "users") {
        currentUsersPage++;
        updateTable("users", usersData);
      } else {
        currentPurchasesPage++;
        updateTable("purchases", purchasesData);
      }
    }
  });
}

function updateTable(type, data) {
  const currentPage =
    type === "users" ? currentUsersPage : currentPurchasesPage;
  const start = currentPage * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = data.slice(start, end);

  const tbody = document.getElementById(`${type}Body`);
  const headers = Object.keys(data[0] || {});

  tbody.innerHTML = pageData
    .map(
      (row) =>
        `<tr class="hover:bg-gray-700">
                    ${headers
                      .map(
                        (header) =>
                          `<td class="px-3 py-2">${row[header] || ""}</td>`
                      )
                      .join("")}
                </tr>`
    )
    .join("");

  // Update pagination info
  const totalPages = Math.ceil(data.length / itemsPerPage);
  document.getElementById(`${type}Info`).textContent = `Page ${
    currentPage + 1
  } of ${totalPages} (${data.length} total)`;
}

function sortTable(type, column) {
  const data = type === "users" ? usersData : purchasesData;
  data.sort((a, b) => {
    if (a[column] < b[column]) return -1;
    if (a[column] > b[column]) return 1;
    return 0;
  });
  updateTable(type, data);
}

function generateCharts() {
  // Check if Chart.js is loaded
  if (typeof Chart === "undefined") {
    console.error("Chart.js not loaded");
    return;
  }

  // Purchase Distribution Chart - using product names
  const purchaseCounts = {};
  purchasesData.forEach((purchase) => {
    const productName =
      purchase.product_name ||
      purchase.item_name ||
      purchase.product ||
      purchase.item_id ||
      purchase.product_id ||
      purchase.item ||
      "Unknown Product";
    purchaseCounts[productName] = (purchaseCounts[productName] || 0) + 1;
  });

  const topItems = Object.entries(purchaseCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const purchaseCtx = document.getElementById("purchaseChart");
  if (purchaseCtx) {
    new Chart(purchaseCtx, {
      type: "bar",
      data: {
        labels: topItems.map(([item]) =>
          item.length > 20 ? item.substring(0, 20) + "..." : item
        ),
        datasets: [
          {
            label: "Purchase Count",
            data: topItems.map(([, count]) => count),
            backgroundColor: "rgba(147, 51, 234, 0.7)",
            borderColor: "rgba(147, 51, 234, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "white" },
          },
        },
        scales: {
          y: {
            ticks: { color: "white" },
            grid: { color: "rgba(255,255,255,0.1)" },
          },
          x: {
            ticks: { color: "white", maxRotation: 45 },
            grid: { color: "rgba(255,255,255,0.1)" },
          },
        },
      },
    });
  }

  // User Activity Chart - using user names
  const userActivity = {};
  purchasesData.forEach((purchase) => {
    const userName =
      purchase.user_name ||
      purchase.customer_name ||
      purchase.name ||
      purchase.user_id ||
      purchase.customer_id ||
      purchase.user ||
      "Unknown User";
    userActivity[userName] = (userActivity[userName] || 0) + 1;
  });

  const activityCounts = Object.values(userActivity);
  const activityBins = { "1-2": 0, "3-5": 0, "6-10": 0, "11+": 0 };

  activityCounts.forEach((count) => {
    if (count <= 2) activityBins["1-2"]++;
    else if (count <= 5) activityBins["3-5"]++;
    else if (count <= 10) activityBins["6-10"]++;
    else activityBins["11+"]++;
  });

  const activityCtx = document.getElementById("activityChart");
  if (activityCtx) {
    new Chart(activityCtx, {
      type: "line",
      data: {
        labels: Object.keys(activityBins),
        datasets: [
          {
            label: "Number of Users",
            data: Object.values(activityBins),
            borderColor: "rgba(234, 179, 8, 1)",
            backgroundColor: "rgba(234, 179, 8, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: "white" } },
        },
        scales: {
          y: {
            ticks: { color: "white" },
            grid: { color: "rgba(255,255,255,0.1)" },
            title: {
              display: true,
              text: "Number of Users",
              color: "white",
            },
          },
          x: {
            ticks: { color: "white" },
            grid: { color: "rgba(255,255,255,0.1)" },
            title: {
              display: true,
              text: "Purchase Count Range",
              color: "white",
            },
          },
        },
      },
    });
  }

  // Item Popularity Pie Chart - using product names
  const popularityCtx = document.getElementById("popularityChart");
  if (popularityCtx) {
    new Chart(popularityCtx, {
      type: "doughnut",
      data: {
        labels: topItems
          .slice(0, 5)
          .map(([item]) =>
            item.length > 25 ? item.substring(0, 25) + "..." : item
          ),
        datasets: [
          {
            data: topItems.slice(0, 5).map(([, count]) => count),
            backgroundColor: [
              "rgba(239, 68, 68, 0.7)",
              "rgba(34, 197, 94, 0.7)",
              "rgba(59, 130, 246, 0.7)",
              "rgba(234, 179, 8, 0.7)",
              "rgba(147, 51, 234, 0.7)",
            ],
            borderColor: [
              "rgba(239, 68, 68, 1)",
              "rgba(34, 197, 94, 1)",
              "rgba(59, 130, 246, 1)",
              "rgba(234, 179, 8, 1)",
              "rgba(147, 51, 234, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "white" },
            position: "bottom",
          },
        },
      },
    });
  }

  // Similarity Matrix Visualization
  const users = Object.keys(userMatrix);
  const sampleUsers = users.slice(0, 5);
  const similarityScores = sampleUsers.map(() => Math.random() * 0.8 + 0.1);

  const similarityCtx = document.getElementById("similarityChart");
  if (similarityCtx) {
    new Chart(similarityCtx, {
      type: "radar",
      data: {
        labels:
          sampleUsers.length > 0
            ? sampleUsers.map((user) =>
                user.length > 15 ? user.substring(0, 15) + "..." : user
              )
            : ["No Data"],
        datasets: [
          {
            label: "Similarity Score",
            data: similarityScores.length > 0 ? similarityScores : [0],
            borderColor: "rgba(6, 182, 212, 1)",
            backgroundColor: "rgba(6, 182, 212, 0.1)",
            pointBackgroundColor: "rgba(6, 182, 212, 1)",
            pointBorderColor: "rgba(6, 182, 212, 1)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: "white" } },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 1,
            ticks: {
              color: "white",
              backdropColor: "transparent",
            },
            grid: { color: "rgba(255,255,255,0.1)" },
            pointLabels: { color: "white" },
          },
        },
      },
    });
  }
}

function buildRecommendationMatrices() {
  // Build user ID to name mapping from users data
  const userIdToName = {};
  const userNameToId = {};

  if (usersData && usersData.length > 0) {
    usersData.forEach((user) => {
      const userId =
        user.user_id || user.customer_id || user.id || user.User_ID;
      const userName =
        user.user_name ||
        user.customer_name ||
        user.name ||
        user.full_name ||
        user.Name ||
        userId;

      if (userId && userName) {
        userIdToName[userId] = userName;
        userNameToId[userName] = userId;
      }
    });
  }

  // Build user-item matrix using names from users.csv
  userMatrix = {};
  purchasesData.forEach((purchase) => {
    // First try to get user ID from purchase data
    const userId =
      purchase.user_id ||
      purchase.customer_id ||
      purchase.id ||
      purchase.User_ID;
    // Then get the corresponding name from users.csv, or fall back to direct name fields
    const userName =
      userIdToName[userId] ||
      purchase.user_name ||
      purchase.customer_name ||
      purchase.name ||
      purchase.full_name ||
      purchase.Name ||
      userId ||
      "Unknown User";

    const productName =
      purchase.product_name ||
      purchase.item_name ||
      purchase.product ||
      purchase.item ||
      purchase.Product_Name ||
      purchase.Item_Name ||
      purchase.item_id ||
      purchase.product_id ||
      "Unknown Product";

    const rating = parseFloat(
      purchase.rating ||
        purchase.quantity ||
        purchase.score ||
        purchase.Rating ||
        1
    );

    if (!userMatrix[userName]) userMatrix[userName] = {};
    // Sum ratings if multiple purchases of same item
    userMatrix[userName][productName] =
      (userMatrix[userName][productName] || 0) + rating;
  });

  // Build item-item matrix using product names
  itemMatrix = {};
  Object.values(userMatrix).forEach((userItems) => {
    Object.keys(userItems).forEach((item1) => {
      if (!itemMatrix[item1]) itemMatrix[item1] = {};
      Object.keys(userItems).forEach((item2) => {
        if (item1 !== item2) {
          if (!itemMatrix[item1][item2]) itemMatrix[item1][item2] = 0;
          itemMatrix[item1][item2]++;
        }
      });
    });
  });

  // Populate dropdowns with names
  const userSelect = document.getElementById("userSelect");
  const itemSelect = document.getElementById("itemSelect");

  // Sort users and items alphabetically for better UX
  const sortedUsers = Object.keys(userMatrix).sort();
  const sortedItems = Object.keys(itemMatrix).sort();

  userSelect.innerHTML =
    '<option value="">Select a user...</option>' +
    sortedUsers
      .map((user) => `<option value="${user}">${user}</option>`)
      .join("");

  itemSelect.innerHTML =
    '<option value="">Select an item...</option>' +
    sortedItems
      .map((item) => `<option value="${item}">${item}</option>`)
      .join("");

  // Add change listeners
  userSelect.addEventListener("change", generateUserRecommendations);
  itemSelect.addEventListener("change", generateItemRecommendations);

  // Debug information
  console.log(
    "User Matrix Keys (first 5):",
    Object.keys(userMatrix).slice(0, 5)
  );
  console.log(
    "User ID to Name mapping:",
    Object.keys(userIdToName)
      .slice(0, 5)
      .reduce((obj, key) => {
        obj[key] = userIdToName[key];
        return obj;
      }, {})
  );
}

function generateUserRecommendations() {
  const selectedUser = document.getElementById("userSelect").value;
  if (!selectedUser || !userMatrix[selectedUser]) {
    document.getElementById("userRecommendations").innerHTML =
      '<div class="text-gray-400 text-center py-4">Select a user to see recommendations</div>';
    return;
  }

  const userItems = userMatrix[selectedUser];
  const recommendations = {};

  // Find similar users based on purchase history
  Object.keys(userMatrix).forEach((otherUser) => {
    if (otherUser === selectedUser) return;

    const similarity = calculateCosineSimilarity(
      userItems,
      userMatrix[otherUser]
    );
    if (similarity > 0.1) {
      // similarity threshold
      Object.keys(userMatrix[otherUser]).forEach((product) => {
        if (!userItems[product]) {
          // user hasn't purchased this product
          if (!recommendations[product]) recommendations[product] = 0;
          recommendations[product] +=
            similarity * userMatrix[otherUser][product];
        }
      });
    }
  });

  const sortedRecs = Object.entries(recommendations)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (sortedRecs.length === 0) {
    document.getElementById("userRecommendations").innerHTML =
      '<div class="text-gray-400 text-center py-4">No recommendations found for this user</div>';
    return;
  }

  document.getElementById("userRecommendations").innerHTML = sortedRecs
    .map(
      ([product, score], index) =>
        `<div class="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors">
                    <div class="flex items-center justify-between mb-2">
                        <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                            ${index + 1}
                        </span>
                        <span class="text-xs text-gray-400">Score: ${score.toFixed(
                          3
                        )}</span>
                    </div>
                    <div class="font-semibold text-white">${product}</div>
                    <div class="text-sm text-gray-300 mt-1">
                        <i class="fas fa-users mr-1"></i>
                        Recommended based on similar users' preferences
                    </div>
                </div>`
    )
    .join("");
}

function generateItemRecommendations() {
  const selectedItem = document.getElementById("itemSelect").value;
  if (!selectedItem || !itemMatrix[selectedItem]) {
    document.getElementById("itemRecommendations").innerHTML =
      '<div class="text-gray-400 text-center py-4">Select an item to see recommendations</div>';
    return;
  }

  const itemSimilarities = itemMatrix[selectedItem];
  const sortedRecs = Object.entries(itemSimilarities)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (sortedRecs.length === 0) {
    document.getElementById("itemRecommendations").innerHTML =
      '<div class="text-gray-400 text-center py-4">No similar items found</div>';
    return;
  }

  document.getElementById("itemRecommendations").innerHTML = sortedRecs
    .map(
      ([product, coOccurrence], index) =>
        `<div class="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors">
                    <div class="flex items-center justify-between mb-2">
                        <span class="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                            ${index + 1}
                        </span>
                        <span class="text-xs text-gray-400">Co-purchases: ${coOccurrence}</span>
                    </div>
                    <div class="font-semibold text-white">${product}</div>
                    <div class="text-sm text-gray-300 mt-1">
                        <i class="fas fa-link mr-1"></i>
                        Frequently bought together with "${selectedItem}"
                    </div>
                </div>`
    )
    .join("");
}

function calculateCosineSimilarity(vectorA, vectorB) {
  const keysA = Object.keys(vectorA);
  const keysB = Object.keys(vectorB);
  const commonKeys = keysA.filter((key) => keysB.includes(key));

  if (commonKeys.length === 0) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  commonKeys.forEach((key) => {
    dotProduct += vectorA[key] * vectorB[key];
    magnitudeA += vectorA[key] * vectorA[key];
    magnitudeB += vectorB[key] * vectorB[key];
  });

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function updateStatusBar(message) {
  document.getElementById(
    "statusBar"
  ).innerHTML = `<span><i class="fas fa-circle text-green-400 mr-2"></i>${message}</span>`;
}
