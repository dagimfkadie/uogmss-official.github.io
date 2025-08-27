import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
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


setPersistence(auth, browserLocalPersistence)
  .catch(err => console.error("Auth persistence error:", err));

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
document.addEventListener("DOMContentLoaded", () => {
  const welcomeEl = document.getElementById("welcomeMessage");
  const tableRows = Array.from(document.querySelectorAll("table tbody tr"));

  function findRowBySubject(subject) {
    return tableRows.find(row =>
      row.cells[0].textContent.trim().toLowerCase() === 
      subject.trim().toLowerCase()
    );
  }

  function fillRow(row, data) {
    row.cells[1].textContent = data.march?.total   ?? "";
    row.cells[2].textContent = data.april?.total   ?? "";
    row.cells[3].textContent = data.may?.total     ?? "";
    row.cells[4].textContent = data.score40        ?? "";
    row.cells[5].textContent = data.june           ?? "";
    row.cells[6].textContent = data.score100       ?? "";
  }

  onAuthStateChanged(auth, user => {

    if (!user) {
      console.log("No user, redirecting to login");
      history.replaceState(null, "", "../../Login_Page/Login.html");
      window.location.href = "../../Login_Page/Login.html";

      return;
    }
    const uid = user.uid;
    console.log("Logged in as:", uid);

    get(ref(db, `students/${uid}`))
      .then(snap => {
        if (snap.exists()) {
          welcomeEl.textContent = snap.val().name;
        } else {
          console.warn("No student profile found at students/" + uid);
          welcomeEl.textContent = "Student";
        }
      })
      .catch(err => console.error("Error loading student profile:", err));

    const teachersRef = ref(db, "teachers");
    onValue(teachersRef, snapshot => {
      console.log("Teachers snapshot:", snapshot.exists(), snapshot.val());

      tableRows.forEach(row => {
        for (let c = 1; c <= 6; c++) {
          row.cells[c].textContent = "";
        }
      });

      const teachers = snapshot.val() || {};
      for (const [teacherUID, teacherData] of Object.entries(teachers)) {
        const studs = teacherData.students || {};
        if (studs[uid]) {
          console.log(`Found data under teacher ${teacherUID}`, studs[uid]);
          if (typeof teacherData.subject === 'string') {
            const row = findRowBySubject(teacherData.subject);
            if (row) {
              fillRow(row, studs[uid]);
            } else {
              console.warn("No table row for subject:", teacherData.subject);
            }
          } else {
            console.warn(`Missing or invalid subject for teacher ${teacherUID}`);
          }

        }
      }
    }, err => {
      console.error("Realtime listener error:", err);
    });
  });
});
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const hamburger = doqcument.getElementById('hamburger');
  sidebar.classList.toggle('active');
  hamburger.classList.toggle('active');
  document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'auto';
}

document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');

  if (hamburger.contains(e.target)) {
    e.stopPropagation();
    toggleSidebar();
  } else if (!sidebar.contains(e.target) && sidebar.classList.contains('active')) {
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


