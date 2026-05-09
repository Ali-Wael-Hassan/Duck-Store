import { AuthPage } from './pages/auth-page.js';
import { BookViewPage } from './pages/book-view.js';
import { UserProfile } from './pages/user-profile-script.js';
import { AuthManager } from './modules/AuthManager.js';

// All URLs are flat (no html/ prefix) - served by Django
const URLS = {
    login:     '/sign-in.html',
    home:      '/home.html',
    dashboard: '/dashboard.html',
};

const GOOGLE_CLIENT_ID = "40217212918-05rtn6rijo91gerq1ug036evpji3l4kg.apps.googleusercontent.com";

class App {
    constructor() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        const pageType = document.body.dataset.page;

        window.AuthEngine = new AuthManager(GOOGLE_CLIENT_ID);


        let session = null;
        try {
            const res = await fetch('/api/check-session/');
            if (res.ok) session = await res.json();
        } catch (e) {
            console.warn('Session check failed:', e);
        }

        const isLoggedIn = session && session.logged_in;
        const isAdmin    = session && session.role === 'admin';

        this.setupUserAvatar(session);

        if (pageType === 'auth') {
            if (isLoggedIn) {
                window.location.href = isAdmin ? URLS.dashboard : URLS.home;
                return;
            }
            new AuthPage(GOOGLE_CLIENT_ID);
            return;
        }
        if (!isLoggedIn) {
            window.location.href = URLS.login;
            return;
        }

        const adminPages = ['dashboard', 'inventory', 'sales-refunds', 'users-roles', 'gamification'];
        if (adminPages.includes(pageType) && !isAdmin) {
            window.location.href = URLS.home;
            return;
        }

        switch (pageType) {
            case 'book-view':
                new BookViewPage();
                break;
            case 'user-profile':
                new UserProfile();
                break;
            default:
                break;
        }
    }

    setupUserAvatar(session) {
        const avatarImg = document.querySelector('.avatar-img');
        if (avatarImg && session && session.avatar) {
            avatarImg.src = session.avatar;
            Object.assign(avatarImg.style, {
                backgroundColor: '#f8f9fa',
                display: 'block',
                objectFit: 'cover'
            });
            avatarImg.onerror = () => {
                avatarImg.src = '';
            };
        }
    }
}

window.app = new App();