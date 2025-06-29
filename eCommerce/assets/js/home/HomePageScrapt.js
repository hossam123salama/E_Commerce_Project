// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');

// Toggle functions
const toggleElement = (element) => element.classList.toggle('active');

menuToggle.addEventListener('click', () => toggleElement(navLinks));
sidebarToggle.addEventListener('click', () => toggleElement(sidebar));

// Active Nav Link
document.querySelectorAll('.nav-links a').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-links a').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

// Wishlist Functionality
const updateWishlistCount = () => {
    const wishlistCounts = document.querySelectorAll('#wishlistCount');
    const wishlist = JSON.parse(sessionStorage.getItem('wishlist')) || [];
    wishlistCounts.forEach(count => {
        count.textContent = wishlist.length;
    });
};

// Function to toggle product in wishlist
window.toggleWishlist = function(productId, button) {
    const wishlist = JSON.parse(sessionStorage.getItem('wishlist')) || [];
    const index = wishlist.indexOf(productId);
    
    if (index === -1) {
        // Add to wishlist
        wishlist.push(productId);
        button.innerHTML = '<i class="fas fa-heart"></i>';
        showNotification('Product added to wishlist', 'success');
    } else {
        // Remove from wishlist
        wishlist.splice(index, 1);
        button.innerHTML = '<i class="far fa-heart"></i>';
        showNotification('Product removed from wishlist', 'info');
    }
    
    sessionStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount(); // Update the counter after modifying wishlist
}

// Shopping Cart Functionality
let cartItems = [];
let isCartOpen = false;

const toggleCart = () => {
    const cartContainer = document.querySelector('.cart-container');
    isCartOpen = !isCartOpen;
    cartContainer.style.display = isCartOpen ? 'block' : 'none';
    
    if (isCartOpen) {
        renderCart();
        addCloseButton();
    } else {
        removeCloseButton();
    }
};

const addCloseButton = () => {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-cart-btn';
    closeBtn.innerHTML = 'Close';
    closeBtn.addEventListener('click', toggleCart);
    document.querySelector('.cart-container').prepend(closeBtn);
};

const removeCloseButton = () => {
    const existingCloseBtn = document.querySelector('.close-cart-btn');
    if (existingCloseBtn) {
        existingCloseBtn.remove();
    }
};

const renderCart = () => {
    const cartItemsContainer = document.querySelector('.cart-items-container');
    const cartTotalElement = document.querySelector('.cart-total span:last-child');
    
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        cartTotalElement.textContent = '$0.00';
        return;
    }
    
    let cartHTML = '';
    let total = 0;
    
    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartHTML += `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.title}</h3>
                    <div class="cart-item-price">$${item.price}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                        <button class="quantity-btn plus">+</button>
                    </div>
                    <button class="remove-item">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    cartTotalElement.textContent = `$${total.toFixed(2)}`;
    
    // Add event listeners for cart items
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', decreaseQuantity);
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', increaseQuantity);
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', removeItem);
    });
};

// Quantity functions
const decreaseQuantity = (e) => {
    const itemElement = e.target.closest('.cart-item');
    const itemId = parseInt(itemElement.dataset.id);
    const item = cartItems.find(item => item.id === itemId);
    
    if (item.quantity > 1) {
        item.quantity--;
        renderCart();
    }
};

const increaseQuantity = (e) => {
    const itemElement = e.target.closest('.cart-item');
    const itemId = parseInt(itemElement.dataset.id);
    const item = cartItems.find(item => item.id === itemId);
    
    item.quantity++;
    renderCart();
};

const removeItem = (e) => {
    const itemElement = e.target.closest('.cart-item');
    const itemId = parseInt(itemElement.dataset.id);
    
    cartItems = cartItems.filter(item => item.id !== itemId);
    renderCart();
    updateCartIcon();
};

const updateCartIcon = () => {
    const cartIcon = document.querySelector('.fa-cart-shopping');
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Remove existing badge if any
    const existingBadge = cartIcon.querySelector('.cart-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    if (totalItems > 0) {
        const badge = document.createElement('span');
        badge.className = 'cart-badge';
        badge.textContent = totalItems;
        cartIcon.appendChild(badge);
    }
};

// Add to cart function
const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({ ...product, quantity: 1 });
    }
    
    showNotification(`${product.title} added to cart`);
    updateCartIcon();
};

const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

// Initialize cart functionality
const initCart = () => {
    // Cart icon click
    document.querySelector('.fa-cart-shopping').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCart();
    });
    
    // Checkout button
    document.querySelector('.checkout-btn').addEventListener('click', () => {
        alert('Thank you for your purchase!');
        cartItems = [];
        renderCart();
        updateCartIcon();
        toggleCart();
    });
    
    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        const cartContainer = document.querySelector('.cart-container');
        if (isCartOpen && !cartContainer.contains(e.target)) {
            // Check if click was not on cart icon
            const cartIcon = document.querySelector('.fa-cart-shopping');
            if (e.target !== cartIcon && !cartIcon.contains(e.target)) {
                toggleCart();
            }
        }
    });
};

// Countdown Timer
const updateCountdown = () => {
    const days = document.getElementById('days');
    const hours = document.getElementById('hours');
    const minutes = document.getElementById('minutes');
    const seconds = document.getElementById('seconds');
    
    let dayValue = parseInt(days.textContent);
    let hourValue = parseInt(hours.textContent);
    let minuteValue = parseInt(minutes.textContent);
    let secondValue = parseInt(seconds.textContent);
    secondValue--;
    
    if (secondValue < 0) {
        secondValue = 59;
        minuteValue--;
        
        if (minuteValue < 0) {
            minuteValue = 59;
            hourValue--;
            
            if (hourValue < 0) {
                hourValue = 23;
                dayValue--;
            }
        }
    }
    
    days.textContent = dayValue.toString().padStart(2, '0');
    hours.textContent = hourValue.toString().padStart(2, '0');
    minutes.textContent = minuteValue.toString().padStart(2, '0');
    seconds.textContent = secondValue.toString().padStart(2, '0');
};

setInterval(updateCountdown, 1000);

// Product Display Functions
let allProducts = [];
let allExploreProducts = [];

const getStockStatus = (quantity) => {
    if (quantity > 20) return { class: 'in-stock', text: 'In Stock' };
    if (quantity > 0) return { class: 'low-stock', text: 'Low Stock' };
    return { class: 'out-of-stock', text: 'Out of Stock' };
};

const createProductCard = (product) => {
    const stockStatus = getStockStatus(product.stockQuantity);
    
    return `
        <div class="product-card">
            <div class="product-category">${product.category}</div>
            <img src="${product.image || product.thumbnail}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">$${product.price}</div>
                <div class="product-stock ${stockStatus.class}">
                    ${stockStatus.text} (${product.stockQuantity} left)
                </div>
                <div class="product-rating">
                    <i class="fas fa-star"></i>
                    ${product.rating?.rate || product.rating} (${product.rating?.count || Math.floor(Math.random() * 1000)} reviews)
                </div>
                <button class="add-to-cart" ${product.stockQuantity === 0 ? 'disabled' : ''} data-id="${product.id}">
                    ${product.stockQuantity === 0 ? 'Out of Stock' : 'Add To Cart'}
                </button>
            </div>
        </div>
    `;
};

const displayProducts = (products, containerId, isGridView) => {
    const container = document.getElementById(containerId);
    const grid = container.querySelector('.products-grid');
    const wrapper = container.querySelector('.products-wrapper');
    
    grid.innerHTML = products.map(createProductCard).join('');
    
    if (isGridView) {
        grid.classList.add('grid-view');
        grid.classList.remove('flex-view');
        container.classList.add('hide-arrows');
    } else {
        grid.classList.add('flex-view');
        grid.classList.remove('grid-view');
        container.classList.remove('hide-arrows');
    }
};

const scrollProducts = (direction, containerId) => {
    const container = document.getElementById(containerId);
    const wrapper = container.querySelector('.products-wrapper');
    const scrollAmount = 300;
    
    wrapper.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
    });
};

// Category icons mapping
const categoryIcons = {
    "electronics": "fa-mobile-screen",
    "jewelery": "fa-gem",
    "men's clothing": "fa-shirt",
    "women's clothing": "fa-person-dress",
    "phones": "fa-mobile",
    "computers": "fa-laptop",
    "smartwatch": "fa-clock",
    "camera": "fa-camera",
    "headphones": "fa-headphones",
    "coming soon": "fa-hourglass"
};

// Function to create category card (without Shop Now button)
const createCategoryCard = (category) => {
    const iconClass = categoryIcons[category.toLowerCase()] || "fa-tag";
    
    return `
        <div class="product-card">
            <div class="category-icon-container">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="product-info">
                <h3 class="product-title">${category}</h3>
            </div>
        </div>
    `;
};

// Function to display categories
const displayCategories = (categories, containerId, isGridView) => {
    const container = document.getElementById(containerId);
    const grid = container.querySelector('.products-grid');
    
    grid.innerHTML = categories.map(createCategoryCard).join('');
    
    if (isGridView) {
        grid.classList.add('grid-view');
        grid.classList.remove('flex-view');
        container.classList.add('hide-arrows');
    } else {
        grid.classList.add('flex-view');
        grid.classList.remove('grid-view');
        container.classList.remove('hide-arrows');
    }
};

// Function to fetch and display categories
const fetchAndDisplayCategories = async () => {
    try {
        const response = await fetch('https://fakestoreapi.com/products/categories');
        const categories = await response.json();
        
        // Display first 6 categories by default
        displayCategories(categories.slice(0, 6), 'productsContainer2', false);
        
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

// Function to fetch and display products for "Explore Our Products" section
const fetchAndDisplayExploreProducts = async () => {
    try {
        const response = await fetch('https://dummyjson.com/products');
        const data = await response.json();
        let products = data.products;
        
        // Add mock stock quantity and rating count
        products = products.map(product => ({
            ...product,
            stockQuantity: Math.floor(Math.random() * 100),
            rating: {
                rate: product.rating,
                count: Math.floor(Math.random() * 1000)
            }
        }));
        
        allExploreProducts = products;
        
        // Display first 6 products by default
        displayProducts(products.slice(0, 6), 'productsContainer4', false);
        
        // Set up view all toggle
        let showingAllProducts4 = false;
        document.getElementById('viewAllBtn4')?.addEventListener('click', function() {
            showingAllProducts4 = !showingAllProducts4;
            displayProducts(
                showingAllProducts4 ? allExploreProducts : allExploreProducts.slice(0, 6),
                'productsContainer4',
                showingAllProducts4
            );
            this.textContent = showingAllProducts4 ? 'Show Less' : 'View All Products';
        });
    } catch (error) {
        console.error('Error fetching explore products:', error);
    }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initCart();
    
    // Add to cart event delegation
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.id);
            const product = [...allProducts, ...allExploreProducts].find(p => p.id === productId);
            if (product) addToCart(product);
        }
    });
    
    // Fetch and display products for Flash Sales section
    fetch('https://fakestoreapi.com/products')
        .then(res => res.json())
        .then(products => {
            // Add mock stock quantity
            allProducts = products.map(product => ({
                ...product,
                stockQuantity: Math.floor(Math.random() * 100)
            }));
            
            // Display products in different sections
            displayProducts(allProducts.slice(0, 6), 'productsContainer', false);
            displayProducts(allProducts.slice(6, 12), 'productsContainer3', false);
            
            // Set up view all buttons
            let showingAllProducts = false;
            document.getElementById('viewAllBtn')?.addEventListener('click', function() {
                showingAllProducts = !showingAllProducts;
                displayProducts(
                    showingAllProducts ? allProducts : allProducts.slice(0, 6),
                    'productsContainer',
                    showingAllProducts
                );
                this.textContent = showingAllProducts ? 'Show Less' : 'View All Products';
            });
            
            let showingAllProducts3 = false;
            document.getElementById('viewAllBtn3')?.addEventListener('click', function() {
                showingAllProducts3 = !showingAllProducts3;
                displayProducts(
                    showingAllProducts3 ? allProducts : allProducts.slice(6, 12),
                    'productsContainer3',
                    showingAllProducts3
                );
                this.textContent = showingAllProducts3 ? 'Show Less' : 'View All';
            });
        })
        .catch(error => console.error('Error fetching products:', error));
    
    // Initialize categories section (without Shop Now buttons)
    fetchAndDisplayCategories();
    
    // Initialize explore products section
    fetchAndDisplayExploreProducts();
    
    // Set up arrow buttons for all sections
    document.getElementById('leftArrow')?.addEventListener('click', () => scrollProducts('left', 'productsContainer'));
    document.getElementById('rightArrow')?.addEventListener('click', () => scrollProducts('right', 'productsContainer'));
    document.getElementById('leftArrow2')?.addEventListener('click', () => scrollProducts('left', 'productsContainer2'));
    document.getElementById('rightArrow2')?.addEventListener('click', () => scrollProducts('right', 'productsContainer2'));
    document.getElementById('leftArrow3')?.addEventListener('click', () => scrollProducts('left', 'productsContainer3'));
    document.getElementById('rightArrow3')?.addEventListener('click', () => scrollProducts('right', 'productsContainer3'));
    document.getElementById('leftArrow4')?.addEventListener('click', () => scrollProducts('left', 'productsContainer4'));
    document.getElementById('rightArrow4')?.addEventListener('click', () => scrollProducts('right', 'productsContainer4'));
});

// Handle navigation links
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        // Only handle links that start with '/'
        if (this.getAttribute('href').startsWith('/')) {
            e.preventDefault();
            
            // Get the path from the href
            const path = this.getAttribute('href');
            
            // Use the router's navigateTo function
            navigateTo(path);
            
            // Update active state
            document.querySelectorAll('.nav-links a').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        }
    });
});

// Handle view all buttons
document.querySelectorAll('.view-all').forEach(button => {
    button.addEventListener('click', function() {
        navigateTo('/products');
    });
});

// Add event listeners to filters
document.addEventListener('DOMContentLoaded', function() {
    // Fetch products when page loads
    fetchProducts();
    
    // Add event listeners to filters
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('priceFilter').addEventListener('change', filterProducts);
    document.getElementById('sortBy').addEventListener('change', filterProducts);
    
    // Initialize cart
    updateCartCount();
    updateCartDisplay();
    
    // Initialize wishlist count
    updateWishlistCount();
});