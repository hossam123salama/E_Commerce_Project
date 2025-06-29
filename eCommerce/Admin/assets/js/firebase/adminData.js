import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup, // Import signInWithPopup
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiOz7EUZnjFYR90oeKf2xS2n-iwwEJX3k",
  authDomain: "e-commerce-5b125.firebaseapp.com",
  databaseURL: "https://e-commerce-5b125-default-rtdb.firebaseio.com/",
  projectId: "e-commerce-5b125",
  storageBucket: "e-commerce-5b125.appspot.com",
  messagingSenderId: "976262217130",
  appId: "1:976262217130:web:dca08cdc6333ef800cbfd3",
  measurementId: "G-8F0Z3M2K78",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const errorMessage = document.getElementById("errorMessage");
//const submitBtn = getElementById("submitBtn");
// Register admin with Email&Pass
if(errorMessage)
document  
  .getElementById("submitBtn")
  .addEventListener("click", function (event) {
    //event.preventDefault(); // Prevent form reload

    // Get user input values
    const name = document.getElementById("adminName").value.trim();
    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPass").value.trim();
    // Handle Confirm Pass validation
    const errorMessage = document.getElementById("errorMessage");
    let pass = document.getElementById("adminPass").value;
    let confirmPass = document.getElementById("adminConfirmPass").value;

    if (!name || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    if (pass !== confirmPass) {
      errorMessage.textContent = "Pasword Not same as Confirm Password!";
      return;
    }

    // Register user with Firebase Auth
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Store user data in Firebase Realtime Database
        storedUserData(name, email, user, "admin");
        alert("Admin registered successfully!");
      })
      .catch((error) => {
        console.error("Auth Error:", error);
        const errorMessage = getErrorMessage(error.code);
        alert(errorMessage);
      });
  });

// Function to store user data in Firebase Realtime Database
function storedUserData(name, email, user, role) {
  set(ref(database, "users/" + user.uid), {
    name: name,
    email: email,
    uid: user.uid,
    role: role,
  })
    .then(() => {
      alert("Data Stored Successfully!");
      const queryString = `?id=${encodeURIComponent(user.uid)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`;
        window.location.href = `/Admin/assets/views/dashboard.html?admin=${queryString}`;
    })
    .catch((error) => {
      console.error("Database Error:", error);
      alert("Error saving user data: " + error.message);
    });
}

// Function to translate Firebase error codes into user-friendly messages
function getErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-email":
      return "The email address is not valid. Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/email-already-in-use":
      return "This email is already in use. Try logging in or use a different email.";
    case "auth/weak-password":
      return "The password is too weak. Please choose a stronger password.";
    case "auth/operation-not-allowed":
      return "This operation is not allowed. Please contact support.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email but different sign-in credentials.";
    default:
      return "An error occurred. Please try again later.";
  }
}

document.addEventListener("DOMContentLoaded",function(){
  // Get the query string from the URL
const urlParams = new URLSearchParams(window.location.search);

// Extract all parameters
const adminData = {
  id: urlParams.get('id'),
  name: urlParams.get('name'),
  email: urlParams.get('email'),
};

console.log("adminData");
console.log(adminData);


// document.getElementById("adminName").innerText = adminData.name;
document.getElementById("adminName").innerText = localStorage.getItem('userName');
});


//Sign Out
document.getElementById("logoutBtn").addEventListener("click", (event) => {
  event.preventDefault();
  signOut(auth)
    .then(() => {
      confirm("Are you sure want to Log out?");
      localStorage.removeItem('userName');
      window.location.replace("/Admin/assets/views/login.html");
    })
    .catch((error) => {
      console.error("Logout error:", error);
      alert("Error logging out. Please try again.");
    });
});
