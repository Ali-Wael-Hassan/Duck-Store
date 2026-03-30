// ============================================
// CHECKOUT PAGE JAVASCRIPT
// Following project coding rules STRICTLY:
// - const default, let when needed (no var)
// - UPPER_SNAKE_CASE for constants
// - camelCase for variables and functions
// - Strict equality (===)
// - Guard clauses (early returns)
// - Arrow functions for callbacks
// - async/await with try/catch
// ============================================

// Global constants (UPPER_SNAKE_CASE)
const PROCESSING_DELAY_MS = 1500;
const TOAST_DURATION_MS = 4000;

// DOM elements
const toastContainer = document.getElementById('toast-container');
const completePurchaseBtn = document.getElementById('complete-purchase-btn');

// Input elements
const firstNameInput = document.getElementById('first-name');
const lastNameInput = document.getElementById('last-name');
const streetAddressInput = document.getElementById('street-address');
const cityInput = document.getElementById('city');
const stateSelect = document.getElementById('state');
const zipCodeInput = document.getElementById('zip-code');
const cardNumberInput = document.getElementById('card-number');
const expiryDateInput = document.getElementById('expiry-date');
const cardholderNameInput = document.getElementById('cardholder-name');
const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
const creditCardFields = document.querySelector('.credit-card-fields');

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Shows a toast notification
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 * @param {string} type - 'success', 'error', or 'info'
 */
function showToast(title, message, type = 'info') {
    // Guard clause - early return if container doesn't exist
    if (!toastContainer) {
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');
    
    toast.innerHTML = `
        <div class="toast__title">${title}</div>
        <div class="toast__message">${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove toast after duration
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, TOAST_DURATION_MS);
}

/**
 * Adds error styling to an input
 * @param {HTMLElement} element - The input element
 */
function addErrorStyle(element) {
    // Guard clause
    if (!element) {
        return;
    }
    element.classList.add('form-input--error');
}

/**
 * Removes error styling from an input
 * @param {HTMLElement} element - The input element
 */
function removeErrorStyle(element) {
    // Guard clause
    if (!element) {
        return;
    }
    element.classList.remove('form-input--error');
}

/**
 * Validates the shipping address form
 * @returns {boolean} - True if valid
 */
function validateShippingAddress() {
    let isValid = true;
    
    // First name validation
    if (!firstNameInput?.value.trim()) {
        addErrorStyle(firstNameInput);
        isValid = false;
    } else {
        removeErrorStyle(firstNameInput);
    }
    
    // Last name validation
    if (!lastNameInput?.value.trim()) {
        addErrorStyle(lastNameInput);
        isValid = false;
    } else {
        removeErrorStyle(lastNameInput);
    }
    
    // Street address validation
    if (!streetAddressInput?.value.trim()) {
        addErrorStyle(streetAddressInput);
        isValid = false;
    } else {
        removeErrorStyle(streetAddressInput);
    }
    
    // City validation
    if (!cityInput?.value.trim()) {
        addErrorStyle(cityInput);
        isValid = false;
    } else {
        removeErrorStyle(cityInput);
    }
    
    // State validation
    if (!stateSelect?.value) {
        addErrorStyle(stateSelect);
        isValid = false;
    } else {
        removeErrorStyle(stateSelect);
    }
    
    // Zip code validation (5 digits)
    const zipPattern = /^\d{5}$/;
    if (!zipCodeInput?.value.trim() || !zipPattern.test(zipCodeInput.value.trim())) {
        addErrorStyle(zipCodeInput);
        isValid = false;
    } else {
        removeErrorStyle(zipCodeInput);
    }
    
    return isValid;
}

/**
 * Gets the selected payment method
 * @returns {string} - 'credit-card' or 'digital-wallet'
 */
function getSelectedPaymentMethod() {
    const selected = Array.from(paymentRadios).find((radio) => radio.checked);
    return selected ? selected.value : 'credit-card';
}

/**
 * Toggles credit card fields visibility based on payment method
 */
function toggleCreditCardFields() {
    // Guard clause
    if (!creditCardFields) {
        return;
    }
    
    const selectedMethod = getSelectedPaymentMethod();
    const isCreditCard = (selectedMethod === 'credit-card');
    creditCardFields.style.display = isCreditCard ? 'block' : 'none';
}

/**
 * Validates payment information
 * @returns {boolean} - True if valid
 */
function validatePaymentInfo() {
    const selectedMethod = getSelectedPaymentMethod();
    
    // Guard clause - digital wallet doesn't need validation
    if (selectedMethod === 'digital-wallet') {
        return true;
    }
    
    let isValid = true;
    
    // Card number validation (16 digits)
    const cardNumberRaw = cardNumberInput?.value.replace(/\s/g, '') || '';
    const cardPattern = /^\d{16}$/;
    
    if (!cardNumberRaw || !cardPattern.test(cardNumberRaw)) {
        addErrorStyle(cardNumberInput);
        isValid = false;
    } else {
        removeErrorStyle(cardNumberInput);
    }
    
    // Expiry date validation (MM/YY format)
    const expiryPattern = /^(0[1-9]|1[0-2])\/(2[4-9]|[3-9][0-9])$/;
    if (!expiryDateInput?.value || !expiryPattern.test(expiryDateInput.value)) {
        addErrorStyle(expiryDateInput);
        isValid = false;
    } else {
        removeErrorStyle(expiryDateInput);
    }
    
    // Cardholder name validation
    if (!cardholderNameInput?.value.trim()) {
        addErrorStyle(cardholderNameInput);
        isValid = false;
    } else {
        removeErrorStyle(cardholderNameInput);
    }
    
    return isValid;
}

/**
 * Formats card number with spaces every 4 digits
 * @param {string} value - Raw card number
 * @returns {string} - Formatted card number
 */
function formatCardNumber(value) {
    const cleaned = value.replace(/\s/g, '').replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
}

/**
 * Formats expiry date as MM/YY
 * @param {string} value - Raw input value
 * @returns {string} - Formatted expiry date
 */
function formatExpiryDate(value) {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
        return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
}

/**
 * Generates a random order ID
 * @returns {string} - Order ID
 */
function generateOrderId() {
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `ORD-${randomPart}`;
}

/**
 * Simulates order processing
 * @returns {Promise<Object>} - Order result
 */
function processOrder() {
    return new Promise((resolve) => {
        setTimeout(() => {
            const orderData = {
                orderId: generateOrderId(),
                total: 44.99,
                coinsEarned: 45,
                badgeUnlocked: 'Bookworm',
                timestamp: new Date().toISOString()
            };
            resolve(orderData);
        }, PROCESSING_DELAY_MS);
    });
}

/**
 * Saves order to localStorage and updates user rewards
 * @param {Object} orderData - Order information
 */
function saveOrderData(orderData) {
    // Guard clause - try/catch handles errors
    try {
        const existingOrders = JSON.parse(localStorage.getItem('checkout_orders') || '[]');
        existingOrders.push(orderData);
        localStorage.setItem('checkout_orders', JSON.stringify(existingOrders));
        
        const currentCoins = parseInt(localStorage.getItem('user_gold_coins') || '0', 10);
        const newCoins = currentCoins + orderData.coinsEarned;
        localStorage.setItem('user_gold_coins', newCoins.toString());
        
        const earnedBadges = JSON.parse(localStorage.getItem('user_badges') || '[]');
        if (!earnedBadges.includes(orderData.badgeUnlocked)) {
            earnedBadges.push(orderData.badgeUnlocked);
            localStorage.setItem('user_badges', JSON.stringify(earnedBadges));
        }
        
        const shippingInfo = {
            firstName: firstNameInput?.value || '',
            lastName: lastNameInput?.value || '',
            streetAddress: streetAddressInput?.value || '',
            city: cityInput?.value || '',
            state: stateSelect?.value || '',
            zipCode: zipCodeInput?.value || ''
        };
        localStorage.setItem('last_shipping_info', JSON.stringify(shippingInfo));
        
    } catch (error) {
        console.error('Failed to save order data:', error);
    }
}

/**
 * Handles the complete purchase action
 */
async function handleCompletePurchase() {
    // Guard clause - prevent double submission
    if (completePurchaseBtn.disabled) {
        return;
    }
    
    // Validate shipping address
    const isShippingValid = validateShippingAddress();
    if (!isShippingValid) {
        showToast('Shipping Error', 'Please complete all shipping address fields', 'error');
        return;
    }
    
    // Validate payment information
    const isPaymentValid = validatePaymentInfo();
    if (!isPaymentValid) {
        showToast('Payment Error', 'Please check your payment information', 'error');
        return;
    }
    
    // Show loading state
    completePurchaseBtn.disabled = true;
    completePurchaseBtn.classList.add('checkout-btn--loading');
    completePurchaseBtn.innerHTML = 'Processing...';
    
    try {
        const orderResult = await processOrder();
        saveOrderData(orderResult);
        
        showToast(
            'Purchase Successful! 🎉',
            `You earned ${orderResult.coinsEarned} Gold Coins and unlocked the "${orderResult.badgeUnlocked}" badge!`,
            'success'
        );
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'order-confirmation.html';
        }, 2000);
        
    } catch (error) {
        console.error('Purchase error:', error);
        showToast('Purchase Failed', 'There was an error processing your order. Please try again.', 'error');
        
        // Reset button state
        completePurchaseBtn.disabled = false;
        completePurchaseBtn.classList.remove('checkout-btn--loading');
        completePurchaseBtn.innerHTML = 'Complete Purchase <i class="fas fa-arrow-right" aria-hidden="true"></i>';
    }
}

/**
 * Sets up input formatting for card number and expiry date
 */
function setupInputFormatting() {
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (event) => {
            const formatted = formatCardNumber(event.target.value);
            event.target.value = formatted;
        });
    }
    
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', (event) => {
            const formatted = formatExpiryDate(event.target.value);
            event.target.value = formatted;
        });
    }
}

/**
 * Sets up real-time validation on blur events
 */
function setupValidationEvents() {
    const shippingInputs = [firstNameInput, lastNameInput, streetAddressInput, cityInput, zipCodeInput];
    
    shippingInputs.forEach((input) => {
        if (input) {
            input.addEventListener('blur', () => validateShippingAddress());
        }
    });
    
    if (stateSelect) {
        stateSelect.addEventListener('change', () => validateShippingAddress());
    }
    
    const paymentInputs = [cardNumberInput, expiryDateInput, cardholderNameInput];
    
    paymentInputs.forEach((input) => {
        if (input) {
            input.addEventListener('blur', () => validatePaymentInfo());
        }
    });
}

/**
 * Initializes the checkout page
 */
function initCheckout() {
    // Guard clause - check if we're on the checkout page
    if (!completePurchaseBtn) {
        return;
    }
    
    setupInputFormatting();
    setupValidationEvents();
    toggleCreditCardFields();
    
    // Payment method change listener
    paymentRadios.forEach((radio) => {
        radio.addEventListener('change', () => {
            toggleCreditCardFields();
            validatePaymentInfo();
        });
    });
    
    // Purchase button listener
    completePurchaseBtn.addEventListener('click', handleCompletePurchase);
    
    console.log('Checkout page initialized');
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initCheckout);