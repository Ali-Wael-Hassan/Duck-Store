/* Store UI Controller */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sort Popup Toggle
    const sortTrigger = document.getElementById('sort-trigger');
    const sortPopup = document.getElementById('sort-popup');

    if (sortTrigger && sortPopup) {
        sortTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            sortPopup.classList.toggle('active');
        });

        // Close popup when clicking outside
        document.addEventListener('click', () => {
            sortPopup.classList.remove('active');
        });
    }

    // 2. Price Slider Real-time Update
    const priceSlider = document.getElementById('price-slider');
    const priceLimitDisplay = document.getElementById('price-limit');
    const maxPriceInput = document.getElementById('max-price');

    if (priceSlider && priceLimitDisplay && maxPriceInput) {
        priceSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            priceLimitDisplay.textContent = val;
            maxPriceInput.value = val;
        });

        // Optional: Trigger search when slider stops moving
        priceSlider.addEventListener('change', () => {
            document.getElementById('filter-form').submit();
        });
    }

    // 3. Auto-submit filters on change
    // This makes it so users don't have to click a "Search" button
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.querySelectorAll('input[type="checkbox"], select').forEach(input => {
            input.addEventListener('change', () => {
                filterForm.submit();
            });
        });
    }
});