const GOOGLE_CLIENT_ID = "40217212918-05rtn6rijo91gerq1ug036evpji3l4kg.apps.googleusercontent.com";

let tokenClient = null;

function initGoogleSignIn() {
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        setTimeout(initGoogleSignIn, 200);
        return;
    }

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        callback: handleTokenResponse,
    });

    console.log("Google Sign-In initialized");
}

async function handleTokenResponse(tokenResponse) {
    if (tokenResponse.error) {
        console.error("Google OAuth error:", tokenResponse.error);
        return;
    }

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

        localStorage.setItem("user", JSON.stringify(user));
        redirectUser(user.role);
    } catch (err) {
        console.error("Failed to fetch Google user info:", err);
    }
}

function googleLogin() {
    if (!tokenClient) {
        console.warn("Google Sign-In not ready yet, retrying...");
        setTimeout(googleLogin, 300);
        return;
    }
    tokenClient.requestAccessToken({ prompt: "select_account" });
}

window.onload = () => {
    initGoogleSignIn();

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
        const user = JSON.parse(savedUser);
        redirectUser(user.role);
    }

    const loginForm = document.getElementById("login-form");
    const adminCheckbox = document.getElementById("admin-toggle");

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const user = {
                name: "Manual User",
                role: (adminCheckbox && adminCheckbox.checked) ? "admin" : "user"
            };

            localStorage.setItem("user", JSON.stringify(user));
            redirectUser(user.role);
        });
    }
};

function redirectUser(role) {
    if (role === "admin") {
        window.location.href = "dashboard.html";
    } else {
        window.location.href = "home.html";
    }
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}