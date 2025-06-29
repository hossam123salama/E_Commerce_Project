import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, child, ref, push, set, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { data } from "../firebase/data.js"
import { getAllOrders, generateOrderCards } from './orders.js';
import { countNormalUsers, countAdminUsers } from './home.js';

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



const productForm = document.getElementById("productForm");
const errorMessage = document.getElementById("errorMessage");

//! Add Product
if (productForm)
    productForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // Get values from form
        const productName = document.getElementById("productName").value;
        const productCategory = document.getElementById("categoryOptions").value;
        const productPrice = parseFloat(document.getElementById("productPrice").value);
        const productDescription = document.getElementById("productDescription").value;
        const productImage = document.getElementById("productImage").value;
        const stockQuantity = document.getElementById("stockQuantity").value;

        // Validate form data
        if (!productName || !productCategory || isNaN(productPrice) || !productDescription || !productImage || !stockQuantity) {
            errorMessage.textContent = "All fields are required.";
            return;
        } else {
            errorMessage.textContent = "";
        }

        createProduct(productName, productCategory, productPrice, productDescription, productImage, stockQuantity)
    });


// API URL for external product data
// const apiUrl = 'https://fakestoreapi.com/products'; // Replace with your API URL
// console.log(data);

// Fetch and Create Products in Firebase
// async function fetchAndCreateProducts() {
//     const productsRef = ref(database, "products");

//     // Check if products already exist in Firebase
//     try {
//         const snapshot = await get(productsRef);
//         if (snapshot.exists()) {
//             console.log("Products already exist in Firebase.");
//             return; // Skip fetching if data already exists
//         }
//         // If products don't exist, fetch them from the API
//         // console.log("Fetching products from API...");
//         const response = await fetch(apiUrl);
//         const products = await response.json();

//         // Loop through the products data and send it to Firebase
//         data.forEach(product => {
//             const { title, category, price, description,image,stock } = product;
//             createProduct(title, category, price, description,image,stock);
//         });

//     } catch (error) {
//         console.log("Error fetching or checking products in Firebase: "+ error);
//     }
// }

// Create a product in Firebase
function createProduct(title, category, price, description, image, stock) {
    // Reference to the Firebase database
    const categoryID = `category-${Date.now()}`; // give a unique id to category 
    const productsRef = ref(database, "products");

    // Product data
    const productData = {
        title,
        category,
        price,
        description,
        image,
        stock,
        categoryID,
    };

    // Generate a unique ID using push()
    const newProductRef = push(productsRef);

    // Save product data with unique ID to Firebase
    set(newProductRef, productData)
        .then(() => {
            alert("Product created successfully!");

            productForm.reset(); // Reset the form
        })
        .catch((error) => {
            console.error("Error creating product: ", error);
        });
}


// Fetch all products in Firebase
function getAllProducts() {
    const dbRef = ref(database);
    return get(child(dbRef, "products")) // Fetch all products
        .then((snapshot) => {
            if (snapshot.exists()) {
                const productsData = snapshot.val(); // Get the raw data object
                // Convert to array with IDs
                const productsArray = Object.entries(productsData).map(([id, product]) => ({
                    id, // Include the Firebase key as the product ID
                    ...product // Spread the product properties (title, description, etc.)
                }));
                return productsArray; // Return the array of products
            } else {
                return []; // Return an empty array if no data exists
            }
        })
        .catch((error) => {
            console.error("Error fetching products:", error);
            return []; // Return an empty array in case of error
        });
}

//! new feature
// Modify getAllCategories to get both name and ID
async function getAllCategories() {
    const dbRef = ref(database, "categories");
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const categories = Object.values(snapshot.val());
            // Create a map of category names to their IDs
            const categoryMap = new Map();
            categories.forEach(cat => {
                categoryMap.set(cat.name, cat.id);
            });
            return categoryMap;
        }
        return new Map();
    } catch (error) {
        console.error("Error fetching categories:", error);
        return new Map();
    }
}

//! new feature
// Modify handleCategoryOptionsField to store the exact categoryID
async function handleCategoryOptionsField() {
    const categoryMap = await getAllCategories();
    const categorySelect = document.getElementById("categoryOptions");

    // Clear existing options first
    categorySelect.innerHTML = `
        <option value="" disabled selected>Select Category</option>
    `;

    // Add categories with their exact IDs from the database
    for (const [name, id] of categoryMap) {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        option.dataset.categoryId = id; // Store the exact ID from categories database
        categorySelect.appendChild(option);
    }
}


// Fetch products map to user in view order
export async function fetchProductsMap() {
    const db = getDatabase();
    const dbRef = ref(db);

    try {
        const snapshot = await get(child(dbRef, 'products'));

        if (snapshot.exists()) {
            const data = snapshot.val();

            // Convert to productsMap with validation
            const productsMap = {};
            for (const productId in data) {
                const product = data[productId];
                // Validate required fields
                if (
                    product &&
                    typeof product.image === 'string' &&
                    typeof product.price === 'number' &&
                    typeof product.stock === 'number' && // Use stock instead of quantity
                    typeof product.title === 'string' &&
                    typeof product.category === 'string' &&
                    typeof product.description === 'string'
                ) {
                    productsMap[productId] = {
                        id: productId,
                        image: product.image,
                        price: product.price,
                        stock: product.stock, // Use stock instead of quantity
                        title: product.title,
                        category: product.category,
                        description: product.description
                    };
                } else {
                    console.warn(`Skipping invalid product with ID: ${productId}`);
                }
            }

            return productsMap;
        } else {
            console.log("No products found.");
            return {};
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        return {};
    }
}

// Ensure the fetchAndCreateProducts is called after the page loads
window.onload = function () {
    //fetchAndCreateProducts();
    //getAllProducts();
};



//* Handle Dashboard content that show when navbar item clicked 

document.addEventListener("DOMContentLoaded", async function () {
    const pageContent = document.getElementById("page-content");
    const home = document.getElementById("home");
    const products = document.getElementById("products");
    const categories = document.getElementById("categories");
    const orders = document.getElementById("orders");
    const navItems = [home, products, categories, orders];

    // Function to update content and active state
    function updatePageContent(content, selectedItem) {
        pageContent.innerHTML = content;
        navItems.forEach(item => item?.classList.remove("active"));
        selectedItem?.classList.add("active");
    }

    if (home) {
        try {
            let customerNum = await countNormalUsers();
            let adminNum = await countAdminUsers();
            let content = await getHomeContent(customerNum ?? 0, adminNum ?? 0); // Await the content
            updatePageContent(content, home); // Pass the resolved content
        } catch (error) {
            console.error("Error updating home content:", error);
        }
    }

    // Event listener for the home button
    home?.addEventListener("click", async function (event) {
        event.preventDefault();
        try {
            let customerNum = await countNormalUsers();
            let adminNum = await countAdminUsers();
            let content = await getHomeContent(customerNum ?? 0, adminNum ?? 0); // Await the content
            updatePageContent(content, home); // Pass the resolved content
        } catch (error) {
            console.error("Error updating home content:", error);
        }
    });

    products?.addEventListener("click", async function (event) {
        event.preventDefault();
        // Since getProductContent is async, await its result and then update the content
        const content = await getProductContent();
        updatePageContent(content, products);
    });

    categories?.addEventListener("click", function (event) {
        event.preventDefault();

        updatePageContent(getCategoriesContent(), categories);
    });

    orders?.addEventListener("click", async function (event) {
        event.preventDefault();
        const content = await getOrdersContent(); // wait for the Promise to resolve
        updatePageContent(content, orders);
    });

    // Function to return Home Page Content
    async function getHomeContent(customerNum, adminNum) {
        return `
        <div class="row">
            <div class="col-sm-12 col-xl-9">
                <section class="overview-container col-sm-12">
                    <div class="overview-box">
                        <div class="overview d-flex">
                            <h2>Overview</h2>
                        </div>
                        <div class="customers-incomes d-flex">
                            <div class="customers col-5">
                                <section class="customer-number">
                                    <i class="fa-duotone fa-solid fa-users"></i>
                                    <span>Number of Customers is <strong id="customers-numbers">${customerNum}</strong></span>
                                </section>
                            </div>
                            <br>
                        </div>
                        <div class="customers-incomes d-flex">
                            <div class="customers col-5">
                                <section class="customer-number">
                                    <i class="fa-solid fa-user-tie"></i>
                                    <span>Number of Admin is <strong id="admins-numbers">${adminNum}</strong></span>
                                </section>
                            </div>
                            <br>
                        </div>
                    </div>
                </section>
            </div>
        </div>`;
    }

    // Function to return Products in Page Content
    async function getProductContent() {
        try {
            // Fetch products asynchronously
            const products = await getAllProducts();

            // Ensure that we have an array of products
            if (!Array.isArray(products)) {
                console.error("Expected an array of products, but got:", products);
                return "<div>Error loading products.</div>";
            }

            // Generate product cards dynamically once the products are available
            return `
        <div class="container mt-4">
            <h2 class="mb-4">Products</h2>
            <div class="row">
                ${generateProductCards(products)} <!-- Pass the products to generate cards -->
            </div>
        </div>`;
        } catch (error) {
            console.error("Error fetching products:", error);
            return "<div>Error loading products.</div>";
        }
    }

    // Function to generate product cards dynamically
    function generateProductCards(products) {
        return products.map(p => {
            // Escape single quotes in string values
            const escapedTitle = p.title.replace(/'/g, "\\'");
            const escapedCategory = p.category.replace(/'/g, "\\'");
            const escapedDescription = p.description.replace(/'/g, "\\'");
            
            // Determine stock status and badge
            const stockStatus ='' //p.stock === 0 ? 'danger' : p.stock <= 5? 'warning' : 'success';
            const stockLabel = ''//p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'In Stock';

            return `
            <div class="col-md-4 mb-4 product-card" id="product-${p.id}">
                <div class="card h-100 border-0 shadow-sm hover-shadow" style="transition: all 0.3s ease;">
                    <div class="position-relative">
                        <img src="${p.image}" class="card-img-top" alt="${p.title}" 
                             style="height: 200px; object-fit: contain; padding: 1rem; background: #f8f9fa;">
                        <span class="position-absolute top-0 end-0 m-2 badge bg-${stockStatus}">
                            ${stockLabel}
                        </span>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <div class="mb-2">
                            <span class="badge bg-primary">${p.category}</span>
                        </div>
                        <h5 class="card-title text-truncate mb-1" title="${p.title}">${p.title}</h5>
                        <p class="card-text small text-muted mb-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                            ${p.description}
                        </p>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h4 class="mb-0 text-primary">$${p.price.toFixed(2)}</h4>
                            <div class="d-flex align-items-center">
                                <i class="fas fa-box me-1 text-${stockStatus}"></i>
                                <span class="small text-${stockStatus}">${p.stock} units</span>
                            </div>
                        </div>
                        <div class="mt-auto pt-3 border-top">
                            <div class="d-flex gap-2">
                                <button class="btn btn-outline-primary flex-grow-1 d-flex align-items-center justify-content-center" 
                                        onclick="editProductPage('${p.id}', '${escapedTitle}', ${p.price}, ${p.stock}, '${escapedCategory}', '${escapedDescription}')">
                                    <i class="fas fa-edit me-2"></i>Edit
                                </button>
                                <button class="btn btn-outline-danger flex-grow-1 d-flex align-items-center justify-content-center" 
                                        onclick="deleteProduct('${p.id}')">
                                    <i class="fas fa-trash-alt me-2"></i>Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    // Add event listeners for search and filter functionality
    document.addEventListener('DOMContentLoaded', function() {
        const pageContent = document.getElementById('page-content');
        if (pageContent) {
            pageContent.addEventListener('input', function(e) {
                if (e.target.id === 'searchProducts') {
                    handleSearch(e.target.value);
                }
            });

            pageContent.addEventListener('change', function(e) {
                if (e.target.id === 'categoryFilter') {
                    handleCategoryFilter(e.target.value);
                } else if (e.target.id === 'sortProducts') {
                    handleSort(e.target.value);
                }
            });
        }
    });

    function handleSearch(searchTerm) {
        const productCards = document.querySelectorAll('.product-card');
        searchTerm = searchTerm.toLowerCase();

        productCards.forEach(card => {
            const title = card.querySelector('.product-title').textContent.toLowerCase();
            const category = card.querySelector('.product-category').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || category.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function handleCategoryFilter(category) {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const productCategory = card.querySelector('.product-category').textContent;
            if (category === 'all' || productCategory === category) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function handleSort(sortOption) {
        const productsGrid = document.getElementById('productsGrid');
        const productCards = Array.from(document.querySelectorAll('.product-card'));

        productCards.sort((a, b) => {
            const titleA = a.querySelector('.product-title').textContent;
            const titleB = b.querySelector('.product-title').textContent;
            const priceA = parseFloat(a.querySelector('.product-price').textContent.replace('$', ''));
            const priceB = parseFloat(b.querySelector('.product-price').textContent.replace('$', ''));
            const stockA = parseInt(a.querySelector('.product-stock').textContent);
            const stockB = parseInt(b.querySelector('.product-stock').textContent);

            switch (sortOption) {
                case 'name-asc':
                    return titleA.localeCompare(titleB);
                case 'name-desc':
                    return titleB.localeCompare(titleA);
                case 'price-asc':
                    return priceA - priceB;
                case 'price-desc':
                    return priceB - priceA;
                case 'stock-asc':
                    return stockA - stockB;
                case 'stock-desc':
                    return stockB - stockA;
                default:
                    return 0;
            }
        });

        productsGrid.innerHTML = '';
        productCards.forEach(card => productsGrid.appendChild(card));
    }

    // Function to return Categories in Page Content
    function getCategoriesContent() {
        return `getCategoriesContent`;
    }

    // Function to return Categories in Page Content
    async function getOrdersContent() {
        try {
            const orders = await getAllOrders();
            const productsMap = await fetchProductsMap();
    
            console.log("Orders:", orders);
            console.log("Products Map:", productsMap);
    
            if (!Array.isArray(orders)) {
                console.error("Expected an array of orders, but got:", orders);
                return "<div>Error loading orders.</div>";
            }
    
            return `
                <div class="container mt-4">
                    <h2 class="mb-4">Customers Orders</h2>
                    <div class="row">
                        ${generateOrderCards(orders, productsMap)}
                    </div>
                </div>`;
        } catch (error) {
            console.error("Error fetching orders:", error);
            return "<div>Error loading orders.</div>";
        }
    }



});

// Make deleteProduct globally accessible
window.deleteProduct = function (productId) {
    const productsRef = ref(database, `products/${productId}`);
    if (confirm("Are you sure you want to delete this product?")) {
        set(productsRef, null)
            .then(() => {
                console.log(`Product ${productId} deleted successfully!`);
                const productElement = document.getElementById(`product-${productId}`);
                if (productElement) productElement.remove();
            })
            .catch((error) => {
                console.error("Error deleting product: ", error);
            });
    }
};

// Make editProductPage globally accessible
window.editProductPage = function (productId, title, price, stock, category, description) {
    const queryString = `?id=${encodeURIComponent(productId)}&title=${encodeURIComponent(title)}&price=${encodeURIComponent(price)}&stock=${encodeURIComponent(stock)}&category=${encodeURIComponent(category)}&description=${encodeURIComponent(description)}`;
    window.location.href = `/Admin/assets/views/updateProductForm.html${queryString}`;
};

// Make sure to call handleCategoryOptionsField when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Page loaded, initializing category field"); // Debug log
    await handleCategoryOptionsField();
});


//validate form fields

// 1- Product name
const productNameInput = document.getElementById("productName");
// Live filtering: only letters allowed
productNameInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^a-zA-Z]/g, '');
});

// 2- Product description
const productDescription = document.getElementById("productDescription")
productDescription.addEventListener("input", function () {
    this.value = this.value.replace(/[^a-zA-Z]/g, '');
});


