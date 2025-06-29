import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, child, ref, get, set, push, update } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

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

// Fetch all products
async function getAllProducts() {
    const dbRef = ref(database);
    try {
        const snapshot = await get(child(dbRef, "products"));
        if (snapshot.exists()) {
            const productsData = snapshot.val(); // Get the raw data object
            const productsArray = Object.entries(productsData).map(([id, product]) => ({
                id,
                ...product
            }));
            return productsArray; // Return the array of products
        } else {
            return []; // Return empty array if no products found
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        return []; // Return empty array on error
    }
}

// Get all unique categories with their IDs from the products array
async function getAllCategoriesWithIds() {
    const products = await getAllProducts();
    const categoriesMap = new Map();

    products.forEach((product) => {
        if (!categoriesMap.has(product.category)) {
            categoriesMap.set(product.category, product.categoryID);
        }
    });

    // Convert Map to array of objects
    return Array.from(categoriesMap).map(([name, id]) => ({
        name,
        categoryID: id
    }));
}

// Function to check if category exists
async function checkCategoryExists(categoryName) {
    const dbRef = ref(database, "categories");
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const categories = Object.values(snapshot.val());
            return categories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
        }
        return false;
    } catch (error) {
        console.error("Error checking category:", error);
        return false;
    }
}

// Store categories in Firebase Realtime Database
async function storeCategoriesInDatabase() {
    const categories = await getAllCategoriesWithIds();
    const dbRef = ref(database, 'categories'); // Reference to categories node

    try {
        // First, get existing categories to avoid duplicates
        const snapshot = await get(dbRef);
        const existingCategories = snapshot.exists() ? snapshot.val() : {};

        // Store each category with its ID, but only if it doesn't exist
        for (const category of categories) {
            const exists = await checkCategoryExists(category.name);
            if (!exists) {
                const categoryRef = ref(database, `categories/${category.categoryID}`);
                await set(categoryRef, {
                    id: category.categoryID,
                    name: category.name
                });
            }
        }
        console.log("Categories have been successfully stored in the database with their IDs.");
    } catch (error) {
        console.error("Error storing categories in database:", error);
    }
}

// Function to get the highest category ID from both products and categories
async function getHighestCategoryId() {
    try {
        // Get all products
        const products = await getAllProducts();
        const productMaxId = Math.max(...products.map(product => 
            parseInt(product.categoryID) || 0
        ));

        // Get all categories
        const categoriesRef = ref(database, "categories");
        const snapshot = await get(categoriesRef);
        const categories = snapshot.exists() ? Object.values(snapshot.val()) : [];
        const categoriesMaxId = Math.max(...categories.map(category => 
            parseInt(category.id) || 0
        ));

        // Return the highest ID from both collections
        return Math.max(productMaxId, categoriesMaxId);
    } catch (error) {
        console.error("Error getting highest category ID:", error);
        return 0;
    }
}

// Function to create a new category
async function createCategory(name) {
    try {
        // Check if category already exists
        const exists = await checkCategoryExists(name);
        if (exists) {
            alert("This category already exists!");
            return null;
        }

        const newCategoryId = `category-${Date.now()}`;
        const categoryRef = ref(database, `categories/${newCategoryId}`);
        
        // Save category data with the new ID
        await set(categoryRef, {
            id: newCategoryId,
            name: name
        });
        
        alert("Category created successfully!");
        await displayCategories();
        return newCategoryId;
    } catch (error) {
        console.error("Error creating category:", error);
        alert("Error creating category. Please try again.");
        return null;
    }
}

// Function to check products in a category and their stock
async function checkCategoryProducts(categoryName) {
    const dbRef = ref(database, "products");
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const products = Object.entries(snapshot.val());
            const categoryProducts = products.filter(([_, product]) => product.category === categoryName);
            
            // Calculate total stock
            const totalStock = categoryProducts.reduce((sum, [_, product]) => sum + parseInt(product.stock || 0), 0);
            
            return {
                products: categoryProducts,
                totalStock: totalStock
            };
        }
        return { products: [], totalStock: 0 };
    } catch (error) {
        console.error("Error checking category products:", error);
        throw error;
    }
}

// Function to delete a category and its products
async function deleteCategory(categoryId, categoryName) {
    try {
        // First check the products in this category
        const { products, totalStock } = await checkCategoryProducts(categoryName);

        if (totalStock > 0) {
            // If there's stock, show confirmation with stock count
            const confirm = window.confirm(
                `This category has ${products.length} product(s) with a total stock of ${totalStock} items.\n\n` +
                `Are you sure you want to delete this category and all its products?`
            );
            
            if (!confirm) {
                return false;
            }
        }

        // Delete all products in this category
        const productPromises = products.map(([productId, _]) => {
            return set(ref(database, `products/${productId}`), null);
        });

        // Delete the category
        const categoryPromise = set(ref(database, `categories/${categoryId}`), null);

        // Wait for all deletions to complete
        await Promise.all([...productPromises, categoryPromise]);

        alert("Category and associated products deleted successfully!");
        await displayCategories(); // Refresh the categories display
        return true;
    } catch (error) {
        console.error("Error deleting category:", error);
        alert("Error deleting category. Please try again.");
        return false;
    }
}

// Function to update category name in both categories and products
async function updateCategoryName(categoryId, oldName, newName) {
    try {
        // First check if new name already exists
        const exists = await checkCategoryExists(newName);
        if (exists && newName.toLowerCase() !== oldName.toLowerCase()) {
            alert("This category name already exists!");
            return false;
        }

        // Update category name in categories database
        const categoryRef = ref(database, `categories/${categoryId}`);
        await set(categoryRef, {
            id: categoryId,
            name: newName
        });

        // Update all products with this category
        const productsRef = ref(database, "products");
        const snapshot = await get(productsRef);
        
        if (snapshot.exists()) {
            const updates = {};
            Object.entries(snapshot.val()).forEach(([productId, product]) => {
                if (product.category === oldName) {
                    updates[`products/${productId}/category`] = newName;
                }
            });

            // Apply all updates at once
            if (Object.keys(updates).length > 0) {
                await update(ref(database), updates);
            }
        }

        alert("Category updated successfully!");
        await displayCategories(); // Refresh the display
        return true;
    } catch (error) {
        console.error("Error updating category:", error);
        alert("Error updating category. Please try again.");
        return false;
    }
}

// Function to validate category name
function validateCategoryName(name) {
    // Regular expression to match only letters and spaces
    const regex = /^[a-zA-Z\s]+$/;
    return regex.test(name);
}

// Function to show edit form for a category
function showEditForm(category, cardElement) {
    // Store the original card content
    const cardBody = cardElement.querySelector('.card-body');
    const originalContent = cardBody.innerHTML;

    // Create edit form HTML
    const editForm = document.createElement('form');
    editForm.className = 'edit-category-form';
    editForm.innerHTML = `
        <div class="input-group mb-3">
            <input type="text" class="form-control" value="${category.name}" required>
            <button class="btn btn-success" type="submit">Save</button>
            <button class="btn btn-secondary" type="button" onclick="cancelEdit(this)">Cancel</button>
        </div>
        <div class="text-danger" id="edit-error-${category.id}"></div>
    `;

    // Replace card content with edit form
    cardBody.innerHTML = '';
    cardBody.appendChild(editForm);

    // Store the original content as a data attribute
    cardElement.setAttribute('data-original-content', originalContent);

    // Handle form submission
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = editForm.querySelector('input').value.trim();
        const errorElement = document.getElementById(`edit-error-${category.id}`);
        
        if (!newName) {
            errorElement.textContent = "Category name cannot be empty";
            return;
        }

        if (!validateCategoryName(newName)) {
            errorElement.textContent = "Category name can only contain letters and spaces";
            return;
        }

        if (newName === category.name) {
            // Restore original content if no change
            cardBody.innerHTML = originalContent;
            return;
        }

        await updateCategoryName(category.id, category.name, newName);
    });
}

// Function to handle cancel button click
window.cancelEdit = function(button) {
    const cardElement = button.closest('.card');
    const cardBody = cardElement.querySelector('.card-body');
    const originalContent = cardElement.getAttribute('data-original-content');
    cardBody.innerHTML = originalContent;
};

// Modify the display categories function to include edit functionality
async function displayCategories() {
    const dbRef = ref(database, "categories");

    try {
        const snapshot = await get(dbRef);
        const categories = snapshot.exists() ? Object.values(snapshot.val()) : [];

        const categoriesElement = document.getElementById("categories");
        const pageContent = document.getElementById("page-content");

        if (categoriesElement && pageContent) {
            pageContent.innerHTML = `
                <div class="row">
                    <div class="col-12 mb-4">
                        <h1 class="p-2">Categories</h1>
                        <!-- Add Category Form -->
                        <div class="card shadow-sm">
                            <div class="card-body">
                                <form id="categoryForm" class="row g-3">
                                    <div class="col-md-6">
                                        <input type="text" class="form-control" id="categoryName" placeholder="Enter category name (letters only)" required>
                                    </div>
                                    <div class="col-md-2">
                                        <button type="submit" class="btn btn-primary">Add Category</button>
                                    </div>
                                    <div class="col-12">
                                        <p id="errorMessage" class="text-danger"></p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <!-- Categories List -->
                    ${categories.map(category => `
                        <div class="col-md-3 mb-4 p-3">
                            <div class="card shadow-sm category-card">
                                <div class="card-body text-center">
                                    <i class="fa-solid fa-layer-group fa-3x mb-3"></i>
                                    <h5 class="card-title">${category.name}</h5>
                                    <button class="btn btn-primary edit-btn" onclick="handleEditClick(this, '${category.id}', '${category.name.replace(/'/g, "\\'")}')">Edit</button>
                                    <button class="btn btn-danger" onclick="deleteCategory('${category.id}', '${category.name.replace(/'/g, "\\'")}')">Delete</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            // Add event listener for the category form
            const categoryForm = document.getElementById("categoryForm");
            const errorMessage = document.getElementById("errorMessage");

            if (categoryForm) {
                categoryForm.addEventListener("submit", async function(event) {
                    event.preventDefault();

                    const categoryName = document.getElementById("categoryName").value.trim();

                    // Validate form data
                    if (!categoryName) {
                        errorMessage.textContent = "Category name is required.";
                        return;
                    }

                    if (!validateCategoryName(categoryName)) {
                        errorMessage.textContent = "Category name can only contain letters and spaces";
                        return;
                    }

                    // Check if category name already exists
                    const existingCategory = categories.find(cat => 
                        cat.name.toLowerCase() === categoryName.toLowerCase()
                    );
                    
                    if (existingCategory) {
                        errorMessage.textContent = "This category already exists.";
                        return;
                    }

                    errorMessage.textContent = "";
                    await createCategory(categoryName);
                    categoryForm.reset(); // Clear the form
                });
            }
        }
    } catch (error) {
        console.error("Error displaying categories:", error);
    }
}

// Function to handle edit button click
window.handleEditClick = function(button, categoryId, categoryName) {
    const cardElement = button.closest('.card');
    const category = { id: categoryId, name: categoryName };
    showEditForm(category, cardElement);
};

// Display the categories when categories button is clicked
const categoriesBtn = document.getElementById("categories");
categoriesBtn.addEventListener("click", async function(event) {
    event.preventDefault();  // Prevent default link behavior
    // First store/update the categories data
    await storeCategoriesInDatabase();
    // Then display the categories
    await displayCategories();
});

// Make deleteCategory available globally for the onclick handler
window.deleteCategory = deleteCategory;
