import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

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

window.login = async function() {
  const emailEl    = document.getElementById("email");
  const passwordEl = document.getElementById("password");
  const email      = emailEl.value.trim();
  const password   = passwordEl.value;

  if (!email || !password) {
    return alert("Please fill in both fields");
  }

  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const uid = user.uid;

    async function checkRole(role) {
      const snap = await get(ref(db, `${role}s/${uid}`));
      console.log(`${role} snapshot:`, snap.exists(), snap.val());
      return snap.exists() ? snap.val() : null;
    }

    const studentData = await checkRole("student");
    if (studentData) {
      if (studentData.firstLogin === true) {
        window.location.replace(`../Change_Password/changeP.html?role=student&uid=${uid}`);
        return;
      }
      window.location.replace("../Students/Home_Page/Home_stu.html");
      return;
    }

    const teacherData = await checkRole("teacher");
    if (teacherData) {
      if (teacherData.firstLogin === true) {
        window.location.replace(`../Change_Password/changeP.html?role=teacher&uid=${uid}`);
        return;
      }
      window.location.replace("../Teachers/Home_Page/Home_teach.html");
      return;
    }

    const adminData = await checkRole("admin");
    if (adminData) {
      if (adminData.firstLogin === true) {
        window.location.replace(`../Change_Password/changeP.html?role=admin&uid=${uid}`);
        return;
      }
      window.location.replace("../Admin/Register/Register.html");
      return;
    }

    alert("User not found in database.");
  } catch (err) {
    console.error("Login error:", err);
    alert("Login failed: " + err.message);
  }
};

window.handleLogout = function() {
  signOut(auth)
    .then(() => {
      document.getElementById("welcomeMessage").style.display = "none";
      document.querySelector(".login-container").style.display = "block";
      alert("Logged out successfully");
    })
    .catch(err => {
      console.error("Logout error:", err);
    });
};
