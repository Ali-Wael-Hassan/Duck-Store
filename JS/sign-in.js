window.onload = () => {
    const loginForm = document.getElementById("login-form"); 
    const adminCheckbox = document.getElementById("admin-toggle");

    if (!loginForm) return;

    loginForm.addEventListener("submit", (event) => {
        if (!adminCheckbox || !adminCheckbox.checked) return;

        event.preventDefault(); 
        window.location.href = "dashboard.html"; 
    });
};