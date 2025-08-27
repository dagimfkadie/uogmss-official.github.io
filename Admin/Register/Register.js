import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  onValue
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
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


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);


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


function clearInputs(...inputs) {
  inputs.forEach(input => input.value = "");
}
window.addTeacher = async function () {
  const mode = document.getElementById("teacherMode").value;
  const identifierType = document.getElementById("teacherIdentifierType").value;
  const firstName = document.getElementById("teacherFirstName").value.trim();
  const lastName = document.getElementById("teacherLastName").value.trim();
  const subjectInput = document.getElementById("subject").value.trim();

  let identifier = "", password = "";

  if (!firstName || !lastName || !subjectInput) {
    alert("Please fill in all required fields.");
    return;
  }

  const fullName = `${firstName} ${lastName}`;

  if (mode === "automatic") {
    password = "changeme";
    if (identifierType === "username") {
      identifier = `${firstName}10${lastName}`;
    } else {
      identifier = `${firstName}${lastName}@uogmss.com`;
    }
  } else {
    identifier = document.getElementById("teacherIdentifier").value.trim();
    password = document.getElementById("teacherPassword").value.trim();

    if (!identifier || !password) {
      alert("Please fill in all manual fields.");
      return;
    }
  }

  try {
    let teacherId;

    if (identifierType === "email" || mode === "manual") {
      const { user } = await createUserWithEmailAndPassword(auth, identifier, password);
      teacherId = user.uid;

      const teacherData = {
        name: fullName,
        email: identifier,
        subject: subjectInput,
        firstLogin: true,
        role: "teacher"
      };

      await set(ref(db, `teachers/${teacherId}`), teacherData);
    } else {
      teacherId = identifier; 

      const teacherData = {
  name: fullName,
  email: identifier,
  subject: subjectInput,
  role: "teacher",
  firstLogin: true
};

      await set(ref(db, `teachers/${teacherId}`), teacherData); 
    }

   
    const studentsSnapshot = await get(ref(db, 'students'));
    if (studentsSnapshot.exists()) {
      const students = studentsSnapshot.val();
      const updates = {};

      for (const studentId in students) {
        updates[`teachers/${teacherId}/students/${studentId}`] = students[studentId];
      }

      await update(ref(db), updates);
    }

    alert("Teacher registered successfully.");
  } catch (error) {
    console.error("Teacher registration failed:", error);
    alert("Failed to add teacher: " + error.message);
  }
};
window.addStudent = async function () {
  const mode = document.getElementById("studentMode").value;
  const identifierType = document.getElementById("identifierType").value;
  const firstName = document.getElementById("studentFirstName").value.trim();
  const lastName = document.getElementById("studentLastName").value.trim();

  let email = "", password = "", identifier = "";

  if (!firstName || !lastName) {
    alert("First name and last name are required.");
    return;
  }

  if (mode === "automatic") {
    password = "changeme";  


    if (identifierType === "username") {
      identifier = `${firstName}10${lastName}`;  
    } else if (identifierType === "email") {
      identifier = `${firstName}${lastName}@uogmss.com`; 
    }
  } else {
    identifier = document.getElementById("studentIdentifier").value.trim();
    password = document.getElementById("studentPassword").value.trim();

    if (!identifier || !password) {
      alert("Please fill in all manual fields.");
      return;
    }
  }

  const fullName = `${firstName} ${lastName}`;

  try {
    let studentId;
    const studentData = {
  name: fullName,
  email: identifier,
  march: { exam: 0, assessment: 0, total: 0 },
  april: { exam: 0, assessment: 0, total: 0 },
  may: { exam: 0, assessment: 0, total: 0 },
  score40: 0,
  june: 0,
  score100: 0,
  firstLogin: true
};

    if (identifierType === "email" || mode === "manual") {
      const { user } = await createUserWithEmailAndPassword(auth, identifier, password);
      studentId = user.uid;

      studentData.email = identifier;  

      await set(ref(db, `students/${studentId}`), studentData);
    } else {
      studentId = identifier; 

      studentData.username = identifier;  
      studentData.password = password;    
      await set(ref(db, `students/${studentId}`), studentData); 
    }

    const teachersSnapshot = await get(ref(db, 'teachers'));
    if (teachersSnapshot.exists()) {
      const teachers = teachersSnapshot.val();
      const updates = {};

      for (const teacherId in teachers) {
        updates[`teachers/${teacherId}/students/${studentId}`] = studentData;
      }

      await update(ref(db), updates);
    }

    alert("Student registered successfully.");
  } catch (error) {
    console.error("Student registration failed:", error);
    alert("Failed to add student: " + error.message);
  }
};


window.addAdmin = async function () {
  const mode = document.getElementById("adminMode").value;
  const identifierType = document.getElementById("adminIdentifierType").value;
  const firstName = document.getElementById("adminFirstName").value.trim();
  const lastName = document.getElementById("adminLastName").value.trim();

  let email = "", password = "", identifier = "";

  if (!firstName || !lastName) {
    alert("First name and last name are required.");
    return;
  }

  const fullName = `${firstName} ${lastName}`;

  if (mode === "automatic") {
    password = "changeme";  

    if (identifierType === "username") {
      identifier = `${firstName}10${lastName}`;  
    } else if (identifierType === "email") {
      identifier = `${firstName}${lastName}@admin.com`;  
    }
  } else {
    identifier = document.getElementById("adminIdentifier").value.trim();
    password = document.getElementById("adminPassword").value.trim();

    if (!identifier || !password) {
      alert("Please fill in all manual fields.");
      return;
    }
  }

  try {
    let adminId;

    if (identifierType === "email" || mode === "manual") {
      const { user } = await createUserWithEmailAndPassword(auth, identifier, password);
      adminId = user.uid;

      const adminData = {
        name: fullName,
        email: identifier,
        firstLogin: true ,
        role: "admin"
      };

      await set(ref(db, `admins/${adminId}`), adminData);
    } else {
      adminId = identifier; 

      const adminData = {
        name: fullName,
        username: identifier,
        password: password,
        firstLogin: true ,
        role: "admin"
      };

      await set(ref(db, `admins/${adminId}`), adminData); 
    }

    alert("Admin registered successfully.");
  } catch (error) {
    console.error("Admin registration failed:", error);
    alert("Failed to add admin: " + error.message);
  }
};

window.processBulkUsers = function () {
  const fileInput = document.getElementById("csvFileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a CSV file.");
    return;
  }

  Papa.parse(file, {
    complete: async (results) => {
      const data = results.data;
      for (const row of data) {
  const [firstName, lastName, role, emailOrUsername, subject] = row;

  const normalizedRole = (role && typeof role === 'string') ? role.toLowerCase() : '';

  if (normalizedRole === "student") {
    await addBulkStudent(firstName, lastName, emailOrUsername);
  } else if (normalizedRole === "teacher") {
    await addBulkTeacher(firstName, lastName, emailOrUsername, subject);
  } else if (normalizedRole === "admin") {
    await addBulkAdmin(firstName, lastName, emailOrUsername);
  }
}

      alert("Bulk users added successfully.");
    },
    header: false,
  }
);
error: (error) => {
    console.error("CSV parsing error:", error);
    alert("Failed to parse CSV file.");
  }
};

async function addBulkStudent(firstName, lastName, identifierType) {
  const email = `${firstName}${lastName}@uogmss.com`; 
  const password = "changeme";  

  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const studentId = user.uid;

    const studentData = {
  name: `${firstName} ${lastName}`,
  email: email,
  march: { exam: 0, assessment: 0, total: 0 },
  april: { exam: 0, assessment: 0, total: 0 },
  may: { exam: 0, assessment: 0, total: 0 },
  score40: 0,
  june: 0,
  score100: 0,
  firstLogin: true
};


    await set(ref(db, `students/${studentId}`), studentData);

  
    const teachersSnapshot = await get(ref(db, 'teachers'));
    if (teachersSnapshot.exists()) {
      const teachers = teachersSnapshot.val();
      const updates = {};

      for (const teacherId in teachers) {
        updates[`teachers/${teacherId}/students/${studentId}`] = studentData;
      }

      await update(ref(db), updates);
    }
  } catch (error) {
    console.error("Failed to add student:", error);
  }
}

async function addBulkTeacher(firstName, lastName, identifierType, subject = "Unknown") {
  const email = `${firstName}${lastName}@uogmss.com`;
  const password = "changeme";

  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const teacherId = user.uid;

    const teacherData = {
      name: `${firstName} ${lastName}`,
      email: email,
      subject: subject,
      role: "teacher",
      firstLogin: true
    };

    await set(ref(db, `teachers/${teacherId}`), teacherData);

   
    const studentsSnapshot = await get(ref(db, 'students'));
    if (studentsSnapshot.exists()) {
      const students = studentsSnapshot.val();
      const updates = {};

      for (const studentId in students) {
        updates[`teachers/${teacherId}/students/${studentId}`] = students[studentId];
      }

      await update(ref(db), updates);
    }
  } catch (error) {
    console.error("Failed to add teacher:", error);
  }
}


async function addBulkAdmin(firstName, lastName, identifierType) {
  const email = `${firstName}${lastName}@admin.com`;  
  const password = "changeme";  

  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const adminId = user.uid;

    const adminData = {
      name: `${firstName} ${lastName}`,
      email: email,
      role: "admin",
      firstLogin: true 
    };

    await set(ref(db, `admins/${adminId}`), adminData);  
  } catch (error) {
    console.error("Failed to add admin:", error);
  }
}
function toggleStudentInputs() {
  const mode = document.getElementById("studentMode").value;
  const idInput = document.getElementById("studentIdentifier");
  const pwInput = document.getElementById("studentPassword");

  if (mode === "manual") {
    idInput.style.display = "inline";
    pwInput.style.display = "inline";
  } else {
    idInput.style.display = "inline";
    pwInput.style.display = "none"; 
  }
}

function toggleTeacherInputs() {
  const mode = document.getElementById("teacherMode").value;
  const idInput = document.getElementById("teacherIdentifier");
  const pwInput = document.getElementById("teacherPassword");


  if (mode === "manual") {
    idInput.style.display = "inline";
    pwInput.style.display = "inline";
  } else {
    idInput.style.display = "inline";
    pwInput.style.display = "none"; 
  }
}

function toggleAdminInputs() {
  const mode = document.getElementById("adminMode").value;
  const idInput = document.getElementById("adminIdentifier");
  const pwInput = document.getElementById("adminPassword");


  if (mode === "manual") {
    idInput.style.display = "inline";
    pwInput.style.display = "inline";
  } else {
    idInput.style.display = "inline";
    pwInput.style.display = "none"; 
  }
}


toggleStudentInputs();
toggleTeacherInputs();
toggleAdminInputs();
