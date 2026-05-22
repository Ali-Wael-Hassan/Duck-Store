document.getElementById('avatar-upload')?.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);
    const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfInput) formData.append('csrfmiddlewaretoken', csrfInput.value);

    const url = this.dataset.uploadUrl;
    if (!url) return;

    fetch(url, {
        method: 'POST',
        body: formData,
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            document.getElementById('user-avatar').src = data.avatar_url;
        } else {
            alert(data.error || 'Upload failed');
        }
    })
    .catch(() => alert('Upload failed'));
});
