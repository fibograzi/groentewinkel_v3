// BioMarkt - JavaScript Functionality

// State Management
const state = {
    cart: [],
    products: [
        {
            id: 1,
            name: "Biologische Tomaten",
            price: 3.49,
            unit: "kg",
            origin: "Van Boer Janssen, Limburg",
            emoji: "🍅",
            category: "groenten",
            inStock: true
        },
        {
            id: 2,
            name: "Elstar Appels",
            price: 2.79,
            oldPrice: 3.49,
            unit: "kg",
            origin: "Van Boomgaard De Hof, Zeeland",
            emoji: "🍎",
            category: "fruit",
            inStock: true,
            discount: 20
        },
        {
            id: 3,
            name: "Verse Volle Melk",
            price: 1.89,
            unit: "liter",
            origin: "Van Zuivelboerderij Het Groene Hart",
            emoji: "🥛",
            category: "zuivel",
            inStock: true
        },
        {
            id: 4,
            name: "Volkoren Desembrood",
            price: 3.95,
            unit: "brood",
            origin: "Van Bakkerij De Korenmolen",
            emoji: "🍞",
            category: "brood",
            inStock: true
        }
    ]
};

// DOM Elements
const cartBtn = document.querySelector('.cart-btn');
const cartSidebar = document.getElementById('cartSidebar');
const cartClose = document.querySelector('.cart-close');
const cartItems = document.getElementById('cartItems');
const cartCount = document.querySelector('.cart-count');
const cartTotalPrice = document.querySelector('.cart-total-price');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('.nav-menu');
const addToCartButtons = document.querySelectorAll('.btn-add-cart');
const newsletterForm = document.querySelector('.newsletter-form');
const heroActions = document.querySelector('.hero-actions');
const searchBtn = document.querySelector('.search-btn');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadCartFromStorage();
    updateCartUI();
    animateOnScroll();
});

// Event Listeners
function initializeEventListeners() {
    // Cart toggle
    cartBtn.addEventListener('click', toggleCart);
    cartClose.addEventListener('click', closeCart);
    
    // Click outside cart to close
    document.addEventListener('click', (e) => {
        if (cartSidebar.classList.contains('active') && 
            !cartSidebar.contains(e.target) && 
            !cartBtn.contains(e.target)) {
            closeCart();
        }
    });
    
    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Add to cart buttons
    addToCartButtons.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            addToCart(state.products[index]);
        });
    });
    
    // Newsletter form
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // Hero buttons
    const discoverBtn = heroActions.querySelector('.btn-primary');
    const storyBtn = heroActions.querySelector('.btn-secondary');
    
    if (discoverBtn) {
        discoverBtn.addEventListener('click', () => {
            scrollToSection('#producten');
        });
    }
    
    if (storyBtn) {
        storyBtn.addEventListener('click', () => {
            scrollToSection('#over-ons');
        });
    }
    
    // Smooth scrolling for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });
    
    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
}

// Cart Functions
function toggleCart() {
    cartSidebar.classList.toggle('active');
}

function closeCart() {
    cartSidebar.classList.remove('active');
}

function addToCart(product) {
    const existingItem = state.cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        state.cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    updateCartUI();
    showNotification(`${product.name} toegevoegd aan winkelwagen`);
    
    // Add animation to cart button
    cartBtn.classList.add('bounce');
    setTimeout(() => cartBtn.classList.remove('bounce'), 300);
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartUI();
}

function updateQuantity(productId, newQuantity) {
    const item = state.cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            saveCartToStorage();
            updateCartUI();
        }
    }
}

function updateCartUI() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update cart count
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    
    // Update cart total
    cartTotalPrice.textContent = `€${totalPrice.toFixed(2)}`;
    
    // Update cart items
    if (state.cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Uw winkelwagen is leeg</p>';
    } else {
        cartItems.innerHTML = state.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image" style="display: flex; align-items: center; justify-content: center; font-size: 2rem; background: #E8F5E9;">${item.emoji || '🛒'}</div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">€${item.price.toFixed(2)} per ${item.unit}</p>
                    <div class="cart-item-quantity">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
            </div>
        `).join('');
    }
}

// Storage Functions
function saveCartToStorage() {
    localStorage.setItem('biomarkt-cart', JSON.stringify(state.cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('biomarkt-cart');
    if (savedCart) {
        state.cart = JSON.parse(savedCart);
    }
}

// Mobile Menu
function toggleMobileMenu() {
    navMenu.classList.toggle('mobile-active');
    mobileMenuBtn.classList.toggle('active');
}

// Newsletter
function handleNewsletterSubmit(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    showNotification('Bedankt voor uw aanmelding! U ontvangt binnenkort onze nieuwsbrief.');
    e.target.reset();
}

// Search
function handleSearch() {
    showNotification('Zoekfunctie komt binnenkort beschikbaar!');
}

// Smooth Scrolling
function handleSmoothScroll(e) {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href');
    scrollToSection(targetId);
}

function scrollToSection(targetId) {
    const targetSection = document.querySelector(targetId);
    if (targetSection) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = targetSection.offsetTop - navHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Scroll Animations
function animateOnScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    const elementsToAnimate = document.querySelectorAll(
        '.category-card, .product-card, .sustainability-card, .stat, .about-content > *'
    );
    
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}

// Add CSS for cart items and notifications
const style = document.createElement('style');
style.textContent = `
    .cart-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #E0E0E0;
    }
    
    .cart-item-image {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 8px;
    }
    
    .cart-item-details {
        flex: 1;
    }
    
    .cart-item-details h4 {
        font-size: 1rem;
        margin-bottom: 0.25rem;
    }
    
    .cart-item-price {
        font-size: 0.875rem;
        color: var(--text-light);
        margin-bottom: 0.5rem;
    }
    
    .cart-item-quantity {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .cart-item-quantity button {
        width: 24px;
        height: 24px;
        border: 1px solid #E0E0E0;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        transition: var(--transition);
    }
    
    .cart-item-quantity button:hover {
        background-color: var(--accent-green);
    }
    
    .cart-item-remove {
        background: none;
        border: none;
        font-size: 1.25rem;
        color: var(--text-light);
        cursor: pointer;
        transition: var(--transition);
    }
    
    .cart-item-remove:hover {
        color: #F44336;
    }
    
    .notification {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background-color: var(--primary-green);
        color: white;
        padding: 1rem 2rem;
        border-radius: var(--radius-md);
        box-shadow: 0 4px 12px var(--shadow);
        z-index: 2000;
        opacity: 0;
        transition: var(--transition);
    }
    
    .notification.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
    
    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    .bounce {
        animation: bounce 0.3s ease-in-out;
    }
    
    .nav-menu.mobile-active {
        display: flex;
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        background-color: white;
        flex-direction: column;
        padding: 1rem;
        box-shadow: 0 4px 12px var(--shadow);
        z-index: 999;
    }
    
    .mobile-menu-btn.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-menu-btn.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-btn.active span:nth-child(3) {
        transform: rotate(-45deg) translate(5px, -5px);
    }
`;

document.head.appendChild(style);