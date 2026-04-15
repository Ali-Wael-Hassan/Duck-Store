import { StorageManager } from '../core/StorageManager.js';

export class StorePage {
    constructor() {
        this.allBooks = StorageManager.get("books") || [];
        
        this.highestBookPrice = this.allBooks.length > 0 
            ? Math.max(...this.allBooks.map(b => this.parsePrice(b.price))) 
            : 1000;

        this.filteredBooks = [...this.allBooks];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentSort = 'popularity';
        
        this.init();
    }

    parsePrice(priceStr) {
        if (typeof priceStr === 'number') return priceStr;
        return parseFloat(priceStr.replace(/[$,]/g, '')) || 0;
    }

    init() {
        this.renderFilters();
        this.applyURLQueries(); 
        this.handleFilters(false); 
        this.renderCatalog();
        this.setupEventListeners();
    }

    applyURLQueries() {
        const params = new URLSearchParams(window.location.search);
        
        const categoryParam = params.get('category');
        if (categoryParam) {
            const requestedGenres = categoryParam.toLowerCase().split(',');
            
            document.querySelectorAll('.filter-item__checkbox').forEach(cb => {
                const cbCategory = cb.dataset.category.toLowerCase();
                if (requestedGenres.includes(cbCategory) || 
                    (cbCategory.includes('science') && requestedGenres.includes('scifi'))) {
                    cb.checked = true;
                }
            });
        }

        const minP = params.get('minPrice');
        const maxP = params.get('maxPrice');
        if (minP) document.getElementById('min-price').value = minP;
        if (maxP) {
            document.getElementById('max-price').value = maxP;
            const slider = document.getElementById('price-slider');
            if (slider) slider.value = maxP;
            const display = document.getElementById('price-limit');
            if (display) display.textContent = maxP;
        }

        const sortParam = params.get('sort');
        if (sortParam) this.currentSort = sortParam;
    }

    updateURL() {
        const params = new URLSearchParams();
        
        const activeGenres = Array.from(document.querySelectorAll('.filter-item__checkbox:checked'))
            .map(cb => cb.dataset.category);
            
        if (activeGenres.length > 0) params.set('category', activeGenres.join(','));

        const minP = document.getElementById('min-price').value;
        const maxP = document.getElementById('max-price').value;
        if (minP && minP > 0) params.set('minPrice', minP);
        if (maxP && maxP < this.highestBookPrice) params.set('maxPrice', maxP);

        if (this.currentSort !== 'popularity') params.set('sort', this.currentSort);

        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        history.pushState(null, '', newUrl);
    }

    renderFilters() {
        const container = document.getElementById('filters-container');
        if (!container) return;

        const genres = [...new Set(this.allBooks.map(b => b.genre))];

        container.innerHTML = `
            <div class="filter-group">
                <h3 class="filter-group__title"><span class="material-symbols-outlined">category</span>CATEGORIES</h3>
                <div id="genre-filters">
                    ${genres.map(genre => `
                        <label class="filter-item">
                            <input type="checkbox" class="filter-item__checkbox" data-category="${genre.toLowerCase()}">
                            <span class="filter-item__label">${genre}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div class="filter-group">
                <h3 class="filter-group__title"><span class="material-symbols-outlined">payments</span>PRICE RANGE</h3>
                <div class="price-inputs">
                    <input type="number" id="min-price" placeholder="Min $" min="0">
                    <span>to</span>
                    <input type="number" id="max-price" value="${this.highestBookPrice}" min="0">
                </div>
                <div class="price-range">
                    <input type="range" class="price-range__slider" id="price-slider" 
                           min="0" max="${this.highestBookPrice}" value="${this.highestBookPrice}">
                    <div class="price-range__display">Max: <strong>$<span id="price-limit">${this.highestBookPrice}</span></strong></div>
                </div>
            </div>
        `;
    }

    handleFilters(shouldUpdateURL = true) {
        const activeGenres = Array.from(document.querySelectorAll('.filter-item__checkbox:checked'))
            .map(cb => cb.dataset.category.toLowerCase());
        
        const minVal = parseInt(document.getElementById('min-price')?.value) || 0;
        const maxVal = parseInt(document.getElementById('max-price')?.value) || this.highestBookPrice;

        this.filteredBooks = this.allBooks.filter(book => {
            const bookPrice = this.parsePrice(book.price);
            const bookGenre = book.genre.toLowerCase();
            
            const genreMatch = activeGenres.length === 0 || 
                               activeGenres.includes(bookGenre) ||
                               (bookGenre.includes('science') && activeGenres.includes('scifi'));
            
            const priceMatch = bookPrice >= minVal && bookPrice <= maxVal;
            return genreMatch && priceMatch;
        });

        if (shouldUpdateURL) this.updateURL();

        this.currentPage = 1;
        this.renderCatalog();
    }

    renderCatalog() {
        const grid = document.getElementById('book-grid');
        const meta = document.getElementById('catalog-meta');
        if (!grid || !meta) return;

        this.applySorting();

        const total = this.filteredBooks.length;
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = Math.min(this.currentPage * this.itemsPerPage, total);
        const pageItems = this.filteredBooks.slice(start, start + this.itemsPerPage);

        meta.innerHTML = `
            <span class="results-meta">Showing <strong>${total === 0 ? 0 : start + 1}-${end}</strong> of <strong>${total}</strong></span>
            <div class="sort-by-container">
                <div class="sort-by" id="sort-trigger">
                    <span>Sort by:</span> <strong id="current-sort-label">${this.getSortLabel()}</strong>
                    <span class="material-symbols-outlined">expand_more</span>
                </div>
                <div class="sort-popup" id="sort-popup">
                    <div class="sort-option" data-sort="popularity">Popularity</div>
                    <div class="sort-option" data-sort="price-low">Price: Low to High</div>
                    <div class="sort-option" data-sort="price-high">Price: High to Low</div>
                    <div class="sort-option" data-sort="title">Title (A-Z)</div>
                </div>
            </div>
        `;

        grid.innerHTML = pageItems.map(book => this.createBookCard(book)).join('');
        this.renderPagination(total);
    }

    applySorting() {
        this.filteredBooks.sort((a, b) => {
            const priceA = this.parsePrice(a.price);
            const priceB = this.parsePrice(b.price);
            switch (this.currentSort) {
                case 'price-low': return priceA - priceB;
                case 'price-high': return priceB - priceA;
                case 'title': return a.title.localeCompare(b.title);
                default: return (b.rating || 0) - (a.rating || 0);
            }
        });
    }

    getSortLabel() {
        const labels = { 'popularity': 'Popularity', 'price-low': 'Price: Low', 'price-high': 'Price: High', 'title': 'A-Z' };
        return labels[this.currentSort];
    }

    createBookCard(book) {
        const targetUrl = `book-view.html?id=${book.id}`;
        const displayPrice = typeof book.price === 'string' && book.price.includes('$') 
            ? book.price 
            : `$${book.price.toLocaleString()}`;

        return `
            <a href="${targetUrl}" class="book-card-link" style="text-decoration:none; color:inherit;">
                <article class="book-card">
                    <div class="book-card__image-container">
                        <img src="${book.img}" alt="${book.title}" class="book-card__image" 
                             onerror="this.src='https://via.placeholder.com/150?text=No+Cover'">
                    </div>
                    <div class="book-card__body">
                        <p class="book-card__genre">${book.genre}</p>
                        <h4 class="book-card__title">${book.title}</h4>
                        <div class="book-card__footer">
                            <span class="price-value">${displayPrice}</span>
                        </div>
                    </div>
                </article>
            </a>`;
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const popup = document.getElementById('sort-popup');
            const trigger = e.target.closest('#sort-trigger');
            if (trigger) popup.classList.toggle('active');
            else if (e.target.classList.contains('sort-option')) {
                this.currentSort = e.target.dataset.sort;
                popup.classList.remove('active');
                this.handleFilters();
            }
            else if (!e.target.closest('.sort-by-container')) popup?.classList.remove('active');
        });

        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('filter-item__checkbox') || 
                e.target.id === 'min-price' || 
                e.target.id === 'max-price') {
                this.handleFilters();
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.id === 'price-slider') {
                document.getElementById('max-price').value = e.target.value;
                document.getElementById('price-limit').textContent = e.target.value;
                this.handleFilters();
            }
        });

        document.addEventListener('click', (e) => {
            const pageBtn = e.target.closest('.pagination__num');
            if (pageBtn) {
                this.currentPage = parseInt(pageBtn.dataset.page);
                this.renderCatalog();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        document.addEventListener('click', (e) => {
            const pageBtn = e.target.closest('.pagination__num');
            if (pageBtn) {
                this.changePage(parseInt(pageBtn.dataset.page));
                return;
            }

            if (e.target.closest('#prev-btn') && this.currentPage > 1) {
                this.changePage(this.currentPage - 1);
                return;
            }

            const totalBooks = (StorageManager.get("books") || []).length;
            const totalPages = Math.ceil(totalBooks / this.itemsPerPage);
            
            if (e.target.closest('#next-btn') && this.currentPage < totalPages) {
                this.changePage(this.currentPage + 1);
            }
        });
    }

    changePage(newPage) {
        this.currentPage = newPage;
        this.renderCatalog();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderPagination(total) {
        const totalPages = Math.ceil(total / this.itemsPerPage);
        const container = document.getElementById('page-numbers');
        if (!container) return;
        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="pagination__num ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        container.innerHTML = html;
        const prev = document.getElementById('prev-btn');
        if(prev) prev.disabled = this.currentPage === 1;
        const next = document.getElementById('next-btn');
        if(next) next.disabled = this.currentPage === totalPages || total === 0;
    }
}