import { AuthPage } from './pages/auth-page.js'; 
import { BookViewPage } from './pages/book-view.js';
import { HomePage } from './pages/home-page.js'; 
import { CommunityPage } from './pages/community-page.js';
import { RewardPage } from './pages/reward-page.js';
import { UserProfilePage } from './pages/user-profile-script.js';
import { StorageManager } from './core/StorageManager.js';

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
            
            this.initLayoutObservers();
            
            await this.init();
        } catch (error) {
            console.error("App Assembly Failed:", error);
        }
    }

    initLayoutObservers() {
        const header = document.querySelector('.header') || document.querySelector('.main-nav') || document.querySelector('.reward-header');
        const sidebar = document.querySelector('.sidebar') || document.querySelector('.leaderboard-aside');
        const mainComp = document.querySelector('main');

        const updateLayout = () => {
            if (!mainComp) return;
            if (header) {
                const headerHeight = header.offsetHeight;
                mainComp.style.paddingTop = `${headerHeight}px`;
                if (sidebar) {
                    sidebar.style.top = `${headerHeight}px`;
                    sidebar.style.height = `calc(100vh - ${headerHeight}px)`;
                }
            }
        };

        const resizeObserver = new ResizeObserver(() => updateLayout());
        if (header) resizeObserver.observe(header);
        if (sidebar) resizeObserver.observe(sidebar);

        window.addEventListener('resize', updateLayout);
        updateLayout();
    }

    async init() {
        const pageType = document.body.dataset.page;
        const GOOGLE_CLIENT_ID = "40217212918-05rtn6rijo91gerq1ug036evpji3l4kg.apps.googleusercontent.com";
        const isInSubfolder = window.location.pathname.includes('/html/');

        if (pageType === 'auth') {
            if (this.user && this.user.loggedIn) {
                window.location.href = 'html/home.html';
                return;
            }
            new AuthPage(GOOGLE_CLIENT_ID);
            return; 
        }

        if (!this.user || !this.user.loggedIn) {
            console.warn("Unauthorized: Booting to login.");
            window.location.href = isInSubfolder ? '../auth.html' : 'auth.html';
            return;
        }

        switch (pageType) {
            case 'home':
            case 'browse':
                new HomePage();
                break;
            case 'profile':
                new UserProfilePage();
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
            default:
                console.log(`No handler for: ${pageType}`);
        }
    }
}

// Global App Instance
window.app = new App();