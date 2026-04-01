let resetForm = null;
let emailInput = null;
let submitButton = null;
let messageDiv = null;

function clearMessage() {
    if (messageDiv) {
        messageDiv.textContent = '';
        messageDiv.className = 'form-feedback';
    }
}

function setMessage(text, type) {
    if (!messageDiv) return;
    messageDiv.textContent = text;
    messageDiv.className = `form-feedback ${type}`;
    if (type === 'success') {
        setTimeout(() => {
            if (messageDiv.textContent === text) {
                messageDiv.textContent = '';
                messageDiv.className = 'form-feedback';
            }
        }, 5000);
    }
}

function isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email.trim());
}

function generateResetToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function storeResetToken(email, token) {
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    const resetData = { token, email, expires: expiry };
    localStorage.setItem('reset_token_data', JSON.stringify(resetData));
}

function clearAuthToken() {
    localStorage.removeItem('user');
    localStorage.removeItem('reset_token_data');
}

async function sendResetEmail(email, resetLink) {
    console.log(`📧 [MOCK] Password reset email to: ${email}`);
    console.log(`🔗 Reset link: ${resetLink}`);
    console.log(`⏱️  Link expires in 24 hours.`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { status: 200, message: 'OK' };
}

async function handleSubmit(event) {
    event.preventDefault();
    clearMessage();

    const rawEmail = emailInput.value;
    const email = rawEmail.trim();

    if (!email) {
        setMessage('Please enter your email address.', 'error');
        emailInput.focus();
        return;
    }

    if (!isValidEmail(email)) {
        setMessage('Enter a valid email address (e.g., name@archive.com).', 'error');
        emailInput.focus();
        return;
    }

    clearAuthToken();

    const originalText = submitButton.textContent;
    submitButton.classList.add('loading');
    submitButton.disabled = true;
    submitButton.textContent = 'SENDING...';

    try {
        const resetToken = generateResetToken();
        const resetLink = `${window.location.origin}/reset-password.html?token=${resetToken}`;

        storeResetToken(email, resetToken);

        await sendResetEmail(email, resetLink);

        setMessage(`✅ Password reset link sent to ${email}. Check your inbox — link expires in 24 hours.`, 'success');
        resetForm.reset();
        emailInput.value = '';
    } catch (err) {
        console.error('Reset error:', err);
        setMessage('⚠️ Unable to send reset link. Please try again later.', 'error');
    } finally {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

function initResetPage() {
    resetForm = document.getElementById('reset-form');
    emailInput = document.getElementById('email-address');
    submitButton = document.getElementById('reset-submit');
    messageDiv = document.getElementById('form-message');

    if (resetForm) {
        resetForm.addEventListener('submit', handleSubmit);
    }

    if (emailInput) {
        emailInput.addEventListener('input', () => {
            if (messageDiv && messageDiv.classList.contains('error')) {
                if (messageDiv.textContent.includes('valid') || messageDiv.textContent.includes('enter')) {
                    clearMessage();
                }
            }
        });
    }

    console.log('Password reset page initialized (dummy email)');
}

window.onload = () => {
    initResetPage();
};