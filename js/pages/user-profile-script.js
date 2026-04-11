import { StorageManager } from '../core/StorageManager.js';

export class UserProfile {
    constructor() {
        const sessionData = localStorage.getItem("user_session");
        this.user = sessionData ? JSON.parse(sessionData) : null;

        if (!this.user || !this.user.loggedIn) {
            window.location.href = "../auth.html";
            return;
        }

        this.init();
    }

    init() {
        this.renderProfileHeader();
        this.renderStats();
        this.renderDynamicAchievements(); 
        this.setupEventListeners();
        this.animateProgressBars();
    }

    renderProfileHeader() {
        const nameEl = document.getElementById('profile-full-name');
        const emailEl = document.getElementById('profile-email');
        const avatarEl = document.getElementById('user-avatar');

        if (nameEl) nameEl.textContent = this.user.name;
        if (emailEl) emailEl.textContent = this.user.email;
        if (avatarEl) avatarEl.src = this.user.avatar;
    }

    renderStats() {
        const readings = this.user.readings || 0;
        const points = this.user.points || 0;

        const countEl = document.getElementById('stat-unlocked-count');
        const barEl = document.getElementById('stat-progress-bar');
        const trendEl = document.getElementById('stat-rank-trend');

        if (countEl) countEl.textContent = readings;
        if (barEl) {
            barEl.value = readings;
            barEl.max = 50; 
        }
        if (trendEl) trendEl.textContent = `Total Points: ${points}`;
    }

    renderDynamicAchievements() {
        const grid = document.querySelector('.contributor-grid');
        if (!grid) return;

        const achievementConfig = [
            { 
                label: "Book Reviewer", 
                icon: "📚", 
                condition: (u) => u.reviews > 0, 
                desc: `${this.user.reviews} Reviews Written` 
            },
            { 
                label: "Chatterbox", 
                icon: "💬", 
                condition: (u) => u.points >= 50, 
                desc: "Active in community chats" 
            },
            { 
                label: "Avid Reader", 
                icon: "🌟", 
                condition: (u) => u.readings >= 5, 
                desc: "Completed 5+ books" 
            },
            { 
                label: "Lumina Pioneer", 
                icon: "🚀", 
                condition: (u) => u.joinDate === "2024", 
                desc: "Early access member" 
            }
        ];

        // Only show items where the condition is true
        const unlocked = achievementConfig.filter(ach => ach.condition(this.user));

        if (unlocked.length === 0) {
            grid.innerHTML = `<li class="contribution-item"><i>No achievements unlocked yet. Keep reading!</i></li>`;
            return;
        }

        grid.innerHTML = unlocked.map(ach => `
            <li class="contribution-item">
                <div class="contribution-link">
                    <span>${ach.icon}</span> ${ach.label}
                    <small style="display:block; font-size: 0.75rem; color: var(--text-muted);">${ach.desc}</small>
                </div>
            </li>
        `).join('');
    }

    setupEventListeners() {
        // Handle Avatar Change & Sync with Storage
        const avatarInput = document.getElementById('avatar-upload');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target.result;
                    
                    // 1. Update Session
                    this.user.avatar = base64;
                    localStorage.setItem("user_session", JSON.stringify(this.user));
                    
                    // 2. Update StorageManager's user list (for community/leaderboards)
                    const users = StorageManager.get("user"); 
                    const idx = users.findIndex(u => u.email === this.user.email);
                    if (idx !== -1) {
                        users[idx].avatar = base64;
                        StorageManager.save("user", users);
                    }
                    document.getElementById('user-avatar').src = base64;
                };
                reader.readAsDataURL(file);
            });
        }
    }

    animateProgressBars() {
        const bars = document.querySelectorAll('.progress-bar, .genre-progress');
        bars.forEach(bar => {
            const target = bar.value;
            bar.value = 0;
            setTimeout(() => bar.value = target, 400);
        });
    }
}
