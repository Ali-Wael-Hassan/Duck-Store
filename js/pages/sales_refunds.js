import { StorageManager } from 'core/StorageManager.js';

export class SalesRefundsController {
    constructor() {
        this.orders = [];
        this.currentPage = 1;
        this.rowsPerPage = 5;
        this.init();
    }

    async init() {
        await StorageManager.initSeedData();
        this.orders = StorageManager.get("orders");

        this.renderStats();
        this.renderTable();
        this.initPaginationListeners();
    }

    initPaginationListeners() {
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderTable();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.orders.length / this.rowsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.renderTable();
                }
            });
        }
    }

    renderStats() {
        let grossSales = 0;
        let totalRefunds = 0;

        this.orders.forEach(order => {
            const totalStr = String(order.total || "0");
            const amount = parseFloat(totalStr.replace(/[$,]/g, '')) || 0;

            if (order.status === 'Refunded' || order.status === 'Refund') {
                totalRefunds += amount;
            } else {
                grossSales += amount;
            }
        });

        document.getElementById('stat-gross').innerText = `$${grossSales.toFixed(2)}`;
        document.getElementById('stat-refunds').innerText = `-$${totalRefunds.toFixed(2)}`;
        document.getElementById('stat-net').innerText = `$${(grossSales - totalRefunds).toFixed(2)}`;
    }

    renderTable() {
        const tbody = document.getElementById('sales-tbody');
        const paginationLabel = document.querySelector('#sales-pagination .subtext');
        if (!tbody) return;

        const total = this.orders.length;
        const start = (this.currentPage - 1) * this.rowsPerPage;
        const end = Math.min(start + this.rowsPerPage, total);
        const currentSlice = this.orders.slice(start, end);

        if (paginationLabel) {
            paginationLabel.innerText = total > 0 
                ? `Showing ${start + 1}-${end} of ${total} transactions`
                : `Showing 0 of 0 transactions`;
        }

        document.getElementById('prev-page').disabled = (this.currentPage === 1);
        document.getElementById('next-page').disabled = (end >= total);

        if (currentSlice.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">No transactions found.</td></tr>`;
            return;
        }

        tbody.innerHTML = currentSlice.map(order => {
            const isRefund = order.status === 'Refunded' || order.status === 'Refund';
            
            const totalStr = String(order.total || "0");
            const numericAmount = parseFloat(totalStr.replace(/[$,]/g, '')) || 0;

            return `
                <tr>
                    <td data-label="BOOK">${order.bookTitle || 'Unknown Book'}</td>
                    <td data-label="CUSTOMER">${order.customerName || 'Guest'}</td>
                    <td data-label="STATUS"><span class="${isRefund ? 'refund' : 'paid'}">${order.status}</span></td>
                    <td data-label="DATE">${order.date}</td>
                    <td data-label="AMOUNT" class="${isRefund ? 'red' : 'yellow'}">
                        ${isRefund ? '-$' : '$'}${numericAmount.toFixed(2)}
                    </td>
                </tr>
            `;
        }).join('');
    }
}