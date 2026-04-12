import { StorageManager } from 'core/StorageManager.js';

export class HomePage {
    constructor() {
        this.init();
    }

    init() {
        this.renderFeatured();
        this.renderTrending();
        this.renderCurated();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const featuredGrid = document.querySelector('.featured-grid');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        if (featuredGrid && prevBtn && nextBtn) {
            const scrollAmount = 350;
            nextBtn.addEventListener('click', () => {
                featuredGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
            prevBtn.addEventListener('click', () => {
                featuredGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
        }

        const viewAllTrending = document.querySelector('.trending-section .view-all');
        if (viewAllTrending) {
            viewAllTrending.addEventListener('click', (e) => {
                e.preventDefault();
                console.log("Redirecting to full library...");
                window.location.href = 'store.html?filter=all';
                
            });
        }

        const viewRecs = document.querySelector('.curated-section .view-all');
        if (viewRecs) {
            viewRecs.addEventListener('click', (e) => {
                e.preventDefault();
                const config = StorageManager.get("curated_config");
                console.log(`Loading more ${config.displayGenre} for you...`);
                
                const genreQuery = encodeURIComponent(config.displayGenre);
                window.location.href = `store.html?genre=${genreQuery}`;
            });
        }
    }

    renderTrending() {
        const grid = document.querySelector('.books-grid');
        const books = StorageManager.get("books") || [];
        if (!grid) return;

        grid.innerHTML = '';
        books.slice(0, 7).forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-item';
            const link = `book-view.html?id=${book.id}&title=${encodeURIComponent(book.title)}`;

            card.innerHTML = `
                <a href="${link}" class="book-main-link">
                    <figure class="book-cover"><img src="${book.img}"></figure>
                    <div class="book-info">
                        <h3>${book.title}</h3>
                        <p class="author">${book.author}</p>
                    </div>
                    <span class="price">${book.price}</span>
                </a>
            `;
            grid.appendChild(card);
        });
    }

    renderFeatured() {
        const grid = document.querySelector('.featured-grid');
        const promos = StorageManager.get("featured_promos") || [];
        if (!grid) return;

        grid.innerHTML = '';
        promos.forEach(item => {
            const article = document.createElement('article');
            article.className = `featured-card ${item.type}`;
            
            if (item.img) {
                article.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${item.img}')`;
                article.style.backgroundSize = 'cover';
                article.style.backgroundPosition = 'center';
            }

            const targetUrl = `store.html?category=${encodeURIComponent(item.type)}`;

            article.innerHTML = `
                ${item.badge ? `<span class="badge">${item.badge}</span>` : ''}
                <h3>${item.title}</h3>
                <p>${item.desc}</p>
                <button class="${item.type === 'scifi' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="window.location.href='${targetUrl}'">
                    ${item.btnText}
                </button>
            `;
            grid.appendChild(article);
        });
    }

    renderCurated() {
        const grid = document.querySelector('.curated-grid');
        const config = StorageManager.get("curated_config");
        const allBooks = StorageManager.get("books") || [];
        if (!grid || !config) return;

        const filtered = allBooks
            .filter(b => b.genre === config.displayGenre)
            .slice(0, config.limit);

        grid.innerHTML = '';
        filtered.forEach(book => {
            const card = document.createElement('a');
            card.href = `book-view.html?id=${book.id}`;
            card.className = 'curated-card';
            card.style.textDecoration = 'none';
            card.style.color = 'inherit';

            card.innerHTML = `
                <div class="curated-thumb"><img src="${book.img}"></div>
                <div class="curated-details">
                    <span class="reason-tag">BASED ON ${config.displayGenre.toUpperCase()}</span>
                    <h4>${book.title}</h4>
                    <span class="status">Recommended</span>
                </div>
            `;
            grid.appendChild(card);
        });
    }
}