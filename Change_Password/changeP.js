import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getAuth,
  updatePassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  update
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGywXj_xCZqjZXup6axt2MqWLOxEUKDE8",
  authDomain: "database-tutorial-fc844.firebaseapp.com",
  databaseURL:
    "https://database-tutorial-fc844-default-rtdb.firebaseio.com",
  projectId: "database-tutorial-fc844",
  storageBucket: "database-tutorial-fc844.firebasestorage.app",
  messagingSenderId: "1015836041361",
  appId: "1:1015836041361:web:9f7e348fae5cd5557e9f30"
};
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getDatabase(app);

const params   = new URLSearchParams(window.location.search);
const uid      = params.get("uid");
const role     = params.get("role");

// Support for admin role added here
const rolePath = role === "teacher"
  ? "teachers"
  : role === "admin"
    ? "admins"
    : "students";

let currentUser = null;
onAuthStateChanged(auth, user => {
  if (!user) {
    return window.location.replace("../index.html");
  }
  currentUser = user;
});

const form      = document.getElementById("changeForm");
const newPwEl   = document.getElementById("newPassword");
const confirmEl = document.getElementById("confirmPassword");
const showCb    = document.getElementById("showPassword");  
const submitBtn = document.getElementById("submitBtn");

if (showCb) {
  showCb.addEventListener("change", () => {
    const type = showCb.checked ? "text" : "password";
    newPwEl.type   = type;
    confirmEl.type = type;
  });
}

function validateForm() {
  const np = newPwEl.value;
  const cp = confirmEl.value;
  const ok =
    np.length >= 6 &&
    np.length <= 12 &&
    np === cp;
  submitBtn.disabled = !ok;
}
[newPwEl, confirmEl].forEach(el => el.addEventListener("input", validateForm));
validateForm();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newPw     = newPwEl.value.trim();
  const confirmPw = confirmEl.value.trim();

  if (newPw.length < 6 || newPw.length > 12) {
    return alert("Password must be between 6 and 12 characters.");
  }
  if (newPw !== confirmPw) {
    return alert("Passwords do not match.");
  }
  if (!currentUser) {
    return alert("Still initializing… please wait a moment and try again.");
  }

  try {
    await updatePassword(currentUser, newPw);

    await update(ref(db, `${rolePath}/${uid}`), { firstLogin: false });

    alert("Password changed successfully!");

    const home = role === "teacher"
      ?"../Teachers/Home_Page/Home_teach.html"
      : role === "admin"
        ? "../Admin/Register/Register.html"
        :"../Students/Home_Page/Home_stu.html";
    window.location.replace(home);

  } catch (err) {
    console.error("Error changing password:", err);
    if (err.code === "auth/requires-recent-login") {
      alert("For security, please log in again and retry.");
      auth.signOut().then(() => window.location.replace("../homepage/index.html"));
    } else {
      alert("Failed to change password: " + err.message);
    }
  }
});
