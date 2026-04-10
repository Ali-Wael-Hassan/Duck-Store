export class ReviewLoader {
    constructor(containerId, initialReviews = []) {
        this.container = document.getElementById(containerId);
        // Reverse array so latest reviews (end of array) appear first
        this.reviews = [...initialReviews].reverse();
        this.loadedCount = 0;
        
        // Find the load more button to check state immediately
        const loadMoreBtn = document.querySelector('.load-more');

        // IF NO REVIEWS EXIST: Update button immediately
        if (this.reviews.length === 0) {
            if (loadMoreBtn) this._finalizeButton(loadMoreBtn);
            return; 
        }

        // Otherwise, auto-load first 2 reviews
        this.loadNext(loadMoreBtn); 
        this.loadNext(loadMoreBtn);
    }

    escape(str) {
        if (!str) return "";
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    loadNext(btn = null) {
        // If we've reached the end of the list
        if (this.loadedCount >= this.reviews.length) {
            if (btn) this._finalizeButton(btn);
            return;
        }

        this.renderCard(this.reviews[this.loadedCount], 'append');
        this.loadedCount++;

        // If that was the last review, disable the button
        if (this.loadedCount === this.reviews.length && btn) {
            this._finalizeButton(btn);
        }
    }

    addTop(rev) {
        this.renderCard(rev, 'prepend');
        this.reviews.unshift(rev); 
        this.loadedCount++;
    }

    renderCard(rev, method = 'append') {
        if (!this.container) return;

        // Helper to build review stars string
        let starHtml = '';
        const revScore = Math.round(rev.rating || 0);
        for (let i = 1; i <= 5; i++) {
            starHtml += `<i class="bi ${i <= revScore ? 'bi-star-fill' : 'bi-star'}"></i>`;
        }

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-head">
                <div class="avatar">${rev.user ? rev.user.charAt(0) : 'U'}</div>
                <div class="user-meta">
                    <strong>${this.escape(rev.user)}</strong>
                    <span class="review-date">${this.escape(rev.time)}</span>
                </div>
                <div class="review-rating">${starHtml}</div>
            </div>
            <div class="card-content">
                <p>${this.escape(rev.comment)}</p>
            </div>
        `;
        
        if (method === 'prepend') this.container.prepend(card);
        else this.container.appendChild(card);
    }

    _finalizeButton(btn) {
        if (!btn) return;
        btn.textContent = 'No more reviews';
        btn.disabled = true;
        btn.classList.add('btn-disabled'); 
    }
}