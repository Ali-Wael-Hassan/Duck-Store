import { StorageManager } from 'core/StorageManager.js';

export class MyBooksPage {
    constructor() {
        this.currentUser = StorageManager.get('user_session');
        this.currentFilter = 'Active Rentals';
        this.init();
    }

    async init() {
        await StorageManager.initSeedData();

        this.renderMyBooks();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const tabs = document.querySelectorAll('.tab-link');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                this.currentFilter = tab.textContent.trim();
                this.renderMyBooks();
            });
        });
    }

    renderMyBooks(searchTerm = '') {
        const grid = document.querySelector('.book-grid');
        if (!grid || !this.currentUser) return;

        let displayBooks = [];

        if (this.currentFilter === 'Active Rentals') {
            displayBooks = this.currentUser.borrowedBooks || [];
        } else if (this.currentFilter === 'Completed' || this.currentFilter === 'Owned') {
            displayBooks = this.currentUser.userBooks || [];
        } else {
            displayBooks = [
                ...(this.currentUser.userBooks || []), 
                ...(this.currentUser.borrowedBooks || [])
            ];
        }

        const filteredBooks = displayBooks.filter(book => {
            const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 book.author.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });

        grid.innerHTML = '';

        if (filteredBooks.length === 0) {
            grid.innerHTML = `<p class="empty-msg">No books found in ${this.currentFilter}.</p>`;
            return;
        }

        filteredBooks.forEach(book => {
            const article = document.createElement('article');
            article.className = 'book-card';

            const isOwned = (this.currentUser.userBooks || []).some(b => b.id === book.id);
            const progress = isOwned ? 100 : 45;

            article.innerHTML = `
                <div class="image-container">
                    <img src="${book.img}" alt="${book.title}">
                    <div class="book-overlay">
                        <button class="btn-read" onclick="window.location.href='book-view.html?id=${book.id}'">
                            <i class="fas fa-play"></i> ${progress === 100 ? 'Read Again' : 'Continue'}
                        </button>
                    </div>
                </div>
                <div class="book-details">
                    <h3>${book.title}</h3>
                    <p>${book.author}</p>
                    <div class="progress-container">
                        <div class="progress-fill" style="width: ${progress}%; background: #00d4ff; height: 100%; border-radius: 3px;"></div>
                    </div>
                    <p style="font-size: 0.8rem; margin-top: 5px;">${progress}% Complete</p>
                </div>
            `;
            grid.appendChild(article);
        });
    }
}