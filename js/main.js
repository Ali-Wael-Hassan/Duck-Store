import { AuthPage } from './pages/auth-page.js'; 
import { BookViewPage } from './pages/book-view.js';
import { HomePage } from './pages/home-page.js'; 
import { CommunityPage } from './pages/community-page.js';
import { RewardPage } from './pages/reward-page.js'; // ADDED IMPORT
import { StorageManager } from './core/StorageManager.js';

class App {
    constructor() {
        StorageManager.initSeedData();
        
        this.user = StorageManager.get('user_session') || { loggedIn: false, name: "Guest User" };
        
        this.initLayoutObservers();
        this.init();
    }

    initLayoutObservers() {
        document.addEventListener('DOMContentLoaded', () => {
            // Updated to include .reward-header and .reward-panel for the Rewards layout
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
        });
    }

    init() {
        const pageType = document.body.dataset.page;
        const GOOGLE_CLIENT_ID = "40217212918-05rtn6rijo91gerq1ug036evpji3l4kg.apps.googleusercontent.com";

        if (pageType === 'auth') {
            if (this.user && this.user.loggedIn) {
                window.location.href = 'home.html';
                return;
            }
            new AuthPage(GOOGLE_CLIENT_ID);
        }

        if (pageType === 'community') {
            new CommunityPage();
        }

        if (pageType === 'book-view') {
            new BookViewPage();
        }

        if (pageType === 'home' || pageType === 'browse') {
            new HomePage(); 
        }

        if (pageType === 'rewards') {
            console.log("Rewards page initialized");
            new RewardPage(); // INITIALIZED CLASS
        }
    }
}

window.app = new App();