const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
const DATES = ["17", "18", "19", "20", "21", "22", "23"];

let state = {
  currentUser: null,

  users: [
    {
      id: 1,
      name: "Анна Коваленко",
      email: "anna@workify.ua",
      password: "anna123",
      role: "employee",
      initials: "АК",
    },
    {
      id: 2,
      name: "Каріна Мельник",
      email: "karina@workify.ua",
      password: "karina123",
      role: "employee",
      initials: "КМ",
    },
    {
      id: 3,
      name: "Менеджер",
      email: "admin@workify.ua",
      password: "admin123",
      role: "admin",
      initials: "МН",
    },
  ],

  shifts: [
    {
      id: 1,
      userId: 1,
      employeeName: "Анна Коваленко",
      date: "2026-02-17",
      start: "08:00",
      end: "16:00",
      type: "anna",
    },
    {
      id: 2,
      userId: 1,
      employeeName: "Анна Коваленко",
      date: "2026-02-19",
      start: "12:00",
      end: "20:00",
      type: "anna",
    },
    {
      id: 3,
      userId: 2,
      employeeName: "Каріна Мельник",
      date: "2026-02-18",
      start: "08:00",
      end: "16:00",
      type: "karina",
    },
    {
      id: 4,
      userId: 2,
      employeeName: "Каріна Мельник",
      date: "2026-02-19",
      start: "14:00",
      end: "22:00",
      type: "karina",
    },
  ],

  requests: [],
  shiftRequests: [],
};

function switchAuthTab(tab) {
  document.querySelectorAll(".tab-btn").forEach((btn, i) => {
    btn.classList.toggle(
      "active",
      (tab === "login" && i === 0) || (tab === "register" && i === 1),
    );
  });

  document.getElementById("login-form").style.display =
    tab === "login" ? "" : "none";

  document.getElementById("register-form").style.display =
    tab === "register" ? "" : "none";

  clearAuthError();
}

function showAuthError(msg) {
  const el = document.getElementById("auth-error");
  el.textContent = msg;
  el.style.display = "block";
}

function clearAuthError() {
  document.getElementById("auth-error").style.display = "none";
}

function handleLogin(e) {
  if (e) e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  const user = state.users.find(
    (u) => u.email === email && u.password === password,
  );

  if (!user) {
    showAuthError("Невірний email або пароль");
    return;
  }

  loginAs(user);
}

function handleRegister(e) {
  if (e) e.preventDefault();

  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const role = document.getElementById("reg-role").value;
  const password = document.getElementById("reg-password").value;

  if (!name || !email || !password) {
    showAuthError("Заповніть усі поля");
    return;
  }

  if (state.users.find((u) => u.email === email)) {
    showAuthError("Такий email вже існує");
    return;
  }

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const newUser = {
    id: state.users.length + 1,
    name,
    email,
    password,
    role,
    initials,
  };

  state.users.push(newUser);
  loginAs(newUser);
}

function loginAs(user) {
  state.currentUser = user;

  document.getElementById("auth-screen").style.display = "none";
  document.getElementById("app").style.display = "block";

  updateSidebar();
  populateCheckEmployee();
  populateAddShiftEmployee();
  renderDashboard();
  showPage("dashboard");
}

function handleLogout() {
  state.currentUser = null;

  document.getElementById("auth-screen").style.display = "flex";
  document.getElementById("app").style.display = "none";

  document.getElementById("login-email").value = "";
  document.getElementById("login-password").value = "";
}

function showPage(pageId) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));

  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));

  document.getElementById("page-" + pageId).classList.add("active");

  const navMap = {
    dashboard: 0,
    schedule: 1,
    "my-shifts": 2,
    conflicts: 3,
    requests: 4,
    "add-shift": 5,
  };

  const items = document.querySelectorAll(".nav-item");

  if (navMap[pageId] !== undefined) {
    items[navMap[pageId]].classList.add("active");
  }

  if (pageId === "schedule") renderSchedule();
  if (pageId === "my-shifts") renderMyShifts();
  if (pageId === "conflicts") renderConflicts();
  if (pageId === "requests") renderRequests();
  if (pageId === "add-shift") renderAddShiftPage();
}

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function overlaps(s1, e1, s2, e2) {
  return (
    timeToMinutes(s1) < timeToMinutes(e2) &&
    timeToMinutes(s2) < timeToMinutes(e1)
  );
}

function showToast(msg, type = "success") {
  const t = document.getElementById("toast");

  t.textContent = msg;
  t.className = `toast ${type} show`;

  setTimeout(() => {
    t.classList.remove("show");
  }, 3000);
}

document.getElementById("check-date").valueAsDate = new Date("2026-02-17");

// === TAB SWITCH ===
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    loginForm.style.display = btn.dataset.tab === "login" ? "block" : "none";
    registerForm.style.display =
      btn.dataset.tab === "register" ? "block" : "none";
  });
});

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// === AUTH ===
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("auth-screen").style.display = "none";
  document.getElementById("app").style.display = "block";
});

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("auth-screen").style.display = "none";
  document.getElementById("app").style.display = "block";
});

// === LOGOUT ===
document.getElementById("logout-btn").addEventListener("click", () => {
  document.getElementById("auth-screen").style.display = "flex";
  document.getElementById("app").style.display = "none";
});

// === NAV ===
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".page")
      .forEach((p) => p.classList.remove("active"));
    document.getElementById("page-" + btn.dataset.page).classList.add("active");
  });
});

// === BURGER ===
const burger = document.getElementById("burger-btn");
const menu = document.getElementById("mobile-menu");

burger.addEventListener("click", () => {
  menu.classList.add("open");
  document.body.classList.add("no-scroll");
});

document.getElementById("close-menu").addEventListener("click", () => {
  menu.classList.remove("open");
  document.body.classList.remove("no-scroll");
});

document.querySelectorAll(".mobile-link").forEach((link) => {
  link.addEventListener("click", () => {
    document
      .querySelectorAll(".page")
      .forEach((p) => p.classList.remove("active"));
    document
      .getElementById("page-" + link.dataset.page)
      .classList.add("active");

    menu.classList.remove("open");
    document.body.classList.remove("no-scroll");
  });
});

// === BUTTON UX ===
document.querySelectorAll(".btn-primary").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.disabled = true;
    const text = btn.textContent;

    btn.textContent = "Обробка...";

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = text;
    }, 1500);
  });
});
