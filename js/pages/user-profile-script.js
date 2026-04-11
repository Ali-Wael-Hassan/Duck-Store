
const BADGE_DATA = [
    { name: "Daily Reader", level: "Level 3", status: "7 Day Streak", icon: "🔥", active: true },
    { name: "Night Owl", level: "Level 1", status: "Read after 11 PM", icon: "🦉", active: true },
    { name: "Social Butterfly", level: "Level 2", status: "10 Comments", icon: "💬", active: true },
    { name: "Collector", level: "Locked", status: "Buy 5 Books", icon: "📚", active: false },
    { name: "Reviewer", level: "Locked", status: "Write a Review", icon: "✍️", active: false }
];

document.addEventListener('DOMContentLoaded', () => {

    renderBadges();
    animateProgressBars();
    initGenreCards();
    initCommunityLinks();
    initActionButtons();
});

function renderBadges() {
    const grid = document.querySelector('.badge-grid');
    if (!grid) return;

   
    grid.innerHTML = BADGE_DATA.map(badge => `
        <article class="badge-item ${badge.active ? 'active' : 'locked'}">
            <div class="badge-icon" aria-hidden="true">${badge.icon}</div>
            <p class="badge-level">${badge.level}</p>
            <h3 class="badge-name">${badge.name}</h3>
            <p class="badge-status">${badge.status}</p>
        </article>
    `).join('');
}


function animateProgressBars() {
    const bars = document.querySelectorAll('.progress-bar, .genre-progress');
    
    bars.forEach(bar => {
        const targetValue = bar.getAttribute('value');
        bar.value = 0; 
        
        setTimeout(() => {
            bar.style.transition = 'all 1.5s ease-in-out';
            bar.value = targetValue;
        }, 300);
    });
}


function initGenreCards() {
    const genreCards = document.querySelectorAll('.genre-card');

    genreCards.forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('locked')) {

                card.classList.add('shake-effect');
                setTimeout(() => card.classList.remove('shake-effect'), 500);
            } else {
            
                card.style.transform = 'scale(1.05)';
                setTimeout(() => card.style.transform = 'scale(1)', 200);
            }
        });
    });
}


function initCommunityLinks() {
    const communityItems = document.querySelectorAll('.contribution-item');

    communityItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(8px)';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
        });
    });
}


function initActionButtons() {
    const shareBtn = document.querySelector('.btn-secondary');
    const leaderboardBtn = document.querySelector('.btn-primary');

    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                const originalText = shareBtn.textContent;
                shareBtn.textContent = "URL Copied!";
                setTimeout(() => shareBtn.textContent = originalText, 2000);
            });
        });
    }

    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', () => {
            console.log("Redirecting to Leaderboard...");
            window.location.href = 'leaderboard.html';
        });
    }
}