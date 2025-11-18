const timeZones = [
  {
    group: "Popular",
    zones: [
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Paris",
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Asia/Kolkata",
      "Australia/Sydney",
    ],
  },
  {
    group: "Americas",
    zones: [
      "America/Anchorage",
      "America/Argentina/Buenos_Aires",
      "America/Bogota",
      "America/Caracas",
      "America/Chicago",
      "America/Denver",
      "America/Halifax",
      "America/Lima",
      "America/Los_Angeles",
      "America/Mexico_City",
      "America/New_York",
      "America/Phoenix",
      "America/Santiago",
      "America/Sao_Paulo",
      "America/St_Johns",
      "America/Toronto",
      "America/Vancouver",
    ],
  },
  {
    group: "Europe",
    zones: [
      "Europe/Amsterdam",
      "Europe/Athens",
      "Europe/Berlin",
      "Europe/Brussels",
      "Europe/Budapest",
      "Europe/Copenhagen",
      "Europe/Dublin",
      "Europe/Helsinki",
      "Europe/Istanbul",
      "Europe/Lisbon",
      "Europe/London",
      "Europe/Madrid",
      "Europe/Moscow",
      "Europe/Oslo",
      "Europe/Paris",
      "Europe/Prague",
      "Europe/Rome",
      "Europe/Stockholm",
      "Europe/Vienna",
      "Europe/Warsaw",
      "Europe/Zurich",
    ],
  },
  {
    group: "Asia",
    zones: [
      "Asia/Baghdad",
      "Asia/Baku",
      "Asia/Bangkok",
      "Asia/Beirut",
      "Asia/Dhaka",
      "Asia/Dubai",
      "Asia/Hong_Kong",
      "Asia/Jakarta",
      "Asia/Jerusalem",
      "Asia/Karachi",
      "Asia/Kathmandu",
      "Asia/Kolkata",
      "Asia/Kuala_Lumpur",
      "Asia/Manila",
      "Asia/Riyadh",
      "Asia/Seoul",
      "Asia/Shanghai",
      "Asia/Singapore",
      "Asia/Taipei",
      "Asia/Tehran",
      "Asia/Tokyo",
    ],
  },
  {
    group: "Pacific",
    zones: [
      "Pacific/Auckland",
      "Pacific/Fiji",
      "Pacific/Guam",
      "Pacific/Honolulu",
      "Pacific/Pago_Pago",
      "Pacific/Port_Moresby",
      "Pacific/Tongatapu",
    ],
  },
  {
    group: "Africa",
    zones: [
      "Africa/Cairo",
      "Africa/Casablanca",
      "Africa/Johannesburg",
      "Africa/Lagos",
      "Africa/Nairobi",
    ],
  },
  {
    group: "Australia",
    zones: [
      "Australia/Adelaide",
      "Australia/Brisbane",
      "Australia/Darwin",
      "Australia/Melbourne",
      "Australia/Perth",
      "Australia/Sydney",
    ],
  },
  {
    group: "Atlantic",
    zones: [
      "Atlantic/Azores",
      "Atlantic/Bermuda",
      "Atlantic/Cape_Verde",
      "Atlantic/Reykjavik",
    ],
  },
];

// Populate timezone dropdowns
function populateTimezones() {
  const fromSelect = document.getElementById("fromTZ");
  const toSelect = document.getElementById("toTZ");

  timeZones.forEach((group) => {
    const optgroup1 = document.createElement("optgroup");
    const optgroup2 = document.createElement("optgroup");
    optgroup1.label = group.group;
    optgroup2.label = group.group;

    group.zones.forEach((tz) => {
      const option1 = document.createElement("option");
      const option2 = document.createElement("option");
      option1.value = tz;
      option2.value = tz;
      option1.textContent = tz.replace(/_/g, " ");
      option2.textContent = tz.replace(/_/g, " ");
      optgroup1.appendChild(option1);
      optgroup2.appendChild(option2);
    });

    fromSelect.appendChild(optgroup1);
    toSelect.appendChild(optgroup2);
  });

  // Set default values
  fromSelect.value = "Asia/Kolkata";
  toSelect.value = "America/New_York";
}

function getOffset(timeZone) {
  const now = new Date();
  const tzString = now.toLocaleString("en-US", {
    timeZone,
    timeZoneName: "short",
  });
  const match = tzString.match(/GMT([+-]\d+)/);
  return match ? match[1] : "";
}

function getOffsetMinutes(tz, date = new Date()) {
  // Get the offset for a specific date to account for DST
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: tz }));
  return Math.round((tzDate - utcDate) / 60000);
}

function convertTime(timeStr, fromTZ, toTZ) {
  const [hours, minutes] = timeStr.split(":").map(Number);

  // Get current date
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  // Create ISO string for the time in source timezone
  const timeStrFull = `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:00`;
  const isoString = `${year}-${month}-${day}T${timeStrFull}`;

  // Create a formatter for the source timezone to get the UTC equivalent
  const sourceFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: fromTZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Parse the input time as if it's in the source timezone
  // We need to find what UTC time corresponds to this local time
  let testDate = new Date(isoString + "Z"); // Start with UTC interpretation

  // Iteratively adjust to find the correct UTC time
  for (let i = 0; i < 3; i++) {
    const parts = sourceFormatter.formatToParts(testDate);
    const sourceHour = parseInt(parts.find((p) => p.type === "hour").value);
    const sourceMinute = parseInt(parts.find((p) => p.type === "minute").value);

    const hourDiff = hours - sourceHour;
    const minuteDiff = minutes - sourceMinute;

    testDate = new Date(
      testDate.getTime() + hourDiff * 3600000 + minuteDiff * 60000
    );
  }

  // Now convert to target timezone
  const targetFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: toTZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const targetParts = targetFormatter.formatToParts(testDate);
  const resultHours = parseInt(
    targetParts.find((p) => p.type === "hour").value
  );
  const resultMinutes = parseInt(
    targetParts.find((p) => p.type === "minute").value
  );

  const period = resultHours >= 12 ? "PM" : "AM";
  const displayHours =
    resultHours === 0 ? 12 : resultHours > 12 ? resultHours - 12 : resultHours;
  const displayMinutes = String(resultMinutes).padStart(2, "0");

  return {
    formatted: `${String(displayHours).padStart(
      2,
      "0"
    )}:${displayMinutes} ${period}`,
    hours24: resultHours,
    minutes: resultMinutes,
  };
}

function drawClock(canvasId, startHour, startMin, endHour, endMin, label) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 85;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw clock face
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "#1e293b";
  ctx.fill();
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw hour markers
  for (let i = 0; i < 12; i++) {
    const angle = ((i * 30 - 90) * Math.PI) / 180;
    const x1 = centerX + Math.cos(angle) * (radius - 15);
    const y1 = centerY + Math.sin(angle) * (radius - 15);
    const x2 = centerX + Math.cos(angle) * (radius - 8);
    const y2 = centerY + Math.sin(angle) * (radius - 8);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw hour numbers
    const numX = centerX + Math.cos(angle) * (radius - 25);
    const numY = centerY + Math.sin(angle) * (radius - 25);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(i === 0 ? 12 : i, numX, numY);
  }

  // Draw time range arc
  const startAngle =
    (((startHour % 12) * 30 + startMin * 0.5 - 90) * Math.PI) / 180;
  const endAngle = (((endHour % 12) * 30 + endMin * 0.5 - 90) * Math.PI) / 180;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - 20, startAngle, endAngle);
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 8;
  ctx.stroke();

  // Draw start time hand
  const startHandAngle = startAngle;
  const startHandX = centerX + Math.cos(startHandAngle) * (radius - 30);
  const startHandY = centerY + Math.sin(startHandAngle) * (radius - 30);

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(startHandX, startHandY);
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw end time hand
  const endHandAngle = endAngle;
  const endHandX = centerX + Math.cos(endHandAngle) * (radius - 30);
  const endHandY = centerY + Math.sin(endHandAngle) * (radius - 30);

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(endHandX, endHandY);
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw center dot
  ctx.beginPath();
  ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
  ctx.fillStyle = "#64748b";
  ctx.fill();

  // Draw label
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, centerX, centerY + radius + 20);
}

function convertRange() {
  const fromTZ = document.getElementById("fromTZ").value;
  const toTZ = document.getElementById("toTZ").value;
  const start = document.getElementById("startTime").value;
  const end = document.getElementById("endTime").value;

  if (!fromTZ || !toTZ || !start || !end) {
    alert("Please fill all fields.");
    return;
  }

  try {
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);

    const convertedStart = convertTime(start, fromTZ, toTZ);
    const convertedEnd = convertTime(end, fromTZ, toTZ);

    const fromOffset = getOffset(fromTZ);
    const toOffset = getOffset(toTZ);

    document.getElementById(
      "sourceText"
    ).textContent = `${start} → ${end} (${fromTZ.replace(/_/g, " ")})`;
    document.getElementById("convertedText").textContent = `${
      convertedStart.formatted
    } → ${convertedEnd.formatted} (${toTZ.replace(/_/g, " ")})`;
    document.getElementById(
      "offsetInfo"
    ).textContent = `Time offset: ${fromOffset} → ${toOffset}`;
    document.getElementById("result").classList.remove("hidden");

    // Draw clocks
    drawClock(
      "sourceClock",
      startHour,
      startMin,
      endHour,
      endMin,
      fromTZ.split("/").pop().replace(/_/g, " ")
    );
    drawClock(
      "targetClock",
      convertedStart.hours24,
      convertedStart.minutes,
      convertedEnd.hours24,
      convertedEnd.minutes,
      toTZ.split("/").pop().replace(/_/g, " ")
    );
  } catch (error) {
    alert("Error converting time zones. Please check your selections.");
    console.error(error);
  }
}

function swapTimezones() {
  const fromTZ = document.getElementById("fromTZ");
  const toTZ = document.getElementById("toTZ");
  const temp = fromTZ.value;
  fromTZ.value = toTZ.value;
  toTZ.value = temp;
}

function updateCurrentTime() {
  const now = new Date();
  const timeStr = now.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  document.getElementById("currentTime").textContent = `${dateStr}, ${timeStr}`;
}

// Initialize
populateTimezones();
updateCurrentTime();
setInterval(updateCurrentTime, 1000);
