function getCSRFToken() {
    const input = document.querySelector('[name=csrfmiddlewaretoken]');
    return input ? input.value : '';
}

async function submitForm(form, btn, errDiv, btnText) {
    btn.disabled = true;
    btn.textContent = btnText + '...';
    errDiv.style.display = 'none';

    const formData = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, val] of formData.entries()) {
        params.append(key, val);
    }

    try {
        const resp = await fetch(form.action, {
            method: 'POST',
            headers: {'X-CSRFToken': getCSRFToken()},
            body: params,
        });
        const data = await resp.json();
        if (data.success) {
            localStorage.setItem('jwt_token', data.token);
            window.location.href = data.redirect;
        } else {
            const msgs = Object.values(data.errors || {}).flat().join(', ');
            errDiv.textContent = msgs || 'Please fix the errors above.';
            errDiv.style.display = 'block';
            btn.disabled = false;
            btn.textContent = btnText;
        }
    } catch (e) {
        console.error('Auth error:', e);
        errDiv.textContent = 'Connection error. Please try again.';
        errDiv.style.display = 'block';
        btn.disabled = false;
        btn.textContent = btnText;
    }
}

document.getElementById('login-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    submitForm(this, document.getElementById('login-btn'), document.getElementById('login-error'), 'Sign Into Library');
});

document.getElementById('signup-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    submitForm(this, document.getElementById('signup-btn'), document.getElementById('signup-error'), 'Create Account');
});
