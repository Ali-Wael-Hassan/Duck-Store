import { StorageManager } from '../core/StorageManager.js';

export class AuthManager {
    /* Initiate the google client id (the server hosted on github) */
    constructor(clientId) {
        this.clientId = clientId;
        this.tokenClient = null;
    }

    /* Initiate the client token from google */
    initGoogleService() {
        if (!window.google?.accounts?.oauth2) {
            setTimeout(() => this.initGoogleService(), 200);
            return;
        }

        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.clientId,
            scope: "openid email profile",
            callback: (res) => this._handleTokenResponse(res),
        });
    }

    /* Saving current session with all needed data for other pages */
    _saveSession(userData) {
        const sessionUser = {
            id: userData.id || "user_" + Date.now(),
            name: userData.name,
            email: userData.email,
            avatar: userData.picture || `https://i.pravatar.cc/150?u=${userData.name}`,
            role: userData.role,
            loggedIn: true,
            points: 0, 
            readings: 0,
            reviews: 0,
            joinDate: new Date().getFullYear().toString()
        };

        // 1. Save for the current session
        localStorage.setItem("user_session", JSON.stringify(sessionUser));

        // 2. Save for the Auth legacy check (Array)
        StorageManager.save("user", [sessionUser]);

        // 3. Add to community leaderboard if not already there
        const community = StorageManager.get("community_users") || [];
        if (!community.find(u => u.email === sessionUser.email)) {
            community.push(sessionUser);
            StorageManager.save("community_users", community);
        }
    }

    manualLogin(formData) {
        const { email, isAdmin } = formData;
        const user = {
            id: 1,
            name: email.split('@')[0],
            email: email,
            role: isAdmin ? "admin" : "user",
            picture: null,
            loggedIn: true,
            points: 1250
        };

        this._saveSession(user);
        this.redirect(user.role);
    }

    manualSignUp(formData) {
        const { fullName, email, isAdmin } = formData;
        const newUser = {
            name: fullName,
            email: email,
            picture: null,
            role: isAdmin ? "admin" : "user"
        };

        this._saveSession(newUser);
        this.redirect(newUser.role);
    }

    loginWithGoogle() {
        if (!this.tokenClient) return console.error("AuthManager: Client not ready");
        this.tokenClient.requestAccessToken({ prompt: "select_account" });
    }

    logout() {
        localStorage.removeItem("user_session");
        StorageManager.save("user", []);
        
        const isInHtmlFolder = window.location.pathname.includes('/html/');
        window.location.href = isInHtmlFolder ? "../auth.html" : "auth.html";
    }

    async _handleTokenResponse(tokenResponse) {
        if (tokenResponse.error) return;
        try {
            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const data = await res.json();

            const user = {
                name: data.name,
                email: data.email,
                picture: data.picture,
                role: "user"
            };

            this._saveSession(user);
            this.redirect(user.role);
        } catch (err) {
            console.error("AuthManager: Google Fetch Failed", err);
        }
    }

    redirect(role) {
        const isInHtmlFolder = window.location.pathname.includes('/html/');
        const pathPrefix = isInHtmlFolder ? "" : "html/";
        const target = (role === "admin") ? `${pathPrefix}dashboard.html` : `${pathPrefix}home.html`;
        alert(`redirection: ${target}`);
        window.location.href = target;
    }

    checkExistingSession() {
        const session = JSON.parse(localStorage.getItem("user_session"));
        if (session && session.loggedIn && !window.location.pathname.includes('home.html')) {
            this.redirect(session.role);
        }
    }
}