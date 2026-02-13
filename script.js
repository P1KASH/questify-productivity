let currentUser = null;
let users = JSON.parse(localStorage.getItem("users")) || {};

let tasks = [];
let totalXP = 0;
let stats = {};
let streak = 0;
let lastCompleted = null;

function register() {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Enter username and password");
    return;
  }

  if (users[username]) {
    alert("User already exists");
    return;
  }

  users[username] = {
    password: password,
    tasks: [],
    xp: 0,
    stats: { knowledge: 0, strength: 0, focus: 0 },
    streak: 0,
    lastCompleted: null
  };

  localStorage.setItem("users", JSON.stringify(users));
  alert("Registered successfully!");
}

function login() {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  if (!users[username] || users[username].password !== password) {
    alert("Invalid credentials");
    return;
  }

  currentUser = username;
  document.getElementById("accountName").innerText = username;

  loadUserData();
  updateLeaderboard();

  document.getElementById("auth-container").style.display = "none";
  document.getElementById("app").style.display = "block";
}


  



  document.getElementById("auth-container").style.display = "none";
  document.getElementById("app").style.display = "block";
}

function loadUserData() {
  let userData = users[currentUser];

  tasks = userData.tasks;
  totalXP = userData.xp;
  stats = userData.stats;
  streak = userData.streak;
  lastCompleted = userData.lastCompleted;

  updateUI();
}


function saveData() {
  users[currentUser].tasks = tasks;
  users[currentUser].xp = totalXP;
  users[currentUser].stats = stats;
  users[currentUser].streak = streak;
  users[currentUser].lastCompleted = lastCompleted;

  localStorage.setItem("users", JSON.stringify(users));
}


function updateUI() {
  if (!currentUser) return;

  const levelEl = document.getElementById("level");
  const streakEl = document.getElementById("streak");
  const knowledgeEl = document.getElementById("knowledge");
  const strengthEl = document.getElementById("strength");
  const focusEl = document.getElementById("focus");

  if (levelEl) levelEl.innerText = Math.floor(totalXP / 100);
  if (streakEl) streakEl.innerText = streak;

  let currentXP = totalXP % 100;
  const xpBar = document.getElementById("xp-bar");
  if (xpBar) xpBar.style.width = currentXP + "%";

  if (knowledgeEl) knowledgeEl.innerText = stats.knowledge;
  if (strengthEl) strengthEl.innerText = stats.strength;
  if (focusEl) focusEl.innerText = stats.focus;

  const list = document.getElementById("taskList");
  if (!list) return;

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
  document.getElementById("addSound").play();
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
  document.getElementById("taskSound").play();
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
  document.getElementById("levelSound").play();

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
  document.getElementById("failSound").play(); // ❌ failure sound

  tasks.splice(index, 1);
  saveData();
  updateUI();
}

function toggleMenu() {
  const menu = document.getElementById("topMenu");
  menu.classList.toggle("open");
}


updateUI();









