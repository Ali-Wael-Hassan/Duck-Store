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

            await this.init();
        } catch (error) {
            console.error("App Assembly Failed:", error);
        }
    }

    async init() {
        const pageType = document.body.dataset.page;
        const GOOGLE_CLIENT_ID = "40217212918-05rtn6rijo91gerq1ug036evpji3l4kg.apps.googleusercontent.com";
        const isInSubfolder = window.location.pathname.includes('/html/');

        if (this.user && !this.user.loggedIn && pageType != 'auth' && pageType != 'about-us') {
            window.location.href = '../index.html';
            return;
        }
        
        if (pageType === 'about-us' && this.user && this.user.loggedIn) {
            window.location.href = isInSubfolder ? 'home.html' : 'html/home.html';
            return;
        }

        if (pageType === 'auth') {
            if (this.user && this.user.loggedIn) {
                window.location.href = isInSubfolder ? 'home.html' : 'html/home.html';
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
            default:
                console.log(`No handler for: ${pageType}`);
        }
    }
}

// Global App Instance
window.app = new App();