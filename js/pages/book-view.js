import { StorageManager } from '../core/StorageManager.js';
import { ReviewLoader } from '../modules/ReviewLoader.js';

export class BookViewPage {
    constructor() {
        /* Extract the needed data from the query in the URL */
        const params = new URLSearchParams(window.location.search);
        this.bookId = parseInt(params.get('id'));
        /* Load Data */
        this.bookData = this.loadBookData();

        /* if null return the error */
        if (!this.bookData) {
            console.error("Book data not found for ID:", this.bookId);
            return;
        }

        /* render to the html page */
        this.render();
        /* load reviews */
        this.reviews = new ReviewLoader('review-list', this.bookData.reviews || []);
        /* check whether you own the book or not */
        this.checkExistingOwnership();
        
        /* expose to the window */
        window.bookPage = this;
    }

    /* load book data */
    loadBookData() {
        const books = StorageManager.get("books") || [];
        return books.find(b => b.id === this.bookId);
    }

    /* add review */
    handleAddReview() {
        /* ask the user for review */
        const comment = prompt("Share your thoughts on this book:");

        /* return if empty or null */
        if (!comment || comment.trim() === "") return;

        /* ask the user for rate */
        const rate = prompt("Your rate:");

        /* return if empty or null */
        if (!rate || rate.trim() === "") return;

        /* construct the review */
        const newReview = {
            user: "Guest User",
            rating: parseInt(rate, 10),
            time: new Date().toLocaleDateString(),
            comment: comment
        };

        /* if null make the array empty */
        if (!this.bookData.reviews) this.bookData.reviews = [];

        /* push the new review to front (the display is handled in the review engine) */
        this.bookData.reviews.push(newReview);

        /* fetch the data from the storage */
        const allBooks = StorageManager.get('books');
        if (allBooks) {
            /* get the index */
            const index = allBooks.findIndex(b => b.id == this.bookId);

            /* exist */
            if (index !== -1) {
                allBooks[index] = this.bookData;
                
                StorageManager.save('books', allBooks);
                console.log("Success: Saved to local disk.");
            } else {
                console.error("Save failed: Could not find book ID", this.bookId, "in master list.");
            }
        }

        /* make it the top review */
        this.reviews.addTop(newReview);
    }

    render() {
        const data = this.bookData;
        if (!data) return;

        /* helper method */
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