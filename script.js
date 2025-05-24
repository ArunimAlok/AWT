/**
 * E-commerce Script - Main Application
 * 
 * This script handles:
 * - Shopping cart functionality
 * - Dropdown menu interactions
 * - Product image gallery
 * - Order processing
 */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize cart from localStorage or create empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // ======================
    // CART MANAGEMENT SECTION
    // ======================

    /**
     * Updates the cart counter in the UI and saves cart to localStorage
     */
    function updateCartCounter() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = totalItems;
        });
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    /**
     * Changes quantity of a product in the cart
     * @param {string} productId - ID of the product to modify
     * @param {number} change - Amount to change (+1 or -1)
     */
    function changeQuantity(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }

    // ======================
    // PRODUCT UI CONTROLS SECTION
    // ======================

    /**
     * Replaces "Add to Cart" button with quantity controls
     * @param {HTMLElement} button - The button to replace
     * @param {string} productId - ID of the associated product
     */
    function replaceWithQuantityControls(button, productId) {
        const item = cart.find(item => item.id === productId);
        const quantity = item ? item.quantity : 1;

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'quantity-controls';
        controlsDiv.innerHTML = `
        <button class="btn btn-sm btn-outline-secondary decrement">-</button>
        <span class="quantity-display">${quantity}</span>
        <button class="btn btn-sm btn-outline-secondary increment">+</button>
    `;

        button.replaceWith(controlsDiv);

        // Increment button handler
        controlsDiv.querySelector('.increment').addEventListener('click', () => {
            changeQuantity(productId, 1);
            controlsDiv.querySelector('.quantity-display').textContent =
                cart.find(item => item.id === productId).quantity;
            updateCartCounter();
        });

        // Decrement button handler - fixed version
        controlsDiv.querySelector('.decrement').addEventListener('click', () => {
            const item = cart.find(item => item.id === productId);
            if (item) {
                if (item.quantity > 1) {
                    item.quantity -= 1;
                    controlsDiv.querySelector('.quantity-display').textContent = item.quantity;
                } else {
                    removeProductFromCart(productId, controlsDiv, button);
                }
                updateCartCounter();
            }
        });
    }

    /**
     * Removes product from cart and restores "Add to Cart" button
     * @param {string} productId - ID of product to remove
     * @param {HTMLElement} controlsDiv - Quantity controls element to replace
     * @param {HTMLElement} originalButton - Original button to restore
     */
    function removeProductFromCart(productId, controlsDiv, originalButton) {
        cart = cart.filter(item => item.id !== productId);
        const addButton = document.createElement(originalButton.tagName.toLowerCase());
        addButton.href = originalButton.tagName === 'A' ? '#' : undefined;
        addButton.className = originalButton.className;
        addButton.textContent = 'Add to Cart';
        if (originalButton.tagName === 'BUTTON') {
            addButton.type = 'button';
        }

        addButton.addEventListener('click', handleAddToCartClick);
        controlsDiv.replaceWith(addButton);
    }

    /**
     * Initializes quantity controls for products already in cart
     */
    function initializeQuantityControls() {
        cart.forEach(item => {
            document.querySelectorAll('.product-card').forEach(card => {
                const cardId = getProductIdFromCard(card);
                if (cardId === item.id) {
                    const addButton = card.querySelector('.add-to-cart');
                    if (addButton) {
                        replaceWithQuantityControls(addButton, item.id);
                    }
                }
            });

            if (item.id.startsWith(getCurrentPageProductId())) {
                const addButton = document.querySelector('.add-to-cart');
                if (addButton) {
                    replaceWithQuantityControls(addButton, item.id);
                }
            }
        });
    }

    // ======================
    // PRODUCT DATA HELPERS SECTION
    // ======================

    /**
     * Gets product ID from product card element
     * @param {HTMLElement} card - Product card element
     * @returns {string} Product ID
     */
    function getProductIdFromCard(card) {
        return card.querySelector('a.btn-primary')?.getAttribute('href')?.split('/').pop().replace('.html', '') ||
            card.querySelector('.card-title').textContent.toLowerCase().replace(/\s+/g, '-');
    }

    /**
     * Gets current page product ID from URL
     * @returns {string} Product ID
     */
    function getCurrentPageProductId() {
        return window.location.pathname.split('/').pop().replace('.html', '');
    }

    /**
     * Gets product data from product card or current page
     * @param {HTMLElement} element - Clicked element
     * @returns {object} Product data {id, name, price, image}
     */
    function getProductData(element) {
        const productCard = element.closest('.product-card') || element.closest('.product-container');
        let productData = {};

        if (element.closest('.product-card')) {
            productData = {
                id: getProductIdFromCard(productCard),
                name: productCard.querySelector('.card-title').textContent,
                price: parseFloat(productCard.querySelector('.text-success').textContent.replace(/[^0-9.]/g, '')),
                image: productCard.querySelector('.product-img').src
            };
        } else {
            const color = document.getElementById('color')?.value;
            const ram = document.getElementById('ram')?.value;
            const storage = document.getElementById('storage')?.value;

            if ((!color || !ram || !storage) && document.getElementById('color')) {
                alert('Please select all product options.');
                return null;
            }

            productData = {
                id: getCurrentPageProductId() +
                    (color ? '-' + color : '') +
                    (ram ? '-' + ram : '') +
                    (storage ? '-' + storage : ''),
                name: document.querySelector('h1, h2').textContent +
                    (color ? ' (' + document.getElementById('color').options[document.getElementById('color').selectedIndex].text + ')' : '') +
                    (ram ? ' ' + ram + 'GB RAM' : '') +
                    (storage ? ' ' + storage + 'GB' : ''),
                price: parseFloat(document.querySelector('.text-success').textContent.replace(/[^0-9.]/g, '')),
                image: document.getElementById('mainImage').src
            };
        }

        return productData;
    }

    // ======================
    // EVENT HANDLERS SECTION
    // ======================

    /**
     * Handles "Add to Cart" button clicks
     * @param {Event} e - Click event
     */
    function handleAddToCartClick(e) {
        if (e.target.tagName === 'A') e.preventDefault();

        const productData = getProductData(this);
        if (!productData) return;

        const existingItem = cart.find(item => item.id === productData.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productData.id,
                name: productData.name,
                price: productData.price,
                image: productData.image,
                quantity: 1
            });
        }

        updateCartCounter();
        replaceWithQuantityControls(this, productData.id);
    }

    /**
     * Handles "Buy Now" button clicks
     * @param {Event} e - Click event
     */
    function handleBuyNowClick(e) {
        const color = document.getElementById('color')?.value;
        const ram = document.getElementById('ram')?.value;
        const storage = document.getElementById('storage')?.value;

        if ((!color || !ram || !storage) && document.getElementById('color')) {
            alert('Please select all product options before buying.');
            return;
        }

        const productData = getProductData(this);
        if (!productData) return;

        const tempCart = [{
            id: productData.id,
            name: productData.name,
            price: productData.price,
            image: productData.image,
            quantity: 1
        }];

        showBillingModal(tempCart);
    }

    // ======================
    // DROPDOWN MENU SECTION
    // ======================

    /**
     * Sets up dropdown menu hover interactions
     */
    function setupDropdownHover() {
        const dropdowns = document.querySelectorAll('.dropdown');

        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');

            // Desktop behavior
            if (window.innerWidth >= 992) {
                // Show menu on hover
                dropdown.addEventListener('mouseenter', () => {
                    menu.style.display = 'block';
                    menu.classList.add('show');
                });

                // Hide menu only when leaving completely
                dropdown.addEventListener('mouseleave', (e) => {
                    const isMovingToMenu = e.relatedTarget?.closest('.dropdown-menu') === menu;
                    if (!isMovingToMenu) {
                        menu.style.display = 'none';
                        menu.classList.remove('show');
                    }
                });

                // Keep menu open when hovering items
                menu.addEventListener('mouseenter', () => {
                    menu.style.display = 'block';
                });

                menu.addEventListener('mouseleave', (e) => {
                    const isMovingToButton = e.relatedTarget === toggle;
                    if (!isMovingToButton) {
                        menu.style.display = 'none';
                        menu.classList.remove('show');
                    }
                });
            }
        });

        // Reset dropdowns on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 992) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.style.display = 'none';
                    menu.classList.remove('show');
                });
            }
        });
    }

    // ======================
    // IMAGE GALLERY SECTION
    // ======================

    /**
     * Sets up product image thumbnail interactions
     */
    function setupImageGallery() {
        if (!document.getElementById('mainImage')) return;

        document.querySelectorAll('.product-img-thumbnail').forEach(thumb => {
            thumb.addEventListener('click', function () {
                document.getElementById('mainImage').src = this.src;
            });
        });

        // Storage change handler for spec sheet
        if (document.getElementById('storage')) {
            document.getElementById('storage').addEventListener('change', function () {
                const specSheet = document.getElementById('specSheet');
                if (specSheet) {
                    specSheet.style.display = this.value ? 'block' : 'none';
                }
            });

            // Initialize spec sheet visibility
            if (document.getElementById('storage').value) {
                const specSheet = document.getElementById('specSheet');
                if (specSheet) {
                    specSheet.style.display = 'block';
                }
            }
        }
    }

    // ======================
    // ORDER PROCESSING SECTION
    // ======================

    /**
     * Shows billing modal with order summary
     * @param {Array} tempCart - Temporary cart items for this order
     */
    function showBillingModal(tempCart) {
        const modal = new bootstrap.Modal(document.getElementById('billingModal'));
        const orderSummary = document.getElementById('orderSummary');
        const orderTotal = document.getElementById('orderTotal');

        // Build order summary
        orderSummary.innerHTML = '';
        tempCart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'd-flex justify-content-between mb-2';
            itemElement.innerHTML = `
                <div>
                    <strong>${item.name}</strong>
                    <div class="text-muted small">Qty: ${item.quantity}</div>
                </div>
                <div>₹${(item.price * item.quantity).toFixed(2)}</div>
            `;
            orderSummary.appendChild(itemElement);
        });

        // Calculate and display total
        const total = tempCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        orderTotal.textContent = `₹${total.toFixed(2)}`;
        modal.show();

        // Reset form
        const form = document.getElementById('billingForm');
        form.classList.remove('was-validated');
        form.reset();

        // Clone form to clear validation state
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        // Form submission handler
        document.getElementById('billingForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const form = e.target;

            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

            processPayment().then(() => {
                // Add temp cart items to main cart if not already present
                tempCart.forEach(tempItem => {
                    const existingItem = cart.find(item => item.id === tempItem.id);
                    if (!existingItem) {
                        cart.push(tempItem);
                    }
                });

                updateCartCounter();
                modal.hide();

                // Show success message
                const orderId = 'ORD-' + Math.floor(Math.random() * 1000000);
                const customerName = document.getElementById('fullName').value;
                alert(`Order placed successfully!\n\nOrder ID: ${orderId}\nThank you, ${customerName}!`);

            }).catch(error => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Place Order';
                alert('Payment failed: ' + error.message);
            });
        });
    }

    /**
     * Simulates payment processing
     * @returns {Promise} Resolves on success, rejects on failure
     */
    function processPayment() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const isSuccess = Math.random() > 0.1;
                if (isSuccess) {
                    resolve();
                } else {
                    reject(new Error('Payment gateway timeout. Please try again.'));
                }
            }, 1500);
        });
    }

    // ======================
    // INITIALIZATION SECTION
    // ======================

    // Set up event listeners
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', handleAddToCartClick);
    });

    document.querySelectorAll('.buy-now').forEach(button => {
        button.addEventListener('click', handleBuyNowClick);
    });

    // Initialize components
    setupDropdownHover();
    setupImageGallery();
    updateCartCounter();
    initializeQuantityControls();
});