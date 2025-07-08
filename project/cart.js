console.clear();

// Function to get cart items from localStorage
function getCartItems() {
    try {
        const cartData = localStorage.getItem('cart');
        console.log('Raw cart data from localStorage:', cartData);
        if (cartData) {
            const cartItems = JSON.parse(cartData);
            console.log('Parsed cart items:', cartItems);
            return cartItems;
        }
    } catch (error) {
        console.error('Error getting cart items:', error);
    }
    console.log('No cart items found, returning empty array');
    return [];
}

// Update cart badge count
function updateCartBadge() {
    try {
        const cart = getCartItems();
        let count = 0;
        cart.forEach(item => {
            count += item.quantity || 1;
        });
        const badge = document.getElementById("badge");
        if (badge) {
            badge.textContent = count;
        }
    } catch (error) {
        console.error('Error updating cart badge:', error);
    }
}

// Function to update cart in localStorage
function updateCart(items) {
    try {
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(items));
        
        // Update badge
        updateCartBadge();
        
        // Update total items count
        const totalItem = document.getElementById("totalItem");
        if (totalItem) {
            let totalQuantity = 0;
            items.forEach(item => {
                totalQuantity += item.quantity || 1;
            });
            totalItem.textContent = `Total Items: ${totalQuantity}`;
        }
    } catch (error) {
        console.error('Error updating cart:', error);
    }
}

// Function to remove item from cart
function removeFromCart(itemId) {
    let items = getCartItems();
    items = items.filter(item => item.id !== itemId);
    updateCart(items);
    
    // Remove the item from the DOM
    const cartItem = document.querySelector(`[data-item-id="${itemId}"]`);
    if (cartItem) {
        cartItem.remove();
    }
    
    // If cart is empty, show empty cart message
    if (items.length === 0) {
        const cartContainer = document.getElementById('cartContainer');
        if (cartContainer) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h2>Your Cart is Empty</h2>
                    <p>Looks like you haven't added anything to your cart yet.</p>
                    <a href="index.html" class="continue-shopping">Continue Shopping</a>
                </div>
            `;
        }
    }
    
    // Update the total amount
    updateTotalAmount();
}

// Function to update item quantity
function updateQuantity(productId, change) {
    console.log(`Updating quantity for product ${productId} by ${change}`);
    let items = getCartItems();
    const itemIndex = items.findIndex(item => item.id === productId);
    
    if (itemIndex >= 0) {
        if (change === 0) {
            // Remove item completely
            items.splice(itemIndex, 1);
        } else {
            // Update quantity
            const newQty = (items[itemIndex].quantity || 1) + change;
            
            if (newQty <= 0) {
                // Remove item if quantity would be 0 or less
                items.splice(itemIndex, 1);
            } else {
                // Update quantity
                items[itemIndex].quantity = newQty;
            }
        }
        
        updateCart(items);
        
        // Update the displayed quantity and total
        const quantityElement = document.querySelector(`[data-item-id="${productId}"] .quantity`);
        if (quantityElement && itemIndex >= 0 && items[itemIndex]) {
            quantityElement.textContent = items[itemIndex].quantity;
            
            // Update the item total
            const priceElement = document.querySelector(`[data-item-id="${productId}"] .item-total`);
            if (priceElement) {
                priceElement.textContent = `Total: ₹${items[itemIndex].price * items[itemIndex].quantity}`;
            }
            
            // Update the overall total
            updateTotalAmount();
        } else {
            // If the item was removed, refresh the page
            location.reload();
        }
    }
}

// Function to calculate and update the total amount
function updateTotalAmount() {
    const items = getCartItems();
    let totalAmount = 0;
    
    items.forEach(item => {
        totalAmount += item.price * (item.quantity || 1);
    });
    
    const subtotalElement = document.querySelector('.summary-item .subtotal-value');
    const shippingElement = document.querySelector('.summary-item .shipping-value');
    const totalElement = document.querySelector('.summary-item.total .total-value');
    
    if (subtotalElement) {
        subtotalElement.textContent = `₹${totalAmount}`;
    }
    
    if (shippingElement) {
        shippingElement.textContent = totalAmount > 999 ? 'FREE' : '₹99';
    }
    
    if (totalElement) {
        totalElement.textContent = `₹${totalAmount > 999 ? totalAmount : totalAmount + 99}`;
    }
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart initialization started');
    
    // Get cart items from localStorage
    const cartItems = getCartItems();
    console.log('Cart items from localStorage:', cartItems);
    
    // Get cart container
    const cartContainer = document.getElementById('cartContainer');
    if (!cartContainer) {
        console.error('Cart container not found');
        return;
    }
    
    // Update total items count
    const totalItem = document.getElementById("totalItem");
    if (totalItem) {
        // Calculate total quantity of items
        let totalQuantity = 0;
        cartItems.forEach(item => {
            totalQuantity += item.quantity || 1;
        });
        totalItem.textContent = `Total Items: ${totalQuantity}`;
    }
    
    // If cart is empty
    if (!cartItems || cartItems.length === 0) {
        const emptyCartMessage = document.createElement('div');
        emptyCartMessage.className = 'empty-cart';
        emptyCartMessage.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <a href="index.html" class="continue-shopping">Continue Shopping</a>
        `;
        
        cartContainer.innerHTML = '';
        cartContainer.appendChild(emptyCartMessage);
    } else {
        console.log('Rendering cart with items:', cartItems);
        
        // Create cart wrapper
        const cartWrapper = document.createElement('div');
        cartWrapper.className = 'cart-wrapper';
        
        // Create cart content
        const cartContent = document.createElement('div');
        cartContent.className = 'cart-content';
        
        // Create cart summary
        const cartSummary = document.createElement('div');
        cartSummary.className = 'cart-summary';
        
        let totalAmount = 0;
        
        // Add each cart item to the cart content
        cartItems.forEach(item => {
            console.log('Rendering cart item:', item);
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.setAttribute('data-item-id', item.id);
            
            const quantity = item.quantity || 1;
            const itemTotal = item.price * quantity;
            totalAmount += itemTotal;
            
            cartItemElement.innerHTML = `
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <div class="item-info">
                        <div class="quantity-controls">
                            <button class="qty-btn minus" onclick="updateQuantity('${item.id}', -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity">${quantity}</span>
                            <button class="qty-btn plus" onclick="updateQuantity('${item.id}', 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <p class="price">Price: ₹${item.price}</p>
                        <p class="price item-total">Total: ₹${itemTotal}</p>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                        <span>Remove</span>
                    </button>
                </div>
            `;
            
            cartContent.appendChild(cartItemElement);
        });
        
        console.log('Total amount calculated:', totalAmount);
        
        // Set cart summary content
        cartSummary.innerHTML = `
            <h3>Order Summary</h3>
            <div class="summary-item">
                <span>Subtotal</span>
                <span class="subtotal-value">₹${totalAmount}</span>
            </div>
            <div class="summary-item">
                <span>Shipping</span>
                <span class="shipping-value">${totalAmount > 999 ? 'FREE' : '₹99'}</span>
            </div>
            <div class="summary-item total">
                <span>Total</span>
                <span class="total-value">₹${totalAmount > 999 ? totalAmount : totalAmount + 99}</span>
            </div>
            <button id="checkout-btn">Proceed to Checkout</button>
        `;
        
        // Add cart sections to page
        cartContainer.innerHTML = '';
        cartWrapper.appendChild(cartContent);
        cartWrapper.appendChild(cartSummary);
        cartContainer.appendChild(cartWrapper);
        
        // Add event listener to checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                alert('Thank you for your order! This is a demo, so no actual purchase will be made.');
            });
        }
    }
});

// Add CSS styles
const styles = document.createElement('style');
styles.textContent = `
    .cart-wrapper {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 30px;
    }
    
    .cart-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .cart-item {
        display: flex;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
    }
    
    .cart-item:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .cart-summary {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        height: fit-content;
        position: sticky;
        top: 20px;
    }
    
    .cart-summary h3 {
        margin-top: 0;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
        color: #333;
    }
    
    .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        color: #555;
    }
    
    .summary-item.total {
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid #eee;
        font-weight: bold;
        font-size: 18px;
        color: #333;
    }
    
    #checkout-btn {
        width: 100%;
        padding: 12px;
        margin-top: 20px;
        background: #1e88e5;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        transition: background 0.3s;
    }
    
    #checkout-btn:hover {
        background: #1565c0;
    }
    
    .item-image {
        width: 180px;
        height: auto;
        overflow: hidden;
    }
    
    .item-image img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .item-details {
        padding: 20px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    
    .item-details h3 {
        margin: 0 0 10px;
        font-size: 18px;
        color: #333;
    }
    
    .brand {
        color: #666;
        margin-bottom: 10px;
        font-size: 14px;
    }
    
    .item-info {
        margin: 10px 0;
    }
    
    .quantity, .price {
        margin-bottom: 8px;
        font-size: 15px;
        color: #444;
    }
    
    .remove-btn {
        background: #ff4444;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        width: fit-content;
        transition: background 0.3s;
    }
    
    .remove-btn:hover {
        background: #cc0000;
    }
    
    .remove-btn i {
        font-size: 14px;
    }
    
    .empty-cart {
        text-align: center;
        padding: 40px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        grid-column: 1 / -1;
    }
    
    .empty-cart i {
        font-size: 48px;
        color: #ccc;
        margin-bottom: 20px;
    }
    
    .empty-cart h2 {
        margin-bottom: 10px;
    }
    
    .empty-cart p {
        color: #666;
        margin-bottom: 20px;
    }
    
    .continue-shopping {
        display: inline-block;
        padding: 10px 20px;
        background: #1e88e5;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        transition: background 0.3s;
    }
    
    .continue-shopping:hover {
        background: #1565c0;
    }
    
    .error-message {
        text-align: center;
        padding: 40px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .error-message i {
        font-size: 48px;
        color: #ff4444;
        margin-bottom: 20px;
    }
    
    .error-message h2 {
        margin-bottom: 10px;
        color: #333;
    }
    
    .error-message p {
        color: #666;
        margin-bottom: 20px;
    }
    
    .error-message button {
        padding: 10px 20px;
        background: #1e88e5;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.3s;
    }
    
    .error-message button:hover {
        background: #1565c0;
    }
    
    @media (max-width: 768px) {
        .cart-wrapper {
            grid-template-columns: 1fr;
            padding: 10px;
        }
        
        .cart-item {
            flex-direction: column;
        }
        
        .item-image {
            width: 100%;
            height: 200px;
        }
        
        .item-image img {
            height: 100%;
        }
        
        .item-details {
            padding: 15px;
        }
        
        .remove-btn {
            width: 100%;
            justify-content: center;
            padding: 12px;
            margin-top: 15px;
        }
        
        .remove-btn i {
            font-size: 18px;
        }
        
        .remove-btn span {
            font-size: 16px;
        }
    }
    
    @media (max-width: 480px) {
        .cart-item {
            margin-bottom: 15px;
        }
        
        .item-details h3 {
            font-size: 16px;
        }
        
        .brand {
            font-size: 13px;
        }
        
        .quantity, .price {
            font-size: 14px;
        }
        
        .remove-btn {
            padding: 10px;
        }
    }
    
    .quantity-controls {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
        background: #f8f9fa;
        padding: 8px;
        border-radius: 4px;
        width: fit-content;
    }
    
    .qty-btn {
        background: white;
        border: 1px solid #ddd;
        color: #333;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .qty-btn:hover {
        background: #1e88e5;
        border-color: #1e88e5;
        color: white;
    }
    
    .qty-btn:active {
        transform: scale(0.95);
    }
    
    .qty-btn.minus {
        border-color: #ff4444;
        color: #ff4444;
    }
    
    .qty-btn.minus:hover {
        background: #ff4444;
        border-color: #ff4444;
        color: white;
    }
    
    .qty-btn.plus {
        border-color: #00C851;
        color: #00C851;
    }
    
    .qty-btn.plus:hover {
        background: #00C851;
        border-color: #00C851;
        color: white;
    }
    
    .quantity {
        font-size: 16px;
        font-weight: 600;
        min-width: 24px;
        text-align: center;
    }
    
    @media (max-width: 768px) {
        .quantity-controls {
            width: 100%;
            justify-content: center;
            margin: 15px 0;
        }
        
        .qty-btn {
            width: 40px;
            height: 40px;
        }
        
        .quantity {
            font-size: 18px;
            min-width: 30px;
        }
    }
`;

document.head.appendChild(styles);