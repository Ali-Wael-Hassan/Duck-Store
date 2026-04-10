import { StorageManager } from '../core/StorageManager.js';

export class AuthManager {
    constructor(clientId) {
        this.clientId = clientId;
        this.tokenClient = null;
    }

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

    manualLogin(formData) {
        alert("Logic reached! Redirecting now...");
        const { email, isAdmin } = formData;
        
        /*
            add authentication here in Back end phase
        */
        const user = {
            name: email.split('@')[0],
            email: email,
            role: isAdmin ? "admin" : "user",
            picture: null
        };

        StorageManager.save("user", [user]);
        this.redirect(user.role);
    }

    manualSignUp(formData) {
        const { fullName, email, isAdmin } = formData;

        /*
            add check used in Back end phase
        */

        const newUser = {
            name: fullName,
            email: email,
            picture: null,
            role: isAdmin ? "admin" : "user",
            joined: new Date().toLocaleDateString()
        };

        StorageManager.save("user", [newUser]);
        this.redirect(newUser.role);
    }

    loginWithGoogle() {
        if (!this.tokenClient) return console.error("AuthManager: Client not ready");
        this.tokenClient.requestAccessToken({ prompt: "select_account" });
    }

    logout() {
        StorageManager.save("user", []);
        window.location.href = "index.html";
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

            StorageManager.save("user", [user]);
            this.redirect(user.role);
        } catch (err) {
            console.error("AuthManager: Google Fetch Failed", err);
        }
    }

    redirect(role) {
        const isInHtmlFolder = window.location.pathname.includes('/html/');
        const pathPrefix = isInHtmlFolder ? "" : "html/";

        const target = (role === "admin") ? `${pathPrefix}dashboard.html` : `${pathPrefix}home.html`;
        
        console.log("Attempting redirect to:", target);
        window.location.href = target;
    }

    checkExistingSession() {
        const user = StorageManager.get("user")[0];
        if (user && !window.location.pathname.includes('home.html')) {
            this.redirect(user.role);
        }
    }
}