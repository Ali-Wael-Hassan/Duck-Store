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
            id: "user_" + Date.now(),
            avatar: "/assets/users/guest.png",
            points: 0,
            readings: 0,
            reviews: 0,
            joinDate: new Date().getFullYear().toString(),          
            ...userData,    
            loggedIn: true 
        };

        localStorage.setItem("user_session", JSON.stringify(sessionUser));
        StorageManager.save("user", [sessionUser]);

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
            picture: this.avatar,
            loggedIn: true,
            
            points: 1250,
            readings: 14,
            reviews: 3,
            joinDate: '2026',
            avatar: '/assets/users/guest.png'
        };

        this._saveSession(user);
        this.redirect(user.role);
    }

    manualSignUp(formData) {
        alert("Manual Sign-Up: " + JSON.stringify(formData));
        const { fullName, email, isAdmin } = formData;
        const newUser = {
            name: fullName,
            email: email,
            picture: null,
            role: isAdmin ? "admin" : "user",
            points: 0,
            readings: 0,
            reviews: 0,
            joinDate: '2026',
            avatar: '/assets/users/guest.png'
        };

        this._saveSession(newUser);
        this.redirect(newUser.role);
    }

    loginWithGoogle() {
        if (!this.tokenClient) return console.error("AuthManager: Client not ready");
        this.tokenClient.requestAccessToken({ prompt: "select_account" });
    }

    logout() {
        const session = JSON.parse(localStorage.getItem("user_session"));
        
        if (session && session.access_token) {
            try {
                google.accounts.oauth2.revoke(session.access_token, () => {
                    console.log('Google token revoked successfully');
                });
            } catch (err) {
                console.error("Failed to revoke Google token:", err);
            }
        }

        localStorage.removeItem("user_session");
        StorageManager.save("user", []);

        this.user = null;

        const isInHtmlFolder = window.location.pathname.includes('/html/');
        const destination = isInHtmlFolder ? "sign-in.html" : "html/sign-in.html";
        
        window.location.href = destination;
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