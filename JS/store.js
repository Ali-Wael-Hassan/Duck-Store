/**
 * DUCK Store - Core Logic
 * Optimized for Premium Marketplace Layout
 * COMPLIES WITH: camelCase, PascalCase, UPPER_SNAKE_CASE, const/let, arrow functions, guard clauses
 */

// Global Constants
const ANIMATION_DURATION_MS = 300;
const DEFAULT_MAX_PRICE = 100;
const DEFAULT_MIN_PRICE = 0;
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';

/**
 * Shopping Cart Management Class
 */
class ShoppingCart {
    constructor() {
        this.items = [];
    }

    /**
     * Adds a book to the shopping cart
     * @param {Object} bookData - The book information
     */
    addItem(bookData) {
        // Guard clause
        if (!bookData.title) {
            return;
        }

        this.items.push(bookData);
        this.updateCartUi();
        console.log(`Added to cart: ${bookData.title}`);
    }

    /**
     * Updates the cart UI with visual feedback
     */
    updateCartUi() {
        const cartIcon = document.querySelector('.header-actions .material-symbols-outlined:first-child');
        
        // Guard clause
        if (!cartIcon) {
            return;
        }

        cartIcon.style.color = 'var(--brand-primary)';
        
        setTimeout(() => {
            cartIcon.style.color = '';
        }, ANIMATION_DURATION_MS);
    }
}

/**
 * Handles image loading errors and shows placeholder
 * @param {HTMLElement} imgElement - The image element that failed to load
 */
const handleImageError = (imgElement) => {
    if (!imgElement) {
        return;
    }
    
    const container = imgElement.parentElement;
    const originalAlt = imgElement.getAttribute('alt') || 'Book cover';
    
    // Create placeholder element
    const placeholder = document.createElement('div');
    placeholder.className = 'book-card__image--placeholder';
    placeholder.innerHTML = `
        <span class="material-symbols-outlined" aria-hidden="true">menu_book</span>
        <span>${originalAlt.split(' by ')[0] || 'Book Cover'}</span>
    `;
    
    // Replace image with placeholder
    if (container) {
        imgElement.style.display = 'none';
        container.appendChild(placeholder);
    }
};

/**
 * Sets up image error handling for all book images
 */
const initializeImageErrorHandling = () => {
    const bookImages = document.querySelectorAll('.book-card__image');
    
    bookImages.forEach((img) => {
        img.addEventListener('error', () => {
            handleImageError(img);
        });
        
        // Also check if image already failed
        if (!img.complete && img.naturalWidth === 0) {
            handleImageError(img);
        }
    });
};

/**
 * Initializes all filter functionality
 */
const initializeFilters = () => {
    const priceSlider = document.querySelector('.price-range__slider');
    const priceMaxInput = document.querySelector('.price-range__max');
    const priceMinInput = document.querySelector('.price-range__min');
    const categoryCheckboxes = document.querySelectorAll('.filter-item__checkbox[data-category]');

    // Guard clause
    if (!priceSlider || !priceMaxInput) {
        return;
    }

    // Sync Slider with Number Input
    priceSlider.addEventListener('input', (event) => {
        const target = event.target;
        priceMaxInput.value = target.value;
        applyFilters();
    });

    priceMaxInput.addEventListener('change', (event) => {
        const target = event.target;
        const value = parseFloat(target.value);
        
        if (!isNaN(value) && value <= DEFAULT_MAX_PRICE) {
            priceSlider.value = target.value;
            applyFilters();
        }
    });

    if (priceMinInput) {
        priceMinInput.addEventListener('change', () => {
            applyFilters();
        });
    }

    // Category Toggles
    categoryCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', () => applyFilters());
    });
};

/**
 * Applies both category and price filters to book cards
 */
const applyFilters = () => {
    const activeCategories = getActiveCategories();
    const maxPriceValue = getMaxPriceValue();
    const minPriceValue = getMinPriceValue();
    const bookCards = document.querySelectorAll('.book-card');

    bookCards.forEach((card) => {
        const genreText = getGenreFromCard(card);
        const priceValue = getPriceFromCard(card);
        
        const isPriceMatch = isPriceInRange(priceValue, minPriceValue, maxPriceValue);
        const isCategoryMatch = isCategoryMatching(genreText, activeCategories);

        card.style.display = (isPriceMatch && isCategoryMatch) ? 'flex' : 'none';
    });
};

/**
 * Gets active categories from checked checkboxes
 * @returns {Array} Array of active category strings
 */
const getActiveCategories = () => {
    const checkedBoxes = document.querySelectorAll('.filter-item__checkbox[data-category]:checked');
    
    return Array.from(checkedBoxes).map((input) => {
        const category = input.getAttribute('data-category');
        return category ? category.toLowerCase() : '';
    }).filter(Boolean);
};

/**
 * Gets the max price value from the slider
 * @returns {number} Max price value
 */
const getMaxPriceValue = () => {
    const slider = document.querySelector('.price-range__slider');
    
    if (!slider) {
        return DEFAULT_MAX_PRICE;
    }
    
    return parseFloat(slider.value);
};

/**
 * Gets the min price value from the input
 * @returns {number} Min price value
 */
const getMinPriceValue = () => {
    const minInput = document.querySelector('.price-range__min');
    
    if (!minInput) {
        return DEFAULT_MIN_PRICE;
    }
    
    const value = parseFloat(minInput.value);
    return isNaN(value) ? DEFAULT_MIN_PRICE : value;
};

/**
 * Extracts genre text from a book card
 * @param {Element} card - The book card element
 * @returns {string} Genre text in lowercase
 */
const getGenreFromCard = (card) => {
    const genreElement = card.querySelector('.book-card__genre');
    
    if (!genreElement) {
        return '';
    }
    
    return genreElement.textContent.toLowerCase();
};

/**
 * Extracts price value from a book card
 * @param {Element} card - The book card element
 * @returns {number} Price value as number
 */
const getPriceFromCard = (card) => {
    const priceElement = card.querySelector('.price-value');
    
    if (!priceElement) {
        return 0;
    }
    
    const priceText = priceElement.textContent;
    const priceMatch = priceText.match(/[\d.]+/);
    
    return priceMatch ? parseFloat(priceMatch[0]) : 0;
};

/**
 * Checks if price is within the selected range
 * @param {number} price - Book price
 * @param {number} minPrice - Minimum price filter
 * @param {number} maxPrice - Maximum price filter
 * @returns {boolean} True if price is in range
 */
const isPriceInRange = (price, minPrice, maxPrice) => {
    return price >= minPrice && price <= maxPrice;
};

/**
 * Checks if genre matches any active category
 * @param {string} genreText - Book genre
 * @param {Array} activeCategories - Active category filters
 * @returns {boolean} True if genre matches any category
 */
const isCategoryMatching = (genreText, activeCategories) => {
    if (activeCategories.length === 0) {
        return true;
    }
    
    return activeCategories.some((category) => genreText.includes(category));
};

/**
 * Initializes search functionality
 */
const initializeSearch = () => {
    const searchInput = document.querySelector('.search-wrapper input');
    
    // Guard clause - search is optional
    if (!searchInput) {
        return;
    }

    searchInput.addEventListener('input', (event) => {
        const target = event.target;
        const query = target.value.toLowerCase();
        const bookCards = document.querySelectorAll('.book-card');

        bookCards.forEach((card) => {
            const title = getTitleFromCard(card);
            const author = getAuthorFromCard(card);
            
            const isMatch = title.includes(query) || author.includes(query);
            card.style.display = isMatch ? 'flex' : 'none';
        });
    });
};

/**
 * Extracts title from a book card
 * @param {Element} card - The book card element
 * @returns {string} Title text in lowercase
 */
const getTitleFromCard = (card) => {
    const titleElement = card.querySelector('.book-card__title');
    
    if (!titleElement) {
        return '';
    }
    
    return titleElement.textContent.toLowerCase();
};

/**
 * Extracts author from a book card
 * @param {Element} card - The book card element
 * @returns {string} Author text in lowercase
 */
const getAuthorFromCard = (card) => {
    const authorElement = card.querySelector('.book-card__author');
    
    if (!authorElement) {
        return '';
    }
    
    return authorElement.textContent.toLowerCase();
};

/**
 * Initializes shopping cart functionality
 */

const initializeCart = () => {
    const storeCart = new ShoppingCart();
    const cartButtons = document.querySelectorAll('.cart-btn');

    cartButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            const target = event.target;
            const card = target.closest('.book-card');
            
            // Guard clause
            if (!card) {
                return;
            }

            const bookInfo = {
                title: getTitleFromCard(card),
                price: getPriceFromCard(card),
                id: Date.now()
            };

            storeCart.addItem(bookInfo);
        });
    });
};

/**
 * Sets up additional event listeners
 */
const setupEventListeners = () => {
    const settingsBtn = document.getElementById('settings-button');
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            console.log('Settings opened');
        });
    }
};

/**
 * Initializes all modules when DOM is ready
 */
const initializeApp = () => {
    initializeFilters();
    initializeSearch();
    initializeCart();
    setupEventListeners();
    initializeImageErrorHandling();
};

// Start the application
document.addEventListener('DOMContentLoaded', initializeApp);