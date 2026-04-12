import { StorageManager } from '../core/StorageManager.js';
import { ReviewLoader } from '../modules/ReviewLoader.js';

export class BookViewPage {
    constructor() {
        /* Extract the needed data from the query in the URL */
        const params = new URLSearchParams(window.location.search);
        this.bookId = parseInt(params.get('id'));

        this.currentUser = StorageManager.get('user_session');

        /* Load Data */
        this.bookData = this.loadBookData();

        /* If null return the error */
        if (!this.bookData) {
            console.error("Book data not found for ID:", this.bookId);
            return;
        }

        /* Render to the html page */
        this.render();
        
        /* Load reviews */
        this.reviews = new ReviewLoader('review-list', this.bookData.reviews || []);
        
        /* Check whether you own the book or not */
        this.checkExistingOwnership();
        
        /* Expose to the window */
        window.bookPage = this;

        /* Load gamification settings */
        this.inputMap = StorageManager.get('gamification-config') || {
            loginPoints: 10,
            reviewBase: 25,
            reviewBonus: 50,
            reviewMinChar: 100,
            purchaseRate: 2,
            purchaseMax: 500
        };
    }

    _syncUserStorage() {
        if (!this.currentUser) return;

        // 1. Update session
        StorageManager.save("user_session", this.currentUser);

        // 2. Update master list (users)
        const allUsers = StorageManager.get("users") || [];
        const i = allUsers.findIndex(u => u.email === this.currentUser.email);
        if (i !== -1) {
            allUsers[i] = this.currentUser; 
            StorageManager.save("users", allUsers);
        }
    }

    /* Load book data */
    loadBookData() {
        const books = StorageManager.get("books") || [];
        return books.find(b => b.id === this.bookId);
    }

    /* Add review and calculate points */
    handleAddReview() {
        const comment = prompt("Share your thoughts on this book:");
        if (!comment || comment.trim() === "") return;

        const rate = prompt("Your rate (1-5):");
        if (!rate || rate.trim() === "") return;

        const newReview = {
            user: this.currentUser.name || "Guest",
            rating: parseInt(rate, 10),
            time: new Date().toLocaleDateString(),
            comment: comment
        };

        if (this.inputMap && comment.length >= (this.inputMap.reviewMinChar || 0)) {
            const promos = StorageManager.get("featured_promos") || [];
            const isFeatured = promos.some(elem => elem.type === this.bookData.type);
            
            const pointsToAdd = isFeatured 
                ? (this.inputMap.reviewBonus || 0) 
                : (this.inputMap.reviewBase || 0);

            this.currentUser.points = (this.currentUser.points || 0) + pointsToAdd;
            
            this._syncUserStorage();
            console.log(`Review points added: ${pointsToAdd}`);
        }

        /* Update reviews array */
        if (!this.bookData.reviews) this.bookData.reviews = [];
        this.bookData.reviews.unshift(newReview); 

        /* Save book data updates */
        const allBooks = StorageManager.get('books') || [];
        const index = allBooks.findIndex(b => b.id == this.bookId);
        if (index !== -1) {
            allBooks[index] = this.bookData;
            StorageManager.save('books', allBooks);
        }

        /* Update UI */
        this.reviews.addTop(newReview);
    }

    /* Handle Buy/Borrow and calculate points */
    handleAction(btn, type) {
        const entry = {
            id: this.bookId,
            title: this.bookData.title,
            author: this.bookData.author,
            img: this.bookData.img,
            rating: this.bookData.rating,
            time: new Date().toLocaleDateString()
        };
        
        if (!this.currentUser[type]) this.currentUser[type] = [];
        this.currentUser[type].push(entry);

        if (this.inputMap) {
            const rawPrice = String(this.bookData.price || "0").replace(/[^0-9.]/g, '');
            const priceNum = parseFloat(rawPrice) || 0;
            
            const earnedPoints = Math.min(
                (this.inputMap.purchaseRate || 0) * priceNum, 
                (this.inputMap.purchaseMax || 0)
            );
            
            this.currentUser.points = (this.currentUser.points || 0) + earnedPoints;
        }

        this._syncUserStorage();

        console.log(`Book added to ${type} for user: ${this.currentUser.email}`);

        const successLabel = type === 'userBooks' ? "OWNED" : "IN LIBRARY";
        this._disableButton(btn, successLabel);
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
            const score = Math.round(Number(data.rating || 0));
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                starsHtml += `<i class="bi ${i <= score ? 'bi-star-fill' : 'bi-star'}"></i> `;
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
            }
        } else {
            mainSpan.textContent = fullDesc;
            if (readMoreBtn) readMoreBtn.classList.add('hidden');
        }

        const buyBtn = document.getElementById('buyButton');
        if (buyBtn) buyBtn.textContent = `BUY FOR ${data.price || '$0.00'}`;

        const coverContainer = document.getElementById('book-cover-container');
        if (coverContainer) {
            coverContainer.innerHTML = `<img src="${data.img}" alt="${data.title}" class="responsive-cover">`;
        }
    }

    checkExistingOwnership() {
        if (!this.currentUser) return;

        const isOwned = (this.currentUser.userBooks || []).some(b => b.id === this.bookId);
        const isBorrowed = (this.currentUser.borrowedBooks || []).some(b => b.id === this.bookId);

        if (isOwned) this._disableButton(document.getElementById('buyButton'), "OWNED");
        if (isBorrowed) this._disableButton(document.getElementById('borrowButton'), "IN LIBRARY");
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