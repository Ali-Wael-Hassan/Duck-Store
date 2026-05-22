document.querySelectorAll('.redeem-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        const rewardId = this.dataset.rewardId;
        const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
        const headers = {};
        if (csrfInput) headers['X-CSRFToken'] = csrfInput.value;

        const res = await fetch(`/api/rewards/${rewardId}/redeem/`, {
            method: 'POST',
            headers: headers,
        });
        const data = await res.json();
        if (data.success) {
            alert('Reward redeemed! Your new balance: ' + data.new_points + ' pts');
            location.reload();
        } else {
            alert(data.error || 'Could not redeem reward.');
        }
    });
});
