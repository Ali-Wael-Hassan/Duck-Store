import { StorageManager } from '../core/StorageManager.js';

export class RewardPage {
    constructor() {
        this.user = StorageManager.get('user_session');
        
        this.rewards = StorageManager.get('reward_items') || []; 
        
        this.init();
    }

    init() {
        if (!this.user) return;
        this.renderPoints();
        this.renderBadges();
        this.renderRewards();
        this.setupEventListeners();
    }

    renderPoints() {
        const container = document.getElementById('points-display');
        if (!container) return;

        container.innerHTML = `
            <i class="bi bi-gem"></i>
            <span class="points-balance__label">CURRENT BALANCE</span>
            <span class="points-balance__value">${this.user.points.toLocaleString()}</span>
            <span class="points-balance__unit">PTS</span>
        `;
    }

    renderBadges() {
        const container = document.getElementById('sidebar-badges');
        if (!container) return;

        const badgeData = [
            { label: "30 Day Streak", icon: "🔥", color: "#ff4e50" },
            { label: "Book Worm", icon: "📖", color: "#2ecc71" },
            { label: "Reviewer Elite", icon: "✍️", color: "#9b59b6" },
            { label: "Socialite", icon: "💬", color: "#3498db" },
            { label: "Grand Sage", icon: "🧙‍♂️", color: "#f1c40f" }
        ];
        
        container.innerHTML = badgeData.map(badge => `
            <li class="badge-list__item" style="border-left: 4px solid ${badge.color}; background: rgba(255,255,255,0.05);">
                <span class="badge-list__head" style="background: ${badge.color};">${badge.icon}</span>
                ${badge.label}
            </li>
        `).join('');
    }

    renderRewards() {
        const grid = document.getElementById('rewards-grid');
        if (!grid) return;

        const badgeColors = {
            rare: "linear-gradient(45deg, #ff416c, #ff4b2b)",
            digital: "linear-gradient(45deg, #2193b0, #6dd5ed)",
            common: "linear-gradient(45deg, #bdc3c7, #2c3e50)",
            legendary: "linear-gradient(45deg, #f7971e, #ffd200)"
        };

        grid.innerHTML = this.rewards.map(item => {
            const canAfford = this.user.points >= item.cost;
            const bgGradient = badgeColors[item.type] || badgeColors.common;
            
            return `
                <article class="reward-card ${!canAfford ? 'reward-card--locked' : ''}">
                    <div class="reward-card__image" style="background-image: url('${item.img}')">
                        <span class="reward-card__badge" style="background: ${bgGradient};">
                            ${item.badge}
                        </span>
                    </div>
                    <div class="reward-card__content">
                        <h3 class="reward-card__title">${item.title}</h3>
                        <p class="reward-card__description">${item.desc}</p>
                        <div class="reward-card__footer">
                            <div class="reward-card__points ${!canAfford ? 'insufficient' : ''}">
                                <i class="bi bi-gem"></i> ${item.cost.toLocaleString()}
                            </div>
                            <button class="redeem-btn" 
                                ${!canAfford ? 'disabled' : ''} 
                                data-id="${item.id}">
                                ${canAfford ? 'REDEEM' : 'LOCKED'}
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }

    setupEventListeners() {
        document.getElementById('rewards-grid')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('redeem-btn')) {
                const rewardId = e.target.dataset.id;
                const reward = this.rewards.find(r => r.id == rewardId);
                this.handleRedeem(reward);
            }
        });
    }

    handleRedeem(reward) {
        if (this.user.points >= reward.cost) {
            this.user.points -= reward.cost;
            
            StorageManager.save('user_session', this.user);
            
            const community = StorageManager.get('community_users');
            const currentUser = community.find(u => u.id === this.user.id);
            if (currentUser) {
                currentUser.points = this.user.points;
                StorageManager.save('community_users', community);
            }
            let allUsers = StorageManager.get('users') || [];
            let i = allUsers.findIndex(e => e.email === this.user.email)
            if(i != -1) {
                allUsers[i].points = this.user.points
                StorageManager.save('users', allUsers);
            }
            
            this.renderPoints();
            this.renderRewards();
        }
    }
}