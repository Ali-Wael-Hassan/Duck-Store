import { StorageManager } from '../core/StorageManager.js';

export class CommunityPage {
    constructor() {
        // Fetch users from storage only. No hardcoded fallback array here.
        this.allUsers = StorageManager.get('community_users') || [];
        
        // Fetch the active session to highlight 'You' in the list
        this.currentUser = StorageManager.get('user_session');
        
        // Internal state for filtering (search)
        this.filteredUsers = [];
        
        this.init();
    }

    init() {
        // If data is missing (e.g., first load), we can't render yet.
        if (this.allUsers.length === 0) {
            console.warn("CommunityPage: No user data found in StorageManager.");
            this.renderEmptyState();
            return;
        }

        this.sortAndFilter();
        this.renderPodium();
        this.renderLeaderboardTable();
        this.renderGlobalStats();
        this.setupEventListeners();
    }

    sortAndFilter(query = "") {
        // 1. Filter by search query if provided
        let users = this.allUsers.filter(u => 
            u.name.toLowerCase().includes(query.toLowerCase())
        );

        // 2. Sort by points descending to establish ranks
        this.filteredUsers = users.sort((a, b) => b.points - a.points);
    }

    renderPodium() {
        const container = document.getElementById('podium-container');
        if (!container) return;

        // Take the top 3 from the master list (always based on all users, not search)
        const topThree = [...this.allUsers]
            .sort((a, b) => b.points - a.points)
            .slice(0, 3);

        if (topThree.length < 3) return;

        // Visual order for CSS: 2nd, 1st, 3rd
        const positions = [
            { ...topThree[1], rank: 2, slot: 'podium__card--2' },
            { ...topThree[0], rank: 1, slot: 'podium__card--1' },
            { ...topThree[2], rank: 3, slot: 'podium__card--3' }
        ];

        container.innerHTML = positions.map(user => `
            <article class="podium__card ${user.slot}">
                ${user.rank === 1 ? '<span class="podium__leader-tag">Current Leader</span>' : ''}
                <div class="podium__avatar">
                    <img src="${user.avatar || 'assets/logo.png'}" alt="${user.name}">
                    <span class="podium__rank">${user.rank}</span>
                </div>
                <h2 class="podium__name">${user.name}</h2>
                <span class="podium__role">${this.calculateTier(user.points)}</span>
                <div class="podium__points">${user.points.toLocaleString()} <span class="podium__points-label">PTS</span></div>
            </article>
        `).join('');
    }

    renderLeaderboardTable() {
        const tbody = document.getElementById('scholars-table-body');
        if (!tbody) return;

        // If search results are empty
        if (this.filteredUsers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; opacity: 0.5;">No scholars found.</td></tr>`;
            return;
        }

        // Displaying results. Rank is determined by position in sorted master list.
        tbody.innerHTML = this.filteredUsers.map(user => {
            const globalRank = this.allUsers.findIndex(u => u.id === user.id) + 1;
            const isMe = this.currentUser && user.id === this.currentUser.id;

            return `
                <tr class="${isMe ? 'scholars-table__user-row' : ''}">
                    <td>#${globalRank}</td>
                    <td>
                        <div class="scholar-info">
                            <img src="${user.avatar || 'assets/logo.png'}" alt="${user.name}">
                            <div>
                                <span class="scholar-info__name">${isMe ? 'You (' + user.name + ')' : user.name}</span>
                                <span class="scholar-info__meta">Member since ${user.joinDate || '2024'}</span>
                            </div>
                        </div>
                    </td>
                    <td>${user.readings || 0} books</td>
                    <td>${user.reviews || 0}</td>
                    <td class="highlighted-points">${user.points.toLocaleString()}</td>
                </tr>
            `;
        }).join('');
    }

    renderGlobalStats() {
        const container = document.getElementById('stats-container');
        if (!container) return;

        const totalPoints = this.allUsers.reduce((sum, u) => sum + u.points, 0);
        const totalBooks = this.allUsers.reduce((sum, u) => sum + (u.readings || 0), 0);

        container.innerHTML = `
            <article class="stats-grid__card">
                <span class="stats-grid__label">Active Members</span>
                <span class="stats-grid__value">${this.allUsers.length.toLocaleString()}</span>
                <div class="stats-grid__trend stats-grid__trend--up">
                    <i class="bi bi-graph-up"></i> +12% this week
                </div>
            </article>
            <article class="stats-grid__card">
                <span class="stats-grid__label">Books Logged</span>
                <span class="stats-grid__value">${(totalBooks / 1000).toFixed(1)}k</span>
                <div class="stats-grid__trend stats-grid__trend--up">
                    <i class="bi bi-graph-up"></i> +5% this week
                </div>
            </article>
            <article class="stats-grid__card">
                <span class="stats-grid__label">Knowledge Points</span>
                <span class="stats-grid__value">${(totalPoints / 1000000).toFixed(1)}M</span>
                <div class="stats-grid__trend stats-grid__trend--up">
                    <i class="bi bi-trophy"></i> Reward Tier Reached
                </div>
            </article>
            <article class="stats-grid__card stats-grid__card--event">
                <span class="stats-grid__label">Current Event</span>
                <span class="stats-grid__event-title">Summer Read</span>
                <div class="stats-grid__event-time">
                    <i class="bi bi-clock"></i> 12 days left
                </div>
            </article>
        `;
    }

    setupEventListeners() {
        const searchInput = document.querySelector('.search-form input');
        searchInput?.addEventListener('input', (e) => {
            this.sortAndFilter(e.target.value);
            this.renderLeaderboardTable();
        });
    }

    calculateTier(points) {
        if (points >= 15000) return "Grand Archivist";
        if (points >= 12000) return "Silver Scholar";
        if (points >= 10000) return "Bronze Scholar";
        return "Novice Scholar";
    }

    renderEmptyState() {
        const main = document.querySelector('.leaderboard-main');
        if (main) main.innerHTML = `<div style="text-align:center; padding: 5rem;"><h2>Loading Community Data...</h2></div>`;
    }
}