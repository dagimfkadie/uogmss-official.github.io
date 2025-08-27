import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  push,
  serverTimestamp,
  onValue
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGywXj_xCZqjZXup6axt2MqWLOxEUKDE8",
  authDomain: "database-tutorial-fc844.firebaseapp.com",
  databaseURL: "https://database-tutorial-fc844-default-rtdb.firebaseio.com",
  projectId: "database-tutorial-fc844",
  storageBucket: "database-tutorial-fc844.firebasestorage.app",
  messagingSenderId: "1015836041361",
  appId: "1:1015836041361:web:9f7e348fae5cd5557e9f30"
};
const app  = initializeApp(firebaseConfig);
const db   = getDatabase(app);
const auth = getAuth(app);


setPersistence(auth, browserLocalPersistence).catch(console.error);
document.getElementById('logoutBtn')?.addEventListener('click', logout);
document.getElementById('logoutBtnSidebar')?.addEventListener('click', logout);

function logout(e) {
  e.preventDefault();
  signOut(auth)
    .then(() => {
      alert("Logged out successfully!");
      window.location.replace("../../Login_Page/Login.html");
    })
    .catch((error) => {
      console.error("Logout error:", error);
      alert("Error logging out.");
    });
}

const teacherSelect = document.getElementById("teacherSelect");
const contactForm   = document.getElementById("contactForm");

async function loadTeachers() {
  const snap = await get(ref(db, "teachers"));
  if (!snap.exists()) return;
  Object.entries(snap.val()).forEach(([uid, data]) => {
    const opt = document.createElement("option");
    opt.value = uid;
    opt.textContent = `${data.name} (${data.subject})`;
    teacherSelect.append(opt);
  });
}
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "../../Login_Page/Login.html";
    return;
  }

  contactForm.addEventListener("submit", async e => {
    e.preventDefault();
    const teacherUID = teacherSelect.value;
    const text       = document.getElementById("messageText").value.trim();
    if (!teacherUID) return alert("Select a teacher.");

    const fromEmail = user.email;
    let fromName    = user.displayName;
    if (!fromName) {
      const prof = await get(ref(db, `students/${user.uid}`));
      fromName = prof.exists() ? prof.val().name : "Student";
    }

    const message = {
      fromUID:    user.uid,
      fromName,
      fromEmail,
      text,
      timestamp:  serverTimestamp()
    };

    await push(ref(db, `teachers/${teacherUID}/messages`), message);
    alert("Message sent!");
    contactForm.reset();
    teacherSelect.selectedIndex = 0;
  });
});

loadTeachers();
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  sidebar.classList.toggle('active');
  hamburger.classList.toggle('active');
  document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'auto';
}

document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');

  if (hamburger.contains(e.target)) {
    e.stopPropagation();
    toggleSidebar();  } else if (!sidebar.contains(e.target) && sidebar.classList.contains('active')) {
    toggleSidebar();
  }
});

let touchStartX = 0;
const SWIPE_THRESHOLD = 50;

document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
});

document.addEventListener('touchend', e => {
  const touchEndX = e.changedTouches[0].clientX;
  const deltaX = touchEndX - touchStartX;

  if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
    const sidebar = document.getElementById('sidebar');
    if (deltaX > 0 && !sidebar.classList.contains('active')) {
      toggleSidebar();
    } else if (deltaX < 0 && sidebar.classList.contains('active')) {
      toggleSidebar();
    }
  }
});
