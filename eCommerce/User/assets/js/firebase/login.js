import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { get, child } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
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

// Login user with Email & Password
document
  .getElementById("loginBtn")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form reload

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    


    if (!email || !password) {
      alert("Please fill all fields.");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Logged in user: ", user);
        checkRoleAddPassUserData(user.uid);
      })
      .catch((error) => {
        console.error("Auth Error:", error);
        const errorMessage = getErrorMessage(error.code);
        alert(errorMessage);
      });
  });

// Login user with Google Account
document
  .getElementById("loginWithGoogleBtn")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form reload
    const provider = new GoogleAuthProvider();
    // Open the popup for Google login
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        console.log("User logged in: ", user);
        
        checkRoleAddPassUserData(user.uid);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = getErrorMessage(errorCode);
        console.error("Error: ", errorCode, errorMessage);
        alert(errorMessage);
      });
  });

  function checkRoleAddPassUserData(id){
    const database = getDatabase();
    const userRef = ref(database, `users/${id}`);

    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          console.log("User Role:", userData.role);
          // Step 4: Navigate based on the role
          if (userData.role === "user") {
            localStorage.setItem('userId', userData.uid);
            localStorage.setItem("userName", userData.name);
            localStorage.setItem("userEmail", userData.email);
            alert("User logged in successfully!");
            const queryString = `id=${encodeURIComponent(userData.uid)}&name=${encodeURIComponent(userData.name)}&email=${encodeURIComponent(userData.email)}`;
            window.location.replace(`/User/assets/views/index.html?${queryString}`);
          } else{
            alert("Your role is admin not a customer");
          }
      }else {
        console.log("No user data found in the database.");
        alert("User data not found. Please contact support.");
        // Optionally redirect to a default screen or log the user out
      }
    })
      .catch((error) => {
        console.error("Error fetching user role:", error);
        alert("Error fetching user role. Please try again.");
      });
}

// // User Forgot Password
// document.getElementById("forgotPasswordBtn").addEventListener("click", function (event) {
//     event.preventDefault(); // Prevent form reload
  
//     const email = document.getElementById("forgotPasswordEmail").value.trim();
  
//     if (!email) {
//       alert("Please enter your email address.");
//       return;
//     }
  
//     // Send password reset email
//     sendPasswordResetEmail(auth, email)
//       .then(() => {
//         // Inform the user that the reset email has been sent
//         alert("Password reset email sent! Please check your inbox.");
//       })
//       .catch((error) => {
//         // Handle errors
//         const errorCode = error.code;
//         const errorMessage = getErrorMessage(errorCode);
//         console.error("Error: ", errorCode, errorMessage);
//         alert(errorMessage);
//       });
//   });
  


  // Function to translate Firebase error codes into user-friendly messages
function getErrorMessage(errorCode) {
    switch (errorCode) {
      case "auth/invalid-email":
        return "The email address is not valid. Please enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      case "auth/user-not-found":
        return "No user found with this email address. Please check your email or sign up.";
      case "auth/wrong-password":
        return "The password is incorrect. Please try again.";
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

