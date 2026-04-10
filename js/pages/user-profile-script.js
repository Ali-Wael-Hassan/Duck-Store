import { StorageManager } from '../core/StorageManager.js';

export class UserProfilePage {
    constructor() {
        this.user = StorageManager.get('user_session');
        this.communityUsers = StorageManager.get('community_users') || [];
        
        this.init();
    }

    init() {
        if (!this.user || !this.user.loggedIn) {
            window.location.href = 'auth.html'; // Protection: Redirect if not logged in
            return;
        }

        this.renderProfile();
        this.setupLogout();
    }

    renderProfile() {
        // 1. Fetch detailed stats from the community data (since session is just a snapshot)
        const detailedUser = this.communityUsers.find(u => u.id === this.user.id) || this.user;

        // 2. Identity & Avatar
        const avatarUrl = detailedUser.avatar || `https://i.pravatar.cc/150?u=${this.user.name}`;
        this.updateElement('user-name', detailedUser.name);
        this.updateElement('join-date', detailedUser.joinDate || '2024');
        
        const avatarImg = document.getElementById('user-avatar');
        if (avatarImg) avatarImg.src = avatarUrl;
        
        const navAvatar = document.getElementById('nav-avatar');
        if (navAvatar) navAvatar.src = avatarUrl;

        // 3. Stats & Progress
        this.updateElement('total-points', detailedUser.points.toLocaleString());
        
        const readings = detailedUser.readings || 0;
        this.updateElement('books-read', readings);
        
        const progressBar = document.getElementById('read-progress');
        if (progressBar) progressBar.value = readings;

        // 4. Dynamic Rank Calculation
        // We sort the leaderboard to find where the current user stands
        const sortedLeaderboard = [...this.communityUsers].sort((a, b) => b.points - a.points);
        const rankIndex = sortedLeaderboard.findIndex(u => u.id === this.user.id);
        
        if (rankIndex !== -1) {
            this.updateElement('global-rank', `#${rankIndex + 1}`);
        }
    }

    // Helper to safely update text content
    updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    setupLogout() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                // Wipe session and return to auth
                StorageManager.save('user_session', { loggedIn: false, name: "Guest User", points: 0 });
                window.location.href = 'auth.html';
            });
        }
    }
}