const RECENT_LIMIT = 5;  // how many recent problems to avoid
let recentProblems = [];

const init_problem = 1400;
const init_seed = 1400;
const init_user = 1200;
// Users represent solvers whose skill is inferred from outcomes
let users = [
  { id: "Alice", rating: init_user},
  { id: "Bob", rating: init_user}
];

// Problems also have ratings so difficulty is learned, not assumed
let problems = [];

fetch("problems.json")
  .then(res => res.json())
  .then(data => {
    problems = data;
    initProblems(); // call whatever setup you already have
  })
  .catch(err => console.error("Failed to load problems:", err));

function initProblems() {
  populateProblemDropdown();
  selectRandomProblem();
}


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
    opt.value = i;
    opt.textContent = `${u.id} (rating: ${(u.rating)})`;
    userSelect.appendChild(opt);
  });

  userSelect.value = selected;
}

function renderProblemDropdown() {
  const selectedId = problems[problemSelect.value]?.id;
  const filtered = getFilteredProblems();

  problemSelect.innerHTML = "";
  filtered.forEach(p => {
    const i = problems.indexOf(p);
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${p.id} (${p.topic}, rating: ${Math.round(p.rating)})`;
    problemSelect.appendChild(opt);
  });

  if (selectedId) {
    const newIndex = problems.findIndex(p => p.id === selectedId);
    if (newIndex !== -1) problemSelect.value = newIndex;
  }
}


// --- Render ratings ---
function render() {
  checkBtn.disabled = false;
  const p = problems[problemSelect.value];
  document.getElementById("problemText").textContent = p.statement;
  renderProblemDropdown();
  renderUserDropdown();
  renderTopicDropdown();

  let text = "Users:\n";
  users.forEach(u => {
    text += `${u.id}: ${u.rating}\n`;
  });

  output.textContent = text;
}

// --- Initial render ---
fill();
render();

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
}

randomBtn.onclick = () => {
  // get list of available indices not recently seen
  const candidates = getFilteredProblems()
    .map((_, i) => i)
    .filter(i => !recentProblems.includes(i));

  // if all problems are recent, allow all again
  const pool = candidates.length > 0
    ? candidates
    : problems.map((_, i) => i);

  const randomIndex = pool[Math.floor(Math.random() * pool.length)];

  // update recent history
  recentProblems.push(randomIndex);
  if (recentProblems.length > RECENT_LIMIT) {
    recentProblems.shift();
  }

  problemSelect.value = randomIndex;
  render();
};

checkBtn.onclick = () => {
  const p = problems[problemSelect.value];
  const u = users[userSelect.value];
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
