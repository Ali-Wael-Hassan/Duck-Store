document.addEventListener('DOMContentLoaded', () => {
    // 1. THE MOCK DATABASE
    // This represents the data that would normally come from a server.
    const DATABASE = {
        inventory: [
            {
                id: "book-001",
                title: "The Midnight Library",
                author: "Matt Haig",
                format: "Hardcover",
                price: 18.99,
                image: "data:image/jpeg;base64,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"
            },
            {
                id: "book-002",
                title: "Project Hail Mary",
                author: "Andy Weir",
                format: "Special Edition",
                price: 24.50,
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlt9BOE_pKgLY_6kV3hxkM6b5fvf99adwYcQ&s"
            }
        ],
        settings: {
            taxRate: 0.08,
            shipping: 5.99,
            goldDiscount: 0.20
        }
    };

    // 2. STATE MANAGEMENT
    // We initialize our cart from LocalStorage (the browser's "mini database")
    // or default to 1 of each item if empty.
    let cart = JSON.parse(localStorage.getItem('lumina_cart')) || [
        { id: "book-001", quantity: 1 },
        { id: "book-002", quantity: 1 }
    ];

    // 3. SELECTORS
    const cartContainer = document.querySelector('.cart-items');
    const subtotalDisplay = document.querySelector('.summary-row dd:nth-child(2)');
    const taxDisplay = document.querySelectorAll('.summary-row dd')[2];
    const discountDisplay = document.querySelector('.discount-amount');
    const totalDisplay = document.querySelector('.total-price');

    // 4. FUNCTIONS
    const saveToLocalStorage = () => {
        localStorage.setItem('lumina_cart', JSON.stringify(cart));
    };

    const renderCart = () => {
        cartContainer.innerHTML = ''; // Clear current UI
        let subtotal = 0;

        cart.forEach(cartItem => {
            // Find book details in our "Database"
            const book = DATABASE.inventory.find(b => b.id === cartItem.id);
            if (!book) return;

            subtotal += book.price * cartItem.quantity;

            // Generate HTML based on Database data
            const itemHTML = `
                <article class="cart-item" data-id="${book.id}">
                    <img src="${book.image}" alt="${book.title}" class="item-thumbnail">
                    <div class="item-info">
                        <h2 class="item-title">${book.title}</h2>
                        <p class="item-meta">${book.author} • ${book.format}</p>
                        <p class="item-price">$${book.price.toFixed(2)}</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="qty-btn" data-action="decrease">-</button>
                        <span class="qty-value">${cartItem.quantity}</span>
                        <button class="qty-btn" data-action="increase">+</button>
                    </div>
                </article>
            `;
            cartContainer.insertAdjacentHTML('beforeend', itemHTML);
        });

        calculateTotals(subtotal);
    };

    const calculateTotals = (subtotal) => {
        const discount = subtotal * DATABASE.settings.goldDiscount;
        const tax = (subtotal - discount) * DATABASE.settings.taxRate;
        const total = (subtotal - discount) + tax + DATABASE.settings.shipping;

        subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
        discountDisplay.textContent = `-$${discount.toFixed(2)}`;
        taxDisplay.textContent = `$${tax.toFixed(2)}`;
        totalDisplay.textContent = `$${total.toFixed(2)}`;
    };

    // 5. EVENT LISTENERS
    cartContainer.addEventListener('click', (e) => {
        if (!e.target.classList.contains('qty-btn')) return;

        const id = e.target.closest('.cart-item').dataset.id;
        const action = e.target.dataset.action;
        const item = cart.find(i => i.id === id);

        if (action === 'increase') item.quantity++;
        if (action === 'decrease' && item.quantity > 1) item.quantity--;

        saveToLocalStorage();
        renderCart();
    });

    // Initial Load
    renderCart();
});