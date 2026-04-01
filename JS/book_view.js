// ===== Book View Page Interactions =====
// Handles "Read more" toggle, "Load more reviews", and any additional UI enhancements

document.addEventListener('DOMContentLoaded', () => {
    // --- Read More / Show Less for Synopsis ---
    const readMoreBtn = document.getElementById('read-more-btn');
    const fullSynopsis = document.getElementById('full-synopsis');
    let expanded = false;

    if (readMoreBtn && fullSynopsis) {
        readMoreBtn.addEventListener('click', () => {
            if (!expanded) {
                fullSynopsis.classList.remove('hidden');
                readMoreBtn.textContent = 'Show less →';
                expanded = true;
            } else {
                fullSynopsis.classList.add('hidden');
                readMoreBtn.textContent = 'Read more →';
                expanded = false;
            }
        });
    }

    // --- Load More Reviews (dynamic) ---
    const loadMoreBtn = document.getElementById('load-more-reviews');
    const reviewList = document.getElementById('review-list');

    // Additional reviews data (matching the photo style)
    const moreReviews = [
        {
            name: 'Emma Watson',
            stars: '★★★★★',
            title: 'A balm for the soul',
            content: 'I picked this up during a difficult time and couldn’t put it down. The concept of infinite lives makes you appreciate your own.',
            time: '3 days ago'
        },
        {
            name: 'Carlos Mendez',
            stars: '★★★★☆',
            title: 'Thought-provoking and warm',
            content: 'Some parts felt a bit predictable, but the emotional payoff is huge. Highly recommend for anyone questioning their path.',
            time: '5 days ago'
        },
        {
            name: 'Sophia Chen',
            stars: '★★★★★',
            title: 'Absolutely stunning',
            content: 'Matt Haig writes with such compassion. This book will stay with me for years.',
            time: '1 day ago'
        }
    ];

    let loadedCount = 0; // how many from moreReviews have been added

    if (loadMoreBtn && reviewList) {
        loadMoreBtn.addEventListener('click', () => {
            // Append one review at a time (or all if you prefer, but mimic "load more")
            if (loadedCount < moreReviews.length) {
                const rev = moreReviews[loadedCount];
                const newCard = document.createElement('div');
                newCard.className = 'card';
                newCard.style.opacity = '0';
                newCard.style.transform = 'translateY(10px)';
                newCard.innerHTML = `
                    <div class="card-head">
                        <i class="bi bi-person-circle"></i>
                        <strong>${escapeHtml(rev.name)}</strong>
                        <span class="review-stars">${rev.stars}</span>
                    </div>
                    <div class="card-content">
                        <p><strong>${escapeHtml(rev.title)}</strong><br>${escapeHtml(rev.content)}</p>
                    </div>
                    <div class="review-meta">${escapeHtml(rev.time)}</div>
                `;
                reviewList.appendChild(newCard);
                // fade in animation
                setTimeout(() => {
                    newCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    newCard.style.opacity = '1';
                    newCard.style.transform = 'translateY(0)';
                }, 10);
                loadedCount++;
                // If all reviews loaded, disable or hide button
                if (loadedCount === moreReviews.length) {
                    loadMoreBtn.textContent = 'No more reviews';
                    loadMoreBtn.disabled = true;
                    loadMoreBtn.style.opacity = '0.6';
                    loadMoreBtn.style.cursor = 'default';
                }
            }
        });
    }

    // Helper to prevent XSS
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function (m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function (c) {
            return c;
        });
    }

    // Optional: handle rating stars formatting (already done in HTML)
    // Add any future interactive elements like notification/settings placeholders
    const notifBtn = document.getElementById('notification_button');
    const settingsBtn = document.getElementById('settings_button');

    if (notifBtn) {
        notifBtn.addEventListener('click', () => {
            alert('🔔 Notifications coming soon!');
        });
    }
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            alert('⚙️ Settings panel will be available in the next update.');
        });
    }

    // If you want to simulate the half-star rating in the header (already done in HTML)
    // Ensure that the "borrow with premium" button has a tooltip or simple feedback
    const borrowBtn = document.querySelector('.btn-outline');
    if (borrowBtn && borrowBtn.textContent.includes('Borrow')) {
        borrowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Premium feature: you can borrow this book with your active subscription.');
        });
    }
});