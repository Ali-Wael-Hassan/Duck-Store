import { StorageManager } from '../core/StorageManager.js';

export class AuthManager {
    constructor(clientId) {
        this.clientId = clientId;
        this.tokenClient = null;
        this.inputMap = StorageManager.get('gamification-config');
    }

    _showAuthError(message) {
        let errorEl = document.getElementById('auth-error-msg');
        
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.id = 'auth-error-msg';
            Object.assign(errorEl.style, {
                color: '#e74c3c',
                fontSize: '14px',
                marginTop: '12px',
                textAlign: 'center',
                fontWeight: '500',
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(231, 76, 60, 0.1)'
            });
            
            const activeForm = document.querySelector('form');
            if (activeForm) activeForm.appendChild(errorEl);
        }
        
        errorEl.textContent = message;
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

    _saveSession(userData) {
        const { password, ...safeUserData } = userData;
        alert(userData.points);
        alert(this.inputMap.loginPoints);

        const sessionUser = {
            id: safeUserData.id || "user_" + Date.now(),
            avatar: safeUserData.avatar || safeUserData.picture || "/assets/users/guest.png",
            points: safeUserData.points || 0,
            readings: safeUserData.readings || 0,
            reviews: safeUserData.reviews || 0,
            joinDate: safeUserData.joinDate || '2026',
            role: safeUserData.role || "user",
            userBooks: safeUserData.userBooks || [],
            borrowedBooks: safeUserData.borrowedBooks || [],
            ...safeUserData,
            loggedIn: true 
        };

        StorageManager.save("user_session", sessionUser);

        const allUsers = StorageManager.get("users") || [];
        const userIndex = allUsers.findIndex(u => u.email === sessionUser.email);
        if (userIndex !== -1) {
            allUsers[userIndex] = { ...allUsers[userIndex], ...sessionUser };
            StorageManager.save("users", allUsers);
        }

        const community = StorageManager.get("community_users") || [];
        const commIndex = community.findIndex(u => u.email === sessionUser.email);
        if (commIndex === -1) {
            community.push(sessionUser);
        } else {
            community[commIndex] = { ...community[commIndex], ...sessionUser };
        }
        StorageManager.save("community_users", community);
    }

    manualLogin(formData) {
        const { email, password } = formData;
        const allUsers = StorageManager.get("users") || [];

        const existingUser = allUsers.find(u => u.email === email && u.password);

        if (!existingUser) {
            this._showAuthError("No account found with this email.");
            return;
        }

        if (existingUser.password !== password) {
            this._showAuthError("Incorrect password. Please try again.");
            return;
        }

        const today = new Date().toDateString();
        if (!existingUser.lastLogin) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            existingUser.lastLogin = yesterday.toDateString();
        }
        if (existingUser.lastLogin && new Date(existingUser.lastLogin).toDateString() !== today) {
            existingUser.points += this.inputMap.loginPoints;
        }

        existingUser.lastLogin = today;

        this._saveSession(existingUser);
        this.redirect(existingUser.role);
    }

    manualSignUp(formData) {
        const { fullName, email, password, isAdmin } = formData;
        const allUsers = StorageManager.get("users") || [];

        if (!password || password.length < 4) {
            this._showAuthError("Password must be at least 4 characters long.");
            return;
        }

        if (allUsers.find(u => u.email === email)) {
            this._showAuthError("This email is already registered.");
            return;
        }

        const newUser = {
            id: "user_" + Date.now(),
            name: fullName,
            email: email,
            password: password,
            role: isAdmin ? "admin" : "user",
            points: 0,
            readings: 0,
            reviews: 0,
            joinDate: '2026',
            avatar: '/assets/users/guest.png',
            userBooks: [],
            borrowedBooks: []        
        };

        const today = new Date().toDateString();

        if (newUser.lastLogin && new Date(newUser.lastLogin).toDateString() !== today) {
            newUser.points += this.inputMap.loginPoints;
        }

        allUsers.push(newUser);
        StorageManager.save("users", allUsers);

        window.location.href = "sign-in.html";
    }

    loginWithGoogle() {
        if (!this.tokenClient) return console.error("AuthManager: Client not ready");
        this.tokenClient.requestAccessToken({ prompt: "select_account" });
    }

    logout() {
        const session = JSON.parse(localStorage.getItem("user_session"));
        if (session?.access_token) {
            try {
                google.accounts.oauth2.revoke(session.access_token);
            } catch (err) {
                console.error("Token revocation failed", err);
            }
        }
        localStorage.removeItem("user_session");
        const isInHtmlFolder = window.location.pathname.includes('/html/');
        window.location.href = isInHtmlFolder ? "sign-in.html" : "html/sign-in.html";
    }

    async _handleTokenResponse(tokenResponse) {
        if (tokenResponse.error) return;
        try {
            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const data = await res.json();

            const allUsers = StorageManager.get("users") || [];
            let localUser = allUsers.find(u => u.email === data.email);

            if (!localUser) {
                localUser = {
                    id: "user_" + Date.now(),
                    name: data.name,
                    email: data.email,
                    password: null,
                    avatar: data.picture,
                    role: "user",
                    points: 0,
                    readings: 0,
                    reviews: 0,
                    joinDate: '2026'
                };
                allUsers.push(localUser);
                StorageManager.save("users", allUsers);
            }

            this._saveSession({ ...localUser, access_token: tokenResponse.access_token });
            this.redirect(localUser.role);
        } catch (err) {
            console.error("AuthManager: Google Fetch Failed", err);
        }
    }

    redirect(role) {
        const isInHtmlFolder = window.location.pathname.includes('/html/');
        const pathPrefix = isInHtmlFolder ? "" : "html/";
        const target = (role === "admin" || role === "manager") 
            ? `${pathPrefix}dashboard.html` 
            : `${pathPrefix}home.html`;
        
        window.location.href = target;
    }

    checkExistingSession() {
        const session = JSON.parse(localStorage.getItem("user_session"));
        if (session && session.loggedIn) {
            this.redirect(session.role);
        }
    }
}