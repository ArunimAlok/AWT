document.addEventListener('DOMContentLoaded', function() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    function updateCartCounter() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = totalItems;
        });
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    // Add to cart functionality
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-card') || this.closest('.product-container');
            
            let productId, productName, productPrice, productImg;
            
            if (this.closest('.product-card')) {
                productId = productCard.querySelector('a.btn-primary')?.getAttribute('href')?.split('/').pop().replace('.html', '') || 
                           productCard.querySelector('.card-title').textContent.toLowerCase().replace(/\s+/g, '-');
                productName = productCard.querySelector('.card-title').textContent;
                productPrice = parseFloat(productCard.querySelector('.text-success').textContent.replace(/[^0-9.]/g, ''));
                productImg = productCard.querySelector('.product-img').src;
            } else {
                const color = document.getElementById('color')?.value;
                const ram = document.getElementById('ram')?.value;
                const storage = document.getElementById('storage')?.value;
                
                if ((!color || !ram || !storage) && document.getElementById('color')) {
                    alert('Please select all product options.');
                    return;
                }
                
                productId = window.location.pathname.split('/').pop().replace('.html', '') + 
                           (color ? '-' + color : '') + 
                           (ram ? '-' + ram : '') + 
                           (storage ? '-' + storage : '');
                productName = document.querySelector('h1, h2').textContent + 
                             (color ? ' (' + document.getElementById('color').options[document.getElementById('color').selectedIndex].text + ')' : '') +
                             (ram ? ' ' + ram + 'GB RAM' : '') +
                             (storage ? ' ' + storage + 'GB' : '');
                productPrice = parseFloat(document.querySelector('.text-success').textContent.replace(/[^0-9.]/g, ''));
                productImg = document.getElementById('mainImage').src;
            }
            
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImg,
                    quantity: 1
                });
            }
            
            updateCartCounter();
            replaceWithQuantityControls(this, productId);
        });
    });
    
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
        
        controlsDiv.querySelector('.increment').addEventListener('click', () => {
            changeQuantity(productId, 1);
            controlsDiv.querySelector('.quantity-display').textContent = 
                cart.find(item => item.id === productId).quantity;
            updateCartCounter();
        });
        
        controlsDiv.querySelector('.decrement').addEventListener('click', () => {
            const item = cart.find(item => item.id === productId);
            if (item.quantity > 1) {
                changeQuantity(productId, -1);
                controlsDiv.querySelector('.quantity-display').textContent = item.quantity - 1;
            } else {
                cart = cart.filter(item => item.id !== productId);
                const addButton = document.createElement(button.tagName.toLowerCase());
                addButton.href = button.tagName === 'A' ? '#' : undefined;
                addButton.className = button.className;
                addButton.textContent = 'Add to Cart';
                if (button.tagName === 'BUTTON') {
                    addButton.type = 'button';
                }
                addButton.addEventListener('click', function(e) {
                    if (button.tagName === 'A') e.preventDefault();
                    const productCard = this.closest('.product-card') || this.closest('.product-container');
                    
                    let productId, productName, productPrice, productImg;
                    
                    if (this.closest('.product-card')) {
                        productId = productCard.querySelector('a.btn-primary')?.getAttribute('href')?.split('/').pop().replace('.html', '') || 
                                   productCard.querySelector('.card-title').textContent.toLowerCase().replace(/\s+/g, '-');
                        productName = productCard.querySelector('.card-title').textContent;
                        productPrice = parseFloat(productCard.querySelector('.text-success').textContent.replace(/[^0-9.]/g, ''));
                        productImg = productCard.querySelector('.product-img').src;
                    } else {
                        const color = document.getElementById('color')?.value;
                        const ram = document.getElementById('ram')?.value;
                        const storage = document.getElementById('storage')?.value;
                        
                        if ((!color || !ram || !storage) && document.getElementById('color')) {
                            alert('Please select all product options.');
                            return;
                        }
                        
                        productId = window.location.pathname.split('/').pop().replace('.html', '') + 
                                   (color ? '-' + color : '') + 
                                   (ram ? '-' + ram : '') + 
                                   (storage ? '-' + storage : '');
                        productName = document.querySelector('h1, h2').textContent + 
                                     (color ? ' (' + document.getElementById('color').options[document.getElementById('color').selectedIndex].text + ')' : '') +
                                     (ram ? ' ' + ram + 'GB RAM' : '') +
                                     (storage ? ' ' + storage + 'GB' : '');
                        productPrice = parseFloat(document.querySelector('.text-success').textContent.replace(/[^0-9.]/g, ''));
                        productImg = document.getElementById('mainImage').src;
                    }
                    
                    cart.push({
                        id: productId,
                        name: productName,
                        price: productPrice,
                        image: productImg,
                        quantity: 1
                    });
                    
                    updateCartCounter();
                    replaceWithQuantityControls(this, productId);
                });
                controlsDiv.replaceWith(addButton);
            }
            updateCartCounter();
        });
    }
    
    function changeQuantity(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }
    
    function initializeQuantityControls() {
        cart.forEach(item => {
            document.querySelectorAll('.product-card').forEach(card => {
                const cardId = card.querySelector('a.btn-primary')?.getAttribute('href')?.split('/').pop().replace('.html', '') || 
                              card.querySelector('.card-title').textContent.toLowerCase().replace(/\s+/g, '-');
                if (cardId === item.id) {
                    const addButton = card.querySelector('.add-to-cart');
                    if (addButton) {
                        replaceWithQuantityControls(addButton, item.id);
                    }
                }
            });
            
            if (item.id.startsWith(window.location.pathname.split('/').pop().replace('.html', ''))) {
                const addButton = document.querySelector('.add-to-cart');
                if (addButton) {
                    replaceWithQuantityControls(addButton, item.id);
                }
            }
        });
    }
    
    if (document.getElementById('mainImage')) {
        document.querySelectorAll('.product-img-thumbnail').forEach(thumb => {
            thumb.addEventListener('click', function() {
                document.getElementById('mainImage').src = this.src;
            });
        });
        
        if (document.getElementById('storage')) {
            document.getElementById('storage').addEventListener('change', function() {
                const specSheet = document.getElementById('specSheet');
                if (specSheet) {
                    specSheet.style.display = this.value ? 'block' : 'none';
                }
            });
            
            if (document.getElementById('storage').value) {
                const specSheet = document.getElementById('specSheet');
                if (specSheet) {
                    specSheet.style.display = 'block';
                }
            }
        }
    }
    
    document.querySelectorAll('.buy-now').forEach(button => {
        button.addEventListener('click', function() {
            const color = document.getElementById('color')?.value;
            const ram = document.getElementById('ram')?.value;
            const storage = document.getElementById('storage')?.value;
            
            if ((!color || !ram || !storage) && document.getElementById('color')) {
                alert('Please select all product options before buying.');
                return;
            }
            
            const tempCart = [];
            const productId = window.location.pathname.split('/').pop().replace('.html', '') + 
                             (color ? '-' + color : '') + 
                             (ram ? '-' + ram : '') + 
                             (storage ? '-' + storage : '');
            
            const productName = document.querySelector('h1, h2').textContent + 
                              (color ? ' (' + document.getElementById('color').options[document.getElementById('color').selectedIndex].text + ')' : '') +
                              (ram ? ' ' + ram + 'GB RAM' : '') +
                              (storage ? ' ' + storage + 'GB' : '');
            
            const productPrice = parseFloat(document.querySelector('.text-success').textContent.replace(/[^0-9.]/g, ''));
            const productImg = document.getElementById('mainImage').src;
            
            tempCart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImg,
                quantity: 1
            });
            
            showBillingModal(tempCart);
        });
    });
    
    function showBillingModal(tempCart) {
        const modal = new bootstrap.Modal(document.getElementById('billingModal'));
        const orderSummary = document.getElementById('orderSummary');
        const orderTotal = document.getElementById('orderTotal');
        
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
        
        const total = tempCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        orderTotal.textContent = `₹${total.toFixed(2)}`;
        modal.show();
        
        const form = document.getElementById('billingForm');
        form.classList.remove('was-validated');
        form.reset();
        
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        document.getElementById('billingForm').addEventListener('submit', function(e) {
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
                tempCart.forEach(tempItem => {
                    const existingItem = cart.find(item => item.id === tempItem.id);
                    if (!existingItem) {
                        cart.push(tempItem);
                    }
                });
                
                updateCartCounter();
                modal.hide();
                
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
    
    updateCartCounter();
    initializeQuantityControls();
});