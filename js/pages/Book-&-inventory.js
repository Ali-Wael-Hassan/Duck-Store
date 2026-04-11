import { StorageManager } from '../core/StorageManager.js';

export class InventoryController {
    constructor() {
        this.currentPage = 1;
        this.rowsPerPage = 5;
        this.books = [];

        StorageManager.initSeedData().then(() => {
            this.init();
        });
    }

    init() {
        this.books = StorageManager.get("inventory");
        
        // Fallback: If inventory is empty, sync from the main books list
        if (this.books.length === 0) {
            const generalBooks = StorageManager.get("books");
            this.books = generalBooks.map(b => ({
                id: b.id,
                title: b.title,
                author: b.author,
                isbn: "978-" + Math.floor(Math.random() * 1000000000),
                sku: "LUM-00" + b.id,
                stock: Math.floor(Math.random() * 50),
                maxStock: 100
            }));
            StorageManager.save("inventory", this.books);
        }

        this.renderInventory();
        this.initEventListeners();
    }

    initEventListeners() {
        // 1. Add New Book Button
        const addBtn = document.getElementById('add-book-btn');
        if (addBtn) {
            addBtn.onclick = () => this.addNewBook();
        }

        // 2. Pagination
        const prevBtn = document.querySelector('.page-controls button:first-child');
        const nextBtn = document.querySelector('.page-controls button:last-child');

        if (prevBtn) {
            prevBtn.onclick = () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderInventory();
                }
            };
        }

        if (nextBtn) {
            nextBtn.onclick = () => {
                const totalPages = Math.ceil(this.books.length / this.rowsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.renderInventory();
                }
            };
        }

        // 3. Table Actions (Delete/Edit)
        const tbody = document.getElementById('inventory-tbody');
        if (tbody) {
            tbody.addEventListener('click', (e) => {
                const deleteBtn = e.target.closest('.delete-action');
                if (deleteBtn) {
                    const id = parseInt(deleteBtn.dataset.id);
                    if (confirm("Delete this book from system?")) this.deleteBook(id);
                }
            });
        }
    }

    addNewBook() {
        // Simple prompts for data collection (In a real app, use a Modal form)
        const title = prompt("Enter Book Title:");
        if (!title) return;
        const author = prompt("Enter Author Name:");
        const price = prompt("Enter Price (in cents, e.g. 1500 for $15.00):", "1500");
        const stock = prompt("Initial Stock Level:", "50");

        const newId = Date.now(); // Unique ID based on timestamp

        // 1. Prepare data for General Book Storage (used in Store/Home)
        const bookEntry = {
            id: newId,
            title: title,
            author: author,
            price: parseInt(price),
            genre: "General",
            img: "https://via.placeholder.com/400x600?text=New+Book", // Default cover
            sales: 0,
            rating: 5.0
        };

        // 2. Prepare data for Inventory Storage
        const inventoryEntry = {
            id: newId,
            title: title,
            author: author,
            isbn: "978-" + Math.floor(Math.random() * 1000000000),
            sku: "LUM-" + Math.floor(Math.random() * 9000 + 1000),
            stock: parseInt(stock),
            maxStock: 100
        };

        // Save to LocalStorage using StorageManager
        StorageManager.pushTo("books", bookEntry);
        StorageManager.pushTo("inventory", inventoryEntry);

        // Update local state and UI
        this.books.unshift(inventoryEntry); // Add to top of list
        alert(`${title} has been added to the catalog and inventory!`);
        this.renderInventory();
    }

    deleteBook(id) {
        // Remove from Inventory
        let inv = StorageManager.get("inventory");
        inv = inv.filter(b => b.id !== id);
        StorageManager.save("inventory", inv);

        // Remove from General Books
        let books = StorageManager.get("books");
        books = books.filter(b => b.id !== id);
        StorageManager.save("books", books);

        // Update UI
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
            paginationLabel.innerText = `Showing ${start + 1}-${end} of ${total} books`;
        }

        tbody.innerHTML = currentSlice.map(book => {
            const status = this.getStatusUI(book.stock);
            const progressPercent = Math.min((book.stock / (book.maxStock || 100)) * 100, 100);
            const progressClass = book.stock < 10 ? 'progress-bar-yellow' : 'progress-bar';

            return `
                <tr>
                    <td data-label="Book Title & Author">
                        <div>
                            <h4 style="margin:0">${book.title}</h4>
                            <span class="subtext">${book.author}</span>
                        </div>
                    </td>
                    <td data-label="ISBN-13">${book.isbn}</td>
                    <td data-label="SKU">${book.sku}</td>
                    <td data-label="Stock Level">
                        <div class="progress">
                            <div class="${progressClass}"><div style="width: ${progressPercent}%"></div></div>
                            <span style="${book.stock === 0 ? 'color:red' : ''}">${book.stock}</span>
                        </div>
                    </td>
                    <td data-label="Status"><span class="${status.class}">${status.text}</span></td>
                    <td data-label="Actions">
                        <div style="display: flex; gap: 15px;">
                            <i class="fas fa-pen-to-square action-icon edit-action" style="cursor:pointer"></i>
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