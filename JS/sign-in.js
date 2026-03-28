let googleInitialized = false;

function initGoogleSignIn() {
    if (googleInitialized) return;
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
        console.log("Waiting for Google script...");
        setTimeout(initGoogleSignIn, 200);
        return;
    }

    google.accounts.id.initialize({
        client_id: "40217212918-05rtn6rijo91gerq1ug036evpji3l4kg.apps.googleusercontent.com",
        callback: handleCredentialResponse,
    });

    googleInitialized = true;
    console.log("Google Sign-In initialized");
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

function googleLogin() {
    if (!googleInitialized) {
        console.warn("Google Sign-In not ready yet, waiting...");
        const waitAndPrompt = setInterval(() => {
            if (googleInitialized) {
                clearInterval(waitAndPrompt);
                google.accounts.id.prompt(handlePromptMomentNotification);
            }
        }, 200);
    } else {
        google.accounts.id.prompt(handlePromptMomentNotification);
    }
}

function handlePromptMomentNotification(notification) {
    if (notification.isNotDisplayed()) {
        console.warn("One Tap not displayed:", notification.getNotDisplayedReason());
        console.info("Use the rendered Google button below the form instead.");
    }
    if (notification.isSkippedMoment()) {
        console.warn("One Tap skipped:", notification.getSkippedReason());
    }
}

function handleCredentialResponse(response) {
    const data = parseJwt(response.credential);
    const user = {
        name: data.name,
        email: data.email,
        picture: data.picture,
        role: "user"
    };
    localStorage.setItem("user", JSON.stringify(user));
    redirectUser(user.role);
}

function parseJwt(token) {
    return JSON.parse(atob(token.split('.')[1]));
}

function redirectUser(role) {
    if (role === "admin") {
        window.location.href = "dashboard.html";
    } else {
        window.location.href = "home.html";
    }
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "sign_in.html";
}