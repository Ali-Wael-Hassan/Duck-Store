const GOOGLE_CLIENT_ID = "40217212918-05rtn6rijo91gerq1ug036evpji3l4kg.apps.googleusercontent.com";

// User Token
let tokenClient = null;

// Start helper method for setting storage
function setStorageToken(type, data) {
    localStorage.setItem("user", JSON.stringify(user));
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "sign-in.html";
}

function redirectUser(role) {
    if (role === "admin") {
        window.location.href = "dashboard.html";
    } else {
        window.location.href = "home.html";
    }
}

// End of helpers

// Start Init Google Service
function initToken() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        callback: handleTokenResponse,
    });
}

function initGoogleSignIn() {
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        setTimeout(initGoogleSignIn, 200);
        return;
    }

    initToken();

    console.log("Google Sign-In initialized");
}
// End Init Google Service

// Start Handle Token Response
function initUser(data, role) {
    return {
        name: data.name,
        email: data.email,
        picture: data.picture,
        role: role
    };
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

        const user = initUser(data, "user");

        setStorageToken("user", JSON.stringify(user));
        redirectUser(user.role);
    } catch (err) {
        console.error("Failed to fetch Google user info:", err);
    }
}
// End Handle Token Response

// Google Login Interface
function googleLogin() {
    if (!tokenClient) {
        console.warn("Google Sign-In not ready yet, retrying...");
        setTimeout(googleLogin, 300);
        return;
    }
    tokenClient.requestAccessToken({ prompt: "select_account" });
}

// Start Searches for saved token in user storage
function compareToDB(savedUser) {
    return true;
}

function savedToken() {
    const savedUser = localStorage.getItem("user");
    if(compareToDB(savedUser)) {
        const user = JSON.parse(savedUser);
        redirectUser(user.role);
    }
}
// End Searches for saved token in user storage

// Start SignUp Interface
function manualSignUp(event) {
    event.preventDefault();

    const fullName = document.getElementById("full-name").value.trim();
    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value;
    const adminToggle = document.getElementById("admin-toggle");
    const termsCheckbox = document.getElementById("terms-agreement");

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

    setStorageToken("user", user);
    redirectUser(user.role);
}
// End SignUp Interface