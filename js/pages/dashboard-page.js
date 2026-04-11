import { StorageManager } from '../core/StorageManager.js';

export class DashboardController {
    constructor() {
        this.currentPage = 1;
        this.rowsPerPage = 5;
        this.orders = [];

        // Initialize and seed data before starting the controller logic
        StorageManager.initSeedData().then(() => {
            this.init();
        });
    }

    init() {
        // Sync internal data with Storage
        this.orders = StorageManager.get("orders");
        
        // Initial dashboard render
        this.updateStats();
        this.renderChart('weekly'); // Default to weekly view
        this.renderTrendingBooks();
        this.renderTransactions();
        
        // Setup interactive listeners
        this.initEventListeners();
    }

    initEventListeners() {
        // 1. Download CSV Button
        const downloadBtn = document.getElementById('download-csv-btn');
        if (downloadBtn) {
            downloadBtn.onclick = () => this.downloadTransactionsCSV();
        }

        // 2. Weekly / Monthly Chart Toggle
        const chartButtons = document.querySelectorAll('.toggle-btn');
        chartButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                chartButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Map button text to storage keys
                const type = btn.textContent.trim().toLowerCase() === 'week' ? 'weekly' : 'monthly';
                this.renderChart(type);
            });
        });

        // 3. Pagination Buttons
        const prevBtn = document.querySelector('#transactions-pagination button:first-of-type');
        const nextBtn = document.querySelector('#transactions-pagination button:last-of-type');

        if (prevBtn) {
            prevBtn.onclick = () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderTransactions();
                }
            };
        }

        if (nextBtn) {
            nextBtn.onclick = () => {
                const totalPages = Math.ceil(this.orders.length / this.rowsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.renderTransactions();
                }
            };
        }

        // 4. Action Dropdown & Delete Logic (Event Delegation)
        const tbody = document.getElementById('transactions-tbody');
        if (tbody) {
            tbody.addEventListener('click', (e) => {
                // Handle Toggle Dropdown Visibility
                const trigger = e.target.closest('.action-trigger');
                if (trigger) {
                    const menu = trigger.nextElementSibling;
                    // Close other menus first
                    document.querySelectorAll('.action-menu.show').forEach(m => {
                        if (m !== menu) m.classList.remove('show');
                    });
                    menu.classList.toggle('show');
                }

                // Handle Delete Click
                const deleteBtn = e.target.closest('.delete-btn');
                if (deleteBtn) {
                    const orderId = deleteBtn.getAttribute('data-id');
                    if (confirm(`Are you sure you want to delete order #${orderId}?`)) {
                        this.deleteOrder(orderId);
                    }
                }
            });
        }

        // Close dropdowns if clicking anywhere else
        window.addEventListener('click', (e) => {
            if (!e.target.closest('.action-dropdown')) {
                document.querySelectorAll('.action-menu.show').forEach(m => m.classList.remove('show'));
            }
        });
    }

    updateStats() {
        const stats = StorageManager.get("dashboard_stats");
        const cards = document.querySelectorAll('.stat-card');
        if (!stats.length || !cards.length) return;

        stats.forEach((stat, index) => {
            if (cards[index]) {
                const valEl = cards[index].querySelector('.stat-value');
                const subEl = cards[index].querySelector('.stat-subtext');
                const trendEl = cards[index].querySelector('.trend');
                
                if (valEl) valEl.innerText = stat.value;
                if (subEl) subEl.innerText = stat.subtext;
                if (trendEl) trendEl.innerText = stat.trend;
            }
        });
    }

    renderChart(type = 'weekly') {
        const chartGrid = document.getElementById('chart-grid');
        const subtext = document.querySelector('.panel-card .subtext');
        if (!chartGrid) return;

        // Update UI text
        if (subtext) subtext.innerText = type === 'weekly' ? 'Daily revenue overview' : 'Monthly revenue overview';

        const storageKey = type === 'monthly' ? "sales_performance_monthly" : "sales_performance";
        const data = StorageManager.get(storageKey);

        if (!data || data.length === 0) {
            chartGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 2rem; opacity:0.5;">No data available.</div>`;
            return;
        }

        chartGrid.innerHTML = data.map(item => `
            <div class="bar-col">
                <div class="bar-total" style="height: ${item.totalHeight}%">
                    <div class="bar-fill" style="height: ${item.fillHeight}%"></div>
                </div>
                <span class="d-label">${item.day || item.month}</span>
            </div>
        `).join('');
    }

    renderTrendingBooks() {
        const bookList = document.getElementById('trending-books-list');
        const books = StorageManager.get("books");
        if (!bookList) return;

        if (!books || books.length === 0) {
            bookList.innerHTML = `<p class="text-center" style="padding:1rem;">Catalog empty.</p>`;
            return;
        }

        const trending = [...books].sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 4);

        bookList.innerHTML = trending.map(book => `
            <div class="book-item">
                <div class="book-cover"><img src="${book.img}" alt="${book.title}"></div>
                <div class="book-details">
                    <h4>${book.title}</h4>
                    <span class="subtext">${book.genre} • ${book.sales || 0} sales</span>
                </div>
                <div class="book-price">$${(book.price / 100).toFixed(2)}</div>
            </div>
        `).join('');
    }

    renderTransactions() {
        const tbody = document.getElementById('transactions-tbody');
        const pagText = document.querySelector('#transactions-pagination .subtext');
        const prevBtn = document.querySelector('#transactions-pagination button:first-of-type');
        const nextBtn = document.querySelector('#transactions-pagination button:last-of-type');
        
        this.orders = StorageManager.get("orders");
        if (!tbody) return;

        if (this.orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 2rem;">No transactions found.</td></tr>`;
            if (pagText) pagText.innerText = "SHOWING 0 OF 0 TRANSACTIONS";
            return;
        }

        const total = this.orders.length;
        const start = (this.currentPage - 1) * this.rowsPerPage;
        const end = Math.min(start + this.rowsPerPage, total);
        const currentSlice = this.orders.slice(start, end);

        tbody.innerHTML = currentSlice.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>
                    <div class="customer-cell">
                        <div class="avatar-sm bg-blue-text">${order.customerName.charAt(0)}</div>
                        <span>${order.customerName}</span>
                    </div>
                </td>
                <td class="text-muted">${order.date}</td>
                <td class="font-bold">$${order.total}</td>
                <td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
                <td class="text-center">
                    <div class="action-dropdown">
                        <button class="icon-btn-sm action-trigger"><i class="fas fa-ellipsis-v"></i></button>
                        <div class="action-menu">
                            <button class="delete-btn" data-id="${order.id}"><i class="fas fa-trash"></i> Delete</button>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('');

        if (pagText) pagText.innerText = `SHOWING ${start + 1}-${end} OF ${total} TRANSACTIONS`;
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = end >= total;
    }

    deleteOrder(orderId) {
        let allOrders = StorageManager.get("orders");
        allOrders = allOrders.filter(o => o.id !== orderId);
        
        // Save back to storage
        localStorage.setItem("orders", JSON.stringify(allOrders));
        this.orders = allOrders;

        const totalPages = Math.ceil(this.orders.length / this.rowsPerPage);
        if (this.currentPage > totalPages && this.currentPage > 1) {
            this.currentPage = totalPages;
        }

        this.renderTransactions();
    }

    downloadTransactionsCSV() {
        const orders = StorageManager.get("orders");
        if (!orders.length) return alert("No data to download.");

        const headers = "Order ID,Customer,Date,Amount,Status\n";
        const rows = orders.map(o => `${o.id},"${o.customerName}",${o.date},${o.total},${o.status}`).join("\n");
        
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    }
}