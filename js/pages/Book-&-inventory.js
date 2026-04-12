import { StorageManager } from 'core/StorageManager.js';

export class InventoryController {
    constructor() {
        this.currentPage = 1;
        this.rowsPerPage = 5;
        this.books = [];

        /* Initiate the seed data (safety as it has been made in main.js) */
        StorageManager.initSeedData().then(() => {
            this.init();
        });
    }

    init() {
        /* fetch the data from the storage */
        this.books = StorageManager.get("inventory") || [];
        
        /* if the current books unloaded */
        if (this.books.length === 0) {
            /* books array */
            const generalBooks = StorageManager.get("books") || [];
            /* the current books array with the specific format */
            this.books = generalBooks.map(b => ({
                id: b.id,
                title: b.title,
                author: b.author,
                isbn: "978-" + Math.floor(Math.random() * 1000000000),
                sku: "DUCK-00" + b.id,
                stock: Math.floor(Math.random() * 50),
                maxStock: 100
            }));

            /* save to the storage */
            StorageManager.save("inventory", this.books);
        }

        /* render the data */
        this.renderInventory();
        /* initiate the listeners */
        this.initEventListeners();
    }

    initEventListeners() {
        /* get the button */
        const addBtn = document.getElementById('add-book-btn');

        /* make the onclick with the callback addNewBook() method */
        if (addBtn) addBtn.onclick = () => this.addNewBook();

        /* gets the prevBtn and nextBtn */
        const prevBtn = document.querySelector('.page-controls button:first-child');
        const nextBtn = document.querySelector('.page-controls button:last-child');

        /* match the callback for prevBtn when it isn't null */
        if (prevBtn) {
            prevBtn.onclick = () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderInventory();
                }
            };
        }

        /* match the callback for nextBtn when it isn't null */
        if (nextBtn) {
            nextBtn.onclick = () => {
                /* ceil(books.length / rows per page) = start value for the next page */
                const totalPages = Math.ceil(this.books.length / this.rowsPerPage);
                if (this.currentPage < totalPages) {
                    /* update page counter */
                    this.currentPage++;
                    /* render new data */
                    this.renderInventory();
                }
            };
        }

        /* get the body of the inventory */
        const tbody = document.getElementById('inventory-tbody');

        /* add the callback with addEventListener  */
        if (tbody) {
            tbody.addEventListener('click', (e) => {
                const deleteBtn = e.target.closest('.delete-action');
                if (deleteBtn) {
                    const id = parseInt(deleteBtn.dataset.id);
                    if (confirm("Delete this book from system?")) this.deleteBook(id);
                }

                const editBtn = e.target.closest('.edit-action');
                if (editBtn) {
                    const id = parseInt(editBtn.dataset.id);
                    this.editBook(id);
                }
            });
        }
    }

    editBook(id) {
        const inv = StorageManager.get("inventory");
        const general = StorageManager.get("books");

        const invBook = inv.find(b => b.id === id);
        const genBook = general.find(b => b.id === id);

        if (!invBook) return;

        // Prompts for editing
        const newTitle = prompt("Update Title:", invBook.title);
        if (newTitle === null) return; 
        
        const newAuthor = prompt("Update Author:", invBook.author);
        const newStock = prompt("Update Stock Level:", invBook.stock);
        
        // Price is stored in the "books" collection
        const currentPrice = genBook ? genBook.price : 1500;
        const newPrice = prompt("Update Price (in cents, e.g. 1500 for $15.00):", currentPrice);

        // 1. Update Inventory Storage (Stock/Title/Author)
        const invIndex = inv.findIndex(b => b.id === id);
        if (invIndex !== -1) {
            inv[invIndex].title = newTitle;
            inv[invIndex].author = newAuthor;
            inv[invIndex].stock = parseInt(newStock) || 0;
            StorageManager.save("inventory", inv);
        }

        // 2. Update General Books Storage (Price/Title/Author)
        const genIndex = general.findIndex(b => b.id === id);
        if (genIndex !== -1) {
            general[genIndex].title = newTitle;
            general[genIndex].author = newAuthor;
            general[genIndex].price = parseInt(newPrice) || currentPrice;
            StorageManager.save("books", general);
        }

        // Update local state and UI
        this.books = inv;
        this.renderInventory();
        alert("Book and Price updated successfully!");
    }

    addNewBook() {
        const title = prompt("Enter Book Title:");
        if (!title) return;
        const author = prompt("Enter Author Name:");
        const price = prompt("Enter Price (in cents):", "1500");
        const stock = prompt("Initial Stock Level:", "50");

        const newId = Date.now();

        const bookEntry = {
            id: newId,
            title: title,
            author: author,
            price: parseInt(price),
            genre: "General",
            img: "https://via.placeholder.com/400x600?text=New+Book",
            sales: 0,
            rating: 5.0
        };

        const inventoryEntry = {
            id: newId,
            title: title,
            author: author,
            isbn: "978-" + Math.floor(Math.random() * 1000000000),
            sku: "LUM-" + Math.floor(Math.random() * 9000 + 1000),
            stock: parseInt(stock),
            maxStock: 100
        };

        StorageManager.pushTo("books", bookEntry);
        StorageManager.pushTo("inventory", inventoryEntry);

        this.books.unshift(inventoryEntry);
        this.renderInventory();
    }

    deleteBook(id) {
        let inv = StorageManager.get("inventory");
        inv = inv.filter(b => b.id !== id);
        StorageManager.save("inventory", inv);

        let books = StorageManager.get("books");
        books = books.filter(b => b.id !== id);
        StorageManager.save("books", books);

        this.books = inv;
        this.renderInventory();
    }

    getStatusUI(stock) {
        if (stock <= 0) return { class: 'status-red', text: 'Sold Out' };
        if (stock < 10) return { class: 'status-yellow', text: 'Low Stock' };
        return { class: 'status-green', text: 'In Stock' };
    }

    renderInventory() {
        const tbody = document.getElementById('inventory-tbody');
        const paginationLabel = document.querySelector('#inventory-pagination .subtext');
        if (!tbody) return;

        const total = this.books.length;
        const start = (this.currentPage - 1) * this.rowsPerPage;
        const end = Math.min(start + this.rowsPerPage, total);
        const currentSlice = this.books.slice(start, end);

        if (paginationLabel) {
            paginationLabel.innerText = `Showing ${total === 0 ? 0 : start + 1}-${end} of ${total} books`;
        }

        tbody.innerHTML = currentSlice.map(book => {
            const status = this.getStatusUI(book.stock);
            const progressPercent = Math.min((book.stock / (book.maxStock || 100)) * 100, 100);
            const progressClass = book.stock < 10 ? 'progress-bar-yellow' : 'progress-bar';

            return `
                <tr>
                    <td>
                        <div>
                            <h4 style="margin:0">${book.title}</h4>
                            <span class="subtext">${book.author}</span>
                        </div>
                    </td>
                    <td>${book.isbn}</td>
                    <td>${book.sku}</td>
                    <td>
                        <div class="progress">
                            <div class="${progressClass}"><div style="width: ${progressPercent}%"></div></div>
                            <span style="${book.stock === 0 ? 'color:red' : ''}">${book.stock}</span>
                        </div>
                    </td>
                    <td><span class="${status.class}">${status.text}</span></td>
                    <td>
                        <div style="display: flex; gap: 15px;">
                            <i class="fas fa-pen-to-square action-icon edit-action" style="cursor:pointer" data-id="${book.id}"></i>
                            <i class="fas fa-trash action-icon delete-action" style="color: #ff4d4d; cursor:pointer;" data-id="${book.id}"></i>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        const prevBtn = document.querySelector('.page-controls button:first-child');
        const nextBtn = document.querySelector('.page-controls button:last-child');
        if (prevBtn) prevBtn.disabled = (this.currentPage === 1);
        if (nextBtn) nextBtn.disabled = (end >= total);
    }
}