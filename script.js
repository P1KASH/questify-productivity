let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let totalXP = parseInt(localStorage.getItem("xp")) || 0;
let stats = JSON.parse(localStorage.getItem("stats")) || {
  knowledge: 0,
  strength: 0,
  focus: 0
};

let streak = parseInt(localStorage.getItem("streak")) || 0;
let lastCompleted = localStorage.getItem("lastCompleted") || null;

function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("xp", totalXP);
  localStorage.setItem("stats", JSON.stringify(stats));
  localStorage.setItem("streak", streak);
}

function updateUI() {
  document.getElementById("level").innerText = Math.floor(totalXP / 100);
  document.getElementById("streak").innerText = streak;

  let currentXP = totalXP % 100;
  document.getElementById("xp-bar").style.width = currentXP + "%";

  document.getElementById("knowledge").innerText = stats.knowledge;
  document.getElementById("strength").innerText = stats.strength;
  document.getElementById("focus").innerText = stats.focus;

  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((task, index) => {
    let li = document.createElement("li");
    li.innerHTML = `
      ${task.name}
      <div>
        <button onclick="completeTask(${index})">✔</button>
        <button class="delete-btn" onclick="deleteTask(${index})">X</button>
      </div>
    `;
    list.appendChild(li);
  });
}

function addTask() {
  const input = document.getElementById("taskInput");
  const difficulty = document.getElementById("difficulty").value;
  const category = document.getElementById("category").value;

  if (input.value.trim() === "") return;

  tasks.push({
    name: input.value,
    xp: parseInt(difficulty),
    category: category
  });

  input.value = "";
  saveData();
  updateUI();
}

function completeTask(index) {
  let task = tasks[index];
  let oldLevel = Math.floor(totalXP / 100);

  totalXP += task.xp;
  stats[task.category] += 1;

  let today = new Date().toDateString();
  if (lastCompleted !== today) {
    streak++;
    localStorage.setItem("lastCompleted", today);
  }

  let newLevel = Math.floor(totalXP / 100);
  if (newLevel > oldLevel) {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 }
  });
  alert("🎉 LEVEL UP! You are now Level " + newLevel);
}

  tasks.splice(index, 1);
  saveData();
  updateUI();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveData();
  updateUI();
}

updateUI();
