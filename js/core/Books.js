export class Book {
    constructor({ id, title, author, price, genre, img, pages, published, desc, reviews, rating }) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.price = price;
        this.genre = genre;
        this.img = img;
        this.pages = pages || "---";
        this.published = published || "---";
        this.desc = desc || "";
        this.reviews = reviews || [];
        this.rating = rating || "---";
    }

    getDetailsUrl() {
        return `book-view.html?id=${this.id}`;
    }
}