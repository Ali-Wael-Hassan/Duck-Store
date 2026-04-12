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
        this.books = StorageManager.get("inventory") || [];
        
        if (this.books.length === 0) {
            const generalBooks = StorageManager.get("books") || [];
            this.books = generalBooks.map(b => ({
                id: b.id,
                title: b.title,
                author: b.author,
                isbn: "978-" + Math.floor(Math.random() * 1000000000),
                sku: "DUCK-00" + b.id,
                stock: Math.floor(Math.random() * 50),
                maxStock: 100
            }));
            StorageManager.save("inventory", this.books);
        }

        this.renderInventory();
        this.initEventListeners();
    }

    initEventListeners() {
        const addBtn = document.getElementById('add-book-btn');
        if (addBtn) addBtn.onclick = () => this.addNewBook();

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

        const tbody = document.getElementById('inventory-tbody');
        if (tbody) {
            tbody.addEventListener('click', (e) => {
                const trigger = e.target.closest('.btn-action-trigger');
                if (trigger) {
                    const id = parseInt(trigger.dataset.id);
                    this.showActionMenu(e, id);
                }
            });
        }
    }

    addNewBook() { this.showBookModal(); }
    
    editBook(id) {
        const book = this.books.find(b => b.id === id);
        if (book) this.showBookModal(book);
    }

    deleteBook(id) {
        let inv = StorageManager.get("inventory").filter(b => b.id !== id);
        let books = StorageManager.get("books").filter(b => b.id !== id);
        
        StorageManager.save("inventory", inv);
        StorageManager.save("books", books);

        this.books = inv;
        this.renderInventory();
    }

    updateDataInStorage(id, bookEntry, inventoryEntry, isEdit) {
        let allBooks = StorageManager.get("books") || [];
        let allInv = StorageManager.get("inventory") || [];

        if (isEdit) {
            allBooks = allBooks.map(b => b.id === id ? bookEntry : b);
            allInv = allInv.map(b => b.id === id ? inventoryEntry : b);
        } else {
            allBooks.unshift(bookEntry);
            allInv.unshift(inventoryEntry);
        }

        StorageManager.save("books", allBooks);
        StorageManager.save("inventory", allInv);
        this.books = allInv;
    }

    showBookModal(existingInventoryBook = null) {
        const isEdit = !!existingInventoryBook;
        const fullBooks = StorageManager.get("books") || [];
        const fullData = isEdit ? fullBooks.find(b => b.id === existingInventoryBook.id) : null;

        const modal = document.createElement('div');
        modal.className = 'custom-modal-overlay';
        modal.innerHTML = `
            <div class="custom-modal">
                <h3>${isEdit ? 'Edit Book Details' : 'Add New Book'}</h3>
                <form id="modal-book-form" class="modal-grid">
                    <input type="text" name="title" placeholder="Book Title" value="${fullData?.title || existingInventoryBook?.title || ''}" required>
                    <input type="text" name="author" placeholder="Author Name" value="${fullData?.author || existingInventoryBook?.author || ''}" required>
                    <input type="text" name="price" placeholder="Price (e.g. $27.00)" value="${fullData?.price || ''}" required>
                    <input type="text" name="genre" placeholder="Genre" value="${fullData?.genre || ''}" required>
                    <input type="number" name="pages" placeholder="Page Count" value="${fullData?.pages || ''}" required>
                    <input type="text" name="published" placeholder="Published Date" value="${fullData?.published || ''}" required>
                    <input type="number" step="0.1" name="rating" placeholder="Rating (0-5)" value="${fullData?.rating || ''}" required>
                    
                    <div class="modal-file-wrapper">
                        <img id="image-preview" src="${fullData?.img || '/assets/dummy/a1.jpg'}" class="image-preview" alt="Preview">
                        <input type="file" id="image-input" name="img" accept="image/*" ${isEdit ? '' : 'required'}>
                    </div>

                    <textarea name="desc" placeholder="Book Description" required style="grid-column: span 2">${fullData?.desc || ''}</textarea>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-cancel" id="close-modal">Cancel</button>
                        <button type="submit" class="btn-save">${isEdit ? 'Update' : 'Save'}</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        let imageDataUrl = fullData?.img || "/assets/dummy/a1.jpg";
        const imageInput = modal.querySelector('#image-input');
        const imagePreview = modal.querySelector('#image-preview');

        imageInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                imageDataUrl = event.target.result;
                imagePreview.src = imageDataUrl;
            };
            reader.readAsDataURL(file);
        };

        modal.querySelector('#close-modal').onclick = () => modal.remove();

        modal.querySelector('#modal-book-form').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const id = isEdit ? existingInventoryBook.id : Date.now();

            const bookEntry = {
                id,
                title: formData.get('title'),
                author: formData.get('author'),
                price: formData.get('price'),
                genre: formData.get('genre'),
                pages: formData.get('pages'),
                published: formData.get('published'),
                rating: parseFloat(formData.get('rating')),
                desc: formData.get('desc'),
                img: imageDataUrl,
                reviews: fullData?.reviews || []
            };

            const inventoryEntry = {
                id,
                title: bookEntry.title,
                author: bookEntry.author,
                isbn: isEdit ? existingInventoryBook.isbn : "978-" + Math.floor(Math.random() * 1000000000),
                sku: isEdit ? existingInventoryBook.sku : "DUCK-" + Math.floor(Math.random() * 9000 + 1000),
                stock: isEdit ? existingInventoryBook.stock : 50,
                maxStock: 100
            };

            this.updateDataInStorage(id, bookEntry, inventoryEntry, isEdit);
            modal.remove();
            this.renderInventory();
        };
    }

    showActionMenu(e, id) {
        const existingMenu = document.querySelector('.action-context-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.className = 'action-context-menu';
        menu.innerHTML = `
            <div class="menu-item edit">📝 Edit Details</div>
            <div class="menu-item delete">🗑️ Delete Book</div>
        `;

        Object.assign(menu.style, {
            top: `${e.pageY}px`,
            left: `${e.pageX - 120}px`
        });

        document.body.appendChild(menu);

        menu.querySelector('.edit').onclick = () => {
            this.editBook(id);
            menu.remove();
        };

        menu.querySelector('.delete').onclick = () => {
            if (confirm("Permanently remove this book?")) this.deleteBook(id);
            menu.remove();
        };

        setTimeout(() => {
            window.onclick = () => {
                menu.remove();
                window.onclick = null;
            };
        }, 0);
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
                        <button class="btn-action-trigger" data-id="${book.id}">
                            ⋮
                        </button>
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