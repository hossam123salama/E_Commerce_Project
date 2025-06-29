import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Firebase Configuration
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

document.addEventListener('DOMContentLoaded',async function(){
    let customerNum = await countNormalUsers();
    let adminNum = await countAdminUsers();
    // await getUserById("FZrA37lVTHOR3LWrqYX8P9nAbtP2");

    document.getElementById('customers-numbers').innerText = customerNum;
    document.getElementById('admins-numbers').innerText = adminNum;
}
);

export async function getUserById(id) {
  const db = getDatabase();
  const userRef = ref(db, `users/${id}`);  // target the specific user directly

  try {
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
          const userData = snapshot.val();
          console.log("Fetched User:", userData.name);
          return userData.name;  // returns the full user object: { name, email, role, uid }
      } else {
          console.warn(`User with ID ${id} not found.`);
          return null;
      }
  } catch (error) {
      console.error("Error fetching user by ID:", error);
      return null;
  }
}

export async function countNormalUsers() {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
  
    try {
      const snapshot = await get(usersRef);
      let userCount = 0;
  
      if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
          const userData = childSnapshot.val();
          if (userData.role === 'user') {
            userCount++;
          }
        });
      }
  
      console.log(`Number of users with role "user": ${userCount}`);
      return userCount;
    } catch (error) {
      console.error("Error fetching users:", error);
      return 0;
    }
  }
export async function countAdminUsers() {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
  
    try {
      const snapshot = await get(usersRef);
      let userCount = 0;
  
      if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
          const userData = childSnapshot.val();
          if (userData.role === 'admin') {
            userCount++;
          }
        });
      }
  
      console.log(`Number of users with role "admin": ${userCount}`);
      return userCount;
    } catch (error) {
      console.error("Error fetching users:", error);
      return 0;
    }
  }