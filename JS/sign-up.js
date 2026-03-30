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
        callback: handleGoogleSignUp,
    });

    console.log("Google Sign-In initialized for sign-up");
}

async function handleGoogleSignUp(tokenResponse) {
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
            role: "user"  // Google sign‑up always creates a standard user
        };

        localStorage.setItem("user", JSON.stringify(user));
        redirectUser(user.role);
    } catch (err) {
        console.error("Failed to fetch Google user info:", err);
    }
}

function googleSignUp() {
    if (!tokenClient) {
        console.warn("Google Sign-In not ready yet, retrying...");
        setTimeout(googleSignUp, 300);
        return;
    }
    tokenClient.requestAccessToken({ prompt: "select_account" });
}

function manualSignUp(event) {
    event.preventDefault();

    const fullName = document.getElementById("full-name").value.trim();
    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value;
    const adminToggle = document.getElementById("admin-toggle");
    const termsCheckbox = document.getElementById("terms-agreement");

    // Basic validation
    if (!fullName || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }
    if (!termsCheckbox.checked) {
        alert("You must agree to the Terms & Privacy.");
        return;
    }

    const user = {
        name: fullName,
        email: email,
        picture: null,
        role: (adminToggle && adminToggle.checked) ? "admin" : "user"
    };

    localStorage.setItem("user", JSON.stringify(user));
    redirectUser(user.role);
}

function redirectUser(role) {
    if (role === "admin") {
        window.location.href = "dashboard.html";
    } else {
        window.location.href = "home.html";
    }
}

window.onload = () => {
    initGoogleSignIn();

    // If already logged in, skip sign‑up and go to the appropriate page
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
        const user = JSON.parse(savedUser);
        redirectUser(user.role);
        return;
    }

    // Attach manual form submission
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", manualSignUp);
    }

    // Attach Google button click
    const googleBtn = document.querySelector(".btn-outline");
    if (googleBtn) {
        googleBtn.addEventListener("click", googleSignUp);
    }
};