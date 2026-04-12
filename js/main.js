import { AuthPage } from './pages/auth-page.js';
import { BookViewPage } from './pages/book-view.js';
import { HomePage } from './pages/home-page.js';
import { CommunityPage } from './pages/community-page.js';
import { RewardPage } from './pages/reward-page.js';
import { StorageManager } from './core/StorageManager.js';
import { DashboardController } from './pages/dashboard-page.js';
import { InventoryController } from './pages/Book-&-inventory.js';
import { SalesRefundsController } from './pages/sales_refunds.js';
import { UsersRolesController } from './pages/users_roles.js';
import { MyBooksPage } from './pages/my_books.js';
import { StorePage } from './pages/store-page.js';
import { UserProfile } from './pages/user-profile-script.js';
import { AuthManager } from './modules/AuthManager.js';
import { GamificationAdmin } from './pages/gamification.js';

class App {
    constructor() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.assemble());
        } else {
            this.assemble();
        }
    }

    async assemble() {
        try {
            await StorageManager.initSeedData();
            this.user = StorageManager.get('user_session');

            this.setupUserAvatar();
            this.setupGlobalUI();


            await this.init();
        } catch (error) {
            console.error("App Assembly Failed:", error);
        }
    }

    setupUserAvatar() {
        const avatarImg = document.querySelector('.avatar-img');
        if (avatarImg && this.user) {
            avatarImg.src = this.user.avatar || '/assets/users/guest.png';
            avatarImg.alt = `${this.user.name}'s Profile`;

            Object.assign(avatarImg.style, {
                backgroundColor: '#f8f9fa',
                display: 'block',
                objectFit: 'cover'
            });

            avatarImg.onerror = () => {
                avatarImg.src = '/assets/dummy/a1.jpg';
            };
        }
    }

    setupGlobalUI() {
        const logoContainers = document.querySelectorAll('.logo-group');

        const logoHTML = `
            <div class="logo-icon">
                <span class="material-symbols-outlined">menu_book</span>
            </div>
            <div class="logo-text">DUCK</div>
        `;

        logoContainers.forEach(container => {
            container.innerHTML = logoHTML;
            container.style.cursor = 'pointer';
            container.onclick = () => {
                window.location.href = window.location.pathname.includes('/html/') ? 'home.html' : 'html/home.html';
            };
        });
    }

    async init() {
        const pageType = document.body.dataset.page;
        const GOOGLE_CLIENT_ID = "40217212918-05rtn6rijo91gerq1ug036evpji3l4kg.apps.googleusercontent.com";
        const isInSubfolder = window.location.pathname.includes('/html/');

        window.AuthEngine = new AuthManager(GOOGLE_CLIENT_ID);

        if (this.user && !this.user.loggedIn && pageType != 'auth' && pageType != 'about-us') {
            window.location.href = '../index.html';
            return;
        }

        if (pageType === 'about-us' && this.user && this.user.loggedIn) {
            if (this.user.role === 'admin') window.location.href = isInSubfolder ? 'dashboard.html' : 'html/dashboard.html';
            else window.location.href = isInSubfolder ? 'home.html' : 'html/home.html';
            return;
        }

        if (pageType === 'auth') {
            if (this.user && this.user.loggedIn) {
                if (this.user.role === 'admin') window.location.href = isInSubfolder ? 'dashboard.html' : 'html/dashboard.html';
                else window.location.href = isInSubfolder ? 'home.html' : 'html/home.html';
                return;
            }
            new AuthPage(GOOGLE_CLIENT_ID);
            return;
        }

        if (!this.user || !this.user.loggedIn) {
            console.warn("Unauthorized: Booting to login.");
            window.location.href = isInSubfolder ? 'sign-in.html' : 'html/sign-in.html';
            return;
        }

        const adminPages = ['dashboard', 'inventory', 'sales-refunds', 'users-roles'];

        if (adminPages.includes(pageType) && this.user.role === 'user') {
            console.error("Access Denied: User role cannot access admin pages.");
            window.location.href = isInSubfolder ? 'home.html' : 'html/home.html';
            return;
        }

        switch (pageType) {
            case 'home':
            case 'browse':
                new HomePage();
                break;
            case 'community':
                new CommunityPage();
                break;
            case 'book-view':
                new BookViewPage();
                break;
            case 'rewards':
                new RewardPage();
                break;
            case 'dashboard':
                new DashboardController();
                break;
            case 'inventory':
                new InventoryController();
                break;
            case 'sales-refunds':
                new SalesRefundsController();
                break;
            case 'users-roles':
                new UsersRolesController();
                break;
            case 'my-books':
                new MyBooksPage();
                break;
            case 'store':
                new StorePage();
                break;
            case 'user-profile':
                new UserProfile();
                break;
            case 'gamification':
                new GamificationAdmin();
                break;
            default:
                console.log(`No handler for: ${pageType}`);
        }
    }
}

// Global App Instance
window.app = new App();