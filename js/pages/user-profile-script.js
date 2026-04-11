import { StorageManager } from '../core/StorageManager.js';

export class UserProfile {
    constructor() {
        const sessionData = StorageManager.get("user_session");
        this.user = sessionData ? sessionData : null;
        this.init();
    }

    init() {
        this.renderProfileHeader();
        this.renderMilestones();
        this.renderGlobalRank();
        this.renderStats();
        this.renderBadges();
        this.renderGenres();
        this.renderDynamicAchievements();
        this.setupEventListeners();
        this.animateProgressBars();
    }
    renderMilestones() {
        // 1. Target the count (e.g., 20)
        const milestoneEl = document.getElementById('stat-total-count');
        // 2. Target the name (e.g., "Scholar")
        const milestoneNameEl = document.getElementById('stat-next-milestone-name');
        // 3. Target the description
        const milestoneDescEl = document.getElementById('stat-next-milestone-desc');

        if (!milestoneEl) return;

        const readings = this.user.readings || 0;
        const nextMilestoneCount = Math.ceil((readings + 1) / 10) * 10;

        // Update the Milestone value
        milestoneEl.textContent = nextMilestoneCount;

        // Update the Milestone Section in the card
        if (milestoneNameEl) {
            milestoneNameEl.textContent = readings < 10 ? "Amateur Reader" : "Expert Bibliophile";
        }
        if (milestoneDescEl) {
            milestoneDescEl.textContent = `Read ${nextMilestoneCount} books to unlock the next rank.`;
        }
    }

    renderGlobalRank() {
        const rankEl = document.getElementById('stat-global-rank');
        if (!rankEl) return;

        const points = this.user.points || 0;

        let rankTier = "Newbie";
        if (points >= 1000) rankTier = "Top 1%";
        else if (points >= 500) rankTier = "Top 5%";
        else if (points >= 100) rankTier = "Top 20%";
        else rankTier = "Top 50%";

        rankEl.textContent = rankTier;
    }

    renderGenres() {
        const grid = document.getElementById('dynamic-genre-grid');
        if (!grid) return;

        const genreGoals = [
            { id: "sci-fi", name: "Sci-Fi Explorer", icon: "🚀", current: this.user.sciFi || 0, total: 10 },
            { id: "history", name: "History Buff", icon: "📜", current: this.user.history || 0, total: 10 },
            { id: "mystery", name: "Master Sleuth", icon: "🔍", current: this.user.mystery || 0, total: 10 }
        ];

        grid.innerHTML = genreGoals.map(genre => {
            const isCompleted = genre.current >= genre.total;
            return `
            <article class="genre-card ${isCompleted ? 'completed' : ''}">
                <div class="genre-card-header">
                    <span class="genre-icon">${genre.icon}</span>
                    <span class="status-tag">${isCompleted ? 'Completed' : genre.current + '/' + genre.total}</span>
                </div>
                <h3 class="genre-title">${genre.name}</h3>
                <progress value="${genre.current}" max="${genre.total}" class="genre-progress"></progress>
            </article>
        `;
        }).join('');
    }

    renderBadges() {
        const grid = document.getElementById('dynamic-badge-grid');
        if (!grid) return;

        const readingCount = this.user.readings || 0;

        const badgeConfig = [
            { name: "Novice Reader", level: "Level 1", requirement: 1, icon: "📖" },
            { name: "Page Turner", level: "Level 2", requirement: 5, icon: "🔖" },
            { name: "Book Worm", level: "Level 3", requirement: 10, icon: "🐛" },
            { name: "Literary Legend", level: "Level 4", requirement: 25, icon: "👑" }
        ];

        grid.innerHTML = badgeConfig.map(badge => {
            const isUnlocked = readingCount >= badge.requirement;
            const statusText = isUnlocked ? "Unlocked" : `Need ${badge.requirement} books`;

            return `
                <article class="badge-item ${isUnlocked ? 'active' : 'locked'}">
                    <div class="badge-icon">${badge.icon}</div>
                    <p class="badge-level">${badge.level}</p>
                    <h3 class="badge-name">${badge.name}</h3>
                    <p class="badge-status">${statusText}</p>
                </article>
            `;
        }).join('');
    }

    renderProfileHeader() {
        const nameEl = document.getElementById('profile-full-name');
        const unameEl = document.getElementById('user-name');
        const emailEl = document.getElementById('profile-email');
        const avatarEl = document.getElementById('user-avatar');
        // Targeting the "Member Since" element
        const memberSinceEl = document.getElementById('profile-member-since');

        if (this.user) {
            // AuthManager uses 'name', HTML uses 'profile-full-name'
            if (nameEl) nameEl.textContent = this.user.name;

            if (unameEl) unameEl.textContent = this.user.uname;

            if (emailEl) emailEl.textContent = this.user.email;

            if (avatarEl) avatarEl.src = this.user.avatar;

            // NEW: Map 'joinDate' from your AuthManager session to the UI
            if (memberSinceEl) {
                memberSinceEl.textContent = `Member since ${this.user.joinDate || '2024'}`;
            }
        }
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

        const unlocked = achievementConfig.filter(ach => ach.condition(this.user));

        if (unlocked.length === 0) {
            grid.innerHTML = `<li class="contribution-item"><i>No achievements unlocked yet. Keep reading!</i></li>`;
            return;
        }

        grid.innerHTML = unlocked.map(ach => `
            <li class="contribution-item">
                <div class="contribution-link">
                    <span>${ach.icon}</span> ${ach.label}
                    <small>${ach.desc}</small>
                </div>
            </li>
        `).join('');
    }

    setupEventListeners() {
        const avatarInput = document.getElementById('avatar-upload');
        const changeBtn = document.getElementById('change-avatar-btn');
        const avatarImg = document.getElementById('user-avatar');

        if (changeBtn && avatarInput) {
            changeBtn.addEventListener('click', () => {
                avatarInput.click();
            });
        }

        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64Image = event.target.result;

                    if (avatarImg) avatarImg.src = base64Image;

                    this.user.avatar = base64Image;
                    StorageManager.save("user_session", this.user);

                    const allUsers = StorageManager.get("user");
                    const userIndex = allUsers.findIndex(u => u.email === this.user.email);

                    if (userIndex !== -1) {
                        allUsers[userIndex].avatar = base64Image;
                        StorageManager.save("user", allUsers);
                    }

                    console.log("Avatar saved successfully!");
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
