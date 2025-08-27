import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  onValue
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
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

const messagesList = document.getElementById("messagesList");
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

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "../../Login_Page/Login.html";  
    return;
  }

  const teacherUID = user.uid;
  const teacherRef = ref(db, `teachers/${teacherUID}`);
  const teacherSnap = await get(teacherRef);
  if (!teacherSnap.exists()) {
    alert("You are not authorized to access this page.");
    window.location.href = "../../Login_Page/Login.html";  
    return;
  }

  const messagesRef = ref(db, `teachers/${teacherUID}/messages`);
  onValue(messagesRef, snapshot => {
    messagesList.innerHTML = "";  
    snapshot.forEach(childSnapshot => {
      const message = childSnapshot.val();
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message");
      messageDiv.innerHTML = `
        <strong>${message.fromName} (${message.fromEmail})</strong><br>
        <p>${message.text}</p>
        <hr>
      `;
      messagesList.appendChild(messageDiv);
    });
  });
});
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
