import { StorageManager } from '../core/StorageManager.js';

export class UsersRolesController {
    constructor() {
        this.users = [];
        this.filteredUsers = [];
        this.currentPage = 1;
        this.rowsPerPage = 5;
        this.currentFilter = 'all';
        
        this.init();
    }

    async init() {
        await StorageManager.initSeedData(); 
        this.refreshData();
        this.initEventListeners();
    }

    refreshData() {
        const rawData = StorageManager.get("community_users") || [];
        
        this.users = rawData.map(u => ({
            ...u,
            role: u.role || (u.id === 'user_1' ? 'Admin' : 'User'),
            email: u.email || `${u.name.toLowerCase().replace(/\s+/g, '.')}@lumina.com`,
            status: u.points > 0 ? 'active' : 'offline',
            lastActive: u.lastActive || '11 / 04 / 2026'
        }));

        this.applyFilter();
    }

    initEventListeners() {
        // Pagination
        document.getElementById('prev-page')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderTable();
            }
        });

        document.getElementById('next-page')?.addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredUsers.length / this.rowsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderTable();
            }
        });

        // Role Filters
        const filterContainer = document.getElementById('role-filters');
        filterContainer?.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter');
            if (!btn) return;
            filterContainer.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.currentFilter = btn.getAttribute('data-role');
            this.currentPage = 1; 
            this.applyFilter();
        });

        // BINDING: Edit Role Button (Event Delegation)
        const tbody = document.getElementById('user-tbody');
        tbody?.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit');
            if (editBtn) {
                const userId = editBtn.getAttribute('data-id');
                this.handleEditRole(userId);
            }
        });
    }

    // Logic to swap/update the role in Storage
    handleEditRole(userId) {
        const rawData = StorageManager.get("community_users") || [];
        const userIndex = rawData.findIndex(u => u.id === userId);

        if (userIndex !== -1) {
            const currentRole = rawData[userIndex].role || (rawData[userIndex].id === 'user_1' ? 'Admin' : 'User');
            // Simple swap logic: If Admin -> User, If User -> Admin
            const newRole = currentRole.toLowerCase() === 'admin' ? 'User' : 'Admin';
            
            if (confirm(`Change ${rawData[userIndex].name}'s role to ${newRole}?`)) {
                rawData[userIndex].role = newRole;
                StorageManager.save("community_users", rawData); // Save back to correct key
                this.refreshData(); // Refresh UI
            }
        }
    }

    applyFilter() {
        this.filteredUsers = this.currentFilter === 'all' 
            ? this.users 
            : this.users.filter(u => u.role.toLowerCase() === this.currentFilter.toLowerCase());
        
        this.renderTable();
    }

    renderTable() {
        const tbody = document.getElementById('user-tbody');
        const paginationInfo = document.getElementById('pagination-info');
        if (!tbody) return;

        const total = this.filteredUsers.length;
        const startDisplay = total === 0 ? 0 : (this.currentPage - 1) * this.rowsPerPage + 1;
        const endDisplay = Math.min(this.currentPage * this.rowsPerPage, total);
        const startSlice = (this.currentPage - 1) * this.rowsPerPage;
        const currentSlice = this.filteredUsers.slice(startSlice, startSlice + this.rowsPerPage);

        if (paginationInfo) {
            paginationInfo.innerText = `Showing ${startDisplay}-${endDisplay} of ${total} users`;
        }

        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        if (prevBtn) prevBtn.disabled = (this.currentPage === 1);
        if (nextBtn) nextBtn.disabled = (endDisplay >= total);

        if (currentSlice.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem;">No users found.</td></tr>`;
            return;
        }

        tbody.innerHTML = currentSlice.map(user => `
            <tr>
                <td>
                    <img src="${user.avatar}" class="avatar-img" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover;">
                    <div class="user-info">
                        <div class="user-name">${user.name}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                </td>
                <td><span class="role ${user.role.toLowerCase()}">${user.role}</span></td>
                <td><span class="status ${user.status === 'active' ? 'active-status' : 'offline'}">${user.status}</span></td>
                <td>${user.lastActive}</td>
                <td class="action-buttons">
                    <button class="edit" type="button" data-id="${user.id}">
                        Edit Role <span class="material-symbols-outlined">edit</span>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}