document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentUser = null;
    let cartItems = [];
    
    // DOM Elements
    const loginBtn = document.getElementById('login-btn');
    const cartBtn = document.getElementById('cart-btn');
    const cartCount = document.querySelector('.cart-count');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const productModal = document.getElementById('product-modal');
    const cartModal = document.getElementById('cart-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    const confirmationModal = document.getElementById('confirmation-modal');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const closeButtons = document.querySelectorAll('.close');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const checkoutForm = document.getElementById('checkout-form');
    const featuredProductsGrid = document.getElementById('featured-products');
    const productVariants = document.getElementById('product-variants');
    const relatedProductsGrid = document.getElementById('related-products');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const continueShoppingBtn = document.getElementById('continue-shopping');
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    const mpesaDetails = document.getElementById('mpesa-details');
    const cardDetails = document.getElementById('card-details');
    
    // Event Listeners
    loginBtn.addEventListener('click', openLoginModal);
    cartBtn.addEventListener('click', openCartModal);
    showRegister.addEventListener('click', showRegisterForm);
    showLogin.addEventListener('click', showLoginForm);
    closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    checkoutForm.addEventListener('submit', handleCheckout);
    checkoutBtn.addEventListener('click', openCheckoutModal);
    placeOrderBtn.addEventListener('click', placeOrder);
    continueShoppingBtn.addEventListener('click', continueShopping);
    paymentMethods.forEach(method => method.addEventListener('change', togglePaymentDetails));
    
    // Initialize
    loadFeaturedProducts();
    updateCartCount();
    
    // Functions
    
    function openLoginModal(e) {
        e.preventDefault();
        if (currentUser) {
            // If user is logged in, show profile options
            alert(`Logged in as ${currentUser.username}`);
        } else {
            loginModal.style.display = 'block';
        }
    }
    
    function openCartModal(e) {
        e.preventDefault();
        if (cartItems.length === 0) {
            alert('Your cart is empty');
            return;
        }
        renderCartItems();
        cartModal.style.display = 'block';
    }
    
    function showRegisterForm(e) {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
    }
    
    function showLoginForm(e) {
        e.preventDefault();
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
    }
    
    function closeModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.style.display = 'none');
    }
    
    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // In a real app, you would make an API call here
        // Simulating API call
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                currentUser = data.user;
                localStorage.setItem('token', data.token);
                alert('Login successful!');
                closeModal();
                updateCartCount();
            } else {
                alert('Login failed: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Login failed. Please try again.');
        });
    }
    
    function handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        // In a real app, you would make an API call here
        // Simulating API call
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'User registered successfully') {
                alert('Registration successful! Please login.');
                registerModal.style.display = 'none';
                loginModal.style.display = 'block';
            } else {
                alert('Registration failed: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Registration failed. Please try again.');
        });
    }
    
    function loadFeaturedProducts() {
        // In a real app, you would make an API call here
        // Simulating API call
        fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            featuredProductsGrid.innerHTML = '';
            products.slice(0, 6).forEach(product => {
                const productCard = createProductCard(product);
                featuredProductsGrid.appendChild(productCard);
            });
        })
        .catch(error => {
            console.error('Error loading products:', error);
        });
    }
    
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image_url || 'https://via.placeholder.com/300'}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="price">$${product.price.toFixed(2)}</div>
            </div>
        `;
        
        card.addEventListener('click', () => openProductModal(product));
        return card;
    }
    
    function openProductModal(product) {
        document.getElementById('modal-product-name').textContent = product.name;
        document.getElementById('modal-product-price').textContent = `$${product.price.toFixed(2)}`;
        document.getElementById('modal-product-description').textContent = product.description || 'No description available';
        document.getElementById('modal-product-image').src = product.image_url || 'https://via.placeholder.com/500';
        
        // Create variants (simulating different options)
        productVariants.innerHTML = '';
        if (product.category === 'shoes') {
            const sizes = ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'];
            const colors = ['Black', 'White', 'Red', 'Blue'];
            
            createVariantSection('Size', sizes);
            createVariantSection('Color', colors);
        } else {
            const sizes = ['S', 'M', 'L', 'XL'];
            const colors = ['Black', 'White', 'Red', 'Blue', 'Green'];
            
            createVariantSection('Size', sizes);
            createVariantSection('Color', colors);
        }
        
        // Set up add to cart button
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        addToCartBtn.onclick = () => addToCart(product);
        
        // Load related products
        loadRelatedProducts(product);
        
        productModal.style.display = 'block';
    }
    
    function createVariantSection(title, options) {
        const variantSection = document.createElement('div');
        variantSection.className = 'variant-section';
        variantSection.innerHTML = `
            <p class="variant-title">${title}</p>
            <div class="variant-options"></div>
        `;
        
        const optionsContainer = variantSection.querySelector('.variant-options');
        options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'variant-option';
            optionElement.textContent = option;
            optionElement.addEventListener('click', function() {
                document.querySelectorAll('.variant-option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
            });
            optionsContainer.appendChild(optionElement);
        });
        
        productVariants.appendChild(variantSection);
        
        // Select first option by default
        if (optionsContainer.firstChild) {
            optionsContainer.firstChild.classList.add('selected');
        }
    }
    
    function loadRelatedProducts(product) {
        // In a real app, you would make an API call here
        // Simulating API call
        fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            relatedProductsGrid.innerHTML = '';
            const related = products
                .filter(p => p.category === product.category && p.product_id !== product.product_id)
                .slice(0, 4);
            
            related.forEach(product => {
                const productCard = createProductCard(product);
                relatedProductsGrid.appendChild(productCard);
            });
        })
        .catch(error => {
            console.error('Error loading related products:', error);
        });
    }
    
    function addToCart(product) {
        const quantity = parseInt(document.getElementById('product-quantity').value) || 1;
        
        if (!currentUser) {
            alert('Please login to add items to cart');
            openLoginModal({ preventDefault: () => {} });
            return;
        }
        
        // In a real app, you would make an API call here
        // Simulating API call
        fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                product_id: product.product_id,
                quantity: quantity
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Product added to cart') {
                alert(`${product.name} added to cart`);
                updateCartCount();
                closeModal();
            } else {
                alert('Failed to add to cart: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to add to cart. Please try again.');
        });
    }
    
    function renderCartItems() {
        // In a real app, you would make an API call here
        // Simulating API call
        fetch('/api/cart', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(items => {
            cartItems = items;
            cartItemsContainer.innerHTML = '';
            
            if (items.length === 0) {
                cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
                return;
            }
            
            let total = 0;
            
            items.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.image_url || 'https://via.placeholder.com/100'}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" data-id="${item.cart_id}">-</button>
                            <input type="number" value="${item.quantity}" min="1" data-id="${item.cart_id}">
                            <button class="quantity-btn plus" data-id="${item.cart_id}">+</button>
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <span class="remove-item" data-id="${item.cart_id}">&times;</span>
                    </div>
                `;
                
                cartItemsContainer.appendChild(cartItem);
                total += item.price * item.quantity;
                
                // Add event listeners
                cartItem.querySelector('.minus').addEventListener('click', decreaseQuantity);
                cartItem.querySelector('.plus').addEventListener('click', increaseQuantity);
                cartItem.querySelector('input').addEventListener('change', updateQuantity);
                cartItem.querySelector('.remove-item').addEventListener('click', removeItem);
            });
            
            cartTotal.textContent = `$${total.toFixed(2)}`;
        })
        .catch(error => {
            console.error('Error loading cart:', error);
            cartItemsContainer.innerHTML = '<p>Error loading cart. Please try again.</p>';
        });
    }
    
    function decreaseQuantity(e) {
        const cartId = e.target.getAttribute('data-id');
        const input = document.querySelector(`input[data-id="${cartId}"]`);
        let quantity = parseInt(input.value) || 1;
        
        if (quantity > 1) {
            quantity--;
            input.value = quantity;
            updateCartItem(cartId, quantity);
        }
    }
    
    function increaseQuantity(e) {
        const cartId = e.target.getAttribute('data-id');
        const input = document.querySelector(`input[data-id="${cartId}"]`);
        let quantity = parseInt(input.value) || 1;
        
        quantity++;
        input.value = quantity;
        updateCartItem(cartId, quantity);
    }
    
    function updateQuantity(e) {
        const cartId = e.target.getAttribute('data-id');
        const quantity = parseInt(e.target.value) || 1;
        updateCartItem(cartId, quantity);
    }
    
    function updateCartItem(cartId, quantity) {
        // In a real app, you would make an API call here
        // Simulating API call
        fetch(`/api/cart/${cartId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ quantity })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Cart updated') {
                renderCartItems();
                updateCartCount();
            } else {
                alert('Failed to update cart: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to update cart. Please try again.');
        });
    }
    
    function removeItem(e) {
        const cartId = e.target.getAttribute('data-id');
        
        if (confirm('Are you sure you want to remove this item?')) {
            // In a real app, you would make an API call here
            // Simulating API call
            fetch(`/api/cart/${cartId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Item removed from cart') {
                    renderCartItems();
                    updateCartCount();
                } else {
                    alert('Failed to remove item: ' + (data.message || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to remove item. Please try again.');
            });
        }
    }
    
    function updateCartCount() {
        if (!currentUser) {
            cartCount.textContent = '0';
            return;
        }
        
        // In a real app, you would make an API call here
        // Simulating API call
        fetch('/api/cart', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(items => {
            const count = items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = count;
        })
        .catch(error => {
            console.error('Error updating cart count:', error);
        });
    }
    
    function openCheckoutModal() {
        cartModal.style.display = 'none';
        checkoutModal.style.display = 'block';
        
        // Pre-fill user details if logged in
        if (currentUser) {
            document.getElementById('checkout-name').value = currentUser.username;
            document.getElementById('checkout-email').value = currentUser.email;
        }
    }
    
    function togglePaymentDetails() {
        const selectedMethod = document.querySelector('input[name="payment"]:checked').value;
        
        if (selectedMethod === 'mpesa') {
            mpesaDetails.style.display = 'block';
            cardDetails.style.display = 'none';
        } else {
            mpesaDetails.style.display = 'none';
            cardDetails.style.display = 'block';
        }
    }
    
    function handleCheckout(e) {
        e.preventDefault();
        
        const name = document.getElementById('checkout-name').value;
        const email = document.getElementById('checkout-email').value;
        const address = document.getElementById('checkout-address').value;
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        
        // Validate form
        if (!name || !email || !address) {
            alert('Please fill in all required fields');
            return;
        }
        
        if ((paymentMethod === 'credit' || paymentMethod === 'debit') && 
            (!document.getElementById('card-number').value || 
             !document.getElementById('card-expiry').value || 
             !document.getElementById('card-cvc').value)) {
            alert('Please enter all card details');
            return;
        }
        
        placeOrder();
    }
    
    function placeOrder() {
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        
        // In a real app, you would make an API call here
        // Simulating API call
        fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                payment_method: paymentMethod
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Order placed successfully') {
                checkoutModal.style.display = 'none';
                document.getElementById('order-id').textContent = data.orderId;
                confirmationModal.style.display = 'block';
                
                // Update cart count
                cartCount.textContent = '0';
            } else {
                alert('Checkout failed: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Checkout failed. Please try again.');
        });
    }
    
    function continueShopping() {
        confirmationModal.style.display = 'none';
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        // In a real app, you would verify the token with the server
        // For demo purposes, we'll just parse it
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            currentUser = {
                user_id: decoded.userId,
                username: 'Demo User',
                email: 'user@example.com'
            };
            updateCartCount();
        } catch (error) {
            console.error('Error parsing token:', error);
            localStorage.removeItem('token');
        }
    }
});