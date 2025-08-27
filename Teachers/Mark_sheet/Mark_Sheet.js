import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getDatabase, ref, set, push, get, child, update } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import {  getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
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
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const resultsTable = document.querySelector("#resultsTable tbody");
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

export async function loadTableData() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const teacherUID = user.uid;
      const studentsRef = ref(db, 'teachers/' + teacherUID + '/students');
      try {
        const snapshot = await get(studentsRef);
        resultsTable.innerHTML = ""; 

        if (snapshot.exists()) {
          const students = snapshot.val();
          for (let id in students) {
            addRowToTable(id, students[id]);
          }
        } else {
          console.log("No students found for this teacher.");
        }
      } catch (error) {
        console.error("Error fetching student data: ", error);
      }
    } else {
      console.log("No user logged in");
    }
  });
}


function addRowToTable(id, data) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${data.name}</td>
    ${generateInputs(data, id)}
    <td>
      <button onclick="editRow(this)">Edit</button>
      <button style="display:none" onclick="saveRow(this, '${id}')">Save</button>
      <button style="display:none" onclick="cancelEdit(this)">Cancel</button>
    </td>
  `;
  resultsTable.appendChild(row);
}

function generateInputs(data, id) {
  const scores = [
    data.march.exam, data.march.assessment, data.march.total,
    data.april.exam, data.april.assessment, data.april.total,
    data.may.exam, data.may.assessment, data.may.total,
    data.score40, data.june, data.score100
  ];
  
  return scores.map((score, index) => `
    <td><input type="number" value="${score}" min="0" max="100" disabled data-field="score${index}" data-id="${id}"></td>
  `).join("");
}


window.editRow = function(button) {
  const row = button.closest("tr");
  row.querySelectorAll("input").forEach(input => input.removeAttribute("disabled"));
  toggleButtons(row, true);
};

window.saveRow = async function(button, id) {
  const row = button.closest("tr");
  const inputs = row.querySelectorAll("input");
  const newScores = Array.from(inputs).map(input => Number(input.value));

  const user = auth.currentUser;
  const studentRef = ref(db, 'teachers/' + user.uid + '/students/' + id);
  const updatedData = {
    march: { exam: newScores[0], assessment: newScores[1], total: newScores[2] },
    april: { exam: newScores[3], assessment: newScores[4], total: newScores[5] },
    may: { exam: newScores[6], assessment: newScores[7], total: newScores[8] },
    score40: newScores[9],
    june: newScores[10],
    score100: newScores[11]
  };
  await update(studentRef, updatedData);

  row.querySelectorAll("input").forEach(input => input.setAttribute("disabled", "true"));
  toggleButtons(row, false);
};


window.cancelEdit = function(button) {
  const row = button.closest("tr");
  row.querySelectorAll("input").forEach(input => input.setAttribute("disabled", "true"));
  toggleButtons(row, false);
};

function toggleButtons(row, isEditing) {
  row.querySelector("button:nth-child(1)").style.display = isEditing ? "none" : "inline";
  row.querySelector("button:nth-child(2)").style.display = isEditing ? "inline" : "none";
  row.querySelector("button:nth-child(3)").style.display = isEditing ? "inline" : "none";
}


window.filterTable = function() {
  const searchValue = document.querySelector("#searchBar").value.toLowerCase();
  document.querySelectorAll("#resultsTable tbody tr").forEach(row => {
    row.style.display = row.cells[0].textContent.toLowerCase().includes(searchValue) ? "" : "none";
  });
};


document.addEventListener("DOMContentLoaded", loadTableData);
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

