// Navigation bar functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize wishlist count
    updateWishlistCount();
    
    // Initialize cart count
    updateCartCount();
});

// Function to update wishlist count
function updateWishlistCount() {
    const wishlistCounts = document.querySelectorAll('#wishlistCount');
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    wishlistCounts.forEach(count => {
        count.textContent = wishlist.length;
    });
}

// Function to update cart count
function updateCartCount() {
    const cartCounts = document.querySelectorAll('#cartCount');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    cartCounts.forEach(count => {
        count.textContent = cart.length;
    });
}

// Function to toggle cart
window.toggleCart = function() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('active');
        
        // Add overlay when cart is open
        if (cartSidebar.classList.contains('active')) {
            const overlay = document.createElement('div');
            overlay.className = 'cart-overlay';
            overlay.onclick = toggleCart;
            document.body.appendChild(overlay);
        } else {
            const overlay = document.querySelector('.cart-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    }
} 