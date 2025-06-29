import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, child, ref, push, set, get, update } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { data } from "../firebase/data.js";
import { getUserById } from "../firebase/home.js";

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
  
// Create an Order in Firebase
// function createOrder(userId, userName, products, status, feedBack, time) {
//   const ordersRef = ref(database, "orders");

//   const OrderData = {
//     userId,
//     userName,
//     products,
//     status,
//     feedBack,
//     time,
//   };

//   const newOrderRef = push(ordersRef);

//   set(newOrderRef, OrderData)
//     .then(() => {
//       alert("Order created successfully!");
//       return getAllOrders().then((orders) => {
//         console.log(orders);
//       });
//     })
//     .catch((error) => {
//       console.error("Error creating order: ", error);
//     });
// }

// Fetch all orders from Firebase
export function getAllOrders() {
  const dbRef = ref(database);
  return get(child(dbRef, "orders"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        return Object.entries(ordersData).map(([id, order]) => ({
          id,
          userId: order.userId,
          userName: order.userName,
          products: order.products,
          status: order.status,
          feedBack: order.feedBack,
          time: order.time,
        }));
      } else {
        return [];
      }
    })
    .catch((error) => {
      console.error("Error fetching orders:", error);
      return [];
    });
}

// Define the saveOrderChange function globally
window.saveOrderChange = function(orderId) {
  const select = document.querySelector(`#status-${orderId}`);
  const selectedStatus = select.value;
  console.log("selectedStatus=>"+selectedStatus);
  

  updateOrderStatus(orderId, selectedStatus);
  
  // You can perform the logic to save the selected status here.
  console.log(`Saving order ID: ${orderId} with status: ${selectedStatus}`);
};

// Function to update order status in the database
function updateOrderStatus(orderId, newStatus) {
  const orderRef = ref(database, `orders/${orderId}`);

  update(orderRef, { status: newStatus })
    .then(() => {
      alert(`Order status updated to "${newStatus}"`);
      console.log("Status updated successfully.");
    })
    .catch((error) => {
      console.error("Error updating status:", error);
    });
}

// Function to generate product list HTML
function generateOrderProductList(products, productsMap) {
  if (!Array.isArray(products) || products.length === 0) {
      return "<p>No products in this order.</p>";
  }

  return `
      <ul class="list-group mb-3">
          ${products
              .map((prod) => {
                  // Check if prod exists and has a title (direct product data case)
                  if (prod && prod.title) {
                      return `
                          <li class="list-group-item d-flex justify-content-between align-items-center">
                              ${prod.title}
                              <span class="badge bg-secondary rounded-pill">Qty: ${prod.quantity || 'N/A'}</span>
                          </li>
                      `;
                  }
                  // Fallback to productId lookup in productsMap
                  if (!prod || !prod.productId) {
                      console.warn("Invalid product entry in order:", prod);
                      return `
                          <li class="list-group-item d-flex justify-content-between align-items-center text-danger">
                              Unknown Product
                              <span class="badge bg-secondary rounded-pill">Qty: ${prod?.quantity || 'N/A'}</span>
                          </li>
                      `;
                  }

                  const productInfo = productsMap[prod.productId];
                  if (!productInfo) {
                      console.warn(`Product ID "${prod.productId}" not found in productsMap.`);
                      return `
                          <li class="list-group-item d-flex justify-content-between align-items-center text-danger">
                              Unknown Product (ID: ${prod.productId})
                              <span class="badge bg-secondary rounded-pill">Qty: ${prod.quantity}</span>
                          </li>
                      `;
                  }

                  return `
                      <li class="list-group-item d-flex justify-content-between align-items-center">
                          ${productInfo.title}
                          <span class="badge bg-primary rounded-pill">Qty: ${prod.quantity}</span>
                      </li>
                  `;
              })
              .join("")}
      </ul>
  `;
}

// Function to generate order cards dynamically
// Function to generate order cards dynamically
export function generateOrderCards(orders, productsMap) {
  return orders
      .map((order) => {
          // Calculate total price for the order
          let totalPrice = 0;
          if (Array.isArray(order.products)) {
              totalPrice = order.products.reduce((sum, prod) => {
                  // Handle case where prod has direct product details or productId
                  if (prod && prod.price && typeof prod.price === 'number') {
                      // Direct price in product (case where order includes full product details)
                      return sum + prod.price * (prod.quantity || 0);
                  } else if (prod && prod.productId && productsMap[prod.productId]) {
                      // Lookup price in productsMap
                      return sum + (productsMap[prod.productId].price * (prod.quantity || 0));
                  }
                  console.warn(`Skipping price calculation for invalid product:`, prod);
                  return sum;
              }, 0);
          }

          const options = ["Pending", "Confirm", "Reject"].map(status => {
              return `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`;
          }).join('');
          console.log("Order Products:", JSON.stringify(order.products)); // Stringify for better debugging
          return `
              <div class="col-md-6 mb-4">
                  <div class="card shadow-sm">
                      <div class="card-body">
                          <h5 class="card-title">Order by: ${order.id}</h5>
                          <p><strong>Feedback:</strong> ${order.feedBack == '' ? 'No Feedback Yet' : order.feedBack}</p>
                          <p><strong>Time:</strong> ${new Date(order.time).toLocaleString()}</p>
                          <p><strong>Total Price:</strong> $${totalPrice.toFixed(2)}</p>
                          <p><strong>Status:</strong> 
                              <select id="status-${order.id}" class="form-control" data-order-id="${order.id}">
                                  ${options}
                              </select>
                          </p>
                          <button class="btn btn-success mt-2" data-order-id="${order.id}" onclick="saveOrderChange('${order.id}')">Save Change</button>
                          <br><br>
                          <h6>Products:</h6>
                          ${generateOrderProductList(order.products, productsMap)}
                      </div>
                  </div>
              </div>
          `;
      })
      .join("");
}
// Function to save order status change
window.saveOrderChange = function(orderId) {
  const selectElement = document.querySelector(`#status-${orderId}`);
  if (selectElement) {
    const newStatus = selectElement.value;
    updateOrderStatus(orderId, newStatus);
  } else {
    console.error(`Select element for order ${orderId} not found`);
  }
};


// document.getElementById("createOrderBtn").addEventListener("click", function (event) {
//   event.preventDefault();
//   createOrder(
//     "FZrA37lVTHOR3LWrqYX8P9nAbtP2",
//     "Ahmed Khaled",
//     [
//       { productId: "-ONe5S_ZvSgDoAOVFQsz", quantity: 5 },
//       { productId: "-ONe5S_ZvSgDoAOVFQsz", quantity: 2 },
//     ],
//     "Pending", // Fixed case to match select options
//     "feedBack",
//     Date.now()
//   );
// });