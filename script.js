// --- Core data (hard-coded for Day 1) ---

const RECENT_LIMIT = 5;   // how many recent problems to avoid
let recentProblems = [];

// Users represent solvers whose skill is inferred from outcomes
let users = [
  { id: "Alice", rating: 1200 },
  { id: "Bob", rating: 1200 }
];

// Problems also have ratings so difficulty is learned, not assumed
let problems = [
  {
    id: "A1",
    topic: "algebra",
    statement: "Solve for x: 2x + 5 = 13",
    answer: 4,
    rating: 1200
  },
  {
    id: "A2",
    topic: "algebra",
    statement: "Solve for x: x^2 = 49 and x > 0",
    answer: 7,
    rating: 1200
  },
  {
    id: "A3",
    topic: "algebra",
    statement: "Solve for x: 3x - 7 = 2x + 5",
    answer: 12,
    rating: 1200
  },
  {
    id: "G1",
    topic: "geometry",
    statement: "What is the area of a rectangle with sides 4 and 7?",
    answer: 28,
    rating: 1200
  },
  {
    id: "G2",
    topic: "geometry",
    statement: "A triangle has base 10 and height 6. What is its area?",
    answer: 30,
    rating: 1200
  },
  {
    id: "N1",
    topic: "number theory",
    statement: "What is the greatest common divisor of 24 and 36?",
    answer: 12,
    rating: 1200
  },
  {
    id: "C1",
    topic: "combinatorics",
    statement: "How many ways can you choose 2 items from 5?",
    answer: 10,
    rating: 1200
  },
  {
    id: "F1",
    topic: "functions",
    statement: "If f(x) = 2x + 3, what is f(4)?",
    answer: 11,
    rating: 1200
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

// --- Populate dropdowns ---
function populate() {
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
  const selected = problemSelect.value;

  problemSelect.innerHTML = "";
  problems.forEach((p, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${p.id} (rating: ${(p.rating)})`;
    problemSelect.appendChild(opt);
  });

  problemSelect.value = selected;
}

// --- Render ratings ---
function render() {
  checkBtn.disabled = false;
  const p = problems[problemSelect.value];
  document.getElementById("problemText").textContent = p.statement;
  renderProblemDropdown();
  renderUserDropdown();

  let text = "Users:\n";
  users.forEach(u => {
    text += `${u.id}: ${u.rating}\n`;
  });

  text += "\nProblems:\n";
  problems.forEach(p => {
    text += `${p.id}: ${p.rating}\n`;
  });

  output.textContent = text;
}

// --- Initial render ---
populate();
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
  const candidates = problems
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
