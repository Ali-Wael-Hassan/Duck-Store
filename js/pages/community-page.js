import { StorageManager } from 'core/StorageManager.js';

export class CommunityPage {
    constructor() {
        /* fetch the data */
        this.allUsers = StorageManager.get('community_users') || [];
        this.currentUser = StorageManager.get('user_session');
        this.filteredUsers = [];
        
        this.init();
    }

    init() {
        if (this.allUsers.length === 0) {
            console.warn("CommunityPage: No user data found in StorageManager.");
            this.renderEmptyState();
            return;
        }

        /* sort and filter */
        this.sortAndFilter();

        /* render podium (1st, 2nd, 3rd) */
        this.renderPodium();
        
        /* render the leaderboard table */
        this.renderLeaderboardTable();

        /* global stats (Active members, total points, etc) */
        this.renderGlobalStats();

        /* setup event listeners */
        this.setupEventListeners();
    }

    sortAndFilter(query = "") {
        let users = this.allUsers.filter(u => {
            const userName = u.name || "Anonymous Scholar";
            return userName.toLowerCase().includes(query.toLowerCase());
        });

        // Sort descending by points, falling back to 0 if undefined
        this.filteredUsers = users.sort((a, b) => (b.points || 0) - (a.points || 0));
    }

    /**
     * Renders the top 3 cards on the podium.
     */
    renderPodium() {
        const container = document.getElementById('podium-container');
        if (!container) return;

        // Ensure we are working with a fresh sort of all users
        const topThree = [...this.allUsers]
            .sort((a, b) => (b.points || 0) - (a.points || 0))
            .slice(0, 3);

        if (topThree.length < 3) {
            container.innerHTML = `<p style="text-align:center; width:100%; opacity:0.5;">Awaiting more competitors...</p>`;
            return;
        }

        // Layout mapping: Rank 2 (left), Rank 1 (center), Rank 3 (right)
        const positions = [
            { ...topThree[1], rank: 2, slot: 'podium__card--2' },
            { ...topThree[0], rank: 1, slot: 'podium__card--1' },
            { ...topThree[2], rank: 3, slot: 'podium__card--3' }
        ];

        container.innerHTML = positions.map(user => `
            <article class="podium__card ${user.slot}">
                ${user.rank === 1 ? '<span class="podium__leader-tag">Current Leader</span>' : ''}
                <div class="podium__avatar">
                    <img src="${user.avatar || '/assets/dummy/a10.jpg'}" alt="${user.name || 'Scholar'}">
                    <span class="podium__rank">${user.rank}</span>
                </div>
                <h2 class="podium__name">${user.name || 'Unknown'}</h2>
                <span class="podium__role">${this.calculateTier(user.points || 0)}</span>
                <div class="podium__points">${(user.points || 0).toLocaleString()} <span class="podium__points-label">PTS</span></div>
            </article>
        `).join('');
    }

    /**
     * Renders the main leaderboard list.
     */
    renderLeaderboardTable() {
        const tbody = document.getElementById('scholars-table-body');
        if (!tbody) return;

        if (this.filteredUsers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; opacity: 0.5;">No scholars found matching your search.</td></tr>`;
            return;
        }

        tbody.innerHTML = this.filteredUsers.map(user => {
            // Find global rank from the unfiltered, sorted list
            const globalRank = this.allUsers
                .sort((a, b) => (b.points || 0) - (a.points || 0))
                .findIndex(u => u.id === user.id) + 1;
            
            const isMe = this.currentUser && (user.id === this.currentUser.id || user.email === this.currentUser.email);

            return `
                <tr class="${isMe ? 'scholars-table__user-row' : ''}">
                    <td>#${globalRank}</td>
                    <td>
                        <div class="scholar-info">
                            <img src="${user.avatar || '/assets/dummy/a10.jpg'}" alt="${user.name}">
                            <div>
                                <span class="scholar-info__name">${isMe ? 'You (' + user.name + ')' : user.name}</span>
                                <span class="scholar-info__meta">Member since ${user.joinDate || '2026'}</span>
                            </div>
                        </div>
                    </td>
                    <td>${user.readings || 0} books</td>
                    <td>${user.reviews || 0}</td>
                    <td class="highlighted-points">${(user.points || 0).toLocaleString()}</td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Renders global aggregate statistics.
     */
    renderGlobalStats() {
        const container = document.getElementById('stats-container');
        if (!container) return;

        const totalPoints = this.allUsers.reduce((sum, u) => sum + (u.points || 0), 0);
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
        if (main) {
            main.innerHTML = `
                <div style="text-align:center; padding: 5rem; opacity: 0.6;">
                    <i class="bi bi-people" style="font-size: 3rem;"></i>
                    <h2>No Scholars Found</h2>
                    <p>Be the first to join the community!</p>
                </div>
            `;
        }
    }
}