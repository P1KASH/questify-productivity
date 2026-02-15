// 🔥 FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";



// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBP3M32Ymumv4CENtktjJ75OM4f7wlYX50",
  authDomain: "questify-productivity.firebaseapp.com",
  projectId: "questify-productivity",
  storageBucket: "questify-productivity.firebasestorage.app",
  messagingSenderId: "266314544286",
  appId: "1:266314544286:web:f07d65c02273ecc0c1b78f"
};

// 🔥 INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
window.logout = async function () {
  try {
    await signOut(auth);
    resetGameState(); // 🔥 IMPORTANT
    console.log("User logged out");
  } catch (error) {
    console.error("Logout error:", error);
  }
};


// ===== GAME STATE (CLOUD SYNCED) =====
let tasks = [];
let totalXP = 0;
let stats = { knowledge: 0, strength: 0, focus: 0 };
let streak = 0;
let lastCompleted = null;

// 🔥 NEW SYSTEMS
let dailyEnergy = 100;
let lastEnergyReset = new Date().toDateString();
let weeklyBossProgress = 0;

// ===== FIRESTORE SAVE =====
async function saveUserData() {
  if (!auth.currentUser) return;

  const uid = auth.currentUser.uid;

  await setDoc(doc(db, "users", uid), {
  email: auth.currentUser.email,
  totalXP,
  level: Math.floor(totalXP / 100),
  tasks,
  stats,
  streak,
  lastCompleted,
  dailyEnergy,
  lastEnergyReset,
  weeklyBossProgress

});

}
// ===== FIRESTORE LOAD =====
async function loadUserData() {
  if (!auth.currentUser) return;

  const uid = auth.currentUser.uid;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    tasks = data.tasks || [];
    totalXP = data.totalXP || 0;
    stats = data.stats || { knowledge: 0, strength: 0, focus: 0 };
    streak = data.streak || 0;
    lastCompleted = data.lastCompleted || null;
    dailyEnergy = data.dailyEnergy ?? 100;
    lastEnergyReset = data.lastEnergyReset ?? new Date().toDateString();
    weeklyBossProgress = data.weeklyBossProgress ?? 0;

  } else {
    // First-time user → create document
    await saveUserData();
  }

  updateUI();
}


// ===============================
// 🔐 AUTH FUNCTIONS
// ===============================

window.register = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Registered successfully!");
  } catch (error) {
    alert(error.message);
  }
};


window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert("Invalid login credentials");
  }
};

// ===============================
// 🔄 AUTH STATE LISTENER
// ===============================

onAuthStateChanged(auth, (user) => {
  if (user) {
    resetGameState(); // 🔥 CLEAR OLD USER DATA FIRST

    document.getElementById("auth-container").style.display = "none";
    document.getElementById("app").style.display = "block";

    loadUserData(); // then load correct data
    loadLeaderboard();
  } else {
    document.getElementById("auth-container").style.display = "flex";
    document.getElementById("app").style.display = "none";
  }
});

// ===============================
// 🎮 GAME LOGIC (GLOBAL FOR HTML)
// ===============================

function updateUI() {
  document.getElementById("level").innerText = Math.floor(totalXP / 100);
  document.getElementById("streak").innerText = streak;
  let level = Math.floor(totalXP / 100);
    document.getElementById("level").innerText = level;
   document.getElementById("level").title = getTitle(level);

  let currentXP = totalXP % 100;
  document.getElementById("xp-bar").style.width = currentXP + "%";

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

  document.getElementById("knowledge-bar").style.width =
    Math.min(stats.knowledge * 10, 100) + "%";

  document.getElementById("strength-bar").style.width =
    Math.min(stats.strength * 10, 100) + "%";

  document.getElementById("focus-bar").style.width =
    Math.min(stats.focus * 10, 100) + "%";
}

// 🔥 MUST BE window.addTask
window.addTask = function () {
  document.getElementById("addSound").play();

  const input = document.getElementById("taskInput");
  const difficulty = document.getElementById("difficulty").value;
  const category = document.getElementById("category").value;

  if (input.value.trim() === "") return;

  tasks.push({
    name: input.value,
    xp: parseInt(difficulty),
    category
  });

  input.value = "";
  saveUserData();
  updateUI();
};

// 🔥 MUST BE window.completeTask
window.completeTask = function (index) {
  document.getElementById("taskSound").play();

  let task = tasks[index];
  // ⚡ Daily Energy Reset
let todayEnergy = new Date().toDateString();
if (lastEnergyReset !== todayEnergy) {
  dailyEnergy = 100;
  lastEnergyReset = todayEnergy;
}

// ⚡ Check if enough energy
if (dailyEnergy < task.xp) {
  alert("⚡ Not enough daily energy!");
  return;
}

// ⚡ Deduct energy
dailyEnergy -= task.xp;

  let oldLevel = Math.floor(totalXP / 100);

  stats[task.category] += 1;

  let today = new Date().toDateString();
  if (lastCompleted !== today) {
    streak++;
    lastCompleted = today;
  }
    // 🔥 Streak Multiplier
let multiplier = 1;

if (streak >= 10) {
  multiplier = 1.5;
} else if (streak >= 5) {
  multiplier = 1.2;
}

let finalXP = Math.floor(task.xp * multiplier);

totalXP += finalXP;
// 👑 Weekly Boss Progress
weeklyBossProgress++;

if (weeklyBossProgress >= 5) {
  totalXP += 50;
  alert("👑 Weekly Boss Defeated! +50 Bonus XP");
  weeklyBossProgress = 0;
}


  let newLevel = Math.floor(totalXP / 100);
  if (newLevel > oldLevel) {
    document.getElementById("levelSound").play();
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    alert("🎉 LEVEL UP! You are now Level " + newLevel);
  }

  tasks.splice(index, 1);
  saveUserData();
  updateUI();
};

// 🔥 MUST BE window.deleteTask
window.deleteTask = function (index) {
  document.getElementById("failSound").play();
  tasks.splice(index, 1);
  saveUserData();
  updateUI();
};
function resetGameState() {
  tasks = [];
  totalXP = 0;
  stats = { knowledge: 0, strength: 0, focus: 0 };
  streak = 0;
  lastCompleted = null;
  updateUI();
}

async function loadLeaderboard() {
  const leaderboardList = document.getElementById("leaderboardList");
  if (!leaderboardList) return;

  leaderboardList.innerHTML = "";

  const q = query(
    collection(db, "users"),
    orderBy("totalXP", "desc"),
    limit(10)
  );

  const querySnapshot = await getDocs(q);

  let rank = 1;

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    const li = document.createElement("li");
    let medal = "";
        if (rank === 1) medal = "🥇";
        else if (rank === 2) medal = "🥈";
          else if (rank === 3) medal = "🥉";

li.innerHTML = `
  ${medal} <strong>#${rank}</strong> 
  ${data.email} 
  — ${data.totalXP || 0} XP
`;


    leaderboardList.appendChild(li);
    rank++;
  });
}
function getTitle(level) {
  if (level >= 50) return "🏆 Legend";
  if (level >= 20) return "🔥 Elite";
  if (level >= 10) return "⚔ Grinder";
  if (level >= 5) return "🛡 Apprentice";
  return "🌱 Beginner";
}
