import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Get the update form and error message elements
const updateProductForm = document.getElementById("updateProductForm");
const errorMessage = document.getElementById("errorMessage");

// Add product update event listener
updateProductForm.addEventListener("submit", function (event) {
  event.preventDefault();

  // Get the values from the form
  const productId = document.getElementById("productId").value;
  const productName = document.getElementById("productName").value;
  const productPrice = parseFloat(document.getElementById("productPrice").value);
  const productDescription = document.getElementById("productDescription").value;
  const productImage = document.getElementById("productImage").value;
  const stockQuantity = document.getElementById("stockQuantity").value
  const productCategory = document.getElementById("productCategory").value

  // Validate the form data
  /*
  if (!productId || !productName || isNaN(productPrice) || !productDescription || !productImage) {
    errorMessage.textContent = "All fields are required.";
    return;
  } else {
    errorMessage.textContent = "";
  }
*/
  // Update product in Firebase
  updateProductInFirebase(productId,productName, productPrice, productDescription, productImage, stockQuantity, productCategory);
});

// Function to update product in Firebase
function updateProductInFirebase(productId, title, price, description, image, stock, category) {
  console.log("productId  "+productId);
  
  // Reference to the Firebase database
  const productRef = ref(database, `products/${productId}`);
  console.log(productRef);

  // Product data to update
  const updatedProductData = {};

  if (title) updatedProductData.title = title;
  if (!isNaN(price)) updatedProductData.price = price;
  if (stock) updatedProductData.stock = stock
  if (category) updatedProductData.category = category
  if (description) updatedProductData.description = description;
  if (image) updatedProductData.image = image;

  // Update product data in Firebase
  update(productRef, updatedProductData)
    .then(() => {
      alert("Product updated successfully!");
      // Optionally, reset the form or close the modal
      window.location.href = `/Admin/assets/views/dashboard.html`;
    })
    .catch((error) => {
      console.error("Error updating product:", error);
      errorMessage.textContent = "Error updating product. Please try again.";
    });
}

// Get the query string from the URL
const urlParams = new URLSearchParams(window.location.search);

// Extract all parameters
const productData = {
  id: urlParams.get('id'),
  title: urlParams.get('title'),
  price: urlParams.get('price'),
  stock: urlParams.get('stock'),
  category: urlParams.get('category'),
  description: urlParams.get('description')
};

console.log("productData");
console.log(productData);




// Example usage: populate a form
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('productId').value = productData.id;
  document.getElementById('productName').value = productData.title;
  document.getElementById('productCategory').value = productData.category;
  document.getElementById('productPrice').value = productData.price;
  document.getElementById('stockQuantity').value = productData.stock;
  document.getElementById('productDescription').value = productData.description;
});