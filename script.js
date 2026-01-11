const RECENT_LIMIT = 5;  // how many recent problems to avoid
let recentProblems = [];

const init_problem = 1400;
const init_seed = 1400;
const init_user = 1200;

function saveState() {
  localStorage.setItem("mathforces_users", JSON.stringify(users));
  localStorage.setItem("mathforces_problems", JSON.stringify(problems));
}

function loadUsers() {
  const saved = localStorage.getItem("mathforces_users");
  if (saved) {
    users = JSON.parse(saved);
    return true;
  }
  return false;
}

function loadProblemsFromStorage() {
  const saved = localStorage.getItem("mathforces_problems");
  if (saved) {
    problems = JSON.parse(saved);
    return true;
  }
  return false;
}

// Users represent solvers whose skill is inferred from outcomes
let users = [
  { id: "Alice", rating: init_user},
  { id: "Bob", rating: init_user}
];

loadUsers(); // if nothing saved yet, defaults stay


// Problems also have ratings so difficulty is learned, not assumed
let problems = [
  {
    id: "ALG-001",
    topic: "algebra",
    statement: "Solve for x: 2x + 5 = 13",
    type : "numeric",
    difficulty_seed : init_seed, 
    answer: 4,
    rating: init_problem
  },
  {
    id: "ALG-002",
    topic: "algebra",
    statement: "Solve for x: x^2 = 49 and x > 0",
    type : "numeric",
    difficulty_seed : init_seed, 
    answer: 7,
    rating: init_problem
  },
  {
    id: "ALG-003",
    topic: "algebra",
    statement: "Solve for x: 3x - 7 = 2x + 5",
    type : "numeric",
    difficulty_seed : init_seed, 
    answer: 12,
    rating: init_problem
  },
  {
    id: "GEO-001",
    topic: "geometry",
    statement: "What is the area of a rectangle with sides 4 and 7?",
    type : "numeric",
    difficulty_seed : init_seed, 
    answer: 28,
    rating: init_problem
  },
  {
    id: "GEO-002",
    topic: "geometry",
    statement: "A triangle has base 10 and height 6. What is its area?",
    type : "numeric",
    difficulty_seed : init_seed, 
    answer: 30,
    rating: init_problem
  },
  {
    id: "NUM-001",
    topic: "number theory",
    statement: "What is the greatest common divisor of 24 and 36?",
    type : "numeric",
    difficulty_seed : init_seed, 
    answer: 12,
    rating: init_problem
  },
  {
    id: "NUM-002",
    topic: "number theory",
    statement: "What is the largest multiple of 30 which is less than 520?",
    type : "numeric",
    difficulty_seed : init_seed, 
    answer: 510,
    rating: init_problem
  },
  {
    id: "NUM-003",
    topic: "number theory",
    statement: "When the set of natural numbers is listed in ascending order, what is the smallest prime number that occurs after a sequence of five consecutive positive integers all of which are nonprime?",
    type : "numeric",
    difficulty_seed : init_seed, 
    answer: 29,
    rating: init_problem
  },
  {
    id: "NUM-004",
    topic: "number theory",
    statement: "A composite number is a number that has two or more prime factors. The number $87$ can be expressed as the sum of two composite numbers in many ways. What is the minimum positive difference between two such numbers?", 
    type : "numeric",
    difficulty_seed : init_seed, 
    answer: 3,
    rating: init_problem
  },
  {
    id: "COM-001",
    topic: "combinatorics",
    statement: "How many ways can you choose 2 items from 5?",
    type : "numeric",
    answer: 10,
    rating: init_problem
  },
  {
    id: "FUN-001",
    topic: "functions",
    statement: "If f(x) = 2x + 3, what is f(4)?",
    type : "numeric",
    answer: 11,
    rating: init_problem
  }
];


// --- Grab DOM elements ---
const userSelect = document.getElementById("userSelect");
const problemSelect = document.getElementById("problemSelect");
const output = document.getElementById("output");
const randomBtn = document.getElementById("randomProblem");
const answerInput = document.getElementById("answerInput");
const checkBtn = document.getElementById("checkAnswer");
const feedback = document.getElementById("feedback");
const topicSelect = document.getElementById("topicSelect");


// --- fill dropdowns ---
function loadProblems() {
  return fetch("problems.json")
    .then(res => {
      if (!res.ok) {
        throw new Error("HTTP error " + res.status);
      }
      return res.json();
    });
}

function fill() {
  userSelect.innerHTML = "";
  problemSelect.innerHTML = "";

  users.forEach((u, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.text = `${u.id} (${u.rating.toFixed(0)})`;
    userSelect.add(opt);
  });

  problems.forEach((p, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.text = `${p.id} (${p.rating.toFixed(0)})`;
    problemSelect.add(opt);
  });
}

function renderTopicDropdown() {
  const topics = ["All", ...new Set(problems.map(p => p.topic))];
  const selected = topicSelect.value || "All";

  topicSelect.innerHTML = "";
  topics.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    topicSelect.appendChild(opt);
  });

  topicSelect.value = selected;
}

function getFilteredProblems() {
  if (topicSelect.value === "All") return problems;
  return problems.filter(p => p.topic === topicSelect.value);
}

function renderUserDropdown() {
  const selected = userSelect.value;

  userSelect.innerHTML = "";
  users.forEach((u, i) => {
    const opt = document.createElement("option");
    opt.value = u.id;
    opt.textContent = `${u.id} (rating: ${(u.rating)})`;
    userSelect.appendChild(opt);
  });

  userSelect.value = selected;
}

function renderProblemDropdown() {
  const selectedId = problemSelect.value;
  const filtered = getFilteredProblems();

  problemSelect.innerHTML = "";

  filtered.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id; // ✅ ALWAYS ID
    opt.textContent = `${p.id} (${p.topic}, rating: ${Math.round(p.rating)})`;
    problemSelect.appendChild(opt);
  });

  // restore selection if possible
  if (filtered.some(p => p.id === selectedId)) {
    problemSelect.value = selectedId;
  } else if (filtered.length > 0) {
    problemSelect.value = filtered[0].id;
  }
}



// --- Render ratings ---
function render() {
  checkBtn.disabled = false;

  renderProblemDropdown();
  renderUserDropdown();
  renderTopicDropdown();

  const selectedId = problemSelect.value;
  if (!selectedId) return;

  const p = problems.find(p => p.id === selectedId);
  if (!p) return;

  document.getElementById("problemText").textContent = p.statement;
}




// --- Initial render ---
fill();
problemSelect.value = problems[0]?.id;
render();
loadProblems()
  .then(data => {
    problems = data;
    console.log("Problems loaded:", problems.length);
    // no render, no fill, nothing else
  })
  .catch(err => console.error(err));


// --- Elo parameters ---
const K = 40;

// Expected score for A vs B
function expectedScore(rA, rB) {
  return 1 / (1 + Math.pow(10, (rB - rA) / 400));
}

// Update ratings after an attempt
// Symmetric update: users gain rating by solving,
// problems gain rating by "defeating" users
function updateRatings(user, problem, userSolved) {
  const Eu = expectedScore(user.rating, problem.rating);
  const Ep = expectedScore(problem.rating, user.rating);

  const Su = userSolved ? 1 : 0;
  const Sp = userSolved ? 0 : 1;

  user.rating += K * (Su - Eu);
  user.rating = Math.floor(user.rating);
  problem.rating += K * (Sp - Ep);
  problem.rating = Math.ceil(problem.rating);
  saveState();
}

randomBtn.onclick = () => {
  const filtered = getFilteredProblems()
    .filter(p => !recentProblems.includes(p.id));

  const pool = filtered.length > 0
    ? filtered
    : getFilteredProblems();

  const chosen = pool[Math.floor(Math.random() * pool.length)];

  recentProblems.push(chosen.id);
  if (recentProblems.length > RECENT_LIMIT) {
    recentProblems.shift();
  }

  problemSelect.value = chosen.id;
  render();
};



checkBtn.onclick = () => {
  const p = problems.find(p => p.id === problemSelect.value);
  const u = users.find(u => u.id === userSelect.value);
  const userAnswer = Number(answerInput.value);

  if (Number.isNaN(userAnswer)) {
    feedback.textContent = "Please enter a number.";
    return;
  }

  if (userAnswer === p.answer) {
    feedback.textContent = "Correct!";
    updateRatings(u, p, true);
  } else {
    feedback.textContent = "Incorrect.";
    updateRatings(u, p, false);
    recentProblems.splice(1, recentProblems.size() - 1);
  }
  checkBtn.disabled = true;
  answerInput.value = "";
  render();
  randomBtn.onclick();
};


problemSelect.onchange = () => {
  render();
};

userSelect.onchange = () => {
  render();
};

topicSelect.onchange = () => {
  render();
};
