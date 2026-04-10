import { StorageManager } from '../core/StorageManager.js';
import { ReviewLoader } from '../modules/ReviewLoader.js';

export class BookViewPage {
    constructor() {
        const params = new URLSearchParams(window.location.search);
        this.bookId = parseInt(params.get('id'));
        this.bookData = this.loadBookData();

        if (!this.bookData) {
            console.error("Book data not found for ID:", this.bookId);
            return;
        }

        this.render();
        this.reviews = new ReviewLoader('review-list', this.bookData.reviews || []);
        this.checkExistingOwnership();
        
        window.bookPage = this;
    }

    loadBookData() {
        const books = StorageManager.get("books") || [];
        return books.find(b => b.id === this.bookId);
    }

    handleAddReview() {
        const comment = prompt("Share your thoughts on this book:");
        if (!comment || comment.trim() === "") return;

        const rate = prompt("Your rate:");
        if (!rate || rate.trim() === "") return;

        const newReview = {
            user: "Guest User",
            rating: parseInt(rate, 10),
            time: new Date().toLocaleDateString(),
            comment: comment
        };

        if (!this.bookData.reviews) this.bookData.reviews = [];
        this.bookData.reviews.push(newReview);

        const rawBooks = localStorage.getItem('books');
        if (rawBooks) {
            const allBooks = JSON.parse(rawBooks);
            
            const index = allBooks.findIndex(b => b.id == this.bookId);

            if (index !== -1) {
                allBooks[index] = this.bookData;
                
                localStorage.setItem('books', JSON.stringify(allBooks));
                console.log("Success: Saved to local disk.");
            } else {
                console.error("Save failed: Could not find book ID", this.bookId, "in master list.");
            }
        }

        this.reviews.addTop(newReview);
    }

    render() {
        const data = this.bookData;
        if (!data) return;

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setVal('book-title', data.title);
        setVal('book-author', data.author);
        setVal('book-rating', data.rating ? data.rating.toFixed(1) : "0.0");
        setVal('meta-pages', data.pages || "---");
        setVal('meta-date', data.published || "---");

        const starContainer = document.getElementById('star-rating-container');
        if (starContainer) {
            const rawRating = data.rating !== undefined ? data.rating : 0;
            const score = Math.round(Number(rawRating));

            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                const starClass = i <= score ? 'bi-star-fill' : 'bi-star';
                starsHtml += `<i class="bi ${starClass}"></i> `;
            }
            starContainer.innerHTML = starsHtml;
        }

        const fullDesc = data.desc || "No summary available.";
        const mainSpan = document.getElementById('synopsis-content');
        const extraSpan = document.getElementById('extra-content');
        const readMoreBtn = document.getElementById('readMoreBtn');

        const limit = 150; 

        if (fullDesc.length > limit) {
            const splitIndex = fullDesc.indexOf(' ', limit);

            if (splitIndex !== -1) {
                mainSpan.textContent = fullDesc.substring(0, splitIndex);
                extraSpan.textContent = fullDesc.substring(splitIndex); 
                if (readMoreBtn) readMoreBtn.classList.remove('hidden');
            } else {
                mainSpan.textContent = fullDesc;
                extraSpan.textContent = "";
                if (readMoreBtn) readMoreBtn.classList.add('hidden');
            }
        } else {
            mainSpan.textContent = fullDesc;
            extraSpan.textContent = "";
            if (readMoreBtn) readMoreBtn.classList.add('hidden');
        }

        const buyBtn = document.getElementById('buyButton');
        if (buyBtn) buyBtn.textContent = `BUY FOR ${data.price || '$0.00'}`;

        const coverContainer = document.getElementById('book-cover-container');
        if (coverContainer) {
            coverContainer.innerHTML = `<img src="${data.img}" alt="${data.title}" class="responsive-cover">`;
        }
    }

    handleAction(btn, type) {
        const entry = {
            id: this.bookId,
            title: this.bookData.title,
            author: this.bookData.author,
            img: this.bookData.img,
            rating: this.bookData.rating,
            time: new Date().toLocaleDateString()
        };
        StorageManager.pushTo(type, entry);
        this._disableButton(btn, type === 'userBooks' ? "OWNED" : "IN LIBRARY");
    }

    checkExistingOwnership() {
        const owned = StorageManager.get("userBooks") || [];
        const borrowed = StorageManager.get("borrowedBooks") || [];
        if (owned.some(b => b.id === this.bookId)) this._disableButton(document.getElementById('buyButton'), "OWNED");
        if (borrowed.some(b => b.id === this.bookId)) this._disableButton(document.getElementById('borrowButton'), "IN LIBRARY");
    }

    _disableButton(btn, text) {
        if (!btn) return;
        btn.textContent = text;
        btn.disabled = true;
        btn.classList.add('btn-disabled'); 
    }

    toggleSynopsis(btnId, contentId) {
        const extra = document.getElementById(contentId);
        const btn = document.getElementById(btnId);
        
        if (!extra || !btn) return;

        const isHidden = extra.classList.toggle('hidden');
        
        btn.textContent = isHidden ? "Read more →" : "Show less ←";
    }

    handleLoadMore(btn) {
        this.reviews.loadNext(btn);
    }
}