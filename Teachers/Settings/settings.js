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
  storageBucket: "database-tutorial-fc844.appspot.com",
  messagingSenderId: "1015836041361",
  appId: "1:1015836041361:web:9f7e348fae5cd5557e9f30"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();

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

document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
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
});

window.loginUser = async function () {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userId = user.uid;

    const [studentSnap, teacherSnap, adminSnap] = await Promise.all([
      get(ref(db, `students/${userId}`)),
      get(ref(db, `teachers/${userId}`)),
      get(ref(db, `admins/${userId}`))
    ]);

    let userData;
    if (studentSnap.exists()) {
      userData = studentSnap.val();
    } else if (teacherSnap.exists()) {
      userData = teacherSnap.val();
    } else if (adminSnap.exists()) {
      userData = adminSnap.val();
    }

    if (userData) {
      console.log("User Data:", userData);
      alert(`Welcome ${userData.name}`);
    } else {
      alert("User role data not found.");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed: " + error.message);
  }
};


document.getElementById('showPassword').addEventListener('change', function () {
  const newPassInput = document.getElementById('newPassword');
  const confirmPassInput = document.getElementById('confirmPassword');
  const oldPassInput = document.getElementById('oldPassword');
  const type = this.checked ? 'text' : 'password';
  newPassInput.type = type;
  confirmPassInput.type = type;
  oldPassInput.type = type;
});

/**

 * @param {string} userId 
 * @param {string} newPassword 
 * @param {string} userRole 
 
 */
export async function changePassword(userId, newPassword, userRole = 'student') {
  try {
    const user = auth.currentUser;
    if (user && user.uid === userId) {
      await updatePassword(user, newPassword);
      alert("Password updated successfully in Firebase Auth.");
    } else {
      await update(ref(db, `${userRole}s/${userId}`), { password: newPassword });
      alert("Password updated successfully in database.");
    }
  } catch (error) {
    console.error("Password update failed:", error);
    alert("Failed to update password: " + error.message);
  }
}


document.getElementById("changePasswordBtn").addEventListener("click", async () => {
  const oldPassword = document.getElementById("oldPassword").value.trim();  
  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (!newPassword || newPassword.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("New passwords do not match.");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("No authenticated user found. Please log in again.");
    return;
  }

  try {
    await changePassword(user.uid, newPassword, 'student'); 
  } catch (error) {
    console.error("Password change error:", error);
    alert("Error changing password: " + error.message);
  }
});


