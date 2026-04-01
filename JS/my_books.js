/* ===== ORIGINAL component.js (unchanged) ===== */
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    const aside = document.querySelector('aside');
    const mainComp = document.querySelector('main');

    function updateAsideTop() {
        if (nav && aside) {
            const navHeight = nav.offsetHeight;
            aside.style.top = `${navHeight}px`;
        }
    }

    function updateMain() {
        if (mainComp) {
            if (nav) {
                const navHeight = nav.offsetHeight;
                mainComp.style.marginTop = `${navHeight}px`;
            }

            if (aside) {
                const asideWidth = aside.offsetWidth;
                mainComp.style.marginLeft = `${asideWidth}px`;
            }
        }
    }

    function resizeAll() {
        updateAsideTop();
        updateMain();
    }

    const resizeObserver = new ResizeObserver(() => {
        resizeAll();
    });

    if (nav) {
        resizeObserver.observe(nav);
    }

    window.addEventListener('resize', resizeAll);
    resizeAll();
});

/* ===== ADDITIONAL UI LOGIC (new) ===== */
(function () {
    // Data for rental compact list (matches the photo)
    const rentalCompact = [
        { title: "THE MIDNIGHT LIBRARY", subtitle: "A MEMOIR OF THE NIGHT BEFORE", authorLine: "BY MATT HAIG", tag: "BOOKS, LUXURY, READY TO READ" },
        { title: "PROJECT HAIL MARY", subtitle: "A MEMOIR OF THE NIGHT BEFORE", authorLine: "BY ANDREW YARDE", tag: "Sci-Fi Bestseller" },
        { title: "DUNE", authorLine: "Frank Herbert", tag: "Classic Epic" },
        { title: "Atomic Habits", authorLine: "James Clear", tag: "Self-Development" }
    ];

    // Active books with progress & days left
    const activeBooks = [
        { id: 1, title: "The Midnight Library", author: "Matt Haig", progress: 64, daysLeft: 12, coverColor: "#2C3E50", category: "active" },
        { id: 2, title: "Project Hail Mary", author: "Andy Weir", progress: 22, daysLeft: 5, coverColor: "#1F3B4C", category: "active" },
        { id: 3, title: "Dune", author: "Frank Herbert", progress: 89, daysLeft: 14, coverColor: "#2D3E2B", category: "active" },
        { id: 4, title: "Atomic Habits", author: "James Clear", progress: 45, daysLeft: 21, coverColor: "#4A2E2E", category: "active" },
        { id: 5, title: "Foundation", author: "Isaac Asimov", progress: 8, daysLeft: 28, coverColor: "#283B4C", category: "active" }
    ];

    function renderRentalList() {
        const container = document.getElementById('rentalCompactList');
        if (!container) return;
        container.innerHTML = '';
        rentalCompact.forEach(book => {
            const card = document.createElement('div');
            card.className = 'rental-card';
            let inner = `<div class="rental-title">${escapeHtml(book.title)}</div>`;
            if (book.subtitle) inner += `<div class="rental-sub">${escapeHtml(book.subtitle)}</div>`;
            if (book.tag) inner += `<div class="rental-tag">${escapeHtml(book.tag)}</div>`;
            inner += `<div class="rental-author">${escapeHtml(book.authorLine)}</div>`;
            card.innerHTML = inner;
            container.appendChild(card);
        });
    }

    function renderBooksGrid(filter = "all") {
        const grid = document.getElementById('booksGridContainer');
        if (!grid) return;
        let filtered = [];
        if (filter === "all") filtered = activeBooks;
        else if (filter === "active") filtered = activeBooks;
        else if (filter === "completed") filtered = [];
        else if (filter === "wishlist") filtered = [];

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="empty-state">✨ No books in this section yet.<br>Explore our collection!</div>`;
            return;
        }

        grid.innerHTML = '';
        filtered.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            card.innerHTML = `
        <div class="book-card-header">
          <div class="book-icon" style="background: ${book.coverColor}50; border-left: 4px solid var(--brand-primary);">📘</div>
          <div class="book-info">
            <h3 class="book-title">${escapeHtml(book.title)}</h3>
            <p class="book-author">${escapeHtml(book.author)}</p>
          </div>
        </div>
        <div class="progress-section">
          <div class="progress-stats">
            <span class="progress-label">PROGRESS</span>
            <span class="progress-percent">${book.progress}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-fill" style="width: ${book.progress}%;"></div>
          </div>
          <div class="days-left">
            <span class="days-icon">⏱️</span>
            <span><strong>${book.daysLeft} DAYS LEFT</strong></span>
          </div>
        </div>
      `;
            grid.appendChild(card);
        });
    }

    function initTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const filterValue = this.getAttribute('data-filter');
                tabs.forEach(btn => btn.classList.remove('active-tab'));
                this.classList.add('active-tab');
                renderBooksGrid(filterValue);
            });
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function (m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // Initialize when DOM is ready (after component.js already ran)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            renderRentalList();
            renderBooksGrid('all');
            initTabs();
            // Ensure active nav highlight
            const activeNav = document.querySelector('.nav-links a.active-nav');
            if (activeNav) activeNav.style.color = 'var(--brand-primary)';
        });
    } else {
        renderRentalList();
        renderBooksGrid('all');
        initTabs();
        const activeNav = document.querySelector('.nav-links a.active-nav');
        if (activeNav) activeNav.style.color = 'var(--brand-primary)';
    }
})();