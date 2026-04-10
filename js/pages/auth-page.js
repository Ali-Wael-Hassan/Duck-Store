import { AuthManager } from '../modules/AuthManager.js';

export class AuthPage {
    constructor(googleClientId) {
        this.auth = new AuthManager(googleClientId);
        
        this.form = document.getElementById("login-form") || document.getElementById("signup-form");
        this.terms = document.getElementById("terms-agreement");
        
        this.init();
    }

    init() {
        this.auth.initGoogleService();
        this.auth.checkExistingSession();
        this.bindEvents();
        window.authPage = this;
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener("submit", (e) => this.handleSubmit(e));
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        // Validation for Sign-up only
        if (this.form.id === "signup-form" && this.terms && !this.terms.checked) {
            return alert("Agree to terms!");
        }

        const formData = {
            email: document.getElementById("email-input").value,
            password: document.getElementById("password-input").value,
            isAdmin: document.getElementById("admin-toggle")?.checked,
            fullName: document.getElementById("full-name")?.value || "Manual User"
        };

        // Logic to handle either login or signup
        if (this.form.id === "login-form") {
            this.auth.manualLogin(formData); 
        } else {
            this.auth.manualSignUp(formData);
        }
    }

    googleLogin() {
        this.auth.loginWithGoogle();
    }
}