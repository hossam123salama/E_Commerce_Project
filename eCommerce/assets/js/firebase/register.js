import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,  // Import signInWithPopup
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

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

// Register user with Email&Pass
document
  .getElementById("registerBtn").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form reload

    // Get user input values
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    if (!name || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    // Register user with Firebase Auth
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Store user data in Firebase Realtime Database
        storedUserData(name, email, user, "user");
        alert("User registered successfully!");
      })
      .catch((error) => {
        console.error("Auth Error:", error);
        const errorMessage = getErrorMessage(error.code);
        alert(errorMessage);
      });
  });

// Register user with Google Account
document
  .getElementById("registerWithGoogleBtn")
.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form reload
    // Register user with Google Account
    const provider = new GoogleAuthProvider();
    // Open the popup for Google login
    signInWithPopup(auth, provider)
      .then((result) => {
        // The signed-in user info
        const user = result.user;
        console.log("User signed up: ", user);
        // Store user data in Firebase Realtime Database
        storedUserData(user.displayName, user.email, user, "user");
        alert("User registered successfully!");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = getErrorMessage(errorCode);
        console.error("Error: ", errorCode, errorMessage);
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
      localStorage.setItem('userId', user.uid);
      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", email);
      alert("Data Stored Successfully!");
      window.location.replace(`/User/assets/views/index.html`);
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

