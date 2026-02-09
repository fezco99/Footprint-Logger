//DOM ELEMENTS
const transportBtn = document.getElementById("transport");
const foodBtn = document.getElementById("food");
const energyBtn = document.getElementById("energy");
const shoppingBtn = document.getElementById("shopping");
const allBtn = document.getElementById("all");
const buttons = document.querySelectorAll(".sections button");
const profile = document.querySelector(".ppic");
const leaderBoardEl = document.querySelector(".leaderboardContent");
const weeklyTotalEl = document.getElementById("weeklyTotal");
const streakEl = document.getElementById("streak");

const totalCost = document.querySelector(".cost");
const averageEl = document.querySelector(".avg");
const pastActs = document.querySelector(".past");
const optionsEl = document.querySelector(".options");
const chartEl = document.getElementById("chartData").getContext("2d");

// Form variables
const activityName = document.getElementById("actName");
const categorySelect = document.getElementById("category");
const co2Num = document.getElementById("co2");
const submitBtn = document.querySelector(".addAct");

//STATE
let prevActs = []; // store recent activities
let pieChartData = []; // data for pie chart
const token = localStorage.getItem("token");

//DATA
let activities = [
  { name: "Drive Car", category: "Transport", value: 1 },
  { name: "Train Ride", category: "Transport", value: 0.5 },
  { name: "Beef meal", category: "food", value: 2 },
  { name: "Vegan meal", category: "food", value: 0.4 },
  { name: "electricity", category: "energy", value: 1 },
  { name: "electronics", category: "shopping", value: 3 },
  { name: "clothing", category: "shopping", value: 2 },
];

//delete an activity
async function deleteAct(name) {
  const res = await fetch("http://localhost:8080/activities/deleteActivity", {
    method: "delete",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  load();
}

//map the past activities
function mapAct(prevActs, sliced) {
  if (sliced) {
    pastActs.innerHTML = `
          <h2>Past Activities</h2>
          ${prevActs
            .slice(0, 5)
            .map((item) => {
              return `<div class="pastVal">
                        <p>${item.name}</p>
                        <p>${item.val}</p>
                        <button onclick="deleteAct('${item.name}')" class="delBtn">X</button>
                      </div>`;
            })
            .join("")}
        `;
  } else {
    pastActs.innerHTML = `
          <h2>Past Activities</h2>
          ${prevActs
            .map((item) => {
              return `<div class="pastVal">
                        <p>${item.name}</p>
                        <p>${item.val}</p>
                        <button onclick="deleteAct('${item.name}')" class="delBtn">X</button>
                      </div>`;
            })
            .join("")}
        `;
  }
}

//function to retrieve leaderboard
async function loadLeaderBoard() {
  const res = await fetch("http://localhost:8080/activities/leaderboard");
  const data = await res.json();
  let num = 1;
  leaderBoardEl.innerHTML = "";

  data.map((item) => {
    leaderBoardEl.innerHTML += `
      <p ${num < 4 ? `class='num-${num}'` : "class='def'"}>${item.name}: ${
      item.total
    }CO₂</p>
    `;
    num++;
  });

  console.log(leaderBoardEl);
}

//function to load content from backend
async function load() {
  if (!token) {
    window.location.href = "login.html";
  } else {
    const res = await fetch("http://localhost:8080/activities/getActivities", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status !== 200) {
      localStorage.setItem("token", "");
      window.location.href = "login.html";
    } else {
      const data = await res.json();
      //get the recent activities and calculate the total
      let total = data.recentActivities.reduce((acc, curr) => {
        return acc + curr.val;
      }, 0);
      //get the average
      const averageRes = await fetch(
        "http://localhost:8080/activities/allTotal"
      );
      const averageData = await averageRes.json();
      const average = averageData.average;
      //update average DOM
      averageEl.textContent = `average: ${average.toFixed(2)} CO₂`;
      //update total DOM
      totalCost.textContent = `${total.toFixed(2)} CO₂`;
      prevActs = data.recentActivities;
      prevActs = prevActs.reverse();
      pieChartData = data.recentActivities;
      mapAct(prevActs, true);
      pastActs.innerHTML +=
        prevActs.length > 5
          ? `<button onclick="mapAct(prevActs, false)">See all</button>`
          : "";
      updateChart(pieChartData, pieChart);

      const customActivitiesData = await fetch(
        "http://localhost:8080/activities/getCustom",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const customActs = await customActivitiesData.json();

      //make sure activities has no duplicates first
      activities = [
        { name: "Drive Car", category: "Transport", value: 1 },
        { name: "Train Ride", category: "Transport", value: 0.5 },
        { name: "Beef meal", category: "food", value: 2 },
        { name: "Vegan meal", category: "food", value: 0.4 },
        { name: "electricity", category: "energy", value: 1 },
        { name: "electronics", category: "shopping", value: 3 },
        { name: "clothing", category: "shopping", value: 2 },
      ];
      activities = activities.concat(customActs);
      addActivities(optionsEl, "all");

      loadLeaderBoard();

      //get weekly summary
      const weeklyRes = await fetch(
        "http://localhost:8080/activities/getWeekly",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const weeklyData = await weeklyRes.json();

      weeklyTotalEl.textContent = `Weekly Total: ${weeklyData.total}`;

      setBarGraph(weeklyData.categoryTotals);

      //get streak count
      const streakRes = await fetch(
        "http://localhost:8080/activities/getStreak",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const streak = await streakRes.json();

      streakEl.textContent = `Streak: ${streak}`;
    }
  }
}

//function to make weekly bar graph
function setBarGraph(data) {
  const chart = document.querySelector(".barChart");

  chart.innerHTML = "";

  const max = Math.max(...data.map((item) => item.total));

  data.forEach((item) => {
    const bar = document.createElement("div");
    bar.className = "bar";

    bar.style.height = `${(item.total / max) * 100}%`;
    bar.textContent = `${item.cat} ${item.total.toFixed(2)}`;

    chart.appendChild(bar);
  });
}

//validate jwt token on page load
document.addEventListener("DOMContentLoaded", () => {
  load();
});

//update pie chart data
function updateChart(arr, pieChart) {
  pieChart.data.datasets[0].data[0] = 0;
  pieChart.data.datasets[0].data[1] = 0;
  pieChart.data.datasets[0].data[2] = 0;
  pieChart.data.datasets[0].data[3] = 0;

  for (let x = 0; x < arr.length; x++) {
    if (arr[x].category === "Transport") {
      pieChart.data.datasets[0].data[0] += arr[x].val;
    } else if (arr[x].category === "food") {
      pieChart.data.datasets[0].data[1] += arr[x].val;
    } else if (arr[x].category === "energy") {
      pieChart.data.datasets[0].data[2] += arr[x].val;
    } else {
      pieChart.data.datasets[0].data[3] += arr[x].val;
    }
  }

  pieChart.update();
}

//pie chart creation
const pieChart = new Chart(chartEl, {
  type: "pie",
  data: {
    labels: ["transport", "food", "energy", "shopping"],
    datasets: [
      {
        label: "",
        data: [0, 0, 0, 0],
        backgroundColor: ["#b894ff", "#ffbc78", "#ff91a9", "#81d2d3"],
        hoverOffset: 4,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Pie Chart" },
    },
  },
});

// Render activities list based on category
function addActivities(options, cat) {
  if (cat === "all") {
    optionsEl.innerHTML = activities
      .map((act) => {
        return `<div class="act">
                  <p>${act.name}</p>
                  <p class="amount">CO₂: ${act.value}</p>
                  <button onclick="add('${act.name}', ${act.value}, '${act.category}')" class="addBtn">
                    + Add Activity
                  </button>
                </div>`;
      })
      .join("");
  } else {
    options.innerHTML = activities
      .map((act) => {
        if (act.category === cat) {
          return `<div class="act">
                    <p>${act.name}</p>
                    <p class="amount">CO₂: ${act.value}</p>
                    <button onclick="add('${act.name}', ${act.value}, '${act.category}')" class="addBtn">
                      + Add Activity
                    </button>
                  </div>`;
        }
      })
      .join("");
  }
}

//INITIALIZATION
addActivities(optionsEl, "all");

// category filters
transportBtn.onclick = () => addActivities(optionsEl, "Transport");
foodBtn.onclick = () => addActivities(optionsEl, "food");
energyBtn.onclick = () => addActivities(optionsEl, "energy");
shoppingBtn.onclick = () => addActivities(optionsEl, "shopping");
allBtn.onclick = () => addActivities(optionsEl, "all");

// toggle active state on category buttons
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

//add a activity
async function add(name, val, cat) {
  const res = await fetch("http://localhost:8080/activities/addActivity", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      val: val,
      category: cat,
    }),
  });

  if (res.status !== 201) {
    console.log("something went wrong");
    return;
  }

  load();
}

//add a custom activity
async function addNewActivity(name, category, co2) {
  const res = await fetch("http://localhost:8080/activities/addCustom", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      val: co2,
      category: category,
    }),
  });

  if (res.status !== 201) {
    console.log("something went wrong");
    return;
  }

  load();
}

//LOGOUT ALERT FUNCTIONALITY
function showAlert() {
  document.getElementById("myAlert").style.display = "block";
}

document.getElementById("okBtn").onclick = () => {
  document.getElementById("myAlert").style.display = "none";
  localStorage.setItem("token", "");
  window.location.href = "login.html";
};

document.getElementById("cancelBtn").onclick = () => {
  document.getElementById("myAlert").style.display = "none";
};

profile.onclick = () => showAlert();

//submit the custom activity button
submitBtn.onclick = () => {
  if (
    activityName.value.trim() !== "" &&
    categorySelect.value &&
    co2Num.value
  ) {
    addNewActivity(activityName.value, categorySelect.value, co2Num.value);
    activityName.value = "";
    categorySelect.value = "";
    co2Num.value = "";
  } else {
    alert("please fill in all details!");
  }
};
