// Activity database with CO2 values (kg CO2 per unit)
const activityDatabase = {
  transport: {
    "Car (petrol)": { co2PerUnit: 0.192, unit: "km" },
    "Car (diesel)": { co2PerUnit: 0.171, unit: "km" },
    Bus: { co2PerUnit: 0.089, unit: "km" },
    Train: { co2PerUnit: 0.041, unit: "km" },
    Motorbike: { co2PerUnit: 0.113, unit: "km" },
    "Flight (short-haul)": { co2PerUnit: 0.255, unit: "km" },
    "Flight (long-haul)": { co2PerUnit: 0.195, unit: "km" },
  },
  food: {
    Beef: { co2PerUnit: 27, unit: "kg" },
    Lamb: { co2PerUnit: 39.2, unit: "kg" },
    Pork: { co2PerUnit: 12.1, unit: "kg" },
    Chicken: { co2PerUnit: 6.9, unit: "kg" },
    Fish: { co2PerUnit: 6, unit: "kg" },
    Cheese: { co2PerUnit: 13.5, unit: "kg" },
    Milk: { co2PerUnit: 1.9, unit: "liter" },
    Eggs: { co2PerUnit: 4.8, unit: "kg" },
    Rice: { co2PerUnit: 2.7, unit: "kg" },
    Vegetables: { co2PerUnit: 2, unit: "kg" },
  },
  energy: {
    Electricity: { co2PerUnit: 0.233, unit: "kWh" },
    "Natural gas": { co2PerUnit: 0.185, unit: "kWh" },
    "Heating oil": { co2PerUnit: 0.265, unit: "liter" },
    Coal: { co2PerUnit: 0.341, unit: "kg" },
  },
};

// State
let activities = [];
let currentFilter = "all";

// DOM elements
const categorySelect = document.getElementById("category");
const activitySelect = document.getElementById("activity");
const amountInput = document.getElementById("amount");
const unitSpan = document.getElementById("unit");
const activityForm = document.getElementById("activityForm");
const activitiesList = document.getElementById("activitiesList");
const filterButtons = document.querySelectorAll(".filter-btn");

// Initialize
loadActivities();
updateUI();

// Event listeners
categorySelect.addEventListener("change", handleCategoryChange);
activitySelect.addEventListener("change", handleActivityChange);
activityForm.addEventListener("submit", handleFormSubmit);
filterButtons.forEach((btn) => {
  btn.addEventListener("click", handleFilterChange);
});

// Functions
function handleCategoryChange(e) {
  const category = e.target.value;
  activitySelect.innerHTML = '<option value="">Select activity...</option>';

  if (category) {
    const activities = activityDatabase[category];
    Object.keys(activities).forEach((activity) => {
      const option = document.createElement("option");
      option.value = activity;
      option.textContent = activity;
      activitySelect.appendChild(option);
    });
    activitySelect.disabled = false;
  } else {
    activitySelect.disabled = true;
    amountInput.disabled = true;
    unitSpan.textContent = "-";
  }
}

function handleActivityChange(e) {
  const category = categorySelect.value;
  const activity = e.target.value;

  if (activity) {
    const activityData = activityDatabase[category][activity];
    unitSpan.textContent = activityData.unit;
    amountInput.disabled = false;
    amountInput.focus();
  } else {
    amountInput.disabled = true;
    unitSpan.textContent = "-";
  }
}

function handleFormSubmit(e) {
  e.preventDefault();

  const category = categorySelect.value;
  const activityName = activitySelect.value;
  const amount = parseFloat(amountInput.value);

  const activityData = activityDatabase[category][activityName];
  const co2 = amount * activityData.co2PerUnit;

  const newActivity = {
    id: Date.now(),
    category,
    name: activityName,
    amount,
    unit: activityData.unit,
    co2: parseFloat(co2.toFixed(2)),
    timestamp: new Date().toISOString(),
  };

  activities.push(newActivity);
  saveActivities();
  updateUI();

  // Reset form
  activityForm.reset();
  activitySelect.disabled = true;
  amountInput.disabled = true;
  unitSpan.textContent = "-";
}

function handleFilterChange(e) {
  filterButtons.forEach((btn) => btn.classList.remove("active"));
  e.target.classList.add("active");
  currentFilter = e.target.dataset.filter;
  renderActivities();
}

function deleteActivity(id) {
  activities = activities.filter((a) => a.id !== id);
  saveActivities();
  updateUI();
}

function renderActivities() {
  const filteredActivities =
    currentFilter === "all"
      ? activities
      : activities.filter((a) => a.category === currentFilter);

  if (filteredActivities.length === 0) {
    activitiesList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🌱</div>
                        <p>${
                          currentFilter === "all"
                            ? "No activities logged yet.<br>Start tracking your footprint!"
                            : `No ${currentFilter} activities logged yet.`
                        }</p>
                    </div>
                `;
    return;
  }

  activitiesList.innerHTML = filteredActivities
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .map(
      (activity) => `
                    <div class="activity-item ${activity.category}">
                        <div class="activity-info">
                            <h3>${activity.name}</h3>
                            <div class="activity-meta">${activity.amount} ${
        activity.unit
      } • ${new Date(activity.timestamp).toLocaleDateString()}</div>
                        </div>
                        <div class="activity-co2">
                            <div class="co2-amount">${activity.co2}</div>
                            <div class="co2-label">kg CO₂</div>
                        </div>
                        <button class="delete-btn" onclick="deleteActivity(${
                          activity.id
                        })">×</button>
                    </div>
                `
    )
    .join("");
}

function updateSummary() {
  const totals = {
    transport: 0,
    food: 0,
    energy: 0,
  };

  activities.forEach((activity) => {
    totals[activity.category] += activity.co2;
  });

  const totalCO2 = totals.transport + totals.food + totals.energy;

  // Update total display
  document.getElementById("totalCO2").textContent = totalCO2.toFixed(1);

  // Update bar chart
  const maxValue = Math.max(totals.transport, totals.food, totals.energy) || 1;

  document.getElementById(
    "transportTotal"
  ).textContent = `${totals.transport.toFixed(1)} kg`;
  document.getElementById("foodTotal").textContent = `${totals.food.toFixed(
    1
  )} kg`;
  document.getElementById("energyTotal").textContent = `${totals.energy.toFixed(
    1
  )} kg`;

  const transportPercent = ((totals.transport / maxValue) * 100).toFixed(0);
  const foodPercent = ((totals.food / maxValue) * 100).toFixed(0);
  const energyPercent = ((totals.energy / maxValue) * 100).toFixed(0);

  document.getElementById("transportBar").style.width = `${transportPercent}%`;
  document.getElementById("foodBar").style.width = `${foodPercent}%`;
  document.getElementById("energyBar").style.width = `${energyPercent}%`;

  document.getElementById(
    "transportPercent"
  ).textContent = `${transportPercent}%`;
  document.getElementById("foodPercent").textContent = `${foodPercent}%`;
  document.getElementById("energyPercent").textContent = `${energyPercent}%`;

  // Update legend (percentage of total)
  if (totalCO2 > 0) {
    document.getElementById("transportLegend").textContent = `${(
      (totals.transport / totalCO2) *
      100
    ).toFixed(0)}%`;
    document.getElementById("foodLegend").textContent = `${(
      (totals.food / totalCO2) *
      100
    ).toFixed(0)}%`;
    document.getElementById("energyLegend").textContent = `${(
      (totals.energy / totalCO2) *
      100
    ).toFixed(0)}%`;
  } else {
    document.getElementById("transportLegend").textContent = "0%";
    document.getElementById("foodLegend").textContent = "0%";
    document.getElementById("energyLegend").textContent = "0%";
  }
}

function updateUI() {
  renderActivities();
  updateSummary();
}

function saveActivities() {
  localStorage.setItem("footprintActivities", JSON.stringify(activities));
}

function loadActivities() {
  const stored = localStorage.getItem("footprintActivities");
  if (stored) {
    activities = JSON.parse(stored);
  }
}
