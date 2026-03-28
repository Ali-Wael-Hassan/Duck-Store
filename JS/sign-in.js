window.onload = () => {

    google.accounts.id.initialize({
        client_id: "YOUR_CLIENT_ID",
        callback: handleCredentialResponse
    });

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
    google.accounts.id.prompt();
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